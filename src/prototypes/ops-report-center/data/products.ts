import goods1 from '../assets/goods-1.jpg';
import goods2 from '../assets/goods-2.jpg';
import goods3 from '../assets/goods-3.jpg';
import goods4 from '../assets/goods-4.jpg';
import goods5 from '../assets/goods-5.jpg';
import goods6 from '../assets/goods-6.jpg';
import goods7 from '../assets/goods-7.jpg';
import goods8 from '../assets/goods-8.jpg';
import goods9 from '../assets/goods-9.jpg';
import goods10 from '../assets/goods-10.jpg';

export const DEMO_TODAY = '2026-11-05';
export const DATA_START = '2026-10-07';
export const DATA_DAYS = 30;

export type ProductSource = '手动创建' | '用户采集' | 'BAL刊登';
export type ListingMethod = '手动发布' | '循环刊登';
export type TimePreset = 'today' | '7d' | '30d' | 'custom';

export interface TenantOption {
    id: string;
    contact: string;
}

export interface ShopOption {
    id: string;
    name: string;
    tenantId: string;
}

export interface DailySale {
    offset: number;
    qty: number;
    orders: number;
}

export interface ProductRow {
    id: string;
    title: string;
    image: string;
    tenantId: string;
    shopId: string;
    source: ProductSource;
    listing: ListingMethod;
    price: number;
    daily: DailySale[];
}

export interface ProductAgg extends ProductRow {
    qty: number;
    amount: number;
    orders: number;
}

export const SOURCES: ProductSource[] = ['手动创建', '用户采集', 'BAL刊登'];
export const LISTING_METHODS: ListingMethod[] = ['手动发布', '循环刊登'];

export const TENANTS: TenantOption[] = [
    { id: 'LT10063', contact: '14578288322' },
    { id: 'LT10062', contact: '18613183066' },
    { id: 'LT10056', contact: '1457828831' },
    { id: 'LT10053', contact: 'zhang2' },
    { id: 'LT10059', contact: '2528473204' },
];

export const SHOPS: ShopOption[] = [
    { id: 'shop-1', name: 'SunnyHome 家居店', tenantId: 'LT10063' },
    { id: 'shop-2', name: 'Outdoor Pro 户外店', tenantId: 'LT10063' },
    { id: 'shop-3', name: 'PetJoy 宠物店', tenantId: 'LT10062' },
    { id: 'shop-4', name: 'HomeEase 家居店', tenantId: 'LT10056' },
    { id: 'shop-5', name: 'FashionLab 女装店', tenantId: 'LT10056' },
    { id: 'shop-6', name: 'GadgetGo 数码店', tenantId: 'LT10053' },
    { id: 'shop-7', name: 'SunnyHome 家居店', tenantId: 'LT10059' },
];

function makeDaily(seed: number, base: number, quietRecent = false): DailySale[] {
    let state = seed >>> 0;
    const random = () => {
        state = (state * 1664525 + 1013904223) >>> 0;
        return state / 4294967296;
    };
    return Array.from({ length: DATA_DAYS }, (_, offset) => {
        const weekend = offset % 7 === 5 || offset % 7 === 6;
        const isQuiet = quietRecent && offset >= DATA_DAYS - 7;
        let qty = isQuiet ? 0 : Math.round(base * (0.55 + random() * 1.1) * (weekend ? 1.25 : 1));
        if (!isQuiet && qty < 1) {
            qty = 1;
        }
        const orders = qty === 0 ? 0 : Math.max(1, Math.round(qty / (1.6 + random() * 1.4)));
        return { offset, qty, orders };
    });
}

export const PRODUCTS: ProductRow[] = [
    { id: 'LT-P100231', title: '冠军印花短袖T恤', image: goods1, tenantId: 'LT10063', shopId: 'shop-1', source: 'BAL刊登', listing: '循环刊登', price: 47, daily: makeDaily(11, 6) },
    { id: 'LT-P100188', title: '灰色休闲西装两件套', image: goods2, tenantId: 'LT10062', shopId: 'shop-3', source: '用户采集', listing: '手动发布', price: 47, daily: makeDaily(23, 5) },
    { id: 'LT-P100204', title: '浅色直筒牛仔裤', image: goods3, tenantId: 'LT10063', shopId: 'shop-2', source: '手动创建', listing: '循环刊登', price: 52.5, daily: makeDaily(37, 4.4) },
    { id: 'LT-P100176', title: '复古水洗牛仔裤', image: goods4, tenantId: 'LT10062', shopId: 'shop-3', source: '用户采集', listing: '循环刊登', price: 19.9, daily: makeDaily(41, 4) },
    { id: 'LT-P100152', title: '大容量托特包', image: goods5, tenantId: 'LT10056', shopId: 'shop-4', source: '手动创建', listing: '手动发布', price: 25.8, daily: makeDaily(53, 3.5) },
    { id: 'LT-P100143', title: '菱格链条斜挎包', image: goods6, tenantId: 'LT10063', shopId: 'shop-2', source: '手动创建', listing: '手动发布', price: 128, daily: makeDaily(67, 2.2) },
    { id: 'LT-P100131', title: '绗缝单肩包', image: goods7, tenantId: 'LT10062', shopId: 'shop-3', source: '用户采集', listing: '循环刊登', price: 35, daily: makeDaily(71, 3.2) },
    { id: 'LT-P100122', title: '酒红漆皮斜挎包', image: goods8, tenantId: 'LT10056', shopId: 'shop-5', source: '用户采集', listing: '循环刊登', price: 42, daily: makeDaily(83, 2.8) },
    { id: 'LT-P100118', title: '白色手提小方包', image: goods9, tenantId: 'LT10062', shopId: 'shop-3', source: 'BAL刊登', listing: '循环刊登', price: 29.9, daily: makeDaily(97, 2.6) },
    { id: 'LT-P100107', title: '印花手提斜挎包', image: goods10, tenantId: 'LT10063', shopId: 'shop-1', source: 'BAL刊登', listing: '循环刊登', price: 218, daily: makeDaily(101, 1.6) },
    { id: 'LT-P100096', title: '宽松印花短袖T恤', image: goods1, tenantId: 'LT10059', shopId: 'shop-7', source: '手动创建', listing: '手动发布', price: 89, daily: makeDaily(113, 1.8) },
    { id: 'LT-P100084', title: '通勤西装外套', image: goods2, tenantId: 'LT10053', shopId: 'shop-6', source: '用户采集', listing: '手动发布', price: 56, daily: makeDaily(127, 1.5) },
    { id: 'LT-P100072', title: '高腰直筒牛仔裤', image: goods3, tenantId: 'LT10056', shopId: 'shop-4', source: '手动创建', listing: '循环刊登', price: 33, daily: makeDaily(131, 1.4) },
    { id: 'LT-P100065', title: '蓝色修身牛仔裤', image: goods4, tenantId: 'LT10056', shopId: 'shop-5', source: '用户采集', listing: '循环刊登', price: 68, daily: makeDaily(149, 1.2) },
    { id: 'LT-P100058', title: '软皮托特包', image: goods5, tenantId: 'LT10053', shopId: 'shop-6', source: 'BAL刊登', listing: '循环刊登', price: 22.5, daily: makeDaily(151, 1.3, true) },
    { id: 'LT-P100047', title: '小号菱格链条包', image: goods6, tenantId: 'LT10062', shopId: 'shop-3', source: 'BAL刊登', listing: '手动发布', price: 129, daily: makeDaily(163, 1.0, true) },
    { id: 'LT-P100039', title: '绗缝斜挎包', image: goods7, tenantId: 'LT10056', shopId: 'shop-5', source: '手动创建', listing: '手动发布', price: 39, daily: makeDaily(173, 1.1) },
    { id: 'LT-P100021', title: '亮面方扣小方包', image: goods8, tenantId: 'LT10063', shopId: 'shop-2', source: '用户采集', listing: '循环刊登', price: 76, daily: makeDaily(181, 0.9, true) },
];

export function addDays(date: string, days: number): string {
    const [year, month, day] = date.split('-').map(Number);
    const next = new Date(Date.UTC(year, month - 1, day + days));
    return next.toISOString().slice(0, 10);
}

export function rangeForPreset(preset: Exclude<TimePreset, 'custom'>): { start: string; end: string } {
    if (preset === 'today') {
        return { start: DEMO_TODAY, end: DEMO_TODAY };
    }
    if (preset === '7d') {
        return { start: addDays(DEMO_TODAY, -6), end: DEMO_TODAY };
    }
    return { start: addDays(DEMO_TODAY, -(DATA_DAYS - 1)), end: DEMO_TODAY };
}

export function shopById(id: string): ShopOption | undefined {
    return SHOPS.find((shop) => shop.id === id);
}

export function tenantLabel(id: string): string {
    const tenant = TENANTS.find((item) => item.id === id);
    return tenant ? `${tenant.id} · ${tenant.contact}` : id;
}

export function aggregateProducts(
    products: ProductRow[],
    start: string,
    end: string,
): ProductAgg[] {
    const startOffset = Math.max(0, Math.round((Date.parse(`${start}T00:00:00Z`) - Date.parse(`${DATA_START}T00:00:00Z`)) / 86400000));
    const endOffset = Math.min(DATA_DAYS - 1, Math.round((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${DATA_START}T00:00:00Z`)) / 86400000));
    if (endOffset < startOffset) {
        return [];
    }
    return products
        .map((product) => {
            let qty = 0;
            let orders = 0;
            product.daily.forEach((day) => {
                if (day.offset >= startOffset && day.offset <= endOffset) {
                    qty += day.qty;
                    orders += day.orders;
                }
            });
            const amount = Math.round(qty * product.price * 100) / 100;
            return { ...product, qty, amount, orders };
        })
        .filter((product) => product.qty > 0);
}
