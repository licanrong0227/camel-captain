/**
 * 商品信息快照：商品视图平铺渲染所需的结构化数据（演示数据）。
 * 真实实现里对应敦煌商品接口返回的标题、媒体、价格、属性、详情描述。
 */
import { Task } from './store';

export interface SizeChart {
  templateName: string;
  columns: string[];
  rows: { cells: string[]; bad?: number[] }[];
  detail: { index: number; src: string; caption: string } | null;
}

export type DetailBlock =
  | { type: 'text'; text: string }
  | { type: 'image'; index: number; src: string; caption?: string };

export interface ProductSnapshot {
  title: string;
  category: string;
  link: string;
  priceRange: string;
  skuCount: number;
  mainImages: string[];
  skuImages: { label: string; src: string }[];
  skuRows: { sku: string; price: string; stock: string }[];
  ladderRows: { tier: number; qty: string; price: string }[];
  attributes: { label: string; value: string }[];
  sizeChart: SizeChart | null;
  detailBlocks: DetailBlock[];
  detailImages: { index: number; src: string; caption?: string }[];
}

const SUIT_MAIN = ['suit', 'suit-side', 'suit-back'];

/** 箱包系统尺码模板：通过态与各违规场景共用同一份系统数据 */
export const BAG_SIZE_CHART: Omit<SizeChart, 'detail'> = {
  templateName: '箱包 · 系统尺码模板（水桶包）',
  columns: ['尺码', '顶部宽（cm）', '高度（cm）', '底部宽（cm）', '肩带长（cm）'],
  rows: [{ cells: ['One Size', '26', '22', '18', '120'] }],
};

export function getProductSnapshot(task: Task): ProductSnapshot {
  switch (task.image) {
    case 'bag':
      return snapshot(task, {
        mainImages: ['bag'],
        skuImages: [
          { label: 'Brown', src: 'bag' },
          { label: 'Black', src: 'bag' },
        ],
        skuRows: [
          { sku: 'Brown / One Size', price: '$45.00', stock: '128' },
          { sku: 'Black / One Size', price: '$42.00', stock: '96' },
          { sku: 'Beige / One Size', price: '$39.00', stock: '54' },
          { sku: 'Khaki / One Size', price: '$38.00', stock: '31' },
          { sku: 'Wine / One Size', price: '$36.00', stock: '18' },
          { sku: 'Ivory / One Size', price: '$18.00', stock: '9' },
        ],
        ladderRows: [
          { tier: 1, qty: '≥ 1 件', price: '$45.00' },
          { tier: 2, qty: '≥ 10 件', price: '$38.00' },
          { tier: 3, qty: '≥ 50 件', price: '$28.00' },
        ],
        attributes: [
          { label: 'Material', value: 'PU' },
          { label: 'Closure', value: 'Drawstring' },
          { label: 'Strap', value: 'Adjustable' },
          { label: 'Shape', value: 'Bucket' },
        ],
        sizeChart: {
          ...BAG_SIZE_CHART,
          detail: { index: 3, src: 'bag-size-guide-ok', caption: '详情图 3 · 尺码示意图' },
        },
        detailBlocks: [
          { type: 'text', text: '【材质】PU 仿皮，表面细腻纹理，内衬涤纶布，耐磨易打理。' },
          { type: 'image', index: 1, src: 'bag', caption: '详情图 1 · 正面展示' },
          { type: 'image', index: 2, src: 'bag', caption: '详情图 2 · 内里与肩带' },
          { type: 'text', text: '【尺寸】均码 One Size，顶部宽 26cm，高 22cm，底部宽 18cm，肩带可调节，尺寸示意图见详情图 3。' },
          { type: 'image', index: 3, src: 'bag-size-guide-ok', caption: '详情图 3 · 尺码示意图' },
        ],
      });

    case 'tee':
      return snapshot(task, {
        mainImages: ['tee'],
        skuImages: [
          { label: 'White', src: 'tee' },
          { label: 'Black', src: 'tee' },
        ],
        skuRows: [
          { sku: 'White / S', price: '$8.90', stock: '210' },
          { sku: 'White / M', price: '$8.90', stock: '186' },
          { sku: 'White / L', price: '$9.90', stock: '142' },
          { sku: 'White / XL', price: '$9.90', stock: '88' },
          { sku: 'Black / S', price: '$9.90', stock: '176' },
          { sku: 'Black / M', price: '$10.90', stock: '150' },
          { sku: 'Black / L', price: '$10.90', stock: '102' },
          { sku: 'Black / XL', price: '$11.90', stock: '64' },
        ],
        ladderRows: [
          { tier: 1, qty: '≥ 1 件', price: '$8.90' },
          { tier: 2, qty: '≥ 20 件', price: '$7.60' },
          { tier: 3, qty: '≥ 100 件', price: '$6.20' },
        ],
        attributes: [
          { label: 'Material', value: 'Cotton' },
          { label: 'Sleeve', value: 'Short Sleeve' },
          { label: 'Fit', value: 'Oversized' },
          { label: 'Neckline', value: 'Crew Neck' },
        ],
        sizeChart: {
          templateName: 'T 恤 · 系统尺码模板',
          columns: ['尺码', '胸围', '衣长', '肩宽'],
          rows: [
            { cells: ['S', '100', '68', '44'] },
            { cells: ['M', '104', '70', '46'] },
            { cells: ['L', '108', '72', '48'] },
            { cells: ['XL', '112', '74', '50'] },
          ],
          detail: null,
        },
        detailBlocks: [
          { type: 'text', text: '【面料】100% 精梳棉，克重 220g，亲肤透气，水洗不易变形。' },
          { type: 'image', index: 1, src: 'tee', caption: '详情图 1 · 正面展示' },
          { type: 'text', text: '【版型】宽松落肩版型，肩线自然下垂；偏好修身效果可小一码。' },
          { type: 'image', index: 2, src: 'tee', caption: '详情图 2 · 领口走线' },
          { type: 'text', text: '【洗涤说明】建议 30℃ 以下水温手洗，不可漂白，低温熨烫。' },
        ],
      });

    case 'sneaker':
      return snapshot(task, {
        mainImages: ['sneaker'],
        skuImages: [
          { label: 'White', src: 'sneaker' },
          { label: 'Black', src: 'sneaker' },
          { label: 'Navy', src: 'sneaker' },
        ],
        skuRows: [
          { sku: 'White / 39', price: '$49.00', stock: '76' },
          { sku: 'White / 40', price: '$49.00', stock: '88' },
          { sku: 'White / 41', price: '$52.00', stock: '64' },
          { sku: 'White / 42', price: '$52.00', stock: '40' },
          { sku: 'Black / 39', price: '$52.00', stock: '58' },
          { sku: 'Black / 40', price: '$52.00', stock: '71' },
          { sku: 'Black / 41', price: '$55.00', stock: '46' },
          { sku: 'Navy / 41', price: '$89.00', stock: '22' },
          { sku: 'Navy / 42', price: '$89.00', stock: '16' },
          { sku: 'Navy / 43', price: '$19.90', stock: '8' },
        ],
        ladderRows: [
          { tier: 1, qty: '≥ 1 件', price: '$49.00' },
          { tier: 2, qty: '≥ 10 件', price: '$39.00' },
          { tier: 3, qty: '≥ 50 件', price: '$8.50' },
        ],
        attributes: [
          { label: 'Upper Material', value: 'Mesh' },
          { label: 'Sole', value: 'Rubber' },
          { label: 'Closure', value: 'Lace-up' },
          { label: 'Season', value: 'All Season' },
        ],
        sizeChart: {
          templateName: '运动鞋 · 系统尺码模板',
          columns: ['尺码', '内长（cm）', '脚宽（cm）'],
          rows: [
            { cells: ['39', '24.5', '9.6'] },
            { cells: ['40', '25.0', '9.8'] },
            { cells: ['41', '25.5', '10.0'] },
            { cells: ['42', '26.0', '10.2'] },
            { cells: ['43', '26.5', '10.4'] },
          ],
          detail: null,
        },
        detailBlocks: [
          { type: 'text', text: '【鞋面】飞织网面，透气轻量；鞋头加固，耐磨防撞。' },
          { type: 'image', index: 1, src: 'sneaker', caption: '详情图 1 · 侧面展示' },
          { type: 'text', text: '【鞋底】橡胶大底，纹路加深，日常通勤与轻运动均适合。' },
          { type: 'image', index: 2, src: 'sneaker', caption: '详情图 2 · 鞋底纹路' },
        ],
      });

    case 'dress':
      return snapshot(task, {
        mainImages: ['dress'],
        skuImages: [
          { label: 'Floral Blue', src: 'dress' },
          { label: 'Floral Pink', src: 'dress' },
        ],
        skuRows: [
          { sku: 'S', price: '$14.90', stock: '120' },
          { sku: 'M', price: '$14.90', stock: '98' },
          { sku: 'L', price: '$15.90', stock: '63' },
          { sku: 'XL', price: '-', stock: '31' },
        ],
        ladderRows: [
          { tier: 1, qty: '≥ 1 件', price: '$14.90' },
          { tier: 2, qty: '≥ 20 件', price: '$13.20' },
          { tier: 3, qty: '≥ 100 件', price: '$11.80' },
        ],
        attributes: [
          { label: 'Material', value: 'Polyester' },
          { label: 'Length', value: 'Midi' },
          { label: 'Sleeve', value: 'Short Sleeve' },
          { label: 'Pattern', value: 'Floral' },
        ],
        sizeChart: {
          templateName: '连衣裙 · 系统尺码模板',
          columns: ['尺码', '胸围', '腰围', '裙长'],
          rows: [
            { cells: ['S', '88', '70', '112'] },
            { cells: ['M', '92', '74', '114'] },
            { cells: ['L', '96', '78', '116'] },
            { cells: ['XL', '100', '82', '118'] },
          ],
          detail: null,
        },
        detailBlocks: [
          { type: 'text', text: '【面料】雪纺印花面料，内衬柔软衬布，垂感好不透光。' },
          { type: 'image', index: 1, src: 'dress', caption: '详情图 1 · 整体展示' },
          { type: 'text', text: '【版型】收腰中长款，后背隐形拉链；建议按胸围选码。' },
        ],
      });

    default:
      return snapshot(task, {
        mainImages: SUIT_MAIN,
        skuImages: ['Black', 'Navy', 'Charcoal', 'Grey'].map((label) => ({ label, src: 'suit' })),
        skuRows: buildSuitSkus(),
        ladderRows: [
          { tier: 1, qty: '≥ 1 件', price: '$12.50' },
          { tier: 2, qty: '≥ 10 件', price: '$11.20' },
          { tier: 3, qty: '≥ 50 件', price: '$10.40' },
          { tier: 4, qty: '≥ 200 件', price: '$8.90' },
        ],
        attributes: [
          { label: 'Material', value: task.scenario === 'default' ? 'n/a' : 'Polyester（聚酯纤维）' },
          { label: 'Season', value: 'All Season' },
          { label: 'Style', value: 'Formal' },
          { label: 'Closure', value: 'Button' },
          { label: 'Fit', value: 'Slim Fit' },
          { label: 'Lapel', value: 'Notch Lapel' },
        ],
        sizeChart: {
          templateName: '男装上衣 · 系统尺码模板',
          columns: ['尺码', '胸围', '肩宽', '袖长', '衣长'],
          rows: [
            { cells: ['S', '96', '42', '58', '68'] },
            { cells: ['M', '102', '44', '59', '70'] },
            { cells: ['L', '108', '46', '60', '72'] },
            { cells: ['XL', '114', '48', '61', '74'] },
          ],
          detail: { index: 3, src: 'size-chart', caption: '详情图 3 · 尺码表' },
        },
        detailBlocks: [
          { type: 'text', text: '【面料】聚酯纤维混纺，表面细腻平顺，垂坠挺括，不易起皱。' },
          { type: 'image', index: 1, src: 'suit-detail-1', caption: '详情图 1 · 面料细节' },
          { type: 'image', index: 2, src: 'suit-detail-2', caption: '详情图 2 · 版型展示' },
          { type: 'text', text: '【洗涤说明】建议 30℃ 以下水温手洗，不可漂白，低温熨烫，避免暴晒。' },
          { type: 'image', index: 3, src: 'size-chart', caption: '详情图 3 · 尺码表' },
        ],
      });
  }
}

function buildSuitSkus() {
  const sizes = ['S', 'M', 'L', 'XL'];
  const prices: Record<string, string> = { S: '$79.00', M: '$89.00', L: '$99.00', XL: '$99.00' };
  const stocks: Record<string, string> = { S: '86', M: '124', L: '108', XL: '52' };
  const rows: ProductSnapshot['skuRows'] = [];
  ['Black', 'Navy', 'Charcoal'].forEach((color) => {
    sizes.forEach((size) => {
      rows.push({ sku: `${color} / ${size}`, price: prices[size], stock: stocks[size] });
    });
  });
  return rows;
}

function detailImagesOf(blocks: DetailBlock[]) {
  return blocks
    .filter((block): block is Extract<DetailBlock, { type: 'image' }> => block.type === 'image')
    .map((block) => ({ index: block.index, src: block.src, caption: block.caption }));
}

export type SnapshotPatch = Partial<Omit<ProductSnapshot, 'detailImages'>>;

/** 场景补丁：整块覆盖字段；改详情图文时同步重算详情图，改 SKU 行时同步重算价格区间与数量 */
export function applySnapshotPatch(base: ProductSnapshot, patch?: SnapshotPatch): ProductSnapshot {
  if (!patch) return base;
  const next: ProductSnapshot = { ...base, ...patch };
  if (patch.detailBlocks) next.detailImages = detailImagesOf(patch.detailBlocks);
  if (patch.skuRows) {
    next.skuCount = patch.skuRows.length;
    next.priceRange = priceRangeOf(patch.skuRows);
  }
  return next;
}

function priceRangeOf(rows: ProductSnapshot['skuRows']): string {
  const values = rows
    .map((row) => Number.parseFloat(row.price.replace(/[^0-9.]/g, '')))
    .filter((value) => Number.isFinite(value) && value > 0);
  if (values.length === 0) return '-';
  const format = (value: number) => (Number.isInteger(value) ? String(value) : value.toFixed(2));
  return `$${format(Math.min(...values))} - $${format(Math.max(...values))}`;
}


function snapshot(
  task: Task,
  patch: Omit<ProductSnapshot, 'title' | 'category' | 'link' | 'priceRange' | 'skuCount' | 'detailImages'>,
): ProductSnapshot {
  return {
    title: task.title,
    category: task.category,
    link: task.url,
    priceRange: task.priceRange,
    skuCount: task.skuCount,
    ...patch,
    detailImages: detailImagesOf(patch.detailBlocks),
  };
}
