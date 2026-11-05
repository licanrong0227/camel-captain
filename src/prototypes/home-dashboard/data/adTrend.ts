import type { AdTrendMetric } from './types';
import { fmtInt, fmtMoney, fmtMoneyAxis, fmtPct, fmtRoas } from './format';

export type AdTrendView = AdTrendMetric | 'storeGmv' | 'share';

export const AD_TREND_LABELS: Record<AdTrendView, string> = {
  cost: '广告花费',
  gmv: '广告 GMV',
  storeGmv: '整店 GMV',
  share: '广告 GMV 占比',
  roas: 'ROAS',
  orders: '订单数',
  click: '点击量',
};

export const AD_TREND_KPI_KEYS = ['cost', 'gmv', 'storeGmv', 'ratio', 'roas', 'orders', 'click'];

export const AD_KPI_TREND: Record<string, AdTrendView> = {
  cost: 'cost',
  gmv: 'gmv',
  storeGmv: 'storeGmv',
  ratio: 'share',
  roas: 'roas',
  orders: 'orders',
  click: 'click',
};

export function adTrendFormat(metric: AdTrendView, value: number | null): string {
  if (metric === 'cost' || metric === 'gmv' || metric === 'storeGmv') return fmtMoney(value);
  if (metric === 'share') return fmtPct(value);
  if (metric === 'roas') return fmtRoas(value);
  return fmtInt(value);
}

export function adTrendAxisFormat(metric: AdTrendView): ((value: number) => string) | undefined {
  if (metric === 'cost' || metric === 'gmv' || metric === 'storeGmv') return fmtMoneyAxis;
  if (metric === 'share') return (value) => `${(value * 100).toFixed(0)}%`;
  if (metric === 'roas') return (value) => `${value.toFixed(1)}x`;
  return undefined;
}

export function adKpiText(format: 'money' | 'int' | 'roas' | 'pct', value: number | null): string {
  if (format === 'money') return fmtMoney(value);
  if (format === 'int') return fmtInt(value);
  if (format === 'pct') return fmtPct(value);
  return fmtRoas(value);
}
