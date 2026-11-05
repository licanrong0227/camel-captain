import React, { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import {
  AD_STORE_IDS,
  buildStoreSnapshot,
  buildStoreTableRows,
  presetRange,
  rangeDays,
  resolveExclusions,
  sortByNumber,
  validateStoreRange,
} from '../data/aggregate';
import { STORES, STORE_GROUPS, STORE_MAP } from '../data/catalog';
import { fmtAxis, fmtMetric, fmtMoneyAxis } from '../data/format';
import { DATA_FROM, REPORT_TO } from '../data/generate';
import { STORE_METRIC_MAP, STORE_TABS, type MetricKey, type StoreMetric, type StoreTab } from '../data/metrics';
import { COUNTRIES, type ExclusionConfig } from '../data/types';
import { Breadcrumb } from '../components/Breadcrumb';
import { AdMultiViewTable } from '../components/AdMultiViewTable';
import { AdSummarySection } from '../components/AdSummarySection';
import { Chart } from '../components/Chart';
import { ExclusionDialog } from '../components/ExclusionDialog';
import { Segmented } from '../components/Segmented';
import { Select } from '../components/Select';
import { Sparkline } from '../components/Sparkline';
import { StoreCascader } from '../components/StoreCascader';
import { Tooltip } from '../components/Tooltip';
import type { AdTrendView } from '../data/adTrend';

const DATE_PRESETS = [
  { key: '1', label: '近1天', days: 1 },
  { key: '7', label: '近7天', days: 7 },
  { key: '30', label: '近30天', days: 30 },
  { key: '60', label: '近60天', days: 60 },
  { key: '90', label: '近90天', days: 90 },
];

function metricFormat(kind: StoreMetric['format'], value: number | null): string {
  return fmtMetric(kind, value);
}

function StoreTrendDialog({
  storeId,
  country,
  from,
  to,
  initialTabKey,
  initialMetricKey,
  onClose,
}: {
  storeId: number;
  country: string;
  from: string;
  to: string;
  initialTabKey: string;
  initialMetricKey: MetricKey;
  onClose: () => void;
}) {
  const initialTab = STORE_TABS.find((item) => item.key === initialTabKey) ?? STORE_TABS[0];
  const [tabKey, setTabKey] = useState(initialTab.key);
  const tab = STORE_TABS.find((item) => item.key === tabKey) ?? STORE_TABS[0];
  const [metricKey, setMetricKey] = useState<MetricKey>(
    initialTab.metrics.some((item) => item.key === initialMetricKey) ? initialMetricKey : initialTab.metrics[0].key,
  );
  const metric = STORE_METRIC_MAP[metricKey];
  const snapshot = useMemo(
    () => buildStoreSnapshot([storeId], country, from, to, false, []),
    [storeId, country, from, to],
  );
  const store = STORE_MAP[storeId];

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    setMetricKey(tab.metrics[0].key);
  }, [tabKey]);

  return (
    <div className="hd-modal-mask" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="hd-modal hd-store-trend-dialog" role="dialog" aria-modal="true" aria-label="店铺经营趋势">
        <div className="hd-rank-dialog-header">
          <div className="hd-rank-dialog-title-wrap">
            <span className="hd-rank-dialog-title">店铺经营趋势 · {store?.name}</span>
            <span className="hd-rank-dialog-count">{from} 至 {to} · 可用 {snapshot.daysAvailable} 天</span>
          </div>
          <button type="button" className="hd-excl-close" onClick={onClose} aria-label="关闭"><X size={18} /></button>
        </div>
        <div className="hd-store-trend-tabs">
          <Segmented value={tabKey} options={STORE_TABS.map((item) => ({ key: item.key, label: item.label }))} onChange={setTabKey} />
        </div>
        <div className="hd-store-trend-kpis">
          {tab.metrics.map((item) => (
            <button
              type="button"
              key={item.key}
              className={`hd-store-kpi${metricKey === item.key ? ' is-active' : ''}`}
              onClick={() => setMetricKey(item.key)}
            >
              <span className="hd-store-kpi-label">
                {item.label}
                <Tooltip content={item.tip}><span className="hd-help">?</span></Tooltip>
              </span>
              <strong>{metricFormat(item.format, snapshot.summary[item.key])}</strong>
            </button>
          ))}
        </div>
        <Chart
          labels={snapshot.dates.map((date) => date.slice(5).replace('-', '/'))}
          series={[{
            key: metricKey,
            label: metric?.label ?? '',
            color: '#ff8a3d',
            values: snapshot.series[metricKey].map((value) => (Number.isFinite(value) ? value : null)),
            area: true,
          }]}
          height={250}
          formatValue={(value) => metricFormat(metric?.format ?? 'count', value)}
          axisFormat={metric?.format === 'money' ? fmtMoneyAxis : fmtAxis}
          tipRows={(index) => [
            { label: metric?.label ?? '', value: metricFormat(metric?.format ?? 'count', snapshot.series[metricKey][index]), color: '#ff8a3d' },
          ]}
        />
        {snapshot.daysAvailable < rangeDays(from, to) ? (
          <div className="hd-trend-note">该店铺在所选区间内数据不足，仅展示已有 {snapshot.daysAvailable} 天。</div>
        ) : null}
      </div>
    </div>
  );
}

export function StoreDetailPage({
  initialTab,
  exclusionEnabled,
  onToggleExclusion,
  configs,
  onSaveConfigs,
  onHome,
}: {
  initialTab?: 'deal' | 'ad';
  exclusionEnabled: boolean;
  onToggleExclusion: () => void;
  configs: ExclusionConfig[];
  onSaveConfigs: (next: ExclusionConfig[]) => void;
  onHome: () => void;
}) {
  const [storeIds, setStoreIds] = useState<number[]>(STORES.map((store) => store.id));
  const allStoreIds = useMemo(() => STORES.map((store) => store.id), []);
  const effectiveStoreIds = storeIds.length ? storeIds : allStoreIds;
  const adStoreIds = useMemo(() => effectiveStoreIds.filter((id) => AD_STORE_IDS.includes(id)), [effectiveStoreIds]);
  const [country, setCountry] = useState('TOTAL');
  const [preset, setPreset] = useState('30');
  const initial = presetRange(30);
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [customFrom, setCustomFrom] = useState(initial.from);
  const [customTo, setCustomTo] = useState(initial.to);
  const [tabKey, setTabKey] = useState(initialTab === 'ad' ? 'ad' : 'deal');
  const tab = STORE_TABS.find((item) => item.key === tabKey) ?? STORE_TABS[0];
  const [metricKey, setMetricKey] = useState<MetricKey>(tab.metrics[0].key);
  const [sortKey, setSortKey] = useState<MetricKey>(tab.metrics[0].key);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dialogStore, setDialogStore] = useState<number | null>(null);
  const [rangeError, setRangeError] = useState('');
  const [exclusionOpen, setExclusionOpen] = useState(false);
  const [adTrendMetric, setAdTrendMetric] = useState<AdTrendView>('cost');

  const rangeErrorText = useMemo(() => validateStoreRange(from, to), [from, to]);
  const exclusionInfo = useMemo(
    () => resolveExclusions(configs, exclusionEnabled, from, to, adStoreIds),
    [configs, exclusionEnabled, from, to, adStoreIds],
  );
  const rangeLength = rangeDays(from, to);
  const metric = STORE_METRIC_MAP[metricKey];

  const storeGroups = useMemo(
    () => STORE_GROUPS
      .map((group) => ({
        id: String(group.id),
        label: group.name,
        stores: STORES.filter((store) => group.storeIds.includes(store.id)).map((store) => ({ id: store.id, label: store.name })),
      }))
      .filter((group) => group.stores.length > 0),
    [],
  );

  const snapshot = useMemo(
    () => buildStoreSnapshot(effectiveStoreIds, country, from, to, false, []),
    [effectiveStoreIds, country, from, to],
  );
  const tableRows = useMemo(
    () => buildStoreTableRows(effectiveStoreIds, country, from, to, false, []),
    [effectiveStoreIds, country, from, to],
  );
  const sorted = useMemo(
    () => sortByNumber(tableRows, (row) => (Number.isFinite(row.summary[sortKey]) ? row.summary[sortKey] : null), sortDir),
    [tableRows, sortKey, sortDir],
  );
  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageRows = sorted.slice((page - 1) * pageSize, page * pageSize);
  const rowTrends = useMemo(() => {
    const map = new Map<number, number[]>();
    pageRows.forEach((row) => {
      const snap = buildStoreSnapshot([row.storeId], country, from, to, false, []);
      map.set(row.storeId, snap.series[metricKey] ?? []);
    });
    return map;
  }, [pageRows, country, from, to, metricKey]);

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
    const error = validateStoreRange(nextFrom, nextTo);
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

  const switchTab = (next: string) => {
    setTabKey(next);
    setPage(1);
    if (next === 'ad') return;
    const target = STORE_TABS.find((item) => item.key === next) ?? STORE_TABS[0];
    setMetricKey(target.metrics[0].key);
    setSortKey(target.metrics[0].key);
    setSortDir('desc');
  };

  const sortMark = (key: MetricKey) => (sortKey === key ? (sortDir === 'asc' ? '↑' : '↓') : '↕');

  return (
    <div className="hd-l2">
      <Breadcrumb items={['报表', '店铺报表']} onHome={onHome} />
      <div className="hd-l2-title-row">
        <h1 className="hd-l2-title">店铺报表</h1>
      </div>

      <div className="hd-glass hd-filter-card">
        <div className="hd-filter-row">
          <div className="hd-filter-group">
            <span className="hd-filter-label">店铺</span>
            <StoreCascader
              groups={storeGroups}
              value={storeIds}
              width={260}
              onChange={(next) => { setStoreIds(next); setPage(1); }}
            />
          </div>
          <div className="hd-filter-group">
            <span className="hd-filter-label">国家</span>
            <Select value={country} options={COUNTRIES.map((item) => ({ value: item.id, label: item.name }))} width={120} onChange={(value) => { setCountry(value); setPage(1); }} />
          </div>
          <div className="hd-filter-group is-grow">
            <span className="hd-filter-label">时间</span>
            <div className="hd-date-row">
              <Segmented value={preset} options={DATE_PRESETS.map((item) => ({ key: item.key, label: item.label }))} onChange={applyPreset} />
              <input className="hd-input hd-date-input" type="date" value={customFrom} min={DATA_FROM} max={REPORT_TO} onChange={(event) => applyCustom(event.target.value, customTo)} />
              <span className="hd-muted">至</span>
              <input className="hd-input hd-date-input" type="date" value={customTo} min={DATA_FROM} max={REPORT_TO} onChange={(event) => applyCustom(customFrom, event.target.value)} />
            </div>
          </div>
          <div className="hd-filter-actions">
            <button
              type="button"
              className="hd-btn is-default"
              onClick={() => {
                setStoreIds(STORES.map((store) => store.id));
                setCountry('TOTAL');
                applyPreset('30');
              }}
            >
              重置
            </button>
          </div>
        </div>
        {rangeError || rangeErrorText ? <div className="hd-filter-error">{rangeError || rangeErrorText}</div> : null}
        {preset === '60' || preset === '90' ? <div className="hd-filter-hint">近 60/90 天基于系统累计数据统计，新注册店铺历史不足时按已有天数展示。</div> : null}
      </div>

      <div className="hd-glass hd-l2-card">
        <div className="hd-l2-card-head">
          <div className="hd-table-tabs">
            {STORE_TABS.map((item: StoreTab) => (
              <button type="button" key={item.key} className={`hd-table-tab${tabKey === item.key ? ' is-active' : ''}`} onClick={() => switchTab(item.key)}>
                {item.label}
                <span className="hd-table-tab-count">{item.metrics.length}</span>
              </button>
            ))}
            <button type="button" className={`hd-table-tab${tabKey === 'ad' ? ' is-active' : ''}`} onClick={() => switchTab('ad')}>
              广告
              <span className="hd-table-tab-count">7</span>
            </button>
          </div>
          {tabKey === 'ad' ? (
            <div className="hd-ad-exclusion">
              <Segmented
                value={exclusionEnabled ? 'exclude' : 'raw'}
                options={[{ key: 'exclude', label: '剔除补单' }, { key: 'raw', label: '原始数据' }]}
                onChange={(next) => {
                  if ((next === 'exclude') !== exclusionEnabled) onToggleExclusion();
                }}
              />
              <span className="hd-link" onClick={() => setExclusionOpen(true)}>剔除设置</span>
            </div>
          ) : null}
        </div>

        {tabKey === 'ad' ? (
          <AdSummarySection
            storeIds={adStoreIds}
            from={from}
            to={to}
            country={country}
            exclusionEnabled={exclusionEnabled}
            configs={configs}
            trendMetric={adTrendMetric}
            onTrendMetricChange={setAdTrendMetric}
          />
        ) : (
          <>
        <div className="hd-store-kpi-grid">
          {tab.metrics.map((item) => (
            <button
              type="button"
              key={item.key}
              className={`hd-glass hd-store-kpi is-card${metricKey === item.key ? ' is-active' : ''}`}
              onClick={() => setMetricKey(item.key)}
            >
              <span className="hd-store-kpi-label">
                {item.label}
                <Tooltip content={item.tip}><span className="hd-help">?</span></Tooltip>
              </span>
              <strong>{metricFormat(item.format, snapshot.summary[item.key])}</strong>
            </button>
          ))}
        </div>

        <Chart
          labels={snapshot.dates.map((date) => date.slice(5).replace('-', '/'))}
          series={[{
            key: metricKey,
            label: metric?.label ?? '',
            color: '#ff8a3d',
            values: snapshot.series[metricKey].map((value) => (Number.isFinite(value) ? value : null)),
            area: true,
          }]}
          height={240}
          formatValue={(value) => metricFormat(metric?.format ?? 'count', value)}
          axisFormat={metric?.format === 'money' ? fmtMoneyAxis : fmtAxis}
          tipRows={(index) => [
            { label: metric?.label ?? '', value: metricFormat(metric?.format ?? 'count', snapshot.series[metricKey][index]), color: '#ff8a3d' },
          ]}
        />
          </>
        )}
      </div>

      {tabKey === 'ad' ? (
        <AdMultiViewTable
          storeIds={adStoreIds}
          from={from}
          to={to}
          exclusionEnabled={exclusionEnabled}
          configs={configs}
          trendMetric={adTrendMetric}
        />
      ) : (
      <div className="hd-glass hd-l2-card">
        <div className="hd-l2-card-head">
          <div className="hd-l2-card-title">店铺对比 · {tab.label}</div>
          <span className="hd-l2-card-hint">共 {effectiveStoreIds.length} 家店铺 · 合计行按已选范围重算</span>
        </div>
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
                {tab.metrics.map((item) => (
                  <th key={item.key} className="is-num" onClick={() => {
                    if (sortKey === item.key) setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'));
                    else { setSortKey(item.key); setSortDir('desc'); }
                    setPage(1);
                  }}>
                    {item.label} {sortMark(item.key)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row) => (
                <tr key={row.storeId}>
                  <td>
                    <span className="hd-store-cell">
                      <strong>{row.storeName}</strong>
                      <em>{row.alias}</em>
                      {row.daysAvailable === 0 ? <span className="hd-tag is-muted">无数据</span> : row.daysAvailable < rangeLength ? <span className="hd-tag is-warn">数据不足 {rangeLength - row.daysAvailable} 天</span> : null}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="hd-spark"
                      title={`查看${metric?.label ?? ''}趋势`}
                      onClick={() => setDialogStore(row.storeId)}
                    >
                      <Sparkline values={rowTrends.get(row.storeId) ?? []} />
                    </button>
                  </td>
                  {tab.metrics.map((item) => (
                    <td key={item.key} className="is-num">{metricFormat(item.format, row.summary[item.key])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td>合计</td>
                <td />
                {tab.metrics.map((item) => (
                  <td key={item.key} className="is-num">{metricFormat(item.format, snapshot.summary[item.key])}</td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
        {effectiveStoreIds.length === 0 ? <div className="hd-empty hd-empty-lg">当前筛选没有店铺，请调整店铺范围</div> : null}
        <div className="hd-pager-bar">
          <span>共 {sorted.length} 条</span>
          <div className="hd-pager">
            <button type="button" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>‹</button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((item) => (
              <button type="button" key={item} className={page === item ? 'is-active' : ''} onClick={() => setPage(item)}>{item}</button>
            ))}
            <button type="button" disabled={page >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>›</button>
          </div>
          <Select value={pageSize} options={[10, 20, 50].map((value) => ({ value, label: `${value} 条/页` }))} width={100} onChange={(value) => { setPageSize(Number(value)); setPage(1); }} />
        </div>
      </div>
      )}

      {dialogStore !== null ? (
        <StoreTrendDialog
          storeId={dialogStore}
          country={country}
          from={from}
          to={to}
          initialTabKey={tabKey}
          initialMetricKey={metricKey}
          onClose={() => setDialogStore(null)}
        />
      ) : null}

      {exclusionOpen ? (
        <ExclusionDialog
          configs={configs}
          excludedGmv={exclusionInfo.gmv}
          excludedCount={exclusionInfo.count}
          manualTotal={exclusionInfo.manualTotal}
          onSave={(next) => {
            onSaveConfigs(next);
            setExclusionOpen(false);
          }}
          onClose={() => setExclusionOpen(false)}
        />
      ) : null}
    </div>
  );
}
