import React, { useEffect, useMemo, useRef, useState } from 'react';

import '../sync-online-dialog.css';

type SyncStatus = 0 | 1 | 2 | 4;
type SyncMode = 'full' | 'incremental';

interface StoreRow {
  storeId: string;
  storeName: string;
  storeAliasName: string;
  platformId: string;
  platformName: string;
  status: SyncStatus;
  runningMode?: SyncMode;
  completeTotal: number;
  updatedAt: string;
}

export interface SyncStoreOption {
  storeId: string;
  storeName: string;
  storeAliasName: string;
  platformId: string;
  platformName: string;
}

const PAGE_SIZES = [10, 20, 30, 50, 100, 200, 500];

const INCREMENTAL_SEED = [386, 186, 274, 158, 214, 120, 96];
const FULL_SEED = [1286, 986, 742, 645, 878, 512, 468];
const INITIAL_STATUS_SEED: SyncStatus[] = [1, 2, 4, 0, 4, 0, 0, 0];

const SYNC_MODE_ORDER: SyncMode[] = ['full', 'incremental'];

const SYNC_MODE_LABEL: Record<SyncMode, string> = {
  full: '全量同步',
  incremental: '快速同步',
};

const SYNC_MODE_NOTES: { mode: SyncMode; text: string }[] = [
  {
    mode: 'full',
    text: '可同步线上完整产品数据，但同步时间较长。',
  },
  {
    mode: 'incremental',
    text: '同步速度快，只同步线上有修改的数据。',
  },
];

const pad2 = (value: number) => String(value).padStart(2, '0');

const nowText = () => {
  const date = new Date();
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(
    date.getMinutes(),
  )}:${pad2(date.getSeconds())}`;
};

const buildRows = (stores: SyncStoreOption[]): StoreRow[] => stores.map((store, index) => {
  const status = INITIAL_STATUS_SEED[index] ?? 4;
  const completeTotal = status === 1 || status === 2 ? INCREMENTAL_SEED[index] ?? 120 : 0;
  return {
    storeId: store.storeId,
    storeName: store.storeName,
    storeAliasName: store.storeAliasName,
    platformId: store.platformId,
    platformName: store.platformName,
    status,
    runningMode: status === 1 ? 'incremental' : undefined,
    completeTotal,
    updatedAt: status === 1 || status === 2 ? nowText() : '',
  };
});

const buildTotals = (stores: SyncStoreOption[]) => {
  const incremental: Record<string, number> = {};
  const full: Record<string, number> = {};
  stores.forEach((store, index) => {
    incremental[store.storeId] = INCREMENTAL_SEED[index] ?? 120;
    full[store.storeId] = FULL_SEED[index] ?? 420;
  });
  return { incremental, full };
};

const Checkbox = ({
  checked,
  indeterminate = false,
  onChange,
  ariaLabel,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  ariaLabel: string;
}) => (
  <label className="sod-checkbox">
    <input type="checkbox" checked={checked} onChange={onChange} aria-label={ariaLabel} />
    <span
      className={
        'sod-checkbox__box' + (checked ? ' is-checked' : '') + (indeterminate && !checked ? ' is-indeterminate' : '')
      }
    />
  </label>
);

const ChevronIcon = () => (
  <svg className="sod-chevron" width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const Spinner = () => (
  <span className="sod-spinner" aria-hidden="true">
    {Array.from({ length: 12 }, (_, index) => (
      <i
        key={index}
        style={{
          transform: `rotate(${index * 30}deg) translateY(-4.5px)`,
          animationDelay: `${index * -0.075}s`,
        }}
      />
    ))}
  </span>
);

const statusOf = (row: StoreRow) => {
  if (row.status === 1) {
    return { className: 'is-running', text: `同步中（成功同步${row.completeTotal || '-'}条数据）` };
  }
  if (row.status === 2) {
    return { className: 'is-running', text: `同步完成（成功同步${row.completeTotal || '-'}条数据）` };
  }
  if (row.status === 4) {
    return { className: 'is-failed', text: '同步失败' };
  }
  return { className: 'is-pending', text: '未开始' };
};

export default function SyncOnlineDialog({
  stores,
  onClose,
}: {
  stores: SyncStoreOption[];
  onClose: () => void;
}) {
  const [rows, setRows] = useState<StoreRow[]>(() => buildRows(stores));
  const [totals] = useState(() => buildTotals(stores));
  const [selectedStoreIds, setSelectedStoreIds] = useState<string[]>([]);
  const [appliedStoreIds, setAppliedStoreIds] = useState<string[]>([]);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [platformFilter, setPlatformFilter] = useState('all');
  const [platformOpen, setPlatformOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [boxHover, setBoxHover] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSizeOpen, setPageSizeOpen] = useState(false);
  const [jumpValue, setJumpValue] = useState('1');
  const [toast, setToast] = useState<string | null>(null);

  const selectRef = useRef<HTMLDivElement>(null);
  const platformRef = useRef<HTMLDivElement>(null);
  const pageSizeRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<number[]>([]);
  const toastTimerRef = useRef<number | null>(null);

  const schedule = (callback: () => void, delay: number) => {
    const timer = window.setTimeout(callback, delay);
    timersRef.current.push(timer);
  };

  useEffect(() => {
    // 打开时若已有店铺在同步，稍后自动完成，避免一直转菊花
    const running = rows.filter((row) => row.status === 1);
    running.forEach((row, index) => {
      schedule(() => {
        setRows((prev) => prev.map((item) => (
          item.storeId === row.storeId && item.status === 1
            ? { ...item, status: 2, completeTotal: item.completeTotal || totals.incremental[item.storeId] || 120, updatedAt: nowText() }
            : item
        )));
      }, 3200 + index * 250);
    });
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const onDocumentMouseDown = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) setDropdownOpen(false);
      if (platformRef.current && !platformRef.current.contains(event.target as Node)) setPlatformOpen(false);
      if (pageSizeRef.current && !pageSizeRef.current.contains(event.target as Node)) setPageSizeOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (dropdownOpen || pageSizeOpen || platformOpen) {
        setDropdownOpen(false);
        setPageSizeOpen(false);
        setPlatformOpen(false);
        return;
      }
      onClose();
    };
    document.addEventListener('mousedown', onDocumentMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocumentMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [dropdownOpen, pageSizeOpen, platformOpen, onClose]);

  useEffect(() => {
    setJumpValue(String(pageIndex));
  }, [pageIndex]);

  const showToast = (text: string) => {
    setToast(text);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2400);
  };

  const platformOptions = useMemo(() => {
    const map = new Map<string, string>();
    stores.forEach((store) => {
      if (!map.has(store.platformId)) map.set(store.platformId, store.platformName);
    });
    return Array.from(map, ([id, name]) => ({ id, name }));
  }, [stores]);

  const visibleStorePool = useMemo(
    () => (platformFilter === 'all' ? stores : stores.filter((store) => store.platformId === platformFilter)),
    [stores, platformFilter],
  );

  const filteredRows = useMemo(
    () => rows
      .filter((row) => platformFilter === 'all' || row.platformId === platformFilter)
      .filter((row) => !appliedStoreIds.length || appliedStoreIds.includes(row.storeId)),
    [appliedStoreIds, rows, platformFilter],
  );

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(pageIndex, totalPages);
  const visibleRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const visibleGroups = useMemo(() => {
    const map = new Map<string, { platformId: string; platformName: string; rows: StoreRow[] }>();
    visibleRows.forEach((row) => {
      const group = map.get(row.platformId);
      if (group) group.rows.push(row);
      else map.set(row.platformId, { platformId: row.platformId, platformName: row.platformName, rows: [row] });
    });
    return Array.from(map.values());
  }, [visibleRows]);

  const storeOptions = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    return visibleStorePool.filter(
      (store) =>
        !keyword
        || store.storeName.toLowerCase().includes(keyword)
        || store.storeAliasName.toLowerCase().includes(keyword),
    );
  }, [searchText, visibleStorePool]);

  const storeOptionGroups = useMemo(() => platformOptions
    .map((platform) => ({
      ...platform,
      stores: storeOptions.filter((store) => store.platformId === platform.id),
    }))
    .filter((platform) => platform.stores.length > 0), [platformOptions, storeOptions]);

  const platformName = platformFilter === 'all'
    ? '全部平台'
    : platformOptions.find((platform) => platform.id === platformFilter)?.name ?? '全部平台';

  const toggleStore = (storeId: string) => {
    setSelectedStoreIds((prev) =>
      prev.includes(storeId) ? prev.filter((id) => id !== storeId) : [...prev, storeId],
    );
  };

  const handleSearch = () => {
    setAppliedStoreIds([...selectedStoreIds]);
    setPageIndex(1);
  };

  const handleReset = () => {
    setSelectedStoreIds([]);
    setAppliedStoreIds([]);
    setSearchText('');
    setSelectedRowIds([]);
    setPlatformFilter('all');
    setPageIndex(1);
  };

  const toggleRow = (storeId: string) => {
    setSelectedRowIds((prev) =>
      prev.includes(storeId) ? prev.filter((id) => id !== storeId) : [...prev, storeId],
    );
  };

  const startSync = (storeIds: string[], mode: SyncMode) => {
    if (!storeIds.length) {
      showToast('请选择要同步的店铺');
      return;
    }
    const modeTotals = mode === 'full' ? totals.full : totals.incremental;
    const progressDelay = mode === 'full' ? 2400 : 1500;
    const finishDelay = mode === 'full' ? 4800 : 3200;
    const startedAt = nowText();
    setRows((prev) =>
      prev.map((row) =>
        storeIds.includes(row.storeId)
          ? { ...row, status: 1, runningMode: mode, completeTotal: 0, updatedAt: startedAt }
          : row,
      ),
    );
    storeIds.forEach((storeId, index) => {
      schedule(() => {
        setRows((prev) =>
          prev.map((row) =>
            row.storeId === storeId && row.status === 1
              ? { ...row, completeTotal: modeTotals[storeId] ?? 120, updatedAt: nowText() }
              : row,
          ),
        );
      }, progressDelay + index * 250);
      schedule(() => {
        setRows((prev) =>
          prev.map((row) =>
            row.storeId === storeId && row.status === 1
              ? { ...row, status: 2, completeTotal: modeTotals[storeId] ?? 120, updatedAt: nowText() }
              : row,
          ),
        );
      }, finishDelay + index * 250);
    });
  };

  const handleBatchSync = (mode: SyncMode) => {
    startSync(selectedRowIds, mode);
  };

  const applyJump = () => {
    const value = Number.parseInt(jumpValue, 10);
    if (!Number.isFinite(value)) {
      setJumpValue(String(currentPage));
      return;
    }
    const nextPage = Math.min(Math.max(value, 1), totalPages);
    setPageIndex(nextPage);
    setJumpValue(String(nextPage));
  };

  return (
    <div className="sod-mask">
      <div className="sod-dialog" role="dialog" aria-modal="true" aria-label="同步线上">
        <div className="sod-header">
          <h1 className="sod-title">同步线上</h1>
          <button type="button" className="sod-close" aria-label="关闭" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="sod-body">
          <div className="sod-filter">
            <span className="sod-filter__label">平台</span>
            <div className="sod-select sod-select--platform" ref={platformRef}>
              <div
                className={'sod-select__box' + (platformOpen ? ' is-open' : '')}
                onClick={() => setPlatformOpen((open) => !open)}
              >
                <span className={'sod-select__value' + (platformFilter === 'all' ? ' is-placeholder' : '')}>
                  {platformName}
                </span>
                <span className="sod-select__caret">
                  <ChevronIcon />
                </span>
              </div>
              {platformOpen ? (
                <div className="sod-dropdown">
                  {[{ id: 'all', name: '全部平台' }, ...platformOptions].map((platform) => (
                    <div
                      className={'sod-dropdown__item' + (platformFilter === platform.id ? ' is-selected' : '')}
                      key={platform.id}
                      onClick={() => {
                        setPlatformFilter(platform.id);
                        setPlatformOpen(false);
                        setSelectedRowIds([]);
                        setPageIndex(1);
                      }}
                    >
                      <span className="sod-dropdown__label">{platform.name}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
            <span className="sod-filter__label">店铺</span>
            <div className="sod-select" ref={selectRef}>
              <div
                className={'sod-select__box' + (dropdownOpen ? ' is-open' : '') + (selectedStoreIds.length ? ' has-tags' : '')}
                onClick={() => setDropdownOpen((open) => !open)}
                onMouseEnter={() => setBoxHover(true)}
                onMouseLeave={() => setBoxHover(false)}
              >
                {selectedStoreIds.length > 0 ? (
                  <span className="sod-select__tags">
                    {selectedStoreIds.map((storeId) => {
                      const store = stores.find((item) => item.storeId === storeId);
                      if (!store) return null;
                      return (
                        <span className="sod-tag" key={storeId}>
                          <span className="sod-tag__text">{store.storeName || store.storeAliasName}</span>
                          <span
                            className="sod-tag__close"
                            role="button"
                            aria-label={`移除${store.storeName}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleStore(storeId);
                            }}
                          >
                            ×
                          </span>
                        </span>
                      );
                    })}
                  </span>
                ) : null}
                <input
                  className="sod-select__input"
                  value={searchText}
                  placeholder={selectedStoreIds.length ? '' : '请选择店铺'}
                  onChange={(event) => {
                    setSearchText(event.target.value);
                    setDropdownOpen(true);
                  }}
                />
                {selectedStoreIds.length > 0 && boxHover ? (
                  <span
                    className="sod-select__clear"
                    role="button"
                    aria-label="清空已选店铺"
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedStoreIds([]);
                      setSearchText('');
                    }}
                  >
                    ×
                  </span>
                ) : (
                  <span className="sod-select__caret">
                    <ChevronIcon />
                  </span>
                )}
              </div>

              {dropdownOpen ? (
                <div className="sod-dropdown">
                  <div className="sod-dropdown__group">
                    <div className="sod-dropdown__title">快捷操作</div>
                    <div
                      className="sod-dropdown__item"
                      onClick={() => {
                        setSelectedStoreIds(storeOptions.map((store) => store.storeId));
                        setSearchText('');
                      }}
                    >
                      全选
                    </div>
                    <div
                      className="sod-dropdown__item"
                      onClick={() => {
                        setSelectedStoreIds([]);
                        setSearchText('');
                      }}
                    >
                      取消全选
                    </div>
                  </div>
                  {storeOptionGroups.length ? (
                    storeOptionGroups.map((platform) => (
                      <div className="sod-dropdown__group" key={platform.id}>
                        <div className="sod-dropdown__title">{platform.name}</div>
                        {platform.stores.map((store) => {
                          const selected = selectedStoreIds.includes(store.storeId);
                          return (
                            <div
                              className={'sod-dropdown__item' + (selected ? ' is-selected' : '')}
                              key={store.storeId}
                              onClick={() => toggleStore(store.storeId)}
                            >
                              <span className="sod-dropdown__label">{store.storeName || store.storeAliasName}</span>
                            </div>
                          );
                        })}
                      </div>
                    ))
                  ) : (
                    <div className="sod-dropdown__group">
                      <div className="sod-dropdown__empty">无匹配店铺</div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
            <button type="button" className="sod-btn sod-btn--primary" onClick={handleSearch}>
              搜索
            </button>
            <button type="button" className="sod-btn sod-btn--default" onClick={handleReset}>
              重置
            </button>
          </div>

          <div className="sod-mode-notes">
            <span className="sod-mode-notes__icon" aria-hidden="true">
              i
            </span>
            <div className="sod-mode-notes__body">
              {SYNC_MODE_NOTES.map((note) => (
                <div className="sod-mode-note" key={note.mode}>
                  <span className="sod-mode-note__label">{SYNC_MODE_LABEL[note.mode]}：</span>
                  {note.text}
                </div>
              ))}
            </div>
          </div>

          <div className="sod-batch-actions">
            <span className="sod-btn-group">
              {SYNC_MODE_ORDER.map((mode) => (
                <button
                  type="button"
                  className="sod-btn sod-btn--primary"
                  key={mode}
                  onClick={() => handleBatchSync(mode)}
                >
                  {SYNC_MODE_LABEL[mode]}
                </button>
              ))}
            </span>
          </div>

          <div className="sod-table">
            {visibleGroups.map((group) => {
              const groupSelected = group.rows.filter((row) => selectedRowIds.includes(row.storeId));
              const groupAll = group.rows.length > 0 && groupSelected.length === group.rows.length;
              const groupSome = groupSelected.length > 0 && !groupAll;
              const toggleGroup = () => {
                setSelectedRowIds((prev) => {
                  if (groupAll) return prev.filter((id) => !group.rows.some((row) => row.storeId === id));
                  return Array.from(new Set([...prev, ...group.rows.map((row) => row.storeId)]));
                });
              };
              return (
                <section className="sod-platform" key={group.platformId}>
                  <div className="sod-platform__head">
                    <span className="sod-platform__name">{group.platformName}</span>
                    <span className="sod-platform__count">{`${group.rows.length} 家店铺`}</span>
                    <span className="sod-platform__all">
                      <Checkbox
                        checked={groupAll}
                        indeterminate={groupSome}
                        onChange={toggleGroup}
                        ariaLabel={`全选${group.platformName}店铺`}
                      />
                      <span className="sod-platform__all-text" onClick={toggleGroup}>全选</span>
                    </span>
                  </div>
                  {group.rows.map((row) => {
                    const status = statusOf(row);
                    const syncing = row.status === 1;
                    return (
                      <div className="sod-tr" key={row.storeId}>
                        <span className="sod-tr__check">
                          <Checkbox
                            checked={selectedRowIds.includes(row.storeId)}
                            onChange={() => toggleRow(row.storeId)}
                            ariaLabel={`选择${row.storeName}`}
                          />
                        </span>
                        <span className="sod-tr__main">
                          <span className="sod-store-row">
                            {syncing ? (
                              <button type="button" className="sod-sync-btn is-syncing" disabled>
                                <Spinner />
                                {SYNC_MODE_LABEL[row.runningMode ?? 'incremental']}中
                              </button>
                            ) : (
                              <span className="sod-sync-group" role="group" aria-label={`${row.storeName} 同步`}>
                                {SYNC_MODE_ORDER.map((mode) => (
                                  <button
                                    type="button"
                                    className="sod-sync-btn"
                                    key={mode}
                                    title={SYNC_MODE_LABEL[mode]}
                                    onClick={() => startSync([row.storeId], mode)}
                                  >
                                    {SYNC_MODE_LABEL[mode]}
                                  </button>
                                ))}
                              </span>
                            )}
                            <span className="sod-store-row__info">
                              <span className="sod-store-row__name">{row.storeName || '-'}</span>
                              {row.storeAliasName && row.storeAliasName !== row.storeName ? (
                                <span className="sod-store-row__alias">{row.storeAliasName}</span>
                              ) : null}
                            </span>
                            <span className="sod-store-row__status">
                              <span className={status.className}>{status.text}</span>
                            </span>
                            {row.status === 1 || row.status === 2 ? (
                              <span className="sod-store-row__time">同步时间：{row.updatedAt || '-'}</span>
                            ) : null}
                          </span>
                        </span>
                      </div>
                    );
                  })}
                </section>
              );
            })}
          </div>

          <div className="sod-pagination">
            <span className="sod-pagination__total">共 {filteredRows.length} 条</span>
            <div className="sod-sizes" ref={pageSizeRef}>
              <div className="sod-sizes__trigger" onClick={() => setPageSizeOpen((open) => !open)}>
                <span>{pageSize}条/页</span>
                <span className="sod-sizes__caret">
                  <ChevronIcon />
                </span>
              </div>
              {pageSizeOpen ? (
                <div className="sod-sizes__menu">
                  {PAGE_SIZES.map((size) => (
                    <div
                      className={'sod-sizes__item' + (size === pageSize ? ' is-selected' : '')}
                      key={size}
                      onClick={() => {
                        setPageSize(size);
                        setPageIndex(1);
                        setPageSizeOpen(false);
                      }}
                    >
                      {size}条/页
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
            <button
              type="button"
              className="sod-pager-btn"
              disabled={currentPage <= 1}
              aria-label="上一页"
              onClick={() => setPageIndex((page) => Math.max(1, page - 1))}
            >
              ‹
            </button>
            <button type="button" className="sod-pager-num is-active" aria-current="page">
              {currentPage}
            </button>
            <button
              type="button"
              className="sod-pager-btn"
              disabled={currentPage >= totalPages}
              aria-label="下一页"
              onClick={() => setPageIndex((page) => Math.min(totalPages, page + 1))}
            >
              ›
            </button>
            <span className="sod-pagination__jump">
              前往
              <input
                className="sod-jump-input"
                value={jumpValue}
                inputMode="numeric"
                onChange={(event) => setJumpValue(event.target.value.replace(/[^\d]/g, ''))}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') applyJump();
                }}
                onBlur={applyJump}
                aria-label="页码"
              />
              页
            </span>
          </div>
        </div>

        <div className="sod-footer">
          <button type="button" className="sod-btn sod-btn--default sod-btn--md" onClick={onClose}>
            关闭
          </button>
          <button type="button" className="sod-btn sod-btn--primary sod-btn--md" onClick={onClose}>
            后台执行
          </button>
        </div>
      </div>

      {toast ? (
        <div className="sod-toast" role="status">
          <span className="sod-toast__icon">!</span>
          <span>{toast}</span>
        </div>
      ) : null}
    </div>
  );
}
