/**
 * @name AI克隆弹窗 - 我的商品
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnnotationViewer, type AnnotationSourceDocument } from '@axhub/annotation';
import annotationSourceDocument from './annotation-source.json';
import mainSample1 from './assets/main-image-sample-1.png';
import './style.css';

const STORES = ['sneakerhub8', 'clothes', '鞋子', '包包'];
const PRODUCT_COUNT = 10;

type UploadedImage = { id: string; url: string; name: string; width: number; height: number };

const IconClose = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="7" cy="7" r="4.6" stroke="currentColor" strokeWidth="1.4" />
    <path d="M10.6 10.6L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const PictureIcon = () => (
  <svg width="62" height="62" viewBox="0 0 24 24" fill="none" stroke="#c0c4cc" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const Checkbox = ({
  checked,
  indeterminate = false,
  onChange,
  className = '',
  dataAnnotationId,
  children,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  className?: string;
  dataAnnotationId?: string;
  children: React.ReactNode;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <label className={`acd-check${checked ? ' is-checked' : ''}${className ? ` ${className}` : ''}`} data-annotation-id={dataAnnotationId}>
      <input
        ref={inputRef}
        type="checkbox"
        className="acd-check__input"
        checked={checked}
        onChange={onChange}
      />
      <span className="acd-check__box" />
      <span className="acd-check__text">{children}</span>
    </label>
  );
};

const Switch = ({ checked, onChange, ariaLabel }: { checked: boolean; onChange: () => void; ariaLabel: string }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={ariaLabel}
    className={`acd-switch${checked ? ' is-on' : ''}`}
    onClick={onChange}
  />
);

const Radio = ({ checked, onChange, disabled = false, children }: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) => (
  <label className={`acd-radio${checked ? ' is-checked' : ''}${disabled ? ' is-disabled' : ''}`}>
    <input
      type="radio"
      className="acd-radio__input"
      checked={checked}
      disabled={disabled}
      onChange={() => { if (!disabled) onChange(); }}
    />
    <span className="acd-radio__box" />
    <span className="acd-radio__text">{children}</span>
  </label>
);

const AI_KEYWORDS_MAX = 70;

const AiKeywordField = ({ value, onChange }: { value: string; onChange: (next: string) => void }) => (
  <div className="acd-ai" data-annotation-id="config-title-ai-keywords">
    <div className="acd-ai__field">
      <span className="acd-ai__label">指定包含关键词</span>
      <div className="acd-ai__control">
        <input
          type="text"
          className="acd-ai__input"
          value={value}
          maxLength={AI_KEYWORDS_MAX}
          placeholder="多个关键词用逗号分隔"
          onChange={(event) => onChange(event.target.value)}
        />
        <span className={`acd-ai__count${value.length >= AI_KEYWORDS_MAX ? ' is-limit' : ''}`}>
          {value.length}/{AI_KEYWORDS_MAX}
        </span>
      </div>
    </div>
    <p className="acd-ai__hint">让AI生成标题时包含指定的关键词</p>
  </div>
);

const AiCloneDialog = () => {
  const [visible, setVisible] = useState(true);
  const [mode, setMode] = useState<'target' | 'origin'>('target');
  const [keyword, setKeyword] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [titleOn, setTitleOn] = useState(false);
  const [titleMode, setTitleMode] = useState<'shuffle' | 'ai'>('shuffle');
  const [titleKeywords, setTitleKeywords] = useState('');
  const [imageOn, setImageOn] = useState(false);
  const [imageMode, setImageMode] = useState<'shuffle' | 'sku' | 'upload'>('shuffle');
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([
    { id: 'sample-1', url: mainSample1, name: '示例图片', width: 1024, height: 1024 },
  ]);
  const uploadFileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [toast, setToast] = useState('');

  const visibleStores = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return kw ? STORES.filter((name) => name.toLowerCase().includes(kw)) : STORES;
  }, [keyword]);

  const allChecked = visibleStores.length > 0 && visibleStores.every((name) => selected.includes(name));
  const someChecked = visibleStores.some((name) => selected.includes(name));

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const toggleStore = (name: string) => {
    setSelected((prev) => (prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]));
  };

  const toggleAll = () => {
    setSelected((prev) => (allChecked ? prev.filter((item) => !visibleStores.includes(item)) : [...new Set([...prev, ...visibleStores])]));
  };

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    const probe = new Image();
    probe.onload = () => {
      setUploadedImages([{
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        url,
        name: file.name,
        width: probe.naturalWidth,
        height: probe.naturalHeight,
      }]);
    };
    probe.src = url;
  };

  const submit = (action: 'clone' | 'publish') => {
    if (mode === 'target' && selected.length === 0) {
      setToast('请先选择目标店铺');
      return;
    }
    if (imageOn && imageMode === 'upload' && uploadedImages.length === 0) {
      setToast('请先上传首图');
      return;
    }
    const configs = [
      titleOn ? (titleMode === 'ai' ? '标题 AI 重新生成' : '标题随机打乱') : '',
      imageOn
        ? (imageMode === 'sku' ? '主图取首个 SKU 图替换首图' : imageMode === 'upload' ? '主图上传替换首图' : '主图随机打乱')
        : '',
    ].filter(Boolean).join('、');
    const target = mode === 'target' ? `${selected.length} 个店铺` : `${PRODUCT_COUNT} 条商品各自原店铺`;
    setToast(`${action === 'clone' ? '克隆' : '直接上架'}已提交：${target}${configs ? ` · ${configs}` : ''}`);
  };

  return (
    <div className="acd-page">
      {visible ? (
        <div className="acd-overlay">
          <div className="acd-dialog" role="dialog" aria-modal="true" aria-label="AI克隆" data-annotation-id="ai-clone-dialog">
            <div className="acd-dialog__header">
              <span className="acd-dialog__title">AI克隆（已选 10 条）</span>
            </div>
            <button type="button" className="acd-dialog__close" aria-label="关闭" onClick={() => setVisible(false)}>
              <IconClose />
            </button>

            <div className="acd-dialog__body">
              <div className="acd-modal">
                <section className="acd-section" data-annotation-id="target-store-section">
                  <div className="acd-section__title">
                    <span className="acd-step">1</span>
                    选择克隆方式
                  </div>

                  <div className="acd-mode" data-annotation-id="clone-mode-group">
                    <Radio checked={mode === 'target'} onChange={() => setMode('target')}>
                      选择目标店铺
                    </Radio>
                    <Radio checked={mode === 'origin'} onChange={() => setMode('origin')}>
                      克隆到原店铺
                    </Radio>
                  </div>

                  {mode === 'target' ? (
                    <>
                      <div className="acd-search">
                        <span className="acd-search__icon">
                          <IconSearch />
                        </span>
                        <input
                          className="acd-search__inner"
                          type="text"
                          placeholder="搜索店铺"
                          value={keyword}
                          onChange={(event) => setKeyword(event.target.value)}
                        />
                      </div>

                      <div className="acd-panel" data-annotation-id="store-list-panel">
                    <div className="acd-panel__head">
                      <span>选择目标店铺</span>
                      <Checkbox checked={allChecked} indeterminate={!allChecked && someChecked} onChange={toggleAll}>
                        全选
                      </Checkbox>
                    </div>
                    <div className="acd-group">
                      {visibleStores.map((name) => (
                        <Checkbox
                          key={name}
                          className="acd-check--chip"
                          checked={selected.includes(name)}
                          onChange={() => toggleStore(name)}
                        >
                          {name}
                        </Checkbox>
                      ))}
                      {visibleStores.length === 0 ? <span className="acd-group__empty">没有匹配的店铺</span> : null}
                    </div>
                  </div>
                    </>
                  ) : (
                    <div className="acd-panel acd-panel--origin" data-annotation-id="origin-store-tip">
                      所选 {PRODUCT_COUNT} 条商品会分别克隆回它当前所在的店铺，无需选择目标店铺。
                    </div>
                  )}
                </section>

                <section className="acd-section" data-annotation-id="move-config-section">
                  <div className="acd-section__title">
                    <span className="acd-step">2</span>
                    搬家配置
                  </div>
                  <div className="acd-strategy-wrap">
                    <div className="acd-strategy" data-annotation-id="config-title-strategy">
                      <div className="acd-strategy__head">
                        <span className="acd-strategy__title">商品标题</span>
                        <Switch
                          ariaLabel="商品标题处理开关"
                          checked={titleOn}
                          onChange={() => setTitleOn((prev) => !prev)}
                        />
                      </div>
                      {titleOn ? (
                        <>
                          <div className="acd-option-list">
                            <Radio checked={titleMode === 'shuffle'} onChange={() => setTitleMode('shuffle')}>
                              随机打乱
                            </Radio>
                            <Radio checked={titleMode === 'ai'} onChange={() => setTitleMode('ai')}>
                              AI 重新生成
                            </Radio>
                          </div>
                          {titleMode === 'shuffle' ? (
                            <p className="acd-hint">打乱标题中的词序，降低重复铺货风险。</p>
                          ) : (
                            <AiKeywordField value={titleKeywords} onChange={setTitleKeywords} />
                          )}
                        </>
                      ) : null}
                    </div>

                    <div className="acd-strategy" data-annotation-id="config-image-strategy">
                      <div className="acd-strategy__head">
                        <span className="acd-strategy__title">商品主图</span>
                        <Switch
                          ariaLabel="商品主图处理开关"
                          checked={imageOn}
                          onChange={() => setImageOn((prev) => !prev)}
                        />
                      </div>
                      {imageOn ? (
                        <>
                          <div className="acd-option-list">
                            <Radio checked={imageMode === 'shuffle'} onChange={() => setImageMode('shuffle')}>
                              随机打乱
                            </Radio>
                            <Radio checked={imageMode === 'sku'} onChange={() => setImageMode('sku')}>
                              取首个 SKU 图替换首图
                            </Radio>
                            <Radio checked={imageMode === 'upload'} onChange={() => setImageMode('upload')}>
                              上传替换首图
                            </Radio>
                          </div>
                          {imageMode === 'shuffle' ? (
                            <p className="acd-hint">打乱主图顺序，降低重复铺货风险。</p>
                          ) : null}
                          {imageMode === 'sku' ? (
                            <p className="acd-hint">取首个 SKU 图替换首图，避免与其他店铺主图重复。</p>
                          ) : null}
                          {imageMode === 'upload' ? (
                            <>
                              <div className="acd-upload" data-annotation-id="config-image-upload">
                                {uploadedImages.length === 0 ? (
                                  <button type="button" className="acd-upload__add" onClick={() => setUploadDialogOpen(true)}>
                                    <span className="acd-upload__add-plus">+</span>
                                    <span className="acd-upload__add-text">
                                      <span className="acd-upload__add-line">点击</span>
                                      <span className="acd-upload__add-line">Ctrl+V粘贴</span>
                                    </span>
                                  </button>
                                ) : null}
                                {uploadedImages.map((img) => (
                                  <div className="acd-upload__item" key={img.id}>
                                    <img src={img.url} alt={img.name} />
                                    <span className="acd-upload__res">{img.width}*{img.height}</span>
                                    <button
                                      type="button"
                                      className="acd-upload__remove"
                                      aria-label="删除该首图"
                                      onClick={() => setUploadedImages((list) => list.filter((it) => it.id !== img.id))}
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                                <input
                                  ref={uploadFileInputRef}
                                  type="file"
                                  accept="image/*"
                                  hidden
                                  onChange={(event) => {
                                    handleFiles(event.target.files);
                                    setUploadDialogOpen(false);
                                    event.target.value = '';
                                  }}
                                />
                              </div>
                              <p className="acd-hint">克隆时用上传的图片替换商品首图。</p>
                            </>
                          ) : null}
                        </>
                      ) : null}
                    </div>
                  </div>
                </section>

                <div className="acd-footer" data-annotation-id="transfer-footer">
                  <div className="acd-footer__left">
                    {mode === 'target' ? (
                      <>
                        已选店铺 <strong>{selected.length}</strong> 个
                      </>
                    ) : (
                      <>
                        已选商品 <strong>{PRODUCT_COUNT}</strong> 条
                      </>
                    )}
                  </div>
                  <div className="acd-footer__right">
                    <button type="button" className="acd-btn" onClick={() => setVisible(false)}>
                      取消
                    </button>
                    <button type="button" className="acd-btn acd-btn--clone" onClick={() => submit('clone')}>
                      克隆
                    </button>
                    <button type="button" className="acd-btn acd-btn--publish" onClick={() => submit('publish')}>
                      直接上架
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {uploadDialogOpen ? (
            <div className="acd-upl-overlay">
              <div className="acd-upl-modal" role="dialog" aria-modal="true" aria-label="上传图片">
                <div className="acd-upl-header">
                  <span className="acd-upl-title">上传图片</span>
                  <button type="button" className="acd-upl-close" aria-label="关闭" onClick={() => setUploadDialogOpen(false)}>
                    <IconClose />
                  </button>
                </div>
                <div className="acd-upl-body">
                  <div className="acd-upl-tabs">
                    <span className="acd-upl-tab is-active">本地</span>
                    <span className="acd-upl-tab">URL</span>
                    <span className="acd-upl-tab">引用</span>
                  </div>
                  <div className="acd-upl-content">
                    <div className="acd-upl-radios">
                      <Radio checked disabled onChange={() => undefined}>单个上传</Radio>
                      <Radio checked={false} disabled onChange={() => undefined}>批量上传</Radio>
                    </div>
                    <div className="acd-upl-drop" onClick={() => uploadFileInputRef.current?.click()}>
                      <PictureIcon />
                      <div className="acd-upl-drop-text">
                        将文件拖到此处，或<span className="acd-upl-drop-link">点击上传</span>
                      </div>
                      <div className="acd-upl-drop-tip">按 Ctrl+V 可从剪贴板上传</div>
                    </div>
                  </div>
                </div>
                <div className="acd-upl-footer">
                  <button type="button" className="acd-btn" onClick={() => setUploadDialogOpen(false)}>取消</button>
                  <button type="button" className="acd-btn acd-btn--publish" onClick={() => setUploadDialogOpen(false)}>确认</button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <button type="button" className="acd-reopen" onClick={() => setVisible(true)}>
          打开 AI克隆弹窗
        </button>
      )}

      {toast ? <div className="acd-toast">{toast}</div> : null}

      <AnnotationViewer
        source={annotationSourceDocument as unknown as AnnotationSourceDocument}
        options={{
          currentPageId: 'ai-clone-dialog',
          toolbarEdge: 'right',
          showToolbar: true,
          showThemeToggle: true,
          showColorFilter: true,
          emptyWhenNoData: true,
        }}
      />
    </div>
  );
};

export default AiCloneDialog;
