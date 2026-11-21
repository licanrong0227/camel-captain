import React, { useEffect, useMemo, useState } from 'react';
import CreateProductDialog from '../components/CreateProductDialog';
import AiCloneDialog from '../components/AiCloneDialog';
import SyncOnlineDialog from '../components/SyncOnlineDialog';
import type { DialogRequest } from '../dialog-route';

import thumbSneaker from '../assets/thumb-sneaker.jpg';
import thumbBracelet from '../assets/thumb-bracelet.jpg';
import dhBadge from '../assets/dh-badge.png';
import iconDhgate from '../assets/icon-dhgate.png';
import iconShopify from '../assets/icon-shopify.png';
import icChevron from '../assets/icons/chevron-down.svg';
import icCalendar from '../assets/icons/calendar.svg';
import icStepper from '../assets/icons/stepper.svg';
import icGear from '../assets/icons/gear.svg';
import icRefresh from '../assets/icons/refresh.svg';
import icArrowUp from '../assets/icons/arrow-up.svg';
import icArrowDown from '../assets/icons/arrow-down.svg';
import icChevLeft from '../assets/icons/chevron-left.svg';
import icChevRight from '../assets/icons/chevron-right.svg';

const SIDE_GROUPS: { title: string; refresh?: boolean; annotationId?: string; items: { label: string; count: string; active?: boolean }[] }[] = [
  { title: '商品概览', refresh: true, items: [{ label: '全部商品', count: '9172', active: true }] },
  {
    title: '发布管理',
    items: [
      { label: '待发布', count: '266' },
      { label: '发布中', count: '0' },
      // { label: '循环刊登', count: '17' },
      { label: '发布失败', count: '75' },
    ],
  },
  {
    title: '销售状态',
    annotationId: 'mp-side-sale-status',
    items: [
      { label: '已上架', count: '2740' },
      { label: '已下架', count: '3077' },
    ],
  },
  // {
  //   title: '审核与风险',
  //   items: [
  //     { label: '待审核', count: '0' },
  //     { label: '审核未通过', count: '2823' },
  //     { label: '内容违规', count: '173' },
  //     { label: '侵权违规', count: '0' },
  //   ],
  // },
];

interface ProductRow {
  image?: string;
  imageText?: string;
  title: string;
  category: string;
  store: string;
  parentSku: string;
  price: string;
  claimAt: string;
  modifyAt: string;
  publishAt: string;
  claimVersion: string;
  currentVersion: string;
  source: string;
  status?: string;
}

const ROWS: ProductRow[] = [
  {
    imageText: '图片7',
    title:
      'Cross-border 50 million CMOS sensor entry-level optical zoom digital camera for student selfie photos wholesale',
    category: '计算机和网络 < 电脑周边附件 < 电脑分享器',
    store: '鞋子',
    parentSku: '20261015000004',
    price: '$ 70.10',
    claimAt: '2026-10-15 17:29:48',
    modifyAt: '2026-10-15 17:50:30',
    publishAt: '-',
    claimVersion: '4',
    currentVersion: '1',
    source: '1688',
  },
  {
    image: thumbSneaker,
    title:
      'Running Shoes Black White Star Low Top Lace Skate Sneakers Suede Leather Daily Commute Casual Streetwear For Men',
    category: '鞋类及鞋类辅料 < 运动鞋 < 跑鞋',
    store: 'sneakerhub8',
    parentSku: '1116615775',
    price: '$ 54.62',
    claimAt: '2026-10-15 15:37:05',
    modifyAt: '2026-10-15 15:37:05',
    publishAt: '-',
    claimVersion: '2',
    currentVersion: '1',
    source: '-',
  },
  {
    image: thumbBracelet,
    title: 'Identification Bracelets For Women Cat Tunnel Plush Toy Soft Kitten Play Collapsible Green Interactive Pet Exercise Gift',
    category: '珠宝 > 手链 · 手镯 > 手牌手链',
    store: 'sneakerhub8',
    parentSku: '-',
    price: '$ 0.00',
    claimAt: '2026-10-15 15:30:24',
    modifyAt: '2026-10-15 15:30:24',
    publishAt: '-',
    claimVersion: '1',
    currentVersion: '1',
    source: '-',
  },
  {
    image: thumbSneaker,
    title:
      'Running Shoes Black White Star Low Top Lace Skate Sneakers Suede Leather Daily Commute Casual Streetwear For Men',
    category: '鞋类及鞋类辅料 < 运动鞋 < 跑鞋',
    store: '鞋子',
    parentSku: '1116615775',
    price: '$ 54.62',
    claimAt: '2026-10-14 10:06:40',
    modifyAt: '2026-10-15 15:06:58',
    publishAt: '-',
    claimVersion: '1',
    currentVersion: '2',
    source: '-',
  },
  {
    image: thumbBracelet,
    title: 'Identification Bracelets For Women Cat Tunnel Plush Toy Soft Kitten Play Collapsible Green Interactive Pet Exercise Gift',
    category: '珠宝 > 手链 · 手镯 > 手牌手链',
    store: 'clothes',
    parentSku: '-',
    price: '$ 0.00',
    claimAt: '2026-10-15 14:12:10',
    modifyAt: '2026-10-15 14:12:10',
    publishAt: '-',
    claimVersion: '-',
    currentVersion: '-',
    source: '-',
  },
];

function SelectBox({ placeholder, value, width }: { placeholder?: string; value?: string; width: number }) {
  return (
    <div className="sip-input sip-select" style={{ width }}>
      {value ? <span className="sip-input-text">{value}</span> : <span className="sip-input-ph">{placeholder}</span>}
      <img className="sip-chev" src={icChevron} alt="" />
    </div>
  );
}

const PLATFORM_STORES: { platform: string; name: string; authStatus: string }[] = [
  { platform: 'dhgate', name: '运营测试-张诗淇专用', authStatus: '已授权' },
  { platform: 'dhgate', name: '服装测试', authStatus: '已授权' },
  { platform: 'dhgate', name: 'shoes', authStatus: '已授权' },
  { platform: 'dhgate', name: 'bag', authStatus: '已授权' },
  { platform: 'shopify', name: 'camel-captain', authStatus: '已授权' },
  { platform: 'shopify', name: 'camel-outlet', authStatus: '已授权' },
  { platform: 'shopify', name: 'camel-home', authStatus: '未授权' },
];

function authorizedStores(platformId: string): string[] {
  return PLATFORM_STORES.filter((s) => s.platform === platformId && s.authStatus === '已授权').map((s) => s.name);
}

function StoreSelect({
  platformId,
  value,
  onChange,
  width,
}: {
  platformId: string;
  value: string;
  onChange: (name: string) => void;
  width: number;
}) {
  const [open, setOpen] = useState(false);
  const options = authorizedStores(platformId);

  return (
    <div
      className="sip-input sip-select"
      style={{ width }}
      data-annotation-id="mp-filter-store"
      onClick={() => setOpen((prev) => !prev)}
    >
      {value ? <span className="sip-input-text">{value}</span> : <span className="sip-input-ph">请选择店铺</span>}
      <img className="sip-chev" src={icChevron} alt="" />
      {open && (
        <>
          <span className="sip-menu-mask" onClick={(e) => { e.stopPropagation(); setOpen(false); }} />
          <div className="sip-select-menu">
            {options.length === 0 ? (
              <div className="sip-select-menu__empty">当前平台暂无已授权店铺</div>
            ) : (
              options.map((name) => (
                <div
                  key={name}
                  className={name === value ? 'sip-select-menu__item is-active' : 'sip-select-menu__item'}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(name);
                    setOpen(false);
                  }}
                >
                  {name}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

function DateRange({ width }: { width: number }) {
  return (
    <div className="sip-range" style={{ width }}>
      <div className="sip-input sip-date" style={{ flex: 1 }}>
        <img className="sip-cal" src={icCalendar} alt="" />
        <span className="sip-input-ph">开始日期</span>
      </div>
      <span className="sip-range-to">至</span>
      <div className="sip-input sip-date sip-date-end" style={{ flex: 1 }}>
        <span className="sip-input-ph">结束日期</span>
      </div>
    </div>
  );
}

function PriceInput({ width }: { width: number }) {
  return (
    <div className="sip-input sip-price" style={{ width }}>
      <img className="sip-stepper" src={icStepper} alt="" />
    </div>
  );
}

const PLATFORMS = [
  { id: 'dhgate', label: '敦煌网', icon: iconDhgate },
  { id: 'shopify', label: 'shopify', icon: iconShopify },
];

function TabBand({
  platformId,
  onPlatform,
}: {
  platformId: string;
  onPlatform: (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const platform = PLATFORMS.find((item) => item.id === platformId) ?? PLATFORMS[1];

  return (
    <div className="sip-tabs">
      <span className="sip-tab">商品采集</span>
      <span className="sip-tab">认领中心</span>
      <div className="sip-tab is-active sip-tab-platform" data-annotation-id="mp-platform-switch">
        <svg className="sip-tab-shape" viewBox="0 0 400 48" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="sipTabStroke" x1="0" y1="0" x2="400" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f5c4a0" stopOpacity="0" />
              <stop offset="16%" stopColor="#f5c4a0" stopOpacity="1" />
              <stop offset="84%" stopColor="#f5c4a0" stopOpacity="1" />
              <stop offset="100%" stopColor="#f5c4a0" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            fill="#fff"
            d="M0 48 C30 48 50 40 62 20 C68 10 70 0 74 0 H326 C330 0 332 10 338 20 C350 40 370 48 400 48 H0 Z"
          />
          <path
            fill="none"
            stroke="url(#sipTabStroke)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            d="M0 48 C30 48 50 40 62 20 C68 10 70 0 74 0 H326 C330 0 332 10 338 20 C350 40 370 48 400 48"
          />
        </svg>
        <span className="sip-tab-dot" />
        <img className="sip-tab-logo" src={platform.icon} alt="" />
        <span className="sip-tab-label">{`我的商品-${platform.label}`}</span>
        <span
          className={'sip-tab-caret' + (menuOpen ? ' is-open' : '')}
          role="button"
          aria-label="切换平台"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <img src={icChevron} alt="" />
          <span className="sip-tab-caret-tip" aria-hidden="true">切换平台</span>
        </span>
        {menuOpen && (
          <>
            <span className="sip-menu-mask" onClick={() => setMenuOpen(false)} />
            <div className="sip-platform-menu">
              {PLATFORMS.map((item) => (
                <div
                  key={item.id}
                  className={item.id === platform.id ? 'sip-platform-menu__item is-active' : 'sip-platform-menu__item'}
                  onClick={() => {
                    onPlatform(item.id);
                    setMenuOpen(false);
                  }}
                >
                  <img className="sip-platform-menu__icon" src={item.icon} alt="" />
                  {item.label}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Filters({
  platformId,
  store,
  onStoreChange,
  onCreate,
  onSync,
}: {
  platformId: string;
  store: string;
  onStoreChange: (name: string) => void;
  onCreate: () => void;
  onSync: () => void;
}) {
  return (
    <div className="sip-filters">
      <div className="sip-filter-row">
        <span className="sip-label">采集源</span>
        <SelectBox value="产品编号" width={100} />
        <div className="sip-input" style={{ width: 213 }}>
          <span className="sip-input-ph">双击可批量搜索</span>
        </div>
        <span className="sip-label">价格</span>
        <PriceInput width={141} />
        <span className="sip-range-dash">-</span>
        <PriceInput width={141} />
        <span className="sip-label">采集平台</span>
        <SelectBox placeholder="请选择采集平台" width={196} />
        <span className="sip-label">刊登时间</span>
        <DateRange width={348} />
        <span className="sip-label">认领时间</span>
        <DateRange width={348} />
      </div>
      <div className="sip-filter-row">
        <span className="sip-label">修改时间</span>
        <DateRange width={360} />
        <span className="sip-label">标签</span>
        <SelectBox placeholder="请选择标签" width={180} />
        <span className="sip-label">店铺</span>
        <StoreSelect platformId={platformId} value={store} onChange={onStoreChange} width={180} />
        <button type="button" className="sip-btn sip-btn-primary">搜索</button>
        <button type="button" className="sip-btn">重置</button>
        <button type="button" className="sip-btn sip-btn-blue-outline" onClick={onCreate}>创建新产品</button>
        <button type="button" className="sip-btn">排序</button>
        <span className="sip-filter-spacer" />
        <button type="button" className="sip-btn">导出</button>
        <button type="button" className="sip-btn">导入货源</button>
        <button type="button" className="sip-btn" data-annotation-id="mp-sync-online" onClick={onSync}>同步线上</button>
        <img className="sip-gear" src={icGear} alt="列设置" />
      </div>
    </div>
  );
}

function SideStats() {
  return (
    <aside className="sip-side">
      {SIDE_GROUPS.map((group) => (
        <div key={group.title} className="sip-side-group" data-annotation-id={group.annotationId}>
          <div className="sip-side-title">
            <span>{group.title}</span>
            {group.refresh && <img className="sip-side-refresh" src={icRefresh} alt="刷新" />}
          </div>
          {group.items.map((item) => (
            <div key={item.label} className={'sip-side-item' + (item.active ? ' is-active' : '')}>
              <span>{item.label}</span>
              <span className="sip-side-num">{item.count}</span>
            </div>
          ))}
        </div>
      ))}
    </aside>
  );
}

function TimeBlock({ row }: { row: ProductRow }) {
  return (
    <div className="sip-times">
      <div>认领：{row.claimAt}</div>
      <div>修改：{row.modifyAt}</div>
      <div>刊登：{row.publishAt}</div>
      <div>认领版本号：{row.claimVersion}</div>
      <div>当前版本号：{row.currentVersion}</div>
    </div>
  );
}

const ROW_ACTIONS = ['编辑', '更新发布', '标签', '删除', 'AI一键克隆'];
const BATCH_ACTIONS = ['批量编辑', '批量更新发布', '批量标签', '批量删除', '批量AI克隆'];

function ProductTable({
  onEdit,
  onClone,
  notify,
}: {
  onEdit: () => void;
  onClone: (count: number) => void;
  notify: (message: string) => void;
}) {
  const [rows, setRows] = useState<ProductRow[]>(ROWS);
  const [selected, setSelected] = useState<number[]>([0]);
  const [expanded, setExpanded] = useState<number | null>(0);

  const allChecked = rows.length > 0 && selected.length === rows.length;
  const someChecked = selected.length > 0 && !allChecked;

  const toggleRow = (index: number) => {
    setSelected((prev) => (prev.includes(index) ? prev.filter((item) => item !== index) : [...prev, index]));
  };

  const toggleAll = () => {
    setSelected((prev) => (prev.length === rows.length ? [] : rows.map((_, index) => index)));
  };

  const handleRowAction = (action: string, index: number) => {
    if (action === '编辑') {
      onEdit();
      return;
    }
    if (action === '更新发布') {
      setRows((prev) => prev.map((row, i) => (i === index ? { ...row, status: '发布中' } : row)));
      notify('已提交更新发布：1 条商品');
      return;
    }
    if (action === '标签') {
      notify('已提交标签设置：1 条商品');
      return;
    }
    if (action === '删除') {
      setRows((prev) => prev.filter((_, i) => i !== index));
      setSelected([]);
      setExpanded(null);
      notify('已删除 1 条商品');
      return;
    }
    if (action === 'AI一键克隆') {
      onClone(selected.includes(index) ? selected.length : 1);
    }
  };

  const handleBatch = (action: string) => {
    const count = selected.length;
    if (action === '批量编辑') {
      notify(`已提交批量编辑：${count} 条商品`);
      return;
    }
    if (action === '批量更新发布') {
      setRows((prev) => prev.map((row, index) => (selected.includes(index) ? { ...row, status: '发布中' } : row)));
      notify(`已提交更新发布：${count} 条商品`);
      return;
    }
    if (action === '批量标签') {
      notify(`已提交标签设置：${count} 条商品`);
      return;
    }
    if (action === '批量删除') {
      setRows((prev) => prev.filter((_, index) => !selected.includes(index)));
      setSelected([]);
      setExpanded(null);
      notify(`已删除 ${count} 条商品`);
      return;
    }
    if (action === '批量AI克隆') onClone(count);
  };

  return (
    <div className="sip-table">
      <div className="sip-thead">
        <span
          className="sip-col-check"
          role="checkbox"
          aria-label="全选商品"
          aria-checked={allChecked ? 'true' : someChecked ? 'mixed' : 'false'}
          onClick={toggleAll}
        >
          <span className={'sip-checkbox' + (allChecked ? ' is-checked' : '') + (someChecked ? ' is-indeterminate' : '')} />
        </span>
        <span className="sip-col-img">图片</span>
        <span className="sip-col-info">商品信息</span>
        <div className="sip-col-sku" data-annotation-id="mp-col-product-id">产品编号</div>
        <span className="sip-col-price">售价</span>
        <span className="sip-col-tag">标签</span>
        <span className="sip-col-time">时间/版本</span>
        <span className="sip-col-source">来源</span>
      </div>
      {rows.map((row, index) => (
        <React.Fragment key={index}>
          <div
            className={'sip-tr' + (expanded === index ? ' is-expanded' : '')}
            onClick={(event) => {
              if ((event.target as HTMLElement).closest('.sip-col-check')) return;
              setExpanded((prev) => (prev === index ? null : index));
            }}
          >
            <span
              className="sip-col-check"
              role="checkbox"
              aria-label={`选择商品：${row.title}`}
              aria-checked={selected.includes(index)}
              onClick={(event) => {
                event.stopPropagation();
                toggleRow(index);
              }}
            >
              <span className={'sip-checkbox' + (selected.includes(index) ? ' is-checked' : '')} />
            </span>
            <span className="sip-col-img">
              {row.image ? (
                <img className="sip-thumb" src={row.image} alt="" />
              ) : (
                <span className="sip-thumb sip-thumb-text">{row.imageText}</span>
              )}
            </span>
            <span className="sip-col-info">
              <span className="sip-title">{row.title}</span>
              <span className="sip-meta">
                <span className="sip-cat">{row.category}</span>
                <span className="sip-meta-right">
                  <span className="sip-pill">{row.status ?? '待发布'}</span>
                  <img className="sip-dh" src={dhBadge} alt="DHgate" />
                  <span className="sip-store">{row.store}</span>
                </span>
              </span>
            </span>
            <span className="sip-col-sku"><span className="sip-sku">{row.parentSku}</span></span>
            <span className="sip-col-price"><span className="sip-money">{row.price}</span></span>
            <span className="sip-col-tag" />
            <span className="sip-col-time"><TimeBlock row={row} /></span>
            <span className="sip-col-source">
              <span className={'sip-source' + (row.source === '-' ? '' : ' is-link')}>{row.source}</span>
            </span>
          </div>
          {expanded === index ? (
            <div className="sip-actions-row">
              {ROW_ACTIONS.map((action) => (
                <button
                  key={action}
                  type="button"
                  className="sip-action-btn"
                  onClick={() => handleRowAction(action, index)}
                >
                  {action}
                </button>
              ))}
            </div>
          ) : null}
        </React.Fragment>
      ))}
      <div className="sip-table-footer">
        {selected.length > 0 ? (
          <div className="sip-batch-bar">
            <span className="sip-selected-count">已选 {selected.length} 项</span>
            {BATCH_ACTIONS.map((action) => (
              <button
                key={action}
                type="button"
                className="sip-btn sip-btn-mini"
                onClick={() => handleBatch(action)}
              >
                {action}
              </button>
            ))}
          </div>
        ) : null}
        <div className="sip-pagination">
          <span className="sip-total">共 266 条</span>
          <SelectBox value="10条/页" width={110} />
          <span className="sip-page-btn"><img src={icChevLeft} alt="上一页" /></span>
          <span className="sip-page-btn is-active">1</span>
          {[2, 3, 4, 5, 6].map((n) => (
            <span key={n} className="sip-page-btn">{n}</span>
          ))}
          <span className="sip-page-btn sip-page-ellipsis">…</span>
          <span className="sip-page-btn">27</span>
          <span className="sip-page-btn"><img src={icChevRight} alt="下一页" /></span>
          <span className="sip-jump">前往</span>
          <div className="sip-input sip-jump-input"><span className="sip-input-text">1</span></div>
          <span className="sip-jump">页</span>
        </div>
      </div>
    </div>
  );
}

function ScrollFloat() {
  return (
    <div className="sip-scroll">
      <button type="button" aria-label="向上滚动"><img src={icArrowUp} alt="" /></button>
      <button type="button" aria-label="向下滚动"><img src={icArrowDown} alt="" /></button>
    </div>
  );
}

export default function MyProductsPage({ dialogRequest }: { dialogRequest?: DialogRequest }) {
  const [platformId, setPlatformId] = useState('shopify');
  const [store, setStore] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState('创建新产品');
  const [cloneCount, setCloneCount] = useState<number | null>(null);
  const [syncOpen, setSyncOpen] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!dialogRequest) return;
    const dialog = dialogRequest.dialog;
    setCreateTitle(dialog === 'edit-product' ? '编辑产品' : '创建新产品');
    setCreateOpen(dialog === 'create-product' || dialog === 'edit-product');
    setCloneCount(dialog === 'ai-clone' ? 1 : null);
    setSyncOpen(dialog === 'sync-online');
  }, [dialogRequest]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const openCreate = () => {
    setCreateTitle('创建新产品');
    setCreateOpen(true);
  };

  const openEdit = () => {
    setCreateTitle('编辑产品');
    setCreateOpen(true);
  };

  const handlePlatform = (id: string) => {
    setPlatformId(id);
    if (!authorizedStores(id).includes(store)) setStore('');
  };

  const syncStores = useMemo(
    () => PLATFORM_STORES
      .filter((item) => item.authStatus === '已授权')
      .map((item) => ({
        storeId: `${item.platform}::${item.name}`,
        storeName: item.name,
        storeAliasName: item.name,
        platformId: item.platform,
        platformName: PLATFORMS.find((platform) => platform.id === item.platform)?.label ?? item.platform,
      })),
    [],
  );

  return (
    <>
      <TabBand platformId={platformId} onPlatform={handlePlatform} />
      <Filters
        platformId={platformId}
        store={store}
        onStoreChange={setStore}
        onCreate={openCreate}
        onSync={() => setSyncOpen(true)}
      />
      <div className="sip-body">
        <SideStats />
        <ProductTable onEdit={openEdit} onClone={(count) => setCloneCount(count)} notify={setToast} />
      </div>
      <ScrollFloat />
      {createOpen && <CreateProductDialog title={createTitle} onClose={() => setCreateOpen(false)} />}
      {cloneCount !== null && <AiCloneDialog count={cloneCount} onClose={() => setCloneCount(null)} />}
      {syncOpen && <SyncOnlineDialog stores={syncStores} onClose={() => setSyncOpen(false)} />}
      {toast ? <div className="sip-toast">{toast}</div> : null}
    </>
  );
}
