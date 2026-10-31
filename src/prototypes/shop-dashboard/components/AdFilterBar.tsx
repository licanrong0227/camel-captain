import React from 'react';
import { AD_DATA_FROM, AD_PRESETS, AD_REPORT_TO, type AdPreset } from '../ad-report';
import { Select } from './Select';

interface AdFilterBarProps {
  storeId: number | null;
  storeOptions: { value: string; label: string }[];
  groupId: string;
  groupOptions: { value: string; label: string }[];
  onGroupChange: (value: string) => void;
  preset: AdPreset;
  draftFrom: string;
  draftTo: string;
  error: string;
  onStoreChange: (value: string) => void;
  onPresetChange: (preset: AdPreset) => void;
  onDateChange: (field: 'from' | 'to', value: string) => void;
}

export function AdFilterBar(props: AdFilterBarProps) {
  return (
    <div className="ss-ad-query" data-annotation-id="ssd-ad-filters">
      <div className="ss-ad-query-row">
        <div className="ss-ad-field">
          <span className="ss-ad-field-label">店铺分组</span>
          <Select
            width={150}
            value={props.groupId}
            options={props.groupOptions}
            onChange={props.onGroupChange}
          />
        </div>

        <div className="ss-ad-field">
          <span className="ss-ad-field-label">店铺范围</span>
          <Select
            width={200}
            value={props.storeId === null ? 'all' : String(props.storeId)}
            options={props.storeOptions}
            onChange={props.onStoreChange}
          />
        </div>

        <div className="ss-ad-field ss-ad-field--date">
          <span className="ss-ad-field-label">时间</span>
          <div className="ss-ad-segment">
            {AD_PRESETS.map((item) => (
              <button
                type="button"
                key={item.key}
                className={`ss-ad-segment-btn${props.preset === item.key ? ' is-active' : ''}`}
                onClick={() => props.onPresetChange(item.key)}
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              className={`ss-ad-segment-btn${props.preset === 'custom' ? ' is-active' : ''}`}
              onClick={() => props.onPresetChange('custom')}
            >
              自定义
            </button>
          </div>
          {props.preset === 'custom' ? (
            <div className="ss-ad-daterange">
              <input
                type="date"
                className="ss-ad-date"
                value={props.draftFrom}
                min={AD_DATA_FROM}
                max={AD_REPORT_TO}
                onChange={(event) => props.onDateChange('from', event.target.value)}
              />
              <span className="ss-ad-daterange-sep">至</span>
              <input
                type="date"
                className="ss-ad-date"
                value={props.draftTo}
                min={AD_DATA_FROM}
                max={AD_REPORT_TO}
                onChange={(event) => props.onDateChange('to', event.target.value)}
              />
            </div>
          ) : null}
          {props.error ? <span className="ss-ad-field-error">{props.error}</span> : null}
        </div>
      </div>
    </div>
  );
}
