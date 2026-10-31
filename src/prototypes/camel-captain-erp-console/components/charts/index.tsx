import React, { useEffect, useRef, useState } from 'react';

export interface ChartPoint {
  label: string;
  value: number;
}

function useChartWidth() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(640);
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver((entries) => {
      const next = Math.round(entries[0].contentRect.width);
      if (next > 0) setWidth(next);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return { ref, width };
}

function extent(values: number[], includeZero = true) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const low = includeZero ? Math.min(0, min) : min;
  const high = max === low ? low + 1 : max;
  return { low, high };
}

export function LineChart({
  data,
  height = 220,
  color = '#FF7D29',
  valueFormat = (value: number) => String(Math.round(value)),
  showArea = true,
  secondary,
  secondaryColor = '#2881FF',
  xTickCount = 6,
}: {
  data: ChartPoint[];
  height?: number;
  color?: string;
  valueFormat?: (value: number) => string;
  showArea?: boolean;
  secondary?: ChartPoint[];
  secondaryColor?: string;
  xTickCount?: number;
}) {
  const { ref, width } = useChartWidth();
  const padding = { left: 52, right: 16, top: 14, bottom: 26 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const allValues = [...data.map((point) => point.value), ...(secondary || []).map((point) => point.value)];
  const { low, high } = extent(allValues, false);
  const span = high - low || 1;
  const xOf = (index: number) => padding.left + (data.length <= 1 ? innerWidth / 2 : (index / (data.length - 1)) * innerWidth);
  const yOf = (value: number) => padding.top + innerHeight - ((value - low) / span) * innerHeight;

  const linePath = (points: ChartPoint[]) =>
    points.map((point, index) => `${index === 0 ? 'M' : 'L'}${xOf(index).toFixed(1)},${yOf(point.value).toFixed(1)}`).join(' ');
  const areaPath = `${linePath(data)} L${xOf(data.length - 1).toFixed(1)},${(padding.top + innerHeight).toFixed(1)} L${xOf(0).toFixed(1)},${(padding.top + innerHeight).toFixed(1)} Z`;

  const yTicks = Array.from({ length: 5 }, (_, index) => low + (span / 4) * index);
  const step = Math.max(1, Math.ceil(data.length / xTickCount));

  return (
    <div className="erp-chart" style={{ height }} ref={ref}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="趋势图">
        {yTicks.map((tick) => (
          <g key={tick}>
            <line x1={padding.left} x2={width - padding.right} y1={yOf(tick)} y2={yOf(tick)} stroke="#EBEEF5" strokeDasharray="3 3" />
            <text x={padding.left - 8} y={yOf(tick) + 3} textAnchor="end" fontSize="9" fill="#86909C">
              {valueFormat(tick)}
            </text>
          </g>
        ))}
        {showArea ? <path d={areaPath} fill={color} opacity="0.08" /> : null}
        <path d={linePath(data)} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {secondary ? <path d={linePath(secondary)} fill="none" stroke={secondaryColor} strokeWidth="1.5" strokeDasharray="4 3" /> : null}
        {data.map((point, index) => (
          <g key={`${point.label}-${index}`}>
            <circle cx={xOf(index)} cy={yOf(point.value)} r={index === data.length - 1 ? 3.5 : 2} fill="#fff" stroke={color} strokeWidth="1.5">
              <title>{`${point.label}：${valueFormat(point.value)}`}</title>
            </circle>
          </g>
        ))}
        {data.map((point, index) =>
          index % step === 0 || index === data.length - 1 ? (
            <text key={`x-${point.label}-${index}`} x={xOf(index)} y={height - 8} textAnchor="middle" fontSize="9" fill="#86909C">
              {point.label}
            </text>
          ) : null,
        )}
      </svg>
    </div>
  );
}

export function BarChart({
  data,
  height = 220,
  color = '#FF7D29',
  valueFormat = (value: number) => String(Math.round(value)),
  xTickCount = 8,
}: {
  data: ChartPoint[];
  height?: number;
  color?: string;
  valueFormat?: (value: number) => string;
  xTickCount?: number;
}) {
  const { ref, width } = useChartWidth();
  const padding = { left: 52, right: 16, top: 14, bottom: 26 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const max = Math.max(...data.map((point) => point.value), 1);
  const barWidth = Math.max(2, (innerWidth / Math.max(1, data.length)) * 0.58);
  const step = Math.max(1, Math.ceil(data.length / xTickCount));

  return (
    <div className="erp-chart" style={{ height }} ref={ref}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="柱状图">
        {Array.from({ length: 5 }, (_, index) => {
          const value = (max / 4) * index;
          const y = padding.top + innerHeight - (index / 4) * innerHeight;
          return (
            <g key={index}>
              <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="#EBEEF5" strokeDasharray="3 3" />
              <text x={padding.left - 8} y={y + 3} textAnchor="end" fontSize="9" fill="#86909C">
                {valueFormat(value)}
              </text>
            </g>
          );
        })}
        {data.map((point, index) => {
          const x = padding.left + (innerWidth / data.length) * index + (innerWidth / data.length - barWidth) / 2;
          const barHeight = (point.value / max) * innerHeight;
          return (
            <g key={`${point.label}-${index}`}>
              <rect x={x} y={padding.top + innerHeight - barHeight} width={barWidth} height={barHeight} rx="2" fill={color} opacity={index === data.length - 1 ? 1 : 0.72}>
                <title>{`${point.label}：${valueFormat(point.value)}`}</title>
              </rect>
              {index % step === 0 || index === data.length - 1 ? (
                <text x={x + barWidth / 2} y={height - 8} textAnchor="middle" fontSize="9" fill="#86909C">
                  {point.label}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function Sparkline({ values, width = 92, height = 28, color = '#FF7D29' }: { values: number[]; width?: number; height?: number; color?: string }) {
  if (values.length < 2) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const points = values.map((value, index) => {
    const x = (index / (values.length - 1)) * width;
    const y = height - 2 - ((value - min) / span) * (height - 4);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <polyline points={points.join(' ')} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function Gauge({ value, max = 100, size = 120 }: { value: number; max?: number; size?: number }) {
  const ratio = Math.max(0, Math.min(1, value / max));
  const radius = size / 2 - 8;
  const circumference = Math.PI * radius;
  return (
    <svg width={size} height={size / 2 + 10} viewBox={`0 0 ${size} ${size / 2 + 10}`} aria-label={`得分 ${value}`}>
      <path d={`M8,${size / 2} A${radius},${radius} 0 0 1 ${size - 8},${size / 2}`} fill="none" stroke="#F2F3F5" strokeWidth="8" strokeLinecap="round" />
      <path
        d={`M8,${size / 2} A${radius},${radius} 0 0 1 ${size - 8},${size / 2}`}
        fill="none"
        stroke="#FF7D29"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${circumference * ratio} ${circumference}`}
      />
      <text x={size / 2} y={size / 2 - 4} textAnchor="middle" fontSize="20" fontWeight="500" fill="#1D2129">
        {Math.round(value)}
      </text>
    </svg>
  );
}
