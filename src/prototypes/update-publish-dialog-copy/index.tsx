/**
 * @name 更新发布弹窗
 */

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnnotationViewer, type AnnotationSourceDocument } from '@axhub/annotation';
import annotationSourceDocument from './annotation-source.json';
import mainSample1 from './assets/main-image-sample-1.png';
import productBag from './assets/product-bag.png';
import productDress from './assets/product-dress.png';
import productSneaker from './assets/product-sneaker.png';
import productSuit from './assets/product-suit.png';
import './style.css';

const pad2 = (n: number) => String(n).padStart(2, '0');

type SegmentState = { pre: string; start: string; suf: string };
type UploadedImage = { id: string; url: string; name: string; width: number; height: number };

type ProductCurrentStatus =
  | '待发布'
  | '发布中'
  | '循环刊登'
  | '发布失败'
  | '已上架'
  | '已下架'
  | '待审核'
  | '审核未通过'
  | '内容违规'
  | '侵权违规'
  | '品牌商投诉';
type ProductLoopState = '循环中' | '循环结束' | '开启新循环';
type PublishResult = '待发布' | '发布中' | '待审核' | '审核不通过' | '循环刊登' | '发布失败';

type ProductKey =
  | 'dress'
  | 'kidsCanvas'
  | 'blackBackpack'
  | 'jacket'
  | 'shoulderBag'
  | 'kidsSneaker'
  | 'travelBackpack'
  | 'tote'
  | 'runningShoes'
  | 'briefcase'
  | 'chainBag'
  | 'schoolBag'
  | 'leatherHandbag'
  | 'canvasSneaker';

type PublishProduct = {
  id: string;
  title: string;
  image: string;
  loopState?: ProductLoopState;
  attempts?: number;
  publishResult?: PublishResult;
  current: ProductCurrentStatus;
};

type PublishRecord = {
  id: string;
  time: string;
  isLoop: boolean;
  loopLimit?: number;
  products: PublishProduct[];
};

const PRODUCT_CATALOG: Record<ProductKey, Pick<PublishProduct, 'id' | 'title' | 'image'>> = {
  dress: { id: '22098134561', title: '夏季碎花连衣裙', image: productDress },
  kidsCanvas: { id: '22098134562', title: '儿童帆布鞋', image: productSneaker },
  blackBackpack: { id: '22098134563', title: '双肩包（黑）', image: productBag },
  jacket: { id: '22098134564', title: '男士休闲夹克', image: productSuit },
  shoulderBag: { id: '22098134565', title: '女士单肩包', image: productBag },
  kidsSneaker: { id: '22098134566', title: '儿童运动鞋', image: productSneaker },
  travelBackpack: { id: '22098134567', title: '防水旅行背包', image: productBag },
  tote: { id: '22098134568', title: '简约托特包', image: productBag },
  runningShoes: { id: '22098134569', title: '轻便跑步鞋', image: productSneaker },
  briefcase: { id: '22098134570', title: '男士商务公文包', image: productBag },
  chainBag: { id: '22098134571', title: '女士链条小方包', image: productBag },
  schoolBag: { id: '22098134572', title: '学生双肩书包', image: productBag },
  leatherHandbag: { id: '22098134573', title: '真皮女士手提包', image: productBag },
  canvasSneaker: { id: '22098134574', title: '休闲帆布板鞋', image: productSneaker },
};

const product = (key: ProductKey, extra: Omit<PublishProduct, 'id' | 'title' | 'image'>): PublishProduct => ({
  ...PRODUCT_CATALOG[key],
  ...extra,
});

const PUBLISH_RECORDS: PublishRecord[] = [
  {
    id: 'r-1', time: '2026-11-02 10:30:24', isLoop: true, loopLimit: 5,
    products: [
      product('dress', { loopState: '循环中', attempts: 3, publishResult: '待审核', current: '待审核' }),
      product('kidsCanvas', { loopState: '开启新循环', attempts: 3, publishResult: '循环刊登', current: '已上架' }),
      product('blackBackpack', { loopState: '循环结束', attempts: 2, publishResult: '循环刊登', current: '已上架' }),
      product('jacket', { loopState: '循环结束', attempts: 5, publishResult: '审核不通过', current: '审核未通过' }),
      product('shoulderBag', { loopState: '循环结束', attempts: 5, publishResult: '待审核', current: '已上架' }),
      product('kidsSneaker', { loopState: '循环中', attempts: 1, publishResult: '待审核', current: '待审核' }),
    ],
  },
  {
    id: 'r-2', time: '2026-11-01 18:12:07', isLoop: false,
    products: [
      product('travelBackpack', { current: '已上架' }),
      product('tote', { publishResult: '待审核', current: '待审核' }),
      product('runningShoes', { publishResult: '发布失败', current: '发布失败' }),
    ],
  },
  {
    id: 'r-3', time: '2026-11-01 09:45:51', isLoop: true, loopLimit: 10,
    products: [
      product('briefcase', { loopState: '循环结束', attempts: 10, publishResult: '发布失败', current: '内容违规' }),
      product('chainBag', { loopState: '循环结束', attempts: 6, publishResult: '循环刊登', current: '已上架' }),
      product('schoolBag', { loopState: '循环中', attempts: 4, publishResult: '待审核', current: '循环刊登' }),
      product('canvasSneaker', { loopState: '循环结束', attempts: 10, publishResult: '发布失败', current: '侵权违规' }),
      product('leatherHandbag', { loopState: '循环结束', attempts: 7, publishResult: '循环刊登', current: '已上架' }),
    ],
  },
  {
    id: 'r-4', time: '2026-10-31 20:05:13', isLoop: false,
    products: [
      product('shoulderBag', { current: '已上架' }),
      product('kidsSneaker', { current: '已上架' }),
    ],
  },
  {
    id: 'r-5', time: '2026-10-30 14:20:38', isLoop: true, loopLimit: 5,
    products: [
      product('blackBackpack', { loopState: '开启新循环', attempts: 5, publishResult: '循环刊登', current: '已上架' }),
      product('jacket', { loopState: '循环结束', attempts: 5, publishResult: '审核不通过', current: '审核未通过' }),
      product('kidsCanvas', { loopState: '循环结束', attempts: 3, publishResult: '循环刊登', current: '已上架' }),
      product('chainBag', { loopState: '循环中', attempts: 2, publishResult: '待审核', current: '发布中' }),
    ],
  },
  {
    id: 'r-6', time: '2026-10-29 11:08:02', isLoop: false,
    products: [
      product('runningShoes', { current: '已上架' }),
      product('schoolBag', { publishResult: '待审核', current: '待审核' }),
      product('tote', { current: '已上架' }),
    ],
  },
  {
    id: 'r-7', time: '2026-10-28 16:40:19', isLoop: false,
    products: [
      product('leatherHandbag', { publishResult: '发布失败', current: '已下架' }),
    ],
  },
  {
    id: 'r-8', time: '2026-10-27 09:15:44', isLoop: true, loopLimit: 3,
    products: [
      product('travelBackpack', { loopState: '循环结束', attempts: 3, publishResult: '循环刊登', current: '已上架' }),
      product('canvasSneaker', { loopState: '循环结束', attempts: 3, publishResult: '发布失败', current: '品牌商投诉' }),
      product('briefcase', { loopState: '循环结束', attempts: 3, publishResult: '待审核', current: '已上架' }),
      product('shoulderBag', { loopState: '循环结束', attempts: 3, publishResult: '审核不通过', current: '审核未通过' }),
    ],
  },
];

const currentTagClass = (status: ProductCurrentStatus) => {
  if (status === '已上架') return 'is-online';
  if (status === '待审核') return 'is-pending';
  if (status === '审核未通过') return 'is-rejected';
  if (status === '内容违规') return 'is-content';
  if (status === '侵权违规') return 'is-infringe';
  if (status === '品牌商投诉') return 'is-complaint';
  if (status === '发布中') return 'is-processing';
  if (status === '循环刊登') return 'is-looping';
  if (status === '发布失败') return 'is-failed';
  return 'is-offline';
};

type RecordStatus = '发布中' | '发布完成';

const activeCurrentStatuses: ProductCurrentStatus[] = ['待发布', '发布中', '循环刊登', '待审核'];

const recordStatus = (record: PublishRecord): RecordStatus =>
  record.products.some((product) => product.loopState === '循环中' || activeCurrentStatuses.includes(product.current))
    ? '发布中'
    : '发布完成';

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

const FilterSelect = <T extends string,>({ value, options, onChange, ariaLabel }: {
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
  ariaLabel: string;
}) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (event: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="up-filter-select" ref={wrapRef}>
      <button
        type="button"
        className={`up-filter-select__trigger${open ? ' is-open' : ''}`}
        aria-label={ariaLabel}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{value}</span>
        <span className="up-filter-select__arrow" aria-hidden="true">▾</span>
      </button>
      {open ? (
        <div className="up-filter-select__menu" role="listbox" aria-label={ariaLabel}>
          {options.map((option) => (
            <button
              type="button"
              key={option}
              role="option"
              aria-selected={option === value}
              className={`up-filter-select__option${option === value ? ' is-active' : ''}`}
              onClick={() => { onChange(option); setOpen(false); }}
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

const HelpTooltip = ({ label, children }: { label: string; children: React.ReactNode }) => {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const show = (el: HTMLElement) => setRect(el.getBoundingClientRect());

  return (
    <span
      className="up-help"
      onMouseEnter={(event) => show(event.currentTarget)}
      onMouseLeave={() => setRect(null)}
    >
      <button
        type="button"
        className="up-help__icon"
        aria-label={label}
        onFocus={(event) => show(event.currentTarget)}
        onBlur={() => setRect(null)}
      >
        ?
      </button>
      {rect ? createPortal(
        <span
          className="up-help__tip"
          style={{
            left: Math.min(Math.max(rect.left + rect.width / 2, 140), window.innerWidth - 140),
            top: rect.top - 8,
          }}
        >
          {children}
          <span className="up-help__arrow" />
        </span>,
        document.body,
      ) : null}
    </span>
  );
};

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

const DateTimePicker = ({ value, onChange, dateOnly = false, placeholder = '选择定时发布时间' }: {
  value: string;
  onChange: (v: string) => void;
  dateOnly?: boolean;
  placeholder?: string;
}) => {
  const today = new Date();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const [picked, setPicked] = useState<{ y: number; m: number; d: number } | null>(
    value ? (() => { const [ymd] = value.split(' '); const [y, m, d] = ymd.split('-').map(Number); return { y, m: m - 1, d }; })() : null,
  );
  const [time, setTime] = useState(value.includes(' ') ? value.split(' ')[1] : '10:00:00');
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (event: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

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
      const date = `${picked.y}-${pad2(picked.m + 1)}-${pad2(picked.d)}`;
      onChange(dateOnly ? date : `${date} ${time || '10:00:00'}`);
    }
    setOpen(false);
  };

  return (
    <div className={`up-picker${dateOnly ? ' up-picker--date' : ''}`} ref={wrapRef}>
      <div
        className={`up-picker__input${open ? ' is-focused' : ''}`}
        onClick={() => setOpen((v) => !v)}
      >
        <CalendarIcon />
        <span className={`up-picker__text${value ? ' is-filled' : ''}`}>{value || placeholder}</span>
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
            {dateOnly ? null : (
              <div className="up-dt__time-panel">
                <TimeColumns value={time} onChange={setTime} />
              </div>
            )}
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
  const [activeTab, setActiveTab] = useState<'update' | 'records'>('update');
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);
  const activeRecord = PUBLISH_RECORDS.find((record) => record.id === activeRecordId) ?? null;
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loopFilter, setLoopFilter] = useState<'全部' | '是' | '否'>('全部');
  const [statusFilter, setStatusFilter] = useState<'全部' | RecordStatus>('全部');
  const [page, setPage] = useState(1);
  const [detailLoopFilter, setDetailLoopFilter] = useState<'全部' | ProductLoopState>('全部');
  const [detailResultFilter, setDetailResultFilter] = useState<'全部' | PublishResult>('全部');
  const [detailStatusFilter, setDetailStatusFilter] = useState<'全部' | ProductCurrentStatus>('全部');
  const [detailPage, setDetailPage] = useState(1);
  const [copyFeedback, setCopyFeedback] = useState<{ count: number; failed: boolean } | null>(null);

  const pageSize = 5;
  const filteredRecords = PUBLISH_RECORDS.filter((record) => {
    const date = record.time.slice(0, 10);
    if (startDate && date < startDate) return false;
    if (endDate && date > endDate) return false;
    if (loopFilter !== '全部' && record.isLoop !== (loopFilter === '是')) return false;
    if (statusFilter !== '全部' && recordStatus(record) !== statusFilter) return false;
    return true;
  });
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedRecords = filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => { setPage(1); }, [startDate, endDate, loopFilter, statusFilter]);

  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setLoopFilter('全部');
    setStatusFilter('全部');
    setPage(1);
  };

  const detailPageSize = 5;
  const detailProducts = activeRecord
    ? activeRecord.products.filter((product) => {
        if (activeRecord.isLoop && detailLoopFilter !== '全部' && product.loopState !== detailLoopFilter) return false;
        if (detailResultFilter !== '全部' && product.publishResult !== detailResultFilter) return false;
        if (detailStatusFilter !== '全部' && product.current !== detailStatusFilter) return false;
        return true;
      })
    : [];
  const detailTotalPages = Math.max(1, Math.ceil(detailProducts.length / detailPageSize));
  const detailCurrentPage = Math.min(detailPage, detailTotalPages);
  const pagedDetailProducts = detailProducts.slice((detailCurrentPage - 1) * detailPageSize, detailCurrentPage * detailPageSize);

  useEffect(() => { setDetailPage(1); }, [detailLoopFilter, detailResultFilter, detailStatusFilter]);
  useEffect(() => {
    setDetailLoopFilter('全部');
    setDetailResultFilter('全部');
    setDetailStatusFilter('全部');
    setDetailPage(1);
  }, [activeRecordId]);

  const resetDetailFilters = () => {
    setDetailLoopFilter('全部');
    setDetailResultFilter('全部');
    setDetailStatusFilter('全部');
    setDetailPage(1);
  };

  const copyProductIds = async () => {
    const text = detailProducts.map((product) => product.id).join('\n');
    if (!text) return;
    let copied = false;
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      copied = document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopyFeedback({ count: detailProducts.length, failed: !copied });
    window.setTimeout(() => setCopyFeedback(null), 2000);
  };

  // 标注运行时默认落在弹窗遮罩下面，这里把标注层提到最上层，保证标注点可见
  useEffect(() => {
    let stopped = false;
    let timer: number | undefined;
    const apply = () => {
      const host = document.getElementById('__axhub_annotation_host__');
      const root = host?.shadowRoot;
      if (!root) return false;
      if (root.querySelector('style[data-annotation-zfix]')) return true;
      const style = document.createElement('style');
      style.setAttribute('data-annotation-zfix', '');
      style.textContent = '#__axhub_annotation_overlay__ { z-index: 2147483647 !important; }';
      root.appendChild(style);
      return true;
    };
    if (!apply()) {
      timer = window.setInterval(() => {
        if (stopped || apply()) {
          if (timer) window.clearInterval(timer);
        }
      }, 200);
    }
    return () => {
      stopped = true;
      if (timer) window.clearInterval(timer);
    };
  }, []);

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
  const [imageMode, setImageMode] = useState<'shuffle' | 'sku' | 'backup'>('shuffle');
  const [backupImageStrategy, setBackupImageStrategy] = useState<'shuffle'>('shuffle');
  const [backupImages, setBackupImages] = useState<UploadedImage[]>([
    { id: 'sample-1', url: mainSample1, name: '示例图片', width: 1024, height: 1024 },
  ]);
  const uploadFileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

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
    setVisible(false);
  };

  return (
    <>
      {visible ? (
        <div className="up-overlay">
          <div className={`up-dialog${activeTab === 'records' ? ' up-dialog--records' : ''}`} role="dialog" aria-modal="true" aria-label="更新发布">
            <div className="up-dialog__header">
              <div className="up-tabs" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'update'}
                  className={`up-tab${activeTab === 'update' ? ' is-active' : ''}`}
                  onClick={() => { setActiveTab('update'); setActiveRecordId(null); }}
                >
                  更新发布
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'records'}
                  className={`up-tab${activeTab === 'records' ? ' is-active' : ''}`}
                  data-annotation-id="publish-records-tab"
                  onClick={() => setActiveTab('records')}
                >
                  发布记录
                </button>
              </div>
              <button type="button" className="up-dialog__close" aria-label="关闭" onClick={() => setVisible(false)}>×</button>
            </div>

            <div className={`up-dialog__body${activeTab === 'records' ? ' up-dialog__body--records' : ''}`}>
              {activeTab === 'update' ? (
              <>
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
                      </div>
                      {imageMode !== 'shuffle' ? (
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
              </>
              ) : activeRecord ? (
                <div className="up-record-detail">
                  <button type="button" className="up-record-detail__back" onClick={() => setActiveRecordId(null)}>
                    ← 返回发布记录
                  </button>
                  <div className="up-record-detail__summary">
                    <span className="up-record-detail__time">{activeRecord.time}</span>
                    <span>{activeRecord.products.length} 个商品</span>
                    {activeRecord.isLoop ? <span className="up-records__tag is-loop">循环刊登</span> : null}
                    <button
                      type="button"
                      className="up-record-detail__copy"
                      disabled={detailProducts.length === 0}
                      onClick={copyProductIds}
                    >
                      {copyFeedback
                        ? (copyFeedback.failed ? '复制失败' : `已复制 ${copyFeedback.count} 个`)
                        : '批量复制商品编号'}
                    </button>
                  </div>
                  <div className="up-record-query up-record-query--detail">
                    {activeRecord.isLoop ? (
                      <div className="up-record-query__field">
                        <span className="up-record-query__label">循环状态</span>
                        <FilterSelect
                          value={detailLoopFilter}
                          options={['全部', '循环中', '循环结束', '开启新循环'] as const}
                          onChange={setDetailLoopFilter}
                          ariaLabel="循环状态"
                        />
                      </div>
                    ) : null}
                    <div className="up-record-query__field">
                      <span className="up-record-query__label">发布结果</span>
                      <FilterSelect
                        value={detailResultFilter}
                        options={['全部', '待发布', '发布中', '待审核', '审核不通过', '循环刊登', '发布失败'] as const}
                        onChange={setDetailResultFilter}
                        ariaLabel="发布结果"
                      />
                    </div>
                    <div className="up-record-query__field">
                      <span className="up-record-query__label">最新状态</span>
                      <FilterSelect
                        value={detailStatusFilter}
                        options={['全部', '待发布', '发布中', '循环刊登', '发布失败', '已上架', '已下架', '待审核', '审核未通过', '内容违规', '侵权违规', '品牌商投诉'] as const}
                        onChange={setDetailStatusFilter}
                        ariaLabel="最新状态"
                      />
                    </div>
                    <button type="button" className="up-record-query__reset" onClick={resetDetailFilters}>重置</button>
                  </div>
                  <div className="up-records up-records--detail">
                    <div className="up-records__row up-records__row--head up-records__row--products" data-annotation-id="record-detail-fields">
                      <span>商品信息</span>
                      <span className="up-records__th--help">
                        循环状态
                        <HelpTooltip label="循环状态说明">
                          <span className="up-help__line"><b>循环中</b>：还有剩余次数，会继续重试</span>
                          <span className="up-help__line"><b>循环结束</b>：次数用完或已发布成功</span>
                          <span className="up-help__line"><b>开启新循环</b>：旧循环被新循环接管</span>
                        </HelpTooltip>
                      </span>
                      <span>循环次数</span>
                      <span>发布结果</span>
                      <span>最新状态</span>
                    </div>
                    {pagedDetailProducts.length === 0 ? (
                      <div className="up-records__empty">暂无数据</div>
                    ) : pagedDetailProducts.map((product) => (
                      <div className="up-records__row up-records__row--products" key={`${activeRecord.id}-${product.id}`}>
                        <span className="up-product-cell">
                          <img className="up-product-cell__img" src={product.image} alt={product.title} />
                          <span className="up-product-cell__main">
                            <span className="up-product-cell__title" title={product.title}>{product.title}</span>
                            <span className="up-product-cell__id">{product.id}</span>
                          </span>
                        </span>
                        <span>{activeRecord.isLoop ? product.loopState ?? '-' : '-'}</span>
                        <span>{activeRecord.isLoop && product.attempts != null ? `${product.attempts}/${activeRecord.loopLimit}` : '-'}</span>
                        <span>{product.publishResult ?? '-'}</span>
                        <span>
                          <span className={`up-records__tag ${currentTagClass(product.current)}`}>{product.current}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="up-record-pager">
                    <span className="up-record-pager__total">共 {detailProducts.length} 条</span>
                    <div className="up-record-pager__pages">
                      <button
                        type="button"
                        className="up-record-pager__btn"
                        disabled={detailCurrentPage === 1}
                        aria-label="上一页"
                        onClick={() => setDetailPage(detailCurrentPage - 1)}
                      >
                        ‹
                      </button>
                      {Array.from({ length: detailTotalPages }, (_, index) => index + 1).map((pageNumber) => (
                        <button
                          type="button"
                          key={pageNumber}
                          className={`up-record-pager__btn${pageNumber === detailCurrentPage ? ' is-active' : ''}`}
                          onClick={() => setDetailPage(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      ))}
                      <button
                        type="button"
                        className="up-record-pager__btn"
                        disabled={detailCurrentPage === detailTotalPages}
                        aria-label="下一页"
                        onClick={() => setDetailPage(detailCurrentPage + 1)}
                      >
                        ›
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="up-record-query">
                    <div className="up-record-query__field">
                      <span className="up-record-query__label">时间</span>
                      <DateTimePicker value={startDate} onChange={setStartDate} dateOnly placeholder="开始日期" />
                      <span className="up-record-query__sep">至</span>
                      <DateTimePicker value={endDate} onChange={setEndDate} dateOnly placeholder="结束日期" />
                    </div>
                    <div className="up-record-query__field">
                      <span className="up-record-query__label">是否循环刊登</span>
                      <FilterSelect
                        value={loopFilter}
                        options={['全部', '是', '否'] as const}
                        onChange={setLoopFilter}
                        ariaLabel="是否循环刊登"
                      />
                    </div>
                    <div className="up-record-query__field">
                      <span className="up-record-query__label">状态</span>
                      <FilterSelect
                        value={statusFilter}
                        options={['全部', '发布中', '发布完成'] as const}
                        onChange={setStatusFilter}
                        ariaLabel="状态"
                      />
                    </div>
                    <button type="button" className="up-record-query__reset" onClick={resetFilters}>重置</button>
                  </div>
                  <div className="up-records">
                    <div className="up-records__row up-records__row--head">
                      <span>发起时间</span>
                      <span>商品数</span>
                      <span>是否循环刊登</span>
                      <span>循环次数</span>
                      <span className="up-records__th--help">
                        状态
                        <HelpTooltip label="发布完成说明">
                          <span className="up-help__line">「发布完成」只表示这批发布任务已经执行结束，不代表所有商品都发布成功。</span>
                          <span className="up-help__line">每个商品的结果请点进对应记录查看商品发布明细。</span>
                        </HelpTooltip>
                      </span>
                      <span />
                    </div>
                    {pagedRecords.length === 0 ? (
                      <div className="up-records__empty">暂无数据</div>
                    ) : pagedRecords.map((record) => {
                      const status = recordStatus(record);
                      return (
                        <div
                          className="up-records__row up-records__row--clickable"
                          key={record.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => setActiveRecordId(record.id)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              setActiveRecordId(record.id);
                            }
                          }}
                        >
                          <span className="up-records__time">{record.time}</span>
                          <span>{record.products.length} 个</span>
                          <span>
                            <span className={`up-records__tag ${record.isLoop ? 'is-loop' : 'is-single'}`}>
                              {record.isLoop ? '是' : '否'}
                            </span>
                          </span>
                          <span>{record.isLoop && record.loopLimit ? `${record.loopLimit} 次` : '-'}</span>
                          <span>
                            <span className={`up-records__tag ${status === '发布中' ? 'is-publishing' : 'is-completed'}`}>
                              {status}
                            </span>
                          </span>
                          <span className="up-records__arrow">›</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="up-record-pager">
                    <span className="up-record-pager__total">共 {filteredRecords.length} 条</span>
                    <div className="up-record-pager__pages">
                      <button
                        type="button"
                        className="up-record-pager__btn"
                        disabled={currentPage === 1}
                        aria-label="上一页"
                        onClick={() => setPage(currentPage - 1)}
                      >
                        ‹
                      </button>
                      {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                        <button
                          type="button"
                          key={pageNumber}
                          className={`up-record-pager__btn${pageNumber === currentPage ? ' is-active' : ''}`}
                          onClick={() => setPage(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      ))}
                      <button
                        type="button"
                        className="up-record-pager__btn"
                        disabled={currentPage === totalPages}
                        aria-label="下一页"
                        onClick={() => setPage(currentPage + 1)}
                      >
                        ›
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {activeTab === 'update' ? (
            <div className="up-dialog__footer" data-annotation-id="dialog-footer">
              <button type="button" className="up-btn up-btn--plain" onClick={() => setVisible(false)}>取消</button>
              <button type="button" className="up-btn up-btn--primary" onClick={handleConfirm}>确定</button>
            </div>
            ) : null}
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
