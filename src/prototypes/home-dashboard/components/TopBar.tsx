import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertCircle,
  AlignJustify,
  Archive,
  Bell,
  BellRing,
  BookOpen,
  Briefcase,
  Calendar,
  Check,
  CheckSquare,
  CircleHelp,
  Compass,
  Crown,
  FileText,
  GitBranch,
  Heart,
  LayoutGrid,
  LogIn,
  Mail,
  MapPin,
  Monitor,
  Network,
  Pencil,
  Plug,
  RefreshCw,
  ScrollText,
  Search,
  Settings2,
  Shield,
  ShoppingCart,
  Sparkles,
  Sun,
  Upload,
  User,
  Users,
  Wrench,
} from 'lucide-react';
import navJson from '../data/nav.json';
import logo from '../assets/logo.png';
import avatar from '../assets/avatar.png';

type NavNode = { title: string; path: string; icon: string; children: NavNode[] };

const NAV = navJson as unknown as NavNode[];

function NavIcon({ name }: { name: string }) {
  const map: Record<string, React.ReactNode> = {
    network: <Network size={14} />,
    monitor: <Monitor size={14} />,
    upload: <Upload size={14} />,
    guide: <Compass size={14} />,
    archived: <Archive size={14} />,
    system: <Settings2 size={14} />,
    'base-info': <FileText size={14} />,
    job: <Briefcase size={14} />,
    'api-gateway': <Plug size={14} />,
    'root-addr': <MapPin size={14} />,
    edit: <Pencil size={14} />,
    shopping: <ShoppingCart size={14} />,
    operators: <Users size={14} />,
    email: <Mail size={14} />,
    '404': <AlertCircle size={14} />,
    peoples: <Users size={14} />,
    example: <FileText size={14} />,
    calendar: <Calendar size={14} />,
    'api-test': <Plug size={14} />,
    'app-group-fill': <LayoutGrid size={14} />,
    build: <Wrench size={14} />,
    documentation: <BookOpen size={14} />,
    scene: <LayoutGrid size={14} />,
    'alarm-settings': <BellRing size={14} />,
    'user-info': <User size={14} />,
    tree: <GitBranch size={14} />,
    people: <User size={14} />,
    logininfor: <LogIn size={14} />,
    log: <ScrollText size={14} />,
    skill: <Sparkles size={14} />,
    heart: <Heart size={14} />,
    'system-tools': <Wrench size={14} />,
    'batch-update': <RefreshCw size={14} />,
    search: <Search size={14} />,
    safety: <Shield size={14} />,
    'api-monitor': <Activity size={14} />,
    checkbox: <CheckSquare size={14} />,
  };
  return <>{map[name] || <FileText size={14} />}</>;
}

export function TopBar({ homeActive, onHome }: { homeActive: boolean; onHome: () => void }) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [popover, setPopover] = useState<null | 'theme' | 'message' | 'avatar'>(null);
  const [theme, setTheme] = useState('日落橙');

  useEffect(() => {
    const onDown = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.hd-tool, .hd-avatar-wrap')) setPopover(null);
      if (!target.closest('.hd-nav-group')) setOpenMenu(null);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  return (
    <header className="hd-navbar">
      <div className="hd-logo-area">
        <img className="hd-logo" src={logo} alt="logo" />
        <span className="hd-logo-subtitle">智慧运营中台</span>
      </div>
      <div className="hd-nav-divider">|</div>
      <nav className="hd-top-nav">
        <span className={`hd-nav-item${homeActive ? ' is-active' : ''}`} onClick={onHome}>首页</span>
        {NAV.map((menu) => (
          <div
            className={`hd-nav-group${openMenu === menu.title ? ' is-open' : ''}`}
            key={menu.title}
            onMouseEnter={() => setOpenMenu(menu.title)}
            onMouseLeave={() => setOpenMenu((current) => (current === menu.title ? null : current))}
          >
            <span className="hd-nav-item">{menu.title}</span>
            {openMenu === menu.title ? (
              <div className="hd-submenu">
                {menu.children.map((group) => {
                  const items = group.children.length ? group.children : [group];
                  return (
                    <div className="hd-submenu-group" key={`${menu.title}-${group.title}`}>
                      <div className="hd-submenu-title">{group.title}</div>
                      <div className="hd-submenu-grid">
                        {items.map((item) => (
                          <div className="hd-submenu-item" key={`${group.title}-${item.title}`}>
                            <NavIcon name={item.icon} />
                            <span>{item.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        ))}
      </nav>

      <div className="hd-tools">
        <div className="hd-tool" title="切换主题" onClick={() => setPopover(popover === 'theme' ? null : 'theme')}>
          <Sun size={18} />
          {popover === 'theme' ? (
            <div className="hd-popover hd-theme-menu" onClick={(event) => event.stopPropagation()}>
              {[
                { label: '沙漠黄', color: '#f9b739' },
                { label: '商务蓝', color: '#2c7bfc' },
                { label: '日落橙', color: '#ff781f' },
              ].map((item) => (
                <div
                  className="hd-theme-item"
                  key={item.label}
                  onClick={() => {
                    setTheme(item.label);
                    setPopover(null);
                  }}
                >
                  <span className="hd-theme-dot" style={{ background: item.color }} />
                  <span>{item.label}</span>
                  {theme === item.label ? <Check size={14} className="hd-theme-check" /> : null}
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <div className="hd-tool is-optional" title="菜单"><AlignJustify size={18} /></div>
        <div className="hd-tool is-optional" title="帮助中心"><CircleHelp size={18} /></div>
        <div className="hd-tool" title="消息通知" onClick={() => setPopover(popover === 'message' ? null : 'message')}>
          <Bell size={18} />
          {popover === 'message' ? (
            <div className="hd-popover hd-message-panel" onClick={(event) => event.stopPropagation()}>
              <div className="hd-message-head">消息通知</div>
              <div className="hd-message-body">暂无消息</div>
            </div>
          ) : null}
        </div>
        <span className="hd-vip"><Crown size={12} />VIP3</span>
        <div className="hd-avatar-wrap" onClick={() => setPopover(popover === 'avatar' ? null : 'avatar')}>
          <img className="hd-avatar" src={avatar} alt="avatar" />
          <span className="hd-avatar-caret">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          {popover === 'avatar' ? (
            <div className="hd-popover hd-theme-menu" onClick={(event) => event.stopPropagation()}>
              <div className="hd-theme-item" onClick={() => setPopover(null)}><User size={14} /><span>个人中心</span></div>
              <div className="hd-theme-item" onClick={() => setPopover(null)}><LogIn size={14} /><span>退出登录</span></div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
