/**
 * 检测任务模型：localStorage 持久化 + 本地定时器模拟后台并行质检。
 * 刷新/离开页面任务继续，按时间轴推导状态。
 */
import { ItemCode, ITEM_DEFS, ScenarioKey, getOutcome, ItemOutcome, PASS } from './scenarios';

export type TaskStatus =
  | 'pending' // 待采集
  | 'collecting' // 采集中
  | 'collect-failed' // 采集失败
  | 'checking' // 质检中
  | 'done' // 检测完成
  | 'partial-fail' // 部分失败
  | 'canceled'; // 已取消

export type ItemStatus = 'queued' | 'running' | 'pass' | 'violation' | 'suspect' | 'manual' | 'fail';

/** 反馈按检测结果项记录：一次检测可能产出多条违规/疑似，每条单独反馈 */
export interface ResultFeedback {
  mode: 'up' | 'down';
  reasons?: string[];
  text?: string;
}

/** 已完成的一轮检测：单项重新检测后，上一轮结果归档为历史 */
export interface ItemAttempt {
  /** 这一轮检测完成的时间 */
  at: number;
  status: ItemStatus;
  outcome?: ItemOutcome;
}

export interface ItemOverride {
  /** key = `${ItemCode}:${结果序号}`，与 issues.ts 的 issue.key 一致 */
  resultFeedback?: Record<string, ResultFeedback>;
  retryAt?: number;
  /** 历史检测记录，按时间从早到晚；当前这一轮不在这里 */
  attempts?: ItemAttempt[];
}

const TERMINAL_ITEM_STATUS: ItemStatus[] = ['pass', 'violation', 'suspect', 'manual', 'fail'];

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
  checkRetryAt?: number;
  canceledAt?: number;
  stuckChecking?: boolean;
  /** 由场景演示记录复制出来的记录，详情页同样支持场景切换 */
  demoTemplate?: boolean;
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
  /** 按问题条目统计（商品视图与结论条口径），与按检测项的 summary 区分 */
  issueSummary: { violation: number; suspect: number; fail: number };
  involvedItems: number;
  conclusion: { level: 'checking' | 'pass' | 'reject' | 'manual' | 'partial' | 'failed' | 'canceled'; text: string; hitCount: number };
}

const STORAGE_KEY = 'dcc-tasks-v1';

// 旧版临时检测任务：已不再创建，仅用于兼容本地残留数据并从列表中排除
export const SESSION_TASK_ID = 't-check-session';

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
  manual: '建议自查',
  fail: '检测失败',
};

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

export function isDhgateItemCode(raw: string): boolean {
  return /^\d{6,}$/.test(raw.trim());
}

export function buildDhgateUrlFromItemCode(itemCode: string): string {
  return `https://www.dhgate.com/product/item/${itemCode.trim()}.html`;
}

/** 输入既可以是商品链接，也可以是纯 itemCode（自动补全为商品详情链接） */
export function resolveDhgateInput(raw: string): { ok: boolean; error?: string; productId?: string; url?: string } {
  const value = raw.trim();
  if (!value) return { ok: false, error: '请输入敦煌网商品链接或商品 itemCode' };
  if (/^\d+$/.test(value)) {
    if (value.length < 6) return { ok: false, error: 'itemCode 应为 6 位以上数字，请确认后重试' };
    return { ok: true, productId: value, url: buildDhgateUrlFromItemCode(value) };
  }
  const result = validateDhgateUrl(value);
  return { ...result, url: result.ok ? value : undefined };
}

// 演示用「永远检测中」任务：这两项固定在检测中，任务不会进入完成态
const STUCK_RUNNING: ItemCode[] = ['price', 'legal'];

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

  const checkStart = Math.max(base + collectMs, task.checkRetryAt ?? 0);
  let allTerminal = true;
  let anyFail = false;
  const items: ItemView[] = ITEM_DEFS.map((def) => {
    const [offset, duration] = ITEM_PLAN[def.code];
    const startAt = checkStart + offset;
    const endAt = startAt + duration;
    const override = task.overrides[def.code];
    let status: ItemStatus;
    let outcome: ItemOutcome | undefined;

    if (task.stuckChecking && STUCK_RUNNING.includes(def.code)) {
      status = 'running';
      allTerminal = false;
    } else if (override?.retryAt) {
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

  // 问题条目口径：一张图违反多项时按条计数，与商品视图的标记数保持一致
  const issueSummary = { violation: 0, suspect: 0, fail: 0 };
  const involved = new Set<ItemCode>();
  items.forEach((item) => {
    const outcome = item.outcome;
    if (!outcome) return;
    if (outcome.hits && outcome.hits.length > 0) {
      outcome.hits.forEach((record) => {
        const severity = record.severity ?? (item.status === 'violation' ? 'violation' : 'suspect');
        issueSummary[severity] += 1;
        involved.add(item.code);
      });
      return;
    }
    if (item.status === 'violation') {
      issueSummary.violation += 1;
      involved.add(item.code);
    } else if (item.status === 'suspect' || item.status === 'manual') {
      issueSummary.suspect += 1;
      involved.add(item.code);
    } else if (item.status === 'fail') {
      issueSummary.fail += 1;
      involved.add(item.code);
    }
  });

  let conclusion: TaskView['conclusion'];
  if (status === 'canceled') conclusion = { level: 'canceled', text: '任务已取消', hitCount: 0 };
  else if (status === 'collect-failed') conclusion = { level: 'failed', text: `采集失败：${task.collectFailedReason ?? '未知原因'}`, hitCount: 0 };
  else if (status === 'pending' || status === 'collecting') conclusion = { level: 'checking', text: status === 'collecting' ? '正在采集商品信息…' : '任务排队中，等待采集…', hitCount: 0 };
  else if (status === 'checking') conclusion = { level: 'checking', text: `质检进行中，已完成 ${done}/${total} 项，各质检项独立并行执行`, hitCount: issueSummary.violation };
  else if (issueSummary.violation > 0) conclusion = { level: 'reject', text: `不通过：${issueSummary.violation} 处违规，涉及 ${involved.size} 个检测项`, hitCount: issueSummary.violation };
  else if (issueSummary.suspect > 0) conclusion = { level: 'manual', text: `建议人工审核：存在 ${issueSummary.suspect} 处待确认`, hitCount: 0 };
  else if (issueSummary.fail > 0) conclusion = { level: 'partial', text: '部分质检项失败，请查看详情并重试', hitCount: 0 };
  else conclusion = { level: 'pass', text: '通过：全部质检项均未发现违规', hitCount: 0 };

  return { task, status, items, progress: { done, total }, summary: { hit, pass, suspect, fail }, issueSummary, involvedItems: involved.size, conclusion };
}

/* ---------------- 持久化 ---------------- */

const DEMO_SUIT_TITLE =
  "Men's Slim Fit Wedding Suit Jacket Two Piece Formal Business Office Suits For Men With Notch Lapel Button Down Coat And Pants Set For Winter Banquet";

// 商品标题按敦煌真实标题长度写满两行以上，用于演示列表里的两行截断
const SEED_TITLES: Record<string, string> = {
  't-seed-suit': DEMO_SUIT_TITLE,
  't-seed-bag': 'Vintage Quilted Chain Bucket Bag Women Large Capacity Shoulder Purse With Drawstring Top Handle Tote Handbag For Daily Travel Commute',
  't-seed-shoe': 'Unisex Casual Low Top Sneaker Lightweight Walking Shoes Breathable Mesh Running Trainers Non Slip Lace Up Court Shoes For Men Women',
  't-seed-timeout': 'Summer Floral Dress (采集超时商品)',
  't-seed-stuck': 'Handmade Woven Raffia Crossbody Bag With Beaded Trim Adjustable Strap Boho Beach Tote For Women Travel Daily Summer Vacation',
};

// 箱包模板记录预置一条材质检测历史：上一次检测通过，用于演示同一检测项的多次检测记录
function seedBagHistory(submitTime: number): Partial<Record<ItemCode, ItemOverride>> {
  return {
    material: {
      attempts: [
        {
          at: submitTime - 3 * 3600_000,
          status: 'pass',
          outcome: PASS.material,
        },
      ],
    },
  };
}

// 演示记录按结果场景去重：通过 / 违规 / 部分失败 / 检测中 / 采集失败 各保留一条
function seedTasks(now: number): Task[] {
  const hour = 3600_000;
  const base = (id: string, url: string, productId: string, image: string, category: string, priceRange: string, skuCount: number, submitTime: number, scenario: ScenarioKey): Task => ({
    id, url, productId, title: SEED_TITLES[id], image, category, priceRange, skuCount, submitTime, scenario,
    collectedAt: submitTime + COLLECT_MS,
    overrides: {},
  });
  return [
    {
      ...base('t-seed-timeout', 'https://www.dhgate.com/product/floral-summer-dress/551100222.html', '551100222',
        'dress', '服装 > 女装 > 连衣裙', '-', 0, now - 1 * hour, 'all-pass'),
      collectFailedReason: '敦煌接口响应超时，采集失败，可重试',
    },
    stuckTask(now),
    base('t-seed-shoe', 'https://www.dhgate.com/product/casual-low-top-sneaker/665091832.html', '665091832',
      'sneaker', '鞋 > 运动户外 > 休闲运动鞋', '$9 - $89', 10, now - 7 * hour, 'sneaker-partial'),
    {
      ...base('t-seed-bag', 'https://www.dhgate.com/product/quilted-chain-bucket-bag/887654321.html', '887654321',
        'bag', '箱包及箱包辅料 > 时装包 > 单肩包', '$18 - $45', 6, now - 12 * 60_000, 'all-pass'),
      overrides: seedBagHistory(now - 12 * 60_000),
    },
    base('t-seed-suit', 'https://www.dhgate.com/product/mens-slim-fit-wedding-suit/942718556.html', '942718556',
      'suit', '服装 > 男装 > 男士外套', '$10 - $99', 12, now - 26 * hour, 'default'),
  ];
}

// 「永远检测中」示例任务：价格与违法违规两项持续处于检测中，任务不会走到完成态
function stuckTask(now: number): Task {
  const submitTime = now - 2 * 3600_000;
  return {
    id: 't-seed-stuck',
    url: 'https://www.dhgate.com/product/woven-raffia-crossbody-bag/338774612.html',
    productId: '338774612',
    title: SEED_TITLES['t-seed-stuck'],
    image: 'bag',
    category: '箱包及箱包辅料 > 时装包 > 编织包',
    priceRange: '$12 - $26',
    skuCount: 5,
    submitTime,
    collectedAt: submitTime + COLLECT_MS,
    scenario: 'all-pass',
    stuckChecking: true,
    overrides: {},
  };
}

let cache: Task[] | null = null;

export function loadTasks(): Task[] {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      cache = JSON.parse(raw) as Task[];
      migrateCuratedRecords(cache);
      migrateSeedTitles(cache);
      migrateSeedOrder(cache);
      migrateSeedItemHistory(cache);
      return cache;
    }
  } catch {
    /* 数据损坏时重建 */
  }
  cache = seedTasks(Date.now());
  persist();
  return cache;
}

const CURATED_SEED_IDS = ['t-seed-timeout', 't-seed-stuck', 't-seed-shoe', 't-seed-bag', 't-seed-suit'];
const CURATED_FLAG_KEY = 'dcc-records-curated-v1';

// 一次性整理：清掉旧版重复种子和此前提交留下的记录，补齐缺的示例；之后不再改动已有数据
function migrateCuratedRecords(tasks: Task[]) {
  if (localStorage.getItem(CURATED_FLAG_KEY) === '1') return;
  const kept = tasks.filter((task) => CURATED_SEED_IDS.includes(task.id) || task.id === SESSION_TASK_ID);
  const missing = seedTasks(Date.now()).filter((seed) => !kept.some((task) => task.id === seed.id));
  tasks.splice(0, tasks.length, ...kept, ...missing);
  localStorage.setItem(CURATED_FLAG_KEY, '1');
  persist();
}

// 旧版演示数据的标题不足两行；按种子清单刷新为超长标题，保证两行截断效果可复现
const LEGACY_TITLE_UPGRADE: Record<string, string> = {
  "Men's Slim Fit Wedding Suit Jacket Two Piece Formal Business Office Suits For Men": DEMO_SUIT_TITLE,
  'Vintage Quilted Chain Bucket Bag Women Large Capacity Shoulder Purse': SEED_TITLES['t-seed-bag'],
  'Unisex Casual Low Top Sneaker Lightweight Walking Shoes': SEED_TITLES['t-seed-shoe'],
};

function migrateSeedTitles(tasks: Task[]) {
  let changed = false;
  tasks.forEach((task) => {
    const seedTitle = SEED_TITLES[task.id];
    if (seedTitle && task.title !== seedTitle) {
      task.title = seedTitle;
      changed = true;
    } else if (LEGACY_TITLE_UPGRADE[task.title]) {
      task.title = LEGACY_TITLE_UPGRADE[task.title];
      changed = true;
    }
  });
  if (changed) persist();
}

// 演示场景集中在箱包记录上，一次性把它挪到列表第一条
const SEED_ORDER_FLAG_KEY = 'dcc-seed-order-v2';

function migrateSeedOrder(tasks: Task[]) {
  if (localStorage.getItem(SEED_ORDER_FLAG_KEY) === '1') return;
  const bag = tasks.find((task) => task.id === 't-seed-bag');
  if (bag) {
    const newestOther = tasks.reduce((max, task) => (task.id === bag.id ? max : Math.max(max, task.submitTime)), 0);
    if (bag.submitTime <= newestOther) {
      bag.submitTime = Date.now() - 12 * 60_000;
      bag.collectedAt = bag.submitTime + COLLECT_MS;
    }
  }
  localStorage.setItem(SEED_ORDER_FLAG_KEY, '1');
  persist();
}

// 已存在的本地数据补上箱包记录的材质检测历史，只补一次，之后按用户操作累积
const SEED_HISTORY_FLAG_KEY = 'dcc-seed-item-history-v1';

function migrateSeedItemHistory(tasks: Task[]) {
  if (localStorage.getItem(SEED_HISTORY_FLAG_KEY) === '1') return;
  const bag = tasks.find((task) => task.id === 't-seed-bag');
  if (bag && !bag.overrides.material?.attempts?.length) {
    bag.overrides = { ...bag.overrides, ...seedBagHistory(bag.submitTime) };
  }
  localStorage.setItem(SEED_HISTORY_FLAG_KEY, '1');
  persist();
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

// 同一商品（链接或 itemCode 相同）已有检测记录时直接复用，不再新增记录
export function findRecordByInput(url: string, productId: string): Task | undefined {
  return loadTasks().find((task) => task.id !== SESSION_TASK_ID && (task.url === url || task.productId === productId));
}

// 重新采集并检测（重新检测弹窗方式二）：基于同一商品创建一条新记录，原记录保留不变
export function recheckAsNewRecord(id: string, demoTemplate = false): string | undefined {
  const source = getTask(id);
  if (!source) return undefined;
  const now = Date.now();
  const task: Task = {
    id: `t-${now.toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    url: source.url,
    productId: source.productId,
    title: source.title,
    image: source.image,
    category: source.category,
    priceRange: source.priceRange,
    skuCount: source.skuCount,
    submitTime: now,
    collectedAt: now + COLLECT_MS,
    scenario: source.scenario,
    ...(demoTemplate ? { demoTemplate: true } : {}),
    overrides: {},
  };
  loadTasks().push(task);
  persist();
  return task.id;
}

// 同一商品再次发起检测：在这条记录上重走采集 + 质检过程，不新增记录
export function restartCheckOnRecord(id: string) {
  mutateTask(id, (task) => {
    const now = Date.now();
    task.submitTime = now;
    task.collectRetryAt = now;
    task.collectedAt = now + RETRY_COLLECT_MS;
    task.collectFailedReason = undefined;
    delete task.checkRetryAt;
    delete task.canceledAt;
    Object.values(task.overrides).forEach((override) => {
      if (override) override.retryAt = undefined;
    });
  });
}

// 就地重新检测：沿用已采集的商品信息，在当前记录上重新执行全部质检项
export function recheckInPlace(id: string) {
  mutateTask(id, (task) => {
    task.checkRetryAt = Date.now();
    Object.values(task.overrides).forEach((override) => {
      if (override) override.retryAt = undefined;
    });
  });
}

export function retryCollect(id: string) {
  mutateTask(id, (task) => {
    task.collectRetryAt = Date.now();
    task.collectedAt = task.collectRetryAt + RETRY_COLLECT_MS;
    task.collectFailedReason = undefined;
    Object.values(task.overrides).forEach((override) => {
      if (override) override.retryAt = undefined;
    });
  });
}

export function retryItem(id: string, code: ItemCode, archive?: ItemAttempt) {
  mutateTask(id, (task) => {
    const current = { ...task.overrides[code] };
    if (archive && TERMINAL_ITEM_STATUS.includes(archive.status)) {
      current.attempts = [...(current.attempts ?? []), archive];
    }
    current.retryAt = Date.now();
    task.overrides[code] = current;
  });
}

/** 该检测项当前这一轮的完成时间：首检按计划时间，单项重检按重检开始时间 + 重检时长 */
export function itemFinishedAt(task: Task, code: ItemCode): number {
  const base = task.collectRetryAt ?? task.submitTime;
  const collectMs = task.collectRetryAt ? RETRY_COLLECT_MS : COLLECT_MS;
  const checkStart = Math.max(base + collectMs, task.checkRetryAt ?? 0);
  const [offset, duration] = ITEM_PLAN[code];
  const retryAt = task.overrides[code]?.retryAt;
  return retryAt ? retryAt + ITEM_RETRY_MS : checkStart + offset + duration;
}

export function setFeedback(
  id: string,
  code: ItemCode,
  resultKey: string,
  feedback: 'up' | 'down' | null,
  reasons?: string[],
  text?: string,
) {
  mutateTask(id, (task) => {
    const current = { ...task.overrides[code] };
    const map = { ...(current.resultFeedback ?? {}) };
    if (feedback) map[resultKey] = { mode: feedback, reasons, text };
    else delete map[resultKey];
    current.resultFeedback = map;
    task.overrides[code] = current;
  });
}

