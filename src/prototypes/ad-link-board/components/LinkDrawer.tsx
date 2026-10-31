import React, { useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import type { AdDailyRow, LinkRow, OrderItemDailyRow } from '../data/types';
import { buildLinkTrend, buildRangeCompare } from '../data/aggregate';
import { fmtMoney, fmtRoas } from '../data/format';
import { TrendChart } from './TrendChart';
import { InfoTip } from './ui';

interface Props {
  link: LinkRow | null;
  ads: AdDailyRow[];
  orders: OrderItemDailyRow[];
  from: string;
  to: string;
  onClose: () => void;
}

function pct(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return '-';
  return `${(value * 100).toFixed(1)}%`;
}

export function LinkDrawer(props: Props) {
  useEffect(() => {
    if (!props.link) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') props.onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [props.link]);

  const compare = useMemo(
    () => (props.link ? buildRangeCompare(props.link.itemCode, props.link.storeId, props.ads, props.orders) : []),
    [props.link, props.ads, props.orders],
  );

  const trend = useMemo(
    () => (props.link ? buildLinkTrend(props.link.itemCode, props.link.storeId, props.ads, props.orders, props.from, props.to) : []),
    [props.link, props.ads, props.orders, props.from, props.to],
  );

  if (!props.link) return null;

  return (
    <div className="adr-drawer" role="dialog" aria-modal="true" aria-label="链接详情">
      <div className="adr-drawer__mask" onClick={props.onClose} />
      <aside className="adr-drawer__panel">
        <header className="adr-drawer__head">
          <div className="adr-drawer__title" data-annotation-id="alb-drawer">
            {props.link.imgUrl ? (
              <img className="adr-drawer__thumb" src={props.link.imgUrl} alt="" />
            ) : (
              <span className="adr-drawer__thumb adr-drawer__thumb--empty">无图</span>
            )}
            <div className="adr-drawer__meta">
              <div className="adr-drawer__name">{props.link.itemName}</div>
              <div className="adr-drawer__sub">
                {props.link.itemCode} · {props.link.categoryName}
              </div>
            </div>
          </div>
          <button type="button" className="adr-iconbtn" onClick={props.onClose} aria-label="关闭">
            <X size={18} />
          </button>
        </header>

        <div className="adr-drawer__body">
          <div className="adr-drawer__kpis adr-drawer__kpis--5">
            <div className="adr-drawer__kpi">
              <span>广告消耗</span>
              <strong>{props.link.hasAd ? fmtMoney(props.link.adCost) : '-'}</strong>
            </div>
            <div className="adr-drawer__kpi">
              <span>广告 GMV</span>
              <strong>{props.link.hasAd ? fmtMoney(props.link.adGmv) : '-'}</strong>
            </div>
            <div className="adr-drawer__kpi">
              <span>链接产出 GMV</span>
              <strong>{fmtMoney(props.link.linkGmv)}</strong>
            </div>
            <div className="adr-drawer__kpi">
              <span>广告 GMV 占比</span>
              <strong>{pct(props.link.adRatio)}</strong>
            </div>
            <div className={`adr-drawer__kpi${props.link.roas !== null && props.link.roas < 1 ? ' is-bad' : ''}`}>
              <span>ROAS</span>
              <strong>{fmtRoas(props.link.roas)}</strong>
            </div>
          </div>

          <section className="adr-drawer__section">
            <div className="adr-drawer__section-head">
              <h4>按天走势</h4>
              <span className="adr-drawer__section-note">广告消耗 vs 链接产出 GMV</span>
            </div>
            <TrendChart points={trend} compact labels={{ a: '广告消耗', b: '链接产出 GMV' }} />
          </section>

          <section className="adr-drawer__section" data-annotation-id="alb-drawer-compare">
            <div className="adr-drawer__section-head">
              <h4>多时间对比</h4>
              <InfoTip text="固定以广告数据截止日为终点，向前取 1/3/7/15/30 天，便于看这条链接在不同周期下的广告依赖度。" />
            </div>
            <table className="adr-mini-table">
              <thead>
                <tr>
                  <th>周期</th>
                  <th className="is-num">广告消耗</th>
                  <th className="is-num">广告 GMV</th>
                  <th className="is-num">链接产出 GMV</th>
                  <th className="is-num">广告占比</th>
                  <th className="is-num">ROAS</th>
                </tr>
              </thead>
              <tbody>
                {compare.map((row) => (
                  <tr key={row.label}>
                    <td>{row.label}</td>
                    <td className="is-num">{row.adCost > 0 ? fmtMoney(row.adCost) : '-'}</td>
                    <td className="is-num">{row.adGmv > 0 ? fmtMoney(row.adGmv) : '-'}</td>
                    <td className="is-num">{fmtMoney(row.linkGmv)}</td>
                    <td className="is-num">{pct(row.adRatio)}</td>
                    <td className={`is-num${row.roas !== null && row.roas < 1 ? ' adr-td--bad' : ''}`}>{fmtRoas(row.roas)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <p className="adr-drawer__foot">
            链接产出 GMV = 订单商品行金额之和（单价 × 数量），按支付日期归属；广告数据来自敦煌广告报表，两边按同一区间对齐。
          </p>
        </div>
      </aside>
    </div>
  );
}
