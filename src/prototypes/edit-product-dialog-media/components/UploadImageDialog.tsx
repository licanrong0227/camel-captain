/**
 * 上传图片弹窗（仅样式，本地/URL/引用、单个/批量均不可切换）。
 */

import React from 'react';
import '../upload-image.css';

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function PictureIcon() {
  return (
    <svg width="62" height="62" viewBox="0 0 24 24" fill="none" stroke="#c0c4cc" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

export default function UploadImageDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="ui-overlay">
      <div className="ui-modal" role="dialog" aria-modal="true" aria-label="上传图片">
        <div className="ui-header">
          <span className="ui-title">上传图片</span>
          <button className="ui-close" type="button" aria-label="关闭" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="ui-body">
          <div className="ui-tabs">
            <span className="ui-tab is-active">本地</span>
            <span className="ui-tab">URL</span>
            <span className="ui-tab">引用</span>
          </div>

          <div className="ui-content">
            <div className="ui-radios">
              <label className="ui-radio is-active">
                <input type="radio" name="uiWay" disabled checked readOnly />
                <span className="ui-radio-mask" />
                <span>单个上传</span>
              </label>
              <label className="ui-radio">
                <input type="radio" name="uiWay" disabled readOnly />
                <span className="ui-radio-mask" />
                <span>批量上传</span>
              </label>
            </div>

            <div className="ui-drop">
              <PictureIcon />
              <div className="ui-drop-text">
                将文件拖到此处，或<span className="ui-drop-link">点击上传</span>
              </div>
              <div className="ui-drop-tip">按 Ctrl+V 可从剪贴板上传</div>
            </div>
          </div>
        </div>

        <div className="ui-footer">
          <button className="ui-btn ui-btn--cancel" type="button" onClick={onClose}>取消</button>
          <button className="ui-btn ui-btn--confirm" type="button" onClick={onClose}>确认</button>
        </div>
      </div>
    </div>
  );
}
