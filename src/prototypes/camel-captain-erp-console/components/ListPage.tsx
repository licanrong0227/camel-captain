import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ErpButton, ErpPagination, ErpStatusTag, ErpTable, ErpEmpty } from './ui';
import type { ErpColumn } from './ui';

export interface RowAction {
  label: string;
  danger?: boolean;
  onClick: () => void;
}

export interface TabItem {
  key: string;
  label: string;
  count?: number;
}

export function PageHeader({
  title,
  description,
  extra,
  meta,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  extra?: React.ReactNode;
  meta?: React.ReactNode;
}) {
  return (
    <header className="erp-page-head">
      <div className="erp-page-head__main">
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
        {meta ? <div className="erp-page-head__meta">{meta}</div> : null}
      </div>
      {extra ? <div className="erp-page-head__extra">{extra}</div> : null}
    </header>
  );
}

export function RowActionBar({ actions }: { actions: RowAction[] }) {
  if (!actions.length) return null;
  return (
    <div className="erp-row-actions">
      {actions.map((action) => (
        <ErpButton key={action.label} size="small" variant={action.danger ? 'danger' : 'default'} onClick={action.onClick}>
          {action.label}
        </ErpButton>
      ))}
    </div>
  );
}

export function ListTabs({
  tabs,
  activeKey,
  onChange,
}: {
  tabs: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="erp-list-tabs" role="tablist">
      {tabs.map((tab) => (
        <button
          type="button"
          role="tab"
          aria-selected={tab.key === activeKey}
          key={tab.key}
          className={`erp-list-tabs__item ${tab.key === activeKey ? 'is-active' : ''}`}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
          {typeof tab.count === 'number' ? <span className="erp-list-tabs__count">{tab.count.toLocaleString('en-US')}</span> : null}
        </button>
      ))}
    </div>
  );
}

export interface StatsGroup {
  title: string;
  items: Array<{ key: string; label: string; count: number }>;
  extra?: React.ReactNode;
}

export function StatsPanel({
  title,
  groups,
  activeKey,
  onSelect,
  extra,
}: {
  title: React.ReactNode;
  groups: StatsGroup[];
  activeKey: string;
  onSelect: (key: string) => void;
  extra?: React.ReactNode;
}) {
  return (
    <aside className="erp-stats">
      <header className="erp-stats__head">
        <b>{title}</b>
        {extra}
      </header>
      {groups.map((group) => (
        <section className="erp-stats__group" key={group.title || 'all'}>
          {group.title ? (
            <div className="erp-stats__title">
              <span>{group.title}</span>
              {group.extra}
            </div>
          ) : null}
          {group.items.map((item) => (
            <button
              type="button"
              className={`erp-stats__item ${item.key === activeKey ? 'is-active' : ''}`}
              key={item.key}
              onClick={() => onSelect(item.key)}
            >
              <span>{item.label}</span>
              <em>{item.count.toLocaleString('en-US')}</em>
            </button>
          ))}
        </section>
      ))}
    </aside>
  );
}

export function FilterBar({
  children,
  onQuery,
  onReset,
  extra,
  advanced,
  onToggleAdvanced,
}: {
  children: React.ReactNode;
  onQuery?: () => void;
  onReset?: () => void;
  extra?: React.ReactNode;
  advanced?: boolean;
  onToggleAdvanced?: () => void;
}) {
  return (
    <div className="erp-filterbar">
      <div className="erp-filterbar__fields">{children}</div>
      {onQuery || onReset || extra || onToggleAdvanced ? (
        <div className="erp-filterbar__actions">
          {extra}
          {onToggleAdvanced ? (
            <button type="button" className="erp-filterbar__toggle" onClick={onToggleAdvanced}>
              {advanced ? '收起' : '展开'}
              <span className={advanced ? 'is-open' : ''}>⌄</span>
            </button>
          ) : null}
          {onReset ? <ErpButton onClick={onReset}>重置</ErpButton> : null}
          {onQuery ? (
            <ErpButton variant="primary" icon={<span>⌕</span>} onClick={onQuery}>
              搜索
            </ErpButton>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function BatchFooter({
  selectedCount,
  actions,
  total,
  page,
  pageSize,
  onPageChange,
  onSizeChange,
  crossPage,
  crossPageLabel,
  onCrossPage,
  pagination = true,
  notice,
}: {
  selectedCount: number;
  actions: RowAction[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onSizeChange: (size: number) => void;
  crossPage?: boolean;
  crossPageLabel?: string;
  onCrossPage?: (checked: boolean) => void;
  pagination?: boolean;
  notice?: React.ReactNode;
}) {
  return (
    <div className="erp-batch-footer">
      <div className="erp-batch-footer__left">
        <span className="erp-batch-footer__selected">
          已选 <b>{selectedCount}</b> 项
        </span>
        {crossPage && onCrossPage ? (
          <button type="button" className="erp-batch-footer__cross" onClick={() => onCrossPage(!crossPage)}>
            {crossPage ? '取消跨页全选' : crossPageLabel || '跨页全选全部结果'}
          </button>
        ) : null}
        {selectedCount > 0 ? (
          <span className="erp-batch-footer__actions">
            {actions.map((action) => (
              <ErpButton key={action.label} size="mini" variant={action.danger ? 'danger' : 'default'} onClick={action.onClick}>
                {action.label}
              </ErpButton>
            ))}
          </span>
        ) : (
          <span className="erp-batch-footer__hint">勾选后可进行批量操作</span>
        )}
        {notice ? <span className="erp-batch-footer__notice">{notice}</span> : null}
      </div>
      {pagination ? (
        <ErpPagination total={total} page={page} pageSize={pageSize} onChange={onPageChange} onSizeChange={onSizeChange} />
      ) : null}
    </div>
  );
}

export interface ListPageProps<T> {
  header?: React.ReactNode;
  tabs?: TabItem[];
  activeTab?: string;
  onTabChange?: (key: string) => void;
  filters?: React.ReactNode;
  toolbar?: React.ReactNode;
  stats?: React.ReactNode;
  columns: ErpColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  selectable?: boolean;
  rowActions?: (row: T) => RowAction[];
  batchActions?: (selectedRows: T[]) => RowAction[];
  renderExpanded?: (row: T) => React.ReactNode;
  filterKey?: string | number;
  emptyText?: string;
  pagination?: boolean;
  pageSizeDefault?: number;
  onSelectionChange?: (selectedRows: T[]) => void;
  onRowClick?: (row: T) => void;
  sortable?: boolean;
  cardless?: boolean;
  crossPageTotal?: number;
  batchNotice?: React.ReactNode;
}

export function ListPage<T>({
  header,
  tabs,
  activeTab = '',
  onTabChange,
  filters,
  toolbar,
  stats,
  columns,
  rows,
  rowKey,
  selectable,
  rowActions,
  batchActions,
  renderExpanded,
  filterKey,
  emptyText,
  pagination = true,
  pageSizeDefault = 10,
  onSelectionChange,
  onRowClick,
  sortable,
  cardless,
  crossPageTotal,
  batchNotice,
}: ListPageProps<T>) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(pageSizeDefault);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);
  const [crossPage, setCrossPage] = useState(false);

  const rowsRef = useRef(rows);
  const rowKeyRef = useRef(rowKey);
  const selectionChangeRef = useRef(onSelectionChange);
  rowsRef.current = rows;
  rowKeyRef.current = rowKey;
  selectionChangeRef.current = onSelectionChange;
  const keyOf = useMemo(() => new Map(rows.map((row) => [rowKey(row), row])), [rows, rowKey]);

  const updateSelection = useCallback((keys: string[]) => {
    setSelectedKeys(keys);
    const map = new Map(rowsRef.current.map((row) => [rowKeyRef.current(row), row]));
    selectionChangeRef.current?.(keys.map((key) => map.get(key)).filter(Boolean) as T[]);
  }, []);

  useEffect(() => {
    setPage(1);
    setSelectedKeys([]);
    setExpandedKeys([]);
    setCrossPage(false);
    selectionChangeRef.current?.([]);
  }, [filterKey, activeTab]);

  const sortedRows = useMemo(() => {
    if (!sortKey || !sortOrder) return rows;
    return [...rows].sort((left, right) => {
      const leftValue = (left as Record<string, unknown>)[sortKey];
      const rightValue = (right as Record<string, unknown>)[sortKey];
      if (leftValue === rightValue) return 0;
      if (leftValue === undefined || leftValue === null) return 1;
      if (rightValue === undefined || rightValue === null) return -1;
      const compare = String(leftValue).localeCompare(String(rightValue), 'zh-CN', { numeric: true });
      return sortOrder === 'asc' ? compare : -compare;
    });
  }, [rows, sortKey, sortOrder]);

  const total = sortedRows.length;
  const pageCount = pagination ? Math.max(1, Math.ceil(total / pageSize)) : 1;
  const safePage = Math.min(page, pageCount);
  const visibleRows = pagination ? sortedRows.slice((safePage - 1) * pageSize, safePage * pageSize) : sortedRows;
  const selectedRows = selectedKeys.map((key) => keyOf.get(key)).filter(Boolean) as T[];

  const handlePage = (next: number) => {
    setPage(Math.max(1, Math.min(pageCount, next)));
    updateSelection([]);
    setExpandedKeys([]);
  };

  const handleSize = (next: number) => {
    setPageSize(next);
    setPage(1);
    updateSelection([]);
    setExpandedKeys([]);
  };

  const actions = (row: T) => (rowActions ? rowActions(row) : []);
  const expandedRenderer = renderExpanded || (rowActions ? (row: T) => <RowActionBar actions={actions(row)} /> : undefined);
  const batch = batchActions ? batchActions(selectedRows) : [];

  const content = (
    <div className={`erp-list ${cardless ? 'erp-list--plain' : ''}`}>
      {tabs && tabs.length && onTabChange ? <ListTabs tabs={tabs} activeKey={activeTab} onChange={onTabChange} /> : null}
      {filters ? <div className="erp-list__filters">{filters}</div> : null}
      {toolbar ? <div className="erp-list__toolbar">{toolbar}</div> : null}
      <ErpTable
        columns={columns}
        rows={visibleRows}
        rowKey={rowKey}
        selectable={selectable}
        selectedKeys={selectedKeys}
        onSelectionChange={updateSelection}
        expandedKeys={expandedKeys}
        onExpandedChange={setExpandedKeys}
        renderExpanded={expandedRenderer}
        emptyText={emptyText}
        sortKey={sortKey}
        sortOrder={sortOrder}
        onSortChange={
          sortable
            ? (key, order) => {
                setSortKey(key);
                setSortOrder(order);
              }
            : undefined
        }
        onRowClick={onRowClick}
      />
      {pagination || selectable ? (
        <BatchFooter
          selectedCount={selectedKeys.length}
          actions={batch}
          total={total}
          page={safePage}
          pageSize={pageSize}
          onPageChange={handlePage}
          onSizeChange={handleSize}
          pagination={pagination}
          crossPage={crossPage}
          crossPageLabel={crossPageTotal ? `跨页全选 ${crossPageTotal} 项` : undefined}
          onCrossPage={
            crossPageTotal
              ? (checked) => {
                  setCrossPage(checked);
                  updateSelection(checked ? rows.map(rowKey) : []);
                }
              : undefined
          }
          notice={batchNotice}
        />
      ) : null}
    </div>
  );

  return (
    <div className="erp-page">
      {header}
      <div className={`erp-page__body ${stats ? 'has-stats' : ''}`}>
        {stats ? <div className="erp-page__stats">{stats}</div> : null}
        <div className="erp-page__content">{cardless ? content : <div className="erp-card">{content}</div>}</div>
      </div>
    </div>
  );
}

export function ProductCell({
  image,
  title,
  meta,
  sub,
  right,
}: {
  image: string;
  title: React.ReactNode;
  meta?: React.ReactNode;
  sub?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="erp-product-cell">
      <img src={image} alt="" className="erp-product-cell__img" />
      <div className="erp-product-cell__body">
        <div className="erp-product-cell__title">{title}</div>
        {meta ? <div className="erp-product-cell__meta">{meta}</div> : null}
        {sub ? <div className="erp-product-cell__sub">{sub}</div> : null}
      </div>
      {right ? <div className="erp-product-cell__right">{right}</div> : null}
    </div>
  );
}

export function StatusCell({ status }: { status: string }) {
  return <ErpStatusTag status={status} />;
}

export function EmptyBlock({ text = '暂无数据', action }: { text?: string; action?: React.ReactNode }) {
  return <ErpEmpty text={text} action={action} />;
}
