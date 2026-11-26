import React, { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import type { PunishmentRecord, PunishmentSource } from '../data/types';
import { MetricHelp } from './MetricHelp';
import { Segmented } from './Segmented';

type StatusFilter = 'all' | 'active' | 'released';
type SourceFilter = 'all' | PunishmentSource;

const STATUS_OPTIONS: Array<{ key: StatusFilter; label: string }> = [
  { key: 'all', label: '全部' },
  { key: 'active', label: '处罚中' },
  { key: 'released', label: '已解除' },
];

const SOURCE_OPTIONS: Array<{ key: SourceFilter; label: string }> = [
  { key: 'all', label: '全部' },
  { key: '平台处罚', label: '平台处罚' },
  { key: '品牌投诉', label: '品牌投诉' },
  { key: '其他第三方投诉', label: '其他第三方投诉' },
];

const FILTER_TIP = '按处罚日期按天统计，包含处罚中与已解除记录；来源分为平台处罚、品牌投诉和其他第三方投诉。';

export function PunishmentDialog({
  records,
  date,
  onClose,
}: {
  records: PunishmentRecord[];
  date: string;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<StatusFilter>('all');
  const [source, setSource] = useState<SourceFilter>('all');

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  const list = useMemo(
    () => records.filter((item) => {
      if (status === 'active' && item.punishStatus !== 1) return false;
      if (status === 'released' && item.punishStatus !== 2) return false;
      if (source !== 'all' && item.source !== source) return false;
      return true;
    }),
    [records, status, source],
  );

  const activeCount = records.filter((item) => item.punishStatus === 1).length;
  const releasedCount = records.length - activeCount;

  return (
    <div className="hd-modal-mask" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="hd-modal hd-punish-dialog" role="dialog" aria-modal="true" aria-label="平台处罚明细">
        <div className="hd-rank-dialog-header">
          <div className="hd-rank-dialog-title-wrap">
            <span className="hd-rank-dialog-title">
              平台处罚
              <MetricHelp tip={FILTER_TIP} />
            </span>
            <span className="hd-rank-dialog-count">统计日期 {date} · 共 {records.length} 条</span>
          </div>
          <div className="hd-rank-dialog-tools">
            <button type="button" className="hd-excl-close" onClick={onClose} aria-label="关闭"><X size={18} /></button>
          </div>
        </div>

        <div className="hd-rank-dialog-tabs hd-punish-filters">
          <span className="hd-punish-filter-label">状态</span>
          <Segmented value={status} options={STATUS_OPTIONS} onChange={setStatus} />
          <span className="hd-punish-filter-label">来源</span>
          <Segmented value={source} options={SOURCE_OPTIONS} onChange={setSource} />
          <span className="hd-punish-filter-summary">处罚中 {activeCount} · 已解除 {releasedCount}</span>
        </div>

        <div className="hd-punish-table">
          <div className="hd-punish-head">
            <span className="hd-punish-col-id">处罚编号</span>
            <span className="hd-punish-col-source">来源</span>
            <span className="hd-punish-col-type">处罚类型</span>
            <span className="hd-punish-col-reason">处罚原因</span>
            <span className="hd-punish-col-date">处罚日期</span>
            <span className="hd-punish-col-date">到期日</span>
            <span className="hd-punish-col-status">状态</span>
          </div>
          {list.length === 0 ? (
            <div className="hd-punish-empty">暂无匹配的处罚记录</div>
          ) : list.map((row) => (
            <div className="hd-punish-row" key={row.punishId}>
              <span className="hd-punish-col-id">{row.punishId}</span>
              <span className="hd-punish-col-source">{row.source}</span>
              <span className="hd-punish-col-type">{row.punishTypeName}</span>
              <span className="hd-punish-col-reason" title={row.punishReason}>{row.punishReason}</span>
              <span className="hd-punish-col-date">{row.createDateStr}</span>
              <span className="hd-punish-col-date">{row.punishEndTimeStr || '-'}</span>
              <span className="hd-punish-col-status">
                <span className={`hd-punish-status ${row.punishStatus === 1 ? 'is-active' : 'is-released'}`}>{row.punishStatusName}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
