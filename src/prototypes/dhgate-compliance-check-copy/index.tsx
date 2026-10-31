/**
 * @name 敦煌网商品合规检测
 */
import React, { useEffect, useMemo, useState } from 'react';
import './style.css';
import { AnnotationViewer } from '@axhub/annotation';
import type {
  AnnotationDirectoryRouteNode,
  AnnotationSourceDocument,
  AnnotationViewerOptions,
} from '@axhub/annotation';
import annotationSourceJson from './annotation-source.json';
import { useHashPage, defineHashPageRoute } from '../../common/useHashPage';
import { ItemCode } from './lib/scenarios';
import { SESSION_TASK_ID, computeTaskView, getTask, loadTasks } from './lib/store';
import { DEMO_TASK_ID, PagePresetValue, demoEntryForView, isDemoRecord } from './lib/demoScenarios';
import { LaunchPage } from './pages/LaunchPage';
import { RecordsPage } from './pages/RecordsPage';
import { DetailPage } from './pages/DetailPage';
import { RulesPage } from './pages/RulesPage';
import { ToastHost } from './components/ui';

const PRESET_VALUES: PagePresetValue[] = ['flow', 'pass', 'multi', 'mixed', 'partial', 'checking'];

const ROUTE = defineHashPageRoute(
  [
    { id: 'launch', title: '发起检测' },
    { id: 'records', title: '质检记录' },
    { id: 'detail', title: '质检详情' },
    { id: 'rules', title: '规则说明' },
  ],
  { defaultPageId: 'launch' },
);


export default function DhgateComplianceCheck() {
  const { page, setPage } = useHashPage(ROUTE);
  const [hash, setHash] = useState(() => window.location.hash);

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // page 与 hash 两个 state 由不同监听更新，可能不同帧；参数一律以真实 hash 为准，避免详情页挂载时拿不到预设
  const params = new URLSearchParams((window.location.hash || hash).replace(/^#/, ''));
  const rawTaskId = params.get('task') ?? '';
  let taskId = rawTaskId;
  if (page === 'detail' && !taskId) {
    // 只有未带任务 id 时才落到最近一条记录；明确指定但已不存在的任务显示未找到
    taskId = loadTasks()
      .filter((task) => task.id !== SESSION_TASK_ID)
      .sort((a, b) => b.submitTime - a.submitTime)[0]?.id ?? '';
  }
  // 详情页统一：除采集失败记录外，其他记录都落到箱包场景演示页，并按该条记录的结果带出演示场景
  let initialPreset: PagePresetValue | undefined = PRESET_VALUES.includes(params.get('preset') as PagePresetValue)
    ? (params.get('preset') as PagePresetValue)
    : undefined;
  const requestedTask = taskId ? getTask(taskId) : undefined;
  if (requestedTask && !isDemoRecord(requestedTask)) {
    const requestedView = computeTaskView(requestedTask, Date.now());
    // 采集失败及由它重新采集的记录保留自己的详情页，不归一化到箱包演示记录
    if (requestedView.status !== 'collect-failed' && !requestedTask.collectRetryAt) {
      const entry = demoEntryForView(requestedView);
      taskId = entry.taskId;
      if (!initialPreset) initialPreset = entry.preset;
    }
  }

  const ruleAnchor = (params.get('item') ?? undefined) as ItemCode | undefined;
  const focusParam = (params.get('focus') ?? undefined) as ItemCode | undefined;
  const liveParam = params.get('live') === '1';

  // 归一后的任务和 URL 不一致时改写 hash，避免地址栏记的是另一条记录、页面却展示箱包演示页
  const remapped = page === 'detail' && Boolean(rawTaskId || taskId) && taskId !== rawTaskId;
  useEffect(() => {
    if (!remapped || !taskId) return;
    const next = new URLSearchParams({ page: 'detail', task: taskId });
    if (focusParam) next.set('focus', focusParam);
    if (liveParam) next.set('live', '1');
    if (initialPreset) next.set('preset', initialPreset);
    window.location.hash = next.toString();
  }, [remapped, taskId, focusParam, initialPreset, liveParam]);

  const goTask = (id: string, preset?: PagePresetValue, live?: boolean) => {
    window.location.hash = `page=detail&task=${id}${preset ? `&preset=${preset}` : ''}${live ? '&live=1' : ''}`;
  };

  const options = useMemo<AnnotationViewerOptions>(() => ({
    showToolbar: true,
    emptyWhenNoData: false,
    toolbarEdge: 'right',
    currentPageId: page,
    onDirectoryRoute: (node: AnnotationDirectoryRouteNode) => {
      if (typeof node.route === 'string') setPage(node.route);
    },
  }), [page, setPage]);

  return (
    <div className="dcc-page">
      <div className="dcc-subnav">
        <span className="dcc-crumb">合规检测</span>
        <div className="dcc-tabs">
          {([
            ['launch', '发起检测'],
            ['records', '质检记录'],
            ['rules', '规则说明'],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`dcc-tab${page === id || (page === 'detail' && id === 'records') ? ' is-active' : ''}`}
              onClick={() => {
                window.location.hash = `page=${id}`;
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <main className="dcc-main">
        {page === 'launch' && <LaunchPage onOpenTask={goTask} />}
        {page === 'records' && <RecordsPage onOpenTask={goTask} />}
        {page === 'detail' && (taskId ? (
          <DetailPage key={taskId} taskId={taskId} initialFocus={focusParam} initialPreset={initialPreset} initialLive={liveParam} onBack={() => { window.location.hash = 'page=records'; }} onOpenTask={goTask} />
        ) : (
          <div className="dcc-card">
            <div className="dcc-empty">
              暂无检测任务，请先发起检测。
              <button type="button" className="dcc-btn dcc-btn--text" onClick={() => { window.location.hash = 'page=launch'; }}>前往发起检测</button>
            </div>
          </div>
        ))}
        {page === 'rules' && <RulesPage anchor={ruleAnchor} />}
      </main>
      <ToastHost />
      <AnnotationViewer
        source={annotationSourceJson as unknown as AnnotationSourceDocument}
        options={options}
      />
    </div>
  );
}
