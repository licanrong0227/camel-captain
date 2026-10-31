import {
  CATEGORY_NAMES,
  PRODUCT_IMAGES,
  createRng,
  dayOffset,
  intBetween,
  makeCode,
  pick,
  shortTitle,
} from './util';

export interface Store {
  id: string;
  name: string;
  alias: string;
  group: string;
  platform: string;
  status: string;
  authStatus: string;
  expiry: string;
  sellerLevel: string;
  score: string;
  items: number;
}

export interface Product {
  id: string;
  title: string;
  image: string;
  category: string;
  status: string;
  storeId: string;
  storeName: string;
  price: number;
  tags: string[];
  parentSku: string;
  sku: string;
  source: string;
  sourcePlatform: string;
  sourceUrl: string;
  claimedAt: string;
  modifiedAt: string;
  publishedAt: string;
  claimVersion: number;
  currentVersion: number;
  sales: number;
  stock: number;
  quality: number;
  platform: string;
}

export interface ClaimProduct {
  id: string;
  title: string;
  image: string;
  category: string;
  price: number;
  sourcePlatform: string;
  sourceUrl: string;
  collectedAt: string;
  claimStatus: string;
  account: string;
  sku: string;
  tags: string[];
}

export interface NewArrivalTemplate {
  id: string;
  name: string;
  type: string;
  operator: string;
  updatedAt: string;
  costCount: number;
  formula: string;
  enabled: boolean;
}

export interface PricingRule {
  id: string;
  channel: string;
  store: string;
  formula: string;
  currency: string;
  rounding: string;
  includeFreight: string;
  status: boolean;
  updatedAt: string;
}

export interface StoreTemplateRow {
  id: string;
  storeId: string;
  storeName: string;
  group: string;
  freight: string;
  afterSale: string;
  pricing: string;
  operator: string;
  updatedAt: string;
}

export const STORES: Store[] = [
  { id: '152', name: '152 包包', alias: 'bags-store', group: '箱包组', platform: '敦煌网', status: '启用', authStatus: '已授权', expiry: '2026-12-31', sellerLevel: 'V4', score: '4.92', items: 2741 },
  { id: '153', name: '153 鞋子', alias: 'shoes-store', group: '鞋靴组', platform: '敦煌网', status: '启用', authStatus: '已授权', expiry: '2026-11-30', sellerLevel: 'V3', score: '4.75', items: 1680 },
  { id: '155', name: '155 clothes', alias: 'clothes-store', group: '服饰组', platform: '敦煌网', status: '启用', authStatus: '已授权', expiry: '2027-01-20', sellerLevel: 'V4', score: '4.88', items: 3205 },
  { id: '161', name: '161 sneakerhub8', alias: 'sneakerhub8', group: '鞋靴组', platform: '敦煌网', status: '启用', authStatus: '已授权', expiry: '2026-11-05', sellerLevel: 'V5', score: '4.96', items: 986 },
  { id: '1957', name: '1957 echvolt', alias: 'echvolt', group: '数码组', platform: '敦煌网', status: '停用', authStatus: '已过期', expiry: '2026-09-30', sellerLevel: 'V2', score: '3.29', items: 132 },
];

export const PRODUCT_STATUSES = [
  '待发布',
  '发布中',
  '循环刊登',
  '发布失败',
  '已上架',
  '已下架',
  '待审核',
  '审核未通过',
  '内容违规',
  '品牌商投诉',
  '未定义',
  '回收站',
];

const STATUS_WEIGHT: Record<string, number> = {
  待发布: 14,
  发布中: 3,
  循环刊登: 8,
  发布失败: 11,
  已上架: 26,
  已下架: 20,
  待审核: 4,
  审核未通过: 9,
  内容违规: 3,
  品牌商投诉: 1,
  未定义: 1,
  回收站: 2,
};

function weightedStatus(rng: () => number): string {
  const entries = Object.entries(STATUS_WEIGHT);
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let cursor = rng() * total;
  for (const [status, weight] of entries) {
    cursor -= weight;
    if (cursor <= 0) return status;
  }
  return '待发布';
}

export const TAG_OPTIONS = [
  { label: '爆款', value: 'hot' },
  { label: '新品', value: 'new' },
  { label: '清仓', value: 'clearance' },
  { label: '高利润', value: 'profit' },
  { label: '待优化', value: 'optimize' },
  { label: '侵权风险', value: 'risk' },
];

const TAG_NAMES = ['爆款', '新品', '清仓', '高利润', '待优化', '侵权风险'];

function makeProduct(rng: () => number, index: number): Product {
  const store = pick(rng, STORES);
  const status = weightedStatus(rng);
  const day = intBetween(rng, -89, -1);
  const claimed = dayOffset(day, intBetween(rng, 8, 20), intBetween(rng, 0, 59));
  const modified = dayOffset(Math.min(day + intBetween(rng, 0, 4), -1), intBetween(rng, 8, 20), intBetween(rng, 0, 59));
  const published = ['已上架', '已下架', '发布失败', '循环刊登', '内容违规', '品牌商投诉'].includes(status)
    ? dayOffset(Math.min(day + intBetween(rng, 1, 6), -1), intBetween(rng, 8, 20), intBetween(rng, 0, 59))
    : '-';
  const tags = rng() > 0.45 ? [pick(rng, TAG_NAMES)] : [];
  const sourcePlatform = pick(rng, ['1688', '亚马逊', 'Temu', '速卖通', '敦煌网']);
  return {
    id: makeCode('P', index, 8),
    title: shortTitle(rng),
    image: PRODUCT_IMAGES[index % PRODUCT_IMAGES.length],
    category: CATEGORY_NAMES[index % CATEGORY_NAMES.length],
    status,
    storeId: store.id,
    storeName: store.name,
    price: Number((intBetween(rng, 399, 12999) / 100).toFixed(2)),
    tags,
    parentSku: `SKU${makeCode('', index, 8)}`,
    sku: `SKU${makeCode('', index, 8)}-${intBetween(rng, 1, 9)}`,
    source: '敦煌网',
    sourcePlatform,
    sourceUrl: `https://detail.1688.com/offer/${1000000 + index}.html`,
    claimedAt: claimed,
    modifiedAt: modified,
    publishedAt: published,
    claimVersion: intBetween(rng, 1, 3),
    currentVersion: intBetween(rng, 1, 5),
    sales: intBetween(rng, 0, 860),
    stock: intBetween(rng, 0, 1200),
    quality: intBetween(rng, 58, 99),
    platform: 'dhgate',
  };
}

export const PRODUCTS: Product[] = (() => {
  const rng = createRng(20261031);
  return Array.from({ length: 260 }, (_, index) => makeProduct(rng, index));
})();

export const PRODUCT_COUNTS: Record<string, number> = PRODUCT_STATUSES.reduce(
  (acc, status) => {
    acc[status] = PRODUCTS.filter((item) => item.status === status).length;
    return acc;
  },
  {} as Record<string, number>,
);

export const CLAIM_STATUSES = ['未认领', '已认领', '认领失败'];

function makeClaim(rng: () => number, index: number): ClaimProduct {
  const day = intBetween(rng, -45, -1);
  return {
    id: makeCode('C', index, 8),
    title: shortTitle(rng),
    image: PRODUCT_IMAGES[(index + 3) % PRODUCT_IMAGES.length],
    category: CATEGORY_NAMES[(index + 2) % CATEGORY_NAMES.length],
    price: Number((intBetween(rng, 299, 9999) / 100).toFixed(2)),
    sourcePlatform: pick(rng, ['1688', '亚马逊', 'Temu', '速卖通']),
    sourceUrl: `https://detail.1688.com/offer/${2000000 + index}.html`,
    collectedAt: dayOffset(day, intBetween(rng, 8, 20), intBetween(rng, 0, 59)),
    claimStatus: pick(rng, CLAIM_STATUSES),
    account: pick(rng, ['采集账号A', '采集账号B', '采购账号1']),
    sku: `SKU${makeCode('', index + 300, 8)}`,
    tags: rng() > 0.6 ? [pick(rng, TAG_NAMES)] : [],
  };
}

export const CLAIMS: ClaimProduct[] = (() => {
  const rng = createRng(20261101);
  return Array.from({ length: 150 }, (_, index) => makeClaim(rng, index));
})();

export const NEW_ARRIVAL_TEMPLATES: NewArrivalTemplate[] = [
  { id: 'NT001', name: '默认上新价模板', type: '公共', operator: 'admin', updatedAt: '2026-10-28 14:22:00', costCount: 4, formula: '采购成本 * 1.35 + 运费 + 2', enabled: true },
  { id: 'NT002', name: '箱包专属模板', type: '专属', operator: 'liuyang', updatedAt: '2026-10-26 09:18:00', costCount: 5, formula: '(采购成本 + 国内运费) * 1.42 + 国际运费', enabled: true },
  { id: 'NT003', name: '鞋靴阶梯定价', type: '专属', operator: 'chenxi', updatedAt: '2026-10-21 17:05:00', costCount: 4, formula: '采购成本 * 1.28 + 3.5', enabled: true },
  { id: 'NT004', name: '服饰低价引流', type: '公共', operator: 'admin', updatedAt: '2026-10-18 11:40:00', costCount: 3, formula: '采购成本 * 1.18 + 1.2', enabled: false },
  { id: 'NT005', name: '数码高客单模板', type: '专属', operator: 'wangyu', updatedAt: '2026-10-12 15:33:00', costCount: 6, formula: '采购成本 * 1.55 + 运费 + 售后成本', enabled: true },
  { id: 'NT006', name: '测试模板', type: '公共', operator: 'ceshi', updatedAt: '2026-09-30 10:02:00', costCount: 2, formula: '采购成本 * 1.2', enabled: false },
];

export const PRICING_RULES: PricingRule[] = [
  { id: 'PR001', channel: '敦煌网', store: '152 包包', formula: '采购价 × 1.35 + 运费', currency: 'USD', rounding: '尾数 .99', includeFreight: '含运费', status: true, updatedAt: '2026-10-30 10:12:00' },
  { id: 'PR002', channel: '敦煌网', store: '153 鞋子', formula: '采购价 × 1.28 + 3.5', currency: 'USD', rounding: '四舍五入', includeFreight: '不含运费', status: true, updatedAt: '2026-10-29 16:45:00' },
  { id: 'PR003', channel: '亚马逊', store: '155 clothes', formula: '采购价 × 1.42 + 2', currency: 'USD', rounding: '尾数 .99', includeFreight: '含运费', status: true, updatedAt: '2026-10-28 09:20:00' },
  { id: 'PR004', channel: 'Temu', store: '161 sneakerhub8', formula: '采购价 × 1.22 + 1', currency: 'USD', rounding: '向上取整', includeFreight: '含运费', status: false, updatedAt: '2026-10-25 14:08:00' },
  { id: 'PR005', channel: '速卖通', store: '152 包包', formula: '采购价 × 1.3 + 国际运费', currency: 'USD', rounding: '尾数 .99', includeFreight: '含运费', status: true, updatedAt: '2026-10-23 11:37:00' },
  { id: 'PR006', channel: 'SHEIN', store: '155 clothes', formula: '采购价 × 1.18 + 0.8', currency: 'USD', rounding: '四舍五入', includeFreight: '不含运费', status: true, updatedAt: '2026-10-20 18:02:00' },
];

export const STORE_TEMPLATES: StoreTemplateRow[] = STORES.map((store, index) => ({
  id: `ST${String(index + 1).padStart(3, '0')}`,
  storeId: store.id,
  storeName: store.name,
  group: store.group,
  freight: ['华磊-美国专线', '云途-全球挂号', '燕文-欧洲专线', '递四方-经济小包', '华磊-美国专线'][index],
  afterSale: ['7天无理由', '15天售后', '7天无理由', '30天质保', '7天无理由'][index],
  pricing: NEW_ARRIVAL_TEMPLATES[index % NEW_ARRIVAL_TEMPLATES.length].name,
  operator: ['admin', 'liuyang', 'chenxi', 'wangyu', 'ceshi'][index],
  updatedAt: ['2026-10-30 09:40:00', '2026-10-28 15:22:00', '2026-10-27 11:10:00', '2026-10-24 17:55:00', '2026-09-30 10:00:00'][index],
}));
