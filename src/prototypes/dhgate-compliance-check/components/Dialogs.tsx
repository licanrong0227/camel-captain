import React, { useState } from 'react';
import { Modal } from './ui';

const DISLIKE_REASONS = ['误报', '漏报', '原因不准', '建议不准', '参考信息缺失', '其他'];

export function FeedbackDialog({ itemName, onCancel, onSubmit }: { itemName: string; onCancel: () => void; onSubmit: (reasons: string[], text: string) => void }) {
  const [reasons, setReasons] = useState<string[]>([]);
  const [text, setText] = useState('');
  const toggle = (reason: string) =>
    setReasons((prev) => (prev.includes(reason) ? prev.filter((item) => item !== reason) : [...prev, reason]));
  return (
    <Modal
      title="反馈质检结果"
      onClose={onCancel}
      footer={
        <>
          <button type="button" className="dcc-btn" onClick={onCancel}>取消</button>
          <button type="button" className="dcc-btn dcc-btn--primary" disabled={reasons.length === 0 && !text.trim()} onClick={() => onSubmit(reasons, text.trim())}>提交</button>
        </>
      }
    >
      <p className="dcc-dialog-text">您对「{itemName}」的检测结果不满意，请选择原因（可多选）：</p>
      <div className="dcc-reason-chips">
        {DISLIKE_REASONS.map((reason) => (
          <button
            key={reason}
            type="button"
            className={`dcc-reason-chip${reasons.includes(reason) ? ' is-selected' : ''}`}
            onClick={() => toggle(reason)}
          >
            {reason}
          </button>
        ))}
      </div>
      <textarea
        className="dcc-textarea"
        placeholder="补充说明（选填）"
        rows={3}
        value={text}
        maxLength={300}
        onChange={(event) => setText(event.target.value)}
      />
      <p className="dcc-dialog-sub">反馈将用于评估对应质检功能的检测质量。</p>
    </Modal>
  );
}

export function ConfirmDialog({
  title,
  description,
  okText = '确定',
  cancelText = '取消',
  danger,
  onCancel,
  onConfirm,
}: {
  title: string;
  description: string;
  okText?: string;
  cancelText?: string;
  danger?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      footer={
        <>
          <button type="button" className="dcc-btn" onClick={onCancel}>{cancelText}</button>
          <button type="button" className={`dcc-btn ${danger ? 'dcc-btn--danger-solid' : 'dcc-btn--primary'}`} onClick={onConfirm}>{okText}</button>
        </>
      }
    >
      <p className="dcc-dialog-text">{description}</p>
    </Modal>
  );
}
