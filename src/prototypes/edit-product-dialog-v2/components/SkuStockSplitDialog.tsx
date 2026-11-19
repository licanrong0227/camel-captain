import React, { useEffect, useMemo, useState } from 'react';
import { Minus, Pencil, Plus, X } from 'lucide-react';
import type { SkuRow } from './SkuBatchEditDialog';
import './../sku-stock-split.css';

export type StockSplitLocation = {
  id: string;
  country: string;
};

export type StockSplitMap = Record<number, Record<string, string>>;

export type StockBatchPatch = {
  token: number;
  locationId: string;
  values: Record<number, string>;
};

function SplitStepper({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const bump = (direction: number) => {
    const current = Number(value);
    const base = Number.isFinite(current) ? current : 0;
    onChange(String(Math.max(0, Math.round(base + direction))));
  };

  return (
    <span className="ss-stepper">
      <button type="button" className="ss-stepper__btn" aria-label="减少" onClick={() => bump(-1)}>
        <Minus size={10} />
      </button>
      <input
        className="ss-stepper__input"
        value={value}
        inputMode="numeric"
        onChange={(event) => onChange(event.target.value.replace(/[^\d]/g, ''))}
      />
      <button type="button" className="ss-stepper__btn" aria-label="增加" onClick={() => bump(1)}>
        <Plus size={10} />
      </button>
    </span>
  );
}

export default function SkuStockSplitDialog({
  rows,
  locations,
  value,
  onClose,
  onApply,
  onToast,
  onRequestBatch,
  batchPatch,
}: {
  rows: SkuRow[];
  locations: StockSplitLocation[];
  value: StockSplitMap;
  onClose: () => void;
  onApply: (splits: StockSplitMap) => void;
  onToast: (message: string) => void;
  onRequestBatch?: (locationId: string, splits: StockSplitMap) => void;
  batchPatch?: StockBatchPatch | null;
}) {
  const [splits, setSplits] = useState<StockSplitMap>(() => {
    const next: StockSplitMap = {};
    rows.forEach((row) => {
      const stored = value[row.row] ?? {};
      next[row.row] = Object.fromEntries(
        locations.map((location) => [location.id, stored[location.id] ?? '0']),
      );
    });
    return next;
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !document.querySelector('.sbe-mask')) onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!batchPatch) return;
    setSplits((current) => {
      const next: StockSplitMap = { ...current };
      Object.entries(batchPatch.values).forEach(([row, quantity]) => {
        const rowNumber = Number(row);
        next[rowNumber] = { ...(next[rowNumber] ?? {}), [batchPatch.locationId]: quantity };
      });
      return next;
    });
  }, [batchPatch]);

  const setQty = (row: number, locationId: string, raw: string) => {
    setSplits((current) => ({
      ...current,
      [row]: { ...current[row], [locationId]: raw },
    }));
  };

  const totalOf = (row: number) =>
    locations.reduce((acc, location) => acc + (Number(splits[row]?.[location.id]) || 0), 0);

  const sellableRows = useMemo(() => rows.filter((row) => row.saleStatus === 1), [rows]);
  const sellableTotal = useMemo(
    () => sellableRows.reduce((acc, row) => acc + (Number(row.inventory) || 0), 0),
    [sellableRows],
  );
  const grandTotal = useMemo(
    () => sellableRows.reduce((acc, row) => acc + totalOf(row.row), 0),
    [sellableRows, splits, locations],
  );

  const locationTotals = locations.map((location) =>
    sellableRows.reduce((acc, row) => acc + (Number(splits[row.row]?.[location.id]) || 0), 0),
  );

  const columns = `minmax(184px, 1.4fr) 72px repeat(${locations.length}, minmax(112px, 1fr)) 88px`;

  const apply = () => {
    const nextSplits: StockSplitMap = {};
    rows.forEach((row) => {
      nextSplits[row.row] = { ...splits[row.row] };
    });
    onApply(nextSplits);
    onToast(`已更新 ${rows.length} 个 SKU 的备货库存`);
  };

  return (
    <div
      className="ss-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="ss-dialog" role="dialog" aria-modal="true" aria-label="分仓库存">
        <header className="ss-head">
          <div>
            <h3 className="ss-title">分仓库存</h3>
            <p className="ss-sub">可售 SKU {sellableRows.length} 个</p>
          </div>
          <button type="button" className="ss-close" aria-label="关闭" onClick={onClose}>
            <X size={16} />
          </button>
        </header>

        <div className="ss-body">
          <div className="ss-grid ss-grid--head" style={{ gridTemplateColumns: columns }}>
            <span>规格</span>
            <span>可售</span>
            {locations.map((location) => (
              <button
                type="button"
                key={location.id}
                className="ss-loc-batch"
                onClick={() => onRequestBatch?.(location.id, splits)}
              >
                {location.country}
                <Pencil size={11} />
              </button>
            ))}
            <span>备货合计</span>
          </div>
          {rows.map((row) => {
            const physical = totalOf(row.row);
            const sellable = Number(row.inventory) || 0;
            return (
              <div className="ss-grid ss-grid--row" style={{ gridTemplateColumns: columns }} key={row.row}>
                <span className="ss-spec">
                  <span className="ss-spec__name">
                    {row.color} / {row.option}
                  </span>
                  <span className={row.saleStatus === 1 ? 'ss-tag' : 'ss-tag is-off'}>
                    {row.saleStatus === 1 ? '可售' : '不可售'}
                  </span>
                </span>
                <span className="ss-sellable">{sellable}</span>
                {locations.map((location) => (
                  <SplitStepper
                    key={location.id}
                    value={splits[row.row]?.[location.id] ?? '0'}
                    onChange={(next) => setQty(row.row, location.id, next)}
                  />
                ))}
                <span className={physical < sellable ? 'ss-total is-short' : 'ss-total'}>{physical}</span>
              </div>
            );
          })}
          <div
            className="ss-grid ss-grid--row ss-grid--total"
            style={{ gridTemplateColumns: columns }}
          >
            <span className="ss-total-label">合计</span>
            <span className="ss-sellable">{sellableTotal}</span>
            {locations.map((location, index) => (
              <span className="ss-loc-total" key={location.id}>
                {locationTotals[index]}
              </span>
            ))}
            <span className="ss-total">{grandTotal}</span>
          </div>
        </div>

        <footer className="ss-foot">
          <button type="button" className="ss-btn" onClick={onClose}>
            取消
          </button>
          <button type="button" className="ss-btn ss-btn--primary" onClick={apply}>
            确定
          </button>
        </footer>
      </div>
    </div>
  );
}
