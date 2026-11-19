import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { accOfProd, buildAdTrend, buildItemRows, buildPlanRows, buildStoreSnapshot, buildWordRows, finalize } from '../data/aggregate';
import type { AdTrendView } from '../data/adTrend';
import { fmtInt, fmtMoney, fmtMoneyAxis, fmtPct, fmtRoas } from '../data/format';
import { getDataset } from '../data/generate';
import { METRIC_TIPS } from '../data/metricTips';
import { AD_TYPE_LABEL, type AdType, type ExclusionConfig, type ItemRow, type OrderRow, type PlanRow, type ProdReportRow } from '../data/types';
import { Chart } from './Chart';
import { MetricHelp } from './MetricHelp';

type DrawerTrendMetric = 'cost' | 'gmv' | 'productGmv' | 'storeGmv' | 'share' | 'orders' | 'click' | 'roas';
type DrawerScope = 'item' | 'store' | 'plan';

function allDrawerKeys(scope: DrawerScope): DrawerTrendMetric[] {
  if (scope === 'plan') return ['cost', 'gmv', 'orders', 'click', 'roas'];
  if (scope === 'store') return ['cost', 'gmv', 'storeGmv', 'share', 'roas'];
  return ['cost', 'gmv', 'productGmv', 'share', 'roas'];
}

function resolveInitialMetric(initial: AdTrendView | undefined, scope: DrawerScope): DrawerTrendMetric {
  if (scope === 'plan') {
    if (initial === 'cost' || initial === 'gmv' || initial === 'orders' || initial === 'click' || initial === 'roas') return initial;
    return 'gmv';
  }
  if (initial === 'storeGmv') return scope === 'store' ? 'storeGmv' : 'productGmv';
  if (initial === 'cost' || initial === 'gmv' || initial === 'share' || initial === 'roas') return initial;
  return 'cost';
}

function toDrawerKey(key: string, scope: DrawerScope): DrawerTrendMetric | null {
  if (key === 'storeGmv') return scope === 'store' ? 'storeGmv' : 'productGmv';
  if (key === 'ratio') return 'share';
  if (key === 'cost' || key === 'gmv' || key === 'roas') return key;
  return null;
}

export function AdItemDrawer({
  row,
  store,
  plan,
  prodRows,
  orderRows,
  from,
  to,
  exclusionEnabled,
  configs,
  initialMetric,
  kpiKeys,
  onClose,
}: {
  row?: ItemRow;
  store?: { storeId: number; storeName: string; alias: string };
  plan?: { planKey: string; planName: string; groupName: string; adType: AdType; storeId: number; storeName: string };
  prodRows: ProdReportRow[];
  orderRows: OrderRow[];
  from: string;
  to: string;
  exclusionEnabled?: boolean;
  configs?: ExclusionConfig[];
  initialMetric?: AdTrendView;
  kpiKeys?: string[];
  onClose: () => void;
}) {
  const scope: DrawerScope = plan ? 'plan' : store ? 'store' : 'item';
  const visibleKeys = useMemo<DrawerTrendMetric[]>(() => {
    const fallback = allDrawerKeys(scope);
    if (scope === 'plan' || !kpiKeys || !kpiKeys.length) return fallback;
    const mapped = kpiKeys.map((key) => toDrawerKey(key, scope)).filter((key): key is DrawerTrendMetric => key !== null);
    return mapped.length ? mapped : fallback;
  }, [kpiKeys, scope]);
  const [metric, setMetric] = useState<DrawerTrendMetric>(() => {
    const initial = resolveInitialMetric(initialMetric, scope);
    return visibleKeys.includes(initial) ? initial : visibleKeys[0];
  });
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef<number | null>(null);
  const requestClose = useCallback(() => {
    if (closing) return;
    setClosing(true);
    closeTimer.current = window.setTimeout(onClose, 220);
  }, [closing, onClose]);
  useEffect(() => () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
  }, []);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') requestClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [requestClose]);

  const subjectRows = plan
    ? prodRows.filter((item) => `${item.storeId}__${item.adType}__${item.planName}__${item.groupName}` === plan.planKey)
    : store
      ? prodRows.filter((item) => item.storeId === store.storeId)
      : prodRows.filter((item) => item.storeId === row?.storeId && item.itemcode === row?.itemcode);
  const metrics = finalize(accOfProd(subjectRows));
  const [planSort, setPlanSort] = useState<{ key: 'cost' | 'orders' | 'gmv' | 'roas'; dir: 'asc' | 'desc' }>({ key: 'cost', dir: 'desc' });
  const splitRows = useMemo(() => {
    const source: Array<{ cost: number; orders: number; gmv: number; roas: number | null }> = scope === 'plan'
      ? buildItemRows(subjectRows)
      : buildPlanRows(subjectRows);
    const sorted = [...source].sort((a, b) => {
      const left = a[planSort.key];
      const right = b[planSort.key];
      const leftOk = typeof left === 'number' && Number.isFinite(left);
      const rightOk = typeof right === 'number' && Number.isFinite(right);
      if (!leftOk && !rightOk) return 0;
      if (!leftOk) return 1;
      if (!rightOk) return -1;
      return planSort.dir === 'asc' ? left - right : right - left;
    });
    return scope === 'plan' ? (sorted as ItemRow[]).slice(0, 8) : (sorted as PlanRow[]).slice(0, 8);
  }, [subjectRows, planSort, scope]);
  const togglePlanSort = (key: typeof planSort.key) => {
    setPlanSort((prev) => (prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' }));
  };
  const planMark = (key: typeof planSort.key) => (planSort.key === key ? (planSort.dir === 'asc' ? '↑' : '↓') : '↕');
  const wordSource = plan
    ? orderRows.filter((item) => item.storeId === plan.storeId && item.planName === plan.planName)
    : store
      ? orderRows.filter((item) => item.storeId === store.storeId)
      : orderRows.filter((item) => item.orderItemcode === row?.itemcode);
  const wordRows = buildWordRows(wordSource).sort((a, b) => b.gmv - a.gmv).slice(0, 6);
  const trend = buildAdTrend(subjectRows, from, to);
  const totalDaily = useMemo(() => {
    const map = new Map<string, number>();
    if (scope === 'plan') return map;
    if (store) {
      const snapshot = buildStoreSnapshot([store.storeId], 'TOTAL', from, to, exclusionEnabled ?? false, configs ?? []);
      snapshot.dates.forEach((date, index) => map.set(date, snapshot.series.confirmGmv[index] ?? 0));
    } else {
      getDataset().itemDay.forEach((item) => {
        if (item.storeId !== row?.storeId || item.itemcode !== row?.itemcode) return;
        if (item.date < from || item.date > to) return;
        map.set(item.date, (map.get(item.date) ?? 0) + item.gmv);
      });
    }
    return map;
  }, [scope, store, row, from, to, exclusionEnabled, configs]);
  const totalGmv = store
    ? Array.from(totalDaily.values()).reduce((sum, value) => sum + value, 0)
    : (row?.productGmv ?? 0);
  const share = totalGmv > 0 ? metrics.gmv / totalGmv : null;
  const cards: Array<{ key: DrawerTrendMetric; label: string; value: string; danger: boolean; tip: string }> = plan
    ? [
        { key: 'cost', label: '广告消耗', value: fmtMoney(metrics.cost), danger: false, tip: METRIC_TIPS.cost },
        { key: 'gmv', label: '广告 GMV', value: fmtMoney(metrics.gmv), danger: false, tip: METRIC_TIPS.gmv },
        { key: 'orders', label: '广告订单数', value: fmtInt(metrics.orders), danger: false, tip: METRIC_TIPS.orders },
        { key: 'click', label: '点击量', value: fmtInt(metrics.click), danger: false, tip: METRIC_TIPS.click },
        { key: 'roas', label: '投产比', value: fmtRoas(metrics.roas), danger: metrics.roas !== null && metrics.roas < 1, tip: METRIC_TIPS.roas },
      ]
    : [
        { key: 'cost', label: '广告消耗', value: fmtMoney(metrics.cost), danger: false, tip: METRIC_TIPS.cost },
        { key: 'gmv', label: '广告 GMV', value: fmtMoney(metrics.gmv), danger: false, tip: METRIC_TIPS.gmv },
        { key: scope === 'store' ? 'storeGmv' : 'productGmv', label: scope === 'store' ? '整店 GMV' : '商品 GMV', value: fmtMoney(totalGmv), danger: false, tip: scope === 'store' ? METRIC_TIPS.storeGmv : METRIC_TIPS.productGmv },
        { key: 'share', label: '广告 GMV 占比', value: fmtPct(share), danger: false, tip: METRIC_TIPS.ratio },
        { key: 'roas', label: '投产比', value: fmtRoas(metrics.roas), danger: metrics.roas !== null && metrics.roas < 1, tip: METRIC_TIPS.roas },
      ];
  const visibleCards = visibleKeys
    .map((key) => cards.find((card) => card.key === key))
    .filter((card): card is (typeof cards)[number] => Boolean(card));
  const metricLabel = cards.find((card) => card.key === metric)?.label ?? '广告消耗';
  const trendValues = trend.map((point) => {
    if (metric === 'productGmv' || metric === 'storeGmv') return totalDaily.get(point.date) ?? 0;
    if (metric === 'share') {
      const dayGmv = totalDaily.get(point.date) ?? 0;
      return dayGmv > 0 ? point.gmv / dayGmv : null;
    }
    return point[metric];
  });
  const formatTrend = (value: number | null) => {
    if (metric === 'share') return fmtPct(value);
    if (metric === 'roas') return fmtRoas(value);
    if (metric === 'orders' || metric === 'click') return fmtInt(value);
    return fmtMoney(value);
  };
  const axisTrend = metric === 'share'
    ? (value: number) => `${(value * 100).toFixed(0)}%`
    : metric === 'roas'
      ? (value: number) => `${value.toFixed(1)}x`
      : metric === 'orders' || metric === 'click'
        ? undefined
        : fmtMoneyAxis;

  return createPortal(
    <>
      <div className={`hd-drawer-mask${closing ? ' is-closing' : ''}`} onMouseDown={(event) => event.target === event.currentTarget && requestClose()} />
      <div className={`hd-drawer${closing ? ' is-closing' : ''}`} role="dialog" aria-modal="true" aria-label={plan ? '计划广告明细' : scope === 'store' ? '店铺广告明细' : '商品广告明细'}>
      <div className="hd-drawer-header">
        <div className="hd-drawer-title">
          {plan ? (
            <span className="hd-drawer-store-avatar">计</span>
          ) : scope === 'store' ? (
            <span className="hd-drawer-store-avatar">{store?.storeName.slice(0, 1)}</span>
          ) : row?.thumb ? (
            <img src={row.thumb} alt="" />
          ) : (
            <span className="hd-drawer-thumb-ph" />
          )}
          <div className="hd-drawer-title-text">
            <strong>{plan ? (plan.planName || '全店自动') : scope === 'store' ? store?.storeName : row?.name}</strong>
            <span>
              {plan
                ? `${AD_TYPE_LABEL[plan.adType]} · ${plan.storeName}${plan.groupName ? ` · ${plan.groupName}` : ''}`
                : scope === 'store'
                  ? (store?.alias || '店铺广告明细')
                  : `${row?.itemcode} · ${row?.storeName}`}
            </span>
          </div>
        </div>
        <button type="button" className="hd-excl-close" onClick={requestClose} aria-label="关闭"><X size={18} /></button>
      </div>
      <div className="hd-drawer-body">
        <div className="hd-drawer-metrics is-five">
          {visibleCards.map((card) => (
            <button
              type="button"
              className={`hd-drawer-kpi${metric === card.key ? ' is-active' : ''}`}
              key={card.key}
              onClick={() => setMetric(card.key)}
            >
              <span>{card.label}<MetricHelp tip={card.tip} /></span>
              <strong className={card.danger ? 'is-danger' : ''}>{card.value}</strong>
            </button>
          ))}
        </div>

        <div className="hd-drawer-section">
          <Chart
            labels={trend.map((point) => point.date.slice(5).replace('-', '/'))}
            series={[{ key: metric, label: metricLabel, color: '#ff8a3d', values: trendValues, area: true }]}
            height={180}
            formatValue={formatTrend}
            axisFormat={axisTrend}
            tipRows={(index) => [{ label: metricLabel, value: formatTrend(trendValues[index]), color: '#ff8a3d' }]}
            ariaLabel={`${plan ? plan.planName || '全店自动' : scope === 'store' ? store?.storeName : row?.name} ${metricLabel}趋势`}
          />
        </div>

        {[
          {
            title: '流量',
            items: [
              { label: '曝光量', value: fmtInt(metrics.imp), tip: METRIC_TIPS.imp },
              { label: '点击量', value: fmtInt(metrics.click), tip: METRIC_TIPS.click },
              { label: '点击率', value: fmtPct(metrics.ctr), tip: METRIC_TIPS.ctr },
              { label: '点击单价', value: fmtMoney(metrics.cpc), tip: METRIC_TIPS.cpc },
            ],
          },
          {
            title: '转化',
            items: [
              { label: '订单数', value: fmtInt(metrics.orders), tip: METRIC_TIPS.orders },
              { label: '转化率', value: fmtPct(metrics.cvr), tip: METRIC_TIPS.cvr },
              { label: '单均花费', value: fmtMoney(metrics.cpa), tip: METRIC_TIPS.cpa },
            ],
          },
        ].map((group) => (
          <div className="hd-drawer-metric-group" key={group.title}>
            <div className="hd-drawer-metric-title">{group.title}</div>
            <div className="hd-drawer-metrics">
              {group.items.map((item) => (
                <div className="hd-drawer-kpi is-static" key={item.label}>
                  <span>{item.label}<MetricHelp tip={item.tip} /></span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="hd-drawer-section">
          <div className="hd-drawer-section-head"><span>{plan ? '按商品拆分' : '按计划拆分'}</span></div>
          <table className={`hd-mini-table${plan ? ' is-item-split' : ''}`}>
            <thead>
              <tr>
                {plan ? <th>商品</th> : <><th>广告类型</th><th>计划 / 广告组</th></>}
                <th className="is-sortable" onClick={() => togglePlanSort('cost')}>消耗 <MetricHelp tip={METRIC_TIPS.cost} /> {planMark('cost')}</th>
                <th className="is-sortable" onClick={() => togglePlanSort('orders')}>订单 <MetricHelp tip={METRIC_TIPS.orders} /> {planMark('orders')}</th>
                <th className="is-sortable" onClick={() => togglePlanSort('gmv')}>GMV <MetricHelp tip={METRIC_TIPS.gmv} /> {planMark('gmv')}</th>
                <th className="is-sortable" onClick={() => togglePlanSort('roas')}>投产比 <MetricHelp tip={METRIC_TIPS.roas} /> {planMark('roas')}</th>
              </tr>
            </thead>
            <tbody>
              {plan
                ? (splitRows as ItemRow[]).map((item) => (
                    <tr key={item.key}>
                      <td title={item.name}>
                        <span className="hd-item-cell">
                          {item.thumb ? <img src={item.thumb} alt="" /> : <span className="hd-item-thumb-ph" />}
                          <span className="hd-item-text">
                            <strong>{item.name}</strong>
                            <em>{item.itemcode} · {item.storeName}</em>
                          </span>
                        </span>
                      </td>
                      <td>{fmtMoney(item.cost)}</td>
                      <td>{fmtInt(item.orders)}</td>
                      <td>{fmtMoney(item.gmv)}</td>
                      <td className={item.roas !== null && item.roas < 1 ? 'is-danger' : ''}>{fmtRoas(item.roas)}</td>
                    </tr>
                  ))
                : (splitRows as PlanRow[]).map((planRow) => (
                    <tr key={planRow.key}>
                      <td>{AD_TYPE_LABEL[planRow.adType]}</td>
                      <td title={`${planRow.planName} ${planRow.groupName}`}>{planRow.planName || '全店自动'}{planRow.groupName ? ` / ${planRow.groupName}` : ''}</td>
                      <td>{fmtMoney(planRow.cost)}</td>
                      <td>{fmtInt(planRow.orders)}</td>
                      <td>{fmtMoney(planRow.gmv)}</td>
                      <td className={planRow.roas !== null && planRow.roas < 1 ? 'is-danger' : ''}>{fmtRoas(planRow.roas)}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        <div className="hd-drawer-section">
          <div className="hd-drawer-section-head"><span>带单成单词</span><span className="hd-muted">按 GMV 降序 Top 6</span></div>
          {wordRows.length === 0 ? <div className="hd-empty">暂无成单词数据</div> : (
            <ul className="hd-word-list">
              {wordRows.map((word) => (
                <li key={word.key}>
                  <span className="hd-word-name">{word.word || '无搜索词（自动广告）'}</span>
                  <span className="hd-word-meta">{word.orderCount} 单 · {fmtMoney(word.gmv)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      </div>
    </>,
    document.body,
  );
}
