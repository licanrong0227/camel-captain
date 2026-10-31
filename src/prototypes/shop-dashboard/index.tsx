/**
 * @name 店铺看板
 */

import React, { useEffect, useMemo, useState } from 'react';
import { AlignJustify, BarChart3, Bell, ChevronDown, Crown, FileText, Headphones, HelpCircle, Store, Sun } from 'lucide-react';
import { AnnotationViewer } from '@axhub/annotation';
import type {
  AnnotationDirectoryRouteNode,
  AnnotationSourceDocument,
  AnnotationViewerOptions,
} from '@axhub/annotation';
import logo from './assets/logo.png';
import './style.css';
import { defineHashPageRoute, useHashPage } from '../../common/useHashPage';
import DashboardPage from './pages/dashboard';
import annotationSourceDocument from './annotation-source.json';

const ROUTE = defineHashPageRoute(
  [
    { id: 'dashboard', title: '店铺看板', group: '店铺' },
  ],
  { defaultPageId: 'dashboard' },
);

const NAV_ITEMS = ['首页', '商品', '交易', '采购', '物流', '报表', '系统', '工具箱', '即时咨询'];

function ReportMenu({ onOpenDashboard }: { onOpenDashboard: () => void }) {
  return (
    <div className="ss-nav-menu">
      <div className="ss-nav-menu-group">
        <div className="ss-nav-menu-title">订单</div>
        <div className="ss-nav-menu-items">
          <span className="ss-nav-menu-item is-static">
            <i className="ss-nav-menu-ico"><FileText size={16} /></i>
            订单明细报表
          </span>
        </div>
      </div>
      <div className="ss-nav-menu-group">
        <div className="ss-nav-menu-title">店铺</div>
        <div className="ss-nav-menu-items">
          <span className="ss-nav-menu-item is-active" onClick={onOpenDashboard}>
            <i className="ss-nav-menu-ico"><Store size={16} /></i>
            店铺看板
          </span>
        </div>
      </div>
      <div className="ss-nav-menu-group">
        <div className="ss-nav-menu-title">广告</div>
        <div className="ss-nav-menu-items">
          <span className="ss-nav-menu-item is-static">
            <i className="ss-nav-menu-ico"><BarChart3 size={16} /></i>
            广告看板
          </span>
        </div>
      </div>
    </div>
  );
}

function TopBar({ onOpenDashboard }: { onOpenDashboard: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="ss-navbar">
      <div className="ss-logo-area">
        <img className="ss-logo" src={logo} alt="logo" />
        <span className="ss-logo-subtitle">智慧运营中台</span>
      </div>
      <div className="ss-divider">|</div>
      <nav className="ss-top-nav">
        {NAV_ITEMS.map((item) =>
          item === '报表' ? (
            <div
              className="ss-nav-group"
              key={item}
              onMouseEnter={() => setMenuOpen(true)}
              onMouseLeave={() => setMenuOpen(false)}
            >
              <span className="ss-nav-item is-active">{item}</span>
              {menuOpen ? <ReportMenu onOpenDashboard={onOpenDashboard} /> : null}
            </div>
          ) : (
            <span className="ss-nav-item" key={item}>{item}</span>
          ),
        )}
      </nav>
      <div className="ss-tools">
        <span className="ss-tool" title="切换主题"><Sun size={18} /></span>
        <span className="ss-tool" title="菜单"><AlignJustify size={18} /></span>
        <span className="ss-tool" title="帮助"><HelpCircle size={18} /></span>
        <span className="ss-tool" title="消息"><Bell size={18} /></span>
        <span className="ss-vip"><Crown size={12} />VIP3</span>
        <span className="ss-avatar">C</span>
        <ChevronDown size={13} className="ss-caret" />
      </div>
    </header>
  );
}

function Breadcrumb({ page }: { page: string }) {
  const title = ROUTE.pages.find((item) => item.id === page)?.title || '店铺看板';
  const items = ['报表', '店铺', title];
  return (
    <div className="ss-crumb">
      {items.map((item, index) => (
        <React.Fragment key={item}>
          {index > 0 ? <span className="ss-crumb__sep">/</span> : null}
          <span className={index === items.length - 1 ? 'ss-crumb__current' : 'ss-crumb__parent'}>{item}</span>
        </React.Fragment>
      ))}
    </div>
  );
}

export default function ShopDashboardPrototype() {
  const { page, setPage } = useHashPage(ROUTE);

  useEffect(() => {
    if (page !== 'dashboard') setPage('dashboard');
  }, [page, setPage]);

  const options = useMemo<AnnotationViewerOptions>(
    () => ({
      showToolbar: true,
      toolbarEdge: 'right',
      emptyWhenNoData: true,
      currentPageId: page,
      onDirectoryRoute: (node: AnnotationDirectoryRouteNode) => {
        if (typeof node.route === 'string') setPage(node.route);
      },
    }),
    [page, setPage],
  );

  return (
    <div className="ss-page">
      <TopBar onOpenDashboard={() => setPage('dashboard')} />
      <Breadcrumb page={page} />
      {page === 'dashboard' ? <DashboardPage /> : null}
      <div className="ss-contact">
        <Headphones size={20} />
        <span>联系我们</span>
      </div>
      <AnnotationViewer
        source={annotationSourceDocument as unknown as AnnotationSourceDocument}
        options={options}
      />
    </div>
  );
}
