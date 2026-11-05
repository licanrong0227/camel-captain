import React, { useEffect, useMemo, useRef, useState } from 'react';
import CategoryCodeDialog from './category-code-dialog';
import {
  CURRENT_YEAR,
  SAMPLE_PRODUCTS,
  SEGMENT_DESCRIPTIONS,
  SEGMENT_LABELS,
  buildRulePreview,
  cloneConfig,
  createSegment,
  sanitizeCode,
  segmentValue,
  validateConfig,
  variableRawValue,
  type PidConfig,
  type RuleSegment,
  type SampleProduct,
  type SegmentType,
  type ValidationIssue,
} from './pid-rule-model';
import './pid-rule-dialog.css';

const TRANSFORM_OPTIONS = [
  { value: 'none', label: '保持原样' },
  { value: 'upper', label: '转大写' },
  { value: 'lower', label: '转小写' },
];

const SOURCE_OPTIONS = [
  { value: 'productCode', label: '商品编码' },
  { value: 'skuId', label: 'SKUID' },
  { value: 'categoryCode', label: '类目编码' },
  { value: 'random', label: '随机数' },
];

const SERIAL_SOURCE_OPTIONS = [
  { value: 'productCode', label: '商品编码' },
  { value: 'categoryCode', label: '类目编码' },
  { value: 'skuId', label: 'SKUID' },
];

const EXTRACT_OPTIONS = [
  { value: 'prefix', label: '前' },
  { value: 'suffix', label: '后' },
];

const YEAR_FORMAT_OPTIONS = [
  { value: '2', label: '2 位' },
  { value: '4', label: '4 位' },
];

const YEAR_SOURCE_OPTIONS = [
  { value: 'current', label: '当前年份' },
  { value: 'product', label: '商品创建年份' },
];

const SEPARATOR_OPTIONS = [
  { value: '', label: '无' },
  { value: '-', label: '-' },
];

const SEGMENT_ORDER: SegmentType[] = ['factory', 'category', 'year', 'serial', 'custom'];

function Caret({ open }: { open: boolean }) {
  return (
    <svg className={`nsp-caret${open ? ' is-open' : ''}`} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Chevron({ direction }: { direction: 'up' | 'down' }) {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d={direction === 'up' ? 'M3 7.5 6 4.5l3 3' : 'M3 4.5 6 7.5l3-3'}
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2.8 2.8l6.4 6.4M9.2 2.8 2.8 9.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function NspSelect({
  value,
  options,
  onChange,
  width,
  label,
  disabled,
  dropUp,
}: {
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  width?: number;
  label: string;
  disabled?: boolean;
  dropUp?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return undefined;
    const handlePointer = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div className={`nsp-select${disabled ? ' is-disabled' : ''}`} ref={rootRef} style={{ width }}>
      <button
        type="button"
        className={`nsp-select__trigger${open ? ' is-open' : ''}`}
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((previous) => !previous)}
      >
        <span className="nsp-select__value">{current ? current.label : ''}</span>
        <Caret open={open} />
      </button>
      {open && (
        <div className={`nsp-select__menu${dropUp ? ' is-up' : ''}`} role="listbox" aria-label={label}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              className={`nsp-select__option${option.value === value ? ' is-selected' : ''}`}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function NspStepper({
  value,
  onChange,
  min = 0,
  max = 99999999,
  width = 88,
  label,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  width?: number;
  label: string;
}) {
  const commit = (next: number) => onChange(Math.min(max, Math.max(min, next)));
  return (
    <span className="nsp-stepper" style={{ width }}>
      <input
        className="nsp-stepper__input"
        aria-label={label}
        inputMode="numeric"
        value={String(value)}
        onChange={(event) => {
          const digits = event.target.value.replace(/[^\d]/g, '');
          commit(digits ? Number(digits) : min);
        }}
      />
      <span className="nsp-stepper__btns">
        <button type="button" aria-label={`${label}增加`} onClick={() => commit(value + 1)}>
          <Chevron direction="up" />
        </button>
        <button type="button" aria-label={`${label}减少`} onClick={() => commit(value - 1)}>
          <Chevron direction="down" />
        </button>
      </span>
    </span>
  );
}

function NspRadio({ checked, label, onChange }: { checked: boolean; label: string; onChange: () => void }) {
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

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button type="button" className="nsp-icon-btn" aria-label={label} title={label} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}

function SegmentCard({
  segment,
  index,
  total,
  product,
  fallbackCategoryCode,
  issues,
  onChange,
  onMove,
  onRemove,
  onConfigureCategory,
}: {
  segment: RuleSegment;
  index: number;
  total: number;
  product: SampleProduct;
  fallbackCategoryCode: string;
  issues: ValidationIssue[];
  onChange: (partial: Partial<RuleSegment>) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
  onConfigureCategory: () => void;
}) {
  const result = segmentValue(segment, product, fallbackCategoryCode);
  const messages = Array.from(
    new Set([
      ...issues.filter((issue) => issue.level === 'error').map((issue) => issue.message),
      ...(result.error ? [result.error] : []),
    ]),
  ).filter(
    (message, index, list) =>
      !list.some((other, otherIndex) => otherIndex !== index && other !== message && other.includes(message)),
  );

  return (
    <div className="nsp-segment">
      <div className="nsp-seg-head">
        <span className="nsp-seg-type">{SEGMENT_LABELS[segment.type]}</span>
        <span className="nsp-seg-sep">
          前置分隔符
          {index === 0 ? (
            <span className="nsp-seg-sep-static">首个段无</span>
          ) : (
            <NspSelect
              label="前置分隔符"
              value={segment.separatorBefore}
              options={SEPARATOR_OPTIONS}
              width={64}
              onChange={(value) => onChange({ separatorBefore: value as '' | '-' })}
            />
          )}
        </span>
        <span className="nsp-seg-actions">
          <IconButton label="上移段" disabled={index === 0} onClick={() => onMove(-1)}>
            <Chevron direction="up" />
          </IconButton>
          <IconButton label="下移段" disabled={index === total - 1} onClick={() => onMove(1)}>
            <Chevron direction="down" />
          </IconButton>
          <IconButton label="删除段" onClick={onRemove}>
            <CloseIcon />
          </IconButton>
        </span>
      </div>

      <div className="nsp-seg-body">
        {segment.type === 'factory' && (
          <div className="nsp-inline">
            <input
              className="nsp-input nsp-input--factory"
              aria-label="工厂缩写"
              value={segment.factory}
              placeholder="如 ABC"
              onChange={(event) => onChange({ factory: sanitizeCode(event.target.value, 8) })}
            />
            <span className="nsp-hint">仅支持字母和数字，1-8 位，按输入原样保留</span>
          </div>
        )}

        {segment.type === 'category' && (
          <div className="nsp-inline">
            <span className="nsp-inline-label">按商品类目匹配</span>
            <button type="button" className="nsp-link" onClick={onConfigureCategory}>
              配置缩写码
            </button>
          </div>
        )}

        {segment.type === 'year' && (
          <div className="nsp-inline">
            <span className="nsp-inline-label">格式</span>
            <NspSelect
              label="年份格式"
              value={String(segment.yearDigits)}
              options={YEAR_FORMAT_OPTIONS}
              width={78}
              onChange={(value) => onChange({ yearDigits: Number(value) as 2 | 4 })}
            />
            <span className="nsp-inline-label">来源</span>
            <NspSelect
              label="年份来源"
              value={segment.yearSource}
              options={YEAR_SOURCE_OPTIONS}
              width={128}
              onChange={(value) => onChange({ yearSource: value as 'current' | 'product' })}
            />
            <span className="nsp-hint">示例：{result.value}</span>
          </div>
        )}

        {segment.type === 'serial' && (
          <>
            <div className="nsp-inline">
              <NspRadio
                checked={segment.serialMode === 'increment'}
                label="自增"
                onChange={() => onChange({ serialMode: 'increment' })}
              />
              <NspRadio
                checked={segment.serialMode === 'fieldExtract'}
                label="字段截取"
                onChange={() => onChange({ serialMode: 'fieldExtract' })}
              />
              <NspRadio
                checked={segment.serialMode === 'random'}
                label="随机数"
                onChange={() =>
                  onChange({
                    serialMode: 'random',
                    serialFieldLength: Math.max(4, segment.serialFieldLength),
                  })
                }
              />
            </div>
            {segment.serialMode === 'increment' && (
              <div className="nsp-inline nsp-inline--controls">
                <span>起始值</span>
                <NspStepper
                  label="流水起始值"
                  value={segment.serialStart}
                  max={99999999}
                  width={96}
                  onChange={(value) => onChange({ serialStart: value })}
                />
                <span>位数</span>
                <NspStepper
                  label="流水位数"
                  value={segment.serialDigits}
                  min={4}
                  max={8}
                  width={80}
                  onChange={(value) => onChange({ serialDigits: value })}
                />
                <span className="nsp-hint">系统生成，允许重复；示例：{result.value || '-'}</span>
              </div>
            )}
            {segment.serialMode === 'fieldExtract' && (
              <div className="nsp-inline nsp-inline--controls">
                <NspSelect
                  label="字段来源"
                  value={segment.serialSource}
                  options={SERIAL_SOURCE_OPTIONS}
                  width={118}
                  onChange={(value) => onChange({ serialSource: value as RuleSegment['serialSource'] })}
                />
                <span>取</span>
                <NspSelect
                  label="取值方向"
                  value={segment.serialExtractMode}
                  options={EXTRACT_OPTIONS}
                  width={64}
                  onChange={(value) => onChange({ serialExtractMode: value as RuleSegment['serialExtractMode'] })}
                />
                <NspStepper
                  label="字段取值位数"
                  value={segment.serialFieldLength}
                  min={1}
                  max={12}
                  width={80}
                  onChange={(value) => onChange({ serialFieldLength: value })}
                />
                <span>位</span>
                <NspSelect
                  label="流水转换方式"
                  value={segment.serialTransform}
                  options={TRANSFORM_OPTIONS}
                  width={108}
                  onChange={(value) => onChange({ serialTransform: value as RuleSegment['serialTransform'] })}
                />
                <span className="nsp-hint">
                  示例：{variableRawValue(segment.serialSource, product) || '-'} → {result.value || '-'}
                  {result.note ? `；${result.note}` : ''}
                </span>
              </div>
            )}
            {segment.serialMode === 'random' && (
              <div className="nsp-inline nsp-inline--controls">
                <span>随机位数</span>
                <NspStepper
                  label="随机位数"
                  value={segment.serialFieldLength}
                  min={4}
                  max={12}
                  width={80}
                  onChange={(value) => onChange({ serialFieldLength: value })}
                />
                <span>位</span>
                <span className="nsp-hint">示例：{result.value || '-'}；实际生成时随机，每次生成可能不同</span>
              </div>
            )}
          </>
        )}

        {segment.type === 'custom' && (
          <>
            <div className="nsp-inline">
              <NspRadio
                checked={segment.customMode === 'variable'}
                label="变量"
                onChange={() => onChange({ customMode: 'variable' })}
              />
              <NspRadio
                checked={segment.customMode === 'constant'}
                label="常量"
                onChange={() => onChange({ customMode: 'constant' })}
              />
            </div>
            {segment.customMode === 'variable' ? (
              <>
                <div className="nsp-inline nsp-inline--controls">
                  <NspSelect
                    label="变量来源"
                    value={segment.variableSource}
                    options={SOURCE_OPTIONS}
                    width={118}
                    onChange={(value) =>
                      onChange({
                        variableSource: value as RuleSegment['variableSource'],
                        ...(value === 'random' ? { extractLength: Math.max(4, segment.extractLength) } : {}),
                      })
                    }
                  />
                  {segment.variableSource === 'random' ? (
                    <>
                      <span>随机</span>
                      <NspStepper
                        label="随机位数"
                        value={segment.extractLength}
                        min={4}
                        max={12}
                        width={76}
                        onChange={(value) => onChange({ extractLength: value })}
                      />
                      <span>位</span>
                    </>
                  ) : (
                    <>
                      <span>取</span>
                      <NspSelect
                        label="取值方向"
                        value={segment.extractMode}
                        options={EXTRACT_OPTIONS}
                        width={64}
                        onChange={(value) => onChange({ extractMode: value as RuleSegment['extractMode'] })}
                      />
                      <NspStepper
                        label="取值位数"
                        value={segment.extractLength}
                        min={1}
                        max={12}
                        width={76}
                        onChange={(value) => onChange({ extractLength: value })}
                      />
                      <span>位</span>
                      <NspSelect
                        label="变量转换方式"
                        value={segment.transform}
                        options={TRANSFORM_OPTIONS}
                        width={108}
                        onChange={(value) => onChange({ transform: value as RuleSegment['transform'] })}
                      />
                    </>
                  )}
                </div>
                <p className="nsp-hint">
                  {segment.variableSource === 'random'
                    ? `示例：随机 ${segment.extractLength} 位 → ${result.value || '-'}${result.note ? `；${result.note}` : ''}`
                    : `示例：${variableRawValue(segment.variableSource, product) || '-'} → ${result.value || '-'}${result.note ? `；${result.note}` : ''}`}
                </p>
              </>
            ) : (
              <div className="nsp-inline">
                <input
                  className="nsp-input nsp-input--custom"
                  aria-label="自定义常量"
                  value={segment.text}
                  placeholder="如 V1 / BLK"
                  onChange={(event) => onChange({ text: sanitizeCode(event.target.value, 12) })}
                />
                <span className="nsp-hint">仅支持字母和数字，1-12 位，按输入原样保留</span>
              </div>
            )}
          </>
        )}

        {messages.length > 0 && <p className="nsp-error">{messages.join('；')}</p>}
      </div>
    </div>
  );
}

interface PidRuleDialogProps {
  initialConfig: PidConfig;
  onCancel: () => void;
  onConfirm: (config: PidConfig) => void;
  onNotify: (message: string) => void;
}

export default function PidRuleDialog({ initialConfig, onCancel, onConfirm, onNotify }: PidRuleDialogProps) {
  const [draft, setDraft] = useState<PidConfig>(() => cloneConfig(initialConfig));
  const [mappingOpen, setMappingOpen] = useState(false);
  const [segmentMenuOpen, setSegmentMenuOpen] = useState(false);
  const segmentMenuRef = useRef<HTMLDivElement>(null);

  const sampleProduct = SAMPLE_PRODUCTS[0];
  const issues = useMemo(() => validateConfig(draft), [draft]);
  const preview = useMemo(
    () => buildRulePreview(draft.segments, sampleProduct, draft.fallbackCategoryCode, CURRENT_YEAR),
    [draft, sampleProduct],
  );
  const usedTypes = new Set(draft.segments.map((segment) => segment.type));
  const generalIssues = issues.filter((issue) => !issue.segmentId);

  useEffect(() => {
    if (!segmentMenuOpen) return undefined;
    const handlePointer = (event: MouseEvent) => {
      if (segmentMenuRef.current && !segmentMenuRef.current.contains(event.target as Node)) setSegmentMenuOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSegmentMenuOpen(false);
    };
    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [segmentMenuOpen]);

  const updateSegment = (segmentId: string, partial: Partial<RuleSegment>) => {
    setDraft((previous) => ({
      ...previous,
      segments: previous.segments.map((segment) => (segment.id === segmentId ? { ...segment, ...partial } : segment)),
    }));
  };

  const addSegment = (type: SegmentType) => {
    if (type !== 'custom' && usedTypes.has(type)) return;
    const segment = createSegment(type, {
      separatorBefore: draft.segments.length === 0 ? '' : '-',
    });
    setDraft((previous) => ({ ...previous, segments: [...previous.segments, segment] }));
    setSegmentMenuOpen(false);
  };

  const removeSegment = (segmentId: string) => {
    setDraft((previous) => ({
      ...previous,
      segments: previous.segments.filter((segment) => segment.id !== segmentId),
    }));
  };

  const moveSegment = (segmentId: string, direction: -1 | 1) => {
    setDraft((previous) => {
      const index = previous.segments.findIndex((segment) => segment.id === segmentId);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= previous.segments.length) return previous;
      const segments = [...previous.segments];
      const [segment] = segments.splice(index, 1);
      segments.splice(nextIndex, 0, segment);
      return { ...previous, segments };
    });
  };

  const handleSave = () => {
    const firstError = validateConfig(draft).find((issue) => issue.level === 'error');
    if (firstError) {
      onNotify(firstError.message);
      return;
    }
    onConfirm(cloneConfig(draft));
  };

  return (
    <div className="nsp-mask">
      <section className="nsp-dialog" role="dialog" aria-modal="true" aria-label="NS-PID 生成规则">
        <header className="nsp-header">
          <h2 className="nsp-title">NS-PID 生成规则</h2>
          <button type="button" className="nsp-close" aria-label="关闭" onClick={onCancel}>
            <CloseIcon />
          </button>
        </header>

        <div className="nsp-form">
          {generalIssues.length > 0 && (
            <div className="nsp-error-block">
              {generalIssues.map((issue) => (
                <p key={issue.message}>{issue.message}</p>
              ))}
            </div>
          )}

          <section className="nsp-section">
            <div className="nsp-section-head">
              <h3 className="nsp-section-title">模板段块</h3>
              <div className="nsp-section-actions">
                <div className="nsp-segment-menu" ref={segmentMenuRef}>
                  <button type="button" className="nsp-add-segment" onClick={() => setSegmentMenuOpen((previous) => !previous)}>
                    + 添加段
                  </button>
                  {segmentMenuOpen && (
                    <div className="nsp-popover nsp-seg-menu">
                      {SEGMENT_ORDER.map((type) => {
                        const disabled = type !== 'custom' && usedTypes.has(type);
                        return (
                          <button
                            key={type}
                            type="button"
                            className={`nsp-seg-option${disabled ? ' is-disabled' : ''}`}
                            disabled={disabled}
                            onClick={() => addSegment(type)}
                          >
                            <span className="nsp-seg-option-main">
                              <strong>{SEGMENT_LABELS[type]}</strong>
                              <span>{SEGMENT_DESCRIPTIONS[type]}</span>
                            </span>
                            {disabled && <span className="nsp-seg-option-state">已添加</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="nsp-segments">
              {draft.segments.length === 0 ? (
                <div className="nsp-empty">还没有段，请点击「添加段」。</div>
              ) : (
                draft.segments.map((segment, index) => (
                  <SegmentCard
                    key={segment.id}
                    segment={segment}
                    index={index}
                    total={draft.segments.length}
                    product={sampleProduct}
                    fallbackCategoryCode={draft.fallbackCategoryCode}
                    issues={issues.filter((issue) => issue.segmentId === segment.id)}
                    onChange={(partial) => updateSegment(segment.id, partial)}
                    onMove={(direction) => moveSegment(segment.id, direction)}
                    onRemove={() => removeSegment(segment.id)}
                    onConfigureCategory={() => setMappingOpen(true)}
                  />
                ))
              )}
            </div>
          </section>

          <section className="nsp-preview">
            <div className="nsp-preview-head">
              <div>
                <h3 className="nsp-section-title">生成预览</h3>
                <span className="nsp-hint">按当前规则拼接，结果仅用于预览</span>
              </div>
            </div>

            <div className="nsp-parts">
              {preview.parts.map((part, index) => (
                <React.Fragment key={part.id}>
                  {index > 0 && part.separator === '-' && <span className="nsp-part-sep">-</span>}
                  <span className={`nsp-part${part.error ? ' is-error' : ''}`} title={part.error || part.note || part.label}>
                    {part.value || '?'}
                    {part.type === 'category' && part.source === 'universal' && (
                      <em className="nsp-part-tag">通用</em>
                    )}
                  </span>
                </React.Fragment>
              ))}
            </div>

            {preview.valid ? (
              <>
                <div className="nsp-preview-code">{preview.code}</div>
                <p className="nsp-preview-status is-ok">格式合法 · {preview.length} 位</p>
              </>
            ) : (
              <div className="nsp-preview-errors">
                {preview.errors.map((message) => (
                  <p key={message}>{message}</p>
                ))}
              </div>
            )}
          </section>
        </div>

        <footer className="nsp-footer">
          <button type="button" className="ocd-btn ocd-btn--ghost" onClick={onCancel}>
            取消
          </button>
          <button type="button" className="ocd-btn ocd-btn--primary" onClick={handleSave}>
            保存
          </button>
        </footer>
      </section>

      {mappingOpen && (
        <CategoryCodeDialog
          categoryCodes={draft.categoryCodes}
          fallbackCategoryCode={draft.fallbackCategoryCode}
          categoryFallbackMode={draft.categoryFallbackMode}
          onCancel={() => setMappingOpen(false)}
          onSave={(codes, fallback, mode) => {
            setDraft((previous) => ({
              ...previous,
              categoryCodes: codes,
              fallbackCategoryCode: fallback,
              categoryFallbackMode: mode,
            }));
            setMappingOpen(false);
            onNotify('类目缩写码已保存');
          }}
        />
      )}
    </div>
  );
}
