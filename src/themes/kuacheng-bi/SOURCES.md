# 来源与证据台账

主题：`kuacheng-bi`（骆驼队长BI）

## 状态与证据属性

- 处理状态：`待处理`、`处理中`、`部分完成`、`已完成`、`阻塞`
- 证据属性：`已观察事实`、`合理推断`、`待用户确认`

## 来源总表

| 来源 ID | 类型 | 原始位置 | 访问日期 | 访问条件 | 本地路径 | 覆盖范围 | 处理状态 | 证据属性 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `src-001` | 网站链接 | https://test.kuachengjing.com/dashboard | 2026-09-23 | 公开可访问；/dashboard 重定向至 /login，未登录 | `.local/theme-capture-kuacheng-bi/`（screenshot.png、responsive/、theme.json、computed-tokens.json、meta.json）；webfetch 输出 `tool_0cdb476b4001G6iqeeohpQcEMs`（app.css）、`tool_0cdb47887001nkHFOfJFhTklQW`（chunk-libs.css） | 全站生产 CSS（含业务主题变量与 Element UI 定制）、登录页截图与 Token、三档响应式截图 | 部分完成 | 已观察事实 |

## 页面与视图证据

| 来源 ID | 页面、Frame 或视图 | 路由或进入路径 | 核心状态 | 关键交互 | 截图或证据路径 | 采集状态 |
| --- | --- | --- | --- | --- | --- | --- |
| `src-001` | 登录页 | /login | 默认表单、品牌渐变背景、浮动装饰球 | 无需登录即可渲染 | `.local/theme-capture-kuacheng-bi/screenshot.png`、`responsive/desktop.png`、`responsive/tablet.png`、`responsive/mobile.png` | 已完成 |
| `src-001` | Dashboard（BI 工作台） | /dashboard | 需登录（被重定向） | 未采集 | 无；依据 CSS 令牌与运行时 CSS 变量反推 | 阻塞 |

## 图片、设计稿与文档

| 来源 ID | 文件或对象 | 内容范围 | 关联规则或组件 | 提取结果 |
| --- | --- | --- | --- | --- |
| `src-001` | `assets/source-preview.png`（登录页截图） | 全页静态 | 品牌渐变、圆形装饰、卡片式表单 | 主色 `#ff6b2c`（登录页）、字体 Inter/Noto Sans SC、圆角 14/12/8px |

## 来源缺口与冲突

| 来源 ID | 缺口或冲突 | 影响范围 | 解除条件 |
| --- | --- | --- | --- |
| `src-001` | Dashboard 页面视觉截图缺失（登录墙） | 仪表盘布局、菜单实际形态、图表配色无法确认 | 提供登录态截图或登录方式 |
| `src-001` | 编译期 Element 主色 `#1890ff`（`el-button--primary` 等字面值）与运行时 `--primary-color:#ff781f` 双主色并存 | 状态主色的最终裁决（已按用户确认以橙色 `#ff781f` 为准） | 已确认 |
| `src-001` | 侧边栏菜单变量冲突：app.css `:root` 定义 dark 菜单（`--menu-bg:#001529`、`--menu-hover:#000c17`），采集时 computed 值为浅橙（`--menu-bg:#ffe9d5`、`--menu-hover:#ff781f`） | 侧边栏明暗形态 | 提供 dashboard 截图确认 |
| `src-001` | 生产体 `body{}` 未声明背景色；采集页面实际渲染为白/浅色（登录页实测均白） | 页面底色 | 待 dashboard 截图归档 |
| `src-001` | 登录页使用 #ff6b2c / #3b82f6 / #10b981 / #8b5cf6 / #14b8a6 等 Tailwind 色装饰，与生产 CSS 变量（#ff781f / #13ce66 / #ffba00 / #ff4949）不一致 | 装饰元素配色是否进入主题 | 待确认（已按保守默认不并入品牌主色） |