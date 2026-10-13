/**
 * @name 批量美图-转白底
 */

import React, { useState, useRef, useCallback } from 'react';
import './style.css';

import bag1 from './assets/bag-1.jpg';
import bag2 from './assets/bag-2.jpg';
import bag3 from './assets/bag-3.jpg';
import bag4 from './assets/bag-4.jpg';
import bag5 from './assets/bag-5.jpg';
import { AnnotationViewer, type AnnotationSourceDocument } from '@axhub/annotation';
import annotationSourceDocument from './annotation-source.json';

const TABS = [
  { label: '转白底', active: true },
  { label: '翻译', active: false },
  { label: '加水印', active: false },
  { label: '去水印', active: false },
  { label: '裁剪缩放', active: false },
];

const IMAGES = [
  { src: bag1, title: '图1', size: '1200*' },
  { src: bag2, title: '图2', size: '1200*' },
  { src: bag3, title: '图3', size: '1200*' },
  { src: bag4, title: '图4', size: '600*' },
  { src: bag5, title: '图5', size: '600*' },
];

const CheckIcon: React.FC<{ size?: number; strokeWidth?: number }> = ({ size = 12, strokeWidth = 3 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CloseIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const Spinner: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg className="biw-flower" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    {Array.from({ length: 12 }).map((_, i) => (
      <rect
        key={i}
        x="10.6"
        y="1.5"
        width="2.8"
        height="7"
        rx="1.4"
        fill="currentColor"
        transform={`rotate(${i * 30} 12 12)`}
        opacity={1 - i / 12}
      />
    ))}
  </svg>
);

const BatchImageWhiteBg: React.FC = () => {
  const [startLoading, setStartLoading] = useState(false);
  const [hasProcessed, setHasProcessed] = useState(false);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleStart = useCallback(() => {
    if (startLoading) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setStartLoading(false);
    } else {
      setHasProcessed(true);
      setStartLoading(true);
      timerRef.current = setTimeout(() => {
        setStartLoading(false);
        timerRef.current = null;
      }, 5000);
    }
  }, [startLoading]);

  const handleExitClick = () => {
    setExitDialogOpen(true);
  };

  const handleExitConfirm = () => {
    setExitDialogOpen(false);
    setModalOpen(false);
  };

  return (
    <>
      <div className="biw-overlay">
            {modalOpen && (
            <div className="biw-modal">
              <div className="biw-header">
                <h2 className="biw-title">批量美图</h2>
                <button className="biw-close" type="button" aria-label="关闭" onClick={handleExitClick}>
                  <CloseIcon />
                </button>
              </div>
      
              <div className="biw-body">
                <aside className={`biw-tabs${startLoading ? ' biw-tabs--disabled' : ''}`} data-annotation-id="tabs-switch-disable">
                  {TABS.map((tab) => (
                    <div key={tab.label} className={`biw-tab ${tab.active ? 'biw-tab--active' : ''}`}>
                      {tab.label}
                    </div>
                  ))}
                </aside>
      
                <div className="biw-main">
                  <div className="biw-toolbar">
                    <div className="biw-selection">
                      <span className="biw-checkbox">
                        <CheckIcon size={10} strokeWidth={4} />
                      </span>
                      <span className="biw-select-all">全选</span>
                      <span className="biw-count">已选 5/5 张</span>
                    </div>
                    <button
                      className={`biw-start-btn${startLoading ? ' biw-start-btn--processing' : ''}`}
                      type="button"
                      onClick={handleStart}
                    >
                      {startLoading && <Spinner size={16} />}
                      {startLoading ? '停止处理' : '开始处理'}
                      {!startLoading && <span className="biw-help">?</span>}
                    </button>
                  </div>
      
                  <div className="biw-grid">
                    {IMAGES.map((img) => (
                      <div className="biw-item" key={img.title}>
                        <div className="biw-card">
                          <img className="biw-card-img" src={img.src} alt={img.title} />
                          <span className="biw-card-check">
                            <CheckIcon size={12} strokeWidth={3.5} />
                          </span>
                          <span className="biw-card-bar">
                            <span className="biw-card-size">{img.size}</span>
                            <span className="biw-card-done">
                              <CheckIcon size={10} strokeWidth={3.5} />
                              已完成
                            </span>
                          </span>
                        </div>
                        <div className="biw-card-title">{img.title}</div>
                      </div>
                    ))}
                  </div>
      
                  <div className="biw-footer">
                    <button className="biw-btn biw-btn--cancel" type="button" onClick={handleExitClick} data-annotation-id="exit-save-guide">取消</button>
                    <div className="biw-confirm-wrap">
                      <div className="biw-bubble" data-annotation-id="unsaved-bubble">有已处理未保存的图片</div>
                      <button
                        className={`biw-btn biw-btn--confirm${startLoading ? ' biw-btn--loading' : ''}`}
                        type="button"
                        disabled={startLoading}
                      >
                        {startLoading && <Spinner size={14} />}
                        确认
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            )}
      
            {exitDialogOpen && (
              <div className="biw-exit-overlay">
                <div className="biw-exit-dialog">
                  <div className="biw-exit-header">
                    <h3 className="biw-exit-title">提示</h3>
                    <button className="biw-close" type="button" aria-label="关闭" onClick={() => setExitDialogOpen(false)}>
                      <CloseIcon />
                    </button>
                  </div>
                  <div className="biw-exit-body">
                    当前有已处理未保存的图片，退出后，已处理的图片将不会保存，是否继续退出？
                  </div>
                  <div className="biw-exit-footer">
                    <button className="biw-btn biw-btn--cancel" type="button" onClick={handleExitConfirm}>退出</button>
                    <button className="biw-btn biw-btn--confirm" type="button" onClick={handleExitConfirm}>保存并退出</button>
                  </div>
                </div>
              </div>
            )}
          </div>
      <AnnotationViewer
        source={annotationSourceDocument as unknown as AnnotationSourceDocument}
        options={{
          currentPageId: (() => {
            const hashPageId = new URLSearchParams(window.location.hash.replace(/^#/, '')).get('page');
            const searchPageId = new URLSearchParams(window.location.search.replace(/^\?/, '')).get('page');
            const pageId = hashPageId || searchPageId;
            return typeof pageId === 'string' && /^[a-z0-9-]+$/u.test(pageId)
              ? pageId
              : "batch-image-white-bg";
          })(),
          onDirectoryRoute: (node) => {
            if (typeof node.route === 'string' && /^[a-z0-9-]+$/u.test(node.route)) {
              window.location.hash = `page=${node.route}`;
            }
          },
          toolbarEdge: 'right',
          showToolbar: true,
          showThemeToggle: true,
          showColorFilter: true,
          emptyWhenNoData: true,
        }}
      />
    </>
  );
};

export default BatchImageWhiteBg;
