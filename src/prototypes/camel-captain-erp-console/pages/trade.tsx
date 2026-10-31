import React, { useMemo, useState } from 'react';
import {
  ErpButton,
  ErpInput,
  ErpSelect,
  ErpStatusTag,
  ErpSwitch,
  ErpTag,
  erpConfirm,
  erpMessage,
} from '../components/ui';
import { FilterBar, ListPage, PageHeader, ProductCell } from '../components/ListPage';
import { ExportDialog, FormDialog } from '../components/dialogs/common';
import { BatchDeclareDialog, LabelingRuleDialog, MergeOrderDialog, ShipDialog } from '../components/dialogs/order';
import { OrderDetailDrawer } from '../components/dialogs/product';
import {
  LABELING_RULES,
  ORDER_BATCH_ACTIONS,
  ORDER_COUNTS,
  ORDER_ROW_ACTIONS,
  ORDER_STATUSES,
  ORDERS,
  type LabelingRule,
  type Order,
} from '../data/orders';
import { CARRIER_OPTIONS, COUNTRY_OPTIONS, PLATFORM_OPTIONS, STORE_OPTIONS } from '../data/util';
import type { PageProps } from './commodity';

export function MyOrdersPage({ navigate }: PageProps) {
  const [rows, setRows] = useState<Order[]>(() => [...ORDERS].sort((left, right) => right.createdAt.localeCompare(left.createdAt)));
  const [activeStatus, setActiveStatus] = useState('全部订单');
  const [keyword, setKeyword] = useState('');
  const [dateFrom, setDateFrom] = useState('2026-10-01');
  const [dateTo, setDateTo] = useState('2026-10-31');
  const [stores, setStores] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [channels, setChannels] = useState<string[]>([]);
  const [applied, setApplied] = useState({ keyword: '', dateFrom: '2026-10-01', dateTo: '2026-10-31', stores: [] as string[], countries: [] as string[], channels: [] as string[] });
  const [selectedRows, setSelectedRows] = useState<Order[]>([]);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [declareOpen, setDeclareOpen] = useState(false);
  const [declareRows, setDeclareRows] = useState<Order[]>([]);
  const [shipOpen, setShipOpen] = useState(false);
  const [shipOrder, setShipOrder] = useState<Order | null>(null);
  const [mergeOpen, setMergeOpen] = useState(false);
  const [remarkOpen, setRemarkOpen] = useState(false);
  const [remarkType, setRemarkType] = useState<'标记' | '备注'>('标记');
  const [exportOpen, setExportOpen] = useState(false);

  const counts = useMemo(() => {
    const map: Record<string, number> = { 全部订单: rows.length };
    ORDER_STATUSES.filter((status) => status !== '全部订单').forEach((status) => {
      map[status] = rows.filter((row) => row.status === status).length;
    });
    return map;
  }, [rows]);

  const filtered = rows.filter((row) => {
    const matchStatus = activeStatus === '全部订单' || row.status === activeStatus;
    const matchKeyword = !applied.keyword || row.orderNo.includes(applied.keyword) || row.buyer.toLowerCase().includes(applied.keyword.toLowerCase()) || row.items.some((item) => item.title.toLowerCase().includes(applied.keyword.toLowerCase())) || row.trackingNo.includes(applied.keyword);
    const matchStore = applied.stores.length === 0 || applied.stores.includes(row.storeId);
    const matchCountry = applied.countries.length === 0 || applied.countries.includes(row.countryCode);
    const matchChannel = applied.channels.length === 0 || applied.channels.includes(row.channel);
    const day = row.createdAt.slice(0, 10);
    const matchDate = (!applied.dateFrom || day >= applied.dateFrom) && (!applied.dateTo || day <= applied.dateTo);
    return matchStatus && matchKeyword && matchStore && matchCountry && matchChannel && matchDate;
  });

  const openDetail = (order: Order) => {
    setDetailOrder(order);
    setDetailOpen(true);
  };

  const updateStatus = (order: Order, status: string, message: string) => {
    setRows((prev) => prev.map((row) => (row.id === order.id ? { ...row, status } : row)));
    erpMessage(message);
  };

  const rowActionHandler = (label: string, order: Order) => {
    switch (label) {
      case '查看订单':
        openDetail(order);
        break;
      case '标记':
      case '备注':
        setRemarkType(label === '标记' ? '标记' : '备注');
        setShipOrder(order);
        setRemarkOpen(true);
        break;
      case '删除':
        erpConfirm({ content: `确定删除订单 ${order.orderNo} 吗？`, danger: true }).then((ok) => {
          if (ok) {
            setRows((prev) => prev.filter((row) => row.id !== order.id));
            erpMessage('订单已删除（演示）');
          }
        });
        break;
      case '作废':
        erpConfirm({ content: `确定作废订单 ${order.orderNo} 吗？`, danger: true }).then((ok) => {
          if (ok) updateStatus(order, '已作废', '订单已作废（演示）');
        });
        break;
      case '申请运单号':
        setShipOrder(order);
        setShipOpen(true);
        break;
      case '一键出库':
        updateStatus(order, '物流运输', '已一键出库（演示）');
        break;
      case '物流跟踪':
        navigate('logistics-international');
        break;
      case '恢复订单':
        updateStatus(order, '新订单', '订单已恢复（演示）');
        break;
      case '查看收入':
        erpMessage(`订单 ${order.orderNo} 收入 ${order.income} USD（演示）`, 'info');
        break;
      default:
        erpMessage(`${label}（演示）`);
    }
  };

  const batchHandler = (label: string) => {
    if (label === '处理申报信息') {
      setDeclareRows(selectedRows);
      setDeclareOpen(true);
      return;
    }
    if (label === '删除') {
      erpConfirm({ content: `确定删除选中的 ${selectedRows.length} 个订单吗？`, danger: true }).then((ok) => {
        if (ok) {
          setRows((prev) => prev.filter((row) => !selectedRows.some((target) => target.id === row.id)));
          erpMessage('订单已删除（演示）');
        }
      });
      return;
    }
    if (label === '导出订单') {
      setExportOpen(true);
      return;
    }
    erpMessage(`${label}：已处理 ${selectedRows.length} 个订单（演示）`);
  };

  return (
    <div className="erp-page">
      <PageHeader
        title="我的订单"
        description="统一处理敦煌网订单、采购配货、仓库出库与物流跟踪。"
        extra={<div className="erp-flex"><ErpButton onClick={() => erpMessage('订单同步完成（演示）')}>同步订单</ErpButton><ErpButton variant="primary" onClick={() => setMergeOpen(true)}>合并订单</ErpButton></div>}
      />
      <div className="erp-card">
        <div style={{ padding: '14px 20px 0' }}>
          <FilterBar
            onQuery={() => setApplied({ keyword, dateFrom, dateTo, stores, countries, channels })}
            onReset={() => {
              setKeyword('');
              setDateFrom('2026-10-01');
              setDateTo('2026-10-31');
              setStores([]);
              setCountries([]);
              setChannels([]);
              setApplied({ keyword: '', dateFrom: '2026-10-01', dateTo: '2026-10-31', stores: [], countries: [], channels: [] });
            }}
            extra={<ErpButton onClick={() => setExportOpen(true)}>导出订单</ErpButton>}
          >
            <span className="erp-filter-field"><label>关键词</label><ErpInput value={keyword} onChange={setKeyword} onEnter={() => setApplied({ keyword, dateFrom, dateTo, stores, countries, channels })} placeholder="订单号 / 买家 / 商品 / 运单号" style={{ width: 220 }} /></span>
            <span className="erp-filter-field">
              <label>下单时间</label>
              <span className="erp-daterange" style={{ width: 250 }}>
                <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} aria-label="开始日期" />
                <span className="erp-daterange__sep">至</span>
                <input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} aria-label="结束日期" />
              </span>
            </span>
            <span className="erp-filter-field"><label>店铺</label><ErpSelect options={STORE_OPTIONS} value={stores} onChange={(value) => setStores(value as string[])} multiple width={160} /></span>
            <span className="erp-filter-field"><label>国家</label><ErpSelect options={COUNTRY_OPTIONS} value={countries} onChange={(value) => setCountries(value as string[])} multiple width={150} /></span>
            <span className="erp-filter-field"><label>物流渠道</label><ErpSelect options={[{ label: '华磊-美国专线', value: '华磊-美国专线' }, { label: '云途-全球挂号', value: '云途-全球挂号' }, { label: '燕文-欧洲专线', value: '燕文-欧洲专线' }, { label: '递四方-经济小包', value: '递四方-经济小包' }]} value={channels} onChange={(value) => setChannels(value as string[])} multiple width={170} /></span>
          </FilterBar>
        </div>
        <ListPage
          header={null}
          tabs={ORDER_STATUSES.map((status) => ({ key: status, label: status, count: counts[status] || 0 }))}
          activeTab={activeStatus}
          onTabChange={setActiveStatus}
          columns={[
            {
              key: 'orderNo',
              title: '订单信息',
              width: 220,
              render: (row) => (
                <div className="erp-stack">
                  <div className="erp-flex" style={{ gap: 6 }}><ErpStatusTag status={row.status} /><span className="erp-small erp-muted">{row.storeName}</span></div>
                  <button type="button" className="erp-link" style={{ textAlign: 'left' }} onClick={(event) => { event.stopPropagation(); openDetail(row); }}>{row.orderNo}</button>
                  <span className="erp-small erp-muted">{row.createdAt.slice(0, 16)}</span>
                  {row.warning ? <ErpTag tone="danger">{row.warning}</ErpTag> : null}
                </div>
              ),
            },
            {
              key: 'items',
              title: '商品',
              minWidth: 300,
              render: (row) => (
                <ProductCell
                  image={row.items[0].image}
                  title={row.items[0].title}
                  meta={<span>{row.items.length > 1 ? `等 ${row.items.length} 件商品` : `SKU：${row.items[0].sku}`}</span>}
                  sub={<span>单价 {row.items[0].price.toFixed(2)} USD × {row.items[0].qty}</span>}
                />
              ),
            },
            { key: 'onlineOrderNo', title: '线上单号 / 匹配', width: 170, render: (row) => <div className="erp-stack erp-small"><span className="erp-code">{row.onlineOrderNo}</span><ErpTag tone={row.matchStatus === '已匹配' ? 'success' : 'danger'}>{row.matchStatus}</ErpTag></div> },
            { key: 'purchaseStatus', title: '采购状态', width: 100, render: (row) => <ErpTag tone={row.purchaseStatus === '已采购' ? 'success' : row.purchaseStatus === '未采购' ? 'warning' : 'neutral'}>{row.purchaseStatus}</ErpTag> },
            { key: 'buyer', title: '买家 / 国家', width: 150, render: (row) => <div className="erp-stack erp-small"><span>{row.buyer}</span><span className="erp-muted">{row.country}</span></div> },
            { key: 'logistics', title: '物流', width: 170, render: (row) => <div className="erp-stack erp-small"><span>{row.logistics || '-'}</span><span className="erp-muted">{row.trackingNo}</span></div> },
            { key: 'amount', title: '销售额 / 收入', width: 130, align: 'right', sortable: true, render: (row) => <div className="erp-stack" style={{ alignItems: 'flex-end' }}><span className="erp-amount">{row.amount.toFixed(2)} USD</span><span className="erp-small erp-amount erp-amount--income">收入 {row.income.toFixed(2)}</span></div> },
          ]}
          rows={filtered}
          rowKey={(row) => row.id}
          selectable
          sortable
          filterKey={`${activeStatus}-${applied.keyword}-${applied.dateFrom}-${applied.dateTo}-${applied.stores.join()}-${applied.countries.join()}-${applied.channels.join()}`}
          crossPageTotal={filtered.length}
          onSelectionChange={setSelectedRows}
          rowActions={(row) => (ORDER_ROW_ACTIONS[row.status] || ORDER_ROW_ACTIONS['全部订单']).map((label) => ({ label, danger: ['删除', '作废'].includes(label), onClick: () => rowActionHandler(label, row) }))}
          batchActions={() => (ORDER_BATCH_ACTIONS[activeStatus] || ORDER_BATCH_ACTIONS['全部订单']).map((label) => ({ label, danger: label === '删除', onClick: () => batchHandler(label) }))}
          pageSizeDefault={10}
        />
      </div>
      <OrderDetailDrawer open={detailOpen} order={detailOrder} onClose={() => setDetailOpen(false)} />
      <BatchDeclareDialog open={declareOpen} orders={declareRows} onClose={() => setDeclareOpen(false)} onConfirm={() => { setDeclareOpen(false); erpMessage('申报信息已保存（演示）'); }} />
      <ShipDialog open={shipOpen} order={shipOrder} onClose={() => setShipOpen(false)} onConfirm={(channel, trackingNo) => {
        setShipOpen(false);
        if (shipOrder) {
          setRows((prev) => prev.map((row) => (row.id === shipOrder.id ? { ...row, status: '物流运输', logistics: channel, trackingNo } : row)));
        }
        erpMessage(`发货成功，运单号 ${trackingNo}（演示）`);
      }} />
      <MergeOrderDialog open={mergeOpen} orders={selectedRows.length > 1 ? selectedRows : rows.slice(0, 3)} onClose={() => setMergeOpen(false)} onConfirm={(ids) => { setMergeOpen(false); erpMessage(`已合并 ${ids.length} 个订单（演示）`); }} />
      <FormDialog
        open={remarkOpen}
        title={remarkType}
        width={560}
        fields={remarkType === '标记' ? [
          { key: 'mark', label: '订单标记', type: 'select', required: true, options: ['加急', '礼品', '老客', '风险', '待确认'].map((value) => ({ label: value, value })) },
          { key: 'note', label: '备注', type: 'textarea', placeholder: '补充说明（选填）' },
        ] : [
          { key: 'note', label: '订单备注', type: 'textarea', required: true, placeholder: '请输入备注内容' },
          { key: 'color', label: '标记颜色', type: 'select', options: ['橙色', '红色', '蓝色', '灰色'].map((value) => ({ label: value, value })) },
        ]}
        onClose={() => setRemarkOpen(false)}
        onSubmit={(values) => {
          if (shipOrder) {
            setRows((prev) => prev.map((row) => (row.id === shipOrder.id ? { ...row, mark: String(values.mark || row.mark) } : row)));
          }
          setRemarkOpen(false);
          erpMessage(`${remarkType}已保存（演示）`);
        }}
      />
      <ExportDialog open={exportOpen} fields={[{ key: 'orderNo', label: '订单号' }, { key: 'status', label: '订单状态' }, { key: 'store', label: '店铺' }, { key: 'buyer', label: '买家' }, { key: 'country', label: '国家' }, { key: 'amount', label: '销售额' }, { key: 'trackingNo', label: '运单号' }]} onClose={() => setExportOpen(false)} onConfirm={() => { setExportOpen(false); erpMessage('导出任务已创建（演示）'); }} />
    </div>
  );
}

export function AutoLabelingPage() {
  const [rows, setRows] = useState<LabelingRule[]>(LABELING_RULES);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const [applied, setApplied] = useState({ keyword: '', status: '' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [current, setCurrent] = useState<LabelingRule | null>(null);

  const filtered = rows.filter((row) => (!applied.keyword || row.name.includes(applied.keyword)) && (!applied.status || (applied.status === '启用' ? row.enabled : !row.enabled)));

  return (
    <div className="erp-page">
      <PageHeader title="自动打标配置" description="按订单条件自动打标签，标签会显示在订单列表与即时咨询侧栏。" extra={<ErpButton variant="primary" onClick={() => { setCurrent(null); setDialogOpen(true); }}>新增规则</ErpButton>} />
      <div className="erp-card" style={{ padding: 20 }}>
        <FilterBar onQuery={() => setApplied({ keyword, status })} onReset={() => { setKeyword(''); setStatus(''); setApplied({ keyword: '', status: '' }); }}>
          <span className="erp-filter-field"><label>规则名称</label><ErpInput value={keyword} onChange={setKeyword} onEnter={() => setApplied({ keyword, status })} placeholder="请输入规则名称" /></span>
          <span className="erp-filter-field"><label>状态</label><ErpSelect options={[{ label: '启用', value: '启用' }, { label: '停用', value: '停用' }]} value={status} onChange={(value) => setStatus(String(value))} clearable width={120} /></span>
        </FilterBar>
        <ListPage
          header={null}
          columns={[
            { key: 'name', title: '规则名称', minWidth: 180 },
            { key: 'summary', title: '触发条件', minWidth: 260, render: (row) => <span className="erp-small">{row.summary}</span> },
            { key: 'label', title: '标签', width: 110, render: (row) => <ErpTag tone="brand">{row.label}</ErpTag> },
            { key: 'scope', title: '适用范围', width: 150, render: (row) => <span className="erp-small">{row.scope}</span> },
            { key: 'priority', title: '优先级', width: 80, align: 'right', sortable: true },
            { key: 'enabled', title: '状态', width: 80, render: (row) => <ErpSwitch checked={row.enabled} onChange={(checked) => setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, enabled: checked } : item)))} /> },
            { key: 'updatedAt', title: '更新时间', width: 160 },
          ]}
          rows={filtered}
          rowKey={(row) => row.id}
          selectable
          sortable
          filterKey={`${applied.keyword}-${applied.status}`}
          rowActions={(row) => [
            { label: '编辑', onClick: () => { setCurrent(row); setDialogOpen(true); } },
            { label: '复制', onClick: () => { setRows((prev) => [{ ...row, id: `${row.id}-C`, name: `${row.name} 副本`, updatedAt: '2026-10-31 10:00:00' }, ...prev]); erpMessage('规则已复制'); } },
            { label: '删除', danger: true, onClick: async () => { if (await erpConfirm({ content: `确定删除规则「${row.name}」吗？`, danger: true })) { setRows((prev) => prev.filter((item) => item.id !== row.id)); erpMessage('已删除（演示）'); } } },
          ]}
          batchActions={(selected) => [
            { label: '批量启用', onClick: () => { setRows((prev) => prev.map((row) => (selected.some((target) => target.id === row.id) ? { ...row, enabled: true } : row))); erpMessage('已批量启用（演示）'); } },
            { label: '批量停用', onClick: () => { setRows((prev) => prev.map((row) => (selected.some((target) => target.id === row.id) ? { ...row, enabled: false } : row))); erpMessage('已批量停用（演示）'); } },
          ]}
        />
      </div>
      <LabelingRuleDialog
        open={dialogOpen}
        rule={current}
        onClose={() => setDialogOpen(false)}
        onSave={(next) => {
          setRows((prev) => (prev.some((row) => row.id === next.id) ? prev.map((row) => (row.id === next.id ? next : row)) : [next, ...prev]));
          setDialogOpen(false);
          erpMessage('自动打标规则已保存');
        }}
      />
    </div>
  );
}
