import { ORDER_IMAGES, PRODUCT_IMAGES, createRng, dayOffset, intBetween, makeCode, pick, shortTitle, STORE_OPTIONS, BUYER_NAMES } from './util';

export interface OrderItem {
  image: string;
  title: string;
  sku: string;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  orderNo: string;
  status: string;
  storeId: string;
  storeName: string;
  buyer: string;
  country: string;
  countryCode: string;
  items: OrderItem[];
  amount: number;
  income: number;
  currency: string;
  purchaseStatus: string;
  logistics: string;
  trackingNo: string;
  mark: string;
  channel: string;
  warning: string;
  onlineOrderNo: string;
  matchStatus: string;
  createdAt: string;
  paidAt: string;
  shippedAt: string;
  deliveredAt: string;
  address: string;
  postcode: string;
  buyerNote: string;
}

export const ORDER_STATUSES = ['全部订单', '新订单', '采购配货', '仓库处理', '物流运输', '已妥投', '已作废'];

export const ORDER_ROW_ACTIONS: Record<string, string[]> = {
  全部订单: ['查看订单', '标记', '备注', '删除'],
  新订单: ['查看订单', '代发采购', '标记', '作废'],
  采购配货: ['查看订单', '代发采购', '申请运单号', '标记'],
  仓库处理: ['查看订单', '一键出库', '拆包', '标记'],
  物流运输: ['查看订单', '物流跟踪', '补发', '标记'],
  已妥投: ['查看订单', '查看收入', '补发', '标记'],
  已作废: ['查看订单', '恢复订单', '删除'],
};

export const ORDER_BATCH_ACTIONS: Record<string, string[]> = {
  全部订单: ['导出订单', '批量标记', '批量备注', '同步订单详情', '删除'],
  新订单: ['一键出库', '邀约采购', '提交到平台', '批量标记', '批量备注', '删除'],
  采购配货: ['一键出库', '处理申报信息', '修改物流渠道', '邀约采购', '批量标记', '导出订单'],
  仓库处理: ['一键出库', '处理申报信息', '修改买家邮编', '修改买家信息', '打印面单', '导出订单'],
  物流运输: ['同步物流', '修改物流渠道', '补发订单', '批量标记', '导出订单'],
  已妥投: ['查看收入', '导出订单', '批量标记'],
  已作废: ['恢复订单', '删除', '导出订单'],
};

const STATUS_WEIGHT: Array<[string, number]> = [
  ['新订单', 18],
  ['采购配货', 16],
  ['仓库处理', 12],
  ['物流运输', 20],
  ['已妥投', 26],
  ['已作废', 8],
];

function weightedStatus(rng: () => number): string {
  const total = STATUS_WEIGHT.reduce((sum, [, weight]) => sum + weight, 0);
  let cursor = rng() * total;
  for (const [status, weight] of STATUS_WEIGHT) {
    cursor -= weight;
    if (cursor <= 0) return status;
  }
  return '新订单';
}

function makeOrder(rng: () => number, index: number): Order {
  const status = weightedStatus(rng);
  const store = pick(rng, STORE_OPTIONS);
  const day = intBetween(rng, -60, 0);
  const created = dayOffset(day, intBetween(rng, 0, 23), intBetween(rng, 0, 59));
  const paid = dayOffset(day, intBetween(rng, 0, 23), intBetween(rng, 0, 59));
  const shipped = ['物流运输', '已妥投'].includes(status)
    ? dayOffset(Math.min(day + intBetween(rng, 1, 3), 0), intBetween(rng, 8, 20), intBetween(rng, 0, 59))
    : '-';
  const delivered = status === '已妥投'
    ? dayOffset(Math.min(day + intBetween(rng, 4, 9), 0), intBetween(rng, 8, 20), intBetween(rng, 0, 59))
    : '-';
  const itemCount = intBetween(rng, 1, 2);
  const items: OrderItem[] = Array.from({ length: itemCount }, (_, itemIndex) => ({
    image: (itemIndex === 0 ? ORDER_IMAGES : PRODUCT_IMAGES)[(index + itemIndex) % (itemIndex === 0 ? ORDER_IMAGES.length : PRODUCT_IMAGES.length)],
    title: shortTitle(rng),
    sku: `SKU${makeCode('', index + 500, 8)}-${itemIndex + 1}`,
    qty: intBetween(rng, 1, 3),
    price: Number((intBetween(rng, 899, 8999) / 100).toFixed(2)),
  }));
  const amount = Number(items.reduce((sum, item) => sum + item.price * item.qty, 0).toFixed(2));
  const country = pick(rng, [
    ['美国', 'US'],
    ['英国', 'UK'],
    ['德国', 'DE'],
    ['法国', 'FR'],
    ['西班牙', 'ES'],
    ['加拿大', 'CA'],
    ['澳大利亚', 'AU'],
  ]);
  const purchaseStatus = status === '新订单' ? '未采购' : status === '已作废' ? '-' : pick(rng, ['已采购', '采购中', '部分采购']);
  const warning = status === '新订单' ? pick(rng, ['', '剩余 2 小时未下单', '剩余 5 小时未发货', '']) : '';
  return {
    id: makeCode('O', index, 8),
    orderNo: `20${makeCode('', index + 26000000, 8)}`,
    status,
    storeId: store.value,
    storeName: store.label,
    buyer: pick(rng, BUYER_NAMES),
    country: country[0],
    countryCode: country[1],
    items,
    amount,
    income: Number((amount * (0.82 + rng() * 0.1)).toFixed(2)),
    currency: 'USD',
    purchaseStatus,
    logistics: ['', '华磊物流', '云途物流', '燕文物流', '递四方'][intBetween(rng, 0, 4)],
    trackingNo: status === '物流运输' || status === '已妥投' ? `YT${makeCode('', index + 99000000, 10)}` : '-',
    mark: pick(rng, ['', '', '加急', '礼品', '老客']),
    channel: pick(rng, ['华磊-美国专线', '云途-全球挂号', '燕文-欧洲专线', '递四方-经济小包']),
    warning,
    onlineOrderNo: `DH${makeCode('', index + 88000000, 10)}`,
    matchStatus: pick(rng, ['已匹配', '已匹配', '已匹配', '未匹配']),
    createdAt: created,
    paidAt: paid,
    shippedAt: shipped,
    deliveredAt: delivered,
    address: `${intBetween(rng, 10, 999)} ${pick(rng, ['Sunset Blvd', 'Market Street', 'Park Avenue', 'King Road'])}`,
    postcode: `${intBetween(rng, 10000, 99999)}`,
    buyerNote: pick(rng, ['', '', 'Please ship as soon as possible.', 'Gift wrap requested.']),
  };
}

export const ORDERS: Order[] = (() => {
  const rng = createRng(20261102);
  return Array.from({ length: 180 }, (_, index) => makeOrder(rng, index));
})();

export const ORDER_COUNTS: Record<string, number> = ORDER_STATUSES.reduce(
  (acc, status) => {
    acc[status] = status === '全部订单' ? ORDERS.length : ORDERS.filter((item) => item.status === status).length;
    return acc;
  },
  {} as Record<string, number>,
);

export interface LabelingRule {
  id: string;
  name: string;
  summary: string;
  label: string;
  scope: string;
  priority: number;
  enabled: boolean;
  updatedAt: string;
  conditions: Array<{ field: string; operator: string; value: string }>;
}

export const LABELING_RULES: LabelingRule[] = [
  {
    id: 'LB001',
    name: '美国高客单加急标',
    summary: '国家 = 美国 且 订单金额 ≥ 100 USD',
    label: '高客单',
    scope: '全部店铺',
    priority: 1,
    enabled: true,
    updatedAt: '2026-10-30 11:20:00',
    conditions: [
      { field: '国家', operator: '等于', value: '美国' },
      { field: '订单金额', operator: '大于等于', value: '100' },
    ],
  },
  {
    id: 'LB002',
    name: '老客户标记',
    summary: '买家历史订单数 ≥ 3',
    label: '老客',
    scope: '152 包包、155 clothes',
    priority: 2,
    enabled: true,
    updatedAt: '2026-10-28 15:02:00',
    conditions: [{ field: '买家历史订单数', operator: '大于等于', value: '3' }],
  },
  {
    id: 'LB003',
    name: '欧洲地址异常预警',
    summary: '国家 in 德国/法国/西班牙 且 邮编为空',
    label: '地址待确认',
    scope: '全部店铺',
    priority: 3,
    enabled: false,
    updatedAt: '2026-10-24 09:35:00',
    conditions: [
      { field: '国家', operator: '包含', value: '德国、法国、西班牙' },
      { field: '邮编', operator: '为空', value: '-' },
    ],
  },
  {
    id: 'LB004',
    name: '含指定关键词的订单',
    summary: '商品标题 包含 "gift"',
    label: '礼品单',
    scope: '161 sneakerhub8',
    priority: 4,
    enabled: true,
    updatedAt: '2026-10-20 17:48:00',
    conditions: [{ field: '商品标题', operator: '包含', value: 'gift' }],
  },
];

export const ORDER_TIMELINE_FIELDS = ['订单创建', '买家付款', '采购下单', '仓库出库', '物流揽收', '派送中', '已妥投'];
