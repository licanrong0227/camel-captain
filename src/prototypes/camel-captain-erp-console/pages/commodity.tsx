import React, { useEffect, useMemo, useState } from 'react';
import {
  ErpButton,
  ErpCheckbox,
  ErpDialog,
  ErpForm,
  ErpFormItem,
  ErpInput,
  ErpInputNumber,
  ErpRadioGroup,
  ErpSection,
  ErpSelect,
  ErpStatusTag,
  ErpSwitch,
  ErpTag,
  ErpTextarea,
  erpConfirm,
  erpMessage,
} from '../components/ui';
import {
  ListPage,
  PageHeader,
  FilterBar,
  ListTabs,
  StatsPanel,
  ProductCell,
  type RowAction,
  type StatsGroup,
} from '../components/ListPage';
import { ColumnSettingsDialog, ExportDialog, ImportDialog, TagDialog } from '../components/dialogs/common';
import {
  AiCloneDialog,
  BatchImageDialog,
  ClaimDialog,
  ClaimExceptionDialog,
  EditProductDialog,
  ProductTemplateDialog,
  TemplatePreviewDialog,
  UpdatePublishDialog,
  AutoEditDialog,
} from '../components/dialogs/product';
import {
  CLAIMS,
  CLAIM_STATUSES,
  NEW_ARRIVAL_TEMPLATES,
  PRICING_RULES,
  PRODUCTS,
  PRODUCT_COUNTS,
  PRODUCT_STATUSES,
  STORE_TEMPLATES,
  TAG_OPTIONS,
  type ClaimProduct,
  type NewArrivalTemplate,
  type PricingRule,
  type Product,
} from '../data/catalog';
import { CATEGORY_OPTIONS, PLATFORM_OPTIONS, PRODUCT_IMAGES, STORE_OPTIONS } from '../data/util';
import type { Option } from '../components/ui';

export interface PageProps {
  navigate: (pageId: string) => void;
}

function CommodityTabs({ active, navigate }: { active: string; navigate: (pageId: string) => void }) {
  const tabs = [
    { key: 'commodity-collect', label: '商品采集' },
    { key: 'commodity-claim', label: '认领中心' },
    { key: 'commodity-my-products', label: '我的商品' },
  ];
  return <ListTabs tabs={tabs} activeKey={active} onChange={navigate} />;
}

const COLLECT_PLATFORMS = [
  { name: '亚马逊', desc: '支持商品链接 / ASIN' },
  { name: '1688', desc: '支持商品链接 / 店铺链接' },
  { name: 'Temu', desc: '支持商品链接' },
  { name: '速卖通', desc: '支持商品链接' },
  { name: '敦煌网', desc: '支持商品链接 / 我的商品' },
  { name: 'SHEIN', desc: '支持商品链接' },
];

interface CollectTask {
  id: string;
  link: string;
  platform: string;
  status: string;
  success: number;
  failed: number;
  createdAt: string;
}

const INITIAL_TASKS: CollectTask[] = [
  { id: 'CT001', link: 'https://detail.1688.com/offer/1000001.html', platform: '1688', status: '已完成', success: 1, failed: 0, createdAt: '2026-10-30 16:22:00' },
  { id: 'CT002', link: 'https://www.amazon.com/dp/B0C1234567', platform: '亚马逊', status: '已完成', success: 1, failed: 0, createdAt: '2026-10-30 15:08:00' },
  { id: 'CT003', link: 'https://detail.1688.com/offer/1000003.html', platform: '1688', status: '部分失败', success: 0, failed: 1, createdAt: '2026-10-29 18:40:00' },
  { id: 'CT004', link: 'https://www.temu.com/goods.html?goods_id=601', platform: 'Temu', status: '已完成', success: 1, failed: 0, createdAt: '2026-10-29 11:12:00' },
];

export function CommodityCollectPage({ navigate }: PageProps) {
  const [tab, setTab] = useState('链接采集');
  const [links, setLinks] = useState('');
  const [platform, setPlatform] = useState('1688');
  const [store, setStore] = useState('152');
  const [tasks, setTasks] = useState<CollectTask[]>(INITIAL_TASKS);
  const [logs, setLogs] = useState<string[]>(['采集服务已就绪', '请粘贴商品链接后开始采集']);
  const [running, setRunning] = useState(false);
  const [storeLink, setStoreLink] = useState('');
  const [pages, setPages] = useState(3);
  const [account, setAccount] = useState('采集账号A');
  const [favorites, setFavorites] = useState<string[]>(['favorites-1']);
  const [historyKeyword, setHistoryKeyword] = useState('');
  const [historyStatus, setHistoryStatus] = useState('');

  const linkCount = links.split('\n').map((line) => line.trim()).filter(Boolean).length;

  const startCollect = () => {
    if (!links.trim()) {
      erpMessage('请先粘贴商品链接', 'warning');
      return;
    }
    const lines = links.split('\n').map((line) => line.trim()).filter(Boolean);
    setRunning(true);
    setLogs((prev) => [`开始采集 ${lines.length} 个链接`, ...prev].slice(0, 40));
    window.setTimeout(() => {
      const nextTasks = lines.map((link, index) => ({
        id: `CT${String(tasks.length + index + 10).padStart(3, '0')}`,
        link,
        platform,
        status: index === lines.length - 1 && lines.length > 2 ? '部分失败' : '已完成',
        success: index === lines.length - 1 && lines.length > 2 ? 0 : 1,
        failed: index === lines.length - 1 && lines.length > 2 ? 1 : 0,
        createdAt: '2026-10-31 10:00:00',
      }));
      setTasks((prev) => [...nextTasks, ...prev]);
      setLogs((prev) => [`采集完成：成功 ${nextTasks.filter((item) => item.success).length}，失败 ${nextTasks.filter((item) => item.failed).length}`, ...prev]);
      setRunning(false);
      erpMessage('采集任务已完成（演示）');
    }, 1200);
  };

  const historyRows = tasks.filter(
    (task) =>
      (!historyKeyword || task.link.includes(historyKeyword) || task.id.includes(historyKeyword)) &&
      (!historyStatus || task.status === historyStatus),
  );

  return (
    <div className="erp-page">
      <PageHeader
        title="商品采集"
        description="粘贴商品链接或采集整店商品，采集结果会进入认领中心等待认领。"
        extra={<ErpButton onClick={() => erpMessage('浏览器插件下载链接已复制（演示）')}>下载安装浏览器插件</ErpButton>}
      />
      <div className="erp-card">
        <div style={{ padding: '0 20px' }}>
          <ListTabs
            tabs={[
              { key: '链接采集', label: '链接采集' },
              { key: '店铺采集', label: '店铺采集' },
              { key: '收藏夹采集', label: '收藏夹采集' },
              { key: '采集记录', label: '采集记录' },
            ]}
            activeKey={tab}
            onChange={setTab}
          />
        </div>
        <div style={{ padding: 20 }}>
          {tab === '链接采集' ? (
            <div className="erp-stack" style={{ gap: 16 }}>
              <div className="erp-flex" style={{ gap: 12, flexWrap: 'wrap' }}>
                <span className="erp-filter-field">
                  <label>采集平台</label>
                  <ErpSelect options={COLLECT_PLATFORMS.map((item) => ({ label: item.name, value: item.name }))} value={platform} onChange={(value) => setPlatform(String(value))} width={160} />
                </span>
                <span className="erp-filter-field">
                  <label>目标店铺</label>
                  <ErpSelect options={STORE_OPTIONS} value={store} onChange={(value) => setStore(String(value))} width={180} />
                </span>
                <span className="erp-filter-field">
                  <label>采集设置</label>
                  <ErpButton size="small" onClick={() => erpMessage('已打开采集设置（演示）')}>定价模板与自动认领</ErpButton>
                </span>
              </div>
              <ErpTextarea
                value={links}
                onChange={setLinks}
                rows={7}
                placeholder={'粘贴商品链接，每行一个链接，支持批量采集\n例如：https://detail.1688.com/offer/1000001.html'}
              />
              <div className="erp-flex-between">
                <span className="erp-small erp-muted">已导入 {linkCount} 个任务链接</span>
                <div className="erp-flex">
                  <ErpButton onClick={() => setLinks('')}>清空链接</ErpButton>
                  <ErpButton variant="primary" loading={running} onClick={startCollect}>
                    开始采集
                  </ErpButton>
                </div>
              </div>
              <div className="erp-flex" style={{ gap: 12, flexWrap: 'wrap' }}>
                {[
                  ['任务总数', String(tasks.length)],
                  ['成功', String(tasks.reduce((sum, task) => sum + task.success, 0))],
                  ['失败', String(tasks.reduce((sum, task) => sum + task.failed, 0))],
                ].map(([label, value]) => (
                  <div key={label} className="erp-kpi" style={{ flex: '0 0 160px' }}>
                    <span className="erp-kpi__label">{label}</span>
                    <span className="erp-kpi__value">{value}</span>
                  </div>
                ))}
              </div>
              <div className="erp-section">
                <div className="erp-section__head">
                  <h3>采集日志</h3>
                  <ErpButton size="small" onClick={() => setLogs([])}>清空日志</ErpButton>
                </div>
                <div className="erp-section__body" style={{ maxHeight: 180, overflow: 'auto' }}>
                  {logs.length === 0 ? <p className="erp-small erp-muted">暂无采集日志</p> : null}
                  {logs.map((log, index) => (
                    <p key={`${log}-${index}`} className="erp-small" style={{ color: '#4E5969', marginBottom: 4 }}>
                      <span className="erp-muted">[{`10:0${Math.min(9, index)}`}]</span> {log}
                    </p>
                  ))}
                </div>
              </div>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 500, marginBottom: 10 }}>支持采集平台</h3>
                <div className="erp-shortcut-grid" style={{ gridTemplateColumns: 'repeat(6, minmax(0, 1fr))' }}>
                  {COLLECT_PLATFORMS.map((item) => (
                    <div className="erp-shortcut" key={item.name}>
                      <b>{item.name}</b>
                      <span>{item.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {tab === '店铺采集' ? (
            <div className="erp-stack" style={{ gap: 16 }}>
              <div className="erp-inline-note">输入店铺链接或店铺 ID，采集整店商品。建议先采集 1–3 页确认质量，再扩大范围。</div>
              <ErpForm labelWidth={100}>
                <ErpFormItem label="店铺链接 / ID" required>
                  <ErpInput value={storeLink} onChange={setStoreLink} placeholder="例如 https://shop123.1688.com 或 123456" />
                </ErpFormItem>
                <ErpFormItem label="采集平台">
                  <ErpSelect options={COLLECT_PLATFORMS.map((item) => ({ label: item.name, value: item.name }))} value={platform} onChange={(value) => setPlatform(String(value))} width={180} />
                </ErpFormItem>
                <ErpFormItem label="采集页数">
                  <div className="erp-flex">
                    <ErpInputNumber value={pages} onChange={setPages} min={1} max={50} suffix="页" />
                    <span className="erp-small erp-muted">每页约 40 个商品</span>
                  </div>
                </ErpFormItem>
                <ErpFormItem label=" ">
                  <ErpButton
                    variant="primary"
                    onClick={() => {
                      if (!storeLink.trim()) {
                        erpMessage('请输入店铺链接或店铺 ID', 'warning');
                        return;
                      }
                      erpMessage(`已创建整店采集任务，共 ${pages} 页（演示）`);
                    }}
                  >
                    开始采集
                  </ErpButton>
                </ErpFormItem>
              </ErpForm>
              <div className="erp-table-card">
                <div className="erp-table-card__head"><b>店铺商品预览</b><span className="erp-small erp-muted">采集后可在认领中心查看</span></div>
                <table className="erp-cost-table">
                  <thead><tr><th>商品</th><th>价格</th><th>月销</th><th>类目</th></tr></thead>
                  <tbody>
                    {PRODUCT_IMAGES.slice(0, 5).map((image, index) => (
                      <tr key={image}>
                        <td>
                          <div className="erp-product-cell">
                            <img className="erp-product-cell__img" src={image} alt="" style={{ width: 40, height: 40 }} />
                            <div className="erp-product-cell__body"><div className="erp-product-cell__title">采集预览商品 {index + 1}</div></div>
                          </div>
                        </td>
                        <td>$ {19 + index * 3}.99</td>
                        <td>{120 + index * 37}</td>
                        <td>{CATEGORY_OPTIONS[index % CATEGORY_OPTIONS.length].label}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {tab === '收藏夹采集' ? (
            <div className="erp-stack" style={{ gap: 16 }}>
              <ErpForm labelWidth={100}>
                <ErpFormItem label="采集账号">
                  <ErpSelect options={[{ label: '采集账号A', value: '采集账号A' }, { label: '采集账号B', value: '采集账号B' }]} value={account} onChange={(value) => setAccount(String(value))} width={200} />
                </ErpFormItem>
              </ErpForm>
              <div className="erp-table-card">
                <div className="erp-table-card__head">
                  <b>收藏夹列表</b>
                  <ErpCheckbox checked={favorites.length === 4} indeterminate={favorites.length > 0 && favorites.length < 4} onChange={(checked) => setFavorites(checked ? ['favorites-1', 'favorites-2', 'favorites-3', 'favorites-4'] : [])}>
                    全选
                  </ErpCheckbox>
                </div>
                <table className="erp-cost-table">
                  <thead><tr><th style={{ width: 40 }} />
                        <th>收藏夹名称</th><th>商品数</th><th>最近更新</th></tr></thead>
                  <tbody>
                    {[
                      ['默认收藏夹', 86, '2026-10-30'],
                      ['箱包选品', 42, '2026-10-28'],
                      ['鞋靴选品', 31, '2026-10-26'],
                      ['竞品观察', 18, '2026-10-20'],
                    ].map(([name, count, time], index) => {
                      const key = `favorites-${index + 1}`;
                      return (
                        <tr key={name}>
                          <td><ErpCheckbox checked={favorites.includes(key)} onChange={(checked) => setFavorites((prev) => (checked ? [...prev, key] : prev.filter((item) => item !== key)))} /></td>
                          <td>{name}</td>
                          <td>{count}</td>
                          <td>{time}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div>
                <ErpButton variant="primary" onClick={() => erpMessage(`已提交 ${favorites.length} 个收藏夹的采集任务（演示）`)}>开始采集</ErpButton>
              </div>
            </div>
          ) : null}

          {tab === '采集记录' ? (
            <div className="erp-stack" style={{ gap: 12 }}>
              <div className="erp-filterbar">
                <div className="erp-filterbar__fields">
                  <span className="erp-filter-field"><label>关键词</label><ErpInput value={historyKeyword} onChange={setHistoryKeyword} placeholder="任务号 / 链接" /></span>
                  <span className="erp-filter-field"><label>状态</label><ErpSelect options={[{ label: '已完成', value: '已完成' }, { label: '部分失败', value: '部分失败' }, { label: '采集失败', value: '采集失败' }]} value={historyStatus} onChange={(value) => setHistoryStatus(String(value))} clearable width={140} /></span>
                </div>
                <div className="erp-filterbar__actions"><ErpButton onClick={() => { setHistoryKeyword(''); setHistoryStatus(''); }}>重置</ErpButton></div>
              </div>
              <ListPage
                header={null}
                columns={[
                  { key: 'id', title: '任务号', width: 100 },
                  { key: 'link', title: '商品链接', minWidth: 260, render: (row) => <span className="erp-clamp-1">{row.link}</span> },
                  { key: 'platform', title: '平台', width: 100 },
                  { key: 'status', title: '状态', width: 100, render: (row) => <ErpStatusTag status={row.status} /> },
                  { key: 'success', title: '成功', width: 70, align: 'right' },
                  { key: 'failed', title: '失败', width: 70, align: 'right' },
                  { key: 'createdAt', title: '创建时间', width: 160 },
                  {
                    key: 'actions',
                    title: '操作',
                    width: 140,
                    render: (row) => (
                      <div className="erp-inline-actions">
                        <button type="button" onClick={() => erpMessage(`重试任务 ${row.id}（演示）`)}>重试</button>
                        <span className="erp-divider-v" />
                        <button type="button" onClick={() => erpMessage(`查看失败详情：${row.failed} 条（演示）`)}>失败详情</button>
                      </div>
                    ),
                  },
                ]}
                rows={historyRows}
                rowKey={(row) => row.id}
                selectable
                filterKey={`${historyKeyword}-${historyStatus}`}
                crossPageTotal={historyRows.length}
                rowActions={(row) => [
                  { label: '重试', onClick: () => erpMessage(`重试任务 ${row.id}（演示）`) },
                  { label: '失败详情', onClick: () => erpMessage(`查看失败详情：${row.failed} 条（演示）`) },
                  { label: '删除', danger: true, onClick: async () => { if (await erpConfirm({ content: `确定删除采集记录 ${row.id} 吗？`, danger: true })) { setTasks((prev) => prev.filter((item) => item.id !== row.id)); erpMessage('已删除（演示）'); } } },
                ]}
                batchActions={() => [
                  { label: '批量重试', onClick: () => erpMessage('已提交批量重试（演示）') },
                  { label: '批量删除', danger: true, onClick: async () => { if (await erpConfirm({ content: '删除后不可恢复，确定删除选中的采集记录吗？', danger: true })) erpMessage('已删除选中记录（演示）'); } },
                ]}
                cardless
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function ClaimCenterPage({ navigate }: PageProps) {
  const [rows, setRows] = useState<ClaimProduct[]>(CLAIMS);
  const [searchType, setSearchType] = useState('产品标题');
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(9999);
  const [applied, setApplied] = useState({ keyword: '', status: '', platforms: [] as string[], tags: [] as string[], priceMin: 0, priceMax: 9999 });
  const [claimTargets, setClaimTargets] = useState<ClaimProduct[]>([]);
  const [claimOpen, setClaimOpen] = useState(false);
  const [exceptionOpen, setExceptionOpen] = useState(false);
  const [tagOpen, setTagOpen] = useState(false);
  const [tagTargets, setTagTargets] = useState<string[]>([]);
  const [tagValue, setTagValue] = useState<string[]>([]);
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const filtered = rows.filter((row) => {
    const matchKeyword = !applied.keyword || (searchType === '产品标题' ? row.title : searchType === '产品 ID' ? row.id : row.sku).toLowerCase().includes(applied.keyword.toLowerCase());
    const matchStatus = !applied.status || row.claimStatus === applied.status;
    const matchPlatform = applied.platforms.length === 0 || applied.platforms.includes(row.sourcePlatform);
    const matchTags = applied.tags.length === 0 || applied.tags.some((tag) => row.tags.includes(tag));
    const matchPrice = row.price >= applied.priceMin && row.price <= applied.priceMax;
    return matchKeyword && matchStatus && matchPlatform && matchTags && matchPrice;
  });

  const apply = () => setApplied({ keyword, status, platforms, tags, priceMin, priceMax });
  const reset = () => {
    setKeyword('');
    setStatus('');
    setPlatforms([]);
    setTags([]);
    setPriceMin(0);
    setPriceMax(9999);
    setApplied({ keyword: '', status: '', platforms: [], tags: [], priceMin: 0, priceMax: 9999 });
  };

  const claim = (targets: ClaimProduct[]) => {
    setRows((prev) => prev.map((row) => (targets.some((target) => target.id === row.id) ? { ...row, claimStatus: '已认领' } : row)));
    setClaimOpen(false);
    erpMessage(`已认领 ${targets.length} 个商品（演示）`);
  };

  return (
    <div className="erp-page">
      <PageHeader title="认领中心" description="采集到的商品会先进入认领中心，选择目标店铺和类目后即可认领到我的商品。" />
      <div className="erp-card">
        <div style={{ padding: '0 20px' }}><CommodityTabs active="commodity-claim" navigate={navigate} /></div>
        <div style={{ padding: '14px 20px 0' }}>
          <FilterBar
            onQuery={apply}
            onReset={reset}
            extra={
              <div className="erp-flex">
                <ErpButton onClick={() => setImportOpen(true)}>导入产品</ErpButton>
                <ErpButton onClick={() => setExportOpen(true)}>导出</ErpButton>
                <ErpButton variant="soft" onClick={() => erpMessage('已打开创建新产品弹窗（演示）')}>创建新产品</ErpButton>
              </div>
            }
          >
            <span className="erp-filter-field">
              <ErpSelect options={[{ label: '产品标题', value: '产品标题' }, { label: '产品 ID', value: '产品 ID' }, { label: '父 SKU', value: '父 SKU' }, { label: '类目名称', value: '类目名称' }]} value={searchType} onChange={(value) => setSearchType(String(value))} width={110} />
              <ErpInput value={keyword} onChange={setKeyword} onEnter={apply} placeholder="输入关键词" style={{ width: 190 }} />
            </span>
            <span className="erp-filter-field">
              <label>认领状态</label>
              <ErpSelect options={CLAIM_STATUSES.map((item) => ({ label: item, value: item }))} value={status} onChange={(value) => setStatus(String(value))} clearable width={130} />
            </span>
            <span className="erp-filter-field">
              <label>价格</label>
              <div className="erp-flex" style={{ gap: 4 }}>
                <ErpInputNumber value={priceMin} onChange={setPriceMin} width={92} />
                <span className="erp-muted">-</span>
                <ErpInputNumber value={priceMax} onChange={setPriceMax} width={100} />
              </div>
            </span>
            <span className="erp-filter-field">
              <label>采集平台</label>
              <ErpSelect options={PLATFORM_OPTIONS.slice(0, 4)} value={platforms} onChange={(value) => setPlatforms(value as string[])} multiple width={170} />
            </span>
            <span className="erp-filter-field">
              <label>标签</label>
              <ErpSelect options={TAG_OPTIONS} value={tags} onChange={(value) => setTags(value as string[])} multiple width={150} />
            </span>
          </FilterBar>
        </div>
        <ListPage
          header={null}
          columns={[
            {
              key: 'title',
              title: '商品信息',
              minWidth: 300,
              render: (row) => (
                <ProductCell
                  image={row.image}
                  title={row.title}
                  meta={<><span>{row.category}</span><ErpTag tone="neutral">{row.sourcePlatform}</ErpTag></>}
                  sub={<span>父 SKU：{row.sku} · 采集账号：{row.account}</span>}
                />
              ),
            },
            { key: 'price', title: '售价', width: 100, align: 'right', render: (row) => <span className="erp-amount">$ {row.price.toFixed(2)}</span> },
            { key: 'claimStatus', title: '认领状态', width: 100, render: (row) => <ErpStatusTag status={row.claimStatus} /> },
            { key: 'tags', title: '标签', width: 110, render: (row) => <div className="erp-tag-list">{row.tags.length ? row.tags.map((tag) => <ErpTag key={tag} tone="brand">{tag}</ErpTag>) : <span className="erp-muted">-</span>}</div> },
            { key: 'source', title: '来源', width: 90, render: (row) => <span className="erp-small">{row.sourcePlatform}</span> },
            { key: 'collectedAt', title: '采集时间', width: 150 },
          ]}
          rows={filtered}
          rowKey={(row) => row.id}
          selectable
          filterKey={`${applied.keyword}-${applied.status}-${applied.platforms.join()}-${applied.tags.join()}-${applied.priceMin}-${applied.priceMax}`}
          crossPageTotal={filtered.length}
          rowActions={(row) => [
            { label: '编辑', onClick: () => erpMessage(`打开商品编辑：${row.id}（演示）`) },
            { label: '认领', onClick: () => { setClaimTargets([row]); setClaimOpen(true); } },
            { label: '标签', onClick: () => { setTagTargets([row.id]); setTagValue(row.tags); setTagOpen(true); } },
            { label: '删除', danger: true, onClick: async () => { if (await erpConfirm({ content: `确定删除商品「${row.title}」吗？`, danger: true })) { setRows((prev) => prev.filter((item) => item.id !== row.id)); erpMessage('已删除（演示）'); } } },
          ]}
          batchActions={(selected) => [
            { label: '编辑货源', onClick: () => erpMessage(`批量编辑货源：${selected.length} 个（演示）`) },
            { label: '批量认领', onClick: () => { setClaimTargets(selected); setClaimOpen(true); } },
            { label: '批量标签', onClick: () => { setTagTargets(selected.map((row) => row.id)); setTagValue([]); setTagOpen(true); } },
            { label: '批量删除', danger: true, onClick: async () => { if (await erpConfirm({ content: `确定删除选中的 ${selected.length} 个商品吗？`, danger: true })) { setRows((prev) => prev.filter((row) => !selected.some((target) => target.id === row.id))); erpMessage('已删除（演示）'); } } },
          ]}
          onRowClick={() => undefined}
        />
      </div>
      <ClaimDialog
        open={claimOpen}
        count={claimTargets.length}
        onClose={() => setClaimOpen(false)}
        onConfirm={() => {
          claim(claimTargets);
          if (claimTargets.some((row) => row.claimStatus === '认领失败')) setExceptionOpen(true);
        }}
      />
      <ClaimExceptionDialog open={exceptionOpen} onClose={() => setExceptionOpen(false)} onEdit={(id) => erpMessage(`编辑认领异常商品 ${id}（演示）`)} />
      <TagDialog
        open={tagOpen}
        value={tagValue}
        options={TAG_OPTIONS}
        onClose={() => setTagOpen(false)}
        onConfirm={(next) => {
          setRows((prev) => prev.map((row) => (tagTargets.includes(row.id) ? { ...row, tags: next.map((value) => TAG_OPTIONS.find((option) => option.value === value)?.label || value) } : row)));
          setTagOpen(false);
          erpMessage('标签已保存（演示）');
        }}
      />
      <ExportDialog open={exportOpen} fields={[{ key: 'title', label: '产品标题' }, { key: 'sku', label: '父 SKU' }, { key: 'price', label: '售价' }, { key: 'claimStatus', label: '认领状态' }, { key: 'platform', label: '采集平台' }, { key: 'collectedAt', label: '采集时间' }]} onClose={() => setExportOpen(false)} onConfirm={() => { setExportOpen(false); erpMessage('导出任务已创建（演示）'); }} />
      <ImportDialog open={importOpen} title="导入产品" onClose={() => setImportOpen(false)} onConfirm={() => { setImportOpen(false); erpMessage('已导入 1 个文件，演示环境不写入真实数据'); }} />
    </div>
  );
}

const STAT_GROUPS = (counts: Record<string, number>): StatsGroup[] => [
  { title: '发布管理', items: ['待发布', '发布中', '循环刊登', '发布失败'].map((status) => ({ key: status, label: status, count: counts[status] || 0 })) },
  { title: '销售状态', items: ['已上架', '已下架'].map((status) => ({ key: status, label: status, count: counts[status] || 0 })) },
  { title: '审核与风险', items: ['待审核', '审核未通过', '内容违规', '品牌商投诉'].map((status) => ({ key: status, label: status, count: counts[status] || 0 })) },
  { title: '其他', items: ['未定义', '回收站'].map((status) => ({ key: status, label: status, count: counts[status] || 0 })) },
];

export function MyProductsPage({ navigate }: PageProps) {
  const [rows, setRows] = useState<Product[]>(PRODUCTS);
  const [activeStat, setActiveStat] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState<string[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [stores, setStores] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(99999);
  const [applied, setApplied] = useState({ keyword: '', category: [] as string[], platforms: [] as string[], tags: [] as string[], stores: [] as string[], priceMin: 0, priceMax: 99999 });
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishCount, setPublishCount] = useState(0);
  const [autoEditOpen, setAutoEditOpen] = useState(false);
  const [autoEditCount, setAutoEditCount] = useState(0);
  const [imageOpen, setImageOpen] = useState(false);
  const [imageCount, setImageCount] = useState(0);
  const [cloneOpen, setCloneOpen] = useState(false);
  const [cloneCount, setCloneCount] = useState(0);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [templateCount, setTemplateCount] = useState(0);
  const [tagOpen, setTagOpen] = useState(false);
  const [tagTargets, setTagTargets] = useState<string[]>([]);
  const [tagValue, setTagValue] = useState<string[]>([]);
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [columnOpen, setColumnOpen] = useState(false);
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);

  const counts = useMemo(() => ({ ...PRODUCT_COUNTS, 全部商品: rows.length }), [rows]);

  const filtered = rows.filter((row) => {
    const matchStat = activeStat === 'all' || row.status === activeStat;
    const matchKeyword = !applied.keyword || row.title.toLowerCase().includes(applied.keyword.toLowerCase()) || row.sku.toLowerCase().includes(applied.keyword.toLowerCase()) || row.id.toLowerCase().includes(applied.keyword.toLowerCase());
    const matchCategory = applied.category.length === 0 || applied.category.some((value) => row.category.includes(CATEGORY_OPTIONS.find((option) => option.value === value)?.label.split(' / ').pop() || ''));
    const matchPlatform = applied.platforms.length === 0 || applied.platforms.includes(row.sourcePlatform);
    const matchTags = applied.tags.length === 0 || applied.tags.some((tag) => row.tags.includes(TAG_OPTIONS.find((option) => option.value === tag)?.label || tag));
    const matchStore = applied.stores.length === 0 || applied.stores.includes(row.storeId);
    const matchPrice = row.price >= applied.priceMin && row.price <= applied.priceMax;
    return matchStat && matchKeyword && matchCategory && matchPlatform && matchTags && matchStore && matchPrice;
  });

  const columns = [
    {
      key: 'title',
      title: '商品信息',
      minWidth: 340,
      render: (row: Product) => (
        <ProductCell
          image={row.image}
          title={row.title}
          meta={<><ErpStatusTag status={row.status} /><span>{row.storeName}</span></>}
          sub={<span>{row.category}</span>}
        />
      ),
    },
    { key: 'parentSku', title: '父 SKU', width: 140, render: (row: Product) => <span className="erp-code">{row.parentSku}</span> },
    { key: 'price', title: '售价', width: 96, align: 'right' as const, sortable: true, render: (row: Product) => <span className="erp-amount">$ {row.price.toFixed(2)}</span> },
    { key: 'tags', title: '标签', width: 110, render: (row: Product) => <div className="erp-tag-list">{row.tags.length ? row.tags.map((tag) => <ErpTag key={tag} tone="brand">{tag}</ErpTag>) : <span className="erp-muted">-</span>}</div> },
    {
      key: 'modifiedAt',
      title: '时间 / 版本',
      width: 200,
      render: (row: Product) => (
        <div className="erp-stack erp-small">
          <span>认领：{row.claimedAt.slice(0, 16)}</span>
          <span>修改：{row.modifiedAt.slice(0, 16)}</span>
          <span>刊登：{row.publishedAt === '-' ? '-' : row.publishedAt.slice(0, 16)}</span>
          <span className="erp-muted">认领版本 {row.claimVersion} · 当前版本 {row.currentVersion}</span>
        </div>
      ),
    },
    { key: 'source', title: '来源', width: 90, render: (row: Product) => <span className="erp-small">{row.source}</span> },
  ].filter((column) => !hiddenColumns.includes(column.key));

  const applyFilters = () => setApplied({ keyword, category, platforms, tags, stores, priceMin, priceMax });
  const resetFilters = () => {
    setKeyword('');
    setCategory([]);
    setPlatforms([]);
    setTags([]);
    setStores([]);
    setPriceMin(0);
    setPriceMax(99999);
    setApplied({ keyword: '', category: [], platforms: [], tags: [], stores: [], priceMin: 0, priceMax: 99999 });
  };

  const openEdit = (product: Product) => {
    setEditProduct(product);
    setEditOpen(true);
  };

  return (
    <div className="erp-page">
      <PageHeader title="我的商品" description="管理采集认领后的商品，支持编辑、更新发布、批量处理与 AI 克隆。" />
      <div className="erp-card">
        <div style={{ padding: '0 20px' }}><CommodityTabs active="commodity-my-products" navigate={navigate} /></div>
        <div style={{ padding: '14px 20px 0' }}>
          <FilterBar
            onQuery={applyFilters}
            onReset={resetFilters}
            extra={
              <div className="erp-flex">
                <ErpButton onClick={() => setImportOpen(true)}>导入货源</ErpButton>
                <ErpButton onClick={() => setExportOpen(true)}>导出</ErpButton>
                <ErpButton onClick={async () => { if (await erpConfirm({ title: '同步线上', content: '将从敦煌网同步商品状态与刊登信息（演示，不调用接口）。' })) erpMessage('同步任务已创建（演示）'); }}>同步线上</ErpButton>
                <ErpButton variant="soft" onClick={() => { setEditProduct({ ...PRODUCTS[0], id: 'NEW', title: '新商品草稿', status: '待发布' }); setEditOpen(true); }}>创建新产品</ErpButton>
              </div>
            }
          >
            <span className="erp-filter-field">
              <label>关键词</label>
              <ErpInput value={keyword} onChange={setKeyword} onEnter={applyFilters} placeholder="标题 / SKU / 商品 ID" style={{ width: 210 }} />
            </span>
            <span className="erp-filter-field">
              <label>类目名称</label>
              <ErpSelect options={CATEGORY_OPTIONS} value={category} onChange={(value) => setCategory(value as string[])} multiple filterable width={200} placeholder="全部类目" />
            </span>
            <span className="erp-filter-field">
              <label>价格</label>
              <div className="erp-flex" style={{ gap: 4 }}>
                <ErpInputNumber value={priceMin} onChange={setPriceMin} width={90} />
                <span className="erp-muted">-</span>
                <ErpInputNumber value={priceMax} onChange={setPriceMax} width={100} />
              </div>
            </span>
            <span className="erp-filter-field">
              <label>采集平台</label>
              <ErpSelect options={PLATFORM_OPTIONS.slice(0, 5)} value={platforms} onChange={(value) => setPlatforms(value as string[])} multiple width={150} />
            </span>
            <span className="erp-filter-field">
              <label>标签</label>
              <ErpSelect options={TAG_OPTIONS} value={tags} onChange={(value) => setTags(value as string[])} multiple width={140} />
            </span>
            <span className="erp-filter-field">
              <label>店铺</label>
              <ErpSelect options={STORE_OPTIONS} value={stores} onChange={(value) => setStores(value as string[])} multiple width={170} />
            </span>
          </FilterBar>
        </div>
        <div style={{ padding: '12px 20px 0' }}>
          <div className="erp-inline-actions" style={{ justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => erpMessage('排序设置（演示）')}>排序</button>
            <span className="erp-divider-v" />
            <button type="button" onClick={() => setColumnOpen(true)}>列设置</button>
          </div>
        </div>
        <ListPage
          header={null}
          stats={
            <StatsPanel
              title="商品概览"
              activeKey={activeStat}
              onSelect={setActiveStat}
              extra={<button type="button" className="erp-link" onClick={() => erpMessage('已刷新商品统计（演示）')}>刷新</button>}
              groups={[
                { title: '', items: [{ key: 'all', label: '全部商品', count: counts['全部商品'] || rows.length }] },
                ...STAT_GROUPS(counts),
              ]}
            />
          }
          columns={columns}
          rows={filtered}
          rowKey={(row) => row.id}
          selectable
          sortable
          filterKey={`${activeStat}-${applied.keyword}-${applied.category.join()}-${applied.platforms.join()}-${applied.tags.join()}-${applied.stores.join()}-${applied.priceMin}-${applied.priceMax}`}
          crossPageTotal={filtered.length}
          rowActions={(row) => [
            { label: '编辑', onClick: () => openEdit(row) },
            { label: '更新发布', onClick: () => { setPublishCount(1); setPublishOpen(true); } },
            { label: '标签', onClick: () => { setTagTargets([row.id]); setTagValue(row.tags); setTagOpen(true); } },
            { label: '删除', danger: true, onClick: async () => { if (await erpConfirm({ content: `确定删除商品「${row.title}」吗？`, danger: true })) { setRows((prev) => prev.filter((item) => item.id !== row.id)); erpMessage('已删除（演示）'); } } },
            { label: 'AI 一键克隆', onClick: () => { setCloneCount(1); setCloneOpen(true); } },
          ]}
          batchActions={(selected) => [
            { label: '批量编辑', onClick: () => { setAutoEditCount(selected.length); setAutoEditOpen(true); } },
            { label: '批量更新发布', onClick: () => { setPublishCount(selected.length); setPublishOpen(true); } },
            { label: '批量标签', onClick: () => { setTagTargets(selected.map((row) => row.id)); setTagValue([]); setTagOpen(true); } },
            { label: '批量删除', danger: true, onClick: async () => { if (await erpConfirm({ content: `确定删除选中的 ${selected.length} 个商品吗？`, danger: true })) { setRows((prev) => prev.filter((row) => !selected.some((target) => target.id === row.id))); erpMessage('已删除（演示）'); } } },
            { label: '批量 AI 克隆', onClick: () => { setCloneCount(selected.length); setCloneOpen(true); } },
          ]}
          batchNotice={
            <span className="erp-inline-actions">
              <button type="button" onClick={() => { setImageOpen(true); setImageCount(rows.length); }}>批量美图</button>
              <span className="erp-divider-v" />
              <button type="button" onClick={() => { setTemplateOpen(true); setTemplateCount(rows.length); }}>关联产品模板</button>
            </span>
          }
        />
      </div>

      <EditProductDialog
        open={editOpen}
        product={editProduct}
        onClose={() => setEditOpen(false)}
        onSave={(next) => {
          setRows((prev) => (prev.some((row) => row.id === next.id) ? prev.map((row) => (row.id === next.id ? next : row)) : [next, ...prev]));
          setEditOpen(false);
          erpMessage('产品已保存（演示）');
        }}
      />
      <UpdatePublishDialog open={publishOpen} count={publishCount} onClose={() => setPublishOpen(false)} onConfirm={() => { setPublishOpen(false); erpMessage(`已提交更新发布：${publishCount} 个商品（演示）`); }} />
      <AutoEditDialog open={autoEditOpen} count={autoEditCount} onClose={() => setAutoEditOpen(false)} onConfirm={(modules) => { setAutoEditOpen(false); erpMessage(`自动编辑已提交：${modules.length} 个模块（演示）`); }} />
      <BatchImageDialog open={imageOpen} count={imageCount} onClose={() => setImageOpen(false)} onConfirm={(method) => erpMessage(`批量美图已保存：${method}（演示）`)} />
      <AiCloneDialog open={cloneOpen} count={cloneCount} onClose={() => setCloneOpen(false)} onConfirm={(stores) => { setCloneOpen(false); erpMessage(`已提交 AI 克隆到 ${stores.length} 个店铺（演示）`); }} />
      <ProductTemplateDialog open={templateOpen} count={templateCount} onClose={() => setTemplateOpen(false)} onConfirm={(templates) => { setTemplateOpen(false); erpMessage(`已关联 ${templates.length} 个模板（演示）`); }} />
      <TagDialog
        open={tagOpen}
        value={tagValue}
        options={TAG_OPTIONS}
        onClose={() => setTagOpen(false)}
        onConfirm={(next) => {
          const labels = next.map((value) => TAG_OPTIONS.find((option) => option.value === value)?.label || value);
          setRows((prev) => prev.map((row) => (tagTargets.includes(row.id) ? { ...row, tags: labels } : row)));
          setTagOpen(false);
          erpMessage('标签已保存（演示）');
        }}
      />
      <ExportDialog open={exportOpen} fields={[{ key: 'title', label: '商品标题' }, { key: 'sku', label: '父 SKU' }, { key: 'price', label: '售价' }, { key: 'status', label: '状态' }, { key: 'store', label: '店铺' }, { key: 'tags', label: '标签' }, { key: 'modifiedAt', label: '修改时间' }]} onClose={() => setExportOpen(false)} onConfirm={() => { setExportOpen(false); erpMessage('导出任务已创建（演示）'); }} />
      <ImportDialog open={importOpen} title="导入货源" onClose={() => setImportOpen(false)} onConfirm={() => { setImportOpen(false); erpMessage('货源文件已解析，演示环境不写入真实数据'); }} />
      <ColumnSettingsDialog
        open={columnOpen}
        columns={[{ key: 'title', title: '商品信息' }, { key: 'parentSku', title: '父 SKU' }, { key: 'price', title: '售价' }, { key: 'tags', title: '标签' }, { key: 'modifiedAt', title: '时间 / 版本' }, { key: 'source', title: '来源' }]}
        hidden={hiddenColumns}
        onClose={() => setColumnOpen(false)}
        onApply={(hidden) => { setHiddenColumns(hidden); setColumnOpen(false); erpMessage('列设置已应用'); }}
      />
    </div>
  );
}

function TemplateConfigDialog({
  open,
  template,
  onClose,
  onSave,
}: {
  open: boolean;
  template: NewArrivalTemplate | null;
  onClose: () => void;
  onSave: (template: NewArrivalTemplate) => void;
}) {
  const [name, setName] = useState('');
  const [type, setType] = useState('公共');
  const [costs, setCosts] = useState<string[]>(['采购成本', '国内运费', '国际运费', '其他成本']);
  const [rateMode, setRateMode] = useState('实时汇率');
  const [formula, setFormula] = useState('采购成本 * 1.35 + 国内运费 + 国际运费 + 2');
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(template?.name || '');
    setType(template?.type || '公共');
    setFormula(template?.formula || '采购成本 * 1.35 + 国内运费 + 国际运费 + 2');
  }, [open, template]);

  const insert = (token: string) => setFormula((prev) => `${prev}${prev.endsWith(' ') ? '' : ' '}${token}`);

  return (
    <>
      <ErpDialog
        open={open}
        title={template ? '编辑上新价模板' : '新增上新价模板'}
        width={1100}
        onClose={onClose}
        footer={
          <>
            <ErpButton onClick={onClose}>取消</ErpButton>
            <ErpButton onClick={() => setPreviewOpen(true)}>预览计算</ErpButton>
            <ErpButton
              variant="primary"
              onClick={() => {
                if (!name.trim()) {
                  erpMessage('请填写模板名称', 'warning');
                  return;
                }
                onSave({
                  id: template?.id || `NT${String(NEW_ARRIVAL_TEMPLATES.length + 1).padStart(3, '0')}`,
                  name,
                  type,
                  operator: 'admin',
                  updatedAt: '2026-10-31 10:00:00',
                  costCount: costs.length,
                  formula,
                  enabled: template?.enabled ?? true,
                });
              }}
            >
              保存模板
            </ErpButton>
          </>
        }
      >
        <ErpForm layout="vertical">
          <div className="erp-form-grid">
            <ErpFormItem label="模板名称" required>
              <ErpInput value={name} onChange={setName} placeholder="请输入模板名称" maxLength={40} />
            </ErpFormItem>
            <ErpFormItem label="模板类型">
              <ErpRadioGroup options={[{ label: '公共模板', value: '公共' }, { label: '专属模板', value: '专属' }]} value={type} onChange={setType} />
            </ErpFormItem>
          </div>
          <div className="erp-inline-note" style={{ margin: '4px 0 16px' }}>{type === '公共' ? '公共模板可被所有店铺选择。' : '专属模板仅对指定店铺生效，创建后可在店铺模板配置中关联。'}</div>
          <ErpSection title="成本配置" extra={<span className="erp-small erp-muted">勾选后参与定价计算</span>}>
            <div className="erp-flex" style={{ gap: 20, flexWrap: 'wrap', marginBottom: 12 }}>
              {['采购成本', '国内运费', '国际运费', '其他成本', '售后成本', '平台佣金'].map((cost) => (
                <ErpCheckbox key={cost} checked={costs.includes(cost)} onChange={(checked) => setCosts((prev) => (checked ? [...prev, cost] : prev.filter((item) => item !== cost)))}>
                  {cost}
                </ErpCheckbox>
              ))}
            </div>
            <table className="erp-cost-table">
              <thead><tr><th>成本项</th><th>取值方式</th><th>公式 / 数值</th><th>汇率</th></tr></thead>
              <tbody>
                {costs.map((cost) => (
                  <tr key={cost}>
                    <td>{cost}</td>
                    <td><ErpSelect options={[{ label: '变量', value: '变量' }, { label: '常量', value: '常量' }]} value="变量" width={110} /></td>
                    <td>{cost === '采购成本' ? '采购价' : cost === '国内运费' ? '店铺运费模板' : cost === '国际运费' ? '渠道运费' : '0.00'}</td>
                    <td>{cost === '采购成本' ? <ErpSelect options={[{ label: '实时汇率', value: '实时汇率' }, { label: '固定汇率', value: '固定汇率' }]} value={rateMode} onChange={(value) => setRateMode(String(value))} width={110} /> : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ErpSection>
          <div style={{ marginTop: 16 }}>
            <ErpSection title="定价公式" extra={<span className="erp-small erp-muted">支持 + - × ÷ 与括号</span>}>
              <div className="erp-token-bar">
                {['采购成本', '国内运费', '国际运费', '其他成本', '售后成本', '平台佣金'].map((token) => (
                  <button type="button" className="erp-token" key={token} onClick={() => insert(token)}>
                    {token}
                  </button>
                ))}
              </div>
              <textarea className="erp-formula" value={formula} onChange={(event) => setFormula(event.target.value)} rows={4} />
              <div className="erp-small erp-muted" style={{ marginTop: 8 }}>示例：采购成本 * 1.35 + 国内运费 + 国际运费 + 2</div>
            </ErpSection>
          </div>
        </ErpForm>
      </ErpDialog>
      <TemplatePreviewDialog open={previewOpen} title="定价预览" onClose={() => setPreviewOpen(false)} />
    </>
  );
}

export function NewArrivalPricePage() {
  const [rows, setRows] = useState<NewArrivalTemplate[]>(NEW_ARRIVAL_TEMPLATES);
  const [keyword, setKeyword] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [current, setCurrent] = useState<NewArrivalTemplate | null>(null);

  const filtered = rows.filter((row) => !appliedKeyword || row.name.includes(appliedKeyword));

  return (
    <div className="erp-page">
      <PageHeader title="上新价模板配置" description="维护商品上新时的定价模板，支持公共模板与店铺专属模板。" extra={<ErpButton variant="primary" onClick={() => { setCurrent(null); setDialogOpen(true); }}>新增模板</ErpButton>} />
      <div className="erp-card" style={{ padding: 20 }}>
        <FilterBar onQuery={() => setAppliedKeyword(keyword)} onReset={() => { setKeyword(''); setAppliedKeyword(''); }}>
          <span className="erp-filter-field"><label>模板名称</label><ErpInput value={keyword} onChange={setKeyword} onEnter={() => setAppliedKeyword(keyword)} placeholder="请输入模板名称" /></span>
        </FilterBar>
        <ListPage
          header={null}
          columns={[
            { key: 'name', title: '模板名称', minWidth: 180 },
            { key: 'type', title: '模板类型', width: 100, render: (row) => <ErpTag tone={row.type === '公共' ? 'info' : 'brand'}>{row.type}</ErpTag> },
            { key: 'costCount', title: '成本项', width: 90, align: 'right' },
            { key: 'formula', title: '定价公式', minWidth: 240, render: (row) => <span className="erp-code">{row.formula}</span> },
            { key: 'operator', title: '操作人', width: 100 },
            { key: 'updatedAt', title: '操作时间', width: 160 },
            { key: 'enabled', title: '状态', width: 80, render: (row) => <ErpTag tone={row.enabled ? 'success' : 'neutral'}>{row.enabled ? '启用' : '停用'}</ErpTag> },
          ]}
          rows={filtered}
          rowKey={(row) => row.id}
          rowActions={(row) => [
            { label: '编辑', onClick: () => { setCurrent(row); setDialogOpen(true); } },
            { label: '复制', onClick: () => { setRows((prev) => [{ ...row, id: `${row.id}-C`, name: `${row.name} 副本`, updatedAt: '2026-10-31 10:00:00' }, ...prev]); erpMessage('模板已复制'); } },
            { label: '删除', danger: true, onClick: async () => { if (await erpConfirm({ content: `确定删除模板「${row.name}」吗？`, danger: true })) { setRows((prev) => prev.filter((item) => item.id !== row.id)); erpMessage('已删除（演示）'); } } },
          ]}
          filterKey={appliedKeyword}
          pageSizeDefault={10}
        />
      </div>
      <TemplateConfigDialog
        open={dialogOpen}
        template={current}
        onClose={() => setDialogOpen(false)}
        onSave={(next) => {
          setRows((prev) => (prev.some((row) => row.id === next.id) ? prev.map((row) => (row.id === next.id ? next : row)) : [next, ...prev]));
          setDialogOpen(false);
          erpMessage('模板已保存');
        }}
      />
    </div>
  );
}

export function ChannelPricingPage() {
  const [rows, setRows] = useState<PricingRule[]>(PRICING_RULES);
  const [channel, setChannel] = useState('');
  const [store, setStore] = useState('');
  const [applied, setApplied] = useState({ channel: '', store: '' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [current, setCurrent] = useState<PricingRule | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const filtered = rows.filter((row) => (!applied.channel || row.channel === applied.channel) && (!applied.store || row.store === applied.store));

  return (
    <div className="erp-page">
      <PageHeader title="渠道定价配置" description="按平台与店铺配置定价公式、币种、取整规则，配置后作用于商品刊登价格。" extra={<ErpButton variant="primary" onClick={() => { setCurrent(null); setDialogOpen(true); }}>新增定价规则</ErpButton>} />
      <div className="erp-card" style={{ padding: 20 }}>
        <FilterBar onQuery={() => setApplied({ channel, store })} onReset={() => { setChannel(''); setStore(''); setApplied({ channel: '', store: '' }); }}>
          <span className="erp-filter-field"><label>渠道</label><ErpSelect options={PLATFORM_OPTIONS.slice(0, 6)} value={channel} onChange={(value) => setChannel(String(value))} clearable width={150} /></span>
          <span className="erp-filter-field"><label>店铺</label><ErpSelect options={STORE_OPTIONS} value={store} onChange={(value) => setStore(String(value))} clearable width={170} /></span>
        </FilterBar>
        <ListPage
          header={null}
          columns={[
            { key: 'channel', title: '渠道', width: 100 },
            { key: 'store', title: '店铺', width: 150 },
            { key: 'formula', title: '定价公式', minWidth: 220, render: (row) => <span className="erp-code">{row.formula}</span> },
            { key: 'currency', title: '币种', width: 70 },
            { key: 'rounding', title: '取整规则', width: 100 },
            { key: 'includeFreight', title: '运费', width: 90 },
            { key: 'status', title: '状态', width: 80, render: (row) => <ErpSwitch checked={row.status} onChange={(checked) => setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, status: checked, updatedAt: '2026-10-31 10:00:00' } : item)))} /> },
            { key: 'updatedAt', title: '更新时间', width: 160 },
          ]}
          rows={filtered}
          rowKey={(row) => row.id}
          rowActions={(row) => [
            { label: '编辑', onClick: () => { setCurrent(row); setDialogOpen(true); } },
            { label: '复制', onClick: () => { setRows((prev) => [{ ...row, id: `${row.id}-C`, updatedAt: '2026-10-31 10:00:00' }, ...prev]); erpMessage('规则已复制'); } },
            { label: '删除', danger: true, onClick: async () => { if (await erpConfirm({ content: `确定删除「${row.channel} / ${row.store}」的定价规则吗？`, danger: true })) { setRows((prev) => prev.filter((item) => item.id !== row.id)); erpMessage('已删除（演示）'); } } },
          ]}
          batchActions={(selected) => [
            { label: '批量启用', onClick: () => { setRows((prev) => prev.map((row) => (selected.some((target) => target.id === row.id) ? { ...row, status: true } : row))); erpMessage('已批量启用（演示）'); } },
            { label: '批量停用', onClick: () => { setRows((prev) => prev.map((row) => (selected.some((target) => target.id === row.id) ? { ...row, status: false } : row))); erpMessage('已批量停用（演示）'); } },
          ]}
          selectable
          filterKey={`${applied.channel}-${applied.store}`}
        />
      </div>
      <ErpDialog
        open={dialogOpen}
        title={current ? '编辑渠道定价规则' : '新增渠道定价规则'}
        width={720}
        onClose={() => setDialogOpen(false)}
        footer={
          <>
            <ErpButton onClick={() => setDialogOpen(false)}>取消</ErpButton>
            <ErpButton onClick={() => setPreviewOpen(true)}>预览计算</ErpButton>
            <ErpButton variant="primary" onClick={() => { setDialogOpen(false); erpMessage('定价规则已保存（演示）'); }}>保存</ErpButton>
          </>
        }
      >
        <ErpForm layout="vertical">
          <div className="erp-form-grid">
            <ErpFormItem label="渠道" required><ErpSelect options={PLATFORM_OPTIONS.slice(0, 6)} value={current?.channel || '敦煌网'} width="100%" /></ErpFormItem>
            <ErpFormItem label="店铺" required><ErpSelect options={STORE_OPTIONS} value={current?.store || '152'} width="100%" /></ErpFormItem>
            <ErpFormItem label="币种"><ErpSelect options={[{ label: 'USD', value: 'USD' }, { label: 'CNY', value: 'CNY' }, { label: 'EUR', value: 'EUR' }]} value={current?.currency || 'USD'} width="100%" /></ErpFormItem>
            <ErpFormItem label="取整规则"><ErpSelect options={[{ label: '尾数 .99', value: '尾数 .99' }, { label: '四舍五入', value: '四舍五入' }, { label: '向上取整', value: '向上取整' }]} value={current?.rounding || '尾数 .99'} width="100%" /></ErpFormItem>
            <ErpFormItem label="是否含运费"><ErpRadioGroup options={[{ label: '含运费', value: '含运费' }, { label: '不含运费', value: '不含运费' }]} value={current?.includeFreight || '含运费'} /></ErpFormItem>
            <ErpFormItem label="状态"><ErpSwitch checked={current?.status ?? true} /></ErpFormItem>
          </div>
          <ErpFormItem label="定价公式">
            <ErpTextarea value={current?.formula || '采购价 × 1.35 + 运费'} rows={3} />
          </ErpFormItem>
        </ErpForm>
      </ErpDialog>
      <TemplatePreviewDialog open={previewOpen} title="定价预览" onClose={() => setPreviewOpen(false)} />
    </div>
  );
}

export function StoreTemplatePage() {
  const [rows, setRows] = useState(STORE_TEMPLATES);
  const [keyword, setKeyword] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');

  const filtered = rows.filter((row) => !appliedKeyword || row.storeName.includes(appliedKeyword));

  return (
    <div className="erp-page">
      <PageHeader title="店铺模板配置" description="为每个店铺关联运费、售后与上新价模板，修改后对该店铺新商品生效。" />
      <div className="erp-card" style={{ padding: 20 }}>
        <FilterBar onQuery={() => setAppliedKeyword(keyword)} onReset={() => { setKeyword(''); setAppliedKeyword(''); }}>
          <span className="erp-filter-field"><label>店铺名称</label><ErpInput value={keyword} onChange={setKeyword} onEnter={() => setAppliedKeyword(keyword)} placeholder="请输入店铺名称" /></span>
        </FilterBar>
        <ListPage
          header={null}
          columns={[
            { key: 'storeName', title: '店铺', width: 170 },
            { key: 'group', title: '分组', width: 100 },
            {
              key: 'freight',
              title: '运费模板',
              width: 200,
              render: (row) => (
                <ErpSelect
                  options={[{ label: '华磊-美国专线', value: '华磊-美国专线' }, { label: '云途-全球挂号', value: '云途-全球挂号' }, { label: '燕文-欧洲专线', value: '燕文-欧洲专线' }, { label: '递四方-经济小包', value: '递四方-经济小包' }]}
                  value={row.freight}
                  onChange={(value) => { setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, freight: String(value), updatedAt: '2026-10-31 10:00:00' } : item))); erpMessage('运费模板已更新（演示）'); }}
                  width="100%"
                />
              ),
            },
            {
              key: 'afterSale',
              title: '售后模板',
              width: 160,
              render: (row) => (
                <ErpSelect
                  options={[{ label: '7天无理由', value: '7天无理由' }, { label: '15天售后', value: '15天售后' }, { label: '30天质保', value: '30天质保' }]}
                  value={row.afterSale}
                  onChange={(value) => { setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, afterSale: String(value) } : item))); erpMessage('售后模板已更新（演示）'); }}
                  width="100%"
                />
              ),
            },
            {
              key: 'pricing',
              title: '上新价模板',
              width: 200,
              render: (row) => (
                <ErpSelect
                  options={NEW_ARRIVAL_TEMPLATES.map((template) => ({ label: template.name, value: template.name }))}
                  value={row.pricing}
                  onChange={(value) => { setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, pricing: String(value) } : item))); erpMessage('上新价模板已更新（演示）'); }}
                  width="100%"
                />
              ),
            },
            { key: 'operator', title: '操作人', width: 100 },
            { key: 'updatedAt', title: '更新时间', width: 160 },
          ]}
          rows={filtered}
          rowKey={(row) => row.id}
          filterKey={appliedKeyword}
          pageSizeDefault={10}
          selectable
          rowActions={(row) => [
            { label: '编辑配置', onClick: () => erpMessage(`编辑 ${row.storeName} 的店铺模板（演示）`) },
            { label: '重置为默认', onClick: async () => { if (await erpConfirm({ content: `确定将「${row.storeName}」的模板重置为默认配置吗？` })) erpMessage('已重置为默认模板（演示）'); } },
            { label: '复制配置', onClick: () => erpMessage(`已复制 ${row.storeName} 的模板配置（演示）`) },
          ]}
          batchActions={(selected) => [
            { label: '批量重置', onClick: async () => { if (await erpConfirm({ content: `确定重置选中的 ${selected.length} 个店铺模板吗？` })) erpMessage('已批量重置（演示）'); } },
            { label: '导出配置', onClick: () => erpMessage(`已导出 ${selected.length} 个店铺模板配置（演示）`) },
          ]}
        />
      </div>
    </div>
  );
}
