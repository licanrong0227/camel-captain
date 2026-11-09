/**
 * SKU 表格批量修改弹窗：按规格值筛选目标 SKU，再按运算方式批量修改指定列。
 */

import React, { useEffect, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import '../sku-batch.css';

export type SkuBatchField =
  | 'skuCode'
  | 'saleStatus'
  | 'inventory'
  | 'packageWeight'
  | 'retailPrice'
  | 'purchasePrice';

export type SkuRow = {
  row: number;
  color: string;
  img: string;
  option: string;
  skuCode: string;
  saleStatus: number;
  inventory: string;
  packageWeight: string;
  retailPrice: string;
  purchasePrice: string;
};

export type SkuSpec = {
  key: 'color' | 'option';
  name: string;
  values: string[];
  tags?: { id: string; name: string; values: string[] }[];
};

type NumberField = 'inventory' | 'packageWeight' | 'retailPrice' | 'purchasePrice';

type Group = {
  key: 'color' | 'option';
  name: string;
  values: { name: string; checked: boolean }[];
};

const TITLES: Record<SkuBatchField, string> = {
  skuCode: '批量修改SKU编码',
  saleStatus: '批量修改是否可售',
  inventory: '批量修改库存',
  packageWeight: '批量修改重量',
  retailPrice: '批量修改实际收入',
  purchasePrice: '批量修改采集价/采购价',
};

const SKU_OPS = [
  { value: 'auto', label: '自动生成' },
  { value: 'prefix', label: '加前缀' },
  { value: 'suffix', label: '加后缀' },
];

const NUMBER_OPS = [
  { value: 'set', label: '替换' },
  { value: 'add', label: '加' },
  { value: 'sub', label: '减' },
  { value: 'mul', label: '乘' },
  { value: 'div', label: '除' },
  { value: 'clear', label: '清空' },
];

const PRICE_TEMPLATES = [
  { id: 'tpl-33', name: '测试模版33', multiplier: 1.33 },
  { id: 'tpl-3', name: '测试模版3', multiplier: 1.3 },
  { id: 'tpl-2', name: '测试模版2', multiplier: 1.2 },
];

const CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function createCode(used: Set<string>) {
  let code = '';
  do {
    code = '';
    for (let i = 0; i < 14; i += 1) {
      code += CODE_CHARS.charAt(Math.floor(Math.random() * CODE_CHARS.length));
    }
  } while (used.has(code));
  used.add(code);
  return code;
}

function DialogSelect({
  value,
  placeholder,
  options,
  onChange,
}: {
  value: string | null;
  placeholder: string;
  options: { value: string; label: string }[];
  onChange: (next: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = options.find((option) => option.value === value);

  return (
    <span className="sbe-select-wrap">
      <button
        type="button"
        className={`sbe-select ${current ? '' : 'is-placeholder'}`.trim()}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="sbe-select__value">{current?.label || placeholder}</span>
        <ChevronDown size={12} className={open ? 'sbe-select__caret is-open' : 'sbe-select__caret'} />
      </button>
      {open && (
        <>
          <span className="sbe-catcher" onClick={() => setOpen(false)} />
          <span className="sbe-menu" role="listbox">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={option.value === value}
                className={option.value === value ? 'sbe-menu__option is-active' : 'sbe-menu__option'}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                {option.label}
              </button>
            ))}
          </span>
        </>
      )}
    </span>
  );
}

export default function SkuBatchEditDialog({
  field,
  rows,
  specs,
  onClose,
  onApply,
  onToast,
}: {
  field: SkuBatchField;
  rows: SkuRow[];
  specs: SkuSpec[];
  onClose: () => void;
  onApply: (next: SkuRow[]) => void;
  onToast: (message: string) => void;
}) {
  const [op, setOp] = useState(field === 'skuCode' ? 'auto' : 'set');
  const [value, setValue] = useState('');
  const [saleStatus, setSaleStatus] = useState(1);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [groups, setGroups] = useState<Group[]>(() =>
    specs.map((spec) => ({
      key: spec.key,
      name: spec.name,
      values: spec.values.map((name) => ({ name, checked: true })),
    })),
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const ops = field === 'skuCode' ? SKU_OPS : NUMBER_OPS;
  const showPriceTemplate = field === 'retailPrice';
  const templateUrl = op === 'priceTemplate';
  const actionTitle =
    field === 'saleStatus' || field === 'skuCode'
      ? '请选择'
      : templateUrl
        ? '请选择价格模板'
        : '请输入数值';

  const toggleGroup = (index: number) => {
    setGroups((list) =>
      list.map((group, groupIndex) => {
        if (groupIndex !== index) return group;
        const allChecked = group.values.every((item) => item.checked);
        return { ...group, values: group.values.map((item) => ({ ...item, checked: !allChecked })) };
      }),
    );
  };

  const toggleValue = (groupIndex: number, valueIndex: number) => {
    setGroups((list) =>
      list.map((group, index) =>
        index === groupIndex
          ? {
              ...group,
              values: group.values.map((item, itemIndex) =>
                itemIndex === valueIndex ? { ...item, checked: !item.checked } : item,
              ),
            }
          : group,
      ),
    );
  };

  const isTagActive = (group: Group, tag: { values: string[] }) => {
    const checked = group.values.filter((item) => item.checked).map((item) => item.name);
    return checked.length === tag.values.length && checked.every((name) => tag.values.includes(name));
  };

  const applyTag = (groupIndex: number, tag: { values: string[] }) => {
    setGroups((list) =>
      list.map((group, index) => {
        if (index !== groupIndex) return group;
        const active = isTagActive(group, tag);
        return {
          ...group,
          values: group.values.map((item) => ({
            ...item,
            checked: active ? true : tag.values.includes(item.name),
          })),
        };
      }),
    );
  };

  const finish = (next: SkuRow[], count: number) => {
    onApply(next);
    onClose();
    if (count > 0) onToast(`已修改 ${count} 个SKU`);
  };

  const handleConfirm = () => {
    const picked = groups.map((group) => ({
      key: group.key,
      selected: group.values.filter((item) => item.checked).map((item) => item.name),
    }));
    if (picked.some((group) => group.selected.length === 0)) {
      onToast('请至少选择一个规格值');
      return;
    }

    const matched = rows.filter((row) => picked.every((group) => group.selected.includes(String(row[group.key]))));
    const targetRows = new Set(matched.map((row) => row.row));

    if (field === 'skuCode') {
      const text = value.trim();
      if ((op === 'prefix' || op === 'suffix') && !text) {
        onToast(op === 'prefix' ? '请输入前缀' : '请输入后缀');
        return;
      }
      if (op === 'auto') {
        const used = new Set(rows.map((row) => row.skuCode));
        const next = rows.map((row) => {
          if (!targetRows.has(row.row)) return row;
          return { ...row, skuCode: createCode(used) };
        });
        finish(next, matched.length);
        return;
      }
      const next = rows.map((row) => {
        if (!targetRows.has(row.row)) return row;
        return {
          ...row,
          skuCode: op === 'prefix' ? text + row.skuCode : row.skuCode + text,
        };
      });
      finish(next, matched.length);
      return;
    }

    if (field === 'saleStatus') {
      const next = rows.map((row) => (targetRows.has(row.row) ? { ...row, saleStatus } : row));
      finish(next, matched.length);
      return;
    }

    if (field === 'retailPrice' && templateUrl) {
      if (!templateId) {
        onToast('请选择价格模板');
        return;
      }
      const template = PRICE_TEMPLATES.find((item) => item.id === templateId);
      if (!template) return;
      let edited = 0;
      let failed = 0;
      const next = rows.map((row) => {
        if (!targetRows.has(row.row)) return row;
        const base = Number(row.purchasePrice);
        if (!Number.isFinite(base) || base <= 0) {
          failed += 1;
          return row;
        }
        edited += 1;
        return { ...row, retailPrice: (base * template.multiplier).toFixed(2) };
      });
      onApply(next);
      onClose();
      if (edited > 0) {
        onToast(failed > 0 ? `已修改 ${edited} 个SKU，${failed} 个失败` : `已修改 ${edited} 个SKU`);
      } else {
        onToast('未计算出有效价格，请检查采集价/采购价与价格模板');
      }
      return;
    }

    const numericField = field as NumberField;

    if (op === 'clear') {
      const next = rows.map((row) => {
        if (!targetRows.has(row.row)) return row;
        const updated: SkuRow = { ...row };
        updated[numericField] = '';
        return updated;
      });
      finish(next, matched.length);
      return;
    }

    const raw = value.trim();
    const pattern = numericField === 'inventory' ? /^\d+$/ : /^\d+(\.\d{1,3})?$/;
    if (!pattern.test(raw)) {
      onToast(numericField === 'inventory' ? '请输入有效的整数' : '请输入有效的数值');
      return;
    }
    if (op === 'div' && Number(raw) === 0) {
      onToast('除数不能为0');
      return;
    }
    const amount = Number(raw);
    const next = rows.map((row) => {
      if (!targetRows.has(row.row)) return row;
      const current = Number(row[numericField]);
      const base = Number.isFinite(current) ? current : 0;
      let result = amount;
      if (op === 'add') result = base + amount;
      if (op === 'sub') result = base - amount;
      if (op === 'mul') result = base * amount;
      if (op === 'div') result = base / amount;
      result = Math.max(0, result);
      const text =
        numericField === 'inventory'
          ? String(Math.round(result))
          : numericField === 'packageWeight'
            ? result.toFixed(3)
            : result.toFixed(2);
      const updated: SkuRow = { ...row };
      updated[numericField] = text;
      return updated;
    });
    finish(next, matched.length);
  };

  return (
    <div className="sbe-mask">
      <div className="sbe-dialog" role="dialog" aria-modal="true" aria-label={TITLES[field]}>
        <header className="sbe-head">
          <h3 className="sbe-title">{TITLES[field]}</h3>
          <button type="button" className="sbe-close" aria-label="关闭" onClick={onClose}>
            <X size={16} />
          </button>
        </header>

        <div className="sbe-body">
          <div className="sbe-group">
            <div className="sbe-group__head">
              <span className="sbe-group__title">{actionTitle}</span>
            </div>
            <div className="sbe-group__body sbe-group__body--action">
              {field === 'saleStatus' ? (
                <DialogSelect
                  value={String(saleStatus)}
                  placeholder="请选择"
                  options={[
                    { value: '1', label: '可销售' },
                    { value: '0', label: '不可销售' },
                  ]}
                  onChange={(next) => setSaleStatus(Number(next))}
                />
              ) : (
                <>
                  <div className="sbe-radio-row">
                    {ops.map((item) => (
                      <label key={item.value} className="ep-radio">
                        <input
                          type="radio"
                          name={`sbe-op-${field}`}
                          checked={op === item.value}
                          onChange={() => setOp(item.value)}
                        />
                        <span className="ep-radio__dot" />
                        <span className="ep-radio__label">{item.label}</span>
                      </label>
                    ))}
                    {showPriceTemplate && (
                      <label className="ep-radio">
                        <input
                          type="radio"
                          name={`sbe-op-${field}`}
                          checked={op === 'priceTemplate'}
                          onChange={() => setOp('priceTemplate')}
                        />
                        <span className="ep-radio__dot" />
                        <span className="ep-radio__label">价格模板</span>
                      </label>
                    )}
                  </div>
                  {templateUrl ? (
                    <DialogSelect
                      value={templateId}
                      placeholder="请选择价格模板"
                      options={PRICE_TEMPLATES.map((item) => ({ value: item.id, label: item.name }))}
                      onChange={setTemplateId}
                    />
                  ) : op === 'clear' || (field === 'skuCode' && op === 'auto') ? null : (
                    <input
                      className="sbe-input"
                      value={value}
                      maxLength={field === 'skuCode' ? 50 : undefined}
                      placeholder={
                        field === 'skuCode'
                          ? op === 'prefix'
                            ? '请输入前缀'
                            : '请输入后缀'
                          : field === 'inventory'
                            ? '请输入数量'
                            : '请输入数值'
                      }
                      onChange={(event) => setValue(event.target.value)}
                    />
                  )}
                </>
              )}
            </div>
          </div>

          {groups.map((group, groupIndex) => {
            const allChecked = group.values.length > 0 && group.values.every((item) => item.checked);
            const someChecked = group.values.some((item) => item.checked) && !allChecked;
            return (
              <div className="sbe-group" key={group.key}>
                <div className="sbe-group__head">
                  <label className="sbe-check">
                    <input type="checkbox" checked={allChecked} onChange={() => toggleGroup(groupIndex)} />
                    <span
                      className={`sbe-check__box ${someChecked ? 'is-indeterminate' : ''}`.trim()}
                      aria-hidden="true"
                    />
                    <span className="sbe-check__label">{group.name}</span>
                  </label>
                </div>
                <div className="sbe-group__body">
                  {(specs[groupIndex].tags ?? []).length > 0 && (
                    <div className="sbe-tags">
                      <span className="sbe-tags__label">标签</span>
                      {(specs[groupIndex].tags ?? []).map((tag) => (
                        <button
                          type="button"
                          key={tag.id}
                          className={isTagActive(group, tag) ? 'sbe-tag is-active' : 'sbe-tag'}
                          title="只勾选该标签下的规格值"
                          onClick={() => applyTag(groupIndex, tag)}
                        >
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  )}
                  {group.values.map((item, valueIndex) => (
                    <label className="sbe-check sbe-check--value" key={`${group.key}-${item.name}`}>
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => toggleValue(groupIndex, valueIndex)}
                      />
                      <span className="sbe-check__box" aria-hidden="true" />
                      <span className="sbe-check__label">{item.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <footer className="sbe-foot">
          <button type="button" className="sbe-btn" onClick={onClose}>
            取消
          </button>
          <button type="button" className="sbe-btn sbe-btn--primary" onClick={handleConfirm}>
            确认修改
          </button>
        </footer>
      </div>
    </div>
  );
}
