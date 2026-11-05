import React from 'react';

export function Sparkline({ values }: { values: number[] }) {
  const finite = values.filter((value) => Number.isFinite(value));
  if (finite.length < 2 || finite.every((value) => value === 0)) {
    return <span className="hd-muted">-</span>;
  }
  const width = 96;
  const height = 26;
  const pad = 2;
  const min = Math.min(...finite);
  const max = Math.max(...finite);
  const span = max - min || 1;
  const step = (width - pad * 2) / (values.length - 1);
  const points = values.map((value, index) => {
    const x = pad + index * step;
    const y = Number.isFinite(value) ? pad + (height - pad * 2) * (1 - (value - min) / span) : height - pad;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const line = `M${points.join(' L')}`;
  const area = `${line} L${width - pad} ${height - pad} L${pad} ${height - pad} Z`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} aria-hidden="true">
      <path d={area} fill="rgba(255, 138, 61, 0.12)" />
      <path d={line} fill="none" stroke="#ff8a3d" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
