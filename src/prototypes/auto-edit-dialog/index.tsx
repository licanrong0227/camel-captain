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
  { id: 'basic', label: '商品基本信息', count: 7, icon: <MenuHome /> },
  { id: 'detail', label: '详情页面', count: 1, icon: <MenuDoc /> },
  { id: 'attr', label: '属性', count: 1, icon: <MenuAttr /> },
  { id: 'service', label: '服务', count: 3, icon: <MenuUser /> },
  { id: 'price', label: '商品价格', count: 2, icon: <MenuTag /> },
  { id: 'sale', label: '销售方案', count: 1, icon: <MenuList /> },
  { id: 'sku', label: 'SKU信息', count: 5, icon: <MenuGrid /> },
  { id: 'stock', label: '备货信息', count: 1, icon: <MenuBox /> },
  { id: 'custom', label: '定制商品', count: 1, icon: <MenuDoc /> },
  { id: 'pack', label: '包装物流', count: 1, icon: <MenuPkg /> },
  { id: 'image', label: '图片视频', count: 6, icon: <MenuImg /> },
  { id: 'trans', label: '翻译', count: 1, icon: <MenuTrans />, done: true },
  { id: 'source', label: '货源信息', count: 1, icon: <MenuLink /> },
];

// ===== 主图 =====
const MAX_MAIN_IMAGES = 15;

type UploadedImage = { url: string; width: number; height: number };
type MainImageMode = 'reorder' | 'replace' | 'delete' | 'append';

const mainImageModes: { id: MainImageMode; label: string; hint: string }[] = [
  { id: 'reorder', label: '调换顺序', hint: '拖拽调整主图顺序，或由系统随机打乱顺序' },
  { id: 'replace', label: '替换主图', hint: '' },
  { id: 'delete', label: '删除主图', hint: '删除指定位置的主图' },
  { id: 'append', label: '附加主图', hint: '上传新的图片附加到结尾，如果主图数量超过限制，则自动替换最后的主图' },
];

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

// ===== Row component =====
function FormRow({ label, checked, onCheck, children, last, disabled, flush, annotationId }: {
  label: string;
  checked?: boolean;
  onCheck?: () => void;
  children: React.ReactNode;
  last?: boolean;
  disabled?: boolean;
  flush?: boolean;
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
      <div className="ae-row-body">{children}</div>
    </div>
  );
}

// ===== Main =====
export default function AutoEditDialog() {
  const [activeMenu, setActiveMenu] = useState('image');
  const [mainImageChecked, setMainImageChecked] = useState(false);
  const [mainImageMode, setMainImageMode] = useState<MainImageMode | ''>('');
  const [slotIds, setSlotIds] = useState<number[]>(() =>
    Array.from({ length: MAX_MAIN_IMAGES }, (_, i) => i + 1));
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [replaceImages, setReplaceImages] = useState<Record<number, UploadedImage>>({});
  const [deletedPositions, setDeletedPositions] = useState<number[]>([]);
  const [appendImages, setAppendImages] = useState<UploadedImage[]>([]);
  const [uploadDialog, setUploadDialog] = useState<'replace' | 'append' | null>(null);
  const [sampleAtPos3, setSampleAtPos3] = useState(true);
  const [appendSample, setAppendSample] = useState(true);
  const pasteTargetRef = useRef<{ kind: 'append' } | null>(null);

  const positions = Array.from({ length: MAX_MAIN_IMAGES }, (_, i) => i + 1);
  const currentHint = mainImageModes.find((m) => m.id === mainImageMode)?.hint;

  const selectMode = (mode: MainImageMode) => {
    setMainImageMode(mode);
    setMainImageChecked(true);
  };

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
      <div className="ae-modal" data-annotation-id="auto-edit-modal">
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
            {/* 主图 */}
            <FormRow label="主图" checked={mainImageChecked} onCheck={toggleMainImage} flush annotationId="main-image-row">
              <div className="ae-radio-group">
                {mainImageModes.map((mode) => (
                  <div key={mode.id} className="ae-radio-slot" data-annotation-id={`main-mode-${mode.id}`}>
                    <label className="ae-radio">
                      <input
                        type="radio"
                        name="mainImage"
                        checked={mainImageMode === mode.id}
                        onChange={() => selectMode(mode.id)}
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

            {/* 推广图变白底图 */}
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
          </div>
        </div>

        {/* Footer */}
        <div className="ae-footer" data-annotation-id="footer">
          <button className="ae-btn-cancel" type="button">取消</button>
          <button className="ae-btn-submit" type="button">提交认领</button>
        </div>
      </div>
    </div>

    {/* 上传图片弹窗（仅样式，本地/URL/引用、单个/批量均不可切换） */}
    {uploadDialog && (
      <div className="au-overlay">
        <div className="au-modal" data-annotation-id="upload-image-dialog">
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
