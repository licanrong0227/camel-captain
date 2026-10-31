# 广告看板（链接产出）· 后端实现说明

> 面向：后端 / 数据开发
> 对应原型：`src/prototypes/ad-link-board`（页面 id `ad-board`）
> 页面口径见同目录 `.spec/spec.html` 与页面标注；本文讲取数、落库、聚合和返回结构。

## 0. 结论先行

1. 报表的三个数字来自三个不同的系统：**广告消耗/广告 GMV** 来自敦煌广告接口，**整店 GMV** 来自店铺经营数据，**链接产出 GMV** 来自订单商品行。页面做的就是把这三次取数按「店铺 + 商品 ID」对齐。
2. 唯一的关联键是敦煌商品 ID：广告 `itemcode` = 订单 `orderProducts[].itemCode`。
3. 广告是 T+1，订单和店铺数据更快。**报表统一按广告截止日收口**，否则会出现「今天有 GMV、没有广告消耗」，把占比和 ROAS 拉成假象。
4. 页面不出现计划、关键词、曝光点击等平台已有维度。

---

## 1. 数据来源

**店群 / 店铺汇总** —— `GET /api/v1/report/store/dashboard-list`
一次返回店铺列表、每家店的周期指标（`wis`）和按天历史（`list[].history`）。

**单店按天明细** —— `GET /api/v1/report/store/wis-core-info?storeId={id}&periodType=DAY&site=TOTAL&countryId=TOTAL`
与 `wis` 同构，带 `statDate`，用于店铺维度的趋势。

**订单商品行** —— `GET /api/v1/order/list`
每个订单带 `orderProducts[]`，是链接产出 GMV 的唯一来源。

**广告数据** —— 敦煌 `dh.seller.ad.prod.report.page`
商品维度日报，含 `usdCost` / `gmv` / `orders`。

### 1.1 用到的字段

**店铺经营（`wis` / `wis-core-info`）**

| 字段 | 含义 | 本报表用途 |
| --- | --- | --- |
| `confirmGmv` | 成交金额 | 整店 GMV |
| `startedGmv` | 下单金额 | 预留，暂不展示 |
| `confirmRfxNum` | 成交订单数 | 预留 |
| `confirmBuyerNum` | 成交买家数 | 预留 |
| `dealTransRate` | 成交转化率 | 预留 |
| `unitPrice` | 客单价 | 预留 |
| `pdUv` / `expoPv` | 访客数 / 搜索曝光 | 预留 |

> 本期只消费 `confirmGmv`；其余字段先落库，后续做流量分析时可直接用。

**订单（`order.list`）**

| 字段 | 含义 | 用途 |
| --- | --- | --- |
| `order.orderProducts[].itemCode` | 敦煌商品 ID | 关联键 |
| `order.orderProducts[].itemName` | 商品名称 | 链接名称 |
| `order.orderProducts[].imgUrl` | 主图 | 链接主图 |
| `order.orderProducts[].categoryName` | 类目 | 类目列 |
| `order.orderProducts[].quantity` / `price` | 数量 / 单价 | 产出 GMV = `price × quantity` |
| `order.payDate` | 支付时间 | 归属日期 |

**广告（`dh.seller.ad.prod.report.page`）**

`nickname`（店铺）、`itemcode`（商品）、`adType`、`dateline`、`usdCost`、`gmv`、`orders`。

---

## 2. 存储设计

### 2.1 四张表

**`store_daily`（店铺日经营）** ← `wis-core-info`

| 列 | 类型 | 说明 |
| --- | --- | --- |
| `store_id` | bigint | 店铺 ID |
| `stat_date` | date | 统计日 |
| `confirm_gmv` | decimal(14,2) | 成交金额 |
| `started_gmv` | decimal(14,2) | 下单金额 |
| `confirm_orders` | int | 成交订单数 |
| `confirm_buyers` | int | 成交买家数 |
| `deal_trans_rate` | decimal(8,6) | 成交转化率 |
| `unit_price` | decimal(12,2) | 客单价 |
| `pd_uv` / `expo_pv` | int | 访客 / 曝光 |
| `sync_batch_id` | bigint | 批次 |

唯一键：`(store_id, stat_date)`。

**`order_item_daily`（订单商品行）** ← `order.list`

| 列 | 类型 | 说明 |
| --- | --- | --- |
| `store_id` | bigint | 店铺 |
| `stat_date` | date | `payDate` 的日期部分 |
| `order_no` | varchar(64) | 平台订单号 |
| `item_code` | varchar(32) | 敦煌商品 ID |
| `item_name` | varchar(512) | 商品名 |
| `img_url` | varchar(512) | 主图 |
| `category_name` | varchar(191) | 类目 |
| `quantity` | int | 数量 |
| `price` | decimal(12,2) | 单价（USD） |
| `gmv` | decimal(14,2) | `price × quantity` |

唯一键：`(store_id, order_no, item_code, sku_code)`（同一订单同一商品可能有多 SKU，需确认是否再加行号）。
索引：`idx_date(stat_date)`、`idx_item(store_id, item_code, stat_date)`。

**`ad_daily`（广告日报）** ← 敦煌广告接口

| 列 | 类型 | 说明 |
| --- | --- | --- |
| `store_name` | varchar(128) | `nickname`（店铺名） |
| `store_id` | bigint | 同步时用店铺名映射到店铺 ID |
| `item_code` | varchar(32) | `itemcode` |
| `ad_type` | varchar(16) | `ppc / prodauto / shopauto` |
| `dateline` | date | 统计日 |
| `cost_usd` | decimal(14,2) | `usdCost` |
| `ad_gmv` | decimal(14,2) | `gmv` |
| `ad_orders` | int | `orders` |

唯一键：`(store_name, dateline, item_code, ad_type)`（接口没有计划 ID，按类型聚合即可）。
索引：`idx_date(dateline)`、`idx_item(store_id, item_code, dateline)`。

**`product_dim`（可选的商品维表）** ← `GET /api/v1/products`

用于补类目、主图的兜底。**注意**：`products.spu`（如 `20261027001583`）与敦煌 `itemCode`（如 `1106527389`）不是同一套编码，二者的映射关系待确认；当前报表的商品名/图/类目一律取订单行，不依赖这张表。

### 2.2 幂等写入

- 以「店铺 + 日期」为最小重跑单元：先删后插，或 `INSERT ... ON DUPLICATE KEY UPDATE`。
- 每批写 `sync_batch_id`，失败可整批回滚并按日期重跑；回补与首次同步走同一路径。

### 2.3 补单剔除相关表

**`order_item_daily.order_labels`**：订单上打的标签（JSON 数组或逗号分隔），来源是订单的 `labels`，同步订单时一并落库。

**`store_exclusion_label`（店铺剔除标签）**

| 列 | 类型 | 说明 |
| --- | --- | --- |
| `store_id` | bigint | 店铺 |
| `label_id` | varchar(64) | 系统订单标签 ID（来自 `order-label/list`） |
| `created_by` / `created_at` | — | 审计字段 |

一个店铺可勾选多个标签；订单命中任一已选标签即剔除。没有勾选表示不按标签剔除。

**`store_exclusion_rule`（店铺剔除规则）**

| 列 | 类型 | 说明 |
| --- | --- | --- |
| `store_id` | bigint | 店铺 |
| `manual_amount` | decimal(14,2) | 该店铺的手动扣减金额 |
| `updated_by` / `updated_at` | — | 谁在什么时候改的 |

**`store_exclusion_order`（手动指定订单）**

| 列 | 类型 | 说明 |
| --- | --- | --- |
| `store_id` | bigint | 店铺 |
| `order_no` | varchar(64) | 手动剔除的订单号 |
| `created_by` / `created_at` | — | 审计字段 |

> 规则按店铺维度生效，不按时间：改一次规则，历史区间一并按新规则重算。手动扣减金额只作用于整店 GMV，不拆分到链接。

---

## 3. 同步任务

### 3.1 三条同步链路

| 链路 | 频率 | 说明 |
| --- | --- | --- |
| 广告 | 每天 T+1 | 按自然月切片（单次 ≤31 天）+ 分页翻完；回补最近 7 天覆盖归因回刷 |
| 店铺经营 | 每天（可多次） | 按天拉 `wis-core-info`，覆盖当天 |
| 订单 | 每天（可多次） | 拉当天订单，取 `orderProducts` 落 `order_item_daily` |

### 3.2 广告接口的两种情形

- 若 `itemcode` 可传空：调用量 = 切片数 × 页数。
- 若必须逐个传：调用量 = 商品数 × 切片数 × 页数，需要限流、重试，并只同步近期有投放的商品。
- 该结论未确认前，同步任务先按「不传 itemcode」实现并保留降级开关。

### 3.3 截止日对齐

`report_to = min(广告数据截止日, 订单/店铺数据截止日)`。广告 T+1，所以实际就是广告截止日。页面顶部的说明行要展示三个日期：广告截止、订单截止、报表统一截止。

---

## 4. 指标口径与查询

### 4.1 口径

| 指标 | 表达式 |
| --- | --- |
| 广告消耗 | `SUM(ad_daily.cost_usd)` |
| 广告 GMV | `SUM(ad_daily.ad_gmv)` |
| 整店 GMV | `SUM(store_daily.confirm_gmv)` |
| 链接产出 GMV | `SUM(order_item_daily.gmv)` |
| 广告 GMV 占比（店铺/店群） | 广告 GMV ÷ 整店 GMV |
| 广告 GMV 占比（链接） | 广告 GMV ÷ 链接产出 GMV |
| ROAS | 广告 GMV ÷ 广告消耗 |
| 环比 | 与等长紧邻前一段比较；占比用百分点差，其余用相对变化 |

分母为 0 或上期无数据 → 返回 `null`，前端显示 `-`。

### 4.2 店群汇总

```sql
-- 店铺表：一行一家店
SELECT s.store_id, s.store_name,
       SUM(a.cost_usd) AS ad_cost,
       SUM(a.ad_gmv)   AS ad_gmv,
       SUM(d.confirm_gmv) AS store_gmv
FROM store_daily d
LEFT JOIN (SELECT store_id, SUM(cost_usd) cost_usd, SUM(ad_gmv) ad_gmv
           FROM ad_daily WHERE dateline BETWEEN :from AND :to
           GROUP BY store_id) a ON a.store_id = d.store_id
WHERE d.stat_date BETWEEN :from AND :to
GROUP BY s.store_id, s.store_name;
```

合计行：把上面结果的 `ad_cost / ad_gmv / store_gmv` 直接相加后重算占比与 ROAS，不要对各行的比率求平均。

### 4.3 单店链接表

链接全集 = 该店铺的订单出现过的链接 ∪ 广告出现过的链接。这样「有产出没投放」和「有投放没产出」的链接都能看到。

```sql
SELECT COALESCE(o.item_code, a.item_code) AS item_code,
       MAX(o.item_name)   AS item_name,
       MAX(o.img_url)     AS img_url,
       MAX(o.category_name) AS category_name,
       SUM(a.cost_usd)    AS ad_cost,
       SUM(a.ad_gmv)      AS ad_gmv,
       SUM(o.gmv)         AS link_gmv
FROM (
  SELECT item_code, SUM(gmv) gmv, MAX(item_name) item_name, MAX(img_url) img_url, MAX(category_name) category_name
  FROM order_item_daily
  WHERE store_id = :storeId AND stat_date BETWEEN :from AND :to
  GROUP BY item_code
) o
FULL OUTER JOIN (
  SELECT item_code, SUM(cost_usd) cost_usd, SUM(ad_gmv) ad_gmv
  FROM ad_daily
  WHERE store_id = :storeId AND dateline BETWEEN :from AND :to
  GROUP BY item_code
) a ON a.item_code = o.item_code
GROUP BY COALESCE(o.item_code, a.item_code);
```

排序（白名单）：`link_gmv / ad_cost / ad_gmv / ad_ratio / roas`，默认 `link_gmv DESC`；分页 `LIMIT/OFFSET`，合计另行聚合。

### 4.4 趋势

```sql
-- 广告消耗：按天
SELECT dateline AS day, SUM(cost_usd) ad_cost, SUM(ad_gmv) ad_gmv
FROM ad_daily WHERE dateline BETWEEN :from AND :to /* 店铺 / 类型条件 */ GROUP BY dateline;

-- 整店 GMV：按天
SELECT stat_date AS day, SUM(confirm_gmv) store_gmv
FROM store_daily WHERE stat_date BETWEEN :from AND :to AND store_id = :storeId GROUP BY stat_date;
```

后端用日期序列左连接补齐，没数据的日期补 0。

### 4.5 链接详情

| 区块 | 查询 |
| --- | --- |
| 四个数 | 同 4.3，限定 `item_code` 与 `store_id` |
| 按天走势 | 广告按 `dateline`、订单按 `stat_date` 分别按天聚合后合并 |
| 多时间对比 | 对 `1/3/7/15/30` 天各跑一次 4.3 的单链接版本，终点固定为 `report_to` |

### 4.6 剔除补单后的口径

剔除分两种：按标签自动剔除、手动订单号 / 手动金额。查询时先算出「要剔除的订单行」，再在聚合里扣掉：

```sql
WITH excluded AS (
  SELECT o.store_id, o.order_no
  FROM order_item_daily o
  WHERE o.stat_date BETWEEN :from AND :to
    AND (
      EXISTS (
        SELECT 1 FROM store_exclusion_label l
        WHERE l.store_id = o.store_id
          AND JSON_CONTAINS(o.order_labels, JSON_QUOTE(l.label_id))
      )
      OR EXISTS (
        SELECT 1 FROM store_exclusion_order s
        WHERE s.store_id = o.store_id AND s.order_no = o.order_no
      )
    )
)
SELECT SUM(o.gmv) AS link_gmv            -- 剔除后的链接产出 GMV
FROM order_item_daily o
WHERE o.stat_date BETWEEN :from AND :to
  AND NOT EXISTS (SELECT 1 FROM excluded e WHERE e.store_id = o.store_id AND e.order_no = o.order_no);
```

整店 GMV = `SUM(store_daily.confirm_gmv)` − 被剔除订单行的 GMV 之和 − `manual_amount`。
广告消耗 / 广告 GMV 不受剔除影响；占比与 ROAS 用剔除后的分母重算。

口径开关（剔除补单 / 原始数据）建议放在请求参数里，由前端切换，后端同时返回「剔除金额」和「剔除单数」供页面提示。

---

## 5. 建议的接口契约

**`GET /api/ad-board/kpi`**

```json
{
  "range": { "from": "2026-10-22", "to": "2026-10-28" },
  "reportTo": "2026-10-28",
  "adTo": "2026-10-28",
  "orderTo": "2026-10-29",
  "kpis": [
    { "key": "adCost", "value": 3120.4, "prev": 2980.1, "delta": 0.047 },
    { "key": "adRatio", "value": 0.18, "prev": 0.16, "delta": 0.02 },
    { "key": "roas", "value": 3.42, "prev": 3.6, "delta": -0.05 }
  ]
}
```

**`GET /api/ad-board/stores`**：`rows[]`（storeId / storeName / adCost / adGmv / storeGmv / adRatio / roas / adCostDelta）+ `totals`。

**`GET /api/ad-board/links`**：`rows[]`（itemCode / itemName / imgUrl / categoryName / adCost / adGmv / linkGmv / adRatio / roas / hasAd）+ `total` + `totals`。

**`GET /api/ad-board/link-detail?storeId=&itemCode=&from=&to=`**：四个数 + `trend[]` + `compare[]{days, adCost, adGmv, linkGmv, adRatio, roas}`。

约定：金额统一 USD、字段带 `_usd` 或明确单位；无值返回 `null`；比率返回小数。

---

## 6. 待确认

| # | 问题 | 影响 |
| --- | --- | --- |
| 1 | 链接产出 GMV 是否含运费、是否剔除退款 | 链接层占比与 ROAS 的口径 |
| 2 | 广告 `itemcode` 能否传空 | 广告同步调用量差一个数量级 |
| 3 | `wis.confirmGmv` 的时区与退款口径 | 整店 GMV 与广告 GMV 的可比性 |
| 4 | 广告 T+1 的具体产出时点 | 页面「广告截止日」提示 |
| 5 | `products.spu` 与敦煌 `itemCode` 的映射 | 能否用商品库补类目，还是继续取订单行 |
| 6 | 同一订单同一商品是否可能多行（多 SKU / 拆单） | `order_item_daily` 唯一键 |
