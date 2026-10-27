import React, { useEffect, useState } from 'react';
import { setProtoDevState } from '@axhub/annotation';
import {
  SESSION_TASK_ID,
  buildDhgateUrlFromItemCode,
  computeTaskView,
  isDhgateItemCode,
  loadTasks,
  getTask,
  restartCheckOnRecord,
  resolveDhgateInput,
} from '../lib/store';
import { showToast } from '../components/ui';
import { TaskTable } from '../components/TaskTable';
import { DEMO_RESET_STATE, DEMO_TASK_ID, demoEntryForView, PagePresetValue } from '../lib/demoScenarios';
import { ConfirmDialog } from '../components/Dialogs';

const DEMO_LINKS = {
  valid: 'https://www.dhgate.com/product/mens-slim-fit-wedding-suit/942718556.html',
  other: 'https://www.amazon.com/dp/B0EXAMPLE',
  draft: 'https://www.dhgate.com/product/draft-suit-jacket/942700001.html',
  itemCode: '942718556',
};

const RECENT_LIMIT = 5;

export function LaunchPage({ onOpenTask }: { onOpenTask: (taskId: string, preset?: PagePresetValue) => void }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [pendingDuplicate, setPendingDuplicate] = useState<string | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setTick((prev) => prev + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const tasks = loadTasks()
    .filter((task) => task.id !== SESSION_TASK_ID)
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
    showToast('success', '检测已提交，正在采集并质检（演示环境统一在箱包模板记录上演示）');
    onOpenTask(demo.id);
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
          <button type="button" className="dcc-btn dcc-btn--primary" disabled={!canSubmit} onClick={onCheck}>开始检测</button>
        </div>
        <div className="dcc-launch-tip">提示：支持敦煌网商品详情链接，也可以直接填写商品 itemCode，系统会自动补全为商品链接</div>
        {itemCode ? (
          <div className="dcc-launch-tip dcc-launch-tip--compose">已识别 itemCode {url.trim()}，将自动补全为 {buildDhgateUrlFromItemCode(url)}</div>
        ) : null}
        <div className="dcc-points-tip">
          <div className="dcc-points-title">点数消耗说明</div>
          <ul>
            <li>链接检测：一次性扣除 xx 点，包含商品信息与 xx 张图片的检测</li>
            <li>超出 xx 张图片：每张图片检测额外扣除 xx 点</li>
            <li>发起单项检测：按每次检测实际涉及的图片张数扣除点数</li>
            <li>首次检测失败后重新发起检测：不额外扣除点数</li>
            <li>采集失败或全部检测项检测失败：不扣除点数</li>
          </ul>
        </div>
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
            onOpenTask(id);
          }}
        />
      )}
    </div>
  );
}
