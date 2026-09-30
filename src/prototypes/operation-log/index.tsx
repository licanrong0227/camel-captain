/**
 * @name 操作日志 - 骆驼队长BI
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import './style.css';
import logo from './assets/logo-mark.png';
import { AnnotationViewer, type AnnotationSourceDocument } from '@axhub/annotation';
import annotationSourceDocument from './annotation-source.json';

// ===== Icons =====
const ClockIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <polyline points="12 7 12 12 15 14" />
  </svg>
);

const ChevronDown = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const SearchIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <line x1="20" y1="20" x2="16.2" y2="16.2" />
  </svg>
);

const ResetIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 11a8 8 0 1 0-1.6 5.6" />
    <polyline points="20 5 20 11 14 11" />
  </svg>
);

const ArrowLeft = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="14 6 8 12 14 18" />
  </svg>
);

const ArrowRight = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="10 6 16 12 10 18" />
  </svg>
);

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.2 5.2l1.7 1.7M17.1 17.1l1.7 1.7M18.8 5.2l-1.7 1.7M6.9 17.1l-1.7 1.7" />
  </svg>
);

const MenuIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <line x1="4" y1="7" x2="20" y2="7" />
    <line x1="4" y1="12" x2="16" y2="12" />
    <line x1="4" y1="17" x2="20" y2="17" />
  </svg>
);

const HelpIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M9.6 9.4a2.5 2.5 0 1 1 3.2 2.4c-.6.2-.9.7-.9 1.3v.5" />
    <circle cx="12" cy="16.8" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);

const CrownIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="#f9b739">
    <path d="M3 7.5l4.2 3.8L12 4.5l4.8 6.8L21 7.5l-1.6 10.2H4.6L3 7.5z" />
  </svg>
);

const CaretDown = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 9l6 6 6-6z" />
  </svg>
);

const HeadsetIcon = () => (
  <svg width="22" height="22" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="16" fill="#ff781f" />
    <path d="M8.5 17v-2a7.5 7.5 0 0 1 15 0v2" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    <rect x="6.6" y="16" width="4.2" height="6.6" rx="2.1" fill="#fff" />
    <rect x="21.2" y="16" width="4.2" height="6.6" rx="2.1" fill="#fff" />
    <path d="M23.3 22.4v.7a2.6 2.6 0 0 1-2.6 2.6h-2.6" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <line x1="6" y1="6" x2="18" y2="18" />
    <line x1="18" y1="6" x2="6" y2="18" />
  </svg>
);

// ===== 数据 =====
type LogRow = {
  id: number;
  time: string;
  type: string;
  change: number;
  before: number;
  after: number;
  remark: string;
};

const LOGS: LogRow[] = [
  { id: 1061, time: '2026-09-02 16:38:12', type: '充值', change: 500, before: 39, after: 539, remark: '会员升级订单20260902DDSS12004发放算力' },
  { id: 1060, time: '2026-09-02 14:34:30', type: '消费', change: -1, before: 40, after: 39, remark: '图片抠图消费' },
  { id: 1059, time: '2026-09-02 14:34:18', type: '消费', change: -1, before: 41, after: 40, remark: '图片抠图消费' },
  { id: 1058, time: '2026-09-02 14:29:57', type: '消费', change: -1, before: 42, after: 41, remark: '转白底图消费' },
  { id: 1057, time: '2026-09-02 14:15:43', type: '消费', change: -3, before: 45, after: 42, remark: '图片智能消除消费' },
  { id: 1056, time: '2026-09-02 14:14:39', type: '消费', change: -3, before: 48, after: 45, remark: '图片智能消除消费' },
  { id: 1055, time: '2026-09-02 14:11:26', type: '消费', change: -3, before: 51, after: 48, remark: '图片智能消除消费' },
  { id: 1054, time: '2026-09-02 13:58:02', type: '消费', change: -3, before: 54, after: 51, remark: '图片智能消除消费' },
  { id: 1053, time: '2026-09-02 13:47:15', type: '消费', change: -1, before: 55, after: 54, remark: '图片抠图消费' },
  { id: 1052, time: '2026-09-02 13:32:48', type: '消费', change: -1, before: 56, after: 55, remark: '转白底图消费' },
  { id: 1051, time: '2026-09-02 11:26:09', type: '消费', change: -3, before: 59, after: 56, remark: '图片智能消除消费' },
  { id: 1050, time: '2026-09-02 10:54:37', type: '充值', change: 50, before: 9, after: 59, remark: '算力充值订单20260902CZ884512到账' },
  { id: 1049, time: '2026-09-02 10:21:55', type: '消费', change: -1, before: 10, after: 9, remark: '图片抠图消费' },
  { id: 1048, time: '2026-09-02 09:48:31', type: '消费', change: -3, before: 13, after: 10, remark: '图片智能消除消费' },
  { id: 1047, time: '2026-09-02 09:35:12', type: '消费', change: -1, before: 14, after: 13, remark: '转白底图消费' },
  { id: 1046, time: '2026-09-01 18:22:07', type: '消费', change: -1, before: 15, after: 14, remark: '图片抠图消费' },
];

const NAV_ITEMS = ['首页', '商品', '交易', '采购', '物流', '报表', '系统', '工具箱', '即时咨询'];

const STATS = [
  { label: '可用算力', value: 539 },
  { label: '冻结算力', value: 0 },
  { label: '累计充值算力', value: 500 },
  { label: '累计消费算力', value: 62 },
];
const MODULE_OPTIONS = ['充值', '消费'];
const PAGE_SIZES = ['10条/页', '20条/页', '50条/页'];

type PriceRow = { name: string; cost: string; note: string };

const PRICING: PriceRow[] = [
  { name: '去水印Pro', cost: '1', note: '无' },
  { name: '消除笔', cost: '2', note: '消除后撤销不扣算力点' },
  { name: '去水印', cost: '3', note: '无' },
  { name: '转白底', cost: '1', note: '无' },
  { name: 'AI短描生成', cost: '1', note: '无' },
  { name: 'AI关键词生成', cost: '0.5', note: '无' },
  { name: 'AI标题生成', cost: '1', note: '无' },
  { name: '抠图', cost: '1', note: '无' },
];

const fmtNum = (n: number) => n.toFixed(2);
const fmtChange = (n: number) => (n > 0 ? `+${n.toFixed(2)}` : n.toFixed(2));

// ===== 系统导航下拉菜单 =====
const menuIconProps = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const IconOrderReport = () => (
  <svg {...menuIconProps}>
    <path d="M6 3.5h7.5L18 8v12.5H6z" />
    <path d="M13.5 3.5V8H18" />
    <path d="M9 12h6M9 15.4h6M9 8.6h3" />
  </svg>
);

const IconShopBoard = () => (
  <svg {...menuIconProps}>
    <path d="M4 9.5h16v9.5H4z" />
    <path d="M4 9.5 5.6 5h12.8L20 9.5" />
    <path d="M9.6 19v-5h4.8v5" />
  </svg>
);

const IconPoints = () => (
  <svg {...menuIconProps}>
    <circle cx="12" cy="12" r="8.2" />
    <path d="M12 7.2v9.6M14.6 9.4c-.5-.8-1.4-1.2-2.6-1.2-1.6 0-2.6.8-2.6 1.9 0 2.7 5.2 1.4 5.2 4.1 0 1.2-1.1 2-2.7 2-1.3 0-2.2-.4-2.8-1.3" />
  </svg>
);

const NAV_MENUS = [
  { title: '订单', items: [{ label: '订单明细报表', icon: <IconOrderReport /> }] },
  { title: '店铺', items: [{ label: '店铺看板', icon: <IconShopBoard /> }] },
  { title: '运营', items: [{ label: '算力明细', icon: <IconPoints /> }] },
];

function useOutsideClose(ref: React.RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, onClose]);
}

export default function OperationLog() {
  const [module, setModule] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [query, setQuery] = useState({ module: '', start: '', end: '' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [goto, setGoto] = useState('');
  const [moduleOpen, setModuleOpen] = useState(false);
  const [sizeOpen, setSizeOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);

  useEffect(() => {
    if (!priceOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setPriceOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [priceOpen]);

  const moduleRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef<HTMLDivElement>(null);
  useOutsideClose(moduleRef, () => setModuleOpen(false));
  useOutsideClose(sizeRef, () => setSizeOpen(false));

  const filtered = useMemo(
    () =>
      LOGS.filter(
        (row) =>
          (!query.module || row.type === query.module) &&
          (!query.start || row.time.slice(0, 10) >= query.start) &&
          (!query.end || row.time.slice(0, 10) <= query.end)
      ),
    [query]
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pageCount);
  const rows = filtered.slice((current - 1) * pageSize, current * pageSize);
  const pageNumbers = Array.from({ length: pageCount }, (_, i) => i + 1);

  const onSearch = () => {
    setQuery({ module, start: startDate, end: endDate });
    setPage(1);
  };

  const onReset = () => {
    setModule('');
    setStartDate('');
    setEndDate('');
    setQuery({ module: '', start: '', end: '' });
    setPage(1);
  };

  const onGoto = () => {
    const n = parseInt(goto, 10);
    if (!Number.isNaN(n)) setPage(Math.min(Math.max(n, 1), pageCount));
    setGoto('');
  };

  return (
    <>
      <div className="ol-page">
            {/* 顶栏 */}
            <header className="ol-header">
              <div className="ol-brand">
                <img className="ol-logo" src={logo} alt="logo" />
                <span className="ol-brand-name">骆驼队长</span>
                <span className="ol-brand-sub">智慧运营中台（公测版）</span>
              </div>
              <span className="ol-sep-v" />
              <nav className="ol-nav">
                {NAV_ITEMS.map((item) =>
                  item === '报表' ? (
                    <div className="ol-nav-group" key={item}>
                      <span className="ol-nav-item solid">报表</span>
                      <div className="ol-nav-menu">
                        {NAV_MENUS.map((group) => (
                          <div className="ol-nav-menu-group" key={group.title}>
                            <div className="ol-nav-menu-title">{group.title}</div>
                            <div className="ol-nav-menu-items">
                              {group.items.map((mi) => (
                                <span
                                  className={`ol-nav-menu-item${mi.label === '算力明细' ? ' active' : ''}`}
                                  key={mi.label}
                                >
                                  <i className="ol-nav-menu-ico">{mi.icon}</i>
                                  {mi.label}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <span
                      key={item}
                      className={`ol-nav-item${item === '系统' ? ' plain' : ''}`}
                    >
                      {item}
                    </span>
                  )
                )}
              </nav>
              <div className="ol-tools">
                <span className="ol-tool"><SunIcon /></span>
                <span className="ol-tool"><MenuIcon /></span>
                <span className="ol-tool"><HelpIcon /></span>
                <span className="ol-vip"><CrownIcon />VIP1</span>
                <span className="ol-user">
                  <span className="ol-avatar">Y</span>
                  <span className="ol-caret"><CaretDown /></span>
                </span>
              </div>
            </header>
      
            {/* 面包屑 */}
            <div className="ol-crumb">
              <span>报表</span>
              <span className="ol-crumb-sep">/</span>
              <span>运营</span>
              <span className="ol-crumb-sep">/</span>
              <span className="ol-crumb-cur">算力明细</span>
            </div>
      
            {/* 内容卡片 */}
            <section className="ol-card">
              {/* 统计概览 */}
              <div className="ol-stats">
                {STATS.map((s) => (
                  <div className="ol-stat" key={s.label}>
                    <div className="ol-stat-label">{s.label}</div>
                    <div className="ol-stat-value">{fmtNum(s.value)}</div>
                  </div>
                ))}
              </div>
      
              {/* 筛选区 */}
              <div className="ol-filter">
                <span className="ol-label">变动时间</span>
                <div className="ol-date-range">
                  <span className="ol-date-icon"><ClockIcon /></span>
                  <span className={`ol-date-half${startDate ? ' set' : ''}`}>{startDate || '开始日期'}</span>
                  <span className="ol-date-to">至</span>
                  <span className={`ol-date-half${endDate ? ' set' : ''}`}>{endDate || '结束日期'}</span>
                  <input
                    className="ol-date-input start"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    aria-label="开始日期"
                  />
                  <input
                    className="ol-date-input end"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    aria-label="结束日期"
                  />
                </div>
      
                <span className="ol-label">类型</span>
                <div className="ol-select-wrap" ref={moduleRef}>
                  <div
                    className={`ol-select${module ? ' has' : ''}${moduleOpen ? ' open' : ''}`}
                    onClick={() => setModuleOpen((v) => !v)}
                  >
                    <span>{module || '请选择类型'}</span>
                    <span className="ol-select-arrow"><ChevronDown /></span>
                  </div>
                  {moduleOpen && (
                    <div className="ol-dropdown">
                      {MODULE_OPTIONS.map((opt) => (
                        <div
                          key={opt}
                          className={`ol-option${module === opt ? ' active' : ''}`}
                          onClick={() => {
                            setModule(opt);
                            setModuleOpen(false);
                          }}
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
      
                <button className="ol-btn ol-btn-primary" onClick={onSearch}>
                  <SearchIcon />
                  搜索
                </button>
                <button className="ol-btn ol-btn-plain" onClick={onReset}>
                  <ResetIcon />
                  重置
                </button>
                <button className="ol-btn ol-btn-plain ol-btn-price" onClick={() => setPriceOpen(true)}>
                  算力定价
                </button>
              </div>
      
              {/* 表格 */}
              <table className="ol-table ol-table-points">
                <colgroup>
                  <col style={{ width: '190px' }} />
                  <col style={{ width: '90px' }} />
                  <col style={{ width: '110px' }} />
                  <col style={{ width: '100px' }} />
                  <col style={{ width: '100px' }} />
                  <col />
                </colgroup>
                <thead>
                  <tr>
                    <th>时间</th>
                    <th>类型</th>
                    <th>变动算力</th>
                    <th>变动前</th>
                    <th>变动后</th>
                    <th>备注</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td className="ol-empty" colSpan={6}>
                        暂无数据
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr key={row.id}>
                        <td className="ol-c">{row.time}</td>
                        <td className="ol-c">{row.type}</td>
                        <td className={`ol-c ${row.change > 0 ? 'ol-up' : 'ol-down'}`}>{fmtChange(row.change)}</td>
                        <td className="ol-c">{fmtNum(row.before)}</td>
                        <td className="ol-c">{fmtNum(row.after)}</td>
                        <td className="ol-r" title={row.remark}>
                          {row.remark}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
      
              {/* 分页 */}
              <div className="ol-pager">
                <span>共 {filtered.length} 条</span>
                <div className="ol-size-select" ref={sizeRef}>
                  <div
                    className={`ol-select${sizeOpen ? ' open' : ''}`}
                    style={{ width: '96px', height: '30px', fontSize: '13px' }}
                    onClick={() => setSizeOpen((v) => !v)}
                  >
                    <span>{PAGE_SIZES[(pageSize === 10 ? 0 : pageSize === 20 ? 1 : 2)]}</span>
                    <span className="ol-select-arrow"><ChevronDown size={12} /></span>
                  </div>
                  {sizeOpen && (
                    <div className="ol-dropdown">
                      {PAGE_SIZES.map((size, idx) => (
                        <div
                          key={size}
                          className={`ol-option${pageSize === (idx === 0 ? 10 : idx === 1 ? 20 : 50) ? ' active' : ''}`}
                          onClick={() => {
                            setPageSize(idx === 0 ? 10 : idx === 1 ? 20 : 50);
                            setSizeOpen(false);
                            setPage(1);
                          }}
                        >
                          {size}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
      
                <button className="ol-page-btn arrow" disabled={current <= 1} onClick={() => setPage(current - 1)}>
                  <ArrowLeft />
                </button>
                {pageNumbers.map((n) => (
                  <button
                    key={n}
                    className={`ol-page-btn${n === current ? ' active' : ''}`}
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </button>
                ))}
                <button className="ol-page-btn arrow" disabled={current >= pageCount} onClick={() => setPage(current + 1)}>
                  <ArrowRight />
                </button>
      
                <span className="ol-goto">
                  前往
                  <input
                    value={goto}
                    onChange={(e) => setGoto(e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => e.key === 'Enter' && onGoto()}
                    onBlur={onGoto}
                  />
                  页
                </span>
              </div>
            </section>
      
            {/* 算力定价弹窗 */}
            {priceOpen && (
              <div className="ol-modal-mask" onClick={() => setPriceOpen(false)}>
                <div className="ol-modal" onClick={(e) => e.stopPropagation()}>
                  <div className="ol-modal-header">
                    <span className="ol-modal-title">算力定价</span>
                    <button className="ol-modal-close" aria-label="关闭" onClick={() => setPriceOpen(false)}>
                      <CloseIcon />
                    </button>
                  </div>
                  <div className="ol-modal-body">
                    <table className="ol-table ol-price-table">
                      <colgroup>
                        <col style={{ width: '30%' }} />
                        <col style={{ width: '30%' }} />
                        <col />
                      </colgroup>
                      <thead>
                        <tr>
                          <th>产品名称</th>
                          <th>单次算力消耗点</th>
                          <th>特殊说明</th>
                        </tr>
                      </thead>
                      <tbody>
                        {PRICING.map((row) => (
                          <tr key={row.name}>
                            <td>{row.name}</td>
                            <td>{row.cost}</td>
                            <td className={row.note === '无' ? '' : 'ol-price-note'}>{row.note}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
      
            {/* 联系我们 */}
            {contactOpen && (
              <div className="ol-contact-panel">
                <h4>联系客服</h4>
                工作日 9:00 - 18:00 在线，扫码或拨打 400-800-1234 获取技术支持。
              </div>
            )}
            <button className="ol-contact">
              <HeadsetIcon />
              <span>联系我们</span>
            </button>
          </div>
      <AnnotationViewer
        source={annotationSourceDocument as unknown as AnnotationSourceDocument}
        options={{
          currentPageId: (() => {
            const hashPageId = new URLSearchParams(window.location.hash.replace(/^#/, '')).get('page');
            const searchPageId = new URLSearchParams(window.location.search.replace(/^\?/, '')).get('page');
            const pageId = hashPageId || searchPageId;
            return typeof pageId === 'string' && /^[a-z0-9-]+$/u.test(pageId)
              ? pageId
              : "operation-log";
          })(),
          onDirectoryRoute: (node) => {
            if (typeof node.route === 'string' && /^[a-z0-9-]+$/u.test(node.route)) {
              window.location.hash = `page=${node.route}`;
            }
          },
          toolbarEdge: 'right',
          showToolbar: true,
          showThemeToggle: true,
          showColorFilter: true,
          emptyWhenNoData: true,
        }}
      />
    </>
  );
}
