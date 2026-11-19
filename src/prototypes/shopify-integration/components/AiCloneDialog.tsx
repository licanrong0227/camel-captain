import React, { useEffect, useMemo, useRef, useState } from 'react';

import mainSample1 from '../assets/ai-clone-main-sample-1.png';

type StorePlatform = { id: string; label: string; stores: string[] };

const STORE_PLATFORMS: StorePlatform[] = [
  {
    id: 'dhgate',
    label: '敦煌网',
    stores: [
      'sneakerhub8',
      'clothes',
      '鞋子',
      '包包',
      'sports-outlet',
      'fashion-house',
      'digital-zone',
      'beauty-shop',
      'toy-box',
      'home-deco',
      'jewelry-lane',
      'outdoor-plus',
      'baby-world',
      'pet-supply',
      'car-accessory',
      'phone-case',
      'watch-store',
      'glasses-hub',
    ],
  },
  {
    id: 'shopify',
    label: 'Shopify',
    stores: [
      'camel-captain',
      'camel-outlet',
      'camel-kids',
      'camel-sports',
      'camel-beauty',
      'camel-living',
      'camel-tech',
      'camel-pet',
    ],
  },
];

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

const IconTick = () => (
  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M2.4 6.2 4.9 8.6 9.6 3.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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

const AiCloneDialog = ({ count, onClose }: { count: number; onClose: () => void }) => {
  const [mode, setMode] = useState<'target' | 'origin'>('target');
  const [keyword, setKeyword] = useState('');
  const [viewPlatformId, setViewPlatformId] = useState<string>(STORE_PLATFORMS[0].id);
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

  const currentPlatform = STORE_PLATFORMS.find((platform) => platform.id === viewPlatformId) ?? STORE_PLATFORMS[0];
  const platformStores = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return currentPlatform.stores.filter((name) => !kw || name.toLowerCase().includes(kw));
  }, [currentPlatform, keyword]);
  const currentKeys = platformStores.map((name) => `${currentPlatform.id}::${name}`);
  const allCurrent = currentKeys.length > 0 && currentKeys.every((key) => selected.includes(key));
  const someCurrent = currentKeys.some((key) => selected.includes(key));

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const toggleStore = (key: string) => {
    setSelected((prev) => (prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]));
  };

  const togglePlatformStores = (platform: { id: string; stores: string[] }) => {
    const keys = platform.stores.map((name) => `${platform.id}::${name}`);
    setSelected((prev) => {
      const every = keys.length > 0 && keys.every((key) => prev.includes(key));
      return every
        ? prev.filter((key) => !keys.includes(key))
        : [...new Set([...prev, ...keys])];
    });
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
    const target = mode === 'target' ? `${selected.length} 个店铺` : `${count} 条商品各自原店铺`;
    setToast(`${action === 'clone' ? '克隆' : '直接上架'}已提交：${target}${configs ? ` · ${configs}` : ''}`);
  };

  return (
    <>
      <div className="acd-overlay">
          <div className="acd-dialog" role="dialog" aria-modal="true" aria-label="AI克隆" data-annotation-id="ai-clone-dialog">
            <div className="acd-dialog__header">
              <span className="acd-dialog__title">AI克隆（已选 {count} 条）</span>
            </div>
            <button type="button" className="acd-dialog__close" aria-label="关闭" onClick={onClose}>
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
                        </div>
                        <div className="acd-platform">
                          <span className="acd-platform__label">平台</span>
                          {STORE_PLATFORMS.map((platform) => {
                            const active = platform.id === viewPlatformId;
                            const hasSelected = platform.stores.some((name) => selected.includes(`${platform.id}::${name}`));
                            return (
                              <button
                                key={platform.id}
                                type="button"
                                className={'acd-platform__tab' + (active ? ' is-active' : '')}
                                aria-pressed={active}
                                onClick={() => setViewPlatformId(platform.id)}
                              >
                                <span>{platform.label}</span>
                                {hasSelected && (
                                  <span className="acd-platform__tick" title="已有勾选店铺">
                                    <IconTick />
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                        <div className="acd-store-groups">
                          <div className="acd-store-group">
                            <div className="acd-store-group__head">
                              <span className="acd-store-group__title">{currentPlatform.label}</span>
                              <Checkbox
                                checked={allCurrent}
                                indeterminate={!allCurrent && someCurrent}
                                onChange={() => togglePlatformStores({ id: currentPlatform.id, stores: platformStores })}
                              >
                                全选
                              </Checkbox>
                            </div>
                            <div className="acd-group">
                              {platformStores.map((name) => {
                                const key = `${currentPlatform.id}::${name}`;
                                return (
                                  <Checkbox
                                    key={key}
                                    className="acd-check--chip"
                                    checked={selected.includes(key)}
                                    onChange={() => toggleStore(key)}
                                  >
                                    {name}
                                  </Checkbox>
                                );
                              })}
                            </div>
                            {platformStores.length === 0 ? (
                              <span className="acd-group__empty">没有匹配的店铺</span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="acd-panel acd-panel--origin" data-annotation-id="origin-store-tip">
                      所选 {count} 条商品会分别克隆回它当前所在的店铺，无需选择目标店铺。
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
                              <span
                                className="acd-label-tip"
                                data-tip="每生成一次消耗 xx 算力"
                                aria-label="每生成一次消耗 xx 算力"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                              >
                                <span className="acd-label-tip__icon">?</span>
                              </span>
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
                        已选商品 <strong>{count}</strong> 条
                      </>
                    )}
                  </div>
                  <div className="acd-footer__right">
                    <button type="button" className="acd-btn" onClick={onClose}>
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

      {toast ? <div className="acd-toast">{toast}</div> : null}
    </>
  );
};

export default AiCloneDialog;
