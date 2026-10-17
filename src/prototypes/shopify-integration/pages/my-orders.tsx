import React, { useState } from 'react';

import dhBadge from '../assets/dh-badge.png';
import thumb1 from '../assets/order-thumb-1.jpg';
import thumb2 from '../assets/order-thumb-2.jpg';
import thumb3 from '../assets/order-thumb-3.jpg';
import thumb4 from '../assets/order-thumb-4.jpg';
import icChevronDown from '../assets/icons/chevron-down.svg';

const STATUS_TABS = [
  { label: '全部订单', count: '11759', active: true },
  { label: '新订单', count: '124' },
  { label: '采购配货', count: '20' },
  { label: '仓库处理', count: '4' },
  { label: '物流运输', count: '314' },
  { label: '已妥投', count: '8874' },
  { label: '已作废', count: '5' },
];

interface OrderRow {
  no: number;
  status: string;
  orderNo: string;
  store: string;
  id: string;
  image: string;
  title: string;
  specs: string;
  price: string;
  qty: string;
  skuCode: string;
  onlineNo: string;
  localMatch: string;
  purchaseState: string;
  buyer: { name: string; country: string; state: string; zip: string };
  times: { label: string; value: string; strong?: boolean }[];
  warnPurchase: string;
  warnShip: string;
  logistics: string;
  salesUsd: string;
  salesCny: string;
  incomeUsd: string;
  incomeCny: string;
}

const EMPTY_TIMES = [
  { label: '创建', value: '-' },
  { label: '付款', value: '-' },
  { label: '审核', value: '-' },
  { label: '采购', value: '-' },
  { label: '单号', value: '-' },
  { label: '发货', value: '-' },
  { label: '出库', value: '-' },
  { label: '上网', value: '-' },
];

const ROWS: OrderRow[] = [
  {
    no: 1,
    status: '等待发货',
    orderNo: '323148090747',
    store: 'sneakerhub8',
    id: '71743',
    image: thumb1,
    title: 'Mens Beige Monogram Print Shock Absorbing Loafers With Gold Metal Buckle Slip On Shoes',
    specs: '尺码:Men-US 8 - EU 41- Foot Length 10.0"   颜色:1Black',
    price: '30.33',
    qty: '1',
    skuCode: '5e7fea11',
    onlineNo: '1116807914',
    localMatch: '1116807914 - - 5e7fea11 * 1',
    purchaseState: '未采购',
    buyer: { name: 'Samuel ndungu', country: '美国(US)', state: 'Massachusetts', zip: '01844' },
    times: [...EMPTY_TIMES, { label: '截止', value: '2026-10-27 10:06:09', strong: true }],
    warnPurchase: '超0小时未下单',
    warnShip: '发货剩余10天23时',
    logistics: 'Seller-Defined STD Logitstcs',
    salesUsd: '34.54',
    salesCny: '231.64',
    incomeUsd: '31.64',
    incomeCny: '212.19',
  },
  {
    no: 2,
    status: '等待发货',
    orderNo: '323146371393',
    store: '鞋子',
    id: '71724',
    image: thumb2,
    title: "2026 Top Designer Fashion Wing Bag Genuine Leather Women&#39;s Shoulder Bag Niche French Large Capacity Tote Luxury Ladies Handbag",
    specs: '颜色:Black large',
    price: '40',
    qty: '1',
    skuCode: 'h649nbkwe8',
    onlineNo: '1088409348',
    localMatch: '1088409348 -- h649nbkwe8 ^ 1',
    purchaseState: '未采购',
    buyer: { name: 'Kevser', country: '荷兰(NL)', state: 'Noord-Brabant', zip: '5622EN' },
    times: [
      { label: '创建', value: '2026-10-16 08:34:57', strong: true },
      { label: '付款', value: '2026-10-16 08:36:58', strong: true },
      { label: '审核', value: '-' },
      { label: '采购', value: '-' },
      { label: '单号', value: '-' },
      { label: '发货', value: '-' },
      { label: '出库', value: '-' },
      { label: '上网', value: '-' },
      { label: '截止', value: '2026-10-30 08:36:58', strong: true },
    ],
    warnPurchase: '超2小时未下单',
    warnShip: '发货剩余13天21时',
    logistics: 'Seller-Defined STD Logitstcs',
    salesUsd: '58.67',
    salesCny: '393.47',
    incomeUsd: '40.06',
    incomeCny: '268.66',
  },
  {
    no: 3,
    status: '等待发货',
    orderNo: '323146100770',
    store: 'sneakerhub8',
    id: '71720',
    image: thumb3,
    title: 'Light Khaki Hollow Closed Toe Clogs Men Soft EVA Non Slip Breathable Quick Dry Shower Beach Outdoor Casual Slippers',
    specs: '颜色:Kalani  尺码:Men-US 10 - EU 43- Foot Length 10.4"',
    price: '27.51',
    qty: '1',
    skuCode: '669b6f137',
    onlineNo: '1117341330',
    localMatch: '1117341330 -- 669b6f137 ^ 1',
    purchaseState: '未采购',
    buyer: { name: 'Walter Ramos', country: '美国(US)', state: 'Massachusetts', zip: '02740' },
    times: [
      { label: '创建', value: '2026-10-16 08:27:55', strong: true },
      { label: '付款', value: '2026-10-16 08:28:03', strong: true },
      { label: '审核', value: '-' },
      { label: '采购', value: '-' },
      { label: '单号', value: '-' },
      { label: '发货', value: '-' },
      { label: '出库', value: '-' },
      { label: '上网', value: '-' },
      { label: '截止', value: '2026-10-28 08:28:03', strong: true },
    ],
    warnPurchase: '超2小时未下单',
    warnShip: '发货剩余11天21时',
    logistics: 'Seller-Defined STD Logitstcs',
    salesUsd: '31.72',
    salesCny: '212.73',
    incomeUsd: '29.03',
    incomeCny: '194.69',
  },
  {
    no: 4,
    status: '等待发货',
    orderNo: '323145882016',
    store: 'sneakerhub8',
    id: '71719',
    image: thumb4,
    title: '2026 New Luxury Leather Handbags Women Classic Top Handle Bags Ladies Shoulder Bag Elegant Evening Purses',
    specs: '颜色:Apricot',
    price: '35.2',
    qty: '1',
    skuCode: 'k310nbwe9',
    onlineNo: '1099284712',
    localMatch: '1099284712 -- k310nbwe9 ^ 1',
    purchaseState: '未采购',
    buyer: { name: 'Jason Miller', country: '美国(US)', state: 'California', zip: '91342' },
    times: [
      { label: '创建', value: '2026-10-16 02:30:22', strong: true },
      { label: '付款', value: '2026-10-16 02:31:40', strong: true },
      { label: '审核', value: '-' },
      { label: '采购', value: '-' },
      { label: '单号', value: '-' },
      { label: '发货', value: '-' },
      { label: '出库', value: '-' },
      { label: '上网', value: '-' },
      { label: '截止', value: '2026-10-29 02:31:40', strong: true },
    ],
    warnPurchase: '超6小时未下单',
    warnShip: '发货剩余12天20时',
    logistics: 'Seller-Defined STD Logitstcs',
    salesUsd: '45.9',
    salesCny: '308.16',
    incomeUsd: '32.4',
    incomeCny: '217.66',
  },
];

const TIME_TIP_LINES = [
  { label: '创建', desc: '订单在ERP中创建订单的时间' },
  { label: '付款', desc: '平台买家支付订单的时间' },
  { label: '审核', desc: '订单在ERP（本系统）审核订单的时间' },
  { label: '采购', desc: '订单下的所有采购单（代发采购）的最晚的时间', hot: true },
  { label: '单号', desc: '国际运单号的创建时间' },
  { label: '发货', desc: '订单在后台显示的发货时间' },
];

const BATCH_BUTTONS = ['一键出库', '处理申报信息', '修改买家邮箱', '修改买家信息', '修改物流渠道', '提交到平台', '标记', '同步订单详情', '邀约采购', '删除'];

function IconSearch() {
  return (
    <svg className="so-btn-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="7" cy="7" r="4.6" />
      <path d="M10.6 10.6 14 14" strokeLinecap="round" />
    </svg>
  );
}

function IconReset() {
  return (
    <svg className="so-btn-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M13.4 8a5.4 5.4 0 1 1-1.7-3.9" strokeLinecap="round" />
      <path d="M13.6 1.9v3h-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconEdit() {
  return (
    <svg className="so-edit-icon" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3">
      <rect x="1" y="1" width="12" height="12" rx="2" />
      <path d="m4.6 9.4 4.8-4.8 1.2 1.2-4.8 4.8H4.6v-1.2Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconSync() {
  return (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M15 9a6 6 0 1 1-1.9-4.4" strokeLinecap="round" />
      <path d="M15.2 2v3.1h-3.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCircle({ children }: { children: React.ReactNode }) {
  return (
    <span className="so-op-btn">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
        {children}
      </svg>
    </span>
  );
}

function IconChevron({ className = 'so-btn-icon' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2.6 4.4 6 7.8l3.4-3.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconGear() {
  return (
    <svg className="so-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.2v2.6M12 18.2v2.6M3.2 12h2.6M18.2 12h2.6M5.8 5.8l1.8 1.8M16.4 16.4l1.8 1.8M18.2 5.8l-1.8 1.8M7.6 16.4l-1.8-1.8" strokeLinecap="round" />
    </svg>
  );
}

function TimeTip({ open }: { open: boolean }) {
  if (!open) return null;
  return (
    <div className="so-tip">
      {TIME_TIP_LINES.map((line) => (
        <div key={line.label} className={'so-tip-line' + (line.hot ? ' is-hot' : '')}>
          {line.desc}
        </div>
      ))}
    </div>
  );
}

export default function MyOrdersPage() {
  const [tipOpen, setTipOpen] = useState(false);

  return (
    <div className="so-root">
      <div className="so-tabs">
        {STATUS_TABS.map((tab) => (
          <span key={tab.label} className={'so-tab' + (tab.active ? ' is-active' : '')}>
            {tab.label} ({tab.count})
          </span>
        ))}
      </div>

      <div className="so-filter">
        <span className="so-label">店铺名称</span>
        <div className="so-select so-select-store">
          <span className="so-ph">搜索/选择店铺</span>
          <img src={icChevronDown} alt="" />
        </div>
        <div className="so-select so-select-field">
          <span>平台订单号</span>
          <img src={icChevronDown} alt="" />
        </div>
        <div className="so-input">
          <span className="so-ph">双击可批量搜索</span>
        </div>
        <button className="so-btn so-btn-primary" type="button">
          <IconSearch />
          搜索
        </button>
        <button className="so-btn" type="button">
          <IconReset />
          重置
        </button>
        <div className="so-filter-right">
          <button className="so-btn so-btn-primary" type="button">高级筛选</button>
          <button className="so-btn so-btn-primary" type="button">排序</button>
          <button className="so-btn so-btn-primary" type="button">同步店铺订单</button>
          <button className="so-btn so-btn-primary" type="button">
            导入/导出
            <IconChevron className="so-btn-chev" />
          </button>
          <button className="so-btn" type="button">
            <IconGear />
            设置
          </button>
        </div>
      </div>

      <div className="so-table-wrap">
        <table className="so-table">
          <colgroup>
            <col style={{ width: '56px' }} />
            <col style={{ width: '196px' }} />
            <col style={{ width: 'auto' }} />
            <col style={{ width: '148px' }} />
            <col style={{ width: '168px' }} />
            <col style={{ width: '212px' }} />
            <col style={{ width: '162px' }} />
            <col style={{ width: '136px' }} />
          </colgroup>
          <thead>
            <tr>
              <th>
                <input type="checkbox" className="so-check" readOnly />
              </th>
              <th className="so-th-left">订单号/状态</th>
              <th className="so-th-left">产品信息</th>
              <th className="so-th-left">买家信息</th>
              <th
                className="so-th-left so-th-times"
                onMouseEnter={() => setTipOpen(true)}
                onMouseLeave={() => setTipOpen(false)}
              >
                时间节点
                <TimeTip open={tipOpen} />
              </th>
              <th className="so-th-left">发货过程预警</th>
              <th className="so-th-left">物流信息</th>
              <th className="so-th-left">数据</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.orderNo}>
                <td className="so-cell-index">
                  <input type="checkbox" className="so-check" readOnly />
                  <span className="so-row-no">{row.no}</span>
                </td>
                <td className="so-cell-order">
                  <span className="so-status">{row.status}</span>
                  <a className="so-order-no" href="#">
                    {row.orderNo}
                  </a>
                  <span className="so-store">
                    <img src={dhBadge} alt="" />
                    {row.store}
                  </span>
                  <span className="so-id">
                    ID:<a href="#">{row.id}</a>
                  </span>
                  <span className="so-ops">
                    <IconCircle>
                      <rect x="5" y="1.8" width="9" height="11" rx="1.5" />
                      <path d="M3 4v9.2A1.8 1.8 0 0 0 4.8 15h8.2" />
                    </IconCircle>
                    <IconCircle>
                      <circle cx="8" cy="5.2" r="2.6" />
                      <path d="M2.8 14c.6-2.8 2.6-4.2 5.2-4.2s4.6 1.4 5.2 4.2" />
                    </IconCircle>
                    <IconCircle>
                      <path d="M4.5 6V2h7v4" />
                      <rect x="2" y="6" width="12" height="5.5" rx="1.2" />
                      <path d="M4.5 9.5H12V14H4.5z" />
                    </IconCircle>
                    <IconCircle>
                      <path d="M3 5.5h10L12 14H4L3 5.5Z" />
                      <path d="M6 5.5a2 2 0 0 1 4 0" />
                    </IconCircle>
                  </span>
                  <span className="so-sync">
                    <IconSync />
                  </span>
                </td>
                <td className="so-cell-product">
                  <div className="so-thumb">
                    <img src={row.image} alt="" loading="eager" />
                    <a className="so-edit-link" href="#">
                      <IconEdit />
                      编辑货品
                    </a>
                  </div>
                  <div className="so-product-main">
                    <a className="so-title" href="#">
                      {row.title}
                    </a>
                    <div className="so-specs">
                      {row.specs.split(/(\s{2,})/).filter(Boolean).map((part, i) =>
                        part.trim() === '' ? (
                          <span key={i}>{' '}</span>
                        ) : (
                          <span key={i}>{part.split(':').map((seg, j) => (j === 0 ? <b key={j}>{seg}:</b> : <span key={j}>{seg}</span>))}</span>
                        ),
                      )}
                      <span className="so-price">
                        <b>USD:</b> {row.price} *<i>{row.qty}</i>
                      </span>
                      <span className="so-sku">
                        <b>SkuCode:</b> {row.skuCode}
                      </span>
                    </div>
                    <div className="so-sub">
                      线上产品编号: <a href="#">{row.onlineNo}</a>
                      <span className="so-gap" />
                      本地配对: {row.localMatch}
                    </div>
                    <div className="so-sub">
                      买家备注: -<span className="so-gap" />卖家备注: <IconEdit /> -<span className="so-gap" />拣货备注: <IconEdit /> -
                    </div>
                  </div>
                  <span className="so-purchase-state">{row.purchaseState}</span>
                </td>
                <td className="so-cell-buyer">
                  <div>
                    <b>姓名：</b>
                    {row.buyer.name}
                  </div>
                  <div>
                    <b>国家：</b>
                    {row.buyer.country}
                  </div>
                  <div>
                    <b>省/州：</b>
                    {row.buyer.state}
                  </div>
                  <div>
                    <b>邮编：</b>
                    {row.buyer.zip}
                  </div>
                </td>
                <td className="so-cell-times">
                  {row.times.map((t) => (
                    <div key={t.label} className={t.strong ? 'is-strong' : ''}>
                      {t.label}：{t.value}
                    </div>
                  ))}
                </td>
                <td className="so-cell-warn">
                  <div>
                    采购预警：<span className="so-warn-orange">{row.warnPurchase}</span>
                  </div>
                  <div>
                    <span className="so-warn-blue">发货预警：{row.warnShip}</span>
                  </div>
                  <div>上网状态：-</div>
                  <div>轨迹断更：</div>
                </td>
                <td className="so-cell-logistics">{row.logistics}</td>
                <td className="so-cell-data">
                  <div>销售额</div>
                  <div>USD {row.salesUsd}</div>
                  <div>CNY {row.salesCny}</div>
                  <div>收入</div>
                  <div>
                    USD <span className="so-income">{row.incomeUsd}</span>
                  </div>
                  <div>CNY {row.incomeCny}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="so-bottombar">
        <div className="so-batch">
          {BATCH_BUTTONS.map((label) => (
            <button key={label} className="so-btn-soft" type="button">
              {label}
            </button>
          ))}
        </div>
        <span className="so-selected">已选 0 项</span>
        <div className="so-pag">
          <span className="so-pag-total">共 11759 条</span>
          <span className="so-pag-size">
            10条/页
            <img src={icChevronDown} alt="" />
          </span>
          <span className="so-pag-btn is-disabled">&lt;</span>
          <span className="so-pag-num is-active">1</span>
          <span className="so-pag-num">2</span>
          <span className="so-pag-num">3</span>
          <span className="so-pag-num">4</span>
          <span className="so-pag-num">5</span>
          <span className="so-pag-num">6</span>
          <span className="so-pag-ellipsis">···</span>
          <span className="so-pag-num">1176</span>
          <span className="so-pag-btn">&gt;</span>
          <span className="so-pag-jump">
            前往<span className="so-pag-jump-input">1</span>页
          </span>
        </div>
      </div>

      <div className="so-float">
        <button className="so-float-btn" type="button" aria-label="向上滚动">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M8 13V3.4M3.6 7.6 8 3.2l4.4 4.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button className="so-float-btn" type="button" aria-label="向下滚动">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M8 3v9.6M3.6 8.4 8 12.8l4.4-4.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
