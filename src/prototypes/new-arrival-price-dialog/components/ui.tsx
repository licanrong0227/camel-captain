import React, { useEffect, useRef, useState } from 'react';

export function showToast(text: string) {
  const el = document.createElement('div');
  el.className = 'bcp-toast';
  el.textContent = text;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('is-show'));
  setTimeout(() => {
    el.classList.remove('is-show');
    setTimeout(() => el.remove(), 300);
  }, 2200);
}

export function Modal(props: {
  title: string;
  width: number;
  onClose: () => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
  overlayClassName?: string;
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);
  return (
    <div className={`bcp-overlay${props.overlayClassName ? ' ' + props.overlayClassName : ''}`} onMouseDown={(e) => { if (e.target === e.currentTarget) props.onClose(); }}>
      <div className="bcp-dialog" role="dialog" aria-modal="true" aria-label={props.title} style={{ width: props.width }}>
        <div className="bcp-dialog__header">
          <span className="bcp-dialog__title">{props.title}</span>
          <button type="button" className="bcp-dialog__close" aria-label="Close" onClick={props.onClose}>
            <svg width="14" height="14" viewBox="0 0 14 14"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </button>
        </div>
        <div className="bcp-dialog__body">{props.children}</div>
        {props.footer ? <div className="bcp-dialog__footer">{props.footer}</div> : null}
      </div>
    </div>
  );
}

type Option = { label: string; value: string; description?: string };

export function Select(props: {
  value: string;
  placeholder?: string;
  options: Option[];
  onChange: (v: string) => void;
  width?: number;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const label = props.options.find((o) => o.value === props.value)?.label ?? props.value;

  return (
    <div ref={ref} className={`bcp-select${open ? ' is-open' : ''}`} style={props.width ? { width: props.width } : undefined}>
      <div className="bcp-select__control" onClick={() => setOpen((o) => !o)}>
        <span className={label ? 'bcp-select__value' : 'bcp-select__placeholder'}>{label || props.placeholder || '请选择'}</span>
        <svg className="bcp-select__caret" width="12" height="12" viewBox="0 0 12 12"><path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      {open ? (
        <div className="bcp-select__dropdown">
          {props.options.map((o) => (
            <div
              key={o.value}
              className={`bcp-select__option${o.value === props.value ? ' is-selected' : ''}${o.description ? ' bcp-select__option--rich' : ''}`}
              onClick={() => { props.onChange(o.value); setOpen(false); }}
            >
              <span className="bcp-select__option-label">{o.label}</span>
              {o.description ? <span className="bcp-select__option-desc">{o.description}</span> : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function Field(props: { label: string; required?: boolean; children: React.ReactNode; labelWidth?: number }) {
  return (
    <div className="bcp-field">
      <span className={`bcp-field__label${props.required ? ' is-required' : ''}`} style={{ width: props.labelWidth ?? 90 }}>{props.label}</span>
      <span className="bcp-field__content">{props.children}</span>
    </div>
  );
}

export function SectionTitle(props: { children: React.ReactNode; extra?: React.ReactNode }) {
  return (
    <div className="bcp-section-title">
      {props.children}
      {props.extra ? <span className="bcp-section-title__extra">{props.extra}</span> : null}
    </div>
  );
}
