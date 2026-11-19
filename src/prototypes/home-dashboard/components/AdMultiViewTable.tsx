import React, { useMemo, useState } from 'react';
import {
  accOfProd,
  buildAdTrend,
  buildItemRows,
  buildPlanRows,
  buildStoreSnapshot,
  buildStoreTableRows,
  buildWordRows,
  filterOrder,
  filterProd,
  finalize,
  rangeDays,
  sortByNumber,
} from '../data/aggregate';
import { AD_TREND_LABELS, type AdTrendView } from '../data/adTrend';
import { fmtInt, fmtMoney, fmtPct, fmtRoas } from '../data/format';
import { eachDay, getDataset } from '../data/generate';
import { METRIC_TIPS } from '../data/metricTips';
import { AD_TYPE_LABEL, type AdType, type ExclusionConfig, type ItemRow, type PlanRow, type ProdReportRow, type WordRow } from '../data/types';
import { AdItemDrawer } from './AdItemDrawer';
import { AdWordDrawer } from './AdWordDrawer';
import { MetricHelp } from './MetricHelp';
import { Select } from './Select';
import { Sparkline } from './Sparkline';

const VIEWS: Array<{ key: 'store' | 'item' | 'plan' | 'word'; label: string }> = [
  { key: 'store', label: '店铺视图' },
  { key: 'item', label: '商品视图' },
  { key: 'plan', label: '计划视图' },
  { key: 'word', label: '成单词视图' },
];

type AdViewKey = 'store' | 'item' | 'plan' | 'word';
type AdViewFilter = { adType: '' | AdType; keyword: string };

const AD_TYPE_OPTIONS = [
  { value: '', label: '全部广告' },
  { value: 'ppc', label: '手动广告' },
  { value: 'prodauto', label: '商品自动' },
  { value: 'shopauto', label: '全店自动' },
];

const VIEW_SEARCH_PLACEHOLDER: Record<AdViewKey, string> = {
  store: '',
  item: '搜索商品名称/ID',
  plan: '搜索计划/广告组',
  word: '搜索成单词',
};

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
}

type DrawerTarget =
  | { kind: 'item'; row: ItemRow }
  | { kind: 'store'; storeId: number; storeName: string; alias: string }
  | { kind: 'plan'; row: PlanRow }
  | { kind: 'word'; row: WordRow };

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

export function AdMultiViewTable({
  storeIds,
  from,
  to,
  exclusionEnabled,
  configs,
  trendMetric,
  kpiKeys,
}: {
  storeIds: number[];
  from: string;
  to: string;
  exclusionEnabled: boolean;
  configs: ExclusionConfig[];
  trendMetric: AdTrendView;
  kpiKeys: string[];
}) {
  const [view, setView] = useState<AdViewKey>('store');
  const [sortKey, setSortKey] = useState<string>('adRatio');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [drawer, setDrawer] = useState<DrawerTarget | null>(null);
  const [viewFilters, setViewFilters] = useState<Record<AdViewKey, AdViewFilter>>({
    store: { adType: '', keyword: '' },
    item: { adType: '', keyword: '' },
    plan: { adType: '', keyword: '' },
    word: { adType: '', keyword: '' },
  });
  const rangeLength = rangeDays(from, to);
  const viewFilter = viewFilters[view];
  const updateFilter = (patch: Partial<AdViewFilter>) => {
    setViewFilters((prev) => ({ ...prev, [view]: { ...prev[view], ...patch } }));
    setPage(1);
  };

  const adRows = useMemo(
    () => (storeIds.length ? filterProd(getDataset().prodRows, { storeIds, adType: '', from, to }) : []),
    [storeIds, from, to],
  );
  const orderRows = useMemo(
    () => (storeIds.length ? filterOrder(getDataset().orderRows, { storeIds, adType: '', from, to }) : []),
    [storeIds, from, to],
  );
  const activeAdRows = useMemo(
    () => (view !== 'store' && viewFilter.adType ? adRows.filter((row) => row.adType === viewFilter.adType) : adRows),
    [adRows, view, viewFilter.adType],
  );
  const activeOrderRows = useMemo(
    () => (view !== 'store' && viewFilter.adType ? orderRows.filter((row) => row.adType === viewFilter.adType) : orderRows),
    [orderRows, view, viewFilter.adType],
  );
  const itemRows = useMemo(() => buildItemRows(activeAdRows), [activeAdRows]);
  const planRows = useMemo(() => buildPlanRows(activeAdRows), [activeAdRows]);
  const wordRows = useMemo(() => buildWordRows(activeOrderRows), [activeOrderRows]);

  const storeRows = useMemo<AdStoreRow[]>(() => {
    if (!storeIds.length) return [];
    const summaries = buildStoreTableRows(storeIds, 'TOTAL', from, to, exclusionEnabled, configs);
    return storeIds.map((storeId) => {
      const metrics = finalize(accOfProd(adRows.filter((row) => row.storeId === storeId)));
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
      };
    });
  }, [storeIds, adRows, from, to, exclusionEnabled, configs]);

  const keyword = viewFilter.keyword.trim().toLowerCase();
  const rows = useMemo(() => {
    if (view === 'store') return storeRows;
    if (view === 'item') {
      const list = itemRows as ItemRow[];
      return keyword ? list.filter((row) => row.name.toLowerCase().includes(keyword) || row.itemcode.includes(keyword)) : list;
    }
    if (view === 'plan') {
      const list = planRows as PlanRow[];
      return keyword ? list.filter((row) => `${row.planName} ${row.groupName}`.toLowerCase().includes(keyword)) : list;
    }
    const list = wordRows as WordRow[];
    return keyword ? list.filter((row) => (row.word || '无搜索词（自动广告）').toLowerCase().includes(keyword)) : list;
  }, [view, keyword, storeRows, itemRows, planRows, wordRows]);
  const baseCounts = useMemo(() => ({
    store: storeIds.length,
    item: buildItemRows(adRows).length,
    plan: buildPlanRows(adRows).length,
    word: buildWordRows(orderRows).length,
  }), [storeIds, adRows, orderRows]);
  const counts = { ...baseCounts, [view]: rows.length };
  const sorted = useMemo(() => {
    if (view === 'word') {
      const list = rows as WordRow[];
      if (sortKey === 'lastDate') {
        return [...list].sort((a, b) => (sortDir === 'asc' ? a.lastDate.localeCompare(b.lastDate) : b.lastDate.localeCompare(a.lastDate)));
      }
      return sortByNumber(list, (row) => (sortKey === 'orderCount' ? row.orderCount : sortKey === 'itemCount' ? row.itemCount : row.gmv), sortDir);
    }
    return sortByNumber(rows as Array<ItemRow | PlanRow | AdStoreRow>, (row) => {
      const value = (row as unknown as Record<string, unknown>)[sortKey];
      return typeof value === 'number' && Number.isFinite(value) ? value : null;
    }, sortDir);
  }, [view, rows, sortKey, sortDir]);

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
    const list = view === 'word' ? (rows as WordRow[]) : [];
    list.forEach((row) => {
      gmv += row.gmv;
      row.orders.forEach((order) => {
        orderIds.add(order.orderNo);
        order.items.forEach((item) => itemCodes.add(item.code));
      });
    });
    return { orderCount: orderIds.size, gmv, itemCount: itemCodes.size };
  }, [view, rows]);

  const itemTotals = useMemo(() => {
    const list = view === 'item' ? (rows as ItemRow[]) : [];
    const acc = list.reduce(
      (sum, row) => ({ cost: sum.cost + row.cost, gmv: sum.gmv + row.gmv, productGmv: sum.productGmv + row.productGmv }),
      { cost: 0, gmv: 0, productGmv: 0 },
    );
    return {
      ...acc,
      adRatio: acc.productGmv > 0 ? acc.gmv / acc.productGmv : null,
      roas: acc.cost > 0 ? acc.gmv / acc.cost : null,
    };
  }, [view, rows]);

  const itemTrends = useMemo(() => {
    const map = new Map<string, number[]>();
    if (view !== 'item') return map;
    const byItem = new Map<string, ProdReportRow[]>();
    activeAdRows.forEach((row) => {
      const key = `${row.storeId}__${row.itemcode}`;
      const list = byItem.get(key);
      if (list) list.push(row);
      else byItem.set(key, [row]);
    });
    (pageRows as ItemRow[]).forEach((row) => {
      const trend = buildAdTrend(byItem.get(row.key) ?? [], from, to);
      map.set(row.key, trend.map((point) => {
        const value = trendMetric === 'share' || trendMetric === 'storeGmv' ? point.gmv : point[trendMetric];
        return typeof value === 'number' ? value : NaN;
      }));
    });
    return map;
  }, [view, pageRows, activeAdRows, from, to, trendMetric]);

  const planTrends = useMemo(() => {
    const map = new Map<string, number[]>();
    if (view !== 'plan') return map;
    const byPlan = new Map<string, ProdReportRow[]>();
    activeAdRows.forEach((row) => {
      const key = `${row.storeId}__${row.adType}__${row.planName}__${row.groupName}`;
      const list = byPlan.get(key);
      if (list) list.push(row);
      else byPlan.set(key, [row]);
    });
    (pageRows as PlanRow[]).forEach((row) => {
      const trend = buildAdTrend(byPlan.get(row.key) ?? [], from, to);
      map.set(row.key, trend.map((point) => {
        const value = trendMetric === 'share' || trendMetric === 'storeGmv' ? point.gmv : point[trendMetric];
        return typeof value === 'number' ? value : NaN;
      }));
    });
    return map;
  }, [view, pageRows, activeAdRows, from, to, trendMetric]);

  const planTotals = useMemo(() => {
    const list = view === 'plan' ? (rows as PlanRow[]) : [];
    const acc = list.reduce(
      (sum, row) => ({ cost: sum.cost + row.cost, gmv: sum.gmv + row.gmv, orders: sum.orders + row.orders, click: sum.click + row.click }),
      { cost: 0, gmv: 0, orders: 0, click: 0 },
    );
    return { ...acc, roas: acc.cost > 0 ? acc.gmv / acc.cost : null };
  }, [view, rows]);

  const wordTrends = useMemo(() => {
    const map = new Map<string, number[]>();
    if (view !== 'word') return map;
    const dates = eachDay(from, to);
    (pageRows as WordRow[]).forEach((row) => {
      const byDate = new Map<string, number>();
      row.orders.forEach((order) => byDate.set(order.date, (byDate.get(order.date) ?? 0) + order.amount));
      map.set(row.key, dates.map((date) => byDate.get(date) ?? 0));
    });
    return map;
  }, [view, pageRows, from, to]);

  const toggleSort = (key: string, defaultDirection: 'asc' | 'desc' = 'desc') => {
    if (sortKey === key) setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir(defaultDirection);
    }
    setPage(1);
  };

  const switchView = (next: AdViewKey) => {
    setView(next);
    setSortKey(next === 'store' ? 'adRatio' : next === 'word' ? 'gmv' : 'cost');
    setSortDir('desc');
    setPage(1);
  };

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
        {view !== 'store' ? (
          <div className="hd-ad-view-filters">
            <Select
              value={viewFilter.adType}
              options={AD_TYPE_OPTIONS}
              width={124}
              onChange={(value) => updateFilter({ adType: value as '' | AdType })}
            />
            <input
              className="hd-input hd-view-search"
              value={viewFilter.keyword}
              placeholder={VIEW_SEARCH_PLACEHOLDER[view]}
              onChange={(event) => updateFilter({ keyword: event.target.value })}
            />
          </div>
        ) : null}
      </div>

      {view === 'store' ? (
        <div className="hd-table-wrap">
          <table className="hd-table is-fixed-cols">
            <colgroup>
              <col style={{ width: 280 }} />
              <col style={{ width: 120 }} />
              <col />
              <col />
              <col />
              <col />
              <col />
            </colgroup>
            <thead>
              <tr>
                <th>店铺</th>
                <th>趋势</th>
                <th className="is-num" onClick={() => toggleSort('adCost')}>广告消耗 <MetricHelp tip={METRIC_TIPS.cost} /> {sortMark(sortKey === 'adCost', sortDir)}</th>
                <th className="is-num" onClick={() => toggleSort('adGmv')}>广告 GMV <MetricHelp tip={METRIC_TIPS.gmv} /> {sortMark(sortKey === 'adGmv', sortDir)}</th>
                <th className="is-num" onClick={() => toggleSort('storeGmv')}>整店 GMV <MetricHelp tip={METRIC_TIPS.storeGmv} /> {sortMark(sortKey === 'storeGmv', sortDir)}</th>
                <th className="is-num" onClick={() => toggleSort('adRatio')}>广告 GMV 占比 <MetricHelp tip={METRIC_TIPS.ratio} /> {sortMark(sortKey === 'adRatio', sortDir)}</th>
                <th className="is-num" onClick={() => toggleSort('roas')}>投产比 <MetricHelp tip={METRIC_TIPS.roas} /> {sortMark(sortKey === 'roas', sortDir)}</th>
              </tr>
            </thead>
            <tbody>
              {(pageRows as AdStoreRow[]).map((row) => (
                <tr
                  key={row.storeId}
                  className="is-clickable"
                  onClick={() => setDrawer({ kind: 'store', storeId: row.storeId, storeName: row.storeName, alias: row.alias })}
                >
                  <td>
                    <span className="hd-store-cell">
                      <span className="hd-store-name">
                        <strong>{row.storeName}</strong>
                        {row.daysAvailable === 0 ? <span className="hd-tag is-muted">无数据</span> : row.daysAvailable < rangeLength ? <span className="hd-tag is-warn">数据不足 {rangeLength - row.daysAvailable} 天</span> : null}
                      </span>
                      {row.alias ? <em>{row.alias}</em> : null}
                    </span>
                  </td>
                  <td>
                    <span className="hd-spark is-static" title={`${AD_TREND_LABELS[trendMetric]}趋势`}>
                      <Sparkline values={storeTrends.get(row.storeId) ?? []} />
                    </span>
                  </td>
                  <td className="is-num">{fmtMoney(row.adCost)}</td>
                  <td className="is-num">{fmtMoney(row.adGmv)}</td>
                  <td className="is-num">{fmtMoney(row.storeGmv)}</td>
                  <td className="is-num">{fmtPct(row.adRatio, 1)}</td>
                  <td className={`is-num${row.roas !== null && row.roas < 1 ? ' is-danger' : ''}`}>{fmtRoas(row.roas)}</td>
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
              </tr>
            </tfoot>
          </table>
        </div>
      ) : view === 'word' ? (
        <div className="hd-table-wrap">
          <table className="hd-table is-fixed-cols">
            <colgroup>
              <col style={{ width: 280 }} />
              <col style={{ width: 120 }} />
              <col />
              <col />
              <col />
              <col />
              <col />
            </colgroup>
            <thead>
              <tr>
                <th>成单词</th>
                <th>趋势</th>
                <th className="is-num" onClick={() => toggleSort('gmv')}>成单 GMV <MetricHelp tip={METRIC_TIPS.wordGmv} /> {sortMark(sortKey === 'gmv', sortDir)}</th>
                <th className="is-num" onClick={() => toggleSort('orderCount')}>订单数 <MetricHelp tip={METRIC_TIPS.wordOrders} /> {sortMark(sortKey === 'orderCount', sortDir)}</th>
                <th className="is-num" onClick={() => toggleSort('itemCount')}>涉及商品数 <MetricHelp tip={METRIC_TIPS.wordItems} /> {sortMark(sortKey === 'itemCount', sortDir)}</th>
                <th className="is-num" onClick={() => toggleSort('lastDate')}>最近成单日 <MetricHelp tip={METRIC_TIPS.wordLastDate} /> {sortMark(sortKey === 'lastDate', sortDir)}</th>
                <th>来源广告</th>
              </tr>
            </thead>
            <tbody>
              {(pageRows as WordRow[]).map((row) => (
                <tr key={row.key} className="is-clickable" onClick={() => setDrawer({ kind: 'word', row })}>
                  <td>
                    <span className="hd-word-cell">
                      <span className="hd-word-title">{row.word || '无搜索词（自动广告）'}</span>
                      <em>{row.storeName}</em>
                    </span>
                  </td>
                  <td>
                    <span className="hd-spark is-static" title="成单 GMV 趋势">
                      <Sparkline values={wordTrends.get(row.key) ?? []} />
                    </span>
                  </td>
                  <td className="is-num">{fmtMoney(row.gmv)}</td>
                  <td className="is-num">{fmtInt(row.orderCount)}</td>
                  <td className="is-num">{fmtInt(row.itemCount)}</td>
                  <td className="is-num">{row.lastDate}</td>
                  <td><AdTypeChips row={row} /></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td>合计 {(rows as WordRow[]).length} 个成单词</td>
                <td />
                <td className="is-num">{fmtMoney(wordTotals.gmv)}</td>
                <td className="is-num">{fmtInt(wordTotals.orderCount)}</td>
                <td className="is-num">{fmtInt(wordTotals.itemCount)}</td>
                <td />
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      ) : view === 'item' ? (
        <div className="hd-table-wrap">
          <table className="hd-table is-fixed-cols">
            <colgroup>
              <col style={{ width: 280 }} />
              <col style={{ width: 120 }} />
              <col />
              <col />
              <col />
              <col />
              <col />
            </colgroup>
            <thead>
              <tr>
                <th>商品</th>
                <th>趋势</th>
                <th className="is-num" onClick={() => toggleSort('cost')}>广告消耗 <MetricHelp tip={METRIC_TIPS.cost} /> {sortMark(sortKey === 'cost', sortDir)}</th>
                <th className="is-num" onClick={() => toggleSort('gmv')}>广告 GMV <MetricHelp tip={METRIC_TIPS.gmv} /> {sortMark(sortKey === 'gmv', sortDir)}</th>
                <th className="is-num" onClick={() => toggleSort('productGmv')}>商品 GMV <MetricHelp tip={METRIC_TIPS.productGmv} /> {sortMark(sortKey === 'productGmv', sortDir)}</th>
                <th className="is-num" onClick={() => toggleSort('adRatio')}>广告 GMV 占比 <MetricHelp tip={METRIC_TIPS.ratio} /> {sortMark(sortKey === 'adRatio', sortDir)}</th>
                <th className="is-num" onClick={() => toggleSort('roas')}>投产比 <MetricHelp tip={METRIC_TIPS.roas} /> {sortMark(sortKey === 'roas', sortDir)}</th>
              </tr>
            </thead>
            <tbody>
              {(pageRows as ItemRow[]).map((row) => (
                <tr key={row.key} className="is-clickable" onClick={() => setDrawer({ kind: 'item', row })}>
                  <td>
                    <span className="hd-item-cell">
                      {row.thumb ? <img src={row.thumb} alt="" /> : <span className="hd-item-thumb-ph" />}
                      <span className="hd-item-text">
                        <strong>{row.name}</strong>
                        <em>{row.itemcode} · {row.storeName}</em>
                        <AdTypeChips row={row} />
                      </span>
                      {row.zeroConv ? <span className="hd-tag is-danger">零转化</span> : null}
                    </span>
                  </td>
                  <td>
                    <span className="hd-spark is-static" title={`${AD_TREND_LABELS[trendMetric]}趋势`}>
                      <Sparkline values={itemTrends.get(row.key) ?? []} />
                    </span>
                  </td>
                  <td className="is-num">{fmtMoney(row.cost)}</td>
                  <td className="is-num">{fmtMoney(row.gmv)}</td>
                  <td className="is-num">{fmtMoney(row.productGmv)}</td>
                  <td className="is-num">{fmtPct(row.adRatio, 1)}</td>
                  <td className={`is-num${row.lowRoas ? ' is-danger' : ''}`}>{fmtRoas(row.roas)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td>合计 {(rows as ItemRow[]).length} 个商品</td>
                <td />
                <td className="is-num">{fmtMoney(itemTotals.cost)}</td>
                <td className="is-num">{fmtMoney(itemTotals.gmv)}</td>
                <td className="is-num">{fmtMoney(itemTotals.productGmv)}</td>
                <td className="is-num">{fmtPct(itemTotals.adRatio, 1)}</td>
                <td className="is-num">{fmtRoas(itemTotals.roas)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <div className="hd-table-wrap">
          <table className="hd-table is-fixed-cols">
            <colgroup>
              <col style={{ width: 280 }} />
              <col style={{ width: 120 }} />
              <col />
              <col />
              <col />
              <col />
              <col />
            </colgroup>
            <thead>
              <tr>
                <th>计划</th>
                <th>趋势</th>
                <th className="is-num" onClick={() => toggleSort('cost')}>广告消耗 <MetricHelp tip={METRIC_TIPS.cost} /> {sortMark(sortKey === 'cost', sortDir)}</th>
                <th className="is-num" onClick={() => toggleSort('gmv')}>广告 GMV <MetricHelp tip={METRIC_TIPS.gmv} /> {sortMark(sortKey === 'gmv', sortDir)}</th>
                <th className="is-num" onClick={() => toggleSort('orders')}>广告订单数 <MetricHelp tip={METRIC_TIPS.orders} /> {sortMark(sortKey === 'orders', sortDir)}</th>
                <th className="is-num" onClick={() => toggleSort('click')}>点击量 <MetricHelp tip={METRIC_TIPS.click} /> {sortMark(sortKey === 'click', sortDir)}</th>
                <th className="is-num" onClick={() => toggleSort('roas')}>投产比 <MetricHelp tip={METRIC_TIPS.roas} /> {sortMark(sortKey === 'roas', sortDir)}</th>
              </tr>
            </thead>
            <tbody>
              {(pageRows as PlanRow[]).map((row) => (
                <tr key={row.key} className="is-clickable" onClick={() => setDrawer({ kind: 'plan', row })}>
                  <td>
                    <span className="hd-plan-cell">
                      <span className="hd-plan-name">
                        <span className="hd-chip">{AD_TYPE_LABEL[row.adType]}</span>
                        <strong>{row.planName || '全店自动'}</strong>
                      </span>
                      <em>{[row.groupName, row.storeName].filter(Boolean).join(' · ')}</em>
                    </span>
                  </td>
                  <td>
                    <span className="hd-spark is-static" title={`${AD_TREND_LABELS[trendMetric]}趋势`}>
                      <Sparkline values={planTrends.get(row.key) ?? []} />
                    </span>
                  </td>
                  <td className="is-num">{fmtMoney(row.cost)}</td>
                  <td className="is-num">{fmtMoney(row.gmv)}</td>
                  <td className="is-num">{fmtInt(row.orders)}</td>
                  <td className="is-num">{fmtInt(row.click)}</td>
                  <td className={`is-num${row.lowRoas ? ' is-danger' : ''}`}>{fmtRoas(row.roas)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td>合计 {(rows as PlanRow[]).length} 个计划/广告组</td>
                <td />
                <td className="is-num">{fmtMoney(planTotals.cost)}</td>
                <td className="is-num">{fmtMoney(planTotals.gmv)}</td>
                <td className="is-num">{fmtInt(planTotals.orders)}</td>
                <td className="is-num">{fmtInt(planTotals.click)}</td>
                <td className="is-num">{fmtRoas(planTotals.roas)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {!rows.length ? <div className="hd-empty">当前筛选没有符合条件的数据</div> : null}

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

      {drawer && drawer.kind === 'word' ? (
        <AdWordDrawer row={drawer.row} from={from} to={to} onClose={() => setDrawer(null)} />
      ) : drawer ? (
        <AdItemDrawer
          row={drawer.kind === 'item' ? drawer.row : undefined}
          store={drawer.kind === 'store' ? { storeId: drawer.storeId, storeName: drawer.storeName, alias: drawer.alias } : undefined}
          plan={drawer.kind === 'plan' ? { planKey: drawer.row.key, planName: drawer.row.planName, groupName: drawer.row.groupName, adType: drawer.row.adType, storeId: drawer.row.storeId, storeName: drawer.row.storeName } : undefined}
          prodRows={activeAdRows}
          orderRows={activeOrderRows}
          from={from}
          to={to}
          exclusionEnabled={exclusionEnabled}
          configs={configs}
          initialMetric={trendMetric}
          kpiKeys={kpiKeys}
          onClose={() => setDrawer(null)}
        />
      ) : null}
    </div>
  );
}
