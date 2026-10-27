import React, { useEffect, useState } from 'react';
import { AnchorGroup, Issue, countBySeverity } from '../lib/issues';
import { ItemCode } from '../lib/scenarios';
import { BlockView } from './BlockView';
import { SEVERITY_LABEL } from './Anchors';
import { copyText } from './ui';

export function IssueDrawer({
  open,
  groups,
  activeKey,
  feedbackByResult,
  onClose,
  onSelectGroup,
  onFeedback,
}: {
  open: boolean;
  groups: AnchorGroup[];
  activeKey: string | null;
  feedbackByResult: Record<string, 'up' | 'down' | null | undefined>;
  onClose: () => void;
  onSelectGroup: (key: string) => void;
  onFeedback: (code: ItemCode, resultKey: string, mode: 'up' | 'down', label?: string) => void;
}) {
  const [filter, setFilter] = useState<'all' | 'violation'>('all');
  const [expanded, setExpanded] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    setFilter('all');
    setExpanded(activeKey ? [activeKey] : []);
  }, [open]);

  useEffect(() => {
    if (!open || !activeKey) return;
    setExpanded((prev) => (prev.includes(activeKey) ? prev : [...prev, activeKey]));
  }, [open, activeKey]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const visibleGroups = groups
    .map((group) => ({
      ...group,
      issues: filter === 'violation' ? group.issues.filter((issue) => issue.severity === 'violation') : group.issues,
    }))
    .filter((group) => group.issues.length > 0);
  const total = visibleGroups.reduce((sum, group) => sum + group.issues.length, 0);

  return (
    <aside className={`dcc-drawer${open ? ' is-open' : ''}`} aria-hidden={!open} role="dialog" aria-modal={false} aria-label="问题定位">
      <header className="dcc-drawer-head">
        <div className="dcc-drawer-head-main">
          <span className="dcc-drawer-title">问题定位</span>
          <span className="dcc-drawer-total">共 {total} 处</span>
        </div>
        <div className="dcc-drawer-filter" role="group" aria-label="问题类型筛选">
          <button type="button" className={`dcc-drawer-filter-btn${filter === 'all' ? ' is-active' : ''}`} onClick={() => setFilter('all')}>全部</button>
          <button type="button" className={`dcc-drawer-filter-btn${filter === 'violation' ? ' is-active' : ''}`} onClick={() => setFilter('violation')}>只看违规</button>
        </div>
        <button type="button" className="dcc-modal-close" aria-label="关闭" onClick={onClose}>×</button>
      </header>

      <div className="dcc-drawer-body">
        {visibleGroups.length === 0 ? (
          <div className="dcc-drawer-empty">
            <span className="dcc-drawer-empty-icon">✓</span>
            {groups.length === 0 ? '未发现问题，无需处理' : '当前筛选下没有违规问题'}
          </div>
        ) : (
          visibleGroups.map((group) => {
            const isOpen = expanded.includes(group.key);
            const counts = countBySeverity(group.issues);
            return (
              <section key={group.key} className={`dcc-drawer-group${activeKey === group.key ? ' is-active' : ''}`}>
                <button
                  type="button"
                  className="dcc-drawer-group-head"
                  onClick={() => {
                    setExpanded((prev) => (isOpen ? prev.filter((key) => key !== group.key) : [...prev, group.key]));
                    onSelectGroup(group.key);
                  }}
                >
                  <span className={`dcc-drawer-dot dcc-drawer-dot--${group.severity}`} />
                  <span className="dcc-drawer-group-label">{group.label}</span>
                  <span className="dcc-drawer-group-count">
                    {counts.violation ? `${counts.violation} 违规` : ''}
                    {counts.suspect ? `${counts.violation ? ' · ' : ''}${counts.suspect} 疑似` : ''}
                    {counts.fail ? `${counts.violation || counts.suspect ? ' · ' : ''}${counts.fail} 失败` : ''}
                  </span>
                  <span className="dcc-drawer-caret">{isOpen ? '▾' : '▸'}</span>
                </button>
                {isOpen && (
                  <div className="dcc-drawer-issues">
                    {group.issues.map((issue, index) => (
                      <IssueEntry
                        key={issue.key}
                        issue={issue}
                        index={index}
                        feedback={feedbackByResult[issue.key] ?? null}
                        onFeedback={onFeedback}
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          })
        )}
      </div>
    </aside>
  );
}

function IssueEntry({
  issue,
  index,
  feedback,
  onFeedback,
}: {
  issue: Issue;
  index: number;
  feedback: 'up' | 'down' | null;
  onFeedback: (code: ItemCode, resultKey: string, mode: 'up' | 'down', label?: string) => void;
}) {
  const [showReference, setShowReference] = useState(false);

  return (
    <article className={`dcc-drawer-issue dcc-drawer-issue--${issue.severity}`}>
      <div className="dcc-drawer-issue-head">
        <span className="dcc-item-no">{index + 1}</span>
        <span className="dcc-drawer-item-name">{issue.itemName}</span>
        <span className={`dcc-tag dcc-tag--issue-${issue.severity}`}>{issue.severityLabel ?? SEVERITY_LABEL[issue.severity]}</span>
      </div>
      <div className="dcc-drawer-reason">{issue.reason}</div>
      {issue.position ? <div className="dcc-drawer-pos">位置：{issue.position}</div> : null}

      {issue.reference && issue.reference.length > 0 && (
        <section className={`dcc-ref-group${showReference ? ' is-open' : ''}`}>
          <button
            type="button"
            className="dcc-ref-group-head"
            aria-expanded={showReference}
            onClick={() => setShowReference((prev) => !prev)}
          >
            <span className="dcc-ref-group-title">参考信息</span>
            <span className="dcc-ref-group-toggle">{showReference ? '收起' : '展开'}</span>
          </button>
          {showReference && (
            <div className="dcc-ref-list">{issue.reference.map((block, blockIndex) => <BlockView key={blockIndex} block={block} />)}</div>
          )}
        </section>
      )}

      {issue.suggestion && (
        <div className="dcc-suggestion">
          <div className="dcc-row-label">建议方案</div>
          <div>{issue.suggestion}</div>
          {issue.suggestionValue && (
            <button type="button" className="dcc-btn dcc-btn--text" onClick={() => copyText(issue.suggestionValue!, '已复制建议值')}>复制建议</button>
          )}
        </div>
      )}

      <footer className="dcc-drawer-actions">
        <div className="dcc-feedback" title="反馈这条检测结果">
          <button
            type="button"
            className={`dcc-fb-btn${feedback === 'up' ? ' is-active' : ''}`}
            title={feedback === 'up' ? '取消满意' : '满意'}
            onClick={() => onFeedback(issue.code, issue.key, 'up')}
          >👍</button>
          <button
            type="button"
            className={`dcc-fb-btn${feedback === 'down' ? ' is-active' : ''}`}
            title={feedback === 'down' ? '取消不满意' : '不满意'}
            onClick={() => onFeedback(issue.code, issue.key, 'down', `${issue.itemName} · 第 ${index + 1} 条`)}
          >👎</button>
        </div>
      </footer>
    </article>
  );
}
