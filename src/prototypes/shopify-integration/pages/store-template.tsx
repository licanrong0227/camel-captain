import React, { useMemo, useState } from 'react';
import { Select, showToast } from '../components/ui';

type StoreRow = {
  platform: string;
  shop: string;
  group: string;
  freightTpl: string;
  afterSaleTpl: string;
  newPriceTpl: string;
  operator: string;
  time: string;
};

const INITIAL_ROWS: StoreRow[] = [
  { platform: 'dhgate', shop: 'sneakerhub8', group: '-', freightTpl: '8美金运费不包邮', afterSaleTpl: '默认模板', newPriceTpl: '测试模块2', operator: '-', time: '2026-10-09 18:38:59' },
  { platform: 'dhgate', shop: 'clothes', group: '-', freightTpl: '服装模版', afterSaleTpl: '默认模板', newPriceTpl: '测试模块2', operator: '吃的请问', time: '2026-10-20 10:47:32' },
  { platform: 'dhgate', shop: '鞋子', group: '-', freightTpl: '包包', afterSaleTpl: '默认模板', newPriceTpl: '刘雁测试', operator: '-', time: '2026-09-18 10:05:09' },
  { platform: 'dhgate', shop: '包包', group: '-', freightTpl: '免运费的模版', afterSaleTpl: '默认模板', newPriceTpl: '-', operator: '-', time: '2026-09-18 10:10:03' },
  { platform: 'shopify', shop: 'camel-captain', group: '-', freightTpl: '-', afterSaleTpl: '-', newPriceTpl: 'Shopify 上新价模板', operator: '-', time: '2026-10-21 09:12:44' },
  { platform: 'shopify', shop: 'camel-outlet', group: '-', freightTpl: '-', afterSaleTpl: '-', newPriceTpl: '测试模块2', operator: '吃的请问', time: '2026-10-20 15:02:18' },
  { platform: 'shopify', shop: 'camel-home', group: '-', freightTpl: '-', afterSaleTpl: '-', newPriceTpl: '-', operator: '-', time: '2026-10-18 11:26:07' },
];

const PLATFORM_LABELS: Record<string, string> = { dhgate: '敦煌网', shopify: 'Shopify' };
const PLATFORM_OPTIONS = Object.keys(PLATFORM_LABELS).map((v) => ({ label: PLATFORM_LABELS[v], value: v }));
const FREIGHT_OPTIONS = ['8美金运费不包邮', '服装模版', '包包', '免运费的模版', '海外仓包邮模版'].map((v) => ({ label: v, value: v }));
const AFTERSALE_OPTIONS = ['默认模板', '7天无理由退换', '仅退款模板'].map((v) => ({ label: v, value: v }));
const NEW_PRICE_OPTIONS = ['测试模块2', '刘雁测试', '测试模版', 'Shopify 上新价模板', 'hi', 'hello'].map((v) => ({ label: v, value: v }));
const SHOP_OPTIONS = INITIAL_ROWS.map((r) => ({ label: r.shop, value: r.shop }));

function nowText() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

export default function StoreTemplatePage() {
  const [rows, setRows] = useState(INITIAL_ROWS);
  const [platform, setPlatform] = useState('');
  const [shop, setShop] = useState('');
  const [freight, setFreight] = useState('');
  const [applied, setApplied] = useState<{ platform: string; shop: string; freight: string }>({ platform: '', shop: '', freight: '' });

  const shown = useMemo(() => rows.filter((r) =>
    (!applied.platform || r.platform === applied.platform)
    && (!applied.shop || r.shop.includes(applied.shop))
    && (!applied.freight || r.freightTpl.includes(applied.freight))
  ), [rows, applied]);

  const update = (shopName: string, patch: Partial<StoreRow>) => {
    setRows((rs) => rs.map((r) => (r.shop === shopName ? { ...r, ...patch, operator: '测试账号234', time: nowText() } : r)));
    showToast('已保存');
  };

  return (
    <div className="bcp-card">
      <div className="bcp-toolbar">
        <div className="bcp-toolbar__left">
          <span className="bcp-toolbar__label">平台</span>
          <Select value={platform} options={PLATFORM_OPTIONS} placeholder="请选择平台" onChange={(v) => setPlatform(String(v))} width={140} />
          <span className="bcp-toolbar__label">店铺名称</span>
          <Select value={shop} options={SHOP_OPTIONS} placeholder="请选择店铺" onChange={(v) => setShop(String(v))} width={200} />
          <span className="bcp-toolbar__label">运费模版</span>
          <input className="bcp-input" style={{ width: 200 }} placeholder="请输入运费模版" value={freight} onChange={(e) => setFreight(e.target.value)} />
          <button type="button" className="bcp-btn bcp-btn--primary" onClick={() => setApplied({ platform, shop, freight })}>
            <svg width="12" height="12" viewBox="0 0 12 12"><circle cx="5" cy="5" r="3.4" fill="none" stroke="currentColor" strokeWidth="1.4" /><path d="M7.8 7.8L11 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
            搜索
          </button>
          <button type="button" className="bcp-btn" onClick={() => { setPlatform(''); setShop(''); setFreight(''); setApplied({ platform: '', shop: '', freight: '' }); }}>
            <svg width="12" height="12" viewBox="0 0 12 12"><path d="M10 6a4 4 0 1 1-1.2-2.85M10 1.5V4H7.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            重置
          </button>
        </div>
      </div>

      <table className="bcp-table">
        <thead>
          <tr><th>平台</th><th>店铺名称</th><th>店铺分组</th><th data-annotation-id="store-freight-tpl-shopify">运费模版</th><th>售后服务模版</th><th data-annotation-id="store-new-price-col">上新定价模板</th><th>操作人</th><th>操作时间</th></tr>
        </thead>
        <tbody>
          {shown.map((r) => (
            <tr key={r.shop}>
              <td>{PLATFORM_LABELS[r.platform] ?? r.platform}</td>
              <td>{r.shop}</td>
              <td>{r.group}</td>
              <td>{r.platform === 'shopify' ? '-' : <Select className="bcp-select--cell" value={r.freightTpl} options={FREIGHT_OPTIONS} placeholder="请选择运费模版" onChange={(v) => update(r.shop, { freightTpl: String(v) })} />}</td>
              <td>{r.platform === 'shopify' ? '-' : <Select className="bcp-select--cell" value={r.afterSaleTpl} options={AFTERSALE_OPTIONS} placeholder="请选择售后服务模版" onChange={(v) => update(r.shop, { afterSaleTpl: String(v) })} />}</td>
              <td><Select className="bcp-select--cell" value={r.newPriceTpl} options={NEW_PRICE_OPTIONS} placeholder="请选择上新定价模板" onChange={(v) => update(r.shop, { newPriceTpl: String(v) })} /></td>
              <td>{r.operator}</td>
              <td>{r.time}</td>
            </tr>
          ))}
          {shown.length === 0 ? <tr><td colSpan={8} className="bcp-empty">暂无数据</td></tr> : null}
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
    </div>
  );
}
