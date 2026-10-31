import { PRODUCT_MAP } from './catalog';
import { addDays, eachDay } from './mock';
import type {
  Acc,
  AdType,
  Filters,
  ItemRow,
  MetricCardData,
  Metrics,
  OrderReportRow,
  PlanRow,
  ProdReportRow,
  TrendPoint,
  WordOrder,
  WordRow,
} from './types';

export const EMPTY_ACC: Acc = { imp: 0, click: 0, cost: 0, orders: 0, gmv: 0 };

export function addAcc(target: Acc, row: ProdReportRow): Acc {
  return {
    imp: target.imp + row.imp,
    click: target.click + row.click,
    cost: target.cost + row.usdCost,
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
    ...acc,
    cost: Math.round(acc.cost * 100) / 100,
    gmv: Math.round(acc.gmv * 100) / 100,
    ctr: acc.imp > 0 ? acc.click / acc.imp : null,
    cpc: acc.click > 0 ? acc.cost / acc.click : null,
    cvr: acc.click > 0 ? acc.orders / acc.click : null,
    cpa: acc.orders > 0 ? acc.cost / acc.orders : null,
    roas: acc.cost > 0 ? acc.gmv / acc.cost : null,
  };
}

export function accOfMetrics(rows: Metrics[]): Acc {
  return mergeAcc(rows.map((row) => ({ imp: row.imp, click: row.click, cost: row.cost, orders: row.orders, gmv: row.gmv })));
}

export function accOfProd(rows: ProdReportRow[]): Acc {
  return rows.reduce<Acc>((acc, row) => addAcc(acc, row), { ...EMPTY_ACC });
}

function inRange(day: string, from: string, to: string): boolean {
  return day >= from && day <= to;
}

export function filterProd(rows: ProdReportRow[], filters: Filters): ProdReportRow[] {
  return rows.filter(
    (row) =>
      (!filters.store || row.nickname === filters.store) &&
      (!filters.adType || row.adType === filters.adType) &&
      inRange(row.dateline, filters.from, filters.to),
  );
}

export function filterOrder(rows: OrderReportRow[], filters: Filters): OrderReportRow[] {
  return rows.filter(
    (row) =>
      (!filters.store || row.nickname === filters.store) &&
      (!filters.adType || row.adType === filters.adType) &&
      inRange(row.dateline, filters.from, filters.to),
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
  const groups = new Map<string, { store: string; itemcode: string; acc: Acc; types: Set<AdType> }>();

  rows.forEach((row) => {
    const key = `${row.nickname}__${row.itemcode}`;
    const current = groups.get(key);
    if (current) {
      current.acc = addAcc(current.acc, row);
      current.types.add(row.adType);
      return;
    }
    groups.set(key, {
      store: row.nickname,
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
      store: group.store,
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
  const groups = new Map<string, { store: string; adType: AdType; planName: string; groupName: string; acc: Acc }>();

  rows.forEach((row) => {
    const key = `${row.nickname}__${row.adType}__${row.planName}__${row.groupName}`;
    const current = groups.get(key);
    if (current) {
      current.acc = addAcc(current.acc, row);
      return;
    }
    groups.set(key, {
      store: row.nickname,
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
      store: group.store,
      adType: group.adType,
      planName: group.planName,
      groupName: group.groupName,
      ...metrics,
      ...flags(metrics),
    };
  });
}

interface WordDraft {
  store: string;
  word: string;
  types: Set<AdType>;
  gmv: number;
  itemcodes: Set<string>;
  orders: Map<string, WordOrder>;
}

export function buildWordRows(rows: OrderReportRow[]): WordRow[] {
  const groups = new Map<string, WordDraft>();

  rows.forEach((row) => {
    const word = row.searchword.trim();
    const key = `${row.nickname}__${word}`;
    let group = groups.get(key);
    if (!group) {
      group = { store: row.nickname, word, types: new Set(), gmv: 0, itemcodes: new Set(), orders: new Map() };
      groups.set(key, group);
    }
    group.types.add(row.adType);
    group.gmv += row.gmv;
    group.itemcodes.add(row.orderItemcode);

    const existing = group.orders.get(row.orderNo);
    if (existing) {
      existing.amount += row.gmv;
      existing.items.push({ code: row.orderItemcode, name: row.orderProductName, amount: row.gmv });
    } else {
      group.orders.set(row.orderNo, {
        orderNo: row.orderNo,
        date: row.dateline,
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
      store: group.store,
      word: group.word,
      adTypes: sortAdTypes(group.types),
      orderCount: orders.length,
      gmv: Math.round(group.gmv * 100) / 100,
      itemCount: group.itemcodes.size,
      lastDate,
      orders,
    };
  });
}

export function buildTrend(rows: ProdReportRow[], from: string, to: string): TrendPoint[] {
  const byDay = new Map<string, Acc>();
  rows.forEach((row) => {
    const acc = byDay.get(row.dateline) ?? { ...EMPTY_ACC };
    byDay.set(row.dateline, addAcc(acc, row));
  });

  return eachDay(from, to).map((day) => {
    const raw = byDay.get(day) ?? { ...EMPTY_ACC };
    return {
      date: day,
      cost: Math.round(raw.cost * 100) / 100,
      gmv: Math.round(raw.gmv * 100) / 100,
      orders: raw.orders,
      imp: raw.imp,
      click: raw.click,
      roas: raw.cost > 0 ? raw.gmv / raw.cost : null,
    };
  });
}

export function previousRange(from: string, to: string): { from: string; to: string } {
  const start = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);
  const span = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
  return { from: addDays(from, -span), to: addDays(from, -1) };
}

function pairAcc(cur: number, prev: number): { prev: number | null; delta: number | null } {
  if (!Number.isFinite(prev) || prev === 0) return { prev: null, delta: null };
  return { prev, delta: (cur - prev) / prev };
}

export function buildCards(current: Metrics, previous: Metrics): MetricCardData[] {
  const aovCur = current.orders > 0 ? current.gmv / current.orders : 0;
  const aovPrev = previous.orders > 0 ? previous.gmv / previous.orders : 0;
  const roasCur = current.roas ?? 0;
  const roasPrev = previous.roas ?? 0;

  const entries: Array<{
    key: string;
    label: string;
    value: number;
    prev: number;
    goodWhenUp: boolean;
    format: MetricCardData['format'];
  }> = [
    { key: 'cost', label: '广告花费', value: current.cost, prev: previous.cost, goodWhenUp: false, format: 'money' },
    { key: 'gmv', label: '广告 GMV', value: current.gmv, prev: previous.gmv, goodWhenUp: true, format: 'money' },
    { key: 'orders', label: '广告订单数', value: current.orders, prev: previous.orders, goodWhenUp: true, format: 'int' },
    { key: 'roas', label: 'ROAS', value: roasCur, prev: roasPrev, goodWhenUp: true, format: 'roas' },
    { key: 'imp', label: '曝光量', value: current.imp, prev: previous.imp, goodWhenUp: true, format: 'int' },
    { key: 'click', label: '点击量', value: current.click, prev: previous.click, goodWhenUp: true, format: 'int' },
    { key: 'ctr', label: '点击率', value: current.ctr ?? 0, prev: previous.ctr ?? 0, goodWhenUp: true, format: 'pct' },
    { key: 'cpc', label: '平均点击单价', value: current.cpc ?? 0, prev: previous.cpc ?? 0, goodWhenUp: false, format: 'money' },
    { key: 'cvr', label: '转化率', value: current.cvr ?? 0, prev: previous.cvr ?? 0, goodWhenUp: true, format: 'pct' },
    { key: 'aov', label: '客单价', value: aovCur, prev: aovPrev, goodWhenUp: true, format: 'money' },
  ];

  return entries.map((entry) => ({ ...entry, ...pairAcc(entry.value, entry.prev) }));
}

export function sumWordTotals(rows: WordRow[]): { orderCount: number; gmv: number; itemCount: number } {
  const orderIds = new Set<string>();
  const itemCodes = new Set<string>();
  let gmv = 0;
  rows.forEach((row) => {
    gmv += row.gmv;
    row.orders.forEach((order) => {
      orderIds.add(order.orderNo);
      order.items.forEach((item) => itemCodes.add(item.code));
    });
  });
  return { orderCount: orderIds.size, gmv: Math.round(gmv * 100) / 100, itemCount: itemCodes.size };
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
