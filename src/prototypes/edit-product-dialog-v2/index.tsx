/**
 * @name 编辑产品弹窗
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BarChart3,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Coins,
  FileText,
  FolderCheck,
  GripVertical,
  Headphones,
  HelpCircle,
  Image as ImageIcon,
  ImagePlus,
  LayoutGrid,
  Link2,
  List,
  Package,
  Pencil,
  PenLine,
  Plus,
  RefreshCw,
  ShoppingBag,
  Table2,
  Tag,
  Trash2,
  Upload,
  Video,
  X,
} from 'lucide-react';
import './style.css';
import './compliance.css';
import AiVideoDialog, { type AiVideoParams } from './components/AiVideoDialog';
import ComplianceEntry from './components/ComplianceEntry';
import ComplianceDialog from './components/ComplianceDialog';
import { AnnotationViewer, setProtoDevState, useProtoDevState, type AnnotationSourceDocument } from '@axhub/annotation';
import { ITEM_DEFS, type ComplianceItemCode, type ComplianceScenario, type ItemPreview } from './lib/compliance';
import { useCompliance } from './lib/useCompliance';
import annotationSourceDocument from './annotation-source.json';

import nav1 from './assets/nav-1.jpg';
import nav2 from './assets/nav-2.jpg';
import nav3 from './assets/nav-3.jpg';
import nav4 from './assets/nav-4.jpg';
import nav5 from './assets/nav-5.png';
import nav6 from './assets/nav-6.jpg';
import nav7 from './assets/nav-7.jpg';
import nav8 from './assets/nav-8.png';
import nav9 from './assets/nav-9.jpg';
import nav10 from './assets/nav-10.jpg';

import main1 from './assets/main-1.jpg';
import main2 from './assets/main-2.jpg';
import main3 from './assets/main-3.jpg';
import main4 from './assets/main-4.jpg';
import main5 from './assets/main-5.jpg';
import main6 from './assets/main-6.jpg';
import main7 from './assets/main-7.jpg';
import main8 from './assets/main-8.jpg';
import promo1 from './assets/promo-1.jpg';

import skuBlack from './assets/sku-black.png';
import skuWhite from './assets/sku-white.png';
import skuPink from './assets/sku-pink.png';
import skuBlue from './assets/sku-blue.png';
import skuGrey from './assets/sku-grey.png';
import spec6 from './assets/spec-6.png';
import spec7 from './assets/spec-7.png';
import spec8 from './assets/spec-8.png';
import spec9 from './assets/spec-9.png';
import opt1 from './assets/opt-1.jpg';
import opt2 from './assets/opt-2.jpg';
import opt3 from './assets/opt-3.jpg';
import opt4 from './assets/opt-4.jpg';
import detail1 from './assets/detail-1.jpg';
import detail2 from './assets/detail-2.jpg';

type NavProduct = {
  id: number;
  title: string;
  thumb: string;
  edited: boolean;
};

const NAV_PRODUCTS: NavProduct[] = [
  {
    id: 1,
    title: 'Hot Selling S26 5G Smartphone 16GB+1TB Unlocked Android HD Camera GPS Dual SIM Cheap Mobile Phone S25 Ultra',
    thumb: nav1,
    edited: false,
  },
  {
    id: 2,
    title: 'Running Shoes Men Star Emblem Low Top Lace Suede Look Skate Sneakers Grey Purple Daily Commute Casual Streetwear',
    thumb: nav2,
    edited: false,
  },
  {
    id: 3,
    title: 'see see10niuzi Running Shoes Star Emblem Low Top Lace Suede Look Skate Sneakers Grey Purple Daily Wear For Men sese10xixi',
    thumb: nav3,
    edited: false,
  },
  {
    id: 4,
    title: 'Running Shoes Men Grey Purple Star Applique Low Top Lace Suede Look Skate Sneakers Daily Commute Casual Streetwear',
    thumb: nav4,
    edited: false,
  },
  {
    id: 5,
    title: 'Running Shoe Classic Star Motif Low Top Lace Suede Look Skate Sneakers Grey Purple Daily Commute Casual Streetwear For Men',
    thumb: nav5,
    edited: false,
  },
  {
    id: 6,
    title: 'see10niuzi Purple Skate Sneakers Emblem Star Low Look Grey Men Running Daily Shoes see For Suede Lace Top Wear s',
    thumb: nav6,
    edited: false,
  },
  {
    id: 7,
    title: 'Running Shoe Grey Purple Star Low Top Lace Suede Look Skate Sneakers Daily Commute Casual Streetwear For Men',
    thumb: nav7,
    edited: false,
  },
  {
    id: 8,
    title: 'Running Shoe Classic Star Motif Low Top Lace Suede Look Skate Sneakers Grey Purple Daily Commute Casual Streetwear For Men',
    thumb: nav8,
    edited: false,
  },
  {
    id: 9,
    title: 'see10niuzi Purple Skate Sneakers Emblem Star Low Look Grey Men Running Daily Shoes see For Suede Lace Top Wear s',
    thumb: nav9,
    edited: false,
  },
  {
    id: 10,
    title: 'Running Shoe Grey Purple Star Low Top Lace Suede Look Skate Sneakers Daily Commute Casual Streetwear For Men',
    thumb: nav10,
    edited: false,
  },
];

type MenuItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  target?: string;
  disabled?: boolean;
};

const MENU: MenuItem[] = [
  { id: 'status', label: '状态/类目', icon: <LayoutGrid size={14} />, target: 'status' },
  { id: 'info', label: '产品信息', icon: <FileText size={14} />, target: 'info' },
  { id: 'keywords', label: '关键词', icon: <Tag size={14} />, target: 'keywords' },
  { id: 'short', label: '短描', icon: <PenLine size={14} />, target: 'short' },
  { id: 'attrs', label: '产品属性', icon: <Table2 size={14} />, target: 'attrs' },
  { id: 'video', label: '视频', icon: <Video size={14} />, target: 'video' },
  { id: 'main', label: '主图', icon: <ImageIcon size={14} />, target: 'main' },
  { id: 'promo', label: '站外推广图', icon: <ImagePlus size={14} />, target: 'promo' },
  { id: 'spec', label: '产品规格', icon: <List size={14} />, target: 'spec' },
  { id: 'price', label: '价格 USD', icon: <Coins size={14} />, target: 'price' },
  { id: 'custom', label: '定制商品', icon: <ShoppingBag size={14} />, target: 'custom' },
  { id: 'sales', label: '销售方案', icon: <BarChart3 size={14} />, target: 'sales' },
  { id: 'service', label: '服务', icon: <Headphones size={14} />, target: 'service' },
  { id: 'weight', label: '重量/包装', icon: <Package size={14} />, target: 'weight' },
  { id: 'source', label: '货源/系统信息', icon: <Link2 size={14} />, target: 'source' },
  { id: 'logistics', label: '物流/运费信息', icon: <Link2 size={14} />, disabled: true },
];

const MAIN_IMAGES = [
  { src: main1, size: '750*708' },
  { src: main2, size: '1600*1600' },
  { src: main3, size: '1500*1500' },
  { src: main4, size: '1500*1500' },
  { src: main5, size: '1000*1000' },
  { src: main6, size: '689*630' },
  { src: main7, size: '698*682' },
  { src: main8, size: '704*633' },
];

const SHORT_TEXTS = [
  'Incorporates cutting-edge hardware featuring an advanced processor designed specifically for high-performance tasks while maintaining optimal power efficiency.',
  'Embrace superior durability engineered into every component offering resistance against drops, scratches, water damage ensuring longevity under diverse usage conditions.',
  'Elevate your visual experience with vibrant OLED display technology delivering true-to-life colors vivid imagery essential whether watching movies or browsing web pages',
  'Excellent performance, brand-new factory-checked device, great cost-performance ratio.',
  'Should you have any questions or issues, our team is ready to help promptly to ensure your satisfaction.',
];

const ATTRIBUTES: {
  label: string;
  required?: boolean;
  value: string;
  kind?: 'select' | 'input' | 'tag';
  extra?: 'custom' | 'all' | 'both';
}[] = [
  { label: '国产品牌 Chinese Brand', value: '无品牌' },
  { label: '操作系统 Operation System', required: true, value: 'Android' },
  { label: 'CPU CPU', value: '八核' },
  { label: 'RAM RAM', value: '3GB' },
  { label: 'ROM ROM', value: '64GB' },
  { label: '屏幕尺寸 Display Size', value: '1.8' },
  { label: '屏幕分辨率 Display Resolution', value: '800x480', extra: 'custom' },
  { label: '摄像头像素 Camera Pixels', value: '没有摄像头', extra: 'custom' },
  { label: '功能 Feature', value: 'USB OTG', kind: 'tag', extra: 'all' },
  { label: '电池容量(毫安) Battery(mAh)', required: true, value: '11111', kind: 'input' },
  { label: '视频拍摄画质 Recording Definition', value: '1080I', extra: 'custom' },
  { label: '网络 Network', value: 'GSM1800', kind: 'tag', extra: 'both' },
  { label: '语言 Language', value: '印度语', kind: 'tag', extra: 'all' },
  { label: '电视模式 TV Standard', value: '模拟电视' },
  { label: '最大插卡容量 Memory Card up to', value: '16G', extra: 'custom' },
  { label: '支持的SIM卡 Sim Card', value: 'SIM卡', kind: 'tag', extra: 'all' },
  { label: '外观样式 Design', value: '直板手机', extra: 'custom' },
];

const COLOR_VALUES = [
  { name: 'Black', img: skuBlack },
  { name: 'White', img: skuWhite },
  { name: 'Pink', img: skuPink },
  { name: 'Blue', img: skuBlue },
  { name: 'Grey', img: skuGrey },
  { name: 'Orange', img: spec6 },
  { name: 'Gold', img: spec7 },
  { name: 'Purple', img: spec8 },
  { name: 'Green', img: spec9 },
  { name: 'Beige', img: promo1 },
];

const OPTION_VALUES = [
  { name: 'AU 16+1TB', img: opt1 },
  { name: 'EU 16+1TB', img: opt2 },
  { name: 'UK 16+1TB', img: opt3 },
  { name: 'US 16+1TB', img: opt4 },
];

const SKU_CODES = [
  '1ehzyh7qw2',
  'l363teucx4',
  'j8ylfebm5e',
  'qffv7fy6b5',
  'vpb96kdmcd',
  'o344mat4za',
  'f0l532bbch',
  '0bryurm7ac',
  'nj9ki4npyx',
  'k0o2xzvxtt',
  '1pq7slfg0r',
  'dl9n3ghz9l',
  'mel2rwt7qj',
  'gk2thloz13',
  'qwn1lq16am',
  'ap8at8a08w',
  'gjmnvptiql',
  '0bryurm7ac',
  'l363teucx4',
  '1ehzyh7qw2',
];

const SKU_ROWS = COLOR_VALUES.flatMap((color, colorIndex) =>
  OPTION_VALUES.map((option, optionIndex) => ({
    color: color.name,
    img: color.img,
    option: option.name,
    sku: SKU_CODES[colorIndex * 4 + optionIndex] ?? '1ehzyh7qw2',
    row: colorIndex * 4 + optionIndex,
  })),
);

function Req() {
  return <span className="ep-req">*</span>;
}

function Section({
  title,
  count,
  required,
  extra,
  children,
  className = '',
  innerRef,
}: {
  title: string;
  count?: React.ReactNode;
  required?: boolean;
  extra?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  innerRef?: React.Ref<HTMLElement>;
}) {
  return (
    <section className={`ep-section ${className}`.trim()} ref={innerRef}>
      <div className="ep-section__head">
        <h3 className="ep-section__title">
          {required && <Req />}
          {title}
        </h3>
        {count !== undefined && <span className="ep-section__count">{count}</span>}
        {extra}
      </div>
      {children}
    </section>
  );
}

function PriceSubmitButton({ onToast }: { onToast: (message: string) => void }) {
  const [tip, setTip] = useState<{ right: number; bottom: number } | null>(null);
  const helpRef = useRef<HTMLSpanElement>(null);

  const showTip = () => {
    const rect = helpRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTip({ right: window.innerWidth - rect.right + 2, bottom: window.innerHeight - rect.top + 8 });
  };

  return (
    <span className="ep-price-submit">
      <button
        type="button"
        className="ep-btn ep-btn--primary"
        data-annotation-id="price-submit"
        onClick={() => onToast('已提交并更新价格')}
      >
        提交并更新价格
        <span
          className="ep-price-submit__help"
          role="img"
          aria-label="提交价格更新说明"
          ref={helpRef}
          onMouseEnter={showTip}
          onMouseLeave={() => setTip(null)}
          onClick={(event) => event.stopPropagation()}
        >
          <HelpCircle size={12} />
          {tip && (
            <span className="ep-price-tip" role="tooltip" style={tip}>
              仅提交并更新价格信息，无需审核；如果有调整价格以外的其他信息，仍需重新发布审核
            </span>
          )}
        </span>
      </button>
    </span>
  );
}

function SelectBox({
  value,
  placeholder,
  disabled,
  className = '',
}: {
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <span className={`ep-select ${disabled ? 'is-disabled' : ''} ${className}`.trim()}>
      <span className={value ? 'ep-select__value' : 'ep-select__ph'}>{value || placeholder}</span>
      <ChevronDown size={12} className="ep-select__caret" />
    </span>
  );
}

function Stepper({ value = '', unit }: { value?: string; unit?: string }) {
  return (
    <span className="ep-stepper">
      <button type="button" className="ep-stepper__btn" aria-label="减少">
        −
      </button>
      <input className="ep-stepper__input" defaultValue={value} />
      <button type="button" className="ep-stepper__btn" aria-label="增加">
        +
      </button>
      {unit && <span className="ep-stepper__unit">{unit}</span>}
    </span>
  );
}

function Radio({
  label,
  checked,
  name,
}: {
  label: string;
  checked?: boolean;
  name: string;
}) {
  return (
    <label className={checked ? 'ep-radio is-checked' : 'ep-radio'}>
      <input type="radio" name={name} defaultChecked={checked} />
      <span className="ep-radio__dot" />
      <span className="ep-radio__label">{label}</span>
    </label>
  );
}

function Checkbox({ label, checked }: { label: string; checked?: boolean }) {
  return (
    <label className="ep-check">
      <input type="checkbox" defaultChecked={checked} />
      <span className="ep-check__box" />
      <span className="ep-check__label">{label}</span>
    </label>
  );
}

function TagValue({ value }: { value: string }) {
  return (
    <span className="ep-tag">
      {value}
      <X size={10} />
    </span>
  );
}

export default function EditProductDialogV2() {
  const [visible, setVisible] = useState(true);
  const [products, setProducts] = useState(NAV_PRODUCTS);
  const [selectedId, setSelectedId] = useState(1);
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<'basic' | 'detail' | 'log'>('basic');
  const [activeMenu, setActiveMenu] = useState('status');
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [shortTexts, setShortTexts] = useState(SHORT_TEXTS);
  const [toast, setToast] = useState<string | null>(null);
  const [complianceOpen, setComplianceOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiJob, setAiJob] = useState<(AiVideoParams & { status: 'generating' | 'failed' }) | null>(null);
  const aiJobTimer = useRef<number>();
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [titleGenerating, setTitleGenerating] = useState(false);
  const titleTimer = useRef<number>();
  const [keywordGenerating, setKeywordGenerating] = useState(false);
  const [shortGenerating, setShortGenerating] = useState(false);
  const [shortPanelOpen, setShortPanelOpen] = useState(false);
  const [shortDraft, setShortDraft] = useState('');
  const [shortPanelPos, setShortPanelPos] = useState({ top: 0, left: 0, up: false });
  const shortCaretRef = useRef<HTMLButtonElement>(null);
  const shortTimer = useRef<number>();
  const keywordTimer = useRef<number>();
  const [aiKeywords, setAiKeywords] = useState('');
  const [aiDraft, setAiDraft] = useState('');
  const [aiPanelPos, setAiPanelPos] = useState({ top: 0, left: 0 });
  const aiCaretRef = useRef<HTMLButtonElement>(null);
  const toastTimer = useRef<number>();
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const showToast = (message: string) => {
    window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(null), 1800);
  };

  const closeAiLayers = () => {
    setAiPanelOpen(false);
  };

  const handleGenerateTitle = () => {
    if (titleGenerating) return;
    closeAiLayers();
    setTitleGenerating(true);
    window.clearTimeout(titleTimer.current);
    titleTimer.current = window.setTimeout(() => setTitleGenerating(false), 2000);
  };

  const closeShortPanel = () => setShortPanelOpen(false);

  const toggleShortPanel = () => {
    if (shortPanelOpen) {
      setShortPanelOpen(false);
      return;
    }
    const rect = shortCaretRef.current?.getBoundingClientRect();
    if (rect) {
      const panelHeight = 154;
      const up = rect.bottom + 6 + panelHeight > window.innerHeight - 12;
      setShortPanelPos({
        top: up ? rect.top - 6 - panelHeight : rect.bottom + 6,
        left: Math.max(12, Math.min(rect.right - 300, window.innerWidth - 312)),
        up,
      });
    }
    setShortDraft('');
    setShortPanelOpen(true);
  };

  const startShortGenerate = () => {
    if (shortGenerating) return;
    closeShortPanel();
    setShortGenerating(true);
    window.clearTimeout(shortTimer.current);
    shortTimer.current = window.setTimeout(() => setShortGenerating(false), 2000);
  };

  const startKeywordGenerate = () => {
    if (keywordGenerating) return;
    setKeywordGenerating(true);
    window.clearTimeout(keywordTimer.current);
    keywordTimer.current = window.setTimeout(() => setKeywordGenerating(false), 2000);
  };

  const scheduleAiFailure = () => {
    window.clearTimeout(aiJobTimer.current);
    aiJobTimer.current = window.setTimeout(() => {
      setAiJob((prev) => (prev && prev.status === 'generating' ? { ...prev, status: 'failed' } : prev));
    }, 4000);
  };

  const handleAiGenerate = (params: AiVideoParams) => {
    setAiJob({ ...params, status: 'generating' });
    scheduleAiFailure();
  };

  const handleRetryAiJob = () => {
    setAiJob((prev) => (prev ? { ...prev, status: 'generating' } : prev));
    scheduleAiFailure();
  };

  const handleStopGeneration = () => {
    window.clearTimeout(aiJobTimer.current);
    setAiJob(null);
    setAiOpen(false);
  };

  const toggleAiPanel = () => {
    if (aiPanelOpen) {
      setAiPanelOpen(false);
      return;
    }
    const rect = aiCaretRef.current?.getBoundingClientRect();
    if (rect) {
      setAiPanelPos({
        top: rect.bottom + 6,
        left: Math.max(12, Math.min(rect.right - 300, window.innerWidth - 312)),
      });
    }
    setAiDraft(aiKeywords);
    setAiPanelOpen(true);
  };

  const pageCount = 2;
  const pageItems = useMemo(() => {
    if (page === 1) return products;
    return products.map((item) => ({ ...item, id: item.id + 100 }));
  }, [page, products]);

  const selected = products.find((item) => item.id === selectedId) ?? products[0];

  // 商品合规检测：检测结果按商品维度留存，演示场景可一键切换
  const protoState = useProtoDevState<Record<string, unknown>>();
  const complianceScenario: ComplianceScenario =
    protoState.compliance_scenario === 'all-pass' ? 'all-pass' : 'mixed';
  const compliance = useCompliance(selected, complianceScenario);
  const prevScenario = useRef<ComplianceScenario | null>(null);

  // 标注面板的演示控件：单张卡片与结论条可临时切换展示状态（只看样式，不写数据）
  const itemPreviews = useMemo(() => {
    const previews: Partial<Record<ComplianceItemCode, ItemPreview>> = {};
    ITEM_DEFS.forEach((def) => {
      const value = protoState[`compliance_item_state_${def.code}`];
      if (value === 'pass' || value === 'issue' || value === 'fail') {
        previews[def.code] = value;
      }
    });
    return previews;
  }, [protoState]);

  const conclusionPreview =
    protoState.compliance_conclusion_state === 'pass'
      ? 'pass'
      : protoState.compliance_conclusion_state === 'issue'
        ? 'issue'
        : undefined;

  useEffect(() => {
    if (prevScenario.current === null) {
      prevScenario.current = complianceScenario;
      return;
    }
    if (prevScenario.current === complianceScenario) return;
    prevScenario.current = complianceScenario;
    if (!compliance.applyScenario(complianceScenario)) {
      showToast('已切换演示场景，下次检测生效');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complianceScenario]);

  // 标注 1.0.19 的 :host 重置会把宿主层压到弹窗下方，导致标注点被遮挡；在宿主 shadowRoot 内补一条同权重规则把层重新抬高。
  useEffect(() => {
    const ensureAnnotationLayer = () => {
      const host = document.getElementById('__axhub_annotation_host__');
      const root = host?.shadowRoot;
      if (!root || root.getElementById('annotation-host-layer-fix')) return;
      const style = document.createElement('style');
      style.id = 'annotation-host-layer-fix';
      style.textContent =
        ':host { all: initial !important; display: block !important; position: fixed !important; inset: 0 !important; z-index: 2147483647 !important; pointer-events: none !important; }';
      root.appendChild(style);
    };
    ensureAnnotationLayer();
    const observer = new MutationObserver(ensureAnnotationLayer);
    observer.observe(document.documentElement, { childList: true });
    return () => observer.disconnect();
  }, []);

  const setSectionRef = (id: string) => (el: HTMLElement | null) => {
    sectionRefs.current[id] = el;
  };

  const gotoSection = (item: MenuItem) => {
    if (item.disabled) return;
    setActiveMenu(item.id);
    const targetId = item.target ?? item.id;
    const container = scrollRef.current;
    const el = sectionRefs.current[targetId];
    if (container && el) {
      const top =
        container.scrollTop +
        el.getBoundingClientRect().top -
        container.getBoundingClientRect().top -
        2;
      container.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const toggleEdited = (id: number) =>
    setProducts((prev) => prev.map((item) => (item.id === id ? { ...item, edited: !item.edited } : item)));

  const removeProduct = (id: number) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));
    if (selectedId === id) setSelectedId(products.find((item) => item.id !== id)?.id ?? 1);
  };

  if (!visible) {
    return (
      <>
        {toast && <div className="ep-toast">{toast}</div>}
        <div className="ep-closed">
          <span className="ep-closed__text">弹窗已关闭（原型演示）</span>
          <button type="button" className="ep-btn ep-btn--primary" onClick={() => setVisible(true)}>
            重新打开
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      {toast && <div className="ep-toast">{toast}</div>}
      <div className="ep-overlay">
        <div className="ep-dialog" role="dialog" aria-modal="true" aria-label="编辑产品">
          <header className="ep-dialog__header">
            <h2 className="ep-dialog__title">编辑产品</h2>
            <button type="button" className="ep-dialog__close" aria-label="关闭" onClick={() => setVisible(false)}>
              <X size={16} />
            </button>
          </header>

          <div className="ep-dialog__body">
            <div className={`ep-container ${navCollapsed ? 'is-collapsed' : ''}`.trim()}>
              <aside className="ep-nav">
                <div className="ep-nav__list">
                  {pageItems.map((item) => {
                    const active = page === 1 && item.id === selectedId;
                    return (
                      <div
                        key={item.id}
                        className={active ? 'ep-nav-item is-active' : 'ep-nav-item'}
                        role="button"
                        tabIndex={0}
                        onClick={() => page === 1 && setSelectedId(item.id)}
                      >
                        <img className="ep-nav-item__thumb" src={item.thumb} alt="" />
                        <div className="ep-nav-item__main">
                          <p className="ep-nav-item__title">{item.title}</p>
                          <div className="ep-nav-item__foot">
                            <span className={item.edited ? 'ep-nav-item__status is-edited' : 'ep-nav-item__status'}>
                              {item.edited ? '已编辑' : '未编辑'}
                            </span>
                          </div>
                        </div>
                        <div className="ep-nav-item__actions">
                          <button
                            type="button"
                            className="ep-nav-item__icon ep-nav-item__icon--trash"
                            aria-label="删除该商品"
                            onClick={(event) => {
                              event.stopPropagation();
                              removeProduct(item.id);
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                          <button
                            type="button"
                            className="ep-nav-item__icon ep-nav-item__icon--check"
                            aria-label="标记为已编辑"
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleEdited(item.id);
                            }}
                          >
                            <FolderCheck size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="ep-nav__pager">
                  <button
                    type="button"
                    className="ep-pager__btn"
                    disabled={page <= 1}
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  >
                    <ChevronLeft size={11} />
                  </button>
                  <button
                    type="button"
                    className="ep-pager__btn ep-pager__btn--next"
                    disabled={page >= pageCount}
                    onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
                  >
                    <ChevronRight size={11} />
                  </button>
                </div>
              </aside>

              <main className="ep-main">
                <div className="ep-topbar">
                  <button
                    type="button"
                    className="ep-collapse"
                    aria-label={navCollapsed ? '展开列表' : '收起列表'}
                    onClick={() => setNavCollapsed((prev) => !prev)}
                  >
                    {navCollapsed ? <ChevronsRight size={13} /> : <ChevronsLeft size={13} />}
                  </button>
                  <div className="ep-tabs">
                    {(['basic', 'detail', 'log'] as const).map((key, index) => (
                      <React.Fragment key={key}>
                        {index > 0 && <span className="ep-tabs__sep" />}
                        <button
                          type="button"
                          className={tab === key ? 'ep-tab is-active' : 'ep-tab'}
                          onClick={() => { setTab(key); closeAiLayers(); closeShortPanel(); }}
                        >
                          {key === 'basic' ? '基本' : key === 'detail' ? '详情' : '日志'}
                        </button>
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {tab === 'basic' ? (
                  <div className="ep-main__content">
                    <nav className="ep-menu">
                      {MENU.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className={
                            item.disabled
                              ? 'ep-menu__item is-disabled'
                              : activeMenu === item.id
                                ? 'ep-menu__item is-active'
                                : 'ep-menu__item'
                          }
                          onClick={() => gotoSection(item)}
                        >
                          <span className="ep-menu__icon">{item.icon}</span>
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </nav>

                    <div className="ep-form-area">
                      <div className="ep-form-scroll" ref={scrollRef}>
                        <Section
                          title="状态/类目"
                          required
                          innerRef={setSectionRef('status')}
                        >
                          <div className="ep-status-row">
                            <span className="ep-status-label">状态</span>
                            <span className="ep-status-value">
                              <span className="ep-status-dot" />
                              待发布
                            </span>
                            <span className="ep-status-label">线上产品编号</span>
                            <span className="ep-status-empty" />
                            <span className="ep-status-label">选择类目</span>
                            <button type="button" className="ep-category">
                              手机和手机附件 &lt; 手机
                              <ChevronDown size={12} />
                            </button>
                          </div>
                        </Section>

                        <Section title="产品信息" innerRef={setSectionRef('info')}>
                          <div className="ep-field">
                            <span className="ep-field__label">
                              <Req />标题
                            </span>
                            <span className="ep-input-wrap">
                              <input className="ep-input" key={selectedId} defaultValue={selected.title} />
                              <span className="ep-input__count">{selected.title.replace(/\s/g, '').length}/140</span>
                            </span>
                            <span className={titleGenerating ? 'ep-ai-split is-disabled' : 'ep-ai-split'}>
                              <button
                                type="button"
                                className="ep-btn ep-btn--primary ep-btn--sm ep-ai-main"
                                disabled={titleGenerating}
                                aria-busy={titleGenerating}
                                onClick={handleGenerateTitle}
                              >
                                {titleGenerating && (
                                  <span className="ep-title-spinner" aria-hidden="true">
                                    {Array.from({ length: 12 }).map((_, index) => (
                                      <span
                                        key={index}
                                        style={{
                                          transform: `rotate(${index * 30}deg)`,
                                          animationDelay: `${index * 0.083}s`,
                                        }}
                                      />
                                    ))}
                                  </span>
                                )}
                                AI标题生成
                                <HelpCircle size={12} />
                              </button>
                              <button
                                ref={aiCaretRef}
                                type="button"
                                className={aiPanelOpen ? 'ep-ai-caret is-open' : 'ep-ai-caret'}
                                aria-label="设置指定包含关键词"
                                aria-expanded={aiPanelOpen}
                                disabled={titleGenerating}
                                onClick={toggleAiPanel}
                              >
                                <ChevronDown size={12} />
                              </button>
                            </span>
                            <button type="button" className="ep-btn ep-btn--primary ep-btn--sm">
                              普通翻译
                            </button>
                          </div>
                          {aiPanelOpen && (
                            <>
                              <div className="ep-ai-mask" onClick={closeAiLayers} />
                              <div className="ep-ai-pop" style={{ top: aiPanelPos.top, left: aiPanelPos.left }}>
                                <div className="ep-ai-pop__title">指定包含关键词</div>
                                <div className="ep-ai-pop__control">
                                  <input
                                    autoFocus
                                    className="ep-input"
                                    value={aiDraft}
                                    maxLength={70}
                                    placeholder="多个关键词用逗号分隔"
                                    onChange={(event) => setAiDraft(event.target.value)}
                                    onKeyDown={(event) => {
                                      if (event.key === 'Enter' && aiDraft.trim()) {
                                        setAiKeywords('');
                                        setAiDraft('');
                                        handleGenerateTitle();
                                      }
                                      if (event.key === 'Escape') closeAiLayers();
                                    }}
                                  />
                                  <span className={aiDraft.length >= 70 ? 'ep-ai-pop__count is-limit' : 'ep-ai-pop__count'}>
                                    {aiDraft.length}/70
                                  </span>
                                </div>
                                <p className="ep-ai-pop__hint">让AI生成标题时包含指定的关键词</p>
                                <div className="ep-ai-pop__footer">
                                  <button type="button" className="ep-btn ep-btn--default ep-btn--tiny" onClick={closeAiLayers}>
                                    取消
                                  </button>
                                  <button
                                    type="button"
                                    className="ep-btn ep-btn--primary ep-btn--tiny"
                                    disabled={!aiDraft.trim()}
                                    onClick={() => {
                                      if (!aiDraft.trim()) return;
                                      setAiKeywords('');
                                      setAiDraft('');
                                      handleGenerateTitle();
                                    }}
                                  >
                                    生成
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </Section>

                        <Section
                          title="关键词"
                          count="0/3"
                          innerRef={setSectionRef('keywords')}
                        >
                          <div className="ep-field">
                            <span className="ep-field__label">关键词</span>
                            <button type="button" className="ep-btn ep-btn--primary ep-btn--sm">
                              <Plus size={12} />
                              新增关键词
                            </button>
                            <button
                              type="button"
                              className="ep-btn ep-btn--primary ep-btn--sm"
                              disabled={keywordGenerating}
                              aria-busy={keywordGenerating}
                              onClick={startKeywordGenerate}
                            >
                              {keywordGenerating && (
                                <span className="ep-title-spinner" aria-hidden="true">
                                  {Array.from({ length: 12 }).map((_, index) => (
                                    <span
                                      key={index}
                                      style={{
                                        transform: `rotate(${index * 30}deg)`,
                                        animationDelay: `${index * 0.083}s`,
                                      }}
                                    />
                                  ))}
                                </span>
                              )}
                              AI关键词生成
                              <HelpCircle size={12} />
                            </button>
                          </div>
                        </Section>

                        <Section title="短描" required innerRef={setSectionRef('short')}>
                          <div className="ep-short-list">
                            {shortTexts.map((text, index) => (
                              <div className="ep-short-row" key={index}>
                                <span className="ep-field__label">
                                  <Req />短描{index + 1}
                                </span>
                                <span className="ep-textarea-wrap">
                                  <textarea className="ep-textarea" defaultValue={text} />
                                  <span className="ep-textarea__count">{text.length}/300</span>
                                </span>
                                <button
                                  type="button"
                                  className="ep-icon-btn"
                                  aria-label="删除短描"
                                  onClick={() => setShortTexts((prev) => prev.filter((_, i) => i !== index))}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                          <div className="ep-actions">
                            <button
                              type="button"
                              className="ep-btn ep-btn--primary"
                              onClick={() => setShortTexts((prev) => [...prev, ''])}
                            >
                              <Plus size={12} />
                              新增短描
                            </button>
                            <span className={shortGenerating ? 'ep-ai-split is-disabled' : 'ep-ai-split'}>
                              <button
                                type="button"
                                className="ep-btn ep-btn--primary ep-ai-main"
                                disabled={shortGenerating}
                                aria-busy={shortGenerating}
                                onClick={startShortGenerate}
                              >
                                {shortGenerating && (
                                  <span className="ep-title-spinner" aria-hidden="true">
                                    {Array.from({ length: 12 }).map((_, index) => (
                                      <span
                                        key={index}
                                        style={{
                                          transform: `rotate(${index * 30}deg)`,
                                          animationDelay: `${index * 0.083}s`,
                                        }}
                                      />
                                    ))}
                                  </span>
                                )}
                                AI短描生成
                                <HelpCircle size={12} />
                              </button>
                              <button
                                ref={shortCaretRef}
                                type="button"
                                className={shortPanelOpen ? 'ep-ai-caret is-open' : 'ep-ai-caret'}
                                aria-label="设置生成短描的指定词"
                                aria-expanded={shortPanelOpen}
                                disabled={shortGenerating}
                                onClick={toggleShortPanel}
                              >
                                <ChevronDown size={12} />
                              </button>
                            </span>
                            <button type="button" className="ep-btn ep-btn--primary">
                              获取通用短描
                            </button>
                          </div>
                          {shortPanelOpen && (
                            <>
                              <div className="ep-ai-mask" onClick={closeShortPanel} />
                              <div
                                className={shortPanelPos.up ? 'ep-ai-pop ep-ai-pop--up' : 'ep-ai-pop'}
                                style={{ top: shortPanelPos.top, left: shortPanelPos.left }}
                              >
                                <div className="ep-ai-pop__title">指定包含关键词</div>
                                <div className="ep-ai-pop__control">
                                  <input
                                    autoFocus
                                    className="ep-input"
                                    value={shortDraft}
                                    maxLength={150}
                                    placeholder="多个关键词用逗号分隔"
                                    onChange={(event) => setShortDraft(event.target.value)}
                                    onKeyDown={(event) => {
                                      if (event.key === 'Enter' && shortDraft.trim()) {
                                        setShortDraft('');
                                        startShortGenerate();
                                      }
                                      if (event.key === 'Escape') closeShortPanel();
                                    }}
                                  />
                                  <span className={shortDraft.length >= 150 ? 'ep-ai-pop__count is-limit' : 'ep-ai-pop__count'}>
                                    {shortDraft.length}/150
                                  </span>
                                </div>
                                <p className="ep-ai-pop__hint">让AI生成短描时包含指定的关键词</p>
                                <div className="ep-ai-pop__footer">
                                  <button type="button" className="ep-btn ep-btn--default ep-btn--tiny" onClick={closeShortPanel}>
                                    取消
                                  </button>
                                  <button
                                    type="button"
                                    className="ep-btn ep-btn--primary ep-btn--tiny"
                                    disabled={!shortDraft.trim()}
                                    onClick={() => {
                                      if (!shortDraft.trim()) return;
                                      setShortDraft('');
                                      startShortGenerate();
                                    }}
                                  >
                                    生成
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </Section>

                        <Section
                          title="产品属性"
                          extra={
                            <button type="button" className="ep-ghost-icon" aria-label="刷新属性">
                              <RefreshCw size={14} />
                            </button>
                          }
                          innerRef={setSectionRef('attrs')}
                        >
                          <div className="ep-attr-list">
                            {ATTRIBUTES.map((attr) => (
                              <div className="ep-attr-row" key={attr.label}>
                                <span className="ep-attr-label">
                                  {attr.required && <Req />}
                                  {attr.label}
                                </span>
                                <span className="ep-attr-control">
                                  {attr.kind === 'input' ? (
                                    <input className="ep-input ep-input--attr" defaultValue={attr.value} />
                                  ) : attr.kind === 'tag' ? (
                                    <span className="ep-select ep-select--tag">
                                      <TagValue value={attr.value} />
                                      <ChevronDown size={12} className="ep-select__caret" />
                                    </span>
                                  ) : (
                                    <SelectBox value={attr.value} />
                                  )}
                                </span>
                                {attr.extra === 'custom' && <Checkbox label="自定义" />}
                                {attr.extra === 'all' && <Checkbox label="全选" />}
                                {attr.extra === 'both' && (
                                  <>
                                    <Checkbox label="全选" />
                                    <Checkbox label="自定义" />
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                          <div className="ep-actions">
                            <button type="button" className="ep-btn ep-btn--primary">
                              <Plus size={12} />
                              新增属性
                            </button>
                            <span className="ep-muted">0/10</span>
                          </div>
                        </Section>

                        <Section title="视频" innerRef={setSectionRef('video')}>
                          <div className="ep-video">
                            <button
                              type="button"
                              className="ep-ai-video-btn"
                              data-annotation-id="ai-video-entry"
                              disabled={aiJob?.status === 'generating'}
                              title={aiJob?.status === 'generating' ? '视频生成中，暂不可再次生成' : undefined}
                              onClick={() => setAiOpen(true)}
                            >
                              AI生成视频
                            </button>
                            <label className="ep-video__label">视频名称</label>
                            <span className="ep-input-wrap ep-input-wrap--short">
                              <input className="ep-input" defaultValue="Hot Selling S26 5G Smartphone " />
                              <span className="ep-input__count">30/30</span>
                            </span>
                            <label className="ep-video__label">视频描述</label>
                            <span className="ep-input-wrap">
                              <input
                                className="ep-input"
                                defaultValue="Incorporates cutting-edge hardware featuring an advanced processor designed specifically for high-performance tasks while maintaining optimal power efficiency."
                              />
                              <span className="ep-input__count">159/200</span>
                            </span>
                            {aiJob?.status === 'generating' ? (
                              <div className="ep-video-gen">
                                <span className="ep-ai-spinner" aria-hidden="true">
                                  {Array.from({ length: 12 }).map((_, index) => (
                                    <span
                                      key={index}
                                      style={{
                                        transform: `rotate(${index * 30}deg)`,
                                        animationDelay: `${index * 0.083}s`,
                                      }}
                                    />
                                  ))}
                                </span>
                                <span className="ep-video-gen__text">AI 生成中</span>
                                <span className="ep-video-gen__meta">
                                  {aiJob.duration} 秒 · {aiJob.ratioLabel} · {aiJob.refs.length} 张参考图
                                </span>
                                <button
                                  type="button"
                                  className="ep-video-gen__stop"
                                  onClick={handleStopGeneration}
                                >
                                  停止生成
                                </button>
                                <span className="ep-video-gen__bar" aria-hidden="true">
                                  <i />
                                </span>
                              </div>
                            ) : aiJob?.status === 'failed' ? (
                              <div className="ep-video-fail">
                                <span className="ep-video-fail__icon">!</span>
                                <span className="ep-video-fail__text">视频生成失败</span>
                                <span className="ep-video-fail__meta">
                                  {aiJob.duration} 秒 · {aiJob.ratioLabel} · {aiJob.refs.length} 张参考图
                                </span>
                                <div className="ep-video-fail__actions">
                                  <button type="button" className="ep-video-fail__retry" onClick={handleRetryAiJob}>
                                    重新生成
                                  </button>
                                  <button type="button" className="ep-video-fail__cancel" onClick={handleStopGeneration}>
                                    取消生成
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button type="button" className="ep-upload-box">
                                <Video size={24} />
                                <span>上传视频</span>
                              </button>
                            )}
                          </div>
                        </Section>

                        <Section
                          title="主图"
                          required
                          count="8/8"
                          innerRef={setSectionRef('main')}
                        >
                          <div className="ep-actions">
                            <button type="button" className="ep-btn ep-btn--primary">
                              批量美图
                            </button>
                            <button type="button" className="ep-btn ep-btn--primary">
                              主图拼图
                            </button>
                            <button type="button" className="ep-btn ep-btn--primary">
                              下载图片
                            </button>
                          </div>
                          <div className="ep-image-grid">
                            {MAIN_IMAGES.map((image) => (
                              <div className="ep-image-tile" key={image.src}>
                                <img src={image.src} alt="" />
                                <span className="ep-image-tile__size">{image.size}</span>
                              </div>
                            ))}
                          </div>
                        </Section>

                        <Section
                          title="站外推广图"
                          required
                          count="1/1"
                          innerRef={setSectionRef('promo')}
                        >
                          <div className="ep-actions">
                            <button type="button" className="ep-btn ep-btn--primary">
                              批量美图
                            </button>
                          </div>
                          <div className="ep-image-grid">
                            <div className="ep-image-tile">
                              <img src={promo1} alt="" />
                              <span className="ep-image-tile__size">750*708</span>
                            </div>
                          </div>
                        </Section>

                        <Section
                          title="产品规格"
                          count="2/5"
                          innerRef={setSectionRef('spec')}
                        >
                          <div className="ep-actions ep-actions--wrap">
                            <button type="button" className="ep-btn ep-btn--primary">
                              <Plus size={12} />
                              添加平台规格
                              <ChevronDown size={12} />
                            </button>
                            <button type="button" className="ep-btn ep-btn--primary">
                              <Plus size={12} />
                              添加自定义规格
                            </button>
                            <button type="button" className="ep-btn ep-btn--primary">
                              批量编辑文本
                            </button>
                            <button type="button" className="ep-btn ep-btn--primary">
                              批量编辑图片
                            </button>
                            <button type="button" className="ep-btn ep-btn--primary">
                              下载图片
                            </button>
                          </div>

                          <div className="ep-spec-group">
                            <div className="ep-spec-name">
                              <span className="ep-field__label">规格名称</span>
                              <span className="ep-input-wrap ep-input-wrap--spec">
                                <input className="ep-input ep-input--disabled" defaultValue="颜色（Color）" disabled />
                              </span>
                              <span className="ep-switch-wrap">
                                <span className="ep-switch is-on" />
                                图片模式
                              </span>
                              <button type="button" className="ep-order">
                                <GripVertical size={14} />
                                调整顺序
                              </button>
                            </div>
                            <div className="ep-spec-label-row">
                              <span className="ep-field__label">规格值</span>
                            </div>
                            <div className="ep-spec-cards">
                              <button type="button" className="ep-add-card">
                                <Plus size={24} />
                                <span>添加规格值</span>
                              </button>
                              {COLOR_VALUES.map((color) => (
                                <div className="ep-spec-card" key={color.name}>
                                  <div className="ep-spec-card__top">
                                    <input className="ep-spec-input" defaultValue={color.name} disabled />
                                    <Pencil size={12} className="ep-spec-icon" />
                                    <GripVertical size={13} className="ep-spec-icon" />
                                  </div>
                                  <div className="ep-spec-card__body">
                                    <img src={color.img} alt="" />
                                    <button type="button" className="ep-upload-btn">
                                      <Upload size={14} />
                                    </button>
                                  </div>
                                  <div className="ep-spec-card__size">尺寸: 1600*1600</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="ep-spec-group">
                            <div className="ep-spec-name">
                              <span className="ep-field__label">规格名称</span>
                              <span className="ep-input-wrap ep-input-wrap--spec">
                                <input className="ep-input" defaultValue="Options" />
                                <span className="ep-input__count">7/200</span>
                              </span>
                              <span className="ep-switch-wrap">
                                <span className="ep-switch is-on" />
                                图片模式
                              </span>
                              <button type="button" className="ep-order">
                                <GripVertical size={14} />
                                调整顺序
                              </button>
                            </div>
                            <div className="ep-spec-label-row">
                              <span className="ep-field__label">规格值</span>
                            </div>
                            <div className="ep-spec-cards">
                              <button type="button" className="ep-add-card" onClick={() => showToast('已添加规格值')}>
                                <Plus size={24} />
                                <span>添加规格值</span>
                              </button>
                              {OPTION_VALUES.map((option) => (
                                <div className="ep-spec-card" key={option.name}>
                                  <div className="ep-spec-card__top">
                                    <input className="ep-spec-input" defaultValue={option.name} />
                                    <span className="ep-spec-count">9/40</span>
                                    <GripVertical size={13} className="ep-spec-icon" />
                                  </div>
                                  <div className="ep-spec-card__body">
                                    <img src={option.img} alt="" />
                                    <button type="button" className="ep-upload-btn">
                                      <Upload size={14} />
                                    </button>
                                  </div>
                                  <div className="ep-spec-card__size">尺寸: 524*283</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </Section>

                        <Section title="价格 USD" required innerRef={setSectionRef('price')} extra={<PriceSubmitButton onToast={showToast} />}>
                          <div className="ep-table-wrap">
                            <div className="ep-sku-table">
                              <div className="ep-sku-head">
                                <span>图片</span>
                                <span>颜色（Color）</span>
                                <span>Options</span>
                                <span className="ep-sku-head__edit">
                                  SKU编码
                                  <Pencil size={12} />
                                </span>
                                <span className="ep-sku-head__edit">
                                  是否可售
                                  <Pencil size={12} />
                                </span>
                                <span className="ep-sku-head__edit">
                                  库存
                                  <Pencil size={12} />
                                </span>
                                <span className="ep-sku-head__edit">
                                  重量
                                  <Pencil size={12} />
                                </span>
                                <span className="ep-sku-head__edit">
                                  实际收入
                                  <Pencil size={12} />
                                </span>
                                <span className="ep-sku-head__edit" data-annotation-id="purchase-price">
                                  采购价
                                  <Pencil size={12} />
                                </span>
                              </div>
                              {SKU_ROWS.map((row) => (
                                <div className="ep-sku-row" key={row.row}>
                                  <span className="ep-sku-img">
                                    <img src={row.img} alt="" />
                                  </span>
                                  <span className="ep-sku-text">{row.color}</span>
                                  <span className="ep-sku-text">{row.option}</span>
                                  <span className="ep-sku-cell">
                                    <input className="ep-sku-input" defaultValue={row.sku} />
                                  </span>
                                  <span className="ep-sku-cell">
                                    <SelectBox value="可销售" className="ep-sku-select" />
                                  </span>
                                  <span className="ep-sku-cell">
                                    <Stepper value="999" />
                                  </span>
                                  <span className="ep-sku-cell">
                                    <Stepper value="0.050" />
                                  </span>
                                  <span className="ep-sku-cell">
                                    <Stepper value="103.27" />
                                  </span>
                                  <span className="ep-sku-cell">
                                    <Stepper />
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </Section>

                        <Section title="定制商品" required innerRef={setSectionRef('custom')}>
                          <div className="ep-field">
                            <span className="ep-field__label">是否定制商品</span>
                            <Radio label="否" name="custom" checked />
                            <Radio label="是" name="custom" />
                          </div>
                        </Section>

                        <div className="ep-split" ref={setSectionRef('sales')}>
                          <Section title="销售方案" required className="ep-section--split">
                            <div className="ep-stack-field">
                              <span className="ep-field__label">
                                <Req />销售计量单位
                              </span>
                              <SelectBox value="件" />
                            </div>
                            <div className="ep-stack-field">
                              <span className="ep-field__label">
                                <Req />销售方式
                              </span>
                              <div className="ep-radio-group">
                                <Radio label="按件卖" name="sell-mode" checked />
                                <Radio label="按包卖" name="sell-mode" />
                              </div>
                            </div>
                            <div className="ep-stack-field">
                              <span className="ep-field__label">备货状态</span>
                              <div className="ep-radio-group">
                                <Radio label="有备货" name="stock-status" />
                                <Radio label="备货中" name="stock-status" checked />
                                <Radio label="待备货" name="stock-status" />
                              </div>
                            </div>
                            <div className="ep-stack-field">
                              <span className="ep-field__label">备货所在地</span>
                              <div className="ep-inline-actions">
                                <SelectBox value="中国" />
                                <button type="button" className="ep-btn ep-btn--primary ep-btn--tiny">
                                  <Plus size={11} />
                                  新增
                                </button>
                                <span className="ep-muted">1/217</span>
                              </div>
                            </div>
                            <div className="ep-stack-field">
                              <span className="ep-field__label">
                                <Req />库存扣减方式
                              </span>
                              <div className="ep-radio-group">
                                <Radio label="下单扣减库存" name="stock-cut" checked />
                                <Radio label="支付扣减库存" name="stock-cut" />
                              </div>
                            </div>
                            <div className="ep-stack-field">
                              <span className="ep-field__label">
                                <Req />备货期
                              </span>
                              <div className="ep-inline-actions">
                                <Stepper />
                                <span>天</span>
                              </div>
                              <span className="ep-hint">(备货期为5-10天)</span>
                            </div>
                            <div className="ep-stack-field">
                              <span className="ep-field__label">价格区间</span>
                              <div className="ep-inline-actions">
                                <Stepper />
                                <button type="button" className="ep-btn ep-btn--primary ep-btn--tiny">
                                  <Plus size={11} />
                                  新增
                                </button>
                                <span className="ep-muted">1/4</span>
                              </div>
                              <span className="ep-hint">
                                (购买(件)以上时,为表格中填写的实际收入)
                              </span>
                            </div>
                            <div className="ep-stack-field">
                              <span className="ep-field__label">有效期</span>
                              <SelectBox placeholder="请选择" />
                            </div>
                          </Section>

                          <Section title="服务" className="ep-section--split" innerRef={setSectionRef('service')}>
                            <div className="ep-stack-field">
                              <span className="ep-field__label">商品分级管理</span>
                              <div className="ep-radio-group">
                                <Radio label="成人属性" name="adult" />
                                <Radio label="非成人属性" name="adult" />
                              </div>
                            </div>
                            <div className="ep-inline-field">
                              <span className="ep-field__label">线上分组</span>
                              <SelectBox placeholder="请选择线上分组" />
                            </div>
                            <div className="ep-inline-field">
                              <span className="ep-field__label">运费模板</span>
                              <SelectBox placeholder="请选择运费模板" />
                            </div>
                            <div className="ep-inline-field">
                              <span className="ep-field__label">售后模板</span>
                              <SelectBox placeholder="请选择售后模板" />
                            </div>
                            <div className="ep-inline-field">
                              <span className="ep-field__label">尺码模板</span>
                              <SelectBox placeholder="请选择尺码模板" />
                            </div>
                            <button type="button" className="ep-sync-btn">
                              同步
                            </button>
                          </Section>
                        </div>

                        <div className="ep-split" ref={setSectionRef('weight')}>
                          <Section title="重量/包装" required className="ep-section--split">
                            <div className="ep-stack-field">
                              <span className="ep-field__label">包装后重量</span>
                              <div className="ep-weight-line">
                                <Stepper />
                                <span className="ep-unit">公斤/件</span>
                                <Checkbox label="自定义重量" />
                              </div>
                            </div>
                            <span className="ep-field__label">包装尺寸</span>
                            <div className="ep-size-line">
                              <Stepper />
                              <span className="ep-hint">长 CM</span>
                            </div>
                            <div className="ep-size-line">
                              <Stepper />
                              <span className="ep-hint">宽 CM</span>
                            </div>
                            <div className="ep-size-line">
                              <Stepper />
                              <span className="ep-hint">高 CM</span>
                            </div>
                          </Section>

                          <Section
                            title="货源/系统信息"
                            count="1/20"
                            className="ep-section--split"
                            innerRef={setSectionRef('source')}
                          >
                            <div className="ep-stack-field">
                              <span className="ep-field__label">货源1</span>
                              <div className="ep-inline-actions">
                                <SelectBox placeholder="请选择来源网站" />
                                <SelectBox placeholder="请选择" />
                              </div>
                            </div>
                            <div className="ep-inline-actions">
                              <button type="button" className="ep-btn ep-btn--primary ep-btn--tiny">
                                <Plus size={11} />
                                新增
                              </button>
                            </div>
                            <div className="ep-inline-field">
                              <span className="ep-field__label">父sku</span>
                              <input className="ep-input" placeholder="请输入父sku" />
                            </div>
                            <div className="ep-inline-field">
                              <span className="ep-field__label">标签</span>
                              <button type="button" className="ep-tag-btn" aria-label="编辑标签">
                                <Pencil size={14} />
                              </button>
                            </div>
                          </Section>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : tab === 'detail' ? (
                  <div className="ep-editor">
                    <div className="ep-tpl-bar">
                      <div className="ep-tpl-select">
                        <input readOnly placeholder="选择已有详情模板快速替换" />
                        <ChevronDown size={12} />
                      </div>
                      <button type="button" className="ep-btn ep-btn--primary-plain">
                        创建详情模板
                      </button>
                      <button type="button" className="ep-btn ep-btn--default">
                        管理详情模板
                      </button>
                    </div>
                    <div className="ep-quill-bar">
                      <span className="ep-quill-group">
                        <button type="button" className="ep-quill-btn ep-quill-btn--b">B</button>
                        <button type="button" className="ep-quill-btn ep-quill-btn--i">I</button>
                        <button type="button" className="ep-quill-btn ep-quill-btn--u">U</button>
                      </span>
                      <span className="ep-quill-group">
                        <button type="button" className="ep-quill-btn ep-quill-btn--wide">
                          默认大小
                          <ChevronDown size={10} />
                        </button>
                        <button type="button" className="ep-quill-btn">
                          <span className="ep-quill-color" />
                        </button>
                        <button type="button" className="ep-quill-btn">
                          <List size={15} />
                        </button>
                        <button type="button" className="ep-quill-btn">
                          <span className="ep-quill-ol">1.</span>
                        </button>
                        <button type="button" className="ep-quill-btn">
                          <span className="ep-quill-align" />
                        </button>
                        <button type="button" className="ep-quill-btn">
                          <ImageIcon size={15} />
                        </button>
                        <button type="button" className="ep-quill-btn">
                          <span className="ep-quill-clear">T</span>
                        </button>
                      </span>
                      <span className="ep-quill-hint">支持粘贴图片、批量排版</span>
                    </div>
                    <div className="ep-editor-scroll">
                      <div className="ep-editor-page">
                        <img src={detail1} alt="" />
                        <p>DESCRIPTION</p>
                        <p className="ep-editor-strong ep-editor-red">4GB RAM+64GBROM or 4GB+128GB SHOW 5G 16+1TB</p>
                        <p className="ep-editor-strong">Shipping</p>
                        <p>US warehouse logistics: UPS or USPS or FedEx</p>
                        <p>Order 10pcs or more, shipping from China, Fedex/UPS express shipping, free shipping.</p>
                        <p>Please choose the corresponding warehouse to send your parcel when ordering!</p>
                        <p>Products will be shipped within 24-48 hours after you place your order.</p>
                        <p>You can expect to receive your package in about 7-10 days.</p>
                        <p>In order to deliver goods smoothly and quickly, we may choose other delivery methods to deliver goods.</p>
                        <p>The product quality will be carefully checked before shipping and the package will be packed tightly to avoid damage during shipping.</p>
                        <p className="ep-editor-strong">Returns and refunds</p>
                        <p>We do not accept any unreasonable refunds from customers</p>
                        <p>All products are 100% strictly inspected and properly packed before shipment.</p>
                        <img src={detail2} alt="" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="ep-log">
                    <div className="ep-log__empty">
                      <FileText size={28} />
                      <span>暂无编辑日志</span>
                    </div>
                  </div>
                )}
              </main>
            </div>

            <footer className="ep-footer">
              <ComplianceEntry
                checking={compliance.checking}
                hasRecord={compliance.hasRecord}
                onDetect={() =>
                  compliance.detect(() => {
                    setComplianceOpen(true);
                  })
                }
                onViewRecords={() => setComplianceOpen(true)}
                onNoRecords={() => showToast('暂无检测记录，完成一次检测后可查看')}
              />
              <button type="button" className="ep-btn ep-btn--default ep-btn--lg" onClick={() => setVisible(false)}>
                关闭
              </button>
              <button
                type="button"
                className="ep-btn ep-btn--primary ep-btn--lg"
                onClick={() => showToast('保存成功')}
              >
                保存
              </button>
              <button
                type="button"
                className="ep-btn ep-btn--primary ep-btn--lg"
                onClick={() => showToast('已保存并发布')}
              >
                保存并发布
              </button>
            </footer>
          </div>
        </div>
      </div>
      <AiVideoDialog
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        onGenerate={handleAiGenerate}
        onRequestStop={handleStopGeneration}
        failed={aiJob?.status === 'failed'}
        onRetry={handleRetryAiJob}
        onCancel={handleStopGeneration}
      />
      <ComplianceDialog
        open={complianceOpen && compliance.hasRecord}
        items={compliance.items}
        itemPreviews={itemPreviews}
        conclusionPreview={conclusionPreview}
        retryingCode={compliance.retryingCode}
        onClose={() => setComplianceOpen(false)}
        onRetry={(code) => {
          // 演示态下点重检：先退出该卡片的演示状态，再跑真实重检
          if (itemPreviews[code]) setProtoDevState({ [`compliance_item_state_${code}`]: 'follow' });
          compliance.retryItem(code);
          const def = ITEM_DEFS.find((item) => item.code === code);
          if (def) showToast(`已重新检测「${def.name}」，本次消耗 xx 算力`);
        }}
        onFeedback={(code, hitIndex, feedback) => compliance.saveFeedback(code, hitIndex, feedback)}
      />
      <AnnotationViewer
        source={annotationSourceDocument as unknown as AnnotationSourceDocument}
        options={{
          currentPageId: (() => {
            const hashPageId = new URLSearchParams(window.location.hash.replace(/^#/, '')).get('page');
            const searchPageId = new URLSearchParams(window.location.search.replace(/^\?/, '')).get('page');
            const pageId = hashPageId || searchPageId;
            return typeof pageId === 'string' && /^[a-z0-9-]+$/u.test(pageId)
              ? pageId
              : 'edit-product-dialog-v2';
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
