import React from 'react';
import { ChevronRight } from 'lucide-react';
import { AD_TYPE_LABEL } from '../data/types';
import { fmtInt, fmtMoney, fmtPct, fmtRoas } from '../data/format';
import type { ItemRow, PlanRow, WordRow } from '../data/types';
import { Sparkline } from './Sparkline';
import type { AdStoreRow, AdViewKey } from './adViewTypes';

function Tag({ children, tone = 'muted' }: { children: React.ReactNode; tone?: 'muted' | 'orange' }) {
  return <span className={`cc-tag is-${tone}`}>{children}</span>;
}

export function AdListCard({
  view,
  row,
  trend,
  rangeLength,
  onOpen,
}: {
  view: AdViewKey;
  row: AdStoreRow | ItemRow | PlanRow | WordRow;
  trend: number[];
  rangeLength: number;
  onOpen: () => void;
}) {
  let title = '';
  let sub = '';
  let thumb = '';
  let tags: React.ReactNode = null;
  let metrics: Array<{ label: string; value: string }> = [];

  if (view === 'store') {
    const store = row as AdStoreRow;
    title = store.storeName;
    sub = store.alias;
    const daysTag = store.daysAvailable === 0
      ? '无数据'
      : store.daysAvailable < rangeLength
        ? `数据不足 ${store.daysAvailable} 天`
        : '';
    tags = daysTag ? <Tag tone="orange">{daysTag}</Tag> : null;
    metrics = [
      { label: '广告消耗', value: fmtMoney(store.adCost) },
      { label: '广告 GMV', value: fmtMoney(store.adGmv) },
      { label: '整店 GMV', value: fmtMoney(store.storeGmv) },
      { label: '广告 GMV 占比', value: fmtPct(store.adRatio) },
      { label: '投产比', value: fmtRoas(store.roas) },
    ];
  } else if (view === 'item') {
    const item = row as ItemRow;
    title = item.name;
    sub = `${item.itemcode} · ${item.storeName}`;
    thumb = item.thumb;
    tags = (
      <>
        {item.adTypes.map((type) => <Tag key={type}>{AD_TYPE_LABEL[type]}</Tag>)}
        {item.zeroConv ? <Tag tone="orange">零转化</Tag> : null}
      </>
    );
    metrics = [
      { label: '广告消耗', value: fmtMoney(item.cost) },
      { label: '广告 GMV', value: fmtMoney(item.gmv) },
      { label: '商品 GMV', value: fmtMoney(item.productGmv) },
      { label: '广告 GMV 占比', value: fmtPct(item.adRatio) },
      { label: '投产比', value: fmtRoas(item.roas) },
    ];
  } else if (view === 'plan') {
    const plan = row as PlanRow;
    title = plan.planName;
    sub = `${plan.groupName} · ${plan.storeName}`;
    tags = (
      <>
        <Tag>{AD_TYPE_LABEL[plan.adType]}</Tag>
        {plan.zeroConv ? <Tag tone="orange">零转化</Tag> : null}
      </>
    );
    metrics = [
      { label: '广告消耗', value: fmtMoney(plan.cost) },
      { label: '广告 GMV', value: fmtMoney(plan.gmv) },
      { label: '广告订单数', value: fmtInt(plan.orders) },
      { label: '点击量', value: fmtInt(plan.click) },
      { label: '投产比', value: fmtRoas(plan.roas) },
    ];
  } else {
    const word = row as WordRow;
    title = word.word || '无搜索词（自动广告）';
    sub = word.storeName;
    tags = <>{word.adTypes.map((type) => <Tag key={type}>{AD_TYPE_LABEL[type]}</Tag>)}</>;
    metrics = [
      { label: '成单 GMV', value: fmtMoney(word.gmv) },
      { label: '订单数', value: fmtInt(word.orderCount) },
      { label: '涉及商品数', value: fmtInt(word.itemCount) },
      { label: '最近成单日', value: word.lastDate ? word.lastDate.slice(5).replace('-', '/') : '-' },
    ];
  }

  const titleClamp = view === 'item' || view === 'plan';

  return (
    <button type="button" className="cc-ad-card" onClick={onOpen}>
      <div className="cc-ad-head">
        {thumb ? <img className="cc-ad-thumb" src={thumb} alt="" /> : null}
        <div className="cc-ad-title-wrap">
          <div className={`cc-ad-title${titleClamp ? ' is-clamp' : ''}`}>{title}</div>
          <div className="cc-ad-sub">{sub}</div>
          {tags ? <div className="cc-ad-tags">{tags}</div> : null}
        </div>
        <Sparkline values={trend} width={62} height={20} />
      </div>
      <div className="cc-ad-metrics">
        {metrics.map((metric) => (
          <div className="cc-ad-metric" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </div>
        ))}
      </div>
      <div className="cc-ad-foot">
        <span>明细</span>
        <ChevronRight size={14} />
      </div>
    </button>
  );
}
