import thumb1 from '../assets/products/thumb-1.jpg';
import thumb2 from '../assets/products/thumb-2.jpg';
import thumb3 from '../assets/products/thumb-3.jpg';
import thumb4 from '../assets/products/thumb-4.jpg';
import thumb5 from '../assets/products/thumb-5.jpg';
import thumb6 from '../assets/products/thumb-6.jpg';
import thumb7 from '../assets/products/thumb-7.jpg';
import thumb8 from '../assets/products/thumb-8.jpg';
import thumb9 from '../assets/products/thumb-9.jpg';
import orderThumb1 from '../assets/orders/order-thumb-1.jpg';
import orderThumb2 from '../assets/orders/order-thumb-2.jpg';
import orderThumb3 from '../assets/orders/order-thumb-3.jpg';
import orderThumb4 from '../assets/orders/order-thumb-4.jpg';

export const DEMO_TODAY = '2026-10-31';
export const DEMO_NOW = '2026-10-31 10:00:00';
export const DATA_FROM = '2026-08-01';
export const DATA_TO = DEMO_TODAY;

export const PRODUCT_IMAGES = [thumb1, thumb2, thumb3, thumb4, thumb5, thumb6, thumb7, thumb8, thumb9];
export const ORDER_IMAGES = [orderThumb1, orderThumb2, orderThumb3, orderThumb4];

export function createRng(seed: number) {
  let a = seed >>> 0;
  return function rng() {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick<T>(rng: () => number, list: readonly T[]): T {
  return list[Math.floor(rng() * list.length) % list.length];
}

export function intBetween(rng: () => number, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

export function pad(value: number, length = 2): string {
  return String(value).padStart(length, '0');
}

export function dayOffset(offset: number, hour = 10, minute = 0): string {
  const base = new Date('2026-10-31T00:00:00+08:00');
  base.setDate(base.getDate() + offset);
  return `${base.getFullYear()}-${pad(base.getMonth() + 1)}-${pad(base.getDate())} ${pad(hour)}:${pad(minute)}:00`;
}

export function dateOnly(offset: number): string {
  return dayOffset(offset).slice(0, 10);
}

export function money(value: number, currency = '$'): string {
  const fixed = Math.abs(value) >= 1000 ? value.toFixed(0) : value.toFixed(2);
  return `${currency} ${Number(fixed).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
}

export function num(value: number): string {
  return Number(value).toLocaleString('en-US', { maximumFractionDigits: 2 });
}

export function pct(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

export function makeCode(prefix: string, index: number, digits = 6): string {
  return `${prefix}${String(index + 1).padStart(digits, '0')}`;
}

export function shortTitle(rng: () => number): string {
  const adjectives = ['Classic', 'Premium', 'Vintage', 'Casual', 'Outdoor', 'Portable', 'Foldable', 'Waterproof'];
  const items = ['compass embroidery polos', 'leather crossbody bag', 'running sneakers', 'cotton t-shirts', 'stainless steel watch', 'travel backpack', 'summer dress', 'wireless earbuds'];
  return `${pick(rng, adjectives)} ${pick(rng, items)} for men women`;
}

export const STORE_OPTIONS = [
  { label: '152 包包', value: '152' },
  { label: '153 鞋子', value: '153' },
  { label: '155 clothes', value: '155' },
  { label: '161 sneakerhub8', value: '161' },
  { label: '1957 echvolt', value: '1957' },
];

export const PLATFORM_OPTIONS = [
  { label: '敦煌网', value: 'dhgate' },
  { label: '1688', value: '1688' },
  { label: '亚马逊', value: 'amazon' },
  { label: 'Temu', value: 'temu' },
  { label: '速卖通', value: 'aliexpress' },
  { label: 'SHEIN', value: 'shein' },
  { label: '拼多多', value: 'pdd' },
  { label: 'Shopify', value: 'shopify' },
];

export const COUNTRY_OPTIONS = [
  { label: '美国', value: 'US' },
  { label: '英国', value: 'UK' },
  { label: '德国', value: 'DE' },
  { label: '法国', value: 'FR' },
  { label: '西班牙', value: 'ES' },
  { label: '意大利', value: 'IT' },
  { label: '加拿大', value: 'CA' },
  { label: '澳大利亚', value: 'AU' },
];

export const CARRIER_OPTIONS = [
  { label: '华磊物流', value: 'hualei' },
  { label: '云途物流', value: 'yunexpress' },
  { label: '燕文物流', value: 'yanwen' },
  { label: '递四方', value: '4px' },
  { label: '顺丰国际', value: 'sf' },
  { label: 'DHL', value: 'dhl' },
  { label: 'UPS', value: 'ups' },
  { label: 'FedEx', value: 'fedex' },
];

export const CATEGORY_OPTIONS = [
  { label: '箱包 / 女包 / 单肩包', value: 'bags-shoulder' },
  { label: '箱包 / 女包 / 手提包', value: 'bags-handle' },
  { label: '鞋靴 / 运动鞋 / 跑步鞋', value: 'shoes-running' },
  { label: '服饰 / 男装 / T恤', value: 'apparel-tshirt' },
  { label: '服饰 / 女装 / 连衣裙', value: 'apparel-dress' },
  { label: '配饰 / 手表 / 石英表', value: 'acc-watch' },
  { label: '数码 / 耳机 / 蓝牙耳机', value: 'digital-earbuds' },
];

export const CATEGORY_NAMES = [
  '箱包 < 女包 < 单肩包',
  '箱包 < 女包 < 手提包',
  '鞋靴 < 运动鞋 < 跑步鞋',
  '服饰 < 男装 < T恤',
  '服饰 < 女装 < 连衣裙',
  '配饰 < 手表 < 石英表',
  '数码 < 耳机 < 蓝牙耳机',
];

export const BUYER_NAMES = ['Emily Johnson', 'Michael Brown', 'Sophia Davis', 'James Wilson', 'Olivia Taylor', 'Daniel Moore', 'Emma Clark', 'Lucas Lewis'];
