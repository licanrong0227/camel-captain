import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ErpButton } from './core';

function Portal({ children }: { children: React.ReactNode }) {
  if (typeof document === 'undefined') return null;
  return createPortal(<div className="erp-app erp-portal-root">{children}</div>, document.body);
}

export interface ErpDialogProps {
  open: boolean;
  title?: React.ReactNode;
  width?: number;
  onClose?: () => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
  maskClosable?: boolean;
  bodyClassName?: string;
  className?: string;
  zIndex?: number;
}

export function ErpDialog({
  open,
  title,
  width = 720,
  onClose,
  footer,
  children,
  maskClosable = true,
  bodyClassName = '',
  className = '',
  zIndex = 2000,
}: ErpDialogProps) {
  useEffect(() => {
    if (!open) return undefined;
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handler);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <Portal>
      <div className="erp-mask" style={{ zIndex }} onMouseDown={(event) => event.target === event.currentTarget && maskClosable && onClose?.()}>
        <div className={`erp-dialog ${className}`} style={{ width }} role="dialog" aria-modal="true" aria-label={typeof title === 'string' ? title : '弹窗'}>
          <header className="erp-dialog__head">
            <h2>{title}</h2>
            <button type="button" className="erp-dialog__close" onClick={onClose} aria-label="关闭">
              ×
            </button>
          </header>
          <div className={`erp-dialog__body ${bodyClassName}`}>{children}</div>
          {footer ? <footer className="erp-dialog__foot">{footer}</footer> : null}
        </div>
      </div>
    </Portal>
  );
}

export function ErpDrawer({
  open,
  title,
  width = 720,
  onClose,
  footer,
  children,
  bodyClassName = '',
}: {
  open: boolean;
  title?: React.ReactNode;
  width?: number;
  onClose?: () => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
  bodyClassName?: string;
}) {
  useEffect(() => {
    if (!open) return undefined;
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <Portal>
      <div className="erp-mask erp-mask--drawer" onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}>
        <aside className="erp-drawer" style={{ width }} role="dialog" aria-modal="true" aria-label={typeof title === 'string' ? title : '抽屉'}>
          <header className="erp-drawer__head">
            <h2>{title}</h2>
            <button type="button" className="erp-dialog__close" onClick={onClose} aria-label="关闭">
              ×
            </button>
          </header>
          <div className={`erp-drawer__body ${bodyClassName}`}>{children}</div>
          {footer ? <footer className="erp-drawer__foot">{footer}</footer> : null}
        </aside>
      </div>
    </Portal>
  );
}

type MessageType = 'success' | 'error' | 'warning' | 'info' | 'loading';
interface ToastItem {
  id: number;
  type: MessageType;
  text: string;
}

let toastSeed = 0;
let toasts: ToastItem[] = [];
const toastListeners = new Set<(items: ToastItem[]) => void>();

function publishToasts() {
  toastListeners.forEach((listener) => listener([...toasts]));
}

export function erpMessage(text: string, type: MessageType = 'success', duration = 2400) {
  const item = { id: (toastSeed += 1), type, text };
  toasts = [...toasts, item];
  publishToasts();
  window.setTimeout(() => {
    toasts = toasts.filter((toast) => toast.id !== item.id);
    publishToasts();
  }, duration);
}

const ICONS: Record<MessageType, string> = {
  success: '✓',
  error: '!',
  warning: '!',
  info: 'i',
  loading: '◌',
};

export function ErpMessageHost() {
  const [items, setItems] = useState<ToastItem[]>([]);
  useEffect(() => {
    toastListeners.add(setItems);
    return () => {
      toastListeners.delete(setItems);
    };
  }, []);
  if (items.length === 0) return null;
  return (
    <div className="erp-messages">
      {items.map((item) => (
        <div className={`erp-message erp-message--${item.type}`} key={item.id}>
          <span className="erp-message__icon">{ICONS[item.type]}</span>
          <span className="erp-message__text">{item.text}</span>
        </div>
      ))}
    </div>
  );
}

interface ConfirmOptions {
  title?: string;
  content: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

interface ConfirmState extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

let confirmPusher: ((state: ConfirmState) => void) | null = null;

export function erpConfirm(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    if (!confirmPusher) {
      resolve(false);
      return;
    }
    confirmPusher({ ...options, resolve });
  });
}

export function ErpConfirmHost() {
  const [state, setState] = useState<ConfirmState | null>(null);
  const stateRef = useRef<ConfirmState | null>(null);
  stateRef.current = state;
  useEffect(() => {
    confirmPusher = setState;
    return () => {
      if (confirmPusher === setState) confirmPusher = null;
    };
  }, []);
  const finish = (value: boolean) => {
    stateRef.current?.resolve(value);
    setState(null);
  };
  return (
    <ErpDialog
      open={Boolean(state)}
      title={state?.title || '操作确认'}
      width={480}
      onClose={() => finish(false)}
      footer={
        <>
          <ErpButton onClick={() => finish(false)}>{state?.cancelText || '取消'}</ErpButton>
          <ErpButton variant={state?.danger ? 'danger' : 'primary'} onClick={() => finish(true)}>
            {state?.confirmText || '确定'}
          </ErpButton>
        </>
      }
    >
      <div className="erp-confirm-content">{state?.content}</div>
    </ErpDialog>
  );
}
