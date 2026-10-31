import React, { useMemo, useState } from 'react';
import {
  ErpButton,
  ErpDescriptions,
  ErpDialog,
  ErpDrawer,
  ErpInput,
  ErpSection,
  ErpSelect,
  ErpStatusTag,
  ErpTag,
  erpMessage,
} from '../components/ui';
import { FilterBar, ListPage, PageHeader } from '../components/ListPage';
import { BarChart, LineChart, Sparkline } from '../components/charts';
import { ExportDialog } from '../components/dialogs/common';
import {
  ORDER_REPORT_ROWS,
  REPORT_TOTALS,
  STORE_PUNISHMENTS,
  STORE_WIS,
  TOTAL_WIS,
  type DailyWis,
  type OrderReportRow,
  type Wis,
} from '../data/reports';
import { COUNTRY_OPTIONS, STORE_OPTIONS, money, num, pct } from '../data/util';

function sumWis(rows: DailyWis[]): Wis {
  const base = rows.reduce(
    (acc, day) => {
      acc.confirmGmv += day.confirmGmv;
      acc.startedGmv += day.startedGmv;
      acc.confirmRfxNum += day.confirmRfxNum;
      acc.confirmBuyerNum += day.confirmBuyerNum;
      acc.pdV += day.pdPv;
      acc.pdUv += day.pdUv;
      acc.expoPv += day.expoPv;
      acc.addcartUv += day.addcartUv;
      acc.addfavu += day.addfavUv;
      acc.refundGmv += day.refundGmv;
      return acc;
    },
    { confirmGmv: 0, startedGmv: 0, confirmRfxNum: 0, confirmBuyerNum: 0, pdV: 0, pdUv: 0, expoPv: 0, addcartUv: 0, addfavu: 0, refundGmv: 0 },
  );
  return {
    confirmGmv: base.confirmGmv,
    startedGmv: base.startedGmv,
    confirmRfxNum: base.confirmRfxNum,
    confirmBuyerNum: base.confirmBuyerNum,
    dealTransRate: base.pdUv ? base.confirmRfxNum / base.pdUv : 0,
    unitPrice: base.confirmRfxNum ? base.confirmGmv / base.confirmRfxNum : 0,
    pdPv: base.pdV,
    pdUv: base.pdUv,
    expoPv: base.expoPv,
    addcartUv: base.addcartUv,
    addfavUv: base.addfavu,
    avgUvValue: base.pdUv ? base.confirmGmv / base.pdUv : 0,
    refundGmv: base.refundGmv,
  };
}

export function OrderDetailReportPage() {
  const [dateFrom, setDateFrom] = useState('2026-10-01');
  const [dateTo, setDateTo] = useState('2026-10-31');
  const [stores, setStores] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [orderStatus, setOrderStatus] = useState('');
  const [chartType, setChartType] = useState('line');
  const [applied, setApplied] = useState({ dateFrom: '2026-10-01', dateTo: '2026-10-31', stores: [] as string[], countries: [] as string[], orderStatus: '' });
  const [exportOpen, setExportOpen] = useState(false);
  const [dayRow, setDayRow] = useState<OrderReportRow | null>(null);

  const rows = ORDER_REPORT_ROWS.filter((row) => row.date >= applied.dateFrom && row.date <= applied.dateTo);

  const totals = rows.reduce(
    (acc, row) => {
      acc.orders += row.orders;
      acc.sales += row.sales;
      acc.units += row.units;
      acc.refund += row.refund;
      acc.net += row.net;
      return acc;
    },
    { orders: 0, sales: 0, units: 0, refund: 0, net: 0 },
  );

  const chartData = rows.slice(-31).map((row) => ({ label: row.date.slice(5), value: row.sales }));

  const applyPreset = (preset: string) => {
    if (preset === '今天') {
      setDateFrom('2026-10-31');
      setDateTo('2026-10-31');
    } else if (preset === '近7天') {
      setDateFrom('2026-10-25');
      setDateTo('2026-10-31');
    } else if (preset === '近30天') {
      setDateFrom('2026-10-02');
      setDateTo('2026-10-31');
    } else if (preset === '本月') {
      setDateFrom('2026-10-01');
      setDateTo('2026-10-31');
    } else {
      setDateFrom('2026-09-01');
      setDateTo('2026-09-30');
    }
  };

  return (
    <div className="erp-page">
      <PageHeader title="订单明细报表" description="按日期查看订单、销售额、销量、退款与净销售额，支持多店铺与多国家筛选。" />
      <div className="erp-report-filter">
        <span className="erp-filter-field">
          <label>日期</label>
          <span className="erp-daterange" style={{ width: 250 }}>
            <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} aria-label="开始日期" />
            <span className="erp-daterange__sep">至</span>
            <input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} aria-label="结束日期" />
          </span>
        </span>
        <div className="erp-flex" style={{ gap: 4 }}>
          {['今天', '近7天', '近30天', '本月', '上月'].map((preset) => (
            <button type="button" key={preset} className="erp-tag erp-tag--neutral" onClick={() => applyPreset(preset)}>
              {preset}
            </button>
          ))}
        </div>
        <span className="erp-filter-field"><label>店铺</label><ErpSelect options={STORE_OPTIONS} value={stores} onChange={(value) => setStores(value as string[])} multiple width={170} /></span>
        <span className="erp-filter-field"><label>国家</label><ErpSelect options={COUNTRY_OPTIONS} value={countries} onChange={(value) => setCountries(value as string[])} multiple width={150} /></span>
        <span className="erp-filter-field"><label>订单状态</label><ErpSelect options={['全部', '已付款', '已发货', '已妥投', '退款'].map((value) => ({ label: value, value }))} value={orderStatus} onChange={(value) => setOrderStatus(String(value))} width={120} /></span>
        <div className="erp-report-filter__right">
          <ErpButton onClick={() => { setDateFrom('2026-10-01'); setDateTo('2026-10-31'); setStores([]); setCountries([]); setOrderStatus(''); setApplied({ dateFrom: '2026-10-01', dateTo: '2026-10-31', stores: [], countries: [], orderStatus: '' }); }}>重置</ErpButton>
          <ErpButton variant="primary" onClick={() => setApplied({ dateFrom, dateTo, stores, countries, orderStatus })}>查询</ErpButton>
          <ErpButton onClick={() => setExportOpen(true)}>导出</ErpButton>
        </div>
      </div>
      <div className="erp-kpi-grid">
        {[
          ['订单数', num(totals.orders)],
          ['销售额', money(totals.sales)],
          ['销量', num(totals.units)],
          ['客单价', money(totals.orders ? totals.sales / totals.orders : 0)],
          ['退款金额', money(totals.refund)],
          ['净销售额', money(totals.net)],
        ].map(([label, value]) => (
          <div className="erp-kpi" key={label}>
            <span className="erp-kpi__label">{label}</span>
            <span className="erp-kpi__value">{value}</span>
            <span className="erp-kpi__foot"><span className="erp-kpi__delta is-up">↑ 8.4%</span> 较上周期</span>
          </div>
        ))}
      </div>
      <div className="erp-chart-card">
        <div className="erp-chart-card__head">
          <b>销售额趋势</b>
          <div className="erp-flex">
            <div className="erp-segmented">
              <button type="button" className={chartType === 'line' ? 'is-active' : ''} onClick={() => setChartType('line')}>折线</button>
              <button type="button" className={chartType === 'bar' ? 'is-active' : ''} onClick={() => setChartType('bar')}>柱状</button>
            </div>
            <span className="erp-small erp-muted">{applied.dateFrom} 至 {applied.dateTo}</span>
          </div>
        </div>
        {chartType === 'line' ? <LineChart data={chartData} valueFormat={(value) => `$${Math.round(value / 1000)}k`} /> : <BarChart data={chartData} valueFormat={(value) => `$${Math.round(value / 1000)}k`} />}
      </div>
      <div className="erp-card" style={{ padding: '0 20px 0' }}>
        <ListPage
          header={null}
          columns={[
            { key: 'date', title: '日期', width: 110 },
            { key: 'orders', title: '订单数', width: 100, align: 'right', sortable: true },
            { key: 'sales', title: '销售额', width: 130, align: 'right', sortable: true, render: (row) => money(row.sales) },
            { key: 'units', title: '销量', width: 100, align: 'right', sortable: true },
            { key: 'aov', title: '客单价', width: 110, align: 'right', render: (row) => money(row.aov) },
            { key: 'refund', title: '退款金额', width: 120, align: 'right', render: (row) => <span className="erp-amount erp-amount--danger">{money(row.refund)}</span> },
            { key: 'net', title: '净销售额', width: 130, align: 'right', render: (row) => <span className="erp-amount erp-amount--income">{money(row.net)}</span> },
          ]}
          rows={rows}
          rowKey={(row) => row.date}
          sortable
          selectable
          filterKey={`${applied.dateFrom}-${applied.dateTo}-${applied.stores.join()}-${applied.countries.join()}-${applied.orderStatus}`}
          pageSizeDefault={10}
          rowActions={(row) => [
            { label: '查看当日明细', onClick: () => setDayRow(row) },
            { label: '导出当日', onClick: () => erpMessage(`已导出 ${row.date} 的订单明细（演示）`) },
          ]}
          batchActions={(selected) => [
            { label: '导出选中日期', onClick: () => erpMessage(`已导出 ${selected.length} 天的订单明细（演示）`) },
          ]}
          cardless
        />
      </div>
      <ErpDialog open={Boolean(dayRow)} title={`当日明细 · ${dayRow?.date || ''}`} width={560} onClose={() => setDayRow(null)} footer={<ErpButton variant="primary" onClick={() => setDayRow(null)}>关闭</ErpButton>}>
        {dayRow ? (
          <ErpDescriptions
            columns={2}
            items={[
              { label: '订单数', value: num(dayRow.orders) },
              { label: '销售额', value: money(dayRow.sales) },
              { label: '销量', value: num(dayRow.units) },
              { label: '客单价', value: money(dayRow.aov) },
              { label: '退款金额', value: money(dayRow.refund) },
              { label: '净销售额', value: money(dayRow.net) },
            ]}
          />
        ) : null}
      </ErpDialog>
      <ExportDialog open={exportOpen} fields={[{ key: 'date', label: '日期' }, { key: 'orders', label: '订单数' }, { key: 'sales', label: '销售额' }, { key: 'units', label: '销量' }, { key: 'aov', label: '客单价' }, { key: 'refund', label: '退款金额' }, { key: 'net', label: '净销售额' }]} onClose={() => setExportOpen(false)} onConfirm={() => { setExportOpen(false); erpMessage('报表导出任务已创建（演示）'); }} />
    </div>
  );
}

const METRICS: Array<{ key: keyof Wis; label: string; format: (value: number) => string }> = [
  { key: 'confirmGmv', label: '成交金额', format: (value) => money(value) },
  { key: 'startedGmv', label: '下单金额', format: (value) => money(value) },
  { key: 'confirmRfxNum', label: '成交订单数', format: num },
  { key: 'confirmBuyerNum', label: '成交买家数', format: num },
  { key: 'dealTransRate', label: '成交转化率', format: pct },
  { key: 'unitPrice', label: '客单价', format: (value) => money(value) },
  { key: 'pdPv', label: '浏览量', format: num },
  { key: 'pdUv', label: '访客数', format: num },
  { key: 'expoPv', label: '搜索曝光量', format: num },
  { key: 'addcartUv', label: '加购人数', format: num },
  { key: 'addfavUv', label: '收藏人数', format: num },
  { key: 'avgUvValue', label: 'UV 价值', format: (value) => money(value) },
  { key: 'refundGmv', label: '退款金额', format: (value) => money(value) },
];

export function ShopDashboardPage() {
  const [mode, setMode] = useState('group');
  const [storeId, setStoreId] = useState('152');
  const [period, setPeriod] = useState('L30');
  const [detailStore, setDetailStore] = useState<(typeof STORE_WIS)[number] | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const days = period === 'DAY' ? 1 : period === 'L7' ? 7 : 30;

  const selectedHistory = useMemo(() => {
    if (mode === 'single') {
      const store = STORE_WIS.find((item) => item.storeId === storeId) || STORE_WIS[0];
      return store.history.slice(-days);
    }
    return Array.from({ length: days }, (_, index) => {
      const dayIndex = 30 - days + index;
      const date = STORE_WIS[0].history[dayIndex]?.date || '';
      const dayRows = STORE_WIS.map((store) => store.history[dayIndex]).filter(Boolean);
      return {
        date,
        confirmGmv: dayRows.reduce((sum, day) => sum + day.confirmGmv, 0),
        startedGmv: dayRows.reduce((sum, day) => sum + day.startedGmv, 0),
        confirmRfxNum: dayRows.reduce((sum, day) => sum + day.confirmRfxNum, 0),
        confirmBuyerNum: dayRows.reduce((sum, day) => sum + day.confirmBuyerNum, 0),
        dealTransRate: 0,
        unitPrice: 0,
        pdPv: dayRows.reduce((sum, day) => sum + day.pdPv, 0),
        pdUv: dayRows.reduce((sum, day) => sum + day.pdUv, 0),
        expoPv: dayRows.reduce((sum, day) => sum + day.expoPv, 0),
        addcartUv: dayRows.reduce((sum, day) => sum + day.addcartUv, 0),
        addfavUv: dayRows.reduce((sum, day) => sum + day.addfavUv, 0),
        avgUvValue: 0,
        refundGmv: dayRows.reduce((sum, day) => sum + day.refundGmv, 0),
      } as DailyWis;
    });
  }, [mode, storeId, days]);

  const wis = sumWis(selectedHistory);
  const chartData = selectedHistory.map((day) => ({ label: day.date.slice(5), value: day.confirmGmv }));

  const storeRows = STORE_WIS.map((store, index) => ({
    ...store,
    trend: store.history.slice(-14).map((day) => day.confirmGmv),
    level: ['V4', 'V3', 'V4', 'V5', 'V2'][index],
  }));

  return (
    <div className="erp-page">
      <PageHeader
        title="店铺看板"
        description="查看单店或店群的经营核心指标、趋势与处罚通知。数据取自测试环境快照。"
        extra={<div className="erp-dash-toolbar__right"><ErpTag tone="info">数据截止 2026-10-31 10:00</ErpTag><ErpButton onClick={() => erpMessage('看板数据已刷新（演示）')}>刷新</ErpButton></div>}
      />
      <div className="erp-card" style={{ padding: 16 }}>
        <div className="erp-dash-toolbar">
          <div className="erp-segmented">
            <button type="button" className={mode === 'single' ? 'is-active' : ''} onClick={() => setMode('single')}>单店</button>
            <button type="button" className={mode === 'group' ? 'is-active' : ''} onClick={() => setMode('group')}>店群</button>
          </div>
          {mode === 'single' ? <ErpSelect options={STORE_OPTIONS} value={storeId} onChange={(value) => setStoreId(String(value))} width={180} /> : <span className="erp-small erp-muted">汇总 {STORE_WIS.length} 家店铺</span>}
          <div className="erp-segmented">
            {[['DAY', '今日'], ['L7', '近7天'], ['L30', '近30天']].map(([key, label]) => (
              <button type="button" key={key} className={period === key ? 'is-active' : ''} onClick={() => setPeriod(key)}>{label}</button>
            ))}
          </div>
          <div className="erp-dash-toolbar__right"><ErpButton onClick={() => erpMessage('导出看板数据（演示）')}>导出</ErpButton></div>
        </div>
      </div>
      <div className="erp-kpi-grid">
        {METRICS.slice(0, 6).map((metric) => (
          <div className="erp-kpi" key={metric.key}>
            <span className="erp-kpi__label">{metric.label}</span>
            <span className="erp-kpi__value">{metric.format(wis[metric.key])}</span>
            <span className="erp-kpi__foot"><span className="erp-kpi__delta is-up">↑ 6.2%</span> 环比</span>
          </div>
        ))}
      </div>
      <div className="erp-kpi-grid erp-kpi-grid--4">
        {METRICS.slice(6).map((metric) => (
          <div className="erp-kpi" key={metric.key}>
            <span className="erp-kpi__label">{metric.label}</span>
            <span className="erp-kpi__value" style={{ fontSize: 20, lineHeight: '28px' }}>{metric.format(wis[metric.key])}</span>
          </div>
        ))}
        <div className="erp-kpi">
          <span className="erp-kpi__label">数据周期</span>
          <span className="erp-kpi__value" style={{ fontSize: 18, lineHeight: '28px' }}>{period === 'DAY' ? '今日' : period === 'L7' ? '近 7 天' : '近 30 天'}</span>
          <span className="erp-kpi__foot">{mode === 'single' ? STORE_OPTIONS.find((store) => store.value === storeId)?.label : '全部店铺'}</span>
        </div>
      </div>
      <div className="erp-chart-card">
        <div className="erp-chart-card__head">
          <b>成交金额趋势</b>
          <div className="erp-chart__legend"><span><i />成交金额</span></div>
        </div>
        <LineChart data={chartData} valueFormat={(value) => `$${Math.round(value / 1000)}k`} />
      </div>
      <div className="erp-two-col">
        <div className="erp-table-card">
          <div className="erp-table-card__head">
            <b>{mode === 'single' ? '店铺明细' : '店群店铺'}</b>
            <span className="erp-small erp-muted">点击行查看店铺详情</span>
          </div>
          <ListPage
            header={null}
            columns={[
              { key: 'storeName', title: '店铺', width: 170, render: (row) => <div className="erp-store-row"><span className={`erp-store-dot ${row.wis.confirmGmv === 0 ? 'is-muted' : ''}`} />{row.storeName}</div> },
              { key: 'gmv', title: '成交金额', width: 120, align: 'right', sortable: true, render: (row) => money(row.wis.confirmGmv) },
              { key: 'orders', title: '成交订单', width: 100, align: 'right', render: (row) => num(row.wis.confirmRfxNum) },
              { key: 'buyers', title: '买家数', width: 90, align: 'right', render: (row) => num(row.wis.confirmBuyerNum) },
              { key: 'rate', title: '转化率', width: 90, align: 'right', render: (row) => pct(row.wis.dealTransRate) },
              { key: 'uv', title: '访客数', width: 100, align: 'right', render: (row) => num(row.wis.pdUv) },
              { key: 'trend', title: '趋势', width: 110, render: (row) => <Sparkline values={row.trend} /> },
              { key: 'level', title: '等级', width: 70, render: (row) => <ErpTag tone="warning">{row.level}</ErpTag> },
            ]}
            rows={storeRows}
            rowKey={(row) => row.storeId}
            sortable
            pagination={false}
            onRowClick={(row) => { setDetailStore(row); setDetailOpen(true); }}
            cardless
          />
        </div>
        <div className="erp-section">
          <div className="erp-section__head"><h3>处罚与违规通知</h3><ErpTag tone="danger">{STORE_PUNISHMENTS.filter((item) => item.status === '处理中').length} 条待处理</ErpTag></div>
          <div className="erp-section__body">
            <div className="erp-punish-list">
              {STORE_PUNISHMENTS.map((item) => (
                <div className="erp-punish" key={item.id}>
                  <div style={{ flex: 1 }}>
                    <b>{item.type}</b>
                    <p>{item.storeName} · {item.reason}</p>
                    <p>{item.date}</p>
                  </div>
                  <ErpStatusTag status={item.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <ErpDrawer open={detailOpen} title={`店铺详情 · ${detailStore?.storeName || ''}`} width={640} onClose={() => setDetailOpen(false)} footer={<ErpButton onClick={() => setDetailOpen(false)}>关闭</ErpButton>}>
        {detailStore ? (
          <div className="erp-stack" style={{ gap: 18 }}>
            <ErpDescriptions
              columns={2}
              items={[
                { label: '成交金额', value: money(detailStore.wis.confirmGmv) },
                { label: '成交订单数', value: num(detailStore.wis.confirmRfxNum) },
                { label: '成交买家数', value: num(detailStore.wis.confirmBuyerNum) },
                { label: '成交转化率', value: pct(detailStore.wis.dealTransRate) },
                { label: '客单价', value: money(detailStore.wis.unitPrice) },
                { label: '访客数', value: num(detailStore.wis.pdUv) },
                { label: '搜索曝光量', value: num(detailStore.wis.expoPv) },
                { label: '退款金额', value: money(detailStore.wis.refundGmv) },
              ]}
            />
            <ErpSection title="近 30 天成交趋势">
              <LineChart data={detailStore.history.map((day) => ({ label: day.date.slice(5), value: day.confirmGmv }))} valueFormat={(value) => `$${Math.round(value / 1000)}k`} />
            </ErpSection>
          </div>
        ) : null}
      </ErpDrawer>
    </div>
  );
}
