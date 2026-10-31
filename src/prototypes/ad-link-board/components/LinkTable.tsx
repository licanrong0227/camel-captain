import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { Select, Empty, Pager } from './ui';
import type { LinkRow } from '../data/types';
import { sumAcc } from '../data/aggregate';
import { fmtMoney, fmtRoas } from '../data/format';

type SortKey = 'linkGmv' | 'adCost' | 'adGmv' | 'adRatio' | 'roas';

const SORT_LABEL: Record<SortKey, string> = {
  linkGmv: '链接产出 GMV',
  adCost: '广告消耗',
  adGmv: '广告 GMV',
  adRatio: '广告 GMV 占比',
  roas: 'ROAS',
};

const THRESHOLDS = [
  { value: '0', label: '不限产出' },
  { value: '100', label: '产出 ≥ $100' },
  { value: '500', label: '产出 ≥ $500' },
  { value: '1000', label: '产出 ≥ $1,000' },
];

function pct(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return '-';
  return `${(value * 100).toFixed(1)}%`;
}

interface Props {
  rows: LinkRow[];
  onOpen: (row: LinkRow) => void;
}

export function LinkTable(props: Props) {
  const [keyword, setKeyword] = useState('');
  const [threshold, setThreshold] = useState('0');
  const [sortKey, setSortKey] = useState<SortKey>('linkGmv');
  const [desc, setDesc] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(() => {
    const min = Number(threshold) || 0;
    const kw = keyword.trim().toLowerCase();
    const list = props.rows.filter((row) => {
      if (row.linkGmv < min) return false;
      if (!kw) return true;
      return row.itemCode.includes(kw) || row.itemName.toLowerCase().includes(kw);
    });
    const value = (row: LinkRow) => {
      const raw = row[sortKey];
      return raw === null || !Number.isFinite(raw) ? Number.NEGATIVE_INFINITY : raw;
    };
    return list.sort((a, b) => (desc ? value(b) - value(a) : value(a) - value(b)));
  }, [props.rows, keyword, threshold, sortKey, desc]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pageCount);
  const visible = filtered.slice((current - 1) * pageSize, current * pageSize);
  const totals = useMemo(() => sumAcc(filtered), [filtered]);

  const onSort = (key: SortKey) => {
    if (key === sortKey) {
      setDesc((prev) => !prev);
      return;
    }
    setSortKey(key);
    setDesc(true);
    setPage(1);
  };

  const sortIcon = (key: SortKey) => (key === sortKey ? desc ? <ChevronDown size={12} /> : <ChevronUp size={12} /> : null);

  const head = (key: SortKey) => (
    <th className="adr-th adr-th--sortable adr-th--num" onClick={() => onSort(key)}>
      <span className="adr-th__inner">
        {SORT_LABEL[key]}
        {sortIcon(key)}
      </span>
    </th>
  );

  return (
    <div className="adr-table-shell" data-annotation-id="alb-link-table">
      <div className="adr-link-toolbar">
        <div className="adr-link-toolbar__left">
          <span className="adr-link-toolbar__title">主链接</span>
          <span className="adr-link-toolbar__count">{filtered.length} 条</span>
        </div>
        <div className="adr-link-toolbar__right">
          <div className="adr-search">
            <Search size={14} />
            <input
              className="adr-search__input"
              placeholder="搜索链接 ID 或名称"
              value={keyword}
              onChange={(event) => {
                setKeyword(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <Select
            value={threshold}
            options={THRESHOLDS}
            onChange={(value) => {
              setThreshold(value);
              setPage(1);
            }}
            width={132}
            size="small"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <Empty text="没有匹配的链接，试试调整搜索或产出阈值" />
      ) : (
        <div className="adr-table-scroll">
          <table className="adr-table adr-table--links">
            <colgroup>
              <col style={{ width: 340 }} />
              <col style={{ width: 140 }} />
              <col style={{ width: 140 }} />
              <col style={{ width: 160 }} />
              <col style={{ width: 150 }} />
              <col style={{ width: 110 }} />
              <col style={{ width: 90 }} />
            </colgroup>
            <thead>
              <tr>
                <th className="adr-th">链接</th>
                {head('adCost')}
                {head('adGmv')}
                {head('linkGmv')}
                {head('adRatio')}
                {head('roas')}
                <th className="adr-th">操作</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.key} className="adr-tr">
                  <td className="adr-td">
                    <div className="adr-prod">
                      {row.imgUrl ? (
                        <img className="adr-prod__thumb" src={row.imgUrl} alt="" loading="eager" />
                      ) : (
                        <span className="adr-prod__thumb adr-prod__thumb--empty">无图</span>
                      )}
                      <span className="adr-prod__meta">
                        <span className="adr-prod__name" title={row.itemName}>
                          {row.itemName}
                        </span>
                        <span className="adr-prod__sub">{row.itemCode}</span>
                      </span>
                    </div>
                  </td>
                  <td className="adr-td adr-td--num">{row.hasAd ? fmtMoney(row.adCost) : '-'}</td>
                  <td className="adr-td adr-td--num">{row.hasAd ? fmtMoney(row.adGmv) : '-'}</td>
                  <td className="adr-td adr-td--num">{fmtMoney(row.linkGmv)}</td>
                  <td className={`adr-td adr-td--num${row.adRatio !== null && row.adRatio > 0.6 ? ' adr-td--bad' : ''}`}>
                    {pct(row.adRatio)}
                  </td>
                  <td className={`adr-td adr-td--num${row.roas !== null && row.roas < 1 ? ' adr-td--bad' : ''}`}>
                    {fmtRoas(row.roas)}
                  </td>
                  <td className="adr-td">
                    <button type="button" className="adr-link" onClick={() => props.onOpen(row)}>
                      详情
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="adr-td adr-td--total">合计</td>
                <td className="adr-td adr-td--total adr-td--num">{fmtMoney(totals.adCost)}</td>
                <td className="adr-td adr-td--total adr-td--num">{fmtMoney(totals.adGmv)}</td>
                <td className="adr-td adr-td--total adr-td--num">{fmtMoney(totals.linkGmv)}</td>
                <td className="adr-td adr-td--total adr-td--num">{pct(totals.adRatio)}</td>
                <td className="adr-td adr-td--total adr-td--num">{fmtRoas(totals.roas)}</td>
                <td className="adr-td adr-td--total" />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <div className="adr-table-foot">
        <span className="adr-table-foot__note">没有投放广告的链接也会列出，广告相关列显示「-」；合计统计当前筛选结果，不受分页影响</span>
        <Pager
          page={current}
          pageSize={pageSize}
          total={filtered.length}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </div>
    </div>
  );
}
