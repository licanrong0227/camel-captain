import React from 'react';
import { BarChart3, Home, User, type LucideIcon } from 'lucide-react';

export type TabKey = 'home' | 'ad-board' | 'profile';

const TABS: Array<{ key: TabKey; label: string; icon: LucideIcon }> = [
  { key: 'home', label: '首页', icon: Home },
  { key: 'ad-board', label: '数据', icon: BarChart3 },
  { key: 'profile', label: '我的', icon: User },
];

export function TabBar({ active, onChange }: { active: TabKey; onChange: (next: TabKey) => void }) {
  return (
    <nav className="cc-tabbar" aria-label="底部导航">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.key}
            type="button"
            className={`cc-tab${active === tab.key ? ' is-active' : ''}`}
            onClick={() => onChange(tab.key)}
          >
            <Icon size={22} strokeWidth={active === tab.key ? 2.4 : 2} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
