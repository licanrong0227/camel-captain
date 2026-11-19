import React from 'react';

export function AuthField({
  label,
  icon,
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
  right,
  inputMode,
  maxLength,
  autoComplete,
}: {
  label: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  type?: string;
  error?: string;
  right?: React.ReactNode;
  inputMode?: 'text' | 'numeric' | 'tel' | 'email';
  maxLength?: number;
  autoComplete?: string;
}) {
  return (
    <div className="cc-field">
      <div className="cc-field-label">{label}</div>
      <div className={`cc-field-box${error ? ' is-error' : ''}`}>
        {icon ? <span className="cc-field-icon">{icon}</span> : null}
        <input
          className="cc-input"
          type={type}
          value={value}
          placeholder={placeholder}
          inputMode={inputMode}
          maxLength={maxLength}
          autoComplete={autoComplete}
          onChange={(event) => onChange(event.target.value)}
        />
        {right ? <span className="cc-field-right">{right}</span> : null}
      </div>
      {error ? <div className="cc-field-error">{error}</div> : null}
    </div>
  );
}
