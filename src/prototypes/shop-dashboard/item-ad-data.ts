import p1 from '../ad-link-board/assets/p1.png';
import p2 from '../ad-link-board/assets/p2.png';
import p3 from '../ad-link-board/assets/p3.jpg';
import p4 from '../ad-link-board/assets/p4.png';
import p5 from '../ad-link-board/assets/p5.png';
import p6 from '../ad-link-board/assets/p6.png';
import p7 from '../ad-link-board/assets/p7.png';
import p8 from '../ad-link-board/assets/p8.png';
import p9 from '../ad-link-board/assets/p9.png';
import p10 from '../ad-link-board/assets/p10.jpg';
import p11 from '../ad-link-board/assets/p11.jpg';
import { AD_DAILY } from './ad-data';
import { eachDay, excludedGmvByDay, type AdExclusionConfig } from './ad-report';

interface ItemLink {
  itemCode: string;
  storeId: number;
  itemName: string;
  categoryName: string;
  imgUrl: string;
  price: number;
  unitsBase: number;
  ads: Array<{ share: number; roas: number }>;
}

const CATALOG: ItemLink[] = [
  {
    itemCode: '204817563219',
    storeId: 152,
    itemName: '女士复古真皮手提包 通勤单肩包',
    categoryName: 'Women Handbags',
    imgUrl: p1,
    price: 46,
    unitsBase: 0.9,
    ads: [{ share: 0.45, roas: 4.2 }],
  },
  {
    itemCode: '204817563220',
    storeId: 152,
    itemName: '老花帆布托特包 大容量通勤子母包',
    categoryName: 'Totes',
    imgUrl: p2,
    price: 58,
    unitsBase: 0.7,
    ads: [{ share: 0.5, roas: 3.6 }],
  },
  {
    itemCode: '204817563221',
    storeId: 152,
    itemName: '简约双肩背包 学生通勤旅行包',
    categoryName: 'Backpacks',
    imgUrl: p3,
    price: 39,
    unitsBase: 0.5,
    ads: [{ share: 0.35, roas: 3.0 }],
  },
  {
    itemCode: '204817563228',
    storeId: 152,
    itemName: '头层牛皮腋下手提包 大容量',
    categoryName: 'Women Handbags',
    imgUrl: p10,
    price: 68,
    unitsBase: 0.45,
    ads: [{ share: 0.4, roas: 5.1 }],
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
    ads: [{ share: 0.5, roas: 0.75 }],
  },
  {
    itemCode: '204817563230',
    storeId: 152,
    itemName: '迷你斜挎手机包 链条小方包',
    categoryName: 'Crossbody',
    imgUrl: '',
    price: 21,
    unitsBase: 0.8,
    ads: [{ share: 0.25, roas: 2.2 }],
  },
  {
    itemCode: '204817563224',
    storeId: 153,
    itemName: '真皮厚底小白鞋 百搭板鞋',
    categoryName: 'Sneakers',
    imgUrl: p6,
    price: 31,
    unitsBase: 1.2,
    ads: [
      { share: 0.55, roas: 2.4 },
      { share: 0.2, roas: 2.1 },
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
    ads: [{ share: 0.4, roas: 3.1 }],
  },
  {
    itemCode: '204817563234',
    storeId: 153,
    itemName: '加绒保暖短靴 冬季通勤靴',
    categoryName: 'Boots',
    imgUrl: '',
    price: 42,
    unitsBase: 0.3,
    ads: [{ share: 0.5, roas: 1.6 }],
  },
  {
    itemCode: '204817563235',
    storeId: 153,
    itemName: '轻量运动跑鞋 透气网面',
    categoryName: 'Sneakers',
    imgUrl: p6,
    price: 28,
    unitsBase: 0.9,
    ads: [{ share: 0.3, roas: 2.0 }],
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
  {
    itemCode: '204817563225',
    storeId: 155,
    itemName: '法式碎花连衣裙 收腰显瘦长裙',
    categoryName: 'Dresses',
    imgUrl: p7,
    price: 35,
    unitsBase: 0.8,
    ads: [{ share: 0.5, roas: 3.2 }],
  },
  {
    itemCode: '204817563226',
    storeId: 155,
    itemName: '女士西装外套 通勤职业套装',
    categoryName: 'Blazers',
    imgUrl: p8,
    price: 62,
    unitsBase: 0.4,
    ads: [{ share: 0.45, roas: 2.8 }],
  },
  {
    itemCode: '204817563227',
    storeId: 155,
    itemName: '纯棉圆领短袖T恤 宽松打底衫',
    categoryName: 'Tops',
    imgUrl: p9,
    price: 14,
    unitsBase: 1.5,
    ads: [{ share: 0.2, roas: 2.6 }],
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
    ads: [{ share: 0.4, roas: 1.2 }],
  },
];

export interface ItemLinkInfo {
  itemCode: string;
  storeId: number;
  itemName: string;
  categoryName: string;
  imgUrl: string;
  hasAd: boolean;
}

export const ITEM_LINK_MAP: Record<string, ItemLinkInfo> = CATALOG.reduce<Record<string, ItemLinkInfo>>((acc, item) => {
  acc[item.itemCode] = {
    itemCode: item.itemCode,
    storeId: item.storeId,
    itemName: item.itemName,
    categoryName: item.categoryName,
    imgUrl: item.imgUrl,
    hasAd: item.ads.length > 0,
  };
  return acc;
}, {});

export interface ItemAdRow extends ItemLinkInfo {
  adCost: number;
  adGmv: number;
  linkGmv: number;
  adRatio: number | null;
  roas: number | null;
}

export interface ItemDayRow {
  itemCode: string;
  date: string;
  adCost: number;
  adGmv: number;
  linkGmv: number;
}

function hash01(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967296;
}

function jitter(seed: string): number {
  return 0.75 + 0.5 * hash01(seed);
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function weightOf(item: ItemLink, key: 'gmv' | 'adGmv' | 'adCost'): number {
  if (key === 'gmv') return item.price * item.unitsBase;
  if (key === 'adGmv') return item.ads.reduce((sum, ad) => sum + ad.share, 0);
  return item.ads.reduce((sum, ad) => sum + ad.share / ad.roas, 0);
}

export function buildItemDaily(
  storeId: number,
  from: string,
  to: string,
  excludeEnabled: boolean,
  configs: AdExclusionConfig[],
): ItemDayRow[] {
  const links = CATALOG.filter((item) => item.storeId === storeId);
  const excluded = excludedGmvByDay(storeId, from, to, excludeEnabled, configs);
  const rows: ItemDayRow[] = [];
  eachDay(from, to).forEach((date) => {
    const day = AD_DAILY.find((row) => row.storeId === storeId && row.date === date);
    if (!day) return;
    const storeGmv = Math.max(0, day.storeGmv - (excluded.get(date) || 0));
    const jitters = links.map((item) => ({
      item,
      gmv: weightOf(item, 'gmv') * jitter(`${storeId}|${item.itemCode}|${date}|gmv`),
      adGmv: weightOf(item, 'adGmv') * jitter(`${storeId}|${item.itemCode}|${date}|adGmv`),
      adCost: weightOf(item, 'adCost') * jitter(`${storeId}|${item.itemCode}|${date}|adCost`),
    }));
    const sumGmv = jitters.reduce((sum, entry) => sum + entry.gmv, 0);
    const sumAdGmv = jitters.reduce((sum, entry) => sum + entry.adGmv, 0);
    const sumAdCost = jitters.reduce((sum, entry) => sum + entry.adCost, 0);
    jitters.forEach((entry) => {
      rows.push({
        itemCode: entry.item.itemCode,
        date,
        adCost: sumAdCost > 0 ? round2((day.adCost * entry.adCost) / sumAdCost) : 0,
        adGmv: sumAdGmv > 0 ? round2((day.adGmv * entry.adGmv) / sumAdGmv) : 0,
        linkGmv: sumGmv > 0 ? round2((storeGmv * entry.gmv) / sumGmv) : 0,
      });
    });
  });
  return rows;
}

export function aggregateItemRows(storeId: number, daily: ItemDayRow[]): ItemAdRow[] {
  const map = new Map<string, ItemAdRow>();
  CATALOG.filter((item) => item.storeId === storeId).forEach((item) => {
    map.set(item.itemCode, {
      itemCode: item.itemCode,
      storeId,
      itemName: item.itemName,
      categoryName: item.categoryName,
      imgUrl: item.imgUrl,
      hasAd: item.ads.length > 0,
      adCost: 0,
      adGmv: 0,
      linkGmv: 0,
      adRatio: null,
      roas: null,
    });
  });
  daily.forEach((row) => {
    const target = map.get(row.itemCode);
    if (!target) return;
    target.adCost += row.adCost;
    target.adGmv += row.adGmv;
    target.linkGmv += row.linkGmv;
  });
  const rows = Array.from(map.values());
  rows.forEach((row) => {
    row.adCost = round2(row.adCost);
    row.adGmv = round2(row.adGmv);
    row.linkGmv = round2(row.linkGmv);
    row.adRatio = row.hasAd && row.linkGmv > 0 ? row.adGmv / row.linkGmv : null;
    row.roas = row.hasAd && row.adCost > 0 ? row.adGmv / row.adCost : null;
  });
  return rows.sort((a, b) => b.linkGmv - a.linkGmv);
}

export function buildItemRows(
  storeId: number,
  from: string,
  to: string,
  excludeEnabled: boolean,
  configs: AdExclusionConfig[],
): ItemAdRow[] {
  return aggregateItemRows(storeId, buildItemDaily(storeId, from, to, excludeEnabled, configs));
}
