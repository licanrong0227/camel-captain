import React, { useEffect, useState } from 'react';
import { setProtoDevState, useProtoDevState } from '@axhub/annotation';
import {
  SESSION_TASK_ID,
  buildDhgateUrlFromItemCode,
  buildTaskView,
  computeTaskView,
  isDhgateItemCode,
  loadTasks,
  getTask,
  mutateTask,
  restartCheckOnRecord,
  resolveDhgateInput,
} from '../lib/store';
import { showToast } from '../components/ui';
import { TaskTable } from '../components/TaskTable';
import { TaskSummaryCard } from '../components/TaskSummaryCard';
import {
  DEMO_RESET_STATE,
  DEMO_TASK_ID,
  composeScene,
  demoEntryForView,
  PagePresetValue,
} from '../lib/demoScenarios';
import { getProductSnapshot } from '../lib/product';
import { ITEM_DEFS } from '../lib/scenarios';
import { ConfirmDialog } from '../components/Dialogs';

const DEMO_LINKS = {
  valid: 'https://www.dhgate.com/product/mens-slim-fit-wedding-suit/942718556.html',
  other: 'https://www.amazon.com/dp/B0EXAMPLE',
  draft: 'https://www.dhgate.com/product/draft-suit-jacket/942700001.html',
  itemCode: '942718556',
};

type SummaryDemoState = PagePresetValue | 'collect-failed';

const RECENT_LIMIT = 5;
const SUMMARY_DEMO_VALUES: SummaryDemoState[] = ['flow', 'pass', 'multi', 'mixed', 'collect-failed'];

export function LaunchPage({ onOpenTask }: { onOpenTask: (taskId: string, preset?: PagePresetValue, live?: boolean) => void }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [pendingDuplicate, setPendingDuplicate] = useState<string | null>(null);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setTick((prev) => prev + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const activeTask = activeTaskId ? getTask(activeTaskId) : undefined;
  const activeView = activeTask ? computeTaskView(activeTask, Date.now()) : null;
  const protoState = useProtoDevState<Record<string, unknown>>();
  const rawSummaryState = typeof protoState.launch_summary_state === 'string' ? protoState.launch_summary_state : 'mixed';
  const summaryState: SummaryDemoState = SUMMARY_DEMO_VALUES.includes(rawSummaryState as SummaryDemoState)
    ? (rawSummaryState as SummaryDemoState)
    : 'mixed';
  const summaryItems = activeView?.items ?? [];
  const demoAllRevealed = summaryItems.length > 0
    && summaryItems.every((item) => !['queued', 'running'].includes(item.status));
  const summaryDemoReady = summaryState !== 'flow'
    && summaryState !== 'collect-failed'
    && demoAllRevealed;

  let summaryView = activeView;
  const canShowDemoResult = summaryState !== 'flow'
    && summaryState !== 'collect-failed'
    && activeView
    && !['pending', 'collecting', 'collect-failed', 'canceled'].includes(activeView.status)
    && summaryItems.length > 0;
  if (activeTask && activeView && canShowDemoResult) {
    const scene = composeScene({
      enabled: true,
      baseSnapshot: getProductSnapshot(activeTask),
      baseItems: activeView.items,
      baseStatus: activeView.status,
      pageState: summaryState,
      moduleStates: {},
      itemStates: {},
    });
    const demoByCode = new Map(scene.items.map((item) => [item.code, item]));
    // 按真实完成顺序逐项揭晓演示结果：已完成的项用演示场景结果，未完成的保持排队/检测中
    const progressiveItems = summaryItems.map((real) => {
      const revealed = !['queued', 'running'].includes(real.status);
      return revealed ? (demoByCode.get(real.code) ?? real) : real;
    });
    summaryView = buildTaskView(activeTask, demoAllRevealed ? scene.statusShown : 'checking', progressiveItems);
  }

  if (activeTask && activeView && summaryState === 'collect-failed') {
    summaryView = {
      ...activeView,
      status: 'collect-failed',
      items: [],
      progress: { done: 0, total: ITEM_DEFS.length },
      summary: { hit: 0, pass: 0, suspect: 0, notice: 0, fail: 0 },
      issueSummary: { violation: 0, suspect: 0, notice: 0, fail: 0 },
      involvedItems: 0,
      conclusion: {
        level: 'failed',
        text: `采集失败：${activeTask.collectFailedReason ?? '未获取到商品数据，请检查链接或稍后重试。'}`,
        hitCount: 0,
      },
    };
  }


  const scrollToSummary = () => {
    window.setTimeout(() => {
      document.getElementById('dcc-launch-summary')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, 60);
  };

  const retryCollectFromSummary = (raw: string): string | null => {
    if (!activeTask) return '未找到检测任务';
    const result = resolveDhgateInput(raw.trim() || activeTask.url);
    if (!result.ok || !result.url) return result.error ?? '链接格式不正确，请粘贴完整商品链接';
    mutateTask(activeTask.id, (task) => {
      if (result.url !== task.url) {
        task.url = result.url!;
        if (result.productId) task.productId = result.productId;
      }
    });
    restartCheckOnRecord(activeTask.id);
    const nextState = summaryState === 'collect-failed' ? 'mixed' : summaryState;
    setProtoDevState({ ...DEMO_RESET_STATE, launch_summary_state: nextState });
    showToast('success', '已重新发起采集');
    return null;
  };

  const tasks = loadTasks()
    .filter((task) => task.id !== SESSION_TASK_ID && task.id !== activeTaskId)
    .sort((a, b) => b.submitTime - a.submitTime);
  const total = tasks.length;
  const recent = tasks.slice(0, RECENT_LIMIT).map((task) => computeTaskView(task, Date.now()));

  const canSubmit = url.trim().length > 0 && !error;
  const itemCode = isDhgateItemCode(url);

  const onPaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) {
        showToast('warning', '剪贴板里没有内容');
        return;
      }
      setUrl(text.trim());
      setError('');
    } catch {
      showToast('warning', '无法读取剪贴板，请在输入框内按 Ctrl+V 粘贴');
    }
  };

  const onCheck = () => {
    const result = resolveDhgateInput(url);
    if (!result.ok || !result.url) {
      setError(result.error ?? '链接校验失败');
      return;
    }
    const demo = getTask(DEMO_TASK_ID);
    if (!demo) return;
    // 原型只有一个详情页：任何商品的检测都在箱包模板记录上播放采集与质检过程
    if (['pending', 'collecting', 'checking'].includes(computeTaskView(demo, Date.now()).status)) {
      setPendingDuplicate(demo.id);
      return;
    }
    restartCheckOnRecord(demo.id);
    setProtoDevState(DEMO_RESET_STATE);
    setActiveTaskId(demo.id);
    scrollToSummary();
  };

  return (
    <div className="dcc-launch">
      <h1 className="dcc-page-title">商品合规检测</h1>
      <div data-annotation-id="dcc-launch-card" className="dcc-card dcc-launch-card">
        <div className="dcc-form-label">敦煌网商品链接 / itemCode：</div>
        <div className="dcc-launch-input-row">
          <div className="dcc-input-wrapper">
            <input
              className={`dcc-input${error ? ' is-error' : ''}`}
              placeholder="请输入敦煌网商品链接或商品 itemCode，如 942718556"
              value={url}
              onChange={(event) => {
                setUrl(event.target.value);
                setError('');
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && canSubmit) onCheck();
              }}
            />
            <button type="button" className="dcc-input-paste" onClick={onPaste}>粘贴</button>
            {url.length > 0 ? (
              <button
                type="button"
                className="dcc-input-clear"
                aria-label="清空"
                onClick={() => {
                  setUrl('');
                  setError('');
                }}
              >
                ×
              </button>
            ) : null}
          </div>
          <div className="dcc-launch-submit-wrap">
            <button type="button" className="dcc-btn dcc-btn--primary dcc-launch-submit" disabled={!canSubmit} onClick={onCheck}>开始检测</button>
            <span className="dcc-points-help" data-annotation-id="dcc-points-help">
              <button type="button" className="dcc-points-help-btn" aria-label="查看点数消耗说明">?</button>
              <span className="dcc-points-tip" role="tooltip">
                <span className="dcc-points-title">点数消耗说明</span>
                <span className="dcc-points-list">
                  <span>链接检测：一次性扣除 xx 点，包含商品信息与 xx 张图片的检测</span>
                  <span>超出 xx 张图片：每张图片检测额外扣除 xx 点</span>
                  <span>发起单项检测：按每次检测实际涉及的图片张数扣除点数</span>
                  <span>首次检测失败后重新发起检测：不额外扣除点数</span>
                  <span>采集失败或全部检测项检测失败：不扣除点数</span>
                </span>
              </span>
            </span>
          </div>
        </div>
        <div className="dcc-launch-tip">提示：支持敦煌网商品详情链接，也可以直接填写商品 itemCode，系统会自动补全为商品链接</div>
        {itemCode ? (
          <div className="dcc-launch-tip dcc-launch-tip--compose">已识别 itemCode {url.trim()}，将自动补全为 {buildDhgateUrlFromItemCode(url)}</div>
        ) : null}
        {error ? <div className="dcc-field-error">{error}</div> : null}
        <div className="dcc-launch-actions">
          <span className="dcc-demo-links">
            演示链接：
            <button type="button" className="dcc-btn dcc-btn--text" onClick={() => { setUrl(DEMO_LINKS.valid); setError(''); }}>有效商品</button>
            <button type="button" className="dcc-btn dcc-btn--text" onClick={() => { setUrl(DEMO_LINKS.itemCode); setError(''); }}>仅 itemCode</button>
            <button type="button" className="dcc-btn dcc-btn--text" onClick={() => { setUrl(DEMO_LINKS.other); setError(''); }}>非敦煌链接</button>
          </span>
        </div>
      </div>

      {activeTaskId && summaryView && (
        <TaskSummaryCard
          view={summaryView}
          showDetail={summaryState !== 'collect-failed'}
          onRetryCollect={retryCollectFromSummary}
          onOpen={(mode) => {
            const preset = mode === 'progress'
              ? (summaryState !== 'flow' && summaryState !== 'collect-failed' ? (summaryState as PagePresetValue) : undefined)
              : (summaryDemoReady ? (summaryState as PagePresetValue) : undefined);
            onOpenTask(activeTaskId, preset, mode === 'progress' && preset !== undefined);
          }}
        />
      )}

      <div data-annotation-id="dcc-recent-card" className="dcc-card">
        <div className="dcc-card-header">
          <div className="dcc-card-title">最近检测</div>
          {total > RECENT_LIMIT ? (
            <button type="button" className="dcc-btn dcc-btn--text" onClick={() => { window.location.hash = 'page=records'; }}>查看更多&gt;&gt;</button>
          ) : null}
        </div>
        <TaskTable rows={recent} onOpenTask={(view) => { const entry = demoEntryForView(view); onOpenTask(entry.taskId, entry.preset); }} />
      </div>

      {pendingDuplicate && (
        <ConfirmDialog
          title="重复检测提示"
          description="该商品正在检测中，是否查看？"
          okText="查看"
          cancelText="取消"
          onCancel={() => setPendingDuplicate(null)}
          onConfirm={() => {
            const id = pendingDuplicate;
            setPendingDuplicate(null);
            setActiveTaskId(id);
            scrollToSummary();
          }}
        />
      )}
    </div>
  );
}
