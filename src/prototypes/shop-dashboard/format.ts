import type { MetricType, Period } from './data';

export function formatMoney(value: number | undefined | null): string {
  return `$${Number(value || 0).toFixed(2)}`;
}

export function formatRate(value: number | undefined | null): string {
  return `${(Number(value || 0) * 100).toFixed(2)}%`;
}

export function formatCount(value: number | undefined | null): string {
  return String(Math.round(Number(value || 0)));
}

export function formatMetric(type: MetricType, value: number | undefined | null): string {
  if (type === 'money') return formatMoney(value);
  if (type === 'rate') return formatRate(value);
  return formatCount(value);
}

export function formatChartValue(type: MetricType, value: number | undefined | null): number {
  const num = Number(value || 0);
  if (type === 'rate') return Number((num * 100).toFixed(4));
  return num;
}

export function formatTooltip(type: MetricType, value: number | undefined | null): string {
  const num = Number(value || 0);
  if (type === 'rate') return `${num.toFixed(2)}%`;
  if (type === 'money') return `$${num.toFixed(2)}`;
  return String(Math.round(num));
}

function parts(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export function parseDate(value: string): Date | null {
  const seg = String(value || '').split('-').map(Number);
  if (seg.length < 3 || seg.some((n) => Number.isNaN(n))) return null;
  return new Date(seg[0], seg[1] - 1, seg[2]);
}

export function periodRange(statDate: string, period: Period): string {
  const start = parseDate(statDate);
  if (!start) return '';
  const span = period === 'L30' ? 30 : period === 'L7' ? 7 : 1;
  const from = new Date(start);
  from.setDate(from.getDate() - (span - 1));
  return `${parts(from)} ~ ${parts(start)}`;
}

export interface SparklineInput {
  statDate: string;
  confirmGmv: number;
}

export function sparklinePoints(history: SparklineInput[] | undefined, width = 72, height = 28, padding = 3): string {
  const list = Array.isArray(history) ? history.slice().sort((a, b) => Number(new Date(a.statDate)) - Number(new Date(b.statDate))) : [];
  const top = padding;
  const bottom = height - padding;
  if (!list.length) return `0,${bottom} ${width},${bottom}`;
  const values = list.map((item) => Number(item.confirmGmv) || 0);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const inner = height - 2 * padding;
  const stepX = values.length <= 1 ? 0 : width / (values.length - 1);
  return values
    .map((value, index) => {
      const x = values.length <= 1 ? width / 2 : index * stepX;
      const y = range === 0 ? bottom : top + inner * (1 - (value - min) / range);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
}

export function shortenMoney(value: number): string {
  if (Math.abs(value) >= 10000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${Number(value || 0).toFixed(2)}`;
}
