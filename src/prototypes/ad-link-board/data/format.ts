export function fmtMoney(value: number, digits = 2): string {
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);
  const fixed = abs.toFixed(digits);
  const [whole, decimal] = fixed.split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${sign}$${grouped}${decimal ? `.${decimal}` : ''}`;
}

export function fmtMoneyCompact(value: number): string {
  if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${value.toFixed(0)}`;
}

export function fmtInt(value: number): string {
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
  const pct = `${Math.abs(value * 100).toFixed(1)}%`;
  if (Math.abs(value) < 0.0005) return '持平';
  return `${value > 0 ? '↑' : '↓'} ${pct}`;
}

export function fmtDateSlash(value: string): string {
  return value.replace(/-/g, '/');
}

export function fmtMonthDay(value: string): string {
  return value.slice(5).replace('-', '/');
}

export function fmtMetricByKind(kind: 'money' | 'int' | 'roas' | 'pct', value: number | null): string {
  if (kind === 'money') return value === null ? '-' : fmtMoney(value);
  if (kind === 'int') return value === null ? '-' : fmtInt(value);
  if (kind === 'roas') return fmtRoas(value);
  return fmtPct(value);
}

/** 百分点差：用于占比类指标环比 */
export function fmtPoints(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return '-';
  if (Math.abs(value) < 0.0005) return '持平';
  const pct = (Math.abs(value) * 100).toFixed(1);
  return `${value > 0 ? '↑' : '↓'} ${pct} 个百分点`;
}

/** 相对变化：用于金额 / 次数 / ROAS 环比 */
export function fmtRelative(value: number | null): string {
  return fmtDelta(value);
}
