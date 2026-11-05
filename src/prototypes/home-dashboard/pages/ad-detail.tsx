import React, { useEffect, useMemo, useState } from 'react';
import {
  AD_STORE_IDS,
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
  presetRange,
  resolveExclusions,
  sortByNumber,
  validateAdRange,
} from '../data/aggregate';
import { AD_STORES, STORE_GROUPS } from '../data/catalog';
import { fmtDelta, fmtInt, fmtMoney, fmtMoneyAxis, fmtPct, fmtRoas } from '../data/format';
import { AD_DETAIL_FROM, REPORT_TO, getDataset } from '../data/generate';
import {
  AD_TYPE_LABEL,
  AD_TYPE_OPTIONS,
  type AdTrendMetric,
  type ExclusionConfig,
  type ItemRow,
  type PlanRow,
  type ProdReportRow,
  type WordRow,
} from '../data/types';
import { Breadcrumb } from '../components/Breadcrumb';
import { Chart } from '../components/Chart';
import { AdItemDrawer } from '../components/AdItemDrawer';
import { ExclusionDialog } from '../components/ExclusionDialog';
import { Select } from '../components/Select';
import { Segmented } from '../components/Segmented';
import { StoreCascader } from '../components/StoreCascader';
import { Tooltip } from '../components/Tooltip';

const DATE_PRESETS = [
  { key: '1', label: '近1天', days: 1 },
  { key: '3', label: '近3天', days: 3 },
  { key: '7', label: '近7天', days: 7 },
  { key: '15', label: '近15天', days: 15 },
  { key: '30', label: '近30天', days: 30 },
];

const TREND_METRICS: Array<{ key: AdTrendMetric; label: string }> = [
  { key: 'cost', label: '广告花费' },
  { key: 'gmv', label: '广告 GMV' },
  { key: 'orders', label: '订单数' },
  { key: 'click', label: '点击量' },
  { key: 'roas', label: 'ROAS' },
];

const VIEWS: Array<{ key: 'store' | 'item' | 'plan' | 'word'; label: string }> = [
  { key: 'store', label: '店铺视图' },
  { key: 'item', label: '商品视图' },
  { key: 'plan', label: '计划视图' },
  { key: 'word', label: '成单词视图' },
];

interface AdStoreRow {
  storeId: number;
  storeName: string;
  adCost: number;
  adGmv: number;
  storeGmv: number;
  adRatio: number | null;
  roas: number | null;
  adCostDelta: number | null;
}

type SortKey = string;

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

export function AdDetailPage({
  exclusionEnabled,
  onToggleExclusion,
  configs,
  onSaveConfigs,
  onHome,
}: {
  exclusionEnabled: boolean;
  onToggleExclusion: () => void;
  configs: ExclusionConfig[];
  onSaveConfigs: (next: ExclusionConfig[]) => void;
  onHome: () => void;
}) {
  const [storeIds, setStoreIds] = useState<number[]>(AD_STORE_IDS);
  const effectiveStoreIds = storeIds.length ? storeIds : AD_STORE_IDS;
  const [adType, setAdType] = useState<'' | 'ppc' | 'prodauto' | 'shopauto'>('');
  const [preset, setPreset] = useState('7');
  const initial = presetRange(7);
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [customFrom, setCustomFrom] = useState(initial.from);
  const [customTo, setCustomTo] = useState(initial.to);
  const [view, setView] = useState<'store' | 'item' | 'plan' | 'word'>('item');
  const [sortKey, setSortKey] = useState<SortKey>('cost');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [trendMetric, setTrendMetric] = useState<AdTrendMetric>('cost');
  const [drawer, setDrawer] = useState<ItemRow | null>(null);
  const [wordExpanded, setWordExpanded] = useState<string | null>(null);
  const [exclusionOpen, setExclusionOpen] = useState(false);
  const [rangeError, setRangeError] = useState('');

  const rangeErrorText = useMemo(() => validateAdRange(from, to), [from, to]);

  const storeGroups = useMemo(
    () => STORE_GROUPS
      .map((group) => ({
        id: String(group.id),
        label: group.name,
        stores: AD_STORES.filter((store) => group.storeIds.includes(store.id)).map((store) => ({ id: store.id, label: store.name })),
      }))
      .filter((group) => group.stores.length > 0),
    [],
  );

  const filters = useMemo(() => ({ storeIds: effectiveStoreIds, adType, from, to }), [effectiveStoreIds, adType, from, to]);

  const prodRows = useMemo(() => {
    if (!effectiveStoreIds.length) return [] as ProdReportRow[];
    return filterProd(getDataset().prodRows, filters);
  }, [filters, effectiveStoreIds.length]);

  const orderRows = useMemo(() => {
    if (!effectiveStoreIds.length) return [];
    return filterOrder(getDataset().orderRows, filters);
  }, [filters, effectiveStoreIds.length]);

  const current = useMemo(() => finalize(accOfProd(prodRows)), [prodRows]);
  const previousMetrics = useMemo(() => {
    const previous = previousRange(from, to);
    if (!effectiveStoreIds.length) return finalize({ imp: 0, click: 0, cost: 0, orders: 0, gmv: 0 });
    return finalize(accOfProd(filterProd(getDataset().prodRows, { storeIds: effectiveStoreIds, adType, from: previous.from, to: previous.to })));
  }, [from, to, effectiveStoreIds, adType]);

  const storeGmv = useMemo(() => {
    if (!effectiveStoreIds.length) return 0;
    return buildStoreSnapshot(effectiveStoreIds, 'TOTAL', from, to, exclusionEnabled, configs).summary.confirmGmv;
  }, [effectiveStoreIds, from, to, exclusionEnabled, configs]);

  const prevStoreGmv = useMemo(() => {
    if (!effectiveStoreIds.length) return 0;
    const previous = previousRange(from, to);
    return buildStoreSnapshot(effectiveStoreIds, 'TOTAL', previous.from, previous.to, exclusionEnabled, configs).summary.confirmGmv;
  }, [effectiveStoreIds, from, to, exclusionEnabled, configs]);

  const kpis = useMemo(() => buildAdKpis(current, previousMetrics, storeGmv, prevStoreGmv), [current, previousMetrics, storeGmv, prevStoreGmv]);
  const trend = useMemo(() => buildAdTrend(prodRows, from, to), [prodRows, from, to]);
  const itemRows = useMemo(() => buildItemRows(prodRows), [prodRows]);
  const planRows = useMemo(() => buildPlanRows(prodRows), [prodRows]);
  const wordRows = useMemo(() => buildWordRows(orderRows), [orderRows]);
  const storeRows = useMemo<AdStoreRow[]>(() => {
    if (!effectiveStoreIds.length) return [];
    const currentSummaries = buildStoreTableRows(effectiveStoreIds, 'TOTAL', from, to, exclusionEnabled, configs);
    const previous = previousRange(from, to);
    const prevProd = filterProd(getDataset().prodRows, { storeIds: effectiveStoreIds, adType, from: previous.from, to: previous.to });
    return effectiveStoreIds.map((storeId) => {
      const metrics = finalize(accOfProd(prodRows.filter((row) => row.storeId === storeId)));
      const prevMetrics = finalize(accOfProd(prevProd.filter((row) => row.storeId === storeId)));
      const summary = currentSummaries.find((row) => row.storeId === storeId);
      const storeGmv = summary?.summary.confirmGmv ?? 0;
      return {
        storeId,
        storeName: summary?.storeName ?? String(storeId),
        adCost: metrics.cost,
        adGmv: metrics.gmv,
        storeGmv,
        adRatio: storeGmv > 0 ? metrics.gmv / storeGmv : null,
        roas: metrics.roas,
        adCostDelta: prevMetrics.cost > 0 ? (metrics.cost - prevMetrics.cost) / prevMetrics.cost : null,
      };
    });
  }, [effectiveStoreIds, prodRows, from, to, adType, exclusionEnabled, configs]);

  const rows = view === 'store' ? storeRows : view === 'item' ? itemRows : view === 'plan' ? planRows : wordRows;
  const sorted = useMemo(() => {
    if (view === 'word') {
      return sortByNumber(wordRows, (row) => (sortKey === 'orderCount' ? row.orderCount : sortKey === 'itemCount' ? row.itemCount : row.gmv), sortDir);
    }
    if (view === 'store') {
      return sortByNumber(storeRows, (row) => {
        const value = (row as unknown as Record<string, unknown>)[sortKey];
        return typeof value === 'number' && Number.isFinite(value) ? value : null;
      }, sortDir);
    }
    return sortByNumber(rows as Array<ItemRow | PlanRow>, (row) => {
      const value = (row as unknown as Record<string, unknown>)[sortKey];
      return typeof value === 'number' && Number.isFinite(value) ? value : null;
    }, sortDir);
  }, [view, rows, wordRows, storeRows, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageRows = sorted.slice((page - 1) * pageSize, page * pageSize);
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

  const applyPreset = (key: string) => {
    const target = DATE_PRESETS.find((item) => item.key === key);
    if (!target) return;
    const range = presetRange(target.days);
    setPreset(key);
    setFrom(range.from);
    setTo(range.to);
    setCustomFrom(range.from);
    setCustomTo(range.to);
    setRangeError('');
    setPage(1);
  };

  const applyCustom = (nextFrom: string, nextTo: string) => {
    setCustomFrom(nextFrom);
    setCustomTo(nextTo);
    const error = validateAdRange(nextFrom, nextTo);
    if (error) {
      setRangeError(error);
      return;
    }
    setRangeError('');
    setPreset('custom');
    setFrom(nextFrom);
    setTo(nextTo);
    setPage(1);
  };

  const toggleSort = (key: SortKey, defaultDirection: 'asc' | 'desc' = 'desc') => {
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

  const exclusionInfo = useMemo(
    () => resolveExclusions(configs, exclusionEnabled, from, to, effectiveStoreIds),
    [configs, exclusionEnabled, from, to, effectiveStoreIds],
  );

  const headerTooltip = (text: string) => (
    <Tooltip content={text}><span className="hd-help">?</span></Tooltip>
  );

  return (
    <div className="hd-l2">
      <Breadcrumb items={['报表', '广告明细']} onHome={onHome} />
      <div className="hd-l2-title-row">
        <h1 className="hd-l2-title">广告明细</h1>
      </div>

      <div className="hd-glass hd-filter-card">
        <div className="hd-filter-row">
          <div className="hd-filter-group">
            <span className="hd-filter-label">店铺</span>
            <StoreCascader
              groups={storeGroups}
              value={storeIds}
              allLabel="全部广告店铺"
              width={260}
              onChange={(next) => { setStoreIds(next); setPage(1); }}
            />
          </div>
          <div className="hd-filter-group">
            <span className="hd-filter-label">广告类型</span>
            <Select value={adType} options={AD_TYPE_OPTIONS} width={132} onChange={(value) => { setAdType(value as typeof adType); setPage(1); }} />
          </div>
          <div className="hd-filter-group is-grow">
            <span className="hd-filter-label">时间</span>
            <div className="hd-date-row">
              <Segmented value={preset} options={DATE_PRESETS.map((item) => ({ key: item.key, label: item.label }))} onChange={applyPreset} />
              <input className="hd-input hd-date-input" type="date" value={customFrom} min={AD_DETAIL_FROM} max={REPORT_TO} onChange={(event) => applyCustom(event.target.value, customTo)} />
              <span className="hd-muted">至</span>
              <input className="hd-input hd-date-input" type="date" value={customTo} min={AD_DETAIL_FROM} max={REPORT_TO} onChange={(event) => applyCustom(customFrom, event.target.value)} />
            </div>
          </div>
          <div className="hd-filter-actions">
            <button
              type="button"
              className="hd-btn is-default"
              onClick={() => {
                setStoreIds(AD_STORE_IDS);
                setAdType('');
                applyPreset('7');
              }}
            >
              重置
            </button>
          </div>
        </div>
        {rangeError || rangeErrorText ? <div className="hd-filter-error">{rangeError || rangeErrorText}</div> : null}
      </div>

      <div className="hd-l2-kpi-grid">
        {kpis.filter((kpi) => kpi.main).map((kpi) => (
          <div className="hd-glass hd-l2-kpi is-main" key={kpi.key}>
            <div className="hd-l2-kpi-label">{kpi.label}{headerTooltip(kpi.hint)}</div>
            <div className="hd-l2-kpi-value">{kpi.format === 'money' ? fmtMoney(kpi.value) : kpi.format === 'pct' ? fmtPct(kpi.value) : kpi.format === 'roas' ? fmtRoas(kpi.value) : fmtInt(kpi.value)}</div>
            <div className={`hd-l2-kpi-delta ${kpi.delta !== null && kpi.delta < 0 ? 'is-down' : 'is-up'}`}>{kpi.delta === null ? '-' : `${kpi.delta > 0 ? '+' : ''}${(kpi.delta * 100).toFixed(1)}%`}</div>
          </div>
        ))}
      </div>
      <div className="hd-l2-kpi-grid is-mini">
        {kpis.filter((kpi) => !kpi.main).map((kpi) => (
          <div className="hd-glass hd-l2-kpi is-mini" key={kpi.key}>
            <div className="hd-l2-kpi-label">{kpi.label}{headerTooltip(kpi.hint)}</div>
            <div className="hd-l2-kpi-value">{kpi.format === 'money' ? fmtMoney(kpi.value) : kpi.format === 'pct' ? fmtPct(kpi.value) : fmtInt(kpi.value)}</div>
          </div>
        ))}
      </div>

      <div className="hd-glass hd-l2-card">
        <div className="hd-l2-card-head">
          <div className="hd-l2-card-title">广告趋势</div>
          <div className="hd-l2-card-tools">
            <Segmented value={trendMetric} options={TREND_METRICS} onChange={setTrendMetric} />
            <div className="hd-l2-card-gmv">
              <Segmented
                value={exclusionEnabled ? 'exclude' : 'raw'}
                options={[{ key: 'exclude', label: '剔除补单' }, { key: 'raw', label: '原始数据' }]}
                onChange={(next) => {
                  if ((next === 'exclude') !== exclusionEnabled) onToggleExclusion();
                }}
              />
              <span className="hd-link" onClick={() => setExclusionOpen(true)}>剔除设置</span>
            </div>
          </div>
        </div>
        <Chart
          labels={trend.map((point) => point.date.slice(5).replace('-', '/'))}
          series={[{
            key: trendMetric,
            label: TREND_METRICS.find((item) => item.key === trendMetric)?.label ?? '',
            color: '#ff8a3d',
            values: trend.map((point) => point[trendMetric]),
            area: true,
          }]}
          height={230}
          formatValue={(value) => (trendMetric === 'cost' || trendMetric === 'gmv' ? fmtMoney(value) : trendMetric === 'roas' ? fmtRoas(value) : fmtInt(value))}
          axisFormat={trendMetric === 'cost' || trendMetric === 'gmv' ? fmtMoneyAxis : trendMetric === 'roas' ? (value) => `${value.toFixed(1)}x` : undefined}
          tipRows={(index) => {
            const value = trend[index][trendMetric];
            return [{
              label: TREND_METRICS.find((item) => item.key === trendMetric)?.label ?? '',
              value: trendMetric === 'cost' || trendMetric === 'gmv' ? fmtMoney(value) : trendMetric === 'roas' ? fmtRoas(value) : fmtInt(value),
              color: '#ff8a3d',
            }];
          }}
        />
      </div>

      <div className="hd-glass hd-l2-card">
        <div className="hd-l2-card-head">
          <div className="hd-table-tabs">
            {VIEWS.map((item) => (
              <button type="button" key={item.key} className={`hd-table-tab${view === item.key ? ' is-active' : ''}`} onClick={() => switchView(item.key)}>
                {item.label}
                <span className="hd-table-tab-count">{item.key === 'store' ? storeRows.length : item.key === 'item' ? itemRows.length : item.key === 'plan' ? planRows.length : wordRows.length}</span>
              </button>
            ))}
          </div>
        </div>

        {!effectiveStoreIds.length ? (
          <div className="hd-empty hd-empty-lg">当前筛选没有可投放的广告店铺，请调整店铺范围</div>
        ) : view === 'store' ? (
          <div className="hd-table-wrap">
            <table className="hd-table">
              <thead>
                <tr>
                  <th>店铺</th>
                  <th className="is-num" onClick={() => toggleSort('adCost')}>广告消耗 {sortMark(sortKey === 'adCost', sortDir)}</th>
                  <th className="is-num" onClick={() => toggleSort('adGmv')}>广告 GMV {sortMark(sortKey === 'adGmv', sortDir)}</th>
                  <th className="is-num" onClick={() => toggleSort('storeGmv')}>整店 GMV {sortMark(sortKey === 'storeGmv', sortDir)}</th>
                  <th className="is-num" onClick={() => toggleSort('adRatio')}>广告 GMV 占比 {sortMark(sortKey === 'adRatio', sortDir)}</th>
                  <th className="is-num" onClick={() => toggleSort('roas')}>投产比 {sortMark(sortKey === 'roas', sortDir)}</th>
                  <th className="is-num" onClick={() => toggleSort('adCostDelta')}>广告消耗环比 {sortMark(sortKey === 'adCostDelta', sortDir)}</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {(pageRows as AdStoreRow[]).map((row) => (
                  <tr key={row.storeId}>
                    <td>{row.storeName}</td>
                    <td className="is-num">{fmtMoney(row.adCost)}</td>
                    <td className="is-num">{fmtMoney(row.adGmv)}</td>
                    <td className="is-num">{fmtMoney(row.storeGmv)}</td>
                    <td className="is-num">{fmtPct(row.adRatio, 1)}</td>
                    <td className={`is-num${row.roas !== null && row.roas < 1 ? ' is-danger' : ''}`}>{fmtRoas(row.roas)}</td>
                    <td className={`is-num${row.adCostDelta !== null && row.adCostDelta > 0 ? ' is-danger' : row.adCostDelta !== null && row.adCostDelta < 0 ? ' is-success' : ''}`}>
                      {fmtDelta(row.adCostDelta)}
                    </td>
                    <td>
                      <span className="hd-link" onClick={() => { setStoreIds([row.storeId]); switchView('item'); }}>查看商品</span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td>合计 {storeRows.length} 家店</td>
                  <td className="is-num">{fmtMoney(storeTotals.adCost)}</td>
                  <td className="is-num">{fmtMoney(storeTotals.adGmv)}</td>
                  <td className="is-num">{fmtMoney(storeTotals.storeGmv)}</td>
                  <td className="is-num">{fmtPct(storeTotals.adRatio, 1)}</td>
                  <td className="is-num">{fmtRoas(storeTotals.roas)}</td>
                  <td />
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
                        <span className="hd-link" onClick={() => setWordExpanded((current) => (current === row.key ? null : row.key))}>
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

        {effectiveStoreIds.length ? (
          <div className="hd-pager-bar">
            <span>共 {sorted.length} 条</span>
            <div className="hd-pager">
              <button type="button" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>‹</button>
              {Array.from({ length: pageCount }, (_, index) => index + 1).map((item) => (
                <button type="button" key={item} className={page === item ? 'is-active' : ''} onClick={() => setPage(item)}>{item}</button>
              ))}
              <button type="button" disabled={page >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>›</button>
            </div>
            <Select value={pageSize} options={[10, 20, 50, 100].map((value) => ({ value, label: `${value} 条/页` }))} width={110} onChange={(value) => { setPageSize(Number(value)); setPage(1); }} />
          </div>
        ) : null}
      </div>

      {drawer ? (
        <AdItemDrawer
          row={drawer}
          prodRows={prodRows}
          orderRows={orderRows}
          from={from}
          to={to}
          onClose={() => setDrawer(null)}
        />
      ) : null}

      {exclusionOpen ? (
        <ExclusionDialog
          configs={configs}
          excludedGmv={exclusionInfo.gmv}
          excludedCount={exclusionInfo.count}
          manualTotal={exclusionInfo.manualTotal}
          onSave={(next) => { onSaveConfigs(next); setExclusionOpen(false); }}
          onClose={() => setExclusionOpen(false)}
        />
      ) : null}
    </div>
  );
}
