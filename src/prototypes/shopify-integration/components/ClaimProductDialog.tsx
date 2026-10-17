import React, { useState } from 'react';

import '../claim-product-dialog.css';
import dhIcon from '../assets/icon-dhgate.png';
import shopifyIcon from '../assets/icon-shopify.png';
import necklace from '../assets/claim-necklace.jpg';

const PLATFORMS = [
  { id: 'dhgate', name: '敦煌网', icon: dhIcon },
  { id: 'shopify', name: 'shopify', icon: shopifyIcon },
];

const PLATFORM_STORES: Record<string, string[]> = {
  dhgate: ['运营测试-张诗淇专用', '服装测试', 'shoes', 'bag'],
  shopify: ['camel-captain', 'camel-outlet', 'camel-home'],
};

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

export default function ClaimProductDialog({ onClose }: { onClose: () => void }) {
  const [platformId, setPlatformId] = useState('shopify');
  const platform = PLATFORMS.find((item) => item.id === platformId) ?? PLATFORMS[0];
  const stores = PLATFORM_STORES[platformId] ?? [];

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
                  <img src={necklace} alt="" />
                </span>
                <span className="capd-product-name">
                  新款海蓝宝水滴项链女小众设计轻奢锁骨链高级感蓝色吊坠气质通勤
                </span>
              </div>
              <div className="capd-products-more">共 1 个商品</div>
            </div>

            <div className="capd-main">
              <div className="capd-field" data-annotation-id="capd-platform-single">
                <div className="capd-field-label">选择认领平台</div>
                <div className="capd-platforms">
                  {PLATFORMS.map((item) => (
                    <div
                      key={item.id}
                      className={item.id === platformId ? 'capd-platform is-selected' : 'capd-platform'}
                      onClick={() => setPlatformId(item.id)}
                      data-annotation-id={item.id === 'shopify' ? 'capd-platform-shopify' : undefined}
                    >
                      <img className="capd-platform-icon" src={item.icon} alt={item.name} />
                      <span className="capd-platform-name">{item.name}</span>
                      {item.id === platformId && (
                        <span className="capd-platform-check">
                          <IconCheck />
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="capd-field capd-field--stores">
                <div className="capd-label-row">
                  <div className="capd-field-label">
                    选择店铺<span className="capd-field-sub">（可多选）已选择0个店铺</span>
                  </div>
                  <label className="capd-select-all">
                    <span className="capd-select-all-box" />
                    <span className="capd-select-all-text">全选</span>
                  </label>
                </div>
                <div className="capd-stores">
                  {stores.map((name) => (
                    <div key={`${platformId}-${name}`} className="capd-store">
                      <span className="capd-store-check" />
                      <span className="capd-store-name">{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="capd-footer">
            <span className="capd-footer-status">{`平台 ${platform.name} 已选0个店铺`}</span>
            <div className="capd-footer-actions">
              <span className="capd-footer-hint">请至少选择 1 个店铺</span>
              <button className="capd-btn capd-btn--direct" type="button" disabled>
                <IconPromotion />
                <span>直接认领</span>
              </button>
              <button
                className="capd-btn capd-btn--auto"
                type="button"
                disabled
                data-annotation-id="capd-auto-edit-shared"
              >
                <IconEdit />
                <span>自动编辑</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
