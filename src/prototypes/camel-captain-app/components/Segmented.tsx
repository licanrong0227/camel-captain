import React from 'react';

export type SegmentOption = { key: string; label: string; badge?: React.ReactNode };

export function Segmented({
  value,
  options,
  onChange,
  variant = 'chips',
  className = '',
}: {
  value: string;
  options: SegmentOption[];
  onChange: (next: string) => void;
  variant?: 'chips' | 'tabs';
  className?: string;
}) {
  return (
    <div className={`cc-seg cc-seg--${variant} ${className}`.trim()} role="tablist">
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          role="tab"
          aria-selected={value === option.key}
          className={`cc-seg-item${value === option.key ? ' is-active' : ''}`}
          onClick={() => onChange(option.key)}
        >
          <span>{option.label}</span>
          {option.badge ? <span className="cc-seg-badge">{option.badge}</span> : null}
        </button>
      ))}
    </div>
  );
}
