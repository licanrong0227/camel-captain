import { ItemCode, ItemOutcome } from './scenarios';

export type PreviewStatus = 'pass' | 'violation' | 'suspect' | 'fail';

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
      outcome: { status: 'pass', conclusion: '该类目未要求提供材质属性或材质属性值合法，且与首张主图识别的材质一致。' },
    },
    {
      value: 'value_missing',
      label: '违规·材质无效',
      status: 'violation',
      outcome: {
        status: 'violation',
        conclusion: '材质属性值无效',
        hitReason: '已检测到「Material」属性字段，但取值为空，属于无效材质描述',
        hitPosition: '商品属性区 · Material',
        suggestion: '修改 Material 字段取值，建议值：聚酯纤维（Polyester）',
        suggestionValue: 'Polyester（聚酯纤维）',
        reference: [
          { kind: 'text', field: '商品属性', fragment: 'Material: (空)', word: 'Material: (空)' },
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
        hitReason: '商品属性填写为「Wool 100%」，AI 识别首张主图材质为聚酯纤维（Polyester），与属性填写不一致',
        hitPosition: '商品属性区 / 首张主图',
        suggestion: '核实实物材质，将属性修正为与主图一致（建议：聚酯纤维 Polyester）',
        suggestionValue: 'Polyester（聚酯纤维）',
        reference: [
          { kind: 'text', field: '商品属性', fragment: 'Material: Wool 100%', word: 'Wool 100%' },
          { kind: 'image', label: '首张主图', src: 'suit' },
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
        hitReason: 'AI无法准确判断材质',
        hitPosition: '首张主图',
        suggestion: '人工核对材质属性描述；如图片反光请重新上传清晰主图',
        reference: [
          { kind: 'image', label: '首张主图', src: 'suit' },
        ],
      },
    },
    {
      value: 'fail',
      label: '检测失败',
      status: 'fail',
      outcome: {
        status: 'fail',
        conclusion: '材质检测未产生结果',
        failReason: '首张主图 AI 材质识别服务调用超时，本次检测中断，未产生结果',
      },
    },
  ],

  size: [
    {
      value: 'pass',
      label: '通过',
      status: 'pass',
      outcome: { status: 'pass', conclusion: '该类目未要求提供尺码表或SKU 尺码、系统尺码表与详情尺码表数据有效且一致。' },
    },
    {
      value: 'chart_invalid',
      label: '违规·尺码表无效',
      status: 'violation',
      outcome: {
        status: 'violation',
        conclusion: '尺码表数据无效',
        hitReason: '详情图尺码表中 M 码袖长、衣长为空，XL 码整行没有有效数值，属于无效尺码行',
        hitPosition: '详情图尺码表 · M 码 / XL 码',
        suggestion: '补全 M 码的袖长与衣长实测值；XL 码确实没有数据时删除该行，不要保留空行',
        reference: [
          {
            kind: 'table',
            label: '详情图尺码表采集结果（cm）',
            columns: ['尺码', '胸围', '肩宽', '袖长', '衣长'],
            rows: [
              { cells: ['S', '96', '42', '58', '68'] },
              { cells: ['M', '100', '44', '-', '-'], bad: [3, 4] },
              { cells: ['L', '104', '46', '60', '76'] },
              { cells: ['XL', 'null', 'null', 'null', 'null'], bad: [1, 2, 3, 4] },
            ],
          },
          {
            kind: 'list',
            label: '判定为无效的尺码行',
            items: ['M 码：袖长、衣长为空', 'XL 码：整行均为 null，无有效数值'],
          },
        ],
      },
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
      value: 'gender_unmarked',
      label: '违规·未按性别区分',
      status: 'violation',
      outcome: {
        status: 'violation',
        conclusion: 'SKU 男女款尺码不同，尺码表只给了一组通用数据',
        hitReason: 'SKU 里男款为 S / M / L、女款为 4 / 6 / 8，两套尺码并不相同；但详情图尺码表只给了一组通用尺码，没有按男款、女款分别标注',
        hitPosition: 'SKU 尺码分组 / 详情图尺码表',
        suggestion: '在尺码表中分别给出男款、女款两套尺码数据（各自的尺码标签与实测参数）；若男女款尺码本就一致、只是图案不同，保留一组通用数据即可',
        reference: [
          {
            kind: 'list',
            label: 'SKU 尺码分组',
            items: ['男款（Men）：S / M / L', '女款（Women）：4 / 6 / 8', '两套尺码标签不属于同一体系'],
          },
          {
            kind: 'table',
            label: '详情图尺码表（只有一组通用数据）',
            columns: ['尺码', '胸围', '腰围', '衣长', '适用性别'],
            rows: [
              { cells: ['S', '96', '80', '68', '未标注'], bad: [4] },
              { cells: ['M', '100', '84', '70', '未标注'], bad: [4] },
              { cells: ['L', '104', '88', '72', '未标注'], bad: [4] },
            ],
          },
          {
            kind: 'list',
            label: 'SKU 与尺码表的对应情况',
            items: ['男款 S / M / L：尺码表未单独标注男款数据', '女款 4 / 6 / 8：尺码表中找不到对应尺码'],
          },
        ],
      },
    },
    {
      value: 'sku_mismatch',
      label: '违规·在售尺码不一致',
      status: 'violation',
      outcome: {
        status: 'violation',
        conclusion: '在售尺码与尺码表不一致',
        hitReason: 'SKU 在售尺码为 S、M、L、XL，系统尺码模板缺少 XL，详情图尺码表缺少 XL 且多出均码，三处尺码范围对不上',
        hitPosition: 'SKU 尺码 / 系统尺码模板 / 详情图尺码表',
        suggestion: '对齐在售尺码与两处尺码表：补齐 XL 码数据，删除详情表中多余的均码行，或下架无对应尺码表的 SKU',
        reference: [
          { kind: 'list', label: 'SKU 在售尺码', items: ['S', 'M', 'L', 'XL'] },
          {
            kind: 'table',
            label: '在售尺码 vs 系统尺码模板',
            columns: ['SKU 在售尺码', '系统模板', '比对结果'],
            rows: [
              { cells: ['S', 'S', '一致'] },
              { cells: ['M', 'M', '一致'] },
              { cells: ['L', 'L', '一致'] },
              { cells: ['XL', '-', '系统模板缺少该尺码'], bad: [1, 2] },
            ],
          },
          {
            kind: 'table',
            label: '在售尺码 vs 详情图尺码表',
            columns: ['SKU 在售尺码', '详情图尺码表', '比对结果'],
            rows: [
              { cells: ['S', 'S', '一致'] },
              { cells: ['M', 'M', '一致'] },
              { cells: ['L', 'L', '一致'] },
              { cells: ['XL', '-', '详情表缺少该尺码'], bad: [1, 2] },
              { cells: ['-', '均码', '详情表多出该尺码'], bad: [0, 2] },
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
        hitReason: '详情图尺码表不清晰，未能有效识别图中文字，无法与系统尺码模板比对',
        hitPosition: '详情图第 3 张',
        suggestion: '人工核对详情图尺码表；如图片模糊请重新上传清晰尺码表图',
        reference: [
          { kind: 'image', label: '详情图尺码表', src: 'size-chart' },
          { kind: 'ocr', label: '图片文字识别结果（片段）', lines: [
            { text: 'Size  Chest  Length' },
            { text: 'S     96     68' },
            { text: 'M     102    ??', hit: true },
            { text: 'L     ?12    72', hit: true },
          ] },
        ],
      },
    },
    {
      value: 'fail',
      label: '检测失败',
      status: 'fail',
      outcome: {
        status: 'fail',
        conclusion: '尺码检测未产生结果',
        failReason: '详情图尺码表文字识别服务异常，未完成识别与比对，未产生结果',
      },
    },
  ],

  ipr: [
    {
      value: 'pass',
      label: '通过',
      status: 'pass',
      outcome: { status: 'pass', conclusion: '未检测到侵权词、高危品牌词与品牌 logo。' },
    },
    {
      value: 'multi_violation',
      label: '违规·多处出现',
      status: 'violation',
      outcome: {
        status: 'violation',
        conclusion: '存在 2 处违规、1 项疑似违规：标题品牌词 + 图片 logo，另有形似图案待人工确认',
        hits: [
          {
            reason: '标题包含高危品牌词「Gucci Style」',
            position: '商品标题',
            reference: [
              { kind: 'text', field: '商品标题', fragment: 'Premium Cotton Tee, Gucci Style Streetwear, Vintage Print', word: 'Gucci Style' },
              { kind: 'list', label: '比对到的词库', items: ['高危品牌词库 · 「Gucci Style」'] },
            ],
            suggestion: '删除标题中的品牌相关词',
          },
          {
            reason: '主图识别到近似某品牌 monogram 图案',
            position: '主图',
            reference: [
              { kind: 'image', label: '违规图片', src: 'sneaker' },
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
            ],
            suggestion: '更换不含品牌近似图案的主图与详情图',
          },
          {
            severity: 'suspect',
            reason: '详情图包袋的金属扣件外形与某品牌经典锁扣接近，但侵权词库未收录该图案，无法直接判定',
            position: '详情图第 2 张',
            reference: [
              { kind: 'image', label: '首张主图', src: 'bag' },
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
              { kind: 'list', label: '词库比对', items: ['高危品牌词库：未出现匹配词', '形似图案提示：锁扣类品牌元素'] },
            ],
            suggestion: '人工确认扣件造型是否构成品牌近似；如构成请更换该图片',
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
        conclusion: '发现 2 项疑似违规，建议人工审核',
        hits: [
          {
            reason: '标题出现「Adidos」，与高危品牌「adidas」高度相似但未收录于侵权词库',
            position: '商品标题',
            reference: [
              { kind: 'text', field: '商品标题', fragment: 'Running Shoes Men, Adidos Inspired Sport Style', word: 'Adidos' },
              { kind: 'list', label: '词库比对', items: ['高危品牌词库：未出现匹配词', '形近词提示：adidas'] },
            ],
            suggestion: '人工确认标题是否为混淆词，如非本意请替换相关表述',
          },
          {
            reason: '主图疑似包含某品牌商标元素',
            position: '主图',
            reference: [
              { kind: 'image', label: '首张主图', src: 'sneaker' },
              {
                kind: 'gallery',
                label: '对比图库',
                note: '外观接近但未达违规判定标准的库内样本，供人工比对',
                groups: [
                  {
                    label: '品牌元素图库 · 系列 A',
                    images: [{ src: 'logo-a-1', caption: '' }],
                  },
                ],
              },
            ],
            suggestion: '人工确认图片是否为品牌图案，如是请更换图片',
          },
        ],
      },
    },
    {
      value: 'fail',
      label: '检测失败',
      status: 'fail',
      outcome: {
        status: 'fail',
        conclusion: '侵权风险检查未产生结果',
        failReason: '图片特征检测服务不可用，词库比对未完成，未产生结果',
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
          {
            kind: 'table',
            label: '类目对比',
            columns: ['候选类目', '结论'],
            rows: [
              { cells: ['男士西装', '最贴合，推荐'], bad: [] },
              { cells: ['商务西装', '兼容，可选'], bad: [] },
              { cells: ['西服外套', '兼容但粒度较粗，可选'], bad: [] },
              { cells: ['男士外套', '当前类目，兼容性弱'], bad: [1] },
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
        conclusion: '主图商品类型无法判读，建议人工审核',
        hitReason: '主图中包含多件不同类型商品，AI 无法确定主体商品类型',
        hitPosition: '首张主图',
        suggestion: '人工确认主体商品与当前类目是否匹配；建议主图仅保留主体商品',
        reference: [
          { kind: 'image', label: '首张主图', src: 'suit' },
        ],
      },
    },
    {
      value: 'fail',
      label: '检测失败',
      status: 'fail',
      outcome: {
        status: 'fail',
        conclusion: '类目检查未产生结果',
        failReason: '类目推荐接口调用失败，未返回候选类目，无法完成比对',
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
          { kind: 'formula', label: '阈值公式', lines: ['最高价 = $89.00', '阈值 = 最高价 × 10% = $8.90', '触发违规的最低价 = $5.20（XS 码）'], result: '$5.20 < $8.90，判定为价格违规' },
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
    {
      value: 'fail',
      label: '检测失败',
      status: 'fail',
      outcome: {
        status: 'fail',
        conclusion: '价格检测未产生结果',
        failReason: '批发阶梯价数据解析异常（接口返回字段缺失），未产生结果',
      },
    },
  ],

  legal: [
    {
      value: 'pass',
      label: '通过',
      status: 'pass',
      outcome: { status: 'pass', conclusion: '未发现违反禁售规则、限售资质要求或赌博类违规。' },
    },
    {
      value: 'multi_violation',
      label: '违规·多项并存',
      status: 'violation',
      outcome: {
        status: 'violation',
        conclusion: '存在 5 项违规、1 项疑似违规：禁售、限售资质不全、赌博词、赌博网址、销售赌博机，另有一处管制器具描述待人工确认',
        hits: [
          {
            reason: '商品详情文字出现「comes with 2 refill cartridges (e-Liquid Pod), vape pen refillable」，即烟弹与注油烟具，对应《禁止销售产品规则》烟酒类「所有电子烟及其配件相关产品」，属严重违规',
            position: '商品详情文本',
            reference: [
              {
                kind: 'text',
                field: '详情文本',
                fragment: '2026 New Smart Handbag, comes with 2 refill cartridges (e-Liquid Pod), vape pen refillable, fits most devices',
                word: 'e-Liquid Pod',
              },
              { kind: 'list', label: '禁售比对 · 规则库', items: ['《禁止销售产品规则》烟酒类 · 所有电子烟及其配件相关产品（严重违规）'] },
            ],
            suggestion: '删除详情文本中电子烟及配件相关描述；如实物本身即电子烟配件，请下架该商品',
          },
          {
            reason: '商品内置蓝牙音箱模块与 LED 灯带，对应《限售商品管理规则》中「无线电射频设备」和「照明灯饰」两个限售品类：销往美国需提供 FCC 认证文件，销往欧盟需提供 CE 认证，当前均未提交',
            position: '资质项',
            reference: [
              {
                kind: 'table',
                label: '限售资质 · 缺失项',
                columns: ['资质项', '适用市场', '规则要求', '当前状态'],
                rows: [
                  { cells: ['FCC SDoC 或 FCC 认证文件', '美国', '无线电射频设备、带无线功能的灯饰必须提供', '未提交'], bad: [3] },
                  { cells: ['CE 认证', '欧盟', '无线电射频设备、照明灯饰必须提供', '未提交'], bad: [3] },
                  { cells: ['营业执照（含对应经营范围）', '全部市场', '经营限售品类必须包含对应经营范围', '未上传'], bad: [3] },
                ],
              },
              {
                kind: 'list',
                label: '限售比对 · 规则库',
                items: ['《无线电射频设备限售管理规则》（美国：FCC SDoC 或 FCC 认证；欧盟：CE 认证）', '《照明灯饰限售管理规则》（美国：UL 认证或检测报告、FCC 认证；欧盟：CE 认证）'],
              },
            ],
            suggestion: '在资质项中上传上述认证文件后重新提交检测',
          },
          {
            reason: '商品详情文字出现赌博类词「casino slots」',
            position: '商品详情文本',
            reference: [
              {
                kind: 'text',
                field: '详情文本',
                fragment: 'Weekly lucky draw: play casino slots on our partner page to get a 20% off coupon for any handbag',
                word: 'casino slots',
              },
              { kind: 'list', label: '赌博比对 · 词库', items: ['赌博类词库 · 「casino slots」'] },
            ],
            suggestion: '删除详情文本中的赌博类文案',
          },
          {
            reason: '详情图内文字识别出赌博网址 bet-xxx.example',
            position: '详情图第 2 张',
            reference: [
              { kind: 'image', label: '详情图', src: 'bag' },
              { kind: 'ocr', label: '图片文字识别（片段）', lines: [
                { text: 'Fashion Bag 2026 New Arrival' },
                { text: 'Play casino slots at bet-xxx.example', hit: true },
                { text: 'Free shipping worldwide' },
              ] },
              { kind: 'list', label: '赌博比对 · 网址库', items: ['赌博网址库 · bet-xxx.example'] },
            ],
            suggestion: '修改或删除含赌博网址的图片',
          },
          {
            reason: '商品实物识别为老虎机（赌博机），属于赌博工具',
            position: '商品主图',
            reference: [
              { kind: 'image', label: '命中的商品主图', src: 'gambling-slot-1' },
              {
                kind: 'gallery',
                label: '赌博比对 · 图库样本',
                note: '库内赌博机样本，供人工比对',
                groups: [
                  {
                    label: '赌博机比对库 · 老虎机系列',
                    images: [{ src: 'gambling-slot-2', caption: '老虎机样本' }],
                  },
                ],
              },
            ],
            suggestion: '所售商品本身即赌博机，请下架商品，不可继续上架',
          },
          {
            severity: 'suspect',
            reason: '详情文字出现「detachable metal handcuff style charm」，对应《禁止销售产品规则》管制器具类「刑具及限制自由工具（手铐）」，但描述更像装饰挂件，未核实实物',
            position: '商品详情文本',
            reference: [
              {
                kind: 'text',
                field: '详情文本',
                fragment: 'Detachable metal handcuff style charm on the shoulder strap, purely decorative',
                word: 'handcuff style charm',
              },
              { kind: 'list', label: '禁售比对 · 规则库', items: ['《禁止销售产品规则》管制器具类 · 刑具及限制自由工具（商品品类待人工确认）'] },
            ],
            suggestion: '人工确认该金属件是否具备实际束缚功能；如具备请下架，如仅为装饰建议改写描述减少歧义',
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
        conclusion: '发现 2 项疑似违规，建议人工审核',
        hits: [
          {
            reason: '主图中包身金属扣件外形类似手铐，对应《禁止销售产品规则》管制器具类「刑具及限制自由工具（手铐）」，但无法从图片判断其是否仅为装饰元素',
            position: '首张主图',
            reference: [
              { kind: 'image', label: '首张主图', src: 'bag' },
              { kind: 'list', label: '禁售比对 · 规则库', items: ['《禁止销售产品规则》管制器具类 · 刑具及限制自由工具（商品品类待人工确认）'] },
            ],
            suggestion: '人工确认扣件是否具备实际束缚功能；如具备请下架该商品，如仅为装饰建议更换扣件样式减少歧义',
          },
          {
            reason: '商品标题含「Tactical Style」，对应《（美国）禁止销售产品规则》军警用品类「军警专用的设备、器械」，但表述更像风格描述，未核实实物',
            position: '商品标题',
            reference: [
              { kind: 'text', field: '商品标题', fragment: 'Fashion Handbag With Detachable Metal Clip, Tactical Style', word: 'Tactical Style' },
              { kind: 'list', label: '地区禁售比对 · 规则库', items: ['《（美国）禁止销售产品规则》军警用品类（仅提示美国市场不能销售，不影响其他市场）'] },
            ],
            suggestion: '人工确认商品是否具备军警实际用途；如仅为风格描述，建议修改标题措辞避免歧义',
          },
        ],
      },
    },
    {
      value: 'fail',
      label: '检测失败',
      status: 'fail',
      outcome: {
        status: 'fail',
        conclusion: '违法违规检查未产生结果',
        failReason: '禁售/限售规则库比对任务中断，识别未完成，未产生结果',
      },
    },
  ],
};
export type ConclusionLevel = 'reject' | 'pass' | 'manual' | 'partial' | 'checking';

export interface ConclusionScenario {
  value: string;
  label: string;
  level: ConclusionLevel;
  counts: { hit: number; suspect: number; pass: number; fail: number };
  text: string;
}

export const CONCLUSION_SCENARIOS: ConclusionScenario[] = [
  {
    value: 'reject',
    label: '不通过',
    level: 'reject',
    counts: { hit: 3, suspect: 1, pass: 2, fail: 0 },
    text: '不通过：商品存在 3 处违规，请逐项处理后重新提交检测。',
  },
  {
    value: 'pass',
    label: '通过',
    level: 'pass',
    counts: { hit: 0, suspect: 0, pass: 6, fail: 0 },
    text: '通过：各质检项均未发现违规。',
  },
  {
    value: 'manual',
    label: '待人工确认',
    level: 'manual',
    counts: { hit: 0, suspect: 2, pass: 4, fail: 0 },
    text: '需人工确认：商品存在 2 处疑似违规，请结合参考信息人工复核。',
  },
  {
    value: 'partial',
    label: '部分失败',
    level: 'partial',
    counts: { hit: 0, suspect: 0, pass: 4, fail: 2 },
    text: '部分完成：2 项检测失败，结论仅供参考，请重试失败项。',
  },
  {
    value: 'checking',
    label: '检测中',
    level: 'checking',
    counts: { hit: 0, suspect: 0, pass: 0, fail: 0 },
    text: '检测中：各质检项独立执行，结果将逐项返回。',
  },
];
