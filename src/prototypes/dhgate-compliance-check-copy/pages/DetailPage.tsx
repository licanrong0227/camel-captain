import React, { useEffect, useMemo, useRef, useState } from 'react';
import { setProtoDevState, useProtoDevState } from '@axhub/annotation';
import {
  computeTaskView,
  getTask,
  mutateTask,
  recheckInPlace,
  recheckAsNewRecord,
  retryCollect,
  retryItem,
  itemFinishedAt,
  setFeedback,
  resolveDhgateInput,
  ItemView,
  TaskStatus,
} from '../lib/store';
import { ItemCode, ITEM_DEFS } from '../lib/scenarios';
import {
  composeScene,
  DEMO_RESET_STATE,
  OVERRIDE_RESET_STATE,
  PagePresetValue,
  isDemoRecord,
} from '../lib/demoScenarios';
import { countBySeverity, flattenIssues, groupByAnchor, Issue } from '../lib/issues';
import { getProductSnapshot } from '../lib/product';
import { IMAGES, fmtTime, showToast } from '../components/ui';
import { ItemCard } from '../components/ItemCard';
import { FeedbackDialog, RecheckDialog, RecheckMode } from '../components/Dialogs';
import { ProductView } from '../components/ProductView';
import { IssueDrawer } from '../components/IssueDrawer';
import { IssueNav } from '../components/IssueNav';

type DialogState = { type: 'feedback'; code: ItemCode; resultKey: string; name: string } | { type: 'recheck' };
type ViewMode = 'product' | 'items';

const issueDiffKey = (issue: Issue) => `${issue.code}|${issue.anchorKey}`;


export function DetailPage({
  taskId,
  initialView = 'product',
  initialFocus,
  initialPreset,
  onBack,
  onOpenTask,
}: {
  taskId: string;
  initialView?: ViewMode;
  initialFocus?: ItemCode;
  initialPreset?: PagePresetValue;
  onBack: () => void;
  onOpenTask: (taskId: string) => void;
}) {
  const [, setTick] = useState(0);
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [urlDraft, setUrlDraft] = useState('');
  const [urlError, setUrlError] = useState('');
  const [version, setVersion] = useState(0); // 强制在 mutate 后刷新
  const [viewMode, setViewMode] = useState<ViewMode>(initialView);
  const [drawerKey, setDrawerKey] = useState<string | null>(null);
  const [focusCode, setFocusCode] = useState<ItemCode | undefined>(initialFocus);
  const [diffBase, setDiffBase] = useState<string[] | null>(null);
  const [diff, setDiff] = useState<{ fixed: number; remain: number; added: number } | null>(null);
  const protoState = useProtoDevState<Record<string, unknown>>();

  const task = useMemo(() => getTask(taskId), [taskId, version]);
  const now = Date.now();
  const view = useMemo(() => (task ? computeTaskView(task, now) : null), [task, Math.floor(now / 1000), version]);
  const snapshot = useMemo(() => (task ? getProductSnapshot(task) : null), [task, version]);

  useEffect(() => {
    setUrlDraft(getTask(taskId)?.url ?? '');
    setUrlError('');
  }, [taskId]);

  useEffect(() => {
    setViewMode(initialView);
  }, [initialView, taskId]);

  useEffect(() => {
    setFocusCode(initialFocus);
  }, [initialFocus, taskId]);

  useEffect(() => {
    setDiff(null);
    setDiffBase(null);
    setDrawerKey(null);
  }, [taskId]);

  const running = view ? ['pending', 'collecting', 'checking'].includes(view.status) : false;
  useEffect(() => {
    if (!running) return undefined;
    const timer = window.setInterval(() => setTick((prev) => prev + 1), 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  /* ---- 演示场景合成：整页预设 + 模块场景 + 单检测项覆盖（仅箱包模板记录） ---- */
  const isDemoTask = isDemoRecord(task);
  const pageState = typeof protoState.page_state === 'string' ? protoState.page_state : 'flow';
  const lastPageState = useRef<string | null>(null);
  const appliedPreset = useRef<string | null>(null);
  const entryApplied = useRef(false);

  useEffect(() => {
    if (!isDemoTask) return;
    // 面板切换预设后写回 URL 的 preset 不应再触发一次入口预设
    appliedPreset.current = pageState;
    if (lastPageState.current === null || lastPageState.current === pageState) {
      lastPageState.current = pageState;
      return;
    }
    lastPageState.current = pageState;
    setProtoDevState(OVERRIDE_RESET_STATE);
  }, [isDemoTask, pageState]);

  // 入口预设：按记录结果或 URL 带出场景；同一挂载内 URL 预设变化时重新套用
  useEffect(() => {
    if (!isDemoTask) return;
    const target = initialPreset ?? 'flow';
    if (entryApplied.current && appliedPreset.current === target) return;
    entryApplied.current = true;
    appliedPreset.current = target;
    setProtoDevState(target === 'flow'
      ? { ...DEMO_RESET_STATE, collect_state: 'flow' }
      : { ...OVERRIDE_RESET_STATE, page_state: target, collect_state: 'flow' });
  }, [isDemoTask, initialPreset]);

  // 非场景演示记录（只可能是采集失败页）不消费场景状态，面板回到「跟随」，避免出现点了没反应的状态
  useEffect(() => {
    if (isDemoTask) return;
    setProtoDevState(DEMO_RESET_STATE);
  }, [isDemoTask]);

  const scene = task && view && snapshot
    ? composeScene({
        enabled: isDemoTask,
        baseSnapshot: snapshot,
        baseItems: view.items,
        baseStatus: view.status,
        pageState,
        moduleStates: protoState,
        itemStates: protoState,
      })
    : null;

  // 采集失败可单独演示，且优先于检测场景
  const statusShown: TaskStatus = protoState.collect_state === 'failed'
    ? 'collect-failed'
    : (scene?.statusShown ?? view?.status ?? 'pending');
  const composedSnapshot = scene?.snapshot ?? snapshot;

  // 采集期间只展示当前卡片 loading，结论条与质检项卡片不展示
  const collectLoading = statusShown === 'pending' || statusShown === 'collecting';
  const itemsShown: ItemView[] = !scene || statusShown === 'collect-failed' || collectLoading ? [] : scene.items;
  const issues = flattenIssues(itemsShown);
  const groups = groupByAnchor(issues);
  const issueCounts = countBySeverity(issues);
  const progress = {
    done: itemsShown.filter((item) => item.status !== 'queued' && item.status !== 'running').length,
    total: ITEM_DEFS.length,
  };
  const issueMapByCode = new Map<ItemCode, { violation: number; suspect: number; fail: number }>();
  issues.forEach((issue) => {
    const entry = issueMapByCode.get(issue.code) ?? { violation: 0, suspect: 0, fail: 0 };
    if (issue.severity === 'violation') entry.violation += 1;
    else if (issue.severity === 'suspect') entry.suspect += 1;
    else entry.fail += 1;
    issueMapByCode.set(issue.code, entry);
  });
  const checking = itemsShown.some((item) => item.status === 'queued' || item.status === 'running');

  let conclusionView: { level: string; text: string };
  if (!view) {
    conclusionView = { level: 'checking', text: '' };
  } else if (statusShown === 'collect-failed' || statusShown === 'canceled') {
    conclusionView = { level: view.conclusion.level, text: view.conclusion.text };
  } else if (collectLoading) {
    conclusionView = { level: 'checking', text: view.conclusion.text };
  } else if (checking) {
    conclusionView = {
      level: 'checking',
      text: `质检进行中，已完成 ${progress.done}/${progress.total} 项`,
    };
  } else {
    const level = issueCounts.violation > 0 ? 'reject' : issueCounts.suspect > 0 ? 'manual' : issueCounts.fail > 0 ? 'partial' : 'pass';
    const text = level === 'pass'
      ? '全部检测通过，未发现问题'
      : '存在违规、疑似违规或检测失败，请查看下方明细';
    conclusionView = { level, text };
  }

  const issueSignature = issues.map(issueDiffKey).join(',');
  useEffect(() => {
    if (!diffBase) return;
    if (statusShown !== 'done' && statusShown !== 'partial-fail') return;
    const current = new Set(issueSignature ? issueSignature.split(',') : []);
    const previous = new Set(diffBase);
    let fixed = 0;
    let remain = 0;
    let added = 0;
    current.forEach((key) => {
      if (previous.has(key)) remain += 1;
      else added += 1;
    });
    previous.forEach((key) => {
      if (!current.has(key)) fixed += 1;
    });
    setDiff({ fixed, remain, added });
    setDiffBase(null);
  }, [diffBase, statusShown, issueSignature]);

  useEffect(() => {
    if (viewMode !== 'items' || !focusCode) return undefined;
    const timer = window.setTimeout(() => {
      document.getElementById(`item-${focusCode}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, 80);
    return () => window.clearTimeout(timer);
  }, [viewMode, focusCode, version]);

  if (!task || !view || !snapshot) {
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

  const handleFeedback = (code: ItemCode, resultKey: string, mode: 'up' | 'down', label?: string) => {
    const item = itemsShown.find((entry) => entry.code === code);
    const current = item?.override?.resultFeedback?.[resultKey]?.mode ?? null;
    if (current === mode) {
      mutate(() => {
        setFeedback(task.id, code, resultKey, null);
        showToast('info', mode === 'up' ? '已取消满意' : '已取消不满意');
      });
      return;
    }
    if (mode === 'up') {
      mutate(() => {
        setFeedback(task.id, code, resultKey, 'up');
        showToast('success', '感谢反馈：已标记满意');
      });
      return;
    }
    const def = ITEM_DEFS.find((entry) => entry.code === code);
    setDialog({ type: 'feedback', code, resultKey, name: label ?? item?.name ?? def?.name ?? '' });
  };

  const feedbackByResult: Record<string, 'up' | 'down' | null> = {};
  itemsShown.forEach((item) => {
    Object.entries(item.override?.resultFeedback ?? {}).forEach(([key, feedback]) => {
      feedbackByResult[key] = feedback.mode;
    });
  });

  const onRecheck = () => {
    setDialog({ type: 'recheck' });
  };

  const onRetryCollect = () => {
    const raw = urlDraft.trim();
    const effective = raw || task.url;
    const result = resolveDhgateInput(effective);
    if (!result.ok || !result.url) {
      setUrlError(result.error ?? '链接格式不正确，请粘贴完整商品链接');
      return;
    }
    mutate(() => {
      if (raw && result.url !== task.url) {
        mutateTask(task.id, (t) => {
          t.url = result.url!;
          if (result.productId) t.productId = result.productId;
        });
      }
      retryCollect(task.id);
      // 采集失败卡可能是标注面板强制展示的，点击后恢复跟随真实任务状态，页面重新进入采集中
      setProtoDevState({ ...DEMO_RESET_STATE, collect_state: 'flow' });
      setUrlError('');
      showToast('success', '已重新发起采集');
    });
  };

  // 就地重新检测在当前记录上完成（会给出变化摘要）；重新采集并检测另建一条新记录
  const onRecheckConfirm = (mode: RecheckMode) => {
    const before = issues.map(issueDiffKey);
    setDialog(null);
    if (mode === 'in-place') {
      mutate(() => {
        recheckInPlace(task.id);
      });
      if (isDemoTask) setProtoDevState({ ...DEMO_RESET_STATE, collect_state: 'flow' });
      setDiff(null);
      setDiffBase(before.length > 0 ? before : null);
      showToast('success', '已在当前记录重新检测，结果将逐项更新');
      return;
    }
    // 重新采集并检测：创建一条新记录，原记录保留不变
    const newId = recheckAsNewRecord(task.id, isDemoTask);
    if (!newId) return;
    setDiff(null);
    setDiffBase(null);
    showToast('success', '已创建新的检测记录，正在重新采集并检测');
    onOpenTask(newId);
  };

  const switchView = (mode: ViewMode, focus?: ItemCode) => {
    setViewMode(mode);
    setDrawerKey(null);
    if (mode === 'items' && focus) setFocusCode(focus);
    const params = new URLSearchParams({ page: 'detail', task: taskId, view: mode });
    if (focus) params.set('focus', focus);
    if (isDemoTask && pageState !== 'flow') params.set('preset', pageState);
    window.location.hash = params.toString();
  };

  const scrollToAnchor = (key: string) => {
    document.getElementById(`anchor-${key}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  };

  const openDrawerGroup = (key: string) => {
    setDrawerKey(key);
    scrollToAnchor(key);
  };

  return (
    <div className={`dcc-detail${drawerKey ? ' has-drawer' : ''}`}>
      <div className="dcc-detail-topbar">
        <div data-annotation-id="dcc-demo-preset">
          <button type="button" className="dcc-btn" onClick={onBack}>← 返回质检记录</button>
        </div>
        <div className="dcc-detail-topbar-actions" data-annotation-id="dcc-recheck-entry">
          {statusShown !== 'collect-failed' && (
            <button type="button" className="dcc-btn" onClick={onRecheck}>重新检测</button>
          )}
        </div>
      </div>

      {statusShown === 'collect-failed' ? (
        <div className="dcc-card dcc-fail-card">
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
                placeholder="粘贴正确的敦煌网商品链接或商品 itemCode"
              />
              {urlError && <div className="dcc-field-error">{urlError}</div>}
            </div>
            <div className="dcc-edit-url-hint">链接填错了？直接在这里改成正确的链接或商品 itemCode（会自动补全）；留空则按原链接重新采集。</div>
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
        <div className="dcc-card dcc-summary-card dcc-summary-card--loading">
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
        <>
          <div data-annotation-id="dcc-conclusion-bar" className={`dcc-conclusion-bar dcc-conclusion-bar--${conclusionView.level}`}>
            <div className="dcc-conclusion-text">
              结论：{conclusionView.text}
              {conclusionView.level === 'checking' && <span className="dcc-spinner dcc-spinner--small" />}
              {diff && (
                <span className="dcc-recheck-diff">
                  本次重新检测：{diff.fixed} 处已修复 · {diff.remain} 处仍存在 · {diff.added} 处新增
                  <button type="button" className="dcc-diff-close" aria-label="关闭摘要" onClick={() => setDiff(null)}>×</button>
                </span>
              )}
            </div>
          </div>

          <div className="dcc-view-bar">
            <div className="dcc-view-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === 'product'}
                className={`dcc-view-tab${viewMode === 'product' ? ' is-active' : ''}`}
                onClick={() => switchView('product')}
              >按商品信息维度查看</button>
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === 'items'}
                className={`dcc-view-tab${viewMode === 'items' ? ' is-active' : ''}`}
                onClick={() => switchView('items')}
              >按检测项维度查看</button>
            </div>
            {checking ? (
              <span className="dcc-view-progress">
                <span className="dcc-spinner dcc-spinner--small" />
                检测中 {progress.done}/{progress.total}
              </span>
            ) : (
              <span className="dcc-view-note">共 {issues.length} 处问题 · {issues.length ? `${groups.length} 个位置` : '未发现问题'}</span>
            )}
          </div>

          {itemsShown.length > 0 && (
            viewMode === 'product' ? (
              <ProductView
                task={task}
                snapshot={composedSnapshot ?? snapshot}
                items={itemsShown}
                issues={issues}
                groups={groups}
                statusShown={statusShown}
                activeKey={drawerKey}
                onOpenGroup={openDrawerGroup}
              />
            ) : (
              <div className="dcc-item-list">
                {itemsShown.map((item) => (
                  <ItemCard
                    key={item.code}
                    view={item}
                    issueCount={issueMapByCode.get(item.code)}
                    focused={focusCode === item.code}
                    resultFeedback={item.override?.resultFeedback}
                    currentAt={itemFinishedAt(task, item.code)}
                    onFeedback={(resultKey, mode, label) => handleFeedback(item.code, resultKey, mode, label)}
                    onRetry={() =>
                      mutate(() => {
                        retryItem(task.id, item.code, {
                          at: itemFinishedAt(task, item.code),
                          status: item.status,
                          outcome: item.outcome,
                        });
                        showToast('success', `已重试「${item.name}」，仅该项重新检测`);
                      })
                    }
                  />
                ))}
              </div>
            )
          )}
        </>
      )}

      {(view.status === 'canceled') && (
        <div className="dcc-card dcc-fail-card">
          <div className="dcc-fail-title">任务已取消</div>
          <div className="dcc-fail-tip">可点击右上角「重新检测」创建新任务。</div>
        </div>
      )}

      <IssueDrawer
        open={drawerKey !== null}
        groups={groups}
        activeKey={drawerKey}
        feedbackByResult={feedbackByResult}
        onClose={() => setDrawerKey(null)}
        onSelectGroup={scrollToAnchor}
        onFeedback={handleFeedback}
      />

      <IssueNav
        issues={issues}
        onLocate={openDrawerGroup}
        hidden={viewMode !== 'product' || collectLoading || statusShown === 'collect-failed' || statusShown === 'canceled' || drawerKey !== null}
      />

      {dialog?.type === 'recheck' && (
        <RecheckDialog
          onCancel={() => setDialog(null)}
          onConfirm={onRecheckConfirm}
        />
      )}

      {dialog?.type === 'feedback' && (
        <FeedbackDialog
          itemName={dialog.name}
          onCancel={() => setDialog(null)}
          onSubmit={(reasons, text) =>
            mutate(() => {
              setFeedback(task.id, dialog.code, dialog.resultKey, 'down', reasons, text);
              setDialog(null);
              showToast('success', '感谢反馈，将用于评估这条检测结果的质量');
            })
          }
        />
      )}
    </div>
  );
}
