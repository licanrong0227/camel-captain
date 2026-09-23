import React from 'react';
import './style.css';
import { DesignMdBatchShowcase, type BatchShowcaseConfig } from '../../common/DesignMdBatchShowcase';
import themeConfig from './theme.json';

function contrastFor(color: string) {
  const value = color.replace('#', '').slice(0, 6);
  if (value.length !== 6) return '#171717';
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? '#171717' : '#ffffff';
}

const config: BatchShowcaseConfig = {
  brand: themeConfig.identity.titleZh,
  description: themeConfig.identity.descriptionZh,
  variant: 'saas-devtool',
  distributionTags: themeConfig.tags,
  palette: themeConfig.display.palette.colors.map(color => ({
    color: color.hex,
    labelZh: color.name,
    labelEn: color.name,
    textColor: contrastFor(color.hex),
  })),
  radius: {
    control: themeConfig.tokens.radius.md,
    card: themeConfig.tokens.radius.xl,
    preview: themeConfig.tokens.radius.lg,
    pill: themeConfig.tokens.radius.full,
  },
  spacing: themeConfig.tokens.spacing,
  shadows: [
    { label: 'Level 1', value: themeConfig.tokens.shadow.level1 },
    { label: 'Level 2', value: themeConfig.tokens.shadow.level2 },
    { label: 'Level 3', value: themeConfig.tokens.shadow.level3 },
    { label: 'Level 4', value: themeConfig.tokens.shadow.level4 },
  ],
  borders: [
    { label: '默认边框', value: `1px solid ${themeConfig.tokens.palette.border.primary}` },
    { label: '次级边框', value: `1px solid ${themeConfig.tokens.palette.border.tertiary}` },
    { label: '聚焦边框', value: `2px solid ${themeConfig.tokens.palette.border.active}` },
  ],
  typography: [
    `font-family: ${themeConfig.tokens.typography.fontFamily}`,
    `H1: ${themeConfig.tokens.typography.fontSize.h1} / ${themeConfig.tokens.typography.fontWeight.bold} / ${themeConfig.tokens.typography.lineHeight.normal}`,
    `H2: ${themeConfig.tokens.typography.fontSize.h2} / ${themeConfig.tokens.typography.fontWeight.bold} / ${themeConfig.tokens.typography.lineHeight.normal}`,
    `H3: ${themeConfig.tokens.typography.fontSize.h3} / ${themeConfig.tokens.typography.fontWeight.bold} / ${themeConfig.tokens.typography.lineHeight.normal}`,
    `正文: ${themeConfig.tokens.typography.fontSize.body} / ${themeConfig.tokens.typography.fontWeight.normal} / ${themeConfig.tokens.typography.lineHeight.normal}`,
    `小号: ${themeConfig.tokens.typography.fontSize.small} / ${themeConfig.tokens.typography.fontWeight.normal} / ${themeConfig.tokens.typography.lineHeight.normal}`,
  ],
  previewImages: [],
  panels: [
    {
      title: '色彩系统',
      eyebrow: 'COLOR',
      body: '使用克制的色彩系统，主色 #409EFF，成功 #67C23A，警告 #E6A23C，危险 #F56C6C，信息 #909399',
    },
    {
      title: '字体系统',
      eyebrow: 'TYPOGRAPHY',
      body: '清晰的字体层级，14px 正文，1.5 行高，确保可读性和一致性',
    },
    {
      title: '圆角系统',
      eyebrow: 'RADIUS',
      body: '保持一致的圆角，4px 默认圆角，8px 卡片圆角，营造专业感',
    },
    {
      title: '间距系统',
      eyebrow: 'SPACING',
      body: '一致的间距创造整洁的布局，8px 小间距，12px 中间距，16px 大间距',
    },
  ],
  usageGuidance: {
    do: [
      '使用 4px 圆角保持一致性',
      '使用标准阴影层级增强层次感',
      '保持 14px 正文字号确保可读性',
      '使用状态色反馈操作结果',
      '保持 20px 间距创造整洁布局',
    ],
    dont: [
      '不要使用超过 3 种主色调',
      '不要使用过大圆角或无圆角',
      '不要使用过深阴影或彩色阴影',
      '不要使用花哨动画',
      '不要忽略禁用状态',
    ],
  },
};

export default function ElementUITheme() {
  return <DesignMdBatchShowcase config={config} />;
}