import React, { useEffect, useMemo, useRef, useState } from 'react';

export type TrendPoint = { date: string; sales: number; goodsCount: number };
export type TrendPeriod = 'm1' | 'm3' | 'm6';

type Props = {
  points: TrendPoint[];
  period: TrendPeriod;
};

const ORANGE = '#ff8a3d';
const BLUE = '#5b8ff9';

function niceStep(max: number, target: number) {
  if (max <= 0) return 1;
  const raw = max / target;
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / pow;
  const candidates = [1, 2, 3, 2.5, 4, 5, 6, 8, 10];
  const picked = candidates.find((item) => item >= n) || 10;
  return picked * pow;
}

function buildAxis(max: number, target: number) {
  const step = niceStep(max, target);
  const axisMax = Math.max(step, Math.ceil(max / step) * step);
  const ticks: number[] = [];
  for (let value = 0; value <= axisMax + step * 0.001; value += step) {
    ticks.push(Number(value.toFixed(6)));
  }
  return { max: axisMax, ticks };
}

function labelOf(point: TrendPoint, period: TrendPeriod) {
  if (period === 'm6') return `${Number(point.date.slice(5, 7))}月`;
  const month = Number(point.date.slice(5, 7));
  const day = Number(point.date.slice(8, 10));
  return `${month}/${day}`;
}

function formatNumber(value: number) {
  return value.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

export function TrendChart({ points, period }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setSize({ width: Math.max(0, rect.width), height: Math.max(0, rect.height) });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const chart = useMemo(() => {
    const width = size.width;
    const height = size.height;
    if (width < 80 || height < 60 || points.length === 0) return null;

    const margin = { left: 50, right: 52, top: 32, bottom: 26 };
    const plotLeft = margin.left;
    const plotRight = width - margin.right;
    const plotTop = margin.top;
    const plotBottom = height - margin.bottom;
    const plotWidth = Math.max(10, plotRight - plotLeft);
    const plotHeight = Math.max(10, plotBottom - plotTop);

    const salesAxis = buildAxis(Math.max(...points.map((item) => item.sales), 1), 6);
    const goodsAxis = buildAxis(
      Math.max(...points.map((item) => item.goodsCount), 1),
      period === 'm3' ? 6 : 7,
    );

    const stepX = points.length > 1 ? plotWidth / (points.length - 1) : 0;
    const xOf = (index: number) => plotLeft + stepX * index;
    const ySales = (value: number) => plotBottom - (value / salesAxis.max) * plotHeight;
    const yGoods = (value: number) => plotBottom - (value / goodsAxis.max) * plotHeight;

    const salesLine = points.map((item, index) => `${index === 0 ? 'M' : 'L'}${xOf(index).toFixed(2)},${ySales(item.sales).toFixed(2)}`).join(' ');
    const goodsLine = points.map((item, index) => `${index === 0 ? 'M' : 'L'}${xOf(index).toFixed(2)},${yGoods(item.goodsCount).toFixed(2)}`).join(' ');
    const salesArea = `${salesLine} L${xOf(points.length - 1).toFixed(2)},${plotBottom} L${xOf(0).toFixed(2)},${plotBottom} Z`;
    const goodsArea = `${goodsLine} L${xOf(points.length - 1).toFixed(2)},${plotBottom} L${xOf(0).toFixed(2)},${plotBottom} Z`;

    const labelStep = points.length > 20 ? 2 : 1;
    const xLabels = points
      .map((item, index) => ({ index, label: labelOf(item, period), x: xOf(index) }))
      .filter((item) => item.index % labelStep === 0);

    return {
      width,
      height,
      plotLeft,
      plotRight,
      plotTop,
      plotBottom,
      stepX,
      salesAxis,
      goodsAxis,
      salesLine,
      goodsLine,
      salesArea,
      goodsArea,
      xLabels,
      xOf,
      ySales,
      yGoods,
    };
  }, [points, period, size]);

  const hovered = hover !== null && points[hover] ? points[hover] : null;

  const tooltipStyle = useMemo(() => {
    if (!chart || hover === null) return undefined;
    const x = chart.xOf(hover);
    const y = Math.max(chart.ySales(points[hover].sales), chart.yGoods(points[hover].goodsCount));
    const left = x + 14 + 150 > chart.width ? x - 164 : x + 14;
    const top = Math.min(Math.max(y - 76, 8), Math.max(8, chart.height - 105));
    return { left, top };
  }, [chart, hover, points]);

  return (
    <div className="hd-chart" ref={wrapRef}>
      {chart ? (
        <svg
          width={chart.width}
          height={chart.height}
          viewBox={`0 0 ${chart.width} ${chart.height}`}
          onMouseMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const pointerX = event.clientX - rect.left;
            const rawIndex = chart.stepX > 0 ? Math.round((pointerX - chart.plotLeft) / chart.stepX) : 0;
            const index = Math.min(points.length - 1, Math.max(0, rawIndex));
            setHover(index);
          }}
          onMouseLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id="hd-sales-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,138,61,0.30)" />
              <stop offset="100%" stopColor="rgba(255,138,61,0.02)" />
            </linearGradient>
            <linearGradient id="hd-goods-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(91,143,249,0.28)" />
              <stop offset="100%" stopColor="rgba(91,143,249,0.02)" />
            </linearGradient>
          </defs>

          {chart.salesAxis.ticks.map((tick) => {
            const y = chart.ySales(tick);
            return (
              <g key={`grid-${tick}`}>
                <line
                  x1={chart.plotLeft}
                  x2={chart.plotRight}
                  y1={y}
                  y2={y}
                  stroke="#e5e6eb"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text x={chart.plotLeft - 10} y={y + 3.5} textAnchor="end" fontSize="11" fill="#86909c">
                  {formatNumber(tick)}
                </text>
              </g>
            );
          })}

          {chart.goodsAxis.ticks.map((tick) => {
            const y = chart.yGoods(tick);
            return (
              <text key={`goods-${tick}`} x={chart.plotRight + 10} y={y + 3.5} textAnchor="start" fontSize="11" fill="#86909c">
                {formatNumber(tick)}
              </text>
            );
          })}

          <text x={0} y={10} fontSize="11" fill="#86909c">
            销售额
          </text>
          <text x={chart.width} y={10} textAnchor="end" fontSize="11" fill="#86909c">
            销量
          </text>

          <g transform={`translate(${chart.width / 2 - 62}, 0)`}>
            <rect x="0" y="4" width="8" height="8" rx="2" fill={ORANGE} />
            <text x="14" y="12" fontSize="12" fill="#606266">
              销售额
            </text>
            <rect x="66" y="4" width="8" height="8" rx="2" fill={BLUE} />
            <text x="80" y="12" fontSize="12" fill="#606266">
              销量
            </text>
          </g>

          <path d={chart.salesArea} fill="url(#hd-sales-fill)" />
          <path d={chart.goodsArea} fill="url(#hd-goods-fill)" />
          <path d={chart.salesLine} fill="none" stroke={ORANGE} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          <path d={chart.goodsLine} fill="none" stroke={BLUE} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

          {hover !== null ? (
            <line
              x1={chart.xOf(hover)}
              x2={chart.xOf(hover)}
              y1={chart.plotTop - 8}
              y2={chart.plotBottom}
              stroke="#c0c4cc"
              strokeWidth="1"
            />
          ) : null}

          {points.map((item, index) => (
            <g key={`point-${item.date}`}>
              <circle cx={chart.xOf(index)} cy={chart.ySales(item.sales)} r={hover === index ? 4 : 2.4} fill={ORANGE} stroke="#fff" strokeWidth={hover === index ? 1.5 : 0} />
              <circle cx={chart.xOf(index)} cy={chart.yGoods(item.goodsCount)} r={hover === index ? 4 : 2.4} fill={BLUE} stroke="#fff" strokeWidth={hover === index ? 1.5 : 0} />
            </g>
          ))}

          {chart.xLabels.map((item) => (
            <text key={`x-${item.index}`} x={item.x} y={chart.height - 6} textAnchor="middle" fontSize="11" fill="#86909c">
              {item.label}
            </text>
          ))}
        </svg>
      ) : null}

      {chart && hovered && tooltipStyle ? (
        <div className="hd-chart-tip" style={tooltipStyle}>
          <div className="hd-chart-tip-title">{labelOf(hovered, period)}</div>
          <div className="hd-chart-tip-row">
            <span className="hd-chart-tip-dot" style={{ background: ORANGE }} />
            <span>销售额: {formatNumber(hovered.sales)}</span>
          </div>
          <div className="hd-chart-tip-row">
            <span className="hd-chart-tip-dot" style={{ background: BLUE }} />
            <span>销量: {formatNumber(hovered.goodsCount)}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
