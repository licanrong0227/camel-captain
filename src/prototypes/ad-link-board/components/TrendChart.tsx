import React, { useId, useMemo, useRef, useState } from 'react';
import { fmtMonthDay, fmtMoney, fmtRoas } from '../data/format';
import type { TrendPoint } from '../data/types';

const PAD = { left: 62, right: 24, top: 16, bottom: 26 };

function niceCeil(value: number): number {
  if (value <= 0) return 1;
  const exponent = Math.floor(Math.log10(value));
  const base = 10 ** exponent;
  const scaled = value / base;
  const step = scaled <= 1 ? 1 : scaled <= 2 ? 2 : scaled <= 5 ? 5 : 10;
  return step * base;
}

function fmtAxis(value: number): string {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${value.toFixed(0)}`;
}

interface Props {
  points: TrendPoint[];
  compact?: boolean;
  labels?: { a: string; b: string };
}

export function TrendChart(props: Props) {
  const W = props.compact ? 660 : 1200;
  const H = props.compact ? 150 : 156;
  const labels = props.labels ?? { a: '广告消耗', b: '整店 GMV' };
  const gradientId = useId();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const count = props.points.length;

  const maxValue = Math.max(
    ...props.points.map((point) => Math.max(point.adCost, point.storeGmv)),
    0,
  );
  const empty = maxValue <= 0;
  const ceiling = niceCeil(maxValue);

  const xAt = (index: number) => (count <= 1 ? PAD.left + plotW / 2 : PAD.left + (index / (count - 1)) * plotW);
  const yAt = (value: number) => PAD.top + (1 - value / ceiling) * plotH;

  const pathOf = useMemo(
    () => (pick: (point: TrendPoint) => number) =>
      props.points
        .map((point, index) => `${index === 0 ? 'M' : 'L'}${xAt(index).toFixed(2)},${yAt(pick(point)).toFixed(2)}`)
        .join(' '),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.points, ceiling],
  );

  const costPath = pathOf((point) => point.adCost);
  const gmvPath = pathOf((point) => point.storeGmv);
  const areaPath = count && gmvPath ? `${gmvPath} L${xAt(count - 1).toFixed(2)},${PAD.top + plotH} L${xAt(0).toFixed(2)},${PAD.top + plotH} Z` : '';

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

  const ratio = (point: TrendPoint) => (point.storeGmv > 0 ? point.adGmv / point.storeGmv : null);
  const roas = (point: TrendPoint) => (point.adCost > 0 ? point.adGmv / point.adCost : null);

  return (
    <div className="adr-chart" onMouseMove={handleMove} onMouseLeave={() => setHover(null)} data-annotation-id={props.compact ? undefined : "alb-trend"}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="adr-chart__svg" role="img" aria-label="广告消耗与产出走势">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2881FF" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#2881FF" stopOpacity="0" />
          </linearGradient>
        </defs>

        {gridLines.map((line) => (
          <g key={line.y}>
            <line x1={PAD.left} y1={line.y} x2={W - PAD.right} y2={line.y} stroke="#EBEEF5" strokeWidth="1" />
            <text x={PAD.left - 10} y={line.y + 4} textAnchor="end" className="adr-chart__axis">
              {fmtAxis(line.value)}
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
            <path d={gmvPath} fill="none" stroke="#2881FF" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            <path d={costPath} fill="none" stroke="#FF7D29" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          </>
        )}

        {props.points.map((point, index) =>
          index % labelStep === 0 || index === count - 1 ? (
            <text key={point.date} x={xAt(index)} y={H - 8} textAnchor="middle" className="adr-chart__axis">
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
              stroke="#C0C5CF"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <circle cx={xAt(hover)} cy={yAt(hoverPoint.adCost)} r="3.5" fill="#fff" stroke="#FF7D29" strokeWidth="2" />
            <circle cx={xAt(hover)} cy={yAt(hoverPoint.storeGmv)} r="3.5" fill="#fff" stroke="#2881FF" strokeWidth="2" />
          </g>
        ) : null}
      </svg>

      {hover !== null && hoverPoint && !empty ? (
        <div
          className="adr-chart__tip"
          style={{
            left: `${(xAt(hover) / W) * 100}%`,
            top: `${(Math.min(yAt(hoverPoint.adCost), yAt(hoverPoint.storeGmv)) / H) * 100}%`,
          }}
        >
          <div className="adr-chart__tip-date">{hoverPoint.date}</div>
          <div className="adr-chart__tip-row">
            <span className="adr-tip-dot adr-tip-dot--warn" />
            <span>{labels.a}</span>
            <strong>{fmtMoney(hoverPoint.adCost)}</strong>
          </div>
          <div className="adr-chart__tip-row">
            <span className="adr-tip-dot adr-tip-dot--info" />
            <span>{labels.b}</span>
            <strong>{fmtMoney(hoverPoint.storeGmv)}</strong>
          </div>
          <div className="adr-chart__tip-row adr-chart__tip-row--muted">
            <span>广告 GMV</span>
            <span>{fmtMoney(hoverPoint.adGmv)}</span>
          </div>
          <div className="adr-chart__tip-row adr-chart__tip-row--muted">
            <span>占比</span>
            <span>{ratio(hoverPoint) === null ? '-' : `${(ratio(hoverPoint)! * 100).toFixed(1)}%`}</span>
          </div>
          <div className="adr-chart__tip-row adr-chart__tip-row--muted">
            <span>ROAS</span>
            <span>{fmtRoas(roas(hoverPoint))}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
