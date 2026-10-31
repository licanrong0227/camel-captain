/**
 * 检测结果的统一投影：一条命中记录 = 一条问题，归属一个检测项，带一个位置。
 * 位置只用于定位，不作为计数单位；商品整体也只是位置之一，不再单独聚合「整品风险」。
 */
import { Anchor, AnchorType, Block, ImageKey, ItemCode } from './scenarios';
import { ItemView } from './store';

export type IssueSeverity = 'violation' | 'suspect' | 'notice' | 'fail';

export type IssueEvidence =
  | { kind: 'text'; label?: string; text: string; word?: string }
  | { kind: 'image'; label?: string; src: ImageKey };

export interface Issue {
  key: string;
  code: ItemCode;
  itemName: string;
  severity: IssueSeverity;
  /** 覆盖风险类型标签（如限售资质显示「建议自查」） */
  severityLabel?: string;
  anchor: Anchor;
  anchorKey: string;
  reason: string;
  position?: string;
  /** 参考信息仅随结果保存，前端不展示 */
  reference?: Block[];
  suggestion?: string;
  suggestionValue?: string;
  evidence?: IssueEvidence;
}

export interface IssueCounts {
  violation: number;
  suspect: number;
  notice: number;
  fail: number;
}

export interface AnchorGroup {
  key: string;
  anchor: Anchor;
  label: string;
  issues: Issue[];
  severity: IssueSeverity;
  counts: IssueCounts;
}

const SECTION_ORDER: AnchorType[] = [
  'product', 'title', 'category', 'mainImage', 'skuImage', 'skuTable', 'ladder', 'sizeChart', 'attribute', 'detailText', 'detailImage',
];

export const SEVERITY_RANK: Record<IssueSeverity, number> = { violation: 4, suspect: 3, notice: 2, fail: 1 };

export function anchorKey(anchor: Anchor): string {
  switch (anchor.type) {
    case 'attribute':
      return `attribute:${anchor.field ?? 'Material'}`;
    case 'ladder':
      return anchor.index ? `ladder:${anchor.index}` : 'ladder';
    case 'skuTable':
      return anchor.sku ? `skuTable:${anchor.sku}` : 'skuTable';
    case 'mainImage':
    case 'skuImage':
    case 'detailText':
    case 'detailImage':
      return `${anchor.type}:${anchor.index ?? 1}`;
    default:
      return anchor.type;
  }
}

export function anchorLabel(anchor: Anchor): string {
  switch (anchor.type) {
    case 'product':
      return '商品整体';
    case 'title':
      return '商品标题';
    case 'category':
      return '商品类目';
    case 'attribute':
      return anchor.field ? `商品属性 · ${anchor.field}` : '商品属性';
    case 'ladder':
      return anchor.index ? `批发阶梯价 第 ${anchor.index} 档` : '批发阶梯价';
    case 'skuTable':
      return anchor.sku ? `SKU · ${anchor.sku}` : 'SKU 列表';
    case 'sizeChart':
      return '尺码表';
    case 'mainImage':
      return `主图 ${anchor.index ?? 1}`;
    case 'skuImage':
      return `SKU 图 ${anchor.index ?? 1}`;
    case 'detailText':
      return `详情文字 ${anchor.index ?? 1}`;
    case 'detailImage':
      return `详情图 ${anchor.index ?? 1}`;
    default:
      return '商品信息';
  }
}

/** 位置文本兜底推断：标注面板的预览场景没有显式锚点 */
export function inferAnchor(position?: string): Anchor {
  const text = (position ?? '').trim();
  if (!text) return { type: 'product' };

  const ladder = text.match(/批发阶梯价第\s*(\d+)\s*档/);
  if (ladder) return { type: 'ladder', index: Number(ladder[1]) };

  const attribute = text.match(/商品属性区\s*·\s*(.+)/);
  if (attribute) return { type: 'attribute', field: attribute[1].trim() };

  const detail = text.match(/详情图第\s*(\d+)\s*张/);
  if (detail) return { type: 'detailImage', index: Number(detail[1]) };

  if (/详情文字|详情文本/.test(text)) return { type: 'detailText', index: 1 };
  if (/商品标题|标题/.test(text)) return { type: 'title' };
  if (/类目/.test(text)) return { type: 'category' };
  if (/尺码表/.test(text)) return { type: 'sizeChart' };
  if (/SKU\s*图/.test(text)) return { type: 'skuImage', index: 1 };
  if (/SKU/.test(text)) return { type: 'skuTable' };
  if (/详情图/.test(text)) return { type: 'detailImage', index: 1 };
  if (/主图/.test(text)) return { type: 'mainImage', index: 1 };
  return { type: 'product' };
}

/** 从参考信息里抽一条可展示的证据，参考信息本身不渲染 */
function evidenceOf(blocks?: Block[]): IssueEvidence | undefined {
  if (!blocks) return undefined;
  for (const block of blocks) {
    if (block.kind === 'text') {
      return { kind: 'text', label: block.label ?? block.field, text: block.fragment, word: block.word };
    }
    if (block.kind === 'image') {
      return { kind: 'image', label: block.label, src: block.src };
    }
    if (block.kind === 'ocr') {
      const line = block.lines.find((entry) => entry.hit) ?? block.lines[0];
      if (line) return { kind: 'text', label: block.label, text: line.text, word: line.text };
    }
  }
  return undefined;
}

function severityOfHit(hit: { severity?: 'violation' | 'suspect' | 'manual'; severityLabel?: string }, itemStatus: ItemView['status']): IssueSeverity {
  if (hit.severity === 'manual' || hit.severityLabel === '建议自查') return 'notice';
  if (hit.severity === 'suspect') return itemStatus === 'manual' ? 'notice' : 'suspect';
  if (hit.severity === 'violation') return 'violation';
  if (itemStatus === 'violation') return 'violation';
  if (itemStatus === 'manual') return 'notice';
  return 'suspect';
}

export function flattenIssues(items: ItemView[]): Issue[] {
  const issues: Issue[] = [];

  items.forEach((item) => {
    const outcome = item.outcome;
    if (!outcome) return;

    // 状态仍是 pass/queued 时忽略 outcome 里的命中记录（预览场景会强制改状态）
    const problematic = item.status === 'violation' || item.status === 'suspect' || item.status === 'manual';
    if (problematic && outcome.hits && outcome.hits.length > 0) {
      outcome.hits.forEach((hit, index) => {
        const severity = severityOfHit(hit, item.status);
        const anchor = hit.anchor ?? inferAnchor(hit.position);
        issues.push({
          key: `${item.code}:${index}`,
          code: item.code,
          itemName: item.name,
          severity,
          severityLabel: hit.severityLabel,
          anchor,
          anchorKey: anchorKey(anchor),
          reason: hit.reason,
          position: hit.position,
          reference: hit.reference,
          suggestion: hit.suggestion,
          evidence: evidenceOf(hit.reference),
        });
      });
      return;
    }

    if (problematic) {
      const anchor = outcome.anchor ?? inferAnchor(outcome.hitPosition);
      const severity: IssueSeverity = item.status === 'violation' ? 'violation' : item.status === 'manual' ? 'notice' : 'suspect';
      issues.push({
        key: `${item.code}:0`,
        code: item.code,
        itemName: item.name,
        severity,
        severityLabel: item.status === 'manual' ? '建议自查' : undefined,
        anchor,
        anchorKey: anchorKey(anchor),
        reason: outcome.hitReason ?? outcome.conclusion,
        position: outcome.hitPosition,
        reference: outcome.reference,
        suggestion: outcome.suggestion,
        suggestionValue: outcome.suggestionValue,
        evidence: evidenceOf(outcome.reference),
      });
      return;
    }

    if (item.status === 'fail') {
      const anchor = outcome.failAnchor ?? { type: 'product' };
      issues.push({
        key: `${item.code}:0`,
        code: item.code,
        itemName: item.name,
        severity: 'fail',
        anchor,
        anchorKey: anchorKey(anchor),
        reason: outcome.failReason ?? outcome.conclusion,
      });
    }
  });

  return issues.sort(compareIssues);
}

function compareIssues(a: Issue, b: Issue): number {
  const section = SECTION_ORDER.indexOf(a.anchor.type) - SECTION_ORDER.indexOf(b.anchor.type);
  if (section !== 0) return section;
  const index = (a.anchor.index ?? 0) - (b.anchor.index ?? 0);
  if (index !== 0) return index;
  return SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity];
}

export function groupByAnchor(issues: Issue[]): AnchorGroup[] {
  const map = new Map<string, AnchorGroup>();
  issues.forEach((issue) => {
    const existing = map.get(issue.anchorKey);
    if (existing) {
      existing.issues.push(issue);
      existing.counts[issue.severity] += 1;
      if (SEVERITY_RANK[issue.severity] > SEVERITY_RANK[existing.severity]) existing.severity = issue.severity;
      return;
    }
    map.set(issue.anchorKey, {
      key: issue.anchorKey,
      anchor: issue.anchor,
      label: anchorLabel(issue.anchor),
      issues: [issue],
      severity: issue.severity,
      counts: {
        violation: issue.severity === 'violation' ? 1 : 0,
        suspect: issue.severity === 'suspect' ? 1 : 0,
        notice: issue.severity === 'notice' ? 1 : 0,
        fail: issue.severity === 'fail' ? 1 : 0,
      },
    });
  });
  return [...map.values()];
}

/** 锚点是否被某个检测项覆盖（用于渲染「已检查」） */
export function coverageMatches(pattern: string, key: string): boolean {
  if (pattern.endsWith(':*')) return key.startsWith(pattern.slice(0, -1));
  return key === pattern || key.startsWith(`${pattern}:`);
}

export function countBySeverity(issues: Issue[]): IssueCounts {
  return {
    violation: issues.filter((issue) => issue.severity === 'violation').length,
    suspect: issues.filter((issue) => issue.severity === 'suspect').length,
    notice: issues.filter((issue) => issue.severity === 'notice').length,
    fail: issues.filter((issue) => issue.severity === 'fail').length,
  };
}

/** 结构化计数文案：违规 → 疑似 → 建议自查 → 检测失败 */
export function describeCounts(counts: IssueCounts): string {
  const parts: string[] = [];
  if (counts.violation) parts.push(`${counts.violation} 处违规`);
  if (counts.suspect) parts.push(`${counts.suspect} 处疑似`);
  if (counts.notice) parts.push(`${counts.notice} 项建议自查`);
  if (counts.fail) parts.push(`${counts.fail} 项检测失败`);
  return parts.join(' · ');
}

/** 同一位置取最高等级，用于高亮配色 */
export function highestSeverity(issues: Issue[]): IssueSeverity | undefined {
  return issues.reduce<IssueSeverity | undefined>((current, issue) => {
    if (!current) return issue.severity;
    return SEVERITY_RANK[issue.severity] > SEVERITY_RANK[current] ? issue.severity : current;
  }, undefined);
}

export function highestIssue(issues: Issue[]): Issue | undefined {
  return issues.reduce<Issue | undefined>((current, issue) => {
    if (!current) return issue;
    return SEVERITY_RANK[issue.severity] > SEVERITY_RANK[current.severity] ? issue : current;
  }, undefined);
}
