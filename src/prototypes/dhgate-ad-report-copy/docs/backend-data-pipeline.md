# 广告看板 · 后端实现说明

> 面向：后端 / 数据开发
> 对应原型：`src/prototypes/dhgate-ad-report`（页面 id `ad-report`）
> 页面口径见同目录 `.spec/spec.html` 与页面标注；本文只讲取数、落库、聚合和返回结构。

## 0. 结论先行

1. 报表**不实时调平台接口**：两个广告接口的数据由同步任务写入本地库，页面所有统计、排序、分页、下钻都查本地库。
2. 两个接口各自缺一半能力：商品维度有曝光/点击/花费但没有成单词，订单维度有成单词但没有花费。所以**指标以商品维度表为准**，成单词视图只读订单维度表。
3. 页面没有任何维度既不在库里也不可推导的情况；真正的缺口只有「商品名称/主图」一项，用 `itemcode` 关联本地商品库补。
4. 全部派生指标都是**先求和、后相除**，分母为 0 返回 `null`（前端显示 `-`）。

---

## 1. 数据来源接口

| 用途 | 接口 | 文档 |
| --- | --- | --- |
| 商品维度日报 | `dh.seller.ad.prod.report.page` | [敦煌开放平台 · 查询卖家广告消耗的列表（商品维度）](https://open.dhgate.com/docs/api/detail/3d1fc7913f334d0dac5b7d22dd462ef1) |
| 订单维度明细 | `dh.seller.ad.order.report.page` | [敦煌开放平台 · 查询卖家广告消耗的列表（订单维度）](https://open.dhgate.com/docs/api/detail/65a3c844614a4d658a0d96b3dc30d480) |

### 1.1 请求参数（两个接口完全一致）

| 参数 | 类型 | 文档必填 | 说明 | 对应来源 |
| --- | --- | --- | --- | --- |
| `datelineFrom` | string | 是 | 开始日期 `yyyy-MM-dd` | 同步区间的起点 |
| `datelineTo` | string | 是 | 结束日期 `yyyy-MM-dd`，**单次区间不超过 1 个月** | 同步区间的终点 |
| `adType` | string | 是 | `ppc` 手动 / `prodauto` 商品自动 / `shopauto` 全店自动；**传空字符串表示全部** | 页面「广告类型」筛选 |
| `itemcode` | string | 是 | 商品 ID | 见 1.3，**是否可空待联调确认** |
| `page` | int | 是 | 页码，从 1 开始 | 同步任务翻页 |
| `limit` | int | 是 | 每页条数 | 同步任务翻页 |

> 注意：文档把 6 个业务参数（含 `page`、`limit`）全部标成必填（`must=1`，系统参数同样如此），所以「必填」这项本身不区分能否传空值。`adType` 的描述明确写了「空：所有广告」；`itemcode` 没有任何可空说明。

### 1.2 响应字段

**商品维度 `sellerAdProdReportList`**：一行 = 店铺 × 商品 × 广告类型 × 计划 × 广告组 × 日期。

| 字段 | 含义 | 页面用途 |
| --- | --- | --- |
| `nickname` | 卖家昵称（店铺标识） | 店铺列、店铺筛选 |
| `itemcode` | 商品 ID | 商品维度键；关联本地商品库 |
| `adType` | 广告类型 | 广告类型列、筛选 |
| `planName` | 计划名称（**无计划 ID**） | 计划维度键 |
| `groupName` | 广告组名称（**无广告组 ID**） | 计划维度键 |
| `dateline` | 日期 | 时间轴、趋势分组 |
| `imp` | 曝光量 | 曝光列 |
| `click` | 点击量 | 点击列 |
| `usdCost` | 消费（美元） | 花费列 |
| `orders` | 订单数 | 订单列 |
| `gmv` | GMV | GMV 列 / ROAS |

**订单维度 `sellerAdOrderReportList`**：一行 = 店铺 × 一笔订单里的一个商品行。

| 字段 | 含义 | 页面用途 |
| --- | --- | --- |
| `nickname` | 卖家昵称 | 店铺列 |
| `dateline` | 日期 | 最近成单日 |
| `adType` | 广告类型 | 来源广告标签 |
| `planName` | 计划名称 | 溯源参考（成单词视图不展示计划） |
| `itemcode` | **推广商品** ID（被点击的那个） | 与商品视图对齐、抽屉过滤 |
| `product_name` | 推广商品名称 | 兜底商品名 |
| `order_no` | 订单号 | 订单数去重键 |
| `order_itemcode` | **成交商品** ID | 涉及商品数去重键 |
| `order_product_name` | 成交商品名称 | 订单明细展示 |
| `searchword` | 成单词（买家搜索词） | 成单词视图分组键 |
| `gmv` | 该商品行的 GMV | 成单词 GMV |

两个接口都额外返回 `count`（总记录数）和 `pages`（总页数），同步任务据此翻页。

### 1.3 已知能力限制

- 单次查询区间 ≤ 1 个月 → 同步必须按自然月切片。
- 无汇总接口、无排序参数 → 指标一律在本地聚合。
- 无站点/国家字段、无小时粒度 → 不做分站点、分时段报表。
- 计划、广告组**只有名称没有 ID** → 计划维度只能用名称组合做键，同名会合并，改名会断档。
- `itemcode` 是否可空未知 → 直接影响同步调用量，见 §3.2 的两种分支。

---

## 2. 字段缺口：页面要展示但接口没直接给

| 页面上要的 | 接口现状 | 补齐方式 |
| --- | --- | --- |
| 商品名称、主图 | 商品维度只给 `itemcode`；订单维度给 `product_name` / `order_product_name` | 商品视图用 `itemcode` 关联本地商品表取名称与主图；关联不到返回 `name=null`、`image=null`，前端显示「商品 {itemcode}」+ 占位图 |
| 店铺名 | `nickname` 直接给 | 直取；`nickname` 即店铺标识，不做 ID 映射 |
| 计划 / 广告组 | 只有名称，空值表示没有 | 直取；空串统一存 `''`，接口返回 `null`，前端显示 `-` |
| 成单词 | **只有订单维度有** | 成单词视图、抽屉的「带单成单词」只读订单表；商品维度表没有任何成单词信息 |
| 花费、曝光、点击 | **只有商品维度有** | 三视图里的流量/收入列只对商品视图、计划视图提供；成单词视图不返回这些字段 |
| 成单商品 | 订单维度有 `order_itemcode` / `order_product_name` | 直取；`order_product_name` 缺失时回退 `product_name` |
| ROI / 毛利 | 两份数据都没有成本 | 不做 ROI，只做 ROAS（`GMV ÷ 花费`），口径见 §6 |
| 站点 / 国家 / 小时 | 两份数据都没有 | 不支持，不要预留字段 |
| 计划预算、出价、状态 | 两份数据都没有 | 报表只读，不含计划管理能力 |

---

## 3. 存储设计

### 3.1 两张明细表

**`ad_prod_report_daily`（商品维度日报）**

| 列 | 类型 | 空 | 说明 |
| --- | --- | --- | --- |
| `store_nickname` | varchar(128) | 否 | `nickname` |
| `dateline` | date | 否 | `dateline` |
| `itemcode` | varchar(32) | 否 | `itemcode` |
| `ad_type` | varchar(16) | 否 | `ppc` / `prodauto` / `shopauto` |
| `plan_name` | varchar(191) | 否，默认 `''` | `planName`，空串表示没有 |
| `group_name` | varchar(191) | 否，默认 `''` | `groupName`，空串表示没有 |
| `imp` | bigint unsigned | 否，默认 0 | 曝光 |
| `click` | bigint unsigned | 否，默认 0 | 点击 |
| `cost_usd` | decimal(14,2) | 否，默认 0 | `usdCost` |
| `orders` | int unsigned | 否，默认 0 | 订单数 |
| `gmv_usd` | decimal(14,2) | 否，默认 0 | `gmv` |
| `sync_batch_id` | bigint | 否 | 同步批次，便于追溯与回滚 |
| `updated_at` | datetime | 否 | 写入时间 |

- 唯一键：`uk_store_date_item_ad_plan_group (store_nickname, dateline, itemcode, ad_type, plan_name, group_name)`。
  `plan_name` / `group_name` **必须 `NOT NULL DEFAULT ''`**，否则 MySQL 唯一键对 NULL 不生效，会产生重复行。
  若计划名可能很长，可改用 `row_key char(32)`（上述字段拼接后的 MD5）做唯一键，避免索引长度超限。
- 索引：`idx_date(dateline)`、`idx_item(itemcode, dateline)`、`idx_store_date(store_nickname, dateline)`。
- 建议按 `dateline` 做月分区，回补时只影响单分区。

**`ad_order_report_daily`（订单维度明细）**

| 列 | 类型 | 空 | 说明 |
| --- | --- | --- | --- |
| `store_nickname` | varchar(128) | 否 | `nickname` |
| `dateline` | date | 否 | `dateline` |
| `order_no` | varchar(64) | 否 | `order_no` |
| `itemcode` | varchar(32) | 否 | 推广商品 `itemcode` |
| `order_itemcode` | varchar(32) | 否 | 成交商品 `order_itemcode` |
| `ad_type` | varchar(16) | 否 | `adType` |
| `plan_name` | varchar(191) | 否，默认 `''` | `planName` |
| `searchword` | varchar(255) | 否，默认 `''` | `searchword`，空串表示无搜索词 |
| `product_name` | varchar(512) | 是 | 推广商品名 |
| `order_product_name` | varchar(512) | 是 | 成交商品名 |
| `gmv_usd` | decimal(14,2) | 否，默认 0 | 该商品行的 `gmv` |
| `sync_batch_id` | bigint | 否 | 同步批次 |
| `updated_at` | datetime | 否 | 写入时间 |

- 唯一键：`(store_nickname, order_no, order_itemcode)`。
  **待联调确认**：同一订单同一商品是否可能出现多行（拆单、多行明细）。若可能，需要追加行号或对整行做 `row_key` 去重，否则会互相覆盖。
- 索引：`idx_date(dateline)`、`idx_word(searchword(64), dateline)`、`idx_item(itemcode, dateline)`。

### 3.2 幂等写入

- 以「店铺 + 日期」为最小重跑单元：写入前 `DELETE FROM ... WHERE store_nickname=? AND dateline IN (...)`，再批量插入；或使用 `INSERT ... ON DUPLICATE KEY UPDATE`。
- 每批生成 `sync_batch_id`，写入完成后再更新批次状态为成功；失败可整批回滚或按日期重跑。
- 回补与首次同步走同一条写入路径，保证重复执行结果一致。

---

## 4. 同步任务

### 4.1 切片与翻页

1. 按自然月切片：`2026-08-19 ~ 2026-08-31`、`2026-09-01 ~ 2026-09-30`、`2026-10-01 ~ 2026-10-19`，每片都满足「≤ 1 个月」。
2. 每片内按 `page=1..pages` 翻完，`limit` 建议 100~200（接口上限待确认）。
3. 翻页以响应里的 `pages` 为准；遇到空页即停止，防止 `count` 与实际不一致造成死循环。

### 4.2 `itemcode` 的两种情形

**情形 A：`itemcode` 可传空（拿到全部商品）**

- 每片调用量 = 页数。以 12 个商品、3 条投放、30 天、`limit=200` 为例：约 1,500 行 → 8 页 → 两个接口合计约 16 次/全量。

**情形 B：`itemcode` 必须逐个传**

- 每片调用量 = 商品数 × 每商品页数。
- 500 个在投商品、每个商品每月 1 页：单次全量 ≈ 500 次 × 2 个接口 = 1,000 次。
- 每日增量若也按商品循环，同样是每天上千次请求，必须：限流（串行 + 间隔）、失败重试（指数退避）、**只同步近 N 天有曝光或花费的 itemcode**（可用商品维度表自身去重得到该清单，或读取本地商品表的在售标记）。

> 结论：这一项联调结论不同，同步任务的架构会差一个数量级，必须先确认再实现。

### 4.3 更新节奏

- 每日 T+1 同步昨天（`D-1`）。
- 同步昨天时**顺带回补最近 7 天**（`D-7 ~ D-1`），覆盖归因延迟导致的 GMV / 订单回刷；回补区间与日常增量共用幂等写入。
- 首次上线做一次历史回填（当前演示数据范围 `2026-08-19 ~ 2026-10-19`，共 62 天）。

### 4.4 批次与失败处理

建议增加 `ad_sync_batch` 表：`batch_id / api / date_from / date_to / status / total_pages / last_page / rows_written / error_msg / started_at / finished_at`。

- 单页失败重试 3 次，仍失败则整批标记失败并记录 `last_page`，下一轮从断点续跑。
- 同步状态不阻塞页面查询：页面只读已落库的数据，同步失败不影响历史数据展示。

---

## 5. 指标运算规则

### 5.1 原始量（全部来自商品维度表，直接求和）

| 指标 | 表达式 |
| --- | --- |
| 广告花费 | `SUM(cost_usd)` |
| 广告 GMV | `SUM(gmv_usd)` |
| 订单数 | `SUM(orders)` |
| 曝光量 | `SUM(imp)` |
| 点击量 | `SUM(click)` |

### 5.2 派生指标（先求和、后相除）

| 指标 | 公式 | 分母为 0 |
| --- | --- | --- |
| 点击率 CTR | `SUM(click) / SUM(imp)` | 返回 `null` |
| 点击单价 CPC | `SUM(cost_usd) / SUM(click)` | 返回 `null` |
| 转化率 CVR | `SUM(orders) / SUM(click)` | 返回 `null` |
| 单均花费 CPA | `SUM(cost_usd) / SUM(orders)` | 返回 `null` |
| 客单价 AOV | `SUM(gmv_usd) / SUM(orders)` | 返回 `null` |
| ROAS | `SUM(gmv_usd) / SUM(cost_usd)` | 返回 `null`（花费为 0 时不返回 0） |

**不要**对每行的比率求平均——这是这类报表最常见的口径错误。

### 5.3 环比

- `prev_range` = 与当前区间**等长且紧邻**的前一段（例如 10/13~10/19 对比 10/06~10/12）。
- `delta = (当前值 − 上期值) / 上期值`；上期值为 0 时返回 `null`，前端显示 `-` 而不是 `-100%`。
- 上期区间如果早于本地库最早数据日，同样返回 `null`。
- 指标卡与表格里出现的每个指标（原始量和派生指标都算）都要返回 `value / prev / delta` 三个值，前端直接消费。

### 5.4 异常标记

| 标记 | 判定 | 用途 |
| --- | --- | --- |
| `low_roas` | `cost_usd > 0 AND orders > 0 AND roas < 1` | 商品行 / 计划行的 ROAS 数字标红 |
| `zero_conv` | `cost_usd > 0 AND orders = 0` | 商品名后打「零转化」标签；此类行不再重复标红 |

### 5.5 数值精度

- 金额入库与返回统一 `decimal(14,2)`，单位 USD；**不要用 float 累加**。
- 比率以小数返回（如 `0.0243`），保留 6 位；百分比与 `x` 后缀由前端格式化。
- 没有值的字段统一返回 `null`，不要返回 `0`、`""` 或 `"NaN"`。

---

## 6. 多维查询

### 6.1 三个视图的维度与来源

| 视图 | 维度键 | 来源表 | 分组字段 |
| --- | --- | --- | --- |
| 商品视图 | 店铺 + 商品 | `ad_prod_report_daily` | `store_nickname, itemcode` |
| 计划视图 | 店铺 + 广告类型 + 计划 + 广告组 | `ad_prod_report_daily` | `store_nickname, ad_type, plan_name, group_name` |
| 成单词视图 | 店铺 + 成单词 | `ad_order_report_daily` | `store_nickname, searchword` |

补充规则：

- 商品视图把同一商品的所有广告类型合并成一行，`adTypes` 返回去重后的类型数组供前端打标签。
- 计划视图里 `shopauto` 的 `plan_name`、`group_name` 都为空，`prodauto` 只有 `plan_name`，前端渲染 `-`；后端按空串分组即可，不要过滤掉这些行。
- 成单词视图按 `searchword` 分组，空串单独成一组（前端显示「无搜索词（自动广告）」）。

### 6.2 过滤条件

三个筛选条件都作用在本地表的列上：

| 页面筛选 | 列 | 取值 |
| --- | --- | --- |
| 店铺 | `store_nickname` | 具体昵称 / 不传表示全部 |
| 广告类型 | `ad_type` | `ppc` / `prodauto` / `shopauto` / 不传表示全部 |
| 日期 | `dateline` | `BETWEEN :from AND :to` |

页面没有单商品筛选，商品维度不需要 `itemcode` 过滤条件（抽屉除外，见 §6.4）。日期区间上限 31 天，与接口限制一致。

### 6.3 查询示例

**指标卡（当前区间 + 上期区间各跑一次）**

```sql
SELECT SUM(imp) AS imp, SUM(click) AS click, SUM(cost_usd) AS cost,
       SUM(orders) AS orders, SUM(gmv_usd) AS gmv
FROM ad_prod_report_daily
WHERE dateline BETWEEN :from AND :to
  /* AND store_nickname = :store */
  /* AND ad_type = :adType */;
```

**趋势（按天，缺失日期后端补齐）**

```sql
SELECT dateline, SUM(imp) imp, SUM(click) click, SUM(cost_usd) cost,
       SUM(orders) orders, SUM(gmv_usd) gmv
FROM ad_prod_report_daily
WHERE dateline BETWEEN :from AND :to
  /* 同上两个可选条件 */
GROUP BY dateline
ORDER BY dateline;
```

区间内没有投放的日期要补成 0（后端用日期序列 `LEFT JOIN` 结果集），保证前端能画出断档。

**商品视图列表 + 合计**

```sql
-- 列表
SELECT store_nickname, itemcode,
       SUM(imp) imp, SUM(click) click, SUM(cost_usd) cost,
       SUM(orders) orders, SUM(gmv_usd) gmv,
       GROUP_CONCAT(DISTINCT ad_type) ad_types
FROM ad_prod_report_daily
WHERE dateline BETWEEN :from AND :to /* 其它筛选 */
GROUP BY store_nickname, itemcode
ORDER BY cost DESC          -- 排序字段走白名单
LIMIT :offset, :size;

-- 合计（不带 GROUP BY，与分页无关，单独执行）
SELECT SUM(imp) imp, SUM(click) click, SUM(cost_usd) cost,
       SUM(orders) orders, SUM(gmv_usd) gmv
FROM ad_prod_report_daily
WHERE dateline BETWEEN :from AND :to /* 其它筛选 */;
```

**计划视图**

```sql
SELECT store_nickname, ad_type, plan_name, group_name,
       SUM(imp) imp, SUM(click) click, SUM(cost_usd) cost,
       SUM(orders) orders, SUM(gmv_usd) gmv
FROM ad_prod_report_daily
WHERE dateline BETWEEN :from AND :to /* 其它筛选 */
GROUP BY store_nickname, ad_type, plan_name, group_name
ORDER BY cost DESC
LIMIT :offset, :size;
```

**成单词视图 + 合计**

```sql
-- 列表
SELECT store_nickname, searchword,
       COUNT(DISTINCT order_no)        AS order_count,
       SUM(gmv_usd)                    AS gmv,
       COUNT(DISTINCT order_itemcode)  AS item_count,
       MAX(dateline)                   AS last_date
FROM ad_order_report_daily
WHERE dateline BETWEEN :from AND :to /* 其它筛选 */
GROUP BY store_nickname, searchword
ORDER BY gmv DESC
LIMIT :offset, :size;

-- 合计：必须跨分组去重，不能把各行的订单数相加
SELECT COUNT(DISTINCT order_no) order_count,
       SUM(gmv_usd) gmv,
       COUNT(DISTINCT order_itemcode) item_count
FROM ad_order_report_daily
WHERE dateline BETWEEN :from AND :to /* 其它筛选 */;
```

> 合计行的坑：商品视图 / 计划视图的行之间互斥，直接相加即可；成单词视图的订单可能同时属于两个词（同一订单买了两个商品、来自不同的词），所以**必须用 `DISTINCT` 重新聚合**。

**成单词展开的订单明细**

```sql
SELECT order_no, dateline,
       GROUP_CONCAT(CONCAT(order_product_name, ' ×1') ORDER BY gmv_usd DESC) items,
       SUM(gmv_usd) amount
FROM ad_order_report_daily
WHERE dateline BETWEEN :from AND :to
  AND store_nickname = :store AND searchword = :word
GROUP BY order_no, dateline
ORDER BY amount DESC
LIMIT 6;
```

前端只展示金额最高的 6 笔，接口直接按 `amount DESC` 截断并返回总量，避免前端误以为只有 6 单。

### 6.4 商品抽屉（下钻）

三段内容都限定「当前商品 + 当前筛选区间」，数据来自两张表：

| 区块 | 来源 | 查询口径 |
| --- | --- | --- |
| 顶部 4 个指标 | `ad_prod_report_daily` | `WHERE store_nickname=? AND itemcode=?`，按 §5 求和后再算比率 |
| 按天走势 | `ad_prod_report_daily` | 同上，`GROUP BY dateline`，补 0 |
| 按计划拆分 | `ad_prod_report_daily` | 同上，`GROUP BY ad_type, plan_name, group_name` |
| 带单成单词 | `ad_order_report_daily` | `WHERE store_nickname=? AND itemcode=?`（**推广商品**），`GROUP BY searchword`，按 GMV 降序取前 6 |

> 注意区分两个商品字段：抽屉过滤用 `itemcode`（推广商品），与商品视图口径一致；`order_itemcode` 是成交商品，可能不是当前商品（跨商品成交），只用于「涉及商品数」统计。

### 6.5 排序与分页

- 商品视图、计划视图默认 `cost DESC`；成单词视图默认 `gmv DESC`。
- 前端可以点击任意指标列切换升降序，后端需要维护**排序字段白名单**（`imp/click/ctr/cpc/orders/cvr/cpa/cost/gmv/roas/order_count/item_count`），不接受任意列名。
- 分页在本地库完成：先 `COUNT(*)` 拿 `total`，再 `LIMIT/OFFSET` 取当页；合计行单独聚合一次，不受分页影响。
- 比率类字段排序需要按「分子分母」排（例如按 ROAS 排 = `SUM(gmv)/SUM(cost)`），不能对已算好的比率再排序。

---

## 7. 建议的接口契约

字段命名统一：金额加 `_usd` 后缀；比率用小数；无值返回 `null`。

**`GET /api/ad-report/summary`**（指标卡 + 趋势）

```json
{
  "range": { "from": "2026-10-13", "to": "2026-10-19" },
  "prevRange": { "from": "2026-10-06", "to": "2026-10-12" },
  "kpis": [
    { "key": "cost", "value": 876.38, "prev": 798.37, "delta": 0.0977 },
    { "key": "gmv", "value": 2946.12, "prev": 3329.99, "delta": -0.1153 },
    { "key": "roas", "value": 3.3612, "prev": 4.1710, "delta": -0.1941 }
  ],
  "trend": [
    { "date": "2026-10-13", "imp": 15537, "click": 372, "cost": 122.4, "orders": 7, "gmv": 410.2, "roas": 3.35 }
  ]
}
```

**`GET /api/ad-report/list`**（三视图通用）

```json
{
  "view": "item",
  "page": 1,
  "pageSize": 10,
  "total": 12,
  "totals": { "imp": 109669, "click": 2649, "cost": 876.38, "orders": 58, "gmv": 2946.12, "roas": 3.3612 },
  "rows": [
    {
      "store": "CamelCaptain 箱包店",
      "itemcode": "204817563224",
      "name": "真皮厚底小白鞋 百搭板鞋",
      "image": "https://.../p6.png",
      "adTypes": ["ppc", "prodauto"],
      "imp": 10376, "click": 249, "ctr": 0.024,
      "cpc": 0.64, "orders": 4, "cvr": 0.0161, "cpa": 40.03,
      "cost": 160.11, "gmv": 98.69, "roas": 0.6164,
      "lowRoas": true,
      "zeroConv": false
    }
  ]
}
```

- `view=plan` 时行字段换成 `store / adType / planName / groupName`；`view=word` 时换成 `store / word / adTypes / orderCount / gmv / itemCount / lastDate`。
- `adTypes`、`lowRoas`、`zeroConv` 建议由后端计算好，前端只负责渲染。

---

## 8. 待确认清单

| # | 问题 | 影响 |
| --- | --- | --- |
| 1 | `itemcode` 能否传空、传空是否返回全部商品 | 决定同步调用量差一个数量级（§4.2） |
| 2 | `limit` 上限、接口 QPS/并发限制 | 决定切片粒度与限流策略 |
| 3 | 同一订单同一 `order_itemcode` 是否可能多行 | 决定订单表唯一键，见 §3.1 |
| 4 | 数据 T+1 的具体更新时点、归因窗口长度 | 决定回补天数（当前按 7 天） |
| 5 | `gmv` 的币种是否恒为 USD | 决定是否需要汇率换算 |
| 6 | 多店铺是否共用同一个 `access_token`，`nickname` 是否唯一 | 决定店铺维度与鉴权方式 |
| 7 | 计划改名后历史数据是否会被平台回刷 | 决定计划维度是否需要用「名称快照 + 生效日期」 |

---

## 9. 与页面口径的对照（避免前后端各写一套）

- 页面所有空值显示 `-`，对应接口返回 `null`。
- 合计行统计的是当前筛选的全部结果，与分页无关（§6.3）。
- 成单词展开只展示金额最高的 6 笔订单，接口返回总量供前端提示「仅展示 6 笔」。
- 页面不展示成单词的花费/点击/ROAS —— 订单数据里没有这些字段，不是缺失。
- 报表只提供 ROAS，不提供 ROI：两份数据都没有成本与毛利字段。
