import React from 'react';
import type { TaskView } from '../lib/store';
import { IMAGES, TaskStatusTag, copyText, fmtTime } from './ui';

export function TaskTable({
  rows,
  onOpenTask,
  emptyText = '暂无检测记录',
  annotationId,
}: {
  rows: TaskView[];
  onOpenTask: (view: TaskView) => void;
  emptyText?: string;
  annotationId?: string;
}) {
  return (
    <>
      <table className="dcc-table dcc-record-table" {...(annotationId ? { 'data-annotation-id': annotationId } : {})}>
        <thead>
          <tr>
            <th>商品信息</th><th>敦煌链接</th><th>提交时间</th><th>状态</th><th>质检概览</th><th>操作</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((view) => (
            <tr key={view.task.id} className="dcc-row-click" onClick={() => onOpenTask(view)}>
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
              <td data-label="状态">
                <TaskStatusTag status={view.status} />
                {['checking', 'collecting'].includes(view.status) && (
                  <div className="dcc-progress"><i style={{ width: `${Math.round((view.progress.done / view.progress.total) * 100)}%` }} /></div>
                )}
              </td>
              <td data-label="质检概览">
                {(() => {
                  // 统计口径与商品信息视图一致：一张图/一段文字违反多项时按条计数
                  const issueCount = view.issueSummary.violation + view.issueSummary.suspect + view.issueSummary.fail;
                  const finished = view.status === 'done' || view.status === 'partial-fail';
                  if (!finished) return <span className="dcc-muted">-</span>;
                  if (issueCount === 0) return <span className="dcc-overview-text is-pass">全部通过</span>;
                  return (
                    <span className={`dcc-overview-text ${view.issueSummary.violation > 0 ? 'is-reject' : 'is-issue'}`}>
                      共 {issueCount} 处问题
                    </span>
                  );
                })()}
              </td>
              <td data-label="操作" onClick={(event) => event.stopPropagation()}>
                <div className="dcc-row-actions">
                  <button type="button" className="dcc-btn dcc-btn--text" onClick={() => onOpenTask(view)}>查看</button>
                </div>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr className="dcc-empty-row"><td colSpan={6}>{emptyText}</td></tr>
          )}
        </tbody>
      </table>
    </>
  );
}
