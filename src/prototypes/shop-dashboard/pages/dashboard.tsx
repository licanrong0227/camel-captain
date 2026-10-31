import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronRight, X } from 'lucide-react';
import {
  CAPABILITY_GROUPS,
  COUNTRIES,
  DATA_TABS,
  GROUP_ROWS,
  HISTORY,
  STORES,
  STORE_GROUPS,
  STORE_GROUP_OPTIONS,
  WIS,
  type GroupRow,
  type MetricKey,
  type MetricType,
  type Period,
  type TagDetail,
} from '../data';
import { formatChartValue, formatMetric, formatTooltip, sparklinePoints } from '../format';
import { AD_DAILY } from '../ad-data';
import { Select } from '../components/Select';
import { Tooltip } from '../components/Tooltip';
import { LineChart } from '../components/LineChart';
import { AdPanel } from '../components/AdPanel';
import { buildStoreSnapshot } from '../store-data';
import { AdFilterBar } from '../components/AdFilterBar';
import { AdExclusionDialog } from '../components/AdExclusionDialog';
import { StoreItemTable } from '../components/StoreItemTable';
import { ItemAdTrendDialog } from '../components/ItemAdTrendDialog';
import type { ItemAdRow } from '../item-ad-data';
import {
  AD_DEFAULT_EXCLUSIONS,
  adChartValue,
  buildAdSnapshot,
  fmtKpiValue,
  formatAdAxis,
  formatAdValue,
  presetRange,
  validateRange,
  type AdExclusionConfig,
  type AdKpiCard,
  type AdPreset,
} from '../ad-report';

const ZERO_SUMMARY = {
  statDate: '',
  timeNo: '',
  confirmGmv: 0,
  confirmBuyerNum: 0,
  dealTransRate: 0,
  unitPrice: 0,
  obRate: 0,
  confirmRfxNum: 0,
  confirmProdQt: 0,
  startedGmv: 0,
  startedBuyerNum: 0,
  startedTransRate: 0,
  startedRfxNum: 0,
  pdPv: 0,
  pdUv: 0,
  expoPv: 0,
  avgUvValue: 0,
  addcartUv: 0,
  addcartIcNum: 0,
  addfavUv: 0,
};

function HelpIcon({ content }: { content: string }) {
  return (
    <Tooltip content={content} className="ss-tip-wrap">
      <span className="ss-tip-icon">?</span>
    </Tooltip>
  );
}

type TableSortKey = MetricKey | 'adCost' | 'adGmv' | 'storeGmv' | 'adRatio' | 'roas';

function sortValue(row: TableGroupRow, key: TableSortKey): number | null {
  if (key === 'adCost' || key === 'adGmv' || key === 'storeGmv' || key === 'adRatio' || key === 'roas') {
    if (!AD_STORE_IDS.has(row.storeId)) return null;
    const card = row.adKpis.find((item) => item.key === key);
    return card && card.value !== null && Number.isFinite(card.value) ? card.value : null;
  }
  const value = Number(row.wis[key]);
  return Number.isNaN(value) ? null : value;
}

function tagValue(row: GroupRow, name: string): TagDetail | undefined {
  return row.tags.find((tag) => tag.name === name);
}

const AD_TABLE_METRICS: Array<{ key: TableSortKey; label: string; tip: string }> = [
  { key: 'adCost', label: '广告消耗', tip: '区间内所有链接的广告花费之和' },
  { key: 'adGmv', label: '广告 GMV', tip: '广告商品维度成交额之和' },
  { key: 'storeGmv', label: '整店 GMV', tip: '店铺成交额之和' },
  { key: 'adRatio', label: '广告 GMV 占比', tip: '广告 GMV/整店 GMV' },
  { key: 'roas', label: 'ROAS', tip: '广告 GMV/广告消耗' },
];

const TABLE_TABS = [
  ...DATA_TABS.map((item) => ({ key: item.key, label: item.label })),
  { key: 'ad', label: '广告' },
];

type TableGroupRow = GroupRow & { adKpis: AdKpiCard[] };

const AD_STORE_IDS = new Set(AD_DAILY.map((row) => row.storeId));

function adKpiText(row: TableGroupRow, key: string): string {
  if (!AD_STORE_IDS.has(row.storeId)) return '-';
  const card = row.adKpis.find((item) => item.key === key);
  return card ? fmtKpiValue(card, card.value) : '-';
}

function GroupTable({
  rows,
  tabKey,
  onTabChange,
  onExport,
  sort,
  onSort,
  onOpenTrend,
  onOpenAdTrend,
  adFrom,
  adTo,
  excludeEnabled,
  configs,
}: {
  rows: TableGroupRow[];
  tabKey: string;
  onTabChange: (key: string) => void;
  onExport: () => void;
  sort: { key: TableSortKey | null; order: 'asc' | 'desc' | null };
  onSort: (key: TableSortKey) => void;
  onOpenTrend: (row: GroupRow) => void;
  onOpenAdTrend: (row: GroupRow) => void;
  adFrom: string;
  adTo: string;
  excludeEnabled: boolean;
  configs: AdExclusionConfig[];
}) {
  const [expandedStoreId, setExpandedStoreId] = useState<number | null>(null);

  useEffect(() => {
    if (tabKey !== 'ad') setExpandedStoreId(null);
  }, [tabKey]);
  const [itemTrend, setItemTrend] = useState<ItemAdRow | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const [tableWidth, setTableWidth] = useState(1400);

  useEffect(() => {
    const node = tableRef.current;
    if (!node) return undefined;
    const update = () => setTableWidth(Math.round(node.getBoundingClientRect().width));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [tabKey]);
  const isAd = tabKey === 'ad';
  const tabConfig = DATA_TABS.find((item) => item.key === tabKey);
  const dataMetrics = tabConfig ? tabConfig.metrics : [];
  const metrics = isAd
    ? AD_TABLE_METRICS
    : dataMetrics.map((item) => ({ key: item.key, label: item.label }));
  const baseWidth = 150 + 70 + 70 + 120 + 120;
  const totalWidth = baseWidth + metrics.length * 100;

  const tipIcon = (content: string) => (
    <span className="ss-th-tip" onClick={(event) => event.stopPropagation()}>
      <Tooltip content={content}>
        <span className="ss-tip-icon">?</span>
      </Tooltip>
    </span>
  );

  const sortCaret = (key: TableSortKey) => (
    <span className="ss-sort-caret">
      <i className={`ss-caret-up${sort.key === key && sort.order === 'asc' ? ' is-active' : ''}`} />
      <i className={`ss-caret-down${sort.key === key && sort.order === 'desc' ? ' is-active' : ''}`} />
    </span>
  );

  const adSparkline = (storeId: number) =>
    sparklinePoints(
      AD_DAILY.filter((row) => row.storeId === storeId)
        .slice(-30)
        .map((row) => ({ statDate: row.date, confirmGmv: row.adCost })),
    );

  return (
    <>
      <div className="ss-group-tabs-bar">
        <div className="ss-group-tabs ss-data-tabs" data-annotation-id="ssd-table-ad">
          {TABLE_TABS.map((item) => (
            <span
              key={item.key}
              className={`ss-data-tab${tabKey === item.key ? ' is-active' : ''}`}
              onClick={() => onTabChange(item.key)}
            >
              {item.label}
            </span>
          ))}
        </div>
        <button type="button" className="ss-btn ss-btn--default ss-group-export" onClick={onExport}>导出</button>
      </div>
      <div className="ss-group-table-wrap" style={{ height: isAd && expandedStoreId ? 'auto' : 320 }}>
        <div className="ss-group-table-scroll">
          <table ref={tableRef} className="ss-table ss-group-table" style={{ width: '100%', minWidth: totalWidth }}>
            <colgroup>
              <col style={{ width: 150 }} />
              <col style={{ width: 70 }} />
              <col style={{ width: 70 }} />
              <col style={{ width: 120 }} />
              <col style={{ width: 120 }} />
              {metrics.map((column) => <col key={column.key} />)}
            </colgroup>
            <thead>
              <tr>
                <th className="ss-sticky-col">店铺</th>
                <th>等级</th>
                <th>能力分</th>
                <th className="is-center">店铺数据趋势图</th>
                <th className="is-center">广告数据趋势图</th>
                {isAd
                  ? AD_TABLE_METRICS.map((column) => (
                    <th key={column.key} className="is-sortable" onClick={() => onSort(column.key)}>
                      <span className="ss-th-inner">
                        {column.label}
                        {tipIcon(column.tip)}
                        {sortCaret(column.key)}
                      </span>
                    </th>
                  ))
                  : dataMetrics.map((column) => (
                    <th key={column.key} className="is-sortable" onClick={() => onSort(column.key)}>
                      <span className="ss-th-inner">
                        {column.label}
                        {tipIcon(column.tip)}
                        {sortCaret(column.key)}
                      </span>
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <React.Fragment key={row.storeId}>
                  <tr
                    className={`ss-store-row${isAd ? ' is-expandable' : ''}`}
                    onClick={() => {
                      if (!isAd) return;
                      setExpandedStoreId((prev) => (prev === row.storeId ? null : row.storeId));
                    }}
                  >
                    <td className="ss-sticky-col">
                      <div className="ss-store-cell-wrap">
                        {isAd ? (
                          <ChevronRight
                            size={14}
                            className={`ss-row-caret${expandedStoreId === row.storeId ? ' is-open' : ''}`}
                          />
                        ) : null}
                        <div className="ss-store-cell">
                          <div className="ss-store-name" title={row.storeName}>{row.storeName || row.aliasName}</div>
                          <div className="ss-store-id">ID: {row.storeId}</div>
                        </div>
                      </div>
                    </td>
                    <td>{row.level || 0}</td>
                    <td>{row.score || 0}</td>
                    <td className="is-center">
                      <svg
                        className="ss-sparkline"
                        viewBox="0 0 72 28"
                        width="72"
                        height="28"
                        preserveAspectRatio="none"
                        onClick={(event) => {
                          event.stopPropagation();
                          onOpenTrend(row);
                        }}
                      >
                        <polyline
                          fill="none"
                          stroke="#5B8FF9"
                          strokeWidth="1.5"
                          strokeLinejoin="round"
                          strokeLinecap="round"
                          points={sparklinePoints(row.history)}
                        />
                      </svg>
                    </td>
                    <td className="is-center">
                      <svg
                        className="ss-sparkline"
                        viewBox="0 0 72 28"
                        width="72"
                        height="28"
                        preserveAspectRatio="none"
                        onClick={(event) => {
                          event.stopPropagation();
                          onOpenAdTrend(row);
                        }}
                      >
                        <polyline
                          fill="none"
                          stroke="#FF7D29"
                          strokeWidth="1.5"
                          strokeLinejoin="round"
                          strokeLinecap="round"
                          points={adSparkline(row.storeId)}
                        />
                      </svg>
                    </td>
                    {isAd
                      ? AD_TABLE_METRICS.map((column) => <td key={column.key}>{adKpiText(row, column.key)}</td>)
                      : dataMetrics.map((column) => (
                        <td key={column.key}>{formatMetric(column.type, row.wis[column.key])}</td>
                      ))}
                  </tr>
                  {isAd && expandedStoreId === row.storeId ? (
                    <tr className="ss-expand-tr">
                      <td className="ss-expand-td" colSpan={5 + metrics.length}>
                        <StoreItemTable
                          storeId={row.storeId}
                          from={adFrom}
                          to={adTo}
                          excludeEnabled={excludeEnabled}
                          configs={configs}
                          tableWidth={tableWidth}
                          onOpenTrend={setItemTrend}
                        />
                      </td>
                    </tr>
                  ) : null}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {itemTrend ? (
        <ItemAdTrendDialog
          storeId={itemTrend.storeId}
          itemCode={itemTrend.itemCode}
          from={adFrom}
          to={adTo}
          excludeEnabled={excludeEnabled}
          configs={configs}
          onClose={() => setItemTrend(null)}
        />
      ) : null}
    </>
  );
}

function TrendDialog({
  storeId,
  storeName,
  initialPeriod,
  onClose,
}: {
  storeId: number;
  storeName: string;
  initialPeriod: Period;
  onClose: () => void;
}) {
  const [tab, setTab] = useState('deal');
  const [metricKey, setMetricKey] = useState<MetricKey>('confirmGmv');
  const period: Period = initialPeriod;
  const countryId = 'TOTAL';
  const summary = WIS[`${storeId}-${period}-${countryId}`] || ZERO_SUMMARY;
  const history = HISTORY[`${storeId}-${countryId}`];
  const tabConfig = DATA_TABS.find((item) => item.key === tab) || DATA_TABS[0];
  const metric = DATA_TABS.flatMap((item) => item.metrics).find((item) => item.key === metricKey) || DATA_TABS[0].metrics[0];
  const values = history ? history.series[metricKey].map((value) => formatChartValue(metric.type, value)) : [];
  const dates = history ? history.dates : [];

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div className="ss-modal" onMouseDown={onClose}>
      <div
        className="ss-dialog ss-trend-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="查看趋势图"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="ss-dialog-header">
          <span className="ss-dialog-title">查看趋势图 - {storeName}</span>
          <button type="button" className="ss-dialog-close" onClick={onClose} aria-label="关闭"><X size={16} /></button>
        </div>
        <div className="ss-dialog-body">
          <div className="ss-store-data-header">
            <div className="ss-data-tabs">
              {DATA_TABS.map((item) => (
                <span
                  key={item.key}
                  className={`ss-data-tab${tab === item.key ? ' is-active' : ''}`}
                  onClick={() => {
                    setTab(item.key);
                    setMetricKey(item.metrics[0].key);
                  }}
                >
                  {item.label}
                </span>
              ))}
            </div>
          </div>
          <div className="ss-kpi-cards">
            {tabConfig.metrics.map((item) => (
              <div
                key={item.key}
                className={`ss-kpi-card${metricKey === item.key ? ' is-active' : ''}`}
                onClick={() => setMetricKey(item.key)}
              >
                <div className="ss-kpi-label">{item.label}<HelpIcon content={item.tip} /></div>
                <div className="ss-kpi-value">{formatMetric(item.type, summary[item.key])}</div>
              </div>
            ))}
          </div>
          <LineChart
            dates={dates}
            height={360}
            ariaLabel={metric.label}
            series={[{ key: metricKey, label: metric.label, color: '#ff781f', values, area: true }]}
            formatValue={(value) => formatTooltip(metric.type, value)}
            axisFormat={(value) => (metric.type === 'rate' ? `${value}%` : String(value))}
            xFormat={(date) => date.slice(5).replace('-', '/')}
          />
        </div>
      </div>
    </div>
  );
}

function AdTrendDialog({
  storeId,
  storeName,
  from,
  to,
  excludeEnabled,
  configs,
  onClose,
}: {
  storeId: number;
  storeName: string;
  from: string;
  to: string;
  excludeEnabled: boolean;
  configs: AdExclusionConfig[];
  onClose: () => void;
}) {
  const snapshot = useMemo(
    () => buildAdSnapshot({ storeId, from, to }, excludeEnabled, configs, [storeId]),
    [storeId, from, to, excludeEnabled, configs],
  );
  const [metricKey, setMetricKey] = useState('adCost');
  const metric = snapshot.kpis.find((card) => card.key === metricKey) || snapshot.kpis[0];
  const values = snapshot.points.map((point) => adChartValue(point, metric.key));

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div className="ss-modal" onMouseDown={onClose}>
      <div className="ss-dialog ss-ad-trend-dialog" data-annotation-id="ssd-store-ad-dialog" role="dialog" aria-modal="true" aria-label="广告数据趋势" onMouseDown={(event) => event.stopPropagation()}>
        <div className="ss-dialog-header">
          <span className="ss-dialog-title">广告数据 - {storeName}</span>
          <button type="button" className="ss-dialog-close" onClick={onClose} aria-label="关闭"><X size={16} /></button>
        </div>
        <div className="ss-dialog-body">
          <div className="ss-ad-kpi-grid">
            {snapshot.kpis.map((card) => (
              <div
                key={card.key}
                className={`ss-ad-kpi${metric.key === card.key ? ' is-active' : ''}`}
                onClick={() => setMetricKey(card.key)}
              >
                <div className="ss-ad-kpi-label">
                  {card.label}
                  <Tooltip content={card.hint} className="ss-tip-wrap">
                    <span className="ss-tip-icon">?</span>
                  </Tooltip>
                </div>
                <div className="ss-ad-kpi-value">{fmtKpiValue(card, card.value)}</div>
              </div>
            ))}
          </div>
          <div className="ss-ad-trend-chart">
            <LineChart
              dates={snapshot.points.map((point) => point.date)}
              height={320}
              ariaLabel={`${metric.label}走势`}
              series={[{ key: metric.key, label: metric.label, color: '#ff781f', values, area: true }]}
              formatValue={(value) => formatAdValue(metric.key, value)}
              axisFormat={(value) => formatAdAxis(metric.key, value)}
              xFormat={(date) => date.slice(5).replace('-', '/')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [countryId, setCountryId] = useState('TOTAL');
  const [activeTab, setActiveTab] = useState('deal');
  const [metricKey, setMetricKey] = useState<MetricKey>('confirmGmv');
  const [tableTab, setTableTab] = useState('deal');

  const [sort, setSort] = useState<{ key: TableSortKey | null; order: 'asc' | 'desc' | null }>({ key: null, order: null });
  const [adTrendDialog, setAdTrendDialog] = useState<{ storeId: number; storeName: string } | null>(null);
  const [trendDialog, setTrendDialog] = useState<{ storeId: number; storeName: string } | null>(null);

  const [adStoreId, setAdStoreId] = useState<number | null>(null);
  const [adGroupId, setAdGroupId] = useState('');
  const [adPreset, setAdPreset] = useState<AdPreset>('7');
  const [adRange, setAdRange] = useState(() => presetRange('7'));
  const [adDraft, setAdDraft] = useState(() => presetRange('7'));
  const [adExclude, setAdExclude] = useState(true);
  const [adExclusions, setAdExclusions] = useState<AdExclusionConfig[]>(AD_DEFAULT_EXCLUSIONS);
  const [adExclusionOpen, setAdExclusionOpen] = useState(false);

  const activeGroup = adGroupId ? STORE_GROUPS.find((group) => String(group.id) === adGroupId) : null;
  const groupStoreIds = activeGroup ? activeGroup.storeIds : null;
  const storeScopeIds = useMemo(() => (adStoreId ? [adStoreId] : groupStoreIds), [adStoreId, groupStoreIds]);
  const storeOptions = useMemo(() => {
    const ids = groupStoreIds && groupStoreIds.length ? groupStoreIds : STORES.map((store) => store.id);
    const allLabel = activeGroup ? `全部店铺（${activeGroup.name}）` : '全部店铺（店群）';
    return [
      { value: 'all', label: allLabel },
      ...STORES.filter((store) => ids.includes(store.id)).map((store) => ({ value: String(store.id), label: store.name })),
    ];
  }, [activeGroup, groupStoreIds]);
  const storeSnapshot = useMemo(
    () => buildStoreSnapshot(storeScopeIds, countryId, adRange.from, adRange.to),
    [storeScopeIds, countryId, adRange],
  );
  const summary = storeSnapshot.summary;
  const tabConfig = DATA_TABS.find((item) => item.key === activeTab) || DATA_TABS[0];
  const metric = DATA_TABS.flatMap((item) => item.metrics).find((item) => item.key === metricKey) || DATA_TABS[0].metrics[0];
  const chartValues = storeSnapshot.series[metricKey].map((value) => formatChartValue(metric.type, value));
  const chartDates = storeSnapshot.dates;

  const groupRows = useMemo<TableGroupRow[]>(() => {
    const scope = storeScopeIds && storeScopeIds.length ? storeScopeIds : STORES.map((store) => store.id);
    let rows: TableGroupRow[] = (GROUP_ROWS.L30 || [])
      .filter((row) => scope.includes(row.storeId))
      .map((row) => {
        const snapshot = buildStoreSnapshot([row.storeId], 'TOTAL', adRange.from, adRange.to);
        const adSnapshotRow = buildAdSnapshot(
          { storeId: row.storeId, from: adRange.from, to: adRange.to },
          adExclude,
          adExclusions,
          [row.storeId],
        );
        return { ...row, wis: snapshot.summary, adKpis: adSnapshotRow.kpis };
      });
    if (sort.key && sort.order) {
      const key = sort.key;
      const direction = sort.order === 'asc' ? 1 : -1;
      rows = rows.slice().sort((a, b) => {
        const left = sortValue(a, key);
        const right = sortValue(b, key);
        if (left === null && right === null) return 0;
        if (left === null) return 1;
        if (right === null) return -1;
        return (left - right) * direction;
      });
    }
    return rows;
  }, [storeScopeIds, adRange, adExclude, adExclusions, sort]);

  const adError = adPreset === 'custom' ? validateRange(adDraft.from, adDraft.to) : '';
  const trendPeriod: Period = adPreset === '1' ? 'DAY' : adPreset === '7' ? 'L7' : 'L30';
  const adSnapshot = useMemo(
    () => buildAdSnapshot({ storeId: adStoreId, from: adRange.from, to: adRange.to }, adExclude, adExclusions, groupStoreIds),
    [adStoreId, adRange, adExclude, adExclusions, groupStoreIds],
  );
  const onAdStoreChange = (value: string) => setAdStoreId(value === 'all' ? null : Number(value));
  const onAdGroupChange = (value: string) => {
    setAdGroupId(value);
    if (value) {
      const group = STORE_GROUPS.find((item) => String(item.id) === value);
      if (adStoreId && group && !group.storeIds.includes(adStoreId)) setAdStoreId(null);
    }
  };
  const onAdPresetChange = (next: AdPreset) => {
    setAdPreset(next);
    if (next === 'custom') return;
    const range = presetRange(next);
    setAdRange(range);
    setAdDraft(range);
  };
  const onAdDateChange = (field: 'from' | 'to', value: string) => {
    setAdPreset('custom');
    const next = { ...adDraft, [field]: value };
    setAdDraft(next);
    if (!validateRange(next.from, next.to)) setAdRange(next);
  };
  const onAdReset = () => {
    const range = presetRange('7');
    setAdPreset('7');
    setAdStoreId(null);
    setAdRange(range);
    setAdDraft(range);
    setAdExclude(true);
  };
  const onSort = (key: TableSortKey) => {
    setSort((prev) => {
      if (prev.key !== key) return { key, order: 'asc' };
      if (prev.order === 'asc') return { key, order: 'desc' };
      if (prev.order === 'desc') return { key: null, order: null };
      return { key, order: 'asc' };
    });
  };

  const handleTableTabChange = (key: string) => {
    setTableTab(key);
    setSort({ key: null, order: null });
  };

  const handleExport = () => {
    const isAd = tableTab === 'ad';
    const tabConfig = DATA_TABS.find((item) => item.key === tableTab) || DATA_TABS[0];
    const tabLabel = isAd ? '广告' : tabConfig.label;
    const header = isAd
      ? ['店铺', '店铺ID', '等级', '能力分', ...AD_TABLE_METRICS.map((item) => item.label)]
      : ['店铺', '店铺ID', '等级', '能力分', ...tabConfig.metrics.map((column) => column.label)];
    const lines = groupRows.map((row) => [
      row.storeName,
      row.storeId,
      row.level || 0,
      row.score || 0,
      ...(isAd
        ? AD_TABLE_METRICS.map((item) => adKpiText(row, item.key))
        : tabConfig.metrics.map((column) => formatMetric(column.type, row.wis[column.key]))),
    ]);
    const csv = [header, ...lines]
      .map((line) => line.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `店铺横向对比-${tabLabel}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="ss-content">

      <AdFilterBar
            storeId={adStoreId}
            storeOptions={storeOptions}
            groupId={adGroupId}
            groupOptions={STORE_GROUP_OPTIONS}
            onGroupChange={onAdGroupChange}
            preset={adPreset}
            draftFrom={adDraft.from}
            draftTo={adDraft.to}
            error={adError}
            onStoreChange={onAdStoreChange}
            onPresetChange={onAdPresetChange}
            onDateChange={onAdDateChange}
          />
          <div className="ss-single-grid">
          <div className="ss-card ss-store-data-card">
            <div className="ss-section-title ss-store-data-title">店铺数据</div>
            <div className="ss-store-data-header">
              <div className="ss-data-tabs">
                {DATA_TABS.map((item) => (
                  <span
                    key={item.key}
                    className={`ss-data-tab${activeTab === item.key ? ' is-active' : ''}`}
                    onClick={() => {
                      setActiveTab(item.key);
                      setMetricKey(item.metrics[0].key);
                    }}
                  >
                    {item.label}
                  </span>
                ))}
              </div>
              <div className="ss-data-filters">
                <Select
                  width={140}
                  value={countryId}
                  options={COUNTRIES.map((item) => ({ value: item.id, label: item.name }))}
                  onChange={setCountryId}
                />
              </div>
            </div>
            <div className="ss-kpi-cards">
              {tabConfig.metrics.map((item) => (
                <div
                  key={item.key}
                  className={`ss-kpi-card${metricKey === item.key ? ' is-active' : ''}`}
                  onClick={() => setMetricKey(item.key)}
                >
                  <div className="ss-kpi-label">{item.label}<HelpIcon content={item.tip} /></div>
                  <div className="ss-kpi-value">{formatMetric(item.type, summary[item.key])}</div>
                </div>
              ))}
            </div>
            <LineChart
              dates={chartDates}
              height={320}
              ariaLabel={metric.label}
              series={[{ key: metricKey, label: metric.label, color: '#ff781f', values: chartValues, area: true }]}
              formatValue={(value) => formatTooltip(metric.type, value)}
              axisFormat={(value) => (metric.type === 'rate' ? `${value}%` : String(value))}
              xFormat={(date) => date.slice(5).replace('-', '/')}
            />
          </div>
          <AdPanel
            snapshot={adSnapshot}
            excludeEnabled={adExclude}
            onToggleExclude={setAdExclude}
            onOpenExclusion={() => setAdExclusionOpen(true)}
          />
        </div>
      <div className="ss-group-mode-section">
          <div className="ss-table-card">
            <GroupTable
              rows={groupRows}
              tabKey={tableTab}
              onTabChange={handleTableTabChange}
              onExport={handleExport}
              sort={sort}
              onSort={onSort}
              adFrom={adRange.from}
              adTo={adRange.to}
              excludeEnabled={adExclude}
              configs={adExclusions}
              onOpenTrend={(row) => setTrendDialog({ storeId: row.storeId, storeName: row.storeName })}
              onOpenAdTrend={(row) => setAdTrendDialog({ storeId: row.storeId, storeName: row.storeName })}
            />
          </div>
      </div>


      {adExclusionOpen ? (
        <AdExclusionDialog
          configs={adExclusions}
          excludedGmv={adSnapshot.excludedGmv}
          excludedCount={adSnapshot.excludedCount}
          manualTotal={adSnapshot.manualTotal}
          onSave={(next) => {
            setAdExclusions(next);
            setAdExclusionOpen(false);
          }}
          onClose={() => setAdExclusionOpen(false)}
        />
      ) : null}
      {adTrendDialog ? (
        <AdTrendDialog
          storeId={adTrendDialog.storeId}
          storeName={adTrendDialog.storeName}
          from={adRange.from}
          to={adRange.to}
          excludeEnabled={adExclude}
          configs={adExclusions}
          onClose={() => setAdTrendDialog(null)}
        />
      ) : null}
      {trendDialog ? (
        <TrendDialog
          key={`${trendDialog.storeId}-${adRange.from}-${adRange.to}`}
          storeId={trendDialog.storeId}
          storeName={trendDialog.storeName}
          initialPeriod={trendPeriod}
          onClose={() => setTrendDialog(null)}
        />
      ) : null}
    </section>
  );
}
