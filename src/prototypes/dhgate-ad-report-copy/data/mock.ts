import { PRODUCTS, PRODUCT_MAP, type ProductInfo } from './catalog';
import type { AdType, OrderReportRow, ProdReportRow } from './types';

export const DEMO_TODAY = '2026-10-20';
export const DATA_TO = '2026-10-19';
export const DATA_FROM = '2026-08-19';

interface Placement {
  adType: AdType;
  planName: string;
  groupName: string;
  scale: number;
}

const PPC_CORE = (planName: string): Placement => ({
  adType: 'ppc',
  planName,
  groupName: '核心词',
  scale: 1,
});

const PPC_LONG = (planName: string): Placement => ({
  adType: 'ppc',
  planName,
  groupName: '长尾词',
  scale: 0.72,
});

const PPC_CATEGORY = (planName: string): Placement => ({
  adType: 'ppc',
  planName,
  groupName: '品类词',
  scale: 0.86,
});

const PROD_AUTO: Placement = {
  adType: 'prodauto',
  planName: '商品自动-全店',
  groupName: '',
  scale: 0.62,
};

const SHOP_AUTO: Placement = {
  adType: 'shopauto',
  planName: '',
  groupName: '',
  scale: 0.4,
};

const PLACEMENTS: Record<string, Placement[]> = {
  '204817563219': [PPC_CORE('箱包-精准词'), PROD_AUTO, SHOP_AUTO],
  '204817563220': [PPC_CORE('箱包-精准词'), PROD_AUTO],
  '204817563221': [PPC_LONG('箱包-广泛词'), PROD_AUTO],
  '204817563222': [PROD_AUTO],
  '204817563223': [PPC_CORE('箱包-精准词'), PROD_AUTO, SHOP_AUTO],
  '204817563224': [PPC_CORE('鞋靴-精准词'), PROD_AUTO],
  '204817563225': [PPC_LONG('女装-广泛词'), PROD_AUTO],
  '204817563226': [PPC_CORE('女装-广泛词'), PROD_AUTO, SHOP_AUTO],
  '204817563227': [PROD_AUTO],
  '204817563228': [PPC_CORE('箱包-精准词'), PROD_AUTO, SHOP_AUTO],
  '204817563229': [PPC_LONG('箱包-精准词'), PROD_AUTO],
  '204817563230': [SHOP_AUTO],
};

const ZERO_CONV_FROM = '2026-10-01';
const ZERO_CONV_CODE = '204817563223';
const LOW_ROAS_CODE = '204817563224';
const MULTI_ORDER_DATE = '2026-10-15';
const MULTI_ORDER_CODES = ['204817563219', '204817563220'];
const MULTI_ORDER_WORD = 'women shoulder bag';

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

function dailyMetrics(product: ProductInfo, placement: Placement, day: string, dayIndex: number) {
  const random = mulberry32(
    hashStr(`${product.itemcode}|${placement.adType}|${placement.planName}|${placement.groupName}|${day}`),
  );
  const weekday = parseDay(day).getUTCDay();
  const weekend = weekday === 0 || weekday === 6 ? 1.16 : 1;
  const wave = 1 + 0.18 * Math.sin(dayIndex / 7.5);
  const growth = 0.88 + 0.24 * (dayIndex / 62);

  const lowRoas = product.itemcode === LOW_ROAS_CODE;
  const zeroConv = product.itemcode === ZERO_CONV_CODE && day >= ZERO_CONV_FROM;
  const bestSeller = product.itemcode === '204817563220';

  const imp = Math.max(
    30,
    Math.round(product.traffic * placement.scale * weekend * wave * growth * (0.66 + random() * 0.68)),
  );
  const ctr = 0.016 + random() * 0.016;
  const click = Math.max(1, Math.round(imp * ctr));
  const cpc = lowRoas ? 0.58 + random() * 0.12 : 0.18 + random() * 0.24;
  const cost = round2(click * cpc);

  const cvr = lowRoas ? 0.014 + random() * 0.006 : bestSeller ? 0.042 + random() * 0.014 : 0.014 + random() * 0.028;
  const expected = click * cvr;
  const orders = zeroConv ? 0 : Math.floor(expected) + (random() < expected - Math.floor(expected) ? 1 : 0);
  const aov = lowRoas ? 24 + random() * 4 : product.price * (0.86 + random() * 0.28);
  const gmv = round2(orders * aov);

  return { imp, click, cost, orders, gmv, cpc };
}

function pickWord(product: ProductInfo, placement: Placement, random: () => number): string {
  if (placement.adType === 'shopauto') return '';
  const pool = product.keywords;
  return pool[Math.floor(random() * pool.length)] ?? pool[0];
}

export interface Dataset {
  prodRows: ProdReportRow[];
  orderRows: OrderReportRow[];
}

function buildDataset(): Dataset {
  const days = eachDay(DATA_FROM, DATA_TO);
  const prodRows: ProdReportRow[] = [];
  const orderRows: OrderReportRow[] = [];
  let orderSeq = 1;

  PRODUCTS.forEach((product) => {
    const placements = PLACEMENTS[product.itemcode] ?? [PROD_AUTO];
    days.forEach((day, dayIndex) => {
      placements.forEach((placement) => {
        const metrics = dailyMetrics(product, placement, day, dayIndex);
        prodRows.push({
          dateline: day,
          nickname: product.store,
          adType: placement.adType,
          planName: placement.planName,
          groupName: placement.groupName,
          itemcode: product.itemcode,
          imp: metrics.imp,
          click: metrics.click,
          usdCost: metrics.cost,
          orders: metrics.orders,
          gmv: metrics.gmv,
        });

        if (metrics.orders <= 0) return;

        const random = mulberry32(hashStr(`${product.itemcode}|${day}|order|${placement.adType}`));
        const base = metrics.gmv / metrics.orders;
        let remaining = metrics.gmv;
        for (let index = 0; index < metrics.orders; index += 1) {
          const isLast = index === metrics.orders - 1;
          const amount = isLast ? round2(remaining) : round2(base * (0.9 + random() * 0.2));
          remaining = round2(remaining - amount);
          orderRows.push({
            dateline: day,
            nickname: product.store,
            adType: placement.adType,
            planName: placement.planName,
            itemcode: product.itemcode,
            productName: product.name,
            orderNo: `DH${day.replace(/-/g, '')}${String(orderSeq).padStart(4, '0')}`,
            orderItemcode: product.itemcode,
            orderProductName: product.name,
            searchword: pickWord(product, placement, random),
            gmv: amount,
          });
          orderSeq += 1;
        }
      });
    });
  });

  applyMultiItemOrder(orderRows);

  return { prodRows, orderRows };
}

/** 造一笔包含两个商品、同一个成单词的订单，用于验证「涉及商品数」与订单去重 */
function applyMultiItemOrder(orderRows: OrderReportRow[]) {
  const picks = MULTI_ORDER_CODES.map((code) =>
    orderRows.find(
      (row) =>
        row.dateline === MULTI_ORDER_DATE &&
        row.itemcode === code &&
        row.nickname === PRODUCT_MAP[code]?.store,
    ),
  ).filter((row): row is OrderReportRow => Boolean(row));

  if (picks.length < 2) return;

  const sharedOrderNo = `DH${MULTI_ORDER_DATE.replace(/-/g, '')}9001`;
  picks.forEach((row) => {
    row.orderNo = sharedOrderNo;
    row.searchword = MULTI_ORDER_WORD;
  });
}

let dataset: Dataset | null = null;

export function getDataset(): Dataset {
  if (!dataset) dataset = buildDataset();
  return dataset;
}
