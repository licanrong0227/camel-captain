import React from 'react';
import { Loader2, RefreshCw, RotateCcw } from 'lucide-react';
import { Select } from './ui';
import { AD_TYPE_OPTIONS, type Filters } from '../data/types';
import { STORE_OPTIONS } from '../data/catalog';
import { DATA_FROM, DATA_TO, addDays } from '../data/mock';
import { fmtDateSlash } from '../data/format';

export type RangePreset = '7d' | '30d' | 'custom';

export const MAX_RANGE_DAYS = 31;

export function presetRange(preset: Exclude<RangePreset, 'custom'>): { from: string; to: string } {
  const days = preset === '7d' ? 7 : 30;
  return { from: addDays(DATA_TO, -(days - 1)), to: DATA_TO };
}

export function rangeDays(from: string, to: string): number {
  if (!from || !to) return 0;
  return Math.round((new Date(`${to}T00:00:00Z`).getTime() - new Date(`${from}T00:00:00Z`).getTime()) / 86400000) + 1;
}

export function validateRange(from: string, to: string): string {
  if (!from || !to) return '请选择完整的起止日期';
  if (to < from) return '结束日期不能早于开始日期';
  if (to > DATA_TO) return `数据更新时间截至 ${fmtDateSlash(DATA_TO)}，请把结束日期选在此之前`;
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
  onStoreChange: (store: string) => void;
  onAdTypeChange: (adType: Filters['adType']) => void;
  onPresetChange: (preset: RangePreset) => void;
  onDateChange: (field: 'from' | 'to', value: string) => void;
  onReset: () => void;
  onSync: () => void;
}

export function FilterBar(props: Props) {
  return (
    <section className="adr-card adr-filter" data-annotation-id="adr-filter">
      <div className="adr-filter__row">
        <div className="adr-field" data-annotation-id="adr-store">
          <span className="adr-field__label">店铺</span>
          <Select value={props.draft.store} options={STORE_OPTIONS} onChange={props.onStoreChange} width={188} />
        </div>

        <div className="adr-field">
          <span className="adr-field__label">广告类型</span>
          <Select
            value={props.draft.adType}
            options={AD_TYPE_OPTIONS}
            onChange={(value) => props.onAdTypeChange(value as Filters['adType'])}
            width={150}
          />
        </div>

        <div className="adr-field adr-field--date" data-annotation-id="adr-filter-date">
          <span className="adr-field__label">日期</span>
          <div className="adr-segment">
            <button
              type="button"
              className={`adr-segment__btn${props.preset === '7d' ? ' is-active' : ''}`}
              onClick={() => props.onPresetChange('7d')}
            >
              近 7 天
            </button>
            <button
              type="button"
              className={`adr-segment__btn${props.preset === '30d' ? ' is-active' : ''}`}
              onClick={() => props.onPresetChange('30d')}
            >
              近 30 天
            </button>
            <button
              type="button"
              className={`adr-segment__btn${props.preset === 'custom' ? ' is-active' : ''}`}
              onClick={() => props.onPresetChange('custom')}
            >
              自定义
            </button>
          </div>
          <div className="adr-daterange">
            <input
              type="date"
              className="adr-date"
              value={props.draft.from}
              min={DATA_FROM}
              max={DATA_TO}
              onChange={(event) => props.onDateChange('from', event.target.value)}
            />
            <span className="adr-daterange__sep">至</span>
            <input
              type="date"
              className="adr-date"
              value={props.draft.to}
              min={DATA_FROM}
              max={DATA_TO}
              onChange={(event) => props.onDateChange('to', event.target.value)}
            />
          </div>
          {props.error ? <span className="adr-field__error">{props.error}</span> : null}
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
          data-annotation-id="adr-sync"
        >
          {props.syncing ? <Loader2 size={14} className="adr-spin" /> : <RefreshCw size={14} />}
          {props.syncing ? '同步中…' : '同步数据'}
        </button>
      </div>

      <div className="adr-filter__hint" data-annotation-id="adr-data-source">
        <span>
          {props.syncing
            ? '正在从敦煌同步广告数据：按自然月切片 + 分页拉取明细写入本地库……'
            : `数据截至 ${fmtDateSlash(DATA_TO)}（T+1）；广告花费与 GMV 均为美元口径。最近同步 ${props.lastSync}`}
        </span>
      </div>
    </section>
  );
}
