import { ItemCode, ItemOutcome } from './scenarios';

export type PreviewStatus = 'pass' | 'violation' | 'suspect';

export interface PreviewScenario {
  value: string;
  label: string;
  status: PreviewStatus;
  outcome: ItemOutcome;
}

export const PREVIEW_SCENARIOS: Record<ItemCode, PreviewScenario[]> = {
  material: [
    {
      value: 'pass',
      label: '通过',
      status: 'pass',
      outcome: { status: 'pass', conclusion: '材质属性值合法，且与首张主图识别的材质一致。' },
    },
    {
      value: 'value_missing',
      label: '违规·属性值缺失',
      status: 'violation',
      outcome: {
        status: 'violation',
        conclusion: '材质属性值为空',
        hitReason: '已检测到「Material」属性字段，但取值为空，属于无效材质描述',
        hitPosition: '商品属性区 · Material',
        suggestion: '补充 Material 字段取值，建议值：聚酯纤维（Polyester）',
        suggestionValue: 'Polyester（聚酯纤维）',
        reference: [
          { kind: 'text', field: '商品属性', fragment: 'Material: (空) ｜ Style: Formal ｜ Collar: Notch Lapel', word: 'Material: (空)' },
        ],
      },
    },
    {
      value: 'value_wrong',
      label: '违规·属性值错误',
      status: 'violation',
      outcome: {
        status: 'violation',
        conclusion: '材质属性与主图实物不符',
        hitReason: '属性填写为「Wool 100%」，AI 识别主图面料呈化纤光泽与硬挺垂感，与羊毛质感不符',
        hitPosition: '商品属性区 / 首张主图',
        suggestion: '核实实物材质，将属性修正为与主图一致（建议：聚酯纤维 Polyester）',
        suggestionValue: 'Polyester（聚酯纤维）',
        reference: [
          { kind: 'text', field: '商品属性', fragment: 'Material: Wool 100%', word: 'Wool 100%' },
          { kind: 'image', label: '首张主图', src: 'suit', boxes: [{ x: 18, y: 22, w: 64, h: 56, label: '面料反光呈化纤特征，置信度 0.86' }] },
          { kind: 'list', label: 'AI 识别面料关键词', items: ['化纤光泽', '硬挺垂感', '无明显羊毛绒感'] },
        ],
      },
    },
    {
      value: 'suspect',
      label: '疑似违规',
      status: 'suspect',
      outcome: {
        status: 'suspect',
        conclusion: '主图材质无法判读，疑似错误，建议人工审核',
        hitReason: '主图印花区域反光，材质特征置信度 0.38 低于判定阈值',
        hitPosition: '首张主图',
        suggestion: '人工核对材质属性描述；如图片反光请重新上传清晰主图',
        reference: [
          { kind: 'image', label: '首张主图', src: 'suit', boxes: [{ x: 30, y: 40, w: 40, h: 30, label: '反光区域，材质判读置信度 0.38' }] },
        ],
      },
    },
  ],

  size: [
    {
      value: 'pass',
      label: '通过',
      status: 'pass',
      outcome: { status: 'pass', conclusion: '已采集的 SKU 尺码、系统尺码表与详情尺码表数据有效且一致。' },
    },
    {
      value: 'table_mismatch',
      label: '违规·尺码表不一致',
      status: 'violation',
      outcome: {
        status: 'violation',
        conclusion: '详情尺码表与系统模板不一致',
        hitReason: '详情表 L 码胸围 112cm，系统模板 108cm，超出容差 ±2cm',
        hitPosition: '详情图尺码表 · L 码',
        suggestion: '以实物测量为准，修正详情尺码表或系统尺码模板',
        reference: [
          {
            kind: 'table',
            label: '胸围比对（cm）',
            columns: ['尺码', '系统模板', '详情表', '差异'],
            rows: [
              { cells: ['S', '96', '96', '0'] },
              { cells: ['M', '102', '102', '0'] },
              { cells: ['L', '108', '112', '+4'], bad: [1, 2, 3] },
              { cells: ['XL', '114', '114', '0'] },
            ],
          },
        ],
      },
    },
    {
      value: 'suspect',
      label: '疑似违规',
      status: 'suspect',
      outcome: {
        status: 'suspect',
        conclusion: '尺码表校验不完整，疑似错误，建议人工审核',
        hitReason: '详情图尺码表 OCR 识别置信度过低（0.42），无法与系统尺码模板比对',
        hitPosition: '详情图第 3 张',
        suggestion: '人工核对详情图尺码表；如图片模糊请重新上传清晰尺码表图',
        reference: [
          { kind: 'image', label: '详情图尺码表', src: 'size-chart', boxes: [{ x: 8, y: 58, w: 84, h: 26, label: 'OCR 置信度 0.42，Sleeve 列无法判读' }] },
          { kind: 'ocr', label: 'OCR 识别文本（片段）', lines: [
            { text: 'Size  Chest  Length' },
            { text: 'S     96     68' },
            { text: 'M     102    ??', hit: true },
            { text: 'L     ?12    72', hit: true },
          ] },
        ],
      },
    },
  ],

  ipr: [
    {
      value: 'pass',
      label: '通过',
      status: 'pass',
      outcome: { status: 'pass', conclusion: '未命中侵权词、高危品牌词与品牌 logo。' },
    },
    {
      value: 'title_word',
      label: '违规·标题品牌词',
      status: 'violation',
      outcome: {
        status: 'violation',
        conclusion: '标题命中高危品牌词',
        hitReason: '标题包含高危品牌词「Gucci Style」',
        hitPosition: '商品标题',
        suggestion: '删除标题中的品牌相关词后重新提交检测',
        reference: [
          { kind: 'text', field: '商品标题', fragment: 'Premium Cotton Tee, Gucci Style Streetwear, Vintage Print', word: 'Gucci Style' },
        ],
      },
    },
    {
      value: 'image_logo',
      label: '违规·图片logo',
      status: 'violation',
      outcome: {
        status: 'violation',
        conclusion: '图片命中品牌 logo 特征',
        hitReason: '侧面鞋身识别到近似某品牌 monogram 图案，相似度 0.91',
        hitPosition: '主图右侧鞋身',
        suggestion: '更换不含品牌近似图案的主图与详情图，或删除相关印花',
        reference: [
          { kind: 'image', label: '命中图片', src: 'sneaker', boxes: [{ x: 46, y: 34, w: 34, h: 22, label: 'logo 特征相似度 0.91' }] },
          { kind: 'list', label: '命中图库', items: ['品牌 logo 图库 · 系列 A（相似度 0.91）', '高危品牌词库 · 「monogram」'] },
        ],
      },
    },
    {
      value: 'suspect',
      label: '疑似违规',
      status: 'suspect',
      outcome: {
        status: 'suspect',
        conclusion: '疑似混淆品牌词，建议人工审核',
        hitReason: '标题出现「Adidos」，与高危品牌「adidas」编辑距离 1，但未收录于侵权词库',
        hitPosition: '商品标题',
        suggestion: '人工确认是否为混淆词；如非本意请替换相关表述',
        reference: [
          { kind: 'text', field: '商品标题', fragment: 'Running Shoes Men, Adidos Inspired Sport Style', word: 'Adidos' },
          { kind: 'list', label: '词库比对', items: ['高危品牌词库：未直接命中', '形近词提示：adidas（编辑距离 1）'] },
        ],
      },
    },
  ],

  category: [
    {
      value: 'pass',
      label: '通过',
      status: 'pass',
      outcome: { status: 'pass', conclusion: '当前类目与商品类型兼容，未发现更匹配类目。' },
    },
    {
      value: 'misplaced',
      label: '违规·类目错放',
      status: 'violation',
      outcome: {
        status: 'violation',
        conclusion: '类目错放：存在更匹配类目',
        hitReason: '主图识别为西装（Suit），当前类目「男士外套」与商品类型兼容性弱',
        hitPosition: '首张主图 / 类目路径',
        suggestion: '调整商品类目为：服装 > 男装 > 男士西装',
        suggestionValue: '服装 > 男装 > 男士西装',
        reference: [
          { kind: 'text', field: '当前类目', fragment: '服装 > 男装 > 男士外套', word: '男士外套' },
          {
            kind: 'table',
            label: '类目匹配度对比',
            columns: ['候选类目', '匹配度', '结论'],
            rows: [
              { cells: ['男士西装', '0.94', '更匹配'], bad: [0, 1, 2] },
              { cells: ['男士外套', '0.51', '兼容性弱'] },
            ],
          },
        ],
      },
    },
    {
      value: 'suspect',
      label: '疑似违规',
      status: 'suspect',
      outcome: {
        status: 'suspect',
        conclusion: '商品类型识别置信度低，建议人工审核',
        hitReason: '主图中包含多件不同类型商品，AI 无法确定主体商品类型',
        hitPosition: '首张主图',
        suggestion: '人工确认主体商品与当前类目是否匹配；建议主图仅保留主体商品',
        reference: [
          { kind: 'image', label: '首张主图', src: 'suit', boxes: [{ x: 10, y: 15, w: 80, h: 70, label: '多主体图片，类型置信度 0.41' }] },
        ],
      },
    },
  ],

  price: [
    {
      value: 'pass',
      label: '通过',
      status: 'pass',
      outcome: { status: 'pass', conclusion: '最低价不低于最高价 × 10%，批发阶梯价校验通过。' },
    },
    {
      value: 'tier_low',
      label: '违规·批发阶梯价',
      status: 'violation',
      outcome: {
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
      },
    },
    {
      value: 'sku_low',
      label: '违规·SKU最低价',
      status: 'violation',
      outcome: {
        status: 'violation',
        conclusion: 'SKU 最低价低于阈值',
        hitReason: 'SKU 最低价 $5.20 < 最高价 $89 × 10%（$8.90）',
        hitPosition: 'SKU 价格表 · XS 码',
        suggestion: '调整低价 SKU 定价 ≥ $8.90，或移除异常低价 SKU',
        suggestionValue: '$8.90',
        reference: [
          {
            kind: 'table',
            label: 'SKU 价格明细',
            columns: ['SKU', '价格', '校验'],
            rows: [
              { cells: ['S', '$14.90', '通过'] },
              { cells: ['M', '$14.90', '通过'] },
              { cells: ['XS', '$5.20', '低于阈值'], bad: [1, 2] },
            ],
          },
          { kind: 'formula', label: '阈值公式', lines: ['最高价 = $89.00', '阈值 = 最高价 × 10% = $8.90', '命中最低价 = $5.20（XS 码）'], result: '$5.20 < $8.90，命中价格违规' },
        ],
      },
    },
    {
      value: 'suspect',
      label: '疑似违规',
      status: 'suspect',
      outcome: {
        status: 'suspect',
        conclusion: '部分 SKU 价格缺失，疑似错误，建议人工审核',
        hitReason: 'SKU「XL 码」价格为空，无法参与最高/最低价计算',
        hitPosition: 'SKU 价格表 · XL 码',
        suggestion: '人工确认 XL 码 SKU 价格后重新发起检测',
        reference: [
          {
            kind: 'table',
            label: 'SKU 价格明细',
            columns: ['SKU', '价格', '状态'],
            rows: [
              { cells: ['S', '$14.90', '有效'] },
              { cells: ['M', '$14.90', '有效'] },
              { cells: ['XL', '-', '价格缺失'], bad: [1, 2] },
            ],
          },
        ],
      },
    },
  ],

  legal: [
    {
      value: 'pass',
      label: '通过',
      status: 'pass',
      outcome: { status: 'pass', conclusion: '未命中禁售、限售及赌博类规则。' },
    },
    {
      value: 'banned',
      label: '违规·禁售商品',
      status: 'violation',
      outcome: {
        status: 'violation',
        conclusion: '命中禁售商品特征',
        hitReason: '详情图识别到电子烟弹组件特征，属于平台禁售品类',
        hitPosition: '详情图第 2 张',
        suggestion: '删除相关详情图或下架对应商品',
        reference: [
          { kind: 'image', label: '详情图', src: 'bag', boxes: [{ x: 22, y: 30, w: 56, h: 40, label: '禁售组件特征相似度 0.88' }] },
          { kind: 'list', label: '命中规则库', items: ['禁售产品管理规则 · 电子烟类', '禁售图片库 · 组件特征 B'] },
        ],
      },
    },
    {
      value: 'gambling',
      label: '违规·赌博类',
      status: 'violation',
      outcome: {
        status: 'violation',
        conclusion: '文本命中赌博类词库/网址库',
        hitReason: '详情描述 OCR 命中「casino slots」及站外网址，赌博词库与网址库同时命中',
        hitPosition: '详情描述图 · OCR 文本',
        suggestion: '删除赌博相关文案与站外网址后重新提交',
        reference: [
          { kind: 'ocr', label: 'OCR 识别文本（片段）', lines: [
            { text: 'Fashion Bag 2026 New Arrival' },
            { text: 'Play casino slots at bet-xxx.example', hit: true },
            { text: 'Free shipping worldwide' },
          ] },
          { kind: 'list', label: '命中库', items: ['赌博类词库 · 「casino slots」', '赌博网址库 · bet-xxx.example'] },
        ],
      },
    },
    {
      value: 'suspect',
      label: '疑似违规',
      status: 'suspect',
      outcome: {
        status: 'suspect',
        conclusion: '与限售图库样本相似，建议人工审核',
        hitReason: '主图与限售商品图库样本结构相似度 0.62，低于违规判定阈值',
        hitPosition: '首张主图',
        suggestion: '人工确认商品是否属于限售品类（如刀具、仿真器等外观相似商品）',
        reference: [
          { kind: 'image', label: '首张主图', src: 'dress', boxes: [{ x: 12, y: 18, w: 76, h: 66, label: '与限售样本结构相似度 0.62' }] },
        ],
      },
    },
  ],
};

export type ConclusionLevel = 'reject' | 'pass' | 'manual' | 'partial' | 'checking' | 'failed';

export interface ConclusionScenario {
  value: string;
  label: string;
  level: ConclusionLevel;
  showCounts: boolean;
  counts: { hit: number; suspect: number; pass: number; fail: number };
  text: string;
}

export const CONCLUSION_SCENARIOS: ConclusionScenario[] = [
  {
    value: 'reject',
    label: '不通过',
    level: 'reject',
    showCounts: true,
    counts: { hit: 3, suspect: 1, pass: 2, fail: 0 },
    text: '不通过：商品存在 3 处违规，请逐项处理后重新提交检测。',
  },
  {
    value: 'pass',
    label: '通过',
    level: 'pass',
    showCounts: true,
    counts: { hit: 0, suspect: 0, pass: 6, fail: 0 },
    text: '通过：各质检项均未发现违规。',
  },
  {
    value: 'manual',
    label: '待人工确认',
    level: 'manual',
    showCounts: true,
    counts: { hit: 0, suspect: 2, pass: 4, fail: 0 },
    text: '需人工确认：商品存在 2 处疑似违规，请结合参考信息人工复核。',
  },
  {
    value: 'partial',
    label: '部分失败',
    level: 'partial',
    showCounts: true,
    counts: { hit: 1, suspect: 0, pass: 3, fail: 2 },
    text: '部分完成：2 项检测失败，结论仅供参考，请重试失败项。',
  },
  {
    value: 'checking',
    label: '检测中',
    level: 'checking',
    showCounts: false,
    counts: { hit: 0, suspect: 0, pass: 0, fail: 0 },
    text: '检测中：各质检项独立执行，结果将逐项返回。',
  },
  {
    value: 'failed',
    label: '采集失败',
    level: 'failed',
    showCounts: false,
    counts: { hit: 0, suspect: 0, pass: 0, fail: 0 },
    text: '采集失败：未获取到商品数据，请检查链接后重试采集。',
  },
];
