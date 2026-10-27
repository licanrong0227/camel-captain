import React, { useState } from 'react';
import { Modal } from './ui';

export const DISLIKE_REASONS = ['误报', '漏报', '原因不准', '建议不准', '参考信息缺失', '其他'];

export type RecheckMode = 'in-place' | 'recollect';

export function RecheckDialog({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: (mode: RecheckMode) => void }) {
  const [mode, setMode] = useState<RecheckMode>('in-place');
  const options: { value: RecheckMode; title: string; desc: string }[] = [
    { value: 'in-place', title: '就地重新检测', desc: '沿用已采集的商品信息，在当前这条记录上重新执行全部质检项，检测完就地更新结果，不新增记录。' },
    { value: 'recollect', title: '重新采集并检测', desc: '基于同一商品链接创建一条新的检测记录：重新采集商品信息后重新质检，原记录保留不变。' },
  ];
  return (
    <Modal
      title="重新检测"
      onClose={onCancel}
      footer={
        <>
          <button type="button" className="dcc-btn" onClick={onCancel}>取消</button>
          <button type="button" className="dcc-btn dcc-btn--primary" onClick={() => onConfirm(mode)}>确定</button>
        </>
      }
    >
      <p className="dcc-dialog-text">请选择重新检测方式：</p>
      <div className="dcc-option-list">
        {options.map((option) => (
          <div
            key={option.value}
            role="radio"
            aria-checked={mode === option.value}
            tabIndex={0}
            className={`dcc-option${mode === option.value ? ' is-selected' : ''}`}
            onClick={() => setMode(option.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') setMode(option.value);
            }}
          >
            <span className="dcc-option-radio" />
            <div>
              <div className="dcc-option-title">{option.title}</div>
              <div className="dcc-option-desc">{option.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

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
