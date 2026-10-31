export type AdType = 'ppc' | 'shopauto' | 'prodauto';

/** 店铺每日经营数据：对应 report/store/wis-core-info 与 dashboard-list 的 wis 字段 */
export interface StoreDailyRow {
  storeId: number;
  storeName: string;
  aliasName: string;
  statDate: string;
  confirmGmv: number;
  startedGmv: number;
  confirmRfxNum: number;
  confirmBuyerNum: number;
  dealTransRate: number;
  unitPrice: number;
  pdUv: number;
  expoPv: number;
}

/** 订单商品行：对应 order/list 的 orderProducts ＋ 订单支付日期 */
export interface OrderItemDailyRow {
  storeId: number;
  statDate: string;
  itemCode: string;
  itemName: string;
  imgUrl: string;
  categoryName: string;
  quantity: number;
  price: number;
  gmv: number;
  orderNo: string;
  /** 订单上打的标签（来自系统订单标签），用于按标签剔除 */
  labels: string[];
}

/** 每个店铺的补单剔除配置 */
export interface StoreExclusion {
  storeId: number;
  /** 要剔除的订单标签 */
  excludeLabelIds: string[];
  manualOrderNos: string[];
  manualAmount: number;
}

export interface OrderLabel {
  id: string;
  name: string;
  description: string;
}

/** 广告每日数据：对应 dh.seller.ad.prod.report.page */
export interface AdDailyRow {
  storeId: number;
  itemCode: string;
  adType: AdType;
  dateline: string;
  costUsd: number;
  adGmv: number;
  orders: number;
}

export interface Acc {
  adCost: number;
  adGmv: number;
  adOrders: number;
  storeGmv: number;
  linkGmv: number;
}

export interface Metrics extends Acc {
  adRatio: number | null;
  roas: number | null;
  adCostDelta: number | null;
  adGmvDelta: number | null;
  storeGmvDelta: number | null;
  adRatioDelta: number | null;
  roasDelta: number | null;
}

export interface StoreRow extends Metrics {
  key: string;
  storeId: number;
  storeName: string;
  aliasName: string;
}

export interface LinkRow {
  key: string;
  storeId: number;
  itemCode: string;
  itemName: string;
  imgUrl: string;
  categoryName: string;
  adCost: number;
  adGmv: number;
  adOrders: number;
  linkGmv: number;
  adRatio: number | null;
  roas: number | null;
  hasAd: boolean;
}

export interface TrendPoint {
  date: string;
  adCost: number;
  storeGmv: number;
  adGmv: number;
}

export interface KpiCard {
  key: string;
  label: string;
  value: number | null;
  prev: number | null;
  delta: number | null;
  format: 'money' | 'percent' | 'roas' | 'int';
  goodWhenUp: boolean;
  hint: string;
}

export interface Filters {
  storeId: number | null;
  from: string;
  to: string;
}


