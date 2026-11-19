/**
 * @name 购买会员弹窗 - 骆驼队长BI
 */

import React, { useEffect, useState } from 'react';
import './style.css';

type PeriodKey = 'm12' | 'm1' | 'm24' | 'm36';

interface PeriodPlan {
  key: PeriodKey;
  label: string;
  discount: string | null;
  price: string;
}

const PLANS: PeriodPlan[] = [
  { key: 'm12', label: '1年', discount: '8.5折', price: '15.30' },
  { key: 'm1', label: '1月', discount: null, price: '1.50' },
  { key: 'm24', label: '2年', discount: '8折', price: '28.80' },
  { key: 'm36', label: '3年', discount: '7.5折', price: '40.50' },
];

const MEMBER_NAME = '金牌会员';

// 升级购买时当前会员剩余价值可抵扣（线上 /member-order/residual-value 返回值）
const RESIDUAL_VALUE = 0.94;

const money = (value: number) => value.toFixed(2);

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export default function MemberPurchaseDialog() {
  const [open, setOpen] = useState(true);
  const [period, setPeriod] = useState<PeriodKey>('m12');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(false);

  const current = PLANS.find((plan) => plan.key === period) ?? PLANS[0];
  const packageAmount = Number(current.price);
  const payable = Math.max(0, packageAmount - RESIDUAL_VALUE);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(false), 2000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!submitting) return undefined;
    const timer = window.setTimeout(() => {
      setSubmitting(false);
      setOpen(false);
      setToast(true);
    }, 800);
    return () => window.clearTimeout(timer);
  }, [submitting]);

  return (
    <div className="mpd-page">
      {open && (
        <div className="mpd-mask">
          <div className="mpd-dialog" role="dialog" aria-modal="true" aria-label={`购买 ${MEMBER_NAME}`}>
            <header className="mpd-head">
              <h2 className="mpd-title">购买 {MEMBER_NAME}</h2>
              <button type="button" className="mpd-close" aria-label="关闭" onClick={() => setOpen(false)}>
                <CloseIcon />
              </button>
            </header>

            <div className="mpd-body">
              <div className="mpd-body-inner">
                <div className="mpd-label">选择时长</div>
                <div className="mpd-period-group" role="radiogroup" aria-label="选择时长">
                  {PLANS.map((plan) => {
                    const checked = plan.key === period;
                    return (
                      <label
                        key={plan.key}
                        role="radio"
                        aria-checked={checked}
                        tabIndex={checked ? 0 : -1}
                        className={`mpd-period-item${checked ? ' is-checked' : ''}`}
                        onClick={() => setPeriod(plan.key)}
                      >
                        <span className={`mpd-radio${checked ? ' is-checked' : ''}`} aria-hidden="true" />
                        <span className="mpd-period-label">
                          <span className="mpd-period-text">{plan.label}</span>
                          {plan.discount && <span className="mpd-tag">{plan.discount}</span>}
                        </span>
                      </label>
                    );
                  })}
                </div>

                <div className="mpd-label">金额</div>
                <div className="mpd-amount-row">
                  <span className="mpd-amount">¥ {money(payable)}</span>
                </div>
                {payable < packageAmount && (
                  <div className="mpd-amount-meta">
                    <span className="mpd-amount-original">¥ {money(packageAmount)}</span>
                    <span className="mpd-deduct">
                      剩余价值抵扣<span className="mpd-deduct-value">-¥ {money(packageAmount - payable)}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            <footer className="mpd-foot">
              <span className="mpd-foot-actions">
                <button type="button" className="mpd-btn" onClick={() => setOpen(false)}>
                  取消
                </button>
                <button
                  type="button"
                  className="mpd-btn mpd-btn--primary"
                  disabled={submitting}
                  onClick={() => setSubmitting(true)}
                >
                  {submitting ? '下单中...' : '下单'}
                </button>
              </span>
            </footer>
          </div>
        </div>
      )}

      {!open && (
        <button type="button" className="mpd-reopen" onClick={() => setOpen(true)}>
          打开购买会员弹窗
        </button>
      )}

      {toast && (
        <div className="mpd-toast" role="status">
          下单成功
        </div>
      )}
    </div>
  );
}
