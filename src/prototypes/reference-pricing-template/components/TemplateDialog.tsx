import React, { useEffect, useMemo, useRef, useState } from 'react';

import {
    analyzeFormula,
    PARAM_DEFS,
    PARAM_GROUPS,
    PARAM_LABEL,
    ParamKey,
    PricingTemplate,
} from '../data/templates';

interface Draft {
    name: string;
    params: ParamKey[];
    formula: string;
}

interface Props {
    title: string;
    initial?: PricingTemplate | null;
    existingNames: string[];
    onClose: () => void;
    onSave: (draft: Draft) => void;
}

function findParam(key: ParamKey) {
    return PARAM_DEFS.find((item) => item.key === key);
}

export function TemplateDialog({ title, initial, existingNames, onClose, onSave }: Props) {
    const [name, setName] = useState(initial?.name ?? '');
    const [checked, setChecked] = useState<ParamKey[]>(initial?.params ?? []);
    const [formula, setFormula] = useState(initial?.formula ?? '');
    const [submitted, setSubmitted] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    const analysis = useMemo(() => analyzeFormula(formula, checked), [formula, checked]);

    const toggle = (key: ParamKey) => {
        setChecked((list) => (list.includes(key) ? list.filter((item) => item !== key) : [...list, key]));
    };

    const insertToken = (key: ParamKey) => {
        const param = findParam(key);
        if (!param) return;
        const textarea = textareaRef.current;
        if (!textarea) {
            setFormula((value) => value + param.token);
            return;
        }
        const start = textarea.selectionStart ?? formula.length;
        const end = textarea.selectionEnd ?? formula.length;
        const next = `${formula.slice(0, start)}${param.token}${formula.slice(end)}`;
        setFormula(next);
        requestAnimationFrame(() => {
            textarea.focus();
            const cursor = start + param.token.length;
            textarea.setSelectionRange(cursor, cursor);
        });
    };

    const nameError = !name.trim()
        ? '请输入模板名称'
        : existingNames.some((item) => item.trim() === name.trim())
            ? '模板名称已存在'
            : '';
    const formulaEmptyError = !formula.trim() ? '请输入定价公式' : '';
    const paramEmptyError = checked.length === 0 ? '请至少勾选一个参数' : '';
    const unknownError = analysis.unknownTokens.length
        ? `公式中存在无法识别的参数：${analysis.unknownTokens.map((token) => `#${token}#`).join('、')}`
        : '';
    const unusedError = analysis.checkedUnused.length
        ? `以下参数已勾选但未在公式中使用：${analysis.checkedUnused.map((key) => PARAM_LABEL[key]).join('、')}`
        : '';
    const uncheckedError = analysis.uncheckedUsed.length
        ? `公式引用了未勾选的参数：${analysis.uncheckedUsed.map((key) => PARAM_LABEL[key]).join('、')}`
        : '';
    const errors = [paramEmptyError, formulaEmptyError, unknownError, unusedError, uncheckedError, analysis.syntaxError]
        .filter(Boolean);

    const submit = () => {
        setSubmitted(true);
        if (nameError || errors.length > 0) return;
        onSave({ name: name.trim(), params: checked, formula: formula.trim() });
    };

    const usedSet = new Set(analysis.usedKeys);
    const checkedTokenParams = checked
        .map((key) => findParam(key))
        .filter((param): param is NonNullable<typeof param> => Boolean(param));

    return (
        <div className="ops-modal-mask">
            <div className="ops-modal rpt-dialog" role="dialog" aria-modal="true" aria-label={title}>
                <header className="rpt-dialog-head">
                    <h3>{title}</h3>
                    <button type="button" className="rpt-dialog-close" aria-label="关闭" onClick={onClose}>
                        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                        </svg>
                    </button>
                </header>

                <div className="rpt-dialog-body">
                    <div className="rpt-section">基础信息</div>
                    <div className="rpt-field">
                        <label className="rpt-field-label"><i>*</i>模板名称</label>
                        <div className="rpt-field-control">
                            <input
                                className={`ops-input rpt-input${submitted && nameError ? ' is-error' : ''}`}
                                placeholder="请输入模板名称"
                                maxLength={30}
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                            />
                            {submitted && nameError ? <div className="rpt-error">{nameError}</div> : null}
                        </div>
                    </div>

                    <div className="rpt-section">
                        参数选择
                        <span className="rpt-section-sub">勾选的参数必须全部用于定价公式，数值由前端用户填写</span>
                    </div>
                    <div className={`rpt-param-groups${submitted && paramEmptyError ? ' is-error' : ''}`}>
                        {PARAM_GROUPS.map((group) => (
                            <div className="rpt-param-group" key={group.title}>
                                <div className="rpt-param-group-title">{group.title}</div>
                                <div className="rpt-param-list">
                                    {group.keys.map((key) => {
                                        const param = findParam(key);
                                        if (!param) return null;
                                        return (
                                            <label className="rpt-check" key={key}>
                                                <input type="checkbox" checked={checked.includes(key)} onChange={() => toggle(key)} />
                                                <span>{param.label}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                    {submitted && paramEmptyError ? <div className="rpt-error">{paramEmptyError}</div> : null}

                    <div className="rpt-section">
                        定价公式配置
                        <span className="rpt-section-sub">只能使用上方已勾选的参数，公式里的参数会自动带到前端</span>
                    </div>
                    <div className="rpt-field">
                        <label className="rpt-field-label"><i>*</i>上新价 =</label>
                        <div className="rpt-field-control">
                            <textarea
                                ref={textareaRef}
                                className={`ops-input rpt-formula-input${submitted && (formulaEmptyError || unknownError || uncheckedError || analysis.syntaxError) ? ' is-error' : ''}`}
                                rows={3}
                                placeholder="请输入定价公式，如 (#采购成本# + #国内物流成本#) / (1 - #利润率#)"
                                value={formula}
                                onChange={(event) => setFormula(event.target.value)}
                            />
                        </div>
                    </div>
                    <div className="rpt-token-row">
                        {checkedTokenParams.length === 0 ? (
                            <span className="rpt-token-empty">勾选参数后可点击插入公式</span>
                        ) : (
                            checkedTokenParams.map((param) => {
                                const used = usedSet.has(param.key);
                                return (
                                    <button
                                        type="button"
                                        className={`rpt-token${used ? ' is-used' : ''}`}
                                        key={param.key}
                                        title={used ? '已在公式中使用' : '点击插入公式'}
                                        onClick={() => insertToken(param.key)}
                                    >
                                        {used ? (
                                            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                                                <path d="M1.5 5.2 4 7.6 8.6 2.6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        ) : null}
                                        {param.token}
                                    </button>
                                );
                            })
                        )}
                    </div>

                    {submitted && errors.length > 0 ? (
                        <div className="rpt-validation">
                            {errors.map((error) => <div className="rpt-error" key={error}>{error}</div>)}
                        </div>
                    ) : formula.trim() && checked.length > 0 && errors.length === 0 ? (
                        <div className="rpt-validation rpt-validation--ok">公式校验通过，勾选参数均已使用</div>
                    ) : null}
                </div>

                <footer className="rpt-dialog-foot">
                    <button type="button" className="ops-btn" onClick={onClose}>取 消</button>
                    <button type="button" className="ops-btn is-primary" onClick={submit}>保 存</button>
                </footer>
            </div>
        </div>
    );
}
