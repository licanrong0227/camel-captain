/**
 * @name 个人中心 - 会员中心（我的权益 / 优惠券）
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import './style.css';
import product1 from './assets/product-1.jpg';
import product2 from './assets/product-2.jpg';
import product3 from './assets/product-3.jpg';

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

const RefreshIcon = ({ size = 16 }: { size?: number }) => (
  <Svg size={size} strokeWidth="1.8">
    <path d="M20.5 11a8.5 8.5 0 1 0-2.2 5.8" />
    <path d="M20.5 5v6h-6" />
  </Svg>
);

const SearchIcon = ({ size = 12 }: { size?: number }) => (
  <Svg size={size} strokeWidth="2">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Svg>
);

const CalendarIcon = ({ size = 14 }: { size?: number }) => (
  <Svg size={size} strokeWidth="1.8">
    <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
    <path d="M3.5 9.5h17M8 3v4M16 3v4" />
  </Svg>
);

const CloseIcon = () => (
  <Svg size={16} viewBox="0 0 16 16" strokeWidth="1.6">
    <path d="m3.5 3.5 9 9M12.5 3.5l-9 9" />
  </Svg>
);

/* ===== 基础资料页图标 ===== */
const UserIcon = ({ size = 15 }: { size?: number }) => (
  <Svg size={size} strokeWidth="1.8">
    <circle cx="12" cy="8" r="4" />
    <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
  </Svg>
);

const PencilIcon = ({ size = 15 }: { size?: number }) => (
  <Svg size={size} strokeWidth="1.8">
    <path d="M4 20h4.2L20 8.2a2.1 2.1 0 0 0-3-3L5.2 17 4 20Z" />
    <path d="m15.2 7 3 3" />
  </Svg>
);

const PhoneIcon = ({ size = 15 }: { size?: number }) => (
  <Svg size={size} strokeWidth="1.8">
    <path d="M6.2 3h-2A1.2 1.2 0 0 0 3 4.3C3 13 11 21 19.7 21a1.2 1.2 0 0 0 1.3-1.2v-2l-4.2-1.6-2 2a15 15 0 0 1-5.9-5.9l2-2L6.2 3Z" />
  </Svg>
);

const MailIcon = ({ size = 15 }: { size?: number }) => (
  <Svg size={size} strokeWidth="1.8">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3.5 6.5 8.5 6 8.5-6" />
  </Svg>
);

const DeptIcon = ({ size = 15 }: { size?: number }) => (
  <Svg size={size} strokeWidth="1.8">
    <rect x="9" y="3" width="6" height="5" rx="1" />
    <rect x="3" y="16" width="6" height="5" rx="1" />
    <rect x="15" y="16" width="6" height="5" rx="1" />
    <path d="M12 8v4M6 16v-2h12v2" />
  </Svg>
);

const RoleIcon = ({ size = 15 }: { size?: number }) => (
  <Svg size={size} strokeWidth="1.8">
    <circle cx="10" cy="8" r="3.6" />
    <path d="M3.5 20a6.5 6.5 0 0 1 13 0" />
    <path d="M17 5.2a3.6 3.6 0 0 1 0 5.6M18.5 14.4A6.5 6.5 0 0 1 21 20" />
  </Svg>
);

const YuanIcon = ({ size = 15 }: { size?: number }) => (
  <Svg size={size} strokeWidth="1.8">
    <path d="M7 4.5 12 12l5-7.5M12 12v7.5M7.8 13.5h8.4M7.8 17h8.4" />
  </Svg>
);

const LinkIcon = ({ size = 13 }: { size?: number }) => (
  <Svg size={size} strokeWidth="1.8">
    <path d="M10 13.8a4.2 4.2 0 0 0 6 0l3-3a4.2 4.2 0 0 0-6-6l-1.7 1.7" />
    <path d="M14 10.2a4.2 4.2 0 0 0-6 0l-3 3a4.2 4.2 0 0 0 6 6l1.7-1.7" />
  </Svg>
);

const LockIcon = ({ size = 15 }: { size?: number }) => (
  <Svg size={size} strokeWidth="1.8">
    <rect x="4.5" y="10" width="15" height="10.5" rx="2" />
    <path d="M8 10V7.5a4 4 0 0 1 8 0V10" />
  </Svg>
);

const CameraIcon = ({ size = 24 }: { size?: number }) => (
  <Svg size={size} strokeWidth="1.7">
    <path d="M4 8h3l2-2.5h6L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
    <circle cx="12" cy="13" r="3.6" />
  </Svg>
);

const CheckSmallIcon = ({ size = 13 }: { size?: number }) => (
  <Svg size={size} strokeWidth="2">
    <path d="m4.5 12.5 5 5L20 6.5" />
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
      {
        type: 'usage',
        name: '订单数量',
        used: 129,
        total: 60100,
        expireBatches: [{ date: '2027-10-22', time: '2027-10-22 23:59:59', amount: 59971 }],
      },
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

/* ===== 分销中心 ===== */
interface DistributionOrder {
  img: string;
  product: string;
  code: string;
  customer: string;
  username: string;
  orderNo: string;
  qty: number;
  amount: string;
  status: string;
  tone: 'done' | 'shipping' | 'canceled';
}

const DIST_ORDERS: DistributionOrder[] = [
  {
    img: product1,
    product: '头层牛皮通勤单肩包',
    code: 'NS-2026-001',
    customer: '王小明',
    username: '@wangxm',
    orderNo: 'DP202611180001',
    qty: 1,
    amount: '299.00',
    status: '已完成',
    tone: 'done',
  },
  {
    img: product2,
    product: '轻便运动休闲鞋',
    code: 'NS-2026-014',
    customer: '李思思',
    username: '@lisisi',
    orderNo: 'DP202611170023',
    qty: 2,
    amount: '458.00',
    status: '待发货',
    tone: 'shipping',
  },
  {
    img: product3,
    product: '新款百搭斜挎包',
    code: 'NS-2026-009',
    customer: '陈晨',
    username: '@chenchen',
    orderNo: 'DP202611160015',
    qty: 1,
    amount: '168.00',
    status: '已完成',
    tone: 'done',
  },
  {
    img: product1,
    product: '头层牛皮通勤单肩包',
    code: 'NS-2026-001',
    customer: '赵敏',
    username: '@zhaomin',
    orderNo: 'DP202611150007',
    qty: 1,
    amount: '299.00',
    status: '已取消',
    tone: 'canceled',
  },
];

interface DistributionCustomer {
  name: string;
  username: string;
  phone: string;
  email: string;
  qq: string;
  registered: string;
  stores: string;
  orders: string;
  spend: string;
  credits: string;
  points: string;
  coupons: string;
  subAccounts: string;
  memberLevel: string;
  memberPeriod: string;
}

const DIST_CUSTOMERS: DistributionCustomer[] = [
  {
    name: '王小明',
    username: 'wangxm',
    phone: '138****6621',
    email: 'wangxm@example.com',
    qq: '10023456',
    registered: '2026-08-18 10:24:03',
    stores: '2 / 20',
    orders: '86 / 6,000',
    spend: '¥1,286.00',
    credits: '320',
    points: '1,200',
    coupons: '3',
    subAccounts: '1',
    memberLevel: '至尊会员',
    memberPeriod: '2026-10-22 至 2027-10-22',
  },
  {
    name: '李思思',
    username: 'lisisi',
    phone: '139****0832',
    email: 'lisisi@example.com',
    qq: '8723411',
    registered: '2026-09-02 15:08:41',
    stores: '1 / 10',
    orders: '42 / 3,000',
    spend: '¥896.00',
    credits: '120',
    points: '560',
    coupons: '2',
    subAccounts: '0',
    memberLevel: '金牌会员',
    memberPeriod: '2026-09-02 至 2027-09-02',
  },
  {
    name: '陈晨',
    username: 'chenchen',
    phone: '137****7719',
    email: 'chenchen@example.com',
    qq: '100998877',
    registered: '2026-09-27 09:12:15',
    stores: '1 / 10',
    orders: '18 / 3,000',
    spend: '¥368.00',
    credits: '80',
    points: '260',
    coupons: '1',
    subAccounts: '0',
    memberLevel: '铜牌会员',
    memberPeriod: '2026-09-27 至 2026-10-27',
  },
  {
    name: '赵敏',
    username: 'zhaomin',
    phone: '136****5540',
    email: 'zhaomin@example.com',
    qq: '55667788',
    registered: '2026-10-11 18:46:09',
    stores: '1 / 10',
    orders: '5 / 3,000',
    spend: '¥168.00',
    credits: '20',
    points: '90',
    coupons: '1',
    subAccounts: '0',
    memberLevel: '铜牌会员',
    memberPeriod: '2026-10-11 至 2026-11-11',
  },
];

interface DistCoupon {
  id: string;
  kind: 'cash' | 'feature';
  value?: string;
  unit?: string;
  featureShort?: string;
  featureQty?: string;
  name: string;
  desc: string;
  expireDate: string;
  inventory: number;
  status: 'available' | 'expired' | 'exhausted';
}

const DIST_COUPONS: DistCoupon[] = [
  {
    id: 'd-1',
    kind: 'cash',
    value: '20',
    unit: '元',
    name: '满减券 · 全品类',
    desc: '满200-20 · 满200可用',
    expireDate: '2026-12-31 23:59:59',
    inventory: 20,
    status: 'available',
  },
  {
    id: 'd-2',
    kind: 'cash',
    value: '8',
    unit: '折',
    name: '折扣券 · 全品类',
    desc: '折扣券打8折 · 满1000可用',
    expireDate: '2026-11-30 23:59:59',
    inventory: 12,
    status: 'available',
  },
  {
    id: 'd-3',
    kind: 'feature',
    featureShort: '刊登',
    featureQty: '5',
    name: '刊登数量券',
    desc: '新增 5 次刊登',
    expireDate: '2026-12-19 23:59:59',
    inventory: 8,
    status: 'available',
  },
  {
    id: 'd-4',
    kind: 'cash',
    value: '50',
    unit: '元',
    name: '无门槛券 · 全品类',
    desc: '50元 · 无门槛',
    expireDate: '2026-11-10 23:59:59',
    inventory: 5,
    status: 'expired',
  },
  {
    id: 'd-5',
    kind: 'feature',
    featureShort: '循环刊登',
    featureQty: '3',
    name: '循环刊登次数券',
    desc: '新增 3 次循环刊登',
    expireDate: '2026-12-31 23:59:59',
    inventory: 6,
    status: 'available',
  },
];

const daysUntilExpire = (date: string) => {
  const target = new Date(date.replace(' ', 'T')).getTime();
  const today = new Date(Date.UTC(2026, 10, 20)).getTime();
  return Math.max(1, Math.ceil((target - today) / 86400000));
};

// 演示用的后台限领值，线上以后台返回为准
const DEMO_RECIPIENT_LIMIT = 1;

interface DistRecord {
  id: string;
  couponId: string;
  time: string;
  recipient: string;
  used: boolean;
}

const DEMO_DIST_RECORDS: DistRecord[] = [
  {
    id: 'r-1',
    couponId: 'd-2',
    time: '2026-11-18 14:20:33',
    recipient: 'self',
    used: true,
  },
  {
    id: 'r-2',
    couponId: 'd-2',
    time: '2026-11-17 10:05:12',
    recipient: 'wangxm',
    used: true,
  },
  {
    id: 'r-3',
    couponId: 'd-1',
    time: '2026-11-16 09:30:21',
    recipient: 'lisisi',
    used: false,
  },
  {
    id: 'r-4',
    couponId: 'd-3',
    time: '2026-11-15 16:12:44',
    recipient: 'chenchen',
    used: true,
  },
];

const formatDateTime = (date: Date) => {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const recipientLabel = (key: string) =>
  key === 'self' ? '本人' : DIST_CUSTOMERS.find((customer) => customer.username === key)?.name ?? key;

const EMPTY_CUSTOMER_FILTER = { name: '', username: '', phone: '', from: '', to: '' };

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

function MiniPager({ total }: { total: number }) {
  return (
    <div className="mcx-pager">
      <span>共 {total} 条</span>
      <span className="mcx-pager-size-static">
        10条/页
        <ChevronDown />
      </span>
      <button type="button" className="mcx-pager-btn" disabled>
        <ArrowLeft />
      </button>
      <span className="mcx-pager-num">1</span>
      <button type="button" className="mcx-pager-btn" disabled>
        <ArrowRight />
      </button>
      <span className="mcx-pager-jump">
        前往
        <input readOnly value="1" />
        页
      </span>
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

/* ===== 基础资料 ===== */
const PROFILE_INVITE_CODE = 'L0TS0C';

const PROFILE_INFO_CELLS: Array<{
  key: string;
  label: string;
  value: string;
  tone: string;
  icon: React.ReactNode;
}> = [
  { key: 'account', label: '用户名称', value: 'licanrong@ygq123456', tone: 'blue', icon: <UserIcon size={16} /> },
  { key: 'nickname', label: '用户昵称', value: '李灿荣', tone: 'green', icon: <UserIcon size={16} /> },
  { key: 'phone', label: '手机号码', value: '18575595171', tone: 'orange', icon: <PhoneIcon size={16} /> },
  { key: 'email', label: '用户邮箱', value: '906069595@qq.com', tone: 'red', icon: <MailIcon size={16} /> },
  { key: 'dept', label: '所属部门', value: '暂无', tone: 'gray', icon: <DeptIcon size={16} /> },
  { key: 'role', label: '所属角色', value: '暂无', tone: 'purple', icon: <RoleIcon size={16} /> },
  { key: 'created', label: '创建日期', value: '2026-09-28 15:32:29', tone: 'teal', icon: <CalendarIcon size={16} /> },
  { key: 'credit', label: '算力余额', value: '584.5', tone: 'amber', icon: <YuanIcon size={16} /> },
  { key: 'point', label: '积分', value: '19', tone: 'red', icon: <YuanIcon size={16} /> },
];

type ProfileBasicField = 'nickname' | 'phone' | 'email';
type ProfilePasswordField = 'oldPwd' | 'newPwd' | 'confirmPwd';

const EMPTY_PROFILE_ERRORS: Record<ProfileBasicField | ProfilePasswordField, string> = {
  nickname: '',
  phone: '',
  email: '',
  oldPwd: '',
  newPwd: '',
  confirmPwd: '',
};

export default function MemberCenter() {
  const [tab, setTab] = useState<TabKey>('rights');
  const [myCoupons, setMyCoupons] = useState<Coupon[]>(INITIAL_MY_COUPONS);
  const [claimable, setClaimable] = useState<Coupon[]>(INITIAL_CLAIMABLE);
  const [exchange, setExchange] = useState<Coupon[]>(INITIAL_EXCHANGE);
  const [toast, setToast] = useState('');
  const [confirmCoupon, setConfirmCoupon] = useState<Coupon | null>(null);
  const [expireDetail, setExpireDetail] = useState<{ name: string; batches: Array<{ date: string; time?: string; amount: number }> } | null>(null);
  const [page, setPage] = useState<'profile' | 'member' | 'distribution'>('profile');
  const [profileTab, setProfileTab] = useState<'basic' | 'password'>('basic');
  const [profileNickname, setProfileNickname] = useState('李灿荣');
  const [profileForm, setProfileForm] = useState<Record<ProfileBasicField, string>>({
    nickname: '李灿荣',
    phone: '18575595171',
    email: '906069595@qq.com',
  });
  const [profileErrors, setProfileErrors] = useState({ ...EMPTY_PROFILE_ERRORS });
  const [passwordForm, setPasswordForm] = useState<Record<ProfilePasswordField, string>>({
    oldPwd: '',
    newPwd: '',
    confirmPwd: '',
  });
  const [avatarSrc, setAvatarSrc] = useState('');
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [cancelStep, setCancelStep] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [cancelAck, setCancelAck] = useState(false);
  const [cancelCountdown, setCancelCountdown] = useState(10);
  const [cancelCode, setCancelCode] = useState('');
  const [cancelPassword, setCancelPassword] = useState('');
  const [cancelErrors, setCancelErrors] = useState({ code: '', password: '' });
  const [codeCountdown, setCodeCountdown] = useState(0);
  const [distTab, setDistTab] = useState<'dashboard' | 'customers' | 'coupons'>('dashboard');
  const [distRefreshing, setDistRefreshing] = useState(false);
  const [distCoupons, setDistCoupons] = useState(DIST_COUPONS);
  const [distRecords, setDistRecords] = useState(DEMO_DIST_RECORDS);
  const [dialogCouponIds, setDialogCouponIds] = useState<string[]>([]);
  const [recordsCouponId, setRecordsCouponId] = useState<string | null>(null);
  const [selectedDist, setSelectedDist] = useState<string[]>([]);
  const [distributeOpen, setDistributeOpen] = useState(false);
  const [recipientType, setRecipientType] = useState<'self' | 'customer'>('self');
  const [recipientCustomers, setRecipientCustomers] = useState<string[]>([]);
  const [customerForm, setCustomerForm] = useState(EMPTY_CUSTOMER_FILTER);
  const [customerApplied, setCustomerApplied] = useState(EMPTY_CUSTOMER_FILTER);
  const [pageSize, setPageSize] = useState('10条/页');
  const [sizeOpen, setSizeOpen] = useState(false);
  const [jumpPage, setJumpPage] = useState('1');
  const [packageSubTab, setPackageSubTab] = useState<'plan' | 'single'>('plan');
  const cardRef = useRef<HTMLDivElement>(null);
  const distCardRef = useRef<HTMLDivElement>(null);
  const selectAllRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<number>();
  const refreshTimer = useRef<number>();

  useEffect(() => {
    if (!sizeOpen) return undefined;
    const close = () => setSizeOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [sizeOpen]);

  useEffect(
    () => () => {
      window.clearTimeout(toastTimer.current);
      window.clearTimeout(refreshTimer.current);
    },
    [],
  );

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

  useEffect(() => {
    if (cancelStep !== 2) return undefined;
    setCancelCountdown(10);
    const timer = window.setInterval(() => {
      setCancelCountdown((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cancelStep]);

  useEffect(() => {
    if (codeCountdown <= 0) return undefined;
    const timer = window.setTimeout(() => setCodeCountdown((prev) => prev - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [codeCountdown]);

  useEffect(() => {
    if (cancelStep === 0) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeCancelAccount();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [cancelStep]);

  const filteredCustomers = useMemo(() => {
    const digits = (value: string) => value.replace(/\D/g, '');
    return DIST_CUSTOMERS.filter((customer) => {
      if (customerApplied.name && !customer.name.includes(customerApplied.name.trim())) return false;
      if (customerApplied.username && !customer.username.includes(customerApplied.username.trim())) return false;
      if (customerApplied.phone && !digits(customer.phone).includes(digits(customerApplied.phone))) return false;
      const registered = customer.registered.slice(0, 10);
      if (customerApplied.from && registered < customerApplied.from) return false;
      if (customerApplied.to && registered > customerApplied.to) return false;
      return true;
    });
  }, [customerApplied]);

  const selectableDist = distCoupons.filter((coupon) => coupon.status === 'available' && coupon.inventory > 0);
  const dialogCoupons = distCoupons.filter((coupon) => dialogCouponIds.includes(coupon.id));
  const allDistSelected =
    selectableDist.length > 0 && selectableDist.every((coupon) => selectedDist.includes(coupon.id));
  const availableDistCoupons = distCoupons.filter((coupon) => coupon.status === 'available');
  const availableDistInventory = availableDistCoupons.reduce((sum, coupon) => sum + coupon.inventory, 0);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = selectedDist.length > 0 && !allDistSelected;
    }
  }, [selectedDist, allDistSelected]);

  useEffect(() => {
    if (!distributeOpen) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDistributeOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [distributeOpen]);

  const toggleDistCoupon = (id: string) => {
    setSelectedDist((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const toggleAllDist = () => {
    setSelectedDist(allDistSelected ? [] : selectableDist.map((coupon) => coupon.id));
  };

  const distributionCount = (couponId: string, recipient: string) =>
    distRecords.filter(
      (record) => record.couponId === couponId && record.recipient === recipient,
    ).length;

  const selfAtLimit =
    dialogCoupons.length > 0 &&
    dialogCoupons.every(
      (coupon) => distributionCount(coupon.id, 'self') >= DEMO_RECIPIENT_LIMIT,
    );

  const recordsCoupon = recordsCouponId
    ? distCoupons.find((coupon) => coupon.id === recordsCouponId) ?? null
    : null;
  const currentRecords = recordsCouponId
    ? distRecords.filter((record) => record.couponId === recordsCouponId)
    : [];

  useEffect(() => {
    if (!recordsCouponId) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setRecordsCouponId(null);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [recordsCouponId]);

  const openDistribute = (ids: string[]) => {
    if (!ids.length) return;
    setDialogCouponIds(ids);
    const selfBlocked = ids.every(
      (id) => distributionCount(id, 'self') >= DEMO_RECIPIENT_LIMIT,
    );
    setRecipientType(selfBlocked ? 'customer' : 'self');
    setRecipientCustomers([]);
    setDistributeOpen(true);
  };

  const closeDistribute = () => {
    setDistributeOpen(false);
    setDialogCouponIds([]);
    setRecipientCustomers([]);
  };

  const toggleRecipientCustomer = (username: string) => {
    setRecipientCustomers((prev) =>
      prev.includes(username) ? prev.filter((item) => item !== username) : [...prev, username],
    );
  };

  const confirmDistribute = () => {
    if (!dialogCoupons.length) return;
    const recipientKeys = recipientType === 'self' ? ['self'] : recipientCustomers;
    if (!recipientKeys.length) return;
    const perCoupon: Array<{ coupon: DistCoupon; recipients: string[] }> = [];
    dialogCoupons.forEach((coupon) => {
      const eligible = recipientKeys.filter(
        (key) => distributionCount(coupon.id, key) < DEMO_RECIPIENT_LIMIT,
      );
      if (eligible.length) perCoupon.push({ coupon, recipients: eligible });
    });
    if (!perCoupon.length) {
      showToast('所选对象已达领取上限');
      return;
    }
    const total = perCoupon.reduce((sum, entry) => sum + entry.recipients.length, 0);
    setDistCoupons((prev) =>
      prev.map((coupon) => {
        const entry = perCoupon.find((item) => item.coupon.id === coupon.id);
        if (!entry) return coupon;
        const inventory = Math.max(0, coupon.inventory - entry.recipients.length);
        return { ...coupon, inventory, status: inventory === 0 ? 'exhausted' : coupon.status };
      }),
    );
    if (recipientType === 'self') {
      const stamp = Date.now();
      setMyCoupons((prev) => [
        ...perCoupon.map(
          ({ coupon }, index): Coupon => ({
            id: `dist-${coupon.id}-${stamp}-${index}`,
            kind: coupon.kind === 'feature' ? 'feature' : undefined,
            value: coupon.value,
            unit: coupon.unit,
            featureShort: coupon.featureShort,
            featureQty: coupon.featureQty,
            useWithinDays: daysUntilExpire(coupon.expireDate),
            name: coupon.name,
            desc: `${coupon.desc} · ${coupon.expireDate.slice(0, 10)}失效`,
            state: 'usable',
          }),
        ),
        ...prev,
      ]);
    }
    const stamp = Date.now();
    const time = formatDateTime(new Date());
    const newRecords: DistRecord[] = [];
    perCoupon.forEach((entry, couponIndex) => {
      entry.recipients.forEach((recipient, recipientIndex) => {
        newRecords.push({
          id: `rec-${stamp}-${couponIndex}-${recipientIndex}`,
          couponId: entry.coupon.id,
          time,
          recipient,
          used: false,
        });
      });
    });
    setDistRecords((prev) => [...newRecords, ...prev]);
    showToast(`已分发 ${total} 张优惠券`);
    setDistributeOpen(false);
    setDialogCouponIds([]);
    setSelectedDist([]);
    setRecipientCustomers([]);
    setRecipientType('self');
  };

  const switchPage = (next: 'profile' | 'member' | 'distribution') => {
    setPage(next);
    setExpireDetail(null);
    setConfirmCoupon(null);
    setDistributeOpen(false);
    setSizeOpen(false);
    if (next === 'member') {
      if (cardRef.current) cardRef.current.scrollTop = 0;
    } else if (next === 'distribution' && distCardRef.current) {
      distCardRef.current.scrollTop = 0;
    }
  };

  const switchProfileTab = (next: 'basic' | 'password') => {
    setProfileTab(next);
    setProfileErrors({ ...EMPTY_PROFILE_ERRORS });
  };

  const updateProfileForm = (key: ProfileBasicField, value: string) => {
    setProfileForm((prev) => ({ ...prev, [key]: value }));
    if (profileErrors[key]) setProfileErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const updatePasswordForm = (key: ProfilePasswordField, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [key]: value }));
    if (profileErrors[key]) setProfileErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const saveProfileBasic = () => {
    const next = { ...EMPTY_PROFILE_ERRORS };
    if (!profileForm.nickname.trim()) next.nickname = '请输入用户昵称';
    if (!profileForm.phone.trim()) next.phone = '请输入手机号码';
    else if (!/^1[3-9]\d{9}$/.test(profileForm.phone.trim())) next.phone = '请输入正确的手机号码';
    if (!profileForm.email.trim()) next.email = '请输入邮箱地址';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email.trim())) next.email = '请输入正确的邮箱地址';
    if (next.nickname || next.phone || next.email) {
      setProfileErrors(next);
      return;
    }
    setProfileErrors({ ...EMPTY_PROFILE_ERRORS });
    setProfileNickname(profileForm.nickname.trim());
    showToast('保存成功');
  };

  const resetProfileBasic = () => {
    setProfileForm({ nickname: profileNickname, phone: '18575595171', email: '906069595@qq.com' });
    setProfileErrors({ ...EMPTY_PROFILE_ERRORS });
  };

  const savePassword = () => {
    const next = { ...EMPTY_PROFILE_ERRORS };
    if (!passwordForm.oldPwd) next.oldPwd = '请输入旧密码';
    if (!passwordForm.newPwd) next.newPwd = '请输入新密码';
    else if (passwordForm.newPwd.length < 6 || passwordForm.newPwd.length > 20) next.newPwd = '密码长度需为 6-20 位';
    if (!passwordForm.confirmPwd) next.confirmPwd = '请再次输入新密码';
    else if (passwordForm.confirmPwd !== passwordForm.newPwd) next.confirmPwd = '两次输入的密码不一致';
    if (next.oldPwd || next.newPwd || next.confirmPwd) {
      setProfileErrors(next);
      return;
    }
    setPasswordForm({ oldPwd: '', newPwd: '', confirmPwd: '' });
    setProfileErrors({ ...EMPTY_PROFILE_ERRORS });
    showToast('密码修改成功');
  };

  const resetPassword = () => {
    setPasswordForm({ oldPwd: '', newPwd: '', confirmPwd: '' });
    setProfileErrors({ ...EMPTY_PROFILE_ERRORS });
  };

  const generateInviteLink = () => {
    const link = `https://test.kuachengjing.com/register?inviteCode=${PROFILE_INVITE_CODE}`;
    const fallback = () => {
      const area = document.createElement('textarea');
      area.value = link;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      document.body.removeChild(area);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link).catch(fallback);
    } else {
      fallback();
    }
    showToast('推广链接已复制');
  };

  const openComputeDetail = () => {
    window.open('/prototypes/personal-center-page', '_blank');
  };

  const pickAvatar = () => {
    if (avatarInputRef.current) avatarInputRef.current.click();
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarSrc(String(reader.result || ''));
      showToast('头像已更新');
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  /* ===== 注销账号 ===== */
  const openCancelAccount = () => {
    setCancelStep(1);
    setCancelAck(false);
    setCancelCountdown(10);
    setCancelCode('');
    setCancelPassword('');
    setCancelErrors({ code: '', password: '' });
    setCodeCountdown(0);
  };

  const closeCancelAccount = () => {
    setCancelStep(0);
    setCancelAck(false);
    setCancelCode('');
    setCancelPassword('');
    setCancelErrors({ code: '', password: '' });
    setCodeCountdown(0);
  };

  const goCancelVerify = () => {
    if (!cancelAck) return;
    setCancelStep(2);
  };

  const sendCancelCode = () => {
    if (codeCountdown > 0) return;
    setCodeCountdown(60);
    showToast('验证码已发送至 185****5171');
  };

  const updateCancelCode = (value: string) => {
    setCancelCode(value.replace(/\D/g, '').slice(0, 6));
    if (cancelErrors.code) setCancelErrors((prev) => ({ ...prev, code: '' }));
  };

  const updateCancelPassword = (value: string) => {
    setCancelPassword(value);
    if (cancelErrors.password) setCancelErrors((prev) => ({ ...prev, password: '' }));
  };

  const submitCancelAccount = () => {
    const next = { code: '', password: '' };
    if (!cancelCode.trim()) next.code = '请输入验证码';
    else if (!/^\d{6}$/.test(cancelCode.trim())) next.code = '请输入 6 位验证码';
    if (!cancelPassword) next.password = '请输入登录密码';
    else if (cancelPassword.length < 6) next.password = '密码长度不能少于 6 位';
    if (next.code || next.password) {
      setCancelErrors(next);
      return;
    }
    setCancelErrors({ code: '', password: '' });
    setCancelStep(4);
  };

  const switchDistTab = (next: 'dashboard' | 'customers' | 'coupons') => {
    setDistTab(next);
    setDistributeOpen(false);
    if (distCardRef.current) distCardRef.current.scrollTop = 0;
  };

  const applyCustomerFilters = (event: React.FormEvent) => {
    event.preventDefault();
    setCustomerApplied(customerForm);
  };

  const resetCustomerFilters = () => {
    setCustomerForm(EMPTY_CUSTOMER_FILTER);
    setCustomerApplied(EMPTY_CUSTOMER_FILTER);
  };

  const updateCustomerForm = (key: keyof typeof EMPTY_CUSTOMER_FILTER, value: string) => {
    setCustomerForm((prev) => ({ ...prev, [key]: value }));
  };

  const refreshDistribution = () => {
    if (distRefreshing) return;
    setDistRefreshing(true);
    window.clearTimeout(refreshTimer.current);
    refreshTimer.current = window.setTimeout(() => setDistRefreshing(false), 700);
  };

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
              {['基础资料', '会员中心', '订单中心', '发票管理', '分销中心'].map((item) => {
                const target =
                  item === '基础资料'
                    ? 'profile'
                    : item === '会员中心'
                      ? 'member'
                      : item === '分销中心'
                        ? 'distribution'
                        : null;
                return (
                  <li
                    key={item}
                    className={`mcx-menu-item ${target === page ? 'is-active' : ''}`}
                    onClick={target ? () => switchPage(target) : undefined}
                  >
                    {item}
                  </li>
                );
              })}
            </ul>
          </aside>

          <div className="mcx-profile-content">
            <section
              className="mcx-profile-page"
              style={{ display: page === 'profile' ? 'flex' : 'none' }}
            >
              <div className="mcx-pcard mcx-pcard--info">
                <div className="mcx-phero">
                  <div className="mcx-phero-bg" />
                  <div className="mcx-phero-content">
                    <div className="mcx-pavatar" onClick={pickAvatar} title="修改头像">
                      {avatarSrc ? <img src={avatarSrc} alt="头像" /> : <span className="mcx-pavatar-letter">L</span>}
                      <div className="mcx-pavatar-mask">
                        <CameraIcon size={24} />
                        <span>修改头像</span>
                      </div>
                    </div>
                    <div className="mcx-pname">{profileNickname}</div>
                    <div className="mcx-pmember">
                      <span className="mcx-pmember-name">至尊会员</span>
                      <span className="mcx-pmember-expire">到期日：2027-10-22 23:59:59</span>
                      <span className="mcx-pmember-id">ID: LT10035</span>
                    </div>
                  </div>
                </div>

                <div className="mcx-pinvite">
                  <div className="mcx-pinvite-left">
                    <span className="mcx-pinvite-icon">
                      <LinkIcon size={18} />
                    </span>
                    <div className="mcx-pinvite-text">
                      <div className="mcx-pinvite-label">我的邀请码</div>
                      <div className="mcx-pinvite-code">{PROFILE_INVITE_CODE}</div>
                    </div>
                  </div>
                  <button type="button" className="mcx-pbtn mcx-pbtn--primary mcx-pbtn--sm" onClick={generateInviteLink}>
                    <LinkIcon size={12} />
                    生成推广链接
                  </button>
                </div>

                <div className="mcx-pinfo-grid">
                  {PROFILE_INFO_CELLS.map((cell) => {
                    const value =
                      cell.key === 'nickname'
                        ? profileNickname
                        : cell.key === 'phone'
                          ? profileForm.phone
                          : cell.key === 'email'
                            ? profileForm.email
                            : cell.value;
                    return (
                      <div className="mcx-pinfo-item" key={cell.key}>
                        <span className={`mcx-pinfo-icon is-${cell.tone}`}>{cell.icon}</span>
                        <div className="mcx-pinfo-content">
                          <div className="mcx-pinfo-label">{cell.label}</div>
                          <div className="mcx-pinfo-value" title={value}>
                            {value}
                          </div>
                        </div>
                        {cell.key === 'credit' ? (
                          <button type="button" className="mcx-pbtn mcx-pbtn--primary mcx-pbtn--mini" onClick={openComputeDetail}>
                            算力明细
                          </button>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mcx-pcard mcx-pcard--form">
                <div className="mcx-ptabs" role="tablist">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={profileTab === 'basic'}
                    className={`mcx-ptab ${profileTab === 'basic' ? 'is-active' : ''}`}
                    onClick={() => switchProfileTab('basic')}
                  >
                    基本资料
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={profileTab === 'password'}
                    className={`mcx-ptab ${profileTab === 'password' ? 'is-active' : ''}`}
                    onClick={() => switchProfileTab('password')}
                  >
                    修改密码
                  </button>
                </div>

                {profileTab === 'basic' ? (
                  <div className="mcx-pform">
                    <div className="mcx-pform-item">
                      <label className="mcx-pform-label is-required">用户名称</label>
                      <div className="mcx-pinput is-disabled">
                        <span className="mcx-pinput-icon">
                          <UserIcon size={14} />
                        </span>
                        <input className="mcx-pinput-el" value="licanrong@ygq123456" disabled />
                      </div>
                    </div>
                    <div className="mcx-pform-item">
                      <label className="mcx-pform-label">用户昵称</label>
                      <div className={`mcx-pinput ${profileErrors.nickname ? 'is-error' : ''}`}>
                        <span className="mcx-pinput-icon">
                          <PencilIcon size={14} />
                        </span>
                        <input
                          className="mcx-pinput-el"
                          value={profileForm.nickname}
                          placeholder="请输入用户昵称"
                          onChange={(event) => updateProfileForm('nickname', event.target.value)}
                        />
                      </div>
                      {profileErrors.nickname ? <div className="mcx-pform-error">{profileErrors.nickname}</div> : null}
                    </div>
                    <div className="mcx-pform-item">
                      <label className="mcx-pform-label is-required">手机号码</label>
                      <div className={`mcx-pinput ${profileErrors.phone ? 'is-error' : ''}`}>
                        <span className="mcx-pinput-icon">
                          <PhoneIcon size={14} />
                        </span>
                        <input
                          className="mcx-pinput-el"
                          value={profileForm.phone}
                          placeholder="请输入手机号码"
                          onChange={(event) => updateProfileForm('phone', event.target.value)}
                        />
                      </div>
                      {profileErrors.phone ? <div className="mcx-pform-error">{profileErrors.phone}</div> : null}
                    </div>
                    <div className="mcx-pform-item">
                      <label className="mcx-pform-label is-required">邮箱</label>
                      <div className={`mcx-pinput ${profileErrors.email ? 'is-error' : ''}`}>
                        <span className="mcx-pinput-icon">
                          <MailIcon size={14} />
                        </span>
                        <input
                          className="mcx-pinput-el"
                          value={profileForm.email}
                          placeholder="请输入邮箱地址"
                          onChange={(event) => updateProfileForm('email', event.target.value)}
                        />
                      </div>
                      {profileErrors.email ? <div className="mcx-pform-error">{profileErrors.email}</div> : null}
                    </div>
                    <div className="mcx-pform-divider" />
                    <div className="mcx-pform-actions">
                      <button type="button" className="mcx-pbtn mcx-pbtn--primary mcx-pbtn--sm" onClick={saveProfileBasic}>
                        <CheckSmallIcon size={13} />
                        保存
                      </button>
                      <button type="button" className="mcx-pbtn mcx-pbtn--sm" onClick={resetProfileBasic}>
                        <CloseIcon />
                        关闭
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mcx-pform">
                    {(
                      [
                        { key: 'oldPwd', label: '旧密码', placeholder: '请输入旧密码' },
                        { key: 'newPwd', label: '新密码', placeholder: '请输入新密码' },
                        { key: 'confirmPwd', label: '确认密码', placeholder: '请确认密码' },
                      ] as Array<{ key: ProfilePasswordField; label: string; placeholder: string }>
                    ).map((field) => (
                      <div className="mcx-pform-item" key={field.key}>
                        <label className="mcx-pform-label is-required">{field.label}</label>
                        <div className={`mcx-pinput ${profileErrors[field.key] ? 'is-error' : ''}`}>
                          <span className="mcx-pinput-icon">
                            <LockIcon size={14} />
                          </span>
                          <input
                            type="password"
                            className="mcx-pinput-el"
                            value={passwordForm[field.key]}
                            placeholder={field.placeholder}
                            onChange={(event) => updatePasswordForm(field.key, event.target.value)}
                          />
                        </div>
                        {profileErrors[field.key] ? <div className="mcx-pform-error">{profileErrors[field.key]}</div> : null}
                      </div>
                    ))}
                    <div className="mcx-pform-divider" />
                    <div className="mcx-pform-actions">
                      <button type="button" className="mcx-pbtn mcx-pbtn--primary mcx-pbtn--sm" onClick={savePassword}>
                        <CheckSmallIcon size={13} />
                        保存
                      </button>
                      <button type="button" className="mcx-pbtn mcx-pbtn--sm" onClick={resetPassword}>
                        <CloseIcon />
                        关闭
                      </button>
                    </div>
                  </div>
                )}
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleAvatarChange}
                />
                <button type="button" className="mcx-paccount-cancel" onClick={openCancelAccount}>
                  注销账号
                </button>
              </div>
            </section>

            <div
              className="mcx-card"
              ref={cardRef}
              style={{ display: page === 'member' ? 'block' : 'none' }}
            >
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

            <div
              className="mcx-card"
              ref={distCardRef}
              style={{ display: page === 'distribution' ? 'block' : 'none' }}
            >
              <div className="mcx-tabs-head" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={distTab === 'dashboard'}
                  className={`mcx-tab ${distTab === 'dashboard' ? 'is-active' : ''}`}
                  onClick={() => switchDistTab('dashboard')}
                >
                  <span className="mcx-tab-label">数据看板</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={distTab === 'customers'}
                  className={`mcx-tab ${distTab === 'customers' ? 'is-active' : ''}`}
                  onClick={() => switchDistTab('customers')}
                >
                  <span className="mcx-tab-label">我的客户</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={distTab === 'coupons'}
                  className={`mcx-tab ${distTab === 'coupons' ? 'is-active' : ''}`}
                  onClick={() => switchDistTab('coupons')}
                >
                  <span className="mcx-tab-label">优惠券分发</span>
                </button>
              </div>

              {distTab === 'dashboard' && (
                <div className="mcx-dist-pane">
                  <div className="mcx-board-head">
                    <span className="mcx-board-title">本平台客户订单</span>
                    <button
                      type="button"
                      className={`mcx-board-refresh ${distRefreshing ? 'is-spinning' : ''}`}
                      aria-label="刷新"
                      title="刷新"
                      onClick={refreshDistribution}
                    >
                      <RefreshIcon size={16} />
                    </button>
                  </div>
                  <div className="mcx-table-wrap">
                    <table className="mcx-dist-table is-orders">
                      <colgroup>
                        <col style={{ width: '296px' }} />
                        <col style={{ width: '270px' }} />
                        <col style={{ width: '440px' }} />
                        <col style={{ width: '90px' }} />
                        <col style={{ width: '120px' }} />
                        <col style={{ width: '110px' }} />
                      </colgroup>
                      <thead>
                        <tr>
                          <th>商品</th>
                          <th>客户</th>
                          <th>订单编号</th>
                          <th>数量</th>
                          <th>实收金额</th>
                          <th>订单状态</th>
                        </tr>
                      </thead>
                      <tbody>
                        {DIST_ORDERS.map((order) => (
                          <tr key={order.orderNo}>
                            <td>
                              <div className="mcx-order-product">
                                <img src={order.img} alt="" />
                                <div className="mcx-order-product-info">
                                  <div className="name" title={order.product}>
                                    {order.product}
                                  </div>
                                  <div className="code">{order.code}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="mcx-customer-cell">
                                <span>{order.customer}</span>
                                <em>{order.username}</em>
                              </div>
                            </td>
                            <td>{order.orderNo}</td>
                            <td>{order.qty}</td>
                            <td className="mcx-amount">¥{order.amount}</td>
                            <td>
                              <span className={`mcx-order-status is-${order.tone}`}>{order.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <MiniPager total={DIST_ORDERS.length} />
                </div>
              )}

              {distTab === 'customers' && (
                <div className="mcx-dist-pane">
                  <form className="mcx-dist-filter" onSubmit={applyCustomerFilters}>
                    <label className="mcx-filter-field">
                      <span className="mcx-filter-label">姓名</span>
                      <input
                        className="mcx-filter-input"
                        placeholder="请输入"
                        value={customerForm.name}
                        onChange={(event) => updateCustomerForm('name', event.target.value)}
                      />
                    </label>
                    <label className="mcx-filter-field">
                      <span className="mcx-filter-label">用户名</span>
                      <input
                        className="mcx-filter-input"
                        placeholder="请输入"
                        value={customerForm.username}
                        onChange={(event) => updateCustomerForm('username', event.target.value)}
                      />
                    </label>
                    <label className="mcx-filter-field">
                      <span className="mcx-filter-label">手机号</span>
                      <input
                        className="mcx-filter-input"
                        placeholder="请输入"
                        value={customerForm.phone}
                        onChange={(event) => updateCustomerForm('phone', event.target.value)}
                      />
                    </label>
                    <label className="mcx-filter-field">
                      <span className="mcx-filter-label">注册时间</span>
                      <span className="mcx-date-range">
                        <CalendarIcon />
                        <input
                          placeholder="开始日期"
                          value={customerForm.from}
                          onChange={(event) => updateCustomerForm('from', event.target.value)}
                        />
                        <i>-</i>
                        <input
                          placeholder="结束日期"
                          value={customerForm.to}
                          onChange={(event) => updateCustomerForm('to', event.target.value)}
                        />
                      </span>
                    </label>
                    <div className="mcx-filter-actions">
                      <button type="submit" className="mcx-filter-btn is-primary">
                        <SearchIcon />
                        查询
                      </button>
                      <button
                        type="button"
                        className="mcx-filter-btn is-ghost"
                        onClick={resetCustomerFilters}
                      >
                        <RefreshIcon size={12} />
                        重置
                      </button>
                    </div>
                  </form>
                  <div className="mcx-table-wrap">
                    <table className="mcx-dist-table is-customers">
                      <colgroup>
                        {[90, 110, 120, 160, 110, 170, 110, 120, 110, 90, 80, 90, 90, 100, 180].map(
                          (width, index) => (
                            <col key={index} style={{ width: `${width}px` }} />
                          ),
                        )}
                      </colgroup>
                      <thead>
                        <tr>
                          {[
                            '姓名',
                            '用户名',
                            '手机号',
                            '邮箱',
                            'QQ',
                            '注册时间',
                            '店铺数/上限',
                            '订单数/上限',
                            '消费总金额',
                            '算力余额',
                            '积分',
                            '优惠券',
                            '子账号数',
                            '会员类型',
                            '会员周期',
                          ].map((title) => (
                            <th key={title}>{title}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCustomers.length > 0 ? (
                          filteredCustomers.map((customer) => (
                            <tr key={customer.username}>
                              <td>{customer.name}</td>
                              <td>{customer.username}</td>
                              <td>{customer.phone}</td>
                              <td>{customer.email}</td>
                              <td>{customer.qq}</td>
                              <td>{customer.registered}</td>
                              <td>{customer.stores}</td>
                              <td>{customer.orders}</td>
                              <td className="mcx-amount">{customer.spend}</td>
                              <td>{customer.credits}</td>
                              <td>{customer.points}</td>
                              <td>{customer.coupons}</td>
                              <td>{customer.subAccounts}</td>
                              <td>{customer.memberLevel}</td>
                              <td>{customer.memberPeriod}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={15} className="mcx-table-empty">
                              暂无数据
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <MiniPager total={filteredCustomers.length} />
                </div>
              )}

              {distTab === 'coupons' && (
                <div className="mcx-dist-pane">
                  <div className="mcx-dist-coupon-head">
                    <div className="mcx-dist-coupon-title-wrap">
                      <span className="mcx-board-title">可分发优惠券</span>
                      <span className="mcx-dist-coupon-sub">
                        可分发 {availableDistCoupons.length} 种 · 共 {formatNumber(availableDistInventory)} 张
                      </span>
                    </div>
                    <div className="mcx-dist-coupon-actions">
                      {selectedDist.length > 0 ? (
                        <span className="mcx-dist-selected-count">已选 {selectedDist.length} 张</span>
                      ) : null}
                      <button
                        type="button"
                        className="mcx-filter-btn is-primary"
                        disabled={selectedDist.length === 0}
                        onClick={() => openDistribute(selectedDist)}
                      >
                        分发
                      </button>
                    </div>
                  </div>
                  <div className="mcx-table-wrap">
                    <table className="mcx-dist-table is-dist-coupons">
                      <colgroup>
                        <col style={{ width: '48px' }} />
                        <col />
                        <col style={{ width: '110px' }} />
                        <col style={{ width: '190px' }} />
                        <col style={{ width: '120px' }} />
                        <col style={{ width: '100px' }} />
                        <col style={{ width: '120px' }} />
                      </colgroup>
                      <thead>
                        <tr>
                          <th>
                            <input
                              ref={selectAllRef}
                              type="checkbox"
                              className="mcx-check"
                              checked={allDistSelected}
                              disabled={selectableDist.length === 0}
                              onChange={toggleAllDist}
                              aria-label="全选优惠券"
                            />
                          </th>
                          <th style={{ textAlign: 'left' }}>优惠券</th>
                          <th>类型</th>
                          <th>有效期</th>
                          <th>可分发数量</th>
                          <th>状态</th>
                          <th>操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {distCoupons.map((coupon) => {
                          const selectable = coupon.status === 'available' && coupon.inventory > 0;
                          const checked = selectedDist.includes(coupon.id);
                          return (
                            <tr key={coupon.id} className={checked ? 'is-selected' : ''}>
                              <td>
                                <input
                                  type="checkbox"
                                  className="mcx-check"
                                  checked={checked}
                                  disabled={!selectable}
                                  onChange={() => toggleDistCoupon(coupon.id)}
                                  aria-label={`选择${coupon.name}`}
                                />
                              </td>
                              <td>
                                <div
                                  className={`mcx-dist-coupon ${coupon.kind === 'feature' ? 'is-feature' : ''}`}
                                >
                                  <div className="mcx-dist-coupon-value">
                                    {coupon.kind === 'feature' ? (
                                      <>
                                        <span className="label">{coupon.featureShort}</span>
                                        <em>
                                          +{coupon.featureQty}
                                          <i>次</i>
                                        </em>
                                      </>
                                    ) : (
                                      <>
                                        <em>{coupon.value}</em>
                                        <span>{coupon.unit}</span>
                                      </>
                                    )}
                                  </div>
                                  <div className="mcx-dist-coupon-info">
                                    <div className="name" title={coupon.name}>
                                      {coupon.name}
                                    </div>
                                    <div className="desc" title={coupon.desc}>
                                      {coupon.desc}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span className={`mcx-coupon-kind ${coupon.kind}`}>
                                  {coupon.kind === 'feature' ? '功能券' : '代金券'}
                                </span>
                              </td>
                              <td>{coupon.expireDate}</td>
                              <td>{coupon.inventory}</td>
                              <td>
                                <span className={`mcx-dist-status is-${coupon.status}`}>
                                  {coupon.status === 'available'
                                    ? '可分发'
                                    : coupon.status === 'expired'
                                      ? '已过期'
                                      : '已发完'}
                                </span>
                              </td>
                              <td>
                                <div className="mcx-row-actions">
                                  <button
                                    type="button"
                                    className="mcx-link"
                                    disabled={!selectable}
                                    title={
                                      selectable
                                        ? ''
                                        : coupon.status === 'expired'
                                          ? '已过期，无法分发'
                                          : '已发完'
                                    }
                                    onClick={() => openDistribute([coupon.id])}
                                  >
                                    分发
                                  </button>
                                  <button
                                    type="button"
                                    className="mcx-link is-muted"
                                    onClick={() => setRecordsCouponId(coupon.id)}
                                  >
                                    明细
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
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

      {cancelStep > 0 ? (
        <div
          className="mcx-dialog-mask"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeCancelAccount();
          }}
        >
          <div
            className="mcx-dialog mcx-cancel-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={cancelStep === 4 ? '账号已注销' : '注销账号'}
          >
            <div className="mcx-dialog-head">
              {cancelStep === 1
                ? '注销账号'
                : cancelStep === 2
                  ? '再次确认注销'
                  : cancelStep === 3
                    ? '身份验证'
                    : '账号已注销'}
              {cancelStep !== 4 ? (
                <button type="button" className="mcx-dialog-close" aria-label="关闭" onClick={closeCancelAccount}>
                  <CloseIcon />
                </button>
              ) : null}
            </div>

            <div className="mcx-dialog-body">
              {cancelStep === 1 ? (
                <>
                  <div className="mcx-cancel-warn">
                    <strong>账号注销后，以下数据将被永久删除且无法找回：</strong>
                    <ul>
                      <li>店铺授权、商品与订单数据</li>
                      <li>会员权益、优惠券及算力余额</li>
                      <li>分销关系与推广记录</li>
                    </ul>
                  </div>
                  <label className="mcx-cancel-ack">
                    <input type="checkbox" checked={cancelAck} onChange={(event) => setCancelAck(event.target.checked)} />
                    <span>我已了解注销后所有数据将被删除，且无法恢复</span>
                  </label>
                </>
              ) : null}

              {cancelStep === 2 ? (
                <>
                  <p className="mcx-confirm-text">
                    这是最后一次确认。注销后该账号将无法登录，账号下的所有数据将被永久删除，且无法找回。
                  </p>
                  <p className="mcx-cancel-count">
                    请阅读并等待 <strong>{cancelCountdown}</strong> 秒后再确认
                  </p>
                </>
              ) : null}

              {cancelStep === 3 ? (
                <>
                  <p className="mcx-confirm-text">
                    为确认是本人操作，请完成以下验证。验证通过后账号将立即注销，所有数据将被删除且无法找回。
                  </p>
                  <div className="mcx-cancel-form">
                    <div className="mcx-cancel-row">
                      <label className="mcx-cancel-label">手机号码</label>
                      <div className="mcx-cancel-phone">
                        <PhoneIcon size={14} />
                        <span>185****5171</span>
                      </div>
                    </div>
                    <div className={`mcx-cancel-row ${cancelErrors.code ? 'is-error' : ''}`}>
                      <label className="mcx-cancel-label is-required">验证码</label>
                      <div className="mcx-cancel-code">
                        <div className="mcx-pinput">
                          <input
                            className="mcx-pinput-el"
                            value={cancelCode}
                            placeholder="请输入验证码"
                            maxLength={6}
                            onChange={(event) => updateCancelCode(event.target.value)}
                          />
                        </div>
                        <button
                          type="button"
                          className="mcx-cancel-code-btn"
                          disabled={codeCountdown > 0}
                          onClick={sendCancelCode}
                        >
                          {codeCountdown > 0 ? `${codeCountdown}s 后重新获取` : '获取验证码'}
                        </button>
                      </div>
                      {cancelErrors.code ? <div className="mcx-cancel-error">{cancelErrors.code}</div> : null}
                    </div>
                    <div className={`mcx-cancel-row ${cancelErrors.password ? 'is-error' : ''}`}>
                      <label className="mcx-cancel-label is-required">登录密码</label>
                      <div className="mcx-pinput">
                        <span className="mcx-pinput-icon">
                          <LockIcon size={14} />
                        </span>
                        <input
                          type="password"
                          className="mcx-pinput-el"
                          value={cancelPassword}
                          placeholder="请输入登录密码"
                          onChange={(event) => updateCancelPassword(event.target.value)}
                        />
                      </div>
                      {cancelErrors.password ? <div className="mcx-cancel-error">{cancelErrors.password}</div> : null}
                    </div>
                  </div>
                </>
              ) : null}

              {cancelStep === 4 ? (
                <div className="mcx-cancel-success">
                  <span className="mcx-cancel-success-icon">
                    <CheckSmallIcon size={26} />
                  </span>
                  <div className="mcx-cancel-success-title">账号已注销</div>
                  <p>该账号下的所有数据已删除。</p>
                </div>
              ) : null}
            </div>

            <div className="mcx-dialog-footer">
              {cancelStep === 1 ? (
                <>
                  <button type="button" className="mcx-dialog-btn" onClick={closeCancelAccount}>
                    取消
                  </button>
                  <button
                    type="button"
                    className="mcx-dialog-btn is-danger-ghost"
                    disabled={!cancelAck}
                    onClick={goCancelVerify}
                  >
                    继续注销
                  </button>
                </>
              ) : null}
              {cancelStep === 2 ? (
                <>
                  <button type="button" className="mcx-dialog-btn" onClick={closeCancelAccount}>
                    取消
                  </button>
                  <button
                    type="button"
                    className="mcx-dialog-btn is-danger"
                    disabled={cancelCountdown > 0}
                    onClick={() => setCancelStep(3)}
                  >
                    {cancelCountdown > 0 ? `确认注销（${cancelCountdown}s）` : '确认注销'}
                  </button>
                </>
              ) : null}
              {cancelStep === 3 ? (
                <>
                  <button type="button" className="mcx-dialog-btn" onClick={closeCancelAccount}>
                    取消
                  </button>
                  <button type="button" className="mcx-dialog-btn is-danger" onClick={submitCancelAccount}>
                    确认注销
                  </button>
                </>
              ) : null}
              {cancelStep === 4 ? (
                <button type="button" className="mcx-dialog-btn" onClick={closeCancelAccount}>
                  完成
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

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

      {distributeOpen ? (
        <div
          className="mcx-dialog-mask"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDistributeOpen(false);
          }}
        >
          <div
            className="mcx-dialog mcx-distribute-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="分发优惠券"
          >
            <div className="mcx-dialog-head">
              分发优惠券
              <button
                type="button"
                className="mcx-dialog-close"
                aria-label="关闭"
                onClick={closeDistribute}
              >
                <CloseIcon />
              </button>
            </div>
            <div className="mcx-dialog-body">
              <div className="mcx-distribute-section">
                <div className="mcx-distribute-label">已选优惠券</div>
                <div className="mcx-distribute-chips">
                  {dialogCoupons.map((coupon) => (
                    <span
                      key={coupon.id}
                      className={`mcx-distribute-chip ${coupon.kind === 'feature' ? 'is-feature' : ''}`}
                    >
                      {coupon.kind === 'feature'
                        ? `${coupon.featureShort} +${coupon.featureQty}次`
                        : `${coupon.value}${coupon.unit}`}
                      {' · '}
                      {coupon.name}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mcx-distribute-row">
                <span className="mcx-distribute-label">分发对象</span>
                <div className="mcx-recipient-segment">
                  <button
                    type="button"
                    className={recipientType === 'self' ? 'is-active' : ''}
                    disabled={selfAtLimit}
                    title={selfAtLimit ? '本人已领取过所选优惠券' : ''}
                    onClick={() => setRecipientType('self')}
                  >
                    本人
                  </button>
                  <button
                    type="button"
                    className={recipientType === 'customer' ? 'is-active' : ''}
                    onClick={() => setRecipientType('customer')}
                  >
                    客户
                  </button>
                </div>
              </div>
              {selfAtLimit ? (
                <div className="mcx-distribute-limit">
                  本人已领取过所选优惠券，每张限领 xx 张，无法重复分发
                </div>
              ) : null}
              {recipientType === 'customer' && (
                <div className="mcx-distribute-row is-top">
                  <span className="mcx-distribute-label">选择客户</span>
                  <div className="mcx-recipient-picker">
                    {DIST_CUSTOMERS.map((customer) => {
                      const receivedAll = dialogCoupons.every(
                        (coupon) =>
                          distributionCount(coupon.id, customer.username) >=
                          DEMO_RECIPIENT_LIMIT,
                      );
                      const receivedSome = dialogCoupons.some(
                        (coupon) =>
                          distributionCount(coupon.id, customer.username) >=
                          DEMO_RECIPIENT_LIMIT,
                      );
                      return (
                        <label
                          key={customer.username}
                          className={`mcx-recipient-option ${receivedAll ? 'is-disabled' : ''}`}
                        >
                          <input
                            type="checkbox"
                            className="mcx-check"
                            checked={recipientCustomers.includes(customer.username)}
                            disabled={receivedAll}
                            onChange={() => toggleRecipientCustomer(customer.username)}
                          />
                          <span>{customer.name}</span>
                          <em>{customer.username}</em>
                          {receivedAll ? (
                            <i className="mcx-recipient-flag">已领取</i>
                          ) : receivedSome ? (
                            <i className="mcx-recipient-flag is-partial">部分已领取</i>
                          ) : null}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
              {recipientType === 'customer' && recipientCustomers.length === 0 ? (
                <div className="mcx-distribute-error">请至少选择一位客户</div>
              ) : null}
              <p className="mcx-distribute-note">
                每位对象每张券限领 xx 张，已达上限的组合会自动跳过；分发后不可撤回。
              </p>
            </div>
            <div className="mcx-dialog-footer">
              <button type="button" className="mcx-dialog-btn" onClick={closeDistribute}>
                取消
              </button>
              <button
                type="button"
                className="mcx-dialog-btn is-primary"
                disabled={recipientType === 'customer' ? recipientCustomers.length === 0 : selfAtLimit}
                onClick={confirmDistribute}
              >
                确认分发
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {recordsCoupon ? (
        <div
          className="mcx-dialog-mask"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setRecordsCouponId(null);
          }}
        >
          <div
            className="mcx-dialog mcx-records-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="分发明细"
          >
            <div className="mcx-dialog-head">
              分发明细
              <button
                type="button"
                className="mcx-dialog-close"
                aria-label="关闭"
                onClick={() => setRecordsCouponId(null)}
              >
                <CloseIcon />
              </button>
            </div>
            <div className="mcx-dialog-body">
              <div className="mcx-records-summary">
                <span className="mcx-records-coupon">
                  {recordsCoupon.kind === 'feature'
                    ? `${recordsCoupon.featureShort} +${recordsCoupon.featureQty}次`
                    : `${recordsCoupon.value}${recordsCoupon.unit}`}
                  {' · '}
                  {recordsCoupon.name}
                </span>
                <span className="mcx-records-total">已分发 {currentRecords.length} 张</span>
              </div>
              {currentRecords.length > 0 ? (
                <div className="mcx-records-table">
                  <div className="mcx-records-head">
                    <span>分发对象</span>
                    <span>分发时间</span>
                    <span>使用状态</span>
                  </div>
                  {currentRecords.map((record) => (
                    <div key={record.id} className="mcx-records-row">
                      <span>{recipientLabel(record.recipient)}</span>
                      <span>{record.time}</span>
                      <span
                        className={`mcx-record-status ${record.used ? 'is-used' : 'is-unused'}`}
                      >
                        {record.used ? '已使用' : '未使用'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mcx-records-empty">暂无分发明细</div>
              )}
            </div>
            <div className="mcx-dialog-footer">
              <button
                type="button"
                className="mcx-dialog-btn"
                onClick={() => setRecordsCouponId(null)}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? <div className="mcx-toast">{toast}</div> : null}
    </div>
  );
}
