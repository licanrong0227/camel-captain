/**
 * 主图拼图弹窗：以开源 easy-collage 页面为基底改造。
 * 支持可选图片选中/拖拽入格、格内滚轮缩放与拖拽平移、格子间拖拽换位、悬停删除。
 */

import React from 'react';
import '../collage.css';

import UploadImageDialog from './UploadImageDialog';

import sample01 from '../assets/samples/sample-01.jpg';
import sample02 from '../assets/samples/sample-02.jpg';
import sample03 from '../assets/samples/sample-03.jpg';
import sample04 from '../assets/samples/sample-04.jpg';
import sample05 from '../assets/samples/sample-05.jpg';
import sample06 from '../assets/samples/sample-06.jpg';
import sample07 from '../assets/samples/sample-07.jpg';
import sample08 from '../assets/samples/sample-08.jpg';
import sample09 from '../assets/samples/sample-09.jpg';
import sample10 from '../assets/samples/sample-10.jpg';
import sample11 from '../assets/samples/sample-11.jpg';
import sample12 from '../assets/samples/sample-12.jpg';
import sample13 from '../assets/samples/sample-13.jpg';
import sample14 from '../assets/samples/sample-14.jpg';
import sample15 from '../assets/samples/sample-15.jpg';

const SAMPLE_IMAGES = [
  { id: 'sample-01', src: sample01, size: '800*800', group: '主图' },
  { id: 'sample-02', src: sample02, size: '800*800', group: '主图' },
  { id: 'sample-03', src: sample03, size: '800*800', group: '主图' },
  { id: 'sample-04', src: sample04, size: '800*800', group: '主图' },
  { id: 'sample-05', src: sample05, size: '800*800', group: '主图' },
  { id: 'sample-06', src: sample06, size: '800*800', group: 'SKU图片' },
  { id: 'sample-07', src: sample07, size: '800*800', group: 'SKU图片' },
  { id: 'sample-08', src: sample08, size: '800*800', group: 'SKU图片' },
  { id: 'sample-09', src: sample09, size: '800*800', group: 'SKU图片' },
  { id: 'sample-10', src: sample10, size: '800*800', group: 'SKU图片' },
  { id: 'sample-11', src: sample11, size: '800*800', group: '详情图' },
  { id: 'sample-12', src: sample12, size: '800*800', group: '详情图' },
  { id: 'sample-13', src: sample13, size: '800*800', group: '详情图' },
  { id: 'sample-14', src: sample14, size: '800*800', group: '详情图' },
  { id: 'sample-15', src: sample15, size: '800*800', group: '详情图' },
];

type IconProps = { size?: number; stroke?: number };

function IconClose({ size = 16, stroke = 1.8 }: IconProps) {
  return (
    <svg className="cp-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function IconChevronDown({ size = 16, stroke = 1.8 }: IconProps) {
  return (
    <svg className="cp-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function IconDownload({ size = 18, stroke = 1.7 }: IconProps) {
  return (
    <svg className="cp-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M7 10l5 5 5-5" />
      <path d="M12 15V3" />
    </svg>
  );
}

function IconUpload({ size = 14, stroke = 1.8 }: IconProps) {
  return (
    <svg className="cp-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M7 8l5-5 5 5" />
      <path d="M12 3v12" />
    </svg>
  );
}

function IconTrash({ size = 12, stroke = 1.8 }: IconProps) {
  return (
    <svg className="cp-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
  );
}

function IconMove({ size = 14, stroke = 1.8 }: IconProps) {
  return (
    <svg className="cp-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20M2 12h20" />
      <path d="m8 6 4-4 4 4M8 18l4 4 4-4M6 8l-4 4 4 4M18 8l4 4-4 4" />
    </svg>
  );
}

function IconCheck({ size = 12, stroke = 2.4 }: IconProps) {
  return (
    <svg className="cp-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

type Cell = { flex?: number };
type Row = { flex?: number; cells: Cell[] };
type Template = { key: string; rows: Row[] };

const row = (...flex: number[]): Row => ({
  flex: Math.max(...flex),
  cells: flex.map((f) => ({ flex: f })),
});

const TEMPLATES: Record<string, Template[]> = {
  '2': [
    { key: '2-1', rows: [row(1), row(1)] },
    { key: '2-2', rows: [row(1, 1)] },
  ],
  '3': [
    { key: '3-1', rows: [row(1), row(1), row(1)] },
    { key: '3-2', rows: [{ flex: 2, cells: [{ flex: 1 }, { flex: 1 }] }, row(1)] },
  ],
  '4': [
    { key: '4-1', rows: [row(1, 1), row(1, 1)] },
    { key: '4-2', rows: [row(1), row(1, 1, 1)] },
  ],
  '5': [
    { key: '5-1', rows: [row(1, 1), row(1, 1, 1)] },
    { key: '5-2', rows: [{ flex: 3, cells: [{ flex: 2 }, { flex: 1 }] }, row(1, 1, 1)] },
  ],
  '7': [
    {
      key: '7-1',
      rows: [{ flex: 4, cells: [{ flex: 1 }, { flex: 2 }, { flex: 1 }] }],
    },
    {
      key: '7-2',
      rows: [row(1, 1, 1), { flex: 2.4, cells: [{ flex: 1 }] }],
    },
    {
      key: '7-3',
      rows: [
        { flex: 2, cells: [{ flex: 1 }] },
        row(1, 1, 1),
        row(1, 1, 1),
      ],
    },
  ],
  '8': [
    {
      key: '8-1',
      rows: [{ flex: 3, cells: [{ flex: 1 }, { flex: 1 }, { flex: 1 }, { flex: 1 }] }],
    },
    {
      key: '8-2',
      rows: [
        { flex: 4, cells: [{ flex: 1 }, { flex: 2 }, { flex: 1 }] },
        { flex: 1.4, cells: [{ flex: 1 }] },
      ],
    },
    {
      key: '8-3',
      rows: [
        { flex: 3, cells: [{ flex: 1 }, { flex: 2 }] },
        { flex: 2, cells: [{ flex: 1 }, { flex: 1 }, { flex: 1 }] },
      ],
    },
  ],
  '9': [
    { key: '9-1', rows: [row(1, 1, 1), row(1, 1, 1), row(1, 1, 1)] },
    { key: '9-2', rows: [row(1, 1), row(1, 1), row(1, 1), row(1, 1)] },
  ],
};

function TemplateThumb({ tpl, active }: { tpl: Template; active?: boolean }) {
  return (
    <div className={active ? 'cp-tpl cp-tpl--active' : 'cp-tpl'}>
      {tpl.rows.map((r, i) => (
        <div className="cp-tpl__row" key={i} style={{ flex: r.flex }}>
          {r.cells.map((c, j) => (
            <div className="cp-tpl__cell" key={j} style={{ flex: c.flex }} />
          ))}
        </div>
      ))}
    </div>
  );
}

const SLOT_COUNT = 9;

type Slot = { src: string; scale: number; x: number; y: number } | null;

const emptySlots = (): Slot[] => Array.from({ length: SLOT_COUNT }, () => null);

function parseDrop(e: React.DragEvent): { sampleSrc?: string; fromIndex?: number } {
  const from = e.dataTransfer.getData('text/cp-slot');
  if (from !== '') return { fromIndex: Number(from) };
  const src = e.dataTransfer.getData('text/cp-sample');
  if (src) return { sampleSrc: src };
  return {};
}

function SlotCell({
  index,
  slot,
  onDropSrc,
  onDropFromSlot,
  onRemove,
  onSetView,
  onPick,
}: {
  index: number;
  slot: Slot;
  onDropSrc: (src: string) => void;
  onDropFromSlot: (fromIndex: number) => void;
  onRemove: () => void;
  onSetView: (patch: { scale?: number; x?: number; y?: number }) => void;
  onPick: () => void;
}) {
  const dragRef = React.useRef<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null);
  const boxRef = React.useRef<HTMLDivElement>(null);
  const imgRef = React.useRef<HTMLImageElement>(null);

  const clamp = (s: number, x: number, y: number) => {
    const el = boxRef.current;
    if (!el) return { x: 0, y: 0 };
    const r = el.getBoundingClientRect();
    const mx = Math.max(0, (r.width * (s - 1)) / 2);
    const my = Math.max(0, (r.height * (s - 1)) / 2);
    return { x: Math.min(mx, Math.max(-mx, x)), y: Math.min(my, Math.max(-my, y)) };
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const { sampleSrc, fromIndex } = parseDrop(e);
    if (fromIndex !== undefined) {
      if (fromIndex !== index) onDropFromSlot(fromIndex);
    } else if (sampleSrc) {
      onDropSrc(sampleSrc);
    }
  };

  if (!slot) {
    return (
      <div
        className="cp-slot"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={onPick}
      >
        <span className="cp-slot__plus">+</span>
        <span className="cp-slot__text">点击添加图片或从可选图片拖放到此处</span>
      </div>
    );
  }

  return (
    <div
      ref={boxRef}
      className="cp-slot cp-slot--filled"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onWheel={(e) => {
        const next = Math.min(3, Math.max(1, slot.scale + (e.deltaY < 0 ? 0.1 : -0.1)));
        if (next === 1) onSetView({ scale: 1, x: 0, y: 0 });
        else onSetView({ scale: next, ...clamp(next, slot.x, slot.y) });
      }}
      onPointerDown={(e) => {
        if (slot.scale <= 1) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        dragRef.current = { startX: e.clientX, startY: e.clientY, baseX: slot.x, baseY: slot.y };
      }}
      onPointerMove={(e) => {
        const d = dragRef.current;
        if (!d) return;
        onSetView(clamp(slot.scale, d.baseX + (e.clientX - d.startX), d.baseY + (e.clientY - d.startY)));
      }}
      onPointerUp={() => {
        dragRef.current = null;
      }}
    >
      <img
        ref={imgRef}
        className="cp-slot__img"
        src={slot.src}
        alt=""
        draggable={false}
        style={{ transform: `translate(${slot.x}px, ${slot.y}px) scale(${slot.scale})` }}
      />
      <span
        className="cp-drag"
        draggable
        aria-label="拖拽到其它格子"
        onPointerDown={(e) => e.stopPropagation()}
        onDragStart={(e) => {
          e.dataTransfer.setData('text/cp-slot', String(index));
          const img = imgRef.current;
          if (img) {
            const r = img.getBoundingClientRect();
            e.dataTransfer.setDragImage(img, r.width / 2, r.height / 2);
          }
        }}
      >
        <IconMove />
      </span>
      <button
        className="cp-del"
        type="button"
        aria-label="删除图片"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
      >
        <IconTrash />
      </button>
    </div>
  );
}

export default function CollageDialog({ open, onClose, mainCount = 5, mainLimit = 8 }: { open: boolean; onClose: () => void; mainCount?: number; mainLimit?: number }) {
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [slots, setSlots] = React.useState<Slot[]>(emptySlots);
  const [samples, setSamples] = React.useState<{ id: string; src: string; size: string; group: string }[]>(SAMPLE_IMAGES);
  const [selected, setSelected] = React.useState<string[]>([]);

  if (!open) return null;

  const emptyCount = slots.filter((s) => s === null).length;
  const selectableCount = Math.min(emptyCount, samples.length);
  const allSelected = selectableCount > 0 && selected.length >= selectableCount;

  const placeInSlot = (index: number, src: string) => {
    setSlots((prev) => prev.map((s, i) => (i === index ? { src, scale: 1, x: 0, y: 0 } : s)));
  };

  const moveOrSwap = (fromIndex: number, toIndex: number) => {
    setSlots((prev) => {
      const next = [...prev];
      const tmp = next[toIndex];
      next[toIndex] = next[fromIndex];
      next[fromIndex] = tmp;
      return next;
    });
  };

  const removeSlot = (index: number) => {
    setSlots((prev) => prev.map((s, i) => (i === index ? null : s)));
  };

  const setSlotView = (index: number, patch: { scale?: number; x?: number; y?: number }) => {
    setSlots((prev) => prev.map((s, i) => (i === index && s ? { ...s, ...patch } : s)));
  };

  const deleteSample = (id: string) => {
    setSamples((prev) => prev.filter((s) => s.id !== id));
    setSelected((prev) => prev.filter((x) => x !== id));
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= emptyCount) return prev;
      return [...prev, id];
    });
  };

  const toggleSelectAll = () => {
    setSelected(() => (allSelected ? [] : samples.slice(0, selectableCount).map((s) => s.id)));
  };

  const importSelected = () => {
    if (!selected.length) return;
    const srcById = new Map(samples.map((s) => [s.id, s.src]));
    const picked = selected.map((id) => srcById.get(id)).filter(Boolean) as string[];
    setSlots((prev) => {
      const next = [...prev];
      let k = 0;
      for (let i = 0; i < next.length && k < picked.length; i++) {
        if (next[i] === null) next[i] = { src: picked[k++], scale: 1, x: 0, y: 0 };
      }
      return next;
    });
    setSelected([]);
  };

  return (
    <div className="cp-mask">
      <div className="cp-dialog" role="dialog" aria-modal="true" aria-label="主图拼图">
        <div className="cp-chrome" data-annotation-id="collage-embed-source">
          <h2 className="cp-chrome__title">主图拼图</h2>
          <button className="cp-chrome__close" type="button" aria-label="关闭" onClick={onClose}>
            <IconClose />
          </button>
        </div>

        <aside className="cp-sidebar">
          <h3 className="cp-sidebar__title">选择模板</h3>
          <div className="cp-counts">
            {['2', '3', '4', '5'].map((n) => (
              <span className="cp-count" key={n}>{n}</span>
            ))}
            <span className="cp-count cp-count--active">
              7
              <IconChevronDown size={14} />
            </span>
          </div>

          {Object.entries(TEMPLATES).map(([count, tpls]) => (
            <React.Fragment key={count}>
              <div className="cp-group">
                <span className="cp-group__num">{count}</span>
                <span>张</span>
              </div>
              <div className="cp-tpl-row">
                {tpls.map((tpl) => (
                  <TemplateThumb tpl={tpl} key={tpl.key} active={tpl.key === '7-3'} />
                ))}
              </div>
            </React.Fragment>
          ))}
        </aside>

        <div className="cp-main">
          <div className="cp-stage">
            <div className="cp-canvas">
              <div className="cp-canvas__grid" data-annotation-id="collage-slot-interaction">
                {slots.map((slot, i) => (
                  <SlotCell
                    key={i}
                    index={i}
                    slot={slot}
                    onDropSrc={(src) => placeInSlot(i, src)}
                    onDropFromSlot={(from) => moveOrSwap(from, i)}
                    onRemove={() => removeSlot(i)}
                    onSetView={(patch) => setSlotView(i, patch)}
                    onPick={() => setUploadOpen(true)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="cp-toolbar">
            <button className="cp-tool cp-tool--light" type="button" onClick={() => setSlots(emptySlots())}>
              <span>清空</span>
            </button>
            <button className="cp-tool cp-tool--light" type="button">
              <IconDownload />
              <span>导出</span>
            </button>
            <button className="cp-tool cp-tool--primary" type="button" data-annotation-id="collage-upload-main" onClick={() => {
              if (mainCount >= mainLimit) {
                setConfirmOpen(true);
              } else {
                onClose();
              }
            }}>
              <IconUpload />
              <span>上传到主图</span>
            </button>
          </div>
        </div>

        <aside className="cp-panel">
          <div className="cp-panel__body">
            <div className="cp-panel__head">
              <h3 className="cp-panel__title">可选图片</h3>
              <button className="cp-panel__upload" type="button" onClick={() => setUploadOpen(true)}>
                <IconUpload />
                <span>上传</span>
              </button>
            </div>

            <label className={selectableCount > 0 ? 'cp-selectall' : 'cp-selectall cp-selectall--off'}>
              <span
                className={allSelected ? 'cp-check cp-check--on' : 'cp-check'}
                role="checkbox"
                aria-checked={allSelected}
                onClick={toggleSelectAll}
              >
                {allSelected && <IconCheck />}
              </span>
              <span onClick={toggleSelectAll}>全选</span>
            </label>

            <div className="cp-samples" data-annotation-id="collage-sample-interaction">
              {(() => {
                const groups = ['主图', 'SKU图片', '详情图'];
                return groups.map((group) => {
                  const groupImgs = samples.filter((s) => s.group === group);
                  if (groupImgs.length === 0) return null;
                  return (
                    <React.Fragment key={group}>
                      <div className="cp-samples__group">
                        <span className="cp-samples__group-title">{group}</span>
                      </div>
                      {groupImgs.map((img) => {
                        const isSelected = selected.includes(img.id);
                        const isDisabled = !isSelected && selected.length >= emptyCount;
                        const cls = ['cp-sample'];
                        if (isSelected) cls.push('cp-sample--selected');
                        if (isDisabled) cls.push('cp-sample--disabled');
                        return (
                          <div
                            className={cls.join(' ')}
                            key={img.id}
                            draggable={!isDisabled}
                            onDragStart={(e) => e.dataTransfer.setData('text/cp-sample', img.src)}
                            onClick={() => !isDisabled && toggleSelect(img.id)}
                          >
                            <img className="cp-sample__img" src={img.src} alt="" />
                            <span className="cp-sample__badge">{img.size}</span>
                            <span className={isSelected ? 'cp-check cp-check--on' : 'cp-check'}>
                              {isSelected && <IconCheck />}
                            </span>
                            <button
                              className="cp-del"
                              type="button"
                              aria-label="删除可选图片"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteSample(img.id);
                              }}
                            >
                              <IconTrash />
                            </button>
                          </div>
                        );
                      })}
                    </React.Fragment>
                  );
                });
              })()}
            </div>
          </div>

          <div className="cp-panel__foot">
            <button
              className="cp-import"
              type="button"
              disabled={selected.length === 0}
              onClick={importSelected}
            >
              导入已选图片
            </button>
          </div>
        </aside>
      </div>

      <UploadImageDialog open={uploadOpen} onClose={() => setUploadOpen(false)} />

      {confirmOpen && (
        <div className="cp-confirm-mask">
          <div className="cp-confirm" role="alertdialog" aria-modal="true" aria-label="提示">
            <div className="cp-confirm__head">
              <span className="cp-confirm__title">提示</span>
              <button className="cp-confirm__close" type="button" aria-label="关闭" onClick={() => setConfirmOpen(false)}>
                <IconClose />
              </button>
            </div>
            <p className="cp-confirm__text">主图上传数量已达上限，是否继续上传并替换掉最后一张主图</p>
            <div className="cp-confirm__foot">
              <button className="cp-confirm__btn cp-confirm__btn--ghost" type="button" onClick={() => setConfirmOpen(false)}>
                关闭
              </button>
              <button
                className="cp-confirm__btn cp-confirm__btn--primary"
                type="button"
                onClick={() => setConfirmOpen(false)}
              >
                上传并替换
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
