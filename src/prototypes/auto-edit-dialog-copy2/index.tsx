/**
 * @name 自动编辑弹窗 - 骆驼队长BI
 */

import React, { useEffect, useRef, useState } from 'react';
import { AnnotationViewer } from '@axhub/annotation';
import type { AnnotationSourceDocument } from '@axhub/annotation';
import annotationSourceDocument from './annotation-source.json';
import './style.css';
import mainSample1 from './assets/main-image-sample-1.png';
import mainSample2 from './assets/main-image-sample-2.png';

// ===== Icons =====
const FileIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="13" y2="17" />
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const GearIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const ChevronDown = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// 销售国家/地区旗帜（简化 SVG，与编辑产品弹窗保持一致）
const Flag = ({ code }: { code: string }) => {
  switch (code) {
    case 'US':
      return (
        <svg viewBox="0 0 20 14" aria-hidden="true">
          <rect width="20" height="14" fill="#fff" />
          {[0, 2, 4, 6, 8, 10, 12].map((index) => (
            <rect key={index} y={(index * 14) / 13} width="20" height={14 / 13} fill="#b22234" />
          ))}
          <rect width="8.6" height={7.54} fill="#3c3b6e" />
          {Array.from({ length: 12 }).map((_, index) => (
            <circle key={index} cx={1.2 + (index % 4) * 2} cy={1.3 + Math.floor(index / 4) * 2.2} r="0.38" fill="#fff" />
          ))}
        </svg>
      );
    case 'GB':
      return (
        <svg viewBox="0 0 20 14" aria-hidden="true">
          <rect width="20" height="14" fill="#012169" />
          <path d="M0 0 20 14M20 0 0 14" stroke="#fff" strokeWidth="3" />
          <path d="M0 0 20 14M20 0 0 14" stroke="#c8102e" strokeWidth="1.2" />
          <path d="M10 0v14M0 7h20" stroke="#fff" strokeWidth="3.2" />
          <path d="M10 0v14M0 7h20" stroke="#c8102e" strokeWidth="1.6" />
        </svg>
      );
    case 'DE':
      return (
        <svg viewBox="0 0 20 14" aria-hidden="true">
          <rect width="20" height="4.67" fill="#000" />
          <rect y="4.67" width="20" height="4.67" fill="#dd0000" />
          <rect y="9.33" width="20" height="4.67" fill="#ffce00" />
        </svg>
      );
    case 'EU':
      return (
        <svg viewBox="0 0 20 14" aria-hidden="true">
          <rect width="20" height="14" fill="#003399" />
          {Array.from({ length: 12 }).map((_, index) => {
            const angle = ((index * 30 - 90) * Math.PI) / 180;
            return <circle key={index} cx={10 + 4.1 * Math.cos(angle)} cy={7 + 4.1 * Math.sin(angle)} r="0.52" fill="#ffcc00" />;
          })}
        </svg>
      );
    case 'JP':
      return (
        <svg viewBox="0 0 20 14" aria-hidden="true">
          <rect width="20" height="14" fill="#fff" stroke="#e4e4e4" strokeWidth="0.6" />
          <circle cx="10" cy="7" r="4" fill="#bc002d" />
        </svg>
      );
    case 'KR':
      return (
        <svg viewBox="0 0 20 14" aria-hidden="true">
          <rect width="20" height="14" fill="#fff" stroke="#e4e4e4" strokeWidth="0.6" />
          <path d="M6.3 7a3.7 3.7 0 0 1 7.4 0Z" fill="#cd2e3a" />
          <path d="M6.3 7a3.7 3.7 0 0 0 7.4 0Z" fill="#0047a0" />
          <path d="M2.2 3.2h2.4M15.4 10.8h2.4M2.2 10.8h2.4M15.4 3.2h2.4" stroke="#2b2b2b" strokeWidth="0.7" />
        </svg>
      );
    case 'RU':
      return (
        <svg viewBox="0 0 20 14" aria-hidden="true">
          <rect width="20" height="4.67" fill="#fff" />
          <rect y="4.67" width="20" height="4.67" fill="#0039a6" />
          <rect y="9.33" width="20" height="4.67" fill="#d52b1e" />
        </svg>
      );
    case 'MX':
      return (
        <svg viewBox="0 0 20 14" aria-hidden="true">
          <rect width="6.67" height="14" fill="#006847" />
          <rect x="6.67" width="6.66" height="14" fill="#fff" />
          <rect x="13.33" width="6.67" height="14" fill="#ce1126" />
          <circle cx="10" cy="7" r="1.5" fill="#8a6a3b" />
        </svg>
      );
    case 'CN':
      return (
        <svg viewBox="0 0 20 14" aria-hidden="true">
          <rect width="20" height="14" fill="#de2910" />
          <polygon points="4.6,1.9 5.3,3.9 7.4,3.9 5.7,5.1 6.3,7.1 4.6,5.9 2.9,7.1 3.5,5.1 1.8,3.9 3.9,3.9" fill="#ffde00" />
          {[
            [8.2, 2.3],
            [9.5, 3.6],
            [9.5, 5.3],
            [8.2, 6.6],
          ].map(([cx, cy], index) => (
            <circle key={index} cx={cx} cy={cy} r="0.55" fill="#ffde00" />
          ))}
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 20 14" aria-hidden="true">
          <rect width="20" height="14" fill="#eaf4fb" />
          <circle cx="10" cy="7" r="6.3" fill="#5eb6e6" />
          <path
            d="M4.6 5.2c1.1-1.2 2.5-1.7 3.7-1.2.9.4.5 1.6 1.3 2.1.8.5 1.8.3 2.4 1.1.6.8-.2 1.6-.9 1.9-1.2.5-1.6 1.8-2.9 1.6-1.3-.2-2.4-1.2-2.9-2.5-.3-.8-.9-1.5-1.3-2.1-.2-.3.1-.6.6-.9Z"
            fill="#5fbf62"
          />
          <path d="M13.6 4.2c.8-.2 1.7.3 2 1 .2.7-.2 1.2-.8 1.4-.7.2-1.3-.2-1.5-.9-.2-.6-.1-1.3.3-1.5Z" fill="#5fbf62" />
          <path d="M12 10.2c.6-.1 1.1.3 1.2.8.1.5-.3.9-.9.9-.6 0-1-.4-1-.9 0-.4.3-.7.7-.8Z" fill="#5fbf62" />
        </svg>
      );
  }
};

const CheckCircle = ({ color = '#ff781f' }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={color}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="9 12 11 14 15 10" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ShopIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 3h18v4H3zM5 7v14h14V7M9 11h6v6H9z" />
  </svg>
);

// Menu icons
const MenuDoc = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);
const MenuUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const MenuTag = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);
const MenuList = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);
const MenuGrid = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);
const MenuBox = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
  </svg>
);
const MenuPkg = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="21 8 21 21 3 21 3 8" />
    <rect x="1" y="3" width="22" height="5" />
    <line x1="10" y1="12" x2="14" y2="12" />
  </svg>
);
const MenuImg = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);
const MenuTrans = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 8h14" />
    <path d="M5 8c0 6 5 10 7 10" />
    <path d="M19 8c0 6-5 10-7 10" />
    <path d="M9 3l-3 5" />
    <path d="M15 3l3 5" />
  </svg>
);
const MenuLink = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);
const MenuHome = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

// ===== Data =====
type MenuItem = {
  id: string;
  label: string;
  count: number;
  icon: React.ReactNode;
  done?: boolean;
};

const MenuAttr = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
  </svg>
);

const menuItems: MenuItem[] = [
  { id: 'basic', label: '商品基本信息', count: 6, icon: <MenuHome /> },
  { id: 'detail', label: '详情页面', count: 1, icon: <MenuDoc /> },
  { id: 'attr', label: '属性', count: 1, icon: <MenuAttr /> },
  { id: 'service', label: '服务', count: 4, icon: <MenuUser /> },
  { id: 'price', label: '商品价格', count: 2, icon: <MenuTag /> },
  { id: 'sale', label: '销售方案', count: 1, icon: <MenuList /> },
  { id: 'sku', label: 'SKU信息', count: 6, icon: <MenuGrid /> },
  { id: 'stock', label: '备货信息', count: 1, icon: <MenuBox /> },
  { id: 'custom', label: '定制商品', count: 1, icon: <MenuDoc /> },
  { id: 'pack', label: '包装物流', count: 1, icon: <MenuPkg /> },
  { id: 'image', label: '图片视频', count: 8, icon: <MenuImg /> },
  { id: 'trans', label: '翻译', count: 1, icon: <MenuTrans />, done: true },
  { id: 'source', label: '货源信息', count: 1, icon: <MenuLink /> },
];

const gradeModes = ['成人属性', '非成人属性'];
const serviceFields = ['运费模板', '售后模板', '线上分组'];
const serviceTplRows = [
  { id: 'svc-1', name: '服装测试' },
  { id: 'svc-2', name: 'bag' },
  { id: 'svc-3', name: 'shoes' },
];
const sizeTplRows = [
  { id: 'size-1', name: 'clothes', cat: '服装 < 男装 < 男士外套 < 男士羽绒服' },
  { id: 'size-2', name: '包包', cat: '服装 < 女装 < 女士套装 < 女士裤装两件套' },
  { id: 'size-3', name: 'clothes', cat: '服装 < 女装 < 女士套装 < 女士裤装两件套' },
  { id: 'size-4', name: '包包', cat: '箱包及箱包辅料 < 时装包 < 斜挎包' },
  { id: 'size-5', name: '鞋子', cat: '鞋类及鞋类辅料 < 正装鞋' },
  { id: 'size-6', name: 'clothes', cat: '女士裤子（非牛仔）' },
];

// ===== 商品基本信息 =====
const keywordModes = ['AI生成关键词', '覆盖关键词', '替换关键词', '新增关键词'];
const featureModes = ['AI生成短描', '免费生成短描', '新增短描'];
const MAX_FEATURE_TEXTS = 5;
const APPEND_FEATURE_MODE = '新增短描';
const AI_FEATURE_MODE = 'AI生成短描';
const attrBasisModes = ['平台类目属性'];

// ===== 关联产品模板 =====
// 示例数据对应接口 dh.relmodel.pageget$2.0：relModelList>modelName=产品名称，展示位数量=relModelProdList 列表长度
const MAX_TEMPLATE_SLOTS = 6;
const productTemplates = [
  { id: 'tpl-digital', modelName: '【全新未拆封】i17Pro Max 灵动岛 16+1TB 全网通5G智能手机', relModelProdList: ['P20261012001', 'P20261012002', 'P20261012003', 'P20261012004'] },
  { id: 'tpl-earbuds', modelName: '【跨境专供】无线蓝牙耳机 主动降噪 超长续航', relModelProdList: ['P20261011001'] },
  { id: 'tpl-bag', modelName: '【爆款】男士休闲双肩包 大容量防水通勤背包', relModelProdList: ['P20261010001', 'P20261010002', 'P20261010003', 'P20261010004', 'P20261010005', 'P20261010006'] },
];
const tplSyncModes = [
  { id: 'add', label: '新增产品', hint: '把当前选中的、已有产品编号的产品加入模板。最多能加几个，取决于模板的剩余展示位。' },
  { id: 'modify', label: '修改产品', hint: '用当前选中的、已有产品编号的产品直接替换模板中已有的产品，只替换不新增。' },
];
// 标题处理方式分三组，组间互斥（单选），文本处理组内部可多选
const titleOpGroups = [
  { id: 'text', ops: ['过滤文字', '追加文本', '裁剪', '随机打乱', '随机插入', '查找替换', '首字母大写'] },
  { id: 'source', ops: ['使用采集源标题'] },
  { id: 'ai', ops: ['AI生成标题'] },
];
const skuSpecValueOps = ['删除超出的字符', '删除名称中的', '查找替换', '追加文本', '清空规格属性名称'];
const specValueAppendModes = ['自定义', '自增长'];

// ===== 主图 =====
const MAX_MAIN_IMAGES = 8;

type UploadedImage = { url: string; width: number; height: number };
type MainImageMode = 'reorder' | 'replace' | 'delete' | 'append';

const mainImageModes: { id: MainImageMode; label: string; hint: string }[] = [
  { id: 'reorder', label: '调换顺序', hint: '拖拽调整主图顺序，或由系统随机打乱顺序' },
  { id: 'replace', label: '替换主图', hint: '' },
  { id: 'delete', label: '删除主图', hint: '删除指定位置的主图' },
  { id: 'append', label: '附加主图', hint: '上传新的图片附加到结尾，如果主图数量超过限制，则自动替换最后的主图（主图数量最高限制 8 张）' },
];

// ===== 视频 =====
type VideoMode = 'upload' | 'generate' | 'delete';

const videoModes: { id: VideoMode; label: string }[] = [
  { id: 'upload', label: '上传视频' },
  { id: 'generate', label: '生成视频' },
  { id: 'delete', label: '删除视频' },
];
const videoExistModes = ['保留原视频', '生成并替换原视频'];
const videoDurations = ['5 秒', '10 秒', '15 秒'];
const videoTemplates = [
  { value: 'product', label: '产品展示' },
  { value: 'ugc', label: 'UGC 种草' },
  { value: 'pain', label: '痛点解决' },
  { value: 'home', label: '家居场景' },
];
const videoRatios = ['自适应', '9:16', '16:9', '1:1', '4:3', '3:4', '21:9'];
const videoMarkets: { value: string; label: string; flag: string }[] = [
  { value: 'US', label: 'US(美国)', flag: 'US' },
  { value: 'GB', label: 'GB(英国)', flag: 'GB' },
  { value: 'DE', label: 'DE(德国)', flag: 'DE' },
  { value: 'EU', label: 'EU(欧洲)', flag: 'EU' },
  { value: 'JP', label: 'JP(日本)', flag: 'JP' },
  { value: 'KR', label: 'KR(韩国)', flag: 'KR' },
  { value: 'RU', label: 'RU(俄罗斯)', flag: 'RU' },
  { value: 'UK', label: 'UK(英国)', flag: 'GB' },
  { value: 'MX', label: 'MX(墨西哥)', flag: 'MX' },
  { value: 'SEA', label: 'SEA(东南亚)', flag: 'GLOBE' },
  { value: 'ASIA', label: 'ASIA(亚洲)', flag: 'GLOBE' },
  { value: 'LATAM', label: 'LATAM(拉美)', flag: 'GLOBE' },
  { value: 'GCC', label: 'GCC(中东)', flag: 'GLOBE' },
  { value: 'CN', label: 'CN(中国)', flag: 'CN' },
];
const videoLanguages = [
  '中文',
  '英语',
  '印尼语',
  '日语',
  '韩语',
  '法语',
  '西班牙语',
  '德语',
  '葡萄牙语',
  '意大利语',
  '俄语',
  '泰语',
  '越南语',
  '马来语',
  '荷兰语',
  '波兰语',
  '瑞典语',
  '土耳其语',
];

// ===== 详情页面 =====
const detailOps: { id: string; label: string }[] = [
  { id: 'replace-all', label: '全部替换' },
  { id: 'filter', label: '过滤详情' },
  { id: 'append', label: '追加文本' },
  { id: 'find-replace', label: '查找替换' },
  { id: 'uppercase', label: '首字母改大写' },
  { id: 'image-pre', label: '图像附加到详情前面' },
  { id: 'image-post', label: '图像附加到详情后面' },
  { id: 'delete-image', label: '删除详情图像' },
];
const detailDeleteImageModes = ['删除全部图像', '删除尺码表以外图像'];
const detailFilterOptions = [
  '过滤HTML',
  '过滤指定文字',
  '过滤电话号码',
  '过滤网址',
  '过滤所有文字',
  '去除文字链接',
  '限制字数',
  '过滤空白行',
  '过滤图片',
];
const detailAppendModes = ['自定义文本', '随机字符', '主货号', '店铺名称'];
const detailImageScopes = ['主图', 'SKU图', '自定义图片'];
const MAX_FIND_ROWS = 5;

// ===== 图片操作栏目（转白底 / 去水印 / 加水印）=====
const imageOps: { id: string; label: string; tip?: string }[] = [
  { id: 'white-bg', label: '转白底', tip: '每处理1张图片消耗xx算力' },
  { id: 'remove-watermark', label: '去水印', tip: '每处理1张图片消耗xx算力' },
  { id: 'add-watermark', label: '加水印' },
  { id: 'image-translate', label: '图片翻译', tip: '每处理1张图片消耗xx算力' },
];

const imageScopes = ['主图', '推广图', 'SKU图', '详情图'];
const removeWmVersions = ['普通版', 'pro版'];
// 翻译方式沿用「批量美图」的两种口径
const imageTranslateModes = [
  { id: 'full', title: '全量翻译', desc: '每翻译1张图片消耗 xx 算力' },
  {
    id: 'detect',
    title: '识别后翻译',
    desc: 'AI 先识别图片是否含有中文字符等需要翻译的内容：识别后无需翻译，每识别1张图片消耗 xx 算力；识别后需要翻译，翻译另需消耗 xx 算力',
  },
];

// ===== 加水印：水印配置（功能沿用「批量美图」的加水印面板）=====
type WatermarkType = 'text' | 'image';
type WatermarkPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'tile';
type WatermarkAngle = 'horizontal' | 'left' | 'right';

type WatermarkConfig = {
  type: WatermarkType;
  text: string;
  fontSize: number;
  opacity: number;
  imageName: string;
  imagePreview: string;
  imageSize: number;
  position: WatermarkPosition;
  angle: WatermarkAngle;
};

const defaultWatermarkConfig: WatermarkConfig = {
  type: 'text',
  text: '',
  fontSize: 24,
  opacity: 80,
  imageName: '',
  imagePreview: '',
  imageSize: 100,
  position: 'bottom-right',
  angle: 'horizontal',
};

const wmTemplates = [
  { id: 'tpl-1', name: '店铺LOGO水印', type: 'image' as WatermarkType },
  { id: 'tpl-2', name: '防盗用水印', type: 'text' as WatermarkType },
  { id: 'tpl-3', name: '品牌文字水印', type: 'text' as WatermarkType },
  { id: 'tpl-4', name: '品牌Logo水印', type: 'image' as WatermarkType },
];

const wmPositions: { id: WatermarkPosition; label: string }[] = [
  { id: 'top-left', label: '左上角' },
  { id: 'top-right', label: '右上角' },
  { id: 'bottom-left', label: '左下角' },
  { id: 'bottom-right', label: '右下角' },
  { id: 'tile', label: '平铺' },
];

const wmAngles: { id: WatermarkAngle; label: string }[] = [
  { id: 'horizontal', label: '横向' },
  { id: 'left', label: '向左倾斜' },
  { id: 'right', label: '向右倾斜' },
];

// 图片水印模板的占位预览图（与「批量美图」一致）
const wmLogoPreview =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2U4ZThlOCIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7mm7TlvZPmo4DmmKPmlrA8L3RleHQ+PC9zdmc+';

const UploadLineIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const CloudUploadIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
    <polyline points="15 11 12 8 9 11" />
    <line x1="12" y1="16" x2="12" y2="8" />
  </svg>
);

const ShuffleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 3 21 3 21 8" />
    <line x1="4" y1="20" x2="21" y2="3" />
    <polyline points="21 16 21 21 16 21" />
    <line x1="15" y1="15" x2="21" y2="21" />
    <line x1="4" y1="4" x2="9" y2="9" />
  </svg>
);

const ResetIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </svg>
);

const RefreshCycleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

const PictureIcon = () => (
  <svg width="62" height="62" viewBox="0 0 24 24" fill="none" stroke="#c0c4cc" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

function readImageFile(file: File): Promise<UploadedImage | null> {
  if (!file.type.startsWith('image/')) return Promise.resolve(null);
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ url, width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

const sizeText = (img: UploadedImage) => `${img.width}*${img.height}`;

const numValue = (prev: string, delta: number) =>
  String(Math.max(0, Math.round(Number(prev || 0) + delta)));

const thumbMenuItems = ['AI图像编辑', '高级图像翻译', '快速裁剪'];

const TrashIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
  </svg>
);

// 悬停已上传图片时的操作：右上角删除 + 下方操作菜单（菜单项为系统已有功能，这里只展示入口）
function ImageHoverActions({ onDelete }: { onDelete?: () => void }) {
  return (
    <>
      <button
        className="ae-thumb-del"
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete?.();
        }}
      >
        <TrashIcon />
      </button>
      <div className="ae-thumb-menu">
        {thumbMenuItems.map((item) => (
          <div key={item} className="ae-thumb-menu-item">{item}</div>
        ))}
      </div>
    </>
  );
}

function UploadBox({ image, text = '点击', onOpen, onActivate, onDelete }: {
  image?: UploadedImage;
  text?: string;
  onOpen?: () => void;
  onActivate?: () => void;
  onDelete?: () => void;
}) {
  return (
    <div
      className={`ae-upload${image ? ' ae-thumb is-filled' : ''}`}
      onMouseDown={onActivate}
      onClick={image ? undefined : onOpen}
    >
      {image ? (
        <>
          <img src={image.url} alt="" />
          <span className="ae-size">{sizeText(image)}</span>
          <ImageHoverActions onDelete={onDelete} />
        </>
      ) : (
        <>
          <CloudUploadIcon />
          <span className="ae-upload-text">{text}</span>
        </>
      )}
    </div>
  );
}

// 模拟已上传的示例图片效果
function SampleImage({ src, size, onDelete }: { src: string; size: string; onDelete?: () => void }) {
  return (
    <div className="ae-sample ae-thumb">
      <img src={src} alt="" />
      <span className="ae-size">{size}</span>
      <ImageHoverActions onDelete={onDelete} />
    </div>
  );
}

function PositionHead({ position, isFirst }: { position: number; isFirst: boolean }) {
  return (
    <>
      {isFirst ? <span className="ae-pos-tag">首图</span> : <span className="ae-pos-spacer" />}
      <span className="ae-pos-badge">位置{position}</span>
    </>
  );
}

// 加水印卡片：水印模板 / 类型 / 参数 / 位置；选中水印模板后才出现「保存模板」
function WatermarkCard({ config, onConfigChange, templateId, onPickTemplate }: {
  config: WatermarkConfig;
  onConfigChange: (partial: Partial<WatermarkConfig>) => void;
  templateId: string;
  onPickTemplate: (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [savedTip, setSavedTip] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const selected = wmTemplates.find((t) => t.id === templateId);

  useEffect(() => {
    if (!savedTip) return;
    const timer = window.setTimeout(() => setSavedTip(''), 2000);
    return () => window.clearTimeout(timer);
  }, [savedTip]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const uploaded = await readImageFile(file);
    if (!uploaded) return;
    onConfigChange({ imageName: file.name, imagePreview: uploaded.url });
  };

  return (
    <div className="ae-wm-card" data-annotation-id="watermark-card">
      <div className="ae-wm-row">
        <span className="ae-wm-label">水印模板</span>
        <div className="ae-wm-dropdown">
          <button className="ae-wm-select" type="button" onClick={() => setMenuOpen((v) => !v)}>
            <span className={selected ? '' : 'is-placeholder'}>{selected ? selected.name : '选择水印模板'}</span>
            <ChevronDown />
          </button>
          {menuOpen && (
            <div className="ae-wm-menu">
              {wmTemplates.map((tpl) => (
                <div
                  key={tpl.id}
                  className={`ae-wm-menu-item${tpl.id === templateId ? ' is-active' : ''}`}
                  onClick={() => {
                    onPickTemplate(tpl.id);
                    setMenuOpen(false);
                  }}
                >
                  {tpl.name}
                </div>
              ))}
            </div>
          )}
        </div>
        <button className="ae-wm-link" type="button">创建模板</button>
        <button className="ae-wm-link" type="button">管理模板</button>
      </div>

      <div className="ae-wm-row">
        <span className="ae-wm-label">水印类型</span>
        <div className="ae-radio-group">
          {([['text', '文字水印'], ['image', '图片水印']] as const).map(([type, label]) => (
            <label key={type} className="ae-radio">
              <input
                type="radio"
                name="wmType"
                checked={config.type === type}
                onChange={() => onConfigChange({ type })}
              />
              <span className="ae-radio-mask" />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>

      {config.type === 'text' ? (
        <>
          <div className="ae-wm-row">
            <label className="ae-wm-label">水印文字</label>
            <input
              className="ae-wm-input"
              type="text"
              placeholder="请输入水印文字"
              value={config.text}
              onChange={(e) => onConfigChange({ text: e.target.value })}
            />
          </div>
          <div className="ae-wm-row">
            <label className="ae-wm-label">字号</label>
            <div className="ae-wm-slider-row">
              <input
                className="ae-wm-slider"
                type="range"
                min={18}
                max={48}
                value={config.fontSize}
                onChange={(e) => onConfigChange({ fontSize: Number(e.target.value) })}
              />
              <span className="ae-wm-slider-value">{config.fontSize}</span>
            </div>
          </div>
          <div className="ae-wm-row">
            <label className="ae-wm-label">透明度</label>
            <div className="ae-wm-slider-row">
              <input
                className="ae-wm-slider"
                type="range"
                min={20}
                max={100}
                value={config.opacity}
                onChange={(e) => onConfigChange({ opacity: Number(e.target.value) })}
              />
              <span className="ae-wm-slider-value">{config.opacity}%</span>
            </div>
          </div>
          <div className="ae-wm-row">
            <span className="ae-wm-label">预览</span>
            <div className="ae-wm-preview">
              {config.text
                ? <span style={{ fontSize: config.fontSize, opacity: config.opacity / 100 }}>{config.text}</span>
                : <span className="ae-wm-preview-empty">未填写水印文字</span>}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="ae-wm-row">
            <span className="ae-wm-label">图片上传</span>
            <input ref={fileRef} type="file" accept="image/*" className="ae-wm-file" onChange={handleUpload} />
            <button className="ae-wm-upload" type="button" onClick={() => fileRef.current?.click()}>
              <UploadLineIcon />
              <span>{config.imageName || '点击上传图片'}</span>
            </button>
          </div>
          <div className="ae-wm-row">
            <label className="ae-wm-label">大小</label>
            <div className="ae-wm-slider-row">
              <input
                className="ae-wm-slider"
                type="range"
                min={50}
                max={200}
                value={config.imageSize}
                onChange={(e) => onConfigChange({ imageSize: Number(e.target.value) })}
              />
              <span className="ae-wm-slider-value">{config.imageSize}%</span>
            </div>
          </div>
          <div className="ae-wm-row">
            <label className="ae-wm-label">透明度</label>
            <div className="ae-wm-slider-row">
              <input
                className="ae-wm-slider"
                type="range"
                min={20}
                max={100}
                value={config.opacity}
                onChange={(e) => onConfigChange({ opacity: Number(e.target.value) })}
              />
              <span className="ae-wm-slider-value">{config.opacity}%</span>
            </div>
          </div>
          <div className="ae-wm-row">
            <span className="ae-wm-label">预览</span>
            <div className="ae-wm-preview">
              {config.imagePreview
                ? <img src={config.imagePreview} alt="" style={{ width: config.imageSize * 0.6, opacity: config.opacity / 100 }} />
                : <span className="ae-wm-preview-empty">未上传图片</span>}
            </div>
          </div>
        </>
      )}

      <div className="ae-wm-row">
        <span className="ae-wm-label">水印位置</span>
        <div className="ae-radio-group">
          {wmPositions.map((pos) => (
            <label key={pos.id} className="ae-radio">
              <input
                type="radio"
                name="wmPosition"
                checked={config.position === pos.id}
                onChange={() => onConfigChange({ position: pos.id })}
              />
              <span className="ae-radio-mask" />
              <span>{pos.label}</span>
            </label>
          ))}
        </div>
      </div>

      {config.position === 'tile' && (
        <div className="ae-wm-row">
          <span className="ae-wm-label">水印角度</span>
          <div className="ae-radio-group">
            {wmAngles.map((angle) => (
              <label key={angle.id} className="ae-radio">
                <input
                  type="radio"
                  name="wmAngle"
                  checked={config.angle === angle.id}
                  onChange={() => onConfigChange({ angle: angle.id })}
                />
                <span className="ae-radio-mask" />
                <span>{angle.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {selected && (
        <div className="ae-wm-actions">
          <button className="ae-wm-save" type="button" onClick={() => setSavedTip('模板已更新')}>保存模板</button>
          {savedTip && <span className="ae-wm-tip">{savedTip}</span>}
        </div>
      )}
    </div>
  );
}

// ===== Row component =====
function FormRow({ label, labelTip, checked, onCheck, children, last, disabled, flush, bodyClass, annotationId, labelTop }: {
  label: string;
  labelTip?: string;
  checked?: boolean;
  onCheck?: () => void;
  children: React.ReactNode;
  last?: boolean;
  disabled?: boolean;
  flush?: boolean;
  bodyClass?: string;
  annotationId?: string;
  labelTop?: boolean;
}) {
  return (
    <div
      className={`ae-row${last ? ' ae-row-last' : ''}${disabled ? ' is-disabled' : ''}${flush ? ' is-flush' : ''}${labelTip ? ' has-label-tip' : ''}${labelTop ? ' has-label-top' : ''}`}
    >
      <div className="ae-row-label" data-annotation-id={annotationId}>
        <label className="ae-checkbox">
          <input
            type="checkbox"
            checked={!!checked}
            onChange={onCheck}
            disabled={disabled}
          />
          <span className="ae-checkbox-mask" />
        </label>
        <span className="ae-row-label-text">{label}</span>
        {labelTip && (
          <span className="ae-label-tip" data-tip={labelTip} aria-label={labelTip}>
            <span className="ae-label-tip-icon">?</span>
          </span>
        )}
      </div>
      <div className={`ae-row-body${bodyClass ? ' ' + bodyClass : ''}`}>{children}</div>
    </div>
  );
}

// ===== 详情页面：数字输入框（右侧上下调节）=====
function ProcNumber({ value, onChange, placeholder, min = 1 }: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  min?: number;
}) {
  const step = (delta: number) => {
    const next = Math.max(min, Number(value || 0) + delta);
    onChange(String(next));
  };
  return (
    <div className="ae-proc-num">
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ''))}
      />
      <span className="ae-proc-num-ctl">
        <button type="button" aria-label="增加" onClick={() => step(1)}>▲</button>
        <button type="button" aria-label="减少" onClick={() => step(-1)}>▼</button>
      </span>
    </div>
  );
}

// ===== 详情页面：富文本编辑器外壳 =====
function RichEditor({ placeholder, height = 200 }: { placeholder: string; height?: number }) {
  return (
    <div className="ae-rich" style={{ height }}>
      <div className="ae-rich-toolbar">
        <span className="ae-rich-tool"><b>B</b></span>
        <span className="ae-rich-tool"><i>I</i></span>
        <span className="ae-rich-tool"><u>U</u></span>
        <span className="ae-rich-sep" />
        <span className="ae-rich-tool">字号</span>
        <span className="ae-rich-tool">图片</span>
        <span className="ae-rich-tool">模板</span>
      </div>
      <div className="ae-rich-body" contentEditable suppressContentEditableWarning data-placeholder={placeholder} />
    </div>
  );
}

// ===== 详情页面：追加文本（前缀 / 后缀）=====
type DetailAppendState = { on: boolean; mode: string; text: string; len: string; rich: string };

function DetailAppendBlock({ title, state, onChange }: {
  title: string;
  state: DetailAppendState;
  onChange: (patch: Partial<DetailAppendState>) => void;
}) {
  return (
    <div className="ae-append-block">
      <label className="ae-check-line">
        <input
          type="checkbox"
          checked={state.on}
          onChange={() => onChange(state.on ? { on: false, mode: '', text: '', len: '', rich: '' } : { on: true })}
        />
        <span className="ae-checkbox-mask" />
        <span>{title}</span>
      </label>

      {state.on && (
        <div className="ae-append-sub">
          <div className="ae-radio-group">
            {detailAppendModes.map((mode) => (
              <label key={mode} className="ae-radio">
                <input
                  type="radio"
                  name={`detailAppend-${title}`}
                  checked={state.mode === mode}
                  onChange={() => onChange({ mode })}
                />
                <span className="ae-radio-mask" />
                <span>{mode}</span>
              </label>
            ))}
          </div>

          {state.mode === '自定义文本' && (
            <>
              <div className="ae-seg">
                <button
                  className={`ae-seg-btn${state.rich === 'text' ? ' active' : ''}`}
                  type="button"
                  onClick={() => onChange({ rich: 'text' })}
                >
                  纯文本
                </button>
                <button
                  className={`ae-seg-btn${state.rich === 'rich' ? ' active' : ''}`}
                  type="button"
                  onClick={() => onChange({ rich: 'rich' })}
                >
                  富文本
                </button>
              </div>
              {state.rich === 'text' && (
                <div className="ae-proc-field">
                  <textarea
                    className="ae-proc-textarea"
                    rows={3}
                    placeholder="请输入自定义文本"
                    value={state.text}
                    onChange={(e) => onChange({ text: e.target.value })}
                  />
                  <div className="ae-proc-vars">
                    插入变量：
                    <span className="ae-var-tag">%subject%</span>
                    <span className="ae-var-tag">%skucode%</span>
                  </div>
                </div>
              )}
              {state.rich === 'rich' && <RichEditor placeholder="请输入自定义文本" height={180} />}
            </>
          )}

          {state.mode === '随机字符' && (
            <div className="ae-proc-field">
              <ProcNumber value={state.len} onChange={(v) => onChange({ len: v })} placeholder="字符数" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ===== 商品规格值：追加文本配置块 =====
function SvAppendBlock({
  title,
  on,
  onToggle,
  mode,
  onModeChange,
  children,
}: {
  title: string;
  on: boolean;
  onToggle: () => void;
  mode: string;
  onModeChange: (mode: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="ae-sv-block">
      <label className="ae-check-line">
        <input type="checkbox" checked={on} onChange={onToggle} />
        <span className="ae-checkbox-mask" />
        <span>{title}</span>
      </label>
      <div className="ae-radio-group ae-sv-radios">
        {specValueAppendModes.map((item) => (
          <label key={item} className="ae-radio">
            <input
              type="radio"
              name={`specValueAppend-${title}`}
              checked={mode === item}
              onChange={() => onModeChange(item)}
            />
            <span className="ae-radio-mask" />
            <span>{item}</span>
          </label>
        ))}
      </div>
      <div className={`ae-sv-control${on ? '' : ' is-off'}`}>{children}</div>
    </div>
  );
}

function SvStepper({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  return (
    <div className={`ae-num-stepper${disabled ? ' is-disabled' : ''}`}>
      <button
        className="ae-num-btn"
        type="button"
        disabled={disabled}
        onClick={() => onChange(numValue(value, -1))}
      >
        −
      </button>
      <input
        className="ae-num-value"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        className="ae-num-btn"
        type="button"
        disabled={disabled}
        onClick={() => onChange(numValue(value, 1))}
      >
        +
      </button>
    </div>
  );
}

// ===== 关联产品模板：按店铺分别关联 =====
type ShopTplState = { tplId: string; mode: string };
const defaultShopTpl: ShopTplState = { tplId: '', mode: '' };

function ProductTplBlock({
  shopId,
  state,
  menuOpen,
  menuPos,
  onOpenMenu,
  onPickTpl,
  onModeChange,
  annotationId,
}: {
  shopId: string;
  state: ShopTplState;
  menuOpen: boolean;
  menuPos: { left: number; top?: number; bottom?: number; minWidth: number; maxWidth: number } | null;
  onOpenMenu: (trigger: HTMLDivElement) => void;
  onPickTpl: (id: string) => void;
  onModeChange: (mode: string) => void;
  annotationId?: string;
}) {
  const selectedTpl = productTemplates.find((t) => t.id === state.tplId);
  const remainSlots = selectedTpl ? MAX_TEMPLATE_SLOTS - selectedTpl.relModelProdList.length : 0;
  return (
    <div className="ae-svc-tpl" data-annotation-id={annotationId}>
      <div className="ae-tpl-line">
        <div className="ae-svc-field">
          <span className="ae-svc-label">产品模板</span>
          <div className="ae-dropdown ae-tpl-dropdown" onClick={(e) => onOpenMenu(e.currentTarget)}>
            <span className={selectedTpl ? 'ae-dropdown-value' : 'ae-dropdown-placeholder'} title={selectedTpl?.modelName}>
              {selectedTpl ? `展示位剩余${remainSlots}` : '请选择产品模板'}
            </span>
            <ChevronDown />
            {menuOpen && menuPos && (
              <div className="ae-wm-menu ae-wm-menu--fixed" style={menuPos} onClick={(e) => e.stopPropagation()}>
                {productTemplates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className={`ae-wm-menu-item${tpl.id === state.tplId ? ' is-active' : ''}`}
                    title={tpl.modelName}
                    onClick={(e) => {
                      e.stopPropagation();
                      onPickTpl(tpl.id);
                    }}
                  >
                    {`展示位剩余${MAX_TEMPLATE_SLOTS - tpl.relModelProdList.length}`}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {selectedTpl && (
        <div className={`ae-tpl-slots${remainSlots <= 0 ? ' is-exhausted' : ''}`}>
          剩余展示位：{remainSlots}（最多{MAX_TEMPLATE_SLOTS}个展示位）
        </div>
      )}
      {selectedTpl && (
        <div className="ae-radio-group">
          {tplSyncModes.map((mode) => {
            const addDisabled = mode.id === 'add' && remainSlots <= 0;
            return (
              <label key={mode.id} className={`ae-radio${addDisabled ? ' is-disabled' : ''}`}>
                <input
                  type="radio"
                  name={`productTplMode-${shopId}`}
                  disabled={addDisabled}
                  checked={state.mode === mode.id}
                  onChange={() => onModeChange(mode.id)}
                />
                <span className="ae-radio-mask" />
                <span>{mode.label}</span>
                {addDisabled && <span className="ae-opt-warn">（展示位已满）</span>}
              </label>
            );
          })}
        </div>
      )}
      {selectedTpl && state.mode && (
        <div className="ae-hint sub">{tplSyncModes.find((m) => m.id === state.mode)?.hint}</div>
      )}
    </div>
  );
}

// ===== Main =====
export default function AutoEditDialog() {
  const [activeMenu, setActiveMenu] = useState('basic');
  const [basicChecked, setBasicChecked] = useState<Record<string, boolean>>({});
  const [keywordMode, setKeywordMode] = useState('');
  const [featureMode, setFeatureMode] = useState('');
  const [featureTexts, setFeatureTexts] = useState<string[]>([]);
  const [attrBasis, setAttrBasis] = useState('');
  const [attrChecked, setAttrChecked] = useState(false);
  const [brandValue, setBrandValue] = useState('');
  const [weight, setWeight] = useState('');
  const [titleOpsOn, setTitleOpsOn] = useState<string[]>([]);
  const [aiTitleKeywords, setAiTitleKeywords] = useState('');
  const [aiFeatureKeywords, setAiFeatureKeywords] = useState('');
  const [tagAdd, setTagAdd] = useState(false);
  const [tagRemove, setTagRemove] = useState(false);
  const [mainImageChecked, setMainImageChecked] = useState(false);
  const [mainImageMode, setMainImageMode] = useState<MainImageMode | ''>('');
  // 视频：上传 / 生成 / 删除；生成视频时下方展开配置卡片
  const [videoMode, setVideoMode] = useState<VideoMode | ''>('');
  const [videoExistMode, setVideoExistMode] = useState('');
  const [videoDuration, setVideoDuration] = useState(videoDurations[0]);
  const [videoTemplate, setVideoTemplate] = useState('product');
  const [videoRatio, setVideoRatio] = useState(videoRatios[0]);
  const [videoMarket, setVideoMarket] = useState('US');
  const [videoLanguage, setVideoLanguage] = useState('英语');
  const [videoPick, setVideoPick] = useState<{
    id: 'market' | 'language';
    left: number;
    width: number;
    maxHeight: number;
    top?: number;
    bottom?: number;
  } | null>(null);
  const videoPickTrigger = useRef<HTMLElement | null>(null);

  // ===== 详情页面 =====
  const [detailChecked, setDetailChecked] = useState(false);
  const [detailOpsOn, setDetailOpsOn] = useState<string[]>([]);
  const [detailReplaceMode, setDetailReplaceMode] = useState<'text' | 'rich'>('text');
  const [detailReplaceText, setDetailReplaceText] = useState('');
  const [detailFilterChecks, setDetailFilterChecks] = useState<string[]>([]);
  const [detailFilterText, setDetailFilterText] = useState('');
  const [detailFilterLimit, setDetailFilterLimit] = useState('');
  const [detailAppendPrefix, setDetailAppendPrefix] = useState({ on: false, mode: '', text: '', len: '', rich: '' });
  const [detailAppendSuffix, setDetailAppendSuffix] = useState({ on: false, mode: '', text: '', len: '', rich: '' });
  const [detailFindRows, setDetailFindRows] = useState<{ find: string; replace: string }[]>([{ find: '', replace: '' }]);
  const [detailDeleteImageMode, setDetailDeleteImageMode] = useState('');
  const [detailImageChecks, setDetailImageChecks] = useState<Record<string, string[]>>({ 'image-pre': [], 'image-post': [] });
  const [detailImageCustom, setDetailImageCustom] = useState<Record<string, UploadedImage | null>>({ 'image-pre': null, 'image-post': null });
  const [slotIds, setSlotIds] = useState<number[]>(() =>
    Array.from({ length: MAX_MAIN_IMAGES }, (_, i) => i + 1));
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [replaceImages, setReplaceImages] = useState<Record<number, UploadedImage>>({});
  const [deletedPositions, setDeletedPositions] = useState<number[]>([]);
  const [appendImages, setAppendImages] = useState<UploadedImage[]>([]);
  const [uploadDialog, setUploadDialog] = useState<'replace' | 'append' | null>(null);
  const [tplByShop, setTplByShop] = useState<Record<string, { tplId: string; mode: string }>>({});
  const [tplMenuFor, setTplMenuFor] = useState('');
  const [tplMenuPos, setTplMenuPos] = useState<{ left: number; top?: number; bottom?: number; minWidth: number; maxWidth: number } | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 2000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!tplMenuFor) return;
    const close = () => {
      setTplMenuFor('');
      setTplMenuPos(null);
    };
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [tplMenuFor]);
  const [sampleAtPos3, setSampleAtPos3] = useState(true);
  const [appendSample, setAppendSample] = useState(true);
  const pasteTargetRef = useRef<{ kind: 'append' } | null>(null);

  // ===== 转白底 / 去水印 / 加水印 =====
  const [imageOpChecked, setImageOpChecked] = useState<Record<string, boolean>>({});
  const [imageOpScopes, setImageOpScopes] = useState<Record<string, string[]>>({});
  const [removeWmVersion, setRemoveWmVersion] = useState('普通版');
  const [imageTranslateMode, setImageTranslateMode] = useState('full');

  const toggleImageOpRow = (id: string) =>
    setImageOpChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      if (!next[id]) setImageOpScopes((s) => ({ ...s, [id]: [] }));
      return next;
    });

  const toggleImageOpScope = (id: string, scope: string) =>
    setImageOpScopes((prev) => {
      const current = prev[id] ?? [];
      const adding = !current.includes(scope);
      if (adding) setImageOpChecked((s) => ({ ...s, [id]: true }));
      return {
        ...prev,
        [id]: adding ? [...current, scope] : current.filter((v) => v !== scope),
      };
    });

  // ===== 加水印：水印配置 =====
  const [wmConfig, setWmConfig] = useState<WatermarkConfig>(defaultWatermarkConfig);
  const [wmTemplateId, setWmTemplateId] = useState('');

  const patchWmConfig = (partial: Partial<WatermarkConfig>) =>
    setWmConfig((prev) => ({ ...prev, ...partial }));

  const pickWmTemplate = (id: string) => {
    setWmTemplateId(id);
    const tpl = wmTemplates.find((t) => t.id === id);
    if (!tpl) return;
    patchWmConfig(tpl.type === 'image'
      ? { type: 'image', imageName: `${tpl.name}.png`, imagePreview: wmLogoPreview }
      : { type: 'text', text: tpl.name, imageName: '', imagePreview: '' });
  };

  const handleSubmit = () => {
    if (basicChecked.video && videoMode === 'generate' && !videoExistMode) {
      setToast('请选择已有视频的商品处理方式');
      return;
    }
    const watermarkOn = !!imageOpChecked['add-watermark'];
    const watermarkScopes = imageOpScopes['add-watermark'] ?? [];
    if (watermarkOn && watermarkScopes.length > 0) {
      const incomplete = wmConfig.type === 'text' ? !wmConfig.text.trim() : !wmConfig.imageName;
      if (incomplete) {
        setToast(wmConfig.type === 'text' ? '请先输入水印文字后再提交' : '请先上传水印图片后再提交');
        return;
      }
    }
    setToast('提交成功');
  };

  // ===== 服务 =====
  const [serviceChecked, setServiceChecked] = useState<Record<string, boolean>>({});
  const [gradeMode, setGradeMode] = useState('');

  const toggleServiceRow = (id: string) =>
    setServiceChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      if (!next[id] && id === 'grade') setGradeMode('');
      return next;
    });

  const patchShopTpl = (shopId: string, patch: Partial<ShopTplState>) =>
    setTplByShop((prev) => {
      const next = { ...(prev[shopId] ?? defaultShopTpl), ...patch };
      const tpl = productTemplates.find((t) => t.id === next.tplId);
      if (tpl && tpl.relModelProdList.length >= MAX_TEMPLATE_SLOTS && next.mode === 'add') next.mode = '';
      return { ...prev, [shopId]: next };
    });

  // ===== SKU信息 =====
  const [skuChecked, setSkuChecked] = useState<Record<string, boolean>>({});
  const [skuSaleStatus, setSkuSaleStatus] = useState('');
  const [skuSpecCover, setSkuSpecCover] = useState('');
  const [skuSpecPrice, setSkuSpecPrice] = useState('');
  const [skuSpecs, setSkuSpecs] = useState<string[]>([]);
  const [skuSpecValueOp, setSkuSpecValueOp] = useState('');
  const [specValueKeywords, setSpecValueKeywords] = useState('');
  const [specValueRules, setSpecValueRules] = useState<{ find: string; replace: string }[]>([
    { find: '', replace: '' },
  ]);
  const [prefixOn, setPrefixOn] = useState(true);
  const [prefixMode, setPrefixMode] = useState(specValueAppendModes[0]);
  const [prefixText, setPrefixText] = useState('');
  const [prefixStart, setPrefixStart] = useState('0');
  const [suffixOn, setSuffixOn] = useState(false);
  const [suffixMode, setSuffixMode] = useState(specValueAppendModes[1]);
  const [suffixText, setSuffixText] = useState('');
  const [suffixStart, setSuffixStart] = useState('0');
  const [skuCodeOpts, setSkuCodeOpts] = useState<string[]>([]);
  const [skuWeightMode, setSkuWeightMode] = useState('');
  const [stockCalc, setStockCalc] = useState('');
  const [stockQty, setStockQty] = useState('');
  const [stockZeroSkip, setStockZeroSkip] = useState(false);

  const toggleSkuRow = (id: string) =>
    setSkuChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      if (next[id]) return next;
      if (id === 'sale-status') setSkuSaleStatus('');
      if (id === 'spec') {
        setSkuSpecCover('');
        setSkuSpecPrice('');
        setSkuSpecs([]);
      }
      if (id === 'code') setSkuCodeOpts([]);
      if (id === 'spec-value') setSkuSpecValueOp('');
      if (id === 'weight') setSkuWeightMode('');
      if (id === 'stock') {
        setStockCalc('');
        setStockZeroSkip(false);
      }
      return next;
    });

  const toggleSkuCodeOpt = (opt: string) =>
    setSkuCodeOpts((prev) => (prev.includes(opt) ? prev.filter((v) => v !== opt) : [...prev, opt]));

  const pickSpecValueOp = (mode: string) => {
    setSkuSpecValueOp(mode);
    setSkuChecked((prev) => (prev['spec-value'] ? prev : { ...prev, 'spec-value': true }));
  };

  const updateSpecValueRule = (index: number, patch: Partial<{ find: string; replace: string }>) =>
    setSpecValueRules((prev) => prev.map((rule, i) => (i === index ? { ...rule, ...patch } : rule)));

  const typePrefixText = (value: string) => {
    setPrefixText(value);
    if (value) setPrefixOn(true);
  };

  const typeSuffixText = (value: string) => {
    setSuffixText(value);
    if (value) setSuffixOn(true);
  };

  const stepStockQty = (delta: number) => {
    ensureSku('stock');
    setStockQty((prev) => numValue(prev, delta));
  };

  const positions = Array.from({ length: MAX_MAIN_IMAGES }, (_, i) => i + 1);
  const currentHint = mainImageModes.find((m) => m.id === mainImageMode)?.hint;

  const toggleMainImage = () =>
    setMainImageChecked((prev) => {
      if (prev) setMainImageMode('');
      return !prev;
    });

  const shuffleOrder = () =>
    setSlotIds((prev) => {
      const next = [...prev];
      for (let i = next.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [next[i], next[j]] = [next[j], next[i]];
      }
      return next;
    });

  const resetOrder = () =>
    setSlotIds(Array.from({ length: MAX_MAIN_IMAGES }, (_, i) => i + 1));

  // 视频：点选任一方式即视为启用该行
  const selectVideoMode = (mode: VideoMode) => {
    ensureBasic('video');
    setVideoMode(mode);
    setVideoPick(null);
  };

  const placeVideoPick = (id: 'market' | 'language', trigger: HTMLElement) => {
    const rect = trigger.getBoundingClientRect();
    const bounds = trigger.closest('.ae-content')?.getBoundingClientRect();
    const spaceBelow = (bounds?.bottom ?? window.innerHeight) - rect.bottom;
    const spaceAbove = rect.top - (bounds?.top ?? 0);
    // 优先向上展开（与编辑产品弹窗一致），上方放不下时改为向下；高度跟随可用空间
    const openUp = spaceAbove >= 280 || spaceAbove > spaceBelow;
    const maxHeight = Math.max(160, Math.min(272, (openUp ? spaceAbove : spaceBelow) - 8));
    setVideoPick({
      id,
      left: rect.left,
      width: rect.width,
      maxHeight,
      ...(openUp ? { bottom: window.innerHeight - rect.top + 4 } : { top: rect.bottom + 4 }),
    });
  };

  const toggleVideoPick = (id: 'market' | 'language', trigger: HTMLElement) => {
    if (videoPick?.id === id) {
      setVideoPick(null);
      return;
    }
    videoPickTrigger.current = trigger;
    placeVideoPick(id, trigger);
  };

  // 销售国家/地区、语言下拉：点外部收起，滚动/缩放时跟随触发元素重新定位
  useEffect(() => {
    if (!videoPick) return;
    const onDown = (e: MouseEvent) => {
      if (videoPickTrigger.current?.contains(e.target as Node)) return;
      setVideoPick(null);
    };
    const reposition = () => {
      if (videoPickTrigger.current) placeVideoPick(videoPick.id, videoPickTrigger.current);
    };
    document.addEventListener('mousedown', onDown);
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
    };
  }, [videoPick]);

  // ===== 详情页面：点选处理方式即视为启用该行 =====
  const toggleDetailOp = (id: string) => {
    setDetailChecked(true);
    setDetailOpsOn((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  };

  const removeDetailOp = (id: string) => setDetailOpsOn((prev) => prev.filter((v) => v !== id));

  const toggleDetailRow = () => {
    if (detailChecked) {
      setDetailOpsOn([]);
      setDetailFilterChecks([]);
      setDetailFilterText('');
      setDetailFilterLimit('');
      setDetailFindRows([{ find: '', replace: '' }]);
      setDetailDeleteImageMode('');
      setDetailImageChecks({ 'image-pre': [], 'image-post': [] });
      setDetailImageCustom({ 'image-pre': null, 'image-post': null });
      setDetailAppendPrefix({ on: false, mode: '', text: '', len: '', rich: '' });
      setDetailAppendSuffix({ on: false, mode: '', text: '', len: '', rich: '' });
      setDetailReplaceMode('text');
      setDetailReplaceText('');
    }
    setDetailChecked(!detailChecked);
  };

  const toggleDetailFilter = (opt: string) =>
    setDetailFilterChecks((prev) => (prev.includes(opt) ? prev.filter((v) => v !== opt) : [...prev, opt]));

  const toggleDetailImageScope = (opId: string, scope: string) =>
    setDetailImageChecks((prev) => {
      const current = prev[opId] ?? [];
      return {
        ...prev,
        [opId]: current.includes(scope) ? current.filter((v) => v !== scope) : [...current, scope],
      };
    });

  const patchDetailAppend = (
    which: 'prefix' | 'suffix',
    patch: Partial<{ on: boolean; mode: string; text: string; len: string; rich: string }>,
  ) =>
    (which === 'prefix' ? setDetailAppendPrefix : setDetailAppendSuffix)((prev) => ({ ...prev, ...patch }));

  const patchDetailFindRow = (index: number, patch: Partial<{ find: string; replace: string }>) =>
    setDetailFindRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  const uploadDetailImage = async (opId: string, file?: File) => {
    if (!file) return;
    const uploaded = await readImageFile(file);
    if (!uploaded) return;
    setDetailImageCustom((prev) => ({ ...prev, [opId]: uploaded }));
  };

  const selectFeatureMode = (mode: string) => {
    // 点击任一短描方式即视为启用该行
    ensureBasic('feature');
    setFeatureMode(mode);
    if (mode !== APPEND_FEATURE_MODE) setFeatureTexts([]);
  };

  const addFeatureText = () =>
    setFeatureTexts((prev) => (prev.length >= MAX_FEATURE_TEXTS ? prev : [...prev, '']));

  const removeFeatureText = (index: number) =>
    setFeatureTexts((prev) => prev.filter((_, i) => i !== index));

  const updateFeatureText = (index: number, value: string) =>
    setFeatureTexts((prev) => prev.map((v, i) => (i === index ? value : v)));

  // 点选行内选项时自动勾选左侧行项目，不用先勾选
  const ensureBasic = (id: string) =>
    setBasicChecked((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
  const ensureSku = (id: string) =>
    setSkuChecked((prev) => (prev[id] ? prev : { ...prev, [id]: true }));

  const toggleBasicRow = (id: string) =>
    setBasicChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      if (next[id]) return next;
      if (id === 'keyword') setKeywordMode('');
      if (id === 'feature') {
        setFeatureMode('');
        setFeatureTexts([]);
        setAiFeatureKeywords('');
      }
      if (id === 'category') setAttrBasis('');
      if (id === 'weight') setWeight('');
      if (id === 'title') {
        setTitleOpsOn([]);
        setAiTitleKeywords('');
      }
      if (id === 'tag') {
        setTagAdd(false);
        setTagRemove(false);
      }
      if (id === 'video') {
        setVideoMode('');
        setVideoExistMode('');
      }
      return next;
    });

  // 组间互斥：选中某一组时清空其他组的已选项；组内仍可多选
  const toggleTitleOp = (op: string) => {
    ensureBasic('title');
    setTitleOpsOn((prev) => {
      if (prev.includes(op)) return prev.filter((v) => v !== op);
      const group = titleOpGroups.find((item) => item.ops.includes(op));
      const otherOps = titleOpGroups
        .filter((item) => item !== group)
        .flatMap((item) => item.ops);
      return [...prev.filter((v) => !otherOps.includes(v)), op];
    });
  };

  const stepWeight = (delta: number) => {
    ensureBasic('weight');
    setWeight((prev) => {
      const value = Math.max(0, Math.round((Number(prev || 0) + delta) * 1000) / 1000);
      return String(value);
    });
  };

  // 拖拽经过某个位置时立即换位，而不是松手才生效
  const handleDragEnter = (index: number) => {
    if (dragIndex === null || dragIndex === index) return;
    setSlotIds((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(index, 0, moved);
      return next;
    });
    setDragIndex(index);
  };

  // 自定义拖拽影像：只带方块，不带「首图 / 位置」标签
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    const ghost = document.createElement('div');
    ghost.className = 'ae-drag-ghost';
    ghost.textContent = `主图${slotIds[index]}`;
    document.body.appendChild(ghost);
    e.dataTransfer?.setDragImage(ghost, 44, 44);
    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
    window.setTimeout(() => ghost.remove(), 0);
    setDragIndex(index);
  };

  useEffect(() => {
    if (!mainImageChecked) return;
    const onPaste = async (e: ClipboardEvent) => {
      const target = pasteTargetRef.current;
      if (!target) return;
      if (target.kind !== 'append' || mainImageMode !== 'append') return;
      const file = Array.from(e.clipboardData?.files ?? []).find((f) => f.type.startsWith('image/'));
      if (!file) return;
      e.preventDefault();
      const uploaded = await readImageFile(file);
      if (!uploaded) return;
      setAppendImages((prev) => (prev.length >= MAX_MAIN_IMAGES ? prev : [...prev, uploaded]));
    };
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, [mainImageChecked, mainImageMode]);

  return (
    <>
    <div className="ae-overlay">
      <div className="ae-modal" role="dialog" aria-modal="true" aria-label="自动编辑" data-annotation-id="auto-edit-modal">
        {/* Header */}
        <div className="ae-header" data-annotation-id="header">
          <div className="ae-header-left">
            <div className="ae-header-icon"><FileIcon /></div>
            <div className="ae-header-text">
              <div className="ae-header-title">自动编辑</div>
              <div className="ae-header-sub">【全新正品未拆封】i17Pro max灵动岛16+1TB内存全网通5G智 等 10 个商品</div>
            </div>
          </div>
          <div className="ae-header-right">
            <span className="ae-tag-plain">敦煌网</span>
            <span className="ae-tag-shop"><ShopIcon /> 1 店铺</span>
            <button className="ae-close" type="button"><CloseIcon /></button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="ae-toolbar" data-annotation-id="toolbar">
          <div className="ae-select">
            <span className="ae-select-placeholder">选择已有模板快速套用</span>
            <ChevronDown />
          </div>
          <button className="ae-btn-primary" type="button"><PlusIcon /> 创建模板</button>
          <button className="ae-btn-primary" type="button"><GearIcon /> 管理模板</button>
        </div>

        {/* Body */}
        <div className="ae-body">
          <div className="ae-sidebar" data-annotation-id="sidebar">
            <div className="ae-menu">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className={`ae-menu-item${activeMenu === item.id ? ' active' : ''}`}
                  onClick={() => setActiveMenu(item.id)}
                >
                  <span className="ae-menu-icon">
                    {item.done && activeMenu !== item.id ? <CheckCircle /> : item.icon}
                  </span>
                  <span className="ae-menu-label">{item.label}</span>
                  <span className="ae-menu-count">{item.count}</span>
                </div>
              ))}
            </div>
            <div className="ae-sidebar-footer">
              已编辑 <strong>2/13</strong>
            </div>
          </div>

          <div className="ae-content" data-annotation-id="content">
            {activeMenu === 'detail' && (
              <FormRow label="产品详情" checked={detailChecked} onCheck={toggleDetailRow} labelTop>
                <div className="ae-proc-header">
                  <span className="ae-proc-label">详情 处理方式</span>
                  <div className="ae-proc-btns">
                    {detailOps.map((op) => (
                      <button
                        key={op.id}
                        className={`ae-proc-btn${detailOpsOn.includes(op.id) ? ' active' : ''}`}
                        type="button"
                        onClick={() => toggleDetailOp(op.id)}
                      >
                        {op.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="ae-proc-tip">可同时配置多个操作，按顺序依次应用到详情</div>

                {detailOpsOn
                  .filter((id) => id !== 'uppercase')
                  .map((id) => {
                    const op = detailOps.find((item) => item.id === id);
                    if (!op) return null;
                    return (
                      <div className="ae-proc-card" key={id}>
                        <div className="ae-proc-card-side">{op.label}</div>
                        <div className="ae-proc-card-body">
                          <button
                            className="ae-proc-close"
                            type="button"
                            aria-label="移除该操作"
                            onClick={() => removeDetailOp(id)}
                          >
                            <CloseIcon />
                          </button>

                          {id === 'replace-all' && (
                            <>
                              <div className="ae-seg">
                                <button
                                  className={`ae-seg-btn${detailReplaceMode === 'text' ? ' active' : ''}`}
                                  type="button"
                                  onClick={() => setDetailReplaceMode('text')}
                                >
                                  纯文本
                                </button>
                                <button
                                  className={`ae-seg-btn${detailReplaceMode === 'rich' ? ' active' : ''}`}
                                  type="button"
                                  onClick={() => setDetailReplaceMode('rich')}
                                >
                                  富文本
                                </button>
                              </div>
                              {detailReplaceMode === 'text' ? (
                                <div className="ae-proc-field">
                                  <textarea
                                    className="ae-proc-textarea"
                                    rows={3}
                                    placeholder="请输入替换文本"
                                    value={detailReplaceText}
                                    onChange={(e) => setDetailReplaceText(e.target.value)}
                                  />
                                  <div className="ae-proc-vars">
                                    插入变量：
                                    <span className="ae-var-tag">%subject%</span>
                                    <span className="ae-var-tag">%skucode%</span>
                                  </div>
                                </div>
                              ) : (
                                <RichEditor placeholder="请输入替换文本" />
                              )}
                            </>
                          )}

                          {id === 'filter' && (
                            <>
                              <div className="ae-proc-checks">
                                {detailFilterOptions.map((opt) => (
                                  <label key={opt} className="ae-check-line">
                                    <input
                                      type="checkbox"
                                      checked={detailFilterChecks.includes(opt)}
                                      onChange={() => toggleDetailFilter(opt)}
                                    />
                                    <span className="ae-checkbox-mask" />
                                    <span>{opt}</span>
                                  </label>
                                ))}
                              </div>
                              {detailFilterChecks.includes('过滤指定文字') && (
                                <div className="ae-proc-field">
                                  <span className="ae-proc-field-label">过滤指定文字</span>
                                  <textarea
                                    className="ae-proc-textarea"
                                    rows={3}
                                    placeholder="请输入过滤文字，每行一个"
                                    value={detailFilterText}
                                    onChange={(e) => setDetailFilterText(e.target.value)}
                                  />
                                </div>
                              )}
                              {detailFilterChecks.includes('限制字数') && (
                                <div className="ae-proc-field">
                                  <span className="ae-proc-field-label">限制字数</span>
                                  <ProcNumber
                                    value={detailFilterLimit}
                                    onChange={setDetailFilterLimit}
                                    placeholder="请输入字数"
                                  />
                                </div>
                              )}
                            </>
                          )}

                          {id === 'append' && (
                            <>
                              <DetailAppendBlock
                                title="增加前缀"
                                state={detailAppendPrefix}
                                onChange={(patch) => patchDetailAppend('prefix', patch)}
                              />
                              <DetailAppendBlock
                                title="增加后缀"
                                state={detailAppendSuffix}
                                onChange={(patch) => patchDetailAppend('suffix', patch)}
                              />
                            </>
                          )}

                          {id === 'find-replace' && (
                            <>
                              {detailFindRows.map((row, index) => (
                                <div className="ae-find-row" key={index}>
                                  <span className="ae-find-label">查找</span>
                                  <input
                                    className="ae-input ae-find-input"
                                    placeholder="请输入查找"
                                    value={row.find}
                                    onChange={(e) => patchDetailFindRow(index, { find: e.target.value })}
                                  />
                                  <span className="ae-find-label">替换</span>
                                  <input
                                    className="ae-input ae-find-input"
                                    placeholder="请输入替换"
                                    value={row.replace}
                                    onChange={(e) => patchDetailFindRow(index, { replace: e.target.value })}
                                  />
                                  <button
                                    className="ae-find-del"
                                    type="button"
                                    aria-label="删除该行"
                                    onClick={() => setDetailFindRows((prev) => prev.filter((_, i) => i !== index))}
                                  >
                                    <TrashIcon />
                                  </button>
                                </div>
                              ))}
                              <button
                                className="ae-proc-add"
                                type="button"
                                disabled={detailFindRows.length >= MAX_FIND_ROWS}
                                onClick={() =>
                                  setDetailFindRows((prev) =>
                                    prev.length >= MAX_FIND_ROWS ? prev : [...prev, { find: '', replace: '' }],
                                  )
                                }
                              >
                                <PlusIcon /> 增加
                              </button>
                            </>
                          )}

                          {id === 'delete-image' && (
                            <div className="ae-radio-group">
                              {detailDeleteImageModes.map((mode) => {
                                const option = (
                                  <label className="ae-radio">
                                    <input
                                      type="radio"
                                      name="detailDeleteImage"
                                      checked={detailDeleteImageMode === mode}
                                      onChange={() => setDetailDeleteImageMode(mode)}
                                    />
                                    <span className="ae-radio-mask" />
                                    <span>{mode}</span>
                                    {mode === '删除尺码表以外图像' && (
                                      <span
                                        className="ae-label-tip"
                                        data-tip="每识别一张图像消耗 xx 算力"
                                        aria-label="每识别一张图像消耗 xx 算力"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                        }}
                                      >
                                        <span className="ae-label-tip-icon">?</span>
                                      </span>
                                    )}
                                  </label>
                                );
                                if (mode !== '删除尺码表以外图像') {
                                  return <React.Fragment key={mode}>{option}</React.Fragment>;
                                }
                                return (
                                  <span className="ae-ann-anchor" key={mode} data-annotation-id="detail-size-image-ocr">
                                    {option}
                                  </span>
                                );
                              })}
                            </div>
                          )}

                          {(id === 'image-pre' || id === 'image-post') && (
                            <>
                              <div className="ae-proc-checks">
                                {detailImageScopes.map((scope) => (
                                  <label key={scope} className="ae-check-line">
                                    <input
                                      type="checkbox"
                                      checked={(detailImageChecks[id] ?? []).includes(scope)}
                                      onChange={() => toggleDetailImageScope(id, scope)}
                                    />
                                    <span className="ae-checkbox-mask" />
                                    <span>{scope}</span>
                                  </label>
                                ))}
                              </div>
                              {(detailImageChecks[id] ?? []).includes('自定义图片') && (
                                <div className="ae-proc-uploads">
                                  {detailImageCustom[id] ? (
                                    <div className="ae-upload ae-thumb is-filled">
                                      <img src={detailImageCustom[id]!.url} alt="" />
                                      <span className="ae-size">{sizeText(detailImageCustom[id]!)}</span>
                                      <ImageHoverActions
                                        onDelete={() => setDetailImageCustom((prev) => ({ ...prev, [id]: null }))}
                                      />
                                    </div>
                                  ) : (
                                    <label className="ae-proc-upload">
                                      <CloudUploadIcon />
                                      <span>上传图片</span>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => uploadDetailImage(id, e.target.files?.[0])}
                                      />
                                    </label>
                                  )}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </FormRow>
            )}

            {activeMenu === 'basic' && (
              <>
            {/* 关键词 */}
            <FormRow label="关键词" checked={!!basicChecked.keyword} onCheck={() => toggleBasicRow('keyword')} annotationId="basic-keyword-row">
              <div className="ae-radio-group">
                {keywordModes.map((mode) => (
                  <label key={mode} className="ae-radio">
                    <input
                      type="radio"
                      name="keywordMode"
                      checked={keywordMode === mode}
                      onChange={() => {
                        ensureBasic('keyword');
                        setKeywordMode(mode);
                      }}
                    />
                    <span className="ae-radio-mask" />
                    <span>{mode}</span>
                  </label>
                ))}
              </div>
            </FormRow>

            {/* 产品特性 */}
            <FormRow label="产品特性" checked={!!basicChecked.feature} onCheck={() => toggleBasicRow('feature')} annotationId="basic-feature-row">
              <div className="ae-radio-group">
                {featureModes.map((mode) => (
                  <label key={mode} className="ae-radio">
                    <input
                      type="radio"
                      name="featureMode"
                      checked={featureMode === mode}
                      onChange={() => selectFeatureMode(mode)}
                    />
                    <span className="ae-radio-mask" />
                    <span>{mode}</span>
                  </label>
                ))}
              </div>
              {featureMode === AI_FEATURE_MODE && (
                <div className="ae-keyword-row">
                  <span className="ae-field-label inline">指定包含关键词</span>
                  <span className="ae-keyword-field">
                    <input
                      className="ae-input ae-keyword-input"
                      type="text"
                      placeholder="多个关键词用,分隔，不填则不指定"
                      maxLength={150}
                      value={aiFeatureKeywords}
                      onChange={(e) => setAiFeatureKeywords(e.target.value.slice(0, 150))}
                    />
                    <span className="ae-keyword-count">{aiFeatureKeywords.length}/150</span>
                  </span>
                </div>
              )}
              {featureMode === APPEND_FEATURE_MODE && (
                <div className="ae-feature-list">
                  {featureTexts.map((text, index) => (
                    <div className="ae-feature-item" key={index}>
                      <span className="ae-feature-label">短描{index + 1}</span>
                      <input
                        className="ae-feature-input"
                        type="text"
                        placeholder="请输入短描内容"
                        value={text}
                        onChange={(e) => updateFeatureText(index, e.target.value)}
                      />
                      <button className="ae-feature-del" type="button" onClick={() => removeFeatureText(index)}>
                        <TrashIcon />
                      </button>
                    </div>
                  ))}
                  {featureTexts.length < MAX_FEATURE_TEXTS && (
                    <button className="ae-btn-primary ae-feature-add" type="button" onClick={addFeatureText}>
                      <PlusIcon /> 新增短描
                    </button>
                  )}
                </div>
              )}
            </FormRow>

            {/* 类目 */}
            <FormRow label="类目" checked={!!basicChecked.category} onCheck={() => toggleBasicRow('category')}>
              <div className={`ae-cat-select${basicChecked.category ? '' : ' is-disabled'}`}>
                选择类目
                <ChevronDown />
              </div>
              <div className="ae-field-label">属性填充依据</div>
              <div className="ae-radio-group">
                {attrBasisModes.map((mode) => (
                  <label key={mode} className="ae-radio">
                    <input
                      type="radio"
                      name="attrBasis"
                      checked={attrBasis === mode}
                      onChange={() => {
                        ensureBasic('category');
                        setAttrBasis(mode);
                      }}
                    />
                    <span className="ae-radio-mask" />
                    <span>{mode}</span>
                  </label>
                ))}
              </div>
            </FormRow>

            {/* 过滤非英文字符 */}
            <FormRow label="过滤非英文字符" checked={!!basicChecked.filterNonAscii} onCheck={() => toggleBasicRow('filterNonAscii')} annotationId="basic-filter-row">
              <span className="ae-hint">系统自动替换无需操作，请直接点击确认</span>
            </FormRow>

            {/* 重量 */}
            <FormRow label="重量" checked={!!basicChecked.weight} onCheck={() => toggleBasicRow('weight')} annotationId="basic-weight-row">
              <div className="ae-field-label">重量(公斤/件)</div>
              <div className="ae-input-wrap">
                <input
                  className="ae-input"
                  type="text"
                  inputMode="decimal"
                  placeholder="KG"
                  value={weight}
                  onChange={(e) => {
                    ensureBasic('weight');
                    setWeight(e.target.value.replace(/[^\d.]/g, ''));
                  }}
                />
                <div className="ae-input-steps">
                  <button className="ae-step" type="button" onClick={() => stepWeight(1)}>▲</button>
                  <button className="ae-step" type="button" onClick={() => stepWeight(-1)}>▼</button>
                </div>
              </div>
            </FormRow>

            {/* 标题 */}
            <FormRow label="标题" checked={!!basicChecked.title} onCheck={() => toggleBasicRow('title')} annotationId="basic-title-row">
              <div className="ae-title-row">
                <span className="ae-field-label inline"><strong>标题</strong> 处理方式</span>
                <div className="ae-op-btns">
                  {titleOpGroups.map((group, groupIndex) => (
                    <span className="ae-op-group" key={group.id}>
                      {groupIndex > 0 && <span className="ae-op-divider" aria-hidden="true" />}
                      {group.ops.map((op) => (
                        <button
                          key={op}
                          className={`ae-op-btn${titleOpsOn.includes(op) ? ' active' : ''}`}
                          type="button"
                          onClick={() => toggleTitleOp(op)}
                        >
                          {op}
                        </button>
                      ))}
                    </span>
                  ))}
                </div>
              </div>
              <div className="ae-hint sub">文本处理可同时配置多个操作，按顺序依次应用到标题</div>
              {titleOpsOn.includes('AI生成标题') && (
                <div className="ae-keyword-row">
                  <span className="ae-field-label inline">指定包含关键词</span>
                  <span className="ae-keyword-field">
                    <input
                      className="ae-input ae-keyword-input"
                      type="text"
                      placeholder="多个关键词用,分隔，不填则不指定"
                      maxLength={70}
                      value={aiTitleKeywords}
                      onChange={(e) => setAiTitleKeywords(e.target.value.slice(0, 70))}
                    />
                    <span className="ae-keyword-count">{aiTitleKeywords.length}/70</span>
                  </span>
                </div>
              )}
            </FormRow>

            {/* 标签 */}
            <FormRow label="标签" checked={!!basicChecked.tag} onCheck={() => toggleBasicRow('tag')} last annotationId="basic-tag-row">
              <label className="ae-check-line">
                <input
                  type="checkbox"
                  checked={tagAdd}
                  onChange={() => {
                    ensureBasic('tag');
                    setTagAdd((v) => !v);
                  }}
                />
                <span className="ae-checkbox-mask" />
                <span>添加标签</span>
              </label>
              <label className="ae-check-line">
                <input
                  type="checkbox"
                  checked={tagRemove}
                  onChange={() => {
                    ensureBasic('tag');
                    setTagRemove((v) => !v);
                  }}
                />
                <span className="ae-checkbox-mask" />
                <span>移除标签</span>
              </label>
            </FormRow>
              </>
            )}

            {activeMenu === 'image' && (
              <>
            {/* 主图 */}
            <FormRow label="主图" checked={mainImageChecked} onCheck={toggleMainImage} flush disabled>
              <div className="ae-radio-group">
                {mainImageModes.map((mode) => (
                  <div key={mode.id} className="ae-radio-slot">
                    <label className="ae-radio">
                      <input
                        type="radio"
                        name="mainImage"
                        checked={mainImageMode === mode.id}
                        disabled
                      />
                      <span className="ae-radio-mask" />
                      <span>{mode.label}</span>
                    </label>
                  </div>
                ))}
              </div>

              {mainImageChecked && mainImageMode && (
                <div className="ae-main-panel">
                  {currentHint && <div className="ae-hint">{currentHint}</div>}

                  {mainImageMode === 'reorder' && (
                    <>
                      <div className="ae-order-btns">
                        <button className="ae-op-btn ae-shuffle-btn" type="button" onClick={shuffleOrder}>
                          <ShuffleIcon /> 随机打乱顺序
                        </button>
                        <button className="ae-op-btn ae-reset-btn" type="button" onClick={resetOrder}>
                          <ResetIcon /> 恢复初始顺序
                        </button>
                      </div>
                      <div className="ae-pos-grid">
                        {slotIds.map((slotId, index) => (
                          <div
                            key={slotId}
                            className={`ae-pos-item is-reorder${dragIndex === index ? ' is-dragging' : ''}`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragEnter={() => handleDragEnter(index)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => e.preventDefault()}
                            onDragEnd={() => setDragIndex(null)}
                          >
                            <PositionHead position={index + 1} isFirst={index === 0} />
                            <div className="ae-pos-thumb is-draggable">主图{slotId}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {mainImageMode === 'replace' && (
                    <div className="ae-pos-grid">
                      {positions.map((position) => (
                        <div key={position} className="ae-pos-item">
                          <PositionHead position={position} isFirst={position === 1} />
                          {position === 3 && sampleAtPos3 ? (
                            <SampleImage
                              src={mainSample2}
                              size="1024*1024"
                              onDelete={() => setSampleAtPos3(false)}
                            />
                          ) : (
                            <UploadBox
                              image={replaceImages[position]}
                              onOpen={() => setUploadDialog('replace')}
                              onDelete={() => setReplaceImages((prev) => {
                                const next = { ...prev };
                                delete next[position];
                                return next;
                              })}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {mainImageMode === 'delete' && (
                    <div className="ae-pos-grid">
                      {positions.map((position) => {
                        const isDeleted = deletedPositions.includes(position);
                        return (
                          <div key={position} className="ae-pos-item">
                            <PositionHead position={position} isFirst={position === 1} />
                            <div className={`ae-pos-thumb${isDeleted ? ' is-removed' : ''}`}>主图{position}</div>
                            {isDeleted ? (
                              <button
                                className="ae-del-cancel"
                                type="button"
                                onClick={() => setDeletedPositions((s) => s.filter((p) => p !== position))}
                              >
                                取消删除
                              </button>
                            ) : (
                              <button
                                className="ae-del-btn"
                                type="button"
                                onClick={() => setDeletedPositions((s) => [...s, position])}
                              >
                                删除
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {mainImageMode === 'append' && (
                    <>
                      <UploadBox
                        text="点击/Ctrl+V粘贴"
                        onOpen={() => setUploadDialog('append')}
                        onActivate={() => { pasteTargetRef.current = { kind: 'append' }; }}
                      />
                      {(appendImages.length > 0 || appendSample) && (
                        <div className="ae-append-grid">
                          {appendSample && (
                            <SampleImage
                              src={mainSample1}
                              size="1024*1024"
                              onDelete={() => setAppendSample(false)}
                            />
                          )}
                          {appendImages.map((img, index) => (
                            <div key={`${img.url}-${index}`} className="ae-append-item ae-thumb">
                              <img src={img.url} alt="" />
                              <span className="ae-size">{sizeText(img)}</span>
                              <ImageHoverActions
                                onDelete={() => setAppendImages((prev) => prev.filter((_, i) => i !== index))}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </FormRow>

            {/* 推广图 */}
            <FormRow label="推广图" disabled>
              <div className="ae-radio-group">
                {['第一张', '随机一张', '上传一张图片'].map((opt) => (
                  <label key={opt} className="ae-radio">
                    <input type="radio" name="promo" disabled checked={false} onChange={() => {}} />
                    <span className="ae-radio-mask" />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </FormRow>

            {/* 移除sku图片 */}
            <FormRow label="移除sku图片" disabled>
              <span className="ae-hint">系统自动替换无需操作，请直接点击确认</span>
            </FormRow>

            {/* 视频 */}
            <FormRow label="视频" checked={!!basicChecked.video} onCheck={() => toggleBasicRow('video')} annotationId="basic-video-row">
              <div className="ae-radio-group">
                {videoModes.map((mode) => (
                  <label key={mode.id} className="ae-radio">
                    <input
                      type="radio"
                      name="video"
                      checked={videoMode === mode.id}
                      onChange={() => selectVideoMode(mode.id)}
                    />
                    <span className="ae-radio-mask" />
                    <span>{mode.label}</span>
                  </label>
                ))}
              </div>

              {videoMode === 'generate' && (
                <div className="ae-av-card">
                  <div className="ae-av-row">
                    <span className="ae-av-label">
                      <i className="ae-av-req">*</i>已有视频的商品处理方式
                    </span>
                    <div className="ae-radio-group">
                      {videoExistModes.map((item) => (
                        <label key={item} className="ae-radio">
                          <input
                            type="radio"
                            name="videoExist"
                            checked={videoExistMode === item}
                            onChange={() => setVideoExistMode(item)}
                          />
                          <span className="ae-radio-mask" />
                          <span>{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="ae-av-row ae-av-row--top">
                    <span className="ae-av-label">参考图</span>
                    <p className="ae-av-note">
                      默认传入主图作为参考图；没有主图时，依次传入 SKU 图和详情图，无需手动选择。
                    </p>
                  </div>

                  <div className="ae-av-row">
                    <span className="ae-av-label">视频模板</span>
                    <div className="ae-op-btns">
                      {videoTemplates.map((item) => (
                        <button
                          key={item.value}
                          className={`ae-op-btn${videoTemplate === item.value ? ' active' : ''}`}
                          type="button"
                          onClick={() => setVideoTemplate(item.value)}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="ae-av-row">
                    <span className="ae-av-label">视频时长</span>
                    <div className="ae-radio-group">
                      {videoDurations.map((item) => (
                        <label key={item} className="ae-radio">
                          <input
                            type="radio"
                            name="videoDuration"
                            checked={videoDuration === item}
                            onChange={() => setVideoDuration(item)}
                          />
                          <span className="ae-radio-mask" />
                          <span>{item}</span>
                          <span
                            className="ae-label-tip ae-av-q"
                            data-tip="每生成一个视频消耗 xx 算力"
                            aria-label="每生成一个视频消耗 xx 算力"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            <span className="ae-label-tip-icon">?</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="ae-av-row">
                    <span className="ae-av-label">视频比例</span>
                    <div className="ae-op-btns">
                      {videoRatios.map((item) => (
                        <button
                          key={item}
                          className={`ae-op-btn${videoRatio === item ? ' active' : ''}`}
                          type="button"
                          onClick={() => setVideoRatio(item)}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="ae-av-row">
                    <span className="ae-av-label">销售国家/地区</span>
                    <div className="ae-vs">
                      <div
                        className={`ae-vs-trigger${videoPick?.id === 'market' ? ' is-open' : ''}`}
                        role="button"
                        tabIndex={0}
                        aria-haspopup="listbox"
                        aria-expanded={videoPick?.id === 'market'}
                        onClick={(e) => toggleVideoPick('market', e.currentTarget)}
                      >
                        <span className="ae-vs-flag">
                          <Flag code={(videoMarkets.find((m) => m.value === videoMarket) ?? videoMarkets[0]).flag} />
                        </span>
                        <span className="ae-vs-text">
                          {(videoMarkets.find((m) => m.value === videoMarket) ?? videoMarkets[0]).label}
                        </span>
                        <ChevronDown size={12} />
                      </div>
                      {videoPick?.id === 'market' && (
                        <div
                          className="ae-wm-menu ae-wm-menu--fixed ae-vs-menu"
                          role="listbox"
                          style={{ left: videoPick.left, width: videoPick.width, maxHeight: videoPick.maxHeight, top: videoPick.top, bottom: videoPick.bottom }}
                        >
                          {videoMarkets.map((m) => (
                            <div
                              key={m.value}
                              className={`ae-wm-menu-item ae-vs-opt${m.value === videoMarket ? ' is-active' : ''}`}
                              role="option"
                              aria-selected={m.value === videoMarket}
                              onClick={() => {
                                setVideoMarket(m.value);
                                setVideoPick(null);
                              }}
                            >
                              <span className="ae-vs-flag">
                                <Flag code={m.flag} />
                              </span>
                              <span className="ae-vs-opt-label">{m.label}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="ae-av-row">
                    <span className="ae-av-label">语言</span>
                    <div className="ae-vs">
                      <div
                        className={`ae-vs-trigger${videoPick?.id === 'language' ? ' is-open' : ''}`}
                        role="button"
                        tabIndex={0}
                        aria-haspopup="listbox"
                        aria-expanded={videoPick?.id === 'language'}
                        onClick={(e) => toggleVideoPick('language', e.currentTarget)}
                      >
                        <span className="ae-vs-text">{videoLanguage}</span>
                        <ChevronDown size={12} />
                      </div>
                      {videoPick?.id === 'language' && (
                        <div
                          className="ae-wm-menu ae-wm-menu--fixed ae-vs-menu"
                          role="listbox"
                          style={{ left: videoPick.left, width: videoPick.width, maxHeight: videoPick.maxHeight, top: videoPick.top, bottom: videoPick.bottom }}
                        >
                          {videoLanguages.map((lang) => (
                            <div
                              key={lang}
                              className={`ae-wm-menu-item ae-vs-opt${lang === videoLanguage ? ' is-active' : ''}`}
                              role="option"
                              aria-selected={lang === videoLanguage}
                              onClick={() => {
                                setVideoLanguage(lang);
                                setVideoPick(null);
                              }}
                            >
                              <span className="ae-vs-opt-label">{lang}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </FormRow>

            {/* 推广图变白底图（已注释，改由下方 转白底 / 去水印 / 加水印 三个栏目承接） */}
            {/*
            <FormRow label="推广图变白底图" disabled>
              <div className="ae-radio-group">
                {['免费', 'AI付费'].map((opt) => (
                  <label key={opt} className="ae-radio">
                    <input type="radio" name="whiteBg" disabled checked={false} onChange={() => {}} />
                    <span className="ae-radio-mask" />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
              <div className="ae-hint sub">提示：预览或预览时将扣除1次费用</div>
            </FormRow>
            */}

            {/* 转白底 / 去水印 / 加水印 */}
            {imageOps.map((op, opIndex) => {
              const on = !!imageOpChecked[op.id];
              const scopes = imageOpScopes[op.id] ?? [];
              const isLastOp = opIndex === imageOps.length - 1;
              return (
                <FormRow
                  key={op.id}
                  label={op.label}
                  labelTip={op.tip}
                  checked={on}
                  onCheck={() => toggleImageOpRow(op.id)}
                  annotationId={isLastOp ? 'image-op-pipeline' : `image-${op.id}-row`}
                >
                  <div className="ae-scope-group">
                    {imageScopes.map((scope) => (
                      <label key={scope} className="ae-check-line">
                        <input
                          type="checkbox"
                          checked={scopes.includes(scope)}
                          onChange={() => toggleImageOpScope(op.id, scope)}
                        />
                        <span className="ae-checkbox-mask" />
                        <span>{scope}</span>
                      </label>
                    ))}
                  </div>

                  {op.id === 'remove-watermark' && scopes.length > 0 && (
                    <div className="ae-rmw-version">
                      <div className="ae-field-label">去水印版本</div>
                      <div className="ae-radio-group">
                        {removeWmVersions.map((version) => (
                          <label key={version} className="ae-radio">
                            <input
                              type="radio"
                              name="removeWatermarkVersion"
                              checked={removeWmVersion === version}
                              onChange={() => setRemoveWmVersion(version)}
                            />
                            <span className="ae-radio-mask" />
                            <span>{version}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {op.id === 'image-translate' && scopes.length > 0 && (
                    <div className="ae-translate-mode">
                      <div className="ae-field-label">翻译方式</div>
                      <div className="ae-choice-group">
                        {imageTranslateModes.map((mode) => (
                          <label
                            key={mode.id}
                            className={`ae-choice${imageTranslateMode === mode.id ? ' is-checked' : ''}`}
                          >
                            <input
                              type="radio"
                              name="imageTranslateMode"
                              checked={imageTranslateMode === mode.id}
                              onChange={() => setImageTranslateMode(mode.id)}
                            />
                            <span className="ae-choice-dot" />
                            <span className="ae-choice-content">
                              <span className="ae-choice-title">{mode.title}</span>
                              <span className="ae-choice-desc">{mode.desc}</span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {op.id === 'add-watermark' && on && (
                    <WatermarkCard
                      config={wmConfig}
                      onConfigChange={patchWmConfig}
                      templateId={wmTemplateId}
                      onPickTemplate={pickWmTemplate}
                    />
                  )}

                </FormRow>
              );
            })}

            {/* 图片数量限制 */}
            <FormRow label="图片数量限制" disabled last>
              <div className="ae-radio-group inline-start">
                <span className="ae-limit-text">是否限制图片最大数量</span>
                <label className="ae-radio">
                  <input type="radio" name="limit" disabled checked={false} onChange={() => {}} />
                  <span className="ae-radio-mask" />
                  <span>是</span>
                </label>
                <label className="ae-radio">
                  <input type="radio" name="limit" disabled checked={false} onChange={() => {}} />
                  <span className="ae-radio-mask" />
                  <span>否</span>
                </label>
              </div>
            </FormRow>
              </>
            )}

            {activeMenu === 'sku' && (
              <>
            {/* sku销售状态 */}
            <FormRow label="sku销售状态" checked={!!skuChecked['sale-status']} onCheck={() => toggleSkuRow('sale-status')} annotationId="sku-sale-status-row">
              <div className="ae-inline-field">
                <span className="ae-field-label inline">销售状态</span>
                <div className={`ae-dropdown${skuChecked['sale-status'] ? '' : ' is-disabled'}`}>
                  <span className={skuSaleStatus ? 'ae-dropdown-value' : 'ae-dropdown-placeholder'}>
                    {skuSaleStatus || '请选择'}
                  </span>
                  <ChevronDown />
                </div>
              </div>
            </FormRow>

            {/* 商品规格 */}
            <FormRow label="商品规格" checked={!!skuChecked.spec} onCheck={() => toggleSkuRow('spec')} annotationId="sku-spec-row">
              <button
                className="ae-btn-primary ae-add-spec"
                type="button"
                onClick={() => {
                  ensureSku('spec');
                  setSkuSpecs((prev) => [...prev, `规格${prev.length + 1}`]);
                }}
              >
                <PlusIcon /> 添加规格
              </button>
              {skuSpecs.length > 0 && (
                <div className="ae-spec-list">
                  {skuSpecs.map((spec, index) => (
                    <div key={`${spec}-${index}`} className="ae-spec-item">
                      <span className="ae-spec-name">{spec}</span>
                      <button
                        className="ae-spec-del"
                        type="button"
                        onClick={() => setSkuSpecs((prev) => prev.filter((_, i) => i !== index))}
                      >
                        删除
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="ae-field-label">SKU价格</div>
              <div className="ae-radio-group">
                {['完全覆盖', '追加规格', '仅覆盖当前规格'].map((mode) => (
                  <label key={mode} className="ae-radio">
                    <input
                      type="radio"
                      name="skuSpecCover"
                      checked={skuSpecCover === mode}
                      onChange={() => {
                        ensureSku('spec');
                        setSkuSpecCover(mode);
                      }}
                    />
                    <span className="ae-radio-mask" />
                    <span>{mode}</span>
                  </label>
                ))}
              </div>
              <div className="ae-field-label">库存、价格采用方式</div>
              <div className="ae-radio-group">
                {['统一最低价', '相近', '自定义'].map((mode) => (
                  <label key={mode} className="ae-radio">
                    <input
                      type="radio"
                      name="skuSpecPrice"
                      checked={skuSpecPrice === mode}
                      onChange={() => {
                        ensureSku('spec');
                        setSkuSpecPrice(mode);
                      }}
                    />
                    <span className="ae-radio-mask" />
                    <span>{mode}</span>
                  </label>
                ))}
              </div>
            </FormRow>

            {/* 商品规格值 */}
            <FormRow
              label="商品规格值"
              checked={!!skuChecked['spec-value']}
              onCheck={() => toggleSkuRow('spec-value')}
              annotationId="sku-spec-value-row"
            >
              <div className="ae-radio-group">
                {skuSpecValueOps.map((mode) => (
                  <label key={mode} className="ae-radio">
                    <input
                      type="radio"
                      name="skuSpecValue"
                      checked={skuSpecValueOp === mode}
                      onChange={() => pickSpecValueOp(mode)}
                    />
                    <span className="ae-radio-mask" />
                    <span>{mode}</span>
                  </label>
                ))}
              </div>

              {skuChecked['spec-value'] && skuSpecValueOp === '删除名称中的' && (
                <textarea
                  className="ae-sv-textarea"
                  placeholder="输入多个关键词用换行分割"
                  value={specValueKeywords}
                  onChange={(e) => setSpecValueKeywords(e.target.value)}
                />
              )}

              {skuChecked['spec-value'] && skuSpecValueOp === '查找替换' && (
                <div className="ae-sv-panel">
                  {specValueRules.map((rule, index) => (
                    <div className="ae-sv-rule" key={index}>
                      <input
                        className="ae-sv-input"
                        type="text"
                        placeholder="查找词"
                        value={rule.find}
                        onChange={(e) => updateSpecValueRule(index, { find: e.target.value })}
                      />
                      <input
                        className="ae-sv-input"
                        type="text"
                        placeholder="替换词"
                        value={rule.replace}
                        onChange={(e) => updateSpecValueRule(index, { replace: e.target.value })}
                      />
                      {index > 0 && (
                        <button
                          className="ae-sv-del"
                          type="button"
                          onClick={() => setSpecValueRules((prev) => prev.filter((_, i) => i !== index))}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    className="ae-wm-link ae-sv-add"
                    type="button"
                    onClick={() => setSpecValueRules((prev) => [...prev, { find: '', replace: '' }])}
                  >
                    <PlusIcon /> 新增规则
                  </button>
                </div>
              )}

              {skuChecked['spec-value'] && skuSpecValueOp === '追加文本' && (
                <div className="ae-sv-panel">
                  <SvAppendBlock
                    title="增加前缀"
                    on={prefixOn}
                    onToggle={() => setPrefixOn((v) => !v)}
                    mode={prefixMode}
                    onModeChange={setPrefixMode}
                  >
                    {prefixMode === specValueAppendModes[0] ? (
                      <input
                        className="ae-sv-input is-wide"
                        type="text"
                        placeholder="输入后将自动勾选增加前缀"
                        value={prefixText}
                        onChange={(e) => typePrefixText(e.target.value)}
                      />
                    ) : (
                      <SvStepper value={prefixStart} onChange={setPrefixStart} disabled={!prefixOn} />
                    )}
                  </SvAppendBlock>
                  <SvAppendBlock
                    title="增加后缀"
                    on={suffixOn}
                    onToggle={() => setSuffixOn((v) => !v)}
                    mode={suffixMode}
                    onModeChange={setSuffixMode}
                  >
                    {suffixMode === specValueAppendModes[0] ? (
                      <input
                        className="ae-sv-input is-wide"
                        type="text"
                        placeholder="输入后将自动勾选增加后缀"
                        value={suffixText}
                        onChange={(e) => typeSuffixText(e.target.value)}
                      />
                    ) : (
                      <SvStepper value={suffixStart} onChange={setSuffixStart} disabled={!suffixOn} />
                    )}
                  </SvAppendBlock>
                </div>
              )}
            </FormRow>

            {/* sku编码 */}
            <FormRow label="sku编码" checked={!!skuChecked.code} onCheck={() => toggleSkuRow('code')} annotationId="sku-code-row">
              {['去除空格', '清除特殊符号', '自动编辑'].map((opt) => (
                <label key={opt} className="ae-check-line">
                  <input
                    type="checkbox"
                    checked={skuCodeOpts.includes(opt)}
                    onChange={() => {
                      ensureSku('code');
                      toggleSkuCodeOpt(opt);
                    }}
                  />
                  <span className="ae-checkbox-mask" />
                  <span>{opt}</span>
                </label>
              ))}
            </FormRow>

            {/* sku重量 */}
            <FormRow label="sku重量" checked={!!skuChecked.weight} onCheck={() => toggleSkuRow('weight')} annotationId="sku-weight-row">
              <div className="ae-radio-group">
                {['使用产品重量（kg）', '固定值（kg）'].map((mode) => (
                  <label key={mode} className="ae-radio">
                    <input
                      type="radio"
                      name="skuWeight"
                      checked={skuWeightMode === mode}
                      onChange={() => {
                        ensureSku('weight');
                        setSkuWeightMode(mode);
                      }}
                    />
                    <span className="ae-radio-mask" />
                    <span>{mode}</span>
                  </label>
                ))}
              </div>
            </FormRow>

            {/* 库存 */}
            <FormRow label="库存" checked={!!skuChecked.stock} onCheck={() => toggleSkuRow('stock')} last annotationId="sku-stock-row">
              <div className="ae-field-label">计算方式</div>
              <div className="ae-radio-group">
                {['固定值', '原有值累计', '原有值扣减'].map((mode) => (
                  <label key={mode} className="ae-radio">
                    <input
                      type="radio"
                      name="stockCalc"
                      checked={stockCalc === mode}
                      onChange={() => {
                        ensureSku('stock');
                        setStockCalc(mode);
                      }}
                    />
                    <span className="ae-radio-mask" />
                    <span>{mode}</span>
                  </label>
                ))}
              </div>
              <div className="ae-field-label">库存数量</div>
              <div className="ae-input-wrap">
                <input
                  className="ae-input"
                  type="text"
                  inputMode="numeric"
                  value={stockQty}
                  onChange={(e) => {
                    ensureSku('stock');
                    setStockQty(e.target.value.replace(/[^\d]/g, ''));
                  }}
                />
                <div className="ae-input-steps">
                  <button className="ae-step" type="button" onClick={() => stepStockQty(1)}>▲</button>
                  <button className="ae-step" type="button" onClick={() => stepStockQty(-1)}>▼</button>
                </div>
              </div>
              <label className="ae-check-line ae-stock-zero">
                <input
                  type="checkbox"
                  checked={stockZeroSkip}
                  onChange={() => {
                    ensureSku('stock');
                    setStockZeroSkip((v) => !v);
                  }}
                />
                <span className="ae-checkbox-mask" />
                <span>当平台记录的库存为0时不做任何修改</span>
              </label>
            </FormRow>
              </>
            )}

            {/* 服务栏目内容沿用线上已有配置，原实现暂注释保留
            {activeMenu === 'service' && (
              <>
                <FormRow label="商品分级管理" checked={!!serviceChecked.grade} onCheck={() => toggleServiceRow('grade')} annotationId="service-grade-row">
                  <div className="ae-radio-group">
                    {gradeModes.map((mode) => (
                      <label key={mode} className="ae-radio">
                        <input
                          type="radio"
                          name="serviceGrade"
                          disabled={!serviceChecked.grade}
                          checked={gradeMode === mode}
                          onChange={() => setGradeMode(mode)}
                        />
                        <span className="ae-radio-mask" />
                        <span>{mode}</span>
                      </label>
                    ))}
                  </div>
                </FormRow>

                <FormRow label="服务模板" checked={!!serviceChecked.tpl} onCheck={() => toggleServiceRow('tpl')} bodyClass="ae-svc-body" annotationId="service-tpl-row">
                  <div className="ae-svc-list">
                    {serviceTplRows.map((row, index) => {
                      const st = tplByShop[row.id] ?? defaultShopTpl;
                      return (
                        <div className="ae-svc-item ae-svc-item--shop" key={row.id}>
                          <div className="ae-svc-line">
                            <span className="ae-svc-name" title={row.name}>{row.name}</span>
                            {serviceFields.map((field) => (
                              <div className="ae-svc-field" key={field}>
                                <span className="ae-svc-label">{field}</span>
                                <div className="ae-svc-select">
                                  <span>{`请选择${field}`}</span>
                                  <ChevronDown />
                                </div>
                              </div>
                            ))}
                            <button className="ae-sync-btn" type="button" disabled={!serviceChecked.tpl} onClick={() => setToast('同步成功')}>同步</button>
                          </div>
                          <ProductTplBlock
                            shopId={row.id}
                            state={st}
                            menuOpen={tplMenuFor === row.id}
                            menuPos={tplMenuFor === row.id ? tplMenuPos : null}
                            onOpenMenu={(trigger) => {
                              if (tplMenuFor === row.id) {
                                setTplMenuFor('');
                                setTplMenuPos(null);
                                return;
                              }
                              const rect = trigger.getBoundingClientRect();
                              const bounds = trigger.closest('.ae-content')?.getBoundingClientRect();
                              const menuMax = Math.min(480, window.innerWidth - rect.left - 24);
                              const spaceBelow = (bounds?.bottom ?? window.innerHeight) - rect.bottom;
                              const spaceAbove = rect.top - (bounds?.top ?? 0);
                              const openUp = spaceBelow < 240 && spaceAbove > spaceBelow;
                              setTplMenuPos({
                                left: rect.left,
                                minWidth: rect.width,
                                maxWidth: menuMax,
                                ...(openUp ? { bottom: window.innerHeight - rect.top + 4 } : { top: rect.bottom + 4 }),
                              });
                              setTplMenuFor(row.id);
                            }}
                            onPickTpl={(id) => {
                              patchShopTpl(row.id, { tplId: id });
                              setTplMenuFor('');
                              setTplMenuPos(null);
                              if (!serviceChecked.tpl) {
                                setServiceChecked((prev) => ({ ...prev, tpl: true }));
                              }
                            }}
                            onModeChange={(mode) => patchShopTpl(row.id, { mode })}
                            annotationId={index === 0 ? 'basic-product-template-row' : undefined}
                          />
                        </div>
                      );
                    })}
                  </div>
                </FormRow>

                <FormRow label="尺码模板" checked={!!serviceChecked.size} onCheck={() => toggleServiceRow('size')} last bodyClass="ae-svc-body" annotationId="service-size-row">
                  <div className="ae-svc-toolbar">
                    <button className="ae-sync-btn" type="button" disabled={!serviceChecked.size} onClick={() => setToast('全部同步成功')}>一键同步所有</button>
                  </div>
                  <div className="ae-svc-list">
                    {sizeTplRows.map((row) => (
                      <div className="ae-svc-item" key={row.id}>
                        <span className="ae-svc-name" title={row.name}>{row.name}</span>
                        <span className="ae-svc-cat" title={row.cat}>{row.cat}</span>
                        <div className="ae-svc-field">
                          <span className="ae-svc-label">尺码模板</span>
                          <div className="ae-svc-select">
                            <span>请选择尺码模板</span>
                            <ChevronDown />
                          </div>
                        </div>
                        <button className="ae-sync-btn" type="button" disabled={!serviceChecked.size} onClick={() => setToast('同步成功')}>同步</button>
                      </div>
                    ))}
                  </div>
                </FormRow>
              </>
            )}
            */}

            {activeMenu === 'attr' && (
              <>
              <FormRow label="属性" checked={attrChecked} onCheck={() => setAttrChecked((v) => !v)} annotationId="attr-row">
                <div className="ae-attr-actions">
                  <button className="ae-link-action" type="button">
                    <RefreshCycleIcon />
                    <span>识别类目</span>
                  </button>
                  <button className="ae-link-action" type="button">
                    <PlusIcon />
                    <span>添加指定类目</span>
                  </button>
                </div>
              </FormRow>
              <FormRow label="品牌" checked={!!basicChecked.brand} onCheck={() => toggleBasicRow('brand')} last annotationId="attr-brand-row">
                <input
                  className="ae-input"
                  type="text"
                  placeholder="请输入品牌名称"
                  value={brandValue}
                  onChange={(e) => {
                    ensureBasic('brand');
                    setBrandValue(e.target.value);
                  }}
                  style={{ textAlign: 'left' }}
                />
                <div className="ae-hint sub" style={{ color: '#ff781f' }}>请输入完整品牌名称，系统根据名称精准匹配，如对应产品类目不存在该品牌，则更改不生效，品牌默认留空</div>
              </FormRow>
              </>
            )}

            {activeMenu !== 'basic' && activeMenu !== 'image' && activeMenu !== 'sku' && activeMenu !== 'attr' && activeMenu !== 'detail' && (
              <div className="ae-empty">该栏目内容沿用线上已有配置</div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="ae-footer" data-annotation-id="footer">
          <button className="ae-btn-cancel" type="button">取消</button>
          <button className="ae-btn-submit" type="button" onClick={handleSubmit}>确定</button>
        </div>
      </div>
    </div>

    {/* 上传图片弹窗（仅样式，本地/URL/引用、单个/批量均不可切换） */}
    {uploadDialog && (
      <div className="au-overlay">
        <div className="au-modal" role="dialog" aria-modal="true" aria-label="上传图片" data-annotation-id="upload-image-dialog">
          <div className="au-header">
            <span className="au-title">上传图片</span>
            <button className="ae-close" type="button" onClick={() => setUploadDialog(null)}>
              <CloseIcon />
            </button>
          </div>
          <div className="au-body">
            <div className="au-tabs">
              <span className="au-tab active">本地</span>
              <span className="au-tab">URL</span>
              <span className="au-tab">引用</span>
            </div>
            <div className="au-content">
              <div className="ae-radio-group">
                <label className="ae-radio au-radio is-active">
                  <input type="radio" name="auWay" disabled checked onChange={() => {}} />
                  <span className="ae-radio-mask" />
                  <span>单个上传</span>
                </label>
                {uploadDialog === 'append' && (
                  <label className="ae-radio au-radio">
                    <input type="radio" name="auWay" disabled checked={false} onChange={() => {}} />
                    <span className="ae-radio-mask" />
                    <span>批量上传</span>
                  </label>
                )}
              </div>
              <div className="au-drop">
                <PictureIcon />
                <div className="au-drop-text">
                  将文件拖到此处，或<span className="au-drop-link">点击上传</span>
                </div>
                <div className="au-drop-tip">按 Ctrl+V 可从剪贴板上传</div>
              </div>
            </div>
          </div>
          <div className="au-footer">
            <button className="ae-btn-cancel" type="button" onClick={() => setUploadDialog(null)}>取消</button>
            <button className="ae-btn-submit" type="button" onClick={() => setUploadDialog(null)}>确认</button>
          </div>
        </div>
      </div>
    )}
    {toast && <div className="ae-toast">{toast}</div>}
    <AnnotationViewer
      source={annotationSourceDocument as unknown as AnnotationSourceDocument}
      options={{
        currentPageId: 'auto-edit-dialog',
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
