import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface MultiOption {
  value: string;
  label: string;
  description?: string;
}

interface MultiSelectProps {
  value: string[];
  options: MultiOption[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  width?: number;
}

export function MultiSelect({ value, options, onChange, placeholder = '请选择', width = 210 }: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const place = () => {
    const trigger = ref.current?.querySelector('.ss-mselect-trigger') as HTMLElement | null;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const height = 300;
    const top = rect.bottom + 4 + height > window.innerHeight ? Math.max(8, rect.top - height - 4) : rect.bottom + 4;
    setPos({ top, left: rect.left });
  };

  const openPanel = () => {
    place();
    setOpen(true);
  };

  const reposition = () => {
    const trigger = ref.current?.querySelector('.ss-mselect-trigger') as HTMLElement | null;
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
    <div className="ss-mselect" ref={ref} style={{ width }}>
      <button
        type="button"
        className={`ss-mselect-trigger${open ? ' is-open' : ''}${selected.length === 0 ? ' is-empty' : ''}`}
        onClick={() => (open ? setOpen(false) : openPanel())}
      >
        <span className="ss-mselect-summary">{summary || placeholder}</span>
        <ChevronDown size={14} className="ss-mselect-caret" />
      </button>
      {open ? (
        <div className="ss-mselect-panel" style={{ position: 'fixed', top: pos?.top ?? 0, left: pos?.left ?? 0 }}>
          <div className="ss-mselect-search">
            <input
              className="ss-mselect-input"
              placeholder="搜索标签"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
          </div>
          <div className="ss-mselect-list">
            {filtered.length === 0 ? <div className="ss-mselect-empty">没有匹配的标签</div> : null}
            {filtered.map((option) => {
              const on = value.includes(option.value);
              return (
                <button
                  type="button"
                  key={option.value}
                  className={`ss-mselect-item${on ? ' is-on' : ''}`}
                  title={option.description}
                  onClick={() => onChange(on ? value.filter((id) => id !== option.value) : [...value, option.value])}
                >
                  <span className="ss-mselect-check">{on ? '✓' : ''}</span>
                  <span className="ss-mselect-label">{option.label}</span>
                </button>
              );
            })}
          </div>
          <div className="ss-mselect-foot">
            <span>已选 {selected.length} 个</span>
            <button type="button" className="ss-mselect-clear" onClick={() => onChange([])}>清空</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
