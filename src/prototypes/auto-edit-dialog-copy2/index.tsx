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
const titleOps = ['过滤文字', '追加文本', '裁剪', '随机打乱', '随机插入', '查找替换', '首字母大写', '使用采集源标题', 'AI生成标题'];
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

// ===== 图片操作栏目（转白底 / 去水印 / 加水印）=====
const imageOps: { id: string; label: string }[] = [
  { id: 'white-bg', label: '转白底' },
  { id: 'remove-watermark', label: '去水印' },
  { id: 'add-watermark', label: '加水印' },
  { id: 'image-translate', label: '图片翻译' },
];

const imageScopes = ['主图', '推广图', 'SKU图', '详情图'];

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
function FormRow({ label, checked, onCheck, children, last, disabled, flush, bodyClass, annotationId }: {
  label: string;
  checked?: boolean;
  onCheck?: () => void;
  children: React.ReactNode;
  last?: boolean;
  disabled?: boolean;
  flush?: boolean;
  bodyClass?: string;
  annotationId?: string;
}) {
  return (
    <div
      className={`ae-row${last ? ' ae-row-last' : ''}${disabled ? ' is-disabled' : ''}${flush ? ' is-flush' : ''}`}
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
      </div>
      <div className={`ae-row-body${bodyClass ? ' ' + bodyClass : ''}`}>{children}</div>
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
  const [tagAdd, setTagAdd] = useState(false);
  const [tagRemove, setTagRemove] = useState(false);
  const [mainImageChecked, setMainImageChecked] = useState(false);
  const [mainImageMode, setMainImageMode] = useState<MainImageMode | ''>('');
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

  const stepStockQty = (delta: number) =>
    setStockQty((prev) => numValue(prev, delta));

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

  const selectFeatureMode = (mode: string) => {
    // 新增短描允许在未勾选产品特性时直接点选，点击即视为启用该行
    if (mode === APPEND_FEATURE_MODE) setBasicChecked((prev) => ({ ...prev, feature: true }));
    setFeatureMode(mode);
    if (mode !== APPEND_FEATURE_MODE) setFeatureTexts([]);
  };

  const addFeatureText = () =>
    setFeatureTexts((prev) => (prev.length >= MAX_FEATURE_TEXTS ? prev : [...prev, '']));

  const removeFeatureText = (index: number) =>
    setFeatureTexts((prev) => prev.filter((_, i) => i !== index));

  const updateFeatureText = (index: number, value: string) =>
    setFeatureTexts((prev) => prev.map((v, i) => (i === index ? value : v)));

  const toggleBasicRow = (id: string) =>
    setBasicChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      if (next[id]) return next;
      if (id === 'keyword') setKeywordMode('');
      if (id === 'feature') {
        setFeatureMode('');
        setFeatureTexts([]);
      }
      if (id === 'category') setAttrBasis('');
      if (id === 'weight') setWeight('');
      if (id === 'title') setTitleOpsOn([]);
      if (id === 'tag') {
        setTagAdd(false);
        setTagRemove(false);
      }
      return next;
    });

  const toggleTitleOp = (op: string) =>
    setTitleOpsOn((prev) => (prev.includes(op) ? prev.filter((v) => v !== op) : [...prev, op]));

  const stepWeight = (delta: number) =>
    setWeight((prev) => {
      const value = Math.max(0, Math.round((Number(prev || 0) + delta) * 1000) / 1000);
      return String(value);
    });

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
                      disabled={!basicChecked.keyword}
                      checked={keywordMode === mode}
                      onChange={() => setKeywordMode(mode)}
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
                      disabled={!basicChecked.feature && mode !== APPEND_FEATURE_MODE}
                      checked={featureMode === mode}
                      onChange={() => selectFeatureMode(mode)}
                    />
                    <span className="ae-radio-mask" />
                    <span>{mode}</span>
                  </label>
                ))}
              </div>
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
                      disabled={!basicChecked.category}
                      checked={attrBasis === mode}
                      onChange={() => setAttrBasis(mode)}
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
                  disabled={!basicChecked.weight}
                  value={weight}
                  onChange={(e) => setWeight(e.target.value.replace(/[^\d.]/g, ''))}
                />
                <div className="ae-input-steps">
                  <button className="ae-step" type="button" disabled={!basicChecked.weight} onClick={() => stepWeight(1)}>▲</button>
                  <button className="ae-step" type="button" disabled={!basicChecked.weight} onClick={() => stepWeight(-1)}>▼</button>
                </div>
              </div>
            </FormRow>

            {/* 标题 */}
            <FormRow label="标题" checked={!!basicChecked.title} onCheck={() => toggleBasicRow('title')} annotationId="basic-title-row">
              <div className="ae-title-row">
                <span className="ae-field-label inline"><strong>标题</strong> 处理方式</span>
                <div className="ae-op-btns">
                  {titleOps.map((op) => (
                    <button
                      key={op}
                      className={`ae-op-btn${titleOpsOn.includes(op) ? ' active' : ''}`}
                      type="button"
                      disabled={!basicChecked.title}
                      onClick={() => toggleTitleOp(op)}
                    >
                      {op}
                    </button>
                  ))}
                </div>
              </div>
              <div className="ae-hint sub">可同时配置多个操作，按顺序依次应用到标题</div>
            </FormRow>

            {/* 标签 */}
            <FormRow label="标签" checked={!!basicChecked.tag} onCheck={() => toggleBasicRow('tag')} last annotationId="basic-tag-row">
              <label className="ae-check-line">
                <input
                  type="checkbox"
                  disabled={!basicChecked.tag}
                  checked={tagAdd}
                  onChange={() => setTagAdd((v) => !v)}
                />
                <span className="ae-checkbox-mask" />
                <span>添加标签</span>
              </label>
              <label className="ae-check-line">
                <input
                  type="checkbox"
                  disabled={!basicChecked.tag}
                  checked={tagRemove}
                  onChange={() => setTagRemove((v) => !v)}
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
            <FormRow label="视频" disabled>
              <div className="ae-radio-group">
                {['上传视频', '删除视频'].map((opt) => (
                  <label key={opt} className="ae-radio">
                    <input type="radio" name="video" disabled checked={false} onChange={() => {}} />
                    <span className="ae-radio-mask" />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
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
                disabled={!skuChecked.spec}
                onClick={() => setSkuSpecs((prev) => [...prev, `规格${prev.length + 1}`])}
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
                      disabled={!skuChecked.spec}
                      checked={skuSpecCover === mode}
                      onChange={() => setSkuSpecCover(mode)}
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
                      disabled={!skuChecked.spec}
                      checked={skuSpecPrice === mode}
                      onChange={() => setSkuSpecPrice(mode)}
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
                    disabled={!skuChecked.code}
                    checked={skuCodeOpts.includes(opt)}
                    onChange={() => toggleSkuCodeOpt(opt)}
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
                      disabled={!skuChecked.weight}
                      checked={skuWeightMode === mode}
                      onChange={() => setSkuWeightMode(mode)}
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
                      disabled={!skuChecked.stock}
                      checked={stockCalc === mode}
                      onChange={() => setStockCalc(mode)}
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
                  disabled={!skuChecked.stock}
                  value={stockQty}
                  onChange={(e) => setStockQty(e.target.value.replace(/[^\d]/g, ''))}
                />
                <div className="ae-input-steps">
                  <button className="ae-step" type="button" disabled={!skuChecked.stock} onClick={() => stepStockQty(1)}>▲</button>
                  <button className="ae-step" type="button" disabled={!skuChecked.stock} onClick={() => stepStockQty(-1)}>▼</button>
                </div>
              </div>
              <label className="ae-check-line ae-stock-zero">
                <input
                  type="checkbox"
                  disabled={!skuChecked.stock}
                  checked={stockZeroSkip}
                  onChange={() => setStockZeroSkip((v) => !v)}
                />
                <span className="ae-checkbox-mask" />
                <span>当平台记录的库存为0时不做任何修改</span>
              </label>
            </FormRow>
              </>
            )}

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
                  disabled={!basicChecked.brand}
                  value={brandValue}
                  onChange={(e) => setBrandValue(e.target.value)}
                  style={{ textAlign: 'left' }}
                />
                <div className="ae-hint sub" style={{ color: '#ff781f' }}>请输入完整品牌名称，系统根据名称精准匹配，如对应产品类目不存在该品牌，则更改不生效，品牌默认留空</div>
              </FormRow>
              </>
            )}

            {activeMenu !== 'basic' && activeMenu !== 'image' && activeMenu !== 'sku' && activeMenu !== 'service' && activeMenu !== 'attr' && (
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
