import React, { useEffect, useState } from 'react';
import {
  ErpButton,
  ErpCheckbox,
  ErpDialog,
  ErpForm,
  ErpFormItem,
  ErpInput,
  ErpInputNumber,
  ErpSelect,
  ErpSwitch,
  ErpTag,
  ErpTextarea,
  erpMessage,
} from '../ui';
import { ORDER_IMAGES, STORE_OPTIONS } from '../../data/util';
import type { LabelingRule, Order } from '../../data/orders';

export function BatchDeclareDialog({
  open,
  orders,
  onClose,
  onConfirm,
}: {
  open: boolean;
  orders: Order[];
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [rows, setRows] = useState<Array<{ id: string; image: string; title: string; sku: string; enName: string; cnName: string; qty: number; value: number; weight: number; hs: string }>>([]);
  useEffect(() => {
    if (!open) return;
    setRows(
      orders.flatMap((order) =>
        order.items.map((item, index) => ({
          id: `${order.orderNo}-${index}`,
          image: item.image,
          title: item.title,
          sku: item.sku,
          enName: 'Fashion handbag for women',
          cnName: '女士时尚手提包',
          qty: item.qty,
          value: Number((item.price * 0.6).toFixed(2)),
          weight: 0.35,
          hs: '4202210090',
        })),
      ),
    );
  }, [open, orders]);

  const updateRow = (id: string, patch: Partial<(typeof rows)[number]>) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  return (
    <ErpDialog
      open={open}
      title="批处理申报信息"
      width={1180}
      onClose={onClose}
      footer={
        <>
          <ErpButton onClick={onClose}>取消</ErpButton>
          <ErpButton variant="primary" onClick={() => { onConfirm(); }}>保存申报信息</ErpButton>
        </>
      }
    >
      <div className="erp-inline-note" style={{ marginBottom: 12 }}>共 {rows.length} 条申报明细，修改后仅保存到本地演示数据，不会提交到敦煌网。</div>
      <div className="erp-table__scroll" style={{ maxHeight: 480, border: '1px solid #E5E6EB', borderRadius: 4 }}>
        <table className="erp-cost-table">
          <thead>
            <tr>
              <th style={{ minWidth: 190 }}>商品</th>
              <th style={{ minWidth: 130 }}>SKU</th>
              <th style={{ minWidth: 180 }}>英文申报名</th>
              <th style={{ minWidth: 140 }}>中文申报名</th>
              <th style={{ minWidth: 70 }}>数量</th>
              <th style={{ minWidth: 100 }}>申报价值</th>
              <th style={{ minWidth: 90 }}>重量 kg</th>
              <th style={{ minWidth: 120 }}>HS 编码</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>
                  <div className="erp-product-cell">
                    <img src={row.image} alt="" className="erp-product-cell__img" style={{ width: 36, height: 36, flexBasis: 36 }} />
                    <span className="erp-clamp-2" style={{ fontSize: 11 }}>{row.title}</span>
                  </div>
                </td>
                <td><span className="erp-code">{row.sku}</span></td>
                <td><ErpInput value={row.enName} onChange={(value) => updateRow(row.id, { enName: value })} /></td>
                <td><ErpInput value={row.cnName} onChange={(value) => updateRow(row.id, { cnName: value })} /></td>
                <td><ErpInputNumber value={row.qty} onChange={(value) => updateRow(row.id, { qty: value })} width={70} /></td>
                <td><ErpInputNumber value={row.value} precision={2} onChange={(value) => updateRow(row.id, { value })} width={90} /></td>
                <td><ErpInputNumber value={row.weight} precision={2} step={0.05} onChange={(value) => updateRow(row.id, { weight: value })} width={80} /></td>
                <td><ErpInput value={row.hs} onChange={(value) => updateRow(row.id, { hs: value })} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ErpDialog>
  );
}

export function ShipDialog({ open, order, onClose, onConfirm }: { open: boolean; order: Order | null; onClose: () => void; onConfirm: (channel: string, trackingNo: string) => void }) {
  const [channel, setChannel] = useState('华磊-美国专线');
  const [trackingNo, setTrackingNo] = useState('');
  return (
    <ErpDialog
      open={open}
      title="发货"
      width={560}
      onClose={onClose}
      footer={
        <>
          <ErpButton onClick={onClose}>取消</ErpButton>
          <ErpButton
            variant="primary"
            onClick={() => {
              if (!trackingNo.trim()) {
                erpMessage('请填写运单号', 'warning');
                return;
              }
              onConfirm(channel, trackingNo);
            }}
          >
            确认发货
          </ErpButton>
        </>
      }
    >
      <ErpForm layout="vertical">
        <ErpFormItem label="订单号"><ErpInput value={order?.orderNo || ''} disabled /></ErpFormItem>
        <ErpFormItem label="物流渠道" required>
          <ErpSelect options={[{ label: '华磊-美国专线', value: '华磊-美国专线' }, { label: '云途-全球挂号', value: '云途-全球挂号' }, { label: '燕文-欧洲专线', value: '燕文-欧洲专线' }]} value={channel} onChange={(value) => setChannel(String(value))} width="100%" />
        </ErpFormItem>
        <ErpFormItem label="运单号" required>
          <div className="erp-flex">
            <ErpInput value={trackingNo} onChange={setTrackingNo} placeholder="请输入或申请运单号" />
            <ErpButton onClick={() => setTrackingNo(`YT${Date.now().toString().slice(-10)}`)}>申请运单号</ErpButton>
          </div>
        </ErpFormItem>
      </ErpForm>
    </ErpDialog>
  );
}

export function MergeOrderDialog({ open, orders, onClose, onConfirm }: { open: boolean; orders: Order[]; onClose: () => void; onConfirm: (ids: string[]) => void }) {
  const [selected, setSelected] = useState<string[]>(orders.map((order) => order.id));
  return (
    <ErpDialog
      open={open}
      title="合并订单"
      width={640}
      onClose={onClose}
      footer={
        <>
          <ErpButton onClick={onClose}>取消</ErpButton>
          <ErpButton variant="primary" onClick={() => onConfirm(selected)}>确认合并</ErpButton>
        </>
      }
    >
      <div className="erp-inline-note" style={{ marginBottom: 12 }}>合并后按同一收货地址与物流渠道出库，演示环境仅更新本地状态。</div>
      <div className="erp-stack" style={{ gap: 8 }}>
        {orders.map((order) => (
          <div key={order.id} className="erp-flex-between" style={{ padding: 10, border: '1px solid #EBEEF5', borderRadius: 4 }}>
            <ErpCheckbox checked={selected.includes(order.id)} onChange={(checked) => setSelected((prev) => (checked ? [...prev, order.id] : prev.filter((id) => id !== order.id)))}>
              {order.orderNo}
            </ErpCheckbox>
            <span className="erp-small erp-muted">{order.buyer} · {order.country} · {order.amount} USD</span>
          </div>
        ))}
      </div>
    </ErpDialog>
  );
}

export function LabelingRuleDialog({
  open,
  rule,
  onClose,
  onSave,
}: {
  open: boolean;
  rule: LabelingRule | null;
  onClose: () => void;
  onSave: (rule: LabelingRule) => void;
}) {
  const [name, setName] = useState('');
  const [scope, setScope] = useState<string[]>(['all']);
  const [label, setLabel] = useState('高客单');
  const [priority, setPriority] = useState(1);
  const [enabled, setEnabled] = useState(true);
  const [logic, setLogic] = useState('AND');
  const [conditions, setConditions] = useState<Array<{ field: string; operator: string; value: string }>>([]);

  useEffect(() => {
    if (!open) return;
    setName(rule?.name || '');
    setScope(rule?.scope === '全部店铺' ? ['all'] : rule?.scope.split('、') || ['all']);
    setLabel(rule?.label || '高客单');
    setPriority(rule?.priority || 1);
    setEnabled(rule?.enabled ?? true);
    setConditions(rule?.conditions || [{ field: '国家', operator: '等于', value: '美国' }]);
  }, [open, rule]);

  const fieldOptions = ['订单状态', '订单金额', '国家', '店铺', '商品标题', '买家历史订单数', '邮编', '物流渠道'].map((value) => ({ label: value, value }));
  const operatorOptions = ['等于', '不等于', '包含', '不包含', '大于等于', '小于等于', '为空'].map((value) => ({ label: value, value }));

  return (
    <ErpDialog
      open={open}
      title={rule ? '编辑自动打标规则' : '新增自动打标规则配置'}
      width={820}
      onClose={onClose}
      footer={
        <>
          <ErpButton onClick={onClose}>取消</ErpButton>
          <ErpButton
            variant="primary"
            onClick={() => {
              if (!name.trim()) {
                erpMessage('请填写规则名称', 'warning');
                return;
              }
              if (!conditions.length) {
                erpMessage('请至少添加一个条件', 'warning');
                return;
              }
              onSave({
                id: rule?.id || `LB${Date.now().toString().slice(-4)}`,
                name,
                summary: conditions.map((condition) => `${condition.field} ${condition.operator} ${condition.value}`).join(logic === 'AND' ? ' 且 ' : ' 或 '),
                label,
                scope: scope.includes('all') ? '全部店铺' : scope.join('、'),
                priority,
                enabled,
                updatedAt: '2026-10-31 10:00:00',
                conditions,
              });
            }}
          >
            保存规则
          </ErpButton>
        </>
      }
    >
      <ErpForm layout="vertical">
        <div className="erp-form-grid">
          <ErpFormItem label="规则名称" required><ErpInput value={name} onChange={setName} placeholder="例如：美国高客单加急标" /></ErpFormItem>
          <ErpFormItem label="适用店铺"><ErpSelect options={[{ label: '全部店铺', value: 'all' }, ...STORE_OPTIONS]} value={scope} onChange={(value) => setScope(value as string[])} multiple width="100%" /></ErpFormItem>
          <ErpFormItem label="标签"><ErpSelect options={['高客单', '老客', '加急', '礼品单', '地址待确认', '风险单'].map((value) => ({ label: value, value }))} value={label} onChange={(value) => setLabel(String(value))} width="100%" /></ErpFormItem>
          <ErpFormItem label="优先级"><ErpInputNumber value={priority} onChange={setPriority} min={1} max={99} /></ErpFormItem>
          <ErpFormItem label="状态"><ErpSwitch checked={enabled} onChange={setEnabled} /></ErpFormItem>
        </div>
        <div className="erp-flex-between" style={{ margin: '4px 0 8px' }}>
          <b style={{ fontSize: 13 }}>触发条件</b>
          <div className="erp-flex">
            <ErpSelect options={[{ label: '满足全部 (AND)', value: 'AND' }, { label: '满足任一 (OR)', value: 'OR' }]} value={logic} onChange={(value) => setLogic(String(value))} width={160} />
            <ErpButton size="small" onClick={() => setConditions((prev) => [...prev, { field: '国家', operator: '等于', value: '' }])}>添加条件</ErpButton>
          </div>
        </div>
        <div className="erp-stack" style={{ gap: 8 }}>
          {conditions.map((condition, index) => (
            <div className="erp-flex" key={`${condition.field}-${index}`}>
              <ErpSelect options={fieldOptions} value={condition.field} onChange={(value) => setConditions((prev) => prev.map((item, i) => (i === index ? { ...item, field: String(value) } : item)))} width={150} />
              <ErpSelect options={operatorOptions} value={condition.operator} onChange={(value) => setConditions((prev) => prev.map((item, i) => (i === index ? { ...item, operator: String(value) } : item)))} width={120} />
              <ErpInput value={condition.value} onChange={(value) => setConditions((prev) => prev.map((item, i) => (i === index ? { ...item, value } : item)))} placeholder="条件值" style={{ flex: 1 }} />
              <ErpButton size="small" variant="danger" onClick={() => setConditions((prev) => prev.filter((_, i) => i !== index))}>删除</ErpButton>
            </div>
          ))}
        </div>
        <div className="erp-inline-note" style={{ marginTop: 12 }}>规则保存后仅对后续新订单生效；已命中规则的历史订单不会自动补标（演示）。</div>
      </ErpForm>
    </ErpDialog>
  );
}
