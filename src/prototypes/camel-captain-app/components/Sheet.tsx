import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export function Sheet({
  open,
  title,
  variant = 'bottom',
  height,
  minHeight,
  onClose,
  footer,
  subhead,
  children,
}: {
  open: boolean;
  title: string;
  variant?: 'bottom' | 'full';
  height?: number;
  minHeight?: number;
  onClose: () => void;
  footer?: React.ReactNode;
  subhead?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (open) setTarget(document.getElementById('cc-sheet-layer'));
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  const node = target ?? document.body;

  return createPortal(
    <div className="cc-sheet-mask" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div
        className={`cc-sheet ${variant === 'full' ? 'cc-sheet--full' : 'cc-sheet--bottom'}`}
        style={variant === 'bottom' ? { maxHeight: height ?? 620, minHeight } : undefined}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {variant === 'bottom' ? <div className="cc-sheet-handle" /> : null}
        <div className="cc-sheet-head">
          <span className="cc-sheet-title">{title}</span>
          <button type="button" className="cc-sheet-close" aria-label="关闭" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        {subhead ? <div className="cc-sheet-subhead">{subhead}</div> : null}
        <div className="cc-sheet-body">{children}</div>
        {footer ? <div className="cc-sheet-foot">{footer}</div> : null}
      </div>
    </div>,
    node,
  );
}
