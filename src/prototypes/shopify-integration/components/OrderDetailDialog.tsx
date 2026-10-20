import React, { useState } from 'react';

import dhBadge from '../assets/dh-badge.png';

export interface OrderDetailData {
  orderNo: string;
  amount: string;
  store: string;
  orderState: string;
  status: string;
  sortType: string;
  buyerLogistics: string;
  sellerLogistics: string;
  buyer: { name: string; country: string; state: string; zip: string };
  times: { label: string; value: string }[];
  product: {
    image: string;
    title: string;
    onlineNo: string;
    skuCode: string;
    options: string;
    price: string;
    qty: string;
    logistics: string;
  };
}

const DETAIL_TABS = ['基础信息', '信息编辑', '包裹', '财务', '备注', '时间', '日志跟踪', '代发包裹', '国际物流'];

/* 以下样例值取自线上订单详情弹窗同一订单的采集结果，订单本身未提供的字段沿用这些值 */
const SAMPLE = {
  tel: '1-2027735829',
  city: 'OREM',
  addr1: '157 north 600 west Orem',
  unitWeight: '0.05',
  rate: '6.6927',
  income: [
    ['合计收入', '36.61'],
    ['初始订单金额', '40.01'],
    ['Dhgate网关手续费', '-1.4'],
    ['Dhgate佣金金额', '-2'],
    ['Dhgate订单涨价金额', '0'],
    ['Dhgate订单降价金额', '0'],
    ['Dhgate订单联盟佣金', '0'],
    ['Dhgate订单补货金额', '0'],
    ['Dhgate卖家优惠券', '0'],
    ['Dhgate订单联盟补贴佣金', '0'],
    ['Dhgate订单退款金额', '0'],
    ['Dhgate运费', '-8.42'],
    ['其他', '0'],
  ],
  profit: [
    ['合计利润USD', '36.61'],
    ['回款额利润率', '67.71%'],
    ['销售额利润率', '61.96%'],
  ],
};

function IconClose() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M3.6 3.6 12.4 12.4M12.4 3.6 3.6 12.4" />
    </svg>
  );
}

function IconCopy() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
      <rect x="5.6" y="2.2" width="8.2" height="8.2" rx="1.4" />
      <path d="M10.4 12.2v1.2a1.4 1.4 0 0 1-1.4 1.4H3.4A1.4 1.4 0 0 1 2 13.4V7.2a1.4 1.4 0 0 1 1.4-1.4h1.2" />
    </svg>
  );
}

function IconEdit() {
  return (
    <svg className="od-icon-edit" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <path d="M11.2 2.4 13.6 4.8 5.6 12.8 2.4 13.6l.8-3.2z" />
    </svg>
  );
}

function IconRefresh() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <path d="M13.4 8a5.4 5.4 0 1 1-1.9-4.1" />
      <path d="M13.6 1.8v2.6H11" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <circle cx="7" cy="7" r="4.2" />
      <path d="m10.2 10.2 3 3" />
    </svg>
  );
}

function IconTranslate() {
  return (
    <svg className="od-icon-translate" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.1">
      <path d="M1.8 3.6h6M4.8 2.2v1.4M6.4 3.6c0 2.6-1.9 4.8-4.4 5.6M3 6.2c.7 1.6 2 2.7 3.6 3.2" />
      <path d="M8.4 13.8l3-7.4 3 7.4M9.6 11.2h3.6" />
    </svg>
  );
}

function IconArrow({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      {dir === 'left' ? <path d="m9.6 3.4-4.8 4.6 4.8 4.6" /> : <path d="m6.4 3.4 4.8 4.6-4.8 4.6" />}
    </svg>
  );
}

interface FieldDef {
  label: string;
  value?: string;
  editable?: boolean;
  readonly?: boolean;
}

function FieldRow({ fields, full }: { fields: (FieldDef | null)[]; full?: boolean }) {
  return (
    <div className="od-info-row">
      {fields.map((f, i) =>
        f ? (
          <div key={f.label + i} className={'od-info-item' + (full ? ' is-full' : '')}>
            <span className="od-info-label">{f.label}</span>
            <span
              className={
                'od-info-value' + (f.editable ? ' is-editable' : '') + (f.readonly ? ' is-readonly' : '')
              }
            >
              {f.editable ? <IconEdit /> : null}
              {f.value || ''}
            </span>
          </div>
        ) : (
          <div key={'gap' + i} className="od-info-item" />
        ),
      )}
    </div>
  );
}

function SectionTitle({ children, first, annotationId }: { children: React.ReactNode; first?: boolean; annotationId?: string }) {
  return (
    <h4 className={'od-section-title' + (first ? ' is-first' : '')} {...(annotationId ? { 'data-annotation-id': annotationId } : {})}>
      {children}
    </h4>
  );
}

interface ColDef {
  w: number;
  center?: boolean;
}

function Grid({
  cols,
  head,
  body,
  foot,
  height,
  empty,
}: {
  cols: ColDef[];
  head: React.ReactNode[];
  body?: React.ReactNode;
  foot?: React.ReactNode;
  height?: number;
  empty?: boolean;
}) {
  const total = cols.reduce((s, c) => s + c.w, 0);
  const colgroup = (
    <colgroup>
      {cols.map((c, i) => (
        <col key={i} style={{ width: c.w }} />
      ))}
    </colgroup>
  );
  return (
    <div className="od-grid" style={height ? { height } : undefined}>
      <div className="od-grid__scroll">
        <table style={{ width: total, minWidth: total }}>
          <thead>
            <tr>
              {head.map((cell, i) => (
                <th key={i} className={cols[i]?.center ? 'is-center' : undefined}>
                  <div>{cell}</div>
                </th>
              ))}
            </tr>
          </thead>
          {body}
          {foot}
        </table>
        {empty ? <div className="od-grid__empty">暂无数据</div> : null}
      </div>
    </div>
  );
}

function TextCell({ value }: { value?: string }) {
  return (
    <div className="od-input">
      <input type="text" readOnly placeholder="请输入" value={value || ''} />
    </div>
  );
}

function NumCell({ value, minZero }: { value?: string; minZero?: boolean }) {
  return (
    <div className="od-input od-input--number">
      <input type="text" readOnly placeholder="请输入" value={value || ''} />
      <span className="od-stepper">
        <span className={'od-stepper__down' + (minZero ? ' is-disabled' : '')}>
          <IconArrow dir="left" />
        </span>
        <span className="od-stepper__up">
          <IconArrow dir="right" />
        </span>
      </span>
    </div>
  );
}

export default function OrderDetailDialog({ data, onClose }: { data: OrderDetailData; onClose: () => void }) {
  const [tab, setTab] = useState('基础信息');
  const timeOf = (label: string) => data.times.find((t) => t.label === label)?.value || '-';

  return (
    <div className="od-overlay" onClick={onClose}>
      <div className="od-dialog" role="dialog" aria-modal="true" aria-label="订单详情" onClick={(e) => e.stopPropagation()}>
        <div className="od-header">
          <span className="od-header__title">订单详情</span>
          <button className="od-header__close" type="button" aria-label="关闭" onClick={onClose}>
            <IconClose />
          </button>
        </div>

        <div className="od-body">
          <div className="od-summary">
            <div className="od-summary__cell">
              <div className="od-summary__label">平台订单号</div>
              <div className="od-summary__value">{data.orderNo}</div>
            </div>
            <div className="od-summary__cell">
              <div className="od-summary__label">实收金额</div>
              <div className="od-summary__value">
                USD<span className="od-summary__amount">{data.amount}</span>
              </div>
            </div>
            <div className="od-summary__cell">
              <div className="od-summary__label">店铺</div>
              <div className="od-summary__value">
                <img src={dhBadge} alt="" />
                {data.store}
              </div>
            </div>
            <div className="od-summary__cell">
              <div className="od-summary__label">订单状态</div>
              <div className="od-summary__value">{data.orderState}</div>
            </div>
          </div>

          <div className="od-tabs">
            {DETAIL_TABS.map((label) => (
              <label key={label} className="od-tab">
                <input type="radio" name="od-tab" checked={tab === label} onChange={() => setTab(label)} />
                <span>{label}</span>
              </label>
            ))}
          </div>

          {tab === '基础信息' ? <BasePanel data={data} /> : null}
          {tab === '信息编辑' ? <EditPanel data={data} /> : null}
          {tab === '包裹' ? <PackagePanel data={data} /> : null}
          {tab === '财务' ? <FinancePanel /> : null}
          {tab === '备注' ? <MemoPanel /> : null}
          {tab === '时间' ? <TimePanel timeOf={timeOf} /> : null}
          {tab === '日志跟踪' ? <LogPanel /> : null}
          {tab === '代发包裹' ? <ProxyPanel /> : null}
          {tab === '国际物流' ? <IntlPanel /> : null}

          <div className="od-footer">
            <button className="od-btn" type="button" onClick={onClose}>
              关闭
            </button>
            <button className="od-btn od-btn--primary" type="button">
              线路审核
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BasePanel({ data }: { data: OrderDetailData }) {
  return (
    <div className="od-panel">
      <div className="od-fields">
        <div className="od-field">
          <span className="od-field__label">平台订单号</span>
          <span className="od-field__value">{data.orderNo}</span>
          <button
            className="od-field__copy"
            type="button"
            aria-label="复制平台订单号"
            onClick={() => navigator.clipboard?.writeText(data.orderNo)}
          >
            <IconCopy />
          </button>
        </div>
        <div className="od-field">
          <span className="od-field__label">状态</span>
          <span className="od-field__value">{data.status}</span>
        </div>
        <div className="od-field">
          <span className="od-field__label">分拣种类</span>
          <span className="od-field__value">{data.sortType}</span>
        </div>
      </div>
      <div className="od-fields">
        <div className="od-field">
          <span className="od-field__label">买家选择的物流</span>
          <span className="od-field__value">{data.buyerLogistics}</span>
        </div>
        <div className="od-field">
          <span className="od-field__label">卖家选择的物流</span>
          <span className="od-field__value">{data.sellerLogistics}</span>
        </div>
      </div>

      <div className="od-table">
        <div className="od-table__head">
          <table>
            <colgroup>
              <col style={{ width: '100px' }} />
              <col style={{ width: 'auto' }} />
              <col style={{ width: '150px' }} />
              <col style={{ width: '220px' }} />
            </colgroup>
            <thead>
              <tr>
                <th className="is-first">
                  <div>图片</div>
                </th>
                <th>
                  <div>产品名称/规格</div>
                </th>
                <th data-annotation-id="mo-price-api-map">
                  <div>价格/数量</div>
                </th>
                <th className="is-last">
                  <div>物流</div>
                </th>
              </tr>
            </thead>
          </table>
        </div>
        <div className="od-table__body">
          <table>
            <colgroup>
              <col style={{ width: '100px' }} />
              <col style={{ width: 'auto' }} />
              <col style={{ width: '150px' }} />
              <col style={{ width: '220px' }} />
            </colgroup>
            <tbody>
              <tr>
                <td>
                  <div className="od-cell-inner">
                    <span className="od-thumb">
                      <img src={data.product.image} alt="" loading="eager" />
                    </span>
                  </div>
                </td>
                <td>
                  <div className="od-cell-inner">
                    <div>{data.product.title}</div>
                    <div>线上产品编号: {data.product.onlineNo}</div>
                    <div>SkuCode: {data.product.skuCode}</div>
                    <div>Color: - Options: {data.product.options}</div>
                  </div>
                </td>
                <td>
                  <div className="od-cell-inner">
                    <div>USD {data.product.price}</div>
                    <div>{data.product.qty}</div>
                  </div>
                </td>
                <td className="is-last">
                  <div className="od-cell-inner">
                    <div>{data.product.logistics}</div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const DECLARE_COLS: ColDef[] = [
  { w: 160 },
  { w: 180 },
  { w: 180 },
  { w: 160 },
  { w: 160 },
  { w: 160 },
  { w: 160 },
  { w: 160 },
  { w: 160 },
  { w: 160 },
  { w: 160 },
  { w: 160 },
  { w: 200 },
];

function EditPanel({ data }: { data: OrderDetailData }) {
  return (
    <div className="od-panel">
      <SectionTitle first annotationId="mo-buyer-api-map">基本信息</SectionTitle>
      <FieldRow full fields={[{ label: '名称', value: data.buyer.name, editable: true }]} />

      <SectionTitle>联系方式</SectionTitle>
      <FieldRow fields={[{ label: '手机号码', editable: true }, { label: '电话号码', value: SAMPLE.tel, editable: true }, { label: '电子邮箱', editable: true }]} />

      <SectionTitle>地址</SectionTitle>
      <FieldRow
        fields={[
          { label: '国家/地区', value: data.buyer.country, editable: true },
          { label: '省/州', value: data.buyer.state, editable: true },
          { label: '城市', value: SAMPLE.city, editable: true },
          { label: '邮编', value: data.buyer.zip, editable: true },
        ]}
      />
      <FieldRow fields={[{ label: '区/街道', editable: true }, { label: '门牌号', editable: true }, { label: '买家税号', editable: true }]} />
      <FieldRow full fields={[{ label: '详细地址1', value: SAMPLE.addr1, editable: true }]} />
      <FieldRow full fields={[{ label: '详细地址2', editable: true }]} />
      <FieldRow full fields={[{ label: '详细地址3', editable: true }]} />

      <Grid
        cols={DECLARE_COLS}
        head={[
          '序号/操作',
          <span className="od-declare-head" key="en">
            英文名
            <IconTranslate />
          </span>,
          <span className="od-declare-head" key="cn">
            中文名
            <IconTranslate />
          </span>,
          '数量',
          '单位价值USD',
          '单位重量kg',
          '长(CM)',
          '宽(CM)',
          '高(CM)',
          '海关编码',
          '材质',
          '用途',
          '特征',
        ]}
        body={
          <tbody>
            <tr>
              <td>
                <div className="od-declare-seq">
                  <span>1</span>
                  <span className="od-thumb od-thumb--sm">
                    <img src={data.product.image} alt="" loading="eager" />
                  </span>
                  <button className="od-btn-danger" type="button">
                    删除
                  </button>
                </div>
              </td>
              <td>
                <TextCell />
              </td>
              <td>
                <TextCell />
              </td>
              <td>
                <NumCell value={data.product.qty} />
              </td>
              <td>
                <NumCell value={data.product.price} />
              </td>
              <td>
                <NumCell value={SAMPLE.unitWeight} minZero />
              </td>
              <td>
                <NumCell value="0" minZero />
              </td>
              <td>
                <NumCell value="0" minZero />
              </td>
              <td>
                <NumCell value="0" minZero />
              </td>
              <td>
                <div className="od-input od-input--suffix">
                  <input type="text" readOnly placeholder="请输入" />
                  <span className="od-input__suffix">
                    <IconSearch />
                  </span>
                </div>
              </td>
              <td>
                <TextCell />
              </td>
              <td>
                <TextCell />
              </td>
              <td>
                <div className="od-input od-input--select">
                  <input type="text" readOnly placeholder="请输入" />
                  <span className="od-input__suffix od-input__suffix--caret">
                    <IconArrow dir="right" />
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        }
        foot={
          <tfoot>
            <tr>
              <td>
                <div>合计</div>
              </td>
              <td>
                <div />
              </td>
              <td>
                <div />
              </td>
              <td>
                <div>{data.product.qty}</div>
              </td>
              <td>
                <div>{data.product.price}</div>
              </td>
              <td>
                <div>{SAMPLE.unitWeight}</div>
              </td>
              {DECLARE_COLS.slice(6).map((_, i) => (
                <td key={i}>
                  <div />
                </td>
              ))}
            </tr>
          </tfoot>
        }
      />
      <button className="od-btn od-btn--solid" type="button">
        更新申报信息
      </button>
    </div>
  );
}

function PackagePanel({ data }: { data: OrderDetailData }) {
  return (
    <div className="od-panel">
      <SectionTitle first>基本信息</SectionTitle>
      <FieldRow fields={[{ label: '包裹号', editable: true }, { label: '发货渠道', value: '-', readonly: true }, { label: '运单', editable: true }]} />
      <FieldRow fields={[{ label: 'pdf文件下载', value: '无', editable: true }, { label: '分拣种类', value: data.sortType, editable: true }, null]} />
      <SectionTitle>重量</SectionTitle>
      <FieldRow
        fields={[
          { label: '预估重量kg', value: '0.0', editable: true },
          { label: '物流商称重kg', value: '0.0', editable: true },
          { label: '卖家称重', value: '0.0', editable: true },
        ]}
      />
      <SectionTitle>尺寸</SectionTitle>
      <FieldRow
        fields={[
          { label: '长', value: '0', editable: true },
          { label: '宽', value: '0', editable: true },
          { label: '高', value: '0', editable: true },
        ]}
      />
    </div>
  );
}

function FinancePanel() {
  const f = (label: string, value: string, editable?: boolean) => ({ label, value, editable });
  const income = SAMPLE.income;
  return (
    <div className="od-panel">
      <SectionTitle first>币种</SectionTitle>
      <FieldRow fields={[f('平台币种', 'USD'), f('当前币种', 'CNY'), f('汇率', SAMPLE.rate)]} />

      <SectionTitle>收入USD</SectionTitle>
      <FieldRow fields={income.slice(0, 4).map(([l, v]) => f(l, v))} />
      <FieldRow fields={[null, ...income.slice(4, 7).map(([l, v]) => f(l, v))]} />
      <FieldRow fields={[null, ...income.slice(7, 10).map(([l, v]) => f(l, v))]} />
      <FieldRow fields={[null, ...income.slice(10).map(([l, v]) => f(l, v))]} />

      <SectionTitle>支出RMB</SectionTitle>
      <FieldRow
        fields={[
          f('合计支出', '0.00'),
          f('货品成本', '0', true),
          f('物流成本', '0', true),
          f('包装成本', '0', true),
        ]}
      />

      <SectionTitle>利润</SectionTitle>
      <FieldRow fields={[...SAMPLE.profit.map(([l, v]) => f(l, v)), null]} />
    </div>
  );
}

function MemoPanel() {
  return (
    <div className="od-panel">
      <FieldRow full fields={[{ label: '卖家备注', value: '-', editable: true }]} />
      <FieldRow full fields={[{ label: '拣货备注', value: '-', editable: true }]} />
      <FieldRow full fields={[{ label: '客户备注', value: '-', readonly: true }]} />
    </div>
  );
}

function TimePanel({ timeOf }: { timeOf: (label: string) => string }) {
  return (
    <div className="od-panel">
      <FieldRow full fields={[{ label: '创建时间', value: timeOf('创建') }]} />
      <FieldRow full fields={[{ label: '付款时间', value: timeOf('付款') }]} />
      <FieldRow full fields={[{ label: '截止时间', value: timeOf('截止') }]} />
      <FieldRow full fields={[{ label: '审核时间', value: timeOf('审核') }]} />
    </div>
  );
}

function LogPanel() {
  return (
    <div className="od-panel">
      <div className="od-log">
        <div className="od-log__header">
          <h4>日志</h4>
          <button className="od-log__refresh" type="button" aria-label="刷新日志">
            <IconRefresh />
          </button>
        </div>
        <div className="od-log__body">暂无日志记录</div>
        <div className="od-log__pager">
          <button className="od-pager__btn is-disabled" type="button" aria-label="上一页">
            <IconArrow dir="left" />
          </button>
          <span className="od-pager__num is-active">1</span>
          <button className="od-pager__btn is-disabled" type="button" aria-label="下一页">
            <IconArrow dir="right" />
          </button>
        </div>
      </div>
    </div>
  );
}

const PROXY_COLS: ColDef[] = [
  { w: 60, center: true },
  { w: 90, center: true },
  { w: 180 },
  { w: 150 },
  { w: 100, center: true },
  { w: 100, center: true },
  { w: 120 },
  { w: 180 },
  { w: 100, center: true },
  { w: 150, center: true },
  { w: 80, center: true },
];

function ProxyPanel() {
  return (
    <div className="od-panel">
      <Grid
        cols={PROXY_COLS}
        height={550}
        empty
        head={['序号', '图片', '采购平台订单号', '运单号', '采购金额', '采购运费', '买手号', '供应商', '物流状态', '创建时间', '操作']}
      />
    </div>
  );
}

const INTL_COLS: ColDef[] = [
  { w: 140 },
  { w: 150 },
  { w: 80 },
  { w: 100 },
  { w: 160 },
  { w: 180 },
  { w: 200 },
  { w: 90, center: true },
  { w: 170 },
  { w: 120 },
  { w: 90, center: true },
  { w: 130 },
  { w: 110, center: true },
  { w: 90, center: true },
];

function IntlPanel() {
  return (
    <div className="od-panel">
      <Grid
        cols={INTL_COLS}
        empty
        head={[
          '订单号',
          '运单号',
          '产品',
          '店铺',
          <span key="c">
            国家地区
            <br />
            收件人
          </span>,
          <span key="l">
            物流商
            <br />
            物流渠道
          </span>,
          '最新轨迹',
          '运输天数',
          <span key="t">
            付款
            <br />
            提交
            <br />
            更新
          </span>,
          '节点',
          '上网状态',
          '轨迹未更新天数',
          '实际重量KG',
          '计费RMB',
        ]}
      />
      <div className="od-track">
        <div className="od-track__title">-物流轨迹</div>
      </div>
    </div>
  );
}
