import React, { useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import { AD_LIMITS } from '../ad-data';
import { addDays, fmtAxis, fmtMoney, type AdExclusionConfig } from '../ad-report';
import { buildItemDaily, buildItemRows, ITEM_LINK_MAP } from '../item-ad-data';
import { LineChart } from './LineChart';

const WINDOWS = [1, 3, 7, 15, 30];

function pct(value: number | null): string {
  return value === null || !Number.isFinite(value) ? '-' : `${(value * 100).toFixed(1)}%`;
}

function roasText(value: number | null): string {
  return value === null || !Number.isFinite(value) ? '-' : `${value.toFixed(2)}x`;
}

export function ItemDrawer({
  storeId,
  itemCode,
  from,
  to,
  excludeEnabled,
  configs,
  onClose,
}: {
  storeId: number;
  itemCode: string;
  from: string;
  to: string;
  excludeEnabled: boolean;
  configs: AdExclusionConfig[];
  onClose: () => void;
}) {
  const info = ITEM_LINK_MAP[itemCode];
  const row = useMemo(
    () => buildItemRows(storeId, from, to, excludeEnabled, configs).find((item) => item.itemCode === itemCode) || null,
    [storeId, itemCode, from, to, excludeEnabled, configs],
  );
  const daily = useMemo(
    () => buildItemDaily(storeId, from, to, excludeEnabled, configs).filter((item) => item.itemCode === itemCode),
    [storeId, itemCode, from, to, excludeEnabled, configs],
  );
  const compare = useMemo(
    () =>
      WINDOWS.map((days) => {
        const start = addDays(to, -(days - 1));
        const windowFrom = start < AD_LIMITS.DATA_FROM ? AD_LIMITS.DATA_FROM : start;
        const item = buildItemRows(storeId, windowFrom, to, excludeEnabled, configs).find((entry) => entry.itemCode === itemCode);
        return { days, row: item || null };
      }),
    [storeId, itemCode, to, excludeEnabled, configs],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  if (!info) return null;

  const trends = daily.map((point) => point);
  const dates = trends.map((point) => point.date);

  return (
    <div className="ss-drawer" role="dialog" aria-modal="true" aria-label="商品广告详情">
      <div className="ss-drawer-mask" onClick={onClose} />
      <aside className="ss-drawer-panel">
        <header className="ss-drawer-head">
          <div className="ss-drawer-title">
            {info.imgUrl ? (
              <img className="ss-drawer-thumb" src={info.imgUrl} alt="" />
            ) : (
              <span className="ss-drawer-thumb ss-drawer-thumb--empty">无图</span>
            )}
            <div className="ss-drawer-meta">
              <div className="ss-drawer-name">{info.itemName}</div>
              <div className="ss-drawer-sub">{info.itemCode} · {info.categoryName}</div>
            </div>
          </div>
          <button type="button" className="ss-drawer-close" onClick={onClose} aria-label="关闭"><X size={18} /></button>
        </header>

        <div className="ss-drawer-body">
          <div className="ss-drawer-kpis">
            <div className="ss-drawer-kpi">
              <span>广告消耗</span>
              <strong>{row && row.hasAd ? fmtMoney(row.adCost) : '-'}</strong>
            </div>
            <div className="ss-drawer-kpi">
              <span>广告 GMV</span>
              <strong>{row && row.hasAd ? fmtMoney(row.adGmv) : '-'}</strong>
            </div>
            <div className="ss-drawer-kpi">
              <span>链接产出 GMV</span>
              <strong>{row ? fmtMoney(row.linkGmv) : '-'}</strong>
            </div>
            <div className="ss-drawer-kpi">
              <span>广告 GMV 占比</span>
              <strong>{pct(row ? row.adRatio : null)}</strong>
            </div>
            <div className={`ss-drawer-kpi${row && row.roas !== null && row.roas < 1 ? ' is-bad' : ''}`}>
              <span>ROAS</span>
              <strong>{roasText(row ? row.roas : null)}</strong>
            </div>
          </div>

          <section className="ss-drawer-section">
            <div className="ss-drawer-section-head">
              <h4>按天走势</h4>
              <span className="ss-drawer-section-note">广告消耗 vs 链接产出 GMV</span>
            </div>
            <LineChart
              dates={dates}
              height={220}
              ariaLabel="商品广告消耗与链接产出走势"
              series={[
                { key: 'linkGmv', label: '链接产出 GMV', color: '#2881FF', values: trends.map((point) => point.linkGmv) },
                { key: 'adCost', label: '广告消耗', color: '#FF7D29', values: trends.map((point) => point.adCost) },
              ]}
              formatValue={(value) => fmtMoney(value)}
              axisFormat={fmtAxis}
              xFormat={(date) => date.slice(5).replace('-', '/')}
              tooltipRows={(index) => {
                const point = trends[index];
                return [
                  { label: '链接产出 GMV', value: fmtMoney(point.linkGmv), color: '#2881FF' },
                  { label: '广告消耗', value: fmtMoney(point.adCost), color: '#FF7D29' },
                  { label: '广告 GMV', value: fmtMoney(point.adGmv), muted: true },
                  { label: '广告 GMV 占比', value: pct(point.linkGmv > 0 ? point.adGmv / point.linkGmv : null), muted: true },
                  { label: 'ROAS', value: roasText(point.adCost > 0 ? point.adGmv / point.adCost : null), muted: true },
                ];
              }}
            />
          </section>

          <section className="ss-drawer-section">
            <div className="ss-drawer-section-head">
              <h4>多时间对比</h4>
              <span className="ss-drawer-section-note">以当前查询截止日向前取 1 / 3 / 7 / 15 / 30 天</span>
            </div>
            <table className="ss-mini-table">
              <thead>
                <tr>
                  <th>周期</th>
                  <th className="is-num">广告消耗</th>
                  <th className="is-num">广告 GMV</th>
                  <th className="is-num">链接产出 GMV</th>
                  <th className="is-num">广告 GMV 占比</th>
                  <th className="is-num">ROAS</th>
                </tr>
              </thead>
              <tbody>
                {compare.map((entry) => (
                  <tr key={entry.days}>
                    <td>近 {entry.days} 天</td>
                    <td className="is-num">{entry.row && entry.row.hasAd ? fmtMoney(entry.row.adCost) : '-'}</td>
                    <td className="is-num">{entry.row && entry.row.hasAd ? fmtMoney(entry.row.adGmv) : '-'}</td>
                    <td className="is-num">{entry.row ? fmtMoney(entry.row.linkGmv) : '-'}</td>
                    <td className="is-num">{pct(entry.row ? entry.row.adRatio : null)}</td>
                    <td className={`is-num${entry.row && entry.row.roas !== null && entry.row.roas < 1 ? ' is-bad' : ''}`}>
                      {roasText(entry.row ? entry.row.roas : null)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <p className="ss-drawer-foot">
            链接产出 GMV = 该商品在订单中的商品行金额之和；广告数据来自广告商品报表，两边按同一区间对齐。
          </p>
        </div>
      </aside>
    </div>
  );
}
