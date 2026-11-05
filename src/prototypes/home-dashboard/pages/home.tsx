import React, { useEffect, useMemo, useState } from 'react';
import { Check, X } from 'lucide-react';
import {
  buildHomeKpis,
  buildHomeTrend,
  levelRank,
  productRank,
  resolveExclusions,
  storeSalesRank,
  storeTrafficRank,
  type HomeKpi,
  type HomeTrendPeriod,
  type ProductRankMetric,
  type RankRow,
} from '../data/aggregate';
import { LEVEL_COLORS, LEVEL_LIGHT_COLORS, STORES } from '../data/catalog';
import { fmtAxis, fmtInt, fmtMoney, fmtMoneyAxis, fmtRoas } from '../data/format';
import { REPORT_TO, addDays } from '../data/generate';
import type { ExclusionConfig, StorePeriodKey } from '../data/types';
import homeJson from '../data/home.json';
import bgDeco from '../assets/bg-deco.png';
import metricIcon from '../assets/metric-icon.png';
import alertIcon1 from '../assets/alert-1.png';
import alertIcon2 from '../assets/alert-2.png';
import alertIcon3 from '../assets/alert-3.png';
import alertIcon4 from '../assets/alert-4.png';
import rank1 from '../assets/rank-1.png';
import rank2 from '../assets/rank-2.png';
import rank3 from '../assets/rank-3.png';
import promo1 from '../assets/promo-1.png';
import promo2 from '../assets/promo-2.png';
import promo3 from '../assets/promo-3.png';
import { Chart, type ChartSeries } from '../components/Chart';
import { ExclusionDialog } from '../components/ExclusionDialog';
import { RankingDialog } from '../components/RankingDialog';
import { Segmented } from '../components/Segmented';

type Announcement = { id: number; title: string; categoryName: string; date: string };

const DATA = homeJson as unknown as {
  abnormal: {
    abnormalOrderCount: number;
    abnormalDeliveryCount: number;
    abnormalOnNetCount: number;
    abnormalLogisticsCount: number;
  };
  announcements: Announcement[];
};

const PROMOS = [
  { src: promo1, alt: '帮助中心' },
  { src: promo2, alt: '跨境AI智能体' },
  { src: promo3, alt: '直播预告' },
];

const ALERT_STATUSES = [
  '订单取消', '等待买家付款', '买家已付款，等待平台确认', '等待发货', '买家申请退款，等待协商结果',
  '退款协议已达成', '部分退款后，等待发货', '买家取消退款申请', '已部分发货', '等待买家确认收货',
  '退款/退货协商中，等待协议达成', '买家投诉到平台', '协议已达成，执行中', '人工确认收货',
  '超过预定期限，自动确认收货', '交易成功', '交易关闭',
];

const DEFAULT_CHECKED = ['订单取消', '买家申请退款，等待协商结果', '退款/退货协商中，等待协议达成', '买家投诉到平台'];

const MEDALS = [rank1, rank2, rank3];

const TREND_VIEWS: Array<{ key: 'store' | 'ad'; label: string }> = [
  { key: 'store', label: '店铺销售' },
  { key: 'ad', label: '广告投放' },
];

const TREND_PERIODS: Array<{ key: HomeTrendPeriod; label: string }> = [
  { key: 'm1', label: '近1月' },
  { key: 'm2', label: '近2月' },
  { key: 'm3', label: '近3月' },
  { key: 'm6', label: '近6月' },
];

const PERIOD_DAYS: Record<HomeTrendPeriod, number> = { m1: 30, m2: 60, m3: 90, m6: 180 };

const STORE_RANK_TABS: Array<{ key: 'sales' | 'traffic' | 'level'; label: string }> = [
  { key: 'sales', label: '销量' },
  { key: 'traffic', label: '流量' },
  { key: 'level', label: '等级' },
];

const PRODUCT_METRICS: Array<{ key: ProductRankMetric; label: string }> = [
  { key: 'qty', label: '销量' },
  { key: 'gmv', label: '销售额' },
  { key: 'orders', label: '订单数' },
];

const RANK_PERIODS = {
  sales: [
    { key: 'week' as StorePeriodKey, label: '近1周' },
    { key: 'month' as StorePeriodKey, label: '近1月' },
    { key: 'months3' as StorePeriodKey, label: '近3月' },
  ],
  traffic: [
    { key: 'day' as StorePeriodKey, label: '近1天' },
    { key: 'week' as StorePeriodKey, label: '近7天' },
    { key: 'month' as StorePeriodKey, label: '近30天' },
  ],
  product: [
    { key: 'week' as StorePeriodKey, label: '近1周' },
    { key: 'month' as StorePeriodKey, label: '近1月' },
    { key: 'months3' as StorePeriodKey, label: '近3月' },
  ],
};

function AnnouncementDialog({ announcements, onClose }: { announcements: Announcement[]; onClose: () => void }) {
  const [tab, setTab] = useState<'notice' | 'history'>('history');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const baseList = tab === 'notice' ? announcements.slice(0, 5) : announcements;
  const total = tab === 'notice' ? baseList.length : 37;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const list = tab === 'notice' ? baseList : baseList.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [tab]);

  return (
    <div className="hd-modal-mask" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="hd-modal hd-ann-dialog" role="dialog" aria-modal="true" aria-label="公告">
        <div className="hd-ann-dialog-header">
          <div className="hd-ann-tabs">
            <span className={`hd-ann-tab${tab === 'notice' ? ' is-active' : ''}`} onClick={() => setTab('notice')}>公告</span>
            <span className={`hd-ann-tab${tab === 'history' ? ' is-active' : ''}`} onClick={() => setTab('history')}>历史公告</span>
          </div>
          <button type="button" className="hd-ann-close" aria-label="关闭" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="hd-ann-body">
          <ul className="hd-ann-list">
            {list.map((item) => (
              <li className="hd-ann-list-item" key={item.id}>
                <span className={`hd-announcement-tag${item.categoryName === '弹窗公告' ? ' is-popup' : ''}`}>{item.categoryName}</span>
                <span className="hd-ann-list-title" title={item.title}>{item.title}</span>
                <span className="hd-ann-list-date">{item.date}</span>
              </li>
            ))}
          </ul>
          <div className="hd-ann-pagination">
            <span>共 {total} 条</span>
            <button type="button" className="hd-ann-page-btn" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} aria-label="上一页">‹</button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((item) => (
              <button type="button" key={item} className={`hd-ann-page-btn${page === item ? ' is-active' : ''}`} onClick={() => setPage(item)}>{item}</button>
            ))}
            <button type="button" className="hd-ann-page-btn" disabled={page >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))} aria-label="下一页">›</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AlertSettingsDialog({ onClose }: { onClose: () => void }) {
  const [checked, setChecked] = useState<string[]>(DEFAULT_CHECKED);
  const [selectAll, setSelectAll] = useState(true);

  const toggle = (status: string) => {
    setChecked((current) => (current.includes(status) ? current.filter((item) => item !== status) : [...current, status]));
    setSelectAll(false);
  };

  const toggleAll = () => {
    if (selectAll) {
      setSelectAll(false);
      setChecked([]);
    } else {
      setSelectAll(true);
      setChecked([...ALERT_STATUSES]);
    }
  };

  return (
    <div className="hd-modal-mask" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="hd-modal hd-alert-dialog" role="dialog" aria-modal="true" aria-label="筛选状态设置">
        <div className="hd-alert-dialog-header">
          <span className="hd-alert-dialog-title">筛选状态设置</span>
          <button type="button" className="hd-alert-dialog-close" aria-label="关闭" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="hd-alert-dialog-body">
          <div className="hd-alert-section-head">
            <span className="hd-alert-section-title">平台订单状态</span>
            <span className={`hd-checkbox${selectAll || checked.length > 0 ? ' is-checked' : ''}`} onClick={toggleAll} role="checkbox" aria-checked={selectAll}>
              <span className="hd-checkbox-box">{selectAll || checked.length > 0 ? <Check size={10} strokeWidth={3} /> : null}</span>
              全选
            </span>
          </div>
          <div className="hd-alert-grid">
            {ALERT_STATUSES.map((status) => {
              const isChecked = checked.includes(status);
              return (
                <span className={`hd-checkbox${isChecked ? ' is-checked' : ''}`} key={status} onClick={() => toggle(status)}>
                  <span className="hd-checkbox-box">{isChecked ? <Check size={10} strokeWidth={3} /> : null}</span>
                  <span className="hd-checkbox-text">{status}</span>
                </span>
              );
            })}
          </div>
        </div>
        <div className="hd-alert-dialog-footer">
          <button type="button" className="hd-btn is-default" onClick={onClose}>取消</button>
          <button type="button" className="hd-btn is-primary" onClick={onClose}>保存</button>
        </div>
      </div>
    </div>
  );
}

function StoreRankList({ rows, kind }: { rows: RankRow[]; kind: 'sales' | 'traffic' }) {
  if (!rows.length) return <div className="hd-empty">暂无数据</div>;
  return (
    <ul className="hd-ranking-list">
      {rows.map((row) => (
        <li className="hd-ranking-item" key={row.key}>
          {row.rank <= 3 ? <img className="hd-rank-medal" src={MEDALS[row.rank - 1]} alt="" /> : <div className="hd-rank-badge">{row.rank}</div>}
          <span className="hd-store-name" title={row.storeName}>{row.storeName}</span>
          <span className={`hd-store-amount ${row.rank <= 3 ? 'is-top' : 'is-normal'}`}>
            {kind === 'sales' ? fmtMoney(row.value) : fmtInt(row.value)}
          </span>
        </li>
      ))}
    </ul>
  );
}

function ProductRankList({ rows, metric }: { rows: RankRow[]; metric: ProductRankMetric }) {
  if (!rows.length) return <div className="hd-empty">暂无数据</div>;
  return (
    <ul className="hd-ranking-list">
      {rows.map((row) => (
        <li className="hd-ranking-item is-product" key={row.key}>
          <div className="hd-ranking-main">
            {row.rank <= 3 ? <img className="hd-rank-medal" src={MEDALS[row.rank - 1]} alt="" /> : <div className="hd-rank-badge">{row.rank}</div>}
            {row.thumb ? <img className="hd-product-thumb" src={row.thumb} alt="" /> : <span className="hd-product-thumb" />}
            <span className="hd-rank-product-mini">
              <span className="hd-store-name" title={row.name}>{row.name}</span>
              <em>{row.itemcode}</em>
            </span>
            <span className={`hd-store-amount ${row.rank <= 3 ? 'is-top' : 'is-normal'}`}>
              {metric === 'gmv' ? fmtMoney(row.value) : fmtInt(row.value)}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}

function LevelRankList({ rows }: { rows: RankRow[] }) {
  if (!rows.length) return <div className="hd-empty">暂无数据</div>;
  return (
    <ul className="hd-ranking-list">
      {rows.map((row) => {
        const level = row.level ?? 0;
        return (
          <li className="hd-ranking-item is-level" key={row.key}>
            {row.rank <= 3 ? <img className="hd-rank-medal" src={MEDALS[row.rank - 1]} alt="" /> : <div className="hd-rank-badge">{row.rank}</div>}
            <span className="hd-store-name" title={row.storeName}>{row.storeName}</span>
            <span
              className="hd-level-chip"
              style={{ color: LEVEL_COLORS[level] || LEVEL_COLORS[0], background: LEVEL_LIGHT_COLORS[level] || LEVEL_LIGHT_COLORS[0] }}
            >
              LV.{level}
            </span>
            <span className="hd-level-score">{(row.score ?? 0).toFixed(2)} 分</span>
          </li>
        );
      })}
    </ul>
  );
}

function kpiText(kpi: HomeKpi): string {
  if (kpi.value === null) return '-';
  if (kpi.format === 'money') return fmtMoney(kpi.value);
  if (kpi.format === 'roas') return fmtRoas(kpi.value);
  return fmtInt(kpi.value);
}

export function HomePage({
  exclusionEnabled,
  onToggleExclusion,
  configs,
  onSaveConfigs,
  onNavigate,
}: {
  exclusionEnabled: boolean;
  onToggleExclusion: () => void;
  configs: ExclusionConfig[];
  onSaveConfigs: (next: ExclusionConfig[]) => void;
  onNavigate: (page: 'ad-detail' | 'store-detail', options?: { tab?: 'ad' }) => void;
}) {
  const [trendView, setTrendView] = useState<'store' | 'ad'>('store');
  const [trendPeriod, setTrendPeriod] = useState<HomeTrendPeriod>('m1');
  const [hiddenSeries, setHiddenSeries] = useState<string[]>([]);
  const [salesPeriod, setSalesPeriod] = useState<StorePeriodKey>('week');
  const [trafficPeriod, setTrafficPeriod] = useState<StorePeriodKey>('day');
  const [productPeriod, setProductPeriod] = useState<StorePeriodKey>('week');
  const [rankDialog, setRankDialog] = useState<'sales' | 'traffic' | 'product' | 'level' | null>(null);
  const [storeRankTab, setStoreRankTab] = useState<'sales' | 'traffic' | 'level'>('sales');
  const [productMetric, setProductMetric] = useState<ProductRankMetric>('qty');
  const [announcementOpen, setAnnouncementOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [exclusionOpen, setExclusionOpen] = useState(false);
  const [promoIndex, setPromoIndex] = useState(1);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPromoIndex((value) => (value + 1) % PROMOS.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    setHiddenSeries([]);
  }, [trendView]);

  const kpis = useMemo(() => buildHomeKpis(exclusionEnabled, configs), [exclusionEnabled, configs]);
  const points = useMemo(() => buildHomeTrend(trendPeriod, exclusionEnabled, configs), [trendPeriod, exclusionEnabled, configs]);
  const salesRows = useMemo(() => storeSalesRank(salesPeriod, exclusionEnabled, configs), [salesPeriod, exclusionEnabled, configs]);
  const trafficRows = useMemo(() => storeTrafficRank(trafficPeriod), [trafficPeriod]);
  const productRows = useMemo(() => productRank(productPeriod, productMetric), [productPeriod, productMetric]);
  const levelRows = useMemo(() => levelRank(), []);
  const announcements = useMemo(() => DATA.announcements.slice(0, 10), []);
  const trendFrom = addDays(REPORT_TO, -(PERIOD_DAYS[trendPeriod] - 1));
  const exclusionInfo = useMemo(
    () => resolveExclusions(configs, exclusionEnabled, trendFrom, REPORT_TO, STORES.map((store) => store.id)),
    [configs, exclusionEnabled, trendFrom],
  );

  const abnormal = DATA.abnormal;
  const alerts = [
    { title: '异常订单', count: abnormal.abnormalOrderCount, desc: '平台异常未处理的订单', tone: 'danger', icon: alertIcon1 },
    { title: '异常发货', count: abnormal.abnormalDeliveryCount, desc: '承诺发货截止时间的订单', tone: 'purple', icon: alertIcon2 },
    { title: '异常上网', count: abnormal.abnormalOnNetCount, desc: '有发货但无上网记录的订单', tone: 'green', icon: alertIcon3 },
    { title: '异常物流', count: abnormal.abnormalLogisticsCount, desc: '物流还未显示录入的订单', tone: 'orange', icon: alertIcon4 },
  ];

  const rankDialogPeriod = rankDialog === 'traffic' ? trafficPeriod : rankDialog === 'product' ? productPeriod : rankDialog === 'level' ? 'month' : salesPeriod;
  const setRankDialogPeriod = (next: StorePeriodKey) => {
    if (rankDialog === 'level') return;
    if (rankDialog === 'traffic') setTrafficPeriod(next);
    else if (rankDialog === 'product') setProductPeriod(next);
    else setSalesPeriod(next);
  };

  const rankTabPeriod = storeRankTab === 'traffic' ? trafficPeriod : salesPeriod;
  const rankTabPeriods = RANK_PERIODS[storeRankTab === 'level' ? 'sales' : storeRankTab];
  const setRankTabPeriod = (next: StorePeriodKey) => {
    if (storeRankTab === 'traffic') setTrafficPeriod(next);
    else if (storeRankTab !== 'level') setSalesPeriod(next);
  };

  const trendSeries: ChartSeries[] = trendView === 'store'
    ? [
        { key: 'sales', label: '销售额', color: '#ff8a3d', values: points.map((point) => point.sales), area: true },
        { key: 'qty', label: '销量', color: '#5b8ff9', values: points.map((point) => point.qty), axis: 'right' },
      ]
    : [
        { key: 'adCost', label: '广告消耗', color: '#ff8a3d', values: points.map((point) => point.adCost), area: true },
        { key: 'adGmv', label: '广告 GMV', color: '#5b8ff9', values: points.map((point) => point.adGmv) },
        { key: 'roas', label: '广告投产比', color: '#00b42a', values: points.map((point) => point.roas), axis: 'right' },
      ];

  const visibleSeries = trendSeries.filter((item) => !hiddenSeries.includes(item.key));
  const visibleKeys = new Set(visibleSeries.map((item) => item.key));
  const toggleSeries = (key: string) => {
    setHiddenSeries((prev) => (prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]));
  };

  return (
    <div className="hd-dashboard">
      <img className="hd-bg-deco" src={bgDeco} alt="" />
      <div className="hd-header">
        <div>
          <h1 className="hd-title">智慧运营中台</h1>
          <p className="hd-subtitle">运营全局尽在掌握，数据驱动增长</p>
        </div>
      </div>

      <div className="hd-grid">
        <div className="hd-main-row">
          <div className="hd-left-column">
            <div className="hd-metrics-row">
              {kpis.map((kpi) => {
                return (
                  <div
                    className="hd-glass hd-metric-card is-link"
                    key={kpi.key}
                    onClick={() => {
                      const isAd = kpi.key === 'adCost' || kpi.key === 'roas';
                      onNavigate('store-detail', isAd ? { tab: 'ad' } : undefined);
                    }}
                  >
                    <div className="hd-metric-top">
                      <img className="hd-metric-icon" src={metricIcon} alt="" />
                      <span className="hd-metric-label">{kpi.label}</span>
                      <span className="hd-metric-go">›</span>
                    </div>
                    <div className="hd-metric-value">{kpiText(kpi)}</div>
                    <div className="hd-metric-compare">
                      <span className="hd-metric-compare-label">较昨日</span>
                      <span className={`hd-metric-compare-value ${kpi.rate !== null && kpi.rate < 0 ? 'is-down' : 'is-up'}`}>
                        {kpi.rate === null ? '-' : `${kpi.rate >= 0 ? '+' : ''}${(kpi.rate * 100).toFixed(1)}%`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="hd-alerts-row">
              {alerts.map((alert) => (
                <div className={`hd-glass hd-alert-card ${alert.tone}`} key={alert.title}>
                  <img className="hd-alert-icon" src={alert.icon} alt="" />
                  <div className="hd-alert-body">
                    <div className="hd-alert-top">
                      <span className="hd-alert-title">{alert.title}</span>
                      <span className="hd-alert-count">{alert.count} 单 <i>›</i></span>
                    </div>
                    <div className="hd-alert-bottom">
                      <span className="hd-alert-desc">{alert.desc}</span>
                      <span className="hd-alert-setting" onClick={(event) => { event.stopPropagation(); setAlertOpen(true); }}>设置</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="hd-glass hd-trend-card">
              <div className="hd-card-header hd-trend-header">
                <div className="hd-card-title">经营趋势</div>
                <Segmented value={trendView} options={TREND_VIEWS} onChange={setTrendView} />
                <div className="hd-trend-tools-right">
                  <Segmented value={trendPeriod} options={TREND_PERIODS} onChange={setTrendPeriod} />
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
              <div className="hd-trend-legend is-top">
                {trendSeries.map((item) => (
                  <button
                    type="button"
                    key={item.key}
                    className={`hd-trend-legend-item${hiddenSeries.includes(item.key) ? ' is-hidden' : ''}`}
                    onClick={() => toggleSeries(item.key)}
                  >
                    <i style={{ background: item.color }} />
                    <span>{item.label}{item.axis === 'right' ? '（右轴）' : ''}</span>
                  </button>
                ))}
              </div>
              <div className="hd-chart-body">
                <Chart
                  labels={points.map((point) => point.label)}
                  series={visibleSeries}
                  height={180}
                  fill
                  formatValue={(value) => fmtMoney(value)}
                  axisFormat={fmtMoneyAxis}
                  rightAxisFormat={trendView === 'store' ? fmtAxis : (value) => `${value.toFixed(1)}x`}
                  ariaLabel="经营趋势"
                  tipRows={(index) => {
                    const point = points[index];
                    const rows: Array<{ label: string; value: string; color: string }> = [];
                    if (trendView === 'store') {
                      if (visibleKeys.has('sales')) rows.push({ label: '销售额', value: fmtMoney(point.sales), color: '#ff8a3d' });
                      if (visibleKeys.has('qty')) rows.push({ label: '销量', value: fmtInt(point.qty), color: '#5b8ff9' });
                    } else {
                      if (visibleKeys.has('adCost')) rows.push({ label: '广告消耗', value: fmtMoney(point.adCost), color: '#ff8a3d' });
                      if (visibleKeys.has('adGmv')) rows.push({ label: '广告 GMV', value: fmtMoney(point.adGmv), color: '#5b8ff9' });
                      if (visibleKeys.has('roas')) rows.push({ label: '广告投产比', value: fmtRoas(point.roas), color: '#00b42a' });
                    }
                    return rows;
                  }}
                />
              </div>
            </div>
          </div>

          <div className="hd-side-column">
            <div className="hd-glass hd-announcements-card">
              <div className="hd-card-header">
                <div className="hd-card-title">公告栏</div>
                <span className="hd-view-all" onClick={() => setAnnouncementOpen(true)}>查看全部 <i>›</i></span>
              </div>
              <ul className="hd-announcement-list">
                {announcements.map((item) => (
                  <li className="hd-announcement-item" key={item.id} onClick={() => setAnnouncementOpen(true)}>
                    <span className={`hd-announcement-tag${item.categoryName === '弹窗公告' ? ' is-popup' : ''}`}>{item.categoryName}</span>
                    <span className="hd-announcement-text" title={item.title}>{item.title}</span>
                    <span className="hd-announcement-date">{item.date}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="hd-promo-card">
              <div className="hd-promo-track" style={{ transform: `translateX(-${promoIndex * 100}%)` }}>
                {PROMOS.map((promo) => (
                  <div className="hd-promo-slide" key={promo.alt}><img src={promo.src} alt={promo.alt} /></div>
                ))}
              </div>
              <button type="button" className="hd-promo-arrow is-left" aria-label="上一张" onClick={() => setPromoIndex((value) => (value - 1 + PROMOS.length) % PROMOS.length)}>‹</button>
              <button type="button" className="hd-promo-arrow is-right" aria-label="下一张" onClick={() => setPromoIndex((value) => (value + 1) % PROMOS.length)}>›</button>
              <div className="hd-promo-dots">
                {PROMOS.map((promo, index) => (
                  <button type="button" key={promo.alt} className={`hd-promo-dot${index === promoIndex ? ' is-active' : ''}`} aria-label={promo.alt} onClick={() => setPromoIndex(index)} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="hd-rankings-duo">
          <div className="hd-glass hd-ranking-card">
            <div className="hd-card-header">
              <div className="hd-card-title">店铺 TOP5 排行榜</div>
              <div className="hd-rank-type-tabs">
                {STORE_RANK_TABS.map((item) => (
                  <button
                    type="button"
                    key={item.key}
                    className={`hd-rank-type-tab${storeRankTab === item.key ? ' is-active' : ''}`}
                    onClick={() => setStoreRankTab(item.key)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="hd-rank-tools">
                {storeRankTab !== 'level' ? <Segmented value={rankTabPeriod} options={rankTabPeriods} onChange={setRankTabPeriod} /> : null}
                <span className="hd-link" onClick={() => setRankDialog(storeRankTab)}>查看完整榜单</span>
              </div>
            </div>
            <div className="hd-ranking-list-wrap is-fixed">
              {storeRankTab === 'sales' ? <StoreRankList rows={salesRows.slice(0, 5)} kind="sales" /> : null}
              {storeRankTab === 'traffic' ? <StoreRankList rows={trafficRows.slice(0, 5)} kind="traffic" /> : null}
              {storeRankTab === 'level' ? <LevelRankList rows={levelRows.slice(0, 5)} /> : null}
            </div>
          </div>

          <div className="hd-glass hd-ranking-card">
            <div className="hd-card-header">
              <div className="hd-card-title">商品销售 TOP5 排行榜</div>
              <div className="hd-rank-type-tabs">
                {PRODUCT_METRICS.map((item) => (
                  <button
                    type="button"
                    key={item.key}
                    className={`hd-rank-type-tab${productMetric === item.key ? ' is-active' : ''}`}
                    onClick={() => setProductMetric(item.key)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="hd-rank-tools">
                <Segmented value={productPeriod} options={RANK_PERIODS.product} onChange={setProductPeriod} />
                <span className="hd-link" onClick={() => setRankDialog('product')}>查看Top100榜单</span>
              </div>
            </div>
            <div className="hd-ranking-list-wrap is-fixed">
              <ProductRankList rows={productRows.slice(0, 5)} metric={productMetric} />
            </div>
          </div>
        </div>
      </div>

      {rankDialog ? (
        <RankingDialog
          kind={rankDialog}
          period={rankDialogPeriod}
          onPeriodChange={setRankDialogPeriod}
          onKindChange={(next) => {
            setRankDialog(next);
            setStoreRankTab(next);
          }}
          productMetric={productMetric}
          onProductMetricChange={setProductMetric}
          exclusionEnabled={exclusionEnabled}
          configs={configs}
          onClose={() => setRankDialog(null)}
        />
      ) : null}
      {announcementOpen ? <AnnouncementDialog announcements={DATA.announcements} onClose={() => setAnnouncementOpen(false)} /> : null}
      {alertOpen ? <AlertSettingsDialog onClose={() => setAlertOpen(false)} /> : null}
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
