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
import type { AdType } from './types';

export interface StoreInfo {
  storeId: number;
  storeName: string;
  aliasName: string;
}

export interface LinkInfo {
  itemCode: string;
  storeId: number;
  itemName: string;
  categoryName: string;
  imgUrl: string;
  price: number;
  /** 日均销量基线 */
  unitsBase: number;
  /** 广告投放：占比（广告 GMV / 链接 GMV）与 ROAS 基线 */
  ads: Array<{ adType: AdType; share: number; roas: number }>;
}

export const STORES: StoreInfo[] = [
  { storeId: 152, storeName: '包包', aliasName: 'bag' },
  { storeId: 153, storeName: '鞋子', aliasName: 'shoes' },
  { storeId: 155, storeName: 'clothes', aliasName: 'clothes' },
];

export const LINKS: LinkInfo[] = [
  // 包包
  {
    itemCode: '204817563219',
    storeId: 152,
    itemName: '女士复古真皮手提包 通勤单肩包',
    categoryName: 'Women Handbags',
    imgUrl: p1,
    price: 46,
    unitsBase: 0.9,
    ads: [{ adType: 'ppc', share: 0.45, roas: 4.2 }],
  },
  {
    itemCode: '204817563220',
    storeId: 152,
    itemName: '老花帆布托特包 大容量通勤子母包',
    categoryName: 'Totes',
    imgUrl: p2,
    price: 58,
    unitsBase: 0.7,
    ads: [{ adType: 'ppc', share: 0.5, roas: 3.6 }],
  },
  {
    itemCode: '204817563221',
    storeId: 152,
    itemName: '简约双肩背包 学生通勤旅行包',
    categoryName: 'Backpacks',
    imgUrl: p3,
    price: 39,
    unitsBase: 0.5,
    ads: [{ adType: 'prodauto', share: 0.35, roas: 3.0 }],
  },
  {
    itemCode: '204817563228',
    storeId: 152,
    itemName: '头层牛皮腋下手提包 大容量',
    categoryName: 'Women Handbags',
    imgUrl: p10,
    price: 68,
    unitsBase: 0.45,
    ads: [{ adType: 'ppc', share: 0.4, roas: 5.1 }],
  },
  {
    itemCode: '204817563229',
    storeId: 152,
    itemName: '软皮托特包 通勤大容量单肩包',
    categoryName: 'Totes',
    imgUrl: p11,
    price: 44,
    unitsBase: 0.6,
    ads: [],
  },
  {
    itemCode: '204817563231',
    storeId: 152,
    itemName: '链条斜挎包 小香风菱格单肩包',
    categoryName: 'Crossbody',
    imgUrl: p5,
    price: 52,
    unitsBase: 0.8,
    // 高依赖、低回报：消耗大但广告带来的 GMV 有限
    ads: [{ adType: 'ppc', share: 0.5, roas: 0.75 }],
  },
  {
    itemCode: '204817563230',
    storeId: 152,
    itemName: '迷你斜挎手机包 链条小方包',
    categoryName: 'Crossbody',
    imgUrl: '',
    price: 21,
    unitsBase: 0.8,
    ads: [{ adType: 'shopauto', share: 0.25, roas: 2.2 }],
  },
  // 鞋子（整体广告依赖度最高）
  {
    itemCode: '204817563224',
    storeId: 153,
    itemName: '真皮厚底小白鞋 百搭板鞋',
    categoryName: 'Sneakers',
    imgUrl: p6,
    price: 31,
    unitsBase: 1.2,
    ads: [
      { adType: 'ppc', share: 0.55, roas: 2.4 },
      { adType: 'prodauto', share: 0.2, roas: 2.1 },
    ],
  },
  {
    itemCode: '204817563233',
    storeId: 153,
    itemName: '复古厚底乐福鞋 学院风单鞋',
    categoryName: 'Loafers',
    imgUrl: p4,
    price: 35,
    unitsBase: 0.6,
    ads: [{ adType: 'prodauto', share: 0.4, roas: 3.1 }],
  },
  {
    itemCode: '204817563234',
    storeId: 153,
    itemName: '加绒保暖短靴 冬季通勤靴',
    categoryName: 'Boots',
    imgUrl: '',
    price: 42,
    unitsBase: 0.3,
    ads: [{ adType: 'ppc', share: 0.5, roas: 1.6 }],
  },
  {
    itemCode: '204817563235',
    storeId: 153,
    itemName: '轻量运动跑鞋 透气网面',
    categoryName: 'Sneakers',
    imgUrl: p6,
    price: 28,
    unitsBase: 0.9,
    ads: [{ adType: 'shopauto', share: 0.3, roas: 2.0 }],
  },
  {
    itemCode: '204817563236',
    storeId: 153,
    itemName: '平底一字带凉鞋 夏季外穿',
    categoryName: 'Sandals',
    imgUrl: p4,
    price: 19,
    unitsBase: 0.4,
    ads: [],
  },
  // clothes
  {
    itemCode: '204817563225',
    storeId: 155,
    itemName: '法式碎花连衣裙 收腰显瘦长裙',
    categoryName: 'Dresses',
    imgUrl: p7,
    price: 35,
    unitsBase: 0.8,
    ads: [{ adType: 'ppc', share: 0.5, roas: 3.2 }],
  },
  {
    itemCode: '204817563226',
    storeId: 155,
    itemName: '女士西装外套 通勤职业套装',
    categoryName: 'Blazers',
    imgUrl: p8,
    price: 62,
    unitsBase: 0.4,
    ads: [{ adType: 'prodauto', share: 0.45, roas: 2.8 }],
  },
  {
    itemCode: '204817563227',
    storeId: 155,
    itemName: '纯棉圆领短袖T恤 宽松打底衫',
    categoryName: 'Tops',
    imgUrl: p9,
    price: 14,
    unitsBase: 1.5,
    ads: [{ adType: 'shopauto', share: 0.2, roas: 2.6 }],
  },
  {
    itemCode: '204817563237',
    storeId: 155,
    itemName: '高腰阔腿裤 垂感直筒西裤',
    categoryName: 'Pants',
    imgUrl: '',
    price: 26,
    unitsBase: 0.5,
    ads: [],
  },
  {
    itemCode: '204817563238',
    storeId: 155,
    itemName: '针织开衫 春秋薄款外套',
    categoryName: 'Knitwear',
    imgUrl: p7,
    price: 33,
    unitsBase: 0.35,
    ads: [{ adType: 'ppc', share: 0.4, roas: 1.2 }],
  },
];

export const LINK_MAP = LINKS.reduce<Record<string, LinkInfo>>((acc, link) => {
  acc[link.itemCode] = link;
  return acc;
}, {});

export const STORE_MAP = STORES.reduce<Record<number, StoreInfo>>((acc, store) => {
  acc[store.storeId] = store;
  return acc;
}, {});

export const STORE_OPTIONS = [
  { value: 'all', label: '全部店铺（店群）' },
  ...STORES.map((store) => ({ value: String(store.storeId), label: `${store.storeName}（${store.aliasName}）` })),
];

/** 系统里的订单标签（演示数据，对应 order-label 接口的标签列表） */
export const ORDER_LABELS: Array<{ id: string; name: string; description: string }> = [
  { id: 'lbl-supplement', name: '补单', description: '卖家自己下的虚假成交单' },
  { id: 'lbl-brush', name: '刷单', description: '第三方代运营刷的单' },
  { id: 'lbl-gift', name: '赠品单', description: '赠品 / 0 元单，不计入真实 GMV' },
  { id: 'lbl-test', name: '测试单', description: '上新期间的测试下单' },
  { id: 'lbl-friend', name: '熟人单', description: '朋友 / 老客帮忙下的单' },
  { id: 'lbl-cashback', name: '返现单', description: '承诺返现换好评的订单' },
  { id: 'lbl-sample', name: '样品单', description: '寄样 / 达人试用单' },
  { id: 'lbl-offline', name: '线下转单', description: '线下成交后补录到线上的订单' },
];
