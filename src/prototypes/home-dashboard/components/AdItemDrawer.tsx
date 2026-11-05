import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { accOfProd, buildAdTrend, buildPlanRows, buildWordRows, finalize } from '../data/aggregate';
import { fmtInt, fmtMoney, fmtMoneyAxis, fmtRoas } from '../data/format';
import { AD_TYPE_LABEL, type ItemRow, type OrderRow, type ProdReportRow } from '../data/types';
import { Chart } from './Chart';

export function AdItemDrawer({
  row,
  prodRows,
  orderRows,
  from,
  to,
  onClose,
}: {
  row: ItemRow;
  prodRows: ProdReportRow[];
  orderRows: OrderRow[];
  from: string;
  to: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const itemRows = prodRows.filter((item) => item.storeId === row.storeId && item.itemcode === row.itemcode);
  const metrics = finalize(accOfProd(itemRows));
  const planRows = buildPlanRows(itemRows).sort((a, b) => b.cost - a.cost).slice(0, 8);
  const wordRows = buildWordRows(orderRows.filter((item) => item.orderItemcode === row.itemcode)).sort((a, b) => b.gmv - a.gmv).slice(0, 6);
  const trend = buildAdTrend(itemRows, from, to);

  return createPortal(
    <div className="hd-drawer" role="dialog" aria-modal="true" aria-label="商品广告明细">
      <div className="hd-drawer-header">
        <div className="hd-drawer-title">
          {row.thumb ? <img src={row.thumb} alt="" /> : <span className="hd-drawer-thumb-ph" />}
          <div className="hd-drawer-title-text">
            <strong>{row.name}</strong>
            <span>{row.itemcode} · {row.storeName}</span>
          </div>
        </div>
        <button type="button" className="hd-excl-close" onClick={onClose} aria-label="关闭"><X size={18} /></button>
      </div>
      <div className="hd-drawer-body">
        <div className="hd-drawer-kpis">
          {[
            { label: '广告花费', value: fmtMoney(metrics.cost) },
            { label: '广告 GMV', value: fmtMoney(metrics.gmv) },
            { label: '订单数', value: fmtInt(metrics.orders) },
            { label: 'ROAS', value: fmtRoas(metrics.roas) },
          ].map((item) => (
            <div className="hd-drawer-kpi" key={item.label}>
              <span>{item.label}</span>
              <strong className={item.label === 'ROAS' && metrics.roas !== null && metrics.roas < 1 ? 'is-danger' : ''}>{item.value}</strong>
            </div>
          ))}
        </div>

        <div className="hd-drawer-section">
          <div className="hd-drawer-section-head">
            <span>按天走势</span>
            <span className="hd-muted">广告花费 / 广告 GMV</span>
          </div>
          <Chart
            labels={trend.map((point) => point.date.slice(5).replace('-', '/'))}
            series={[
              { key: 'cost', label: '广告花费', color: '#ff8a3d', values: trend.map((point) => point.cost) },
              { key: 'gmv', label: '广告 GMV', color: '#5b8ff9', values: trend.map((point) => point.gmv) },
            ]}
            height={180}
            formatValue={(value) => fmtMoney(value)}
            axisFormat={fmtMoneyAxis}
            tipRows={(index) => [
              { label: '广告花费', value: fmtMoney(trend[index].cost), color: '#ff8a3d' },
              { label: '广告 GMV', value: fmtMoney(trend[index].gmv), color: '#5b8ff9' },
            ]}
          />
        </div>

        <div className="hd-drawer-section">
          <div className="hd-drawer-section-head"><span>按计划拆分</span><span className="hd-muted">按花费降序</span></div>
          <table className="hd-mini-table">
            <thead>
              <tr><th>广告类型</th><th>计划 / 广告组</th><th>花费</th><th>订单</th><th>GMV</th><th>ROAS</th></tr>
            </thead>
            <tbody>
              {planRows.map((plan) => (
                <tr key={plan.key}>
                  <td>{AD_TYPE_LABEL[plan.adType]}</td>
                  <td title={`${plan.planName} ${plan.groupName}`}>{plan.planName || '全店自动'}{plan.groupName ? ` / ${plan.groupName}` : ''}</td>
                  <td>{fmtMoney(plan.cost)}</td>
                  <td>{fmtInt(plan.orders)}</td>
                  <td>{fmtMoney(plan.gmv)}</td>
                  <td className={plan.roas !== null && plan.roas < 1 ? 'is-danger' : ''}>{fmtRoas(plan.roas)}</td>
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
    </div>,
    document.body,
  );
}
