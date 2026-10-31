export type AdType = 'ppc' | 'shopauto' | 'prodauto';

export type ViewKey = 'item' | 'plan' | 'word';

/** 商品报表一行：商品 × 计划 × 广告组 × 日期 */
export interface ProdReportRow {
  dateline: string;
  nickname: string;
  adType: AdType;
  planName: string;
  groupName: string;
  itemcode: string;
  imp: number;
  click: number;
  usdCost: number;
  orders: number;
  gmv: number;
}

/** 订单报表一行：一笔订单里的一个商品行 */
export interface OrderReportRow {
  dateline: string;
  nickname: string;
  adType: AdType;
  planName: string;
  itemcode: string;
  productName: string;
  orderNo: string;
  orderItemcode: string;
  orderProductName: string;
  searchword: string;
  gmv: number;
}

/** 由商品报表累加出的原始量 */
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
  store: string;
  itemcode: string;
  name: string;
  thumb: string;
  adTypes: AdType[];
  zeroConv: boolean;
  lowRoas: boolean;
}

export interface PlanRow extends Metrics {
  key: string;
  store: string;
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
  store: string;
  word: string;
  adTypes: AdType[];
  orderCount: number;
  gmv: number;
  itemCount: number;
  lastDate: string;
  orders: WordOrder[];
}

export interface TrendPoint {
  date: string;
  cost: number;
  gmv: number;
  orders: number;
  imp: number;
  click: number;
  roas: number | null;
}

export type TrendMetric = 'cost' | 'gmv' | 'orders' | 'click' | 'roas';

export interface MetricCardData {
  key: string;
  label: string;
  value: number;
  prev: number | null;
  delta: number | null;
  goodWhenUp: boolean;
  format: 'money' | 'int' | 'roas' | 'pct';
}

export interface Filters {
  store: string;
  adType: '' | AdType;
  from: string;
  to: string;
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
