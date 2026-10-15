/**
 * @name 编辑产品弹窗 - 视频/主图/站外推广图（精准还原）
 */

import React from 'react';
import './style.css';

import CollageDialog from './components/CollageDialog';

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
import main1 from './assets/main-1.png';
import main2 from './assets/main-2.png';
import main3 from './assets/main-3.png';
import main4 from './assets/main-4.png';
import main5 from './assets/main-5.png';
import promo1 from './assets/promo-1.png';

import iconClose from './assets/icons/close.svg';
import iconCollapse from './assets/icons/collapse.svg';
import iconTrash from './assets/icons/trash.svg';
import iconMail from './assets/icons/mail.svg';
import iconPagerPrev from './assets/icons/pager-prev.svg';
import iconPagerNext from './assets/icons/pager-next.svg';
import iconCamera from './assets/icons/camera-video.svg';
import iconCloud from './assets/icons/cloud.svg';
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
  { title: 'Shoulder Bags For Woma…', thumb: thumb1, selected: true },
  { title: '【老方子】全身结星节蒲…', thumb: thumb2, selected: false },
  { title: 'Totes Luxury Handbag Qu…', thumb: thumb3, selected: false },
  { title: 'Large U-Back Tank Top for…', thumb: thumb4, selected: false },
  { title: '4-Pack Extra Large Bath T…', thumb: thumb5, selected: false },
  { title: 'Extra Deep Pocket Bamboo…', thumb: thumb6, selected: false },
  { title: 'Autumn/Winter Fashion C…', thumb: thumb7, selected: false },
  { title: 'MCRG Walking Pad with I…', thumb: thumb8, selected: false },
  { title: '14-inch Lightweight Foldin…', thumb: thumb9, selected: false },
  { title: '2pcs Chain Design Shoe …', thumb: thumb10, selected: false },
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

const MAIN_SHOTS = [
  { src: main1, size: '1200*1600' },
  { src: main2, size: '1200*1600' },
  { src: main3, size: '1200*1600' },
  { src: main4, size: '600*800' },
  { src: main5, size: '600*800' },
];

export default function Prototype() {
  const [collageOpen, setCollageOpen] = React.useState(false);

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
                    className={item.label === '视频' ? 'emd-menu__item emd-menu__item--active' : 'emd-menu__item'}
                  >
                    <img className="emd-menu__icon" src={item.icon} alt="" />
                    <span className="emd-menu__label">{item.label}</span>
                    {item.label === '视频' && <span className="emd-menu__bar" />}
                  </div>
                ))}
              </nav>
      
              <div className="emd-editor">
                <div className="emd-cards">
                  <section className="emd-card emd-card--video">
                    <h3 className="emd-card__title--clip">视频</h3>
                    <span className="emd-card__divider emd-card__divider--video" />
                    <span className="emd-field-label emd-field-label--name">视频名称</span>
                    <div className="emd-input emd-input--name">
                      <span className="emd-input__placeholder">请输入视频名称</span>
                      <span className="emd-input__counter">0/30</span>
                    </div>
                    <span className="emd-field-label emd-field-label--desc">视频描述</span>
                    <div className="emd-input emd-input--desc">
                      <span className="emd-input__placeholder">请输入视频描述</span>
                      <span className="emd-input__counter">0/200</span>
                    </div>
                    <div className="emd-upload emd-upload--video">
                      <img src={iconCamera} alt="" />
                      <span className="emd-upload__text">上传视频</span>
                    </div>
                  </section>
      
                  <section className="emd-card emd-card--main">
                    <span className="emd-card__star emd-card__star--main">*</span>
                    <h3 className="emd-card__name emd-card__name--main">主图</h3>
                    <span className="emd-card__counter emd-card__counter--main">5/8</span>
                    <span className="emd-card__divider emd-card__divider--main" />
                    <span className="emd-btn-tool emd-btn-tool--batch-main">批量美图</span>
                    <span className="emd-btn-tool emd-btn-tool--collage" onClick={() => setCollageOpen(true)}>主图拼图</span>
                    <span className="emd-btn-tool emd-btn-tool--download">下载图片</span>
                    <div className="emd-upload emd-upload--main">
                      <img src={iconCloud} alt="" />
                      <span className="emd-upload__text emd-upload__text--small">点击/Ctrl+V粘贴</span>
                    </div>
                    <div className="emd-shots--main">
                      {MAIN_SHOTS.map((shot) => (
                        <div className="emd-shot emd-shot--main" key={shot.src}>
                          <img className="emd-shot__img" src={shot.src} alt="" />
                          <span className="emd-shot__badge">{shot.size}</span>
                        </div>
                      ))}
                    </div>
                  </section>
      
                  <section className="emd-card emd-card--promo">
                    <span className="emd-card__star emd-card__star--promo">*</span>
                    <h3 className="emd-card__name emd-card__name--promo">站外推广图</h3>
                    <span className="emd-card__counter emd-card__counter--promo">1/1</span>
                    <span className="emd-card__divider emd-card__divider--promo" />
                    <span className="emd-btn-tool emd-btn-tool--batch-promo">批量美图</span>
                    <div className="emd-shot emd-shot--promo">
                      <img className="emd-shot__img" src={promo1} alt="" />
                    </div>
                  </section>
                </div>
              </div>
      
              <footer className="emd-footer">
                <span className="emd-btn emd-btn--plain">关闭</span>
                <span className="emd-btn emd-btn--primary">保存</span>
                <span className="emd-btn emd-btn--publish">保存并发布</span>
              </footer>
            </div>
      
            <CollageDialog open={collageOpen} onClose={() => setCollageOpen(false)} mainCount={8} mainLimit={8} />
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
              : "edit-product-dialog-media";
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
