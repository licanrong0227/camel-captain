/**
 * @name 编辑产品弹窗 - 骆驼队长BI
 */

import React, { useRef, useState } from 'react';
import './style.css';

import detailPoster from './assets/detail-poster.png';
import thumb1 from './assets/product-thumb-1.png';
import thumb2 from './assets/product-thumb-2.png';
import thumb3 from './assets/product-thumb-3.png';
import thumb4 from './assets/product-thumb-4.png';
import thumb5 from './assets/product-thumb-5.png';
import thumb6 from './assets/product-thumb-6.png';
import thumb7 from './assets/product-thumb-7.png';
import thumb8 from './assets/product-thumb-8.png';
import thumb9 from './assets/product-thumb-9.png';
import thumb10 from './assets/product-thumb-10.png';

import iconClose from './assets/icons/close.svg';
import iconCollapse from './assets/icons/collapse.svg';
import iconCaret from './assets/icons/caret.svg';
import iconFontColor from './assets/icons/font-color.svg';
import iconListUl from './assets/icons/list-ul.svg';
import iconListOl from './assets/icons/list-ol.svg';
import iconAlign from './assets/icons/align-left.svg';
import iconImage from './assets/icons/image.svg';
import iconClearFormat from './assets/icons/clear-format.svg';
import iconTrash from './assets/icons/trash.svg';
import iconFolderCheck from './assets/icons/folder-check.svg';
import iconPagerPrev from './assets/icons/pager-prev.svg';
import iconPagerNext from './assets/icons/pager-next.svg';
import iconArrowUp from './assets/icons/arrow-up.svg';
import iconArrowDown from './assets/icons/arrow-down.svg';
import { AnnotationViewer, type AnnotationSourceDocument } from '@axhub/annotation';
import annotationSourceDocument from './annotation-source.json';

type Product = {
  id: number;
  title: string;
  thumb: string;
  edited: boolean;
};

// 标题文案与截断形态均取自源截图（源图即为单行截断显示）
const PRODUCTS: Product[] = [
  { id: 1, title: '【全新正品未拆封】i17Pr…', thumb: thumb1, edited: false },
  { id: 2, title: '纯色北欧桌布防水防油免…', thumb: thumb2, edited: false },
  { id: 3, title: '2026 Summer Full-Print P…', thumb: thumb3, edited: false },
  { id: 4, title: 'Summer Women’S Slipper…', thumb: thumb4, edited: false },
  { id: 5, title: 'Acupressure Foot Massag…', thumb: thumb5, edited: false },
  { id: 6, title: 'ASHALI Cute Bear Breath…', thumb: thumb6, edited: false },
  { id: 7, title: 'Designer womens Croppe…', thumb: thumb7, edited: false },
  { id: 8, title: '天然淡水珍珠长款项链女…', thumb: thumb8, edited: false },
  { id: 9, title: '智能感应垃圾桶家用卧室…', thumb: thumb9, edited: false },
  { id: 10, title: 'Women Simple Gold Chai…', thumb: thumb10, edited: false },
];

const TABS = [
  { id: 'basic', label: '基本' },
  { id: 'detail', label: '详情' },
  { id: 'log', label: '日志' },
] as const;

type TabId = (typeof TABS)[number]['id'];

const TOOLS = [
  { id: 'bold', label: 'B', className: 'ep-tool--bold' },
  { id: 'italic', label: 'I', className: 'ep-tool--italic' },
  { id: 'underline', label: 'U', className: 'ep-tool--underline' },
] as const;

const PAGE_SIZE = 10;

type TemplateType = 'public' | 'private';

type Template = {
  id: number;
  name: string;
  type: TemplateType;
  html: string;
};

const TEMPLATE_TYPE_LABEL: Record<TemplateType, string> = {
  public: '公共',
  private: '专属',
};

const POSTER_HTML = `<img class="ep-editor__poster" src="${detailPoster}" alt="详情主图" />`;

const INITIAL_TEMPLATES: Template[] = [
  { id: 1, name: '哈吉米', type: 'public', html: POSTER_HTML },
  {
    id: 2,
    name: '桌布详情',
    type: 'private',
    html:
      '<p style="margin:0 0 12px;font-size:14px;font-weight:700;">纯色北欧桌布 · 防水防油免洗</p>' +
      '<p style="margin:0 0 8px;font-size:13px;line-height:22px;">1. 加厚材质，防水防油，一擦即净；</p>' +
      '<p style="margin:0 0 8px;font-size:13px;line-height:22px;">2. 北欧简约纯色，多尺寸可选；</p>' +
      '<p style="margin:0;font-size:13px;line-height:22px;">3. 支持定制，欢迎咨询客服。</p>',
  },
];

function DialogFrame({
  title,
  onClose,
  children,
  className = '',
  overlayClassName = '',
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  overlayClassName?: string;
}) {
  return (
    <div
      className={`ep-dialog-overlay ${overlayClassName}`.trim()}
      onClick={onClose}
    >
      <div
        className={`ep-dialog ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ep-dialog__header">
          <h3 className="ep-dialog__title">{title}</h3>
          <button type="button" className="ep-dialog__close" aria-label="关闭" onClick={onClose}>
            <img src={iconClose} alt="" />
          </button>
        </div>
        {children}
      </div>
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
  template?: Template;
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
    <DialogFrame
      title={mode === 'create' ? '创建模板' : '编辑模板'}
      onClose={onClose}
      className="ep-dialog--form"
      overlayClassName="ep-dialog-overlay--top"
    >
      <div className="ep-form-row">
        <label className="ep-form-row__label">
          <span className="ep-form-row__required">*</span>模板名称
        </label>
        <input
          className={error ? 'ep-input ep-input--error' : 'ep-input'}
          type="text"
          placeholder="请输入模板名称"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            if (event.target.value.trim()) setError('');
          }}
        />
      </div>
      {error && <p className="ep-form-error">{error}</p>}
      <div className="ep-form-row">
        <span className="ep-form-row__label">模板类型</span>
        <div className="ep-select">
          <button
            type="button"
            className={typeOpen ? 'ep-select__trigger ep-select__trigger--open' : 'ep-select__trigger'}
            onClick={() => setTypeOpen((prev) => !prev)}
          >
            <span>{TEMPLATE_TYPE_LABEL[type]}</span>
            <img src={iconCaret} alt="" className={typeOpen ? 'ep-select__caret ep-select__caret--up' : 'ep-select__caret'} />
          </button>
          {typeOpen && (
            <div className="ep-select__menu">
              {(Object.keys(TEMPLATE_TYPE_LABEL) as TemplateType[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  className={option === type ? 'ep-select__option ep-select__option--active' : 'ep-select__option'}
                  onClick={() => {
                    setType(option);
                    setTypeOpen(false);
                  }}
                >
                  {TEMPLATE_TYPE_LABEL[option]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="ep-form-hint">
        <p>① 公共：所有子账号可见</p>
        <p>② 专属：仅当前子账号可见</p>
      </div>
      <div className="ep-dialog__footer">
        <button type="button" className="ep-btn ep-btn--ghost ep-btn--sm" onClick={onClose}>
          取消
        </button>
        <button type="button" className="ep-btn ep-btn--primary ep-btn--sm" onClick={submit}>
          确定
        </button>
      </div>
    </DialogFrame>
  );
}

function ManageTemplateDialog({
  templates,
  onClose,
  onEdit,
  onDelete,
}: {
  templates: Template[];
  onClose: () => void;
  onEdit: (template: Template) => void;
  onDelete: (template: Template) => void;
}) {
  return (
    <DialogFrame title="管理模板" onClose={onClose} className="ep-dialog--manage">
      <table className="ep-tpl-table">
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
              <td colSpan={3} className="ep-tpl-table__empty">
                暂无模板，请先创建
              </td>
            </tr>
          ) : (
            templates.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{TEMPLATE_TYPE_LABEL[item.type]}</td>
                <td>
                  <div className="ep-tpl-table__actions">
                    <button type="button" className="ep-tpl-op" onClick={() => onEdit(item)}>
                      编辑
                    </button>
                    <button type="button" className="ep-tpl-op" onClick={() => onDelete(item)}>
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="ep-dialog__footer">
        <button type="button" className="ep-btn ep-btn--ghost ep-btn--sm" onClick={onClose}>
          关闭
        </button>
      </div>
    </DialogFrame>
  );
}

function ConfirmDeleteDialog({
  template,
  onCancel,
  onConfirm,
}: {
  template: Template;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <DialogFrame title="提示" onClose={onCancel} className="ep-dialog--confirm">
      <div className="ep-confirm__body">
        <span className="ep-confirm__icon" aria-hidden="true">
          !
        </span>
        <p className="ep-confirm__text">确定要删除模板{template.name}吗？</p>
      </div>
      <div className="ep-dialog__footer">
        <button type="button" className="ep-btn ep-btn--ghost ep-btn--sm" onClick={onCancel}>
          取消
        </button>
        <button type="button" className="ep-btn ep-btn--primary ep-btn--sm" onClick={onConfirm}>
          确定
        </button>
      </div>
    </DialogFrame>
  );
}

export default function EditProductDialog() {
  const [visible, setVisible] = useState(true);
  const [products, setProducts] = useState(PRODUCTS);
  const [selectedId, setSelectedId] = useState(1);
  const [tab, setTab] = useState<TabId>('detail');
  const [collapsed, setCollapsed] = useState(false);
  const [page, setPage] = useState(1);
  const [activeTools, setActiveTools] = useState<string[]>(['image']);
  const bodyRef = useRef<HTMLDivElement>(null);

  const [templates, setTemplates] = useState<Template[]>(INITIAL_TEMPLATES);
  const nextTemplateId = useRef(3);
  const [appliedTemplateId, setAppliedTemplateId] = useState<number | null>(null);
  const [tplMenuOpen, setTplMenuOpen] = useState(false);
  const [formDialog, setFormDialog] = useState<{ mode: 'create' | 'edit'; template?: Template } | null>(null);
  const [manageOpen, setManageOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Template | null>(null);
  const [detailHtml, setDetailHtml] = useState(POSTER_HTML);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number>();

  const showToast = (message: string) => {
    window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(null), 2000);
  };

  const appliedTemplate = templates.find((item) => item.id === appliedTemplateId) ?? null;

  const pickTemplate = (id: number) => {
    const template = templates.find((item) => item.id === id);
    if (!template) return;
    setDetailHtml(template.html);
    setAppliedTemplateId(id);
    setTplMenuOpen(false);
  };

  const saveToAppliedTemplate = () => {
    if (!appliedTemplateId) return;
    const targetId = appliedTemplateId;
    setTemplates((prev) => prev.map((item) => (item.id === targetId ? { ...item, html: detailHtml } : item)));
    showToast(`已保存到模板「${templates.find((item) => item.id === targetId)?.name ?? ''}」`);
  };

  const submitFormDialog = (name: string, type: TemplateType) => {
    if (!formDialog) return;
    if (formDialog.mode === 'create') {
      setTemplates((prev) => [...prev, { id: nextTemplateId.current++, name, type, html: detailHtml }]);
    } else if (formDialog.template) {
      const targetId = formDialog.template.id;
      setTemplates((prev) => prev.map((item) => (item.id === targetId ? { ...item, name, type } : item)));
    }
    setFormDialog(null);
    showToast(formDialog.mode === 'create' ? '创建成功' : '保存成功');
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setTemplates((prev) => prev.filter((item) => item.id !== deleteTarget.id));
    setAppliedTemplateId((prev) => (prev === deleteTarget.id ? null : prev));
    setDeleteTarget(null);
    showToast('删除成功');
  };

  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const pageItems = products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selected = products.find((item) => item.id === selectedId) ?? null;

  const toggleTool = (id: string) =>
    setActiveTools((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));

  const toggleEdited = (id: number) =>
    setProducts((prev) => prev.map((item) => (item.id === id ? { ...item, edited: !item.edited } : item)));

  const removeProduct = (id: number) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));
    setSelectedId((prev) => (prev === id ? 1 : prev));
  };

  const scrollBody = (delta: number) =>
    bodyRef.current?.scrollBy({ top: delta, behavior: 'smooth' });

  if (!visible) {
    return (
      <>
        <>
                {toast && <div className="ep-toast" role="status">{toast}</div>}
                <div className="ep-closed">
                  <span className="ep-closed__text">弹窗已关闭（原型演示）</span>
                  <button type="button" className="ep-btn ep-btn--primary" onClick={() => setVisible(true)}>
                    重新打开
                  </button>
                </div>
              </>
        <AnnotationViewer
          source={annotationSourceDocument as unknown as AnnotationSourceDocument}
          options={{
            currentPageId: (() => {
              const hashPageId = new URLSearchParams(window.location.hash.replace(/^#/, '')).get('page');
              const searchPageId = new URLSearchParams(window.location.search.replace(/^\?/, '')).get('page');
              const pageId = hashPageId || searchPageId;
              return typeof pageId === 'string' && /^[a-z0-9-]+$/u.test(pageId)
                ? pageId
                : "edit-product-dialog";
            })(),
            onDirectoryRoute: (node) => {
              if (typeof node.route === 'string' && /^[a-z0-9-]+$/u.test(node.route)) {
                window.location.hash = `page=${node.route}`;
              }
            },
            toolbarEdge: 'right',
            showToolbar: true,
            showThemeToggle: true,
            showColorFilter: true,
            emptyWhenNoData: true,
          }}
        />
      </>
    );
  }

  return (
    <>
      {toast && <div className="ep-toast" role="status">{toast}</div>}
      <div className="ep-overlay">
      <div className="ep-modal" role="dialog" aria-modal="true" aria-label="编辑产品">
        <aside className={collapsed ? 'ep-panel ep-panel--collapsed' : 'ep-panel'}>
          <h2 className="ep-panel__title">编辑产品</h2>

          <ul className="ep-list">
            {pageItems.map((item) => (
              <li
                key={item.id}
                className={item.id === selectedId ? 'ep-item ep-item--active' : 'ep-item'}
                onClick={() => setSelectedId(item.id)}
              >
                <img className="ep-item__thumb" src={item.thumb} alt="" />
                <div className="ep-item__main">
                  <p className="ep-item__title">{item.title}</p>
                  <div className="ep-item__foot">
                    <span className="ep-item__status">{item.edited ? '已编辑' : '未编辑'}</span>
                    <button
                      type="button"
                      className="ep-item__action"
                      aria-label="删除该商品"
                      onClick={(event) => {
                        event.stopPropagation();
                        removeProduct(item.id);
                      }}
                    >
                      <img src={iconTrash} alt="" />
                    </button>
                    <button
                      type="button"
                      className={item.edited ? 'ep-item__action ep-item__action--on' : 'ep-item__action'}
                      aria-label="标记为已编辑"
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleEdited(item.id);
                      }}
                    >
                      <img src={iconFolderCheck} alt="" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="ep-pager">
            <button
              type="button"
              className="ep-pager__btn ep-pager__btn--prev"
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              <img src={iconPagerPrev} alt="上一页" />
            </button>
            <button
              type="button"
              className="ep-pager__btn ep-pager__btn--next"
              onClick={() => setPage((prev) => (prev < totalPages ? prev + 1 : prev))}
            >
              <img src={iconPagerNext} alt="下一页" />
            </button>
          </div>
        </aside>

        <section className="ep-content">
          <div className="ep-tabs">
            <button
              type="button"
              className="ep-tabs__collapse"
              aria-label={collapsed ? '展开列表' : '收起列表'}
              onClick={() => setCollapsed((prev) => !prev)}
            >
              <img src={iconCollapse} alt="" className={collapsed ? 'ep-tabs__icon ep-tabs__icon--flip' : 'ep-tabs__icon'} />
            </button>
            {TABS.map((item, index) => (
              <React.Fragment key={item.id}>
                {index > 0 && <span className="ep-tabs__divider" />}
                <button
                  type="button"
                  className={tab === item.id ? 'ep-tabs__item ep-tabs__item--active' : 'ep-tabs__item'}
                  onClick={() => setTab(item.id)}
                >
                  {item.label}
                </button>
              </React.Fragment>
            ))}
          </div>

          <div className="ep-editor">
            {tab === 'detail' ? (
              <>
                <div className="ep-toolbar">
                  {TOOLS.map((tool) => (
                    <button
                      key={tool.id}
                      type="button"
                      className={`ep-tool ep-tool--text ${tool.className}${activeTools.includes(tool.id) ? ' ep-tool--on' : ''}`}
                      onClick={() => toggleTool(tool.id)}
                    >
                      {tool.label}
                    </button>
                  ))}
                  <button type="button" className="ep-tool ep-tool--size">
                    <span className="ep-tool__size-text">默认大小</span>
                    <img src={iconCaret} alt="" />
                  </button>
                  <button
                    type="button"
                    className="ep-tool ep-tool--icon ep-tool--font-color"
                    onClick={() => toggleTool('fontColor')}
                  >
                    <img src={iconFontColor} alt="字体颜色" />
                  </button>
                  <button type="button" className="ep-tool ep-tool--icon ep-tool--ul" onClick={() => toggleTool('ul')}>
                    <img src={iconListUl} alt="无序列表" />
                  </button>
                  <button type="button" className="ep-tool ep-tool--icon ep-tool--ol" onClick={() => toggleTool('ol')}>
                    <img src={iconListOl} alt="有序列表" />
                  </button>
                  <button type="button" className="ep-tool ep-tool--icon ep-tool--align" onClick={() => toggleTool('align')}>
                    <img src={iconAlign} alt="对齐方式" />
                  </button>
                  <button
                    type="button"
                    className={`ep-tool ep-tool--image${activeTools.includes('image') ? ' ep-tool--image-on' : ''}`}
                    onClick={() => toggleTool('image')}
                  >
                    <img src={iconImage} alt="插入图片" />
                  </button>
                  <button type="button" className="ep-tool ep-tool--icon ep-tool--clear" onClick={() => toggleTool('clear')}>
                    <img src={iconClearFormat} alt="清除格式" />
                  </button>
                  <div className="ep-tpl-bar">
                    <div className="ep-tpl-select">
                      <button
                        type="button"
                        className={tplMenuOpen ? 'ep-select__trigger ep-select__trigger--open ep-tpl-select__trigger' : 'ep-select__trigger ep-tpl-select__trigger'}
                        onClick={() => setTplMenuOpen((prev) => !prev)}
                      >
                        <span className={appliedTemplate ? '' : 'ep-select__placeholder'}>
                          {appliedTemplate ? appliedTemplate.name : '选择已有模板快速替换'}
                        </span>
                        <img src={iconCaret} alt="" className={tplMenuOpen ? 'ep-select__caret ep-select__caret--up' : 'ep-select__caret'} />
                      </button>
                      {tplMenuOpen && (
                        <>
                          <div className="ep-menu-catcher" onClick={() => setTplMenuOpen(false)} />
                          <div className="ep-select__menu ep-tpl-select__menu">
                            {templates.length === 0 ? (
                              <p className="ep-select__empty">暂无模板</p>
                            ) : (
                              templates.map((item) => (
                                <button
                                  key={item.id}
                                  type="button"
                                  className={item.id === appliedTemplateId ? 'ep-select__option ep-select__option--active' : 'ep-select__option'}
                                  onClick={() => pickTemplate(item.id)}
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
                      className="ep-btn ep-btn--primary ep-btn--sm"
                      onClick={() => setFormDialog({ mode: 'create' })}
                    >
                      创建模板
                    </button>
                    <button type="button" className="ep-btn ep-btn--ghost ep-btn--sm" onClick={() => setManageOpen(true)}>
                      管理模板
                    </button>
                  </div>
                </div>
                <div
                  className="ep-editor__body"
                  ref={bodyRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(event) => setDetailHtml(event.currentTarget.innerHTML)}
                  dangerouslySetInnerHTML={{ __html: detailHtml }}
                />
                <div className="ep-float">
                  <button type="button" className="ep-float__btn" aria-label="向上滚动" onClick={() => scrollBody(-240)}>
                    <img src={iconArrowUp} alt="" />
                  </button>
                  <button type="button" className="ep-float__btn" aria-label="向下滚动" onClick={() => scrollBody(240)}>
                    <img src={iconArrowDown} alt="" />
                  </button>
                </div>
              </>
            ) : (
              <div className="ep-placeholder">
                <p className="ep-placeholder__title">{TABS.find((item) => item.id === tab)?.label}页签</p>
                <p className="ep-placeholder__text">
                  {selected ? `当前商品：${selected.title}` : '当前未选中商品'}
                  。该页签内容未包含在源截图中，待补充。
                </p>
              </div>
            )}
          </div>
        </section>

        <button
          type="button"
          className="ep-modal__close"
          aria-label="关闭"
          onClick={() => setVisible(false)}
        >
          <img src={iconClose} alt="" />
        </button>

        <footer className="ep-footer">
          <button type="button" className="ep-btn ep-btn--ghost" onClick={() => setVisible(false)}>
            关闭
          </button>
          <button
            type="button"
            className="ep-btn ep-btn--primary"
            onClick={() => {
              showToast('保存成功');
              setVisible(false);
            }}
          >
            保存
          </button>
          {appliedTemplate && (
            <button
              type="button"
              className="ep-btn ep-btn--primary"
              onClick={saveToAppliedTemplate}
            >
              保存模板
            </button>
          )}
        </footer>

        {formDialog && (
          <TemplateFormDialog
            mode={formDialog.mode}
            template={formDialog.template}
            onClose={() => setFormDialog(null)}
            onSubmit={submitFormDialog}
          />
        )}
        {manageOpen && (
          <ManageTemplateDialog
            templates={templates}
            onClose={() => setManageOpen(false)}
            onEdit={(template) => {
              setFormDialog({ mode: 'edit', template });
            }}
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
        </div>
      </div>
    </>
  );
}
