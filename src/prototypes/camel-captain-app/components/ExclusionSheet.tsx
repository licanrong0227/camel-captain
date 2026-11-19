import React, { useEffect, useState } from 'react';
import { Check, ChevronDown, ChevronRight, Search } from 'lucide-react';
import { AD_STORES } from '../data/catalog';
import { fmtMoney } from '../data/format';
import { ORDER_LABELS, type ExclusionConfig } from '../data/types';
import { Sheet } from './Sheet';

function configOf(draft: ExclusionConfig[], storeId: number): ExclusionConfig {
  return draft.find((item) => item.storeId === storeId) ?? {
    storeId,
    excludeLabelIds: [],
    manualOrderNos: [],
    manualAmount: 0,
  };
}

function summaryOf(config: ExclusionConfig) {
  const parts: string[] = [];
  if (config.excludeLabelIds.length) parts.push(`${config.excludeLabelIds.length} 个标签`);
  if (config.manualOrderNos.length) parts.push(`${config.manualOrderNos.length} 个订单号`);
  if (config.manualAmount > 0) parts.push(`扣减 ${fmtMoney(config.manualAmount)}`);
  return parts.join(' · ');
}

export function ExclusionSheet({
  open,
  configs,
  onSave,
  onClose,
}: {
  open: boolean;
  configs: ExclusionConfig[];
  onSave: (next: ExclusionConfig[]) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<ExclusionConfig[]>(configs);
  const [view, setView] = useState<'list' | 'config'>('list');
  const [storeId, setStoreId] = useState(AD_STORES[0]?.id ?? 0);
  const [labelSheetOpen, setLabelSheetOpen] = useState(false);
  const [storeQuery, setStoreQuery] = useState('');
  const [labelQuery, setLabelQuery] = useState('');

  useEffect(() => {
    if (open) {
      setDraft(configs);
      setView('list');
      setStoreId(AD_STORES[0]?.id ?? 0);
      setLabelSheetOpen(false);
      setStoreQuery('');
      setLabelQuery('');
    }
  }, [open, configs]);

  const current = configOf(draft, storeId);

  const patch = (next: Partial<ExclusionConfig>) => {
    setDraft((prev) => {
      const exists = prev.some((item) => item.storeId === storeId);
      if (!exists) return [...prev, { ...current, ...next }];
      return prev.map((item) => (item.storeId === storeId ? { ...item, ...next } : item));
    });
  };

  const toggleLabel = (id: string) => {
    const next = current.excludeLabelIds.includes(id)
      ? current.excludeLabelIds.filter((item) => item !== id)
      : [...current.excludeLabelIds, id];
    patch({ excludeLabelIds: next });
  };

  const currentStore = AD_STORES.find((store) => store.id === storeId) ?? AD_STORES[0];
  const selectedLabels = ORDER_LABELS.filter((label) => current.excludeLabelIds.includes(label.id));
  const storeKeyword = storeQuery.trim().toLowerCase();
  const labelKeyword = labelQuery.trim().toLowerCase();
  const filteredStores = AD_STORES.filter((store) => (
    !storeKeyword
    || store.name.toLowerCase().includes(storeKeyword)
    || store.alias.toLowerCase().includes(storeKeyword)
  ));
  const filteredLabels = ORDER_LABELS.filter((label) => (
    !labelKeyword
    || label.name.toLowerCase().includes(labelKeyword)
    || label.description.toLowerCase().includes(labelKeyword)
  ));
  const configuredCount = draft.filter((item) => summaryOf(item)).length;

  return (
    <>
      <Sheet
        open={open}
        title={view === 'config' ? '剔除配置' : '剔除数据 GMV'}
        height={660}
        onClose={onClose}
        footer={
          <div className="cc-sheet-actions">
            <button type="button" className="cc-btn cc-btn--ghost" onClick={onClose}>取消</button>
            <button type="button" className="cc-btn cc-btn--primary" onClick={() => { onSave(draft); onClose(); }}>保存并重算</button>
          </div>
        }
      >
        {view === 'list' ? (
          <>
            <p className="cc-note">剔除后只影响 GMV 金额类指标，广告消耗、广告 GMV、投产比不变。</p>

            <div className="cc-store-search">
              <Search size={15} />
              <input
                className="cc-input"
                placeholder="搜索店铺名称 / 别名"
                value={storeQuery}
                onChange={(event) => setStoreQuery(event.target.value)}
              />
            </div>

            <div className="cc-excl-summary">
              <span>已配置 <strong>{configuredCount}</strong> / {AD_STORES.length} 家店铺</span>
            </div>

            <div className="cc-excl-list">
              {filteredStores.map((store) => {
                const config = configOf(draft, store.id);
                const summary = summaryOf(config);
                return (
                  <button
                    type="button"
                    key={store.id}
                    className="cc-excl-store-row"
                    onClick={() => {
                      setStoreId(store.id);
                      setView('config');
                    }}
                  >
                    <span className="cc-excl-store-main">
                      <strong>{store.name}</strong>
                      <small>{store.alias}</small>
                    </span>
                    <span className={`cc-excl-state${summary ? ' is-on' : ''}`}>
                      <em>{summary ? '已配置' : '未配置'}</em>
                    </span>
                    <ChevronRight size={15} className="cc-excl-arrow" />
                  </button>
                );
              })}
              {filteredStores.length === 0 ? <div className="cc-select-empty">没有匹配的店铺</div> : null}
            </div>
          </>
        ) : (
          <>
            <button type="button" className="cc-back-link" onClick={() => setView('list')}>
              ‹ 返回店铺列表
            </button>
            <div className="cc-excl-store-head">
              <strong>{currentStore?.name}</strong>
              <small>{currentStore?.alias}</small>
              <button
                type="button"
                className="cc-excl-clear"
                onClick={() => patch({ excludeLabelIds: [], manualOrderNos: [], manualAmount: 0 })}
              >
                清空配置
              </button>
            </div>

            <div className="cc-form-block">
              <button
                type="button"
                className="cc-select-trigger"
                onClick={() => {
                  setLabelSheetOpen(true);
                  setLabelQuery('');
                }}
              >
                <span className="cc-select-trigger-main">
                  <span className="cc-select-trigger-label">按订单标签剔除（可多选）</span>
                  <span className="cc-select-trigger-value">
                    {selectedLabels.length ? `已选 ${selectedLabels.length} 个标签` : '请选择要剔除的标签'}
                  </span>
                </span>
                <ChevronDown size={14} />
              </button>
              {selectedLabels.length ? (
                <div className="cc-selected-label-row">
                  {selectedLabels.slice(0, 4).map((label) => (
                    <span className="cc-tag is-orange" key={label.id}>{label.name}</span>
                  ))}
                  {selectedLabels.length > 4 ? <span className="cc-tag">+{selectedLabels.length - 4}</span> : null}
                </div>
              ) : null}
            </div>

            <div className="cc-form-block">
              <div className="cc-form-label">手动指定订单号（逗号分隔）</div>
              <input
                className="cc-input cc-input--box"
                placeholder="如 DH202610280012"
                value={current.manualOrderNos.join(',')}
                onChange={(event) => patch({
                  manualOrderNos: event.target.value.split(',').map((item) => item.trim()).filter(Boolean),
                })}
              />
            </div>

            <div className="cc-form-block">
              <div className="cc-form-label">手动扣减金额</div>
              <input
                className="cc-input cc-input--box"
                type="number"
                min={0}
                step={10}
                placeholder="0"
                value={current.manualAmount || ''}
                onChange={(event) => patch({ manualAmount: Math.max(0, Number(event.target.value) || 0) })}
              />
            </div>
          </>
        )}
      </Sheet>

      <Sheet
        open={labelSheetOpen}
        title="选择订单标签"
        height={560}
        onClose={() => setLabelSheetOpen(false)}
        footer={
          <div className="cc-sheet-actions">
            <button type="button" className="cc-btn cc-btn--ghost" onClick={() => patch({ excludeLabelIds: [] })}>清空</button>
            <button type="button" className="cc-btn cc-btn--primary" onClick={() => setLabelSheetOpen(false)}>
              完成（{selectedLabels.length}）
            </button>
          </div>
        }
      >
        <div className="cc-label-sheet-search">
          <Search size={15} />
          <input
            value={labelQuery}
            placeholder="搜索标签名称 / 说明"
            onChange={(event) => setLabelQuery(event.target.value)}
          />
        </div>
        <div className="cc-label-sheet-list">
          {filteredLabels.map((label) => {
            const checked = current.excludeLabelIds.includes(label.id);
            return (
              <button
                type="button"
                key={label.id}
                className={`cc-select-option cc-label-option${checked ? ' is-active' : ''}`}
                onClick={() => toggleLabel(label.id)}
              >
                <span className={`cc-check-box${checked ? ' is-checked' : ''}`}>{checked ? '✓' : ''}</span>
                <span className="cc-select-option-name">
                  <strong>{label.name}</strong>
                  <small>{label.description}</small>
                </span>
              </button>
            );
          })}
          {filteredLabels.length === 0 ? <div className="cc-select-empty">没有匹配的标签</div> : null}
        </div>
      </Sheet>
    </>
  );
}
