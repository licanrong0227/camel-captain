export function formatMoney(value: number): string {
    return `¥${value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatInt(value: number): string {
    return value.toLocaleString('zh-CN');
}
