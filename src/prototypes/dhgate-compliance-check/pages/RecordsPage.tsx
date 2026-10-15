import React, { useEffect, useState } from 'react';
import { computeTaskView, loadTasks } from '../lib/store';
import { TaskTable } from '../components/TaskTable';

const STATUS_OPTIONS = [
  { value: 'all', label: '全部' },
  { value: 'checking', label: '检测中' },
  { value: 'done', label: '检测完成' },
  { value: 'partial-fail', label: '部分失败' },
  { value: 'collect-failed', label: '采集失败' },
];

const TIME_OPTIONS = [
  { value: 'all', label: '全部时间' },
  { value: 'today', label: '今天' },
  { value: '7d', label: '最近7天' },
  { value: '30d', label: '最近30天' },
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
  const [result, setResult] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
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
        <div className="dcc-filter-bar" data-annotation-id="dcc-records-filter">
          <Select label="状态" value={status} onChange={setStatus} options={STATUS_OPTIONS} />
          <Select label="时间" value={time} onChange={setTime} options={TIME_OPTIONS} />
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

        <TaskTable
          rows={rows}
          onOpenTask={onOpenTask}
          emptyText="暂无符合条件的检测记录"
          annotationId="dcc-records-table"
        />

        <div className="dcc-pager" data-annotation-id="dcc-records-pager">
          <span className="dcc-muted">共 {filtered.length} 条</span>
          <button type="button" className="dcc-pager-btn" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}>‹</button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((num) => (
            <button key={num} type="button" className={`dcc-pager-btn${num === safePage ? ' is-active' : ''}`} onClick={() => setPage(num)}>{num}</button>
          ))}
          <button type="button" className="dcc-pager-btn" disabled={safePage >= totalPages} onClick={() => setPage(safePage + 1)}>›</button>
        </div>
      </div>
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
