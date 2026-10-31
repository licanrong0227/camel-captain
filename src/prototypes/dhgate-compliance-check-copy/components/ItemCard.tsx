import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ItemView, ResultFeedback } from '../lib/store';
import { Issue, anchorLabel, countBySeverity, describeCounts, flattenIssues, highestSeverity } from '../lib/issues';
import { SEVERITY_LABEL, renderHighlight } from './Anchors';
import { ItemStatusTag, copyText, fmtStamp } from './ui';

interface FeedbackHandler {
  (resultKey: string, context: string, presetReasons?: string[]): void;
}

export function ItemCard({
  view,
  issues,
  expanded,
  onToggle,
  selectedIssueKey,
  activeAnchor,
  hoverAnchor,
  feedbackMap,
  onLocate,
  onHover,
  onFeedback,
  onCancelFeedback,
  onRetry,
  onHistoryViewChange,
  linkedIssueKeys = [],
  anchorLinkMode = false,
  historyResetToken = 0,
  currentAt,
}: {
  view: ItemView;
  issues: Issue[];
  expanded: boolean;
  onToggle: () => void;
  selectedIssueKey: string | null;
  activeAnchor: string | null;
  hoverAnchor: string | null;
  feedbackMap: Record<string, ResultFeedback | undefined>;
  onLocate: (anchorKey: string, issueKey?: string, source?: 'anchor' | 'issue') => void;
  onHover: (anchorKey: string | null) => void;
  onFeedback: FeedbackHandler;
  onCancelFeedback: (resultKey: string) => void;
  onRetry: () => void;
  onHistoryViewChange?: (viewingHistory: boolean) => void;
  linkedIssueKeys?: string[];
  anchorLinkMode?: boolean;
  historyResetToken?: number;
  currentAt?: number;
}) {
  const history = view.override?.attempts ?? [];
  const historyRounds = history.map((round, index) => ({ index, at: round.at })).reverse();
  const [pickedRound, setPickedRound] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ left: number; top: number; minWidth: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const viewingHistory = pickedRound !== null && pickedRound < history.length;
  const status = viewingHistory ? history[pickedRound as number].status : view.status;
  const outcome = viewingHistory ? history[pickedRound as number].outcome : view.outcome;
  const roundIssues = viewingHistory && outcome
    ? flattenIssues([{ ...view, status, outcome }])
    : issues;
  const counts = countBySeverity(roundIssues);
  const totalIssues = counts.violation + counts.suspect + counts.notice + counts.fail;
  const severity = highestSeverity(roundIssues);
  const interactive = !viewingHistory;
  const running = status === 'queued' || status === 'running';
  const isPass = status === 'pass';
  const isFail = status === 'fail';
  const hasLink = issues.some((issue) => linkedIssueKeys.includes(issue.key));
  const currentRoundLabel = `第 ${history.length + 1} 次 · ${
    view.status === 'queued'
      ? '排队中'
      : view.status === 'running'
        ? '检测中'
        : `${fmtStamp(currentAt ?? Date.now())} · 最新`
  }`;
  const roundOptions = [
    { value: 'current', label: currentRoundLabel },
    ...historyRounds.map((round) => ({ value: String(round.index), label: `第 ${round.index + 1} 次 · ${fmtStamp(round.at)}` })),
  ];
  const selectedValue = pickedRound === null ? 'current' : String(pickedRound);
  const selectedLabel = roundOptions.find((option) => option.value === selectedValue)?.label ?? currentRoundLabel;

  useEffect(() => {
    setPickedRound(null);
  }, [history.length]);

  useEffect(() => {
    setPickedRound(null);
    setMenuOpen(false);
  }, [historyResetToken]);

  useEffect(() => {
    if (!expanded) setMenuOpen(false);
  }, [expanded]);

  const selectRound = (value: string) => {
    const next = value === 'current' ? null : Number(value);
    setPickedRound(next);
    onHistoryViewChange?.(next !== null);
    setMenuOpen(false);
    triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!menuOpen) return undefined;
    const updatePosition = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        setMenuOpen(false);
        return;
      }
      const minWidth = Math.max(rect.width, 208);
      const estimatedHeight = roundOptions.length * 30 + 8;
      const placeUp = rect.bottom + 4 + estimatedHeight > window.innerHeight;
      setMenuPos({
        left: Math.max(8, Math.min(rect.left, window.innerWidth - minWidth - 8)),
        top: placeUp ? Math.max(8, rect.top - estimatedHeight - 4) : rect.bottom + 4,
        minWidth,
      });
    };
    const onOutsideDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setMenuOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        triggerRef.current?.focus();
      }
    };
    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    document.addEventListener('mousedown', onOutsideDown, true);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
      document.removeEventListener('mousedown', onOutsideDown, true);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen, roundOptions.length]);

  return (
    <section
      id={`item-${view.code}`}
      data-annotation-id={`dcc-item-${view.code}`}
      className={`dcc-item dcc-side-item${severity ? ` dcc-item--${severity}` : ''}${expanded ? ' is-open' : ''}${hasLink ? ' has-link' : ''}`}
    >
      <header
        className={`dcc-item-head${running ? '' : ' is-toggleable'}`}
        onClick={(event) => {
          if (running) return;
          if ((event.target as HTMLElement).closest('button, a, input, select')) return;
          onToggle();
        }}
      >
        <div className="dcc-item-title-wrap">
          <div className="dcc-item-title">
            {view.name}
            <ItemStatusTag status={status} />
          </div>
        </div>
        <div className="dcc-item-head-actions" data-annotation-id={`dcc-item-actions-${view.code}`}>
          {!running && (
            <button
              type="button"
              className={`dcc-item-toggle${expanded ? ' is-open' : ''}`}
              aria-label={expanded ? '收起检测项' : '展开检测项'}
              aria-expanded={expanded}
              title={expanded ? '收起' : '展开'}
              onClick={onToggle}
            >
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m6 15 6-6 6 6" />
              </svg>
            </button>
          )}
        </div>
      </header>

      {expanded && <div className="dcc-item-divider" aria-hidden="true" />}

      {expanded && !running && !isPass && !isFail && totalIssues > 1 && (
        <div className="dcc-item-count-line">
          <span className={`dcc-item-count dcc-item-count--${severity}`}>{describeCounts(counts)}</span>
        </div>
      )}

      {expanded && history.length > 0 && (
        <div className="dcc-attempt-bar" data-annotation-id={`dcc-item-attempts-${view.code}`}>
          <button
            ref={triggerRef}
            type="button"
            className={`dcc-attempt-trigger${menuOpen ? ' is-open' : ''}`}
            aria-haspopup="listbox"
            aria-expanded={menuOpen}
            aria-label="切换检测记录"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <span className="dcc-attempt-trigger-text">{selectedLabel}</span>
            <span className="dcc-attempt-caret" aria-hidden="true" />
          </button>
          {viewingHistory && <span className="dcc-attempt-note" title="历史记录">历史记录</span>}
          {interactive && !running && (
            <button type="button" className="dcc-btn dcc-btn--text dcc-attempt-retry" onClick={onRetry}>重新检测</button>
          )}
        </div>
      )}

      {expanded && !running && interactive && history.length === 0 && (
        <div className="dcc-item-retry-row">
          <span className="dcc-item-latest-note">当前为最新检测结果</span>
          <button type="button" className="dcc-btn dcc-btn--text" onClick={onRetry}>重新检测</button>
        </div>
      )}

      {menuOpen && menuPos && createPortal(
        <div
          ref={menuRef}
          className="dcc-attempt-menu"
          style={{ left: menuPos.left, top: menuPos.top, minWidth: menuPos.minWidth }}
          role="listbox"
          aria-label="检测记录"
        >
          {roundOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === selectedValue}
              className={`dcc-attempt-option${option.value === selectedValue ? ' is-selected' : ''}`}
              onClick={() => selectRound(option.value)}
            >
              <span>{option.label}</span>
              {option.value === selectedValue && <span className="dcc-attempt-option-check" aria-hidden="true">✓</span>}
            </button>
          ))}
        </div>,
        document.querySelector('.dcc-page') ?? document.body,
      )}

      {status === 'queued' && <div className="dcc-item-loading"><span className="dcc-dot-pulse" />排队中，等待执行…</div>}
      {status === 'running' && (
        <div className="dcc-item-running">
          <span className="dcc-spinner" />
          <div className="dcc-skeleton-rows">
            <i style={{ width: '55%' }} />
            <i style={{ width: '78%' }} />
            <i style={{ width: '40%' }} />
          </div>
          <span className="dcc-running-text">检测中，结果将独立返回</span>
        </div>
      )}

      {expanded && !running && (
        <div className="dcc-item-body">
          {isPass && (
            <div className="dcc-item-pass-note">{outcome?.conclusion ?? '本项未发现问题。'}</div>
          )}

          {isFail && (
            <article
              id={roundIssues[0] ? `issue-${roundIssues[0].key}` : undefined}
              className={`dcc-issue-entry dcc-issue-entry--fail dcc-fail-entry${roundIssues[0] && selectedIssueKey === roundIssues[0].key ? ' is-selected' : ''}${roundIssues[0] && activeAnchor === roundIssues[0].anchorKey ? ' is-located' : ''}${roundIssues[0] && hoverAnchor === roundIssues[0].anchorKey ? ' is-hovered' : ''}${interactive ? '' : ' is-readonly'}${roundIssues[0] && linkedIssueKeys.includes(roundIssues[0].key) ? ' is-linked' : ''}`}
              onClick={(event) => {
                if (!interactive || !roundIssues[0]) return;
                if ((event.target as HTMLElement).closest('button, a')) return;
                onLocate(roundIssues[0].anchorKey, roundIssues[0].key, 'issue');
              }}
              onMouseEnter={() => roundIssues[0] && onHover(roundIssues[0].anchorKey)}
              onMouseLeave={() => onHover(null)}
            >
              {roundIssues[0] && (
                <header className="dcc-issue-head">
                  {interactive ? (
                    <button
                      type="button"
                      className="dcc-issue-assoc"
                      title="关联到商品信息"
                      aria-label={`定位到商品信息中的${anchorLabel(roundIssues[0].anchor)}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        onLocate(roundIssues[0].anchorKey, roundIssues[0].key, 'issue');
                      }}
                    >
                      <span className="dcc-sev-tag dcc-sev-tag--fail">
                        <span data-issue-dot={roundIssues[0].key} className="dcc-assoc-dot dcc-assoc-dot--fail" aria-hidden="true" />
                        检测失败
                      </span>
                    </button>
                  ) : (
                    <span className="dcc-issue-assoc is-static" title="历史记录，仅查看">
                      <span className="dcc-sev-tag dcc-sev-tag--fail">
                        <span data-issue-dot={roundIssues[0].key} className="dcc-assoc-dot dcc-assoc-dot--fail" aria-hidden="true" />
                        检测失败
                      </span>
                    </span>
                  )}
                </header>
              )}
              <div className="dcc-item-row">
                <span className="dcc-row-label">失败原因</span>
                <span>{outcome?.failReason ?? outcome?.conclusion ?? '本项未产生结果'}</span>
              </div>
              <p className="dcc-item-fail-tip">本项结果不完整，可重新检测这一项；检测失败不计入违规与疑似。</p>
            </article>
          )}

          {!isPass && !isFail && roundIssues.length > 0 && (
            <div className="dcc-issue-list">
              {roundIssues.map((issue) => {
                // 历史轮次的反馈按轮次独立保存，避免和当前结果互相覆盖
                const feedbackKey = viewingHistory ? `h${pickedRound}:${issue.key}` : issue.key;
                return (
                  <IssueEntry
                    key={issue.key}
                    issue={issue}
                    resultKey={feedbackKey}
                    selected={selectedIssueKey === issue.key}
                    activeAnchor={activeAnchor}
                    hoverAnchor={hoverAnchor}
                    feedback={feedbackMap[feedbackKey]}
                    canLocate={interactive}
                    linked={linkedIssueKeys.includes(issue.key)}
                    anchorShadow={anchorLinkMode && linkedIssueKeys.includes(issue.key)}
                    onLocate={onLocate}
                    onHover={onHover}
                    onFeedback={onFeedback}
                    onCancelFeedback={onCancelFeedback}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function IssueEntry({
  issue,
  selected,
  activeAnchor,
  hoverAnchor,
  feedback,
  resultKey,
  canLocate,
  linked,
  anchorShadow,
  onLocate,
  onHover,
  onFeedback,
  onCancelFeedback,
}: {
  issue: Issue;
  selected: boolean;
  activeAnchor: string | null;
  hoverAnchor: string | null;
  feedback?: ResultFeedback;
  resultKey: string;
  canLocate: boolean;
  linked: boolean;
  anchorShadow: boolean;
  onLocate: (anchorKey: string, issueKey?: string, source?: 'anchor' | 'issue') => void;
  onHover: (anchorKey: string | null) => void;
  onFeedback: FeedbackHandler;
  onCancelFeedback: (resultKey: string) => void;
}) {
  const severity = issue.severity;
  const label = issue.severityLabel ?? SEVERITY_LABEL[severity];
  const highlightWord = issue.evidence?.kind === 'text' ? issue.evidence.word : undefined;
  const context = `${issue.itemName} · ${anchorLabel(issue.anchor)}`;
  const feedbackReasons = feedback?.reasons ?? [];
  const tag = (
    <span className={`dcc-sev-tag dcc-sev-tag--${severity}`}>
      <span
        data-issue-dot={issue.key}
        className={`dcc-assoc-dot dcc-assoc-dot--${severity}`}
        aria-hidden="true"
      />
      {label}
    </span>
  );

  return (
    <article
      id={`issue-${issue.key}`}
      className={`dcc-issue-entry dcc-issue-entry--${severity}${selected ? ' is-selected' : ''}${activeAnchor === issue.anchorKey ? ' is-located' : ''}${hoverAnchor === issue.anchorKey ? ' is-hovered' : ''}${canLocate ? '' : ' is-readonly'}${linked ? ' is-linked' : ''}${anchorShadow ? ' is-anchor-linked' : ''}`}
      onClick={(event) => {
        // 卡片正文也可定位；标签、检测不准、复制建议值等按钮仍走各自逻辑
        if (!canLocate) return;
        if ((event.target as HTMLElement).closest('button, a')) return;
        onLocate(issue.anchorKey, issue.key, 'issue');
      }}
      onMouseEnter={() => onHover(issue.anchorKey)}
      onMouseLeave={() => onHover(null)}
    >
      <header className="dcc-issue-head">
        {canLocate ? (
          <button
            type="button"
            className="dcc-issue-assoc"
            title="关联到商品信息"
            aria-label={`定位到商品信息中的${anchorLabel(issue.anchor)}`}
            onClick={(event) => {
              event.stopPropagation();
              onLocate(issue.anchorKey, issue.key, 'issue');
            }}
          >
            {tag}
          </button>
        ) : (
          <span className="dcc-issue-assoc is-static" title="历史记录">{tag}</span>
        )}
      </header>

      <p className="dcc-issue-reason">
        {renderHighlight(issue.reason, highlightWord)}
      </p>

      {issue.suggestion && (
        <div className="dcc-suggestion">
          <div className="dcc-row-label">建议方案</div>
          <div>{issue.suggestion}</div>
          {issue.suggestionValue && (
            <button type="button" className="dcc-btn dcc-btn--text" onClick={() => copyText(issue.suggestionValue!, '已复制建议值')}>复制建议值</button>
          )}
        </div>
      )}

      <div className="dcc-issue-feedback">
        <button
          type="button"
          className="dcc-feedback-pill"
          onClick={() => onFeedback(resultKey, context)}
        >
          检测不准？
        </button>
        {feedback && (
          <div className="dcc-feedback-body">
            <span className="dcc-feedback-inline">
              已反馈{feedbackReasons.length ? `：${feedbackReasons.join('、')}` : ''}
              {feedback.text ? `（${feedback.text}）` : ''}
            </span>
            <button type="button" className="dcc-feedback-cancel" onClick={() => onCancelFeedback(resultKey)}>取消反馈</button>
          </div>
        )}
      </div>
    </article>
  );
}

/** 通过项：折叠在通过分组里，展开后可对漏报发起反馈 */
export function PassItemRow({
  view,
  feedback,
  onFeedback,
  onCancelFeedback,
}: {
  view: ItemView;
  feedback?: ResultFeedback;
  onFeedback: FeedbackHandler;
  onCancelFeedback: (resultKey: string) => void;
}) {
  const resultKey = `${view.code}:0`;
  return (
    <section id={`item-${view.code}`} className="dcc-pass-row" data-annotation-id={`dcc-item-${view.code}`}>
      <span className="dcc-pass-name">{view.name}</span>
      <ItemStatusTag status="pass" />
      {feedback ? (
        <span className="dcc-pass-feedback">
          已反馈{(feedback.reasons?.length ?? 0) > 0 ? `：${(feedback.reasons ?? []).join('、')}` : ''}
          <button type="button" className="dcc-link-action" onClick={() => onCancelFeedback(resultKey)}>取消反馈</button>
        </span>
      ) : (
        <button
          type="button"
          className="dcc-feedback-link"
          onClick={() => onFeedback(resultKey, `${view.name}（未发现问题）`, ['漏报'])}
        >
          检测结果有问题？
        </button>
      )}
    </section>
  );
}
