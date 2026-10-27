import React, { type ReactNode } from 'react';

import logo from '../assets/logo.png';
import icSun from '../assets/icons/sun.svg';
import icMenu from '../assets/icons/menu.svg';
import icHelp from '../assets/icons/help.svg';
import icCrown from '../assets/icons/crown.svg';
import icCaret from '../assets/icons/caret-down.svg';
import icHeadset from '../assets/icons/headset.svg';

const NAV_ITEMS = ['首页', '商品', '交易', '采购', '物流', '报表', '系统', '工具箱', '即时咨询'];

function TopBar({ activeNav }: { activeNav: string }) {
  return (
    <header className="si-topbar">
      <img className="si-logo" src={logo} alt="骆驼队长" />
      <span className="si-brand">智慧运营中台</span>
      <span className="si-brand-divider" />
      <nav className="si-nav">
        {NAV_ITEMS.map((item) => (
          <span key={item} className={'si-nav-item' + (item === activeNav ? ' is-active' : '')}>
            {item}
          </span>
        ))}
      </nav>
      <div className="si-topbar-right">
        <img className="si-tool-icon" src={icSun} alt="切换主题" />
        <img className="si-tool-icon" src={icMenu} alt="菜单" />
        <img className="si-tool-icon" src={icHelp} alt="帮助" />
        <span className="si-vip">
          <img src={icCrown} alt="" />
          VIP3
        </span>
        <span className="si-avatar">C</span>
        <img className="si-caret" src={icCaret} alt="" />
      </div>
    </header>
  );
}

function Breadcrumb({ items }: { items: string[] }) {
  return (
    <div className="si-crumb">
      {items.map((item, index) => (
        <React.Fragment key={item}>
          {index > 0 ? <span className="si-crumb-sep">/</span> : null}
          <span className={index === items.length - 1 ? 'si-crumb-current' : 'si-crumb-item'}>{item}</span>
        </React.Fragment>
      ))}
    </div>
  );
}

function ContactFloat() {
  return (
    <div className="si-contact">
      <img src={icHeadset} alt="" />
      <span>联系我们</span>
    </div>
  );
}

export function AppShell({
  breadcrumb,
  activeNav = '系统',
  cardClassName,
  children,
}: {
  breadcrumb: string[];
  activeNav?: string;
  cardClassName?: string;
  children: ReactNode;
}) {
  return (
    <>
      <TopBar activeNav={activeNav} />
      <Breadcrumb items={breadcrumb} />
      <main className={'si-card' + (cardClassName ? ' ' + cardClassName : '')}>{children}</main>
      <ContactFloat />
    </>
  );
}
