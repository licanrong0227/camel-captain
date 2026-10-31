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
