/**
 * @name 规格值模板
 */

import React, { useEffect, useRef, useState } from 'react';
import { defineHashPageRoute, useHashPage } from '../../common/useHashPage';
import './style.css';

const ROUTE = defineHashPageRoute(
  [
    { id: 'with-nav', title: '批量编辑-批量添加规格值' },
    { id: 'plain', title: '编辑产品-批量添加规格值' },
  ],
  { defaultPageId: 'with-nav' },
);

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

const COLOR_TEMPLATE_VALUE = ['红色', '蓝色', '绿色', '黑色', '白色', '黄色'].join('\n');

const REGULAR_SIZE_TEMPLATE_VALUE = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'].join('\n');

type TemplateType = 'public' | 'private';

interface SpecTemplate {
  id: number;
  name: string;
  type: TemplateType;
  value: string;
}

const TEMPLATE_TYPE_LABEL: Record<TemplateType, string> = {
  public: '公共',
  private: '专属',
};

const INITIAL_TEMPLATES: SpecTemplate[] = [
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

type SubmitResult = { count: number; items: string[] };

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

  const confirm = () => {
    if (values.length === 0) {
      setError('请输入规格值');
      textareaRef.current?.focus();
      return;
    }
    onConfirm({ count: values.length, items: values });
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
              <span className="svt-tab is-active" aria-current="true">
                规格值添加
              </span>
              <span className="svt-tab">图片添加</span>
            </nav>
          )}
          <div className="svt-pane">
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

function ClosedState({
  result,
  page,
  onReopen,
  onSwitch,
}: {
  result: SubmitResult | null;
  page: string;
  onReopen: () => void;
  onSwitch: (page: string) => void;
}) {
  return (
    <div className="svt-closed">
      <div className="svt-closed__card">
        <h1 className="svt-closed__title">批量添加规格值</h1>
        <p className="svt-closed__desc">
          {result
            ? `已添加 ${result.count} 个规格值：${result.items.join('、')}`
            : '弹窗已关闭'}
        </p>
        <button type="button" className="svt-btn svt-btn--primary" onClick={onReopen}>
          {result ? '重新打开弹窗' : '打开弹窗'}
        </button>
        <div className="svt-switch">
          <button
            type="button"
            className={page === 'with-nav' ? 'is-active' : ''}
            onClick={() => onSwitch('with-nav')}
          >
            批量编辑-批量添加规格值
          </button>
          <button
            type="button"
            className={page === 'plain' ? 'is-active' : ''}
            onClick={() => onSwitch('plain')}
          >
            编辑产品-批量添加规格值
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SpecValueTemplate() {
  const { page, setPage } = useHashPage(ROUTE);
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [templates, setTemplates] = useState<SpecTemplate[]>(INITIAL_TEMPLATES);

  useEffect(() => {
    setOpen(false);
    setResult(null);
  }, [page]);

  const variant = page === 'plain' ? 'plain' : 'with-nav';

  return (
    <div className="svt-page">
      {open ? (
        <div className="svt-mask">
          <SpecDialog
            key={variant}
            variant={variant}
            templates={templates}
            onTemplatesChange={setTemplates}
            onClose={() => setOpen(false)}
            onConfirm={(next) => {
              setResult(next);
              setOpen(false);
            }}
          />
        </div>
      ) : (
        <ClosedState result={result} page={variant} onReopen={() => setOpen(true)} onSwitch={setPage} />
      )}
    </div>
  );
}
