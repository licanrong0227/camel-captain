import React, { useMemo, useState } from 'react';
import { computeTaskView, createTask, findActiveTaskByUrl, loadTasks, validateDhgateUrl } from '../lib/store';
import { IMAGES, TaskStatusTag, copyText, fmtTime, showToast } from '../components/ui';
import { ConfirmDialog } from '../components/Dialogs';

const DEMO_LINKS = {
  valid: 'https://www.dhgate.com/product/mens-slim-fit-wedding-suit/942718556.html',
  other: 'https://www.amazon.com/dp/B0EXAMPLE',
  draft: 'https://www.dhgate.com/product/draft-suit-jacket/942700001.html',
};

export function LaunchPage({ onOpenTask }: { onOpenTask: (taskId: string) => void }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [pendingDuplicate, setPendingDuplicate] = useState<string | null>(null);

  const recent = useMemo(
    () =>
      loadTasks()
        .slice()
        .sort((a, b) => b.submitTime - a.submitTime)
        .slice(0, 5)
        .map((task) => ({ task, view: computeTaskView(task, Date.now()) })),
    [pendingDuplicate],
  );

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

  const onPaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) {
        setUrl(text.trim());
        setError('');
      } else {
        showToast('warning', '剪贴板为空');
      }
    } catch {
      setUrl(DEMO_LINKS.valid);
      setError('');
      showToast('info', '演示环境已填入示例敦煌链接');
    }
  };

  return (
    <div className="dcc-launch">
      <h1 className="dcc-page-title">商品合规检测</h1>
      <div className="dcc-card dcc-launch-card">
        <div className="dcc-form-label">敦煌网商品链接：</div>
        <div className="dcc-launch-input-row">
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
          <button type="button" className="dcc-btn" onClick={onPaste}>粘贴</button>
        </div>
        <div className="dcc-launch-tip">提示：仅支持敦煌网商品详情链接</div>
        {error ? <div className="dcc-field-error">{error}</div> : null}
        <div className="dcc-launch-actions">
          <button type="button" className="dcc-btn dcc-btn--primary" disabled={!canSubmit} onClick={onCheck}>开始检测</button>
          <button
            type="button"
            className="dcc-btn"
            onClick={() => {
              setUrl('');
              setError('');
            }}
          >
            清空
          </button>
          <span className="dcc-demo-links">
            演示链接：
            <button type="button" className="dcc-btn dcc-btn--text" onClick={() => { setUrl(DEMO_LINKS.valid); setError(''); }}>有效商品</button>
            <button type="button" className="dcc-btn dcc-btn--text" onClick={() => { setUrl(DEMO_LINKS.other); setError(''); }}>非敦煌链接</button>
          </span>
        </div>
      </div>

      <div className="dcc-card">
        <div className="dcc-card-title">最近检测</div>
        {recent.length === 0 ? (
          <div className="dcc-empty">暂无检测记录</div>
        ) : (
          <table className="dcc-table">
            <thead>
              <tr>
                <th>商品主图</th><th>商品标题</th><th>链接</th><th>状态</th><th>提交时间</th><th>操作</th>
              </tr>
            </thead>
            <tbody>
              {recent.map(({ task, view }) => (
                <tr key={task.id}>
                  <td data-label="商品主图"><img className="dcc-thumb" src={IMAGES[task.image as keyof typeof IMAGES]} alt="" /></td>
                  <td data-label="商品标题" className="dcc-td-title">{task.title}</td>
                  <td data-label="链接">
                    <a className="dcc-link-clip" href={task.url} target="_blank" rel="noopener noreferrer" title={task.url}>{task.url}</a>
                    <button type="button" className="dcc-btn dcc-btn--text" onClick={() => copyText(task.url, '链接已复制')}>复制</button>
                  </td>
                  <td data-label="状态"><TaskStatusTag status={view.status} mini /></td>
                  <td data-label="提交时间">{fmtTime(task.submitTime)}</td>
                  <td data-label="操作"><button type="button" className="dcc-btn dcc-btn--text" onClick={() => onOpenTask(task.id)}>查看</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
