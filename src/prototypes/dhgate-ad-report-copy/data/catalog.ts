import p1 from '../assets/p1.png';
import p2 from '../assets/p2.png';
import p3 from '../assets/p3.jpg';
import p4 from '../assets/p4.png';
import p5 from '../assets/p5.png';
import p6 from '../assets/p6.png';
import p7 from '../assets/p7.png';
import p8 from '../assets/p8.png';
import p9 from '../assets/p9.png';
import p10 from '../assets/p10.jpg';
import p11 from '../assets/p11.jpg';

export interface StoreInfo {
  nickname: string;
  short: string;
}

export interface ProductInfo {
  itemcode: string;
  name: string;
  store: string;
  thumb: string;
  /** 客单价基线（美元），用于生成演示 GMV */
  price: number;
  /** 自然曝光基线，用于生成演示流量 */
  traffic: number;
  keywords: string[];
}

export const STORES: StoreInfo[] = [
  { nickname: '骆驼队长旗舰店', short: '旗舰店' },
  { nickname: 'CamelCaptain 箱包店', short: '箱包专营' },
  { nickname: '骆驼箱包工厂店', short: '工厂店' },
];

export const PRODUCTS: ProductInfo[] = [
  {
    itemcode: '204817563219',
    name: '女士复古真皮手提包 通勤单肩包',
    store: '骆驼队长旗舰店',
    thumb: p1,
    price: 46,
    traffic: 720,
    keywords: ['vintage leather handbag', 'brown shoulder bag', 'women shoulder bag'],
  },
  {
    itemcode: '204817563220',
    name: '老花帆布托特包 大容量通勤子母包',
    store: '骆驼队长旗舰店',
    thumb: p2,
    price: 58,
    traffic: 860,
    keywords: ['monogram tote bag', 'large canvas tote', 'women shoulder bag'],
  },
  {
    itemcode: '204817563221',
    name: '简约双肩背包 学生通勤旅行包',
    store: '骆驼队长旗舰店',
    thumb: p3,
    price: 39,
    traffic: 640,
    keywords: ['casual backpack women', 'travel daypack', 'school bag'],
  },
  {
    itemcode: '204817563222',
    name: '印花高腰阔腿短裤 夏季薄款',
    store: '骆驼队长旗舰店',
    thumb: p4,
    price: 19,
    traffic: 520,
    keywords: ['printed wide leg shorts', 'summer beach shorts', 'high waist shorts'],
  },
  {
    itemcode: '204817563223',
    name: '菱格链条包 小香风斜挎单肩包',
    store: 'CamelCaptain 箱包店',
    thumb: p5,
    price: 52,
    traffic: 780,
    keywords: ['quilted chain bag', 'beige crossbody bag', 'classic flap bag'],
  },
  {
    itemcode: '204817563224',
    name: '真皮厚底小白鞋 百搭板鞋',
    store: 'CamelCaptain 箱包店',
    thumb: p6,
    price: 31,
    traffic: 690,
    keywords: ['white leather sneakers', 'chunky sole shoes', 'women casual shoes'],
  },
  {
    itemcode: '204817563225',
    name: '法式碎花连衣裙 收腰显瘦长裙',
    store: 'CamelCaptain 箱包店',
    thumb: p7,
    price: 35,
    traffic: 610,
    keywords: ['floral midi dress', 'french style dress', 'summer long dress'],
  },
  {
    itemcode: '204817563226',
    name: '女士西装外套 通勤职业套装',
    store: 'CamelCaptain 箱包店',
    thumb: p8,
    price: 62,
    traffic: 470,
    keywords: ['women blazer suit', 'office formal jacket', 'business suit set'],
  },
  {
    itemcode: '204817563227',
    name: '纯棉圆领短袖T恤 宽松打底衫',
    store: '骆驼箱包工厂店',
    thumb: p9,
    price: 14,
    traffic: 540,
    keywords: ['cotton basic tshirt', 'oversized tee women', 'crew neck top'],
  },
  {
    itemcode: '204817563228',
    name: '头层牛皮腋下手提包 大容量',
    store: '骆驼箱包工厂店',
    thumb: p10,
    price: 68,
    traffic: 830,
    keywords: ['genuine leather handbag', 'large capacity purse', 'underarm bag'],
  },
  {
    itemcode: '204817563229',
    name: '软皮托特包 通勤大容量单肩包',
    store: '骆驼箱包工厂店',
    thumb: p11,
    price: 44,
    traffic: 700,
    keywords: ['soft leather tote', 'commuter shoulder bag', 'big shopper bag'],
  },
  {
    itemcode: '204817563230',
    name: '迷你斜挎手机包 链条小方包',
    store: '骆驼箱包工厂店',
    thumb: '',
    price: 21,
    traffic: 300,
    keywords: ['mini crossbody phone bag', 'chain small square bag'],
  },
];

export const PRODUCT_MAP: Record<string, ProductInfo> = PRODUCTS.reduce(
  (acc, item) => {
    acc[item.itemcode] = item;
    return acc;
  },
  {} as Record<string, ProductInfo>,
);

export const STORE_NICKNAMES = STORES.map((store) => store.nickname);

export const STORE_OPTIONS = [
  { value: '', label: '全部店铺' },
  ...STORES.map((store) => ({ value: store.nickname, label: store.nickname })),
];
