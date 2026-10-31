import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { AD_STORES, ORDER_LABELS } from '../ad-data';
import { fmtInt, fmtMoney, type AdExclusionConfig } from '../ad-report';
import { MultiSelect } from './MultiSelect';

interface Props {
  configs: AdExclusionConfig[];
  excludedGmv: number;
  excludedCount: number;
  manualTotal: number;
  onSave: (next: AdExclusionConfig[]) => void;
  onClose: () => void;
}

export function AdExclusionDialog({ configs, excludedGmv, excludedCount, manualTotal, onSave, onClose }: Props) {
  const [draft, setDraft] = useState<AdExclusionConfig[]>(configs);

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

  const patch = (storeId: number, next: Partial<AdExclusionConfig>) => {
    setDraft((prev) => prev.map((item) => (item.storeId === storeId ? { ...item, ...next } : item)));
  };

  return (
    <div className="ss-modal" onMouseDown={onClose}>
      <div className="ss-dialog ss-excl-dialog" role="dialog" aria-modal="true" aria-label="剔除补单 GMV" onMouseDown={(event) => event.stopPropagation()}>
        <div className="ss-dialog-header">
          <span className="ss-dialog-title">剔除补单 GMV</span>
          <button type="button" className="ss-dialog-close" onClick={onClose} aria-label="关闭"><X size={16} /></button>
        </div>
        <div className="ss-dialog-body">
          <p className="ss-excl-desc">
            补单（虚假成交）会拉高整店 GMV，让广告占比看起来更健康。这里剔除后，整店 GMV、广告占比、ROAS 都会按剔除后的数字重算。
          </p>
          <table className="ss-excl-table">
            <thead>
              <tr>
                <th style={{ width: 140 }}>店铺</th>
                <th>按订单标签剔除（可多选）</th>
                <th style={{ width: 210 }}>手动指定订单号（逗号分隔）</th>
                <th style={{ width: 120 }}>手动扣减金额</th>
              </tr>
            </thead>
            <tbody>
              {AD_STORES.map((store) => {
                const config = draft.find((item) => item.storeId === store.storeId) || {
                  storeId: store.storeId,
                  excludeLabelIds: [],
                  manualOrderNos: [],
                  manualAmount: 0,
                };
                return (
                  <tr key={store.storeId}>
                    <td>
                      <span className="ss-excl-store">{store.storeName}</span>
                      <span className="ss-excl-alias">{store.aliasName}</span>
                    </td>
                    <td>
                      <MultiSelect
                        value={config.excludeLabelIds}
                        options={ORDER_LABELS.map((label) => ({ value: label.id, label: label.name, description: label.description }))}
                        placeholder="选择要剔除的标签"
                        width={210}
                        onChange={(next) => patch(store.storeId, { excludeLabelIds: next })}
                      />
                    </td>
                    <td>
                      <input
                        className="ss-input ss-excl-order-input"
                        placeholder="如 DH202610280012"
                        value={config.manualOrderNos.join(',')}
                        onChange={(event) =>
                          patch(store.storeId, {
                            manualOrderNos: event.target.value
                              .split(',')
                              .map((item) => item.trim())
                              .filter(Boolean),
                          })
                        }
                      />
                    </td>
                    <td>
                      <input
                        className="ss-input ss-excl-amount-input"
                        type="number"
                        min={0}
                        step={10}
                        placeholder="0"
                        value={config.manualAmount || ''}
                        onChange={(event) => patch(store.storeId, { manualAmount: Math.max(0, Number(event.target.value) || 0) })}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="ss-excl-note">
            当前区间已剔除 <strong>{fmtMoney(excludedGmv)}</strong> · {fmtInt(excludedCount)} 单
            {manualTotal > 0 ? `（其中手动扣减 ${fmtMoney(manualTotal)}）` : ''}；手动扣减金额只影响整店 GMV，不拆分到具体链接。
          </p>
        </div>
        <div className="ss-dialog-footer">
          <button type="button" className="ss-btn ss-btn--default ss-btn--small" onClick={onClose}>取消</button>
          <button type="button" className="ss-btn ss-btn--primary ss-btn--small" onClick={() => onSave(draft)}>保存并重算</button>
        </div>
      </div>
    </div>
  );
}
