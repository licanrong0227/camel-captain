import React, { useEffect, useRef, useState } from 'react';

export function KpiCard({
  label,
  value,
  delta,
  hint,
  icon,
  active = false,
  wide = false,
  goodWhenUp = true,
  compareLabel = '较昨日',
  showGo = true,
  onClick,
}: {
  label: string;
  value: string;
  delta?: number | null;
  hint?: string;
  icon?: React.ReactNode;
  active?: boolean;
  wide?: boolean;
  goodWhenUp?: boolean;
  compareLabel?: string;
  showGo?: boolean;
  onClick?: () => void;
}) {
  const [tipOpen, setTipOpen] = useState(false);
  const [tipX, setTipX] = useState(24);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tipOpen) return undefined;
    const onMouseDown = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) setTipOpen(false);
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [tipOpen]);

  const tone = delta == null || !Number.isFinite(delta) || Math.abs(delta) < 0.0005
    ? 'flat'
    : delta > 0
      ? (goodWhenUp ? 'up' : 'down')
      : (goodWhenUp ? 'down' : 'up');

  return (
    <div
      ref={cardRef}
      className={`cc-kpi${wide ? ' cc-kpi--wide' : ''}${active ? ' is-active' : ''}${onClick ? ' is-link' : ''}`}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={() => {
        setTipOpen(false);
        onClick?.();
      }}
      onKeyDown={(event) => {
        if (onClick && (event.key === 'Enter' || event.key === ' ')) {
          setTipOpen(false);
          onClick();
        }
      }}
    >
      <div className="cc-kpi-label-row">
        {icon ? <span className="cc-kpi-icon">{icon}</span> : null}
        <span className="cc-kpi-label">{label}</span>
        {hint ? (
          <button
            type="button"
            className="cc-help-dot"
            aria-label={`${label}口径`}
            onClick={(event) => {
              event.stopPropagation();
              const card = cardRef.current;
              if (card) {
                const btnRect = event.currentTarget.getBoundingClientRect();
                const cardRect = card.getBoundingClientRect();
                const x = btnRect.left - cardRect.left + btnRect.width / 2;
                setTipX(Math.min(Math.max(x, 16), cardRect.width - 20));
              }
              setTipOpen((value) => !value);
            }}
          >
            ?
          </button>
        ) : null}
        {showGo && onClick ? <span className="cc-kpi-go">›</span> : null}
      </div>
      <div className="cc-kpi-value">{value}</div>
      {delta !== undefined ? (
        <div className="cc-kpi-compare">
          <span>{compareLabel}</span>
          <span className={`cc-kpi-delta is-${tone}`}>
            {delta == null || !Number.isFinite(delta) ? '-' : `${delta >= 0 ? '+' : ''}${(delta * 100).toFixed(1)}%`}
          </span>
        </div>
      ) : null}
      {tipOpen && hint ? (
        <div className="cc-kpi-tip" style={{ '--tip-arrow-x': `${tipX}px` } as React.CSSProperties} onClick={(event) => event.stopPropagation()}>{hint}</div>
      ) : null}
    </div>
  );
}
