import React, { useEffect, useState } from 'react';
import { ImageKey } from '../lib/scenarios';
import { ItemStatus, TaskStatus, ITEM_STATUS_TEXT, TASK_STATUS_TEXT } from '../lib/store';
import suitImg from '../assets/product-suit.png';
import bagImg from '../assets/product-bag.png';
import dressImg from '../assets/product-dress.png';
import teeImg from '../assets/product-tee.png';
import sneakerImg from '../assets/product-sneaker.png';
import sizeChartImg from '../assets/size-chart.png';

export const IMAGES: Record<ImageKey, string> = {
  suit: suitImg,
  bag: bagImg,
  dress: dressImg,
  tee: teeImg,
  sneaker: sneakerImg,
  'size-chart': sizeChartImg,
};

/* ---------- Toast ---------- */

export type ToastKind = 'success' | 'error' | 'warning' | 'info';
interface ToastItem {
  id: number;
  kind: ToastKind;
  text: string;
}

let toastSeq = 0;
export function showToast(kind: ToastKind, text: string) {
  window.dispatchEvent(new CustomEvent('dcc-toast', { detail: { id: ++toastSeq, kind, text } }));
}

export function ToastHost() {
  const [items, setItems] = useState<ToastItem[]>([]);
  useEffect(() => {
    const onToast = (event: Event) => {
      const item = (event as CustomEvent<ToastItem>).detail;
      setItems((prev) => [...prev.slice(-2), item]);
      window.setTimeout(() => {
        setItems((prev) => prev.filter((toast) => toast.id !== item.id));
      }, 2600);
    };
    window.addEventListener('dcc-toast', onToast);
    return () => window.removeEventListener('dcc-toast', onToast);
  }, []);
  if (items.length === 0) return null;
  return (
    <div className="dcc-toast-host">
      {items.map((item) => (
        <div key={item.id} className={`dcc-toast dcc-toast--${item.kind}`}>
          <span className={`dcc-toast-icon dcc-toast-icon--${item.kind}`}>{item.kind === 'success' ? '✓' : item.kind === 'error' ? '✕' : item.kind === 'warning' ? '!' : 'i'}</span>
          {item.text}
        </div>
      ))}
    </div>
  );
}

/* ---------- 标签 ---------- */

export function TaskStatusTag({ status, mini }: { status: TaskStatus; mini?: boolean }) {
  return <span className={`dcc-tag dcc-tag--task-${status}${mini ? ' is-mini' : ''}`}>{TASK_STATUS_TEXT[status]}</span>;
}

export function ItemStatusTag({ status }: { status: ItemStatus }) {
  return <span className={`dcc-tag dcc-tag--item-${status}`}>{ITEM_STATUS_TEXT[status]}</span>;
}

/* ---------- 弹窗 ---------- */

export function Modal({
  title,
  onClose,
  children,
  footer,
  width = 440,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;
}) {
  return (
    <div className="dcc-modal-mask" onClick={onClose}>
      <div className="dcc-modal" style={{ width }} onClick={(event) => event.stopPropagation()}>
        <div className="dcc-modal-head">
          <span className="dcc-modal-title">{title}</span>
          <button type="button" className="dcc-modal-close" aria-label="关闭" onClick={onClose}>×</button>
        </div>
        <div className="dcc-modal-body">{children}</div>
        {footer ? <div className="dcc-modal-foot">{footer}</div> : null}
      </div>
    </div>
  );
}

/* ---------- 复制 ---------- */

export function copyText(text: string, okLabel?: string) {
  const done = () => showToast('success', okLabel ?? '已复制到剪贴板');
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
  } else {
    fallbackCopy(text, done);
  }
}

function fallbackCopy(text: string, done: () => void) {
  const area = document.createElement('textarea');
  area.value = text;
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  try {
    document.execCommand('copy');
    done();
  } catch {
    showToast('error', '复制失败，请手动复制');
  }
  document.body.removeChild(area);
}

/* ---------- 时间 ---------- */

export function fmtTime(ms: number): string {
  const date = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function fmtShort(ms: number): string {
  const diff = Date.now() - ms;
  const pad = (n: number) => String(n).padStart(2, '0');
  if (diff < 60_000) return '刚刚';
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)} 分钟前`;
  if (diff < 86400_000) return `${pad(new Date(ms).getHours())}:${pad(new Date(ms).getMinutes())}`;
  return `${ms ? new Date(ms).getMonth() + 1 : ''}-${new Date(ms).getDate()}`;
}
