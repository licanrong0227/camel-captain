# 骆驼队长 ERP 全站原型 · 维护说明

## 核心原则

页面视觉以线上 ERP 真实 DOM/CSS 为准，不再按设计规范自行重绘。当前实现是“线上快照 + 交互运行时”：

```text
data/live/<page>.json     每页 #app.outerHTML、bodyClass、标题；含 page2Html/page3Html 分页快照
data/live/dialogs/*.json  100 个懒加载弹窗（trigger/title/kind/html）
data/live/assets/*        首页图表、商品排行等截图补图
legacy/css/*.css          线上原始 CSS 文件（含 dashboard 的 chunk-4e73e3b9）
legacy/fonts/*            线上 Element UI / remixicon 图标字体
index.tsx                 快照路由、导航、行操作、批量栏、真实弹窗
style.css                 引入线上 CSS + :root 主题变量
.spec/spec.html           主规格与当前边界
```

旧的 `pages/`、`components/ui/` 等 React 页面是早期自绘版本，入口已不再引用，只保留作交互参考；不要用它们判断视觉。

## 页面切换

- 39 页通过 `#page=<id>` 切换，页面内容是 `data/live/<id>.json` 的 `appHtml`。除可见菜单外，已补入分发中心、账号配置、帮助中心后台，以及个人中心会员中心/订单中心/分销中心。
- 每页渲染时会把 `bodyClass` 写回 `document.body`。
- 首页是登录后的 `/dashboard` 工作台，不是 `/home` 营销落地页。
- 顶部导航、弧形页签、`<a href="/...">` 会映射到对应 pageId。
- Make 左侧页面树按模块列出 39 页。个人中心左侧菜单会跳到对应子页。
- 分页：点击 `.el-pager li.number` / `.btn-prev` / `.btn-next` 时，从 `page2Html` / `page3Html` 切换整页快照；未抓取的页码会提示。当前 10 个页面有第 2/3 页快照。
- 首页的 ECharts 图表与商品排行图片无法从 DOM 序列化，使用 `data/live/assets/` 下的线上截图区域补回。
- 顶栏 hover：克隆对应 `.top-nav-submenu` 到 body，固定 `top:50px`、`left` 对齐导航项、宽 500px；鼠标进入浮层保持、离开 180ms 关闭；点击三级项按标题映射 pageId 并关闭。
- SVG sprite：`data/live/assets/icon-sprite.svg`（131 个 symbol）在入口注入 body，导航/按钮/表格的 `<use href="#icon-...">` 才能显示。

## 主题与表单回显

- 线上主题变量写在 `<html>` 内联样式里，快照不包含 `<html>`；已在 `style.css` 的 `:root` 还原 `--menu-bg`、`--primary-color`、表头渐变、表格字号等。
- Vue 运行时写入的 input value 不会出现在 `outerHTML` 中：
  - 下拉框选中值：渲染后从 `.el-select-dropdown__item.selected` 回填。
  - 个人中心资料：`VALUE_FIXES` 按 placeholder 回填。
- 新增类似回显时，在 `VALUE_FIXES` 增加 `{ selector, value }`，不要改快照 HTML。

## 交互运行时

在 `index.tsx` 中维护：

- `rowActionRowHtml`：每页直接保存线上展开行的完整 `<tr>` HTML（9 个有行操作的页面），点击行时克隆插入，保证 colspan、图标、按钮样式与线上一致。
- `ROW_ACTIONS`：没有快照展开行时的兜底文案配置。
- `BATCH_ACTIONS`：勾选后填充 `.table-footer__actions`（我的商品/认领中心）；我的订单保留线上已有批量按钮，勾选后解除 `disabled` 并只更新「已选 N 项」，不覆盖按钮。
- 批量按钮点击优先打开 `data/live/dialogs` 中 context=batch 的真实弹窗（批量编辑/更新发布/标签/AI 克隆/删除确认/批处理申报等）。
- `DIALOG_ALIASES`：页面按钮文案 → 快照中真实弹窗标题。已接入同步线上、统一导出、导入产品/货源、批量查找、新增上新价配置、新增自动打标规则、店铺分组、修改汇率等。
- `VALUE_FIXES`：表单值回显。
- 弹窗优先打开快照内隐藏的 `.el-dialog__wrapper`；快照里只有关闭态空壳时自动跳过，再从 `data/live/dialogs/` 按 trigger 找已抓取的懒加载弹窗（编辑产品、认领商品、订单详情、物流商对接申请、处罚通知、筛选状态设置、公告、同步线上、线路审核、修改部门/店铺/角色/子账号/账号、删除确认、安装插件、修改头像、算力明细等 100 个）。
- 编辑产品弹窗 `variants` 保存 18 个状态（基本/详情/日志 + 15 个模块），自动编辑 13 个模块，创建产品 17 个状态；点击顶部页签或左侧模块替换为对应真实弹窗 HTML。
- 弹窗统一加遮罩显示；遮罩/×/取消/关闭/Esc 关闭；确定/保存/提交/发布只提示“演示环境不会提交”。
- 首页“设置”等文字型入口、采集页“下载安装浏览器插件”、个人中心头像也已接入弹窗。
- 筛选下拉：点击 `.el-select` 时把隐藏的 `.el-select-dropdown` 以 fixed 定位展开，选中项回填输入框；`重置` 清空条件并恢复所有表格行；`搜索` 按文本关键词 + 已选筛选项隐藏不匹配行。
- 日期范围：点击 `.el-date-editor` 打开 `data/live/assets/date-range-panel.html`（线上 range picker），点两次日期回填开始/结束。
- 通用控件：勾选同步 Element 样式、表头全选、开关/单选切换、Element 页签 pane 切换、树节点选中/展开、按钮下拉菜单、每页条数下拉、表头排序。
- 商品采集：链接采集 / 店铺采集 / 收藏夹采集 / 采集记录 四个自定义子页签可切换，收藏夹与采集记录使用线上抓取表格，表格页签隐藏「下载安装浏览器插件」。
- 认领自动编辑：店铺卡片多选/全选、计数、按钮启用；12 个模块切换；标题处理方式支持多选、顺序卡片、AI/采集源与首字母大写互斥、卡片关闭；模板选择、创建/管理模板、数字步进、单选/复选框、关闭按钮均已接入。
- 页面动作：搜索/重置/排序、平台与状态筛选、清空、下载模板、导出、推广链接、服务商配置页签、账号配置跳转、删除/作废/禁用确认、同步/出库/入库/付款/打印等均改为本地状态或文件下载反馈，不再弹通用「演示」提示；涉及提交到平台的按钮仍不调用线上接口。
- 站内信：分类 tab 过滤、标记已读、点击消息展示右侧详情（模板 `data/live/assets/message-detail.html`）。
- 店铺看板：单店/店群、门店、周期、成交/下单/流量/潜在页签切换，均使用对应抓取状态。

## 物流商与出入库

- 物流商管理没有新增按钮，入口是「物流商对接申请」；点击打开线上申请弹窗。
- 出入库管理是条码作业台：
  - setup：条码类型、类型（入库/出库）、入库方式（自动/手动）、开始作业。
  - 选择出库时隐藏入库方式；开始作业按类型切换到扫码入库或扫码出库快照。
  - 扫码页支持返回 setup、1/2/3 页分页；扫描按钮只提示不提交。
- 相关快照字段在 `data/live/procurement-inbound-outbound.json`：`appHtml`、`inboundScanHtml`、`outboundScanHtml`、`*ScanPage2Html`、`*ScanPage3Html`。

## 重新抓取线上快照

需要有效的线上登录态（内置浏览器打开 test.kuachengjing.com）：

```bash
# 1. 从内置浏览器把 cookie/token/device_id 写入本地 sink（4599）
# 2. 抓取页面 HTML + 截图（可见 33 页；隐藏页/个人中心子页另行抓取）
cd temp/shop-sign && node live-capture.cjs
# 3. 提取 #app 到 data/live
cd ../.. && node .tmp/extract-live.cjs
```

抓取脚本会保存到 `.tmp/live/<page>/page.html` 和 `viewport.png`；提取脚本只保留 `#app`，不保留脚本。

## 当前边界

- 筛选/日期/搜索只处理已抓取的当前快照行，不会重新请求全量数据；每页条数只更新显示并提示；表头排序只重排当前页行。
- 分页只覆盖已抓取第 2/3 页的 10 个页面；其余页面多为单页数据。
- 100 个弹窗覆盖主要入口；物流商入口是对接申请（已接入），出入库是页面内两阶段作业流（已接入）。
- 首页图表与商品排行以截图补回，周期单选只切换激活态；其他页面首屏外的图表仍为静态快照。
- 即时咨询线上账号暂无会话数据，保持空态，不模拟发送。
- 行操作只对已确认文案的页面接入，未确认页面保留展开列但暂无动作条。
- 不连接线上接口，所有提交类按钮不落库。

## 验收

```bash
npm run typecheck
node scripts/check-app-ready.mjs /prototypes/camel-captain-erp-console
```

`check-app-ready` 在本机有已知 spawn EINVAL；替代验证：Playwright 打开 39 个 `#page=`，检查 console/pageerror；与 `.tmp/live/<page>/viewport.png` 逐页对照；验证我的商品行操作、批量栏、真实弹窗、弹窗内页签/模块切换。
