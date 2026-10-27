import React, { useEffect, useState } from 'react';
import { ImageKey } from '../lib/scenarios';
import { ItemStatus, TaskStatus, ITEM_STATUS_TEXT, TASK_STATUS_TEXT } from '../lib/store';
import suitImg from '../assets/product-suit.png';
import suitSideImg from '../assets/product-suit-side.png';
import suitBackImg from '../assets/product-suit-back.png';
import suitDetail1Img from '../assets/product-suit-detail-1.png';
import suitDetail2Img from '../assets/product-suit-detail-2.png';
import bagImg from '../assets/product-bag.png';
import bagBrandImg from '../assets/product-bag-brand.png';
import bagBrandCharmImg from '../assets/product-bag-brand-charm.png';
import bagBrandSkuImg from '../assets/product-bag-brand-sku.png';
import bagDetailRiskyImg from '../assets/product-bag-detail-risky.png';
import bagSizeGuideImg from '../assets/product-bag-size-guide.png';
import bagSizeGuideMismatchImg from '../assets/product-bag-size-guide-mismatch.png';
import bagSizeGuideOkImg from '../assets/product-bag-size-guide-ok.png';
import dressImg from '../assets/product-dress.png';
import teeImg from '../assets/product-tee.png';
import sneakerImg from '../assets/product-sneaker.png';
import sizeChartImg from '../assets/size-chart.png';
import logoA1Img from '../assets/ref-logo-a-1.png';
import logoA2Img from '../assets/ref-logo-a-2.png';
import gamblingSlot1Img from '../assets/ref-gambling-slot-1.png';
import gamblingSlot2Img from '../assets/ref-gambling-slot-2.png';

export const IMAGES: Record<ImageKey, string> = {
  suit: suitImg,
  'suit-side': suitSideImg,
  'suit-back': suitBackImg,
  'suit-detail-1': suitDetail1Img,
  'suit-detail-2': suitDetail2Img,
  bag: bagImg,
  'bag-brand': bagBrandImg,
  'bag-brand-charm': bagBrandCharmImg,
  'bag-brand-sku': bagBrandSkuImg,
  'bag-detail-risky': bagDetailRiskyImg,
  'bag-size-guide': bagSizeGuideImg,
  'bag-size-guide-mismatch': bagSizeGuideMismatchImg,
  'bag-size-guide-ok': bagSizeGuideOkImg,
  dress: dressImg,
  tee: teeImg,
  sneaker: sneakerImg,
  'size-chart': sizeChartImg,
  'logo-a-1': logoA1Img,
  'logo-a-2': logoA2Img,
  'gambling-slot-1': gamblingSlot1Img,
  'gambling-slot-2': gamblingSlot2Img,
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

/** 检测记录切换用的时间：月-日 时:分 */
export function fmtStamp(ms: number): string {
  const date = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function fmtShort(ms: number): string {
  const diff = Date.now() - ms;
  const pad = (n: number) => String(n).padStart(2, '0');
  if (diff < 60_000) return '刚刚';
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)} 分钟前`;
  if (diff < 86400_000) return `${pad(new Date(ms).getHours())}:${pad(new Date(ms).getMinutes())}`;
  return `${ms ? new Date(ms).getMonth() + 1 : ''}-${new Date(ms).getDate()}`;
}
