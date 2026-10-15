/**
 * 敦煌网商品合规检测 - 质检项模拟场景数据
 * 全部为前端演示数据，依据 PRD 8.1-8.6 展示规范。
 */

export type ItemCode = 'material' | 'size' | 'ipr' | 'category' | 'price' | 'legal';

export type ImageKey =
  | 'suit' | 'bag' | 'dress' | 'tee' | 'sneaker' | 'size-chart'
  | 'logo-a-1' | 'logo-a-2'
  | 'gambling-slot-1' | 'gambling-slot-2';

export interface GalleryGroup {
  label: string;
  images: { src: ImageKey; caption?: string }[];
}

export type Block =
  | { kind: 'text'; label?: string; field: string; fragment: string; word?: string }
  | { kind: 'list'; label: string; items: string[] }
  | { kind: 'image'; label: string; src: ImageKey; caption?: string }
  | { kind: 'gallery'; label: string; note?: string; groups: GalleryGroup[] }
  | { kind: 'ocr'; label: string; lines: { text: string; hit?: boolean }[] }
  | { kind: 'table'; label: string; columns: string[]; rows: { cells: string[]; bad?: number[] }[] }
  | { kind: 'formula'; label: string; lines: string[]; result?: string };

export type OutcomeStatus = 'pass' | 'violation' | 'suspect' | 'manual' | 'fail';

export interface SuggestionOption {
  value: string;
  note?: string;
  recommended?: boolean;
}

export interface HitRecord {
  /** 单条记录的风险类型；不填时跟随质检项状态 */
  severity?: 'violation' | 'suspect';
  reason: string;
  position?: string;
  suggestion?: string;
  reference?: Block[];
}

export interface ItemOutcome {
  status: OutcomeStatus;
  conclusion: string;
  hits?: HitRecord[];
  hitReason?: string;
  hitPosition?: string;
  suggestion?: string;
  suggestionValue?: string;
  suggestionOptions?: SuggestionOption[];
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
    rule: '检查材质属性填写是否有效：不能为空，不能填 null、n/a 等无意义内容，也不能用和材质无关的词；并且要和首张主图中的产品材质一致。',
  },
  {
    code: 'size',
    name: '尺码检测',
    group: '商品信息规范检查',
    target: 'SKU 尺码、系统尺码模板、详情图尺码表',
    rule: '检查尺码表填写是否有效（尺码名称和数值不能为空，也不能是 0、null 或只有符号）、系统尺码表与详情尺码表是否一致、男女款尺码与尺码表是否匹配、在售尺码与尺码表是否一致。',
  },
  {
    code: 'ipr',
    name: '知识产权侵权风险检查',
    group: '知识产权',
    target: '商品文字与图片（含图片内文字识别、AI 图片特征识别）',
    rule: '检查商品文字和图片中是否出现侵权词库中的关键词、高危品牌词或品牌 logo；同时识别图片上的涂抹痕迹与混淆词。',
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
    rule: '最低价低于最高价 × 10% 即判定违规；批发阶梯价取区间端点计算。',
  },
  {
    code: 'legal',
    name: '违法违规检查',
    group: '违法违规',
    target: '商品文字与图片（含图片内文字识别、AI 图片特征识别）',
    rule: '依据两份规则库逐项比对：禁售规则库规定哪些商品全网不能卖（如电子烟、管制刀具、赌博工具），部分市场还有单独的地区禁售规则（如某些商品禁止销往美国、英国等）；限售规则库规定某些商品销往某地区必须提供对应资质（如儿童玩具销往美国需儿童产品证书 CPC，销往欧盟需 CE 认证）。商品文字和图片对应到禁售规则即判定违规；涉及限售的，会列出需要人工核验的资质要求。赌博类内容另按赌博词库、网址库比对。',
  },
];

const PASS: Partial<Record<ItemCode, ItemOutcome>> = {
  material: { status: 'pass', conclusion: '该类目未要求提供材质属性或材质属性值合法，且与首张主图识别的材质一致。' },
  size: { status: 'pass', conclusion: '该类目未要求提供尺码表或SKU 尺码、系统尺码表与详情尺码表数据有效且一致。' },
  ipr: { status: 'pass', conclusion: '未检测到侵权词、高危品牌词与品牌 logo。' },
  category: { status: 'pass', conclusion: '当前类目与商品类型兼容，未发现更匹配类目。' },
  price: { status: 'pass', conclusion: '最低价不低于最高价 × 10%，批发阶梯价校验通过。' },
  legal: { status: 'pass', conclusion: '未发现违反禁售规则、限售资质要求或赌博类违规。' },
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
        conclusion: '材质属性值无效',
        hitReason: '已检测到「Material」属性字段，但取值为空（n/a），属于无效材质描述',
        hitPosition: '商品属性区 · Material',
        suggestion: '修改 Material 字段取值，建议值：聚酯纤维（Polyester）',
        suggestionValue: 'Polyester（聚酯纤维）',
        reference: [
          {
            kind: 'text',
            field: '商品属性',
            fragment: 'Material: n/a',
            word: 'Material: n/a',
          },
          { kind: 'list', label: '材质属性中检索到的关键词', items: ['Material'] },
        ],
        detail: [
          {
            kind: 'image',
            label: '首张主图',
            src: 'suit',
          },
        ],
      },
      size: {
        status: 'suspect',
        conclusion: '尺码表校验不完整，疑似错误，建议人工审核',
        hitReason: '详情图尺码表不清晰，未能有效识别图中文字，无法与系统尺码模板比对',
        hitPosition: '详情图第 3 张',
        suggestion: '人工核对详情图尺码表；如图片模糊请重新上传清晰尺码表图',
        reference: [
          {
            kind: 'image',
            label: '详情图尺码表',
            src: 'size-chart',
          },
          {
            kind: 'ocr',
            label: '图片文字识别结果（片段）',
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
        conclusion: '类目错放：检测到多个可选类目',
        hitReason: '主图识别为西装（Suit），当前类目「男士外套」与商品类型兼容性弱，检测到 3 个更匹配的可选类目',
        hitPosition: '首张主图 / 类目路径',
        suggestion: '以下候选类目均可调整，默认选中推荐项，请结合实物确认后修改：',
        suggestionValue: '服装 > 男装 > 男士西装',
        suggestionOptions: [
          { value: '服装 > 男装 > 男士西装', note: '主图为成套西装上衣，与西装类目最贴合', recommended: true },
          { value: '服装 > 男装 > 商务西装', note: '正装场景常用类目，同样兼容' },
          { value: '服装 > 男装 > 西服外套', note: '单件西装外套常放类目，粒度较粗' },
        ],
        reference: [
          { kind: 'text', field: '当前类目', fragment: '服装 > 男装 > 男士外套', word: '男士外套' },
          { kind: 'list', label: 'AI 识别商品类型关键词', items: ['suit jacket', 'two-piece', 'lapel', 'formal'] },
        ],
        detail: [
          {
            kind: 'table',
            label: '类目对比',
            columns: ['候选类目', '结论'],
            rows: [
              { cells: ['服装 > 男装 > 男士西装', '最贴合，推荐'], bad: [] },
              { cells: ['服装 > 男装 > 商务西装', '兼容，可选'], bad: [] },
              { cells: ['服装 > 男装 > 西服外套', '兼容但粒度较粗，可选'], bad: [] },
              { cells: ['服装 > 男装 > 男士外套', '当前类目，兼容性弱'], bad: [1] },
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
            lines: ['最高价 = $99.00（SKU 零售区间上限）', '阈值 = 最高价 × 10% = $9.90', '触发违规的最低价 = $8.90（阶梯第 4 档）'],
            result: '$8.90 < $9.90，判定为价格违规',
          },
        ],
      },
    },
  },

  'sneaker-partial': {
    outcomes: {
      ipr: {
        status: 'violation',
        conclusion: '图片出现品牌 logo 特征，另有 1 处疑似待人工确认',
        hits: [
          {
            reason: '主图识别到近似某品牌 monogram 图案',
            position: '主图',
            suggestion: '更换不含品牌近似图案的主图与详情图，或删除相关印花',
            reference: [
              {
                kind: 'image',
                label: '违规图片',
                src: 'sneaker',
              },
              {
                kind: 'gallery',
                label: '图库比对样本',
                note: '与识别结果相近的库内图片，供人工比对',
                groups: [
                  {
                    label: '品牌 logo 图库 · 系列 A',
                    images: [
                      { src: 'logo-a-1', caption: '' },
                    ],
                  },
                ],
              },
              { kind: 'list', label: '比对到的词库', items: ['高危品牌词库 · 「monogram」'] },
            ],
          },
          {
            severity: 'suspect',
            reason: '详情图侧边的三条平行条纹与某品牌经典条纹排列接近，但未收录于侵权词库，无法直接判定',
            position: '详情图第 2 张',
            suggestion: '人工确认条纹是否构成品牌近似；如构成请更换该详情图',
            reference: [
              {
                kind: 'gallery',
                label: '对比图库',
                note: '外观接近但未达违规判定标准的库内样本，供人工比对',
                groups: [
                  {
                    label: '品牌元素图库 · 系列 A',
                    images: [{ src: 'logo-a-2', caption: '' }],
                  },
                ],
              },
              { kind: 'list', label: '词库比对', items: ['高危品牌词库：未出现匹配词', '形似图案提示：条纹类品牌元素'] },
            ],
          },
        ],
        detail: [
          {
            kind: 'ocr',
            label: '主图文字识别结果',
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
        conclusion: '重试后判定违规：SKU 最低价低于阈值',
        hitReason: 'SKU 最低价 $9.2 < 最高价 $89 × 10%（$8.9）阈值边界内但批发档 $8.5 低于阈值',
        hitPosition: '批发阶梯价第 3 档',
        suggestion: '调整批发第 3 档单价 ≥ $8.90',
        suggestionValue: '$8.90',
        reference: [
          {
            kind: 'formula',
            label: '阈值公式',
            lines: ['最高价 = $89.00', '阈值 = $8.90', '触发违规的最低价 = $8.50（阶梯第 3 档）'],
            result: '$8.50 < $8.90，判定为价格违规',
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
        detail: [{ kind: 'image', label: '首张主图', src: 'dress' }],
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
        conclusion: '文字与图片均存在侵权风险，另有 1 处疑似待人工确认',
        hits: [
          {
            reason: '标题出现高危品牌词「Gucci Style」',
            position: '商品标题',
            suggestion: '删除标题中的品牌相关词',
            reference: [
              {
                kind: 'text',
                field: '商品标题',
                fragment: 'Premium Cotton Tee, Gucci Style Streetwear, Vintage Print',
                word: 'Gucci Style',
              },
              { kind: 'list', label: '比对到的词库', items: ['高危品牌词库 · Gucci（风险等级：高）'] },
            ],
          },
          {
            reason: '主图领口区域存在涂抹痕迹',
            position: '主图领口',
            suggestion: '更换无涂抹痕迹的主图',
            reference: [
              {
                kind: 'image',
                label: '主图涂抹痕迹',
                src: 'tee',
              },
            ],
          },
          {
            reason: '详情图出现混淆词「CLASSIC 1921」',
            position: '详情图',
            suggestion: '删除或替换详情图中的混淆词表述',
            reference: [
              {
                kind: 'ocr',
                label: '详情图文字识别结果',
                lines: [{ text: 'URBAN CLASSIC 1921', hit: true }, { text: 'HANDMADE QUALITY' }],
              },
              { kind: 'list', label: '比对到的词库', items: ['混淆词类型 · 风格词捆绑（「Style」紧跟品牌词）'] },
            ],
          },
          {
            severity: 'suspect',
            reason: '详情图印花的字母排列与某品牌经典 monogram 接近，但侵权词库未收录该写法，无法直接判定',
            position: '详情图第 2 张',
            suggestion: '人工确认印花是否构成品牌近似；如构成请更换该详情图',
            reference: [
              {
                kind: 'gallery',
                label: '对比图库',
                note: '外观接近但未达违规判定标准的库内样本，供人工比对',
                groups: [
                  {
                    label: '品牌元素图库 · 系列 A',
                    images: [{ src: 'logo-a-2', caption: '' }],
                  },
                ],
              },
              { kind: 'list', label: '词库比对', items: ['高危品牌词库：未出现匹配词', '形似图案提示：monogram 类品牌元素'] },
            ],
          },
        ],
      },
      material: {
        status: 'suspect',
        conclusion: '主图材质无法判读，疑似错误，建议人工审核',
        hitReason: 'AI无法准确判断材质',
        suggestion: '人工确认材质属性描述（当前填写：Cotton）',
        reference: [{ kind: 'image', label: '首张主图', src: 'tee' }],
      },
    },
  },
};

export function getOutcome(scenario: ScenarioKey, code: ItemCode, retry = false): ItemOutcome {
  const def = SCENARIOS[scenario];
  if (retry && def.retryOutcomes?.[code]) return def.retryOutcomes[code]!;
  return def.outcomes[code] ?? PASS[code] ?? { status: 'pass', conclusion: '检测通过。' };
}
