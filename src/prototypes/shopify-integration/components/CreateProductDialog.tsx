import React, { useCallback, useEffect, useRef, useState } from 'react';

import icShop from '../assets/icons/m-box.svg';
import icDoc from '../assets/icons/m-doc.svg';
import icTag from '../assets/icons/m-tag.svg';
import icEditOutline from '../assets/icons/edit-outline.svg';
import icGrid from '../assets/icons/m-grid.svg';
import icVideo from '../assets/icons/m-video.svg';
import icImageO from '../assets/icons/m-image-o.svg';
import icImage from '../assets/icons/m-image.svg';
import icTable from '../assets/icons/m-table.svg';
import icMoney from '../assets/icons/m-money.svg';
import icGem from '../assets/icons/m-gem.svg';
import icPlan from '../assets/icons/m-plan.svg';
import icHeadset from '../assets/icons/m-headset.svg';
import icWeight from '../assets/icons/m-weight.svg';
import icLink from '../assets/icons/m-link.svg';
import icClose from '../assets/icons/close.svg';
import icPlus from '../assets/icons/plus.svg';
import icMinus from '../assets/icons/minus.svg';
import icUpload from '../assets/icons/upload.svg';
import icPencil from '../assets/icons/pencil.svg';
import icQuestion from '../assets/icons/question.svg';
import icCaret from '../assets/icons/caret-bottom.svg';
import icCaretSelect from '../assets/icons/arrow-up-black.svg';
import icRefresh from '../assets/icons/refresh.svg';
import thumbProduct from '../assets/thumb-bracelet.jpg';
import detailPoster from '../assets/detail-poster.png';
import icRtCaret from '../assets/icons/rt-caret.svg';
import icRtFontColor from '../assets/icons/rt-font-color.svg';
import icRtListUl from '../assets/icons/rt-list-ul.svg';
import icRtListOl from '../assets/icons/rt-list-ol.svg';
import icRtAlign from '../assets/icons/rt-align-left.svg';
import icRtImage from '../assets/icons/rt-image.svg';
import icRtClearFormat from '../assets/icons/rt-clear-format.svg';
import icRtArrowUp from '../assets/icons/rt-arrow-up.svg';
import icRtArrowDown from '../assets/icons/rt-arrow-down.svg';

const UNITS = [
  '打',
  '英尺',
  '件',
  '套',
  '克',
  '英寸',
  '千克',
  '千米',
  '升',
  '吨',
  '米',
  '毫升',
  '盎司',
  '双',
  '磅',
  '平方码',
  '平方米',
  '平方英尺',
  '码',
  '厘米',
  '箱',
  '立方米',
];

const SHOPS = ['sneakerhub8', 'clothes', '鞋子', '包包'];

type SectionId =
  | 'shop'
  | 'info'
  | 'keyword'
  | 'shortDesc'
  | 'attribute'
  | 'video'
  | 'mainImage'
  | 'promoImage'
  | 'spec'
  | 'price'
  | 'template'
  | 'channel'
  | 'seo'
  | 'custom'
  | 'sales'
  | 'service'
  | 'weight'
  | 'source';

const MENU: { id: SectionId; label: string; icon: string; required?: boolean }[] = [
  { id: 'shop', label: '店铺/类目', icon: icShop, required: true },
  { id: 'info', label: '产品信息', icon: icDoc },
  // 关键词、短描、服务 暂不在弹窗中展示，保留代码以便后续恢复
  // { id: 'keyword', label: '关键词', icon: icTag },
  // { id: 'shortDesc', label: '短描', icon: icEditOutline, required: true },
  { id: 'attribute', label: '产品属性', icon: icGrid },
  { id: 'video', label: '视频', icon: icVideo },
  { id: 'mainImage', label: '主图', icon: icImageO },
  // 站外推广图、定制商品、销售方案 暂不在弹窗中展示，保留代码以便后续恢复
  // { id: 'promoImage', label: '站外推广图', icon: icImage, required: true },
  { id: 'spec', label: '产品规格', icon: icTable },
  { id: 'price', label: '价格 USD', icon: icMoney, required: true },
  // 模板样式暂不在弹窗中展示，保留代码以便后续恢复
  // { id: 'template', label: '模板样式', icon: icPlan },
  { id: 'channel', label: '发布渠道', icon: icPlan, required: true },
  { id: 'seo', label: 'SEO 信息', icon: icEditOutline },
  // { id: 'custom', label: '定制商品', icon: icGem, required: true },
  // { id: 'sales', label: '销售方案', icon: icPlan, required: true },
  // { id: 'service', label: '服务', icon: icHeadset },
  { id: 'weight', label: '重量/包装', icon: icWeight, required: true },
  { id: 'source', label: '货源/系统信息', icon: icLink },
];

// 模拟从 shopify 同步回来的销售/发布渠道
const PUBLISH_CHANNELS = ['Online Store', 'Point of Sale', 'Trustpilot', 'Google & YouTube'];

const PRICE_COLUMNS = [
  { key: '颜色' },
  { key: '自定义属性' },
  { key: 'SKU编码', editable: true },
  { key: '是否可售', editable: true },
  { key: '库存', editable: true },
  { key: '库存地点', editable: true, batch: true, sync: true },
  { key: '重量', editable: true },
  { key: '实际收入', editable: true },
];

const SELLABLE_OPTIONS = ['可销售', '不可销售'];

// 模拟接口返回的库存地点列表
const INVENTORY_LOCATIONS = ['默认位置', '深圳仓', '广州仓', '义乌仓', '洛杉矶仓'];

const SPEC_TYPES = ['尺码（Size type）', '颜色（Color）'];

const TEMPLATE_OPTIONS = [
  '默认产品',
  'featured（templates/product.featured.json）',
  'lookbook（templates/product.lookbook.json）',
];

function Ico({ src, className = '' }: { src: string; className?: string }) {
  return (
    <span
      className={`cpd-ico cpd-mask-icon ${className}`.trim()}
      style={{ WebkitMaskImage: `url(${src})`, maskImage: `url(${src})` }}
    />
  );
}

function Field({
  label,
  required,
  className = '',
  children,
}: {
  label?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`cpd-item ${className}`.trim()}>
      {label && (
        <label className="cpd-item__label">
          {required && <span className="cpd-req">* </span>}
          {label}
        </label>
      )}
      <div className="cpd-item__content">{children}</div>
    </div>
  );
}

function AddSpecButton() {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState({ top: 0, left: 0, width: 0 });
  const boxRef = useRef<HTMLButtonElement>(null);

  const toggle = () => {
    if (!open && boxRef.current) {
      const r = boxRef.current.getBoundingClientRect();
      setRect({ top: r.bottom + 4, left: r.left, width: r.width });
    }
    setOpen((prev) => !prev);
  };

  return (
    <>
      <button
        type="button"
        className="cpd-btn"
        ref={boxRef}
        onClick={toggle}
        data-annotation-id="cpd-spec-add-limit"
      >
        <Ico src={icPlus} />
        添加规格
        <Ico className="cpd-btn__caret" src={icCaret} />
      </button>
      {open && (
        <>
          <div className="cpd-backdrop" onClick={() => setOpen(false)} />
          <div className="cpd-dropdown" style={{ top: rect.top, left: rect.left, minWidth: rect.width }}>
            {SPEC_TYPES.map((option) => (
              <button
                key={option}
                type="button"
                className="cpd-dropdown__item"
                onClick={() => setOpen(false)}
              >
                {option}
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}

function Section({
  id,
  title,
  required,
  count,
  align,
  action,
  innerRef,
  annotationId,
  className = '',
  children,
}: {
  id: SectionId;
  title: string;
  required?: boolean;
  count?: string;
  align?: boolean;
  action?: React.ReactNode;
  innerRef: (el: HTMLDivElement | null) => void;
  annotationId?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      id={id}
      ref={innerRef}
      className={`cpd-sec${align ? ' cpd-sec--label-align' : ''}${className ? ` ${className}` : ''}`}
      {...(annotationId ? { 'data-annotation-id': annotationId } : {})}
    >
      <h3 className="cpd-sec__title">
        {required && <span className="cpd-req">*</span>}
        {title}
        {count && <span className="cpd-count">{count}</span>}
        {action}
      </h3>
      {children}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
  width,
  block,
  placeholder,
  emptyText,
}: {
  value: string;
  onChange: (next: string) => void;
  options: string[];
  width?: number;
  block?: boolean;
  placeholder?: string;
  emptyText?: string;
}) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState({ top: 0, left: 0, width: 0 });
  const boxRef = useRef<HTMLDivElement>(null);

  const toggle = () => {
    if (!open && boxRef.current) {
      const r = boxRef.current.getBoundingClientRect();
      setRect({ top: r.bottom + 4, left: r.left, width: r.width });
    }
    setOpen((prev) => !prev);
  };

  return (
    <>
      <div
        className={`cpd-select${block ? ' cpd-select--block' : ''}`}
        style={width ? { width } : undefined}
        ref={boxRef}
      >
        <input
          className="cpd-input__inner"
          readOnly
          value={value}
          placeholder={placeholder}
          onClick={toggle}
        />
        <span className="cpd-input__suffix">
          <Ico src={icCaretSelect} />
        </span>
      </div>
      {open && (
        <>
          <div className="cpd-backdrop" onClick={() => setOpen(false)} />
          <div className="cpd-dropdown" style={{ top: rect.top, left: rect.left, minWidth: rect.width }}>
            {options.length === 0 ? (
              <div className="cpd-dropdown__empty">{emptyText || '无数据'}</div>
            ) : (
              options.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`cpd-dropdown__item${option === value ? ' cpd-dropdown__item--active' : ''}`}
                  onClick={() => {
                    onChange(option);
                    setOpen(false);
                  }}
                >
                  {option}
                </button>
              ))
            )}
          </div>
        </>
      )}
    </>
  );
}

function RadioGroup({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="cpd-radio-group">
      {options.map((option) => (
        <span
          key={option}
          className={`cpd-radio${option === value ? ' cpd-radio--checked' : ''}`}
          onClick={() => onChange(option)}
        >
          <span className="cpd-radio__inner" />
          <span className="cpd-radio__label">{option}</span>
        </span>
      ))}
    </div>
  );
}

function NumberInput({
  width,
  block,
  value,
  onChange,
  min = 0,
}: {
  width?: number;
  block?: boolean;
  value: string;
  onChange: (next: string) => void;
  min?: number;
}) {
  const step = (delta: number) => {
    const current = parseFloat(value);
    const next = (Number.isNaN(current) ? 0 : current) + delta;
    onChange(String(Math.max(min, next)));
  };
  const current = parseFloat(value);
  const atMin = Number.isNaN(current) || current <= min;

  return (
    <span className={`cpd-number${block ? ' cpd-number--block' : ''}`} style={width ? { width } : undefined}>
      <span
        className={`cpd-number__btn cpd-number__btn--minus${atMin ? ' cpd-number__btn--disabled' : ''}`}
        onClick={() => !atMin && step(-1)}
      >
        <Ico src={icMinus} />
      </span>
      <span className="cpd-number__btn cpd-number__btn--plus" onClick={() => step(1)}>
        <Ico src={icPlus} />
      </span>
      <input
        className="cpd-input__inner"
        value={value}
        onChange={(event) => onChange(event.target.value.replace(/[^\d.]/g, ''))}
      />
    </span>
  );
}

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <span className={`cpd-switch${checked ? ' cpd-switch--on' : ''}`} onClick={() => onChange(!checked)}>
      <span className="cpd-switch__core" />
      <span className="cpd-switch__label">{label}</span>
    </span>
  );
}

function PrimaryButton({
  children,
  plus,
  tip,
}: {
  children: React.ReactNode;
  plus?: boolean;
  tip?: boolean;
}) {
  return (
    <button type="button" className="cpd-btn">
      {plus && <Ico src={icPlus} />}
      {children}
      {tip && <Ico className="cpd-btn__tip" src={icQuestion} />}
    </button>
  );
}

function Text({
  value,
  onChange,
  width,
  placeholder,
  count,
  className = '',
}: {
  value: string;
  onChange: (next: string) => void;
  width?: number;
  placeholder?: string;
  count?: string;
  className?: string;
}) {
  return (
    <span className={`cpd-input${className ? ' ' + className : ''}`} style={width ? { width } : undefined}>
      <input className="cpd-input__inner" value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
      {count && <span className="cpd-input__count">{count}</span>}
    </span>
  );
}

function Textarea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
}) {
  return (
    <span className="cpd-input cpd-input--block">
      <textarea
        className="cpd-textarea__inner"
        value={value}
        placeholder={placeholder}
        rows={3}
        onChange={(event) => onChange(event.target.value)}
      />
    </span>
  );
}

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <span className={`cpd-checkbox${checked ? ' cpd-checkbox--checked' : ''}`} onClick={() => onChange(!checked)}>
      <span className="cpd-checkbox__inner" />
      <span className="cpd-checkbox__label">{label}</span>
    </span>
  );
}

function toggleItem(list: string[], item: string, checked: boolean) {
  return checked ? [...list, item] : list.filter((value) => value !== item);
}

function BatchInventoryLocationDialog({
  locations,
  colorOptions,
  customOptions,
  onClose,
  onConfirm,
}: {
  locations: string[];
  colorOptions: string[];
  customOptions: string[];
  onClose: () => void;
  onConfirm: (location: string) => void;
}) {
  const [location, setLocation] = useState(locations[0] ?? '');
  const [colors, setColors] = useState(colorOptions);
  const [customs, setCustoms] = useState(customOptions);

  return (
    <div
      className="cpd-batch"
      role="dialog"
      aria-modal="true"
      aria-label="批量修改库存地点"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="cpd-batch__panel">
        <div className="cpd-batch__header">
          <h3 className="cpd-batch__title">批量修改库存地点</h3>
          <button type="button" className="cpd-batch__close" aria-label="关闭" onClick={onClose}>
            <Ico src={icClose} />
          </button>
        </div>
        <div className="cpd-batch__body">
          <div className="cpd-batch__group">
            <div className="cpd-batch__label">请选择</div>
            <div className="cpd-batch__card">
              <Select value={location} onChange={setLocation} options={locations} block placeholder="请选择" />
            </div>
          </div>
          <div className="cpd-batch__group">
            <div className="cpd-batch__label">颜色</div>
            <div className="cpd-batch__card">
              {colorOptions.map((color) => (
                <Checkbox
                  key={color}
                  label={color}
                  checked={colors.includes(color)}
                  onChange={(checked) => setColors((prev) => toggleItem(prev, color, checked))}
                />
              ))}
            </div>
          </div>
          <div className="cpd-batch__group">
            <div className="cpd-batch__label">自定义属性</div>
            <div className="cpd-batch__card">
              {customOptions.map((custom) => (
                <Checkbox
                  key={custom}
                  label={custom}
                  checked={customs.includes(custom)}
                  onChange={(checked) => setCustoms((prev) => toggleItem(prev, custom, checked))}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="cpd-batch__footer">
          <button type="button" className="cpd-footer__btn" onClick={onClose}>
            取消
          </button>
          <button
            type="button"
            className="cpd-footer__btn cpd-footer__btn--primary"
            onClick={() => onConfirm(location)}
          >
            确认修改
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CreateProductDialog({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<'basic' | 'detail'>('basic');
  const [active, setActive] = useState<SectionId>('shop');
  const paneRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<Partial<Record<SectionId, HTMLDivElement | null>>>({});

  const [shop, setShop] = useState('');
  const [title, setTitle] = useState('');
  const [videoName, setVideoName] = useState('');
  const [videoDesc, setVideoDesc] = useState('');
  const [isCustom, setIsCustom] = useState('否');
  const [unit, setUnit] = useState('');
  const [sellMode, setSellMode] = useState('按件卖');
  const [stockStatus, setStockStatus] = useState('待备货');
  const [maxBuy, setMaxBuy] = useState('');
  const [leadTime, setLeadTime] = useState('');
  const [priceTier, setPriceTier] = useState('');
  const [validity, setValidity] = useState('');
  const [grading, setGrading] = useState('');
  const [group, setGroup] = useState('');
  const [freight, setFreight] = useState('');
  const [afterSale, setAfterSale] = useState('');
  const [sizeChart, setSizeChart] = useState('');
  const [weightValue, setWeightValue] = useState('');
  const [templateSuffix, setTemplateSuffix] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');
  const [seoUrl, setSeoUrl] = useState('');
  const [publishChannel, setPublishChannel] = useState('');
  const [volume, setVolume] = useState(['', '', '']);
  const [parentSku, setParentSku] = useState('');

  const [variant, setVariant] = useState({
    sku: '6a0ce1-1-856901637685',
    sellable: '可销售',
    stock: '666',
    location: INVENTORY_LOCATIONS[0],
    weight: '0.05',
    revenue: '55.26',
  });
  const [batchOpen, setBatchOpen] = useState(false);
  const [toast, setToast] = useState('');
  const toastTimer = useRef<number | undefined>(undefined);

  const showToast = (message: string) => {
    window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(''), 2000);
  };

  const setVariantField = (key: keyof typeof variant, value: string) =>
    setVariant((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (batchOpen) {
        setBatchOpen(false);
        return;
      }
      onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, batchOpen]);

  const registerSection = useCallback(
    (id: SectionId) => (el: HTMLDivElement | null) => {
      sectionsRef.current[id] = el;
    },
    [],
  );

  const jump = (id: SectionId) => {
    const el = sectionsRef.current[id];
    const pane = paneRef.current;
    if (!el || !pane) return;
    pane.scrollTo({ top: el.offsetTop - 12, behavior: 'smooth' });
    setActive(id);
  };

  const onPaneScroll = () => {
    const pane = paneRef.current;
    if (!pane) return;
    const line = pane.scrollTop + 90;
    let current: SectionId = 'shop';
    MENU.forEach((item) => {
      const el = sectionsRef.current[item.id];
      if (el && el.offsetTop <= line) current = item.id;
    });
    setActive(current);
  };

  return (
    <div className="cpd-overlay" onClick={onClose}>
      <div className="cpd-dialog" role="dialog" aria-modal="true" aria-label="创建新产品" onClick={(event) => event.stopPropagation()}>
        <div className="cpd-header">
          <h2 className="cpd-header__title" data-annotation-id="cpd-header-title">创建新产品</h2>
          <button type="button" className="cpd-header__close" aria-label="关闭" onClick={onClose}>
            <Ico src={icClose} />
          </button>
        </div>

        <div className="cpd-body">
          <div className="cpd-topbar">
            <button
              type="button"
              className={`cpd-topbar__tab${tab === 'basic' ? ' cpd-topbar__tab--active' : ''}`}
              onClick={() => setTab('basic')}
            >
              基本
            </button>
            <span className="cpd-topbar__sep">|</span>
            <button
              type="button"
              className={`cpd-topbar__tab${tab === 'detail' ? ' cpd-topbar__tab--active' : ''}`}
              onClick={() => setTab('detail')}
            >
              详情
            </button>
          </div>

          <div className="cpd-main">
            {tab === 'basic' && (
              <div className="cpd-side">
                <ul className="cpd-menu">
                  {MENU.map((item) => (
                    <li
                      key={item.id}
                      className={`cpd-menu__item${active === item.id ? ' cpd-menu__item--active' : ''}`}
                      onClick={() => jump(item.id)}
                    >
                      <Ico src={item.icon} />
                      {item.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="cpd-pane" ref={paneRef} onScroll={onPaneScroll}>
              {tab === 'detail' ? (
                <div className="cpd-detail">
                  <div className="cpd-detail__toolbar">
                    <button type="button" className="cpd-tool cpd-tool--text cpd-tool--bold">B</button>
                    <button type="button" className="cpd-tool cpd-tool--text cpd-tool--italic">I</button>
                    <button type="button" className="cpd-tool cpd-tool--text cpd-tool--underline">U</button>
                    <button type="button" className="cpd-tool cpd-tool--size">
                      默认大小
                      <img src={icRtCaret} alt="" />
                    </button>
                    <button type="button" className="cpd-tool cpd-tool--icon cpd-tool--font-color">
                      <img src={icRtFontColor} alt="字体颜色" />
                    </button>
                    <button type="button" className="cpd-tool cpd-tool--icon cpd-tool--ul">
                      <img src={icRtListUl} alt="无序列表" />
                    </button>
                    <button type="button" className="cpd-tool cpd-tool--icon">
                      <img src={icRtListOl} alt="有序列表" />
                    </button>
                    <button type="button" className="cpd-tool cpd-tool--icon cpd-tool--align">
                      <img src={icRtAlign} alt="对齐方式" />
                    </button>
                    <button type="button" className="cpd-tool cpd-tool--image cpd-tool--image-on">
                      <img src={icRtImage} alt="插入图片" />
                    </button>
                    <button type="button" className="cpd-tool cpd-tool--icon cpd-tool--clear">
                      <img src={icRtClearFormat} alt="清除格式" />
                    </button>
                    <div className="cpd-detail__tpl-bar">
                      <div className="cpd-detail__tpl-select">
                        <span>选择已有模板快速替换</span>
                        <img src={icRtCaret} alt="" />
                      </div>
                      <button type="button" className="cpd-btn cpd-detail__btn">创建模板</button>
                      <button type="button" className="cpd-btn cpd-detail__btn cpd-btn--ghost">管理模板</button>
                    </div>
                  </div>
                  <div className="cpd-detail__body">
                    <img className="cpd-detail__poster" src={detailPoster} alt="详情主图" />
                  </div>
                  <div className="cpd-detail__float">
                    <button type="button" className="cpd-detail__float-btn" aria-label="向上滚动">
                      <img src={icRtArrowUp} alt="" />
                    </button>
                    <button type="button" className="cpd-detail__float-btn" aria-label="向下滚动">
                      <img src={icRtArrowDown} alt="" />
                    </button>
                  </div>
                </div>
              ) : (
                <form className="cpd-form" onSubmit={(event) => event.preventDefault()}>
                  <Section id="shop" title="店铺/类目" required innerRef={registerSection('shop')}>
                    <div className="cpd-row">
                      <Field label="店铺" required>
                        <Select value={shop} onChange={setShop} options={SHOPS} width={220} placeholder="请选择" />
                      </Field>
                      <Field label="选择类目" className="cpd-item--grow">
                        <div className="cpd-category" data-annotation-id="cpd-cat-source">
                          <button type="button" className="cpd-cat-link">
                            选择类目
                            <Ico src={icCaret} />
                          </button>
                        </div>
                      </Field>
                    </div>
                  </Section>

                  <Section id="info" title="产品信息" innerRef={registerSection('info')}>
                    <Field label="标题" required>
                      <div className="cpd-title-row" data-annotation-id="cpd-info-title">
                        <Text value={title} onChange={setTitle} placeholder="请输入商品标题" count={`${title.length}/140`} />
                        <PrimaryButton tip>AI标题生成</PrimaryButton>
                      </div>
                    </Field>
                  </Section>

                  {/* 关键词、短描板块暂不展示，保留代码以便后续恢复
                  <Section id="keyword" title="关键词" count="0/3" innerRef={registerSection('keyword')}>
                    <Field label="关键词">
                      <div className="cpd-tools">
                        <PrimaryButton plus>新增关键词</PrimaryButton>
                        <PrimaryButton tip>AI关键词生成</PrimaryButton>
                      </div>
                    </Field>
                  </Section>

                  <Section id="shortDesc" title="短描" required innerRef={registerSection('shortDesc')}>
                    <div className="cpd-tools">
                      <PrimaryButton plus>新增短描</PrimaryButton>
                      <PrimaryButton tip>AI短描生成</PrimaryButton>
                      <PrimaryButton>获取通用短描</PrimaryButton>
                    </div>
                  </Section>
                  */}

                  <Section
                    id="attribute"
                    title="产品属性"
                    innerRef={registerSection('attribute')}
                    action={
                      <button type="button" className="cpd-icon-btn" aria-label="刷新属性">
                        <Ico src={icRefresh} />
                      </button>
                    }
                  >
                    <p className="cpd-plain-text">无属性</p>
                    <div className="cpd-attr-grid" data-annotation-id="cpd-attr-source">
                      <div className="cpd-attr-add">
                        <PrimaryButton plus>新增属性</PrimaryButton>
                        <span className="cpd-count">0/10</span>
                      </div>
                    </div>
                  </Section>

                  <Section id="video" title="视频" innerRef={registerSection('video')}>
                    <div className="cpd-row">
                      <Field label="视频名称">
                        <Text
                          value={videoName}
                          onChange={setVideoName}
                          width={250}
                          placeholder="请输入视频名称"
                          count={`${videoName.length}/30`}
                        />
                      </Field>
                      <Field label="视频描述" className="cpd-item--grow">
                        <Text
                          value={videoDesc}
                          onChange={setVideoDesc}
                          className="cpd-input--block"
                          placeholder="请输入视频描述"
                          count={`${videoDesc.length}/200`}
                        />
                      </Field>
                    </div>
                    <div className="cpd-video-upload">
                      <Ico src={icVideo} />
                      <span>上传视频</span>
                    </div>
                  </Section>

                  <Section id="mainImage" title="主图" count="0/8" innerRef={registerSection('mainImage')} annotationId="cpd-main-image-upload">
                    <div className="cpd-tools">
                      <PrimaryButton>批量美图</PrimaryButton>
                      <PrimaryButton>主图拼图</PrimaryButton>
                      <PrimaryButton>下载图片</PrimaryButton>
                    </div>
                    <div className="cpd-images">
                      <div className="cpd-upload-cloud">
                        <Ico src={icUpload} />
                        <span>点击/Ctrl+V粘贴</span>
                      </div>
                    </div>
                  </Section>

                  {/* 站外推广图板块暂不展示，保留代码以便后续恢复
                  <Section
                    id="promoImage"
                    title="站外推广图"
                    required
                    count="0/1"
                    innerRef={registerSection('promoImage')}
                  >
                    <div className="cpd-tools">
                      <PrimaryButton>批量美图</PrimaryButton>
                    </div>
                    <div className="cpd-images cpd-images--min">
                      <div className="cpd-upload-cloud">
                        <Ico src={icUpload} />
                        <span>
                          点击/拖拽
                          <br />
                          Ctrl+V粘贴
                        </span>
                      </div>
                    </div>
                  </Section>
                  */}

                  <Section id="spec" title="产品规格" count="0/5" innerRef={registerSection('spec')}>
                    <div className="cpd-tools">
                      <AddSpecButton />
                      <PrimaryButton plus>添加自定义规则</PrimaryButton>
                      <PrimaryButton>批量编辑</PrimaryButton>
                      <PrimaryButton>智能美图</PrimaryButton>
                      <PrimaryButton>下载图片</PrimaryButton>
                    </div>
                    <div className="cpd-sku-specs" />
                  </Section>

                  <Section id="price" title="价格 USD" required innerRef={registerSection('price')} annotationId="cpd-sku-variant">
                    <div className="cpd-vtable">
                      <div className="cpd-vtable__head">
                        <div className="cpd-vtable__cell">图片</div>
                        {PRICE_COLUMNS.map((column) => (
                          <div key={column.key} className="cpd-vtable__cell">
                            {column.key}
                            {column.editable &&
                              (column.batch ? (
                                <button
                                  type="button"
                                  className="cpd-vtable__edit"
                                  aria-label={`批量修改${column.key}`}
                                  onClick={() => setBatchOpen(true)}
                                >
                                  <Ico src={icPencil} />
                                </button>
                              ) : (
                                <Ico src={icPencil} />
                              ))}
                            {column.sync && (
                              <button
                                type="button"
                                className="cpd-vtable__edit"
                                aria-label="同步库存地点"
                                onClick={() => showToast('同步成功')}
                              >
                                <Ico src={icRefresh} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="cpd-vtable__body">
                        <div className="cpd-vtable__row">
                          <div className="cpd-vtable__cell">
                            <img className="cpd-vtable__thumb" src={thumbProduct} alt="商品图" />
                          </div>
                          <div className="cpd-vtable__cell">1Brown</div>
                          <div className="cpd-vtable__cell">28cm*16cm*40cm</div>
                          <div className="cpd-vtable__cell">
                            <Text
                              value={variant.sku}
                              onChange={(next) => setVariantField('sku', next)}
                              className="cpd-input--block"
                            />
                          </div>
                          <div className="cpd-vtable__cell">
                            <Select
                              value={variant.sellable}
                              onChange={(next) => setVariantField('sellable', next)}
                              options={SELLABLE_OPTIONS}
                              block
                              placeholder="请选择"
                            />
                          </div>
                          <div className="cpd-vtable__cell">
                            <NumberInput
                              block
                              value={variant.stock}
                              onChange={(next) => setVariantField('stock', next)}
                            />
                          </div>
                          <div className="cpd-vtable__cell">
                            <Select
                              value={variant.location}
                              onChange={(next) => setVariantField('location', next)}
                              options={INVENTORY_LOCATIONS}
                              block
                              placeholder="请选择"
                            />
                          </div>
                          <div className="cpd-vtable__cell">
                            <NumberInput
                              block
                              value={variant.weight}
                              onChange={(next) => setVariantField('weight', next)}
                            />
                          </div>
                          <div className="cpd-vtable__cell">
                            <NumberInput
                              block
                              value={variant.revenue}
                              onChange={(next) => setVariantField('revenue', next)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Section>

                  {/* 模板样式板块暂不展示，保留代码以便后续恢复
                  <Section
                    id="template"
                    title="模板样式"
                    align
                    innerRef={registerSection('template')}
                    annotationId="cpd-template-suffix"
                    action={
                      <button
                        type="button"
                        className="cpd-icon-btn"
                        aria-label="刷新模板列表"
                        onClick={() => showToast('同步成功')}
                      >
                        <Ico src={icRefresh} />
                      </button>
                    }
                  >
                    <Field label="商品模板" className="cpd-item--tail">
                      <Select
                        value={templateSuffix}
                        onChange={setTemplateSuffix}
                        options={TEMPLATE_OPTIONS}
                        block
                        placeholder="请选择"
                      />
                    </Field>
                  </Section>
                  */}

                  <div className="cpd-row cpd-row--cols">
                    <Section
                      id="channel"
                      title="发布渠道"
                      required
                      align
                      className="cpd-sec--channel"
                      innerRef={registerSection('channel')}
                      annotationId="cpd-publish-channel"
                      action={
                        <button
                          type="button"
                          className="cpd-icon-btn"
                          aria-label="同步发布渠道"
                          onClick={() => showToast('同步完成')}
                        >
                          <Ico src={icRefresh} />
                        </button>
                      }
                    >
                      <Select
                        value={publishChannel}
                        onChange={setPublishChannel}
                        options={PUBLISH_CHANNELS}
                        block
                        placeholder="请选择"
                      />
                    </Section>

                    <Section
                      id="seo"
                      title="搜索引擎优化（SEO 信息）"
                      align
                      innerRef={registerSection('seo')}
                      annotationId="cpd-seo-info"
                    >
                      <Field label="标题">
                        <Text
                          value={seoTitle}
                          onChange={setSeoTitle}
                          className="cpd-input--block"
                          placeholder="请输入页面标题"
                        />
                      </Field>
                      <Field label="描述">
                        <Textarea value={seoDesc} onChange={setSeoDesc} placeholder="请输入元描述" />
                      </Field>
                      <Field label="URL" className="cpd-item--tail">
                        <Text
                          value={seoUrl}
                          onChange={setSeoUrl}
                          className="cpd-input--block"
                          placeholder="请输入 URL 标识名"
                        />
                      </Field>
                    </Section>
                  </div>

                  {/* 定制商品板块暂不展示，保留代码以便后续恢复
                  <Section id="custom" title="定制商品" required innerRef={registerSection('custom')}>
                    <Field label="是否定制商品" required className="cpd-item--tail">
                      <RadioGroup options={['否', '是']} value={isCustom} onChange={setIsCustom} />
                    </Field>
                  </Section>
                  */}

                  {/* 销售方案、服务板块暂不展示，保留代码以便后续恢复
                  <div className="cpd-row cpd-row--cols">
                    <Section id="sales" title="销售方案" required align innerRef={registerSection('sales')}>
                      <Field label="销售计量单位" required>
                        <Select value={unit} onChange={setUnit} options={UNITS} width={120} placeholder="请选择" />
                      </Field>
                      <Field label="销售方式" required className="cpd-item--tail">
                        <RadioGroup options={['按件卖', '按包卖']} value={sellMode} onChange={setSellMode} />
                      </Field>
                      <Field label="备货状态" className="cpd-item--tail">
                        <RadioGroup options={['有备货', '备货中', '待备货']} value={stockStatus} onChange={setStockStatus} />
                      </Field>
                      <div>
                        <Field label="一次最大购买数量" required>
                          <NumberInput width={130} value={maxBuy} onChange={setMaxBuy} min={1} />
                        </Field>
                      </div>
                      <Field label="备货期" required>
                        <div className="cpd-inline">
                          <NumberInput width={130} value={leadTime} onChange={setLeadTime} />
                          <span>天</span>
                          <span className="cpd-hint">
                            (无备货时,定制类目产品1-40个工作日,非定制类目产品1-10个工作日,特殊类目产品不超过90个工作日)
                          </span>
                        </div>
                      </Field>
                      <Field label="价格区间">
                        <div className="cpd-inline">
                          <NumberInput width={160} value={priceTier} onChange={setPriceTier} />
                          <span className="cpd-muted">(购买(件)以上时,为表格中填写的实际收入)</span>
                          <PrimaryButton plus>新增</PrimaryButton>
                          <span className="cpd-count">1/4</span>
                        </div>
                      </Field>
                      <Field label="有效期" className="cpd-item--tail">
                        <Select value={validity} onChange={setValidity} options={['30天']} width={215} placeholder="请选择" />
                      </Field>
                    </Section>

                    <Section id="service" title="服务" innerRef={registerSection('service')}>
                      <Field label="商品分级管理" className="cpd-item--tail">
                        <RadioGroup options={['成人属性', '非成人属性']} value={grading} onChange={setGrading} />
                      </Field>
                      <Field label="线上分组">
                        <Select value={group} onChange={setGroup} options={[]} block emptyText="暂无数据" placeholder="请选择" />
                      </Field>
                      <Field label="运费模板">
                        <Select value={freight} onChange={setFreight} options={[]} block placeholder="请选择" />
                      </Field>
                      <Field label="售后模板">
                        <Select value={afterSale} onChange={setAfterSale} options={[]} block placeholder="请选择" />
                      </Field>
                      <Field label="尺码模板" className="cpd-item--tail">
                        <Select value={sizeChart} onChange={setSizeChart} options={[]} block placeholder="请选择" />
                      </Field>
                    </Section>
                  </div>
                  */}

                  <div className="cpd-row cpd-row--cols">
                    <Section id="weight" title="重量/包装" align innerRef={registerSection('weight')} annotationId="cpd-weight">
                      <Field label="包装后重量" className="cpd-item--tail">
                        <div className="cpd-inline">
                          <NumberInput width={160} value={weightValue} onChange={setWeightValue} />
                          <span>公斤/件</span>
                          {/* 自定义重量开关暂不展示
                          <Switch checked={customWeight} onChange={setCustomWeight} label="自定义重量" />
                          */}
                        </div>
                      </Field>
                      <Field label="包装尺寸" className="cpd-item--tail">
                        <div className="cpd-volume">
                          {['长 CM', '宽 CM', '高 CM'].map((unitLabel, index) => (
                            <React.Fragment key={unitLabel}>
                              <NumberInput
                                width={120}
                                value={volume[index]}
                                onChange={(next) =>
                                  setVolume((prev) => prev.map((item, i) => (i === index ? next : item)))
                                }
                              />
                              <span className="cpd-volume__unit">{unitLabel}</span>
                            </React.Fragment>
                          ))}
                        </div>
                      </Field>
                    </Section>

                    <Section id="source" title="货源/系统信息" count="0/20" innerRef={registerSection('source')}>
                      <div className="cpd-source-add">
                        <PrimaryButton plus>新增</PrimaryButton>
                      </div>
                      <Field label="父sku" className="cpd-item--tail">
                        <Text value={parentSku} onChange={setParentSku} width={320} placeholder="请输入父sku" />
                      </Field>
                      <Field label="标签" className="cpd-item--tail">
                        <div className="cpd-labels">
                          <button type="button" className="cpd-label-btn" aria-label="编辑标签">
                            <Ico src={icEditOutline} />
                          </button>
                        </div>
                      </Field>
                    </Section>
                  </div>
                </form>
              )}
            </div>
          </div>

          <div className="cpd-footer">
            <button type="button" className="cpd-footer__btn" onClick={onClose}>
              关 闭
            </button>
            <button type="button" className="cpd-footer__btn cpd-footer__btn--primary" onClick={onClose}>
              保 存
            </button>
          </div>

          {batchOpen && (
            <BatchInventoryLocationDialog
              locations={INVENTORY_LOCATIONS}
              colorOptions={['1Brown']}
              customOptions={['28cm*16cm*40cm']}
              onClose={() => setBatchOpen(false)}
              onConfirm={(location) => {
                setVariantField('location', location);
                setBatchOpen(false);
              }}
            />
          )}

          {toast && <div className="cpd-toast">{toast}</div>}
        </div>
      </div>
    </div>
  );
}
