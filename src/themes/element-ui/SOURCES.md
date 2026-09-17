# 来源与证据台账

## src-001: Element UI 官方文档

- **原始位置**: https://element.eleme.cn/#/zh-CN/component/installation
- **访问日期**: 2026-09-17
- **访问条件**: 公开访问，无需登录
- **本地证据**: 通过 webfetch 获取 CSS 文件 `element-ui.426781b.css`，提取设计 token
- **覆盖范围**: Element UI 2.x 组件库的完整 CSS 样式，包含颜色、字体、间距、圆角、边框、阴影、组件状态和响应式断点
- **处理状态**: 已完成
- **证据属性**: 已观察事实
- **缺口**:
  1. 字体栈仅提取到 `Sans-serif`，完整栈（PingFang SC / Microsoft YaHei 等）需查阅源码
  2. CSS 中未包含 CSS 变量，全部为硬编码值
  3. 未发现深色模式样式（Element UI 2.x 不原生支持）
  4. Grid 栏宽具体计算需结合 24 栏公式
- **冲突**: 无

## 来源汇总

| 编号 | 来源 | 状态 | 证据属性 |
|------|------|------|----------|
| src-001 | Element UI 官方文档 | 已完成 | 已观察事实 |
