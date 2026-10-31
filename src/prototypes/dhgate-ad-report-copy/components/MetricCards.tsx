import React from 'react';
import { fmtDelta, fmtInt, fmtMoney, fmtPct, fmtRoas } from '../data/format';
import type { MetricCardData } from '../data/types';
import { InfoTip } from './ui';

function formatValue(card: MetricCardData): string {
  if (card.format === 'money') return fmtMoney(card.value);
  if (card.format === 'roas') return fmtRoas(card.value);
  if (card.format === 'pct') return fmtPct(card.value);
  return fmtInt(card.value);
}

function deltaTone(card: MetricCardData): string {
  if (card.delta === null || Math.abs(card.delta) < 0.0005) return 'is-flat';
  const rising = card.delta > 0;
  return rising === card.goodWhenUp ? 'is-good' : 'is-bad';
}

export function MetricCards(props: { cards: MetricCardData[]; rangeLabel: string }) {
  const primary = props.cards.slice(0, 4);
  const secondary = props.cards.slice(4);

  return (
    <section className="adr-metric-block" data-annotation-id="adr-cards">
      <div className="adr-metric-head">
        <span className="adr-metric-head__title">核心指标</span>
        <span className="adr-metric-head__range">
          统计区间 {props.rangeLabel}，对比上一等长周期
        </span>
        <InfoTip text="所有指标都按商品报表汇总，剔除的订单报表只用于成单词视图，因此花费、GMV、订单数三者口径一致。" />
      </div>

      <div className="adr-metric-grid">
        {primary.map((card) => (
          <div className="adr-metric" key={card.key}>
            <div className="adr-metric__label">{card.label}</div>
            <div className="adr-metric__value">{formatValue(card)}</div>
            <div className={`adr-metric__delta ${deltaTone(card)}`}>
              <span>{fmtDelta(card.delta)}</span>
              <span className="adr-metric__delta-note">较上期 {card.prev === null ? '-' : formatValue({ ...card, value: card.prev })}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="adr-metric-strip">
        {secondary.map((card) => (
          <div className="adr-metric-mini" key={card.key}>
            <span className="adr-metric-mini__label">{card.label}</span>
            <span className="adr-metric-mini__value">{formatValue(card)}</span>
            <span className={`adr-metric-mini__delta ${deltaTone(card)}`}>{fmtDelta(card.delta)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
