import React, { useState } from 'react';

import thumbBracelet from '../assets/thumb-bracelet.jpg';
import thumbNecklace from '../assets/claim-necklace.jpg';
import thumbSneaker from '../assets/thumb-sneaker.jpg';
import thumbOrder1 from '../assets/order-thumb-1.jpg';
import thumbOrder2 from '../assets/order-thumb-2.jpg';
import thumbOrder3 from '../assets/order-thumb-3.jpg';
import thumbOrder4 from '../assets/order-thumb-4.jpg';
import icCalendar from '../assets/icons/calendar.svg';
import icGear from '../assets/icons/gear.svg';
import icChevLeft from '../assets/icons/chevron-left.svg';
import icChevRight from '../assets/icons/chevron-right.svg';
import ClaimProductDialog from '../components/ClaimProductDialog';

interface ClaimRow {
  image: string;
  title: string;
  parentSku: string;
  category: string;
  price: string;
  claimed: boolean;
  source: string;
  account: string;
}

const ROWS: ClaimRow[] = [
  {
    image: thumbNecklace,
    title: '新款海蓝宝水滴项链女小众设计轻奢锁骨链高级感蓝色吊坠气质通勤',
    parentSku: '20261017000001',
    category: '项链',
    price: '¥ 0.95',
    claimed: true,
    source: '1688',
    account: 'ceshi',
  },
  {
    image: thumbOrder1,
    title: '【很多星星】深蓝爱心满钻锆石手链复古清冷感超闪镶钻法式宫廷风',
    parentSku: '20261016000001',
    category: '手链',
    price: '¥ 6.4',
    claimed: true,
    source: '1688',
    account: 'ceshi',
  },
  {
    image: thumbOrder2,
    title: '2026新款狐狸毛领西装领皮草外套女冬季白鸭绒机车派克服羽绒服',
    parentSku: '20261015000007',
    category: '皮草',
    price: '¥ 269',
    claimed: false,
    source: '1688',
    account: 'test2@ceshi',
  },
  {
    image: thumbOrder3,
    title: '跨境秋冬季高颜值包包女2026早春新款韩版时尚复古单肩手提包包包',
    parentSku: '20261015000006',
    category: '女士单肩包',
    price: '¥ 13',
    claimed: false,
    source: '1688',
    account: 'zoubobo@ceshi',
  },
  {
    image: thumbBracelet,
    title: '法式名媛气质珍珠包新中式宴会手工编织串珠简约纯白手提腋下包',
    parentSku: '20261015000005',
    category: '女士手提包',
    price: '¥ 95',
    claimed: false,
    source: '1688',
    account: 'test2@ceshi',
  },
  {
    image: thumbOrder4,
    title: '跨境5000万CMOS传感器入门级光学变焦数码相机学生自拍照相机批发',
    parentSku: '20261015000004',
    category: '普通数码相机',
    price: '¥ 470',
    claimed: true,
    source: '1688',
    account: 'ceshi',
  },
  {
    image: thumbOrder1,
    title: '榻榻米沙发懒人沙发带脚踏卧室客厅阳台休闲沙发单人沙发小沙发椅',
    parentSku: '20261015000003',
    category: '懒人沙发',
    price: '¥ 17.89',
    claimed: true,
    source: '1688',
    account: 'ceshi',
  },
  {
    image: thumbOrder2,
    title: '牛奶绒毛毯冬季加厚珊瑚绒办公室午睡毯沙发盖毯法兰绒毯子床上用',
    parentSku: '20261015000002',
    category: '其他毛毯、绒毯',
    price: '¥ 5.01',
    claimed: true,
    source: '1688',
    account: 'ceshi',
  },
  {
    image: thumbSneaker,
    title: '2026春秋季新款复古百搭包头半拖鞋女款时尚软底舒适勃肯拖鞋女鞋',
    parentSku: '20261015000001',
    category: '厚底拖鞋',
    price: '¥ 14',
    claimed: false,
    source: '1688',
    account: 'ceshi',
  },
  {
    image: thumbOrder3,
    title: 'Lenovo IdeaCentre 24“ FHD All-in-One, 16GB RAM, 256GB SSD, Intel 4-Core',
    parentSku: '20261010000001',
    category: 'All-in-Ones',
    price: '$ 1099.99',
    claimed: true,
    source: '亚马逊',
    account: 'ceshi',
  },
];

function TabBand() {
  return (
    <div className="cc-tabs">
      <span className="cc-tab">商品采集</span>
      <span className="cc-tab cc-tab-active">
        <svg className="cc-tab-shape" viewBox="0 0 191 50" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="ccTabStroke" x1="0" y1="0" x2="191" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f5c4a0" stopOpacity="0" />
              <stop offset="16%" stopColor="#f5c4a0" stopOpacity="1" />
              <stop offset="84%" stopColor="#f5c4a0" stopOpacity="1" />
              <stop offset="100%" stopColor="#f5c4a0" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            fill="#fff"
            d="M0 50 C24 50 24 0 48 0 H143 C167 0 167 50 191 50 Z"
          />
          <path
            fill="none"
            stroke="url(#ccTabStroke)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            d="M0 50 C24 50 24 0 48 0 H143 C167 0 167 50 191 50"
          />
        </svg>
        <span className="cc-tab-dot" />
        <span className="cc-tab-label">认领中心</span>
      </span>
      <span className="cc-tab cc-tab-last">我的商品</span>
    </div>
  );
}

function SelectBox({ placeholder, value, width }: { placeholder?: string; value?: string; width: number }) {
  return (
    <div className="cc-input cc-select" style={{ width }}>
      {value ? <span className="cc-input-text">{value}</span> : <span className="cc-input-ph">{placeholder}</span>}
      <svg className="cc-chev" viewBox="0 0 12 7" aria-hidden="true"><path d="M1 6 L6 1 L11 6" fill="none" stroke="#c0c4cc" strokeWidth="1.4" strokeLinecap="round" /></svg>
    </div>
  );
}

function PriceInput({ width }: { width: number }) {
  return (
    <div className="cc-input cc-price" style={{ width }}>
      <span className="cc-stepper">
        <span className="cc-stepper-cell"><svg viewBox="0 0 11 7" aria-hidden="true"><path d="M1 5.5 L5.5 1.5 L10 5.5" fill="none" stroke="#84868a" strokeWidth="1" /></svg></span>
        <span className="cc-stepper-cell"><svg viewBox="0 0 11 7" aria-hidden="true"><path d="M1 1.5 L5.5 5.5 L10 1.5" fill="none" stroke="#84868a" strokeWidth="1" /></svg></span>
      </span>
    </div>
  );
}

function DateRangeInput({ width }: { width: number }) {
  return (
    <div className="cc-input cc-daterange" style={{ width }}>
      <img className="cc-cal" src={icCalendar} alt="" />
      <span className="cc-input-ph cc-daterange-half">开始日期</span>
      <span className="cc-daterange-to">至</span>
      <span className="cc-input-ph cc-daterange-half">结束日期</span>
    </div>
  );
}

function Filters() {
  return (
    <div className="cc-filters">
      <div className="cc-filter-row">
        <span className="cc-label">采集源</span>
        <SelectBox value="采集源" width={119} />
        <div className="cc-input" style={{ width: 210 }}>
          <span className="cc-input-ph">双击可批量搜索</span>
        </div>
        <span className="cc-label">认领状态</span>
        <SelectBox placeholder="请选择认领状态" width={214} />
        <span className="cc-label">价格</span>
        <PriceInput width={120} />
        <span className="cc-range-dash">-</span>
        <PriceInput width={120} />
        <span className="cc-label">采集平台</span>
        <SelectBox placeholder="请选择采集平台" width={214} />
        <span className="cc-label">采集日期</span>
        <DateRangeInput width={345} />
      </div>
      <div className="cc-filter-row">
        <span className="cc-label">标签</span>
        <SelectBox placeholder="请选择标签" width={214} />
        <button type="button" className="cc-btn cc-btn-search">搜索</button>
        <button type="button" className="cc-btn cc-btn-reset">重置</button>
        <button type="button" className="cc-btn cc-btn-create">创建新产品</button>
        <span className="cc-filter-spacer" />
        <button type="button" className="cc-btn cc-btn-export">导出</button>
        <button type="button" className="cc-btn cc-btn-import">导入产品</button>
        <img className="cc-gear" src={icGear} alt="列设置" />
      </div>
    </div>
  );
}

function ClaimTable({ onClaim }: { onClaim: () => void }) {
  return (
    <div className="cc-body">
      <div className="cc-thead">
        <span className="cc-th cc-check"><span className="cc-checkbox is-indeterminate" /></span>
        <span className="cc-th cc-th-center">图片</span>
        <span className="cc-th cc-th-left">标题</span>
        <span className="cc-th cc-th-center">售价</span>
        <span className="cc-th cc-th-center">状态</span>
        <span className="cc-th cc-th-center">标签</span>
        <span className="cc-th cc-th-center">来源</span>
        <span className="cc-th cc-th-center">采集账号</span>
      </div>
      {ROWS.map((row, index) => {
        const checked = index === 0;
        return (
          <React.Fragment key={row.parentSku}>
            <div className="cc-tr">
              <span className="cc-td cc-check"><span className={checked ? 'cc-checkbox is-checked' : 'cc-checkbox'} /></span>
              <span className="cc-td cc-td-center"><img className="cc-thumb" src={row.image} alt="" /></span>
              <span className="cc-td cc-info">
                <span className="cc-title">{row.title}</span>
                <span className="cc-sku">{`父SKU：${row.parentSku}  ${row.category}`}</span>
              </span>
              <span className="cc-td cc-td-center"><span className="cc-money">{row.price}</span></span>
              <span className="cc-td cc-td-center">
                <span className={row.claimed ? 'cc-status is-claimed' : 'cc-status'}>{row.claimed ? '已认领' : '未认领'}</span>
              </span>
              <span className="cc-td cc-td-center" />
              <span className="cc-td cc-td-center"><span className="cc-source">{row.source}</span></span>
              <span className="cc-td cc-td-center"><span className="cc-account">{row.account}</span></span>
            </div>
            {checked && (
              <div className="cc-row-actions">
                <button type="button" className="cc-mini-btn">编辑</button>
                <button type="button" className="cc-mini-btn" onClick={onClaim}>认领</button>
                <button type="button" className="cc-mini-btn">标签</button>
                <button type="button" className="cc-mini-btn">删除</button>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function Footer({ onClaim }: { onClaim: () => void }) {
  return (
    <div className="cc-footer">
      <span className="cc-selected">已选 1 项</span>
      <button type="button" className="cc-btn cc-batch-btn">编辑货源</button>
      <button type="button" className="cc-btn cc-batch-btn" onClick={onClaim}>批量认领</button>
      <button type="button" className="cc-btn cc-batch-btn">批量标签</button>
      <button type="button" className="cc-btn cc-batch-btn">批量删除</button>
      <div className="cc-pagination">
        <span className="cc-total">共 1679 条</span>
        <div className="cc-input cc-page-size">
          <span className="cc-input-text">10条/页</span>
          <svg className="cc-chev" viewBox="0 0 12 7" aria-hidden="true"><path d="M1 6 L6 1 L11 6" fill="none" stroke="#c0c4cc" strokeWidth="1.4" strokeLinecap="round" /></svg>
        </div>
        <span className="cc-page-btn is-disabled"><img src={icChevLeft} alt="上一页" /></span>
        <span className="cc-page-btn is-active">1</span>
        {[2, 3, 4, 5, 6].map((n) => (
          <span key={n} className="cc-page-btn">{n}</span>
        ))}
        <span className="cc-page-btn cc-page-ellipsis">…</span>
        <span className="cc-page-btn">168</span>
        <span className="cc-page-btn is-disabled"><img src={icChevRight} alt="下一页" /></span>
        <span className="cc-jump-group">
          <span className="cc-jump">前往</span>
          <div className="cc-input cc-jump-input"><span className="cc-input-text">1</span></div>
          <span className="cc-jump-unit">页</span>
        </span>
      </div>
    </div>
  );
}

export default function ClaimCenterPage() {
  const [claimOpen, setClaimOpen] = useState(false);
  const openClaim = () => setClaimOpen(true);

  return (
    <>
      <TabBand />
      <Filters />
      <ClaimTable onClaim={openClaim} />
      <Footer onClaim={openClaim} />
      {claimOpen && <ClaimProductDialog onClose={() => setClaimOpen(false)} />}
    </>
  );
}
