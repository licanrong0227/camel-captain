import React, { useEffect, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { Segmented } from './Segmented';
import { Sheet } from './Sheet';

export type AlertKind = 'order' | 'delivery' | 'onnet' | 'logistics';

const ALERT_STATUSES = [
  '订单取消', '等待买家付款', '买家已付款，等待平台确认', '等待发货', '买家申请退款，等待协商结果',
  '退款协议已达成', '部分退款后，等待发货', '买家取消退款申请', '已部分发货', '等待买家确认收货',
  '退款/退货协商中，等待协议达成', '买家投诉到平台', '协议已达成，执行中', '人工确认收货',
  '超过预定期限，自动确认收货', '交易成功', '交易关闭',
];

const DEFAULT_CHECKED: Record<AlertKind, string[]> = {
  order: ['订单取消', '买家申请退款，等待协商结果', '退款/退货协商中，等待协议达成', '买家投诉到平台'],
  delivery: ['等待发货'],
  onnet: ['等待买家确认收货'],
  logistics: ['等待买家确认收货'],
};

const LOGISTICS_STATUSES = ['未查询到物流信息', '物流商已收货', '运输中', '运输过久', '投递失败', '到达待取', '已妥投'];
const DEFAULT_LOGISTICS_STATUSES = ['投递失败', '到达待取'];
const DEFAULT_DAYS: Record<AlertKind, number> = { order: 1, delivery: 3, onnet: 7, logistics: 5 };

function NumberStepper({ value, onChange }: { value: number; onChange: (next: number) => void }) {
  return (
    <div className="cc-num">
      <button type="button" aria-label="减少" onClick={() => onChange(Math.max(1, value - 1))}>
        <Minus size={12} />
      </button>
      <input
        inputMode="numeric"
        value={value}
        onChange={(event) => {
          const next = Number(event.target.value.replace(/\D/g, ''));
          onChange(Math.max(1, Number.isFinite(next) && next > 0 ? next : 1));
        }}
      />
      <button type="button" aria-label="增加" onClick={() => onChange(value + 1)}>
        <Plus size={12} />
      </button>
    </div>
  );
}

export function AlertSettingsSheet({
  open,
  kind,
  onClose,
}: {
  open: boolean;
  kind: AlertKind;
  onClose: () => void;
}) {
  const [checked, setChecked] = useState<string[]>(DEFAULT_CHECKED[kind]);
  const [days, setDays] = useState(DEFAULT_DAYS[kind]);
  const [online, setOnline] = useState<'已上网' | '未上网'>('未上网');
  const [logistics, setLogistics] = useState<string[]>(DEFAULT_LOGISTICS_STATUSES);

  useEffect(() => {
    if (!open) return;
    setChecked(DEFAULT_CHECKED[kind]);
    setDays(DEFAULT_DAYS[kind]);
    setOnline('未上网');
    setLogistics(DEFAULT_LOGISTICS_STATUSES);
  }, [open, kind]);

  const allChecked = checked.length === ALERT_STATUSES.length;
  const someChecked = checked.length > 0;

  return (
    <Sheet
      open={open}
      title="筛选状态设置"
      height={660}
      onClose={onClose}
      footer={
        <div className="cc-sheet-actions">
          <button type="button" className="cc-btn cc-btn--ghost" onClick={onClose}>取消</button>
          <button type="button" className="cc-btn cc-btn--primary" onClick={onClose}>保存</button>
        </div>
      }
    >
      <div className="cc-sheet-section-head">
        <span className="cc-form-label">平台订单状态</span>
        <button
          type="button"
          className={`cc-check${someChecked ? ' is-checked' : ''}`}
          role="checkbox"
          aria-checked={allChecked}
          onClick={() => setChecked(allChecked ? [] : [...ALERT_STATUSES])}
        >
          <span className="cc-check-box">{someChecked ? '✓' : ''}</span>
          <span>全选</span>
        </button>
      </div>
      <div className="cc-status-list">
        {ALERT_STATUSES.map((status) => {
          const isChecked = checked.includes(status);
          return (
            <button
              key={status}
              type="button"
              className={`cc-check cc-check--row${isChecked ? ' is-checked' : ''}`}
              role="checkbox"
              aria-checked={isChecked}
              onClick={() => setChecked((prev) => (prev.includes(status) ? prev.filter((item) => item !== status) : [...prev, status]))}
            >
              <span className="cc-check-box">{isChecked ? '✓' : ''}</span>
              <span>{status}</span>
            </button>
          );
        })}
      </div>

      {kind === 'delivery' ? (
        <div className="cc-extra-block">
          <div className="cc-form-label">剩余发货天数</div>
          <div className="cc-extra-row">
            <span>剩余几天内发货</span>
            <NumberStepper value={days} onChange={setDays} />
          </div>
        </div>
      ) : null}

      {kind === 'onnet' ? (
        <div className="cc-extra-block">
          <div className="cc-form-label">未上网天数</div>
          <div className="cc-extra-row">
            <span>是否已上网</span>
            <Segmented
              value={online}
              options={[{ key: '已上网', label: '已上网' }, { key: '未上网', label: '未上网' }]}
              onChange={(next) => setOnline(next as '已上网' | '未上网')}
            />
          </div>
          <div className="cc-extra-row">
            <span>超过几天未上网</span>
            <NumberStepper value={days} onChange={setDays} />
          </div>
        </div>
      ) : null}

      {kind === 'logistics' ? (
        <>
          <div className="cc-extra-block">
            <div className="cc-form-label">国际物流状态</div>
            <div className="cc-check-grid">
              {LOGISTICS_STATUSES.map((status) => {
                const isChecked = logistics.includes(status);
                return (
                  <button
                    key={status}
                    type="button"
                    className={`cc-check${isChecked ? ' is-checked' : ''}`}
                    role="checkbox"
                    aria-checked={isChecked}
                    onClick={() => setLogistics((prev) => (
                      prev.includes(status) ? prev.filter((item) => item !== status) : [...prev, status]
                    ))}
                  >
                    <span className="cc-check-box">{isChecked ? '✓' : ''}</span>
                    <span>{status}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="cc-extra-block">
            <div className="cc-form-label">断更天数</div>
            <div className="cc-extra-row">
              <span>轨迹断更天数</span>
              <NumberStepper value={days} onChange={setDays} />
            </div>
          </div>
        </>
      ) : null}
    </Sheet>
  );
}
