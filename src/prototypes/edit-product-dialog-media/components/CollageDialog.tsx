/**
 * 主图拼图弹窗：以开源 easy-collage 页面为基底改造。
 * 支持可选图片点击/拖拽入格、格内滚轮缩放与拖拽平移、悬停删除。
 */

import React from 'react';
import '../collage.css';

import UploadImageDialog from './UploadImageDialog';

import main1 from '../assets/main-1.png';
import main2 from '../assets/main-2.png';
import main3 from '../assets/main-3.png';
import main4 from '../assets/main-4.png';
import main5 from '../assets/main-5.png';

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

const SAMPLE_IMAGES = [
  { id: 'main-1', src: main1, size: '1200*1600' },
  { id: 'main-2', src: main2, size: '1200*1600' },
  { id: 'main-3', src: main3, size: '1200*1600' },
  { id: 'main-4', src: main4, size: '600*800' },
  { id: 'main-5', src: main5, size: '600*800' },
];

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

function SlotCell({
  slot,
  onDropSrc,
  onRemove,
  onSetView,
  onPick,
}: {
  slot: Slot;
  onDropSrc: (src: string) => void;
  onRemove: () => void;
  onSetView: (patch: { scale?: number; x?: number; y?: number }) => void;
  onPick: () => void;
}) {
  const dragRef = React.useRef<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null);

  if (!slot) {
    return (
      <div
        className="cp-slot"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const src = e.dataTransfer.getData('text/cp-sample');
          if (src) onDropSrc(src);
        }}
        onClick={onPick}
      >
        <span className="cp-slot__plus">+</span>
        <span className="cp-slot__text">点击添加图片或从可选图片拖放到此处</span>
      </div>
    );
  }

  return (
    <div
      className="cp-slot cp-slot--filled"
      onWheel={(e) => {
        const next = Math.min(3, Math.max(1, slot.scale + (e.deltaY < 0 ? 0.1 : -0.1)));
        onSetView(next === 1 ? { scale: 1, x: 0, y: 0 } : { scale: next });
      }}
      onPointerDown={(e) => {
        if (slot.scale <= 1) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        dragRef.current = { startX: e.clientX, startY: e.clientY, baseX: slot.x, baseY: slot.y };
      }}
      onPointerMove={(e) => {
        const d = dragRef.current;
        if (!d) return;
        onSetView({ x: d.baseX + (e.clientX - d.startX), y: d.baseY + (e.clientY - d.startY) });
      }}
      onPointerUp={() => {
        dragRef.current = null;
      }}
    >
      <img
        className="cp-slot__img"
        src={slot.src}
        alt=""
        draggable={false}
        style={{ transform: `translate(${slot.x}px, ${slot.y}px) scale(${slot.scale})` }}
      />
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

export default function CollageDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [slots, setSlots] = React.useState<Slot[]>(emptySlots);
  const [samples, setSamples] = React.useState(SAMPLE_IMAGES);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (!open) return null;

  const openFilePicker = () => fileInputRef.current?.click();

  const onFilesChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith('image/'));
    e.target.value = '';
    if (!files.length) return;
    setSlots((prev) => {
      const emptyCount = prev.filter((s) => s === null).length;
      const take = files.slice(0, emptyCount);
      let k = 0;
      return prev.map((s) => (s === null && k < take.length ? { src: URL.createObjectURL(take[k++]), scale: 1, x: 0, y: 0 } : s));
    });
  };

  const placeInSlot = (index: number, src: string) => {
    setSlots((prev) => prev.map((s, i) => (i === index ? { src, scale: 1, x: 0, y: 0 } : s)));
  };

  const removeSlot = (index: number) => {
    setSlots((prev) => prev.map((s, i) => (i === index ? null : s)));
  };

  const setSlotView = (index: number, patch: { scale?: number; x?: number; y?: number }) => {
    setSlots((prev) => prev.map((s, i) => (i === index && s ? { ...s, ...patch } : s)));
  };

  const deleteSample = (id: string) => {
    setSamples((prev) => prev.filter((s) => s.id !== id));
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
                    slot={slot}
                    onDropSrc={(src) => placeInSlot(i, src)}
                    onRemove={() => removeSlot(i)}
                    onSetView={(patch) => setSlotView(i, patch)}
                    onPick={openFilePicker}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="cp-toolbar">
            <button className="cp-tool cp-tool--light" type="button">
              <IconDownload />
              <span>导出</span>
            </button>
            <button className="cp-tool cp-tool--primary" type="button" onClick={() => setConfirmOpen(true)}>
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

            <div className="cp-samples" data-annotation-id="collage-sample-interaction">
              {samples.map((img) => (
                <div
                  className="cp-sample"
                  key={img.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('text/cp-sample', img.src)}
                >
                  <img className="cp-sample__img" src={img.src} alt="" />
                  <span className="cp-sample__badge">{img.size}</span>
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
              ))}
            </div>
          </div>
        </aside>
      </div>

      <UploadImageDialog open={uploadOpen} onClose={() => setUploadOpen(false)} />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={onFilesChosen}
      />

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
