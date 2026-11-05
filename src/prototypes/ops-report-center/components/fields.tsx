import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CaretDown, ChevronLeft, ChevronRight } from './icons';

export interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps {
    value: string | string[];
    options: SelectOption[];
    onChange: (next: string | string[]) => void;
    multiple?: boolean;
    placeholder?: string;
    searchable?: boolean;
    width?: number | string;
    ariaLabel?: string;
}

export function Select({
    value,
    options,
    onChange,
    multiple = false,
    placeholder = '全部',
    searchable = false,
    width,
    ariaLabel,
}: SelectProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [alignRight, setAlignRight] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    const selectedValues = useMemo(
        () => (Array.isArray(value) ? value : value ? [value] : []),
        [value],
    );
    const selectedOptions = useMemo(
        () => selectedValues
            .map((item) => options.find((option) => option.value === item))
            .filter((option): option is SelectOption => Boolean(option)),
        [options, selectedValues],
    );

    useEffect(() => {
        if (!open) {
            return undefined;
        }
        const onPointerDown = (event: MouseEvent) => {
            if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [open]);

    useEffect(() => {
        if (open) {
            setQuery('');
            window.setTimeout(() => searchRef.current?.focus(), 20);
        }
    }, [open]);

    const toggleOpen = () => {
        if (!open && rootRef.current) {
            const rect = rootRef.current.getBoundingClientRect();
            setAlignRight(rect.left + 320 > window.innerWidth - 12);
        }
        setOpen((current) => !current);
    };

    const filteredOptions = useMemo(() => {
        const keyword = query.trim().toLowerCase();
        if (!keyword) {
            return options;
        }
        return options.filter((option) => option.label.toLowerCase().includes(keyword));
    }, [options, query]);

    const handleOptionClick = (option: SelectOption) => {
        if (multiple) {
            const next = selectedValues.includes(option.value)
                ? selectedValues.filter((item) => item !== option.value)
                : [...selectedValues, option.value];
            onChange(next);
            return;
        }
        onChange(option.value);
        setOpen(false);
    };

    const removeValue = (event: React.MouseEvent, target: string) => {
        event.stopPropagation();
        if (multiple) {
            onChange(selectedValues.filter((item) => item !== target));
        } else {
            onChange('');
        }
    };

    const triggerContent = () => {
        if (multiple) {
            if (selectedOptions.length === 0) {
                return <span className="ops-select-placeholder">{placeholder}</span>;
            }
            return (
                <>
                    <span className="ops-tag" title={selectedOptions[0].label}>
                        <span className="ops-tag-text">{selectedOptions[0].label}</span>
                        <i onClick={(event) => removeValue(event, selectedOptions[0].value)}>×</i>
                    </span>
                    {selectedOptions.length > 1 && (
                        <span className="ops-tag ops-tag-more">+{selectedOptions.length - 1}</span>
                    )}
                </>
            );
        }
        return selectedOptions.length > 0
            ? <span className="ops-select-text">{selectedOptions[0].label}</span>
            : <span className="ops-select-placeholder">{placeholder}</span>;
    };

    return (
        <div
            className={`ops-select${open ? ' is-open' : ''}`}
            ref={rootRef}
            style={{ width }}
            role="combobox"
            aria-expanded={open}
            aria-label={ariaLabel}
            tabIndex={0}
            onClick={toggleOpen}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    toggleOpen();
                }
            }}
        >
            <span className="ops-select-value">{triggerContent()}</span>
            <CaretDown className="ops-select-caret" />
            {open && (
                <div
                    className={`ops-select-menu${alignRight ? ' is-right' : ''}`}
                    onClick={(event) => event.stopPropagation()}
                >
                    {searchable && (
                        <div className="ops-menu-search">
                            <input
                                ref={searchRef}
                                value={query}
                                placeholder="搜索"
                                onChange={(event) => setQuery(event.target.value)}
                            />
                        </div>
                    )}
                    <div className="ops-menu-list">
                        {filteredOptions.length === 0 && (
                            <div className="ops-menu-empty">无匹配项</div>
                        )}
                        {filteredOptions.map((option) => {
                            const selected = selectedValues.includes(option.value);
                            return (
                                <div
                                    key={option.value}
                                    className={`ops-option${selected ? ' is-selected' : ''}`}
                                    role="option"
                                    aria-selected={selected}
                                    onClick={() => handleOptionClick(option)}
                                    title={option.label}
                                >
                                    {multiple && <span className={`ops-option-check${selected ? ' is-on' : ''}`} />}
                                    <span className="ops-option-label">{option.label}</span>
                                </div>
                            );
                        })}
                    </div>
                    {multiple && (
                        <div className="ops-menu-footer">
                            <button type="button" onClick={() => onChange([])}>清空</button>
                            <span>已选 {selectedValues.length} 项</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

interface PaginationProps {
    total: number;
    page: number;
    pageSize: number;
    onChangePage: (page: number) => void;
    onChangeSize: (size: number) => void;
}

function pageItems(totalPages: number, current: number): Array<number | 'ellipsis'> {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }
    const items: Array<number | 'ellipsis'> = [1];
    const start = Math.max(2, current - 1);
    const end = Math.min(totalPages - 1, current + 1);
    if (start > 2) {
        items.push('ellipsis');
    }
    for (let index = start; index <= end; index += 1) {
        items.push(index);
    }
    if (end < totalPages - 1) {
        items.push('ellipsis');
    }
    items.push(totalPages);
    return items;
}

export function Pagination({
    total,
    page,
    pageSize,
    onChangePage,
    onChangeSize,
}: PaginationProps) {
    const [jump, setJump] = useState(String(page));
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    useEffect(() => {
        setJump(String(page));
    }, [page]);

    const commitJump = () => {
        const next = Number.parseInt(jump, 10);
        if (!Number.isNaN(next)) {
            const safe = Math.min(Math.max(next, 1), totalPages);
            onChangePage(safe);
            setJump(String(safe));
        } else {
            setJump(String(page));
        }
    };

    return (
        <div className="ops-pager">
            <span className="ops-pager-total">共 {total} 条</span>
            <div className="ops-pager-size-wrap">
                <select
                    className="ops-pager-size"
                    value={pageSize}
                    aria-label="每页条数"
                    onChange={(event) => onChangeSize(Number(event.target.value))}
                >
                    {[10, 20, 50].map((size) => (
                        <option key={size} value={size}>{size}条/页</option>
                    ))}
                </select>
                <CaretDown className="ops-pager-size-caret" size={11} />
            </div>
            <button
                type="button"
                className="ops-page-btn"
                disabled={page <= 1}
                aria-label="上一页"
                onClick={() => onChangePage(page - 1)}
            >
                <ChevronLeft />
            </button>
            {pageItems(totalPages, page).map((item, index) => (
                item === 'ellipsis'
                    ? <span key={`ellipsis-${index}`} className="ops-page-ellipsis">···</span>
                    : (
                        <button
                            key={item}
                            type="button"
                            className={`ops-page-btn${item === page ? ' is-active' : ''}`}
                            onClick={() => onChangePage(item)}
                        >
                            {item}
                        </button>
                    )
            ))}
            <button
                type="button"
                className="ops-page-btn"
                disabled={page >= totalPages}
                aria-label="下一页"
                onClick={() => onChangePage(page + 1)}
            >
                <ChevronRight />
            </button>
            <span className="ops-pager-jump">
                前往
                <input
                    value={jump}
                    aria-label="跳转页码"
                    onChange={(event) => setJump(event.target.value.replace(/[^\d]/g, ''))}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            commitJump();
                        }
                    }}
                    onBlur={commitJump}
                />
                页
            </span>
        </div>
    );
}
