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
  dialogClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);
  const cls = (base: string, extra?: string) => (extra ? `${base} ${extra}` : base);
  return (
    <div className={cls('bcp-overlay', props.overlayClassName)} onMouseDown={(e) => { if (e.target === e.currentTarget) props.onClose(); }}>
      <div className={cls('bcp-dialog', props.dialogClassName)} role="dialog" aria-modal="true" aria-label={props.title} style={{ width: props.width }}>
        <div className="bcp-dialog__header">
          <span className="bcp-dialog__title">{props.title}</span>
          <button type="button" className="bcp-dialog__close" aria-label="Close" onClick={props.onClose}>
            <svg width="14" height="14" viewBox="0 0 14 14"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </button>
        </div>
        <div className={cls('bcp-dialog__body', props.bodyClassName)}>{props.children}</div>
        {props.footer ? <div className={cls('bcp-dialog__footer', props.footerClassName)}>{props.footer}</div> : null}
      </div>
    </div>
  );
}

type Option = { label: string; value: string };

export function Select(props: {
  value: string | string[];
  placeholder?: string;
  options: Option[];
  onChange: (v: string | string[]) => void;
  multiple?: boolean;
  disabled?: boolean;
  width?: number;
  className?: string;
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

  const selected = Array.isArray(props.value) ? props.value : props.value ? [props.value] : [];
  const label = props.multiple
    ? selected.join('、')
    : (props.options.find((o) => o.value === selected[0])?.label ?? selected[0] ?? '');

  const toggle = (v: string) => {
    if (props.multiple) {
      const next = selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v];
      props.onChange(next);
    } else {
      props.onChange(v);
      setOpen(false);
    }
  };

  return (
    <div ref={ref} className={`bcp-select${props.className ? ' ' + props.className : ''}${open ? ' is-open' : ''}${props.disabled ? ' is-disabled' : ''}`} style={props.width ? { width: props.width } : undefined}>
      <div className="bcp-select__control" onClick={() => { if (!props.disabled) setOpen((o) => !o); }}>
        {props.multiple && selected.length > 0 ? (
          <span className="bcp-select__tags">
            {selected.map((t) => (
              <span key={t} className="bcp-tag">
                {t}
                <button type="button" aria-label={`移除${t}`} onClick={(e) => { e.stopPropagation(); toggle(t); }}>×</button>
              </span>
            ))}
          </span>
        ) : (
          <span className={label ? 'bcp-select__value' : 'bcp-select__placeholder'}>{label || props.placeholder || '请选择'}</span>
        )}
        <svg className="bcp-select__caret" width="12" height="12" viewBox="0 0 12 12"><path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      {open ? (
        <div className="bcp-select__dropdown">
          {props.options.length === 0 ? <div className="bcp-select__empty">无数据</div> : null}
          {props.options.map((o) => {
            const on = selected.includes(o.value);
            return (
              <div key={o.value} className={`bcp-select__option${on ? ' is-selected' : ''}`} onClick={() => toggle(o.value)}>
                {props.multiple ? <span className={`bcp-check${on ? ' is-on' : ''}`}>{on ? '✓' : ''}</span> : null}
                {o.label}
              </div>
            );
          })}
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
