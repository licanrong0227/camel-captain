/**
 * @name 我的商品
 */

import React, { useMemo, useState } from 'react';
import './style.css';

import logoBadge from './assets/logo-badge.png';
import storeLogo from './assets/store-logo.png';
import img1 from './assets/product-1.jpg';
import img2 from './assets/product-2.jpg';
import img3 from './assets/product-3.jpg';
import img4 from './assets/product-4.jpg';
import img5 from './assets/product-5.jpg';
import img6 from './assets/product-6.jpg';
import img7 from './assets/product-7.jpg';
import img8 from './assets/product-8.jpg';
import img9 from './assets/product-9.jpg';
import img10 from './assets/product-10.png';

import icSun from './assets/icons/sun.svg';
import icHelp from './assets/icons/help.svg';
import icCrown from './assets/icons/crown.svg';
import icCaret from './assets/icons/caret-down.svg';
import icChevron from './assets/icons/chevron-down.svg';
import icCalendar from './assets/icons/calendar.svg';
import icStepper from './assets/icons/stepper.svg';
import icGear from './assets/icons/gear.svg';
import icRefresh from './assets/icons/refresh.svg';
import icHeadset from './assets/icons/headset.svg';
import icArrowUp from './assets/icons/arrow-up.svg';
import icArrowDown from './assets/icons/arrow-down.svg';
import icChevLeft from './assets/icons/chevron-left.svg';
import icChevRight from './assets/icons/chevron-right.svg';

const NAV_ITEMS = ['首页', '商品', '交易', '采购', '物流', '报表', '系统', '工具箱', '即时咨询'];

const SIDE_GROUPS: { title: string; items: { label: string; count: string; active?: boolean }[] }[] = [
  { title: '商品概览', items: [{ label: '全部商品', count: '7886', active: true }] },
  {
    title: '发布管理',
    items: [
      { label: '待发布', count: '11' },
      { label: '发布中', count: '0' },
      { label: '循环刊登', count: '16' },
      { label: '发布失败', count: '2' },
    ],
  },
  {
    title: '销售状态',
    items: [
      { label: '已上架', count: '5909' },
      { label: '已下架', count: '1208' },
      { label: '已删除', count: '55' },
    ],
  },
  {
    title: '审核与风险',
    items: [
      { label: '待审核', count: '0' },
      { label: '审核未通过', count: '639' },
      { label: '内容违规', count: '40' },
      { label: '侵权违规', count: '0' },
      { label: '品牌商投诉', count: '2' },
    ],
  },
  {
    title: '其他',
    items: [
      { label: '未定义', count: '4' },
      { label: '回收站', count: '0' },
    ],
  },
];

type SaleState = 'on' | 'off';

interface ProductRow {
  id: string;
  thumb: string;
  title: string;
  category: string;
  status: SaleState;
  store: string;
  code: string;
  price: string;
  group: string;
  claimAt: string;
  modifyAt: string;
  publishAt: string;
  batchEditing?: boolean;
}

const ROWS: ProductRow[] = [
  {
    id: '1',
    thumb: img1,
    title:
      'Dog collar Designer Pet PU luxury leather collars Travel supplies Four leaf clover zircon cat collars with diamonds Pet fashionable collars',
    category: '宠物用品 < 狗用品 < 狗项圈和牵引带 < 狗项圈',
    status: 'off',
    store: '产品测试专用',
    code: '1079989061',
    price: '33.39',
    group: '待分组',
    claimAt: '2026-11-20 10:21:18',
    modifyAt: '2026-11-20 10:21:18',
    publishAt: '2026-07-31 22:04:05',
  },
  {
    id: '2',
    thumb: img2,
    title: 'Blue Dog Apparel Pet Hoodie Soft Printed Striped Jumpsuit Four Leg Daily Walking For Small Dogs',
    category: '宠物用品 < 狗用品 < 狗服饰 < 其他狗服饰用品',
    status: 'off',
    store: '产品测试专用',
    code: '1134975383',
    price: '29.45',
    group: '待分组',
    claimAt: '2026-11-20 10:21:17',
    modifyAt: '2026-11-20 10:21:17',
    publishAt: '2026-11-12 14:48:01',
  },
  {
    id: '3',
    thumb: img3,
    title:
      'and Autumn Winter Dog Four Leg Clothing Pet Cute Hoodies Pink jumpsuit Clothes Outdoor Spring Free New Shipping Wholesale',
    category: '宠物用品 < 狗用品 < 狗服饰 < 其他狗服饰用品',
    status: 'off',
    store: '产品测试专用',
    code: '1134986339',
    price: '1',
    group: '待分组',
    claimAt: '2026-11-20 10:21:16',
    modifyAt: '2026-11-20 10:21:16',
    publishAt: '2026-11-12 15:20:12',
  },
  {
    id: '4',
    thumb: img4,
    title: 'Ergonomic Kitty Condo Kit Modular Design Cat Playground featuring Spacious Resting Platforms',
    category: '宠物用品 < 猫用品 < 猫家具及抓扒工具 < 落地式猫爬架',
    status: 'on',
    store: '产品测试专用',
    code: '1060394845',
    price: '462.93',
    group: '待分组',
    claimAt: '2026-11-20 10:21:15',
    modifyAt: '2026-11-20 10:21:15',
    publishAt: '2026-07-31 19:08:05',
    batchEditing: true,
  },
  {
    id: '5',
    thumb: img5,
    title:
      'board vertical scratching post duarable cat scratcher high quality Corrugated cardboard Cat Scratching padXJ240817',
    category: '宠物用品 < 猫用品 < 猫家具及抓扒工具 < 落地式猫爬架',
    status: 'on',
    store: '产品测试专用',
    code: '1060394874',
    price: '117.3',
    group: '待分组',
    claimAt: '2026-11-20 10:21:14',
    modifyAt: '2026-11-20 10:21:14',
    publishAt: '2026-07-31 19:08:03',
  },
  {
    id: '6',
    thumb: img6,
    title:
      'Tree Toy Tower condo for Indoor Cats Cat House with Padded Plush Perch Cozy Hammock and Sisal Scratching Posts',
    category: '宠物用品 < 猫用品 < 猫家具及抓扒工具 < 落地式猫爬架',
    status: 'on',
    store: '产品测试专用',
    code: '1060394905',
    price: '282.61',
    group: '待分组',
    claimAt: '2026-11-20 10:21:13',
    modifyAt: '2026-11-20 10:21:13',
    publishAt: '2026-07-31 19:08:02',
  },
  {
    id: '7',
    thumb: img7,
    title:
      'Made4Pets Modern Tree Large Cat, Wood Tower Heavy Duty with Scratch Post for Indoor Big Cats, Extra Tall Cat Condo Sturdy Frisco Castlel, 3-7days delivery',
    category: '宠物用品 < 猫用品 < 猫家具及抓扒工具 < 猫屋',
    status: 'on',
    store: '产品测试专用',
    code: '1060394925',
    price: '528.7',
    group: '待分组',
    claimAt: '2026-11-20 10:21:12',
    modifyAt: '2026-11-20 10:21:12',
    publishAt: '2026-07-31 19:08:05',
  },
  {
    id: '8',
    thumb: img8,
    title: 'Dog Collars Collar Explosion-proof Flushing Neck Ring Outdoor Training Pet Supplies',
    category: '宠物用品 < 狗用品 < 狗项圈和牵引带 < 狗项圈',
    status: 'on',
    store: '产品测试专用',
    code: '1060394977',
    price: '54.13',
    group: '待分组',
    claimAt: '2026-11-20 10:21:11',
    modifyAt: '2026-11-20 10:21:11',
    publishAt: '2026-04-09 11:54:01',
  },
  {
    id: '9',
    thumb: img9,
    title:
      'Ultra-Quiet 50.72 Oz Clear Pet Drinking Fountain, with 1 Water Pumb- USB Powered, Easy to Clean, BPA Free, Suitable for Cats And Small Pets, Without Battery',
    category: '宠物用品 < 猫用品 < 猫食具及附件 < 猫用饮水喷泉和饮水器',
    status: 'on',
    store: '产品测试专用',
    code: '1060395051',
    price: '87.13',
    group: '待分组',
    claimAt: '2026-11-20 10:21:10',
    modifyAt: '2026-11-20 10:21:10',
    publishAt: '2026-07-31 19:08:04',
  },
  {
    id: '10',
    thumb: img10,
    title: 'Hot Sale Portable 350ml/550ml Dog Outdoor Walking Puppy Pet Travel Water Bottle Cat Drinking Bowl Dogs Supplies s',
    category: '宠物用品 < 狗用品 < 狗服饰 < 狗户外装备',
    status: 'on',
    store: '产品测试专用',
    code: '1060395077',
    price: '48.13',
    group: '待分组',
    claimAt: '2026-11-20 10:21:09',
    modifyAt: '2026-11-20 10:21:09',
    publishAt: '2026-07-31 19:08:04',
  },
];

const BATCH_ACTIONS = ['批量编辑', '批量更新发布', '批量标签', '批量删除', '批量AI克隆'];

function SelectBox({ placeholder, value, width }: { placeholder?: string; value?: string; width?: number }) {
  return (
    <div className="mp-input mp-select" style={{ width }}>
      <span className={value ? 'mp-input-text' : 'mp-input-ph'}>{value || placeholder}</span>
      <img className="mp-chev" src={icChevron} alt="" />
    </div>
  );
}

function DateRange({ width }: { width?: number }) {
  return (
    <div className="mp-range" style={{ width }}>
      <div className="mp-input mp-date">
        <img className="mp-cal" src={icCalendar} alt="" />
        <span className="mp-input-ph">开始日期</span>
      </div>
      <span className="mp-range-to">至</span>
      <div className="mp-input mp-date mp-date-end">
        <span className="mp-input-ph">结束日期</span>
      </div>
    </div>
  );
}

function PriceInput() {
  return (
    <div className="mp-input mp-price">
      <span className="mp-input-text">0</span>
      <img className="mp-stepper" src={icStepper} alt="" />
    </div>
  );
}

function TaskIcon() {
  return (
    <svg className="mp-task-icon" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 2.5h7.5L13 5v8.5H3z" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5 6.2h6M5 8.6h6M5 11h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M2.2 4.5v9h7.6" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg className="mp-bell" viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="M10 2.6a4.7 4.7 0 0 0-4.7 4.7v3.1L4 13h12l-1.3-2.6V7.3A4.7 4.7 0 0 0 10 2.6Z"
        fill="none"
        stroke="#606266"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M8.2 15.2a1.9 1.9 0 0 0 3.6 0" fill="none" stroke="#606266" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function TopBar() {
  return (
    <header className="mp-topbar">
      <img className="mp-logo" src={logoBadge} alt="骆驼队长" />
      <div className="mp-brand">
        <b>骆驼队长</b>
        <span>智慧运营中台</span>
      </div>
      <nav className="mp-nav">
        {NAV_ITEMS.map((item) => (
          <a key={item} className={'mp-nav-item' + (item === '商品' ? ' is-active' : '')} href="#">
            {item}
          </a>
        ))}
      </nav>
      <div className="mp-topbar-right">
        <span className="mp-task">
          <TaskIcon />
          <span className="mp-task-num">88</span>
          任务管理器
        </span>
        <img className="mp-tool-icon" src={icSun} alt="切换主题" />
        <img className="mp-tool-icon" src={icGear} alt="设置" />
        <img className="mp-tool-icon" src={icHelp} alt="帮助" />
        <span className="mp-bell-wrap">
          <BellIcon />
          <i className="mp-bell-dot" />
        </span>
        <span className="mp-vip">
          <img src={icCrown} alt="" />
          VIP3
        </span>
        <span className="mp-avatar">L</span>
        <img className="mp-caret" src={icCaret} alt="" />
      </div>
    </header>
  );
}

function TabBand() {
  return (
    <div className="mp-tabs">
      <span className="mp-tab">商品采集</span>
      <span className="mp-tab">认领中心</span>
      <span className="mp-tab is-active">
        <span className="mp-tab-dot" />
        我的商品
      </span>
    </div>
  );
}

function Filters() {
  return (
    <div className="mp-filters">
      <div className="mp-filter-row">
        <div className="mp-field">
          <SelectBox value="产品编号" width={106} />
        </div>
        <div className="mp-input mp-search">
          <span className="mp-input-ph">双击可批量搜索</span>
        </div>
        <div className="mp-field">
          <span className="mp-label">价格</span>
          <PriceInput />
          <span className="mp-range-dash">-</span>
          <PriceInput />
        </div>
        <div className="mp-field">
          <span className="mp-label">采集平台</span>
          <SelectBox placeholder="请选择采集平台" width={196} />
        </div>
        <div className="mp-field">
          <span className="mp-label">刊登时间</span>
          <DateRange width={348} />
        </div>
        <div className="mp-field">
          <span className="mp-label">认领时间</span>
          <DateRange width={348} />
        </div>
      </div>
      <div className="mp-filter-row">
        <div className="mp-field">
          <span className="mp-label">修改时间</span>
          <DateRange width={352} />
        </div>
        <div className="mp-field">
          <span className="mp-label">标签</span>
          <SelectBox placeholder="请选择标签" width={180} />
        </div>
        <div className="mp-field">
          <span className="mp-label">店铺</span>
          <SelectBox placeholder="请选择店铺" width={180} />
        </div>
        <div className="mp-field">
          <span className="mp-label">线上分组</span>
          <SelectBox placeholder="请选择线上分组" width={196} />
        </div>
        <div className="mp-action-group">
          <button type="button" className="mp-btn mp-btn-primary">
            搜索
          </button>
          <button type="button" className="mp-btn">
            重置
          </button>
          <button type="button" className="mp-btn mp-btn-blue-outline">
            创建新产品
          </button>
          <button type="button" className="mp-btn">
            排序
          </button>
        </div>
        <span className="mp-filter-spacer" />
        <div className="mp-action-group">
          <button type="button" className="mp-btn">
            导出
          </button>
          <button type="button" className="mp-btn">
            导入货源
          </button>
          <button type="button" className="mp-btn">
            同步线上
          </button>
          <img className="mp-gear" src={icGear} alt="列设置" />
        </div>
      </div>
    </div>
  );
}

function SideStats() {
  return (
    <aside className="mp-side">
      {SIDE_GROUPS.map((group) => (
        <div key={group.title} className="mp-side-group">
          <div className="mp-side-title">
            <span>{group.title}</span>
            {group.title === '商品概览' && <img className="mp-side-refresh" src={icRefresh} alt="刷新" />}
          </div>
          {group.items.map((item) => (
            <div key={item.label} className={'mp-side-item' + (item.active ? ' is-active' : '')}>
              <span>{item.label}</span>
              <span className="mp-side-num">{item.count}</span>
            </div>
          ))}
        </div>
      ))}
    </aside>
  );
}

function Checkbox({
  checked,
  indeterminate,
  onClick,
  label,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onClick: (e: React.MouseEvent) => void;
  label: string;
}) {
  return (
    <span
      className={'mp-check' + (checked || indeterminate ? ' is-checked' : '')}
      role="checkbox"
      aria-checked={indeterminate ? 'mixed' : checked}
      aria-label={label}
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(e as unknown as React.MouseEvent);
        }
      }}
    >
      {indeterminate ? <i className="mp-check-dash" /> : checked ? <i className="mp-check-mark" /> : null}
    </span>
  );
}

function RowActions({ status }: { status: SaleState }) {
  const actions =
    status === 'on'
      ? ['编辑', '更新发布', '更新价格', '标签', '删除', 'AI一键克隆', '下架']
      : ['更新发布', '标签', '删除', 'AI一键克隆', '上架'];
  return (
    <div className="mp-action-row" onClick={(e) => e.stopPropagation()}>
      <div className="mp-action-bar">
        {actions.map((action) => (
          <button key={action} type="button" className="mp-action-btn">
            {action}
            {action === '更新价格' && <span className="mp-qmark">?</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <span className="mp-spinner" aria-hidden="true">
      {Array.from({ length: 12 }).map((_, index) => (
        <i
          key={index}
          style={{
            transform: `rotate(${index * 30}deg)`,
            animationDelay: `${(index - 12) / 12}s`,
          }}
        />
      ))}
    </span>
  );
}

function ProductRowView({
  row,
  expanded,
  selected,
  onToggleExpand,
  onToggleSelect,
}: {
  row: ProductRow;
  expanded: boolean;
  selected: boolean;
  onToggleExpand: () => void;
  onToggleSelect: (e: React.MouseEvent) => void;
}) {
  return (
    <>
      <div
        className={'mp-tr' + (expanded ? ' is-expanded' : '')}
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest('button, a, input, .mp-check')) return;
          onToggleExpand();
        }}
      >
        {row.batchEditing && (
          <span className="mp-edit-mask" onClick={(e) => e.stopPropagation()}>
            <span className="mp-edit-mask-inner">
              <Spinner />
              <span className="mp-edit-mask-text">批量编辑中</span>
            </span>
          </span>
        )}
        <span className="mp-col mp-col-check">
          <Checkbox checked={selected} onClick={onToggleSelect} label={`选择 ${row.code}`} />
        </span>
        <span className="mp-col mp-col-img">
          <img className="mp-thumb" src={row.thumb} alt="" />
        </span>
        <span className="mp-col mp-col-info">
          <span className="mp-title">{row.title}</span>
          <span className="mp-meta">
            <span className="mp-cat">{row.category}</span>
            <span className="mp-meta-right">
              <span className={'mp-state mp-state-' + row.status}>{row.status === 'on' ? '已上架' : '已下架'}</span>
              <span className="mp-store">
                <img src={storeLogo} alt="" />
                <span>{row.store}</span>
              </span>
            </span>
          </span>
        </span>
        <span className="mp-col mp-col-code">
          <span className="mp-cell-text">{row.code}</span>
        </span>
        <span className="mp-col mp-col-price">
          <span className="mp-price-text">$ {row.price}</span>
        </span>
        <span className="mp-col mp-col-group">
          <span className="mp-cell-text">{row.group}</span>
        </span>
        <span className="mp-col mp-col-tag" />
        <span className="mp-col mp-col-time">
          <span className="mp-times">
            <span>认领：{row.claimAt}</span>
            <span>修改：{row.modifyAt}</span>
            <span>刊登：{row.publishAt}</span>
            <span>认领版本号：-</span>
            <span>当前版本号：-</span>
          </span>
        </span>
        <span className="mp-col mp-col-source">
          <span className="mp-source">-</span>
        </span>
      </div>
      {expanded && <RowActions status={row.status} />}
    </>
  );
}

function Pagination() {
  return (
    <div className="mp-pagination">
      <span className="mp-total">共 7870 条</span>
      <div className="mp-page-size">
        <span>10条/页</span>
        <img src={icChevron} alt="" />
      </div>
      <button type="button" className="mp-page-btn is-disabled" aria-label="上一页">
        <img src={icChevLeft} alt="" />
      </button>
      <button type="button" className="mp-page-btn is-active">
        1
      </button>
      {['2', '3', '4', '5'].map((n) => (
        <button key={n} type="button" className="mp-page-btn">
          {n}
        </button>
      ))}
      <span className="mp-ellipsis">···</span>
      <button type="button" className="mp-page-btn">
        787
      </button>
      <button type="button" className="mp-page-btn" aria-label="下一页">
        <img src={icChevRight} alt="" />
      </button>
      <span className="mp-jump">
        前往
        <span className="mp-jump-input">1</span>
        页
      </span>
    </div>
  );
}

export default function MyProducts() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const allSelected = selectedIds.length === ROWS.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const toggleAll = () => {
    setSelectedIds(allSelected ? [] : ROWS.map((row) => row.id));
  };

  return (
    <div className="mp-page">
      <TopBar />
      <div className="mp-crumb">
        <span>商品</span>
        <i>/</i>
        <span>商品管理</span>
        <i>/</i>
        <span className="is-current">我的商品</span>
      </div>
      <div className="mp-card">
        <TabBand />
        <Filters />
        <div className="mp-body">
          <SideStats />
          <section className="mp-main">
            <div className="mp-table-scroll">
              <div className="mp-thead">
                <span className="mp-col mp-col-check">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAll();
                    }}
                    label="全选当前页"
                  />
                </span>
                <span className="mp-col mp-col-img">图片</span>
                <span className="mp-col mp-col-info">商品信息</span>
                <span className="mp-col mp-col-code">产品编号</span>
                <span className="mp-col mp-col-price">售价</span>
                <span className="mp-col mp-col-group">线上分组</span>
                <span className="mp-col mp-col-tag">标签</span>
                <span className="mp-col mp-col-time">时间/版本</span>
                <span className="mp-col mp-col-source">来源</span>
              </div>
              <div className="mp-tbody">
                {ROWS.map((row) => (
                  <ProductRowView
                    key={row.id}
                    row={row}
                    expanded={expandedId === row.id}
                    selected={selectedSet.has(row.id)}
                    onToggleExpand={() => setExpandedId((prev) => (prev === row.id ? null : row.id))}
                    onToggleSelect={(e) => {
                      e.stopPropagation();
                      toggleSelect(row.id);
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="mp-footer">
              <div className="mp-footer-actions">
                {selectedIds.length > 0 && (
                  <>
                    <span className="mp-selected">已选 {selectedIds.length} 项</span>
                    {BATCH_ACTIONS.map((action) => (
                      <button key={action} type="button" className="mp-batch-btn">
                        {action}
                      </button>
                    ))}
                  </>
                )}
              </div>
              <Pagination />
            </div>
          </section>
        </div>
      </div>
      <div className="mp-contact">
        <img src={icHeadset} alt="" />
        <span>联系我们</span>
      </div>
      <div className="mp-scroll">
        <button type="button" aria-label="向上滚动">
          <img src={icArrowUp} alt="" />
        </button>
        <button type="button" aria-label="向下滚动">
          <img src={icArrowDown} alt="" />
        </button>
      </div>
    </div>
  );
}
