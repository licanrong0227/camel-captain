import React from 'react';

import '../add-store-dialog.css';

function IconClose() {
  return (
    <svg className="asd-close-ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <path d="M4.4 4.4l7.2 7.2M11.6 4.4l-7.2 7.2" />
    </svg>
  );
}

function IconCaret() {
  return (
    <svg className="asd-caret" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.6 4.6 6 8l3.4-3.4" />
    </svg>
  );
}

export default function AddStoreDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="asd-overlay" onClick={onClose}>
      <div className="asd-dialog" role="dialog" aria-label="新增店铺" onClick={(e) => e.stopPropagation()}>
        <div className="asd-header">
          <h3 className="asd-title">新增店铺</h3>
          <button className="asd-close" type="button" aria-label="关闭" onClick={onClose}>
            <IconClose />
          </button>
        </div>

        <div className="asd-form">
          <div className="asd-item">
            <span className="asd-label is-required">平台名称</span>
            <div className="asd-field asd-field--select">
              <span className="asd-ph">请选择平台</span>
              <IconCaret />
            </div>
          </div>

          <div className="asd-item">
            <span className="asd-label is-required">店铺名称</span>
            <div className="asd-field asd-field--input">
              <span className="asd-ph">请输入店铺名称</span>
            </div>
          </div>

          <div className="asd-item">
            <span className="asd-label is-required">店铺别名</span>
            <div className="asd-field asd-field--input">
              <span className="asd-ph">请输入店铺别名</span>
            </div>
          </div>

          <div className="asd-item">
            <span className="asd-label">子账号</span>
            <div className="asd-field asd-field--select">
              <span className="asd-ph">请选择子账号</span>
              <IconCaret />
            </div>
          </div>

          <div className="asd-item">
            <span className="asd-label">状态</span>
            <div className="asd-radios">
              <span className="asd-radio-item is-checked">
                <span className="asd-dot" />
                <span className="asd-radio-text">启用</span>
              </span>
              <span className="asd-radio-item">
                <span className="asd-dot" />
                <span className="asd-radio-text">禁用</span>
              </span>
            </div>
          </div>

          <div className="asd-auth-section">
          </div>
        </div>

        <div className="asd-footer">
          <button className="asd-btn asd-btn--ghost" type="button" onClick={onClose}>
            取消
          </button>
          <button className="asd-btn asd-btn--primary" type="button" onClick={onClose}>
            确定
          </button>
        </div>
      </div>
    </div>
  );
}
