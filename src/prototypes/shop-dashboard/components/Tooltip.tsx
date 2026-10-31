import React, { useState } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Tooltip({ content, children, className }: TooltipProps) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  return (
    <span
      className={className}
      onMouseEnter={(event) => setRect((event.currentTarget as HTMLElement).getBoundingClientRect())}
      onMouseLeave={() => setRect(null)}
    >
      {children}
      {rect
        ? createPortal(
            <span
              className="ss-tooltip"
              style={{
                left: Math.min(Math.max(rect.left + rect.width / 2, 90), window.innerWidth - 90),
                top: rect.top - 8,
              }}
            >
              {content}
              <span className="ss-tooltip-arrow" />
            </span>,
            document.body,
          )
        : null}
    </span>
  );
}
