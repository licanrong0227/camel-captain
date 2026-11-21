/**
 * @name 更新发布弹窗
 */

import React, { useEffect, useRef, useState } from 'react';
import { AnnotationViewer, type AnnotationSourceDocument } from '@axhub/annotation';
import annotationSourceDocument from './annotation-source.json';
import mainSample1 from './assets/main-image-sample-1.png';
import './style.css';

const pad2 = (n: number) => String(n).padStart(2, '0');

type SegmentState = { pre: string; start: string; suf: string };
type UploadedImage = { id: string; url: string; name: string; width: number; height: number };

type WatermarkType = 'text' | 'image' | 'shopName';
type IconBackground = 'white' | 'transparent';
type WatermarkTemplate = { id: string; name: string };

interface WatermarkState {
  templateId: string;
  type: WatermarkType;
  text: string;
  fontSize: number;
  opacity: number;
  imageUrl: string;
  size: number;
  iconBg: IconBackground;
}

const WATERMARK_TEMPLATES: WatermarkTemplate[] = [
  { id: 'tpl-1', name: '主图水印' },
  { id: 'tpl-2', name: '店铺水印' },
  { id: 'tpl-3', name: '浅色水印' },
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

  const pad = 24;

  if (wm.type !== 'image') {
    ctx.fillStyle = '#303133';
    ctx.font = `${wm.fontSize}px "PingFang SC", "Microsoft YaHei", sans-serif`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillText(text, pad, pad + wm.fontSize / 2);
  } else if (image) {
    const width = Math.max(1, wm.size * 2);
    const height = width * ((image.height / image.width) || 1);
    if (wm.iconBg === 'white') {
      const radius = Math.min(width, height) * 0.08;
      ctx.beginPath();
      ctx.moveTo(pad + radius, pad);
      ctx.arcTo(pad + width, pad, pad + width, pad + height, radius);
      ctx.arcTo(pad + width, pad + height, pad, pad + height, radius);
      ctx.arcTo(pad, pad + height, pad, pad, radius);
      ctx.arcTo(pad, pad, pad + width, pad, radius);
      ctx.closePath();
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }
    ctx.drawImage(image, pad, pad, width, height);
  }

  ctx.globalAlpha = 1;
};

const WatermarkThumb = ({ wm, text, onOpen }: {
  wm: WatermarkState;
  text: string;
  onOpen: (dataUrl: string) => void;
}) => {
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
      className="up-wm__thumb"
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

const WatermarkSlider = ({ value, min, max, onChange, ariaLabel }: {
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
  ariaLabel: string;
}) => (
  <input
    className="up-wm__slider"
    type="range"
    min={min}
    max={max}
    value={value}
    aria-label={ariaLabel}
    style={{ '--up-percent': `${((value - min) / (max - min)) * 100}%` } as React.CSSProperties}
    onChange={(e) => onChange(Number(e.target.value))}
  />
);

const SelectCheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const UploadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const GridIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

const WatermarkTemplateSelect = ({ value, templates, onChange }: {
  value: string;
  templates: WatermarkTemplate[];
  onChange: (id: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDocDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDocDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const current = templates.find((t) => t.id === value);

  return (
    <div className="up-wm__select" ref={rootRef}>
      <button
        type="button"
        className={`up-wm__select-trigger${open ? ' is-open' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={current ? '' : 'is-placeholder'}>{current ? current.name : '请选择'}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c0c4cc" strokeWidth="2" strokeLinecap="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open ? (
        <div className="up-wm__select-menu" role="listbox">
          {templates.length === 0 ? (
            <div className="up-wm__select-empty">暂无模板</div>
          ) : templates.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              role="option"
              aria-selected={tpl.id === value}
              className={`up-wm__select-option${tpl.id === value ? ' is-selected' : ''}`}
              onClick={() => { onChange(tpl.id); setOpen(false); }}
            >
              <span>{tpl.name}</span>
              {tpl.id === value ? <SelectCheckIcon /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

const WatermarkPanel = ({ wm, templates, onChange, onManageTemplates, onOpenIcons, onChooseImage, onPreview }: {
  wm: WatermarkState;
  templates: WatermarkTemplate[];
  onChange: (patch: Partial<WatermarkState>) => void;
  onManageTemplates: () => void;
  onOpenIcons: () => void;
  onChooseImage: () => void;
  onPreview: (src: string) => void;
}) => (
  <div className="up-wm" data-annotation-id="watermark-config">
    <div className="up-wm__row">
      <span className="up-wm__label">水印模板</span>
      <WatermarkTemplateSelect value={wm.templateId} templates={templates} onChange={(templateId) => onChange({ templateId })} />
      <button type="button" className="up-wm__link" onClick={onManageTemplates}>创建模板</button>
      <button type="button" className="up-wm__link" onClick={onManageTemplates}>管理模板</button>
    </div>
    <div className="up-wm__row">
      <span className="up-wm__label">水印类型</span>
      <div className="up-radio-group">
        <Radio checked={wm.type === 'text'} label="文字水印" onChange={() => onChange({ type: 'text' })} />
        <Radio checked={wm.type === 'shopName'} label="店铺名称水印" onChange={() => onChange({ type: 'shopName' })} />
        {/* 图片水印、图标暂隐藏，后续可能恢复 */}
      </div>
    </div>

    {wm.type !== 'image' ? (
      <>
        <div className="up-wm__row">
          <span className="up-wm__label">水印文字</span>
          <input
            type="text"
            className="up-input up-wm__text"
            placeholder="请输入水印文字"
            value={wm.type === 'shopName' ? '店铺名称' : wm.text}
            disabled={wm.type === 'shopName'}
            onChange={(e) => onChange({ text: e.target.value })}
          />
        </div>
        <div className="up-wm__row">
          <span className="up-wm__label">字号</span>
          <WatermarkSlider value={wm.fontSize} min={12} max={72} ariaLabel="水印字号" onChange={(fontSize) => onChange({ fontSize })} />
          <span className="up-wm__value">{wm.fontSize}</span>
        </div>
      </>
    ) : (
      <>
        <div className="up-wm__row">
          <span className="up-wm__label">图片上传</span>
          <button type="button" className="up-wm__upload" onClick={onChooseImage}>
            <UploadIcon />
            点击上传图片
          </button>
          <button type="button" className="up-wm__upload up-wm__upload--plain" onClick={onOpenIcons}>
            <GridIcon />
            内置图标
          </button>
        </div>
        <div className="up-wm__row">
          <span className="up-wm__label">大小</span>
          <WatermarkSlider value={wm.size} min={10} max={200} ariaLabel="水印大小" onChange={(size) => onChange({ size })} />
          <span className="up-wm__value">{wm.size}%</span>
        </div>
      </>
    )}

    <div className="up-wm__row">
      <span className="up-wm__label">透明度</span>
      <WatermarkSlider value={wm.opacity} min={0} max={100} ariaLabel="水印透明度" onChange={(opacity) => onChange({ opacity })} />
      <span className="up-wm__value">{wm.opacity}%</span>
    </div>

    <div className="up-wm__row">
      <span className="up-wm__label">水印位置</span>
      <span className="up-wm__static">随机</span>
    </div>

    <div className="up-wm__row">
      <span className="up-wm__label">水印角度</span>
      <span className="up-wm__static">随机</span>
    </div>

    <div className="up-wm__row up-wm__row--preview">
      <span className="up-wm__label">预览</span>
      <WatermarkThumb
        wm={wm}
        text={wm.type === 'shopName' ? '店铺名称' : wm.text.trim() || '预览文字'}
        onOpen={onPreview}
      />
      {wm.type === 'image' && !wm.imageUrl ? <span className="up-wm__preview-empty">未上传图片</span> : null}
    </div>

    <p className="up-hint up-wm__note">每次刊登时，水印位置和角度会随机调整</p>
  </div>
);

const Switch = ({ checked, disabled = false, onChange, ariaLabel }: {
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
  ariaLabel: string;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={ariaLabel}
    disabled={disabled}
    className={`up-switch${checked ? ' is-checked' : ''}${disabled ? ' is-disabled' : ''}`}
    onClick={() => { if (!disabled) onChange(); }}
  >
    <span className="up-switch__dot" />
  </button>
);

const Radio = ({ checked, label, disabled = false, onChange }: {
  checked: boolean;
  label: string;
  disabled?: boolean;
  onChange: () => void;
}) => (
  <label className={`up-radio${disabled ? ' is-disabled' : ''}`}>
    <input
      type="radio"
      className="up-radio__input"
      checked={checked}
      disabled={disabled}
      onChange={() => { if (!disabled) onChange(); }}
    />
    <span className={`up-radio__icon${checked ? ' is-checked' : ''}`} />
    <span className={`up-radio__label${checked ? ' is-active' : ''}`}>{label}</span>
  </label>
);

const CalendarIcon = () => (
  <svg className="up-picker__icon" width="14" height="14" viewBox="0 0 14 14" fill="none">
    <rect x="1.5" y="2.5" width="11" height="10" rx="1" stroke="currentColor" strokeWidth="1.2" />
    <path d="M1.5 5.5H12.5" stroke="currentColor" strokeWidth="1.2" />
    <path d="M4.5 1V3.5M9.5 1V3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const ClockIcon = () => (
  <svg className="up-picker__icon" width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
    <path d="M7 4V7L9 8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const PictureIcon = () => (
  <svg width="62" height="62" viewBox="0 0 24 24" fill="none" stroke="#c0c4cc" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const DateTimePicker = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const today = new Date();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const [picked, setPicked] = useState<{ y: number; m: number; d: number } | null>(
    value ? (() => { const [ymd] = value.split(' '); const [y, m, d] = ymd.split('-').map(Number); return { y, m: m - 1, d }; })() : null,
  );
  const [time, setTime] = useState(value.includes(' ') ? value.split(' ')[1] : '10:00:00');

  const firstDay = new Date(view.y, view.m, 1).getDay();
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells: Array<number | null> = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const shiftMonth = (delta: number) => {
    const next = new Date(view.y, view.m + delta, 1);
    setView({ y: next.getFullYear(), m: next.getMonth() });
  };

  const isToday = (d: number) =>
    d === today.getDate() && view.m === today.getMonth() && view.y === today.getFullYear();

  const commit = () => {
    if (picked) {
      onChange(`${picked.y}-${pad2(picked.m + 1)}-${pad2(picked.d)} ${time || '10:00:00'}`);
    }
    setOpen(false);
  };

  return (
    <div className="up-picker">
      <div
        className={`up-picker__input${open ? ' is-focused' : ''}`}
        onClick={() => setOpen((v) => !v)}
      >
        <CalendarIcon />
        <span className={`up-picker__text${value ? ' is-filled' : ''}`}>{value || '选择定时发布时间'}</span>
      </div>
      {open ? (
        <div className="up-picker__panel">
          <div className="up-dt__panel">
            <div className="up-dt__header">
              <button type="button" className="up-dt__nav" onClick={() => shiftMonth(-1)}>〈</button>
              <span className="up-dt__title">{view.y} 年 {pad2(view.m + 1)} 月</span>
              <button type="button" className="up-dt__nav" onClick={() => shiftMonth(1)}>〉</button>
            </div>
            <div className="up-dt__week">
              {['日', '一', '二', '三', '四', '五', '六'].map((w) => <span key={w}>{w}</span>)}
            </div>
            <div className="up-dt__grid">
              {cells.map((d, i) => d === null ? (
                <span key={`b-${i}`} className="up-dt__day is-blank" />
              ) : (
                <button
                  type="button"
                  key={d}
                  className={`up-dt__day${picked && picked.d === d && picked.m === view.m && picked.y === view.y ? ' is-selected' : ''}${isToday(d) ? ' is-today' : ''}`}
                  onClick={() => setPicked({ y: view.y, m: view.m, d })}
                >
                  {d}
                </button>
              ))}
            </div>
            <div className="up-dt__time-panel">
              <TimeColumns value={time} onChange={setTime} />
            </div>
            <div className="up-dt__footer">
              <button type="button" className="up-dt__link" onClick={() => { setPicked(null); onChange(''); setOpen(false); }}>清除</button>
              <button type="button" className="up-dt__confirm" disabled={!picked} onClick={commit}>确定</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

/**
 * 时间选择器（ElementUI el-time-picker 样式）：时/分/秒 三列，可选取任意时间点
 */
const HOURS = Array.from({ length: 24 }, (_, i) => pad2(i));
const MINUTES = Array.from({ length: 60 }, (_, i) => pad2(i));
const SECONDS = Array.from({ length: 60 }, (_, i) => pad2(i));

const TimeColumns = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const parts = (value || '00:00:00').split(':');
  const h = parts[0] ?? '00';
  const m = parts[1] ?? '00';
  const s = parts[2] ?? '00';
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    panelRef.current?.querySelector<HTMLElement>('.is-active')?.scrollIntoView({ block: 'nearest' });
  }, []);

  const pick = (part: 'h' | 'm' | 's', v: string) => {
    const next = part === 'h' ? [v, m, s] : part === 'm' ? [h, v, s] : [h, m, v];
    onChange(next.join(':'));
  };

  const columns: { key: 'h' | 'm' | 's'; items: string[]; active: string }[] = [
    { key: 'h', items: HOURS, active: h },
    { key: 'm', items: MINUTES, active: m },
    { key: 's', items: SECONDS, active: s },
  ];

  return (
    <div className="up-time-panel" ref={panelRef}>
      {columns.map((col) => (
        <div className="up-time-panel__col" key={col.key}>
          {col.items.map((item) => (
            <button
              type="button"
              key={item}
              className={`up-time-cell${item === col.active ? ' is-active' : ''}`}
              onClick={() => pick(col.key, item)}
            >
              {item}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

const TimePicker = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="up-picker up-picker--time">
      <div
        className={`up-picker__input${open ? ' is-focused' : ''}`}
        onClick={() => setOpen((v) => !v)}
      >
        <ClockIcon />
        <span className={`up-picker__text${value ? ' is-filled' : ''}`}>{value || '选择次日继续刊登时间'}</span>
      </div>
      {open ? (
        <div className="up-picker__panel">
          <TimeColumns value={value} onChange={onChange} />
        </div>
      ) : null}
    </div>
  );
};

const SegmentCard = ({ title, seg, on, onToggle, onSegChange }: {
  title: string;
  seg: SegmentState;
  on: boolean;
  onToggle: () => void;
  onSegChange: (next: SegmentState) => void;
}) => (
  <div className={`up-seg-card${on ? '' : ' is-off'}`}>
    <div className="up-seg-card__head">
      <span className="up-seg-card__title">{title}</span>
      <Switch checked={on} onChange={onToggle} ariaLabel={`${title}开关`} />
    </div>
    <div className="up-seg-card__body">
      <label className="up-seg-card__field">
        <span className="up-seg-card__field-label">增量前缀</span>
        <input
          type="text"
          className="up-input"
          value={seg.pre}
          disabled={!on}
          onChange={(e) => onSegChange({ ...seg, pre: e.target.value })}
        />
      </label>
      <label className="up-seg-card__field">
        <span className="up-seg-card__field-label">
          <span className="up-required">*</span>增量起始值
        </span>
        <NumberField
          value={seg.start}
          disabled={!on}
          invalid={on && !seg.start}
          ariaLabel={`${title}增量起始值`}
          onChange={(start) => onSegChange({ ...seg, start })}
        />
        {on && !seg.start ? <span className="up-seg-card__field-error">增量起始值不能为空</span> : null}
      </label>
      <label className="up-seg-card__field">
        <span className="up-seg-card__field-label">增量后缀</span>
        <input
          type="text"
          className="up-input"
          value={seg.suf}
          disabled={!on}
          onChange={(e) => onSegChange({ ...seg, suf: e.target.value })}
        />
      </label>
    </div>
  </div>
);

const AI_KEYWORDS_MAX = 70;

const AiKeywordField = ({ value, onChange, annotationId }: {
  value: string;
  onChange: (next: string) => void;
  annotationId: string;
}) => (
  <div className="up-ai" data-annotation-id={annotationId}>
    <div className="up-ai__field">
      <span className="up-ai__label">指定包含关键词</span>
      <div className="up-ai__control">
        <input
          type="text"
          className="up-input up-ai__input"
          value={value}
          maxLength={AI_KEYWORDS_MAX}
          placeholder="多个关键词用逗号分隔"
          onChange={(e) => onChange(e.target.value)}
        />
        <span className={`up-ai__count${value.length >= AI_KEYWORDS_MAX ? ' is-limit' : ''}`}>
          {value.length}/{AI_KEYWORDS_MAX}
        </span>
      </div>
    </div>
    <p className="up-ai__hint">让AI生成标题时包含指定的关键词</p>
  </div>
);

const SampleSegment = ({ seg, on }: { seg: SegmentState; on: boolean }) => {
  if (!on) return null;
  return (
    <span className="up-sample__seg">
      {seg.pre ? <span className="up-sample__on">{seg.pre}</span> : null}
      {seg.start ? <span className="up-sample__on">{seg.start}</span> : null}
      {seg.suf ? <span className="up-sample__on">{seg.suf}</span> : null}
    </span>
  );
};

type IncrementValue = { prefixOn: boolean; suffixOn: boolean; prefix: SegmentState; suffix: SegmentState };

const positiveIntText = (raw: string) => raw.replace(/[^\d]/g, '').replace(/^0+/, '');

const NumberField = ({ value, onChange, disabled = false, invalid = false, ariaLabel }: {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  ariaLabel: string;
}) => {
  const current = value === '' ? 0 : Number(value);
  const step = (delta: number) => onChange(String(Math.max(1, (current || 0) + delta)));

  return (
    <div className={`up-num${invalid ? ' is-error' : ''}${disabled ? ' is-disabled' : ''}`}>
      <button type="button" className="up-num__btn" aria-label={`${ariaLabel}减 1`} disabled={disabled} onClick={() => step(-1)}>−</button>
      <input
        type="text"
        inputMode="numeric"
        className="up-num__input"
        aria-label={ariaLabel}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(positiveIntText(e.target.value))}
      />
      <button type="button" className="up-num__btn" aria-label={`${ariaLabel}加 1`} disabled={disabled} onClick={() => step(1)}>+</button>
    </div>
  );
};

const emptySegment = (): SegmentState => ({ pre: '', start: '1', suf: '' });
const defaultIncrement = (): IncrementValue => ({ prefixOn: false, suffixOn: true, prefix: emptySegment(), suffix: emptySegment() });

const incrementHasEmptyStart = (v: IncrementValue) => (v.prefixOn && !v.prefix.start) || (v.suffixOn && !v.suffix.start);

const IncrementGroup = ({ value, onChange, annotationId }: { value: IncrementValue; onChange: (next: IncrementValue) => void; annotationId: string }) => {
  const [guardTip, setGuardTip] = useState('');

  const toggle = (key: 'prefixOn' | 'suffixOn') => {
    const other = key === 'prefixOn' ? 'suffixOn' : 'prefixOn';
    if (value[key] && !value[other]) {
      setGuardTip('至少启用一项');
      return;
    }
    setGuardTip('');
    onChange({ ...value, [key]: !value[key] });
  };

  return (
    <div className="up-increment" data-annotation-id={annotationId}>
      <div className="up-seg-cards">
        <SegmentCard
          title="前缀"
          seg={value.prefix}
          on={value.prefixOn}
          onToggle={() => toggle('prefixOn')}
          onSegChange={(prefix) => { setGuardTip(''); onChange({ ...value, prefix }); }}
        />
        <SegmentCard
          title="后缀"
          seg={value.suffix}
          on={value.suffixOn}
          onToggle={() => toggle('suffixOn')}
          onSegChange={(suffix) => { setGuardTip(''); onChange({ ...value, suffix }); }}
        />
      </div>
      {guardTip ? <p className="up-increment__tip">至少启用一项</p> : null}
      <div className="up-sample">
        <span className="up-sample__label">示例标题：</span>
        <span className="up-sample__text">
          <SampleSegment seg={value.prefix} on={value.prefixOn} />
          <span className="up-sample__base">XXXXXXXXXXXX</span>
          <SampleSegment seg={value.suffix} on={value.suffixOn} />
        </span>
      </div>
    </div>
  );
};

const UpdatePublishDialog = () => {
  const [visible, setVisible] = useState(true);

  const [publishMode, setPublishMode] = useState<'now' | 'scheduled'>('now');
  const [scheduledTime, setScheduledTime] = useState('');

  const [loopOn, setLoopOn] = useState(false);
  const [loopLimit, setLoopLimit] = useState('1');

  const [titleOn, setTitleOn] = useState(false);
  const [titleMode, setTitleMode] = useState<'shuffle' | 'increment' | 'ai' | 'backup'>('shuffle');
  const [titleAiKeywords, setTitleAiKeywords] = useState('');
  const [titleIncrement, setTitleIncrement] = useState<IncrementValue>(defaultIncrement);
  const [backupTitles, setBackupTitles] = useState<string[]>(['']);
  const [backupTitleStrategy, setBackupTitleStrategy] = useState<'shuffle' | 'increment' | 'ai'>('shuffle');
  const [backupAiKeywords, setBackupAiKeywords] = useState('');
  const [backupIncrement, setBackupIncrement] = useState<IncrementValue>(defaultIncrement);

  const [imageOn, setImageOn] = useState(false);
  const [imageMode, setImageMode] = useState<'shuffle' | 'sku' | 'backup' | 'watermark'>('shuffle');
  const [backupImageStrategy, setBackupImageStrategy] = useState<'shuffle'>('shuffle');
  const [backupImages, setBackupImages] = useState<UploadedImage[]>([
    { id: 'sample-1', url: mainSample1, name: '示例图片', width: 1024, height: 1024 },
  ]);
  const uploadFileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const [wm, setWm] = useState<WatermarkState>({
    templateId: '',
    type: 'text',
    text: '',
    fontSize: 24,
    opacity: 80,
    imageUrl: '',
    size: 100,
    iconBg: 'white',
  });
  const [wmTemplates, setWmTemplates] = useState<WatermarkTemplate[]>(WATERMARK_TEMPLATES);
  const wmImageInputRef = useRef<HTMLInputElement | null>(null);
  const [wmPreviewSrc, setWmPreviewSrc] = useState<string | null>(null);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [iconCategory, setIconCategory] = useState(BUILTIN_ICONS[0]?.key ?? '');
  const [iconDraft, setIconDraft] = useState('');
  const [iconBgDraft, setIconBgDraft] = useState<IconBackground>('white');
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [templateDraft, setTemplateDraft] = useState('');
  const [templateSelection, setTemplateSelection] = useState('');
  const [templateError, setTemplateError] = useState('');
  const builtinCategory = BUILTIN_ICONS.find((cat) => cat.key === iconCategory) ?? BUILTIN_ICONS[0];

  const [dailyLimitMode, setDailyLimitMode] = useState<'stop' | 'nextDay'>('stop');
  const [nextDayTime, setNextDayTime] = useState('');

  const [strategyError, setStrategyError] = useState('');

  const addBackupTitle = () => setBackupTitles((list) => [...list, '']);
  const removeBackupTitle = (index: number) => setBackupTitles((list) => list.filter((_, i) => i !== index));
  const setBackupTitle = (index: number, value: string) =>
    setBackupTitles((list) => list.map((t, i) => (i === index ? value : t)));

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const url = URL.createObjectURL(file);
      const probe = new Image();
      probe.onload = () => {
        setBackupImages((list) => [...list, {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          url,
          name: file.name,
          width: probe.naturalWidth,
          height: probe.naturalHeight,
        }]);
      };
      probe.src = url;
    });
  };

  const patchWatermark = (patch: Partial<WatermarkState>) => {
    setWm((prev) => ({ ...prev, ...patch }));
    setStrategyError('');
  };

  const handleWatermarkImage = (files: FileList | null) => {
    const file = files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    patchWatermark({ imageUrl: URL.createObjectURL(file) });
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
    patchWatermark({ imageUrl: iconDraft, iconBg: iconBgDraft });
    setIconPickerOpen(false);
  };

  const openTemplateDialog = () => {
    setTemplateDraft('');
    setTemplateSelection(wm.templateId);
    setTemplateError('');
    setTemplatesOpen(true);
  };

  const addTemplate = () => {
    const name = templateDraft.trim();
    if (!name) {
      setTemplateError('请输入模板名称');
      return;
    }
    const tpl = { id: `tpl-${Date.now()}`, name };
    setWmTemplates((list) => [...list, tpl]);
    setTemplateSelection(tpl.id);
    setTemplateDraft('');
    setTemplateError('');
  };

  const removeTemplate = (id: string) => {
    setWmTemplates((list) => list.filter((tpl) => tpl.id !== id));
    setTemplateSelection((prev) => (prev === id ? '' : prev));
    setWm((prev) => (prev.templateId === id ? { ...prev, templateId: '' } : prev));
  };

  const confirmTemplates = () => {
    patchWatermark({ templateId: templateSelection });
    setTemplatesOpen(false);
  };

  const handleConfirm = () => {
    if (loopOn && !titleOn && !imageOn) {
      setStrategyError('请至少启用一项自动刊登策略（标题策略 / 主图策略）');
      return;
    }
    const needIncrementCheck = loopOn && titleOn
      && (titleMode === 'increment' || (titleMode === 'backup' && backupTitleStrategy === 'increment'));
    if (needIncrementCheck
      && ((titleMode === 'increment' && incrementHasEmptyStart(titleIncrement))
        || (titleMode === 'backup' && backupTitleStrategy === 'increment' && incrementHasEmptyStart(backupIncrement)))) {
      setStrategyError('增量起始值不能为空');
      return;
    }
    if (imageOn && imageMode === 'watermark') {
      if (wm.type === 'text' && !wm.text.trim()) {
        setStrategyError('请输入水印文字');
        return;
      }
      if (wm.type === 'image' && !wm.imageUrl) {
        setStrategyError('请先上传水印图片');
        return;
      }
    }
    setVisible(false);
  };

  return (
    <>
      {visible ? (
        <div className="up-overlay">
          <div className="up-dialog" role="dialog" aria-modal="true" aria-label="更新发布">
            <div className="up-dialog__header">
              <span className="up-dialog__title">更新发布</span>
              <button type="button" className="up-dialog__close" aria-label="关闭" onClick={() => setVisible(false)}>×</button>
            </div>

            <div className="up-dialog__body">
              <div className="up-form-row" data-annotation-id="publish-time-row">
                <span className="up-form-label">发布时间</span>
                <div className="up-form-value">
                  <div className="up-radio-group">
                    <Radio checked={publishMode === 'now'} label="立即发布" onChange={() => setPublishMode('now')} />
                    <Radio checked={publishMode === 'scheduled'} label="定时发布" onChange={() => setPublishMode('scheduled')} />
                  </div>
                  {publishMode === 'scheduled' ? (
                    <div className="up-picker-row">
                      <DateTimePicker value={scheduledTime} onChange={setScheduledTime} />
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="up-form-row" data-annotation-id="loop-row">
                <span className="up-form-label">循环刊登</span>
                <div className="up-form-value up-switch-line">
                  <Switch
                    checked={loopOn}
                    onChange={() => setLoopOn((v) => { const nv = !v; if (!nv) setStrategyError(''); return nv; })}
                    ariaLabel="循环刊登开关"
                  />
                  {loopOn ? (
                    <span className="up-inline-field">
                      <span className="up-inline-field__label">循环次数限制</span>
                      <NumberField value={loopLimit} onChange={setLoopLimit} ariaLabel="循环次数限制" />
                    </span>
                  ) : null}
                </div>
              </div>

              {loopOn ? (
                <>
              <div className="up-section" data-annotation-id="strategy-section">
                <h3 className="up-section__title">
                  <span className="up-required">*</span>自动刊登策略
                </h3>
                {strategyError ? <p className="up-section__error">{strategyError}</p> : null}

                <div className="up-strategy-block" data-annotation-id="title-strategy-block">
                  <div className="up-strategy-block__head">
                    <span className="up-strategy-block__title">标题策略</span>
                    <Switch checked={titleOn} onChange={() => { setTitleOn((v) => { const nv = !v; if (nv) setStrategyError(''); return nv; }); }} ariaLabel="标题策略开关" />
                  </div>
                  {titleOn ? (
                    <>
                      <div className="up-option-list">
                        <Radio checked={titleMode === 'shuffle'} label="随机打乱" onChange={() => setTitleMode('shuffle')} />
                        <Radio checked={titleMode === 'increment'} label="插入增量前、后缀" onChange={() => setTitleMode('increment')} />
                        <Radio checked={titleMode === 'ai'} label="AI 重新生成" onChange={() => setTitleMode('ai')} />
                        <Radio checked={titleMode === 'backup'} label="备选标题" onChange={() => setTitleMode('backup')} />
                      </div>
                      {titleMode === 'increment' ? (
                        <IncrementGroup value={titleIncrement} onChange={setTitleIncrement} annotationId="title-increment" />
                      ) : null}
                      {titleMode === 'ai' ? (
                        <AiKeywordField value={titleAiKeywords} onChange={setTitleAiKeywords} annotationId="title-ai-keywords" />
                      ) : null}
                      {titleMode === 'backup' ? (
                        <div className="up-backup" data-annotation-id="backup-titles">
                          <div className="up-backup__list">
                            {backupTitles.map((title, i) => (
                              <div className="up-backup__row" key={i}>
                                <input
                                  type="text"
                                  className="up-input up-backup__input"
                                  value={title}
                                  placeholder={`备选标题 ${i + 1}`}
                                  onChange={(e) => setBackupTitle(i, e.target.value)}
                                />
                                {backupTitles.length > 1 ? (
                                  <button type="button" className="up-backup__remove" aria-label="删除该备选标题" onClick={() => removeBackupTitle(i)}>×</button>
                                ) : null}
                              </div>
                            ))}
                          </div>
                          <button type="button" className="up-backup__add" onClick={addBackupTitle}>+ 添加备选标题</button>
                          <p className="up-hint">循环刊登时，如果某个标题未通过审核，将自动更换另一个备选标题重试。</p>

                          <div className="up-sub-strategy">
                            <div className="up-sub-strategy__head">
                              <span className="up-sub-strategy__title">备选标题策略</span>
                              <span className="up-sub-strategy__desc">当备选标题已用完但循环刊登未结束时启用</span>
                            </div>
                            <div className="up-option-list up-option-list--inline">
                              <Radio checked={backupTitleStrategy === 'shuffle'} label="随机打乱" onChange={() => setBackupTitleStrategy('shuffle')} />
                              <Radio checked={backupTitleStrategy === 'increment'} label="插入增量前、后缀" onChange={() => setBackupTitleStrategy('increment')} />
                              <Radio checked={backupTitleStrategy === 'ai'} label="AI 重新生成" onChange={() => setBackupTitleStrategy('ai')} />
                            </div>
                            {backupTitleStrategy === 'increment' ? (
                              <IncrementGroup value={backupIncrement} onChange={setBackupIncrement} annotationId="backup-title-increment" />
                            ) : null}
                            {backupTitleStrategy === 'ai' ? (
                              <AiKeywordField value={backupAiKeywords} onChange={setBackupAiKeywords} annotationId="backup-title-ai-keywords" />
                            ) : null}
                          </div>
                        </div>
                      ) : null}
                    </>
                  ) : null}
                </div>

                <div className="up-strategy-block" data-annotation-id="image-strategy-block">
                  <div className="up-strategy-block__head">
                    <span className="up-strategy-block__title">主图策略</span>
                    <Switch checked={imageOn} onChange={() => { setImageOn((v) => { const nv = !v; if (nv) setStrategyError(''); return nv; }); }} ariaLabel="主图策略开关" />
                  </div>
                  {imageOn ? (
                    <>
                      <div className="up-option-list">
                        <Radio checked={imageMode === 'shuffle'} label="随机打乱" onChange={() => setImageMode('shuffle')} />
                        <Radio checked={imageMode === 'sku'} label="取SKU图替换首图" onChange={() => setImageMode('sku')} />
                        <Radio checked={imageMode === 'backup'} label="备选首图" onChange={() => setImageMode('backup')} />
                        <Radio checked={imageMode === 'watermark'} label="固定首图+随机文字水印" onChange={() => setImageMode('watermark')} />
                      </div>

                      {imageMode === 'watermark' ? (
                        <div className="up-wm-option" data-annotation-id="image-watermark">
                          <WatermarkPanel
                            wm={wm}
                            templates={wmTemplates}
                            onChange={patchWatermark}
                            onManageTemplates={openTemplateDialog}
                            onOpenIcons={openIconPicker}
                            onChooseImage={() => wmImageInputRef.current?.click()}
                            onPreview={setWmPreviewSrc}
                          />
                          <input
                            ref={wmImageInputRef}
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={(e) => { handleWatermarkImage(e.target.files); e.target.value = ''; }}
                          />
                        </div>
                      ) : null}

                      {imageMode !== 'shuffle' && imageMode !== 'watermark' ? (
                        <>
                        {imageMode === 'backup' ? (
                        <div className="up-upload-wrap" data-annotation-id="backup-images">
                          <div className="up-upload">
                            <button type="button" className="up-upload__add" onClick={() => setUploadDialogOpen(true)}>
                              <span className="up-upload__add-plus">+</span>
                              <span className="up-upload__add-text">
                                <span className="up-upload__add-line">点击</span>
                                <span className="up-upload__add-line">Ctrl+V粘贴</span>
                              </span>
                            </button>
                            {backupImages.map((img) => (
                              <div className="up-upload__item" key={img.id}>
                                <img src={img.url} alt={img.name} />
                                <span className="up-upload__res">{img.width}*{img.height}</span>
                                <button
                                  type="button"
                                  className="up-upload__remove"
                                  aria-label="删除该备选首图"
                                  onClick={() => setBackupImages((list) => list.filter((it) => it.id !== img.id))}
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                          <input
                            ref={uploadFileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            hidden
                            onChange={(e) => { handleFiles(e.target.files); setUploadDialogOpen(false); e.target.value = ''; }}
                          />
                        </div>
                        ) : null}
                        <p className="up-hint">{imageMode === 'sku'
                          ? '循环刊登时，如果某张首图未通过审核，将自动更换下一张SKU图作为首图尝试。'
                          : '循环刊登时，如果某张首图未通过审核，将自动更换另一张备选首图重试。'}</p>

                        <div className="up-sub-strategy">
                          <div className="up-sub-strategy__head">
                            <span className="up-sub-strategy__title">备选首图策略</span>
                            <span className="up-sub-strategy__desc">{imageMode === 'sku'
                              ? '当SKU图已用完但循环刊登未结束时启用'
                              : '当备选首图已用完但循环刊登未结束时启用'}</span>
                          </div>
                          <div className="up-option-list up-option-list--inline">
                            <Radio checked={backupImageStrategy === 'shuffle'} label="随机打乱" onChange={() => setBackupImageStrategy('shuffle')} />
                          </div>
                        </div>
                        </>
                      ) : null}
                    </>
                  ) : null}
                </div>
              </div>

              <div className="up-form-row up-form-row--limit" data-annotation-id="daily-limit-row">
                <span className="up-form-label up-form-label--limit">刊登数量达到当日上限时：</span>
                <div className="up-form-value">
                  <div className="up-radio-group">
                    <Radio checked={dailyLimitMode === 'stop'} label="直接终止刊登" onChange={() => setDailyLimitMode('stop')} />
                    <Radio checked={dailyLimitMode === 'nextDay'} label="次日继续刊登" onChange={() => setDailyLimitMode('nextDay')} />
                  </div>
                  {dailyLimitMode === 'nextDay' ? (
                    <div className="up-picker-row">
                      <TimePicker value={nextDayTime} onChange={setNextDayTime} />
                    </div>
                  ) : null}
                </div>
              </div>
              </>
              ) : null}
            </div>

            <div className="up-dialog__footer" data-annotation-id="dialog-footer">
              <button type="button" className="up-btn up-btn--plain" onClick={() => setVisible(false)}>取消</button>
              <button type="button" className="up-btn up-btn--primary" onClick={handleConfirm}>确定</button>
            </div>
          </div>

          {uploadDialogOpen ? (
            <div className="up-upl-overlay">
              <div className="up-upl-modal" role="dialog" aria-modal="true" aria-label="上传图片">
                <div className="up-upl-header">
                  <span className="up-upl-title">上传图片</span>
                  <button type="button" className="up-upl-close" aria-label="关闭" onClick={() => setUploadDialogOpen(false)}>×</button>
                </div>
                <div className="up-upl-body">
                  <div className="up-upl-tabs">
                    <span className="up-upl-tab is-active">本地</span>
                    <span className="up-upl-tab">URL</span>
                    <div className="up-upl-tab" data-annotation-id="upload-ref-tab">引用</div>
                  </div>
                  <div className="up-upl-content">
                    <div className="up-radio-group up-upl-radios">
                      <Radio checked label="单个上传" disabled onChange={() => undefined} />
                      <Radio checked={false} label="批量上传" disabled onChange={() => undefined} />
                    </div>
                    <div className="up-upl-drop" onClick={() => uploadFileInputRef.current?.click()}>
                      <PictureIcon />
                      <div className="up-upl-drop-text">
                        将文件拖到此处，或<span className="up-upl-drop-link">点击上传</span>
                      </div>
                      <div className="up-upl-drop-tip">按 Ctrl+V 可从剪贴板上传</div>
                    </div>
                  </div>
                </div>
                <div className="up-upl-footer">
                  <button type="button" className="up-btn up-btn--plain" onClick={() => setUploadDialogOpen(false)}>取消</button>
                  <button type="button" className="up-btn up-btn--primary" onClick={() => setUploadDialogOpen(false)}>确认</button>
                </div>
              </div>
            </div>
          ) : null}

          {templatesOpen ? (
            <div className="up-wm-layer">
              <div className="up-wm-modal" role="dialog" aria-modal="true" aria-label="水印模板">
                <div className="up-wm-modal__header">
                  <span className="up-wm-modal__title">水印模板</span>
                  <button type="button" className="up-wm-modal__close" aria-label="关闭" onClick={() => setTemplatesOpen(false)}>×</button>
                </div>
                <div className="up-wm-modal__body">
                  <div className="up-wm-tpl__list">
                    {wmTemplates.length === 0 ? (
                      <p className="up-hint">暂无模板，可在下方输入名称新建</p>
                    ) : wmTemplates.map((tpl) => (
                      <div className={`up-wm-tpl__row${templateSelection === tpl.id ? ' is-selected' : ''}`} key={tpl.id}>
                        <Radio
                          checked={templateSelection === tpl.id}
                          label={tpl.name}
                          onChange={() => setTemplateSelection(tpl.id)}
                        />
                        <button
                          type="button"
                          className="up-backup__remove"
                          aria-label={`删除模板${tpl.name}`}
                          onClick={() => removeTemplate(tpl.id)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="up-wm-tpl__add">
                    <input
                      type="text"
                      className="up-input"
                      placeholder="请输入模板名称"
                      value={templateDraft}
                      onChange={(e) => { setTemplateDraft(e.target.value); setTemplateError(''); }}
                    />
                    <button type="button" className="up-backup__add" onClick={addTemplate}>+ 新建模板</button>
                  </div>
                  {templateError ? <p className="up-wm__error">{templateError}</p> : null}
                </div>
                <div className="up-wm-modal__footer">
                  <button type="button" className="up-btn up-btn--plain" onClick={() => setTemplatesOpen(false)}>取消</button>
                  <button type="button" className="up-btn up-btn--primary" onClick={confirmTemplates}>确定</button>
                </div>
              </div>
            </div>
          ) : null}

          {iconPickerOpen ? (
            <div className="up-wm-layer">
              <div className="up-wm-modal up-wm-modal--icons" role="dialog" aria-modal="true" aria-label="内置图标">
                <div className="up-wm-modal__header">
                  <span className="up-wm-modal__title">内置图标</span>
                  <button type="button" className="up-wm-modal__close" aria-label="关闭" onClick={() => setIconPickerOpen(false)}>×</button>
                </div>
                <div className="up-wm-icons">
                  <div className="up-wm-icons__cats">
                    {BUILTIN_ICONS.map((cat) => (
                      <button
                        key={cat.key}
                        type="button"
                        className={`up-wm-icons__cat${cat.key === builtinCategory?.key ? ' is-active' : ''}`}
                        title={`${cat.zh}（${cat.en}）`}
                        onClick={() => setIconCategory(cat.key)}
                      >
                        <span className="up-wm-icons__cat-zh">{cat.zh}</span>
                        <span className="up-wm-icons__cat-en">{cat.en}</span>
                      </button>
                    ))}
                  </div>
                  <div className="up-wm-icons__grid">
                    {builtinCategory?.items.map((icon) => (
                      <button
                        key={icon.id}
                        type="button"
                        className={`up-wm-icons__item${iconDraft === icon.src ? ' is-checked' : ''}`}
                        onClick={() => setIconDraft(icon.src)}
                      >
                        <img src={icon.src} alt="" />
                        {iconDraft === icon.src ? (
                          <span className="up-wm-icons__check">
                            <SelectCheckIcon />
                          </span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="up-wm-icons__footer">
                  <div className="up-wm-icons__bg">
                    <span className="up-wm-icons__bg-label">图标背景</span>
                    <div className="up-radio-group">
                      <Radio checked={iconBgDraft === 'white'} label="白色" onChange={() => setIconBgDraft('white')} />
                      <Radio checked={iconBgDraft === 'transparent'} label="透明" onChange={() => setIconBgDraft('transparent')} />
                    </div>
                  </div>
                  <div className="up-wm-icons__actions">
                    <button type="button" className="up-btn up-btn--plain" onClick={() => setIconPickerOpen(false)}>取消</button>
                    <button type="button" className="up-btn up-btn--primary" disabled={!iconDraft} onClick={confirmBuiltinIcon}>确定</button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {wmPreviewSrc ? (
            <div className="up-wm-preview" onClick={() => setWmPreviewSrc(null)}>
              <img src={wmPreviewSrc} alt="水印预览" />
            </div>
          ) : null}
        </div>
      ) : (
        <button type="button" className="up-reopen" onClick={() => setVisible(true)}>打开更新发布弹窗</button>
      )}

      <AnnotationViewer
        source={annotationSourceDocument as unknown as AnnotationSourceDocument}
        options={{
          currentPageId: 'update-publish-dialog',
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

export default UpdatePublishDialog;
