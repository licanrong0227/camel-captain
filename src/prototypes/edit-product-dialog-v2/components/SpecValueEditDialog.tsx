/**
 * 编辑规格值内容弹窗：参考线上系统的「编辑规格值内容」，输入框 + 一键清空 + 取消/确定。
 */

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import './spec-value-edit.css';

export default function SpecValueEditDialog({
  value,
  error,
  onChange,
  onClear,
  onClose,
  onConfirm,
}: {
  value: string;
  error: string | null;
  onChange: (next: string) => void;
  onClear: () => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const closeRef = useRef(onClose);
  const confirmRef = useRef(onConfirm);
  closeRef.current = onClose;
  confirmRef.current = onConfirm;

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRef.current();
      if (event.key === 'Enter' && !event.isComposing) confirmRef.current();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="sve-mask">
      <div className="sve-dialog" role="dialog" aria-modal="true" aria-label="编辑规格值内容">
        <header className="sve-head">
          <h3 className="sve-title">编辑规格值内容</h3>
          <span className="sve-count">{value.length}/40</span>
          <button type="button" className="sve-close" aria-label="关闭" onClick={onClose}>
            <X size={16} />
          </button>
        </header>

        <div className="sve-body">
          <input
            ref={inputRef}
            className="sve-input"
            placeholder="请输入规格值"
            maxLength={40}
            value={value}
            aria-label="规格值内容"
            onChange={(event) => onChange(event.target.value)}
          />
          <div className="sve-actions">
            <button type="button" className="sve-clear" onClick={onClear}>
              一键清空
            </button>
          </div>
          {error && <p className="sve-error">{error}</p>}
        </div>

        <footer className="sve-foot">
          <button type="button" className="sve-btn" onClick={onClose}>
            取消
          </button>
          <button type="button" className="sve-btn sve-btn--primary" onClick={onConfirm}>
            确定
          </button>
        </footer>
      </div>
    </div>
  );
}
