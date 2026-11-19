import React, { useEffect, useRef, useState } from 'react';

export function MetricHelp({ text, align = 'left' }: { text: string; align?: 'left' | 'right' }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  if (!text) return null;

  return (
    <span className="cc-metric-help" ref={wrapRef}>
      <button
        type="button"
        className="cc-help-dot"
        aria-label="指标说明"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((value) => !value);
        }}
      >
        ?
      </button>
      {open ? (
        <span className={`cc-metric-help-tip is-${align}`} role="note">{text}</span>
      ) : null}
    </span>
  );
}
