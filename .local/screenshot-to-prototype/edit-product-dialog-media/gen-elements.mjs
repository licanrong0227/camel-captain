import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'D:/projects/CAMEL CAPTAIN';
const SLUG = 'edit-product-dialog-media';
const PROTO = path.join(ROOT, 'src/prototypes', SLUG);
const LOCAL = path.join(ROOT, '.local/screenshot-to-prototype', SLUG);
const FONT = '"Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif';

fs.mkdirSync(path.join(PROTO, 'assets/icons'), { recursive: true });
fs.mkdirSync(path.join(PROTO, '.spec/reconstruction'), { recursive: true });

// 1) copy photo crops
for (const f of fs.readdirSync(path.join(LOCAL, 'final/references'))) {
  if (f.endsWith('.png')) fs.copyFileSync(path.join(LOCAL, 'final/references', f), path.join(PROTO, 'assets', f));
}

// 2) svg icons
const svg = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${body}</svg>`;
const G = '#909399', O = '#ff781f';
const icons = {
  'close.svg': svg(15, 15, `<path d="M2 2l11 11M13 2L2 13" stroke="${G}" stroke-width="1.4" stroke-linecap="round"/>`),
  'collapse.svg': svg(14, 16, `<path d="M8.5 3.5L3.5 8l5 4.5M13 3.5L8 8l5 4.5" stroke="${G}" stroke-width="1.3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
  'trash.svg': svg(14, 15, `<path d="M2.5 4h9M5.5 4V2.5h3V4M4 4l.7 8.5h4.6L10 4" stroke="${O}" stroke-width="1.1" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
  'mail.svg': svg(16, 14, `<rect x="1.5" y="2" width="13" height="10" rx="1.5" stroke="#67C23A" stroke-width="1.1" fill="none"/><path d="M2 3.5l6 4.5 6-4.5" stroke="#67C23A" stroke-width="1.1" fill="none" stroke-linecap="round"/>`),
  'pager-prev.svg': svg(10, 12, `<path d="M7 2L3 6l4 4" stroke="#c0c4cc" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
  'pager-next.svg': svg(10, 12, `<path d="M3 2l4 4-4 4" stroke="#409eff" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
  'camera-video.svg': svg(26, 20, `<rect x="1.5" y="3.5" width="15" height="13" rx="2" stroke="${G}" stroke-width="1.4" fill="none"/><path d="M19.5 8l5-3.5v11l-5-3.5z" stroke="${G}" stroke-width="1.4" fill="none" stroke-linejoin="round"/>`),
  'cloud.svg': svg(22, 18, `<path d="M5.5 14a3.3 3.3 0 01-.4-6.58A5 5 0 0114.9 6.4a3.7 3.7 0 011.6 7.1" stroke="${G}" stroke-width="1.4" fill="none" stroke-linecap="round"/><path d="M11 16.5V8.5M8.4 11.1L11 8.5l2.6 2.6" stroke="${G}" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
  'm-grid.svg': svg(14, 14, `<rect x="1" y="1" width="5" height="5" rx="1" fill="${G}"/><rect x="8" y="1" width="5" height="5" rx="1" fill="${G}"/><rect x="1" y="8" width="5" height="5" rx="1" fill="${G}"/><rect x="8" y="8" width="5" height="5" rx="1" fill="${G}"/>`),
  'm-doc.svg': svg(14, 14, `<path d="M3 1.5h6l2.5 2.5v8.5a1 1 0 01-1 1H3a1 1 0 01-1-1v-10a1 1 0 011-1z" stroke="${G}" stroke-width="1.1" fill="none"/><path d="M4.5 6.5h5M4.5 9h5" stroke="${G}" stroke-width="1" stroke-linecap="round"/>`),
  'm-tag.svg': svg(14, 14, `<path d="M1.5 6.8V2.5a1 1 0 011-1h4.3a1 1 0 01.7.3l5.2 5.2a1 1 0 010 1.4l-4.3 4.3a1 1 0 01-1.4 0L1.8 7.5a1 1 0 01-.3-.7z" stroke="${G}" stroke-width="1.1" fill="none"/><circle cx="4.6" cy="4.6" r="1" fill="${G}"/>`),
  'm-edit.svg': svg(14, 14, `<rect x="1.5" y="1.5" width="11" height="11" rx="1.5" stroke="${G}" stroke-width="1.1" fill="none"/><path d="M4 10l1-3 4-4 2 2-4 4-3 1z" stroke="${G}" stroke-width="1" fill="none" stroke-linejoin="round"/>`),
  'm-table.svg': svg(14, 14, `<rect x="1.5" y="2" width="11" height="10" rx="1.2" stroke="${G}" stroke-width="1.1" fill="none"/><path d="M1.5 5.5h11M5.5 5.5V12M9 5.5V12" stroke="${G}" stroke-width="1"/>`),
  'm-video.svg': svg(14, 14, `<rect x="1.5" y="3.5" width="8" height="7" rx="1.5" stroke="${O}" stroke-width="1.2" fill="none"/><path d="M11.5 6.5l1.8-1.4v4.8l-1.8-1.4z" stroke="${O}" stroke-width="1.2" fill="none" stroke-linejoin="round"/>`),
  'm-image.svg': svg(14, 14, `<rect x="1.5" y="2.5" width="11" height="9" rx="1.2" stroke="${G}" stroke-width="1.1" fill="none"/><circle cx="5" cy="5.5" r="1" fill="${G}"/><path d="M2.5 10.5l3-3 2.5 2.5 2-2 2 2" stroke="${G}" stroke-width="1" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
  'm-image-o.svg': svg(14, 14, `<rect x="1.5" y="2.5" width="11" height="9" rx="1.2" stroke="${O}" stroke-width="1.1" fill="none"/><circle cx="5" cy="5.5" r="1" fill="${O}"/><path d="M2.5 10.5l3-3 2.5 2.5 2-2 2 2" stroke="${O}" stroke-width="1" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
  'm-box.svg': svg(14, 14, `<path d="M7 1.5l5 2.5v6L7 12.5 2 10V4z" stroke="${G}" stroke-width="1.1" fill="none" stroke-linejoin="round"/><path d="M2 4l5 2.5L12 4M7 6.5v6" stroke="${G}" stroke-width="1"/>`),
  'm-money.svg': svg(14, 14, `<circle cx="7" cy="7" r="5.5" stroke="${G}" stroke-width="1.1" fill="none"/><path d="M7 3.8v6.4M8.8 5.2c-.4-.6-3.2-.9-3.2.9 0 1.6 3.2.8 3.2 2.3 0 1.6-2.9 1.3-3.3.6" stroke="${G}" stroke-width="0.9" fill="none" stroke-linecap="round"/>`),
  'm-gem.svg': svg(14, 14, `<path d="M4 1.5h6l3 4-6 7-6-7z" stroke="${G}" stroke-width="1.1" fill="none" stroke-linejoin="round"/><path d="M1 5.5h12M4 1.5l3 4 3-4M7 9.5l-3-4M7 9.5l3-4" stroke="${G}" stroke-width="0.8"/>`),
  'm-plan.svg': svg(14, 14, `<rect x="1.5" y="1.5" width="11" height="11" rx="1.5" stroke="${G}" stroke-width="1.1" fill="none"/><path d="M4.5 9.5v-2M7 9.5v-4.5M9.5 9.5v-3" stroke="${G}" stroke-width="1.2" stroke-linecap="round"/>`),
  'm-headset.svg': svg(14, 14, `<path d="M2.5 8.5v-2a4.5 4.5 0 019 0v2" stroke="${G}" stroke-width="1.1" fill="none"/><rect x="1" y="8" width="2.6" height="4" rx="1.2" fill="${G}"/><rect x="10.4" y="8" width="2.6" height="4" rx="1.2" fill="${G}"/>`),
  'm-weight.svg': svg(14, 14, `<path d="M7 9.5v-6M4.3 6.2L7 3.5l2.7 2.7" stroke="${G}" stroke-width="1.1" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 10v2.5h10V10" stroke="${G}" stroke-width="1.1" fill="none" stroke-linecap="round"/>`),
  'm-link.svg': svg(14, 14, `<path d="M5.5 8.5l3-3M6.8 4.2l1.6-1.6a2.6 2.6 0 013.6 3.6l-1.6 1.6M7.2 9.8L5.6 11.4a2.6 2.6 0 01-3.6-3.6l1.6-1.6" stroke="${G}" stroke-width="1.1" fill="none" stroke-linecap="round"/>`),
};
for (const [name, body] of Object.entries(icons)) fs.writeFileSync(path.join(PROTO, 'assets/icons', name), body);

// 3) elements
const elements = [];
const box = (id, name, x, y, w, h, style = {}, z = 5) => elements.push({
  id, name, kind: 'region', sourceBBox: { x, y, width: w, height: h }, targetBBox: { x, y, width: w, height: h },
  visualStyle: { fontFamily: FONT, zIndex: z, ...style }, textReview: null,
  assetReview: { assetAction: 'reconstruct-css', decisionSource: 'vision-ai', status: 'accepted', reason: '规则容器/纯色形状，CSS 复刻' },
  representation: 'html', candidates: [{ id: 'css-box', route: 'html', audit: { status: 'passed', checks: ['纯 CSS 盒，无位图'] } }], selectedCandidateId: 'css-box',
});
const txt = (id, name, x, y, w, h, content, style = {}, z = 6, kind = 'region') => elements.push({
  id, name, kind, sourceBBox: { x, y, width: w, height: h }, targetBBox: { x, y, width: w, height: h },
  visualStyle: { fontFamily: FONT, zIndex: z, ...style },
  textReview: { content, textRole: 'ui-text', renderMode: 'html-text', ocrUsage: 'render', decisionSource: 'vision-ai', confidence: 0.95, reason: '常规无衬线界面文字' },
  assetReview: { assetAction: 'none', decisionSource: 'vision-ai', status: 'accepted', reason: '普通界面文字，无需位图素材' },
  representation: 'html', candidates: [{ id: 'html-text', route: 'html', audit: { status: 'passed', checks: ['普通字体渲染，非艺术字'] } }], selectedCandidateId: 'html-text',
});
const img = (id, name, x, y, w, h, assetPath, z = 6) => elements.push({
  id, name, kind: 'region', sourceBBox: { x, y, width: w, height: h }, targetBBox: { x, y, width: w, height: h },
  visualStyle: { fontFamily: FONT, zIndex: z }, textReview: null,
  assetReview: { assetAction: 'reuse', decisionSource: 'vision-ai', status: 'accepted', reason: '商品实拍照片需保留原始像素，直接复用源图裁片' },
  representation: 'clean-crop', candidates: [{ id: 'crop', route: 'clean-crop', assetPath, backgroundMode: 'preserve', audit: { status: 'passed', checks: ['源图矩形裁片，与原图像素一致'] } }], selectedCandidateId: 'crop',
});
const ic = (id, name, x, y, w, h, assetPath, z = 6) => elements.push({
  id, name, kind: 'region', sourceBBox: { x, y, width: w, height: h }, targetBBox: { x, y, width: w, height: h },
  visualStyle: { fontFamily: FONT, zIndex: z }, textReview: null,
  assetReview: { assetAction: 'reconstruct-svg', decisionSource: 'vision-ai', status: 'accepted', reason: '单色线性图标，SVG 重绘' },
  representation: 'svg', candidates: [{ id: 'svg', route: 'svg', assetPath, audit: { status: 'passed', checks: ['矢量重建，尺寸与截图一致'] } }], selectedCandidateId: 'svg',
});

const T = '#303133', R = '#606266', S = '#909399', P = '#c0c4cc', OR = '#ff781f';
const center = (lh) => ({ textAlign: 'center', lineHeight: `${lh}px` });

// background & dialog
box('bg-dim', '页面灰色遮罩', 0, 0, 1912, 867, { backgroundColor: '#7f7f7f' }, 1);
box('dialog', '编辑产品弹窗', 96, 52, 1720, 780, { backgroundColor: '#ffffff', borderRadius: 8, boxShadow: 'rgba(0, 0, 0, 0.25) 0px 6px 28px 0px' }, 2);
txt('dlg-title', '弹窗标题', 115, 70, 80, 24, '编辑产品', { fontSize: '16px', lineHeight: '24px', fontWeight: 500, color: T });
ic('dlg-close', '关闭图标', 1783, 75, 15, 15, 'assets/icons/close.svg');

// product list
const PROD = [
  ['Shoulder Bags For Woma…', true], ['【老方子】全身结星节蒲…', false], ['Totes Luxury Handbag Qu…', false],
  ['Large U-Back Tank Top for…', false], ['4-Pack Extra Large Bath T…', false], ['Extra Deep Pocket Bamboo…', false],
  ['Autumn/Winter Fashion C…', false], ['MCRG Walking Pad with I…', false], ['14-inch Lightweight Foldin…', false], ['2pcs Chain Design Shoe …', false],
];
PROD.forEach(([title, selected], i) => {
  const top = 120 + i * 63;
  if (selected) box(`prod-${i + 1}-card`, '选中商品卡片', 116, top, 220, 60, { border: '1px solid #ffb366', backgroundColor: '#fffaf5', borderRadius: 8 });
  img(`thumb-${i + 1}`, `商品缩略图 ${i + 1}`, 125, top + 7, 50, 50, `assets/thumb-${i + 1}.png`);
  txt(`prod-${i + 1}-title`, `商品标题 ${i + 1}`, 163, top + 12, 172, 16, title, { fontSize: '14px', lineHeight: '16px', color: T, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' });
  txt(`prod-${i + 1}-state`, `编辑状态 ${i + 1}`, 185, top + 33, 40, 16, '未编辑', { fontSize: '12px', lineHeight: '16px', color: S });
  if (selected) {
    ic('prod-trash', '删除图标', 292, top + 33, 12, 16, 'assets/icons/trash.svg');
    ic('prod-mail', '邮件图标', 311, top + 33, 16, 16, 'assets/icons/mail.svg');
  }
});
box('pager-prev', '上一页按钮', 190, 746, 28, 23, { border: '1px solid #e4e7ed', borderRadius: 4, backgroundColor: '#ffffff' });
ic('pager-prev-ic', '上一页箭头', 199, 752, 10, 12, 'assets/icons/pager-prev.svg');
box('pager-next', '下一页按钮', 234, 746, 28, 23, { border: '1px solid #409eff', borderRadius: 4, backgroundColor: '#ffffff' });
ic('pager-next-ic', '下一页箭头', 243, 752, 10, 12, 'assets/icons/pager-next.svg');

// tabs
ic('tabs-collapse', '收起列表图标', 346, 119, 14, 16, 'assets/icons/collapse.svg');
txt('tab-basic', '基本标签', 371, 118, 30, 20, '基本', { fontSize: '14px', lineHeight: '20px', color: OR });
box('tab-sep-1', '标签分隔线', 412, 124, 1, 12, { backgroundColor: '#dcdfe6' });
txt('tab-detail', '详情标签', 425, 120, 30, 20, '详情', { fontSize: '14px', lineHeight: '20px', color: R });
box('tab-sep-2', '标签分隔线', 467, 124, 1, 12, { backgroundColor: '#dcdfe6' });
txt('tab-log', '日志标签', 480, 120, 30, 20, '日志', { fontSize: '14px', lineHeight: '20px', color: R });

// section menu
const MENU = [
  ['m-grid.svg', '状态/类目'], ['m-doc.svg', '产品信息'], ['m-tag.svg', '关键词'], ['m-edit.svg', '短描'],
  ['m-table.svg', '产品属性'], ['m-video.svg', '视频'], ['m-image.svg', '主图'], ['m-image-o.svg', '站外推广图'],
  ['m-box.svg', '产品规格'], ['m-money.svg', '价格 USD'], ['m-gem.svg', '定制商品'], ['m-plan.svg', '销售方案'],
  ['m-headset.svg', '服务'], ['m-weight.svg', '重量/包装'], ['m-link.svg', '货源/系统信息'],
];
MENU.forEach(([icon, label], i) => {
  const cy = 168 + i * 40;
  const active = label === '视频';
  ic(`menu-${i + 1}-ic`, `${label}图标`, 362, cy - 7, 14, 14, `assets/icons/${icon}`);
  txt(`menu-${i + 1}`, `菜单项 ${label}`, 386, cy - 9, 96, 18, label, { fontSize: '14px', lineHeight: '18px', color: active ? OR : R, fontWeight: active ? 500 : 400 });
});
box('menu-active-bar', '激活菜单指示条', 510, 348, 4, 40, { backgroundColor: OR, borderRadius: 2 });

// content area
box('content-bg', '内容区灰色背景', 514, 148, 1282, 629, { backgroundColor: '#f5f5f5' }, 3);

// video card
box('video-card', '视频卡片', 526, 148, 1258, 210, { backgroundColor: '#ffffff', borderRadius: 8 }, 4);
txt('video-title-clip', '视频标题（滚动裁切残片）', 546, 148, 34, 2, '视频', { fontSize: '16px', lineHeight: '14px', fontWeight: 700, color: T, overflow: 'hidden' }, 6);
box('video-divider', '视频区块分隔线', 546, 165, 1218, 1, { backgroundColor: '#ebeef5' });
txt('video-name-label', '视频名称标签', 545, 185, 56, 16, '视频名称', { fontSize: '14px', lineHeight: '16px', color: R });
box('video-name-input', '视频名称输入框', 614, 179, 250, 32, { border: '1px solid #dcdfe6', borderRadius: 4, backgroundColor: '#ffffff' });
txt('video-name-ph', '视频名称占位符', 630, 187, 110, 16, '请输入视频名称', { fontSize: '14px', lineHeight: '16px', color: P, whiteSpace: 'nowrap' });
txt('video-name-count', '视频名称字数', 831, 188, 26, 12, '0/30', { fontSize: '12px', lineHeight: '12px', color: P });
txt('video-desc-label', '视频描述标签', 887, 185, 56, 16, '视频描述', { fontSize: '14px', lineHeight: '16px', color: R });
box('video-desc-input', '视频描述输入框', 956, 179, 808, 32, { border: '1px solid #dcdfe6', borderRadius: 4, backgroundColor: '#ffffff' });
txt('video-desc-ph', '视频描述占位符', 972, 187, 110, 16, '请输入视频描述', { fontSize: '14px', lineHeight: '16px', color: P, whiteSpace: 'nowrap' });
txt('video-desc-count', '视频描述字数', 1725, 188, 32, 12, '0/200', { fontSize: '12px', lineHeight: '12px', color: P });
box('video-upload-box', '上传视频虚线框', 546, 221, 160, 120, { border: '1px dashed #dcdfe6', borderRadius: 4, backgroundColor: '#ffffff' });
ic('video-cam-ic', '摄像机图标', 612, 259, 26, 20, 'assets/icons/camera-video.svg');
txt('video-upload-text', '上传视频文字', 599, 289, 56, 16, '上传视频', { fontSize: '14px', lineHeight: '16px', color: R });

// main images card
box('main-card', '主图卡片', 526, 369, 1258, 232, { backgroundColor: '#ffffff', borderRadius: 8 }, 4);
txt('main-star', '主图必填星号', 540, 381, 10, 22, '*', { fontSize: '16px', lineHeight: '22px', color: '#ff4949' });
txt('main-title', '主图标题', 552, 378, 34, 22, '主图', { fontSize: '16px', lineHeight: '22px', fontWeight: 700, color: T });
txt('main-count', '主图计数', 589, 385, 24, 14, '5/8', { fontSize: '12px', lineHeight: '14px', color: S });
box('main-divider', '主图区块分隔线', 546, 415, 1218, 1, { backgroundColor: '#ebeef5' });
txt('btn-batch-1', '批量美图按钮', 546, 428, 80, 28, '批量美图', { backgroundColor: OR, color: '#ffffff', fontSize: '14px', borderRadius: 4, letterSpacing: 2, ...center(28) }, 6, 'button');
txt('btn-download', '下载图片按钮', 636, 428, 80, 28, '下载图片', { backgroundColor: OR, color: '#ffffff', fontSize: '14px', borderRadius: 4, letterSpacing: 2, ...center(28) }, 6, 'button');
box('main-upload-tile', '主图上传虚线格', 546, 471, 112, 98, { border: '1px dashed #dcdfe6', borderRadius: 4, backgroundColor: '#ffffff' });
ic('main-cloud-ic', '云上传图标', 585, 498, 22, 18, 'assets/icons/cloud.svg');
txt('main-upload-text', '主图上传提示', 553, 519, 98, 16, '点击/Ctrl+V粘贴', { fontSize: '12px', lineHeight: '16px', color: R });
const MAIN_X = [664, 774, 884, 994, 1104];
const BADGES = ['1200*1600', '1200*1600', '1200*1600', '600*800', '600*800'];
MAIN_X.forEach((x, i) => {
  box(`main-frame-${i + 1}`, `主图卡片框 ${i + 1}`, x, 466, 92, 110, { border: '1px solid #e6e6e6', borderRadius: 4, backgroundColor: '#ffffff' });
  img(`main-${i + 1}`, `主图照片 ${i + 1}`, x + 6, 471, 72, 100, `assets/main-${i + 1}.png`);
  box(`main-badge-bg-${i + 1}`, `分辨率角标底 ${i + 1}`, x + 6, 551, 72, 17, { backgroundColor: 'rgba(0, 0, 0, 0.45)', borderRadius: 2 }, 7);
  txt(`main-badge-${i + 1}`, `分辨率角标 ${i + 1}`, x + 6, 551, 72, 17, BADGES[i], { fontSize: '12px', lineHeight: '17px', color: '#ffffff', ...center(17) }, 8);
});

// promo card
box('promo-card', '站外推广图卡片', 526, 612, 1258, 165, { backgroundColor: '#ffffff', borderRadius: 8 }, 4);
txt('promo-star', '站外推广图必填星号', 540, 624, 10, 22, '*', { fontSize: '16px', lineHeight: '22px', color: '#ff4949' });
txt('promo-title', '站外推广图标题', 552, 622, 80, 22, '站外推广图', { fontSize: '16px', lineHeight: '22px', fontWeight: 700, color: T });
txt('promo-count', '站外推广图计数', 624, 629, 20, 14, '1/1', { fontSize: '12px', lineHeight: '14px', color: S });
box('promo-divider', '站外推广图分隔线', 546, 659, 1218, 1, { backgroundColor: '#ebeef5' });
txt('btn-batch-2', '批量美图按钮（推广图）', 546, 674, 80, 28, '批量美图', { backgroundColor: OR, color: '#ffffff', fontSize: '14px', borderRadius: 4, letterSpacing: 2, ...center(28) }, 6, 'button');
box('promo-frame-1', '推广图卡片框', 540, 709, 112, 68, { border: '1px solid #e6e6e6', borderRadius: 4, backgroundColor: '#ffffff' });
img('promo-1', '站外推广图照片', 546, 715, 99, 62, 'assets/promo-1.png');

// footer
box('footer-bar', '底部按钮栏', 96, 777, 1720, 55, { backgroundColor: '#ffffff', borderRadius: '0 0 8px 8px' }, 5);
txt('btn-close', '关闭按钮', 816, 786, 74, 36, '关闭', { border: '1px solid #ff781f', color: OR, backgroundColor: '#ffffff', fontSize: '14px', borderRadius: 8, letterSpacing: 4, ...center(34) }, 6, 'button');
txt('btn-save', '保存按钮', 900, 786, 74, 36, '保存', { backgroundColor: OR, color: '#ffffff', fontSize: '14px', borderRadius: 8, letterSpacing: 4, ...center(36) }, 6, 'button');
txt('btn-save-publish', '保存并发布按钮', 984, 786, 112, 36, '保存并发布', { backgroundColor: OR, color: '#ffffff', fontSize: '14px', borderRadius: 8, ...center(36) }, 6, 'button');

fs.writeFileSync(path.join(LOCAL, 'elements.json'), JSON.stringify({ schemaVersion: 1, elements }, null, 1));
console.log('elements:', elements.length);
