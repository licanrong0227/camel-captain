/**
 * @name 我的商品-认领异常
 */

import React from 'react';
import { AnnotationViewer, type AnnotationSourceDocument } from '@axhub/annotation';
import annotationSourceDocument from './annotation-source.json';
import './style.css';

import logoBadge from './assets/logo-badge.png';
import thumb2 from './assets/thumb-2.png';
import thumb3 from './assets/thumb-3.png';
import dh2 from './assets/dh-badge-2.png';
import dh3 from './assets/dh-badge-3.png';
import icSun from './assets/icons/sun.svg';
import icMenu from './assets/icons/menu.svg';
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

const SIDE_GROUPS: { title: string; items: { label: string; count: string; active?: boolean; annotationId?: string }[] }[] = [
  { title: '商品概览', items: [{ label: '全部商品', count: '9304' }] },
  {
    title: '发布管理',
    items: [
      { label: '认领异常', count: '2', active: true, annotationId: 'claim-status-menu' },
      { label: '待发布', count: '353' },
      { label: '发布中', count: '1' },
      { label: '循环刊登', count: '35' },
      { label: '发布失败', count: '85' },
    ],
  },
  {
    title: '销售状态',
    items: [
      { label: '已上架', count: '2741' },
      { label: '已下架', count: '3080' },
    ],
  },
  {
    title: '审核与风险',
    items: [
      { label: '待审核', count: '0' },
      { label: '审核未通过', count: '2835' },
      { label: '内容违规', count: '173' },
      { label: '侵权违规', count: '0' },
      { label: '品牌商投诉', count: '1' },
    ],
  },
  {
    title: '其他',
    items: [
      { label: '未定义', count: '0' },
      { label: '回收站', count: '0' },
    ],
  },
];

interface ClaimExceptionItem {
  name: string;
  summary: string;
  desc: string;
  log: string;
  time: string;
}

interface ProductRow {
  thumb: string;
  dh: string;
  title: string;
  category: string;
  store: string;
  code: string;
  price: string;
  claimBatchAt: string;
  claimAt: string;
  modifyAt: string;
  publishAt: string;
  claimVersion: string;
  currentVersion: string;
  exceptions: ClaimExceptionItem[];
}

const ROWS: ProductRow[] = [
  {
    thumb: thumb3,
    dh: dh3,
    title:
      "Women's bag retro vintage vintage floral large capacity floral bag new Boston pillow bag single shoulder crossbody bag",
    category: '箱包及箱包辅料 < 时装包 < 单肩包',
    store: '包包',
    code: '1130024250',
    price: '61.03',
    claimBatchAt: '2026-10-23 10:31:13',
    claimAt: '2026-10-23 10:31:13',
    modifyAt: '2026-10-23 10:33:08',
    publishAt: '-',
    claimVersion: '1',
    currentVersion: '1',
    exceptions: [
      {
        name: '商品重量为 0',
        summary: '无法计算国际运费',
        desc: '批量认领时未获取到商品重量，无法计算国际运费，请在编辑产品中补充商品重量。',
        log: 'CLAIM-20261023-001',
        time: '2026-10-23 10:31:20',
      },
    ],
  },
  {
    thumb: thumb2,
    dh: dh2,
    title:
      'Running Shoe Grey Purple Star Low Top Lace Suede Look Skate Sneakers Daily Commute Casual Streetwear For Men',
    category: '鞋类及鞋类辅料 < 运动鞋 < 跑鞋',
    store: '鞋子',
    code: '1130916259',
    price: '54.62',
    claimBatchAt: '2026-10-23 11:08:42',
    claimAt: '2026-10-23 11:08:42',
    modifyAt: '2026-10-23 11:10:25',
    publishAt: '-',
    claimVersion: '1',
    currentVersion: '2',
    exceptions: [
      {
        name: '商品重量为 0',
        summary: '无法计算国际运费',
        desc: '批量认领时未获取到商品重量，无法计算国际运费，请在编辑产品中补充商品重量。',
        log: 'CLAIM-20261023-017',
        time: '2026-10-23 11:08:47',
      },
      {
        name: '标题翻译失败',
        summary: '未生成中文标题',
        desc: '英文标题翻译为中文时服务超时，未生成中文标题，请重试翻译或手动补充标题。',
        log: 'CLAIM-20261023-018',
        time: '2026-10-23 11:08:52',
      },
      {
        name: '规格图片下载失败',
        summary: '规格图缺失',
        desc: '规格「颜色：Grey Purple」的图片下载失败，商品规格图缺失，请重新上传规格图。',
        log: 'CLAIM-20261023-019',
        time: '2026-10-23 11:09:03',
      },
    ],
  },
];

function SelectBox({ placeholder, value, width }: { placeholder?: string; value?: string; width: number }) {
  return (
    <div className="mpb-input mpb-select" style={{ width }}>
      {value ? <span className="mpb-input-text">{value}</span> : <span className="mpb-input-ph">{placeholder}</span>}
      <img className="mpb-chev" src={icChevron} alt="" />
    </div>
  );
}

function DateRange({ width }: { width: number }) {
  return (
    <div className="mpb-range" style={{ width }}>
      <div className="mpb-input mpb-date" style={{ flex: 1 }}>
        <img className="mpb-cal" src={icCalendar} alt="" />
        <span className="mpb-input-ph">开始日期</span>
      </div>
      <span className="mpb-range-to">至</span>
      <div className="mpb-input mpb-date mpb-date-end" style={{ flex: 1 }}>
        <span className="mpb-input-ph">结束日期</span>
      </div>
    </div>
  );
}

function PriceInput({ width }: { width: number }) {
  return (
    <div className="mpb-input mpb-price" style={{ width }}>
      <img className="mpb-stepper" src={icStepper} alt="" />
    </div>
  );
}

function TopBar() {
  return (
    <header className="mpb-topbar">
      <img className="mpb-logo" src={logoBadge} alt="骆驼队长" />
      <div className="mpb-brand">
        <b>骆驼队长</b>
        <span>智慧运营中台（公测版）</span>
      </div>
      <span className="mpb-brand-divider" />
      <nav className="mpb-nav">
        {NAV_ITEMS.map((item) => (
          <a key={item} className={'mpb-nav-item' + (item === '商品' ? ' is-active' : '')} href="#">
            {item}
          </a>
        ))}
      </nav>
      <div className="mpb-topbar-right">
        <img className="mpb-tool-icon" src={icSun} alt="切换主题" />
        <img className="mpb-tool-icon" src={icMenu} alt="菜单" />
        <img className="mpb-tool-icon" src={icHelp} alt="帮助" />
        <span className="mpb-vip">
          <img src={icCrown} alt="" />
          VIP3
        </span>
        <span className="mpb-avatar">C</span>
        <img className="mpb-caret" src={icCaret} alt="" />
      </div>
    </header>
  );
}

function TabBand() {
  return (
    <div className="mpb-tabs">
      <span className="mpb-tab">商品采集</span>
      <span className="mpb-tab">认领中心</span>
      <span className="mpb-tab is-active">
        <span className="mpb-tab-dot" />
        我的商品
      </span>
    </div>
  );
}

function FilterItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span className="mpb-filter-item">
      <span className="mpb-label">{label}</span>
      {children}
    </span>
  );
}

function Filters() {
  return (
    <div className="mpb-filters">
      <div className="mpb-filter-row">
        <FilterItem label="采集源">
          <SelectBox value="产品编号" width={100} />
          <div className="mpb-input mpb-search" style={{ width: 213 }}>
            <span className="mpb-input-ph">双击可批量搜索</span>
          </div>
        </FilterItem>
        <FilterItem label="价格">
          <PriceInput width={141} />
          <span className="mpb-range-dash">-</span>
          <PriceInput width={141} />
        </FilterItem>
        <FilterItem label="采集平台">
          <SelectBox placeholder="请选择采集平台" width={196} />
        </FilterItem>
        <FilterItem label="刊登时间">
          <DateRange width={348} />
        </FilterItem>
        <FilterItem label="认领时间">
          <DateRange width={348} />
        </FilterItem>
      </div>
      <div className="mpb-filter-row">
        <FilterItem label="修改时间">
          <DateRange width={360} />
        </FilterItem>
        <FilterItem label="标签">
          <SelectBox placeholder="请选择标签" width={180} />
        </FilterItem>
        <FilterItem label="店铺">
          <SelectBox placeholder="请选择店铺" width={180} />
        </FilterItem>
        <span className="mpb-filter-actions">
          <button type="button" className="mpb-btn mpb-btn-primary">搜索</button>
          <button type="button" className="mpb-btn">重置</button>
          <button type="button" className="mpb-btn mpb-btn-blue-outline">创建新产品</button>
          <button type="button" className="mpb-btn">排序</button>
        </span>
        <span className="mpb-filter-spacer" />
        <span className="mpb-filter-tools">
          <button type="button" className="mpb-btn">导出</button>
          <button type="button" className="mpb-btn">导入货源</button>
          <button type="button" className="mpb-btn">同步线上</button>
          <img className="mpb-gear" src={icGear} alt="列设置" />
        </span>
      </div>
    </div>
  );
}

function SideStats() {
  return (
    <aside className="mpb-side">
      {SIDE_GROUPS.map((group) => (
        <div key={group.title} className="mpb-side-group">
          <div className="mpb-side-title">
            <span>{group.title}</span>
            {group.title === '商品概览' && <img className="mpb-side-refresh" src={icRefresh} alt="刷新" />}
          </div>
          {group.items.map((item) => (
            <div
              key={item.label}
              className={'mpb-side-item' + (item.active ? ' is-active' : '')}
              data-annotation-id={item.annotationId}
            >
              <span>{item.label}</span>
              <span className="mpb-side-num">{item.count}</span>
            </div>
          ))}
        </div>
      ))}
    </aside>
  );
}

function TimeBlock({ row }: { row: ProductRow }) {
  return (
    <div className="mpb-times">
      <div>认领：{row.claimAt}</div>
      <div>修改：{row.modifyAt}</div>
      <div>刊登：{row.publishAt}</div>
      <div>认领版本号：{row.claimVersion}</div>
      <div>当前版本号：{row.currentVersion}</div>
    </div>
  );
}

function ClaimExceptionBar({ row, annotationId }: { row: ProductRow; annotationId?: string }) {
  const multiple = row.exceptions.length > 1;
  return (
    <div className="mpb-claim-bar" data-annotation-id={annotationId}>
      <span className="mpb-claim-bar-icon" aria-hidden="true">!</span>
      <span className="mpb-claim-bar-text">
        {row.exceptions.map((item, index) => (
          <span className="mpb-claim-bar-item" key={item.log}>
            {multiple && <i>{index + 1}</i>}
            {item.name}，{item.summary}
          </span>
        ))}
      </span>
    </div>
  );
}

function ProductTable() {
  return (
    <div className="mpb-table">
      <div className="mpb-thead">
        <span className="mpb-col-expand" />
        <span className="mpb-col-check"><span className="mpb-checkbox" /></span>
        <span className="mpb-col-img">图片</span>
        <span className="mpb-col-info">商品信息</span>
        <span className="mpb-col-code">产品编号</span>
        <span className="mpb-col-price">售价</span>
        <span className="mpb-col-tag">标签</span>
        <span className="mpb-col-time">时间/版本</span>
        <span className="mpb-col-source">来源</span>
      </div>
      {ROWS.map((row, rowIndex) => (
        <div key={row.code} className="mpb-tr">
          <span className="mpb-col-expand">
            <span className="mpb-expand-btn" aria-hidden="true">
              <img src={icChevRight} alt="" />
            </span>
          </span>
          <span className="mpb-col-check"><span className="mpb-checkbox" /></span>
          <span className="mpb-col-img">
            <img className="mpb-thumb" src={row.thumb} alt="" />
          </span>
          <span className="mpb-col-info">
            <span className="mpb-title">{row.title}</span>
            <span className="mpb-meta">
              <span className="mpb-cat">{row.category}</span>
              <span className="mpb-meta-right">
                <span className="mpb-pill mpb-pill-claim-error">认领异常</span>
                <img className="mpb-dh" src={row.dh} alt="DHgate" />
                <span className="mpb-store">{row.store}</span>
              </span>
            </span>
            <ClaimExceptionBar
              row={row}
              annotationId={rowIndex === 0 ? 'claim-error-source' : undefined}
            />
          </span>
          <span className="mpb-col-code"><span className="mpb-code">{row.code}</span></span>
          <span className="mpb-col-price"><span className="mpb-money">$ {row.price}</span></span>
          <span className="mpb-col-tag" />
          <span className="mpb-col-time"><TimeBlock row={row} /></span>
          <span className="mpb-col-source"><span className="mpb-source">-</span></span>
        </div>
      ))}
      <div className="mpb-pagination">
        <span className="mpb-total">共 2 条</span>
        <SelectBox value="10条/页" width={90} />
        <span className="mpb-page-btn"><img src={icChevLeft} alt="上一页" /></span>
        <span className="mpb-page-btn is-active">1</span>
        <span className="mpb-page-btn"><img src={icChevRight} alt="下一页" /></span>
        <span className="mpb-jump">前往</span>
        <div className="mpb-input mpb-jump-input"><span className="mpb-input-text">1</span></div>
        <span className="mpb-jump">页</span>
      </div>
    </div>
  );
}

export default function MyProductsClaimException() {
  return (
    <>
      <div className="mpb-page">
        <TopBar />
        <div className="mpb-crumb">
          <span>商品</span><i>/</i><span>商品管理</span><i>/</i><span className="is-current">我的商品</span>
        </div>
        <div className="mpb-card">
          <TabBand />
          <Filters />
          <div className="mpb-body">
            <SideStats />
            <ProductTable />
          </div>
        </div>
        <div className="mpb-contact">
          <img src={icHeadset} alt="" />
          <span>联系我们</span>
        </div>
        <div className="mpb-scroll">
          <button type="button" aria-label="向上滚动"><img src={icArrowUp} alt="" /></button>
          <button type="button" aria-label="向下滚动"><img src={icArrowDown} alt="" /></button>
        </div>
      </div>
      <AnnotationViewer
        source={annotationSourceDocument as unknown as AnnotationSourceDocument}
        options={{
          currentPageId: 'my-products-claim-exception',
          toolbarEdge: 'right',
          showToolbar: true,
          showThemeToggle: true,
          showColorFilter: true,
          emptyWhenNoData: true,
        }}
      />
    </>
  );
}
