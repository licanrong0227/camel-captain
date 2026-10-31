import { PRODUCT_IMAGES, createRng, dayOffset, intBetween, makeCode, pick, shortTitle } from './util';

export interface LastMileRecord {
  id: string;
  trackingNo: string;
  orderNo: string;
  carrier: string;
  status: string;
  signedAt: string;
  signer: string;
  postcode: string;
  credential: string;
}

export interface ExchangeRate {
  code: string;
  name: string;
  rate: number;
  buy: number;
  sell: number;
  updatedAt: string;
}

export interface QualityIssue {
  level: '严重' | '一般' | '建议';
  field: string;
  issue: string;
  suggestion: string;
}

export interface QualityReport {
  id: string;
  itemId: string;
  title: string;
  image: string;
  score: number;
  level: string;
  checkedAt: string;
  dimensions: Array<{ name: string; score: number }>;
  issues: QualityIssue[];
}

export const LAST_MILE_RECORDS: LastMileRecord[] = (() => {
  const rng = createRng(20261109);
  return Array.from({ length: 40 }, (_, index) => ({
    id: makeCode('LM', index, 6),
    trackingNo: `YT${makeCode('', index + 99002000, 10)}`,
    orderNo: `20${makeCode('', index + 26003000, 8)}`,
    carrier: pick(rng, ['华磊物流', '云途物流', '燕文物流', '递四方']),
    status: pick(rng, ['已签收', '已签收', '派送中', '签收失败']),
    signedAt: dayOffset(intBetween(rng, -20, 0), intBetween(rng, 8, 20), intBetween(rng, 0, 59)),
    signer: pick(rng, ['Emily Johnson', 'Michael Brown', 'Sophia Davis', 'James Wilson', '本人签收']),
    postcode: `${intBetween(rng, 10000, 99999)}`,
    credential: '签收凭证',
  }));
})();

export const EXCHANGE_RATES: ExchangeRate[] = [
  { code: 'USD', name: '美元', rate: 7.1245, buy: 7.1021, sell: 7.1469, updatedAt: '2026-10-31 09:30:00' },
  { code: 'EUR', name: '欧元', rate: 7.7312, buy: 7.7068, sell: 7.7556, updatedAt: '2026-10-31 09:30:00' },
  { code: 'GBP', name: '英镑', rate: 9.0218, buy: 8.9932, sell: 9.0504, updatedAt: '2026-10-31 09:30:00' },
  { code: 'JPY', name: '日元', rate: 0.0472, buy: 0.047, sell: 0.0474, updatedAt: '2026-10-31 09:30:00' },
  { code: 'CAD', name: '加元', rate: 5.1428, buy: 5.1264, sell: 5.1592, updatedAt: '2026-10-31 09:30:00' },
  { code: 'AUD', name: '澳元', rate: 4.6715, buy: 4.6566, sell: 4.6864, updatedAt: '2026-10-31 09:30:00' },
  { code: 'HKD', name: '港币', rate: 0.9146, buy: 0.9118, sell: 0.9174, updatedAt: '2026-10-31 09:30:00' },
  { code: 'CNY', name: '人民币', rate: 1, buy: 1, sell: 1, updatedAt: '2026-10-31 09:30:00' },
];

const ISSUE_POOL: QualityIssue[] = [
  { level: '严重', field: '主图', issue: '主图分辨率低于平台要求（< 800×800）', suggestion: '替换为 1000×1000 以上白底主图' },
  { level: '严重', field: '标题', issue: '标题包含侵权品牌词 "Nike"', suggestion: '删除品牌词并重新提交审核' },
  { level: '一般', field: '属性', issue: '缺少材质、适用人群两项必填属性', suggestion: '在编辑产品中补充属性值' },
  { level: '一般', field: '描述', issue: '详情描述纯文本，缺少尺码表', suggestion: '套用详情模板并补充尺码表' },
  { level: '建议', field: '价格', issue: '售价比同类目均价低 18%', suggestion: '确认是否参与低价引流策略' },
  { level: '建议', field: '图片', issue: '详情图数量少于 3 张', suggestion: '增加到 5 张以上展示细节' },
  { level: '严重', field: '标题', issue: '标题长度超过 128 字符', suggestion: '精简到 70–120 字符' },
  { level: '一般', field: 'SKU', issue: '存在 2 个未命名 SKU', suggestion: '补全颜色/尺码规格名称' },
];

export const QUALITY_REPORTS: QualityReport[] = (() => {
  const rng = createRng(20261110);
  return Array.from({ length: 26 }, (_, index) => {
    const score = intBetween(rng, 48, 96);
    const dims = [
      { name: '标题', score: intBetween(rng, 50, 100) },
      { name: '图片', score: intBetween(rng, 45, 100) },
      { name: '属性', score: intBetween(rng, 55, 100) },
      { name: '描述', score: intBetween(rng, 40, 100) },
      { name: '价格', score: intBetween(rng, 60, 100) },
    ];
    const issueCount = score < 60 ? 3 : score < 80 ? 2 : 1;
    return {
      id: makeCode('Q', index, 6),
      itemId: `10${makeCode('', index + 20260000, 8)}`,
      title: shortTitle(rng),
      image: PRODUCT_IMAGES[index % PRODUCT_IMAGES.length],
      score,
      level: score >= 85 ? '优秀' : score >= 70 ? '良好' : score >= 60 ? '待优化' : '不合格',
      checkedAt: dayOffset(intBetween(rng, -15, 0), intBetween(rng, 8, 20), intBetween(rng, 0, 59)),
      dimensions: dims,
      issues: Array.from({ length: issueCount }, (_, issueIndex) => ISSUE_POOL[(index + issueIndex) % ISSUE_POOL.length]),
    };
  });
})();
