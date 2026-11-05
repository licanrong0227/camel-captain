/**
 * @name 运营后台 · 商品报表
 */

import React, { useEffect, useRef, useState } from 'react';

import './style.css';
import { defineHashPageRoute, useHashPage } from '../../common/useHashPage';
import logo from './assets/logo-mark.png';
import { ProductReport } from './pages/ProductReport';
import {
    CaretDown,
    ChatIcon,
    DocIcon,
    ExpandIcon,
    HeadsetIcon,
    ListIcon,
    MegaphoneIcon,
    MenuIcon,
    PackageIcon,
    SearchIcon,
    TrendIcon,
} from './components/icons';

const ROUTE = defineHashPageRoute(
    [
        { id: 'product-report', title: '商品报表', group: '会员报表' },
    ],
    { defaultPageId: 'product-report' },
);

const NAV_TABS = ['首页', '租户', '系统管理', '会员中心', '物流', '运营', '菜单及用户', '设置'];

export default function App() {
    const { page, setPage } = useHashPage(ROUTE);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (page !== 'product-report') {
            setPage('product-report');
        }
    }, [page, setPage]);


    useEffect(() => {
        if (!menuOpen) {
            return undefined;
        }
        const onPointerDown = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [menuOpen]);

    const goto = (pageId: string) => {
        setPage(pageId);
        setMenuOpen(false);
    };

    return (
        <div className="ops-app">
            <header className="ops-header">
                <div className="ops-brand">
                    <img src={logo} alt="骆驼队长" />
                    <span>骆驼队长后台管理系统</span>
                </div>
                <div className="ops-brand-divider" />
                <nav className="ops-tabs" aria-label="一级导航">
                    {NAV_TABS.map((tab) => (
                        tab === '运营' ? (
                            <div className="ops-tab-wrap" key={tab} ref={menuRef}>
                                <button
                                    type="button"
                                    className="ops-tab is-active"
                                    aria-expanded={menuOpen}
                                    onClick={() => setMenuOpen((open) => !open)}
                                >
                                    运营
                                </button>
                                {menuOpen && (
                                    <div className="ops-mega">
                                        <div className="ops-mega-section">
                                            <div className="ops-mega-label">帮助中心</div>
                                            <div className="ops-mega-grid cols-2">
                                                <div className="ops-mega-item is-static">
                                                    <HeadsetIcon />
                                                    帮助中心
                                                </div>
                                            </div>
                                        </div>
                                        <div className="ops-mega-section">
                                            <div className="ops-mega-label">公告</div>
                                            <div className="ops-mega-grid cols-2">
                                                <div className="ops-mega-item is-static">
                                                    <MegaphoneIcon />
                                                    公告
                                                </div>
                                                <div className="ops-mega-item is-static">
                                                    <DocIcon />
                                                    公告审核
                                                </div>
                                            </div>
                                        </div>
                                        <div className="ops-mega-section">
                                            <div className="ops-mega-label">会员报表</div>
                                            <div className="ops-mega-grid cols-3">
                                                <div className="ops-mega-item is-static">
                                                    <ListIcon />
                                                    订单报表
                                                </div>
                                                <div className="ops-mega-item is-static">
                                                    <TrendIcon />
                                                    销售报表
                                                </div>
                                                <button
                                                    type="button"
                                                    className="ops-mega-item is-active"
                                                    onClick={() => goto('product-report')}
                                                >
                                                    <PackageIcon />
                                                    商品报表
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button type="button" className="ops-tab" key={tab}>
                                {tab}
                            </button>
                        )
                    ))}
                </nav>
                <div className="ops-header-actions">
                    <button type="button" className="ops-icon-btn" aria-label="快捷菜单"><MenuIcon /></button>
                    <button type="button" className="ops-icon-btn" aria-label="消息"><ChatIcon /></button>
                    <button type="button" className="ops-icon-btn" aria-label="搜索"><SearchIcon /></button>
                    <button type="button" className="ops-icon-btn" aria-label="全屏"><ExpandIcon /></button>
                    <button type="button" className="ops-avatar" aria-label="账号">
                        <span className="ops-avatar-badge">A</span>
                    </button>
                    <CaretDown className="ops-avatar-caret" size={11} />
                </div>
            </header>

            <div className="ops-crumb">
                <span>运营</span>
                <span className="sep">/</span>
                <span>会员报表</span>
                <span className="sep">/</span>
                <span className="is-current">商品报表</span>
            </div>

            <main className="ops-content">
                <ProductReport />
            </main>
        </div>
    );
}
