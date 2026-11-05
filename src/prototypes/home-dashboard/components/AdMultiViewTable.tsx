import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import {
  accOfProd,
  buildAdKpis,
  buildAdTrend,
  buildItemRows,
  buildPlanRows,
  buildStoreSnapshot,
  buildStoreTableRows,
  buildWordRows,
  filterOrder,
  filterProd,
  finalize,
  previousRange,
  rangeDays,
  sortByNumber,
} from '../data/aggregate';
import { AD_KPI_TREND, AD_TREND_KPI_KEYS, AD_TREND_LABELS, adKpiText, adTrendAxisFormat, adTrendFormat, type AdTrendView } from '../data/adTrend';
import { fmtDelta, fmtInt, fmtMoney, fmtPct, fmtRoas } from '../data/format';
import { getDataset } from '../data/generate';
import { AD_TYPE_LABEL, type ExclusionConfig, type ItemRow, type PlanRow, type WordRow } from '../data/types';
import { AdItemDrawer } from './AdItemDrawer';
import { Chart } from './Chart';
import { Select } from './Select';
import { Sparkline } from './Sparkline';
import { Tooltip } from './Tooltip';

const VIEWS: Array<{ key: 'store' | 'item' | 'plan' | 'word'; label: string }> = [
  { key: 'store', label: '店铺视图' },
  { key: 'item', label: '商品视图' },
  { key: 'plan', label: '计划视图' },
  { key: 'word', label: '成单词视图' },
];

interface AdStoreRow {
  storeId: number;
  storeName: string;
  alias: string;
  daysAvailable: number;
  adCost: number;
  adGmv: number;
  storeGmv: number;
  adRatio: number | null;
  roas: number | null;
  adCostDelta: number | null;
}

function sortMark(active: boolean, direction: 'asc' | 'desc'): string {
  if (!active) return '↕';
  return direction === 'asc' ? '↑' : '↓';
}

function AdTypeChips({ row }: { row: { adTypes: ItemRow['adTypes'] } }) {
  return (
    <span className="hd-chips">
      {row.adTypes.map((type) => <span className="hd-chip" key={type}>{AD_TYPE_LABEL[type]}</span>)}
    </span>
  );
}

function AdStoreTrendDialog({
  storeId,
  storeName,
  from,
  to,
  exclusionEnabled,
  configs,
  initialMetric,
  onClose,
}: {
  storeId: number;
  storeName: string;
  from: string;
  to: string;
  exclusionEnabled: boolean;
  configs: ExclusionConfig[];
  initialMetric: AdTrendView;
  onClose: () => void;
}) {
  const [metric, setMetric] = useState<AdTrendView>(initialMetric);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const rows = useMemo(() => filterProd(getDataset().prodRows, { storeIds: [storeId], adType: '', from, to }), [storeId, from, to]);
  const prevRange = useMemo(() => previousRange(from, to), [from, to]);
  const prevRows = useMemo(
    () => filterProd(getDataset().prodRows, { storeIds: [storeId], adType: '', from: prevRange.from, to: prevRange.to }),
    [storeId, prevRange.from, prevRange.to],
  );
  const current = useMemo(() => finalize(accOfProd(rows)), [rows]);
  const prevMetrics = useMemo(() => finalize(accOfProd(prevRows)), [prevRows]);
  const snapshot = useMemo(
    () => buildStoreSnapshot([storeId], 'TOTAL', from, to, exclusionEnabled, configs),
    [storeId, from, to, exclusionEnabled, configs],
  );
  const prevSnapshot = useMemo(
    () => buildStoreSnapshot([storeId], 'TOTAL', prevRange.from, prevRange.to, exclusionEnabled, configs),
    [storeId, prevRange.from, prevRange.to, exclusionEnabled, configs],
  );
  const kpis = useMemo(
    () => buildAdKpis(current, prevMetrics, snapshot.summary.confirmGmv, prevSnapshot.summary.confirmGmv).filter((kpi) => AD_TREND_KPI_KEYS.includes(kpi.key)),
    [current, prevMetrics, snapshot, prevSnapshot],
  );
  const trend = useMemo(() => {
    const base = buildAdTrend(rows, from, to);
    const storeSeries = snapshot.series.confirmGmv;
    return base.map((point, index) => {
      const dayStoreGmv = storeSeries[index] ?? 0;
      return { ...point, storeGmv: dayStoreGmv, share: dayStoreGmv > 0 ? point.gmv / dayStoreGmv : null };
    });
  }, [rows, from, to, snapshot]);

  const label = AD_TREND_LABELS[metric];
  return createPortal(
    <div className="hd-modal-mask" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="hd-modal hd-store-trend-dialog" role="dialog" aria-modal="true" aria-label="店铺广告趋势">
        <div className="hd-rank-dialog-header">
          <div className="hd-rank-dialog-title-wrap">
            <span className="hd-rank-dialog-title">店铺广告趋势 · {storeName}</span>
            <span className="hd-rank-dialog-count">{label} · {from} 至 {to}</span>
          </div>
          <button type="button" className="hd-excl-close" onClick={onClose} aria-label="关闭"><X size={18} /></button>
        </div>
        <div className="hd-ad-trend-kpis">
          {kpis.map((kpi) => (
            <button
              type="button"
              key={kpi.key}
              className={`hd-store-kpi${metric === AD_KPI_TREND[kpi.key] ? ' is-active' : ''}`}
              onClick={() => setMetric(AD_KPI_TREND[kpi.key])}
            >
              <span className="hd-store-kpi-label">
                {kpi.label}
                <Tooltip content={kpi.hint}><span className="hd-help">?</span></Tooltip>
              </span>
              <strong>{adKpiText(kpi.format, kpi.value)}</strong>
            </button>
          ))}
        </div>
        <Chart
          labels={trend.map((point) => point.date.slice(5).replace('-', '/'))}
          series={[{ key: metric, label, color: '#ff8a3d', values: trend.map((point) => point[metric]), area: true }]}
          height={250}
          formatValue={(value) => adTrendFormat(metric, value)}
          axisFormat={adTrendAxisFormat(metric)}
          tipRows={(index) => [{ label, value: adTrendFormat(metric, trend[index][metric]), color: '#ff8a3d' }]}
          ariaLabel={`${storeName} ${label}趋势`}
        />
      </div>
    </div>,
    document.body,
  );
}

export function AdMultiViewTable({
  storeIds,
  from,
  to,
  exclusionEnabled,
  configs,
  trendMetric,
}: {
  storeIds: number[];
  from: string;
  to: string;
  exclusionEnabled: boolean;
  configs: ExclusionConfig[];
  trendMetric: AdTrendView;
}) {
  const [view, setView] = useState<'store' | 'item' | 'plan' | 'word'>('store');
  const [sortKey, setSortKey] = useState<string>('adRatio');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [drawer, setDrawer] = useState<ItemRow | null>(null);
  const [wordExpanded, setWordExpanded] = useState<string | null>(null);
  const [trendView, setTrendView] = useState<{ storeId: number; storeName: string } | null>(null);
  const rangeLength = rangeDays(from, to);

  const adRows = useMemo(
    () => (storeIds.length ? filterProd(getDataset().prodRows, { storeIds, adType: '', from, to }) : []),
    [storeIds, from, to],
  );
  const orderRows = useMemo(
    () => (storeIds.length ? filterOrder(getDataset().orderRows, { storeIds, adType: '', from, to }) : []),
    [storeIds, from, to],
  );
  const prevRange = useMemo(() => previousRange(from, to), [from, to]);
  const prevRows = useMemo(
    () => (storeIds.length ? filterProd(getDataset().prodRows, { storeIds, adType: '', from: prevRange.from, to: prevRange.to }) : []),
    [storeIds, prevRange.from, prevRange.to],
  );

  const current = useMemo(() => finalize(accOfProd(adRows)), [adRows]);
  const itemRows = useMemo(() => buildItemRows(adRows), [adRows]);
  const planRows = useMemo(() => buildPlanRows(adRows), [adRows]);
  const wordRows = useMemo(() => buildWordRows(orderRows), [orderRows]);

  const storeRows = useMemo<AdStoreRow[]>(() => {
    if (!storeIds.length) return [];
    const summaries = buildStoreTableRows(storeIds, 'TOTAL', from, to, exclusionEnabled, configs);
    return storeIds.map((storeId) => {
      const metrics = finalize(accOfProd(adRows.filter((row) => row.storeId === storeId)));
      const prev = finalize(accOfProd(prevRows.filter((row) => row.storeId === storeId)));
      const summary = summaries.find((row) => row.storeId === storeId);
      const storeGmv = summary?.summary.confirmGmv ?? 0;
      return {
        storeId,
        storeName: summary?.storeName ?? String(storeId),
        alias: summary?.alias ?? '',
        daysAvailable: summary?.daysAvailable ?? 0,
        adCost: metrics.cost,
        adGmv: metrics.gmv,
        storeGmv,
        adRatio: storeGmv > 0 ? metrics.gmv / storeGmv : null,
        roas: metrics.roas,
        adCostDelta: prev.cost > 0 ? (metrics.cost - prev.cost) / prev.cost : null,
      };
    });
  }, [storeIds, adRows, prevRows, from, to, exclusionEnabled, configs]);

  const rows = view === 'store' ? storeRows : view === 'item' ? itemRows : view === 'plan' ? planRows : wordRows;
  const sorted = useMemo(() => {
    if (view === 'word') {
      return sortByNumber(wordRows, (row) => (sortKey === 'orderCount' ? row.orderCount : sortKey === 'itemCount' ? row.itemCount : row.gmv), sortDir);
    }
    return sortByNumber(rows as Array<ItemRow | PlanRow | AdStoreRow>, (row) => {
      const value = (row as unknown as Record<string, unknown>)[sortKey];
      return typeof value === 'number' && Number.isFinite(value) ? value : null;
    }, sortDir);
  }, [view, rows, wordRows, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageRows = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const storeTrends = useMemo(() => {
    const map = new Map<number, number[]>();
    if (view !== 'store') return map;
    const byStore = new Map<number, typeof adRows>();
    adRows.forEach((row) => {
      const list = byStore.get(row.storeId);
      if (list) list.push(row);
      else byStore.set(row.storeId, [row]);
    });
    (pageRows as AdStoreRow[]).forEach((row) => {
      const trend = buildAdTrend(byStore.get(row.storeId) ?? [], from, to);
      if (trendMetric === 'storeGmv' || trendMetric === 'share') {
        const series = buildStoreSnapshot([row.storeId], 'TOTAL', from, to, exclusionEnabled, configs).series.confirmGmv;
        map.set(row.storeId, trend.map((point, index) => {
          const dayStoreGmv = series[index] ?? 0;
          if (trendMetric === 'storeGmv') return dayStoreGmv;
          return dayStoreGmv > 0 ? point.gmv / dayStoreGmv : NaN;
        }));
        return;
      }
      map.set(row.storeId, trend.map((point) => {
        const value = point[trendMetric];
        return typeof value === 'number' ? value : NaN;
      }));
    });
    return map;
  }, [view, pageRows, adRows, from, to, trendMetric, exclusionEnabled, configs]);

  const storeTotals = useMemo(() => {
    const acc = storeRows.reduce(
      (sum, row) => ({ adCost: sum.adCost + row.adCost, adGmv: sum.adGmv + row.adGmv, storeGmv: sum.storeGmv + row.storeGmv }),
      { adCost: 0, adGmv: 0, storeGmv: 0 },
    );
    return {
      ...acc,
      adRatio: acc.storeGmv > 0 ? acc.adGmv / acc.storeGmv : null,
      roas: acc.adCost > 0 ? acc.adGmv / acc.adCost : null,
    };
  }, [storeRows]);

  const wordTotals = useMemo(() => {
    const orderIds = new Set<string>();
    const itemCodes = new Set<string>();
    let gmv = 0;
    wordRows.forEach((row) => {
      gmv += row.gmv;
      row.orders.forEach((order) => {
        orderIds.add(order.orderNo);
        order.items.forEach((item) => itemCodes.add(item.code));
      });
    });
    return { orderCount: orderIds.size, gmv, itemCount: itemCodes.size };
  }, [wordRows]);

  const toggleSort = (key: string, defaultDirection: 'asc' | 'desc' = 'desc') => {
    if (sortKey === key) setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir(defaultDirection);
    }
    setPage(1);
  };

  const switchView = (next: 'store' | 'item' | 'plan' | 'word') => {
    setView(next);
    setSortKey(next === 'store' ? 'adRatio' : next === 'word' ? 'gmv' : 'cost');
    setSortDir('desc');
    setPage(1);
    setWordExpanded(null);
  };

  const counts = { store: storeRows.length, item: itemRows.length, plan: planRows.length, word: wordRows.length };

  if (!storeIds.length) {
    return <div className="hd-glass hd-l2-card"><div className="hd-empty hd-empty-lg">当前筛选没有可投放的广告店铺</div></div>;
  }

  return (
    <div className="hd-glass hd-l2-card">
      <div className="hd-l2-card-head">
        <div className="hd-table-tabs">
          {VIEWS.map((item) => (
            <button type="button" key={item.key} className={`hd-table-tab${view === item.key ? ' is-active' : ''}`} onClick={() => switchView(item.key)}>
              {item.label}
              <span className="hd-table-tab-count">{counts[item.key]}</span>
            </button>
          ))}
        </div>
      </div>

      {view === 'store' ? (
        <div className="hd-table-wrap">
          <table className="hd-table">
            <colgroup>
              <col style={{ width: 280 }} />
              <col style={{ width: 120 }} />
            </colgroup>
            <thead>
              <tr>
                <th>店铺</th>
                <th>趋势</th>
                <th className="is-num" onClick={() => toggleSort('adCost')}>广告消耗 {sortMark(sortKey === 'adCost', sortDir)}</th>
                <th className="is-num" onClick={() => toggleSort('adGmv')}>广告 GMV {sortMark(sortKey === 'adGmv', sortDir)}</th>
                <th className="is-num" onClick={() => toggleSort('storeGmv')}>整店 GMV {sortMark(sortKey === 'storeGmv', sortDir)}</th>
                <th className="is-num" onClick={() => toggleSort('adRatio')}>广告 GMV 占比 {sortMark(sortKey === 'adRatio', sortDir)}</th>
                <th className="is-num" onClick={() => toggleSort('roas')}>投产比 {sortMark(sortKey === 'roas', sortDir)}</th>
                <th className="is-num" onClick={() => toggleSort('adCostDelta')}>广告消耗环比 {sortMark(sortKey === 'adCostDelta', sortDir)}</th>
              </tr>
            </thead>
            <tbody>
              {(pageRows as AdStoreRow[]).map((row) => (
                <tr key={row.storeId}>
                  <td>
                    <span className="hd-store-cell">
                      <strong>{row.storeName}</strong>
                      {row.alias ? <em>{row.alias}</em> : null}
                      {row.daysAvailable === 0 ? <span className="hd-tag is-muted">无数据</span> : row.daysAvailable < rangeLength ? <span className="hd-tag is-warn">数据不足 {rangeLength - row.daysAvailable} 天</span> : null}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="hd-spark"
                      title={`查看${AD_TREND_LABELS[trendMetric]}趋势`}
                      onClick={() => setTrendView({ storeId: row.storeId, storeName: row.storeName })}
                    >
                      <Sparkline values={storeTrends.get(row.storeId) ?? []} />
                    </button>
                  </td>
                  <td className="is-num">{fmtMoney(row.adCost)}</td>
                  <td className="is-num">{fmtMoney(row.adGmv)}</td>
                  <td className="is-num">{fmtMoney(row.storeGmv)}</td>
                  <td className="is-num">{fmtPct(row.adRatio, 1)}</td>
                  <td className={`is-num${row.roas !== null && row.roas < 1 ? ' is-danger' : ''}`}>{fmtRoas(row.roas)}</td>
                  <td className={`is-num${row.adCostDelta !== null && row.adCostDelta > 0 ? ' is-danger' : row.adCostDelta !== null && row.adCostDelta < 0 ? ' is-success' : ''}`}>
                    {fmtDelta(row.adCostDelta)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td>合计 {storeRows.length} 家店</td>
                <td />
                <td className="is-num">{fmtMoney(storeTotals.adCost)}</td>
                <td className="is-num">{fmtMoney(storeTotals.adGmv)}</td>
                <td className="is-num">{fmtMoney(storeTotals.storeGmv)}</td>
                <td className="is-num">{fmtPct(storeTotals.adRatio, 1)}</td>
                <td className="is-num">{fmtRoas(storeTotals.roas)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      ) : view === 'word' ? (
        <div className="hd-table-wrap">
          <table className="hd-table is-wide">
            <thead>
              <tr>
                <th>店铺</th>
                <th>成单词</th>
                <th>来源广告</th>
                <th className="is-num" onClick={() => toggleSort('orderCount')}>订单数 {sortMark(sortKey === 'orderCount', sortDir)}</th>
                <th className="is-num" onClick={() => toggleSort('gmv')}>GMV {sortMark(sortKey === 'gmv', sortDir)}</th>
                <th className="is-num" onClick={() => toggleSort('itemCount')}>涉及商品数 {sortMark(sortKey === 'itemCount', sortDir)}</th>
                <th>最近成单日</th>
                <th>订单明细</th>
              </tr>
            </thead>
            <tbody>
              {(pageRows as WordRow[]).map((row) => (
                <React.Fragment key={row.key}>
                  <tr>
                    <td>{row.storeName}</td>
                    <td className="hd-cell-strong">{row.word || '无搜索词（自动广告）'}</td>
                    <td><AdTypeChips row={row} /></td>
                    <td className="is-num">{fmtInt(row.orderCount)}</td>
                    <td className="is-num">{fmtMoney(row.gmv)}</td>
                    <td className="is-num">{fmtInt(row.itemCount)}</td>
                    <td>{row.lastDate}</td>
                    <td>
                      <span className="hd-link" onClick={() => setWordExpanded((value) => (value === row.key ? null : row.key))}>
                        {wordExpanded === row.key ? '收起' : `${row.orders.length} 笔`}
                      </span>
                    </td>
                  </tr>
                  {wordExpanded === row.key ? (
                    <tr className="hd-table-subrow">
                      <td colSpan={8}>
                        <div className="hd-word-orders">
                          {row.orders.slice(0, 6).map((order) => (
                            <div className="hd-word-order" key={order.orderNo}>
                              <span>{order.orderNo}</span>
                              <span>{order.date}</span>
                              <span>{order.items.map((item) => item.name).join('；')}</span>
                              <strong>{fmtMoney(order.amount)}</strong>
                            </div>
                          ))}
                          {row.orders.length > 6 ? <div className="hd-muted">仅展示金额最高的 6 笔</div> : null}
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </React.Fragment>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td>合计</td>
                <td>{wordRows.length} 个成单词</td>
                <td />
                <td className="is-num">{fmtInt(wordTotals.orderCount)}</td>
                <td className="is-num">{fmtMoney(wordTotals.gmv)}</td>
                <td className="is-num">{fmtInt(wordTotals.itemCount)}</td>
                <td />
                <td><span className="hd-muted">按订单号去重</span></td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <div className="hd-table-wrap">
          <table className="hd-table is-wide">
            <thead>
              <tr className="hd-table-groups">
                <th rowSpan={2}>店铺</th>
                <th rowSpan={2}>{view === 'item' ? '商品' : '计划'}</th>
                <th colSpan={4}>流量</th>
                <th colSpan={3}>转化</th>
                <th colSpan={3}>收入</th>
              </tr>
              <tr>
                <th className="is-num" onClick={() => toggleSort('imp')}>曝光量 {sortMark(sortKey === 'imp', sortDir)}</th>
                <th className="is-num" onClick={() => toggleSort('click')}>点击量 {sortMark(sortKey === 'click', sortDir)}</th>
                <th className="is-num" onClick={() => toggleSort('ctr')}>点击率 {sortMark(sortKey === 'ctr', sortDir)}</th>
                <th className="is-num" onClick={() => toggleSort('cpc')}>点击单价 {sortMark(sortKey === 'cpc', sortDir)}</th>
                <th className="is-num" onClick={() => toggleSort('orders')}>订单数 {sortMark(sortKey === 'orders', sortDir)}</th>
                <th className="is-num" onClick={() => toggleSort('cvr')}>转化率 {sortMark(sortKey === 'cvr', sortDir)}</th>
                <th className="is-num" onClick={() => toggleSort('cpa')}>单均花费 {sortMark(sortKey === 'cpa', sortDir)}</th>
                <th className="is-num" onClick={() => toggleSort('cost')}>广告花费 {sortMark(sortKey === 'cost', sortDir)}</th>
                <th className="is-num" onClick={() => toggleSort('gmv')}>广告 GMV {sortMark(sortKey === 'gmv', sortDir)}</th>
                <th className="is-num" onClick={() => toggleSort('roas')}>ROAS {sortMark(sortKey === 'roas', sortDir)}</th>
              </tr>
            </thead>
            <tbody>
              {view === 'item' ? (pageRows as ItemRow[]).map((row) => (
                <tr key={row.key} className="is-clickable" onClick={() => setDrawer(row)}>
                  <td>{row.storeName}</td>
                  <td>
                    <span className="hd-item-cell">
                      {row.thumb ? <img src={row.thumb} alt="" /> : <span className="hd-item-thumb-ph" />}
                      <span className="hd-item-text">
                        <strong>{row.name}</strong>
                        <em>{row.itemcode}</em>
                        <AdTypeChips row={row} />
                      </span>
                      {row.zeroConv ? <span className="hd-tag is-danger">零转化</span> : null}
                    </span>
                  </td>
                  <td className="is-num">{fmtInt(row.imp)}</td>
                  <td className="is-num">{fmtInt(row.click)}</td>
                  <td className="is-num">{fmtPct(row.ctr)}</td>
                  <td className="is-num">{fmtMoney(row.cpc)}</td>
                  <td className="is-num">{fmtInt(row.orders)}</td>
                  <td className="is-num">{fmtPct(row.cvr)}</td>
                  <td className="is-num">{fmtMoney(row.cpa)}</td>
                  <td className="is-num">{fmtMoney(row.cost)}</td>
                  <td className="is-num">{fmtMoney(row.gmv)}</td>
                  <td className={`is-num${row.lowRoas ? ' is-danger' : ''}`}>{fmtRoas(row.roas)}</td>
                </tr>
              )) : (pageRows as PlanRow[]).map((row) => (
                <tr key={row.key}>
                  <td>{row.storeName}</td>
                  <td>
                    <span className="hd-plan-cell">
                      <span className="hd-chip">{AD_TYPE_LABEL[row.adType]}</span>
                      <span>{row.planName || '全店自动'}</span>
                      {row.groupName ? <em>{row.groupName}</em> : null}
                    </span>
                  </td>
                  <td className="is-num">{fmtInt(row.imp)}</td>
                  <td className="is-num">{fmtInt(row.click)}</td>
                  <td className="is-num">{fmtPct(row.ctr)}</td>
                  <td className="is-num">{fmtMoney(row.cpc)}</td>
                  <td className="is-num">{fmtInt(row.orders)}</td>
                  <td className="is-num">{fmtPct(row.cvr)}</td>
                  <td className="is-num">{fmtMoney(row.cpa)}</td>
                  <td className="is-num">{fmtMoney(row.cost)}</td>
                  <td className="is-num">{fmtMoney(row.gmv)}</td>
                  <td className={`is-num${row.lowRoas ? ' is-danger' : ''}`}>{fmtRoas(row.roas)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td>合计</td>
                <td>{view === 'item' ? `${itemRows.length} 个商品` : `${planRows.length} 个计划/广告组`}<span className="hd-muted"> · 不受分页影响</span></td>
                <td className="is-num">{fmtInt(current.imp)}</td>
                <td className="is-num">{fmtInt(current.click)}</td>
                <td className="is-num">{fmtPct(current.ctr)}</td>
                <td className="is-num">{fmtMoney(current.cpc)}</td>
                <td className="is-num">{fmtInt(current.orders)}</td>
                <td className="is-num">{fmtPct(current.cvr)}</td>
                <td className="is-num">{fmtMoney(current.cpa)}</td>
                <td className="is-num">{fmtMoney(current.cost)}</td>
                <td className="is-num">{fmtMoney(current.gmv)}</td>
                <td className="is-num">{fmtRoas(current.roas)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <div className="hd-pager-bar">
        <span>共 {sorted.length} 条</span>
        <div className="hd-pager">
          <button type="button" disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>‹</button>
          {Array.from({ length: pageCount }, (_, index) => index + 1).map((item) => (
            <button type="button" key={item} className={currentPage === item ? 'is-active' : ''} onClick={() => setPage(item)}>{item}</button>
          ))}
          <button type="button" disabled={currentPage >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>›</button>
        </div>
        <Select value={pageSize} options={[10, 20, 50, 100].map((value) => ({ value, label: `${value} 条/页` }))} width={110} onChange={(value) => { setPageSize(Number(value)); setPage(1); }} />
      </div>

      {drawer ? (
        <AdItemDrawer
          row={drawer}
          prodRows={adRows}
          orderRows={orderRows}
          from={from}
          to={to}
          onClose={() => setDrawer(null)}
        />
      ) : null}

      {trendView ? (
        <AdStoreTrendDialog
          storeId={trendView.storeId}
          storeName={trendView.storeName}
          from={from}
          to={to}
          exclusionEnabled={exclusionEnabled}
          configs={configs}
          initialMetric={trendMetric}
          onClose={() => setTrendView(null)}
        />
      ) : null}
    </div>
  );
}
