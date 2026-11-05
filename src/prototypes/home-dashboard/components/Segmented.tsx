import React from 'react';

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  className,
}: {
  value: T;
  options: { key: T; label: string }[];
  onChange: (key: T) => void;
  className?: string;
}) {
  return (
    <div className={`hd-period-tabs${className ? ` ${className}` : ''}`} role="radiogroup">
      {options.map((option) => (
        <button
          type="button"
          key={option.key}
          role="radio"
          aria-checked={value === option.key}
          className={`hd-period-btn${value === option.key ? ' is-active' : ''}`}
          onClick={() => onChange(option.key)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
