import React, { useEffect, useMemo, useState } from 'react';
import { Maximize2 } from 'lucide-react';
import {
  accOfProd,
  buildAdTrend,
  buildItemRows,
  buildPlanRows,
  buildStoreSnapshot,
  buildWordRows,
  finalize,
} from '../data/aggregate';
import { PRODUCT_MAP } from '../data/catalog';
import { eachDay, getDataset } from '../data/generate';
import { fmtAxis, fmtInt, fmtMoney, fmtMoneyAxis, fmtPct, fmtRoas } from '../data/format';
import { AD_TYPE_LABEL, type ExclusionConfig, type ItemRow, type OrderRow, type PlanRow, type ProdReportRow, type WordRow } from '../data/types';
import { AD_METRIC_TIPS } from '../data/adTips';
import { MetricHelp } from './MetricHelp';
import type { AdTrendView } from '../data/adTrend';
import { Chart } from './Chart';
import { LandscapeChart } from './LandscapeChart';
import { Segmented } from './Segmented';
import { Sheet } from './Sheet';
import type { AdStoreRow, DetailTarget } from './adViewTypes';

type DrawerMetric = 'cost' | 'gmv' | 'productGmv' | 'storeGmv' | 'share' | 'orders' | 'click' | 'roas';
type SplitSortKey = 'cost' | 'orders' | 'gmv' | 'roas';
type Scope = 'store' | 'item' | 'plan' | 'word';

const SPLIT_SORT_OPTIONS: Array<{ key: SplitSortKey; label: string }> = [
  { key: 'cost', label: '消耗' },
  { key: 'orders', label: '订单' },
  { key: 'gmv', label: 'GMV' },
  { key: 'roas', label: '投产比' },
];

function scopeAllKeys(scope: Scope): DrawerMetric[] {
  if (scope === 'plan') return ['cost', 'gmv', 'orders', 'click', 'roas'];
  if (scope === 'store') return ['cost', 'gmv', 'storeGmv', 'share', 'roas'];
  return ['cost', 'gmv', 'productGmv', 'share', 'roas'];
}

function fromKpiKey(key: string, scope: Scope): DrawerMetric | null {
  if (key === 'storeGmv') return scope === 'store' ? 'storeGmv' : 'productGmv';
  if (key === 'ratio') return 'share';
  if (key === 'cost' || key === 'gmv' || key === 'roas') return key;
  return null;
}

function resolveInitialMetric(initial: AdTrendView, scope: Scope): DrawerMetric {
  if (scope === 'plan') {
    if (initial === 'cost' || initial === 'gmv' || initial === 'roas') return initial;
    return 'gmv';
  }
  if (initial === 'storeGmv') return scope === 'store' ? 'storeGmv' : 'productGmv';
  if (initial === 'cost' || initial === 'gmv' || initial === 'share' || initial === 'roas') return initial;
  return 'cost';
}

export function AdDetailSheet({
  open,
  target,
  prodRows,
  orderRows,
  from,
  to,
  exclusionEnabled,
  configs,
  initialMetric,
  kpiKeys,
  onClose,
}: {
  open: boolean;
  target: DetailTarget | null;
  prodRows: ProdReportRow[];
  orderRows: OrderRow[];
  from: string;
  to: string;
  exclusionEnabled: boolean;
  configs: ExclusionConfig[];
  initialMetric: AdTrendView;
  kpiKeys: string[];
  onClose: () => void;
}) {
  const scope: Scope = target?.view ?? 'store';
  const [metric, setMetric] = useState<DrawerMetric>('cost');
  const [landscapeOpen, setLandscapeOpen] = useState(false);
  const [splitSort, setSplitSort] = useState<{ key: SplitSortKey; dir: 'asc' | 'desc' }>({ key: 'cost', dir: 'desc' });
  const [splitSortOpen, setSplitSortOpen] = useState(false);

  const visibleKeys = useMemo<DrawerMetric[]>(() => {
    const fallback = scopeAllKeys(scope);
    if (scope === 'plan' || scope === 'word' || !kpiKeys.length) return fallback;
    const mapped = kpiKeys.map((key) => fromKpiKey(key, scope)).filter((key): key is DrawerMetric => key !== null);
    return mapped.length ? mapped : fallback;
  }, [kpiKeys, scope]);

  useEffect(() => {
    if (!open) {
      setLandscapeOpen(false);
      return;
    }
    setLandscapeOpen(false);
    setSplitSortOpen(false);
    setSplitSort({ key: 'cost', dir: 'desc' });
    const initial = resolveInitialMetric(initialMetric, scope);
    setMetric(visibleKeys.includes(initial) ? initial : visibleKeys[0]);
  }, [open, target]);

  const subjectRows = useMemo(() => {
    if (!target) return [];
    if (target.view === 'store') {
      const row = target.row as AdStoreRow;
      return prodRows.filter((item) => item.storeId === row.storeId);
    }
    if (target.view === 'item') {
      const row = target.row as ItemRow;
      return prodRows.filter((item) => item.storeId === row.storeId && item.itemcode === row.itemcode);
    }
    if (target.view === 'plan') {
      const row = target.row as PlanRow;
      return prodRows.filter((item) => item.storeId === row.storeId && item.adType === row.adType && item.planName === row.planName && item.groupName === row.groupName);
    }
    return [];
  }, [target, prodRows]);

  const metrics = useMemo(() => finalize(accOfProd(subjectRows)), [subjectRows]);
  const trend = useMemo(() => buildAdTrend(subjectRows, from, to), [subjectRows, from, to]);

  const totalDaily = useMemo(() => {
    const map = new Map<string, number>();
    if (!target) return map;
    if (target.view === 'store') {
      const row = target.row as AdStoreRow;
      const snapshot = buildStoreSnapshot([row.storeId], 'TOTAL', from, to, exclusionEnabled, configs);
      snapshot.dates.forEach((date, index) => map.set(date, snapshot.series.confirmGmv[index] ?? 0));
    } else if (target.view === 'item') {
      const row = target.row as ItemRow;
      getDataset().itemDay.forEach((item) => {
        if (item.storeId !== row.storeId || item.itemcode !== row.itemcode) return;
        if (item.date < from || item.date > to) return;
        map.set(item.date, (map.get(item.date) ?? 0) + item.gmv);
      });
    }
    return map;
  }, [target, from, to, exclusionEnabled, configs]);

  const totalGmv = target?.view === 'item'
    ? (target.row as ItemRow).productGmv
    : Array.from(totalDaily.values()).reduce((sum, value) => sum + value, 0);
  const share = totalGmv > 0 ? metrics.gmv / totalGmv : null;

  const cards = scope === 'plan'
    ? [
        { key: 'cost' as DrawerMetric, label: '广告消耗', value: fmtMoney(metrics.cost), danger: false, tip: AD_METRIC_TIPS.cost },
        { key: 'gmv' as DrawerMetric, label: '广告 GMV', value: fmtMoney(metrics.gmv), danger: false, tip: AD_METRIC_TIPS.gmv },
        { key: 'orders' as DrawerMetric, label: '广告订单数', value: fmtInt(metrics.orders), danger: false, tip: AD_METRIC_TIPS.orders },
        { key: 'click' as DrawerMetric, label: '点击量', value: fmtInt(metrics.click), danger: false, tip: AD_METRIC_TIPS.click },
        { key: 'roas' as DrawerMetric, label: '投产比', value: fmtRoas(metrics.roas), danger: metrics.roas !== null && metrics.roas < 1, tip: AD_METRIC_TIPS.roas },
      ]
    : [
        { key: 'cost' as DrawerMetric, label: '广告消耗', value: fmtMoney(metrics.cost), danger: false, tip: AD_METRIC_TIPS.cost },
        { key: 'gmv' as DrawerMetric, label: '广告 GMV', value: fmtMoney(metrics.gmv), danger: false, tip: AD_METRIC_TIPS.gmv },
        { key: scope === 'store' ? 'storeGmv' as DrawerMetric : 'productGmv' as DrawerMetric, label: scope === 'store' ? '整店 GMV' : '商品 GMV', value: fmtMoney(totalGmv), danger: false, tip: scope === 'store' ? AD_METRIC_TIPS.storeGmv : AD_METRIC_TIPS.productGmv },
        { key: 'share' as DrawerMetric, label: '广告 GMV 占比', value: fmtPct(share), danger: false, tip: AD_METRIC_TIPS.ratio },
        { key: 'roas' as DrawerMetric, label: '投产比', value: fmtRoas(metrics.roas), danger: metrics.roas !== null && metrics.roas < 1, tip: AD_METRIC_TIPS.roas },
      ];
  const visibleCards = visibleKeys
    .map((key) => cards.find((card) => card.key === key))
    .filter((card): card is (typeof cards)[number] => Boolean(card));
  const metricLabel = cards.find((card) => card.key === metric)?.label ?? '广告消耗';

  const trendValues = trend.map((point) => {
    if (metric === 'productGmv' || metric === 'storeGmv') return totalDaily.get(point.date) ?? 0;
    if (metric === 'share') {
      const dayGmv = totalDaily.get(point.date) ?? 0;
      return dayGmv > 0 ? point.gmv / dayGmv : null;
    }
    if (metric === 'orders' || metric === 'click') return point[metric];
    if (metric === 'roas') return point.roas;
    return point[metric];
  });

  const formatTrend = (value: number | null) => {
    if (metric === 'share') return fmtPct(value);
    if (metric === 'roas') return fmtRoas(value);
    if (metric === 'orders' || metric === 'click') return fmtInt(value);
    return fmtMoney(value);
  };
  const axisTrend = metric === 'share'
    ? (value: number) => `${(value * 100).toFixed(0)}%`
    : metric === 'roas'
      ? (value: number) => `${value.toFixed(1)}x`
      : metric === 'orders' || metric === 'click'
        ? undefined
        : fmtMoneyAxis;

  const splitRows = useMemo(() => {
    if (!target || scope === 'word') return [] as Array<ItemRow | PlanRow>;
    const source: Array<ItemRow | PlanRow> = scope === 'plan' ? buildItemRows(subjectRows) : buildPlanRows(subjectRows);
    return [...source]
      .sort((left, right) => {
        const a = left[splitSort.key];
        const b = right[splitSort.key];
        const aOk = typeof a === 'number' && Number.isFinite(a);
        const bOk = typeof b === 'number' && Number.isFinite(b);
        if (!aOk && !bOk) return 0;
        if (!aOk) return 1;
        if (!bOk) return -1;
        return splitSort.dir === 'asc' ? a - b : b - a;
      });
  }, [target, scope, subjectRows, splitSort]);

  const topWords = useMemo(() => {
    if (!target || scope === 'word') return [] as WordRow[];
    const source = target.view === 'store'
      ? orderRows.filter((item) => item.storeId === (target.row as AdStoreRow).storeId)
      : target.view === 'item'
        ? orderRows.filter((item) => item.orderItemcode === (target.row as ItemRow).itemcode)
        : orderRows.filter((item) => item.storeId === (target.row as PlanRow).storeId && item.planName === (target.row as PlanRow).planName);
    return buildWordRows(source).sort((left, right) => right.gmv - left.gmv).slice(0, 6);
  }, [target, scope, orderRows]);

  const wordRow = target?.view === 'word' ? (target.row as WordRow) : null;
  const wordDates = useMemo(() => eachDay(from, to), [from, to]);
  const wordDaily = useMemo(() => {
    const map = new Map<string, number>();
    wordRow?.orders.forEach((order) => map.set(order.date, (map.get(order.date) ?? 0) + order.amount));
    return map;
  }, [wordRow]);
  const wordValues = wordDates.map((date) => wordDaily.get(date) ?? 0);
  const wordOrders = useMemo(
    () => (wordRow ? [...wordRow.orders].sort((a, b) => (a.date === b.date ? b.amount - a.amount : (a.date < b.date ? 1 : -1))) : []),
    [wordRow],
  );

  if (!target) return null;

  let title = '';
  let sub = '';
  if (target.view === 'store') {
    const row = target.row as AdStoreRow;
    title = row.storeName;
    sub = row.alias || '店铺广告明细';
  } else if (target.view === 'item') {
    const row = target.row as ItemRow;
    title = row.name;
    sub = `${row.itemcode} · ${row.storeName}`;
  } else if (target.view === 'plan') {
    const row = target.row as PlanRow;
    title = row.planName || '全店自动';
    sub = `${AD_TYPE_LABEL[row.adType]} · ${row.storeName}${row.groupName ? ` · ${row.groupName}` : ''}`;
  } else {
    const row = target.row as WordRow;
    title = row.word || '无搜索词（自动广告）';
    sub = `${row.storeName}${row.adTypes.length ? ` · ${row.adTypes.map((type) => AD_TYPE_LABEL[type]).join(' / ')}` : ''}`;
  }

  const sheetTitle = scope === 'store' ? '店铺广告明细'
    : scope === 'item' ? '商品广告明细'
      : scope === 'plan' ? '计划广告明细'
        : '成单词明细';

  const landscapeSeries = wordRow
    ? [{ key: 'wordGmv', label: '成单 GMV', color: '#FF8A3D', values: wordValues, area: true }]
    : [{ key: metric, label: metricLabel, color: '#FF8A3D', values: trendValues, area: true }];
  const landscapeLabels = (wordRow ? wordDates : trend.map((point) => point.date)).map((date) => date.slice(5).replace('-', '/'));
  const landscapeFormat = wordRow ? (value: number | null) => fmtMoney(value) : formatTrend;
  const landscapeAxis = wordRow ? fmtMoneyAxis : axisTrend;

  const landscapeExtra = wordRow ? (
    <div className="cc-trend-kpi-grid">
      {[
        { label: '成单 GMV', value: fmtMoney(wordRow.gmv) },
        { label: '订单数', value: fmtInt(wordRow.orderCount) },
        { label: '涉及商品数', value: fmtInt(wordRow.itemCount) },
        { label: '最近成单日', value: wordRow.lastDate ? wordRow.lastDate.slice(5).replace('-', '/') : '-' },
      ].map((card) => (
        <div className="cc-trend-kpi" key={card.label}>
          <span>{card.label}</span>
          <strong>{card.value}</strong>
        </div>
      ))}
    </div>
  ) : (
    <div className="cc-trend-kpi-grid">
      {visibleCards.map((card) => (
        <button
          type="button"
          key={card.key}
          className={`cc-trend-kpi${metric === card.key ? ' is-active' : ''}`}
          onClick={() => setMetric(card.key)}
        >
          <span>{card.label}</span>
          <strong className={card.danger ? 'is-danger' : ''}>{card.value}</strong>
        </button>
      ))}
    </div>
  );

  return (
    <>
      <Sheet open={open} title={sheetTitle} variant="full" onClose={onClose}>
        {target.view === 'item' ? (
          <div className="cc-detail-head">
            {(target.row as ItemRow).thumb
              ? <img className="cc-detail-thumb" src={(target.row as ItemRow).thumb} alt="" />
              : <span className="cc-detail-thumb cc-detail-thumb--empty" />}
            <div className="cc-detail-head-main">
              <div className="cc-detail-head-title">{title}</div>
              <div className="cc-detail-head-sub">{sub}</div>
            </div>
          </div>
        ) : (
          <>
            <div className="cc-detail-title">{title}</div>
            <div className="cc-detail-sub">{sub}</div>
          </>
        )}

        {wordRow ? (
          <>
            <div className="cc-detail-kpis cc-detail-kpis--four">
              {[
                { label: '成单 GMV', value: fmtMoney(wordRow.gmv), tip: AD_METRIC_TIPS.wordGmv },
                { label: '订单数', value: fmtInt(wordRow.orderCount), tip: AD_METRIC_TIPS.wordOrders },
                { label: '涉及商品数', value: fmtInt(wordRow.itemCount), tip: AD_METRIC_TIPS.wordItems },
                { label: '最近成单日', value: wordRow.lastDate ? wordRow.lastDate.slice(5).replace('-', '/') : '-', tip: AD_METRIC_TIPS.wordLastDate },
              ].map((card, index) => (
                <div className="cc-detail-kpi" key={card.label}>
                  <span>{card.label}<MetricHelp text={card.tip} align={index % 2 === 1 ? 'right' : 'left'} /></span>
                  <strong>{card.value}</strong>
                </div>
              ))}
            </div>

            <section className="cc-card cc-detail-section">
              <div className="cc-section-head">
                <span className="cc-section-title">成单 GMV 趋势</span>
                <button type="button" className="cc-landscape-btn" onClick={() => setLandscapeOpen(true)}>
                  <Maximize2 size={12} /> 横屏
                </button>
              </div>
              <Chart
                labels={wordDates.map((date) => date.slice(5).replace('-', '/'))}
                series={[{ key: 'wordGmv', label: '成单 GMV', color: '#FF8A3D', values: wordValues, area: true }]}
                height={170}
                formatValue={(value) => fmtMoney(value)}
                axisFormat={fmtMoneyAxis}
                tipRows={(index) => [{ label: '成单 GMV', value: fmtMoney(wordValues[index]), color: '#FF8A3D' }]}
                ariaLabel={`${title}成单 GMV趋势`}
              />
            </section>

            <section className="cc-card cc-detail-section">
              <div className="cc-section-head">
                <span className="cc-section-title">订单明细</span>
                <span className="cc-muted">共 {wordOrders.length} 笔 · 按日期倒序</span>
              </div>
              <div className="cc-order-list">
                {wordOrders.map((order) => (
                  <div className="cc-order-row" key={order.orderNo}>
                    <div className="cc-order-head">
                      <div className="cc-order-item">
                        {(() => {
                          const thumb = PRODUCT_MAP[order.items[0]?.code ?? '']?.thumb;
                          return thumb
                            ? <img className="cc-order-thumb" src={thumb} alt="" />
                            : <span className="cc-order-thumb cc-order-thumb--empty" />;
                        })()}
                        <div className="cc-order-main">
                          <span className="cc-order-no">{order.orderNo}</span>
                          <span className="cc-order-name">{order.items.map((item) => item.name).join('；')}</span>
                          <span className="cc-order-sub">
                            {order.items[0]?.code ?? '-'}{order.items.length > 1 ? ` 等 ${order.items.length} 个商品` : ''} · {(target.row as WordRow).storeName}
                          </span>
                        </div>
                      </div>
                      <div className="cc-order-side">
                        <strong>{fmtMoney(order.amount)}</strong>
                        <span>{order.date.slice(5).replace('-', '/')}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {wordOrders.length === 0 ? <div className="cc-empty-line">暂无订单明细</div> : null}
              </div>
            </section>
          </>
        ) : (
          <>
            <div className={`cc-detail-kpis cc-detail-kpis--pick cc-detail-kpis--${visibleCards.length >= 5 ? 'five' : 'four'}`}>
              {visibleCards.map((card, index) => (
                <button
                  type="button"
                  className={`cc-detail-kpi${metric === card.key ? ' is-active' : ''}`}
                  key={card.key}
                  onClick={() => setMetric(card.key)}
                >
                  <span>{card.label}<MetricHelp text={card.tip} align={index % 2 === 1 ? 'right' : 'left'} /></span>
                  <strong className={card.danger ? 'is-danger' : ''}>{card.value}</strong>
                </button>
              ))}
            </div>

            <section className="cc-card cc-detail-section">
              <div className="cc-section-head">
                <span className="cc-section-title">{metricLabel}趋势</span>
                <button type="button" className="cc-landscape-btn" onClick={() => setLandscapeOpen(true)}>
                  <Maximize2 size={12} /> 横屏
                </button>
              </div>
              <Chart
                labels={trend.map((point) => point.date.slice(5).replace('-', '/'))}
                series={[{ key: metric, label: metricLabel, color: '#FF8A3D', values: trendValues, area: true }]}
                height={170}
                formatValue={formatTrend}
                axisFormat={axisTrend}
                tipRows={(index) => [{ label: metricLabel, value: formatTrend(trendValues[index] ?? null), color: '#FF8A3D' }]}
                ariaLabel={`${title} ${metricLabel}趋势`}
              />
            </section>

            <section className="cc-card cc-detail-section">
              <div className="cc-section-head">
                <span className="cc-section-title">流量</span>
              </div>
              <div className="cc-detail-metrics">
                {[
                  { label: '曝光量', value: fmtInt(metrics.imp), tip: AD_METRIC_TIPS.imp },
                  { label: '点击量', value: fmtInt(metrics.click), tip: AD_METRIC_TIPS.click },
                  { label: '点击率', value: fmtPct(metrics.ctr), tip: AD_METRIC_TIPS.ctr },
                  { label: '点击单价', value: fmtMoney(metrics.cpc), tip: AD_METRIC_TIPS.cpc },
                ].map((item, index) => (
                  <div className="cc-detail-metric" key={item.label}>
                    <span>{item.label}<MetricHelp text={item.tip} align={index % 2 === 1 ? 'right' : 'left'} /></span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
              <div className="cc-section-head cc-detail-subhead">
                <span className="cc-section-title">转化</span>
              </div>
              <div className="cc-detail-metrics">
                {[
                  { label: '订单数', value: fmtInt(metrics.orders), tip: AD_METRIC_TIPS.orders },
                  { label: '转化率', value: fmtPct(metrics.cvr), tip: AD_METRIC_TIPS.cvr },
                  { label: '单均花费', value: fmtMoney(metrics.cpa), tip: AD_METRIC_TIPS.cpa },
                ].map((item, index) => (
                  <div className="cc-detail-metric" key={item.label}>
                    <span>{item.label}<MetricHelp text={item.tip} align={index % 2 === 1 ? 'right' : 'left'} /></span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </section>

            <section className="cc-card cc-detail-section">
              <div className="cc-section-head">
                <span className="cc-section-title">
                  {scope === 'plan' ? '按商品拆分' : '按计划拆分'}
                  <MetricHelp text="消耗为广告花费；订单为广告订单数；GMV 为广告 GMV；投产比 = 广告 GMV / 广告消耗" />
                </span>
                <button type="button" className="cc-sort-btn" onClick={() => setSplitSortOpen(true)}>
                  {SPLIT_SORT_OPTIONS.find((option) => option.key === splitSort.key)?.label ?? '排序'}{' '}
                  {splitSort.dir === 'asc' ? '↑' : '↓'}
                </button>
              </div>
              <div className="cc-split-list">
                {splitRows.map((row) => (
                  <div className="cc-split-row" key={row.key}>
                    <div className="cc-split-head">
                      <div className="cc-split-item">
                        {scope === 'plan'
                          ? ((row as ItemRow).thumb
                            ? <img className="cc-split-thumb" src={(row as ItemRow).thumb} alt="" />
                            : <span className="cc-split-thumb cc-split-thumb--empty" />)
                          : null}
                        <div className="cc-split-item-main">
                          <span className="cc-split-title">
                            {scope === 'plan' ? (row as ItemRow).name : ((row as PlanRow).planName || '全店自动')}
                          </span>
                          <span className="cc-split-sub">
                            {scope === 'plan'
                              ? `${(row as ItemRow).itemcode} · ${(row as ItemRow).storeName}`
                              : `${AD_TYPE_LABEL[(row as PlanRow).adType]}${(row as PlanRow).groupName ? ` · ${(row as PlanRow).groupName}` : ''}`}
                          </span>
                        </div>
                      </div>
                      <strong>{fmtMoney(row.cost)}</strong>
                    </div>
                    <div className="cc-split-grid">
                      <div className="cc-split-metric">
                        <span>订单</span>
                        <strong>{fmtInt(row.orders)}</strong>
                      </div>
                      <div className="cc-split-metric">
                        <span>GMV</span>
                        <strong>{fmtMoney(row.gmv)}</strong>
                      </div>
                      <div className="cc-split-metric">
                        <span>投产比</span>
                        <strong className={row.roas !== null && row.roas < 1 ? 'is-danger' : undefined}>{fmtRoas(row.roas)}</strong>
                      </div>
                    </div>
                  </div>
                ))}
                {splitRows.length === 0 ? <div className="cc-empty-line">暂无拆分数据</div> : null}
              </div>
            </section>

            <section className="cc-card cc-detail-section">
              <div className="cc-section-head">
                <span className="cc-section-title">带单成单词</span>
                <span className="cc-muted">按 GMV 降序 Top 6</span>
              </div>
              <div className="cc-word-list">
                {topWords.map((word) => (
                  <div className="cc-word-row" key={word.key}>
                    <span className="cc-word-name">{word.word || '无搜索词（自动广告）'}</span>
                    <span className="cc-word-meta">{word.orderCount} 单 · {fmtMoney(word.gmv)}</span>
                  </div>
                ))}
                {topWords.length === 0 ? <div className="cc-empty-line">暂无成单词数据</div> : null}
              </div>
            </section>
          </>
        )}

        <div className="cc-detail-bottom-space" />
      </Sheet>

      <Sheet
        open={splitSortOpen}
        title="排序"
        height={420}
        onClose={() => setSplitSortOpen(false)}
        footer={<button type="button" className="cc-btn cc-btn--primary" onClick={() => setSplitSortOpen(false)}>完成</button>}
      >
        <div className="cc-form-label">排序方向</div>
        <Segmented
          value={splitSort.dir}
          options={[{ key: 'desc', label: '从高到低' }, { key: 'asc', label: '从低到高' }]}
          onChange={(next) => setSplitSort((prev) => ({ ...prev, dir: next as 'asc' | 'desc' }))}
        />
        <div className="cc-form-label">排序字段</div>
        <div className="cc-sort-list">
          {SPLIT_SORT_OPTIONS.map((option) => (
            <button
              type="button"
              key={option.key}
              className={`cc-sort-option${splitSort.key === option.key ? ' is-active' : ''}`}
              onClick={() => {
                setSplitSort((prev) => ({ key: option.key, dir: prev.dir }));
                setSplitSortOpen(false);
              }}
            >
              <span>{option.label}</span>
              <span className="cc-sort-mark">{splitSort.key === option.key ? '✓' : ''}</span>
            </button>
          ))}
        </div>
      </Sheet>

      <LandscapeChart
        open={landscapeOpen}
        title={wordRow ? `成单 GMV趋势` : `${metricLabel}趋势`}
        subtitle={title}
        labels={landscapeLabels}
        series={landscapeSeries}
        extra={landscapeExtra}
        height={185}
        formatValue={landscapeFormat}
        axisFormat={landscapeAxis}
        tipRows={(index) => [{
          label: wordRow ? '成单 GMV' : metricLabel,
          value: landscapeFormat((wordRow ? wordValues : trendValues)[index] ?? null),
          color: '#FF8A3D',
        }]}
        onClose={() => setLandscapeOpen(false)}
      />
    </>
  );
}
