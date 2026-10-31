import React, { useMemo, useState } from 'react';
import { fmtMoney, type AdExclusionConfig } from '../ad-report';
import { aggregateItemRows, buildItemDaily, type ItemAdRow } from '../item-ad-data';
import { sparklinePoints } from '../format';

type ItemSortKey = 'adCost' | 'adGmv' | 'linkGmv' | 'adRatio' | 'roas';

const SORT_HEADERS: Array<{ key: ItemSortKey; label: string }> = [
  { key: 'adCost', label: '广告消耗' },
  { key: 'adGmv', label: '广告 GMV' },
  { key: 'linkGmv', label: '链接产出 GMV' },
  { key: 'adRatio', label: '广告 GMV 占比' },
  { key: 'roas', label: 'ROAS' },
];

function pct(value: number | null): string {
  return value === null || !Number.isFinite(value) ? '-' : `${(value * 100).toFixed(1)}%`;
}

function roas(value: number | null): string {
  return value === null || !Number.isFinite(value) ? '-' : `${value.toFixed(2)}x`;
}

export function StoreItemTable({
  storeId,
  from,
  to,
  excludeEnabled,
  configs,
  tableWidth,
  onOpenTrend,
}: {
  storeId: number;
  from: string;
  to: string;
  excludeEnabled: boolean;
  configs: AdExclusionConfig[];
  tableWidth: number;
  onOpenTrend: (row: ItemAdRow) => void;
}) {
  const [sort, setSort] = useState<{ key: ItemSortKey; order: 'asc' | 'desc' } | null>(null);
  const daily = useMemo(
    () => buildItemDaily(storeId, from, to, excludeEnabled, configs),
    [storeId, from, to, excludeEnabled, configs],
  );
  const rows = useMemo(() => aggregateItemRows(storeId, daily), [storeId, daily]);
  const sparks = useMemo(() => {
    const byItem = new Map<string, Array<{ statDate: string; confirmGmv: number }>>();
    daily.forEach((point) => {
      const list = byItem.get(point.itemCode) || [];
      list.push({ statDate: point.date, confirmGmv: point.adCost });
      byItem.set(point.itemCode, list);
    });
    const result: Record<string, string> = {};
    byItem.forEach((list, itemCode) => {
      result[itemCode] = sparklinePoints(list);
    });
    return result;
  }, [daily]);

  const sortedRows = useMemo(() => {
    if (!sort) return rows;
    const direction = sort.order === 'asc' ? 1 : -1;
    const valueOf = (row: ItemAdRow) => {
      if (!row.hasAd && (sort.key === 'adCost' || sort.key === 'adGmv')) return null;
      return row[sort.key];
    };
    return rows.slice().sort((a, b) => {
      const left = valueOf(a);
      const right = valueOf(b);
      if (left === null && right === null) return 0;
      if (left === null) return 1;
      if (right === null) return -1;
      return (left - right) * direction;
    });
  }, [rows, sort]);

  const onSort = (key: ItemSortKey) => {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, order: 'asc' };
      if (prev.order === 'asc') return { key, order: 'desc' };
      return null;
    });
  };

  const sortCaret = (key: ItemSortKey) => (
    <span className="ss-sort-caret">
      <i className={`ss-caret-up${sort && sort.key === key && sort.order === 'asc' ? ' is-active' : ''}`} />
      <i className={`ss-caret-down${sort && sort.key === key && sort.order === 'desc' ? ' is-active' : ''}`} />
    </span>
  );

  const handleExport = () => {
    const header = ['商品ID', '商品名称', '类目', '广告消耗', '广告 GMV', '链接产出 GMV', '广告 GMV 占比', 'ROAS'];
    const esc = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
    const lines = sortedRows.map((row) => [
      row.itemCode,
      row.itemName,
      row.categoryName,
      row.hasAd ? fmtMoney(row.adCost) : '-',
      row.hasAd ? fmtMoney(row.adGmv) : '-',
      fmtMoney(row.linkGmv),
      pct(row.adRatio),
      roas(row.roas),
    ]);
    const csv = [header, ...lines].map((line) => line.map(esc).join(',')).join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `商品广告数据-${storeId}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!rows.length) {
    return <div className="ss-item-panel ss-item-panel--empty">该店铺暂未接入广告商品数据</div>;
  }

  const innerWidth = Math.max(tableWidth, 900);
  const metricWidth = Math.max((innerWidth - 530) / 5, 80);

  return (
    <div className="ss-item-panel" data-annotation-id="ssd-item-panel">
      <div className="ss-item-panel-head">
        <span className="ss-item-panel-title">商品广告数据</span>
        <span className="ss-item-panel-note">共 {rows.length} 个商品</span>
        <button type="button" className="ss-btn ss-btn--default ss-btn--small ss-item-export" onClick={handleExport}>导出</button>
      </div>
      <table className="ss-item-table" style={{ width: innerWidth }}>
        <colgroup>
          <col style={{ width: 20 }} />
          <col style={{ width: 390 }} />
          <col style={{ width: 120 }} />
          <col style={{ width: metricWidth }} />
          <col style={{ width: metricWidth }} />
          <col style={{ width: metricWidth }} />
          <col style={{ width: metricWidth }} />
          <col style={{ width: metricWidth - 20 }} />
          <col style={{ width: 20 }} />
        </colgroup>
        <thead>
          <tr>
            <th className="ss-item-spacer" />
            <th>商品</th>
            <th className="is-center">广告数据趋势图</th>
            {SORT_HEADERS.map((item) => (
              <th key={item.key} className="is-sortable" onClick={() => onSort(item.key)}>
                <span className="ss-th-inner">
                  {item.label}
                  {sortCaret(item.key)}
                </span>
              </th>
            ))}
            <th className="ss-item-spacer" />
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row) => (
            <tr key={row.itemCode}>
              <td className="ss-item-spacer" />
              <td>
                <div className="ss-item-prod">
                  {row.imgUrl ? (
                    <img className="ss-item-thumb" src={row.imgUrl} alt="" loading="eager" />
                  ) : (
                    <span className="ss-item-thumb ss-item-thumb--empty">无图</span>
                  )}
                  <span className="ss-item-meta">
                    <span className="ss-item-title" title={row.itemName}>{row.itemName}</span>
                    <span className="ss-item-sub">
                      {row.itemCode} · {row.categoryName}
                    </span>
                  </span>
                </div>
              </td>
              <td className="is-center">
                <svg
                  className="ss-sparkline"
                  viewBox="0 0 72 28"
                  width="72"
                  height="28"
                  preserveAspectRatio="none"
                  onClick={() => onOpenTrend(row)}
                >
                  <polyline
                    fill="none"
                    stroke="#FF7D29"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    points={sparks[row.itemCode] || ''}
                  />
                </svg>
              </td>
              <td>{row.hasAd ? fmtMoney(row.adCost) : '-'}</td>
              <td>{row.hasAd ? fmtMoney(row.adGmv) : '-'}</td>
              <td>{fmtMoney(row.linkGmv)}</td>
              <td>{pct(row.adRatio)}</td>
              <td className={row.roas !== null && row.roas < 1 ? 'is-bad' : ''}>{roas(row.roas)}</td>
              <td className="ss-item-spacer" />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
