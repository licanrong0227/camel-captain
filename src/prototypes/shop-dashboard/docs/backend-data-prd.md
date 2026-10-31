# 店铺看板 · 数据接口与口径说明（后端）

> 面向：后端 / 数据开发
> 对应原型：`src/prototypes/shop-dashboard`（页面 id `dashboard`）
> 页面标注见该原型的 8 条广告数据标注；本文说明取数接口、入参、字段关联、统计口径与运算公式。

## 0. 结论先行

1. 页面上的数字来自 4 类数据源：**广告商品日报**、**店铺经营数据**、**订单商品行**、**店铺/分组基础信息**。广告消耗与广告 GMV 只能从广告报表取；整店 GMV 只能从店铺经营取；链接产出 GMV 只能从订单商品行取。
2. 唯一的商品关联键是敦煌商品 ID：广告 `itemcode` = 订单 `orderProducts[].itemCode`；店铺用广告 `nickname` 映射到 `storeId`。
3. 广告是 T+1，订单与店铺数据到当天；所有数字统一按 `report_to = min(广告截止日, 订单截止日)` 收口，否则会出现「有 GMV、没广告消耗」，把占比和 ROAS 拉低。
4. 广告消耗、广告 GMV 不受补单剔除影响；整店 GMV、链接产出 GMV 要扣掉剔除的订单行与手动扣减金额；占比与 ROAS 用剔除后的分母重算。
5. 店群合计是「各店原始金额相加后重算比率」，不能对各店占比 / ROAS 求平均。

---

## 1. 页面数据地图

**各模块取数**

- 顶部查询条件：店铺分组、店铺范围、时间、GMV 口径；数据源为店铺 / 分组基础信息；接口 `GET /stores/tree`、`GET /stores`
- 店铺数据卡片：成交 / 下单 / 流量 / 潜在 4 组经营指标与趋势；数据源为店铺经营；接口 `GET /report/store/wis-core-info`（单店）、`GET /report/store/dashboard-list`（店群）
- 广告数据卡片：广告消耗、广告 GMV、整店 GMV、广告 GMV 占比、ROAS 与单指标趋势；数据源为广告日报 + 店铺经营；接口为敦煌 `dh.seller.ad.prod.report.page`、`wis-core-info`
- 店铺横向对比表：店铺、等级、能力分、两个趋势缩略线、按页签切换的经营 / 广告指标；数据源为店群列表 + 广告日报 + 等级接口；接口 `dashboard-list`、`seller-level-report`、广告日报
- 店铺行展开：商品广告数据：仅「广告」页签显示下拉并可展开；每个商品的广告消耗、广告 GMV、链接产出 GMV、占比、ROAS、趋势缩略线；数据源为广告日报 + 订单商品行；接口为广告日报、`GET /order/list`
- 店铺广告数据弹窗：单店 5 个广告指标与按天曲线；数据源为广告日报 + 店铺经营
- 商品广告趋势弹窗：单品 5 个指标与按天曲线；数据源为广告日报 + 订单商品行
- 导出：当前页签表格 / 当前店铺商品明细；字段同对应表格，前端生成 CSV

标注定位：[广告查询条件](#axhub-target:ssd-ad-filters)、[GMV 口径](#axhub-target:ssd-ad-exclude)、[广告指标卡](#axhub-target:ssd-ad-kpi)、[广告趋势图](#axhub-target:ssd-ad-chart)、[店铺横向对比表](#axhub-target:ssd-table-ad)。

---

## 2. 通用参数与时间口径

### 2.1 查询条件到接口参数的映射

| 页面条件 | 传给接口 | 说明 |
| --- | --- | --- |
| 店铺分组 | `groupId`（仅用于筛选可选店铺） | 不单独参与广告 / 经营取数；未选分组 = 店群全部店铺 |
| 店铺范围 | `storeId` 或 `storeIds[]` | 单店传 1 个；全部店铺（店群）传当前分组内的店铺 ID 列表，分别取数后相加 |
| 时间 | `from`、`to`（含首尾） | 预设 1/3/7/15/30 天或自定义，最长 31 天 |
| GMV 口径 | `excludeSupplement=true/false` | 默认 true（剔除补单）；见第 6 节 |

### 2.2 截止日对齐

- 广告日报更新到 T-1（演示数据截止 `2026-10-28`），订单与店铺经营更新到当天（演示到 `2026-10-29`）。
- `report_to = min(广告截止日, 订单/店铺截止日)`，页面上所有区间、趋势、对比都按这个日期收口。
- 建议接口显式返回 `adTo`、`orderTo`、`reportTo`，前端用于展示与校验。

### 2.3 店群与单店

- 单店：`storeId` 直接过滤；广告按 `nickname` 映射后的 `storeId` 过滤。
- 店群：对范围内每家店分别汇总，再把金额类字段相加；占比、ROAS 用合计后的分子分母重算。
- 店铺分组只影响「店铺范围」的可选项，不影响口径。

### 2.4 国家筛选

- 国家筛选只作用于「店铺数据」卡片（`countryId=TOTAL/US/UK/DE/FR/IT/ES`）。
- 广告报表没有国家维度，广告卡片、店铺横向对比表（经营列与广告列）、商品广告数据都不按国家过滤，固定 `site=TOTAL`、`countryId=TOTAL`。

---

## 3. 接口清单

### 3.1 店铺与分组

**`GET /stores?platform=dhgate&pageSize=1000&authStatus=2&status=1`**
店铺列表，取 `storeId`、`storeName`、`aliasName`。

**`GET /stores/tree`**
店铺分组树，取分组 `id` / `name` 与组内 `storeIds`。

**`GET /platform/seller-level-report?storeId={id}`**
店铺等级与能力分。测试环境返回空时页面显示 0，不阻塞其它指标。

### 3.2 店群列表 / 经营指标

**`GET /report/store/dashboard-list?periodType=L30&countryId=TOTAL`**

- 每行：`storeId`、`storeName`、`aliasName`、`wis{...}`、`history[]`（按天）。
- 页面用它渲染店铺横向对比表的店铺行与经营指标列；等级 / 能力分单独取 `seller-level-report`，接口为空时显示 0。
- 原型按顶部时间条件裁剪区间；建议后端支持 `from` / `to`，或明确约定用 `history` 按天汇总到区间。

### 3.3 单店按天经营

**`GET /report/store/wis-core-info?storeId={id}&periodType=DAY|L7|L30&site=TOTAL&countryId=TOTAL`**

- `data` 为当期汇总，`history` 固定 30 天。
- 店铺数据卡片的国家筛选通过 `countryId` 传入；广告卡片与表格固定 `TOTAL`。
- 只到店铺层，不能按商品取数。

### 3.4 订单商品行

**`GET /order/list?page=&pageSize=`**

字段：

- `order.orderNo`、`order.payDate`（按支付日期归属）
- `order.labels[]`（订单标签，用于补单剔除）
- `order.orderProducts[].itemCode / itemName / imgUrl / categoryName / quantity / price`
- `store.storeId`（或 `store.name` 映射）

链接产出 GMV 的单行值 = `price × quantity`。

### 3.5 订单标签

**`GET /order-label/list`**
系统订单标签（补单、刷单、赠品单等），用于剔除设置的多选。

### 3.6 广告商品日报（敦煌）

**`dh.seller.ad.prod.report.page$1.0`**（接口文档：https://open.dhgate.com/docs/api/001012）

字段：

- `nickname`：店铺名，同步时映射到 `storeId`
- `itemcode`：敦煌商品 ID（与订单 `orderProducts[].itemCode` 同一套编码）
- `adType`：`ppc` / `prodauto` / `shopauto`
- `dateline`：统计日（T+1）
- `usdCost`：广告消耗
- `gmv`：广告 GMV
- `orders`：广告订单数（当前页面未展示）

同一店铺 + 商品 + 日期 + 类型唯一；接口没有计划 / 关键词 / 曝光点击维度。

---

## 4. 字段关联

| 关联 | 规则 |
| --- | --- |
| 广告 → 店铺 | 广告 `nickname` = 店铺 `storeName`（同步时写成 `store_id`） |
| 广告 → 商品 | 广告 `itemcode` = 订单行 `orderProducts[].itemCode` |
| 订单 → 店铺 | `order.store` 的 `storeId` / 店铺名 |
| 日期 | 广告按 `dateline`；订单按 `payDate` 的日期部分；店铺按 `statDate` / `stat_date` |
| 商品全集 | 区间内有订单的商品 ∪ 有广告投放的商品；没有投放的商品广告列显示 `-` |

---

## 5. 指标口径与公式

### 5.1 广告指标（店铺 / 店群 / 单店）

| 指标 | 公式 | 来源 |
| --- | --- | --- |
| 广告消耗 | `SUM(usdCost)` | 广告日报，`dateline` 在区间内 |
| 广告 GMV | `SUM(gmv)` | 广告日报 |
| 整店 GMV | `SUM(confirmGmv) − Σ剔除订单行 GMV − manual_amount` | 店铺经营 `wis` / `wis-core-info` |
| 广告 GMV 占比 | `广告 GMV / 整店 GMV` | 剔除后的分母 |
| ROAS | `广告 GMV / 广告消耗` | — |

```sql
SELECT a.store_id,
       SUM(a.cost_usd) AS ad_cost,
       SUM(a.ad_gmv)   AS ad_gmv,
       SUM(d.confirm_gmv) - COALESCE(ex.excluded_gmv, 0) - COALESCE(r.manual_amount, 0) AS store_gmv
FROM ad_daily a
JOIN store_daily d
  ON d.store_id = a.store_id AND d.stat_date = a.dateline
WHERE a.dateline BETWEEN :from AND :to
GROUP BY a.store_id;
-- ad_ratio = ad_gmv / store_gmv；roas = ad_gmv / ad_cost；分母为 0 返回 null，前端显示 -
```

- 店群：先按店铺聚合，再对 `ad_cost / ad_gmv / store_gmv` 求和并重算 `ad_ratio`、`roas`。
- 广告消耗 / 广告 GMV 不扣补单。

### 5.2 商品（链接）指标

| 指标 | 公式 | 来源 |
| --- | --- | --- |
| 广告消耗 | `SUM(usdCost)` | 广告日报，按 `itemcode` |
| 广告 GMV | `SUM(gmv)` | 广告日报 |
| 链接产出 GMV | `SUM(price × quantity)`，按 `payDate` 归属，剔除命中标签/手动订单的行 | 订单商品行 |
| 广告 GMV 占比 | `广告 GMV / 链接产出 GMV` | 商品层分母 |
| ROAS | `广告 GMV / 广告消耗` | — |

```sql
SELECT COALESCE(o.item_code, a.item_code) AS item_code,
       SUM(a.cost_usd) AS ad_cost,
       SUM(a.ad_gmv)   AS ad_gmv,
       SUM(o.gmv)      AS link_gmv
FROM (SELECT item_code, SUM(price * quantity) gmv
      FROM order_item_daily
      WHERE store_id = :storeId AND stat_date BETWEEN :from AND :to
        AND NOT EXISTS (SELECT 1 FROM excluded e
                        WHERE e.order_no = order_item_daily.order_no)
      GROUP BY item_code) o
FULL OUTER JOIN (SELECT item_code, SUM(cost_usd) cost_usd, SUM(ad_gmv) ad_gmv
                 FROM ad_daily
                 WHERE store_id = :storeId AND dateline BETWEEN :from AND :to
                 GROUP BY item_code) a
  ON a.item_code = o.item_code
GROUP BY COALESCE(o.item_code, a.item_code);
```

### 5.3 店铺经营指标（店铺数据卡片 / 表格经营页签）

| 页签 | 指标 | 字段 / 公式 |
| --- | --- | --- |
| 成交 | 成交金额 | `wis.confirmGmv` |
| 成交 | 成交买家数 | `wis.confirmBuyerNum` |
| 成交 | 成交转化率 | `confirmBuyerNum / pdUv`（接口已返回比率时直取） |
| 成交 | 客单价 | `confirmGmv / confirmBuyerNum` |
| 成交 | 成交买家占比 | `wis.obRate`（直取，公式待平台确认） |
| 成交 | 成交订单数 | `wis.confirmRfxNum` |
| 成交 | 成交件数 | `wis.confirmProdQt` |
| 下单 | 下单金额 | `wis.startedGmv` |
| 下单 | 下单买家数 | `wis.startedBuyerNum` |
| 下单 | 下单转化率 | `startedBuyerNum / pdUv` |
| 下单 | 下单订单数 | `wis.startedRfxNum` |
| 流量 | 店铺浏览量 | `wis.pdPv` |
| 流量 | 店铺访客数 | `wis.pdUv` |
| 流量 | 搜索曝光量 | `wis.expoPv` |
| 流量 | UV 价值 | `confirmGmv / pdUv` |
| 潜在 | 商品加购人数 | `wis.addcartUv` |
| 潜在 | 加购件数 | `wis.addcartIcNum` |
| 潜在 | 商品收藏人数 | `wis.addfavUv` |

店群指标：同一字段跨店求和；比率类（转化率、客单价、UV 价值、买家占比）用合计后的分子分母重算，不对各店值求平均。

### 5.4 计算与展示规则

- 分母为 0 或没有投放 → 返回 `null`，前端显示 `-`。
- 排序字段白名单：广告页签 `adCost / adGmv / storeGmv / adRatio / roas`；商品面板 `adCost / adGmv / linkGmv / adRatio / roas`。空值行固定排在末尾。
- 广告页签的「整店 GMV」口径与广告卡片一致；商品面板不重复给合计，合计看店铺行。

---

## 6. 补单剔除

### 6.1 配置

- 按店铺生效：勾选订单标签（`order-label/list`）、指定订单号、手动扣减金额。
- 规则不按时间生效：改一次规则，历史区间一并按新规则重算。

### 6.2 取数逻辑

1. 先按区间拉取订单商品行，命中「任一已选标签」或「手动订单号」的订单整单剔除（订单下所有商品行一起剔除）。
2. 计算被剔除订单行的 `Σ(price × quantity)`。
3. 整店 GMV = `Σ(confirmGmv) − 剔除订单行 GMV − manual_amount`。
4. 链接产出 GMV = 该商品在剔除后订单行上的 `Σ(price × quantity)`。
5. 广告消耗、广告 GMV 不受影响。
6. `manual_amount` 只从整店 GMV 扣，不拆分到具体商品 / 链接。

```sql
WITH excluded AS (
  SELECT o.store_id, o.order_no
  FROM order_item_daily o
  WHERE o.stat_date BETWEEN :from AND :to
    AND (
      EXISTS (SELECT 1 FROM store_exclusion_label l
              WHERE l.store_id = o.store_id
                AND JSON_CONTAINS(o.order_labels, JSON_QUOTE(l.label_id)))
      OR EXISTS (SELECT 1 FROM store_exclusion_order s
                 WHERE s.store_id = o.store_id AND s.order_no = o.order_no)
    )
)
SELECT SUM(o.gmv) FROM order_item_daily o
WHERE o.stat_date BETWEEN :from AND :to
  AND NOT EXISTS (SELECT 1 FROM excluded e
                  WHERE e.store_id = o.store_id AND e.order_no = o.order_no);
```

- 页面开关：`excludeSupplement=true` 剔除补单，`false` 使用原始数据。
- 建议接口同时返回 `excludedGmv`、`excludedCount`、`manualTotal` 供页面提示。

---

## 7. 趋势与缩略线

### 7.1 广告卡片趋势

- 横轴：广告日报的 `dateline`（T+1），区间内没有数据的日期补 0。
- 广告消耗 / 广告 GMV：广告日报按 `dateline` 日汇总。
- 整店 GMV：店铺经营按 `stat_date` 日汇总，并扣除当天被剔除的订单行；`manual_amount` 只影响区间合计，不分摊到每一天。
- 占比、ROAS：用当天的广告 GMV、整店 GMV、广告消耗计算。
- 店群 = 组内各店当天数值相加；单店按 `storeId` 过滤。
- 当前选中的指标卡决定画哪条指标线。

### 7.2 店铺趋势弹窗（经营）

- 数据：`wis-core-info` 的当期汇总 + `history` 30 天。
- `periodType` 跟随顶部时间预设：1 天 → `DAY`，7 天 → `L7`，其余 → `L30`。
- 弹窗展示页签 KPI 与 360px 趋势图。

### 7.3 店铺广告数据弹窗

- 入参：`storeId`、`from`、`to`、`excludeSupplement`。
- 5 个指标与按天曲线口径同 5.1 / 7.1；5 张卡可点击切换单条曲线。

### 7.4 商品广告趋势弹窗

- 入参：`storeId`、`itemCode`、`from`、`to`、`excludeSupplement`。
- 广告按 `dateline` 汇总 `usdCost` / `gmv`；链接产出按订单 `stat_date` 汇总 `price × quantity`；按同一区间合并，缺数补 0。
- 没有投放的商品广告类指标显示 `-`，曲线按 0 展示。

### 7.5 表格里的缩略线

- 店铺行「广告数据趋势图」：固定取最近 30 天广告消耗（不随查询区间变化），点击打开该店当前查询区间的广告数据弹窗。
- 商品行「广告数据趋势图」：取该商品在当前查询区间内每天的广告消耗，点击打开商品广告趋势弹窗。
- 店铺行「店铺数据趋势图」：取近 30 天成交金额，点击打开经营趋势弹窗。

---

## 8. 店群表格、排序与导出

- 页签：成交 / 下单 / 流量 / 潜在 / 广告；固定列为店铺、等级、能力分、店铺数据趋势图、广告数据趋势图。
- 广告页签列：广告消耗、广告 GMV、整店 GMV、广告 GMV 占比、ROAS，口径见 5.1。
- 经营页签列：口径见 5.3；行数据取 `dashboard-list` 的 `wis` 并按查询区间裁剪。
- 排序：点击列头升序 → 降序 → 取消；切换页签或分组后重置。
- 空值：没有广告数据的店铺 / 商品显示 `-`，两种排序方向都排在末尾。
- 导出：页签栏右侧按当前页签导出 `店铺横向对比-{页签}.csv`，列为店铺、店铺 ID、等级、能力分 + 当前页签指标；商品面板导出 `商品广告数据-{storeId}.csv`，列为商品 ID、名称、类目、广告消耗、广告 GMV、链接产出 GMV、广告 GMV 占比、ROAS。

---

## 9. 建议接口契约

### 9.1 `GET /api/ad-board/kpi`

入参：`storeId?`、`from`、`to`、`excludeSupplement`

```json
{
  "range": { "from": "2026-10-22", "to": "2026-10-28" },
  "reportTo": "2026-10-28",
  "adTo": "2026-10-28",
  "orderTo": "2026-10-29",
  "kpis": [
    { "key": "adCost", "value": 3120.4 },
    { "key": "adGmv", "value": 6420.1 },
    { "key": "storeGmv", "value": 14820.0 },
    { "key": "adRatio", "value": 0.43 },
    { "key": "roas", "value": 2.06 }
  ],
  "excludedGmv": 240.5,
  "excludedCount": 12,
  "manualTotal": 0
}
```

### 9.2 `GET /api/ad-board/stores`

入参：`groupId?`、`storeId?`、`from`、`to`、`excludeSupplement`

```json
{
  "rows": [
    {
      "storeId": 152, "storeName": "包包",
      "adCost": 969.34, "adGmv": 1722.07, "storeGmv": 4107.0,
      "adRatio": 0.419, "roas": 1.78,
      "level": "V4", "score": 3.29
    }
  ],
  "totals": { "adCost": 1796.04, "adGmv": 3640.26, "storeGmv": 8502.0, "adRatio": 0.428, "roas": 2.03 }
}
```

### 9.3 `GET /api/ad-board/links`

入参：`storeId`、`from`、`to`、`excludeSupplement`

```json
{
  "rows": [
    {
      "itemCode": "204817563219", "itemName": "女士复古真皮手提包 通勤单肩包",
      "imgUrl": "https://...", "categoryName": "Women Handbags",
      "adCost": 76.44, "adGmv": 337.85, "linkGmv": 818.28,
      "adRatio": 0.413, "roas": 4.42,
      "hasAd": true
    }
  ]
}
```

### 9.4 `GET /api/ad-board/link-detail`

入参：`storeId`、`itemCode`、`from`、`to`、`excludeSupplement`

```json
{
  "kpis": { "adCost": 76.44, "adGmv": 337.85, "linkGmv": 818.28, "adRatio": 0.413, "roas": 4.42 },
  "trend": [
    { "date": "2026-10-22", "adCost": 8.3, "adGmv": 55.94, "linkGmv": 126.41 }
  ]
}
```

约定：金额统一 USD；无值返回 `null`；比率返回小数；日期格式 `YYYY-MM-DD`；接口失败时页面保留上一次成功数据并提示。

---

## 10. 原型演示数据说明

- 演示数据为静态快照：广告 `2026-08-29 ~ 2026-10-28`，订单与店铺到 `2026-10-29`。
- 广告数据只覆盖店铺 152（包包）、153（鞋子）、155（clothes）；161（sneakerhub8）、1957（echvolt）没有广告数据，页面广告列为 `-`。
- 商品维表的类目 / 名称 / 主图取自广告看板原型的商品目录；「链接产出 GMV」当前是**按店铺成交额和商品权重分摊的演示值**，真实实现必须按订单商品行 `price × quantity` 汇总。
- 店铺经营数据取测试环境接口快照；echvolt 经营数据全 0，属于测试数据缺失，不是口径问题。

---

## 11. 待确认

| # | 问题 | 影响 |
| --- | --- | --- |
| 1 | 链接产出 GMV 是否含运费、是否扣退款 | 商品层占比 / ROAS 分母 |
| 2 | `wis.confirmGmv` 的时区与退款口径 | 整店 GMV 与广告 GMV 是否可比 |
| 3 | `wis.obRate`（成交买家占比）、`confirmProdQt`、`startedTransRate` 的准确定义 | 表格经营列口径 |
| 4 | 广告 `itemcode` 是否允许传空值 | 同步调用量与取数方式 |
| 5 | 同一订单同一商品多 SKU / 拆单时的唯一键 | 订单商品行去重 |
| 6 | 广告报表能否提供国家维度 | 目前国家筛选只作用于店铺经营卡片 |
| 7 | 广告 T+1 的具体产出时点 | 页面「广告截止日」的展示与自动刷新 |

---

## 12. 验收要点

1. 任取一个店铺 + 区间，卡片、店铺表格广告行、店铺广告弹窗的 5 个指标一致。
2. 商品面板各商品金额相加 ≈ 店铺行的广告消耗 / 广告 GMV / 整店 GMV（允许四舍五入的 1~2 分差异），切店铺、切时间后同步变化。
3. 无广告数据的店铺 / 商品：广告列显示 `-`，不出现 0，排序时固定在末尾。
4. 剔除补单开关切换后：整店 GMV、占比、ROAS 变化，广告消耗 / 广告 GMV 不变。
5. 店群比率由合计值重算，不等于各店比率的平均值。
6. 导出的 CSV 列与当前页签一致，金额字段带引号，避免逗号分列。
