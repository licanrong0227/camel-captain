/**
 * SKU 图片更新弹窗：按规格值逐张预览，支持批量上传、拖动交换、单张删除。
 */

import React, { useEffect, useRef, useState } from 'react';
import { Check, GripVertical, Image as ImageIcon, Trash2, Upload, X } from 'lucide-react';
import '../sku-images.css';

export type SkuImageItem = {
  name: string;
  image: string | null;
};

export default function SkuImageUpdateDialog({
  values,
  onClose,
  onConfirm,
  onToast,
}: {
  values: SkuImageItem[];
  onClose: () => void;
  onConfirm: (next: SkuImageItem[]) => void;
  onToast: (message: string) => void;
}) {
  const [items, setItems] = useState<SkuImageItem[]>(() => values.map((item) => ({ ...item })));
  const [selected, setSelected] = useState<number[]>([]);
  const [dragFrom, setDragFrom] = useState(-1);
  const [dragOver, setDragOver] = useState(-1);
  const fileRef = useRef<HTMLInputElement>(null);
  const objectUrls = useRef<string[]>([]);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRef.current();
    };
    window.addEventListener('keydown', onKeyDown);
    const urls = objectUrls;
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      urls.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const setImage = (index: number, image: string | null) => {
    setItems((list) => list.map((item, itemIndex) => (itemIndex === index ? { ...item, image } : item)));
  };

  const emptyIndexes = items
    .map((item, index) => (item.image ? -1 : index))
    .filter((index) => index >= 0);
  const allSelected = items.length > 0 && selected.length === items.length;
  const someSelected = selected.length > 0 && !allSelected;

  const toggleCard = (index: number) => {
    setSelected((list) => (list.includes(index) ? list.filter((item) => item !== index) : [...list, index]));
  };

  const toggleAll = () => {
    setSelected(allSelected ? [] : items.map((_, index) => index));
  };

  const selectEmpty = () => {
    setSelected(emptyIndexes);
  };

  const handleUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (items.length === 0) {
      onToast('当前规格下暂无规格值');
      return;
    }
    if (selected.length === 0) {
      onToast('请先选择SKU');
      return;
    }
    const urls = Array.from(files).map((file) => URL.createObjectURL(file));
    objectUrls.current.push(...urls);
    const targets = [...selected];
    const count = Math.min(urls.length, targets.length);
    setItems((list) =>
      list.map((item, index) => {
        const position = targets.indexOf(index);
        return position >= 0 && position < count ? { ...item, image: urls[position] } : item;
      }),
    );
    const uploaded = new Set(targets.slice(0, count));
    setSelected((list) => list.filter((index) => !uploaded.has(index)));
    onToast(
      urls.length > targets.length
        ? `已按顺序替换 ${count} 张图片，多余 ${urls.length - targets.length} 张未使用`
        : `已按顺序替换 ${count} 张图片`,
    );
  };

  const handleDrop = (index: number) => {
    if (dragFrom < 0 || dragFrom === index) {
      setDragFrom(-1);
      setDragOver(-1);
      return;
    }
    setItems((list) =>
      list.map((item, itemIndex) => {
        if (itemIndex === dragFrom) return { ...item, image: list[index].image };
        if (itemIndex === index) return { ...item, image: list[dragFrom].image };
        return item;
      }),
    );
    setDragFrom(-1);
    setDragOver(-1);
  };

  return (
    <div className="si-mask">
      <div className="si-dialog" role="dialog" aria-modal="true" aria-label="SKU图片更新">
        <header className="si-head">
          <h3 className="si-title">SKU图片更新</h3>
          <button type="button" className="si-close" aria-label="关闭" onClick={onClose}>
            <X size={16} />
          </button>
        </header>

        <div className="si-body">
          <div className="si-toolbar">
            <span className="si-tip">点击图片选择，拖动图片左侧图标调整排序，点击右侧图标删除</span>
            <button
              type="button"
              className="si-upload"
              disabled={selected.length === 0}
              title={selected.length === 0 ? '请先选择SKU' : undefined}
              onClick={() => fileRef.current?.click()}
            >
              <Upload size={14} />
              批量上传
            </button>
          </div>

          {items.length > 0 && (
            <div className="si-selectbar">
              <label className="si-check">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                <span className={`si-check__box ${someSelected ? 'is-indeterminate' : ''}`.trim()} />
                <span className="si-check__label">全选</span>
              </label>
              <button
                type="button"
                className="si-pick-empty"
                disabled={emptyIndexes.length === 0}
                onClick={selectEmpty}
              >
                选中无图SKU
              </button>
              <span className="si-selected-count">已选 {selected.length} 个</span>
            </div>
          )}

          {items.length === 0 ? (
            <div className="si-empty">当前规格下暂无规格值</div>
          ) : (
            <div className="si-grid">
              {items.map((item, index) => (
                <div className="si-card" key={`${item.name}-${index}`}>
                  <div className="si-name" title={item.name}>
                    {item.name || '未命名'}
                  </div>
                  <div
                    className={`si-slot${item.image ? '' : ' is-empty'}${selected.includes(index) ? ' is-selected' : ''}${dragOver === index ? ' is-drag-over' : ''}`}
                    role="button"
                    tabIndex={0}
                    aria-pressed={selected.includes(index)}
                    aria-label={`选择 ${item.name || '未命名'}`}
                    onClick={() => toggleCard(index)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        toggleCard(index);
                      }
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setDragOver(index);
                    }}
                    onDragLeave={() => setDragOver((prev) => (prev === index ? -1 : prev))}
                    onDrop={(event) => {
                      event.preventDefault();
                      handleDrop(index);
                    }}
                  >
                    {item.image ? (
                      <>
                        <img src={item.image} alt="" />
                        <span
                          className="si-drag"
                          draggable
                          title="拖动调整排序"
                          onClick={(event) => event.stopPropagation()}
                          onDragStart={(event) => {
                            setDragFrom(index);
                            event.dataTransfer.effectAllowed = 'move';
                            event.dataTransfer.setData('text/plain', String(index));
                          }}
                          onDragEnd={() => {
                            setDragFrom(-1);
                            setDragOver(-1);
                          }}
                        >
                          <GripVertical size={12} />
                        </span>
                        <button
                          type="button"
                          className="si-delete"
                          aria-label="删除图片"
                          onClick={(event) => {
                            event.stopPropagation();
                            setImage(index, null);
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </>
                    ) : (
                      <span className="si-placeholder">
                        <ImageIcon size={26} />
                        暂无图片
                      </span>
                    )}
                    {selected.includes(index) && (
                      <span className="si-selected-mark" aria-hidden="true">
                        <Check size={12} />
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <input
            ref={fileRef}
            className="si-file"
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => {
              handleUpload(event.target.files);
              event.target.value = '';
            }}
          />
        </div>

        <footer className="si-foot">
          <button type="button" className="si-btn" onClick={onClose}>
            取消
          </button>
          <button
            type="button"
            className="si-btn si-btn--primary"
            onClick={() => onConfirm(items.map((item) => ({ name: item.name, image: item.image })))}
          >
            确认
          </button>
        </footer>
      </div>
    </div>
  );
}
