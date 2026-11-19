import React, { useEffect, useMemo, useRef, useState } from 'react';

import '../sync-order-dialog.css';

const pad2 = (value: number) => String(value).padStart(2, '0');
const fmtDate = (y: number, m: number, d: number) => `${y}-${pad2(m + 1)}-${pad2(d)}`;

const IconClose = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3.2 3.2l9.6 9.6M12.8 3.2L3.2 12.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const IconChevron = () => (
  <svg width="12" height="12" viewBox="0 0 12 8" fill="none" aria-hidden="true">
    <path d="M1 1.5 6 6.5l5-5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconCalendar = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <rect x="1.5" y="2.5" width="11" height="10" rx="1" stroke="currentColor" strokeWidth="1.1" />
    <path d="M1.5 5.5h11M4.5 1v3M9.5 1v3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
  </svg>
);

const IconCheck = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M2.4 6.2 4.9 8.6 9.6 3.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Spinner = () => (
  <span className="syd-spinner" aria-hidden="true">
    {Array.from({ length: 12 }, (_, index) => (
      <i
        key={index}
        style={{
          transform: `rotate(${index * 30}deg) translateY(-5px)`,
          animationDelay: `${index * -0.075}s`,
        }}
      />
    ))}
  </span>
);

const SYNC_TOTAL = 128;

export interface SyncOrderStore {
  name: string;
  platform: string;
}

export interface SyncOrderPlatform {
  id: string;
  label: string;
}

export default function SyncOrderDialog({
  stores,
  platforms,
  onClose,
  onSubmitted,
}: {
  stores: SyncOrderStore[];
  platforms: SyncOrderPlatform[];
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [platformId, setPlatformId] = useState('');
  const [platformOpen, setPlatformOpen] = useState(false);
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [storeKeyword, setStoreKeyword] = useState('');
  const [storeOpen, setStoreOpen] = useState(false);
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const [rangeOpen, setRangeOpen] = useState(false);
  const [view, setView] = useState(() => {
    const now = new Date();
    return { y: now.getFullYear(), m: now.getMonth() };
  });
  const [orderNo, setOrderNo] = useState('');
  const [onlyUnhandled, setOnlyUnhandled] = useState<'否' | '是'>('否');
  const [statusOpen, setStatusOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [synced, setSynced] = useState(0);

  const storeRef = useRef<HTMLDivElement>(null);
  const platformRef = useRef<HTMLDivElement>(null);
  const rangeRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (storeRef.current && !storeRef.current.contains(target)) setStoreOpen(false);
      if (platformRef.current && !platformRef.current.contains(target)) setPlatformOpen(false);
      if (rangeRef.current && !rangeRef.current.contains(target)) setRangeOpen(false);
      if (statusRef.current && !statusRef.current.contains(target)) setStatusOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (storeOpen || platformOpen || rangeOpen || statusOpen) {
        setStoreOpen(false);
        setPlatformOpen(false);
        setRangeOpen(false);
        setStatusOpen(false);
        return;
      }
      if (!submitting) onClose();
    };
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [storeOpen, platformOpen, rangeOpen, statusOpen, submitting, onClose]);

  useEffect(() => {
    if (!submitting) return undefined;
    if (synced >= SYNC_TOTAL) {
      const done = window.setTimeout(() => {
        onSubmitted();
        onClose();
      }, 350);
      return () => window.clearTimeout(done);
    }
    const timer = window.setTimeout(() => setSynced((prev) => Math.min(SYNC_TOTAL, prev + 8)), 120);
    return () => window.clearTimeout(timer);
  }, [submitting, synced, onSubmitted, onClose]);

  const platformStores = useMemo(
    () => (platformId ? stores.filter((store) => store.platform === platformId) : stores),
    [stores, platformId],
  );

  const filteredStores = useMemo(() => {
    const keyword = storeKeyword.trim().toLowerCase();
    return keyword
      ? platformStores.filter((store) => store.name.toLowerCase().includes(keyword))
      : platformStores;
  }, [platformStores, storeKeyword]);

  const storeGroups = useMemo(() => {
    const groups = platforms
      .map((platform) => ({
        id: platform.id,
        label: platform.label,
        stores: filteredStores.filter((store) => store.platform === platform.id),
      }))
      .filter((group) => group.stores.length > 0);
    const knownPlatformIds = new Set(platforms.map((platform) => platform.id));
    const rest = filteredStores.filter((store) => !knownPlatformIds.has(store.platform));
    return rest.length ? [...groups, { id: '', label: '其他平台', stores: rest }] : groups;
  }, [filteredStores, platforms]);

  const platformName = platformId
    ? platforms.find((platform) => platform.id === platformId)?.label ?? '全部平台'
    : '全部平台';

  const changePlatform = (id: string) => {
    setPlatformId(id);
    setPlatformOpen(false);
    setSelectedStores((prev) => prev.filter((name) => {
      const store = stores.find((item) => item.name === name);
      return !store || !id || store.platform === id;
    }));
  };

  const toggleStore = (name: string) => {
    setSelectedStores((prev) => (prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]));
  };

  const shownTags = selectedStores.slice(0, 2);
  const restCount = selectedStores.length - shownTags.length;

  const rangeText = rangeStart
    ? `${rangeStart} 至 ${rangeEnd || '结束日期'}`
    : '开始日期 至 结束日期';

  const months = [view, { y: view.m === 11 ? view.y + 1 : view.y, m: (view.m + 1) % 12 }];

  const shiftMonth = (delta: number) => {
    const next = new Date(view.y, view.m + delta, 1);
    setView({ y: next.getFullYear(), m: next.getMonth() });
  };

  const pickDay = (y: number, m: number, d: number) => {
    const value = fmtDate(y, m, d);
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(value);
      setRangeEnd('');
      return;
    }
    if (value < rangeStart) {
      setRangeStart(value);
      return;
    }
    setRangeEnd(value);
    setRangeOpen(false);
  };

  const dayState = (y: number, m: number, d: number) => {
    const value = fmtDate(y, m, d);
    return {
      start: value === rangeStart,
      end: value === rangeEnd,
      inRange: Boolean(rangeStart && rangeEnd && value > rangeStart && value < rangeEnd),
    };
  };

  const progress = Math.round((synced / SYNC_TOTAL) * 10000) / 100;

  return (
    <div className="syd-mask">
      <div className="syd-dialog" role="dialog" aria-modal="true" aria-label="同步店铺订单">
        <div className="syd-header">
          <span className="syd-title">同步店铺订单</span>
          <button type="button" className="syd-close" aria-label="关闭" onClick={onClose} disabled={submitting}>
            <IconClose />
          </button>
        </div>

        <div className="syd-body">
          <div className="syd-field">
            <span className="syd-label">平台：</span>
            <div className="syd-select" ref={platformRef}>
              <div
                className={'syd-select__box' + (platformOpen ? ' is-open' : '')}
                onClick={() => setPlatformOpen((open) => !open)}
              >
                <span className="syd-select__value">{platformName}</span>
                <span className="syd-caret">
                  <IconChevron />
                </span>
              </div>
              {platformOpen ? (
                <div className="syd-menu">
                  {[{ id: '', label: '全部平台' }, ...platforms].map((platform) => (
                    <div
                      className={'syd-menu__item' + (platform.id === platformId ? ' is-checked' : '')}
                      key={platform.id || 'all'}
                      onClick={() => changePlatform(platform.id)}
                    >
                      <span className="syd-menu__label">{platform.label}</span>
                      {platform.id === platformId ? <span className="syd-menu__check"><IconCheck /></span> : null}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="syd-field">
            <span className="syd-label">选择店铺：</span>
            <div className="syd-select" ref={storeRef}>
              <div
                className={'syd-select__box' + (storeOpen ? ' is-open' : '')}
                onClick={() => setStoreOpen(true)}
              >
                {shownTags.map((name) => (
                  <span className="syd-tag" key={name}>
                    <span className="syd-tag__text">{name}</span>
                    <span
                      className="syd-tag__close"
                      role="button"
                      aria-label={`移除${name}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleStore(name);
                      }}
                    >
                      ×
                    </span>
                  </span>
                ))}
                {restCount > 0 ? <span className="syd-tag syd-tag--more">{`+ ${restCount}`}</span> : null}
                <input
                  className="syd-select__input"
                  value={storeKeyword}
                  placeholder={selectedStores.length ? '' : '搜索/选择店铺'}
                  onChange={(event) => {
                    setStoreKeyword(event.target.value);
                    setStoreOpen(true);
                  }}
                  onFocus={() => setStoreOpen(true)}
                />
                <span className="syd-caret">
                  <IconChevron />
                </span>
              </div>
              {storeOpen ? (
                <div className="syd-menu">
                  {storeGroups.length ? storeGroups.map((group) => (
                    <div className="syd-menu__group" key={group.id || 'other'}>
                      <div className="syd-menu__group-title">{group.label}</div>
                      {group.stores.map((store) => {
                        const checked = selectedStores.includes(store.name);
                        return (
                          <div
                            className={'syd-menu__item' + (checked ? ' is-checked' : '')}
                            key={store.name}
                            onClick={() => toggleStore(store.name)}
                          >
                            <span className="syd-menu__label">{store.name}</span>
                            {checked ? <span className="syd-menu__check"><IconCheck /></span> : null}
                          </div>
                        );
                      })}
                    </div>
                  )) : <div className="syd-menu__empty">无匹配店铺</div>}
                </div>
              ) : null}
            </div>
          </div>

          <div className="syd-field">
            <span className="syd-label">选择时间：</span>
            <div className="syd-range" ref={rangeRef}>
              <div
                className={'syd-range__box' + (rangeOpen ? ' is-open' : '')}
                onClick={() => setRangeOpen((open) => !open)}
              >
                <span className={'syd-range__icon' + (rangeStart ? ' is-filled' : '')}>
                  <IconCalendar />
                </span>
                <span className={'syd-range__text' + (rangeStart ? ' is-filled' : '')}>{rangeText}</span>
                {rangeStart ? (
                  <span
                    className="syd-range__clear"
                    role="button"
                    aria-label="清除日期"
                    onClick={(event) => {
                      event.stopPropagation();
                      setRangeStart('');
                      setRangeEnd('');
                    }}
                  >
                    ×
                  </span>
                ) : null}
              </div>
              {rangeOpen ? (
                <div className="syd-panel">
                  <div className="syd-panel__head">
                    <button type="button" className="syd-panel__nav" onClick={() => shiftMonth(-1)}>〈</button>
                    <button type="button" className="syd-panel__nav" onClick={() => shiftMonth(1)}>〉</button>
                  </div>
                  <div className="syd-panel__months">
                    {months.map((month) => {
                      const first = new Date(month.y, month.m, 1).getDay();
                      const days = new Date(month.y, month.m + 1, 0).getDate();
                      const cells: Array<number | null> = [
                        ...Array.from({ length: first }, () => null),
                        ...Array.from({ length: days }, (_, index) => index + 1),
                      ];
                      return (
                        <div className="syd-month" key={`${month.y}-${month.m}`}>
                          <div className="syd-month__title">{`${month.y} 年 ${pad2(month.m + 1)} 月`}</div>
                          <div className="syd-month__week">
                            {['日', '一', '二', '三', '四', '五', '六'].map((week) => <span key={week}>{week}</span>)}
                          </div>
                          <div className="syd-month__grid">
                            {cells.map((day, index) => {
                              if (day === null) return <span key={`blank-${index}`} />;
                              const state = dayState(month.y, month.m, day);
                              return (
                                <button
                                  type="button"
                                  key={day}
                                  className={'syd-day'
                                    + (state.start ? ' is-start' : '')
                                    + (state.end ? ' is-end' : '')
                                    + (state.inRange ? ' is-in-range' : '')}
                                  onClick={() => pickDay(month.y, month.m, day)}
                                >
                                  {day}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="syd-field">
            <span className="syd-label">指定订单：</span>
            <input
              className="syd-input"
              type="text"
              placeholder="请输入指定订单"
              value={orderNo}
              onChange={(event) => setOrderNo(event.target.value)}
            />
          </div>

          <div className="syd-field syd-field--last">
            <span className="syd-label">仅同步未处理订单：</span>
            <div className="syd-select" ref={statusRef}>
              <div
                className={'syd-select__box' + (statusOpen ? ' is-open' : '')}
                onClick={() => setStatusOpen((open) => !open)}
              >
                <span className="syd-select__value">{onlyUnhandled}</span>
                <span className="syd-caret">
                  <IconChevron />
                </span>
              </div>
              {statusOpen ? (
                <div className="syd-menu">
                  {(['否', '是'] as const).map((option) => (
                    <div
                      className={'syd-menu__item' + (option === onlyUnhandled ? ' is-checked' : '')}
                      key={option}
                      onClick={() => {
                        setOnlyUnhandled(option);
                        setStatusOpen(false);
                      }}
                    >
                      <span className="syd-menu__label">{option}</span>
                      {option === onlyUnhandled ? <span className="syd-menu__check"><IconCheck /></span> : null}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          {submitting ? (
            <div className="syd-loading" role="status">
              <Spinner />
              <span className="syd-loading__text">{`正在同步订单，已同步 ${synced} 条，总共 ${SYNC_TOTAL} 条，目前进度 ${progress.toFixed(2)}%`}</span>
            </div>
          ) : null}
        </div>

        <div className="syd-footer">
          <button type="button" className="syd-btn syd-btn--default" onClick={onClose} disabled={submitting}>取消</button>
          <button
            type="button"
            className="syd-btn syd-btn--primary"
            disabled={submitting}
            onClick={() => {
              setSynced(0);
              setSubmitting(true);
            }}
          >
            确认同步
          </button>
        </div>
      </div>
    </div>
  );
}
