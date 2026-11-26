/**
 * @name 商品采集
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './style.css';

import logoBadge from './assets/logo-badge.png';
import icSun from './assets/icons/sun.svg';
import icHelp from './assets/icons/help.svg';
import icCrown from './assets/icons/crown.svg';
import icCaret from './assets/icons/caret-down.svg';
import icChevron from './assets/icons/chevron-down.svg';
import icCalendar from './assets/icons/calendar.svg';
import icGear from './assets/icons/gear.svg';
import icHeadset from './assets/icons/headset.svg';
import icChevLeft from './assets/icons/chevron-left.svg';
import icChevRight from './assets/icons/chevron-right.svg';

import platAmazon from './assets/platforms/amazon.png';
import plat1688 from './assets/platforms/1688.png';
import platTemu from './assets/platforms/temu.png';
import platAli from './assets/platforms/aliexpress.png';
import platDhgate from './assets/platforms/dhgate.png';
import platShein from './assets/platforms/shein.png';
import icExternal from './assets/platforms/external-link.png';

import fav1 from './assets/products/fav-1.png';
import fav2 from './assets/products/fav-2.png';
import fav3 from './assets/products/fav-3.png';
import fav4 from './assets/products/fav-4.png';
import fav5 from './assets/products/fav-5.png';
import fav6 from './assets/products/fav-6.png';
import fav7 from './assets/products/fav-7.png';
import fav8 from './assets/products/fav-8.png';
import fav9 from './assets/products/fav-9.png';
import fav10 from './assets/products/fav-10.png';

import rec1 from './assets/products/rec-1.jpg';
import rec2 from './assets/products/rec-2.jpg';
import rec3 from './assets/products/rec-3.jpg';
import rec4 from './assets/products/rec-4.png';
import rec6 from './assets/products/rec-6.png';
import rec7 from './assets/products/rec-7.jpg';
import rec8 from './assets/products/rec-8.png';
import rec9 from './assets/products/rec-9.jpg';
import rec10 from './assets/products/rec-10.jpg';

const NAV_ITEMS = ['首页', '商品', '交易', '采购', '物流', '报表', '系统', '工具箱', '即时咨询'];

const PLATFORMS = [
  { name: '亚马逊', icon: platAmazon, href: 'https://www.amazon.com' },
  { name: '1688', icon: plat1688, href: 'https://www.1688.com' },
  { name: 'Temu', icon: platTemu, href: 'https://www.temu.com' },
  { name: '速卖通', icon: platAli, href: 'https://www.aliexpress.com' },
  { name: '敦煌网', icon: platDhgate, href: 'https://www.dhgate.com' },
  { name: 'SHEIN', icon: platShein, href: 'https://www.shein.com' },
];

const SOURCE_OPTIONS = ['亚马逊', '1688', 'Temu', '速卖通', '敦煌网', 'SHEIN'];
const STATUS_OPTIONS = ['待采集', '采集中', '成功', '失败'];
const PAGE_SIZES = [10, 20, 30, 50, 100, 200, 500];
const ACCOUNT = 'licanrong@ygq123456';

type SubTab = 'link' | 'shop' | 'fav' | 'records';
type RunStatus = 'pending' | 'running' | 'success' | 'fail';
type FavStatus = '采集中' | '失败' | '成功';

interface FavRow {
  id: string;
  thumb: string;
  title: string;
  href: string;
  source: string;
  price: string;
  sales: string;
  time: string;
  status: FavStatus;
}

interface RecRow {
  id: string;
  thumb: string;
  title: string;
  href: string;
  source: string;
  price: string;
  time: string;
  status: '成功' | '失败';
  account: string;
  reason: string;
}

interface LogRow {
  id: string;
  link: string;
  platform: string;
  status: RunStatus;
  time: string;
}

const FAV_BASE: Omit<FavRow, 'id'>[] = [
  {
    thumb: fav1,
    title: '凯家平替商务通勤高品质户外鞋轻便透气徒步鞋男款防滑运动休闲鞋',
    href: 'https://detail.1688.com/offer/1036539712492.html',
    source: '1688',
    price: '127',
    sales: '1000',
    time: '2026-11-13 15:45:23',
    status: '采集中',
  },
  {
    thumb: fav2,
    title: '26新款春秋男鞋高帮鞋黑白大倒三角鞋牛皮大码48厚底情侣欧美',
    href: 'https://detail.1688.com/offer/1026765988170.html',
    source: '1688',
    price: '0',
    sales: '0',
    time: '2026-11-13 15:45:10',
    status: '失败',
  },
  {
    thumb: fav3,
    title: '【批发】外贸跨境爆款男鞋大码软底休闲运动鞋男款户外徒步登山鞋',
    href: 'https://detail.1688.com/offer/972199809366.html',
    source: '1688',
    price: '100',
    sales: '0',
    time: '2026-11-13 15:45:09',
    status: '采集中',
  },
  {
    thumb: fav4,
    title: '纽巴仑574二代男鞋运动鞋n字女鞋跑步鞋增高透气情侣休闲鞋春秋',
    href: 'https://detail.1688.com/offer/949077512093.html',
    source: '1688',
    price: '89',
    sales: '0',
    time: '2026-11-13 15:45:08',
    status: '采集中',
  },
  {
    thumb: fav5,
    title: '跨境男鞋新款秋季软底防滑真皮包头工装鞋低帮系带厚底户外休闲鞋',
    href: 'https://detail.1688.com/offer/758297890959.html',
    source: '1688',
    price: '0',
    sales: '0',
    time: '2026-11-13 15:45:06',
    status: '失败',
  },
  {
    thumb: fav6,
    title: '【原版原标可扫码】拉夫劳伦夹克立领短款外套卡其色上衣爆款女款',
    href: 'https://detail.1688.com/offer/1080318499609.html',
    source: '1688',
    price: '214',
    sales: '0',
    time: '2026-11-13 15:43:44',
    status: '采集中',
  },
  {
    thumb: fav7,
    title: '跨境男鞋新款秋季软底防滑真皮包头工装鞋低帮系带厚底户外休闲鞋',
    href: 'https://detail.1688.com/offer/758297890959.html',
    source: '1688',
    price: '98',
    sales: '0',
    time: '2026-11-13 15:43:43',
    status: '采集中',
  },
  {
    thumb: fav8,
    title: '且买且惜~2000+鸟家情侣户外防风连帽立领抓绒卫衣外套男女秋冬新',
    href: 'https://detail.1688.com/offer/920829732855.html',
    source: '1688',
    price: '84.99',
    sales: '700',
    time: '2026-11-13 15:43:43',
    status: '采集中',
  },
  {
    thumb: fav9,
    title: '出口日本轻薄绒棉服男立领90白棉内胆2026新款男生大码冬装外套',
    href: 'https://detail.1688.com/offer/744856340342.html',
    source: '1688',
    price: '34',
    sales: '3600',
    time: '2026-11-13 15:43:41',
    status: '采集中',
  },
  {
    thumb: fav10,
    title: '鼎固跨境四季劳保鞋男士防砸防刺穿工作鞋轻便透气耐磨安全工作鞋',
    href: 'https://detail.1688.com/offer/1073822874269.html',
    source: '1688',
    price: '82',
    sales: '22000',
    time: '2026-11-13 15:43:25',
    status: '采集中',
  },
];

const REC_BASE: Omit<RecRow, 'id'>[] = [
  {
    thumb: rec1,
    title: 'https://www.aliexpress.us/item/3256809057658646.html?verify=linktest1121b',
    href: 'https://www.aliexpress.us/item/3256809057658646.html?verify=linktest1121b',
    source: '速卖通',
    price: '1.09',
    time: '2026-11-21 17:02:13',
    status: '成功',
    account: ACCOUNT,
    reason: '-',
  },
  {
    thumb: rec2,
    title:
      'Comics Cute Chiikawas-s Phone Case For iPhone 18 17e 17 16e 16 15 14 13 12 11 Pro Max X XR XSMAX Air Plus Transparent Soft Cover',
    href: 'https://www.aliexpress.us/item/3256813306307472.html',
    source: '速卖通',
    price: '2.79',
    time: '2026-11-21 16:55:49',
    status: '成功',
    account: ACCOUNT,
    reason: '-',
  },
  {
    thumb: rec3,
    title: 'https://www.aliexpress.us/item/3256813129294912.html?verify=1121test2',
    href: 'https://www.aliexpress.us/item/3256813129294912.html?verify=1121test2',
    source: '速卖通',
    price: '1.09',
    time: '2026-11-21 16:54:40',
    status: '成功',
    account: ACCOUNT,
    reason: '-',
  },
  {
    thumb: rec4,
    title: 'https://detail.1688.com/offer/1032932502344.html?verify=1121test',
    href: 'https://detail.1688.com/offer/1032932502344.html?verify=1121test',
    source: '1688',
    price: '38',
    time: '2026-11-21 16:52:41',
    status: '成功',
    account: ACCOUNT,
    reason: '-',
  },
  {
    thumb: '',
    title: 'https://www.aliexpress.us/item/3256813129294912.html?verify=1121test',
    href: 'https://www.aliexpress.us/item/3256813129294912.html?verify=1121test',
    source: '速卖通',
    price: '0',
    time: '2026-11-21 16:51:24',
    status: '失败',
    account: ACCOUNT,
    reason: '采集被中断或超时',
  },
  {
    thumb: rec6,
    title: 'https://detail.1688.com/offer/936037691195.html?offerId=936037691195',
    href: 'https://detail.1688.com/offer/936037691195.html?offerId=936037691195',
    source: '1688',
    price: '28',
    time: '2026-11-21 14:17:28',
    status: '成功',
    account: 'ygq123456',
    reason: '-',
  },
  {
    thumb: rec7,
    title: 'https://www.dhgate.com/product/2026suitable-for-iphone-18-pro-max-advanced/1130413312.html',
    href: 'https://www.dhgate.com/product/2026suitable-for-iphone-18-pro-max-advanced/1130413312.html',
    source: '敦煌网',
    price: '59.89',
    time: '2026-11-18 17:50:12',
    status: '成功',
    account: ACCOUNT,
    reason: '-',
  },
  {
    thumb: rec8,
    title:
      'https://detail.1688.com/offer/1099240069043.html?spm=a26352.13672862.offerlist.22.57541bca8VWvOw&cosite=-&tracelog=p4p&_p_isad=1&clickid=19d4a490ae324d359cd103965ce8944b&sessionid=51f63082c8166543e807d09183619d7d',
    href: 'https://detail.1688.com/offer/1099240069043.html',
    source: '1688',
    price: '9.26',
    time: '2026-11-17 18:43:31',
    status: '成功',
    account: ACCOUNT,
    reason: '-',
  },
  {
    thumb: rec9,
    title: 'https://www.dhgate.com/product/furniture-scratchers-tree-house-tower-for/1060394845.html',
    href: 'https://www.dhgate.com/product/furniture-scratchers-tree-house-tower-for/1060394845.html',
    source: '敦煌网',
    price: '238.63',
    time: '2026-11-17 16:39:09',
    status: '成功',
    account: 'ygq123456',
    reason: '-',
  },
  {
    thumb: rec10,
    title: 'https://www.dhgate.com/product/super-soft-finger-toothbrush-teddy-brush/1101070541.html',
    href: 'https://www.dhgate.com/product/super-soft-finger-toothbrush-teddy-brush/1101070541.html',
    source: '敦煌网',
    price: '9.14',
    time: '2026-11-17 16:38:27',
    status: '成功',
    account: 'ygq123456',
    reason: '-',
  },
];

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function formatTime(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(
    date.getMinutes(),
  )}:${pad(date.getSeconds())}`;
}

function buildFavorites(): FavRow[] {
  const last = new Date('2026-11-13T15:43:25');
  return Array.from({ length: 24 }, (_, index) => {
    if (index < FAV_BASE.length) return { ...FAV_BASE[index], id: `fav-${index + 1}` };
    const row = FAV_BASE[index % FAV_BASE.length];
    const time = new Date(last.getTime() - (index - FAV_BASE.length + 1) * 9 * 60 * 1000);
    const failed = index % 7 === 4;
    return {
      ...row,
      id: `fav-${index + 1}`,
      time: formatTime(time),
      status: failed ? '失败' : row.status,
      price: failed ? '0' : row.price,
      sales: index % 3 === 0 ? row.sales : '0',
    };
  });
}

function buildRecords(): RecRow[] {
  const last = new Date('2026-11-17T16:38:27');
  return Array.from({ length: 982 }, (_, index) => {
    if (index < REC_BASE.length) return { ...REC_BASE[index], id: `rec-${index + 1}` };
    const row = REC_BASE[index % REC_BASE.length];
    const time = new Date(last.getTime() - (index - REC_BASE.length + 1) * 37 * 60 * 1000);
    const failed = row.status === '失败' || index % 29 === 7;
    return {
      ...row,
      id: `rec-${index + 1}`,
      time: formatTime(time),
      status: failed ? '失败' : '成功',
      reason: failed ? '采集被中断或超时' : '-',
      price: failed ? '0' : row.price,
    };
  });
}

function detectPlatform(link: string) {
  const lower = link.toLowerCase();
  if (lower.includes('1688.com')) return '1688';
  if (lower.includes('aliexpress')) return '速卖通';
  if (lower.includes('dhgate')) return '敦煌网';
  if (lower.includes('temu')) return 'Temu';
  if (lower.includes('shein')) return 'SHEIN';
  if (lower.includes('amazon')) return '亚马逊';
  return '其他';
}

function platformIcon(name: string) {
  return PLATFORMS.find((item) => item.name === name)?.icon;
}

function linkLabel(link: string) {
  try {
    const url = new URL(link);
    return `${url.hostname}${url.pathname}`;
  } catch (error) {
    return link;
  }
}

function normalizeLink(link: string) {
  try {
    const url = new URL(link);
    return `${url.hostname}${url.pathname}`.toLowerCase().replace(/\/$/, '');
  } catch (error) {
    return link.trim().toLowerCase().replace(/\/$/, '');
  }
}

function PageCheckbox({
  checked,
  indeterminate,
  onClick,
  label,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onClick: (event: React.MouseEvent) => void;
  label?: string;
}) {
  return (
    <span
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      tabIndex={0}
      className={`pc-check${checked || indeterminate ? ' is-checked' : ''}${indeterminate ? ' is-indeterminate' : ''}`}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick(event as unknown as React.MouseEvent);
        }
      }}
    >
      {indeterminate ? <i className="pc-check-minus" /> : checked ? <i className="pc-check-tick" /> : null}
    </span>
  );
}

function ToastHost({ toasts }: { toasts: { id: number; text: string }[] }) {
  return createPortal(
    <div className="pc-toasts">
      {toasts.map((toast) => (
        <div className="pc-toast" key={toast.id}>
          <i className="pc-toast-icon">i</i>
          {toast.text}
        </div>
      ))}
    </div>,
    document.body,
  );
}

function Select({
  value,
  placeholder,
  options,
  width,
  onChange,
}: {
  value: string;
  placeholder: string;
  options: string[];
  width?: number;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ left: 0, top: 0, width: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const place = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) setPos({ left: rect.left, top: rect.bottom + 4, width: rect.width });
  };

  useEffect(() => {
    if (!open) return;
    place();
    const reposition = () => place();
    const close = (event: MouseEvent) => {
      if (!triggerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <div
        ref={triggerRef}
        className="pc-input pc-select"
        style={{ width }}
        tabIndex={0}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className={value ? 'pc-input-text' : 'pc-input-ph'}>{value || placeholder}</span>
        <img className="pc-chev" src={icChevron} alt="" />
      </div>
      {open
        ? createPortal(
            <div
              className="pc-select-menu"
              style={{ left: pos.left, top: pos.top, minWidth: Math.max(pos.width, 140) }}
            >
              {options.map((option) => (
                <div
                  key={option}
                  className={`pc-select-option${option === value ? ' is-active' : ''}`}
                  onClick={() => {
                    onChange(option);
                    setOpen(false);
                  }}
                >
                  {option}
                </div>
              ))}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

function DateRange({
  start,
  end,
  onChange,
  width,
}: {
  start: string;
  end: string;
  onChange: (start: string, end: string) => void;
  width?: number;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ left: 0, top: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) setPos({ left: rect.left, top: rect.bottom + 4 });
    const close = (event: MouseEvent) => {
      if (!triggerRef.current?.contains(event.target as Node)) {
        const menu = document.querySelector('.pc-date-menu');
        if (!menu?.contains(event.target as Node)) setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <div className="pc-range" style={{ width }}>
        <div ref={triggerRef} className="pc-input pc-date" onClick={() => setOpen((prev) => !prev)}>
          <img className="pc-cal" src={icCalendar} alt="" />
          <span className={start ? 'pc-input-text' : 'pc-input-ph'}>{start || '开始日期'}</span>
        </div>
        <span className="pc-range-to">至</span>
        <div className="pc-input pc-date" onClick={() => setOpen((prev) => !prev)}>
          <span className={end ? 'pc-input-text' : 'pc-input-ph'}>{end || '结束日期'}</span>
        </div>
      </div>
      {open
        ? createPortal(
            <div className="pc-date-menu" style={{ left: pos.left, top: pos.top }}>
              <div className="pc-date-row">
                <label>开始日期</label>
                <input type="date" value={start} onChange={(event) => onChange(event.target.value, end)} />
              </div>
              <div className="pc-date-row">
                <label>结束日期</label>
                <input type="date" value={end} onChange={(event) => onChange(start, event.target.value)} />
              </div>
              <div className="pc-date-actions">
                <button type="button" className="pc-link-btn" onClick={() => onChange('', '')}>
                  清空
                </button>
                <button type="button" className="pc-btn pc-btn-primary pc-btn-sm" onClick={() => setOpen(false)}>
                  确定
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

function PriceRange({
  min,
  max,
  onChange,
}: {
  min: string;
  max: string;
  onChange: (min: string, max: string) => void;
}) {
  const step = (value: string, direction: 1 | -1) => {
    const current = Number(value || 0);
    return String(Math.max(0, current + direction));
  };
  return (
    <div className="pc-price-range">
      <div className="pc-input pc-price">
        <input
          value={min}
          placeholder=""
          onChange={(event) => onChange(event.target.value.replace(/[^\d.]/g, ''), max)}
        />
        <span className="pc-steps">
          <button type="button" onClick={() => onChange(step(min, 1), max)} aria-label="增加">
            <b className="pc-step-up" />
          </button>
          <button type="button" onClick={() => onChange(step(min, -1), max)} aria-label="减少">
            <b className="pc-step-down" />
          </button>
        </span>
      </div>
      <span className="pc-range-dash">-</span>
      <div className="pc-input pc-price">
        <input
          value={max}
          placeholder=""
          onChange={(event) => onChange(min, event.target.value.replace(/[^\d.]/g, ''))}
        />
        <span className="pc-steps">
          <button type="button" onClick={() => onChange(min, step(max, 1))} aria-label="增加">
            <b className="pc-step-up" />
          </button>
          <button type="button" onClick={() => onChange(min, step(max, -1))} aria-label="减少">
            <b className="pc-step-down" />
          </button>
        </span>
      </div>
    </div>
  );
}

function StatusTag({ status }: { status: string }) {
  const cls =
    status === '成功' ? 'is-success' : status === '失败' ? 'is-fail' : status === '采集中' ? 'is-running' : 'is-pending';
  return <span className={`pc-tag ${cls}`}>{status}</span>;
}

const SKU_PRICE_TIP = '采集只支持前100个sku价格，采集sku价格会很慢，甚至失败，请谨慎开启';
const REALTIME_TIP =
  '开启后从网上采集该商品的最新数据，耗时较长；\n关闭则采集平台上其他租户已采集并保存的商品数据，速度更快，\n但可能不是当前最新数据。';

interface CollectSettings {
  duplicate: string;
  blockWords: string;
  autoTranslate: string;
  video: string;
  detailFallback: string;
  realtime: string;
  skuPrice: string;
}

interface SettingsOption {
  value: string;
  label: string;
}

interface SettingsRowDef {
  key: keyof CollectSettings;
  label: string;
  type: 'radio' | 'switch';
  options?: SettingsOption[];
  tip?: string;
  placement?: 'top' | 'bottom';
}

const SETTINGS_ROWS: SettingsRowDef[] = [
  { key: 'realtime', label: '实时采集', type: 'switch', tip: REALTIME_TIP, placement: 'bottom' },
  {
    key: 'duplicate',
    label: '重复采集',
    type: 'radio',
    options: [
      { value: 'ask', label: '询问' },
      { value: 'add', label: '新增' },
      { value: 'block', label: '阻止' },
      { value: 'overwrite', label: '覆盖' },
    ],
  },
  { key: 'blockWords', label: '采集时自动检测违禁词并拦截', type: 'switch' },
  { key: 'autoTranslate', label: '采集时自动翻译', type: 'switch' },
  { key: 'video', label: '采集视频', type: 'switch' },
  { key: 'skuPrice', label: '采集每个sku价格', type: 'switch', tip: SKU_PRICE_TIP },
  { key: 'detailFallback', label: '当无详情时自动附加标题和第2-第4张主图作为详情', type: 'switch' },
];

const DEFAULT_COLLECT_SETTINGS: CollectSettings = {
  duplicate: 'ask',
  blockWords: 'no',
  autoTranslate: 'no',
  video: 'yes',
  detailFallback: 'yes',
  realtime: 'no',
  skuPrice: 'no',
};

function SettingsRowControl({
  row,
  value,
  onChange,
}: {
  row: SettingsRowDef;
  value: string;
  onChange: (value: string) => void;
}) {
  if (row.type === 'switch') {
    const on = value === 'yes';
    return (
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={row.label}
        className={`pc-cs-switch${on ? ' is-on' : ''}`}
        onClick={() => onChange(on ? 'no' : 'yes')}
      >
        <i />
      </button>
    );
  }
  return (
    <div className="pc-cs-options" role="radiogroup">
      {(row.options || []).map((option) => (
        <label className={`pc-cs-radio${value === option.value ? ' is-checked' : ''}`} key={option.value}>
          <input
            type="radio"
            name={`pc-cs-${row.key}`}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
          <span className="pc-cs-radio-dot" />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
}

function SettingsRow({
  row,
  value,
  onChange,
}: {
  row: SettingsRowDef;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="pc-cs-row">
      <div className="pc-cs-row-label">
        <span className="pc-cs-label-text">{row.label}</span>
        {row.tip ? (
          <span className="pc-cs-help-wrap">
            <button type="button" className="pc-cs-help" aria-label={row.tip}>
              ?
            </button>
            <span className={`pc-cs-tip${row.placement === 'bottom' ? ' is-bottom' : ''}`} role="tooltip">
              {row.tip}
            </span>
          </span>
        ) : null}
      </div>
      <SettingsRowControl row={row} value={value} onChange={onChange} />
    </div>
  );
}

function CollectSettingsDialog({
  value,
  onSave,
  onClose,
}: {
  value: CollectSettings;
  onSave: (value: CollectSettings) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<CollectSettings>(value);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <div className="pc-cs-mask">
      <div className="pc-cs-dialog" role="dialog" aria-modal="true" aria-labelledby="pc-cs-title">
        <div className="pc-cs-head">
          <h2 className="pc-cs-title" id="pc-cs-title">
            采集设置
          </h2>
          <button type="button" className="pc-cs-close" aria-label="关闭" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="pc-cs-body">
          {SETTINGS_ROWS.map((row) => (
            <SettingsRow
              key={row.key}
              row={row}
              value={draft[row.key]}
              onChange={(next) => setDraft((prev) => ({ ...prev, [row.key]: next }))}
            />
          ))}
        </div>
        <div className="pc-cs-foot">
          <button type="button" className="pc-cs-btn" onClick={onClose}>
            取消
          </button>
          <button type="button" className="pc-cs-btn pc-cs-btn-primary" onClick={() => onSave(draft)}>
            保存
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

type DuplicateMode = 'add' | 'block' | 'overwrite';

const DUPLICATE_MODES: { value: DuplicateMode; label: string }[] = [
  { value: 'add', label: '新增' },
  { value: 'block', label: '阻止' },
  { value: 'overwrite', label: '覆盖' },
];

function DuplicateRadioGroup({
  name,
  value,
  onChange,
}: {
  name: string;
  value: DuplicateMode;
  onChange: (value: DuplicateMode) => void;
}) {
  return (
    <div className="pc-cs-options" role="radiogroup">
      {DUPLICATE_MODES.map((option) => (
        <label className={`pc-cs-radio${value === option.value ? ' is-checked' : ''}`} key={option.value}>
          <input
            type="radio"
            name={name}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
          <span className="pc-cs-radio-dot" />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
}

function DuplicateDialog({
  duplicates,
  onConfirm,
  onCancel,
  onOpenSettings,
}: {
  duplicates: string[];
  onConfirm: (mode: DuplicateMode, dontAsk: boolean, futureMode: DuplicateMode) => void;
  onCancel: () => void;
  onOpenSettings: () => void;
}) {
  const [mode, setMode] = useState<DuplicateMode>('block');
  const [dontAsk, setDontAsk] = useState(false);
  const [futureMode, setFutureMode] = useState<DuplicateMode>('block');

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return createPortal(
    <div className="pc-cs-mask">
      <div className="pc-cs-dialog pc-dup-dialog" role="dialog" aria-modal="true" aria-labelledby="pc-dup-title">
        <div className="pc-cs-head">
          <h2 className="pc-cs-title" id="pc-dup-title">
            重复采集
          </h2>
          <button type="button" className="pc-cs-close" aria-label="关闭" onClick={onCancel}>
            ×
          </button>
        </div>
        <div className="pc-dup-body">
          <p className="pc-dup-desc">检测到 {duplicates.length} 个链接已采集过，请选择本次处理方式。</p>
          <div className="pc-dup-list">
            {duplicates.map((link) => (
              <div className="pc-dup-item" key={link}>
                <span className="pc-dup-source">{detectPlatform(link)}</span>
                <span className="pc-dup-link" title={link}>
                  {linkLabel(link)}
                </span>
              </div>
            ))}
          </div>
          <div className="pc-dup-section">
            <span className="pc-dup-label">本次处理</span>
            <DuplicateRadioGroup name="pc-dup-mode" value={mode} onChange={setMode} />
          </div>
          <label className="pc-dup-remember">
            <input type="checkbox" checked={dontAsk} onChange={(event) => setDontAsk(event.target.checked)} />
            <span className="pc-dup-check" />
            不再提醒
          </label>
          {dontAsk ? (
            <div className="pc-dup-future">
              <div className="pc-dup-section">
                <span className="pc-dup-label">以后默认</span>
                <DuplicateRadioGroup name="pc-dup-future" value={futureMode} onChange={setFutureMode} />
              </div>
              <p className="pc-dup-hint">
                以后遇到重复采集将直接按此处理，可在
                <button type="button" className="pc-dup-settings-link" onClick={onOpenSettings}>
                  采集设置 → 重复采集
                </button>
                中修改。
              </p>
            </div>
          ) : null}
        </div>
        <div className="pc-cs-foot">
          <button type="button" className="pc-cs-btn" onClick={onCancel}>
            取消
          </button>
          <button type="button" className="pc-cs-btn pc-cs-btn-primary" onClick={() => onConfirm(mode, dontAsk, futureMode)}>
            确定
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function Pagination({
  total,
  page,
  pageSize,
  onChange,
}: {
  total: number;
  page: number;
  pageSize: number;
  onChange: (page: number, pageSize: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const [jump, setJump] = useState('');
  const [sizeOpen, setSizeOpen] = useState(false);
  const sizeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sizeOpen) return;
    const close = (event: MouseEvent) => {
      if (!sizeRef.current?.contains(event.target as Node)) setSizeOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [sizeOpen]);

  const items: (number | '...')[] = [];
  if (pages <= 7) {
    for (let i = 1; i <= pages; i += 1) items.push(i);
  } else if (page <= 4) {
    items.push(1, 2, 3, 4, 5, 6, '...', pages);
  } else if (page >= pages - 3) {
    items.push(1, '...', pages - 5, pages - 4, pages - 3, pages - 2, pages - 1, pages);
  } else {
    items.push(1, '...', page - 1, page, page + 1, '...', pages);
  }

  return (
    <div className="pc-pagination">
      <span className="pc-total">共 {total} 条</span>
      <div className="pc-page-size-wrap" ref={sizeRef}>
        <div className="pc-page-size" onClick={() => setSizeOpen((prev) => !prev)}>
          {pageSize}条/页
          <img src={icChevron} alt="" />
        </div>
        {sizeOpen ? (
          <div className="pc-size-menu">
            {PAGE_SIZES.map((size) => (
              <div
                key={size}
                className={`pc-select-option${size === pageSize ? ' is-active' : ''}`}
                onClick={() => {
                  onChange(1, size);
                  setSizeOpen(false);
                }}
              >
                {size}条/页
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <button
        type="button"
        className={`pc-page-btn${page <= 1 ? ' is-disabled' : ''}`}
        onClick={() => page > 1 && onChange(page - 1, pageSize)}
      >
        <img src={icChevLeft} alt="" />
      </button>
      {items.map((item, index) =>
        item === '...' ? (
          <span className="pc-ellipsis" key={`e-${index}`}>
            ...
          </span>
        ) : (
          <button
            type="button"
            key={item}
            className={`pc-page-btn${item === page ? ' is-active' : ''}`}
            onClick={() => onChange(item, pageSize)}
          >
            {item}
          </button>
        ),
      )}
      <button
        type="button"
        className={`pc-page-btn${page >= pages ? ' is-disabled' : ''}`}
        onClick={() => page < pages && onChange(page + 1, pageSize)}
      >
        <img src={icChevRight} alt="" />
      </button>
      <span className="pc-jump">
        前往
        <input
          value={jump}
          onChange={(event) => setJump(event.target.value.replace(/[^\d]/g, ''))}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && jump) {
              const target = Math.min(pages, Math.max(1, Number(jump)));
              onChange(target, pageSize);
              setJump('');
            }
          }}
        />
        页
      </span>
    </div>
  );
}

function EmptyRow({ text }: { text: string }) {
  return <div className="pc-empty-row">{text}</div>;
}

function TopBar() {
  return (
    <header className="pc-topbar">
      <img className="pc-logo" src={logoBadge} alt="骆驼队长" />
      <div className="pc-brand">
        <b>骆驼队长</b>
        <span>智慧运营中台</span>
      </div>
      <nav className="pc-nav">
        {NAV_ITEMS.map((item) => (
          <a key={item} className={`pc-nav-item${item === '商品' ? ' is-active' : ''}`} href="#">
            {item}
          </a>
        ))}
      </nav>
      <div className="pc-topbar-right">
        <span className="pc-task">
          <TaskIcon />
          <span className="pc-task-num">88</span>
          任务管理器
        </span>
        <img className="pc-tool-icon" src={icSun} alt="切换主题" />
        <img className="pc-tool-icon" src={icGear} alt="设置" />
        <img className="pc-tool-icon" src={icHelp} alt="帮助" />
        <span className="pc-bell-wrap">
          <BellIcon />
          <i className="pc-bell-dot" />
        </span>
        <span className="pc-vip">
          <img src={icCrown} alt="" />
          VIP3
        </span>
        <span className="pc-avatar">L</span>
        <img className="pc-caret" src={icCaret} alt="" />
      </div>
    </header>
  );
}

function TaskIcon() {
  return (
    <svg className="pc-task-icon" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 2.5h7.5L13 5v8.5H3z" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5 6.2h6M5 8.6h6M5 11h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M2.2 4.5v9h7.6" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg className="pc-bell" viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="M10 2.6a4.7 4.7 0 0 0-4.7 4.7v3.1L4 13h12l-1.3-2.6V7.3A4.7 4.7 0 0 0 10 2.6Z"
        fill="none"
        stroke="#606266"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M8.2 15.2a1.9 1.9 0 0 0 3.6 0" fill="none" stroke="#606266" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function PluginModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <div className="pc-modal-mask" onMouseDown={onClose}>
      <div
        className="pc-modal"
        role="dialog"
        aria-modal="true"
        aria-label="下载安装浏览器插件"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="pc-modal-head">
          <span>下载安装浏览器插件</span>
          <button type="button" className="pc-modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="pc-modal-body">
          <p>安装插件后，可直接在商品详情页点击采集，商品会自动进入采集队列。</p>
          <ol>
            <li>下载并解压浏览器插件安装包</li>
            <li>在浏览器扩展管理中开启开发者模式并加载插件</li>
            <li>登录骆驼队长后，在平台商品页点击插件图标即可采集</li>
          </ol>
        </div>
        <div className="pc-modal-foot">
          <button type="button" className="pc-btn" onClick={onClose}>
            取消
          </button>
          <button type="button" className="pc-btn pc-btn-primary" onClick={onClose}>
            我知道了
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function ProductCollection() {
  const [subTab, setSubTab] = useState<SubTab>('link');
  const [linkText, setLinkText] = useState('');
  const [shopText, setShopText] = useState('');
  const [linkError, setLinkError] = useState('');
  const [shopError, setShopError] = useState('');
  const [collectSettings, setCollectSettings] = useState<CollectSettings>(DEFAULT_COLLECT_SETTINGS);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [duplicatePrompt, setDuplicatePrompt] = useState<{ links: string[]; duplicates: string[] } | null>(null);
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [favorites, setFavorites] = useState<FavRow[]>(() => buildFavorites());
  const [records, setRecords] = useState<RecRow[]>(() => buildRecords());
  const [pluginOpen, setPluginOpen] = useState(false);
  const [toasts, setToasts] = useState<{ id: number; text: string }[]>([]);
  const toastId = useRef(0);
  const timers = useRef<number[]>([]);

  useEffect(
    () => () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
    },
    [],
  );

  const showToast = (text: string) => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, text }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((item) => item.id !== id)), 2600);
  };

  const linkLines = linkText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const existingLinkKeys = useMemo(
    () => new Set([...records, ...favorites].map((row) => normalizeLink(row.href))),
    [records, favorites],
  );

  const findDuplicates = (links: string[]) => links.filter((link) => existingLinkKeys.has(normalizeLink(link)));

  const pushRecord = (link: string, source: string, mode: DuplicateMode) => {
    setRecords((prev) => {
      const normalized = normalizeLink(link);
      let next = prev;
      if (mode === 'overwrite') {
        const index = prev.findIndex((row) => normalizeLink(row.href) === normalized);
        if (index >= 0) next = prev.filter((_, i) => i !== index);
      }
      return [
        {
          id: `rec-new-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
          thumb: REC_BASE.find((item) => item.source === source)?.thumb || rec1,
          title: link,
          href: link,
          source,
          price: '-',
          time: formatTime(new Date()),
          status: '成功',
          account: ACCOUNT,
          reason: '-',
        },
        ...next,
      ];
    });
  };

  const beginCollect = (links: string[], mode: DuplicateMode, duplicates: string[]) => {
    const duplicateKeys = new Set(duplicates.map((link) => normalizeLink(link)));
    const targets = mode === 'block' ? links.filter((link) => !duplicateKeys.has(normalizeLink(link))) : links;
    if (!targets.length) {
      showToast(`已跳过 ${duplicates.length} 个重复链接`);
      return;
    }
    const base = Date.now();
    const created: LogRow[] = targets.map((link, index) => ({
      id: `log-${base}-${index}`,
      link,
      platform: detectPlatform(link),
      status: 'pending',
      time: formatTime(new Date(base)),
    }));
    setLogs((prev) => [...created, ...prev]);
    created.forEach((row, index) => {
      const startTimer = window.setTimeout(() => {
        setLogs((prev) => prev.map((item) => (item.id === row.id ? { ...item, status: 'running' } : item)));
      }, 500 + index * 450);
      const endTimer = window.setTimeout(() => {
        const failed = /fail|error/i.test(row.link) || index % 8 === 7;
        setLogs((prev) =>
          prev.map((item) =>
            item.id === row.id
              ? { ...item, status: failed ? 'fail' : 'success', time: formatTime(new Date()) }
              : item,
          ),
        );
        if (!failed) pushRecord(row.link, row.platform, mode);
      }, 1600 + index * 450);
      timers.current.push(startTimer, endTimer);
    });
    const skipped = mode === 'block' ? duplicates.length : 0;
    showToast(
      skipped
        ? `已跳过 ${skipped} 个重复链接，提交 ${targets.length} 个采集任务`
        : `已提交 ${targets.length} 个采集任务`,
    );
  };

  const startCollect = () => {
    if (!linkLines.length) {
      setLinkError('请先粘贴商品链接');
      return;
    }
    setLinkError('');
    const duplicates = findDuplicates(linkLines);
    if (collectSettings.duplicate === 'ask' && duplicates.length) {
      setDuplicatePrompt({ links: linkLines, duplicates });
      return;
    }
    const mode: DuplicateMode =
      collectSettings.duplicate === 'add' ||
      collectSettings.duplicate === 'block' ||
      collectSettings.duplicate === 'overwrite'
        ? collectSettings.duplicate
        : 'add';
    beginCollect(linkLines, mode, duplicates);
  };

  const confirmDuplicates = (mode: DuplicateMode, dontAsk: boolean, futureMode: DuplicateMode) => {
    if (!duplicatePrompt) return;
    if (dontAsk) {
      setCollectSettings((prev) => ({ ...prev, duplicate: futureMode }));
    }
    const { links, duplicates } = duplicatePrompt;
    setDuplicatePrompt(null);
    beginCollect(links, mode, duplicates);
    if (dontAsk) showToast('已保存重复采集默认处理方式');
  };

  const readShop = () => {
    if (!shopText.trim()) {
      setShopError('请输入店铺首页的链接地址');
      return;
    }
    setShopError('');
    const id = `log-shop-${Date.now()}`;
    setLogs((prev) => [
      { id, link: shopText.trim(), platform: '敦煌网', status: 'running', time: formatTime(new Date()) },
      ...prev,
    ]);
    const timer = window.setTimeout(() => {
      setLogs((prev) => prev.map((item) => (item.id === id ? { ...item, status: 'success' } : item)));
    }, 1600);
    timers.current.push(timer);
    showToast('已提交店铺商品读取任务');
  };

  const logStats = useMemo(
    () => ({
      total: logs.length,
      success: logs.filter((item) => item.status === 'success').length,
      fail: logs.filter((item) => item.status === 'fail').length,
    }),
    [logs],
  );

  const renderLogCard = () => (
    <section className="pc-card pc-log-card">
      <div className="pc-log-head">
        <span className="pc-dot" />
        <span className="pc-log-title">采集日志</span>
        <span className="pc-stat pc-stat-total">任务总数 {logStats.total}</span>
        <span className="pc-stat pc-stat-success">成功 {logStats.success}</span>
        <span className="pc-stat pc-stat-fail">失败 {logStats.fail}</span>
        <button type="button" className="pc-link-btn pc-log-clear" onClick={() => setLogs([])}>
          清空日志
        </button>
      </div>
      <div className="pc-log-body">
        {logs.length === 0 ? (
          <div className="pc-log-empty">暂无采集日志</div>
        ) : (
          logs.map((row) => (
            <div className="pc-log-row" key={row.id}>
              <span className="pc-log-plat">
                {platformIcon(row.platform) ? <img src={platformIcon(row.platform)} alt="" /> : null}
                {row.platform}
              </span>
              <a className="pc-log-link" href={row.link} target="_blank" rel="noreferrer" title={row.link}>
                {linkLabel(row.link)}
              </a>
              <StatusTag status={row.status === 'success' ? '成功' : row.status === 'fail' ? '失败' : '采集中'} />
              <span className="pc-log-time">{row.time}</span>
            </div>
          ))
        )}
      </div>
    </section>
  );

  return (
    <div className="pc-page">
      <TopBar />
      <div className="pc-crumb">
        <span>商品</span>
        <i>/</i>
        <span>商品管理</span>
        <i>/</i>
        <span className="is-current">商品采集</span>
      </div>
      <div className="pc-main">
        <section className={`pc-card${subTab === 'fav' || subTab === 'records' ? ' pc-card-fill' : ''}`}>
          <div className="pc-tabs">
            <span className="pc-tab is-active">
              <span className="pc-tab-dot" />
              商品采集
            </span>
            <span className="pc-tab">认领中心</span>
            <span className="pc-tab">我的商品</span>
          </div>
          <div className="pc-subnav">
            <div className="pc-subnav-tabs">
              {(
                [
                  ['link', '链接采集'],
                  ['shop', '店铺采集'],
                  ['fav', '收藏夹采集'],
                  ['records', '采集记录'],
                ] as [SubTab, string][]
              ).map(([key, label]) => (
                <span
                  key={key}
                  className={`pc-subnav-item${subTab === key ? ' is-active' : ''}`}
                  onClick={() => setSubTab(key)}
                >
                  {label}
                </span>
              ))}
            </div>
            <button type="button" className="pc-plugin-link" onClick={() => setPluginOpen(true)}>
              下载安装浏览器插件
            </button>
          </div>

          {subTab === 'link' ? (
            <div className="pc-panel">
              <div className="pc-platform-row">
                <span className="pc-platform-title">支持采集平台</span>
                <div className="pc-platform-list">
                  {PLATFORMS.map((platform) => (
                    <a
                      key={platform.name}
                      className="pc-platform-chip"
                      href={platform.href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <img className="pc-platform-icon" src={platform.icon} alt="" />
                      <span>{platform.name}</span>
                      <img className="pc-platform-ext" src={icExternal} alt="" />
                    </a>
                  ))}
                </div>
              </div>
              <div className="pc-textarea-label">粘贴商品链接，每行一个链接，支持批量采集</div>
              <textarea
                className={`pc-textarea${linkError ? ' is-error' : ''}`}
                value={linkText}
                placeholder={`请粘贴商品链接，每行一个，例如：\nhttps://detail.1688.com/offer/1234567890.html\nhttps://www.dhgate.com/product/xxxxxxx.html`}
                onChange={(event) => {
                  setLinkText(event.target.value);
                  if (linkError) setLinkError('');
                }}
              />
              {linkError ? <div className="pc-field-error">{linkError}</div> : null}
              <div className="pc-form-foot">
                <span className="pc-import-count">已导入 {linkLines.length} 个任务链接</span>
                <div className="pc-form-actions">
                  <button
                    type="button"
                    className="pc-btn pc-btn-warn"
                    onClick={() => {
                      setLinkText('');
                      setLinkError('');
                    }}
                  >
                    清空链接
                  </button>
                  <button type="button" className="pc-btn pc-btn-blue" onClick={startCollect}>
                    开始采集
                  </button>
                  <button type="button" className="pc-settings-trigger" onClick={() => setSettingsOpen(true)}>
                    <img src={icGear} alt="" />
                    采集设置
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {subTab === 'shop' ? (
            <div className="pc-panel">
              <div className="pc-platform-row">
                <span className="pc-platform-title">支持采集平台</span>
                <div className="pc-platform-list">
                  {PLATFORMS.filter((platform) => platform.name === '敦煌网').map((platform) => (
                    <a
                      key={platform.name}
                      className="pc-platform-chip"
                      href={platform.href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <img className="pc-platform-icon" src={platform.icon} alt="" />
                      <span>{platform.name}</span>
                      <img className="pc-platform-ext" src={icExternal} alt="" />
                    </a>
                  ))}
                </div>
              </div>
              <textarea
                className={`pc-textarea pc-textarea-shop${shopError ? ' is-error' : ''}`}
                value={shopText}
                placeholder="请输入店铺首页的链接地址"
                onChange={(event) => {
                  setShopText(event.target.value);
                  if (shopError) setShopError('');
                }}
              />
              {shopError ? <div className="pc-field-error">{shopError}</div> : null}
              <div className="pc-form-foot pc-form-foot-shop">
                <div className="pc-form-actions">
                  <button
                    type="button"
                    className="pc-btn pc-btn-warn"
                    onClick={() => {
                      setShopText('');
                      setShopError('');
                    }}
                  >
                    清空链接
                  </button>
                  <button type="button" className="pc-btn pc-btn-blue" onClick={readShop}>
                    读取店铺商品
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {subTab === 'fav' ? <FavoritePanel rows={favorites} /> : null}
          {subTab === 'records' ? <RecordsPanel rows={records} /> : null}
        </section>

        {subTab === 'link' || subTab === 'shop' ? renderLogCard() : null}
      </div>

      <span className="pc-contact">
        <img src={icHeadset} alt="" />
        联系我们
      </span>

      {pluginOpen ? <PluginModal onClose={() => setPluginOpen(false)} /> : null}
      {duplicatePrompt ? (
        <DuplicateDialog
          duplicates={duplicatePrompt.duplicates}
          onCancel={() => setDuplicatePrompt(null)}
          onConfirm={confirmDuplicates}
          onOpenSettings={() => {
            setDuplicatePrompt(null);
            setSettingsOpen(true);
          }}
        />
      ) : null}
      {settingsOpen ? (
        <CollectSettingsDialog
          value={collectSettings}
          onClose={() => setSettingsOpen(false)}
          onSave={(next) => {
            setCollectSettings(next);
            setSettingsOpen(false);
            showToast('采集设置已保存');
          }}
        />
      ) : null}
      <ToastHost toasts={toasts} />
    </div>
  );
}

function FavoritePanel({ rows }: { rows: FavRow[] }) {
  const [draft, setDraft] = useState({ start: '', end: '', source: '', link: '', status: '', min: '', max: '' });
  const [applied, setApplied] = useState({ start: '', end: '', source: '', link: '', status: '', min: '', max: '' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = useMemo(
    () =>
      rows.filter((row) => {
        if (applied.source && row.source !== applied.source) return false;
        if (applied.status && row.status !== applied.status) return false;
        if (applied.link && !row.title.toLowerCase().includes(applied.link.toLowerCase())) return false;
        if (applied.start && row.time.slice(0, 10) < applied.start) return false;
        if (applied.end && row.time.slice(0, 10) > applied.end) return false;
        if (applied.min && Number(row.price) < Number(applied.min)) return false;
        if (applied.max && Number(row.price) > Number(applied.max)) return false;
        return true;
      }),
    [rows, applied],
  );

  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const allSelected = pageRows.length > 0 && pageRows.every((row) => selected.includes(row.id));
  const someSelected = pageRows.some((row) => selected.includes(row.id)) && !allSelected;

  useEffect(() => {
    setSelected([]);
  }, [applied, page, pageSize]);

  const toggleOne = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const apply = () => {
    setApplied(draft);
    setPage(1);
  };

  const reset = () => {
    const empty = { start: '', end: '', source: '', link: '', status: '', min: '', max: '' };
    setDraft(empty);
    setApplied(empty);
    setPage(1);
  };

  return (
    <div className="pc-table-panel">
      <div className="pc-filter">
        <div className="pc-filter-row">
          <div className="pc-field">
            <span className="pc-label">创建日期</span>
            <DateRange
              start={draft.start}
              end={draft.end}
              width={340}
              onChange={(start, end) => setDraft((prev) => ({ ...prev, start, end }))}
            />
          </div>
          <div className="pc-field">
            <span className="pc-label">来源</span>
            <Select
              value={draft.source}
              placeholder="请选择来源"
              options={SOURCE_OPTIONS}
              width={180}
              onChange={(source) => setDraft((prev) => ({ ...prev, source }))}
            />
          </div>
          <div className="pc-field">
            <span className="pc-label">采集链接</span>
            <input
              className="pc-input pc-input-inner"
              style={{ width: 200 }}
              value={draft.link}
              placeholder="请输入采集链接"
              onChange={(event) => setDraft((prev) => ({ ...prev, link: event.target.value }))}
            />
          </div>
          <div className="pc-field">
            <span className="pc-label">采集状态</span>
            <Select
              value={draft.status}
              placeholder="请选择状态"
              options={STATUS_OPTIONS}
              width={180}
              onChange={(status) => setDraft((prev) => ({ ...prev, status }))}
            />
          </div>
        </div>
        <div className="pc-filter-row">
          <div className="pc-field">
            <span className="pc-label">价格</span>
            <PriceRange
              min={draft.min}
              max={draft.max}
              onChange={(min, max) => setDraft((prev) => ({ ...prev, min, max }))}
            />
          </div>
          <button type="button" className="pc-btn pc-btn-primary pc-btn-search" onClick={apply}>
            <SearchIcon />
            查询
          </button>
          <button type="button" className="pc-btn" onClick={reset}>
            <RefreshIcon />
            重置
          </button>
        </div>
      </div>

      <div className="pc-table">
        <div className="pc-thead pc-thead-fav">
          <span className="pc-th pc-col-check">
            <PageCheckbox
              checked={allSelected}
              indeterminate={someSelected}
              label="全选当前页"
              onClick={(event) => {
                event.stopPropagation();
                setSelected(allSelected ? [] : pageRows.map((row) => row.id));
              }}
            />
          </span>
          <span className="pc-th pc-col-img">图片</span>
          <span className="pc-th pc-col-title">标题/链接</span>
          <span className="pc-th">来源</span>
          <span className="pc-th pc-th-right">价格</span>
          <span className="pc-th pc-th-right">销量</span>
          <span className="pc-th">收藏时间</span>
          <span className="pc-th">采集状态</span>
        </div>
        <div className="pc-tbody">
          {pageRows.length === 0 ? (
            <EmptyRow text="暂无数据" />
          ) : (
            pageRows.map((row) => (
              <div className={`pc-tr pc-tr-fav${selected.includes(row.id) ? ' is-selected' : ''}`} key={row.id}>
                <span className="pc-td pc-col-check">
                  <PageCheckbox
                    checked={selected.includes(row.id)}
                    label="选择"
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleOne(row.id);
                    }}
                  />
                </span>
                <span className="pc-td pc-col-img">
                  <img className="pc-thumb" src={row.thumb} alt="" />
                </span>
                <span className="pc-td pc-col-title">
                  <a className="pc-title-link" href={row.href} target="_blank" rel="noreferrer" title={row.title}>
                    {row.title}
                  </a>
                </span>
                <span className="pc-td">{row.source}</span>
                <span className="pc-td pc-td-right">{row.price}</span>
                <span className="pc-td pc-td-right">{row.sales}</span>
                <span className="pc-td pc-td-time">{row.time}</span>
                <span className="pc-td">
                  <StatusTag status={row.status} />
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="pc-table-foot">
        <Pagination
          total={filtered.length}
          page={page}
          pageSize={pageSize}
          onChange={(nextPage, nextSize) => {
            setPage(nextPage);
            setPageSize(nextSize);
          }}
        />
      </div>
    </div>
  );
}

function RecordsPanel({ rows }: { rows: RecRow[] }) {
  const [draft, setDraft] = useState({ start: '', end: '', source: '', link: '', status: '' });
  const [applied, setApplied] = useState({ start: '', end: '', source: '', link: '', status: '' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = useMemo(
    () =>
      rows.filter((row) => {
        if (applied.source && row.source !== applied.source) return false;
        if (applied.status && row.status !== applied.status) return false;
        if (applied.link && !row.title.toLowerCase().includes(applied.link.toLowerCase())) return false;
        if (applied.start && row.time.slice(0, 10) < applied.start) return false;
        if (applied.end && row.time.slice(0, 10) > applied.end) return false;
        return true;
      }),
    [rows, applied],
  );

  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const allSelected = pageRows.length > 0 && pageRows.every((row) => selected.includes(row.id));
  const someSelected = pageRows.some((row) => selected.includes(row.id)) && !allSelected;

  useEffect(() => {
    setSelected([]);
  }, [applied, page, pageSize]);

  const toggleOne = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const apply = () => {
    setApplied(draft);
    setPage(1);
  };

  const reset = () => {
    const empty = { start: '', end: '', source: '', link: '', status: '' };
    setDraft(empty);
    setApplied(empty);
    setPage(1);
  };

  return (
    <div className="pc-table-panel">
      <div className="pc-filter">
        <div className="pc-filter-row">
          <div className="pc-field">
            <span className="pc-label">采集时间</span>
            <DateRange
              start={draft.start}
              end={draft.end}
              width={340}
              onChange={(start, end) => setDraft((prev) => ({ ...prev, start, end }))}
            />
          </div>
          <div className="pc-field">
            <span className="pc-label">来源</span>
            <Select
              value={draft.source}
              placeholder="请选择来源"
              options={SOURCE_OPTIONS}
              width={190}
              onChange={(source) => setDraft((prev) => ({ ...prev, source }))}
            />
          </div>
          <div className="pc-field">
            <span className="pc-label">采集链接</span>
            <input
              className="pc-input pc-input-inner"
              style={{ width: 220 }}
              value={draft.link}
              placeholder="请输入采集链接"
              onChange={(event) => setDraft((prev) => ({ ...prev, link: event.target.value }))}
            />
          </div>
          <div className="pc-field">
            <span className="pc-label">采集状态</span>
            <Select
              value={draft.status}
              placeholder="请选择状态"
              options={STATUS_OPTIONS}
              width={190}
              onChange={(status) => setDraft((prev) => ({ ...prev, status }))}
            />
          </div>
        </div>
        <div className="pc-filter-row">
          <button type="button" className="pc-btn pc-btn-primary pc-btn-search" onClick={apply}>
            <SearchIcon />
            查询
          </button>
          <button type="button" className="pc-btn" onClick={reset}>
            <RefreshIcon />
            重置
          </button>
        </div>
      </div>

      <div className="pc-table">
        <div className="pc-thead pc-thead-rec">
          <span className="pc-th pc-col-check">
            <PageCheckbox
              checked={allSelected}
              indeterminate={someSelected}
              label="全选当前页"
              onClick={(event) => {
                event.stopPropagation();
                setSelected(allSelected ? [] : pageRows.map((row) => row.id));
              }}
            />
          </span>
          <span className="pc-th pc-col-img">图片</span>
          <span className="pc-th pc-col-title">标题/链接</span>
          <span className="pc-th">来源</span>
          <span className="pc-th pc-th-right">价格</span>
          <span className="pc-th">日期</span>
          <span className="pc-th">采集状态</span>
          <span className="pc-th">采集账号</span>
          <span className="pc-th">失败原因</span>
        </div>
        <div className="pc-tbody">
          {pageRows.length === 0 ? (
            <EmptyRow text="暂无数据" />
          ) : (
            pageRows.map((row) => (
              <div className={`pc-tr pc-tr-rec${selected.includes(row.id) ? ' is-selected' : ''}`} key={row.id}>
                <span className="pc-td pc-col-check">
                  <PageCheckbox
                    checked={selected.includes(row.id)}
                    label="选择"
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleOne(row.id);
                    }}
                  />
                </span>
                <span className="pc-td pc-col-img">
                  {row.thumb ? <img className="pc-thumb" src={row.thumb} alt="" /> : <span className="pc-noimg">-</span>}
                </span>
                <span className="pc-td pc-col-title">
                  <a className="pc-title-link" href={row.href} target="_blank" rel="noreferrer" title={row.title}>
                    {row.title}
                  </a>
                </span>
                <span className="pc-td">{row.source}</span>
                <span className="pc-td pc-td-right">{row.price}</span>
                <span className="pc-td pc-td-time">{row.time}</span>
                <span className="pc-td">
                  <StatusTag status={row.status} />
                </span>
                <span className="pc-td pc-td-account">{row.account}</span>
                <span className={`pc-td${row.reason !== '-' ? ' pc-reason' : ''}`} title={row.reason}>
                  {row.reason}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="pc-table-foot">
        <Pagination
          total={filtered.length}
          page={page}
          pageSize={pageSize}
          onChange={(nextPage, nextSize) => {
            setPage(nextPage);
            setPageSize(nextSize);
          }}
        />
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg className="pc-btn-icon" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="7" cy="7" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="m10.2 10.2 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg className="pc-btn-icon" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M13 8a5 5 0 1 1-1.5-3.6M13 3.2V6h-2.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
