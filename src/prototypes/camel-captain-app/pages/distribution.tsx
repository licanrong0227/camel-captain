import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, Cpu, Crown, Store } from 'lucide-react';
import {
  CUSTOMER_FIELDS,
  DISTRIBUTION_CUSTOMERS,
  DISTRIBUTION_ORDERS,
  type DistributionCustomer,
  type DistributionOrder,
} from '../data/distribution';
import { fmtInt } from '../data/format';
import { DateWheelPicker } from '../components/DateWheelPicker';
import { EmptyState } from '../components/EmptyState';
import { Segmented } from '../components/Segmented';
import { Sheet } from '../components/Sheet';

const REG_MIN = '2026-06-01';
const REG_MAX = '2026-11-30';

const formatCny = (value: number) => `¥${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatNumber = (value: number) => (
  Number.isInteger(value)
    ? value.toLocaleString('en-US')
    : value.toLocaleString('en-US', { maximumFractionDigits: 2 })
);

const memberTone = (type: string) => {
  if (type.includes('至尊')) return 'is-orange';
  if (type.includes('金')) return 'is-gold';
  if (type.includes('铜')) return 'is-bronze';
  return 'is-muted';
};

function OrderIcon({ type }: { type: DistributionOrder['type'] }) {
  if (type === 'compute') return <Cpu size={20} />;
  if (type === 'member') return <Crown size={20} />;
  return <Store size={20} />;
}

export function DistributionPage({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<'board' | 'customers'>('board');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [regFrom, setRegFrom] = useState('');
  const [regTo, setRegTo] = useState('');
  const [detail, setDetail] = useState<DistributionCustomer | null>(null);
  const [regPicker, setRegPicker] = useState<'from' | 'to' | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [tab]);

  const customers = useMemo(
    () => DISTRIBUTION_CUSTOMERS.filter((row) => {
      if (name && !row.name.includes(name.trim())) return false;
      if (username && !row.username.toLowerCase().includes(username.trim().toLowerCase())) return false;
      if (phone && !row.phone.includes(phone.trim())) return false;
      if (regFrom && row.registeredAt.slice(0, 10) < regFrom) return false;
      if (regTo && row.registeredAt.slice(0, 10) > regTo) return false;
      return true;
    }),
    [name, username, phone, regFrom, regTo],
  );

  const resetFilters = () => {
    setName('');
    setUsername('');
    setPhone('');
    setRegFrom('');
    setRegTo('');
  };

  const detailValue = (customer: DistributionCustomer, key: keyof DistributionCustomer) => {
    if (key === 'qq') return customer.qq || '-';
    if (key === 'storeCount') return `${customer.storeCount} / ${customer.storeLimit}`;
    if (key === 'orderCount') return `${formatNumber(customer.orderCount)} / ${formatNumber(customer.orderLimit)}`;
    if (key === 'spend') return formatCny(customer.spend);
    if (key === 'compute') return formatNumber(customer.compute);
    if (key === 'points') return formatNumber(customer.points);
    if (key === 'coupons') return `${customer.coupons} 张`;
    if (key === 'subAccounts') return `${customer.subAccounts} 个`;
    return String(customer[key]);
  };

  return (
    <div className="cc-page cc-distribution">
      <header className="cc-page-head cc-sub-page-head">
        <button type="button" className="cc-back-btn" aria-label="返回我的" onClick={onBack}>
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="cc-page-title">分销中心</h1>
          <p className="cc-page-sub">我的客户与本平台客户订单</p>
        </div>
      </header>

      <div className="cc-dist-tabs">
        <Segmented
          value={tab}
          options={[{ key: 'board', label: '数据看板' }, { key: 'customers', label: '我的客户' }]}
          onChange={(next) => setTab(next as 'board' | 'customers')}
          variant="tabs"
        />
      </div>

      <div className="cc-scroll" ref={scrollRef}>
        {tab === 'board' ? (
          <>
            <div className="cc-section-head cc-dist-section-head">
              <span className="cc-section-title">本平台客户订单</span>
              <span className="cc-muted">共 {DISTRIBUTION_ORDERS.length} 条</span>
            </div>
            <div className="cc-order-list">
              {DISTRIBUTION_ORDERS.map((order) => (
                <div className="cc-order-card" key={order.id}>
                  <div className={`cc-order-icon is-${order.type}`}>
                    <OrderIcon type={order.type} />
                  </div>
                  <div className="cc-order-main">
                    <div className="cc-order-head">
                      <span className="cc-order-title">{order.product}</span>
                      <span className={`cc-order-status is-${order.status === '已支付' ? 'paid' : 'cancelled'}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="cc-order-meta">客户 {order.customer} · {order.orderNo}</div>
                    <div className="cc-order-foot">
                      <span>数量 ×{order.qty}</span>
                      <strong>{formatCny(order.amount)}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="cc-list-end">已经到底了</div>
          </>
        ) : (
          <>
            <section className="cc-card cc-filter-card">
              <div className="cc-filter-fields">
                <label className="cc-filter-field">
                  <span>姓名</span>
                  <div className="cc-name-row">
                    <input className="cc-input cc-input--box" value={name} placeholder="请输入" onChange={(event) => setName(event.target.value)} />
                    <button
                      type="button"
                      className={`cc-filter-more${moreOpen ? ' is-open' : ''}`}
                      onClick={() => setMoreOpen((value) => !value)}
                    >
                      {moreOpen ? '收起筛选' : '更多筛选'}
                      <ChevronDown size={12} />
                    </button>
                  </div>
                </label>
                {moreOpen ? (
                  <>
                    <div className="cc-filter-row--two">
                      <label className="cc-filter-field">
                        <span>用户名</span>
                        <input className="cc-input cc-input--box" value={username} placeholder="请输入" onChange={(event) => setUsername(event.target.value)} />
                      </label>
                      <label className="cc-filter-field">
                        <span>手机号</span>
                        <input className="cc-input cc-input--box" value={phone} placeholder="请输入" onChange={(event) => setPhone(event.target.value)} />
                      </label>
                    </div>
                    <div className="cc-filter-field cc-filter-field--date">
                      <span>注册时间</span>
                      <div className="cc-date-range">
                        <button
                          type="button"
                          className={`cc-date-field${regFrom ? '' : ' is-empty'}`}
                          onClick={() => setRegPicker('from')}
                        >
                          <span>{regFrom ? regFrom.replace(/-/g, '/') : '开始'}</span>
                          <Calendar size={15} />
                        </button>
                        <button
                          type="button"
                          className={`cc-date-field${regTo ? '' : ' is-empty'}`}
                          onClick={() => setRegPicker('to')}
                        >
                          <span>{regTo ? regTo.replace(/-/g, '/') : '结束'}</span>
                          <Calendar size={15} />
                        </button>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
              <div className="cc-filter-actions">
                <span className="cc-muted">共 {customers.length} 个客户</span>
                <button type="button" className="cc-btn cc-btn--ghost cc-btn--sm" onClick={resetFilters}>重置</button>
              </div>
            </section>

            <div className="cc-customer-list">
              {customers.map((customer) => (
                <button type="button" className="cc-customer-card" key={customer.id} onClick={() => setDetail(customer)}>
                  <div className="cc-customer-head">
                    <span className="cc-customer-name">{customer.name}</span>
                    <span className={`cc-tag ${memberTone(customer.memberType)}`}>{customer.memberType}</span>
                  </div>
                  <div className="cc-customer-contact">{customer.username} · {customer.phone}</div>
                  <div className="cc-customer-metrics">
                    <div><span>店铺数</span><strong>{customer.storeCount} / {customer.storeLimit}</strong></div>
                    <div><span>订单数</span><strong>{formatNumber(customer.orderCount)} / {formatNumber(customer.orderLimit)}</strong></div>
                    <div><span>消费总金额</span><strong>{formatCny(customer.spend)}</strong></div>
                    <div><span>算力余额</span><strong>{formatNumber(customer.compute)}</strong></div>
                    <div><span>积分</span><strong>{formatNumber(customer.points)}</strong></div>
                    <div><span>优惠券</span><strong>{customer.coupons} 张</strong></div>
                  </div>
                  <div className="cc-customer-foot">
                    <span>{customer.email}</span>
                    <ChevronRight size={15} />
                  </div>
                </button>
              ))}
            </div>

            {customers.length === 0 ? (
              <EmptyState title="没有符合条件的客户" desc="试试调整姓名、用户名或注册时间" action={{ label: '清除筛选', onClick: resetFilters }} />
            ) : (
              <div className="cc-list-end">已经到底了</div>
            )}
          </>
        )}
        <div className="cc-dist-bottom-space" />
      </div>

      <Sheet open={detail !== null} title="客户详情" height={660} onClose={() => setDetail(null)}>
        {detail ? (
          <div className="cc-detail-list">
            {CUSTOMER_FIELDS.map((field) => (
              <div className="cc-detail-row" key={field.key}>
                <span>{field.label}</span>
                <strong>{detailValue(detail, field.key)}</strong>
              </div>
            ))}
          </div>
        ) : null}
      </Sheet>

      <DateWheelPicker
        open={regPicker !== null}
        title={regPicker === 'to' ? '注册结束日期' : '注册开始日期'}
        value={regPicker === 'to' ? (regTo || REG_MAX) : (regFrom || REG_MIN)}
        min={REG_MIN}
        max={REG_MAX}
        onCancel={() => setRegPicker(null)}
        onConfirm={(next) => {
          if (regPicker === 'to') setRegTo(next);
          else setRegFrom(next);
          setRegPicker(null);
        }}
      />
    </div>
  );
}
