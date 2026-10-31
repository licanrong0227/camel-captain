import { PRODUCT_IMAGES, createRng, dayOffset, intBetween, makeCode, pick, shortTitle } from './util';

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contact: string;
  phone: string;
  address: string;
  category: string;
  settlement: string;
  status: string;
  createdAt: string;
}

export interface PurchaseOrder {
  id: string;
  poNo: string;
  orderNo: string;
  supplier: string;
  warehouse: string;
  title: string;
  image: string;
  sku: string;
  qty: number;
  amount: number;
  freight: number;
  status: string;
  orderedAt: string;
  eta: string;
  trackingNo: string;
  relatedOrders: Array<{ orderNo: string; qty: number; buyer: string }>;
}

export interface InboundOrder {
  id: string;
  no: string;
  type: string;
  warehouse: string;
  relatedNo: string;
  skuCount: number;
  qty: number;
  status: string;
  operator: string;
  time: string;
}

export interface ExceptionRecord {
  id: string;
  no: string;
  orderNo: string;
  product: string;
  image: string;
  type: string;
  desc: string;
  foundAt: string;
  handler: string;
  status: string;
}

export interface ReceiptAddress {
  id: string;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  postcode: string;
  isDefault: boolean;
  status: string;
  warehouse: string;
}

export const SUPPLIER_CATEGORIES = ['箱包', '鞋靴', '服饰', '配饰', '数码', '综合'];
export const WAREHOUSE_OPTIONS = [
  { label: '深圳仓', value: 'shenzhen' },
  { label: '广州仓', value: 'guangzhou' },
  { label: '义乌仓', value: 'yiwu' },
  { label: '海外仓-美国', value: 'us' },
];

export const SUPPLIERS: Supplier[] = [
  { id: 'S001', code: 'SUP001', name: '广州优品箱包厂', contact: '陈明', phone: '13800138001', address: '广东省广州市白云区三元里大道 88 号', category: '箱包', settlement: '月结 30 天', status: '合作中', createdAt: '2025-11-12' },
  { id: 'S002', code: 'SUP002', name: '莆田鞋业供应链', contact: '林伟', phone: '13800138002', address: '福建省莆田市荔城区工业路 12 号', category: '鞋靴', settlement: '预付 30%', status: '合作中', createdAt: '2025-12-03' },
  { id: 'S003', code: 'SUP003', name: '杭州服饰贸易', contact: '王芳', phone: '13800138003', address: '浙江省杭州市余杭区良渚街道 6 号', category: '服饰', settlement: '现结', status: '合作中', createdAt: '2026-01-18' },
  { id: 'S004', code: 'SUP004', name: '义乌小商品城', contact: '李强', phone: '13800138004', address: '浙江省义乌市国际商贸城二区', category: '配饰', settlement: '月结 15 天', status: '暂停合作', createdAt: '2026-02-22' },
  { id: 'S005', code: 'SUP005', name: '深圳数码优选', contact: '赵磊', phone: '13800138005', address: '广东省深圳市华强北赛格广场 18 楼', category: '数码', settlement: '现结', status: '合作中', createdAt: '2026-03-09' },
  { id: 'S006', code: 'SUP006', name: '泉州运动装备', contact: '黄勇', phone: '13800138006', address: '福建省泉州市晋江市陈埭镇', category: '鞋靴', settlement: '月结 30 天', status: '合作中', createdAt: '2026-04-14' },
  { id: 'S007', code: 'SUP007', name: '东莞皮具工坊', contact: '周敏', phone: '13800138007', address: '广东省东莞市厚街镇家具大道', category: '箱包', settlement: '预付 50%', status: '合作中', createdAt: '2026-05-06' },
  { id: 'S008', code: 'SUP008', name: '苏州丝绸服饰', contact: '吴静', phone: '13800138008', address: '江苏省苏州市吴中区木渎镇', category: '服饰', settlement: '月结 30 天', status: '已停用', createdAt: '2026-06-21' },
];

export const PURCHASE_STATUSES = ['待采购', '已下单', '已发货', '部分入库', '已入库', '已取消', '异常'];

const PURCHASE_WEIGHT: Array<[string, number]> = [
  ['待采购', 16],
  ['已下单', 20],
  ['已发货', 24],
  ['部分入库', 8],
  ['已入库', 24],
  ['已取消', 5],
  ['异常', 3],
];

function weightedStatus(rng: () => number): string {
  const total = PURCHASE_WEIGHT.reduce((sum, [, weight]) => sum + weight, 0);
  let cursor = rng() * total;
  for (const [status, weight] of PURCHASE_WEIGHT) {
    cursor -= weight;
    if (cursor <= 0) return status;
  }
  return '待采购';
}

function makePurchaseOrder(rng: () => number, index: number): PurchaseOrder {
  const status = weightedStatus(rng);
  const day = intBetween(rng, -50, 0);
  const supplier = pick(rng, SUPPLIERS);
  const qty = intBetween(rng, 1, 12);
  const price = intBetween(rng, 1200, 8800) / 100;
  return {
    id: makeCode('PO', index, 6),
    poNo: `CG${makeCode('', index + 20260000, 8)}`,
    orderNo: `20${makeCode('', index + 26000000, 8)}`,
    supplier: supplier.name,
    warehouse: pick(rng, WAREHOUSE_OPTIONS).label,
    title: shortTitle(rng),
    image: PRODUCT_IMAGES[index % PRODUCT_IMAGES.length],
    sku: `SKU${makeCode('', index + 700, 8)}`,
    qty,
    amount: Number((price * qty).toFixed(2)),
    freight: Number((intBetween(rng, 200, 1800) / 100).toFixed(2)),
    status,
    orderedAt: dayOffset(day, intBetween(rng, 8, 20), intBetween(rng, 0, 59)),
    eta: dayOffset(Math.min(day + intBetween(rng, 2, 12), 15)),
    trackingNo: ['已发货', '已入库', '部分入库'].includes(status) ? `SF${makeCode('', index + 77000000, 10)}` : '-',
    relatedOrders: Array.from({ length: intBetween(rng, 1, 3) }, (_, itemIndex) => ({
      orderNo: `20${makeCode('', index + itemIndex + 26000100, 8)}`,
      qty: intBetween(rng, 1, 3),
      buyer: pick(rng, ['Emily Johnson', 'Michael Brown', 'Sophia Davis', 'James Wilson']),
    })),
  };
}

export const PURCHASE_ORDERS: PurchaseOrder[] = (() => {
  const rng = createRng(20261103);
  return Array.from({ length: 110 }, (_, index) => makePurchaseOrder(rng, index));
})();

export const INBOUND_ORDERS: InboundOrder[] = (() => {
  const rng = createRng(20261104);
  return Array.from({ length: 80 }, (_, index) => {
    const type = pick(rng, ['入库', '出库']);
    const status = type === '入库'
      ? pick(rng, ['待入库', '部分入库', '已入库', '异常'])
      : pick(rng, ['待出库', '已出库', '已取消', '异常']);
    return {
      id: makeCode('IO', index, 6),
      no: `${type === '入库' ? 'RK' : 'CK'}${makeCode('', index + 20261000, 8)}`,
      type,
      warehouse: pick(rng, WAREHOUSE_OPTIONS).label,
      relatedNo: `CG${makeCode('', index + 20260000, 8)}`,
      skuCount: intBetween(rng, 1, 8),
      qty: intBetween(rng, 1, 60),
      status,
      operator: pick(rng, ['admin', 'liuyang', 'chenxi', 'wangyu']),
      time: dayOffset(intBetween(rng, -40, 0), intBetween(rng, 8, 20), intBetween(rng, 0, 59)),
    };
  });
})();

export const EXCEPTION_TYPES = ['缺货', '超卖', '地址异常', '称重异常', '物流异常', '库存差异'];
export const EXCEPTION_STATUSES = ['待处理', '处理中', '已处理', '已忽略'];

export const EXCEPTIONS: ExceptionRecord[] = (() => {
  const rng = createRng(20261105);
  return Array.from({ length: 64 }, (_, index) => ({
    id: makeCode('EX', index, 6),
    no: `YC${makeCode('', index + 20262000, 8)}`,
    orderNo: `20${makeCode('', index + 26001000, 8)}`,
    product: shortTitle(rng),
    image: PRODUCT_IMAGES[(index + 2) % PRODUCT_IMAGES.length],
    type: pick(rng, EXCEPTION_TYPES),
    desc: pick(rng, ['仓库实收数量少于采购数量 2 件', '订单已出库但库存不足', '收件地址缺少门牌号', '包裹实重与申报重量差异 0.8kg', '物流商反馈地址无法派送', '系统库存与仓库盘点不一致']),
    foundAt: dayOffset(intBetween(rng, -20, 0), intBetween(rng, 8, 20), intBetween(rng, 0, 59)),
    handler: pick(rng, ['-', 'liuyang', 'chenxi', 'wangyu']),
    status: pick(rng, EXCEPTION_STATUSES),
  }));
})();

export const RECEIPT_ADDRESSES: ReceiptAddress[] = [
  { id: 'RA001', name: '陈明', phone: '13800138001', province: '广东省', city: '广州市', district: '白云区', detail: '三元里大道 88 号 3 栋 201', postcode: '510000', isDefault: true, status: '启用', warehouse: '广州仓' },
  { id: 'RA002', name: '林伟', phone: '13800138002', province: '福建省', city: '莆田市', district: '荔城区', detail: '工业路 12 号', postcode: '351100', isDefault: false, status: '启用', warehouse: '深圳仓' },
  { id: 'RA003', name: '王芳', phone: '13800138003', province: '浙江省', city: '杭州市', district: '余杭区', detail: '良渚街道 6 号 1 幢', postcode: '311100', isDefault: false, status: '启用', warehouse: '义乌仓' },
  { id: 'RA004', name: '李强', phone: '13800138004', province: '浙江省', city: '义乌市', district: '稠城街道', detail: '国际商贸城二区 5 楼', postcode: '322000', isDefault: false, status: '停用', warehouse: '义乌仓' },
  { id: 'RA005', name: '赵磊', phone: '13800138005', province: '广东省', city: '深圳市', district: '福田区', detail: '华强北路 1002 号赛格广场 18 楼', postcode: '518000', isDefault: false, status: '启用', warehouse: '深圳仓' },
  { id: 'RA006', name: '黄勇', phone: '13800138006', province: '福建省', city: '泉州市', district: '晋江市', detail: '陈埭镇岸兜村工业区 9 号', postcode: '362200', isDefault: false, status: '启用', warehouse: '深圳仓' },
  { id: 'RA007', name: '周敏', phone: '13800138007', province: '广东省', city: '东莞市', district: '厚街镇', detail: '家具大道 128 号', postcode: '523000', isDefault: false, status: '启用', warehouse: '广州仓' },
  { id: 'RA008', name: '吴静', phone: '13800138008', province: '江苏省', city: '苏州市', district: '吴中区', detail: '木渎镇金枫路 216 号', postcode: '215000', isDefault: false, status: '启用', warehouse: '义乌仓' },
];
