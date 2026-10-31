import React, { useMemo, useState } from 'react';
import { Field, Modal, SectionTitle, Select, showToast } from '../components/ui';

export type NewArrivalRow = {
  name: string;
  type: '公共' | '专属';
  platform: string;
  stores: string;
  operator: string;
  time: string;
};

const INITIAL_ROWS: NewArrivalRow[] = [
  { name: '测试模块2', type: '公共', platform: 'dhgate', stores: 'sneakerhub8、clothes、鞋子、包包', operator: '吃的请问', time: '2026-10-22 09:27:03' },
  { name: '刘雁测试', type: '公共', platform: 'dhgate', stores: 'sneakerhub8、clothes、鞋子、包包', operator: '吃的请问', time: '2026-10-22 09:27:15' },
  { name: '测试模版', type: '专属', platform: 'dhgate', stores: '-', operator: '测试账号234', time: '2026-07-01 18:44:41' },
  { name: 'hi', type: '专属', platform: 'dhgate', stores: '-', operator: '测试账号234', time: '2026-06-29 14:53:44' },
  { name: 'hello', type: '专属', platform: 'dhgate', stores: '-', operator: '测试账号234', time: '2026-06-26 16:15:44' },
];

const SHOP_OPTIONS = ['sneakerhub8', 'clothes', '鞋子', '包包'].map((s) => ({ label: s, value: s }));
const PLATFORM_OPTIONS = [{ label: '敦煌网', value: '敦煌网' }];
const CHANNEL_TPL_OPTIONS = ['LAK-美国标准专线（普＋特）-HP', '燕文精品追踪--普货', '测试模版33', '测试渠道'].map((s) => ({ label: s, value: s }));
const PURCHASE_MODE_OPTIONS = [
  { label: '采集价', value: 'collect' },
  { label: '固定价', value: 'fixed' },
  { label: '采集价折扣', value: 'discount' },
];
const CURRENCY_OPTIONS = [
  { label: 'USD', value: 'USD' },
  { label: 'RMB', value: 'RMB' },
];
const EXTRA_FORMULA_OPTIONS = [
  { label: '固定成本', value: 'fixed' },
  { label: '百分比', value: 'percent' },
];

type ExtraCost = {
  id: string;
  name: string;
  formula: 'fixed' | 'percent';
  amount: string;
  currency: 'USD' | 'RMB';
  percent: string;
  rateMode: 'realtime' | 'fixed';
  rate: string;
};

function nowText() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function Stepper(props: { value: string; onChange: (v: string) => void; step?: number; digits?: number; width?: number }) {
  const num = Number(props.value);
  const fmt = (n: number) => n.toFixed(props.digits ?? 2);
  return (
    <span className="bcp-stepper" style={props.width ? { width: props.width } : undefined}>
      <button type="button" onClick={() => props.onChange(fmt((Number.isFinite(num) ? num : 0) - (props.step ?? 1)))}>−</button>
      <input value={props.value} onChange={(e) => props.onChange(e.target.value)} />
      <button type="button" onClick={() => props.onChange(fmt((Number.isFinite(num) ? num : 0) + (props.step ?? 1)))}>＋</button>
    </span>
  );
}

function RateRadio(props: { mode: 'realtime' | 'fixed'; onMode: (m: 'realtime' | 'fixed') => void; value: string; onChange: (v: string) => void }) {
  return (
    <span className="bcp-rate-cell">
      <span className="bcp-radios">
        <label><input type="radio" checked={props.mode === 'realtime'} onChange={() => props.onMode('realtime')} /><span>实时汇率</span></label>
        <label><input type="radio" checked={props.mode === 'fixed'} onChange={() => props.onMode('fixed')} /><span>固定汇率</span></label>
      </span>
      {props.mode === 'fixed' ? <Stepper value={props.value} onChange={props.onChange} step={0.0001} digits={4} width={118} /> : null}
    </span>
  );
}

type Key = 'purchase' | 'domestic' | 'intl' | 'shopDiscount' | 'platformLoss' | 'commission' | 'withdrawFee' | 'profit' | 'buyerShipping';

const TOKENS: { key: Key; token: string }[] = [
  { key: 'purchase', token: '#采购成本#' },
  { key: 'domestic', token: '#国内物流成本#' },
  { key: 'intl', token: '#国际物流成本#' },
  { key: 'shopDiscount', token: '#店铺折扣#' },
  { key: 'platformLoss', token: '#平台活动折扣损耗#' },
  { key: 'commission', token: '#平台佣金率#' },
  { key: 'withdrawFee', token: '#平台提现手续费率#' },
  { key: 'profit', token: '#利润率#' },
  { key: 'buyerShipping', token: '#买家运费#' },
];

function AddNewArrivalDialog(props: { onClose: () => void; onSubmit: (row: NewArrivalRow) => void }) {
  const [name, setName] = useState('');
  const [tplType, setTplType] = useState<'公共' | '专属'>('专属');
  const [platform, setPlatform] = useState('敦煌网');
  const [stores, setStores] = useState<string[]>([]);
  const [checked, setChecked] = useState<Record<Key, boolean>>({
    purchase: true, domestic: true, intl: true,
    shopDiscount: true, platformLoss: true,
    commission: true, withdrawFee: true, profit: true,
    buyerShipping: true,
  });
  const [intlMode, setIntlMode] = useState<'channel' | 'fixed'>('channel');
  const [intlFixedCost, setIntlFixedCost] = useState('10.00');
  const [weightBasis, setWeightBasis] = useState<'weight' | 'packed'>('weight');
  const [packedExtra, setPackedExtra] = useState('0.02');
  const [channelTpl, setChannelTpl] = useState('');
  const [domesticCost, setDomesticCost] = useState('4.00');
  const [domesticRateMode, setDomesticRateMode] = useState<'realtime' | 'fixed'>('fixed');
  const [domesticRate, setDomesticRate] = useState('7.0000');
  const [intlRateMode, setIntlRateMode] = useState<'realtime' | 'fixed'>('fixed');
  const [intlRate, setIntlRate] = useState('7.0000');
  const [shopDiscount, setShopDiscount] = useState('0.5000');
  const [platformLoss, setPlatformLoss] = useState('0.0100');
  const [commission, setCommission] = useState('0.0500');
  const [withdrawFee, setWithdrawFee] = useState('0.0100');
  const [profit, setProfit] = useState('0.4000');
  const [buyerShipping, setBuyerShipping] = useState('5.00');
  const [extraCosts, setExtraCosts] = useState<ExtraCost[]>([]);

  const addExtraCost = () => {
    setExtraCosts((list) => [
      ...list,
      { id: `extra-${Date.now()}`, name: '', formula: 'fixed', amount: '0.00', currency: 'RMB', percent: '0.1000', rateMode: 'fixed', rate: '7.0000' },
    ]);
  };
  const updateExtraCost = (id: string, patch: Partial<ExtraCost>) => {
    setExtraCosts((list) => list.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };
  const removeExtraCost = (id: string) => {
    setExtraCosts((list) => list.filter((c) => c.id !== id));
  };
  const [purchaseMode, setPurchaseMode] = useState<'collect' | 'fixed' | 'discount'>('collect');
  const [purchasePrice, setPurchasePrice] = useState('0.00');
  const [purchaseCurrency, setPurchaseCurrency] = useState<'USD' | 'RMB'>('USD');
  const [purchaseDiscount, setPurchaseDiscount] = useState('0.9000');
  const [purchaseRateMode, setPurchaseRateMode] = useState<'realtime' | 'fixed'>('fixed');
  const [purchaseRate, setPurchaseRate] = useState('7.0000');
  const [formula, setFormula] = useState('');
  const [preview, setPreview] = useState(false);

  const on = (k: Key) => checked[k];
  const toggle = (k: Key) => setChecked((c) => ({ ...c, [k]: !c[k] }));
  const formulaRef = React.createRef<HTMLTextAreaElement>();

  const insertToken = (t: string) => {
    setFormula((f) => f + t);
  };

  const submit = () => {
    if (!name.trim()) { showToast('请输入模版名称'); return; }
    if (!formula.trim()) { showToast('请输入定价公式'); return; }
    props.onSubmit({ name: name.trim(), type: tplType, platform: 'dhgate', stores: '-', operator: '测试账号234', time: nowText() });
    showToast('新增成功');
  };

  const summary = useMemo(() => (
    <ul className="bcp-preview-list">
      <li><span>模版名称</span>{name || '-'}</li>
      <li><span>模版类型</span>{tplType}</li>
      {/* <li><span>平台</span>{platform}</li>
      <li><span>店铺名称</span>{stores.join('、') || '-'}</li> */}
      {on('purchase') ? (
        <li><span>采购成本</span>{purchaseMode === 'collect' ? '变量 · 采集价' : purchaseMode === 'fixed' ? `常量 · 固定价 ${purchasePrice} ${purchaseCurrency}` : `变量 · 采集价折扣 ${purchaseDiscount}（小数）`}</li>
      ) : null}
      {on('domestic') ? <li><span>国内物流成本</span>常量 {domesticCost}</li> : null}
      {on('intl') ? <li><span>国际物流成本</span>{intlMode === 'channel' ? `变量 · 渠道定价${channelTpl ? `（${channelTpl}）` : ''} · ${weightBasis === 'weight' ? '产品重量 * 渠道单价 + 挂号费' : `(产品重量 + ${packedExtra}) * 渠道单价 + 挂号费`}` : `常量 · 固定成本 ${intlFixedCost} RMB`}</li> : null}
      {on('shopDiscount') ? <li><span>店铺折扣</span>{shopDiscount}</li> : null}
      {on('platformLoss') ? <li><span>平台活动折扣损耗</span>{platformLoss}</li> : null}
      {on('commission') ? <li><span>平台佣金率</span>{commission}</li> : null}
      {on('withdrawFee') ? <li><span>平台提现手续费率</span>{withdrawFee}</li> : null}
      {on('profit') ? <li><span>利润率</span>{profit}</li> : null}
      {on('buyerShipping') ? <li><span>买家运费</span>{buyerShipping}</li> : null}
      <li><span>定价公式</span>上新价 = {formula || '-'}</li>
    </ul>
  ), [name, tplType, platform, stores, intlMode, intlFixedCost, channelTpl, weightBasis, packedExtra, domesticCost, shopDiscount, platformLoss, commission, withdrawFee, profit, buyerShipping, formula, checked, purchaseMode, purchasePrice, purchaseCurrency, purchaseDiscount]);

  return (
    <Modal
      title="新增上新价配置"
      width={1100}
      onClose={props.onClose}
      footer={
        <>
          <button type="button" className="bcp-btn bcp-btn--primary" onClick={submit}>直接提交</button>
          <button type="button" className="bcp-btn" data-annotation-id="preview-submit">预览提交</button>
          <button type="button" className="bcp-btn" onClick={props.onClose}>取 消</button>
        </>
      }
    >
      <div className="bcp-section-title" data-annotation-id="basic-info-config">基础信息配置</div>
      <Field label="模版名称" required><input className="bcp-input" style={{ width: 320 }} placeholder="请输入模版名称" value={name} onChange={(e) => setName(e.target.value)} /></Field>
      <Field label="模版类型" required>
        <span className="bcp-radios">
          <label><input type="radio" name="tpl-type" checked={tplType === '公共'} onChange={() => setTplType('公共')} /><span>公共</span></label>
          <label><input type="radio" name="tpl-type" checked={tplType === '专属'} onChange={() => setTplType('专属')} /><span>专属</span></label>
        </span>
      </Field>
      <div className="bcp-type-tips">
        <div><i className="bcp-type-tips__icon">i</i>公共：所有子帐号均可使用此模板</div>
        <div><i className="bcp-type-tips__icon">i</i>专属：仅当前子帐号可见此模板</div>
      </div>
      {/* 配置时无需选择平台和店铺，先隐藏
      <Field label="平台" required><Select value={platform} options={PLATFORM_OPTIONS} onChange={(v) => setPlatform(String(v))} width={220} /></Field>
      <Field label="店铺名称" required>
        <Select value={stores} multiple options={platform ? SHOP_OPTIONS : []} placeholder={platform ? '请选择店铺' : '请先选择平台'} onChange={(v) => setStores(v as string[])} width={420} />
      </Field>
      */}

      <SectionTitle>成本配置</SectionTitle>
      <div className="bcp-check-row">
        <label><input type="checkbox" checked={on('purchase')} onChange={() => toggle('purchase')} /><span data-annotation-id="purchase-cost-label">采购成本</span></label>
        <label><input type="checkbox" checked={on('domestic')} onChange={() => toggle('domestic')} /><span>国内物流成本RMB</span></label>
        <label><input type="checkbox" checked={on('intl')} onChange={() => toggle('intl')} /><span>国际物流成本RMB</span></label>
      </div>
      <table className="bcp-table bcp-table--inset">
        <colgroup><col style={{ width: '16%' }} /><col style={{ width: '13%' }} /><col style={{ width: '41%' }} /><col style={{ width: '30%' }} /></colgroup>
        <thead><tr><th>成本类型</th><th>变量/常量</th><th>公式</th><th>汇率转换成USD</th></tr></thead>
        <tbody>
          {on('purchase') ? (
            <tr>
              <td>采购成本</td>
              <td>变量/常量</td>
              <td>
                <Select value={purchaseMode} options={PURCHASE_MODE_OPTIONS} onChange={(v) => setPurchaseMode(v as 'collect' | 'fixed' | 'discount')} width={150} />
                {purchaseMode === 'fixed' ? (
                  <div className="bcp-formula-line">
                    <span className="bcp-unit">
                      <Stepper value={purchasePrice} onChange={setPurchasePrice} step={0.01} width={110} />
                      <Select value={purchaseCurrency} options={CURRENCY_OPTIONS} onChange={(v) => setPurchaseCurrency(v as 'USD' | 'RMB')} width={80} />
                    </span>
                  </div>
                ) : null}
                {purchaseMode === 'discount' ? (
                  <div className="bcp-formula-line">
                    <span className="bcp-unit"><Stepper value={purchaseDiscount} onChange={setPurchaseDiscount} step={0.01} digits={4} width={110} />（小数）</span>
                  </div>
                ) : null}
              </td>
              <td>
                {purchaseMode === 'fixed' && purchaseCurrency === 'USD' ? (
                  <span className="bcp-cell-muted">-</span>
                ) : (
                  <>
                    <RateRadio mode={purchaseRateMode} onMode={setPurchaseRateMode} value={purchaseRate} onChange={setPurchaseRate} />
                    {purchaseMode === 'fixed' ? null : <div className="bcp-cell-hint">仅在采集价为RMB时生效</div>}
                  </>
                )}
              </td>
            </tr>
          ) : null}
          {on('domestic') ? (
            <tr>
              <td>国内物流成本</td><td>常量</td>
              <td><span className="bcp-unit"><Stepper value={domesticCost} onChange={setDomesticCost} step={0.01} width={118} />RMB</span></td>
              <td><RateRadio mode={domesticRateMode} onMode={setDomesticRateMode} value={domesticRate} onChange={setDomesticRate} /></td>
            </tr>
          ) : null}
          {on('intl') ? (
            <tr>
              <td>国际物流成本</td><td>变量/常量</td>
              <td data-annotation-id="intl-cost-formula">
                <div className="bcp-formula-line" style={{ marginTop: 0 }}>
                  <span className="bcp-radios">
                    <label><input type="radio" name="intl-mode" checked={intlMode === 'channel'} onChange={() => setIntlMode('channel')} /><span>渠道定价</span></label>
                    <label><input type="radio" name="intl-mode" checked={intlMode === 'fixed'} onChange={() => setIntlMode('fixed')} /><span>固定成本</span></label>
                  </span>
                </div>
                {intlMode === 'channel' ? (
                  <>
                    <div className="bcp-formula-line">
                      <Select value={channelTpl} options={CHANNEL_TPL_OPTIONS} placeholder="请选择渠道模板" onChange={(v) => setChannelTpl(String(v))} width={220} />
                    </div>
                    <div className="bcp-formula-line">
                      <span className="bcp-radios">
                        <label><input type="radio" name="intl-weight" checked={weightBasis === 'weight'} onChange={() => setWeightBasis('weight')} /><span>产品重量</span></label>
                        <label><input type="radio" name="intl-weight" checked={weightBasis === 'packed'} onChange={() => setWeightBasis('packed')} /><span>产品包装后重量</span></label>
                      </span>
                    </div>
                    <div className="bcp-formula-line bcp-formula-expr">
                      {weightBasis === 'weight' ? (
                        <span className="bcp-formula-expr__line">产品重量 * 渠道单价 + 挂号费</span>
                      ) : (
                        <span className="bcp-formula-expr__line">(产品重量 + <Stepper value={packedExtra} onChange={setPackedExtra} step={0.01} width={68} />) * 渠道单价 + 挂号费</span>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="bcp-formula-line">
                    <span className="bcp-unit"><Stepper value={intlFixedCost} onChange={setIntlFixedCost} step={0.01} width={110} />RMB</span>
                  </div>
                )}
              </td>
              <td><RateRadio mode={intlRateMode} onMode={setIntlRateMode} value={intlRate} onChange={setIntlRate} /></td>
            </tr>
          ) : null}
          {!on('purchase') && !on('domestic') && !on('intl') ? <tr><td colSpan={4} className="bcp-empty">请勾选成本项</td></tr> : null}
        </tbody>
      </table>

      <SectionTitle>活动折扣</SectionTitle>
      <div className="bcp-check-row">
        <label><input type="checkbox" checked={on('shopDiscount')} onChange={() => toggle('shopDiscount')} /><span>店铺折扣</span></label>
        <label><input type="checkbox" checked={on('platformLoss')} onChange={() => toggle('platformLoss')} /><span>平台活动折扣损耗</span></label>
      </div>
      <table className="bcp-table bcp-table--inset">
        <thead><tr><th>成本类型</th><th>变量/常量</th><th data-annotation-id="discount-formula-col">公式</th></tr></thead>
        <tbody>
          {on('shopDiscount') ? <tr><td>店铺折扣</td><td>常量</td><td><span className="bcp-unit" data-annotation-id="price-formula-unit"><Stepper value={shopDiscount} onChange={setShopDiscount} step={0.0001} digits={4} width={118} />（小数）</span></td></tr> : null}
          {on('platformLoss') ? <tr><td>平台活动折扣损耗</td><td>常量</td><td><span className="bcp-unit"><Stepper value={platformLoss} onChange={setPlatformLoss} step={0.0001} digits={4} width={118} />（小数）</span></td></tr> : null}
          {!on('shopDiscount') && !on('platformLoss') ? <tr><td colSpan={3} className="bcp-empty">请勾选折扣项</td></tr> : null}
        </tbody>
      </table>

      <SectionTitle>费率配置</SectionTitle>
      <div className="bcp-check-row">
        <label><input type="checkbox" checked={on('commission')} onChange={() => toggle('commission')} /><span>平台佣金率</span></label>
        <label><input type="checkbox" checked={on('withdrawFee')} onChange={() => toggle('withdrawFee')} /><span>平台提现手续费率</span></label>
        <label><input type="checkbox" checked={on('profit')} onChange={() => toggle('profit')} /><span>利润率</span></label>
      </div>
      <table className="bcp-table bcp-table--inset">
        <thead><tr><th>费率类型</th><th>变量/常量</th><th data-annotation-id="rate-formula-col">公式</th></tr></thead>
        <tbody>
          {on('commission') ? <tr><td>平台佣金率</td><td>常量</td><td><span className="bcp-unit"><Stepper value={commission} onChange={setCommission} step={0.0001} digits={4} width={118} />（小数）</span></td></tr> : null}
          {on('withdrawFee') ? <tr><td>平台提现手续费率</td><td>常量</td><td><span className="bcp-unit"><Stepper value={withdrawFee} onChange={setWithdrawFee} step={0.0001} digits={4} width={118} />（小数）</span></td></tr> : null}
          {on('profit') ? <tr><td>利润率</td><td>常量</td><td><span className="bcp-unit"><Stepper value={profit} onChange={setProfit} step={0.0001} digits={4} width={118} />（小数）</span></td></tr> : null}
          {!on('commission') && !on('withdrawFee') && !on('profit') ? <tr><td colSpan={3} className="bcp-empty">请勾选费率项</td></tr> : null}
        </tbody>
      </table>

      <SectionTitle>其他</SectionTitle>
      <div className="bcp-check-row">
        <label><input type="checkbox" checked={on('buyerShipping')} onChange={() => toggle('buyerShipping')} /><span>买家运费</span></label>
      </div>
      <table className="bcp-table bcp-table--inset">
        <thead><tr><th>成本类型</th><th>变量/常量</th><th data-annotation-id="other-formula-col">公式</th></tr></thead>
        <tbody>
          {on('buyerShipping') ? <tr><td>买家运费</td><td>常量</td><td><span className="bcp-unit"><Stepper value={buyerShipping} onChange={setBuyerShipping} step={0.01} width={118} />RMB</span></td></tr> : null}
        </tbody>
      </table>

      <SectionTitle>自定义成本</SectionTitle>
      <table className="bcp-table bcp-table--inset">
        <thead><tr><th>成本类型</th><th>变量/常量</th><th>公式</th><th>汇率转换成USD</th></tr></thead>
        <tbody>
          {extraCosts.length === 0 ? <tr><td colSpan={4} className="bcp-empty">暂无自定义成本</td></tr> : null}
          {extraCosts.map((c) => (
            <tr key={c.id}>
              <td>
                <div className="bcp-extra-name">
                  <button type="button" className="bcp-extra-remove" aria-label="移除" title="移除" onClick={() => removeExtraCost(c.id)}>
                    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M1 5h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
                  </button>
                  <input
                    className="bcp-input"
                    style={{ width: 150 }}
                    value={c.name}
                    placeholder="请输入成本类型"
                    onChange={(e) => updateExtraCost(c.id, { name: e.target.value })}
                  />
                </div>
              </td>
              <td>常量</td>
              <td>
                <Select
                  value={c.formula}
                  options={EXTRA_FORMULA_OPTIONS}
                  onChange={(v) => updateExtraCost(c.id, { formula: v as 'fixed' | 'percent' })}
                  width={150}
                />
                {c.formula === 'fixed' ? (
                  <div className="bcp-formula-line">
                    <span className="bcp-unit">
                      <Stepper value={c.amount} onChange={(v) => updateExtraCost(c.id, { amount: v })} step={0.01} width={110} />
                      <Select value={c.currency} options={CURRENCY_OPTIONS} onChange={(v) => updateExtraCost(c.id, { currency: v as 'USD' | 'RMB' })} width={80} />
                    </span>
                  </div>
                ) : (
                  <div className="bcp-formula-line">
                    <span className="bcp-unit">
                      <Stepper value={c.percent} onChange={(v) => updateExtraCost(c.id, { percent: v })} step={0.01} digits={4} width={110} />（小数）
                    </span>
                  </div>
                )}
              </td>
              <td>
                {c.formula === 'fixed' && c.currency === 'RMB' ? (
                  <RateRadio mode={c.rateMode} onMode={(m) => updateExtraCost(c.id, { rateMode: m })} value={c.rate} onChange={(v) => updateExtraCost(c.id, { rate: v })} />
                ) : (
                  <span className="bcp-cell-muted">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="bcp-table-actions">
        <button type="button" className="bcp-link" onClick={addExtraCost}>+ 新增成本类型</button>
      </div>

      <SectionTitle extra="公式只能包含上面勾选的字段，即下面的蓝色字段">定价公式配置</SectionTitle>
      <Field label="公式设置" required labelWidth={90}>
        <span className="bcp-formula">
          <span className="bcp-formula__prefix">上新价 =</span>
          <textarea ref={formulaRef} className="bcp-input bcp-textarea" rows={2} placeholder="请输入定价公式" value={formula} onChange={(e) => setFormula(e.target.value)} />
        </span>
      </Field>
      <div className="bcp-token-row">
        {TOKENS.filter((t) => on(t.key)).map((t) => (
          <button type="button" key={t.key} className="bcp-token" onClick={() => insertToken(t.token)}>{t.token}</button>
        ))}
      </div>

      {preview ? (
        <Modal title="配置预览" width={560} onClose={() => setPreview(false)} footer={<button type="button" className="bcp-btn bcp-btn--primary" onClick={() => setPreview(false)}>知道了</button>}>
          {summary}
        </Modal>
      ) : null}
    </Modal>
  );
}

export default function NewArrivalPage() {
  const [rows, setRows] = useState(INITIAL_ROWS);
  const [shop, setShop] = useState('');
  const [tpl, setTpl] = useState('');
  const [applied, setApplied] = useState<{ shop: string; tpl: string }>({ shop: '', tpl: '' });
  const [dialogOpen, setDialogOpen] = useState(false);

  const shown = useMemo(() => rows.filter((r) =>
    (!applied.shop || r.stores.includes(applied.shop) || (applied.shop === '-' && r.stores === '-'))
    && (!applied.tpl || r.name.includes(applied.tpl))
  ), [rows, applied]);

  return (
    <div className="bcp-card">
      <div className="bcp-toolbar">
        <div className="bcp-toolbar__left" data-annotation-id="new-arrival-list-toolbar">
          {/* 列表页不再按店铺筛选，先隐藏
          <span className="bcp-toolbar__label">店铺名称</span>
          <Select value={shop} options={SHOP_OPTIONS} placeholder="请选择店铺" onChange={(v) => setShop(String(v))} width={200} />
          */}
          <span className="bcp-toolbar__label">定价模版</span>
          <input className="bcp-input" style={{ width: 200 }} placeholder="请输入定价模版" value={tpl} onChange={(e) => setTpl(e.target.value)} />
          <button type="button" className="bcp-btn bcp-btn--primary" onClick={() => setApplied({ shop, tpl })}>
            <svg width="12" height="12" viewBox="0 0 12 12"><circle cx="5" cy="5" r="3.4" fill="none" stroke="currentColor" strokeWidth="1.4" /><path d="M7.8 7.8L11 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
            搜索
          </button>
          <button type="button" className="bcp-btn" onClick={() => { setShop(''); setTpl(''); setApplied({ shop: '', tpl: '' }); }}>
            <svg width="12" height="12" viewBox="0 0 12 12"><path d="M10 6a4 4 0 1 1-1.2-2.85M10 1.5V4H7.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            重置
          </button>
          <button type="button" className="bcp-btn" onClick={() => setDialogOpen(true)}>
            <svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 1.5v9M1.5 6h9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
            新增
          </button>
        </div>
      </div>

      <table className="bcp-table">
        <thead>
          <tr><th>上新价模版名称</th>{/* 先隐藏 <th>适用平台</th><th>关联店铺</th> */}<th data-annotation-id="new-arrival-type-col">模板类型</th><th>操作人</th><th>操作时间</th></tr>
        </thead>
        <tbody>
          {shown.map((r) => (
            <tr key={`${r.name}-${r.time}`}>
              <td>{r.name}</td>{/* 先隐藏 <td>{r.platform}</td><td>{r.stores}</td> */}<td>{r.type}</td><td>{r.operator}</td><td>{r.time}</td>
            </tr>
          ))}
          {shown.length === 0 ? <tr><td colSpan={4} className="bcp-empty">暂无数据</td></tr> : null}
        </tbody>
      </table>

      <div className="bcp-pagination">
        <span className="bcp-pagination__total">共 {shown.length} 条</span>
        <span className="bcp-pagination__size">10条/页</span>
        <button type="button" className="bcp-page-btn" disabled>‹</button>
        <button type="button" className="bcp-page-btn is-active">1</button>
        <button type="button" className="bcp-page-btn" disabled>›</button>
        <span className="bcp-pagination__jump">前往 1 页</span>
      </div>

      {dialogOpen ? (
        <AddNewArrivalDialog
          onClose={() => setDialogOpen(false)}
          onSubmit={(row) => { setRows((rs) => [row, ...rs]); setDialogOpen(false); }}
        />
      ) : null}
    </div>
  );
}
