import React, { useCallback, useMemo, useState } from 'react';
import { FilterBar, presetRange, validateRange, type RangePreset } from '../components/FilterBar';
import { MetricCards } from '../components/MetricCards';
import { ReportTable } from '../components/ReportTable';
import { TrendChart, METRIC_LABEL } from '../components/TrendChart';
import { ItemDrawer } from '../components/ItemDrawer';
import { DATA_FROM, getDataset } from '../data/mock';
import {
  accOfProd,
  buildCards,
  buildItemRows,
  buildPlanRows,
  buildTrend,
  buildWordRows,
  filterOrder,
  filterProd,
  finalize,
  previousRange,
  sumWordTotals,
} from '../data/aggregate';
import { fmtDateSlash, fmtInt } from '../data/format';
import type { Filters, TrendMetric, ViewKey } from '../data/types';

const TREND_METRICS: TrendMetric[] = ['cost', 'gmv', 'orders', 'click', 'roas'];

const VIEW_TABS: Array<{ key: ViewKey; label: string; hint: string }> = [
  { key: 'item', label: '商品视图', hint: '按商品汇总，同类广告合并，看哪个商品在花钱' },
  { key: 'plan', label: '计划视图', hint: '按广告类型 + 计划 + 广告组汇总，看哪个计划在花钱' },
  { key: 'word', label: '成单词视图', hint: '按成单词看订单与 GMV，用于加词与否词' },
];

export default function ReportPage() {
  const dataset = useMemo(() => getDataset(), []);
  const initialFilters = useMemo<Filters>(() => ({ store: '', adType: '', ...presetRange('7d') }), []);
  const [preset, setPreset] = useState<RangePreset>('7d');
  const [draft, setDraft] = useState<Filters>(initialFilters);
  const [applied, setApplied] = useState<Filters>(initialFilters);
  const [view, setView] = useState<ViewKey>('item');
  const [trendMetric, setTrendMetric] = useState<TrendMetric>('cost');
  const [drawerKey, setDrawerKey] = useState<string>('');
  const [syncing, setSyncing] = useState(false);
  const [syncRounds, setSyncRounds] = useState(0);

  const error = useMemo(() => validateRange(draft.from, draft.to), [draft.from, draft.to]);

  // 筛选即改即生效；日期不合法时只更新草稿并提示，页面数据保持上一次有效结果
  const apply = useCallback((next: Filters) => {
    setDraft(next);
    if (validateRange(next.from, next.to)) return;
    setApplied(next);
    setDrawerKey('');
  }, []);

  const prodFiltered = useMemo(() => filterProd(dataset.prodRows, applied), [dataset, applied]);
  const orderFiltered = useMemo(() => filterOrder(dataset.orderRows, applied), [dataset, applied]);

  const prevFilters = useMemo<Filters>(() => {
    const range = previousRange(applied.from, applied.to);
    return { store: applied.store, adType: applied.adType, from: range.from, to: range.to };
  }, [applied]);

  const prevProd = useMemo(() => filterProd(dataset.prodRows, prevFilters), [dataset, prevFilters]);
  const canCompare = prevFilters.from >= DATA_FROM;

  const cards = useMemo(() => {
    const current = finalize(accOfProd(prodFiltered));
    if (!canCompare) {
      const blank = { ...current, imp: 0, click: 0, cost: 0, orders: 0, gmv: 0, ctr: null, cpc: null, cvr: null, cpa: null, roas: null };
      return buildCards(current, blank);
    }
    return buildCards(current, finalize(accOfProd(prevProd)));
  }, [prodFiltered, prevProd, canCompare]);

  const trend = useMemo(() => buildTrend(prodFiltered, applied.from, applied.to), [prodFiltered, applied]);

  const itemRows = useMemo(() => buildItemRows(prodFiltered), [prodFiltered]);
  const planRows = useMemo(() => buildPlanRows(prodFiltered), [prodFiltered]);
  const wordRows = useMemo(() => buildWordRows(orderFiltered), [orderFiltered]);
  const wordTotals = useMemo(() => sumWordTotals(wordRows), [wordRows]);

  const tableRows = view === 'item' ? itemRows : view === 'plan' ? planRows : wordRows;

  const drawerItem = useMemo(() => itemRows.find((row) => row.key === drawerKey) ?? null, [itemRows, drawerKey]);

  const drawerProdRows = useMemo(
    () => (drawerItem ? prodFiltered.filter((row) => row.nickname === drawerItem.store && row.itemcode === drawerItem.itemcode) : []),
    [drawerItem, prodFiltered],
  );

  const drawerOrderRows = useMemo(
    () => (drawerItem ? orderFiltered.filter((row) => row.nickname === drawerItem.store && row.itemcode === drawerItem.itemcode) : []),
    [drawerItem, orderFiltered],
  );

  const onStoreChange = (store: string) => apply({ ...draft, store });

  const onAdTypeChange = (adType: Filters['adType']) => apply({ ...draft, adType });

  const onPresetChange = (nextPreset: RangePreset) => {
    setPreset(nextPreset);
    if (nextPreset === 'custom') return;
    apply({ ...draft, ...presetRange(nextPreset) });
  };

  const onDateChange = (field: 'from' | 'to', value: string) => {
    setPreset('custom');
    apply({ ...draft, [field]: value });
  };

  const onReset = () => {
    setPreset('7d');
    apply({ store: '', adType: '', ...presetRange('7d') });
  };

  const onSync = () => {
    if (syncing) return;
    setSyncing(true);
    window.setTimeout(() => {
      setSyncing(false);
      setSyncRounds((prev) => prev + 1);
    }, 1200);
  };

  const syncRows = fmtInt(dataset.prodRows.length + dataset.orderRows.length);
  const syncTotal = 9 * 60 + 41 + syncRounds * 7;
  const lastSyncText =
    syncRounds === 0
      ? `2026-10-20 ${String(Math.floor(syncTotal / 60)).padStart(2, '0')}:${String(syncTotal % 60).padStart(2, '0')}`
      : `2026-10-20 ${String(Math.floor(syncTotal / 60)).padStart(2, '0')}:${String(syncTotal % 60).padStart(2, '0')}，写入 ${syncRows} 条明细`;

  const rangeLabel = `${fmtDateSlash(applied.from)} - ${fmtDateSlash(applied.to)}`;
  const prevLabel = canCompare ? `${fmtDateSlash(prevFilters.from)} - ${fmtDateSlash(prevFilters.to)}` : '数据不足，暂不对比';

  return (
    <main className="adr-main">
      <FilterBar
        draft={draft}
        preset={preset}
        error={error}
        syncing={syncing}
        lastSync={lastSyncText}
        onStoreChange={onStoreChange}
        onAdTypeChange={onAdTypeChange}
        onPresetChange={onPresetChange}
        onDateChange={onDateChange}
        onReset={onReset}
        onSync={onSync}
      />

      <MetricCards cards={cards} rangeLabel={`${rangeLabel}｜对比 ${prevLabel}`} />

      <section className="adr-card adr-trendcard">
        <div className="adr-trendcard__head">
          <div className="adr-trendcard__title">
            <h3>{METRIC_LABEL[trendMetric]}走势</h3>
          </div>
          <div className="adr-segment adr-segment--small">
            {TREND_METRICS.map((metric) => (
              <button
                type="button"
                key={metric}
                className={`adr-segment__btn${trendMetric === metric ? ' is-active' : ''}`}
                onClick={() => setTrendMetric(metric)}
              >
                {METRIC_LABEL[metric]}
              </button>
            ))}
          </div>
        </div>
        <TrendChart points={trend} metric={trendMetric} />
      </section>

      <section className="adr-card adr-tablecard">
        <div className="adr-tablecard__head">
          <div className="adr-tabs" data-annotation-id="adr-tabs">
            {VIEW_TABS.map((tab) => {
              const count = tab.key === 'item' ? itemRows.length : tab.key === 'plan' ? planRows.length : wordRows.length;
              return (
                <button
                  type="button"
                  key={tab.key}
                  className={`adr-tab${view === tab.key ? ' is-active' : ''}`}
                  onClick={() => setView(tab.key)}
                >
                  {tab.label}
                  <span className="adr-tab__count">{count}</span>
                </button>
              );
            })}
          </div>
          <div className="adr-legend" data-annotation-id="adr-anomaly">
            <span className="adr-legend__item">
              <i className="adr-legend-swatch adr-legend-swatch--bad" />
              ROAS 低于 1
            </span>
            <span className="adr-legend__item">
              <i className="adr-legend-swatch adr-legend-swatch--warn" />
              有花费无订单
            </span>
          </div>
        </div>

        <p className="adr-viewhint">{VIEW_TABS.find((tab) => tab.key === view)?.hint}</p>

        <ReportTable
          view={view}
          rows={tableRows}
          wordTotals={wordTotals}
          showStore={!applied.store}
          annotationId={view === 'item' ? 'adr-item-table' : view === 'plan' ? 'adr-plan-table' : 'adr-word-table'}
          onItemClick={(row) => setDrawerKey(row.key)}
        />
      </section>

      <ItemDrawer
        item={drawerItem}
        prodRows={drawerProdRows}
        orderRows={drawerOrderRows}
        from={applied.from}
        to={applied.to}
        onClose={() => setDrawerKey('')}
      />
    </main>
  );
}
