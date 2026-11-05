import React, { useState } from 'react';
import { createPortal } from 'react-dom';

export function Tooltip({ content, children }: { content: React.ReactNode; children: React.ReactNode }) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  return (
    <span
      className="hd-tip-anchor"
      onMouseEnter={(event) => setRect((event.currentTarget as HTMLElement).getBoundingClientRect())}
      onMouseLeave={() => setRect(null)}
    >
      {children}
      {rect
        ? createPortal(
            <span
              className="hd-tooltip"
              style={{
                left: Math.min(Math.max(rect.left + rect.width / 2, 110), window.innerWidth - 110),
                top: rect.top - 8,
              }}
            >
              {content}
              <span className="hd-tooltip-arrow" />
            </span>,
            document.body,
          )
        : null}
    </span>
  );
}
