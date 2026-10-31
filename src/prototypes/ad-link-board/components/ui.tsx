import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Info } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export function Select(props: {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  width?: number;
  size?: 'default' | 'small';
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = props.options.find((option) => option.value === props.value) ?? props.options[0];

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="adr-select" ref={ref} style={props.width ? { width: props.width } : undefined}>
      <button
        type="button"
        className={`adr-select__trigger${props.size === 'small' ? ' is-small' : ''}${open ? ' is-open' : ''}`}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="adr-select__label">{current?.label ?? ''}</span>
        <ChevronDown size={14} className="adr-select__caret" />
      </button>
      {open ? (
        <div className="adr-select__panel">
          {props.options.map((option) => (
            <button
              type="button"
              key={option.value}
              className={`adr-select__option${option.value === props.value ? ' is-active' : ''}`}
              onClick={() => {
                props.onChange(option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export type TagTone = 'info' | 'success' | 'warning' | 'danger' | 'neutral' | 'brand';

export function Tag(props: { tone?: TagTone; children: React.ReactNode; className?: string }) {
  return <span className={`adr-tag adr-tag--${props.tone ?? 'neutral'}${props.className ? ` ${props.className}` : ''}`}>{props.children}</span>;
}

export function InfoTip(props: { text: string }) {
  return (
    <span className="adr-infotip" tabIndex={0}>
      <Info size={13} />
      <span className="adr-infotip__body">{props.text}</span>
    </span>
  );
}

export function Pager(props: {
  page: number;
  pageSize: number;
  total: number;
  pageSizes?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  const sizes = props.pageSizes ?? [10, 20, 50, 100];
  const pageCount = Math.max(1, Math.ceil(props.total / props.pageSize));
  const pages: Array<number | 'gap'> = [];
  for (let index = 1; index <= pageCount; index += 1) {
    if (index === 1 || index === pageCount || Math.abs(index - props.page) <= 1) {
      pages.push(index);
    } else if (pages[pages.length - 1] !== 'gap') {
      pages.push('gap');
    }
  }

  return (
    <div className="adr-pager">
      <span className="adr-pager__total">共 {props.total} 条</span>
      <Select
        size="small"
        width={104}
        value={String(props.pageSize)}
        options={sizes.map((size) => ({ value: String(size), label: `${size} 条/页` }))}
        onChange={(value) => props.onPageSizeChange(Number(value))}
      />
      <button
        type="button"
        className="adr-pager__btn"
        disabled={props.page <= 1}
        onClick={() => props.onPageChange(props.page - 1)}
        aria-label="上一页"
      >
        <ChevronLeft size={14} />
      </button>
      {pages.map((item, index) =>
        item === 'gap' ? (
          <span className="adr-pager__gap" key={`gap-${index}`}>
            …
          </span>
        ) : (
          <button
            type="button"
            key={item}
            className={`adr-pager__btn${item === props.page ? ' is-active' : ''}`}
            onClick={() => props.onPageChange(item)}
          >
            {item}
          </button>
        ),
      )}
      <button
        type="button"
        className="adr-pager__btn"
        disabled={props.page >= pageCount}
        onClick={() => props.onPageChange(props.page + 1)}
        aria-label="下一页"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

export function Empty(props: { text?: string; extra?: React.ReactNode }) {
  return (
    <div className="adr-empty">
      <div className="adr-empty__icon" aria-hidden="true">
        <svg width="52" height="40" viewBox="0 0 52 40" fill="none">
          <rect x="6" y="7" width="40" height="26" rx="3" stroke="#C0C5CF" strokeWidth="1.4" />
          <path d="M6 15h40" stroke="#C0C5CF" strokeWidth="1.4" />
          <path d="M14 22h10M14 27h18" stroke="#E5E6EB" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </div>
      <div className="adr-empty__text">{props.text ?? '暂无数据'}</div>
      {props.extra}
    </div>
  );
}

export interface MultiOption {
  value: string;
  label: string;
  description?: string;
}

export function MultiSelect(props: {
  value: string[];
  options: MultiOption[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  width?: number;
}) {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const openPanel = () => {
    const trigger = ref.current?.querySelector('.adr-mselect__trigger') as HTMLElement | null;
    if (trigger) {
      const rect = trigger.getBoundingClientRect();
      const height = 320;
      const top = rect.bottom + 4 + height > window.innerHeight ? Math.max(8, rect.top - height - 4) : rect.bottom + 4;
      setPos({ top, left: rect.left });
    }
    setOpen(true);
  };

  const reposition = () => {
    const trigger = ref.current?.querySelector('.adr-mselect__trigger') as HTMLElement | null;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) {
      setOpen(false);
      return;
    }
    const height = 320;
    const top = rect.bottom + 4 + height > window.innerHeight ? Math.max(8, rect.top - height - 4) : rect.bottom + 4;
    setPos({ top, left: rect.left });
  };

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    // 只跟随页面/弹窗的滚动重新定位；下拉自身的列表滚动不要干扰
    const onScroll = (event: Event) => {
      if (ref.current && ref.current.contains(event.target as Node)) return;
      reposition();
    };
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', reposition);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', reposition);
    };
  }, [open]);

  const selected = props.options.filter((option) => props.value.includes(option.value));
  const summary =
    selected.length === 0
      ? ''
      : selected.length <= 2
        ? selected.map((option) => option.label).join('、')
        : `${selected[0].label} 等 ${selected.length} 个`;
  const filtered = keyword
    ? props.options.filter((option) => option.label.toLowerCase().includes(keyword.trim().toLowerCase()))
    : props.options;

  return (
    <div className="adr-mselect" ref={ref} style={props.width ? { width: props.width } : undefined}>
      <button
        type="button"
        className={`adr-mselect__trigger${open ? ' is-open' : ''}${selected.length === 0 ? ' is-empty' : ''}`}
        onClick={() => (open ? setOpen(false) : openPanel())}
      >
        <span className="adr-mselect__summary">{summary || props.placeholder || '请选择'}</span>
        <ChevronDown size={14} className="adr-mselect__caret" />
      </button>
      {open ? (
        <div className="adr-mselect__panel" style={{ position: 'fixed', top: pos?.top ?? 0, left: pos?.left ?? 0, width: 240 }}>
          <div className="adr-mselect__search">
            <input
              className="adr-mselect__input"
              placeholder="搜索标签"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
          </div>
          <div className="adr-mselect__list">
            {filtered.length === 0 ? <div className="adr-mselect__empty">没有匹配的标签</div> : null}
            {filtered.map((option) => {
              const on = props.value.includes(option.value);
              return (
                <button
                  type="button"
                  key={option.value}
                  className={`adr-mselect__item${on ? ' is-on' : ''}`}
                  title={option.description}
                  onClick={() =>
                    props.onChange(on ? props.value.filter((id) => id !== option.value) : [...props.value, option.value])
                  }
                >
                  <span className="adr-mselect__check">{on ? '✓' : ''}</span>
                  <span className="adr-mselect__label">{option.label}</span>
                </button>
              );
            })}
          </div>
          <div className="adr-mselect__foot">
            <span>已选 {selected.length} 个</span>
            <button type="button" className="adr-mselect__clear" onClick={() => props.onChange([])}>
              清空
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
