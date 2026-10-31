import React, { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { AD_TYPE_LABEL, type ItemRow, type OrderReportRow, type ProdReportRow, type TrendMetric } from '../data/types';
import { buildPlanRows, buildTrend, buildWordRows, finalize, mergeAcc } from '../data/aggregate';
import { fmtInt, fmtMoney, fmtRoas } from '../data/format';
import { TrendChart } from './TrendChart';
import { InfoTip, Tag } from './ui';

interface Props {
  item: ItemRow | null;
  prodRows: ProdReportRow[];
  orderRows: OrderReportRow[];
  from: string;
  to: string;
  onClose: () => void;
}

const TREND_OPTIONS: Array<{ key: TrendMetric; label: string }> = [
  { key: 'cost', label: '花费' },
  { key: 'gmv', label: 'GMV' },
  { key: 'roas', label: 'ROAS' },
];

export function ItemDrawer(props: Props) {
  const [trendMetric, setTrendMetric] = useState<TrendMetric>('gmv');

  useEffect(() => {
    if (!props.item) return undefined;
    setTrendMetric('gmv');
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') props.onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [props.item]);

  const { planRows, wordRows, trend, summary } = useMemo(() => {
    const acc = mergeAcc(
      props.prodRows.map((row) => ({
        imp: row.imp,
        click: row.click,
        cost: row.usdCost,
        orders: row.orders,
        gmv: row.gmv,
      })),
    );
    return {
      planRows: buildPlanRows(props.prodRows).sort((a, b) => b.cost - a.cost),
      wordRows: buildWordRows(props.orderRows).sort((a, b) => b.gmv - a.gmv).slice(0, 6),
      trend: buildTrend(props.prodRows, props.from, props.to),
      summary: finalize(acc),
    };
  }, [props.prodRows, props.orderRows, props.from, props.to]);

  if (!props.item) return null;

  return (
    <div className="adr-drawer" role="dialog" aria-modal="true" aria-label="商品广告详情">
      <div className="adr-drawer__mask" onClick={props.onClose} />
      <aside className="adr-drawer__panel">
        <header className="adr-drawer__head">
          <div className="adr-drawer__title" data-annotation-id="adr-drawer">
            {props.item.thumb ? (
              <img className="adr-drawer__thumb" src={props.item.thumb} alt="" />
            ) : (
              <span className="adr-drawer__thumb adr-drawer__thumb--empty">无图</span>
            )}
            <div className="adr-drawer__meta">
              <div className="adr-drawer__name">{props.item.name}</div>
              <div className="adr-drawer__sub">
                {props.item.itemcode} · {props.item.store}
              </div>
            </div>
          </div>
          <button type="button" className="adr-iconbtn" onClick={props.onClose} aria-label="关闭">
            <X size={18} />
          </button>
        </header>

        <div className="adr-drawer__body">
          <div className="adr-drawer__kpis">
            <div className="adr-drawer__kpi">
              <span>花费</span>
              <strong>{fmtMoney(summary.cost)}</strong>
            </div>
            <div className="adr-drawer__kpi">
              <span>GMV</span>
              <strong>{fmtMoney(summary.gmv)}</strong>
            </div>
            <div className="adr-drawer__kpi">
              <span>订单数</span>
              <strong>{fmtInt(summary.orders)}</strong>
            </div>
            <div className={`adr-drawer__kpi${props.item.lowRoas ? ' is-bad' : ''}`}>
              <span>ROAS</span>
              <strong>{fmtRoas(summary.roas)}</strong>
            </div>
          </div>

          <section className="adr-drawer__section">
            <div className="adr-drawer__section-head">
              <h4>按天走势</h4>
              <div className="adr-segment adr-segment--small">
                {TREND_OPTIONS.map((option) => (
                  <button
                    type="button"
                    key={option.key}
                    className={`adr-segment__btn${trendMetric === option.key ? ' is-active' : ''}`}
                    onClick={() => setTrendMetric(option.key)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <TrendChart points={trend} metric={trendMetric} compact />
          </section>

          <section className="adr-drawer__section" data-annotation-id="adr-drawer-plan">
            <div className="adr-drawer__section-head">
              <h4>按计划拆分</h4>
              <InfoTip text="计划与广告组只有名称，没有独立 ID；全店自动广告没有计划和广告组。" />
            </div>
            <table className="adr-mini-table">
              <thead>
                <tr>
                  <th>广告类型</th>
                  <th>计划</th>
                  <th>广告组</th>
                  <th className="is-num">花费</th>
                  <th className="is-num">订单</th>
                  <th className="is-num">GMV</th>
                  <th className="is-num">ROAS</th>
                </tr>
              </thead>
              <tbody>
                {planRows.map((row) => (
                  <tr key={row.key}>
                    <td>
                      <Tag tone={row.adType === 'ppc' ? 'info' : 'neutral'}>{AD_TYPE_LABEL[row.adType]}</Tag>
                    </td>
                    <td>{row.planName || <span className="adr-cell-muted">-</span>}</td>
                    <td>{row.groupName || <span className="adr-cell-muted">-</span>}</td>
                    <td className="is-num">{fmtMoney(row.cost)}</td>
                    <td className="is-num">{fmtInt(row.orders)}</td>
                    <td className="is-num">{fmtMoney(row.gmv)}</td>
                    <td className={`is-num${row.lowRoas ? ' adr-td--bad' : ''}`}>{fmtRoas(row.roas)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="adr-drawer__section">
            <div className="adr-drawer__section-head">
              <h4>带单成单词</h4>
              <span className="adr-drawer__section-note">全店自动广告没有搜索词，归到「无搜索词」</span>
            </div>
            {wordRows.length === 0 ? (
              <div className="adr-drawer__none">该商品在所选区间内暂无成单词记录</div>
            ) : (
              <ul className="adr-wordlist">
                {wordRows.map((row) => (
                  <li key={row.key} className="adr-wordlist__item">
                    <span className="adr-wordlist__word">{row.word || '无搜索词（自动广告）'}</span>
                    <span className="adr-wordlist__meta">
                      {fmtInt(row.orderCount)} 单 · {fmtMoney(row.gmv)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </aside>
    </div>
  );
}
