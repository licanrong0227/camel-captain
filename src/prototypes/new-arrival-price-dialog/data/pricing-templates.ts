export type ParamKey =
  | 'purchase'
  | 'domestic'
  | 'intl'
  | 'shopDiscount'
  | 'platformLoss'
  | 'commission'
  | 'withdrawFee'
  | 'profit'
  | 'buyerShipping';

export interface PricingTemplate {
  id: string;
  name: string;
  params: ParamKey[];
  formula: string;
}

// 模板由后台「参考定价模板」统一维护，此处为演示数据
export const PRICING_TEMPLATES: PricingTemplate[] = [
  {
    id: 'tpl-1',
    name: '美国专线标准定价',
    params: ['purchase', 'domestic', 'intl', 'commission', 'withdrawFee', 'profit'],
    formula: '(#采购成本# + #国内物流成本# + #国际物流成本#) / (1 - #平台佣金率# - #平台提现手续费率# - #利润率#)',
  },
  {
    id: 'tpl-2',
    name: '活动折扣定价',
    params: ['purchase', 'intl', 'shopDiscount', 'platformLoss', 'profit'],
    formula: '(#采购成本# + #国际物流成本#) / (1 - #店铺折扣# - #平台活动折扣损耗# - #利润率#)',
  },
  {
    id: 'tpl-3',
    name: '简版成本加成定价',
    params: ['purchase', 'intl', 'profit', 'buyerShipping'],
    formula: '((#采购成本# + #国际物流成本#) * (1 + #利润率#)) - #买家运费#',
  },
];
