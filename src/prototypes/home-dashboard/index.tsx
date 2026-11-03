/**
 * @name 首页
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertCircle,
  AlignJustify,
  Archive,
  Bell,
  BellRing,
  BookOpen,
  Briefcase,
  Calendar,
  Check,
  CheckSquare,
  CircleHelp,
  Compass,
  Crown,
  FileText,
  GitBranch,
  Headset,
  Heart,
  LayoutGrid,
  LogIn,
  Mail,
  MapPin,
  Monitor,
  Network,
  Pencil,
  Plug,
  RefreshCw,
  ScrollText,
  Search,
  Settings2,
  Shield,
  ShoppingCart,
  Sparkles,
  Sun,
  Upload,
  User,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import './style.css';
import homeJson from './data/home.json';
import navJson from './data/nav.json';
import logo from './assets/logo.png';
import avatar from './assets/avatar.png';
import bgDeco from './assets/bg-deco.png';
import metricIcon from './assets/metric-icon.png';
import alertIcon1 from './assets/alert-1.png';
import alertIcon2 from './assets/alert-2.png';
import alertIcon3 from './assets/alert-3.png';
import alertIcon4 from './assets/alert-4.png';
import rank1 from './assets/rank-1.png';
import rank2 from './assets/rank-2.png';
import rank3 from './assets/rank-3.png';
import promo1 from './assets/promo-1.png';
import promo2 from './assets/promo-2.png';
import promo3 from './assets/promo-3.png';
import wecomQr from './assets/wecom-qr.png';
import goods1 from './assets/goods-1.jpg';
import goods2 from './assets/goods-2.jpg';
import goods3 from './assets/goods-3.jpg';
import goods4 from './assets/goods-4.jpg';
import goods5 from './assets/goods-5.jpg';
import goods6 from './assets/goods-6.jpg';
import goods7 from './assets/goods-7.jpg';
import goods8 from './assets/goods-8.jpg';
import goods9 from './assets/goods-9.jpg';
import goods10 from './assets/goods-10.jpg';
import goods11 from './assets/goods-11.jpeg';
import goods12 from './assets/goods-12.jpeg';
import goods13 from './assets/goods-13.jpg';
import goods14 from './assets/goods-14.jpg';
import goods15 from './assets/goods-15.jpg';
import goods16 from './assets/goods-16.jpg';
import { TrendChart, type TrendPeriod, type TrendPoint } from './components/TrendChart';

type SpecValue = { label: string; value: string };
type SpecRank = { specValue: SpecValue[]; goodsCount: number; ratio: number };
type StoreRank = {
  rank: number;
  storeName: string;
  sales?: number;
  goodsCount?: number;
  pdPv?: number;
  itemCode?: string;
  specSalesRank?: SpecRank[];
};
type Announcement = { id: number; title: string; categoryName: string; date: string };
type HomeData = {
  orderStatistics: {
    orderCount: { today: number; yesterday: number; rate: number };
    sales: { today: number; yesterday: number; rate: number };
    goodsNum: { today: number; yesterday: number; rate: number };
    refund: { today: number; yesterday: number; rate: number };
    refundCount: { today: number; yesterday: number; rate: number };
  };
  abnormal: {
    abnormalOrderCount: number;
    abnormalDeliveryCount: number;
    abnormalOnNetCount: number;
    abnormalLogisticsCount: number;
  };
  trends: Record<TrendPeriod, TrendPoint[]>;
  storeSales: { week: StoreRank[]; month: StoreRank[]; months3: StoreRank[] };
  storeTraffic: { day: StoreRank[]; week: StoreRank[]; month: StoreRank[] };
  products: { week: StoreRank[]; month: StoreRank[]; months3: StoreRank[] };
  announcements: Announcement[];
};
type NavNode = { title: string; path: string; icon: string; children: NavNode[] };

const DATA = homeJson as unknown as HomeData;
const NAV = navJson as unknown as NavNode[];

const GOODS: Record<string, string> = {
  '1059792066': goods1,
  '1061855044': goods2,
  '1067571613': goods3,
  '1067662115': goods4,
  '1087041854': goods5,
  '1087318057': goods6,
  '1092045529': goods7,
  '1092336240': goods8,
  '1092780618': goods9,
  '1098945523': goods10,
  '1100488449': goods11,
  '1106527389': goods12,
  '1116418851': goods13,
  '1116807901': goods14,
  '1116957858': goods15,
  '1117178498': goods16,
};

const PROMOS = [
  { src: promo1, alt: '帮助中心' },
  { src: promo2, alt: '跨境AI智能体' },
  { src: promo3, alt: '直播预告' },
];

const ALERT_STATUSES = [
  '订单取消',
  '等待买家付款',
  '买家已付款，等待平台确认',
  '等待发货',
  '买家申请退款，等待协商结果',
  '退款协议已达成',
  '部分退款后，等待发货',
  '买家取消退款申请',
  '已部分发货',
  '等待买家确认收货',
  '退款/退货协商中，等待协议达成',
  '买家投诉到平台',
  '协议已达成，执行中',
  '人工确认收货',
  '超过预定期限，自动确认收货',
  '交易成功',
  '交易关闭',
];

const DEFAULT_CHECKED = ['订单取消', '买家申请退款，等待协商结果', '退款/退货协商中，等待协议达成', '买家投诉到平台'];

function money(value = 0) {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function int(value = 0) {
  return value.toLocaleString('en-US');
}

function NavIcon({ name }: { name: string }) {
  const map: Record<string, React.ReactNode> = {
    network: <Network size={14} />,
    monitor: <Monitor size={14} />,
    upload: <Upload size={14} />,
    guide: <Compass size={14} />,
    archived: <Archive size={14} />,
    system: <Settings2 size={14} />,
    'base-info': <FileText size={14} />,
    job: <Briefcase size={14} />,
    'api-gateway': <Plug size={14} />,
    'root-addr': <MapPin size={14} />,
    edit: <Pencil size={14} />,
    shopping: <ShoppingCart size={14} />,
    operators: <Users size={14} />,
    email: <Mail size={14} />,
    '404': <AlertCircle size={14} />,
    peoples: <Users size={14} />,
    example: <FileText size={14} />,
    calendar: <Calendar size={14} />,
    'api-test': <Plug size={14} />,
    'app-group-fill': <LayoutGrid size={14} />,
    build: <Wrench size={14} />,
    documentation: <BookOpen size={14} />,
    scene: <LayoutGrid size={14} />,
    'alarm-settings': <BellRing size={14} />,
    'user-info': <User size={14} />,
    tree: <GitBranch size={14} />,
    people: <User size={14} />,
    logininfor: <LogIn size={14} />,
    log: <ScrollText size={14} />,
    skill: <Sparkles size={14} />,
    heart: <Heart size={14} />,
    'system-tools': <Wrench size={14} />,
    'batch-update': <RefreshCw size={14} />,
    search: <Search size={14} />,
    safety: <Shield size={14} />,
    'api-monitor': <Activity size={14} />,
    checkbox: <CheckSquare size={14} />,
  };
  return <>{map[name] || <FileText size={14} />}</>;
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { key: T; label: string }[];
  onChange: (key: T) => void;
}) {
  return (
    <div className="hd-period-tabs" role="radiogroup">
      {options.map((option) => (
        <button
          type="button"
          key={option.key}
          role="radio"
          aria-checked={value === option.key}
          className={`hd-period-btn${value === option.key ? ' is-active' : ''}`}
          onClick={() => onChange(option.key)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function TopBar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [popover, setPopover] = useState<null | 'theme' | 'message' | 'avatar'>(null);
  const [theme, setTheme] = useState('日落橙');

  useEffect(() => {
    const onDown = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.hd-tool, .hd-avatar-wrap')) {
        setPopover(null);
      }
      if (!target.closest('.hd-nav-group')) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  return (
    <header className="hd-navbar">
      <div className="hd-logo-area">
        <img className="hd-logo" src={logo} alt="logo" />
        <span className="hd-logo-subtitle">智慧运营中台</span>
      </div>
      <div className="hd-nav-divider">|</div>
      <nav className="hd-top-nav">
        <span className="hd-nav-item is-active">首页</span>
        {NAV.map((menu) => (
          <div
            className={`hd-nav-group${openMenu === menu.title ? ' is-open' : ''}`}
            key={menu.title}
            onMouseEnter={() => setOpenMenu(menu.title)}
            onMouseLeave={() => setOpenMenu((current) => (current === menu.title ? null : current))}
          >
            <span className="hd-nav-item">{menu.title}</span>
            {openMenu === menu.title ? (
              <div className="hd-submenu">
                {menu.children.map((group) => {
                  const items = group.children.length ? group.children : [group];
                  return (
                    <div className="hd-submenu-group" key={`${menu.title}-${group.title}`}>
                      <div className="hd-submenu-title">{group.title}</div>
                      <div className="hd-submenu-grid">
                        {items.map((item) => (
                          <div className="hd-submenu-item" key={`${group.title}-${item.title}`}>
                            <NavIcon name={item.icon} />
                            <span>{item.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        ))}
      </nav>

      <div className="hd-tools">
        <div className="hd-tool" title="切换主题" onClick={() => setPopover(popover === 'theme' ? null : 'theme')}>
          <Sun size={18} />
          {popover === 'theme' ? (
            <div className="hd-popover hd-theme-menu" onClick={(event) => event.stopPropagation()}>
              {[
                { label: '沙漠黄', color: '#f9b739' },
                { label: '商务蓝', color: '#2c7bfc' },
                { label: '日落橙', color: '#ff781f' },
              ].map((item) => (
                <div
                  className="hd-theme-item"
                  key={item.label}
                  onClick={() => {
                    setTheme(item.label);
                    setPopover(null);
                  }}
                >
                  <span className="hd-theme-dot" style={{ background: item.color }} />
                  <span>{item.label}</span>
                  {theme === item.label ? <Check size={14} className="hd-theme-check" /> : null}
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <div className="hd-tool is-optional" title="菜单">
          <AlignJustify size={18} />
        </div>
        <div className="hd-tool is-optional" title="帮助中心">
          <CircleHelp size={18} />
        </div>
        <div className="hd-tool" title="消息通知" onClick={() => setPopover(popover === 'message' ? null : 'message')}>
          <Bell size={18} />
          {popover === 'message' ? (
            <div className="hd-popover hd-message-panel" onClick={(event) => event.stopPropagation()}>
              <div className="hd-message-head">消息通知</div>
              <div className="hd-message-body">暂无消息</div>
            </div>
          ) : null}
        </div>
        <span className="hd-vip">
          <Crown size={12} />
          VIP3
        </span>
        <div className="hd-avatar-wrap" onClick={() => setPopover(popover === 'avatar' ? null : 'avatar')}>
          <img className="hd-avatar" src={avatar} alt="avatar" />
          <span className="hd-avatar-caret">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          {popover === 'avatar' ? (
            <div className="hd-popover hd-theme-menu" onClick={(event) => event.stopPropagation()}>
              <div className="hd-theme-item" onClick={() => setPopover(null)}>
                <User size={14} />
                <span>个人中心</span>
              </div>
              <div className="hd-theme-item" onClick={() => setPopover(null)}>
                <LogIn size={14} />
                <span>退出登录</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

function StoreRanking({ rows, valueKey }: { rows: StoreRank[]; valueKey: 'sales' | 'pdPv' }) {
  const medals = [rank1, rank2, rank3];
  return (
    <ul className="hd-ranking-list">
      {rows.map((row) => (
        <li className="hd-ranking-item" key={`${row.storeName}-${row.rank}`}>
          {row.rank <= 3 ? (
            <img className="hd-rank-medal" src={medals[row.rank - 1]} alt="" />
          ) : (
            <div className="hd-rank-badge">{row.rank}</div>
          )}
          <span className="hd-store-name" title={row.storeName}>
            {row.storeName}
          </span>
          <span className={`hd-store-amount ${row.rank <= 3 ? 'is-top' : 'is-normal'}`}>
            {valueKey === 'sales' ? money(row.sales) : int(row.pdPv)}
          </span>
        </li>
      ))}
    </ul>
  );
}

function ProductRanking({
  rows,
  expanded,
  onToggle,
}: {
  rows: StoreRank[];
  expanded: string | null;
  onToggle: (code: string) => void;
}) {
  const medals = [rank1, rank2, rank3];
  return (
    <ul className="hd-ranking-list">
      {rows.map((row) => {
        const code = row.itemCode || '';
        const open = expanded === code;
        const image = GOODS[code];
        return (
          <li className="hd-ranking-item is-product" key={`${code}-${row.rank}`}>
            <div className={`hd-ranking-main is-expandable`} onClick={() => onToggle(code)}>
              {row.rank <= 3 ? (
                <img className="hd-rank-medal" src={medals[row.rank - 1]} alt="" />
              ) : (
                <div className="hd-rank-badge">{row.rank}</div>
              )}
              {image ? <img className="hd-product-thumb" src={image} alt="" /> : <span className="hd-product-thumb" />}
              <span className="hd-store-name" title={code}>
                {code}
              </span>
              <span className={`hd-store-amount ${row.rank <= 3 ? 'is-top' : 'is-normal'}`}>{int(row.goodsCount)}</span>
              <span className={`hd-product-expand${open ? ' is-open' : ''}`}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
            {open ? (
              <ul className="hd-spec-list">
                {(row.specSalesRank || []).map((spec, index) => (
                  <li className="hd-spec-item" key={`${code}-${index}`}>
                    {image ? <img className="hd-spec-thumb" src={image} alt="" /> : <span className="hd-spec-thumb" />}
                    <span className="hd-spec-name">{spec.specValue.map((item) => item.value).join(' / ')}</span>
                    <span className="hd-spec-count">{spec.goodsCount}</span>
                    <span className="hd-spec-progress">
                      <span className="hd-spec-progress-bar" style={{ width: `${Math.round(spec.ratio * 100)}%` }} />
                    </span>
                    <span className="hd-spec-ratio">{Math.round(spec.ratio * 100)}%</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function AnnouncementDialog({
  announcements,
  onClose,
}: {
  announcements: Announcement[];
  onClose: () => void;
}) {
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
            <span className={`hd-ann-tab${tab === 'notice' ? ' is-active' : ''}`} onClick={() => setTab('notice')}>
              公告
            </span>
            <span className={`hd-ann-tab${tab === 'history' ? ' is-active' : ''}`} onClick={() => setTab('history')}>
              历史公告
            </span>
          </div>
          <button type="button" className="hd-ann-close" aria-label="关闭" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="hd-ann-body">
          <ul className="hd-ann-list">
            {list.map((item) => (
              <li className="hd-ann-list-item" key={item.id}>
                <span className={`hd-announcement-tag${item.categoryName === '弹窗公告' ? ' is-popup' : ''}`}>
                  {item.categoryName}
                </span>
                <span className="hd-ann-list-title" title={item.title}>
                  {item.title}
                </span>
                <span className="hd-ann-list-date">{item.date}</span>
              </li>
            ))}
          </ul>
          <div className="hd-ann-pagination">
            <span>共 {total} 条</span>
            <button
              type="button"
              className="hd-ann-page-btn"
              disabled={page <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              aria-label="上一页"
            >
              ‹
            </button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((item) => (
              <button
                type="button"
                key={item}
                className={`hd-ann-page-btn${page === item ? ' is-active' : ''}`}
                onClick={() => setPage(item)}
              >
                {item}
              </button>
            ))}
            <button
              type="button"
              className="hd-ann-page-btn"
              disabled={page >= pageCount}
              onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
              aria-label="下一页"
            >
              ›
            </button>
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
          <button type="button" className="hd-alert-dialog-close" aria-label="关闭" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="hd-alert-dialog-body">
          <div className="hd-alert-section-head">
            <span className="hd-alert-section-title">平台订单状态</span>
            <span
              className={`hd-checkbox${selectAll || checked.length > 0 ? ' is-checked' : ''}`}
              onClick={toggleAll}
              role="checkbox"
              aria-checked={selectAll}
            >
              <span className="hd-checkbox-box">
                {selectAll || checked.length > 0 ? <Check size={10} strokeWidth={3} /> : null}
              </span>
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
          <button type="button" className="hd-btn is-default" onClick={onClose}>
            取消
          </button>
          <button type="button" className="hd-btn is-primary" onClick={onClose}>
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HomeDashboardPrototype() {
  const [trendPeriod, setTrendPeriod] = useState<TrendPeriod>('m1');
  const [storePeriod, setStorePeriod] = useState<'week' | 'month' | 'months3'>('week');
  const [trafficPeriod, setTrafficPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [productPeriod, setProductPeriod] = useState<'week' | 'month' | 'months3'>('week');
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [announcementOpen, setAnnouncementOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [promoIndex, setPromoIndex] = useState(1);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPromoIndex((value) => (value + 1) % PROMOS.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, []);

  const stats = DATA.orderStatistics;
  const abnormal = DATA.abnormal;

  const metrics = [
    { label: '当日销售额', prefix: '$', value: money(stats.sales.today).replace('$', ''), rate: stats.sales.rate },
    { label: '当日订单量', value: int(stats.orderCount.today), rate: stats.orderCount.rate },
    { label: '商品销量', value: int(stats.goodsNum.today), rate: stats.goodsNum.rate },
    { label: '当日退款金额', prefix: '$', value: money(stats.refund.today).replace('$', ''), rate: stats.refund.rate },
    { label: '当日退款单数', value: int(stats.refundCount.today), rate: stats.refundCount.rate },
  ];

  const alerts = [
    {
      title: '异常订单',
      count: abnormal.abnormalOrderCount,
      desc: '平台异常未处理的订单',
      tone: 'danger',
      icon: alertIcon1,
    },
    {
      title: '异常发货',
      count: abnormal.abnormalDeliveryCount,
      desc: '承诺发货截止时间的订单',
      tone: 'purple',
      icon: alertIcon2,
    },
    {
      title: '异常上网',
      count: abnormal.abnormalOnNetCount,
      desc: '有发货但无上网记录的订单',
      tone: 'green',
      icon: alertIcon3,
    },
    {
      title: '异常物流',
      count: abnormal.abnormalLogisticsCount,
      desc: '物流还未显示录入的订单',
      tone: 'orange',
      icon: alertIcon4,
    },
  ];

  const salesRanks = DATA.storeSales[storePeriod];
  const trafficRanks = DATA.storeTraffic[trafficPeriod];
  const productRanks = DATA.products[productPeriod];
  const announcements = useMemo(() => DATA.announcements.slice(0, 10), []);

  return (
    <div className="hd-page">
      <TopBar />
      <div className="hd-shell">
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
                  {metrics.map((metric) => (
                    <div className="hd-glass hd-metric-card" key={metric.label}>
                      <div className="hd-metric-top">
                        <img className="hd-metric-icon" src={metricIcon} alt="" />
                        <span className="hd-metric-label">{metric.label}</span>
                      </div>
                      <div className="hd-metric-value">
                        {metric.prefix ? <span className="hd-metric-prefix">{metric.prefix}</span> : null}
                        {metric.value}
                      </div>
                      <div className="hd-metric-compare">
                        <span className="hd-metric-compare-label">较昨日</span>
                        <span className={`hd-metric-compare-value ${metric.rate < 0 ? 'is-down' : 'is-up'}`}>
                          {metric.rate >= 0 ? '+' : ''}
                          {metric.rate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="hd-alerts-row">
                  {alerts.map((alert) => (
                    <div className={`hd-glass hd-alert-card ${alert.tone}`} key={alert.title}>
                      <img className="hd-alert-icon" src={alert.icon} alt="" />
                      <div className="hd-alert-body">
                        <div className="hd-alert-top">
                          <span className="hd-alert-title">{alert.title}</span>
                          <span className="hd-alert-count">
                            {alert.count}
                            单 <i>›</i>
                          </span>
                        </div>
                        <div className="hd-alert-bottom">
                          <span className="hd-alert-desc">{alert.desc}</span>
                          <span
                            className="hd-alert-setting"
                            onClick={(event) => {
                              event.stopPropagation();
                              setAlertOpen(true);
                            }}
                          >
                            设置
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="hd-glass hd-trend-card">
                  <div className="hd-card-header">
                    <div className="hd-card-title">销售趋势</div>
                    <Segmented
                      value={trendPeriod}
                      onChange={setTrendPeriod}
                      options={[
                        { key: 'm1', label: '近1月' },
                        { key: 'm3', label: '近3月' },
                        { key: 'm6', label: '近6月' },
                      ]}
                    />
                  </div>
                  <div className="hd-chart-body">
                    <TrendChart points={DATA.trends[trendPeriod]} period={trendPeriod} />
                  </div>
                </div>
              </div>

              <div className="hd-side-column">
                <div className="hd-glass hd-announcements-card">
                  <div className="hd-card-header">
                    <div className="hd-card-title">公告栏</div>
                    <span className="hd-view-all" onClick={() => setAnnouncementOpen(true)}>
                      查看全部
                      <i>›</i>
                    </span>
                  </div>
                  <ul className="hd-announcement-list">
                    {announcements.map((item) => (
                      <li className="hd-announcement-item" key={item.id} onClick={() => setAnnouncementOpen(true)}>
                        <span className={`hd-announcement-tag${item.categoryName === '弹窗公告' ? ' is-popup' : ''}`}>
                          {item.categoryName}
                        </span>
                        <span className="hd-announcement-text" title={item.title}>
                          {item.title}
                        </span>
                        <span className="hd-announcement-date">{item.date}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="hd-promo-card">
                  <div className="hd-promo-track" style={{ transform: `translateX(-${promoIndex * 100}%)` }}>
                    {PROMOS.map((promo) => (
                      <div className="hd-promo-slide" key={promo.alt}>
                        <img src={promo.src} alt={promo.alt} />
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="hd-promo-arrow is-left"
                    aria-label="上一张"
                    onClick={() => setPromoIndex((value) => (value - 1 + PROMOS.length) % PROMOS.length)}
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className="hd-promo-arrow is-right"
                    aria-label="下一张"
                    onClick={() => setPromoIndex((value) => (value + 1) % PROMOS.length)}
                  >
                    ›
                  </button>
                  <div className="hd-promo-dots">
                    {PROMOS.map((promo, index) => (
                      <button
                        type="button"
                        key={promo.alt}
                        className={`hd-promo-dot${index === promoIndex ? ' is-active' : ''}`}
                        aria-label={promo.alt}
                        onClick={() => setPromoIndex(index)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="hd-rankings-row">
              <div className="hd-glass hd-ranking-card">
                <div className="hd-card-header">
                  <div className="hd-card-title hd-ranking-title">店铺销量排行榜</div>
                  <Segmented
                    value={storePeriod}
                    onChange={setStorePeriod}
                    options={[
                      { key: 'week', label: '近1周' },
                      { key: 'month', label: '近1月' },
                      { key: 'months3', label: '近3月' },
                    ]}
                  />
                </div>
                <div className="hd-ranking-list-wrap">
                  <StoreRanking rows={salesRanks} valueKey="sales" />
                </div>
              </div>

              <div className="hd-glass hd-ranking-card">
                <div className="hd-card-header">
                  <div className="hd-card-title hd-ranking-title">店铺流量排行榜</div>
                  <Segmented
                    value={trafficPeriod}
                    onChange={setTrafficPeriod}
                    options={[
                      { key: 'day', label: '近1天' },
                      { key: 'week', label: '近7天' },
                      { key: 'month', label: '近30天' },
                    ]}
                  />
                </div>
                <div className="hd-ranking-list-wrap">
                  <StoreRanking rows={trafficRanks} valueKey="pdPv" />
                </div>
              </div>

              <div className="hd-glass hd-ranking-card">
                <div className="hd-card-header">
                  <div className="hd-card-title hd-ranking-title">商品销售排行榜</div>
                  <Segmented
                    value={productPeriod}
                    onChange={(value) => {
                      setProductPeriod(value);
                      setExpandedProduct(null);
                    }}
                    options={[
                      { key: 'week', label: '近1周' },
                      { key: 'month', label: '近1月' },
                      { key: 'months3', label: '近3月' },
                    ]}
                  />
                </div>
                <div className="hd-ranking-list-wrap">
                  <ProductRanking
                    rows={productRanks}
                    expanded={expandedProduct}
                    onToggle={(code) => setExpandedProduct((current) => (current === code ? null : code))}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hd-contact-float">
        {contactOpen ? (
          <div className="hd-contact-panel">
            <div className="hd-contact-panel-title">企业微信</div>
            <img className="hd-contact-qrcode" src={wecomQr} alt="企业微信二维码" />
            <div className="hd-contact-tip">扫码添加客服</div>
          </div>
        ) : null}
        <div className={`hd-contact-trigger${contactOpen ? ' is-active' : ''}`} onClick={() => setContactOpen((value) => !value)}>
          <Headset size={22} className="hd-contact-icon" />
          <span className="hd-contact-label">联系我们</span>
        </div>
      </div>

      {announcementOpen ? (
        <AnnouncementDialog announcements={DATA.announcements} onClose={() => setAnnouncementOpen(false)} />
      ) : null}
      {alertOpen ? <AlertSettingsDialog onClose={() => setAlertOpen(false)} /> : null}
    </div>
  );
}
