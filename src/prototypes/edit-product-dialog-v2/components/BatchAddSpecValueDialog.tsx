/**
 * 批量添加规格值弹窗：参照线上系统还原，支持规格值模板、模板创建/管理。
 */

import React, { useEffect, useRef, useState } from 'react';
import { GripVertical, Trash2 } from 'lucide-react';
import './batch-add-spec-value.css';

const PLACEHOLDER_FULL = '请输入规格值，每行一个\n如：\nXXS\nXS\nS';
const PLACEHOLDER_PLAIN = '请输入规格值，每行一个';

const SIZE_TEMPLATE_VALUE = [
  'EUR34=US3=UK2=22.0CM',
  'EUR35=US4=UK2.5=22.5CM',
  'EUR36=US4.5=UK3=23.0CM',
  'EUR37=US5=UK3.5=23.5CM',
  'EUR38=US5.5=UK4=24.0CM',
  'EUR39=US6=UK4.5=24.5CM',
].join('\n');

const COLOR_TEMPLATE_VALUE = ['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow'].join('\n');

const REGULAR_SIZE_TEMPLATE_VALUE = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'].join('\n');

export type TemplateType = 'public' | 'private';

export interface SpecTemplate {
  id: number;
  name: string;
  type: TemplateType;
  value: string;
}

const TEMPLATE_TYPE_LABEL: Record<TemplateType, string> = {
  public: '公共',
  private: '专属',
};

export const INITIAL_SPEC_TEMPLATES: SpecTemplate[] = [
  { id: 1, name: '尺码模板', type: 'public', value: SIZE_TEMPLATE_VALUE },
  { id: 2, name: '颜色模板', type: 'public', value: COLOR_TEMPLATE_VALUE },
  { id: 3, name: '常规尺寸模板', type: 'public', value: REGULAR_SIZE_TEMPLATE_VALUE },
];

function IconClose({ size = 10 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

function IconCaret({ up = false }: { up?: boolean }) {
  return (
    <svg
      width="10"
      height="6"
      viewBox="0 0 10 6"
      fill="none"
      aria-hidden="true"
      className={`svt-caret${up ? ' is-up' : ''}`}
    >
      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export type BatchSpecValue = { name: string; image?: string };
type SubmitResult = { values: BatchSpecValue[] };

function SubDialog({
  title,
  size,
  onClose,
  children,
}: {
  title: string;
  size: 'form' | 'manage' | 'confirm';
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className={`svt-overlay svt-overlay--${size}`} onClick={onClose}>
      <section
        className={`svt-subdialog svt-subdialog--${size}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="svt-subdialog__header">
          <h3 className="svt-subdialog__title">{title}</h3>
          <button type="button" className="svt-subdialog__close" aria-label="关闭" onClick={onClose}>
            <IconClose size={14} />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}

function TemplateFormDialog({
  mode,
  template,
  onClose,
  onSubmit,
}: {
  mode: 'create' | 'edit';
  template?: SpecTemplate;
  onClose: () => void;
  onSubmit: (name: string, type: TemplateType) => void;
}) {
  const [name, setName] = useState(template?.name ?? '');
  const [type, setType] = useState<TemplateType>(template?.type ?? 'public');
  const [typeOpen, setTypeOpen] = useState(false);
  const [error, setError] = useState('');

  const submit = () => {
    if (!name.trim()) {
      setError('请输入模板名称');
      return;
    }
    onSubmit(name.trim(), type);
  };

  return (
    <SubDialog title={mode === 'create' ? '创建模板' : '编辑模板'} size="form" onClose={onClose}>
      <div className="svt-form-row">
        <label className="svt-form-row__label">
          <span className="svt-form-row__required">*</span>模板名称
        </label>
        <input
          className={error ? 'svt-input is-error' : 'svt-input'}
          type="text"
          placeholder="请输入模板名称"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            if (event.target.value.trim()) setError('');
          }}
        />
      </div>
      {error && <p className="svt-form-error">{error}</p>}
      <div className="svt-form-row">
        <span className="svt-form-row__label">模板类型</span>
        <div className="svt-type-select">
          <button
            type="button"
            className={typeOpen ? 'svt-select__trigger svt-select__trigger--form is-open' : 'svt-select__trigger svt-select__trigger--form'}
            onClick={() => setTypeOpen((prev) => !prev)}
          >
            <span>{TEMPLATE_TYPE_LABEL[type]}</span>
            <IconCaret up={typeOpen} />
          </button>
          {typeOpen && (
            <>
              <div className="svt-menu-catcher" onClick={() => setTypeOpen(false)} />
              <div className="svt-select__menu svt-select__menu--form" role="listbox" aria-label="模板类型">
                {(Object.keys(TEMPLATE_TYPE_LABEL) as TemplateType[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    role="option"
                    aria-selected={option === type}
                    className={option === type ? 'svt-select__option is-active' : 'svt-select__option'}
                    onClick={() => {
                      setType(option);
                      setTypeOpen(false);
                    }}
                  >
                    {TEMPLATE_TYPE_LABEL[option]}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <div className="svt-form-hint">
        <p>① 公共：所有子账号可见</p>
        <p>② 专属：仅当前子账号可见</p>
      </div>
      <div className="svt-subdialog__footer">
        <button type="button" className="svt-btn svt-btn--default svt-btn--sm" onClick={onClose}>
          取消
        </button>
        <button type="button" className="svt-btn svt-btn--primary svt-btn--sm" onClick={submit}>
          确定
        </button>
      </div>
    </SubDialog>
  );
}

function ManageTemplateDialog({
  templates,
  onClose,
  onEdit,
  onDelete,
}: {
  templates: SpecTemplate[];
  onClose: () => void;
  onEdit: (template: SpecTemplate) => void;
  onDelete: (template: SpecTemplate) => void;
}) {
  return (
    <SubDialog title="管理模板" size="manage" onClose={onClose}>
      <table className="svt-tpl-table">
        <thead>
          <tr>
            <th>模板名称</th>
            <th>模板类型</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {templates.length === 0 ? (
            <tr>
              <td colSpan={3} className="svt-tpl-table__empty">
                暂无模板，请先创建
              </td>
            </tr>
          ) : (
            templates.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{TEMPLATE_TYPE_LABEL[item.type]}</td>
                <td>
                  <div className="svt-tpl-actions">
                    <button type="button" className="svt-tpl-op" onClick={() => onEdit(item)}>
                      编辑
                    </button>
                    <button type="button" className="svt-tpl-op" onClick={() => onDelete(item)}>
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="svt-subdialog__footer">
        <button type="button" className="svt-btn svt-btn--default svt-btn--sm" onClick={onClose}>
          关闭
        </button>
      </div>
    </SubDialog>
  );
}

function ConfirmDeleteDialog({
  template,
  onCancel,
  onConfirm,
}: {
  template: SpecTemplate;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <SubDialog title="提示" size="confirm" onClose={onCancel}>
      <div className="svt-confirm">
        <span className="svt-confirm__icon" aria-hidden="true">
          !
        </span>
        <p className="svt-confirm__text">确定要删除模板{template.name}吗？</p>
      </div>
      <div className="svt-subdialog__footer">
        <button type="button" className="svt-btn svt-btn--default svt-btn--sm" onClick={onCancel}>
          取消
        </button>
        <button type="button" className="svt-btn svt-btn--primary svt-btn--sm" onClick={onConfirm}>
          确定
        </button>
      </div>
    </SubDialog>
  );
}

interface SpecDialogProps {
  variant: 'with-nav' | 'plain';
  templates: SpecTemplate[];
  onTemplatesChange: (templates: SpecTemplate[]) => void;
  onClose: () => void;
  onConfirm: (result: SubmitResult) => void;
}

function SpecDialog({ variant, templates, onTemplatesChange, onClose, onConfirm }: SpecDialogProps) {
  const withNav = variant === 'with-nav';
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [appliedId, setAppliedId] = useState<number | null>(null);
  const [tplMenuOpen, setTplMenuOpen] = useState(false);
  const [formDialog, setFormDialog] = useState<{ mode: 'create' | 'edit'; template?: SpecTemplate } | null>(null);
  const [manageOpen, setManageOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SpecTemplate | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [tab, setTab] = useState<'value' | 'image'>(withNav ? 'value' : 'value');
  const [imageItems, setImageItems] = useState<{ id: number; name: string; url: string }[]>([]);
  const [dragIndex, setDragIndex] = useState(-1);
  const fileRef = useRef<HTMLInputElement>(null);
  const urlsRef = useRef<string[]>([]);
  const toastTimer = useRef<number>();

  const appliedTemplate = templates.find((item) => item.id === appliedId) ?? null;

  const showToast = (message: string) => {
    window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(null), 2000);
  };

  useEffect(
    () => () => {
      window.clearTimeout(toastTimer.current);
      urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    },
    [],
  );

  useEffect(() => {
    if (withNav) {
      textareaRef.current?.focus();
    }
  }, [withNav]);

  const applyTemplate = (template: SpecTemplate) => {
    setValue(template.value);
    setAppliedId(template.id);
    setTplMenuOpen(false);
    setError('');
  };

  const saveToTemplate = () => {
    if (!appliedTemplate) return;
    onTemplatesChange(
      templates.map((item) => (item.id === appliedTemplate.id ? { ...item, value } : item)),
    );
    showToast(`已保存到模板「${appliedTemplate.name}」`);
  };

  const submitTemplateForm = (name: string, type: TemplateType) => {
    if (!formDialog) return;
    if (formDialog.mode === 'create') {
      const nextId = templates.reduce((max, item) => Math.max(max, item.id), 0) + 1;
      onTemplatesChange([...templates, { id: nextId, name, type, value }]);
      setAppliedId(nextId);
      showToast('创建成功');
    } else if (formDialog.template) {
      const targetId = formDialog.template.id;
      onTemplatesChange(
        templates.map((item) => (item.id === targetId ? { ...item, name, type } : item)),
      );
      showToast('保存成功');
    }
    setFormDialog(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    onTemplatesChange(templates.filter((item) => item.id !== deleteTarget.id));
    if (appliedId === deleteTarget.id) setAppliedId(null);
    setDeleteTarget(null);
    showToast('删除成功');
  };

  const values = value
    .split(/\r?\n/u)
    .map((item) => item.trim())
    .filter(Boolean);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const stamp = Date.now();
    const next = Array.from(files).map((file, index) => {
      const url = URL.createObjectURL(file);
      urlsRef.current.push(url);
      return {
        id: stamp + index,
        name: file.name.replace(/.[a-zA-Z0-9]+$/u, '').slice(0, 40) || `规格值${imageItems.length + index + 1}`,
        url,
      };
    });
    setImageItems((list) => [...list, ...next]);
    setError('');
  };

  const moveImage = (from: number, to: number) => {
    setImageItems((list) => {
      if (from === to || from < 0 || to < 0) return list;
      const next = [...list];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  const confirm = () => {
    if (tab === 'image') {
      if (imageItems.length === 0) {
        setError('请先批量上传图片');
        return;
      }
      if (imageItems.some((item) => /[一-龥]/.test(item.name))) {
        setError('规格值不能包含中文字符');
        return;
      }
      const confirmedUrls = new Set(imageItems.map((item) => item.url));
      urlsRef.current = urlsRef.current.filter((url) => !confirmedUrls.has(url));
      onConfirm({ values: imageItems.map((item) => ({ name: item.name.trim(), image: item.url })) });
      return;
    }
    if (values.length === 0) {
      setError('请输入规格值');
      textareaRef.current?.focus();
      return;
    }
    if (values.some((item) => /[一-龥]/.test(item))) {
      setError('规格值不能包含中文字符');
      return;
    }
    onConfirm({ values: values.map((name) => ({ name })) });
  };

  return (
    <>
      <section
        className={`svt-dialog${withNav ? ' svt-dialog--with-nav' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="批量添加规格值"
      >
        <header className="svt-dialog__header">
          <h2 className="svt-dialog__title">批量添加规格值</h2>
          <button type="button" className="svt-dialog__close" aria-label="关闭" onClick={onClose}>
            <IconClose />
          </button>
        </header>
        <div className="svt-dialog__main">
          {withNav && (
            <nav className="svt-tabs" aria-label="添加方式">
              <button
                type="button"
                className={tab === 'value' ? 'svt-tab is-active' : 'svt-tab'}
                aria-current={tab === 'value' ? 'true' : undefined}
                onClick={() => {
                  setTab('value');
                  setError('');
                }}
              >
                规格值添加
              </button>
              <button
                type="button"
                className={tab === 'image' ? 'svt-tab is-active' : 'svt-tab'}
                aria-current={tab === 'image' ? 'true' : undefined}
                onClick={() => {
                  setTab('image');
                  setError('');
                }}
              >
                图片添加
              </button>
            </nav>
          )}
          <div className="svt-pane">
            {tab === 'image' ? (
              <div className="svt-img-pane">
                <div className="svt-img-toolbar">
                  <span className="svt-img-tip">拖动图片左侧图标调整排序</span>
                  <button
                    type="button"
                    className="svt-btn svt-btn--primary svt-btn--sm"
                    onClick={() => fileRef.current?.click()}
                  >
                    批量上传
                  </button>
                </div>
                {imageItems.length > 0 ? (
                  <div className="svt-img-grid">
                    {imageItems.map((item, index) => (
                      <div
                        key={item.id}
                        className={dragIndex === index ? 'svt-img-card is-dragging' : 'svt-img-card'}
                        draggable
                        onDragStart={() => setDragIndex(index)}
                        onDragEnd={() => setDragIndex(-1)}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={() => {
                          moveImage(dragIndex, index);
                          setDragIndex(-1);
                        }}
                      >
                        <div className="svt-img-card__head">
                          <GripVertical size={12} className="svt-img-drag" />
                          <span className="svt-img-title" title={item.name}>
                            {index + 1} {item.name || '未命名'}
                          </span>
                          <button
                            type="button"
                            className="svt-img-del"
                            aria-label={`删除 ${item.name || '未命名'}`}
                            onClick={() => {
                              setImageItems((list) => list.filter((row) => row.id !== item.id));
                              URL.revokeObjectURL(item.url);
                              urlsRef.current = urlsRef.current.filter((url) => url !== item.url);
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                        <div className="svt-img-slot">
                          <img src={item.url} alt={item.name} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="svt-img-empty">请点击批量上传，将按文件名生成规格值</div>
                )}
                {error && <p className="svt-error">{error}</p>}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={(event) => {
                    handleFiles(event.target.files);
                    event.target.value = '';
                  }}
                />
              </div>
            ) : (
            <>
            <div className="svt-tpl-bar">
              <span className="svt-tpl-bar__label">规格值模板</span>
              <div className="svt-tpl-select">
                <button
                  type="button"
                  className={tplMenuOpen ? 'svt-select__trigger is-open' : 'svt-select__trigger'}
                  onClick={() => setTplMenuOpen((prev) => !prev)}
                >
                  <span className={appliedTemplate ? 'svt-tpl-select__value' : 'svt-tpl-select__value is-placeholder'}>
                    {appliedTemplate ? appliedTemplate.name : '选择已有模板快速替换'}
                  </span>
                  <IconCaret up={tplMenuOpen} />
                </button>
                {tplMenuOpen && (
                  <>
                    <div className="svt-menu-catcher" onClick={() => setTplMenuOpen(false)} />
                    <div className="svt-select__menu" role="listbox" aria-label="规格值模板">
                      {templates.length === 0 ? (
                        <p className="svt-select__empty">暂无模板</p>
                      ) : (
                        templates.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            role="option"
                            aria-selected={item.id === appliedId}
                            className={item.id === appliedId ? 'svt-select__option is-active' : 'svt-select__option'}
                            onClick={() => applyTemplate(item)}
                          >
                            {item.name}
                          </button>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
              <button
                type="button"
                className="svt-btn svt-btn--primary svt-btn--sm"
                onClick={() => setFormDialog({ mode: 'create' })}
              >
                创建模板
              </button>
              <button
                type="button"
                className="svt-btn svt-btn--default svt-btn--sm"
                onClick={() => setManageOpen(true)}
              >
                管理模板
              </button>
              {appliedTemplate && (
                <button
                  type="button"
                  className="svt-btn svt-btn--default svt-btn--sm"
                  onClick={saveToTemplate}
                >
                  保存模板
                </button>
              )}
            </div>
            <textarea
              ref={textareaRef}
              className="svt-textarea"
              value={value}
              placeholder={withNav ? PLACEHOLDER_FULL : PLACEHOLDER_PLAIN}
              spellCheck={false}
              onChange={(event) => {
                setValue(event.target.value);
                if (error) setError('');
              }}
              onKeyDown={(event) => {
                if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                  event.preventDefault();
                  const el = event.currentTarget;
                  const start = el.selectionStart ?? value.length;
                  const end = el.selectionEnd ?? value.length;
                  el.setRangeText('\n', start, end, 'end');
                  setValue(el.value);
                  if (error) setError('');
                }
              }}
            />
            {error ? (
              <p className="svt-error">{error}</p>
            ) : (
              withNav && <p className="svt-hint">CTRL+回车 可换行</p>
            )}
            </>
            )}
          </div>
        </div>
        <footer className="svt-dialog__footer">
          <button type="button" className="svt-btn svt-btn--default" onClick={onClose}>
            取消
          </button>
          <button type="button" className="svt-btn svt-btn--primary" onClick={confirm}>
            确认
          </button>
        </footer>
      </section>
      {formDialog && (
        <TemplateFormDialog
          mode={formDialog.mode}
          template={formDialog.template}
          onClose={() => setFormDialog(null)}
          onSubmit={submitTemplateForm}
        />
      )}
      {manageOpen && (
        <ManageTemplateDialog
          templates={templates}
          onClose={() => setManageOpen(false)}
          onEdit={(template) => setFormDialog({ mode: 'edit', template })}
          onDelete={(template) => setDeleteTarget(template)}
        />
      )}
      {deleteTarget && (
        <ConfirmDeleteDialog
          template={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
      {toast && (
        <div className="svt-toast" role="status">
          {toast}
        </div>
      )}
    </>
  );
}

export default function BatchAddSpecValueDialog({
  templates,
  onTemplatesChange,
  onClose,
  onConfirm,
}: {
  templates: SpecTemplate[];
  onTemplatesChange: (next: SpecTemplate[]) => void;
  onClose: () => void;
  onConfirm: (values: BatchSpecValue[]) => void;
}) {
  return (
    <div className="svt-mask">
      <SpecDialog
        variant="with-nav"
        templates={templates}
        onTemplatesChange={onTemplatesChange}
        onClose={onClose}
        onConfirm={(result) => onConfirm(result.values)}
      />
    </div>
  );
}
