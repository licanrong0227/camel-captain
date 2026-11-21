import React, { useMemo, useState } from 'react';

import { TemplateDialog } from '../components/TemplateDialog';
import {
    INITIAL_TEMPLATES,
    PARAM_LABEL,
    PricingTemplate,
} from '../data/templates';

interface DialogState {
    mode: 'create' | 'edit' | 'copy';
    target?: PricingTemplate;
}

function nowText() {
    const date = new Date();
    const pad = (value: number) => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function ReferencePricingTemplate() {
    const [templates, setTemplates] = useState<PricingTemplate[]>(INITIAL_TEMPLATES);
    const [keyword, setKeyword] = useState('');
    const [dialog, setDialog] = useState<DialogState | null>(null);
    const [deleting, setDeleting] = useState<PricingTemplate | null>(null);
    const [toast, setToast] = useState('');

    const filtered = useMemo(() => {
        const text = keyword.trim();
        if (!text) return templates;
        return templates.filter((item) => item.name.includes(text));
    }, [templates, keyword]);

    const showToast = (message: string) => {
        setToast(message);
        window.setTimeout(() => setToast(''), 2000);
    };

    const dialogTitle = dialog?.mode === 'edit'
        ? '编辑参考定价模板'
        : dialog?.mode === 'copy'
            ? '复制参考定价模板'
            : '新增参考定价模板';

    const dialogInitial = dialog?.mode === 'copy' && dialog.target
        ? { ...dialog.target, id: '', name: `${dialog.target.name} 副本` }
        : dialog?.target ?? null;

    const existingNames = templates
        .filter((item) => !(dialog?.mode === 'edit' && dialog.target && item.id === dialog.target.id))
        .map((item) => item.name);

    const onSave = (draft: { name: string; params: PricingTemplate['params']; formula: string }) => {
        if (dialog?.mode === 'edit' && dialog.target) {
            setTemplates((list) => list.map((item) => (
                item.id === dialog.target?.id
                    ? { ...item, name: draft.name, params: draft.params, formula: draft.formula, updatedAt: nowText() }
                    : item
            )));
            showToast('模板已更新');
        } else {
            setTemplates((list) => [
                { id: `tpl-${Date.now()}`, name: draft.name, params: draft.params, formula: draft.formula, updatedAt: nowText() },
                ...list,
            ]);
            showToast('模板已创建');
        }
        setDialog(null);
    };

    const confirmDelete = () => {
        if (!deleting) return;
        setTemplates((list) => list.filter((item) => item.id !== deleting.id));
        showToast('模板已删除');
        setDeleting(null);
    };

    return (
        <>
            <section className="ops-card rpt-page">
                <div className="rpt-toolbar">
                    <div className="rpt-toolbar-title">
                        参考定价模板
                        <span className="rpt-count">{filtered.length} 个</span>
                    </div>
                    <div className="rpt-toolbar-actions">
                        <input
                            className="ops-input rpt-search"
                            placeholder="搜索模板名称"
                            value={keyword}
                            onChange={(event) => setKeyword(event.target.value)}
                        />
                        <button type="button" className="ops-btn is-primary" onClick={() => setDialog({ mode: 'create' })}>
                            + 新增模板
                        </button>
                    </div>
                </div>

                <div className="rpt-table-wrap">
                    <table className="rpt-table">
                        <colgroup>
                            <col style={{ width: '17%' }} />
                            <col style={{ width: '30%' }} />
                            <col style={{ width: '32%' }} />
                            <col style={{ width: '11%' }} />
                            <col style={{ width: '10%' }} />
                        </colgroup>
                        <thead>
                            <tr>
                                <th>模板名称</th>
                                <th>使用参数</th>
                                <th>定价公式</th>
                                <th>更新时间</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((item) => (
                                <tr key={item.id}>
                                    <td className="rpt-name" title={item.name}>{item.name}</td>
                                    <td>
                                        <div className="rpt-tags">
                                            {item.params.map((key) => (
                                                <span className="rpt-tag" key={key}>{PARAM_LABEL[key]}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td>
                                        <span className="rpt-formula-text" title={`上新价 = ${item.formula}`}>
                                            上新价 = {item.formula}
                                        </span>
                                    </td>
                                    <td className="rpt-time">{item.updatedAt}</td>
                                    <td>
                                        <div className="rpt-row-actions">
                                            <button type="button" className="rpt-link" onClick={() => setDialog({ mode: 'edit', target: item })}>编辑</button>
                                            <button type="button" className="rpt-link" onClick={() => setDialog({ mode: 'copy', target: item })}>复制</button>
                                            <button type="button" className="rpt-link is-danger" onClick={() => setDeleting(item)}>删除</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 ? (
                        <div className="rpt-list-empty">
                            {templates.length === 0 ? '暂无参考定价模板，点击右上角新增模板' : '没有匹配的模板'}
                        </div>
                    ) : null}
                </div>
            </section>

            {dialog ? (
                <TemplateDialog
                    title={dialogTitle}
                    initial={dialogInitial}
                    existingNames={existingNames}
                    onClose={() => setDialog(null)}
                    onSave={onSave}
                />
            ) : null}

            {deleting ? (
                <div className="ops-modal-mask">
                    <div className="ops-modal rpt-confirm" role="dialog" aria-modal="true" aria-label="删除模板">
                        <header className="rpt-dialog-head">
                            <h3>删除模板</h3>
                            <button type="button" className="rpt-dialog-close" aria-label="关闭" onClick={() => setDeleting(null)}>
                                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                                    <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                                </svg>
                            </button>
                        </header>
                        <div className="rpt-confirm-body">
                            确认删除「{deleting.name}」？删除后前端将无法再应用该模板。
                        </div>
                        <footer className="rpt-dialog-foot">
                            <button type="button" className="ops-btn" onClick={() => setDeleting(null)}>取 消</button>
                            <button type="button" className="ops-btn is-danger" onClick={confirmDelete}>删 除</button>
                        </footer>
                    </div>
                </div>
            ) : null}

            {toast ? <div className="rpt-toast">{toast}</div> : null}
        </>
    );
}
