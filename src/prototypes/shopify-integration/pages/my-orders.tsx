import React, { useState } from 'react';

import OrderDetailDialog, { type OrderDetailData } from '../components/OrderDetailDialog';
import dhBadge from '../assets/dh-badge.png';
import iconDhgate from '../assets/icon-dhgate.png';
import iconShopify from '../assets/icon-shopify.png';
import thumb1 from '../assets/order-thumb-1.jpg';
import thumb2 from '../assets/order-thumb-2.jpg';
import thumb3 from '../assets/order-thumb-3.jpg';
import thumb4 from '../assets/order-thumb-4.jpg';
import icChevronDown from '../assets/icons/chevron-down.svg';

const STATUS_TABS = [
  { label: '全部订单', count: '11759', active: true },
  { label: '新订单', count: '124', annotationId: 'mo-tab-new-order' },
  { label: '采购配货', count: '20' },
  { label: '仓库处理', count: '4' },
  { label: '物流运输', count: '314', annotationId: 'mo-tab-logistics-transit' },
  { label: '已妥投', count: '8874', annotationId: 'mo-tab-delivered' },
  { label: '已作废', count: '5' },
];

interface OrderRow {
  no: number;
  statuses: { label: string; tone: 'paid' | 'shipping' | 'shipped' | 'signed' | 'returned' | 'refunded' }[];
  orderNo: string;
  store: string;
  id: string;
  orderState: string;
  detailStatus?: string;
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
  logisticsDetail: {
    warehouse?: string;
    sellerChannel?: string;
    trackingNo?: string;
    extraNo?: string;
  };
  salesUsd: string;
  salesCny: string;
  incomeUsd: string;
  incomeCny: string;
}

const ORDER_STATUSES = [
  { label: '已支付', tone: 'paid' as const },
  { label: '已签收', tone: 'signed' as const },
  { label: '已退货', tone: 'returned' as const },
];

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
    statuses: [
      { label: '已支付', tone: 'paid' as const },
      { label: '已签收', tone: 'signed' as const },
    ],
    detailStatus: '已支付 | 已发货',
    orderNo: '323148090747',
    store: 'sneakerhub8',
    id: '71743',
    orderState: '新订单',
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
    logistics: 'Seller-Defined STD Logitstics',
    logisticsDetail: {},
    salesUsd: '34.54',
    salesCny: '231.64',
    incomeUsd: '31.64',
    incomeCny: '212.19',
  },
  {
    no: 2,
    statuses: [
      { label: '已支付', tone: 'paid' as const },
      { label: '已发货', tone: 'shipped' as const },
    ],
    orderNo: '323146371393',
    store: '鞋子',
    id: '71724',
    orderState: '采购配货',
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
    logistics: 'Seller-Defined STD Logitstics',
    logisticsDetail: { warehouse: '达智仓', sellerChannel: '美国小包专线-普货', trackingNo: '-' },
    salesUsd: '58.67',
    salesCny: '393.47',
    incomeUsd: '40.06',
    incomeCny: '268.66',
  },
  {
    no: 3,
    statuses: [
      { label: '已退款', tone: 'refunded' as const },
      { label: '已签收', tone: 'signed' as const },
    ],
    orderNo: '323146100770',
    store: 'sneakerhub8',
    id: '71720',
    orderState: '仓库处理',
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
    logistics: 'Seller-Defined STD Logitstics',
    logisticsDetail: { warehouse: '达智仓', sellerChannel: '全球邮政小包', trackingNo: '-', extraNo: '3316937665110014655' },
    salesUsd: '31.72',
    salesCny: '212.73',
    incomeUsd: '29.03',
    incomeCny: '194.69',
  },
  {
    no: 4,
    statuses: ORDER_STATUSES,
    orderNo: '323145882016',
    store: 'sneakerhub8',
    id: '71719',
    orderState: '物流运输',
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
    logistics: 'Seller-Defined STD Logitstics',
    logisticsDetail: { warehouse: 'Dhgate线上物流2.0', sellerChannel: '全球标准专线（普）-XSTD', trackingNo: 'XSTD01964742CN', extraNo: 'VR-PO20261015000001' },
    salesUsd: '45.9',
    salesCny: '308.16',
    incomeUsd: '32.4',
    incomeCny: '217.66',
  },
];

const BATCH_BUTTONS_BY_TAB: Record<string, string[]> = {
  全部订单: ['一键出库', '处理申报信息', '修改买家邮编', '修改买家信息', '修改物流渠道', '提交到平台', '标记', '同步订单详情', '邀约采购', '删除'],
  新订单: ['线路审核', '处理申报信息', '修改买家邮编', '修改买家信息', '修改物流渠道', '标记', '合包', '解除合包', '同步订单详情', '邀约采购', '删除'],
  采购配货: ['申请运单号', '一键出库', '处理申报信息', '修改买家邮编', '修改买家信息', '修改物流渠道', '提交到平台', '标记', '合包', '解除合包', '同步订单详情', '邀约采购', '删除'],
  仓库处理: ['申请运单号', '一键出库', '处理申报信息', '修改买家邮编', '修改买家信息', '修改物流渠道', '提交到平台', '标记', '合包', '解除合包', '同步订单详情', '邀约采购', '删除'],
  物流运输: ['处理申报信息', '修改买家邮编', '修改买家信息', '修改物流渠道', '提交到平台', '标记', '合包', '解除合包', '同步订单详情', '邀约采购', '删除'],
  已妥投: ['请款', '处理申报信息', '修改买家邮编', '修改买家信息', '修改物流渠道', '标记', '同步订单详情', '邀约采购', '删除'],
  已作废: ['处理申报信息', '修改买家邮编', '修改买家信息', '修改物流渠道', '标记', '同步订单详情', '邀约采购', '删除'],
};

const LOGISTICS_CARRIERS = [
  '4PX', '99 Minutos', '日本郵便', '佐川急便',
  'Aeronet', 'AGS', 'Alliance Air Freight', 'Amazon',
  'Amazon Fulfillment', 'Amazon Logistics UK', 'Amm Spedition', 'An Post',
  'ANDREANI', 'Anjun Logistics', 'APC Postal Logistics', 'APG eCommerce Solutions Ltd.',
  'Apple Express', 'Aruba Post', 'Asendia USA', 'ASL Canada',
  'Australia Post', 'Australia Post MyPost Business', 'AxleHire', 'Better Trucks',
  'Bonshaw', 'Border Express', 'Bpost', 'Bpost international',
  'Canada Post', 'Canpar Courier', 'Cargo Expreso GT', 'Cargo Expreso SV',
  'Caribou', 'CDEK', 'CDL', 'CEVA logistics',
  'Chilexpress', 'China EMS', 'China Post', 'Chit Chats',
  'Chronopost', 'Chukou1', 'CNE Express', 'Colissimo',
  'Comingle', 'Coordinadora', 'Correios', 'Correos',
  'Correos Express', 'CTT', 'CTT Express', 'Cyprus Post',
  'Deliver It', 'Delnext', 'Deprisa', 'DHL eCommerce',
  'DHL eCommerce Asia', 'DHL Express', 'DHL Global Mail Asia', 'DHL Sweden',
  'Dimerco Express Group', 'DoorDash', 'DPD', 'DPD Belgium',
  'DPD Germany', 'DPD Hungary', 'DPD Local', 'DPD UK',
  'DTD Express', 'DX', 'Dynamex', 'Eagle',
  'Emons', 'Estafeta', 'Estes', 'Evri',
  'FedEx', 'FedEx Freight', 'First Global Logistics', 'First Line',
  'Fleet Optics', 'FSC', 'Fulfilla', 'Gaash',
  'GLS Croatia', 'GLS Hungary', 'GLS Slovakia', 'GLS Slovenia',
  'GLS Spain', 'GLS US', 'GoBolt', 'GP Logistic Service',
  'Grupo ampm', 'Guangdong Weisuyi Information Technology (WSE)', 'Hanjin', 'Heppner Internationale Spedition GmbH & Co.',
  'HR Parcel', 'Iceland Post', 'IDEX', 'Intelcom',
  'Interparcel', 'Israel Post', 'Japan Post', 'Kerry Express Thailand',
  'La Poste Burkina Faso', 'La Poste Colissimo', 'Landmark Global', 'Landmark Global Reference',
  'LaserShip', 'Latin Logistics - Avianca', 'Latvia Post', 'Libya Post',
  'Lietuvos Paštas', 'Logisters', 'Lone Star Overnight', 'M3 Logistics',
  'Maldives Post', 'Mauritius Post', 'Mayple', 'Meteor Space',
  'Mondial Relay', 'moovin', 'MyTeamGE', 'Naqel Express',
  'NCS', 'New Zealand Post', 'Ninja Van', 'NonstopDelivery',
  'North Russia Supply Chain (Shenzhen) Co.', 'NOX Germany', 'Old Dominion Freight Line', 'OnTrac',
  'OPT-NC', 'Packeta', 'Pago Logistics', 'Pandion',
  'Pasar', 'Passport', 'Pilot Freight Services', 'Ping An Da Tengfei Express',
  'Pitney Bowes', 'Portal PostNord', 'Poste Italiane', 'PostNL',
  'PostNL International', 'PostNord Denmark', 'PostNord Norway', 'PostNord Sweden',
  'Purolator', 'Qxpress', 'Qyun Express', 'R+L Carriers',
  'Royal Mail', 'Royal Shipments', 'S.F International', 'Sagawa',
  'SEKO Logistics', 'Sendle', 'Servientrega Ecuador', 'SF Express',
  'SFC Fulfillment', 'ShipBob', 'SHREE NANDAN COURIER', 'Singapore Post',
  'SmartCat', 'Southwest Air Cargo', 'Spee-Dee Delivery Service', 'SpeedX',
  'Sprinter', 'StarTrack', 'Step Forward Freight', 'Straightship',
  'Surpost', 'SwiftX', 'Swiship DE', 'Swiss Post',
  'Tele Post', 'TForce Final Mile', 'Tinghao', 'TNT',
  'TNT Reference', 'TNT UK', 'TNT UK Reference', 'Toll IPEC',
  'Trexity', 'Tuffnells Parcels Express', 'Uni Uni', 'United Delivery Service',
  'UPS', 'UPS Canada', 'USPS', 'Veho',
  'Venipak', 'We Pick Up', 'We Post', 'Whistl',
  'Wizmo', 'WMYC', 'Xpedigo', 'XPO Logistics',
  'XYY Logistics', 'Yamato', 'YDH', 'YiFan Express',
  'YunExpress', 'YYZ Logistics', 'ヤマト運輸', '其他',
];

const ROW_ACTIONS_BY_STATE: Record<string, string[]> = {
  新订单: ['线路审核', '查看订单', '标记', '拆包', '作废', '删除'],
  采购配货: ['申请运单号', '代发采购', '查看订单', '标记', '拆包', '提交到平台', '补发', '作废', '一键出库', '删除'],
  仓库处理: ['申请运单号', '代发采购', '查看订单', '标记', '拆包', '提交到平台', '退回', '作废', '一键出库', '删除'],
  物流运输: ['申请运单号', '代发采购', '查看订单', '标记', '拆包', '标记已妥投', '提交到平台', '退回', '补发', '作废', '删除'],
  已妥投: ['代发采购', '查看订单', '标记', '请款', '退回', '补发', '作废', '删除'],
  已作废: ['查看订单', '标记', '删除'],
};

function rowActionsFor(tab: string, row: OrderRow) {
  const actions = ROW_ACTIONS_BY_STATE[tab === '全部订单' ? row.orderState : tab] || [];
  const tracking = row.logisticsDetail.trackingNo;
  return tracking && tracking !== '-' ? actions.filter((label) => label !== '申请运单号') : actions;
}

function specValue(specs: string, key: string) {
  const matched = specs.match(new RegExp(key + ':([\\s\\S]*?)(?=\\s{2,}|$)'));
  return matched ? matched[1].trim() : '';
}

function toOrderDetail(row: OrderRow): OrderDetailData {
  const size = specValue(row.specs, '尺码');
  const color = specValue(row.specs, '颜色');
  return {
    orderNo: row.orderNo,
    amount: row.incomeUsd,
    store: row.store,
    orderState: row.orderState,
    status: row.detailStatus ?? row.statuses[0].label,
    sortType: '单品单数',
    buyerLogistics: row.logistics,
    sellerLogistics: '-',
    buyer: row.buyer,
    times: row.times,
    product: {
      image: row.image,
      title: row.title,
      onlineNo: row.onlineNo,
      skuCode: row.skuCode,
      options: [size, color].filter(Boolean).join(','),
      price: row.price,
      qty: row.qty,
      logistics: row.logistics,
    },
  };
}

function LogisticsCell({ row }: { row: OrderRow }) {
  const detail = row.logisticsDetail;
  const hasTracking = !!detail.trackingNo && detail.trackingNo !== '-';
  const [trackOpen, setTrackOpen] = useState(false);
  return (
    <div className="so-logi">
      <div>{row.logistics}</div>
      {(detail.warehouse || detail.sellerChannel) && (
        <div>
          {detail.warehouse && <div>{detail.warehouse}</div>}
          {detail.sellerChannel && <div className="so-logi-channel">{detail.sellerChannel}</div>}
        </div>
      )}
      {detail.trackingNo && (
        <div className="so-logi-no">
          <span
            className="so-logi-no-link"
            {...(hasTracking ? { 'data-annotation-id': 'mo-track-17track' } : {})}
            onClick={() => hasTracking && setTrackOpen(true)}
          >
            {detail.trackingNo}
          </span>
          {hasTracking && (
            <svg className="so-logi-copy" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="5.4" y="5.4" width="8.2" height="8.2" rx="1.4" />
              <path d="M10.6 5.4V3.3a1.1 1.1 0 0 0-1.1-1.1H3.3a1.1 1.1 0 0 0-1.1 1.1v6.2a1.1 1.1 0 0 0 1.1 1.1h2.1" />
            </svg>
          )}
        </div>
      )}
      {detail.extraNo && <div>{detail.extraNo}</div>}
      {trackOpen && (
        <div className="so-track-overlay" role="dialog" aria-modal="true" aria-label="物流跟踪">
          <div className="so-track-bar">
            <span className="so-track-no">{detail.trackingNo}</span>
            <a className="so-track-open" href={'https://t.17track.net/zh-cn#nums=' + detail.trackingNo} target="_blank" rel="noreferrer">
              新窗口打开
            </a>
            <button className="so-track-close" type="button" onClick={() => setTrackOpen(false)}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M3.6 3.6 12.4 12.4M12.4 3.6 3.6 12.4" />
              </svg>
            </button>
          </div>
          <iframe
            className="so-track-frame"
            title={'17track ' + detail.trackingNo}
            src={'https://t.17track.net/zh-cn#nums=' + detail.trackingNo}
          />
        </div>
      )}
    </div>
  );
}

interface SplitActionItem {
  label: string;
  onClick: () => void;
}

function SplitAction({
  label,
  annotationId,
  items,
}: {
  label: string;
  annotationId?: string;
  items: SplitActionItem[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <span className="so-action-group">
      <button
        className="so-action"
        type="button"
        {...(annotationId ? { 'data-annotation-id': annotationId } : {})}
      >
        <IconAction name={label} />
        {label}
      </button>
      <button
        className="so-action is-caret"
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <svg className="so-caret-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3.6 6 4.4 4.4L12.4 6" />
        </svg>
      </button>
      {open && (
        <>
          <span className="so-menu-mask" onClick={() => setOpen(false)} />
          <div className="so-menu so-action-menu">
            {items.map((item) => (
              <div
                key={item.label}
                className="so-menu__item"
                onClick={() => {
                  setOpen(false);
                  item.onClick();
                }}
              >
                {item.label}
              </div>
            ))}
          </div>
        </>
      )}
    </span>
  );
}

function CarrierSelect({ value, onChange }: { value: string; onChange: (carrier: string) => void }) {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const q = keyword.trim().toLowerCase();
  const carriers = q ? LOGISTICS_CARRIERS.filter((name) => name.toLowerCase().includes(q)) : LOGISTICS_CARRIERS;

  return (
    <div
      className={'ds-select' + (open ? ' is-open' : '')}
      onClick={() => {
        if (!open) setKeyword('');
        setOpen(!open);
      }}
    >
      <span className={value ? undefined : 'so-ph'}>{value || '请选择承运商'}</span>
      <img src={icChevronDown} alt="" />
      {open && (
        <>
          <span
            className="so-menu-mask"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
          />
          <div className="ds-panel" onClick={(e) => e.stopPropagation()}>
            <input
              className="ds-search"
              autoFocus
              placeholder="搜索承运商"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <div className="ds-list">
              {carriers.length === 0 ? (
                <div className="ds-empty">无匹配结果</div>
              ) : (
                carriers.map((name) => (
                  <div
                    key={name}
                    className={'ds-item' + (name === value ? ' is-active' : '')}
                    onClick={() => {
                      onChange(name);
                      setOpen(false);
                    }}
                  >
                    {name}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function DirectShipDialog({ onClose }: { onClose: () => void }) {
  const [carrier, setCarrier] = useState('');
  return (
    <div className="so-modal-mask" onClick={onClose}>
      <div
        className="at-dialog ds-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="指定承运商"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="at-dialog__header" data-annotation-id="mo-carrier-confirm-purchase">
          <span className="at-dialog__title">指定承运商</span>
          <button className="at-dialog__close" type="button" aria-label="关闭" onClick={onClose}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M3.6 3.6 12.4 12.4M12.4 3.6 3.6 12.4" />
            </svg>
          </button>
        </div>
        <div className="at-dialog__body ds-dialog__body">
          <div className="ds-row">
            <span className="ds-label">承运商</span>
            <CarrierSelect value={carrier} onChange={setCarrier} />
          </div>
        </div>
        <div className="at-dialog__footer">
          <button className="at-btn" type="button" onClick={onClose}>
            取消
          </button>
          <button className="at-btn is-primary" type="button" onClick={onClose}>
            确定
          </button>
        </div>
      </div>
    </div>
  );
}

function AssignTrackingDialog({ onClose }: { onClose: () => void }) {
  const [value, setValue] = useState('');
  return (
    <div className="so-modal-mask" onClick={onClose}>
      <div
        className="at-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="请输入运单号"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="at-dialog__header">
          <span className="at-dialog__title">请输入运单号</span>
          <button className="at-dialog__close" type="button" aria-label="关闭" onClick={onClose}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M3.6 3.6 12.4 12.4M12.4 3.6 3.6 12.4" />
            </svg>
          </button>
        </div>
        <div className="at-dialog__body">
          <textarea
            className="at-dialog__input"
            rows={6}
            placeholder="请输入内容"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        <div className="at-dialog__footer">
          <button className="at-btn" type="button" onClick={onClose}>
            取消
          </button>
          <button className="at-btn is-primary" type="button" onClick={onClose}>
            确定
          </button>
        </div>
      </div>
    </div>
  );
}

function IconAction({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    线路审核: <path d="M8 2.4v7.2M5 7l3 3 3-3M2.8 12.6h10.4" strokeLinecap="round" strokeLinejoin="round" />,
    查看订单: (
      <>
        <path d="M1.6 8S4 4 8 4s6.4 4 6.4 4-2.4 4-6.4 4S1.6 8 1.6 8Z" />
        <circle cx="8" cy="8" r="1.9" />
      </>
    ),
    标记: <path d="M3 2.2h7.4L13 5.2l-2.6 3H3V2.2ZM3 8.2v5.6" strokeLinejoin="round" />,
    作废: (
      <>
        <circle cx="8" cy="8" r="5.6" />
        <path d="M4 12 12 4" />
      </>
    ),
    删除: (
      <>
        <path d="M2.8 4.4h10.4M6.4 4.4V2.6h3.2v1.8" />
        <path d="M4.2 4.4 5 13.4h6l.8-9M6.8 6.6v4.4M9.2 6.6v4.4" strokeLinecap="round" />
      </>
    ),
    申请运单号: (
      <>
        <path d="M3.4 2.6h9.2v10.8H3.4z" />
        <path d="M5.4 5.4h5.2M5.4 8h5.2M5.4 10.6h3" strokeLinecap="round" />
      </>
    ),
    代发采购: (
      <>
        <path d="M2.6 5.4 8 3l5.4 2.4v5.2L8 13 2.6 10.6V5.4Z" strokeLinejoin="round" />
        <path d="M2.6 5.4 8 7.8l5.4-2.4M8 7.8V13" />
      </>
    ),
    拆包: (
      <>
        <path d="M2.8 4.4h10.4v7.8H2.8z" />
        <path d="M8 4.4v7.8M5.4 4.4v2M10.6 10.2v2" />
      </>
    ),
    标记已妥投: (
      <>
        <circle cx="8" cy="8" r="5.6" />
        <path d="m5.5 8.2 1.7 1.7 3.3-3.7" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    提交到平台: (
      <>
        <path d="M8 11.4V3M5.2 5.8 8 3l2.8 2.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2.8 10.4v3h10.4v-3" strokeLinecap="round" />
      </>
    ),
    退回: (
      <>
        <path d="M12.6 8a4.6 4.6 0 1 1-1.5-3.4" strokeLinecap="round" />
        <path d="M13.4 2.2v3h-3" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    补发: (
      <>
        <path d="M3.4 8a4.6 4.6 0 1 0 1.5-3.4" strokeLinecap="round" />
        <path d="M2.6 2.2v3h3" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    一键出库: (
      <>
        <path d="M8.6 2.8H3v10.4h5.6" strokeLinecap="round" />
        <path d="M11.4 8H6.2M9 5.6l2.4 2.4L9 10.4" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    请款: (
      <>
        <circle cx="8" cy="8" r="5.6" />
        <path d="m5.8 5.4 2.2 2.4 2.2-2.4M8 7.8v3M6.2 9.2h3.6" strokeLinecap="round" />
      </>
    ),
  };
  return (
    <svg className="so-action-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
      {paths[name]}
    </svg>
  );
}

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

const ORDER_PLATFORMS = [
  { id: 'dhgate', label: '敦煌网', icon: iconDhgate },
  { id: 'shopify', label: 'shopify', icon: iconShopify },
];

const ORDER_STORES: { platform: string; name: string }[] = [
  { platform: 'dhgate', name: 'sneakerhub8' },
  { platform: 'dhgate', name: '鞋子' },
  { platform: 'dhgate', name: 'bag' },
  { platform: 'shopify', name: 'camel-captain' },
  { platform: 'shopify', name: 'camel-outlet' },
];

interface DropdownOption {
  id: string;
  label: string;
  icon?: string;
}

function Dropdown({
  options,
  value,
  placeholder,
  className,
  annotationId,
  onChange,
}: {
  options: DropdownOption[];
  value: string;
  placeholder: string;
  className: string;
  annotationId?: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = options.find((option) => option.id === value);

  return (
    <div
      className={'so-select ' + className}
      {...(annotationId ? { 'data-annotation-id': annotationId } : {})}
      onClick={() => setOpen((prev) => !prev)}
    >
      <span className={current ? undefined : 'so-ph'}>{current ? current.label : placeholder}</span>
      <img src={icChevronDown} alt="" />
      {open && (
        <>
          <span
            className="so-menu-mask"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
          />
          <div className="so-menu">
            {options.map((option) => (
              <div
                key={option.id}
                className={'so-menu__item' + (option.id === value ? ' is-active' : '')}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(option.id);
                  setOpen(false);
                }}
              >
                {option.icon && <img className="so-menu__icon" src={option.icon} alt="" />}
                {option.label}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function MyOrdersPage() {
  const [platform, setPlatform] = useState('');
  const [store, setStore] = useState('');
  const [detail, setDetail] = useState<OrderDetailData | null>(null);
  const [activeOrderNo, setActiveOrderNo] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('全部订单');
  const [assignOrderNo, setAssignOrderNo] = useState<string | null>(null);
  const [directShipOrderNo, setDirectShipOrderNo] = useState<string | null>(null);

  const platformOptions: DropdownOption[] = [
    { id: '', label: '全部平台' },
    ...ORDER_PLATFORMS.map((item) => ({ id: item.id, label: item.label, icon: item.icon })),
  ];
  const storeOptions: DropdownOption[] = ORDER_STORES.filter((item) => platform === '' || item.platform === platform).map(
    (item) => ({ id: item.name, label: item.name }),
  );

  return (
    <div className="so-root">
      <div className="so-tabs">
        {STATUS_TABS.map((tab) => (
          <span
            key={tab.label}
            className={'so-tab' + (tab.label === activeTab ? ' is-active' : '')}
            {...(tab.annotationId ? { 'data-annotation-id': tab.annotationId } : {})}
            onClick={() => {
              setActiveTab(tab.label);
              setActiveOrderNo(null);
            }}
          >
            {tab.label} ({tab.count})
          </span>
        ))}
      </div>

      <div className="so-filter">
        <span className="so-label">平台名称</span>
        <Dropdown
          className="so-select-platform"
          options={platformOptions}
          value={platform}
          placeholder="全部平台"
          onChange={(id) => {
            setPlatform(id);
            setStore('');
          }}
        />
        <span className="so-label">店铺名称</span>
        <Dropdown
          className="so-select-store"
          annotationId="mo-filter-store"
          options={storeOptions}
          value={store}
          placeholder="搜索/选择店铺"
          onChange={setStore}
        />
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
            <col style={{ width: '220px' }} />
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
              <th className="so-th-left">时间节点</th>
              <th className="so-th-left">发货过程预警</th>
              <th className="so-th-left">物流信息</th>
              <th className="so-th-left">数据</th>
            </tr>
          </thead>
          {ROWS.map((row, rowIdx) => (
            <tbody key={row.orderNo} className="so-order-group">
              <tr
                className="so-order-row"
                onClick={() => setActiveOrderNo((prev) => (prev === row.orderNo ? null : row.orderNo))}
              >
                <td className="so-cell-index">
                  <input type="checkbox" className="so-check" readOnly />
                  <span className="so-row-no">{row.no}</span>
                </td>
                <td className="so-cell-order">
                  <div {...(row.no === 1 ? { 'data-annotation-id': 'mo-status-parallel' } : {})}>
                    <span className="so-status">
                      {row.statuses.map((s, i) => (
                        <React.Fragment key={s.label}>
                          {i > 0 && <span className="so-status__pipe">|</span>}
                          <span className={'so-status__item so-status__item--' + s.tone}>
                            {s.label}
                          </span>
                        </React.Fragment>
                      ))}
                    </span>
                  </div>
                  <a
                    className="so-order-no"
                    href="#"
                    {...(row.no === 1 ? { 'data-annotation-id': 'mo-order-no-source' } : {})}
                  >
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
                    <span
                      className="so-warn-blue"
                      {...(rowIdx === 0 ? { 'data-annotation-id': 'mo-warn-ship-deadline' } : {})}
                    >
                      发货预警：{row.warnShip}
                    </span>
                  </div>
                  <div>上网状态：-</div>
                  <div>轨迹断更：</div>
                </td>
                <td className="so-cell-logistics">
                  <LogisticsCell row={row} />
                </td>
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
              <tr className={'so-actions-row' + (activeOrderNo === row.orderNo ? ' is-open' : '')}>
                <td colSpan={8}>
                  <div className="so-actions">
                    {rowActionsFor(activeTab, row).map((label) =>
                      label === '申请运单号' ? (
                        <SplitAction
                          key={label}
                          label={label}
                          items={[{ label: '指定运单号', onClick: () => setAssignOrderNo(row.orderNo) }]}
                        />
                      ) : label === '线路审核' ? (
                        <SplitAction
                          key={label}
                          label={label}
                          annotationId={rowIdx === 0 ? 'mo-action-line-audit' : undefined}
                          items={[{ label: '指定承运商', onClick: () => setDirectShipOrderNo(row.orderNo) }]}
                        />
                      ) : (
                        <button key={label} className="so-action" type="button" onClick={() => label === '查看订单' && setDetail(toOrderDetail(row))}>
                          <IconAction name={label} />
                          {label}
                        </button>
                      ),
                    )}
                  </div>
                </td>
              </tr>
            </tbody>
          ))}
        </table>
      </div>

      <div className="so-bottombar">
        <div className="so-batch">
          {(BATCH_BUTTONS_BY_TAB[activeTab] || []).map((label) => (
            <button
              key={label}
              className="so-btn-soft"
              type="button"
              {...(label === '提交到平台' ? { 'data-annotation-id': 'mo-direct-ship-submit' } : {})}
            >
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

      {detail && <OrderDetailDialog data={detail} onClose={() => setDetail(null)} />}
      {assignOrderNo && <AssignTrackingDialog onClose={() => setAssignOrderNo(null)} />}
      {directShipOrderNo && <DirectShipDialog onClose={() => setDirectShipOrderNo(null)} />}
    </div>
  );
}
