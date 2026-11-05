import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { productSkuRows, type ProductRankMetric, type RankRow } from '../data/aggregate';
import { fmtInt, fmtMoney } from '../data/format';
import type { StorePeriodKey } from '../data/types';
import { Segmented } from './Segmented';

type SpecDimension = 'combo' | 'color' | 'size' | 'pattern';
type SkuMetric = ProductRankMetric;

interface AggRow {
  key: string;
  label: string;
  qty: number;
  gmv: number;
  orders: number;
}

const DIMENSION_LABEL: Record<Exclude<SpecDimension, 'combo'>, string> = {
  color: '颜色',
  size: '尺码',
  pattern: '图案',
};

const EMPTY_VALUE: Record<Exclude<SpecDimension, 'combo'>, string> = {
  color: '无颜色',
  size: '默认',
  pattern: '无图案',
};

export function ProductSkuDialog({
  row,
  period,
  onClose,
}: {
  row: RankRow;
  period: StorePeriodKey;
  onClose: () => void;
}) {
  const [metric, setMetric] = useState<SkuMetric>('qty');
  const [dimension, setDimension] = useState<SpecDimension>('combo');

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const skus = useMemo(
    () => (row.itemcode ? productSkuRows(row.itemcode, period).filter((sku) => sku.qty > 0) : []),
    [row.itemcode, period],
  );

  const dimensions = useMemo(() => {
    const options: Array<{ key: SpecDimension; label: string }> = [{ key: 'combo', label: '组合' }];
    (['color', 'size', 'pattern'] as const).forEach((field) => {
      const distinct = new Set(skus.map((sku) => sku[field]).filter(Boolean));
      const available = field === 'pattern' ? distinct.size >= 2 : distinct.size >= 1;
      if (available) options.push({ key: field, label: DIMENSION_LABEL[field] });
    });
    return options;
  }, [skus]);

  const rows = useMemo<AggRow[]>(() => {
    if (dimension === 'combo') {
      return skus.map((sku) => {
        const parts: string[] = [];
        if (sku.color) parts.push(`颜色:${sku.color}`);
        if (sku.size) parts.push(`尺码:${sku.size}`);
        return {
          key: sku.id,
          label: parts.join(' ') || '默认规格',
          qty: sku.qty,
          gmv: sku.gmv,
          orders: sku.orders,
        };
      });
    }
    const groups = new Map<string, AggRow>();
    skus.forEach((sku) => {
      const value = sku[dimension] || EMPTY_VALUE[dimension];
      const label = `${DIMENSION_LABEL[dimension]}:${value}`;
      const current = groups.get(label) ?? { key: label, label, qty: 0, gmv: 0, orders: 0 };
      current.qty += sku.qty;
      current.gmv += sku.gmv;
      current.orders += sku.orders;
      groups.set(label, current);
    });
    return Array.from(groups.values());
  }, [skus, dimension]);

  const sorted = useMemo(
    () => [...rows].sort((a, b) => {
      const left = metric === 'qty' ? a.qty : metric === 'gmv' ? a.gmv : a.orders;
      const right = metric === 'qty' ? b.qty : metric === 'gmv' ? b.gmv : b.orders;
      return right - left || a.label.localeCompare(b.label);
    }),
    [rows, metric],
  );

  const sortMark = (key: SkuMetric) => (metric === key ? '↓' : '↕');

  return createPortal(
    <div className="hd-modal-mask hd-sku-mask" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="hd-modal hd-sku-dialog" role="dialog" aria-modal="true" aria-label="出单 SKU 明细">
        <div className="hd-sku-header">
          <div className="hd-sku-title-wrap">
            <span className="hd-sku-title">出单 SKU · {row.name}</span>
            <span className="hd-sku-subtitle">{row.itemcode} · 共 {skus.length} 个出单 SKU</span>
          </div>
          <button type="button" className="hd-excl-close" onClick={onClose} aria-label="关闭"><X size={18} /></button>
        </div>

        {dimensions.length > 1 ? (
          <div className="hd-sku-toolbar">
            <Segmented value={dimension} options={dimensions} onChange={setDimension} />
          </div>
        ) : null}

        <div className="hd-sku-body">
          <table className="hd-sku-table">
            <thead>
              <tr>
                <th className="is-rank">排名</th>
                <th>规格</th>
                <th className="is-num" onClick={() => setMetric('qty')}>销量 {sortMark('qty')}</th>
                <th className="is-num" onClick={() => setMetric('gmv')}>销售额 {sortMark('gmv')}</th>
                <th className="is-num" onClick={() => setMetric('orders')}>订单数 {sortMark('orders')}</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((item, index) => (
                <tr key={item.key}>
                  <td className="is-rank">{index + 1}</td>
                  <td>{item.label}</td>
                  <td className={`is-num${metric === 'qty' ? ' is-active' : ''}`}>{fmtInt(item.qty)}</td>
                  <td className={`is-num${metric === 'gmv' ? ' is-active' : ''}`}>{fmtMoney(item.gmv)}</td>
                  <td className={`is-num${metric === 'orders' ? ' is-active' : ''}`}>{fmtInt(item.orders)}</td>
                </tr>
              ))}
              {sorted.length === 0 ? (
                <tr><td colSpan={5} className="hd-sku-empty">当前区间没有出单 SKU</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>,
    document.body,
  );
}
