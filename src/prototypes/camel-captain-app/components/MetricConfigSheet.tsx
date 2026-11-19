import React, { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Minus, Plus } from 'lucide-react';
import { Sheet } from './Sheet';

export function MetricConfigSheet({
  open,
  title,
  options,
  keys,
  onChange,
  onClose,
}: {
  open: boolean;
  title: string;
  options: Array<{ key: string; label: string }>;
  keys: string[];
  onChange: (next: string[]) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<string[]>(keys);

  useEffect(() => {
    if (open) setDraft(keys);
  }, [open, keys]);

  const labelOf = (key: string) => options.find((option) => option.key === key)?.label ?? key;

  const update = (next: string[]) => {
    setDraft(next);
    onChange(next);
  };

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= draft.length) return;
    const next = [...draft];
    [next[index], next[target]] = [next[target], next[index]];
    update(next);
  };

  const remove = (key: string) => {
    if (draft.length <= 1) return;
    update(draft.filter((item) => item !== key));
  };

  const hidden = options.filter((option) => !draft.includes(option.key));

  return (
    <Sheet
      open={open}
      title={`指标卡设置 · ${title}`}
      height={560}
      onClose={onClose}
      footer={
        <div className="cc-sheet-actions cc-sheet-actions--split">
          <button type="button" className="cc-text-link" onClick={() => update(options.map((option) => option.key))}>恢复默认</button>
          <button type="button" className="cc-btn cc-btn--primary cc-btn--inline" onClick={onClose}>完成</button>
        </div>
      }
    >
      <p className="cc-metric-count">已展示 {draft.length} / {options.length} 个指标</p>

      <div className="cc-config-section">
        <span>已展示</span>
        <em>调整顺序后立即生效，至少保留 1 个</em>
      </div>
      <div className="cc-config-list">
        {draft.map((key, index) => (
          <div className="cc-config-row" key={key}>
            <button
              type="button"
              className="cc-config-op"
              aria-label={`移除${labelOf(key)}`}
              disabled={draft.length <= 1}
              onClick={() => remove(key)}
            >
              <Minus size={12} />
            </button>
            <span className="cc-config-name">{labelOf(key)}</span>
            <button type="button" className="cc-config-op" aria-label="上移" disabled={index === 0} onClick={() => move(index, -1)}>
              <ArrowUp size={13} />
            </button>
            <button type="button" className="cc-config-op" aria-label="下移" disabled={index === draft.length - 1} onClick={() => move(index, 1)}>
              <ArrowDown size={13} />
            </button>
          </div>
        ))}
      </div>

      <div className="cc-config-section">
        <span>已关闭</span>
        <em>点击添加即恢复展示，排在末尾</em>
      </div>
      {hidden.length === 0 ? (
        <div className="cc-config-empty">全部指标均已展示</div>
      ) : (
        <div className="cc-config-list">
          {hidden.map((option) => (
            <div className="cc-config-row is-hidden" key={option.key}>
              <button
                type="button"
                className="cc-config-op"
                aria-label={`添加${option.label}`}
                onClick={() => update([...draft, option.key])}
              >
                <Plus size={12} />
              </button>
              <span className="cc-config-name">{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </Sheet>
  );
}
