import React, { useState } from 'react';
import { ItemView } from '../lib/store';
import { PreviewScenario } from '../lib/previewScenarios';
import { BlockView } from './BlockView';
import { ItemStatusTag, copyText } from './ui';

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
  const [lastStatus, setLastStatus] = useState(status);
  if (lastStatus !== status) {
    setLastStatus(status);
    setExpanded(!collapsedDefault);
    setShowDetail(false);
  }

  const feedback = override?.feedback ?? null;
  const hasExpandable = emphasis || (outcome?.detail?.length ?? 0) > 0;

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
        <div className="dcc-item-head-actions">
          {status !== 'queued' && status !== 'running' && (
            <button type="button" className="dcc-btn dcc-btn--text" onClick={onRetry}>重新检测</button>
          )}
          <div className="dcc-feedback" title="反馈质检质量">
            <button
              type="button"
              className={`dcc-fb-btn${feedback === 'up' ? ' is-active' : ''}`}
              onClick={onLike}
              title={feedback === 'up' ? '取消点赞' : '点赞'}
            >👍</button>
            <button
              type="button"
              className={`dcc-fb-btn${feedback === 'down' ? ' is-active' : ''}`}
              onClick={onDislike}
              title={feedback === 'down' ? '修改点踩反馈' : '点踩'}
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
              {outcome.hitReason && (
                <div className="dcc-item-row"><span className="dcc-row-label">命中原因</span>
                  <span>{outcome.hitReason}{outcome.hitPosition ? <span className="dcc-hit-position">（{outcome.hitPosition}）</span> : null}</span>
                </div>
              )}
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

          {hasExpandable || outcome.suggestionValue || feedback === 'down' ? (
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
            {outcome.suggestionValue && (
              <button type="button" className="dcc-btn dcc-btn--text" onClick={() => copyText(outcome.suggestionValue!, '已复制建议值')}>复制建议</button>
            )}
            {feedback === 'down' && (
              <span className="dcc-feedback-note">
                已点踩{override?.feedbackReasons?.length ? `：${override.feedbackReasons.join('、')}` : ''}
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
