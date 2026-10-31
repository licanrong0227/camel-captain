import { STORES } from './catalog';
import { createRng, dayOffset, intBetween } from './util';

export interface Wis {
  confirmGmv: number;
  startedGmv: number;
  confirmRfxNum: number;
  confirmBuyerNum: number;
  dealTransRate: number;
  unitPrice: number;
  pdPv: number;
  pdUv: number;
  expoPv: number;
  addcartUv: number;
  addfavUv: number;
  avgUvValue: number;
  refundGmv: number;
}

export interface DailyWis extends Wis {
  date: string;
}

export interface StoreWis {
  storeId: string;
  storeName: string;
  wis: Wis;
  history: DailyWis[];
}

const BASE_GMV: Record<string, number> = { '152': 12480, '153': 8360, '155': 19620, '161': 15480, '1957': 0 };

function makeWis(rng: () => number, base: number, dayIndex: number): Wis {
  const wave = 1 + Math.sin(dayIndex / 4) * 0.12 + (rng() - 0.5) * 0.16;
  const confirmGmv = base === 0 ? 0 : Math.max(0, Math.round(base * wave));
  const confirmRfxNum = base === 0 ? 0 : Math.max(0, Math.round(confirmGmv / (68 + rng() * 20)));
  const pdUv = base === 0 ? 0 : Math.max(1, Math.round(confirmRfxNum * (32 + rng() * 16)));
  const pdPv = pdUv * (2 + Math.round(rng() * 2));
  return {
    confirmGmv,
    startedGmv: Math.round(confirmGmv * (1.08 + rng() * 0.12)),
    confirmRfxNum,
    confirmBuyerNum: Math.max(0, Math.round(confirmRfxNum * (0.88 + rng() * 0.1))),
    dealTransRate: base === 0 ? 0 : Number((0.018 + rng() * 0.022).toFixed(4)),
    unitPrice: confirmRfxNum === 0 ? 0 : Number((confirmGmv / confirmRfxNum).toFixed(2)),
    pdPv,
    pdUv,
    expoPv: Math.round(pdPv * (1.1 + rng() * 0.8)),
    addcartUv: Math.round(pdUv * (0.05 + rng() * 0.05)),
    addfavUv: Math.round(pdUv * (0.03 + rng() * 0.04)),
    avgUvValue: pdUv === 0 ? 0 : Number((confirmGmv / pdUv).toFixed(2)),
    refundGmv: Math.round(confirmGmv * (0.01 + rng() * 0.03)),
  };
}

function aggregate(history: DailyWis[]): Wis {
  const total = history.reduce(
    (acc, day) => {
      acc.confirmGmv += day.confirmGmv;
      acc.startedGmv += day.startedGmv;
      acc.confirmRfxNum += day.confirmRfxNum;
      acc.confirmBuyerNum += day.confirmBuyerNum;
      acc.pdPv += day.pdPv;
      acc.pdUv += day.pdUv;
      acc.expoPv += day.expoPv;
      acc.addcartUv += day.addcartUv;
      acc.addfavUv += day.addfavUv;
      acc.refundGmv += day.refundGmv;
      return acc;
    },
    {
      confirmGmv: 0,
      startedGmv: 0,
      confirmRfxNum: 0,
      confirmBuyerNum: 0,
      pdPv: 0,
      pdUv: 0,
      expoPv: 0,
      addcartUv: 0,
      addfavUv: 0,
      refundGmv: 0,
    },
  );
  return {
    ...total,
    dealTransRate: total.pdUv === 0 ? 0 : Number((total.confirmRfxNum / total.pdUv).toFixed(4)),
    unitPrice: total.confirmRfxNum === 0 ? 0 : Number((total.confirmGmv / total.confirmRfxNum).toFixed(2)),
    avgUvValue: total.pdUv === 0 ? 0 : Number((total.confirmGmv / total.pdUv).toFixed(2)),
  };
}

export const STORE_WIS: StoreWis[] = STORES.map((store, storeIndex) => {
  const rng = createRng(20261114 + storeIndex * 17);
  const history: DailyWis[] = Array.from({ length: 30 }, (_, index) => ({
    date: dayOffset(index - 29).slice(0, 10),
    ...makeWis(rng, BASE_GMV[store.id] || 0, index),
  }));
  return { storeId: store.id, storeName: store.name, wis: aggregate(history), history };
});

export const TOTAL_WIS: Wis = aggregate(
  Array.from({ length: 30 }, (_, dayIndex) => {
    const rng = createRng(20261120 + dayIndex);
    const base = Object.values(BASE_GMV).reduce((sum, value) => sum + value, 0);
    return { date: dayOffset(dayIndex - 29).slice(0, 10), ...makeWis(rng, base, dayIndex) };
  }),
);

export interface OrderReportRow {
  date: string;
  orders: number;
  sales: number;
  units: number;
  aov: number;
  refund: number;
  net: number;
}

export const ORDER_REPORT_ROWS: OrderReportRow[] = (() => {
  const rng = createRng(20261121);
  return Array.from({ length: 60 }, (_, index) => {
    const orders = intBetween(rng, 80, 320);
    const sales = Number((orders * (42 + rng() * 36)).toFixed(2));
    const refund = Number((sales * (0.01 + rng() * 0.04)).toFixed(2));
    return {
      date: dayOffset(index - 59).slice(0, 10),
      orders,
      sales,
      units: Math.round(orders * (1.2 + rng() * 0.8)),
      aov: Number((sales / orders).toFixed(2)),
      refund,
      net: Number((sales - refund).toFixed(2)),
    };
  });
})();

export const REPORT_TOTALS = ORDER_REPORT_ROWS.reduce(
  (acc, row) => {
    acc.orders += row.orders;
    acc.sales += row.sales;
    acc.units += row.units;
    acc.refund += row.refund;
    acc.net += row.net;
    return acc;
  },
  { orders: 0, sales: 0, units: 0, refund: 0, net: 0 },
);

export const STORE_PUNISHMENTS = [
  { id: 'PU001', storeId: '161', storeName: '161 sneakerhub8', type: '知识产权投诉', reason: '标题包含品牌关键词', date: '2026-10-28', status: '处理中' },
  { id: 'PU002', storeId: '152', storeName: '152 包包', type: '类目错放', reason: '商品放置在与实际不符的类目', date: '2026-10-25', status: '已处理' },
  { id: 'PU003', storeId: '155', storeName: '155 clothes', type: '图片违规', reason: '主图包含联系方式水印', date: '2026-10-22', status: '已处理' },
  { id: 'PU004', storeId: '153', storeName: '153 鞋子', type: '延迟发货', reason: '承诺时效内未发货', date: '2026-10-18', status: '已处理' },
];
