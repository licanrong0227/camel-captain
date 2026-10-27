/**
 * @name 基础配置-渠道定价/上新价模板/店铺模板
 */

import React, { useMemo, useState } from 'react';
import { AnnotationViewer } from '@axhub/annotation';
import type {
  AnnotationDirectoryRouteNode,
  AnnotationSourceDocument,
  AnnotationViewerOptions,
} from '@axhub/annotation';
import logo from './assets/logo.png';
import './style.css';
import { defineHashPageRoute, useHashPage } from '../../common/useHashPage';
import SizeTemplatePage from './pages/size-template';
import annotationSourceDocument from './annotation-source.json';

const NAV_ITEMS = ['首页', '商品', '交易', '采购', '物流', '报表', '系统', '工具箱', '即时咨询'];

const ROUTE = defineHashPageRoute(
  [
    { id: 'size-template', title: '尺码模板设置', group: '基础配置' },
  ],
  { defaultPageId: 'size-template' },
);

const BASIC_CONFIG_ITEMS: { id: string; label: string; route?: string }[] = [
  { id: 'new-arrival-price', label: '上新价模板配置' },
  { id: 'pricing', label: '渠道定价配置' },
  { id: 'store-template', label: '店铺模板配置' },
  { id: 'size-template', label: '尺码模板设置', route: 'size-template' },
];

function ProductMenu(props: { page: string; go: (id: string) => void }) {
  return (
    <div className="bcp-mega">
      <div className="bcp-mega__card">
      <div className="bcp-mega__group">商品管理</div>
      <div className="bcp-mega__items">
        <span className="bcp-mega__item"><i className="bcp-mega__icon">◈</i>商品采集</span>
        <span className="bcp-mega__item"><i className="bcp-mega__icon">▤</i>认领中心</span>
        <span className="bcp-mega__item"><i className="bcp-mega__icon">◉</i>我的商品</span>
      </div>
      <div className="bcp-mega__group">基础配置</div>
      <div className="bcp-mega__items bcp-mega__items--pills">
        {BASIC_CONFIG_ITEMS.map((item) => {
          const route = item.route;
          return (
            <button
              type="button"
              key={item.id}
              className={`bcp-pill${item.id === props.page ? ' is-active' : ''}${route ? '' : ' bcp-pill--static'}`}
              onClick={route ? () => props.go(route) : undefined}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      </div>
    </div>
  );
}

function TopBar(props: { page: string; go: (id: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="bcp-topbar">
      <img className="bcp-logo" src={logo} alt="骆驼队长" />
      <span className="bcp-brand">智慧运营中台</span>
      <span className="bcp-brand-divider" />
      <nav className="bcp-nav">
        {NAV_ITEMS.map((item) => (
          <div
            key={item}
            className="bcp-nav-slot"
            onMouseEnter={item === '商品' ? () => setMenuOpen(true) : undefined}
            onMouseLeave={item === '商品' ? () => setMenuOpen(false) : undefined}
          >
            <a
              className={'bcp-nav-item' + (item === '商品' ? ' is-active' : '')}
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              {item}
            </a>
            {item === '商品' && menuOpen ? <ProductMenu page={props.page} go={props.go} /> : null}
          </div>
        ))}
      </nav>
      <div className="bcp-topbar-right">
        <span className="bcp-vip">♛ VIP3</span>
        <span className="bcp-avatar">C</span>
      </div>
    </header>
  );
}

function Breadcrumb({ page }: { page: string }) {
  const current = ROUTE.pages.find((p) => p.id === page)?.title ?? '';
  return (
    <div className="bcp-crumb">
      <span>商品</span><i>/</i>
      <span>基础配置</span><i>/</i>
      <span className="bcp-crumb__current">{current}</span>
    </div>
  );
}

export default function BasicConfigPages() {
  const { page: hashPage, setPage } = useHashPage(ROUTE);
  const page = ROUTE.pages.some((p) => p.id === hashPage) ? hashPage : ROUTE.defaultPageId;

  const options = useMemo<AnnotationViewerOptions>(() => ({
    showToolbar: true,
    toolbarEdge: 'right',
    emptyWhenNoData: true,
    currentPageId: page,
    onDirectoryRoute: (node: AnnotationDirectoryRouteNode) => {
      if (typeof node.route === 'string') setPage(node.route);
    },
  }), [page, setPage]);

  return (
    <div className="bcp-page">
      <TopBar page={page} go={setPage} />
      <Breadcrumb page={page} />
      <main className="bcp-main">
        {page === 'size-template' ? <SizeTemplatePage /> : null}
      </main>
      <div className="bcp-contact">
        <span>⑥</span>
        <span>联系我们</span>
      </div>
      <AnnotationViewer
        source={annotationSourceDocument as unknown as AnnotationSourceDocument}
        options={options}
      />
    </div>
  );
}
