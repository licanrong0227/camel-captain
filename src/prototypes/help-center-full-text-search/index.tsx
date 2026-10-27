/**
 * @name 帮助中心-搜索全文
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Home, Search, X } from 'lucide-react';
import { AnnotationViewer, type AnnotationSourceDocument } from '@axhub/annotation';
import annotationSourceDocument from './annotation-source.json';
import articleHtml from './article.html?raw';
import './style.css';

type HelpNode = {
  id: number;
  name: string;
  children?: HelpNode[];
};

const CATALOG: HelpNode[] = [
  { id: 207, name: '运营全流程图' },
  { id: 216, name: '产品概述' },
  {
    id: 6,
    name: '1.快速入门',
    children: [
      { id: 18, name: '1.1注册与登录' },
      { id: 26, name: '1.2首次登录' },
      { id: 221, name: '1.3 界面导航与基础操作' },
    ],
  },
  { id: 224, name: '2.首页 Dashboard' },
  {
    id: 1,
    name: '3.商品管理',
    children: [
      { id: 34, name: '3.1商品采集' },
      {
        id: 43,
        name: '3.2 认领中心与自动编辑',
        children: [
          { id: 229, name: '3.2.1 批量认领流程' },
          { id: 230, name: '3.2.2 AI自动编辑设置项' },
          { id: 231, name: '3.2.3 保存为模板' },
        ],
      },
      { id: 108, name: '3.3 我的商品与刊登' },
    ],
  },
  {
    id: 8,
    name: '4. 交易管理',
    children: [
      { id: 233, name: '4.1 订单同步与查询' },
      { id: 234, name: '4.2 订单处理流程' },
      { id: 235, name: '4.3 批量处理申报信息' },
      { id: 236, name: '4.4 线路审核与物流渠道选择' },
      { id: 237, name: '4.5 订单标记与自动打标' },
    ],
  },
  {
    id: 9,
    name: '5.采购管理',
    children: [
      { id: 238, name: '5.1线上采购' },
      { id: 239, name: '5.2 线下采购与供应商管理' },
      { id: 240, name: '5.3 采购单跟踪' },
      { id: 241, name: '5.4 代发打包与出入库管理' },
    ],
  },
  {
    id: 10,
    name: '6.物流管理',
    children: [
      {
        id: 242,
        name: '6.1 物流商管理与配置',
        children: [
          { id: 243, name: '6.1.1 线上物流商配置' },
          { id: 244, name: '6.1.2 线下物流商配置' },
        ],
      },
      { id: 245, name: '6.2 运单号获取与面单打印' },
      { id: 246, name: '6.3 国际物流轨迹跟踪' },
    ],
  },
  {
    id: 11,
    name: '7.报表中心',
    children: [
      { id: 247, name: '7.1 订单明细报表' },
      { id: 248, name: '7.2 店铺看板' },
    ],
  },
  {
    id: 12,
    name: '8.系统管理',
    children: [
      { id: 249, name: '8.1 组织架构与权限设计' },
      { id: 250, name: '8.2 店铺授权' },
      { id: 251, name: '8.3 采购账号授权' },
      { id: 252, name: '8.4 操作日志' },
    ],
  },
  { id: 13, name: '9.工具箱' },
  { id: 14, name: '即时咨询' },
  {
    id: 15,
    name: '常见问题',
    children: [
      { id: 174, name: '商品相关' },
      { id: 176, name: '订单相关' },
      { id: 177, name: '采购相关' },
      { id: 179, name: '系统相关' },
    ],
  },
  { id: 180, name: '📎 附录' },
];

const DEMO_VIDEO_URL = 'https://my.feishu.cn/docx/PezAdyjJBoj5xFxJPTQcENK9npe?from=from_copylink';

function nodeVisible(node: HelpNode, keyword: string): boolean {
  if (!keyword) return true;
  if (node.name.toLowerCase().includes(keyword)) return true;
  return (node.children || []).some((child) => nodeVisible(child, keyword));
}

const HL_CLASS = 'hcft-hl';
const SNIPPET_EDGE = 6;

type SearchHit = {
  key: string;
  before: string;
  keyword: string;
  after: string;
  anchorId: number | null;
  anchorName: string;
  hlId: string;
};

function blockLabel(block: Element): { anchorId: number | null; anchorName: string } {
  const section = block.closest('.help-doc-section');
  const title = section && section.querySelector(':scope > .help-doc-title');
  return {
    anchorId: section ? Number(section.getAttribute('data-help-anchor')) || null : null,
    anchorName: title ? title.textContent!.trim() : '正文',
  };
}

function clearHighlights(root: HTMLElement | null, parents: Set<Element>) {
  root?.querySelectorAll<HTMLElement>(`.${HL_CLASS}`).forEach((span) => {
    const parent = span.parentElement;
    if (parent) {
      parent.replaceChild(document.createTextNode(span.textContent || ''), span);
      parents.add(parent);
    }
  });
  parents.forEach((node) => node.normalize?.());
  parents.clear();
}

function searchFullText(root: HTMLElement, rawKeyword: string, parents: Set<Element>): SearchHit[] {
  const keyword = rawKeyword.trim();
  if (!keyword) return [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const lowerKeyword = keyword.toLowerCase();
  const hitSpans = new Map<Element, { hit: SearchHit; span: HTMLElement }[]>();

  const textNodes: Text[] = [];
  let found: Text | null;
  while ((found = walker.nextNode() as Text | null)) {
    if (found.data) textNodes.push(found);
  }

  let order = 0;
  for (const textNode of textNodes) {
    const text = textNode.data;
    const lower = text.toLowerCase();
    const ranges: number[] = [];
    let at = lower.indexOf(lowerKeyword);
    while (at !== -1) {
      ranges.push(at);
      at = lower.indexOf(lowerKeyword, at + lowerKeyword.length);
    }
    if (!ranges.length) continue;

    const block = textNode.parentElement?.closest('p, li, td, th, h1, h2, h3, h4, h5, h6');
    if (!block) continue;

    const { anchorId, anchorName } = blockLabel(block);
    const entries = hitSpans.get(block) || [];
    const snippets = ranges.map((start) => ({
      before: text.slice(Math.max(0, start - SNIPPET_EDGE), start),
      matched: text.slice(start, start + keyword.length),
      after: text.slice(start + keyword.length, start + keyword.length + SNIPPET_EDGE),
    }));

    for (let i = ranges.length - 1; i >= 0; i -= 1) {
      const range = document.createRange();
      range.setStart(textNode, ranges[i]);
      range.setEnd(textNode, ranges[i] + keyword.length);
      const span = document.createElement('span');
      span.className = HL_CLASS;
      try {
        range.surroundContents(span);
      } catch {
        continue;
      }
      entries.push({
        hit: {
          key: `hit-${order}`,
          before: snippets[i].before,
          keyword: snippets[i].matched,
          after: snippets[i].after,
          anchorId,
          anchorName,
          hlId: '',
        },
        span,
      });
      order += 1;
      if (textNode.parentElement) parents.add(textNode.parentElement);
    }
    hitSpans.set(block, entries);
  }

  const results: SearchHit[] = [];
  hitSpans.forEach((entries) => {
    if (!entries.length) return;
    entries.sort((a, b) => a.span.compareDocumentPosition(b.span) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);
    entries.forEach(({ hit, span }) => {
      span.id = `hcft-hl-${results.length}`;
      results.push({ ...hit, hlId: span.id });
    });
  });
  return results;
}

function NavRow({
  node,
  depth,
  keyword,
  activeId,
  expandedIds,
  onSelect,
  onToggle,
}: {
  node: HelpNode;
  depth: number;
  keyword: string;
  activeId: number;
  expandedIds: Record<string, boolean>;
  onSelect: (node: HelpNode) => void;
  onToggle: (node: HelpNode) => void;
}) {
  const children = node.children || [];
  const selfMatch = !!keyword && node.name.toLowerCase().includes(keyword);
  const visibleChildren = keyword && !selfMatch
    ? children.filter((child) => nodeVisible(child, keyword))
    : children;
  const expanded = !!keyword || !!expandedIds[String(node.id)] || children.some((child) => child.id === activeId);
  const active = node.id === activeId;

  const rowClass = depth ? `nav-item${active ? ' active' : ''}` : `nav-group-header${active ? ' active' : ''}`;

  return (
    <>
      <div
        className={rowClass}
        data-node-id={node.id}
        style={depth ? { paddingLeft: 16 + depth * 16 } : undefined}
        onClick={() => (children.length ? onToggle(node) : onSelect(node))}
      >
        <span className="nav-name nav-item-text">{node.name}</span>
        {children.length ? <span className="nav-count">{children.length}</span> : null}
        {children.length ? (
          <span
            className="nav-arrow"
            onClick={(e) => {
              if (!depth) return;
              e.stopPropagation();
              onToggle(node);
            }}
          >
            {expanded ? '▾' : '›'}
          </span>
        ) : null}
      </div>
      {visibleChildren.length && expanded
        ? visibleChildren.map((child) => (
            <NavRow
              key={child.id}
              node={child}
              depth={depth + 1}
              keyword={keyword}
              activeId={activeId}
              expandedIds={expandedIds}
              onSelect={onSelect}
              onToggle={onToggle}
            />
          ))
        : null}
    </>
  );
}

export default function Component() {
  const contentRef = useRef<HTMLElement | null>(null);
  const hlParentsRef = useRef<Set<Element>>(new Set());
  const dragStartXRef = useRef<number | null>(null);
  const [navKeyword, setNavKeyword] = useState('');
  const [activeId, setActiveId] = useState(216);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({ '6': true });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [results, setResults] = useState<SearchHit[]>([]);
  const [searchedTerm, setSearchedTerm] = useState('');
  const [activeHitKey, setActiveHitKey] = useState('');

  const html = useMemo(() => ({ __html: articleHtml }), []);

  const clearDocHighlights = useCallback(() => {
    clearHighlights(contentRef.current, hlParentsRef.current);
  }, []);

  const scrollTo = useCallback((id: number) => {
    const root = contentRef.current;
    if (!root) return;
    const target = root.querySelector(`[data-help-anchor="${id}"]`) as HTMLElement | null;
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else root.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSelect = useCallback(
    (node: HelpNode) => {
      setActiveId(node.id);
      scrollTo(node.id);
    },
    [scrollTo],
  );

  const handleToggle = useCallback(
    (node: HelpNode) => {
      setExpandedIds((prev) => ({ ...prev, [String(node.id)]: !prev[String(node.id)] }));
      handleSelect(node);
    },
    [handleSelect],
  );

  const searchDoc = useCallback(
    (term: string) => {
      clearDocHighlights();
      setActiveHitKey('');
      const key = term.trim();
      if (!key || !contentRef.current) {
        setResults([]);
        setSearchedTerm('');
        return;
      }
      setResults(searchFullText(contentRef.current, key, hlParentsRef.current));
      setSearchedTerm(key);
    },
    [clearDocHighlights],
  );

  useEffect(() => {
    if (!drawerOpen) return;
    const timer = window.setTimeout(() => searchDoc(searchKeyword), 150);
    return () => window.clearTimeout(timer);
  }, [drawerOpen, searchKeyword, searchDoc]);

  const resetSearch = useCallback(() => {
    clearDocHighlights();
    setSearchKeyword('');
    setResults([]);
    setSearchedTerm('');
    setActiveHitKey('');
  }, [clearDocHighlights]);

  const openDrawer = useCallback(() => {
    resetSearch();
    setDrawerOpen(true);
  }, [resetSearch]);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    resetSearch();
  }, [resetSearch]);

  const jumpToHit = useCallback((hit: SearchHit) => {
    document.querySelectorAll<HTMLElement>(`.${HL_CLASS}.is-active`).forEach((node) => node.classList.remove('is-active'));
    const el = hit.hlId ? document.getElementById(hit.hlId) : null;
    if (!el) return;
    el.classList.add('is-active');
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setActiveHitKey(hit.key);
  }, []);

  const handleDragStart = useCallback((e: React.PointerEvent) => {
    dragStartXRef.current = e.clientX;
  }, []);

  const handleDragEnd = useCallback(
    (e: React.PointerEvent) => {
      const start = dragStartXRef.current;
      dragStartXRef.current = null;
      if (start !== null && e.clientX - start > 60) closeDrawer();
    },
    [closeDrawer],
  );

  const trimmedKeyword = navKeyword.trim().toLowerCase();
  const hitTotal = results.length;

  return (
    <>
      <div className={`hcft-root${drawerOpen ? ' hcft-drawer-open' : ''}`}>
        <header className="topbar">
          <div className="brand">
            <img
              className="brand-logo"
              src="https://yfg-saas-test.oss-cn-shenzhen.aliyuncs.com/images/34/2026-08/fb37c061-e967-4584-94a6-5fc4e316ad15.png"
              alt="骆驼队长BI"
            />
            <span className="brand-name">帮助中心</span>
          </div>
          <div className="topbar-actions">
            <button className="btn-return-home" type="button">
              <Home size={14} strokeWidth={2} />
              返回首页
            </button>
          </div>
        </header>
        <div className="app-body">
          <aside className="sidebar">
            <div className="sidebar-header">
              <div className="sidebar-title">
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
                章节导航
              </div>
            </div>
            <div className="sidebar-search">
              <input
                type="text"
                placeholder="搜索章节..."
                value={navKeyword}
                onChange={(e) => setNavKeyword(e.target.value)}
              />
            </div>
            <nav className="sidebar-nav">
              {CATALOG.filter((node) => nodeVisible(node, trimmedKeyword)).map((node) => (
                <NavRow
                  key={node.id}
                  node={node}
                  depth={0}
                  keyword={trimmedKeyword}
                  activeId={activeId}
                  expandedIds={expandedIds}
                  onSelect={handleSelect}
                  onToggle={handleToggle}
                />
              ))}
            </nav>
            <a className="sidebar-demo-link" href={DEMO_VIDEO_URL} target="_blank" rel="noopener noreferrer">
              演示视频
            </a>
          </aside>
          <main className="content" ref={contentRef} data-annotation-id="search-doc-highlight">
            <div dangerouslySetInnerHTML={html} />
          </main>
        </div>

        <button
          className="hcft-search-entry"
          data-annotation-id="search-entry"
          type="button"
          title="搜索全文"
          aria-label="搜索全文"
          onClick={openDrawer}
        >
          <Search size={22} strokeWidth={2} />
        </button>
      </div>

      <aside className={`hcft-drawer${drawerOpen ? ' is-open' : ''}`} data-annotation-id="search-drawer" aria-hidden={!drawerOpen}>
        <div
          className="hcft-drawer-handle"
          onPointerDown={handleDragStart}
          onPointerUp={handleDragEnd}
        >
          <span className="hcft-drawer-grip" />
        </div>
        <div className="hcft-drawer-header">
          <span className="hcft-drawer-title">搜索全文</span>
          <button className="hcft-drawer-close" type="button" aria-label="收起" onClick={closeDrawer}>
            <X size={16} strokeWidth={2} />
          </button>
        </div>
        <div className="hcft-drawer-search">
          <div className="hcft-drawer-field" data-annotation-id="search-input">
            <Search size={14} strokeWidth={2} className="hcft-drawer-field-icon" />
            <input
              className="hcft-drawer-input"
              type="text"
              placeholder="搜索全文"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') searchDoc(searchKeyword);
              }}
            />
          </div>
        </div>
        <div className="hcft-drawer-body" data-annotation-id="search-result-list">
          {hitTotal > 0 && (
            <>
              <div className="hcft-drawer-summary">
                「{searchedTerm}」共找到 {hitTotal} 处
              </div>
              <ul className="hcft-hit-list">
                {results.map((hit) => (
                  <li
                    key={hit.key}
                    className={`hcft-hit${activeHitKey === hit.key ? ' is-active' : ''}`}
                    onClick={() => jumpToHit(hit)}
                  >
                    <span className="hcft-hit-from">{hit.anchorName}</span>
                    <span className="hcft-hit-text">
                      …{hit.before}
                      <em className="hcft-hit-key">{hit.keyword}</em>
                      {hit.after}…
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
          {!hitTotal && searchedTerm && (
            <div className="hcft-drawer-empty" data-annotation-id="search-empty">
              <span className="hcft-drawer-empty-icon">
                <Search size={28} strokeWidth={1.5} />
              </span>
              <p>没有找到「{searchedTerm}」相关内容</p>
              <span className="hcft-drawer-empty-tip">换个关键词试试</span>
            </div>
          )}
          {!hitTotal && !searchedTerm && (
            <div className="hcft-drawer-hint">输入关键词，实时在全文中查找相关段落</div>
          )}
        </div>
      </aside>

      <AnnotationViewer
        source={annotationSourceDocument as unknown as AnnotationSourceDocument}
        options={{
          currentPageId: 'help-center-full-text-search',
          toolbarEdge: 'right',
          showToolbar: true,
          showThemeToggle: true,
          showColorFilter: true,
          emptyWhenNoData: true,
        }}
      />
    </>
  );
}
