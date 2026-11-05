import React, { useEffect, useMemo, useState } from 'react';

import {
    LISTING_METHODS,
    PRODUCTS,
    SHOPS,
    SOURCES,
    TENANTS,
    aggregateProducts,
    rangeForPreset,
    shopById,
    tenantLabel,
    type ListingMethod,
    type ProductSource,
    type TimePreset,
} from '../data/products';
import { Select, Pagination } from '../components/fields';
import { formatInt, formatMoney } from '../components/format';
import { EmptyBoxIcon, ResetIcon, SearchIcon, SortCaret } from '../components/icons';

interface ProductFilters {
    time: TimePreset;
    start: string;
    end: string;
    tenants: string[];
    shops: string[];
    keyword: string;
    sources: Array<ProductSource | string>;
    listings: Array<ListingMethod | string>;
}

type SortKey = 'qty' | 'amount' | 'orders';

const TIME_OPTIONS = [
    { value: 'today', label: '今天' },
    { value: '7d', label: '近7天' },
    { value: '30d', label: '近30天' },
    { value: 'custom', label: '自定义' },
];

const SOURCE_OPTIONS = SOURCES.map((source) => ({ value: source, label: source }));
const LISTING_OPTIONS = LISTING_METHODS.map((method) => ({ value: method, label: method }));

function makeDefaultFilters(): ProductFilters {
    const range = rangeForPreset('30d');
    return {
        time: '30d',
        start: range.start,
        end: range.end,
        tenants: [],
        shops: [],
        keyword: '',
        sources: [],
        listings: [],
    };
}

export function ProductReport() {
    const [draft, setDraft] = useState<ProductFilters>(makeDefaultFilters);
    const [applied, setApplied] = useState<ProductFilters>(makeDefaultFilters);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'amount', dir: 'desc' });
    const [rangeError, setRangeError] = useState('');

    const tenantOptions = useMemo(
        () => TENANTS.map((tenant) => ({ value: tenant.id, label: tenantLabel(tenant.id) })),
        [],
    );

    const shopOptions = useMemo(() => {
        const shops = draft.tenants.length > 0
            ? SHOPS.filter((shop) => draft.tenants.includes(shop.tenantId))
            : SHOPS;
        return shops.map((shop) => ({
            value: shop.id,
            label: `${shop.name} · ${shop.tenantId}`,
        }));
    }, [draft.tenants]);

    const result = useMemo(() => {
        const base = aggregateProducts(PRODUCTS, applied.start, applied.end);
        const keyword = applied.keyword.trim().toLowerCase();
        return base.filter((product) => {
            if (applied.tenants.length > 0 && !applied.tenants.includes(product.tenantId)) {
                return false;
            }
            if (applied.shops.length > 0 && !applied.shops.includes(product.shopId)) {
                return false;
            }
            if (applied.sources.length > 0 && !applied.sources.includes(product.source)) {
                return false;
            }
            if (applied.listings.length > 0 && !applied.listings.includes(product.listing)) {
                return false;
            }
            if (keyword) {
                const haystack = `${product.id} ${product.title}`.toLowerCase();
                if (!haystack.includes(keyword)) {
                    return false;
                }
            }
            return true;
        });
    }, [applied]);

    const sortedRows = useMemo(() => {
        const factor = sort.dir === 'asc' ? 1 : -1;
        return [...result].sort((left, right) => (
            (left[sort.key] - right[sort.key]) * factor
            || right.amount - left.amount
            || left.id.localeCompare(right.id)
        ));
    }, [result, sort]);

    const cards = useMemo(() => ({
        products: result.length,
        qty: result.reduce((sum, item) => sum + item.qty, 0),
        amount: result.reduce((sum, item) => sum + item.amount, 0),
        orders: result.reduce((sum, item) => sum + item.orders, 0),
    }), [result]);

    useEffect(() => {
        const maxPage = Math.max(1, Math.ceil(sortedRows.length / pageSize));
        if (page > maxPage) {
            setPage(maxPage);
        }
    }, [sortedRows.length, pageSize, page]);

    const pageRows = useMemo(() => {
        const start = (page - 1) * pageSize;
        return sortedRows.slice(start, start + pageSize);
    }, [sortedRows, page, pageSize]);

    const updateTime = (next: string) => {
        const preset = next as TimePreset;
        if (preset === 'custom') {
            setDraft({ ...draft, time: 'custom' });
            return;
        }
        const range = rangeForPreset(preset);
        setDraft({ ...draft, time: preset, start: range.start, end: range.end });
        setRangeError('');
    };

    const updateTenants = (next: string | string[]) => {
        const tenants = next as string[];
        const allowed = new Set(
            SHOPS
                .filter((shop) => tenants.length === 0 || tenants.includes(shop.tenantId))
                .map((shop) => shop.id),
        );
        setDraft({
            ...draft,
            tenants,
            shops: draft.shops.filter((id) => allowed.has(id)),
        });
    };

    const applyFilters = () => {
        if (draft.start > draft.end) {
            setRangeError('开始日期不能晚于结束日期');
            return;
        }
        setRangeError('');
        setApplied({ ...draft, tenants: [...draft.tenants], shops: [...draft.shops] });
        setSort({ key: 'amount', dir: 'desc' });
        setPage(1);
    };

    const resetFilters = () => {
        const next = makeDefaultFilters();
        setDraft(next);
        setApplied({ ...next });
        setSort({ key: 'amount', dir: 'desc' });
        setPage(1);
        setRangeError('');
    };

    const toggleSort = (key: SortKey) => {
        setSort((current) => (
            current.key === key
                ? { key, dir: current.dir === 'desc' ? 'asc' : 'desc' }
                : { key, dir: 'desc' }
        ));
        setPage(1);
    };

    return (
        <section className="ops-card">
            <div className="ops-filters product-filters">
                <div className="ops-field">
                    <label>时间</label>
                    <Select
                        value={draft.time}
                        options={TIME_OPTIONS}
                        width={124}
                        ariaLabel="时间范围"
                        onChange={(next) => updateTime(next as string)}
                    />
                    {draft.time === 'custom' && (
                        <>
                            <input
                                type="date"
                                className="ops-date"
                                value={draft.start}
                                onChange={(event) => {
                                    setDraft({ ...draft, start: event.target.value });
                                    setRangeError('');
                                }}
                            />
                            <span className="ops-range-sep">至</span>
                            <input
                                type="date"
                                className="ops-date"
                                value={draft.end}
                                onChange={(event) => {
                                    setDraft({ ...draft, end: event.target.value });
                                    setRangeError('');
                                }}
                            />
                        </>
                    )}
                </div>
                <div className="ops-field">
                    <label>租户</label>
                    <Select
                        multiple
                        searchable
                        value={draft.tenants}
                        options={tenantOptions}
                        width={188}
                        ariaLabel="租户"
                        onChange={updateTenants}
                    />
                </div>
                <div className="ops-field">
                    <label>店铺</label>
                    <Select
                        multiple
                        searchable
                        value={draft.shops}
                        options={shopOptions}
                        width={196}
                        ariaLabel="店铺"
                        onChange={(next) => setDraft({ ...draft, shops: next as string[] })}
                    />
                </div>
                <div className="ops-field">
                    <label>商品</label>
                    <input
                        className="ops-input"
                        style={{ width: 204 }}
                        placeholder="请输入商品ID或标题"
                        value={draft.keyword}
                        onChange={(event) => setDraft({ ...draft, keyword: event.target.value })}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                applyFilters();
                            }
                        }}
                    />
                </div>
                <div className="ops-field">
                    <label>商品来源</label>
                    <Select
                        multiple
                        value={draft.sources}
                        options={SOURCE_OPTIONS}
                        width={158}
                        ariaLabel="商品来源"
                        onChange={(next) => setDraft({ ...draft, sources: next as string[] })}
                    />
                </div>
                <div className="ops-field">
                    <label>上架方式</label>
                    <Select
                        multiple
                        value={draft.listings}
                        options={LISTING_OPTIONS}
                        width={152}
                        ariaLabel="上架方式"
                        onChange={(next) => setDraft({ ...draft, listings: next as string[] })}
                    />
                </div>
                <div className="ops-actions">
                    <button type="button" className="ops-btn is-primary" onClick={applyFilters}>
                        <SearchIcon size={13} />
                        查询
                    </button>
                    <button type="button" className="ops-btn" onClick={resetFilters}>
                        <ResetIcon />
                        重置
                    </button>
                </div>
                {rangeError && (
                    <div className="ops-range-error" role="alert">{rangeError}</div>
                )}
            </div>

            <div className="ops-kpis">
                <div className="ops-kpi">
                    <span className="ops-kpi-label">有销量商品数</span>
                    <span className="ops-kpi-value">{cards.products}</span>
                </div>
                <div className="ops-kpi">
                    <span className="ops-kpi-label">总销量</span>
                    <span className="ops-kpi-value">{formatInt(cards.qty)}</span>
                </div>
                <div className="ops-kpi">
                    <span className="ops-kpi-label">总销售额</span>
                    <span className="ops-kpi-value">{formatMoney(cards.amount)}</span>
                </div>
                <div className="ops-kpi">
                    <span className="ops-kpi-label">总订单数</span>
                    <span className="ops-kpi-value">{formatInt(cards.orders)}</span>
                </div>
            </div>

            <div className="ops-table-area">
                <table className="ops-table product-table">
                    <colgroup>
                        <col style={{ width: '30%' }} />
                        <col style={{ width: '9%' }} />
                        <col style={{ width: '15%' }} />
                        <col style={{ width: '9%' }} />
                        <col style={{ width: '9%' }} />
                        <col style={{ width: '8%' }} />
                        <col style={{ width: '12%' }} />
                        <col style={{ width: '8%' }} />
                    </colgroup>
                    <thead>
                        <tr>
                            <th className="is-left">商品</th>
                            <th>租户</th>
                            <th>店铺</th>
                            <th>商品来源</th>
                            <th>上架方式</th>
                            <th className="ops-num">
                                <button type="button" className="ops-sort" onClick={() => toggleSort('qty')}>
                                    销量
                                    <SortCaret dir={sort.key === 'qty' ? sort.dir : null} />
                                </button>
                            </th>
                            <th className="ops-num">
                                <button type="button" className="ops-sort" onClick={() => toggleSort('amount')}>
                                    销售额
                                    <SortCaret dir={sort.key === 'amount' ? sort.dir : null} />
                                </button>
                            </th>
                            <th className="ops-num">
                                <button type="button" className="ops-sort" onClick={() => toggleSort('orders')}>
                                    订单数
                                    <SortCaret dir={sort.key === 'orders' ? sort.dir : null} />
                                </button>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {pageRows.length === 0 && (
                            <tr>
                                <td colSpan={8}>
                                    <div className="ops-empty">
                                        <EmptyBoxIcon />
                                        <div className="ops-empty-title">暂无数据</div>
                                        <div className="ops-empty-sub">所选条件下暂无有销量的商品</div>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {pageRows.map((row) => {
                            const shop = shopById(row.shopId);
                            return (
                                <tr key={row.id}>
                                    <td>
                                        <div className="ops-product-cell">
                                            <img src={row.image} alt={row.title} />
                                            <div className="ops-product-meta">
                                                <div className="ops-product-title" title={row.title}>{row.title}</div>
                                                <div className="ops-product-id">{row.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{row.tenantId}</td>
                                    <td>
                                        <span className="ops-ellipsis" title={shop ? `${shop.name} · ${shop.tenantId}` : '-'}>
                                            {shop ? shop.name : '-'}
                                        </span>
                                    </td>
                                    <td>{row.source}</td>
                                    <td>{row.listing}</td>
                                    <td className="ops-num">{formatInt(row.qty)}</td>
                                    <td className="ops-num">{formatMoney(row.amount)}</td>
                                    <td className="ops-num">{formatInt(row.orders)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <Pagination
                total={sortedRows.length}
                page={page}
                pageSize={pageSize}
                onChangePage={setPage}
                onChangeSize={(size) => {
                    setPageSize(size);
                    setPage(1);
                }}
            />
        </section>
    );
}
