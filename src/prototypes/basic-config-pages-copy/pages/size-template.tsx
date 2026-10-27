import React, { useEffect, useState } from 'react';
import { Modal, Select, showToast } from '../components/ui';

type Head = {
  headId: string;
  headName: string;
  headNameCn: string;
  required: boolean;
  valType: 1 | 2;
  unit?: string;
};

type SizeClass = {
  classId: string;
  seriesName: string;
  classNameCn: string;
  colHeads: Head[];
  rowHeads: Head[];
};

type CustomRow = { headId: string; headName: string; headNameCn: string };

type CellValues = Record<string, { val1: string; val2: string }>;

type SizeTemplate = {
  sizeTemplateId: string;
  templateName: string;
  templateNameCn: string;
  catePubId: string;
  classId: string;
  errorValueStart: string;
  errorValueEnd: string;
  colHeadIds: string[];
  rowHeadIds: string[];
  customRows: CustomRow[];
  values: CellValues;
  classSnapshot?: SizeClass;
};

type Draft = {
  catePubId: string;
  cls: SizeClass;
  templateName: string;
  errorStart: string;
  errorEnd: string;
  colIds: string[];
  rowIds: string[];
  customRows: CustomRow[];
  values: CellValues;
};

type SeriesKey = 'men' | 'women' | 'shoes' | 'sports' | 'wedding';

const SERIES: { key: SeriesKey; label: string }[] = [
  { key: 'men', label: '男装' },
  { key: 'women', label: '女装' },
  { key: 'shoes', label: '鞋和鞋配件' },
  { key: 'sports', label: '运动户外' },
  { key: 'wedding', label: '婚纱' },
];

type Category = {
  value: string;
  label: string;
  series: SeriesKey;
  defaultClassId: string;
};

const CATEGORIES: Category[] = [
  { value: '100001', label: '男装T恤（100001）', series: 'men', defaultClassId: '1326741662036353024' },
  { value: '100002', label: '男装长裤（100002）', series: 'men', defaultClassId: '1327401815673778176' },
  { value: '100003', label: '女装连衣裙（100003）', series: 'women', defaultClassId: '1327718679770353664' },
  { value: '100009', label: '女装T恤（100009）', series: 'women', defaultClassId: '1327703860308033536' },
  { value: '100004', label: '女鞋（100004）', series: 'shoes', defaultClassId: '195678418793414656' },
  { value: '100005', label: '男鞋（100005）', series: 'shoes', defaultClassId: '192784793449152512' },
  { value: '100006', label: '运动户外服装（100006）', series: 'sports', defaultClassId: '233395379550085120' },
  { value: '100007', label: '运动户外鞋（100007）', series: 'sports', defaultClassId: '1499234418490494976' },
  { value: '100008', label: '婚纱礼服（100008）', series: 'wedding', defaultClassId: '145217226177011712' },
];

const categoriesOfSeries = (key: SeriesKey) => CATEGORIES.filter((item) => item.series === key);
const seriesOfCategory = (catePubId: string) => CATEGORIES.find((item) => item.value === catePubId)?.series;

const hid = (n: number) => `1320000000000${String(n).padStart(6, '0')}`;

const colHead = (
  headId: string,
  headNameCn: string,
  required: boolean,
  valType: 1 | 2,
  unit = 'cm',
  headName = headNameCn,
): Head => ({ headId, headName, headNameCn, required, valType, unit });

const rowHead = (headId: string, name: string): Head => ({
  headId,
  headName: name,
  headNameCn: name,
  required: false,
  valType: 1,
});

const TOP_ROWS = ['S', 'M', 'L', 'XL', '2XL', '3XL'].map((name, i) => rowHead(hid(101 + i), name));
const PANTS_ROWS = ['28', '29', '30', '31', '32', '33'].map((name, i) => rowHead(hid(111 + i), name));
const DRESS_ROWS = ['XS', 'S', 'M', 'L', 'XL'].map((name, i) => rowHead(hid(121 + i), name));
const SHOE_ROWS = ['35', '36', '37', '38', '39', '40'].map((name, i) => rowHead(hid(131 + i), name));
const KIDS_ROWS = ['110', '120', '130', '140', '150'].map((name, i) => rowHead(hid(141 + i), name));

type ColSpec = [name: string, required: boolean, valType: 1 | 2, unit?: string];

const cols = (base: number, ...items: ColSpec[]): Head[] => items.map(([name, required, valType, unit], i) => (
  colHead(hid(base + i), name, required, valType, unit)
));

const shoeCols = (base: number) => cols(base, ['脚长', true, 1, 'mm'], ['脚宽', false, 1, 'mm']);

const SERIES_CLASSES: Record<SeriesKey, SizeClass[]> = {
  men: [
    {
      classId: '1326741662036353024',
      seriesName: '男装',
      classNameCn: '上装',
      colHeads: cols(1, ['胸围', true, 2], ['衣长', true, 1], ['肩宽', false, 1], ['袖长', false, 1]),
      rowHeads: TOP_ROWS,
    },
    {
      classId: '1327401815673778176',
      seriesName: '男装',
      classNameCn: '裤子',
      colHeads: cols(5, ['腰围', true, 1], ['臀围', true, 1], ['裤长', false, 1]),
      rowHeads: PANTS_ROWS,
    },
    {
      classId: '1327410882410291200',
      seriesName: '男装',
      classNameCn: '套装',
      colHeads: cols(8, ['胸围', true, 2], ['腰围', true, 1], ['衣长', false, 1], ['裤长', false, 1]),
      rowHeads: TOP_ROWS,
    },
    {
      classId: '1327424165668896768',
      seriesName: '男装',
      classNameCn: '泳衣和内裤',
      colHeads: cols(12, ['胸围', true, 2], ['腰围', true, 1], ['臀围', false, 1]),
      rowHeads: TOP_ROWS,
    },
  ],
  women: [
    {
      classId: '1327703860308033536',
      seriesName: '女装',
      classNameCn: '上装',
      colHeads: cols(15, ['胸围', true, 2], ['衣长', true, 1], ['肩宽', false, 1], ['袖长', false, 1]),
      rowHeads: TOP_ROWS,
    },
    {
      classId: '1327707930840285184',
      seriesName: '女装',
      classNameCn: '裤子',
      colHeads: cols(19, ['腰围', true, 1], ['臀围', true, 1], ['裤长', false, 1]),
      rowHeads: PANTS_ROWS,
    },
    {
      classId: '1327713440950534144',
      seriesName: '女装',
      classNameCn: '套装',
      colHeads: cols(22, ['胸围', true, 2], ['腰围', true, 1], ['衣长', false, 1], ['裤长', false, 1]),
      rowHeads: TOP_ROWS,
    },
    {
      classId: '1327718679770353664',
      seriesName: '女装',
      classNameCn: '连衣裙',
      colHeads: cols(26, ['胸围', true, 2], ['腰围', false, 1], ['裙长', true, 1]),
      rowHeads: DRESS_ROWS,
    },
    {
      classId: '1327720374725079040',
      seriesName: '女装',
      classNameCn: '半身裙',
      colHeads: cols(29, ['腰围', true, 1], ['臀围', true, 1], ['裙长', false, 1]),
      rowHeads: DRESS_ROWS,
    },
  ],
  shoes: [
    {
      classId: '192784793449152512',
      seriesName: '鞋和鞋配件',
      classNameCn: '男鞋',
      colHeads: shoeCols(32),
      rowHeads: SHOE_ROWS,
    },
    {
      classId: '195678418793414656',
      seriesName: '鞋和鞋配件',
      classNameCn: '女鞋',
      colHeads: shoeCols(34),
      rowHeads: SHOE_ROWS,
    },
    {
      classId: '203207997173633024',
      seriesName: '鞋和鞋配件',
      classNameCn: '情侣款',
      colHeads: shoeCols(36),
      rowHeads: SHOE_ROWS,
    },
    {
      classId: '1494495633273200640',
      seriesName: '鞋和鞋配件',
      classNameCn: '通用鞋',
      colHeads: shoeCols(38),
      rowHeads: SHOE_ROWS,
    },
    {
      classId: '1496564825306968064',
      seriesName: '鞋和鞋配件',
      classNameCn: '男女鞋',
      colHeads: shoeCols(40),
      rowHeads: SHOE_ROWS,
    },
  ],
  sports: [
    {
      classId: '233395379550085120',
      seriesName: '运动户外',
      classNameCn: '专业运动服装（男）',
      colHeads: cols(42, ['胸围', true, 2], ['衣长', true, 1], ['肩宽', false, 1], ['袖长', false, 1]),
      rowHeads: TOP_ROWS,
    },
    {
      classId: '233731882683764736',
      seriesName: '运动户外',
      classNameCn: '专业运动服装（女）',
      colHeads: cols(46, ['胸围', true, 2], ['衣长', true, 1], ['肩宽', false, 1], ['袖长', false, 1]),
      rowHeads: TOP_ROWS,
    },
    {
      classId: '233733258400919552',
      seriesName: '运动户外',
      classNameCn: '专业运动服装（儿童）',
      colHeads: cols(50, ['胸围', true, 2], ['衣长', true, 1], ['肩宽', false, 1], ['袖长', false, 1]),
      rowHeads: KIDS_ROWS,
    },
    {
      classId: '1499234418490494976',
      seriesName: '运动户外',
      classNameCn: '运动户外鞋',
      colHeads: shoeCols(54),
      rowHeads: SHOE_ROWS,
    },
    {
      classId: '1499235586042662912',
      seriesName: '运动户外',
      classNameCn: '男女鞋',
      colHeads: shoeCols(56),
      rowHeads: SHOE_ROWS,
    },
  ],
  wedding: [
    {
      classId: '145217226177011712',
      seriesName: '婚纱',
      classNameCn: '婚纱礼服',
      colHeads: cols(58, ['胸围', true, 2], ['腰围', true, 1], ['臀围', false, 1], ['裙长', true, 1]),
      rowHeads: DRESS_ROWS,
    },
  ],
};

const classList = (catePubId: string): SizeClass[] => {
  const series = seriesOfCategory(catePubId);
  return series ? SERIES_CLASSES[series] : [];
};

const defaultClass = (catePubId: string): SizeClass | undefined => {
  const list = classList(catePubId);
  const def = CATEGORIES.find((item) => item.value === catePubId)?.defaultClassId;
  return list.find((item) => item.classId === def) ?? list[0];
};

const BASE_VALUES: Record<string, number> = {
  胸围: 88,
  衣长: 66,
  肩宽: 42,
  袖长: 20,
  腰围: 72,
  臀围: 96,
  裤长: 100,
  裙长: 90,
  脚长: 225,
  脚宽: 90,
};

function classOf(catePubId: string, classId: string): SizeClass | undefined {
  const list = classList(catePubId);
  return list.find((item) => item.classId === classId) ?? list[0];
}

function resolveClass(template: SizeTemplate): SizeClass {
  const list = classList(template.catePubId);
  return list.find((item) => item.classId === template.classId)
    ?? template.classSnapshot
    ?? list[0];
}

function buildValues(cls: SizeClass, colIds: string[], rowIds: string[]): CellValues {
  const rows = cls.rowHeads.filter((row) => rowIds.includes(row.headId));
  const cols = cls.colHeads.filter((col) => colIds.includes(col.headId));
  const values: CellValues = {};
  rows.forEach((row, rowIndex) => {
    cols.forEach((col) => {
      const base = BASE_VALUES[col.headNameCn] ?? 10;
      const step = col.unit === 'mm' ? 5 : 2;
      const value = base + rowIndex * step;
      values[`${row.headId}|${col.headId}`] = {
        val1: String(value),
        val2: col.valType === 2 ? String(value + 2) : '',
      };
    });
  });
  return values;
}

type Seed = {
  sizeTemplateId: string;
  templateName: string;
  templateNameCn: string;
  catePubId: string;
  classId: string;
  errorStart: string;
  errorEnd: string;
  colIds: string[];
  rowIds: string[];
};

function makeSeed(
  sizeTemplateId: string,
  templateName: string,
  templateNameCn: string,
  catePubId: string,
  classId: string,
  errorStart: string,
  errorEnd: string,
  colCount?: number,
  rowStart = 0,
  rowCount = 4,
): Seed {
  const cls = classOf(catePubId, classId);
  const cols = colCount ?? cls?.colHeads.length ?? 0;
  return {
    sizeTemplateId,
    templateName,
    templateNameCn,
    catePubId,
    classId: cls?.classId ?? classId,
    errorStart,
    errorEnd,
    colIds: (cls?.colHeads ?? []).slice(0, cols).map((col) => col.headId),
    rowIds: (cls?.rowHeads ?? []).slice(rowStart, rowStart + rowCount).map((row) => row.headId),
  };
}

const SEEDS: Seed[] = [
  makeSeed('1332570484166926336', 'men-top-standard', '男装上装标准码', '100001', '1326741662036353024', '0', '2'),
  makeSeed('1332570484166926340', 'men-pants-standard', '男装裤子标准码', '100001', '1327401815673778176', '0', '1', undefined, 1),
  makeSeed('1332570484166926352', 'men-trousers-relaxed', '男装长裤通码', '100002', '1327401815673778176', '0', '1', undefined, 0, 6),
  makeSeed('1332570484166926388', 'men-polo-standard', '男装Polo衫标准码', '100001', '1326741662036353024', '0', '2', undefined, 0, 5),
  makeSeed('1332570484166926394', 'men-hoodie-standard', '男装卫衣标准码', '100001', '1326741662036353024', '0', '2', undefined, 0, 6),
  makeSeed('1332570484166926400', 'men-shirt-slim', '男装衬衫修身码', '100001', '1326741662036353024', '0', '1', undefined, 1, 6),
  makeSeed('1332570484166926406', 'men-jacket-standard', '男装夹克标准码', '100001', '1326741662036353024', '0', '2', undefined, 0, 5),
  makeSeed('1332570484166926412', 'men-shorts-standard', '男装短裤标准码', '100002', '1327401815673778176', '0', '1', undefined, 0, 5),
  makeSeed('1332570484166926418', 'men-trackpants-standard', '男装运动裤标准码', '100002', '1327401815673778176', '0', '1', undefined, 1, 6),
  makeSeed('1332570484166926424', 'men-suit-standard', '男装套装标准码', '100001', '1327410882410291200', '0', '2', undefined, 0, 5),
  makeSeed('1332570484166926436', 'men-swim-standard', '男装泳裤标准码', '100001', '1327424165668896768', '0', '1', undefined, 0, 4),
  makeSeed('1332570484166926442', 'men-vest-standard', '男装背心标准码', '100001', '1326741662036353024', '0', '2', undefined, 0, 5),
  makeSeed('1332570484166926348', 'women-dress-standard', '女装连衣裙标准码', '100003', '1327718679770353664', '0', '2', undefined, 0, 5),
  makeSeed('1332570484166926360', 'women-top-standard', '女装上装标准码', '100009', '1327703860308033536', '0', '2'),
  makeSeed('1332570484166926355', 'women-shoes-standard', '女鞋标准码', '100004', '195678418793414656', '0', '0.5', undefined, 1, 5),
  makeSeed('1332570484166926364', 'men-shoes-standard', '男鞋标准码', '100005', '192784793449152512', '0', '0.5', undefined, 0, 6),
  makeSeed('1332570484166926370', 'sports-quickdry-tee', '运动速干T恤标准码', '100006', '233395379550085120', '0', '2', undefined, 0, 6),
  makeSeed('1332570484166926376', 'outdoor-hiking-shoes', '户外徒步鞋标准码', '100007', '1499234418490494976', '0', '0.5', undefined, 0, 6),
  makeSeed('1332570484166926382', 'wedding-gown-standard', '婚纱礼服标准码', '100008', '145217226177011712', '0', '3', undefined, 0, 5),
];

const REMOTE_ONLY_SEEDS: Seed[] = [
  makeSeed('1332570484166926448', 'men-shirt-casual', '男装休闲衬衫标准码', '100001', '1326741662036353024', '0', '1', undefined, 1, 5),
  makeSeed('1332570484166926454', 'women-tee-loose', '女装T恤宽松码', '100009', '1327703860308033536', '0', '2', undefined, 2, 4),
];

function buildTemplates(seeds: Seed[]): SizeTemplate[] {
  return seeds.flatMap((seed) => {
    const cls = classOf(seed.catePubId, seed.classId);
    if (!cls) return [];
    return [{
      sizeTemplateId: seed.sizeTemplateId,
      templateName: seed.templateName,
      templateNameCn: seed.templateNameCn,
      catePubId: seed.catePubId,
      classId: seed.classId,
      errorValueStart: seed.errorStart,
      errorValueEnd: seed.errorEnd,
      colHeadIds: seed.colIds,
      rowHeadIds: seed.rowIds,
      customRows: [],
      values: buildValues(cls, seed.colIds, seed.rowIds),
      classSnapshot: cls,
    }];
  });
}

const INITIAL_TEMPLATES: SizeTemplate[] = buildTemplates(SEEDS);
const REMOTE_TEMPLATES: SizeTemplate[] = buildTemplates([...SEEDS, ...REMOTE_ONLY_SEEDS]);

const ALL_CATEGORIES = 'all';
const STORAGE_KEY = 'camel-size-templates-v1';
const REMOTE_STORAGE_KEY = 'camel-size-templates-remote-v1';
const SYNCED_AT_KEY = 'camel-size-templates-synced-at-v1';
const PAGE_SIZE_KEY = 'camel-size-templates-page-size-v1';
const DEFAULT_SYNCED_AT = new Date(2026, 9, 22, 18, 30).toISOString();
const PAGE_SIZES = [10, 20, 50];

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function loadTemplates(): SizeTemplate[] {
  const raw = readStorage(STORAGE_KEY);
  if (!raw) return INITIAL_TEMPLATES;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed as SizeTemplate[];
  } catch {
    // 本地数据损坏时回退到演示数据
  }
  return INITIAL_TEMPLATES;
}

function cloneTemplate(template: SizeTemplate): SizeTemplate {
  return JSON.parse(JSON.stringify(template)) as SizeTemplate;
}

function loadRemoteTemplates(): SizeTemplate[] {
  const raw = readStorage(REMOTE_STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as SizeTemplate[];
    } catch {
      // 远端演示数据损坏时回到初始数据
    }
  }
  const seed = REMOTE_TEMPLATES.map((template) => cloneTemplate(template));
  saveRemoteTemplates(seed);
  return seed;
}

function saveRemoteTemplates(list: SizeTemplate[]) {
  try {
    window.localStorage.setItem(REMOTE_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // 隐私模式等场景下无法写入时，仅保留当前会话数据
  }
}

function loadPageSize(): number {
  const stored = Number(readStorage(PAGE_SIZE_KEY));
  return PAGE_SIZES.includes(stored) ? stored : 10;
}

function loadSyncedAt(): string | null {
  return readStorage(SYNCED_AT_KEY) ?? DEFAULT_SYNCED_AT;
}

function formatSyncTime(iso: string | null): string {
  if (!iso) return '尚未同步';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '尚未同步';
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function Spinner() {
  return (
    <span className="bcp-st-spinner" aria-hidden="true">
      {Array.from({ length: 12 }).map((_, index) => (
        <i
          key={index}
          style={{
            transform: `rotate(${index * 30}deg) translateY(-5px)`,
            animationDelay: `${(index * 0.083) - 1}s`,
          }}
        />
      ))}
    </span>
  );
}

function createDraft(catePubId: string, cls: SizeClass): Draft {
  const colIds = cls.colHeads.filter((col) => col.required).map((col) => col.headId);
  const rowIds = cls.rowHeads.slice(0, 3).map((row) => row.headId);
  return {
    catePubId,
    cls,
    templateName: '',
    errorStart: '',
    errorEnd: '',
    colIds,
    rowIds,
    customRows: [],
    values: buildValues(cls, colIds, rowIds),
  };
}

function isNumeric(value: string): boolean {
  return /^\d+(\.\d{1,2})?$/.test(value.trim());
}

function genTemplateId(): string {
  return `1332570484166926${String(Date.now()).slice(-3)}`;
}

function categoryLabel(catePubId: string): string {
  return CATEGORIES.find((item) => item.value === catePubId)?.label ?? catePubId;
}

function cloneValues(values: CellValues): CellValues {
  return Object.fromEntries(Object.entries(values).map(([key, value]) => [key, { ...value }]));
}

export default function SizeTemplatePage() {
  const [templates, setTemplates] = useState<SizeTemplate[]>(loadTemplates);
  const [mode, setMode] = useState<'list' | 'editor'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [seriesKey, setSeriesKey] = useState<SeriesKey>('men');
  const [category, setCategory] = useState(ALL_CATEGORIES);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(loadPageSize);
  const [syncedAt, setSyncedAt] = useState<string | null>(loadSyncedAt);
  const [syncing, setSyncing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cellErrors, setCellErrors] = useState<Record<string, string>>({});
  const [customAdding, setCustomAdding] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customError, setCustomError] = useState('');
  const [copyTarget, setCopyTarget] = useState<SizeTemplate | null>(null);
  const [copyCategory, setCopyCategory] = useState('100001');
  const [copyName, setCopyName] = useState('');

  useEffect(() => {
    loadRemoteTemplates();
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
    } catch {
      // 隐私模式等场景下无法写入时，仅保留当前会话数据
    }
  }, [templates]);

  useEffect(() => {
    try {
      if (syncedAt) window.localStorage.setItem(SYNCED_AT_KEY, syncedAt);
    } catch {
      // 同上
    }
  }, [syncedAt]);

  useEffect(() => {
    try {
      window.localStorage.setItem(PAGE_SIZE_KEY, String(pageSize));
    } catch {
      // 同上
    }
  }, [pageSize]);

  const resetSearch = () => {
    setCategory(ALL_CATEGORIES);
    setKeyword('');
    setPage(1);
  };

  const changeCategory = (value: string) => {
    setCategory(value);
    setPage(1);
  };

  const changeSeries = (key: SeriesKey) => {
    if (key === seriesKey) return;
    setSeriesKey(key);
    setCategory(ALL_CATEGORIES);
    setKeyword('');
    setPage(1);
  };

  const syncTemplates = (announce = true) => {
    if (syncing) return;
    setSyncing(true);
    window.setTimeout(() => {
      const remote = loadRemoteTemplates();
      const localMap = new Map(templates.map((item) => [item.sizeTemplateId, item]));
      const remoteIds = new Set(remote.map((item) => item.sizeTemplateId));
      const added = remote.filter((item) => !localMap.has(item.sizeTemplateId)).length;
      const updated = remote.filter((item) => {
        const local = localMap.get(item.sizeTemplateId);
        return local ? JSON.stringify(local) !== JSON.stringify(item) : false;
      }).length;
      const removed = templates.filter((item) => !remoteIds.has(item.sizeTemplateId)).length;
      setTemplates(remote.map((item) => cloneTemplate(item)));
      setSyncedAt(new Date().toISOString());
      setSyncing(false);
      if (announce) {
        setPage(1);
        const changes = [
          added > 0 ? `新增 ${added} 个` : '',
          updated > 0 ? `更新 ${updated} 个` : '',
          removed > 0 ? `移除 ${removed} 个` : '',
        ].filter(Boolean);
        showToast(changes.length > 0 ? `同步完成，${changes.join('，')}` : '同步完成，模板已是最新');
      }
    }, 900);
  };

  const startAdd = () => {
    const targetCategory = category === ALL_CATEGORIES
      ? categoriesOfSeries(seriesKey)[0]?.value
      : category;
    if (!targetCategory) return;
    const cls = defaultClass(targetCategory);
    if (!cls) return;
    setDraft(createDraft(targetCategory, cls));
    setEditingId(null);
    setErrors({});
    setCellErrors({});
    setCustomAdding(false);
    setCustomName('');
    setCustomError('');
    setMode('editor');
  };

  const startEdit = (template: SizeTemplate) => {
    setDraft({
      catePubId: template.catePubId,
      cls: resolveClass(template),
      templateName: template.templateNameCn || template.templateName,
      errorStart: template.errorValueStart,
      errorEnd: template.errorValueEnd,
      colIds: [...template.colHeadIds],
      rowIds: [...template.rowHeadIds],
      customRows: template.customRows.map((row) => ({ ...row })),
      values: cloneValues(template.values),
    });
    setEditingId(template.sizeTemplateId);
    setErrors({});
    setCellErrors({});
    setCustomAdding(false);
    setCustomName('');
    setCustomError('');
    setMode('editor');
  };

  const backToList = () => {
    setMode('list');
    setEditingId(null);
    setDraft(null);
    setErrors({});
    setCellErrors({});
    setCustomAdding(false);
    setCustomName('');
    setCustomError('');
  };

  const changeClass = (value: string | string[]) => {
    if (!draft) return;
    const classId = Array.isArray(value) ? value[0] : value;
    const nextClass = classList(draft.catePubId).find((item) => item.classId === classId);
    if (!nextClass) return;
    const colIds = nextClass.colHeads.filter((col) => col.required).map((col) => col.headId);
    const rowIds = nextClass.rowHeads.slice(0, 3).map((row) => row.headId);
    setDraft({
      ...draft,
      cls: nextClass,
      colIds,
      rowIds,
      customRows: [],
      values: buildValues(nextClass, colIds, rowIds),
    });
    setErrors({});
    setCellErrors({});
  };

  const toggleCol = (col: Head) => {
    if (!draft || col.required) return;
    setDraft({
      ...draft,
      colIds: draft.colIds.includes(col.headId)
        ? draft.colIds.filter((id) => id !== col.headId)
        : [...draft.colIds, col.headId],
    });
  };

  const toggleRow = (row: Head) => {
    if (!draft) return;
    setDraft({
      ...draft,
      rowIds: draft.rowIds.includes(row.headId)
        ? draft.rowIds.filter((id) => id !== row.headId)
        : [...draft.rowIds, row.headId],
    });
  };

  const addCustom = () => {
    if (!draft) return;
    const name = customName.trim();
    if (!name) {
      setCustomError('请输入自定义尺码名称');
      return;
    }
    const existing = [...draft.cls.rowHeads, ...draft.customRows].map((row) => row.headNameCn.toLowerCase());
    if (existing.includes(name.toLowerCase())) {
      setCustomError('自定义尺码不能与已有尺码重复');
      return;
    }
    const used = new Set([...draft.cls.rowHeads, ...draft.customRows].map((row) => row.headId));
    let nextId = 10000;
    while (used.has(String(nextId))) nextId += 1;
    setDraft({
      ...draft,
      customRows: [...draft.customRows, { headId: String(nextId), headName: name, headNameCn: name }],
    });
    setCustomName('');
    setCustomAdding(false);
    setCustomError('');
  };

  const removeCustom = (headId: string) => {
    if (!draft) return;
    const values = { ...draft.values };
    Object.keys(values).forEach((key) => {
      if (key.startsWith(`${headId}|`)) delete values[key];
    });
    setDraft({
      ...draft,
      customRows: draft.customRows.filter((row) => row.headId !== headId),
      values,
    });
  };

  const setCell = (key: string, field: 'val1' | 'val2', value: string) => {
    if (!draft) return;
    const current = draft.values[key] ?? { val1: '', val2: '' };
    setDraft({
      ...draft,
      values: { ...draft.values, [key]: { ...current, [field]: value } },
    });
    if (cellErrors[key]) {
      const next = { ...cellErrors };
      delete next[key];
      setCellErrors(next);
    }
  };

  const save = () => {
    if (!draft) return;
    const cls = draft.cls;
    const nextErrors: Record<string, string> = {};
    const nextCellErrors: Record<string, string> = {};
    const name = draft.templateName.trim();
    if (!name) nextErrors.name = '请输入模板名称';
    else if (name.length > 128) nextErrors.name = '模板名称不能超过 128 个字符';
    if (draft.colIds.length === 0) nextErrors.cols = '请至少保留一个测量项';

    const rowHeads: Head[] = [
      ...cls.rowHeads.filter((row) => draft.rowIds.includes(row.headId)),
      ...draft.customRows.map((row) => ({ ...row, required: false, valType: 1 as const })),
    ];
    if (rowHeads.length === 0) nextErrors.rows = '请至少选择一个尺码';

    const start = draft.errorStart.trim();
    const end = draft.errorEnd.trim();
    if (start || end) {
      if (!start || !end) nextErrors.error = '尺码误差的起始值和结束值需同时填写';
      else if (!isNumeric(start) || !isNumeric(end)) nextErrors.error = '尺码误差请输入 0~5 的数字，最多两位小数';
      else if (Number(start) < 0 || Number(start) > 5 || Number(end) < 0 || Number(end) > 5) {
        nextErrors.error = '尺码误差需在 0~5 之间';
      } else if (Number(start) > Number(end)) {
        nextErrors.error = '起始值不能大于结束值';
      }
    }

    const values: CellValues = {};
    rowHeads.forEach((row) => {
      draft.colIds.forEach((colId) => {
        const col = cls.colHeads.find((item) => item.headId === colId);
        if (!col) return;
        const key = `${row.headId}|${colId}`;
        const cell = draft.values[key] ?? { val1: '', val2: '' };
        const val1 = cell.val1.trim();
        const val2 = col.valType === 2 ? cell.val2.trim() : '';
        if (!isNumeric(val1) || (col.valType === 2 && !isNumeric(val2))) {
          nextCellErrors[key] = '请填写数值';
          return;
        }
        if (col.valType === 2 && Number(val2) < Number(val1)) {
          nextCellErrors[key] = '结束值应不小于起始值';
          return;
        }
        values[key] = { val1, val2 };
      });
    });
    if (Object.keys(nextCellErrors).length > 0) {
      nextErrors.cells = '尺码表存在未填写或格式错误的单元格，请检查标红项';
    }

    setErrors(nextErrors);
    setCellErrors(nextCellErrors);
    if (Object.keys(nextErrors).length > 0) {
      showToast(nextErrors.name ?? nextErrors.error ?? nextErrors.cells ?? nextErrors.rows ?? nextErrors.cols ?? '请检查填写内容');
      return;
    }

    const template: SizeTemplate = {
      sizeTemplateId: editingId ?? genTemplateId(),
      templateName: name,
      templateNameCn: name,
      catePubId: draft.catePubId,
      classId: cls.classId,
      errorValueStart: start,
      errorValueEnd: end,
      colHeadIds: [...draft.colIds],
      rowHeadIds: [...draft.rowIds],
      customRows: draft.customRows.map((row) => ({ ...row })),
      values,
      classSnapshot: cls,
    };
    if (editingId) {
      setTemplates((prev) => prev.map((item) => (item.sizeTemplateId === editingId ? template : item)));
    } else {
      setTemplates((prev) => [...prev, template]);
    }
    const remote = loadRemoteTemplates();
    const exists = remote.some((item) => item.sizeTemplateId === template.sizeTemplateId);
    saveRemoteTemplates(exists
      ? remote.map((item) => (item.sizeTemplateId === template.sizeTemplateId ? cloneTemplate(template) : item))
      : [...remote, cloneTemplate(template)]);
    const templateSeries = seriesOfCategory(template.catePubId);
    if (templateSeries) setSeriesKey(templateSeries);
    setKeyword('');
    setPage(1);
    setMode('list');
    setEditingId(null);
    setDraft(null);
    setErrors({});
    setCellErrors({});
    showToast(editingId ? '尺码模板已更新' : '尺码模板已创建');
    syncTemplates(false);
  };

  const startCopy = (template: SizeTemplate) => {
    setCopyTarget(template);
    setCopyCategory(template.catePubId);
    setCopyName(`${template.templateNameCn || template.templateName}-副本`);
  };

  const confirmCopy = () => {
    if (!copyTarget) return;
    const name = copyName.trim();
    if (!name) {
      showToast('请输入新模板名称');
      return;
    }
    if (name.length > 128) {
      showToast('模板名称不能超过 128 个字符');
      return;
    }
    const copied: SizeTemplate = {
      ...copyTarget,
      sizeTemplateId: genTemplateId(),
      templateName: name,
      templateNameCn: name,
      catePubId: copyCategory,
      colHeadIds: [...copyTarget.colHeadIds],
      rowHeadIds: [...copyTarget.rowHeadIds],
      customRows: copyTarget.customRows.map((row) => ({ ...row })),
      values: cloneValues(copyTarget.values),
      classSnapshot: resolveClass(copyTarget),
    };
    setTemplates((prev) => [...prev, copied]);
    saveRemoteTemplates([...loadRemoteTemplates(), cloneTemplate(copied)]);
    const copySeries = seriesOfCategory(copyCategory);
    if (copySeries) setSeriesKey(copySeries);
    if (category !== ALL_CATEGORIES) setCategory(copyCategory);
    setKeyword('');
    setPage(1);
    setCopyTarget(null);
    showToast('尺码模板已复制');
    syncTemplates(false);
  };

  if (mode === 'editor' && draft) {
    const cls = draft.cls;
    const colHeads = cls.colHeads.filter((col) => draft.colIds.includes(col.headId));
    const rowHeads: Head[] = [
      ...cls.rowHeads.filter((row) => draft.rowIds.includes(row.headId)),
      ...draft.customRows.map((row) => ({ ...row, required: false, valType: 1 as const })),
    ];
    const customIds = new Set(draft.customRows.map((row) => row.headId));

    return (
      <div className="bcp-st-editor">
        <div className="bcp-st-editor-head">
          <button type="button" className="bcp-st-back" onClick={backToList}>
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <path d="M9 2L4 7l5 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            返回模板列表
          </button>
          <div>
            <h2 className="bcp-st-title">{editingId ? '编辑尺码模板' : '新增尺码模板'}</h2>
            <p className="bcp-st-sub">
              {editingId ? `模板 ID ${editingId} · ${categoryLabel(draft.catePubId)}` : categoryLabel(draft.catePubId)}
            </p>
          </div>
        </div>

        <section className="bcp-card bcp-st-card">
          <div className="bcp-section-title">基础信息</div>
          <div className="bcp-st-form">
            <div className="bcp-field">
              <span className="bcp-field__label" style={{ width: 110 }}>发布类目</span>
              <span className="bcp-field__content">
                <span className="bcp-st-readonly">{categoryLabel(draft.catePubId)}</span>
              </span>
            </div>
            <div className="bcp-field">
              <span className="bcp-field__label is-required" style={{ width: 110 }}>尺码表类型</span>
              <span className="bcp-field__content">
                <span className="bcp-st-anchor" data-annotation-id="size-form-class">
                  {editingId ? (
                    <span className="bcp-st-readonly">
                      {cls.classNameCn} · {cls.seriesName}
                      <em className="bcp-st-lock">类型创建后不可修改</em>
                    </span>
                  ) : (
                    <Select
                      width={300}
                      value={cls.classId}
                      options={classList(draft.catePubId).map((item) => ({
                        value: item.classId,
                        label: `${item.classNameCn} · ${item.seriesName}`,
                      }))}
                      onChange={changeClass}
                    />
                  )}
                </span>
              </span>
            </div>
            <div className="bcp-field">
              <span className="bcp-field__label is-required" style={{ width: 110 }}>模板名称</span>
              <span className="bcp-field__content">
                <span className="bcp-st-anchor" data-annotation-id="size-form-name">
                  <input
                    className={`bcp-input bcp-st-name-input${errors.name ? ' is-error' : ''}`}
                    placeholder="请输入模板名称"
                    maxLength={128}
                    value={draft.templateName}
                    onChange={(e) => setDraft({ ...draft, templateName: e.target.value })}
                  />
                  <span className="bcp-st-counter">{draft.templateName.length}/128</span>
                </span>
                {errors.name ? <span className="bcp-st-error">{errors.name}</span> : null}
              </span>
            </div>
            <div className="bcp-field">
              <span className="bcp-field__label" style={{ width: 110 }}>尺码误差</span>
              <span className="bcp-field__content">
                <span className="bcp-st-anchor" data-annotation-id="size-form-error">
                  <input
                    className={`bcp-input bcp-input--num${errors.error ? ' is-error' : ''}`}
                    placeholder="起始值"
                    value={draft.errorStart}
                    onChange={(e) => setDraft({ ...draft, errorStart: e.target.value })}
                  />
                  <span className="bcp-st-sep">~</span>
                  <input
                    className={`bcp-input bcp-input--num${errors.error ? ' is-error' : ''}`}
                    placeholder="结束值"
                    value={draft.errorEnd}
                    onChange={(e) => setDraft({ ...draft, errorEnd: e.target.value })}
                  />
                  <span className="bcp-st-unit">cm</span>
                  <span className="bcp-st-inline-hint">选填，范围 0~5，最多两位小数</span>
                </span>
                {errors.error ? <span className="bcp-st-error">{errors.error}</span> : null}
              </span>
            </div>
          </div>
        </section>

        <section className="bcp-card bcp-st-card">
          <div className="bcp-section-title">
            尺码表结构
            <span className="bcp-section-title__extra">必填测量项由类目尺码表固定，不可取消</span>
          </div>
          <div className="bcp-st-chips-block" data-annotation-id="size-form-colheads">
            <div className="bcp-st-chips-label">测量项（列）</div>
            <div className="bcp-st-chips">
              {cls.colHeads.map((col) => {
                const on = draft.colIds.includes(col.headId);
                return (
                  <button
                    type="button"
                    key={col.headId}
                    className={`bcp-st-chip${on ? ' is-on' : ''}${col.required ? ' is-locked' : ''}`}
                    onClick={() => toggleCol(col)}
                  >
                    <span className="bcp-st-chip__tick">{on ? '✓' : '+'}</span>
                    {col.headNameCn}
                    {col.valType === 2 ? <em className="bcp-st-chip__tag">区间</em> : null}
                    {col.required ? <b className="bcp-st-chip__req">*</b> : null}
                  </button>
                );
              })}
            </div>
            {errors.cols ? <span className="bcp-st-error">{errors.cols}</span> : null}
          </div>
          <div className="bcp-st-chips-block" data-annotation-id="size-form-rowheads">
            <div className="bcp-st-chips-label">尺码（行）</div>
            <div className="bcp-st-chips">
              {cls.rowHeads.map((row) => {
                const on = draft.rowIds.includes(row.headId);
                return (
                  <button
                    type="button"
                    key={row.headId}
                    className={`bcp-st-chip${on ? ' is-on' : ''}`}
                    onClick={() => toggleRow(row)}
                  >
                    <span className="bcp-st-chip__tick">{on ? '✓' : '+'}</span>
                    {row.headNameCn}
                  </button>
                );
              })}
              {draft.customRows.map((row) => (
                <span className="bcp-st-chip is-on is-custom" key={row.headId}>
                  {row.headNameCn}
                  <span className="bcp-st-chip__tag">自定义</span>
                  <button type="button" className="bcp-st-chip__x" aria-label={`删除${row.headNameCn}`} onClick={() => removeCustom(row.headId)}>×</button>
                </span>
              ))}
              {customAdding ? (
                <span className="bcp-st-custom-form">
                  <input
                    className={`bcp-input${customError ? ' is-error' : ''}`}
                    style={{ width: 120 }}
                    placeholder="如 4XL"
                    autoFocus
                    value={customName}
                    onChange={(e) => { setCustomName(e.target.value); if (customError) setCustomError(''); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } }}
                  />
                  <button type="button" className="bcp-btn bcp-btn--primary bcp-st-btn-sm" onClick={addCustom}>添加</button>
                  <button type="button" className="bcp-btn bcp-st-btn-sm" onClick={() => { setCustomAdding(false); setCustomName(''); setCustomError(''); }}>取消</button>
                </span>
              ) : (
                <button type="button" className="bcp-st-chip bcp-st-chip--add" onClick={() => setCustomAdding(true)}>＋ 自定义尺码</button>
              )}
            </div>
            {customError ? <span className="bcp-st-error">{customError}</span> : null}
            {errors.rows ? <span className="bcp-st-error">{errors.rows}</span> : null}
          </div>
        </section>

        <section className="bcp-card bcp-st-card">
          <div className="bcp-section-title">
            尺码表
            <span className="bcp-section-title__extra">数值最多两位小数；区间列需填写起止值</span>
          </div>
          <div className="bcp-st-matrix-wrap" data-annotation-id="size-form-matrix">
            <table className="bcp-st-matrix">
              <thead>
                <tr>
                  <th>尺码</th>
                  {colHeads.map((col) => (
                    <th key={col.headId}>
                      {col.headNameCn}
                      {col.required ? <b className="bcp-st-chip__req">*</b> : null}
                      <span className="bcp-st-matrix__sub">{col.unit} · {col.valType === 2 ? '区间值' : '单值'}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rowHeads.length === 0 || colHeads.length === 0 ? (
                  <tr>
                    <td colSpan={colHeads.length + 1}>
                      <div className="bcp-empty">请先选择测量项和尺码</div>
                    </td>
                  </tr>
                ) : rowHeads.map((row) => (
                  <tr key={row.headId}>
                    <td>
                      {row.headNameCn}
                      {customIds.has(row.headId) ? <span className="bcp-st-custom-tag">自定义</span> : null}
                    </td>
                    {colHeads.map((col) => {
                      const key = `${row.headId}|${col.headId}`;
                      const cell = draft.values[key] ?? { val1: '', val2: '' };
                      return (
                        <td key={col.headId}>
                          {col.valType === 2 ? (
                            <span className="bcp-st-cell-pair">
                              <input
                                className={`bcp-st-cell${cellErrors[key] ? ' is-error' : ''}`}
                                inputMode="decimal"
                                value={cell.val1}
                                onChange={(e) => setCell(key, 'val1', e.target.value)}
                              />
                              <span>~</span>
                              <input
                                className={`bcp-st-cell${cellErrors[key] ? ' is-error' : ''}`}
                                inputMode="decimal"
                                value={cell.val2}
                                onChange={(e) => setCell(key, 'val2', e.target.value)}
                              />
                            </span>
                          ) : (
                            <input
                              className={`bcp-st-cell${cellErrors[key] ? ' is-error' : ''}`}
                              inputMode="decimal"
                              value={cell.val1}
                              onChange={(e) => setCell(key, 'val1', e.target.value)}
                            />
                          )}
                          {cellErrors[key] ? <span className="bcp-st-cell-error">{cellErrors[key]}</span> : null}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {errors.cells ? <div className="bcp-st-error">{errors.cells}</div> : null}
          <div className="bcp-st-form-foot">
            <button type="button" className="bcp-btn" onClick={backToList}>取消</button>
            <button type="button" className="bcp-btn bcp-btn--primary" data-annotation-id="size-form-save" onClick={save}>
              {editingId ? '保存修改' : '创建模板'}
            </button>
          </div>
        </section>
      </div>
    );
  }

  const normalizedKeyword = keyword.trim().toLowerCase();
  const categoryOptions = [
    { value: ALL_CATEGORIES, label: '全部类目' },
    ...categoriesOfSeries(seriesKey),
  ];
  const filteredTemplates = templates.filter((template) => (
    seriesOfCategory(template.catePubId) === seriesKey
    && (category === ALL_CATEGORIES || template.catePubId === category)
    && (!normalizedKeyword
      || template.templateName.toLowerCase().includes(normalizedKeyword)
      || template.templateNameCn.toLowerCase().includes(normalizedKeyword))
  ));
  const total = filteredTemplates.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageTemplates = filteredTemplates.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <section className="bcp-card bcp-st-list">
      <div className="bcp-st-head" data-annotation-id="size-page-intro">
        <h2 className="bcp-st-title">尺码模板设置</h2>
      </div>

      <div className="bcp-st-series" role="tablist" aria-label="尺码系列" data-annotation-id="size-series-tabs">
        {SERIES.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={seriesKey === item.key}
            className={`bcp-st-series__tab${seriesKey === item.key ? ' is-active' : ''}`}
            onClick={() => changeSeries(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="bcp-toolbar">
        <div className="bcp-toolbar__left">
          <span className="bcp-toolbar__label">发布类目</span>
          <span className="bcp-st-anchor" data-annotation-id="size-category-filter">
            <Select
              width={200}
              value={category}
              options={categoryOptions}
              onChange={(value) => changeCategory(String(value))}
            />
          </span>
          <span className="bcp-toolbar__label">模板名称</span>
          <span className="bcp-st-anchor" data-annotation-id="size-name-filter">
            <input
              className="bcp-input"
              style={{ width: 220 }}
              placeholder="输入模板名称搜索"
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
            />
          </span>
          <button type="button" className="bcp-btn" data-annotation-id="size-reset-btn" onClick={resetSearch}>重置</button>
        </div>
        <div className="bcp-toolbar__right">
          <button type="button" className="bcp-btn" data-annotation-id="size-sync-btn" disabled={syncing} onClick={() => syncTemplates()}>
            {syncing ? (
              <>
                <Spinner />
                同步中…
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                  <path d="M11.6 5.1A4.8 4.8 0 1 0 12 8" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  <path d="M12.2 2.4v2.8H9.4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                同步敦煌模板
              </>
            )}
          </button>
          <button type="button" className="bcp-btn bcp-btn--primary" data-annotation-id="size-add-btn" onClick={startAdd}>＋ 新增尺码模板</button>
        </div>
      </div>

      <div className="bcp-st-table-wrap">
      <table className="bcp-table bcp-st-table">
        <thead>
          <tr>
            <th data-annotation-id="size-name-col" style={{ width: '38%', textAlign: 'left', paddingLeft: 16 }}>模板名称</th>
            <th data-annotation-id="size-id-col" style={{ width: '32%', textAlign: 'left' }}>模板 ID</th>
            <th data-annotation-id="size-delete-note" style={{ width: '30%' }}>操作</th>
          </tr>
        </thead>
        <tbody>
          {pageTemplates.length === 0 ? (
            <tr>
              <td colSpan={3}>
                <div className="bcp-empty">
                  {normalizedKeyword
                    ? '未找到匹配的尺码模板，请调整模板名称'
                    : category === ALL_CATEGORIES
                      ? '当前系列暂无本地模板，可点击「同步敦煌模板」获取'
                      : '该发布类目下暂无本地模板，可点击「同步敦煌模板」获取'}
                </div>
              </td>
            </tr>
          ) : pageTemplates.map((template, index) => (
            <tr key={template.sizeTemplateId}>
              <td style={{ textAlign: 'left', paddingLeft: 16 }}>
                <span className="bcp-st-name">
                  <span className="bcp-st-name__cn">{template.templateNameCn}</span>
                  <span className="bcp-st-name__en">{template.templateName}</span>
                </span>
              </td>
              <td style={{ textAlign: 'left' }}>
                <span className="bcp-st-id">{template.sizeTemplateId}</span>
              </td>
              <td>
                <span className="bcp-ops">
                  <button
                    type="button"
                    className="bcp-link"
                    data-annotation-id={index === 0 ? 'size-edit-op' : undefined}
                    onClick={() => startEdit(template)}
                  >
                    编辑
                  </button>
                  <button
                    type="button"
                    className="bcp-link"
                    data-annotation-id={index === 0 ? 'size-copy-op' : undefined}
                    onClick={() => startCopy(template)}
                  >
                    复制
                  </button>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      <div className="bcp-st-foot">
        <div className="bcp-st-count">
          共 {total} 个模板
          <span className="bcp-st-sync-time">上次同步 {formatSyncTime(syncedAt)}</span>
        </div>
        <div className="bcp-pagination" data-annotation-id="size-pagination">
          <select
            className="bcp-pagination__size"
            aria-label="每页条数"
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
          >
            {PAGE_SIZES.map((size) => <option key={size} value={size}>{size} 条/页</option>)}
          </select>
          <button
            type="button"
            className="bcp-page-btn"
            aria-label="上一页"
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
          >
            ‹
          </button>
          {Array.from({ length: pageCount }).map((_, index) => {
            const pageNo = index + 1;
            return (
              <button
                key={pageNo}
                type="button"
                className={`bcp-page-btn${pageNo === currentPage ? ' is-active' : ''}`}
                onClick={() => setPage(pageNo)}
              >
                {pageNo}
              </button>
            );
          })}
          <button
            type="button"
            className="bcp-page-btn"
            aria-label="下一页"
            disabled={currentPage === pageCount}
            onClick={() => setPage(currentPage + 1)}
          >
            ›
          </button>
        </div>
      </div>

      {copyTarget ? (
        <Modal
          title="复制尺码模板"
          width={560}
          onClose={() => setCopyTarget(null)}
          footer={
            <>
              <button type="button" className="bcp-btn" onClick={() => setCopyTarget(null)}>取消</button>
              <button type="button" className="bcp-btn bcp-btn--primary" onClick={confirmCopy}>确认复制</button>
            </>
          }
        >
          <div className="bcp-st-copy-info">
            <div className="bcp-st-copy-info__row"><span>源模板</span><b>{copyTarget.templateNameCn}</b><em>{copyTarget.templateName}</em></div>
            <div className="bcp-st-copy-info__row"><span>模板 ID</span><b className="bcp-st-id">{copyTarget.sizeTemplateId}</b></div>
            <div className="bcp-st-copy-info__row"><span>尺码表类型</span><b>{resolveClass(copyTarget).classNameCn} · {resolveClass(copyTarget).seriesName}</b></div>
          </div>
          <div className="bcp-field">
            <span className="bcp-field__label is-required" style={{ width: 110 }}>目标发布类目</span>
            <span className="bcp-field__content">
              <span className="bcp-st-anchor" data-annotation-id="size-copy-target">
                <Select
                  width={300}
                  value={copyCategory}
                  options={CATEGORIES.filter((item) => item.series === seriesOfCategory(copyTarget.catePubId))}
                  onChange={(value) => setCopyCategory(String(value))}
                />
              </span>
            </span>
          </div>
          <div className="bcp-field">
            <span className="bcp-field__label is-required" style={{ width: 110 }}>新模板名称</span>
            <span className="bcp-field__content">
              <span className="bcp-st-anchor" data-annotation-id="size-copy-name">
                <input
                  className="bcp-input"
                  style={{ width: 300 }}
                  maxLength={128}
                  placeholder="请输入新模板名称"
                  value={copyName}
                  onChange={(e) => setCopyName(e.target.value)}
                />
              </span>
            </span>
          </div>
          <div className="bcp-st-copy-hint">复制会沿用源模板的尺码表结构，新模板归属到目标发布类目。</div>
        </Modal>
      ) : null}
    </section>
  );
}
