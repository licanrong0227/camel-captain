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
import goods11 from '../assets/goods-11.jpeg';
import goods12 from '../assets/goods-12.jpeg';
import goods13 from '../assets/goods-13.jpg';
import goods14 from '../assets/goods-14.jpg';
import goods15 from '../assets/goods-15.jpg';
import goods16 from '../assets/goods-16.jpg';
import type { CountryId, ProductInfo, SkuInfo, StoreGroup, StoreInfo } from './types';

const THUMBS = [
  goods1, goods2, goods3, goods4, goods5, goods6, goods7, goods8,
  goods9, goods10, goods11, goods12, goods13, goods14, goods15, goods16,
];

const REAL_STORES: StoreInfo[] = [
  { id: 152, name: '包包', alias: 'bag', groupId: 22, adEnabled: true, openDate: '2026-01-01', weight: 1, unitPrice: 56, level: 5, score: 4.62 },
  { id: 153, name: '鞋子', alias: 'shoes', groupId: 22, adEnabled: true, openDate: '2026-01-01', weight: 0.9, unitPrice: 42, level: 3, score: 3.85 },
  { id: 155, name: 'clothes', alias: '服装测试', groupId: 23, adEnabled: true, openDate: '2026-01-01', weight: 0.72, unitPrice: 32, level: 3, score: 3.42 },
  { id: 161, name: 'sneakerhub8', alias: '运营测试-张诗淇专用', groupId: 23, adEnabled: true, openDate: '2026-01-01', weight: 0.82, unitPrice: 40, level: 2, score: 2.86 },
  { id: 1957, name: 'echvolt', alias: 'echvolt', groupId: 24, adEnabled: true, openDate: '2026-01-01', weight: 0.66, unitPrice: 48, level: 2, score: 2.64 },
];

const GENERATED: Array<[number, string, string, number, number]> = [
  [301, '女装旗舰店', 'women', 22, 0.44],
  [302, '鞋靴专营', 'shoes2', 22, 0.46],
  [303, '户外用品', 'outdoor', 23, 0.38],
  [304, '家居生活', 'home', 23, 0.42],
  [305, '数码配件', 'digital', 23, 0.36],
  [306, '美妆个护', 'beauty', 0, 0.34],
  [307, '母婴优选', 'baby', 0, 0.32],
  [308, '饰品工坊', 'jewelry', 0, 0.3],
  [309, '运动装备', 'sport', 0, 0.4],
  [310, '宠物用品', 'pet', 0, 0.28],
  [311, '办公文具', 'office', 0, 0.26],
  [312, '汽车用品', 'auto', 0, 0.3],
  [313, '五金工具', 'tools', 0, 0.24],
  [314, '厨房电器', 'kitchen', 0, 0.34],
  [315, '灯饰照明', 'lighting', 0, 0.22],
  [316, '玩具模型', 'toys', 0, 0.28],
  [317, '园艺花艺', 'garden', 0, 0.2],
  [318, '内衣家居服', 'underwear', 22, 0.36],
  [319, '手表眼镜', 'watch', 0, 0.3],
  [320, '旅行箱包', 'luggage', 22, 0.42],
  [321, '乐器音响', 'music', 0, 0.18],
  [322, '工业耗材', 'industrial', 24, 0.24],
  [323, '跨境优选', 'global', 25, 0.4],
  [324, '全球购', 'global2', 25, 0.38],
];

export const STORES: StoreInfo[] = [
  ...REAL_STORES,
  ...GENERATED.map(([id, name, alias, groupId, weight]): StoreInfo => ({
    id,
    name: `骆驼队长·${name}`,
    alias,
    groupId,
    adEnabled: false,
    openDate: '2026-01-01',
    weight,
    unitPrice: 36,
    level: weight >= 0.4 ? 4 : weight >= 0.33 ? 3 : weight >= 0.26 ? 2 : weight >= 0.2 ? 1 : 0,
    score: Math.min(4.9, Math.round((1.2 + weight * 7 + (groupId % 3) * 0.12) * 100) / 100),
  })),
  { id: 1960, name: '骆驼队长·新店测试', alias: 'new-store', groupId: 25, adEnabled: false, openDate: '2026-09-20', weight: 0.3, unitPrice: 38, level: 0, score: 1.18 },
];

export const LEVEL_COLORS = ['#94A3B8', '#3B82F6', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899'];
export const LEVEL_LIGHT_COLORS = [
  'rgba(148, 163, 184, 0.16)',
  'rgba(59, 130, 246, 0.14)',
  'rgba(245, 158, 11, 0.14)',
  'rgba(16, 185, 129, 0.14)',
  'rgba(139, 92, 246, 0.14)',
  'rgba(236, 72, 153, 0.14)',
];

export const STORE_MAP: Record<number, StoreInfo> = STORES.reduce((acc, store) => {
  acc[store.id] = store;
  return acc;
}, {} as Record<number, StoreInfo>);

export const STORE_GROUPS: StoreGroup[] = [
  { id: 22, name: '分组1', storeIds: STORES.filter((s) => s.groupId === 22).map((s) => s.id) },
  { id: 23, name: '分组2', storeIds: STORES.filter((s) => s.groupId === 23).map((s) => s.id) },
  { id: 24, name: '测试分组', storeIds: STORES.filter((s) => s.groupId === 24).map((s) => s.id) },
  { id: 25, name: '新店分组', storeIds: STORES.filter((s) => s.groupId === 25).map((s) => s.id) },
  { id: 0, name: '未分组', storeIds: STORES.filter((s) => s.groupId === 0).map((s) => s.id) },
];

export const STORE_GROUP_OPTIONS = [
  { value: '', label: '全部分组' },
  ...STORE_GROUPS.map((group) => ({ value: String(group.id), label: group.name })),
];

export const AD_STORES = STORES.filter((store) => store.adEnabled);

export const COUNTRY_IDS: CountryId[] = ['US', 'UK', 'DE', 'FR', 'IT', 'ES'];
const COUNTRY_WEIGHTS = [0.36, 0.19, 0.15, 0.12, 0.09, 0.09];

export const COUNTRY_SPLIT = COUNTRY_IDS.map((id, index) => ({ id, weight: COUNTRY_WEIGHTS[index] }));

const COLORS = ['Black', 'Brown', 'White', 'Khaki', 'Navy', 'Burgundy', 'Dusty Blue', 'Olive'];
const SIZES_APPAREL = ['S', 'M', 'L', 'XL', 'XXL'];
const SIZES_SHOES = ['35', '36', '37', '38', '39', '40'];
const SIZES_GENERAL = ['S', 'M', 'L', 'XL', 'XXL'];
const PATTERNS = ['纯色', '老花', '菱格', '条纹', '印花', '刺绣', '拼接'];

const NAMES_BY_CATEGORY: Record<string, string[]> = {
  bag: ['女士复古真皮手提包 通勤单肩包', '老花帆布托特包 大容量子母包', '简约双肩背包 学生旅行包', '菱格链条包 小香风斜挎包', '头层牛皮腋下手提包', '软皮托特包 通勤大容量', '迷你斜挎手机包 链条小方包', '轻便尼龙斜挎包 防泼水'],
  shoes: ['真皮厚底小白鞋 百搭板鞋', '复古德训鞋 休闲运动鞋', '软底乐福鞋 通勤一脚蹬', '高帮帆布鞋 学生百搭', '尖头细跟单鞋 法式通勤', '厚底老爹鞋 增高显瘦', '真皮马丁靴 短筒', '轻便跑鞋 缓震透气'],
  clothes: ['法式碎花连衣裙 收腰长裙', '女士西装外套 通勤职业套装', '纯棉圆领短袖T恤 宽松打底', '高腰阔腿裤 垂感西装裤', '针织开衫 慵懒风外套', '雪纺衬衫 法式复古上衣', '牛仔直筒裤 显瘦百搭', '羊毛混纺大衣 中长款'],
  home: ['北欧风收纳篮 桌面整理', '简约陶瓷餐具四件套', '棉麻抱枕套 沙发靠垫', '折叠收纳箱 衣物整理', '香薰蜡烛 家居礼盒', '厨房置物架 台面收纳', '防水桌布 印花餐桌布', '懒人沙发套 弹力全包'],
  digital: ['无线蓝牙耳机 降噪入耳', '快充数据线 编织耐用', '便携充电宝 10000mAh', '手机支架 桌面折叠', '蓝牙音箱 户外防水', 'USB 分线器 多口扩展', '智能手表表带 硅胶', '车载手机支架 磁吸'],
  other: ['简约通勤双肩包 大容量', '纯棉基础款T恤 百搭', '轻便运动鞋 透气缓震', '多功能收纳盒 桌面整理', '便携保温杯 不锈钢', '复古印花丝巾 百搭', '轻奢耳饰套装 日常', '旅行收纳袋 六件套'],
};

function categoryOf(store: StoreInfo): string {
  if (store.alias.startsWith('bag')) return 'bag';
  if (store.alias.startsWith('shoes')) return 'shoes';
  if (store.alias.startsWith('clothes') || store.alias.startsWith('women') || store.alias.startsWith('underwear')) return 'clothes';
  if (store.alias.startsWith('home') || store.alias.startsWith('kitchen') || store.alias.startsWith('lighting')) return 'home';
  if (store.alias.startsWith('digital') || store.alias.startsWith('auto') || store.alias.startsWith('watch')) return 'digital';
  return 'other';
}

function keywordsOf(category: string): string[] {
  if (category === 'bag') return ['vintage leather handbag', 'women shoulder bag', 'large canvas tote', 'crossbody bag'];
  if (category === 'shoes') return ['white leather sneakers', 'women casual shoes', 'comfortable loafers', 'running shoes'];
  if (category === 'clothes') return ['floral midi dress', 'women blazer suit', 'cotton basic tshirt', 'wide leg pants'];
  if (category === 'home') return ['home storage basket', 'ceramic dinner set', 'cushion cover', 'kitchen organizer'];
  if (category === 'digital') return ['wireless earbuds', 'fast charging cable', 'power bank', 'phone holder'];
  return ['daily essentials', 'best seller', 'hot sale', 'new arrival'];
}

function hashStr(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildSkus(product: ProductInfo, category: string): SkuInfo[] {
  const random = mulberry32(hashStr(product.itemcode));
  const baseSizes = category === 'clothes' ? SIZES_APPAREL : category === 'shoes' ? SIZES_SHOES : SIZES_GENERAL;
  const noColor = random() < 0.08;
  if (noColor) {
    return baseSizes.map((size, index) => ({
      id: `${product.itemcode}-0-${index}`,
      color: '',
      size,
      pattern: '无图案',
      weight: 1,
    }));
  }
  const colorCount = 3 + (random() < 0.5 ? 0 : 1);
  const colorStart = Math.floor(random() * (COLORS.length - colorCount + 1));
  const colors = COLORS.slice(colorStart, colorStart + colorCount);
  const sizes = baseSizes.slice(0, 4 + (random() < 0.5 ? 0 : 1));
  const pattern = PATTERNS[Math.floor(random() * PATTERNS.length)];
  const skus: SkuInfo[] = [];
  colors.forEach((color, colorIndex) => {
    sizes.forEach((size, sizeIndex) => {
      skus.push({
        id: `${product.itemcode}-${colorIndex}-${sizeIndex}`,
        color,
        size,
        pattern,
        weight: 1,
      });
    });
  });
  return skus;
}

export const PRODUCTS: ProductInfo[] = STORES.flatMap((store, storeIndex) => {
  const category = categoryOf(store);
  const count = store.adEnabled ? 24 : 4;
  const names = NAMES_BY_CATEGORY[category];
  return Array.from({ length: count }, (_, index) => {
    const random = mulberry32(hashStr(`${store.id}|${index}|product`));
    const itemcode = `2048176${String(storeIndex * 100 + index + 1).padStart(3, '0')}`;
    const nameBase = names[(index + storeIndex * 3) % names.length];
    const name = index >= names.length ? `${nameBase} ${Math.floor(index / names.length) + 1}` : nameBase;
    const product: ProductInfo = {
      itemcode,
      storeId: store.id,
      name,
      thumb: THUMBS[(storeIndex * 5 + index) % THUMBS.length],
      price: Math.round((16 + random() * 82) * 100) / 100,
      traffic: Math.round(180 + random() * 760),
      adEnabled: store.adEnabled && index < 12,
      keywords: keywordsOf(category),
      skus: [],
    };
    product.skus = buildSkus(product, category);
    return product;
  });
});

export const PRODUCT_MAP: Record<string, ProductInfo> = PRODUCTS.reduce((acc, product) => {
  acc[product.itemcode] = product;
  return acc;
}, {} as Record<string, ProductInfo>);

export const PRODUCTS_BY_STORE: Record<number, ProductInfo[]> = PRODUCTS.reduce((acc, product) => {
  acc[product.storeId] = acc[product.storeId] || [];
  acc[product.storeId].push(product);
  return acc;
}, {} as Record<number, ProductInfo[]>);

export const AD_PRODUCTS = PRODUCTS.filter((product) => product.adEnabled);

export function storeNameOf(id: number): string {
  return STORE_MAP[id]?.name ?? String(id);
}
