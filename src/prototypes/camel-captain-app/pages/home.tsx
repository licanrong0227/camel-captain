import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronRight, Headset, Maximize2, Megaphone, RefreshCw, Settings2 } from 'lucide-react';
import {
  buildHomeKpis,
  buildHomeTrend,
  levelRank,
  productRank,
  storeSalesRank,
  storeTrafficRank,
  type HomeTrendPeriod,
  type ProductRankMetric,
  type RankRow,
} from '../data/aggregate';
import { LEVEL_COLORS, LEVEL_LIGHT_COLORS } from '../data/catalog';
import { fmtAxis, fmtInt, fmtMoney, fmtMoneyAxis, fmtRoas } from '../data/format';
import type { AdTrendView } from '../data/adTrend';
import type { ExclusionConfig, StorePeriodKey } from '../data/types';
import homeJson from '../data/home.json';
import { Chart, type ChartSeries } from '../components/Chart';
import { LandscapeChart } from '../components/LandscapeChart';
import { BackToTop } from '../components/BackToTop';
import { KpiCard } from '../components/KpiCard';
import { Segmented } from '../components/Segmented';
import { AnnouncementSheet } from '../components/AnnouncementSheet';
import { AnnouncementDetailSheet } from '../components/AnnouncementDetailSheet';
import { NoticePopup } from '../components/NoticePopup';
import { AlertSettingsSheet, type AlertKind } from '../components/AlertSettingsSheet';
import { ExclusionSheet } from '../components/ExclusionSheet';
import { RankingSheet, type RankKind } from '../components/RankingSheet';
import { SkuSheet } from '../components/SkuSheet';
import { Sheet } from '../components/Sheet';
import logo from '../assets/logo.png';
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
import wecomQr from '../assets/wecom-qr.png';

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

const HOME_KPI_TIPS: Record<string, string> = {
  sales: '当日成交金额之和，按当前 GMV 口径',
  orders: '当日成交订单数',
  qty: '当日成交商品件数',
  adCost: '当日广告花费之和',
  roas: '当日广告 GMV / 广告消耗',
};

const TREND_VIEWS = [
  { key: 'store', label: '店铺销售' },
  { key: 'ad', label: '广告投放' },
];

const TREND_PERIODS = [
  { key: 'm1', label: '近1月' },
  { key: 'm2', label: '近2月' },
  { key: 'm3', label: '近3月' },
  { key: 'm6', label: '近6月' },
];

const STORE_RANK_TABS = [
  { key: 'sales', label: '销售额' },
  { key: 'traffic', label: '浏览量' },
  { key: 'level', label: '等级' },
];

const PRODUCT_METRICS = [
  { key: 'qty', label: '销量' },
  { key: 'gmv', label: '销售额' },
  { key: 'orders', label: '订单量' },
];

const PERIOD_OPTIONS = [
  { key: 'week', label: '近1周' },
  { key: 'month', label: '近1月' },
  { key: 'months3', label: '近3月' },
];

export function HomePage({
  avatar,
  onProfile,
  exclusionEnabled,
  onToggleExclusion,
  configs,
  onSaveConfigs,
  lastSync,
  syncing,
  onSync,
  onOpenAd,
}: {
  avatar: string;
  onProfile: () => void;
  exclusionEnabled: boolean;
  onToggleExclusion: () => void;
  configs: ExclusionConfig[];
  onSaveConfigs: (next: ExclusionConfig[]) => void;
  lastSync: string;
  syncing: boolean;
  onSync: () => void;
  onOpenAd: (metric: AdTrendView) => void;
}) {
  const [trendView, setTrendView] = useState<'store' | 'ad'>('store');
  const [trendPeriod, setTrendPeriod] = useState<HomeTrendPeriod>('m1');
  const [trendMetric, setTrendMetric] = useState<'sales' | 'qty' | 'adCost' | 'adGmv' | 'roas'>('sales');
  const [trendSettingsOpen, setTrendSettingsOpen] = useState(false);
  const [landscapeOpen, setLandscapeOpen] = useState(false);
  const [landscapeHidden, setLandscapeHidden] = useState<string[]>([]);
  const [storeRankTab, setStoreRankTab] = useState<'sales' | 'traffic' | 'level'>('sales');
  const [storeRankPeriod, setStoreRankPeriod] = useState<StorePeriodKey>('week');
  const [productMetric, setProductMetric] = useState<ProductRankMetric>('qty');
  const [productPeriod, setProductPeriod] = useState<StorePeriodKey>('week');
  const [annOpen, setAnnOpen] = useState(false);
  const [noticeUnread, setNoticeUnread] = useState(true);
  const [popupNotice, setPopupNotice] = useState<Announcement | null>(null);
  const [annDetail, setAnnDetail] = useState<Announcement | null>(null);
  const [alertKind, setAlertKind] = useState<AlertKind | null>(null);
  const [exclusionOpen, setExclusionOpen] = useState(false);
  const [rankKind, setRankKind] = useState<RankKind | null>(null);
  const [skuTarget, setSkuTarget] = useState<{ itemcode: string; name: string } | null>(null);
  const [contactOpen, setContactOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [promoIndex, setPromoIndex] = useState(0);
  const [promoDragging, setPromoDragging] = useState(false);
  const [promoOffset, setPromoOffset] = useState<number | null>(null);
  const promoDrag = useRef<{ x: number; y: number; pointerId: number; axis: 'x' | 'y' | null; width: number } | null>(null);

  useEffect(() => {
    if (promoDragging) return;
    const timer = window.setInterval(() => setPromoIndex((value) => (value + 1) % PROMOS.length), 6500);
    return () => window.clearInterval(timer);
  }, [promoDragging]);

  const handlePromoPointerDown = (event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    promoDrag.current = {
      x: event.clientX,
      y: event.clientY,
      pointerId: event.pointerId,
      axis: null,
      width: event.currentTarget.clientWidth || 1,
    };
  };

  const handlePromoPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const drag = promoDrag.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (drag.axis === null) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      drag.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (drag.axis === 'x') {
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
          // 合成事件没有真实指针，忽略捕获失败
        }
        setPromoDragging(true);
      }
    }
    if (drag.axis !== 'x') return;
    const atStart = promoIndex === 0 && dx > 0;
    const atEnd = promoIndex === PROMOS.length - 1 && dx < 0;
    setPromoOffset(atStart || atEnd ? dx * 0.35 : dx);
  };

  const handlePromoPointerEnd = (event: React.PointerEvent<HTMLElement>) => {
    const drag = promoDrag.current;
    promoDrag.current = null;
    setPromoDragging(false);
    if (!drag || drag.axis !== 'x') {
      setPromoOffset(null);
      return;
    }
    const dx = event.clientX - drag.x;
    const threshold = Math.min(48, drag.width * 0.18);
    if (dx <= -threshold && promoIndex < PROMOS.length - 1) {
      setPromoIndex(promoIndex + 1);
    } else if (dx >= threshold && promoIndex > 0) {
      setPromoIndex(promoIndex - 1);
    }
    setPromoOffset(null);
  };

  useEffect(() => {
    const popup = DATA.announcements.find((item) => item.categoryName === '弹窗公告');
    if (popup) setPopupNotice(popup);
  }, []);

  const kpis = useMemo(() => buildHomeKpis(exclusionEnabled, configs), [exclusionEnabled, configs]);
  const points = useMemo(
    () => buildHomeTrend(trendPeriod, exclusionEnabled, configs),
    [trendPeriod, exclusionEnabled, configs],
  );

  useEffect(() => {
    setTrendMetric(trendView === 'store' ? 'sales' : 'adCost');
  }, [trendView]);

  const trendMetricOptions = useMemo(() => {
    if (trendView === 'store') {
      return [
        { key: 'sales' as const, label: '销售额', color: '#FF8A3D', values: points.map((point) => point.sales), format: 'money' as const, axisFormat: fmtMoneyAxis },
        { key: 'qty' as const, label: '销量', color: '#5B8FF9', values: points.map((point) => point.qty), format: 'count' as const, axisFormat: fmtAxis },
      ];
    }
    return [
      { key: 'adCost' as const, label: '广告消耗', color: '#FF8A3D', values: points.map((point) => point.adCost), format: 'money' as const, axisFormat: fmtMoneyAxis },
      { key: 'adGmv' as const, label: '广告 GMV', color: '#5B8FF9', values: points.map((point) => point.adGmv), format: 'money' as const, axisFormat: fmtMoneyAxis },
      { key: 'roas' as const, label: '投产比', color: '#0BB861', values: points.map((point) => point.roas ?? 0), format: 'roas' as const, axisFormat: (value: number) => `${value.toFixed(1)}x` },
    ];
  }, [trendView, points]);

  const landscapeSeries: ChartSeries[] = useMemo(() => (
    trendView === 'store'
      ? [
        { key: 'sales', label: '销售额', color: '#FF8A3D', values: points.map((point) => point.sales), area: true },
        { key: 'qty', label: '销量', color: '#5B8FF9', values: points.map((point) => point.qty), axis: 'right' as const },
      ]
      : [
        { key: 'adCost', label: '广告消耗', color: '#FF8A3D', values: points.map((point) => point.adCost), area: true },
        { key: 'adGmv', label: '广告 GMV', color: '#5B8FF9', values: points.map((point) => point.adGmv) },
        { key: 'roas', label: '投产比', color: '#0BB861', values: points.map((point) => point.roas), axis: 'right' as const },
      ]
  ), [trendView, points]);

  useEffect(() => {
    if (landscapeOpen) setLandscapeHidden([]);
  }, [landscapeOpen]);

  const activeTrendMetric = trendMetricOptions.find((item) => item.key === trendMetric) ?? trendMetricOptions[0];
  const formatTrendMetric = (value: number | null) => {
    if (activeTrendMetric.format === 'money') return fmtMoney(value);
    if (activeTrendMetric.format === 'count') return fmtInt(value);
    return fmtRoas(value);
  };
  const trendPeriodLabel = TREND_PERIODS.find((item) => item.key === trendPeriod)?.label ?? '近1月';

  const salesRows = useMemo(() => storeSalesRank(storeRankPeriod, exclusionEnabled, configs), [storeRankPeriod, exclusionEnabled, configs]);
  const trafficRows = useMemo(() => storeTrafficRank(storeRankPeriod), [storeRankPeriod]);
  const levelRows = useMemo(() => levelRank(), []);
  const productRows = useMemo(() => productRank(productPeriod, productMetric), [productPeriod, productMetric]);

  const alerts: Array<{ title: string; desc: string; count: number; tone: string; icon: string; kind: AlertKind }> = [
    { title: '异常订单', desc: '平台异常未处理的订单', count: DATA.abnormal.abnormalOrderCount, tone: 'danger', icon: alertIcon1, kind: 'order' },
    { title: '异常发货', desc: '承诺发货截止时间的订单', count: DATA.abnormal.abnormalDeliveryCount, tone: 'warning', icon: alertIcon2, kind: 'delivery' },
    { title: '异常上网', desc: '有发货但无上网记录的订单', count: DATA.abnormal.abnormalOnNetCount, tone: 'success', icon: alertIcon3, kind: 'onnet' },
    { title: '异常物流', desc: '物流还未显示录入的订单', count: DATA.abnormal.abnormalLogisticsCount, tone: 'orange', icon: alertIcon4, kind: 'logistics' },
  ];

  const medal = (rank: number) => {
    if (rank === 1) return <img className="cc-rank-medal-img" src={rank1} alt="第1名" />;
    if (rank === 2) return <img className="cc-rank-medal-img" src={rank2} alt="第2名" />;
    if (rank === 3) return <img className="cc-rank-medal-img" src={rank3} alt="第3名" />;
    return <span className="cc-rank-no">{rank}</span>;
  };

  const openAdFromKpi = (key: string) => {
    if (key === 'adCost') onOpenAd('cost');
    else if (key === 'roas') onOpenAd('roas');
    else if (key === 'sales') onOpenAd('storeGmv');
    else onOpenAd('gmv');
  };

  const renderStoreRows = (rows: RankRow[]) => (
    <div className="cc-rank-list">
      {rows.slice(0, 5).map((row) => (
        <div className="cc-rank-row" key={row.key}>
          {medal(row.rank)}
          <div className="cc-rank-main">
            <div className="cc-rank-name">{row.storeName}</div>
            {row.storeAlias ? <div className="cc-rank-sub">{row.storeAlias}</div> : null}
          </div>
          {storeRankTab === 'level' ? (
            <span className="cc-rank-level">
              <span
                className="cc-level-badge"
                style={{ color: LEVEL_COLORS[row.level ?? 0], background: LEVEL_LIGHT_COLORS[row.level ?? 0] }}
              >
                LV{row.level ?? 0}
              </span>
              <span className="cc-level-score">{(row.score ?? 0).toFixed(2)} 分</span>
            </span>
          ) : (
            <span className="cc-rank-value">
              {storeRankTab === 'sales' ? fmtMoney(row.value) : fmtInt(row.value)}
            </span>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="cc-page cc-home">
      <div className="cc-scroll" ref={scrollRef}>
        <header className="cc-home-head">
          <div className="cc-home-brand">
            <img className="cc-home-logo" src={logo} alt="骆驼队长" />
            <span className="cc-home-name">智慧运营中台</span>
            <span className="cc-vip-pill">VIP3</span>
            <button
              type="button"
              className="cc-home-notice-btn"
              aria-label={noticeUnread ? "公告栏（有新公告）" : "公告栏"}
              onClick={() => {
                setNoticeUnread(false);
                setAnnOpen(true);
              }}
            >
              <Megaphone size={16} />
              {noticeUnread ? <span className="cc-home-notice-dot" /> : null}
            </button>
            <button type="button" className="cc-home-avatar-btn" aria-label="进入我的" onClick={onProfile}>
              <img className="cc-home-avatar" src={avatar} alt="" />
            </button>
          </div>
          <div className="cc-home-subrow">
            <span className="cc-home-subtitle">运营全局尽在掌握，数据驱动增长</span>
            <button type="button" className="cc-sync" disabled={syncing} onClick={onSync}>
              <RefreshCw size={12} className={syncing ? 'is-spinning' : ''} />
              <span>{syncing ? '同步中…' : lastSync === '刚刚' ? '刚刚同步' : `最近同步 ${lastSync}`}</span>
            </button>
          </div>
        </header>

        <section
          className={`cc-promo${promoDragging ? ' is-dragging' : ''}`}
          onPointerDown={handlePromoPointerDown}
          onPointerMove={handlePromoPointerMove}
          onPointerUp={handlePromoPointerEnd}
          onPointerCancel={handlePromoPointerEnd}
        >
          <div
            className="cc-promo-track"
            style={{
              transform: `translateX(calc(-${promoIndex * 100}% + ${promoOffset ?? 0}px))`,
              transition: promoDragging ? 'none' : undefined,
            }}
          >
            {PROMOS.map((promo) => (
              <div className="cc-promo-slide" key={promo.alt}>
                <img src={promo.src} alt={promo.alt} draggable={false} />
              </div>
            ))}
          </div>
          <div className="cc-promo-dots">
            {PROMOS.map((promo, index) => (
              <button
                type="button"
                key={promo.alt}
                className={`cc-promo-dot${index === promoIndex ? ' is-active' : ''}`}
                aria-label={promo.alt}
                onClick={() => setPromoIndex(index)}
              />
            ))}
          </div>
        </section>

        <section className="cc-card cc-section cc-home-kpi-section">
          <div className="cc-section-head">
            <span className="cc-section-title">经营指标</span>
          </div>
          <div className="cc-kpi-grid">
          {kpis.map((kpi, index) => (
            <KpiCard
              key={kpi.key}
              label={kpi.label}
              value={kpi.format === 'money' ? fmtMoney(kpi.value) : kpi.format === 'int' ? fmtInt(kpi.value) : fmtRoas(kpi.value)}
              delta={kpi.rate}
              hint={HOME_KPI_TIPS[kpi.key]}
              icon={<img className="cc-kpi-img" src={metricIcon} alt="" />}
              wide={kpis.length % 2 === 1 && index === kpis.length - 1}
              goodWhenUp={kpi.key !== 'adCost'}
              onClick={() => openAdFromKpi(kpi.key)}
            />
          ))}
          </div>
        </section>

        <section className="cc-card cc-section cc-home-alert-section">
          <div className="cc-section-head">
            <span className="cc-section-title">异常提醒</span>
          </div>
          <div className="cc-alert-grid">
          {alerts.map((alert) => (
            <div className={`cc-alert is-${alert.tone}`} key={alert.title}>
              <div className="cc-alert-top">
                <img className="cc-alert-icon" src={alert.icon} alt="" />
                <span className="cc-alert-title">{alert.title}</span>
                <button
                  type="button"
                  className="cc-alert-setting"
                  aria-label="筛选状态设置"
                  onClick={() => setAlertKind(alert.kind)}
                >
                  <Settings2 size={14} />
                </button>
              </div>
              <div className="cc-alert-value">{fmtInt(alert.count)}</div>
              <div className="cc-alert-desc">{alert.desc}</div>
            </div>
          ))}
          </div>
        </section>

        <section className="cc-card cc-section">
          <div className="cc-section-head">
            <span className="cc-section-title">经营趋势</span>
            <button
              type="button"
              className={`cc-trend-settings${exclusionEnabled ? ' is-active' : ''}`}
              onClick={() => setTrendSettingsOpen(true)}
            >
              {trendPeriodLabel} · {exclusionEnabled ? '剔除数据' : '原始数据'}
              <ChevronDown size={13} />
            </button>
            <button type="button" className="cc-landscape-btn" onClick={() => setLandscapeOpen(true)}>
              <Maximize2 size={12} /> 横屏
            </button>
          </div>
          <Segmented
            value={trendView}
            options={TREND_VIEWS}
            onChange={(next) => setTrendView(next as 'store' | 'ad')}
            variant="tabs"
          />
          <div className="cc-chip-row cc-trend-metric-row">
            {trendMetricOptions.map((metric) => (
              <button
                type="button"
                key={metric.key}
                className={`cc-chip${activeTrendMetric.key === metric.key ? ' is-active' : ''}`}
                onClick={() => setTrendMetric(metric.key)}
              >
                {metric.label}
              </button>
            ))}
          </div>
          <Chart
            labels={points.map((point) => point.label)}
            series={[{
              key: activeTrendMetric.key,
              label: activeTrendMetric.label,
              color: activeTrendMetric.color,
              values: activeTrendMetric.values,
              area: true,
            }]}
            height={200}
            formatValue={formatTrendMetric}
            axisFormat={activeTrendMetric.axisFormat}
            tipRows={(index) => [{
              label: activeTrendMetric.label,
              value: formatTrendMetric(activeTrendMetric.values[index] ?? null),
              color: activeTrendMetric.color,
            }]}
            ariaLabel="经营趋势"
          />
        </section>


        <section className="cc-card cc-section">
          <div className="cc-section-head">
            <span className="cc-section-title">店铺 TOP5 排行榜</span>
            <button type="button" className="cc-text-link" onClick={() => setRankKind(storeRankTab)}>查看完整榜单 <ChevronRight size={13} /></button>
          </div>
          <div className="cc-rank-tabs">
            {STORE_RANK_TABS.map((tab) => (
              <button
                type="button"
                key={tab.key}
                className={`cc-rank-tab${storeRankTab === tab.key ? ' is-active' : ''}`}
                onClick={() => setStoreRankTab(tab.key as 'sales' | 'traffic' | 'level')}
              >
                {tab.label}
              </button>
            ))}
            {storeRankTab !== 'level' ? (
              <Segmented value={storeRankPeriod} options={PERIOD_OPTIONS} onChange={(next) => setStoreRankPeriod(next as StorePeriodKey)} />
            ) : null}
          </div>
          {storeRankTab === 'sales' ? renderStoreRows(salesRows) : null}
          {storeRankTab === 'traffic' ? renderStoreRows(trafficRows) : null}
          {storeRankTab === 'level' ? renderStoreRows(levelRows) : null}
        </section>

        <section className="cc-card cc-section">
          <div className="cc-section-head">
            <span className="cc-section-title">商品销售 TOP5 排行榜</span>
            <button type="button" className="cc-text-link" onClick={() => setRankKind('product')}>查看 Top100 <ChevronRight size={13} /></button>
          </div>
          <div className="cc-rank-tabs">
            {PRODUCT_METRICS.map((tab) => (
              <button
                type="button"
                key={tab.key}
                className={`cc-rank-tab${productMetric === tab.key ? ' is-active' : ''}`}
                onClick={() => setProductMetric(tab.key as ProductRankMetric)}
              >
                {tab.label}
              </button>
            ))}
            <Segmented value={productPeriod} options={PERIOD_OPTIONS} onChange={(next) => setProductPeriod(next as StorePeriodKey)} />
          </div>
          <div className="cc-rank-list">
            {productRows.slice(0, 5).map((row) => (
              <div
                className="cc-rank-row is-link"
                key={row.key}
                onClick={() => setSkuTarget({ itemcode: row.itemcode ?? '', name: row.name ?? '' })}
              >
                {medal(row.rank)}
                <img className="cc-rank-thumb" src={row.thumb} alt="" />
                <div className="cc-rank-main">
                  <div className="cc-rank-name cc-rank-name--clamp">{row.name}</div>
                  <div className="cc-rank-sub">{row.itemcode} · {row.storeName}</div>
                </div>
                <span className="cc-rank-value">{productMetric === 'gmv' ? fmtMoney(row.value) : fmtInt(row.value)}</span>
                <ChevronRight size={14} className="cc-rank-chevron" />
              </div>
            ))}
          </div>
        </section>

        <div className="cc-home-bottom-space" />
      </div>

      <BackToTop scrollRef={scrollRef} bottom={68} />

      <button type="button" className="cc-cs-float" aria-label="联系我们" onClick={() => setContactOpen(true)}>
        <Headset size={20} />
      </button>

      <AnnouncementSheet
        open={annOpen}
        announcements={DATA.announcements}
        onOpen={(item) => setAnnDetail(item)}
        onClose={() => setAnnOpen(false)}
      />
      <AnnouncementDetailSheet open={annDetail !== null} item={annDetail} onClose={() => setAnnDetail(null)} />
      <NoticePopup open={popupNotice !== null} item={popupNotice} onClose={() => setPopupNotice(null)} />

      <Sheet
        open={trendSettingsOpen}
        title="趋势设置"
        height={560}
        onClose={() => setTrendSettingsOpen(false)}
        footer={<button type="button" className="cc-btn cc-btn--primary" onClick={() => setTrendSettingsOpen(false)}>完成</button>}
      >
        <div className="cc-form-label">时间范围</div>
        <div className="cc-chip-row">
          {TREND_PERIODS.map((item) => (
            <button
              type="button"
              key={item.key}
              className={`cc-chip${trendPeriod === item.key ? ' is-active' : ''}`}
              onClick={() => setTrendPeriod(item.key as HomeTrendPeriod)}
            >
              {item.label}
            </button>
          ))}
        </div>
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
            setTrendSettingsOpen(false);
            setExclusionOpen(true);
          }}
        >
          剔除设置
        </button>
      </Sheet>

      <LandscapeChart
        open={landscapeOpen}
        title="经营趋势"
        subtitle={`${trendPeriodLabel} · ${exclusionEnabled ? '剔除数据' : '原始数据'}`}
        labels={points.map((point) => point.label)}
        series={landscapeSeries}
        tabs={{
          options: TREND_VIEWS,
          value: trendView,
          onChange: (next) => setTrendView(next as 'store' | 'ad'),
        }}
        legend={{
          hidden: landscapeHidden,
          onToggle: (key) => setLandscapeHidden((prev) => (
            prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
          )),
        }}
        height={200}
        formatValue={(value) => fmtMoney(value)}
        axisFormat={fmtMoneyAxis}
        rightAxisFormat={trendView === 'store' ? fmtAxis : (value) => `${value.toFixed(1)}x`}
        tipRows={(index) => landscapeSeries
          .filter((item) => !landscapeHidden.includes(item.key))
          .map((item) => ({
            label: item.label,
            value: item.key === 'qty'
              ? fmtInt(item.values[index] ?? null)
              : item.key === 'roas'
                ? fmtRoas(item.values[index] ?? null)
                : fmtMoney(item.values[index] ?? null),
            color: item.color,
          }))}
        onClose={() => setLandscapeOpen(false)}
      />

      <AlertSettingsSheet
        open={alertKind !== null}
        kind={alertKind ?? 'order'}
        onClose={() => setAlertKind(null)}
      />
      <ExclusionSheet open={exclusionOpen} configs={configs} onSave={onSaveConfigs} onClose={() => setExclusionOpen(false)} />
      <RankingSheet
        open={rankKind !== null}
        kind={rankKind ?? 'sales'}
        onClose={() => setRankKind(null)}
        exclusionEnabled={exclusionEnabled}
        configs={configs}
        onOpenSku={(row) => {
          setSkuTarget({ itemcode: row.itemcode ?? '', name: row.name ?? '' });
        }}
      />
      <SkuSheet
        open={skuTarget !== null}
        target={skuTarget}
        period={productPeriod}
        onClose={() => setSkuTarget(null)}
      />
      <Sheet open={contactOpen} title="联系我们" height={520} onClose={() => setContactOpen(false)}>
        <div className="cc-contact-card">
          <div className="cc-contact-title">企业微信</div>
          <img className="cc-contact-qr" src={wecomQr} alt="企业微信二维码" />
          <div className="cc-contact-tip">扫码添加客服</div>
        </div>
      </Sheet>
    </div>
  );
}
