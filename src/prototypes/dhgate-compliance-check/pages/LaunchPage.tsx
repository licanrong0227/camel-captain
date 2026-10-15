import React, { useEffect, useState } from 'react';
import { computeTaskView, createTask, findActiveTaskByUrl, loadTasks, validateDhgateUrl } from '../lib/store';
import { showToast } from '../components/ui';
import { TaskTable } from '../components/TaskTable';
import { ConfirmDialog } from '../components/Dialogs';

const DEMO_LINKS = {
  valid: 'https://www.dhgate.com/product/mens-slim-fit-wedding-suit/942718556.html',
  other: 'https://www.amazon.com/dp/B0EXAMPLE',
  draft: 'https://www.dhgate.com/product/draft-suit-jacket/942700001.html',
};

const RECENT_LIMIT = 5;

export function LaunchPage({ onOpenTask }: { onOpenTask: (taskId: string) => void }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [pendingDuplicate, setPendingDuplicate] = useState<string | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setTick((prev) => prev + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const tasks = loadTasks()
    .slice()
    .sort((a, b) => b.submitTime - a.submitTime);
  const total = tasks.length;
  const recent = tasks.slice(0, RECENT_LIMIT).map((task) => computeTaskView(task, Date.now()));

  const canSubmit = url.trim().length > 0 && !error;

  const onCheck = () => {
    const result = validateDhgateUrl(url);
    if (!result.ok) {
      setError(result.error ?? '链接校验失败');
      return;
    }
    const active = findActiveTaskByUrl(url.trim(), Date.now());
    if (active) {
      setPendingDuplicate(active.id);
      return;
    }
    const task = createTask(url.trim(), result.productId!);
    showToast('success', '检测已提交，正在后台采集并质检');
    onOpenTask(task.id);
  };

  return (
    <div className="dcc-launch">
      <h1 className="dcc-page-title">商品合规检测</h1>
      <div data-annotation-id="dcc-launch-card" className="dcc-card dcc-launch-card">
        <div className="dcc-form-label">敦煌网商品链接：</div>
        <div className="dcc-launch-input-row">
          <div className="dcc-input-wrapper">
            <input
              className={`dcc-input${error ? ' is-error' : ''}`}
              placeholder="请输入敦煌网商品链接，如 https://www.dhgate.com/product/.../942718556.html"
              value={url}
              onChange={(event) => {
                setUrl(event.target.value);
                setError('');
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && canSubmit) onCheck();
              }}
            />
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
          <button type="button" className="dcc-btn dcc-btn--primary" disabled={!canSubmit} onClick={onCheck}>开始检测</button>
        </div>
        <div className="dcc-launch-tip">提示：仅支持敦煌网商品详情链接</div>
        {error ? <div className="dcc-field-error">{error}</div> : null}
        <div className="dcc-launch-actions">
          <span className="dcc-demo-links">
            演示链接：
            <button type="button" className="dcc-btn dcc-btn--text" onClick={() => { setUrl(DEMO_LINKS.valid); setError(''); }}>有效商品</button>
            <button type="button" className="dcc-btn dcc-btn--text" onClick={() => { setUrl(DEMO_LINKS.other); setError(''); }}>非敦煌链接</button>
          </span>
        </div>
      </div>

      <div data-annotation-id="dcc-recent-card" className="dcc-card">
        <div className="dcc-card-header">
          <div className="dcc-card-title">最近检测</div>
          {total > RECENT_LIMIT ? (
            <button type="button" className="dcc-btn dcc-btn--text" onClick={() => { window.location.hash = 'page=records'; }}>查看更多&gt;&gt;</button>
          ) : null}
        </div>
        <TaskTable rows={recent} onOpenTask={onOpenTask} />
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
            onOpenTask(id);
          }}
        />
      )}
    </div>
  );
}
