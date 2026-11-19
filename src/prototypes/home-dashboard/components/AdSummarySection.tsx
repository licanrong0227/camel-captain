import React, { useMemo } from 'react';
import {
  accOfProd,
  buildAdKpis,
  buildAdTrend,
  buildStoreSnapshot,
  filterProd,
  finalize,
  previousRange,
} from '../data/aggregate';
import { AD_KPI_TREND, AD_TREND_LABELS, adKpiText, adTrendAxisFormat, adTrendFormat, type AdTrendView } from '../data/adTrend';
import { getDataset } from '../data/generate';
import type { ExclusionConfig } from '../data/types';
import { Chart } from './Chart';
import { Tooltip } from './Tooltip';

export function AdSummarySection({
  storeIds,
  from,
  to,
  exclusionEnabled,
  configs,
  trendMetric,
  onTrendMetricChange,
  visibleKpis,
}: {
  storeIds: number[];
  from: string;
  to: string;
  exclusionEnabled: boolean;
  configs: ExclusionConfig[];
  trendMetric: AdTrendView;
  onTrendMetricChange: (next: AdTrendView) => void;
  visibleKpis: string[];
}) {

  const adRows = useMemo(
    () => (storeIds.length ? filterProd(getDataset().prodRows, { storeIds, adType: '', from, to }) : []),
    [storeIds, from, to],
  );
  const previous = useMemo(() => previousRange(from, to), [from, to]);
  const prevRows = useMemo(
    () => (storeIds.length ? filterProd(getDataset().prodRows, { storeIds, adType: '', from: previous.from, to: previous.to }) : []),
    [storeIds, previous.from, previous.to],
  );

  const current = useMemo(() => finalize(accOfProd(adRows)), [adRows]);
  const prevMetrics = useMemo(() => finalize(accOfProd(prevRows)), [prevRows]);
  const storeSnapshot = useMemo(
    () => (storeIds.length ? buildStoreSnapshot(storeIds, 'TOTAL', from, to, exclusionEnabled, configs) : null),
    [storeIds, from, to, exclusionEnabled, configs],
  );
  const storeGmv = storeSnapshot?.summary.confirmGmv ?? 0;
  const prevStoreGmv = useMemo(
    () => (storeIds.length ? buildStoreSnapshot(storeIds, 'TOTAL', previous.from, previous.to, exclusionEnabled, configs).summary.confirmGmv : 0),
    [storeIds, previous.from, previous.to, exclusionEnabled, configs],
  );
  const kpis = useMemo(() => {
    const all = buildAdKpis(current, prevMetrics, storeGmv, prevStoreGmv);
    const byKey = new Map(all.map((kpi) => [kpi.key, kpi]));
    const visible: typeof all = [];
    visibleKpis.forEach((key) => {
      const kpi = byKey.get(key);
      if (kpi) visible.push(kpi);
    });
    return visible;
  }, [current, prevMetrics, storeGmv, prevStoreGmv, visibleKpis]);
  const trend = useMemo(() => {
    const base = buildAdTrend(adRows, from, to);
    const storeSeries = storeSnapshot?.series.confirmGmv ?? [];
    return base.map((point, index) => {
      const dayStoreGmv = storeSeries[index] ?? 0;
      return { ...point, storeGmv: dayStoreGmv, share: dayStoreGmv > 0 ? point.gmv / dayStoreGmv : null };
    });
  }, [adRows, from, to, storeSnapshot]);

  if (!storeIds.length) {
    return <div className="hd-empty hd-empty-lg">当前筛选没有可投放的广告店铺</div>;
  }

  const metricLabel = AD_TREND_LABELS[trendMetric];
  const formatTrend = (value: number | null) => adTrendFormat(trendMetric, value);

  return (
    <>
      <div className="hd-store-kpi-grid">
        {kpis.map((kpi) => (
          <button
            type="button"
            className={`hd-glass hd-store-kpi is-card${trendMetric === AD_KPI_TREND[kpi.key] ? ' is-active' : ''}`}
            key={kpi.key}
            onClick={() => onTrendMetricChange(AD_KPI_TREND[kpi.key])}
          >
            <span className="hd-store-kpi-label">
              {kpi.label}
              <Tooltip content={kpi.hint}><span className="hd-help">?</span></Tooltip>
            </span>
            <strong>{adKpiText(kpi.format, kpi.value)}</strong>
          </button>
        ))}
      </div>
      <Chart
        labels={trend.map((point) => point.date.slice(5).replace('-', '/'))}
        series={[{ key: trendMetric, label: metricLabel, color: '#ff8a3d', values: trend.map((point) => point[trendMetric]), area: true }]}
        height={240}
        formatValue={formatTrend}
        axisFormat={adTrendAxisFormat(trendMetric)}
        tipRows={(index) => [{ label: metricLabel, value: formatTrend(trend[index][trendMetric]), color: '#ff8a3d' }]}
        ariaLabel="广告趋势"
      />
    </>
  );
}
