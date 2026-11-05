export type AdType = 'ppc' | 'prodauto' | 'shopauto';
export type ViewKey = 'item' | 'plan' | 'word';
export type CountryId = 'US' | 'UK' | 'DE' | 'FR' | 'IT' | 'ES';
export type StorePeriodKey = 'day' | 'week' | 'month' | 'months3';

export interface StoreInfo {
  id: number;
  name: string;
  alias: string;
  groupId: number;
  adEnabled: boolean;
  openDate: string;
  weight: number;
  unitPrice: number;
  level: number;
  score: number;
}

export interface StoreGroup {
  id: number;
  name: string;
  storeIds: number[];
}

export interface SkuInfo {
  id: string;
  color: string;
  size: string;
  pattern: string;
  weight: number;
}

export interface ProductInfo {
  itemcode: string;
  storeId: number;
  name: string;
  thumb: string;
  price: number;
  traffic: number;
  adEnabled: boolean;
  keywords: string[];
  skus: SkuInfo[];
}

/** 店铺经营：店铺 × 日期 × 国家，只存可加指标，比率聚合时重算 */
export interface StoreDailyRow {
  storeId: number;
  date: string;
  country: CountryId;
  gmv: number;
  buyers: number;
  orders: number;
  qty: number;
  startedGmv: number;
  startedBuyers: number;
  startedOrders: number;
  pv: number;
  uv: number;
  expo: number;
  addcartUv: number;
  addcartIc: number;
  addfavUv: number;
  obRate: number;
}

export interface AdDailyRow {
  storeId: number;
  date: string;
  adCost: number;
  adGmv: number;
  imp: number;
  click: number;
  orders: number;
}

/** 商品广告日报：商品 × 计划 × 广告组 × 日期 */
export interface ProdReportRow {
  date: string;
  storeId: number;
  adType: AdType;
  planName: string;
  groupName: string;
  itemcode: string;
  imp: number;
  click: number;
  cost: number;
  orders: number;
  gmv: number;
}

/** 订单商品行 / 补单行 */
export interface OrderRow {
  date: string;
  storeId: number;
  adType: AdType;
  planName: string;
  itemcode: string;
  productName: string;
  orderNo: string;
  orderItemcode: string;
  orderProductName: string;
  searchWord: string;
  gmv: number;
  labels: string[];
  supplement: boolean;
}

export interface ItemDayRow {
  storeId: number;
  itemcode: string;
  date: string;
  qty: number;
  gmv: number;
  orders: number;
}

export interface Acc {
  imp: number;
  click: number;
  cost: number;
  orders: number;
  gmv: number;
}

export interface Metrics extends Acc {
  ctr: number | null;
  cpc: number | null;
  cvr: number | null;
  cpa: number | null;
  roas: number | null;
}

export interface ItemRow extends Metrics {
  key: string;
  storeId: number;
  storeName: string;
  itemcode: string;
  name: string;
  thumb: string;
  adTypes: AdType[];
  zeroConv: boolean;
  lowRoas: boolean;
}

export interface PlanRow extends Metrics {
  key: string;
  storeId: number;
  storeName: string;
  adType: AdType;
  planName: string;
  groupName: string;
  zeroConv: boolean;
  lowRoas: boolean;
}

export interface WordOrderItem {
  code: string;
  name: string;
  amount: number;
}

export interface WordOrder {
  orderNo: string;
  date: string;
  items: WordOrderItem[];
  amount: number;
}

export interface WordRow {
  key: string;
  storeId: number;
  storeName: string;
  word: string;
  adTypes: AdType[];
  orderCount: number;
  gmv: number;
  itemCount: number;
  lastDate: string;
  orders: WordOrder[];
}

export interface AdTrendPoint {
  date: string;
  cost: number;
  gmv: number;
  orders: number;
  imp: number;
  click: number;
  roas: number | null;
}

export type AdTrendMetric = 'cost' | 'gmv' | 'orders' | 'click' | 'roas';

export interface AdKpiCard {
  key: string;
  label: string;
  hint: string;
  format: 'money' | 'int' | 'roas' | 'pct';
  main: boolean;
  value: number | null;
  prev: number | null;
  delta: number | null;
  goodWhenUp: boolean;
}

export interface AdFilters {
  storeIds: number[];
  adType: '' | AdType;
  from: string;
  to: string;
}

export interface ExclusionConfig {
  storeId: number;
  excludeLabelIds: string[];
  manualOrderNos: string[];
  manualAmount: number;
}

export interface ExclusionResult {
  byDay: Map<string, number>;
  gmv: number;
  count: number;
  manualTotal: number;
}

export const AD_TYPE_LABEL: Record<AdType, string> = {
  ppc: '手动广告',
  prodauto: '商品自动',
  shopauto: '全店自动',
};

export const AD_TYPE_OPTIONS = [
  { value: '', label: '全部广告类型' },
  { value: 'ppc', label: '手动广告' },
  { value: 'prodauto', label: '商品自动' },
  { value: 'shopauto', label: '全店自动' },
];

export const COUNTRIES: Array<{ id: 'TOTAL' | CountryId; name: string }> = [
  { id: 'TOTAL', name: '全部国家' },
  { id: 'US', name: '美国' },
  { id: 'UK', name: '英国' },
  { id: 'DE', name: '德国' },
  { id: 'FR', name: '法国' },
  { id: 'IT', name: '意大利' },
  { id: 'ES', name: '西班牙' },
];

export const ORDER_LABELS: Array<{ id: string; name: string; description: string }> = [
  { id: 'lbl-supplement', name: '补单', description: '人为补足销量的订单' },
  { id: 'lbl-brush', name: '刷单', description: '虚假交易订单' },
  { id: 'lbl-gift', name: '赠品单', description: '赠品或 0 元订单' },
  { id: 'lbl-test', name: '测试单', description: '内部测试下单' },
  { id: 'lbl-friend', name: '熟人单', description: '熟人/内部人员购买' },
  { id: 'lbl-cashback', name: '返现单', description: '返现或补偿订单' },
  { id: 'lbl-sample', name: '样品单', description: '样品寄送订单' },
  { id: 'lbl-offline', name: '线下转单', description: '线下成交转到线上' },
];
