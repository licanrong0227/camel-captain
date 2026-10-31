import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { StoreRow } from '../data/types';
import { fmtMoney, fmtRelative, fmtRoas } from '../data/format';
import { InfoTip } from './ui';

type SortKey = 'adCost' | 'adGmv' | 'storeGmv' | 'adRatio' | 'roas';

interface Props {
  rows: StoreRow[];
  onOpenStore: (storeId: number) => void;
}

function pct(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return '-';
  return `${(value * 100).toFixed(1)}%`;
}

function deltaTone(value: number | null): string {
  if (value === null || !Number.isFinite(value) || Math.abs(value) < 0.0005) return '';
  return value > 0 ? ' is-bad' : ' is-good';
}

export function StoreTable(props: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('adRatio');
  const [desc, setDesc] = useState(true);

  const sorted = useMemo(() => {
    const value = (row: StoreRow) => {
      const raw = row[sortKey];
      return raw === null || !Number.isFinite(raw) ? Number.NEGATIVE_INFINITY : raw;
    };
    return [...props.rows].sort((a, b) => (desc ? value(b) - value(a) : value(a) - value(b)));
  }, [props.rows, sortKey, desc]);

  const totals = useMemo(() => {
    const acc = props.rows.reduce(
      (sum, row) => ({
        adCost: sum.adCost + row.adCost,
        adGmv: sum.adGmv + row.adGmv,
        storeGmv: sum.storeGmv + row.storeGmv,
      }),
      { adCost: 0, adGmv: 0, storeGmv: 0 },
    );
    return {
      ...acc,
      adRatio: acc.storeGmv > 0 ? acc.adGmv / acc.storeGmv : null,
      roas: acc.adCost > 0 ? acc.adGmv / acc.adCost : null,
    };
  }, [props.rows]);

  const onSort = (key: SortKey) => {
    if (key === sortKey) {
      setDesc((prev) => !prev);
      return;
    }
    setSortKey(key);
    setDesc(true);
  };

  const sortIcon = (key: SortKey) => (key === sortKey ? desc ? <ChevronDown size={12} /> : <ChevronUp size={12} /> : null);

  const head = (key: SortKey, label: string) => (
    <th className="adr-th adr-th--sortable adr-th--num" onClick={() => onSort(key)}>
      <span className="adr-th__inner">
        {label}
        {sortIcon(key)}
      </span>
    </th>
  );

  return (
    <div className="adr-table-shell" data-annotation-id="alb-store-table">
      <div className="adr-table-scroll">
        <table className="adr-table adr-table--stores">
          <colgroup>
            <col style={{ width: 220 }} />
            <col style={{ width: 150 }} />
            <col style={{ width: 150 }} />
            <col style={{ width: 160 }} />
            <col style={{ width: 160 }} />
            <col style={{ width: 120 }} />
            <col style={{ width: 140 }} />
          </colgroup>
          <thead>
            <tr>
              <th className="adr-th">店铺</th>
              {head('adCost', '广告消耗')}
              {head('adGmv', '广告 GMV')}
              {head('storeGmv', '整店 GMV')}
              {head('adRatio', '广告 GMV 占比')}
              {head('roas', 'ROAS')}
              <th className="adr-th adr-th--num">广告消耗环比</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr key={row.key} className="adr-tr adr-tr--clickable" onClick={() => props.onOpenStore(row.storeId)}>
                <td className="adr-td">
                  <span className="adr-store-cell">
                    <span className="adr-store-cell__name">{row.storeName}</span>
                    <span className="adr-store-cell__alias">{row.aliasName}</span>
                  </span>
                </td>
                <td className="adr-td adr-td--num">{fmtMoney(row.adCost)}</td>
                <td className="adr-td adr-td--num">{fmtMoney(row.adGmv)}</td>
                <td className="adr-td adr-td--num">{fmtMoney(row.storeGmv)}</td>
                <td className="adr-td adr-td--num adr-td--accent">{pct(row.adRatio)}</td>
                <td className="adr-td adr-td--num">{fmtRoas(row.roas)}</td>
                <td className={`adr-td adr-td--num${deltaTone(row.adCostDelta)}`}>{fmtRelative(row.adCostDelta)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="adr-td adr-td--total">合计 {props.rows.length} 家店</td>
              <td className="adr-td adr-td--total adr-td--num">{fmtMoney(totals.adCost)}</td>
              <td className="adr-td adr-td--total adr-td--num">{fmtMoney(totals.adGmv)}</td>
              <td className="adr-td adr-td--total adr-td--num">{fmtMoney(totals.storeGmv)}</td>
              <td className="adr-td adr-td--total adr-td--num">{pct(totals.adRatio)}</td>
              <td className="adr-td adr-td--total adr-td--num">{fmtRoas(totals.roas)}</td>
              <td className="adr-td adr-td--total adr-td--num" />
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="adr-table-foot">
        <span className="adr-table-foot__note">
          广告 GMV 占比 = 广告 GMV ÷ 整店 GMV；点店铺行可下钻查看链接明细
          <InfoTip text="整店 GMV 取店铺经营数据的成交金额；广告 GMV 取敦煌广告商品维度报表，两边按同一区间对齐。" />
        </span>
      </div>
    </div>
  );
}
