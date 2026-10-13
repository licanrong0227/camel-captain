import React, { useEffect, useMemo, useState } from 'react';
import { cancelTask, computeTaskView, loadTasks } from '../lib/store';
import { IMAGES, TaskStatusTag, copyText, fmtTime, showToast } from '../components/ui';
import { ConfirmDialog } from '../components/Dialogs';
import { ItemCode } from '../lib/scenarios';

const STATUS_OPTIONS = [
  { value: 'all', label: '全部' },
  { value: 'checking', label: '检测中' },
  { value: 'done', label: '检测完成' },
  { value: 'partial-fail', label: '部分失败' },
  { value: 'collect-failed', label: '采集失败' },
  { value: 'canceled', label: '已取消' },
];

const TIME_OPTIONS = [
  { value: 'all', label: '全部时间' },
  { value: 'today', label: '今天' },
  { value: '7d', label: '最近7天' },
  { value: '30d', label: '最近30天' },
];

const ITEM_OPTIONS: { value: 'all' | ItemCode; label: string }[] = [
  { value: 'all', label: '全部质检项' },
  { value: 'material', label: '材质' },
  { value: 'size', label: '尺码' },
  { value: 'ipr', label: '知识产权' },
  { value: 'category', label: '类目' },
  { value: 'price', label: '价格' },
  { value: 'legal', label: '违法违规' },
];

const RESULT_OPTIONS = [
  { value: 'all', label: '全部结果' },
  { value: 'hit', label: '有违规' },
  { value: 'suspect', label: '有疑似' },
  { value: 'pass', label: '无违规' },
];

const PAGE_SIZE = 6;

export function RecordsPage({ onOpenTask }: { onOpenTask: (taskId: string) => void }) {
  const [status, setStatus] = useState('all');
  const [time, setTime] = useState('all');
  const [itemCode, setItemCode] = useState('all');
  const [result, setResult] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setTick((prev) => prev + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const views = (() => {
    const now = Date.now();
    return loadTasks()
      .slice()
      .sort((a, b) => b.submitTime - a.submitTime)
      .map((task) => computeTaskView(task, now));
  })();

  const filtered = views.filter((view) => {
    if (status !== 'all') {
      if (status === 'checking' && !['pending', 'collecting', 'checking'].includes(view.status)) return false;
      if (status !== 'checking' && view.status !== status) return false;
    }
    const age = Date.now() - view.task.submitTime;
    if (time === 'today' && age > 24 * 3600_000) return false;
    if (time === '7d' && age > 7 * 24 * 3600_000) return false;
    if (time === '30d' && age > 30 * 24 * 3600_000) return false;
    if (itemCode !== 'all') {
      const item = view.items.find((entry) => entry.code === itemCode);
      if (!item || !['violation', 'suspect', 'manual', 'fail'].includes(item.status)) return false;
    }
    if (result === 'hit' && view.summary.hit === 0) return false;
    if (result === 'suspect' && view.summary.suspect === 0) return false;
    if (result === 'pass' && (view.summary.hit > 0 || view.summary.suspect > 0)) return false;
    if (search.trim()) {
      const key = search.trim().toLowerCase();
      if (!view.task.title.toLowerCase().includes(key) && !view.task.url.toLowerCase().includes(key)) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const rows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);


  return (
    <div className="dcc-records">
      <h1 className="dcc-page-title">质检记录</h1>
      <div className="dcc-card">
        <div className="dcc-filter-bar">
          <Select label="状态" value={status} onChange={setStatus} options={STATUS_OPTIONS} />
          <Select label="时间" value={time} onChange={setTime} options={TIME_OPTIONS} />
          <Select label="质检项" value={itemCode} onChange={setItemCode} options={ITEM_OPTIONS} />
          <Select label="结果" value={result} onChange={setResult} options={RESULT_OPTIONS} />
          <div className="dcc-filter-search">
            <input
              className="dcc-input"
              placeholder="搜索商品标题 / 链接"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        <table className="dcc-table dcc-record-table">
          <thead>
            <tr>
              <th>商品信息</th><th>敦煌链接</th><th>提交时间</th><th>任务状态</th><th>质检概览</th><th>操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((view) => (
              <tr key={view.task.id} className="dcc-row-click" onClick={() => onOpenTask(view.task.id)}>
                <td data-label="商品信息">
                  <div className="dcc-product-cell">
                    <img className="dcc-thumb" src={IMAGES[view.task.image as keyof typeof IMAGES]} alt="" />
                    <div>
                      <div className="dcc-product-title">{view.task.title}</div>
                      <div className="dcc-product-meta">{view.task.category} ｜ SKU {view.task.skuCount}</div>
                    </div>
                  </div>
                </td>
                <td data-label="敦煌链接">
                  <span className="dcc-link-clip" title={view.task.url}>{view.task.url}</span>
                  <button type="button" className="dcc-btn dcc-btn--text" onClick={(event) => { event.stopPropagation(); copyText(view.task.url, '链接已复制'); }}>复制</button>
                </td>
                <td data-label="提交时间">{fmtTime(view.task.submitTime)}</td>
                <td data-label="任务状态">
                  <TaskStatusTag status={view.status} />
                  {['checking', 'collecting'].includes(view.status) && (
                    <div className="dcc-progress"><i style={{ width: `${Math.round((view.progress.done / view.progress.total) * 100)}%` }} /></div>
                  )}
                </td>
                <td data-label="质检概览">
                  {view.items.length === 0 ? <span className="dcc-muted">—</span> : (
                    <span className="dcc-overview">
                      <b className="is-hit">命中{view.summary.hit}</b>
                      <b className="is-pass">通过{view.summary.pass}</b>
                      <b className="is-suspect">疑似{view.summary.suspect}</b>
                      {view.summary.fail > 0 && <b className="is-fail">失败{view.summary.fail}</b>}
                    </span>
                  )}
                </td>
                <td data-label="操作" onClick={(event) => event.stopPropagation()}>
                  <div className="dcc-row-actions">
                    <button type="button" className="dcc-btn dcc-btn--text" onClick={() => onOpenTask(view.task.id)}>查看</button>
                    {['pending', 'collecting', 'checking'].includes(view.status) && (
                      <button type="button" className="dcc-btn dcc-btn--text is-danger" onClick={() => setCancelId(view.task.id)}>取消</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr className="dcc-empty-row"><td colSpan={6}>暂无符合条件的检测记录</td></tr>
            )}
          </tbody>
        </table>

        <div className="dcc-pager">
          <span className="dcc-muted">共 {filtered.length} 条</span>
          <button type="button" className="dcc-pager-btn" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}>‹</button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((num) => (
            <button key={num} type="button" className={`dcc-pager-btn${num === safePage ? ' is-active' : ''}`} onClick={() => setPage(num)}>{num}</button>
          ))}
          <button type="button" className="dcc-pager-btn" disabled={safePage >= totalPages} onClick={() => setPage(safePage + 1)}>›</button>
        </div>
      </div>

      {cancelId && (
        <ConfirmDialog
          title="取消检测任务"
          description="取消后任务将不再继续检测，已产生的结果仍可查看。确认取消该任务？"
          okText="确认取消"
          danger
          onCancel={() => setCancelId(null)}
          onConfirm={() => {
            cancelTask(cancelId);
            setCancelId(null);
            showToast('success', '任务已取消');
          }}
        />
      )}
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="dcc-filter-item">
      <span className="dcc-filter-label">{label}：</span>
      <select className="dcc-select" value={value} onChange={(event) => { onChange(event.target.value); }}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}
