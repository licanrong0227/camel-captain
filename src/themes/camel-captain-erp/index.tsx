import React from 'react';
import './style.css';
import { DesignMdBatchShowcase, type BatchShowcaseConfig } from '../../common/DesignMdBatchShowcase';
import themeConfig from './theme.json';
import sourcePreview from './assets/source-preview.png?url';
import previewComponents from './assets/preview-components.png?url';
import previewTable from './assets/preview-table.png?url';
import previewNavigation from './assets/preview-navigation.png?url';

function contrastFor(color: string) {
  const value = color.replace('#', '').slice(0, 6);
  if (value.length !== 6) return '#171717';
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? '#171717' : '#ffffff';
}

const { brand, success, warning, danger, info, neutral } = themeConfig.tokens.palette;

const paletteColors = themeConfig.display.palette.colors.map(color => ({
  color: color.hex,
  labelZh: color.name,
  labelEn: color.name,
  textColor: contrastFor(color.hex),
}));

const config: BatchShowcaseConfig = {
  brand: themeConfig.identity.titleZh,
  brandAlias: 'camel-captain-erp',
  description: themeConfig.identity.descriptionZh,
  descriptionEn: 'Camel Captain Cross-border ERP global design specification',
  variant: 'dashboard',
  distributionTags: themeConfig.tags,
  palette: paletteColors,
  radius: {
    control: themeConfig.tokens.radius.control,
    card: themeConfig.tokens.radius.card,
    preview: themeConfig.tokens.radius.large,
    pill: themeConfig.tokens.radius.full,
    source: themeConfig.tokens.radius.none,
  },
  spacing: {
    xs: themeConfig.tokens.spacing.xs,
    sm: themeConfig.tokens.spacing.sm,
    md: themeConfig.tokens.spacing.md,
    lg: themeConfig.tokens.spacing.lg,
    xl: themeConfig.tokens.spacing.xl,
    '2xl': themeConfig.tokens.spacing['2xl'],
    '3xl': themeConfig.tokens.spacing['3xl'],
    '4xl': themeConfig.tokens.spacing['4xl'],
  },
  shadows: [
    { label: '较轻阴影（量测推断）', value: themeConfig.tokens.shadow.light },
    { label: '基础阴影（量测推断）', value: themeConfig.tokens.shadow.base },
  ],
  borders: [
    { label: '控件边框', value: themeConfig.tokens.border.control },
    { label: '分割线', value: themeConfig.tokens.border.divider },
    { label: '选中边框', value: themeConfig.tokens.border.selected },
    { label: '激活边框', value: themeConfig.tokens.border.active },
  ],
  typography: [
    `font-family: 系统默认界面字体（不引入 Web Font）`,
    `行高公式: h = f + 8n`,
    `展示级: 30px / 500 / 38px`,
    `一级标题: 20px / 500 / 28px`,
    `页面标题: 18px / 500 / 26px`,
    `区块标题: 16px / 500 / 24px`,
    `正文/按钮: 14px / 400-500 / 22px`,
    `表格/辅助: 12px / 400 / 20px`,
  ],
  previewImages: [
    { type: 'product-screenshot', url: sourcePreview },
    { type: 'product-screenshot', url: previewNavigation },
    { type: 'product-screenshot', url: previewComponents },
    { type: 'product-screenshot', url: previewTable },
  ],
  panels: [
    {
      title: '色彩系统',
      eyebrow: 'COLOR',
      body: `品牌橙 ${brand['4']} 只用于主行动与激活态；成功 ${success['4']} / 警告 ${warning['4']} / 错误 ${danger['4']} / 信息 ${info['4']} 与品牌色同构，统一「-1 背景 / -2 边框 / -3 悬停 / -4 常规 / -5 点击」五级；文本层级由中性色 ${neutral['8']} / ${neutral['7']} / ${neutral['6']} / ${neutral['5']} 承担`,
    },
    {
      title: '工作台表面',
      eyebrow: 'SURFACE',
      body: `页面底 ${neutral['1']} + 白色卡片 + 1px ${neutral['4']} 边框；表格选中行与禁用控件底 ${neutral['2']}；分割线 ${neutral['3']}；弹窗遮罩 rgba(0,0,0,0.6)，图片遮罩 rgba(0,0,0,0.8)`,
    },
    {
      title: '导航形态',
      eyebrow: 'NAVIGATION',
      body: '浅色顶栏（量测 55px）与浅色侧边栏（量测 193px）：菜单 14px，激活项文字与图标转品牌橙，顶栏激活带 #FFEFE5 浅橙底，侧栏激活显示左侧品牌橙指示条；侧边栏支持收起/展开两态',
    },
    {
      title: '组件与留白',
      eyebrow: 'COMPONENT',
      body: '按钮常规 42px / 大号 62px（量测推断）、圆角 4px；Toast 分中/小两档与基础/可关闭两变体；弹窗内容填充区上下左右均 30px（规范原文）；卡片与浮层圆角 8px、标签 4px',
    },
    {
      title: '未采集项',
      eyebrow: 'GAP',
      body: '间距标尺、断点与响应式、动效时长、focus 态、图标尺寸网格、深色模式在规范页中未提供，当前按保守默认实现；阴影数值与组件精确高度为像素量测推断，落地前需以 Figma Dev Mode 数值校准',
    },
  ],
  usageGuidance: {
    do: themeConfig.display.usageGuidance.dos,
    dont: themeConfig.display.usageGuidance.donts,
  },
};

export default function CamelCaptainErpTheme() {
  return <DesignMdBatchShowcase config={config} />;
}
