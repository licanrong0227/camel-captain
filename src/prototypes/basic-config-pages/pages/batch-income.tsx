import React, { useState } from 'react';
import { Modal, Select } from '../components/ui';

const COLORS = [
  'F113-S【3600mAh-Black-High-Speed Handheld Fan】☆ Purchased by 10,000+',
  'F113-S【3600mAh-Purple-High-Speed Handheld Fan】☆ Custom Order Minimum 2K',
];

const SIZES = ['195*90*35mm'];

const OPS: { label: string; value: string }[] = [
  { label: '替换', value: 'replace' },
  { label: '加', value: 'add' },
  { label: '减', value: 'sub' },
  { label: '乘', value: 'mul' },
  { label: '除', value: 'div' },
  { label: '清空', value: 'clear' },
  { label: '价格模板', value: 'template' },
];

const PRICE_TEMPLATES = [
  '测试模版33',
  'LAK-美国标准专线（普＋特）-HP',
  '燕文精品追踪--普货',
  '测试模版3',
  '测试模版2',
  '测试渠道',
];

function BatchIncomeDialog(props: { onClose: () => void }) {
  const [op, setOp] = useState('replace');
  const [value, setValue] = useState('');
  const [template, setTemplate] = useState('');
  const [colorChecked, setColorChecked] = useState<string[]>(COLORS);
  const [sizeChecked, setSizeChecked] = useState<string[]>(SIZES);

  const toggle = (list: string[], set: (v: string[]) => void, v: string) => {
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  };

  return (
    <Modal
      title="批量修改实际收入"
      width={600}
      onClose={props.onClose}
      overlayClassName="bcp-overlay--center bcp-overlay--soft"
      dialogClassName="bcp-dialog--fit"
      bodyClassName="bcp-dialog__body--batch"
      footerClassName="bcp-dialog__footer--center"
      footer={
        <>
          <button type="button" className="bcp-btn bcp-btn--ghost-orange" onClick={props.onClose}>取消</button>
          <button type="button" className="bcp-btn bcp-btn--primary" onClick={props.onClose}>确认修改</button>
        </>
      }
    >
      <div className="bcp-bi-section">
        <div className="bcp-bi-header">请输入数值</div>
        <div className="bcp-bi-body">
          <div className="bcp-bi-radios">
            {OPS.map((o) => (
              <label key={o.value}>
                <input type="radio" name="bcp-bi-op" checked={op === o.value} onChange={() => setOp(o.value)} />
                {o.label}
              </label>
            ))}
          </div>
          {op === 'template' ? (
            <Select
              className="bcp-bi-select"
              placeholder="请选择价格模板"
              options={PRICE_TEMPLATES.map((t) => ({ label: t, value: t }))}
              value={template}
              onChange={(v) => setTemplate(Array.isArray(v) ? v[0] ?? '' : v)}
            />
          ) : (
            <input
              className="bcp-input bcp-bi-value"
              placeholder="请输入数值"
              disabled={op === 'clear'}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          )}
        </div>
      </div>

      <div className="bcp-bi-section">
        <div className="bcp-bi-header">
          <span
            className={`bcp-bi-check${colorChecked.length === COLORS.length ? ' is-on' : ''}`}
            onClick={() => setColorChecked(colorChecked.length ? [] : COLORS)}
          >
            {colorChecked.length === COLORS.length ? '✓' : ''}
          </span>
          颜色
        </div>
        <div className="bcp-bi-body">
          {COLORS.map((c) => (
            <label className="bcp-bi-item" key={c}>
              <input type="checkbox" checked={colorChecked.includes(c)} onChange={() => toggle(colorChecked, setColorChecked, c)} />
              <span className="bcp-bi-item__text">{c}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="bcp-bi-section">
        <div className="bcp-bi-header">
          <span
            className={`bcp-bi-check${sizeChecked.length === SIZES.length ? ' is-on' : ''}`}
            onClick={() => setSizeChecked(sizeChecked.length ? [] : SIZES)}
          >
            {sizeChecked.length === SIZES.length ? '✓' : ''}
          </span>
          尺码
        </div>
        <div className="bcp-bi-body">
          {SIZES.map((s) => (
            <label className="bcp-bi-item" key={s}>
              <input type="checkbox" checked={sizeChecked.includes(s)} onChange={() => toggle(sizeChecked, setSizeChecked, s)} />
              <span className="bcp-bi-item__text">{s}</span>
            </label>
          ))}
        </div>
      </div>
    </Modal>
  );
}

export default function BatchIncomePage() {
  const [open, setOpen] = useState(true);

  if (!open) {
    return (
      <div className="bcp-bi-stage">
        <button type="button" className="bcp-btn bcp-bi-reopen" onClick={() => setOpen(true)}>批量修改实际收入</button>
      </div>
    );
  }

  return (
    <div className="bcp-bi-stage">
      <BatchIncomeDialog onClose={() => setOpen(false)} />
    </div>
  );
}
