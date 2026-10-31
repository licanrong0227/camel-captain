import React, { useEffect, useState } from 'react';
import { IssueSeverity } from '../lib/issues';

export interface ConnectorLink {
  key: string;
  anchorKey: string;
  severity: IssueSeverity;
}

interface DrawnLink extends ConnectorLink {
  d: string;
}

interface Point {
  x: number;
  y: number;
}

const fmt = (value: number) => value.toFixed(1);

/** 起点让出圆点半径 + 描边，线从圆点边缘出发；终点落在等级标签左缘 */
const curve = (ax: number, ay: number, ix: number, iy: number, gutterX: number | null, startTrim: number): string => {
  if (gutterX !== null && ax < gutterX - 12 && ix > gutterX + 12) {
    const start = Math.min(startTrim, (gutterX - ax) / 2);
    return `M ${fmt(ax + start)} ${fmt(ay)} C ${fmt(gutterX)} ${fmt(ay)}, ${fmt(gutterX)} ${fmt(iy)}, ${fmt(ix)} ${fmt(iy)}`;
  }
  const dx = ix - ax;
  const dy = iy - ay;
  if (Math.abs(dx) < 24) {
    if (Math.abs(dy) < startTrim) return `M ${fmt(ax)} ${fmt(ay)} L ${fmt(ix)} ${fmt(iy)}`;
    const dir = dy > 0 ? 1 : -1;
    const start = Math.min(startTrim, Math.abs(dy) * 0.3);
    return `M ${fmt(ax)} ${fmt(ay + dir * start)} C ${fmt(ax)} ${fmt(ay + dy * 0.45)}, ${fmt(ix)} ${fmt(iy - dy * 0.45)}, ${fmt(ix)} ${fmt(iy)}`;
  }
  const bend = Math.max(28, Math.min(150, Math.abs(dx) * 0.42));
  const start = Math.min(startTrim, bend / 2);
  return `M ${fmt(ax + start)} ${fmt(ay)} C ${fmt(ax + bend)} ${fmt(ay)}, ${fmt(ix - bend)} ${fmt(iy)}, ${fmt(ix)} ${fmt(iy)}`;
};

/** 商品信息圆点与违规项圆点之间的连线：按违规等级着色，一条违规一条线 */
export function ConnectorLines({ links }: { links: ConnectorLink[] }) {
  const [drawn, setDrawn] = useState<DrawnLink[]>([]);

  useEffect(() => {
    if (links.length === 0) {
      setDrawn([]);
      return undefined;
    }
    let raf = 0;
    let previous: string | null = null;

    const measure = () => {
      const viewport = { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight };
      const sideRect = document.querySelector('.dcc-split__side')?.getBoundingClientRect();
      // 右栏是独立滚动容器：只连接滚动可视区内的圆点，避免长线穿过商品信息再跑出屏幕
      const issueArea = sideRect
        ? {
            left: Math.max(viewport.left, sideRect.left),
            top: Math.max(viewport.top, sideRect.top),
            right: Math.min(viewport.right, sideRect.right),
            bottom: Math.min(viewport.bottom, sideRect.bottom),
          }
        : viewport;
      const inside = (point: Point, area: typeof viewport) =>
        point.x >= area.left && point.x <= area.right && point.y >= area.top && point.y <= area.bottom;

      const next: DrawnLink[] = [];
      links.forEach((link) => {
        // 商品整体的每条记录有独立圆点（按 issue key），其余位置用锚点圆点
        const anchorDot =
          document.querySelector(`[data-locate-dot-for="${link.key}"]`) ??
          document.querySelector(`[data-locate-dot="${link.anchorKey}"]`);
        const issueDot = document.querySelector(`[data-issue-dot="${link.key}"]`);
        if (!anchorDot || !issueDot) return;
        const anchorRect = anchorDot.getBoundingClientRect();
        const issueTag = issueDot.closest('.dcc-sev-tag') ?? issueDot;
        const issueRect = issueTag.getBoundingClientRect();
        if (anchorRect.width === 0 && anchorRect.height === 0) return;
        if (issueRect.width === 0 && issueRect.height === 0) return;
        const anchorPoint = { x: anchorRect.left + anchorRect.width / 2, y: anchorRect.top + anchorRect.height / 2 };
        const issuePoint = { x: issueRect.left + 1, y: issueRect.top + issueRect.height / 2 };
        const issueCenter = { x: issueRect.left + issueRect.width / 2, y: issuePoint.y };
        // 任一端点滚出可见区就不画线，避免线从屏幕外穿回页面
        if (!inside(anchorPoint, viewport) || !inside(issueCenter, issueArea)) return;
        const gutterX = sideRect && sideRect.left > 0 ? sideRect.left - 14 : null;
        next.push({
          ...link,
          d: curve(anchorPoint.x, anchorPoint.y, issuePoint.x, issuePoint.y, gutterX, anchorRect.width / 2 + 3),
        });
      });
      const signature = next.map((link) => `${link.key}:${link.d}`).join('|');
      if (signature !== previous) {
        previous = signature;
        setDrawn(next);
      }
      raf = window.requestAnimationFrame(measure);
    };

    raf = window.requestAnimationFrame(measure);
    return () => window.cancelAnimationFrame(raf);
  }, [links]);

  if (drawn.length === 0) return null;

  return (
    <svg className="dcc-link-layer" aria-hidden="true">
      {drawn.map((link) => (
        <path key={`casing-${link.key}`} className="dcc-link-casing" d={link.d} />
      ))}
      {drawn.map((link) => (
        <path key={link.key} className={`dcc-link dcc-link--${link.severity}`} d={link.d} />
      ))}
    </svg>
  );
}
