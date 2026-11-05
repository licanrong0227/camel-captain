import { AD_PRODUCTS, PRODUCT_MAP, PRODUCTS_BY_STORE, STORE_MAP, STORES, storeNameOf } from './catalog';
import { AD_DETAIL_FROM, DATA_FROM, REPORT_TO, addDays, eachDay, getDataset } from './generate';
import { STORE_METRIC_KEYS, type MetricKey } from './metrics';
import type {
  Acc,
  AdDailyRow,
  AdFilters,
  AdKpiCard,
  AdTrendPoint,
  AdType,
  ExclusionConfig,
  ExclusionResult,
  ItemRow,
  Metrics,
  OrderRow,
  PlanRow,
  ProdReportRow,
  StorePeriodKey,
  WordOrder,
  WordRow,
} from './types';

const EMPTY_ACC: Acc = { imp: 0, click: 0, cost: 0, orders: 0, gmv: 0 };

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function addAcc(target: Acc, row: ProdReportRow): Acc {
  return {
    imp: target.imp + row.imp,
    click: target.click + row.click,
    cost: target.cost + row.cost,
    orders: target.orders + row.orders,
    gmv: target.gmv + row.gmv,
  };
}

export function mergeAcc(rows: Acc[]): Acc {
  return rows.reduce<Acc>(
    (acc, row) => ({
      imp: acc.imp + row.imp,
      click: acc.click + row.click,
      cost: acc.cost + row.cost,
      orders: acc.orders + row.orders,
      gmv: acc.gmv + row.gmv,
    }),
    { ...EMPTY_ACC },
  );
}

export function finalize(acc: Acc): Metrics {
  return {
    imp: acc.imp,
    click: acc.click,
    cost: round2(acc.cost),
    orders: acc.orders,
    gmv: round2(acc.gmv),
    ctr: acc.imp > 0 ? acc.click / acc.imp : null,
    cpc: acc.click > 0 ? acc.cost / acc.click : null,
    cvr: acc.click > 0 ? acc.orders / acc.click : null,
    cpa: acc.orders > 0 ? acc.cost / acc.orders : null,
    roas: acc.cost > 0 ? acc.gmv / acc.cost : null,
  };
}

export function accOfProd(rows: ProdReportRow[]): Acc {
  return rows.reduce<Acc>((acc, row) => addAcc(acc, row), { ...EMPTY_ACC });
}

export function filterProd(rows: ProdReportRow[], filters: AdFilters): ProdReportRow[] {
  const set = new Set(filters.storeIds);
  return rows.filter(
    (row) =>
      set.has(row.storeId) &&
      (!filters.adType || row.adType === filters.adType) &&
      row.date >= filters.from &&
      row.date <= filters.to,
  );
}

export function filterOrder(rows: OrderRow[], filters: AdFilters): OrderRow[] {
  const set = new Set(filters.storeIds);
  return rows.filter(
    (row) =>
      !row.supplement &&
      set.has(row.storeId) &&
      (!filters.adType || row.adType === filters.adType) &&
      row.date >= filters.from &&
      row.date <= filters.to,
  );
}

const AD_TYPE_ORDER: AdType[] = ['ppc', 'prodauto', 'shopauto'];

function sortAdTypes(set: Set<AdType>): AdType[] {
  return AD_TYPE_ORDER.filter((type) => set.has(type));
}

function flags(metrics: Metrics) {
  return {
    zeroConv: metrics.cost > 0 && metrics.orders === 0,
    lowRoas: metrics.cost > 0 && metrics.orders > 0 && metrics.roas !== null && metrics.roas < 1,
  };
}

export function buildItemRows(rows: ProdReportRow[]): ItemRow[] {
  const groups = new Map<string, { storeId: number; itemcode: string; acc: Acc; types: Set<AdType> }>();
  rows.forEach((row) => {
    const key = `${row.storeId}__${row.itemcode}`;
    const current = groups.get(key);
    if (current) {
      current.acc = addAcc(current.acc, row);
      current.types.add(row.adType);
      return;
    }
    groups.set(key, {
      storeId: row.storeId,
      itemcode: row.itemcode,
      acc: addAcc({ ...EMPTY_ACC }, row),
      types: new Set([row.adType]),
    });
  });
  return Array.from(groups.entries()).map(([key, group]) => {
    const metrics = finalize(group.acc);
    const product = PRODUCT_MAP[group.itemcode];
    return {
      key,
      storeId: group.storeId,
      storeName: storeNameOf(group.storeId),
      itemcode: group.itemcode,
      name: product?.name ?? `商品 ${group.itemcode}`,
      thumb: product?.thumb ?? '',
      adTypes: sortAdTypes(group.types),
      ...metrics,
      ...flags(metrics),
    };
  });
}

export function buildPlanRows(rows: ProdReportRow[]): PlanRow[] {
  const groups = new Map<string, { storeId: number; adType: AdType; planName: string; groupName: string; acc: Acc }>();
  rows.forEach((row) => {
    const key = `${row.storeId}__${row.adType}__${row.planName}__${row.groupName}`;
    const current = groups.get(key);
    if (current) {
      current.acc = addAcc(current.acc, row);
      return;
    }
    groups.set(key, {
      storeId: row.storeId,
      adType: row.adType,
      planName: row.planName,
      groupName: row.groupName,
      acc: addAcc({ ...EMPTY_ACC }, row),
    });
  });
  return Array.from(groups.entries()).map(([key, group]) => {
    const metrics = finalize(group.acc);
    return {
      key,
      storeId: group.storeId,
      storeName: storeNameOf(group.storeId),
      adType: group.adType,
      planName: group.planName,
      groupName: group.groupName,
      ...metrics,
      ...flags(metrics),
    };
  });
}

interface WordDraft {
  storeId: number;
  word: string;
  types: Set<AdType>;
  gmv: number;
  itemcodes: Set<string>;
  orders: Map<string, WordOrder>;
}

export function buildWordRows(rows: OrderRow[]): WordRow[] {
  const groups = new Map<string, WordDraft>();
  rows.forEach((row) => {
    const word = row.searchWord.trim();
    const key = `${row.storeId}__${word}`;
    let group = groups.get(key);
    if (!group) {
      group = { storeId: row.storeId, word, types: new Set(), gmv: 0, itemcodes: new Set(), orders: new Map() };
      groups.set(key, group);
    }
    group.types.add(row.adType);
    group.gmv += row.gmv;
    group.itemcodes.add(row.orderItemcode);
    const existing = group.orders.get(row.orderNo);
    if (existing) {
      existing.amount = round2(existing.amount + row.gmv);
      existing.items.push({ code: row.orderItemcode, name: row.orderProductName, amount: row.gmv });
    } else {
      group.orders.set(row.orderNo, {
        orderNo: row.orderNo,
        date: row.date,
        amount: row.gmv,
        items: [{ code: row.orderItemcode, name: row.orderProductName, amount: row.gmv }],
      });
    }
  });
  return Array.from(groups.entries()).map(([key, group]) => {
    const orders = Array.from(group.orders.values()).sort((a, b) => b.amount - a.amount);
    const lastDate = orders.reduce((latest, order) => (order.date > latest ? order.date : latest), '');
    return {
      key,
      storeId: group.storeId,
      storeName: storeNameOf(group.storeId),
      word: group.word,
      adTypes: sortAdTypes(group.types),
      orderCount: orders.length,
      gmv: round2(group.gmv),
      itemCount: group.itemcodes.size,
      lastDate,
      orders,
    };
  });
}

export function buildAdTrend(rows: ProdReportRow[], from: string, to: string): AdTrendPoint[] {
  const byDay = new Map<string, Acc>();
  rows.forEach((row) => {
    const acc = byDay.get(row.date) ?? { ...EMPTY_ACC };
    byDay.set(row.date, addAcc(acc, row));
  });
  return eachDay(from, to).map((day) => {
    const raw = byDay.get(day) ?? { ...EMPTY_ACC };
    return {
      date: day,
      cost: round2(raw.cost),
      gmv: round2(raw.gmv),
      orders: raw.orders,
      imp: raw.imp,
      click: raw.click,
      roas: raw.cost > 0 ? raw.gmv / raw.cost : null,
    };
  });
}

export function rangeDays(from: string, to: string): number {
  if (!from || !to || to < from) return 0;
  return Math.round((new Date(`${to}T00:00:00Z`).getTime() - new Date(`${from}T00:00:00Z`).getTime()) / 86400000) + 1;
}

export function previousRange(from: string, to: string): { from: string; to: string } {
  const span = rangeDays(from, to);
  return { from: addDays(from, -span), to: addDays(from, -1) };
}

export function presetRange(days: number, end = REPORT_TO): { from: string; to: string } {
  return { from: addDays(end, -(days - 1)), to: end };
}

export function validateAdRange(from: string, to: string): string {
  if (!from || !to) return '请选择完整的起止日期';
  if (to < from) return '结束日期不能早于开始日期';
  if (to > REPORT_TO) return `广告数据截至 ${REPORT_TO.replace(/-/g, '/')}，区间不能超过这一天`;
  if (from < AD_DETAIL_FROM) return `广告明细仅保留 ${AD_DETAIL_FROM.replace(/-/g, '/')} 之后的数据`;
  if (rangeDays(from, to) > 31) return '单次查询最长 31 天，请缩短日期范围';
  return '';
}

export function validateStoreRange(from: string, to: string): string {
  if (!from || !to) return '请选择完整的起止日期';
  if (to < from) return '结束日期不能早于开始日期';
  if (to > REPORT_TO) return `店铺数据截至 ${REPORT_TO.replace(/-/g, '/')}，区间不能超过这一天`;
  if (from < DATA_FROM) return `店铺报表仅保留 ${DATA_FROM.replace(/-/g, '/')} 之后的数据`;
  if (rangeDays(from, to) > 180) return '单次查询最长 180 天，请缩短日期范围';
  return '';
}

function pairDelta(current: number, previous: number | null): number | null {
  if (previous === null || !Number.isFinite(previous) || previous === 0) return null;
  return (current - previous) / previous;
}

export function buildAdKpis(current: Metrics, previous: Metrics, storeGmv: number, prevStoreGmv: number): AdKpiCard[] {
  const aovCur = current.orders > 0 ? current.gmv / current.orders : 0;
  const aovPrev = previous.orders > 0 ? previous.gmv / previous.orders : 0;
  const ratioCur = storeGmv > 0 ? current.gmv / storeGmv : null;
  const ratioPrev = prevStoreGmv > 0 ? previous.gmv / prevStoreGmv : null;
  const entries: Array<Omit<AdKpiCard, 'delta' | 'prev'> & { rawPrev: number | null }> = [
    { key: 'cost', label: '广告消耗', hint: '区间内所有链接的广告花费之和', format: 'money', main: true, value: current.cost, rawPrev: previous.cost, goodWhenUp: false },
    { key: 'gmv', label: '广告 GMV', hint: '广告商品维度成交额之和', format: 'money', main: true, value: current.gmv, rawPrev: previous.gmv, goodWhenUp: true },
    { key: 'storeGmv', label: '整店 GMV', hint: '店铺成交额之和，按当前 GMV 口径', format: 'money', main: true, value: storeGmv, rawPrev: prevStoreGmv, goodWhenUp: true },
    { key: 'ratio', label: '广告 GMV 占比', hint: '广告 GMV / 整店 GMV', format: 'pct', main: true, value: ratioCur, rawPrev: ratioPrev, goodWhenUp: true },
    { key: 'roas', label: '投产比', hint: '广告 GMV / 广告消耗（ROAS）', format: 'roas', main: true, value: current.roas, rawPrev: previous.roas, goodWhenUp: true },
    { key: 'orders', label: '广告订单数', hint: '广告商品维度成交订单数', format: 'int', main: true, value: current.orders, rawPrev: previous.orders, goodWhenUp: true },
    { key: 'imp', label: '曝光量', hint: '广告曝光次数之和', format: 'int', main: false, value: current.imp, rawPrev: previous.imp, goodWhenUp: true },
    { key: 'click', label: '点击量', hint: '广告点击次数之和', format: 'int', main: false, value: current.click, rawPrev: previous.click, goodWhenUp: true },
    { key: 'ctr', label: '点击率', hint: '点击量 / 曝光量', format: 'pct', main: false, value: current.ctr, rawPrev: previous.ctr, goodWhenUp: true },
    { key: 'cpc', label: '平均点击单价', hint: '广告消耗 / 点击量', format: 'money', main: false, value: current.cpc, rawPrev: previous.cpc, goodWhenUp: false },
    { key: 'cvr', label: '转化率', hint: '广告订单数 / 点击量', format: 'pct', main: false, value: current.cvr, rawPrev: previous.cvr, goodWhenUp: true },
    { key: 'aov', label: '客单价', hint: '广告 GMV / 广告订单数', format: 'money', main: false, value: aovCur || null, rawPrev: aovPrev || null, goodWhenUp: true },
  ];
  return entries.map(({ rawPrev, ...entry }) => ({
    ...entry,
    prev: rawPrev,
    delta: entry.value === null ? null : pairDelta(entry.value, rawPrev),
  }));
}

export function resolveExclusions(
  configs: ExclusionConfig[],
  enabled: boolean,
  from: string,
  to: string,
  storeIds: number[],
): ExclusionResult {
  const byDay = new Map<string, number>();
  if (!enabled) return { byDay, gmv: 0, count: 0, manualTotal: 0 };
  const set = new Set(storeIds);
  let gmv = 0;
  let count = 0;
  let manualTotal = 0;
  configs.forEach((config) => {
    if (set.has(config.storeId)) manualTotal += config.manualAmount || 0;
  });
  getDataset().supplementOrders.forEach((order) => {
    if (!set.has(order.storeId) || order.date < from || order.date > to) return;
    const config = configs.find((item) => item.storeId === order.storeId);
    if (!config) return;
    const hit = order.labels.some((label) => config.excludeLabelIds.includes(label)) || config.manualOrderNos.includes(order.orderNo);
    if (!hit) return;
    gmv += order.gmv;
    count += 1;
    byDay.set(order.date, round2((byDay.get(order.date) ?? 0) + order.gmv));
  });
  if (manualTotal > 0 && REPORT_TO >= from && REPORT_TO <= to) {
    byDay.set(REPORT_TO, round2((byDay.get(REPORT_TO) ?? 0) + manualTotal));
    gmv += manualTotal;
  }
  return { byDay, gmv: round2(gmv), count, manualTotal };
}

function exclusionByStore(
  storeIds: number[],
  from: string,
  to: string,
  enabled: boolean,
  configs: ExclusionConfig[],
): Map<number, number> {
  const result = new Map<number, number>();
  if (!enabled) return result;
  const set = new Set(storeIds);
  configs.forEach((config) => {
    if (!set.has(config.storeId)) return;
    let total = config.manualAmount || 0;
    const manualDay = REPORT_TO >= from && REPORT_TO <= to;
    getDataset().supplementOrders.forEach((order) => {
      if (order.storeId !== config.storeId || order.date < from || order.date > to) return;
      const hit = order.labels.some((label) => config.excludeLabelIds.includes(label)) || config.manualOrderNos.includes(order.orderNo);
      if (hit) total += order.gmv;
    });
    result.set(config.storeId, round2(manualDay ? total : total - (config.manualAmount || 0)));
  });
  return result;
}

export interface StoreSnapshot {
  dates: string[];
  summary: Record<MetricKey, number>;
  series: Record<MetricKey, number[]>;
  daysAvailable: number;
}

function emptyRecord(): Record<MetricKey, number> {
  return STORE_METRIC_KEYS.reduce((acc, key) => {
    acc[key] = 0;
    return acc;
  }, {} as Record<MetricKey, number>);
}

function emptySeries(): Record<MetricKey, number[]> {
  return STORE_METRIC_KEYS.reduce((acc, key) => {
    acc[key] = [];
    return acc;
  }, {} as Record<MetricKey, number[]>);
}

interface DayTotals {
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
  obWeighted: number;
  obWeight: number;
}

function emptyDay(): DayTotals {
  return {
    gmv: 0, buyers: 0, orders: 0, qty: 0,
    startedGmv: 0, startedBuyers: 0, startedOrders: 0,
    pv: 0, uv: 0, expo: 0,
    addcartUv: 0, addcartIc: 0, addfavUv: 0,
    obWeighted: 0, obWeight: 0,
  };
}

function finalizeDay(day: DayTotals, excluded: number): Record<MetricKey, number> {
  const gmv = Math.max(0, round2(day.gmv - excluded));
  return {
    confirmGmv: gmv,
    confirmBuyerNum: day.buyers,
    dealTransRate: day.uv > 0 ? day.buyers / day.uv : NaN,
    unitPrice: day.buyers > 0 ? gmv / day.buyers : NaN,
    obRate: day.obWeight > 0 ? day.obWeighted / day.obWeight : NaN,
    confirmRfxNum: day.orders,
    confirmProdQt: day.qty,
    startedGmv: round2(day.startedGmv),
    startedBuyerNum: day.startedBuyers,
    startedTransRate: day.uv > 0 ? day.startedBuyers / day.uv : NaN,
    startedRfxNum: day.startedOrders,
    pdPv: day.pv,
    pdUv: day.uv,
    expoPv: day.expo,
    avgUvValue: day.uv > 0 ? gmv / day.uv : NaN,
    addcartUv: day.addcartUv,
    addcartIcNum: day.addcartIc,
    addfavUv: day.addfavUv,
  };
}

export function buildStoreSnapshot(
  storeIds: number[],
  countryId: string,
  from: string,
  to: string,
  exclusionEnabled: boolean,
  configs: ExclusionConfig[],
): StoreSnapshot {
  const dates = eachDay(from, to);
  const series = emptySeries();
  const dayMap = new Map<string, DayTotals>();
  const availableDates = new Set<string>();
  const set = new Set(storeIds);
  const exclusion = countryId === 'TOTAL'
    ? resolveExclusions(configs, exclusionEnabled, from, to, storeIds)
    : { byDay: new Map<string, number>() };

  getDataset().storeDaily.forEach((row) => {
    if (!set.has(row.storeId) || row.date < from || row.date > to) return;
    if (countryId !== 'TOTAL' && row.country !== countryId) return;
    availableDates.add(row.date);
    const current = dayMap.get(row.date) ?? emptyDay();
    current.gmv += row.gmv;
    current.buyers += row.buyers;
    current.orders += row.orders;
    current.qty += row.qty;
    current.startedGmv += row.startedGmv;
    current.startedBuyers += row.startedBuyers;
    current.startedOrders += row.startedOrders;
    current.pv += row.pv;
    current.uv += row.uv;
    current.expo += row.expo;
    current.addcartUv += row.addcartUv;
    current.addcartIc += row.addcartIc;
    current.addfavUv += row.addfavUv;
    current.obWeighted += row.obRate * row.buyers;
    current.obWeight += row.buyers;
    dayMap.set(row.date, current);
  });

  dates.forEach((date, index) => {
    const day = finalizeDay(dayMap.get(date) ?? emptyDay(), exclusion.byDay.get(date) ?? 0);
    STORE_METRIC_KEYS.forEach((key) => {
      series[key][index] = day[key];
    });
  });

  const totals = emptyDay();
  dayMap.forEach((day, date) => {
    totals.gmv += Math.max(0, round2(day.gmv - (exclusion.byDay.get(date) ?? 0)));
    totals.buyers += day.buyers;
    totals.orders += day.orders;
    totals.qty += day.qty;
    totals.startedGmv += day.startedGmv;
    totals.startedBuyers += day.startedBuyers;
    totals.startedOrders += day.startedOrders;
    totals.pv += day.pv;
    totals.uv += day.uv;
    totals.expo += day.expo;
    totals.addcartUv += day.addcartUv;
    totals.addcartIc += day.addcartIc;
    totals.addfavUv += day.addfavUv;
    totals.obWeighted += day.obWeighted;
    totals.obWeight += day.obWeight;
  });

  return {
    dates,
    summary: finalizeDay(totals, 0),
    series,
    daysAvailable: availableDates.size,
  };
}

export interface StoreTableRow {
  storeId: number;
  storeName: string;
  alias: string;
  summary: Record<MetricKey, number>;
  daysAvailable: number;
}

export function buildStoreTableRows(
  storeIds: number[],
  countryId: string,
  from: string,
  to: string,
  exclusionEnabled: boolean,
  configs: ExclusionConfig[],
): StoreTableRow[] {
  const set = new Set(storeIds);
  const byStore = new Map<number, { day: DayTotals; dates: Set<string> }>();
  getDataset().storeDaily.forEach((row) => {
    if (!set.has(row.storeId) || row.date < from || row.date > to) return;
    if (countryId !== 'TOTAL' && row.country !== countryId) return;
    const current = byStore.get(row.storeId) ?? { day: emptyDay(), dates: new Set<string>() };
    current.dates.add(row.date);
    current.day.gmv += row.gmv;
    current.day.buyers += row.buyers;
    current.day.orders += row.orders;
    current.day.qty += row.qty;
    current.day.startedGmv += row.startedGmv;
    current.day.startedBuyers += row.startedBuyers;
    current.day.startedOrders += row.startedOrders;
    current.day.pv += row.pv;
    current.day.uv += row.uv;
    current.day.expo += row.expo;
    current.day.addcartUv += row.addcartUv;
    current.day.addcartIc += row.addcartIc;
    current.day.addfavUv += row.addfavUv;
    current.day.obWeighted += row.obRate * row.buyers;
    current.day.obWeight += row.buyers;
    byStore.set(row.storeId, current);
  });
  const excludedByStore = countryId === 'TOTAL'
    ? exclusionByStore(storeIds, from, to, exclusionEnabled, configs)
    : new Map<number, number>();

  return storeIds.map((storeId) => {
    const store = STORE_MAP[storeId];
    const entry = byStore.get(storeId);
    const day = entry?.day ?? emptyDay();
    return {
      storeId,
      storeName: store?.name ?? String(storeId),
      alias: store?.alias ?? '',
      summary: finalizeDay(day, excludedByStore.get(storeId) ?? 0),
      daysAvailable: entry?.dates.size ?? 0,
    };
  });
}

export type HomeTrendPeriod = 'm1' | 'm2' | 'm3' | 'm6';

export interface HomeTrendPoint {
  label: string;
  date: string;
  sales: number;
  qty: number;
  adCost: number;
  adGmv: number;
  roas: number | null;
}

const PERIOD_DAYS: Record<HomeTrendPeriod, number> = { m1: 30, m2: 60, m3: 90, m6: 180 };
const PERIOD_BUCKET: Record<HomeTrendPeriod, 'day' | 'week' | 'month'> = {
  m1: 'day',
  m2: 'week',
  m3: 'week',
  m6: 'month',
};

interface Bucket {
  label: string;
  date: string;
  dates: string[];
}

function buildBuckets(dates: string[], mode: 'day' | 'week' | 'month'): Bucket[] {
  if (mode === 'day') return dates.map((date) => ({ label: date.slice(5).replace('-', '/'), date, dates: [date] }));
  if (mode === 'month') {
    const map = new Map<string, string[]>();
    dates.forEach((date) => {
      const key = date.slice(0, 7);
      map.set(key, [...(map.get(key) ?? []), date]);
    });
    return Array.from(map.entries()).map(([key, list]) => ({
      label: key.replace('-', '/'),
      date: list[list.length - 1],
      dates: list,
    }));
  }
  const buckets: Bucket[] = [];
  for (let index = 0; index < dates.length; index += 7) {
    const list = dates.slice(index, index + 7);
    buckets.push({ label: list[list.length - 1].slice(5).replace('-', '/'), date: list[list.length - 1], dates: list });
  }
  return buckets;
}

function dailyStoreTotals(): Map<string, { gmv: number; qty: number }> {
  const map = new Map<string, { gmv: number; qty: number }>();
  getDataset().storeDaily.forEach((row) => {
    const current = map.get(row.date) ?? { gmv: 0, qty: 0 };
    current.gmv = round2(current.gmv + row.gmv);
    current.qty += row.qty;
    map.set(row.date, current);
  });
  return map;
}

function dailyAdTotals(): Map<string, AdDailyRow> {
  const map = new Map<string, AdDailyRow>();
  getDataset().adDaily.forEach((row) => {
    const current = map.get(row.date) ?? { storeId: 0, date: row.date, adCost: 0, adGmv: 0, imp: 0, click: 0, orders: 0 };
    current.adCost = round2(current.adCost + row.adCost);
    current.adGmv = round2(current.adGmv + row.adGmv);
    current.imp += row.imp;
    current.click += row.click;
    current.orders += row.orders;
    map.set(row.date, current);
  });
  return map;
}

export function buildHomeTrend(
  period: HomeTrendPeriod,
  exclusionEnabled: boolean,
  configs: ExclusionConfig[],
): HomeTrendPoint[] {
  const days = PERIOD_DAYS[period];
  const from = addDays(REPORT_TO, -(days - 1));
  const dates = eachDay(from, REPORT_TO);
  const storeTotals = dailyStoreTotals();
  const adTotals = dailyAdTotals();
  const storeIds = STORES.map((store) => store.id);
  const exclusion = resolveExclusions(configs, exclusionEnabled, from, REPORT_TO, storeIds);

  const buckets = buildBuckets(dates, PERIOD_BUCKET[period]);
  return buckets.map((bucket) => {
    let sales = 0;
    let qty = 0;
    let adCost = 0;
    let adGmv = 0;
    bucket.dates.forEach((date) => {
      const store = storeTotals.get(date);
      sales += (store?.gmv ?? 0) - (exclusion.byDay.get(date) ?? 0);
      qty += store?.qty ?? 0;
      const ad = adTotals.get(date);
      adCost += ad?.adCost ?? 0;
      adGmv += ad?.adGmv ?? 0;
    });
    sales = Math.max(0, round2(sales));
    adCost = round2(adCost);
    adGmv = round2(adGmv);
    const roas = adCost > 0 ? adGmv / adCost : null;
    return { label: bucket.label, date: bucket.date, sales, qty, adCost, adGmv, roas };
  });
}

export interface HomeKpi {
  key: 'sales' | 'orders' | 'qty' | 'adCost' | 'roas';
  label: string;
  value: number | null;
  rate: number | null;
  format: 'money' | 'int' | 'roas';
}

export function buildHomeKpis(exclusionEnabled: boolean, configs: ExclusionConfig[]): HomeKpi[] {
  const storeIds = STORES.map((store) => store.id);
  const today = REPORT_TO;
  const yesterday = addDays(REPORT_TO, -1);
  const todayTotals = buildStoreSnapshot(storeIds, 'TOTAL', today, today, exclusionEnabled, configs).summary;
  const yesterdayTotals = buildStoreSnapshot(storeIds, 'TOTAL', yesterday, yesterday, exclusionEnabled, configs).summary;
  const adToday = getDataset().adDaily.filter((row) => row.date === today);
  const adYesterday = getDataset().adDaily.filter((row) => row.date === yesterday);
  const sumAd = (rows: AdDailyRow[]) => rows.reduce((acc, row) => ({
    cost: acc.cost + row.adCost,
    gmv: acc.gmv + row.adGmv,
  }), { cost: 0, gmv: 0 });
  const todayAd = sumAd(adToday);
  const yesterdayAd = sumAd(adYesterday);
  const todayRoas = todayAd.cost > 0 ? todayAd.gmv / todayAd.cost : null;
  const yesterdayRoas = yesterdayAd.cost > 0 ? yesterdayAd.gmv / yesterdayAd.cost : null;

  return [
    { key: 'sales', label: '当日销售额', value: todayTotals.confirmGmv, rate: pairDelta(todayTotals.confirmGmv, yesterdayTotals.confirmGmv), format: 'money' },
    { key: 'orders', label: '当日订单量', value: todayTotals.confirmRfxNum, rate: pairDelta(todayTotals.confirmRfxNum, yesterdayTotals.confirmRfxNum), format: 'int' },
    { key: 'qty', label: '商品销量', value: todayTotals.confirmProdQt, rate: pairDelta(todayTotals.confirmProdQt, yesterdayTotals.confirmProdQt), format: 'int' },
    { key: 'adCost', label: '广告消耗', value: round2(todayAd.cost), rate: pairDelta(todayAd.cost, yesterdayAd.cost), format: 'money' },
    { key: 'roas', label: '广告投产比', value: todayRoas, rate: pairDelta(todayRoas ?? 0, yesterdayRoas), format: 'roas' },
  ];
}

export interface RankRow {
  rank: number;
  key: string;
  storeId?: number;
  storeName?: string;
  itemcode?: string;
  name?: string;
  thumb?: string;
  color?: string;
  size?: string;
  pattern?: string;
  level?: number;
  score?: number;
  skuCount?: number;
  value: number;
  itemCount?: number;
}

function rankPeriodRange(period: StorePeriodKey): { from: string; to: string } {
  const days = period === 'day' ? 1 : period === 'week' ? 7 : period === 'month' ? 30 : 90;
  return presetRange(days);
}

export function storeSalesRank(
  period: StorePeriodKey,
  exclusionEnabled: boolean,
  configs: ExclusionConfig[],
): RankRow[] {
  const { from, to } = rankPeriodRange(period);
  const storeIds = STORES.map((store) => store.id);
  const totals = new Map<number, number>();
  getDataset().storeDaily.forEach((row) => {
    if (row.date < from || row.date > to) return;
    totals.set(row.storeId, round2((totals.get(row.storeId) ?? 0) + row.gmv));
  });
  const excluded = exclusionByStore(storeIds, from, to, exclusionEnabled, configs);
  return STORES.map((store) => ({
    rank: 0,
    key: String(store.id),
    storeId: store.id,
    storeName: store.name,
    value: Math.max(0, round2((totals.get(store.id) ?? 0) - (excluded.get(store.id) ?? 0))),
  }))
    .sort((a, b) => b.value - a.value || a.storeId! - b.storeId!)
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

export function storeTrafficRank(period: StorePeriodKey): RankRow[] {
  const { from, to } = rankPeriodRange(period);
  const totals = new Map<number, number>();
  getDataset().storeDaily.forEach((row) => {
    if (row.date < from || row.date > to) return;
    totals.set(row.storeId, (totals.get(row.storeId) ?? 0) + row.pv);
  });
  return STORES.map((store) => ({
    rank: 0,
    key: String(store.id),
    storeId: store.id,
    storeName: store.name,
    value: totals.get(store.id) ?? 0,
  }))
    .sort((a, b) => b.value - a.value || a.storeId! - b.storeId!)
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

/** 店铺等级榜：等级从高到低，同等级按能力分从高到低 */
export function levelRank(): RankRow[] {
  return STORES.map((store) => ({
    rank: 0,
    key: String(store.id),
    storeId: store.id,
    storeName: store.name,
    level: store.level,
    score: store.score,
    value: store.score,
  }))
    .sort((a, b) => (b.level ?? 0) - (a.level ?? 0) || (b.score ?? 0) - (a.score ?? 0))
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

export interface SkuSalesRow {
  id: string;
  color: string;
  size: string;
  pattern: string;
  qty: number;
  gmv: number;
  orders: number;
}

function skuWeights(product: NonNullable<(typeof PRODUCT_MAP)[string]>): number[] {
  return product.skus.map((sku, index) => {
    let hash = 0;
    for (let code = 0; code < sku.id.length; code += 1) hash = (hash * 31 + sku.id.charCodeAt(code)) >>> 0;
    return Math.max(0.01, sku.weight * (0.8 + (hash % 40) / 100) * (1 + index / 100));
  });
}

function splitCount(total: number, weights: number[]): number[] {
  const sum = weights.reduce((acc, value) => acc + value, 0) || 1;
  const raw = weights.map((weight) => (total * weight) / sum);
  const floors = raw.map((value) => Math.floor(value));
  let remaining = total - floors.reduce((acc, value) => acc + value, 0);
  const order = raw.map((value, index) => ({ index, frac: value - floors[index] })).sort((a, b) => b.frac - a.frac);
  for (let index = 0; index < remaining; index += 1) floors[order[index % order.length].index] += 1;
  remaining = 0;
  return floors;
}

function splitAmount(total: number, weights: number[]): number[] {
  const cents = Math.round(total * 100);
  const sum = weights.reduce((acc, value) => acc + value, 0) || 1;
  const raw = weights.map((weight) => (cents * weight) / sum);
  const floors = raw.map((value) => Math.floor(value));
  let remaining = cents - floors.reduce((acc, value) => acc + value, 0);
  const order = raw.map((value, index) => ({ index, frac: value - floors[index] })).sort((a, b) => b.frac - a.frac);
  for (let index = 0; index < remaining; index += 1) floors[order[index % order.length].index] += 1;
  remaining = 0;
  return floors.map((value) => value / 100);
}

function countSoldSkus(product: NonNullable<(typeof PRODUCT_MAP)[string]>, qty: number): number {
  if (!product.skus.length || qty <= 0) return 0;
  return splitCount(qty, skuWeights(product)).filter((value) => value > 0).length;
}

export function productSkuRows(productCode: string, period: StorePeriodKey): SkuSalesRow[] {
  const product = PRODUCT_MAP[productCode];
  if (!product) return [];
  const { from, to } = rankPeriodRange(period);
  let qty = 0;
  let gmv = 0;
  let orders = 0;
  getDataset().itemDay.forEach((row) => {
    if (row.itemcode !== productCode || row.date < from || row.date > to) return;
    qty += row.qty;
    gmv += row.gmv;
    orders += row.orders;
  });
  if (!product.skus.length) return [];
  const weights = skuWeights(product);
  const qtys = splitCount(qty, weights);
  const gmvs = splitAmount(gmv, weights);
  const orderSplit = splitCount(orders, qtys);
  return product.skus.map((sku, index) => ({
    id: sku.id,
    color: sku.color,
    size: sku.size,
    pattern: sku.pattern,
    qty: qtys[index] ?? 0,
    gmv: gmvs[index] ?? 0,
    orders: orderSplit[index] ?? 0,
  }));
}

export type ProductRankMetric = 'qty' | 'gmv' | 'orders';

export function productRank(period: StorePeriodKey, metric: ProductRankMetric = 'qty'): RankRow[] {
  const { from, to } = rankPeriodRange(period);
  const totals = new Map<string, { qty: number; gmv: number; orders: number }>();
  getDataset().itemDay.forEach((row) => {
    if (row.date < from || row.date > to) return;
    const current = totals.get(row.itemcode) ?? { qty: 0, gmv: 0, orders: 0 };
    current.qty += row.qty;
    current.gmv = round2(current.gmv + row.gmv);
    current.orders += row.orders;
    totals.set(row.itemcode, current);
  });

  return Array.from(totals.entries())
    .map(([itemcode, total]) => {
      const product = PRODUCT_MAP[itemcode];
      const value = metric === 'qty' ? total.qty : metric === 'gmv' ? total.gmv : total.orders;
      return {
        rank: 0,
        key: itemcode,
        itemcode,
        storeId: product?.storeId,
        storeName: product ? storeNameOf(product.storeId) : '',
        name: product?.name ?? itemcode,
        thumb: product?.thumb ?? '',
        value,
        skuCount: product ? countSoldSkus(product, total.qty) : 0,
      };
    })
    .filter((row) => row.value > 0)
    .sort((a, b) => b.value - a.value || a.key.localeCompare(b.key))
    .slice(0, 100)
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

export function sortByNumber<T>(rows: T[], pick: (row: T) => number | null, direction: 'asc' | 'desc'): T[] {
  const factor = direction === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => {
    const left = pick(a);
    const right = pick(b);
    const leftValue = left === null || !Number.isFinite(left) ? Number.NEGATIVE_INFINITY : left;
    const rightValue = right === null || !Number.isFinite(right) ? Number.NEGATIVE_INFINITY : right;
    if (leftValue === rightValue) return 0;
    return leftValue > rightValue ? factor : -factor;
  });
}

export const AD_STORE_IDS = AD_PRODUCTS.reduce((acc, product) => {
  if (!acc.includes(product.storeId)) acc.push(product.storeId);
  return acc;
}, [] as number[]);

export { EMPTY_ACC, round2 };
