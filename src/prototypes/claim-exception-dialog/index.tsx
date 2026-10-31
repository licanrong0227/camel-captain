/**
 * @name 认领异常弹窗
 */

import React from 'react';
import './style.css';

import thumbNecklace from './assets/thumb-necklace.jpg';
import thumbLoafers from './assets/thumb-loafers.jpg';
import thumbToteBlack from './assets/thumb-tote-black.jpg';
import thumbBrownBag from './assets/thumb-brown-bag.png';
import thumbPetToy from './assets/thumb-pearl-bag.jpg';
import thumbFlapBag from './assets/thumb-flap-bag.jpg';
import thumbLvDuo from './assets/thumb-lv-duo.png';
import thumbMonogramTote from './assets/thumb-monogram-tote.jpg';
import thumbSneakers from './assets/thumb-slippers.jpg';
import thumbBoston from './assets/thumb-boston.jpg';
import thumbMonogramBag from './assets/thumb-monogram-bag.jpg';
import thumbShorts from './assets/thumb-shorts.png';

/* ============ 图标 ============ */

function IconClose() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <path d="M3.6 3.6l8.8 8.8M12.4 3.6l-8.8 8.8" />
    </svg>
  );
}

function IconWarning() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M10 1.8a1.6 1.6 0 0 1 1.38.79l7.2 12.47A1.6 1.6 0 0 1 17.2 17H2.8a1.6 1.6 0 0 1-1.38-2.4l7.2-12.47A1.6 1.6 0 0 1 10 1.8Zm0 4.3a.9.9 0 0 0-.9.9v4a.9.9 0 0 0 1.8 0v-4a.9.9 0 0 0-.9-.9Zm0 8.3a1.05 1.05 0 1 0 0-2.1 1.05 1.05 0 0 0 0 2.1Z" />
    </svg>
  );
}

function IconErrorDot() {
  return (
    <svg viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
      <path d="M6 0a6 6 0 1 1 0 12A6 6 0 0 1 6 0Zm0 2.6a.85.85 0 0 0-.85.85v3.3a.85.85 0 0 0 1.7 0v-3.3A.85.85 0 0 0 6 2.6Zm0 6.7a.95.95 0 1 0 0-1.9.95.95 0 0 0 0 1.9Z" />
    </svg>
  );
}

function IconEdit() {
  return (
    <svg viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
      <path d="M2 10.6h1.9l6-6-1.9-1.9-6 6v1.9Zm9.8-8.1a.7.7 0 0 1 0 1l-1.2 1.2-1.9-1.9 1.3-1.2a.7.7 0 0 1 .8 0l1 .9ZM1.4 12.6h11.2v-1.2H1.4v1.2Z" />
    </svg>
  );
}

/* ============ 数据 ============ */

interface FailedProduct {
  image: string;
  title: string;
  parentSku: string;
  category: string;
  errors: string[];
}

const FAILED_PRODUCTS: FailedProduct[] = [
  {
    image: thumbNecklace,
    title: '新款海蓝宝水滴项链女小众设计轻奢锁骨链蓝色吊坠',
    parentSku: '20261029000001',
    category: '耳环',
    errors: ['未读取到商品 SKU，请至少添加一个 SKU'],
  },
  {
    image: thumbLoafers,
    title: '2026新款男士商务休闲豆豆鞋真皮软底一脚蹬懒人乐福鞋',
    parentSku: '20261029000002',
    category: '乐福鞋',
    errors: ['标题翻译失败，未生成敦煌网英文标题'],
  },
  {
    image: thumbToteBlack,
    title: '大容量托特包女2026新款软皮通勤单肩包极简黑色购物袋',
    parentSku: '20261029000003',
    category: '托特包',
    errors: ['商品重量为 0，无法计算国际运费'],
  },
  {
    image: thumbBrownBag,
    title: '复古油蜡皮手提包女新款单肩斜挎包软皮小方包',
    parentSku: '20261029000004',
    category: '斜挎包',
    errors: ['规格图片下载失败（颜色：焦糖棕）', '商品重量为 0，无法计算国际运费'],
  },
  {
    image: thumbPetToy,
    title: '猫咪隧道玩具组合21件套 含逗猫棒毛球铃铛 宠物互动益智玩具',
    parentSku: '20261029000005',
    category: '宠物玩具',
    errors: ['未读取到商品 SKU，请至少添加一个 SKU'],
  },
  {
    image: thumbFlapBag,
    title: '复古小方包女新款高级感手提单肩斜挎包真皮通勤包',
    parentSku: '20261029000006',
    category: '斜挎包',
    errors: ['刊登类目未匹配，请重新选择敦煌网类目'],
  },
  {
    image: thumbLvDuo,
    title: '老花双包组合女包2026新款手提波士顿包单肩斜挎包',
    parentSku: '20261029000007',
    category: '波士顿包',
    errors: ['规格「大号/小号」缺少售价'],
  },
  {
    image: thumbMonogramTote,
    title: '跨境新款老花手提包女大容量托特包通勤单肩斜挎包',
    parentSku: '20261029000008',
    category: '托特包',
    errors: ['未读取到商品 SKU，请至少添加一个 SKU'],
  },
  {
    image: thumbSneakers,
    title: '黑白拼色休闲板鞋男款低帮运动鞋情侣款滑板鞋',
    parentSku: '20261029000009',
    category: '板鞋',
    errors: ['标题翻译失败，未生成敦煌网英文标题'],
  },
  {
    image: thumbBoston,
    title: '复古印花波士顿包女新款老花手提单肩包软皮斜挎包',
    parentSku: '20261029000010',
    category: '波士顿包',
    errors: ['商品重量为 0，无法计算国际运费'],
  },
  {
    image: thumbMonogramBag,
    title: '新款老花手袋女复古印花单肩包波士顿包通勤手提包',
    parentSku: '20261029000011',
    category: '手袋',
    errors: ['规格图片下载失败（颜色：深咖）', '规格「深咖」缺少售价'],
  },
  {
    image: thumbShorts,
    title: '夏季新款印花休闲短裤女宽松百搭高腰阔腿裤',
    parentSku: '20261029000012',
    category: '短裤',
    errors: ['未读取到商品 SKU，请至少添加一个 SKU'],
  },
];

/* ============ 认领异常弹窗 ============ */

export default function ClaimExceptionDialog() {
  return (
    <div className="ced-layer">
      <div className="ced-dialog ced-error-dialog" role="dialog" aria-modal="true" aria-labelledby="ced-error-title">
        <div className="ced-dialog-head">
          <h2 className="ced-dialog-title" id="ced-error-title">认领异常</h2>
          <button className="ced-icon-btn" type="button" aria-label="关闭">
            <IconClose />
          </button>
        </div>
        <div className="ced-error-body">
          <div className="ced-summary">
            <span className="ced-summary-icon"><IconWarning /></span>
            <div className="ced-summary-text">
              <p className="ced-summary-title">共 {FAILED_PRODUCTS.length} 个商品认领失败</p>
              <p className="ced-summary-desc">以下商品未通过认领校验，按提示修正后可回到认领商品弹窗重新发起认领。</p>
            </div>
          </div>
          <div className="ced-fail-list">
            {FAILED_PRODUCTS.map((item) => (
              <div className="ced-fail-item" key={item.parentSku}>
                <img className="ced-fail-thumb" src={item.image} alt="" />
                <div className="ced-fail-main">
                  <p className="ced-fail-title">{item.title}</p>
                  <p className="ced-fail-meta">
                    <span className="ced-fail-sku">
                      父SKU：<b>{item.parentSku}</b>
                    </span>
                    <i />
                    <span>{item.category}</span>
                  </p>
                  <ul className="ced-fail-errors">
                    {item.errors.map((error) => (
                      <li key={error}>
                        <span className="ced-fail-dot"><IconErrorDot /></span>
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
                <button className="ced-edit-btn" type="button">
                  <IconEdit />
                  <span>编辑商品信息</span>
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="ced-error-foot">
          <button className="ced-btn ced-btn--primary ced-btn--foot" type="button">
            确定
          </button>
        </div>
      </div>
    </div>
  );
}
