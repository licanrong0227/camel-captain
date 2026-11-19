import React, { useEffect, useRef, useState } from 'react';
import { Sheet } from './Sheet';

type Announcement = { id: number; title: string; categoryName: string; date: string };

const PAGE_SIZE = 10;

export function AnnouncementSheet({
  open,
  announcements,
  onOpen,
  onClose,
}: {
  open: boolean;
  announcements: Announcement[];
  onOpen: (item: Announcement) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<'notice' | 'history'>('notice');
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const base = tab === 'notice' ? announcements.slice(0, 5) : announcements;
  const rows = base.slice(0, visible);
  const done = visible >= base.length;

  useEffect(() => {
    if (!open) return;
    setTab('notice');
    setVisible(PAGE_SIZE);
    setLoading(false);
    loadingRef.current = false;
  }, [open]);

  useEffect(() => {
    setVisible(PAGE_SIZE);
    setLoading(false);
    loadingRef.current = false;
    sentinelRef.current?.closest('.cc-sheet-body')?.scrollTo({ top: 0 });
  }, [tab]);

  useEffect(() => {
    if (!open || done) return undefined;
    const node = sentinelRef.current;
    if (!node) return undefined;
    let timer = 0;
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting || loadingRef.current) return;
      loadingRef.current = true;
      setLoading(true);
      timer = window.setTimeout(() => {
        loadingRef.current = false;
        setLoading(false);
        setVisible((value) => Math.min(base.length, value + PAGE_SIZE));
      }, 320);
    }, { rootMargin: '0px 0px 60px 0px' });
    observer.observe(node);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [open, tab, visible, base.length, done]);

  return (
    <Sheet
      open={open}
      title="公告"
      variant="full"
      onClose={onClose}
      subhead={
        <div className="cc-sheet-tabs">
          <button type="button" className={`cc-sheet-tab${tab === 'notice' ? ' is-active' : ''}`} onClick={() => setTab('notice')}>公告</button>
          <button type="button" className={`cc-sheet-tab${tab === 'history' ? ' is-active' : ''}`} onClick={() => setTab('history')}>历史公告</button>
        </div>
      }
    >
      <ul className="cc-ann-list cc-ann-list--sheet">
        {rows.map((item) => (
          <li className="cc-ann-item" key={item.id} onClick={() => onOpen(item)}>
            <span className={`cc-ann-tag${item.categoryName === '弹窗公告' ? ' is-popup' : ''}`}>{item.categoryName}</span>
            <span className="cc-ann-title">{item.title}</span>
            <span className="cc-ann-date">{item.date.length > 5 ? item.date.slice(5) : item.date}</span>
          </li>
        ))}
      </ul>

      <div className="cc-ann-foot" ref={sentinelRef}>
        {done ? '已经到底了' : loading ? '加载中…' : '上滑加载更多'}
      </div>
    </Sheet>
  );
}
