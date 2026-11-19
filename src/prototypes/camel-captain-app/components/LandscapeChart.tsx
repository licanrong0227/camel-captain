import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { RotateCcw } from 'lucide-react';
import { Chart, type ChartSeries, type ChartTipRow } from './Chart';
import { Segmented } from './Segmented';

type LandscapeTabs = {
  options: Array<{ key: string; label: string }>;
  value: string;
  onChange: (key: string) => void;
  variant?: 'chips' | 'tabs';
};

type LandscapeLegend = {
  hidden: string[];
  onToggle: (key: string) => void;
};

export function LandscapeChart({
  open,
  title,
  subtitle,
  labels,
  series,
  tabs,
  legend,
  extra,
  height = 240,
  formatValue,
  axisFormat,
  rightAxisFormat,
  tipRows,
  onClose,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  labels: string[];
  series: ChartSeries[];
  tabs?: LandscapeTabs;
  legend?: LandscapeLegend;
  extra?: React.ReactNode;
  height?: number;
  formatValue: (value: number) => string;
  axisFormat?: (value: number) => string;
  rightAxisFormat?: (value: number) => string;
  tipRows?: (index: number) => ChartTipRow[];
  onClose: () => void;
}) {
  useEffect(() => {
    const host = document.getElementById('cc-phone-portal');
    if (!host) return undefined;

    const apply = () => {
      const scale = Math.min(
        1,
        Math.max(0.4, Math.min((window.innerWidth - 32) / 850, (window.innerHeight - 32) / 410)),
      );
      host.style.setProperty('--cc-landscape-scale', String(scale));
    };

    if (open) {
      apply();
      host.classList.add('is-landscape');
      window.addEventListener('resize', apply);
    } else {
      host.classList.remove('is-landscape');
      host.style.removeProperty('--cc-landscape-scale');
    }

    return () => {
      window.removeEventListener('resize', apply);
      host.classList.remove('is-landscape');
      host.style.removeProperty('--cc-landscape-scale');
    };
  }, [open]);

  if (!open) return null;
  const target = document.getElementById('cc-sheet-layer') ?? document.body;
  const visibleSeries = legend ? series.filter((item) => !legend.hidden.includes(item.key)) : series;

  return createPortal(
    <div className="cc-landscape-mask" role="dialog" aria-modal="true" aria-label={`${title}横屏查看`}>
      <div className="cc-landscape-frame">
        <div className="cc-landscape-head">
          <div>
            <div className="cc-landscape-kicker">横屏查看</div>
            <div className="cc-landscape-title">
              {title}
              {subtitle ? <span className="cc-landscape-sub">{subtitle}</span> : null}
            </div>
          </div>
          <div className="cc-landscape-head-right">
            <button type="button" className="cc-landscape-close" onClick={onClose}>
              <RotateCcw size={14} /> 退出横屏
            </button>
          </div>
        </div>
        {tabs ? (
          <div className="cc-landscape-tabs">
            <Segmented
              value={tabs.value}
              options={tabs.options}
              variant={tabs.variant ?? 'tabs'}
              onChange={tabs.onChange}
            />
          </div>
        ) : null}
        {legend && series.length > 1 ? (
          <div className="cc-landscape-legend">
            {series.map((item) => {
              const isHidden = legend.hidden.includes(item.key);
              return (
                <button
                  type="button"
                  key={item.key}
                  className={`cc-landscape-legend-item${isHidden ? ' is-hidden' : ''}`}
                  onClick={() => legend.onToggle(item.key)}
                >
                  <i style={{ background: item.color }} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        ) : null}
        {extra ? <div className="cc-landscape-extra">{extra}</div> : null}
        <div className="cc-landscape-chart">
          <Chart
            labels={labels}
            series={visibleSeries}
            height={height}
            formatValue={formatValue}
            axisFormat={axisFormat}
            rightAxisFormat={rightAxisFormat}
            tipRows={tipRows}
            ariaLabel={`${title}横屏查看`}
          />
        </div>
      </div>
    </div>,
    target,
  );
}
