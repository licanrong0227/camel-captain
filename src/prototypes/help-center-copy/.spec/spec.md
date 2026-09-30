# 帮助中心 - 原型规格说明

## 1. 基本信息

| 项目 | 内容 |
|------|------|
| 原型名称 | 帮助中心 |
| 原型ID | help-center |
| 入口文件 | `src/prototypes/help-center/index.tsx` |
| 样式文件 | `src/prototypes/help-center/style.css` |
| 标注数据 | `src/prototypes/help-center/annotation-source.json` |

## 2. 功能概述

帮助中心是一个多页面原型，提供系统帮助文档的浏览和导航功能。包含以下主要功能：

- 左侧导航栏：展示帮助文档的章节结构，支持分组展开/折叠，「添加商品」下再分二级、三级导航
- 搜索功能：支持按关键词搜索帮助文档
- 内容区域：整篇文档为一个连续长页面（不使用 scroll-snap 整屏吸附），章节和正文小块都是页面内锚点
- 标注面板：右侧显示 `@axhub/annotation` 标注面板
- 上下章导航：快速切换到上一章或下一章

## 3. 页面结构

```
help-center/
├── index.tsx              # 入口文件（含 Axure API）
├── style.css              # 样式文件
├── annotation-source.json # 标注数据
└── .spec/
    └── spec.md            # 本规格说明
```

## 4. 路由定义

使用 `defineHashPageRoute` 定义的 hash 路由：

| 页面ID | 页面标题 |
|--------|----------|
| directory | 目录导航 |
| workflow | 全流程图 |
| quickstart | 快速入门 |
| dashboard | 首页 Dashboard |
| product-list | 商品列表 |
| product-add | 添加商品 |
| product-category | 分类管理 |
| order | 交易管理 |
| purchase | 采购管理 |
| logistics | 物流管理 |
| report | 报表中心 |

默认页面：`directory`

## 5. Axure API

### 5.1 事件列表 (eventList)

| 事件名 | 描述 | payload |
|--------|------|---------|
| onNavigate | 页面导航切换时触发 | 页面ID字符串 |
| onSearch | 搜索关键词改变时触发 | 搜索关键词字符串 |
| onToggleGroup | 展开/折叠导航分组时触发 | JSON字符串 `{"groupId":"...",expanded:true/false}` |

### 5.2 动作列表 (actionList)

| 动作名 | 描述 | 参数格式 |
|--------|------|----------|
| navigate | 导航到指定页面 | 页面ID字符串（如 "dashboard"） |
| resetSearch | 重置搜索框内容为空 | 无 |
| expandAll | 展开所有导航分组 | 无 |
| collapseAll | 折叠所有导航分组 | 无 |

### 5.3 变量列表 (varList)

| 变量名 | 类型 | 描述 |
|--------|------|------|
| current_page_id | string | 当前激活的页面ID |
| search_keyword | string | 当前搜索关键词 |
| expanded_groups | string | 当前展开的分组ID列表（JSON字符串） |

### 5.4 配置项列表 (configList)

| 配置ID | 类型 | 显示名称 | 描述 | 默认值 |
|--------|------|----------|------|--------|
| search_placeholder | input | 搜索占位符 | 搜索框的占位提示文本 | 搜索帮助文档... |
| title | input | 标题 | 页面标题文本 | 帮助中心 |
| show_annotation | switch | 显示标注 | 是否显示右侧标注面板 | true |

### 5.5 数据项列表 (dataList)

| 数据名 | 描述 | 字段 |
|--------|------|------|
| navigation | 导航数据 | id (导航项ID), title (导航项标题), children (子导航项列表，JSON字符串) |

## 6. 交互说明

### 6.1 导航与锚点定位

- 正文是一个连续长页面（不做整屏吸附），所有章节首尾相连、中间没有分割线
- 所有章节标题右侧不再显示「商品管理·N/5章节」角标
- 点击导航节点：只把右侧内容滚动到对应位置，不改变展开/折叠状态，并触发 `onNavigate` 事件
- 滚动正文时只高亮当前命中的那一个锚点，父级节点不高亮；命中「商品管理」一级标题时高亮左侧的「商品管理」分组标题
- 右侧滚动到某个章节时，左侧会自动展开该锚点的所有上级分组和节点（只展开、不高亮）
- 每个左侧导航锚点都对应右侧一个真实存在的标题：「配置规格与发布」为四级标题、「注意事项与说明」为三级标题，「表单字段说明」锚定在它自己的二级标题上（不再锚定表格）
- 内容滚到底部时，最后一个章节（SKU管理）算作命中
- 锚点归属的章节会同步写入 hash 路由（子级锚点仍停留在所属章节的 page 上）
- 通过 `navigate` 动作可编程式跳转到任一锚点

### 6.2 分组与多级导航展开/折叠

- 「商品管理 › 添加商品」下再分两级：二级（操作步骤、注意事项与说明）、三级（上传商品图片、配置规格与发布、表单字段说明、常见问题）
- 计数规则：除最后一级（叶子）节点外，其余节点都在标题右侧显示自身子项数量，形如「添加商品 (2)」；分组标题同样显示计数（商品管理 (5)）；叶子节点不显示计数
- 因侧边栏宽度有限且多级节点有缩进，节点标题过长时用省略号截断，保证计数和箭头不被顶出按钮
- 展开和折叠只通过节点右侧的箭头切换，点击箭头不会滚动内容，并触发 `onToggleGroup` 事件
- 箭头是一个 20×20 的圆形小按钮（`.help-center-nav-toggle`）：默认浅灰、hover 出现背景色，展开时图标旋转 90°
- 分组标题的展开状态由 `expandedGroups` 驱动，`expandAll` / `collapseAll` 动作生效；点击有锚点的分组标题（商品管理）会滚动到该标题

### 6.3 搜索

- 输入关键词时实时触发 `onSearch` 事件
- 通过 `resetSearch` 动作可清空搜索框

### 6.4 「添加商品」标题层级

- 正文标题区按四级堆叠：商品管理（一级 28px）› 添加商品（二级 24px）› 操作步骤（三级 20px）› 上传商品图片（四级 20px）
- 从一级到三级字号逐级减小，三级及以后字号相同
- 「商品管理」标题本身是一个锚点，位于顶部时对应左侧分组标题选中
- 标题之间的正文内容（简介、提示框、界面截图、按钮说明表、前两条步骤）已删除

## 7. 标注集成

使用 `@axhub/annotation` 的 `AnnotationViewer` 组件：

- 数据源：`./annotation-source.json`（静态导入）
- 当前页面ID：从 URL hash 或 search 参数获取
- 目录路由：点击目录节点时更新 URL hash
- 本轮新增两条组件标注（两条都同时绑定 `product-add` 和 `product-list` 两个页面）：
  - `annotation-heading-scale`「标题字号说明」：锚定 `data-annotation-id="heading-scale"`（「添加商品」章节的标题区），正文只说明「字号按层级逐级递减、三级及更深保持相同字号，具体数值参考 UI 图」，不写死 px
  - `annotation-nav-anchor`「导航锚点交互说明」：锚定 `data-annotation-id="nav-anchor-interaction"`（左侧 `.help-center-sidebar`），正文按当前实现说明锚点定位、箭头折叠、节点计数、滚动高亮、自动展开、路由同步、宽度约束等规则
- 旧的 `annotation-4`、`annotation-8` 仍描述 scroll-snap 吸附和「每次只展开一个顶级节点」，与现在的实现不符，本轮未改动其内容

## 8. 配置说明

### 8.1 搜索占位符

```typescript
innerProps.config.search_placeholder = '搜索帮助文档...'
```

### 8.2 标题

```typescript
innerProps.config.title = '帮助中心'
```

### 8.3 显示标注面板

```typescript
innerProps.config.show_annotation = true
```
