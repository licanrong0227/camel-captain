import React, { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { levelRank, productRank, storeSalesRank, storeTrafficRank, type ProductRankMetric, type RankRow } from '../data/aggregate';
import { LEVEL_COLORS, LEVEL_LIGHT_COLORS } from '../data/catalog';
import { fmtInt, fmtMoney } from '../data/format';
import type { ExclusionConfig, StorePeriodKey } from '../data/types';
import { ProductSkuDialog } from './ProductSkuDialog';
import { Segmented } from './Segmented';

const PERIODS: Record<'sales' | 'traffic' | 'product' | 'level', Array<{ key: StorePeriodKey; label: string }>> = {
  sales: [{ key: 'week', label: '近1周' }, { key: 'month', label: '近1月' }, { key: 'months3', label: '近3月' }],
  traffic: [{ key: 'day', label: '近1天' }, { key: 'week', label: '近7天' }, { key: 'month', label: '近30天' }],
  product: [{ key: 'week', label: '近1周' }, { key: 'month', label: '近1月' }, { key: 'months3', label: '近3月' }],
  level: [],
};

const STORE_DIMS: Array<{ key: 'sales' | 'traffic' | 'level'; label: string }> = [
  { key: 'sales', label: '销量' },
  { key: 'traffic', label: '流量' },
  { key: 'level', label: '等级' },
];

const PRODUCT_METRICS: Array<{ key: ProductRankMetric; label: string }> = [
  { key: 'qty', label: '销量' },
  { key: 'gmv', label: '销售额' },
  { key: 'orders', label: '订单数' },
];

function ProductCell({ row }: { row: RankRow }) {
  return (
    <span className="hd-rank-product">
      {row.thumb ? <img src={row.thumb} alt="" /> : <span className="hd-rank-product-ph" />}
      <span className="hd-rank-product-text">
        <strong>{row.name}</strong>
        <em>{row.itemcode}</em>
      </span>
    </span>
  );
}

export function RankingDialog({
  kind,
  period,
  onPeriodChange,
  onKindChange,
  productMetric,
  onProductMetricChange,
  exclusionEnabled,
  configs,
  onClose,
}: {
  kind: 'sales' | 'traffic' | 'product' | 'level';
  period: StorePeriodKey;
  onPeriodChange: (next: StorePeriodKey) => void;
  onKindChange: (next: 'sales' | 'traffic' | 'level') => void;
  productMetric: ProductRankMetric;
  onProductMetricChange: (next: ProductRankMetric) => void;
  exclusionEnabled: boolean;
  configs: ExclusionConfig[];
  onClose: () => void;
}) {
  const [skuRow, setSkuRow] = useState<RankRow | null>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !skuRow) onClose();
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose, skuRow]);

  const rows = useMemo(() => {
    if (kind === 'sales') return storeSalesRank(period, exclusionEnabled, configs);
    if (kind === 'traffic') return storeTrafficRank(period);
    if (kind === 'level') return levelRank();
    return productRank(period, productMetric);
  }, [kind, period, productMetric, exclusionEnabled, configs]);

  const visible = rows;
  const title = kind === 'product' ? '商品销售 Top100' : '店铺排行榜';

  const valueText = (row: RankRow) => {
    if (kind === 'sales') return fmtMoney(row.value);
    if (kind === 'level') return `${(row.score ?? 0).toFixed(2)} 分`;
    return fmtInt(row.value);
  };

  const levelChip = (row: RankRow) => {
    const level = row.level ?? 0;
    return (
      <span
        className="hd-level-chip"
        style={{ color: LEVEL_COLORS[level] || LEVEL_COLORS[0], background: LEVEL_LIGHT_COLORS[level] || LEVEL_LIGHT_COLORS[0] }}
      >
        LV.{level}
      </span>
    );
  };

  return (
    <div className="hd-modal-mask" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="hd-modal hd-rank-dialog" role="dialog" aria-modal="true" aria-label={title}>
        <div className="hd-rank-dialog-header">
          <div className="hd-rank-dialog-title-wrap">
            <span className="hd-rank-dialog-title">{title}</span>
            <span className="hd-rank-dialog-count">共 {rows.length} 条</span>
          </div>
          <div className="hd-rank-dialog-tools">
            <button type="button" className="hd-excl-close" onClick={onClose} aria-label="关闭"><X size={18} /></button>
          </div>
        </div>

        {kind !== 'product' ? (
          <div className="hd-rank-dialog-tabs">
            <Segmented value={kind} options={STORE_DIMS} onChange={onKindChange} />
            <span className="hd-rank-dialog-hint">销量 / 流量按所选周期，等级按等级与能力分排序</span>
            {kind !== 'level' ? (
              <div className="hd-rank-dialog-period">
                <Segmented value={period} options={PERIODS[kind]} onChange={onPeriodChange} />
              </div>
            ) : null}
          </div>
        ) : (
          <div className="hd-rank-dialog-tabs">
            <Segmented value={productMetric} options={PRODUCT_METRICS} onChange={onProductMetricChange} />
            <span className="hd-rank-dialog-hint">按销量、销售额或订单数取前 100</span>
            <div className="hd-rank-dialog-period">
              <Segmented value={period} options={PERIODS.product} onChange={onPeriodChange} />
            </div>
          </div>
        )}

        <div className="hd-rank-dialog-body">
          <div className="hd-rank-head">
            <span className="hd-rank-col-rank">排名</span>
            {kind === 'product' ? (
              <>
                <span className="hd-rank-col-main">商品</span>
                <span className="hd-rank-col-sku">出单 SKU 数量</span>
                <span className="hd-rank-col-store">店铺</span>
                <span className="hd-rank-col-value">{productMetric === 'gmv' ? '销售额' : productMetric === 'orders' ? '订单数' : '销量'}</span>
              </>
            ) : kind === 'level' ? (
              <>
                <span className="hd-rank-col-main">店铺</span>
                <span className="hd-rank-col-level">等级</span>
                <span className="hd-rank-col-value">能力分</span>
              </>
            ) : (
              <>
                <span className="hd-rank-col-main">店铺</span>
                <span className="hd-rank-col-value">{kind === 'sales' ? '销售额' : '浏览量'}</span>
              </>
            )}
          </div>
          <div className="hd-rank-body">
            {visible.length === 0 ? <div className="hd-empty">暂无数据</div> : null}
            {visible.map((row) => (
              <div className="hd-rank-row" key={row.key}>
                <span className="hd-rank-col-rank">
                  <span className={`hd-rank-index${row.rank <= 3 ? ' is-top' : ''}`}>{row.rank}</span>
                </span>
                {kind === 'product' ? (
                  <>
                    <span className="hd-rank-col-main"><ProductCell row={row} /></span>
                    <span className="hd-rank-col-sku">
                      <span className="hd-link" title="查看出单 SKU" onClick={() => setSkuRow(row)}>{row.skuCount ?? 0} 个</span>
                    </span>
                    <span className="hd-rank-col-store">{row.storeName}</span>
                    <span className="hd-rank-col-value">{productMetric === 'gmv' ? fmtMoney(row.value) : fmtInt(row.value)}</span>
                  </>
                ) : kind === 'level' ? (
                  <>
                    <span className="hd-rank-col-main">{row.storeName}</span>
                    <span className="hd-rank-col-level">{levelChip(row)}</span>
                    <span className="hd-rank-col-value">{valueText(row)}</span>
                  </>
                ) : (
                  <>
                    <span className="hd-rank-col-main">{row.storeName}</span>
                    <span className="hd-rank-col-value">{valueText(row)}</span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
        {skuRow ? (
          <ProductSkuDialog
            row={skuRow}
            period={period}
            onClose={() => setSkuRow(null)}
          />
        ) : null}
      </div>
    </div>
  );
}
