export type MetricKey =
  | 'confirmGmv'
  | 'confirmBuyerNum'
  | 'dealTransRate'
  | 'unitPrice'
  | 'obRate'
  | 'confirmRfxNum'
  | 'confirmProdQt'
  | 'startedGmv'
  | 'startedBuyerNum'
  | 'startedTransRate'
  | 'startedRfxNum'
  | 'pdPv'
  | 'pdUv'
  | 'expoPv'
  | 'avgUvValue'
  | 'addcartUv'
  | 'addcartIcNum'
  | 'addfavUv';

export type MetricFormat = 'money' | 'count' | 'rate';

export interface StoreMetric {
  key: MetricKey;
  label: string;
  format: MetricFormat;
  tip: string;
}

export interface StoreTab {
  key: string;
  label: string;
  metrics: StoreMetric[];
}

export const STORE_TABS: StoreTab[] = [
  {
    key: 'deal',
    label: '成交',
    metrics: [
      { key: 'confirmGmv', label: '成交金额', format: 'money', tip: '统计周期内成交订单金额' },
      { key: 'confirmBuyerNum', label: '成交买家数', format: 'count', tip: '统计周期内成交买家数' },
      { key: 'dealTransRate', label: '成交转化率', format: 'rate', tip: '成交买家数 / 访客数' },
      { key: 'unitPrice', label: '客单价', format: 'money', tip: '成交金额 / 成交买家数' },
      { key: 'obRate', label: '成交买家占比', format: 'rate', tip: '平台口径的成交买家占比' },
      { key: 'confirmRfxNum', label: '成交订单数', format: 'count', tip: '统计周期内成交订单数' },
      { key: 'confirmProdQt', label: '成交件数', format: 'count', tip: '统计周期内成交商品件数' },
    ],
  },
  {
    key: 'order',
    label: '下单',
    metrics: [
      { key: 'startedGmv', label: '下单金额', format: 'money', tip: '统计周期内下单金额' },
      { key: 'startedBuyerNum', label: '下单买家数', format: 'count', tip: '统计周期内下单买家数' },
      { key: 'startedTransRate', label: '下单转化率', format: 'rate', tip: '下单买家数 / 访客数' },
      { key: 'startedRfxNum', label: '下单订单数', format: 'count', tip: '统计周期内下单订单数' },
    ],
  },
  {
    key: 'traffic',
    label: '流量',
    metrics: [
      { key: 'pdPv', label: '店铺浏览量', format: 'count', tip: '商品详情页浏览量' },
      { key: 'pdUv', label: '店铺访客数', format: 'count', tip: '商品详情页访客数' },
      { key: 'expoPv', label: '搜索曝光量', format: 'count', tip: '搜索曝光次数（当前接口暂无数据）' },
      { key: 'avgUvValue', label: 'UV 价值', format: 'money', tip: '成交金额 / 访客数' },
    ],
  },
  {
    key: 'potential',
    label: '潜在',
    metrics: [
      { key: 'addcartUv', label: '商品加购人数', format: 'count', tip: '加购商品的去重人数' },
      { key: 'addcartIcNum', label: '加购件数', format: 'count', tip: '加购商品件数' },
      { key: 'addfavUv', label: '商品收藏人数', format: 'count', tip: '收藏商品的去重人数' },
    ],
  },
];

export const STORE_METRIC_MAP: Record<string, StoreMetric> = STORE_TABS.reduce((acc, tab) => {
  tab.metrics.forEach((metric) => {
    acc[metric.key] = metric;
  });
  return acc;
}, {} as Record<string, StoreMetric>);

export const STORE_METRIC_KEYS: MetricKey[] = [
  'confirmGmv',
  'confirmBuyerNum',
  'dealTransRate',
  'unitPrice',
  'obRate',
  'confirmRfxNum',
  'confirmProdQt',
  'startedGmv',
  'startedBuyerNum',
  'startedTransRate',
  'startedRfxNum',
  'pdPv',
  'pdUv',
  'expoPv',
  'avgUvValue',
  'addcartUv',
  'addcartIcNum',
  'addfavUv',
];
