import React, { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { STORES, STORE_GROUPS } from '../data/catalog';
import { Sheet } from './Sheet';

export function StoreFilterSheet({
  open,
  selected,
  onChange,
  onClose,
}: {
  open: boolean;
  selected: number[];
  onChange: (next: number[]) => void;
  onClose: () => void;
}) {
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    if (open) setKeyword('');
  }, [open]);

  const allStoreIds = useMemo(() => STORES.map((store) => store.id), []);
  const selectedSet = new Set(selected);

  const groups = useMemo(
    () => STORE_GROUPS
      .map((group) => ({
        id: group.id,
        name: group.name,
        stores: STORES.filter((store) => store.groupId === group.id),
      }))
      .filter((group) => group.stores.length > 0),
    [],
  );

  const filteredGroups = groups
    .map((group) => ({
      ...group,
      stores: group.stores.filter((store) => {
        const text = keyword.trim().toLowerCase();
        if (!text) return true;
        return store.name.toLowerCase().includes(text) || store.alias.toLowerCase().includes(text);
      }),
    }))
    .filter((group) => group.stores.length > 0);

  const isChecked = (id: number) => selectedSet.has(id);

  const commit = (next: number[]) => onChange(Array.from(new Set(next)));

  const toggleStore = (id: number) => {
    commit(selectedSet.has(id) ? selected.filter((item) => item !== id) : [...selected, id]);
  };

  const toggleGroup = (ids: number[]) => {
    const allInGroup = ids.every((id) => selectedSet.has(id));
    commit(allInGroup ? selected.filter((id) => !ids.includes(id)) : [...selected, ...ids]);
  };

  const count = selected.length;

  return (
    <Sheet
      open={open}
      title="店铺"
      height={660}
      onClose={onClose}
      footer={
        <div className="cc-sheet-actions">
          <button type="button" className="cc-btn cc-btn--ghost" onClick={() => onChange([])}>重置</button>
          <button type="button" className="cc-btn cc-btn--primary" onClick={onClose}>完成</button>
        </div>
      }
    >
      <div className="cc-store-summary">
        {count > 0 ? (
          <span>已选 <strong>{count}</strong> / {allStoreIds.length} 家店铺</span>
        ) : (
          <span>未选店铺，默认统计全部 {allStoreIds.length} 家</span>
        )}
        <button type="button" className="cc-text-btn" onClick={() => onChange([])}>全部店铺</button>
      </div>

      <div className="cc-store-search">
        <Search size={15} />
        <input
          className="cc-input"
          placeholder="搜索店铺名称 / 别名"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />
      </div>

      <div className="cc-store-groups">
        {filteredGroups.map((group) => {
          const groupIds = group.stores.map((store) => store.id);
          const groupAll = groupIds.every((id) => isChecked(id));
          return (
            <div className="cc-store-group" key={group.id}>
              <div className="cc-store-group-head">
                <span>{group.name}</span>
                <button
                  type="button"
                  className={`cc-check${groupAll ? ' is-checked' : ''}`}
                  role="checkbox"
                  aria-checked={groupAll}
                  onClick={() => toggleGroup(groupIds)}
                >
                  <span className="cc-check-box">{groupAll ? '✓' : ''}</span>
                  <span>全选</span>
                </button>
              </div>
              {group.stores.map((store) => {
                const checked = isChecked(store.id);
                return (
                  <button
                    type="button"
                    key={store.id}
                    className={`cc-store-row${checked ? ' is-checked' : ''}`}
                    onClick={() => toggleStore(store.id)}
                  >
                    <span className={`cc-check-box${checked ? ' is-checked' : ''}`}>{checked ? '✓' : ''}</span>
                    <span className="cc-store-name">{store.name}</span>
                    <span className="cc-store-alias">{store.alias}</span>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </Sheet>
  );
}
