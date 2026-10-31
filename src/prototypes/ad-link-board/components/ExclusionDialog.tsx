import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { MultiSelect } from './ui';
import { ORDER_LABELS, STORES } from '../data/catalog';
import type { StoreExclusion } from '../data/types';
import { fmtMoney, fmtInt } from '../data/format';

interface Props {
  open: boolean;
  configs: StoreExclusion[];
  excludedGmv: number;
  excludedCount: number;
  manualTotal: number;
  onSave: (next: StoreExclusion[]) => void;
  onClose: () => void;
}

export function ExclusionDialog(props: Props) {
  const [draft, setDraft] = useState<StoreExclusion[]>(props.configs);

  useEffect(() => {
    if (props.open) setDraft(props.configs);
  }, [props.open, props.configs]);

  useEffect(() => {
    if (!props.open) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') props.onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [props.open, props.onClose]);

  if (!props.open) return null;

  const patch = (storeId: number, next: Partial<StoreExclusion>) => {
    setDraft((prev) => prev.map((cfg) => (cfg.storeId === storeId ? { ...cfg, ...next } : cfg)));
  };

  return (
    <div className="adr-modal" role="dialog" aria-modal="true" aria-label="剔除补单 GMV">
      <div className="adr-modal__mask" onClick={props.onClose} />
      <div className="adr-modal__panel">
        <header className="adr-modal__head">
          <div>
            <h3>剔除补单 GMV</h3>
            <p>补单（虚假成交）会拉高整店 GMV，让广告占比看起来更健康。这里剔除后，整店 GMV、广告占比、ROAS 都会按剔除后的数字重算。</p>
          </div>
          <button type="button" className="adr-iconbtn" onClick={props.onClose} aria-label="关闭">
            <X size={16} />
          </button>
        </header>

        <div className="adr-modal__body">
          <table className="adr-mini-table adr-excl-table">
            <thead>
              <tr>
                <th>店铺</th>
                <th>按订单标签剔除（可多选）</th>
                <th>手动指定订单号（逗号分隔）</th>
                <th className="is-num">手动扣减金额</th>
              </tr>
            </thead>
            <tbody>
              {STORES.map((store) => {
                const cfg = draft.find((item) => item.storeId === store.storeId) ?? {
                  storeId: store.storeId,
                  excludeLabelIds: [],
                  manualOrderNos: [],
                  manualAmount: 0,
                };
                return (
                  <tr key={store.storeId}>
                    <td>
                      <span className="adr-store-cell__name">{store.storeName}</span>
                      <span className="adr-store-cell__alias"> {store.aliasName}</span>
                    </td>
                    <td>
                      <MultiSelect
                        value={cfg.excludeLabelIds}
                        options={ORDER_LABELS.map((label) => ({
                          value: label.id,
                          label: label.name,
                          description: label.description,
                        }))}
                        placeholder="选择要剔除的标签"
                        width={210}
                        onChange={(next) => patch(store.storeId, { excludeLabelIds: next })}
                      />
                    </td>
                    <td>
                      <input
                        className="adr-input"
                        placeholder="如 DH202610280012"
                        value={cfg.manualOrderNos.join(',')}
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
                    <td className="is-num">
                      <input
                        className="adr-input adr-input--num"
                        type="number"
                        min={0}
                        step={10}
                        value={cfg.manualAmount || ''}
                        placeholder="0"
                        onChange={(event) => patch(store.storeId, { manualAmount: Math.max(0, Number(event.target.value) || 0) })}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="adr-modal__note">
            当前区间已剔除 <strong>{fmtMoney(props.excludedGmv)}</strong> · {fmtInt(props.excludedCount)} 单
            {props.manualTotal > 0 ? `（其中手动扣减 ${fmtMoney(props.manualTotal)}）` : ''}；
            手动扣减金额只影响整店 GMV，不拆分到具体链接。
          </p>
        </div>

        <footer className="adr-modal__foot">
          <button type="button" className="adr-btn" onClick={props.onClose}>
            取消
          </button>
          <button type="button" className="adr-btn adr-btn--primary" onClick={() => props.onSave(draft)}>
            保存并重算
          </button>
        </footer>
      </div>
    </div>
  );
}
