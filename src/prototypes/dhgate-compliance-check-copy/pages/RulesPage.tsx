import React, { useEffect } from 'react';
import { ITEM_DEFS, ItemCode } from '../lib/scenarios';

export function RulesPage({ anchor }: { anchor?: ItemCode }) {
  useEffect(() => {
    if (!anchor) return;
    const target = document.getElementById(`dcc-rule-${anchor}`);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [anchor]);

  return (
    <div className="dcc-rules">
      <h1 className="dcc-page-title">规则说明</h1>
      <p className="dcc-muted">按照现有产品，暂无需调整</p>

      {/* 规则内容暂时注释，后续需要时恢复
      {ITEM_DEFS.map((def, index) => (
        <section className="dcc-card dcc-rule-section" id={`dcc-rule-${def.code}`} key={def.code}>
          <div className="dcc-rule-head">
            <span className="dcc-item-no">{index + 1}</span>
            <h2 className="dcc-rule-title">{def.name}</h2>
          </div>
          <div className="dcc-rule-row"><b>检测对象：</b>{def.target}</div>
          <div className="dcc-rule-row"><b>校验规则：</b>{def.rule}</div>
        </section>
      ))}
      */}
    </div>
  );
}
