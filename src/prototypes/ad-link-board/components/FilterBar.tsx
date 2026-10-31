import React from 'react';
import { Loader2, RefreshCw, RotateCcw } from 'lucide-react';
import { Select } from './ui';
import type { Filters } from '../data/types';
import { STORE_OPTIONS } from '../data/catalog';
import { AD_TO, DATA_FROM, ORDER_TO, REPORT_TO, addDays } from '../data/mock';
import { fmtDateSlash } from '../data/format';

export type RangePreset = '1' | '3' | '7' | '15' | '30' | 'custom';

export const MAX_RANGE_DAYS = 31;

const PRESETS: Array<{ key: RangePreset; label: string; days: number }> = [
  { key: '1', label: '近 1 天', days: 1 },
  { key: '3', label: '近 3 天', days: 3 },
  { key: '7', label: '近 7 天', days: 7 },
  { key: '15', label: '近 15 天', days: 15 },
  { key: '30', label: '近 30 天', days: 30 },
];

export function presetRange(preset: Exclude<RangePreset, 'custom'>): { from: string; to: string } {
  const days = PRESETS.find((item) => item.key === preset)?.days ?? 7;
  return { from: addDays(REPORT_TO, -(days - 1)), to: REPORT_TO };
}

export function rangeDays(from: string, to: string): number {
  if (!from || !to) return 0;
  return Math.round((new Date(`${to}T00:00:00Z`).getTime() - new Date(`${from}T00:00:00Z`).getTime()) / 86400000) + 1;
}

export function validateRange(from: string, to: string): string {
  if (!from || !to) return '请选择完整的起止日期';
  if (to < from) return '结束日期不能早于开始日期';
  if (to > REPORT_TO) return `广告数据截至 ${fmtDateSlash(REPORT_TO)}，报表区间不能超过这一天`;
  if (from < DATA_FROM) return `当前只保留 ${fmtDateSlash(DATA_FROM)} 之后的数据`;
  if (rangeDays(from, to) > MAX_RANGE_DAYS) return `单次查询最长 ${MAX_RANGE_DAYS} 天，请缩短日期范围`;
  return '';
}

interface Props {
  draft: Filters;
  preset: RangePreset;
  error: string;
  syncing: boolean;
  lastSync: string;
  onStoreChange: (value: string) => void;
  onPresetChange: (preset: RangePreset) => void;
  onDateChange: (field: 'from' | 'to', value: string) => void;
  onReset: () => void;
  onSync: () => void;
  excludeEnabled: boolean;
  excludedLabel: string;
  onToggleExclude: (next: boolean) => void;
  onOpenExclusion: () => void;
}

export function FilterBar(props: Props) {
  return (
    <section className="adr-card adr-filter" data-annotation-id="alb-filter">
      <div className="adr-filter__row">
        <div className="adr-field" data-annotation-id="alb-scope">
          <span className="adr-field__label">店铺范围</span>
          <Select
            value={props.draft.storeId === null ? 'all' : String(props.draft.storeId)}
            options={STORE_OPTIONS}
            onChange={props.onStoreChange}
            width={200}
          />
        </div>

        <div className="adr-field adr-field--date" data-annotation-id="alb-range">
          <span className="adr-field__label">时间</span>
          <div className="adr-segment">
            {PRESETS.map((item) => (
              <button
                type="button"
                key={item.key}
                className={`adr-segment__btn${props.preset === item.key ? ' is-active' : ''}`}
                onClick={() => props.onPresetChange(item.key)}
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              className={`adr-segment__btn${props.preset === 'custom' ? ' is-active' : ''}`}
              onClick={() => props.onPresetChange('custom')}
            >
              自定义
            </button>
          </div>
          {props.preset === 'custom' ? (
            <div className="adr-daterange">
              <input
                type="date"
                className="adr-date"
                value={props.draft.from}
                min={DATA_FROM}
                max={REPORT_TO}
                onChange={(event) => props.onDateChange('from', event.target.value)}
              />
              <span className="adr-daterange__sep">至</span>
              <input
                type="date"
                className="adr-date"
                value={props.draft.to}
                min={DATA_FROM}
                max={REPORT_TO}
                onChange={(event) => props.onDateChange('to', event.target.value)}
              />
            </div>
          ) : null}
          {props.error ? <span className="adr-field__error">{props.error}</span> : null}
        </div>

        <div className="adr-field" data-annotation-id="alb-exclude">
          <span className="adr-field__label">GMV 口径</span>
          <div className="adr-segment">
            <button
              type="button"
              className={`adr-segment__btn${props.excludeEnabled ? ' is-active' : ''}`}
              onClick={() => props.onToggleExclude(true)}
            >
              剔除补单
            </button>
            <button
              type="button"
              className={`adr-segment__btn${props.excludeEnabled ? '' : ' is-active'}`}
              onClick={() => props.onToggleExclude(false)}
            >
              原始数据
            </button>
          </div>
          <button type="button" className="adr-btn adr-btn--ghost" onClick={props.onOpenExclusion}>
            剔除设置
          </button>
        </div>

        <button type="button" className="adr-btn" onClick={props.onReset}>
          <RotateCcw size={14} />
          重置
        </button>

        <button
          type="button"
          className="adr-btn adr-btn--sync"
          onClick={props.onSync}
          disabled={props.syncing}
          data-annotation-id="alb-sync"
        >
          {props.syncing ? <Loader2 size={14} className="adr-spin" /> : <RefreshCw size={14} />}
          {props.syncing ? '同步中…' : '同步广告数据'}
        </button>
      </div>

      <div className="adr-filter__hint" data-annotation-id="alb-cutoff">
        <span>
          {props.syncing
            ? '正在从敦煌同步广告数据：按自然月切片 + 分页写入本地库……'
            : `广告数据 T+1，已同步至 ${fmtDateSlash(AD_TO)}；订单与店铺数据已同步至 ${fmtDateSlash(ORDER_TO)}。为保持同区间对比，报表统一截至 ${fmtDateSlash(REPORT_TO)}。${props.excludedLabel}最近同步 ${props.lastSync}`}
        </span>
      </div>
    </section>
  );
}
