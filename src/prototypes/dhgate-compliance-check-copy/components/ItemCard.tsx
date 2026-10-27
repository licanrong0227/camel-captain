import React, { useEffect, useState } from 'react';
import { ItemView, ResultFeedback } from '../lib/store';
import { BlockView } from './BlockView';
import { DISLIKE_REASONS } from './Dialogs';
import { ItemStatusTag, copyText, fmtStamp } from './ui';

const reasonIndex = (reason: string) => {
  const index = DISLIKE_REASONS.indexOf(reason);
  return index < 0 ? DISLIKE_REASONS.length : index;
};

export function ItemCard({
  view,
  issueCount,
  focused,
  resultFeedback,
  onFeedback,
  onRetry,
  currentAt,
}: {
  view: ItemView;
  issueCount?: { violation: number; suspect: number; fail: number };
  focused?: boolean;
  resultFeedback?: Record<string, ResultFeedback>;
  onFeedback: (resultKey: string, mode: 'up' | 'down', label?: string) => void;
  onRetry: () => void;
  currentAt?: number;
}) {
  // 同一检测项多次检测：历史记录切换，默认看最新一轮
  const history = view.override?.attempts ?? [];
  const [pickedRound, setPickedRound] = useState<number | null>(null);
  const viewingHistory = pickedRound != null && pickedRound < history.length;
  const liveStatus = view.status;
  const status = viewingHistory ? history[pickedRound as number].status : liveStatus;
  const outcome = viewingHistory ? history[pickedRound as number].outcome : view.outcome;
  const emphasis = status === 'violation' || status === 'suspect' || status === 'manual';
  const collapsedDefault = status === 'pass' || status === 'fail' || status === 'queued' || status === 'running';
  const [expanded, setExpanded] = useState(!collapsedDefault);
  const [showDetail, setShowDetail] = useState(false);
  const [collapsedHits, setCollapsedHits] = useState<number[]>([]);
  const [lastStatus, setLastStatus] = useState(`${liveStatus}:${history.length}`);
  if (lastStatus !== `${liveStatus}:${history.length}`) {
    setLastStatus(`${liveStatus}:${history.length}`);
    setExpanded(!collapsedDefault);
    setShowDetail(false);
    setCollapsedHits([]);
    setPickedRound(null);
  }

  const selectRound = (round: number | null) => {
    setPickedRound(round);
    setExpanded(true);
    setShowDetail(false);
    setCollapsedHits([]);
  };

  const hits = outcome?.hits ?? [];
  // 反馈跟着检测结果走：违规/疑似结果一律渲染成条目卡片，按钮在卡片内；通过态只有一条结论，留在卡片头部；检测失败没有结果，不提供反馈
  const singleResult = emphasis && hits.length === 0 && outcome?.hitReason ? outcome : null;
  const itemResultKey = `${view.code}:0`;
  const itemFeedback = resultFeedback?.[itemResultKey];
  const orderedReasons = [...(itemFeedback?.reasons ?? [])].sort((a, b) => reasonIndex(a) - reasonIndex(b));
  const singleLabel = status === 'violation' ? '违规' : status === 'manual' ? '建议自查' : '疑似违规';
  const singleReasonLabel = status === 'violation' ? '违规原因' : status === 'manual' ? '建议自查原因' : '疑似原因';
  const singleCollapsed = collapsedHits.includes(0);
  const hasExpandable = emphasis || (outcome?.detail?.length ?? 0) > 0;
  const activeSuggestion = outcome?.suggestionValue;

  useEffect(() => {
    if (focused) setExpanded(true);
  }, [focused]);

  return (
    <section
      id={`item-${view.code}`}
      data-annotation-id={`dcc-item-${view.code}`}
      className={`dcc-item${emphasis ? ` dcc-item--${status}` : ''}${status === 'pass' ? ' is-quiet' : ''}`}
    >
      <header className="dcc-item-head">
        <div className="dcc-item-title-wrap">
          <div className="dcc-item-title">
            {view.name}
            <ItemStatusTag status={status} />
          </div>
          {!viewingHistory && issueCount && issueCount.violation + issueCount.suspect + issueCount.fail > 0 ? (
            <div className="dcc-item-count">
              {issueCount.violation ? `${issueCount.violation} 处违规` : ''}
              {issueCount.suspect ? `${issueCount.violation ? ' · ' : ''}${issueCount.suspect} 处疑似` : ''}
              {issueCount.fail ? `${issueCount.violation || issueCount.suspect ? ' · ' : ''}${issueCount.fail} 处失败` : ''}
            </div>
          ) : null}
        </div>
        <div className="dcc-item-head-actions" data-annotation-id={`dcc-item-actions-${view.code}`}>
          {!viewingHistory && liveStatus !== 'queued' && liveStatus !== 'running' && (
            <button type="button" className="dcc-btn dcc-btn--text" onClick={onRetry}>重新检测</button>
          )}
        </div>
      </header>

      {history.length > 0 && (
        <div className="dcc-attempt-bar" data-annotation-id={`dcc-item-attempts-${view.code}`}>
          <span className="dcc-attempt-label">检测记录</span>
          <div className="dcc-attempt-switch" role="tablist" aria-label="切换检测记录">
            {history.map((round, index) => (
              <button
                key={index}
                type="button"
                role="tab"
                aria-selected={pickedRound === index}
                className={`dcc-attempt-btn${pickedRound === index ? ' is-active' : ''}`}
                onClick={() => selectRound(index)}
              >
                <span className="dcc-attempt-no">第 {index + 1} 次</span>
                <span className="dcc-attempt-time">{fmtStamp(round.at)}</span>
              </button>
            ))}
            <button
              type="button"
              role="tab"
              aria-selected={pickedRound == null}
              className={`dcc-attempt-btn${pickedRound == null ? ' is-active' : ''}`}
              onClick={() => selectRound(null)}
            >
              <span className="dcc-attempt-no">第 {history.length + 1} 次</span>
              <span className="dcc-attempt-time">
                {liveStatus === 'queued' || liveStatus === 'running'
                  ? (liveStatus === 'queued' ? '排队中' : '检测中')
                  : fmtStamp(currentAt ?? Date.now())}
              </span>
              {liveStatus !== 'queued' && liveStatus !== 'running' && <span className="dcc-attempt-latest">最新</span>}
            </button>
          </div>
          {viewingHistory && <span className="dcc-attempt-note">历史记录，仅查看</span>}
        </div>
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

      {outcome && (
        <div className="dcc-item-body">
          <div className="dcc-item-row"><span className="dcc-row-label">检测对象</span><span>{view.target}</span></div>
          <div className="dcc-item-row"><span className="dcc-row-label">结论</span><span className={`dcc-conclusion dcc-conclusion--${status}`}>{outcome.conclusion}</span></div>

          {status === 'fail' && (
            <div className="dcc-item-row"><span className="dcc-row-label">失败原因</span><span>{outcome.failReason}</span></div>
          )}

          {expanded && emphasis && hits.length > 0 && (
            <div className="dcc-hit-list">
              {hits.map((hit, index) => {
                    const collapsed = collapsedHits.includes(index);
                    // 一次检测里可同时有违规与疑似违规，类型按单条记录判定，不跟卡片整体状态走
                    const hitSeverity = hit.severity ?? (status === 'violation' ? 'violation' : 'suspect');
                    const violationHit = hitSeverity === 'violation';
                    const resultKey = `${view.code}:${index}`;
                    const hitFeedback = resultFeedback?.[resultKey];
                    const hitReasons = [...(hitFeedback?.reasons ?? [])].sort((a, b) => reasonIndex(a) - reasonIndex(b));
                    return (
                      <div key={index} className={`dcc-hit-card${violationHit ? ' is-violation' : ' is-suspect'}`}>
                        <div className="dcc-hit-card-head">
                          <div className="dcc-hit-card-title">
                            <span className="dcc-item-no">{index + 1}</span>
                            <span>{hit.severityLabel ?? (violationHit ? '违规' : '疑似违规')}</span>
                          </div>
                          <div className="dcc-hit-card-actions">
                            {!viewingHistory && (
                              <div className="dcc-feedback" title="反馈这条检测结果">
                                <button
                                  type="button"
                                  className={`dcc-fb-btn${hitFeedback?.mode === 'up' ? ' is-active' : ''}`}
                                  onClick={() => onFeedback(resultKey, 'up')}
                                  title={hitFeedback?.mode === 'up' ? '取消满意' : '满意'}
                                >👍</button>
                                <button
                                  type="button"
                                  className={`dcc-fb-btn${hitFeedback?.mode === 'down' ? ' is-active' : ''}`}
                                  onClick={() => onFeedback(resultKey, 'down', `${view.name} · 第 ${index + 1} 条`)}
                                  title={hitFeedback?.mode === 'down' ? '取消不满意' : '不满意'}
                                >👎</button>
                              </div>
                            )}
                            <button
                              type="button"
                              className="dcc-btn dcc-btn--text"
                              onClick={() => setCollapsedHits((prev) => collapsed ? prev.filter((i) => i !== index) : [...prev, index])}
                            >{collapsed ? '展开' : '收起'}</button>
                          </div>
                        </div>
                        {!collapsed && (
                          <>
                            <div className="dcc-item-row"><span className="dcc-row-label">{violationHit ? '违规原因' : hit.severityLabel ? `${hit.severityLabel}原因` : '疑似原因'}</span>
                              <span>{hit.reason}{hit.position ? <span className="dcc-hit-position">（{hit.position}）</span> : null}</span>
                            </div>
                            {hit.reference && hit.reference.length > 0 && (
                              <div className="dcc-ref-group">
                                <div className="dcc-ref-group-head">
                                  <span className="dcc-ref-group-title">参考信息</span>
                                </div>
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
                        {!viewingHistory && hitFeedback?.mode === 'down' && (
                          <div className="dcc-feedback-note dcc-feedback-note--inline">
                            已标记不满意{hitReasons.length ? `：${hitReasons.join('、')}` : ''}
                            {hitFeedback.text ? `（${hitFeedback.text}）` : ''}
                          </div>
                        )}
                      </div>
                    );
                  })}
            </div>
          )}

          {expanded && singleResult && (
            <div className="dcc-hit-list">
              <div className={`dcc-hit-card${status === 'violation' ? ' is-violation' : ' is-suspect'}`}>
                <div className="dcc-hit-card-head">
                  <div className="dcc-hit-card-title">
                    <span className="dcc-item-no">1</span>
                    <span>{singleLabel}</span>
                  </div>
                  <div className="dcc-hit-card-actions">
                    {!viewingHistory && (
                      <div className="dcc-feedback" title="反馈这条检测结果">
                        <button
                          type="button"
                          className={`dcc-fb-btn${itemFeedback?.mode === 'up' ? ' is-active' : ''}`}
                          onClick={() => onFeedback(itemResultKey, 'up')}
                          title={itemFeedback?.mode === 'up' ? '取消满意' : '满意'}
                        >👍</button>
                        <button
                          type="button"
                          className={`dcc-fb-btn${itemFeedback?.mode === 'down' ? ' is-active' : ''}`}
                          onClick={() => onFeedback(itemResultKey, 'down', view.name)}
                          title={itemFeedback?.mode === 'down' ? '取消不满意' : '不满意'}
                        >👎</button>
                      </div>
                    )}
                    <button
                      type="button"
                      className="dcc-btn dcc-btn--text"
                      onClick={() => setCollapsedHits((prev) => (singleCollapsed ? prev.filter((i) => i !== 0) : [...prev, 0]))}
                    >{singleCollapsed ? '展开' : '收起'}</button>
                  </div>
                </div>
                {!singleCollapsed && (
                  <>
                    <div className="dcc-item-row"><span className="dcc-row-label">{singleReasonLabel}</span>
                      <span>{singleResult.hitReason}{singleResult.hitPosition ? <span className="dcc-hit-position">（{singleResult.hitPosition}）</span> : null}</span>
                    </div>
                    {singleResult.reference && singleResult.reference.length > 0 && (
                      <div className="dcc-ref-group">
                        <div className="dcc-ref-group-head">
                          <span className="dcc-ref-group-title">参考信息</span>
                        </div>
                        <div className="dcc-ref-list">{singleResult.reference.map((block, index) => <BlockView key={index} block={block} />)}</div>
                      </div>
                    )}
                    {singleResult.suggestion && (
                      <div className="dcc-suggestion">
                        <div className="dcc-row-label">建议方案</div>
                        <div>{singleResult.suggestion}</div>
                      </div>
                    )}
                  </>
                )}
                {!viewingHistory && itemFeedback?.mode === 'down' && (
                  <div className="dcc-feedback-note dcc-feedback-note--inline">
                    已标记不满意{orderedReasons.length ? `：${orderedReasons.join('、')}` : ''}
                    {itemFeedback.text ? `（${itemFeedback.text}）` : ''}
                  </div>
                )}
              </div>
            </div>
          )}

          {expanded && showDetail && outcome.detail && outcome.detail.length > 0 && (
            <div className="dcc-item-section dcc-detail-area">
              <div className="dcc-row-label">详细数据</div>
              <div className="dcc-ref-list">{outcome.detail.map((block, index) => <BlockView key={index} block={block} />)}</div>
            </div>
          )}

          {hasExpandable || activeSuggestion ? (
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
          </footer>
          ) : null}
        </div>
      )}
    </section>
  );
}
