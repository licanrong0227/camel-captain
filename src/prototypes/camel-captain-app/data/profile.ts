export const PROFILE = {
  name: '李灿荣',
  username: 'licanrong@ygq123456',
  nickname: '李灿荣',
  phone: '18575595171',
  email: '906069595@qq.com',
  dept: '暂无',
  role: '暂无',
  createdAt: '2026-09-28 15:32:29',
  member: '至尊会员',
  memberExpire: '2027-10-22 23:59:59',
  memberId: 'LT10035',
  vip: 'VIP3',
  inviteCode: 'L0TS0C',
  compute: 2188,
  points: 20,
};

export const PROFILE_FIELDS = [
  { label: '用户名称', value: PROFILE.username },
  { label: '用户昵称', value: PROFILE.nickname },
  { label: '手机号码', value: PROFILE.phone },
  { label: '用户邮箱', value: PROFILE.email },
  { label: '所属部门', value: PROFILE.dept },
  { label: '所属角色', value: PROFILE.role },
  { label: '创建日期', value: PROFILE.createdAt },
];

export const COMPUTE_STATS = [
  { label: '可用算力', value: 2188 },
  { label: '冻结算力', value: 0 },
  { label: '累计充值算力', value: 2251 },
  { label: '累计消费算力', value: 63 },
];

export type ComputeLog = {
  id: string;
  time: string;
  account: string;
  type: '充值' | '消费' | '退款' | '调整';
  change: number;
  before: number;
  after: number;
  remark: string;
};

export const COMPUTE_LOGS: ComputeLog[] = [
  { id: 'cl-10', time: '2026-11-05 14:32:22', account: 'ygq123456', type: '消费', change: -1, before: 2189, after: 2188, remark: '图片去水印Pro消费' },
  { id: 'cl-9', time: '2026-11-05 14:32:05', account: 'ygq123456', type: '消费', change: -1, before: 2190, after: 2189, remark: '图片去水印Pro消费' },
  { id: 'cl-8', time: '2026-11-05 14:31:19', account: 'ygq123456', type: '消费', change: -3, before: 2193, after: 2190, remark: '图片去水印消费' },
  { id: 'cl-7', time: '2026-11-05 14:31:16', account: 'ygq123456', type: '消费', change: -3, before: 2196, after: 2193, remark: '图片去水印消费' },
  { id: 'cl-6', time: '2026-11-04 16:11:27', account: 'licanrong@ygq123456', type: '消费', change: -3, before: 2199, after: 2196, remark: '图片去水印消费' },
  { id: 'cl-5', time: '2026-11-04 15:20:50', account: 'licanrong@ygq123456', type: '消费', change: -1, before: 2200, after: 2199, remark: '转白底图消费' },
  { id: 'cl-4', time: '2026-11-04 15:08:34', account: 'licanrong@ygq123456', type: '消费', change: -1, before: 2201, after: 2200, remark: '图片去水印Pro消费' },
  { id: 'cl-3', time: '2026-11-04 15:07:56', account: 'licanrong@ygq123456', type: '消费', change: -1, before: 2202, after: 2201, remark: '图片去水印Pro消费' },
  { id: 'cl-2', time: '2026-10-22 17:49:19', account: 'ygq123456', type: '充值', change: 1000, before: 1202, after: 2202, remark: '会员订单20261022L0TS0C002发放算力权益1000.00' },
  { id: 'cl-1', time: '2026-10-17 15:59:56', account: 'ygq123456', type: '消费', change: -3, before: 1205, after: 1202, remark: '图片去水印消费' },
];

export const COMPUTE_TYPES = ['充值', '消费', '退款', '调整'];

export const COMPUTE_PRICING = [
  { name: '去水印Pro', cost: '1', note: '无' },
  { name: '消除笔', cost: '2', note: '消除后撤销不扣算力点' },
  { name: '去水印', cost: '3', note: '无' },
  { name: '转白底', cost: '1', note: '无' },
  { name: 'AI短描生成', cost: '1', note: '无' },
  { name: 'AI关键词生成', cost: '0.5', note: '无' },
  { name: 'AI标题生成', cost: '1', note: '无' },
  { name: '抠图', cost: '1', note: '无' },
];

const AUTH_KEY = 'cc-app:auth';

export type AuthState = { account: string; loginAt: string } | null;

export function readAuth(): AuthState {
  try {
    const raw = window.sessionStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { account?: unknown; loginAt?: unknown };
    if (typeof parsed.account !== 'string' || typeof parsed.loginAt !== 'string') return null;
    return { account: parsed.account, loginAt: parsed.loginAt };
  } catch {
    return null;
  }
}

export function writeAuth(account: string) {
  try {
    window.sessionStorage.setItem(AUTH_KEY, JSON.stringify({ account, loginAt: new Date().toISOString() }));
  } catch {
    // sessionStorage may be unavailable in sandboxed previews
  }
}

export function clearAuth() {
  try {
    window.sessionStorage.removeItem(AUTH_KEY);
  } catch {
    // ignore
  }
}
