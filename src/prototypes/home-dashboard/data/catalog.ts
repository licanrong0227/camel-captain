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
  { id: 152, name: '包包', alias: 'bag', catePubNames: ['箱包', '鞋靴'], groupId: 22, adEnabled: true, openDate: '2026-01-01', weight: 1, unitPrice: 56, level: 5, score: 4.62 },
  { id: 153, name: '鞋子', alias: 'shoes', catePubNames: ['鞋靴'], groupId: 22, adEnabled: true, openDate: '2026-01-01', weight: 0.9, unitPrice: 42, level: 3, score: 3.85 },
  { id: 155, name: 'clothes', alias: '服装测试', catePubNames: ['服饰', '箱包', '鞋靴'], groupId: 23, adEnabled: true, openDate: '2026-01-01', weight: 0.72, unitPrice: 32, level: 3, score: 3.42 },
  { id: 161, name: 'sneakerhub8', alias: '运营测试-张诗淇专用', catePubNames: ['鞋靴', '运动装备'], groupId: 23, adEnabled: true, openDate: '2026-01-01', weight: 0.82, unitPrice: 40, level: 2, score: 2.86 },
  { id: 1957, name: 'echvolt', alias: 'echvolt', catePubNames: ['消费电子', '数码配件'], groupId: 24, adEnabled: true, openDate: '2026-01-01', weight: 0.66, unitPrice: 48, level: 2, score: 2.64 },
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

const CATE_BY_ALIAS: Record<string, string[]> = {
  women: ['女装', '服饰'],
  shoes2: ['鞋靴', '运动装备'],
  outdoor: ['户外用品'],
  home: ['家居', '厨房电器'],
  digital: ['数码', '消费电子'],
  beauty: ['美妆个护'],
  baby: ['母婴'],
  jewelry: ['饰品'],
  sport: ['运动装备'],
  pet: ['宠物用品'],
  office: ['办公文具'],
  auto: ['汽车用品'],
  tools: ['五金工具'],
  kitchen: ['厨房电器'],
  lighting: ['灯饰照明'],
  toys: ['玩具模型'],
  garden: ['园艺花艺'],
  underwear: ['内衣家居服', '服饰'],
  watch: ['手表眼镜'],
  luggage: ['箱包', '服饰'],
  music: ['乐器音响'],
  industrial: ['工业耗材'],
  global: ['综合'],
  global2: ['综合'],
};

export const STORES: StoreInfo[] = [
  ...REAL_STORES,
  ...GENERATED.map(([id, name, alias, groupId, weight]): StoreInfo => ({
    id,
    name: `骆驼队长·${name}`,
    alias,
    catePubNames: CATE_BY_ALIAS[alias] ?? ['综合'],
    groupId,
    adEnabled: false,
    openDate: '2026-01-01',
    weight,
    unitPrice: 36,
    level: weight >= 0.4 ? 4 : weight >= 0.33 ? 3 : weight >= 0.26 ? 2 : weight >= 0.2 ? 1 : 0,
    score: Math.min(4.9, Math.round((1.2 + weight * 7 + (groupId % 3) * 0.12) * 100) / 100),
  })),
  { id: 1960, name: '骆驼队长·新店测试', alias: 'new-store', catePubNames: ['综合'], groupId: 25, adEnabled: false, openDate: '2026-09-20', weight: 0.3, unitPrice: 38, level: 0, score: 1.18 },
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
  bag: [
    'Womens Vintage Genuine Leather Handbag Large Capacity Tote Bag Top Handle Shoulder Bag Purse for Work Travel Daily Commute Adjustable Straps',
    'Classic Monogram Canvas Tote Bag Large Capacity Mother and Child Bag Set Fashion Shoulder Bag for Women Shopping Office School',
    'Minimalist Commuter Backpack Water Resistant Laptop Backpack Fits 15.6 Inch Notebook Lightweight Travel Daypack for Men and Women',
    'Quilted Chain Crossbody Bag Small Flap Purse Elegant Evening Bag with Gold Tone Hardware for Party Wedding Dating',
    'Genuine Leather Underarm Handbag Soft Cowhide Hobo Bag Vintage Style Top Handle Purse for Women Office and Daily Use',
    'Soft Leather Tote Bag Large Capacity Shoulder Bag with Inner Pockets Casual Handbag for Work Travel and Shopping',
    'Mini Crossbody Phone Bag with Chain Strap Small Square Purse Credit Card Holder Shoulder Bag for Women Evening Out',
    'Lightweight Nylon Crossbody Bag Water Repellent Sling Bag Multi Pocket Shoulder Bag for Travel Hiking and Daily Commute',
  ],
  shoes: [
    'Genuine Leather Platform White Sneakers Classic Low Top Casual Shoes Non Slip Walking Sneakers for Women and Men Unisex Daily Wear',
    'Retro German Army Trainer Shoes Suede Leather Casual Sneakers Comfortable Low Top Walking Shoes for Men and Women Spring Autumn',
    'Soft Sole Loafers Slip On Walking Shoes Casual Driving Loafers Lightweight Comfortable Flats for Women Office and Travel',
    'High Top Canvas Sneakers Classic Student Shoes Breathable Casual Basketball Style Shoes for Teens Boys and Girls',
    'Pointed Toe Stiletto Heels French Style Pumps Elegant High Heel Shoes for Women Office Wedding Party Dress Shoes',
    'Chunky Dad Shoes Platform Sneakers Height Increasing Walking Shoes Retro Casual Shoes for Women and Men Streetwear',
    'Genuine Leather Martin Boots Short Ankle Boots Lace Up Combat Boots for Women Autumn and Winter Fashion Shoes',
    'Lightweight Running Shoes Breathable Cushioning Athletic Sneakers Non Slip Sports Shoes for Men and Women Gym Jogging',
  ],
  clothes: [
    'French Floral Print Midi Dress V Neck Ruffle Sleeve A Line Long Dress High Waist Elegant Summer Dress for Women Vacation Party',
    'Women Blazer Suit Two Piece Set Business Casual Office Outfit Long Sleeve Jacket and Pants Set with Pockets',
    'Cotton Crew Neck Short Sleeve T Shirt Loose Fit Basic Tee Solid Color Casual Top for Women and Men Summer Daily Wear',
    'High Waist Wide Leg Pants Drape Suit Pants Straight Leg Trousers with Pockets for Women Office Work Business Casual',
    'Knit Cardigan Sweater Long Sleeve Open Front Lazy Style Outerwear Soft Warm Cardigan for Women Autumn and Winter',
    'Chiffon Blouse French Vintage Tops Long Sleeve Button Down Shirt Elegant Office Blouse for Women Spring and Summer',
    'Denim Straight Leg Jeans High Waist Slim Fit Pants Classic Blue Denim Trousers for Women Casual Daily Wear',
    'Wool Blend Coat Mid Length Trench Coat Lapel Collar Overcoat Warm Winter Outerwear for Women Business Casual',
  ],
  home: [
    'Nordic Style Storage Basket Desktop Organizer Woven Basket for Cosmetics Remote Control Stationery Home Office Decor',
    'Simple Ceramic Dinnerware Set 4 Pieces Plate Bowl and Mug Set Microwave Safe Tableware for Kitchen Home Restaurant',
    'Cotton Linen Cushion Cover Sofa Throw Pillow Case Square Decorative Pillowcase for Living Room Bedroom Home Decor',
    'Foldable Storage Box Clothes Organizer Large Capacity Fabric Storage Bin with Lid for Wardrobe Bedroom Dorm',
    'Scented Candle Home Fragrance Gift Box Soy Wax Aromatherapy Candle for Birthday Wedding Holiday Relaxation',
    'Kitchen Countertop Organizer Rack Spice Rack Storage Shelf Multi Layer Seasoning Organizer for Kitchen and Home',
    'Waterproof Tablecloth Printed Dining Table Cover Rectangular Washable Table Cloth for Kitchen Party Home Decor',
    'Lazy Sofa Cover Stretch Full Wrap Slipcover Elastic Couch Cover Furniture Protector for Living Room and Bedroom',
  ],
  digital: [
    'Wireless Bluetooth Earbuds Active Noise Cancelling In Ear Headphones Touch Control HiFi Stereo Earphones with Charging Case',
    'Fast Charging Data Cable Braided USB Type C Cable Durable Charging Cord for Phone Tablet and Laptop 1m 2m 3m',
    'Portable Power Bank 10000mAh Fast Charging External Battery Pack with Dual USB Output for Smartphone and Tablet',
    'Phone Stand Desktop Foldable Holder Adjustable Aluminum Phone Holder for Desk Office Bedside Compatible with Most Phones',
    'Bluetooth Speaker Outdoor Waterproof Portable Wireless Speaker with Rich Bass Stereo Sound for Travel and Camping',
    'USB Hub Multi Port Adapter Splitter with USB 3.0 Ports for Laptop Desktop PC and Computer Accessories',
    'Smart Watch Band Silicone Strap Replacement Wristband Soft Comfortable Quick Release Band for Sports Watch',
    'Car Phone Holder Magnetic Air Vent Mount Stand 360 Degree Rotation Car Mount for Smartphone and GPS',
  ],
  other: [
    'Minimalist Commuter Backpack Large Capacity Business Laptop Backpack Water Resistant Daypack for Men and Women Travel Office',
    'Cotton Basic T Shirt Short Sleeve Crew Neck Solid Color Tee Top Casual Summer Shirt for Men and Women Unisex',
    'Lightweight Sports Shoes Breathable Cushioning Running Sneakers Casual Walking Shoes for Men and Women Gym Fitness',
    'Multi Functional Storage Box Desktop Organizer Large Capacity Storage Basket for Home Office Bedroom Supplies',
    'Portable Insulated Water Bottle Stainless Steel Vacuum Flask Leak Proof Travel Mug for Sports Camping and Office',
    'Retro Print Silk Scarf Square Neck Scarf Fashion Hair Scarf Bandana for Women Daily Wear Party and Gift',
    'Light Luxury Earrings Set Daily Jewelry Set Geometric Stud Earrings Dangle Earrings for Women Birthday Gift',
    'Travel Storage Bag Set 6 Pieces Packing Cubes Luggage Organizer Set for Clothes Shoes and Cosmetics Travel Accessories',
  ],
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
      image: index === 3 ? '' : product.thumb,
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
        image: sizeIndex === 3 ? '' : product.thumb,
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
    const rawName = index >= names.length ? `${nameBase} ${Math.floor(index / names.length) + 1}` : nameBase;
    const name = rawName.slice(0, 140);
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
