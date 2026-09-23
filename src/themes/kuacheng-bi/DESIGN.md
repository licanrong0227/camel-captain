# 骆驼队长BI 设计规范（kuacheng-bi）

- 来源：https://test.kuachengjing.com/dashboard （2026-09-23 采集；/dashboard 需登录，登录页完成视觉采集，业务区依据生产 CSS 令牌）
- 主色裁决：用户确认以运行时 `--primary-color:#ff781f` 橙色为准；编译期 Element 主色 `#1890ff` 保留说明为遗留冲突色，不作为品牌主色。
- 本规范为视觉事实源；登录页实测值以「登录页」标注，其余为生产 CSS 观察值。未采集项一律标注「待确认」，不做行业惯例补造。

## 1. 视觉主题与氛围

### 品牌/产品背景
骆驼队长跨境 ERP 的 BI 智慧运营中台（Vue 2 + Element UI 构建），面向跨境卖家管理层的运营数据看板与后台管理界面。

### 适用场景
- 数据仪表盘、实时运营指标
- 跨境 ERP / 中后台管理系统
- 表单密集型业务（订单、货件、财务批次、物流模板）
- 企业级 BI 报表与权限管理

### 不适用场景
- 消费级 C 端娱乐、电商大促营销页
- 极简无氛围或纯暗色工具（本主题以「深色侧边栏 + 白色工作区 + 橙色强调」为骨架）

### 关键词
跨境、数据、运营、橙色活力、信任感、信息密度高

### 页面气质
现代数据中台：白底工作区、橙色品牌强调、深色导航锚定、卡片化指标。

### 信息密度
中高；适合大量结构化数据，表格正文 12px、页面级间隔以 20px 节奏控制。

### 品牌表达边界
- 橙色仅用于强调与主操作，不铺满背景（登录页品牌渐变除外，属于独立营销场景）。
- 深色导航 #001529 家族与工作区浅色 #f0f1f5 家族固定搭配，不混用明暗变量。
- 状态反馈使用 `--primary-color` 变量统一切换，业务组件写入变量而非硬编码。
- 数据看板避免过重阴影与彩色阴影，遵循统一阴影层级。

## 2. 色彩系统

### 品牌主色（橙色，已确认）
| Token | 值 | 用途 | 边界 |
| --- | --- | --- | --- |
| `--primary-color` | `#ff781f` | 主按钮/选中/菜单高亮/tabs 活跃条/链接 em | 不在大面积背景铺色 |
| 主色柔和底 `--theme-background` / `--button-soft-bg` | `#ffe9d5` | 默认按钮 hover 底、标签浅底 | 仅作 12px+ 圆角浅底 |
| 主色深 `--primary-color-muted` | `#b35416` | 主色上的文字强调或深态 | 深底上使用 |
| 选中边框 `--selected-border` | `#ffc29a` | 选中态描边 | 与 `--selected-background` 成对 |
| 登录页品牌强调（实测） | `#ff6b2c` | 登录页按钮渐变起点、图标 tint | 登录页独立使用，业务区用 #ff781f |

### 遗留冲突色（不在主题主色中）
- `#1890ff`：编译期 Element 主色字面量，应用于未被变量覆盖的主按钮常态背景、pagination active、横向菜单 active 下边框等。规范要求：新工作以橙色为唯一品牌主色；该蓝色遗留后续需在源码覆盖 `el-button--primary` 常态背景后再消除。**状态：待确认（是否安排源码覆盖）**。
- 编译期主色浅底 `#e7f3ff`、hover `#46a6ff`、active `#1681e6`、disabled `#8bc7ff`：同上，仅在遗留组件中出现。

### 语义状态色（与 `--button-*` 变量一致）
| Token | 值 | 用途 |
| --- | --- | --- |
| 成功 `--success-color` | `#13ce66` | 成功态、成功按钮 |
| 警告 `--warning-color` | `#ffba00` | 警告态、警告按钮 |
| 危险 `--danger-color` | `#ff4949` | 错误/危险、表单错误边框 |
| 信息 `--info-color` | `#909399` | 信息提示、次要/禁用操作 |

### 文本色阶
| Token | 值 | 用途 |
| --- | --- | --- |
| `--text-primary` | `#303133` | 标题、重点内容（卡片标题、菜单置顶项） |
| `--text-regular` | `#606266` | 正文默认（按钮文字、输入文字） |
| `--text-secondary` | `#909399` | 辅助说明、次要文字 |
| `--text-placeholder` | `#c0c4cc` | 占位与禁用文字 |
| 登录页文本（实测） | `#111827` / `#374151` / `#6b7280` / `#9ca3af` | 登录页专用灰阶，勿混入业务区 |

### 背景与表面
| Token | 值 | 用途 |
| --- | --- | --- |
| 页面背景 | `#f0f1f5`（html/body 全局） | 工作区页面底色，标签栏同族 `#eff0f4` |
| 表面 | `#ffffff` | 卡片、导航栏、侧边栏 |
| 表尾/操作区 `--menu-light-hover` | `#f0f1f5` | 浅色菜单 hover、表尾悬浮 |
| 深色导航 `--menu-bg` | `#001529` | 深色侧边栏底（app.css 静态值） |
| 深色导航 hover `--menu-hover` | `#000c17` | 深色侧边栏 hover 底 |
| 深色子菜单 `--sub-menu-bg` / hover | `#000c17` / `#001528` | 折叠子菜单层 |
| 表格表头渐变 | `linear-gradient(180deg,#fff5ef,#ffede0)` | 表头强调（变量两段 `#fff5ef`→`#ffede0`） |
| 子导航渐变 `--` | `linear-gradient(90deg,#20b6f9,#2178f1)` | 深蓝渐变副导航（业务遗留，仅出现于 sub-navbar） |

> 待确认：dashboard 实图补齐前，侧边栏是深色（#001529）还是浅橙（#ffe9d5 采集值）以实图为准；页面底色是否统一 #f0f1f5。

### 边框色阶
| Token | 值 | 用途 |
| --- | --- | --- |
| `--border-light` | `#dfe4ed` | 常规分割线（表格/头部/单边线） |
| `--border-lighter` | `#e6ebf5` | 卡片、轻分割线 |
| Element 默认边框 | `#dcdfe6` | 输入框、按钮常态边框 |
| 表列分割 | `#ebeef5`（宽 0）| 默认关闭纵向列线 |
| 表行分割 | `#ebeef5`（宽 1px）| 默认横向行线 |

## 3. 字体系统

### 字体族
- 业务区（Element 体系）：
  `Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Arial, sans-serif`
- 登录页（实测）：
  `Inter, "Noto Sans SC", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
- 图标字体：`element-icons`、`remixicon`

### 字号层级（业务区观察值，按出现频次）
| 角色 | 字号 | 字重 | 行高 | 来源 |
| --- | --- | --- | --- | --- |
| 大标题 H1 | 24px | 700 | 1.5 | CSS 观察 |
| 页面标题 H2 | 20px | 700 | 1.5 | CSS 观察 |
| 区块标题 H3 | 18px | 600-700 | 1.5 | CSS 观察 |
| 小标题 H4 | 16px | 500-600 | 1.5 | CSS 观察 |
| 正文/按钮 | 14px | 400/500 | 1.5 | 表头变量 `--table-header-font-size:14px` |
| 表格正文 | 12px | 400 | 1.5 | `--table-body-font-size:12px` |
| 菜单项 | 13px | 400-500 | 1.5 | 侧边栏业务菜单观察 |

### 登录页字体（实测，独立适用）
| 角色 | 字号 | 字重 | 行高/字距 |
| --- | --- | --- | --- |
| 主标语 H1 | 54px | 800 | 67.5px / -1.35px |
| 区块标题 | 16px | 600 | 25.6px |
| 表单按钮 | 15px | 700 | 15px / 0.5px |
| 标签类目 | 11px | 500 | 13.2px / 0.3px |

### 字重
400 正文 · 500 强调/按钮 · 600 小标题 · 700 标题 · 800 登录页大标题。

## 4. 组件规范

统一基调：控件圆角 8px、卡片圆角 10px、1px 边框、深浅状态均通过 CSS 变量切换。

### 按钮（Element UI 定制）
- 尺寸：默认 40px 高、`padding:0 15px`；small 32px；mini 28px；圆角 `--button-border-radius:8px`。
- 常态：白底、`1px solid #dcdfe6`、文字 `#606266`。
- 主要按钮：`--button-primary:#ff781f` 底 + 白字（规范目标态；当前被 #1890ff 编译值遗留覆盖，**待确认是否源码改写**）。
- 业务覆盖（default 型 hover/active/disabled）：颜色切到 `var(--button-primary)`，底 `var(--button-soft-bg,#ffe9d5)`。
- 语义按钮：success `#13ce66`、warning `#ffba00`、danger `#ff4949`、info `#909399`。
- 行操作按钮：`--row-action-btn-text/border:var(--primary-color,#ff781f)`。

### 输入框
- 高 40px，`padding:0 15px`，圆角 8px，边框 `1px solid #dcdfe6`，文字 `#606266`。
- hover 边框 `#c0c4cc`；focus 边框 `#1890ff`（遗留蓝，规范目标为 `var(--primary-color)`，**待确认**）；error 边框 `#ff4949`。

### 卡片
- 背景 `#fff`，边框 `1px solid #e6ebf5`，圆角 `--card-border-radius:10px`。
- 头部 padding `18px 20px`（业务覆盖 `min-height:40px`），内容 padding `20px`（变量默认 `--card-content-padding:0` 由业务控制）。
- 悬浮阴影可选 `0 2px 12px 0 rgba(0,0,0,.1)`。

### 表格
- 表头高 40px，渐变底 `linear-gradient(180deg,#fff5ef,#ffede0)`，字号 14px。
- 正文 12px，单元格纵向 padding 12px（medium）/ 10px / 8px / 6px。
- 行线 `1px #ebeef5`，不显示列线；行 hover `#f5f7fa`；圆角 8px。

### 导航
- 横向菜单：item 高 60px，文字 `#909399`，active 下边框 `2px solid #1890ff` + 文字 `#303133`（**遗留蓝，规范目标橙**）。
- 侧边栏菜单：item 高 40px，`margin:2px 8px`，圆角 8px；hover/active 走 `--menu-hover`/`--menu-active-text`（深色态白色系/浅橙态橙色，明暗待确认）。
- sub-navbar：高 50px，渐变蓝 `linear-gradient(90deg,#20b6f9,#2178f1)`。

### 弹层与反馈
- 弹窗：圆角 6px，阴影 `0 1px 3px rgba(0,0,0,.3)`，宽度 50% 默认。
- 下拉/弹出面板：圆角 8px，阴影 `0 2px 12px 0 rgba(0,0,0,.1)`。
- MessageBox：圆角 4px，宽 420px。
- Tag：默认浅蓝 `#e7f3ff` 系；success/info 变体同状态色浅底。

### 登录页组件（实测）
- 卡片：圆角 14px（大卡）/12px（输入/按钮）/8px（小元素）；输入 42px 高。
- 按钮：渐变 `linear-gradient(135deg,#ff6b2c,#ff8552,#ff8a42)`，圆角 12px，白字 15px/700。
- 装饰球：100% 圆，多色径向渐变，浮动动画 16-22s ease-in-out。

## 5. 布局与间距

### 应用骨架
- 侧边栏 140px 固定（折叠 54px）；顶栏 50px；Logo 区高 64px。
- `.app-container` 页面内边距 `20px`；筛选区 `padding-bottom:10px`；分页区 `margin-top:15px`。
- TagsView 容器：背景 `#eff0f4`，`padding-left:162px;padding-top:10px`；item 高 26px。
- 移动端：侧边栏 `width:140px` 抽屉式 `translate3d(-140px,0,0)`。

### 间距标尺（Element 默认系）
| 名 | 值 | 用途 |
| --- | --- | --- |
| xs | 4px | 极小 |
| sm | 8px | 菜单项 margin（2px 8px）、小间隔 |
| md | 12px | 单元格 padding、中间隔 |
| lg | 16px | 侧边栏滚动区 padding |
| xl | 20px | 页面容器、卡片内容 |
| 2xl | 24px | 抽屉内边距、区块间隔 |
| 常用组件尺寸 | 10px/15px/25px/30px | 表单间隙、分页条 |

### 栅格
- 24 栏 + 20px 栏距；断点 xs <768 / sm ≥768 / md ≥992 / lg ≥1200 / xl ≥1920（Element 语义，CSS 中出现 767/768/992/1200/1920 五档）。

## 6. 深度、阴影与边框

| 层级 | 值 | 用途 |
| --- | --- | --- |
| popup | `0 2px 12px 0 rgba(0,0,0,.1)` | 下拉、弹出菜单、卡片悬浮 |
| navbar | `3px 4px 4px rgba(0,21,41,.08)` | 顶栏投影 |
| sidebar | `0 6px 6px rgba(0,21,41,.35)` | 侧边栏投影 |
| dialog | `0 1px 3px rgba(0,0,0,.3)` | 弹窗 |
| drawer | `0 8px 10px -5px rgba(0,0,0,.2), 0 16px 24px 2px rgba(0,0,0,.14), 0 6px 30px 5px rgba(0,0,0,.12)` | 抽屉、Material 三层 |
| focus ring | `0 0 2px 2px var(--primary-color)` | 单选 focus（橙色化后） |
| 登录页卡片 | `rgba(90,138,200,.25) 0 20px 60px` 等彩色投影 | 登录页装饰专用，业务区不做彩色投影 |

禁止：业务工作区使用彩色投影、`0 2px 12px` 以外过重阴影；环形元素使用 `0 0 1pc` 陈旧写法。

## 7. 动效

- 标准过渡：`all .3s`（Element 默认），`cubic-bezier(.645,.045,.355,1)`。
- 控件（按钮/链接）：0.2s；输入框 0.25s；菜单项 `transform .3s`。
- 登录页动画（实测）：浮球 `sphereFloat` 16-22s 循环、卡片 `floatY`+`cardBreathe` 5-6s / 3.5-4.2s ease-in-out。
- 弹出参考缓动：`cubic-bezier(.34,1.56,.64,1)`（弹跳感，仅登录按钮）。
- 禁止：业务区使用大幅位移动画与持续呼吸动画；hover 不依赖 opacity 闪烁。

## 8. 响应式行为

| 断点 | 行为（CSS 观察） |
| --- | --- |
| ≥1920 | 大屏内容加宽 |
| ≥1200 | 桌面完整布局（默认设计基准） |
| ≥992 | 标准栅格生效 |
| ≥768 / ≤767 | 平板/手机切换：侧边栏转抽屉（140px 平移）、TagsView 收拢、卡片栅格单列 |
| 移动端 | 侧边栏隐藏于视口外，App 区全宽 |

补充：登录页实测三档（1440/768/390）下卡片单列收窄、输入与按钮全宽，装饰球保留但缩小半径。

## 9. Prompt guide

### 推荐写法
1. 主色一律使用 `#ff781f`，状态色 `#13ce66 / #ffba00 / #ff4949 / #909399`；文本 `#303133 / #606266 / #909399 / #c0c4cc`。
2. 控件圆角 8px、卡片 10px、边框 `1px solid #dcdfe6（输入/按钮）` 或 `#e6ebf5（卡片）`。
3. 业务页面结构：`20px` 页面内边距 + 浅底 #f0f1f5 + 白色卡片 + 表头渐变 `#fff5ef→#ffede0`。
4. 为表格提供 12px 正文、14px 表头、1px #ebeef5 行线，行 hover #f5f7fa。
5. 阴影固定三档：popup `0 2px 12px rgba(0,0,0,.1)`、navbar `3px 4px 4px rgba(0,21,41,.08)`、sidebar `0 6px 6px rgba(0,21,41,.35)`。

### 禁止写法
1. 不要使用 `#1890ff` 蓝色系作为品牌强调（遗留编译色，待源码修复后移除）。
2. 不要在业务工作区使用彩色/大面积渐变（登录页品牌渐变除外）。
3. 不要使用超过 20px 的导航阴影或 `0 8px 40px` 级别的大浮层。
4. 不要把登录页灰阶（#111827 等 Tailwind 色）混入业务文本体系。
5. 不要改变深色导航 #001529 家族与浅色工作区 #f0f1f5 家族的搭配关系。

### 界面生成提示
```
请使用骆驼队长BI 主题创建数据看板页面：
- 主色：#ff781f（强调/选中/主按钮），浅底 #ffe9d5
- 页面底 #f0f1f5，卡片 #fff、圆角 10px、边框 1px solid #e6ebf5
- 标题 20px/700，正文 14px，表格 12px，表头渐变 #fff5ef→#ffede0
- 控件圆角 8px，输入 40px 高、1px solid #dcdfe6
- 间距：页面 20px，卡片 18/20px，栅格 24 栏栏距 20px
- 阴影：popup 0 2px 12px rgba(0,0,0,.1)，navbar 3px 4px 4px rgba(0,21,41,.08)
- 禁止蓝色 #1890ff 强调，禁止彩色阴影
```