export function fmtMoney(value: number | null, digits = 2): string {
  if (value === null || !Number.isFinite(value)) return '-';
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);
  const fixed = abs.toFixed(digits);
  const [whole, decimal] = fixed.split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${sign}$${grouped}${decimal ? `.${decimal}` : ''}`;
}

export function fmtInt(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return '-';
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function fmtPct(value: number | null, digits = 2): string {
  if (value === null || !Number.isFinite(value)) return '-';
  return `${(value * 100).toFixed(digits)}%`;
}

export function fmtRoas(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return '-';
  return `${value.toFixed(2)}x`;
}

export function fmtDelta(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return '-';
  if (Math.abs(value) < 0.0005) return '持平';
  return `${value > 0 ? '+' : ''}${(value * 100).toFixed(1)}%`;
}

export function fmtAxis(value: number): string {
  if (Math.abs(value) >= 1000000) return `${(value / 1000000).toFixed(1)}m`;
  if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return String(Math.round(value));
}

export function fmtMoneyAxis(value: number): string {
  if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${Math.round(value)}`;
}

export function fmtDateSlash(value: string): string {
  return value.replace(/-/g, '/');
}

export function fmtMonthDay(value: string): string {
  return value.slice(5).replace('-', '/');
}

export function fmtMetric(kind: 'money' | 'count' | 'rate', value: number | null): string {
  if (kind === 'money') return fmtMoney(value);
  if (kind === 'count') return fmtInt(value);
  return fmtPct(value);
}
