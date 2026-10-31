import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, ChevronUp } from 'lucide-react';
import { AD_TYPE_LABEL, type AdType, type ItemRow, type Metrics, type PlanRow, type ViewKey, type WordRow } from '../data/types';
import { finalize, mergeAcc, sortByNumber } from '../data/aggregate';
import { fmtDateSlash, fmtInt, fmtMoney, fmtPct, fmtRoas } from '../data/format';
import { Empty, Pager, Tag } from './ui';

type Row = ItemRow | PlanRow | WordRow;

interface MetricCol {
  key: string;
  label: string;
  width: number;
  group: 'flow' | 'conv' | 'rev';
  kind: 'int' | 'money' | 'pct' | 'roas';
}

const METRIC_COLS: MetricCol[] = [
  { key: 'imp', label: '曝光量', width: 80, group: 'flow', kind: 'int' },
  { key: 'click', label: '点击量', width: 72, group: 'flow', kind: 'int' },
  { key: 'ctr', label: '点击率', width: 78, group: 'flow', kind: 'pct' },
  { key: 'cpc', label: '点击单价', width: 90, group: 'flow', kind: 'money' },
  { key: 'orders', label: '订单数', width: 74, group: 'conv', kind: 'int' },
  { key: 'cvr', label: '转化率', width: 78, group: 'conv', kind: 'pct' },
  { key: 'cpa', label: '单均花费', width: 88, group: 'conv', kind: 'money' },
  { key: 'cost', label: '广告花费', width: 92, group: 'rev', kind: 'money' },
  { key: 'gmv', label: '广告 GMV', width: 100, group: 'rev', kind: 'money' },
  { key: 'roas', label: 'ROAS', width: 80, group: 'rev', kind: 'roas' },
];

const GROUP_LABEL: Record<MetricCol['group'], string> = {
  flow: '流量',
  conv: '转化',
  rev: '收入',
};

const WORD_COLS: Array<{ key: string; label: string; width: number }> = [
  { key: 'word', label: '成单词', width: 280 },
  { key: 'adTypes', label: '来源广告', width: 148 },
  { key: 'orderCount', label: '订单数', width: 88 },
  { key: 'gmv', label: 'GMV', width: 116 },
  { key: 'itemCount', label: '涉及商品数', width: 112 },
  { key: 'lastDate', label: '最近成单日', width: 120 },
  { key: 'expand', label: '订单明细', width: 104 },
];

const STORE_WIDTH = 150;

function metricText(kind: MetricCol['kind'], value: number | null): string {
  if (kind === 'money') return value === null ? '-' : fmtMoney(value);
  if (kind === 'pct') return fmtPct(value);
  if (kind === 'roas') return fmtRoas(value);
  return value === null ? '-' : fmtInt(value);
}

function metricOf(row: Row, key: string): number | null {
  const metrics = row as unknown as Metrics;
  const value = metrics[key as keyof Metrics];
  return typeof value === 'number' ? value : null;
}

function AdTypeChips(props: { types: AdType[] }) {
  return (
    <span className="adr-typechips">
      {props.types.map((type) => (
        <Tag key={type} tone={type === 'ppc' ? 'info' : type === 'prodauto' ? 'brand' : 'neutral'}>
          {AD_TYPE_LABEL[type]}
        </Tag>
      ))}
    </span>
  );
}

interface Props {
  view: ViewKey;
  rows: Row[];
  wordTotals: { orderCount: number; gmv: number; itemCount: number };
  showStore: boolean;
  annotationId?: string;
  onItemClick: (row: ItemRow) => void;
}

export function ReportTable(props: Props) {
  const [sortKey, setSortKey] = useState('cost');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
    setExpanded(null);
    if (props.view === 'word') {
      setSortKey('gmv');
    } else {
      setSortKey('cost');
    }
    setSortDir('desc');
  }, [props.view]);

  useEffect(() => {
    setPage(1);
  }, [props.rows]);

  const sorted = useMemo(() => {
    if (props.view === 'word') {
      const pick = (row: Row) => {
        const wordRow = row as WordRow;
        if (sortKey === 'orderCount') return wordRow.orderCount;
        if (sortKey === 'itemCount') return wordRow.itemCount;
        return wordRow.gmv;
      };
      return sortByNumber(props.rows, pick, sortDir);
    }
    return sortByNumber(props.rows, (row) => metricOf(row, sortKey), sortDir);
  }, [props.rows, props.view, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, pageCount);
  const visible = sorted.slice((current - 1) * pageSize, current * pageSize);

  const onSort = (key: string) => {
    if (key === sortKey) {
      setSortDir((prev) => (prev === 'desc' ? 'asc' : 'desc'));
      return;
    }
    setSortKey(key);
    setSortDir('desc');
  };

  const sortIcon = (key: string) => {
    if (key !== sortKey) return null;
    return sortDir === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />;
  };

  const totalMetrics = useMemo(() => {
    const acc = mergeAcc(
      props.rows.map((row) => {
        const metrics = row as unknown as Metrics;
        return { imp: metrics.imp, click: metrics.click, cost: metrics.cost, orders: metrics.orders, gmv: metrics.gmv };
      }),
    );
    return finalize(acc);
  }, [props.rows]);

  const storeCol = props.showStore ? (
    <col key="store" style={{ width: STORE_WIDTH }} />
  ) : null;

  const metricHeaderCells = METRIC_COLS.map((col) => (
    <th key={col.key} style={{ width: col.width }} className="adr-th adr-th--sortable adr-th--num" onClick={() => onSort(col.key)}>
      <span className="adr-th__inner">
        {col.label}
        {sortIcon(col.key)}
      </span>
    </th>
  ));

  const metricGroupHeaders = (['flow', 'conv', 'rev'] as const).map((group) => (
    <th key={group} colSpan={METRIC_COLS.filter((col) => col.group === group).length} className={`adr-th adr-th--group adr-th--group-${group}`}>
      {GROUP_LABEL[group]}
    </th>
  ));

  const metricBodyCells = (row: Row) =>
    METRIC_COLS.map((col) => {
      const value = metricOf(row, col.key);
      const lowRoas = col.key === 'roas' && (row as ItemRow).lowRoas;
      return (
        <td key={col.key} className={`adr-td adr-td--num${lowRoas ? ' adr-td--bad' : ''}`}>
          {metricText(col.kind, value)}
        </td>
      );
    });

  const totalCells = METRIC_COLS.map((col) => (
    <td key={col.key} className="adr-td adr-td--num adr-td--total">
      {metricText(col.kind, metricOf(totalMetrics as unknown as Row, col.key))}
    </td>
  ));

  const renderItemRow = (row: ItemRow) => (
    <tr className="adr-tr adr-tr--clickable" key={row.key} onClick={() => props.onItemClick(row)}>
      {props.showStore ? <td className="adr-td adr-td--store">{row.store}</td> : null}
      <td className="adr-td">
        <div className="adr-prod">
          {row.thumb ? (
            <img className="adr-prod__thumb" src={row.thumb} alt="" loading="eager" />
          ) : (
            <span className="adr-prod__thumb adr-prod__thumb--empty">无图</span>
          )}
          <span className="adr-prod__meta">
            <span className="adr-prod__name" title={row.name}>
              {row.name}
            </span>
            <span className="adr-prod__sub">
              <span>{row.itemcode}</span>
              {row.zeroConv ? <Tag tone="warning">零转化</Tag> : null}
            </span>
          </span>
        </div>
      </td>
      <td className="adr-td">
        <AdTypeChips types={row.adTypes} />
      </td>
      {metricBodyCells(row)}
    </tr>
  );

  const renderPlanRow = (row: PlanRow) => (
    <tr className="adr-tr" key={row.key}>
      {props.showStore ? <td className="adr-td adr-td--store">{row.store}</td> : null}
      <td className="adr-td">
        <AdTypeChips types={[row.adType]} />
      </td>
      <td className="adr-td">
        {row.planName ? (
          <span className="adr-cell-strong">{row.planName}</span>
        ) : (
          <span className="adr-cell-muted">-</span>
        )}
      </td>
      <td className="adr-td">
        {row.groupName ? <span>{row.groupName}</span> : <span className="adr-cell-muted">-</span>}
      </td>
      {metricBodyCells(row)}
    </tr>
  );

  const renderWordRow = (row: WordRow) => {
    const isOpen = expanded === row.key;
    return (
      <React.Fragment key={row.key}>
        <tr className="adr-tr">
          {props.showStore ? <td className="adr-td adr-td--store">{row.store}</td> : null}
          <td className="adr-td">
            {row.word ? (
              <span className="adr-word">{row.word}</span>
            ) : (
              <span className="adr-cell-muted">无搜索词（自动广告）</span>
            )}
          </td>
          <td className="adr-td">
            <AdTypeChips types={row.adTypes} />
          </td>
          <td className="adr-td adr-td--num">{fmtInt(row.orderCount)}</td>
          <td className="adr-td adr-td--num">{fmtMoney(row.gmv)}</td>
          <td className="adr-td adr-td--num">{fmtInt(row.itemCount)}</td>
          <td className="adr-td">{row.lastDate ? fmtDateSlash(row.lastDate) : '-'}</td>
          <td className="adr-td">
            <button
              type="button"
              className="adr-link"
              onClick={() => setExpanded(isOpen ? null : row.key)}
            >
              {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              {isOpen ? '收起' : `${row.orders.length} 笔`}
            </button>
          </td>
        </tr>
        {isOpen ? (
          <tr className="adr-tr adr-tr--expand">
            <td className="adr-td" colSpan={props.showStore ? WORD_COLS.length + 1 : WORD_COLS.length}>
              <div className="adr-orders">
                {row.orders.slice(0, 6).map((order) => (
                  <div className="adr-orders__row" key={order.orderNo}>
                    <span className="adr-orders__no">{order.orderNo}</span>
                    <span className="adr-orders__date">{fmtDateSlash(order.date)}</span>
                    <span className="adr-orders__items">
                      {order.items.map((item) => `${item.name} ×1`).join('、')}
                    </span>
                    <span className="adr-orders__amount">{fmtMoney(order.amount)}</span>
                  </div>
                ))}
                {row.orders.length > 6 ? (
                  <div className="adr-orders__more">仅展示金额最高的 6 笔订单</div>
                ) : null}
              </div>
            </td>
          </tr>
        ) : null}
      </React.Fragment>
    );
  };

  const wordHeader = (
    <tr>
      {props.showStore ? (
        <th className="adr-th" key="store">
          店铺
        </th>
      ) : null}
      {WORD_COLS.map((col) => (
        <th
          key={col.key}
          className={`adr-th${['gmv', 'orderCount', 'itemCount'].includes(col.key) ? ' adr-th--sortable adr-th--num' : ''}`}
          onClick={['gmv', 'orderCount', 'itemCount'].includes(col.key) ? () => onSort(col.key) : undefined}
        >
          <span className="adr-th__inner">
            {col.label}
            {sortIcon(col.key)}
          </span>
        </th>
      ))}
    </tr>
  );

  return (
    <div className="adr-table-shell" data-annotation-id={props.annotationId}>
      {props.rows.length === 0 ? (
        <Empty text="当前筛选条件下暂无广告数据" />
      ) : (
        <div className="adr-table-scroll">
          <table className="adr-table">
            <colgroup>
              {storeCol}
              {props.view === 'item' ? (
                <>
                  <col style={{ width: 250 }} />
                  <col style={{ width: 152 }} />
                </>
              ) : null}
              {props.view === 'plan' ? (
                <>
                  <col style={{ width: 110 }} />
                  <col style={{ width: 180 }} />
                  <col style={{ width: 124 }} />
                </>
              ) : null}
              {props.view === 'word'
                ? WORD_COLS.map((col) => <col key={col.key} style={{ width: col.width }} />)
                : METRIC_COLS.map((col) => <col key={col.key} style={{ width: col.width }} />)}
            </colgroup>

            <thead>
              {props.view === 'word' ? (
                wordHeader
              ) : (
                <>
                  <tr>
                    {props.showStore ? (
                      <th className="adr-th adr-th--sticky1" rowSpan={2} key="store">
                        店铺
                      </th>
                    ) : null}
                    {props.view === 'item' ? (
                      <th className="adr-th adr-th--sticky1" rowSpan={2} key="product">
                        商品
                      </th>
                    ) : (
                      <>
                        <th className="adr-th adr-th--sticky1" rowSpan={2} key="type">
                          广告类型
                        </th>
                        <th className="adr-th adr-th--sticky1" rowSpan={2} key="plan">
                          计划
                        </th>
                        <th className="adr-th adr-th--sticky1" rowSpan={2} key="group">
                          广告组
                        </th>
                      </>
                    )}
                    {props.view === 'item' ? (
                      <th className="adr-th adr-th--sticky1" rowSpan={2} key="type">
                        广告类型
                      </th>
                    ) : null}
                    {metricGroupHeaders}
                  </tr>
                  <tr className="adr-tr--sub">{metricHeaderCells}</tr>
                </>
              )}
            </thead>

            <tbody>
              {props.view === 'item'
                ? (visible as ItemRow[]).map(renderItemRow)
                : props.view === 'plan'
                  ? (visible as PlanRow[]).map(renderPlanRow)
                  : (visible as WordRow[]).map(renderWordRow)}
            </tbody>

            <tfoot>
              <tr>
                {props.showStore ? <td className="adr-td adr-td--total">合计</td> : null}
                {props.view === 'item' ? (
                  <>
                    <td className="adr-td adr-td--total">{sorted.length} 个商品</td>
                    <td className="adr-td adr-td--total" />
                  </>
                ) : null}
                {props.view === 'plan' ? (
                  <>
                    <td className="adr-td adr-td--total" />
                    <td className="adr-td adr-td--total">{sorted.length} 个计划/广告组</td>
                    <td className="adr-td adr-td--total" />
                  </>
                ) : null}
                {props.view === 'word' ? (
                  <>
                    <td className="adr-td adr-td--total">{sorted.length} 个成单词</td>
                    <td className="adr-td adr-td--total" />
                    <td className="adr-td adr-td--total adr-td--num">{fmtInt(props.wordTotals.orderCount)}</td>
                    <td className="adr-td adr-td--total adr-td--num">{fmtMoney(props.wordTotals.gmv)}</td>
                    <td className="adr-td adr-td--total adr-td--num">{fmtInt(props.wordTotals.itemCount)}</td>
                    <td className="adr-td adr-td--total" />
                    <td className="adr-td adr-td--total" />
                  </>
                ) : (
                  totalCells
                )}
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <div className="adr-table-foot">
        <span className="adr-table-foot__note" data-annotation-id="adr-fetch">
          {props.view === 'word'
            ? '成单词按订单号去重；同一笔订单含多个商品时只计一次'
            : `合计为当前筛选下的全部 ${sorted.length} 条结果，不受分页影响`}
        </span>
        <Pager
          page={current}
          pageSize={pageSize}
          total={sorted.length}
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
