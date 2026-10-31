import React, { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { fmtAxis, fmtMoney, type AdExclusionConfig } from '../ad-report';
import { buildItemDaily, ITEM_LINK_MAP } from '../item-ad-data';
import { LineChart } from './LineChart';
import { Tooltip } from './Tooltip';

type ItemMetricKey = 'adCost' | 'adGmv' | 'linkGmv' | 'adRatio' | 'roas';

interface ItemKpi {
  key: ItemMetricKey;
  label: string;
  format: 'money' | 'percent' | 'roas';
  hint: string;
  value: number | null;
}

function itemValue(key: ItemMetricKey, value: number): number {
  if (key === 'adRatio') return value * 100;
  return value;
}

function itemFormat(key: ItemMetricKey, value: number): string {
  if (key === 'adRatio') return `${value.toFixed(1)}%`;
  if (key === 'roas') return `${value.toFixed(2)}x`;
  return fmtMoney(value);
}

function itemAxis(key: ItemMetricKey, value: number): string {
  if (key === 'adRatio') return `${value.toFixed(0)}%`;
  if (key === 'roas') return `${value.toFixed(1)}x`;
  return fmtAxis(value);
}

export function ItemAdTrendDialog({
  storeId,
  itemCode,
  from,
  to,
  excludeEnabled,
  configs,
  onClose,
}: {
  storeId: number;
  itemCode: string;
  from: string;
  to: string;
  excludeEnabled: boolean;
  configs: AdExclusionConfig[];
  onClose: () => void;
}) {
  const info = ITEM_LINK_MAP[itemCode];
  const daily = useMemo(
    () => buildItemDaily(storeId, from, to, excludeEnabled, configs).filter((point) => point.itemCode === itemCode),
    [storeId, itemCode, from, to, excludeEnabled, configs],
  );
  const [metricKey, setMetricKey] = useState<ItemMetricKey>('adCost');

  const totals = useMemo(
    () =>
      daily.reduce(
        (sum, point) => ({
          adCost: sum.adCost + point.adCost,
          adGmv: sum.adGmv + point.adGmv,
          linkGmv: sum.linkGmv + point.linkGmv,
        }),
        { adCost: 0, adGmv: 0, linkGmv: 0 },
      ),
    [daily],
  );

  const hasAd = Boolean(info?.hasAd);
  const ratio = totals.linkGmv > 0 ? totals.adGmv / totals.linkGmv : null;
  const roasValue = totals.adCost > 0 ? totals.adGmv / totals.adCost : null;

  const kpis: ItemKpi[] = [
    { key: 'adCost', label: '广告消耗', format: 'money', hint: '统计周期内该商品的广告花费之和', value: hasAd ? totals.adCost : null },
    { key: 'adGmv', label: '广告 GMV', format: 'money', hint: '广告商品维度成交额之和', value: hasAd ? totals.adGmv : null },
    { key: 'linkGmv', label: '链接产出 GMV', format: 'money', hint: '该商品在订单中的商品行金额之和', value: totals.linkGmv },
    { key: 'adRatio', label: '广告 GMV 占比', format: 'percent', hint: '广告 GMV/链接产出 GMV', value: hasAd && ratio !== null ? ratio * 100 : null },
    { key: 'roas', label: 'ROAS', format: 'roas', hint: '广告 GMV/广告消耗', value: hasAd ? roasValue : null },
  ];

  const metric = kpis.find((card) => card.key === metricKey) || kpis[0];
  const dates = daily.map((point) => point.date);
  const values = daily.map((point) => {
    if (metric.key === 'adCost') return itemValue(metric.key, point.adCost);
    if (metric.key === 'adGmv') return itemValue(metric.key, point.adGmv);
    if (metric.key === 'linkGmv') return itemValue(metric.key, point.linkGmv);
    if (metric.key === 'adRatio') return point.linkGmv > 0 ? (point.adGmv / point.linkGmv) * 100 : 0;
    return point.adCost > 0 ? point.adGmv / point.adCost : 0;
  });

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

  if (!info) return null;

  return (
    <div className="ss-modal" onMouseDown={onClose}>
      <div
        className="ss-dialog ss-ad-trend-dialog" data-annotation-id="ssd-item-trend"
        role="dialog"
        aria-modal="true"
        aria-label="商品广告数据趋势"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="ss-dialog-header">
          <span className="ss-dialog-title">广告数据 - {info.itemName}</span>
          <button type="button" className="ss-dialog-close" onClick={onClose} aria-label="关闭"><X size={16} /></button>
        </div>
        <div className="ss-dialog-body">
          <div className="ss-ad-kpi-grid">
            {kpis.map((card) => (
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
                <div className="ss-ad-kpi-value">
                  {card.value === null ? '-' : itemFormat(card.key, card.value)}
                </div>
              </div>
            ))}
          </div>
          <div className="ss-ad-trend-chart">
            <LineChart
              dates={dates}
              height={320}
              ariaLabel={`${metric.label}走势`}
              series={[{ key: metric.key, label: metric.label, color: '#ff781f', values, area: true }]}
              formatValue={(value) => itemFormat(metric.key, value)}
              axisFormat={(value) => itemAxis(metric.key, value)}
              xFormat={(date) => date.slice(5).replace('-', '/')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
