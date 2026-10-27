import React, { useEffect, useState } from 'react';
import { Issue, anchorLabel } from '../lib/issues';
import { SEVERITY_LABEL } from './Anchors';

export function IssueNav({
  issues,
  onLocate,
  hidden,
}: {
  issues: Issue[];
  onLocate: (key: string) => void;
  hidden?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (hidden) return undefined;
    let frame = 0;
    const update = () => {
      frame = 0;
      let index = 0;
      issues.forEach((issue, position) => {
        const element = document.getElementById(`anchor-${issue.anchorKey}`);
        if (!element) return;
        if (element.getBoundingClientRect().top <= 240) index = position;
      });
      setCurrent(index);
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, true);
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule, true);
      window.removeEventListener('resize', schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [issues, hidden]);

  useEffect(() => {
    if (hidden) setOpen(false);
  }, [hidden]);

  if (hidden) return null;

  if (issues.length === 0) {
    return (
      <div className="dcc-nav">
        <div className="dcc-nav-capsule is-empty">未发现问题</div>
      </div>
    );
  }

  const position = Math.min(current, issues.length - 1);
  const active = issues[position];

  return (
    <div className={`dcc-nav${open ? ' is-open' : ''}`}>
      {open && (
        <div className="dcc-nav-panel">
          <div className="dcc-nav-panel-head">本页问题 {issues.length} 处</div>
          <div className="dcc-nav-list">
            {issues.map((issue, index) => (
              <button
                key={issue.key}
                type="button"
                className={`dcc-nav-item${index === position ? ' is-current' : ''}`}
                onClick={() => {
                  onLocate(issue.anchorKey);
                  setOpen(false);
                }}
              >
                <span className="dcc-nav-no">{index + 1}</span>
                <span className="dcc-nav-text">
                  <span className="dcc-nav-label">{anchorLabel(issue.anchor)}</span>
                  <span className="dcc-nav-item-name">{issue.itemName}</span>
                </span>
                <span className={`dcc-tag dcc-tag--issue-${issue.severity}`}>{issue.severityLabel ?? SEVERITY_LABEL[issue.severity]}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      <button type="button" className="dcc-nav-capsule" onClick={() => setOpen((prev) => !prev)}>
        <span className="dcc-nav-capsule-main">{issues.length} 处问题 · 第 {position + 1}/{issues.length}</span>
        <span className="dcc-nav-capsule-sub">{anchorLabel(active.anchor)}</span>
        <span className="dcc-nav-caret">{open ? '▾' : '▴'}</span>
      </button>
    </div>
  );
}
