import React, { useEffect, useRef, useState } from 'react';

import '../claim-product-dialog.css';
import dhIcon from '../assets/icon-dhgate.png';
import shopifyIcon from '../assets/icon-shopify.png';
import necklace from '../assets/claim-necklace.jpg';
import ClaimMethodSection, { type ClaimMethodHandle } from './ClaimMethodSection';

export const CLAIM_PLATFORMS = [
  { id: 'dhgate', name: '敦煌网', icon: dhIcon },
  { id: 'shopify', name: 'shopify', icon: shopifyIcon },
];

export const CLAIM_STORES: Record<string, string[]> = {
  dhgate: ['运营测试-张诗淇专用', '服装测试', 'shoes', 'bag'],
  shopify: ['camel-captain', 'camel-outlet', 'camel-home'],
};

export const TOTAL_CLAIM_STORES = Object.values(CLAIM_STORES).reduce((sum, list) => sum + list.length, 0);

function IconClose() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
      <path d="M4.4 4.4l7.2 7.2M11.6 4.4l-7.2 7.2" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2.4 6.2 4.9 8.6 9.6 3.6" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" />
      <path d="M10.4 10.4l3.1 3.1" />
    </svg>
  );
}

function IconPromotion() {
  return (
    <svg viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
      <path d="M13.2 1.1 1.9 5.6c-.6.2-.6 1 .1 1.2l3 .9 1 3c.2.7 1 .7 1.2.1l4.6-9.4c.2-.5-.3-1-.6-.3ZM6.3 9.6l-.6-2 4.8-4.2-3.4 5.5-.8 1.4Z" />
    </svg>
  );
}

function IconEdit() {
  return (
    <svg viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
      <path d="M2 10.6h1.9l6-6-1.9-1.9-6 6V10.6Zm9.8-8.1a.7.7 0 0 1 0 1l-1.2 1.2-1.9-1.9L10.6 1.6a.7.7 0 0 1 1.2.9ZM1.4 12.6h11.2v-1.2H1.4v1.2Z" />
    </svg>
  );
}

export default function ClaimProductDialog({
  onClose,
  initialSelection = [],
  productTitle,
  productImage,
  onClaim,
}: {
  onClose: () => void;
  initialSelection?: string[];
  productTitle?: string;
  productImage?: string;
  onClaim?: (stores: string[]) => void;
}) {
  const [viewPlatformId, setViewPlatformId] = useState<string>(() => {
    const matched = CLAIM_PLATFORMS.find((item) => (CLAIM_STORES[item.id] ?? []).some((name) => initialSelection.includes(name)));
    return matched?.id ?? 'shopify';
  });
  const [selected, setSelected] = useState<string[]>(initialSelection);
  const [storeKeyword, setStoreKeyword] = useState('');
  const [claimMode, setClaimMode] = useState<'claim' | 'publish'>('claim');
  const [toast, setToast] = useState('');
  const methodRef = useRef<ClaimMethodHandle>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const showToast = (message: string) => {
    window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(''), 2400);
  };

  const submitClaim = (mode: 'direct' | 'auto') => {
    const result = methodRef.current?.validate();
    if (result && !result.ok) {
      if (result.toast) showToast(result.toast);
      return;
    }
    if (mode === 'auto' && multiPlatform) return;
    onClaim?.(selected);
    onClose();
  };
  const storesOf = (id: string) => CLAIM_STORES[id] ?? [];
  const stores = storesOf(viewPlatformId);
  const storeQuery = storeKeyword.trim().toLowerCase();
  const visibleStores = storeQuery
    ? stores.filter((name) => name.toLowerCase().includes(storeQuery))
    : stores;
  const selectedHere = stores.filter((name) => selected.includes(name));
  const allSelected = visibleStores.length > 0 && visibleStores.every((name) => selected.includes(name));
  const someVisibleSelected = visibleStores.some((name) => selected.includes(name));
  const involvedPlatforms = CLAIM_PLATFORMS.filter((item) => storesOf(item.id).some((name) => selected.includes(name)));
  const multiPlatform = involvedPlatforms.length > 1;
  const platformNames = involvedPlatforms.map((item) => item.name);
  const currentPlatform = CLAIM_PLATFORMS.find((item) => item.id === viewPlatformId) ?? CLAIM_PLATFORMS[0];
  const isPublish = claimMode === 'publish';
  const publishTip = isPublish && !multiPlatform;
  const footerTip = multiPlatform
    ? '多平台认领不支持自动编辑'
    : publishTip ? '请先通过批量编辑完善商品信息，否则可能发布失败' : '';

  const toggleStore = (name: string) => {
    setSelected((prev) => (prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]));
  };

  const toggleAll = () => {
    setSelected((prev) => (allSelected
      ? prev.filter((name) => !visibleStores.includes(name))
      : Array.from(new Set([...prev, ...visibleStores]))));
  };

  const footerStatus = selected.length === 0
    ? `平台 ${currentPlatform.name} 已选0个店铺`
    : platformNames.length > 1
      ? `已选${selected.length}个店铺（${platformNames.join('、')}）`
      : `平台 ${platformNames[0]} 已选${selected.length}个店铺`;

  return (
    <div className="capd-overlay" onClick={onClose}>
      <div className="capd-dialog" role="dialog" aria-label="认领商品" onClick={(e) => e.stopPropagation()}>
        <div className="capd-header">
          <h3 className="capd-title">认领商品</h3>
          <button className="capd-close" type="button" aria-label="关闭" onClick={onClose}>
            <IconClose />
          </button>
        </div>

        <div className="capd-body">
          <div className="capd-cols">
            <div className="capd-products">
              <div className="capd-product">
                <span className="capd-product-img">
                  <img src={productImage ?? necklace} alt="" />
                </span>
                <span className="capd-product-name">
                  {productTitle ?? '新款海蓝宝水滴项链女小众设计轻奢锁骨链高级感蓝色吊坠气质通勤'}
                </span>
              </div>
              <div className="capd-products-more">共 1 个商品</div>
            </div>

            <div className="capd-main">
              <div className="capd-field" data-annotation-id="capd-platform-single">
                <div className="capd-field-label">选择认领平台</div>
                <div className="capd-platforms">
                  {CLAIM_PLATFORMS.map((item) => {
                    const active = item.id === viewPlatformId;
                    const hasSelected = storesOf(item.id).some((name) => selected.includes(name));
                    return (
                      <div
                        key={item.id}
                        className={active ? 'capd-platform is-selected' : 'capd-platform'}
                        role="button"
                        aria-pressed={active}
                        aria-label={`查看${item.name}店铺`}
                        onClick={() => setViewPlatformId(item.id)}
                        data-annotation-id={item.id === 'shopify' ? 'capd-platform-shopify' : undefined}
                      >
                        <img className="capd-platform-icon" src={item.icon} alt={item.name} />
                        <span className="capd-platform-name">{item.name}</span>
                        {hasSelected && (
                          <span className="capd-platform-check" title="已有勾选店铺">
                            <IconCheck />
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="capd-field capd-field--stores">
                <div className="capd-label-row">
                  <div className="capd-field-label">
                    选择店铺<span className="capd-field-sub">{`（可多选）已选择${selectedHere.length}个店铺`}</span>
                  </div>
                  <label
                    className={'capd-select-all' + (visibleStores.length ? '' : ' is-disabled')}
                    onClick={() => { if (visibleStores.length) toggleAll(); }}
                  >
                    <span
                      className={'capd-select-all-box'
                        + (allSelected ? ' is-checked' : someVisibleSelected ? ' is-indeterminate' : '')}
                    />
                    <span className="capd-select-all-text">全选</span>
                  </label>
                </div>
                <div className="capd-store-search">
                  <span className="capd-store-search-icon" aria-hidden="true"><IconSearch /></span>
                  <input
                    className="capd-store-search-input"
                    type="text"
                    value={storeKeyword}
                    placeholder="搜索店铺名称"
                    aria-label="搜索店铺名称"
                    onChange={(e) => setStoreKeyword(e.target.value)}
                  />
                  {storeKeyword ? (
                    <button
                      className="capd-store-search-clear"
                      type="button"
                      aria-label="清空搜索"
                      onClick={() => setStoreKeyword('')}
                    >
                      <IconClose />
                    </button>
                  ) : null}
                </div>
                <div className="capd-stores">
                  {visibleStores.length === 0 ? (
                    <div className="capd-store-empty">没有匹配的店铺</div>
                  ) : null}
                  {visibleStores.map((name) => {
                    const checked = selected.includes(name);
                    return (
                      <div
                        key={`${viewPlatformId}-${name}`}
                        className={checked ? 'capd-store is-checked' : 'capd-store'}
                        role="checkbox"
                        aria-checked={checked}
                        onClick={() => toggleStore(name)}
                      >
                        <span className={'capd-store-check' + (checked ? ' is-checked' : '')} />
                        <span className="capd-store-name">{name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <ClaimMethodSection
            ref={methodRef}
            onClaimModeChange={setClaimMode}
          />

          <div className={'capd-footer'
            + (multiPlatform ? ' has-tip' : '')
            + (publishTip ? ' has-publish-tip' : '')}>
            <span className="capd-footer-status">{footerStatus}</span>
            <div className="capd-footer-actions">
              {selected.length === 0 && <span className="capd-footer-hint">请至少选择 1 个店铺</span>}
              {isPublish && !multiPlatform ? null : (
                <button
                  className="capd-btn capd-btn--direct"
                  type="button"
                  disabled={selected.length === 0}
                  onClick={() => submitClaim('direct')}
                >
                  <IconPromotion />
                  <span>直接认领</span>
                </button>
              )}
              <div className="capd-auto-wrap">
                <button
                  className="capd-btn capd-btn--auto"
                  type="button"
                  disabled={selected.length === 0 || multiPlatform}
                  onClick={() => submitClaim('auto')}
                  data-annotation-id="capd-auto-edit-shared"
                >
                  <IconEdit />
                  <span>自动编辑</span>
                </button>
                {footerTip && (
                  <span
                    className={'capd-auto-tip' + (publishTip ? ' is-publish' : '')}
                    role="tooltip"
                  >
                    {footerTip}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {toast ? <div className="capd-toast" role="status">{toast}</div> : null}
    </div>
  );
}
