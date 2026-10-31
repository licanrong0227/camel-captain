import React from 'react';
import { IssueSeverity } from '../lib/issues';

export const SEVERITY_LABEL: Record<IssueSeverity, string> = {
  violation: '违规',
  suspect: '疑似违规',
  notice: '建议自查',
  fail: '检测失败',
};

/** 定位点：不带数字，数量只在区块标题与检测项卡片头展示 */
export function LocateDot({
  severity,
  active,
  inline,
  label,
  anchorKey,
  issueKey,
  onClick,
}: {
  severity: IssueSeverity;
  active?: boolean;
  inline?: boolean;
  label?: string;
  anchorKey?: string;
  issueKey?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      data-locate-dot={anchorKey}
      data-locate-dot-for={issueKey}
      className={`dcc-locate-dot dcc-locate-dot--${severity}${inline ? ' is-inline' : ''}${active ? ' is-active' : ''}`}
      title={label ?? '定位到对应检测项'}
      aria-label="定位到对应检测项"
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
    >
      <span className="dcc-locate-dot__ring" />
    </button>
  );
}

export function SectionHead({
  title,
  meta,
  tone = 'clean',
  children,
}: {
  title: string;
  meta?: string;
  tone?: 'clean' | 'checking' | 'issue' | 'violation' | 'suspect' | 'notice' | 'fail';
  children?: React.ReactNode;
}) {
  return (
    <header className="dcc-pv-head">
      <span className="dcc-pv-section-title">{title}</span>
      {meta ? (
        <span className={`dcc-pv-meta dcc-pv-meta--${tone}`} onClick={(event) => event.stopPropagation()}>{meta}</span>
      ) : null}
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
