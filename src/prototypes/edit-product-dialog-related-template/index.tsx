/**
 * @name 编辑产品弹窗 - 新增关联产品模板
 */

import React from 'react';
import './style.css';

import thumb1 from './assets/thumb-1.png';
import thumb2 from './assets/thumb-2.png';
import thumb3 from './assets/thumb-3.png';
import thumb4 from './assets/thumb-4.png';
import thumb5 from './assets/thumb-5.png';
import thumb6 from './assets/thumb-6.png';
import thumb7 from './assets/thumb-7.png';
import thumb8 from './assets/thumb-8.png';
import thumb9 from './assets/thumb-9.png';
import thumb10 from './assets/thumb-10.png';

import iconClose from './assets/icons/close.svg';
import iconCollapse from './assets/icons/collapse.svg';
import iconTrash from './assets/icons/trash.svg';
import iconMail from './assets/icons/mail.svg';
import iconPagerPrev from './assets/icons/pager-prev.svg';
import iconPagerNext from './assets/icons/pager-next.svg';
import iconLinkWhite from './assets/icons/link-white.svg';
import iconMenuGrid from './assets/icons/m-grid.svg';
import iconMenuDoc from './assets/icons/m-doc.svg';
import iconMenuTag from './assets/icons/m-tag.svg';
import iconMenuEdit from './assets/icons/m-edit.svg';
import iconMenuTable from './assets/icons/m-table.svg';
import iconMenuVideo from './assets/icons/m-video.svg';
import iconMenuImage from './assets/icons/m-image.svg';
import iconMenuImageOutline from './assets/icons/m-image-o.svg';
import iconMenuBox from './assets/icons/m-box.svg';
import iconMenuMoney from './assets/icons/m-money.svg';
import iconMenuGem from './assets/icons/m-gem.svg';
import iconMenuPlan from './assets/icons/m-plan.svg';
import iconMenuHeadset from './assets/icons/m-headset.svg';
import iconMenuWeight from './assets/icons/m-weight.svg';
import iconMenuLink from './assets/icons/m-link.svg';
import { AnnotationViewer, type AnnotationSourceDocument } from '@axhub/annotation';
import annotationSourceDocument from './annotation-source.json';

const PRODUCTS = [
  { title: 'Totes Black Classic Minim…', thumb: thumb1, selected: true },
  { title: 'Casual Shoes Ladies Leat…', thumb: thumb2, selected: false },
  { title: 'Tote Bag Luxury Designer …', thumb: thumb3, selected: false },
  { title: 'Sweatpants Capri Women…', thumb: thumb4, selected: false },
  { title: 'Sandals Designer Slide S…', thumb: thumb5, selected: false },
  { title: 'Boots Women Ankle Boots…', thumb: thumb6, selected: false },
  { title: 'Khaki Pants Capris Wome…', thumb: thumb7, selected: false },
  { title: 'Stripe Shirts Luxurious Me…', thumb: thumb8, selected: false },
  { title: 'Totes Buy Minimalist Hand…', thumb: thumb9, selected: false },
  { title: 'Shoulder Bag Monogram …', thumb: thumb10, selected: false },
];

const MENU = [
  { icon: iconMenuGrid, label: '状态/类目' },
  { icon: iconMenuDoc, label: '产品信息' },
  { icon: iconMenuTag, label: '关键词' },
  { icon: iconMenuEdit, label: '短描' },
  { icon: iconMenuTable, label: '产品属性' },
  { icon: iconMenuVideo, label: '视频' },
  { icon: iconMenuImage, label: '主图' },
  { icon: iconMenuImageOutline, label: '站外推广图' },
  { icon: iconMenuBox, label: '产品规格' },
  { icon: iconMenuMoney, label: '价格 USD' },
  { icon: iconMenuGem, label: '定制商品' },
  { icon: iconMenuPlan, label: '销售方案' },
  { icon: iconMenuHeadset, label: '服务' },
  { icon: iconMenuWeight, label: '重量/包装' },
  { icon: iconMenuLink, label: '货源/系统信息' },
];

function Radio({ label, on = false }: { label: string; on?: boolean }) {
  return (
    <span className={on ? 'emt-radio emt-radio--on' : 'emt-radio'}>
      <span className="emt-radio__dot" />
      {label}
    </span>
  );
}

function Stepper({ value, valWidth }: { value: string; valWidth: number }) {
  return (
    <>
      <span className="emt-step__btn emt-step__btn--minus">-</span>
      <span className="emt-step__val" style={{ width: valWidth }}>{value}</span>
      <span className="emt-step__btn emt-step__btn--plus">+</span>
    </>
  );
}

export default function Prototype() {
  return (
    <>
      <div className="emd-mask">
        <div className="emd-dialog" role="dialog" aria-modal="true" aria-label="编辑产品">
          <h2 className="emd-dialog__title">编辑产品</h2>
          <img className="emd-dialog__close" src={iconClose} alt="关闭" />

          <ul className="emd-list">
            {PRODUCTS.map((item) => (
              <li key={item.title} className={item.selected ? 'emd-item emd-item--active' : 'emd-item'}>
                <span className="emd-item__card" />
                <img className="emd-item__thumb" src={item.thumb} alt="" />
                <p className="emd-item__title">{item.title}</p>
                <div className="emd-item__foot">
                  <span className="emd-item__status">未编辑</span>
                  <span className="emd-item__actions">
                    <span className="emd-item__action">
                      <img src={iconTrash} alt="" />
                    </span>
                    <span className="emd-item__action">
                      <img src={iconMail} alt="" />
                    </span>
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <div className="emd-pager">
            <span className="emd-pager__btn">
              <img src={iconPagerPrev} alt="" />
            </span>
            <span className="emd-pager__btn emd-pager__btn--next">
              <img src={iconPagerNext} alt="" />
            </span>
          </div>

          <div className="emd-tabs">
            <img className="emd-tabs__collapse" src={iconCollapse} alt="收起列表" />
            <span className="emd-tabs__item emd-tabs__item--active">基本</span>
            <span className="emd-tabs__divider" />
            <span className="emd-tabs__item">详情</span>
            <span className="emd-tabs__divider" />
            <span className="emd-tabs__item">日志</span>
          </div>

          <nav className="emd-menu">
            {MENU.map((item) => (
              <div
                key={item.label}
                className={item.label === '定制商品' ? 'emd-menu__item emd-menu__item--active' : 'emd-menu__item'}
              >
                <img className="emd-menu__icon" src={item.icon} alt="" />
                <span className="emd-menu__label">{item.label}</span>
                {item.label === '定制商品' && <span className="emd-menu__bar" />}
              </div>
            ))}
          </nav>

          <div className="emd-editor">
            <div className="emt-cols">
              <div className="emt-col emt-col--l">
                <section className="emt-card emt-card--sale">
                  <h3 className="emt-title"><span className="emt-title__star">*</span>销售方案</h3>
                  <span className="emt-hr" />

                  <div className="emt-row emt-row--sale1">
                    <span className="emt-label"><span className="emt-label__star">*</span>销售计量单位</span>
                    <span className="emt-select emt-select--unit">件</span>
                    <span className="emt-label__star--way">*</span>
                    <span className="emt-label emt-label--way">销售方式</span>
                    <span className="emt-radios emt-radios--way">
                      <Radio label="按件卖" on />
                      <Radio label="按包卖" />
                    </span>
                  </div>

                  <div className="emt-row emt-row--sale2">
                    <span className="emt-label">备货状态</span>
                    <span className="emt-radios emt-radios--stock">
                      <Radio label="有备货" />
                      <Radio label="备货中" on />
                      <Radio label="待备货" />
                    </span>
                  </div>

                  <div className="emt-row emt-row--sale3">
                    <span className="emt-label">备货所在地</span>
                    <span className="emt-select emt-select--area">中国</span>
                    <span className="emt-btn-add emt-btn-add--area">+&nbsp;新增</span>
                    <span className="emt-count emt-count--area">1/217</span>
                  </div>

                  <div className="emt-row emt-row--sale4">
                    <span className="emt-label"><span className="emt-label__star">*</span>库存扣减方式</span>
                    <span className="emt-radios emt-radios--deduct">
                      <Radio label="下单扣减库存" />
                      <Radio label="支付扣减库存" on />
                    </span>
                  </div>

                  <div className="emt-row emt-row--sale5">
                    <span className="emt-label"><span className="emt-label__star">*</span>备货期</span>
                    <span className="emt-step emt-step--period">
                      <Stepper value="7" valWidth={64} />
                    </span>
                    <span className="emt-unit emt-unit--day">天</span>
                    <span className="emt-hint emt-hint--period">（备货期为5-10天）</span>
                  </div>

                  <div className="emt-row emt-row--sale6">
                    <span className="emt-label">价格区间</span>
                    <span className="emt-step emt-step--price">
                      <Stepper value="1" valWidth={80} />
                    </span>
                    <span className="emt-hint emt-hint--price emt-hint--wrap">（购买(件)以上时,为表格中填写的实际收入）</span>
                    <span className="emt-btn-add emt-btn-add--price">+&nbsp;新增</span>
                    <span className="emt-count emt-count--price">1/4</span>
                  </div>

                  <div className="emt-row emt-row--sale7">
                    <span className="emt-label">有效期</span>
                    <span className="emt-select emt-select--valid">0</span>
                  </div>
                </section>

                <section className="emt-card emt-card--weight">
                  <h3 className="emt-title"><span className="emt-title__star">*</span>重量/包装</h3>
                  <span className="emt-hr" />

                  <div className="emt-row emt-row--w1">
                    <span className="emt-label">包装后重量</span>
                    <span className="emt-step emt-step--wweight">
                      <Stepper value="0.500" valWidth={94} />
                    </span>
                    <span className="emt-unit emt-unit--kg">公斤/件</span>
                    <span className="emt-switch emt-switch--custom" />
                    <span className="emt-label emt-label--custom">自定义重量</span>
                  </div>

                  <div className="emt-row emt-row--w2">
                    <span className="emt-label">包装尺寸</span>
                    <span className="emt-step emt-step--wlen">
                      <Stepper value="30.00" valWidth={54} />
                    </span>
                    <span className="emt-unit emt-unit--len">长 CM</span>
                    <span className="emt-step emt-step--wwid">
                      <Stepper value="15.00" valWidth={54} />
                    </span>
                    <span className="emt-unit emt-unit--wid">宽 CM</span>
                  </div>
                </section>
              </div>

              <div className="emt-col emt-col--r">
                <section className="emt-card emt-card--service">
                  <h3 className="emt-title">服务</h3>
                  <span className="emt-hr" />

                  <div className="emt-row emt-row--svc1">
                    <span className="emt-label">商品分级管理</span>
                    <span className="emt-radios emt-radios--grade">
                      <Radio label="成人属性" />
                      <Radio label="非成人属性" on />
                    </span>
                  </div>

                  <span className="emt-label emt-label--grp">线上分组</span>
                  <span className="emt-select emt-select--tall emt-select--svc emt-select--grp emt-select--ph">请选择线上分组</span>
                  <span className="emt-label emt-label--freight">运费模板</span>
                  <span className="emt-select emt-select--tall emt-select--svc emt-select--freight">免运费的模版</span>
                  <span className="emt-label emt-label--after">售后模板</span>
                  <span className="emt-select emt-select--tall emt-select--svc emt-select--after">默认模板</span>
                  <span className="emt-label emt-label--size">尺码模板</span>
                  <span className="emt-select emt-select--tall emt-select--svc emt-select--size emt-select--ph emt-select--warn">请选择尺码模板</span>
                  <span className="emt-label emt-label--product">产品模板</span>
                  <span data-annotation-id="product-template-api" className="emt-select emt-select--tall emt-select--svc emt-select--product emt-select--ph">请选择产品模板</span>
                  <span className="emt-btn-sync">同步</span>
                </section>

                <section className="emt-card emt-card--source">
                  <h3 className="emt-title">货源/系统信息</h3>
                  <span className="emt-counter emt-counter--source">1/20</span>
                  <span className="emt-hr" />

                  <div className="emt-row emt-row--src1">
                    <span className="emt-label emt-label--src1">货源1</span>
                    <span className="emt-select emt-select--src">未选择</span>
                    <span className="emt-input emt-input--url">https://standoil.global/products/lene-bag</span>
                    <span className="emt-btn-icon emt-btn-icon--link">
                      <img src={iconLinkWhite} alt="" />
                    </span>
                    <span className="emt-btn-icon emt-btn-icon--trash">
                      <img src={iconTrash} alt="" />
                    </span>
                  </div>

                  <span className="emt-btn-add emt-btn-add--src">+&nbsp;新增</span>

                  <div className="emt-row emt-row--psku">
                    <span className="emt-label">父sku</span>
                    <span className="emt-input emt-input--psku">BAL-1d1f617549094fe6bbe79b6d0e7dbcc8</span>
                  </div>
                </section>
              </div>
            </div>

            <div className="emt-scroll">
              <div className="emt-scroll__thumb" />
            </div>
          </div>

          <footer className="emd-footer">
            <span className="emd-btn emd-btn--plain">关闭</span>
            <span className="emd-btn emd-btn--primary">保存</span>
            <span className="emd-btn emd-btn--publish">保存并发布</span>
          </footer>
        </div>
      </div>
      <AnnotationViewer
        source={annotationSourceDocument as unknown as AnnotationSourceDocument}
        options={{
          currentPageId: (() => {
            const hashPageId = new URLSearchParams(window.location.hash.replace(/^#/, '')).get('page');
            const searchPageId = new URLSearchParams(window.location.search.replace(/^\?/, '')).get('page');
            const pageId = hashPageId || searchPageId;
            return typeof pageId === 'string' && /^[a-z0-9-]+$/u.test(pageId)
              ? pageId
              : "edit-product-dialog-related-template";
          })(),
          onDirectoryRoute: (node) => {
            if (typeof node.route === 'string' && /^[a-z0-9-]+$/u.test(node.route)) {
              window.location.hash = `page=${node.route}`;
            }
          },
          toolbarEdge: 'right',
          showToolbar: true,
          showThemeToggle: true,
          showColorFilter: true,
          emptyWhenNoData: true,
        }}
      />
    </>
  );
}
