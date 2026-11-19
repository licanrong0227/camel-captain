import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Minus, Plus, X } from 'lucide-react';

export interface MetricOption {
  key: string;
  label: string;
}

export function MetricCardConfigDialog({
  title,
  options,
  visible,
  onChange,
  onReset,
  onClose,
}: {
  title: string;
  options: MetricOption[];
  visible: string[];
  onChange: (next: string[]) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const labelOf = (key: string) => options.find((option) => option.key === key)?.label ?? key;
  const hidden = options.filter((option) => !visible.includes(option.key));
  const remove = (key: string) => {
    if (visible.length <= 1) return;
    onChange(visible.filter((item) => item !== key));
  };
  const move = (index: number, delta: number) => {
    const next = visible.slice();
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return createPortal(
    <div className="hd-modal-mask" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="hd-modal hd-metric-config-dialog" role="dialog" aria-modal="true" aria-label="指标卡设置">
        <div className="hd-rank-dialog-header">
          <div className="hd-rank-dialog-title-wrap">
            <span className="hd-rank-dialog-title">指标卡设置 · {title}</span>
            <span className="hd-rank-dialog-count">已展示 {visible.length} / {options.length} 个指标</span>
          </div>
          <button type="button" className="hd-excl-close" onClick={onClose} aria-label="关闭"><X size={18} /></button>
        </div>

        <div className="hd-metric-config-body">
          <div className="hd-metric-config-section">
            <span>已展示</span>
            <em>调整顺序后立即生效，至少保留 1 个</em>
          </div>
          {visible.map((key, index) => (
            <div className="hd-metric-config-row" key={key}>
              <div className="hd-metric-config-name">
                <button
                  type="button"
                  className="hd-metric-remove-btn"
                  disabled={visible.length <= 1}
                  aria-label={`移除${labelOf(key)}`}
                  title={visible.length <= 1 ? '每个页签至少保留 1 张指标卡' : `移除${labelOf(key)}`}
                  onClick={() => remove(key)}
                >
                  <Minus size={12} />
                </button>
                <span>{labelOf(key)}</span>
              </div>
              <div className="hd-metric-config-actions">
                <button type="button" disabled={index === 0} onClick={() => move(index, -1)} aria-label="上移">↑</button>
                <button type="button" disabled={index === visible.length - 1} onClick={() => move(index, 1)} aria-label="下移">↓</button>
              </div>
            </div>
          ))}

          <div className="hd-metric-config-section">
            <span>已关闭</span>
            <em>点击添加即恢复展示，排在末尾</em>
          </div>
          {hidden.length === 0 ? (
            <div className="hd-metric-config-empty">全部指标均已展示</div>
          ) : (
            hidden.map((option) => (
              <div className="hd-metric-config-row is-hidden" key={option.key}>
                <div className="hd-metric-config-name">
                  <button
                    type="button"
                    className="hd-metric-add-btn"
                    aria-label={`添加${option.label}`}
                    title={`添加${option.label}`}
                    onClick={() => onChange([...visible, option.key])}
                  >
                    <Plus size={12} />
                  </button>
                  <span>{option.label}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="hd-metric-config-footer">
          <span className="hd-link" onClick={onReset}>恢复默认</span>
          <button type="button" className="hd-btn is-default" onClick={onClose}>完成</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
