import React, { useEffect, useMemo, useRef, useState } from 'react';

export interface Option {
  label: string;
  value: string;
  disabled?: boolean;
}

type ButtonVariant = 'primary' | 'default' | 'danger' | 'text' | 'link' | 'soft' | 'ghost';
type ButtonSize = 'large' | 'default' | 'small' | 'mini';

export interface ErpButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  block?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit';
}

export function ErpButton({
  variant = 'default',
  size = 'default',
  icon,
  block,
  loading,
  children,
  className = '',
  disabled,
  type = 'button',
  ...rest
}: ErpButtonProps) {
  const classes = [
    'el-button',
    'erp-btn',
    variant !== 'default' ? `erp-btn--${variant}` : '',
    size !== 'default' ? `erp-btn--${size}` : '',
    block ? 'erp-btn--block' : '',
    loading ? 'is-loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <button type={type} className={classes} disabled={disabled || loading} {...rest}>
      {loading ? <span className="erp-spinner" aria-hidden /> : icon ? <span className="erp-btn__icon">{icon}</span> : null}
      {children ? <span>{children}</span> : null}
    </button>
  );
}

export interface ErpInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  onEnter?: () => void;
  className?: string;
  style?: React.CSSProperties;
  maxLength?: number;
  type?: string;
  ariaLabel?: string;
  autoFocus?: boolean;
}

export function ErpInput({
  value = '',
  onChange,
  placeholder,
  disabled,
  clearable,
  prefix,
  suffix,
  onEnter,
  className = '',
  style,
  maxLength,
  type = 'text',
  ariaLabel,
  autoFocus,
}: ErpInputProps) {
  const showClear = Boolean(clearable && value && !disabled);
  return (
    <span className={`erp-input ${disabled ? 'is-disabled' : ''} ${className}`} style={style}>
      {prefix ? <span className="erp-input__prefix">{prefix}</span> : null}
      <input
        aria-label={ariaLabel || placeholder}
        type={type}
        value={value}
        disabled={disabled}
        autoFocus={autoFocus}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(event) => onChange?.(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') onEnter?.();
        }}
      />
      {showClear ? (
        <button type="button" className="erp-input__clear" aria-label="清空" onClick={() => onChange?.('')}>
          ×
        </button>
      ) : null}
      {suffix ? <span className="erp-input__suffix">{suffix}</span> : null}
      {maxLength ? <span className="erp-input__count">{value.length}/{maxLength}</span> : null}
    </span>
  );
}

export function ErpTextarea({
  value = '',
  onChange,
  placeholder,
  rows = 4,
  disabled,
  maxLength,
  className = '',
}: {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  maxLength?: number;
  className?: string;
}) {
  return (
    <span className={`erp-textarea ${className}`}>
      <textarea
        value={value}
        rows={rows}
        disabled={disabled}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(event) => onChange?.(event.target.value)}
      />
      {maxLength ? (
        <span className="erp-textarea__count">
          {value.length}/{maxLength}
        </span>
      ) : null}
    </span>
  );
}

export function ErpInputNumber({
  value,
  onChange,
  min = 0,
  max = 999999,
  step = 1,
  precision = 0,
  suffix,
  width = 140,
}: {
  value: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  suffix?: string;
  width?: number;
}) {
  const clamp = (next: number) => Math.min(max, Math.max(min, Number.isFinite(next) ? next : min));
  const apply = (next: number) => onChange?.(Number(clamp(next).toFixed(precision)));
  return (
    <span className="erp-number" style={{ width }}>
      <button type="button" className="erp-number__btn" onClick={() => apply(value - step)} aria-label="减少">
        −
      </button>
      <input
        value={Number(value).toFixed(precision)}
        onChange={(event) => apply(Number(event.target.value))}
        aria-label="数值"
      />
      <button type="button" className="erp-number__btn" onClick={() => apply(value + step)} aria-label="增加">
        +
      </button>
      {suffix ? <span className="erp-number__suffix">{suffix}</span> : null}
    </span>
  );
}

function useOutsideClose(onClose: () => void) {
  const ref = useRef<HTMLSpanElement | null>(null);
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);
  return ref;
}

export interface ErpSelectProps {
  options: Option[];
  value?: string | string[] | null;
  onChange?: (value: string | string[]) => void;
  multiple?: boolean;
  filterable?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  placeholder?: string;
  width?: number | string;
  maxTagCount?: number;
  className?: string;
  ariaLabel?: string;
}

export function ErpSelect({
  options,
  value,
  onChange,
  multiple,
  filterable,
  clearable,
  disabled,
  placeholder = '请选择',
  width = 180,
  maxTagCount = 2,
  className = '',
  ariaLabel,
}: ErpSelectProps) {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const ref = useOutsideClose(() => setOpen(false));
  const selected = multiple ? (Array.isArray(value) ? value : value ? [value] : []) : value ? [String(value)] : [];
  const selectedOptions = options.filter((option) => selected.includes(option.value));
  const label = selectedOptions.map((option) => option.label).join('、');

  const filtered = keyword
    ? options.filter((option) => option.label.toLowerCase().includes(keyword.toLowerCase()))
    : options;

  const toggle = (option: Option) => {
    if (option.disabled) return;
    if (multiple) {
      const next = selected.includes(option.value)
        ? selected.filter((item) => item !== option.value)
        : [...selected, option.value];
      onChange?.(next);
    } else {
      onChange?.(option.value);
      setOpen(false);
      setKeyword('');
    }
  };

  const visibleTags = selectedOptions.slice(0, maxTagCount);
  const hiddenCount = selectedOptions.length - visibleTags.length;

  return (
    <span className={`erp-select ${disabled ? 'is-disabled' : ''} ${className}`} style={{ width }} ref={ref}>
      {multiple ? (
        <button type="button" className="erp-select__trigger" disabled={disabled} aria-label={ariaLabel || placeholder} onClick={() => setOpen((prev) => !prev)}>
          <span className="erp-select__tags">
            {visibleTags.length === 0 ? <span className="erp-select__placeholder">{placeholder}</span> : null}
            {visibleTags.map((option) => (
              <span className="erp-tag erp-tag--neutral erp-select__tag" key={option.value}>
                {option.label}
                <button
                  type="button"
                  aria-label={`移除 ${option.label}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    toggle(option);
                  }}
                >
                  ×
                </button>
              </span>
            ))}
            {hiddenCount > 0 ? <span className="erp-select__more">+{hiddenCount}</span> : null}
          </span>
          <span className="erp-select__caret">⌄</span>
        </button>
      ) : (
        <button type="button" className="erp-select__trigger" disabled={disabled} aria-label={ariaLabel || placeholder} onClick={() => setOpen((prev) => !prev)}>
          <span className={label ? 'erp-select__value' : 'erp-select__placeholder'}>{label || placeholder}</span>
          <span className="erp-select__actions">
            {clearable && label ? (
              <span
                role="button"
                tabIndex={0}
                className="erp-select__clear"
                onClick={(event) => {
                  event.stopPropagation();
                  onChange?.('');
                }}
              >
                ×
              </span>
            ) : null}
            <span className="erp-select__caret">⌄</span>
          </span>
        </button>
      )}
      {open && !disabled ? (
        <span className="erp-select__dropdown">
          {filterable ? (
            <span className="erp-select__search">
              <ErpInput value={keyword} onChange={setKeyword} placeholder="搜索" autoFocus ariaLabel="搜索选项" />
            </span>
          ) : null}
          <span className="erp-select__options">
            {filtered.length === 0 ? <span className="erp-select__empty">暂无匹配项</span> : null}
            {filtered.map((option) => {
              const active = selected.includes(option.value);
              return (
                <button
                  type="button"
                  key={option.value}
                  className={`erp-select__option ${active ? 'is-selected' : ''} ${option.disabled ? 'is-disabled' : ''}`}
                  onClick={() => toggle(option)}
                >
                  <span>{option.label}</span>
                  {active ? <span className="erp-select__check">✓</span> : null}
                </button>
              );
            })}
          </span>
        </span>
      ) : null}
    </span>
  );
}

export function ErpCascader(props: ErpSelectProps) {
  return <ErpSelect {...props} multiple filterable />;
}

export function ErpDateRange({
  value,
  onChange,
  width = 260,
}: {
  value: [string, string];
  onChange?: (value: [string, string]) => void;
  width?: number;
}) {
  return (
    <span className="erp-daterange" style={{ width }}>
      <input type="date" value={value[0]} onChange={(event) => onChange?.([event.target.value, value[1]])} aria-label="开始日期" />
      <span className="erp-daterange__sep">至</span>
      <input type="date" value={value[1]} onChange={(event) => onChange?.([value[0], event.target.value])} aria-label="结束日期" />
    </span>
  );
}

export function ErpForm({
  children,
  layout = 'horizontal',
  labelWidth = 96,
  className = '',
}: {
  children: React.ReactNode;
  layout?: 'horizontal' | 'vertical' | 'inline';
  labelWidth?: number;
  className?: string;
}) {
  return (
    <div className={`erp-form erp-form--${layout} ${className}`} style={{ ['--erp-label-width' as string]: `${labelWidth}px` }}>
      {children}
    </div>
  );
}

export function ErpFormItem({
  label,
  required,
  error,
  help,
  children,
  className = '',
}: {
  label?: React.ReactNode;
  required?: boolean;
  error?: string;
  help?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`erp-form-item ${error ? 'is-error' : ''} ${className}`}>
      {label ? (
        <span className="erp-form-item__label">
          {required ? <span className="erp-form-item__required">*</span> : null}
          {label}
        </span>
      ) : null}
      <span className="erp-form-item__control">
        {children}
        {error ? <span className="erp-form-item__error">{error}</span> : null}
        {!error && help ? <span className="erp-form-item__help">{help}</span> : null}
      </span>
    </div>
  );
}

export function ErpSection({
  title,
  extra,
  children,
  className = '',
}: {
  title: React.ReactNode;
  extra?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`erp-section ${className}`}>
      <header className="erp-section__head">
        <h3>{title}</h3>
        {extra ? <div className="erp-section__extra">{extra}</div> : null}
      </header>
      <div className="erp-section__body">{children}</div>
    </section>
  );
}

export type TagTone = 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export function ErpTag({
  tone = 'neutral',
  children,
  closable,
  onClose,
  outlined,
  className = '',
}: {
  tone?: TagTone;
  children: React.ReactNode;
  closable?: boolean;
  onClose?: () => void;
  outlined?: boolean;
  className?: string;
}) {
  return (
    <span className={`erp-tag erp-tag--${tone} ${outlined ? 'erp-tag--outlined' : ''} ${className}`}>
      {children}
      {closable ? (
        <button type="button" aria-label="移除标签" onClick={onClose}>
          ×
        </button>
      ) : null}
    </span>
  );
}

const STATUS_TONE: Record<string, TagTone> = {
  已上架: 'success',
  已认领: 'success',
  已入库: 'success',
  已出库: 'success',
  已签收: 'success',
  已妥投: 'success',
  已处理: 'success',
  已授权: 'success',
  启用: 'success',
  成功: 'success',
  优秀: 'success',
  合作中: 'success',
  已采购: 'success',
  通过: 'success',
  待发布: 'warning',
  待审核: 'warning',
  待采购: 'warning',
  待入库: 'warning',
  待出库: 'warning',
  待处理: 'warning',
  处理中: 'warning',
  采购中: 'warning',
  部分入库: 'warning',
  部分采购: 'warning',
  即将过期: 'warning',
  待优化: 'warning',
  发布失败: 'danger',
  审核未通过: 'danger',
  内容违规: 'danger',
  品牌商投诉: 'danger',
  已过期: 'danger',
  异常: 'danger',
  失败: 'danger',
  不合格: 'danger',
  未匹配: 'danger',
  已取消: 'neutral',
  已作废: 'neutral',
  已下架: 'neutral',
  已停用: 'neutral',
  停用: 'neutral',
  未认领: 'info',
  认领失败: 'danger',
  发布中: 'info',
  循环刊登: 'info',
  未定义: 'neutral',
  回收站: 'neutral',
  已发货: 'info',
  运输中: 'info',
  派送中: 'info',
  已上网: 'info',
  进行中: 'info',
  已结束: 'neutral',
  良好: 'info',
  暂停合作: 'neutral',
  已忽略: 'neutral',
  已结束2: 'neutral',
  已读: 'neutral',
  未读: 'brand',
};

export function statusTone(status: string): TagTone {
  return STATUS_TONE[status] || 'neutral';
}

export function ErpStatusTag({ status, className = '' }: { status: string; className?: string }) {
  return (
    <ErpTag tone={statusTone(status)} className={`erp-status-tag ${className}`}>
      {status}
    </ErpTag>
  );
}

export function ErpSwitch({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label || '开关'}
      className={`erp-switch ${checked ? 'is-checked' : ''}`}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
    >
      <span className="erp-switch__dot" />
    </button>
  );
}

export function ErpCheckbox({
  checked,
  indeterminate,
  onChange,
  disabled,
  children,
  className = '',
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`erp-checkbox ${checked || indeterminate ? 'is-checked' : ''} ${disabled ? 'is-disabled' : ''} ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.checked)}
      />
      <span className={`erp-checkbox__box ${indeterminate && !checked ? 'is-indeterminate' : ''}`}>{checked ? '✓' : indeterminate ? '−' : ''}</span>
      {children ? <span className="erp-checkbox__label">{children}</span> : null}
    </label>
  );
}

export function ErpRadioGroup({
  options,
  value,
  onChange,
  disabled,
}: {
  options: Option[];
  value: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <span className="erp-radio-group">
      {options.map((option) => (
        <button
          type="button"
          key={option.value}
          className={`erp-radio ${value === option.value ? 'is-checked' : ''}`}
          disabled={disabled || option.disabled}
          onClick={() => onChange?.(option.value)}
        >
          <span className="erp-radio__dot" />
          {option.label}
        </button>
      ))}
    </span>
  );
}

export function ErpTooltip({
  content,
  children,
  className = '',
}: {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={`erp-tooltip ${className}`} data-tip={typeof content === 'string' ? content : undefined}>
      {children}
      {typeof content !== 'string' ? <span className="erp-tooltip__content">{content}</span> : null}
    </span>
  );
}

export function ErpBadge({ count, dot }: { count?: number; dot?: boolean }) {
  if (dot) return <span className="erp-badge erp-badge--dot" />;
  if (!count) return null;
  return <span className="erp-badge">{count > 99 ? '99+' : count}</span>;
}

export function ErpAvatar({ name, color = '#FF7D29', size = 28 }: { name: string; color?: string; size?: number }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  return (
    <span className="erp-avatar" style={{ width: size, height: size, background: color, fontSize: size * 0.4 }}>
      {initials || 'C'}
    </span>
  );
}

export function ErpEmpty({
  text = '暂无数据',
  action,
  compact,
}: {
  text?: string;
  action?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div className={`erp-empty ${compact ? 'erp-empty--compact' : ''}`}>
      <svg width="56" height="42" viewBox="0 0 56 42" aria-hidden>
        <rect x="8" y="14" width="40" height="24" rx="3" fill="#F2F3F5" stroke="#E5E6EB" />
        <path d="M20 14V9a8 8 0 0 1 16 0v5" fill="none" stroke="#C0C5CF" strokeWidth="2" />
        <path d="M22 25h12M22 30h8" stroke="#C0C5CF" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <p>{text}</p>
      {action}
    </div>
  );
}

export function ErpUpload({
  files,
  onAdd,
  onRemove,
  accept = 'image/*',
  multiple = true,
  label = '选择文件',
  hint = '支持 jpg/png，单张不超过 5MB',
}: {
  files: string[];
  onAdd: (files: string[]) => void;
  onRemove?: (index: number) => void;
  accept?: string;
  multiple?: boolean;
  label?: string;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  return (
    <div className="erp-upload">
      <div className="erp-upload__list">
        {files.map((file, index) => (
          <span className="erp-upload__item" key={`${file}-${index}`}>
            {/^(blob:|data:|https?:|\/)/.test(file) ? <img src={file} alt="" /> : <span className="erp-upload__file">{file.slice(0, 12)}</span>}
            {onRemove ? (
              <button type="button" aria-label="移除" onClick={() => onRemove(index)}>
                ×
              </button>
            ) : null}
          </span>
        ))}
        <button type="button" className="erp-upload__add" onClick={() => inputRef.current?.click()}>
          <span>＋</span>
          <em>{label}</em>
        </button>
      </div>
      <p className="erp-upload__hint">{hint}</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        onChange={(event) => {
          const names = Array.from(event.target.files || []).map((file) => file.name);
          if (names.length) onAdd(names);
          event.target.value = '';
        }}
      />
    </div>
  );
}

export interface TreeNode {
  key: string;
  label: string;
  children?: TreeNode[];
}

function leafKeys(node: TreeNode): string[] {
  if (!node.children || node.children.length === 0) return [node.key];
  return node.children.flatMap(leafKeys);
}

export function ErpTree({
  data,
  checkable,
  checkedKeys = [],
  onCheck,
  defaultExpanded = [],
  selectedKey,
  onSelect,
}: {
  data: TreeNode[];
  checkable?: boolean;
  checkedKeys?: string[];
  onCheck?: (keys: string[]) => void;
  defaultExpanded?: string[];
  selectedKey?: string;
  onSelect?: (key: string) => void;
}) {
  const [expanded, setExpanded] = useState<string[]>(defaultExpanded);
  const [keyword, setKeyword] = useState('');

  const toggleExpanded = (key: string) => {
    setExpanded((prev) => (prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]));
  };

  const toggleCheck = (node: TreeNode, checked: boolean) => {
    const keys = leafKeys(node);
    const set = new Set(checkedKeys);
    keys.forEach((key) => (checked ? set.add(key) : set.delete(key)));
    onCheck?.(Array.from(set));
  };

  const filterNodes = (nodes: TreeNode[]): TreeNode[] => {
    if (!keyword) return nodes;
    return nodes
      .map((node) => {
        const children = node.children ? filterNodes(node.children) : undefined;
        if (node.label.includes(keyword) || (children && children.length)) {
          return { ...node, children };
        }
        return null;
      })
      .filter(Boolean) as TreeNode[];
  };

  const renderNode = (node: TreeNode, depth: number): React.ReactNode => {
    const keys = leafKeys(node);
    const checkedCount = keys.filter((key) => checkedKeys.includes(key)).length;
    const allChecked = checkedCount === keys.length;
    const indeterminate = checkedCount > 0 && !allChecked;
    const hasChildren = Boolean(node.children && node.children.length);
    const isOpen = expanded.includes(node.key) || Boolean(keyword);
    return (
      <div className="erp-tree__node" key={node.key}>
        <div
          className={`erp-tree__row ${selectedKey === node.key ? 'is-selected' : ''}`}
          style={{ paddingLeft: 8 + depth * 18 }}
        >
          {hasChildren ? (
            <button type="button" className={`erp-tree__expand ${isOpen ? 'is-open' : ''}`} onClick={() => toggleExpanded(node.key)} aria-label="展开">
              ▸
            </button>
          ) : (
            <span className="erp-tree__spacer" />
          )}
          {checkable ? (
            <ErpCheckbox
              checked={allChecked}
              indeterminate={indeterminate}
              onChange={(checked) => toggleCheck(node, checked)}
            />
          ) : null}
          <button type="button" className="erp-tree__label" onClick={() => onSelect?.(node.key)}>
            {node.label}
          </button>
        </div>
        {hasChildren && isOpen ? <div>{node.children!.map((child) => renderNode(child, depth + 1))}</div> : null}
      </div>
    );
  };

  return (
    <div className="erp-tree">
      <span className="erp-tree__search">
        <ErpInput value={keyword} onChange={setKeyword} placeholder="搜索" clearable ariaLabel="搜索树节点" />
      </span>
      <div className="erp-tree__body">{filterNodes(data).map((node) => renderNode(node, 0))}</div>
    </div>
  );
}

export function ErpSteps({
  steps,
  current = 0,
}: {
  steps: Array<{ title: string; desc?: string }>;
  current?: number;
}) {
  return (
    <div className="erp-steps">
      {steps.map((step, index) => (
        <div key={step.title} className={`erp-steps__item ${index <= current ? 'is-done' : ''} ${index === current ? 'is-current' : ''}`}>
          <span className="erp-steps__dot">{index < current ? '✓' : index + 1}</span>
          <span className="erp-steps__text">
            <b>{step.title}</b>
            {step.desc ? <em>{step.desc}</em> : null}
          </span>
          {index < steps.length - 1 ? <span className="erp-steps__line" /> : null}
        </div>
      ))}
    </div>
  );
}

export function ErpTimeline({ items }: { items: Array<{ time: string; title: string; desc?: string; active?: boolean }> }) {
  return (
    <div className="erp-timeline">
      {items.map((item, index) => (
        <div className={`erp-timeline__item ${item.active ? 'is-active' : ''}`} key={`${item.time}-${index}`}>
          <span className="erp-timeline__dot" />
          <div className="erp-timeline__content">
            <b>{item.title}</b>
            <span className="erp-timeline__time">{item.time}</span>
            {item.desc ? <p>{item.desc}</p> : null}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ErpDescriptions({
  items,
  columns = 3,
}: {
  items: Array<{ label: string; value: React.ReactNode }>;
  columns?: number;
}) {
  return (
    <div className="erp-descriptions" style={{ ['--erp-desc-cols' as string]: columns }}>
      {items.map((item) => (
        <div className="erp-descriptions__item" key={item.label}>
          <span className="erp-descriptions__label">{item.label}</span>
          <span className="erp-descriptions__value">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

export function useFilteredOptions(options: Option[], keyword: string) {
  return useMemo(() => {
    if (!keyword) return options;
    const lower = keyword.toLowerCase();
    return options.filter((option) => option.label.toLowerCase().includes(lower));
  }, [options, keyword]);
}
