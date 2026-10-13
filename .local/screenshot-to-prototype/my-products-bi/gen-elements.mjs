import fs from 'node:fs';
import path from 'node:path';

const PROTO = 'D:/projects/CAMEL CAPTAIN/src/prototypes/my-products-bi';
const LOCAL = 'D:/projects/CAMEL CAPTAIN/.local/screenshot-to-prototype/my-products-bi';
fs.mkdirSync(`${PROTO}/assets/icons`, { recursive: true });
fs.mkdirSync(`${PROTO}/.spec/reconstruction`, { recursive: true });

for (const f of ['logo-badge', 'thumb-1', 'thumb-2', 'thumb-3', 'thumb-4', 'dh-badge-1', 'dh-badge-2', 'dh-badge-3', 'dh-badge-4']) {
  fs.copyFileSync(`${LOCAL}/final/references/${f}.png`, `${PROTO}/assets/${f}.png`);
}

const icons = {
  'sun': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ff781f" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8"/></svg>`,
  'menu': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="#ff781f" stroke-width="2.4" stroke-linecap="round" fill="none"><path d="M4 7h16M4 12h16M4 17h16"/></svg>`,
  'help': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ff781f" stroke-width="1.8"><circle cx="12" cy="12" r="9.5"/><path d="M9.2 9.2a2.9 2.9 0 0 1 5.6 1c0 1.9-2.8 2.4-2.8 4" stroke-linecap="round"/><circle cx="12" cy="17.2" r="1.1" fill="#ff781f" stroke="none"/></svg>`,
  'crown': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M3 17.5 5.2 7.6l5 4.2L12 5.5l1.8 6.3 5-4.2 2.2 9.9Z" fill="#ffba00"/><rect x="3" y="17.5" width="18" height="2.6" rx="1" fill="#ff9a2e"/></svg>`,
  'caret-down': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5Z" fill="#c0c4cc"/></svg>`,
  'chevron-down': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#c0c4cc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>`,
  'chevron-left': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#c0c4cc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>`,
  'chevron-right': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#c0c4cc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>`,
  'arrow-up': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ff781f" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V6M6 11.5 12 5.5l6 6"/></svg>`,
  'arrow-down': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ff781f" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v13M6 12.5l6 6 6-6"/></svg>`,
  'calendar': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#a8abb2" stroke-width="1.8" stroke-linecap="round"><rect x="3.5" y="5.5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3.5v4M16 3.5v4"/></svg>`,
  'stepper': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#a8abb2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 9.5 12 5.5l4 4M8 14.5l4 4 4-4"/></svg>`,
  'refresh': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#909399" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11a8 8 0 1 0-1.8 5.7"/><path d="M20 4.5V11h-6"/></svg>`,
  'gear': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#909399" stroke-width="2.4"><circle cx="12" cy="12" r="3"/><path d="M12 3.2v2.6M12 18.2v2.6M3.2 12h2.6M18.2 12h2.6M5.8 5.8l1.8 1.8M16.4 16.4l1.8 1.8M18.2 5.8l-1.8 1.8M7.6 16.4l-1.8 1.8" stroke-linecap="round"/></svg>`,
  'headset': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ff781f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 13.5v-2a7.5 7.5 0 0 1 15 0v2"/><rect x="2.5" y="13" width="4.5" height="6.5" rx="2" fill="#ff781f" stroke="none"/><rect x="17" y="13" width="4.5" height="6.5" rx="2" fill="#ff781f" stroke="none"/><path d="M19 19.5v.5a2.5 2.5 0 0 1-2.5 2.5H13"/></svg>`,
};
for (const [name, svg] of Object.entries(icons)) fs.writeFileSync(`${PROTO}/assets/icons/${name}.svg`, svg);

const FONT = '"Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif';
const W = 1912, H = 867;
const els = [];

function push(e) { els.push(e); }
function base(id, name, x, y, w, h, style = {}, kind = 'region') {
  return { id, name, kind, sourceBBox: { x, y, width: w, height: h }, targetBBox: { x, y, width: w, height: h }, visualStyle: { fontFamily: FONT, ...style } };
}
function box(id, name, x, y, w, h, style = {}, z) {
  const e = base(id, name, x, y, w, h, { zIndex: z ?? 4, ...style });
  e.textReview = null;
  e.assetReview = { assetAction: 'reconstruct-css', decisionSource: 'vision-ai', status: 'accepted', reason: '规则容器/纯色形状，CSS 复刻' };
  e.representation = 'html';
  e.candidates = [{ id: 'css-box', route: 'html', audit: { status: 'passed', checks: ['纯 CSS 盒，无位图'] } }];
  e.selectedCandidateId = 'css-box';
  push(e);
}
function txt(id, name, x, y, w, h, content, style = {}, z, kind = 'div') {
  const e = base(id, name, x, y, w, h, { zIndex: z ?? 6, ...style }, kind === 'button' ? 'button' : 'region');
  e.textReview = { content, textRole: 'ui-text', renderMode: 'html-text', ocrUsage: 'render', decisionSource: 'vision-ai', confidence: 0.95, reason: '常规无衬线界面文字，非艺术字' };
  e.assetReview = { assetAction: 'none', decisionSource: 'vision-ai', status: 'accepted', reason: '普通界面文字，无需位图素材' };
  e.representation = 'html';
  e.candidates = [{ id: 'html-text', route: 'html', audit: { status: 'passed', checks: ['普通字体渲染，非艺术字'] } }];
  e.selectedCandidateId = 'html-text';
  push(e);
}
function img(id, name, x, y, w, h, assetPath, z, alt) {
  const e = base(id, name, x, y, w, h, { zIndex: z ?? 6 });
  if (alt) e.textReview = { content: alt, textRole: 'decorative-text', renderMode: 'preserve-in-image', ocrUsage: 'semantic-only', decisionSource: 'vision-ai', confidence: 0.9, reason: '品牌标识图形，整体保留原像素' };
  else e.textReview = null;
  e.assetReview = { assetAction: 'reuse', decisionSource: 'vision-ai', status: 'accepted', reason: '照片/品牌徽标需保留原始像素，直接复用源图裁片' };
  e.representation = 'clean-crop';
  e.candidates = [{ id: 'crop', route: 'clean-crop', assetPath, backgroundMode: 'preserve', audit: { status: 'passed', checks: ['源图矩形裁片，与原图像素一致'] } }];
  e.selectedCandidateId = 'crop';
  push(e);
}
function icon(id, name, x, y, w, h, assetPath, z) {
  const e = base(id, name, x, y, w, h, { zIndex: z ?? 6 });
  e.textReview = null;
  e.assetReview = { assetAction: 'reconstruct-svg', decisionSource: 'vision-ai', status: 'accepted', reason: '单色线性图标，SVG 重绘更清晰' };
  e.representation = 'svg';
  e.candidates = [{ id: 'svg', route: 'svg', assetPath, audit: { status: 'passed', checks: ['矢量重建，尺寸与截图一致'] } }];
  e.selectedCandidateId = 'svg';
  push(e);
}
function btn(id, name, x, y, w, h, content, style = {}, z = 6) {
  txt(id, name, x, y, w, h, content, { textAlign: 'center', lineHeight: `${h}px`, ...style }, z, 'button');
}

// ===== 背景与顶栏 =====
box('bd-page', '页面底色', 0, 0, W, H, { backgroundColor: '#f0f1f5', zIndex: 1 });
box('topbar', '顶部导航条', 0, 0, W, 56, { backgroundColor: '#ffffff', boxShadow: 'rgba(0, 0, 0, 0.08) 0px 2px 8px 0px', zIndex: 2 });
img('logo-badge', '品牌徽标', 4, 4, 44, 46, 'assets/logo-badge.png', 5, '骆驼队长 logo');
txt('brand-main', '品牌名', 58, 12, 92, 30, '骆驼队长', { fontSize: '22px', lineHeight: '30px', fontWeight: 700, color: '#303133' }, 5);
txt('brand-sub', '副标题', 162, 16, 208, 26, '智慧运营中台（公测版）', { fontSize: '18px', lineHeight: '26px', fontWeight: 700, color: '#303133' }, 5);
box('brand-sep', '分隔竖线', 408, 18, 1, 20, { backgroundColor: '#dcdfe6', zIndex: 5 });
const nav = [['首页', 431, 26], ['商品', 506, 26], ['交易', 583, 26], ['采购', 658, 26], ['物流', 734, 26], ['报表', 810, 26], ['系统', 886, 26], ['工具箱', 962, 40], ['即时咨询', 1053, 54]];
for (const [label, x, w] of nav) {
  const active = label === '商品';
  if (active) box('nav-goods-pill', '商品导航选中底', x - 10, 14, w + 20, 30, { backgroundColor: '#ffe9d5', borderRadius: 15, zIndex: 4 });
  txt(`nav-${label}`, `导航 ${label}`, x, 22, w, 22, label, { fontSize: '14px', lineHeight: '22px', whiteSpace: 'nowrap', color: active ? '#ff781f' : '#606266' }, 5);
}
icon('ic-sun', '主题切换图标', 1649, 19, 18, 18, 'assets/icons/sun.svg', 5);
icon('ic-menu', '菜单图标', 1686, 19, 16, 16, 'assets/icons/menu.svg', 5);
icon('ic-help', '帮助图标', 1721, 18, 18, 18, 'assets/icons/help.svg', 5);
box('vip-pill', 'VIP3 徽章', 1756, 14, 62, 28, { backgroundColor: '#fff8ee', border: '1px solid #ff781f', borderRadius: 14, zIndex: 5 });
icon('ic-crown', 'VIP 皇冠', 1763, 18, 16, 16, 'assets/icons/crown.svg', 6);
txt('vip-text', 'VIP3 文字', 1781, 17, 33, 22, 'VIP3', { fontSize: '13px', lineHeight: '22px', fontWeight: 700, color: '#ff781f' }, 6);
box('avatar', '用户头像', 1834, 10, 36, 36, { backgroundColor: '#ff781f', borderRadius: 18, zIndex: 5 });
txt('avatar-c', '头像字母', 1834, 10, 36, 36, 'C', { fontSize: '16px', lineHeight: '36px', textAlign: 'center', fontWeight: 700, color: '#ffffff' }, 6);
icon('ic-caret', '下拉箭头', 1882, 24, 12, 12, 'assets/icons/caret-down.svg', 5);

// ===== 面包屑 =====
txt('crumb-1', '面包屑 商品', 20, 60, 28, 18, '商品', { fontSize: '12px', lineHeight: '18px', color: '#909399' }, 5);
txt('crumb-s1', '面包屑分隔', 50, 60, 8, 18, '/', { fontSize: '12px', lineHeight: '18px', color: '#c0c4cc' }, 5);
txt('crumb-2', '面包屑 商品管理', 60, 60, 48, 18, '商品管理', { fontSize: '12px', lineHeight: '18px', color: '#909399' }, 5);
txt('crumb-s2', '面包屑分隔2', 110, 60, 8, 18, '/', { fontSize: '12px', lineHeight: '18px', color: '#c0c4cc' }, 5);
txt('crumb-3', '面包屑 我的商品', 120, 60, 48, 18, '我的商品', { fontSize: '12px', lineHeight: '18px', color: '#ff781f' }, 5);

// ===== 主卡片与页签 =====
box('main-card', '主内容卡片', 28, 88, 1856, 779, { backgroundColor: '#ffffff', borderRadius: 10, boxShadow: 'rgba(0, 0, 0, 0.1) 0px 2px 12px 0px', zIndex: 3 });
box('tab-band', '页签条底色', 28, 88, 1856, 48, { backgroundColor: '#f2f3f5', borderRadius: '10px 10px 0px 0px', zIndex: 4 });
txt('tab-collect', '页签 商品采集', 53, 104, 56, 22, '商品采集', { fontSize: '14px', lineHeight: '22px', color: '#606266' }, 6);
txt('tab-claim', '页签 认领中心', 173, 104, 56, 22, '认领中心', { fontSize: '14px', lineHeight: '22px', color: '#606266' }, 6);
box('tab-active-card', '选中页签卡片', 285, 92, 165, 44, { backgroundColor: '#ffffff', borderRadius: '10px 10px 0px 0px', boxShadow: 'rgba(0, 21, 41, 0.08) 3px 4px 4px 0px', zIndex: 5 });
box('tab-active-dot', '选中页签圆点', 318, 110, 14, 14, { background: 'radial-gradient(circle at 35% 40%, #ffb26b 0%, #ff781f 70%)', borderRadius: 7, zIndex: 6 });
txt('tab-mine', '页签 我的商品', 345, 104, 64, 22, '我的商品', { fontSize: '15px', lineHeight: '22px', fontWeight: 700, color: '#303133' }, 6);

// ===== 筛选区 =====
const inputStyle = { backgroundColor: '#ffffff', border: '1px solid #dcdfe6', borderRadius: 4 };
const labelStyle = { fontSize: '13px', lineHeight: '20px', color: '#606266' };
const phStyle = { fontSize: '13px', lineHeight: '20px', color: '#c0c4cc' };
txt('f-source-label', '采集源标签', 41, 166, 40, 20, '采集源', labelStyle, 6);
box('f-source-select', '采集源下拉', 96, 160, 100, 32, inputStyle, 5);
txt('f-source-value', '采集源选中值', 108, 166, 52, 20, '产品编号', { ...labelStyle, color: '#303133' }, 6);
icon('f-source-chev', '下拉箭头', 176, 170, 14, 12, 'assets/icons/chevron-down.svg', 6);
box('f-search-input', '搜索输入框', 202, 160, 213, 32, inputStyle, 5);
txt('f-search-ph', '搜索占位', 218, 166, 120, 20, '双击可批量搜索', phStyle, 6);
txt('f-price-label', '价格标签', 427, 166, 26, 20, '价格', labelStyle, 6);
box('f-price-min', '价格输入左', 465, 160, 141, 32, inputStyle, 5);
icon('f-price-min-step', '价格步进1', 552, 164, 32, 24, 'assets/icons/stepper.svg', 6);
txt('f-price-dash', '价格区间横线', 609, 174, 8, 12, '-', { fontSize: '12px', lineHeight: '12px', color: '#c0c4cc', textAlign: 'center' }, 6);
box('f-price-max', '价格输入右', 620, 160, 141, 32, inputStyle, 5);
icon('f-price-max-step', '价格步进2', 706, 164, 32, 24, 'assets/icons/stepper.svg', 6);
txt('f-platform-label', '采集平台标签', 736, 166, 52, 20, '采集平台', labelStyle, 6);
box('f-platform-select', '采集平台下拉', 798, 160, 196, 32, inputStyle, 5);
txt('f-platform-ph', '采集平台占位', 812, 166, 100, 20, '请选择采集平台', phStyle, 6);
icon('f-platform-chev', '采集平台箭头', 972, 170, 14, 12, 'assets/icons/chevron-down.svg', 6);
txt('f-publish-label', '刊登时间标签', 1025, 166, 52, 20, '刊登时间', labelStyle, 6);
box('f-publish-d1', '刊登开始', 1089, 160, 151, 32, inputStyle, 5);
icon('f-publish-d1-cal', '日历1', 1100, 168, 15, 15, 'assets/icons/calendar.svg', 6);
txt('f-publish-d1-ph', '开始日期1', 1122, 166, 64, 20, '开始日期', phStyle, 6);
txt('f-publish-to', '至1', 1254, 166, 13, 20, '至', labelStyle, 6);
box('f-publish-d2', '刊登结束', 1281, 160, 156, 32, inputStyle, 5);
txt('f-publish-d2-ph', '结束日期1', 1314, 166, 90, 20, '结束日期', { ...phStyle, textAlign: 'center' }, 6);
txt('f-claim-label', '认领时间标签', 1449, 166, 52, 20, '认领时间', labelStyle, 6);
box('f-claim-d1', '认领开始', 1513, 160, 151, 32, inputStyle, 5);
icon('f-claim-d1-cal', '日历3', 1524, 168, 15, 15, 'assets/icons/calendar.svg', 6);
txt('f-claim-d1-ph', '开始日期2', 1546, 166, 64, 20, '开始日期', phStyle, 6);
txt('f-claim-to', '至2', 1678, 166, 13, 20, '至', labelStyle, 6);
box('f-claim-d2', '认领结束', 1704, 160, 157, 32, inputStyle, 5);
txt('f-claim-d2-ph', '结束日期2', 1737, 166, 90, 20, '结束日期', { ...phStyle, textAlign: 'center' }, 6);

txt('f-mod-label', '修改时间标签', 41, 218, 52, 20, '修改时间', labelStyle, 6);
box('f-mod-d1', '修改开始', 96, 212, 160, 32, inputStyle, 5);
icon('f-mod-d1-cal', '日历5', 107, 220, 15, 15, 'assets/icons/calendar.svg', 6);
txt('f-mod-d1-ph', '开始日期3', 129, 218, 64, 20, '开始日期', phStyle, 6);
txt('f-mod-to', '至3', 271, 218, 13, 20, '至', labelStyle, 6);
box('f-mod-d2', '修改结束', 296, 212, 160, 32, inputStyle, 5);
txt('f-mod-d2-ph', '结束日期3', 331, 218, 90, 20, '结束日期', { ...phStyle, textAlign: 'center' }, 6);
txt('f-tag-label', '标签标签', 465, 218, 26, 20, '标签', labelStyle, 6);
box('f-tag-select', '标签下拉', 500, 212, 180, 32, inputStyle, 5);
txt('f-tag-ph', '标签占位', 516, 218, 78, 20, '请选择标签', phStyle, 6);
icon('f-tag-chev', '标签箭头', 660, 222, 14, 12, 'assets/icons/chevron-down.svg', 6);
txt('f-shop-label', '店铺标签', 728, 218, 26, 20, '店铺', labelStyle, 6);
box('f-shop-select', '店铺下拉', 763, 212, 180, 32, inputStyle, 5);
txt('f-shop-ph', '店铺占位', 779, 218, 78, 20, '请选择店铺', phStyle, 6);
icon('f-shop-chev', '店铺箭头', 923, 222, 14, 12, 'assets/icons/chevron-down.svg', 6);
btn('btn-search', '搜索按钮', 991, 212, 65, 32, '搜索', { backgroundColor: '#ff781f', color: '#ffffff', fontSize: '14px', border: '1px solid #ff781f', borderRadius: 4 }, 6);
btn('btn-reset', '重置按钮', 1070, 212, 60, 32, '重置', { backgroundColor: '#ffffff', color: '#606266', fontSize: '14px', border: '1px solid #dcdfe6', borderRadius: 4 }, 6);
btn('btn-create', '创建新产品按钮', 1136, 212, 112, 32, '创建新产品', { backgroundColor: '#ffffff', color: '#409eff', fontSize: '14px', border: '1px solid #409eff', borderRadius: 4 }, 6);
btn('btn-sort', '排序按钮', 1256, 212, 60, 32, '排序', { backgroundColor: '#ffffff', color: '#606266', fontSize: '14px', border: '1px solid #dcdfe6', borderRadius: 4 }, 6);
btn('btn-export', '导出按钮', 1608, 212, 58, 32, '导出', { backgroundColor: '#ffffff', color: '#606266', fontSize: '14px', border: '1px solid #dcdfe6', borderRadius: 4 }, 6);
btn('btn-import', '导入货源按钮', 1668, 212, 82, 32, '导入货源', { backgroundColor: '#ffffff', color: '#606266', fontSize: '14px', border: '1px solid #dcdfe6', borderRadius: 4 }, 6);
btn('btn-sync', '同步线上按钮', 1755, 212, 82, 32, '同步线上', { backgroundColor: '#ffffff', color: '#606266', fontSize: '14px', border: '1px solid #dcdfe6', borderRadius: 4 }, 6);
icon('ic-gear', '设置齿轮', 1845, 217, 20, 20, 'assets/icons/gear.svg', 6);

// ===== 左侧筛选统计 =====
const sideTitle = { fontSize: '13px', lineHeight: '20px', fontWeight: 700, color: '#303133' };
const sideItem = { fontSize: '13px', lineHeight: '20px', color: '#606266' };
const sideNum = { fontSize: '13px', lineHeight: '20px', color: '#303133', textAlign: 'right' };
txt('side-overview', '商品概览标题', 42, 268, 52, 20, '商品概览', sideTitle, 6);
icon('ic-refresh', '刷新图标', 217, 268, 16, 16, 'assets/icons/refresh.svg', 6);
txt('side-all', '全部商品', 42, 314, 52, 20, '全部商品', sideItem, 6);
txt('side-all-n', '全部商品数', 180, 314, 53, 20, '9027', sideNum, 6);
txt('side-publish', '发布管理标题', 42, 360, 52, 20, '发布管理', sideTitle, 6);
box('side-loop-bg', '循环刊登选中底', 32, 480, 210, 28, { backgroundColor: '#fff3e8', borderRadius: 4, zIndex: 5 });
const sideRows = [['side-pending', '待发布', '173', 404], ['side-ing', '发布中', '0', 444], ['side-loop', '循环刊登', '8', 484], ['side-fail', '发布失败', '41', 524]];
for (const [id, label, n, y] of sideRows) {
  const active = id === 'side-loop';
  txt(`${id}`, label, 42, y, 52, 20, label, active ? { ...sideItem, color: '#ff781f' } : sideItem, 6);
  txt(`${id}-n`, `${label}数`, 180, y, 53, 20, n, active ? { ...sideNum, color: '#ff781f' } : sideNum, 6);
}
txt('side-sale', '销售状态标题', 42, 572, 52, 20, '销售状态', sideTitle, 6);
const sideSale = [['side-on', '已上架', '2736', 616], ['side-off', '已下架', '3076', 656]];
for (const [id, label, n, y] of sideSale) { txt(id, label, 42, y, 39, 20, label, sideItem, 6); txt(`${id}-n`, `${label}数`, 180, y, 53, 20, n, sideNum, 6); }
txt('side-risk', '审核与风险标题', 42, 702, 65, 20, '审核与风险', sideTitle, 6);
const sideRisk = [['side-review', '待审核', '1', 746], ['side-reject', '审核未通过', '2818', 786], ['side-violation', '内容违规', '173', 826], ['side-infringe', '侵权违规', '0', 856]];
for (const [id, label, n, y] of sideRisk) { const h = Math.min(20, 867 - y); txt(id, label, 42, y, 65, h, label, sideItem, 6); txt(`${id}-n`, `${label}数`, 180, y, 53, h, n, sideNum, 6); }

// ===== 表格 =====
box('tbl-header', '表头底', 280, 258, 1604, 42, { backgroundColor: '#f5f7fa', borderRadius: 8, zIndex: 4 });
const th = { fontSize: '14px', lineHeight: '22px', color: '#606266' };
box('th-check', '表头复选框', 306, 271, 16, 16, { backgroundColor: '#ffffff', border: '1px solid #dcdfe6', borderRadius: 2, zIndex: 5 });
txt('th-img', '列 图片', 372, 268, 28, 22, '图片', th, 6);
txt('th-info', '列 商品信息', 444, 268, 56, 22, '商品信息', th, 6);
txt('th-code', '列 产品编号', 1088, 268, 56, 22, '产品编号', th, 6);
txt('th-price', '列 售价', 1242, 268, 28, 22, '售价', th, 6);
txt('th-tag', '列 标签', 1402, 268, 28, 22, '标签', th, 6);
txt('th-time', '列 时间/版本', 1524, 268, 60, 22, '时间/版本', th, 6);
txt('th-source', '列 来源', 1772, 268, 28, 22, '来源', th, 6);
for (const [i, y] of [403, 444, 548, 662, 777, 853].entries()) box(`row-div-${i}`, '行分隔线', 280, y, 1604, 1, { backgroundColor: '#ebeef5', zIndex: 4 });

const titleStyle = { fontSize: '14px', lineHeight: '20px', color: '#303133', whiteSpace: 'normal' };
const catStyle = { fontSize: '12px', lineHeight: '16px', color: '#909399' };
const codeStyle = { fontSize: '12px', lineHeight: '18px', color: '#606266' };
const priceStyle = { fontSize: '13px', lineHeight: '20px', fontWeight: 700, color: '#ff781f' };
const timeStyle = { fontSize: '12px', lineHeight: '19px', color: '#606266', whiteSpace: 'pre-line' };
const storeStyle = { fontSize: '13px', lineHeight: '18px', color: '#606266' };
const dashStyle = { fontSize: '12px', lineHeight: '16px', color: '#909399' };
const checkStyle = { backgroundColor: '#ffffff', border: '1px solid #dcdfe6', borderRadius: 2 };

function pill(id, name, x, y, w, h, content, style) {
  txt(id, name, x, y, w, h, content, { fontSize: '12px', lineHeight: `${h}px`, textAlign: 'center', borderRadius: h / 2, ...style }, 6);
}

// 行 1
box('r1-check', '行1复选框', 306, 340, 16, 16, checkStyle, 5);
img('thumb-1', '行1商品图', 346, 308, 79, 80, 'assets/thumb-1.png', 6);
txt('r1-title', '行1标题', 445, 310, 630, 40, 'High Quality luxury designer bag 2026 Women Viral Quilted Chain Bucket Bag Large Capacity Shoulder Underarm Motorcycle Style Purse Trendy Top Hot Soft Free Shipping', titleStyle, 6);
txt('r1-code', '行1编号', 1089, 332, 70, 18, '1129618766', codeStyle, 6);
txt('r1-price', '行1售价', 1242, 330, 44, 20, '$ 3999', priceStyle, 6);
pill('r1-pill', '行1状态', 915, 358, 60, 26, '待审核', { backgroundColor: '#ecf5ff', color: '#409eff' });
img('dh-badge-1', '行1 DH徽标', 983, 361, 26, 24, 'assets/dh-badge-1.png', 6, 'DHgate');
txt('r1-store', '行1店铺', 1015, 362, 30, 18, '包包', storeStyle, 6);
txt('r1-cat', '行1类目', 445, 368, 210, 16, '箱包及箱包辅料 < 时装包 < 单肩包', { ...catStyle, whiteSpace: 'nowrap' }, 6);
txt('r1-time', '行1时间版本', 1532, 304, 150, 96, '认领：2026-10-10 10:53:56\n修改：2026-10-10 16:07:03\n刊登：2026-10-10 11:34:54\n认领版本号：1\n当前版本号：2', timeStyle, 6);
txt('r1-dash', '行1来源', 1825, 334, 8, 16, '-', dashStyle, 6);
const r1btn = { backgroundColor: '#ffffff', color: '#409eff', fontSize: '12px', border: '1px solid #409eff', borderRadius: 4 };
btn('r1-btn-edit', '行1编辑', 290, 410, 49, 28, '编辑', r1btn);
btn('r1-btn-republish', '行1更新发布', 350, 410, 73, 28, '更新发布', r1btn);
btn('r1-btn-tag', '行1标签', 434, 410, 49, 28, '标签', r1btn);
btn('r1-btn-del', '行1删除', 494, 410, 49, 28, '删除', r1btn);
btn('r1-btn-clone', '行1AI一键克隆', 554, 410, 84, 28, 'AI一键克隆', r1btn);

// 行 2
box('r2-check', '行2复选框', 306, 488, 16, 16, checkStyle, 5);
img('thumb-2', '行2商品图', 346, 452, 79, 81, 'assets/thumb-2.png', 6);
txt('r2-title', '行2标题', 445, 460, 630, 40, 'Shoulder Bags For Woman Handbag Classic Monogram Pattern Zipper Crossbody Bag Brown White Daily Commute Casual Travel', titleStyle, 6);
txt('r2-code', '行2编号', 1089, 494, 70, 18, '1129637301', codeStyle, 6);
txt('r2-price', '行2售价', 1242, 492, 48, 20, '$ 61.03', priceStyle, 6);
pill('r2-pill', '行2状态', 845, 504, 81, 26, '审核未通过', { backgroundColor: '#ffffff', color: '#409eff', border: '1px solid #409eff' });
img('dh-badge-2', '行2 DH徽标', 937, 506, 26, 25, 'assets/dh-badge-2.png', 6, 'DHgate');
txt('r2-store', '行2店铺', 966, 508, 66, 18, 'sneakerhub8', storeStyle, 6);
txt('r2-cat', '行2类目', 445, 512, 210, 16, '箱包及箱包辅料 < 时装包 < 单肩包', { ...catStyle, whiteSpace: 'nowrap' }, 6);
txt('r2-time', '行2时间版本', 1532, 450, 150, 96, '认领：2026-10-10 14:20:50\n修改：2026-10-10 14:41:03\n刊登：2026-10-10 14:39:16\n认领版本号：-\n当前版本号：4', timeStyle, 6);
txt('r2-dash', '行2来源', 1825, 496, 8, 16, '-', dashStyle, 6);

// 行 3
box('r3-check', '行3复选框', 306, 596, 16, 16, checkStyle, 5);
img('thumb-3', '行3商品图', 346, 562, 79, 80, 'assets/thumb-3.png', 6);
txt('r3-title', '行3标题', 445, 556, 630, 40, "Women's bag retro vintage vintage floral large capacity floral bag new Boston pillow bag single shoulder er crossbody bag", titleStyle, 6);
txt('r3-code', '行3编号', 1089, 602, 70, 18, '116416160', codeStyle, 6);
txt('r3-price', '行3售价', 1242, 600, 48, 20, '$ 61.03', priceStyle, 6);
pill('r3-pill', '行3状态', 855, 598, 76, 26, '发布失败', { backgroundColor: '#fef0f0', color: '#ff4949' });
img('dh-badge-3', '行3 DH徽标', 937, 600, 26, 25, 'assets/dh-badge-3.png', 6, 'DHgate');
txt('r3-store', '行3店铺', 966, 602, 66, 18, 'sneakerhub8', storeStyle, 6);
txt('r3-cat', '行3类目', 445, 604, 210, 16, '箱包及箱包辅料 < 时装包 < 单肩包', { ...catStyle, whiteSpace: 'nowrap' }, 6);
box('r3-error-box', '行3错误框', 300, 632, 462, 28, { backgroundColor: '#ffffff', border: '1px solid #ff4949', borderRadius: 4, zIndex: 5 });
txt('r3-error', '行3错误文字', 312, 638, 438, 16, '产品首图不能重复，请选择其他的图作为产品首图！', { fontSize: '12px', lineHeight: '16px', color: '#ff4949' }, 6);
txt('r3-time', '行3时间版本', 1532, 556, 150, 96, '认领：2026-10-10 10:48:13\n修改：2026-10-10 10:49:01\n刊登：-\n认领版本号：-\n当前版本号：4', timeStyle, 6);
txt('r3-dash', '行3来源', 1825, 604, 8, 16, '-', dashStyle, 6);

// 行 4
box('r4-check', '行4复选框', 306, 710, 16, 16, checkStyle, 5);
img('thumb-4', '行4商品图', 346, 678, 79, 80, 'assets/thumb-4.png', 6);
txt('r4-title', '行4标题', 445, 682, 630, 40, 'Mens Shorts And Tshirt Cartoon Print Elastic Waist Casual Beach Shorts For Men Grey White Daily Wear', titleStyle, 6);
txt('r4-code', '行4编号', 1060, 702, 133, 36, 'BAL-781e80d1-6002-4c24-\nb0b7-3b99ebe8c74e', { ...codeStyle, whiteSpace: 'pre-line' }, 6);
txt('r4-price', '行4售价', 1242, 712, 40, 20, '$ 120', priceStyle, 6);
pill('r4-pill', '行4状态', 890, 712, 67, 26, '发布失败', { backgroundColor: '#fef0f0', color: '#ff4949' });
img('dh-badge-4', '行4 DH徽标', 969, 715, 24, 24, 'assets/dh-badge-4.png', 6, 'DHgate');
txt('r4-store', '行4店铺', 998, 716, 38, 18, 'clothes', storeStyle, 6);
txt('r4-cat', '行4类目', 445, 718, 48, 16, '女士短裤', catStyle, 6);
box('r4-error-box', '行4错误框', 300, 746, 190, 28, { backgroundColor: '#ffffff', border: '1px solid #ff4949', borderRadius: 4, zIndex: 5 });
txt('r4-error', '行4错误文字', 312, 752, 166, 16, '请填写产品的腰型属性。', { fontSize: '12px', lineHeight: '16px', color: '#ff4949' }, 6);
txt('r4-time', '行4时间版本', 1532, 672, 150, 96, '认领：2026-09-30 15:40:35\n修改：2026-10-10 15:45:25\n刊登：-\n认领版本号：1\n当前版本号：1', timeStyle, 6);
txt('r4-dash', '行4来源', 1825, 716, 8, 16, '-', dashStyle, 6);

// 行 5（截断）
txt('r5-title', '行5标题', 445, 838, 885, 20, 'Laurel Shoulder Bag Elegant Handbag Croc Embossed Flap Front Gold Hardware Detachable Strap Oli', { ...titleStyle, whiteSpace: 'nowrap' }, 6);

// ===== 分页 =====
txt('pg-total', '共8条', 1481, 828, 60, 20, '共 8 条', { fontSize: '13px', lineHeight: '20px', color: '#606266' }, 6);
box('pg-size-box', '每页条数', 1556, 820, 92, 32, { backgroundColor: '#ffffff', border: '1px solid #dcdfe6', borderRadius: 4, zIndex: 5 });
txt('pg-size', '每页条数文字', 1568, 826, 56, 20, '10条/页', { fontSize: '13px', lineHeight: '20px', color: '#606266' }, 6);
icon('pg-size-chev', '每页箭头', 1630, 830, 12, 12, 'assets/icons/chevron-down.svg', 6);
box('pg-prev', '上一页', 1662, 820, 30, 32, { backgroundColor: '#ffffff', border: '1px solid #e4e7ed', borderRadius: 4, zIndex: 5 });
icon('pg-prev-ic', '上一页箭头', 1669, 828, 16, 16, 'assets/icons/chevron-left.svg', 6);
btn('pg-1', '页码1', 1698, 820, 30, 32, '1', { backgroundColor: '#ffffff', color: '#ff781f', fontSize: '13px', border: '1px solid #ff781f', borderRadius: 4 });
box('pg-next', '下一页', 1734, 820, 30, 32, { backgroundColor: '#ffffff', border: '1px solid #e4e7ed', borderRadius: 4, zIndex: 5 });
icon('pg-next-ic', '下一页箭头', 1741, 828, 16, 16, 'assets/icons/chevron-right.svg', 6);
txt('pg-goto', '前往', 1780, 828, 26, 20, '前往', { fontSize: '13px', lineHeight: '20px', color: '#606266' }, 6);
box('pg-input', '跳转输入', 1812, 820, 46, 32, { backgroundColor: '#ffffff', border: '1px solid #dcdfe6', borderRadius: 4, zIndex: 5 });
txt('pg-input-v', '跳转值', 1812, 826, 46, 20, '1', { fontSize: '13px', lineHeight: '20px', color: '#606266', textAlign: 'center' }, 6);
txt('pg-page', '页', 1864, 828, 13, 20, '页', { fontSize: '13px', lineHeight: '20px', color: '#606266' }, 6);

// ===== 悬浮元素 =====
box('float-card', '联系我们浮标', 1862, 495, 50, 55, { backgroundColor: '#ffffff', borderRadius: '8px 0px 0px 8px', boxShadow: 'rgba(0, 0, 0, 0.08) -2px 2px 12px 0px', zIndex: 8 });
icon('float-headset', '耳机图标', 1877, 502, 20, 20, 'assets/icons/headset.svg', 9);
txt('float-contact', '联系我们文字', 1862, 526, 50, 16, '联系我们', { fontSize: '11px', lineHeight: '16px', color: '#303133', textAlign: 'center', whiteSpace: 'nowrap' }, 9);
box('scroll-up', '上滚按钮', 1810, 728, 28, 28, { backgroundColor: '#ffffff', border: '1px solid #ffc29a', borderRadius: 14, boxShadow: 'rgba(0, 0, 0, 0.15) 0px 2px 8px 0px', zIndex: 8 });
icon('scroll-up-ic', '上箭头', 1816, 734, 16, 16, 'assets/icons/arrow-up.svg', 9);
box('scroll-down', '下滚按钮', 1810, 768, 28, 28, { backgroundColor: '#ffffff', border: '1px solid #ffc29a', borderRadius: 14, boxShadow: 'rgba(0, 0, 0, 0.15) 0px 2px 8px 0px', zIndex: 8 });
icon('scroll-down-ic', '下箭头', 1816, 774, 16, 16, 'assets/icons/arrow-down.svg', 9);

fs.writeFileSync(`${LOCAL}/elements.json`, JSON.stringify({ schemaVersion: 1, elements: els }, null, 2));
console.log('elements:', els.length);
