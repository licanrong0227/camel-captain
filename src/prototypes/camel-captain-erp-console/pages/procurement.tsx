import React, { useMemo, useState } from 'react';
import {
  ErpButton,
  ErpDescriptions,
  ErpDrawer,
  ErpInput,
  ErpInputNumber,
  ErpSection,
  ErpSelect,
  ErpStatusTag,
  ErpSwitch,
  ErpTag,
  ErpTextarea,
  ErpTimeline,
  ErpUpload,
  erpConfirm,
  erpMessage,
} from '../components/ui';
import { FilterBar, ListPage, PageHeader, ProductCell } from '../components/ListPage';
import { ExportDialog, FormDialog } from '../components/dialogs/common';
import {
  EXCEPTIONS,
  EXCEPTION_STATUSES,
  EXCEPTION_TYPES,
  INBOUND_ORDERS,
  PURCHASE_ORDERS,
  PURCHASE_STATUSES,
  RECEIPT_ADDRESSES,
  SUPPLIERS,
  SUPPLIER_CATEGORIES,
  WAREHOUSE_OPTIONS,
  type ExceptionRecord,
  type InboundOrder,
  type PurchaseOrder,
  type ReceiptAddress,
  type Supplier,
} from '../data/procurement';
import { PRODUCT_IMAGES } from '../data/util';

function PurchaseDetailDrawer({ open, order, onClose }: { open: boolean; order: PurchaseOrder | null; onClose: () => void }) {
  if (!order) return null;
  return (
    <ErpDrawer open={open} title={`采购单详情 · ${order.poNo}`} width={720} onClose={onClose} footer={<ErpButton onClick={onClose}>关闭</ErpButton>}>
      <div className="erp-stack" style={{ gap: 18 }}>
        <div className="erp-detail-summary">
          <img src={order.image} alt="" />
          <div className="erp-detail-summary__body">
            <b>{order.title}</b>
            <span>SKU：{order.sku}</span>
            <span>{order.supplier} · {order.warehouse}</span>
          </div>
          <ErpStatusTag status={order.status} />
        </div>
        <ErpDescriptions
          columns={2}
          items={[
            { label: '采购单号', value: order.poNo },
            { label: '关联订单', value: order.orderNo },
            { label: '采购数量', value: `${order.qty} 件` },
            { label: '采购金额', value: `¥ ${order.amount.toFixed(2)}` },
            { label: '运费', value: `¥ ${order.freight.toFixed(2)}` },
            { label: '物流单号', value: order.trackingNo },
            { label: '下单时间', value: order.orderedAt },
            { label: '预计到货', value: order.eta },
          ]}
        />
        <ErpSection title="关联订单">
          <div className="erp-stack" style={{ gap: 8 }}>
            {order.relatedOrders.map((related) => (
              <div className="erp-flex-between" key={related.orderNo}>
                <span className="erp-code">{related.orderNo}</span>
                <span className="erp-small erp-muted">{related.buyer} · {related.qty} 件</span>
              </div>
            ))}
          </div>
        </ErpSection>
        <ErpSection title="采购时间线">
          <ErpTimeline
            items={[
              { time: order.orderedAt, title: '采购单创建', active: true },
              { time: order.orderedAt, title: '已下单给供应商', active: true },
              { time: order.status === '已发货' || order.status === '已入库' ? order.eta : '-', title: '供应商发货', active: ['已发货', '已入库', '部分入库'].includes(order.status) },
              { time: order.status === '已入库' ? order.eta : '-', title: '仓库入库', active: order.status === '已入库' },
            ]}
          />
        </ErpSection>
      </div>
    </ErpDrawer>
  );
}

export function PurchaseTrackingPage() {
  const [rows, setRows] = useState<PurchaseOrder[]>(PURCHASE_ORDERS);
  const [activeStatus, setActiveStatus] = useState('全部');
  const [keyword, setKeyword] = useState('');
  const [supplier, setSupplier] = useState('');
  const [warehouse, setWarehouse] = useState('');
  const [applied, setApplied] = useState({ keyword: '', supplier: '', warehouse: '' });
  const [detail, setDetail] = useState<PurchaseOrder | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState<PurchaseOrder | null>(null);
  const [exportOpen, setExportOpen] = useState(false);

  const counts = useMemo(() => {
    const map: Record<string, number> = { 全部: rows.length };
    PURCHASE_STATUSES.forEach((status) => {
      map[status] = rows.filter((row) => row.status === status).length;
    });
    return map;
  }, [rows]);

  const filtered = rows.filter(
    (row) =>
      (activeStatus === '全部' || row.status === activeStatus) &&
      (!applied.keyword || row.poNo.includes(applied.keyword) || row.orderNo.includes(applied.keyword) || row.title.toLowerCase().includes(applied.keyword.toLowerCase())) &&
      (!applied.supplier || row.supplier === applied.supplier) &&
      (!applied.warehouse || row.warehouse === applied.warehouse),
  );

  return (
    <div className="erp-page">
      <PageHeader title="采购单跟踪" description="跟踪采购下单、供应商发货与仓库到货，支持按订单展开关联采购明细。" extra={<ErpButton variant="primary" onClick={() => erpMessage('已打开新建采购单（演示）')}>新建采购单</ErpButton>} />
      <div className="erp-card" style={{ padding: '0 20px 0' }}>
        <div style={{ paddingTop: 14 }}>
          <FilterBar
            onQuery={() => setApplied({ keyword, supplier, warehouse })}
            onReset={() => { setKeyword(''); setSupplier(''); setWarehouse(''); setApplied({ keyword: '', supplier: '', warehouse: '' }); }}
            extra={<ErpButton onClick={() => setExportOpen(true)}>导出</ErpButton>}
          >
            <span className="erp-filter-field"><label>关键词</label><ErpInput value={keyword} onChange={setKeyword} onEnter={() => setApplied({ keyword, supplier, warehouse })} placeholder="采购单号 / 订单号 / 商品" style={{ width: 220 }} /></span>
            <span className="erp-filter-field"><label>供应商</label><ErpSelect options={SUPPLIERS.map((item) => ({ label: item.name, value: item.name }))} value={supplier} onChange={(value) => setSupplier(String(value))} clearable filterable width={180} /></span>
            <span className="erp-filter-field"><label>仓库</label><ErpSelect options={WAREHOUSE_OPTIONS} value={warehouse} onChange={(value) => setWarehouse(String(value))} clearable width={140} /></span>
          </FilterBar>
        </div>
        <ListPage
          header={null}
          tabs={[{ key: '全部', label: '全部', count: counts['全部'] || 0 }, ...PURCHASE_STATUSES.map((status) => ({ key: status, label: status, count: counts[status] || 0 }))]}
          activeTab={activeStatus}
          onTabChange={setActiveStatus}
          columns={[
            {
              key: 'poNo',
              title: '采购单',
              width: 200,
              render: (row) => (
                <div className="erp-stack">
                  <button type="button" className="erp-link" style={{ textAlign: 'left' }} onClick={(event) => { event.stopPropagation(); setDetail(row); setDetailOpen(true); }}>{row.poNo}</button>
                  <span className="erp-small erp-muted">{row.orderedAt.slice(0, 16)}</span>
                  <ErpStatusTag status={row.status} />
                </div>
              ),
            },
            { key: 'product', title: '采购商品', minWidth: 300, render: (row) => <ProductCell image={row.image} title={row.title} meta={<span>SKU：{row.sku}</span>} sub={<span>{row.supplier}</span>} /> },
            { key: 'qty', title: '数量', width: 80, align: 'right', render: (row) => `${row.qty} 件` },
            { key: 'amount', title: '采购金额', width: 120, align: 'right', sortable: true, render: (row) => <span className="erp-amount">¥ {row.amount.toFixed(2)}</span> },
            { key: 'warehouse', title: '仓库', width: 110 },
            { key: 'eta', title: '预计到货', width: 110 },
            { key: 'trackingNo', title: '物流单号', width: 150, render: (row) => <span className="erp-code">{row.trackingNo}</span> },
            { key: 'related', title: '关联订单', width: 90, render: (row) => <button type="button" className="erp-link" onClick={(event) => { event.stopPropagation(); setDetail(row); setDetailOpen(true); }}>{row.relatedOrders.length} 个</button> },
          ]}
          rows={filtered}
          rowKey={(row) => row.id}
          selectable
          sortable
          filterKey={`${activeStatus}-${applied.keyword}-${applied.supplier}-${applied.warehouse}`}
          crossPageTotal={filtered.length}
          rowActions={(row) => [
            { label: '详情', onClick: () => { setDetail(row); setDetailOpen(true); } },
            { label: '编辑', onClick: () => { setEditRow(row); setEditOpen(true); } },
            { label: '确认入库', onClick: () => { setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, status: '已入库' } : item))); erpMessage('已确认入库（演示）'); } },
            { label: '取消采购', danger: true, onClick: async () => { if (await erpConfirm({ content: `确定取消采购单 ${row.poNo} 吗？`, danger: true })) { setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, status: '已取消' } : item))); erpMessage('采购单已取消（演示）'); } } },
          ]}
          batchActions={(selected) => [
            { label: '批量采购', onClick: () => erpMessage(`已向供应商下单 ${selected.length} 个采购单（演示）`) },
            { label: '批量打印', onClick: () => erpMessage(`已生成 ${selected.length} 个采购单打印任务（演示）`) },
            { label: '导出', onClick: () => setExportOpen(true) },
            { label: '删除', danger: true, onClick: async () => { if (await erpConfirm({ content: `确定删除选中的 ${selected.length} 个采购单吗？`, danger: true })) { setRows((prev) => prev.filter((row) => !selected.some((target) => target.id === row.id))); erpMessage('已删除（演示）'); } } },
          ]}
        />
      </div>
      <PurchaseDetailDrawer open={detailOpen} order={detail} onClose={() => setDetailOpen(false)} />
      <FormDialog
        open={editOpen}
        title="编辑采购单"
        width={640}
        fields={[
          { key: 'poNo', label: '采购单号', required: true },
          { key: 'supplier', label: '供应商', type: 'select', required: true, options: SUPPLIERS.map((item) => ({ label: item.name, value: item.name })) },
          { key: 'qty', label: '采购数量', type: 'number', min: 1 },
          { key: 'amount', label: '采购金额', type: 'number', precision: 2 },
          { key: 'warehouse', label: '仓库', type: 'select', options: WAREHOUSE_OPTIONS },
          { key: 'eta', label: '预计到货', type: 'date' },
          { key: 'trackingNo', label: '物流单号' },
        ]}
        initial={editRow ? { poNo: editRow.poNo, supplier: editRow.supplier, qty: editRow.qty, amount: editRow.amount, warehouse: editRow.warehouse, eta: editRow.eta, trackingNo: editRow.trackingNo } : {}}
        onClose={() => setEditOpen(false)}
        onSubmit={() => { setEditOpen(false); erpMessage('采购单已保存（演示）'); }}
      />
      <ExportDialog open={exportOpen} fields={[{ key: 'poNo', label: '采购单号' }, { key: 'orderNo', label: '关联订单' }, { key: 'supplier', label: '供应商' }, { key: 'qty', label: '数量' }, { key: 'amount', label: '采购金额' }, { key: 'status', label: '状态' }, { key: 'eta', label: '预计到货' }]} onClose={() => setExportOpen(false)} onConfirm={() => { setExportOpen(false); erpMessage('导出任务已创建（演示）'); }} />
    </div>
  );
}

export function InboundOutboundPage() {
  const [rows, setRows] = useState<InboundOrder[]>(INBOUND_ORDERS);
  const [activeType, setActiveType] = useState('全部');
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const [applied, setApplied] = useState({ keyword: '', status: '' });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmRow, setConfirmRow] = useState<InboundOrder | null>(null);

  const filtered = rows.filter(
    (row) =>
      (activeType === '全部' || row.type === activeType) &&
      (!applied.keyword || row.no.includes(applied.keyword) || row.relatedNo.includes(applied.keyword)) &&
      (!applied.status || row.status === applied.status),
  );

  return (
    <div className="erp-page">
      <PageHeader title="出入库管理" description="管理采购入库、订单出库与库存差异确认。" extra={<ErpButton variant="primary" onClick={() => erpMessage('已打开新建出入库单（演示）')}>新建单据</ErpButton>} />
      <div className="erp-card" style={{ padding: '0 20px 0' }}>
        <div style={{ paddingTop: 14 }}>
          <FilterBar
            onQuery={() => setApplied({ keyword, status })}
            onReset={() => { setKeyword(''); setStatus(''); setApplied({ keyword: '', status: '' }); }}
          >
            <span className="erp-filter-field"><label>单号</label><ErpInput value={keyword} onChange={setKeyword} onEnter={() => setApplied({ keyword, status })} placeholder="出入库单号 / 关联单号" style={{ width: 210 }} /></span>
            <span className="erp-filter-field"><label>状态</label><ErpSelect options={['待入库', '部分入库', '已入库', '待出库', '已出库', '已取消', '异常'].map((value) => ({ label: value, value }))} value={status} onChange={(value) => setStatus(String(value))} clearable width={140} /></span>
          </FilterBar>
        </div>
        <ListPage
          header={null}
          tabs={[{ key: '全部', label: '全部', count: rows.length }, { key: '入库', label: '入库', count: rows.filter((row) => row.type === '入库').length }, { key: '出库', label: '出库', count: rows.filter((row) => row.type === '出库').length }]}
          activeTab={activeType}
          onTabChange={setActiveType}
          columns={[
            { key: 'no', title: '单据号', width: 160, render: (row) => <span className="erp-code">{row.no}</span> },
            { key: 'type', title: '类型', width: 80, render: (row) => <ErpTag tone={row.type === '入库' ? 'info' : 'brand'}>{row.type}</ErpTag> },
            { key: 'warehouse', title: '仓库', width: 120 },
            { key: 'relatedNo', title: '关联单号', width: 160, render: (row) => <span className="erp-code">{row.relatedNo}</span> },
            { key: 'skuCount', title: 'SKU 数', width: 80, align: 'right' },
            { key: 'qty', title: '件数', width: 80, align: 'right' },
            { key: 'status', title: '状态', width: 100, render: (row) => <ErpStatusTag status={row.status} /> },
            { key: 'operator', title: '操作人', width: 100 },
            { key: 'time', title: '时间', width: 160 },
          ]}
          rows={filtered}
          rowKey={(row) => row.id}
          selectable
          filterKey={`${activeType}-${applied.keyword}-${applied.status}`}
          rowActions={(row) => [
            { label: '详情', onClick: () => erpMessage(`查看单据 ${row.no}（演示）`) },
            { label: row.type === '入库' ? '确认入库' : '确认出库', onClick: () => { setConfirmRow(row); setConfirmOpen(true); } },
            { label: '打印', onClick: () => erpMessage(`已生成 ${row.no} 打印任务（演示）`) },
          ]}
          batchActions={(selected) => [
            { label: '批量确认', onClick: () => erpMessage(`已确认 ${selected.length} 个单据（演示）`) },
            { label: '批量打印', onClick: () => erpMessage(`已生成 ${selected.length} 个打印任务（演示）`) },
            { label: '导出', onClick: () => erpMessage('导出任务已创建（演示）') },
          ]}
        />
      </div>
      <FormDialog
        open={confirmOpen}
        title={confirmRow?.type === '出库' ? '确认出库' : '确认入库'}
        width={600}
        fields={[
          { key: 'no', label: '单据号', placeholder: confirmRow?.no },
          { key: 'actualQty', label: '实收 / 实发数量', type: 'number', required: true, min: 1 },
          { key: 'diff', label: '差异原因', type: 'select', options: ['无差异', '供应商少发', '运输破损', '仓库盘点差异', '其他'].map((value) => ({ label: value, value })) },
          { key: 'note', label: '备注', type: 'textarea' },
        ]}
        initial={{ no: confirmRow?.no, actualQty: confirmRow?.qty || 1, diff: '无差异' }}
        onClose={() => setConfirmOpen(false)}
        onSubmit={() => {
          if (confirmRow) {
            setRows((prev) => prev.map((item) => (item.id === confirmRow.id ? { ...item, status: confirmRow.type === '入库' ? '已入库' : '已出库' } : item)));
          }
          setConfirmOpen(false);
          erpMessage(`${confirmRow?.type === '出库' ? '出库' : '入库'}已确认（演示）`);
        }}
      />
    </div>
  );
}

export function OutboundExceptionPage() {
  const [rows, setRows] = useState<ExceptionRecord[]>(EXCEPTIONS);
  const [activeStatus, setActiveStatus] = useState('全部');
  const [type, setType] = useState('');
  const [keyword, setKeyword] = useState('');
  const [applied, setApplied] = useState({ type: '', keyword: '' });
  const [handleOpen, setHandleOpen] = useState(false);
  const [handleRows, setHandleRows] = useState<ExceptionRecord[]>([]);
  const [method, setMethod] = useState('补发');

  const filtered = rows.filter(
    (row) =>
      (activeStatus === '全部' || row.status === activeStatus) &&
      (!applied.type || row.type === applied.type) &&
      (!applied.keyword || row.no.includes(applied.keyword) || row.orderNo.includes(applied.keyword)),
  );

  const handle = (targets: ExceptionRecord[], nextStatus = '已处理') => {
    setRows((prev) => prev.map((row) => (targets.some((target) => target.id === row.id) ? { ...row, status: nextStatus, handler: 'admin' } : row)));
    erpMessage(`已${nextStatus === '已忽略' ? '忽略' : '处理'} ${targets.length} 条异常（演示）`);
  };

  return (
    <div className="erp-page">
      <PageHeader title="出库异常" description="处理缺货、超卖、地址异常等出库问题，支持补发、退款、换货与忽略。" />
      <div className="erp-card" style={{ padding: '0 20px 0' }}>
        <div style={{ paddingTop: 14 }}>
          <FilterBar onQuery={() => setApplied({ type, keyword })} onReset={() => { setType(''); setKeyword(''); setApplied({ type: '', keyword: '' }); }}>
            <span className="erp-filter-field"><label>异常类型</label><ErpSelect options={EXCEPTION_TYPES.map((value) => ({ label: value, value }))} value={type} onChange={(value) => setType(String(value))} clearable width={150} /></span>
            <span className="erp-filter-field"><label>单号</label><ErpInput value={keyword} onChange={setKeyword} onEnter={() => setApplied({ type, keyword })} placeholder="异常单号 / 订单号" style={{ width: 190 }} /></span>
          </FilterBar>
        </div>
        <ListPage
          header={null}
          tabs={[{ key: '全部', label: '全部', count: rows.length }, ...EXCEPTION_STATUSES.map((status) => ({ key: status, label: status, count: rows.filter((row) => row.status === status).length }))]}
          activeTab={activeStatus}
          onTabChange={setActiveStatus}
          columns={[
            { key: 'no', title: '异常单号', width: 160, render: (row) => <span className="erp-code">{row.no}</span> },
            { key: 'orderNo', title: '订单号', width: 160, render: (row) => <span className="erp-code">{row.orderNo}</span> },
            { key: 'product', title: '商品', minWidth: 280, render: (row) => <ProductCell image={row.image} title={row.product} /> },
            { key: 'type', title: '异常类型', width: 110, render: (row) => <ErpTag tone="warning">{row.type}</ErpTag> },
            { key: 'desc', title: '异常描述', minWidth: 240, render: (row) => <span className="erp-small">{row.desc}</span> },
            { key: 'foundAt', title: '发现时间', width: 160 },
            { key: 'status', title: '状态', width: 100, render: (row) => <ErpStatusTag status={row.status} /> },
            { key: 'handler', title: '处理人', width: 90 },
          ]}
          rows={filtered}
          rowKey={(row) => row.id}
          selectable
          filterKey={`${activeStatus}-${applied.type}-${applied.keyword}`}
          rowActions={(row) => [
            { label: '处理', onClick: () => { setHandleRows([row]); setHandleOpen(true); } },
            { label: '忽略', onClick: async () => { if (await erpConfirm({ content: '忽略后该异常不再提醒，确定忽略吗？' })) handle([row], '已忽略'); } },
            { label: '详情', onClick: () => erpMessage(`查看异常详情 ${row.no}（演示）`) },
          ]}
          batchActions={(selected) => [
            { label: '批量处理', onClick: () => { setHandleRows(selected); setHandleOpen(true); } },
            { label: '批量忽略', onClick: async () => { if (await erpConfirm({ content: `确定忽略选中的 ${selected.length} 条异常吗？` })) handle(selected, '已忽略'); } },
            { label: '导出', onClick: () => erpMessage('导出任务已创建（演示）') },
          ]}
        />
      </div>
      <FormDialog
        open={handleOpen}
        title={`处理异常（${handleRows.length}）`}
        width={600}
        fields={[
          { key: 'method', label: '处理方式', type: 'radio', options: ['补发', '退款', '换货', '忽略'].map((value) => ({ label: value, value })) },
          { key: 'note', label: '处理说明', type: 'textarea', required: true, placeholder: '请说明处理方案' },
        ]}
        initial={{ method: '补发' }}
        onClose={() => setHandleOpen(false)}
        extra={<div style={{ marginTop: 16 }}><ErpUpload files={[]} onAdd={(files) => erpMessage(`已上传 ${files.length} 个处理凭证（演示）`)} label="上传凭证" /></div>}
        onSubmit={(values) => {
          setMethod(String(values.method));
          handle(handleRows, '已处理');
          setHandleOpen(false);
        }}
      />
    </div>
  );
}

export function SupplierPage() {
  const [rows, setRows] = useState<Supplier[]>(SUPPLIERS);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const [applied, setApplied] = useState({ keyword: '', status: '' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [current, setCurrent] = useState<Supplier | null>(null);
  const [recordsOpen, setRecordsOpen] = useState(false);
  const [recordsSupplier, setRecordsSupplier] = useState<Supplier | null>(null);
  const [exportOpen, setExportOpen] = useState(false);

  const filtered = rows.filter((row) => (!applied.keyword || row.name.includes(applied.keyword) || row.code.includes(applied.keyword) || row.contact.includes(applied.keyword)) && (!applied.status || row.status === applied.status));

  return (
    <div className="erp-page">
      <PageHeader title="供应商管理" description="维护供应商基础信息、合作品类与结算方式。" extra={<ErpButton variant="primary" onClick={() => { setCurrent(null); setDialogOpen(true); }}>新增供应商</ErpButton>} />
      <div className="erp-card" style={{ padding: 20 }}>
        <FilterBar onQuery={() => setApplied({ keyword, status })} onReset={() => { setKeyword(''); setStatus(''); setApplied({ keyword: '', status: '' }); }} extra={<ErpButton onClick={() => setExportOpen(true)}>导出</ErpButton>}>
          <span className="erp-filter-field"><label>关键词</label><ErpInput value={keyword} onChange={setKeyword} onEnter={() => setApplied({ keyword, status })} placeholder="名称 / 编码 / 联系人" style={{ width: 210 }} /></span>
          <span className="erp-filter-field"><label>状态</label><ErpSelect options={[{ label: '合作中', value: '合作中' }, { label: '暂停合作', value: '暂停合作' }, { label: '已停用', value: '已停用' }]} value={status} onChange={(value) => setStatus(String(value))} clearable width={130} /></span>
        </FilterBar>
        <ListPage
          header={null}
          columns={[
            { key: 'code', title: '编码', width: 100, render: (row) => <span className="erp-code">{row.code}</span> },
            { key: 'name', title: '供应商名称', minWidth: 200 },
            { key: 'contact', title: '联系人', width: 100 },
            { key: 'phone', title: '电话', width: 130 },
            { key: 'category', title: '合作品类', width: 100 },
            { key: 'settlement', title: '结算方式', width: 120 },
            { key: 'address', title: '地址', minWidth: 220, render: (row) => <span className="erp-small erp-muted erp-clamp-1">{row.address}</span> },
            { key: 'status', title: '状态', width: 100, render: (row) => <ErpStatusTag status={row.status} /> },
            { key: 'createdAt', title: '创建时间', width: 110 },
          ]}
          rows={filtered}
          rowKey={(row) => row.id}
          selectable
          filterKey={`${applied.keyword}-${applied.status}`}
          rowActions={(row) => [
            { label: '编辑', onClick: () => { setCurrent(row); setDialogOpen(true); } },
            { label: '采购记录', onClick: () => { setRecordsSupplier(row); setRecordsOpen(true); } },
            { label: row.status === '合作中' ? '暂停合作' : '恢复合作', onClick: () => { setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, status: item.status === '合作中' ? '暂停合作' : '合作中' } : item))); erpMessage('供应商状态已更新（演示）'); } },
            { label: '删除', danger: true, onClick: async () => { if (await erpConfirm({ content: `确定删除供应商「${row.name}」吗？`, danger: true })) { setRows((prev) => prev.filter((item) => item.id !== row.id)); erpMessage('已删除（演示）'); } } },
          ]}
          batchActions={(selected) => [
            { label: '批量启用', onClick: () => { setRows((prev) => prev.map((row) => (selected.some((target) => target.id === row.id) ? { ...row, status: '合作中' } : row))); erpMessage('已批量启用（演示）'); } },
            { label: '批量停用', onClick: () => { setRows((prev) => prev.map((row) => (selected.some((target) => target.id === row.id) ? { ...row, status: '已停用' } : row))); erpMessage('已批量停用（演示）'); } },
            { label: '导出', onClick: () => setExportOpen(true) },
            { label: '删除', danger: true, onClick: async () => { if (await erpConfirm({ content: `确定删除选中的 ${selected.length} 个供应商吗？`, danger: true })) { setRows((prev) => prev.filter((row) => !selected.some((target) => target.id === row.id))); erpMessage('已删除（演示）'); } } },
          ]}
        />
      </div>
      <FormDialog
        open={dialogOpen}
        title={current ? '编辑供应商' : '新增供应商'}
        width={760}
        fields={[
          { key: 'name', label: '供应商名称', required: true },
          { key: 'code', label: '供应商编码', required: true },
          { key: 'contact', label: '联系人', required: true },
          { key: 'phone', label: '联系电话', required: true },
          { key: 'category', label: '合作品类', type: 'select', options: SUPPLIER_CATEGORIES.map((value) => ({ label: value, value })) },
          { key: 'settlement', label: '结算方式', type: 'select', options: ['现结', '预付 30%', '预付 50%', '月结 15 天', '月结 30 天'].map((value) => ({ label: value, value })) },
          { key: 'address', label: '地址', type: 'textarea' },
          { key: 'status', label: '状态', type: 'select', options: ['合作中', '暂停合作', '已停用'].map((value) => ({ label: value, value })) },
        ]}
        initial={current ? { name: current.name, code: current.code, contact: current.contact, phone: current.phone, category: current.category, settlement: current.settlement, address: current.address, status: current.status } : { status: '合作中' }}
        onClose={() => setDialogOpen(false)}
        onSubmit={(values) => {
          const next: Supplier = {
            id: current?.id || `S${String(rows.length + 1).padStart(3, '0')}`,
            code: String(values.code || ''),
            name: String(values.name || ''),
            contact: String(values.contact || ''),
            phone: String(values.phone || ''),
            address: String(values.address || ''),
            category: String(values.category || '综合'),
            settlement: String(values.settlement || '现结'),
            status: String(values.status || '合作中'),
            createdAt: current?.createdAt || '2026-10-31',
          };
          setRows((prev) => (current ? prev.map((row) => (row.id === current.id ? next : row)) : [next, ...prev]));
          setDialogOpen(false);
          erpMessage('供应商已保存（演示）');
        }}
      />
      <ErpDrawer open={recordsOpen} title={`采购记录 · ${recordsSupplier?.name || ''}`} width={640} onClose={() => setRecordsOpen(false)}>
        <div className="erp-stack" style={{ gap: 10 }}>
          {PURCHASE_ORDERS.filter((order) => order.supplier === recordsSupplier?.name).slice(0, 8).map((order) => (
            <div key={order.id} className="erp-flex-between" style={{ padding: 12, border: '1px solid #EBEEF5', borderRadius: 4 }}>
              <div><b style={{ fontSize: 12 }}>{order.poNo}</b><p className="erp-small erp-muted">{order.title}</p></div>
              <div style={{ textAlign: 'right' }}><span className="erp-amount">¥ {order.amount.toFixed(2)}</span><p className="erp-small"><ErpStatusTag status={order.status} /></p></div>
            </div>
          ))}
        </div>
      </ErpDrawer>
      <ExportDialog open={exportOpen} fields={[{ key: 'code', label: '供应商编码' }, { key: 'name', label: '名称' }, { key: 'contact', label: '联系人' }, { key: 'phone', label: '电话' }, { key: 'category', label: '合作品类' }, { key: 'settlement', label: '结算方式' }, { key: 'status', label: '状态' }]} onClose={() => setExportOpen(false)} onConfirm={() => { setExportOpen(false); erpMessage('导出任务已创建（演示）'); }} />
    </div>
  );
}

export function ReceiptAddressPage() {
  const [rows, setRows] = useState<ReceiptAddress[]>(RECEIPT_ADDRESSES);
  const [keyword, setKeyword] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [current, setCurrent] = useState<ReceiptAddress | null>(null);

  const filtered = rows.filter((row) => !appliedKeyword || row.name.includes(appliedKeyword) || row.phone.includes(appliedKeyword) || `${row.province}${row.city}${row.district}${row.detail}`.includes(appliedKeyword));

  return (
    <div className="erp-page">
      <PageHeader title="收货地址管理" description="维护采购收货地址，供采购单与仓库入库使用。" extra={<ErpButton variant="primary" onClick={() => { setCurrent(null); setDialogOpen(true); }}>新增收货地址</ErpButton>} />
      <div className="erp-card" style={{ padding: 20 }}>
        <FilterBar onQuery={() => setAppliedKeyword(keyword)} onReset={() => { setKeyword(''); setAppliedKeyword(''); }}>
          <span className="erp-filter-field"><label>关键词</label><ErpInput value={keyword} onChange={setKeyword} onEnter={() => setAppliedKeyword(keyword)} placeholder="收货人 / 电话 / 地址" style={{ width: 240 }} /></span>
        </FilterBar>
        <ListPage
          header={null}
          columns={[
            { key: 'name', title: '收货人', width: 100 },
            { key: 'phone', title: '电话', width: 130 },
            { key: 'address', title: '收货地址', minWidth: 320, render: (row) => <span>{row.province} {row.city} {row.district} {row.detail}</span> },
            { key: 'postcode', title: '邮编', width: 90 },
            { key: 'warehouse', title: '关联仓库', width: 110 },
            { key: 'isDefault', title: '默认', width: 80, render: (row) => row.isDefault ? <ErpTag tone="brand">默认</ErpTag> : <span className="erp-muted">-</span> },
            { key: 'status', title: '状态', width: 80, render: (row) => <ErpStatusTag status={row.status} /> },
          ]}
          rows={filtered}
          rowKey={(row) => row.id}
          filterKey={appliedKeyword}
          rowActions={(row) => [
            { label: '编辑', onClick: () => { setCurrent(row); setDialogOpen(true); } },
            { label: '设为默认', onClick: () => { setRows((prev) => prev.map((item) => ({ ...item, isDefault: item.id === row.id }))); erpMessage('已设为默认地址（演示）'); } },
            { label: '删除', danger: true, onClick: async () => { if (await erpConfirm({ content: `确定删除「${row.name}」的收货地址吗？`, danger: true })) { setRows((prev) => prev.filter((item) => item.id !== row.id)); erpMessage('已删除（演示）'); } } },
          ]}
        />
      </div>
      <FormDialog
        open={dialogOpen}
        title={current ? '编辑收货地址' : '新增收货地址'}
        width={720}
        fields={[
          { key: 'name', label: '收货人', required: true },
          { key: 'phone', label: '联系电话', required: true },
          { key: 'province', label: '省份', required: true },
          { key: 'city', label: '城市', required: true },
          { key: 'district', label: '区县', required: true },
          { key: 'postcode', label: '邮编' },
          { key: 'warehouse', label: '关联仓库', type: 'select', options: WAREHOUSE_OPTIONS.map((item) => ({ label: item.label, value: item.label })) },
          { key: 'status', label: '状态', type: 'select', options: [{ label: '启用', value: '启用' }, { label: '停用', value: '停用' }] },
          { key: 'detail', label: '详细地址', type: 'textarea', required: true },
          { key: 'isDefault', label: '设为默认', type: 'switch' },
        ]}
        initial={current ? { ...current } : { status: '启用', isDefault: false, warehouse: '深圳仓' }}
        onClose={() => setDialogOpen(false)}
        onSubmit={(values) => {
          const next: ReceiptAddress = {
            id: current?.id || `RA${String(rows.length + 1).padStart(3, '0')}`,
            name: String(values.name || ''),
            phone: String(values.phone || ''),
            province: String(values.province || ''),
            city: String(values.city || ''),
            district: String(values.district || ''),
            detail: String(values.detail || ''),
            postcode: String(values.postcode || ''),
            isDefault: Boolean(values.isDefault),
            status: String(values.status || '启用'),
            warehouse: String(values.warehouse || '深圳仓'),
          };
          setRows((prev) => (current ? prev.map((row) => (row.id === current.id ? next : row)) : [next, ...prev]));
          setDialogOpen(false);
          erpMessage('收货地址已保存（演示）');
        }}
      />
    </div>
  );
}
