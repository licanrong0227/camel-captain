/**
 * 敦煌网商品合规检测 - 质检项模拟场景数据
 * 全部为前端演示数据，依据 PRD 8.1-8.6 展示规范。
 */

export type ItemCode = 'material' | 'size' | 'ipr' | 'category' | 'price' | 'legal';

export type ImageKey = 'suit' | 'bag' | 'dress' | 'tee' | 'sneaker' | 'size-chart';

export interface TextBox {
  x: number; // 百分比
  y: number;
  w: number;
  h: number;
  label: string;
}

export type Block =
  | { kind: 'text'; label?: string; field: string; fragment: string; word?: string }
  | { kind: 'list'; label: string; items: string[] }
  | { kind: 'image'; label: string; src: ImageKey; boxes?: TextBox[]; caption?: string }
  | { kind: 'ocr'; label: string; lines: { text: string; hit?: boolean }[] }
  | { kind: 'table'; label: string; columns: string[]; rows: { cells: string[]; bad?: number[] }[] }
  | { kind: 'formula'; label: string; lines: string[]; result?: string };

export type OutcomeStatus = 'pass' | 'violation' | 'suspect' | 'manual' | 'fail';

export interface ItemOutcome {
  status: OutcomeStatus;
  conclusion: string;
  hitReason?: string;
  hitPosition?: string;
  suggestion?: string;
  suggestionValue?: string;
  reference?: Block[];
  detail?: Block[];
  failReason?: string;
}

export interface ItemDef {
  code: ItemCode;
  name: string;
  group: string;
  target: string;
  rule: string;
}

export const ITEM_DEFS: ItemDef[] = [
  {
    code: 'material',
    name: '材质检测',
    group: '商品信息规范检查',
    target: '属性、首张主图',
    rule: '校验已填写的材质属性值是否合法（非空、非 null/n/a、非无意义值、非借用非材质描述词），且与首张主图 AI 识别的材质一致；类目材质属性通过属性库关键词匹配。',
  },
  {
    code: 'size',
    name: '尺码检测',
    group: '商品信息规范检查',
    target: 'SKU 尺码、系统尺码模板、详情图尺码表',
    rule: '校验已采集的 SKU 尺码、系统尺码表、详情尺码表：尺码行/列值是否合法（标签与参数非空、非 0/null/纯符号），系统与详情经单位归一化后是否一致。',
  },
  {
    code: 'ipr',
    name: '知识产权侵权风险检查',
    group: '知识产权',
    target: '文字、图片 + 全图 OCR 文本 + AI 图片特征',
    rule: '不得命中侵权词库、高危品牌词、品牌 logo；识别涂抹痕迹与混淆词。',
  },
  {
    code: 'category',
    name: '类目错放检查',
    group: '类目',
    target: '首张主图',
    rule: '当前类目需与商品类型兼容；存在更匹配类目时提示调整。',
  },
  {
    code: 'price',
    name: '价格违规检查',
    group: '价格',
    target: 'SKU 价格、批发阶梯价',
    rule: '最低价需 ≥ 最高价 × 10%；批发阶梯价取区间端点计算。',
  },
  {
    code: 'legal',
    name: '违法违规检查',
    group: '违法违规',
    target: '文字、图片 + 全图 OCR 文本 + AI 图片特征',
    rule: '依据禁售/限售产品管理规则、赌博网站与赌博机词库、网址库、图片库。',
  },
];

const PASS: Partial<Record<ItemCode, ItemOutcome>> = {
  material: { status: 'pass', conclusion: '材质属性值合法，且与首张主图识别的材质一致。' },
  size: { status: 'pass', conclusion: '已采集的 SKU 尺码、系统尺码表与详情尺码表数据有效且一致。' },
  ipr: { status: 'pass', conclusion: '未命中侵权词、高危品牌词与品牌 logo。' },
  category: { status: 'pass', conclusion: '当前类目与商品类型兼容，未发现更匹配类目。' },
  price: { status: 'pass', conclusion: '最低价不低于最高价 × 10%，批发阶梯价校验通过。' },
  legal: { status: 'pass', conclusion: '未命中禁售、限售及赌博类规则。' },
};

export type ScenarioKey = 'default' | 'all-pass' | 'sneaker-partial' | 'dress' | 'tee-ipr';

export interface ScenarioDef {
  outcomes: Partial<Record<ItemCode, ItemOutcome>>;
  retryOutcomes?: Partial<Record<ItemCode, ItemOutcome>>;
}

export const SCENARIOS: Record<ScenarioKey, ScenarioDef> = {
  'all-pass': { outcomes: {} },

  default: {
    outcomes: {
      material: {
        status: 'violation',
        conclusion: '材质属性值为空',
        hitReason: '已检测到「Material」属性字段，但取值为空（n/a），属于无效材质描述',
        hitPosition: '商品属性区 · Material',
        suggestion: '补充 Material 字段取值，建议值：聚酯纤维（Polyester）',
        suggestionValue: 'Polyester（聚酯纤维）',
        reference: [
          {
            kind: 'text',
            field: '商品属性',
            fragment: 'Material: n/a ｜ Style: Formal ｜ Collar: Notch Lapel ｜ Closure: Single Button',
            word: 'Material: n/a',
          },
          { kind: 'list', label: '命中的材质类属性关键词', items: ['Material'] },
        ],
        detail: [
          {
            kind: 'image',
            label: '首张主图',
            src: 'suit',
            caption: 'AI 识别主图材质：化纤/聚酯纤维（置信度 0.86），可作为补充取值参考',
          },
        ],
      },
      size: {
        status: 'suspect',
        conclusion: '尺码表校验不完整，疑似错误，建议人工审核',
        hitReason: '详情图尺码表 OCR 识别置信度过低（0.42），无法与系统尺码模板比对',
        hitPosition: '详情图第 3 张',
        suggestion: '人工核对详情图尺码表；如图片模糊请重新上传清晰尺码表图',
        reference: [
          {
            kind: 'image',
            label: '详情图尺码表',
            src: 'size-chart',
            boxes: [{ x: 8, y: 58, w: 84, h: 26, label: 'OCR 置信度 0.42，Sleeve 列无法判读' }],
          },
          {
            kind: 'ocr',
            label: 'OCR 识别文本（片段）',
            lines: [
              { text: 'SIZE CHART (cm)' },
              { text: 'S  Chest 96  Shoulder 42  Sleeve --  Length 72' , hit: true },
              { text: 'M  Chest 100 Shoulder 44  Sleeve --  Length 74', hit: true },
              { text: 'L  Chest 104 Shoulder 46  Sleeve 60  Length 76' },
            ],
          },
        ],
        detail: [
          {
            kind: 'table',
            label: 'SKU 销售尺码 vs 系统尺码模板',
            columns: ['SKU 尺码', '系统模板', '比对结果'],
            rows: [
              { cells: ['S', 'S', '一致'] },
              { cells: ['M', 'M', '一致'] },
              { cells: ['L', 'L', '一致'] },
              { cells: ['XL', 'XL', '详情表缺失该列，无法比对'] },
            ],
          },
        ],
      },
      category: {
        status: 'violation',
        conclusion: '类目错放：存在更匹配类目',
        hitReason: '主图识别为西装（Suit），当前类目「男士外套」与商品类型兼容性弱，存在更高匹配类目',
        hitPosition: '首张主图 / 类目路径',
        suggestion: '调整商品类目为：服装 > 男装 > 男士西装',
        suggestionValue: '服装 > 男装 > 男士西装',
        reference: [
          { kind: 'text', field: '当前类目', fragment: '服装 > 男装 > 男士外套', word: '男士外套' },
          { kind: 'list', label: 'AI 识别商品类型关键词', items: ['suit jacket', 'two-piece', 'lapel', 'formal'] },
        ],
        detail: [
          {
            kind: 'table',
            label: '类目匹配度对比',
            columns: ['候选类目', '匹配度', '结论'],
            rows: [
              { cells: ['服装 > 男装 > 男士西装', '0.94', '推荐'], bad: [] },
              { cells: ['服装 > 男装 > 男士外套', '0.61', '当前类目'], bad: [1, 2] },
            ],
          },
        ],
      },
      price: {
        status: 'violation',
        conclusion: '批发阶梯价最低档低于阈值',
        hitReason: '批发阶梯最低价 $8.9 < 最高价 $99 × 10%（$9.9）',
        hitPosition: '批发阶梯价第 4 档',
        suggestion: '将阶梯第 4 档单价调整为 ≥ $9.9，或收紧价格区间跨度',
        suggestionValue: '$9.90',
        reference: [
          {
            kind: 'table',
            label: '批发阶梯价',
            columns: ['档位', '数量', '单价', '校验'],
            rows: [
              { cells: ['1', '≥1 件', '$12.50', '通过'] },
              { cells: ['2', '≥10 件', '$11.20', '通过'] },
              { cells: ['3', '≥50 件', '$10.40', '通过'] },
              { cells: ['4', '≥200 件', '$8.90', '低于阈值'], bad: [2, 3] },
            ],
          },
        ],
        detail: [
          {
            kind: 'formula',
            label: '阈值公式',
            lines: ['最高价 = $99.00（SKU 零售区间上限）', '阈值 = 最高价 × 10% = $9.90', '命中最低价 = $8.90（阶梯第 4 档）'],
            result: '$8.90 < $9.90，命中价格违规',
          },
        ],
      },
    },
  },

  'sneaker-partial': {
    outcomes: {
      ipr: {
        status: 'violation',
        conclusion: '图片命中品牌 logo 特征',
        hitReason: '侧面鞋身识别到近似某品牌 monogram 图案，相似度 0.91',
        hitPosition: '主图右侧鞋身',
        suggestion: '更换不含品牌近似图案的主图与详情图，或删除相关印花',
        reference: [
          {
            kind: 'image',
            label: '命中图片',
            src: 'sneaker',
            boxes: [{ x: 46, y: 34, w: 34, h: 22, label: 'logo 特征相似度 0.91' }],
          },
          { kind: 'list', label: '命中图库', items: ['品牌 logo 图库 · 系列 A（相似度 0.91）', '高危品牌词库 · 「monogram」'] },
        ],
        detail: [
          {
            kind: 'ocr',
            label: '图片 OCR 文本',
            lines: [{ text: 'FASHION SNEAKERS' }, { text: '★★ ★★ ★★ (疑似品牌图案区域)', hit: true }],
          },
        ],
      },
      price: {
        status: 'fail',
        conclusion: '价格子流程检测失败',
        failReason: '批发阶梯价数据解析异常（接口返回字段缺失），未产生结果',
      },
    },
    retryOutcomes: {
      price: {
        status: 'violation',
        conclusion: '重试后命中：SKU 最低价低于阈值',
        hitReason: 'SKU 最低价 $9.2 < 最高价 $89 × 10%（$8.9）阈值边界内但批发档 $8.5 低于阈值',
        hitPosition: '批发阶梯价第 3 档',
        suggestion: '调整批发第 3 档单价 ≥ $8.90',
        suggestionValue: '$8.90',
        reference: [
          {
            kind: 'formula',
            label: '阈值公式',
            lines: ['最高价 = $89.00', '阈值 = $8.90', '命中最低价 = $8.50（阶梯第 3 档）'],
            result: '$8.50 < $8.90，命中价格违规',
          },
        ],
      },
    },
  },

  dress: {
    outcomes: {
      category: {
        status: 'violation',
        conclusion: '类目错放：存在更匹配类目',
        hitReason: '主图识别为连衣裙，当前类目「半身裙」不匹配',
        hitPosition: '首张主图 / 类目路径',
        suggestion: '调整商品类目为：服装 > 女装 > 连衣裙',
        suggestionValue: '服装 > 女装 > 连衣裙',
        reference: [{ kind: 'text', field: '当前类目', fragment: '服装 > 女装 > 半身裙', word: '半身裙' }],
        detail: [{ kind: 'image', label: '首张主图', src: 'dress', caption: 'AI 识别：连衣裙（一体式裙装，置信度 0.93）' }],
      },
      price: {
        status: 'suspect',
        conclusion: '部分 SKU 价格缺失，疑似错误，建议人工审核',
        hitReason: 'SKU「XL 码」价格为空，无法参与最高/最低价计算',
        suggestion: '人工确认 XL 码 SKU 价格后重新检测',
        reference: [
          {
            kind: 'table',
            label: 'SKU 价格明细',
            columns: ['SKU', '价格', '状态'],
            rows: [
              { cells: ['S', '$14.90', '有效'] },
              { cells: ['M', '$14.90', '有效'] },
              { cells: ['L', '$15.90', '有效'] },
              { cells: ['XL', '-', '价格缺失'], bad: [1, 2] },
            ],
          },
        ],
      },
    },
  },

  'tee-ipr': {
    outcomes: {
      ipr: {
        status: 'violation',
        conclusion: '文字与图片均命中侵权风险',
        hitReason: '标题命中高危品牌词；主图领口区域存在涂抹痕迹',
        hitPosition: '商品标题 / 主图领口',
        suggestion: '删除标题中的品牌相关词，更换无涂抹痕迹的主图',
        reference: [
          {
            kind: 'text',
            field: '商品标题',
            fragment: 'Premium Cotton Tee, Gucci Style Streetwear, Vintage Print',
            word: 'Gucci Style',
          },
          {
            kind: 'image',
            label: '主图涂抹痕迹',
            src: 'tee',
            boxes: [{ x: 40, y: 12, w: 22, h: 12, label: '疑似涂抹痕迹（像素方差异常）' }],
          },
          {
            kind: 'ocr',
            label: '详情图 OCR 文本',
            lines: [{ text: 'URBAN CLASSIC 1921', hit: true }, { text: 'HANDMADE QUALITY' }],
          },
          { kind: 'list', label: '词库类型', items: ['高危品牌词库 · Gucci（风险等级：高）', '混淆词类型 · 风格词捆绑（「Style」紧跟品牌词）'] },
        ],
        detail: [
          {
            kind: 'table',
            label: '命中明细',
            columns: ['位置', '命中对象', '词库', '风险等级'],
            rows: [
              { cells: ['标题', 'Gucci Style', '高危品牌词', '高'], bad: [1, 2, 3] },
              { cells: ['主图领口', '涂抹痕迹', '图片特征模型', '高'], bad: [1, 2, 3] },
              { cells: ['详情图 OCR', 'CLASSIC 1921', '混淆词库', '中'], bad: [1, 2, 3] },
            ],
          },
        ],
      },
      material: {
        status: 'suspect',
        conclusion: '主图材质无法判读，疑似错误，建议人工审核',
        hitReason: '主图印花区域反光，材质特征置信度 0.38 低于判定阈值',
        suggestion: '人工确认材质属性描述（当前填写：Cotton）',
        reference: [{ kind: 'image', label: '首张主图', src: 'tee', boxes: [{ x: 30, y: 40, w: 40, h: 30, label: '反光区域，材质判读置信度 0.38' }] }],
      },
    },
  },
};

export function getOutcome(scenario: ScenarioKey, code: ItemCode, retry = false): ItemOutcome {
  const def = SCENARIOS[scenario];
  if (retry && def.retryOutcomes?.[code]) return def.retryOutcomes[code]!;
  return def.outcomes[code] ?? PASS[code] ?? { status: 'pass', conclusion: '检测通过。' };
}
