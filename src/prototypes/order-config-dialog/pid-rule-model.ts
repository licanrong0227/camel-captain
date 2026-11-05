export type SegmentType = 'factory' | 'category' | 'year' | 'serial' | 'custom';
export type Transform = 'none' | 'upper' | 'lower';
export type CustomMode = 'variable' | 'constant';
export type VariableSource = 'productCode' | 'skuId' | 'categoryCode' | 'random';
export type ExtractMode = 'prefix' | 'suffix';
export type SerialMode = 'increment' | 'fieldExtract' | 'random';
export type SerialFieldSource = 'productCode' | 'categoryCode' | 'skuId';
export type CategoryFallbackMode = 'universal' | 'inherit';

export interface RuleSegment {
  id: string;
  type: SegmentType;
  separatorBefore: '' | '-';
  factory: string;
  yearDigits: 2 | 4;
  yearSource: 'current' | 'product';
  serialMode: SerialMode;
  serialSource: SerialFieldSource;
  serialExtractMode: ExtractMode;
  serialStart: number;
  serialDigits: number;
  serialFieldLength: number;
  serialTransform: Transform;
  customMode: CustomMode;
  variableSource: VariableSource;
  extractMode: ExtractMode;
  extractLength: number;
  transform: Transform;
  text: string;
}

export interface CategoryNode {
  id: string;
  name: string;
  parentId: string | null;
}

export interface PidConfig {
  segments: RuleSegment[];
  categoryCodes: Record<string, string>;
  fallbackCategoryCode: string;
  categoryFallbackMode: CategoryFallbackMode;
}

export interface SampleProduct {
  id: string;
  name: string;
  categoryId: string;
  skuCode: string;
  skuId: string;
  productCode: string;
  categoryCode: string;
  productYear: number;
  productId: string;
}

export const CURRENT_YEAR = new Date().getFullYear();
export const MAX_CODE_LENGTH = 32;

export const SEGMENT_LABELS: Record<SegmentType, string> = {
  factory: '工厂缩写',
  category: '类目简码',
  year: '年份',
  serial: '流水号',
  custom: '自定义',
};

export const SEGMENT_DESCRIPTIONS: Record<SegmentType, string> = {
  factory: '人工填写固定工厂代码',
  category: '按商品类目向上继承简码',
  year: '取 2 位或 4 位年份',
  serial: '自增或按字段取位',
  custom: '变量取值或固定常量',
};

export const CATEGORY_NODES: CategoryNode[] = [
  { id: 'apparel', name: '服装', parentId: null },
  { id: 'tshirt', name: 'T恤', parentId: 'apparel' },
  { id: 'tshirt-short', name: '短袖T恤', parentId: 'tshirt' },
  { id: 'tshirt-long', name: '长袖T恤', parentId: 'tshirt' },
  { id: 'outerwear', name: '外套', parentId: 'apparel' },
  { id: 'electronics', name: '电子', parentId: null },
  { id: 'earphones', name: '耳机', parentId: 'electronics' },
  { id: 'chargers', name: '充电器', parentId: 'electronics' },
  { id: 'bags', name: '箱包', parentId: null },
  { id: 'shoulder', name: '单肩包', parentId: 'bags' },
  { id: 'tote', name: '手提包', parentId: 'bags' },
  { id: 'kitchen', name: '厨具', parentId: null },
  { id: 'shoes', name: '鞋靴', parentId: null },
  { id: 'home', name: '家居', parentId: null },
  { id: 'home-storage', name: '收纳', parentId: 'home' },
];

export const DEFAULT_CATEGORY_CODES: Record<string, string> = {
  apparel: 'CL',
  tshirt: 'TS',
  'tshirt-long': 'LT',
  electronics: 'EL',
  bags: 'BAG',
  kitchen: 'KT',
  shoes: 'SH',
};

export const DEFAULT_FALLBACK_CATEGORY_CODE = 'GEN';

export const SAMPLE_PRODUCTS: SampleProduct[] = [
  {
    id: 'sample-electronics',
    name: '电子-蓝牙耳机',
    categoryId: 'earphones',
    skuCode: 'EL-26001-01',
    skuId: '6049931833437',
    productCode: 'P26001',
    categoryCode: 'C1002',
    productYear: 2026,
    productId: '1129121929',
  },
  {
    id: 'sample-tee',
    name: 'T恤-黑色',
    categoryId: 'tshirt-short',
    skuCode: 'BLK-TS-008-01',
    skuId: '5967085165439',
    productCode: 'P26002',
    categoryCode: 'C1003',
    productYear: 2026,
    productId: '1117178498',
  },
  {
    id: 'sample-bag',
    name: '箱包-单肩包',
    categoryId: 'shoulder',
    skuCode: '45d4de-4-1011675501716',
    skuId: '6031841823801',
    productCode: 'P26003',
    categoryCode: 'C1004',
    productYear: 2025,
    productId: '1091557735',
  },
  {
    id: 'sample-home',
    name: '家居-收纳盒',
    categoryId: 'home-storage',
    skuCode: 'HOME-001',
    skuId: '6031841823802',
    productCode: 'P26004',
    categoryCode: 'C1005',
    productYear: 2026,
    productId: '1100000001',
  },
];

export function categoryNode(categoryId: string) {
  return CATEGORY_NODES.find((node) => node.id === categoryId);
}

export function categoryPath(categoryId: string) {
  const path: CategoryNode[] = [];
  let node = categoryNode(categoryId);
  while (node) {
    path.unshift(node);
    node = node.parentId ? categoryNode(node.parentId) : undefined;
  }
  return path;
}

export function categoryPathLabel(categoryId: string) {
  return categoryPath(categoryId)
    .map((node) => node.name)
    .join(' / ');
}

export function sanitizeCode(value: string, maxLength = MAX_CODE_LENGTH) {
  return value.replace(/[^A-Za-z0-9]/g, '').slice(0, maxLength);
}

export interface CategoryResolution {
  code: string;
  sourceNode?: CategoryNode;
  isFallback: boolean;
}

export function resolveCategoryCode(
  categoryId: string,
  categoryCodes: Record<string, string>,
  fallbackCategoryCode: string,
  mode: CategoryFallbackMode = 'inherit',
): CategoryResolution {
  const node = categoryNode(categoryId);
  if (node) {
    const ownCode = sanitizeCode(categoryCodes[node.id] ?? '', 6);
    if (ownCode) return { code: ownCode, sourceNode: node, isFallback: false };
  }

  if (mode === 'inherit' && node?.parentId) {
    let parent = categoryNode(node.parentId);
    while (parent) {
      const code = sanitizeCode(categoryCodes[parent.id] ?? '', 6);
      if (code) return { code, sourceNode: parent, isFallback: false };
      parent = parent.parentId ? categoryNode(parent.parentId) : undefined;
    }
  }

  const fallback = sanitizeCode(fallbackCategoryCode, 6);
  return { code: fallback, isFallback: true };
}

export function inheritedCategoryCode(
  categoryId: string,
  categoryCodes: Record<string, string>,
  fallbackCategoryCode: string,
  mode: CategoryFallbackMode = 'inherit',
) {
  if (mode === 'universal') return sanitizeCode(fallbackCategoryCode, 6);
  const node = categoryNode(categoryId);
  const parent = node?.parentId ? categoryNode(node.parentId) : undefined;
  if (!parent) return sanitizeCode(fallbackCategoryCode, 6);
  return resolveCategoryCode(parent.id, categoryCodes, fallbackCategoryCode, 'inherit').code;
}

function applyTransform(value: string, transform: Transform) {
  if (transform === 'upper') return value.toUpperCase();
  if (transform === 'lower') return value.toLowerCase();
  return value;
}

export function variableRawValue(source: VariableSource, product: SampleProduct) {
  if (source === 'productCode') return product.productCode;
  if (source === 'skuId') return product.skuId;
  if (source === 'random') return '随机数';
  return product.categoryCode;
}

const SEGMENT_DEFAULTS = {
  factory: 'ABC',
  yearDigits: 2 as const,
  yearSource: 'current' as const,
  serialMode: 'increment' as const,
  serialSource: 'productCode' as const,
  serialExtractMode: 'prefix' as const,
  serialStart: 1,
  serialDigits: 5,
  serialFieldLength: 3,
  serialTransform: 'none' as const,
  customMode: 'variable' as const,
  variableSource: 'productCode' as const,
  extractMode: 'prefix' as const,
  extractLength: 3,
  transform: 'upper' as const,
  text: 'V1',
};

let segmentSeq = 0;

export function createSegment(type: SegmentType, overrides: Partial<RuleSegment> = {}): RuleSegment {
  segmentSeq += 1;
  return {
    id: `seg-${Date.now()}-${segmentSeq}`,
    type,
    separatorBefore: '-',
    ...SEGMENT_DEFAULTS,
    ...overrides,
  };
}

export function cloneConfig(config: PidConfig): PidConfig {
  return {
    segments: config.segments.map((segment) => ({ ...segment })),
    categoryCodes: { ...config.categoryCodes },
    fallbackCategoryCode: config.fallbackCategoryCode,
    categoryFallbackMode: config.categoryFallbackMode,
  };
}

export function createDefaultPidConfig(): PidConfig {
  return {
    segments: [
      createSegment('factory', { id: 'rule-factory', separatorBefore: '', factory: 'ABC' }),
      createSegment('category', { id: 'rule-category', separatorBefore: '-' }),
      createSegment('year', { id: 'rule-year', separatorBefore: '-', yearDigits: 2, yearSource: 'current' }),
      createSegment('serial', {
        id: 'rule-serial',
        separatorBefore: '',
        serialMode: 'increment',
        serialStart: 1,
        serialDigits: 5,
      }),
      createSegment('custom', { id: 'rule-custom', separatorBefore: '-', customMode: 'constant', text: 'V1' }),
    ],
    categoryCodes: { ...DEFAULT_CATEGORY_CODES },
    fallbackCategoryCode: DEFAULT_FALLBACK_CATEGORY_CODE,
    categoryFallbackMode: 'inherit',
  };
}

export interface SegmentValueResult {
  value: string;
  error?: string;
  note?: string;
  sourceValue?: string;
  source?: 'current' | 'inherit' | 'universal';
}

export function segmentValue(
  segment: RuleSegment,
  product: SampleProduct,
  fallbackCategoryCode: string,
  currentYear = CURRENT_YEAR,
): SegmentValueResult {
  if (segment.type === 'factory') {
    const value = sanitizeCode(segment.factory, 8);
    return value ? { value, sourceValue: segment.factory } : { value: '', error: '请填写工厂缩写' };
  }

  if (segment.type === 'category') {
    const code = sanitizeCode(fallbackCategoryCode, 6);
    if (!code) {
      return { value: '', error: '请填写通用缩写码' };
    }
    return {
      value: code,
      source: 'universal',
      note: '预览演示：通用缩写码',
    };
  }

  if (segment.type === 'year') {
    const year = segment.yearSource === 'product' ? product.productYear : currentYear;
    const value =
      segment.yearDigits === 2 ? String(year).slice(-2).padStart(2, '0') : String(year).padStart(4, '0');
    return { value, sourceValue: String(year), note: segment.yearSource === 'product' ? '商品创建年份' : '当前年份' };
  }

  if (segment.type === 'serial') {
    if (segment.serialMode === 'random') {
      const length = Math.max(4, Math.min(12, segment.serialFieldLength));
      return {
        value: '482751936048'.slice(0, length),
        note: '示例值，实际生成时随机，每次生成可能不同',
      };
    }
    if (segment.serialMode === 'fieldExtract') {
      const raw = variableRawValue(segment.serialSource, product);
      const clean = raw.replace(/[^A-Za-z0-9]/g, '');
      if (!clean) return { value: '', error: '来源字段为空', sourceValue: raw };
      const length = Math.max(1, segment.serialFieldLength);
      const value = applyTransform(
        segment.serialExtractMode === 'prefix' ? clean.slice(0, length) : clean.slice(-length),
        segment.serialTransform,
      );
      const sourceLabel =
        segment.serialSource === 'productCode'
          ? '商品编码'
          : segment.serialSource === 'categoryCode'
            ? '类目编码'
            : 'SKUID';
      return {
        value,
        sourceValue: raw,
        note:
          length > clean.length
            ? `${sourceLabel}取${segment.serialExtractMode === 'prefix' ? '前' : '后'} ${length} 位，字段长度不足，已取全部`
            : undefined,
      };
    }
    if (segment.serialStart < 0) return { value: '', error: '起始值不能小于 0' };
    if (String(segment.serialStart).length > segment.serialDigits) {
      return { value: '', error: '位数不足以容纳起始值' };
    }
    return {
      value: String(segment.serialStart).padStart(segment.serialDigits, '0'),
      note: '系统生成，允许重复',
    };
  }

  if (segment.customMode === 'constant') {
    const value = sanitizeCode(segment.text, 12);
    return value ? { value, sourceValue: segment.text } : { value: '', error: '请填写常量' };
  }

  if (segment.variableSource === 'random') {
    const length = Math.max(4, Math.min(12, segment.extractLength));
    return {
      value: '482751936048'.slice(0, length),
      sourceValue: '随机数',
      note: '示例值，实际生成时随机',
    };
  }

  const raw = variableRawValue(segment.variableSource, product);
  const clean = raw.replace(/[^A-Za-z0-9]/g, '');
  if (!clean) return { value: '', error: '来源字段为空', sourceValue: raw };
  const length = Math.max(1, segment.extractLength);
  const part = segment.extractMode === 'prefix' ? clean.slice(0, length) : clean.slice(-length);
  const value = applyTransform(part, segment.transform);
  return {
    value,
    sourceValue: raw,
    note: length > clean.length ? `字段长度不足 ${length} 位，已取全部` : undefined,
  };
}

export interface PreviewPart {
  id: string;
  type: SegmentType;
  label: string;
  separator: '' | '-';
  value: string;
  error?: string;
  note?: string;
  source?: 'current' | 'inherit' | 'universal';
}

export interface RulePreview {
  code: string;
  parts: PreviewPart[];
  errors: string[];
  valid: boolean;
  length: number;
}

export function buildRulePreview(
  segments: RuleSegment[],
  product: SampleProduct,
  fallbackCategoryCode: string,
  currentYear = CURRENT_YEAR,
): RulePreview {
  const parts: PreviewPart[] = segments.map((segment) => {
    const result = segmentValue(segment, product, fallbackCategoryCode, currentYear);
    return {
      id: segment.id,
      type: segment.type,
      label: SEGMENT_LABELS[segment.type],
      separator: segment.separatorBefore,
      value: result.value,
      error: result.error,
      note: result.note,
      source: result.source,
    };
  });

  const errors = parts.flatMap((part) => (part.error ? [part.error] : []));

  let code = '';
  if (parts.length === 0) {
    errors.push('请至少添加一个段');
  } else if (errors.length === 0) {
    parts.forEach((part, index) => {
      if (index > 0 && part.separator === '-' && code) code += '-';
      code += part.value;
    });
    if (!/^[A-Za-z0-9]+(-[A-Za-z0-9]+)*$/.test(code)) {
      errors.push('生成结果包含非法字符或分隔符');
    }
    if (code.length > MAX_CODE_LENGTH) {
      errors.push(`生成结果超过 ${MAX_CODE_LENGTH} 位（当前 ${code.length} 位）`);
    }
  }

  return {
    code,
    parts,
    errors: Array.from(new Set(errors)),
    valid: errors.length === 0,
    length: code.length,
  };
}

export interface ValidationIssue {
  segmentId?: string;
  level: 'error' | 'warning';
  message: string;
}

export function validateConfig(config: PidConfig): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (config.segments.length === 0) {
    issues.push({ level: 'error', message: '请至少添加一个段' });
  }

  config.segments.forEach((segment) => {
    if (segment.type === 'factory') {
      if (!sanitizeCode(segment.factory, 8)) {
        issues.push({ segmentId: segment.id, level: 'error', message: '请填写工厂缩写' });
      }
    }

    if (segment.type === 'category' && !sanitizeCode(config.fallbackCategoryCode, 6)) {
      issues.push({ segmentId: segment.id, level: 'error', message: '请填写通用缩写码' });
    }

    if (segment.type === 'serial') {
      if (segment.serialMode === 'increment') {
        if (segment.serialDigits < 4 || segment.serialDigits > 8) {
          issues.push({ segmentId: segment.id, level: 'error', message: '流水位数需在 4-8 之间' });
        }
        if (segment.serialStart < 0) {
          issues.push({ segmentId: segment.id, level: 'error', message: '流水起始值不能小于 0' });
        }
        if (String(segment.serialStart).length > segment.serialDigits) {
          issues.push({
            segmentId: segment.id,
            level: 'error',
            message: '流水位数不足以容纳起始值',
          });
        }
      } else {
        const min = segment.serialMode === 'random' ? 4 : 1;
        if (segment.serialFieldLength < min || segment.serialFieldLength > 12) {
          issues.push({
            segmentId: segment.id,
            level: 'error',
            message: segment.serialMode === 'random' ? '随机位数需在 4-12 之间' : '取值位数需在 1-12 之间',
          });
        }
      }
    }

    if (segment.type === 'custom') {
      if (segment.customMode === 'constant') {
        if (!sanitizeCode(segment.text, 12)) {
          issues.push({ segmentId: segment.id, level: 'error', message: '请填写自定义常量' });
        }
      } else if (segment.variableSource === 'random') {
        if (segment.extractLength < 4 || segment.extractLength > 12) {
          issues.push({ segmentId: segment.id, level: 'error', message: '随机位数需在 4-12 之间' });
        }
      } else if (segment.extractLength < 1 || segment.extractLength > 12) {
        issues.push({ segmentId: segment.id, level: 'error', message: '取值位数需在 1-12 之间' });
      }
    }
  });

  return issues;
}
