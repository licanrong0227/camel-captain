import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface CascaderStore {
  id: number;
  label: string;
}

export interface CascaderGroup {
  id: string;
  label: string;
  stores: CascaderStore[];
}

function ElCheckbox({ checked, indeterminate }: { checked: boolean; indeterminate?: boolean }) {
  return (
    <span className={`el-checkbox${checked ? ' is-checked' : ''}${indeterminate ? ' is-indeterminate' : ''}`}>
      <span className="el-checkbox__inner" />
    </span>
  );
}

export function StoreCascader({
  groups,
  value,
  onChange,
  allLabel = '全部店铺（店群）',
  width = 250,
}: {
  groups: CascaderGroup[];
  value: number[];
  onChange: (next: number[]) => void;
  allLabel?: string;
  width?: number;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeGroupId, setActiveGroupId] = useState(groups[0]?.id ?? '');
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const allIds = useMemo(() => groups.flatMap((group) => group.stores.map((store) => store.id)), [groups]);
  const valueSet = useMemo(() => new Set(value), [value]);
  const allIdSet = useMemo(() => new Set(allIds), [allIds]);
  const effectiveSet = value.length === 0 ? allIdSet : valueSet;
  const groupMap = useMemo(() => {
    const map = new Map<string, CascaderGroup>();
    groups.forEach((group) => map.set(group.id, group));
    return map;
  }, [groups]);
  const activeGroup = groupMap.get(activeGroupId) ?? groups[0];
  const activeGroupSelection = activeGroup
    ? activeGroup.stores.filter((store) => effectiveSet.has(store.id)).length
    : 0;

  useEffect(() => {
    if (!groupMap.has(activeGroupId)) setActiveGroupId(groups[0]?.id ?? '');
  }, [groups, groupMap, activeGroupId]);

  const summary = useMemo(() => {
    if (allIds.length > 0 && (value.length === 0 || value.length === allIds.length)) return allLabel;
    if (value.length === 0) return '';
    const labels = value
      .map((id) => groups.flatMap((group) => group.stores).find((store) => store.id === id)?.label)
      .filter((label): label is string => Boolean(label));
    if (labels.length === 0) return '';
    if (labels.length <= 2) return labels.join('、');
    return `${labels[0]} 等 ${labels.length} 家`;
  }, [allIds, value, groups, allLabel]);

  const place = () => {
    const trigger = rootRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const panelWidth = 470;
    const panelHeight = 326;
    const top = rect.bottom + 4 + panelHeight > window.innerHeight ? Math.max(8, rect.top - panelHeight - 4) : rect.bottom + 4;
    setPos({ top, left: Math.max(8, Math.min(rect.left, window.innerWidth - panelWidth - 8)) });
  };

  useEffect(() => {
    if (!open) return undefined;
    place();
    const onDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
      setQuery('');
    };
    const onScroll = (event: Event) => {
      if (rootRef.current?.contains(event.target as Node) || panelRef.current?.contains(event.target as Node)) return;
      const trigger = rootRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) setOpen(false);
      else place();
    };
    const onResize = () => place();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', onDown, true);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown, true);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const openPanel = () => {
    if (!open) {
      const firstSelected = groups.find((group) => group.stores.some((store) => effectiveSet.has(store.id)));
      setActiveGroupId(firstSelected?.id ?? groups[0]?.id ?? '');
      place();
    }
    setOpen(true);
  };

  const togglePanel = () => {
    if (open) {
      setOpen(false);
      setQuery('');
    } else {
      openPanel();
    }
  };

  const toggleOne = (id: number) => {
    const base = value.length ? value : allIds;
    onChange(effectiveSet.has(id) ? base.filter((item) => item !== id) : Array.from(new Set([...base, id])));
  };

  const toggleGroup = (group: CascaderGroup) => {
    const base = value.length ? value : allIds;
    const ids = group.stores.map((store) => store.id);
    const allOn = ids.every((id) => effectiveSet.has(id));
    onChange(allOn ? base.filter((id) => !ids.includes(id)) : Array.from(new Set([...base, ...ids])));
  };

  const word = query.trim();
  const groupMatches = word ? groups.filter((group) => group.label.includes(word)) : [];
  const matchedGroupIds = new Set(groupMatches.map((group) => group.id));
  const storeMatches = word
    ? groups
        .filter((group) => !matchedGroupIds.has(group.id))
        .flatMap((group) => group.stores.filter((store) => store.label.includes(word)).map((store) => ({ group, store })))
    : [];
  const noMatch = word && groupMatches.length === 0 && storeMatches.length === 0;

  return (
    <div
      ref={rootRef}
      className={`el-cascader hd-store-cascader${open ? ' is-focus' : ''}`}
      style={{ width }}
      onClick={openPanel}
    >
      <div className="el-input el-input--small el-input--suffix">
        <span className="el-cascader__tags">
          {summary ? (
            <span className="el-tag el-tag--info el-tag--small el-tag--light" title={summary}>
              <span className="el-select__tags-text">{summary}</span>
              {value.length > 0 && value.length < allIds.length ? (
                <i
                  className="el-tag__close el-icon-close"
                  onClick={(event) => {
                    event.stopPropagation();
                    onChange([]);
                  }}
                >
                  ×
                </i>
              ) : null}
            </span>
          ) : null}
          <input
            className="el-input__inner el-cascader__search-input"
            value={query}
            placeholder={summary ? '搜索店铺/分组' : '请选择店铺'}
            onClick={(event) => event.stopPropagation()}
            onFocus={openPanel}
            onChange={(event) => {
              setQuery(event.target.value);
              openPanel();
            }}
          />
        </span>
        <span
          className="el-input__suffix"
          onClick={(event) => {
            event.stopPropagation();
            togglePanel();
          }}
        >
          <span className="el-input__suffix-inner">
            <i className="el-input__icon el-icon-arrow-up" />
          </span>
        </span>
      </div>

      {open && pos
        ? createPortal(
            <div
              ref={panelRef}
              className="el-cascader__dropdown hd-cascader-portal"
              style={{ top: pos.top, left: pos.left }}
              onClick={(event) => event.stopPropagation()}
            >
              {word ? (
                <div className="el-cascader-panel is-searchable">
                  {noMatch ? <p className="el-cascader-menu__empty-text">无匹配数据</p> : null}
                  <ul className="el-cascader__suggestion-list">
                    {groupMatches.map((group) => {
                      const ids = group.stores.map((store) => store.id);
                      const hit = ids.filter((id) => effectiveSet.has(id)).length;
                      const checked = ids.length > 0 && hit === ids.length;
                      const indeterminate = hit > 0 && !checked;
                      return (
                        <li
                          key={`g-${group.id}`}
                          className={`el-cascader__suggestion-item${checked ? ' is-checked' : ''}`}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => toggleGroup(group)}
                        >
                          <span>{group.label}（{ids.length} 家）</span>
                          <ElCheckbox checked={checked} indeterminate={indeterminate} />
                        </li>
                      );
                    })}
                    {storeMatches.map(({ group, store }) => {
                      const checked = effectiveSet.has(store.id);
                      return (
                        <li
                          key={`s-${store.id}`}
                          className={`el-cascader__suggestion-item${checked ? ' is-checked' : ''}`}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => toggleOne(store.id)}
                        >
                          <span><em>{group.label}</em> / {store.label}</span>
                          <ElCheckbox checked={checked} />
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : (
                <div className="el-cascader-panel">
                  <div className="el-cascader-menu">
                    <ul className="el-cascader-menu__list">
                      {groups.map((group) => {
                        const ids = group.stores.map((store) => store.id);
                        const hit = ids.filter((id) => effectiveSet.has(id)).length;
                        const checked = ids.length > 0 && hit === ids.length;
                        const indeterminate = hit > 0 && !checked;
                        return (
                          <li
                            key={group.id}
                            role="menuitem"
                            className={`el-cascader-node${group.id === activeGroup?.id ? ' in-active-path' : ''}${checked ? ' is-checked' : ''}`}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => setActiveGroupId(group.id)}
                          >
                            <span
                              className="el-cascader-node__check"
                              onClick={(event) => {
                                event.stopPropagation();
                                toggleGroup(group);
                              }}
                            >
                              <ElCheckbox checked={checked} indeterminate={indeterminate} />
                            </span>
                            <span className="el-cascader-node__label">{group.label}</span>
                            <span className="el-cascader-node__postfix">{group.stores.length} 家 ›</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  <div className="el-cascader-menu">
                    <ul className="el-cascader-menu__list">
                      {activeGroup?.stores.map((store) => {
                        const checked = effectiveSet.has(store.id);
                        return (
                          <li
                            key={store.id}
                            className={`el-cascader-node is-selectable${checked ? ' is-checked' : ''}`}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => toggleOne(store.id)}
                          >
                            <span className="el-cascader-node__check"><ElCheckbox checked={checked} /></span>
                            <span className="el-cascader-node__label">{store.label}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              )}
              <div className="hd-cascader-foot">
                <span>
                  {value.length === 0 ? `全部 ${allIds.length} 家` : `已选 ${value.length} 家`}
                  {activeGroup ? ` · 当前分组 ${activeGroupSelection}/${activeGroup.stores.length}` : ''}
                </span>
                <button type="button" className="hd-cascader-clear" onClick={() => onChange([])}>重置</button>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
