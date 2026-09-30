/**
 * @name 个人中心-购买权益弹窗 - 骆驼队长BI
 */

import React, { useState } from 'react';
import { AnnotationViewer } from '@axhub/annotation';
import type { AnnotationSourceDocument, AnnotationViewerOptions } from '@axhub/annotation';
import annotationSourceDocument from './annotation-source.json';
import './style.css';

// ===== Icons =====
const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const CheckBadge = () => (
  <span className="pcd-check-badge">
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 12.5 9.5 18 20 6.5" />
    </svg>
  </span>
);

const HelpIcon = () => (
  <span className="pcd-help-icon">?</span>
);

// ===== Static data (from screenshot) =====
const QUANTITY_OPTIONS = ['50点', '1000点', '3000点', '10000点', '50000点'];
const ACTIVE_QUANTITY = '50点';
// 店铺数量期限档位（来自店铺数量选中态截图）
const STORE_TERMS: { label: string; discount: string | null }[] = [
  { label: '1月', discount: null },
  { label: '3月', discount: null },
  { label: '6月', discount: '9.5折' },
  { label: '1年', discount: '9折' },
  { label: '2年', discount: '8.5折' },
  { label: '3年', discount: '8折' },
];
const ACTIVE_TERM = '1年';

// 提示弹窗文案：全局共用弹窗的两种进入场景
const NOTICE_TEXT = {
  ai: '算力积分不足，请先购买算力积分。',
  shop: '创建店铺数量不足，请先购买店铺数量。',
};

type ItemKey = 'ai' | 'shop';

function StepBar() {
  return (
    <div className="pcd-steps">
      <div className="pcd-step is-active">
        <span className="pcd-step-num">1</span>
        <span className="pcd-step-label">选择</span>
      </div>
      <span className="pcd-step-line" />
      <div className="pcd-step">
        <span className="pcd-step-num">2</span>
        <span className="pcd-step-label">支付</span>
      </div>
      <span className="pcd-step-line" />
      <div className="pcd-step">
        <span className="pcd-step-num">3</span>
        <span className="pcd-step-label">完成</span>
      </div>
    </div>
  );
}

export default function PersonalCenterBi() {
  const [noticeScenario, setNoticeScenario] = useState<ItemKey | null>('ai');
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemKey>('ai');

  // 全局共用弹窗：根据进入场景默认选中对应购买项目
  const openPurchase = (item: ItemKey) => {
    setSelectedItem(item);
    setPurchaseOpen(true);
  };

  return (
    <div className="pcd-page">
      {noticeScenario && (
        <div className="pcd-overlay">
          <div className="pcd-modal pcd-notice" role="dialog" aria-label="提示">
            <header className="pcd-modal-header">
              <span className="pcd-modal-title">提示</span>
              <button type="button" className="pcd-close" aria-label="关闭" onClick={() => setNoticeScenario(null)}>
                <CloseIcon />
              </button>
            </header>
            <div className="pcd-notice-body">{NOTICE_TEXT[noticeScenario]}</div>
            <footer className="pcd-notice-footer">
              <button type="button" className="pcd-btn" onClick={() => setNoticeScenario(null)}>关闭</button>
              <button type="button" className="pcd-btn pcd-btn--primary" onClick={() => openPurchase(noticeScenario)}>购买</button>
            </footer>
          </div>
        </div>
      )}

      {purchaseOpen && (
        <div className="pcd-overlay">
          <div className="pcd-modal" role="dialog" aria-label="购买权益">
            <header className="pcd-modal-header" data-annotation-id="purchase-dialog-header">
              <span className="pcd-modal-title">购买权益</span>
              <button type="button" className="pcd-close" aria-label="关闭" onClick={() => setPurchaseOpen(false)}>
                <CloseIcon />
              </button>
            </header>

            <div className="pcd-body">
              <StepBar />

              <div className="pcd-brand-row">
                <div className="pcd-brand-right">
                  <span className="pcd-currency">
                    CNY
                    <ChevronDown />
                  </span>
                  <span className="pcd-member-est">
                    会员估算
                    <HelpIcon />
                  </span>
                </div>
              </div>

              <div className="pcd-section-label">购买项目</div>

              <div className="pcd-items">
                <div
                  className={'pcd-item' + (selectedItem === 'ai' ? ' is-active' : '')}
                  onClick={() => setSelectedItem('ai')}
                >
                  {selectedItem === 'ai' && <CheckBadge />}
                  <span className="pcd-item-icon">A</span>
                  <span className="pcd-item-name">AI算力</span>
                </div>
                <div
                  className={'pcd-item' + (selectedItem === 'shop' ? ' is-active' : '')}
                  onClick={() => setSelectedItem('shop')}
                >
                  {selectedItem === 'shop' && <CheckBadge />}
                  <span className="pcd-item-icon">店</span>
                  <span className="pcd-item-name">店铺数量</span>
                </div>
              </div>

              <div className="pcd-panel">
                <div className="pcd-panel-card">
                  <span className="pcd-item-icon pcd-item-icon--lg">{selectedItem === 'ai' ? 'A' : '店'}</span>
                  <span className="pcd-panel-card-name">{selectedItem === 'ai' ? 'AI算力' : '店铺数量'}</span>
                  {selectedItem === 'shop' && (
                    <div className="pcd-numbox-row">
                      <span className="pcd-numbox-label">数量</span>
                      <span className="pcd-numbox">
                        <span className="pcd-numbox-value">1</span>
                        <span className="pcd-numbox-spinners">
                          <span className="pcd-numbox-spinner">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 15 12 9 18 15" /></svg>
                          </span>
                          <span className="pcd-numbox-spinner">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                          </span>
                        </span>
                      </span>
                    </div>
                  )}
                </div>
                <div className="pcd-panel-content">
                  <div className="pcd-qty-label">{selectedItem === 'ai' ? '数量' : '期限'}</div>
                  <div className="pcd-chips">
                    {selectedItem === 'ai'
                      ? QUANTITY_OPTIONS.map((opt) => (
                          <span key={opt} className="pcd-chip-wrap">
                            <span className={'pcd-chip' + (opt === ACTIVE_QUANTITY ? ' is-active' : '')}>{opt}</span>
                          </span>
                        ))
                      : STORE_TERMS.map((term) => (
                          <span key={term.label} className="pcd-chip-wrap">
                            <span className={'pcd-chip' + (term.label === ACTIVE_TERM ? ' is-active' : '')}>{term.label}</span>
                            {term.discount && <span className="pcd-chip-badge">{term.discount}</span>}
                          </span>
                        ))}
                  </div>
                  <div className="pcd-price">
                    <span className="pcd-price-symbol">¥</span>
                    <span className="pcd-price-value">{selectedItem === 'ai' ? '1.75' : '214.92'}</span>
                  </div>
                </div>
              </div>

              <div className="pcd-footer">
                <button type="button" className="pcd-submit">提交订单</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 两种进入场景的演示入口（全局共用弹窗） */}
      <div className="pcd-demo-bar">
        <span className="pcd-demo-label">演示入口</span>
        <button
          type="button"
          className={'pcd-demo-btn' + (noticeScenario === 'ai' ? ' is-active' : '')}
          onClick={() => setNoticeScenario('ai')}
        >
          算力积分不足
        </button>
        <button
          type="button"
          className={'pcd-demo-btn' + (noticeScenario === 'shop' ? ' is-active' : '')}
          onClick={() => setNoticeScenario('shop')}
        >
          店铺数量不足
        </button>
      </div>

      <AnnotationViewer
        source={annotationSourceDocument as AnnotationSourceDocument}
        options={viewerOptions}
      />
    </div>
  );
}

const viewerOptions: AnnotationViewerOptions = {
  showToolbar: true,
  emptyWhenNoData: false,
};