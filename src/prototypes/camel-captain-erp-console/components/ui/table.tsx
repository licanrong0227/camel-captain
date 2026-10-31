import React, { useMemo } from 'react';
import { ErpCheckbox, ErpEmpty } from './core';

export interface ErpColumn<T> {
  key: string;
  title: React.ReactNode;
  width?: number;
  minWidth?: number;
  align?: 'left' | 'center' | 'right';
  render?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  fixed?: 'right';
  className?: string;
  headerClassName?: string;
}

export type SortOrder = 'asc' | 'desc' | null;

export interface ErpTableProps<T> {
  columns: ErpColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  selectable?: boolean;
  selectedKeys?: string[];
  onSelectionChange?: (keys: string[]) => void;
  expandedKeys?: string[];
  onExpandedChange?: (keys: string[]) => void;
  renderExpanded?: (row: T) => React.ReactNode;
  emptyText?: string;
  loading?: boolean;
  sortKey?: string;
  sortOrder?: SortOrder;
  onSortChange?: (key: string, order: SortOrder) => void;
  maxHeight?: number | string;
  minHeight?: number;
  className?: string;
  rowClassName?: (row: T) => string;
  onRowClick?: (row: T) => void;
}

export function ErpTable<T>({
  columns,
  rows,
  rowKey,
  selectable,
  selectedKeys = [],
  onSelectionChange,
  expandedKeys = [],
  onExpandedChange,
  renderExpanded,
  emptyText = '暂无数据',
  loading,
  sortKey,
  sortOrder,
  onSortChange,
  maxHeight = 560,
  minHeight,
  className = '',
  rowClassName,
  onRowClick,
}: ErpTableProps<T>) {
  const fixedOffsets = useMemo(() => {
    const map: Record<string, number> = {};
    let offset = 0;
    for (let index = columns.length - 1; index >= 0; index -= 1) {
      const column = columns[index];
      if (column.fixed === 'right') {
        map[column.key] = offset;
        offset += column.width || 120;
      }
    }
    return map;
  }, [columns]);

  const allKeys = rows.map(rowKey);
  const selectedOnPage = allKeys.filter((key) => selectedKeys.includes(key));
  const allSelected = rows.length > 0 && selectedOnPage.length === rows.length;
  const partiallySelected = selectedOnPage.length > 0 && !allSelected;

  const toggleAll = (checked: boolean) => {
    const set = new Set(selectedKeys);
    allKeys.forEach((key) => (checked ? set.add(key) : set.delete(key)));
    onSelectionChange?.(Array.from(set));
  };

  const toggleRow = (key: string, checked: boolean) => {
    const set = new Set(selectedKeys);
    if (checked) set.add(key);
    else set.delete(key);
    onSelectionChange?.(Array.from(set));
  };

  const toggleExpanded = (key: string) => {
    const set = new Set(expandedKeys);
    if (set.has(key)) set.delete(key);
    else set.add(key);
    onExpandedChange?.(Array.from(set));
  };

  const spanCount = columns.length + (selectable ? 1 : 0) + (renderExpanded ? 1 : 0);

  return (
    <div className={`erp-table ${className}`}>
      <div className="erp-table__scroll" style={{ maxHeight, minHeight }}>
        <table>
          <colgroup>
            {renderExpanded ? <col style={{ width: 42 }} /> : null}
            {selectable ? <col style={{ width: 42 }} /> : null}
            {columns.map((column) => (
              <col key={column.key} style={{ width: column.width, minWidth: column.minWidth }} />
            ))}
          </colgroup>
          <thead>
            <tr>
              {renderExpanded ? <th className="erp-table__expand-head" /> : null}
              {selectable ? (
                <th className="erp-table__select-head">
                  <ErpCheckbox checked={allSelected} indeterminate={partiallySelected} onChange={toggleAll} />
                </th>
              ) : null}
              {columns.map((column) => {
                const fixedStyle = column.fixed ? { right: fixedOffsets[column.key], position: 'sticky' as const } : undefined;
                return (
                  <th
                    key={column.key}
                    className={`${column.align ? `is-${column.align}` : ''} ${column.fixed ? 'is-fixed-right' : ''} ${column.headerClassName || ''}`}
                    style={fixedStyle}
                  >
                    <span className="erp-table__th-inner">
                      {column.title}
                      {column.sortable ? (
                        <button
                          type="button"
                          className={`erp-table__sort ${sortKey === column.key ? `is-${sortOrder}` : ''}`}
                          aria-label={`${String(column.title)} 排序`}
                          onClick={() => {
                            const next: SortOrder = sortKey !== column.key ? 'asc' : sortOrder === 'asc' ? 'desc' : null;
                            onSortChange?.(column.key, next);
                          }}
                        >
                          <span>▲</span>
                          <span>▼</span>
                        </button>
                      ) : null}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <tr className="erp-table__skeleton" key={`skeleton-${index}`}>
                  {renderExpanded ? <td /> : null}
                  {selectable ? <td /> : null}
                  {columns.map((column) => (
                    <td key={column.key}>
                      <span className="erp-skeleton" style={{ width: `${55 + ((index * 13 + column.key.length * 7) % 35)}%` }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr className="erp-table__empty-row">
                <td colSpan={spanCount}>
                  <ErpEmpty text={emptyText} />
                </td>
              </tr>
            ) : (
              rows.map((row, rowIndex) => {
                const key = rowKey(row);
                const isSelected = selectedKeys.includes(key);
                const isExpanded = expandedKeys.includes(key);
                return (
                  <React.Fragment key={key}>
                    <tr
                      className={`erp-table__row ${isSelected ? 'is-selected' : ''} ${isExpanded ? 'is-expanded' : ''} ${rowClassName ? rowClassName(row) : ''}`}
                      onClick={() => {
                        if (renderExpanded) toggleExpanded(key);
                        onRowClick?.(row);
                      }}
                    >
                      {renderExpanded ? (
                        <td className="erp-table__expand-cell">
                          <button
                            type="button"
                            className={`erp-table__caret ${isExpanded ? 'is-open' : ''}`}
                            aria-label={isExpanded ? '收起' : '展开'}
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleExpanded(key);
                            }}
                          >
                            ▸
                          </button>
                        </td>
                      ) : null}
                      {selectable ? (
                        <td className="erp-table__select-cell" onClick={(event) => event.stopPropagation()}>
                          <ErpCheckbox checked={isSelected} onChange={(checked) => toggleRow(key, checked)} />
                        </td>
                      ) : null}
                      {columns.map((column) => {
                        const fixedStyle = column.fixed
                          ? { right: fixedOffsets[column.key], position: 'sticky' as const }
                          : undefined;
                        return (
                          <td
                            key={column.key}
                            className={`${column.align ? `is-${column.align}` : ''} ${column.fixed ? 'is-fixed-right' : ''} ${column.className || ''}`}
                            style={fixedStyle}
                          >
                            {column.render ? column.render(row, rowIndex) : String((row as Record<string, unknown>)[column.key] ?? '-')}
                          </td>
                        );
                      })}
                    </tr>
                    {renderExpanded && isExpanded ? (
                      <tr className="erp-table__expanded">
                        <td colSpan={spanCount} onClick={(event) => event.stopPropagation()}>
                          {renderExpanded(row)}
                        </td>
                      </tr>
                    ) : null}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ErpPagination({
  total,
  page,
  pageSize,
  onChange,
  onSizeChange,
  pageSizes = [10, 20, 30, 50, 100, 200, 500],
  compact,
}: {
  total: number;
  page: number;
  pageSize: number;
  onChange?: (page: number) => void;
  onSizeChange?: (size: number) => void;
  pageSizes?: number[];
  compact?: boolean;
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, pageCount);
  const pages = useMemo(() => {
    const list: number[] = [];
    const start = Math.max(1, Math.min(safePage - 2, pageCount - 4));
    const end = Math.min(pageCount, start + 4);
    for (let index = start; index <= end; index += 1) list.push(index);
    return list;
  }, [safePage, pageCount]);

  if (compact) {
    return (
      <div className="erp-pagination erp-pagination--compact">
        <span className="erp-pagination__total">共 {total.toLocaleString('en-US')} 条</span>
        <button type="button" className="erp-pagination__btn" disabled={safePage <= 1} onClick={() => onChange?.(safePage - 1)} aria-label="上一页">
          ‹
        </button>
        <span className="erp-pagination__current">
          {safePage}/{pageCount}
        </span>
        <button type="button" className="erp-pagination__btn" disabled={safePage >= pageCount} onClick={() => onChange?.(safePage + 1)} aria-label="下一页">
          ›
        </button>
      </div>
    );
  }

  return (
    <div className="erp-pagination">
      <span className="erp-pagination__total">共 {total.toLocaleString('en-US')} 条</span>
      {compact ? null : (
        <span className="erp-pagination__sizes">
          <select value={pageSize} onChange={(event) => onSizeChange?.(Number(event.target.value))} aria-label="每页条数">
            {pageSizes.map((size) => (
              <option value={size} key={size}>
                {size} 条/页
              </option>
            ))}
          </select>
        </span>
      )}
      <button type="button" className="erp-pagination__btn" disabled={safePage <= 1} onClick={() => onChange?.(safePage - 1)} aria-label="上一页">
        ‹
      </button>
      {pages[0] > 1 ? (
        <>
          <button type="button" className="erp-pagination__btn" onClick={() => onChange?.(1)}>
            1
          </button>
          {pages[0] > 2 ? <span className="erp-pagination__more">…</span> : null}
        </>
      ) : null}
      {pages.map((item) => (
        <button
          type="button"
          key={item}
          className={`erp-pagination__btn ${item === safePage ? 'is-active' : ''}`}
          onClick={() => onChange?.(item)}
        >
          {item}
        </button>
      ))}
      {pages[pages.length - 1] < pageCount ? (
        <>
          {pages[pages.length - 1] < pageCount - 1 ? <span className="erp-pagination__more">…</span> : null}
          <button type="button" className="erp-pagination__btn" onClick={() => onChange?.(pageCount)}>
            {pageCount}
          </button>
        </>
      ) : null}
      <button type="button" className="erp-pagination__btn" disabled={safePage >= pageCount} onClick={() => onChange?.(safePage + 1)} aria-label="下一页">
        ›
      </button>
      {compact ? null : (
        <span className="erp-pagination__jump">
          前往
          <input
            type="number"
            min={1}
            max={pageCount}
            defaultValue={safePage}
            key={safePage}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                const value = Number((event.target as HTMLInputElement).value);
                if (value >= 1 && value <= pageCount) onChange?.(value);
              }
            }}
            aria-label="前往页码"
          />
          页
        </span>
      )}
    </div>
  );
}
