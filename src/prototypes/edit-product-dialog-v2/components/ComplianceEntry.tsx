import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, HelpCircle, History, ShieldCheck } from 'lucide-react';

interface Props {
  checking: boolean;
  hasRecord: boolean;
  onDetect: () => void;
  onViewRecords: () => void;
  onNoRecords: () => void;
}

export default function ComplianceEntry({ checking, hasRecord, onDetect, onViewRecords, onNoRecords }: Props) {
  const [open, setOpen] = useState(false);
  const [tipOpen, setTipOpen] = useState(false);
  const [pos, setPos] = useState({ left: 0, bottom: 0 });
  const splitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const toggleMenu = () => {
    if (!open) {
      const rect = splitRef.current?.getBoundingClientRect();
      if (rect) {
        setPos({
          left: Math.max(12, rect.right - 208),
          bottom: window.innerHeight - rect.top + 6,
        });
      }
    }
    setOpen((prev) => !prev);
  };

  return (
    <div className="ep-c-entry">
      <div className="ep-c-split" ref={splitRef}>
        <button
          type="button"
          className="ep-c-split__main"
          data-annotation-id="compliance-entry"
          disabled={checking}
          aria-busy={checking}
          aria-label="商品合规检测"
          onClick={onDetect}
        >
          {checking && (
            <span className="ep-c-spin" aria-hidden="true">
              {Array.from({ length: 12 }).map((_, index) => (
                <span
                  key={index}
                  style={{ transform: `rotate(${index * 30}deg)`, animationDelay: `${index * 0.083}s` }}
                />
              ))}
            </span>
          )}
          {!checking && <ShieldCheck size={14} />}
          {checking ? '检测中' : '商品合规检测'}
          <span
            className="ep-c-help"
            role="img"
            aria-label="算力说明"
            onMouseEnter={() => setTipOpen(true)}
            onMouseLeave={() => setTipOpen(false)}
            onClick={(event) => event.stopPropagation()}
          >
            <HelpCircle size={13} />
            {tipOpen && (
              <span className="ep-c-tip" role="tooltip">
                单个商品检测消耗 xx 算力
              </span>
            )}
          </span>
        </button>
        <button
          type="button"
          className={`ep-c-split__caret${open ? ' is-open' : ''}`}
          data-annotation-id="compliance-caret"
          aria-label="合规检测更多操作"
          aria-expanded={open}
          onClick={toggleMenu}
        >
          <ChevronDown size={12} />
        </button>
      </div>

      {open && (
        <>
          <div className="ep-c-menu-mask" onClick={() => setOpen(false)} />
          <div className="ep-c-menu" role="menu" style={{ left: pos.left, bottom: pos.bottom }}>
            <button
              type="button"
              role="menuitem"
              className="ep-c-menu__item"
              onClick={() => {
                setOpen(false);
                if (hasRecord) {
                  onViewRecords();
                } else {
                  onNoRecords();
                }
              }}
            >
              <History size={14} />
              <span>查看检测记录</span>
              <span className={`ep-c-menu__count${hasRecord ? '' : ' is-empty'}`}>
                {hasRecord ? '' : '暂无记录'}
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
