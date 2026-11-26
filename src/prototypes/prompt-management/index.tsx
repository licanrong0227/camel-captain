/**
 * @name 提示词管理 - Admin管理系统
 * @mode axure
 */

import React, { useEffect, useRef, useState } from 'react';
import './style.css';
import { PromptManagerPage } from './components/PromptManagerPage';

const SearchIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
    </svg>
);

const BellIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
);

interface NavChild {
    id: string;
    label: string;
    icon: string;
}

interface NavItem {
    id: string;
    label: string;
    menuTitle?: string;
    children?: NavChild[];
}

const NAV_ITEMS: NavItem[] = [
    { id: 'home', label: '首页' },
    { id: 'tenant', label: '租户' },
    { id: 'system', label: '系统管理' },
    { id: 'member', label: '会员中心' },
    { id: 'logistics', label: '物流' },
    { id: 'operations', label: '运营' },
    { id: 'menu-user', label: '菜单及用户' },
    {
        id: 'settings',
        label: '设置',
        menuTitle: '设置',
        children: [
            { id: 'language', label: '语言管理', icon: 'language' },
            { id: 'bank', label: '收款银行管理', icon: 'yen' },
            { id: 'shop-platform', label: '店铺平台管理', icon: 'cart' },
            { id: 'collect-platform', label: '产品采集支持平台', icon: 'briefcase' },
            { id: 'feature-basic', label: '功能基础设置', icon: 'wrench' },
            { id: 'prompt-management', label: '提示词管理', icon: 'prompt' },
        ],
    },
];

const dropdownIcons: Record<string, React.ReactNode> = {
    language: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    ),
    yen: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 4l5 7 5-7" />
            <path d="M12 11v9" />
            <path d="M8 14h8" />
            <path d="M8 17.5h8" />
        </svg>
    ),
    cart: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="20" r="1.5" />
            <circle cx="18" cy="20" r="1.5" />
            <path d="M2.5 3.5h2.2l2.5 11.2a1.6 1.6 0 0 0 1.6 1.3h8.6a1.6 1.6 0 0 0 1.6-1.3l1.4-7.2H5.6" />
        </svg>
    ),
    briefcase: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
    ),
    wrench: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
    ),
    prompt: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="m7 9 3 3-3 3" />
            <path d="M13 15h4" />
        </svg>
    ),
};

const Component = function App() {
    const [openDropdown, setOpenDropdown] = useState<string | null>('settings');
    const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleNavMouseEnter = (item: NavItem) => {
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
        if (item.children) {
            setOpenDropdown(item.id);
        } else {
            setOpenDropdown(null);
        }
    };

    const handleNavMouseLeave = () => {
        hoverTimerRef.current = setTimeout(() => setOpenDropdown(null), 150);
    };

    const handleDropdownMouseEnter = () => {
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };

    const handleDropdownMouseLeave = () => {
        hoverTimerRef.current = setTimeout(() => setOpenDropdown(null), 150);
    };

    useEffect(() => {
        const onDocMouseDown = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.admin-header-nav-item-wrap')) setOpenDropdown(null);
        };
        document.addEventListener('mousedown', onDocMouseDown);
        return () => document.removeEventListener('mousedown', onDocMouseDown);
    }, []);

    return (
        <div className="admin-shell">
            <header className="admin-header">
                <div className="admin-header-logo">
                    <img
                        className="admin-header-logo-icon"
                        src="https://yfg-saas-test.oss-cn-shenzhen.aliyuncs.com/images/34/2026-08/fb37c061-e967-4584-94a6-5fc4e316ad15.png"
                        alt="logo"
                    />
                    <span className="admin-header-logo-text">骆驼队长后台管理系统</span>
                    <span className="admin-header-divider">|</span>
                </div>
                <nav className="admin-header-nav">
                    {NAV_ITEMS.map(item => (
                        <div
                            key={item.id}
                            className="admin-header-nav-item-wrap"
                            onMouseEnter={() => handleNavMouseEnter(item)}
                            onMouseLeave={handleNavMouseLeave}
                        >
                            <button
                                className={`admin-header-nav-item ${item.id === 'settings' ? 'is-active is-highlighted' : ''}`}
                                onClick={() => {
                                    if (item.children) {
                                        setOpenDropdown(prev => (prev === item.id ? null : item.id));
                                    }
                                }}
                            >
                                {item.label}
                            </button>
                            {openDropdown === item.id && item.children && (
                                <div
                                    className="admin-header-dropdown is-wide"
                                    onMouseEnter={handleDropdownMouseEnter}
                                    onMouseLeave={handleDropdownMouseLeave}
                                >
                                    <div className="admin-header-dropdown-title">{item.menuTitle ?? item.label}</div>
                                    <div className="admin-header-dropdown-menu is-grid">
                                        {item.children.map(child => {
                                            const isCurrent = child.id === 'prompt-management';
                                            return (
                                                <div
                                                    key={child.id}
                                                    className={`admin-header-dropdown-item ${isCurrent ? 'is-active' : 'is-static'}`}
                                                    title={isCurrent ? undefined : '非本原型范围'}
                                                >
                                                    {dropdownIcons[child.icon]}
                                                    {child.label}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </nav>
                <div className="admin-header-right">
                    <button className="admin-header-icon-btn" title="搜索">
                        <SearchIcon />
                    </button>
                    <button className="admin-header-icon-btn" title="通知">
                        <BellIcon />
                        <span className="admin-header-badge" />
                    </button>
                    <div className="admin-header-avatar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </div>
                </div>
            </header>

            <div className="admin-breadcrumb">
                <span className="admin-breadcrumb-item">设置</span>
                <span className="admin-breadcrumb-separator">/</span>
                <span className="admin-breadcrumb-item">设置</span>
                <span className="admin-breadcrumb-separator">/</span>
                <span className="admin-breadcrumb-item is-active">提示词管理</span>
            </div>

            <div className="admin-page">
                <PromptManagerPage />
            </div>
        </div>
    );
};

export default Component;
