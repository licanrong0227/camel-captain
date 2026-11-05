import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { AD_STORES } from '../data/catalog';
import { fmtInt, fmtMoney } from '../data/format';
import { ORDER_LABELS, type ExclusionConfig } from '../data/types';
import { MultiSelect } from './MultiSelect';

export function ExclusionDialog({
  configs,
  excludedGmv,
  excludedCount,
  manualTotal,
  onSave,
  onClose,
}: {
  configs: ExclusionConfig[];
  excludedGmv: number;
  excludedCount: number;
  manualTotal: number;
  onSave: (next: ExclusionConfig[]) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<ExclusionConfig[]>(configs);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  const patch = (storeId: number, next: Partial<ExclusionConfig>) => {
    setDraft((prev) => prev.map((item) => (item.storeId === storeId ? { ...item, ...next } : item)));
  };

  return (
    <div className="hd-modal-mask" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="hd-modal hd-excl-dialog" role="dialog" aria-modal="true" aria-label="剔除补单 GMV">
        <div className="hd-excl-header">
          <span className="hd-excl-title">剔除补单 GMV</span>
          <button type="button" className="hd-excl-close" onClick={onClose} aria-label="关闭"><X size={18} /></button>
        </div>
        <div className="hd-excl-body">
          <p className="hd-excl-desc">
            补单（虚假成交）会拉高整店 GMV，让广告占比看起来更健康。剔除后只影响 GMV 金额类指标，
            广告消耗、广告 GMV、投产比不变。
          </p>
          <table className="hd-excl-table">
            <thead>
              <tr>
                <th style={{ width: 150 }}>店铺</th>
                <th>按订单标签剔除（可多选）</th>
                <th style={{ width: 210 }}>手动指定订单号（逗号分隔）</th>
                <th style={{ width: 128 }}>手动扣减金额</th>
              </tr>
            </thead>
            <tbody>
              {AD_STORES.map((store) => {
                const config = draft.find((item) => item.storeId === store.id) || {
                  storeId: store.id,
                  excludeLabelIds: [],
                  manualOrderNos: [],
                  manualAmount: 0,
                };
                return (
                  <tr key={store.id}>
                    <td>
                      <span className="hd-excl-store">{store.name}</span>
                      <span className="hd-excl-alias">{store.alias}</span>
                    </td>
                    <td>
                      <MultiSelect
                        value={config.excludeLabelIds}
                        options={ORDER_LABELS.map((label) => ({ value: label.id, label: label.name, description: label.description }))}
                        placeholder="选择要剔除的标签"
                        width={210}
                        onChange={(next) => patch(store.id, { excludeLabelIds: next })}
                      />
                    </td>
                    <td>
                      <input
                        className="hd-input hd-excl-order-input"
                        placeholder="如 DH202610280012"
                        value={config.manualOrderNos.join(',')}
                        onChange={(event) =>
                          patch(store.id, {
                            manualOrderNos: event.target.value.split(',').map((item) => item.trim()).filter(Boolean),
                          })
                        }
                      />
                    </td>
                    <td>
                      <input
                        className="hd-input hd-excl-amount-input"
                        type="number"
                        min={0}
                        step={10}
                        placeholder="0"
                        value={config.manualAmount || ''}
                        onChange={(event) => patch(store.id, { manualAmount: Math.max(0, Number(event.target.value) || 0) })}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="hd-excl-note">
            当前区间已剔除 <strong>{fmtMoney(excludedGmv)}</strong> · {fmtInt(excludedCount)} 单
            {manualTotal > 0 ? `（其中手动扣减 ${fmtMoney(manualTotal)}）` : ''}；
            手动扣减金额计入最近一天（10/31），不拆分到具体链接。
          </p>
        </div>
        <div className="hd-excl-footer">
          <button type="button" className="hd-btn is-default" onClick={onClose}>取消</button>
          <button type="button" className="hd-btn is-primary" onClick={() => onSave(draft)}>保存并重算</button>
        </div>
      </div>
    </div>
  );
}
