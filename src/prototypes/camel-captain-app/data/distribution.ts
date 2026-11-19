export type DistributionProductType = 'compute' | 'member' | 'store';

export type DistributionOrder = {
  id: string;
  product: string;
  type: DistributionProductType;
  customer: string;
  orderNo: string;
  qty: number;
  amount: number;
  status: '已支付' | '已取消';
};

export const DISTRIBUTION_ORDERS: DistributionOrder[] = [
  { id: 'do-1', product: 'AI算力', type: 'compute', customer: 'ceshi11', orderNo: '20260913CCBVMS007', qty: 50, amount: 1.75, status: '已支付' },
  { id: 'do-2', product: 'AI算力', type: 'compute', customer: 'ceshi11', orderNo: '20260913CCBVMS006', qty: 50, amount: 1.75, status: '已取消' },
  { id: 'do-3', product: '至尊会员', type: 'member', customer: 'ceshi11', orderNo: '20260913CCBVMS005', qty: 12, amount: 1938, status: '已取消' },
  { id: 'do-4', product: '金牌会员', type: 'member', customer: 'ceshi11', orderNo: '20260913CCBVMS004', qty: 12, amount: 2803, status: '已支付' },
  { id: 'do-5', product: '店铺数量', type: 'store', customer: 'ceshi11', orderNo: '20260913CCBVMS003', qty: 1, amount: 19.9, status: '已支付' },
  { id: 'do-6', product: '铜牌会员', type: 'member', customer: 'ceshi11', orderNo: '20260913CCBVMS002', qty: 1, amount: 155, status: '已支付' },
  { id: 'do-7', product: '金牌会员', type: 'member', customer: 'jxjx1998', orderNo: '20260913NMXDRR001', qty: 1, amount: 0, status: '已支付' },
  { id: 'do-8', product: '金牌会员', type: 'member', customer: 'xiongzhilin', orderNo: '20260913PPBLYC001', qty: 1, amount: 0, status: '已支付' },
];

export type DistributionCustomer = {
  id: string;
  name: string;
  username: string;
  phone: string;
  email: string;
  qq: string;
  registeredAt: string;
  storeCount: number;
  storeLimit: number;
  orderCount: number;
  orderLimit: number;
  spend: number;
  compute: number;
  points: number;
  coupons: number;
  subAccounts: number;
  memberType: string;
  memberPeriod: string;
};

export const DISTRIBUTION_CUSTOMERS: DistributionCustomer[] = [
  {
    id: 'dc-1',
    name: '周星',
    username: '18922870402',
    phone: '18922870402',
    email: '1390258144@qq.com',
    qq: '',
    registeredAt: '2026-11-03 19:16:54',
    storeCount: 0,
    storeLimit: 1,
    orderCount: 0,
    orderLimit: 1000,
    spend: 0,
    compute: 100,
    points: 0,
    coupons: 0,
    subAccounts: 0,
    memberType: '免费会员',
    memberPeriod: '-',
  },
  {
    id: 'dc-2',
    name: 'monica5288',
    username: 'monica5288',
    phone: '13242965121',
    email: '1299123733@qq.com',
    qq: '',
    registeredAt: '2026-11-03 14:41:15',
    storeCount: 0,
    storeLimit: 1,
    orderCount: 0,
    orderLimit: 1000,
    spend: 0,
    compute: 100,
    points: 0,
    coupons: 0,
    subAccounts: 0,
    memberType: '免费会员',
    memberPeriod: '-',
  },
  {
    id: 'dc-3',
    name: '周星',
    username: 'zhouxing',
    phone: '18296852708',
    email: '1390258144@qq.com',
    qq: '1390258144',
    registeredAt: '2026-10-14 17:00:32',
    storeCount: 0,
    storeLimit: 1,
    orderCount: 47,
    orderLimit: 1000,
    spend: 0,
    compute: 98.5,
    points: 0,
    coupons: 0,
    subAccounts: 0,
    memberType: '免费会员',
    memberPeriod: '-',
  },
  {
    id: 'dc-4',
    name: 'ceshi11',
    username: 'ceshi11',
    phone: '13751128945',
    email: '1457828831@qq.com',
    qq: '1457828831',
    registeredAt: '2026-09-13 15:25:05',
    storeCount: 0,
    storeLimit: 31,
    orderCount: 0,
    orderLimit: 30000,
    spend: 2979.65,
    compute: 550,
    points: 2978,
    coupons: 0,
    subAccounts: 0,
    memberType: '金牌会员',
    memberPeriod: '月',
  },
  {
    id: 'dc-5',
    name: '姜鑫',
    username: 'jxjx1998',
    phone: '13510371303',
    email: '276582138@qq.com',
    qq: '',
    registeredAt: '2026-08-19 10:48:45',
    storeCount: 0,
    storeLimit: 1,
    orderCount: 0,
    orderLimit: 1000,
    spend: 0,
    compute: 600,
    points: 0,
    coupons: 0,
    subAccounts: 0,
    memberType: '免费会员',
    memberPeriod: '-',
  },
  {
    id: 'dc-6',
    name: '熊志林',
    username: 'xiongzhilin',
    phone: '13037349811',
    email: 'xiongzhilin@163.com',
    qq: '',
    registeredAt: '2025-12-19 10:44:36',
    storeCount: 0,
    storeLimit: 1,
    orderCount: 0,
    orderLimit: 1000,
    spend: 0,
    compute: 600,
    points: 0,
    coupons: 0,
    subAccounts: 0,
    memberType: '免费会员',
    memberPeriod: '-',
  },
];

export const CUSTOMER_FIELDS: Array<{ key: keyof DistributionCustomer; label: string }> = [
  { key: 'name', label: '姓名' },
  { key: 'username', label: '用户名' },
  { key: 'phone', label: '手机号' },
  { key: 'email', label: '邮箱' },
  { key: 'qq', label: 'QQ' },
  { key: 'registeredAt', label: '注册时间' },
  { key: 'storeCount', label: '店铺数/上限' },
  { key: 'orderCount', label: '订单数/上限' },
  { key: 'spend', label: '消费总金额' },
  { key: 'compute', label: '算力余额' },
  { key: 'points', label: '积分' },
  { key: 'coupons', label: '优惠券' },
  { key: 'subAccounts', label: '子账号数' },
  { key: 'memberType', label: '会员类型' },
  { key: 'memberPeriod', label: '会员周期' },
];
