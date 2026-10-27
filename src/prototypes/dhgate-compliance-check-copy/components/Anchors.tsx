import React from 'react';
import { IssueSeverity } from '../lib/issues';

export const SEVERITY_LABEL: Record<IssueSeverity, string> = {
  violation: '违规',
  suspect: '疑似违规',
  fail: '检测失败',
};

/** 位置角标：数字为该位置的问题条数，颜色取最高等级 */
export function MarkerBadge({
  count,
  severity,
  active,
  inline,
  onClick,
}: {
  count: number;
  severity: IssueSeverity;
  active?: boolean;
  inline?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      className={`dcc-marker dcc-marker--${severity}${inline ? ' dcc-marker--inline' : ''}${active ? ' is-active' : ''}`}
      title={`${count} 处问题`}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
    >
      {count}
    </button>
  );
}

/** 已检查且未发现问题 */
export function WeakCheck({ title = '已检查，未发现问题' }: { title?: string }) {
  return <span className="dcc-weak-check" title={title}>✓</span>;
}

export function SectionHead({
  title,
  meta,
  tone = 'clean',
  children,
}: {
  title: string;
  meta?: string;
  tone?: 'clean' | 'checking' | 'issue';
  children?: React.ReactNode;
}) {
  return (
    <header className="dcc-pv-head">
      <span className="dcc-pv-section-title">{title}</span>
      {meta ? <span className={`dcc-pv-meta dcc-pv-meta--${tone}`}>{meta}</span> : null}
      {children}
    </header>
  );
}

export function renderHighlight(text: string, word?: string): React.ReactNode {
  if (!word || !word.trim() || !text.includes(word)) return text;
  const at = text.indexOf(word);
  return (
    <>
      {text.slice(0, at)}
      <mark className="dcc-mark">{word}</mark>
      {text.slice(at + word.length)}
    </>
  );
}
