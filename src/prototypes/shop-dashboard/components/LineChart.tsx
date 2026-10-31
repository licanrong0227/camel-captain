import React, { useEffect, useId, useRef, useState } from 'react';

export interface ChartSeries {
  key: string;
  label: string;
  color: string;
  values: number[];
  area?: boolean;
}

export interface ChartTooltipRow {
  label: string;
  value: string;
  color?: string;
  muted?: boolean;
}

interface LineChartProps {
  dates: string[];
  series: ChartSeries[];
  height?: number;
  formatValue: (value: number) => string;
  axisFormat?: (value: number) => string;
  xFormat?: (date: string) => string;
  tooltipRows?: (index: number) => ChartTooltipRow[];
  ariaLabel?: string;
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
  for (let i = 0; i < count - 1; i += 1) {
    h[i] = Math.max(points[i + 1].x - points[i].x, 0.0001);
    delta[i] = (points[i + 1].y - points[i].y) / h[i];
  }

  const tangents: number[] = new Array(count).fill(0);
  tangents[0] = delta[0];
  tangents[count - 1] = delta[count - 2];
  for (let i = 1; i < count - 1; i += 1) {
    tangents[i] = delta[i - 1] * delta[i] <= 0 ? 0 : (delta[i - 1] + delta[i]) / 2;
  }

  for (let i = 0; i < count - 1; i += 1) {
    if (delta[i] === 0) {
      tangents[i] = 0;
      tangents[i + 1] = 0;
      continue;
    }
    const a = tangents[i] / delta[i];
    const b = tangents[i + 1] / delta[i];
    const sum = a * a + b * b;
    if (sum > 9) {
      const scale = 3 / Math.sqrt(sum);
      tangents[i] = scale * a * delta[i];
      tangents[i + 1] = scale * b * delta[i];
    }
  }

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < count - 1; i += 1) {
    const cp1x = points[i].x + h[i] / 3;
    const cp1y = points[i].y + (tangents[i] * h[i]) / 3;
    const cp2x = points[i + 1].x - h[i] / 3;
    const cp2y = points[i + 1].y - (tangents[i + 1] * h[i]) / 3;
    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${points[i + 1].x.toFixed(2)} ${points[i + 1].y.toFixed(2)}`;
  }
  return d;
}

function niceStep(max: number): number {
  if (max <= 0) return 0.2;
  const rough = max / 6;
  const power = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / power;
  const factor = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
  return factor * power;
}

export function LineChart({
  dates,
  series,
  height = 320,
  formatValue,
  axisFormat,
  xFormat,
  tooltipRows,
  ariaLabel,
}: LineChartProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(800);
  const [hover, setHover] = useState<number | null>(null);
  const gradientBase = useId().replace(/[:]/g, '');
  const margin = { top: 30, left: 50, right: 30, bottom: 30 };
  const innerWidth = Math.max(width - margin.left - margin.right, 10);
  const innerHeight = Math.max(height - margin.top - margin.bottom, 10);
  const count = dates.length;
  const allValues = series.flatMap((item) => item.values);
  const rawMax = allValues.length ? Math.max(...allValues, 0) : 0;
  const step = niceStep(rawMax);
  const tickMax = rawMax <= 0 ? 1 : Math.ceil(rawMax / step) * step;
  const ticks: number[] = [];
  for (let value = 0; value <= tickMax + step / 1000; value += step) ticks.push(Number(value.toFixed(4)));
  if (ticks[ticks.length - 1] < tickMax) ticks.push(tickMax);

  const xAt = (index: number) => (count <= 1 ? margin.left + innerWidth / 2 : margin.left + (innerWidth * index) / (count - 1));
  const yAt = (value: number) => margin.top + innerHeight * (1 - (tickMax === 0 ? 0 : value / tickMax));
  const labelCount = Math.max(6, Math.floor(width / 70));
  const labelStep = Math.max(1, Math.ceil(count / labelCount));

  useEffect(() => {
    const node = wrapRef.current;
    if (!node) return undefined;
    const update = () => setWidth(Math.max(node.clientWidth, 240));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const paths = series.map((item) => {
    const points = item.values.map((value, index) => ({ x: xAt(index), y: yAt(value) }));
    const line = monotonePath(points);
    const area = item.area && points.length
      ? `${line} L ${points[points.length - 1].x.toFixed(2)} ${(margin.top + innerHeight).toFixed(2)} L ${points[0].x.toFixed(2)} ${(margin.top + innerHeight).toFixed(2)} Z`
      : '';
    return { ...item, points, line, area };
  });

  const hoverRows: ChartTooltipRow[] = hover != null
    ? tooltipRows
      ? tooltipRows(hover)
      : series.map((item) => ({ label: item.label, value: formatValue(item.values[hover] || 0), color: item.color }))
    : [];
  const hoverPoint = hover != null ? paths[0]?.points[hover] : null;
  const hoverTop = hover != null
    ? Math.min(...paths.map((item) => item.points[hover]?.y ?? height))
    : 0;

  const onMove = (event: React.MouseEvent<SVGRectElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    if (count <= 1) {
      setHover(0);
      return;
    }
    const ratio = Math.min(Math.max((x - margin.left) / innerWidth, 0), 1);
    setHover(Math.round(ratio * (count - 1)));
  };

  return (
    <div className="ss-chart" ref={wrapRef} style={{ height }}>
      <svg width={width} height={height} role="img" aria-label={ariaLabel || series[0]?.label || '趋势图'}>
        <defs>
          {series.map((item) => (
            <linearGradient key={item.key} id={`${gradientBase}-${item.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={item.color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={item.color} stopOpacity="0.02" />
            </linearGradient>
          ))}
        </defs>
        {ticks.map((tick) => {
          const y = yAt(tick);
          return (
            <g key={tick}>
              <line x1={margin.left} y1={y} x2={width - margin.right} y2={y} stroke="#f0f0f0" strokeDasharray="4 4" />
              <text x={margin.left - 8} y={y + 4} textAnchor="end" fill="#999" fontSize="11">
                {axisFormat ? axisFormat(tick) : tick}
              </text>
            </g>
          );
        })}
        <line x1={margin.left} y1={margin.top + innerHeight} x2={width - margin.right} y2={margin.top + innerHeight} stroke="#e8e8e8" />
        {dates.map((date, index) =>
          index % labelStep === 0 ? (
            <text key={`${date}-${index}`} x={xAt(index)} y={height - 10} textAnchor="middle" fill="#999" fontSize="11">
              {xFormat ? xFormat(date) : date}
            </text>
          ) : null,
        )}
        {paths.map((item) => (item.area ? <path key={`area-${item.key}`} d={item.area} fill={`url(#${gradientBase}-${item.key})`} /> : null))}
        {paths.map((item) => (
          <path key={`line-${item.key}`} d={item.line} fill="none" stroke={item.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        ))}
        {paths.map((item) =>
          item.points.map((point, index) => <circle key={`${item.key}-dot-${index}`} cx={point.x} cy={point.y} r="2.5" fill={item.color} />),
        )}
        {hover != null ? (
          <g>
            <line x1={xAt(hover)} y1={margin.top} x2={xAt(hover)} y2={margin.top + innerHeight} stroke="#e0e0e0" strokeDasharray="3 3" />
            {paths.map((item) => (
              <circle key={`hover-${item.key}`} cx={item.points[hover]?.x ?? 0} cy={item.points[hover]?.y ?? 0} r="4.5" fill="#fff" stroke={item.color} strokeWidth="2" />
            ))}
          </g>
        ) : null}
        <rect x={margin.left} y={margin.top} width={innerWidth} height={innerHeight} fill="transparent" onMouseMove={onMove} onMouseLeave={() => setHover(null)} />
      </svg>
      {hoverPoint ? (
        <div
          className="ss-chart-tip"
          style={{
            left: Math.min(Math.max(hoverPoint.x + 14, 8), width - 180),
            top: Math.max(hoverTop - 18, 4),
          }}
        >
          <div className="ss-chart-tip-date">{dates[hover as number]}</div>
          {hoverRows.map((row, index) => (
            <div className={`ss-chart-tip-row${row.muted ? ' is-muted' : ''}`} key={`${row.label}-${index}`}>
              <span className="ss-chart-tip-dot" style={{ background: row.color || 'transparent' }} />
              <span>{row.label}</span>
              <strong>{row.value}</strong>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
