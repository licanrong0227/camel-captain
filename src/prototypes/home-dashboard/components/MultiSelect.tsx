import React, { useEffect, useRef, useState } from 'react';

export interface MultiOption {
  value: string;
  label: string;
  description?: string;
}

export function MultiSelect({
  value,
  options,
  onChange,
  placeholder = '请选择',
  width = 230,
}: {
  value: string[];
  options: MultiOption[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  width?: number;
}) {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const place = () => {
    const trigger = ref.current?.querySelector('.hd-mselect-trigger') as HTMLElement | null;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const panelHeight = 320;
    const top = rect.bottom + 4 + panelHeight > window.innerHeight ? Math.max(8, rect.top - panelHeight - 4) : rect.bottom + 4;
    setPos({ top, left: Math.min(rect.left, window.innerWidth - 280), width: Math.max(rect.width, 260) });
  };

  const reposition = () => {
    const trigger = ref.current?.querySelector('.hd-mselect-trigger') as HTMLElement | null;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) {
      setOpen(false);
      return;
    }
    place();
  };

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    const onScroll = (event: Event) => {
      if (ref.current && ref.current.contains(event.target as Node)) return;
      reposition();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', reposition);
    document.addEventListener('mousedown', onDown, true);
    document.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', reposition);
      document.removeEventListener('mousedown', onDown, true);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const selected = options.filter((option) => value.includes(option.value));
  const summary = selected.length === 0
    ? ''
    : selected.length <= 2
      ? selected.map((option) => option.label).join('、')
      : `${selected[0].label} 等 ${selected.length} 个`;
  const filtered = keyword
    ? options.filter((option) => option.label.toLowerCase().includes(keyword.trim().toLowerCase()))
    : options;

  return (
    <div className="hd-mselect" ref={ref} style={{ width }}>
      <button
        type="button"
        className={`hd-mselect-trigger${open ? ' is-open' : ''}${selected.length === 0 ? ' is-empty' : ''}`}
        onClick={() => {
          if (open) {
            setOpen(false);
          } else {
            place();
            setOpen(true);
          }
        }}
      >
        <span className="hd-mselect-summary">{summary || placeholder}</span>
        <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" className="hd-mselect-caret">
          <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open ? (
        <div className="hd-mselect-panel" style={{ position: 'fixed', top: pos?.top ?? 0, left: pos?.left ?? 0, width: pos?.width ?? width }}>
          <div className="hd-mselect-search">
            <input
              className="hd-mselect-input"
              placeholder="搜索店铺"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
          </div>
          <div className="hd-mselect-list">
            {filtered.length === 0 ? <div className="hd-mselect-empty">没有匹配的店铺</div> : null}
            {filtered.map((option) => {
              const on = value.includes(option.value);
              return (
                <button
                  type="button"
                  key={option.value}
                  className={`hd-mselect-item${on ? ' is-on' : ''}`}
                  title={option.description}
                  onClick={() => onChange(on ? value.filter((id) => id !== option.value) : [...value, option.value])}
                >
                  <span className="hd-mselect-check">{on ? '✓' : ''}</span>
                  <span className="hd-mselect-label">{option.label}</span>
                </button>
              );
            })}
          </div>
          <div className="hd-mselect-foot">
            <span>已选 {selected.length} 个</span>
            <button type="button" className="hd-mselect-clear" onClick={() => onChange([])}>清空</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
