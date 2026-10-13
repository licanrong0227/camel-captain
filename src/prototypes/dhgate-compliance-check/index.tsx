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
import { loadTasks } from './lib/store';
import { LaunchPage } from './pages/LaunchPage';
import { RecordsPage } from './pages/RecordsPage';
import { DetailPage } from './pages/DetailPage';
import { RulesPage } from './pages/RulesPage';
import { ToastHost } from './components/ui';

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

  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const rawTaskId = params.get('task') ?? '';
  let taskId = rawTaskId;
  if (page === 'detail') {
    const tasks = loadTasks();
    if (!taskId || !tasks.some((task) => task.id === taskId)) {
      taskId = tasks.slice().sort((a, b) => b.submitTime - a.submitTime)[0]?.id ?? '';
    }
  }
  const ruleAnchor = (params.get('item') ?? undefined) as ItemCode | undefined;

  const goTask = (id: string) => {
    window.location.hash = `page=detail&task=${id}`;
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
          <DetailPage key={taskId} taskId={taskId} onBack={() => { window.location.hash = 'page=records'; }} onOpenTask={goTask} />
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
