/**
 * 检测任务模型：localStorage 持久化 + 本地定时器模拟后台并行质检。
 * 刷新/离开页面任务继续，按时间轴推导状态。
 */
import { ItemCode, ITEM_DEFS, ScenarioKey, getOutcome, ItemOutcome } from './scenarios';

export type TaskStatus =
  | 'pending' // 待采集
  | 'collecting' // 采集中
  | 'collect-failed' // 采集失败
  | 'checking' // 质检中
  | 'done' // 检测完成
  | 'partial-fail' // 部分失败
  | 'canceled'; // 已取消

export type ItemStatus = 'queued' | 'running' | 'pass' | 'violation' | 'suspect' | 'manual' | 'fail';

export interface ItemOverride {
  feedback?: 'up' | 'down' | null;
  feedbackReasons?: string[];
  feedbackText?: string;
  retryAt?: number;
}

export interface Task {
  id: string;
  url: string;
  productId: string;
  title: string;
  image: string; // ImageKey
  category: string;
  priceRange: string;
  skuCount: number;
  collectedAt?: number;
  submitTime: number;
  scenario: ScenarioKey;
  collectFailedReason?: string;
  collectRetryAt?: number;
  canceledAt?: number;
  overrides: Partial<Record<ItemCode, ItemOverride>>;
}

export interface ItemView {
  code: ItemCode;
  name: string;
  group: string;
  target: string;
  status: ItemStatus;
  outcome?: ItemOutcome;
  override?: ItemOverride;
}

export interface TaskView {
  task: Task;
  status: TaskStatus;
  items: ItemView[];
  progress: { done: number; total: number };
  summary: { hit: number; pass: number; suspect: number; fail: number };
  conclusion: { level: 'checking' | 'pass' | 'reject' | 'manual' | 'partial' | 'failed' | 'canceled'; text: string; hitCount: number };
}

const STORAGE_KEY = 'dcc-tasks-v1';

const COLLECT_MS = 2800;
const RETRY_COLLECT_MS = 2000;
const ITEM_RETRY_MS = 4000;
// 每个质检项相对采集完成时间的 [起始偏移ms, 持续ms]
const ITEM_PLAN: Record<ItemCode, [number, number]> = {
  material: [500, 5000],
  size: [1500, 8000],
  ipr: [2500, 9000],
  category: [3500, 4500],
  price: [4500, 10000],
  legal: [5500, 7000],
};

export const TASK_STATUS_TEXT: Record<TaskStatus, string> = {
  pending: '待采集',
  collecting: '采集中',
  'collect-failed': '采集失败',
  checking: '质检中',
  done: '检测完成',
  'partial-fail': '部分失败',
  canceled: '已取消',
};

export const ITEM_STATUS_TEXT: Record<ItemStatus, string> = {
  queued: '排队中',
  running: '检测中',
  pass: '通过',
  violation: '违规',
  suspect: '疑似错误',
  manual: '建议人工',
  fail: '检测失败',
};

let idSeq = 0;
function nextId(): string {
  idSeq += 1;
  return `t-${Date.now().toString(36)}-${idSeq}`;
}

export function validateDhgateUrl(raw: string): { ok: boolean; error?: string; productId?: string } {
  const value = raw.trim();
  if (!value) return { ok: false, error: '请输入敦煌网商品链接' };
  let url: URL;
  try {
    url = new URL(value.startsWith('http') ? value : `https://${value}`);
  } catch {
    return { ok: false, error: '链接格式不正确，请粘贴完整商品链接' };
  }
  const host = url.hostname.toLowerCase();
  if (!/(^|\.)dhgate\.com$/i.test(host)) {
    return { ok: false, error: '仅支持敦煌网商品链接' };
  }
  if (/draft|invalid|deleted/i.test(url.pathname)) {
    return { ok: false, error: '该商品无法检测，请确认链接为有效商品' };
  }
  if (!/\/product/i.test(url.pathname)) {
    return { ok: false, error: '仅支持敦煌网商品详情链接，请确认链接指向具体商品' };
  }
  const match = url.pathname.match(/(\d{6,})/);
  if (!match) {
    return { ok: false, error: '仅支持敦煌网商品详情链接，请确认链接指向具体商品' };
  }
  return { ok: true, productId: match[1] };
}

export function computeTaskView(task: Task, now: number): TaskView {
  if (task.canceledAt) {
    return buildView(task, 'canceled', [], now);
  }
  if (task.collectFailedReason && !task.collectRetryAt) {
    return buildView(task, 'collect-failed', [], now);
  }
  const base = task.collectRetryAt ?? task.submitTime;
  const collectMs = task.collectRetryAt ? RETRY_COLLECT_MS : COLLECT_MS;
  if (now < base + collectMs) {
    const items: ItemView[] = ITEM_DEFS.map((def) => ({
      code: def.code,
      name: def.name,
      group: def.group,
      target: def.target,
      status: 'queued' as ItemStatus,
      outcome: undefined,
      override: task.overrides[def.code],
    }));
    return buildView(task, now < base + 400 ? 'pending' : 'collecting', items, now);
  }

  const checkStart = base + collectMs;
  let allTerminal = true;
  let anyFail = false;
  const items: ItemView[] = ITEM_DEFS.map((def) => {
    const [offset, duration] = ITEM_PLAN[def.code];
    const startAt = checkStart + offset;
    const endAt = startAt + duration;
    const override = task.overrides[def.code];
    let status: ItemStatus;
    let outcome: ItemOutcome | undefined;

    if (override?.retryAt) {
      const retryEnd = override.retryAt + ITEM_RETRY_MS;
      if (now < retryEnd) {
        status = 'running';
        allTerminal = false;
      } else {
        outcome = getOutcome(task.scenario, def.code, true);
        status = outcome.status;
      }
    } else if (now < startAt) {
      status = 'queued';
      allTerminal = false;
    } else if (now < endAt) {
      status = 'running';
      allTerminal = false;
    } else {
      outcome = getOutcome(task.scenario, def.code);
      status = outcome.status;
    }
    if (status === 'fail') anyFail = true;
    return { code: def.code, name: def.name, group: def.group, target: def.target, status, outcome, override };
  });

  const status: TaskStatus = allTerminal ? (anyFail ? 'partial-fail' : 'done') : 'checking';
  return buildView(task, status, items, now);
}

function buildView(task: Task, status: TaskStatus, items: ItemView[], now: number): TaskView {
  const total = ITEM_DEFS.length;
  const done = items.filter((item) => !['queued', 'running'].includes(item.status)).length;
  const hit = items.filter((item) => item.status === 'violation').length;
  const pass = items.filter((item) => item.status === 'pass').length;
  const suspect = items.filter((item) => item.status === 'suspect' || item.status === 'manual').length;
  const fail = items.filter((item) => item.status === 'fail').length;

  let conclusion: TaskView['conclusion'];
  if (status === 'canceled') conclusion = { level: 'canceled', text: '任务已取消', hitCount: 0 };
  else if (status === 'collect-failed') conclusion = { level: 'failed', text: `采集失败：${task.collectFailedReason ?? '未知原因'}`, hitCount: 0 };
  else if (status === 'pending' || status === 'collecting') conclusion = { level: 'checking', text: status === 'collecting' ? '正在采集商品信息…' : '任务排队中，等待采集…', hitCount: 0 };
  else if (status === 'checking') conclusion = { level: 'checking', text: `质检进行中，已完成 ${done}/${total} 项，各质检项独立并行执行`, hitCount: hit };
  else if (hit > 0) conclusion = { level: 'reject', text: hit > 1 ? `不通过：商品存在 ${hit} 处违规，请逐项处理` : '不通过：商品存在违规项', hitCount: hit };
  else if (suspect > 0) conclusion = { level: 'manual', text: '建议人工审核：存在疑似错误项', hitCount: 0 };
  else if (fail > 0) conclusion = { level: 'partial', text: '部分质检项失败，请查看详情并重试', hitCount: 0 };
  else conclusion = { level: 'pass', text: '通过：全部质检项未命中违规', hitCount: 0 };

  return { task, status, items, progress: { done, total }, summary: { hit, pass, suspect, fail }, conclusion };
}

/* ---------------- 持久化 ---------------- */

function seedTasks(now: number): Task[] {
  const hour = 3600_000;
  const base = (id: string, url: string, productId: string, title: string, image: string, category: string, priceRange: string, skuCount: number, submitTime: number, scenario: ScenarioKey): Task => ({
    id, url, productId, title, image, category, priceRange, skuCount, submitTime, scenario,
    collectedAt: submitTime + COLLECT_MS,
    overrides: {},
  });
  return [
    base('t-seed-live', 'https://www.dhgate.com/product/mens-slim-fit-wedding-suit/942718556.html', '942718556',
      "Men's Slim Fit Wedding Suit Jacket Two Piece Formal Business Office Suits For Men",
      'suit', '服装 > 男装 > 男士外套', '$10 - $99', 12, now - 9000, 'default'),
    base('t-seed-suit', 'https://www.dhgate.com/product/mens-slim-fit-wedding-suit/942718556.html', '942718556',
      "Men's Slim Fit Wedding Suit Jacket Two Piece Formal Business Office Suits For Men",
      'suit', '服装 > 男装 > 男士外套', '$10 - $99', 12, now - 26 * hour, 'default'),
    base('t-seed-bag', 'https://www.dhgate.com/product/quilted-chain-bucket-bag/887654321.html', '887654321',
      'Vintage Quilted Chain Bucket Bag Women Large Capacity Shoulder Purse',
      'bag', '箱包及箱包辅料 > 时装包 > 单肩包', '$18 - $45', 6, now - 21 * hour, 'all-pass'),
    base('t-seed-tee', 'https://www.dhgate.com/product/classic-streetwear-cotton-tee/771203994.html', '771203994',
      'Premium Cotton Tee Streetwear Vintage Print Short Sleeve Shirt',
      'tee', '服装 > 男装 > T 恤', '$6 - $12', 8, now - 9 * hour, 'tee-ipr'),
    {
      ...base('t-seed-shoe', 'https://www.dhgate.com/product/casual-low-top-sneaker/665091832.html', '665091832',
        'Unisex Casual Low Top Sneaker Lightweight Walking Shoes',
        'sneaker', '鞋 > 运动户外 > 休闲运动鞋', '$9 - $89', 10, now - 7 * hour, 'sneaker-partial'),
    },
    base('t-seed-dress', 'https://www.dhgate.com/product/floral-summer-dress/552390177.html', '552390177',
      'Women Floral Print Summer Dress Casual Beach Midi Dress',
      'dress', '服装 > 女装 > 半身裙', '$14 - $16', 4, now - 5 * hour, 'dress'),
    {
      ...base('t-seed-draft', 'https://www.dhgate.com/product/draft-womens-sneakers/440012345.html', '440012345',
        '（草稿）Womens Retro Sneakers', 'sneaker', '鞋 > 运动户外 > 休闲运动鞋', '-', 0, now - 3 * hour, 'all-pass'),
      collectFailedReason: '该商品为草稿或无效商品，无法采集',
    },
    {
      ...base('t-seed-timeout', 'https://www.dhgate.com/product/floral-summer-dress/551100222.html', '551100222',
        'Summer Floral Dress (采集超时商品)', 'dress', '服装 > 女装 > 连衣裙', '-', 0, now - 1 * hour, 'all-pass'),
      collectFailedReason: '敦煌接口响应超时，采集失败，可重试',
    },
  ];
}

let cache: Task[] | null = null;

export function loadTasks(): Task[] {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      cache = JSON.parse(raw) as Task[];
      return cache;
    }
  } catch {
    /* 数据损坏时重建 */
  }
  cache = seedTasks(Date.now());
  persist();
  return cache;
}

function persist() {
  if (cache) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
    } catch {
      /* 演示环境忽略写入失败 */
    }
  }
}

export function getTask(id: string): Task | undefined {
  return loadTasks().find((task) => task.id === id);
}

export function mutateTask(id: string, mutate: (task: Task) => void) {
  const task = getTask(id);
  if (!task) return;
  mutate(task);
  persist();
}

export function createTask(url: string, productId: string): Task {
  const task: Task = {
    id: nextId(),
    url,
    productId,
    title: "Men's Slim Fit Wedding Suit Jacket Two Piece Formal Business Office Suits For Men",
    image: 'suit',
    category: '服装 > 男装 > 男士外套',
    priceRange: '$10 - $99',
    skuCount: 12,
    submitTime: Date.now(),
    scenario: 'default',
    overrides: {},
  };
  loadTasks().unshift(task);
  persist();
  return task;
}

export function recheckTask(sourceId: string): Task | undefined {
  const source = getTask(sourceId);
  if (!source) return undefined;
  const copy: Task = { ...source, id: nextId(), submitTime: Date.now(), canceledAt: undefined, collectFailedReason: undefined, collectRetryAt: undefined, overrides: {} };
  loadTasks().unshift(copy);
  persist();
  return copy;
}

export function cancelTask(id: string) {
  mutateTask(id, (task) => {
    task.canceledAt = Date.now();
  });
}

export function retryCollect(id: string) {
  mutateTask(id, (task) => {
    task.collectRetryAt = Date.now();
  });
}

export function retryItem(id: string, code: ItemCode) {
  mutateTask(id, (task) => {
    task.overrides[code] = { ...task.overrides[code], retryAt: Date.now() };
  });
}

export function setFeedback(id: string, code: ItemCode, feedback: 'up' | 'down' | null, reasons?: string[], text?: string) {
  mutateTask(id, (task) => {
    task.overrides[code] = { ...task.overrides[code], feedback, feedbackReasons: reasons, feedbackText: text };
  });
}

export function findActiveTaskByUrl(url: string, now: number): Task | undefined {
  return loadTasks().find((task) => {
    if (task.url.trim() !== url.trim()) return false;
    const view = computeTaskView(task, now);
    return ['pending', 'collecting', 'checking'].includes(view.status);
  });
}
