/**
 * 停止视频生成确认弹窗：告知已消耗算力无法返还。
 */

import React from 'react';
import '../ai-video.css';

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function StopVideoDialog({ open, onClose, onConfirm }: Props) {
  if (!open) return null;

  return (
    <div className="av-mask av-mask--confirm" onClick={onClose}>
      <div
        className="av-dialog av-confirm"
        role="alertdialog"
        aria-modal="true"
        aria-label="停止生成"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="av-head">
          <h3 className="av-title">停止生成</h3>
          <button className="av-close" type="button" aria-label="关闭" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="av-confirm__body">
          停止后本次视频生成将中断，<b>已消耗的算力无法返还</b>。
        </div>
        <div className="av-foot">
          <div className="av-foot__actions">
            <button className="av-btn" type="button" onClick={onClose}>
              取消
            </button>
            <button className="av-btn av-btn--primary" type="button" onClick={onConfirm}>
              停止生成
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
