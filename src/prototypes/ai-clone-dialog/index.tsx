/**
 * @name AI克隆弹窗 - 我的商品
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnnotationViewer, type AnnotationSourceDocument } from '@axhub/annotation';
import annotationSourceDocument from './annotation-source.json';
import './style.css';

const STORES = ['sneakerhub8', 'clothes', '鞋子', '包包'];
const PRODUCT_COUNT = 10;

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

const Radio = ({ checked, onChange, children }: { checked: boolean; onChange: () => void; children: React.ReactNode }) => (
  <label className={`acd-radio${checked ? ' is-checked' : ''}`}>
    <input type="radio" className="acd-radio__input" checked={checked} onChange={onChange} />
    <span className="acd-radio__box" />
    <span className="acd-radio__text">{children}</span>
  </label>
);

const AiCloneDialog = () => {
  const [visible, setVisible] = useState(true);
  const [mode, setMode] = useState<'target' | 'origin'>('target');
  const [keyword, setKeyword] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [shuffleMainImage, setShuffleMainImage] = useState(false);
  const [regenerateTitle, setRegenerateTitle] = useState(false);
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

  const submit = (action: 'clone' | 'publish') => {
    if (mode === 'target' && selected.length === 0) {
      setToast('请先选择目标店铺');
      return;
    }
    const configs = [shuffleMainImage && '主图随机打乱', regenerateTitle && '标题 AI 重新生成'].filter(Boolean).join('、');
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
                  <div className="acd-config-list">
                    <div className="acd-config" data-annotation-id="config-shuffle-main-image">
                      <div>
                        <div className="acd-config__title">商品主图顺序随机打乱</div>
                        <div className="acd-config__desc">搬家时打乱主图顺序，降低重复铺货风险</div>
                      </div>
                      <Switch
                        ariaLabel="商品主图顺序随机打乱"
                        checked={shuffleMainImage}
                        onChange={() => setShuffleMainImage((prev) => !prev)}
                      />
                    </div>
                    <div className="acd-config" data-annotation-id="config-ai-title">
                      <div>
                        <div className="acd-config__title">商品标题 AI 重新生成</div>
                        <div className="acd-config__desc">使用 AI 重新生成标题，适配目标店铺风格</div>
                      </div>
                      <Switch
                        ariaLabel="商品标题 AI 重新生成"
                        checked={regenerateTitle}
                        onChange={() => setRegenerateTitle((prev) => !prev)}
                      />
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
