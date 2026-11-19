import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { eachDay } from '../data/generate';
import { PRODUCT_MAP } from '../data/catalog';
import { fmtInt, fmtMoney, fmtMoneyAxis } from '../data/format';
import { METRIC_TIPS } from '../data/metricTips';
import { AD_TYPE_LABEL, type WordRow } from '../data/types';
import { Chart } from './Chart';
import { MetricHelp } from './MetricHelp';

export function AdWordDrawer({
  row,
  from,
  to,
  onClose,
}: {
  row: WordRow;
  from: string;
  to: string;
  onClose: () => void;
}) {
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

  const dates = useMemo(() => eachDay(from, to), [from, to]);
  const daily = useMemo(() => {
    const map = new Map<string, number>();
    row.orders.forEach((order) => map.set(order.date, (map.get(order.date) ?? 0) + order.amount));
    return map;
  }, [row]);
  const values = dates.map((date) => daily.get(date) ?? 0);
  const cards = [
    { label: '成单 GMV', value: fmtMoney(row.gmv), tip: METRIC_TIPS.wordGmv },
    { label: '订单数', value: fmtInt(row.orderCount), tip: METRIC_TIPS.wordOrders },
    { label: '涉及商品数', value: fmtInt(row.itemCount), tip: METRIC_TIPS.wordItems },
    { label: '最近成单日', value: row.lastDate || '-', tip: METRIC_TIPS.wordLastDate },
  ];
  const orders = [...row.orders].sort((a, b) => {
    if (a.date === b.date) return b.amount - a.amount;
    return a.date < b.date ? 1 : -1;
  });
  const wordLabel = row.word || '无搜索词（自动广告）';

  return createPortal(
    <>
      <div className={`hd-drawer-mask${closing ? ' is-closing' : ''}`} onMouseDown={(event) => event.target === event.currentTarget && requestClose()} />
      <div className={`hd-drawer${closing ? ' is-closing' : ''}`} role="dialog" aria-modal="true" aria-label="成单词明细">
        <div className="hd-drawer-header">
          <div className="hd-drawer-title">
            <span className="hd-drawer-store-avatar">词</span>
            <div className="hd-drawer-title-text">
              <strong>{wordLabel}</strong>
              <span>
                {row.storeName}
                {row.adTypes.length ? ` · ${row.adTypes.map((type) => AD_TYPE_LABEL[type]).join(' / ')}` : ''}
              </span>
            </div>
          </div>
          <button type="button" className="hd-excl-close" onClick={requestClose} aria-label="关闭"><X size={18} /></button>
        </div>
        <div className="hd-drawer-body">
          <div className="hd-drawer-metrics is-four">
            {cards.map((card) => (
              <div className="hd-drawer-kpi is-static" key={card.label}>
                <span>{card.label}<MetricHelp tip={card.tip} /></span>
                <strong>{card.value}</strong>
              </div>
            ))}
          </div>

          <div className="hd-drawer-section">
            <Chart
              labels={dates.map((date) => date.slice(5).replace('-', '/'))}
              series={[{ key: 'wordGmv', label: '成单 GMV', color: '#ff8a3d', values, area: true }]}
              height={180}
              formatValue={(value) => fmtMoney(value)}
              axisFormat={fmtMoneyAxis}
              tipRows={(index) => [{ label: '成单 GMV', value: fmtMoney(values[index]), color: '#ff8a3d' }]}
              ariaLabel={`${wordLabel} 成单 GMV 趋势`}
            />
          </div>

          <div className="hd-drawer-section">
            <div className="hd-drawer-section-head"><span>订单明细</span><span className="hd-muted">共 {orders.length} 笔 · 按日期倒序</span></div>
            <div className="hd-drawer-orders">
              <table className="hd-mini-table is-word-orders">
                <thead>
                  <tr><th>订单号</th><th>日期</th><th>商品</th><th>金额</th></tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.orderNo}>
                      <td>{order.orderNo}</td>
                      <td>{order.date}</td>
                      <td>
                        {order.items.map((item) => {
                          const thumb = PRODUCT_MAP[item.code]?.thumb ?? '';
                          return (
                            <span className="hd-item-cell" key={item.code}>
                              {thumb ? <img src={thumb} alt="" /> : <span className="hd-item-thumb-ph" />}
                              <span className="hd-item-text">
                                <strong title={item.name}>{item.name}</strong>
                                <em>{item.code} · {row.storeName}</em>
                              </span>
                            </span>
                          );
                        })}
                      </td>
                      <td>{fmtMoney(order.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
