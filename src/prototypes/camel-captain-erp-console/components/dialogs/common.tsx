import React, { useEffect, useState } from 'react';
import {
  ErpButton,
  ErpCheckbox,
  ErpDialog,
  ErpForm,
  ErpFormItem,
  ErpInput,
  ErpInputNumber,
  ErpRadioGroup,
  ErpSelect,
  ErpSwitch,
  ErpTag,
  ErpTextarea,
  ErpUpload,
  erpMessage,
  type Option,
} from '../ui';

export interface FormField {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'select' | 'number' | 'switch' | 'date' | 'radio' | 'password';
  options?: Option[];
  required?: boolean;
  placeholder?: string;
  help?: string;
  multiple?: boolean;
  min?: number;
  max?: number;
  precision?: number;
  suffix?: string;
  width?: number;
  span?: 1 | 2 | 3;
}

export function FormDialog({
  open,
  title,
  width = 720,
  fields,
  initial = {},
  onClose,
  onSubmit,
  extra,
  submitText = '确定',
}: {
  open: boolean;
  title: React.ReactNode;
  width?: number;
  fields: FormField[];
  initial?: Record<string, unknown>;
  onClose: () => void;
  onSubmit: (values: Record<string, unknown>) => void;
  extra?: React.ReactNode;
  submitText?: string;
}) {
  const [values, setValues] = useState<Record<string, unknown>>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setValues(initial);
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const update = (key: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const submit = () => {
    const nextErrors: Record<string, string> = {};
    fields.forEach((field) => {
      if (field.required) {
        const value = values[field.key];
        if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
          nextErrors[field.key] = `请填写${field.label}`;
        }
      }
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onSubmit(values);
  };

  const renderField = (field: FormField) => {
    const value = values[field.key];
    switch (field.type) {
      case 'textarea':
        return <ErpTextarea value={String(value || '')} onChange={(next) => update(field.key, next)} rows={3} placeholder={field.placeholder} />;
      case 'select':
        return (
          <ErpSelect
            options={field.options || []}
            value={value as string | string[]}
            onChange={(next) => update(field.key, next)}
            multiple={field.multiple}
            filterable
            clearable
            placeholder={field.placeholder || '请选择'}
            width={field.width || '100%'}
          />
        );
      case 'number':
        return (
          <ErpInputNumber
            value={Number(value ?? field.min ?? 0)}
            onChange={(next) => update(field.key, next)}
            min={field.min}
            max={field.max}
            precision={field.precision}
            suffix={field.suffix}
            width={field.width || 180}
          />
        );
      case 'switch':
        return <ErpSwitch checked={Boolean(value)} onChange={(next) => update(field.key, next)} />;
      case 'date':
        return <ErpInput type="date" value={String(value || '')} onChange={(next) => update(field.key, next)} />;
      case 'radio':
        return <ErpRadioGroup options={field.options || []} value={String(value || '')} onChange={(next) => update(field.key, next)} />;
      case 'password':
        return <ErpInput type="password" value={String(value || '')} onChange={(next) => update(field.key, next)} placeholder={field.placeholder} />;
      default:
        return <ErpInput value={String(value || '')} onChange={(next) => update(field.key, next)} placeholder={field.placeholder} />;
    }
  };

  return (
    <ErpDialog
      open={open}
      title={title}
      width={width}
      onClose={onClose}
      footer={
        <>
          <ErpButton onClick={onClose}>取消</ErpButton>
          <ErpButton variant="primary" onClick={submit}>
            {submitText}
          </ErpButton>
        </>
      }
    >
      <ErpForm layout="vertical">
        <div className="erp-form-grid">
          {fields.map((field) => (
            <ErpFormItem key={field.key} label={field.label} required={field.required} error={errors[field.key]} help={field.help}>
              {renderField(field)}
            </ErpFormItem>
          ))}
        </div>
        {extra}
      </ErpForm>
    </ErpDialog>
  );
}

export function ExportDialog({
  open,
  title = '导出数据',
  fields,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title?: string;
  fields: Array<{ key: string; label: string }>;
  onClose: () => void;
  onConfirm: (fields: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>(fields.map((field) => field.key));
  useEffect(() => {
    if (open) setSelected(fields.map((field) => field.key));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const all = selected.length === fields.length;
  return (
    <ErpDialog
      open={open}
      title={title}
      width={560}
      onClose={onClose}
      footer={
        <>
          <ErpButton onClick={onClose}>取消</ErpButton>
          <ErpButton
            variant="primary"
            onClick={() => {
              if (!selected.length) {
                erpMessage('请至少选择一个导出字段', 'warning');
                return;
              }
              onConfirm(selected);
            }}
          >
            确认导出
          </ErpButton>
        </>
      }
    >
      <div className="erp-flex-between" style={{ marginBottom: 12 }}>
        <ErpCheckbox checked={all} indeterminate={selected.length > 0 && !all} onChange={(checked) => setSelected(checked ? fields.map((field) => field.key) : [])}>
          全选
        </ErpCheckbox>
        <span className="erp-small erp-muted">已选 {selected.length}/{fields.length} 个字段</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
        {fields.map((field) => (
          <ErpCheckbox
            key={field.key}
            checked={selected.includes(field.key)}
            onChange={(checked) => setSelected((prev) => (checked ? [...prev, field.key] : prev.filter((key) => key !== field.key)))}
          >
            {field.label}
          </ErpCheckbox>
        ))}
      </div>
    </ErpDialog>
  );
}

export function ImportDialog({
  open,
  title = '导入数据',
  templateName = '导入模板.xlsx',
  onClose,
  onConfirm,
}: {
  open: boolean;
  title?: string;
  templateName?: string;
  onClose: () => void;
  onConfirm: (fileName: string) => void;
}) {
  const [files, setFiles] = useState<string[]>([]);
  return (
    <ErpDialog
      open={open}
      title={title}
      width={600}
      onClose={onClose}
      footer={
        <>
          <ErpButton onClick={onClose}>取消</ErpButton>
          <ErpButton
            variant="primary"
            onClick={() => {
              if (!files.length) {
                erpMessage('请先选择要导入的文件', 'warning');
                return;
              }
              onConfirm(files[0]);
            }}
          >
            开始导入
          </ErpButton>
        </>
      }
    >
      <div className="erp-inline-note" style={{ marginBottom: 16 }}>
        请先下载模板，按模板格式填写后再上传。导入过程只在本演示环境内模拟，不会写入线上数据。
      </div>
      <div className="erp-flex" style={{ marginBottom: 12 }}>
        <ErpButton onClick={() => erpMessage(`已生成 ${templateName}（演示）`, 'success')}>下载模板</ErpButton>
        <span className="erp-small erp-muted">支持 xlsx / csv，单文件不超过 10MB</span>
      </div>
      <ErpUpload files={files} onAdd={(next) => setFiles((prev) => [...prev, ...next])} onRemove={(index) => setFiles((prev) => prev.filter((_, i) => i !== index))} accept=".xlsx,.xls,.csv" hint="上传后会先解析预览，确认后再导入" />
    </ErpDialog>
  );
}

export function TagDialog({
  open,
  value,
  options,
  onClose,
  onConfirm,
}: {
  open: boolean;
  value: string[];
  options: Option[];
  onClose: () => void;
  onConfirm: (tags: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>(value || []);
  const [newTag, setNewTag] = useState('');
  const [extraTags, setExtraTags] = useState<Option[]>([]);
  useEffect(() => {
    if (open) {
      setSelected(value || []);
      setNewTag('');
      setExtraTags([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const allOptions = [...options, ...extraTags];
  return (
    <ErpDialog
      open={open}
      title="设置标签"
      width={560}
      onClose={onClose}
      footer={
        <>
          <ErpButton onClick={onClose}>取消</ErpButton>
          <ErpButton variant="primary" onClick={() => onConfirm(selected)}>
            保存标签
          </ErpButton>
        </>
      }
    >
      <div style={{ marginBottom: 14 }}>
        <ErpSelect options={allOptions} value={selected} onChange={(next) => setSelected(next as string[])} multiple filterable width="100%" placeholder="选择或搜索标签" />
      </div>
      <div className="erp-tag-list" style={{ marginBottom: 16 }}>
        {selected.length === 0 ? <span className="erp-small erp-muted">暂未选择标签</span> : null}
        {selected.map((tag) => {
          const option = allOptions.find((item) => item.value === tag);
          return (
            <ErpTag key={tag} tone="brand" closable onClose={() => setSelected((prev) => prev.filter((item) => item !== tag))}>
              {option?.label || tag}
            </ErpTag>
          );
        })}
      </div>
      <div className="erp-flex">
        <ErpInput value={newTag} onChange={setNewTag} placeholder="输入新标签名称" />
        <ErpButton
          onClick={() => {
            const name = newTag.trim();
            if (!name) {
              erpMessage('请输入标签名称', 'warning');
              return;
            }
            if (allOptions.some((option) => option.label === name)) {
              erpMessage('标签已存在', 'warning');
              return;
            }
            const option = { label: name, value: `custom-${Date.now()}` };
            setExtraTags((prev) => [...prev, option]);
            setSelected((prev) => [...prev, option.value]);
            setNewTag('');
          }}
        >
          新建标签
        </ErpButton>
      </div>
    </ErpDialog>
  );
}

export function ColumnSettingsDialog({
  open,
  columns,
  hidden,
  onClose,
  onApply,
}: {
  open: boolean;
  columns: Array<{ key: string; title: string }>;
  hidden: string[];
  onClose: () => void;
  onApply: (hidden: string[]) => void;
}) {
  const [nextHidden, setNextHidden] = useState<string[]>(hidden);
  useEffect(() => {
    if (open) setNextHidden(hidden);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  return (
    <ErpDialog
      open={open}
      title="列设置"
      width={480}
      onClose={onClose}
      footer={
        <>
          <ErpButton onClick={onClose}>取消</ErpButton>
          <ErpButton variant="primary" onClick={() => onApply(nextHidden)}>
            应用
          </ErpButton>
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
        {columns.map((column) => (
          <ErpCheckbox
            key={column.key}
            checked={!nextHidden.includes(column.key)}
            onChange={(checked) => setNextHidden((prev) => (checked ? prev.filter((key) => key !== column.key) : [...prev, column.key]))}
          >
            {column.title}
          </ErpCheckbox>
        ))}
      </div>
    </ErpDialog>
  );
}
