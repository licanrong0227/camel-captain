import React, { useMemo, useState } from 'react';
import { productSkuRows } from '../data/aggregate';
import { PRODUCT_MAP, storeNameOf } from '../data/catalog';
import { fmtInt, fmtMoney } from '../data/format';
import type { StorePeriodKey } from '../data/types';
import { EmptyState } from './EmptyState';
import { Segmented } from './Segmented';
import { Sheet } from './Sheet';

type SpecDimension = 'combo' | 'color' | 'size' | 'pattern';

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

interface SkuRow {
  key: string;
  label: string;
  sub: string;
  image?: string;
  qty: number;
  gmv: number;
  orders: number;
}

export function SkuSheet({
  open,
  target,
  period,
  onClose,
}: {
  open: boolean;
  target: { itemcode: string; name: string } | null;
  period: StorePeriodKey;
  onClose: () => void;
}) {
  const [dimension, setDimension] = useState<SpecDimension>('combo');
  const skus = useMemo(() => (target ? productSkuRows(target.itemcode, period) : []), [target, period]);

  const dimensions = useMemo(() => {
    const options: Array<{ key: SpecDimension; label: string }> = [{ key: 'combo', label: '组合' }];
    (['color', 'size', 'pattern'] as const).forEach((field) => {
      const distinct = new Set(skus.map((sku) => sku[field]).filter(Boolean));
      const available = field === 'pattern' ? distinct.size >= 2 : distinct.size >= 1;
      if (available) options.push({ key: field, label: DIMENSION_LABEL[field] });
    });
    return options;
  }, [skus]);

  const rows = useMemo<SkuRow[]>(() => {
    if (dimension === 'combo') {
      return skus.map((sku) => ({
        key: sku.id,
        label: [sku.color, sku.size, sku.pattern].filter(Boolean).join(' / ') || '默认规格',
        sub: sku.id,
        image: sku.image,
        qty: sku.qty,
        gmv: sku.gmv,
        orders: sku.orders,
      }));
    }
    const groups = new Map<string, SkuRow & { count: number }>();
    skus.forEach((sku) => {
      const value = sku[dimension] || EMPTY_VALUE[dimension];
      const label = `${DIMENSION_LABEL[dimension]}:${value}`;
      const current = groups.get(label) ?? { key: label, label, sub: '', image: sku.image, qty: 0, gmv: 0, orders: 0, count: 0 };
      current.qty += sku.qty;
      current.gmv += sku.gmv;
      current.orders += sku.orders;
      current.count += 1;
      groups.set(label, current);
    });
    return Array.from(groups.values())
      .sort((left, right) => right.qty - left.qty || left.label.localeCompare(right.label))
      .map((group) => ({ ...group, sub: `共 ${group.count} 个 SKU` }));
  }, [skus, dimension]);

  return (
    <Sheet open={open} title="SKU 明细" height={620} onClose={onClose}>
      {target ? (() => {
        const product = PRODUCT_MAP[target.itemcode];
        return (
          <div className="cc-detail-head cc-sku-head">
            {product?.thumb
              ? <img className="cc-detail-thumb" src={product.thumb} alt="" />
              : <span className="cc-detail-thumb cc-detail-thumb--empty" />}
            <div className="cc-detail-head-main">
              <div className="cc-detail-head-title">{target.name}</div>
              <div className="cc-detail-head-sub">
                {target.itemcode}{product ? ` · ${storeNameOf(product.storeId)}` : ''}
              </div>
            </div>
          </div>
        );
      })() : null}
      {dimensions.length > 1 ? (
        <div className="cc-sku-toolbar">
          <Segmented value={dimension} options={dimensions} onChange={(next) => setDimension(next as SpecDimension)} />
        </div>
      ) : null}
      {rows.length === 0 ? (
        <EmptyState title="暂无 SKU 明细" desc="该商品在当前周期内没有可拆分的 SKU 数据" />
      ) : (
        <div className="cc-sku-list">
          {rows.map((row) => (
            <div className="cc-sku-row" key={row.key}>
              {row.image ? <img className="cc-sku-thumb" src={row.image} alt="" /> : <span className="cc-sku-thumb cc-sku-thumb--empty" />}
              <div className="cc-sku-main">
                <div className="cc-sku-name">{row.label}</div>
                <div className="cc-sku-sub">{row.sub}</div>
              </div>
              <div className="cc-sku-metrics">
                <strong>{fmtMoney(row.gmv)}</strong>
                <span>{fmtInt(row.orders)} 单 · {fmtInt(row.qty)} 件</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {rows.length > 0 ? <div className="cc-list-end">已经到底了</div> : null}
    </Sheet>
  );
}
