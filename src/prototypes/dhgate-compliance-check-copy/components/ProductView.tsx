import React, { useState } from 'react';
import { ITEM_COVERAGE } from '../lib/scenarios';
import { Issue, coverageMatches, highestIssue, highestSeverity } from '../lib/issues';
import { ItemView, Task, TaskStatus } from '../lib/store';
import { ProductSnapshot } from '../lib/product';
import { IMAGES, TaskStatusTag, copyText, fmtTime } from './ui';
import { LocateDot, SEVERITY_LABEL, SectionHead, renderHighlight } from './Anchors';

interface SectionMeta {
  text: string;
  tone: 'clean' | 'checking' | 'issue' | 'violation' | 'suspect' | 'notice' | 'fail';
}

export function ProductView({
  task,
  snapshot,
  items,
  issues,
  statusShown,
  activeAnchor,
  activeIssueKey,
  hoverAnchor,
  onLocate,
  onHover,
}: {
  task: Task;
  snapshot: ProductSnapshot;
  items: ItemView[];
  issues: Issue[];
  statusShown: TaskStatus;
  activeAnchor: string | null;
  activeIssueKey?: string | null;
  hoverAnchor: string | null;
  onLocate: (anchorKey: string, issueKey?: string, source?: 'anchor' | 'issue') => void;
  onHover: (anchorKey: string | null) => void;
}) {
  const [preview, setPreview] = useState<{ src: string; alt: string } | null>(null);

  const byAnchor = new Map<string, Issue[]>();
  issues.forEach((issue) => {
    byAnchor.set(issue.anchorKey, [...(byAnchor.get(issue.anchorKey) ?? []), issue]);
  });
  const groupOf = (key: string) => byAnchor.get(key) ?? [];
  const sevOf = (key: string) => highestSeverity(groupOf(key));
  const locate = (key: string) => onLocate(key, highestIssue(groupOf(key))?.key);

  const issueClass = (key: string) => {
    const severity = sevOf(key);
    if (!severity) return '';
    return ` has-issue sev-${severity}${activeAnchor === key ? ' is-located' : ''}${hoverAnchor === key ? ' is-hovered' : ''}`;
  };
  const clickProps = (key: string) => {
    if (!sevOf(key)) {
      return { onMouseEnter: () => onHover(key), onMouseLeave: () => onHover(null) };
    }
    return {
      role: 'button' as const,
      tabIndex: 0,
      onClick: () => locate(key),
      onMouseEnter: () => onHover(key),
      onMouseLeave: () => onHover(null),
      onKeyDown: (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          locate(key);
        }
      },
    };
  };
  const dotFor = (key: string, inline?: boolean) => {
    const severity = sevOf(key);
    if (!severity) return null;
    const count = groupOf(key).length;
    return (
      <LocateDot
        severity={severity}
        inline={inline}
        active={activeAnchor === key}
        anchorKey={key}
        label={`${groupOf(key)[0] ? `${groupOf(key)[0].itemName} · ` : ''}${count} 处问题，点击定位`}
        onClick={() => locate(key)}
      />
    );
  };

  const settledPatterns = items
    .filter((item) => ['pass', 'violation', 'suspect', 'manual'].includes(item.status))
    .flatMap((item) => ITEM_COVERAGE[item.code]);
  const pendingPatterns = items
    .filter((item) => item.status === 'queued' || item.status === 'running')
    .flatMap((item) => ITEM_COVERAGE[item.code]);
  const fieldChecked = (key: string) => !byAnchor.has(key) && settledPatterns.some((pattern) => coverageMatches(pattern, key));
  const pendingOn = (keys: string[]) => keys.some((key) => pendingPatterns.some((pattern) => coverageMatches(pattern, key)));

  const issuesForKeys = (keys: string[]) => issues.filter((issue) => keys.some((key) => coverageMatches(key, issue.anchorKey)));

  const severityTone = (keys: string[]): SectionMeta['tone'] => {
    const severity = highestSeverity(issuesForKeys(keys));
    return severity ?? 'clean';
  };

  const metaOf = (issueCount: number, keys: string[]): SectionMeta => {
    const list = issuesForKeys(keys);
    const failCount = list.filter((issue) => issue.severity === 'fail').length;
    const problemCount = Math.max(0, issueCount - failCount);
    if (problemCount > 0) {
      return { text: `${problemCount} 处问题${failCount ? ` · ${failCount} 项检测失败` : ''}`, tone: severityTone(keys) };
    }
    if (failCount > 0) return { text: `${failCount} 项检测失败`, tone: 'fail' };
    if (pendingOn(keys)) return { text: '检测中', tone: 'checking' };
    if (keys.some((key) => fieldChecked(key))) return { text: '未发现问题', tone: 'clean' };
    return { text: '未检查', tone: 'clean' };
  };

  const issuesIn = (...types: string[]) => issues.filter((issue) => types.includes(issue.anchor.type));

  /* ---- 商品整体 ---- */
  const productIssues = issuesIn('product');
  const productProblemCount = productIssues.filter((issue) => issue.severity !== 'fail').length;
  const productFailCount = productIssues.length - productProblemCount;
  const productMeta = productProblemCount > 0
    ? `${productProblemCount} 处问题${productFailCount ? ` · ${productFailCount} 项检测失败` : ''}`
    : productFailCount > 0
      ? `${productFailCount} 项检测失败`
      : '未发现问题';
  const productTone: SectionMeta['tone'] = productProblemCount > 0
    ? severityTone(['product'])
    : productFailCount > 0
      ? 'fail'
      : 'clean';

  /* ---- 基本信息 ---- */
  const basicIssues = issuesIn('title', 'category');
  const titleFragment = groupOf('title').find((issue) => issue.anchor.fragment)?.anchor.fragment;
  const categoryFragment = groupOf('category').find((issue) => issue.anchor.fragment)?.anchor.fragment;

  /* ---- 媒体 ---- */
  const mainKeys = snapshot.mainImages.map((_, index) => `mainImage:${index + 1}`);
  const mainProblem = mainKeys.filter((key) => groupOf(key).some((issue) => issue.severity !== 'fail')).length;
  const mainFail = mainKeys.filter((key) => groupOf(key).length > 0 && !groupOf(key).some((issue) => issue.severity !== 'fail')).length;
  const skuImageKeys = snapshot.skuImages.map((_, index) => `skuImage:${index + 1}`);
  const skuProblem = skuImageKeys.filter((key) => groupOf(key).some((issue) => issue.severity !== 'fail')).length;
  const skuFail = skuImageKeys.filter((key) => groupOf(key).length > 0 && !groupOf(key).some((issue) => issue.severity !== 'fail')).length;
  const mediaMeta = (keys: string[], problem: number, fail: number) => {
    const parts: string[] = [];
    if (problem > 0) parts.push(`${problem} 张有问题`);
    if (fail > 0) parts.push(`${fail} 张检测失败`);
    if (parts.length === 0) parts.push(metaText(0, keys));
    return parts.join(' · ');
  };

  /* ---- 价格 ---- */
  const priceIssues = issuesIn('skuTable', 'ladder');

  /* ---- 属性 ---- */
  const attributeIssues = issuesIn('attribute');
  const attributeKeys = snapshot.attributes.map((attribute) => `attribute:${attribute.label}`);

  /* ---- 尺码表 ---- */
  const sizeIssues = issuesIn('sizeChart');

  /* ---- 详情 ---- */
  const detailKeys = snapshot.detailImages.map((image) => `detailImage:${image.index}`);
  const detailProblemImages = detailKeys.filter((key) => groupOf(key).some((issue) => issue.severity !== 'fail')).length;
  const detailFailImages = detailKeys.filter((key) => groupOf(key).length > 0 && !groupOf(key).some((issue) => issue.severity !== 'fail')).length;
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
  if (detailProblemImages > 0) detailProblems.push(`${detailProblemImages} 张图片有问题`);
  if (detailFailImages > 0) detailProblems.push(`${detailFailImages} 张检测失败`);
  if (detailTextIssues.length > 0) detailProblems.push(`文字 ${detailTextIssues.length} 处`);

  const metaText = (count: number, keys: string[]) => metaOf(count, keys).text;
  const metaTone = (count: number, keys: string[]) => metaOf(count, keys).tone;

  const zoomButton = (src: string, alt: string) => (
    <button
      type="button"
      className="dcc-media-zoom"
      aria-label="查看大图"
      title="查看大图"
      onClick={(event) => {
        event.stopPropagation();
        setPreview({ src, alt });
      }}
    >⤢</button>
  );

  const media = (key: string, src: string, alt: string) => (
    <div className="dcc-pv-media-frame">
      <img src={src} alt={alt} loading="eager" />
      {sevOf(key) ? dotFor(key) : null}
      {zoomButton(src, alt)}
    </div>
  );

  return (
    <div className="dcc-pv">
      {/* 商品整体：只放规则本身作用于整品的条目 */}
      <section
        id="anchor-product"
        data-annotation-id="dcc-pv-product"
        className={`dcc-pv-section dcc-pv-overall${issueClass('product')}`}
        {...clickProps('product')}
      >
        <SectionHead
          title="商品整体"
          meta={productMeta}
          tone={productTone}
        />
        {productIssues.length > 0 ? (
          <div className="dcc-pv-overall-list">
            {productIssues.map((issue) => (
              <div
                key={issue.key}
                role="button"
                tabIndex={0}
                className={`dcc-pv-overall-item${activeIssueKey === issue.key ? ' is-selected' : ''}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onLocate(issue.anchorKey, issue.key, 'issue');
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onLocate(issue.anchorKey, issue.key, 'issue');
                  }
                }}
                onMouseEnter={() => onHover(issue.anchorKey)}
                onMouseLeave={() => onHover(null)}
              >
                <span className={`dcc-sev-tag dcc-sev-tag--${issue.severity}`}>{issue.severityLabel ?? SEVERITY_LABEL[issue.severity]}</span>
                <span className="dcc-pv-overall-name">{issue.itemName}</span>
                <span className="dcc-pv-overall-reason">{issue.reason}</span>
                <LocateDot
                  severity={issue.severity}
                  inline
                  issueKey={issue.key}
                  active={activeIssueKey === issue.key}
                  label="定位到这条记录"
                  onClick={() => onLocate(issue.anchorKey, issue.key, 'issue')}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="dcc-pv-note">未发现禁售、限售与赌博类整品级问题。</p>
        )}
      </section>

      <section className="dcc-pv-section" id="anchor-basic" data-annotation-id="dcc-summary-card">
        <div data-annotation-id="dcc-pv-basic">
          <SectionHead
            title="基本信息"
            meta={metaText(basicIssues.length, ['title', 'category'])}
            tone={metaTone(basicIssues.length, ['title', 'category'])}
          />
        </div>
        <div id="anchor-title" className={`dcc-pv-title-row${issueClass('title')}`} {...clickProps('title')}>
          <h2 className="dcc-pv-title-text">{renderHighlight(snapshot.title, titleFragment)}</h2>
          {dotFor('title', true)}
        </div>
        <div className="dcc-pv-fields">
          <div id="anchor-category" className={`dcc-pv-field${issueClass('category')}`} {...clickProps('category')}>
            <span className="dcc-pv-label">类目</span>
            <span className="dcc-pv-value">
              {renderHighlight(snapshot.category, categoryFragment)}
              {dotFor('category', true)}
            </span>
          </div>
          <div className="dcc-pv-field">
            <span className="dcc-pv-label">链接</span>
            <span className="dcc-pv-value">
              <a className="dcc-link-clip" href={snapshot.link} target="_blank" rel="noreferrer" title={snapshot.link}>{snapshot.link}</a>
              <button type="button" className="dcc-btn dcc-btn--text" onClick={(event) => { event.stopPropagation(); copyText(snapshot.link, '商品链接已复制'); }}>复制</button>
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
            meta={mediaMeta(mainKeys, mainProblem, mainFail)}
            tone={mainProblem + mainFail > 0 ? severityTone(mainKeys) : metaTone(0, mainKeys)}
          />
        </div>
        <div className="dcc-pv-main-grid">
          {snapshot.mainImages.map((src, index) => {
            const key = `mainImage:${index + 1}`;
            return (
              <figure
                key={key}
                id={`anchor-${key}`}
                {...(index === 0 ? { 'data-annotation-id': 'dcc-pv-locate' } : {})}
                className={`dcc-pv-media${issueClass(key)}`}
                {...clickProps(key)}
              >
                {media(key, IMAGES[src as keyof typeof IMAGES], `主图 ${index + 1}`)}
                <figcaption>主图 {index + 1}</figcaption>
              </figure>
            );
          })}
        </div>

        <div className="dcc-pv-subhead" data-annotation-id="dcc-pv-sku-image">
          <SectionHead
            title="SKU 图"
            meta={mediaMeta(skuImageKeys, skuProblem, skuFail)}
            tone={skuProblem + skuFail > 0 ? severityTone(skuImageKeys) : metaTone(0, skuImageKeys)}
          />
        </div>
        <div className="dcc-pv-sku-grid">
          {snapshot.skuImages.map((image, index) => {
            const key = `skuImage:${index + 1}`;
            return (
              <figure
                key={key}
                id={`anchor-${key}`}
                className={`dcc-pv-media${issueClass(key)}`}
                {...clickProps(key)}
              >
                {media(key, IMAGES[image.src as keyof typeof IMAGES], image.label)}
                <figcaption>{image.label}</figcaption>
              </figure>
            );
          })}
        </div>
      </section>

      <section className="dcc-pv-section" id="anchor-price">
        <div data-annotation-id="dcc-pv-price">
          <SectionHead
            title="价格"
            meta={metaText(priceIssues.length, ['skuTable', 'ladder'])}
            tone={metaTone(priceIssues.length, ['skuTable', 'ladder'])}
          />
        </div>
        <div className="dcc-pv-price-grid">
          <div className="dcc-pv-table-wrap" id="anchor-skuTable">
            <div className="dcc-pv-table-title">
              SKU 价格与库存
              {dotFor('skuTable', true)}
            </div>
            <table className="dcc-table dcc-pv-table">
              <thead>
                <tr><th>规格</th><th>价格</th><th>库存</th></tr>
              </thead>
              <tbody>
                {snapshot.skuRows.map((row) => {
                  const key = `skuTable:${row.sku}`;
                  return (
                    <tr
                      key={row.sku}
                      id={byAnchor.has(key) ? `anchor-${key}` : undefined}
                      className={`${byAnchor.has(key) ? `is-bad sev-${sevOf(key)}` : ''}${activeAnchor === key ? ' is-located' : ''}${hoverAnchor === key ? ' is-hovered' : ''}`}
                      {...clickProps(key)}
                    >
                      <td>{row.sku}</td>
                      <td>
                        {row.price}
                        {dotFor(key, true)}
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
              {dotFor('ladder', true)}
            </div>
            <table className="dcc-table dcc-pv-table">
              <thead>
                <tr><th>档位</th><th>数量</th><th>单价</th></tr>
              </thead>
              <tbody>
                {snapshot.ladderRows.map((row) => {
                  const key = `ladder:${row.tier}`;
                  return (
                    <tr
                      key={row.tier}
                      id={byAnchor.has(key) ? `anchor-${key}` : undefined}
                      className={`${byAnchor.has(key) ? `is-bad sev-${sevOf(key)}` : ''}${activeAnchor === key ? ' is-located' : ''}${hoverAnchor === key ? ' is-hovered' : ''}`}
                      {...clickProps(key)}
                    >
                      <td>第 {row.tier} 档</td>
                      <td>{row.qty}</td>
                      <td>
                        {row.price}
                        {dotFor(key, true)}
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
          <SectionHead
            title="尺码表"
            meta={metaText(sizeIssues.length, ['sizeChart'])}
            tone={metaTone(sizeIssues.length, ['sizeChart'])}
          />
        </div>
        {snapshot.sizeChart ? (
          <div
            className={`dcc-pv-size-grid${issueClass('sizeChart')}`}
            id="anchor-sizeChart"
            {...clickProps('sizeChart')}
          >
            <div className="dcc-pv-table-wrap">
              <div className="dcc-pv-table-title">
                系统尺码模板
                {dotFor('sizeChart', true)}
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
                  <div className="dcc-pv-size-figure-inner">
                    <img src={IMAGES[snapshot.sizeChart.detail.src as keyof typeof IMAGES]} alt={snapshot.sizeChart.detail.caption} loading="eager" />
                    {zoomButton(IMAGES[snapshot.sizeChart.detail.src as keyof typeof IMAGES], snapshot.sizeChart.detail.caption)}
                  </div>
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
          <SectionHead
            title="商品属性"
            meta={metaText(attributeIssues.length, attributeKeys)}
            tone={metaTone(attributeIssues.length, attributeKeys)}
          />
        </div>
        <div className="dcc-pv-attrs">
          {snapshot.attributes.map((attribute) => {
            const key = `attribute:${attribute.label}`;
            const fragment = groupOf(key).find((issue) => issue.anchor.fragment)?.anchor.fragment;
            return (
              <div
                key={attribute.label}
                id={`anchor-${key}`}
                className={`dcc-pv-attr${issueClass(key)}`}
                {...clickProps(key)}
              >
                <span className="dcc-pv-label">{attribute.label}</span>
                <span className="dcc-pv-value">
                  {renderHighlight(attribute.value, fragment)}
                  {dotFor(key, true)}
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
              ? detailProblems.join(' · ')
              : metaText(0, detailKeys)}
            tone={detailProblems.length > 0
              ? severityTone(detailKeys.concat(detailTextIssues.map((issue) => issue.anchorKey)))
              : metaTone(0, detailKeys)}
          />
        </div>
        <div className="dcc-pv-detail-list">
          {snapshot.detailBlocks.map((block, blockIndex) => {
            if (block.type === 'text') {
              const key = `detailText:${textOrdinals.get(blockIndex)}`;
              const fragment = groupOf(key).find((issue) => issue.anchor.fragment)?.anchor.fragment;
              return (
                <div
                  key={`text-${blockIndex}`}
                  id={`anchor-${key}`}
                  className={`dcc-pv-detail-text-row${issueClass(key)}`}
                  {...clickProps(key)}
                >
                  <p className="dcc-pv-detail-text">{renderHighlight(block.text, fragment)}</p>
                  {dotFor(key, true)}
                </div>
              );
            }
            const key = `detailImage:${block.index}`;
            return (
              <figure
                key={key}
                id={`anchor-${key}`}
                className={`dcc-pv-detail${issueClass(key)}`}
                {...clickProps(key)}
              >
                {media(key, IMAGES[block.src as keyof typeof IMAGES], block.caption ?? `详情图 ${block.index}`)}
                <figcaption>详情图 {block.index}</figcaption>
              </figure>
            );
          })}
        </div>
      </section>

      {preview && (
        <div className="dcc-lightbox" onClick={() => setPreview(null)}>
          <img src={preview.src} alt={preview.alt} onClick={(event) => event.stopPropagation()} />
          <button type="button" className="dcc-lightbox-close" aria-label="关闭" onClick={() => setPreview(null)}>×</button>
        </div>
      )}
    </div>
  );
}
