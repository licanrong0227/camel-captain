import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, HelpCircle, X } from 'lucide-react';
import {
  ComplianceFeedback,
  ComplianceImageKey,
  ComplianceItemCode,
  ComplianceItemDef,
  ComplianceItemRun,
  DISLIKE_REASONS,
  ITEM_DEFS,
  ItemPreview,
  STATUS_TEXT,
  fmtTime,
  getPreviewOutcome,
  summarize,
} from '../lib/compliance';
import main1 from '../assets/main-1.jpg';
import main2 from '../assets/main-2.jpg';
import detail1 from '../assets/detail-1.jpg';
import detail2 from '../assets/detail-2.jpg';

const IMAGE_SRC: Record<ComplianceImageKey, string> = {
  main1,
  main2,
  detail2: detail1,
  detail3: detail2,
};

interface DialogProps {
  open: boolean;
  items: ComplianceItemRun[];
  itemPreviews: Partial<Record<ComplianceItemCode, ItemPreview>>;
  conclusionPreview?: 'pass' | 'issue';
  retryingCode: ComplianceItemCode | null;
  onClose: () => void;
  onRetry: (code: ComplianceItemCode) => void;
  onFeedback: (code: ComplianceItemCode, hitIndex: number, feedback: ComplianceFeedback | null) => void;
}

export default function ComplianceDialog({
  open,
  items,
  itemPreviews,
  conclusionPreview,
  retryingCode,
  onClose,
  onRetry,
  onFeedback,
}: DialogProps) {
  const [feedbackTarget, setFeedbackTarget] = useState<{
    code: ComplianceItemCode;
    name: string;
    index: number;
  } | null>(null);

  useEffect(() => {
    if (!open) setFeedbackTarget(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (feedbackTarget) {
        setFeedbackTarget(null);
      } else {
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, feedbackTarget, onClose]);

  if (!open || items.length === 0) return null;

  const viewItems = items.map((item) => {
    const preview = itemPreviews[item.code];
    return preview ? { ...item, outcome: getPreviewOutcome(item.code, preview) } : item;
  });
  const baseSummary = summarize(viewItems);
  const summary =
    conclusionPreview === 'pass'
      ? { level: 'pass' as const, text: '全部检测通过', counts: baseSummary.counts }
      : conclusionPreview === 'issue'
        ? { level: 'issue' as const, text: '未通过：1 项违规、1 项疑似违规、1 项检测失败', counts: baseSummary.counts }
        : baseSummary;

  const targetItem = feedbackTarget ? items.find((item) => item.code === feedbackTarget.code) : undefined;
  const targetFeedback = feedbackTarget
    ? targetItem?.feedback[`${feedbackTarget.code}:${feedbackTarget.index}`]
    : undefined;

  return (
    <div className="ep-c-mask" onClick={onClose}>
      <div
        className="ep-c-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="商品合规检测结果"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="ep-c-head" data-annotation-id="compliance-dialog-head">
          <div className="ep-c-head__row">
            <h3 className="ep-c-head__title">商品合规检测结果</h3>
            <button type="button" className="ep-c-close" aria-label="关闭" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </header>

        <div className="ep-c-body">
          <div
            className={`ep-c-conclusion ep-c-conclusion--${summary.level}`}
            data-annotation-id="compliance-conclusion"
          >
            {summary.level === 'pass' ? <Check size={14} /> : <span className="ep-c-conclusion__dot" />}
            <span className="ep-c-conclusion__text">{summary.text}</span>
            <span className="ep-c-conclusion__counts">共 {items.length} 项检测</span>
          </div>

          {ITEM_DEFS.map((def) => {
            const item = viewItems.find((run) => run.code === def.code);
            if (!item) return null;
            const preview = itemPreviews[def.code];
            return (
              <ItemCard
                key={def.code}
                def={def}
                item={item}
                previewMode={Boolean(preview)}
                retrying={retryingCode === def.code}
                feedbackMap={item.feedback}
                onRetry={() => onRetry(def.code)}
                onOpenFeedback={(index) => setFeedbackTarget({ code: def.code, name: def.name, index })}
                onCancelFeedback={(index) => onFeedback(def.code, index, null)}
              />
            );
          })}
        </div>

        <footer className="ep-c-foot">
          <button type="button" className="ep-btn ep-btn--default ep-btn--lg" onClick={onClose}>
            关闭
          </button>
        </footer>

        {feedbackTarget && (
          <FeedbackDialog
            initial={targetFeedback}
            onCancel={() => setFeedbackTarget(null)}
            onSubmit={(feedback) => {
              onFeedback(feedbackTarget.code, feedbackTarget.index, feedback);
              setFeedbackTarget(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function highlightWords(text: string, words?: string[]) {
  if (!words || words.length === 0) return text;
  const pattern = new RegExp(`(${words.map(escapeRegExp).join('|')})`, 'g');
  return text.split(pattern).map((part, index) =>
    words.includes(part) ? <mark key={index}>{part}</mark> : <React.Fragment key={index}>{part}</React.Fragment>,
  );
}

interface ItemCardProps {
  def: ComplianceItemDef;
  item: ComplianceItemRun;
  previewMode: boolean;
  retrying: boolean;
  feedbackMap: Record<string, ComplianceFeedback>;
  onRetry: () => void;
  onOpenFeedback: (hitIndex: number) => void;
  onCancelFeedback: (hitIndex: number) => void;
}

function ItemCard({
  def,
  item,
  previewMode,
  retrying,
  feedbackMap,
  onRetry,
  onOpenFeedback,
  onCancelFeedback,
}: ItemCardProps) {
  const [pickedRound, setPickedRound] = useState<number | null>(null);
  const [manualToggle, setManualToggle] = useState<boolean | null>(null);
  const [costTip, setCostTip] = useState<{ right: number; bottom: number } | null>(null);
  const [recordsOpen, setRecordsOpen] = useState(false);
  const [recordsPos, setRecordsPos] = useState({ left: 0, top: 0 });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const helpRef = useRef<HTMLSpanElement>(null);
  const recordsBtnRef = useRef<HTMLButtonElement>(null);
  const recordsListRef = useRef<HTMLDivElement>(null);

  const history = previewMode ? [] : item.history;
  const viewingHistory = pickedRound !== null && pickedRound < history.length;
  const outcome = viewingHistory ? history[pickedRound as number].outcome : item.outcome;
  const status = outcome.status;
  const activeAt = viewingHistory ? history[pickedRound as number].at : item.at;
  const activeRound = viewingHistory ? (pickedRound as number) + 1 : history.length + 1;
  const expanded = manualToggle ?? (status === 'violation' || status === 'suspect');
  const interactive = !viewingHistory;
  const canRetry = !viewingHistory && !retrying;

  const hits = outcome.hits ?? [];
  const violationCount = hits.filter((hit) => hit.severity === 'violation').length;
  const suspectCount = hits.length - violationCount;

  const prevStatus = useRef(status);
  useEffect(() => {
    if (prevStatus.current !== status) {
      prevStatus.current = status;
      setManualToggle(null);
    }
  }, [status]);

  useEffect(() => {
    setPickedRound(null);
  }, [history.length]);

  useEffect(() => {
    if (!recordsOpen) return;
    const onDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (recordsBtnRef.current?.contains(target) || recordsListRef.current?.contains(target)) return;
      setRecordsOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [recordsOpen]);

  const showCostTip = () => {
    const rect = helpRef.current?.getBoundingClientRect();
    if (!rect) return;
    setCostTip({ right: window.innerWidth - rect.right + 2, bottom: window.innerHeight - rect.top + 8 });
  };

  const toggleRecords = () => {
    if (!recordsOpen) {
      const rect = recordsBtnRef.current?.getBoundingClientRect();
      if (rect) {
        setRecordsPos({
          left: Math.min(rect.left, window.innerWidth - 196),
          top: Math.min(rect.bottom + 6, window.innerHeight - 220),
        });
      }
    }
    setRecordsOpen((prev) => !prev);
  };

  const pickRound = (round: number | null) => {
    setPickedRound(round);
    setManualToggle(true);
    setRecordsOpen(false);
  };

  const historyRounds = history.map((round, index) => ({ index, at: round.at })).reverse();

  return (
    <section
      className={`ep-c-item ep-c-item--${status}${retrying ? ' is-running' : ''}`}
      data-annotation-id={`compliance-item-${def.code}`}
    >
      <header className="ep-c-item__head">
        <div className="ep-c-item__name">
          <span className="ep-c-item__label">{def.name}</span>
          <span className={`ep-c-tag ep-c-tag--${status}`}>{retrying ? '检测中' : STATUS_TEXT[status]}</span>
          {hits.length > 1 && (
            <span className="ep-c-item__count">
              {violationCount ? `${violationCount} 处违规` : ''}
              {suspectCount ? `${violationCount ? ' · ' : ''}${suspectCount} 处疑似` : ''}
            </span>
          )}
        </div>
        <div
          className="ep-c-item__actions"
          data-annotation-id={def.code === 'ipr' ? 'compliance-item-actions' : undefined}
        >
          {canRetry && (
            <button type="button" className="ep-c-btn-mini" onClick={onRetry}>
              重新检测
              <span
                className="ep-c-help"
                role="img"
                aria-label="单项算力说明"
                ref={helpRef}
                onMouseEnter={showCostTip}
                onMouseLeave={() => setCostTip(null)}
                onClick={(event) => event.stopPropagation()}
              >
                <HelpCircle size={12} />
                {costTip && (
                  <span
                    className="ep-c-tip ep-c-tip--fixed"
                    role="tooltip"
                    style={{ right: costTip.right, bottom: costTip.bottom }}
                  >
                    单项检测消耗xx算力
                  </span>
                )}
              </span>
            </button>
          )}
          <button type="button" className="ep-c-link ep-c-toggle" onClick={() => setManualToggle(!expanded)}>
            {expanded ? '收起' : '展开'}
            <ChevronDown size={12} className={expanded ? 'is-up' : undefined} />
          </button>
        </div>
      </header>

      {history.length > 0 && expanded && (
        <div className="ep-c-records">
          <span className="ep-c-records__label">检测记录</span>
          <button
            type="button"
            className={`ep-c-records__btn${recordsOpen ? ' is-open' : ''}`}
            ref={recordsBtnRef}
            aria-expanded={recordsOpen}
            onClick={toggleRecords}
          >
            第 {activeRound} 次 · {fmtTime(activeAt)}
            <ChevronDown size={12} />
          </button>
          {viewingHistory && <span className="ep-c-records__note">历史记录，仅查看</span>}

          {recordsOpen && (
            <div
              className="ep-c-records__list"
              ref={recordsListRef}
              style={{ left: recordsPos.left, top: recordsPos.top }}
            >
              <button
                type="button"
                className={`ep-c-records__item${pickedRound === null ? ' is-active' : ''}`}
                onClick={() => pickRound(null)}
              >
                第 {history.length + 1} 次 · {fmtTime(item.at)}
                <em>最新</em>
              </button>
              {historyRounds.map((round) => (
                <button
                  key={round.index}
                  type="button"
                  className={`ep-c-records__item${pickedRound === round.index ? ' is-active' : ''}`}
                  onClick={() => pickRound(round.index)}
                >
                  第 {round.index + 1} 次 · {fmtTime(round.at)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {status === 'fail' && (
        <div className="ep-c-item__brief">检测失败：{outcome.failReason ?? outcome.conclusion}</div>
      )}

      {retrying && (
        <div className="ep-c-running">
          <span className="ep-c-spin" aria-hidden="true">
            {Array.from({ length: 12 }).map((_, index) => (
              <span
                key={index}
                style={{ transform: `rotate(${index * 30}deg)`, animationDelay: `${index * 0.083}s` }}
              />
            ))}
          </span>
          <div className="ep-c-skeleton">
            <i style={{ width: '52%' }} />
            <i style={{ width: '76%' }} />
          </div>
          <span className="ep-c-running__text">检测中</span>
        </div>
      )}

      {!retrying && expanded && (
        <div className="ep-c-item__body">
          {status === 'fail' && (
            <div className="ep-c-row">
              <span className="ep-c-row__label">失败原因</span>
              <span>{outcome.failReason ?? outcome.conclusion}</span>
            </div>
          )}

          {status === 'pass' && (
            <div className="ep-c-row">
              <span className="ep-c-row__label">结论</span>
              <span>{outcome.conclusion}</span>
            </div>
          )}

          {hits.length > 0 && (
            <div className="ep-c-hits">
              {hits.map((hit, index) => {
                const violationHit = hit.severity === 'violation';
                const hitFeedback = feedbackMap[`${def.code}:${index}`];
                return (
                  <div key={index} className={`ep-c-hit${violationHit ? ' is-violation' : ' is-suspect'}`}>
                    <div className="ep-c-hit__head">
                      <span className="ep-c-hit__no">{index + 1}</span>
                      <span className={`ep-c-hit__label${violationHit ? ' is-violation' : ''}`}>
                        {violationHit ? '违规' : '疑似违规'}
                      </span>
                    </div>
                    <div className="ep-c-row">
                      <span className="ep-c-row__label">原因</span>
                      <span>{hit.reason}</span>
                    </div>
                    {hit.image ? (
                      <div className="ep-c-row ep-c-row--image">
                        <span className="ep-c-row__label">原图</span>
                        <span className="ep-c-hit__media">
                          <button
                            type="button"
                            className="ep-c-hit__thumb"
                            onClick={() => setPreviewImage(IMAGE_SRC[hit.image as ComplianceImageKey])}
                          >
                            <img src={IMAGE_SRC[hit.image]} alt={hit.imageLabel ?? '原图'} />
                          </button>
                          {hit.imageLabel && <span className="ep-c-hit__media-label">{hit.imageLabel}</span>}
                        </span>
                      </div>
                    ) : (
                      <div className="ep-c-row">
                        <span className="ep-c-row__label">原文</span>
                        <span className="ep-c-hit__content">{highlightWords(hit.content, hit.keywords)}</span>
                      </div>
                    )}

                    {hit.suggestion && (
                      <div className="ep-c-suggest">
                        <div className="ep-c-suggest__label">建议方案</div>
                        <div>{hit.suggestion}</div>
                      </div>
                    )}

                    {interactive && (
                      <div className="ep-c-hit__foot">
                        <button
                          type="button"
                          className="ep-c-hit__report"
                          onClick={() => onOpenFeedback(index)}
                        >
                          检测不准？
                        </button>
                        {hitFeedback && (
                          <>
                            <span className="ep-c-hit__fbnote">
                              已反馈
                              {hitFeedback.reasons.length ? `：${hitFeedback.reasons.join('、')}` : ''}
                              {hitFeedback.text ? `（${hitFeedback.text}）` : ''}
                            </span>
                            <button
                              type="button"
                              className="ep-c-hit__unreport"
                              onClick={() => onCancelFeedback(index)}
                            >
                              取消反馈
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {previewImage && (
        <div className="ep-c-lightbox" onClick={() => setPreviewImage(null)}>
          <img src={previewImage} alt="" />
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */

function FeedbackDialog({
  initial,
  onCancel,
  onSubmit,
}: {
  initial?: ComplianceFeedback;
  onCancel: () => void;
  onSubmit: (feedback: ComplianceFeedback) => void;
}) {
  const [reasons, setReasons] = useState<string[]>(initial?.reasons ?? []);
  const [text, setText] = useState(initial?.text ?? '');
  const canSubmit = reasons.length > 0 || text.trim().length > 0;

  const toggleReason = (reason: string) => {
    setReasons((prev) => (prev.includes(reason) ? prev.filter((item) => item !== reason) : prev.concat(reason)));
  };

  return (
    <div className="ep-c-fb-mask" onClick={onCancel}>
      <div
        className="ep-c-fb-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="反馈检测结果"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ep-c-fb-dialog__head">
          <h4>反馈检测结果</h4>
          <button type="button" aria-label="关闭" onClick={onCancel}>
            <X size={14} />
          </button>
        </div>
        <p className="ep-c-fb-dialog__desc">您认为该检测结果不准确，请选择原因（可多选）：</p>
        <div className="ep-c-chips">
          {DISLIKE_REASONS.map((reason) => (
            <button
              key={reason}
              type="button"
              className={`ep-c-chip${reasons.includes(reason) ? ' is-active' : ''}`}
              onClick={() => toggleReason(reason)}
            >
              {reason}
            </button>
          ))}
        </div>
        <textarea
          value={text}
          maxLength={300}
          placeholder="补充说明（选填）"
          onChange={(event) => setText(event.target.value)}
        />
        <div className="ep-c-fb-dialog__foot">
          <button type="button" className="ep-btn ep-btn--default" onClick={onCancel}>
            取消
          </button>
          <button
            type="button"
            className="ep-btn ep-btn--primary"
            disabled={!canSubmit}
            onClick={() => onSubmit({ reasons, text: text.trim() })}
          >
            提交
          </button>
        </div>
      </div>
    </div>
  );
}
