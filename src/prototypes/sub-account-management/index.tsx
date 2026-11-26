/**
 * @name 子账号管理
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Archive,
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock3,
  CloudUpload,
  Coins,
  Crown,
  Download,
  Edit3,
  FileText,
  GitBranch,
  Headphones,
  HelpCircle,
  LayoutDashboard,
  LayoutGrid,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Network,
  Plus,
  RotateCcw,
  Route,
  Search,
  ShieldCheck,
  Store,
  Sun,
  Trash2,
  Truck,
  Upload,
  UserCog,
  Users,
  X,
} from 'lucide-react';
import logo from './assets/logo.jpg';
import avatarPhoto from './assets/avatar.png';
import './style.css';

/* ------------------------------------------------------------------ */
/* 基础数据                                                            */
/* ------------------------------------------------------------------ */

type TabId = 'list' | 'pending' | 'apply';

type AccountRow = {
  id: number;
  account: string;
  name: string;
  dept: string;
  role: string;
  phone: string;
  email: string;
  inviter: string;
  createdAt: string;
  ip: string;
  lastLogin: string;
  status: 1 | 0;
  remark: string;
};

const ACCOUNT_SUFFIX = '@licanrongceshi@zsq888';
const ROLE_OPTIONS = ['Admin'];
const STORE_OPTIONS = ['ecohaven', 'klyto', 'chicpet', 'urbanvog', 'zeortech'];

const INITIAL_ACCOUNTS: AccountRow[] = [
  {
    id: 1,
    account: 'licanrongceshi@zsq888',
    name: '李灿荣',
    dept: '-',
    role: 'Admin',
    phone: '13302302302',
    email: '13302302302@qq.com',
    inviter: 'zsq888',
    createdAt: '2026-11-25 17:03:37',
    ip: '',
    lastLogin: '2026-11-26 09:42:56',
    status: 1,
    remark: '',
  },
  {
    id: 2,
    account: 'yuguoqingceshi@zsq888',
    name: '余国庆',
    dept: '-',
    role: 'Admin',
    phone: '13201201212',
    email: '13201201212@qq.com',
    inviter: 'zsq888',
    createdAt: '2026-11-25 17:04:09',
    ip: '',
    lastLogin: '2026-11-25 20:31:15',
    status: 1,
    remark: '',
  },
  {
    id: 3,
    account: 'xvzudeceshi@zsq888',
    name: '徐祖德',
    dept: '-',
    role: 'Admin',
    phone: '13255544564',
    email: '13201201212@qq.com',
    inviter: 'zsq888',
    createdAt: '2026-11-25 17:04:42',
    ip: '',
    lastLogin: '',
    status: 1,
    remark: '',
  },
  {
    id: 4,
    account: 'liuyanceshi@zsq888',
    name: '刘雁',
    dept: '-',
    role: 'Admin',
    phone: '13326226256',
    email: '13326226256@qq.com',
    inviter: 'zsq888',
    createdAt: '2026-11-25 17:18:52',
    ip: '',
    lastLogin: '',
    status: 1,
    remark: '',
  },
];

const TABS: { id: TabId; label: string }[] = [
  { id: 'list', label: '子账号' },
  { id: 'pending', label: '待审' },
  { id: 'apply', label: '我的申请' },
];

type Column = { key: keyof AccountRow | 'empty'; label: string; width: number; center?: boolean };

const BASE_COLUMNS: Column[] = [
  { key: 'account', label: '子账号', width: 160 },
  { key: 'name', label: '姓名', width: 120 },
  { key: 'dept', label: '部门', width: 120 },
  { key: 'role', label: '角色', width: 140 },
  { key: 'phone', label: '手机号', width: 120 },
  { key: 'email', label: '邮箱', width: 160 },
  { key: 'inviter', label: '添加/邀请人', width: 120 },
  { key: 'createdAt', label: '创建时间', width: 160 },
  { key: 'ip', label: 'IP', width: 120 },
  { key: 'lastLogin', label: '最后登录时间', width: 160 },
  { key: 'status', label: '状态', width: 100, center: true },
  { key: 'remark', label: '备注', width: 160 },
];

const columnsForTab = (tab: TabId): Column[] =>
  tab === 'pending' ? BASE_COLUMNS.filter((c) => c.key !== 'status') : BASE_COLUMNS;

/* ------------------------------------------------------------------ */
/* 顶部导航                                                            */
/* ------------------------------------------------------------------ */

type MenuItem = { label: string; icon: React.ReactNode };
type MenuGroup = { title: string; items: MenuItem[] };

const menuIcon = (label: string) => {
  const map: Record<string, React.ReactNode> = {
    商品采集: <Upload size={13} />,
    认领中心: <Network size={13} />,
    我的商品: <Archive size={13} />,
    上新价模板配置: <FileText size={13} />,
    渠道定价配置: <Coins size={13} />,
    店铺模板配置: <Store size={13} />,
    我的订单: <ClipboardList size={13} />,
    自动打标配置: <Edit3 size={13} />,
    请款列表: <FileText size={13} />,
    采购单跟踪: <Mail size={13} />,
    出入库管理: <Archive size={13} />,
    出库异常: <AlertTriangle size={13} />,
    供应商管理: <Users size={13} />,
    收货地址管理: <MapPin size={13} />,
    物流商管理: <Truck size={13} />,
    国际物流轨迹跟踪: <Route size={13} />,
    常用地址管理: <MapPin size={13} />,
    订单明细报表: <FileText size={13} />,
    店铺看板: <LayoutDashboard size={13} />,
    部门管理: <GitBranch size={13} />,
    角色管理: <Users size={13} />,
    子账号管理: <UserCog size={13} />,
    店铺授权: <Store size={13} />,
    采购账号授权: <Users size={13} />,
    审批流: <CheckCircle2 size={13} />,
    操作日志: <Clock3 size={13} />,
    尾程签收凭证查询: <CheckCircle2 size={13} />,
    地址邮编校验: <MapPin size={13} />,
    汇率: <Coins size={13} />,
    商品信息质量检测: <ShieldCheck size={13} />,
    即时咨询: <MessageCircle size={13} />,
    站内信: <Mail size={13} />,
  };
  return map[label] ?? <FileText size={13} />;
};

const group = (title: string, labels: string[]): MenuGroup => ({
  title,
  items: labels.map((label) => ({ label, icon: menuIcon(label) })),
});

const NAV_ITEMS = ['首页', '商品', '交易', '采购', '物流', '报表', '系统', '工具箱', '即时咨询'];

const NAV_MENUS: Record<string, MenuGroup[]> = {
  商品: [
    group('商品管理', ['商品采集', '认领中心', '我的商品']),
    group('基础配置', ['上新价模板配置', '渠道定价配置', '店铺模板配置']),
  ],
  交易: [group('订单管理', ['我的订单', '自动打标配置', '请款列表'])],
  采购: [group('采购管理', ['采购单跟踪', '出入库管理', '出库异常', '供应商管理', '收货地址管理'])],
  物流: [group('物流管理', ['物流商管理', '国际物流轨迹跟踪', '常用地址管理'])],
  报表: [group('订单', ['订单明细报表']), group('店铺', ['店铺看板'])],
  系统: [
    group('账号/权限', ['部门管理', '角色管理', '子账号管理']),
    group('店铺', ['店铺授权', '采购账号授权']),
    group('审批', ['审批流']),
    group('监控', ['操作日志']),
  ],
  工具箱: [group('增值服务', ['尾程签收凭证查询', '地址邮编校验', '汇率', '商品信息质量检测'])],
  即时咨询: [group('帮助', ['即时咨询', '站内信'])],
};

function TopBar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpenMenu(null);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="sa-fixed">
      <div className="sa-navbar">
        <div className="sa-brand-area">
          <img className="sa-logo" src={logo} alt="骆驼队长" />
          <span className="sa-brand-name">智慧运营中台</span>
        </div>
        <span className="sa-brand-divider">|</span>
        <nav className="sa-nav">
          {NAV_ITEMS.map((item) => {
            const menus = NAV_MENUS[item];
            const active = item === '系统';
            return (
              <div
                key={item}
                className="sa-nav-slot"
                onMouseEnter={() => menus && setOpenMenu(item)}
                onMouseLeave={() => menus && setOpenMenu((cur) => (cur === item ? null : cur))}
              >
                <button type="button" className={`sa-nav-item${item === '首页' ? ' is-home' : ''}${active ? ' is-active' : ''}`}>
                  {item}
                  {active ? <ChevronDown size={12} strokeWidth={2.2} /> : null}
                </button>
                {menus && openMenu === item ? (
                  <div className="sa-mega">
                    <div className="sa-mega-card">
                      {menus.map((g) => (
                        <div className="sa-mega-group" key={g.title}>
                          <div className="sa-mega-title">{g.title}</div>
                          <div className="sa-mega-grid">
                            {g.items.map((mi) => (
                              <button
                                type="button"
                                key={mi.label}
                                className={`sa-mega-item${mi.label === '子账号管理' ? ' is-active' : ''}`}
                              >
                                <span className="sa-mega-ico">{mi.icon}</span>
                                {mi.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>
        <div className="sa-header-right">
          <button type="button" className="sa-task-entry">
            <LayoutGrid size={17} />
            任务管理器
          </button>
          <button type="button" className="sa-header-icon" aria-label="主题">
            <Sun size={18} />
          </button>
          <button type="button" className="sa-header-icon" aria-label="菜单">
            <Menu size={18} />
          </button>
          <button type="button" className="sa-header-icon" aria-label="帮助">
            <HelpCircle size={18} />
          </button>
          <button type="button" className="sa-header-icon" aria-label="消息">
            <Bell size={18} />
          </button>
          <span className="sa-vip">
            <Crown size={13} color="#F9B739" fill="#F9B739" />
            VIP3
          </span>
          <span className="sa-avatar">
            <img src={avatarPhoto} alt="用户头像" />
            <ChevronDown size={11} className="sa-avatar-caret" />
          </span>
        </div>
      </div>
      <div className="sa-crumb">
        <span>系统</span>
        <span className="sa-crumb-sep">/</span>
        <span>账号/权限</span>
        <span className="sa-crumb-sep">/</span>
        <span className="sa-crumb-current">子账号管理</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 通用控件                                                            */
/* ------------------------------------------------------------------ */

function CheckBox({
  checked,
  indeterminate,
  disabled,
  onChange,
  ariaLabel,
}: {
  checked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  onChange?: () => void;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-label={ariaLabel}
      aria-checked={indeterminate ? 'mixed' : !!checked}
      disabled={disabled}
      className={`sa-check${checked ? ' is-checked' : ''}${indeterminate ? ' is-indet' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onChange?.();
      }}
    >
      {indeterminate ? <span className="sa-check-dash" /> : checked ? <Check size={10} strokeWidth={3.4} /> : null}
    </button>
  );
}

function useOutsideClose(ref: React.RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, onClose]);
}

function SelectBox({
  value,
  placeholder,
  options,
  onChange,
  width = 160,
  height = 32,
  emptyText = 'No options available.',
  className = '',
  tag = false,
  clearable = false,
}: {
  value: string;
  placeholder: string;
  options: string[];
  onChange: (v: string) => void;
  width?: number | string;
  height?: number;
  emptyText?: string;
  className?: string;
  tag?: boolean;
  clearable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClose(ref, () => setOpen(false));

  return (
    <div className={`sa-select${open ? ' is-open' : ''} ${className}`} style={{ width }} ref={ref}>
      <button
        type="button"
        className="sa-select-trigger"
        style={{ height }}
        onClick={() => setOpen((v) => !v)}
      >
        {value && tag ? (
          <span className="sa-select-tag">
            {value}
            <span
              role="button"
              tabIndex={0}
              className="sa-select-tag-x"
              aria-label={`移除 ${value}`}
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
            >
              <X size={10} />
            </span>
          </span>
        ) : (
          <span className={value ? 'sa-select-value' : 'sa-select-placeholder'}>{value || placeholder}</span>
        )}
        {clearable && value ? (
          <span
            role="button"
            tabIndex={0}
            className="sa-select-clear"
            aria-label="清除"
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
            }}
          >
            <X size={12} />
          </span>
        ) : (
          <ChevronDown size={13} className="sa-select-chev" />
        )}
      </button>
      {open ? (
        <div className="sa-select-menu">
          {options.length === 0 ? (
            <div className="sa-select-empty">
              <AlertTriangle size={13} color="#FFA628" />
              <span>{emptyText}</span>
            </div>
          ) : (
            options.map((opt) => (
              <button
                type="button"
                key={opt}
                className={`sa-select-option${value === opt ? ' is-selected' : ''}`}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
              >
                {opt}
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}

function Modal({
  width,
  title,
  onClose,
  children,
  footer,
}: {
  width: number;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className="sa-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="sa-modal" style={{ width }} role="dialog" aria-modal="true" aria-label={title}>
        <div className="sa-modal-header">
          <span className="sa-modal-title">{title}</span>
          <button type="button" className="sa-modal-close" aria-label="Close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <div className="sa-modal-body">{children}</div>
        {footer ? <div className="sa-modal-footer">{footer}</div> : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 菜单权限树                                                          */
/* ------------------------------------------------------------------ */

type PermNode = { id: string; label: string; children?: PermNode[] };

const MENU_TREE: PermNode[] = [
  {
    id: 'goods',
    label: '商品',
    children: [
      { id: 'goods-manage', label: '商品管理' },
      {
        id: 'basic-config',
        label: '基础配置',
        children: [
          { id: 'new-arrival-price', label: '上新价模板配置' },
          { id: 'channel-price', label: '渠道定价配置' },
          { id: 'store-template', label: '店铺模板配置' },
        ],
      },
    ],
  },
  {
    id: 'trade',
    label: '交易',
    children: [{ id: 'order-manage', label: '订单管理' }],
  },
  {
    id: 'system',
    label: '系统',
    children: [
      { id: 'account-perm', label: '账号/权限' },
      {
        id: 'shop',
        label: '店铺',
        children: [
          {
            id: 'shop-auth',
            label: '店铺授权',
            children: [
              { id: 'shop-auth-add', label: '新增' },
              { id: 'shop-auth-edit', label: '修改' },
              { id: 'shop-auth-del', label: '删除' },
              { id: 'shop-auth-view', label: '查看' },
            ],
          },
          { id: 'purchase-auth', label: '采购账号授权' },
        ],
      },
      { id: 'approval', label: '审批' },
      { id: 'monitor', label: '监控' },
    ],
  },
  { id: 'logistics', label: '物流' },
  { id: 'purchase', label: '采购' },
  { id: 'report', label: '报表' },
  { id: 'toolbox', label: '工具箱' },
  { id: 'chat', label: '即时咨询' },
];

const leafIds = (node: PermNode): string[] =>
  node.children && node.children.length ? node.children.flatMap(leafIds) : [node.id];

const ALL_MENU_LEAVES = MENU_TREE.flatMap(leafIds);

function MenuTreeNode({
  node,
  depth,
  checked,
  expanded,
  onToggle,
  onExpand,
  disabled = false,
}: {
  node: PermNode;
  depth: number;
  checked: Set<string>;
  expanded: Set<string>;
  onToggle: (node: PermNode) => void;
  onExpand: (id: string) => void;
  disabled?: boolean;
}) {
  const leaves = leafIds(node);
  const hit = leaves.filter((id) => checked.has(id)).length;
  const state = hit === 0 ? 'off' : hit === leaves.length ? 'on' : 'indet';
  const hasChildren = !!(node.children && node.children.length);
  const open = expanded.has(node.id);

  return (
    <>
      <div className="sa-tree-row" style={{ paddingLeft: depth * 18 }}>
        <span
          className={`sa-tree-caret${hasChildren ? '' : ' is-hidden'}`}
          onClick={() => hasChildren && onExpand(node.id)}
        >
          {hasChildren ? open ? <ChevronDown size={13} /> : <ChevronRight size={13} /> : null}
        </span>
        <CheckBox
          checked={state === 'on'}
          indeterminate={state === 'indet'}
          disabled={disabled}
          onChange={() => !disabled && onToggle(node)}
          ariaLabel={node.label}
        />
        <span
          className="sa-tree-label"
          onClick={() => !disabled && onToggle(node)}
        >
          {node.label}
        </span>
      </div>
      {hasChildren && open
        ? node.children!.map((child) => (
            <MenuTreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              checked={checked}
              expanded={expanded}
              onToggle={onToggle}
              onExpand={onExpand}
              disabled={disabled}
            />
          ))
        : null}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 店铺权限穿梭框                                                      */
/* ------------------------------------------------------------------ */

function StoreTransfer({
  stores,
  selected,
  onChange,
}: {
  stores: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const [searchLeft, setSearchLeft] = useState('');
  const [searchRight, setSearchRight] = useState('');
  const [checkedLeft, setCheckedLeft] = useState<Set<string>>(new Set());
  const [checkedRight, setCheckedRight] = useState<Set<string>>(new Set());

  const available = stores.filter((s) => !selected.includes(s));
  const leftView = available.filter((s) => s.includes(searchLeft.trim()));
  const rightView = selected.filter((s) => s.includes(searchRight.trim()));
  const leftAll = leftView.length > 0 && leftView.every((s) => checkedLeft.has(s));
  const leftSome = leftView.some((s) => checkedLeft.has(s));
  const rightAll = rightView.length > 0 && rightView.every((s) => checkedRight.has(s));
  const rightSome = rightView.some((s) => checkedRight.has(s));

  const toggleSide = (side: 'left' | 'right', name: string) => {
    const setter = side === 'left' ? setCheckedLeft : setCheckedRight;
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const toggleAll = (side: 'left' | 'right') => {
    if (side === 'left') {
      setCheckedLeft((prev) => {
        const next = new Set(prev);
        if (leftAll) leftView.forEach((s) => next.delete(s));
        else leftView.forEach((s) => next.add(s));
        return next;
      });
    } else {
      setCheckedRight((prev) => {
        const next = new Set(prev);
        if (rightAll) rightView.forEach((s) => next.delete(s));
        else rightView.forEach((s) => next.add(s));
        return next;
      });
    }
  };

  const moveRight = () => {
    if (!checkedLeft.size) return;
    onChange([...selected, ...available.filter((s) => checkedLeft.has(s))]);
    setCheckedLeft(new Set());
  };

  const moveLeft = () => {
    if (!checkedRight.size) return;
    onChange(selected.filter((s) => !checkedRight.has(s)));
    setCheckedRight(new Set());
  };

  const renderRow = (side: 'left' | 'right', name: string) => {
    const checked = side === 'left' ? checkedLeft.has(name) : checkedRight.has(name);
    return (
      <div
        className={`sa-store-row${side === 'right' ? ' is-picked' : ''}`}
        key={name}
        onClick={() => toggleSide(side, name)}
      >
        <CheckBox
          checked={checked}
          onChange={() => toggleSide(side, name)}
          ariaLabel={name}
        />
        <span>{name}</span>
      </div>
    );
  };

  return (
    <div className="sa-transfer">
      <div className="sa-transfer-panel">
        <div className="sa-panel-title">
          <CheckBox
            checked={leftAll}
            indeterminate={!leftAll && leftSome}
            onChange={() => toggleAll('left')}
            ariaLabel="全选未选择的店铺"
          />
          未选择的店铺
        </div>
        <div className="sa-store-search">
          <Search size={13} className="sa-store-search-ico" />
          <input
            value={searchLeft}
            onChange={(e) => setSearchLeft(e.target.value)}
            placeholder="请输入店铺名称"
          />
        </div>
        {leftView.length ? (
          <div className="sa-store-list">{leftView.map((s) => renderRow('left', s))}</div>
        ) : (
          <div className="sa-store-empty-plain">暂无数据</div>
        )}
      </div>

      <div className="sa-transfer-actions">
        <button type="button" className="sa-transfer-btn" disabled={!checkedLeft.size} onClick={moveRight}>
          添加
          <ChevronRight size={12} />
        </button>
        <button type="button" className="sa-transfer-btn" disabled={!checkedRight.size} onClick={moveLeft}>
          <ChevronLeft size={12} />
          移除
        </button>
      </div>

      <div className="sa-transfer-panel">
        <div className="sa-panel-title">
          <CheckBox
            checked={rightAll}
            indeterminate={!rightAll && rightSome}
            disabled={!selected.length}
            onChange={() => toggleAll('right')}
            ariaLabel="全选已选择的店铺"
          />
          已选择的店铺({selected.length})
        </div>
        <div className="sa-store-search">
          <Search size={13} className="sa-store-search-ico" />
          <input
            value={searchRight}
            onChange={(e) => setSearchRight(e.target.value)}
            placeholder="请输入店铺名称"
          />
        </div>
        {rightView.length ? (
          <div className="sa-store-list">{rightView.map((s) => renderRow('right', s))}</div>
        ) : (
          <div className="sa-store-empty">暂未选择店铺</div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 添加子账号弹窗                                                      */
/* ------------------------------------------------------------------ */

function AddAccountDialog({
  mode = 'add',
  account,
  onClose,
  onCreated,
  onSaved,
  toast,
}: {
  mode?: 'add' | 'edit';
  account?: AccountRow;
  onClose: () => void;
  onCreated?: (row: AccountRow) => void;
  onSaved?: (row: AccountRow) => void;
  toast: (text: string) => void;
}) {
  const editing = mode === 'edit' && !!account;
  const [dtab, setDtab] = useState<'account' | 'menu' | 'store'>('account');
  const [prefix, setPrefix] = useState(account ? account.account.split('@')[0] : '');
  const [name, setName] = useState(account?.name ?? '');
  const [phone, setPhone] = useState(account?.phone ?? '');
  const [email, setEmail] = useState(account?.email ?? '');
  const [dept, setDept] = useState(
    account ? (account.dept && account.dept !== '-' ? account.dept : '0 (unknown)') : ''
  );
  const [role, setRole] = useState(account?.role ?? '');
  const [status, setStatus] = useState<1 | 0>(account?.status ?? 1);
  const [password, setPassword] = useState('');
  const [remark, setRemark] = useState(account?.remark ?? '');
  const [avatar, setAvatar] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [permChecked, setPermChecked] = useState<Set<string>>(
    new Set(account ? ALL_MENU_LEAVES : [])
  );
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [storeSelected, setStoreSelected] = useState<string[]>(
    account ? [...STORE_OPTIONS] : []
  );
  const avatarRef = useRef<HTMLInputElement>(null);

  const clearError = (key: string) =>
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });

  const chooseRole = (next: string) => {
    setRole(next);
    clearError('role');
    setPermChecked(next ? new Set(ALL_MENU_LEAVES) : new Set());
  };

  const onToggleNode = (node: PermNode) => {
    const leaves = leafIds(node);
    const hit = leaves.filter((id) => permChecked.has(id)).length;
    const next = new Set(permChecked);
    if (hit === leaves.length) leaves.forEach((id) => next.delete(id));
    else leaves.forEach((id) => next.add(id));
    setPermChecked(next);
  };

  const onExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const onPickAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatar(URL.createObjectURL(file));
    e.target.value = '';
  };

  const submit = () => {
    const next: Record<string, string> = {};
    if (!prefix.trim()) next.prefix = '请输入子账号';
    if (!name.trim()) next.name = '请输入姓名';
    if (!phone.trim()) next.phone = '请输入手机号';
    else if (!/^1\d{10}$/.test(phone.trim())) next.phone = '请输入正确的手机号';
    if (!email.trim()) next.email = '请输入邮箱';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = '请输入正确的邮箱地址';
    if (!role) next.role = '请选择角色';
    if (!editing && !password.trim()) next.password = '请输入密码';
    setErrors(next);
    if (Object.keys(next).length) {
      setDtab('account');
      return;
    }

    const nextDept = dept && dept !== '0 (unknown)' ? dept : '-';

    if (editing && account) {
      onSaved?.({
        ...account,
        account: `${prefix.trim()}@zsq888`,
        name: name.trim(),
        dept: nextDept,
        role,
        phone: phone.trim(),
        email: email.trim(),
        status,
        remark: remark.trim(),
      });
      onClose();
      toast('修改成功');
      return;
    }

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    onCreated?.({
      id: Date.now(),
      account: `${prefix.trim()}${ACCOUNT_SUFFIX}`,
      name: name.trim(),
      dept: nextDept,
      role,
      phone: phone.trim(),
      email: email.trim(),
      inviter: 'zsq888',
      createdAt: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(
        now.getHours()
      )}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
      ip: '',
      lastLogin: '',
      status,
      remark: remark.trim(),
    });
    onClose();
    toast('添加成功');
  };

  return (
    <Modal
      width={800}
      title={editing ? '修改子账号' : '添加子账号'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="sa-btn-md sa-btn-md-primary" onClick={submit}>
            确 定
          </button>
          <button type="button" className="sa-btn-md sa-btn-md-plain" onClick={onClose}>
            取 消
          </button>
        </>
      }
    >
      <div className="sa-dtabs">
        <button
          type="button"
          className={`sa-dtab${dtab === 'account' ? ' is-active' : ''}`}
          onClick={() => setDtab('account')}
        >
          账号信息
        </button>
        <button
          type="button"
          className={`sa-dtab${dtab === 'menu' ? ' is-active' : ''}`}
          onClick={() => setDtab('menu')}
        >
          菜单权限
        </button>
        <button
          type="button"
          className={`sa-dtab${dtab === 'store' ? ' is-active' : ''}`}
          onClick={() => setDtab('store')}
        >
          店铺权限
        </button>
      </div>

      {dtab === 'account' ? (
        <div className="sa-form">
          <div className="sa-form-item">
            <label className="sa-form-label">头像</label>
            <div className="sa-form-content sa-avatar-line">
              {avatar ? <img src={avatar} className="sa-avatar-preview" alt="头像" /> : null}
              <button type="button" className="sa-upload-avatar" onClick={() => avatarRef.current?.click()}>
                <Upload size={13} />
                上传头像
              </button>
              <input ref={avatarRef} type="file" accept="image/*" hidden onChange={onPickAvatar} />
            </div>
          </div>

          <div className="sa-form-item">
            <label className="sa-form-label">
              <span className="sa-req">*</span>子账号
            </label>
            <div className="sa-form-content">
              <div className={`sa-account-line${errors.prefix ? ' has-error' : ''}`}>
                <input
                  className="sa-input-lg"
                  value={prefix}
                  onChange={(e) => { setPrefix(e.target.value); clearError('prefix'); }}
                  placeholder="请输入子账号"
                />
                <span className="sa-account-suffix">{ACCOUNT_SUFFIX}</span>
              </div>
              {errors.prefix ? <div className="sa-field-error">{errors.prefix}</div> : null}
            </div>
          </div>

          <div className="sa-form-item">
            <label className="sa-form-label">
              <span className="sa-req">*</span>姓名
            </label>
            <div className="sa-form-content">
              <input
                className={`sa-input-lg${errors.name ? ' has-error' : ''}`}
                value={name}
                onChange={(e) => { setName(e.target.value); clearError('name'); }}
                placeholder="请输入姓名"
              />
              {errors.name ? <div className="sa-field-error">{errors.name}</div> : null}
            </div>
          </div>

          <div className="sa-form-item">
            <label className="sa-form-label">
              <span className="sa-req">*</span>手机号
            </label>
            <div className="sa-form-content">
              <input
                className={`sa-input-lg${errors.phone ? ' has-error' : ''}`}
                value={phone}
                onChange={(e) => { setPhone(e.target.value); clearError('phone'); }}
                placeholder="请输入手机号"
              />
              {errors.phone ? <div className="sa-field-error">{errors.phone}</div> : null}
            </div>
          </div>

          <div className="sa-form-item">
            <label className="sa-form-label">
              <span className="sa-req">*</span>邮箱
            </label>
            <div className="sa-form-content">
              <input
                className={`sa-input-lg${errors.email ? ' has-error' : ''}`}
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError('email'); }}
                placeholder="请输入邮箱"
              />
              {errors.email ? <div className="sa-field-error">{errors.email}</div> : null}
            </div>
          </div>

          <div className="sa-form-item">
            <label className="sa-form-label">部门</label>
            <div className="sa-form-content">
              <SelectBox
                value={dept}
                placeholder="请选择部门"
                options={[]}
                onChange={setDept}
                width="100%"
                height={36}
                className="sa-select-lg"
                clearable
              />
            </div>
          </div>

          <div className="sa-form-item">
            <label className="sa-form-label">
              <span className="sa-req">*</span>角色
            </label>
            <div className="sa-form-content">
              <SelectBox
                value={role}
                placeholder="请选择角色"
                options={ROLE_OPTIONS}
                onChange={chooseRole}
                width="100%"
                height={36}
                className={`sa-select-lg${errors.role ? ' has-error' : ''}`}
                tag
              />
              {errors.role ? <div className="sa-field-error">{errors.role}</div> : null}
            </div>
          </div>

          <div className="sa-form-item">
            <label className="sa-form-label">
              <span className="sa-req">*</span>账户状态
            </label>
            <div className="sa-form-content sa-radio-line">
              <label className={`sa-radio${status === 1 ? ' is-checked' : ''}`} onClick={() => setStatus(1)}>
                <span className="sa-radio-dot" />
                启用
              </label>
              <label className={`sa-radio${status === 0 ? ' is-checked' : ''}`} onClick={() => setStatus(0)}>
                <span className="sa-radio-dot" />
                停用
              </label>
            </div>
          </div>

          {!editing ? (
            <div className="sa-form-item">
              <label className="sa-form-label">
                <span className="sa-req">*</span>密码
              </label>
              <div className="sa-form-content">
                <input
                  type="password"
                  className={`sa-input-lg${errors.password ? ' has-error' : ''}`}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError('password'); }}
                  placeholder="请输入密码"
                />
                {errors.password ? <div className="sa-field-error">{errors.password}</div> : null}
              </div>
            </div>
          ) : null}

          <div className="sa-form-item">
            <label className="sa-form-label">备注</label>
            <div className="sa-form-content">
              <textarea
                className="sa-textarea"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="请输入备注"
              />
            </div>
          </div>
        </div>
      ) : null}

      {dtab === 'menu' ? (
        <div className={`sa-tree${editing ? ' is-readonly' : ''}`}>
          {!role ? (
            <div className="sa-perm-hint">请先选择角色以查看对应的菜单权限</div>
          ) : (
            MENU_TREE.map((node) => (
              <MenuTreeNode
                key={node.id}
                node={node}
                depth={0}
                checked={permChecked}
                expanded={expanded}
                onToggle={onToggleNode}
                onExpand={onExpand}
                disabled={editing}
              />
            ))
          )}
        </div>
      ) : null}

      {dtab === 'store' ? (
        <StoreTransfer stores={STORE_OPTIONS} selected={storeSelected} onChange={setStoreSelected} />
      ) : null}
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* 重置密码 / 批量修改                                                 */
/* ------------------------------------------------------------------ */

function ResetPasswordDialog({ onClose, toast }: { onClose: () => void; toast: (t: string) => void }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const submit = () => {
    if (!value.trim()) {
      setError('请输入新密码');
      return;
    }
    onClose();
    toast('密码重置成功');
  };

  return (
    <div className="sa-overlay sa-msg-overlay">
      <div className="sa-msgbox" role="dialog" aria-modal="true" aria-label="提示">
        <div className="sa-msgbox-header">
          <span className="sa-msgbox-title">提示</span>
          <button type="button" className="sa-modal-close" aria-label="Close" onClick={onClose}>
            <X size={15} />
          </button>
        </div>
        <div className="sa-msgbox-content">
          <p>请输入新密码</p>
          <input
            autoFocus
            className={`sa-input-lg${error ? ' has-error' : ''}`}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError('');
            }}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
          {error ? <div className="sa-msgbox-error">{error}</div> : null}
        </div>
        <div className="sa-msgbox-btns">
          <button type="button" className="sa-btn sa-btn-plain" onClick={onClose}>
            取消
          </button>
          <button type="button" className="sa-btn sa-btn-primary" onClick={submit}>
            确定
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteAccountDialog({
  account,
  onClose,
  onConfirm,
  onDisable,
}: {
  account: AccountRow;
  onClose: () => void;
  onConfirm: (id: number) => void;
  onDisable: (id: number) => void;
}) {
  const [seconds, setSeconds] = useState(5);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = window.setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [seconds]);

  const submit = () => {
    if (seconds > 0) return;
    if (!password.trim()) {
      setError('请输入主账号密码');
      return;
    }
    onConfirm(account.id);
  };

  return (
    <Modal
      width={520}
      title="删除子账号"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="sa-btn-md sa-btn-md-plain" onClick={onClose}>
            取消
          </button>
          <button
            type="button"
            className="sa-btn-md sa-btn-md-danger"
            disabled={seconds > 0}
            onClick={submit}
          >
            {seconds > 0 ? `确认删除（${seconds}s）` : '确认删除'}
          </button>
        </>
      }
    >
      <div className="sa-delete-account">
        <span className="sa-delete-account-label">子账号</span>
        <span className="sa-delete-account-name">{account.name}</span>
        <span className="sa-delete-account-id">{account.account}</span>
      </div>

      <div className="sa-delete-warning">
        <AlertTriangle size={16} color="#F44837" />
        <div>
          <div className="sa-delete-warning-title">删除后将无法恢复</div>
          <p>该子账号及其菜单权限、店铺权限等关联数据会被一并删除，请谨慎操作。</p>
        </div>
      </div>

      <div className="sa-delete-hint">
        如暂时需要保留资料但不希望该子账号登录，可以先
        <button type="button" className="sa-delete-link" onClick={() => onDisable(account.id)}>
          禁用子账号
        </button>
        。
      </div>

      <div className="sa-form-item sa-delete-form">
        <label className="sa-form-label">
          <span className="sa-req">*</span>主账号密码
        </label>
        <div className="sa-form-content">
          <input
            type="password"
            className={`sa-input-lg${error ? ' has-error' : ''}`}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            placeholder="请输入主账号密码以验证身份"
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
          {error ? <div className="sa-field-error">{error}</div> : null}
        </div>
      </div>

    </Modal>
  );
}

function BatchEditDialog({
  onClose,
  onApply,
  toast,
}: {
  onClose: () => void;
  onApply: (next: { dept: string; role: string; status: 1 | 0 }) => void;
  toast: (t: string) => void;
}) {
  const [dtab, setDtab] = useState<'account' | 'menu'>('account');
  const [dept, setDept] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState<1 | 0>(1);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [permChecked, setPermChecked] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const chooseRole = (next: string) => {
    setRole(next);
    setError('');
    setPermChecked(next ? new Set(ALL_MENU_LEAVES) : new Set());
  };

  const onToggleNode = (node: PermNode) => {
    const leaves = leafIds(node);
    const hit = leaves.filter((id) => permChecked.has(id)).length;
    const next = new Set(permChecked);
    if (hit === leaves.length) leaves.forEach((id) => next.delete(id));
    else leaves.forEach((id) => next.add(id));
    setPermChecked(next);
  };

  const onExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const submit = () => {
    if (!role) {
      setError('请选择角色');
      setDtab('account');
      return;
    }
    onApply({ dept, role, status });
    onClose();
    toast('批量修改成功');
  };

  return (
    <Modal
      width={800}
      title="批量修改"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="sa-btn-md sa-btn-md-primary" onClick={submit}>
            确 定
          </button>
          <button type="button" className="sa-btn-md sa-btn-md-plain" onClick={onClose}>
            取 消
          </button>
        </>
      }
    >
      <div className="sa-dtabs">
        <button
          type="button"
          className={`sa-dtab${dtab === 'account' ? ' is-active' : ''}`}
          onClick={() => setDtab('account')}
        >
          账号信息
        </button>
        <button
          type="button"
          className={`sa-dtab${dtab === 'menu' ? ' is-active' : ''}`}
          onClick={() => setDtab('menu')}
        >
          菜单权限
        </button>
      </div>

      {dtab === 'account' ? (
        <div className="sa-form">
          <div className="sa-form-item">
            <label className="sa-form-label">部门</label>
            <div className="sa-form-content">
              <SelectBox
                value={dept}
                placeholder="请选择部门"
                options={[]}
                onChange={setDept}
                width="100%"
                height={36}
                className="sa-select-lg"
                clearable
              />
            </div>
          </div>

          <div className="sa-form-item">
            <label className="sa-form-label">
              <span className="sa-req">*</span>角色
            </label>
            <div className="sa-form-content">
              <SelectBox
                value={role}
                placeholder="请选择角色"
                options={ROLE_OPTIONS}
                onChange={chooseRole}
                width="100%"
                height={36}
                className={`sa-select-lg${error ? ' has-error' : ''}`}
                tag
              />
              {error ? <div className="sa-field-error">{error}</div> : null}
            </div>
          </div>

          <div className="sa-form-item">
            <label className="sa-form-label">
              <span className="sa-req">*</span>账户状态
            </label>
            <div className="sa-form-content sa-radio-line">
              <label className={`sa-radio${status === 1 ? ' is-checked' : ''}`} onClick={() => setStatus(1)}>
                <span className="sa-radio-dot" />
                启用
              </label>
              <label className={`sa-radio${status === 0 ? ' is-checked' : ''}`} onClick={() => setStatus(0)}>
                <span className="sa-radio-dot" />
                停用
              </label>
            </div>
          </div>

          <div className="sa-form-item">
            <label className="sa-form-label">密码</label>
            <div className="sa-form-content">
              <input
                type="password"
                className="sa-input-lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="不修改请留空"
              />
            </div>
          </div>
        </div>
      ) : null}

      {dtab === 'menu' ? (
        <div className="sa-tree">
          {!role ? (
            <div className="sa-perm-hint">请先选择角色以查看对应的菜单权限</div>
          ) : (
            MENU_TREE.map((node) => (
              <MenuTreeNode
                key={node.id}
                node={node}
                depth={0}
                checked={permChecked}
                expanded={expanded}
                onToggle={onToggleNode}
                onExpand={onExpand}
              />
            ))
          )}
        </div>
      ) : null}
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* 批量新增 / 链接邀请                                                 */
/* ------------------------------------------------------------------ */

const TEMPLATE_URL = new URL('./assets/sub-account-import-template.xlsx', import.meta.url).href;

function BatchAddDialog({ onClose, toast }: { onClose: () => void; toast: (t: string) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const pick = (next: File | undefined | null) => {
    if (!next) return;
    if (!/\.(xlsx|xls)$/i.test(next.name)) {
      setError('仅支持 .xlsx / .xls 格式');
      setFile(null);
      return;
    }
    setFile(next);
    setError('');
  };

  const submit = () => {
    if (!file) {
      setError('请先上传文件');
      return;
    }
    onClose();
    toast('批量导入任务已提交');
  };

  return (
    <Modal
      width={480}
      title="批量新增"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="sa-btn-md sa-btn-md-plain" onClick={onClose}>
            取消
          </button>
          <button type="button" className="sa-btn-md sa-btn-md-primary" onClick={submit}>
            提交
          </button>
        </>
      }
    >
      <div className="sa-import-tip">请先下载模板，按格式填写后再上传（支持 .xlsx / .xls）</div>
      <a className="sa-template-link" href={TEMPLATE_URL} download="子账号导入模板.xlsx">
        <Download size={14} />
        子账号导入模板.xlsx
      </a>

      <div
        className={`sa-uploader${drag ? ' is-drag' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          pick(e.dataTransfer.files?.[0]);
        }}
      >
        <CloudUpload size={44} strokeWidth={1.3} className="sa-uploader-icon" />
        <div className="sa-uploader-text">
          将文件拖到此处，或<em>点击上传</em>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          hidden
          onChange={(e) => {
            pick(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </div>
      <div className="sa-upload-tip">仅支持 .xlsx / .xls 格式</div>
      {file ? (
        <div className="sa-file-row">
          <FileText size={14} />
          <span className="sa-file-name">{file.name}</span>
          <span className="sa-file-size">{Math.max(1, Math.round(file.size / 1024))} KB</span>
          <button type="button" className="sa-file-del" aria-label="移除文件" onClick={() => setFile(null)}>
            <Trash2 size={13} />
          </button>
        </div>
      ) : null}
      {error ? <div className="sa-upload-error">{error}</div> : null}
    </Modal>
  );
}

const makeInviteToken = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let out = 'eyJ0Ijo2NiwiYSI6MjUyLCJlIjoxNzk2Mjc5NTc4fQ.';
  for (let i = 0; i < 43; i += 1) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
};

function InviteDialog({ onClose, toast }: { onClose: () => void; toast: (t: string) => void }) {
  const [link] = useState(
    () => `https://test.kuachengjing.com/sub-account-invite?token=${makeInviteToken()}`
  );

  const copy = () => {
    const done = () => toast('复制成功');
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(link).then(done).catch(fallback);
    } else {
      fallback();
    }
    function fallback() {
      const ta = document.createElement('textarea');
      ta.value = link;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
      } catch {
        /* ignore */
      }
      document.body.removeChild(ta);
      done();
    }
  };

  return (
    <Modal
      width={560}
      title="链接邀请"
      onClose={onClose}
      footer={
        <button type="button" className="sa-btn-md sa-btn-md-primary" onClick={onClose}>
          知道了
        </button>
      }
    >
      <div className="sa-invite-tip">
        已生成邀请链接，打开后由用户自行填写账号信息，提交后需审核。
      </div>
      <div className="sa-invite-group">
        <input className="sa-invite-input" value={link} readOnly onFocus={(e) => e.target.select()} />
        <button type="button" className="sa-invite-copy" onClick={copy}>
          复制链接
        </button>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* 主页面                                                              */
/* ------------------------------------------------------------------ */

type ToastState = { id: number; text: string } | null;

export default function SubAccountManagement() {
  const [tab, setTab] = useState<TabId>('list');
  const [accounts, setAccounts] = useState<AccountRow[]>(INITIAL_ACCOUNTS);
  const [keyword, setKeyword] = useState('');
  const [dept, setDept] = useState('');
  const [role, setRole] = useState('');
  const [query, setQuery] = useState({ keyword: '', dept: '', role: '' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [goto, setGoto] = useState('');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<AccountRow | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [deleteAccount, setDeleteAccount] = useState<AccountRow | null>(null);
  const [batchOpen, setBatchOpen] = useState(false);
  const [batchEditOpen, setBatchEditOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const showToast = (text: string) => setToast({ id: Date.now(), text });

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => {
    const kw = query.keyword.trim().toLowerCase();
    return accounts.filter((row) => {
      const hitKw =
        !kw ||
        [row.account, row.name, row.phone, row.email].some((v) => v.toLowerCase().includes(kw));
      const hitDept = !query.dept || row.dept === query.dept;
      const hitRole = !query.role || row.role === query.role;
      return hitKw && hitDept && hitRole;
    });
  }, [accounts, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageRows = useMemo(
    () => (tab === 'list' ? filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize) : []),
    [tab, filtered, currentPage, pageSize]
  );

  const pageAllChecked = pageRows.length > 0 && pageRows.every((r) => selected.has(r.id));
  const pageSomeChecked = pageRows.some((r) => selected.has(r.id));
  const columns = columnsForTab(tab);
  const tableMinWidth =
    columns.reduce((sum, c) => sum + c.width, 0) + 55;

  const onSearch = () => {
    setQuery({ keyword, dept, role });
    setExpandedId(null);
    setPage(1);
  };

  const onReset = () => {
    setKeyword('');
    setDept('');
    setRole('');
    setQuery({ keyword: '', dept: '', role: '' });
    setExpandedId(null);
    setPage(1);
  };

  const onGoto = () => {
    const n = Number.parseInt(goto, 10);
    if (!Number.isNaN(n)) {
      setExpandedId(null);
      setPage(Math.min(Math.max(n, 1), pageCount));
    }
    setGoto('');
  };

  const goPage = (n: number) => {
    setExpandedId(null);
    setPage(n);
  };

  const togglePageAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (pageAllChecked) pageRows.forEach((r) => next.delete(r.id));
      else pageRows.forEach((r) => next.add(r.id));
      return next;
    });
  };

  const switchTab = (id: TabId) => {
    setTab(id);
    setSelected(new Set());
    setExpandedId(null);
    setPage(1);
  };

  const onCreated = (row: AccountRow) => {
    setAccounts((prev) => [...prev, row]);
    setKeyword('');
    setDept('');
    setRole('');
    setQuery({ keyword: '', dept: '', role: '' });
    setExpandedId(null);
    setPage(1);
    setTab('list');
  };

  const onSaved = (row: AccountRow) => {
    setAccounts((prev) => prev.map((item) => (item.id === row.id ? row : item)));
    setEditAccount(null);
    setExpandedId(null);
  };

  const onBatchApply = (next: { dept: string; role: string; status: 1 | 0 }) => {
    setAccounts((prev) =>
      prev.map((item) =>
        selected.has(item.id)
          ? {
              ...item,
              dept: next.dept && next.dept !== '0 (unknown)' ? next.dept : item.dept,
              role: next.role,
              status: next.status,
            }
          : item
      )
    );
    setSelected(new Set());
    setExpandedId(null);
  };

  const onDeleteAccount = (id: number) => {
    setAccounts((prev) => prev.filter((item) => item.id !== id));
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setExpandedId((cur) => (cur === id ? null : cur));
    setDeleteAccount(null);
    showToast('删除成功');
  };

  const onDisableAccount = (id: number) => {
    setAccounts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 0 } : item))
    );
    setDeleteAccount(null);
    showToast('子账号已停用，账号资料已保留');
  };

  return (
    <div className="sa-page">
      <TopBar />

      <main className="sa-main">
        <section className="sa-card">
          <div className="sa-tabsbar">
            <div className="sa-tabs" role="tablist">
              {TABS.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  role="tab"
                  aria-selected={tab === t.id}
                  className={`sa-tab${tab === t.id ? ' is-active' : ''}`}
                  onClick={() => switchTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="sa-filter">
            <div className="sa-field">
              <span className="sa-label">关键词</span>
              <input
                className="sa-input"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                placeholder="请输入关键词"
              />
            </div>
            <div className="sa-field">
              <span className="sa-label">部门</span>
              <SelectBox value={dept} placeholder="选择部门" options={[]} onChange={setDept} width={160} height={34} />
            </div>
            <div className="sa-field">
              <span className="sa-label">角色</span>
              <SelectBox value={role} placeholder="请选择角色" options={ROLE_OPTIONS} onChange={setRole} width={160} height={32} />
            </div>

            <button type="button" className="sa-btn sa-btn-primary" onClick={onSearch}>
              <Search size={13} strokeWidth={2.4} />
              搜索
            </button>
            <button type="button" className="sa-btn sa-btn-plain" onClick={onReset}>
              <RotateCcw size={13} strokeWidth={2.2} />
              重置
            </button>

            {tab === 'list' ? (
              <>
                <button type="button" className="sa-btn sa-btn-primary" onClick={() => setAddOpen(true)}>
                  <Plus size={13} strokeWidth={2.4} />
                  新增
                </button>
                <button type="button" className="sa-btn sa-btn-primary" onClick={() => setInviteOpen(true)}>
                  链接邀请
                </button>
                <button type="button" className="sa-btn sa-btn-primary" onClick={() => setBatchOpen(true)}>
                  <Upload size={13} strokeWidth={2.2} />
                  批量新增
                </button>
                {selected.size > 0 ? (
                  <button type="button" className="sa-btn sa-btn-primary" onClick={() => setBatchEditOpen(true)}>
                    <Edit3 size={13} />
                    批量修改
                  </button>
                ) : null}
              </>
            ) : null}
          </div>

          <div className="sa-table-scroll">
            <table className="sa-table" style={{ minWidth: tableMinWidth }}>
              <colgroup>
                <col style={{ width: 55 }} />
                {columns.map((c) => (
                  <col key={c.label} style={{ width: c.width }} />
                ))}
              </colgroup>
              <thead>
                <tr>
                  <th className="sa-th-check">
                    <CheckBox
                      checked={pageAllChecked}
                      indeterminate={!pageAllChecked && pageSomeChecked}
                      onChange={togglePageAll}
                      ariaLabel="全选"
                    />
                  </th>
                  {columns.map((c) => (
                    <th key={c.label} className={c.center ? 'is-center' : ''}>
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tab !== 'list' || !pageRows.length ? (
                  <tr>
                    <td className="sa-empty" colSpan={columns.length + 1}>
                      暂无数据
                    </td>
                  </tr>
                ) : (
                  pageRows.map((row) => (
                    <React.Fragment key={row.id}>
                      <tr
                        className={`sa-data-row${expandedId === row.id ? ' is-expanded' : ''}`}
                        onClick={() =>
                          setExpandedId((cur) => (cur === row.id ? null : row.id))
                        }
                      >
                        <td className="sa-td-check">
                          <CheckBox
                            checked={selected.has(row.id)}
                            onChange={() =>
                              setSelected((prev) => {
                                const next = new Set(prev);
                                if (next.has(row.id)) next.delete(row.id);
                                else next.add(row.id);
                                return next;
                              })
                            }
                            ariaLabel={`选择 ${row.name}`}
                          />
                        </td>
                        {columns.map((c) => (
                          <td key={c.label} className={c.center ? 'is-center' : ''}>
                            {c.key === 'status' ? (
                              <span className={`sa-tag ${row.status ? 'is-on' : 'is-off'}`}>
                                {row.status ? '启用' : '停用'}
                              </span>
                            ) : (
                              <span className="sa-cell-text" title={String(row[c.key as keyof AccountRow] ?? '')}>
                                {String(row[c.key as keyof AccountRow] ?? '')}
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                      {expandedId === row.id ? (
                        <tr className="sa-expand-tr">
                          <td className="sa-expand-td" colSpan={columns.length + 1}>
                            <div className="sa-expand-actions">
                              <button
                                type="button"
                                className="sa-btn sa-btn-primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditAccount(row);
                                }}
                              >
                                <Edit3 size={12} />
                                修改
                              </button>
                              <button
                                type="button"
                                className="sa-btn sa-btn-primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setResetOpen(true);
                                }}
                              >
                                <RotateCcw size={12} />
                                重置密码
                              </button>
                              <button
                                type="button"
                                className="sa-btn sa-btn-danger"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteAccount(row);
                                }}
                              >
                                <Trash2 size={12} />
                                删除
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {tab === 'list' ? (
            <div className="sa-pagination">
              <span className="sa-total">共 {filtered.length} 条</span>
              <SelectBox
                value={`${pageSize}条/页`}
                placeholder=""
                options={[10, 20, 50, 100].map((n) => `${n}条/页`)}
                onChange={(v) => {
                  setPageSize(Number.parseInt(v, 10));
                  setExpandedId(null);
                  setPage(1);
                }}
                width={100}
                height={32}
                className="sa-page-size"
              />
              <button
                type="button"
                className="sa-page-btn sa-page-arrow"
                disabled={currentPage <= 1}
                onClick={() => goPage(Math.max(1, currentPage - 1))}
                aria-label="上一页"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                <button
                  type="button"
                  key={n}
                  className={`sa-page-btn${n === currentPage ? ' is-active' : ''}`}
                  onClick={() => goPage(n)}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                className="sa-page-btn sa-page-arrow"
                disabled={currentPage >= pageCount}
                onClick={() => goPage(Math.min(pageCount, currentPage + 1))}
                aria-label="下一页"
              >
                <ChevronRight size={14} />
              </button>
              <span className="sa-goto">
                前往
                <input
                  value={goto}
                  placeholder={String(currentPage)}
                  onChange={(e) => setGoto(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && onGoto()}
                  onBlur={onGoto}
                />
                页
              </span>
            </div>
          ) : null}
        </section>
      </main>

      <div className="sa-contact">
        <Headphones size={22} />
        <span>联系我们</span>
      </div>

      {addOpen ? (
        <AddAccountDialog onClose={() => setAddOpen(false)} onCreated={onCreated} toast={showToast} />
      ) : null}
      {editAccount ? (
        <AddAccountDialog
          mode="edit"
          account={editAccount}
          onClose={() => setEditAccount(null)}
          onSaved={onSaved}
          toast={showToast}
        />
      ) : null}
      {resetOpen ? <ResetPasswordDialog onClose={() => setResetOpen(false)} toast={showToast} /> : null}
      {deleteAccount ? (
        <DeleteAccountDialog
          account={deleteAccount}
          onClose={() => setDeleteAccount(null)}
          onConfirm={onDeleteAccount}
          onDisable={onDisableAccount}
        />
      ) : null}
      {batchEditOpen ? (
        <BatchEditDialog
          onClose={() => setBatchEditOpen(false)}
          onApply={onBatchApply}
          toast={showToast}
        />
      ) : null}
      {batchOpen ? <BatchAddDialog onClose={() => setBatchOpen(false)} toast={showToast} /> : null}
      {inviteOpen ? <InviteDialog onClose={() => setInviteOpen(false)} toast={showToast} /> : null}

      {toast ? (
        <div className="sa-toast" key={toast.id}>
          <CheckCircle2 size={16} color="#67C23A" />
          {toast.text}
        </div>
      ) : null}
    </div>
  );
}
