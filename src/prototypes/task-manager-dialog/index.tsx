/**
 * @name 任务管理器弹窗
 */

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import productBag from './assets/product-bag.png';
import productDress from './assets/product-dress.png';
import productSneaker from './assets/product-sneaker.png';
import productSuit from './assets/product-suit.png';
import './style.css';

const pad2 = (n: number) => String(n).padStart(2, '0');

type TaskTabKey = 'claim' | 'batch-edit' | 'batch-image' | 'video-upload' | 'publish' | 'clone' | 'product-sync' | 'order-sync' | 'export';

const TASK_TABS: Array<{ key: TaskTabKey; label: string }> = [
  { key: 'claim', label: '认领' },
  { key: 'batch-edit', label: '批量编辑' },
  { key: 'batch-image', label: '批量美图' },
  { key: 'video-upload', label: '视频上传' },
  { key: 'publish', label: '刊登' },
  { key: 'clone', label: '克隆' },
  { key: 'product-sync', label: '商品同步' },
  { key: 'order-sync', label: '订单同步' },
  { key: 'export', label: '导出' },
];

type ProductCurrentStatus =
  | '待发布'
  | '发布中'
  | '循环刊登'
  | '发布失败'
  | '已上架'
  | '已下架'
  | '待审核'
  | '审核未通过'
  | '内容违规'
  | '侵权违规'
  | '品牌商投诉';
type ProductLoopState = '循环中' | '循环结束' | '开启新循环';
type PublishResult = '待发布' | '发布中' | '待审核' | '审核不通过' | '循环刊登' | '发布失败';

type ProductKey =
  | 'dress'
  | 'kidsCanvas'
  | 'blackBackpack'
  | 'jacket'
  | 'shoulderBag'
  | 'kidsSneaker'
  | 'travelBackpack'
  | 'tote'
  | 'runningShoes'
  | 'briefcase'
  | 'chainBag'
  | 'schoolBag'
  | 'leatherHandbag'
  | 'canvasSneaker';

type PublishProduct = {
  id: string;
  title: string;
  image: string;
  shopName: string;
  shopAlias: string;
  loopState?: ProductLoopState;
  attempts?: number;
  publishResult?: PublishResult;
  failReason?: string;
  current: ProductCurrentStatus;
};

type PublishRecord = {
  id: string;
  time: string;
  isLoop: boolean;
  loopLimit?: number;
  products: PublishProduct[];
};

const PRODUCT_CATALOG: Record<ProductKey, Pick<PublishProduct, 'id' | 'title' | 'image' | 'shopName' | 'shopAlias'>> = {
  dress: { id: '22098134561', title: '夏季碎花连衣裙', image: productDress, shopName: 'clothes', shopAlias: '服装测试' },
  kidsCanvas: { id: '22098134562', title: '儿童帆布鞋', image: productSneaker, shopName: 'sneakerhub8', shopAlias: '运营测试-张诗淇专用' },
  blackBackpack: { id: '22098134563', title: '双肩包（黑）', image: productBag, shopName: '包包', shopAlias: 'bag' },
  jacket: { id: '22098134564', title: '男士休闲夹克', image: productSuit, shopName: 'clothes', shopAlias: '服装测试' },
  shoulderBag: { id: '22098134565', title: '女士单肩包', image: productBag, shopName: '包包', shopAlias: 'bag' },
  kidsSneaker: { id: '22098134566', title: '儿童运动鞋', image: productSneaker, shopName: 'sneakerhub8', shopAlias: '运营测试-张诗淇专用' },
  travelBackpack: { id: '22098134567', title: '防水旅行背包', image: productBag, shopName: '包包', shopAlias: 'bag' },
  tote: { id: '22098134568', title: '简约托特包', image: productBag, shopName: '包包', shopAlias: 'bag' },
  runningShoes: { id: '22098134569', title: '轻便跑步鞋', image: productSneaker, shopName: '鞋子', shopAlias: 'shoes' },
  briefcase: { id: '22098134570', title: '男士商务公文包', image: productBag, shopName: '包包', shopAlias: 'bag' },
  chainBag: { id: '22098134571', title: '女士链条小方包', image: productBag, shopName: '包包', shopAlias: 'bag' },
  schoolBag: { id: '22098134572', title: '学生双肩书包', image: productBag, shopName: '包包', shopAlias: 'bag' },
  leatherHandbag: { id: '22098134573', title: '真皮女士手提包', image: productBag, shopName: '包包', shopAlias: 'bag' },
  canvasSneaker: { id: '22098134574', title: '休闲帆布板鞋', image: productSneaker, shopName: '鞋子', shopAlias: 'shoes' },
};

const product = (key: ProductKey, extra: Omit<PublishProduct, 'id' | 'title' | 'image' | 'shopName' | 'shopAlias'>): PublishProduct => ({
  ...PRODUCT_CATALOG[key],
  ...extra,
});

const PUBLISH_RECORDS: PublishRecord[] = [
  {
    id: 'r-1', time: '2026-11-02 10:30:24', isLoop: true, loopLimit: 5,
    products: [
      product('dress', { loopState: '循环中', attempts: 3, publishResult: '待审核', current: '待审核' }),
      product('kidsCanvas', { loopState: '开启新循环', attempts: 3, publishResult: '循环刊登', current: '已上架' }),
      product('blackBackpack', { loopState: '循环结束', attempts: 2, publishResult: '循环刊登', current: '已上架' }),
      product('jacket', { loopState: '循环结束', attempts: 5, publishResult: '审核不通过', failReason: '审核不通过：标题含侵权品牌词「designer」', current: '审核未通过' }),
      product('shoulderBag', { loopState: '循环结束', attempts: 5, publishResult: '待审核', current: '已上架' }),
      product('kidsSneaker', { loopState: '循环中', attempts: 1, publishResult: '待审核', current: '待审核' }),
    ],
  },
  {
    id: 'r-2', time: '2026-11-01 18:12:07', isLoop: false,
    products: [
      product('travelBackpack', { current: '已上架' }),
      product('tote', { current: '已上架' }),
      product('runningShoes', { publishResult: '发布失败', failReason: '发布失败：平台接口超时，请稍后重试', current: '发布失败' }),
    ],
  },
  {
    id: 'r-3', time: '2026-11-01 09:45:51', isLoop: true, loopLimit: 10,
    products: [
      product('briefcase', { loopState: '循环结束', attempts: 10, publishResult: '发布失败', failReason: '发布失败：详情图含平台违禁图案', current: '内容违规' }),
      product('chainBag', { loopState: '循环结束', attempts: 6, publishResult: '循环刊登', current: '已上架' }),
      product('schoolBag', { loopState: '循环中', attempts: 4, publishResult: '待审核', current: '循环刊登' }),
      product('canvasSneaker', { loopState: '循环结束', attempts: 10, publishResult: '发布失败', failReason: '发布失败：主图与他人商品图片高度相似，判定侵权', current: '侵权违规' }),
      product('leatherHandbag', { loopState: '循环结束', attempts: 7, publishResult: '循环刊登', current: '已上架' }),
    ],
  },
  {
    id: 'r-4', time: '2026-10-31 20:05:13', isLoop: false,
    products: [
      product('shoulderBag', { current: '已上架' }),
      product('kidsSneaker', { current: '已上架' }),
    ],
  },
  {
    id: 'r-5', time: '2026-10-30 14:20:38', isLoop: true, loopLimit: 5,
    products: [
      product('blackBackpack', { loopState: '开启新循环', attempts: 5, publishResult: '循环刊登', current: '已上架' }),
      product('jacket', { loopState: '循环结束', attempts: 5, publishResult: '审核不通过', failReason: '审核不通过：类目与商品不符', current: '审核未通过' }),
      product('kidsCanvas', { loopState: '循环结束', attempts: 3, publishResult: '循环刊登', current: '已上架' }),
      product('chainBag', { loopState: '循环中', attempts: 2, publishResult: '待审核', current: '发布中' }),
    ],
  },
  {
    id: 'r-6', time: '2026-10-29 11:08:02', isLoop: false,
    products: [
      product('runningShoes', { current: '已上架' }),
      product('schoolBag', { publishResult: '待审核', current: '待审核' }),
      product('tote', { current: '已上架' }),
    ],
  },
  {
    id: 'r-7', time: '2026-10-28 16:40:19', isLoop: false,
    products: [
      product('leatherHandbag', { publishResult: '发布失败', failReason: '发布失败：主图上传失败，图片格式不支持', current: '已下架' }),
    ],
  },
  {
    id: 'r-8', time: '2026-10-27 09:15:44', isLoop: true, loopLimit: 3,
    products: [
      product('travelBackpack', { loopState: '循环结束', attempts: 3, publishResult: '循环刊登', current: '已上架' }),
      product('canvasSneaker', { loopState: '循环结束', attempts: 3, publishResult: '发布失败', failReason: '发布失败：商品标题使用未授权品牌词，已被品牌商投诉', current: '品牌商投诉' }),
      product('briefcase', { loopState: '循环结束', attempts: 3, publishResult: '待审核', current: '已上架' }),
      product('shoulderBag', { loopState: '循环结束', attempts: 3, publishResult: '审核不通过', failReason: '审核不通过：标题超过平台 128 字上限', current: '审核未通过' }),
    ],
  },
];

type TaskKind = 'claim' | 'batch-edit' | 'clone';
type TaskResult = 'success' | 'fail' | 'pending';
type TaskFailure = { item?: string; reason: string };
type ClonePublishResult = '待刊登' | '刊登中' | '刊登成功' | '刊登失败';
type ClonePublish = { result: ClonePublishResult; reason?: string };
type TaskShopResult = { shop: string; result: TaskResult; failures?: TaskFailure[]; publish?: ClonePublish };
type TaskProduct = {
  key: ProductKey;
  result: TaskResult;
  failures?: TaskFailure[];
  shopResults?: TaskShopResult[];
  publish?: ClonePublish;
};
type TaskRecord = {
  id: string;
  kind: TaskKind;
  time: string;
  finishTime?: string;
  shops?: string[];
  claimMode?: '仅认领' | '认领并发布';
  editItems?: string[];
  cloneMode?: '克隆到原店铺' | '克隆到目标店铺';
  cloneWay?: '克隆' | '克隆并刊登';
  cloneConfig?: string[];
  products: TaskProduct[];
};

const taskProduct = (key: ProductKey, result: TaskResult, failures?: TaskFailure[], publish?: ClonePublish): TaskProduct => ({ key, result, failures, publish });

/** 多店铺任务：逐店铺给结果，商品结果取最差的一项（失败 > 处理中 > 成功） */
const multiProduct = (
  key: ProductKey,
  shops: string[],
  defaultResult: TaskResult,
  exceptions: Record<string, { result: TaskResult; failures?: TaskFailure[]; publish?: ClonePublish }> = {},
  defaultPublish?: ClonePublish,
): TaskProduct => {
  const shopResults = shops.map((shop) => {
    const exception = exceptions[shop];
    return {
      shop,
      result: exception?.result ?? defaultResult,
      failures: exception?.failures,
      publish: exception ? exception.publish : defaultPublish,
    };
  });
  const result: TaskResult = shopResults.some((item) => item.result === 'fail')
    ? 'fail'
    : shopResults.some((item) => item.result === 'pending')
      ? 'pending'
      : 'success';
  const failures = shopResults.flatMap((item) => item.failures ?? []);
  return { key, result, failures, shopResults };
};

const CLAIM_SHOPS = ['klyto', 'sneakerhub8'];
const MANY_SHOPS = ['klyto', 'sneakerhub8', 'clothes', '包包', '鞋子'];
const claimedRepeat = (shop: string): TaskFailure[] => [{ reason: `该商品已经认领到店铺[${shop}]` }];

const CLAIM_TASKS: TaskRecord[] = [
  {
    id: 'claim-1', kind: 'claim', time: '2026-11-11 10:26:18',
    shops: CLAIM_SHOPS, claimMode: '仅认领',
    products: [
      multiProduct('dress', CLAIM_SHOPS, 'success'),
      multiProduct('kidsCanvas', CLAIM_SHOPS, 'success', {
        sneakerhub8: { result: 'fail', failures: claimedRepeat('sneakerhub8') },
      }),
      multiProduct('blackBackpack', CLAIM_SHOPS, 'success'),
      multiProduct('jacket', CLAIM_SHOPS, 'success'),
      multiProduct('shoulderBag', CLAIM_SHOPS, 'success'),
      multiProduct('kidsSneaker', CLAIM_SHOPS, 'pending'),
      multiProduct('travelBackpack', CLAIM_SHOPS, 'pending'),
      multiProduct('tote', CLAIM_SHOPS, 'success', {
        klyto: { result: 'fail', failures: claimedRepeat('klyto') },
      }),
    ],
  },
  {
    id: 'claim-6', kind: 'claim', time: '2026-11-11 09:15:02',
    finishTime: '2026-11-11 09:18:40',
    shops: MANY_SHOPS, claimMode: '仅认领',
    products: [
      multiProduct('jacket', MANY_SHOPS, 'success', {
        鞋子: { result: 'fail', failures: claimedRepeat('鞋子') },
      }),
      multiProduct('tote', MANY_SHOPS, 'success', {
        klyto: { result: 'fail', failures: claimedRepeat('klyto') },
      }),
      multiProduct('dress', MANY_SHOPS, 'success'),
      multiProduct('shoulderBag', MANY_SHOPS, 'success'),
    ],
  },
  {
    id: 'claim-2', kind: 'claim', time: '2026-11-10 16:04:52',
    finishTime: '2026-11-10 16:07:12',
    shops: ['klyto'], claimMode: '仅认领',
    products: [
      taskProduct('shoulderBag', 'success'),
      taskProduct('kidsSneaker', 'success'),
      taskProduct('schoolBag', 'fail', claimedRepeat('klyto')),
      taskProduct('canvasSneaker', 'fail', claimedRepeat('klyto')),
      taskProduct('leatherHandbag', 'fail', claimedRepeat('klyto')),
      taskProduct('travelBackpack', 'success'),
      taskProduct('tote', 'success'),
      taskProduct('runningShoes', 'success'),
      taskProduct('briefcase', 'success'),
      taskProduct('chainBag', 'success'),
    ],
  },
  {
    id: 'claim-3', kind: 'claim', time: '2026-11-10 11:18:37',
    finishTime: '2026-11-10 11:20:05',
    shops: ['klyto'], claimMode: '认领并发布',
    products: [
      taskProduct('dress', 'success'),
      taskProduct('jacket', 'success'),
      taskProduct('shoulderBag', 'success'),
      taskProduct('chainBag', 'success'),
      taskProduct('tote', 'success'),
      taskProduct('schoolBag', 'success'),
    ],
  },
  {
    id: 'claim-4', kind: 'claim', time: '2026-11-09 19:31:05',
    finishTime: '2026-11-09 19:32:18',
    shops: ['sneakerhub8'], claimMode: '仅认领',
    products: [
      taskProduct('kidsSneaker', 'success'),
      taskProduct('runningShoes', 'success'),
      taskProduct('canvasSneaker', 'success'),
      taskProduct('travelBackpack', 'success'),
    ],
  },
  {
    id: 'claim-5', kind: 'claim', time: '2026-11-08 14:52:10',
    finishTime: '2026-11-08 14:55:33',
    shops: ['clothes'], claimMode: '仅认领',
    products: [
      taskProduct('dress', 'success'),
      taskProduct('jacket', 'success'),
      taskProduct('shoulderBag', 'success'),
      taskProduct('tote', 'success'),
      taskProduct('leatherHandbag', 'fail', claimedRepeat('clothes')),
    ],
  },
];

const BATCH_EDIT_TASKS: TaskRecord[] = [
  {
    id: 'batch-1', kind: 'batch-edit', time: '2026-11-11 10:31:09',
    editItems: ['标题', '类目', '价格'],
    products: [
      taskProduct('dress', 'success'),
      taskProduct('kidsCanvas', 'success'),
      taskProduct('blackBackpack', 'success'),
      taskProduct('jacket', 'success'),
      taskProduct('shoulderBag', 'success'),
      taskProduct('kidsSneaker', 'pending'),
      taskProduct('travelBackpack', 'pending'),
      taskProduct('tote', 'pending'),
      taskProduct('runningShoes', 'pending'),
      taskProduct('briefcase', 'pending'),
      taskProduct('chainBag', 'pending'),
      taskProduct('schoolBag', 'pending'),
    ],
  },
  {
    id: 'batch-2', kind: 'batch-edit', time: '2026-11-10 15:22:41',
    finishTime: '2026-11-10 15:24:09',
    editItems: ['标题', '主图'],
    products: [
      taskProduct('canvasSneaker', 'fail', [
        { item: '标题', reason: '超过平台 128 字上限' },
        { item: '主图', reason: '源图下载失败（404）' },
      ]),
      taskProduct('leatherHandbag', 'fail', [{ item: '标题', reason: '命中平台违禁词「designer」' }]),
      taskProduct('travelBackpack', 'success'),
      taskProduct('tote', 'success'),
      taskProduct('runningShoes', 'success'),
      taskProduct('briefcase', 'success'),
      taskProduct('chainBag', 'success'),
      taskProduct('schoolBag', 'success'),
    ],
  },
  {
    id: 'batch-3', kind: 'batch-edit', time: '2026-11-09 10:12:30',
    finishTime: '2026-11-09 10:14:22',
    editItems: ['类目', '属性'],
    products: [
      taskProduct('dress', 'success'),
      taskProduct('kidsCanvas', 'success'),
      taskProduct('blackBackpack', 'success'),
      taskProduct('jacket', 'success'),
      taskProduct('shoulderBag', 'success'),
      taskProduct('kidsSneaker', 'success'),
      taskProduct('travelBackpack', 'success'),
      taskProduct('tote', 'success'),
      taskProduct('runningShoes', 'success'),
      taskProduct('briefcase', 'success'),
    ],
  },
  {
    id: 'batch-4', kind: 'batch-edit', time: '2026-11-08 17:45:22',
    finishTime: '2026-11-08 17:46:51',
    editItems: ['价格'],
    products: [
      taskProduct('dress', 'success'),
      taskProduct('jacket', 'success'),
      taskProduct('shoulderBag', 'success'),
      taskProduct('tote', 'success'),
      taskProduct('chainBag', 'fail', [{ item: '价格', reason: '低于平台最低限价，未通过校验' }]),
    ],
  },
  {
    id: 'batch-5', kind: 'batch-edit', time: '2026-11-11 10:36:02',
    editItems: ['图片视频', '翻译'],
    products: [
      taskProduct('blackBackpack', 'success'),
      taskProduct('jacket', 'success'),
      taskProduct('tote', 'fail', [{ item: '图片视频', reason: '视频转码失败' }]),
      taskProduct('kidsSneaker', 'pending'),
      taskProduct('runningShoes', 'pending'),
      taskProduct('chainBag', 'pending'),
    ],
  },
];

const CLONE_TASKS: TaskRecord[] = [
  {
    id: 'clone-1', kind: 'clone', time: '2026-11-11 10:35:44',
    shops: ['sneakerhub8'], cloneMode: '克隆到目标店铺', cloneWay: '克隆并刊登', cloneConfig: ['主图顺序随机打乱', 'AI 重新生成标题'],
    products: [
      taskProduct('dress', 'success', undefined, { result: '刊登成功' }),
      taskProduct('kidsCanvas', 'success', undefined, { result: '刊登成功' }),
      taskProduct('blackBackpack', 'success', undefined, { result: '刊登失败', reason: '刊登失败：店铺商品数已达上限' }),
      taskProduct('jacket', 'success', undefined, { result: '刊登中' }),
      taskProduct('tote', 'success', undefined, { result: '待刊登' }),
      taskProduct('shoulderBag', 'fail', [{ reason: '店铺[sneakerhub8]：商品数已达上限' }]),
      taskProduct('kidsSneaker', 'pending'),
      taskProduct('travelBackpack', 'pending'),
      taskProduct('runningShoes', 'pending'),
      taskProduct('briefcase', 'pending'),
    ],
  },
  {
    id: 'clone-2', kind: 'clone', time: '2026-11-10 14:08:19',
    finishTime: '2026-11-10 14:09:46',
    shops: ['klyto'], cloneMode: '克隆到原店铺', cloneWay: '克隆', cloneConfig: ['主图顺序随机打乱'],
    products: [
      taskProduct('dress', 'fail', [{ reason: '目标店铺已存在相同商品（父SKU 20261110000046）' }]),
      taskProduct('leatherHandbag', 'fail', [{ reason: '主图处理失败：源图下载超时' }]),
      taskProduct('jacket', 'success'),
      taskProduct('shoulderBag', 'success'),
      taskProduct('tote', 'success'),
    ],
  },
  {
    id: 'clone-3', kind: 'clone', time: '2026-11-09 09:20:06',
    finishTime: '2026-11-09 09:21:30',
    shops: ['clothes'], cloneMode: '克隆到目标店铺', cloneWay: '克隆', cloneConfig: ['AI 重新生成标题'],
    products: [
      taskProduct('dress', 'success'),
      taskProduct('kidsCanvas', 'success'),
      taskProduct('chainBag', 'success'),
      taskProduct('schoolBag', 'success'),
    ],
  },
  {
    id: 'clone-4', kind: 'clone', time: '2026-11-08 20:11:55',
    finishTime: '2026-11-08 20:13:07',
    shops: ['klyto', 'sneakerhub8'], cloneMode: '克隆到目标店铺', cloneWay: '克隆并刊登', cloneConfig: [],
    products: [
      multiProduct('jacket', ['klyto', 'sneakerhub8'], 'success', {}, { result: '刊登成功' }),
      multiProduct('tote', ['klyto', 'sneakerhub8'], 'success', {}, { result: '刊登成功' }),
      multiProduct('runningShoes', ['klyto', 'sneakerhub8'], 'success', {
        sneakerhub8: { result: 'fail', failures: [{ reason: '店铺[sneakerhub8]：主图不足 5 张' }] },
      }, { result: '刊登成功' }),
    ],
  },
];

const TASK_SOURCE: Record<TaskKind, TaskRecord[]> = {
  claim: CLAIM_TASKS,
  'batch-edit': BATCH_EDIT_TASKS,
  clone: CLONE_TASKS,
};

type SyncKind = 'product-sync' | 'order-sync';
type SyncType = '自动同步' | '手动同步';
type SyncShopItem = {
  platform: string;
  shop: string;
  result: TaskResult;
  count?: number;
  finishTime?: string;
  reason?: string;
  orderItems?: Array<{ orderNo: string; result: TaskResult; finishTime?: string; reason?: string }>;
};
type SyncTaskRecord = {
  id: string;
  kind: SyncKind;
  time: string;
  type: SyncType;
  shops: string[];
  mode?: '全量' | '快速';
  dateRange?: string;
  onlyUnhandled?: boolean;
  items: SyncShopItem[];
};

const PRODUCT_SYNC_TASKS: SyncTaskRecord[] = [
  {
    id: 'product-1', kind: 'product-sync', time: '2026-11-11 10:41:12',
    type: '手动同步',
    shops: ['klyto', 'sneakerhub8', '包包', 'clothes'], mode: '快速',
    items: [
      { platform: '敦煌网', shop: 'klyto', result: 'success', count: 1421, finishTime: '2026-11-11 10:41:58' },
      { platform: '敦煌网', shop: 'sneakerhub8', result: 'success', count: 306, finishTime: '2026-11-11 10:42:15' },
      { platform: 'Shopify', shop: '包包', result: 'pending', count: 84 },
      { platform: '拼多多', shop: 'clothes', result: 'fail', reason: '店铺授权已失效', finishTime: '2026-11-11 10:41:31' },
    ],
  },
  {
    id: 'product-2', kind: 'product-sync', time: '2026-11-10 18:02:44',
    type: '自动同步',
    shops: ['klyto', 'runstepshop'], mode: '全量',
    items: [
      { platform: '敦煌网', shop: 'klyto', result: 'success', count: 1383, finishTime: '2026-11-10 18:04:12' },
      { platform: 'Shopify', shop: 'runstepshop', result: 'success', count: 218, finishTime: '2026-11-10 18:05:31' },
    ],
  },
  {
    id: 'product-3', kind: 'product-sync', time: '2026-11-09 09:30:10',
    type: '自动同步',
    shops: ['klyto', 'sneakerhub8', 'clothes'], mode: '全量',
    items: [
      { platform: '敦煌网', shop: 'klyto', result: 'success', count: 1579, finishTime: '2026-11-09 09:33:20' },
      { platform: '敦煌网', shop: 'sneakerhub8', result: 'success', count: 421, finishTime: '2026-11-09 09:34:02' },
      { platform: '拼多多', shop: 'clothes', result: 'success', count: 268, finishTime: '2026-11-09 09:36:48' },
    ],
  },
  {
    id: 'product-4', kind: 'product-sync', time: '2026-11-08 16:20:05',
    type: '手动同步',
    shops: ['klyto', 'sneakerhub8'], mode: '快速',
    items: [
      { platform: '敦煌网', shop: 'klyto', result: 'success', count: 12, finishTime: '2026-11-08 16:20:21' },
      { platform: '敦煌网', shop: 'sneakerhub8', result: 'success', count: 8, finishTime: '2026-11-08 16:20:39' },
    ],
  },
];

const ORDER_SYNC_TASKS: SyncTaskRecord[] = [
  {
    id: 'order-1', kind: 'order-sync', time: '2026-11-11 10:45:20',
    type: '手动同步',
    shops: ['klyto', 'echvolt12'], dateRange: '2026-11-01 至 2026-11-11',
    items: [
      {
        platform: '敦煌网', shop: 'klyto', result: 'success', count: 86, finishTime: '2026-11-11 10:45:52',
        orderItems: [
          { orderNo: '323839532081', result: 'success', finishTime: '2026-11-11 10:45:48' },
          { orderNo: '323837779579', result: 'success', finishTime: '2026-11-11 10:45:52' },
        ],
      },
      {
        platform: '敦煌网', shop: 'echvolt12', result: 'pending', count: 27,
        orderItems: [
          { orderNo: '323839532081', result: 'success', finishTime: '2026-11-11 10:45:55' },
          { orderNo: '323837779579', result: 'fail', reason: '订单已删除' },
          { orderNo: '323835120764', result: 'pending' },
        ],
      },
    ],
  },
  {
    id: 'order-2', kind: 'order-sync', time: '2026-11-10 17:26:08',
    type: '自动同步',
    shops: ['klyto', 'runstepshop', 'echvolt12'], dateRange: '2026-11-09 至 2026-11-10', onlyUnhandled: true,
    items: [
      { platform: '敦煌网', shop: 'klyto', result: 'success', count: 42, finishTime: '2026-11-10 17:28:40' },
      { platform: 'Shopify', shop: 'runstepshop', result: 'success', count: 12, finishTime: '2026-11-10 17:30:05' },
      { platform: '敦煌网', shop: 'echvolt12', result: 'fail', reason: '同步请求超时', finishTime: '2026-11-10 17:27:02' },
    ],
  },
  {
    id: 'order-3', kind: 'order-sync', time: '2026-11-09 11:15:33',
    type: '手动同步',
    shops: ['klyto', 'echvolt12'],
    items: [
      {
        platform: '敦煌网', shop: 'klyto', result: 'success', count: 2, finishTime: '2026-11-09 11:15:48',
        orderItems: [
          { orderNo: '323839532081', result: 'success', finishTime: '2026-11-09 11:15:48' },
          { orderNo: '323837779579', result: 'success', finishTime: '2026-11-09 11:15:56' },
        ],
      },
      {
        platform: '敦煌网', shop: 'echvolt12', result: 'success', count: 2, finishTime: '2026-11-09 11:16:02',
        orderItems: [
          { orderNo: '323839532081', result: 'success', finishTime: '2026-11-09 11:16:02' },
          { orderNo: '323837779579', result: 'success', finishTime: '2026-11-09 11:16:10' },
        ],
      },
    ],
  },
  {
    id: 'order-4', kind: 'order-sync', time: '2026-11-08 09:05:12',
    type: '自动同步',
    shops: ['klyto'], dateRange: '2026-11-07 至 2026-11-08',
    items: [
      { platform: '敦煌网', shop: 'klyto', result: 'success', count: 64, finishTime: '2026-11-08 09:07:45' },
    ],
  },
];

const SYNC_TASKS: Record<SyncKind, SyncTaskRecord[]> = {
  'product-sync': PRODUCT_SYNC_TASKS,
  'order-sync': ORDER_SYNC_TASKS,
};

type ExportSource = '我的商品' | '我的订单' | '认领中心' | '采购单跟踪' | '订单明细报表' | '国际物流轨迹';
type ExportStatus = '导出中' | '导出成功' | '导出失败';
type ExportRecord = {
  id: string;
  time: string;
  source: ExportSource;
  count: number;
  status: ExportStatus;
  finishTime?: string;
};

const EXPORT_SOURCES: ExportSource[] = ['我的商品', '我的订单', '认领中心', '采购单跟踪', '订单明细报表', '国际物流轨迹'];

const EXPORT_RECORDS: ExportRecord[] = [
  { id: 'export-1', time: '2026-11-11 10:52:36', source: '我的商品', count: 3482, status: '导出成功', finishTime: '2026-11-11 10:53:02' },
  { id: 'export-2', time: '2026-11-11 09:48:12', source: '我的订单', count: 1206, status: '导出成功', finishTime: '2026-11-11 09:48:31' },
  { id: 'export-3', time: '2026-11-10 18:30:47', source: '订单明细报表', count: 5730, status: '导出中' },
  { id: 'export-4', time: '2026-11-10 15:12:09', source: '认领中心', count: 864, status: '导出成功', finishTime: '2026-11-10 15:12:26' },
  { id: 'export-5', time: '2026-11-09 20:26:55', source: '采购单跟踪', count: 2318, status: '导出失败' },
  { id: 'export-6', time: '2026-11-09 11:40:31', source: '国际物流轨迹', count: 9204, status: '导出成功', finishTime: '2026-11-09 11:41:12' },
  { id: 'export-7', time: '2026-11-08 17:05:14', source: '我的商品', count: 12706, status: '导出失败' },
  { id: 'export-8', time: '2026-11-08 09:22:40', source: '我的订单', count: 438, status: '导出成功', finishTime: '2026-11-08 09:22:52' },
];

/** 下载文件内容按导出来源给样例表头，演示下载得到真实文件 */
const EXPORT_FILE_ROWS: Record<ExportSource, string[]> = {
  我的商品: [
    '商品编号,商品标题,店铺,平台,售价,库存,状态',
    '22098134561,夏季碎花连衣裙,clothes,敦煌网,12.90,120,已上架',
    '22098134563,双肩包（黑）,包包,敦煌网,28.50,86,已上架',
  ],
  我的订单: [
    '订单号,平台,店铺,下单时间,订单金额,币种,状态',
    '323839532081,敦煌网,klyto,2026-11-01 10:23:15,56.80,USD,已发货',
    '323837779579,敦煌网,klyto,2026-11-01 14:08:42,31.20,USD,待发货',
  ],
  认领中心: [
    '商品编号,商品标题,认领店铺,认领时间,认领状态',
    '22098134565,女士单肩包,klyto,2026-11-10 16:04:52,已认领',
    '22098134571,女士链条小方包,sneakerhub8,2026-11-10 16:04:53,已认领',
  ],
  采购单跟踪: [
    '采购单号,商品编号,商品标题,采购数量,采购状态,预计到货时间',
    'CG20261109001,22098134567,防水旅行背包,120,已下单,2026-11-18',
    'CG20261109002,22098134568,简约托特包,80,运输中,2026-11-16',
  ],
  订单明细报表: [
    '订单号,商品编号,商品标题,数量,单价,金额,下单时间',
    '323839532081,22098134561,夏季碎花连衣裙,2,12.90,25.80,2026-11-01 10:23:15',
    '323837779579,22098134564,男士休闲夹克,1,42.00,42.00,2026-11-01 14:08:42',
  ],
  国际物流轨迹: [
    '运单号,订单号,物流状态,最新轨迹,更新时间',
    'LP20261109001,323839532081,运输中,已到达洛杉矶分拨中心,2026-11-10 09:12:30',
    'LP20261109002,323837779579,已妥投,收件人已签收,2026-11-10 18:40:06',
  ],
};

const downloadExportFile = (record: ExportRecord) => {
  const csv = `\ufeff${EXPORT_FILE_ROWS[record.source].join('\n')}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${record.source}_${record.time.slice(0, 10).replace(/-/g, '')}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

type FailedImage = { image: string; reason: string };
type ImageTaskRecord = {
  id: string;
  time: string;
  productKey: ProductKey;
  imageCount: number;
  op: string;
  success: number;
  failed: number;
  failedImages: FailedImage[];
};

const failedImage = (key: ProductKey, reason: string): FailedImage => ({
  image: PRODUCT_CATALOG[key].image,
  reason,
});

const IMAGE_TASKS: ImageTaskRecord[] = [
  {
    id: 'image-1', time: '2026-11-11 10:56:24', productKey: 'dress', imageCount: 48, op: '转白底',
    success: 21, failed: 0, failedImages: [],
  },
  {
    id: 'image-2', time: '2026-11-11 09:30:08', productKey: 'jacket', imageCount: 24, op: '图片翻译',
    success: 22, failed: 2,
    failedImages: [
      failedImage('jacket', '翻译结果上传失败：目标存储超时'),
      failedImage('jacket', '未检测到可翻译文字，处理失败'),
    ],
  },
  {
    id: 'image-3', time: '2026-11-10 17:12:45', productKey: 'shoulderBag', imageCount: 36, op: '加水印',
    success: 36, failed: 0, failedImages: [],
  },
  {
    id: 'image-4', time: '2026-11-10 11:05:37', productKey: 'blackBackpack', imageCount: 12, op: '去水印',
    success: 9, failed: 3,
    failedImages: [
      failedImage('blackBackpack', '去水印失败：检测到多区域水印'),
      failedImage('blackBackpack', '源图下载失败（404）'),
      failedImage('blackBackpack', '图片格式不支持（CMYK）'),
    ],
  },
  {
    id: 'image-5', time: '2026-11-09 20:48:12', productKey: 'tote', imageCount: 60, op: '裁剪缩放',
    success: 37, failed: 0, failedImages: [],
  },
  {
    id: 'image-6', time: '2026-11-09 15:26:53', productKey: 'kidsSneaker', imageCount: 8, op: '转白底',
    success: 8, failed: 0, failedImages: [],
  },
  {
    id: 'image-7', time: '2026-11-08 10:14:29', productKey: 'runningShoes', imageCount: 18, op: '去水印',
    success: 13, failed: 5,
    failedImages: [
      failedImage('runningShoes', '去水印失败：检测到多区域水印'),
      failedImage('runningShoes', '源图下载失败（404）'),
      failedImage('runningShoes', '图片格式不支持（CMYK）'),
      failedImage('runningShoes', '图片尺寸超过 5000px，无法处理'),
      failedImage('runningShoes', '结果图上传失败：目标存储超时'),
    ],
  },
];

type VideoUploadStatus = '上传中' | '上传成功' | '上传失败';
type VideoTaskRecord = {
  id: string;
  time: string;
  productKey: ProductKey;
  videoName: string;
  videoIntroduction: string;
  duration: string;
  status: VideoUploadStatus;
  completedTime?: string;
  reason?: string;
};

const VIDEO_TASKS: VideoTaskRecord[] = [
  {
    id: 'video-1', time: '2026-11-21 14:32:10', productKey: 'leatherHandbag',
    videoName: 'leather-handbag-main.mp4', videoIntroduction: '真皮手提包开合、容量与上身效果展示',
    duration: '00:12', status: '上传中',
  },
  {
    id: 'video-2', time: '2026-11-21 14:20:05', productKey: 'shoulderBag',
    videoName: 'shoulder-bag-01.mp4', videoIntroduction: '单肩包背法演示与细节展示',
    duration: '00:08', status: '上传成功', completedTime: '2026-11-21 14:20:38',
  },
  {
    id: 'video-3', time: '2026-11-21 14:20:05', productKey: 'tote',
    videoName: 'tote-style.mp4', videoIntroduction: '托特包通勤搭配与容量展示',
    duration: '00:15', status: '上传成功', completedTime: '2026-11-21 14:21:02',
  },
  {
    id: 'video-4', time: '2026-11-21 14:20:05', productKey: 'travelBackpack',
    videoName: 'travel-backpack-product-video-final-v2.mp4', videoIntroduction: '旅行背包防水测试与收纳演示',
    duration: '00:10', status: '上传失败', completedTime: '2026-11-21 14:20:47',
    reason: '视频名称超过 30 个字符，请修改后重新上传',
  },
  {
    id: 'video-5', time: '2026-11-20 18:06:42', productKey: 'blackBackpack',
    videoName: 'backpack-detail.mp4', videoIntroduction: '双肩包正面、侧面与背带细节',
    duration: '00:09', status: '上传成功', completedTime: '2026-11-20 18:07:10',
  },
  {
    id: 'video-6', time: '2026-11-20 17:55:19', productKey: 'chainBag',
    videoName: 'chain-bag-02.mp4', videoIntroduction: '链条小方包链条与五金细节',
    duration: '00:14', status: '上传失败', completedTime: '2026-11-20 17:55:52',
    reason: '视频 URL 无法下载，请检查文件地址后重试',
  },
  {
    id: 'video-7', time: '2026-11-20 11:12:08', productKey: 'dress',
    videoName: 'dress-summer.mp4', videoIntroduction: '碎花连衣裙版型与面料展示',
    duration: '00:11', status: '上传失败', completedTime: '2026-11-20 11:13:20',
    reason: '视频转码失败，请上传标准 MP4 文件后重试',
  },
  {
    id: 'video-8', time: '2026-11-19 16:40:33', productKey: 'runningShoes',
    videoName: 'running-shoes-01.mp4', videoIntroduction: '跑步鞋上脚与鞋底缓震展示',
    duration: '00:07', status: '上传失败', completedTime: '2026-11-19 16:41:05',
    reason: '视频内容审核未通过，请修改后重新上传',
  },
  {
    id: 'video-9', time: '2026-11-19 10:25:47', productKey: 'kidsSneaker',
    videoName: 'kids-sneaker-main.mp4', videoIntroduction: '儿童运动鞋穿脱与尺码展示',
    duration: '00:13', status: '上传成功', completedTime: '2026-11-19 10:26:20',
  },
];

const videoDurationSeconds = (duration: string) => {
  const [minutes, seconds] = duration.split(':').map(Number);
  return minutes * 60 + seconds;
};

const formatVideoTime = (seconds: number) => `${pad2(Math.floor(seconds / 60))}:${pad2(Math.floor(seconds % 60))}`;

const imageTaskStats = (record: ImageTaskRecord) => {  const done = record.success + record.failed;
  const pending = record.imageCount - done;
  const percent = record.imageCount ? Math.round((done / record.imageCount) * 100) : 0;
  const status: '执行中' | '部分失败' | '已完成' = pending > 0 ? '执行中' : record.failed > 0 ? '部分失败' : '已完成';
  return { done, pending, percent, status };
};

const taskCounts = (record: TaskRecord) => {
  const total = record.products.length;
  const success = record.products.filter((product) => product.result === 'success').length;
  const failed = record.products.filter((product) => product.result === 'fail').length;
  const pending = total - success - failed;
  const percent = total ? Math.round(((success + failed) / total) * 100) : 0;
  const status: '执行中' | '部分失败' | '已完成' = pending > 0 ? '执行中' : failed > 0 ? '部分失败' : '已完成';
  return { total, success, failed, pending, percent, status };
};

const taskShops = (record: TaskRecord) => record.shops ?? [];

const shopSummary = (shops: string[]) =>
  shops.length > 2 ? `${shops[0]} 等 ${shops.length} 个店铺` : shops.join('、');

type TaskDetailRow = {
  product: TaskProduct;
  shop?: string;
  result: TaskResult;
  failures?: TaskFailure[];
  publish?: ClonePublish;
};

const taskDetailRows = (record: TaskRecord): TaskDetailRow[] => record.products.flatMap((product) => {
  if (product.shopResults?.length) {
    return product.shopResults.map((item) => ({
      product,
      shop: item.shop,
      result: item.result,
      failures: item.failures,
      publish: item.publish,
    }));
  }
  return [{ product, result: product.result, failures: product.failures, publish: product.publish }];
});

const currentTagClass = (status: ProductCurrentStatus) => {
  if (status === '已上架') return 'is-online';
  if (status === '待审核') return 'is-pending';
  if (status === '审核未通过') return 'is-rejected';
  if (status === '内容违规') return 'is-content';
  if (status === '侵权违规') return 'is-infringe';
  if (status === '品牌商投诉') return 'is-complaint';
  if (status === '发布中') return 'is-processing';
  if (status === '循环刊登') return 'is-looping';
  if (status === '发布失败') return 'is-failed';
  return 'is-offline';
};

type RecordStatus = '发布中' | '发布完成' | '部分失败';

const activeCurrentStatuses: ProductCurrentStatus[] = ['待发布', '发布中', '循环刊登', '待审核'];

const recordStatus = (record: PublishRecord): RecordStatus => {
  if (record.products.some((item) => item.loopState === '循环中' || activeCurrentStatuses.includes(item.current))) {
    return '发布中';
  }
  return record.products.some((item) => productOutcome(item) === 'failed') ? '部分失败' : '发布完成';
};

const productOutcome = (item: PublishProduct): 'done' | 'failed' | 'pending' => {
  if (item.publishResult === '发布失败' || item.publishResult === '审核不通过') return 'failed';
  if (['审核未通过', '内容违规', '侵权违规', '品牌商投诉'].includes(item.current)) return 'failed';
  if (item.publishResult === '循环刊登' || item.current === '已上架') return 'done';
  return 'pending';
};

const recordStats = (record: PublishRecord) => {
  const done = record.products.filter((item) => productOutcome(item) === 'done').length;
  const failed = record.products.filter((item) => productOutcome(item) === 'failed').length;
  const percent = record.products.length
    ? Math.round(((done + failed) / record.products.length) * 100)
    : 0;
  return { done, failed, percent };
};

/** 12 辐条「菊花」loading 图标，沿用 ERP 按钮 loading 样式 */
const Spinner = ({ size = 12 }: { size?: number }) => (
  <svg className="tm-flower" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    {Array.from({ length: 12 }).map((_, i) => (
      <rect
        key={i}
        x="10.6"
        y="1.5"
        width="2.8"
        height="7"
        rx="1.4"
        fill="currentColor"
        transform={`rotate(${i * 30} 12 12)`}
        opacity={1 - i / 12}
      />
    ))}
  </svg>
);

const FilterSelect = <T extends string,>({ value, options, onChange, ariaLabel }: {
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
  ariaLabel: string;
}) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (event: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="tm-filter-select" ref={wrapRef}>
      <button
        type="button"
        className={`tm-filter-select__trigger${open ? ' is-open' : ''}`}
        aria-label={ariaLabel}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{value}</span>
        <span className="tm-filter-select__arrow" aria-hidden="true">▾</span>
      </button>
      {open ? (
        <div className="tm-filter-select__menu" role="listbox" aria-label={ariaLabel}>
          {options.map((option) => (
            <button
              type="button"
              key={option}
              role="option"
              aria-selected={option === value}
              className={`tm-filter-select__option${option === value ? ' is-active' : ''}`}
              onClick={() => { onChange(option); setOpen(false); }}
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

const HelpTooltip = ({ label, children }: { label: string; children: React.ReactNode }) => {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const show = (el: HTMLElement) => setRect(el.getBoundingClientRect());

  return (
    <span
      className="tm-help"
      onMouseEnter={(event) => show(event.currentTarget)}
      onMouseLeave={() => setRect(null)}
    >
      <button
        type="button"
        className="tm-help__icon"
        aria-label={label}
        onFocus={(event) => show(event.currentTarget)}
        onBlur={() => setRect(null)}
        onClick={(event) => event.stopPropagation()}
      >
        ?
      </button>
      {rect ? createPortal(
        <span
          className="tm-help__tip"
          style={{
            left: Math.min(Math.max(rect.left + rect.width / 2, 150), window.innerWidth - 150),
            top: rect.top - 8,
          }}
        >
          {children}
          <span className="tm-help__arrow" />
        </span>,
        document.body,
      ) : null}
    </span>
  );
};

const CalendarIcon = () => (
  <svg className="tm-picker__icon" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <rect x="1.5" y="2.5" width="11" height="10" rx="1" stroke="currentColor" strokeWidth="1.2" />
    <path d="M1.5 5.5H12.5" stroke="currentColor" strokeWidth="1.2" />
    <path d="M4.5 1V3.5M9.5 1V3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const DatePicker = ({ value, onChange, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) => {
  const today = new Date();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const [picked, setPicked] = useState<{ y: number; m: number; d: number } | null>(
    value ? (() => { const [y, m, d] = value.split('-').map(Number); return { y, m: m - 1, d }; })() : null,
  );
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (event: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const firstDay = new Date(view.y, view.m, 1).getDay();
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells: Array<number | null> = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const shiftMonth = (delta: number) => {
    const next = new Date(view.y, view.m + delta, 1);
    setView({ y: next.getFullYear(), m: next.getMonth() });
  };

  const isToday = (d: number) =>
    d === today.getDate() && view.m === today.getMonth() && view.y === today.getFullYear();

  const commit = () => {
    if (picked) onChange(`${picked.y}-${pad2(picked.m + 1)}-${pad2(picked.d)}`);
    setOpen(false);
  };

  return (
    <div className="tm-picker" ref={wrapRef}>
      <div
        className={`tm-picker__input${open ? ' is-focused' : ''}`}
        role="button"
        tabIndex={0}
        aria-label={placeholder}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setOpen((v) => !v);
          }
        }}
      >
        <CalendarIcon />
        <span className={`tm-picker__text${value ? ' is-filled' : ''}`}>{value || placeholder}</span>
      </div>
      {open ? (
        <div className="tm-picker__panel">
          <div className="tm-dt__header">
            <button type="button" className="tm-dt__nav" aria-label="上个月" onClick={() => shiftMonth(-1)}>〈</button>
            <span className="tm-dt__title">{view.y} 年 {pad2(view.m + 1)} 月</span>
            <button type="button" className="tm-dt__nav" aria-label="下个月" onClick={() => shiftMonth(1)}>〉</button>
          </div>
          <div className="tm-dt__week">
            {['日', '一', '二', '三', '四', '五', '六'].map((w) => <span key={w}>{w}</span>)}
          </div>
          <div className="tm-dt__grid">
            {cells.map((d, i) => d === null ? (
              <span key={`b-${i}`} className="tm-dt__day is-blank" />
            ) : (
              <button
                type="button"
                key={d}
                className={`tm-dt__day${picked && picked.d === d && picked.m === view.m && picked.y === view.y ? ' is-selected' : ''}${isToday(d) ? ' is-today' : ''}`}
                onClick={() => setPicked({ y: view.y, m: view.m, d })}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="tm-dt__footer">
            <button type="button" className="tm-dt__link" onClick={() => { setPicked(null); onChange(''); setOpen(false); }}>清除</button>
            <button type="button" className="tm-dt__confirm" disabled={!picked} onClick={commit}>确定</button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const TaskPanel = ({ kind, records, onNavigate }: { kind: TaskKind; records: TaskRecord[]; onNavigate: () => void }) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = records.find((record) => record.id === activeId) ?? null;
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('全部');
  const [resultFilter, setResultFilter] = useState('全部');
  const [publishFilter, setPublishFilter] = useState<'全部' | ClonePublishResult>('全部');
  const [detailPage, setDetailPage] = useState(1);
  const [copyFeedback, setCopyFeedback] = useState<{ count: number; failed: boolean } | null>(null);

  useEffect(() => {
    setResultFilter('全部');
    setPublishFilter('全部');
    setDetailPage(1);
  }, [activeId]);

  const filteredRecords = records.filter((record) => {
    const date = record.time.slice(0, 10);
    if (startDate && date < startDate) return false;
    if (endDate && date > endDate) return false;
    if (statusFilter !== '全部' && taskCounts(record).status !== statusFilter) return false;
    return true;
  });

  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedRecords = filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => { setPage(1); }, [startDate, endDate, statusFilter]);

  const resetListFilters = () => {
    setStartDate('');
    setEndDate('');
    setStatusFilter('全部');
    setPage(1);
  };

  const counts = active ? taskCounts(active) : null;
  const hasPending = counts ? counts.pending > 0 : false;
  const resultOptions = ['全部', '成功', '失败', ...(hasPending ? ['处理中'] : [])];

  const detailRows = active
    ? taskDetailRows(active).filter((row) => {
        if (resultFilter !== '全部') {
          const target = resultFilter === '成功' ? 'success' : resultFilter === '失败' ? 'fail' : 'pending';
          if (row.result !== target) return false;
        }
        if (kind === 'clone' && publishFilter !== '全部' && row.publish?.result !== publishFilter) return false;
        return true;
      })
    : [];
  const detailPageSize = 10;
  const detailTotalPages = Math.max(1, Math.ceil(detailRows.length / detailPageSize));
  const detailCurrentPage = Math.min(detailPage, detailTotalPages);
  const pagedDetailRows = detailRows.slice((detailCurrentPage - 1) * detailPageSize, detailCurrentPage * detailPageSize);

  useEffect(() => { setDetailPage(1); }, [resultFilter, publishFilter]);

  const resetDetailFilters = () => {
    setResultFilter('全部');
    setPublishFilter('全部');
    setDetailPage(1);
  };

  const copyProductIds = async () => {
    const ids = Array.from(new Set(detailRows.map((row) => PRODUCT_CATALOG[row.product.key].id)));
    const text = ids.join('\n');
    if (!text) return;
    let copied = false;
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      copied = document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopyFeedback({ count: ids.length, failed: !copied });
    window.setTimeout(() => setCopyFeedback(null), 2000);
  };

  const openRecord = (id: string) => {
    setActiveId(id);
    onNavigate();
  };

  const backToList = () => {
    setActiveId(null);
    onNavigate();
  };

  const kindLabel = kind === 'claim' ? '认领' : kind === 'batch-edit' ? '批量编辑' : '克隆';
  const scopeLabel = kind === 'claim' ? '认领店铺' : kind === 'batch-edit' ? '编辑项目' : '克隆到店铺';
  const cloneTipLines = (record: TaskRecord) => {
    const configs = record.cloneConfig ?? [];
    const lines: string[] = [];
    if (configs.includes('AI 重新生成标题')) lines.push('标题：AI 重新生成');
    if (configs.includes('主图顺序随机打乱')) lines.push('图片：主图顺序随机打乱');
    return lines;
  };
  const resultPrefix = kind === 'claim' ? '认领' : kind === 'batch-edit' ? '编辑' : '克隆';

  const renderResult = (result: TaskResult) => {
    const mod = result === 'success' ? 'is-success' : result === 'fail' ? 'is-fail' : 'is-pending';
    const text = result === 'success' ? '成功' : result === 'fail' ? '失败' : '处理中';
    return (
      <span className={`tm-task-tag ${mod}${result === 'pending' ? ' is-loading' : ''}`}>
        {result === 'pending' ? <Spinner size={12} /> : null}
        {resultPrefix}{text}
      </span>
    );
  };

  const renderPublish = (publish?: ClonePublish) => {
    if (!publish) return '-';
    if (publish.result === '刊登成功') return <span className="tm-task-tag is-success">刊登成功</span>;
    if (publish.result === '刊登失败') return <span className="tm-task-tag is-fail">刊登失败</span>;
    if (publish.result === '刊登中') {
      return (
        <span className="tm-task-tag is-pending is-loading">
          <Spinner size={12} />
          刊登中
        </span>
      );
    }
    return <span className="tm-task-chip">待刊登</span>;
  };

  if (active && counts) {
    return (
      <div className="tm-task-detail">
        <button type="button" className="tm-record-detail__back" onClick={backToList}>
          ← 返回{kindLabel}任务
        </button>
        <div className="tm-record-detail__summary">
          <span className="tm-record-detail__time">{active.time}</span>
          <span>{counts.total} 个商品</span>
          {kind === 'claim' ? (
            active.claimMode ? <span className="tm-task-chip is-brand">{active.claimMode}</span> : null
          ) : kind === 'batch-edit' ? null : (
            <>
              {active.cloneMode ? <span className="tm-task-chip is-brand">{active.cloneMode}</span> : null}
              {(active.cloneConfig ?? []).map((config) => <span className="tm-task-chip" key={config}>{config}</span>)}
            </>
          )}
          <button
            type="button"
            className="tm-record-detail__copy"
            disabled={detailRows.length === 0}
            onClick={copyProductIds}
          >
            {copyFeedback
              ? (copyFeedback.failed ? '复制失败' : `已复制 ${copyFeedback.count} 个`)
              : '批量复制商品编号'}
          </button>
        </div>
        <div className="tm-task-stats">
          <span className="tm-task-stats__item">商品数 <b>{counts.total}</b></span>
          <span className="tm-task-stats__item is-success">成功商品 <b>{counts.success}</b></span>
          <span className="tm-task-stats__item is-danger">失败商品 <b>{counts.failed}</b></span>
          {counts.pending > 0 ? <span className="tm-task-stats__item is-info">处理中商品 <b>{counts.pending}</b></span> : null}
          <span className="tm-task-stats__progress">
            <span className="tm-task-progress__bar is-wide">
              <span
                className={counts.status === '执行中' ? 'is-running' : counts.status === '部分失败' ? 'is-partial' : 'is-done'}
                style={{ width: `${counts.percent}%` }}
              />
            </span>
            <span className="tm-task-stats__percent">{counts.percent}%</span>
          </span>
        </div>
        <div className="tm-record-query tm-record-query--detail">
          <div className="tm-record-query__field">
            <span className="tm-record-query__label">{kind === 'clone' ? '克隆结果' : '结果'}</span>
            <FilterSelect
              value={resultFilter}
              options={resultOptions}
              onChange={setResultFilter}
              ariaLabel={kind === 'clone' ? '克隆结果' : '结果'}
            />
          </div>
          {kind === 'clone' ? (
            <div className="tm-record-query__field">
              <span className="tm-record-query__label">刊登结果</span>
              <FilterSelect
                value={publishFilter}
                options={['全部', '待刊登', '刊登中', '刊登成功', '刊登失败'] as const}
                onChange={setPublishFilter}
                ariaLabel="刊登结果"
              />
            </div>
          ) : null}
          <button type="button" className="tm-record-query__reset" onClick={resetDetailFilters}>重置</button>
        </div>
        <div className={`tm-records tm-records--detail tm-task-table tm-task-table--${kind}`}>
          <div className="tm-task-row tm-task-row--head">
            <span>商品信息</span>
            {kind !== 'batch-edit' ? <span>{scopeLabel}</span> : null}
            <span>{resultPrefix}结果</span>
            <span>{kind === 'clone' ? '克隆失败原因' : '失败原因'}</span>
            {kind === 'clone' ? <span>刊登结果</span> : null}
            {kind === 'clone' ? <span>刊登失败原因</span> : null}
          </div>
          {pagedDetailRows.length === 0 ? (
            <div className="tm-records__empty">暂无数据</div>
          ) : pagedDetailRows.map((row) => {
            const info = PRODUCT_CATALOG[row.product.key];
            const rowShops = row.shop ?? taskShops(active).join('、');
            return (
              <div className="tm-task-row" key={`${active.id}-${row.product.key}-${row.shop ?? 'edit'}`}>
                <span className="tm-product-cell">
                  <img className="tm-product-cell__img" src={info.image} alt={info.title} />
                  <span className="tm-product-cell__main">
                    <span className="tm-product-cell__title" title={info.title}>{info.title}</span>
                    <span className="tm-product-cell__id">{info.id}</span>
                  </span>
                </span>
                {kind !== 'batch-edit' ? (
                  <span className="tm-task-shops" title={rowShops}>{rowShops || '-'}</span>
                ) : null}
                <span>{renderResult(row.result)}</span>
                <span className="tm-task-reason">
                  {(row.failures?.length ?? 0) > 0 ? row.failures!.map((failure, index) => (
                    <span className="tm-task-reason__line" key={`${failure.reason}-${index}`}>
                      {failure.item ? <b>{failure.item}：</b> : null}
                      {failure.reason}
                    </span>
                  )) : '-'}
                </span>
                {kind === 'clone' ? <span>{renderPublish(row.publish)}</span> : null}
                {kind === 'clone' ? (
                  <span className={`tm-publish-reason${row.publish?.reason ? ' is-fail' : ''}`} title={row.publish?.reason}>
                    {row.publish?.reason ?? '-'}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
        <div className="tm-record-pager">
          <span className="tm-record-pager__total">共 {detailRows.length} 条</span>
          <div className="tm-record-pager__pages">
            <button
              type="button"
              className="tm-record-pager__btn"
              disabled={detailCurrentPage === 1}
              aria-label="上一页"
              onClick={() => setDetailPage(detailCurrentPage - 1)}
            >
              ‹
            </button>
            {Array.from({ length: detailTotalPages }, (_, index) => index + 1).map((pageNumber) => (
              <button
                type="button"
                key={pageNumber}
                className={`tm-record-pager__btn${pageNumber === detailCurrentPage ? ' is-active' : ''}`}
                onClick={() => setDetailPage(pageNumber)}
              >
                {pageNumber}
              </button>
            ))}
            <button
              type="button"
              className="tm-record-pager__btn"
              disabled={detailCurrentPage === detailTotalPages}
              aria-label="下一页"
              onClick={() => setDetailPage(detailCurrentPage + 1)}
            >
              ›
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="tm-record-query">
        <div className="tm-record-query__field">
          <span className="tm-record-query__label">时间</span>
          <DatePicker value={startDate} onChange={setStartDate} placeholder="开始日期" />
          <span className="tm-record-query__sep">至</span>
          <DatePicker value={endDate} onChange={setEndDate} placeholder="结束日期" />
        </div>
        <div className="tm-record-query__field">
          <span className="tm-record-query__label">状态</span>
          <FilterSelect
            value={statusFilter}
            options={['全部', '执行中', '部分失败', '已完成']}
            onChange={setStatusFilter}
            ariaLabel="状态"
          />
        </div>
        <button type="button" className="tm-record-query__reset" onClick={resetListFilters}>重置</button>
      </div>
      <div className={`tm-records tm-task-list${kind === 'batch-edit' ? ' tm-task-list--plain' : ''}${kind === 'clone' ? ' tm-task-list--clone' : ''}`}>
        <div className="tm-task-row tm-task-row--head">
          <span>发起时间</span>
          {kind !== 'batch-edit' ? <span>{scopeLabel}</span> : null}
          {kind === 'clone' ? <span>克隆方式</span> : null}
          <span className="tm-records__cell--num">商品数</span>
          <span>进度</span>
          <span className="tm-records__cell--num">成功数量</span>
          <span className="tm-records__cell--num">失败数量</span>
          <span>状态/完成时间</span>
          <span />
        </div>
        {pagedRecords.length === 0 ? (
          <div className="tm-records__empty">暂无数据</div>
        ) : pagedRecords.map((record) => {
          const recordCounts = taskCounts(record);
          const done = recordCounts.success + recordCounts.failed;
          const scopeMain = kind === 'batch-edit'
            ? (record.editItems ?? []).join('、')
            : shopSummary(taskShops(record));
          const scopeSub = kind === 'claim'
            ? record.claimMode
            : kind === 'batch-edit'
              ? `共 ${record.editItems?.length ?? 0} 项`
              : record.cloneMode;
          const cloneLines = kind === 'clone' ? cloneTipLines(record) : [];
          return (
            <div
              className="tm-task-row tm-task-row--clickable"
              key={record.id}
              role="button"
              tabIndex={0}
              onClick={() => openRecord(record.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  openRecord(record.id);
                }
              }}
            >
              <span className="tm-records__time">{record.time}</span>
              {kind !== 'batch-edit' ? (
                <span className="tm-task-scope">
                  <span className="tm-task-scope__main" title={taskShops(record).join('、')}>{scopeMain}</span>
                  <span className="tm-task-scope__sub">
                    <span className="tm-task-scope__sub-text">{scopeSub}</span>
                    {cloneLines.length > 0 ? (
                      <HoverTip lines={cloneLines}>
                        <span className="tm-sync-config-icon" aria-hidden="true">!</span>
                      </HoverTip>
                    ) : null}
                  </span>
                </span>
              ) : null}
              {kind === 'clone' ? <span>{record.cloneWay ?? '-'}</span> : null}
              <span className="tm-records__cell--num">{recordCounts.total} 个</span>
              <span className="tm-task-progress">
                <span className="tm-task-progress__bar">
                  <span
                    className={recordCounts.status === '执行中' ? 'is-running' : recordCounts.status === '部分失败' ? 'is-partial' : 'is-done'}
                    style={{ width: `${recordCounts.percent}%` }}
                  />
                </span>
                <span className="tm-task-progress__text">{done}/{recordCounts.total} · {recordCounts.percent}%</span>
              </span>
              <span className="tm-records__cell--num">{recordCounts.success}</span>
              <span className="tm-records__cell--num">{recordCounts.failed}</span>
              <span className="tm-task-status-cell">
                <span className={`tm-task-tag ${recordCounts.status === '执行中' ? 'is-running is-loading' : recordCounts.status === '部分失败' ? 'is-partial' : 'is-done'}`}>
                  {recordCounts.status === '执行中' ? <Spinner size={12} /> : null}
                  {recordCounts.status}
                </span>
                {record.finishTime ? <span className="tm-task-status-cell__time">{record.finishTime}</span> : null}
              </span>
              <span className="tm-records__arrow">›</span>
            </div>
          );
        })}
      </div>
      <div className="tm-record-pager">
        <span className="tm-record-pager__total">共 {filteredRecords.length} 条</span>
        <div className="tm-record-pager__pages">
          <button
            type="button"
            className="tm-record-pager__btn"
            disabled={currentPage === 1}
            aria-label="上一页"
            onClick={() => setPage(currentPage - 1)}
          >
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
            <button
              type="button"
              key={pageNumber}
              className={`tm-record-pager__btn${pageNumber === currentPage ? ' is-active' : ''}`}
              onClick={() => setPage(pageNumber)}
            >
              {pageNumber}
            </button>
          ))}
          <button
            type="button"
            className="tm-record-pager__btn"
            disabled={currentPage === totalPages}
            aria-label="下一页"
            onClick={() => setPage(currentPage + 1)}
          >
            ›
          </button>
        </div>
      </div>
    </>
  );
};

const HoverTip = ({ lines, children }: { lines: string[]; children: React.ReactNode }) => {
  const [rect, setRect] = useState<DOMRect | null>(null);

  return (
    <span
      className="tm-sync-config"
      onMouseEnter={(event) => setRect(event.currentTarget.getBoundingClientRect())}
      onMouseLeave={() => setRect(null)}
    >
      {children}
      {rect ? createPortal(
        <span
          className="tm-help__tip tm-sync-config__tip"
          style={{
            left: Math.min(Math.max(rect.left + rect.width / 2, 150), window.innerWidth - 150),
            top: rect.top - 8,
          }}
        >
          {lines.map((line, index) => <span className="tm-help__line" key={index}>{line}</span>)}
          <span className="tm-help__arrow" />
        </span>,
        document.body,
      ) : null}
    </span>
  );
};

const SyncTaskPanel = ({ kind, records }: { kind: SyncKind; records: SyncTaskRecord[] }) => {
  const isProductSync = kind === 'product-sync';
  const countLabel = isProductSync ? '同步数据量' : '同步订单数';
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('全部');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const rows = records.flatMap((record) => record.items.map((item) => ({
    record,
    item,
    key: `${record.id}-${item.shop}`,
  })));

  const filteredRows = rows.filter(({ record, item }) => {
    const date = record.time.slice(0, 10);
    if (startDate && date < startDate) return false;
    if (endDate && date > endDate) return false;
    if (statusFilter === '同步中' && item.result !== 'pending') return false;
    if (statusFilter === '同步完成' && item.result !== 'success') return false;
    if (statusFilter === '同步失败' && item.result !== 'fail') return false;
    return true;
  });

  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => { setPage(1); }, [startDate, endDate, statusFilter]);

  const resetListFilters = () => {
    setStartDate('');
    setEndDate('');
    setStatusFilter('全部');
    setPage(1);
  };

  const configLines = (record: SyncTaskRecord) => {
    if (isProductSync) return [`同步方式：${record.mode}同步`];
    const lines: string[] = [];
    if (record.dateRange) lines.push(`同步时间：${record.dateRange}`);
    lines.push(`仅同步未处理订单：${record.onlyUnhandled ? '是' : '否'}`);
    return lines;
  };

  const renderSyncResult = (result: TaskResult) => {
    if (result === 'success') return <span className="tm-task-tag is-success">同步完成</span>;
    if (result === 'fail') return <span className="tm-task-tag is-fail">同步失败</span>;
    return (
      <span className="tm-task-tag is-pending is-loading">
        <Spinner size={12} />
        同步中
      </span>
    );
  };

  return (
    <>
      <div className="tm-record-query">
        <div className="tm-record-query__field">
          <span className="tm-record-query__label">时间</span>
          <DatePicker value={startDate} onChange={setStartDate} placeholder="开始日期" />
          <span className="tm-record-query__sep">至</span>
          <DatePicker value={endDate} onChange={setEndDate} placeholder="结束日期" />
        </div>
        <div className="tm-record-query__field">
          <span className="tm-record-query__label">状态</span>
          <FilterSelect
            value={statusFilter}
            options={['全部', '同步中', '同步完成', '同步失败']}
            onChange={setStatusFilter}
            ariaLabel="状态"
          />
        </div>
        <button type="button" className="tm-record-query__reset" onClick={resetListFilters}>重置</button>
      </div>
      <div className={`tm-records tm-task-list tm-sync-list ${isProductSync ? 'tm-sync-list--product' : 'tm-sync-list--order'}`}>
        <div className="tm-task-row tm-task-row--head">
          <span>发起时间</span>
          <span>平台</span>
          <span>同步店铺</span>
          <span className="tm-records__cell--num">{countLabel}</span>
          {isProductSync ? null : <span className="tm-records__cell--num">指定订单</span>}
          <span>同步类型</span>
          <span>状态/完成时间</span>
          <span>失败原因</span>
        </div>
        {pagedRows.length === 0 ? (
          <div className="tm-records__empty">暂无数据</div>
        ) : pagedRows.map(({ record, item, key }) => {
          const expanded = expandedRow === key;
          return (
            <React.Fragment key={key}>
              <div className="tm-task-row">
                <span className="tm-records__time">{record.time}</span>
                <span className="tm-sync-platform" title={item.platform}>{item.platform}</span>
                <span className="tm-task-scope">
                  <HoverTip lines={configLines(record)}>
                    <span className="tm-sync-shop-trigger">
                      <span className="tm-task-scope__main" title={item.shop}>{item.shop}</span>
                      <span className="tm-sync-config-icon" aria-hidden="true">!</span>
                    </span>
                  </HoverTip>
                </span>
                <span className="tm-records__cell--num">{item.count ?? '-'}</span>
                {isProductSync ? null : (
                  <span className="tm-records__cell--num tm-sync-order-cell">
                    {item.orderItems?.length ? (
                      <button
                        type="button"
                        className="tm-sync-order-toggle"
                        aria-expanded={expanded}
                        onClick={() => setExpandedRow(expanded ? null : key)}
                      >
                        {item.orderItems.length}
                        <span className="tm-sync-order-toggle__arrow" aria-hidden="true">{expanded ? '▴' : '▾'}</span>
                      </button>
                    ) : '-'}
                  </span>
                )}
                <span>{record.type}</span>
                <span className="tm-sync-status-cell">
                  {renderSyncResult(item.result)}
                  <span className="tm-sync-status-cell__time">{item.finishTime ?? '-'}</span>
                </span>
                <span className={`tm-sync-reason${item.reason ? ' is-fail' : ''}`} title={item.reason ?? undefined}>{item.reason ?? '-'}</span>
              </div>
              {expanded && item.orderItems?.length ? (
                <div className="tm-sync-orders-row">
                  <div className="tm-sync-orders-row__head">指定订单（{item.orderItems.length}）</div>
                  {item.orderItems.map((order) => (
                    <div className="tm-task-row tm-sync-order" key={order.orderNo}>
                      <span className="tm-sync-order__no">{order.orderNo}</span>
                      <span className="tm-sync-order__result">
                        {renderSyncResult(order.result)}
                        <span className="tm-sync-order__time">{order.finishTime ?? '-'}</span>
                      </span>
                      <span className={`tm-sync-order__reason${order.reason ? ' is-fail' : ''}`} title={order.reason ?? undefined}>{order.reason ?? '-'}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </React.Fragment>
          );
        })}
      </div>
      <div className="tm-record-pager">
        <span className="tm-record-pager__total">共 {filteredRows.length} 条</span>
        <div className="tm-record-pager__pages">
          <button
            type="button"
            className="tm-record-pager__btn"
            disabled={currentPage === 1}
            aria-label="上一页"
            onClick={() => setPage(currentPage - 1)}
          >
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
            <button
              type="button"
              key={pageNumber}
              className={`tm-record-pager__btn${pageNumber === currentPage ? ' is-active' : ''}`}
              onClick={() => setPage(pageNumber)}
            >
              {pageNumber}
            </button>
          ))}
          <button
            type="button"
            className="tm-record-pager__btn"
            disabled={currentPage === totalPages}
            aria-label="下一页"
            onClick={() => setPage(currentPage + 1)}
          >
            ›
          </button>
        </div>
      </div>
    </>
  );
};
const ImageTaskPanel = ({ records }: { records: ImageTaskRecord[] }) => {
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState<'全部' | '执行中' | '部分失败' | '已完成'>('全部');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [preview, setPreview] = useState<FailedImage | null>(null);
  const [retryRecords, setRetryRecords] = useState<ImageTaskRecord[]>([]);
  const [reprocessedIds, setReprocessedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!preview) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPreview(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [preview]);

  const retryFailedImages = (record: ImageTaskRecord) => {
    if (reprocessedIds.includes(record.id)) return;
    const now = new Date();
    const time = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())} ${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;
    setRetryRecords((prev) => [{
      id: `image-retry-${record.id}-${now.getTime()}`,
      time,
      productKey: record.productKey,
      imageCount: record.failed,
      op: record.op,
      success: 0,
      failed: 0,
      failedImages: [],
    }, ...prev]);
    setReprocessedIds((prev) => [...prev, record.id]);
  };

  const allRecords = [...retryRecords, ...records];

  const filteredRecords = allRecords.filter((record) => {
    const date = record.time.slice(0, 10);
    if (startDate && date < startDate) return false;
    if (endDate && date > endDate) return false;
    if (statusFilter !== '全部' && imageTaskStats(record).status !== statusFilter) return false;
    return true;
  });

  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedRecords = filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => { setPage(1); }, [startDate, endDate, statusFilter]);

  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setStatusFilter('全部');
    setPage(1);
  };

  const renderStatus = (status: '执行中' | '部分失败' | '已完成') => (
    <span className={`tm-task-tag ${status === '执行中' ? 'is-running is-loading' : status === '部分失败' ? 'is-partial' : 'is-done'}`}>
      {status === '执行中' ? <Spinner size={12} /> : null}
      {status}
    </span>
  );

  return (
    <>
      <div className="tm-record-query">
        <div className="tm-record-query__field">
          <span className="tm-record-query__label">时间</span>
          <DatePicker value={startDate} onChange={setStartDate} placeholder="开始日期" />
          <span className="tm-record-query__sep">至</span>
          <DatePicker value={endDate} onChange={setEndDate} placeholder="结束日期" />
        </div>
        <div className="tm-record-query__field">
          <span className="tm-record-query__label">状态</span>
          <FilterSelect
            value={statusFilter}
            options={['全部', '执行中', '部分失败', '已完成'] as const}
            onChange={setStatusFilter}
            ariaLabel="状态"
          />
        </div>
        <button type="button" className="tm-record-query__reset" onClick={resetFilters}>重置</button>
      </div>
      <div className="tm-records tm-task-list tm-image-list">
        <div className="tm-task-row tm-task-row--head">
          <span>发起时间</span>
          <span>商品信息</span>
          <span className="tm-records__cell--num">图片数</span>
          <span>批量美图操作</span>
          <span>进度</span>
          <span className="tm-records__cell--num">完成数量</span>
          <span className="tm-records__cell--num">失败数量</span>
          <span>状态</span>
        </div>
        {pagedRecords.length === 0 ? (
          <div className="tm-records__empty">暂无数据</div>
        ) : pagedRecords.map((record) => {
          const stats = imageTaskStats(record);
          const expanded = expandedRow === record.id;
          const info = PRODUCT_CATALOG[record.productKey];
          return (
            <React.Fragment key={record.id}>
              <div className="tm-task-row">
                <span className="tm-records__time">{record.time}</span>
                <span className="tm-product-cell">
                  <img className="tm-product-cell__img" src={info.image} alt={info.title} />
                  <span className="tm-product-cell__main">
                    <span className="tm-product-cell__title" title={info.title}>{info.title}</span>
                    <span className="tm-product-cell__id">{info.id}</span>
                  </span>
                </span>
                <span className="tm-records__cell--num">{record.imageCount}</span>
                <span className="tm-image-ops" title={record.op}>{record.op}</span>
                <span className="tm-task-progress">
                  <span className="tm-task-progress__bar">
                    <span
                      className={stats.status === '执行中' ? 'is-running' : stats.status === '部分失败' ? 'is-partial' : 'is-done'}
                      style={{ width: `${stats.percent}%` }}
                    />
                  </span>
                  <span className="tm-task-progress__text">{stats.done}/{record.imageCount} · {stats.percent}%</span>
                </span>
                <span className="tm-records__cell--num">{record.success}</span>
                <span className="tm-records__cell--num">
                  {record.failed > 0 ? (
                    <button
                      type="button"
                      className="tm-image-fail-toggle"
                      aria-expanded={expanded}
                      onClick={() => setExpandedRow(expanded ? null : record.id)}
                    >
                      {record.failed}
                      <span className="tm-sync-order-toggle__arrow" aria-hidden="true">{expanded ? '▴' : '▾'}</span>
                    </button>
                  ) : '-'}
                </span>
                <span>{renderStatus(stats.status)}</span>
              </div>
              {expanded ? (
                <div className="tm-image-failed">
                  <div className="tm-image-failed__head">
                    <span>失败图片（{record.failedImages.length}）</span>
                    {reprocessedIds.includes(record.id) ? (
                      <span className="tm-image-failed__done">已重新处理</span>
                    ) : (
                      <button
                        type="button"
                        className="tm-export-action"
                        onClick={() => retryFailedImages(record)}
                      >
                        重新处理
                      </button>
                    )}
                  </div>
                  <div className="tm-image-failed__list">
                    {record.failedImages.map((item, index) => (
                      <div className="tm-image-failed__item" key={`${record.id}-${index}`}>
                        <button
                          type="button"
                          className="tm-image-failed__thumb"
                          aria-label="查看失败图片"
                          onClick={() => setPreview(item)}
                        >
                          <img src={item.image} alt="失败图片" />
                        </button>
                        <span className="tm-image-failed__reason" title={item.reason}>{item.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </React.Fragment>
          );
        })}
      </div>
      <div className="tm-record-pager">
        <span className="tm-record-pager__total">共 {filteredRecords.length} 条</span>
        <div className="tm-record-pager__pages">
          <button
            type="button"
            className="tm-record-pager__btn"
            disabled={currentPage === 1}
            aria-label="上一页"
            onClick={() => setPage(currentPage - 1)}
          >
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
            <button
              type="button"
              key={pageNumber}
              className={`tm-record-pager__btn${pageNumber === currentPage ? ' is-active' : ''}`}
              onClick={() => setPage(pageNumber)}
            >
              {pageNumber}
            </button>
          ))}
          <button
            type="button"
            className="tm-record-pager__btn"
            disabled={currentPage === totalPages}
            aria-label="下一页"
            onClick={() => setPage(currentPage + 1)}
          >
            ›
          </button>
        </div>
      </div>
      {preview ? createPortal(
        <div className="tm-img-preview" role="dialog" aria-modal="true" aria-label="查看失败图片" onClick={() => setPreview(null)}>
          <div className="tm-img-preview__panel" onClick={(event) => event.stopPropagation()}>
            <img src={preview.image} alt="失败图片" />
            <span className="tm-img-preview__caption">{preview.reason}</span>
            <button type="button" className="tm-img-preview__close" aria-label="关闭" onClick={() => setPreview(null)}>×</button>
          </div>
        </div>,
        document.body,
      ) : null}
    </>
  );
};

const VideoTaskPanel = ({ records }: { records: VideoTaskRecord[] }) => {
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState<'全部' | VideoUploadStatus>('全部');
  const [keyword, setKeyword] = useState('');
  const [retryRecords, setRetryRecords] = useState<VideoTaskRecord[]>([]);
  const [retriedIds, setRetriedIds] = useState<string[]>([]);

  const allRecords = [...retryRecords, ...records];

  const filteredRecords = allRecords.filter((record) => {
    const date = record.time.slice(0, 10);
    if (startDate && date < startDate) return false;
    if (endDate && date > endDate) return false;
    if (statusFilter !== '全部' && record.status !== statusFilter) return false;
    const query = keyword.trim().toLowerCase();
    if (query) {
      const info = PRODUCT_CATALOG[record.productKey];
      if (!info.id.toLowerCase().includes(query) && !info.title.toLowerCase().includes(query)) return false;
    }
    return true;
  });

  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedRecords = filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => { setPage(1); }, [startDate, endDate, statusFilter, keyword]);

  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setStatusFilter('全部');
    setKeyword('');
    setPage(1);
  };

  const retryTask = (record: VideoTaskRecord) => {
    if (retriedIds.includes(record.id)) return;
    const now = new Date();
    const time = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())} ${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;
    setRetryRecords((prev) => [{
      id: `video-retry-${record.id}-${now.getTime()}`,
      time,
      productKey: record.productKey,
      videoName: record.videoName,
      videoIntroduction: record.videoIntroduction,
      duration: record.duration,
      status: '上传中',
    }, ...prev]);
    setRetriedIds((prev) => [...prev, record.id]);
    setPage(1);
  };

  const renderStatus = (status: VideoUploadStatus) => {
    const className = status === '上传中' ? 'is-running is-loading' : status === '上传成功' ? 'is-success' : 'is-fail';
    return (
      <span className={`tm-task-tag ${className}`}>
        {status === '上传中' ? <Spinner size={12} /> : null}
        {status}
      </span>
    );
  };

  return (
    <>
      <div className="tm-record-query">
        <div className="tm-record-query__field">
          <span className="tm-record-query__label">时间</span>
          <DatePicker value={startDate} onChange={setStartDate} placeholder="开始日期" />
          <span className="tm-record-query__sep">至</span>
          <DatePicker value={endDate} onChange={setEndDate} placeholder="结束日期" />
        </div>
        <div className="tm-record-query__field">
          <span className="tm-record-query__label">状态</span>
          <FilterSelect
            value={statusFilter}
            options={['全部', '上传中', '上传成功', '上传失败'] as const}
            onChange={setStatusFilter}
            ariaLabel="上传状态"
          />
        </div>
        <div className="tm-record-query__field">
          <span className="tm-record-query__label">商品</span>
          <input
            className="tm-video-search"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="商品编号/标题"
            aria-label="商品编号或标题"
          />
        </div>
        <button type="button" className="tm-record-query__reset" onClick={resetFilters}>重置</button>
      </div>
      <div className="tm-records tm-task-list tm-video-list">
        <div className="tm-task-row tm-task-row--head">
          <span>发起时间</span>
          <span>商品信息</span>
          <span>状态/完成时间</span>
          <span>失败原因</span>
          <span className="tm-video-action-head">操作</span>
        </div>
        {pagedRecords.length === 0 ? (
          <div className="tm-records__empty">暂无数据</div>
        ) : pagedRecords.map((record) => {
          const info = PRODUCT_CATALOG[record.productKey];
          const playable = record.status === '上传成功';
          return (
            <div className="tm-task-row" key={record.id}>
              <span className="tm-records__time">{record.time}</span>
              <span className="tm-product-cell">
                <img className="tm-product-cell__img" src={info.image} alt={info.title} />
                <span className="tm-product-cell__main">
                  <span className="tm-product-cell__title" title={info.title}>{info.title}</span>
                  <span className="tm-product-cell__id">{info.id}</span>
                </span>
              </span>
              <span className="tm-task-status-cell">
                {renderStatus(record.status)}
                {record.completedTime ? (
                  <span className="tm-task-status-cell__time">{record.completedTime}</span>
                ) : null}
              </span>
              <span className={`tm-video-reason${record.reason ? ' is-fail' : ''}`} title={record.reason ?? ''}>
                {record.reason ?? '-'}
              </span>
              <span className="tm-video-action-cell">
                {playable ? (
                  <span className="tm-video-action">查看视频</span>
                ) : record.status === '上传失败' ? (
                  retriedIds.includes(record.id) ? (
                    <span className="tm-video-action is-done">已重试</span>
                  ) : (
                    <button
                      type="button"
                      className="tm-video-action tm-video-action--clickable"
                      onClick={() => retryTask(record)}
                    >
                      重试
                    </button>
                  )
                ) : '-'}
              </span>
            </div>
          );
        })}
      </div>
      <div className="tm-record-pager">
        <span className="tm-record-pager__total">共 {filteredRecords.length} 条</span>
        <div className="tm-record-pager__pages">
          <button
            type="button"
            className="tm-record-pager__btn"
            disabled={currentPage === 1}
            aria-label="上一页"
            onClick={() => setPage(currentPage - 1)}
          >
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
            <button
              type="button"
              key={pageNumber}
              className={`tm-record-pager__btn${pageNumber === currentPage ? ' is-active' : ''}`}
              onClick={() => setPage(pageNumber)}
            >
              {pageNumber}
            </button>
          ))}
          <button
            type="button"
            className="tm-record-pager__btn"
            disabled={currentPage === totalPages}
            aria-label="下一页"
            onClick={() => setPage(currentPage + 1)}
          >
            ›
          </button>
        </div>
      </div>
    </>
  );
};

const VideoPreviewPage = ({ record }: { record: VideoTaskRecord }) => {
  const info = PRODUCT_CATALOG[record.productKey];
  const duration = videoDurationSeconds(record.duration);
  const playable = record.status === '上传成功';
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!playing || !playable) return;
    const timer = window.setInterval(() => {
      setProgress((value) => (value + 0.01 >= 1 ? 0 : value + 0.01));
    }, 100);
    return () => window.clearInterval(timer);
  }, [playing, playable]);

  const togglePlay = () => {
    if (!playable) return;
    setPlaying((value) => !value);
  };

  const seek = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!playable || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    setProgress(ratio);
  };

  const elapsed = Math.round(progress * duration);
  const backUrl = `${window.location.origin}${window.location.pathname}?tmTab=video-upload`;
  const statusClass = record.status === '上传中' ? 'is-running is-loading' : playable ? 'is-success' : 'is-fail';

  return (
    <div className="tm-video-page">
      <header className="tm-video-page__header">
        <a className="tm-video-page__back" href={backUrl}>← 返回任务管理器</a>
        <span className="tm-video-page__title">商品短视频</span>
        <span className="tm-video-page__spacer" aria-hidden="true" />
      </header>
      <main className="tm-video-page__main">
        <section className="tm-video-player" aria-label="视频播放器">
          <div
            className={`tm-video-player__stage${playable ? ' is-playable' : ''}`}
            onClick={togglePlay}
            role={playable ? 'button' : undefined}
            aria-label={playable ? (playing ? '暂停视频' : '播放视频') : undefined}
            tabIndex={playable ? 0 : undefined}
            onKeyDown={(event) => {
              if (playable && (event.key === 'Enter' || event.key === ' ')) {
                event.preventDefault();
                togglePlay();
              }
            }}
          >
            <img
              src={info.image}
              alt={info.title}
              style={{ transform: `scale(${1 + progress * 0.14})` }}
            />
            {!playable ? (
              <span className="tm-video-player__unavailable">
                <span>视频未上传成功，暂不可播放</span>
                {record.reason ? <span className="tm-video-player__unavailable-reason">{record.reason}</span> : null}
              </span>
            ) : null}
            {playable && !playing ? (
              <span className="tm-video-player__center" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor" /></svg>
              </span>
            ) : null}
          </div>
          <div className="tm-video-player__controls">
            <button
              type="button"
              className="tm-video-player__btn"
              aria-label={playing ? '暂停' : '播放'}
              onClick={togglePlay}
              disabled={!playable}
            >
              {playing ? (
                <svg width="14" height="14" viewBox="0 0 24 24"><path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor" /></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor" /></svg>
              )}
            </button>
            <span className="tm-video-player__time">{formatVideoTime(elapsed)}</span>
            <div className="tm-video-player__track" ref={trackRef} onClick={seek} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
              <span style={{ width: `${progress * 100}%` }} />
            </div>
            <span className="tm-video-player__time">{record.duration}</span>
          </div>
        </section>
        <section className="tm-video-page__info">
          <div className="tm-video-page__product">
            <img className="tm-video-page__cover" src={info.image} alt={info.title} />
            <div className="tm-video-page__product-main">
              <h1 className="tm-video-page__product-title">{info.title}</h1>
              <span className="tm-video-page__product-meta">商品编号 {info.id}</span>
              <span className="tm-video-page__product-meta">店铺 {info.shopName}（{info.shopAlias}）</span>
            </div>
          </div>
          <div className="tm-video-page__status">
            <span className={`tm-task-tag ${statusClass}`}>
              {record.status === '上传中' ? <Spinner size={12} /> : null}
              {record.status}
            </span>
          </div>
          <dl className="tm-video-page__meta">
            <dt>视频名称</dt>
            <dd>{record.videoName}</dd>
            <dt>视频简介</dt>
            <dd>{record.videoIntroduction}</dd>
            <dt>上传时间</dt>
            <dd>{record.time}</dd>
          </dl>
          {record.reason ? (
            <div className="tm-video-page__reason">
              <span className="tm-video-page__reason-label">失败原因</span>
              <span>{record.reason}</span>
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
};

const ExportPanel = () => {
  const [records, setRecords] = useState<ExportRecord[]>(EXPORT_RECORDS);
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'全部' | ExportSource>('全部');
  const [statusFilter, setStatusFilter] = useState<'全部' | ExportStatus>('全部');
  const retryTimers = useRef<number[]>([]);

  useEffect(() => () => {
    retryTimers.current.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const filteredRecords = records.filter((record) => {
    const date = record.time.slice(0, 10);
    if (startDate && date < startDate) return false;
    if (endDate && date > endDate) return false;
    if (sourceFilter !== '全部' && record.source !== sourceFilter) return false;
    if (statusFilter !== '全部' && record.status !== statusFilter) return false;
    return true;
  });

  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedRecords = filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => { setPage(1); }, [startDate, endDate, sourceFilter, statusFilter]);

  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setSourceFilter('全部');
    setStatusFilter('全部');
    setPage(1);
  };

  const retryExport = (id: string) => {
    setRecords((prev) => prev.map((record) => (
      record.id === id ? { ...record, status: '导出中', finishTime: undefined } : record
    )));
    const timer = window.setTimeout(() => {
      const now = new Date();
      setRecords((prev) => prev.map((record) => (
        record.id === id
          ? { ...record, status: '导出成功', finishTime: `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())} ${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}` }
          : record
      )));
    }, 1600);
    retryTimers.current.push(timer);
  };

  const renderStatus = (status: ExportStatus) => {
    if (status === '导出成功') return <span className="tm-task-tag is-done">导出成功</span>;
    if (status === '导出失败') return <span className="tm-task-tag is-fail">导出失败</span>;
    return (
      <span className="tm-task-tag is-running is-loading">
        <Spinner size={12} />
        导出中
      </span>
    );
  };

  return (
    <>
      <div className="tm-record-query">
        <div className="tm-record-query__field">
          <span className="tm-record-query__label">时间</span>
          <DatePicker value={startDate} onChange={setStartDate} placeholder="开始日期" />
          <span className="tm-record-query__sep">至</span>
          <DatePicker value={endDate} onChange={setEndDate} placeholder="结束日期" />
        </div>
        <div className="tm-record-query__field">
          <span className="tm-record-query__label">导出来源</span>
          <FilterSelect
            value={sourceFilter}
            options={['全部', ...EXPORT_SOURCES] as const}
            onChange={setSourceFilter}
            ariaLabel="导出来源"
          />
        </div>
        <div className="tm-record-query__field">
          <span className="tm-record-query__label">状态</span>
          <FilterSelect
            value={statusFilter}
            options={['全部', '导出中', '导出成功', '导出失败'] as const}
            onChange={setStatusFilter}
            ariaLabel="状态"
          />
        </div>
        <button type="button" className="tm-record-query__reset" onClick={resetFilters}>重置</button>
      </div>
      <div className="tm-records tm-task-list tm-export-list">
        <div className="tm-task-row tm-task-row--head">
          <span>发起时间</span>
          <span>导出来源</span>
          <span className="tm-records__cell--num">导出数据条数</span>
          <span>状态/完成时间</span>
          <span className="tm-export-action-cell">操作</span>
        </div>
        {pagedRecords.length === 0 ? (
          <div className="tm-records__empty">暂无数据</div>
        ) : pagedRecords.map((record) => (
          <div className="tm-task-row" key={record.id}>
            <span className="tm-records__time">{record.time}</span>
            <span className="tm-export-source" title={record.source}>{record.source}</span>
            <span className="tm-records__cell--num">{record.count}</span>
            <span className="tm-task-status-cell">
              {renderStatus(record.status)}
              <span className="tm-task-status-cell__time">{record.finishTime ?? '-'}</span>
            </span>
            <span className="tm-export-action-cell">
              {record.status === '导出失败' ? (
                <button
                  type="button"
                  className="tm-export-action"
                  onClick={() => retryExport(record.id)}
                >
                  重新导出
                </button>
              ) : (
                <button
                  type="button"
                  className="tm-export-action"
                  disabled={record.status === '导出中'}
                  onClick={() => downloadExportFile(record)}
                >
                  下载
                </button>
              )}
            </span>
          </div>
        ))}
      </div>
      <div className="tm-record-pager">
        <span className="tm-record-pager__total">共 {filteredRecords.length} 条</span>
        <div className="tm-record-pager__pages">
          <button
            type="button"
            className="tm-record-pager__btn"
            disabled={currentPage === 1}
            aria-label="上一页"
            onClick={() => setPage(currentPage - 1)}
          >
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
            <button
              type="button"
              key={pageNumber}
              className={`tm-record-pager__btn${pageNumber === currentPage ? ' is-active' : ''}`}
              onClick={() => setPage(pageNumber)}
            >
              {pageNumber}
            </button>
          ))}
          <button
            type="button"
            className="tm-record-pager__btn"
            disabled={currentPage === totalPages}
            aria-label="下一页"
            onClick={() => setPage(currentPage + 1)}
          >
            ›
          </button>
        </div>
      </div>
    </>
  );
};

const TaskManagerDialog = () => {
  const [visible, setVisible] = useState(true);
  const [activeTab, setActiveTab] = useState<TaskTabKey>(() => {
    const tab = new URLSearchParams(window.location.search).get('tmTab');
    return TASK_TABS.some((item) => item.key === tab) ? (tab as TaskTabKey) : 'claim';
  });
  const bodyRef = useRef<HTMLDivElement | null>(null);

  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);
  const activeRecord = PUBLISH_RECORDS.find((record) => record.id === activeRecordId) ?? null;

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loopFilter, setLoopFilter] = useState<'全部' | '是' | '否'>('全部');
  const [statusFilter, setStatusFilter] = useState<'全部' | RecordStatus>('全部');
  const [page, setPage] = useState(1);

  const [detailLoopFilter, setDetailLoopFilter] = useState<'全部' | ProductLoopState>('全部');
  const [detailResultFilter, setDetailResultFilter] = useState<'全部' | PublishResult>('全部');
  const [detailStatusFilter, setDetailStatusFilter] = useState<'全部' | ProductCurrentStatus>('全部');
  const [detailPage, setDetailPage] = useState(1);
  const [copyFeedback, setCopyFeedback] = useState<{ count: number; failed: boolean } | null>(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
  }, [activeTab, activeRecordId]);

  const pageSize = 5;
  const filteredRecords = PUBLISH_RECORDS.filter((record) => {
    const date = record.time.slice(0, 10);
    if (startDate && date < startDate) return false;
    if (endDate && date > endDate) return false;
    if (loopFilter !== '全部' && record.isLoop !== (loopFilter === '是')) return false;
    if (statusFilter !== '全部' && recordStatus(record) !== statusFilter) return false;
    return true;
  });
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedRecords = filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => { setPage(1); }, [startDate, endDate, loopFilter, statusFilter]);

  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setLoopFilter('全部');
    setStatusFilter('全部');
    setPage(1);
  };

  const detailPageSize = 5;
  const detailProducts = activeRecord
    ? activeRecord.products.filter((item) => {
        if (activeRecord.isLoop && detailLoopFilter !== '全部' && item.loopState !== detailLoopFilter) return false;
        if (detailResultFilter !== '全部' && item.publishResult !== detailResultFilter) return false;
        if (detailStatusFilter !== '全部' && item.current !== detailStatusFilter) return false;
        return true;
      })
    : [];
  const detailTotalPages = Math.max(1, Math.ceil(detailProducts.length / detailPageSize));
  const detailCurrentPage = Math.min(detailPage, detailTotalPages);
  const pagedDetailProducts = detailProducts.slice((detailCurrentPage - 1) * detailPageSize, detailCurrentPage * detailPageSize);
  const detailStats = activeRecord ? recordStats(activeRecord) : null;
  const detailTotal = activeRecord ? activeRecord.products.length : 0;
  const detailPending = detailStats ? detailTotal - detailStats.done - detailStats.failed : 0;
  const detailStatus = activeRecord ? recordStatus(activeRecord) : '发布完成';

  useEffect(() => { setDetailPage(1); }, [detailLoopFilter, detailResultFilter, detailStatusFilter]);
  useEffect(() => {
    setDetailLoopFilter('全部');
    setDetailResultFilter('全部');
    setDetailStatusFilter('全部');
    setDetailPage(1);
  }, [activeRecordId]);

  const resetDetailFilters = () => {
    setDetailLoopFilter('全部');
    setDetailResultFilter('全部');
    setDetailStatusFilter('全部');
    setDetailPage(1);
  };

  const copyProductIds = async () => {
    const text = detailProducts.map((item) => item.id).join('\n');
    if (!text) return;
    let copied = false;
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      copied = document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopyFeedback({ count: detailProducts.length, failed: !copied });
    window.setTimeout(() => setCopyFeedback(null), 2000);
  };

  return (
    <>
      {visible ? (
        <div className="tm-overlay">
          <div className="tm-dialog" role="dialog" aria-modal="true" aria-label="任务管理">
            <div className="tm-dialog__header">
              <span className="tm-dialog__title">任务管理</span>
              <div className="tm-tabs" role="tablist" aria-label="任务类型">
                {TASK_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab.key}
                    className={`tm-tab${activeTab === tab.key ? ' is-active' : ''}`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <button type="button" className="tm-dialog__close" aria-label="关闭" onClick={() => setVisible(false)}>×</button>
            </div>

            <div ref={bodyRef} className="tm-dialog__body" role="tabpanel">
              {activeTab === 'export' ? (
                <ExportPanel />
              ) : activeTab === 'batch-image' ? (
                <ImageTaskPanel records={IMAGE_TASKS} />
              ) : activeTab === 'video-upload' ? (
                <VideoTaskPanel records={VIDEO_TASKS} />
              ) : activeTab === 'product-sync' || activeTab === 'order-sync' ? (
                <SyncTaskPanel
                  key={activeTab}
                  kind={activeTab}
                  records={SYNC_TASKS[activeTab]}
                />
              ) : activeTab !== 'publish' ? (
                <TaskPanel
                  key={activeTab}
                  kind={activeTab}
                  records={TASK_SOURCE[activeTab]}
                  onNavigate={() => { if (bodyRef.current) bodyRef.current.scrollTop = 0; }}
                />
              ) : activeRecord ? (
                <div className="tm-record-detail">
                  <button type="button" className="tm-record-detail__back" onClick={() => setActiveRecordId(null)}>
                    ← 返回发布记录
                  </button>
                  <div className="tm-record-detail__summary">
                    <span className="tm-record-detail__time">{activeRecord.time}</span>
                    <span>{activeRecord.products.length} 个商品</span>
                    {activeRecord.isLoop ? <span className="tm-records__tag is-loop">循环刊登</span> : null}
                    <button
                      type="button"
                      className="tm-record-detail__copy"
                      disabled={detailProducts.length === 0}
                      onClick={copyProductIds}
                    >
                      {copyFeedback
                        ? (copyFeedback.failed ? '复制失败' : `已复制 ${copyFeedback.count} 个`)
                        : '批量复制商品编号'}
                    </button>
                  </div>
                  {detailStats ? (
                    <div className="tm-task-stats">
                      <span className="tm-task-stats__item">商品总数 <b>{detailTotal}</b></span>
                      <span className="tm-task-stats__item is-success">发布完成 <b>{detailStats.done}</b></span>
                      <span className="tm-task-stats__item is-danger">发布失败 <b>{detailStats.failed}</b></span>
                      {detailPending > 0 ? <span className="tm-task-stats__item is-info">处理中 <b>{detailPending}</b></span> : null}
                      <span className="tm-task-stats__progress">
                        <span className="tm-task-progress__bar is-wide">
                          <span
                            className={detailStatus === '发布中' ? 'is-running' : detailStats.failed > 0 ? 'is-partial' : 'is-done'}
                            style={{ width: `${detailStats.percent}%` }}
                          />
                        </span>
                        <span className="tm-task-stats__percent">{detailStats.percent}%</span>
                      </span>
                    </div>
                  ) : null}
                  <div className="tm-record-query tm-record-query--detail">
                    {activeRecord.isLoop ? (
                      <div className="tm-record-query__field">
                        <span className="tm-record-query__label">循环状态</span>
                        <FilterSelect
                          value={detailLoopFilter}
                          options={['全部', '循环中', '循环结束', '开启新循环'] as const}
                          onChange={setDetailLoopFilter}
                          ariaLabel="循环状态"
                        />
                      </div>
                    ) : null}
                    <div className="tm-record-query__field">
                      <span className="tm-record-query__label">发布结果</span>
                      <FilterSelect
                        value={detailResultFilter}
                        options={['全部', '待发布', '发布中', '待审核', '审核不通过', '循环刊登', '发布失败'] as const}
                        onChange={setDetailResultFilter}
                        ariaLabel="发布结果"
                      />
                    </div>
                    <div className="tm-record-query__field">
                      <span className="tm-record-query__label">最新状态</span>
                      <FilterSelect
                        value={detailStatusFilter}
                        options={['全部', '待发布', '发布中', '循环刊登', '发布失败', '已上架', '已下架', '待审核', '审核未通过', '内容违规', '侵权违规', '品牌商投诉'] as const}
                        onChange={setDetailStatusFilter}
                        ariaLabel="最新状态"
                      />
                    </div>
                    <button type="button" className="tm-record-query__reset" onClick={resetDetailFilters}>重置</button>
                  </div>
                  <div className="tm-records tm-records--detail">
                    <div className="tm-records__row tm-records__row--head tm-records__row--products">
                      <span>商品信息</span>
                      <span>刊登平台</span>
                      <span>刊登店铺</span>
                      <span className="tm-records__th--help">
                        循环状态
                        <HelpTooltip label="循环状态说明">
                          <span className="tm-help__line"><b>循环中</b>：还有剩余次数，会继续重试</span>
                          <span className="tm-help__line"><b>循环结束</b>：次数用完或已发布成功</span>
                          <span className="tm-help__line"><b>开启新循环</b>：旧循环被新循环接管</span>
                        </HelpTooltip>
                      </span>
                      <span>循环次数</span>
                      <span>发布结果</span>
                      <span>发布失败原因</span>
                      <span>最新状态</span>
                    </div>
                    {pagedDetailProducts.length === 0 ? (
                      <div className="tm-records__empty">暂无数据</div>
                    ) : pagedDetailProducts.map((item) => (
                      <div className="tm-records__row tm-records__row--products" key={`${activeRecord.id}-${item.id}`}>
                        <span className="tm-product-cell">
                          <img className="tm-product-cell__img" src={item.image} alt={item.title} />
                          <span className="tm-product-cell__main">
                            <span className="tm-product-cell__title" title={item.title}>{item.title}</span>
                            <span className="tm-product-cell__id">{item.id}</span>
                          </span>
                        </span>
                        <span>敦煌网</span>
                        <span className="tm-shop-cell">
                          <span className="tm-shop-cell__name" title={item.shopName}>{item.shopName}</span>
                          <span className="tm-shop-cell__alias" title={item.shopAlias}>{item.shopAlias}</span>
                        </span>
                        <span>{activeRecord.isLoop ? item.loopState ?? '-' : '-'}</span>
                        <span>{activeRecord.isLoop && item.attempts != null ? `${item.attempts}/${activeRecord.loopLimit}` : '-'}</span>
                        <span>{item.publishResult ?? '-'}</span>
                        <span className={`tm-publish-reason${item.failReason ? ' is-fail' : ''}`} title={item.failReason}>
                          {item.failReason ?? '-'}
                        </span>
                        <span>
                          <span className={`tm-records__tag ${currentTagClass(item.current)}`}>{item.current}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="tm-record-pager">
                    <span className="tm-record-pager__total">共 {detailProducts.length} 条</span>
                    <div className="tm-record-pager__pages">
                      <button
                        type="button"
                        className="tm-record-pager__btn"
                        disabled={detailCurrentPage === 1}
                        aria-label="上一页"
                        onClick={() => setDetailPage(detailCurrentPage - 1)}
                      >
                        ‹
                      </button>
                      {Array.from({ length: detailTotalPages }, (_, index) => index + 1).map((pageNumber) => (
                        <button
                          type="button"
                          key={pageNumber}
                          className={`tm-record-pager__btn${pageNumber === detailCurrentPage ? ' is-active' : ''}`}
                          onClick={() => setDetailPage(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      ))}
                      <button
                        type="button"
                        className="tm-record-pager__btn"
                        disabled={detailCurrentPage === detailTotalPages}
                        aria-label="下一页"
                        onClick={() => setDetailPage(detailCurrentPage + 1)}
                      >
                        ›
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="tm-record-query">
                    <div className="tm-record-query__field">
                      <span className="tm-record-query__label">时间</span>
                      <DatePicker value={startDate} onChange={setStartDate} placeholder="开始日期" />
                      <span className="tm-record-query__sep">至</span>
                      <DatePicker value={endDate} onChange={setEndDate} placeholder="结束日期" />
                    </div>
                    <div className="tm-record-query__field">
                      <span className="tm-record-query__label">是否循环刊登</span>
                      <FilterSelect
                        value={loopFilter}
                        options={['全部', '是', '否'] as const}
                        onChange={setLoopFilter}
                        ariaLabel="是否循环刊登"
                      />
                    </div>
                    <div className="tm-record-query__field">
                      <span className="tm-record-query__label">状态</span>
                      <FilterSelect
                        value={statusFilter}
                        options={['全部', '发布中', '发布完成', '部分失败'] as const}
                        onChange={setStatusFilter}
                        ariaLabel="状态"
                      />
                    </div>
                    <button type="button" className="tm-record-query__reset" onClick={resetFilters}>重置</button>
                  </div>
                  <div className="tm-records">
                    <div className="tm-records__row tm-records__row--head">
                      <span>发起时间</span>
                      <span>商品数</span>
                      <span>是否循环刊登</span>
                      <span>循环次数</span>
                      <span>发布进度</span>
                      <span className="tm-records__cell--num">发布完成数量</span>
                      <span className="tm-records__cell--num">发布失败数量</span>
                      <span>状态</span>
                      <span />
                    </div>
                    {pagedRecords.length === 0 ? (
                      <div className="tm-records__empty">暂无数据</div>
                    ) : pagedRecords.map((record) => {
                      const status = recordStatus(record);
                      const stats = recordStats(record);
                      return (
                        <div
                          className="tm-records__row tm-records__row--clickable"
                          key={record.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => setActiveRecordId(record.id)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              setActiveRecordId(record.id);
                            }
                          }}
                        >
                          <span className="tm-records__time">{record.time}</span>
                          <span>{record.products.length} 个</span>
                          <span>
                            <span className={`tm-records__tag ${record.isLoop ? 'is-loop' : 'is-single'}`}>
                              {record.isLoop ? '是' : '否'}
                            </span>
                          </span>
                          <span>{record.isLoop && record.loopLimit ? `${record.loopLimit} 次` : '-'}</span>
                          <span className="tm-task-progress">
                            <span className="tm-task-progress__bar">
                              <span
                                className={status === '发布中' ? 'is-running' : stats.failed > 0 ? 'is-partial' : 'is-done'}
                                style={{ width: `${stats.percent}%` }}
                              />
                            </span>
                            <span className="tm-task-progress__text">
                              {stats.done + stats.failed}/{record.products.length} · {stats.percent}%
                            </span>
                          </span>
                          <span className="tm-records__cell--num">{stats.done}</span>
                          <span className="tm-records__cell--num">{stats.failed}</span>
                          <span>
                            <span className={`tm-task-tag ${status === '发布中' ? 'is-running is-loading' : status === '部分失败' ? 'is-partial' : 'is-done'}`}>
                              {status === '发布中' ? <Spinner size={12} /> : null}
                              {status}
                            </span>
                          </span>
                          <span className="tm-records__arrow">›</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="tm-record-pager">
                    <span className="tm-record-pager__total">共 {filteredRecords.length} 条</span>
                    <div className="tm-record-pager__pages">
                      <button
                        type="button"
                        className="tm-record-pager__btn"
                        disabled={currentPage === 1}
                        aria-label="上一页"
                        onClick={() => setPage(currentPage - 1)}
                      >
                        ‹
                      </button>
                      {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                        <button
                          type="button"
                          key={pageNumber}
                          className={`tm-record-pager__btn${pageNumber === currentPage ? ' is-active' : ''}`}
                          onClick={() => setPage(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      ))}
                      <button
                        type="button"
                        className="tm-record-pager__btn"
                        disabled={currentPage === totalPages}
                        aria-label="下一页"
                        onClick={() => setPage(currentPage + 1)}
                      >
                        ›
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <button type="button" className="tm-reopen" onClick={() => setVisible(true)}>打开任务管理器</button>
      )}
    </>
  );
};

const TaskManagerApp = () => {
  const [videoId] = useState(() => new URLSearchParams(window.location.search).get('tmVideo'));
  const previewRecord = videoId ? VIDEO_TASKS.find((record) => record.id === videoId) : undefined;
  return previewRecord ? <VideoPreviewPage record={previewRecord} /> : <TaskManagerDialog />;
};

export default TaskManagerApp;
