import React, { useEffect, useId, useRef, useState } from 'react';

export interface ChartSeries {
  key: string;
  label: string;
  color: string;
  values: Array<number | null>;
  area?: boolean;
  axis?: 'left' | 'right';
}

export interface ChartTipRow {
  label: string;
  value: string;
  color?: string;
}

interface Point {
  x: number;
  y: number;
}

function monotonePath(points: Point[]): string {
  const count = points.length;
  if (count === 0) return '';
  if (count === 1) return `M ${points[0].x} ${points[0].y}`;
  const h: number[] = [];
  const delta: number[] = [];
  for (let index = 0; index < count - 1; index += 1) {
    h[index] = Math.max(points[index + 1].x - points[index].x, 0.0001);
    delta[index] = (points[index + 1].y - points[index].y) / h[index];
  }
  const tangents: number[] = new Array(count).fill(0);
  tangents[0] = delta[0];
  tangents[count - 1] = delta[count - 2];
  for (let index = 1; index < count - 1; index += 1) {
    tangents[index] = delta[index - 1] * delta[index] <= 0 ? 0 : (delta[index - 1] + delta[index]) / 2;
  }
  for (let index = 0; index < count - 1; index += 1) {
    if (delta[index] === 0) {
      tangents[index] = 0;
      tangents[index + 1] = 0;
      continue;
    }
    const a = tangents[index] / delta[index];
    const b = tangents[index + 1] / delta[index];
    const sum = a * a + b * b;
    if (sum > 9) {
      const scale = 3 / Math.sqrt(sum);
      tangents[index] = scale * a * delta[index];
      tangents[index + 1] = scale * b * delta[index];
    }
  }
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let index = 0; index < count - 1; index += 1) {
    const cp1x = points[index].x + h[index] / 3;
    const cp1y = points[index].y + (tangents[index] * h[index]) / 3;
    const cp2x = points[index + 1].x - h[index] / 3;
    const cp2y = points[index + 1].y - (tangents[index + 1] * h[index]) / 3;
    path += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${points[index + 1].x.toFixed(2)} ${points[index + 1].y.toFixed(2)}`;
  }
  return path;
}

function niceStep(max: number): number {
  if (max <= 0) return 0.2;
  const rough = max / 5;
  const power = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / power;
  const factor = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
  return factor * power;
}

export function Chart({
  labels,
  series,
  height = 260,
  fill = false,
  formatValue,
  axisFormat,
  rightAxisFormat,
  tipRows,
  ariaLabel,
}: {
  labels: string[];
  series: ChartSeries[];
  height?: number;
  fill?: boolean;
  formatValue: (value: number) => string;
  axisFormat?: (value: number) => string;
  rightAxisFormat?: (value: number) => string;
  tipRows?: (index: number) => ChartTipRow[];
  ariaLabel?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(760);
  const [measuredHeight, setMeasuredHeight] = useState(height);
  const [hover, setHover] = useState<number | null>(null);
  const gradientBase = useId().replace(/[:]/g, '');
  const chartHeight = fill ? Math.max(measuredHeight, 120) : height;
  const hasRightAxis = series.some((item) => item.axis === 'right');
  const margin = { top: 20, left: 52, right: hasRightAxis ? 62 : 24, bottom: 28 };
  const innerWidth = Math.max(width - margin.left - margin.right, 10);
  const innerHeight = Math.max(chartHeight - margin.top - margin.bottom, 10);
  const count = labels.length;

  const buildScale = (values: number[]) => {
    const rawMax = values.length ? Math.max(...values, 0) : 0;
    const step = niceStep(rawMax);
    const tickMax = rawMax <= 0 ? 1 : Math.ceil(rawMax / step) * step;
    const ticks: number[] = [];
    for (let value = 0; value <= tickMax + step / 1000; value += step) ticks.push(Number(value.toFixed(4)));
    if (ticks[ticks.length - 1] < tickMax) ticks.push(tickMax);
    return { rawMax, tickMax, ticks };
  };
  const leftScale = buildScale(series.filter((item) => item.axis !== 'right').flatMap((item) => item.values.map((value) => value ?? 0)));
  const rightScale = buildScale(series.filter((item) => item.axis === 'right').flatMap((item) => item.values.map((value) => value ?? 0)));

  const xAt = (index: number) => (count <= 1 ? margin.left + innerWidth / 2 : margin.left + (innerWidth * index) / (count - 1));
  const yAt = (value: number, axis: 'left' | 'right' = 'left') => {
    const scale = axis === 'right' ? rightScale : leftScale;
    return margin.top + innerHeight * (1 - (scale.tickMax === 0 ? 0 : value / scale.tickMax));
  };
  const labelStep = Math.max(1, Math.ceil(count / Math.max(5, Math.floor(width / 78))));

  useEffect(() => {
    const node = wrapRef.current;
    if (!node) return undefined;
    const update = () => {
      setWidth(Math.max(node.clientWidth, 260));
      if (fill) setMeasuredHeight(Math.max(node.clientHeight, 120));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [fill]);

  const paths = series.map((item) => {
    const points = item.values.map((value, index) => ({ x: xAt(index), y: yAt(value ?? 0, item.axis) }));
    const line = monotonePath(points);
    const area = item.area && points.length
      ? `${line} L ${points[points.length - 1].x.toFixed(2)} ${(margin.top + innerHeight).toFixed(2)} L ${points[0].x.toFixed(2)} ${(margin.top + innerHeight).toFixed(2)} Z`
      : '';
    return { ...item, points, line, area };
  });

  const hoverPoint = hover != null ? paths[0]?.points[hover] : null;
  const hoverTop = hover != null ? Math.min(...paths.map((item) => item.points[hover]?.y ?? chartHeight)) : 0;
  const rows: ChartTipRow[] = hover != null
    ? tipRows
      ? tipRows(hover)
      : series.map((item) => ({ label: item.label, value: formatValue(item.values[hover] ?? 0), color: item.color }))
    : [];

  return (
    <div className="hd-chart hd-line-chart" ref={wrapRef} style={fill ? { height: '100%' } : { height }}>
      <svg width={width} height={chartHeight} role="img" aria-label={ariaLabel || '趋势图'}>
        <defs>
          {series.map((item) => (
            <linearGradient key={item.key} id={`${gradientBase}-${item.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={item.color} stopOpacity="0.24" />
              <stop offset="100%" stopColor={item.color} stopOpacity="0.02" />
            </linearGradient>
          ))}
        </defs>
        {leftScale.ticks.map((tick) => {
          const y = yAt(tick);
          return (
            <g key={`left-${tick}`}>
              <line x1={margin.left} y1={y} x2={width - margin.right} y2={y} stroke="#f0f0f0" strokeDasharray="4 4" />
              <text x={margin.left - 8} y={y + 4} textAnchor="end" fill="#9aa0a6" fontSize="11">
                {axisFormat ? axisFormat(tick) : tick}
              </text>
            </g>
          );
        })}
        {hasRightAxis ? (
          <g>
            <line x1={width - margin.right} y1={margin.top} x2={width - margin.right} y2={margin.top + innerHeight} stroke="#e8e8e8" />
            {rightScale.ticks.map((tick) => (
              <text key={`right-${tick}`} x={width - margin.right + 8} y={yAt(tick, 'right') + 4} textAnchor="start" fill="#9aa0a6" fontSize="11">
                {rightAxisFormat ? rightAxisFormat(tick) : tick}
              </text>
            ))}
          </g>
        ) : null}
        <line x1={margin.left} y1={margin.top + innerHeight} x2={width - margin.right} y2={margin.top + innerHeight} stroke="#e8e8e8" />
        {labels.map((label, index) =>
          index % labelStep === 0 ? (
            <text key={`${label}-${index}`} x={xAt(index)} y={chartHeight - 8} textAnchor="middle" fill="#9aa0a6" fontSize="11">
              {label}
            </text>
          ) : null,
        )}
        {paths.map((item) => (item.area ? <path key={`area-${item.key}`} d={item.area} fill={`url(#${gradientBase}-${item.key})`} /> : null))}
        {paths.map((item) => (
          <path key={`line-${item.key}`} d={item.line} fill="none" stroke={item.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        ))}
        {paths.map((item) =>
          item.points.map((point, index) => (
            <circle key={`${item.key}-dot-${index}`} cx={point.x} cy={point.y} r={count > 40 ? 1.8 : 2.5} fill={item.color} />
          )),
        )}
        {hover != null ? (
          <g>
            <line x1={xAt(hover)} y1={margin.top} x2={xAt(hover)} y2={margin.top + innerHeight} stroke="#e0e0e0" strokeDasharray="3 3" />
            {paths.map((item) => (
              <circle key={`hover-${item.key}`} cx={item.points[hover]?.x ?? 0} cy={item.points[hover]?.y ?? 0} r="4.5" fill="#fff" stroke={item.color} strokeWidth="2" />
            ))}
          </g>
        ) : null}
        <rect
          x={margin.left}
          y={margin.top}
          width={innerWidth}
          height={innerHeight}
          fill="transparent"
          onMouseMove={(event) => {
            const bounds = event.currentTarget.getBoundingClientRect();
            const x = event.clientX - bounds.left;
            if (count <= 1) {
              setHover(0);
              return;
            }
            const ratio = Math.min(Math.max((x - margin.left) / innerWidth, 0), 1);
            setHover(Math.round(ratio * (count - 1)));
          }}
          onMouseLeave={() => setHover(null)}
        />
      </svg>
      {hoverPoint ? (
        <div
          className="hd-chart-tip"
          style={{
            left: Math.min(Math.max(hoverPoint.x + 14, 8), width - 190),
            top: Math.max(hoverTop - 18, 4),
          }}
        >
          <div className="hd-chart-tip-title">{labels[hover as number]}</div>
          {rows.map((row, index) => (
            <div className="hd-chart-tip-row" key={`${row.label}-${index}`}>
              <span className="hd-chart-tip-dot" style={{ background: row.color || 'transparent' }} />
              <span>{row.label}</span>
              <strong>{row.value}</strong>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
