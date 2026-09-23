import React from 'react';
import './style.css';
import { DesignMdBatchShowcase, type BatchShowcaseConfig } from '../../common/DesignMdBatchShowcase';
import themeConfig from './theme.json';
import sourcePreview from './assets/source-preview.png?url';
import previewDesktop from './assets/preview-desktop.png?url';
import previewTablet from './assets/preview-tablet.png?url';
import previewMobile from './assets/preview-mobile.png?url';

function contrastFor(color: string) {
  const value = color.replace('#', '').slice(0, 6);
  if (value.length !== 6) return '#171717';
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? '#171717' : '#ffffff';
}

const paletteColors = themeConfig.display.palette.colors.map(color => ({
  color: color.hex,
  labelZh: color.name,
  labelEn: color.name,
  textColor: contrastFor(color.hex),
}));

const config: BatchShowcaseConfig = {
  brand: themeConfig.identity.titleZh,
  description: themeConfig.identity.descriptionZh,
  variant: 'dashboard',
  distributionTags: themeConfig.tags,
  palette: paletteColors,
  radius: {
    control: themeConfig.tokens.radius.control,
    card: themeConfig.tokens.radius.card,
    preview: themeConfig.tokens.radius.loginCard,
    pill: themeConfig.tokens.radius.full,
  },
  spacing: themeConfig.tokens.spacing,
  shadows: [
    { label: 'Popup', value: themeConfig.tokens.shadow.popup },
    { label: 'Navbar', value: themeConfig.tokens.shadow.navbar },
    { label: 'Sidebar', value: themeConfig.tokens.shadow.sidebar },
    { label: 'Dialog', value: themeConfig.tokens.shadow.dialog },
  ],
  borders: [
    { label: '控件边框', value: `1px solid ${themeConfig.tokens.palette.border.primary}` },
    { label: '常规分割线', value: `1px solid ${themeConfig.tokens.palette.border.light}` },
    { label: '卡片边框', value: `1px solid ${themeConfig.tokens.palette.border.lighter}` },
  ],
  typography: [
    `font-family: ${themeConfig.tokens.typography.fontFamily}`,
    `H1: 24px / 700 / 1.5`,
    `H2: 20px / 700 / 1.5`,
    `H4: 16px / 600 / 1.5`,
    `正文/按钮: 14px / 400-500 / 1.5`,
    `表格正文: 12px / 400 / 1.5`,
    `登录页主标语: 54px / 800 / -1.35px`,
  ],
  previewImages: [
    { type: 'product-screenshot', url: sourcePreview },
    { type: 'product-screenshot', url: previewDesktop },
    { type: 'product-screenshot', url: previewTablet },
    { type: 'product-screenshot', url: previewMobile },
  ],
  panels: [
    {
      title: '色彩系统',
      eyebrow: 'COLOR',
      body: '橙色品牌强调 #ff781f + 深色导航 #001529 + 浅色工作区 #f0f1f5；状态色 #13ce66 / #ffba00 / #ff4949 / #909399',
    },
    {
      title: '底色与表面',
      eyebrow: 'SURFACE',
      body: '页面底 #f0f1f5，卡片纯白、圆角 10px、边框 1px solid #e6ebf5；表格表头渐变 #fff5ef → #ffede0',
    },
    {
      title: '控件与表格',
      eyebrow: 'CONTROL',
      body: '按钮/输入 8px 圆角、40px 高；表格 12px 正文、14px 表头，1px #ebeef5 行线，行 hover #f5f7fa',
    },
    {
      title: '登录页独立场景',
      eyebrow: 'LOGIN',
      body: 'Inter/Noto Sans SC、54px 主标语、品牌渐变按钮 linear-gradient(135deg,#ff6b2c,#ff8552,#ff8a42)、14px 卡片圆角',
    },
  ],
  usageGuidance: {
    do: [
      '主色统一使用 #ff781f，状态色 #13ce66/#ffba00/#ff4949/#909399',
      '工作区浅底 #f0f1f5 + 白卡片 + 表头渐变 #fff5ef→#ffede0',
      '控件 8px 圆角、卡片 10px，1px 灰阶边框',
      '字体 14px 正文 / 12px 表格 / 20px 区块标题',
      '阴影仅用 popup/navbar/sidebar/dialog 四档',
    ],
    dont: [
      '不要在业务区使用蓝色 #1890ff 作品牌强调（遗留编译色）',
      '不要在业务区使用彩色阴影或过重的大浮层阴影',
      '不要把登录页 Tailwind 灰阶（#111827 等）混入业务文本体系',
      '不要改变深色导航 #001529 与浅色工作区的搭配',
      '不要在组件内硬编码颜色，统一走 --primary-color 变量',
    ],
  },
};

export default function KuachengBiTheme() {
  return <DesignMdBatchShowcase config={config} />;
}