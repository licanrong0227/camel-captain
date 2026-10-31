/**
 * 商品合规检测 - 检测项、结果场景与展示数据
 * 检测项、状态语义与结果结构沿用 dhgate-compliance-check 原型；
 * 算力统一用 xx 占位（实际消耗以后端定价为准）。
 */

export type ComplianceItemCode = 'material' | 'size' | 'ipr' | 'category' | 'price' | 'legal';

export type ComplianceScenario = 'all-pass' | 'mixed';

export type ComplianceItemStatus = 'pass' | 'violation' | 'suspect' | 'fail';

/** 演示控件：单张卡片临时切换展示的状态 */
export type ItemPreview = 'pass' | 'issue' | 'fail';

export type ComplianceImageKey = 'main1' | 'main2' | 'detail2' | 'detail3';

export interface ComplianceHit {
  severity: 'violation' | 'suspect';
  /** 为什么违规：一句话说明触发的规则 */
  reason: string;
  /** 命中位置，如「商品标题」「主图 2」「产品属性 · 材质」 */
  location: string;
  /** 命中的原文；图片类错误填图片识别内容 */
  content: string;
  /** 命中的关键词，用于高亮与列示 */
  keywords?: string[];
  /** 图片类错误：命中的图片，展示缩略图并可看大图 */
  image?: ComplianceImageKey;
  /** 图片来源说明，如「首张主图 / 主图 / 详情图」，不带序号 */
  imageLabel?: string;
  /** 有建议时给一条 */
  suggestion?: string;
}

export interface ComplianceOutcome {
  status: ComplianceItemStatus;
  conclusion: string;
  /** 违规 / 疑似违规的逐条结果；同一项可有多个 */
  hits?: ComplianceHit[];
  /** 仅检测失败 */
  failReason?: string;
}

export interface ComplianceItemDef {
  code: ComplianceItemCode;
  name: string;
  target: string;
  /** 检测规则，用于标注说明 */
  rule: string;
}

export interface ComplianceFeedback {
  reasons: string[];
  text?: string;
}

export interface ComplianceRound {
  at: number;
  outcome: ComplianceOutcome;
}

export interface ComplianceItemRun {
  code: ComplianceItemCode;
  outcome: ComplianceOutcome;
  at: number;
  /** 该项历次检测，从早到晚；当前轮不在这里 */
  history: ComplianceRound[];
  /** key 固定为 `${code}:${命中序号}` */
  feedback: Record<string, ComplianceFeedback>;
}

/** 算力占位文案 */
export const COST_LABEL = 'xx';

export const ITEM_DEFS: ComplianceItemDef[] = [
  {
    code: 'material',
    name: '材质检测',
    target: '产品属性、首张主图',
    rule: '检查材质属性是否填写、取值是否有效，并与首张主图识别出的材质比对。',
  },
  {
    code: 'size',
    name: '尺码检测',
    target: 'SKU 规格、尺码模板、详情图尺码表',
    rule: '检查尺码信息是否有效、系统尺码模板与详情尺码表是否一致、在售尺码是否与尺码表匹配。',
  },
  {
    code: 'ipr',
    name: '知识产权侵权风险检查',
    target: '标题、主图、SKU 图',
    rule: '检查商品文字和图片中是否出现侵权词、高危品牌词或品牌 logo。',
  },
  {
    code: 'category',
    name: '类目错放检查',
    target: '首张主图、类目路径',
    rule: '当前类目需与商品类型兼容；存在更匹配类目时提示调整。',
  },
  {
    code: 'price',
    name: '价格违规检查',
    target: 'SKU 价格、阶梯价',
    rule: '最低价低于最高价 × 10% 即判定违规，批发阶梯价取区间端点计算。',
  },
  {
    code: 'legal',
    name: '违法违规检查',
    target: '商品文字与图片',
    rule: '依据禁售、限售规则库逐项比对；命中禁售判违规，限售只召回规则与资质要求。',
  },
];

export const STATUS_TEXT: Record<ComplianceItemStatus, string> = {
  pass: '通过',
  violation: '违规',
  suspect: '疑似错误',
  fail: '检测失败',
};

const PASS: Record<ComplianceItemCode, ComplianceOutcome> = {
  material: { status: 'pass', conclusion: '材质属性填写有效，与首张主图识别材质一致。' },
  size: { status: 'pass', conclusion: '该类目不要求尺码信息，检测通过。' },
  ipr: { status: 'pass', conclusion: '未检测到侵权词、高危品牌词与品牌 logo。' },
  category: { status: 'pass', conclusion: '当前类目与商品类型匹配，未发现更匹配类目。' },
  price: { status: 'pass', conclusion: 'SKU 价格与阶梯价区间校验通过。' },
  legal: { status: 'pass', conclusion: '未命中禁售、限售或赌博类规则。' },
};

const failOutcome = (failReason: string): ComplianceOutcome => ({
  status: 'fail',
  conclusion: '检测未完成',
  failReason,
});

const PRODUCT_TITLE =
  'Hot Selling S26 5G Smartphone 16GB+1TB Unlocked Android HD Camera GPS Dual SIM Cheap Mobile Phone S25 Ultra';

/** 违规 / 疑似违规的示例结果（同一项可有多条，含文字与图片检出） */
const ISSUE_SAMPLE: Record<ComplianceItemCode, ComplianceOutcome> = {
  material: {
    status: 'suspect',
    conclusion: '材质属性与主图不一致',
    hits: [
      {
        severity: 'suspect',
        reason: '属性材质填「塑料」，首张主图识别为「金属边框」，两者不一致，可能误导买家',
        location: '产品属性 · 材质',
        content: '属性材质填「塑料」，主图 1 识别为「金属边框」',
        keywords: ['塑料', '金属边框'],
        image: 'main1',
        imageLabel: '首张主图',
        suggestion: '按实拍图更新材质属性，保持图文一致',
      },
    ],
  },
  size: {
    status: 'violation',
    conclusion: '在售尺码与尺码模板不一致',
    hits: [
      {
        severity: 'violation',
        reason: '在售尺码不在系统尺码模板内，会造成尺码信息无法与模板对齐',
        location: 'SKU 规格 · Options',
        content: '在售尺码：EU 40、EU 41、EU 42',
        keywords: ['EU 40'],
        suggestion: '删除模板外的尺码，或先在尺码模板中补全该尺码',
      },
      {
        severity: 'suspect',
        reason: '详情图尺码表只列出 S / M / L，与在售尺码缺少对应关系，买家无法判断该买哪个码',
        location: '详情图',
        content: '详情图尺码表只列出 S / M / L',
        imageLabel: '详情图',
        keywords: ['S / M / L'],
        image: 'detail2',
        suggestion: '在详情图补充完整尺码对照表后重新检测',
      },
    ],
  },
  ipr: {
    status: 'violation',
    conclusion: '标题与主图存在侵权风险',
    hits: [
      {
        severity: 'violation',
        reason: '标题包含高危品牌型号词，属于知识产权侵权风险',
        location: '商品标题',
        content: PRODUCT_TITLE,
        keywords: ['S25 Ultra'],
        suggestion: '删除标题中的品牌型号词，改为自有型号描述后重新检测',
      },
      {
        severity: 'violation',
        reason: '标题包含高危品牌型号词，属于知识产权侵权风险',
        location: '商品标题',
        content: PRODUCT_TITLE,
        keywords: ['S26'],
        suggestion: '同一条标题中的多个命中需一并修改',
      },
      {
        severity: 'suspect',
        reason: '主图识别到「SAMSUNG」字形标识，存在知识产权侵权风险',
        location: '主图',
        content: '识别为「SAMSUNG」字形标识',
        imageLabel: '主图',
        keywords: ['SAMSUNG'],
        image: 'main2',
        suggestion: '更换不含品牌标识的主图',
      },
    ],
  },
  category: {
    status: 'suspect',
    conclusion: '类目与商品类型可能不匹配',
    hits: [
      {
        severity: 'suspect',
        reason: '当前类目与主图呈现的商品类型不一致，可能导致类目错放',
        location: '类目',
        content: '当前类目：手机和手机附件 < 手机',
        keywords: ['手机'],
        suggestion: '核对商品类型后调整类目，或确认外观样式描述',
      },
    ],
  },
  price: {
    status: 'violation',
    conclusion: '存在低于价格阈值 10% 的 SKU',
    hits: [
      {
        severity: 'violation',
        reason: '最低价低于最高价的 10%，属于价格违规',
        location: '价格 USD · SKU 表',
        content: 'Black / AU 16+1TB 实际收入 $2.06，最高价 SKU 实际收入 $103.27，阈值 $10.33',
        keywords: ['$2.06', '$10.33'],
        suggestion: '将最低价 SKU 的实际收入调整到 $10.33 以上后重新检测',
      },
    ],
  },
  legal: {
    status: 'violation',
    conclusion: '详情图存在导流信息',
    hits: [
      {
        severity: 'violation',
        reason: '详情图识别出「www.example-deals.com」与扫码二维码，命中平台导流规则',
        location: '详情图',
        content: '识别出「www.example-deals.com」与一个二维码',
        imageLabel: '详情图',
        keywords: ['www.example-deals.com', '二维码'],
        image: 'detail3',
        suggestion: '移除详情图中的外部网址与二维码后重新检测',
      },
    ],
  },
};

const FAIL_SAMPLE: Record<ComplianceItemCode, ComplianceOutcome> = {
  material: failOutcome('图片识别服务暂不可用，本次未生成结果'),
  size: failOutcome('尺码模板数据读取超时，本次未生成结果'),
  ipr: failOutcome('图片文字识别服务暂不可用，本次未生成结果'),
  category: failOutcome('类目匹配服务暂不可用，本次未生成结果'),
  price: failOutcome('SKU 价格数据解析异常，本次未生成结果'),
  legal: failOutcome('规则库比对服务暂不可用，本次未生成结果'),
};

const MIXED: Partial<Record<ComplianceItemCode, ComplianceOutcome>> = {
  material: ISSUE_SAMPLE.material,
  ipr: ISSUE_SAMPLE.ipr,
  price: failOutcome('SKU 价格数据解析异常，本次未生成检测结果'),
  legal: ISSUE_SAMPLE.legal,
};

const RETRY: Partial<Record<ComplianceItemCode, ComplianceOutcome>> = {
  material: { status: 'pass', conclusion: '已按主图实拍补充材质并保持一致，检测通过。' },
  ipr: { status: 'pass', conclusion: '已移除标题与主图中的风险内容，未再命中词库。' },
  legal: { status: 'pass', conclusion: '详情图中的外部网址与扫码信息已移除，检测通过。' },
  price: ISSUE_SAMPLE.price,
};

export function getOutcome(scenario: ComplianceScenario, code: ComplianceItemCode): ComplianceOutcome {
  if (scenario === 'mixed') {
    return MIXED[code] ?? PASS[code];
  }
  return PASS[code];
}

export function getRetryOutcome(scenario: ComplianceScenario, code: ComplianceItemCode): ComplianceOutcome {
  if (scenario === 'mixed') {
    return RETRY[code] ?? PASS[code];
  }
  return PASS[code];
}

/** 标注面板里按卡片切换状态时使用的示例结果 */
export function getPreviewOutcome(code: ComplianceItemCode, preview: ItemPreview): ComplianceOutcome {
  if (preview === 'pass') return PASS[code];
  if (preview === 'fail') return FAIL_SAMPLE[code];
  return ISSUE_SAMPLE[code];
}

export interface ComplianceSummary {
  level: 'pass' | 'issue';
  text: string;
  counts: Record<ComplianceItemStatus, number>;
}

export function summarize(items: { outcome: ComplianceOutcome }[]): ComplianceSummary {
  const counts: Record<ComplianceItemStatus, number> = { pass: 0, violation: 0, suspect: 0, fail: 0 };
  items.forEach((item) => {
    counts[item.outcome.status] += 1;
  });
  const parts: string[] = [];
  if (counts.violation) parts.push(`${counts.violation} 项违规`);
  if (counts.suspect) parts.push(`${counts.suspect} 项疑似违规`);
  if (counts.fail) parts.push(`${counts.fail} 项检测失败`);
  if (parts.length === 0) {
    return { level: 'pass', text: '全部检测通过', counts };
  }
  return { level: 'issue', text: `未通过：${parts.join('、')}`, counts };
}

export function fmtTime(at: number): string {
  const date = new Date(at);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export const DISLIKE_REASONS = ['误报', '漏报', '原因不准', '建议不准', '其他'];
