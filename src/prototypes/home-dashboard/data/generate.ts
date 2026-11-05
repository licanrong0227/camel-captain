import { AD_PRODUCTS, COUNTRY_SPLIT, PRODUCTS_BY_STORE, STORES, STORE_MAP } from './catalog';
import type {
  AdDailyRow,
  AdType,
  ItemDayRow,
  OrderRow,
  ProdReportRow,
  StoreDailyRow,
} from './types';

export const REPORT_TO = '2026-10-31';
export const HISTORY_DAYS = 180;
export const AD_DETAIL_DAYS = 90;

export function parseDay(value: string): Date {
  return new Date(`${value}T00:00:00Z`);
}

export function toDayString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(value: string, days: number): string {
  const date = parseDay(value);
  date.setUTCDate(date.getUTCDate() + days);
  return toDayString(date);
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

export const DATA_FROM = addDays(REPORT_TO, -(HISTORY_DAYS - 1));
export const AD_DETAIL_FROM = addDays(REPORT_TO, -(AD_DETAIL_DAYS - 1));

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function hashStr(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function dayShape(day: string, dayIndex: number, totalDays: number): { weekend: number; wave: number; growth: number } {
  const weekday = parseDay(day).getUTCDay();
  return {
    weekend: weekday === 0 || weekday === 6 ? 1.16 : 1,
    wave: 1 + 0.15 * Math.sin(dayIndex / 9),
    growth: 0.82 + 0.3 * (dayIndex / totalDays),
  };
}

function allocateMoney(total: number, weights: number[]): number[] {
  const cents = Math.round(total * 100);
  const sum = weights.reduce((acc, weight) => acc + weight, 0) || 1;
  const raw = weights.map((weight) => (cents * weight) / sum);
  const floors = raw.map((value) => Math.floor(value));
  let remaining = cents - floors.reduce((acc, value) => acc + value, 0);
  const order = raw
    .map((value, index) => ({ index, frac: value - floors[index] }))
    .sort((a, b) => b.frac - a.frac);
  for (let index = 0; index < remaining; index += 1) floors[order[index % order.length].index] += 1;
  remaining = 0;
  return floors.map((value) => value / 100);
}

function allocateInt(total: number, weights: number[]): number[] {
  const sum = weights.reduce((acc, weight) => acc + weight, 0) || 1;
  const raw = weights.map((weight) => (total * weight) / sum);
  const floors = raw.map((value) => Math.floor(value));
  let remaining = total - floors.reduce((acc, value) => acc + value, 0);
  const order = raw
    .map((value, index) => ({ index, frac: value - floors[index] }))
    .sort((a, b) => b.frac - a.frac);
  for (let index = 0; index < remaining; index += 1) floors[order[index % order.length].index] += 1;
  remaining = 0;
  return floors;
}

function buildStoreDaily(): StoreDailyRow[] {
  const rows: StoreDailyRow[] = [];
  const days = eachDay(DATA_FROM, REPORT_TO);
  STORES.forEach((store) => {
    days.forEach((day, dayIndex) => {
      if (day < store.openDate) return;
      const shape = dayShape(day, dayIndex, days.length);
      const rampDays = Math.max(0, eachDay(store.openDate, day).length);
      const ramp = store.openDate > DATA_FROM ? Math.min(1, 0.45 + rampDays / 24) : 1;
      const random = mulberry32(hashStr(`${store.id}|${day}|store`));
      const baseGmv = 620 * store.weight * shape.weekend * shape.wave * shape.growth * ramp * (0.7 + random() * 0.6);
      const countryWeights = COUNTRY_SPLIT.map((item, index) => item.weight * (0.82 + mulberry32(hashStr(`${store.id}|${day}|${index}`))() * 0.36));
      const gmvs = allocateMoney(baseGmv, countryWeights);
      const buyerSplit = allocateInt(Math.max(1, Math.round(baseGmv / (store.unitPrice * (0.9 + random() * 0.25)))), countryWeights);
      const orderSplit = allocateInt(buyerSplit.reduce((acc, value) => acc + value, 0) + Math.round(random() * 3), countryWeights);
      const qtySplit = allocateInt(orderSplit.reduce((acc, value) => acc + value, 0) + Math.round(random() * 4), countryWeights);
      const uvSplit = allocateInt(
        Math.max(1, Math.round(buyerSplit.reduce((acc, value) => acc + value, 0) / (0.02 + random() * 0.035))),
        countryWeights,
      );
      const pvSplit = allocateInt(uvSplit.reduce((acc, value) => acc + value, 0) * (1.6 + random() * 0.8), countryWeights);
      const addcartUvSplit = allocateInt(uvSplit.reduce((acc, value) => acc + value, 0) * (0.05 + random() * 0.06), countryWeights);
      const addcartIcSplit = allocateInt(addcartUvSplit.reduce((acc, value) => acc + value, 0) * (1.1 + random() * 0.7), countryWeights);
      const addfavSplit = allocateInt(uvSplit.reduce((acc, value) => acc + value, 0) * (0.01 + random() * 0.02), countryWeights);
      const startedGmv = allocateMoney(baseGmv * (1 + random() * 0.2), countryWeights);
      const startedBuyerSplit = allocateInt(buyerSplit.reduce((acc, value) => acc + value, 0) + Math.round(random() * 4), countryWeights);
      const startedOrderSplit = allocateInt(orderSplit.reduce((acc, value) => acc + value, 0) + Math.round(random() * 3), countryWeights);
      const obRate = 0.35 + random() * 0.55;

      COUNTRY_SPLIT.forEach((country, index) => {
        rows.push({
          storeId: store.id,
          date: day,
          country: country.id as StoreDailyRow['country'],
          gmv: gmvs[index],
          buyers: buyerSplit[index],
          orders: orderSplit[index],
          qty: qtySplit[index],
          startedGmv: startedGmv[index],
          startedBuyers: startedBuyerSplit[index],
          startedOrders: startedOrderSplit[index],
          pv: pvSplit[index],
          uv: uvSplit[index],
          expo: 0,
          addcartUv: addcartUvSplit[index],
          addcartIc: addcartIcSplit[index],
          addfavUv: addfavSplit[index],
          obRate,
        });
      });
    });
  });
  return rows;
}

interface Placement {
  adType: AdType;
  planName: string;
  groupName: string;
  scale: number;
}

function placementsFor(productCode: string, index: number, storeAdIndex: number): Placement[] {
  const prefix = storeAdIndex === 0 ? '箱包-精准词' : storeAdIndex === 1 ? '鞋靴-精准词' : storeAdIndex === 2 ? '女装-精准词' : '品类-精准词';
  if (index % 5 === 4) {
    return [{ adType: 'shopauto', planName: '', groupName: '', scale: 0.4 }];
  }
  if (index % 4 === 3) {
    return [
      { adType: 'ppc', planName: `${prefix}（广泛）`, groupName: '长尾词', scale: 0.72 },
      { adType: 'prodauto', planName: '商品自动-全店', groupName: '', scale: 0.62 },
    ];
  }
  return [
    { adType: 'ppc', planName: prefix, groupName: '核心词', scale: 1 },
    { adType: 'prodauto', planName: '商品自动-全店', groupName: '', scale: 0.62 },
  ];
}

const AD_SCALE = 0.4;

function dailyAdMetrics(
  productPrice: number,
  productTraffic: number,
  placement: Placement,
  day: string,
  dayIndex: number,
  anchor: 'none' | 'zero' | 'low' | 'best',
) {
  const random = mulberry32(hashStr(`${productPrice}|${productTraffic}|${placement.planName}|${placement.groupName}|${day}`));
  const shape = dayShape(day, dayIndex, AD_DETAIL_DAYS);
  const imp = Math.max(20, Math.round(productTraffic * placement.scale * shape.weekend * shape.wave * shape.growth * (0.66 + random() * 0.68) * AD_SCALE));
  const ctr = 0.016 + random() * 0.016;
  const click = Math.max(1, Math.round(imp * ctr));
  const cpc = anchor === 'low' ? 0.58 + random() * 0.12 : 0.18 + random() * 0.24;
  const cost = round2(click * cpc);
  const cvr = anchor === 'low' ? 0.01 + random() * 0.005 : anchor === 'best' ? 0.045 + random() * 0.015 : 0.015 + random() * 0.03;
  const expected = click * cvr;
  const zero = anchor === 'zero' && day >= '2026-10-10';
  const orders = zero ? 0 : Math.floor(expected) + (random() < expected - Math.floor(expected) ? 1 : 0);
  const aov = anchor === 'low' ? 22 + random() * 4 : productPrice * (0.86 + random() * 0.28);
  return { imp, click, cost, orders, gmv: round2(orders * aov) };
}

function buildAdDataset() {
  const days = eachDay(AD_DETAIL_FROM, REPORT_TO);
  const prodRows: ProdReportRow[] = [];
  const orderRows: OrderRow[] = [];
  const supplementOrders: OrderRow[] = [];
  const adDaily: AdDailyRow[] = [];
  let orderSeq = 1;

  const adStoreIndex = new Map<number, number>();
  STORES.filter((store) => store.adEnabled).forEach((store, index) => adStoreIndex.set(store.id, index));

  AD_PRODUCTS.forEach((product) => {
    const storeIndex = adStoreIndex.get(product.storeId) ?? 0;
    const productIndex = PRODUCTS_BY_STORE[product.storeId].findIndex((item) => item.itemcode === product.itemcode);
    const anchor = product.itemcode === AD_PRODUCTS[0].itemcode && product.storeId === 152
      ? 'best'
      : product.itemcode === AD_PRODUCTS.find((item) => item.storeId === 153)?.itemcode
        ? 'zero'
        : product.itemcode === AD_PRODUCTS.find((item) => item.storeId === 155)?.itemcode
          ? 'low'
          : 'none';
    const placements = placementsFor(product.itemcode, productIndex, storeIndex);
    days.forEach((day, dayIndex) => {
      placements.forEach((placement) => {
        const metrics = dailyAdMetrics(product.price, product.traffic, placement, day, dayIndex, anchor);
        prodRows.push({
          date: day,
          storeId: product.storeId,
          adType: placement.adType,
          planName: placement.planName,
          groupName: placement.groupName,
          itemcode: product.itemcode,
          imp: metrics.imp,
          click: metrics.click,
          cost: metrics.cost,
          orders: metrics.orders,
          gmv: metrics.gmv,
        });
        if (metrics.orders <= 0) return;
        const splitRandom = mulberry32(hashStr(`${product.itemcode}|${day}|${placement.adType}|order`));
        const base = metrics.gmv / metrics.orders;
        let remaining = metrics.gmv;
        for (let index = 0; index < metrics.orders; index += 1) {
          const amount = index === metrics.orders - 1 ? round2(remaining) : round2(base * (0.9 + splitRandom() * 0.2));
          remaining = round2(remaining - amount);
          orderRows.push({
            date: day,
            storeId: product.storeId,
            adType: placement.adType,
            planName: placement.planName,
            itemcode: product.itemcode,
            productName: product.name,
            orderNo: `DH${day.replace(/-/g, '')}${String(orderSeq).padStart(4, '0')}`,
            orderItemcode: product.itemcode,
            orderProductName: product.name,
            searchWord: placement.adType === 'shopauto' ? '' : product.keywords[Math.floor(splitRandom() * product.keywords.length)],
            gmv: amount,
            labels: [],
            supplement: false,
          });
          orderSeq += 1;
        }
      });
    });
  });

  const byStoreDay = new Map<string, AdDailyRow>();
  prodRows.forEach((row) => {
    const key = `${row.storeId}|${row.date}`;
    const current = byStoreDay.get(key) ?? { storeId: row.storeId, date: row.date, adCost: 0, adGmv: 0, imp: 0, click: 0, orders: 0 };
    current.adCost = round2(current.adCost + row.cost);
    current.adGmv = round2(current.adGmv + row.gmv);
    current.imp += row.imp;
    current.click += row.click;
    current.orders += row.orders;
    byStoreDay.set(key, current);
  });

  STORES.filter((store) => store.adEnabled).forEach((store) => {
    const olderDays = eachDay(DATA_FROM, addDays(AD_DETAIL_FROM, -1));
    olderDays.forEach((day, dayIndex) => {
      const shape = dayShape(day, dayIndex, olderDays.length);
      const random = mulberry32(hashStr(`${store.id}|${day}|ad-old`));
      const adCost = round2(store.weight * 320 * AD_SCALE * shape.weekend * shape.wave * shape.growth * (0.8 + random() * 0.45));
      const adGmv = round2(adCost * (2.5 + random() * 0.9));
      const click = Math.max(8, Math.round(adCost / (0.22 + random() * 0.16)));
      const imp = Math.round(click / (0.018 + random() * 0.012));
      byStoreDay.set(`${store.id}|${day}`, {
        storeId: store.id,
        date: day,
        adCost,
        adGmv,
        imp,
        click,
        orders: Math.max(1, Math.round(adGmv / (store.unitPrice * (1.1 + random() * 0.4)))),
      });
    });
  });

  adDaily.push(...Array.from(byStoreDay.values()).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.storeId - b.storeId)));

  // 一笔订单含两个商品：用于成单词去重与涉及商品数
  const multiOrder = orderRows.filter((row) => row.date === '2026-10-15' && row.storeId === 152).slice(0, 2);
  if (multiOrder.length === 2) {
    multiOrder.forEach((row) => {
      row.orderNo = 'DH202610159001';
      row.searchWord = 'women shoulder bag';
    });
  }

  // 补单与其他标签订单：只参与剔除，不进入广告视图
  STORES.filter((store) => store.adEnabled).forEach((store, index) => {
    const product = PRODUCTS_BY_STORE[store.id][0];
    const labelSets: Array<{ date: string; gmv: number; labels: string[]; type: AdType; plan: string }> = [
      { date: '2026-10-28', gmv: round2(96 + index * 18), labels: ['lbl-supplement'], type: 'ppc', plan: '箱包-精准词' },
      { date: '2026-10-29', gmv: round2(128 + index * 22), labels: ['lbl-supplement'], type: 'ppc', plan: '箱包-精准词' },
      { date: '2026-10-30', gmv: round2(86 + index * 14), labels: ['lbl-brush'], type: 'prodauto', plan: '商品自动-全店' },
      { date: '2026-10-31', gmv: round2(118 + index * 16), labels: ['lbl-supplement'], type: 'ppc', plan: '箱包-精准词' },
    ];
    labelSets.forEach((item, seq) => {
      supplementOrders.push({
        date: item.date,
        storeId: store.id,
        adType: item.type,
        planName: item.plan,
        itemcode: product.itemcode,
        productName: product.name,
        orderNo: `DH${item.date.replace(/-/g, '')}8${String(index * 10 + seq).padStart(3, '0')}`,
        orderItemcode: product.itemcode,
        orderProductName: product.name,
        searchWord: '',
        gmv: item.gmv,
        labels: item.labels,
        supplement: true,
      });
    });
  });

  return { adDaily, prodRows, orderRows, supplementOrders };
}

function buildItemDay(): ItemDayRow[] {
  const rows: ItemDayRow[] = [];
  const storeTotals = new Map<string, { qty: number; gmv: number; orders: number }>();
  buildStoreDailyCache().forEach((row) => {
    const key = `${row.storeId}|${row.date}`;
    const current = storeTotals.get(key) ?? { qty: 0, gmv: 0, orders: 0 };
    current.qty += row.qty;
    current.gmv = round2(current.gmv + row.gmv);
    current.orders += row.orders;
    storeTotals.set(key, current);
  });

  STORES.forEach((store) => {
    const products = PRODUCTS_BY_STORE[store.id] ?? [];
    eachDay(DATA_FROM, REPORT_TO).forEach((day) => {
      if (day < store.openDate) return;
      const total = storeTotals.get(`${store.id}|${day}`);
      if (!total || total.qty <= 0) return;
      const weights = products.map((product, index) => {
        const random = mulberry32(hashStr(`${product.itemcode}|${day}|item`));
        return (product.adEnabled ? 1.8 : 1) * (0.7 + random() * 0.8) * (1 + index / 100);
      });
      const qtys = allocateInt(total.qty, weights);
      const gmvs = allocateMoney(total.gmv, weights);
      const orders = allocateInt(Math.min(total.orders, total.qty), qtys);
      products.forEach((product, index) => {
        if (qtys[index] <= 0) return;
        rows.push({
          storeId: store.id,
          itemcode: product.itemcode,
          date: day,
          qty: qtys[index],
          gmv: gmvs[index],
          orders: orders[index] ?? 0,
        });
      });
    });
  });

  return rows;
}

let storeDailyCache: StoreDailyRow[] | null = null;

function buildStoreDailyCache(): StoreDailyRow[] {
  if (!storeDailyCache) storeDailyCache = buildStoreDaily();
  return storeDailyCache;
}

export interface Dataset {
  storeDaily: StoreDailyRow[];
  adDaily: AdDailyRow[];
  prodRows: ProdReportRow[];
  orderRows: OrderRow[];
  supplementOrders: OrderRow[];
  itemDay: ItemDayRow[];
}

let dataset: Dataset | null = null;

export function getDataset(): Dataset {
  if (!dataset) {
    const storeDaily = buildStoreDailyCache();
    const ad = buildAdDataset();
    dataset = {
      storeDaily,
      adDaily: ad.adDaily,
      prodRows: ad.prodRows,
      orderRows: ad.orderRows,
      supplementOrders: ad.supplementOrders,
      itemDay: buildItemDay(),
    };
  }
  return dataset;
}
