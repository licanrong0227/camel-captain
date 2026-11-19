import React from 'react';
import { Tooltip } from './Tooltip';

export function MetricHelp({ tip }: { tip: string }) {
  return (
    <span
      className="hd-metric-help"
      onClick={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <Tooltip content={tip}><span className="hd-help">?</span></Tooltip>
    </span>
  );
}
