import {
  AD_DAILY,
  AD_LIMITS,
  AD_ORDERS,
  AD_STORES,
  type AdDailyRow,
} from './ad-data';

export type AdPreset = '1' | '3' | '7' | '15' | '30' | 'custom';

export const MAX_RANGE_DAYS = 31;
export const AD_REPORT_TO = AD_LIMITS.REPORT_TO;
export const AD_DATA_FROM = AD_LIMITS.DATA_FROM;
export const AD_ORDER_TO = AD_LIMITS.ORDER_TO;


export const AD_PRESETS: Array<{ key: Exclude<AdPreset, 'custom'>; label: string; days: number }> = [
  { key: '1', label: '近 1 天', days: 1 },
  { key: '3', label: '近 3 天', days: 3 },
  { key: '7', label: '近 7 天', days: 7 },
  { key: '15', label: '近 15 天', days: 15 },
  { key: '30', label: '近 30 天', days: 30 },
];

export function addDays(value: string, days: number): string {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function eachDay(from: string, to: string): string[] {
  const days: string[] = [];
  let cursor = from;
  let guard = 0;
  while (cursor <= to && guard < 400) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
    guard += 1;
  }
  return days;
}

export function presetRange(preset: Exclude<AdPreset, 'custom'>): { from: string; to: string } {
  const days = AD_PRESETS.find((item) => item.key === preset)?.days ?? 7;
  return { from: addDays(AD_REPORT_TO, -(days - 1)), to: AD_REPORT_TO };
}

export function rangeDays(from: string, to: string): number {
  if (!from || !to) return 0;
  return Math.round((new Date(`${to}T00:00:00Z`).getTime() - new Date(`${from}T00:00:00Z`).getTime()) / 86400000) + 1;
}

export function fmtDateSlash(value: string): string {
  return value.replace(/-/g, '/');
}

export function validateRange(from: string, to: string): string {
  if (!from || !to) return '请选择完整的起止日期';
  if (to < from) return '结束日期不能早于开始日期';
  if (to > AD_REPORT_TO) return `广告数据截至 ${fmtDateSlash(AD_REPORT_TO)}，报表区间不能超过这一天`;
  if (from < AD_DATA_FROM) return `当前只保留 ${fmtDateSlash(AD_DATA_FROM)} 之后的数据`;
  if (rangeDays(from, to) > MAX_RANGE_DAYS) return `单次查询最长 ${MAX_RANGE_DAYS} 天，请缩短日期范围`;
  return '';
}

export interface AdFilters {
  storeId: number | null;
  from: string;
  to: string;
}

export interface AdExclusionConfig {
  storeId: number;
  excludeLabelIds: string[];
  manualOrderNos: string[];
  manualAmount: number;
}

export const AD_DEFAULT_EXCLUSIONS: AdExclusionConfig[] = AD_STORES.map((store) => ({
  storeId: store.storeId,
  excludeLabelIds: store.storeId === 155 ? [] : ['lbl-supplement'],
  manualOrderNos: [],
  manualAmount: 0,
}));

export interface AdPoint {
  date: string;
  adCost: number;
  adGmv: number;
  storeGmv: number;
}

export interface AdKpiCard {
  key: string;
  label: string;
  format: 'money' | 'percent' | 'roas';
  goodWhenUp: boolean;
  hint: string;
  value: number | null;
  prev: number | null;
}

export interface AdSnapshot {
  points: AdPoint[];
  kpis: AdKpiCard[];
  excludedGmv: number;
  excludedCount: number;
  manualTotal: number;
  scopeLabel: string;
}

interface ExclusionResult {
  byDay: Map<string, number>;
  gmv: number;
  count: number;
  manualTotal: number;
}

function resolveExclusions(
  from: string,
  to: string,
  scopeIds: number[],
  enabled: boolean,
  configs: AdExclusionConfig[],
): ExclusionResult {
  const result: ExclusionResult = { byDay: new Map(), gmv: 0, count: 0, manualTotal: 0 };
  if (!enabled) return result;
  configs.forEach((config) => {
    if (scopeIds.includes(config.storeId)) result.manualTotal += config.manualAmount || 0;
  });
  AD_ORDERS.forEach((order) => {
    if (!scopeIds.includes(order.storeId) || order.date < from || order.date > to) return;
    const config = configs.find((item) => item.storeId === order.storeId);
    if (!config) return;
    const hit = order.labels.some((label) => config.excludeLabelIds.includes(label)) || config.manualOrderNos.includes(order.orderNo);
    if (!hit) return;
    result.gmv += order.gmv;
    result.count += 1;
    const key = `${order.storeId}|${order.date}`;
    result.byDay.set(key, (result.byDay.get(key) || 0) + order.gmv);
  });
  return result;
}

export function excludedGmvByDay(
  storeId: number,
  from: string,
  to: string,
  excludeEnabled: boolean,
  configs: AdExclusionConfig[],
): Map<string, number> {
  const result = new Map<string, number>();
  if (!excludeEnabled) return result;
  const config = configs.find((item) => item.storeId === storeId);
  if (!config) return result;
  const resolved = resolveExclusions(from, to, [storeId], true, [config]);
  resolved.byDay.forEach((value, key) => {
    const [id, date] = key.split('|');
    if (Number(id) === storeId) result.set(date, (result.get(date) || 0) + value);
  });
  return result;
}

function sumRange(rows: AdDailyRow[]): { adCost: number; adGmv: number; storeGmv: number } {  return rows.reduce(
    (acc, row) => ({
      adCost: acc.adCost + row.adCost,
      adGmv: acc.adGmv + row.adGmv,
      storeGmv: acc.storeGmv + row.storeGmv,
    }),
    { adCost: 0, adGmv: 0, storeGmv: 0 },
  );
}

function ratioOf(adGmv: number, storeGmv: number): number | null {
  return storeGmv > 0 ? adGmv / storeGmv : null;
}

function roasOf(adGmv: number, adCost: number): number | null {
  return adCost > 0 ? adGmv / adCost : null;
}

export function buildAdSnapshot(
  filters: AdFilters,
  excludeEnabled: boolean,
  configs: AdExclusionConfig[],
  scopeOverride?: number[] | null,
): AdSnapshot {
  const scopeIds = filters.storeId
    ? [filters.storeId]
    : scopeOverride && scopeOverride.length
      ? scopeOverride
      : AD_STORES.map((store) => store.storeId);
  const scope = filters.storeId ? AD_STORES.find((store) => store.storeId === filters.storeId) : null;
  const scopeLabel = scope ? scope.storeName : '店群';
  const dates = eachDay(filters.from, filters.to);
  const rangeRows = AD_DAILY.filter((row) => scopeIds.includes(row.storeId) && row.date >= filters.from && row.date <= filters.to);
  const exclusion = resolveExclusions(filters.from, filters.to, scopeIds, excludeEnabled, configs);
  const dayMap = new Map<string, AdPoint>();
  dates.forEach((date) => dayMap.set(date, { date, adCost: 0, adGmv: 0, storeGmv: 0 }));
  rangeRows.forEach((row) => {
    const point = dayMap.get(row.date);
    if (!point) return;
    point.adCost += row.adCost;
    point.adGmv += row.adGmv;
    point.storeGmv += row.storeGmv - (exclusion.byDay.get(`${row.storeId}|${row.date}`) || 0);
  });
  const points = Array.from(dayMap.values()).map((point) => ({
    ...point,
    adCost: Math.round(point.adCost * 100) / 100,
    adGmv: Math.round(point.adGmv * 100) / 100,
    storeGmv: Math.round(point.storeGmv * 100) / 100,
  }));

  const curSum = sumRange(rangeRows);
  const storeGmvCur = Math.max(0, curSum.storeGmv - exclusion.gmv - exclusion.manualTotal);
  const adRatioCur = ratioOf(curSum.adGmv, storeGmvCur);
  const roasCur = roasOf(curSum.adGmv, curSum.adCost);

  const days = rangeDays(filters.from, filters.to);
  const prevTo = addDays(filters.from, -1);
  const prevFrom = addDays(prevTo, -(days - 1));
  const prevRows = AD_DAILY.filter((row) => scopeIds.includes(row.storeId) && row.date >= prevFrom && row.date <= prevTo);
  const prevExclusion = resolveExclusions(prevFrom, prevTo, scopeIds, excludeEnabled, configs);
  const prevSum = sumRange(prevRows);
  const storeGmvPrev = Math.max(0, prevSum.storeGmv - prevExclusion.gmv - prevExclusion.manualTotal);

  const kpis: AdKpiCard[] = [
    { key: 'adCost', label: '广告消耗', format: 'money', goodWhenUp: false, hint: '区间内所有链接的广告花费之和', value: curSum.adCost, prev: prevSum.adCost },
    { key: 'adGmv', label: '广告 GMV', format: 'money', goodWhenUp: true, hint: '广告商品维度成交额之和', value: curSum.adGmv, prev: prevSum.adGmv },
    { key: 'storeGmv', label: '整店 GMV', format: 'money', goodWhenUp: true, hint: '店铺成交额之和', value: storeGmvCur, prev: storeGmvPrev },
    { key: 'adRatio', label: '广告 GMV 占比', format: 'percent', goodWhenUp: true, hint: '广告 GMV/整店 GMV', value: adRatioCur, prev: ratioOf(prevSum.adGmv, storeGmvPrev) },
    { key: 'roas', label: 'ROAS', format: 'roas', goodWhenUp: true, hint: '广告 GMV/广告消耗', value: roasCur, prev: roasOf(prevSum.adGmv, prevSum.adCost) },
  ];

  return {
    points,
    kpis,
    excludedGmv: exclusion.gmv,
    excludedCount: exclusion.count,
    manualTotal: exclusion.manualTotal,
    scopeLabel,
  };
}

export function fmtMoney(value: number): string {
  const fixed = Math.abs(value).toFixed(2);
  const [whole, decimal] = fixed.split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${value < 0 ? '-' : ''}$${grouped}.${decimal}`;
}

export function fmtInt(value: number): string {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function fmtAxis(value: number): string {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${value.toFixed(0)}`;
}

export function fmtKpiValue(card: AdKpiCard, value: number | null): string {
  if (value === null) return '-';
  if (card.format === 'money') return fmtMoney(value);
  if (card.format === 'roas') return `${value.toFixed(2)}x`;
  return `${(value * 100).toFixed(1)}%`;
}

export function deltaOf(card: AdKpiCard): number | null {
  if (card.value === null || card.prev === null || card.prev === 0) return null;
  if (card.format === 'percent') return card.value - card.prev;
  return (card.value - card.prev) / card.prev;
}

export function deltaText(card: AdKpiCard): string {
  const delta = deltaOf(card);
  if (delta === null) return '-';
  if (Math.abs(delta) < 0.0005) return '持平';
  const arrow = delta > 0 ? '↑' : '↓';
  if (card.format === 'percent') return `${arrow} ${(Math.abs(delta) * 100).toFixed(1)} 个百分点`;
  return `${arrow} ${(Math.abs(delta) * 100).toFixed(1)}%`;
}

export function deltaTone(card: AdKpiCard): string {
  const delta = deltaOf(card);
  if (delta === null || Math.abs(delta) < 0.0005) return 'is-flat';
  return delta > 0 === card.goodWhenUp ? 'is-good' : 'is-bad';
}

export function adChartValue(point: AdPoint, key: string): number {
  if (key === 'adGmv') return point.adGmv;
  if (key === 'storeGmv') return point.storeGmv;
  if (key === 'adRatio') return point.storeGmv > 0 ? (point.adGmv / point.storeGmv) * 100 : 0;
  if (key === 'roas') return point.adCost > 0 ? point.adGmv / point.adCost : 0;
  return point.adCost;
}

export function formatAdValue(key: string, value: number): string {
  if (key === 'adRatio') return `${value.toFixed(1)}%`;
  if (key === 'roas') return `${value.toFixed(2)}x`;
  return fmtMoney(value);
}

export function formatAdAxis(key: string, value: number): string {
  if (key === 'adRatio') return `${value}%`;
  if (key === 'roas') return String(value);
  return fmtAxis(value);
}
