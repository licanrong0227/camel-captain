import React, { useEffect, useMemo, useRef, useState } from 'react';

interface SensitiveWord {
    id: string;
    word: string;
    enabled: boolean;
    createdAt: string;
    updatedAt: string;
}

const initialWords: SensitiveWord[] = [
    { id: 'w1', word: '高仿', enabled: true, createdAt: '2026-10-12 09:30', updatedAt: '2026-10-21 10:24' },
    { id: 'w2', word: 'A货', enabled: true, createdAt: '2026-10-11 14:20', updatedAt: '2026-10-20 17:06' },
    { id: 'w3', word: '刷单', enabled: true, createdAt: '2026-10-10 16:05', updatedAt: '2026-10-20 15:38' },
    { id: 'w4', word: '仿牌', enabled: true, createdAt: '2026-10-09 10:41', updatedAt: '2026-10-19 11:52' },
    { id: 'w5', word: '违禁品', enabled: false, createdAt: '2026-10-08 17:33', updatedAt: '2026-10-19 09:15' },
    { id: 'w6', word: '假一赔十', enabled: true, createdAt: '2026-10-08 14:12', updatedAt: '2026-10-18 16:40' },
    { id: 'w7', word: '走私', enabled: false, createdAt: '2026-10-07 11:05', updatedAt: '2026-10-17 14:22' },
    { id: 'w8', word: '侵权', enabled: true, createdAt: '2026-10-06 15:48', updatedAt: '2026-10-16 10:08' },
    { id: 'w9', word: '管制刀具', enabled: true, createdAt: '2026-10-06 09:02', updatedAt: '2026-10-16 09:31' },
    { id: 'w10', word: '假货', enabled: true, createdAt: '2026-10-05 16:27', updatedAt: '2026-10-15 18:05' },
    { id: 'w11', word: '山寨', enabled: true, createdAt: '2026-10-05 10:14', updatedAt: '2026-10-15 16:47' },
    { id: 'w12', word: '盗版', enabled: true, createdAt: '2026-10-04 17:50', updatedAt: '2026-10-15 11:20' },
    { id: 'w13', word: '赌博', enabled: false, createdAt: '2026-10-03 14:38', updatedAt: '2026-10-14 17:12' },
    { id: 'w14', word: '毒品', enabled: true, createdAt: '2026-10-03 09:16', updatedAt: '2026-10-14 15:09' },
    { id: 'w15', word: '色情', enabled: false, createdAt: '2026-10-02 16:41', updatedAt: '2026-10-14 10:36' },
    { id: 'w16', word: '代开发票', enabled: true, createdAt: '2026-10-02 11:09', updatedAt: '2026-10-13 16:58' },
    { id: 'w17', word: '假证', enabled: true, createdAt: '2026-10-01 15:22', updatedAt: '2026-10-13 14:03' },
    { id: 'w18', word: '黑客', enabled: true, createdAt: '2026-10-01 10:07', updatedAt: '2026-10-12 17:44' },
    { id: 'w19', word: '洗钱', enabled: false, createdAt: '2026-09-30 17:18', updatedAt: '2026-10-12 09:26' },
    { id: 'w20', word: '传销', enabled: true, createdAt: '2026-09-30 14:05', updatedAt: '2026-10-11 15:17' },
    { id: 'w21', word: '枪', enabled: true, createdAt: '2026-09-29 16:33', updatedAt: '2026-10-11 10:52' },
];

let wordIdCounter = 100;
const nextWordId = () => `w${++wordIdCounter}`;

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50];

const formatNow = () => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const parseBatch = (text: string) => {
    const seen = new Set<string>();
    const result: string[] = [];
    text.split(/\r?\n/).forEach(line => {
        const word = line.trim();
        if (!word) return;
        const key = word.toLowerCase();
        if (seen.has(key)) return;
        seen.add(key);
        result.push(word);
    });
    return result;
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

export function SensitiveWordsPage() {
    const [words, setWords] = useState<SensitiveWord[]>(initialWords);
    const [keyword, setKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'enabled' | 'disabled'>('all');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingValue, setEditingValue] = useState('');
    const [editError, setEditError] = useState('');
    const [addVisible, setAddVisible] = useState(false);
    const [addText, setAddText] = useState('');
    const [pendingDelete, setPendingDelete] = useState<SensitiveWord | null>(null);
    const [toast, setToast] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [sizeMenuOpen, setSizeMenuOpen] = useState(false);
    const [jumpValue, setJumpValue] = useState('1');
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
    }, [keyword, statusFilter, pageSize]);

    const showToast = (message: string) => {
        setToast(message);
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        toastTimerRef.current = setTimeout(() => setToast(''), 2000);
    };

    const filteredWords = useMemo(() => {
        const kw = keyword.trim().toLowerCase();
        return words.filter(item => {
            if (kw && !item.word.toLowerCase().includes(kw)) return false;
            if (statusFilter === 'enabled' && !item.enabled) return false;
            if (statusFilter === 'disabled' && item.enabled) return false;
            return true;
        });
    }, [words, keyword, statusFilter]);

    const isFiltering = !!keyword.trim() || statusFilter !== 'all';
    const total = filteredWords.length;
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(currentPage, pageCount);
    const pageWords = filteredWords.slice((safePage - 1) * pageSize, safePage * pageSize);

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

    const isDuplicate = (word: string, excludeId?: string | null) =>
        words.some(item => item.id !== excludeId && item.word.toLowerCase() === word.toLowerCase());

    const batchCount = parseBatch(addText).length;

    const handleOpenAdd = () => {
        setAddText('');
        setAddVisible(true);
    };

    const handleAdd = () => {
        const candidates = parseBatch(addText);
        const fresh = candidates.filter(word => !isDuplicate(word));
        if (!fresh.length) return;
        const now = formatNow();
        setWords(prev => [
            ...fresh.map(word => ({ id: nextWordId(), word, enabled: true, createdAt: now, updatedAt: now })),
            ...prev,
        ]);
        setAddVisible(false);
        setAddText('');
        setCurrentPage(1);
        const skipped = candidates.length - fresh.length;
        showToast(skipped ? `已添加 ${fresh.length} 个，忽略 ${skipped} 个重复敏感词` : `已添加 ${fresh.length} 个敏感词`);
    };

    const handleToggle = (id: string) => {
        setWords(prev => prev.map(item => (item.id === id ? { ...item, enabled: !item.enabled } : item)));
    };

    const startEdit = (item: SensitiveWord) => {
        setEditingId(item.id);
        setEditingValue(item.word);
        setEditError('');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditingValue('');
        setEditError('');
    };

    const saveEdit = (id: string) => {
        const word = editingValue.trim();
        if (!word) {
            setEditError('敏感词不能为空');
            return;
        }
        if (isDuplicate(word, id)) {
            setEditError('该敏感词已存在');
            return;
        }
        setWords(prev => prev.map(item => (item.id === id ? { ...item, word, updatedAt: formatNow() } : item)));
        cancelEdit();
        showToast('修改已保存');
    };

    const confirmDelete = () => {
        if (!pendingDelete) return;
        setWords(prev => prev.filter(item => item.id !== pendingDelete.id));
        if (editingId === pendingDelete.id) cancelEdit();
        setPendingDelete(null);
        showToast('已删除');
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
                            placeholder="搜索敏感词"
                            onChange={e => setKeyword(e.target.value)}
                        />
                        {keyword && (
                            <button className="admin-search-clear" onClick={() => setKeyword('')} title="清空">×</button>
                        )}
                    </div>
                    <div className="admin-filter-select">
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value as 'all' | 'enabled' | 'disabled')}
                        >
                            <option value="all">全部状态</option>
                            <option value="enabled">已启用</option>
                            <option value="disabled">已停用</option>
                        </select>
                        <svg className="admin-filter-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m6 9 6 6 6-6" />
                        </svg>
                    </div>
                </div>
                <button className="admin-btn admin-btn--primary" onClick={handleOpenAdd}>+ 添加敏感词</button>
            </div>

            <div className="admin-table-wrap">
                <table className="admin-data-table">
                    <thead>
                        <tr>
                            <th className="is-index">序号</th>
                            <th>敏感词</th>
                            <th className="is-status">启用状态</th>
                            <th className="is-time">创建时间</th>
                            <th className="is-time">更新时间</th>
                            <th className="is-actions">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pageWords.map((item, index) => (
                            <tr key={item.id} className={editingId === item.id ? 'is-editing' : ''}>
                                <td className="is-index">{(safePage - 1) * pageSize + index + 1}</td>
                                <td>
                                    {editingId === item.id ? (
                                        <div className="admin-inline-edit">
                                            <input
                                                className={`admin-inline-input ${editError ? 'is-error' : ''}`}
                                                value={editingValue}
                                                autoFocus
                                                onChange={e => {
                                                    setEditingValue(e.target.value);
                                                    setEditError('');
                                                }}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') saveEdit(item.id);
                                                    if (e.key === 'Escape') cancelEdit();
                                                }}
                                            />
                                            {editError && <span className="admin-inline-error">{editError}</span>}
                                        </div>
                                    ) : (
                                        <span
                                            className="admin-word-text"
                                            title="双击编辑"
                                            onDoubleClick={() => startEdit(item)}
                                        >
                                            {item.word}
                                        </span>
                                    )}
                                </td>
                                <td className="is-status">
                                    <label className="admin-switch">
                                        <input type="checkbox" checked={item.enabled} onChange={() => handleToggle(item.id)} />
                                        <span className="admin-switch-slider"></span>
                                    </label>
                                    <span className={`admin-status-text ${item.enabled ? 'is-on' : ''}`}>
                                        {item.enabled ? '已启用' : '已停用'}
                                    </span>
                                </td>
                                <td className="is-time">{item.createdAt}</td>
                                <td className="is-time">{item.updatedAt}</td>
                                <td className="is-actions">
                                    {editingId === item.id ? (
                                        <>
                                            <button className="admin-text-btn is-primary" onClick={() => saveEdit(item.id)}>保存</button>
                                            <button className="admin-text-btn" onClick={cancelEdit}>取消</button>
                                        </>
                                    ) : (
                                        <>
                                            <button className="admin-text-btn is-primary" onClick={() => startEdit(item)}>编辑</button>
                                            <button className="admin-text-btn is-danger" onClick={() => setPendingDelete(item)}>删除</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!pageWords.length && (
                    <div className="admin-table-empty">
                        {words.length ? '没有匹配的敏感词' : '暂无敏感词，点击右上角「添加敏感词」'}
                    </div>
                )}
            </div>

            <div className="admin-table-footer">
                <span>共 {total} 条{isFiltering ? `（全部 ${words.length} 条）` : ''}</span>
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

            {addVisible && (
                <div className="admin-dialog-overlay" onClick={() => setAddVisible(false)}>
                    <div className="admin-dialog admin-dialog--wide" onClick={e => e.stopPropagation()}>
                        <div className="admin-dialog-header">
                            <span className="admin-dialog-title">添加敏感词</span>
                            <button className="admin-dialog-close" onClick={() => setAddVisible(false)}>×</button>
                        </div>
                        <div className="admin-dialog-body">
                            <textarea
                                className="admin-dialog-textarea"
                                value={addText}
                                autoFocus
                                placeholder={'每行输入一个敏感词\n例如：\n高仿\n刷单'}
                                onChange={e => setAddText(e.target.value)}
                            />
                            <div className="admin-dialog-hint">
                                支持批量添加，每行一个；重复的敏感词会自动忽略
                                <span className="admin-dialog-count">已输入 {batchCount} 个</span>
                            </div>
                        </div>
                        <div className="admin-dialog-footer">
                            <button className="admin-btn" onClick={() => setAddVisible(false)}>取消</button>
                            <button className="admin-btn admin-btn--primary" disabled={!batchCount} onClick={handleAdd}>
                                确定
                            </button>
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
                                确定要删除敏感词「{pendingDelete.word}」吗？删除后无法恢复。
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
