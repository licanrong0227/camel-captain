import React, { useMemo, useState } from 'react';
import {
  CATEGORY_NODES,
  categoryNode,
  inheritedCategoryCode,
  resolveCategoryCode,
  sanitizeCode,
  type CategoryFallbackMode,
} from './pid-rule-model';
import './pid-rule-dialog.css';

function CloseIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2.8 2.8l6.4 6.4M9.2 2.8 2.8 9.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function MapRadio({ checked, label, onChange }: { checked: boolean; label: string; onChange: () => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      className={`nsp-radio${checked ? ' is-checked' : ''}`}
      onClick={onChange}
    >
      <span className="nsp-radio__inner" />
      <span className="nsp-radio__label">{label}</span>
    </button>
  );
}

function TreeCaret({ open }: { open: boolean }) {
  return (
    <svg className={`nsp-tree-caret${open ? ' is-open' : ''}`} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M4.5 2.5 8 6l-3.5 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function CategoryCodeDialog({
  categoryCodes,
  fallbackCategoryCode,
  categoryFallbackMode,
  onCancel,
  onSave,
}: {
  categoryCodes: Record<string, string>;
  fallbackCategoryCode: string;
  categoryFallbackMode: CategoryFallbackMode;
  onCancel: () => void;
  onSave: (codes: Record<string, string>, fallback: string, mode: CategoryFallbackMode) => void;
}) {
  const [draft, setDraft] = useState<Record<string, string>>(() => ({ ...categoryCodes }));
  const [fallback, setFallback] = useState(fallbackCategoryCode);
  const [mode, setMode] = useState<CategoryFallbackMode>(categoryFallbackMode);
  const [query, setQuery] = useState('');
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());

  const rows = useMemo(() => {
    const map = new Map<string | null, typeof CATEGORY_NODES>();
    CATEGORY_NODES.forEach((node) => {
      const list = map.get(node.parentId) ?? [];
      list.push(node);
      map.set(node.parentId, list);
    });
    const result: Array<{ node: (typeof CATEGORY_NODES)[number]; depth: number; hasChildren: boolean }> = [];
    const walk = (parentId: string | null, depth: number) => {
      (map.get(parentId) ?? []).forEach((node) => {
        const children = map.get(node.id) ?? [];
        result.push({ node, depth, hasChildren: children.length > 0 });
        walk(node.id, depth + 1);
      });
    };
    walk(null, 0);
    return result;
  }, []);

  const normalizedQuery = query.trim().toLowerCase();

  const visibleIds = useMemo(() => {
    if (!normalizedQuery) return null;
    const matched = new Set(
      CATEGORY_NODES.filter((node) => {
        const ownCode = (draft[node.id] ?? '').toLowerCase();
        const effective = resolveCategoryCode(node.id, draft, fallback, mode).code.toLowerCase();
        return (
          node.name.toLowerCase().includes(normalizedQuery) ||
          ownCode.includes(normalizedQuery) ||
          effective.includes(normalizedQuery)
        );
      }).map((node) => node.id),
    );
    if (matched.size === 0) return matched;

    const visible = new Set<string>();
    CATEGORY_NODES.forEach((node) => {
      if (matched.has(node.id)) visible.add(node.id);
      let parentId = node.parentId;
      while (parentId) {
        if (matched.has(parentId)) {
          visible.add(node.id);
          break;
        }
        parentId = categoryNode(parentId)?.parentId ?? null;
      }
    });
    CATEGORY_NODES.forEach((node) => {
      const isAncestorOfMatch = CATEGORY_NODES.some((candidate) => {
        if (!matched.has(candidate.id)) return false;
        let parentId = candidate.parentId;
        while (parentId) {
          if (parentId === node.id) return true;
          parentId = categoryNode(parentId)?.parentId ?? null;
        }
        return false;
      });
      if (isAncestorOfMatch) visible.add(node.id);
    });
    return visible;
  }, [normalizedQuery, draft, fallback, mode]);

  const filteredRows = rows.filter(({ node }) => {
    if (normalizedQuery) return visibleIds?.has(node.id) ?? false;
    let parentId = node.parentId;
    while (parentId) {
      if (collapsed.has(parentId)) return false;
      parentId = categoryNode(parentId)?.parentId ?? null;
    }
    return true;
  });

  const toggleNode = (categoryId: string) => {
    setCollapsed((previous) => {
      const next = new Set(previous);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  };

  const fallbackCode = sanitizeCode(fallback, 6);

  return (
    <div className="nsp-map-mask">
      <section className="nsp-map-dialog" role="dialog" aria-modal="true" aria-label="类目缩写码配置">
        <header className="nsp-map-header">
          <h2 className="nsp-map-title">类目缩写码配置</h2>
          <p className="nsp-map-subtitle">当前类目没有缩写码时，按下方选择使用通用缩写码或继承上一级。</p>
          <button type="button" className="nsp-close" aria-label="关闭" onClick={onCancel}>
            <CloseIcon />
          </button>
        </header>

        <div className="nsp-map-body">
          <div className="nsp-map-universal">
            <div className="nsp-map-universal__text">
              <strong>
                通用缩写码 <span className="nsp-required">*</span>
              </strong>
              <span className="nsp-hint">类目未配置缩写码时使用</span>
            </div>
            <input
              className="nsp-input nsp-map-input nsp-map-fallback"
              value={fallback}
              placeholder="如 GEN"
              aria-label="通用缩写码"
              onChange={(event) => setFallback(sanitizeCode(event.target.value, 6))}
            />
          </div>

          <div className="nsp-map-mode">
            <span className="nsp-map-mode-label">当前类目没有缩写码时</span>
            <MapRadio
              checked={mode === 'universal'}
              label="使用通用缩写码"
              onChange={() => setMode('universal')}
            />
            <MapRadio
              checked={mode === 'inherit'}
              label="继承上一级缩写码"
              onChange={() => setMode('inherit')}
            />
          </div>

          {!fallbackCode && (
            <div className="nsp-error-block">
              <p>通用缩写码必填，未填写无法保存。</p>
            </div>
          )}

          <div className="nsp-map-toolbar">
            <span className="nsp-hint">可配置任意一级；子级为空时按所选取值方式处理。</span>
            <input
              className="nsp-input nsp-map-search"
              value={query}
              placeholder="搜索类目 / 缩写码"
              aria-label="搜索类目"
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <div className="nsp-tree-table">
            <div className="nsp-tree-head">
              <span>类目名称</span>
              <span>缩写码</span>
              <span>生效值</span>
            </div>
            {filteredRows.map(({ node, depth, hasChildren }) => {
              const ownCode = draft[node.id] ?? '';
              const inherited = inheritedCategoryCode(node.id, draft, fallback, mode);
              const effective = resolveCategoryCode(node.id, draft, fallback, mode);
              const isCollapsed = !normalizedQuery && collapsed.has(node.id);
              const placeholder =
                mode === 'universal'
                  ? inherited
                    ? `通用 ${inherited}`
                    : '通用码未配置'
                  : inherited
                    ? `继承 ${inherited}`
                    : '继承';
              const source = effective.isFallback
                ? '通用'
                : effective.sourceNode?.id === node.id
                  ? '当前类目'
                  : `继承 ${effective.sourceNode?.name ?? ''}`;
              return (
                <div className="nsp-tree-row" key={node.id}>
                  <div className="nsp-tree-name" style={{ paddingLeft: 8 + depth * 20 }}>
                    {hasChildren ? (
                      <button
                        type="button"
                        className="nsp-tree-toggle"
                        aria-label={isCollapsed ? `展开${node.name}` : `收起${node.name}`}
                        onClick={() => toggleNode(node.id)}
                      >
                        <TreeCaret open={!isCollapsed} />
                      </button>
                    ) : (
                      <span className="nsp-tree-toggle nsp-tree-toggle--placeholder" />
                    )}
                    <span className="nsp-tree-label">{node.name}</span>
                  </div>
                  <input
                    className="nsp-input nsp-map-input"
                    value={ownCode}
                    placeholder={placeholder}
                    aria-label={`${node.name}缩写码`}
                    onChange={(event) =>
                      setDraft((previous) => ({
                        ...previous,
                        [node.id]: sanitizeCode(event.target.value, 6),
                      }))
                    }
                  />
                  <div className={`nsp-tree-effective${effective.code ? '' : ' is-error'}`}>
                    <span className="nsp-tree-code">{effective.code || '未配置'}</span>
                    {effective.code && <span className="nsp-tree-source">{source}</span>}
                  </div>
                </div>
              );
            })}
            {filteredRows.length === 0 && <div className="nsp-map-empty">没有匹配的类目</div>}
          </div>
        </div>

        <footer className="nsp-map-footer">
          <button type="button" className="ocd-btn ocd-btn--ghost" onClick={onCancel}>
            取消
          </button>
          <button
            type="button"
            className="ocd-btn ocd-btn--primary"
            disabled={!fallbackCode}
            onClick={() => onSave({ ...draft }, fallbackCode, mode)}
          >
            保存
          </button>
        </footer>
      </section>
    </div>
  );
}
