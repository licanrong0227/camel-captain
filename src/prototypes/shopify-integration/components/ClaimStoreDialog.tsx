import React, { useState } from 'react';

import { CLAIM_PLATFORMS, CLAIM_STORES, TOTAL_CLAIM_STORES } from './ClaimProductDialog';

function IconClose() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
      <path d="M4.4 4.4l7.2 7.2M11.6 4.4l-7.2 7.2" />
    </svg>
  );
}

export default function ClaimStoreDialog({
  productTitle,
  claimedStores,
  onClose,
  onClaim,
}: {
  productTitle: string;
  claimedStores: string[];
  onClose: () => void;
  onClaim: (stores: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleStore = (name: string) => {
    setSelected((prev) => (prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]));
  };

  return (
    <div className="csd-overlay" onClick={onClose}>
      <div className="csd-dialog" role="dialog" aria-modal="true" aria-label="认领店铺" onClick={(e) => e.stopPropagation()}>
        <div className="csd-header">
          <h3 className="csd-title">认领店铺</h3>
          <button className="csd-close" type="button" aria-label="关闭" onClick={onClose}>
            <IconClose />
          </button>
        </div>

        <div className="csd-summary">
          <span className="csd-product" title={productTitle}>{productTitle}</span>
          <span className="csd-total">{`已认领 ${claimedStores.length}/${TOTAL_CLAIM_STORES}`}</span>
        </div>

        <div className="csd-body">
          {CLAIM_PLATFORMS.map((platform) => {
            const stores = CLAIM_STORES[platform.id] ?? [];
            const claimedCount = stores.filter((name) => claimedStores.includes(name)).length;
            return (
              <div className="csd-group" key={platform.id}>
                <div className="csd-group-head">
                  <img className="csd-group-icon" src={platform.icon} alt="" />
                  <span className="csd-group-name">{platform.name}</span>
                  <span className="csd-group-count">{`已认领 ${claimedCount}/${stores.length}`}</span>
                </div>
                {stores.map((name) => {
                  const claimed = claimedStores.includes(name);
                  const checked = selected.includes(name);
                  return (
                    <div
                      key={`${platform.id}-${name}`}
                      className={'csd-store' + (claimed ? ' is-claimed' : '') + (checked ? ' is-selected' : '')}
                      role="checkbox"
                      aria-checked={claimed || checked}
                      aria-disabled={claimed}
                      onClick={() => {
                        if (!claimed) toggleStore(name);
                      }}
                    >
                      <span className={'cc-checkbox' + (claimed || checked ? ' is-checked' : '') + (claimed ? ' is-disabled' : '')} />
                      <span className="csd-store-name">{name}</span>
                      <span className={claimed ? 'csd-tag is-claimed' : 'csd-tag'}>{claimed ? '已认领' : '未认领'}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div className="csd-footer">
          <span className="csd-selected">{`已选 ${selected.length} 个未认领店铺`}</span>
          <div className="csd-actions">
            <button className="csd-btn" type="button" onClick={onClose}>取消</button>
            <button
              className="csd-btn csd-btn--primary"
              type="button"
              disabled={selected.length === 0}
              onClick={() => onClaim(selected)}
            >
              认领
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
