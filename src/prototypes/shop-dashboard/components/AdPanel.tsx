import React, { useState } from 'react';
import {
  adChartValue,
  fmtKpiValue,
  formatAdAxis,
  formatAdValue,
  type AdSnapshot,
} from '../ad-report';
import { Tooltip } from './Tooltip';
import { LineChart } from './LineChart';

interface AdPanelProps {
  snapshot: AdSnapshot;
  excludeEnabled: boolean;
  onToggleExclude: (next: boolean) => void;
  onOpenExclusion: () => void;
}

export function AdPanel({ snapshot, excludeEnabled, onToggleExclude, onOpenExclusion }: AdPanelProps) {
  const [metricKey, setMetricKey] = useState('adCost');
  const metric = snapshot.kpis.find((card) => card.key === metricKey) || snapshot.kpis[0];
  const values = snapshot.points.map((point) => adChartValue(point, metric.key));

  return (
    <div className="ss-card ss-ad-card">
      <div className="ss-ad-head">
        <span className="ss-ad-title">广告数据</span>
      </div>
      <div className="ss-ad-filter-row" data-annotation-id="ssd-ad-exclude">
        <span className="ss-ad-head-label">GMV 口径</span>
        <div className="ss-ad-segment">
          <button
            type="button"
            className={`ss-ad-segment-btn${excludeEnabled ? ' is-active' : ''}`}
            onClick={() => onToggleExclude(true)}
          >
            剔除补单
          </button>
          <button
            type="button"
            className={`ss-ad-segment-btn${excludeEnabled ? '' : ' is-active'}`}
            onClick={() => onToggleExclude(false)}
          >
            原始数据
          </button>
        </div>
        <button type="button" className="ss-ad-btn ss-ad-btn--ghost" onClick={onOpenExclusion}>剔除设置</button>
      </div>
      <div className="ss-ad-kpi-grid" data-annotation-id="ssd-ad-kpi">
        {snapshot.kpis.map((card) => (
          <div
            key={card.key}
            className={`ss-ad-kpi${metric.key === card.key ? ' is-active' : ''}`}
            onClick={() => setMetricKey(card.key)}
          >
            <div className="ss-ad-kpi-label">
              {card.label}
              <Tooltip content={card.hint} className="ss-tip-wrap">
                <span className="ss-tip-icon">?</span>
              </Tooltip>
            </div>
            <div className="ss-ad-kpi-value">{fmtKpiValue(card, card.value)}</div>
          </div>
        ))}
      </div>
      <div className="ss-ad-chart" data-annotation-id="ssd-ad-chart">
        <LineChart
          dates={snapshot.points.map((point) => point.date)}
          height={320}
          ariaLabel={`${metric.label}走势`}
          series={[{ key: metric.key, label: metric.label, color: '#ff781f', values, area: true }]}
          formatValue={(value) => formatAdValue(metric.key, value)}
          axisFormat={(value) => formatAdAxis(metric.key, value)}
          xFormat={(date) => date.slice(5).replace('-', '/')}
        />
      </div>
    </div>
  );
}
