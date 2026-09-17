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

- 左侧导航栏：展示帮助文档的章节结构，支持分组展开/折叠
- 搜索功能：支持按关键词搜索帮助文档
- 内容区域：展示当前选中章节的帮助内容
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

### 6.1 导航切换

- 点击左侧导航项，切换到对应页面
- 触发 `onNavigate` 事件
- 通过 `navigate` 动作可编程式切换页面

### 6.2 分组展开/折叠

- 点击有子项的导航分组，展开或折叠
- 触发 `onToggleGroup` 事件
- 通过 `expandAll` / `collapseAll` 动作控制全部分组状态

### 6.3 搜索

- 输入关键词时实时触发 `onSearch` 事件
- 通过 `resetSearch` 动作可清空搜索框

## 7. 标注集成

使用 `@axhub/annotation` 的 `AnnotationViewer` 组件：

- 数据源：`./annotation-source.json`（静态导入）
- 当前页面ID：从 URL hash 或 search 参数获取
- 目录路由：点击目录节点时更新 URL hash

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
