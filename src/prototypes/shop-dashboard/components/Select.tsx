import React, { useEffect, useRef, useState } from 'react';

export interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps {
  value: string | number;
  options: SelectOption[];
  onChange: (value: string) => void;
  width?: number;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

function Caret() {
  return (
    <svg className="ss-select-caret" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
      <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Select({ value, options, onChange, width = 120, placeholder = '请选择', disabled, className }: SelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = options.find((option) => String(option.value) === String(value));

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  return (
    <div
      ref={rootRef}
      className={`ss-select${open ? ' is-open' : ''}${disabled ? ' is-disabled' : ''}${className ? ` ${className}` : ''}`}
      style={{ width }}
    >
      <div
        className="ss-select-inner"
        onClick={() => {
          if (!disabled) setOpen((prev) => !prev);
        }}
      >
        <span className={`ss-select-text${current ? '' : ' is-placeholder'}`}>{current ? current.label : placeholder}</span>
        <Caret />
      </div>
      {open ? (
        <div className="ss-select-dropdown" style={{ minWidth: width }}>
          <ul className="ss-select-list">
            {options.map((option) => {
              const selected = String(option.value) === String(value);
              return (
                <li
                  key={String(option.value)}
                  className={`ss-select-option${selected ? ' is-selected' : ''}`}
                  onClick={() => {
                    onChange(String(option.value));
                    setOpen(false);
                  }}
                >
                  {option.label}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
