import { LINKS, STORES } from './catalog';
import { REPORT_TO, addDays, eachDay } from './mock';
import type {
  Acc,
  AdDailyRow,
  Filters,
  KpiCard,
  LinkRow,
  OrderItemDailyRow,
  StoreDailyRow,
  StoreExclusion,
  StoreRow,
  TrendPoint,
} from './types';

export const EMPTY_ACC: Acc = { adCost: 0, adGmv: 0, adOrders: 0, storeGmv: 0, linkGmv: 0 };

function inRange(day: string, from: string, to: string): boolean {
  return day >= from && day <= to;
}

export function previousRange(from: string, to: string): { from: string; to: string } {
  const span = Math.round((new Date(`${to}T00:00:00Z`).getTime() - new Date(`${from}T00:00:00Z`).getTime()) / 86400000) + 1;
  return { from: addDays(from, -span), to: addDays(from, -1) };
}

export function filterAd(rows: AdDailyRow[], filters: Filters): AdDailyRow[] {
  return rows.filter(
    (row) =>
      (filters.storeId === null || row.storeId === filters.storeId) &&
      inRange(row.dateline, filters.from, filters.to),
  );
}

export function filterOrder(rows: OrderItemDailyRow[], filters: Filters): OrderItemDailyRow[] {
  return rows.filter(
    (row) => (filters.storeId === null || row.storeId === filters.storeId) && inRange(row.statDate, filters.from, filters.to),
  );
}

export function filterStore(rows: StoreDailyRow[], filters: Filters): StoreDailyRow[] {
  return rows.filter(
    (row) => (filters.storeId === null || row.storeId === filters.storeId) && inRange(row.statDate, filters.from, filters.to),
  );
}

export function accOf(
  ads: AdDailyRow[],
  orders: OrderItemDailyRow[],
  stores: StoreDailyRow[],
  storeGmvTotal?: number,
): Acc {
  return {
    adCost: ads.reduce((sum, row) => sum + row.costUsd, 0),
    adGmv: ads.reduce((sum, row) => sum + row.adGmv, 0),
    adOrders: ads.reduce((sum, row) => sum + row.orders, 0),
    storeGmv:
      storeGmvTotal ?? stores.reduce((sum, row) => sum + row.confirmGmv, 0),
    linkGmv: orders.reduce((sum, row) => sum + row.gmv, 0),
  };
}

/* ===== 补单剔除 ===== */

export interface ExclusionResult {
  excludedKeys: Set<string>;
  excludedByDay: Map<string, number>;
  excludedGmvByStore: Map<number, number>;
  excludedCountByStore: Map<number, number>;
  manualByStore: Map<number, number>;
  excludedGmv: number;
  excludedCount: number;
  manualTotal: number;
}

const rowKey = (row: OrderItemDailyRow) => `${row.storeId}|${row.orderNo}`;

export function resolveExclusions(
  orders: OrderItemDailyRow[],
  configs: StoreExclusion[],
  enabled: boolean,
): ExclusionResult {
  const result: ExclusionResult = {
    excludedKeys: new Set<string>(),
    excludedByDay: new Map<string, number>(),
    excludedGmvByStore: new Map<number, number>(),
    excludedCountByStore: new Map<number, number>(),
    manualByStore: new Map<number, number>(),
    excludedGmv: 0,
    excludedCount: 0,
    manualTotal: 0,
  };
  if (!enabled) return result;

  configs.forEach((cfg) => {
    if (cfg.manualAmount > 0) {
      result.manualByStore.set(cfg.storeId, cfg.manualAmount);
      result.manualTotal += cfg.manualAmount;
    }
  });

  orders.forEach((row) => {
    const cfg = configs.find((item) => item.storeId === row.storeId);
    if (!cfg) return;
    const hit =
      row.labels.some((label) => cfg.excludeLabelIds.includes(label)) ||
      cfg.manualOrderNos.includes(row.orderNo);
    if (!hit) return;
    result.excludedKeys.add(rowKey(row));
    result.excludedGmv += row.gmv;
    result.excludedCount += 1;
    result.excludedGmvByStore.set(row.storeId, (result.excludedGmvByStore.get(row.storeId) ?? 0) + row.gmv);
    result.excludedCountByStore.set(row.storeId, (result.excludedCountByStore.get(row.storeId) ?? 0) + 1);
    const dayKey = `${row.storeId}|${row.statDate}`;
    result.excludedByDay.set(dayKey, (result.excludedByDay.get(dayKey) ?? 0) + row.gmv);
  });

  return result;
}

/** 剔除后的整店 GMV 合计（当前筛选范围内） */
export function storeGmvTotalOf(stores: StoreDailyRow[], exclusion: ExclusionResult | null): number {
  const raw = stores.reduce((sum, row) => sum + row.confirmGmv, 0);
  if (!exclusion) return raw;
  return Math.max(0, raw - exclusion.excludedGmv - exclusion.manualTotal);
}

/** 剔除后的单店 GMV */
export function storeGmvOfStore(
  stores: StoreDailyRow[],
  storeId: number,
  exclusion: ExclusionResult | null,
): number {
  const raw = stores.filter((row) => row.storeId === storeId).reduce((sum, row) => sum + row.confirmGmv, 0);
  if (!exclusion) return raw;
  const cut = (exclusion.excludedGmvByStore.get(storeId) ?? 0) + (exclusion.manualByStore.get(storeId) ?? 0);
  return Math.max(0, raw - cut);
}

export function ratioOf(acc: Acc): { adRatio: number | null; roas: number | null } {
  return {
    adRatio: acc.storeGmv > 0 ? acc.adGmv / acc.storeGmv : null,
    roas: acc.adCost > 0 ? acc.adGmv / acc.adCost : null,
  };
}

function relative(cur: number, prev: number): number | null {
  if (!Number.isFinite(prev) || prev === 0) return null;
  return (cur - prev) / prev;
}

/** 占比类用百分点差，其余用相对变化 */
function diffOf(format: KpiCard['format'], cur: number | null, prev: number | null): number | null {
  if (cur === null || prev === null) return null;
  if (format === 'percent') return cur - prev;
  return relative(cur, prev);
}

export interface SummaryInput {
  ads: AdDailyRow[];
  orders: OrderItemDailyRow[];
  stores: StoreDailyRow[];
  storeGmvTotal?: number;
}

export function buildKpis(data: SummaryInput, prev: SummaryInput): KpiCard[] {
  const cur = accOf(data.ads, data.orders, data.stores, data.storeGmvTotal);
  const before = accOf(prev.ads, prev.orders, prev.stores, prev.storeGmvTotal);
  const curRatio = ratioOf(cur);
  const prevRatio = ratioOf(before);

  const mk = (
    key: string,
    label: string,
    value: number | null,
    previous: number | null,
    format: KpiCard['format'],
    goodWhenUp: boolean,
    hint: string,
  ): KpiCard => ({
    key,
    label,
    value,
    prev: previous,
    delta: diffOf(format, value, previous),
    format,
    goodWhenUp,
    hint,
  });

  return [
    mk('adCost', '广告消耗', cur.adCost, before.adCost, 'money', false, '区间内所有链接的广告花费之和'),
    mk('adGmv', '广告 GMV', cur.adGmv, before.adGmv, 'money', true, '广告带来的成交额，来自广告商品维度报表'),
    mk('storeGmv', '整店 GMV', cur.storeGmv, before.storeGmv, 'money', true, '店铺成交金额，来自店铺经营数据'),
    mk(
      'adRatio',
      '广告 GMV 占比',
      curRatio.adRatio,
      prevRatio.adRatio,
      'percent',
      true,
      '广告 GMV ÷ 整店 GMV，衡量这家店/店群对广告的依赖程度',
    ),
    mk('roas', 'ROAS', curRatio.roas, prevRatio.roas, 'roas', true, '广告 GMV ÷ 广告消耗'),
  ];
}

export function buildStoreRows(
  ads: AdDailyRow[],
  orders: OrderItemDailyRow[],
  stores: StoreDailyRow[],
  exclusion: ExclusionResult | null,
): StoreRow[] {
  return STORES.map((store) => {
    const acc = accOf(
      ads.filter((row) => row.storeId === store.storeId),
      orders.filter((row) => row.storeId === store.storeId),
      stores.filter((row) => row.storeId === store.storeId),
      storeGmvOfStore(stores, store.storeId, exclusion),
    );
    const { adRatio, roas } = ratioOf(acc);
    return {
      key: String(store.storeId),
      storeId: store.storeId,
      storeName: store.storeName,
      aliasName: store.aliasName,
      ...acc,
      adRatio,
      roas,
      adCostDelta: null,
      adGmvDelta: null,
      storeGmvDelta: null,
      adRatioDelta: null,
      roasDelta: null,
    };
  });
}

export function buildTrend(
  filters: Filters,
  ads: AdDailyRow[],
  stores: StoreDailyRow[],
  exclusion?: ExclusionResult | null,
): TrendPoint[] {
  const byDay = new Map<string, TrendPoint>();
  eachDay(filters.from, filters.to).forEach((date) => {
    byDay.set(date, { date, adCost: 0, adGmv: 0, storeGmv: 0 });
  });
  ads.forEach((row) => {
    const point = byDay.get(row.dateline);
    if (!point) return;
    point.adCost += row.costUsd;
    point.adGmv += row.adGmv;
  });
  stores.forEach((row) => {
    const point = byDay.get(row.statDate);
    if (!point) return;
    const cut = exclusion?.excludedByDay.get(`${row.storeId}|${row.statDate}`) ?? 0;
    point.storeGmv += row.confirmGmv - cut;
  });
  return Array.from(byDay.values()).map((point) => ({
    ...point,
    adCost: Math.round(point.adCost * 100) / 100,
    adGmv: Math.round(point.adGmv * 100) / 100,
    storeGmv: Math.round(point.storeGmv * 100) / 100,
  }));
}

export function buildLinkRows(filters: Filters, ads: AdDailyRow[], orders: OrderItemDailyRow[]): LinkRow[] {
  const storeId = filters.storeId;
  const links = storeId === null ? LINKS : LINKS.filter((link) => link.storeId === storeId);

  return links.map((link) => {
    const linkAds = ads.filter((row) => row.itemCode === link.itemCode);
    const linkOrders = orders.filter((row) => row.itemCode === link.itemCode);
    const adCost = Math.round(linkAds.reduce((sum, row) => sum + row.costUsd, 0) * 100) / 100;
    const adGmv = Math.round(linkAds.reduce((sum, row) => sum + row.adGmv, 0) * 100) / 100;
    const adOrders = linkAds.reduce((sum, row) => sum + row.orders, 0);
    const linkGmv = Math.round(linkOrders.reduce((sum, row) => sum + row.gmv, 0) * 100) / 100;
    return {
      key: `${link.storeId}-${link.itemCode}`,
      storeId: link.storeId,
      itemCode: link.itemCode,
      itemName: link.itemName,
      imgUrl: link.imgUrl,
      categoryName: link.categoryName,
      adCost,
      adGmv,
      adOrders,
      linkGmv,
      adRatio: linkGmv > 0 && (adCost > 0 || adGmv > 0) ? adGmv / linkGmv : null,
      roas: adCost > 0 ? adGmv / adCost : null,
      hasAd: adCost > 0 || adGmv > 0,
    };
  });
}

export interface RangeCompare {
  label: string;
  days: number;
  adCost: number;
  adGmv: number;
  linkGmv: number;
  adRatio: number | null;
  roas: number | null;
}

const COMPARE_DAYS = [1, 3, 7, 15, 30];

export function buildRangeCompare(
  itemCode: string,
  storeId: number,
  ads: AdDailyRow[],
  orders: OrderItemDailyRow[],
): RangeCompare[] {
  return COMPARE_DAYS.map((days) => {
    const to = REPORT_TO;
    const from = addDays(to, -(days - 1));
    const rangeAds = ads.filter((row) => row.itemCode === itemCode && row.storeId === storeId && inRange(row.dateline, from, to));
    const rangeOrders = orders.filter(
      (row) => row.itemCode === itemCode && row.storeId === storeId && inRange(row.statDate, from, to),
    );
    const adCost = Math.round(rangeAds.reduce((sum, row) => sum + row.costUsd, 0) * 100) / 100;
    const adGmv = Math.round(rangeAds.reduce((sum, row) => sum + row.adGmv, 0) * 100) / 100;
    const linkGmv = Math.round(rangeOrders.reduce((sum, row) => sum + row.gmv, 0) * 100) / 100;
    return {
      label: `近 ${days} 天`,
      days,
      adCost,
      adGmv,
      linkGmv,
      adRatio: linkGmv > 0 ? adGmv / linkGmv : null,
      roas: adCost > 0 ? adGmv / adCost : null,
    };
  });
}

export function buildLinkTrend(
  itemCode: string,
  storeId: number,
  ads: AdDailyRow[],
  orders: OrderItemDailyRow[],
  from: string,
  to: string,
): TrendPoint[] {
  const byDay = new Map<string, TrendPoint>();
  eachDay(from, to).forEach((date) => byDay.set(date, { date, adCost: 0, adGmv: 0, storeGmv: 0 }));
  ads.forEach((row) => {
    if (row.itemCode !== itemCode || row.storeId !== storeId) return;
    const point = byDay.get(row.dateline);
    if (!point) return;
    point.adCost += row.costUsd;
    point.adGmv += row.adGmv;
  });
  orders.forEach((row) => {
    if (row.itemCode !== itemCode || row.storeId !== storeId) return;
    const point = byDay.get(row.statDate);
    if (!point) return;
    point.storeGmv += row.gmv;
  });
  return Array.from(byDay.values()).map((point) => ({
    ...point,
    adCost: Math.round(point.adCost * 100) / 100,
    adGmv: Math.round(point.adGmv * 100) / 100,
    storeGmv: Math.round(point.storeGmv * 100) / 100,
  }));
}

export function sumAcc(rows: Array<{ adCost: number; adGmv: number; adOrders: number; linkGmv: number }>): {
  adCost: number;
  adGmv: number;
  adOrders: number;
  linkGmv: number;
  adRatio: number | null;
  roas: number | null;
} {
  const total = rows.reduce(
    (acc, row) => ({
      adCost: acc.adCost + row.adCost,
      adGmv: acc.adGmv + row.adGmv,
      adOrders: acc.adOrders + row.adOrders,
      linkGmv: acc.linkGmv + row.linkGmv,
    }),
    { adCost: 0, adGmv: 0, adOrders: 0, linkGmv: 0 },
  );
  return {
    ...total,
    adRatio: total.linkGmv > 0 ? total.adGmv / total.linkGmv : null,
    roas: total.adCost > 0 ? total.adGmv / total.adCost : null,
  };
}
