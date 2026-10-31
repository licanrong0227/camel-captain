import React, { useEffect, useState } from 'react';
import { ITEM_DEFS } from '../lib/scenarios';
import { TaskView } from '../lib/store';
import { countBySeverity, describeCounts, flattenIssues } from '../lib/issues';
import { TaskStatusTag } from './ui';

export function TaskSummaryCard({
  view,
  showProgress = true,
  showDetail = true,
  onRetryCollect,
  onOpen,
}: {
  view: TaskView;
  showProgress?: boolean;
  showDetail?: boolean;
  onRetryCollect?: (raw: string) => string | null;
  onOpen: (mode: 'progress' | 'detail') => void;
}) {
  const [retryUrl, setRetryUrl] = useState(view.task.url);
  const [retryError, setRetryError] = useState('');

  useEffect(() => {
    setRetryUrl(view.task.url);
    setRetryError('');
  }, [view.task.url, view.status]);
  const issues = flattenIssues(view.items);
  const finished = view.status === 'done' || view.status === 'partial-fail';
  const terminal = finished || view.status === 'collect-failed' || view.status === 'canceled';
  const progressPercent = Math.round((view.progress.done / view.progress.total) * 100);
  const showProgressBar = finished || view.status === 'checking';
  const foundCounts = countBySeverity(issues);
  const foundText = describeCounts(foundCounts);
  const foundTone = foundCounts.violation > 0
    ? 'reject'
    : foundCounts.suspect > 0
      ? 'suspect'
      : foundCounts.notice > 0
        ? 'notice'
        : 'fail';

  return (
    <div
      id="dcc-launch-summary"
      data-annotation-id="dcc-launch-summary"
      className={`dcc-card dcc-launch-summary dcc-launch-summary--${view.conclusion.level}`}
    >
      <div className="dcc-card-header dcc-launch-summary-head">
        <div className="dcc-card-title">本次检测</div>
        <span data-annotation-id="dcc-launch-summary-status">
          <TaskStatusTag status={view.status} mini />
        </span>
        <span className="dcc-launch-summary-url" title={view.task.url}>{view.task.url}</span>
        {terminal && showDetail ? (
          <button type="button" className="dcc-btn dcc-btn--primary dcc-launch-summary-cta" onClick={() => onOpen('detail')}>查看检测详情</button>
        ) : view.status === 'checking' && showProgress ? (
          <button type="button" className="dcc-btn dcc-btn--text dcc-launch-summary-cta" onClick={() => onOpen('progress')}>查看检测进度</button>
        ) : null}
      </div>

      <div className="dcc-launch-summary-body">
        <div className="dcc-launch-progress">
          <div className="dcc-launch-progress-main">
            {terminal ? (
              <span className={`dcc-launch-result-dot dcc-launch-result-dot--${view.conclusion.level}`} />
            ) : (
              <span className="dcc-spinner dcc-spinner--small" />
            )}
            <span className="dcc-launch-progress-text">
              {view.status === 'collect-failed'
                ? (view.conclusion.text || `采集失败：${view.task.collectFailedReason ?? '未获取到商品数据'}`)
                : finished
                  ? (foundText
                      ? <span className={`dcc-launch-result-count dcc-launch-result-count--${foundTone}`}>{foundText}</span>
                      : <span className="dcc-launch-result-count dcc-launch-result-count--pass">全部通过，未发现问题</span>)
                  : view.status === 'checking'
                  ? (
                      <>
                        检测中，已完成 {view.progress.done}/{view.progress.total} 项
                        {foundText ? (
                          <span className={`dcc-launch-found dcc-launch-found--${foundTone}`}> · 已发现 {foundText}</span>
                        ) : null}
                      </>
                    )
                  : view.status === 'pending'
                    ? '等待采集商品信息…'
                    : '正在采集商品信息…'}
            </span>
            {showProgressBar && <span className="dcc-launch-progress-count">{view.progress.done}/{view.progress.total}</span>}
          </div>
          {showProgressBar && (
            <div className="dcc-progress dcc-launch-progress-bar"><i style={{ width: `${progressPercent}%` }} /></div>
          )}
        </div>

        {view.status === 'collect-failed' && onRetryCollect && (
          <div className="dcc-launch-retry">
            <div className="dcc-launch-retry-row">
              <input
                className={`dcc-input${retryError ? ' is-error' : ''}`}
                value={retryUrl}
                placeholder="粘贴正确的敦煌网商品链接或 itemCode"
                onChange={(event) => {
                  setRetryUrl(event.target.value);
                  setRetryError('');
                }}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter') return;
                  const error = onRetryCollect(retryUrl);
                  setRetryError(error ?? '');
                }}
              />
              <button
                type="button"
                className="dcc-btn dcc-btn--primary"
                onClick={() => {
                  const error = onRetryCollect(retryUrl);
                  setRetryError(error ?? '');
                }}
              >
                重新采集
              </button>
            </div>
            {retryError && <div className="dcc-field-error">{retryError}</div>}
            <div className="dcc-launch-retry-hint">链接填错了？直接改成正确的链接或 itemCode（会自动补全）；留空则按原链接重新采集。</div>
          </div>
        )}

        <div className="dcc-launch-items">
          {ITEM_DEFS.map((def) => {
            const item = view.items.find((entry) => entry.code === def.code);
            if (!item) return null;
            const counts = countBySeverity(issues.filter((issue) => issue.code === item.code));
            const problemText = describeCounts(counts);
            const tone = item.status === 'violation'
              ? 'violation'
              : item.status === 'suspect'
                ? 'suspect'
                : item.status === 'manual'
                  ? 'notice'
                  : item.status === 'fail'
                    ? 'fail'
                    : item.status === 'running'
                      ? 'running'
                      : item.status === 'queued'
                        ? 'queued'
                        : 'pass';
            return (
              <div key={def.code} className={`dcc-launch-item dcc-launch-item--${tone}`}>
                <span className="dcc-launch-item-name">{def.name.replace('检查', '')}</span>
                <span className="dcc-launch-item-status">
                  {item.status === 'running' && <span className="dcc-spinner dcc-spinner--small" />}
                  {item.status === 'queued'
                    ? '排队中'
                    : item.status === 'running'
                      ? '检测中'
                      : item.status === 'pass'
                        ? '通过'
                        : item.status === 'fail'
                          ? '检测失败'
                          : problemText || '已出结果'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
