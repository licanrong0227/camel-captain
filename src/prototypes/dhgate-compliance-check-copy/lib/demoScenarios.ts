/**
 * 演示场景合成：整页预设 + 商品信息模块场景 + 单检测项覆盖。
 * 全部场景只对箱包模板记录（t-seed-bag）生效，数据统一取自包袋商品。
 */
import { ImageKey, ItemCode, ITEM_DEFS, ItemOutcome, PASS } from './scenarios';
import { ProductSnapshot, DetailBlock, SnapshotPatch, applySnapshotPatch, BAG_SIZE_CHART } from './product';
import { ItemStatus, ItemView, Task, TaskStatus, TaskView } from './store';

export const DEMO_TASK_ID = 't-seed-bag';

/** 箱包演示记录本身，以及由它复制出来的记录（重新采集并检测新建的那条） */
export function isDemoRecord(task: Task | undefined | null): boolean {
  return Boolean(task && (task.id === DEMO_TASK_ID || task.demoTemplate));
}

/**
 * 记录列表统一入口：采集失败记录进入它自己的采集失败页；
 * 其余记录都落到箱包场景演示页，并按该条记录的结果带出对应的演示场景。
 */
export function demoEntryForView(view: TaskView): { taskId: string; preset?: PagePresetValue } {
  // 箱包模板记录与由它复制出的记录本身就是场景演示页，直接打开
  if (isDemoRecord(view.task)) return { taskId: view.task.id };
  if (view.status === 'collect-failed') return { taskId: view.task.id };
  // 采集失败后重新采集的记录仍打开自己的详情页，避免重试后被当成普通记录跳到箱包演示页
  if (view.task.collectRetryAt) return { taskId: view.task.id };
  if (view.status === 'pending' || view.status === 'collecting' || view.status === 'checking') {
    return { taskId: DEMO_TASK_ID, preset: 'checking' };
  }
  if (view.status === 'partial-fail') return { taskId: DEMO_TASK_ID, preset: 'partial' };
  if (view.issueSummary.violation > 0 || view.summary.hit > 0) return { taskId: DEMO_TASK_ID, preset: 'multi' };
  if (view.issueSummary.suspect > 0 || view.summary.suspect > 0) return { taskId: DEMO_TASK_ID, preset: 'multi' };
  return { taskId: DEMO_TASK_ID, preset: 'pass' };
}

export type ModuleId = 'basic' | 'main' | 'sku' | 'price' | 'size' | 'attribute' | 'detail' | 'product';

export const MODULE_ORDER: ModuleId[] = ['basic', 'main', 'sku', 'price', 'size', 'attribute', 'detail', 'product'];

export const MODULE_STATE_KEYS: Record<ModuleId, string> = {
  basic: 'view_state_basic',
  main: 'view_state_main',
  sku: 'view_state_sku',
  price: 'view_state_price',
  size: 'view_state_size',
  attribute: 'view_state_attribute',
  detail: 'view_state_detail',
  product: 'view_state_product',
};

export const ITEM_STATE_KEYS: Record<ItemCode, string> = {
  material: 'item_state_material',
  size: 'item_state_size',
  ipr: 'item_state_ipr',
  category: 'item_state_category',
  price: 'item_state_price',
  legal: 'item_state_legal',
};

type SceneStatus = 'pass' | 'violation' | 'suspect' | 'manual' | 'fail';

export type SnapshotResolver = SnapshotPatch | ((base: ProductSnapshot) => SnapshotPatch);

export interface ItemContribution extends Partial<Omit<ItemOutcome, 'status'>> {
  status?: SceneStatus;
}

export interface ModuleScenario {
  value: string;
  label: string;
  name: string;
  snapshot?: SnapshotResolver;
  items?: Partial<Record<ItemCode, ItemContribution>>;
}

export interface ModuleDef {
  id: ModuleId;
  title: string;
  scenarios: ModuleScenario[];
}

export type PagePresetValue = 'flow' | 'pass' | 'multi' | 'mixed' | 'partial' | 'checking';

export interface PagePreset {
  value: PagePresetValue;
  label: string;
  name: string;
  /** 切到该预设时先把 6 个检测项都按通过处理，再叠加模块场景 */
  resetBase: boolean;
  status: TaskStatus;
  modules: Partial<Record<ModuleId, string>>;
  running?: ItemCode[];
}

export const PAGE_PRESETS: PagePreset[] = [
  {
    value: 'flow',
    label: '跟随流程',
    name: '跟随任务真实进度与真实结果',
    resetBase: false,
    status: 'done',
    modules: {},
  },
  {
    value: 'pass',
    label: '通过',
    name: '6 个质检项全部通过',
    resetBase: true,
    status: 'done',
    modules: {
      basic: 'pass', main: 'pass', sku: 'pass', price: 'pass',
      size: 'pass', attribute: 'pass', detail: 'pass', product: 'pass',
    },
  },
  {
    value: 'multi',
    label: '违规',
    name: '每个模块一起展示违规：多张图片 + 多段文字，含疑似与建议自查',
    resetBase: true,
    status: 'done',
    modules: {
      basic: 'violation', main: 'violation', sku: 'violation', price: 'violation',
      size: 'violation', attribute: 'violation', detail: 'violation', product: 'violation',
    },
  },
  {
    value: 'mixed',
    label: '部分违规+失败',
    name: '主图品牌违规 + 手铐挂件待确认 + 价格检测失败，其余通过',
    resetBase: true,
    status: 'partial-fail',
    modules: { main: 'violation', price: 'fail' },
  },
  {
    value: 'partial',
    label: '部分失败',
    name: '价格与违法违规两项检测失败',
    resetBase: true,
    status: 'partial-fail',
    modules: { price: 'fail', detail: 'fail' },
  },
  {
    value: 'checking',
    label: '检测中',
    name: '4 项已通过、价格与违法违规仍在检测',
    resetBase: true,
    status: 'checking',
    modules: {},
    running: ['price', 'legal'],
  },
];

/* ---------------- 快照补丁工具 ---------------- */

const BAG_TITLE =
  'Vintage Quilted Chain Bucket Bag Women Large Capacity Shoulder Purse With Drawstring Top Handle Tote Handbag For Daily Travel Commute';

const prefixedTitle = (base: ProductSnapshot) => `Gucce Style ${base.title}`;

function replaceMainImages(images: ImageKey[]): SnapshotResolver {
  return { mainImages: images };
}

function replaceSkuImage(index: number, src: ImageKey): SnapshotResolver {
  return (base) => ({
    skuImages: base.skuImages.map((image, imageIndex) => (imageIndex === index ? { ...image, src } : image)),
  });
}

function replaceAttribute(label: string, value: string): SnapshotResolver {
  return (base) => ({
    attributes: base.attributes.map((attribute) => (attribute.label === label ? { ...attribute, value } : attribute)),
  });
}

function appendDetailText(text: string): SnapshotResolver {
  return (base) => {
    const block: DetailBlock = { type: 'text', text };
    return { detailBlocks: [...base.detailBlocks, block] };
  };
}

function withBagSizeChart(src: ImageKey): SnapshotResolver {
  return (base) => ({
    sizeChart: {
      ...BAG_SIZE_CHART,
      detail: { index: 3, src, caption: '详情图 3 · 尺码示意图' },
    },
    detailBlocks: [
      ...base.detailBlocks.filter((block) => !(block.type === 'image' && block.index === 3)),
      { type: 'image', index: 3, src, caption: '详情图 3 · 尺码示意图' },
    ],
  });
}

/* ---------------- 模块场景 ---------------- */

const CATEGORY_FIELD = '箱包及箱包辅料 > 时装包 > 双肩包';

const categoryMisplaced: ItemContribution = {
  status: 'violation',
  conclusion: '类目错放：建议调整为单肩包',
  hitReason: '主图识别为绗缝链条水桶包，当前类目「双肩包」与商品类型不匹配',
  hitPosition: '商品类目',
  anchor: { type: 'category', fragment: '双肩包' },
  suggestion: '建议调整为「箱包及箱包辅料 > 时装包 > 单肩包」：链条肩带 + 顶部提手，与单肩包最贴合。',
  suggestionValue: '箱包及箱包辅料 > 时装包 > 单肩包',
  reference: [
    { kind: 'text', field: '当前类目', fragment: CATEGORY_FIELD, word: '双肩包' },
    {
      kind: 'list',
      label: '类目判定依据',
      items: [
        '主图识别：链条单肩水桶包（顶部提手 + 可调链条），商品没有双肩背带结构',
        '建议类目：箱包及箱包辅料 > 时装包 > 单肩包',
      ],
    },
  ],
};

const titleBrandHit = {
  reason: '标题包含高危品牌词「Gucce Style」，与高危品牌词库中的「Gucce」高度相似',
  position: '商品标题',
  anchor: { type: 'title' as const, fragment: 'Gucce Style' },
  reference: [
    { kind: 'text' as const, field: '商品标题', fragment: `Gucce Style ${BAG_TITLE}`, word: 'Gucce Style' },
    { kind: 'list' as const, label: '比对到的词库', items: ['高危品牌词库 · 「Gucce」', '形近词提示 · 与「Gucci」形近'] },
  ],
  suggestion: '删除标题中的品牌相关词，改用「Quilted Chain Bucket Bag」等中性描述',
};

const mainImageBrandHit = {
  reason: '主图 1 识别到与某品牌字母交织图案高度相似的图形（双字母满印 + 菱形绗缝），图案覆盖包身主体，判定为品牌图案侵权',
  position: '主图 1',
  anchor: { type: 'mainImage' as const, index: 1 },
  reference: [
    { kind: 'image' as const, label: '命中的商品主图', src: 'bag-brand' as ImageKey },
    {
      kind: 'gallery' as const,
      label: '图库比对样本',
      note: '与识别结果最接近的库内图片，供人工比对',
      groups: [
        {
          label: '品牌图案图库 · 字母交织系列',
          images: [{ src: 'logo-a-1' as ImageKey, caption: '字母交织样本 A-1' }, { src: 'logo-a-2' as ImageKey, caption: '字母交织样本 A-2' }],
        },
      ],
    },
    { kind: 'list' as const, label: '图库比对结果', items: ['相似度最高的样本：字母交织图案（系列 A）', '图案元素：重复字母 + 菱形绗缝底纹'] },
    { kind: 'list' as const, label: '词库比对结果', items: ['高危品牌词库：商品文字未出现匹配词'] },
  ],
  suggestion: '更换不含品牌图案的主图，或对图案做明显区分后重新检测',
};

const handcuffSuspectHit = {
  severity: 'suspect' as const,
  reason: '主图 1 中包身挂件为手铐造型金属件，对应《禁止销售产品规则》管制器具类「刑具及限制自由工具（手铐）」，仅从图片无法确认是否具备实际束缚功能',
  position: '主图 1',
  anchor: { type: 'mainImage' as const, index: 1 },
  reference: [
    { kind: 'image' as const, label: '主图挂件特写', src: 'bag-brand-charm' as ImageKey },
    { kind: 'list' as const, label: '禁售比对 · 召回规则', items: ['《禁止销售产品规则》管制器具类 · 刑具及限制自由工具（商品功能待人工确认）'] },
  ],
  suggestion: '人工确认挂件是否具备开合、锁扣等束缚功能；如仅为装饰建议更换挂件样式',
};

const vapeBannedHit = {
  reason: '商品详情文字出现「comes with 2 refill cartridges (e-Liquid Pod), vape pen refillable」，即烟弹与注油烟具，对应《禁止销售产品规则》烟酒类「所有电子烟及其配件相关产品」',
  position: '商品详情文字',
  anchor: { type: 'product' as const },
  reference: [
    {
      kind: 'text' as const,
      field: '详情文本',
      fragment: 'Every bag comes with 2 refill cartridges (e-Liquid Pod), vape pen refillable, fits most devices.',
      word: 'e-Liquid Pod',
    },
    { kind: 'list' as const, label: '禁售比对 · 召回规则', items: ['《禁止销售产品规则》烟酒类 · 所有电子烟及其配件相关产品（严重违规）'] },
  ],
  suggestion: '删除电子烟及配件相关描述；如实物确实附赠烟弹，请下架该商品',
};

const restrictedSelfCheckHit = {
  severity: 'manual' as const,
  severityLabel: '建议自查',
  reason: '商品含金属链条、五金扣件与 PU 涂层织物，销往欧盟需符合 REACH 化学品限制，销往美国（加州）需按 Prop 65 提供化学物质暴露警示；资质与检测报告是否齐全系统无法核验，不判定违规，建议商家对照规则自查',
  position: '商品整体（限售规则）',
  anchor: { type: 'product' as const },
  reference: [
    {
      kind: 'list' as const,
      label: '限售比对 · 召回规则',
      items: [
        '《限售商品管理规则》化学品限制 · 欧盟 REACH 法规（皮革制品、金属配件）',
        '《限售管理规则》化学物质警示 · 美国加州 Prop 65',
      ],
    },
    {
      kind: 'table' as const,
      label: '资质要求 · 请商家自查',
      columns: ['市场', '所需资质', '系统核验结果'],
      rows: [
        { cells: ['欧盟', 'REACH 合规检测报告（SVHC 筛查）', '无法核验，请自查'] },
        { cells: ['美国（加州）', 'Prop 65 化学物质暴露警示标签', '无法核验，请自查'] },
      ],
    },
  ],
  suggestion: '对照限售规则自查并补齐检测报告后重新检测；如不销往该地区可调整销售区域',
};

const DETAIL_GAMBLING_TEXT = 'Weekly lucky draw: play casino slots on our partner page to get a 20% off coupon for any handbag.';

const gamblingWordHit = {
  reason: '详情文字第 3 段出现赌博类词「casino slots」，并引导到外部抽奖页面',
  position: '详情文字 #3',
  anchor: { type: 'detailText' as const, index: 3, fragment: 'casino slots' },
  reference: [
    {
      kind: 'text' as const,
      field: '详情文本',
      fragment: DETAIL_GAMBLING_TEXT,
      word: 'casino slots',
    },
    { kind: 'list' as const, label: '赌博比对 · 词库', items: ['赌博类词库 · 「casino slots」'] },
  ],
  suggestion: '删除详情文本中的赌博类文案',
};

const gamblingUrlHit = {
  reason: '详情图 1 图片文字识别出赌博网址 bet-xxx.example，并引导「Play casino slots for a free gift」',
  position: '详情图 1',
  anchor: { type: 'detailImage' as const, index: 1 },
  reference: [
    { kind: 'image' as const, label: '命中的详情图', src: 'bag-detail-risky' as ImageKey },
    {
      kind: 'ocr' as const,
      label: '图片文字识别（片段）',
      lines: [
        { text: 'MEDICAL GRADE ANTIMICROBIAL FABRIC' },
        { text: 'Kills 99% of viruses and bacteria' },
        { text: 'Play casino slots at bet-xxx.example for a free gift', hit: true },
      ],
    },
    { kind: 'list' as const, label: '赌博比对 · 网址库', items: ['赌博网址库 · bet-xxx.example'] },
  ],
  suggestion: '修改或删除含赌博网址的图片，避免在商品图中出现赌博引导',
};

const medicalClaimHit = {
  reason: '详情图 1 出现「MEDICAL GRADE ANTIMICROBIAL FABRIC」「Kills 99% of viruses and bacteria」，普通箱包宣称医疗级抗菌、杀灭病毒，属于明示医疗功效',
  position: '详情图 1',
  anchor: { type: 'detailImage' as const, index: 1 },
  reference: [
    { kind: 'image' as const, label: '命中的详情图', src: 'bag-detail-risky' as ImageKey },
    { kind: 'list' as const, label: '违规比对 · 规则库', items: ['《商品信息发布规范》医疗功效类 · 普通商品不得宣称医疗、杀菌、抗病毒等功效'] },
  ],
  suggestion: '删除医疗级、杀菌、抗病毒等功效描述，改为「内衬易清洁」等客观表述',
};

const DETAIL_TEXT_WITH_CLAIM = '【材质】PU 仿皮，表面细腻纹理，内衬涤纶布，抗菌防霉，有效抑制 99% 细菌，耐磨易打理。';
const DETAIL_TEXT_CLAIM_WORD = '抗菌防霉，有效抑制 99% 细菌';

const detailTextClaimHit = {
  reason: `详情文字出现「${DETAIL_TEXT_CLAIM_WORD}」，普通箱包宣称抗菌、抑菌功效，属于明示医疗功效`,
  position: '详情文字 #1',
  anchor: { type: 'detailText' as const, index: 1, fragment: DETAIL_TEXT_CLAIM_WORD },
  reference: [
    {
      kind: 'text' as const,
      field: '详情文本',
      fragment: DETAIL_TEXT_WITH_CLAIM,
      word: DETAIL_TEXT_CLAIM_WORD,
    },
    {
      kind: 'list' as const,
      label: '违规比对 · 规则库',
      items: ['《商品信息发布规范》医疗功效类 · 普通商品不得宣称抗菌、抑菌、杀菌、抗病毒等功效'],
    },
  ],
  suggestion: '删除抗菌、抑菌等功效描述，改为「内衬易清洁、不易沾味」等客观表述',
};

const detailBrandSuspectHit = {
  severity: 'suspect' as const,
  reason: '详情图 2 包身绗缝纹样疑似某品牌字母交织图案，图案边缘模糊且面积较小，未达到违规判定标准',
  position: '详情图 2',
  anchor: { type: 'detailImage' as const, index: 2 },
  reference: [
    { kind: 'image' as const, label: '命中的详情图', src: 'bag-brand' as ImageKey },
    {
      kind: 'gallery' as const,
      label: '图库比对样本',
      note: '外观接近但未达违规判定标准的库内样本，供人工比对',
      groups: [{ label: '品牌图案图库 · 字母交织系列', images: [{ src: 'logo-a-2' as ImageKey, caption: '字母交织样本 A-2' }] }],
    },
  ],
  suggestion: '人工确认图案是否构成品牌近似；如构成请更换该图片',
};

const skuBrandSuspectHit = {
  severity: 'suspect' as const,
  reason: 'SKU 图（Black）肩带印花出现连续字母图案，疑似某品牌字母元素；图案面积小且清晰度有限，未达违规判定标准',
  position: 'SKU 图 2',
  anchor: { type: 'skuImage' as const, index: 2 },
  reference: [
    { kind: 'image' as const, label: '命中的 SKU 图', src: 'bag-brand-sku' as ImageKey },
    {
      kind: 'gallery' as const,
      label: '图库比对样本',
      note: '外观接近但未达违规判定标准的库内样本，供人工比对',
      groups: [{ label: '品牌图案图库 · 字母系列', images: [{ src: 'logo-a-1' as ImageKey, caption: '字母图案样本 A-1' }] }],
    },
  ],
  suggestion: '人工确认印花是否构成品牌近似；如构成请更换 SKU 图',
};

export const MODULE_SCENARIOS: Record<ModuleId, ModuleDef> = {
  basic: {
    id: 'basic',
    title: '基本信息',
    scenarios: [
      { value: 'auto', label: '跟随', name: '跟随整页演示预设' },
      { value: 'pass', label: '通过', name: '类目与标题均未发现问题' },
      {
        value: 'violation',
        label: '违规',
        name: '类目错放 + 标题品牌词',
        snapshot: (base) => ({ category: CATEGORY_FIELD, title: prefixedTitle(base) }),
        items: {
          category: categoryMisplaced,
          ipr: { status: 'violation', hits: [titleBrandHit] },
        },
      },
      {
        value: 'fail',
        label: '失败',
        name: '类目推荐未返回候选类目',
        items: {
          category: {
            status: 'fail',
            conclusion: '类目检查未产生结果',
            failReason: '类目推荐服务未返回候选类目，本项未产生结果',
          },
        },
      },
    ],
  },

  main: {
    id: 'main',
    title: '主图',
    scenarios: [
      { value: 'auto', label: '跟随', name: '跟随整页演示预设' },
      { value: 'pass', label: '通过', name: '主图未发现品牌图案' },
      {
        value: 'violation',
        label: '违规',
        name: '主图品牌图案 + 手铐挂件待确认',
        snapshot: replaceMainImages(['bag-brand-charm', 'bag', 'bag']),
        items: {
          ipr: { status: 'violation', hits: [mainImageBrandHit] },
          legal: { status: 'suspect', hits: [handcuffSuspectHit] },
        },
      },
      {
        value: 'fail',
        label: '失败',
        name: '图片特征检测服务不可用',
        items: {
          ipr: {
            status: 'fail',
            conclusion: '知识产权侵权风险检查未产生结果',
            failReason: '图片特征检测服务不可用，主图与 SKU 图识别未完成，本项未产生结果',
            failAnchor: { type: 'mainImage', index: 1 },
          },
        },
      },
    ],
  },

  sku: {
    id: 'sku',
    title: 'SKU 图',
    scenarios: [
      { value: 'auto', label: '跟随', name: '跟随整页演示预设' },
      { value: 'pass', label: '通过', name: 'SKU 图未发现品牌元素' },
      {
        value: 'violation',
        label: '违规',
        name: 'SKU 图肩带印花疑似品牌字母',
        snapshot: replaceSkuImage(1, 'bag-brand-sku'),
        items: { ipr: { status: 'suspect', hits: [skuBrandSuspectHit] } },
      },
      {
        value: 'fail',
        label: '失败',
        name: 'SKU 图识别超时',
        items: {
          ipr: {
            status: 'fail',
            conclusion: '知识产权侵权风险检查未产生结果',
            failReason: 'SKU 图特征识别服务超时，本项未产生结果',
            failAnchor: { type: 'skuImage', index: 2 },
          },
        },
      },
    ],
  },

  price: {
    id: 'price',
    title: '价格',
    scenarios: [
      { value: 'auto', label: '跟随', name: '跟随整页演示预设' },
      { value: 'pass', label: '通过', name: 'SKU 价与阶梯价均合规' },
      {
        value: 'violation',
        label: '违规',
        name: 'SKU 最低价 + 阶梯价均低于阈值',
        snapshot: (base) => ({
          skuRows: base.skuRows.map((row) => (row.sku === 'Ivory / One Size' ? { ...row, price: '$4.20' } : row)),
          ladderRows: base.ladderRows.map((row) => (row.tier === 3 ? { ...row, price: '$3.90' } : row)),
        }),
        items: {
          price: {
            status: 'violation',
            hits: [
              {
                reason: 'SKU 最低价 $4.20（Ivory / One Size）< 最高价 $45.00 × 10%（$4.50）',
                position: 'SKU 价格表 · Ivory / One Size',
                anchor: { type: 'skuTable', sku: 'Ivory / One Size' },
                reference: [
                  {
                    kind: 'table',
                    label: 'SKU 价格明细',
                    columns: ['SKU', '价格', '校验'],
                    rows: [
                      { cells: ['Brown / One Size', '$45.00', '通过'] },
                      { cells: ['Black / One Size', '$42.00', '通过'] },
                      { cells: ['Ivory / One Size', '$4.20', '低于阈值'], bad: [1, 2] },
                    ],
                  },
                ],
                suggestion: '将 Ivory 价格调整到 ≥ $4.50',
              },
              {
                reason: '批发阶梯第 3 档（≥ 50 件）单价 $3.90 < 最高价 $45.00 × 10%（$4.50）',
                position: '批发阶梯价第 3 档',
                anchor: { type: 'ladder', index: 3 },
                reference: [
                  {
                    kind: 'table',
                    label: '批发阶梯价',
                    columns: ['档位', '数量', '单价', '校验'],
                    rows: [
                      { cells: ['1', '≥ 1 件', '$45.00', '通过'] },
                      { cells: ['2', '≥ 10 件', '$38.00', '通过'] },
                      { cells: ['3', '≥ 50 件', '$3.90', '低于阈值'], bad: [2, 3] },
                    ],
                  },
                ],
                suggestion: '将第 3 档单价调整到 ≥ $4.50',
              },
            ],
          },
        },
      },
      {
        value: 'fail',
        label: '失败',
        name: '阶梯价数据不完整',
        items: {
          price: {
            status: 'fail',
            conclusion: '价格检测未产生结果',
            failReason: '批发阶梯价数据不完整，无法完成价格计算，本项未产生结果',
            failAnchor: { type: 'ladder' },
          },
        },
      },
    ],
  },

  size: {
    id: 'size',
    title: '尺码表',
    scenarios: [
      { value: 'auto', label: '跟随', name: '跟随整页演示预设' },
      { value: 'pass', label: '通过', name: '系统尺码模板与详情图尺码表一致' },
      {
        value: 'violation',
        label: '违规',
        name: '详情尺码表与系统模板不一致',
        snapshot: withBagSizeChart('bag-size-guide-mismatch'),
        items: {
          size: {
            status: 'violation',
            conclusion: '详情尺码表与系统模板不一致',
            hitReason: '详情图尺码表高度为 24cm，系统尺码模板为 22cm，超出容差 ±1cm',
            hitPosition: '尺码表 · 高度',
            anchor: { type: 'sizeChart' },
            suggestion: '以实物测量为准，修正详情图尺码表或系统尺码模板的高度值',
            reference: [
              {
                kind: 'table',
                label: '尺寸比对（cm）',
                columns: ['项目', '系统模板', '详情表', '差异'],
                rows: [
                  { cells: ['顶部宽', '26', '26', '0'] },
                  { cells: ['高度', '22', '24', '+2'], bad: [1, 2, 3] },
                  { cells: ['底部宽', '18', '18', '0'] },
                  { cells: ['肩带长', '120', '120', '0'] },
                ],
              },
              { kind: 'image', label: '详情图尺码表', src: 'bag-size-guide-mismatch' },
            ],
          },
        },
      },
      {
        value: 'fail',
        label: '失败',
        name: '尺码表文字识别服务异常',
        snapshot: withBagSizeChart('bag-size-guide'),
        items: {
          size: {
            status: 'fail',
            conclusion: '尺码检测未产生结果',
            failReason: '详情图尺码表文字识别服务异常，未完成比对，本项未产生结果',
            failAnchor: { type: 'sizeChart' },
          },
        },
      },
    ],
  },

  attribute: {
    id: 'attribute',
    title: '商品属性',
    scenarios: [
      { value: 'auto', label: '跟随', name: '跟随整页演示预设' },
      { value: 'pass', label: '通过', name: '材质属性与主图一致' },
      {
        value: 'violation',
        label: '违规',
        name: 'Material 属性值为空',
        snapshot: replaceAttribute('Material', 'n/a'),
        items: {
          material: {
            status: 'violation',
            conclusion: '材质属性值无效',
            hitReason: '已检测到「Material」属性字段，但取值为空（n/a），属于无效材质描述',
            hitPosition: '商品属性区 · Material',
            anchor: { type: 'attribute', field: 'Material', fragment: 'n/a' },
            suggestion: '修改 Material 字段取值，建议填写：PU 合成革',
            suggestionValue: 'PU',
            reference: [
              { kind: 'text', field: '商品属性', fragment: 'Material: n/a', word: 'Material: n/a' },
              { kind: 'list', label: '材质属性中检索到的关键词', items: ['Material', '取值 n/a 属于占位内容，不能作为材质描述'] },
            ],
          },
        },
      },
      {
        value: 'fail',
        label: '失败',
        name: '材质识别服务超时',
        items: {
          material: {
            status: 'fail',
            conclusion: '材质检测未产生结果',
            failReason: '首张主图 AI 材质识别服务调用超时，本项未产生结果',
            failAnchor: { type: 'mainImage', index: 1 },
          },
        },
      },
    ],
  },

  detail: {
    id: 'detail',
    title: '详情描述',
    scenarios: [
      { value: 'auto', label: '跟随', name: '跟随整页演示预设' },
      { value: 'pass', label: '通过', name: '详情图文未发现问题' },
      {
        value: 'violation',
        label: '违规',
        name: '多张详情图违规 + 两段详情文字违规',
        snapshot: (base) => {
          let textNo = 0;
          const blocks = base.detailBlocks.map((block) => {
            if (block.type === 'text') {
              textNo += 1;
              return textNo === 1 ? { ...block, text: DETAIL_TEXT_WITH_CLAIM } : block;
            }
            if (block.index === 1) return { ...block, src: 'bag-detail-risky' as ImageKey };
            if (block.index === 2) return { ...block, src: 'bag-brand' as ImageKey };
            return block;
          });
          return { detailBlocks: [...blocks, { type: 'text' as const, text: DETAIL_GAMBLING_TEXT }] };
        },
        items: {
          legal: {
            status: 'violation',
            hits: [medicalClaimHit, gamblingUrlHit, detailTextClaimHit, gamblingWordHit],
          },
          ipr: { status: 'suspect', hits: [detailBrandSuspectHit] },
        },
      },
      {
        value: 'fail',
        label: '失败',
        name: '详情图文字识别超时',
        items: {
          legal: {
            status: 'fail',
            conclusion: '违法违规检查未产生结果',
            failReason: '详情图文字识别服务超时，禁售与赌博词库比对未完成，本项未产生结果',
            failAnchor: { type: 'detailImage', index: 1 },
          },
        },
      },
    ],
  },

  product: {
    id: 'product',
    title: '整品风险',
    scenarios: [
      { value: 'auto', label: '跟随', name: '跟随整页演示预设' },
      { value: 'pass', label: '通过', name: '未发现整品级问题' },
      {
        value: 'violation',
        label: '违规',
        name: '禁售（电子烟配件）+ 限售资质建议自查',
        snapshot: appendDetailText('【赠品】Every bag comes with 2 refill cartridges (e-Liquid Pod), vape pen refillable, fits most devices.'),
        items: {
          legal: {
            status: 'violation',
            conclusion: '存在 1 处违规：禁售（电子烟配件）；另有 1 项限售资质建议自查',
            hits: [vapeBannedHit, restrictedSelfCheckHit],
          },
        },
      },
      {
        value: 'manual',
        label: '建议自查',
        name: '仅限售资质建议自查，不判定违规',
        items: {
          legal: {
            status: 'manual',
            conclusion: '未发现违规，1 项限售规则建议商家自查',
            hits: [restrictedSelfCheckHit],
          },
        },
      },
      {
        value: 'fail',
        label: '失败',
        name: '禁售/限售规则库比对中断',
        items: {
          legal: {
            status: 'fail',
            conclusion: '违法违规检查未产生结果',
            failReason: '禁售/限售规则库比对任务中断，本项未产生结果',
            failAnchor: { type: 'product' },
          },
        },
      },
    ],
  },
};

/* ---------------- 检测项单独覆盖 ---------------- */

export interface ItemPreviewOption {
  value: string;
  label: string;
  module: ModuleId;
  scenario: string;
}

export const ITEM_PREVIEW_OPTIONS: Record<ItemCode, ItemPreviewOption[]> = {
  material: [
    { value: 'pass', label: '通过', module: 'attribute', scenario: 'pass' },
    { value: 'violation', label: '违规', module: 'attribute', scenario: 'violation' },
    { value: 'fail', label: '失败', module: 'attribute', scenario: 'fail' },
  ],
  size: [
    { value: 'pass', label: '通过', module: 'size', scenario: 'pass' },
    { value: 'violation', label: '违规', module: 'size', scenario: 'violation' },
    { value: 'fail', label: '失败', module: 'size', scenario: 'fail' },
  ],
  ipr: [
    { value: 'pass', label: '通过', module: 'main', scenario: 'pass' },
    { value: 'violation', label: '违规', module: 'main', scenario: 'violation' },
    { value: 'fail', label: '失败', module: 'main', scenario: 'fail' },
  ],
  category: [
    { value: 'pass', label: '通过', module: 'basic', scenario: 'pass' },
    { value: 'violation', label: '违规', module: 'basic', scenario: 'violation' },
    { value: 'fail', label: '失败', module: 'basic', scenario: 'fail' },
  ],
  price: [
    { value: 'pass', label: '通过', module: 'price', scenario: 'pass' },
    { value: 'violation', label: '违规', module: 'price', scenario: 'violation' },
    { value: 'fail', label: '失败', module: 'price', scenario: 'fail' },
  ],
  legal: [
    { value: 'pass', label: '通过', module: 'product', scenario: 'pass' },
    { value: 'violation', label: '违规', module: 'product', scenario: 'violation' },
    { value: 'manual', label: '建议自查', module: 'product', scenario: 'manual' },
    { value: 'fail', label: '失败', module: 'product', scenario: 'fail' },
  ],
};

/* ---------------- 合成 ---------------- */

export interface ComposeInput {
  enabled: boolean;
  baseSnapshot: ProductSnapshot;
  baseItems: ItemView[];
  baseStatus: TaskStatus;
  pageState?: string;
  moduleStates?: Record<string, unknown>;
  itemStates?: Record<string, unknown>;
}

export interface ComposeResult {
  snapshot: ProductSnapshot;
  items: ItemView[];
  statusShown: TaskStatus;
  preset: PagePreset;
  moduleValues: Record<ModuleId, string>;
}

export const OVERRIDE_RESET_STATE: Record<string, string> = {
  view_state_basic: 'auto',
  view_state_main: 'auto',
  view_state_sku: 'auto',
  view_state_price: 'auto',
  view_state_size: 'auto',
  view_state_attribute: 'auto',
  view_state_detail: 'auto',
  view_state_product: 'auto',
  item_state_material: 'flow',
  item_state_size: 'flow',
  item_state_ipr: 'flow',
  item_state_category: 'flow',
  item_state_price: 'flow',
  item_state_legal: 'flow',
};

export const DEMO_RESET_STATE: Record<string, string> = {
  page_state: 'flow',
  ...OVERRIDE_RESET_STATE,
};

function scenarioOf(module: ModuleId, value: string): ModuleScenario | undefined {
  return MODULE_SCENARIOS[module].scenarios.find((scenario) => scenario.value === value);
}

function resolvePatch(resolver: SnapshotResolver | undefined, base: ProductSnapshot): SnapshotPatch | undefined {
  if (!resolver) return undefined;
  if (typeof resolver === 'function') return resolver(base);
  return resolver;
}

function contributionSeverity(contribution: ItemContribution): SceneStatus {
  if (contribution.status === 'fail') return 'fail';
  if (contribution.hits && contribution.hits.length > 0) {
    const severities = contribution.hits.map((hit) => hit.severity ?? 'violation');
    if (severities.includes('violation')) return 'violation';
    if (contribution.status === 'manual' || severities.includes('manual') || contribution.hits.some((hit) => hit.severityLabel === '建议自查')) return 'manual';
    return 'suspect';
  }
  if (contribution.status === 'violation' || contribution.status === 'suspect' || contribution.status === 'manual') {
    return contribution.status;
  }
  return 'pass';
}

const STATUS_RANK: Record<SceneStatus, number> = { violation: 4, suspect: 3, manual: 2, fail: 1, pass: 0 };

function itemStatusOf(contributions: ItemContribution[]): SceneStatus {
  return contributions.reduce<SceneStatus>(
    (current, contribution) => {
      const next = contributionSeverity(contribution);
      if (next === 'violation') return 'violation';
      if (next === 'fail' && current === 'pass') return 'fail';
      return STATUS_RANK[next] > STATUS_RANK[current] ? next : current;
    },
    'pass',
  );
}

function defaultConclusion(status: SceneStatus): string {
  if (status === 'violation') return '存在违规';
  if (status === 'suspect') return '存在疑似违规，建议人工审核';
  if (status === 'manual') return '涉及限售规则，建议商家自查';
  if (status === 'fail') return '本项未产生结果';
  return '通过';
}

function buildOutcome(contributions: ItemContribution[], status: SceneStatus): ItemOutcome {
  if (status === 'fail') {
    const fail = contributions.find((contribution) => contribution.status === 'fail') ?? contributions[0];
    return { ...fail, status: 'fail', conclusion: fail.conclusion ?? defaultConclusion('fail') };
  }
  if (contributions.length === 1) {
    const only = contributions[0];
    return { ...only, status, conclusion: only.conclusion ?? defaultConclusion(status) };
  }
  const hits = contributions.flatMap((contribution) => contribution.hits ?? []);
  const violations = hits.filter((hit) => (hit.severity ?? 'violation') === 'violation').length;
  const suspects = hits.filter((hit) => (hit.severity ?? 'violation') === 'suspect').length;
  const notices = hits.filter((hit) => hit.severity === 'manual' || hit.severityLabel === '建议自查').length;
  const parts: string[] = [];
  if (violations) parts.push(`${violations} 处违规`);
  if (suspects) parts.push(`${suspects} 处待确认`);
  if (notices) parts.push(`${notices} 项建议自查`);
  return {
    status,
    hits,
    conclusion: parts.length > 0 ? `存在 ${parts.join('、')}` : defaultConclusion(status),
  };
}

function baseItem(def: { code: ItemCode; name: string; group: string; target: string }, base?: ItemView): ItemView {
  return {
    code: def.code,
    name: def.name,
    group: def.group,
    target: def.target,
    status: base?.status ?? 'queued',
    outcome: base?.outcome,
    override: base?.override,
  };
}

export function composeScene(input: ComposeInput): ComposeResult {
  const preset = PAGE_PRESETS.find((entry) => entry.value === input.pageState) ?? PAGE_PRESETS[0];
  const moduleValues = {} as Record<ModuleId, string>;
  MODULE_ORDER.forEach((id) => {
    const explicit = input.moduleStates?.[MODULE_STATE_KEYS[id]];
    moduleValues[id] = typeof explicit === 'string' && explicit !== 'auto'
      ? explicit
      : (preset.modules[id] ?? 'auto');
  });

  if (!input.enabled) {
    return {
      snapshot: input.baseSnapshot,
      items: input.baseItems,
      statusShown: input.baseStatus,
      preset,
      moduleValues,
    };
  }

  const demoMode = preset.value !== 'flow';
  const baseByCode = new Map(input.baseItems.map((item) => [item.code, item]));
  const contributions = new Map<ItemCode, ItemContribution[]>();
  let snapshot = input.baseSnapshot;

  const addContribution = (code: ItemCode, contribution: ItemContribution) => {
    contributions.set(code, [...(contributions.get(code) ?? []), contribution]);
  };

  MODULE_ORDER.forEach((id) => {
    const scenario = scenarioOf(id, moduleValues[id]);
    if (!scenario) return;
    snapshot = applySnapshotPatch(snapshot, resolvePatch(scenario.snapshot, snapshot));
    Object.entries(scenario.items ?? {}).forEach(([code, contribution]) => {
      if (contribution) addContribution(code as ItemCode, contribution);
    });
  });

  // 单检测项覆盖：整体替换该检测项，并带上该场景自己的商品信息补丁
  ITEM_DEFS.forEach((def) => {
    const value = input.itemStates?.[ITEM_STATE_KEYS[def.code]];
    if (typeof value !== 'string' || value === 'flow') return;
    const option = ITEM_PREVIEW_OPTIONS[def.code].find((entry) => entry.value === value);
    if (!option) return;
    const scenario = scenarioOf(option.module, option.scenario);
    if (!scenario) return;
    snapshot = applySnapshotPatch(snapshot, resolvePatch(scenario.snapshot, snapshot));
    const contribution = scenario.items?.[def.code];
    contributions.set(def.code, contribution ? [contribution] : []);
  });

  const items: ItemView[] = ITEM_DEFS.map((def) => {
    const base = baseByCode.get(def.code);
    const itemContributions = contributions.get(def.code);
    if (itemContributions && itemContributions.length > 0) {
      const status = itemStatusOf(itemContributions);
      return {
        ...baseItem(def, base),
        status: status as ItemStatus,
        outcome: buildOutcome(itemContributions, status),
      };
    }
    if (demoMode) {
      return {
        ...baseItem(def, base),
        status: 'pass' as ItemStatus,
        outcome: PASS[def.code] ?? { status: 'pass', conclusion: '检测通过。' },
      };
    }
    return baseItem(def, base);
  });

  if (demoMode) {
    preset.running?.forEach((code) => {
      const item = items.find((entry) => entry.code === code);
      if (!item) return;
      item.status = 'running';
      item.outcome = undefined;
    });
    // 单项重新检测进行中：先按真实任务显示检测中，检完再落回场景结果
    items.forEach((item) => {
      const base = baseByCode.get(item.code);
      if (base?.status === 'running' && base.override?.retryAt) {
        item.status = 'running';
        item.outcome = undefined;
      }
    });
  }

  return {
    snapshot,
    items,
    statusShown: demoMode ? preset.status : input.baseStatus,
    preset,
    moduleValues,
  };
}
