/**
 * @name 批量美图（线上还原）
 */

import React, { useCallback, useMemo, useRef, useState } from 'react';
import './style.css';

import bag1 from './assets/bag-1.jpg';
import bag2 from './assets/bag-2.jpg';
import bag3 from './assets/bag-3.jpg';
import bag4 from './assets/bag-4.jpg';
import bag5 from './assets/bag-5.jpg';
import { AnnotationViewer, type AnnotationSourceDocument } from '@axhub/annotation';
import annotationSourceDocument from './annotation-source.json';

type NavKey = 'whiteBg' | 'translate' | 'addWatermark' | 'watermark' | 'resize';
type SourceKey = 'main' | 'offSite' | 'spec' | 'detail';
type WatermarkType = 'text' | 'image';

interface ImageItem {
  id: string;
  src: string;
  width: number;
  height: number;
}

interface GroupState {
  images: ImageItem[];
  selected: string[];
  processSelected: string[];
  processed: Record<string, boolean>;
  failed: Record<string, boolean>;
  sizes: Record<string, { width: number; height: number }>;
}

const NAV_ITEMS: { key: NavKey; label: string }[] = [
  { key: 'whiteBg', label: '转白底' },
  { key: 'translate', label: '翻译' },
  { key: 'addWatermark', label: '加水印' },
  { key: 'watermark', label: '去水印' },
  { key: 'resize', label: '裁剪缩放' },
];

const SOURCE_META: { key: SourceKey; label: string }[] = [
  { key: 'main', label: '主图' },
  { key: 'offSite', label: '站外推广图' },
  { key: 'spec', label: 'SKU图' },
  { key: 'detail', label: '详情图' },
];

const SOURCE_IMAGES: Record<SourceKey, { src: string; width: number; height: number }[]> = {
  main: [
    { src: bag1, width: 1200, height: 1600 },
    { src: bag2, width: 1200, height: 1600 },
    { src: bag3, width: 1200, height: 1600 },
    { src: bag4, width: 600, height: 800 },
    { src: bag5, width: 600, height: 800 },
  ],
  offSite: [
    { src: bag2, width: 1200, height: 1600 },
    { src: bag4, width: 600, height: 800 },
  ],
  spec: [
    { src: bag1, width: 1200, height: 1600 },
    { src: bag3, width: 1200, height: 1600 },
    { src: bag5, width: 600, height: 800 },
  ],
  detail: [
    { src: bag1, width: 1200, height: 1600 },
    { src: bag2, width: 1200, height: 1600 },
    { src: bag3, width: 1200, height: 1600 },
    { src: bag5, width: 600, height: 800 },
  ],
};

const WATERMARK_TEMPLATES = [
  { id: 'tpl-1', name: '主图水印' },
  { id: 'tpl-2', name: '店铺水印' },
  { id: 'tpl-3', name: '浅色水印' },
];

const WATERMARK_POSITIONS = [
  { key: 'topLeft', label: '左上角' },
  { key: 'topRight', label: '右上角' },
  { key: 'bottomLeft', label: '左下角' },
  { key: 'bottomRight', label: '右下角' },
  { key: 'tile', label: '平铺' },
];

const createGroups = (): Record<SourceKey, GroupState> => {
  const result = {} as Record<SourceKey, GroupState>;
  (Object.keys(SOURCE_IMAGES) as SourceKey[]).forEach((key) => {
    const images = SOURCE_IMAGES[key].map((img, index) => ({
      id: `${key}-${index + 1}`,
      src: img.src,
      width: img.width,
      height: img.height,
    }));
    result[key] = {
      images,
      selected: images.map((img) => img.id),
      processSelected: images.map((img) => img.id),
      processed: {},
      failed: {},
      sizes: images.reduce<Record<string, { width: number; height: number }>>((acc, img) => {
        acc[img.id] = { width: img.width, height: img.height };
        return acc;
      }, {}),
    };
  });
  return result;
};

const CheckIcon: React.FC<{ size?: number; strokeWidth?: number }> = ({ size = 12, strokeWidth = 3 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CloseIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ZoomIcon: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="7" />
    <line x1="16.5" y1="16.5" x2="21" y2="21" />
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

const InfoIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <circle cx="12" cy="12" r="9" />
    <line x1="12" y1="11" x2="12" y2="16.5" />
    <circle cx="12" cy="7.6" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const UploadIcon: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const Spinner: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg className="biw-flower" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    {Array.from({ length: 12 }).map((_, i) => (
      <rect
        key={i}
        x="10.6"
        y="1.5"
        width="2.8"
        height="7"
        rx="1.4"
        fill="currentColor"
        transform={`rotate(${i * 30} 12 12)`}
        opacity={1 - i / 12}
      />
    ))}
  </svg>
);

const Tip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => (
  <span className="biw-tip" data-tip={text}>
    {children}
  </span>
);

const Slider: React.FC<{ value: number; min: number; max: number; onChange: (v: number) => void }> = ({
  value,
  min,
  max,
  onChange,
}) => (
  <input
    className="biw-slider"
    type="range"
    min={min}
    max={max}
    value={value}
    style={{ '--biw-percent': `${((value - min) / (max - min)) * 100}%` } as React.CSSProperties}
    onChange={(e) => onChange(Number(e.target.value))}
  />
);

const delay = (ms: number) => new Promise<void>((resolve) => { window.setTimeout(resolve, ms); });

const BatchImageWhiteBg: React.FC = () => {
  const [groups, setGroups] = useState<Record<SourceKey, GroupState>>(createGroups);
  const [activeSource, setActiveSource] = useState<SourceKey>('main');
  const [activeNav, setActiveNav] = useState<NavKey>('whiteBg');
  const [processing, setProcessing] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [processingIds, setProcessingIds] = useState<string[]>([]);
  const [closed, setClosed] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  const [versionOpen, setVersionOpen] = useState(false);
  const [translateOpen, setTranslateOpen] = useState(false);
  const [translateMode, setTranslateMode] = useState<'full' | 'detect'>('full');
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [dragId, setDragId] = useState<string | null>(null);

  const [wm, setWm] = useState({
    templateId: '',
    type: 'text' as WatermarkType,
    text: '',
    fontSize: 24,
    opacity: 80,
    imageUrl: '',
    size: 100,
    position: 'topLeft',
  });
  const [resize, setResize] = useState({ preset: '800', width: 800, height: 800 });

  const abortRef = useRef(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const group = groups[activeSource];
  const visibleImages = useMemo(
    () => group.selected.map((id) => group.images.find((img) => img.id === id)).filter(Boolean) as ImageItem[],
    [group],
  );
  const allChecked = visibleImages.length > 0 && group.processSelected.length === group.selected.length;
  const someChecked = group.processSelected.length > 0 && !allChecked;
  const hasProcessed = useMemo(
    () => (Object.keys(groups) as SourceKey[]).some((key) => Object.keys(groups[key].processed).length > 0),
    [groups],
  );
  const showCreditTip = activeNav === 'whiteBg';

  const showToast = (message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(message);
    toastTimerRef.current = setTimeout(() => {
      setToast('');
      toastTimerRef.current = null;
    }, 2600);
  };

  const patchGroup = useCallback((source: SourceKey, updater: (g: GroupState) => GroupState) => {
    setGroups((prev) => ({ ...prev, [source]: updater(prev[source]) }));
  }, []);

  const toggleImage = (id: string) => {
    patchGroup(activeSource, (g) => ({
      ...g,
      processSelected: g.processSelected.includes(id)
        ? g.processSelected.filter((item) => item !== id)
        : [...g.processSelected, id],
    }));
  };

  const toggleAll = () => {
    patchGroup(activeSource, (g) => ({
      ...g,
      processSelected: g.processSelected.length === g.selected.length ? [] : [...g.selected],
    }));
  };

  const switchSource = (key: SourceKey) => {
    if (processing || key === activeSource) return;
    setActiveSource(key);
  };

  const switchNav = (key: NavKey) => {
    if (processing || key === activeNav) return;
    setActiveNav(key);
  };

  const runProcess = async (ids: string[], nav: NavKey) => {
    if (!ids.length) return;
    const source = activeSource;
    abortRef.current = false;
    setProcessing(true);
    setStopping(false);
    let success = 0;
    let aborted = false;

    for (const id of ids) {
      if (abortRef.current) {
        aborted = true;
        break;
      }
      setProcessingIds((prev) => [...prev, id]);
      await delay(600 + Math.random() * 500);
      if (abortRef.current) {
        aborted = true;
        setProcessingIds((prev) => prev.filter((item) => item !== id));
        break;
      }
      patchGroup(source, (g) => ({
        ...g,
        processed: { ...g.processed, [id]: true },
        sizes:
          nav === 'resize'
            ? { ...g.sizes, [id]: { width: resize.width, height: resize.height } }
            : g.sizes,
      }));
      setProcessingIds((prev) => prev.filter((item) => item !== id));
      success += 1;
    }

    setProcessing(false);
    setStopping(false);
    setProcessingIds([]);
    if (aborted) {
      showToast(`已停止处理：成功 ${success} 张，未完成 ${ids.length - success} 张`);
    } else if (success === 0) {
      showToast('图片处理失败');
    } else if (success === ids.length) {
      showToast('图片处理完成');
    } else {
      showToast(`处理完成：成功 ${success} 张，失败 ${ids.length - success} 张`);
    }
  };

  const startProcess = () => {
    if (processing) return;
    const ids = group.processSelected;
    if (!ids.length) {
      showToast('请选择要处理的图片');
      return;
    }
    if (activeNav === 'resize') {
      if (!resize.width || !resize.height) {
        showToast('请输入宽度和高度');
        return;
      }
    }
    if (activeNav === 'addWatermark') {
      if (wm.type === 'text' && !wm.text.trim()) {
        showToast('请输入水印文字');
        return;
      }
      if (wm.type === 'image' && !wm.imageUrl) {
        showToast('请先上传水印图片');
        return;
      }
    }
    if (activeNav === 'watermark') {
      setVersionOpen(true);
      return;
    }
    if (activeNav === 'translate') {
      setTranslateOpen(true);
      return;
    }
    void runProcess(ids, activeNav);
  };

  const stopProcess = () => {
    if (stopping) {
      showToast('停止处理中，请等待当前任务处理完成');
      return;
    }
    abortRef.current = true;
    setStopping(true);
  };

  const closeDialog = () => {
    setPromptOpen(false);
    setClosed(true);
  };

  const requestClose = () => {
    if (hasProcessed) {
      setPromptOpen(true);
      return;
    }
    closeDialog();
  };

  const confirmSave = () => {
    if (!hasProcessed || processing) return;
    showToast('图片处理成功');
    closeDialog();
  };

  const saveAndExit = () => {
    setPromptOpen(false);
    showToast('图片处理成功');
    setClosed(true);
  };

  const exitWithoutSave = () => {
    setPromptOpen(false);
    setClosed(true);
  };

  const reopen = () => {
    setGroups(createGroups());
    setActiveSource('main');
    setActiveNav('whiteBg');
    setProcessing(false);
    setProcessingIds([]);
    setStopping(false);
    setPromptOpen(false);
    setVersionOpen(false);
    setTranslateOpen(false);
    setTranslateMode('full');
    setPreviewSrc(null);
    setClosed(false);
  };

  const handleDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    patchGroup(activeSource, (g) => {
      const images = [...g.images];
      const from = images.findIndex((img) => img.id === dragId);
      const to = images.findIndex((img) => img.id === targetId);
      if (from < 0 || to < 0) return g;
      const [moved] = images.splice(from, 1);
      images.splice(to, 0, moved);
      const order = images.map((img) => img.id);
      return {
        ...g,
        images,
        selected: [...g.selected].sort((a, b) => order.indexOf(a) - order.indexOf(b)),
        processSelected: [...g.processSelected].sort((a, b) => order.indexOf(a) - order.indexOf(b)),
      };
    });
    setDragId(null);
  };

  const chooseVersion = (version: 'pro' | 'normal') => {
    setVersionOpen(false);
    void runProcess(group.processSelected, 'watermark');
  };

  const confirmTranslate = () => {
    setTranslateOpen(false);
    void runProcess(group.processSelected, 'translate');
  };

  const previewText = wm.text.trim() ? wm.text : '预览文字';

  return (
    <>
      <div className="biw-overlay">
        {closed ? (
          <button type="button" className="biw-reopen" onClick={reopen}>
            重新打开「批量美图」
          </button>
        ) : (
          <div className="biw-dialog" role="dialog" aria-modal="true" aria-label="批量美图">
            <div className="biw-dialog__header">
              <span className="biw-dialog__title">批量美图</span>
              <button type="button" className="biw-dialog__close" aria-label="关闭" onClick={requestClose}>
                <CloseIcon />
              </button>
            </div>
            <div className="biw-dialog__body">
              <div className="biw-process">
                <nav className="biw-nav">
                  {NAV_ITEMS.map((item) => (
                    <div
                      key={item.key}
                      className={`biw-nav-item${activeNav === item.key ? ' is-active' : ''}${processing ? ' is-disabled' : ''}`}
                      onMouseDown={() => switchNav(item.key)}
                    >
                      {item.label}
                    </div>
                  ))}
                </nav>

                <div className="biw-main">
                  <div className="biw-content">
                    <div className="biw-source-tabs">
                      {SOURCE_META.map((item) => (
                        <div
                          key={item.key}
                          className={`biw-source-tab${activeSource === item.key ? ' is-active' : ''}${processing ? ' is-disabled' : ''}`}
                          onMouseDown={() => switchSource(item.key)}
                          title={processing ? '处理中时，禁用，避免切换到其他模块导致处理失败' : undefined}
                        >
                          {item.label}
                        </div>
                      ))}
                      <div className="biw-anno-anchor" data-annotation-id="position-tabs-disable" />
                    </div>

                    {activeNav === 'resize' && (
                      <div className="biw-resize">
                        <div className="biw-resize-item">
                          <span className="biw-resize-label">大小</span>
                          <select
                            className="biw-select biw-select--sm"
                            value={resize.preset}
                            onChange={(e) => {
                              const preset = e.target.value;
                              if (preset === 'custom') {
                                setResize((prev) => ({ ...prev, preset }));
                              } else {
                                const size = Number(preset);
                                setResize({ preset, width: size, height: size });
                              }
                            }}
                          >
                            <option value="1000">1000*1000</option>
                            <option value="800">800*800</option>
                            <option value="custom">自定义</option>
                          </select>
                        </div>
                        <div className="biw-resize-item">
                          <span className="biw-resize-label">宽度</span>
                          <input
                            className="biw-number"
                            type="number"
                            min={1}
                            max={5000}
                            value={resize.width}
                            onChange={(e) => {
                              const width = Number(e.target.value);
                              setResize((prev) => {
                                const preset =
                                  width === 1000 && prev.height === 1000
                                    ? '1000'
                                    : width === 800 && prev.height === 800
                                      ? '800'
                                      : 'custom';
                                return { ...prev, width, preset };
                              });
                            }}
                          />
                          <span className="biw-resize-unit">px</span>
                        </div>
                        <div className="biw-resize-item">
                          <span className="biw-resize-label">高度</span>
                          <input
                            className="biw-number"
                            type="number"
                            min={1}
                            max={5000}
                            value={resize.height}
                            onChange={(e) => {
                              const height = Number(e.target.value);
                              setResize((prev) => {
                                const preset =
                                  height === 1000 && prev.width === 1000
                                    ? '1000'
                                    : height === 800 && prev.width === 800
                                      ? '800'
                                      : 'custom';
                                return { ...prev, height, preset };
                              });
                            }}
                          />
                          <span className="biw-resize-unit">px</span>
                        </div>
                      </div>
                    )}

                    {activeNav === 'addWatermark' && (
                      <div className="biw-wm">
                        <div className="biw-wm-row">
                          <span className="biw-wm-label">水印模板</span>
                          <select
                            className="biw-select biw-select--wm"
                            value={wm.templateId}
                            onChange={(e) => setWm((prev) => ({ ...prev, templateId: e.target.value }))}
                          >
                            <option value="">请选择</option>
                            {WATERMARK_TEMPLATES.map((tpl) => (
                              <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
                            ))}
                          </select>
                          <button type="button" className="biw-link">创建模板</button>
                          <button type="button" className="biw-link">管理模板</button>
                        </div>
                        <div className="biw-wm-row">
                          <span className="biw-wm-label">水印类型</span>
                          <div className="biw-radio-group">
                            <label className="biw-radio">
                              <input
                                type="radio"
                                checked={wm.type === 'text'}
                                onChange={() => setWm((prev) => ({ ...prev, type: 'text' }))}
                              />
                              <span className="biw-radio-dot" />
                              <span>文字水印</span>
                            </label>
                            <label className="biw-radio">
                              <input
                                type="radio"
                                checked={wm.type === 'image'}
                                onChange={() => setWm((prev) => ({ ...prev, type: 'image' }))}
                              />
                              <span className="biw-radio-dot" />
                              <span>图片水印</span>
                            </label>
                          </div>
                        </div>

                        {wm.type === 'text' ? (
                          <>
                            <div className="biw-wm-row">
                              <span className="biw-wm-label">水印文字</span>
                              <input
                                className="biw-input"
                                type="text"
                                placeholder="请输入水印文字"
                                value={wm.text}
                                onChange={(e) => setWm((prev) => ({ ...prev, text: e.target.value }))}
                              />
                            </div>
                            <div className="biw-wm-row">
                              <span className="biw-wm-label">字号</span>
                              <Slider
                                value={wm.fontSize}
                                min={12}
                                max={72}
                                onChange={(fontSize) => setWm((prev) => ({ ...prev, fontSize }))}
                              />
                              <span className="biw-wm-value">{wm.fontSize}</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="biw-wm-row">
                              <span className="biw-wm-label">图片上传</span>
                              <button
                                type="button"
                                className="biw-upload"
                                onClick={() => setWm((prev) => ({ ...prev, imageUrl: bag3 }))}
                              >
                                <UploadIcon />
                                点击上传图片
                              </button>
                            </div>
                            <div className="biw-wm-row">
                              <span className="biw-wm-label">大小</span>
                              <Slider
                                value={wm.size}
                                min={10}
                                max={200}
                                onChange={(size) => setWm((prev) => ({ ...prev, size }))}
                              />
                              <span className="biw-wm-value">{wm.size}%</span>
                            </div>
                          </>
                        )}

                        <div className="biw-wm-row">
                          <span className="biw-wm-label">透明度</span>
                          <Slider
                            value={wm.opacity}
                            min={0}
                            max={100}
                            onChange={(opacity) => setWm((prev) => ({ ...prev, opacity }))}
                          />
                          <span className="biw-wm-value">{wm.opacity}%</span>
                        </div>

                        <div className="biw-wm-row">
                          <span className="biw-wm-label">预览</span>
                          {wm.type === 'text' ? (
                            <span
                              className="biw-wm-preview-text"
                              style={{ fontSize: wm.fontSize, opacity: wm.opacity / 100 }}
                            >
                              {previewText}
                            </span>
                          ) : wm.imageUrl ? (
                            <img
                              className="biw-wm-preview-img"
                              src={wm.imageUrl}
                              alt="水印预览"
                              style={{ width: `${wm.size / 2}px`, opacity: wm.opacity / 100 }}
                            />
                          ) : (
                            <span className="biw-wm-preview-empty">未上传图片</span>
                          )}
                        </div>

                        <div className="biw-wm-row">
                          <span className="biw-wm-label">水印位置</span>
                          <div className="biw-radio-group">
                            {WATERMARK_POSITIONS.map((pos) => (
                              <label className="biw-radio" key={pos.key}>
                                <input
                                  type="radio"
                                  checked={wm.position === pos.key}
                                  onChange={() => setWm((prev) => ({ ...prev, position: pos.key }))}
                                />
                                <span className="biw-radio-dot" />
                                <span>{pos.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="biw-action-row">
                      <div className="biw-action-left">
                        <label className="biw-checkbox">
                          <input type="checkbox" checked={allChecked} onChange={toggleAll} />
                          <span className={`biw-checkbox-box${allChecked ? ' is-checked' : ''}${someChecked ? ' is-indeterminate' : ''}`}>
                            {allChecked && <CheckIcon size={10} strokeWidth={4} />}
                            {someChecked && <span className="biw-checkbox-dash" />}
                          </span>
                          <span className={`biw-checkbox-label${allChecked ? ' is-checked' : ''}`}>全选</span>
                        </label>
                        <span className="biw-count">
                          已选 {group.processSelected.length}/{group.selected.length} 张
                        </span>
                      </div>
                      <div className="biw-action-right">
                        {processing ? (
                          <button type="button" className="biw-stop-btn" onClick={stopProcess}>
                            <Spinner size={14} />
                            {stopping ? '停止中' : '停止处理'}
                          </button>
                        ) : (
                          <button type="button" className="biw-start-btn" onClick={startProcess}>
                            开始处理
                            {showCreditTip && (
                              <Tip text="每处理1张图片消耗 xx 算力">
                                <i className="biw-help">?</i>
                              </Tip>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className={`biw-list${visibleImages.length === 0 ? ' is-empty' : ''}`}>
                      {visibleImages.length === 0 && <div className="biw-empty">暂无图片</div>}
                      {visibleImages.map((img, index) => {
                        const checked = group.processSelected.includes(img.id);
                        const isProcessing = processingIds.includes(img.id);
                        const size = group.sizes[img.id] || { width: img.width, height: img.height };
                        return (
                          <div
                            key={img.id}
                            className={`biw-item${checked ? ' is-selected' : ''}`}
                            draggable={!processing}
                            onDragStart={() => setDragId(img.id)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => handleDrop(img.id)}
                            onDragEnd={() => setDragId(null)}
                          >
                            <div className="biw-thumb">
                              <img src={img.src} alt="" draggable={false} />
                              <span className="biw-size-tag">{size.width}*{size.height}</span>
                              <div className="biw-click-mask" onClick={() => toggleImage(img.id)} />
                              {checked && (
                                <span className="biw-selected-mark">
                                  <CheckIcon size={12} strokeWidth={3} />
                                </span>
                              )}
                              <span
                                className="biw-zoom-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreviewSrc(img.src);
                                }}
                              >
                                <ZoomIcon />
                              </span>
                              {isProcessing && (
                                <div className="biw-processing-mask">
                                  <Spinner size={18} />
                                  <span>处理中...</span>
                                </div>
                              )}
                              {group.processed[img.id] && (
                                <span className="biw-completed-tag">
                                  <CheckIcon size={9} strokeWidth={4} />
                                  已完成
                                </span>
                              )}
                              {group.failed[img.id] && <span className="biw-failed-tag">处理失败</span>}
                            </div>
                            <span className="biw-index">图{index + 1}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="biw-footer">
                    {hasProcessed && <span className="biw-unsaved-tip">有已处理未保存的图片</span>}
                    <div className="biw-footer-btns">
                      <button
                        type="button"
                        className="biw-btn biw-btn--cancel"
                        disabled={processing}
                        onClick={requestClose}
                      >
                        取消
                      </button>
                      <button
                        type="button"
                        className="biw-btn biw-btn--confirm"
                        disabled={!hasProcessed || processing}
                        onClick={confirmSave}
                      >
                        确认
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {promptOpen && (
          <div className="biw-layer biw-layer--prompt">
            <div className="biw-dialog biw-dialog--prompt" role="dialog" aria-modal="true" aria-label="提示">
              <div className="biw-dialog__header">
                <span className="biw-dialog__title">提示</span>
                <button type="button" className="biw-dialog__close" aria-label="关闭" onClick={() => setPromptOpen(false)}>
                  <CloseIcon />
                </button>
              </div>
              <div className="biw-prompt-body">
                当前有已处理未保存的图片，退出后，已处理的图片将不会保存，是否继续退出？
              </div>
              <div className="biw-prompt-footer">
                <button type="button" className="biw-btn biw-btn--cancel" onClick={exitWithoutSave}>
                  退出
                </button>
                <button type="button" className="biw-btn biw-btn--confirm" onClick={saveAndExit}>
                  保存并退出
                </button>
              </div>
            </div>
          </div>
        )}

        {versionOpen && (
          <div className="biw-layer biw-layer--prompt">
            <div className="biw-dialog biw-dialog--version" role="dialog" aria-modal="true" aria-label="去水印">
              <div className="biw-dialog__header">
                <span className="biw-dialog__title">去水印</span>
                <button type="button" className="biw-dialog__close" aria-label="关闭" onClick={() => setVersionOpen(false)}>
                  <CloseIcon />
                </button>
              </div>
              <div className="biw-version-body">
                <div className="biw-version-tip">
                  <InfoIcon />
                  请选择去水印版本
                </div>
                <div className="biw-version-btns">
                  <button type="button" className="biw-version-btn" onClick={() => chooseVersion('pro')}>
                    Pro版本
                    <Tip text="每次点击消耗 xx 算力">
                      <i className="biw-help biw-help--plain">?</i>
                    </Tip>
                  </button>
                  <button type="button" className="biw-version-btn" onClick={() => chooseVersion('normal')}>
                    普通版
                    <Tip text="每次点击消耗 xx 算力">
                      <i className="biw-help biw-help--plain">?</i>
                    </Tip>
                  </button>
                </div>
              </div>
              <div className="biw-version-footer">
                <button type="button" className="biw-btn biw-btn--cancel" onClick={() => setVersionOpen(false)}>
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

        {translateOpen && (
          <div className="biw-layer biw-layer--prompt">
            <div className="biw-dialog biw-dialog--translate" role="dialog" aria-modal="true" aria-label="翻译">
              <div className="biw-dialog__header">
                <span className="biw-dialog__title">翻译</span>
                <button type="button" className="biw-dialog__close" aria-label="关闭" onClick={() => setTranslateOpen(false)}>
                  <CloseIcon />
                </button>
              </div>
              <div className="biw-translate-body">
                <div className="biw-version-tip">
                  <InfoIcon />
                  请选择翻译方式
                </div>
                <label className={`biw-choice${translateMode === 'full' ? ' is-checked' : ''}`}>
                  <input
                    type="radio"
                    name="translate-mode"
                    checked={translateMode === 'full'}
                    onChange={() => setTranslateMode('full')}
                  />
                  <span className="biw-choice-dot" />
                  <span className="biw-choice-content">
                    <span className="biw-choice-title">全量翻译</span>
                    <span className="biw-choice-desc">每翻译1张图片消耗 xx 算力</span>
                  </span>
                </label>
                <label className={`biw-choice${translateMode === 'detect' ? ' is-checked' : ''}`} data-annotation-id="translate-detect">
                  <input
                    type="radio"
                    name="translate-mode"
                    checked={translateMode === 'detect'}
                    onChange={() => setTranslateMode('detect')}
                  />
                  <span className="biw-choice-dot" />
                  <span className="biw-choice-content">
                    <span className="biw-choice-title">识别后翻译</span>
                    <span className="biw-choice-desc">
                      AI 先识别图片是否含有中文字符等需要翻译的内容：识别后无需翻译，每识别1张图片消耗 xx 算力；识别后需要翻译，翻译另需消耗 xx 算力
                    </span>
                  </span>
                </label>
              </div>
              <div className="biw-version-footer">
                <button type="button" className="biw-btn biw-btn--cancel" onClick={() => setTranslateOpen(false)}>
                  取消
                </button>
                <button type="button" className="biw-btn biw-btn--confirm" onClick={confirmTranslate}>
                  开始翻译
                </button>
              </div>
            </div>
          </div>
        )}

        {previewSrc && (
          <div className="biw-preview" onClick={() => setPreviewSrc(null)}>
            <img src={previewSrc} alt="图片预览" />
          </div>
        )}

        {toast && <div className="biw-toast">{toast}</div>}
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
              : 'batch-image-white-bg';
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
};

export default BatchImageWhiteBg;
