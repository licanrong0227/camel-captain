import React, { useEffect } from 'react';
import { ITEM_DEFS, ItemCode } from '../lib/scenarios';
import { ITEM_STATUS_TEXT } from '../lib/store';

const ITEM_STATUS_COLORS: Record<string, string> = {
  queued: 'neutral',
  running: 'info',
  pass: 'success',
  violation: 'danger',
  suspect: 'warning',
  manual: 'warning',
  fail: 'danger',
};

export function RulesPage({ anchor }: { anchor?: ItemCode }) {
  useEffect(() => {
    if (!anchor) return;
    const target = document.getElementById(`dcc-rule-${anchor}`);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [anchor]);

  return (
    <div className="dcc-rules">
      <h1 className="dcc-page-title">规则说明</h1>
      <div className="dcc-card">
        <p className="dcc-rules-intro">
          合规检测按敦煌网商品合规规则执行。各质检项<b>独立并行检测、互不干扰</b>：单个质检项失败不影响其他项；
          不通过项均展示命中原因、参考信息与建议解决方案。材质、尺码等信息规范类质检<b>仅校验已填写数据的合法性与一致性</b>。
          检测在后台运行，刷新或离开页面不影响任务。
        </p>
        <div className="dcc-legend">
          <span className="dcc-legend-title">质检项状态图例：</span>
          {(Object.keys(ITEM_STATUS_TEXT) as (keyof typeof ITEM_STATUS_TEXT)[]).map((key) => (
            <span key={key} className={`dcc-tag dcc-tag--item-${key}`} data-color={ITEM_STATUS_COLORS[key]}>
              {ITEM_STATUS_TEXT[key]}
            </span>
          ))}
        </div>
      </div>

      {ITEM_DEFS.map((def, index) => (
        <section className="dcc-card dcc-rule-section" id={`dcc-rule-${def.code}`} key={def.code}>
          <div className="dcc-rule-head">
            <span className="dcc-item-no">{index + 1}</span>
            <h2 className="dcc-rule-title">{def.name}</h2>
            <span className="dcc-rule-group">{def.group}</span>
          </div>
          <div className="dcc-rule-row"><b>检测对象：</b>{def.target}</div>
          <div className="dcc-rule-row"><b>校验规则：</b>{def.rule}</div>
          <div className="dcc-rule-row">
            <b>结果处理：</b>
            违规 → 展示命中原因、命中位置、参考信息（关键词/规则段落/原图/OCR）与整改建议；
            疑似错误或数据不可用 → 提示人工审核；检测失败 → 支持单项重试。
          </div>
        </section>
      ))}

      <div className="dcc-card">
        <div className="dcc-card-title">反馈机制</div>
        <ul className="dcc-rule-list">
          <li><b>点赞/点踩：</b>对每个质检项结果独立反馈；点踩需选择原因（误报、漏报、原因不准、建议不准、参考信息缺失、其他），用于评估对应质检功能的检测质量。</li>
          <li><b>重新检测：</b>创建新任务，旧记录保留；同一商品检测中时不允许并行重复提交。</li>
        </ul>
      </div>
    </div>
  );
}
