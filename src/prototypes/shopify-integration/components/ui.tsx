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
