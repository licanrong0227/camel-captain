import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, Check, ChevronDown, Maximize2, RefreshCw, Search, Settings2 } from 'lucide-react';
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
  presetRange,
  previousRange,
  rangeDays,
  sortByNumber,
  AD_STORE_IDS,
} from '../data/aggregate';
import { getDataset, AD_DETAIL_FROM, REPORT_TO, eachDay } from '../data/generate';
import { STORES } from '../data/catalog';
import { STORE_TABS, STORE_METRIC_MAP, type MetricKey } from '../data/metrics';
import { AD_TYPE_LABEL, AD_TYPE_OPTIONS, COUNTRIES, type AdKpiCard } from '../data/types';
import {
  AD_KPI_KEYS,
  AD_KPI_LABELS,
  AD_KPI_TREND,
  AD_TREND_LABELS,
  adKpiText,
  adTrendAxisFormat,
  adTrendFormat,
  type AdTrendView,
} from '../data/adTrend';
import { fmtAxis, fmtInt, fmtMetric, fmtMoney, fmtMoneyAxis, fmtPct, fmtRoas } from '../data/format';
import type { AdTrendPoint, ExclusionConfig } from '../data/types';
import type { DialogRequest } from '../dialog-route';
import { AdDetailSheet } from '../components/AdDetailSheet';
import { BackToTop } from '../components/BackToTop';
import { MetricHelp } from '../components/MetricHelp';
import { Sparkline } from '../components/Sparkline';
import { DateWheelPicker } from '../components/DateWheelPicker';
import { AdListCard } from '../components/AdListCard';
import { EmptyState } from '../components/EmptyState';
import { ExclusionSheet } from '../components/ExclusionSheet';
import { KpiCard } from '../components/KpiCard';
import { MetricConfigSheet } from '../components/MetricConfigSheet';
import { Segmented } from '../components/Segmented';
import { Sheet } from '../components/Sheet';
import { StoreFilterSheet } from '../components/StoreFilterSheet';
import { Chart } from '../components/Chart';
import { LandscapeChart } from '../components/LandscapeChart';
import type { DetailTarget } from '../components/adViewTypes';
import type { AdStoreRow, AdViewKey } from '../components/adViewTypes';
import type { ItemRow, PlanRow, WordRow } from '../data/types';

const DATE_PRESETS = [
  { key: '1', label: '近1天', days: 1 },
  { key: '7', label: '近7天', days: 7 },
  { key: '30', label: '近30天', days: 30 },
  { key: '60', label: '近60天', days: 60 },
  { key: '90', label: '近90天', days: 90 },
];

const VIEWS: Array<{ key: AdViewKey; label: string }> = [
  { key: 'store', label: '店铺' },
  { key: 'item', label: '商品' },
  { key: 'plan', label: '计划' },
  { key: 'word', label: '成单词' },
];

const SORT_OPTIONS: Record<AdViewKey, Array<{ key: string; label: string }>> = {
  store: [
    { key: 'adCost', label: '广告消耗' },
    { key: 'adGmv', label: '广告 GMV' },
    { key: 'storeGmv', label: '整店 GMV' },
    { key: 'adRatio', label: '广告 GMV 占比' },
    { key: 'roas', label: '投产比' },
  ],
  item: [
    { key: 'cost', label: '广告消耗' },
    { key: 'gmv', label: '广告 GMV' },
    { key: 'productGmv', label: '商品 GMV' },
    { key: 'adRatio', label: '广告 GMV 占比' },
    { key: 'roas', label: '投产比' },
  ],
  plan: [
    { key: 'cost', label: '广告消耗' },
    { key: 'gmv', label: '广告 GMV' },
    { key: 'orders', label: '订单数' },
    { key: 'click', label: '点击量' },
    { key: 'roas', label: '投产比' },
  ],
  word: [
    { key: 'gmv', label: '成单 GMV' },
    { key: 'orderCount', label: '订单数' },
    { key: 'itemCount', label: '涉及商品数' },
    { key: 'lastDate', label: '最近成单日' },
  ],
};

const DEFAULT_SORT: Record<AdViewKey, string> = { store: 'adRatio', item: 'cost', plan: 'cost', word: 'gmv' };

const ALL_STORE_IDS = STORES.map((store) => store.id);

const BOARD_TABS = [
  ...STORE_TABS.map((tab) => ({ key: tab.key, label: tab.label })),
  { key: 'ad', label: '广告' },
];

const DEFAULT_STORE_METRIC: Record<string, MetricKey> = STORE_TABS.reduce((acc, tab) => {
  acc[tab.key] = tab.metrics[0].key;
  return acc;
}, {} as Record<string, MetricKey>);

const DEFAULT_CARD_CONFIG: Record<string, string[]> = STORE_TABS.reduce((acc, tab) => {
  acc[tab.key] = tab.metrics.map((metric) => metric.key);
  return acc;
}, {} as Record<string, string[]>);

type ViewFilter = { adType: '' | 'ppc' | 'prodauto' | 'shopauto'; keyword: string };

function validateRange(from: string, to: string) {
  if (!from || !to) return '请选择完整的起止日期';
  if (to < from) return '结束日期不能早于开始日期';
  if (to > REPORT_TO) return `广告数据截至 ${REPORT_TO.replace(/-/g, '/')}`;
  if (from < AD_DETAIL_FROM) return `广告明细仅保留 ${AD_DETAIL_FROM.replace(/-/g, '/')} 之后的数据`;
  if (rangeDays(from, to) > 90) return '单次查询最长 90 天，请缩短日期范围';
  return '';
}

export function AdBoardPage({
  dialogRequest,
  initialMetric,
  initialTab = 'deal',
  exclusionEnabled,
  onToggleExclusion,
  configs,
  onSaveConfigs,
  lastSync,
  syncing,
  onSync,
}: {
  dialogRequest: DialogRequest;
  initialMetric: AdTrendView;
  initialTab?: string;
  exclusionEnabled: boolean;
  onToggleExclusion: () => void;
  configs: ExclusionConfig[];
  onSaveConfigs: (next: ExclusionConfig[]) => void;
  lastSync: string;
  syncing: boolean;
  onSync: () => void;
}) {
  const initial = presetRange(30);
  const [storeIds, setStoreIds] = useState<number[]>([]);
  const [preset, setPreset] = useState('30');
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [customFrom, setCustomFrom] = useState(initial.from);
  const [customTo, setCustomTo] = useState(initial.to);
  const [rangeError, setRangeError] = useState('');
  const [trendMetric, setTrendMetric] = useState<AdTrendView>(initialMetric);
  const [view, setView] = useState<AdViewKey>('store');
  const [viewFilters, setViewFilters] = useState<Record<AdViewKey, ViewFilter>>({
    store: { adType: '', keyword: '' },
    item: { adType: '', keyword: '' },
    plan: { adType: '', keyword: '' },
    word: { adType: '', keyword: '' },
  });
  const [sortKey, setSortKey] = useState<string>(DEFAULT_SORT.store);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [visibleCount, setVisibleCount] = useState(10);
  const [storeOpen, setStoreOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [datePicker, setDatePicker] = useState<'from' | 'to' | null>(null);
  const [metricOpen, setMetricOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [exclusionOpen, setExclusionOpen] = useState(false);
  const [caliberOpen, setCaliberOpen] = useState(false);
  const [storeTrendTarget, setStoreTrendTarget] = useState<{ storeId: number; storeName: string } | null>(null);
  const [storeTrendLandscape, setStoreTrendLandscape] = useState(false);
  const [storeTrendTab, setStoreTrendTab] = useState('deal');
  const [storeTrendMetric, setStoreTrendMetric] = useState<MetricKey>('confirmGmv');
  const [landscapeOpen, setLandscapeOpen] = useState(false);
  const [detailTarget, setDetailTarget] = useState<DetailTarget | null>(null);
  const [boardTab, setBoardTab] = useState(initialTab);
  const [country, setCountry] = useState<string>('TOTAL');
  const [countryOpen, setCountryOpen] = useState(false);
  const [storeMetricKeys, setStoreMetricKeys] = useState<Record<string, MetricKey>>({ ...DEFAULT_STORE_METRIC });
  const [cardConfigs, setCardConfigs] = useState<Record<string, string[]>>({ ...DEFAULT_CARD_CONFIG, ad: [...AD_KPI_KEYS] });
  const [compareVisible, setCompareVisible] = useState(10);
  const [compareSortOpen, setCompareSortOpen] = useState(false);
  const [compareSortKey, setCompareSortKey] = useState<MetricKey | null>(null);
  const [compareSortDir, setCompareSortDir] = useState<'asc' | 'desc'>('desc');
  const scrollRef = useRef<HTMLDivElement>(null);
  const viewTabsRef = useRef<HTMLDivElement>(null);
  const [viewTabsPinned, setViewTabsPinned] = useState(false);

  useEffect(() => {
    setTrendMetric(initialMetric);
  }, [initialMetric]);

  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return undefined;
    const onScroll = () => {
      const tabs = viewTabsRef.current;
      if (!tabs) {
        setViewTabsPinned(false);
        return;
      }
      const band = scroller.querySelector('.cc-board-tabs-band') as HTMLElement | null;
      const scrollerTop = scroller.getBoundingClientRect().top;
      const offset = band ? Math.max(0, Math.round(band.getBoundingClientRect().bottom - scrollerTop)) : 95;
      tabs.style.top = `${offset}px`;
      setViewTabsPinned(scroller.scrollTop > 0 && tabs.getBoundingClientRect().top <= scrollerTop + offset + 1);
    };
    onScroll();
    scroller.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      scroller.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      viewTabsRef.current?.style.removeProperty('top');
    };
  }, [view, boardTab]);

  useEffect(() => {
    setBoardTab(initialTab);
  }, [initialTab]);

  const selectedStoreIds = useMemo(() => (storeIds.length ? storeIds : ALL_STORE_IDS), [storeIds]);
  const effectiveStoreIds = useMemo(
    () => selectedStoreIds.filter((id) => AD_STORE_IDS.includes(id)),
    [selectedStoreIds],
  );
  const rangeLength = rangeDays(from, to);
  const viewFilter = viewFilters[view];

  const adRows = useMemo(
    () => filterProd(getDataset().prodRows, { storeIds: effectiveStoreIds, adType: '', from, to }),
    [effectiveStoreIds, from, to],
  );
  const orderRows = useMemo(
    () => filterOrder(getDataset().orderRows, { storeIds: effectiveStoreIds, adType: '', from, to }),
    [effectiveStoreIds, from, to],
  );

  const previous = useMemo(() => previousRange(from, to), [from, to]);
  const currentMetrics = useMemo(() => finalize(accOfProd(adRows)), [adRows]);
  const previousMetrics = useMemo(() => {
    const rows = filterProd(getDataset().prodRows, { storeIds: effectiveStoreIds, adType: '', from: previous.from, to: previous.to });
    return finalize(accOfProd(rows));
  }, [effectiveStoreIds, previous.from, previous.to]);

  const storeSnapshot = useMemo(
    () => buildStoreSnapshot(effectiveStoreIds, 'TOTAL', from, to, exclusionEnabled, configs),
    [effectiveStoreIds, from, to, exclusionEnabled, configs],
  );
  const prevStoreSnapshot = useMemo(
    () => buildStoreSnapshot(effectiveStoreIds, 'TOTAL', previous.from, previous.to, exclusionEnabled, configs),
    [effectiveStoreIds, previous.from, previous.to, exclusionEnabled, configs],
  );

  const storeTab = STORE_TABS.find((tab) => tab.key === boardTab) ?? null;
  const isAdTab = boardTab === 'ad';
  const boardSnapshot = useMemo(
    () => (isAdTab
      ? storeSnapshot
      : buildStoreSnapshot(selectedStoreIds, country, from, to, exclusionEnabled, configs)),
    [isAdTab, storeSnapshot, selectedStoreIds, country, from, to, exclusionEnabled, configs],
  );
  const storeMetricKey: MetricKey = storeMetricKeys[boardTab] ?? storeTab?.metrics[0].key ?? 'confirmGmv';
  const storeMetric = STORE_METRIC_MAP[storeMetricKey];
  const storeVisibleMetrics = useMemo(() => {
    if (!storeTab) return [];
    const order = cardConfigs[storeTab.key] ?? storeTab.metrics.map((metric) => metric.key);
    const map = new Map(storeTab.metrics.map((metric) => [metric.key, metric]));
    return order.map((key) => map.get(key as MetricKey)).filter((item): item is NonNullable<typeof item> => Boolean(item));
  }, [storeTab, cardConfigs]);
  const compareSortMetricKey: MetricKey = compareSortKey && storeVisibleMetrics.some((metric) => metric.key === compareSortKey)
    ? compareSortKey
    : storeMetricKey;
  const compareSortLabel = storeTab?.metrics.find((metric) => metric.key === compareSortMetricKey)?.label ?? '排序';
  const storeCompareRows = useMemo(
    () => (storeTab
      ? sortByNumber(
        buildStoreTableRows(selectedStoreIds, country, from, to, exclusionEnabled, configs),
        (row) => (Number.isFinite(row.summary[compareSortMetricKey]) ? row.summary[compareSortMetricKey] : null),
        compareSortDir,
      )
      : []),
    [storeTab, selectedStoreIds, country, from, to, exclusionEnabled, configs, compareSortMetricKey, compareSortDir],
  );

  const compareTrends = useMemo(() => {
    const map = new Map<number, number[]>();
    if (!storeTab) return map;
    storeCompareRows.forEach((row) => {
      const series = buildStoreSnapshot([row.storeId], country, from, to, exclusionEnabled, configs).series[storeMetricKey] ?? [];
      map.set(row.storeId, series.map((value) => (Number.isFinite(value) ? value : 0)));
    });
    return map;
  }, [storeTab, storeCompareRows, storeMetricKey, country, from, to, exclusionEnabled, configs]);

  const allKpis = useMemo(
    () => buildAdKpis(currentMetrics, previousMetrics, storeSnapshot.summary.confirmGmv, prevStoreSnapshot.summary.confirmGmv),
    [currentMetrics, previousMetrics, storeSnapshot, prevStoreSnapshot],
  );
  const kpis = useMemo(
    () => cardConfigs.ad.map((key) => allKpis.find((kpi) => kpi.key === key)).filter((kpi): kpi is AdKpiCard => Boolean(kpi)),
    [cardConfigs, allKpis],
  );

  const trend = useMemo(() => {
    const base = buildAdTrend(adRows, from, to);
    return base.map((point, index) => {
      const dayStoreGmv = storeSnapshot.series.confirmGmv[index] ?? 0;
      return {
        ...point,
        storeGmv: dayStoreGmv,
        share: dayStoreGmv > 0 ? point.gmv / dayStoreGmv : null,
      };
    });
  }, [adRows, from, to, storeSnapshot]);

  const adsOf = (adType: ViewFilter['adType']) => (adType ? adRows.filter((row) => row.adType === adType) : adRows);
  const ordersOf = (adType: ViewFilter['adType']) => (adType ? orderRows.filter((row) => row.adType === adType) : orderRows);

  const activeAdRows = useMemo(() => adsOf(viewFilter.adType), [adRows, viewFilter.adType]);
  const activeOrderRows = useMemo(() => ordersOf(viewFilter.adType), [orderRows, viewFilter.adType]);

  const storeRows = useMemo<AdStoreRow[]>(() => {
    const summaries = buildStoreTableRows(effectiveStoreIds, 'TOTAL', from, to, exclusionEnabled, configs);
    const storeAds = adsOf(viewFilters.store.adType);
    return effectiveStoreIds.map((storeId) => {
      const metrics = finalize(accOfProd(storeAds.filter((row) => row.storeId === storeId)));
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
  }, [effectiveStoreIds, adRows, viewFilters.store.adType, from, to, exclusionEnabled, configs]);

  // 原型目录可直接定位到本页弹层：先收起其他弹层，再按 route 打开目标层
  useEffect(() => {
    if (!dialogRequest.token) return;
    const dialog = dialogRequest.dialog;
    setStoreOpen(false);
    setDateOpen(false);
    setDatePicker(null);
    setMetricOpen(false);
    setSortOpen(false);
    setExclusionOpen(false);
    setCaliberOpen(false);
    setCountryOpen(false);
    setCompareSortOpen(false);
    setStoreTrendTarget(null);
    setStoreTrendLandscape(false);
    setLandscapeOpen(false);
    setDetailTarget(null);
    if (!dialog) return;
    const first = storeRows[0];
    switch (dialog) {
      case 'store-filter':
        setStoreOpen(true);
        break;
      case 'date':
        setDateOpen(true);
        break;
      case 'date-picker':
        setDateOpen(true);
        setDatePicker('from');
        break;
      case 'metric':
        setMetricOpen(true);
        break;
      case 'compare-sort':
        setCompareSortOpen(true);
        break;
      case 'sort':
        setSortOpen(true);
        break;
      case 'caliber':
        setCaliberOpen(true);
        break;
      case 'exclusion':
        setExclusionOpen(true);
        break;
      case 'country':
        setCountryOpen(true);
        break;
      case 'store-trend':
        if (first) setStoreTrendTarget({ storeId: first.storeId, storeName: first.storeName });
        break;
      case 'store-trend-landscape':
        if (first) {
          setStoreTrendTarget({ storeId: first.storeId, storeName: first.storeName });
          setStoreTrendLandscape(true);
        }
        break;
      case 'landscape':
        setLandscapeOpen(true);
        break;
      case 'ad-detail':
        if (first) setDetailTarget({ view: 'store', row: first } as DetailTarget);
        break;
      default:
        break;
    }
  }, [dialogRequest]);

  const itemRows = useMemo(() => buildItemRows(adsOf(viewFilters.item.adType)), [adRows, viewFilters.item.adType]);
  const planRows = useMemo(() => buildPlanRows(adsOf(viewFilters.plan.adType)), [adRows, viewFilters.plan.adType]);
  const wordRows = useMemo(() => buildWordRows(ordersOf(viewFilters.word.adType)), [orderRows, viewFilters.word.adType]);

  const keyword = view === 'store' ? '' : viewFilter.keyword.trim().toLowerCase();
  const baseRows = useMemo<Array<AdStoreRow | ItemRow | PlanRow | WordRow>>(() => {
    if (view === 'store') {
      return keyword
        ? storeRows.filter((row) => `${row.storeName} ${row.alias}`.toLowerCase().includes(keyword))
        : storeRows;
    }
    if (view === 'item') {
      return keyword
        ? itemRows.filter((row) => row.name.toLowerCase().includes(keyword) || row.itemcode.includes(keyword))
        : itemRows;
    }
    if (view === 'plan') {
      return keyword
        ? planRows.filter((row) => `${row.planName} ${row.groupName} ${row.storeName}`.toLowerCase().includes(keyword))
        : planRows;
    }
    return keyword
      ? wordRows.filter((row) => (row.word || '无搜索词（自动广告）').toLowerCase().includes(keyword))
      : wordRows;
  }, [view, keyword, storeRows, itemRows, planRows, wordRows]);

  const sortedRows = useMemo(() => {
    if (view === 'word') {
      const list = baseRows as WordRow[];
      if (sortKey === 'lastDate') {
        return [...list].sort((a, b) => (sortDir === 'asc' ? a.lastDate.localeCompare(b.lastDate) : b.lastDate.localeCompare(a.lastDate)));
      }
      return sortByNumber(list, (row) => {
        const value = (row as unknown as Record<string, unknown>)[sortKey];
        return typeof value === 'number' && Number.isFinite(value) ? value : null;
      }, sortDir);
    }
    return sortByNumber(baseRows, (row) => {
      const value = (row as unknown as Record<string, unknown>)[sortKey];
      return typeof value === 'number' && Number.isFinite(value) ? value : null;
    }, sortDir);
  }, [view, baseRows, sortKey, sortDir]);

  const visibleRows = sortedRows.slice(0, visibleCount);

  const viewTotals = useMemo<Array<{ label: string; value: string }>>(() => {
    if (!sortedRows.length) return [];
    if (view === 'store') {
      const list = sortedRows as AdStoreRow[];
      const adCost = list.reduce((sum, row) => sum + row.adCost, 0);
      const adGmv = list.reduce((sum, row) => sum + row.adGmv, 0);
      const storeGmv = list.reduce((sum, row) => sum + row.storeGmv, 0);
      return [
        { label: '广告消耗', value: fmtMoney(adCost) },
        { label: '广告 GMV', value: fmtMoney(adGmv) },
        { label: '整店 GMV', value: fmtMoney(storeGmv) },
        { label: '广告 GMV 占比', value: fmtPct(storeGmv > 0 ? adGmv / storeGmv : null) },
        { label: '投产比', value: fmtRoas(adCost > 0 ? adGmv / adCost : null) },
      ];
    }
    if (view === 'item') {
      const list = sortedRows as ItemRow[];
      const cost = list.reduce((sum, row) => sum + row.cost, 0);
      const gmv = list.reduce((sum, row) => sum + row.gmv, 0);
      const productGmv = list.reduce((sum, row) => sum + row.productGmv, 0);
      return [
        { label: '广告消耗', value: fmtMoney(cost) },
        { label: '广告 GMV', value: fmtMoney(gmv) },
        { label: '商品 GMV', value: fmtMoney(productGmv) },
        { label: '广告 GMV 占比', value: fmtPct(productGmv > 0 ? gmv / productGmv : null) },
        { label: '投产比', value: fmtRoas(cost > 0 ? gmv / cost : null) },
      ];
    }
    if (view === 'plan') {
      const list = sortedRows as PlanRow[];
      const cost = list.reduce((sum, row) => sum + row.cost, 0);
      const gmv = list.reduce((sum, row) => sum + row.gmv, 0);
      const orders = list.reduce((sum, row) => sum + row.orders, 0);
      const click = list.reduce((sum, row) => sum + row.click, 0);
      return [
        { label: '广告消耗', value: fmtMoney(cost) },
        { label: '广告 GMV', value: fmtMoney(gmv) },
        { label: '广告订单数', value: fmtInt(orders) },
        { label: '点击量', value: fmtInt(click) },
        { label: '投产比', value: fmtRoas(cost > 0 ? gmv / cost : null) },
      ];
    }
    const list = sortedRows as WordRow[];
    const gmv = list.reduce((sum, row) => sum + row.gmv, 0);
    const orderCount = list.reduce((sum, row) => sum + row.orderCount, 0);
    const itemCount = list.reduce((sum, row) => sum + row.itemCount, 0);
    const lastDate = list.reduce((latest, row) => (row.lastDate > latest ? row.lastDate : latest), '');
    return [
      { label: '成单 GMV', value: fmtMoney(gmv) },
      { label: '订单数', value: fmtInt(orderCount) },
      { label: '涉及商品数', value: fmtInt(itemCount) },
      { label: '最近成单日', value: lastDate ? lastDate.slice(5).replace('-', '/') : '-' },
    ];
  }, [sortedRows, view]);

  const filterKey = `${view}|${viewFilter.adType}|${viewFilter.keyword}|${storeIds.join(',')}|${from}|${to}|${exclusionEnabled}`;
  useEffect(() => {
    setVisibleCount(10);
  }, [filterKey]);

  useEffect(() => {
    setCompareVisible(10);
  }, [boardTab, country, from, to, storeMetricKey, storeIds]);

  const rowKey = (targetView: AdViewKey, row: AdStoreRow | ItemRow | PlanRow | WordRow) =>
    targetView === 'store' ? String((row as AdStoreRow).storeId) : (row as ItemRow | PlanRow | WordRow).key;

  const rowTrends = useMemo(() => {
    const map = new Map<string, number[]>();
    const pickTrend = (point: AdTrendPoint) => {
      if (trendMetric === 'storeGmv' || trendMetric === 'share') return point.gmv;
      const value = point[trendMetric];
      return typeof value === 'number' ? value : NaN;
    };

    if (view === 'store') {
      (visibleRows as AdStoreRow[]).forEach((row) => {
        const rows = activeAdRows.filter((item) => item.storeId === row.storeId);
        const base = buildAdTrend(rows, from, to);
        if (trendMetric === 'storeGmv' || trendMetric === 'share') {
          const series = buildStoreSnapshot([row.storeId], 'TOTAL', from, to, exclusionEnabled, configs).series.confirmGmv;
          map.set(String(row.storeId), base.map((point, index) => {
            const dayStoreGmv = series[index] ?? 0;
            if (trendMetric === 'storeGmv') return dayStoreGmv;
            return dayStoreGmv > 0 ? point.gmv / dayStoreGmv : NaN;
          }));
        } else {
          map.set(String(row.storeId), base.map(pickTrend));
        }
      });
      return map;
    }

    if (view === 'item') {
      const byItem = new Map<string, typeof activeAdRows>();
      activeAdRows.forEach((row) => {
        const key = `${row.storeId}__${row.itemcode}`;
        const list = byItem.get(key);
        if (list) list.push(row);
        else byItem.set(key, [row]);
      });
      (visibleRows as ItemRow[]).forEach((row) => {
        map.set(row.key, buildAdTrend(byItem.get(row.key) ?? [], from, to).map(pickTrend));
      });
      return map;
    }

    if (view === 'plan') {
      const byPlan = new Map<string, typeof activeAdRows>();
      activeAdRows.forEach((row) => {
        const key = `${row.storeId}__${row.adType}__${row.planName}__${row.groupName}`;
        const list = byPlan.get(key);
        if (list) list.push(row);
        else byPlan.set(key, [row]);
      });
      (visibleRows as PlanRow[]).forEach((row) => {
        map.set(row.key, buildAdTrend(byPlan.get(row.key) ?? [], from, to).map(pickTrend));
      });
      return map;
    }

    const dates = eachDay(from, to);
    (visibleRows as WordRow[]).forEach((row) => {
      const byDate = new Map<string, number>();
      row.orders.forEach((order) => byDate.set(order.date, (byDate.get(order.date) ?? 0) + order.amount));
      map.set(row.key, dates.map((date) => byDate.get(date) ?? 0));
    });
    return map;
  }, [view, visibleRows, activeAdRows, from, to, trendMetric, exclusionEnabled, configs]);

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
  };

  const applyCustom = (nextFrom: string, nextTo: string) => {
    setCustomFrom(nextFrom);
    setCustomTo(nextTo);
    const error = validateRange(nextFrom, nextTo);
    if (error) {
      setRangeError(error);
      return;
    }
    setRangeError('');
    setPreset('custom');
    setFrom(nextFrom);
    setTo(nextTo);
  };

  const switchView = (next: AdViewKey) => {
    setView(next);
    setSortKey(DEFAULT_SORT[next]);
    setSortDir('desc');
    setVisibleCount(10);
  };

  const updateViewFilter = (patch: Partial<ViewFilter>) => {
    setViewFilters((prev) => ({ ...prev, [view]: { ...prev[view], ...patch } }));
    setVisibleCount(10);
  };

  const resetFilters = () => {
    setStoreIds([]);
    setCountry('TOTAL');
    applyPreset('30');
    setViewFilters({ store: { adType: '', keyword: '' }, item: { adType: '', keyword: '' }, plan: { adType: '', keyword: '' }, word: { adType: '', keyword: '' } });
  };

  const dateLabel = preset === 'custom'
    ? `${from.slice(5).replace('-', '/')} ~ ${to.slice(5).replace('-', '/')}`
    : (DATE_PRESETS.find((item) => item.key === preset)?.label ?? '近30天');

  const sortLabel = SORT_OPTIONS[view].find((item) => item.key === sortKey)?.label ?? '排序';

  const trendTabDef = STORE_TABS.find((item) => item.key === storeTrendTab) ?? STORE_TABS[0];
  const trendTabMetrics = useMemo(() => {
    const order = cardConfigs[trendTabDef.key] ?? trendTabDef.metrics.map((item) => item.key);
    const map = new Map(trendTabDef.metrics.map((item) => [item.key, item]));
    return order
      .map((key) => map.get(key as MetricKey))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
  }, [trendTabDef, cardConfigs]);
  const trendMetricDef = STORE_METRIC_MAP[storeTrendMetric];
  const trendSnapshot = useMemo(
    () => (storeTrendTarget ? buildStoreSnapshot([storeTrendTarget.storeId], country, from, to, exclusionEnabled, configs) : null),
    [storeTrendTarget, country, from, to, exclusionEnabled, configs],
  );
  const trendValues = trendSnapshot?.series[storeTrendMetric] ?? [];
  const trendMetricCards = (
    <div className="cc-trend-kpi-grid">
      {trendTabMetrics.map((metric, index) => (
        <div
          key={metric.key}
          role="button"
          tabIndex={0}
          className={`cc-trend-kpi${storeTrendMetric === metric.key ? ' is-active' : ''}`}
          onClick={() => setStoreTrendMetric(metric.key)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') setStoreTrendMetric(metric.key);
          }}
        >
          <span>{metric.label}<MetricHelp text={metric.tip} align={index % 3 === 2 ? 'right' : 'left'} /></span>
          <strong>{fmtMetric(metric.format, trendSnapshot?.summary[metric.key] ?? null)}</strong>
        </div>
      ))}
    </div>
  );
  const switchTrendTab = (next: string) => {
    setStoreTrendTab(next);
    const def = STORE_TABS.find((item) => item.key === next) ?? STORE_TABS[0];
    const order = cardConfigs[def.key] ?? def.metrics.map((item) => item.key);
    if (!order.includes(storeTrendMetric)) setStoreTrendMetric((order[0] ?? def.metrics[0].key) as MetricKey);
  };

  return (
    <div className="cc-page cc-ad-page">
      <header className="cc-page-head">
        <div>
          <h1 className="cc-page-title">店铺看板</h1>
        </div>
        <button type="button" className="cc-sync" disabled={syncing} onClick={onSync}>
          <RefreshCw size={12} className={syncing ? 'is-spinning' : ''} />
          <span>{syncing ? '同步中…' : lastSync === '刚刚' ? '刚刚同步' : `最近同步 ${lastSync}`}</span>
        </button>
      </header>

      <div className="cc-scroll" ref={scrollRef}>
        <div className="cc-ad-filter">
          <button type="button" className="cc-filter-chip" onClick={() => setStoreOpen(true)}>
            店铺 <strong>{storeIds.length ? storeIds.length : '全部'}</strong>
            <ChevronDown size={13} />
          </button>
          <button type="button" className="cc-filter-chip" onClick={() => setDateOpen(true)}>
            {dateLabel}
            <ChevronDown size={13} />
          </button>
          {isAdTab ? (
            <button
              type="button"
              className={`cc-filter-chip${exclusionEnabled ? ' is-active' : ''}`}
              onClick={() => setCaliberOpen(true)}
            >
              {exclusionEnabled ? '剔除数据' : '原始数据'}
              <ChevronDown size={13} />
            </button>
          ) : (
            <button
              type="button"
              className={`cc-filter-chip${country !== 'TOTAL' ? ' is-active' : ''}`}
              onClick={() => setCountryOpen(true)}
            >
              {COUNTRIES.find((item) => item.id === country)?.name ?? '全部国家'}
              <ChevronDown size={13} />
            </button>
          )}
        </div>

        <div className="cc-board-tabs-band">
          <div className="cc-card cc-board-tabs">
            <Segmented
              value={boardTab}
              options={BOARD_TABS}
              variant="tabs"
              onChange={(next) => {
                setBoardTab(next);
                setCompareVisible(10);
              }}
            />
          </div>
        </div>

        {isAdTab ? (
        <>
        <section className="cc-card cc-section">
          <div className="cc-section-head">
            <span className="cc-section-title">广告指标</span>
            <button type="button" className="cc-text-link" onClick={() => setMetricOpen(true)}>
              <Settings2 size={13} /> 自定义指标卡
            </button>
          </div>
          <div className="cc-kpi-grid">
            {kpis.map((kpi, index) => (
              <KpiCard
                key={kpi.key}
                label={kpi.label}
                value={adKpiText(kpi.format, kpi.value)}
                hint={kpi.hint}
                active={AD_KPI_TREND[kpi.key] === trendMetric}
                wide={kpis.length % 2 === 1 && index === kpis.length - 1}
                showGo={false}
                onClick={() => {
                  const next = AD_KPI_TREND[kpi.key];
                  if (next) setTrendMetric(next);
                }}
              />
            ))}
          </div>

          <div className="cc-trend-in-card">
            <div className="cc-section-head">
              <span className="cc-section-title">广告趋势</span>
              <button type="button" className="cc-landscape-btn" onClick={() => setLandscapeOpen(true)}>
                <Maximize2 size={12} /> 横屏
              </button>
            </div>
            <ChartBlock
              labels={trend.map((point) => point.date.slice(5).replace('-', '/'))}
              values={trend.map((point) => point[trendMetric] ?? null)}
              metric={trendMetric}
            />
          </div>
        </section>

        <section className="cc-card cc-section">
          <div className={`cc-ad-view-tabs${viewTabsPinned ? ' is-pinned' : ''}`} ref={viewTabsRef}>
            <Segmented
              value={view}
              options={VIEWS.map((item) => ({
                ...item,
                badge: view === item.key
                  ? (baseRows.length)
                  : item.key === 'store'
                    ? storeRows.length
                    : item.key === 'item'
                      ? itemRows.length
                      : item.key === 'plan'
                        ? planRows.length
                        : wordRows.length,
              }))}
              onChange={(next) => switchView(next as AdViewKey)}
              variant="tabs"
            />
          </div>

          <div className="cc-ad-tool-row">
            {view !== 'store' ? (
              <div className="cc-chip-row cc-ad-type-row">
                {AD_TYPE_OPTIONS.map((option) => (
                  <button
                    type="button"
                    key={option.value || 'all'}
                    className={`cc-chip${viewFilter.adType === option.value ? ' is-active' : ''}`}
                    onClick={() => updateViewFilter({ adType: option.value as ViewFilter['adType'] })}
                  >
                    {option.value ? AD_TYPE_LABEL[option.value as keyof typeof AD_TYPE_LABEL] : '全部'}
                  </button>
                ))}
              </div>
            ) : null}
            <button type="button" className="cc-sort-btn" onClick={() => setSortOpen(true)}>
              {sortLabel} {sortDir === 'desc' ? '↓' : '↑'}
            </button>
          </div>

          {view !== 'store' ? (
            <div className="cc-search">
              <Search size={15} />
              <input
                className="cc-input"
                value={viewFilter.keyword}
                placeholder={
                  view === 'item' ? '搜索商品名称 / itemcode'
                    : view === 'plan' ? '搜索计划 / 广告组'
                      : '搜索成单词'
                }
                onChange={(event) => updateViewFilter({ keyword: event.target.value })}
              />
            </div>
          ) : null}

          <div className="cc-ad-list">
            {visibleRows.map((row) => {
              const key = rowKey(view, row);
              return (
                <AdListCard
                  key={key}
                  view={view}
                  row={row}
                  trend={rowTrends.get(key) ?? []}
                  rangeLength={rangeLength}
                  onOpen={() => setDetailTarget({ view, row } as DetailTarget)}
                />
              );
            })}
          </div>

          {sortedRows.length === 0 ? (
            <EmptyState
              title="当前筛选没有广告数据"
              desc="试试放宽店铺或时间范围"
              action={{ label: '重置筛选', onClick: resetFilters }}
            />
          ) : null}

          {visibleCount < sortedRows.length ? (
            <button type="button" className="cc-load-more" onClick={() => setVisibleCount((value) => value + 10)}>
              加载更多（已显示 {Math.min(visibleCount, sortedRows.length)} / {sortedRows.length}）
            </button>
          ) : null}

          {viewTotals.length ? (
            <div className="cc-cmp-total">
              <div className="cc-cmp-head">
                <span className="cc-cmp-total-label">合计</span>
                <span className="cc-section-hint">共 {sortedRows.length} 条 · 按当前筛选</span>
              </div>
              <div className="cc-cmp-grid">
                {viewTotals.map((item) => (
                  <div className="cc-cmp-metric" key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {sortedRows.length > 0 ? <div className="cc-list-end">已经到底了</div> : null}
        </section>
        </>
        ) : storeTab ? (
        <>
          <section className="cc-card cc-section">
            <div className="cc-section-head">
              <span className="cc-section-title">{storeTab.label}指标</span>
              <button type="button" className="cc-text-link" onClick={() => setMetricOpen(true)}>
                <Settings2 size={13} /> 指标卡设置
              </button>
            </div>
            <div className="cc-kpi-grid">
              {storeVisibleMetrics.map((metric, index) => (
                <KpiCard
                  key={metric.key}
                  label={metric.label}
                  value={fmtMetric(metric.format, boardSnapshot.summary[metric.key])}
                  hint={metric.tip}
                  active={storeMetricKey === metric.key}
                  wide={storeVisibleMetrics.length % 2 === 1 && index === storeVisibleMetrics.length - 1}
                  showGo={false}
                  onClick={() => setStoreMetricKeys((prev) => ({ ...prev, [boardTab]: metric.key }))}
                />
              ))}
            </div>

            <div className="cc-trend-in-card">
              <div className="cc-section-head">
                <span className="cc-section-title">{storeTab.label}趋势</span>
                <button type="button" className="cc-landscape-btn" onClick={() => setLandscapeOpen(true)}>
                  <Maximize2 size={12} /> 横屏
                </button>
              </div>
              <Chart
                labels={boardSnapshot.dates.map((date) => date.slice(5).replace('-', '/'))}
                series={[{
                  key: storeMetricKey,
                  label: storeMetric?.label ?? '',
                  color: '#FF8A3D',
                  values: boardSnapshot.series[storeMetricKey].map((value) => (Number.isFinite(value) ? value : null)),
                  area: true,
                }]}
                height={190}
                formatValue={(value) => fmtMetric(storeMetric?.format ?? 'count', value)}
                axisFormat={storeMetric?.format === 'money'
                  ? fmtMoneyAxis
                  : storeMetric?.format === 'rate'
                    ? (value) => `${(value * 100).toFixed(0)}%`
                    : fmtAxis}
                tipRows={(index) => [{
                  label: storeMetric?.label ?? '',
                  value: fmtMetric(storeMetric?.format ?? 'count', boardSnapshot.series[storeMetricKey][index] ?? null),
                  color: '#FF8A3D',
                }]}
                ariaLabel={`${storeTab.label}趋势`}
              />
            </div>
          </section>

          <section className="cc-card cc-section">
            <div className="cc-section-head">
              <span className="cc-section-title">店铺对比</span>
              <div className="cc-cmp-head-actions">
                <span className="cc-section-hint">共 {storeCompareRows.length} 家 · 合计按已选范围</span>
                <button type="button" className="cc-sort-btn" onClick={() => setCompareSortOpen(true)}>
                  {compareSortLabel} {compareSortDir === 'desc' ? '↓' : '↑'}
                </button>
              </div>
            </div>
            <div className="cc-cmp-list">
              {storeCompareRows.slice(0, compareVisible).map((row) => (
                <article className="cc-cmp-row" key={row.storeId}>
                  <div className="cc-cmp-head">
                    <span className="cc-cmp-name">
                      <strong>{row.storeName}</strong>
                      {row.alias ? <small>{row.alias}</small> : null}
                    </span>
                    <button
                      type="button"
                      className="cc-cmp-spark"
                      aria-label={`查看${row.storeName}${storeMetric?.label ?? ''}趋势`}
                      onClick={() => {
                        setStoreTrendTab(boardTab);
                        setStoreTrendMetric(storeMetricKey);
                        setStoreTrendTarget({ storeId: row.storeId, storeName: row.storeName });
                      }}
                    >
                      <Sparkline values={compareTrends.get(row.storeId) ?? []} width={62} height={20} />
                    </button>
                    <span className="cc-cmp-tags">
                      {row.daysAvailable === 0 ? (
                        <span className="cc-cmp-tag is-muted">无数据</span>
                      ) : row.daysAvailable < rangeLength ? (
                        <span className="cc-cmp-tag is-warn">数据不足 {rangeLength - row.daysAvailable} 天</span>
                      ) : null}
                    </span>
                  </div>
                  <div className="cc-cmp-grid">
                    {storeTab.metrics.map((metric) => (
                      <div className={`cc-cmp-metric${storeMetricKey === metric.key ? ' is-key' : ''}`} key={metric.key}>
                        <span>{metric.label}</span>
                        <strong>{fmtMetric(metric.format, row.summary[metric.key])}</strong>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>

            {storeCompareRows.length === 0 ? (
              <EmptyState
                title="当前筛选没有店铺"
                desc="试试调整店铺或时间范围"
                action={{ label: '重置筛选', onClick: resetFilters }}
              />
            ) : null}

            {compareVisible < storeCompareRows.length ? (
              <button type="button" className="cc-load-more" onClick={() => setCompareVisible((value) => value + 10)}>
                加载更多（已显示 {Math.min(compareVisible, storeCompareRows.length)} / {storeCompareRows.length}）
              </button>
            ) : null}

            {storeCompareRows.length ? (
              <div className="cc-cmp-total">
                <div className="cc-cmp-head">
                  <span className="cc-cmp-total-label">合计</span>
                </div>
                <div className="cc-cmp-grid">
                  {storeTab.metrics.map((metric) => (
                    <div className={`cc-cmp-metric${storeMetricKey === metric.key ? ' is-key' : ''}`} key={metric.key}>
                      <span>{metric.label}</span>
                      <strong>{fmtMetric(metric.format, boardSnapshot.summary[metric.key])}</strong>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            {storeCompareRows.length > 0 && compareVisible >= storeCompareRows.length ? (
              <div className="cc-list-end">已经到底了</div>
            ) : null}
          </section>
        </>
        ) : null}
        <div className="cc-detail-bottom-space" />
      </div>

      <BackToTop scrollRef={scrollRef} />

      <Sheet
        open={storeTrendTarget !== null}
        title="店铺趋势"
        height={560}
        onClose={() => {
          setStoreTrendTarget(null);
          setStoreTrendLandscape(false);
        }}
      >
        {storeTrendTarget ? (
          <>
            <div className="cc-store-trend-head">
              <span className="cc-store-trend-name">{storeTrendTarget.storeName}</span>
              <button type="button" className="cc-landscape-btn" onClick={() => setStoreTrendLandscape(true)}>
                <Maximize2 size={12} /> 横屏
              </button>
            </div>
            <div className="cc-store-trend-sub">{dateLabel}</div>
            <Segmented
              value={storeTrendTab}
              options={STORE_TABS.map((item) => ({ key: item.key, label: item.label }))}
              onChange={switchTrendTab}
              variant="chips"
            />
            {trendMetricCards}
            <Chart
              labels={(trendSnapshot?.dates ?? boardSnapshot.dates).map((date) => date.slice(5).replace('-', '/'))}
              series={[{
                key: storeTrendMetric,
                label: trendMetricDef?.label ?? '',
                color: '#FF8A3D',
                values: trendValues.map((value) => (Number.isFinite(value) ? value : null)),
                area: true,
              }]}
              height={210}
              formatValue={(value) => fmtMetric(trendMetricDef?.format ?? 'count', value)}
              axisFormat={trendMetricDef?.format === 'money'
                ? fmtMoneyAxis
                : trendMetricDef?.format === 'rate'
                  ? (value) => `${(value * 100).toFixed(0)}%`
                  : fmtAxis}
              tipRows={(index) => [{
                label: trendMetricDef?.label ?? '',
                value: fmtMetric(trendMetricDef?.format ?? 'count', trendValues[index] ?? null),
                color: '#FF8A3D',
              }]}
              ariaLabel={`${storeTrendTarget.storeName}趋势`}
            />
          </>
        ) : null}
      </Sheet>

      {storeTrendTarget ? (
        <LandscapeChart
          open={storeTrendLandscape}
          title={`${storeTrendTarget.storeName} · ${trendMetricDef?.label ?? ''}`}
          subtitle={dateLabel}
          tabs={{
            options: STORE_TABS.map((item) => ({ key: item.key, label: item.label })),
            value: storeTrendTab,
            onChange: switchTrendTab,
            variant: 'chips',
          }}
          extra={trendMetricCards}
          labels={(trendSnapshot?.dates ?? boardSnapshot.dates).map((date) => date.slice(5).replace('-', '/'))}
          series={[{
            key: storeTrendMetric,
            label: trendMetricDef?.label ?? '',
            color: '#FF8A3D',
            values: trendValues.map((value) => (Number.isFinite(value) ? value : null)),
            area: true,
          }]}
          height={185}
          formatValue={(value) => fmtMetric(trendMetricDef?.format ?? 'count', value)}
          axisFormat={trendMetricDef?.format === 'money'
            ? fmtMoneyAxis
            : trendMetricDef?.format === 'rate'
              ? (value) => `${(value * 100).toFixed(0)}%`
              : fmtAxis}
          tipRows={(index) => [{
            label: trendMetricDef?.label ?? '',
            value: fmtMetric(trendMetricDef?.format ?? 'count', trendValues[index] ?? null),
            color: '#FF8A3D',
          }]}
          onClose={() => setStoreTrendLandscape(false)}
        />
      ) : null}

      <StoreFilterSheet
        open={storeOpen}
        selected={storeIds}
        onChange={(next) => { setStoreIds(next); setCompareVisible(10); }}
        onClose={() => setStoreOpen(false)}
      />

      <Sheet
        open={dateOpen}
        title="时间"
        height={620}
        onClose={() => setDateOpen(false)}
        footer={
          <div className="cc-sheet-actions">
            <button type="button" className="cc-btn cc-btn--ghost" onClick={() => applyPreset('30')}>重置</button>
            <button type="button" className="cc-btn cc-btn--primary" onClick={() => setDateOpen(false)}>完成</button>
          </div>
        }
      >
        <div className="cc-form-label">时间范围</div>
        <div className="cc-chip-row">
          {DATE_PRESETS.map((item) => (
            <button
              type="button"
              key={item.key}
              className={`cc-chip${preset === item.key ? ' is-active' : ''}`}
              onClick={() => applyPreset(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="cc-date-range">
          <button type="button" className="cc-date-field" onClick={() => setDatePicker('from')}>
            <span>{customFrom.replace(/-/g, '/')}</span>
            <Calendar size={15} />
          </button>
          <span>至</span>
          <button type="button" className="cc-date-field" onClick={() => setDatePicker('to')}>
            <span>{customTo.replace(/-/g, '/')}</span>
            <Calendar size={15} />
          </button>
        </div>
        {rangeError ? <div className="cc-field-error">{rangeError}</div> : null}
        <p className="cc-note">广告明细保留 {AD_DETAIL_FROM.replace(/-/g, '/')} 之后的数据，单次查询最长 90 天。</p>
      </Sheet>

      <DateWheelPicker
        open={datePicker !== null}
        title={datePicker === 'to' ? '结束日期' : '开始日期'}
        value={datePicker === 'to' ? customTo : customFrom}
        min={AD_DETAIL_FROM}
        max={REPORT_TO}
        onCancel={() => setDatePicker(null)}
        onConfirm={(next) => {
          if (datePicker === 'to') applyCustom(customFrom, next);
          else applyCustom(next, customTo);
          setDatePicker(null);
        }}
      />

      <MetricConfigSheet
        open={metricOpen}
        title={isAdTab ? '广告' : (storeTab?.label ?? '')}
        options={isAdTab
          ? AD_KPI_KEYS.map((key) => ({ key, label: AD_KPI_LABELS[key] }))
          : (storeTab?.metrics ?? []).map((metric) => ({ key: metric.key, label: metric.label }))}
        keys={cardConfigs[boardTab] ?? []}
        onChange={(next) => {
          setCardConfigs((prev) => ({ ...prev, [boardTab]: next }));
          if (isAdTab) {
            const activeKey = Object.keys(AD_KPI_TREND).find((key) => AD_KPI_TREND[key] === trendMetric);
            if (activeKey && !next.includes(activeKey)) setTrendMetric(AD_KPI_TREND[next[0]]);
          } else if (!next.includes(storeMetricKey)) {
            setStoreMetricKeys((prev) => ({ ...prev, [boardTab]: next[0] as MetricKey }));
          }
        }}
        onClose={() => setMetricOpen(false)}
      />

      <Sheet
        open={countryOpen}
        title="国家"
        height={520}
        onClose={() => setCountryOpen(false)}
      >
        <div className="cc-country-list">
          {COUNTRIES.map((item) => (
            <button
              type="button"
              key={item.id}
              className={`cc-country-row${country === item.id ? ' is-active' : ''}`}
              onClick={() => {
                setCountry(item.id);
                setCountryOpen(false);
                setCompareVisible(10);
              }}
            >
              <span>{item.name}</span>
              {country === item.id ? <Check size={15} /> : null}
            </button>
          ))}
        </div>
      </Sheet>

      <Sheet
        open={compareSortOpen}
        title="排序"
        height={520}
        onClose={() => setCompareSortOpen(false)}
        footer={<button type="button" className="cc-btn cc-btn--primary" onClick={() => setCompareSortOpen(false)}>完成</button>}
      >
        <div className="cc-form-label">排序方向</div>
        <Segmented
          value={compareSortDir}
          options={[{ key: 'desc', label: '从高到低' }, { key: 'asc', label: '从低到高' }]}
          onChange={(next) => setCompareSortDir(next as 'asc' | 'desc')}
        />
        <div className="cc-form-label">排序字段</div>
        <div className="cc-sort-list">
          {storeVisibleMetrics.map((metric) => (
            <button
              type="button"
              key={metric.key}
              className={`cc-sort-option${compareSortMetricKey === metric.key ? ' is-active' : ''}`}
              onClick={() => {
                setCompareSortKey(metric.key);
                setCompareSortOpen(false);
              }}
            >
              <span>{metric.label}</span>
              <span className="cc-sort-mark">{compareSortMetricKey === metric.key ? '✓' : ''}</span>
            </button>
          ))}
        </div>
      </Sheet>

      <Sheet
        open={sortOpen}
        title="排序"
        height={520}
        onClose={() => setSortOpen(false)}
        footer={<button type="button" className="cc-btn cc-btn--primary" onClick={() => setSortOpen(false)}>完成</button>}
      >
        <div className="cc-form-label">排序方向</div>
        <Segmented
          value={sortDir}
          options={[{ key: 'desc', label: '从高到低' }, { key: 'asc', label: '从低到高' }]}
          onChange={(next) => setSortDir(next as 'asc' | 'desc')}
        />
        <div className="cc-form-label">排序字段</div>
        <div className="cc-sort-list">
          {SORT_OPTIONS[view].map((option) => (
            <button
              type="button"
              key={option.key}
              className={`cc-sort-option${sortKey === option.key ? ' is-active' : ''}`}
              onClick={() => { setSortKey(option.key); setSortOpen(false); }}
            >
              <span>{option.label}</span>
              <span className="cc-sort-mark">{sortKey === option.key ? '✓' : ''}</span>
            </button>
          ))}
        </div>
      </Sheet>

      <Sheet
        open={caliberOpen}
        title="数据口径"
        height={420}
        onClose={() => setCaliberOpen(false)}
        footer={<button type="button" className="cc-btn cc-btn--primary" onClick={() => setCaliberOpen(false)}>完成</button>}
      >
        <div className="cc-form-label">GMV 口径</div>
        <Segmented
          value={exclusionEnabled ? 'exclude' : 'raw'}
          options={[{ key: 'exclude', label: '剔除数据' }, { key: 'raw', label: '原始数据' }]}
          onChange={(next) => {
            if ((next === 'exclude') !== exclusionEnabled) onToggleExclusion();
          }}
        />
        <p className="cc-note">剔除后只影响 GMV 金额类指标，广告消耗、广告 GMV、投产比不变。</p>
        <button
          type="button"
          className="cc-text-link cc-inline-link"
          onClick={() => {
            setCaliberOpen(false);
            setExclusionOpen(true);
          }}
        >
          剔除设置
        </button>
      </Sheet>

      <ExclusionSheet open={exclusionOpen} configs={configs} onSave={onSaveConfigs} onClose={() => setExclusionOpen(false)} />

      {storeTab ? (
        <LandscapeChart
          open={landscapeOpen}
          title={`${storeTab.label}趋势`}
          subtitle={`${dateLabel}${country !== 'TOTAL' ? ` · ${COUNTRIES.find((item) => item.id === country)?.name ?? ''}` : ''}`}
          labels={boardSnapshot.dates.map((date) => date.slice(5).replace('-', '/'))}
          series={[{
            key: storeMetricKey,
            label: storeMetric?.label ?? '',
            color: '#FF8A3D',
            values: boardSnapshot.series[storeMetricKey].map((value) => (Number.isFinite(value) ? value : null)),
            area: true,
          }]}
          tabs={{
            options: storeVisibleMetrics.map((metric) => ({ key: metric.key, label: metric.label })),
            value: storeMetricKey,
            onChange: (next) => setStoreMetricKeys((prev) => ({ ...prev, [boardTab]: next as MetricKey })),
            variant: 'chips',
          }}
          height={230}
          formatValue={(value) => fmtMetric(storeMetric?.format ?? 'count', value)}
          axisFormat={storeMetric?.format === 'money'
            ? fmtMoneyAxis
            : storeMetric?.format === 'rate'
              ? (value) => `${(value * 100).toFixed(0)}%`
              : fmtAxis}
          tipRows={(index) => [{
            label: storeMetric?.label ?? '',
            value: fmtMetric(storeMetric?.format ?? 'count', boardSnapshot.series[storeMetricKey][index] ?? null),
            color: '#FF8A3D',
          }]}
          onClose={() => setLandscapeOpen(false)}
        />
      ) : null}

      {isAdTab ? (
        <LandscapeChart
          open={landscapeOpen && isAdTab}
          title="广告趋势"
          labels={trend.map((point) => point.date.slice(5).replace('-', '/'))}
          series={[{
            key: trendMetric,
            label: AD_TREND_LABELS[trendMetric],
            color: '#FF8A3D',
            values: trend.map((point) => point[trendMetric] ?? null),
            area: true,
          }]}
          tabs={{
            options: (cardConfigs.ad.length ? cardConfigs.ad : AD_KPI_KEYS).map((key) => ({
              key: AD_KPI_TREND[key],
              label: AD_KPI_LABELS[key],
            })),
            value: trendMetric,
            onChange: (next) => setTrendMetric(next as AdTrendView),
            variant: 'chips',
          }}
          height={230}
          formatValue={(value) => adTrendFormat(trendMetric, value)}
          axisFormat={adTrendAxisFormat(trendMetric)}
          tipRows={(index) => [{
            label: AD_TREND_LABELS[trendMetric],
            value: adTrendFormat(trendMetric, trend[index]?.[trendMetric] ?? null),
            color: '#FF8A3D',
          }]}
          onClose={() => setLandscapeOpen(false)}
        />
      ) : null}

      <AdDetailSheet
        open={detailTarget !== null}
        target={detailTarget}
        prodRows={activeAdRows}
        orderRows={activeOrderRows}
        from={from}
        to={to}
        exclusionEnabled={exclusionEnabled}
        configs={configs}
        initialMetric={trendMetric}
        kpiKeys={cardConfigs.ad ?? []}
        onClose={() => setDetailTarget(null)}
      />
    </div>
  );
}

// ChartBlock keeps the mobile chart configuration in one place.
function ChartBlock({ labels, values, metric }: { labels: string[]; values: Array<number | null>; metric: AdTrendView }) {
  return (
    <Chart
      labels={labels}
      series={[{ key: metric, label: AD_TREND_LABELS[metric], color: '#FF8A3D', values, area: true }]}
      height={170}
      formatValue={(value) => adTrendFormat(metric, value)}
      axisFormat={adTrendAxisFormat(metric)}
      tipRows={(index) => [{ label: AD_TREND_LABELS[metric], value: adTrendFormat(metric, values[index] ?? null), color: '#FF8A3D' }]}
      ariaLabel="广告趋势"
    />
  );
}
