import React, { useId, useMemo, useRef, useState } from 'react';
import { fmtInt, fmtMoney, fmtMoneyCompact, fmtMonthDay, fmtRoas } from '../data/format';
import type { TrendMetric, TrendPoint } from '../data/types';

const PAD = { left: 58, right: 22, top: 12, bottom: 24 };

const METRIC_LABEL: Record<TrendMetric, string> = {
  cost: '广告花费',
  gmv: '广告 GMV',
  orders: '订单数',
  click: '点击量',
  roas: 'ROAS',
};

function pickValue(point: TrendPoint, metric: TrendMetric): number {
  const raw = point[metric];
  return raw === null || !Number.isFinite(raw) ? 0 : raw;
}

function axisFormat(metric: TrendMetric, value: number): string {
  if (metric === 'cost' || metric === 'gmv') return fmtMoneyCompact(value);
  if (metric === 'roas') return `${value.toFixed(1)}x`;
  return fmtInt(value);
}

function tipFormat(metric: TrendMetric, value: number): string {
  if (metric === 'cost' || metric === 'gmv') return fmtMoney(value);
  if (metric === 'roas') return fmtRoas(value);
  return fmtInt(value);
}

function niceCeil(value: number): number {
  if (value <= 0) return 1;
  const exponent = Math.floor(Math.log10(value));
  const base = 10 ** exponent;
  const scaled = value / base;
  const step = scaled <= 1 ? 1 : scaled <= 2 ? 2 : scaled <= 5 ? 5 : 10;
  return step * base;
}

interface Props {
  points: TrendPoint[];
  metric: TrendMetric;
  compact?: boolean;
}

export function TrendChart(props: Props) {
  const W = props.compact ? 660 : 1200;
  const H = props.compact ? 140 : 150;
  const gradientId = useId();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const values = props.points.map((point) => pickValue(point, props.metric));
  const maxValue = Math.max(...values, 0);
  const empty = maxValue <= 0;
  const ceiling = niceCeil(maxValue);

  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const count = props.points.length;

  const xAt = (index: number) => (count <= 1 ? PAD.left + plotW / 2 : PAD.left + (index / (count - 1)) * plotW);
  const yAt = (value: number) => PAD.top + (1 - value / ceiling) * plotH;

  const linePath = useMemo(() => {
    if (!count) return '';
    return props.points
      .map((point, index) => `${index === 0 ? 'M' : 'L'}${xAt(index).toFixed(2)},${yAt(pickValue(point, props.metric)).toFixed(2)}`)
      .join(' ');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.points, props.metric, ceiling]);

  const areaPath = useMemo(() => {
    if (!count || !linePath) return '';
    return `${linePath} L${xAt(count - 1).toFixed(2)},${PAD.top + plotH} L${xAt(0).toFixed(2)},${PAD.top + plotH} Z`;
  }, [linePath, count]);

  const gridLines = [0, 1, 2, 3].map((step) => {
    const value = (ceiling / 3) * step;
    return { y: yAt(value), value };
  });

  const labelStep = Math.max(1, Math.ceil(count / 8));
  const hoverPoint = hover !== null ? props.points[hover] : null;

  const handleMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const svg = svgRef.current;
    if (!svg || count === 0) return;
    const rect = svg.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    const viewX = ratio * W;
    const plotRatio = Math.min(1, Math.max(0, (viewX - PAD.left) / plotW));
    setHover(Math.round(plotRatio * (count - 1)));
  };

  return (
    <div className="adr-chart" onMouseMove={handleMove} onMouseLeave={() => setHover(null)} data-annotation-id="adr-trend">
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="adr-chart__svg" role="img" aria-label={`${METRIC_LABEL[props.metric]}按天走势`}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF7D29" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#FF7D29" stopOpacity="0" />
          </linearGradient>
        </defs>

        {gridLines.map((line) => (
          <g key={line.y}>
            <line x1={PAD.left} y1={line.y} x2={W - PAD.right} y2={line.y} stroke="#EBEEF5" strokeWidth="1" />
            <text x={PAD.left - 10} y={line.y + 4} textAnchor="end" className="adr-chart__axis">
              {axisFormat(props.metric, line.value)}
            </text>
          </g>
        ))}

        {empty ? (
          <text x={W / 2} y={PAD.top + plotH / 2} textAnchor="middle" className="adr-chart__empty">
            所选区间暂无数据
          </text>
        ) : (
          <>
            <path d={areaPath} fill={`url(#${gradientId})`} />
            <path d={linePath} fill="none" stroke="#FF7D29" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            {count <= 1 ? <circle cx={xAt(0)} cy={yAt(values[0])} r="3.4" fill="#FF7D29" /> : null}
          </>
        )}

        {props.points.map((point, index) =>
          index % labelStep === 0 || index === count - 1 ? (
            <text key={point.date} x={xAt(index)} y={H - 10} textAnchor="middle" className="adr-chart__axis">
              {fmtMonthDay(point.date)}
            </text>
          ) : null,
        )}

        {hover !== null && hoverPoint && !empty ? (
          <g>
            <line
              x1={xAt(hover)}
              y1={PAD.top}
              x2={xAt(hover)}
              y2={PAD.top + plotH}
              stroke="#FF7D29"
              strokeWidth="1"
              strokeDasharray="3 3"
              opacity="0.6"
            />
            <circle cx={xAt(hover)} cy={yAt(pickValue(hoverPoint, props.metric))} r="4" fill="#fff" stroke="#FF7D29" strokeWidth="2" />
          </g>
        ) : null}
      </svg>

      {hover !== null && hoverPoint && !empty ? (
        <div
          className="adr-chart__tip"
          style={{ left: `${(xAt(hover) / W) * 100}%`, top: `${(yAt(pickValue(hoverPoint, props.metric)) / H) * 100}%` }}
        >
          <div className="adr-chart__tip-date">{hoverPoint.date}</div>
          <div className="adr-chart__tip-row">
            <span>{METRIC_LABEL[props.metric]}</span>
            <strong>{tipFormat(props.metric, pickValue(hoverPoint, props.metric))}</strong>
          </div>
          <div className="adr-chart__tip-row adr-chart__tip-row--muted">
            <span>订单数</span>
            <span>{fmtInt(hoverPoint.orders)}</span>
          </div>
          <div className="adr-chart__tip-row adr-chart__tip-row--muted">
            <span>花费</span>
            <span>{fmtMoney(hoverPoint.cost)}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export { METRIC_LABEL };
