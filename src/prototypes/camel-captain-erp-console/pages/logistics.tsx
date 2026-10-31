import React, { useMemo, useState } from 'react';
import {
  ErpButton,
  ErpDescriptions,
  ErpDrawer,
  ErpInput,
  ErpSection,
  ErpSelect,
  ErpStatusTag,
  ErpSwitch,
  ErpTag,
  ErpTimeline,
  erpConfirm,
  erpMessage,
} from '../components/ui';
import { FilterBar, ListPage, PageHeader } from '../components/ListPage';
import { ExportDialog, FormDialog } from '../components/dialogs/common';
import {
  CHANNELS,
  COMMON_ADDRESSES,
  PROVIDERS,
  SHIPMENTS,
  type Channel,
  type CommonAddress,
  type Provider,
  type Shipment,
} from '../data/logistics';
import { COUNTRY_OPTIONS } from '../data/util';

export function LogisticsProviderPage() {
  const [providers, setProviders] = useState<Provider[]>(PROVIDERS);
  const [channels, setChannels] = useState<Channel[]>(CHANNELS);
  const [tab, setTab] = useState('provider');
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const [applied, setApplied] = useState({ keyword: '', status: '' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [current, setCurrent] = useState<Provider | null>(null);
  const [channelOpen, setChannelOpen] = useState(false);
  const [channelProvider, setChannelProvider] = useState<Provider | null>(null);

  const providerRows = providers.filter((row) => (!applied.keyword || row.name.includes(applied.keyword) || row.code.includes(applied.keyword)) && (!applied.status || (applied.status === '启用' ? row.status : !row.status)));
  const channelRows = channels.filter((row) => !applied.keyword || row.name.includes(applied.keyword) || row.provider.includes(applied.keyword));

  return (
    <div className="erp-page">
      <PageHeader title="物流商管理" description="管理物流商、对接方式与渠道配置，渠道可绑定到订单发货。" extra={<ErpButton variant="primary" onClick={() => { setCurrent(null); setDialogOpen(true); }}>新增物流商</ErpButton>} />
      <div className="erp-card" style={{ padding: '0 20px 0' }}>
        <div style={{ paddingTop: 14 }}>
          <FilterBar onQuery={() => setApplied({ keyword, status })} onReset={() => { setKeyword(''); setStatus(''); setApplied({ keyword: '', status: '' }); }}>
            <span className="erp-filter-field"><label>关键词</label><ErpInput value={keyword} onChange={setKeyword} onEnter={() => setApplied({ keyword, status })} placeholder="物流商 / 渠道名称" style={{ width: 220 }} /></span>
            <span className="erp-filter-field"><label>状态</label><ErpSelect options={[{ label: '启用', value: '启用' }, { label: '停用', value: '停用' }]} value={status} onChange={(value) => setStatus(String(value))} clearable width={120} /></span>
          </FilterBar>
        </div>
        {tab === 'provider' ? (
          <ListPage
            header={null}
            tabs={[{ key: 'provider', label: '物流商列表', count: providers.length }, { key: 'channel', label: '渠道列表', count: channels.length }]}
            activeTab={tab}
            onTabChange={setTab}
            columns={[
              { key: 'name', title: '物流商', minWidth: 180 },
              { key: 'code', title: '代码', width: 120, render: (row) => <span className="erp-code">{row.code}</span> },
              { key: 'countries', title: '支持国家', minWidth: 180 },
              { key: 'channels', title: '渠道数', width: 80, align: 'right' },
              { key: 'integration', title: '对接方式', width: 110, render: (row) => <ErpTag tone={row.integration === 'API 对接' ? 'info' : 'neutral'}>{row.integration}</ErpTag> },
              { key: 'status', title: '状态', width: 80, render: (row) => <ErpSwitch checked={row.status} onChange={(checked) => setProviders((prev) => prev.map((item) => (item.id === row.id ? { ...item, status: checked } : item)))} /> },
              { key: 'updatedAt', title: '更新时间', width: 160 },
            ]}
            rows={providerRows}
            rowKey={(row) => row.id}
            filterKey={`${applied.keyword}-${applied.status}`}
            rowActions={(row) => [
              { label: '编辑', onClick: () => { setCurrent(row); setDialogOpen(true); } },
              { label: '配置渠道', onClick: () => { setChannelProvider(row); setChannelOpen(true); } },
              { label: row.status ? '停用' : '启用', onClick: () => { setProviders((prev) => prev.map((item) => (item.id === row.id ? { ...item, status: !item.status } : item))); erpMessage('物流商状态已更新（演示）'); } },
              { label: '删除', danger: true, onClick: async () => { if (await erpConfirm({ content: `确定删除物流商「${row.name}」吗？`, danger: true })) { setProviders((prev) => prev.filter((item) => item.id !== row.id)); erpMessage('已删除（演示）'); } } },
            ]}
          />
        ) : (
          <ListPage
            header={null}
            tabs={[{ key: 'provider', label: '物流商列表', count: providers.length }, { key: 'channel', label: '渠道列表', count: channels.length }]}
            activeTab={tab}
            onTabChange={setTab}
            columns={[
              { key: 'name', title: '渠道名称', minWidth: 200 },
              { key: 'provider', title: '物流商', width: 130 },
              { key: 'eta', title: '时效', width: 120 },
              { key: 'billing', title: '计费方式', width: 120 },
              { key: 'countries', title: '支持国家', minWidth: 180 },
              { key: 'status', title: '状态', width: 80, render: (row) => <ErpSwitch checked={row.status} onChange={(checked) => setChannels((prev) => prev.map((item) => (item.id === row.id ? { ...item, status: checked } : item)))} /> },
            ]}
            rows={channelRows}
            rowKey={(row) => row.id}
            filterKey={applied.keyword}
            rowActions={(row) => [
              { label: '编辑', onClick: () => erpMessage(`编辑渠道 ${row.name}（演示）`) },
              { label: row.status ? '停用' : '启用', onClick: () => { setChannels((prev) => prev.map((item) => (item.id === row.id ? { ...item, status: !item.status } : item))); erpMessage('渠道状态已更新（演示）'); } },
            ]}
          />
        )}
      </div>
      <FormDialog
        open={dialogOpen}
        title={current ? '编辑物流商' : '新增物流商'}
        width={680}
        fields={[
          { key: 'name', label: '物流商名称', required: true },
          { key: 'code', label: '物流商代码', required: true },
          { key: 'countries', label: '支持国家', required: true },
          { key: 'integration', label: '对接方式', type: 'select', options: [{ label: 'API 对接', value: 'API 对接' }, { label: '线下录入', value: '线下录入' }] },
          { key: 'apiKey', label: 'API Key', type: 'password' },
          { key: 'status', label: '启用状态', type: 'switch' },
        ]}
        initial={current ? { name: current.name, code: current.code, countries: current.countries, integration: current.integration, status: current.status } : { integration: 'API 对接', status: true }}
        onClose={() => setDialogOpen(false)}
        onSubmit={(values) => {
          const next: Provider = {
            id: current?.id || `LP${String(providers.length + 1).padStart(3, '0')}`,
            name: String(values.name || ''),
            code: String(values.code || ''),
            countries: String(values.countries || ''),
            channels: current?.channels || 0,
            integration: String(values.integration || 'API 对接'),
            status: Boolean(values.status),
            updatedAt: '2026-10-31 10:00:00',
          };
          setProviders((prev) => (current ? prev.map((row) => (row.id === current.id ? next : row)) : [next, ...prev]));
          setDialogOpen(false);
          erpMessage('物流商已保存（演示）');
        }}
      />
      <ErpDrawer open={channelOpen} title={`渠道配置 · ${channelProvider?.name || ''}`} width={720} onClose={() => setChannelOpen(false)} footer={<ErpButton variant="primary" onClick={() => { setChannelOpen(false); erpMessage('渠道配置已保存（演示）'); }}>保存配置</ErpButton>}>
        <div className="erp-stack" style={{ gap: 10 }}>
          {channels.filter((channel) => channel.provider === channelProvider?.name).map((channel) => (
            <div key={channel.id} className="erp-flex-between" style={{ padding: 12, border: '1px solid #EBEEF5', borderRadius: 4 }}>
              <div>
                <b style={{ fontSize: 13 }}>{channel.name}</b>
                <p className="erp-small erp-muted">{channel.eta} · {channel.billing} · {channel.countries}</p>
              </div>
              <ErpSwitch checked={channel.status} onChange={(checked) => setChannels((prev) => prev.map((item) => (item.id === channel.id ? { ...item, status: checked } : item)))} />
            </div>
          ))}
        </div>
      </ErpDrawer>
    </div>
  );
}

export function InternationalTrackingPage() {
  const [rows, setRows] = useState<Shipment[]>(SHIPMENTS);
  const [keyword, setKeyword] = useState('');
  const [provider, setProvider] = useState('');
  const [country, setCountry] = useState('');
  const [status, setStatus] = useState('');
  const [applied, setApplied] = useState({ keyword: '', provider: '', country: '', status: '' });
  const [detail, setDetail] = useState<Shipment | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const filtered = rows.filter(
    (row) =>
      (!applied.keyword || row.trackingNo.includes(applied.keyword) || row.orderNo.includes(applied.keyword)) &&
      (!applied.provider || row.provider === applied.provider) &&
      (!applied.country || row.country === applied.country) &&
      (!applied.status || row.status === applied.status),
  );

  return (
    <div className="erp-page">
      <PageHeader title="国际物流轨迹跟踪" description="跟踪国际运单的揽收、起飞、清关、派送与签收节点。" extra={<ErpButton onClick={() => erpMessage('批量刷新轨迹（演示）')}>批量刷新</ErpButton>} />
      <div className="erp-card" style={{ padding: 20 }}>
        <FilterBar onQuery={() => setApplied({ keyword, provider, country, status })} onReset={() => { setKeyword(''); setProvider(''); setCountry(''); setStatus(''); setApplied({ keyword: '', provider: '', country: '', status: '' }); }} extra={<ErpButton onClick={() => setExportOpen(true)}>导出</ErpButton>}>
          <span className="erp-filter-field"><label>运单 / 订单</label><ErpInput value={keyword} onChange={setKeyword} onEnter={() => setApplied({ keyword, provider, country, status })} placeholder="运单号 / 订单号" style={{ width: 200 }} /></span>
          <span className="erp-filter-field"><label>物流商</label><ErpSelect options={PROVIDERS.map((item) => ({ label: item.name, value: item.name }))} value={provider} onChange={(value) => setProvider(String(value))} clearable width={150} /></span>
          <span className="erp-filter-field"><label>目的国</label><ErpSelect options={COUNTRY_OPTIONS.map((item) => ({ label: item.label, value: item.label }))} value={country} onChange={(value) => setCountry(String(value))} clearable width={130} /></span>
          <span className="erp-filter-field"><label>状态</label><ErpSelect options={['已上网', '运输中', '派送中', '已签收', '异常'].map((value) => ({ label: value, value }))} value={status} onChange={(value) => setStatus(String(value))} clearable width={120} /></span>
        </FilterBar>
        <ListPage
          header={null}
          columns={[
            { key: 'trackingNo', title: '运单号', width: 170, render: (row) => <span className="erp-code">{row.trackingNo}</span> },
            { key: 'orderNo', title: '订单号', width: 160, render: (row) => <span className="erp-code">{row.orderNo}</span> },
            { key: 'provider', title: '物流商 / 渠道', width: 190, render: (row) => <div className="erp-stack erp-small"><span>{row.provider}</span><span className="erp-muted">{row.channel}</span></div> },
            { key: 'country', title: '目的国', width: 90 },
            { key: 'receiver', title: '收件人', width: 140 },
            { key: 'lastEvent', title: '最新轨迹', minWidth: 220, render: (row) => <span className="erp-small">{row.lastEvent}</span> },
            { key: 'status', title: '状态', width: 100, render: (row) => <ErpStatusTag status={row.status} /> },
            { key: 'updatedAt', title: '更新时间', width: 160 },
          ]}
          rows={filtered}
          rowKey={(row) => row.id}
          selectable
          filterKey={`${applied.keyword}-${applied.provider}-${applied.country}-${applied.status}`}
          rowActions={(row) => [
            { label: '查看轨迹', onClick: () => { setDetail(row); setDetailOpen(true); } },
            { label: '复制运单号', onClick: () => erpMessage(`已复制 ${row.trackingNo}`) },
            { label: '刷新', onClick: () => { setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, updatedAt: '2026-10-31 10:00:00' } : item))); erpMessage('轨迹已刷新（演示）'); } },
          ]}
          batchActions={(selected) => [
            { label: '批量刷新', onClick: () => erpMessage(`已刷新 ${selected.length} 个运单轨迹（演示）`) },
            { label: '导出', onClick: () => setExportOpen(true) },
          ]}
        />
      </div>
      <ErpDrawer open={detailOpen} title={`物流轨迹 · ${detail?.trackingNo || ''}`} width={680} onClose={() => setDetailOpen(false)} footer={<ErpButton onClick={() => setDetailOpen(false)}>关闭</ErpButton>}>
        {detail ? (
          <div className="erp-stack" style={{ gap: 18 }}>
            <ErpDescriptions
              columns={2}
              items={[
                { label: '订单号', value: detail.orderNo },
                { label: '物流商', value: detail.provider },
                { label: '渠道', value: detail.channel },
                { label: '目的国', value: detail.country },
                { label: '收件人', value: detail.receiver },
                { label: '当前状态', value: <ErpStatusTag status={detail.status} /> },
              ]}
            />
            <ErpSection title="轨迹详情">
              <ErpTimeline items={detail.events.map((event, index) => ({ time: event.time, title: event.description, desc: event.location, active: index === 0 }))} />
            </ErpSection>
          </div>
        ) : null}
      </ErpDrawer>
      <ExportDialog open={exportOpen} fields={[{ key: 'trackingNo', label: '运单号' }, { key: 'orderNo', label: '订单号' }, { key: 'provider', label: '物流商' }, { key: 'country', label: '目的国' }, { key: 'status', label: '状态' }, { key: 'lastEvent', label: '最新轨迹' }]} onClose={() => setExportOpen(false)} onConfirm={() => { setExportOpen(false); erpMessage('导出任务已创建（演示）'); }} />
    </div>
  );
}

export function CommonAddressPage() {
  const [rows, setRows] = useState<CommonAddress[]>(COMMON_ADDRESSES);
  const [keyword, setKeyword] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [current, setCurrent] = useState<CommonAddress | null>(null);

  const filtered = rows.filter((row) => !appliedKeyword || row.contact.includes(appliedKeyword) || row.city.includes(appliedKeyword) || row.address.includes(appliedKeyword));

  return (
    <div className="erp-page">
      <PageHeader title="常用地址管理" description="维护海外仓、退货地址等常用收件地址。" extra={<ErpButton variant="primary" onClick={() => { setCurrent(null); setDialogOpen(true); }}>新增地址</ErpButton>} />
      <div className="erp-card" style={{ padding: 20 }}>
        <FilterBar onQuery={() => setAppliedKeyword(keyword)} onReset={() => { setKeyword(''); setAppliedKeyword(''); }}>
          <span className="erp-filter-field"><label>关键词</label><ErpInput value={keyword} onChange={setKeyword} onEnter={() => setAppliedKeyword(keyword)} placeholder="联系人 / 城市 / 地址" style={{ width: 240 }} /></span>
        </FilterBar>
        <ListPage
          header={null}
          columns={[
            { key: 'contact', title: '联系人', width: 110 },
            { key: 'phone', title: '电话', width: 150 },
            { key: 'country', title: '国家', width: 90 },
            { key: 'state', title: '州 / 省', width: 120 },
            { key: 'city', title: '城市', width: 110 },
            { key: 'postcode', title: '邮编', width: 90 },
            { key: 'address', title: '详细地址', minWidth: 260 },
            { key: 'isDefault', title: '默认', width: 80, render: (row) => row.isDefault ? <ErpTag tone="brand">默认</ErpTag> : <span className="erp-muted">-</span> },
          ]}
          rows={filtered}
          rowKey={(row) => row.id}
          filterKey={appliedKeyword}
          rowActions={(row) => [
            { label: '编辑', onClick: () => { setCurrent(row); setDialogOpen(true); } },
            { label: '设为默认', onClick: () => { setRows((prev) => prev.map((item) => ({ ...item, isDefault: item.id === row.id }))); erpMessage('已设为默认地址（演示）'); } },
            { label: '删除', danger: true, onClick: async () => { if (await erpConfirm({ content: `确定删除「${row.contact}」的地址吗？`, danger: true })) { setRows((prev) => prev.filter((item) => item.id !== row.id)); erpMessage('已删除（演示）'); } } },
          ]}
        />
      </div>
      <FormDialog
        open={dialogOpen}
        title={current ? '编辑常用地址' : '新增常用地址'}
        width={720}
        fields={[
          { key: 'contact', label: '联系人', required: true },
          { key: 'phone', label: '联系电话', required: true },
          { key: 'country', label: '国家', type: 'select', options: COUNTRY_OPTIONS.map((item) => ({ label: item.label, value: item.label })) },
          { key: 'state', label: '州 / 省', required: true },
          { key: 'city', label: '城市', required: true },
          { key: 'postcode', label: '邮编', required: true },
          { key: 'address', label: '详细地址', type: 'textarea', required: true },
          { key: 'isDefault', label: '设为默认', type: 'switch' },
        ]}
        initial={current ? { ...current } : { country: '美国', isDefault: false }}
        onClose={() => setDialogOpen(false)}
        onSubmit={(values) => {
          const next: CommonAddress = {
            id: current?.id || `CA${String(rows.length + 1).padStart(3, '0')}`,
            contact: String(values.contact || ''),
            phone: String(values.phone || ''),
            country: String(values.country || ''),
            state: String(values.state || ''),
            city: String(values.city || ''),
            postcode: String(values.postcode || ''),
            address: String(values.address || ''),
            isDefault: Boolean(values.isDefault),
          };
          setRows((prev) => (current ? prev.map((row) => (row.id === current.id ? next : row)) : [next, ...prev]));
          setDialogOpen(false);
          erpMessage('地址已保存（演示）');
        }}
      />
    </div>
  );
}
