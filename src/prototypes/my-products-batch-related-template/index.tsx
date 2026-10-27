/**
 * @name 我的商品 - 批量关联产品模板
 */

import React, { useEffect, useRef, useState } from 'react';
import './style.css';

import logoImg from './assets/platform-logo.png';
import collectIcon from './assets/collect-icon.png';
import dhIcon from './assets/dh-icon.png';
import thumb1 from './assets/thumb-1.jpg';
import thumb2 from './assets/thumb-2.jpg';
import thumb3 from './assets/thumb-3.jpg';
import thumb4 from './assets/thumb-4.jpg';
import thumb5 from './assets/thumb-5.jpg';
import thumb6 from './assets/thumb-6.jpg';
import thumb7 from './assets/thumb-7.jpg';
import thumb8 from './assets/thumb-8.jpg';
import thumb9 from './assets/thumb-9.jpg';
import icSun from './assets/icons/sun.svg';
import icMenu from './assets/icons/menu.svg';
import icHelp from './assets/icons/help.svg';
import icCrown from './assets/icons/crown.svg';
import icCaret from './assets/icons/caret-down.svg';
import icChevron from './assets/icons/chevron-down.svg';
import icCalendar from './assets/icons/calendar.svg';
import icStepper from './assets/icons/stepper.svg';
import icGear from './assets/icons/gear.svg';
import icRefresh from './assets/icons/refresh.svg';
import icHeadset from './assets/icons/headset.svg';
import icArrowUp from './assets/icons/arrow-up.svg';
import icArrowDown from './assets/icons/arrow-down.svg';
import icChevLeft from './assets/icons/chevron-left.svg';
import icChevRight from './assets/icons/chevron-right.svg';
import { AnnotationViewer, type AnnotationSourceDocument } from '@axhub/annotation';
import annotationSourceDocument from './annotation-source.json';

const NAV_ITEMS = ['首页', '商品', '交易', '采购', '物流', '报表', '系统', '工具箱', '即时咨询'];

const SIDE_GROUPS: { title: string; items: { label: string; count: string; active?: boolean }[] }[] = [
  { title: '商品概览', items: [{ label: '全部商品', count: '9285' }] },
  {
    title: '发布管理',
    items: [
      { label: '待发布', count: '334' },
      { label: '发布中', count: '2' },
      { label: '循环刊登', count: '35' },
      { label: '发布失败', count: '84' },
    ],
  },
  {
    title: '销售状态',
    items: [
      { label: '已上架', count: '2741', active: true },
      { label: '已下架', count: '3080' },
    ],
  },
  {
    title: '审核与风险',
    items: [
      { label: '待审核', count: '0' },
      { label: '审核未通过', count: '2835' },
      { label: '内容违规', count: '173' },
      { label: '侵权违规', count: '0' },
      { label: '品牌商投诉', count: '1' },
    ],
  },
  {
    title: '其他',
    items: [
      { label: '未定义', count: '0' },
      { label: '回收站', count: '0' },
    ],
  },
];

interface ProductRow {
  thumb: string;
  title: string;
  url: string;
  category: string;
  status: string;
  store: string;
  code: string;
  price: string;
  claimAt: string;
  modifyAt: string;
  publishAt: string;
  claimVersion: string;
  currentVersion: string;
}

const ROWS: ProductRow[] = [
  {
    thumb: thumb1,
    title: 'asdsadjlasldkjaslkasdasdadczcfadasd',
    url: 'https://www.dhgate.com/product/x/1130958734.html',
    category: '箱包及箱包辅料 < 时装包 < 单肩包',
    status: '已上架',
    store: '包包',
    code: '1130958734',
    price: '$ 61.03',
    claimAt: '2026-10-19 16:25:07',
    modifyAt: '2026-10-19 16:27:07',
    publishAt: '2026-10-19 16:33:34',
    claimVersion: '1',
    currentVersion: '1',
  },
  {
    thumb: thumb2,
    title:
      'Blue Green Gradient Mesh Running Sneakers Men Lightweight Shock Absorbing Thick Sole Breathable Outdoor Marathon Daily Sports Shoes V V189834',
    url: 'https://www.dhgate.com/product/x/1130190790.html',
    category: '鞋类及鞋类辅料 < 运动鞋 < 健身运动鞋',
    status: '已上架',
    store: 'sneakerhub8',
    code: '1130190790',
    price: '$ 50.29',
    claimAt: '2026-10-14 11:06:29',
    modifyAt: '2026-10-14 15:54:04',
    publishAt: '2026-10-14 11:06:31',
    claimVersion: '1',
    currentVersion: '1',
  },
  {
    thumb: thumb3,
    title:
      'Vintage Printed Canvas Flap Crossbody Bag Small Top Handle Gold Square Turn Lock Detachable Leather Shoulder Strap Mini Daily Messeng V417168',
    url: 'https://www.dhgate.com/product/x/1130188414.html',
    category: '箱包及箱包辅料 < 时装包 < 斜挎包',
    status: '已上架',
    store: 'sneakerhub8',
    code: '1130188414',
    price: '$ 60.66',
    claimAt: '2026-10-14 10:53:37',
    modifyAt: '2026-10-14 10:53:38',
    publishAt: '2026-10-14 10:53:38',
    claimVersion: '1',
    currentVersion: '1',
  },
  {
    thumb: thumb4,
    title:
      'Blue Green Gradient Mesh Running Sneakers Men Lightweight Shock Absorbing Thick Sole Breathable Outdoor Marathon Daily Sports Shoes',
    url: 'https://www.dhgate.com/product/x/1130178716.html',
    category: '鞋类及鞋类辅料 < 运动鞋 < 健身运动鞋',
    status: '已上架',
    store: '鞋子',
    code: '1130178716',
    price: '$ 50.29',
    claimAt: '2026-10-14 10:08:24',
    modifyAt: '2026-10-14 10:08:24',
    publishAt: '2026-10-14 10:08:25',
    claimVersion: '1',
    currentVersion: '1',
  },
  {
    thumb: thumb5,
    title:
      'Fashion Designer Bag Luxury Le City Mini Vertical Leather Tote Bag Decor Metal Studs And Front Zipper Pocket Design Portable Top Handle Crossbody Purse Women Handbag',
    url: 'https://www.dhgate.com/product/x/1128145811.html',
    category: '箱包及箱包辅料 < 时装包 < 手提包',
    status: '已上架',
    store: '包包',
    code: '1128145811',
    price: '$ 266.04',
    claimAt: '2026-10-13 15:38:37',
    modifyAt: '2026-10-13 15:38:37',
    publishAt: '-',
    claimVersion: '-',
    currentVersion: '-',
  },
  {
    thumb: thumb6,
    title:
      'Casual Shoes Skate Vintage Panelled Sneaker Retro German Army Trainer Soft Suede Upper Casual Flat Board Shoe For Women Daily',
    url: 'https://www.dhgate.com/product/x/1129603345.html',
    category: '鞋类及鞋类辅料 < 休闲鞋',
    status: '已上架',
    store: '鞋子',
    code: '1129603345',
    price: '$ 50.16',
    claimAt: '2026-10-10 10:07:59',
    modifyAt: '2026-10-12 10:16:10',
    publishAt: '2026-10-10 10:07:59',
    claimVersion: '-',
    currentVersion: '1',
  },
  {
    thumb: thumb7,
    title:
      'Running Shoes Size Men Air Cushion Sneakers Breathable Mesh Lace Lightweight Comfortable Athletic Training Shoes Blue Black Daily Fitness',
    url: 'https://www.dhgate.com/product/x/1129607021.html',
    category: '鞋类及鞋类辅料 < 运动鞋 < 跑鞋',
    status: '已上架',
    store: 'sneakerhub8',
    code: '1129607021',
    price: '$ 82.68',
    claimAt: '2026-10-10 10:30:27',
    modifyAt: '2026-10-10 10:32:03',
    publishAt: '2026-10-10 10:30:33',
    claimVersion: '1',
    currentVersion: '1',
  },
  {
    thumb: thumb8,
    title:
      'Burgundy Leather Embroidered Western Cowboy Boots Side Zipper Snip Pointed Toe Wooden Block Heel Tall Cowgirl Boots For Women',
    url: 'https://www.dhgate.com/product/x/1129604047.html',
    category: '鞋类及鞋类辅料 < 靴子',
    status: '已上架',
    store: '鞋子',
    code: '1129604047',
    price: '$ 103.59',
    claimAt: '2026-10-10 10:12:11',
    modifyAt: '2026-10-10 10:15:04',
    publishAt: '2026-10-10 10:12:11',
    claimVersion: '-',
    currentVersion: '1',
  },
  {
    thumb: thumb6,
    title:
      'Casual Shoes Skate Vintage Panelled Sneaker Retro German Army Trainer Soft Suede Upper Casual Flat Board Shoe For Women Daily',
    url: 'https://www.dhgate.com/product/x/1129603641.html',
    category: '鞋类及鞋类辅料 < 休闲鞋',
    status: '已上架',
    store: '包包',
    code: '1129603641',
    price: '$ 50.16',
    claimAt: '2026-10-10 10:09:36',
    modifyAt: '2026-10-10 10:11:03',
    publishAt: '2026-10-10 10:09:36',
    claimVersion: '-',
    currentVersion: '1',
  },
  {
    thumb: thumb9,
    title:
      'Casual Shoes For Mens Designer Metallic Leather Platform Sneakers With Thick White Sole And Lace Closure For Women Casual Wear',
    url: 'https://www.dhgate.com/product/x/1116255581.html',
    category: '鞋类及鞋类辅料 < 休闲鞋',
    status: '已上架',
    store: 'sneakerhub8',
    code: '1116255581',
    price: '$ 42.49',
    claimAt: '2026-10-09 18:32:26',
    modifyAt: '2026-10-09 18:32:29',
    publishAt: '2026-07-21 18:11:46',
    claimVersion: '-',
    currentVersion: '-',
  },
];

const BATCH_ACTIONS = ['批量编辑', '批量更新发布', '批量标签', '批量删除', '批量AI克隆', '批量下架', '批量关联产品模板'];
// ===== 批量关联产品模板：按店铺分别关联（移植自 auto-edit-dialog-copy2）=====
// 示例数据对应接口 dh.relmodel.pageget$2.0：展示位数量 = relModelProdList 列表长度
const MAX_TEMPLATE_SLOTS = 6;

const productTemplates = [
  { id: 'tpl-digital', modelName: '【全新未拆封】i17Pro Max 灵动岛 16+1TB 全网通5G智能手机', relModelProdList: ['P20261012001', 'P20261012002', 'P20261012003', 'P20261012004'] },
  { id: 'tpl-earbuds', modelName: '【跨境专供】无线蓝牙耳机 主动降噪 超长续航', relModelProdList: ['P20261011001'] },
  { id: 'tpl-bag', modelName: '【爆款】男士休闲双肩包 大容量防水通勤背包', relModelProdList: ['P20261010001', 'P20261010002', 'P20261010003', 'P20261010004', 'P20261010005', 'P20261010006'] },
];

const tplSyncModes = [
  { id: 'add', label: '新增产品', hint: '把当前选中的、已有产品编号的产品加入模板。最多能加几个，取决于模板的剩余展示位。' },
  { id: 'modify', label: '修改产品', hint: '用当前选中的、已有产品编号的产品直接替换模板中已有的产品，只替换不新增。' },
];

const tplShops = [
  { id: 'shop-1', name: '服装测试' },
  { id: 'shop-2', name: 'bag' },
  { id: 'shop-3', name: 'shoes' },
];

type ShopTplState = { tplId: string; mode: string };
const defaultShopTpl: ShopTplState = { tplId: '', mode: '' };

type TplMenuPos = { left: number; top?: number; bottom?: number; minWidth: number; maxWidth: number };

function ProductTplBlock({
  shopId,
  state,
  menuOpen,
  menuPos,
  onOpenMenu,
  onPickTpl,
  onModeChange,
  onSync,
  annotationId,
}: {
  shopId: string;
  state: ShopTplState;
  menuOpen: boolean;
  menuPos: TplMenuPos | null;
  onOpenMenu: (trigger: HTMLDivElement) => void;
  onPickTpl: (id: string) => void;
  onModeChange: (mode: string) => void;
  onSync: () => void;
  annotationId?: string;
}) {
  const selectedTpl = productTemplates.find((t) => t.id === state.tplId);
  const remainSlots = selectedTpl ? MAX_TEMPLATE_SLOTS - selectedTpl.relModelProdList.length : 0;

  return (
    <div className="mpb-tpl" data-annotation-id={annotationId}>
      <div className="mpb-tpl-field">
        <span className="mpb-tpl-label">产品模板</span>
        <div className="mpb-tpl-main">
          <div className="mpb-tpl-line">
            <div className="mpb-dropdown" onClick={(e) => onOpenMenu(e.currentTarget)}>
          <span className={selectedTpl ? 'mpb-dropdown-value' : 'mpb-dropdown-ph'} title={selectedTpl?.modelName}>
            {selectedTpl ? `展示位剩余${remainSlots}` : '请选择产品模板'}
          </span>
          <img className="mpb-chev" src={icChevron} alt="" />
          {menuOpen && menuPos && (
            <div className="mpb-menu mpb-menu--fixed" style={menuPos} onClick={(e) => e.stopPropagation()}>
              {productTemplates.map((tpl) => (
                <div
                  key={tpl.id}
                  className={'mpb-menu-item' + (tpl.id === state.tplId ? ' is-active' : '')}
                  title={tpl.modelName}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPickTpl(tpl.id);
                  }}
                >
                  {`展示位剩余${MAX_TEMPLATE_SLOTS - tpl.relModelProdList.length}`}
                </div>
              ))}
            </div>
          )}
            </div>
            <button type="button" className="mpb-sync-btn" onClick={onSync}>
              同步
            </button>
          </div>
          {selectedTpl && (
            <div className={'mpb-tpl-slots' + (remainSlots <= 0 ? ' is-exhausted' : '')}>
              剩余展示位：{remainSlots}（最多{MAX_TEMPLATE_SLOTS}个展示位）
            </div>
          )}
        </div>
      </div>
      {selectedTpl && (
        <div className="mpb-radio-group">
          {tplSyncModes.map((mode) => {
            const addDisabled = mode.id === 'add' && remainSlots <= 0;
            return (
              <label key={mode.id} className={'mpb-radio' + (addDisabled ? ' is-disabled' : '')}>
                <input
                  type="radio"
                  name={'productTplMode-' + shopId}
                  disabled={addDisabled}
                  checked={state.mode === mode.id}
                  onChange={() => onModeChange(mode.id)}
                />
                <span className="mpb-radio-mask" />
                <span>{mode.label}</span>
                {addDisabled && <span className="mpb-opt-warn">（展示位已满）</span>}
              </label>
            );
          })}
        </div>
      )}
      {selectedTpl && state.mode && <div className="mpb-tpl-hint">{tplSyncModes.find((m) => m.id === state.mode)?.hint}</div>}
    </div>
  );
}

function Checkbox({ checked }: { checked?: boolean }) {
  return <span className={'mpb-checkbox' + (checked ? ' is-checked' : '')} />;
}

function SelectBox({ placeholder, value, width }: { placeholder?: string; value?: string; width: number }) {
  return (
    <div className="mpb-input mpb-select" style={{ width }}>
      {value ? <span className="mpb-input-text">{value}</span> : <span className="mpb-input-ph">{placeholder}</span>}
      <img className="mpb-chev" src={icChevron} alt="" />
    </div>
  );
}

function DateRange({ width }: { width: number }) {
  return (
    <div className="mpb-range" style={{ width }}>
      <div className="mpb-input mpb-date" style={{ flex: 1 }}>
        <img className="mpb-cal" src={icCalendar} alt="" />
        <span className="mpb-input-ph">开始日期</span>
      </div>
      <span className="mpb-range-to">至</span>
      <div className="mpb-input mpb-date mpb-date-end" style={{ flex: 1 }}>
        <span className="mpb-input-ph">结束日期</span>
      </div>
    </div>
  );
}

function PriceInput({ width }: { width: number }) {
  return (
    <div className="mpb-input mpb-price" style={{ width }}>
      <img className="mpb-stepper" src={icStepper} alt="" />
    </div>
  );
}

function TopBar() {
  return (
    <header className="mpb-topbar">
      <div className="mpb-logo-area">
        <img className="mpb-logo" src={logoImg} alt="骆驼队长" />
        <span className="mpb-logo-subtitle">智慧运营中台</span>
      </div>
      <span className="mpb-brand-divider" />
      <nav className="mpb-nav">
        {NAV_ITEMS.map((item) => (
          <a key={item} className={'mpb-nav-item' + (item === '商品' ? ' is-active' : '')} href="#">
            {item}
          </a>
        ))}
      </nav>
      <div className="mpb-topbar-right">
        <img className="mpb-tool-icon" src={icSun} alt="切换主题" />
        <img className="mpb-tool-icon" src={icMenu} alt="菜单" />
        <img className="mpb-tool-icon" src={icHelp} alt="帮助" />
        <span className="mpb-vip">
          <img src={icCrown} alt="" />
          VIP3
        </span>
        <span className="mpb-avatar">C</span>
        <img className="mpb-caret" src={icCaret} alt="" />
      </div>
    </header>
  );
}

function TabBand() {
  return (
    <div className="mpb-tabs">
      <span className="mpb-tab">商品采集</span>
      <span className="mpb-tab">认领中心</span>
      <span className="mpb-tab is-active">
        <span className="mpb-tab-dot" />
        我的商品
      </span>
    </div>
  );
}

const SEARCH_TYPES = ['类目名称'];

const CATEGORY_PATHS = [
  ['箱包及箱包辅料', '时装包', '单肩包'],
  ['箱包及箱包辅料', '时装包', '斜挎包'],
  ['箱包及箱包辅料', '时装包', '手提包'],
  ['箱包及箱包辅料', '箱包配件', '钥匙包'],
  ['箱包及箱包辅料', '箱包配件', '卡包'],
  ['鞋', '男鞋', '休闲鞋'],
  ['鞋', '男鞋', '正装鞋'],
  ['鞋', '女鞋', '凉鞋'],
  ['服配', '帽子', '棒球帽'],
  ['服配', '帽子', '渔夫帽'],
];

const CATEGORY_SEP = ' < ';

type CatNode = { label: string; children?: CatNode[] };

const CATEGORY_TREE: CatNode[] = CATEGORY_PATHS.reduce((roots: CatNode[], path) => {
  let level = roots;
  path.forEach((label) => {
    let node = level.find((item) => item.label === label);
    if (!node) {
      node = { label, children: [] };
      level.push(node);
    }
    level = node.children as CatNode[];
  });
  return roots;
}, []);

function collectLeaves(nodes: CatNode[], prefix: string[] = []): string[][] {
  return nodes.flatMap((node) => {
    const path = [...prefix, node.label];
    return node.children && node.children.length ? collectLeaves(node.children, path) : [path];
  });
}

const CATEGORY_LEAVES = collectLeaves(CATEGORY_TREE);

function ElCheckbox({ checked, indeterminate }: { checked?: boolean; indeterminate?: boolean }) {
  const cls =
    'el-checkbox__input' +
    (checked ? ' is-checked' : '') +
    (indeterminate && !checked ? ' is-indeterminate' : '');
  return (
    <label className="el-checkbox">
      <span className={cls}>
        <span className="el-checkbox__inner" />
      </span>
    </label>
  );
}

function HighlightWord({ text, word }: { text: string; word: string }) {
  if (!word) return <>{text}</>;
  const parts = text.split(word);
  return (
    <>
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          {part}
          {i < parts.length - 1 && <em>{word}</em>}
        </React.Fragment>
      ))}
    </>
  );
}

function CategoryCascader() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string[]>([]);
  const [hover, setHover] = useState(false);
  const [value, setValue] = useState<string[][]>([]);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', onDocDown);
    return () => document.removeEventListener('mousedown', onDocDown);
  }, []);

  const checkedKeys = new Set(value.map((path) => path.join(CATEGORY_SEP)));
  const word = query.trim();
  const matches = word ? CATEGORY_LEAVES.filter((path) => path.some((seg) => seg.includes(word))) : [];

  const togglePath = (path: string[]) => {
    const key = path.join(CATEGORY_SEP);
    setValue((prev) => {
      const k = new Set(prev.map((p) => p.join(CATEGORY_SEP)));
      return k.has(key) ? prev.filter((p) => p.join(CATEGORY_SEP) !== key) : [...prev, path];
    });
  };

  const columns: CatNode[][] = [CATEGORY_TREE];
  expanded.forEach((label, i) => {
    const node = columns[i].find((item) => item.label === label);
    if (node?.children?.length) columns.push(node.children);
  });

  return (
    <div
      className={'el-cascader el-cascader--small' + (open ? ' is-focus' : '')}
      style={{ width: 213, maxWidth: '100%' }}
      data-annotation-id="category-search-input"
      ref={rootRef}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => setOpen(true)}
    >
      <div className="el-input el-input--small el-input--suffix">
        <span className="el-cascader__tags">
          {value.slice(0, 1).map((path) => {
            const key = path.join(CATEGORY_SEP);
            return (
              <span className="el-tag el-tag--info el-tag--small el-tag--light" key={key} title={key}>
                <span className="el-select__tags-text">{key}</span>
                <i
                  className="el-tag__close el-icon-close"
                  onClick={(e) => {
                    e.stopPropagation();
                    setValue((prev) => prev.filter((p) => p.join(CATEGORY_SEP) !== key));
                  }}
                >
                  ×
                </i>
              </span>
            );
          })}
          {value.length > 1 && (
            <span
              className="el-tag el-tag--info el-tag--small el-tag--light is-hit"
              title={value.slice(1).map((p) => p.join(CATEGORY_SEP)).join('、')}
            >
              <span className="el-select__tags-text">+ {value.length - 1}</span>
              <i
                className="el-tag__close el-icon-close"
                onClick={(e) => {
                  e.stopPropagation();
                  setValue((prev) => prev.slice(0, 1).concat(prev.slice(2)));
                }}
              >
                ×
              </i>
            </span>
          )}
          <input
            className="el-input__inner el-cascader__search-input"
            value={query}
            placeholder={value.length ? '' : '双击可批量搜索'}
            onClick={(e) => e.stopPropagation()}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' && !query && value.length) setValue((prev) => prev.slice(0, -1));
            }}
          />
        </span>
        <span className="el-input__suffix">
          <span className="el-input__suffix-inner">
            {hover && value.length > 0 ? (
              <i
                className="el-input__icon el-input__clear el-icon-circle-close"
                onClick={(e) => {
                  e.stopPropagation();
                  setValue([]);
                }}
              />
            ) : (
              <i className="el-input__icon el-icon-arrow-up">
                <img src={icChevron} alt="" />
              </i>
            )}
          </span>
        </span>
      </div>
      {open && (
        <div className="el-cascader__dropdown" onClick={(e) => e.stopPropagation()}>
          {word ? (
            <div className="el-cascader-panel is-searchable">
              {matches.length > 0 ? (
                <ul className="el-cascader__suggestion-list">
                  {matches.map((path) => {
                    const key = path.join(CATEGORY_SEP);
                    const checked = checkedKeys.has(key);
                    return (
                      <li
                        key={key}
                        className={'el-cascader__suggestion-item' + (checked ? ' is-checked' : '')}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => togglePath(path)}
                      >
                        <span>
                          <HighlightWord text={key} word={word} />
                        </span>
                        <ElCheckbox checked={checked} />
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="el-cascader-menu__empty-text">无匹配数据</p>
              )}
            </div>
          ) : (
            <div className="el-cascader-panel">
              {columns.map((nodes, depth) => (
                <div className="el-cascader-menu" key={depth}>
                  <ul className="el-cascader-menu__list">
                    {nodes.map((node) => {
                      const isLeaf = !node.children?.length;
                      const path = [...expanded.slice(0, depth), node.label];
                      const leaves = isLeaf ? [path] : collectLeaves(node.children!, path);
                      const keys = leaves.map((p) => p.join(CATEGORY_SEP));
                      const hit = keys.filter((k) => checkedKeys.has(k)).length;
                      const checked = isLeaf ? hit === 1 : hit === leaves.length;
                      const indeterminate = !isLeaf && hit > 0 && hit < leaves.length;
                      const inPath = expanded[depth] === node.label;
                      return (
                        <li
                          key={node.label}
                          role="menuitem"
                          className={
                            'el-cascader-node is-selectable' +
                            (isLeaf ? '' : ' has-child') +
                            (checked ? ' is-checked' : '') +
                            (inPath ? ' in-active-path' : '')
                          }
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            if (isLeaf) {
                              togglePath(path);
                            } else {
                              setExpanded((prev) => [...prev.slice(0, depth), node.label]);
                            }
                          }}
                        >
                          <span
                            className="el-cascader-node__check"
                            onClick={(e) => {
                              if (isLeaf) return;
                              e.stopPropagation();
                              const keySet = new Set(keys);
                              setValue((prev) =>
                                hit === leaves.length
                                  ? prev.filter((p) => !keySet.has(p.join(CATEGORY_SEP)))
                                  : [...prev.filter((p) => !keySet.has(p.join(CATEGORY_SEP))), ...leaves],
                              );
                            }}
                          >
                            <ElCheckbox checked={checked} indeterminate={indeterminate} />
                          </span>
                          <span className="el-cascader-node__label">{node.label}</span>
                          {!isLeaf && (
                            <span className="el-cascader-node__postfix">
                              <i className="el-icon-arrow-right">›</i>
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function KeywordFilter() {
  const [type] = useState('类目名称');
  const [typeOpen, setTypeOpen] = useState(false);

  useEffect(() => {
    if (!typeOpen) return;
    const close = () => setTypeOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [typeOpen]);

  return (
    <>
      <div
        className="mpb-input mpb-select"
        style={{ width: 100 }}
        onClick={(e) => {
          e.stopPropagation();
          setTypeOpen((open) => !open);
        }}
      >
        <span className="mpb-input-text">{type}</span>
        <img className="mpb-chev" src={icChevron} alt="" />
        {typeOpen && (
          <div className="mpb-menu" onClick={(e) => e.stopPropagation()}>
            {SEARCH_TYPES.map((item) => (
              <div key={item} className={'mpb-menu-item is-active'}>
                {item}
              </div>
            ))}
          </div>
        )}
      </div>
      <CategoryCascader />
    </>
  );
}

function Filters() {
  return (
    <div className="mpb-filters">
      <div className="mpb-filter-row">
        <KeywordFilter />
        <span className="mpb-label">价格</span>
        <PriceInput width={141} />
        <span className="mpb-range-dash">-</span>
        <PriceInput width={141} />
        <span className="mpb-label">采集平台</span>
        <div className="mpb-input mpb-select mpb-platform" style={{ width: 196 }}>
          <img className="mpb-platform-icon" src={collectIcon} alt="" />
          <span className="mpb-input-ph">请选择采集平台</span>
          <img className="mpb-chev" src={icChevron} alt="" />
        </div>
        <span className="mpb-label">刊登时间</span>
        <DateRange width={348} />
        <span className="mpb-label">认领时间</span>
        <DateRange width={348} />
      </div>
      <div className="mpb-filter-row">
        <span className="mpb-label">修改时间</span>
        <DateRange width={360} />
        <span className="mpb-label">标签</span>
        <SelectBox placeholder="请选择标签" width={180} />
        <span className="mpb-label">店铺</span>
        <SelectBox placeholder="请选择店铺" width={180} />
        <button type="button" className="mpb-btn mpb-btn-primary">搜索</button>
        <button type="button" className="mpb-btn">重置</button>
        <button type="button" className="mpb-btn mpb-btn-blue-outline">创建新产品</button>
        <button type="button" className="mpb-btn">排序</button>
        <span className="mpb-filter-spacer" />
        <button type="button" className="mpb-btn">导出</button>
        <button type="button" className="mpb-btn">导入货源</button>
        <button type="button" className="mpb-btn">同步线上</button>
        <img className="mpb-gear" src={icGear} alt="列设置" />
      </div>
    </div>
  );
}

function SideStats() {
  return (
    <aside className="mpb-side">
      {SIDE_GROUPS.map((group) => (
        <div key={group.title} className="mpb-side-group">
          <div className="mpb-side-title">
            <span>{group.title}</span>
            {group.title === '商品概览' && <img className="mpb-side-refresh" src={icRefresh} alt="刷新" />}
          </div>
          {group.items.map((item) => (
            <div key={item.label} className={'mpb-side-item' + (item.active ? ' is-active' : '')}>
              <span>{item.label}</span>
              <span className="mpb-side-num">{item.count}</span>
            </div>
          ))}
        </div>
      ))}
    </aside>
  );
}

function ProductTable({ onOpenTplDialog }: { onOpenTplDialog: () => void }) {
  return (
    <div className="mpb-table">
      <div className="mpb-thead">
        <span className="mpb-col-check">
          <Checkbox checked />
        </span>
        <span className="mpb-col-img">图片</span>
        <span className="mpb-col-info">商品信息</span>
        <span className="mpb-col-code">产品编号</span>
        <span className="mpb-col-price">售价</span>
        <span className="mpb-col-tag">标签</span>
        <span className="mpb-col-time">时间/版本</span>
        <span className="mpb-col-source">来源</span>
        <div className="mpb-cross-select">
          <Checkbox />
          <span className="mpb-cross-label">跨页全选 2741 项</span>
          <span className="mpb-cross-clear">取消选中</span>
        </div>
      </div>
      <div className="mpb-tbody">
      {ROWS.map((row, index) => (
        <div key={index} className="mpb-tr">
          <span className="mpb-col-check">
            <Checkbox checked />
          </span>
          <span className="mpb-col-img">
            <img className="mpb-thumb" src={row.thumb} alt="" />
          </span>
          <span className="mpb-col-info">
            <a className="mpb-title" href={row.url} target="_blank" rel="noreferrer noopener">
              {row.title}
            </a>
            <span className="mpb-meta">
              <span className="mpb-cat">{row.category}</span>
              <span className="mpb-meta-right">
                <span className="mpb-pill mpb-pill-online">{row.status}</span>
                <span className="mpb-store">
                  <img className="mpb-store-icon" src={dhIcon} alt="" />
                  <span>{row.store}</span>
                </span>
              </span>
            </span>
          </span>
          <span className="mpb-col-code">
            <span className="mpb-code">{row.code}</span>
          </span>
          <span className="mpb-col-price">
            <span className="mpb-money">{row.price}</span>
          </span>
          <span className="mpb-col-tag" />
          <span className="mpb-col-time">
            <span className="mpb-times">
              <div>认领：{row.claimAt}</div>
              <div>修改：{row.modifyAt}</div>
              <div>刊登：{row.publishAt}</div>
              <div>认领版本号：{row.claimVersion}</div>
              <div>当前版本号：{row.currentVersion}</div>
            </span>
          </span>
          <span className="mpb-col-source">
            <a className="mpb-source-link" href="#">-</a>
          </span>
        </div>
      ))}
      </div>
      <div className="mpb-table-footer">
        <div className="mpb-footer-actions">
          <span className="mpb-selected">已选 10 项</span>
          {BATCH_ACTIONS.map((action) => (
            <button
              key={action}
              type="button"
              className="mpb-btn mpb-btn-mini"
              data-annotation-id={action === '批量关联产品模板' ? 'batch-rel-tpl-btn' : undefined}
              onClick={() => action === '批量关联产品模板' && onOpenTplDialog()}
            >
              {action}
            </button>
          ))}
        </div>
        <div className="mpb-pagination">
          <span className="mpb-total">共 2741 条</span>
          <SelectBox value="10条/页" width={100} />
          <span className="mpb-page-btn is-disabled">
            <img src={icChevLeft} alt="上一页" />
          </span>
          {['1', '2', '3', '4', '5', '6'].map((page) => (
            <span key={page} className={'mpb-page-btn' + (page === '1' ? ' is-active' : '')}>
              {page}
            </span>
          ))}
          <span className="mpb-page-btn is-ellipsis">...</span>
          <span className="mpb-page-btn">275</span>
          <span className="mpb-page-btn">
            <img src={icChevRight} alt="下一页" />
          </span>
          <span className="mpb-jump">前往</span>
          <div className="mpb-input mpb-jump-input">
            <span className="mpb-input-text">1</span>
          </div>
          <span className="mpb-jump">页</span>
        </div>
      </div>
    </div>
  );
}

export default function MyProductsBatchRelatedTemplate() {
  const [tplDialogOpen, setTplDialogOpen] = useState(false);
  const [tplByShop, setTplByShop] = useState<Record<string, ShopTplState>>({});
  const [tplMenuFor, setTplMenuFor] = useState('');
  const [tplMenuPos, setTplMenuPos] = useState<TplMenuPos | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 2000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const closeTplMenu = () => {
    setTplMenuFor('');
    setTplMenuPos(null);
  };

  const patchShopTpl = (shopId: string, patch: Partial<ShopTplState>) => {
    setTplByShop((prev) => ({ ...prev, [shopId]: { ...(prev[shopId] ?? defaultShopTpl), ...patch } }));
  };

  const openTplMenu = (shopId: string, trigger: HTMLDivElement) => {
    if (tplMenuFor === shopId) {
      closeTplMenu();
      return;
    }
    const rect = trigger.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < 240 && rect.top > spaceBelow;
    setTplMenuPos({
      left: rect.left,
      minWidth: rect.width,
      maxWidth: Math.min(480, window.innerWidth - rect.left - 24),
      ...(openUp ? { bottom: window.innerHeight - rect.top + 4 } : { top: rect.bottom + 4 }),
    });
    setTplMenuFor(shopId);
  };

  useEffect(() => {
    if (!tplMenuFor) return;
    const close = () => closeTplMenu();
    window.addEventListener('scroll', close, true);
    return () => window.removeEventListener('scroll', close, true);
  }, [tplMenuFor]);
  return (
    <>
      <div className="mpb-page">
        <TopBar />
        <div className="mpb-crumb">
          <span>商品</span>
          <i>/</i>
          <span>商品管理</span>
          <i>/</i>
          <span className="is-current">我的商品</span>
        </div>
        <div className="mpb-card">
          <TabBand />
          <Filters />
          <div className="mpb-body">
            <SideStats />
            <ProductTable onOpenTplDialog={() => setTplDialogOpen(true)} />
          </div>
        </div>
        <div className="mpb-contact">
          <img src={icHeadset} alt="" />
          <span>联系我们</span>
        </div>
        <div className="mpb-scroll">
          <button type="button" aria-label="向上滚动">
            <img src={icArrowUp} alt="" />
          </button>
          <button type="button" aria-label="向下滚动">
            <img src={icArrowDown} alt="" />
          </button>
        </div>
      </div>
      {tplDialogOpen && (
        <div className="mpb-mask" onClick={() => setTplDialogOpen(false)}>
          <div
            className="mpb-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="批量关联产品模板"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mpb-dialog-head">
              <span className="mpb-dialog-title">批量关联产品模板</span>
              <button type="button" className="mpb-dialog-close" aria-label="关闭" onClick={() => setTplDialogOpen(false)}>
                ×
              </button>
            </div>
            <div className="mpb-dialog-body">
              {tplShops.map((shop, index) => {
                const st = tplByShop[shop.id] ?? defaultShopTpl;
                return (
                  <div className="mpb-tpl-row" key={shop.id}>
                    <span className="mpb-tpl-shop" title={shop.name}>{shop.name}</span>
                    <ProductTplBlock
                      shopId={shop.id}
                      state={st}
                      menuOpen={tplMenuFor === shop.id}
                      menuPos={tplMenuFor === shop.id ? tplMenuPos : null}
                      onOpenMenu={(trigger) => openTplMenu(shop.id, trigger)}
                      onPickTpl={(id) => {
                        patchShopTpl(shop.id, { tplId: id });
                        closeTplMenu();
                      }}
                      onModeChange={(mode) => patchShopTpl(shop.id, { mode })}
                      onSync={() => setToast('同步成功')}
                      annotationId={index === 0 ? 'basic-product-template-row' : undefined}
                    />
                  </div>
                );
              })}
            </div>
            <div className="mpb-dialog-foot">
              <button type="button" className="mpb-btn" onClick={() => setTplDialogOpen(false)}>取消</button>
              <button type="button" className="mpb-btn mpb-btn-primary" onClick={() => setTplDialogOpen(false)}>确定</button>
            </div>
          </div>
        </div>
      )}
      {toast && <div className="mpb-toast">{toast}</div>}
      <AnnotationViewer
        source={annotationSourceDocument as unknown as AnnotationSourceDocument}
        options={{
          currentPageId: (() => {
            const hashPageId = new URLSearchParams(window.location.hash.replace(/^#/, '')).get('page');
            const searchPageId = new URLSearchParams(window.location.search.replace(/^\?/, '')).get('page');
            const pageId = hashPageId || searchPageId;
            return typeof pageId === 'string' && /^[a-z0-9-]+$/u.test(pageId)
              ? pageId
              : 'my-products-batch-related-template';
          })(),
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
    </>
  );
}
