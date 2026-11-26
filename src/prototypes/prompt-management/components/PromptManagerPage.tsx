import React, { useEffect, useMemo, useRef, useState } from 'react';

interface PromptItem {
    id: string;
    name: string;
    content: string;
    callId: string;
    createdAt: string;
    updatedAt: string;
}

const initialPrompts: PromptItem[] = [
    {
        id: 'p1',
        name: '商品标题优化',
        content: '你是跨境电商平台的资深运营。请根据提供的商品信息生成 3 个英文商品标题，每个标题不超过 128 个字符，突出核心卖点与适用场景，不使用夸大或违规词。',
        callId: 'title_optimize',
        createdAt: '2026-11-20 10:12',
        updatedAt: '2026-11-24 16:40',
    },
    {
        id: 'p2',
        name: '商品卖点提炼',
        content: '请阅读提供的商品描述，提炼 5 条英文卖点，每条不超过 20 个单词，按重要性从高到低排序。',
        callId: 'selling_point_extract',
        createdAt: '2026-11-19 15:26',
        updatedAt: '2026-11-23 09:48',
    },
    {
        id: 'p3',
        name: '商品短描述生成',
        content: '请根据商品标题与卖点，生成一段英文短描述，长度 80–150 个单词，语气专业友好，结尾引导买家加入购物车。',
        callId: 'short_desc_generate',
        createdAt: '2026-11-18 11:03',
        updatedAt: '2026-11-22 14:17',
    },
    {
        id: 'p4',
        name: '搜索关键词提取',
        content: '请从商品信息中提取 10 个适合平台搜索的英文关键词，按搜索热度预估排序，用逗号分隔，不要重复。',
        callId: 'keyword_extract',
        createdAt: '2026-11-17 16:55',
        updatedAt: '2026-11-21 10:32',
    },
    {
        id: 'p5',
        name: '商品描述翻译',
        content: '请将商品描述翻译为英文，保持原有分段与格式，专有名词保留原文，不要添加解释。',
        callId: 'desc_translate',
        createdAt: '2026-11-16 09:41',
        updatedAt: '2026-11-20 17:24',
    },
    {
        id: 'p6',
        name: '违禁词改写建议',
        content: '请在不改变原意的前提下改写命中平台违禁词的文本，并列出替换的词语对照。',
        callId: 'bid_word_rewrite',
        createdAt: '2026-11-15 14:08',
        updatedAt: '2026-11-20 11:06',
    },
    {
        id: 'p7',
        name: '客服邮件回复',
        content: '你是店铺客服。请用英文回复买家邮件，语气礼貌专业，先共情再给出处理方案，最后说明后续跟进时间。',
        callId: 'cs_email_reply',
        createdAt: '2026-11-14 10:22',
        updatedAt: '2026-11-19 16:51',
    },
    {
        id: 'p8',
        name: '类目推荐',
        content: '请根据商品信息，推荐 3 个最匹配的平台类目，按匹配度从高到低排序，并说明推荐理由。',
        callId: 'category_suggest',
        createdAt: '2026-11-13 17:36',
        updatedAt: '2026-11-19 09:12',
    },
    {
        id: 'p9',
        name: '尺码表说明生成',
        content: '请根据尺码数据生成一段英文尺码说明，提示买家测量方式与选码建议，字数不超过 100 个单词。',
        callId: 'size_chart_note',
        createdAt: '2026-11-12 15:19',
        updatedAt: '2026-11-18 14:30',
    },
    {
        id: 'p10',
        name: '图片卖点识别',
        content: '请识别图片中与商品卖点相关的文字，按出现顺序输出，忽略水印、店铺名与促销角标，仅保留与商品本身相关的信息。',
        callId: 'image_selling_point_ocr',
        createdAt: '2026-11-11 10:47',
        updatedAt: '2026-11-18 10:05',
    },
    {
        id: 'p11',
        name: '店铺公告生成',
        content: '请根据活动信息生成一段英文店铺公告，包含活动内容、时间范围与参与方式，语气简洁友好。',
        callId: 'shop_notice_generate',
        createdAt: '2026-11-10 16:28',
        updatedAt: '2026-11-17 15:42',
    },
    {
        id: 'p12',
        name: '售后话术生成',
        content: '请针对售后场景生成英文回复话术，包含安抚、处理方案与时效说明三段内容。',
        callId: 'after_sale_script',
        createdAt: '2026-11-09 11:34',
        updatedAt: '2026-11-16 09:58',
    },
];

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50];
const NAME_MAX = 30;
const CONTENT_MAX = 2000;
const CALL_ID_PATTERN = /^[A-Za-z0-9_-]{3,50}$/;

let promptIdCounter = 100;
const nextPromptId = () => `p${++promptIdCounter}`;

const formatNow = () => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const buildPageList = (count: number, current: number): (number | 'left-ellipsis' | 'right-ellipsis')[] => {
    if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
    const pages: (number | 'left-ellipsis' | 'right-ellipsis')[] = [1];
    const start = Math.max(2, current - 2);
    const end = Math.min(count - 1, current + 2);
    if (start > 2) pages.push('left-ellipsis');
    for (let p = start; p <= end; p += 1) pages.push(p);
    if (end < count - 1) pages.push('right-ellipsis');
    pages.push(count);
    return pages;
};

const SearchIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
    </svg>
);

const CopyIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="12" height="12" rx="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
);

interface FormState {
    name: string;
    content: string;
    callId: string;
}

interface FormErrors {
    name?: string;
    content?: string;
    callId?: string;
}

export function PromptManagerPage() {
    const [prompts, setPrompts] = useState<PromptItem[]>(initialPrompts);
    const [keyword, setKeyword] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [sizeMenuOpen, setSizeMenuOpen] = useState(false);
    const [jumpValue, setJumpValue] = useState('1');
    const [dialogMode, setDialogMode] = useState<'add' | 'edit' | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<FormState>({ name: '', content: '', callId: '' });
    const [errors, setErrors] = useState<FormErrors>({});
    const [viewing, setViewing] = useState<PromptItem | null>(null);
    const [pendingDelete, setPendingDelete] = useState<PromptItem | null>(null);
    const [toast, setToast] = useState('');
    const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const sizeMenuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => () => {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    }, []);

    useEffect(() => {
        if (!sizeMenuOpen) return;
        const onDocClick = (e: MouseEvent) => {
            if (sizeMenuRef.current && !sizeMenuRef.current.contains(e.target as Node)) {
                setSizeMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, [sizeMenuOpen]);

    useEffect(() => {
        setCurrentPage(1);
    }, [keyword, pageSize]);

    const showToast = (message: string) => {
        setToast(message);
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        toastTimerRef.current = setTimeout(() => setToast(''), 2000);
    };

    const copyCallId = async (callId: string) => {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(callId);
            } else {
                const input = document.createElement('textarea');
                input.value = callId;
                input.style.position = 'fixed';
                input.style.opacity = '0';
                document.body.appendChild(input);
                input.select();
                document.execCommand('copy');
                document.body.removeChild(input);
            }
            showToast('已复制调用 KEY');
        } catch {
            showToast('复制失败，请手动选择复制');
        }
    };

    const filteredPrompts = useMemo(() => {
        const kw = keyword.trim().toLowerCase();
        if (!kw) return prompts;
        return prompts.filter(item =>
            item.name.toLowerCase().includes(kw) || item.callId.toLowerCase().includes(kw),
        );
    }, [prompts, keyword]);

    const isFiltering = !!keyword.trim();
    const total = filteredPrompts.length;
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(currentPage, pageCount);
    const pagePrompts = filteredPrompts.slice((safePage - 1) * pageSize, safePage * pageSize);

    useEffect(() => {
        if (currentPage > pageCount) setCurrentPage(pageCount);
    }, [currentPage, pageCount]);

    useEffect(() => {
        setJumpValue(String(safePage));
    }, [safePage]);

    const jumpTo = (raw: string) => {
        const target = Number.parseInt(raw, 10);
        if (!Number.isFinite(target)) {
            setJumpValue(String(safePage));
            return;
        }
        const next = Math.min(Math.max(target, 1), pageCount);
        setCurrentPage(next);
        setJumpValue(String(next));
    };

    const generateCallId = () => {
        const used = new Set(prompts.map(item => item.callId));
        let candidate = '';
        do {
            candidate = `prompt_${Math.random().toString(36).slice(2, 8)}`;
        } while (used.has(candidate));
        return candidate;
    };

    const openAdd = () => {
        setDialogMode('add');
        setEditingId(null);
        setForm({ name: '', content: '', callId: generateCallId() });
        setErrors({});
    };

    const openEdit = (item: PromptItem) => {
        setDialogMode('edit');
        setEditingId(item.id);
        setForm({ name: item.name, content: item.content, callId: item.callId });
        setErrors({});
    };

    const closeDialog = () => {
        setDialogMode(null);
        setEditingId(null);
        setErrors({});
    };

    const validate = (): FormErrors => {
        const next: FormErrors = {};
        const name = form.name.trim();
        const content = form.content.trim();
        const callId = form.callId.trim();
        if (!name) {
            next.name = '请输入提示词名称';
        } else if (prompts.some(item => item.id !== editingId && item.name.trim().toLowerCase() === name.toLowerCase())) {
            next.name = '该提示词名称已存在';
        }
        if (!content) {
            next.content = '请输入提示词内容';
        }
        if (!callId) {
            next.callId = '请输入调用 KEY';
        } else if (!CALL_ID_PATTERN.test(callId)) {
            next.callId = '调用 KEY 需为 3–50 位字母、数字、下划线或短横线';
        } else if (prompts.some(item => item.id !== editingId && item.callId.toLowerCase() === callId.toLowerCase())) {
            next.callId = '该调用 KEY 已被占用';
        }
        return next;
    };

    const submitDialog = () => {
        const nextErrors = validate();
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) return;
        const name = form.name.trim();
        const content = form.content.trim();
        const callId = form.callId.trim();
        const now = formatNow();
        if (dialogMode === 'add') {
            setPrompts(prev => [
                { id: nextPromptId(), name, content, callId, createdAt: now, updatedAt: now },
                ...prev,
            ]);
            setCurrentPage(1);
            showToast(`已添加提示词「${name}」`);
        } else if (dialogMode === 'edit' && editingId) {
            setPrompts(prev => prev.map(item => (
                item.id === editingId ? { ...item, name, content, callId, updatedAt: now } : item
            )));
            showToast('修改已保存');
        }
        closeDialog();
    };

    const confirmDelete = () => {
        if (!pendingDelete) return;
        setPrompts(prev => prev.filter(item => item.id !== pendingDelete.id));
        if (viewing?.id === pendingDelete.id) setViewing(null);
        if (editingId === pendingDelete.id) closeDialog();
        setPendingDelete(null);
        showToast('已删除');
    };

    const updateForm = (key: keyof FormState, value: string) => {
        setForm(prev => ({ ...prev, [key]: value }));
        if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
    };

    return (
        <div className="admin-page-card">
            <div className="admin-page-toolbar">
                <div className="admin-toolbar-filters">
                    <div className="admin-search-box">
                        <span className="admin-search-icon"><SearchIcon /></span>
                        <input
                            className="admin-search-input"
                            type="text"
                            value={keyword}
                            placeholder="搜索提示词名称 / 调用 KEY"
                            onChange={e => setKeyword(e.target.value)}
                        />
                        {keyword && (
                            <button className="admin-search-clear" onClick={() => setKeyword('')} title="清空">×</button>
                        )}
                    </div>
                </div>
                <button className="admin-btn admin-btn--primary" onClick={openAdd}>+ 新增提示词</button>
            </div>

            <div className="admin-table-wrap">
                <table className="admin-data-table">
                    <thead>
                        <tr>
                            <th className="is-index">序号</th>
                            <th className="is-prompt-name">提示词名称</th>
                            <th className="is-prompt-content">提示词内容</th>
                            <th className="is-prompt-call-id">调用 KEY</th>
                            <th className="is-time">创建时间</th>
                            <th className="is-time">更新时间</th>
                            <th className="is-actions">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pagePrompts.map((item, index) => (
                            <tr key={item.id}>
                                <td className="is-index">{(safePage - 1) * pageSize + index + 1}</td>
                                <td className="is-prompt-name">
                                    <span className="admin-prompt-name" title={item.name}>{item.name}</span>
                                </td>
                                <td className="is-prompt-content">
                                    <span className="admin-prompt-content" title={item.content}>{item.content}</span>
                                </td>
                                <td className="is-prompt-call-id">
                                    <span className="admin-prompt-call-id">{item.callId}</span>
                                    <button
                                        className="admin-copy-btn"
                                        title="复制调用 KEY"
                                        onClick={() => copyCallId(item.callId)}
                                    >
                                        <CopyIcon />
                                    </button>
                                </td>
                                <td className="is-time">{item.createdAt}</td>
                                <td className="is-time">{item.updatedAt}</td>
                                <td className="is-actions">
                                    <button className="admin-text-btn is-primary" onClick={() => setViewing(item)}>查看</button>
                                    <button className="admin-text-btn is-primary" onClick={() => openEdit(item)}>编辑</button>
                                    <button className="admin-text-btn is-danger" onClick={() => setPendingDelete(item)}>删除</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!pagePrompts.length && (
                    <div className="admin-table-empty">
                        {prompts.length ? '没有匹配的提示词' : '暂无提示词，点击右上角「新增提示词」'}
                    </div>
                )}
            </div>

            <div className="admin-table-footer">
                <span>共 {total} 条{isFiltering ? `（全部 ${prompts.length} 条）` : ''}</span>
                <div className="admin-pagination">
                    <div className="admin-page-size" ref={sizeMenuRef}>
                        <button
                            className={`admin-page-size-btn ${sizeMenuOpen ? 'is-open' : ''}`}
                            onClick={() => setSizeMenuOpen(open => !open)}
                        >
                            {pageSize}条/页
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d={sizeMenuOpen ? 'm18 15-6-6-6 6' : 'm6 9 6 6 6-6'} />
                            </svg>
                        </button>
                        {sizeMenuOpen && (
                            <div className="admin-page-size-menu">
                                {PAGE_SIZE_OPTIONS.map(size => (
                                    <div
                                        key={size}
                                        className={`admin-page-size-option ${size === pageSize ? 'is-active' : ''}`}
                                        onClick={() => {
                                            setPageSize(size);
                                            setSizeMenuOpen(false);
                                        }}
                                    >
                                        {size}条/页
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="admin-pager">
                        <button
                            className="admin-pager-btn is-arrow"
                            disabled={safePage === 1}
                            onClick={() => setCurrentPage(safePage - 1)}
                            title="上一页"
                        >‹</button>
                        {buildPageList(pageCount, safePage).map(page => (
                            typeof page === 'number' ? (
                                <button
                                    key={page}
                                    className={`admin-pager-btn ${page === safePage ? 'is-active' : ''}`}
                                    onClick={() => setCurrentPage(page)}
                                >{page}</button>
                            ) : (
                                <span key={page} className="admin-pager-ellipsis">...</span>
                            )
                        ))}
                        <button
                            className="admin-pager-btn is-arrow"
                            disabled={safePage === pageCount}
                            onClick={() => setCurrentPage(safePage + 1)}
                            title="下一页"
                        >›</button>
                    </div>
                    <span className="admin-pager-jumper">
                        前往
                        <input
                            value={jumpValue}
                            onChange={e => setJumpValue(e.target.value.replace(/[^\d]/g, ''))}
                            onKeyDown={e => {
                                if (e.key === 'Enter') jumpTo(jumpValue);
                            }}
                            onBlur={() => jumpTo(jumpValue)}
                        />
                        页
                    </span>
                </div>
            </div>

            {dialogMode && (
                <div className="admin-dialog-overlay" onClick={closeDialog}>
                    <div className="admin-dialog admin-prompt-dialog" onClick={e => e.stopPropagation()}>
                        <div className="admin-dialog-header">
                            <span className="admin-dialog-title">{dialogMode === 'add' ? '新增提示词' : '编辑提示词'}</span>
                            <button className="admin-dialog-close" onClick={closeDialog}>×</button>
                        </div>
                        <div className="admin-dialog-body">
                            <div className="admin-form-item">
                                <label className="admin-form-label"><em>*</em>提示词名称</label>
                                <input
                                    className={`admin-dialog-input ${errors.name ? 'is-error' : ''}`}
                                    value={form.name}
                                    autoFocus
                                    maxLength={NAME_MAX}
                                    placeholder="请输入提示词名称，如：商品标题优化"
                                    onChange={e => updateForm('name', e.target.value)}
                                />
                                {errors.name
                                    ? <div className="admin-form-error">{errors.name}</div>
                                    : <div className="admin-form-hint">用于识别提示词用途，名称不可重复</div>}
                            </div>
                            <div className="admin-form-item">
                                <label className="admin-form-label"><em>*</em>提示词内容</label>
                                <textarea
                                    className={`admin-dialog-textarea admin-prompt-textarea ${errors.content ? 'is-error' : ''}`}
                                    value={form.content}
                                    maxLength={CONTENT_MAX}
                                    placeholder="请输入提示词内容"
                                    onChange={e => updateForm('content', e.target.value)}
                                />
                                {errors.content
                                    ? <div className="admin-form-error">{errors.content}</div>
                                    : <div className="admin-dialog-hint admin-dialog-hint--count-only"><span className="admin-dialog-count">{form.content.length} / {CONTENT_MAX}</span></div>}
                            </div>
                            <div className="admin-form-item">
                                <label className="admin-form-label"><em>*</em>调用 KEY</label>
                                <div className="admin-call-id-input">
                                    <input
                                        className={`admin-dialog-input ${errors.callId ? 'is-error' : ''}`}
                                        value={form.callId}
                                        maxLength={50}
                                        placeholder="请输入调用 KEY，如：title_optimize"
                                        onChange={e => updateForm('callId', e.target.value)}
                                    />
                                    <button
                                        className="admin-call-id-copy"
                                        title="复制调用 KEY"
                                        onClick={() => copyCallId(form.callId.trim())}
                                    >
                                        <CopyIcon />
                                    </button>
                                </div>
                                {errors.callId
                                    ? <div className="admin-form-error">{errors.callId}</div>
                                    : <div className="admin-form-hint">接口调用提示词时使用该 KEY，支持字母、数字、下划线、短横线</div>}
                            </div>
                        </div>
                        <div className="admin-dialog-footer">
                            <button className="admin-btn" onClick={closeDialog}>取消</button>
                            <button className="admin-btn admin-btn--primary" onClick={submitDialog}>
                                {dialogMode === 'add' ? '确定' : '保存'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {viewing && (
                <div className="admin-dialog-overlay" onClick={() => setViewing(null)}>
                    <div className="admin-dialog admin-prompt-dialog" onClick={e => e.stopPropagation()}>
                        <div className="admin-dialog-header">
                            <span className="admin-dialog-title">{viewing.name}</span>
                            <button className="admin-dialog-close" onClick={() => setViewing(null)}>×</button>
                        </div>
                        <div className="admin-dialog-body">
                            <div className="admin-prompt-meta">
                                <span className="admin-prompt-meta-label">调用 KEY</span>
                                <span className="admin-prompt-call-id">{viewing.callId}</span>
                                <button className="admin-copy-btn" title="复制调用 KEY" onClick={() => copyCallId(viewing.callId)}>
                                    <CopyIcon />
                                </button>
                                <span className="admin-prompt-meta-time">创建于 {viewing.createdAt}</span>
                                <span className="admin-prompt-meta-time">更新于 {viewing.updatedAt}</span>
                            </div>
                            <div className="admin-prompt-detail-label">提示词内容</div>
                            <div className="admin-prompt-detail-content">{viewing.content}</div>
                        </div>
                        <div className="admin-dialog-footer">
                            <button className="admin-btn" onClick={() => setViewing(null)}>关闭</button>
                            <button className="admin-btn admin-btn--primary" onClick={() => {
                                const item = viewing;
                                setViewing(null);
                                openEdit(item);
                            }}>编辑</button>
                        </div>
                    </div>
                </div>
            )}

            {pendingDelete && (
                <div className="admin-dialog-overlay" onClick={() => setPendingDelete(null)}>
                    <div className="admin-dialog" onClick={e => e.stopPropagation()}>
                        <div className="admin-dialog-header">
                            <span className="admin-dialog-title">删除确认</span>
                            <button className="admin-dialog-close" onClick={() => setPendingDelete(null)}>×</button>
                        </div>
                        <div className="admin-dialog-body">
                            <p className="admin-dialog-message">
                                确定要删除提示词「{pendingDelete.name}」吗？删除后使用该调用 KEY 的接口将无法继续使用，且无法恢复。
                            </p>
                        </div>
                        <div className="admin-dialog-footer">
                            <button className="admin-btn" onClick={() => setPendingDelete(null)}>取消</button>
                            <button className="admin-btn admin-btn--danger" onClick={confirmDelete}>删除</button>
                        </div>
                    </div>
                </div>
            )}

            {toast && (
                <div className="admin-toast">
                    <span className="admin-toast-icon">✓</span>
                    {toast}
                </div>
            )}
        </div>
    );
}
