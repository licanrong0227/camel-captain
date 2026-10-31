import React from 'react';
import './style.css';
import { DesignMdBatchShowcase, type BatchShowcaseConfig } from '../../common/DesignMdBatchShowcase';
import themeConfig from './theme.json';
import sourcePreview from './assets/source-preview.png?url';
import previewColor from './assets/preview-color.png?url';
import previewTypography from './assets/preview-typography.png?url';
import previewComponents from './assets/preview-components.png?url';

function contrastFor(color: string) {
  const value = color.replace('#', '').slice(0, 6);
  if (value.length !== 6) return '#171717';
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? '#171717' : '#ffffff';
}

const { brand, success, warning, danger, neutral, stage, gradient } = themeConfig.tokens.palette;

const paletteColors = themeConfig.display.palette.colors.map(color => ({
  color: color.hex,
  labelZh: color.name,
  labelEn: color.en,
  textColor: contrastFor(color.hex),
}));

const config: BatchShowcaseConfig = {
  brand: themeConfig.identity.titleZh,
  brandAlias: 'bal-agent',
  description: themeConfig.identity.descriptionZh,
  descriptionEn: 'BAL Agent influencer marketing console design specification',
  variant: 'dashboard',
  distributionTags: themeConfig.tags,
  palette: paletteColors,
  radius: {
    control: themeConfig.tokens.radius.control,
    card: themeConfig.tokens.radius.card,
    preview: themeConfig.tokens.radius.panel,
    pill: themeConfig.tokens.radius.full,
    source: 'design-md',
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
    { label: '浮层阴影（量测推断）', value: themeConfig.tokens.shadow.overlay },
  ],
  borders: [
    { label: '控件边框', value: themeConfig.tokens.border.control },
    { label: '分割线', value: themeConfig.tokens.border.divider },
    { label: '选中边框', value: themeConfig.tokens.border.selected },
    { label: '错误边框', value: themeConfig.tokens.border.error },
  ],
  typography: [
    'PingFang SC',
    'PingFang SC',
    'PingFang SC · tabular-nums',
  ],
  previewImages: [
    { type: 'product-screenshot', url: sourcePreview },
    { type: 'product-screenshot', url: previewColor },
    { type: 'product-screenshot', url: previewTypography },
    { type: 'product-screenshot', url: previewComponents },
  ],
  panels: [
    {
      title: '色彩系统',
      eyebrow: 'COLOR',
      body: `品牌蓝 ${brand.main} 只承担主行动、链接、选中与进行中，浅底 ${brand.soft} 用于选中行与弱底按钮；成功 ${success.main} / 警示 ${warning.main} / 错误 ${danger.main} 各配深色文字与浅底三件套；阅读层级只有 ${neutral.ink} 与 ${neutral.inkSecondary} 两级`,
    },
    {
      title: '合作阶段标签',
      eyebrow: 'STAGE',
      body: `阶段一律「浅底 + 深字 + 圆点」：待回复 ${stage.reply.bg}、议价中 ${stage.negotiating.bg} / ${stage.negotiating.fg}、待寄样 ${stage.sampling.bg} / ${stage.sampling.fg}、物流追踪 ${stage.logistics.bg}、待审核 ${stage.review.bg} / ${stage.review.fg}、待发布 ${stage.publishing.bg} / ${stage.publishing.fg}、待结算 ${stage.settlement.bg}；进度条灰=待回复、蓝=已回复、绿=已合作`,
    },
    {
      title: 'AI 渐变',
      eyebrow: 'AI',
      body: `AI 能力单独用固定渐变：Flow ${gradient.flow[0]} → ${gradient.flow[2]} → ${gradient.flow[4]} 用于解析产品与生成 Brief，Edit ${gradient.edit[0]} → ${gradient.edit[2]} 用于 AI 修改；渐变不用于任何业务状态`,
    },
    {
      title: '表面与组件',
      eyebrow: 'SURFACE',
      body: `画布 ${neutral.canvas} + 白色卡片（圆角 12、1px ${neutral.border}、无投影）+ 24px 卡片间距；主按钮 40 / 32 高、圆角 8；弱底按钮 ${brand.soft} 底 + ${brand.main} 字；禁用为低饱和蓝 ${'#A5BFF7'} 或中性灰底；顶栏 52px`,
    },
    {
      title: '字体层级',
      eyebrow: 'TYPE',
      body: 'PingFang SC + 系统回退，不引入 Web Font。固定 7 级：关键数据 30/38 Semibold、页面标题 28/40 Semibold、模块标题 18/28 Semibold、卡片标题 16/24 Medium、正文强调 14/22 Medium、正文 14/22 Regular、辅助说明 12/20 Regular；金额与人数使用 tabular-nums',
    },
    {
      title: '未采集项',
      eyebrow: 'GAP',
      body: '间距标尺、圆角数值、阴影层级、响应式断点与动效时长规范页未提供，当前按 4px 基准与截图量测保守默认；品牌色存在说明文字 #2555EB 与色块实取 #2563EB 的冲突，已在 SOURCES.md 登记待确认',
    },
  ],
  usageGuidance: {
    do: themeConfig.display.usageGuidance.dos,
    dont: themeConfig.display.usageGuidance.donts,
  },
};

export default function BalAgentTheme() {
  return <DesignMdBatchShowcase config={config} />;
}
