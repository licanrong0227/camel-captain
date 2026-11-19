import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { announcementParagraphs } from './AnnouncementDetailSheet';

type Announcement = { id: number; title: string; categoryName: string; date: string };

export function NoticePopup({
  open,
  item,
  onClose,
}: {
  open: boolean;
  item: Announcement | null;
  onClose: () => void;
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

  if (!open || !item) return null;

  return createPortal(
    <div className="cc-modal-mask" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="cc-notice-modal" role="dialog" aria-modal="true" aria-label={item.title}>
        <button type="button" className="cc-notice-close" aria-label="关闭" onClick={onClose}>
          <X size={18} />
        </button>
        <span className={`cc-ann-tag${item.categoryName === '弹窗公告' ? ' is-popup' : ''}`}>{item.categoryName}</span>
        <h2>{item.title}</h2>
        <div className="cc-notice-date">{item.date}</div>
        <div className="cc-notice-body">
          {announcementParagraphs(item).map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
        <button type="button" className="cc-btn cc-btn--primary cc-notice-confirm" onClick={onClose}>我知道了</button>
      </div>
    </div>,
    target ?? document.body,
  );
}
