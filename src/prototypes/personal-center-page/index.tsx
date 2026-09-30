/**
 * @name 个人中心 - 骆驼队长BI
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import './style.css';
import { AnnotationViewer, type AnnotationSourceDocument } from '@axhub/annotation';
import annotationSourceDocument from './annotation-source.json';

// ===== Assets =====
const LOGO_URL =
  'https://yfg-saas-test.oss-cn-shenzhen.aliyuncs.com/images/34/2026-08/fb37c061-e967-4584-94a6-5fc4e316ad15.png';

const AVATAR_URL =
  'data:image/png;base64,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';

// ===== Icons =====
const Svg = ({ children, size = 14, stroke = 'currentColor', fill = 'none', width }: any) => (
  <svg
    width={width ?? size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke={stroke}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

const UserIcon = (p: any) => (
  <Svg {...p}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Svg>
);

const EditIcon = (p: any) => (
  <Svg {...p}>
    <path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
  </Svg>
);

const PhoneIcon = (p: any) => (
  <Svg {...p}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </Svg>
);

const MailIcon = (p: any) => (
  <Svg {...p}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </Svg>
);

const LockIcon = (p: any) => (
  <Svg {...p}>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </Svg>
);

const LinkIcon = (p: any) => (
  <Svg {...p}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </Svg>
);

const CheckIcon = (p: any) => (
  <Svg {...p}>
    <polyline points="20 6 9 17 4 12" />
  </Svg>
);

const CloseIcon = (p: any) => (
  <Svg {...p}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </Svg>
);

const SunIcon = (p: any) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </Svg>
);

const MenuBarsIcon = (p: any) => (
  <Svg {...p}>
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="18" x2="20" y2="18" />
  </Svg>
);

const QuestionIcon = (p: any) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </Svg>
);

const CrownIcon = (p: any) => (
  <Svg {...p} fill="currentColor" stroke="none">
    <path d="M2 18h20l-2-9-5 4-3-6-3 6-5-4z" />
  </Svg>
);

const ChevronDownIcon = (p: any) => (
  <Svg {...p}>
    <polyline points="6 9 12 15 18 9" />
  </Svg>
);

const HeadsetIcon = (p: any) => (
  <Svg {...p}>
    <path d="M3 11h3a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
    <path d="M18 11h3v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1z" />
    <path d="M3 11v-1a9 9 0 0 1 18 0v1" />
    <path d="M21 15v2a4 4 0 0 1-4 4h-5" />
  </Svg>
);

const BuildingIcon = (p: any) => (
  <Svg {...p}>
    <rect width="16" height="20" x="4" y="2" rx="2" />
    <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01" />
  </Svg>
);

const UsersIcon = (p: any) => (
  <Svg {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </Svg>
);

const CalendarIcon = (p: any) => (
  <Svg {...p}>
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </Svg>
);

const YuanIcon = (p: any) => (
  <Svg {...p}>
    <path d="M12 2 6.5 11M12 2l5.5 9M12 11v11M8 14h8M8 18h8" />
  </Svg>
);

const GiftIcon = (p: any) => (
  <Svg {...p}>
    <rect x="3" y="8" width="18" height="4" rx="1" />
    <path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
    <path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5" />
  </Svg>
);

// ===== Static data（均来自截图） =====
const NAV_ITEMS = ['首页', '商品', '交易', '采购', '物流', '报表', '系统', '工具箱', '即时咨询'];

const SIDE_MENUS = ['基础资料', '会员中心', '订单中心', '分销中心'];

const MEMBER_BADGE = { level: '铜牌会员', expire: '到期日：2026-10-13 23:59:59', id: 'ID: LT10035' };

const INVITE_CODE = 'L0TS9C';

const INFO_CELLS: { label: string; value: string; icon: React.ReactNode; tone: string }[] = [
  { label: '用户名称', value: 'ygq123456', icon: <UserIcon size={18} />, tone: 'blue' },
  { label: '用户昵称', value: '哈吉米', icon: <UsersIcon size={18} />, tone: 'green' },
  { label: '手机号码', value: '15638741517', icon: <PhoneIcon size={18} />, tone: 'orange' },
  { label: '用户邮箱', value: '439231674@qq.com', icon: <MailIcon size={18} />, tone: 'red' },
  { label: '所属部门', value: '暂无', icon: <BuildingIcon size={18} />, tone: 'gray' },
  { label: '所属角色', value: '暂无', icon: <UsersIcon size={18} />, tone: 'purple' },
  { label: '创建日期', value: '2026-04-29 16:20:54', icon: <CalendarIcon size={18} />, tone: 'teal' },
  { label: '算力余额', value: '1208', icon: <YuanIcon size={18} />, tone: 'amber' },
  { label: '积分', value: '19', icon: <YuanIcon size={18} />, tone: 'red' },
];

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

const STATS = [
  { label: '可用算力', value: 539 },
  { label: '冻结算力', value: 0 },
  { label: '累计充值算力', value: 500 },
  { label: '累计消费算力', value: 62 },
];

const MODULE_OPTIONS = ['充值', '消费', '退款', '调整'];
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

const ModalClockIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <polyline points="12 7 12 12 15 14" />
  </svg>
);

const ModalChevronDown = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ModalSearchIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <line x1="20" y1="20" x2="16.2" y2="16.2" />
  </svg>
);

const ModalResetIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 11a8 8 0 1 0-1.6 5.6" />
    <polyline points="20 5 20 11 14 11" />
  </svg>
);

const ModalArrowLeft = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="14 6 8 12 14 18" />
  </svg>
);

const ModalArrowRight = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="10 6 16 12 10 18" />
  </svg>
);

export default function PersonalCenterPage() {
  const [activeMenu, setActiveMenu] = useState('基础资料');
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [nickname, setNickname] = useState('哈吉米');
  const [phone, setPhone] = useState('15638741517');
  const [email, setEmail] = useState('439231674@qq.com');
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  const [detailOpen, setDetailOpen] = useState(false);
  const [dlModule, setDlModule] = useState('');
  const [dlStartDate, setDlStartDate] = useState('');
  const [dlEndDate, setDlEndDate] = useState('');
  const [dlQuery, setDlQuery] = useState({ module: '', start: '', end: '' });
  const [dlPage, setDlPage] = useState(1);
  const [dlPageSize, setDlPageSize] = useState(10);
  const [dlGoto, setDlGoto] = useState('');
  const [dlModuleOpen, setDlModuleOpen] = useState(false);
  const [dlSizeOpen, setDlSizeOpen] = useState(false);
  const [dlPriceOpen, setDlPriceOpen] = useState(false);

  const dlModuleRef = useRef<HTMLDivElement>(null);
  const dlSizeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!detailOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (dlPriceOpen) setDlPriceOpen(false);
        else setDetailOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [detailOpen, dlPriceOpen]);

  useEffect(() => {
    if (!dlModuleOpen && !dlSizeOpen) return;
    const handler = (e: MouseEvent) => {
      if (dlModuleOpen && dlModuleRef.current && !dlModuleRef.current.contains(e.target as Node)) setDlModuleOpen(false);
      if (dlSizeOpen && dlSizeRef.current && !dlSizeRef.current.contains(e.target as Node)) setDlSizeOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dlModuleOpen, dlSizeOpen]);

  const dlFiltered = useMemo(
    () =>
      LOGS.filter(
        (row) =>
          (!dlQuery.module || row.type === dlQuery.module) &&
          (!dlQuery.start || row.time.slice(0, 10) >= dlQuery.start) &&
          (!dlQuery.end || row.time.slice(0, 10) <= dlQuery.end)
      ),
    [dlQuery]
  );

  const dlPageCount = Math.max(1, Math.ceil(dlFiltered.length / dlPageSize));
  const dlCurrent = Math.min(dlPage, dlPageCount);
  const dlRows = dlFiltered.slice((dlCurrent - 1) * dlPageSize, dlCurrent * dlPageSize);
  const dlPageNumbers = Array.from({ length: dlPageCount }, (_, i) => i + 1);

  const onDlSearch = () => {
    setDlQuery({ module: dlModule, start: dlStartDate, end: dlEndDate });
    setDlPage(1);
  };

  const onDlReset = () => {
    setDlModule('');
    setDlStartDate('');
    setDlEndDate('');
    setDlQuery({ module: '', start: '', end: '' });
    setDlPage(1);
  };

  const onDlGoto = () => {
    const n = parseInt(dlGoto, 10);
    if (!Number.isNaN(n)) setDlPage(Math.min(Math.max(n, 1), dlPageCount));
    setDlGoto('');
  };

  const openDetail = () => {
    setDetailOpen(true);
    setDlModule('');
    setDlStartDate('');
    setDlEndDate('');
    setDlQuery({ module: '', start: '', end: '' });
    setDlPage(1);
    setDlPageSize(10);
    setDlGoto('');
    setDlPriceOpen(false);
  };

  return (
    <>
      <div className="pcp-shell">
            {/* ===== 顶部导航 ===== */}
            <header className="pcp-header">
              <div className="pcp-brand">
                <img className="pcp-brand-logo" src={LOGO_URL} alt="骆驼队长" />
                <span className="pcp-brand-sub">智慧运营中台（公测版）</span>
                <span className="pcp-brand-divider">|</span>
              </div>
              <nav className="pcp-nav">
                {NAV_ITEMS.map((item) => (
                  <button key={item} type="button" className="pcp-nav-item">
                    {item}
                  </button>
                ))}
              </nav>
              <div className="pcp-header-right">
                <button type="button" className="pcp-header-icon" title="亮度"><SunIcon size={17} /></button>
                <button type="button" className="pcp-header-icon" title="菜单"><MenuBarsIcon size={17} /></button>
                <button type="button" className="pcp-header-icon" title="帮助"><QuestionIcon size={17} /></button>
                <span className="pcp-vip">
                  <CrownIcon size={12} />
                  VIP1
                </span>
                <span className="pcp-header-avatar">Y</span>
                <button type="button" className="pcp-header-icon pcp-header-caret"><ChevronDownIcon size={12} /></button>
              </div>
            </header>
      
            {/* ===== 面包屑 ===== */}
            <div className="pcp-breadcrumb">个人中心</div>
      
            {/* ===== 主体 ===== */}
            <div className="pcp-body">
              {/* 左侧菜单 */}
              <aside className="pcp-side">
                {SIDE_MENUS.map((menu) => (
                  <div
                    key={menu}
                    className={'pcp-side-item' + (activeMenu === menu ? ' is-active' : '')}
                    onClick={() => setActiveMenu(menu)}
                  >
                    {menu}
                  </div>
                ))}
              </aside>
      
              {/* 中部个人信息卡 */}
              <section className="pcp-profile-card">
                <div className="pcp-banner" />
                <div className="pcp-profile-main">
                  <img className="pcp-avatar" src={AVATAR_URL} alt="avatar" />
                  <div className="pcp-nickname">哈吉米</div>
                  <div className="pcp-member-badge">
                    <span className="pcp-member-level">{MEMBER_BADGE.level}</span>
                    <span className="pcp-member-expire">{MEMBER_BADGE.expire}</span>
                    <span className="pcp-member-id">{MEMBER_BADGE.id}</span>
                  </div>
      
                  <div className="pcp-invite">
                    <div className="pcp-invite-left">
                      <span className="pcp-invite-icon"><LinkIcon size={18} /></span>
                      <div className="pcp-invite-text">
                        <div className="pcp-invite-label">我的邀请码</div>
                        <div className="pcp-invite-code">{INVITE_CODE}</div>
                      </div>
                    </div>
                    <button type="button" className="pcp-btn pcp-btn--primary pcp-btn--sm">
                      <LinkIcon size={12} />
                      生成推广链接
                    </button>
                  </div>
      
                  <div className="pcp-info-grid">
                    {INFO_CELLS.map((cell) => (
                      <div key={cell.label} className="pcp-info-cell">
                        <span className={'pcp-info-icon is-' + cell.tone}>{cell.icon}</span>
                        <div className="pcp-info-text">
                          <div className="pcp-info-label">{cell.label}:</div>
                          <div className="pcp-info-value">{cell.value}</div>
                        </div>
                        {cell.label === '算力余额' && (
                          <button type="button" className="pcp-detail-btn" data-annotation-id="compute-detail-btn" onClick={openDetail}>
                            算力明细
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
      
              {/* 右侧表单卡 */}
              <section className="pcp-form-card">
                <div className="pcp-tabs">
                  <div
                    className={'pcp-tab' + (activeTab === 'profile' ? ' is-active' : '')}
                    onClick={() => setActiveTab('profile')}
                  >
                    基本资料
                  </div>
                  <div
                    className={'pcp-tab' + (activeTab === 'password' ? ' is-active' : '')}
                    onClick={() => setActiveTab('password')}
                  >
                    修改密码
                  </div>
                </div>
      
                {activeTab === 'profile' ? (
                  <div className="pcp-form">
                    <div className="pcp-form-item">
                      <label className="pcp-form-label is-required">用户名称</label>
                      <div className="pcp-input is-disabled">
                        <span className="pcp-input-icon"><UserIcon size={14} /></span>
                        <input className="pcp-input-el" value="ygq123456" disabled />
                        <span className="pcp-input-icon pcp-input-icon--right"><LockIcon size={14} /></span>
                      </div>
                    </div>
                    <div className="pcp-form-item">
                      <label className="pcp-form-label">用户昵称</label>
                      <div className="pcp-input">
                        <span className="pcp-input-icon pcp-input-icon--right"><EditIcon size={14} /></span>
                        <input className="pcp-input-el" value={nickname} onChange={(e) => setNickname(e.target.value)} />
                      </div>
                    </div>
                    <div className="pcp-form-item">
                      <label className="pcp-form-label is-required">手机号码</label>
                      <div className="pcp-input">
                        <span className="pcp-input-icon"><PhoneIcon size={14} /></span>
                        <input className="pcp-input-el" value={phone} onChange={(e) => setPhone(e.target.value)} />
                      </div>
                    </div>
                    <div className="pcp-form-item">
                      <label className="pcp-form-label is-required">邮箱</label>
                      <div className="pcp-input">
                        <span className="pcp-input-icon"><MailIcon size={14} /></span>
                        <input className="pcp-input-el" value={email} onChange={(e) => setEmail(e.target.value)} />
                      </div>
                    </div>
                    <div className="pcp-form-divider" />
                    <div className="pcp-form-actions">
                      <button type="button" className="pcp-btn pcp-btn--primary">
                        <CheckIcon size={13} />
                        保存
                      </button>
                      <button type="button" className="pcp-btn">
                        <CloseIcon size={13} />
                        关闭
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pcp-form">
                    <div className="pcp-form-item">
                      <label className="pcp-form-label is-required">旧密码</label>
                      <div className="pcp-input">
                        <span className="pcp-input-icon"><LockIcon size={14} /></span>
                        <input className="pcp-input-el" type="password" placeholder="请输入旧密码" value={oldPwd} onChange={(e) => setOldPwd(e.target.value)} />
                      </div>
                    </div>
                    <div className="pcp-form-item">
                      <label className="pcp-form-label is-required">新密码</label>
                      <div className="pcp-input">
                        <span className="pcp-input-icon"><LockIcon size={14} /></span>
                        <input className="pcp-input-el" type="password" placeholder="请输入新密码" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} />
                      </div>
                    </div>
                    <div className="pcp-form-item">
                      <label className="pcp-form-label is-required">确认密码</label>
                      <div className="pcp-input">
                        <span className="pcp-input-icon"><LockIcon size={14} /></span>
                        <input className="pcp-input-el" type="password" placeholder="请再次输入新密码" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} />
                      </div>
                    </div>
                    <div className="pcp-form-divider" />
                    <div className="pcp-form-actions">
                      <button type="button" className="pcp-btn pcp-btn--primary">
                        <CheckIcon size={13} />
                        保存
                      </button>
                      <button type="button" className="pcp-btn">
                        <CloseIcon size={13} />
                        关闭
                      </button>
                    </div>
                  </div>
                )}
              </section>
            </div>
      
            {/* ===== 算力明细弹窗 ===== */}
            {detailOpen && (
              <div className="pcp-modal-mask" onClick={() => setDetailOpen(false)}>
                <div className="pcp-modal" onClick={(e) => e.stopPropagation()}>
                  <div className="pcp-modal-header">
                    <span className="pcp-modal-title">算力明细</span>
                    <button className="pcp-modal-close" onClick={() => setDetailOpen(false)}>
                      <CloseIcon size={16} />
                    </button>
                  </div>
                  <div className="pcp-modal-body">
                    {/* 统计概览 */}
                    <div className="pcp-dl-stats">
                      {STATS.map((s) => (
                        <div className="pcp-dl-stat" key={s.label}>
                          <div className="pcp-dl-stat-label">{s.label}</div>
                          <div className="pcp-dl-stat-value">{fmtNum(s.value)}</div>
                        </div>
                      ))}
                    </div>
      
                    {/* 筛选区 */}
                    <div className="pcp-dl-filter">
                      <span className="pcp-dl-label">变动时间</span>
                      <div className="pcp-dl-date-range">
                        <span className="pcp-dl-date-icon"><ModalClockIcon /></span>
                        <span className={`pcp-dl-date-half${dlStartDate ? ' set' : ''}`}>{dlStartDate || '开始日期'}</span>
                        <span className="pcp-dl-date-to">至</span>
                        <span className={`pcp-dl-date-half${dlEndDate ? ' set' : ''}`}>{dlEndDate || '结束日期'}</span>
                        <input
                          className="pcp-dl-date-input start"
                          type="date"
                          value={dlStartDate}
                          onChange={(e) => setDlStartDate(e.target.value)}
                        />
                        <input
                          className="pcp-dl-date-input end"
                          type="date"
                          value={dlEndDate}
                          onChange={(e) => setDlEndDate(e.target.value)}
                        />
                      </div>
      
                      <span className="pcp-dl-label">类型</span>
                      <div className="pcp-dl-select-wrap" ref={dlModuleRef}>
                        <div
                          className={`pcp-dl-select${dlModule ? ' has' : ''}${dlModuleOpen ? ' open' : ''}`}
                          onClick={() => setDlModuleOpen((v) => !v)}
                        >
                          <span>{dlModule || '请选择类型'}</span>
                          <span className="pcp-dl-select-arrow"><ModalChevronDown /></span>
                        </div>
                        {dlModuleOpen && (
                          <div className="pcp-dl-dropdown">
                            {MODULE_OPTIONS.map((opt) => (
                              <div
                                key={opt}
                                className={`pcp-dl-option${dlModule === opt ? ' active' : ''}`}
                                onClick={() => {
                                  setDlModule(opt);
                                  setDlModuleOpen(false);
                                }}
                              >
                                {opt}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
      
                      <button className="pcp-dl-btn pcp-dl-btn-primary" onClick={onDlSearch}>
                        <ModalSearchIcon />
                        搜索
                      </button>
                      <button className="pcp-dl-btn pcp-dl-btn-plain" onClick={onDlReset}>
                        <ModalResetIcon />
                        重置
                      </button>
                      <button className="pcp-dl-btn pcp-dl-btn-plain pcp-dl-btn-price" onClick={() => setDlPriceOpen(true)}>
                        算力定价
                      </button>
                    </div>
      
                    {/* 表格 */}
                    <table className="pcp-dl-table">
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
                        {dlRows.length === 0 ? (
                          <tr>
                            <td className="pcp-dl-empty" colSpan={6}>暂无数据</td>
                          </tr>
                        ) : (
                          dlRows.map((row) => (
                            <tr key={row.id}>
                              <td className="pcp-dl-c">{row.time}</td>
                              <td className="pcp-dl-c">{row.type}</td>
                              <td className={`pcp-dl-c ${row.change > 0 ? 'pcp-dl-up' : 'pcp-dl-down'}`}>{fmtChange(row.change)}</td>
                              <td className="pcp-dl-c">{fmtNum(row.before)}</td>
                              <td className="pcp-dl-c">{fmtNum(row.after)}</td>
                              <td className="pcp-dl-r" title={row.remark}>{row.remark}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
      
                    {/* 分页 */}
                    <div className="pcp-dl-pager">
                      <span>共 {dlFiltered.length} 条</span>
                      <div className="pcp-dl-size-select" ref={dlSizeRef}>
                        <div
                          className={`pcp-dl-select${dlSizeOpen ? ' open' : ''}`}
                          style={{ width: '96px', height: '30px', fontSize: '14px' }}
                          onClick={() => setDlSizeOpen((v) => !v)}
                        >
                          <span>{PAGE_SIZES[(dlPageSize === 10 ? 0 : dlPageSize === 20 ? 1 : 2)]}</span>
                          <span className="pcp-dl-select-arrow"><ModalChevronDown size={12} /></span>
                        </div>
                        {dlSizeOpen && (
                          <div className="pcp-dl-dropdown">
                            {PAGE_SIZES.map((size, idx) => (
                              <div
                                key={size}
                                className={`pcp-dl-option${dlPageSize === (idx === 0 ? 10 : idx === 1 ? 20 : 50) ? ' active' : ''}`}
                                onClick={() => {
                                  setDlPageSize(idx === 0 ? 10 : idx === 1 ? 20 : 50);
                                  setDlSizeOpen(false);
                                  setDlPage(1);
                                }}
                              >
                                {size}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
      
                      <div className="pcp-dl-page-group">
                        <button className="pcp-dl-page-btn arrow" disabled={dlCurrent <= 1} onClick={() => setDlPage(dlCurrent - 1)}>
                          <ModalArrowLeft />
                        </button>
                        {dlPageNumbers.map((n) => (
                          <button
                            key={n}
                            className={`pcp-dl-page-btn${n === dlCurrent ? ' active' : ''}`}
                            onClick={() => setDlPage(n)}
                          >
                            {n}
                          </button>
                        ))}
                        <button className="pcp-dl-page-btn arrow" disabled={dlCurrent >= dlPageCount} onClick={() => setDlPage(dlCurrent + 1)}>
                          <ModalArrowRight />
                        </button>
                      </div>
      
                      <span className="pcp-dl-goto">
                        前往
                        <input
                          value={dlGoto}
                          onChange={(e) => setDlGoto(e.target.value.replace(/\D/g, ''))}
                          onKeyDown={(e) => e.key === 'Enter' && onDlGoto()}
                          onBlur={onDlGoto}
                        />
                        页
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
      
            {/* ===== 算力定价弹窗 ===== */}
            {dlPriceOpen && (
              <div className="pcp-modal-mask pcp-modal-mask-inner" onClick={() => setDlPriceOpen(false)}>
                <div className="pcp-modal pcp-modal-sm" onClick={(e) => e.stopPropagation()}>
                  <div className="pcp-modal-header">
                    <span className="pcp-modal-title">算力定价</span>
                    <button className="pcp-modal-close" onClick={() => setDlPriceOpen(false)}>
                      <CloseIcon size={16} />
                    </button>
                  </div>
                  <div className="pcp-modal-body">
                    <table className="pcp-dl-table pcp-dl-price-table">
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
                            <td>{row.note}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
      
            {/* ===== 联系我们悬浮入口 ===== */}
            <div className="pcp-contact">
              <span className="pcp-contact-icon"><HeadsetIcon size={18} /></span>
              <span className="pcp-contact-text">联系我们</span>
            </div>
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
              : "personal-center-page";
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
