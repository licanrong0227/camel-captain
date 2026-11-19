/**
 * @name 优惠券模板列表 - 骆驼队长后台管理系统
 */

import React, { useEffect, useMemo, useState } from 'react';
import { AnnotationViewer } from '@axhub/annotation';
import type { AnnotationSourceDocument, AnnotationViewerOptions } from '@axhub/annotation';
import './style.css';
import annotationSourceDocument from './annotation-source.json';
import logoImage from './assets/logo.jpg';
import avatarImage from './assets/avatar.jpg';

type SelectKey = 'couponFunction' | 'featureType' | 'couponType' | 'productScope' | 'issueType';
type PageSelectKey = 'filterFunc' | 'filterType' | 'filterStatus' | 'pageSize';
type FormKey =
  | 'name'
  | 'couponFunction'
  | 'couponType'
  | 'value'
  | 'minSpend'
  | 'productScope'
  | 'totalLimit'
  | 'validDays'
  | 'issueType'
  | 'cycle'
  | 'limitMode'
  | 'perUserCount'
  | 'points'
  | 'amountThreshold'
  | 'remark';

interface FormState {
  name: string;
  couponFunction: string;
  featureType: string;
  featureCount: string;
  couponType: string;
  value: string;
  minSpend: string;
  productScope: string;
  totalLimit: string;
  validDays: string;
  issueType: string;
  cycle: 'long' | 'period';
  limitMode: 'unlimited' | 'limited';
  perUserCount: string;
  points: string;
  amountThreshold: string;
  remark: string;
}

interface CouponRow {
  id: string;
  name: string;
  func?: string;
  feature?: string;
  type: string;
  value: string;
  minSpend: string;
  product: string;
  total: string;
  issued: string;
  days: string;
  issue: string;
  validity: string;
  perUser: string;
  threshold: string;
  points: string;
  status: string;
  created: string;
  updated: string;
  remark: string;
}

const COUPON_FUNCTIONS = ['代金券', '功能券'];
const FEATURE_TYPES = ['刊登数量', '定时刊登数量', '循环刊登次数'];
const FEATURE_PLACEHOLDERS: Record<string, string> = {
  刊登数量: '请输入刊登数量',
  定时刊登数量: '请输入定时刊登数量',
  循环刊登次数: '请输入循环刊登次数',
};
const COUPON_TYPES = ['固定金额减免', '折扣比例'];
const PRODUCT_SCOPES = ['全品类', 'AI算力', '会员', '店铺'];
const ISSUE_TYPES = ['用户主动领取', '新用户注册自动发', '活动兑换', '下单返券', '后台手动发放'];
const STATUS_OPTIONS = ['未开始', '发放中', '已领完', '已下架', '已过期'];
const PAGE_SIZE_OPTIONS = ['10条/页', '20条/页', '30条/页', '50条/页'];

const INITIAL_FORM: FormState = {
  name: '',
  couponFunction: COUPON_FUNCTIONS[0],
  featureType: '',
  featureCount: '',
  couponType: COUPON_TYPES[0],
  value: '',
  minSpend: '0',
  productScope: PRODUCT_SCOPES[0],
  totalLimit: '',
  validDays: '',
  issueType: ISSUE_TYPES[0],
  cycle: 'long',
  limitMode: 'limited',
  perUserCount: '1',
  points: '0',
  amountThreshold: '0',
  remark: '',
};

const REQUIRED_FIELDS: { key: FormKey; message: string; select?: boolean }[] = [
  { key: 'name', message: '请输入优惠券名称' },
  { key: 'couponFunction', message: '请选择优惠券功能', select: true },
  { key: 'couponType', message: '请选择优惠券类型', select: true },
  { key: 'value', message: '请输入优惠值' },
  { key: 'minSpend', message: '请输入最低消费门槛' },
  { key: 'productScope', message: '请选择适用产品', select: true },
  { key: 'totalLimit', message: '请输入发放总数量' },
  { key: 'validDays', message: '请输入领取后有效天数' },
  { key: 'issueType', message: '请选择发放方式', select: true },
];

const VOUCHER_ONLY_FIELDS: FormKey[] = ['productScope', 'couponType', 'value', 'minSpend'];

const COUPON_ROWS: CouponRow[] = [
  {
    id: 'COUP00026',
    name: '刊登数量券 - 新增5次刊登',
    func: '功能券',
    feature: '刊登数量 5',
    type: '-',
    value: '-',
    minSpend: '-',
    product: '-',
    total: '100',
    issued: '0',
    days: '30',
    issue: '后台手动发放',
    validity: '长期',
    perUser: '1',
    threshold: '-',
    points: '-',
    status: '发放中',
    created: '创建 2026-11-19 15:20:00 admin',
    updated: '更新 2026-11-19 15:20:00',
    remark: '-',
  },
  {
    id: 'COUP00025',
    name: 'test后台手动发放 - 满10可用',
    type: '固定金额减免',
    value: '20',
    minSpend: '10',
    product: '全品类',
    total: '10',
    issued: '0',
    days: '10',
    issue: '后台手动发放',
    validity: '长期',
    perUser: '1',
    threshold: '无',
    points: '0',
    status: '发放中',
    created: '创建 2026-11-19 14:43:08 admin',
    updated: '更新 2026-11-19 14:43:08',
    remark: '',
  },
  {
    id: 'COUP00024',
    name: 'test - 满10可用',
    type: '固定金额减免',
    value: '20',
    minSpend: '10',
    product: '全品类',
    total: '10',
    issued: '1',
    days: '10',
    issue: '活动兑换',
    validity: '长期',
    perUser: '1',
    threshold: '无',
    points: '1',
    status: '发放中',
    created: '创建 2026-11-19 13:40:43 admin',
    updated: '更新 2026-11-19 13:40:43',
    remark: '',
  },
  {
    id: 'COUP00023',
    name: '折扣券打8折 - 满1000可用',
    type: '折扣比例',
    value: '0.8',
    minSpend: '1000',
    product: '全品类',
    total: '10',
    issued: '5',
    days: '1',
    issue: '用户主动领取',
    validity: '长期',
    perUser: '1',
    threshold: '无',
    points: '0',
    status: '发放中',
    created: '创建 2026-09-09 16:42:51 admin',
    updated: '更新 2026-09-09 16:42:51',
    remark: '',
  },
  {
    id: 'COUP00022',
    name: '折扣券 - 满1000可用',
    type: '固定金额减免',
    value: '10',
    minSpend: '1000',
    product: '全品类',
    total: '10',
    issued: '4',
    days: '5',
    issue: '用户主动领取',
    validity: '长期',
    perUser: '1',
    threshold: '无',
    points: '0',
    status: '发放中',
    created: '创建 2026-09-09 16:27:40 admin',
    updated: '更新 2026-09-09 16:27:40',
    remark: '',
  },
  {
    id: 'COUP00021',
    name: '满20-10 - 满20可用',
    type: '固定金额减免',
    value: '10',
    minSpend: '20',
    product: '全品类',
    total: '100',
    issued: '5',
    days: '7',
    issue: '用户主动领取',
    validity: '长期',
    perUser: '1',
    threshold: '无',
    points: '0',
    status: '发放中',
    created: '创建 2026-09-09 16:07:26 admin',
    updated: '更新 2026-09-09 16:07:26',
    remark: '',
  },
  {
    id: 'COUP00020',
    name: '满100-50优惠券 - 满100可用',
    type: '折扣比例',
    value: '0.2',
    minSpend: '100',
    product: '全品类',
    total: '10',
    issued: '5',
    days: '5',
    issue: '用户主动领取',
    validity: '长期',
    perUser: '1',
    threshold: '500',
    points: '0',
    status: '发放中',
    created: '创建 2026-09-09 15:52:20 admin',
    updated: '更新 2026-09-09 15:52:20',
    remark: '',
  },
  {
    id: 'COUP00019',
    name: '测试优惠卷',
    type: '固定金额减免',
    value: '2000',
    minSpend: '0',
    product: '全品类',
    total: '1',
    issued: '1',
    days: '1',
    issue: '用户主动领取',
    validity: '长期',
    perUser: '1',
    threshold: '无',
    points: '0',
    status: '已领完',
    created: '创建 2026-09-09 15:52:12 admin',
    updated: '更新 2026-09-09 15:53:29',
    remark: '',
  },
  {
    id: 'COUP00018',
    name: '满200-20 - 满200可用',
    type: '固定金额减免',
    value: '20',
    minSpend: '200',
    product: '全品类',
    total: '10',
    issued: '5',
    days: '3',
    issue: '用户主动领取',
    validity: '长期',
    perUser: '1',
    threshold: '无',
    points: '0',
    status: '发放中',
    created: '创建 2026-09-09 15:52:09 admin',
    updated: '更新 2026-09-09 15:52:09',
    remark: '',
  },
  {
    id: 'COUP00017',
    name: '满500-300 - 满500可用',
    type: '固定金额减免',
    value: '300',
    minSpend: '500',
    product: 'AI算力',
    total: '30',
    issued: '3',
    days: '7',
    issue: '用户主动领取',
    validity: '2026-09-09 -- 2026-09-16',
    perUser: '1',
    threshold: '无',
    points: '0',
    status: '已过期',
    created: '创建 2026-09-09 15:52:02 admin',
    updated: '更新 2026-09-17 00:01:00',
    remark: '',
  },
  {
    id: 'COUP00016',
    name: '满10-5 - 满10可用',
    type: '固定金额减免',
    value: '5',
    minSpend: '10',
    product: 'AI算力',
    total: '10',
    issued: '4',
    days: '0',
    issue: '用户主动领取',
    validity: '长期',
    perUser: '1',
    threshold: '无',
    points: '0',
    status: '发放中',
    created: '创建 2026-09-09 15:51:56 admin',
    updated: '更新 2026-09-09 15:51:56',
    remark: '',
  },
  {
    id: 'COUP00015',
    name: '满30-10 - 满30可用',
    type: '固定金额减免',
    value: '10',
    minSpend: '30',
    product: '全品类',
    total: '2',
    issued: '2',
    days: '7',
    issue: '用户主动领取',
    validity: '2026-09-09 -- 2026-10-01',
    perUser: '1',
    threshold: '无',
    points: '0',
    status: '已领完',
    created: '创建 2026-09-09 15:51:47 admin',
    updated: '更新 2026-09-10 10:16:53',
    remark: '',
  },
  {
    id: 'COUP00014',
    name: '满10000-2000 - 满10000可用',
    type: '固定金额减免',
    value: '2000',
    minSpend: '10000',
    product: '全品类',
    total: '10',
    issued: '10',
    days: '5',
    issue: '新用户注册自动发',
    validity: '长期',
    perUser: '1',
    threshold: '无',
    points: '0',
    status: '已领完',
    created: '创建 2026-09-09 15:51:31 admin',
    updated: '更新 2026-11-05 18:38:52',
    remark: '',
  },
  {
    id: 'COUP00013',
    name: '满10-1 - 满10可用',
    type: '固定金额减免',
    value: '1',
    minSpend: '10',
    product: 'AI算力',
    total: '10',
    issued: '2',
    days: '7',
    issue: '活动兑换',
    validity: '长期',
    perUser: '1',
    threshold: '无',
    points: '200',
    status: '发放中',
    created: '创建 2026-09-09 15:51:25 admin',
    updated: '更新 2026-09-09 15:51:25',
    remark: '',
  },
  {
    id: 'COUP00012',
    name: '满3000-500 - 满1可用',
    type: '固定金额减免',
    value: '10',
    minSpend: '1',
    product: 'AI算力',
    total: '1',
    issued: '1',
    days: '10',
    issue: '用户主动领取',
    validity: '长期',
    perUser: '1',
    threshold: '无',
    points: '0',
    status: '已领完',
    created: '创建 2026-09-09 15:51:18 admin',
    updated: '更新 2026-09-09 15:53:31',
    remark: '',
  },
  {
    id: 'COUP00011',
    name: '满200-50+ - 满200可用',
    type: '固定金额减免',
    value: '50',
    minSpend: '200',
    product: '全品类',
    total: '10',
    issued: '0',
    days: '3',
    issue: '下单返券',
    validity: '长期',
    perUser: '1',
    threshold: '无',
    points: '0',
    status: '发放中',
    created: '创建 2026-09-09 15:51:12 admin',
    updated: '更新 2026-09-09 15:51:12',
    remark: '',
  },
  {
    id: 'COUP00010',
    name: '满200减100 - 满200可用',
    type: '固定金额减免',
    value: '100',
    minSpend: '200',
    product: 'AI算力',
    total: '1',
    issued: '1',
    days: '0',
    issue: '用户主动领取',
    validity: '长期',
    perUser: '1',
    threshold: '无',
    points: '0',
    status: '已领完',
    created: '创建 2026-09-09 15:32:22 admin',
    updated: '更新 2026-09-09 15:32:35',
    remark: '',
  },
  {
    id: 'COUP00009',
    name: '满1000-500 - 满1000可用',
    type: '固定金额减免',
    value: '500',
    minSpend: '1000',
    product: '全品类',
    total: '100',
    issued: '3',
    days: '7',
    issue: '用户主动领取',
    validity: '长期',
    perUser: '1',
    threshold: '无',
    points: '0',
    status: '发放中',
    created: '创建 2026-09-09 11:06:26 admin',
    updated: '更新 2026-09-09 11:06:26',
    remark: '',
  },
  {
    id: 'COUP00008',
    name: '50元',
    type: '固定金额减免',
    value: '50',
    minSpend: '0',
    product: '全品类',
    total: '1',
    issued: '1',
    days: '0',
    issue: '用户主动领取',
    validity: '长期',
    perUser: '1',
    threshold: '无',
    points: '0',
    status: '已领完',
    created: '创建 2026-09-09 11:05:05 admin',
    updated: '更新 2026-09-09 11:05:11',
    remark: '',
  },
  {
    id: 'COUP00007',
    name: '满500-200 - 满500可用',
    type: '固定金额减免',
    value: '200',
    minSpend: '500',
    product: '全品类',
    total: '10',
    issued: '1',
    days: '7',
    issue: '活动兑换',
    validity: '2026-09-09 -- 2026-09-24',
    perUser: '1',
    threshold: '10',
    points: '200',
    status: '已过期',
    created: '创建 2026-09-09 11:04:40 admin',
    updated: '更新 2026-09-25 00:01:00',
    remark: 'asdas',
  },
  {
    id: 'COUP00006',
    name: '150元 - 满300可用',
    type: '固定金额减免',
    value: '150',
    minSpend: '300',
    product: '全品类',
    total: '1',
    issued: '1',
    days: '0',
    issue: '用户主动领取',
    validity: '长期',
    perUser: '1',
    threshold: '无',
    points: '0',
    status: '已领完',
    created: '创建 2026-09-09 11:03:37 admin',
    updated: '更新 2026-09-09 11:04:13',
    remark: '',
  },
  {
    id: 'COUP00005',
    name: '满200减190块 - 满200可用',
    type: '固定金额减免',
    value: '190',
    minSpend: '200',
    product: '全品类',
    total: '10',
    issued: '10',
    days: '1',
    issue: '用户主动领取',
    validity: '2026-09-02 -- 2026-09-07',
    perUser: '不限',
    threshold: '无',
    points: '0',
    status: '已领完',
    created: '创建 2026-09-02 10:31:15 admin',
    updated: '更新 2026-09-04 11:34:05',
    remark: '',
  },
  {
    id: 'COUP00004',
    name: '150元 - 满200可用',
    type: '固定金额减免',
    value: '150',
    minSpend: '200',
    product: '会员',
    total: '2',
    issued: '2',
    days: '5',
    issue: '活动兑换',
    validity: '2026-08-11 -- 2026-09-22',
    perUser: '2',
    threshold: '20',
    points: '10',
    status: '已领完',
    created: '创建 2026-08-22 15:30:56 admin',
    updated: '更新 2026-09-02 14:38:58',
    remark: '备注111',
  },
  {
    id: 'COUP00003',
    name: '80元',
    type: '固定金额减免',
    value: '80',
    minSpend: '0',
    product: '全品类',
    total: '1000',
    issued: '1',
    days: '7',
    issue: '后台手动发放',
    validity: '长期',
    perUser: '1',
    threshold: '无',
    points: '0',
    status: '发放中',
    created: '创建 2026-07-29 10:58:43 admin',
    updated: '更新 2026-07-29 10:58:43',
    remark: '备注222',
  },
  {
    id: 'COUP00002',
    name: '50元',
    type: '固定金额减免',
    value: '50',
    minSpend: '0',
    product: '全品类',
    total: '1000',
    issued: '7',
    days: '7',
    issue: '用户主动领取',
    validity: '长期',
    perUser: '1',
    threshold: '10',
    points: '0',
    status: '发放中',
    created: '创建 2026-07-29 10:50:16 admin',
    updated: '更新 2026-09-08 10:16:17 admin',
    remark: '备注222 备注333 备注222 备注333',
  },
  {
    id: 'COUP00001',
    name: '120元',
    type: '固定金额减免',
    value: '120',
    minSpend: '0',
    product: '全品类',
    total: '1000',
    issued: '2',
    days: '7',
    issue: '活动兑换',
    validity: '长期',
    perUser: '1',
    threshold: '无',
    points: '200',
    status: '发放中',
    created: '创建 2026-07-29 10:40:57 admin',
    updated: '更新 2026-07-29 10:40:57',
    remark: '备注222',
  },
];

const TABLE_COLUMNS: { label: string; width: number; annotationId?: string }[] = [
  { label: '模板编号', width: 120 },
  { label: '优惠券名称', width: 150 },
  { label: '优惠券功能', width: 120, annotationId: 'ann-table-func' },
  { label: '功能及数量', width: 130, annotationId: 'ann-table-feature' },
  { label: '优惠券类型', width: 120 },
  { label: '优惠值', width: 80 },
  { label: '最低消费门槛', width: 110 },
  { label: '适用产品', width: 100 },
  { label: '发放总量限制', width: 110 },
  { label: '已发放数', width: 90 },
  { label: '领取后N天有效', width: 120 },
  { label: '发放方式', width: 130 },
  { label: '优惠券模板有效期', width: 190 },
  { label: '用户限制获取个数', width: 130 },
  { label: '领取金额门槛', width: 110 },
  { label: '积分值', width: 80 },
  { label: '模板状态', width: 90 },
  { label: '时间', width: 200 },
  { label: '备注', width: 200 },
  { label: '操作', width: 110 },
];

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1" />
      <path d="M8 4.5V8l2.5 1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 5h2.2M8.4 5H17M3 10h2.2M8.4 10H17M3 15h2.2M8.4 15H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M2 4.7A2.7 2.7 0 0 1 4.7 2h5.6a2.7 2.7 0 0 1 2.7 2.7v3.6a2.7 2.7 0 0 1-2.7 2.7H7.4L4.4 13v-2H4.7A2.7 2.7 0 0 1 2 8.3V4.7Z" />
      <path d="M14.7 6h.6A2.7 2.7 0 0 1 18 8.7v3.6a2.7 2.7 0 0 1-2.7 2.7H15v2l-3-2h-2.2a2.7 2.7 0 0 1-2.7-2.7v-.4h3.9A4.2 4.2 0 0 0 14.7 6Z" opacity="0.92" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="5.4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M13.2 13.2L17 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function FullscreenIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 7V3h4M13 3h4v4M17 13v4h-4M7 17H3v-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CaretDownIcon() {
  return (
    <svg viewBox="0 0 10 6" fill="currentColor" aria-hidden="true">
      <path d="M0 0h10L5 6z" />
    </svg>
  );
}

interface SelectProps {
  value: string;
  options: string[];
  placeholder?: string;
  open: boolean;
  mini?: boolean;
  invalid?: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
}

function Select({ value, options, placeholder, open, mini, invalid, onToggle, onSelect }: SelectProps) {
  const classes = ['ctd-select'];
  if (mini) classes.push('ctd-select--mini');
  if (open) classes.push('is-open');
  if (invalid) classes.push('is-invalid');
  return (
    <div className={classes.join(' ')}>
      <button type="button" className="ctd-select-trigger" onClick={onToggle}>
        <span className={value ? 'ctd-select-text' : 'ctd-select-placeholder'}>{value || placeholder}</span>
        <span className="ctd-select-arrow">
          <ChevronIcon />
        </span>
      </button>
      {open && (
        <ul className="ctd-select-menu" role="listbox">
          {options.map((option) => (
            <li
              key={option}
              role="option"
              aria-selected={option === value}
              className={`ctd-select-option${option === value ? ' is-selected' : ''}`}
              onClick={() => onSelect(option)}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  value: string;
  options: RadioOption[];
  onChange: (value: string) => void;
}

function RadioGroup({ value, options, onChange }: RadioGroupProps) {
  return (
    <div className="ctd-radio-group" role="radiogroup">
      {options.map((option) => {
        const checked = option.value === value;
        return (
          <label
            key={option.value}
            role="radio"
            aria-checked={checked}
            className={`ctd-radio${checked ? ' is-checked' : ''}`}
            onClick={() => onChange(option.value)}
          >
            <span className="ctd-radio-dot" aria-hidden="true" />
            <span className="ctd-radio-label">{option.label}</span>
          </label>
        );
      })}
    </div>
  );
}

export default function CouponTemplatePage() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<FormKey, string>>>({});
  const [openSelect, setOpenSelect] = useState<SelectKey | PageSelectKey | null>(null);
  const [toast, setToast] = useState(false);

  const [filterInputs, setFilterInputs] = useState({ code: '', name: '', func: '', type: '', status: '' });
  const [applied, setApplied] = useState({ code: '', name: '', func: '', type: '', status: '' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [jumpValue, setJumpValue] = useState('');

  const update = (key: FormKey, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const numeric = (value: string, allowDecimal: boolean) => {
    const filtered = allowDecimal ? value.replace(/[^\d.]/g, '') : value.replace(/\D/g, '');
    return allowDecimal ? filtered.replace(/(\..*)\./g, '$1') : filtered;
  };

  const filtered = useMemo(() => {
    const code = applied.code.trim().toLowerCase();
    const name = applied.name.trim();
    return COUPON_ROWS.filter((row) => {
      if (code && !row.id.toLowerCase().includes(code)) return false;
      if (name && !row.name.includes(name)) return false;
      if (applied.func && (row.func ?? '代金券') !== applied.func) return false;
      if (applied.type && row.type !== applied.type) return false;
      if (applied.status && row.status !== applied.status) return false;
      return true;
    });
  }, [applied]);

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageRows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const pageNumbers = Array.from({ length: pageCount }, (_, index) => index + 1);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (openSelect) {
        setOpenSelect(null);
      } else {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, openSelect]);

  useEffect(() => {
    if (!openSelect) return undefined;
    const onMouseDown = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest('.ctd-select')) setOpenSelect(null);
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [openSelect]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(false), 2000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const toggleSelect = (key: SelectKey | PageSelectKey) => {
    setOpenSelect((prev) => (prev === key ? null : key));
  };

  const openDialog = () => {
    setForm(INITIAL_FORM);
    setErrors({});
    setOpenSelect(null);
    setOpen(true);
  };

  const query = () => {
    setApplied({ ...filterInputs });
    setPage(1);
    setOpenSelect(null);
  };

  const reset = () => {
    setFilterInputs({ code: '', name: '', func: '', type: '', status: '' });
    setApplied({ code: '', name: '', func: '', type: '', status: '' });
    setPage(1);
    setOpenSelect(null);
  };

  const submit = () => {
    const nextErrors: Partial<Record<FormKey, string>> = {};
    const hiddenFields = form.couponFunction === '代金券' ? [] : VOUCHER_ONLY_FIELDS;
    REQUIRED_FIELDS.forEach((field) => {
      if (hiddenFields.includes(field.key)) return;
      const value = String(form[field.key] ?? '').trim();
      if (!value) nextErrors[field.key] = field.message;
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setOpen(false);
    setToast(true);
  };

  const goToPage = (next: number) => {
    setPage(Math.min(Math.max(1, next), pageCount));
  };

  const handleJump = () => {
    const next = parseInt(jumpValue, 10);
    if (!Number.isNaN(next)) goToPage(next);
    setJumpValue('');
  };

  const fieldClass = (key: FormKey) => (errors[key] ? ' is-invalid' : '');

  return (
    <div className="ctd-page">
      <header className="ctd-navbar">
        <div className="ctd-brand">
          <img className="ctd-logo" src={logoImage} alt="logo" />
          <span className="ctd-brand-text">后台管理系统</span>
        </div>
        <span className="ctd-nav-divider">|</span>
        <nav className="ctd-nav-menu">
          {['首页', '租户', '系统管理', '会员中心', '物流', '运营', '菜单及用户', '设置'].map((item) => (
            <span key={item} className={`ctd-nav-item${item === '会员中心' ? ' is-active' : ''}`}>
              {item}
            </span>
          ))}
        </nav>
        <div className="ctd-nav-right">
          <button type="button" className="ctd-nav-icon" aria-label="菜单">
            <MenuIcon />
          </button>
          <button type="button" className="ctd-nav-icon" aria-label="消息">
            <ChatIcon />
          </button>
          <button type="button" className="ctd-nav-icon" aria-label="搜索">
            <SearchIcon />
          </button>
          <button type="button" className="ctd-nav-icon" aria-label="全屏">
            <FullscreenIcon />
          </button>
          <div className="ctd-avatar-wrap">
            <img className="ctd-avatar" src={avatarImage} alt="avatar" />
            <span className="ctd-avatar-caret">
              <CaretDownIcon />
            </span>
          </div>
        </div>
      </header>

      <div className="ctd-breadcrumb-bar">
        <span className="ctd-crumb">会员中心</span>
        <span className="ctd-crumb-sep">/</span>
        <span className="ctd-crumb">优惠券管理</span>
        <span className="ctd-crumb-sep">/</span>
        <span className="ctd-crumb is-current">优惠券模板列表</span>
      </div>

      <main className="ctd-main">
        <section className="ctd-card">
          <form
            className="ctd-filter"
            onSubmit={(event) => {
              event.preventDefault();
              query();
            }}
          >
            <div className="ctd-filter-item">
              <label className="ctd-filter-label">模板编号</label>
              <input
                className="ctd-filter-input"
                type="text"
                value={filterInputs.code}
                placeholder="请输入模板编号"
                onChange={(event) => setFilterInputs((prev) => ({ ...prev, code: event.target.value }))}
              />
            </div>
            <div className="ctd-filter-item">
              <label className="ctd-filter-label">优惠券名称</label>
              <input
                className="ctd-filter-input"
                type="text"
                value={filterInputs.name}
                placeholder="请输入优惠券名称"
                onChange={(event) => setFilterInputs((prev) => ({ ...prev, name: event.target.value }))}
              />
            </div>
            <div className="ctd-filter-item" data-annotation-id="ann-query-func">
              <label className="ctd-filter-label">优惠券功能</label>
              <div className="ctd-filter-select ctd-filter-select--func">
                <Select
                  mini
                  value={filterInputs.func}
                  options={COUPON_FUNCTIONS}
                  placeholder="全部"
                  open={openSelect === 'filterFunc'}
                  onToggle={() => toggleSelect('filterFunc')}
                  onSelect={(value) => {
                    setFilterInputs((prev) => ({ ...prev, func: value }));
                    setOpenSelect(null);
                  }}
                />
              </div>
            </div>
            <div className="ctd-filter-item">
              <label className="ctd-filter-label">优惠券类型</label>
              <div className="ctd-filter-select">
                <Select
                  mini
                  value={filterInputs.type}
                  options={COUPON_TYPES}
                  placeholder="全部"
                  open={openSelect === 'filterType'}
                  onToggle={() => toggleSelect('filterType')}
                  onSelect={(value) => {
                    setFilterInputs((prev) => ({ ...prev, type: value }));
                    setOpenSelect(null);
                  }}
                />
              </div>
            </div>
            <div className="ctd-filter-item">
              <label className="ctd-filter-label">模板状态</label>
              <div className="ctd-filter-select ctd-filter-select--status">
                <Select
                  mini
                  value={filterInputs.status}
                  options={STATUS_OPTIONS}
                  placeholder="全部"
                  open={openSelect === 'filterStatus'}
                  onToggle={() => toggleSelect('filterStatus')}
                  onSelect={(value) => {
                    setFilterInputs((prev) => ({ ...prev, status: value }));
                    setOpenSelect(null);
                  }}
                />
              </div>
            </div>
            <div className="ctd-filter-actions">
              <button type="submit" className="ctd-mini-btn ctd-mini-btn--warning">
                查询
              </button>
              <button type="button" className="ctd-mini-btn" onClick={reset}>
                重置
              </button>
              <button type="button" className="ctd-mini-btn ctd-mini-btn--warning" onClick={openDialog}>
                新建
              </button>
            </div>
          </form>

          <div className="ctd-table-wrap">
            <table className="ctd-table">
              <colgroup>
                {TABLE_COLUMNS.map((column) => (
                  <col key={column.label} style={{ width: column.width }} />
                ))}
              </colgroup>
              <thead>
                <tr>
                  {TABLE_COLUMNS.map((column) => (
                    <th key={column.label} data-annotation-id={column.annotationId}>
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td title={row.name}>{row.name}</td>
                    <td>{row.func ?? '代金券'}</td>
                    <td>{row.feature ?? '-'}</td>
                    <td>{row.type}</td>
                    <td>{row.value}</td>
                    <td>{row.minSpend}</td>
                    <td>{row.product}</td>
                    <td>{row.total}</td>
                    <td>{row.issued}</td>
                    <td>{row.days}</td>
                    <td>{row.issue}</td>
                    <td>{row.validity}</td>
                    <td>{row.perUser}</td>
                    <td>{row.threshold}</td>
                    <td>{row.points}</td>
                    <td>{row.status}</td>
                    <td>
                      <div className="ctd-time-cell">
                        <div>{row.created}</div>
                        <div>{row.updated}</div>
                      </div>
                    </td>
                    <td title={row.remark}>{row.remark}</td>
                    <td>
                      <span className="ctd-row-action">查看</span>
                      <span className="ctd-row-action">编辑</span>
                    </td>
                  </tr>
                ))}
                {pageRows.length === 0 && (
                  <tr>
                    <td className="ctd-empty" colSpan={TABLE_COLUMNS.length}>
                      暂无数据
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="ctd-pagination">
            <span className="ctd-page-total">共 {total} 条</span>
            <div className="ctd-page-size">
              <Select
                mini
                value={`${pageSize}条/页`}
                options={PAGE_SIZE_OPTIONS}
                open={openSelect === 'pageSize'}
                onToggle={() => toggleSelect('pageSize')}
                onSelect={(value) => {
                  setPageSize(parseInt(value, 10));
                  setPage(1);
                  setOpenSelect(null);
                }}
              />
            </div>
            <button
              type="button"
              className="ctd-pager-btn ctd-pager-arrow"
              disabled={currentPage <= 1}
              onClick={() => goToPage(currentPage - 1)}
            >
              ‹
            </button>
            {pageNumbers.map((number) => (
              <button
                key={number}
                type="button"
                className={`ctd-pager-btn${number === currentPage ? ' is-active' : ''}`}
                onClick={() => goToPage(number)}
              >
                {number}
              </button>
            ))}
            <button
              type="button"
              className="ctd-pager-btn ctd-pager-arrow"
              disabled={currentPage >= pageCount}
              onClick={() => goToPage(currentPage + 1)}
            >
              ›
            </button>
            <span className="ctd-jumper">
              前往
              <input
                className="ctd-jumper-input"
                type="text"
                inputMode="numeric"
                value={jumpValue}
                onChange={(event) => setJumpValue(event.target.value.replace(/\D/g, ''))}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleJump();
                }}
              />
              页
            </span>
          </div>
        </section>
      </main>

      {open && (
        <div className="ctd-mask">
          <div className="ctd-dialog" role="dialog" aria-modal="true" aria-label="新增模板">
            <header className="ctd-head">
              <h2 className="ctd-title">新增模板</h2>
              <button type="button" className="ctd-close" aria-label="关闭" onClick={() => setOpen(false)}>
                <CloseIcon />
              </button>
            </header>

            <div className="ctd-body">
              <div className="ctd-form">
                <div className={`ctd-item${fieldClass('name')}`}>
                  <label className="ctd-label">
                    <em className="ctd-required">*</em>优惠券名称
                  </label>
                  <div className="ctd-content">
                    <input
                      className="ctd-input"
                      type="text"
                      value={form.name}
                      placeholder="请输入优惠券名称"
                      onChange={(event) => update('name', event.target.value)}
                    />
                    {errors.name && <div className="ctd-error">{errors.name}</div>}
                  </div>
                </div>

                <div className={`ctd-item${fieldClass('couponFunction')}`} data-annotation-id="ann-dialog-func">
                  <label className="ctd-label">
                    <em className="ctd-required">*</em>优惠券功能
                  </label>
                  <div className="ctd-content">
                    <Select
                      value={form.couponFunction}
                      options={COUPON_FUNCTIONS}
                      open={openSelect === 'couponFunction'}
                      invalid={Boolean(errors.couponFunction)}
                      onToggle={() => toggleSelect('couponFunction')}
                      onSelect={(value) => {
                        update('couponFunction', value);
                        if (value !== '代金券') {
                          setErrors((prev) => ({
                            ...prev,
                            productScope: undefined,
                            couponType: undefined,
                            value: undefined,
                            minSpend: undefined,
                          }));
                        } else {
                          setForm((prev) => ({ ...prev, featureType: '', featureCount: '' }));
                        }
                        setOpenSelect(null);
                      }}
                    />
                    {errors.couponFunction && <div className="ctd-error">{errors.couponFunction}</div>}
                  </div>
                </div>

                {form.couponFunction === '功能券' && (
                  <div className="ctd-item" data-annotation-id="ann-dialog-feature">
                    <label className="ctd-label">功能及数量</label>
                    <div className="ctd-content">
                      <div className="ctd-feature-row">
                        <div className="ctd-feature-select">
                          <Select
                            value={form.featureType}
                            options={FEATURE_TYPES}
                            placeholder="请选择"
                            open={openSelect === 'featureType'}
                            onToggle={() => toggleSelect('featureType')}
                            onSelect={(value) => {
                              update('featureType', value);
                              setOpenSelect(null);
                            }}
                          />
                        </div>
                        <input
                          className="ctd-input"
                          type="text"
                          inputMode="numeric"
                          value={form.featureCount}
                          placeholder={
                            form.featureType
                              ? FEATURE_PLACEHOLDERS[form.featureType]
                              : '请输入数量'
                          }
                          onChange={(event) => update('featureCount', numeric(event.target.value, false))}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {form.couponFunction === '代金券' && (
                  <>
                    <div className={`ctd-item${fieldClass('productScope')}`}>
                      <label className="ctd-label">
                        <em className="ctd-required">*</em>适用产品
                      </label>
                      <div className="ctd-content">
                        <Select
                          value={form.productScope}
                          options={PRODUCT_SCOPES}
                          open={openSelect === 'productScope'}
                          invalid={Boolean(errors.productScope)}
                          onToggle={() => toggleSelect('productScope')}
                          onSelect={(value) => {
                            update('productScope', value);
                            setOpenSelect(null);
                          }}
                        />
                        {errors.productScope && <div className="ctd-error">{errors.productScope}</div>}
                      </div>
                    </div>

                    <div className={`ctd-item${fieldClass('couponType')}`}>
                      <label className="ctd-label">
                        <em className="ctd-required">*</em>优惠券类型
                      </label>
                      <div className="ctd-content">
                        <Select
                          value={form.couponType}
                          options={COUPON_TYPES}
                          open={openSelect === 'couponType'}
                          invalid={Boolean(errors.couponType)}
                          onToggle={() => toggleSelect('couponType')}
                          onSelect={(value) => {
                            update('couponType', value);
                            setOpenSelect(null);
                          }}
                        />
                        {errors.couponType && <div className="ctd-error">{errors.couponType}</div>}
                      </div>
                    </div>

                    <div className={`ctd-item${fieldClass('value')}`}>
                      <label className="ctd-label">
                        <em className="ctd-required">*</em>优惠值
                      </label>
                      <div className="ctd-content">
                        <input
                          className="ctd-input"
                          type="text"
                          inputMode="decimal"
                          value={form.value}
                          placeholder={
                            form.couponType === '折扣比例'
                              ? '请输入0~1之间的比例，如0.95表示9.5折'
                              : '请输入优惠值'
                          }
                          onChange={(event) => update('value', numeric(event.target.value, true))}
                        />
                        {errors.value && <div className="ctd-error">{errors.value}</div>}
                      </div>
                    </div>

                    <div className={`ctd-item${fieldClass('minSpend')}`}>
                      <label className="ctd-label">
                        <em className="ctd-required">*</em>最低消费门槛
                      </label>
                      <div className="ctd-content">
                        <input
                          className="ctd-input"
                          type="text"
                          inputMode="decimal"
                          value={form.minSpend}
                          placeholder="请输入最低消费门槛"
                          onChange={(event) => update('minSpend', numeric(event.target.value, true))}
                        />
                        {errors.minSpend && <div className="ctd-error">{errors.minSpend}</div>}
                      </div>
                    </div>
                  </>
                )}

                <div className={`ctd-item${fieldClass('totalLimit')}`}>
                  <label className="ctd-label">
                    <em className="ctd-required">*</em>发放总数量限制
                  </label>
                  <div className="ctd-content">
                    <input
                      className="ctd-input"
                      type="text"
                      inputMode="numeric"
                      value={form.totalLimit}
                      placeholder="请输入发放总量"
                      onChange={(event) => update('totalLimit', numeric(event.target.value, false))}
                    />
                    {errors.totalLimit && <div className="ctd-error">{errors.totalLimit}</div>}
                  </div>
                </div>

                <div className={`ctd-item${fieldClass('validDays')}`}>
                  <label className="ctd-label">
                    <em className="ctd-required">*</em>领取后N天有效
                  </label>
                  <div className="ctd-content">
                    <input
                      className="ctd-input"
                      type="text"
                      inputMode="numeric"
                      value={form.validDays}
                      placeholder="请输入天数"
                      onChange={(event) => update('validDays', numeric(event.target.value, false))}
                    />
                    {errors.validDays && <div className="ctd-error">{errors.validDays}</div>}
                  </div>
                </div>

                <div className={`ctd-item${fieldClass('issueType')}`}>
                  <label className="ctd-label">
                    <em className="ctd-required">*</em>发放方式
                  </label>
                  <div className="ctd-content">
                    <Select
                      value={form.issueType}
                      options={ISSUE_TYPES}
                      open={openSelect === 'issueType'}
                      invalid={Boolean(errors.issueType)}
                      onToggle={() => toggleSelect('issueType')}
                      onSelect={(value) => {
                        update('issueType', value);
                        setOpenSelect(null);
                      }}
                    />
                    {errors.issueType && <div className="ctd-error">{errors.issueType}</div>}
                  </div>
                </div>

                {form.issueType === '活动兑换' && (
                  <div className="ctd-item" data-annotation-id="ann-dialog-points">
                    <label className="ctd-label">积分兑换值</label>
                    <div className="ctd-content">
                      <input
                        className="ctd-input"
                        type="text"
                        inputMode="numeric"
                        value={form.points}
                        placeholder="请输入兑换的积分值"
                        onChange={(event) => update('points', numeric(event.target.value, false))}
                      />
                    </div>
                  </div>
                )}

                {form.issueType === '下单返券' && (
                  <div className="ctd-item" data-annotation-id="ann-dialog-threshold">
                    <label className="ctd-label">领取金额门槛</label>
                    <div className="ctd-content">
                      <input
                        className="ctd-input"
                        type="text"
                        inputMode="decimal"
                        value={form.amountThreshold}
                        placeholder="请输入领取金额门槛"
                        onChange={(event) => update('amountThreshold', numeric(event.target.value, true))}
                      />
                    </div>
                  </div>
                )}

                <div className="ctd-item ctd-item--radio">
                  <label className="ctd-label">优惠券模板生效周期</label>
                  <div className="ctd-content">
                    <RadioGroup
                      value={form.cycle}
                      options={[
                        { value: 'long', label: '长期' },
                        { value: 'period', label: '时间段' },
                      ]}
                      onChange={(value) => update('cycle', value)}
                    />
                    {form.cycle === 'period' && (
                      <div className="ctd-period-range">
                        <span className="ctd-period-icon">
                          <ClockIcon />
                        </span>
                        <span className="ctd-period-placeholder">开始时间</span>
                        <span className="ctd-period-separator">至</span>
                        <span className="ctd-period-placeholder">结束时间</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="ctd-item ctd-item--radio">
                  <label className="ctd-label">每户限额领取个数</label>
                  <div className="ctd-content">
                    <RadioGroup
                      value={form.limitMode}
                      options={[
                        { value: 'unlimited', label: '不限' },
                        { value: 'limited', label: '限制个数' },
                      ]}
                      onChange={(value) => update('limitMode', value)}
                    />
                    {form.limitMode === 'limited' && (
                      <input
                        className="ctd-input ctd-count-input"
                        type="text"
                        inputMode="numeric"
                        value={form.perUserCount}
                        placeholder="请输入个数"
                        onChange={(event) => update('perUserCount', numeric(event.target.value, false))}
                      />
                    )}
                  </div>
                </div>

                <div className="ctd-item ctd-item--textarea">
                  <label className="ctd-label">备注</label>
                  <div className="ctd-content">
                    <textarea
                      className="ctd-textarea"
                      value={form.remark}
                      placeholder="请输入备注"
                      onChange={(event) => update('remark', event.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <footer className="ctd-foot">
              <button type="button" className="ctd-btn" onClick={() => setOpen(false)}>
                取消
              </button>
              <button type="button" className="ctd-btn ctd-btn--warning" onClick={submit}>
                提交审核
              </button>
            </footer>
          </div>
        </div>
      )}

      {toast && (
        <div className="ctd-toast" role="status">
          新增成功
        </div>
      )}

      <AnnotationViewer
        source={annotationSourceDocument as unknown as AnnotationSourceDocument}
        options={VIEWER_OPTIONS}
      />
    </div>
  );
}

const VIEWER_OPTIONS: AnnotationViewerOptions = {
  showToolbar: true,
  showThemeToggle: true,
  showColorFilter: true,
  emptyWhenNoData: true,
  currentPageId: 'coupon-template',
};
