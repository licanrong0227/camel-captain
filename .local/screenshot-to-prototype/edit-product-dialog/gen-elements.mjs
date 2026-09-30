import { writeJson } from '../../../.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs';

const ASSET_ROOT = 'src/prototypes/edit-product-dialog/assets';
const FONT = '"Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif';

const box = ([x, y, w, h]) => ({ x, y, width: w, height: h });

const htmlNone = (reason) => ({
  textReview: null,
  assetReview: { assetAction: 'none', decisionSource: 'vision-ai', status: 'accepted', reason },
  representation: 'html',
  candidates: [{ id: 'css-box', route: 'html', audit: { status: 'passed', checks: ['纯 CSS 盒，无位图'] } }],
  selectedCandidateId: 'css-box',
});

const htmlText = (content, reason) => ({
  textReview: {
    content,
    textRole: 'ui-text',
    renderMode: 'html-text',
    ocrUsage: 'render',
    decisionSource: 'vision-ai',
    confidence: 0.96,
    reason,
  },
  assetReview: { assetAction: 'none', decisionSource: 'vision-ai', status: 'accepted', reason: '普通界面文字，无需位图素材' },
  representation: 'html',
  candidates: [{ id: 'html-text', route: 'html', audit: { status: 'passed', checks: ['普通字体渲染，非艺术字'] } }],
  selectedCandidateId: 'html-text',
});

const svgIcon = (file, reason) => ({
  textReview: null,
  assetReview: { assetAction: 'reuse', decisionSource: 'vision-ai', status: 'accepted', reason },
  representation: 'svg',
  candidates: [{
    id: `svg-${file}`,
    route: 'svg',
    assetPath: `${ASSET_ROOT}/icons/${file}.svg`,
    audit: { status: 'passed', checks: ['矢量重建，尺寸与截图一致', '单色描边，无位图边缘'] },
  }],
  selectedCandidateId: `svg-${file}`,
});

const bitmap = (file, w, h, reason) => ({
  textReview: null,
  assetReview: { assetAction: 'reuse', decisionSource: 'vision-ai', status: 'accepted', reason },
  representation: 'clean-crop',
  candidates: [{
    id: `crop-${file}`,
    route: 'clean-crop',
    assetPath: `${ASSET_ROOT}/${file}.png`,
    backgroundMode: 'preserve',
    width: w,
    height: h,
    audit: { status: 'passed', checks: [`按 ${w}x${h} 精确裁切`, '1:1 原始分辨率，未放大'] },
  }],
  selectedCandidateId: `crop-${file}`,
});

const el = (id, name, rect, style, review, kind) => ({
  id,
  name,
  kind: kind || 'region',
  uiRole: kind === 'button' ? 'button' : undefined,
  sourceBBox: box(rect),
  targetBBox: box(rect),
  ...(style ? { visualStyle: { fontFamily: FONT, ...style } } : {}),
  ...review,
});

const icon = (id, name, rect, file, reason) => el(id, name, rect, { zIndex: 13 }, svgIcon(file, reason));

const elements = [];

/* ---------- 背景页面（弹窗之外，仅做压暗底，用户范围外） ---------- */
elements.push(
  el('bd-page', '背景页面底色', [0, 0, 1912, 867], { backgroundColor: '#f0f1f5', zIndex: 1 },
    htmlNone('纯色背景，无文字无素材')),
  el('bd-nav', '背景顶部导航条', [0, 0, 1912, 44], { backgroundColor: '#ffffff', zIndex: 2 },
    htmlNone('纯色背景，弹窗遮罩下不可辨识，不做还原')),
  el('bd-content', '背景内容白底区域', [0, 141, 1912, 710], { backgroundColor: '#ffffff', zIndex: 2 },
    htmlNone('纯色背景，无文字无素材')),
  el('bd-side-tab', '背景右侧悬浮入口', [1856, 498, 56, 34], {
    backgroundColor: '#ffffff', border: '1px solid #e4e7ed', borderRadius: '4px 0 0 4px', zIndex: 2,
  }, htmlNone('容器盒，内部文字被遮罩压暗，不做还原')),
  el('overlay', '弹窗遮罩层', [0, 0, 1912, 867], { backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 5 },
    htmlNone('半透明遮罩，实测压暗值 127 对应 50% 黑')),
);

/* ---------- 弹窗容器 ---------- */
elements.push(
  el('modal', '编辑产品弹窗', [96, 52, 1720, 780], {
    backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 2px 12px 0 rgba(0,0,0,0.1)', zIndex: 10,
  }, htmlNone('弹窗容器盒')),
  el('modal-title', '弹窗标题', [116, 71, 74, 26], {
    fontSize: '18px', lineHeight: '26px', color: '#303133', zIndex: 11,
  }, htmlText('编辑产品', '常规无衬线中文标题，实测字宽 18px/字，非艺术字')),
  icon('modal-close', '关闭图标', [1779, 70, 20, 20], 'close', '线性图标，矢量重建更清晰'),
  el('list-panel', '左侧商品列表容器', [96, 52, 250, 780], {
    backgroundColor: '#ffffff', borderRadius: '8px 0 0 8px', zIndex: 10,
  }, htmlNone('列表容器盒')),
);

/* ---------- 商品列表 ---------- */
const titles = [
  '【全新正品未拆封】i17Pr…',
  '纯色北欧桌布防水防油免…',
  '2026 Summer Full-Print P…',
  'Summer Women’S Slipper…',
  'Acupressure Foot Massag…',
  'ASHALI Cute Bear Breath…',
  'Designer womens Croppe…',
  '天然淡水珍珠长款项链女…',
  '智能感应垃圾桶家用卧室…',
  'Women Simple Gold Chai…',
];

for (let i = 0; i < 10; i += 1) {
  const top = 120 + 62 * i;
  const selected = i === 0;
  elements.push(
    el(`product-item-${i + 1}`, `商品行 ${i + 1}`, [116, top, 220, 58], {
      backgroundColor: selected ? '#fffaf5' : '#ffffff',
      border: selected ? '1px solid #ffb366' : '1px solid #ffffff',
      borderRadius: '4px',
      zIndex: 11,
    }, htmlNone('列表行容器盒')),
    el(`product-thumb-${i + 1}`, `商品缩略图 ${i + 1}`, [125, top + 9, 40, 40], {
      objectFit: 'cover', borderRadius: '2px', zIndex: 12,
    }, bitmap(`product-thumb-${i + 1}`, 40, 40, '商品实拍图，必须保留像素，按 40x40 原图裁切')),
    el(`product-title-${i + 1}`, `商品标题 ${i + 1}`, [172, top + 9, 164, 20], {
      fontSize: '12px', lineHeight: '20px', color: '#303133', whiteSpace: 'nowrap', zIndex: 12,
    }, htmlText(titles[i], '列表正文文字，源图即为单行截断显示')),
    el(`product-status-${i + 1}`, `编辑状态 ${i + 1}`, [172, top + 30, 60, 18], {
      fontSize: '12px', lineHeight: '18px', color: '#909399', zIndex: 12,
    }, htmlText('未编辑', '次要状态文字')),
  );
}

elements.push(
  icon('item-icon-trash', '删除图标（选中行）', [292, 151, 16, 16], 'trash', '线性图标，矢量重建'),
  icon('item-icon-folder-check', '完成图标（选中行）', [312, 151, 16, 16], 'folder-check', '面性图标，矢量重建'),
  el('list-pager-prev-box', '列表翻页上一页', [190, 746, 28, 28], {
    backgroundColor: '#f5f7fa', borderRadius: '4px', zIndex: 11,
  }, htmlNone('按钮底盒')),
  icon('list-pager-prev-icon', '上一页箭头', [198, 752, 12, 16], 'pager-prev', '箭头图标，矢量重建'),
  el('list-pager-next-box', '列表翻页下一页', [234, 746, 28, 28], {
    backgroundColor: '#ffffff', border: '1px solid #409eff', borderRadius: '4px', zIndex: 11,
  }, htmlNone('按钮底盒')),
  icon('list-pager-next-icon', '下一页箭头', [242, 752, 12, 16], 'pager-next', '箭头图标，矢量重建'),
);

/* ---------- 右侧 Tabs ---------- */
elements.push(
  icon('tab-collapse-icon', '收起列表图标', [348, 120, 12, 12], 'collapse', '双箭头线性图标，矢量重建'),
  el('tab-basic', '页签 基本', [369, 117, 32, 20], {
    fontSize: '14px', lineHeight: '20px', color: '#606266', zIndex: 11,
  }, htmlText('基本', '普通页签文字')),
  el('tab-divider-1', '页签分隔线 1', [412, 121, 1, 12], { backgroundColor: '#e7e9ee', zIndex: 11 },
    htmlNone('分隔线')),
  el('tab-detail', '页签 详情', [424, 117, 32, 20], {
    fontSize: '14px', lineHeight: '20px', color: '#ff781f', zIndex: 11,
  }, htmlText('详情', '当前激活页签文字')),
  el('tab-divider-2', '页签分隔线 2', [468, 121, 1, 12], { backgroundColor: '#e7e9ee', zIndex: 11 },
    htmlNone('分隔线')),
  el('tab-log', '页签 日志', [481, 117, 30, 20], {
    fontSize: '14px', lineHeight: '20px', color: '#606266', zIndex: 11,
  }, htmlText('日志', '普通页签文字')),
);

/* ---------- 富文本编辑器 ---------- */
elements.push(
  el('editor-box', '富文本编辑器外框', [346, 148, 1450, 629], {
    backgroundColor: '#ffffff', border: '1px solid #cccccc', zIndex: 11,
  }, htmlNone('编辑器容器盒')),
  el('editor-toolbar-line', '工具栏分隔线', [347, 193, 1448, 1], { backgroundColor: '#cccccc', zIndex: 12 },
    htmlNone('分隔线')),
  el('tb-bold', '加粗按钮', [356, 157, 26, 28], {
    fontSize: '14px', lineHeight: '28px', fontWeight: 700, color: '#444444', textAlign: 'center', zIndex: 12,
  }, htmlText('B', '工具栏字符图标，源产品即用字母表示')),
  el('tb-italic', '斜体按钮', [384, 157, 26, 28], {
    fontSize: '14px', lineHeight: '28px', fontStyle: 'italic', fontWeight: 700, color: '#444444',
    textAlign: 'center', zIndex: 12,
  }, htmlText('I', '工具栏字符图标')),
  el('tb-underline', '下划线按钮', [412, 157, 26, 28], {
    fontSize: '14px', lineHeight: '28px', fontWeight: 700, textDecoration: 'underline', color: '#444444',
    textAlign: 'center', zIndex: 12,
  }, htmlText('U', '工具栏字符图标')),
  el('tb-font-size', '字号选择', [461, 157, 54, 28], {
    fontSize: '12px', lineHeight: '28px', color: '#444444', textAlign: 'center', zIndex: 12,
  }, htmlText('默认大小', '下拉选择器文字')),
  icon('tb-font-size-caret', '字号下拉箭头', [515, 164, 10, 14], 'caret', '上下双箭头，矢量重建'),
  icon('tb-font-color', '字色按钮', [554, 164, 14, 14], 'font-color', '字母 A + 色条，矢量重建'),
  icon('tb-list-ul', '无序列表', [597, 164, 14, 14], 'list-ul', '线性图标，矢量重建'),
  icon('tb-list-ol', '有序列表', [625, 164, 14, 14], 'list-ol', '线性图标，矢量重建'),
  icon('tb-align', '对齐方式', [668, 164, 14, 14], 'align-left', '线性图标，矢量重建'),
  icon('tb-image', '插入图片（激活）', [708, 157, 28, 28], 'image', '蓝色实底图标按钮，矢量重建'),
  icon('tb-clear-format', '清除格式', [757, 164, 16, 14], 'clear-format', 'Tx 图标，矢量重建'),
  el('detail-poster', '详情海报图', [362, 206, 1000, 570], { objectFit: 'cover', zIndex: 12 }, {
    textReview: {
      content: '新品上市 强势登场 i17ProMax',
      textRole: 'display-text',
      renderMode: 'preserve-in-image',
      ocrUsage: 'semantic-only',
      decisionSource: 'vision-ai',
      confidence: 0.95,
      reason: '海报内的商品宣传艺术字属于位图内容，保留在图片中，不用普通字体重排',
    },
    assetReview: {
      assetAction: 'reuse',
      decisionSource: 'vision-ai',
      status: 'accepted-with-warning',
      reason: '电商详情长图，源图在编辑器内被裁切到 570px 高，按可见区域原样裁切复用',
    },
    representation: 'clean-crop',
    candidates: [{
      id: 'crop-detail-poster',
      route: 'clean-crop',
      assetPath: `${ASSET_ROOT}/detail-poster.png`,
      backgroundMode: 'preserve',
      width: 1000,
      height: 570,
      audit: {
        status: 'accepted-with-warning',
        checks: ['按可见区域 1000x570 精确裁切', '1:1 原始分辨率，未放大'],
        warnings: ['海报下半部分在源截图中被编辑器容器裁切，无法还原完整长图'],
      },
    }],
    selectedCandidateId: 'crop-detail-poster',
  }),
  icon('float-scroll-up', '上滚圆形按钮', [1752, 699, 28, 28], 'arrow-up', '圆形描边箭头按钮，矢量重建'),
  icon('float-scroll-down', '下滚圆形按钮', [1752, 735, 28, 28], 'arrow-down', '圆形描边箭头按钮，矢量重建'),
);

/* ---------- 底部按钮 ---------- */
elements.push(
  el('btn-close', '关闭按钮', [877, 786, 73, 36], {
    backgroundColor: '#ffffff', border: '1px solid #ff781f', borderRadius: '8px',
    color: '#ff781f', fontSize: '14px', lineHeight: '34px', textAlign: 'center', letterSpacing: '3px', zIndex: 11,
  }, htmlText('关闭', '次要按钮文字'), 'button'),
  el('btn-save', '保存按钮', [961, 786, 74, 36], {
    backgroundColor: '#ff781f', border: '1px solid #ff781f', borderRadius: '8px',
    color: '#ffffff', fontSize: '14px', lineHeight: '34px', textAlign: 'center', letterSpacing: '3px', zIndex: 11,
  }, htmlText('保存', '主按钮文字'), 'button'),
);

writeJson('.local/screenshot-to-prototype/edit-product-dialog/elements.json', { schemaVersion: 1, elements });
console.log(`elements: ${elements.length}`);
