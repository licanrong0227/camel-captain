/**
 * @name 广告看板（链接产出）
 */

import React, { useEffect, useMemo, useState } from 'react';
import { AlignJustify, Bell, ChevronDown, Crown, HelpCircle, Sun } from 'lucide-react';
import { AnnotationViewer } from '@axhub/annotation';
import type {
  AnnotationDirectoryRouteNode,
  AnnotationSourceDocument,
  AnnotationViewerOptions,
} from '@axhub/annotation';
import logo from './assets/logo.png';
import './style.css';
import { defineHashPageRoute, useHashPage } from '../../common/useHashPage';
import ReportPage from './pages/report';
import annotationSourceDocument from './annotation-source.json';

const ROUTE = defineHashPageRoute([{ id: 'ad-board', title: '广告看板', group: '报表' }], {
  defaultPageId: 'ad-board',
});

const NAV_ITEMS = ['首页', '商品', '交易', '采购', '物流', '报表', '系统', '工具箱', '即时咨询'];

const menuIconProps = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const IconOrderReport = () => (
  <svg {...menuIconProps}>
    <path d="M6 3.5h7.5L18 8v12.5H6z" />
    <path d="M13.5 3.5V8H18" />
    <path d="M9 12h6M9 15.4h6M9 8.6h3" />
  </svg>
);

const IconShopBoard = () => (
  <svg {...menuIconProps}>
    <path d="M4 9.5h16v9.5H4z" />
    <path d="M4 9.5 5.6 5h12.8L20 9.5" />
    <path d="M9.6 19v-5h4.8v5" />
  </svg>
);

const IconAdBoard = () => (
  <svg {...menuIconProps}>
    <path d="M4 19V9M9.3 19V5M14.6 19v-7M20 19v-4.5" />
    <path d="M3 19h18" />
  </svg>
);

interface ReportMenuGroup {
  title: string;
  items: Array<{ label: string; icon: React.ReactNode; active?: boolean; available?: boolean }>;
}

const REPORT_MENUS: ReportMenuGroup[] = [
  { title: '订单', items: [{ label: '订单明细报表', icon: <IconOrderReport /> }] },
  { title: '店铺', items: [{ label: '店铺看板', icon: <IconShopBoard /> }] },
  { title: '广告', items: [{ label: '广告看板', icon: <IconAdBoard />, active: true, available: true }] },
];

function TopBar() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const close = () => setMenuOpen(false);
    window.addEventListener('mousedown', close);
    return () => window.removeEventListener('mousedown', close);
  }, []);

  return (
    <header className="adr-header">
      <img className="adr-logo" src={logo} alt="骆驼队长" />
      <span className="adr-brand-name">骆驼队长</span>
      <span className="adr-brand-sub">智慧运营中台（公测版）</span>
      <span className="adr-sep" />
      <nav className="adr-nav">
        {NAV_ITEMS.map((item) =>
          item === '报表' ? (
            <div
              className="adr-nav-group"
              key={item}
              onMouseEnter={() => setMenuOpen(true)}
              onMouseLeave={() => setMenuOpen(false)}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <span className="adr-nav-item is-solid">{item}</span>
              {menuOpen ? (
                <div className="adr-nav-menu">
                  {REPORT_MENUS.map((group) => (
                    <div className="adr-nav-menu-group" key={group.title}>
                      <div className="adr-nav-menu-title">{group.title}</div>
                      <div className="adr-nav-menu-items">
                        {group.items.map((menuItem) => (
                          <span
                            key={menuItem.label}
                            className={`adr-nav-menu-item${menuItem.active ? ' is-active' : ''}${menuItem.available ? '' : ' is-static'}`}
                            title={menuItem.available ? undefined : '演示原型暂未包含该页面'}
                          >
                            <i className="adr-nav-menu-ico">{menuItem.icon}</i>
                            {menuItem.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <span className="adr-nav-item" key={item}>
              {item}
            </span>
          ),
        )}
      </nav>

      <div className="adr-tools">
        <span className="adr-tool" title="切换主题">
          <Sun size={18} />
        </span>
        <span className="adr-tool" title="菜单">
          <AlignJustify size={18} />
        </span>
        <span className="adr-tool" title="帮助">
          <HelpCircle size={18} />
        </span>
        <span className="adr-tool" title="消息">
          <Bell size={18} />
        </span>
        <span className="adr-vip">
          <Crown size={13} />
          VIP3
        </span>
        <span className="adr-avatar">C</span>
        <ChevronDown size={14} className="adr-caret" />
      </div>
    </header>
  );
}

function Breadcrumb() {
  return (
    <div className="adr-crumb">
      <span>报表</span>
      <span className="adr-crumb__sep">/</span>
      <span>广告</span>
      <span className="adr-crumb__sep">/</span>
      <span className="adr-crumb__current">广告看板</span>
    </div>
  );
}

export default function AdReportPrototype() {
  const { page, setPage } = useHashPage(ROUTE);

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
    <div className="adr-page">
      <TopBar />
      <Breadcrumb />
      <ReportPage />
      <div className="adr-contact">联系我们</div>
      <AnnotationViewer
        source={annotationSourceDocument as unknown as AnnotationSourceDocument}
        options={options}
      />
    </div>
  );
}
