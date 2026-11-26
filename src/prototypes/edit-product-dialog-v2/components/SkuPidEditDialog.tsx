/**
 * Pid 编码编辑弹窗：逐 SKU 维护制造商 / 国际标准 / 商家产品识别码。
 */

import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import '../sku-pid.css';
import type { SkuRow } from './SkuBatchEditDialog';

export default function SkuPidEditDialog({
  rows,
  onClose,
  onApply,
  onToast,
}: {
  rows: SkuRow[];
  onClose: () => void;
  onApply: (rows: SkuRow[]) => void;
  onToast: (message: string) => void;
}) {
  const [items, setItems] = useState<SkuRow[]>(() => rows.map((row) => ({ ...row })));
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRef.current();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const patch = (row: number, changes: Partial<SkuRow>) => {
    setItems((list) => list.map((item) => (item.row === row ? { ...item, ...changes } : item)));
  };

  return (
    <div className="spid-mask">
      <div className="spid-dialog" role="dialog" aria-modal="true" aria-label="编辑Pid编码">
        <header className="spid-head">
          <h3 className="spid-title">编辑Pid编码</h3>
          <button type="button" className="spid-close" aria-label="关闭" onClick={onClose}>
            <X size={16} />
          </button>
        </header>

        <div className="spid-body">
          <div className="spid-tip">
            Pid 编码均为选填；商家产品识别码(mPid) 按 SKU编码自动获取，不可编辑。
          </div>
          <div className="spid-table-wrap">
            <div className="spid-table">
              <div className="spid-head-row">
                <span>图片</span>
                <span>Color（颜色）</span>
                <span>Options</span>
                <span>制造商产品识别码(nsPid)</span>
                <span>国际标准商品编码(sPid)</span>
                <span>商家产品识别码(mPid)</span>
              </div>
              {items.map((row) => (
                <div className="spid-row" key={row.row}>
                  <span className="spid-img">
                    <img src={row.img} alt="" />
                  </span>
                  <span className="spid-text" title={row.color}>
                    {row.color}
                  </span>
                  <span className="spid-text" title={row.option}>
                    {row.option}
                  </span>
                  <span>
                    <input
                      className="spid-input"
                      maxLength={100}
                      placeholder="请输入"
                      value={row.nsPid}
                      onChange={(event) => patch(row.row, { nsPid: event.target.value })}
                    />
                  </span>
                  <span>
                    <input
                      className="spid-input"
                      maxLength={100}
                      placeholder="请输入"
                      value={row.sPid}
                      onChange={(event) => patch(row.row, { sPid: event.target.value })}
                    />
                  </span>
                  <span>
                    <input
                      className="spid-input"
                      maxLength={100}
                      placeholder="自动获取"
                      readOnly
                      value={row.skuCode}
                    />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <footer className="spid-foot">
          <button type="button" className="spid-btn" onClick={onClose}>
            取消
          </button>
          <button
            type="button"
            className="spid-btn spid-btn--primary"
            onClick={() => {
              onApply(items);
              onToast('Pid编码已保存');
              onClose();
            }}
          >
            保存
          </button>
        </footer>
      </div>
    </div>
  );
}
