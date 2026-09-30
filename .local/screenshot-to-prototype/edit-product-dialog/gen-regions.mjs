import { writeJson } from '../../../.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs';

const W = 1912;
const H = 867;
const EPS = 0.25;
const nb = ([l, t, r, b]) => ({
  left: +((l + EPS) * 1000 / W).toFixed(4),
  top: +((t + EPS) * 1000 / H).toFixed(4),
  right: +((r - EPS) * 1000 / W).toFixed(4),
  bottom: +((b - EPS) * 1000 / H).toFixed(4),
});

const poster = [362, 206, 1362, 776];
const thumbs = Array.from({ length: 10 }, (_, i) => [125, 129 + 62 * i, 165, 169 + 62 * i]);

writeJson('layer-recall-pass-1.json', {
  schemaVersion: 1,
  status: 'ok',
  provider: 'current-agent',
  kind: 'assets',
  sourceImage: 'C:/Users/admin/.qoder-cn/tmp/D--projects-CAMEL-CAPTAIN/images/b96346c0-ad63-41a3-b694-2fb1796b25ca/0b095075-57d9-42a8-ad94-1f007d0eb8ec.png',
  regions: [
    { id: 'detail-poster', label: '详情富文本中的 iPhone 17 Pro Max 竖版海报', bounds: nb(poster), confidence: 0.98, route: 'reuse-crop' },
    ...thumbs.map(([l, t, r, b], i) => ({
      id: `product-thumb-${i + 1}`,
      label: `商品列表第 ${i + 1} 行商品缩略图`,
      bounds: nb([l, t, r, b]),
      confidence: 0.97,
      route: 'reuse-crop',
    })),
  ],
});

const texts = [
  ['dialog-title', '编辑产品', [112, 70, 190, 95]],
  ['tab-bar', '« 基本 | 详情 | 日志', [344, 116, 514, 138]],
  ['toolbar', 'B I U 默认大小 A 列表 对齐 图片 清除格式', [356, 152, 786, 190]],
  ['footer-buttons', '关闭 保存', [874, 783, 1038, 824]],
  ...Array.from({ length: 10 }, (_, i) => [
    `product-text-${i + 1}`,
    '商品标题（截断）/ 未编辑',
    [168, 126 + 62 * i, 338, 168 + 62 * i],
  ]),
  ['backdrop-nav', '顶部导航文字', [0, 10, 1120, 40]],
  ['backdrop-left', '背景页面左侧文字', [0, 55, 96, 130]],
  ['backdrop-tab', '右侧悬浮入口', [1850, 500, 1912, 530]],
];

writeJson('vision-text.json', {
  schemaVersion: 1,
  status: 'ok',
  provider: 'current-agent',
  kind: 'text',
  regions: texts.map(([id, text, box]) => ({ id, text, bounds: nb(box), confidence: 0.95 })),
});
