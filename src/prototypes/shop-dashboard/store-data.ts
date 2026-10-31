import { HISTORY, STORES, type MetricKey } from './data';

export interface StoreSnapshot {
  dates: string[];
  summary: Record<MetricKey, number> & { statDate: string; timeNo: string };
  series: Record<MetricKey, number[]>;
}

const METRIC_KEYS: MetricKey[] = [
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

function zeroSeries(): Record<MetricKey, number[]> {
  return METRIC_KEYS.reduce((acc, key) => {
    acc[key] = [];
    return acc;
  }, {} as Record<MetricKey, number[]>);
}

function emptySummary(statDate: string): StoreSnapshot['summary'] {
  const base = METRIC_KEYS.reduce((acc, key) => {
    acc[key] = 0;
    return acc;
  }, {} as Record<MetricKey, number>);
  return { ...base, statDate, timeNo: '' };
}

export function buildStoreSnapshot(
  scopeIds: number[] | null,
  countryId: string,
  from: string,
  to: string,
): StoreSnapshot {
  const ids = scopeIds && scopeIds.length ? scopeIds : STORES.map((store) => store.id);
  const histories = ids
    .map((id) => HISTORY[`${id}-${countryId}`])
    .filter((history): history is NonNullable<typeof history> => Boolean(history));

  if (!histories.length) {
    return { dates: [], summary: emptySummary(to), series: zeroSeries() };
  }

  const allDates = histories[0].dates;
  const picked = allDates
    .map((date, index) => ({ date, index }))
    .filter((item) => item.date >= from && item.date <= to);
  if (!picked.length) {
    return { dates: [], summary: emptySummary(to), series: zeroSeries() };
  }

  const dates = picked.map((item) => item.date);
  const series = zeroSeries();
  const totals = {
    gmv: 0,
    buyers: 0,
    uv: 0,
    startedBuyers: 0,
    orders: 0,
    qty: 0,
    startedOrders: 0,
    obWeighted: 0,
    obWeight: 0,
    uvValueWeighted: 0,
    uvValueWeight: 0,
    unitWeighted: 0,
    unitWeight: 0,
    dealRateSum: 0,
    startedRateSum: 0,
    obRateSum: 0,
    avgUvSum: 0,
    unitSum: 0,
    days: 0,
  };

  dates.forEach((date, dayIndex) => {
    const sourceIndex = picked[dayIndex].index;
    let gmv = 0;
    let buyers = 0;
    let uv = 0;
    let startedBuyers = 0;
    let orders = 0;
    let qty = 0;
    let startedOrders = 0;
    let pv = 0;
    let expo = 0;
    let addcartUv = 0;
    let addcartIcNum = 0;
    let addfavUv = 0;
    let startedGmv = 0;
    let obWeighted = 0;
    let uvValueWeighted = 0;
    let unitWeighted = 0;
    let dealRateSum = 0;
    let startedRateSum = 0;
    let obRateSum = 0;
    let avgUvSum = 0;
    let unitSum = 0;

    histories.forEach((history) => {
      const s = history.series;
      const storeBuyers = s.confirmBuyerNum[sourceIndex] || 0;
      const storeUv = s.pdUv[sourceIndex] || 0;
      gmv += s.confirmGmv[sourceIndex] || 0;
      buyers += storeBuyers;
      uv += storeUv;
      startedBuyers += s.startedBuyerNum[sourceIndex] || 0;
      orders += s.confirmRfxNum[sourceIndex] || 0;
      qty += s.confirmProdQt[sourceIndex] || 0;
      startedOrders += s.startedRfxNum[sourceIndex] || 0;
      startedGmv += s.startedGmv[sourceIndex] || 0;
      pv += s.pdPv[sourceIndex] || 0;
      expo += s.expoPv[sourceIndex] || 0;
      addcartUv += s.addcartUv[sourceIndex] || 0;
      addcartIcNum += s.addcartIcNum[sourceIndex] || 0;
      addfavUv += s.addfavUv[sourceIndex] || 0;
      obWeighted += (s.obRate[sourceIndex] || 0) * storeBuyers;
      uvValueWeighted += (s.avgUvValue[sourceIndex] || 0) * storeUv;
      unitWeighted += (s.unitPrice[sourceIndex] || 0) * storeBuyers;
      dealRateSum += s.dealTransRate[sourceIndex] || 0;
      startedRateSum += s.startedTransRate[sourceIndex] || 0;
      obRateSum += s.obRate[sourceIndex] || 0;
      avgUvSum += s.avgUvValue[sourceIndex] || 0;
      unitSum += s.unitPrice[sourceIndex] || 0;
    });

    const count = histories.length;
    series.confirmGmv[dayIndex] = gmv;
    series.confirmBuyerNum[dayIndex] = buyers;
    series.confirmRfxNum[dayIndex] = orders;
    series.confirmProdQt[dayIndex] = qty;
    series.startedGmv[dayIndex] = startedGmv;
    series.startedBuyerNum[dayIndex] = startedBuyers;
    series.startedRfxNum[dayIndex] = startedOrders;
    series.pdPv[dayIndex] = pv;
    series.pdUv[dayIndex] = uv;
    series.expoPv[dayIndex] = expo;
    series.addcartUv[dayIndex] = addcartUv;
    series.addcartIcNum[dayIndex] = addcartIcNum;
    series.addfavUv[dayIndex] = addfavUv;
    series.dealTransRate[dayIndex] = uv > 0 ? buyers / uv : dealRateSum / count;
    series.startedTransRate[dayIndex] = uv > 0 ? startedBuyers / uv : startedRateSum / count;
    series.obRate[dayIndex] = buyers > 0 ? obWeighted / buyers : obRateSum / count;
    series.unitPrice[dayIndex] = buyers > 0 ? gmv / buyers : unitSum / count;
    series.avgUvValue[dayIndex] = uv > 0 ? gmv / uv : avgUvSum / count;

    totals.gmv += gmv;
    totals.buyers += buyers;
    totals.uv += uv;
    totals.startedBuyers += startedBuyers;
    totals.orders += orders;
    totals.qty += qty;
    totals.startedOrders += startedOrders;
    totals.obWeighted += obWeighted;
    totals.obWeight += buyers;
    totals.uvValueWeighted += uvValueWeighted;
    totals.uvValueWeight += uv;
    totals.unitWeighted += unitWeighted;
    totals.unitWeight += buyers;
    totals.dealRateSum += dealRateSum;
    totals.startedRateSum += startedRateSum;
    totals.obRateSum += obRateSum;
    totals.avgUvSum += avgUvSum;
    totals.unitSum += unitSum;
    totals.days += 1;
  });

  const days = totals.days || 1;
  const summary: StoreSnapshot['summary'] = {
    statDate: dates[dates.length - 1],
    timeNo: '',
    confirmGmv: totals.gmv,
    confirmBuyerNum: totals.buyers,
    dealTransRate: totals.uv > 0 ? totals.buyers / totals.uv : totals.dealRateSum / days,
    unitPrice: totals.buyers > 0 ? totals.gmv / totals.buyers : totals.unitSum / days,
    obRate: totals.obWeight > 0 ? totals.obWeighted / totals.obWeight : totals.obRateSum / days,
    confirmRfxNum: totals.orders,
    confirmProdQt: totals.qty,
    startedGmv: series.startedGmv.reduce((sum, value) => sum + value, 0),
    startedBuyerNum: totals.startedBuyers,
    startedTransRate: totals.uv > 0 ? totals.startedBuyers / totals.uv : totals.startedRateSum / days,
    startedRfxNum: totals.startedOrders,
    pdPv: series.pdPv.reduce((sum, value) => sum + value, 0),
    pdUv: totals.uv,
    expoPv: series.expoPv.reduce((sum, value) => sum + value, 0),
    avgUvValue: totals.uv > 0 ? totals.gmv / totals.uv : totals.avgUvSum / days,
    addcartUv: series.addcartUv.reduce((sum, value) => sum + value, 0),
    addcartIcNum: series.addcartIcNum.reduce((sum, value) => sum + value, 0),
    addfavUv: series.addfavUv.reduce((sum, value) => sum + value, 0),
  };

  return { dates, summary, series };
}
