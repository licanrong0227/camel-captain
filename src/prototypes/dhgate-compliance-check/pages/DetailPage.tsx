import React, { useEffect, useMemo, useState } from 'react';
import { useProtoDevState } from '@axhub/annotation';
import {
  computeTaskView,
  getTask,
  recheckTask,
  retryCollect,
  retryItem,
  setFeedback,
  loadTasks,
} from '../lib/store';
import { ItemCode } from '../lib/scenarios';
import { CONCLUSION_SCENARIOS, PREVIEW_SCENARIOS } from '../lib/previewScenarios';
import { IMAGES, TaskStatusTag, copyText, fmtTime, showToast } from '../components/ui';
import { ItemCard } from '../components/ItemCard';
import { FeedbackDialog } from '../components/Dialogs';

interface DialogState {
  type: 'feedback';
  code: ItemCode;
  name: string;
}

export function DetailPage({ taskId, onBack, onOpenTask }: {
  taskId: string;
  onBack: () => void;
  onOpenTask: (taskId: string) => void;
}) {
  const [, setTick] = useState(0);
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [version, setVersion] = useState(0); // 强制在 mutate 后刷新
  const protoState = useProtoDevState<Record<string, unknown>>();

  const task = useMemo(() => getTask(taskId), [taskId, version]);
  const now = Date.now();
  const view = useMemo(() => (task ? computeTaskView(task, now) : null), [task, Math.floor(now / 1000), version]);

  const running = view ? ['pending', 'collecting', 'checking'].includes(view.status) : false;
  useEffect(() => {
    if (!running) return undefined;
    const timer = window.setInterval(() => setTick((prev) => prev + 1), 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  if (!task || !view) {
    return (
      <div className="dcc-card">
        <div className="dcc-empty">未找到该检测任务。<button type="button" className="dcc-btn dcc-btn--text" onClick={onBack}>返回质检记录</button></div>
      </div>
    );
  }

  const mutate = (fn: () => void) => {
    fn();
    setVersion((prev) => prev + 1);
  };

  const onRecheck = () => {
    const active = loadTasks().find((entry) => {
      if (entry.url !== task.url) return false;
      const next = computeTaskView(entry, Date.now());
      return ['pending', 'collecting', 'checking'].includes(next.status) && entry.id !== task.id;
    });
    if (active) {
      showToast('warning', '该商品正在检测中，请稍后');
      return;
    }
    const fresh = recheckTask(task.id);
    if (fresh) {
      showToast('success', '已创建新的检测任务，旧记录保留');
      onOpenTask(fresh.id);
    }
  };

  const conclusionOverride = CONCLUSION_SCENARIOS.find((s) => s.value === protoState.conclusion_state);
  const conclusionView = conclusionOverride
    ? {
        level: conclusionOverride.level,
        text: conclusionOverride.text,
        counts: conclusionOverride.counts,
        showCounts: conclusionOverride.showCounts,
      }
    : {
        level: view.conclusion.level,
        text: view.conclusion.text,
        counts: view.summary,
        showCounts: view.status === 'done' || view.status === 'partial-fail',
      };

  return (
    <div className="dcc-detail">
      <div className="dcc-detail-topbar">
        <button type="button" className="dcc-btn" onClick={onBack}>← 返回质检记录</button>
        <div className="dcc-detail-topbar-actions">
          <button type="button" className="dcc-btn" onClick={onRecheck}>重新检测</button>
          <button type="button" className="dcc-btn" onClick={() => copyText(task.url, '商品链接已复制')}>复制链接</button>
        </div>
      </div>

      <div className="dcc-card dcc-summary-card">
        <img className="dcc-summary-img" src={IMAGES[task.image as keyof typeof IMAGES]} alt="" />
        <div className="dcc-summary-info">
          <div className="dcc-summary-title">{task.title}</div>
          <div className="dcc-summary-grid">
            <span>链接：<a className="dcc-link" href={task.url} target="_blank" rel="noreferrer">{task.url}</a></span>
            <span>类目：{task.category}</span>
            <span>价格区间：{task.priceRange}</span>
            <span>SKU 数量：{task.skuCount}</span>
            <span>采集时间：{task.collectedAt ? fmtTime(task.collectedAt) : fmtTime(task.submitTime + 2800)}<button type="button" className="dcc-btn dcc-btn--text" style={{ marginLeft: 8, fontSize: 12, padding: '0 4px' }} onClick={() => mutate(() => { retryCollect(task.id); showToast('success', '已重新发起采集'); })}>重新采集</button></span>
            <span>任务状态：<TaskStatusTag status={view.status} mini /></span>
          </div>
        </div>
      </div>

      <div data-annotation-id="dcc-conclusion-bar" className={`dcc-conclusion-bar dcc-conclusion-bar--${conclusionView.level}`}>
        {conclusionView.showCounts && (
          <span className="dcc-conclusion-counts">
            检测完成：命中 <b>{conclusionView.counts.hit}</b> 项，疑似 <b>{conclusionView.counts.suspect}</b> 项，通过 <b>{conclusionView.counts.pass}</b> 项
            {conclusionView.counts.fail > 0 ? <>，失败 <b>{conclusionView.counts.fail}</b> 项</> : null}
          </span>
        )}
        <span className="dcc-conclusion-text">
          结论：{conclusionView.text}
        </span>
        {conclusionView.level === 'checking' && <span className="dcc-spinner dcc-spinner--small" />}
      </div>

      {view.status === 'collect-failed' && (
        <div className="dcc-card dcc-fail-card">
          <div className="dcc-fail-title">采集失败</div>
          <div className="dcc-fail-reason">失败原因：{task.collectFailedReason}</div>
          <div className="dcc-fail-tip">任务已保存，可修正链接问题后重试采集；重试期间可离开页面，不影响任务。</div>
          <button
            type="button"
            className="dcc-btn dcc-btn--primary"
            onClick={() =>
              mutate(() => {
                retryCollect(task.id);
                showToast('success', '已重新发起采集');
              })
            }
          >
            重试采集
          </button>
        </div>
      )}

      {(view.status === 'canceled') && (
        <div className="dcc-card dcc-fail-card">
          <div className="dcc-fail-title">任务已取消</div>
          <div className="dcc-fail-tip">可点击右上角「重新检测」创建新任务。</div>
        </div>
      )}

      {view.items.length > 0 && (
        <div className="dcc-item-list">
          {view.items.map((item) => {
            const preview = PREVIEW_SCENARIOS[item.code].find((s) => s.value === protoState[`item_state_${item.code}`]);
            return (
            <ItemCard
              key={item.code}
              view={item}
              preview={preview}
              onLike={() =>
                mutate(() => {
                  const next = item.override?.feedback === 'up' ? null : 'up';
                  setFeedback(task.id, item.code, next, next ? undefined : item.override?.feedbackReasons, next ? undefined : item.override?.feedbackText);
                  if (next) showToast('success', '感谢反馈：已点赞');
                  else showToast('info', '已取消点赞');
                })
              }
              onDislike={() => {
                if (item.override?.feedback === 'down') {
                  showToast('info', '已点踩，可再次提交修改原因');
                }
                setDialog({ type: 'feedback', code: item.code, name: item.name });
              }}
              onRetry={() =>
                mutate(() => {
                  retryItem(task.id, item.code);
                  showToast('success', `已重试「${item.name}」，仅该项重新检测`);
                })
              }
            />
            );
          })}
        </div>
      )}

      {dialog?.type === 'feedback' && (
        <FeedbackDialog
          itemName={dialog.name}
          onCancel={() => setDialog(null)}
          onSubmit={(reasons, text) =>
            mutate(() => {
              setFeedback(task.id, dialog.code, 'down', reasons, text);
              setDialog(null);
              showToast('success', '感谢反馈，将用于评估该质检项检测质量');
            })
          }
        />
      )}
    </div>
  );
}
