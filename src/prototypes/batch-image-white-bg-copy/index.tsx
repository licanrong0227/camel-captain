/**
 * @name 批量美图（线上还原）
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
type WatermarkType = 'text' | 'store' | 'image';
type WatermarkAngle = 'horizontal' | 'left' | 'right';
type IconBackground = 'white' | 'transparent';

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

interface ProcessEntry {
  source: SourceKey;
  id: string;
}

interface WatermarkState {
  templateId: string;
  type: WatermarkType;
  text: string;
  fontSize: number;
  opacity: number;
  imageUrl: string;
  size: number;
  position: string;
  angle: WatermarkAngle;
  iconBg: IconBackground;
}

const NAV_ITEMS: { key: NavKey; label: string }[] = [
  { key: 'whiteBg', label: '转白底' },
  { key: 'translate', label: '翻译' },
  { key: 'addWatermark', label: '加水印、图标' },
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

const DEMO_STORE_NAME = '包包';

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

const WATERMARK_ANGLES: { key: WatermarkAngle; label: string }[] = [
  { key: 'horizontal', label: '横向' },
  { key: 'left', label: '向左倾斜' },
  { key: 'right', label: '向右倾斜' },
];

const BUILTIN_ICON_FILES = import.meta.glob('./assets/builtin-icons/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const BUILTIN_ICON_CATEGORIES = [
  { zh: '快速送达', en: 'Fast Delivery' },
  { zh: '热卖爆款', en: 'Best Seller' },
  { zh: '超值特价', en: 'Super Price' },
  { zh: '热销', en: 'Hot Sale' },
  { zh: '新品上市', en: 'New Arrival' },
  { zh: '24 小时', en: '24 Hours' },
  { zh: '热门', en: 'Hot!' },
  { zh: '赠鞋带、赠袜、吊牌', en: 'Extra Laces + Free Socks + TAG' },
  { zh: '含鞋盒', en: 'With Box' },
  { zh: '袜子', en: 'Sock' },
  { zh: '24 小时发货', en: '24 Hours Shipping' },
  { zh: '优质品质', en: 'Best Quality' },
  { zh: '吊牌', en: 'Tag' },
];

const BUILTIN_ICONS = BUILTIN_ICON_CATEGORIES.map((category, catIndex) => {
  const prefix = `c${String(catIndex + 1).padStart(2, '0')}-`;
  const items = Object.keys(BUILTIN_ICON_FILES)
    .filter((path) => path.includes(`/${prefix}`))
    .sort()
    .map((path) => {
      const fileName = path.split('/').pop() as string;
      return { id: fileName.replace('.png', ''), src: BUILTIN_ICON_FILES[path] };
    });
  return { key: prefix.slice(0, 3), zh: category.zh, en: category.en, name: category.zh, items };
}).filter((cat) => cat.items.length > 0);

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

const GridIcon: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
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

const SelectAll: React.FC<{
  checked: boolean;
  indeterminate: boolean;
  label: string;
  onChange: () => void;
}> = ({ checked, indeterminate, label, onChange }) => (
  <label className="biw-checkbox">
    <input type="checkbox" checked={checked} onChange={onChange} />
    <span className={`biw-checkbox-box${checked ? ' is-checked' : ''}${indeterminate ? ' is-indeterminate' : ''}`}>
      {checked && <CheckIcon size={10} strokeWidth={4} />}
      {indeterminate && <span className="biw-checkbox-dash" />}
    </span>
    <span className={`biw-checkbox-label${checked ? ' is-checked' : ''}`}>{label}</span>
  </label>
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

const WATERMARK_CANVAS_SIZE = 800;

const transparentIconCache = new Map<string, HTMLCanvasElement>();

const createTransparentIcon = (image: HTMLImageElement, key: string): HTMLCanvasElement => {
  const cached = transparentIconCache.get(key);
  if (cached) return cached;
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  ctx.drawImage(image, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;
  const { width, height } = canvas;
  const visited = new Uint8Array(width * height);
  const queue: number[] = [];
  const enqueue = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const index = y * width + x;
    if (visited[index]) return;
    visited[index] = 1;
    const offset = index * 4;
    if (pixels[offset] > 235 && pixels[offset + 1] > 235 && pixels[offset + 2] > 235) {
      queue.push(index);
    }
  };
  for (let x = 0; x < width; x += 1) {
    enqueue(x, 0);
    enqueue(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    enqueue(0, y);
    enqueue(width - 1, y);
  }
  while (queue.length) {
    const index = queue.pop() as number;
    pixels[index * 4 + 3] = 0;
    const x = index % width;
    const y = (index - x) / width;
    enqueue(x - 1, y);
    enqueue(x + 1, y);
    enqueue(x, y - 1);
    enqueue(x, y + 1);
  }
  ctx.putImageData(imageData, 0, 0);
  transparentIconCache.set(key, canvas);
  return canvas;
};

const drawWatermarkPreview = (
  canvas: HTMLCanvasElement,
  wm: WatermarkState,
  text: string,
  image?: HTMLImageElement | HTMLCanvasElement,
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const S = WATERMARK_CANVAS_SIZE;
  ctx.clearRect(0, 0, S, S);
  ctx.fillStyle = '#e5e6eb';
  ctx.fillRect(0, 0, S, S);
  ctx.globalAlpha = wm.opacity / 100;

  const angleRad = wm.angle === 'left' ? -Math.PI / 6 : wm.angle === 'right' ? Math.PI / 6 : 0;
  const pad = 24;

  if (wm.type !== 'image') {
    ctx.fillStyle = '#303133';
    ctx.font = `${wm.fontSize}px "PingFang SC", "Microsoft YaHei", sans-serif`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    if (wm.position === 'tile') {
      const textWidth = ctx.measureText(text).width;
      const stepX = textWidth + wm.fontSize * 2.5;
      const stepY = wm.fontSize * 3;
      ctx.save();
      ctx.translate(S / 2, S / 2);
      ctx.rotate(angleRad);
      let rowIndex = 0;
      for (let y = -S; y <= S; y += stepY) {
        const offset = rowIndex % 2 === 0 ? 0 : stepX / 2;
        for (let x = -S - stepX; x <= S; x += stepX) {
          ctx.fillText(text, x + offset, y);
        }
        rowIndex += 1;
      }
      ctx.restore();
    } else {
      ctx.textAlign = wm.position.endsWith('Right') ? 'right' : 'left';
      const x = wm.position.endsWith('Right') ? S - pad : pad;
      const y = wm.position.startsWith('top') ? pad + wm.fontSize / 2 : S - pad - wm.fontSize / 2;
      ctx.fillText(text, x, y);
    }
  } else if (image) {
    const width = Math.max(1, wm.size * 2);
    const height = width * ((image.height / image.width) || 1);
    const drawPlate = (x: number, y: number) => {
      if (wm.iconBg !== 'white') return;
      const radius = Math.min(width, height) * 0.08;
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.arcTo(x + width, y, x + width, y + height, radius);
      ctx.arcTo(x + width, y + height, x, y + height, radius);
      ctx.arcTo(x, y + height, x, y, radius);
      ctx.arcTo(x, y, x + width, y, radius);
      ctx.closePath();
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    };
    if (wm.position === 'tile') {
      ctx.save();
      ctx.translate(S / 2, S / 2);
      ctx.rotate(angleRad);
      const stepX = width + 60;
      const stepY = height + 60;
      for (let y = -S; y <= S; y += stepY) {
        for (let x = -S; x <= S; x += stepX) {
          drawPlate(x - width / 2, y - height / 2);
          ctx.drawImage(image, x - width / 2, y - height / 2, width, height);
        }
      }
      ctx.restore();
    } else {
      const x = wm.position.endsWith('Right') ? S - width - pad : pad;
      const y = wm.position.startsWith('top') ? pad : S - height - pad;
      drawPlate(x, y);
      ctx.drawImage(image, x, y, width, height);
    }
  }

  ctx.globalAlpha = 1;
};

const WatermarkPreview: React.FC<{
  wm: WatermarkState;
  text: string;
  onOpen: (dataUrl: string) => void;
}> = ({ wm, text, onOpen }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (wm.type === 'image' && wm.imageUrl) {
      const image = new Image();
      const render = () => {
        const source = wm.iconBg === 'transparent' ? createTransparentIcon(image, wm.imageUrl) : image;
        drawWatermarkPreview(canvas, wm, text, source);
      };
      image.onload = render;
      image.src = wm.imageUrl;
      if (image.complete) render();
      return;
    }
    drawWatermarkPreview(canvas, wm, text);
  }, [wm, text]);

  return (
    <canvas
      ref={canvasRef}
      className="biw-wm-preview-canvas"
      width={WATERMARK_CANVAS_SIZE}
      height={WATERMARK_CANVAS_SIZE}
      title="点击查看大图"
      onClick={() => {
        const canvas = canvasRef.current;
        if (canvas) onOpen(canvas.toDataURL('image/png'));
      }}
    />
  );
};

const delay = (ms: number) => new Promise<void>((resolve) => { window.setTimeout(resolve, ms); });

const BatchImageWhiteBg: React.FC = () => {
  const [groups, setGroups] = useState<Record<SourceKey, GroupState>>(createGroups);
  const [activeAnchor, setActiveAnchor] = useState<SourceKey>('main');
  const [activeNav, setActiveNav] = useState<NavKey>('whiteBg');
  const [processing, setProcessing] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [processingIds, setProcessingIds] = useState<string[]>([]);
  const [closed, setClosed] = useState(false);
  const [backgrounded, setBackgrounded] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  const [versionOpen, setVersionOpen] = useState(false);
  const [translateOpen, setTranslateOpen] = useState(false);
  const [translateMode, setTranslateMode] = useState<'full' | 'detect'>('full');
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [iconCategory, setIconCategory] = useState(BUILTIN_ICONS[0]?.key ?? '');
  const [iconDraft, setIconDraft] = useState('');
  const [iconBgDraft, setIconBgDraft] = useState<IconBackground>('white');
  const [toast, setToast] = useState('');
  const [dragId, setDragId] = useState<string | null>(null);

  const [wm, setWm] = useState<WatermarkState>({
    templateId: '',
    type: 'text',
    text: '',
    fontSize: 24,
    opacity: 80,
    imageUrl: '',
    size: 100,
    position: 'topLeft',
    angle: 'horizontal',
    iconBg: 'white',
  });
  const [resize, setResize] = useState({ preset: '800', width: 800, height: 800 });

  const abortRef = useRef(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const anchorBarRef = useRef<HTMLDivElement | null>(null);
  const anchorLockRef = useRef(false);
  const sectionRefs = useRef<Record<SourceKey, HTMLElement | null>>({
    main: null,
    offSite: null,
    spec: null,
    detail: null,
  });

  const totalImages = useMemo(
    () => (Object.keys(groups) as SourceKey[]).reduce((sum, key) => sum + groups[key].selected.length, 0),
    [groups],
  );
  const totalSelected = useMemo(
    () =>
      (Object.keys(groups) as SourceKey[]).reduce(
        (sum, key) => sum + groups[key].processSelected.filter((id) => groups[key].selected.includes(id)).length,
        0,
      ),
    [groups],
  );
  const allChecked = totalImages > 0 && totalSelected === totalImages;
  const someChecked = totalSelected > 0 && !allChecked;
  const builtinCategory = BUILTIN_ICONS.find((cat) => cat.key === iconCategory) ?? BUILTIN_ICONS[0];
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

  const toggleImage = (source: SourceKey, id: string) => {
    patchGroup(source, (g) => ({
      ...g,
      processSelected: g.processSelected.includes(id)
        ? g.processSelected.filter((item) => item !== id)
        : [...g.processSelected, id],
    }));
  };

  const toggleGroupAll = (source: SourceKey) => {
    patchGroup(source, (g) => ({
      ...g,
      processSelected: g.processSelected.length === g.selected.length ? [] : [...g.selected],
    }));
  };

  const toggleAllGlobal = () => {
    const selectAll = totalSelected < totalImages;
    setGroups((prev) => {
      const next = {} as Record<SourceKey, GroupState>;
      (Object.keys(prev) as SourceKey[]).forEach((key) => {
        next[key] = { ...prev[key], processSelected: selectAll ? [...prev[key].selected] : [] };
      });
      return next;
    });
  };

  const collectEntries = useCallback(
    (): ProcessEntry[] =>
      SOURCE_META.flatMap(({ key }) =>
        groups[key].processSelected
          .filter((id) => groups[key].selected.includes(id))
          .map((id) => ({ source: key, id })),
      ),
    [groups],
  );

  const switchNav = (key: NavKey) => {
    if (processing || key === activeNav) return;
    setActiveNav(key);
  };

  const handleContentScroll = () => {
    const content = contentRef.current;
    if (!content || anchorLockRef.current) return;
    if (content.scrollTop + content.clientHeight >= content.scrollHeight - 2) {
      setActiveAnchor(SOURCE_META[SOURCE_META.length - 1].key);
      return;
    }
    const barHeight = anchorBarRef.current?.offsetHeight ?? 0;
    const contentTop = content.getBoundingClientRect().top;
    let current: SourceKey = 'main';
    (Object.keys(sectionRefs.current) as SourceKey[]).forEach((key) => {
      const el = sectionRefs.current[key];
      if (el && el.getBoundingClientRect().top - contentTop <= barHeight + 12) current = key;
    });
    setActiveAnchor(current);
  };

  const unlockAnchor = () => {
    anchorLockRef.current = false;
  };

  const scrollToSource = (key: SourceKey) => {
    const content = contentRef.current;
    const el = sectionRefs.current[key];
    if (!content || !el) return;
    anchorLockRef.current = true;
    const barHeight = anchorBarRef.current?.offsetHeight ?? 0;
    const delta = el.getBoundingClientRect().top - content.getBoundingClientRect().top;
    content.scrollTo({ top: content.scrollTop + delta - barHeight, behavior: 'smooth' });
    setActiveAnchor(key);
  };

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      anchorLockRef.current = false;
      handleContentScroll();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeNav]);

  const runProcess = async (entries: ProcessEntry[], nav: NavKey) => {
    if (!entries.length) return;
    abortRef.current = false;
    setProcessing(true);
    setStopping(false);
    let success = 0;
    let aborted = false;

    for (const entry of entries) {
      if (abortRef.current) {
        aborted = true;
        break;
      }
      setProcessingIds((prev) => [...prev, entry.id]);
      await delay(600 + Math.random() * 500);
      if (abortRef.current) {
        aborted = true;
        setProcessingIds((prev) => prev.filter((item) => item !== entry.id));
        break;
      }
      patchGroup(entry.source, (g) => ({
        ...g,
        processed: { ...g.processed, [entry.id]: true },
        sizes:
          nav === 'resize'
            ? { ...g.sizes, [entry.id]: { width: resize.width, height: resize.height } }
            : g.sizes,
      }));
      setProcessingIds((prev) => prev.filter((item) => item !== entry.id));
      success += 1;
    }

    setProcessing(false);
    setStopping(false);
    setProcessingIds([]);
    if (aborted) {
      showToast(`已停止处理：成功 ${success} 张，未完成 ${entries.length - success} 张`);
    } else if (success === 0) {
      showToast('图片处理失败');
    } else if (success === entries.length) {
      showToast('图片处理完成');
    } else {
      showToast(`处理完成：成功 ${success} 张，失败 ${entries.length - success} 张`);
    }
  };

  const startProcess = () => {
    if (processing) return;
    const entries = collectEntries();
    if (!entries.length) {
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
    void runProcess(entries, activeNav);
  };

  const stopProcess = () => {
    if (stopping) {
      showToast('停止处理中，请等待当前任务处理完成');
      return;
    }
    abortRef.current = true;
    setStopping(true);
  };

  const sendToBackground = () => {
    if (!processing) return;
    setBackgrounded(true);
    setClosed(true);
    showToast('已转后台处理');
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
    if (backgrounded) {
      setBackgrounded(false);
      setClosed(false);
      return;
    }
    setGroups(createGroups());
    setActiveAnchor('main');
    setActiveNav('whiteBg');
    setProcessing(false);
    setProcessingIds([]);
    setStopping(false);
    setPromptOpen(false);
    setVersionOpen(false);
    setTranslateOpen(false);
    setTranslateMode('full');
    setPreviewSrc(null);
    setIconPickerOpen(false);
    setIconDraft('');
    setIconBgDraft('white');
    setClosed(false);
  };

  const handleDrop = (targetSource: SourceKey, targetId: string) => {
    if (!dragId || dragId === targetId) return;
    patchGroup(targetSource, (g) => {
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
    void runProcess(collectEntries(), 'watermark');
  };

  const openIconPicker = () => {
    const matched = BUILTIN_ICONS.find((cat) => cat.items.some((item) => item.src === wm.imageUrl));
    setIconCategory(matched ? matched.key : BUILTIN_ICONS[0]?.key ?? '');
    setIconDraft(matched ? wm.imageUrl : '');
    setIconBgDraft(wm.iconBg);
    setIconPickerOpen(true);
  };

  const confirmBuiltinIcon = () => {
    if (!iconDraft) return;
    setWm((prev) => ({ ...prev, imageUrl: iconDraft, iconBg: iconBgDraft }));
    setIconPickerOpen(false);
  };

  const confirmTranslate = () => {
    setTranslateOpen(false);
    void runProcess(collectEntries(), 'translate');
  };

  const previewText =
    wm.type === 'store' ? DEMO_STORE_NAME : wm.text.trim() ? wm.text : '预览文字';

  return (
    <>
      <div className="biw-overlay">
        {closed ? (
          <button type="button" className="biw-reopen" onClick={reopen}>
            {backgrounded && processing ? '批量美图正在后台处理，点击查看' : '重新打开「批量美图」'}
          </button>
        ) : (
          <div className="biw-dialog biw-dialog--batch" role="dialog" aria-modal="true" aria-label="批量美图">
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
                  <div
                    className="biw-content"
                    ref={contentRef}
                    onScroll={handleContentScroll}
                    onWheel={unlockAnchor}
                    onTouchStart={unlockAnchor}
                    onPointerDown={unlockAnchor}
                  >
                    <div className="biw-anchor-bar" ref={anchorBarRef}>
                      {SOURCE_META.map((item) => (
                        <div
                          key={item.key}
                          className={`biw-anchor${activeAnchor === item.key ? ' is-active' : ''}`}
                          onClick={() => scrollToSource(item.key)}
                        >
                          {item.label}
                        </div>
                      ))}
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
                                checked={wm.type === 'store'}
                                onChange={() => setWm((prev) => ({ ...prev, type: 'store' }))}
                              />
                              <span className="biw-radio-dot" />
                              <span>店铺名称水印</span>
                            </label>
                            <label className="biw-radio">
                              <input
                                type="radio"
                                checked={wm.type === 'image'}
                                onChange={() => setWm((prev) => ({ ...prev, type: 'image' }))}
                              />
                              <span className="biw-radio-dot" />
                              <span>图片水印、图标</span>
                            </label>
                          </div>
                        </div>

                        {wm.type !== 'image' ? (
                          <>
                            <div className="biw-wm-row">
                              <span className="biw-wm-label">水印文字</span>
                              <input
                                className="biw-input"
                                type="text"
                                placeholder="请输入水印文字"
                                value={wm.type === 'store' ? DEMO_STORE_NAME : wm.text}
                                disabled={wm.type === 'store'}
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
                              <button type="button" className="biw-upload biw-upload--builtin" onClick={openIconPicker}>
                                <GridIcon />
                                内置图标
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

                        {wm.position === 'tile' && (
                          <div className="biw-wm-row">
                            <span className="biw-wm-label">水印角度</span>
                            <div className="biw-radio-group">
                              {WATERMARK_ANGLES.map((angle) => (
                                <label className="biw-radio" key={angle.key}>
                                  <input
                                    type="radio"
                                    checked={wm.angle === angle.key}
                                    onChange={() => setWm((prev) => ({ ...prev, angle: angle.key }))}
                                  />
                                  <span className="biw-radio-dot" />
                                  <span>{angle.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="biw-wm-row biw-wm-row--preview">
                          <span className="biw-wm-label">预览</span>
                          <WatermarkPreview wm={wm} text={previewText} onOpen={setPreviewSrc} />
                          {wm.type === 'image' && !wm.imageUrl && (
                            <span className="biw-wm-preview-empty">未上传图片</span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="biw-action-row">
                      <div className="biw-action-left">
                        <SelectAll
                          checked={allChecked}
                          indeterminate={someChecked}
                          label="选中全部图片"
                          onChange={toggleAllGlobal}
                        />
                        <span className="biw-count">
                          已选 {totalSelected}/{totalImages} 张
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

                    {SOURCE_META.map(({ key, label }) => {
                      const sourceGroup = groups[key];
                      const images = sourceGroup.selected
                        .map((id) => sourceGroup.images.find((img) => img.id === id))
                        .filter(Boolean) as ImageItem[];
                      const checkedCount = sourceGroup.processSelected.filter((id) =>
                        sourceGroup.selected.includes(id),
                      ).length;
                      const sectionAllChecked = images.length > 0 && checkedCount === images.length;
                      const sectionSomeChecked = checkedCount > 0 && !sectionAllChecked;
                      return (
                        <section
                          key={key}
                          className="biw-section"
                          ref={(el) => {
                            sectionRefs.current[key] = el;
                          }}
                        >
                          <div className="biw-section__head">
                            <span className="biw-section__title">{label}</span>
                            <span className="biw-section__meta">
                              已选 {checkedCount}/{images.length} 张
                            </span>
                            <span className="biw-section__select-all">
                              <SelectAll
                                checked={sectionAllChecked}
                                indeterminate={sectionSomeChecked}
                                label="全选"
                                onChange={() => toggleGroupAll(key)}
                              />
                            </span>
                          </div>
                          <div className={`biw-list${images.length === 0 ? ' is-empty' : ''}`}>
                            {images.length === 0 && <div className="biw-empty">暂无图片</div>}
                            {images.map((img, index) => {
                              const checked = sourceGroup.processSelected.includes(img.id);
                              const isProcessing = processingIds.includes(img.id);
                              const size = sourceGroup.sizes[img.id] || { width: img.width, height: img.height };
                              return (
                                <div
                                  key={img.id}
                                  className={`biw-item${checked ? ' is-selected' : ''}`}
                                  draggable={!processing}
                                  onDragStart={() => setDragId(img.id)}
                                  onDragOver={(e) => e.preventDefault()}
                                  onDrop={() => handleDrop(key, img.id)}
                                  onDragEnd={() => setDragId(null)}
                                >
                                  <div className="biw-thumb">
                                    <img src={img.src} alt="" draggable={false} />
                                    <span className="biw-size-tag">{size.width}*{size.height}</span>
                                    <div className="biw-click-mask" onClick={() => toggleImage(key, img.id)} />
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
                                    {sourceGroup.processed[img.id] && (
                                      <span className="biw-completed-tag">
                                        <CheckIcon size={9} strokeWidth={4} />
                                        已完成
                                      </span>
                                    )}
                                    {sourceGroup.failed[img.id] && <span className="biw-failed-tag">处理失败</span>}
                                  </div>
                                  <span className="biw-index">图{index + 1}</span>
                                </div>
                              );
                            })}
                          </div>
                        </section>
                      );
                    })}
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
                      {processing && (
                        <button type="button" className="biw-btn biw-btn--background" onClick={sendToBackground}>
                          后台处理
                        </button>
                      )}
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

        {iconPickerOpen && (
          <div className="biw-layer biw-layer--prompt">
            <div className="biw-dialog biw-dialog--icon-picker" role="dialog" aria-modal="true" aria-label="内置图标">
              <div className="biw-dialog__header">
                <span className="biw-dialog__title">内置图标</span>
                <button type="button" className="biw-dialog__close" aria-label="关闭" onClick={() => setIconPickerOpen(false)}>
                  <CloseIcon />
                </button>
              </div>
              <div className="biw-icon-picker">
                <div className="biw-icon-picker__cats">
                  {BUILTIN_ICONS.map((cat) => (
                    <button
                      key={cat.key}
                      type="button"
                      className={`biw-icon-picker__cat${cat.key === builtinCategory?.key ? ' is-active' : ''}`}
                      title={`${cat.zh}（${cat.en}）`}
                      onClick={() => setIconCategory(cat.key)}
                    >
                      <span className="biw-icon-picker__cat-zh">{cat.zh}</span>
                      <span className="biw-icon-picker__cat-en">{cat.en}</span>
                    </button>
                  ))}
                </div>
                <div className="biw-icon-picker__grid">
                  {builtinCategory?.items.map((icon) => (
                    <button
                      key={icon.id}
                      type="button"
                      className={`biw-icon-picker__item${iconDraft === icon.src ? ' is-checked' : ''}`}
                      onClick={() => setIconDraft(icon.src)}
                    >
                      <img src={icon.src} alt="" />
                      {iconDraft === icon.src && (
                        <span className="biw-icon-picker__check">
                          <CheckIcon size={10} strokeWidth={4} />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div className="biw-icon-picker__footer">
                <div className="biw-icon-picker__bg">
                  <span className="biw-icon-picker__bg-label">图标背景</span>
                  <div className="biw-radio-group">
                    <label className="biw-radio">
                      <input
                        type="radio"
                        checked={iconBgDraft === 'white'}
                        onChange={() => setIconBgDraft('white')}
                      />
                      <span className="biw-radio-dot" />
                      <span>白色</span>
                    </label>
                    <label className="biw-radio">
                      <input
                        type="radio"
                        checked={iconBgDraft === 'transparent'}
                        onChange={() => setIconBgDraft('transparent')}
                      />
                      <span className="biw-radio-dot" />
                      <span>透明</span>
                    </label>
                  </div>
                </div>
                <div className="biw-icon-picker__actions">
                  <button type="button" className="biw-btn biw-btn--cancel" onClick={() => setIconPickerOpen(false)}>
                    取消
                  </button>
                  <button
                    type="button"
                    className="biw-btn biw-btn--confirm"
                    disabled={!iconDraft}
                    onClick={confirmBuiltinIcon}
                  >
                    确定
                  </button>
                </div>
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
