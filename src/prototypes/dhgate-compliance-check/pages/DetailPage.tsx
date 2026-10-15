import React, { useEffect, useMemo, useState } from 'react';
import { setProtoDevState, useProtoDevState } from '@axhub/annotation';
import {
  computeTaskView,
  getTask,
  mutateTask,
  recheckInPlace,
  recheckTask,
  recollectInfo,
  retryCollect,
  retryItem,
  setFeedback,
  loadTasks,
  validateDhgateUrl,
  ItemView,
} from '../lib/store';
import { ItemCode, ITEM_DEFS, getOutcome } from '../lib/scenarios';
import { CONCLUSION_SCENARIOS, PREVIEW_SCENARIOS } from '../lib/previewScenarios';
import { IMAGES, TaskStatusTag, copyText, fmtTime, showToast } from '../components/ui';
import { ItemCard } from '../components/ItemCard';
import { FeedbackDialog, RecollectDialog, RecollectMode, RecheckDialog, RecheckMode } from '../components/Dialogs';

type DialogState = { type: 'feedback'; code: ItemCode; name: string } | { type: 'recollect' } | { type: 'recheck' };

export function DetailPage({ taskId, onBack, onOpenTask }: {
  taskId: string;
  onBack: () => void;
  onOpenTask: (taskId: string) => void;
}) {
  const [, setTick] = useState(0);
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [urlDraft, setUrlDraft] = useState('');
  const [urlError, setUrlError] = useState('');
  const [version, setVersion] = useState(0); // 强制在 mutate 后刷新
  const protoState = useProtoDevState<Record<string, unknown>>();

  const task = useMemo(() => getTask(taskId), [taskId, version]);
  const now = Date.now();
  const view = useMemo(() => (task ? computeTaskView(task, now) : null), [task, Math.floor(now / 1000), version]);

  useEffect(() => {
    setUrlDraft(getTask(taskId)?.url ?? '');
    setUrlError('');
  }, [taskId]);

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
    setDialog({ type: 'recheck' });
  };

  const onRetryCollect = () => {
    const raw = urlDraft.trim();
    const effective = raw || task.url;
    const result = validateDhgateUrl(effective);
    if (!result.ok) {
      setUrlError(result.error ?? '链接格式不正确，请粘贴完整商品链接');
      return;
    }
    mutate(() => {
      if (raw && raw !== task.url) {
        mutateTask(task.id, (t) => {
          t.url = raw;
          if (result.productId) t.productId = result.productId;
        });
      }
      retryCollect(task.id);
      // 采集失败卡可能是标注面板强制展示的，点击后恢复跟随真实任务状态，页面重新进入采集中
      setProtoDevState({ collect_state: 'flow' });
      setUrlError('');
      showToast('success', '已重新发起采集');
    });
  };

  const onRecheckConfirm = (mode: RecheckMode) => {
    if (mode === 'in-place') {
      mutate(() => {
        recheckInPlace(task.id);
      });
      showToast('success', '已在当前记录重新检测，结果将逐项更新');
      setDialog(null);
      return;
    }
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
    setDialog(null);
    if (fresh) {
      showToast('success', '已创建新的检测任务，旧记录保留');
      onOpenTask(fresh.id);
    }
  };

  const conclusionOverride = CONCLUSION_SCENARIOS.find((s) => s.value === protoState.conclusion_state);
  const collectPreview = protoState.collect_state === 'failed' || protoState.collect_state === 'success'
    ? protoState.collect_state
    : 'flow';
  const forcedFailed = collectPreview === 'failed' && view.status !== 'collect-failed';
  const forcedDone = collectPreview === 'success' && view.status === 'collect-failed';
  const statusShown = forcedFailed ? 'collect-failed' : forcedDone ? 'done' : view.status;
  const passScenario = CONCLUSION_SCENARIOS.find((s) => s.value === 'pass');
  const conclusionView = conclusionOverride
    ? {
        level: conclusionOverride.level,
        text: conclusionOverride.text,
        counts: conclusionOverride.counts,
      }
    : forcedDone && passScenario
      ? {
          level: passScenario.level,
          text: passScenario.text,
          counts: passScenario.counts,
        }
      : {
        level: view.conclusion.level,
        text: view.conclusion.text,
        counts: view.summary,
      };

  const itemsShown: ItemView[] = statusShown === 'collect-failed'
    ? []
    : forcedDone
      ? ITEM_DEFS.map((def) => ({ code: def.code, name: def.name, group: def.group, target: def.target, status: 'pass' as const, outcome: getOutcome(task.scenario, def.code) }))
      : view.items;

  // 初始采集与「重新采集（采集后重新检测）」表现一致：采集期间只展示当前卡片 loading，
  // 结论条与质检项卡片不展示；「仅重新采集信息」不在此列，保持已有信息 + 转圈、质检结果不变
  const collectLoading = (statusShown === 'pending' || statusShown === 'collecting')
    && !task.collectOnlyAt;

  return (
    <div className="dcc-detail">
      <div className="dcc-detail-topbar">
        <button type="button" className="dcc-btn" onClick={onBack}>← 返回质检记录</button>
        <div className="dcc-detail-topbar-actions" data-annotation-id="dcc-recheck-entry">
          <button type="button" className="dcc-btn" onClick={onRecheck}>重新检测</button>
          <button type="button" className="dcc-btn" onClick={() => copyText(task.url, '商品链接已复制')}>复制链接</button>
        </div>
      </div>

      {statusShown === 'collect-failed' ? (
        <div className="dcc-card dcc-fail-card" data-annotation-id="dcc-summary-card">
          <div className="dcc-fail-title">采集失败</div>
          <div className="dcc-fail-reason">失败原因：{task.collectFailedReason ?? '未获取到商品数据，请检查链接后重试采集。'}</div>
          <div className="dcc-fail-tip">任务已保存，可修正链接问题后重新采集；期间可离开页面，不影响任务。</div>
          <div className="dcc-edit-url">
            <div className="dcc-edit-url-form">
              <input
                className={`dcc-input${urlError ? ' is-error' : ''}`}
                value={urlDraft}
                onChange={(e) => {
                  setUrlDraft(e.target.value);
                  setUrlError('');
                }}
                placeholder="粘贴正确的敦煌网商品链接"
              />
              {urlError && <div className="dcc-field-error">{urlError}</div>}
            </div>
            <div className="dcc-edit-url-hint">链接填错了？直接在这里改成正确的链接；留空则按原链接重新采集。</div>
          </div>
          <button
            type="button"
            className="dcc-btn dcc-btn--primary"
            onClick={onRetryCollect}
          >
            重新采集
          </button>
        </div>
      ) : collectLoading ? (
        <div className="dcc-card dcc-summary-card dcc-summary-card--loading" data-annotation-id="dcc-summary-card">
          <div className="dcc-summary-img dcc-img-skeleton" />
          <div className="dcc-summary-info">
            <div className="dcc-collect-loading-head">
              <span className="dcc-spinner" />
              <span className="dcc-running-text">正在采集商品信息，采集完成前暂无商品数据…</span>
            </div>
            <div className="dcc-skeleton-rows dcc-summary-skeleton-rows">
              <i style={{ width: '72%' }} />
              <i style={{ width: '55%' }} />
              <i style={{ width: '40%' }} />
            </div>
          </div>
        </div>
      ) : (
        <div className="dcc-card dcc-summary-card" data-annotation-id="dcc-summary-card">
          <img className="dcc-summary-img" src={IMAGES[task.image as keyof typeof IMAGES]} alt="" />
          <div className="dcc-summary-info">
            <div className="dcc-summary-title-row">
              <div className="dcc-summary-title">{task.title}</div>
              {statusShown === 'pending' && <span className="dcc-collect-status"><span className="dcc-spinner dcc-spinner--small" />排队等待采集…</span>}
              {statusShown === 'collecting' && <span className="dcc-collect-status"><span className="dcc-spinner dcc-spinner--small" />正在采集…</span>}
              {(statusShown === 'done' || statusShown === 'checking' || statusShown === 'partial-fail') && <span className="dcc-tag dcc-tag--item-pass">采集成功</span>}
            </div>
            <div className="dcc-summary-grid">
              <span>链接：<a className="dcc-link" href={task.url} target="_blank" rel="noreferrer">{task.url}</a></span>
              <span>类目：{task.category}</span>
              <span>价格区间：{task.priceRange}</span>
              <span>SKU 数量：{task.skuCount}</span>
              <div data-annotation-id="dcc-recollect-entry">采集时间：{task.collectedAt ? fmtTime(task.collectedAt) : fmtTime(task.submitTime + 2800)}<button type="button" className="dcc-btn dcc-btn--text" style={{ marginLeft: 8, fontSize: 12, padding: '0 4px' }} onClick={() => setDialog({ type: 'recollect' })}>重新采集</button></div>
              <span>任务状态：<TaskStatusTag status={statusShown} mini /></span>
            </div>
          </div>
        </div>
      )}

      {!collectLoading && statusShown !== 'collect-failed' && (
        <div data-annotation-id="dcc-conclusion-bar" className={`dcc-conclusion-bar dcc-conclusion-bar--${conclusionView.level}`}>
          <div className="dcc-conclusion-stats">
            <div className="dcc-stat is-pass"><span>通过</span><b>{conclusionView.counts.pass}</b></div>
            <div className="dcc-stat is-hit"><span>违规</span><b>{conclusionView.counts.hit}</b></div>
            <div className="dcc-stat is-suspect"><span>疑似</span><b>{conclusionView.counts.suspect}</b></div>
            <div className="dcc-stat is-fail"><span>失败</span><b>{conclusionView.counts.fail}</b></div>
          </div>
          <div className="dcc-conclusion-text">
            结论：{conclusionView.text}
            {conclusionView.level === 'checking' && <span className="dcc-spinner dcc-spinner--small" />}
          </div>
        </div>
      )}

      {(view.status === 'canceled') && (
        <div className="dcc-card dcc-fail-card">
          <div className="dcc-fail-title">任务已取消</div>
          <div className="dcc-fail-tip">可点击右上角「重新检测」创建新任务。</div>
        </div>
      )}

      {!collectLoading && itemsShown.length > 0 && (
        <div className="dcc-item-list">
          {itemsShown.map((item) => {
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
                  if (next) showToast('success', '感谢反馈：已标记满意');
                  else showToast('info', '已取消满意');
                })
              }
              onDislike={() => {
                if (item.override?.feedback === 'down') {
                  mutate(() => {
                    setFeedback(task.id, item.code, null, item.override?.feedbackReasons, item.override?.feedbackText);
                    showToast('info', '已取消不满意');
                  });
                  return;
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

      {dialog?.type === 'recheck' && (
        <RecheckDialog
          onCancel={() => setDialog(null)}
          onConfirm={onRecheckConfirm}
        />
      )}

      {dialog?.type === 'recollect' && (
        <RecollectDialog
          onCancel={() => setDialog(null)}
          onConfirm={(mode: RecollectMode) =>
            mutate(() => {
              setDialog(null);
              if (mode === 'info') {
                recollectInfo(task.id);
                showToast('success', '正在重新采集商品信息，检测结果保持不变');
              } else {
                retryCollect(task.id);
                showToast('success', '已重新采集，正在按最新信息重新检测');
              }
            })
          }
        />
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
