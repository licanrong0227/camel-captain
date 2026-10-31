import React, { useCallback, useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { FilterBar, presetRange, validateRange, type RangePreset } from '../components/FilterBar';
import { KpiCards } from '../components/KpiCards';
import { TrendChart } from '../components/TrendChart';
import { StoreTable } from '../components/StoreTable';
import { LinkTable } from '../components/LinkTable';
import { LinkDrawer } from '../components/LinkDrawer';
import { getDataset } from '../data/mock';
import {
  buildKpis,
  buildLinkRows,
  buildStoreRows,
  buildTrend,
  filterAd,
  filterOrder,
  filterStore,
  previousRange,
  resolveExclusions,
  storeGmvTotalOf,
} from '../data/aggregate';
import { fmtDateSlash, fmtInt, fmtMoney, fmtRoas } from '../data/format';
import { STORE_MAP, STORES } from '../data/catalog';
import { ExclusionDialog } from '../components/ExclusionDialog';
import type { Filters, LinkRow, StoreExclusion, StoreRow } from '../data/types';

export default function ReportPage() {
  const dataset = useMemo(() => getDataset(), []);
  const initial = useMemo<Filters>(() => ({ storeId: null, ...presetRange('7') }), []);
  const [preset, setPreset] = useState<RangePreset>('7');
  const [draft, setDraft] = useState<Filters>(initial);
  const [applied, setApplied] = useState<Filters>(initial);
  const [drawerKey, setDrawerKey] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncRounds, setSyncRounds] = useState(0);
  const [excludeEnabled, setExcludeEnabled] = useState(true);
  const [exclusionOpen, setExclusionOpen] = useState(false);
  const [exclusions, setExclusions] = useState<StoreExclusion[]>(() =>
    STORES.map((store) => ({
      storeId: store.storeId,
      excludeLabelIds: store.storeId === 155 ? [] : ['lbl-supplement'],
      manualOrderNos: [],
      manualAmount: 0,
    })),
  );

  const error = useMemo(() => validateRange(draft.from, draft.to), [draft.from, draft.to]);

  const apply = useCallback((next: Filters) => {
    setDraft(next);
    if (validateRange(next.from, next.to)) return;
    setApplied(next);
    setDrawerKey('');
  }, []);

  const ads = useMemo(() => filterAd(dataset.adRows, applied), [dataset, applied]);
  const ordersAll = useMemo(() => filterOrder(dataset.orderRows, applied), [dataset, applied]);
  const stores = useMemo(() => filterStore(dataset.storeRows, applied), [dataset, applied]);

  const exclusion = useMemo(
    () => resolveExclusions(ordersAll, exclusions, excludeEnabled),
    [ordersAll, exclusions, excludeEnabled],
  );

  const orders = useMemo(
    () => ordersAll.filter((row) => !exclusion.excludedKeys.has(`${row.storeId}|${row.orderNo}`)),
    [ordersAll, exclusion],
  );

  const storeGmvTotal = useMemo(() => storeGmvTotalOf(stores, exclusion), [stores, exclusion]);

  const prevFilters = useMemo<Filters>(() => {
    const range = previousRange(applied.from, applied.to);
    return { ...applied, from: range.from, to: range.to };
  }, [applied]);

  const prevAds = useMemo(() => filterAd(dataset.adRows, prevFilters), [dataset, prevFilters]);
  const prevOrdersAll = useMemo(() => filterOrder(dataset.orderRows, prevFilters), [dataset, prevFilters]);
  const prevStores = useMemo(() => filterStore(dataset.storeRows, prevFilters), [dataset, prevFilters]);

  const prevExclusion = useMemo(
    () => resolveExclusions(prevOrdersAll, exclusions, excludeEnabled),
    [prevOrdersAll, exclusions, excludeEnabled],
  );

  const prevOrders = useMemo(
    () => prevOrdersAll.filter((row) => !prevExclusion.excludedKeys.has(`${row.storeId}|${row.orderNo}`)),
    [prevOrdersAll, prevExclusion],
  );

  const prevStoreGmvTotal = useMemo(() => storeGmvTotalOf(prevStores, prevExclusion), [prevStores, prevExclusion]);

  const kpis = useMemo(
    () =>
      buildKpis(
        { ads, orders, stores, storeGmvTotal },
        { ads: prevAds, orders: prevOrders, stores: prevStores, storeGmvTotal: prevStoreGmvTotal },
      ),
    [ads, orders, stores, storeGmvTotal, prevAds, prevOrders, prevStores, prevStoreGmvTotal],
  );

  const trend = useMemo(() => buildTrend(applied, ads, stores, exclusion), [applied, ads, stores, exclusion]);

  const storeRows = useMemo<StoreRow[]>(() => {
    const current = buildStoreRows(ads, orders, stores, exclusion);
    const prev = buildStoreRows(prevAds, prevOrders, prevStores, prevExclusion);
    return current.map((row) => {
      const before = prev.find((item) => item.storeId === row.storeId);
      const delta = before && before.adCost > 0 ? (row.adCost - before.adCost) / before.adCost : null;
      return { ...row, adCostDelta: delta };
    });
  }, [ads, orders, stores, prevAds, prevOrders, prevStores]);

  const linkRows = useMemo(() => buildLinkRows(applied, ads, orders), [applied, ads, orders]);

  const drawerLink = useMemo<LinkRow | null>(
    () => linkRows.find((row) => `${row.storeId}-${row.itemCode}` === drawerKey) ?? null,
    [linkRows, drawerKey],
  );

  const mode = applied.storeId === null ? 'group' : 'store';
  const storeName = applied.storeId === null ? '' : STORE_MAP[applied.storeId]?.storeName ?? '';

  const onStoreChange = (value: string) => {
    apply({ ...draft, storeId: value === 'all' ? null : Number(value) });
  };

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
    setPreset('7');
    apply({ storeId: null, ...presetRange('7') });
  };

  const onSync = () => {
    if (syncing) return;
    setSyncing(true);
    window.setTimeout(() => {
      setSyncing(false);
      setSyncRounds((prev) => prev + 1);
    }, 1200);
  };

  const syncTotal = 9 * 60 + 41 + syncRounds * 7;
  const lastSyncText =
    syncRounds === 0
      ? `2026-10-29 ${String(Math.floor(syncTotal / 60)).padStart(2, '0')}:${String(syncTotal % 60).padStart(2, '0')}`
      : `2026-10-29 ${String(Math.floor(syncTotal / 60)).padStart(2, '0')}:${String(syncTotal % 60).padStart(2, '0')}，写入 ${fmtInt(
          dataset.adRows.length,
        )} 条广告明细`;

  const rangeLabel = `${fmtDateSlash(applied.from)} - ${fmtDateSlash(applied.to)}｜对比上一等长周期`;
  const excludedLabel =
    excludeEnabled && (exclusion.excludedGmv > 0 || exclusion.manualTotal > 0)
      ? `已剔除补单 ${fmtMoney(exclusion.excludedGmv + exclusion.manualTotal)}（${fmtInt(exclusion.excludedCount)} 单）；`
      : '';
  const linkTotals = useMemo(
    () =>
      linkRows.reduce(
        (acc, row) => ({
          adCost: acc.adCost + row.adCost,
          adGmv: acc.adGmv + row.adGmv,
          linkGmv: acc.linkGmv + row.linkGmv,
        }),
        { adCost: 0, adGmv: 0, linkGmv: 0 },
      ),
    [linkRows],
  );

  return (
    <main className="adr-main">
      <FilterBar
        draft={draft}
        preset={preset}
        error={error}
        syncing={syncing}
        lastSync={lastSyncText}
        onStoreChange={onStoreChange}
        onPresetChange={onPresetChange}
        onDateChange={onDateChange}
        onReset={onReset}
        onSync={onSync}
        excludeEnabled={excludeEnabled}
        excludedLabel={excludedLabel}
        onToggleExclude={setExcludeEnabled}
        onOpenExclusion={() => setExclusionOpen(true)}
      />

      <KpiCards cards={kpis} rangeLabel={`${rangeLabel}｜${mode === 'group' ? '店群' : storeName}`} />

      <section className="adr-card adr-trendcard">
        <div className="adr-trendcard__head">
          <div className="adr-trendcard__title">
            <h3>{mode === 'group' ? '店群：广告消耗 vs 整店 GMV' : `${storeName}：广告消耗 vs 整店 GMV`}</h3>
            <span className="adr-legend">
              <span className="adr-legend__item">
                <i className="adr-tip-dot adr-tip-dot--warn" />
                广告消耗
              </span>
              <span className="adr-legend__item">
                <i className="adr-tip-dot adr-tip-dot--info" />
                整店 GMV
              </span>
            </span>
          </div>
          <span className="adr-trendcard__note">口径：广告数据 T+1，与店铺 GMV 按同一区间对齐</span>
        </div>
        <TrendChart points={trend} />
      </section>

      <section className="adr-card adr-tablecard">
        <div className="adr-tablecard__head">
          {mode === 'group' ? (
            <div className="adr-tabs" data-annotation-id="alb-mode">
              <span className="adr-mode-label">店铺横向对比</span>
              <span className="adr-mode-note">按广告 GMV 占比排序，占比越高说明这家店越依赖广告</span>
            </div>
          ) : (
            <div className="adr-tabs" data-annotation-id="alb-mode">
              <button type="button" className="adr-back" onClick={() => apply({ ...draft, storeId: null })}>
                <ArrowLeft size={14} />
                返回店群
              </button>
              <span className="adr-mode-label">{storeName} · 主链接</span>
              <span className="adr-mode-note">
                广告消耗 {fmtMoney(linkTotals.adCost)}｜广告 GMV {fmtMoney(linkTotals.adGmv)}｜链接产出{' '}
                {fmtMoney(linkTotals.linkGmv)}｜整体 ROAS {fmtRoas(linkTotals.adCost > 0 ? linkTotals.adGmv / linkTotals.adCost : null)}
              </span>
            </div>
          )}
        </div>

        {mode === 'group' ? (
          <StoreTable rows={storeRows} onOpenStore={(storeId) => apply({ ...draft, storeId })} />
        ) : (
          <LinkTable rows={linkRows} onOpen={(row) => setDrawerKey(`${row.storeId}-${row.itemCode}`)} />
        )}
      </section>

      <ExclusionDialog
        open={exclusionOpen}
        configs={exclusions}
        excludedGmv={exclusion.excludedGmv}
        excludedCount={exclusion.excludedCount}
        manualTotal={exclusion.manualTotal}
        onSave={(next) => {
          setExclusions(next);
          setExclusionOpen(false);
        }}
        onClose={() => setExclusionOpen(false)}
      />

      <LinkDrawer
        link={drawerLink}
        ads={dataset.adRows}
        orders={dataset.orderRows}
        from={applied.from}
        to={applied.to}
        onClose={() => setDrawerKey('')}
      />
    </main>
  );
}
