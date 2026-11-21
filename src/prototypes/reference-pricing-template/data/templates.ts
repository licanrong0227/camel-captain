export type ParamKey =
    | 'purchase'
    | 'domestic'
    | 'intl'
    | 'shopDiscount'
    | 'platformLoss'
    | 'commission'
    | 'withdrawFee'
    | 'profit'
    | 'buyerShipping';

export interface ParamDef {
    key: ParamKey;
    label: string;
    token: string;
}

export const PARAM_DEFS: ParamDef[] = [
    { key: 'purchase', label: '采购成本', token: '#采购成本#' },
    { key: 'domestic', label: '国内物流成本', token: '#国内物流成本#' },
    { key: 'intl', label: '国际物流成本', token: '#国际物流成本#' },
    { key: 'shopDiscount', label: '店铺折扣', token: '#店铺折扣#' },
    { key: 'platformLoss', label: '平台活动折扣损耗', token: '#平台活动折扣损耗#' },
    { key: 'commission', label: '平台佣金率', token: '#平台佣金率#' },
    { key: 'withdrawFee', label: '平台提现手续费率', token: '#平台提现手续费率#' },
    { key: 'profit', label: '利润率', token: '#利润率#' },
    { key: 'buyerShipping', label: '买家运费', token: '#买家运费#' },
];

export const PARAM_GROUPS: { title: string; keys: ParamKey[] }[] = [
    { title: '成本配置', keys: ['purchase', 'domestic', 'intl'] },
    { title: '活动折扣', keys: ['shopDiscount', 'platformLoss'] },
    { title: '费率配置', keys: ['commission', 'withdrawFee', 'profit'] },
    { title: '其他', keys: ['buyerShipping'] },
];

export const PARAM_LABEL: Record<ParamKey, string> = PARAM_DEFS.reduce(
    (acc, item) => ({ ...acc, [item.key]: item.label }),
    {} as Record<ParamKey, string>,
);

const PARAM_KEY_BY_TOKEN: Record<string, ParamKey> = PARAM_DEFS.reduce(
    (acc, item) => ({ ...acc, [item.label]: item.key }),
    {} as Record<string, ParamKey>,
);

export interface PricingTemplate {
    id: string;
    name: string;
    params: ParamKey[];
    formula: string;
    updatedAt: string;
}

export const INITIAL_TEMPLATES: PricingTemplate[] = [
    {
        id: 'tpl-1',
        name: '美国专线标准定价',
        params: ['purchase', 'domestic', 'intl', 'commission', 'withdrawFee', 'profit'],
        formula: '(#采购成本# + #国内物流成本# + #国际物流成本#) / (1 - #平台佣金率# - #平台提现手续费率# - #利润率#)',
        updatedAt: '2026-11-20 16:42',
    },
    {
        id: 'tpl-2',
        name: '活动折扣定价',
        params: ['purchase', 'intl', 'shopDiscount', 'platformLoss', 'profit'],
        formula: '(#采购成本# + #国际物流成本#) / (1 - #店铺折扣# - #平台活动折扣损耗# - #利润率#)',
        updatedAt: '2026-11-19 10:08',
    },
    {
        id: 'tpl-3',
        name: '简版成本加成定价',
        params: ['purchase', 'intl', 'profit', 'buyerShipping'],
        formula: '((#采购成本# + #国际物流成本#) * (1 + #利润率#)) - #买家运费#',
        updatedAt: '2026-11-18 09:15',
    },
];

export interface FormulaAnalysis {
    usedKeys: ParamKey[];
    unknownTokens: string[];
    checkedUnused: ParamKey[];
    uncheckedUsed: ParamKey[];
    syntaxError: string;
}

export function analyzeFormula(formula: string, checked: ParamKey[]): FormulaAnalysis {
    const tokens = Array.from(formula.matchAll(/#([^#]+)#/g)).map((match) => match[1]);
    const unknownTokens = tokens.filter((token) => !PARAM_KEY_BY_TOKEN[token]);
    const usedKeys = Array.from(
        new Set(
            tokens
                .map((token) => PARAM_KEY_BY_TOKEN[token])
                .filter((key): key is ParamKey => Boolean(key)),
        ),
    );
    const checkedUnused = checked.filter((key) => !usedKeys.includes(key));
    const uncheckedUsed = usedKeys.filter((key) => !checked.includes(key));

    return {
        usedKeys,
        unknownTokens: Array.from(new Set(unknownTokens)),
        checkedUnused,
        uncheckedUsed,
        syntaxError: validateSyntax(formula),
    };
}

function validateSyntax(formula: string): string {
    const expression = formula.replace(/#[^#]+#/g, '1').trim();
    if (!expression) {
        return '';
    }
    if (/[^0-9+\-*/().\s]/.test(expression)) {
        return '公式包含不支持的字符，仅可使用数字、参数、+ - * / 和括号';
    }
    const withoutNumbers = expression.replace(/[0-9.]+/g, 'n');
    if (/[+\-*/]\s*[+*/]/.test(withoutNumbers) || /^[*/]/.test(withoutNumbers) || /[+\-*/]$/.test(withoutNumbers)) {
        return '公式的运算符位置有误';
    }
    let depth = 0;
    for (const char of expression) {
        if (char === '(') depth += 1;
        if (char === ')') depth -= 1;
        if (depth < 0) return '公式中的括号不匹配';
    }
    if (depth !== 0) return '公式中的括号不匹配';
    return '';
}
