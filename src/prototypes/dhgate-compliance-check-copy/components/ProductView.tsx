import React, { useState } from 'react';
import { ITEM_COVERAGE } from '../lib/scenarios';
import { AnchorGroup, Issue, coverageMatches } from '../lib/issues';
import { ItemView, Task, TaskStatus } from '../lib/store';
import { ProductSnapshot } from '../lib/product';
import { IMAGES, TaskStatusTag, copyText, fmtTime } from './ui';
import { MarkerBadge, SEVERITY_LABEL, SectionHead, WeakCheck, renderHighlight } from './Anchors';

interface SectionMeta {
  text: string;
  tone: 'clean' | 'checking' | 'issue';
}

export function ProductView({
  task,
  snapshot,
  items,
  issues,
  groups,
  statusShown,
  activeKey,
  onOpenGroup,
}: {
  task: Task;
  snapshot: ProductSnapshot;
  items: ItemView[];
  issues: Issue[];
  groups: AnchorGroup[];
  statusShown: TaskStatus;
  activeKey: string | null;
  onOpenGroup: (key: string) => void;
}) {
  const groupMap = new Map(groups.map((group) => [group.key, group]));
  const settledPatterns = items
    .filter((item) => ['pass', 'violation', 'suspect', 'manual'].includes(item.status))
    .flatMap((item) => ITEM_COVERAGE[item.code]);
  const pendingPatterns = items
    .filter((item) => item.status === 'queued' || item.status === 'running')
    .flatMap((item) => ITEM_COVERAGE[item.code]);
  const fieldChecked = (key: string) => !groupMap.has(key) && settledPatterns.some((pattern) => coverageMatches(pattern, key));
  const pendingOn = (keys: string[]) => keys.some((key) => pendingPatterns.some((pattern) => coverageMatches(pattern, key)));

  const metaOf = (issueCount: number, keys: string[]): SectionMeta => {
    if (issueCount > 0) return { text: `${issueCount} 处问题`, tone: 'issue' };
    if (pendingOn(keys)) return { text: '检测中', tone: 'checking' };
    return { text: '未发现问题 ✓', tone: 'clean' };
  };

  const issuesIn = (...types: string[]) => issues.filter((issue) => types.includes(issue.anchor.type));

  /* ---- 基本信息 ---- */
  const basicIssues = issuesIn('title', 'category');
  const titleGroup = groupMap.get('title');
  const categoryGroup = groupMap.get('category');
  const titleFragment = titleGroup?.issues.find((issue) => issue.anchor.fragment)?.anchor.fragment;
  const categoryFragment = categoryGroup?.issues.find((issue) => issue.anchor.fragment)?.anchor.fragment;

  /* ---- 媒体 ---- */
  const mainKeys = snapshot.mainImages.map((_, index) => `mainImage:${index + 1}`);
  const mainGroups = mainKeys.map((key) => groupMap.get(key));
  const mainBad = mainGroups.filter(Boolean).length;
  const skuImageKeys = snapshot.skuImages.map((_, index) => `skuImage:${index + 1}`);
  const skuImageGroups = skuImageKeys.map((key) => groupMap.get(key));
  const skuImageBad = skuImageGroups.filter(Boolean).length;

  /* ---- 价格 ---- */
  const priceIssues = issuesIn('skuTable', 'ladder');
  const ladderBase = groupMap.get('ladder');
  const skuBase = groupMap.get('skuTable');

  /* ---- 属性 ---- */
  const attributeIssues = issuesIn('attribute');

  /* ---- 尺码表 ---- */
  const sizeIssues = issuesIn('sizeChart');
  const sizeGroup = groupMap.get('sizeChart');

  /* ---- 详情 ---- */
  const detailKeys = snapshot.detailImages.map((image) => `detailImage:${image.index}`);
  const detailIssues = issuesIn('detailImage');
  const detailBad = detailKeys.filter((key) => groupMap.has(key)).length;
  // 详情文字按段落从 1 起编号，问题锚点用 detailText:N
  const textOrdinals = new Map<number, number>();
  let textOrdinal = 0;
  snapshot.detailBlocks.forEach((block, index) => {
    if (block.type === 'text') {
      textOrdinal += 1;
      textOrdinals.set(index, textOrdinal);
    }
  });
  const detailTextIssues = issuesIn('detailText');
  const detailProblems: string[] = [];
  if (detailBad > 0) detailProblems.push(`${detailBad} 张图片有问题`);
  if (detailTextIssues.length > 0) detailProblems.push(`文字 ${detailTextIssues.length} 处`);

  /* ---- 整品风险 ---- */
  const productIssues = issuesIn('product');

  return (
    <div className="dcc-pv">
      <ProductRiskBar issues={productIssues} onOpenGroup={onOpenGroup} />
      <section className="dcc-pv-section" id="anchor-basic" data-annotation-id="dcc-summary-card">
        <div data-annotation-id="dcc-pv-basic">
          <SectionHead title="基本信息" meta={metaOf(basicIssues.length, ['title', 'category']).text} tone={metaOf(basicIssues.length, ['title', 'category']).tone} />
        </div>
        <div className="dcc-pv-title-row" id="anchor-title">
          <h2 className="dcc-pv-title-text">{renderHighlight(snapshot.title, titleFragment)}</h2>
          {titleGroup ? (
            <MarkerBadge
              count={titleGroup.issues.length}
              severity={titleGroup.severity}
              inline
              active={activeKey === 'title'}
              onClick={() => onOpenGroup('title')}
            />
          ) : fieldChecked('title') ? <WeakCheck /> : null}
        </div>
        <div className="dcc-pv-fields">
          <div className={`dcc-pv-field${categoryGroup ? ' has-issue' : ''}${activeKey === 'category' ? ' is-active' : ''}`} id="anchor-category">
            <span className="dcc-pv-label">类目</span>
            <span className="dcc-pv-value">
              {renderHighlight(snapshot.category, categoryFragment)}
              {categoryGroup ? (
                <MarkerBadge
                  count={categoryGroup.issues.length}
                  severity={categoryGroup.severity}
                  inline
                  active={activeKey === 'category'}
                  onClick={() => onOpenGroup('category')}
                />
              ) : fieldChecked('category') ? <WeakCheck /> : null}
            </span>
          </div>
          <div className="dcc-pv-field">
            <span className="dcc-pv-label">链接</span>
            <span className="dcc-pv-value">
              <a className="dcc-link-clip" href={snapshot.link} target="_blank" rel="noreferrer" title={snapshot.link}>{snapshot.link}</a>
              <button type="button" className="dcc-btn dcc-btn--text" onClick={() => copyText(snapshot.link, '商品链接已复制')}>复制</button>
            </span>
          </div>
          <div className="dcc-pv-field">
            <span className="dcc-pv-label">价格区间</span>
            <span className="dcc-pv-value">{snapshot.priceRange}</span>
          </div>
          <div className="dcc-pv-field">
            <span className="dcc-pv-label">SKU 数量</span>
            <span className="dcc-pv-value">{snapshot.skuCount}</span>
          </div>
          <div className="dcc-pv-field">
            <span className="dcc-pv-label">采集时间</span>
            <span className="dcc-pv-value">{fmtTime(task.collectedAt ?? task.submitTime + 2800)}</span>
          </div>
          <div className="dcc-pv-field">
            <span className="dcc-pv-label">任务状态</span>
            <span className="dcc-pv-value"><TaskStatusTag status={statusShown} mini /></span>
          </div>
        </div>
      </section>

      <section className="dcc-pv-section" id="anchor-media">
        <div className="dcc-pv-subhead" data-annotation-id="dcc-pv-main-image">
          <SectionHead
            title="主图"
            meta={`${snapshot.mainImages.length} 张 · ${mainBad ? `${mainBad} 张有问题` : metaOf(0, mainKeys).text}`}
            tone={mainBad ? 'issue' : metaOf(0, mainKeys).tone}
          />
        </div>
        <div className="dcc-pv-main-grid">
          {snapshot.mainImages.map((src, index) => {
            const key = `mainImage:${index + 1}`;
            const group = groupMap.get(key);
            return (
              <figure key={key} id={`anchor-${key}`} className={`dcc-pv-media${group ? ' has-issue' : ''}${activeKey === key ? ' is-active' : ''}`}>
                <div className="dcc-pv-media-frame">
                  <img src={IMAGES[src as keyof typeof IMAGES]} alt={`主图 ${index + 1}`} loading="eager" />
                  {group ? (
                    <MarkerBadge
                      count={group.issues.length}
                      severity={group.severity}
                      active={activeKey === key}
                      onClick={() => onOpenGroup(key)}
                    />
                  ) : null}
                </div>
                <figcaption>主图 {index + 1}</figcaption>
              </figure>
            );
          })}
        </div>

        <div className="dcc-pv-subhead" data-annotation-id="dcc-pv-sku-image">
          <SectionHead
            title="SKU 图"
            meta={`${snapshot.skuImages.length} 张 · ${skuImageBad ? `${skuImageBad} 张有问题` : metaOf(0, skuImageKeys).text}`}
            tone={skuImageBad ? 'issue' : metaOf(0, skuImageKeys).tone}
          />
        </div>
        <div className="dcc-pv-sku-grid">
          {snapshot.skuImages.map((image, index) => {
            const key = `skuImage:${index + 1}`;
            const group = groupMap.get(key);
            return (
              <figure key={key} id={`anchor-${key}`} className={`dcc-pv-media${group ? ' has-issue' : ''}${activeKey === key ? ' is-active' : ''}`}>
                <div className="dcc-pv-media-frame dcc-pv-media-frame--square">
                  <img src={IMAGES[image.src as keyof typeof IMAGES]} alt={image.label} loading="lazy" />
                  {group ? (
                    <MarkerBadge
                      count={group.issues.length}
                      severity={group.severity}
                      active={activeKey === key}
                      onClick={() => onOpenGroup(key)}
                    />
                  ) : null}
                </div>
                <figcaption>{image.label}</figcaption>
              </figure>
            );
          })}
        </div>
      </section>

      <section className="dcc-pv-section" id="anchor-price">
        <div data-annotation-id="dcc-pv-price">
          <SectionHead title="价格" meta={metaOf(priceIssues.length, ['skuTable', 'ladder']).text} tone={metaOf(priceIssues.length, ['skuTable', 'ladder']).tone} />
        </div>
        <div className="dcc-pv-price-grid">
          <div className="dcc-pv-table-wrap" id="anchor-skuTable">
            <div className="dcc-pv-table-title">
              SKU 价格与库存
              {skuBase ? (
                <MarkerBadge count={skuBase.issues.length} severity={skuBase.severity} inline onClick={() => onOpenGroup('skuTable')} />
              ) : null}
            </div>
            <table className="dcc-table dcc-pv-table">
              <thead>
                <tr><th>规格</th><th>价格</th><th>库存</th></tr>
              </thead>
              <tbody>
                {snapshot.skuRows.map((row) => {
                  const key = `skuTable:${row.sku}`;
                  const group = groupMap.get(key);
                  return (
                    <tr key={row.sku} id={group ? `anchor-${key}` : undefined} className={group ? 'is-bad' : undefined}>
                      <td>{row.sku}</td>
                      <td>
                        {row.price}
                        {group ? (
                          <MarkerBadge
                            count={group.issues.length}
                            severity={group.severity}
                            inline
                            active={activeKey === key}
                            onClick={() => onOpenGroup(key)}
                          />
                        ) : null}
                      </td>
                      <td>{row.stock}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="dcc-pv-table-wrap" id="anchor-ladder">
            <div className="dcc-pv-table-title">
              批发阶梯价
              {ladderBase ? (
                <MarkerBadge count={ladderBase.issues.length} severity={ladderBase.severity} inline onClick={() => onOpenGroup('ladder')} />
              ) : null}
            </div>
            <table className="dcc-table dcc-pv-table">
              <thead>
                <tr><th>档位</th><th>数量</th><th>单价</th></tr>
              </thead>
              <tbody>
                {snapshot.ladderRows.map((row) => {
                  const key = `ladder:${row.tier}`;
                  const group = groupMap.get(key);
                  return (
                    <tr key={row.tier} id={group ? `anchor-${key}` : undefined} className={group ? 'is-bad' : undefined}>
                      <td>第 {row.tier} 档</td>
                      <td>{row.qty}</td>
                      <td>
                        {row.price}
                        {group ? (
                          <MarkerBadge
                            count={group.issues.length}
                            severity={group.severity}
                            inline
                            active={activeKey === key}
                            onClick={() => onOpenGroup(key)}
                          />
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="dcc-pv-section" id="anchor-size-chart">
        <div data-annotation-id="dcc-pv-size-chart">
          <SectionHead title="尺码表" meta={metaOf(sizeIssues.length, ['sizeChart']).text} tone={metaOf(sizeIssues.length, ['sizeChart']).tone} />
        </div>
        {snapshot.sizeChart ? (
          <div className={`dcc-pv-size-grid${sizeGroup ? ' has-issue' : ''}`}>
            <div className="dcc-pv-table-wrap" id="anchor-sizeChart">
              <div className="dcc-pv-table-title">
                系统尺码模板
                {sizeGroup ? (
                  <MarkerBadge
                    count={sizeGroup.issues.length}
                    severity={sizeGroup.severity}
                    inline
                    active={activeKey === 'sizeChart'}
                    onClick={() => onOpenGroup('sizeChart')}
                  />
                ) : fieldChecked('sizeChart') ? <WeakCheck /> : null}
              </div>
              <div className="dcc-pv-size-name">{snapshot.sizeChart.templateName}</div>
              <table className="dcc-table dcc-pv-table">
                <thead>
                  <tr>{snapshot.sizeChart.columns.map((column) => <th key={column}>{column}</th>)}</tr>
                </thead>
                <tbody>
                  {snapshot.sizeChart.rows.map((row) => (
                    <tr key={row.cells[0]}>
                      {row.cells.map((cell, cellIndex) => (
                        <td key={cellIndex} className={row.bad?.includes(cellIndex) ? 'is-bad-cell' : undefined}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="dcc-pv-table-wrap dcc-pv-size-detail">
              <div className="dcc-pv-table-title">详情图尺码表</div>
              {snapshot.sizeChart.detail ? (
                <figure className="dcc-pv-size-figure">
                  <img src={IMAGES[snapshot.sizeChart.detail.src as keyof typeof IMAGES]} alt={snapshot.sizeChart.detail.caption} loading="lazy" />
                  <figcaption>详情图 {snapshot.sizeChart.detail.index}</figcaption>
                </figure>
              ) : (
                <p className="dcc-pv-size-note">详情图未提供尺码表，本次仅比对系统尺码模板与在售 SKU 尺码。</p>
              )}
            </div>
          </div>
        ) : (
          <p className="dcc-pv-size-note">未获取到尺码表数据：系统尺码模板与详情图尺码表均缺失。</p>
        )}
      </section>

      <section className="dcc-pv-section" id="anchor-attribute">
        <div data-annotation-id="dcc-pv-attribute">
          <SectionHead title="商品属性" meta={metaOf(attributeIssues.length, ['attribute']).text} tone={metaOf(attributeIssues.length, ['attribute']).tone} />
        </div>
        <div className="dcc-pv-attrs">
          {snapshot.attributes.map((attribute) => {
            const key = `attribute:${attribute.label}`;
            const group = groupMap.get(key);
            const fragment = group?.issues.find((issue) => issue.anchor.fragment)?.anchor.fragment;
            return (
              <div
                key={attribute.label}
                id={`anchor-${key}`}
                className={`dcc-pv-attr${group ? ' has-issue' : ''}${activeKey === key ? ' is-active' : ''}`}
              >
                <span className="dcc-pv-label">{attribute.label}</span>
                <span className="dcc-pv-value">
                  {renderHighlight(attribute.value, fragment)}
                  {group ? (
                    <MarkerBadge
                      count={group.issues.length}
                      severity={group.severity}
                      inline
                      active={activeKey === key}
                      onClick={() => onOpenGroup(key)}
                    />
                  ) : fieldChecked(key) ? <WeakCheck /> : null}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="dcc-pv-section" id="anchor-detail">
        <div data-annotation-id="dcc-pv-detail">
          <SectionHead
            title="详情描述"
            meta={detailProblems.length > 0
              ? `${snapshot.detailImages.length} 张 · ${detailProblems.join(' · ')}`
              : `${snapshot.detailImages.length} 张 · ${metaOf(0, detailKeys).text}`}
            tone={detailProblems.length > 0 ? 'issue' : metaOf(0, detailKeys).tone}
          />
        </div>
        <div className="dcc-pv-detail-list">
          {snapshot.detailBlocks.map((block, blockIndex) => {
            if (block.type === 'text') {
              const key = `detailText:${textOrdinals.get(blockIndex)}`;
              const group = groupMap.get(key);
              const fragment = group?.issues.find((issue) => issue.anchor.fragment)?.anchor.fragment;
              return (
                <div
                  key={`text-${blockIndex}`}
                  id={`anchor-${key}`}
                  className={`dcc-pv-detail-text-row${group ? ' has-issue' : ''}${activeKey === key ? ' is-active' : ''}`}
                >
                  <p className="dcc-pv-detail-text">{renderHighlight(block.text, fragment)}</p>
                  {group ? (
                    <MarkerBadge
                      count={group.issues.length}
                      severity={group.severity}
                      inline
                      active={activeKey === key}
                      onClick={() => onOpenGroup(key)}
                    />
                  ) : null}
                </div>
              );
            }
            const key = `detailImage:${block.index}`;
            const group = groupMap.get(key);
            return (
              <figure key={key} id={`anchor-${key}`} className={`dcc-pv-detail${group ? ' has-issue' : ''}${activeKey === key ? ' is-active' : ''}`}>
                <div className="dcc-pv-media-frame">
                  <img src={IMAGES[block.src as keyof typeof IMAGES]} alt={block.caption ?? `详情图 ${block.index}`} loading="lazy" />
                  {group ? (
                    <MarkerBadge
                      count={group.issues.length}
                      severity={group.severity}
                      active={activeKey === key}
                      onClick={() => onOpenGroup(key)}
                    />
                  ) : null}
                </div>
                <figcaption>详情图 {block.index}</figcaption>
              </figure>
            );
          })}
        </div>
      </section>
    </div>
  );
}

/** 整品级风险：禁售、限售资质等不落在具体商品信息上的问题 */
export function ProductRiskBar({ issues, onOpenGroup }: { issues: Issue[]; onOpenGroup: (key: string) => void }) {
  const [open, setOpen] = useState(false);
  if (issues.length === 0) {
    return (
      <div className="dcc-risk-bar is-clean" data-annotation-id="dcc-pv-risk">
        <span className="dcc-risk-badge dcc-risk-badge--clean">整品风险</span>
        <span className="dcc-risk-brief">未发现禁售、限售与赌博类整品级问题</span>
      </div>
    );
  }
  const first = issues[0];
  return (
    <div className="dcc-risk-bar" data-annotation-id="dcc-pv-risk">
      <div className="dcc-risk-head">
        <span className="dcc-risk-badge">整品风险 {issues.length} 项</span>
        <span className="dcc-risk-brief">{first.itemName}：{first.reason}</span>
        <button type="button" className="dcc-btn dcc-btn--text" onClick={() => setOpen((prev) => !prev)}>
          {open ? '收起' : '展开全部'}
        </button>
      </div>
      {open && (
        <div className="dcc-risk-list">
          {issues.map((issue) => (
            <div key={issue.key} className="dcc-risk-item">
              <span className={`dcc-risk-sev dcc-risk-sev--${issue.severity}`}>{issue.severityLabel ?? SEVERITY_LABEL[issue.severity]}</span>
              <span className="dcc-risk-item-name">{issue.itemName}</span>
              <span className="dcc-risk-item-reason">{issue.reason}</span>
              <button type="button" className="dcc-btn dcc-btn--text" onClick={() => onOpenGroup('product')}>查看</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
