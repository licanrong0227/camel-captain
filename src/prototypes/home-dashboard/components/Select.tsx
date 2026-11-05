import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface SelectOption {
  value: string | number;
  label: string;
}

export function Select({
  value,
  options,
  onChange,
  width = 128,
  placeholder = '请选择',
  disabled,
}: {
  value: string | number;
  options: SelectOption[];
  onChange: (value: string) => void;
  width?: number;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const current = options.find((option) => String(option.value) === String(value));

  const place = () => {
    const trigger = rootRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const panelWidth = Math.max(rect.width, width);
    const panelHeight = Math.min(280, 36 + options.length * 32);
    const top = rect.bottom + 4 + panelHeight > window.innerHeight ? Math.max(8, rect.top - panelHeight - 4) : rect.bottom + 4;
    setPos({ top, left: Math.min(rect.left, window.innerWidth - panelWidth - 8), width: panelWidth });
  };

  useEffect(() => {
    if (!open) return undefined;
    place();
    const onDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onScroll = (event: Event) => {
      if (rootRef.current?.contains(event.target as Node) || panelRef.current?.contains(event.target as Node)) return;
      const trigger = rootRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) setOpen(false);
      else place();
    };
    const onResize = () => place();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown, true);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown, true);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className={`hd-select${open ? ' is-open' : ''}${disabled ? ' is-disabled' : ''}`}
      style={{ width }}
    >
      <div className="hd-select-inner" onClick={() => { if (!disabled) { if (!open) place(); setOpen((prev) => !prev); } }}>
        <span className={`hd-select-text${current ? '' : ' is-placeholder'}`}>{current ? current.label : placeholder}</span>
        <svg className="hd-select-caret" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
          <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {open && pos
        ? createPortal(
            <div
              ref={panelRef}
              className="hd-select-dropdown is-portal"
              style={{ top: pos.top, left: pos.left, minWidth: pos.width, width: pos.width }}
            >
              <ul className="hd-select-list">
                {options.map((option) => {
                  const selected = String(option.value) === String(value);
                  return (
                    <li
                      key={String(option.value)}
                      className={`hd-select-option${selected ? ' is-selected' : ''}`}
                      onClick={() => { onChange(String(option.value)); setOpen(false); }}
                    >
                      {option.label}
                    </li>
                  );
                })}
              </ul>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
