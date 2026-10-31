import { LINKS, STORES } from './catalog';
import type { AdDailyRow, OrderItemDailyRow, StoreDailyRow } from './types';

export const DATA_FROM = '2026-08-29';
/** 订单与店铺数据同步到当天 */
export const ORDER_TO = '2026-10-29';
/** 广告数据 T+1，截至昨天 */
export const AD_TO = '2026-10-28';
/** 报表统一对比截止日：取广告数据的截止日，保证广告与 GMV 同区间 */
export const REPORT_TO = AD_TO;

/** 各店铺补单订单占比（演示数据，用于自动剔除） */
export const SUPPLIER_RATE: Record<number, number> = { 152: 9, 153: 4, 155: 0 };

/** 演示：按店铺 + 商品 + 日期确定性地给订单打标签 */
function labelsFor(storeId: number, itemCode: string, day: string): string[] {
  const seed = hashStr(`${storeId}|${itemCode}|${day}|labels`);
  const labels: string[] = [];
  if (seed % 100 < (SUPPLIER_RATE[storeId] ?? 0)) labels.push('lbl-supplement');
  if (storeId === 152 && (seed >>> 8) % 100 < 3) labels.push('lbl-brush');
  if (storeId === 153 && (seed >>> 16) % 100 < 2) labels.push('lbl-gift');
  if (storeId === 155 && (seed >>> 24) % 100 < 1) labels.push('lbl-test');
  return labels;
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

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

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

export interface Dataset {
  storeRows: StoreDailyRow[];
  orderRows: OrderItemDailyRow[];
  adRows: AdDailyRow[];
}

function buildDataset(): Dataset {
  const days = eachDay(DATA_FROM, ORDER_TO);
  const storeRows: StoreDailyRow[] = [];
  const orderRows: OrderItemDailyRow[] = [];
  const adRows: AdDailyRow[] = [];
  let orderSeq = 1;

  STORES.forEach((store) => {
    const storeLinks = LINKS.filter((link) => link.storeId === store.storeId);

    days.forEach((day, dayIndex) => {
      const weekday = parseDay(day).getUTCDay();
      const weekend = weekday === 0 || weekday === 6 ? 1.22 : 1;
      const wave = 1 + 0.16 * Math.sin(dayIndex / 6.5);
      const growth = 0.9 + 0.2 * (dayIndex / days.length);

      let dayGmv = 0;
      let dayUnits = 0;

      storeLinks.forEach((link) => {
        const random = mulberry32(hashStr(`${store.storeId}|${link.itemCode}|${day}`));
        const expected = link.unitsBase * 2.6 * weekend * wave * growth * (0.7 + random() * 0.6);
        const units = Math.floor(expected) + (random() < expected - Math.floor(expected) ? 1 : 0);
        if (units <= 0) return;

        const gmv = round2(units * link.price);
        dayGmv += gmv;
        dayUnits += units;
        orderRows.push({
          storeId: store.storeId,
          statDate: day,
          orderNo: `DH${day.replace(/-/g, '')}${String(orderSeq++).padStart(4, '0')}`,
          labels: labelsFor(store.storeId, link.itemCode, day),
          itemCode: link.itemCode,
          itemName: link.itemName,
          imgUrl: link.imgUrl,
          categoryName: link.categoryName,
          quantity: units,
          price: link.price,
          gmv,
        });

        if (day > AD_TO || link.ads.length === 0) return;

        link.ads.forEach((ad) => {
          const adRandom = mulberry32(hashStr(`${store.storeId}|${link.itemCode}|${ad.adType}|${day}`));
          const adGmv = round2(gmv * ad.share * (0.85 + adRandom() * 0.3));
          const cost =
            adGmv > 0 ? round2((adGmv / ad.roas) * (0.92 + adRandom() * 0.16)) : round2(2 + adRandom() * 4);
          adRows.push({
            storeId: store.storeId,
            itemCode: link.itemCode,
            adType: ad.adType,
            dateline: day,
            costUsd: cost,
            adGmv,
            orders: adGmv > 0 ? Math.max(1, Math.round(adGmv / (link.price * 1.1))) : 0,
          });
        });
      });

      storeRows.push({
        storeId: store.storeId,
        storeName: store.storeName,
        aliasName: store.aliasName,
        statDate: day,
        confirmGmv: round2(dayGmv),
        startedGmv: round2(dayGmv * (1.04 + mulberry32(hashStr(`${store.storeId}|${day}|started`))() * 0.08)),
        confirmRfxNum: Math.max(0, Math.round(dayUnits * 0.9)),
        confirmBuyerNum: Math.max(0, Math.round(dayUnits * 0.78)),
        dealTransRate: 0,
        unitPrice: 0,
        pdUv: 0,
        expoPv: 0,
      });
    });
  });

  // 转化率、客单价、访客数由当日数据回算，保证自洽
  storeRows.forEach((row) => {
    const uv = Math.max(60, Math.round(row.confirmRfxNum * (68 + (hashStr(`${row.storeId}|${row.statDate}|uv`) % 40))));
    row.pdUv = uv;
    row.unitPrice = row.confirmRfxNum > 0 ? round2(row.confirmGmv / row.confirmRfxNum) : 0;
    row.dealTransRate = uv > 0 ? row.confirmBuyerNum / uv : 0;
  });

  return { storeRows, orderRows, adRows };
}

let dataset: Dataset | null = null;

export function getDataset(): Dataset {
  if (!dataset) dataset = buildDataset();
  return dataset;
}
