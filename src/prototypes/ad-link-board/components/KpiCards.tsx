import React from 'react';
import { fmtMoney, fmtPoints, fmtRelative, fmtRoas } from '../data/format';
import type { KpiCard } from '../data/types';
import { InfoTip } from './ui';

function formatValue(card: KpiCard): string {
  if (card.value === null) return '-';
  if (card.format === 'money') return fmtMoney(card.value);
  if (card.format === 'roas') return fmtRoas(card.value);
  if (card.format === 'percent') return `${(card.value * 100).toFixed(1)}%`;
  return String(Math.round(card.value));
}

function formatPrev(card: KpiCard): string {
  if (card.prev === null) return '-';
  if (card.format === 'money') return fmtMoney(card.prev);
  if (card.format === 'roas') return fmtRoas(card.prev);
  if (card.format === 'percent') return `${(card.prev * 100).toFixed(1)}%`;
  return String(Math.round(card.prev));
}

function deltaText(card: KpiCard): string {
  return card.format === 'percent' ? fmtPoints(card.delta) : fmtRelative(card.delta);
}

function deltaTone(card: KpiCard): string {
  if (card.delta === null || Math.abs(card.delta) < 0.0005) return 'is-flat';
  return card.delta > 0 === card.goodWhenUp ? 'is-good' : 'is-bad';
}

export function KpiCards(props: { cards: KpiCard[]; rangeLabel: string }) {
  return (
    <section className="adr-metric-block" data-annotation-id="alb-kpi">
      <div className="adr-metric-head">
        <span className="adr-metric-head__title">核心指标</span>
        <span className="adr-metric-head__range">{props.rangeLabel}</span>
        <InfoTip text="广告数据来自敦煌广告报表，整店 GMV 来自店铺经营数据；两项按同一区间对齐后再算占比和 ROAS。" />
      </div>
      <div className="adr-kpi-grid">
        {props.cards.map((card) => (
          <div className={`adr-kpi${card.key === 'adRatio' ? ' adr-kpi--accent' : ''}`} key={card.key}>
            <div className="adr-kpi__label">
              {card.label}
              <InfoTip text={card.hint} />
            </div>
            <div className="adr-kpi__value">{formatValue(card)}</div>
            <div className={`adr-kpi__delta ${deltaTone(card)}`}>
              <span>{deltaText(card)}</span>
              <span className="adr-kpi__prev">上期 {formatPrev(card)}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
