import React, { useState } from 'react';
import { ItemView } from '../lib/store';
import { PreviewScenario } from '../lib/previewScenarios';
import { BlockView } from './BlockView';
import { DISLIKE_REASONS } from './Dialogs';
import { ItemStatusTag, copyText } from './ui';

const reasonIndex = (reason: string) => {
  const index = DISLIKE_REASONS.indexOf(reason);
  return index < 0 ? DISLIKE_REASONS.length : index;
};

export function ItemCard({
  view,
  preview,
  onLike,
  onDislike,
  onRetry,
}: {
  view: ItemView;
  preview?: PreviewScenario;
  onLike: () => void;
  onDislike: () => void;
  onRetry: () => void;
}) {
  const { override } = view;
  const status = preview ? preview.status : view.status;
  const outcome = preview ? preview.outcome : view.outcome;
  const emphasis = status === 'violation' || status === 'suspect' || status === 'manual';
  const collapsedDefault = status === 'pass' || status === 'fail' || status === 'queued' || status === 'running';
  const [expanded, setExpanded] = useState(!collapsedDefault);
  const [showDetail, setShowDetail] = useState(false);
  const [pickedSuggestion, setPickedSuggestion] = useState<string | undefined>(undefined);
  const [collapsedHits, setCollapsedHits] = useState<number[]>([]);
  const [lastStatus, setLastStatus] = useState(status);
  if (lastStatus !== status) {
    setLastStatus(status);
    setExpanded(!collapsedDefault);
    setShowDetail(false);
    setPickedSuggestion(undefined);
    setCollapsedHits([]);
  }

  const feedback = override?.feedback ?? null;
  const orderedReasons = [...(override?.feedbackReasons ?? [])].sort((a, b) => reasonIndex(a) - reasonIndex(b));
  const hasExpandable = emphasis || (outcome?.detail?.length ?? 0) > 0;
  const options = outcome?.suggestionOptions;
  const activeSuggestion =
    options?.find((option) => option.value === pickedSuggestion)?.value ??
    options?.find((option) => option.recommended)?.value ??
    outcome?.suggestionValue;

  return (
    <section
      data-annotation-id={`dcc-item-${view.code}`}
      className={`dcc-item${emphasis ? ` dcc-item--${status}` : ''}${status === 'pass' ? ' is-quiet' : ''}`}
    >
      <header className="dcc-item-head">
        <div className="dcc-item-title-wrap">
          <div className="dcc-item-title">
            {view.name}
            <ItemStatusTag status={status} />
          </div>
        </div>
        <div className="dcc-item-head-actions" data-annotation-id={`dcc-item-actions-${view.code}`}>
          {status !== 'queued' && status !== 'running' && (
            <button type="button" className="dcc-btn dcc-btn--text" onClick={onRetry}>重新检测</button>
          )}
          <div className="dcc-feedback" title="反馈质检质量">
            <button
              type="button"
              className={`dcc-fb-btn${feedback === 'up' ? ' is-active' : ''}`}
              onClick={onLike}
              title={feedback === 'up' ? '取消满意' : '满意'}
            >👍</button>
            <button
              type="button"
              className={`dcc-fb-btn${feedback === 'down' ? ' is-active' : ''}`}
              onClick={onDislike}
              title={feedback === 'down' ? '取消不满意' : '不满意'}
            >👎</button>
          </div>
        </div>
      </header>

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

      {outcome && (
        <div className="dcc-item-body">
          <div className="dcc-item-row"><span className="dcc-row-label">检测对象</span><span>{view.target}</span></div>
          <div className="dcc-item-row"><span className="dcc-row-label">结论</span><span className={`dcc-conclusion dcc-conclusion--${status}`}>{outcome.conclusion}</span></div>

          {status === 'fail' && (
            <div className="dcc-item-row"><span className="dcc-row-label">失败原因</span><span>{outcome.failReason}</span></div>
          )}

          {expanded && (status === 'violation' || status === 'suspect' || status === 'manual') && (
            <>
              {(outcome.hits?.length ?? 0) > 0 ? (
                <div className="dcc-hit-list">
                  {outcome.hits!.map((hit, index) => {
                    const collapsed = collapsedHits.includes(index);
                    // 一次检测里可同时有违规与疑似违规，类型按单条记录判定，不跟卡片整体状态走
                    const hitSeverity = hit.severity ?? (status === 'violation' ? 'violation' : 'suspect');
                    const violationHit = hitSeverity === 'violation';
                    return (
                      <div key={index} className={`dcc-hit-card${violationHit ? ' is-violation' : ' is-suspect'}`}>
                        <div className="dcc-hit-card-head">
                          <div className="dcc-hit-card-title">
                            <span className="dcc-item-no">{index + 1}</span>
                            <span>{violationHit ? '违规' : '疑似违规'}</span>
                          </div>
                          <button
                            type="button"
                            className="dcc-btn dcc-btn--text"
                            onClick={() => setCollapsedHits((prev) => collapsed ? prev.filter((i) => i !== index) : [...prev, index])}
                          >{collapsed ? '展开' : '收起'}</button>
                        </div>
                        {!collapsed && (
                          <>
                            <div className="dcc-item-row"><span className="dcc-row-label">{violationHit ? '违规原因' : '疑似原因'}</span>
                              <span>{hit.reason}{hit.position ? <span className="dcc-hit-position">（{hit.position}）</span> : null}</span>
                            </div>
                            {hit.reference && hit.reference.length > 0 && (
                              <div className="dcc-item-section">
                                <div className="dcc-row-label">参考信息</div>
                                <div className="dcc-ref-list">{hit.reference.map((block, refIndex) => <BlockView key={refIndex} block={block} />)}</div>
                              </div>
                            )}
                            {hit.suggestion && (
                              <div className="dcc-suggestion">
                                <div className="dcc-row-label">建议方案</div>
                                <div>{hit.suggestion}</div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : outcome.hitReason ? (
                <div className="dcc-item-row"><span className="dcc-row-label">{status === 'violation' ? '违规原因' : '疑似原因'}</span>
                  <span>{outcome.hitReason}{outcome.hitPosition ? <span className="dcc-hit-position">（{outcome.hitPosition}）</span> : null}</span>
                </div>
              ) : null}
              {outcome.reference && outcome.reference.length > 0 && (
                <div className="dcc-item-section">
                  <div className="dcc-row-label">参考信息</div>
                  <div className="dcc-ref-list">{outcome.reference.map((block, index) => <BlockView key={index} block={block} />)}</div>
                </div>
              )}
              {outcome.suggestion && (
                <div className="dcc-suggestion">
                  <div className="dcc-row-label">建议方案</div>
                  <div>{outcome.suggestion}</div>
                  {options && options.length > 0 && (
                    <div className="dcc-option-list">
                      {options.map((option) => (
                        <div
                          key={option.value}
                          role="radio"
                          aria-checked={option.value === activeSuggestion}
                          tabIndex={0}
                          className={`dcc-option${option.value === activeSuggestion ? ' is-selected' : ''}`}
                          onClick={() => setPickedSuggestion(option.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') setPickedSuggestion(option.value);
                          }}
                        >
                          <span className="dcc-option-radio" />
                          <div>
                            <div className="dcc-option-title">
                              {option.value}
                              {option.recommended ? <span className="dcc-option-badge">推荐</span> : null}
                            </div>
                            {option.note ? <div className="dcc-option-desc">{option.note}</div> : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {expanded && showDetail && outcome.detail && outcome.detail.length > 0 && (
            <div className="dcc-item-section dcc-detail-area">
              <div className="dcc-row-label">详细数据</div>
              <div className="dcc-ref-list">{outcome.detail.map((block, index) => <BlockView key={index} block={block} />)}</div>
            </div>
          )}

          {hasExpandable || activeSuggestion || feedback === 'down' ? (
          <footer className="dcc-item-foot">
            {hasExpandable && (
              <button type="button" className="dcc-btn dcc-btn--text" onClick={() => setExpanded((prev) => !prev)}>
                {expanded ? '收起' : '展开详情'}
              </button>
            )}
            {expanded && outcome.detail && outcome.detail.length > 0 && (
              <button type="button" className="dcc-btn dcc-btn--text" onClick={() => setShowDetail((prev) => !prev)}>
                {showDetail ? '隐藏详细数据' : '查看详细数据'}
              </button>
            )}
            {activeSuggestion && (
              <button type="button" className="dcc-btn dcc-btn--text" onClick={() => copyText(activeSuggestion, '已复制建议值')}>复制建议</button>
            )}
            {feedback === 'down' && (
              <span className="dcc-feedback-note">
                已标记不满意{orderedReasons.length ? `：${orderedReasons.join('、')}` : ''}
                {override?.feedbackText ? `（${override.feedbackText}）` : ''}
              </span>
            )}
          </footer>
          ) : null}
        </div>
      )}
    </section>
  );
}
