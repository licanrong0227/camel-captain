export interface AccountDevice {
  id: string;
  name: string;
  ip: string;
  location: string;
  lastActive: string;
  current: boolean;
}

export interface RightPlan {
  id: string;
  name: string;
  credits: number;
  days: number;
  price: number;
  desc: string;
}

export const ACCOUNT_PROFILE = {
  name: '林可',
  account: 'admin',
  phone: '138****8000',
  email: 'admin@camelcaptain.com',
  role: '超级管理员',
  dept: '骆驼队长',
  vip: 'VIP3',
  vipExpiry: '2027-03-31',
  timezone: 'Asia/Shanghai',
  language: '简体中文',
  credits: 1280,
  creditsTotal: 5000,
  storeQuota: 8,
  storeUsed: 5,
};

export const ACCOUNT_DEVICES: AccountDevice[] = [
  { id: 'DV1', name: 'Chrome · Windows', ip: '192.168.1.12', location: '深圳', lastActive: '2026-10-31 09:58:00', current: true },
  { id: 'DV2', name: 'Safari · macOS', ip: '192.168.1.88', location: '深圳', lastActive: '2026-10-30 21:12:00', current: false },
  { id: 'DV3', name: 'Chrome · Android', ip: '10.0.8.23', location: '广州', lastActive: '2026-10-29 18:40:00', current: false },
];

export const LOGIN_HISTORY = [
  { id: 'LH1', time: '2026-10-31 09:58:00', ip: '192.168.1.12', location: '深圳', device: 'Chrome · Windows', result: '成功' },
  { id: 'LH2', time: '2026-10-30 21:12:00', ip: '192.168.1.88', location: '深圳', device: 'Safari · macOS', result: '成功' },
  { id: 'LH3', time: '2026-10-30 08:22:00', ip: '203.12.9.77', location: '香港', device: 'Chrome · Windows', result: '失败（密码错误）' },
  { id: 'LH4', time: '2026-10-29 18:40:00', ip: '10.0.8.23', location: '广州', device: 'Chrome · Android', result: '成功' },
];

export const RIGHT_PLANS: RightPlan[] = [
  { id: 'RP1', name: '体验包', credits: 1000, days: 30, price: 99, desc: '适合小规模试用' },
  { id: 'RP2', name: '标准包', credits: 5000, days: 90, price: 399, desc: '日常运营推荐' },
  { id: 'RP3', name: '专业包', credits: 20000, days: 180, price: 1299, desc: '多店铺高频使用' },
  { id: 'RP4', name: '旗舰包', credits: 60000, days: 365, price: 2999, desc: '团队与大规模刊登' },
];

export const CREDIT_USAGE = [
  { id: 'CU1', time: '2026-10-31 09:12:00', scene: 'AI 标题生成', amount: -12, balance: 1280, item: 'Classic leather crossbody bag' },
  { id: 'CU2', time: '2026-10-30 18:22:00', scene: '批量美图-转白底', amount: -40, balance: 1292, item: '10 张图片' },
  { id: 'CU3', time: '2026-10-30 15:03:00', scene: '商品信息质量检测', amount: -20, balance: 1332, item: '5 个商品' },
  { id: 'CU4', time: '2026-10-29 11:45:00', scene: 'AI 视频生成', amount: -60, balance: 1352, item: '1 个视频' },
  { id: 'CU5', time: '2026-10-28 16:10:00', scene: '购买标准包', amount: 5000, balance: 1412, item: '订单 VIP20261028' },
];

export const FEEDBACK_TYPES = ['功能建议', '页面异常', '数据问题', '其他'];
