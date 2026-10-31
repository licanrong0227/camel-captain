import React, { useEffect, useMemo, useRef, useState } from 'react';
import { setProtoDevState, useProtoDevState } from '@axhub/annotation';
import {
  computeTaskView,
  getTask,
  mutateTask,
  recheckInPlace,
  recheckAsNewRecord,
  retryCollect,
  retryItem,
  itemFinishedAt,
  setFeedback,
  resolveDhgateInput,
  ItemStatus,
  ItemView,
  ResultFeedback,
  TaskStatus,
} from '../lib/store';
import { ItemCode, ITEM_DEFS } from '../lib/scenarios';
import {
  composeScene,
  DEMO_RESET_STATE,
  OVERRIDE_RESET_STATE,
  PagePresetValue,
  isDemoRecord,
} from '../lib/demoScenarios';
import { Issue, countBySeverity, flattenIssues, highestIssue } from '../lib/issues';
import { getProductSnapshot } from '../lib/product';
import { showToast } from '../components/ui';
import { ConnectorLines } from '../components/ConnectorLines';
import { ItemCard, PassItemRow } from '../components/ItemCard';
import { FeedbackDialog, RecheckDialog, RecheckMode } from '../components/Dialogs';
import { ProductView } from '../components/ProductView';

type DialogState =
  | { type: 'feedback'; code: ItemCode; resultKey: string; context: string; presetReasons?: string[] }
  | { type: 'recheck' };

const issueDiffKey = (issue: { code: ItemCode; anchorKey: string }) => `${issue.code}|${issue.anchorKey}`;

const STATUS_ORDER: Record<ItemStatus, number> = {
  violation: 0,
  suspect: 1,
  manual: 2,
  fail: 3,
  running: 4,
  queued: 5,
  pass: 6,
};

export function DetailPage({
  taskId,
  initialFocus,
  initialPreset,
  initialLive,
  onBack,
  onOpenTask,
}: {
  taskId: string;
  initialFocus?: ItemCode;
  initialPreset?: PagePresetValue;
  initialLive?: boolean;
  onBack: () => void;
  onOpenTask: (taskId: string) => void;
}) {
  const [, setTick] = useState(0);
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [urlDraft, setUrlDraft] = useState('');
  const [urlError, setUrlError] = useState('');
  const [version, setVersion] = useState(0);
  const [activeAnchor, setActiveAnchor] = useState<string | null>(null);
  const [activeIssueKey, setActiveIssueKey] = useState<string | null>(null);
  const [linkedKeys, setLinkedKeys] = useState<string[]>([]);
  const [historyResetToken, setHistoryResetToken] = useState(0);
  const [linkMode, setLinkMode] = useState<'anchor' | 'issue'>('anchor');
  const [hoverAnchor, setHoverAnchor] = useState<string | null>(null);
  const [expandedCodes, setExpandedCodes] = useState<ItemCode[]>([]);
  const [passOpen, setPassOpen] = useState(false);
  const [showBackTop, setShowBackTop] = useState(false);
  const [diffBase, setDiffBase] = useState<string[] | null>(null);
  const [diff, setDiff] = useState<{ fixed: number; remain: number; added: number } | null>(null);
  const protoState = useProtoDevState<Record<string, unknown>>();
  const sideRef = useRef<HTMLDivElement>(null);
  const userToggled = useRef(false);
  const autoExpanded = useRef(false);
  const passToggled = useRef(false);

  const task = useMemo(() => getTask(taskId), [taskId, version]);
  const now = Date.now();
  const view = useMemo(() => (task ? computeTaskView(task, now) : null), [task, Math.floor(now / 1000), version]);
  const snapshot = useMemo(() => (task ? getProductSnapshot(task) : null), [task, version]);

  useEffect(() => {
    setUrlDraft(getTask(taskId)?.url ?? '');
    setUrlError('');
  }, [taskId]);

  useEffect(() => {
    setDiff(null);
    setDiffBase(null);
    setActiveAnchor(null);
    setActiveIssueKey(null);
    setLinkedKeys([]);
    setHoverAnchor(null);
    setExpandedCodes([]);
    setPassOpen(false);
    userToggled.current = false;
    autoExpanded.current = false;
    passToggled.current = false;
  }, [taskId]);

  const running = view ? ['pending', 'collecting', 'checking'].includes(view.status) : false;
  useEffect(() => {
    if (!running) return undefined;
    const timer = window.setInterval(() => setTick((prev) => prev + 1), 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  useEffect(() => {
    const onScroll = () => setShowBackTop(window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [taskId]);

  // 点击页面留白隐藏连线并取消选中/定位；条目、商品信息问题位置、按钮等交互区域忽略
  useEffect(() => {
    const onBlankClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!target?.closest) return;
      if (target.closest('.dcc-issue-entry, [data-locate-dot], [data-locate-dot-for], .dcc-pv-overall-item, .has-issue, .dcc-modal, [role="dialog"], .dcc-lightbox, .dcc-toast-host, button, a, input, select, textarea, label')) return;
      setLinkedKeys([]);
      setActiveAnchor(null);
      setActiveIssueKey(null);
    };
    document.addEventListener('click', onBlankClick, true);
    return () => document.removeEventListener('click', onBlankClick, true);
  }, []);

  /* ---- 演示场景合成：整页预设 + 模块场景 + 单检测项覆盖（仅箱包模板记录） ---- */
  const isDemoTask = isDemoRecord(task);
  const pageState = typeof protoState.page_state === 'string' ? protoState.page_state : 'flow';
  const lastPageState = useRef<string | null>(null);
  const appliedPreset = useRef<string | null>(null);
  const entryApplied = useRef(false);

  useEffect(() => {
    if (!isDemoTask) return;
    appliedPreset.current = pageState;
    if (lastPageState.current === null || lastPageState.current === pageState) {
      lastPageState.current = pageState;
      return;
    }
    lastPageState.current = pageState;
    setProtoDevState(OVERRIDE_RESET_STATE);
  }, [isDemoTask, pageState]);

  useEffect(() => {
    if (!isDemoTask) return;
    const target = initialPreset ?? 'flow';
    if (entryApplied.current && appliedPreset.current === target) return;
    entryApplied.current = true;
    appliedPreset.current = target;
    setProtoDevState(target === 'flow'
      ? { ...DEMO_RESET_STATE, collect_state: 'flow' }
      : { ...OVERRIDE_RESET_STATE, page_state: target, collect_state: 'flow' });
  }, [isDemoTask, initialPreset]);

  useEffect(() => {
    if (isDemoTask) return;
    setProtoDevState(DEMO_RESET_STATE);
  }, [isDemoTask]);

  const scene = task && view && snapshot
    ? composeScene({
        enabled: isDemoTask,
        baseSnapshot: snapshot,
        baseItems: view.items,
        baseStatus: view.status,
        pageState,
        moduleStates: protoState,
        itemStates: protoState,
      })
    : null;

  const liveCollecting = Boolean(initialLive && isDemoTask && view && (view.status === 'pending' || view.status === 'collecting'));
  const liveProgressive = Boolean(initialLive && isDemoTask && scene && view && view.status === 'checking');
  const liveItems = liveProgressive && scene && view
    ? view.items.map((real) => {
        const revealed = !['queued', 'running'].includes(real.status);
        return revealed ? (scene.items.find((item) => item.code === real.code) ?? real) : real;
      })
    : null;

  const statusShown: TaskStatus = protoState.collect_state === 'failed'
    ? 'collect-failed'
    : liveCollecting && view
      ? view.status
      : liveProgressive
        ? 'checking'
        : (scene?.statusShown ?? view?.status ?? 'pending');
  const composedSnapshot = scene?.snapshot ?? snapshot;

  const collectLoading = statusShown === 'pending' || statusShown === 'collecting';
  const itemsShown: ItemView[] = !scene || statusShown === 'collect-failed' || collectLoading
    ? []
    : (liveItems ?? scene.items);
  const issues = flattenIssues(itemsShown);
  const issueCounts = countBySeverity(issues);
  const settled = statusShown === 'done' || statusShown === 'partial-fail';
  const checking = itemsShown.some((item) => item.status === 'queued' || item.status === 'running');
  const progress = {
    done: itemsShown.filter((item) => item.status !== 'queued' && item.status !== 'running').length,
    total: ITEM_DEFS.length,
  };

  const activeItems = itemsShown
    .filter((item) => item.status !== 'pass')
    .sort((a, b) => (settled ? STATUS_ORDER[a.status] - STATUS_ORDER[b.status] : 0));
  const passItems = itemsShown.filter((item) => item.status === 'pass');

  /* ---- 默认展开第一个问题项；用户手动操作后不再自动改 ---- */
  const firstProblemCode = itemsShown.find((item) => ['violation', 'suspect', 'manual'].includes(item.status))?.code;
  useEffect(() => {
    if (collectLoading || userToggled.current || autoExpanded.current || !firstProblemCode) return;
    autoExpanded.current = true;
    setExpandedCodes([firstProblemCode]);
  }, [firstProblemCode, collectLoading]);

  // 全部通过时没有展开项可看，直接把通过分组展开；出现问题时再收起
  useEffect(() => {
    if (!passToggled.current && activeItems.length === 0 && passItems.length > 0) setPassOpen(true);
  }, [activeItems.length, passItems.length]);

  useEffect(() => {
    if (!passToggled.current && activeItems.length > 0) setPassOpen(false);
  }, [activeItems.length]);

  /* ---- 右栏滚动：只滚侧栏，不带动左侧商品信息 ---- */
  const scrollSideTo = (element: HTMLElement | null) => {
    const side = sideRef.current;
    if (!side || !element) return;
    const head = side.querySelector('.dcc-side-head') as HTMLElement | null;
    const offset = (head?.offsetHeight ?? 0) + 16;
    const sideRect = side.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    side.scrollTo({ top: side.scrollTop + elementRect.top - sideRect.top - offset, behavior: 'smooth' });
  };

  const locate = (anchorKey: string, issueKey?: string, source: 'anchor' | 'issue' = 'anchor') => {
    // 历史轮次下从商品信息发起连线时，先让右栏回到最新一轮
    setHistoryResetToken((prev) => prev + 1);
    setLinkMode(source);
    setActiveAnchor(anchorKey);
    const matches = issues.filter((issue) => issue.anchorKey === anchorKey);
    const target = issueKey ?? highestIssue(matches)?.key ?? null;
    const targetIssue = target ? issues.find((issue) => issue.key === target) : undefined;
    if (matches.length > 0) {
      if (source === 'issue' && targetIssue) {
        // 点右栏某条记录：只展开它所属的检测项，不连带展开同位置的其他卡片
        setExpandedCodes((prev) => (prev.includes(targetIssue.code) ? prev : [...prev, targetIssue.code]));
      } else {
        const codes = [...new Set(matches.map((issue) => issue.code))];
        setExpandedCodes(codes);
      }
    }
    setActiveIssueKey(target);
    setLinkedKeys(source === 'issue' && issueKey ? [issueKey] : matches.map((issue) => issue.key));
    window.requestAnimationFrame(() => {
      // 滚动到商品信息上的圆点而不是整块内容：长图高过视口时圆点仍可见，连线才有落点
      const issueDot = target
        ? (document.querySelector(`[data-locate-dot-for="${target}"]`) as HTMLElement | null)
        : null;
      const anchorDot = document.querySelector(`[data-locate-dot="${anchorKey}"]`) as HTMLElement | null;
      (issueDot ?? anchorDot ?? document.getElementById(`anchor-${anchorKey}`))?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
    if (target) {
      window.setTimeout(() => scrollSideTo(document.getElementById(`issue-${target}`)), 120);
    }
  };

  useEffect(() => {
    if (!initialFocus) return undefined;
    autoExpanded.current = true;
    setExpandedCodes([initialFocus]);
    const timer = window.setTimeout(() => scrollSideTo(document.getElementById(`item-${initialFocus}`)), 160);
    return () => window.clearTimeout(timer);
  }, [initialFocus, taskId]);

  const jumpTo = (status: ItemStatus) => {
    if (status === 'pass') {
      setPassOpen(true);
      window.setTimeout(() => scrollSideTo(document.getElementById('dcc-pass-group')), 120);
      return;
    }
    const item = activeItems.find((entry) => entry.status === status);
    if (!item) return;
    setExpandedCodes([item.code]);
    window.setTimeout(() => scrollSideTo(document.getElementById(`item-${item.code}`)), 120);
  };

  const clearFocus = () => {
    setLinkedKeys([]);
    setActiveAnchor(null);
    setActiveIssueKey(null);
  };

  const toggleItem = (code: ItemCode) => {
    userToggled.current = true;
    clearFocus();
    setExpandedCodes((prev) => (prev.includes(code) ? prev.filter((entry) => entry !== code) : [...prev, code]));
  };

  const collapseAll = () => {
    userToggled.current = true;
    passToggled.current = true;
    clearFocus();
    setExpandedCodes([]);
    setPassOpen(false);
  };

  const expandAll = () => {
    userToggled.current = true;
    passToggled.current = true;
    clearFocus();
    setExpandedCodes(activeItems.map((item) => item.code));
    setPassOpen(passItems.length > 0);
  };

  const openCount = activeItems.filter((item) => expandedCodes.includes(item.code)).length;
  const anyOpen = openCount > 0 || (passOpen && passItems.length > 0);
  const allCollapsed = !anyOpen;

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const issueSignature = issues.map(issueDiffKey).join(',');
  const connectorLinks = useMemo(
    () =>
      linkedKeys.flatMap((key) => {
        const issue: Issue | undefined = issues.find((entry) => entry.key === key);
        return issue ? [{ key: issue.key, anchorKey: issue.anchorKey, severity: issue.severity }] : [];
      }),
    [linkedKeys, issueSignature],
  );
  useEffect(() => {
    if (!diffBase) return;
    if (statusShown !== 'done' && statusShown !== 'partial-fail') return;
    const current = new Set(issueSignature ? issueSignature.split(',') : []);
    const previous = new Set(diffBase);
    let fixed = 0;
    let remain = 0;
    let added = 0;
    current.forEach((key) => {
      if (previous.has(key)) remain += 1;
      else added += 1;
    });
    previous.forEach((key) => {
      if (!current.has(key)) fixed += 1;
    });
    setDiff({ fixed, remain, added });
    setDiffBase(null);
  }, [diffBase, statusShown, issueSignature]);

  if (!task || !view || !snapshot) {
    return (
      <div className="dcc-card">
        <div className="dcc-empty">未找到该检测任务。<button type="button" className="dcc-btn dcc-btn--text" onClick={onBack}>返回质检记录</button></div>
      </div>
    );
  }

  const mutate = (fn: () => void) => {
    fn();
    setVersion((prev) => prev + 1);
  };

  const feedbackMap: Record<string, ResultFeedback | undefined> = {};
  itemsShown.forEach((item) => {
    Object.entries(item.override?.resultFeedback ?? {}).forEach(([key, feedback]) => {
      feedbackMap[key] = feedback;
    });
  });

  const openFeedback = (code: ItemCode, resultKey: string, context: string, presetReasons?: string[]) => {
    setDialog({ type: 'feedback', code, resultKey, context, presetReasons });
  };

  const cancelFeedback = (code: ItemCode, resultKey: string) => {
    mutate(() => {
      setFeedback(task.id, code, resultKey, null);
      showToast('info', '已取消反馈');
    });
  };

  const onRetryCollect = () => {
    const raw = urlDraft.trim();
    const effective = raw || task.url;
    const result = resolveDhgateInput(effective);
    if (!result.ok || !result.url) {
      setUrlError(result.error ?? '链接格式不正确，请粘贴完整商品链接');
      return;
    }
    mutate(() => {
      if (raw && result.url !== task.url) {
        mutateTask(task.id, (entry) => {
          entry.url = result.url!;
          if (result.productId) entry.productId = result.productId;
        });
      }
      retryCollect(task.id);
      setProtoDevState({ ...DEMO_RESET_STATE, collect_state: 'flow' });
      setUrlError('');
      showToast('success', '已重新发起采集');
    });
  };

  const onRecheckConfirm = (mode: RecheckMode) => {
    const before = issues.map(issueDiffKey);
    setDialog(null);
    if (mode === 'in-place') {
      mutate(() => {
        recheckInPlace(task.id);
      });
      if (isDemoTask) setProtoDevState({ ...DEMO_RESET_STATE, collect_state: 'flow' });
      setDiff(null);
      setDiffBase(before.length > 0 ? before : null);
      setActiveAnchor(null);
      setActiveIssueKey(null);
      setLinkedKeys([]);
      setExpandedCodes([]);
      userToggled.current = false;
      autoExpanded.current = false;
      passToggled.current = false;
      showToast('success', '已在当前记录重新检测，结果将逐项更新');
      return;
    }
    const newId = recheckAsNewRecord(task.id, isDemoTask);
    if (!newId) return;
    setDiff(null);
    setDiffBase(null);
    showToast('success', '已创建新的检测记录，正在重新采集并检测');
    onOpenTask(newId);
  };

  let conclusionLevel = 'checking';
  let conclusionPrefix = '';
  let conclusionSuffix = '';
  if (checking) {
    conclusionPrefix = `检测进行中，已完成 ${progress.done}/${progress.total} 项`;
  } else if (issueCounts.violation > 0) {
    conclusionLevel = 'reject';
    conclusionPrefix = '不通过：';
  } else if (issueCounts.suspect > 0) {
    conclusionLevel = 'suspect';
    conclusionPrefix = '未发现违规：';
    conclusionSuffix = '，建议人工确认';
  } else if (issueCounts.notice > 0) {
    conclusionLevel = 'notice';
    conclusionPrefix = '未发现违规：';
  } else if (issueCounts.fail > 0) {
    conclusionLevel = 'partial';
    conclusionPrefix = '检测未完成：';
  } else {
    conclusionLevel = 'pass';
    conclusionPrefix = '全部检测通过，未发现问题';
  }
  const conclusionSegments = checking
    ? []
    : [
        { key: 'violation', tone: 'violation', text: `${issueCounts.violation} 处违规`, show: issueCounts.violation > 0 },
        { key: 'suspect', tone: 'suspect', text: `${issueCounts.suspect} 处疑似`, show: issueCounts.suspect > 0 },
        { key: 'notice', tone: 'notice', text: `${issueCounts.notice} 项建议自查`, show: issueCounts.notice > 0 },
        { key: 'fail', tone: 'fail', text: `${issueCounts.fail} 项检测失败`, show: issueCounts.fail > 0 },
      ].filter((segment) => segment.show);

  return (
    <div className="dcc-detail">
      <div className="dcc-detail-topbar">
        <div data-annotation-id="dcc-demo-preset">
          <button type="button" className="dcc-btn" onClick={onBack}>← 返回质检记录</button>
        </div>
        <div className="dcc-detail-topbar-actions" data-annotation-id="dcc-recheck-entry">
          {statusShown !== 'collect-failed' && (
            <button type="button" className="dcc-btn" onClick={() => setDialog({ type: 'recheck' })}>重新检测</button>
          )}
        </div>
      </div>

      {statusShown === 'collect-failed' ? (
        <section className="dcc-card dcc-fail-card" data-annotation-id="dcc-summary-card">
          <div className="dcc-fail-title">采集失败</div>
          <div className="dcc-fail-reason">失败原因：{task.collectFailedReason ?? '未获取到商品数据，请检查链接后重试采集。'}</div>
          <div className="dcc-fail-tip">任务已保存，可修正链接问题后重新采集；期间可离开页面，不影响任务。</div>
          <div className="dcc-edit-url">
            <div className="dcc-edit-url-form">
              <input
                className={`dcc-input${urlError ? ' is-error' : ''}`}
                value={urlDraft}
                onChange={(event) => {
                  setUrlDraft(event.target.value);
                  setUrlError('');
                }}
                placeholder="粘贴正确的敦煌网商品链接或商品 itemCode"
              />
              {urlError && <div className="dcc-field-error">{urlError}</div>}
            </div>
            <div className="dcc-edit-url-hint">链接填错了？直接在这里改成正确的链接或商品 itemCode（会自动补全）；留空则按原链接重新采集。</div>
          </div>
          <button type="button" className="dcc-btn dcc-btn--primary" onClick={onRetryCollect}>重新采集</button>
        </section>
      ) : collectLoading ? (
        <section className="dcc-card dcc-summary-card dcc-summary-card--loading" data-annotation-id="dcc-summary-card">
          <div className="dcc-summary-img dcc-img-skeleton" />
          <div className="dcc-summary-info">
            <div className="dcc-collect-loading-head">
              <span className="dcc-spinner" />
              <span className="dcc-running-text">正在采集商品信息，采集完成前暂无商品数据…</span>
            </div>
            <div className="dcc-skeleton-rows dcc-summary-skeleton-rows">
              <i style={{ width: '72%' }} />
              <i style={{ width: '55%' }} />
              <i style={{ width: '40%' }} />
            </div>
          </div>
        </section>
      ) : (
        <>
          <div data-annotation-id="dcc-conclusion-bar" className={`dcc-conclusion-bar dcc-conclusion-bar--${conclusionLevel}`}>
            <div className="dcc-conclusion-text">
              <span>{conclusionPrefix}</span>
              {conclusionSegments.map((segment, index) => (
                <React.Fragment key={segment.key}>
                  {index > 0 ? ' · ' : ''}
                  <span className={`dcc-count-seg dcc-count-seg--${segment.tone}`}>{segment.text}</span>
                </React.Fragment>
              ))}
              {conclusionSuffix ? <span>{conclusionSuffix}</span> : null}
              {checking && <span className="dcc-spinner dcc-spinner--small" />}
              {diff && (
                <span className="dcc-recheck-diff">
                  本次重新检测：{diff.fixed} 处已修复 · {diff.remain} 处仍存在 · {diff.added} 处新增
                  <button type="button" className="dcc-diff-close" aria-label="关闭摘要" onClick={() => setDiff(null)}>×</button>
                </span>
              )}
            </div>
          </div>

          <div className="dcc-split" data-annotation-id="dcc-split">
            <div className="dcc-split__main">
              <ProductView
                task={task}
                snapshot={composedSnapshot ?? snapshot}
                items={itemsShown}
                issues={issues}
                statusShown={statusShown}
                activeAnchor={activeAnchor}
                activeIssueKey={activeIssueKey}
                hoverAnchor={hoverAnchor}
                onLocate={locate}
                onHover={setHoverAnchor}
              />
            </div>

            <aside className="dcc-split__side" ref={sideRef} data-annotation-id="dcc-side-groups">
              <header className={`dcc-side-head${linkedKeys.length > 0 ? ' is-dimmed' : ''}`}>
                <div className="dcc-side-head-row">
                  <span className="dcc-side-title">检测项汇总</span>
                  <span className="dcc-side-total">{itemsShown.length} 项</span>
                  {checking ? (
                    <span className="dcc-side-progress"><span className="dcc-spinner dcc-spinner--small" />{progress.done}/{progress.total}</span>
                  ) : null}
                  <button type="button" className="dcc-btn dcc-btn--text dcc-side-collapse" onClick={allCollapsed ? expandAll : collapseAll}>
                    {allCollapsed ? '全部展开' : '全部收起'}
                  </button>
                </div>
                <div className="dcc-side-chips" role="group" aria-label="按结果筛选检测项">
                  {issueCounts.violation > 0 && (
                    <button type="button" className="dcc-side-chip dcc-side-chip--violation" onClick={() => jumpTo('violation')}>违规 {issueCounts.violation}</button>
                  )}
                  {issueCounts.suspect > 0 && (
                    <button type="button" className="dcc-side-chip dcc-side-chip--suspect" onClick={() => jumpTo('suspect')}>疑似 {issueCounts.suspect}</button>
                  )}
                  {issueCounts.notice > 0 && (
                    <button type="button" className="dcc-side-chip dcc-side-chip--notice" onClick={() => jumpTo('manual')}>建议自查 {issueCounts.notice}</button>
                  )}
                  {issueCounts.fail > 0 && (
                    <button type="button" className="dcc-side-chip dcc-side-chip--fail" onClick={() => jumpTo('fail')}>检测失败 {issueCounts.fail}</button>
                  )}
                  {passItems.length > 0 && (
                    <button type="button" className="dcc-side-chip dcc-side-chip--pass" onClick={() => jumpTo('pass')}>通过 {passItems.length}</button>
                  )}
                </div>
              </header>

              <div className={`dcc-side-list${linkedKeys.length > 0 ? ' is-linking' : ''}`}>
                {activeItems.map((item) => (
                  <ItemCard
                    key={item.code}
                    view={item}
                    issues={issues.filter((issue) => issue.code === item.code)}
                    expanded={expandedCodes.includes(item.code)}
                    onToggle={() => toggleItem(item.code)}
                    selectedIssueKey={activeIssueKey}
                    activeAnchor={activeAnchor}
                    hoverAnchor={hoverAnchor}
                    feedbackMap={feedbackMap}
                    onLocate={locate}
                    onHover={setHoverAnchor}
                    onFeedback={(resultKey, context, presetReasons) => openFeedback(item.code, resultKey, context, presetReasons)}
                    onCancelFeedback={(resultKey) => cancelFeedback(item.code, resultKey)}
                    onRetry={() =>
                      mutate(() => {
                        retryItem(task.id, item.code, {
                          at: itemFinishedAt(task, item.code),
                          status: item.status,
                          outcome: item.outcome,
                        });
                        showToast('success', `已重试「${item.name}」，仅该项重新检测`);
                      })
                    }
                    linkedIssueKeys={linkedKeys}
                    anchorLinkMode={linkMode === 'anchor'}
                    historyResetToken={historyResetToken}
                    onHistoryViewChange={(viewingHistory) => {
                      // 历史轮次可能命中不同位置，切过去时断开连线并取消当前定位/选中
                      if (!viewingHistory) return;
                      setLinkedKeys([]);
                      setActiveAnchor(null);
                      setActiveIssueKey(null);
                    }}
                    currentAt={itemFinishedAt(task, item.code)}
                  />
                ))}

                {passItems.length > 0 && (
                  <section id="dcc-pass-group" className="dcc-side-pass">
                    <button
                      type="button"
                      className="dcc-side-pass-head"
                      aria-expanded={passOpen}
                      aria-label={passOpen ? '收起通过项' : '展开通过项'}
                      onClick={() => { passToggled.current = true; clearFocus(); setPassOpen((prev) => !prev); }}
                    >
                      <span className="dcc-side-pass-title">检测通过 {passItems.length} 项</span>
                      <span className={`dcc-side-pass-toggle${passOpen ? ' is-open' : ''}`} aria-hidden="true">
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m6 15 6-6 6 6" />
                        </svg>
                      </span>
                    </button>
                    {passOpen && (
                      <div className="dcc-pass-list">
                        {passItems.map((item) => (
                          <PassItemRow
                            key={item.code}
                            view={item}
                            feedback={feedbackMap[`${item.code}:0`]}
                            onFeedback={(resultKey, context, presetReasons) => openFeedback(item.code, resultKey, context, presetReasons)}
                            onCancelFeedback={(resultKey) => cancelFeedback(item.code, resultKey)}
                          />
                        ))}
                      </div>
                    )}
                  </section>
                )}
              </div>
            </aside>
          </div>
        </>
      )}

      {view.status === 'canceled' && (
        <div className="dcc-card dcc-fail-card">
          <div className="dcc-fail-title">任务已取消</div>
          <div className="dcc-fail-tip">可点击右上角「重新检测」创建新任务。</div>
        </div>
      )}

      {dialog?.type === 'recheck' && (
        <RecheckDialog
          onCancel={() => setDialog(null)}
          onConfirm={onRecheckConfirm}
        />
      )}

      {dialog?.type === 'feedback' && (
        <FeedbackDialog
          context={dialog.context}
          initialReasons={dialog.presetReasons}
          onCancel={() => setDialog(null)}
          onSubmit={(reasons, text) =>
            mutate(() => {
              setFeedback(task.id, dialog.code, dialog.resultKey, { reasons, text, at: Date.now() });
              setDialog(null);
              showToast('success', '已提交反馈，感谢');
            })
          }
        />
      )}

      <ConnectorLines links={connectorLinks} />

      {showBackTop && (
        <button
          type="button"
          className="dcc-back-top"
          data-annotation-id="dcc-back-top"
          aria-label="返回顶部"
          title="返回顶部"
          onClick={scrollToTop}
        >
          <span className="dcc-back-top-icon" aria-hidden="true">↑</span>
          返回顶部
        </button>
      )}
    </div>
  );
}
