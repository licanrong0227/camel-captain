/**
 * 添加系统规格值弹窗：从平台提供的规格值中多选，已添加的置灰不可选。
 */

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import './system-spec-value.css';

export type SystemSpecOption = { cn: string; name: string; hex?: string; swatch?: 'transparent' | 'multicolor' };

export default function SystemSpecValueDialog({
  specName,
  options,
  existing,
  onClose,
  onConfirm,
  onToast,
}: {
  specName: string;
  options: SystemSpecOption[];
  existing: string[];
  onClose: () => void;
  onConfirm: (names: string[]) => void;
  onToast: (message: string) => void;
}) {
  const [picked, setPicked] = useState<number[]>([]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const isExisting = (name: string) => existing.includes(name);
  const selectable = options.map((_, index) => index).filter((index) => !isExisting(options[index].name));
  const allPicked = selectable.length > 0 && picked.length === selectable.length;

  const toggle = (index: number) => {
    if (isExisting(options[index].name)) return;
    setPicked((list) => (list.includes(index) ? list.filter((item) => item !== index) : [...list, index]));
  };

  const confirm = () => {
    if (picked.length === 0) {
      onToast('请至少选择一个规格值');
      return;
    }
    onConfirm(picked.map((index) => options[index].name));
  };

  return (
    <div className="ssv-mask">
      <div className="ssv-dialog" role="dialog" aria-modal="true" aria-label="添加系统规格值">
        <header className="ssv-head">
          <h3 className="ssv-title">添加系统规格值</h3>
          <button type="button" className="ssv-close" aria-label="关闭" onClick={onClose}>
            <X size={16} />
          </button>
        </header>

        <div className="ssv-sub">
          当前规格：<span className="ssv-sub__name">{specName}</span>
        </div>

        <div className="ssv-body">
          <div className="ssv-row ssv-row--head">
            <label className="ssv-check">
              <input
                type="checkbox"
                checked={allPicked}
                onChange={() => setPicked(allPicked ? [] : selectable)}
                aria-label="全选规格值"
              />
              <span className="ssv-check__box" />
            </label>
            <span className="ssv-index">序号</span>
            <span className="ssv-value">规格值</span>
          </div>
          {options.map((option, index) => {
            const added = isExisting(option.name);
            return (
              <label className={added ? 'ssv-row is-existing' : 'ssv-row'} key={option.name}>
                <span className="ssv-check">
                  <input
                    type="checkbox"
                    checked={picked.includes(index)}
                    disabled={added}
                    onChange={() => toggle(index)}
                    aria-label={`选择规格值 ${option.cn}`}
                  />
                  <span className="ssv-check__box" />
                </span>
                <span className="ssv-index">{index + 1}</span>
                <span className="ssv-value">
                  {(option.hex || option.swatch) && (
                    <span
                      className={
                        option.swatch ? `ssv-swatch is-${option.swatch}` : 'ssv-swatch'
                      }
                      style={option.hex ? { background: option.hex } : undefined}
                      aria-hidden="true"
                    />
                  )}
                  {option.cn}
                  <span className="ssv-value__en">（{option.name}）</span>
                </span>
                {added && <span className="ssv-added">已添加</span>}
              </label>
            );
          })}
        </div>

        <footer className="ssv-foot">
          <button type="button" className="ssv-btn" onClick={onClose}>
            取消
          </button>
          <button type="button" className="ssv-btn ssv-btn--primary" onClick={confirm}>
            确定
          </button>
        </footer>
      </div>
    </div>
  );
}
