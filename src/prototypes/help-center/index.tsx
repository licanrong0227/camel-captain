/**
 * @name 帮助中心
 * @mode axure
 *
 * 参考资料：
 * - rules/axure-export-workflow.md
 * - rules/prototype-development-guide.md
 * - rules/axure-api-guide.md
 */

import React, { forwardRef, useState, useImperativeHandle, useCallback } from 'react';
import {
    Play,
    Search,
    Home,
    LayoutGrid,
} from 'lucide-react';
import { defineHashPageRoute, useHashPage } from '../../common/useHashPage';
import './style.css';
import { AnnotationViewer, type AnnotationSourceDocument } from '@axhub/annotation';
import annotationSourceDocument from './annotation-source.json';
import type { AxureHandle, AxureProps, EventItem, Action, KeyDesc, ConfigItem, DataDesc } from '../../common/axure-types';
import { createEventEmitter, getConfigValue } from '../../common/axure-types';

type NavItem = {
    id: string;
    title: string;
    icon: React.ReactNode;
    children?: NavItem[];
};

const GridIcon = <LayoutGrid size={16} />;

// ============ Axure API 列表定义 ============

const EVENT_LIST: EventItem[] = [
    { name: 'onNavigate', desc: '页面导航切换时触发，payload 为页面ID字符串' },
    { name: 'onSearch', desc: '搜索关键词改变时触发，payload 为搜索关键词' },
    { name: 'onToggleGroup', desc: '展开/折叠导航分组时触发，payload 为分组ID和状态JSON字符串' },
];

const ACTION_LIST: Action[] = [
    { name: 'navigate', desc: '导航到指定页面，参数格式：页面ID字符串（如 "dashboard"）', params: 'string' },
    { name: 'resetSearch', desc: '重置搜索框内容为空' },
    { name: 'expandAll', desc: '展开所有导航分组' },
    { name: 'collapseAll', desc: '折叠所有导航分组' },
];

const VAR_LIST: KeyDesc[] = [
    { name: 'current_page_id', desc: '当前激活的页面ID' },
    { name: 'search_keyword', desc: '当前搜索关键词' },
    { name: 'expanded_groups', desc: '当前展开的分组ID列表（JSON字符串）' },
];

const CONFIG_LIST: ConfigItem[] = [
    {
        type: 'input',
        attributeId: 'search_placeholder',
        displayName: '搜索占位符',
        info: '搜索框的占位提示文本',
        initialValue: '搜索帮助文档...',
    },
    {
        type: 'input',
        attributeId: 'title',
        displayName: '标题',
        info: '页面标题文本',
        initialValue: '帮助中心',
    },
    {
        type: 'checkbox',
        attributeId: 'show_annotation',
        displayName: '显示标注',
        info: '是否显示右侧标注面板',
        initialValue: true,
    },
];

const DATA_LIST: DataDesc[] = [
    {
        name: 'navigation',
        desc: '导航数据',
        keys: [
            { name: 'id', desc: '导航项ID' },
            { name: 'title', desc: '导航项标题' },
            { name: 'children', desc: '子导航项列表（JSON字符串）' },
        ],
    },
];

const navItems: NavItem[] = [
    {
        id: 'product',
        title: '商品管理',
        icon: GridIcon,
        children: [
            { id: 'product-add', title: '添加商品', icon: GridIcon },
            { id: 'product-list', title: '商品列表', icon: GridIcon },
            { id: 'product-category', title: '商品分类', icon: GridIcon },
            { id: 'product-attr', title: '商品属性', icon: GridIcon },
            { id: 'product-sku', title: 'SKU管理', icon: GridIcon },
        ],
    },
    {
        id: 'order',
        title: '订单管理',
        icon: GridIcon,
        children: [
            { id: 'order-list', title: '订单列表', icon: GridIcon },
            { id: 'order-detail', title: '订单详情', icon: GridIcon },
            { id: 'order-refund', title: '退款管理', icon: GridIcon },
            { id: 'order-shipping', title: '发货管理', icon: GridIcon },
        ],
    },
    {
        id: 'inventory',
        title: '库存管理',
        icon: GridIcon,
        children: [
            { id: 'inventory-stock', title: '库存查询', icon: GridIcon },
            { id: 'inventory-inbound', title: '入库管理', icon: GridIcon },
            { id: 'inventory-outbound', title: '出库管理', icon: GridIcon },
            { id: 'inventory-alert', title: '库存预警', icon: GridIcon },
        ],
    },
    {
        id: 'finance',
        title: '财务管理',
        icon: GridIcon,
        children: [
            { id: 'finance-overview', title: '财务概览', icon: GridIcon },
            { id: 'finance-income', title: '收入管理', icon: GridIcon },
            { id: 'finance-expense', title: '支出管理', icon: GridIcon },
            { id: 'finance-report', title: '财务报表', icon: GridIcon },
            { id: 'finance-invoice', title: '发票管理', icon: GridIcon },
        ],
    },
    {
        id: 'marketing',
        title: '营销推广',
        icon: GridIcon,
        children: [
            { id: 'marketing-campaign', title: '活动管理', icon: GridIcon },
            { id: 'marketing-coupon', title: '优惠券管理', icon: GridIcon },
            { id: 'marketing-banner', title: '广告位管理', icon: GridIcon },
            { id: 'marketing-push', title: '消息推送', icon: GridIcon },
        ],
    },
    {
        id: 'analytics',
        title: '数据分析',
        icon: GridIcon,
        children: [
            { id: 'analytics-dashboard', title: '数据看板', icon: GridIcon },
            { id: 'analytics-sales', title: '销售分析', icon: GridIcon },
            { id: 'analytics-traffic', title: '流量分析', icon: GridIcon },
            { id: 'analytics-conversion', title: '转化分析', icon: GridIcon },
            { id: 'analytics-user', title: '用户分析', icon: GridIcon },
        ],
    },
    {
        id: 'customer',
        title: '客户服务',
        icon: GridIcon,
        children: [
            { id: 'customer-list', title: '客户列表', icon: GridIcon },
            { id: 'customer-message', title: '消息管理', icon: GridIcon },
            { id: 'customer-feedback', title: '反馈管理', icon: GridIcon },
        ],
    },
    {
        id: 'system',
        title: '系统设置',
        icon: GridIcon,
        children: [
            { id: 'system-account', title: '账户设置', icon: GridIcon },
            { id: 'system-role', title: '角色权限', icon: GridIcon },
            { id: 'system-log', title: '操作日志', icon: GridIcon },
            { id: 'system-backup', title: '数据备份', icon: GridIcon },
            { id: 'system-notification', title: '通知设置', icon: GridIcon },
        ],
    },
    {
        id: 'product2',
        title: '商品管理',
        icon: GridIcon,
        children: [
            { id: 'product-add2', title: '添加商品', icon: GridIcon },
            { id: 'product-list2', title: '商品列表', icon: GridIcon },
            { id: 'product-category2', title: '商品分类', icon: GridIcon },
            { id: 'product-attr2', title: '商品属性', icon: GridIcon },
            { id: 'product-sku2', title: 'SKU管理', icon: GridIcon },
        ],
    },
    {
        id: 'order2',
        title: '订单管理',
        icon: GridIcon,
        children: [
            { id: 'order-list2', title: '订单列表', icon: GridIcon },
            { id: 'order-detail2', title: '订单详情', icon: GridIcon },
            { id: 'order-refund2', title: '退款管理', icon: GridIcon },
            { id: 'order-shipping2', title: '发货管理', icon: GridIcon },
        ],
    },
    {
        id: 'inventory2',
        title: '库存管理',
        icon: GridIcon,
        children: [
            { id: 'inventory-stock2', title: '库存查询', icon: GridIcon },
            { id: 'inventory-inbound2', title: '入库管理', icon: GridIcon },
            { id: 'inventory-outbound2', title: '出库管理', icon: GridIcon },
            { id: 'inventory-alert2', title: '库存预警', icon: GridIcon },
        ],
    },
    {
        id: 'finance2',
        title: '财务管理',
        icon: GridIcon,
        children: [
            { id: 'finance-overview2', title: '财务概览', icon: GridIcon },
            { id: 'finance-income2', title: '收入管理', icon: GridIcon },
            { id: 'finance-expense2', title: '支出管理', icon: GridIcon },
            { id: 'finance-report2', title: '财务报表', icon: GridIcon },
            { id: 'finance-invoice2', title: '发票管理', icon: GridIcon },
        ],
    },
    {
        id: 'marketing2',
        title: '营销推广',
        icon: GridIcon,
        children: [
            { id: 'marketing-campaign2', title: '活动管理', icon: GridIcon },
            { id: 'marketing-coupon2', title: '优惠券管理', icon: GridIcon },
            { id: 'marketing-banner2', title: '广告位管理', icon: GridIcon },
            { id: 'marketing-push2', title: '消息推送', icon: GridIcon },
        ],
    },
    {
        id: 'analytics2',
        title: '数据分析',
        icon: GridIcon,
        children: [
            { id: 'analytics-dashboard2', title: '数据看板', icon: GridIcon },
            { id: 'analytics-sales2', title: '销售分析', icon: GridIcon },
            { id: 'analytics-traffic2', title: '流量分析', icon: GridIcon },
            { id: 'analytics-conversion2', title: '转化分析', icon: GridIcon },
            { id: 'analytics-user2', title: '用户分析', icon: GridIcon },
        ],
    },
    {
        id: 'customer2',
        title: '客户服务',
        icon: GridIcon,
        children: [
            { id: 'customer-list2', title: '客户列表', icon: GridIcon },
            { id: 'customer-message2', title: '消息管理', icon: GridIcon },
            { id: 'customer-feedback2', title: '反馈管理', icon: GridIcon },
        ],
    },
    {
        id: 'system2',
        title: '系统设置',
        icon: GridIcon,
        children: [
            { id: 'system-account2', title: '账户设置', icon: GridIcon },
            { id: 'system-role2', title: '角色权限', icon: GridIcon },
            { id: 'system-log2', title: '操作日志', icon: GridIcon },
            { id: 'system-backup2', title: '数据备份', icon: GridIcon },
            { id: 'system-notification2', title: '通知设置', icon: GridIcon },
        ],
    },
];

const helpCenterRoute = defineHashPageRoute([
    { id: 'product-add', title: '添加商品' },
    { id: 'product-list', title: '商品列表' },
], { defaultPageId: 'product-add' });

const Component = forwardRef(function HelpCenter(
    innerProps: AxureProps,
    ref: React.ForwardedRef<AxureHandle>,
) {
    const { page: activeId, setPage } = useHashPage(helpCenterRoute);
    const [expandedGroups, setExpandedGroups] = useState<string[]>(['product']);
    const [searchKeyword, setSearchKeyword] = useState<string>('');
    const [activeSection, setActiveSection] = useState<string>('product-add');
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    const sectionRefs = React.useRef<Record<string, HTMLDivElement | null>>({});

    const CHAPTERS = [
        { id: 'product-add', title: '添加商品' },
        { id: 'product-list', title: '商品列表' },
    ];
    // Props 处理
    const dataSource = innerProps && innerProps.data ? innerProps.data : {};
    const configSource = innerProps && innerProps.config ? innerProps.config : {};
    const onEventHandler = typeof innerProps.onEvent === 'function'
        ? innerProps.onEvent
        : undefined;
    const emitEvent = createEventEmitter(onEventHandler);

    React.useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const containerRect = container.getBoundingClientRect();
            let closestId = 'product-add';
            let closestDist = Infinity;

            CHAPTERS.forEach((ch) => {
                const el = sectionRefs.current[ch.id];
                if (!el) return;
                const dist = Math.abs(el.getBoundingClientRect().top - containerRect.top);
                if (dist < closestDist) {
                    closestDist = dist;
                    closestId = ch.id;
                }
            });

            setActiveSection(closestId);
        };

        container.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => container.removeEventListener('scroll', handleScroll);
    }, []);

    // 从配置中获取值
    const searchPlaceholder = getConfigValue(configSource, 'search_placeholder', '搜索帮助文档...');
    const headerTitle = getConfigValue(configSource, 'title', '帮助中心');
    const showAnnotationPanel = getConfigValue(configSource, 'show_annotation', true);

    // 辅助函数

    const isActive = useCallback((itemId: string) => activeId === itemId, [activeId]);

    // 包装 setPage 以触发事件
    const handleNavigate = useCallback((pageId: string) => {
        setPage(pageId);
        emitEvent('onNavigate', pageId);
    }, [setPage, emitEvent]);

    // 搜索处理
    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchKeyword(value);
        emitEvent('onSearch', value);
    }, [emitEvent]);

    // useImperativeHandle 实现
    useImperativeHandle(ref, function () {
        return {
            getVar: function (name: string) {
                switch (name) {
                    case 'current_page_id':
                        return activeId;
                    case 'search_keyword':
                        return searchKeyword;
                    case 'expanded_groups':
                        return JSON.stringify(expandedGroups);
                    default:
                        return undefined;
                }
            },
            fireAction: function (name: string, params?: string) {
                switch (name) {
                    case 'navigate':
                        if (params) handleNavigate(params);
                        break;
                    case 'resetSearch':
                        setSearchKeyword('');
                        emitEvent('onSearch', '');
                        break;
                    case 'expandAll':
                        setExpandedGroups(navItems.filter(item => item.children).map(item => item.id));
                        break;
                    case 'collapseAll':
                        setExpandedGroups([]);
                        break;
                    default:
                        console.warn('未知动作:', name);
                }
            },
            eventList: EVENT_LIST,
            actionList: ACTION_LIST,
            varList: VAR_LIST,
            configList: CONFIG_LIST,
            dataList: DATA_LIST,
        };
    }, [activeId, searchKeyword, expandedGroups, handleNavigate, emitEvent]);

    return (
        <>
          <main className="help-center-shell">
                      <header className="help-center-header">
                          <div className="help-center-header-left">
                              <div className="help-center-logo">
                                  <div className="help-center-logo-icon">C</div>
                                  <span className="help-center-logo-text">骆驼队长</span>
                              </div>
                              <span style={{ color: 'var(--text-tertiary)' }}>|</span>
                              <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-base)' }}>{headerTitle}</span>
                          </div>
                          <div className="help-center-header-right">
                              <button className="help-center-back-btn" type="button">
                                  <Home size={16} />
                                  返回首页
                              </button>
                          </div>
                      </header>
          
                      <div className="help-center-main">
                          <aside className="help-center-sidebar">
                              <div className="help-center-sidebar-header">章节导航</div>
          
                              <div className="help-center-search">
                                  <Search className="help-center-search-icon" size={16} />
                                  <input
                                      className="help-center-search-input"
                                      type="text"
                                      placeholder={searchPlaceholder}
                                      value={searchKeyword}
                                      onChange={handleSearchChange}
                                  />
                              </div>
          
                              <nav className="help-center-nav">
                                  {navItems.map(item => (
                                      <div key={item.id} className="help-center-nav-group">
                                           {item.children ? (
                                              <>
                                                  <div className={`help-center-nav-group-header ${item.id === 'product' ? 'is-expanded' : ''}`}>
                                                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                          {item.icon}
                                                          {item.title}
                                                      </span>
                                                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                          <span className="help-center-nav-count">({item.children?.length || 0})</span>
                                                          <span className={`help-center-nav-group-arrow ${item.id === 'product' ? 'is-expanded' : ''}`} />
                                                      </span>
                                                  </div>
                                                  <div className="help-center-nav-group-items">
                                                      {item.children.map(child => (
                                                          <button
                                                              className={`help-center-nav-group-item ${activeSection === child.id ? 'is-active' : ''}`}
                                                              key={child.id}
                                                              type="button"
                                                              onClick={() => {
                                                                  const el = sectionRefs.current[child.id];
                                                                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                                  setActiveSection(child.id);
                                                              }}
                                                          >
                                                              {child.title}
                                                          </button>
                                                      ))}
                                                  </div>
                                              </>
                                          ) : (
                                              <button
                                                  className={`help-center-nav-item ${isActive(item.id) ? 'is-active' : ''}`}
                                                  type="button"
                                                  onClick={() => handleNavigate(item.id)}
                                              >
                                                  <span className="help-center-nav-item-left">
                                                      <span className="help-center-nav-item-icon">{item.icon}</span>
                                                      {item.title}
                                                  </span>
                                              </button>
                                          )}
                                      </div>
                                  ))}
                              </nav>
          
                              <button className="help-center-demo-btn" type="button">
                                  <Play className="help-center-demo-btn-icon" size={16} />
                                  演示视频
                              </button>
                          </aside>
          
                          <section className="help-center-content">
                              <div className="help-center-content-inner" ref={scrollContainerRef}>

                                   <div
                                       id="product-add"
                                       ref={el => { sectionRefs.current['product-add'] = el; }}
                                       className="help-center-section"
                                   >
                                       <div className="help-center-section-header">
                                           <h1 className="help-center-section-title">
                                               <span>添加商品</span>
                                               <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 'normal' }}>
                                                   商品管理·1/{CHAPTERS.length}章节
                                               </span>
                                           </h1>
                                           <hr className="help-center-section-divider" />
                                       </div>

                                       <p className="help-center-content-desc">
                                           了解如何使用骆驼队长BI系统进行跨境电商运营管理。
                                       </p>
                                       <div className="help-center-info-box">
                                          <AlertCircle className="help-center-info-box-icon" size={20} />
                                          <div className="help-center-info-box-content">
                                              <h3 className="help-center-info-box-title">提示</h3>
                                              <p className="help-center-info-box-text">
                                                  本帮助文档将引导您了解骆驼队长BI系统的核心功能。您可以点击左侧导航栏查看不同模块的详细说明。
                                              </p>
                                          </div>
                                      </div>

                                       <div className="help-center-table-wrapper">
                                           <table className="help-center-table">
                                               <thead>
                                                   <tr>
                                                       <th>按钮名称</th>
                                                       <th>功能说明</th>
                                                       <th>快捷键</th>
                                                   </tr>
                                               </thead>
                                               <tbody>
                                                   <tr>
                                                       <td>新建商品</td>
                                                       <td>创建新的商品记录</td>
                                                       <td>Ctrl + N</td>
                                                   </tr>
                                                   <tr>
                                                       <td>保存</td>
                                                       <td>保存当前编辑内容</td>
                                                       <td>Ctrl + S</td>
                                                   </tr>
                                                   <tr>
                                                       <td>导出</td>
                                                       <td>导出当前数据为Excel格式</td>
                                                       <td>Ctrl + E</td>
                                                   </tr>
                                                   <tr>
                                                       <td>刷新</td>
                                                       <td>重新加载当前页面数据</td>
                                                       <td>F5</td>
                                                   </tr>
                                               </tbody>
                                           </table>
                                       </div>
                                   </div>

                                   <div
                                       id="product-list"
                                       ref={el => { sectionRefs.current['product-list'] = el; }}
                                       className="help-center-section"
                                   >
                                       <div className="help-center-section-header">
                                           <h1 className="help-center-section-title">
                                               <span>商品列表</span>
                                               <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 'normal' }}>
                                                   商品管理·2/{CHAPTERS.length}章节
                                               </span>
                                           </h1>
                                           <hr className="help-center-section-divider" />
                                       </div>

                                       <div className="help-center-video-wrapper">
                                           <div className="help-center-video">
                                               <div className="help-center-video-poster">
                                                   <div className="help-center-video-play-btn">
                                                       <Play size={32} />
                                                   </div>
                                                   <span className="help-center-video-label">操作演示视频</span>
                                               </div>
                                           </div>
                                       </div>
                                   </div>
                              </div>
                          </section>
                      </div>
                  </main>
          {showAnnotationPanel && (
            <AnnotationViewer
              source={annotationSourceDocument as unknown as AnnotationSourceDocument}
              options={{
                currentPageId: activeId,
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
          )}
        </>
    );
});

function AlertCircle({ size, className }: { size: number; className?: string }) {
    return (
        <svg
            className={className}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    );
}

export default Component;
