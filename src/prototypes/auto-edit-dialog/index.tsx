/**
 * @name 自动编辑弹窗 - 骆驼队长BI
 */

import React, { useState } from 'react';
import './style.css';

// ===== Icons =====
const FileIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="13" y2="17" />
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const GearIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const ChevronDown = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const CheckCircle = ({ color = '#ff781f' }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={color}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="9 12 11 14 15 10" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ShopIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 3h18v4H3zM5 7v14h14V7M9 11h6v6H9z" />
  </svg>
);

// Menu icons
const MenuDoc = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);
const MenuUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const MenuTag = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);
const MenuList = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);
const MenuGrid = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);
const MenuBox = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
  </svg>
);
const MenuPkg = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="21 8 21 21 3 21 3 8" />
    <rect x="1" y="3" width="22" height="5" />
    <line x1="10" y1="12" x2="14" y2="12" />
  </svg>
);
const MenuImg = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);
const MenuTrans = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 8h14" />
    <path d="M5 8c0 6 5 10 7 10" />
    <path d="M19 8c0 6-5 10-7 10" />
    <path d="M9 3l-3 5" />
    <path d="M15 3l3 5" />
  </svg>
);
const MenuLink = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);
const MenuHome = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

// ===== Data =====
type MenuItem = {
  id: string;
  label: string;
  count: number;
  icon: React.ReactNode;
  done?: boolean;
};

const MenuAttr = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
  </svg>
);

const menuItems: MenuItem[] = [
  { id: 'basic', label: '商品基本信息', count: 7, icon: <MenuHome /> },
  { id: 'detail', label: '详情页面', count: 1, icon: <MenuDoc /> },
  { id: 'attr', label: '属性', count: 1, icon: <MenuAttr /> },
  { id: 'service', label: '服务', count: 3, icon: <MenuUser /> },
  { id: 'price', label: '商品价格', count: 2, icon: <MenuTag /> },
  { id: 'sale', label: '销售方案', count: 1, icon: <MenuList /> },
  { id: 'sku', label: 'SKU信息', count: 5, icon: <MenuGrid /> },
  { id: 'stock', label: '备货信息', count: 1, icon: <MenuBox /> },
  { id: 'custom', label: '定制商品', count: 1, icon: <MenuDoc /> },
  { id: 'pack', label: '包装物流', count: 1, icon: <MenuPkg /> },
  { id: 'image', label: '图片视频', count: 5, icon: <MenuImg /> },
  { id: 'trans', label: '翻译', count: 1, icon: <MenuTrans />, done: true },
  { id: 'source', label: '货源信息', count: 1, icon: <MenuLink /> },
];

// ===== Row component =====
function FormRow({ label, checked, onCheck, children, last }: {
  label: string;
  checked: boolean;
  onCheck: () => void;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className={`ae-row${last ? ' ae-row-last' : ''}`}>
      <div className="ae-row-label">
        <label className="ae-checkbox">
          <input type="checkbox" checked={checked} onChange={onCheck} />
          <span className="ae-checkbox-mask" />
        </label>
        <span className="ae-row-label-text">{label}</span>
      </div>
      <div className="ae-row-body">{children}</div>
    </div>
  );
}

// ===== Main =====
export default function AutoEditDialog() {
  const [activeMenu, setActiveMenu] = useState('image');
  const [checkedRows, setCheckedRows] = useState<Record<string, boolean>>({
    promo: false,
    removeSku: false,
    video: false,
    whiteBg: false,
    limit: true,
  });
  const [promoImg, setPromoImg] = useState('');
  const [videoOp, setVideoOp] = useState('');
  const [whiteBg, setWhiteBg] = useState('');
  const [limitYes, setLimitYes] = useState(true);

  const toggleRow = (key: string) =>
    setCheckedRows((s) => ({ ...s, [key]: !s[key] }));

  return (
    <div className="ae-overlay">
      <div className="ae-modal" data-annotation-id="auto-edit-modal">
        {/* Header */}
        <div className="ae-header" data-annotation-id="header">
          <div className="ae-header-left">
            <div className="ae-header-icon"><FileIcon /></div>
            <div className="ae-header-text">
              <div className="ae-header-title">自动编辑</div>
              <div className="ae-header-sub">【全新正品未拆封】i17Pro max灵动岛16+1TB内存全网通5G智 等 10 个商品</div>
            </div>
          </div>
          <div className="ae-header-right">
            <span className="ae-tag-plain">敦煌网</span>
            <span className="ae-tag-shop"><ShopIcon /> 1 店铺</span>
            <button className="ae-close" type="button"><CloseIcon /></button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="ae-toolbar" data-annotation-id="toolbar">
          <div className="ae-select">
            <span className="ae-select-placeholder">选择已有模板快速套用</span>
            <ChevronDown />
          </div>
          <button className="ae-btn-primary" type="button"><PlusIcon /> 创建模板</button>
          <button className="ae-btn-primary" type="button"><GearIcon /> 管理模板</button>
        </div>

        {/* Body */}
        <div className="ae-body">
          <div className="ae-sidebar" data-annotation-id="sidebar">
            <div className="ae-menu">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className={`ae-menu-item${activeMenu === item.id ? ' active' : ''}`}
                  onClick={() => setActiveMenu(item.id)}
                >
                  <span className="ae-menu-icon">
                    {item.done && activeMenu !== item.id ? <CheckCircle /> : item.icon}
                  </span>
                  <span className="ae-menu-label">{item.label}</span>
                  <span className="ae-menu-count">{item.count}</span>
                </div>
              ))}
            </div>
            <div className="ae-sidebar-footer">
              已编辑 <strong>2/13</strong>
            </div>
          </div>

          <div className="ae-content" data-annotation-id="content">
            {/* 推广图 */}
            <FormRow label="推广图" checked={checkedRows.promo} onCheck={() => toggleRow('promo')}>
              <div className="ae-radio-group">
                {['第一张', '随机一张', '上传一张图片'].map((opt) => (
                  <label key={opt} className="ae-radio">
                    <input type="radio" name="promo" checked={promoImg === opt} onChange={() => setPromoImg(opt)} />
                    <span className="ae-radio-mask" />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </FormRow>

            {/* 移除sku图片 */}
            <FormRow label="移除sku图片" checked={checkedRows.removeSku} onCheck={() => toggleRow('removeSku')}>
              <span className="ae-hint">系统自动替换无需操作，请直接点击确认</span>
            </FormRow>

            {/* 视频 */}
            <FormRow label="视频" checked={checkedRows.video} onCheck={() => toggleRow('video')}>
              <div className="ae-radio-group">
                {['上传视频', '删除视频'].map((opt) => (
                  <label key={opt} className="ae-radio">
                    <input type="radio" name="video" checked={videoOp === opt} onChange={() => setVideoOp(opt)} />
                    <span className="ae-radio-mask" />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </FormRow>

            {/* 推广图变白底图 */}
            <FormRow label="推广图变白底图" checked={checkedRows.whiteBg} onCheck={() => toggleRow('whiteBg')}>
              <div className="ae-radio-group">
                {['免费', 'AI付费'].map((opt) => (
                  <label key={opt} className="ae-radio">
                    <input type="radio" name="whiteBg" checked={whiteBg === opt} onChange={() => setWhiteBg(opt)} />
                    <span className="ae-radio-mask" />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
              <div className="ae-hint sub">提示：预览或预览时将扣除1次费用</div>
            </FormRow>

            {/* 图片数量限制 */}
            <FormRow label="图片数量限制" checked={checkedRows.limit} onCheck={() => toggleRow('limit')} last>
              <div className="ae-radio-group inline-start">
                <span className="ae-limit-text">是否限制图片最大数量</span>
                <label className="ae-radio">
                  <input type="radio" name="limit" checked={limitYes} onChange={() => setLimitYes(true)} />
                  <span className="ae-radio-mask" />
                  <span>是</span>
                </label>
                <label className="ae-radio">
                  <input type="radio" name="limit" checked={!limitYes} onChange={() => setLimitYes(false)} />
                  <span className="ae-radio-mask" />
                  <span>否</span>
                </label>
              </div>
            </FormRow>
          </div>
        </div>

        {/* Footer */}
        <div className="ae-footer" data-annotation-id="footer">
          <button className="ae-btn-cancel" type="button">取消</button>
          <button className="ae-btn-submit" type="button">提交认领</button>
        </div>
      </div>
    </div>
  );
}
