import React, { useState } from 'react';

import AddStoreDialog from '../components/AddStoreDialog';
import iconDhgate from '../assets/icon-dhgate.png';
import iconPdd from '../assets/icon-pdd.png';
import iconShopify from '../assets/icon-shopify.png';

const PLATFORM_TABS = [
  { name: '敦煌网', icon: iconDhgate, active: true },
  { name: '拼多多', icon: iconPdd },
  { name: 'Shopify', icon: iconShopify },
];

interface StoreRow {
  platformId: string;
  platformName: string;
  alias: string;
  storeName: string;
  status: string;
  authStatus: string;
  expireAt: string;
}

const ROWS: StoreRow[] = [
  {
    platformId: '8aaa96199eedb23019f463b9087084d',
    platformName: 'dhgate',
    alias: '运营测试-张诗淇专用',
    storeName: 'sneakerhub8',
    status: '启用',
    authStatus: '已授权',
    expireAt: '2026-11-08 16:09:59',
  },
  {
    platformId: '8aaa8799193596b0191a7756f8f37e0',
    platformName: 'dhgate',
    alias: '服装测试',
    storeName: 'clothes',
    status: '启用',
    authStatus: '已授权',
    expireAt: '2026-10-18 11:57:24',
  },
  {
    platformId: '8aaa20f1965d40d501966c5718eb45f2',
    platformName: 'dhgate',
    alias: 'shoes',
    storeName: '鞋子',
    status: '启用',
    authStatus: '已授权',
    expireAt: '2026-10-18 09:51:51',
  },
  {
    platformId: '8aaa950c9cae845a019cb33193f52aac',
    platformName: 'dhgate',
    alias: 'bag',
    storeName: '包包',
    status: '启用',
    authStatus: '已授权',
    expireAt: '2026-10-18 09:48:29',
  },
];

function IconSearch() {
  return (
    <svg className="si-btn-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="7" cy="7" r="4.6" />
      <path d="M10.6 10.6 14 14" strokeLinecap="round" />
    </svg>
  );
}

function IconRefresh() {
  return (
    <svg className="si-btn-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M13.4 8a5.4 5.4 0 1 1-1.7-3.9" strokeLinecap="round" />
      <path d="M13.6 1.9v3h-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg className="si-btn-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M8 2.6v10.8M2.6 8h10.8" strokeLinecap="round" />
    </svg>
  );
}

function IconChevron({ dir = 'down' }: { dir?: 'down' | 'left' | 'right' }) {
  const rotate = { down: 0, left: 90, right: 270 }[dir];
  return (
    <svg
      className="si-chev"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <path d="M2.6 4.4 6 7.8l3.4-3.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function StoreAuthPage() {
  const [addStoreOpen, setAddStoreOpen] = useState(false);

  return (
    <>
      <div className="si-tabs">
        {PLATFORM_TABS.map((tab) => (
          <span key={tab.name} className={'si-tab' + (tab.active ? ' is-active' : '')}>
            <img src={tab.icon} alt="" />
            {tab.name}
          </span>
        ))}
      </div>

      <div className="si-filter">
        <span className="si-label">店铺名称</span>
        <div className="si-input si-input-search">
          <span className="si-ph">请输入店铺名称</span>
        </div>
        <button className="si-btn si-btn-primary" type="button">
          <IconSearch />
          搜索
        </button>
        <button className="si-btn" type="button">
          <IconRefresh />
          重置
        </button>
      </div>

      <div className="si-actions">
        <button className="si-btn si-btn-primary" type="button" onClick={() => setAddStoreOpen(true)}>
          <IconPlus />
          新增
        </button>
        <button className="si-btn si-btn-primary" type="button">
          店铺分组
        </button>
      </div>

      <div className="si-table-wrap">
        <table className="si-table">
          <colgroup>
            <col style={{ width: '14.754%' }} />
            <col style={{ width: '15.847%' }} />
            <col style={{ width: '15.934%' }} />
            <col style={{ width: '15.792%' }} />
            <col style={{ width: '4.372%' }} />
            <col style={{ width: '15.847%' }} />
            <col style={{ width: '7.923%' }} />
          </colgroup>
          <thead>
            <tr>
              <th data-annotation-id="sa-col-platform-id">平台ID</th>
              <th>平台名称</th>
              <th>店铺别名</th>
              <th>店铺名称</th>
              <th>状态</th>
              <th>授权状态</th>
              <th className="si-td-right" data-annotation-id="sa-col-expire">到期时间</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.platformId}>
                <td>{row.platformId}</td>
                <td>{row.platformName}</td>
                <td>{row.alias}</td>
                <td>{row.storeName}</td>
                <td>
                  <span className="si-tag">{row.status}</span>
                </td>
                <td>
                  <span className="si-tag">{row.authStatus}</span>
                </td>
                <td className="si-td-right">{row.expireAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="si-pag">
        <span className="si-pag-total">共 4 条</span>
        <span className="si-pag-size">
          10条/页
          <IconChevron />
        </span>
        <span className="si-pag-btn is-disabled">
          <IconChevron dir="left" />
        </span>
        <span className="si-pag-num">1</span>
        <span className="si-pag-btn is-disabled">
          <IconChevron dir="right" />
        </span>
        <span className="si-pag-jump-label">前往</span>
        <span className="si-pag-jump-input">1</span>
        <span className="si-pag-unit">页</span>
      </div>

      {addStoreOpen && <AddStoreDialog onClose={() => setAddStoreOpen(false)} />}
    </>
  );
}
