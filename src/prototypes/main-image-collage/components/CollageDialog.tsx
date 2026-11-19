/**
 * 主图拼图弹窗：以开源 easy-collage 页面为基底改造。
 * 支持可选图片选中/拖拽入格、格内滚轮缩放与拖拽平移、格子间拖拽换位、悬停删除。
 * 模板由矩形分块数据驱动：左侧选模板/数字条切换分组时，画布格子数量与分块同步变化。
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
import sku01 from '../assets/sku/sku-01.jpg';
import sku02 from '../assets/sku/sku-02.jpg';
import sku03 from '../assets/sku/sku-03.jpg';
import sku04 from '../assets/sku/sku-04.jpg';
import sku05 from '../assets/sku/sku-05.jpg';
import sku06 from '../assets/sku/sku-06.jpg';
import sku07 from '../assets/sku/sku-07.jpg';
import sku08 from '../assets/sku/sku-08.jpg';
import sku09 from '../assets/sku/sku-09.jpg';
import sku10 from '../assets/sku/sku-10.jpg';
import sku11 from '../assets/sku/sku-11.jpg';
import sku12 from '../assets/sku/sku-12.jpg';
import sku13 from '../assets/sku/sku-13.jpg';
import sku14 from '../assets/sku/sku-14.jpg';
import sku15 from '../assets/sku/sku-15.jpg';
import sku16 from '../assets/sku/sku-16.jpg';
import sku17 from '../assets/sku/sku-17.jpg';
import sku18 from '../assets/sku/sku-18.jpg';
import sku19 from '../assets/sku/sku-19.jpg';
import sku20 from '../assets/sku/sku-20.jpg';
import sku21 from '../assets/sku/sku-21.jpg';
import sku22 from '../assets/sku/sku-22.jpg';
import sku23 from '../assets/sku/sku-23.jpg';
import sku24 from '../assets/sku/sku-24.jpg';
import sku25 from '../assets/sku/sku-25.jpg';
import sku26 from '../assets/sku/sku-26.jpg';
import sku27 from '../assets/sku/sku-27.jpg';
import sku28 from '../assets/sku/sku-28.jpg';
import sku29 from '../assets/sku/sku-29.jpg';
import sku30 from '../assets/sku/sku-30.jpg';
import sku31 from '../assets/sku/sku-31.jpg';
import sku32 from '../assets/sku/sku-32.jpg';
import sku33 from '../assets/sku/sku-33.jpg';
import sku34 from '../assets/sku/sku-34.jpg';
import sku35 from '../assets/sku/sku-35.jpg';
import sku36 from '../assets/sku/sku-36.jpg';
import sku37 from '../assets/sku/sku-37.jpg';
import sku38 from '../assets/sku/sku-38.jpg';
import sku39 from '../assets/sku/sku-39.jpg';
import sku40 from '../assets/sku/sku-40.jpg';
import sku41 from '../assets/sku/sku-41.jpg';
import sku42 from '../assets/sku/sku-42.jpg';
import sku43 from '../assets/sku/sku-43.jpg';
import sku44 from '../assets/sku/sku-44.jpg';
import sku45 from '../assets/sku/sku-45.jpg';
import sku46 from '../assets/sku/sku-46.jpg';
import sku47 from '../assets/sku/sku-47.jpg';
import sku48 from '../assets/sku/sku-48.jpg';
import sku49 from '../assets/sku/sku-49.jpg';
import sku50 from '../assets/sku/sku-50.jpg';
import sku51 from '../assets/sku/sku-51.jpg';
import sku52 from '../assets/sku/sku-52.jpg';
import sku53 from '../assets/sku/sku-53.jpg';
import sku54 from '../assets/sku/sku-54.jpg';
import sku55 from '../assets/sku/sku-55.jpg';
import sku56 from '../assets/sku/sku-56.jpg';
import sku57 from '../assets/sku/sku-57.jpg';
import sku58 from '../assets/sku/sku-58.jpg';
import sku59 from '../assets/sku/sku-59.jpg';
import sku60 from '../assets/sku/sku-60.jpg';
import sku61 from '../assets/sku/sku-61.jpg';
import sku62 from '../assets/sku/sku-62.jpg';
import sku63 from '../assets/sku/sku-63.jpg';
import sku64 from '../assets/sku/sku-64.jpg';
import sample12 from '../assets/samples/sample-12.jpg';
import sample13 from '../assets/samples/sample-13.jpg';
import sample14 from '../assets/samples/sample-14.jpg';
import sample15 from '../assets/samples/sample-15.jpg';

type SampleCategory = 'main' | 'promo' | 'sku' | 'detail';

const SAMPLE_SECTIONS: { key: SampleCategory; title: string }[] = [
  { key: 'main', title: '主图' },
  { key: 'promo', title: '站外推广图' },
  { key: 'sku', title: 'SKU图' },
  { key: 'detail', title: '详情图' },
];

const SAMPLE_IMAGES: { id: string; src: string; size: string; category: SampleCategory }[] = [
  { id: 'sample-01', src: sample01, size: '800*800', category: 'main' },
  { id: 'sample-02', src: sample02, size: '800*800', category: 'main' },
  { id: 'sample-03', src: sample03, size: '800*800', category: 'main' },
  { id: 'sample-04', src: sample04, size: '800*800', category: 'main' },
  { id: 'sample-05', src: sample05, size: '800*800', category: 'promo' },
  { id: 'sample-06', src: sample06, size: '800*800', category: 'promo' },
  { id: 'sample-07', src: sample07, size: '800*800', category: 'promo' },
  { id: 'sku-01', src: sku01, size: '800*800', category: 'sku' },
  { id: 'sku-02', src: sku02, size: '800*800', category: 'sku' },
  { id: 'sku-03', src: sku03, size: '800*800', category: 'sku' },
  { id: 'sku-04', src: sku04, size: '800*800', category: 'sku' },
  { id: 'sku-05', src: sku05, size: '800*800', category: 'sku' },
  { id: 'sku-06', src: sku06, size: '800*800', category: 'sku' },
  { id: 'sku-07', src: sku07, size: '800*800', category: 'sku' },
  { id: 'sku-08', src: sku08, size: '800*800', category: 'sku' },
  { id: 'sku-09', src: sku09, size: '800*800', category: 'sku' },
  { id: 'sku-10', src: sku10, size: '800*800', category: 'sku' },
  { id: 'sku-11', src: sku11, size: '800*800', category: 'sku' },
  { id: 'sku-12', src: sku12, size: '800*800', category: 'sku' },
  { id: 'sku-13', src: sku13, size: '800*800', category: 'sku' },
  { id: 'sku-14', src: sku14, size: '800*800', category: 'sku' },
  { id: 'sku-15', src: sku15, size: '800*800', category: 'sku' },
  { id: 'sku-16', src: sku16, size: '800*800', category: 'sku' },
  { id: 'sku-17', src: sku17, size: '800*800', category: 'sku' },
  { id: 'sku-18', src: sku18, size: '800*800', category: 'sku' },
  { id: 'sku-19', src: sku19, size: '800*800', category: 'sku' },
  { id: 'sku-20', src: sku20, size: '800*800', category: 'sku' },
  { id: 'sku-21', src: sku21, size: '800*800', category: 'sku' },
  { id: 'sku-22', src: sku22, size: '800*800', category: 'sku' },
  { id: 'sku-23', src: sku23, size: '800*800', category: 'sku' },
  { id: 'sku-24', src: sku24, size: '800*800', category: 'sku' },
  { id: 'sku-25', src: sku25, size: '800*800', category: 'sku' },
  { id: 'sku-26', src: sku26, size: '800*800', category: 'sku' },
  { id: 'sku-27', src: sku27, size: '800*800', category: 'sku' },
  { id: 'sku-28', src: sku28, size: '800*800', category: 'sku' },
  { id: 'sku-29', src: sku29, size: '800*800', category: 'sku' },
  { id: 'sku-30', src: sku30, size: '800*800', category: 'sku' },
  { id: 'sku-31', src: sku31, size: '800*800', category: 'sku' },
  { id: 'sku-32', src: sku32, size: '800*800', category: 'sku' },
  { id: 'sku-33', src: sku33, size: '800*800', category: 'sku' },
  { id: 'sku-34', src: sku34, size: '800*800', category: 'sku' },
  { id: 'sku-35', src: sku35, size: '800*800', category: 'sku' },
  { id: 'sku-36', src: sku36, size: '800*800', category: 'sku' },
  { id: 'sku-37', src: sku37, size: '800*800', category: 'sku' },
  { id: 'sku-38', src: sku38, size: '800*800', category: 'sku' },
  { id: 'sku-39', src: sku39, size: '800*800', category: 'sku' },
  { id: 'sku-40', src: sku40, size: '800*800', category: 'sku' },
  { id: 'sku-41', src: sku41, size: '800*800', category: 'sku' },
  { id: 'sku-42', src: sku42, size: '800*800', category: 'sku' },
  { id: 'sku-43', src: sku43, size: '800*800', category: 'sku' },
  { id: 'sku-44', src: sku44, size: '800*800', category: 'sku' },
  { id: 'sku-45', src: sku45, size: '800*800', category: 'sku' },
  { id: 'sku-46', src: sku46, size: '800*800', category: 'sku' },
  { id: 'sku-47', src: sku47, size: '800*800', category: 'sku' },
  { id: 'sku-48', src: sku48, size: '800*800', category: 'sku' },
  { id: 'sku-49', src: sku49, size: '800*800', category: 'sku' },
  { id: 'sku-50', src: sku50, size: '800*800', category: 'sku' },
  { id: 'sku-51', src: sku51, size: '800*800', category: 'sku' },
  { id: 'sku-52', src: sku52, size: '800*800', category: 'sku' },
  { id: 'sku-53', src: sku53, size: '800*800', category: 'sku' },
  { id: 'sku-54', src: sku54, size: '800*800', category: 'sku' },
  { id: 'sku-55', src: sku55, size: '800*800', category: 'sku' },
  { id: 'sku-56', src: sku56, size: '800*800', category: 'sku' },
  { id: 'sku-57', src: sku57, size: '800*800', category: 'sku' },
  { id: 'sku-58', src: sku58, size: '800*800', category: 'sku' },
  { id: 'sku-59', src: sku59, size: '800*800', category: 'sku' },
  { id: 'sku-60', src: sku60, size: '800*800', category: 'sku' },
  { id: 'sku-61', src: sku61, size: '800*800', category: 'sku' },
  { id: 'sku-62', src: sku62, size: '800*800', category: 'sku' },
  { id: 'sku-63', src: sku63, size: '800*800', category: 'sku' },
  { id: 'sku-64', src: sku64, size: '800*800', category: 'sku' },
  { id: 'sample-12', src: sample12, size: '800*800', category: 'detail' },
  { id: 'sample-13', src: sample13, size: '800*800', category: 'detail' },
  { id: 'sample-14', src: sample14, size: '800*800', category: 'detail' },
  { id: 'sample-15', src: sample15, size: '800*800', category: 'detail' },
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

type CellRect = { x: number; y: number; w: number; h: number };
type Template = { key: string; count: number; cells: CellRect[] };
type Row = { flex?: number; cells: { flex?: number }[] };

const CANVAS_SIZE = 605;
const CELL_GAP = 10;

const row = (...flex: number[]): Row => ({
  flex: Math.max(...flex),
  cells: flex.map((f) => ({ flex: f })),
});

const OLD_LAYOUTS: Record<string, { key: string; rows: Row[] }[]> = {
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
    { key: '7-1', rows: [row(1, 1), row(1, 1, 1), row(1, 1)] },
    { key: '7-2', rows: [row(1), row(1, 1, 1), row(1, 1, 1)] },
    { key: '7-3', rows: [row(1, 1, 1), row(1, 1), row(1, 1)] },
  ],
  '8': [
    { key: '8-1', rows: [row(1, 1, 1, 1), row(1, 1, 1, 1)] },
    { key: '8-2', rows: [row(1), row(1, 1, 1), row(1, 1, 1, 1)] },
    { key: '8-3', rows: [row(1, 1, 1), row(1, 1), row(1, 1, 1)] },
  ],
  '9': [
    { key: '9-1', rows: [row(1, 1, 1), row(1, 1, 1), row(1, 1, 1)] },
    { key: '9-2', rows: [row(1), row(1, 1), row(1, 1, 1), row(1, 1, 1)] },
  ],
};

function rowsToRects(rows: Row[]): CellRect[] {
  const rowFlex = rows.map((r) => r.flex ?? Math.max(...r.cells.map((c) => c.flex ?? 1)));
  const totalRowFlex = rowFlex.reduce((sum, f) => sum + f, 0);
  const rects: CellRect[] = [];
  let y = 0;
  rows.forEach((r, ri) => {
    const h = rowFlex[ri] / totalRowFlex;
    const cellFlex = r.cells.map((c) => c.flex ?? 1);
    const totalCellFlex = cellFlex.reduce((sum, f) => sum + f, 0);
    let x = 0;
    r.cells.forEach((_, ci) => {
      const w = cellFlex[ci] / totalCellFlex;
      rects.push({ x, y, w, h });
      x += w;
    });
    y += h;
  });
  return rects;
}

function gridRects(rows: number, cols: number, x0: number, y0: number, w: number, h: number): CellRect[] {
  const rects: CellRect[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      rects.push({ x: x0 + (w * c) / cols, y: y0 + (h * r) / rows, w: w / cols, h: h / rows });
    }
  }
  return rects;
}

const TEMPLATES: Record<string, Template[]> = (() => {
  const map: Record<string, Template[]> = {};
  Object.entries(OLD_LAYOUTS).forEach(([count, tpls]) => {
    map[count] = tpls.map((tpl) => ({
      key: tpl.key,
      count: Number(count),
      cells: rowsToRects(tpl.rows),
    }));
  });

  // 参考图 1：左侧通栏大图 + 右侧 2×3 + 下方 4×4，共 23 格
  map['23'] = [
    {
      key: '23-1',
      count: 23,
      cells: [
        { x: 0, y: 0, w: 0.4, h: 0.44 },
        ...gridRects(3, 2, 0.4, 0, 0.6, 0.44),
        ...gridRects(4, 4, 0, 0.44, 1, 0.56),
      ],
    },
  ];

  // 参考图 2：上方 2×2 大图 + 下方 4×4，共 20 格
  map['20'] = [
    {
      key: '20-1',
      count: 20,
      cells: [
        ...gridRects(2, 2, 0, 0, 1, 0.5),
        ...gridRects(4, 4, 0, 0.5, 1, 0.5),
      ],
    },
  ];

  // 参考图 3：上方 2 张大图 + 下方 3×3，共 11 格
  map['11'] = [
    {
      key: '11-1',
      count: 11,
      cells: [
        { x: 0, y: 0, w: 0.52, h: 0.36 },
        { x: 0.52, y: 0, w: 0.48, h: 0.36 },
        ...gridRects(3, 3, 0, 0.36, 1, 0.64),
      ],
    },
  ];

  return map;
})();

const TEMPLATE_GROUPS = Object.keys(TEMPLATES)
  .map(Number)
  .sort((a, b) => a - b);
const MORE_GROUPS = TEMPLATE_GROUPS.filter((n) => n > 5);
const QUICK_GROUPS = TEMPLATE_GROUPS.filter((n) => n <= 5);
const DEFAULT_TEMPLATE_KEY = '9-1';

const findTemplate = (key: string): Template => {
  for (const tpls of Object.values(TEMPLATES)) {
    const hit = tpls.find((tpl) => tpl.key === key);
    if (hit) return hit;
  }
  return TEMPLATES['9'][0];
};

const emptySlots = (count: number): Slot[] => Array.from({ length: count }, () => null);

function TemplateThumb({ tpl, active, onSelect }: { tpl: Template; active?: boolean; onSelect: () => void }) {
  const inset = 1;
  return (
    <button
      type="button"
      className={active ? 'cp-tpl cp-tpl--active' : 'cp-tpl'}
      onClick={onSelect}
      aria-pressed={active}
      title={`${tpl.count} 张 · ${tpl.cells.length} 格`}
    >
      {tpl.cells.map((c, i) => (
        <span
          className="cp-tpl__cell"
          key={i}
          style={{
            left: `calc(${c.x * 100}% + ${inset}px)`,
            top: `calc(${c.y * 100}% + ${inset}px)`,
            width: `calc(${c.w * 100}% - ${inset * 2}px)`,
            height: `calc(${c.h * 100}% - ${inset * 2}px)`,
          }}
        />
      ))}
    </button>
  );
}

type Slot = { src: string; scale: number; x: number; y: number; natW?: number; natH?: number } | null;

function parseDrop(e: React.DragEvent): { sampleSrc?: string; fromIndex?: number } {
  const from = e.dataTransfer.getData('text/cp-slot');
  if (from !== '') return { fromIndex: Number(from) };
  const src = e.dataTransfer.getData('text/cp-sample');
  if (src) return { sampleSrc: src };
  return {};
}

function SlotCell({
  rect,
  gap,
  index,
  slot,
  onDropSrc,
  onDropFromSlot,
  onRemove,
  onSetView,
  onSetNatural,
  onPick,
}: {
  rect: CellRect;
  gap: number;
  index: number;
  slot: Slot;
  onDropSrc: (src: string) => void;
  onDropFromSlot: (fromIndex: number) => void;
  onRemove: () => void;
  onSetView: (patch: { scale?: number; x?: number; y?: number }) => void;
  onSetNatural: (w: number, h: number) => void;
  onPick: () => void;
}) {
  const dragRef = React.useRef<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null);
  const boxRef = React.useRef<HTMLDivElement>(null);
  const imgRef = React.useRef<HTMLImageElement | null>(null);

  const halfGap = gap / 2;
  const leftInset = rect.x > 0.0001 ? halfGap : 0;
  const topInset = rect.y > 0.0001 ? halfGap : 0;
  const rightInset = rect.x + rect.w < 0.999 ? halfGap : 0;
  const bottomInset = rect.y + rect.h < 0.999 ? halfGap : 0;
  const style: React.CSSProperties = {
    left: `calc(${rect.x * 100}% + ${leftInset}px)`,
    top: `calc(${rect.y * 100}% + ${topInset}px)`,
    width: `calc(${rect.w * 100}% - ${leftInset + rightInset}px)`,
    height: `calc(${rect.h * 100}% - ${topInset + bottomInset}px)`,
  };
  const seamless = gap === 0;
  const compact = rect.w * CANVAS_SIZE < 170 || rect.h * CANVAS_SIZE < 120;

  const border = seamless ? 0 : 2;
  const cellW = Math.max(1, rect.w * CANVAS_SIZE - (leftInset + rightInset) - border);
  const cellH = Math.max(1, rect.h * CANVAS_SIZE - (topInset + bottomInset) - border);
  const cover = slot?.natW && slot.natH ? Math.max(cellW / slot.natW, cellH / slot.natH) : 1;
  const contentW = slot?.natW ? slot.natW * cover : cellW;
  const contentH = slot?.natH ? slot.natH * cover : cellH;
  // 图片用 cover 铺满格子：宽高比不一致时即使不放大也存在可平移余量
  const canPan =
    !!slot && (slot.scale * contentW - cellW > 0.5 || slot.scale * contentH - cellH > 0.5);

  const clamp = (s: number, x: number, y: number) => {
    const el = boxRef.current;
    if (!el) return { x: 0, y: 0 };
    const mx = Math.max(0, (contentW * s - el.clientWidth) / 2);
    const my = Math.max(0, (contentH * s - el.clientHeight) / 2);
    return { x: Math.min(mx, Math.max(-mx, x)), y: Math.min(my, Math.max(-my, y)) };
  };

  const syncNatural = (el: HTMLImageElement | null) => {
    if (el && el.naturalWidth && (slot?.natW !== el.naturalWidth || slot?.natH !== el.naturalHeight)) {
      onSetNatural(el.naturalWidth, el.naturalHeight);
    }
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

  // 切换模板/开关后格子尺寸变化，把旧的平移量重新收回边界内，避免露出底色
  React.useEffect(() => {
    if (!slot) return;
    const next = clamp(slot.scale, slot.x, slot.y);
    if (Math.abs(next.x - slot.x) > 0.5 || Math.abs(next.y - slot.y) > 0.5) {
      onSetView(next);
    }
  }, [contentW, contentH, slot?.scale, slot?.x, slot?.y]);

  if (!slot) {
    return (
      <div
        className={['cp-slot', seamless ? 'cp-slot--seamless' : '', compact ? 'cp-slot--compact' : ''].filter(Boolean).join(' ')}
        style={style}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={onPick}
        title={compact ? '点击添加图片或从可选图片拖放到此处' : undefined}
      >
        <span className="cp-slot__plus">+</span>
        {!compact && <span className="cp-slot__text">点击添加图片或从可选图片拖放到此处</span>}
      </div>
    );
  }

  return (
    <div
      ref={boxRef}
      className={['cp-slot', 'cp-slot--filled', seamless ? 'cp-slot--seamless' : ''].filter(Boolean).join(' ')}
      style={style}
      draggable={!canPan}
      title={canPan ? '拖拽可调整图片显示区域，拖左上角图标可换位' : '拖拽可与其他格子换位'}
      onDragStart={(e) => {
        if (canPan) return;
        e.dataTransfer.setData('text/cp-slot', String(index));
        const img = imgRef.current;
        if (img) {
          const r = img.getBoundingClientRect();
          e.dataTransfer.setDragImage(img, r.width / 2, r.height / 2);
        }
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onWheel={(e) => {
        const next = Math.min(3, Math.max(1, slot.scale + (e.deltaY < 0 ? 0.1 : -0.1)));
        onSetView({ scale: next, ...clamp(next, slot.x, slot.y) });
      }}
      onPointerDown={(e) => {
        if (!canPan) return;
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
        ref={(el) => {
          imgRef.current = el;
          syncNatural(el);
        }}
        className="cp-slot__img"
        src={slot.src}
        alt=""
        draggable={false}
        onLoad={(e) => syncNatural(e.currentTarget)}
        style={
          slot.natW
            ? {
                width: contentW,
                height: contentH,
                left: '50%',
                top: '50%',
                transform: `translate(calc(-50% + ${slot.x}px), calc(-50% + ${slot.y}px)) scale(${slot.scale})`,
              }
            : { transform: `translate(${slot.x}px, ${slot.y}px) scale(${slot.scale})` }
        }
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
  const [activeKey, setActiveKey] = React.useState(DEFAULT_TEMPLATE_KEY);
  const [anchorCount, setAnchorCount] = React.useState(findTemplate(DEFAULT_TEMPLATE_KEY).count);
  const [moreCount, setMoreCount] = React.useState(findTemplate(DEFAULT_TEMPLATE_KEY).count);
  const [moreOpen, setMoreOpen] = React.useState(false);
  const [slots, setSlots] = React.useState<Slot[]>(() => emptySlots(findTemplate(DEFAULT_TEMPLATE_KEY).cells.length));
  const [samples, setSamples] = React.useState(SAMPLE_IMAGES);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [seamless, setSeamless] = React.useState(false);
  const moreRef = React.useRef<HTMLDivElement>(null);
  const sidebarRef = React.useRef<HTMLElement>(null);
  const headRef = React.useRef<HTMLDivElement>(null);
  const groupRefs = React.useRef<Record<number, HTMLDivElement | null>>({});
  const anchorLockRef = React.useRef(true);

  const groupTop = (n: number) => {
    const bar = sidebarRef.current;
    const head = groupRefs.current[n];
    if (!bar || !head) return null;
    return head.getBoundingClientRect().top - bar.getBoundingClientRect().top + bar.scrollTop;
  };

  const scrollToGroup = (n: number, smooth: boolean) => {
    const bar = sidebarRef.current;
    const top = groupTop(n);
    if (!bar || top === null) return;
    const offset = (headRef.current?.getBoundingClientRect().height ?? 98) + 4;
    bar.scrollTo({ top: Math.max(0, top - offset), behavior: smooth ? 'smooth' : 'auto' });
  };

  const jumpToGroup = (n: number) => {
    setAnchorCount(n);
    anchorLockRef.current = true;
    if (n > 5) setMoreCount(n);
    scrollToGroup(n, true);
  };

  const handleSidebarScroll = () => {
    if (anchorLockRef.current) return;
    const bar = sidebarRef.current;
    if (!bar) return;
    const probe = bar.scrollTop + (headRef.current?.getBoundingClientRect().height ?? 98) + 4;
    let current = TEMPLATE_GROUPS[0];
    TEMPLATE_GROUPS.forEach((n) => {
      const top = groupTop(n);
      if (top !== null && top <= probe) current = n;
    });
    setAnchorCount(current);
  };

  React.useEffect(() => {
    scrollToGroup(findTemplate(DEFAULT_TEMPLATE_KEY).count, false);
    const bar = sidebarRef.current;
    if (!bar) return;
    const unlock = () => {
      anchorLockRef.current = false;
    };
    bar.addEventListener('wheel', unlock, { passive: true });
    bar.addEventListener('touchstart', unlock, { passive: true });
    bar.addEventListener('pointerdown', unlock);
    return () => {
      bar.removeEventListener('wheel', unlock);
      bar.removeEventListener('touchstart', unlock);
      bar.removeEventListener('pointerdown', unlock);
    };
  }, []);

  React.useEffect(() => {
    if (!moreOpen) return;
    const onDocDown = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMoreOpen(false);
    };
    document.addEventListener('mousedown', onDocDown, true);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocDown, true);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [moreOpen]);

  if (!open) return null;

  const activeTemplate = findTemplate(activeKey);
  const activeCount = activeTemplate.count;
  const emptyCount = slots.filter((s) => s === null).length;
  const selectableCount = Math.min(emptyCount, samples.length);
  const allSelected = selectableCount > 0 && selected.length >= selectableCount;

  const applyTemplate = (tpl: Template) => {
    const next = Array.from({ length: tpl.cells.length }, (_, i) => slots[i] ?? null);
    const nextEmpty = next.filter((s) => s === null).length;
    setActiveKey(tpl.key);
    setSlots(next);
    setSelected((prev) => prev.slice(0, Math.min(prev.length, nextEmpty)));
  };

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

  const setSlotNatural = (index: number, natW: number, natH: number) => {
    setSlots((prev) =>
      prev.map((s, i) =>
        i === index && s && (s.natW !== natW || s.natH !== natH) ? { ...s, natW, natH } : s,
      ),
    );
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

  const toggleSection = (category: SampleCategory) => {
    const ids = samples.filter((s) => s.category === category).map((s) => s.id);
    if (!ids.length) return;
    if (ids.every((id) => selected.includes(id))) {
      setSelected((prev) => prev.filter((id) => !ids.includes(id)));
      return;
    }
    setSelected((prev) => {
      const next = [...prev];
      for (const id of ids) {
        if (!next.includes(id)) {
          if (next.length >= emptyCount) break;
          next.push(id);
        }
      }
      return next;
    });
  };

  const randomSelect = () => {
    const limit = Math.min(activeTemplate.cells.length, emptyCount);
    if (limit <= 0 || samples.length === 0) return;
    // 可选图少于模板格数时循环复用，保证导入后每个格子都有图
    const picks: string[] = [];
    while (picks.length < limit) {
      const pool = [...samples];
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      for (const item of pool) {
        if (picks.length >= limit) break;
        picks.push(item.id);
      }
    }
    setSelected(picks);
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

        <aside className="cp-sidebar" ref={sidebarRef} onScroll={handleSidebarScroll}>
          <div className="cp-sidebar__head" ref={headRef}>
            <h3 className="cp-sidebar__title">选择模板</h3>
            <div className="cp-counts">
              {QUICK_GROUPS.map((n) => (
                <button
                  className={anchorCount === n ? 'cp-count cp-count--active' : 'cp-count'}
                  key={n}
                  type="button"
                  onClick={() => jumpToGroup(n)}
                >
                  {n}
                </button>
              ))}
              <div className="cp-more" ref={moreRef}>
                <button
                  className={anchorCount > 5 ? 'cp-count cp-count--active' : 'cp-count'}
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={moreOpen}
                  onClick={() => setMoreOpen((v) => !v)}
                >
                  {anchorCount > 5 ? anchorCount : moreCount}
                  <IconChevronDown size={14} />
                </button>
                {moreOpen && (
                  <div className="cp-more__menu" role="menu">
                    {MORE_GROUPS.map((n) => (
                      <button
                        key={n}
                        type="button"
                        role="menuitem"
                        className={anchorCount === n ? 'is-active' : undefined}
                        onClick={() => {
                          jumpToGroup(n);
                          setMoreOpen(false);
                        }}
                      >
                        <span>{n} 张</span>
                        {anchorCount === n && <IconCheck />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {TEMPLATE_GROUPS.map((count) => (
            <React.Fragment key={count}>
              <div
                className="cp-group"
                ref={(el) => {
                  groupRefs.current[count] = el;
                }}
              >
                <span className="cp-group__num">{count}</span>
                <span>张</span>
              </div>
              <div className="cp-tpl-row">
                {TEMPLATES[String(count)].map((tpl) => (
                  <TemplateThumb
                    tpl={tpl}
                    key={tpl.key}
                    active={tpl.key === activeKey}
                    onSelect={() => applyTemplate(tpl)}
                  />
                ))}
              </div>
            </React.Fragment>
          ))}
        </aside>

        <div className="cp-main">
          <div className="cp-stage">
            <div className="cp-canvas">
              <div className="cp-canvas__grid" data-annotation-id="collage-slot-interaction">
                {activeTemplate.cells.map((rect, i) => (
                  <SlotCell
                    key={`${activeKey}-${i}`}
                    rect={rect}
                    gap={seamless ? 0 : CELL_GAP}
                    index={i}
                    slot={slots[i] ?? null}
                    onDropSrc={(src) => placeInSlot(i, src)}
                    onDropFromSlot={(from) => moveOrSwap(from, i)}
                    onRemove={() => removeSlot(i)}
                    onSetView={(patch) => setSlotView(i, patch)}
                    onSetNatural={(w, h) => setSlotNatural(i, w, h)}
                    onPick={() => setUploadOpen(true)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="cp-toolbar">
            <div className="cp-switch-wrap">
              <span>无缝拼贴</span>
              <button
                type="button"
                role="switch"
                aria-checked={seamless}
                aria-label="无缝拼贴"
                className={seamless ? 'cp-switch cp-switch--on' : 'cp-switch'}
                onClick={() => setSeamless((v) => !v)}
              >
                <span className="cp-switch__knob" />
              </button>
            </div>
            <button className="cp-tool cp-tool--light" type="button" onClick={() => setSlots(emptySlots(activeTemplate.cells.length))}>
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

            <div className="cp-selectall-row">
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
              <button className="cp-random" type="button" onClick={randomSelect}>
                随机选图
              </button>
            </div>

            {SAMPLE_SECTIONS.map((sec) => {
              const items = samples.filter((s) => s.category === sec.key);
              const selectedInSection = items.filter((s) => selected.includes(s.id)).length;
              const sectionAll = items.length > 0 && selectedInSection === items.length;
              const sectionSome = selectedInSection > 0 && !sectionAll;
              return (
                <section className="cp-sample-group" key={sec.key}>
                  <div className="cp-sample-group__head">
                    <h4 className="cp-sample-group__title">{sec.title}</h4>
                    <label className="cp-selectall cp-selectall--inline">
                      <span
                        className={sectionAll ? 'cp-check cp-check--on' : sectionSome ? 'cp-check cp-check--partial' : 'cp-check'}
                        role="checkbox"
                        aria-checked={sectionAll ? 'true' : sectionSome ? 'mixed' : 'false'}
                        onClick={() => toggleSection(sec.key)}
                      >
                        {sectionAll ? <IconCheck /> : sectionSome ? <span className="cp-check__dash" /> : null}
                      </span>
                      <span onClick={() => toggleSection(sec.key)}>全选</span>
                    </label>
                  </div>

                  <div className="cp-samples" data-annotation-id="collage-sample-interaction">
                    {items.map((img) => {
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
                  </div>
                </section>
              );
            })}
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
