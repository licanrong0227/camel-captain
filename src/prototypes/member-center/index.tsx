/**
 * @name 个人中心 - 会员中心（我的权益 / 优惠券）
 */

import React, { useEffect, useRef, useState } from 'react';
import './style.css';

const LOGO_URL =
  'https://yfg-saas-test.oss-cn-shenzhen.aliyuncs.com/images/34/2026-08/fb37c061-e967-4584-94a6-5fc4e316ad15.png';

/* ===== 图标 ===== */
const Svg = ({
  children,
  size = 16,
  viewBox = '0 0 24 24',
  fill = 'none',
  stroke = 'currentColor',
  strokeWidth = 2,
}: any) => (
  <svg
    width={size}
    height={size}
    viewBox={viewBox}
    fill={fill}
    stroke={stroke}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const MedalIcon = () => (
  <svg className="mcx-member-status-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M7.2 2h9.6l-1.4 5.2H8.6L7.2 2Z" opacity="0.45" />
    <path d="M8.6 7.2 7.2 2H4l2.3 6.4 2.3-1.2Zm6.8 0L16.8 2H20l-2.3 6.4-2.3-1.2Z" opacity="0.3" />
    <circle cx="12" cy="14.5" r="6.3" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="m12 11.2.95 1.93 2.13.31-1.54 1.5.36 2.12L12 16.06l-1.9 1 .36-2.12-1.54-1.5 2.13-.31L12 11.2Z" />
  </svg>
);

const CheckCircleIcon = () => (
  <Svg size={12} viewBox="0 0 12 12">
    <circle cx="6" cy="6" r="5" fill="currentColor" stroke="none" />
    <path d="m3.4 6 1.8 1.8 3.3-3.5" stroke="#fff" strokeWidth="1.2" />
  </Svg>
);

const MinusCircleIcon = () => (
  <Svg size={12} viewBox="0 0 12 12">
    <circle cx="6" cy="6" r="5" fill="none" />
    <path d="M3.8 6h4.4" />
  </Svg>
);

const ChevronDown = ({ size = 12 }: { size?: number }) => (
  <Svg size={size} viewBox="0 0 12 12" strokeWidth="1.6">
    <path d="m2.5 4.5 3.5 3.5 3.5-3.5" />
  </Svg>
);

const ArrowLeft = () => (
  <Svg size={12} viewBox="0 0 12 12" strokeWidth="1.6">
    <path d="M7.5 2.5 4 6l3.5 3.5" />
  </Svg>
);

const ArrowRight = () => (
  <Svg size={12} viewBox="0 0 12 12" strokeWidth="1.6">
    <path d="M4.5 2.5 8 6l-3.5 3.5" />
  </Svg>
);

const AppsIcon = () => (
  <Svg size={18} viewBox="0 0 24 24" strokeWidth="1.8">
    <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
    <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
    <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
    <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
  </Svg>
);

const SunIcon = () => (
  <Svg size={20} strokeWidth="1.8">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </Svg>
);

const MenuIcon = () => (
  <Svg size={20} strokeWidth="1.8">
    <path d="M4 8h16M4 16h16" />
  </Svg>
);

const HelpIcon = () => (
  <Svg size={20} strokeWidth="1.8">
    <circle cx="12" cy="12" r="9" />
    <path d="M9.6 9.2a2.5 2.5 0 0 1 4.85.85c0 1.65-2.45 2.45-2.45 3.45" />
    <path d="M12 17h.01" />
  </Svg>
);

const BellIcon = () => (
  <Svg size={18} strokeWidth="1.8">
    <path d="M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" />
    <path d="M13.7 21a2 2 0 0 1-3.4 0" />
  </Svg>
);

const CrownIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M3.5 17.5h17l-1.4-8.2-3.9 3.1L12 6.2 8.8 12.4 4.9 9.3l-1.4 8.2Z" />
  </svg>
);

const HeadsetIcon = () => (
  <Svg size={22} strokeWidth="1.8">
    <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
    <rect x="3" y="13" width="4" height="6" rx="1.5" />
    <rect x="17" y="13" width="4" height="6" rx="1.5" />
    <path d="M19 19a3 3 0 0 1-3 3h-2" />
  </Svg>
);

const CloseIcon = () => (
  <Svg size={16} viewBox="0 0 16 16" strokeWidth="1.6">
    <path d="m3.5 3.5 9 9M12.5 3.5l-9 9" />
  </Svg>
);

/* ===== 数据 ===== */
type RightsItem =
  | {
      type: 'usage';
      name: string;
      used: number;
      total: number;
      expireBatches?: Array<{ date: string; time?: string; amount: number }>;
    }
  | { type: 'metric'; name: string; value: string; unit: string }
  | { type: 'switch'; name: string; on: boolean };

interface RightsGroup {
  title: string;
  items: RightsItem[];
}

const RIGHTS_GROUPS: RightsGroup[] = [
  {
    title: '通用',
    items: [
      { type: 'usage', name: '店铺数', used: 5, total: 51 },
      { type: 'usage', name: '子账号数量', used: 4, total: 20 },
      { type: 'metric', name: '日志保留期限', value: '13', unit: '月' },
      { type: 'usage', name: '相册容量', used: 0, total: 0 },
    ],
  },
  {
    title: '订单',
    items: [
      { type: 'usage', name: '订单数量', used: 129, total: 60100 },
      { type: 'switch', name: '自动请款', on: true },
      { type: 'usage', name: '订单打标规则', used: 1, total: 50 },
      { type: 'metric', name: '订单保留期限', value: '0', unit: '月' },
      { type: 'switch', name: '新订单提醒', on: false },
    ],
  },
  {
    title: '产品',
    items: [
      {
        type: 'usage',
        name: '刊登数量',
        used: 0,
        total: 1000099,
        expireBatches: [
          { date: '2027-10-22', time: '2027-10-22 23:59:59', amount: 1000000 },
          { date: '2028-01-31', time: '2028-01-31 23:59:59', amount: 99 },
        ],
      },
      {
        type: 'usage',
        name: '定时刊登数量',
        used: 0,
        total: 6000,
        expireBatches: [{ date: '2027-10-22', time: '2027-10-22 23:59:59', amount: 6000 }],
      },
      {
        type: 'usage',
        name: '循环刊登',
        used: 1,
        total: 600,
        expireBatches: [{ date: '2027-10-22', time: '2027-10-22 23:59:59', amount: 599 }],
      },
      { type: 'usage', name: '认领中心容量', used: 0, total: 0 },
      { type: 'switch', name: '关键词采集', on: false },
      { type: 'usage', name: '自定义字段数量', used: 0, total: 0 },
      { type: 'usage', name: '自动翻译', used: 0, total: 0 },
      { type: 'switch', name: '一键替换推广图', on: false },
    ],
  },
  {
    title: '批量编辑',
    items: [
      { type: 'usage', name: '定价策略', used: 6, total: 151 },
      { type: 'usage', name: '批量编辑模板', used: 3, total: 301 },
      { type: 'usage', name: '单次批量编辑数量', used: 0, total: 0 },
    ],
  },
  {
    title: '营销功能',
    items: [
      { type: 'metric', name: '算力点', value: '1,093', unit: '点' },
      { type: 'usage', name: '扣白底图', used: 0, total: 0 },
      { type: 'usage', name: '批量图片翻译', used: 0, total: 0 },
      { type: 'usage', name: 'AI标题生成', used: 0, total: 0 },
      { type: 'usage', name: 'AI产品功能描述', used: 0, total: 0 },
      { type: 'usage', name: 'AI商品信息质量检测', used: 0, total: 0 },
    ],
  },
  {
    title: '采购',
    items: [
      { type: 'usage', name: '1688一键下单', used: 0, total: 0 },
      { type: 'switch', name: '国内物流跟踪', on: false },
    ],
  },
  {
    title: '物流',
    items: [{ type: 'switch', name: '国际物流跟踪', on: false }],
  },
  {
    title: '报表',
    items: [
      { type: 'switch', name: '店铺指标看板', on: false },
      { type: 'switch', name: '商品指标看板', on: false },
    ],
  },
  {
    title: 'tool',
    items: [
      { type: 'usage', name: '尾程签收凭证查询', used: 0, total: 0 },
      { type: 'usage', name: '地址邮编验证', used: 0, total: 0 },
    ],
  },
];

const HISTORY_ROWS = [
  {
    orderNo: '20261022L0TS0C002',
    level: '至尊会员',
    period: '2026-10-22 17:49:19 ~ 2027-10-22 23:59:59',
    active: true,
  },
  {
    orderNo: '20260913L0TS0C002',
    level: '铜牌会员',
    period: '2026-09-13 10:35:07 ~ 2026-10-13 23:59:59',
    active: false,
  },
];

interface Coupon {
  id: string;
  kind?: 'feature';
  value?: string;
  unit?: string;
  featureShort?: string;
  featureQty?: string;
  useWithinDays?: number;
  name: string;
  desc: string;
  points?: string;
  state: 'usable' | 'used' | 'expired' | 'claim' | 'limit' | 'exchange';
}

const INITIAL_MY_COUPONS: Coupon[] = [
  {
    id: 'my-f1',
    kind: 'feature',
    featureShort: '刊登',
    featureQty: '5',
    useWithinDays: 30,
    name: '刊登数量券',
    desc: '新增 5 次刊登 · 2026-11-19至2026-12-19',
    state: 'usable',
  },
  {
    id: 'my-1',
    value: '20',
    unit: '元',
    name: '满减券 · 全品类',
    desc: 'test · 满10可用 · 2026-11-19至2026-11-29',
    state: 'usable',
  },
  {
    id: 'my-2',
    value: '20',
    unit: '元',
    name: '满减券 · 全品类',
    desc: '满200-20 · 满200可用 · 2026-09-13至2026-09-16',
    state: 'expired',
  },
  {
    id: 'my-3',
    value: '8',
    unit: '折',
    name: '折扣券 · 全品类',
    desc: '折扣券打8折 · 满1000可用 · 2026-09-10至2026-09-11',
    state: 'expired',
  },
];

const INITIAL_CLAIMABLE: Coupon[] = [
  {
    id: 'c-f1',
    kind: 'feature',
    featureShort: '定时刊登',
    featureQty: '10',
    useWithinDays: 30,
    name: '定时刊登数量券',
    desc: '新增 10 次定时刊登 · 30天有效',
    state: 'claim',
  },
  {
    id: 'c-1',
    value: '8',
    unit: '折',
    name: '折扣券 · 全品类',
    desc: '折扣券打8折 · 满1000可用 · 1天有效',
    state: 'limit',
  },
  { id: 'c-2', value: '10', unit: '元', name: '满减券 · 全品类', desc: '折扣券 · 满1000可用 · 5天有效', state: 'claim' },
  { id: 'c-3', value: '10', unit: '元', name: '满减券 · 全品类', desc: '满20-10 · 满20可用 · 7天有效', state: 'claim' },
  {
    id: 'c-4',
    value: '2',
    unit: '折',
    name: '折扣券 · 全品类',
    desc: '满100-50优惠券 · 满100可用 · 5天有效',
    state: 'claim',
  },
  {
    id: 'c-5',
    value: '20',
    unit: '元',
    name: '满减券 · 全品类',
    desc: '满200-20 · 满200可用 · 3天有效',
    state: 'limit',
  },
  { id: 'c-6', value: '5', unit: '元', name: '满减券 · AI算力', desc: '满10-5 · 满10可用', state: 'claim' },
  {
    id: 'c-7',
    value: '500',
    unit: '元',
    name: '满减券 · 全品类',
    desc: '满1000-500 · 满1000可用 · 7天有效',
    state: 'claim',
  },
  { id: 'c-8', value: '50', unit: '元', name: '无门槛券 · 全品类', desc: '50元 · 无门槛 · 7天有效', state: 'claim' },
  {
    id: 'c-f2',
    kind: 'feature',
    featureShort: '循环刊登',
    featureQty: '3',
    useWithinDays: 30,
    name: '循环刊登次数券',
    desc: '新增 3 次循环刊登 · 30天有效',
    state: 'claim',
  },
];

const INITIAL_EXCHANGE: Coupon[] = [
  {
    id: 'e-f1',
    kind: 'feature',
    featureShort: '刊登',
    featureQty: '5',
    useWithinDays: 7,
    name: '刊登数量券',
    desc: '新增 5 次刊登 · 7天有效',
    points: '300',
    state: 'exchange',
  },
  {
    id: 'e-1',
    value: '20',
    unit: '元',
    name: '算力专用',
    desc: 'test · 满10可用 · 10天有效',
    points: '1',
    state: 'limit',
  },
  { id: 'e-2', value: '1', unit: '元', name: '算力专用', desc: '满10-1 · 满10可用 · 7天有效', points: '200', state: 'exchange' },
  { id: 'e-3', value: '120', unit: '元', name: '算力专用', desc: '120元 · 无门槛 · 7天有效', points: '200', state: 'exchange' },
];

/* ===== 工具 ===== */
const formatNumber = (value: number) => value.toLocaleString('en-US');
const percentage = (used: number, total: number) => (total > 0 ? Math.round((used / total) * 100) : 0);

const addDays = (days: number) => {
  const base = new Date(Date.UTC(2026, 10, 19));
  base.setUTCDate(base.getUTCDate() + days);
  const y = base.getUTCFullYear();
  const m = String(base.getUTCMonth() + 1).padStart(2, '0');
  const d = String(base.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const toClaimedDesc = (desc: string) => {
  const matched = desc.match(/^(.*?) · (\d+)天有效$/);
  if (!matched) return desc;
  return `${matched[1]} · 2026-11-19至${addDays(Number(matched[2]))}`;
};

/* ===== 小组件 ===== */
function UsageItem({
  name,
  used,
  total,
  expireBatches,
  detailOpen,
  onToggleDetail,
  onCloseDetail,
}: {
  name: string;
  used: number;
  total: number;
  expireBatches?: Array<{ date: string; time?: string; amount: number }>;
  detailOpen?: boolean;
  onToggleDetail?: () => void;
  onCloseDetail?: () => void;
}) {
  const pct = percentage(used, total);
  const nearest = expireBatches && expireBatches[0];
  const hasMultiple = Boolean(expireBatches && expireBatches.length > 1);
  return (
    <div className={`mcx-rights-item ${detailOpen ? 'is-expire-open' : ''}`}>
      <div className="mcx-rights-item-head">
        <div className="mcx-rights-item-name" title={name}>
          {name}
        </div>
        {nearest ? (
          hasMultiple ? (
            <button
              type="button"
              className="mcx-expire-tag is-clickable"
              title="查看全部失效明细"
              onClick={onToggleDetail}
            >
              {formatNumber(nearest.amount)} · {nearest.date} 失效
              <ChevronDown size={10} />
            </button>
          ) : (
            <span
              className="mcx-expire-tag"
              title={`其中 ${formatNumber(nearest.amount)} 将于 ${nearest.time ?? nearest.date} 失效`}
            >
              {formatNumber(nearest.amount)} · {nearest.date} 失效
            </span>
          )
        ) : null}
      </div>
      <div className="mcx-rights-item-body">
        <div className="mcx-usage">
          <div className="mcx-usage-head">
            <span className="mcx-usage-ratio">
              <em>{formatNumber(used)}</em>
              <span className="mcx-usage-sep">/</span>
              {formatNumber(total)}
            </span>
            <span className="mcx-usage-pct">{pct}%</span>
          </div>
          <div className="mcx-progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <div className="mcx-progress-inner" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>
      {detailOpen && expireBatches ? (
        <>
          <div className="mcx-expire-overlay" onClick={onCloseDetail} />
          <div className="mcx-expire-pop" role="dialog" aria-label={`${name}失效明细`}>
            <div className="mcx-expire-pop-list">
              {expireBatches.map((batch) => (
                <div key={batch.date} className="mcx-expire-row">
                  <span>{batch.time ?? batch.date} 失效</span>
                  <strong>{formatNumber(batch.amount)}</strong>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function MetricItem({ name, value, unit }: { name: string; value: string; unit: string }) {
  return (
    <div className="mcx-rights-item">
      <div className="mcx-rights-item-name" title={name}>
        {name}
      </div>
      <div className="mcx-rights-item-body">
        <div className="mcx-metric">
          <span className="mcx-metric-num">{value}</span>
          <span className="mcx-metric-unit">{unit}</span>
        </div>
      </div>
    </div>
  );
}

function SwitchItem({ name, on }: { name: string; on: boolean }) {
  return (
    <div className="mcx-rights-item">
      <div className="mcx-rights-item-name" title={name}>
        {name}
      </div>
      <div className="mcx-rights-item-body">
        <span className={`mcx-switch ${on ? 'is-on' : 'is-off'}`}>
          {on ? <CheckCircleIcon /> : <MinusCircleIcon />}
          {on ? '开' : '关'}
        </span>
      </div>
    </div>
  );
}

function CouponCard({
  coupon,
  onUse,
  onClaim,
}: {
  coupon: Coupon;
  onUse?: () => void;
  onClaim?: () => void;
}) {
  const activity = coupon.state === 'exchange' || Boolean(coupon.points);
  const isFeature = coupon.kind === 'feature';
  const btnClass = `mcx-coupon-btn ${isFeature ? 'is-feature' : ''}`;
  return (
    <div className={`mcx-coupon ${activity ? 'is-activity' : ''} ${isFeature ? 'is-feature' : ''}`}>
      {isFeature ? (
        <div className="mcx-coupon-value is-feature">
          <span className="mcx-feature-label">{coupon.featureShort}</span>
          <span className="mcx-feature-qty">
            +{coupon.featureQty}
            <em>次</em>
          </span>
        </div>
      ) : (
        <div className="mcx-coupon-value">
          <span className="mcx-coupon-num">{coupon.value}</span>
          <span className="mcx-coupon-unit">{coupon.unit}</span>
        </div>
      )}
      <div className="mcx-coupon-info">
        <div className="mcx-coupon-name" title={coupon.name}>
          {coupon.name}
        </div>
        <div className="mcx-coupon-desc" title={coupon.desc}>
          {coupon.desc}
        </div>
      </div>
      <div className="mcx-coupon-action">
        {coupon.points ? <div className="mcx-coupon-point">{coupon.points}积分</div> : null}
        {coupon.state === 'usable' && (
          <button type="button" className={btnClass} onClick={onUse}>
            去使用
          </button>
        )}
        {coupon.state === 'used' && (
          <button type="button" className="mcx-coupon-btn is-disabled" disabled>
            已使用
          </button>
        )}
        {coupon.state === 'expired' && (
          <button type="button" className="mcx-coupon-btn is-disabled" disabled>
            已过期
          </button>
        )}
        {coupon.state === 'claim' && (
          <button type="button" className={btnClass} onClick={onClaim}>
            去领取
          </button>
        )}
        {coupon.state === 'exchange' && (
          <button type="button" className={btnClass} onClick={onClaim}>
            去换取
          </button>
        )}
        {coupon.state === 'limit' && (
          <button type="button" className="mcx-coupon-btn is-disabled" disabled>
            您已达到领取上限
          </button>
        )}
      </div>
    </div>
  );
}

/* ===== 页面 ===== */
type TabKey = 'rights' | 'package' | 'coupon';

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'rights', label: '我的权益' },
  { key: 'package', label: '会员套餐' },
  { key: 'coupon', label: '优惠券' },
];

export default function MemberCenter() {
  const [tab, setTab] = useState<TabKey>('rights');
  const [myCoupons, setMyCoupons] = useState<Coupon[]>(INITIAL_MY_COUPONS);
  const [claimable, setClaimable] = useState<Coupon[]>(INITIAL_CLAIMABLE);
  const [exchange, setExchange] = useState<Coupon[]>(INITIAL_EXCHANGE);
  const [toast, setToast] = useState('');
  const [confirmCoupon, setConfirmCoupon] = useState<Coupon | null>(null);
  const [expireDetail, setExpireDetail] = useState<{ name: string; batches: Array<{ date: string; time?: string; amount: number }> } | null>(null);
  const [pageSize, setPageSize] = useState('10条/页');
  const [sizeOpen, setSizeOpen] = useState(false);
  const [jumpPage, setJumpPage] = useState('1');
  const [packageSubTab, setPackageSubTab] = useState<'plan' | 'single'>('plan');
  const cardRef = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<number>();

  useEffect(() => {
    if (!sizeOpen) return undefined;
    const close = () => setSizeOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [sizeOpen]);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  useEffect(() => {
    if (!confirmCoupon) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setConfirmCoupon(null);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [confirmCoupon]);

  useEffect(() => {
    if (!expireDetail) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setExpireDetail(null);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [expireDetail]);

  const showToast = (message: string) => {
    window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(''), 1800);
  };

  const switchTab = (next: TabKey) => {
    setTab(next);
    setSizeOpen(false);
    setExpireDetail(null);
    if (cardRef.current) cardRef.current.scrollTop = 0;
  };

  const claimCoupon = (coupon: Coupon) => {
    if (coupon.state === 'limit') return;
    if (coupon.state === 'exchange') {
      setExchange((prev) =>
        prev.map((item) => (item.id === coupon.id ? { ...item, state: 'limit' } : item)),
      );
      showToast('兑换成功');
    } else {
      setClaimable((prev) =>
        prev.map((item) => (item.id === coupon.id ? { ...item, state: 'limit' } : item)),
      );
      showToast('领取成功');
    }
    setMyCoupons((prev) => [
      {
        id: `claimed-${coupon.id}`,
        kind: coupon.kind,
        value: coupon.value,
        unit: coupon.unit,
        featureShort: coupon.featureShort,
        featureQty: coupon.featureQty,
        useWithinDays: coupon.useWithinDays,
        name: coupon.name,
        desc: toClaimedDesc(coupon.desc),
        state: 'usable',
      },
      ...prev,
    ]);
  };

  const useCoupon = (coupon: Coupon) => {
    if (coupon.kind === 'feature') {
      setConfirmCoupon(coupon);
      return;
    }
    switchTab('package');
  };

  const redeemCoupon = () => {
    const coupon = confirmCoupon;
    if (!coupon) return;
    setMyCoupons((prev) =>
      prev.map((item) => (item.id === coupon.id ? { ...item, state: 'used' } : item)),
    );
    setConfirmCoupon(null);
    showToast(`兑换成功，已增加 ${coupon.featureQty} 次${coupon.featureShort}权益`);
  };

  return (
    <div className="mcx-page">
      <header className="mcx-navbar">
        <div className="mcx-logo-area">
          <img src={LOGO_URL} alt="logo" />
          <span className="mcx-logo-subtitle">智慧运营中台</span>
        </div>
        <div className="mcx-divider">|</div>
        <nav className="mcx-top-nav">
          {['首页', '商品', '交易', '采购', '物流', '报表', '系统', '工具箱', '即时咨询'].map((item) => (
            <div key={item} className="mcx-nav-item">
              {item}
            </div>
          ))}
        </nav>
        <div className="mcx-right-menu">
          <div className="mcx-right-item mcx-task-entry">
            <AppsIcon />
            任务管理器
          </div>
          <div className="mcx-right-item is-orange" title="主题设置">
            <SunIcon />
          </div>
          <div className="mcx-right-item is-orange" title="菜单">
            <MenuIcon />
          </div>
          <div className="mcx-right-item is-orange" title="帮助">
            <HelpIcon />
          </div>
          <div className="mcx-right-item" title="消息通知">
            <BellIcon />
          </div>
          <span className="mcx-vip">
            <CrownIcon />
            VIP3
          </span>
          <div className="mcx-avatar">
            <img src={LOGO_URL} alt="avatar" />
            <ChevronDown size={12} />
          </div>
        </div>
      </header>

      <div className="mcx-tags-view">
        <span className="current">个人中心</span>
      </div>

      <main className="mcx-app-main">
        <div className="mcx-profile-layout">
          <aside className="mcx-menu-card">
            <ul className="mcx-menu">
              {['基础资料', '会员中心', '订单中心', '发票管理', '分销中心'].map((item) => (
                <li key={item} className={`mcx-menu-item ${item === '会员中心' ? 'is-active' : ''}`}>
                  {item}
                </li>
              ))}
            </ul>
          </aside>

          <div className="mcx-profile-content">
            <div className="mcx-card" ref={cardRef}>
              <div className="mcx-tabs-head" role="tablist">
                {TABS.map((item) => {
                  const isStatic = item.key === 'package';
                  return (
                    <button
                      key={item.key}
                      type="button"
                      role="tab"
                      aria-selected={tab === item.key}
                      aria-disabled={isStatic}
                      disabled={isStatic}
                      className={`mcx-tab ${tab === item.key ? 'is-active' : ''}`}
                      onClick={isStatic ? undefined : () => switchTab(item.key)}
                    >
                      <span className="mcx-tab-label">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {tab === 'rights' && (
                <div className="mcx-rights-panel">
                  <div className="mcx-member-status">
                    <MedalIcon />
                    <span className="mcx-member-status-name">至尊会员</span>
                    <span className="mcx-member-status-expire">到期日：2027-10-22 23:59:59</span>
                    <button type="button" className="mcx-member-status-link" onClick={() => switchTab('package')}>
                      续费/升级
                    </button>
                  </div>

                  <div className="mcx-section-title">会员开通记录</div>
                  <div className="mcx-history-table">
                    <table>
                      <colgroup>
                        <col style={{ width: '26.8%' }} />
                        <col style={{ width: '19.9%' }} />
                        <col style={{ width: '36.6%' }} />
                        <col style={{ width: '16.7%' }} />
                      </colgroup>
                      <thead>
                        <tr>
                          <th>订单编号</th>
                          <th>会员等级</th>
                          <th>服务时间</th>
                          <th>开通状态</th>
                        </tr>
                      </thead>
                      <tbody>
                        {HISTORY_ROWS.map((row) => (
                          <tr key={row.orderNo}>
                            <td>{row.orderNo}</td>
                            <td>{row.level}</td>
                            <td>{row.period}</td>
                            <td>
                              <span className={row.active ? 'mcx-status-ok' : ''}>
                                {row.active ? '生效中' : '已失效'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mcx-pager">
                    <span>共 {HISTORY_ROWS.length} 条</span>
                    <div className="mcx-pager-size">
                      <button
                        type="button"
                        className="mcx-pager-size-trigger"
                        onClick={() => setSizeOpen((open) => !open)}
                      >
                        {pageSize}
                        <ChevronDown />
                      </button>
                      {sizeOpen && (
                        <div className="mcx-pager-menu">
                          {['10条/页', '20条/页', '30条/页', '50条/页', '100条/页', '200条/页', '500条/页'].map(
                            (option) => (
                              <button
                                key={option}
                                type="button"
                                className={option === pageSize ? 'is-selected' : ''}
                                onClick={() => {
                                  setPageSize(option);
                                  setSizeOpen(false);
                                }}
                              >
                                {option}
                              </button>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                    <button type="button" className="mcx-pager-btn" disabled>
                      <ArrowLeft />
                    </button>
                    <span className="mcx-pager-num">1</span>
                    <button type="button" className="mcx-pager-btn" disabled>
                      <ArrowRight />
                    </button>
                    <span className="mcx-pager-jump">
                      前往
                      <input
                        type="text"
                        value={jumpPage}
                        onChange={(event) => setJumpPage(event.target.value.replace(/[^\d]/g, ''))}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') setJumpPage('1');
                        }}
                      />
                      页
                    </span>
                  </div>

                  <div className="mcx-rights-groups">
                    {RIGHTS_GROUPS.map((group) => (
                      <section key={group.title} className="mcx-rights-group">
                        <div className="mcx-section-title">{group.title}</div>
                        <div className="mcx-rights-grid">
                          {group.items.map((item) =>
                            item.type === 'usage' ? (
                              <UsageItem
                                key={item.name}
                                name={item.name}
                                used={item.used}
                                total={item.total}
                                expireBatches={item.expireBatches}
                                detailOpen={expireDetail?.name === item.name}
                                onToggleDetail={() =>
                                  setExpireDetail((prev) =>
                                    prev?.name === item.name
                                      ? null
                                      : { name: item.name, batches: item.expireBatches || [] },
                                  )
                                }
                                onCloseDetail={() => setExpireDetail(null)}
                              />
                            ) : item.type === 'metric' ? (
                              <MetricItem key={item.name} name={item.name} value={item.value} unit={item.unit} />
                            ) : (
                              <SwitchItem key={item.name} name={item.name} on={item.on} />
                            ),
                          )}
                        </div>
                      </section>
                    ))}
                  </div>
                </div>
              )}

              {tab === 'package' && (
                <div className="mcx-package-panel">
                  <div className="mcx-steps">
                    <div className="mcx-step is-active">
                      <span className="mcx-step-num">1</span>
                      <span>选择</span>
                      <span className="mcx-step-line" />
                    </div>
                    <div className="mcx-step">
                      <span className="mcx-step-num">2</span>
                      <span>支付</span>
                      <span className="mcx-step-line" />
                    </div>
                    <div className="mcx-step">
                      <span className="mcx-step-num">3</span>
                      <span>完成</span>
                    </div>
                  </div>
                  <div className="mcx-package-toolbar">
                    <div className="mcx-sub-tabs">
                      <button
                        type="button"
                        className={`mcx-sub-tab ${packageSubTab === 'plan' ? 'is-active' : ''}`}
                        onClick={() => setPackageSubTab('plan')}
                      >
                        会员套餐
                      </button>
                      <button
                        type="button"
                        className={`mcx-sub-tab ${packageSubTab === 'single' ? 'is-active' : ''}`}
                        onClick={() => setPackageSubTab('single')}
                      >
                        单独购买
                      </button>
                    </div>
                    <div className="mcx-toolbar-right">
                      <div className="mcx-currency">
                        CNY
                        <ChevronDown />
                      </div>
                      <button type="button" className="mcx-estimate">
                        会员估算
                        <HelpIcon />
                      </button>
                    </div>
                  </div>
                  <div className="mcx-empty">暂无会员套餐</div>
                </div>
              )}

              {tab === 'coupon' && (
                <div className="mcx-coupon-panel">
                  <section className="mcx-coupon-section">
                    <div className="mcx-coupon-section-title">我的优惠券</div>
                    <div className="mcx-coupon-grid">
                      {myCoupons.map((coupon) => (
                        <CouponCard key={coupon.id} coupon={coupon} onUse={() => useCoupon(coupon)} />
                      ))}
                    </div>
                  </section>

                  <section className="mcx-coupon-section">
                    <div className="mcx-coupon-section-title">可领取优惠券</div>
                    {claimable.length > 0 ? (
                      <div className="mcx-coupon-grid">
                        {claimable.map((coupon) => (
                          <CouponCard
                            key={coupon.id}
                            coupon={coupon}
                            onClaim={() => claimCoupon(coupon)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="mcx-empty is-small">暂无可领取优惠券</div>
                    )}
                  </section>

                  <section className="mcx-coupon-section">
                    <div className="mcx-coupon-section-title">优惠券兑换</div>
                    {exchange.length > 0 ? (
                      <div className="mcx-coupon-grid">
                        {exchange.map((coupon) => (
                          <CouponCard key={coupon.id} coupon={coupon} onClaim={() => claimCoupon(coupon)} />
                        ))}
                      </div>
                    ) : (
                      <div className="mcx-empty is-small">暂无可兑换优惠券</div>
                    )}
                  </section>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <div className="mcx-contact" title="联系我们">
        <HeadsetIcon />
        <span>联系我们</span>
      </div>

      {confirmCoupon ? (
        <div
          className="mcx-dialog-mask"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setConfirmCoupon(null);
          }}
        >
          <div className="mcx-dialog" role="dialog" aria-modal="true" aria-label="确认兑换">
            <div className="mcx-dialog-head">
              确认兑换
              <button
                type="button"
                className="mcx-dialog-close"
                aria-label="关闭"
                onClick={() => setConfirmCoupon(null)}
              >
                <CloseIcon />
              </button>
            </div>
            <div className="mcx-dialog-body">
              <p className="mcx-confirm-text">
                确认兑换{' '}
                <em>
                  {confirmCoupon.featureQty} 次{confirmCoupon.featureShort}功能
                </em>
                吗？
              </p>
              <p className="mcx-confirm-note">
                兑换成功后，请在 {confirmCoupon.useWithinDays ?? 30} 天内使用，否则失效。
              </p>
              <p className="mcx-confirm-note">使用时将优先消耗这部分权益。</p>
            </div>
            <div className="mcx-dialog-footer">
              <button type="button" className="mcx-dialog-btn" onClick={() => setConfirmCoupon(null)}>
                取消
              </button>
              <button type="button" className="mcx-dialog-btn is-primary" onClick={redeemCoupon}>
                确认兑换
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? <div className="mcx-toast">{toast}</div> : null}
    </div>
  );
}
