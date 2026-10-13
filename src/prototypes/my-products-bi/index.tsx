/**
 * @name 我的商品 - 骆驼队长BI
 */

import React from 'react';
import './style.css';

import logoBadge from './assets/logo-badge.png';
import thumb1 from './assets/thumb-1.png';
import thumb2 from './assets/thumb-2.png';
import thumb3 from './assets/thumb-3.png';
import thumb4 from './assets/thumb-4.png';
import dh1 from './assets/dh-badge-1.png';
import dh2 from './assets/dh-badge-2.png';
import dh3 from './assets/dh-badge-3.png';
import dh4 from './assets/dh-badge-4.png';
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
import { AnnotationViewer, type AnnotationSourceDocument } from '@axhub/annotation';
import annotationSourceDocument from './annotation-source.json';

const NAV_ITEMS = ['首页', '商品', '交易', '采购', '物流', '报表', '系统', '工具箱', '即时咨询'];

const SIDE_GROUPS: { title: string; items: { label: string; count: string; active?: boolean }[] }[] = [
  { title: '商品概览', items: [{ label: '全部商品', count: '9027' }] },
  {
    title: '发布管理',
    items: [
      { label: '待发布', count: '173' },
      { label: '发布中', count: '0' },
      { label: '循环刊登', count: '8', active: true },
      { label: '发布失败', count: '41' },
    ],
  },
  {
    title: '销售状态',
    items: [
      { label: '已上架', count: '2736' },
      { label: '已下架', count: '3076' },
    ],
  },
  {
    title: '审核与风险',
    items: [
      { label: '待审核', count: '1' },
      { label: '审核未通过', count: '2818' },
      { label: '内容违规', count: '173' },
      { label: '侵权违规', count: '0' },
    ],
  },
];

type StatusKind = 'pending' | 'rejected' | 'failed';

interface LoopStatus {
  enabled: boolean;
  failTimes?: number;
  publishedTimes?: number;
}

interface ProductRow {
  thumb: string;
  dh: string;
  title: string;
  category: string;
  status: StatusKind | null;
  store: string;
  code: string;
  price: string;
  claimAt: string;
  modifyAt: string;
  publishAt: string;
  claimVersion: string;
  currentVersion: string;
  error?: string;
  loop?: LoopStatus;
  withActions?: boolean;
  truncated?: boolean;
}

const STATUS_TEXT: Record<StatusKind, string> = {
  pending: '待审核',
  rejected: '审核未通过',
  failed: '发布失败',
};

const ROWS: ProductRow[] = [
  {
    thumb: thumb1,
    dh: dh1,
    title:
      'High Quality luxury designer bag 2026 Women Viral Quilted Chain Bucket Bag Large Capacity Shoulder Underarm Motorcycle Style Purse Trendy Top Hot Soft Free Shipping',
    category: '箱包及箱包辅料 < 时装包 < 单肩包',
    status: 'pending',
    store: '包包',
    code: '1129618766',
    price: '3999',
    claimAt: '2026-10-10 10:53:56',
    modifyAt: '2026-10-10 16:07:03',
    publishAt: '2026-10-10 11:34:54',
    claimVersion: '1',
    currentVersion: '2',
    loop: { enabled: false, failTimes: 3, publishedTimes: 2 },
    withActions: true,
  },
  {
    thumb: thumb2,
    dh: dh2,
    title:
      'Shoulder Bags For Woman Handbag Classic Monogram Pattern Zipper Crossbody Bag Brown White Daily Commute Casual Travel',
    category: '箱包及箱包辅料 < 时装包 < 单肩包',
    status: 'rejected',
    store: 'sneakerhub8',
    code: '1129637301',
    price: '61.03',
    claimAt: '2026-10-10 14:20:50',
    modifyAt: '2026-10-10 14:41:03',
    publishAt: '2026-10-10 14:39:16',
    claimVersion: '-',
    currentVersion: '4',
    loop: { enabled: true, failTimes: 3, publishedTimes: 1 },
  },
  {
    thumb: thumb3,
    dh: dh3,
    title:
      "Women's bag retro vintage vintage floral large capacity floral bag new Boston pillow bag single shoulder er crossbody bag",
    category: '箱包及箱包辅料 < 时装包 < 单肩包',
    status: 'failed',
    store: 'sneakerhub8',
    code: '116416160',
    price: '61.03',
    claimAt: '2026-10-10 10:48:13',
    modifyAt: '2026-10-10 10:49:01',
    publishAt: '-',
    claimVersion: '-',
    currentVersion: '4',
    error: '产品首图不能重复，请选择其他的图作为产品首图!',
    loop: { enabled: true, failTimes: 2, publishedTimes: 2 },
  },
  {
    thumb: thumb4,
    dh: dh4,
    title: 'Mens Shorts And Tshirt Cartoon Print Elastic Waist Casual Beach Shorts For Men Grey White Daily Wear',
    category: '女士短裤',
    status: 'failed',
    store: 'clothes',
    code: 'BAL-781e80d1-6002-4c24-b0b7-3b99ebe8c74e',
    price: '120',
    claimAt: '2026-09-30 15:40:35',
    modifyAt: '2026-09-30 15:45:25',
    publishAt: '-',
    claimVersion: '1',
    currentVersion: '1',
    error: '请填写产品的腰型属性。',
    loop: { enabled: false, failTimes: 2, publishedTimes: 2 },
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

function Filters() {
  return (
    <div className="mpb-filters">
      <div className="mpb-filter-row">
        <span className="mpb-label">采集源</span>
        <SelectBox value="产品编号" width={100} />
        <div className="mpb-input mpb-search" style={{ width: 213 }}>
          <span className="mpb-input-ph">双击可批量搜索</span>
        </div>
        <span className="mpb-label">价格</span>
        <PriceInput width={141} />
        <span className="mpb-range-dash">-</span>
        <PriceInput width={141} />
        <span className="mpb-label">采集平台</span>
        <SelectBox placeholder="请选择采集平台" width={196} />
        <span className="mpb-label">刊登时间</span>
        <DateRange width={348} />
        <span className="mpb-label">认领时间</span>
        <DateRange width={348} />
      </div>
      <div className="mpb-filter-row">
        <span className="mpb-label">修改时间</span>
        <DateRange width={360} />
        <span className="mpb-label">标签</span>
        <SelectBox placeholder="请选择标签" width={180} />
        <span className="mpb-label">店铺</span>
        <SelectBox placeholder="请选择店铺" width={180} />
        <button type="button" className="mpb-btn mpb-btn-primary">搜索</button>
        <button type="button" className="mpb-btn">重置</button>
        <button type="button" className="mpb-btn mpb-btn-blue-outline">创建新产品</button>
        <button type="button" className="mpb-btn">排序</button>
        <span className="mpb-filter-spacer" />
        <button type="button" className="mpb-btn">导出</button>
        <button type="button" className="mpb-btn">导入货源</button>
        <button type="button" className="mpb-btn">同步线上</button>
        <img className="mpb-gear" src={icGear} alt="列设置" />
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
            <div key={item.label} className={'mpb-side-item' + (item.active ? ' is-active' : '')}>
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

function ProductTable() {
  return (
    <div className="mpb-table">
      <div className="mpb-thead">
        <span className="mpb-col-check"><span className="mpb-checkbox" /></span>
        <span className="mpb-col-img">图片</span>
        <span className="mpb-col-info">商品信息</span>
        <span className="mpb-col-code">产品编号</span>
        <span className="mpb-col-price">售价</span>
        <span className="mpb-col-tag">标签</span>
        <span className="mpb-col-time">时间/版本</span>
        <span className="mpb-col-source">来源</span>
      </div>
      {ROWS.map((row, index) => (
        <div key={index} className={'mpb-tr' + (row.truncated ? ' is-truncated' : '')}>
          <span className="mpb-col-check"><span className="mpb-checkbox" /></span>
          <span className="mpb-col-img">
            {row.thumb && <img className="mpb-thumb" src={row.thumb} alt="" />}
          </span>
          <span className="mpb-col-info">
            <span className="mpb-title">{row.title}</span>
            {row.truncated ? null : (
              <>
                <span className="mpb-meta">
                  <span className="mpb-cat">{row.category}</span>
                  <span className="mpb-meta-right">
                    {row.status && (
                      <span className={'mpb-pill mpb-pill-' + row.status}>{STATUS_TEXT[row.status]}</span>
                    )}
                    <img className="mpb-dh" src={row.dh} alt="DHgate" />
                    <span className="mpb-store">{row.store}</span>
                  </span>
                </span>
                {row.loop && index === 0 && (
                  <span className="mpb-loop-tag">
                    循环刊登次数：3，剩余刊登次数：1
                  </span>
                )}
                {row.loop && index !== 0 && (
                  <span className="mpb-loop-tag">
                    循环刊登次数：{row.loop.failTimes}，剩余刊登次数：{row.loop.publishedTimes}
                  </span>
                )}
                {row.error && <span className="mpb-error">失败原因：{row.error}</span>}
              </>
            )}
          </span>
          <span className="mpb-col-code">{row.code && <span className="mpb-code">{row.code}</span>}</span>
          <span className="mpb-col-price">{row.price && <span className="mpb-money">$ {row.price}</span>}</span>
          <span className="mpb-col-tag" />
          <span className="mpb-col-time">{!row.truncated && <TimeBlock row={row} />}</span>
          <span className="mpb-col-source">{!row.truncated && <span className="mpb-source">-</span>}</span>
        </div>
      ))}
      <div className="mpb-pagination">
        <span className="mpb-total">共 8 条</span>
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

export default function MyProductsBi() {
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
          currentPageId: (() => {
            const hashPageId = new URLSearchParams(window.location.hash.replace(/^#/, '')).get('page');
            const searchPageId = new URLSearchParams(window.location.search.replace(/^\?/, '')).get('page');
            const pageId = hashPageId || searchPageId;
            return typeof pageId === 'string' && /^[a-z0-9-]+$/u.test(pageId)
              ? pageId
              : "my-products-bi";
          })(),
          onDirectoryRoute: (node) => {
            if (typeof node.route === 'string' && /^[a-z0-9-]+$/u.test(node.route)) {
              window.location.hash = `page=${node.route}`;
            }
          },
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
