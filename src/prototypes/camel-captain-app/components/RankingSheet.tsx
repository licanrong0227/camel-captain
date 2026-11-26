import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { levelRank, productRank, storeSalesRank, storeTrafficRank, type ProductRankMetric, type RankRow } from '../data/aggregate';
import { LEVEL_COLORS } from '../data/catalog';
import { fmtCateList, fmtInt, fmtMoney } from '../data/format';
import type { ExclusionConfig, StorePeriodKey } from '../data/types';
import { Segmented } from './Segmented';
import { Sheet } from './Sheet';
import rank1 from '../assets/rank-1.png';
import rank2 from '../assets/rank-2.png';
import rank3 from '../assets/rank-3.png';

export type RankKind = 'sales' | 'traffic' | 'level' | 'product';

const TAB_OPTIONS = [
  { key: 'sales', label: '销售额' },
  { key: 'traffic', label: '浏览量' },
  { key: 'level', label: '等级' },
];

const PERIOD_OPTIONS = [
  { key: 'week', label: '近1周' },
  { key: 'month', label: '近1月' },
  { key: 'months3', label: '近3月' },
];

const PRODUCT_OPTIONS = [
  { key: 'qty', label: '销量' },
  { key: 'gmv', label: '销售额' },
  { key: 'orders', label: '订单量' },
];

function CateLine({ names, onOpen }: { names?: string[]; onOpen?: () => void }) {
  const list = (names ?? []).filter(Boolean);
  if (!list.length) return <>-</>;
  if (list.length === 1) return <>{list[0]}</>;
  return (
    <button
      type="button"
      className="cc-cate-btn"
      onClick={(event) => {
        event.stopPropagation();
        onOpen?.();
      }}
    >
      {fmtCateList(list)}
      <ChevronDown size={9} className="cc-cate-chevron" />
    </button>
  );
}

export function RankingSheet({
  open,
  kind,
  initialCate,
  onClose,
  exclusionEnabled,
  configs,
  onOpenSku,
}: {
  open: boolean;
  kind: RankKind;
  initialCate?: boolean;
  onClose: () => void;
  exclusionEnabled: boolean;
  configs: ExclusionConfig[];
  onOpenSku?: (row: RankRow) => void;
}) {
  const [tab, setTab] = useState<RankKind>(kind);
  const [period, setPeriod] = useState<StorePeriodKey>('week');
  const [metric, setMetric] = useState<ProductRankMetric>('qty');
  const [cateRow, setCateRow] = useState<RankRow | null>(null);

  useEffect(() => {
    setCateRow(null);
    if (!open) return;
    setTab(kind);
    setPeriod('week');
    setMetric('qty');
    if (initialCate) {
      const target = levelRank().find((row) => (row.catePubNames ?? []).filter(Boolean).length > 1);
      if (target) {
        setTab('level');
        setCateRow(target);
      }
    }
  }, [open, kind, initialCate]);

  const rows = useMemo(() => {
    if (tab === 'sales') return storeSalesRank(period, exclusionEnabled, configs).slice(0, 100);
    if (tab === 'traffic') return storeTrafficRank(period).slice(0, 100);
    if (tab === 'level') return levelRank();
    return productRank(period, metric);
  }, [tab, period, metric, exclusionEnabled, configs]);

  const medal = (rank: number) => {
    if (rank === 1) return <img className="cc-rank-medal-img" src={rank1} alt="第1名" />;
    if (rank === 2) return <img className="cc-rank-medal-img" src={rank2} alt="第2名" />;
    if (rank === 3) return <img className="cc-rank-medal-img" src={rank3} alt="第3名" />;
    return <span className="cc-rank-no">{rank}</span>;
  };

  return (
    <>
      <Sheet
        open={open}
        title={tab === 'product' ? '商品 Top100 榜单' : '完整榜单'}
      variant="full"
      onClose={onClose}
      subhead={
        <>
          {kind === 'product' ? (
            <Segmented value={metric} options={PRODUCT_OPTIONS} onChange={(next) => setMetric(next as ProductRankMetric)} variant="tabs" />
          ) : (
            <Segmented value={tab} options={TAB_OPTIONS} onChange={(next) => setTab(next as RankKind)} variant="tabs" />
          )}
          <div className="cc-rank-sheet-tools">
            {tab !== 'level' ? <Segmented value={period} options={PERIOD_OPTIONS} onChange={(next) => setPeriod(next as StorePeriodKey)} /> : null}
            <span className="cc-muted">共 {rows.length} 条</span>
          </div>
        </>
      }
    >
      <div className="cc-rank-list">
        {rows.map((row) => (
          <div
            className={`cc-rank-row${tab === 'product' ? ' is-link' : ''}`}
            key={row.key}
            onClick={tab === 'product' && onOpenSku ? () => onOpenSku(row) : undefined}
          >
            {medal(row.rank)}
            {tab === 'product' ? (
              row.thumb ? <img className="cc-rank-thumb" src={row.thumb} alt="" /> : <span className="cc-rank-thumb cc-rank-thumb--empty" />
            ) : null}
            <div className="cc-rank-main">
              <div className={`cc-rank-name${tab === 'product' ? ' cc-rank-name--clamp' : ''}`}>
                {tab === 'product' ? (row.name ?? row.itemcode) : (row.storeName ?? row.name ?? row.itemcode)}
              </div>
              <div className="cc-rank-sub">
                {tab === 'sales' ? `${fmtInt(row.qty ?? 0)} 件 · ${fmtInt(row.orders ?? 0)} 单` : null}
                {tab === 'traffic' ? `${fmtInt(row.uv ?? 0)} 访客 · UV价值 ${fmtMoney(row.uvValue ?? null)}` : null}
                {tab === 'level' ? <CateLine names={row.catePubNames} onOpen={() => setCateRow(row)} /> : null}
                {tab === 'product' ? `${row.itemcode} · ${row.storeName ?? '-'}` : null}
              </div>
            </div>
            {tab === 'level' ? (
              <span className="cc-rank-level">
                <span className="cc-level-badge" style={{ color: LEVEL_COLORS[row.level ?? 0], background: `${LEVEL_COLORS[row.level ?? 0]}18` }}>
                  LV{row.level ?? 0}
                </span>
                <span className="cc-level-score">{(row.score ?? 0).toFixed(2)} 分</span>
              </span>
            ) : (
              <span className="cc-rank-value">
                {tab === 'sales' ? fmtMoney(row.value) : null}
                {tab === 'traffic' ? fmtInt(row.value) : null}
                {tab === 'product' ? (metric === 'gmv' ? fmtMoney(row.value) : fmtInt(row.value)) : null}
              </span>
            )}
            {tab === 'product' ? <ChevronRight size={14} className="cc-rank-chevron" /> : null}
          </div>
        ))}
      </div>
        {rows.length > 0 ? <div className="cc-list-end">已经到底了</div> : null}
      </Sheet>
      <Sheet open={cateRow !== null} title="经营类目" onClose={() => setCateRow(null)}>
        {cateRow ? (
          <div className="cc-cate-sheet">
            <div className="cc-cate-sheet-store">{cateRow.storeName ?? cateRow.name ?? cateRow.itemcode}</div>
            <div className="cc-cate-sheet-tags">
              {(cateRow.catePubNames ?? []).filter(Boolean).map((name) => (
                <span className="cc-cate-sheet-tag" key={name}>{name}</span>
              ))}
            </div>
          </div>
        ) : null}
      </Sheet>
    </>
  );
}
