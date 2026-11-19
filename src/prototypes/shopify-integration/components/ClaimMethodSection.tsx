import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

import '../claim-method.css';

/* ============ 图标 ============ */

const ClockIcon = () => (
  <svg className="up-picker__icon" width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
    <path d="M7 4V7L9 8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="up-picker__icon" width="14" height="14" viewBox="0 0 14 14" fill="none">
    <rect x="1.5" y="2.5" width="11" height="10" rx="1" stroke="currentColor" strokeWidth="1.2" />
    <path d="M1.5 5.5H12.5" stroke="currentColor" strokeWidth="1.2" />
    <path d="M4.5 1V3.5M9.5 1V3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

/* ============ 基础控件 ============ */

const Switch = ({ checked, disabled = false, onChange, ariaLabel }: {
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
  ariaLabel: string;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={ariaLabel}
    disabled={disabled}
    className={`up-switch${checked ? ' is-checked' : ''}${disabled ? ' is-disabled' : ''}`}
    onClick={() => { if (!disabled) onChange(); }}
  >
    <span className="up-switch__dot" />
  </button>
);

const Radio = ({ checked, label, disabled = false, onChange }: {
  checked: boolean;
  label: string;
  disabled?: boolean;
  onChange: () => void;
}) => (
  <label className={`up-radio${disabled ? ' is-disabled' : ''}`}>
    <input
      type="radio"
      className="up-radio__input"
      checked={checked}
      disabled={disabled}
      onChange={() => { if (!disabled) onChange(); }}
    />
    <span className={`up-radio__icon${checked ? ' is-checked' : ''}`} />
    <span className={`up-radio__label${checked ? ' is-active' : ''}`}>{label}</span>
  </label>
);

const positiveIntText = (raw: string) => raw.replace(/[^\d]/g, '').replace(/^0+/, '');

const NumberField = ({ value, onChange, disabled = false, invalid = false, ariaLabel }: {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  ariaLabel: string;
}) => {
  const current = value === '' ? 0 : Number(value);
  const step = (delta: number) => onChange(String(Math.max(1, (current || 0) + delta)));

  return (
    <div className={`up-num${invalid ? ' is-error' : ''}${disabled ? ' is-disabled' : ''}`}>
      <button type="button" className="up-num__btn" aria-label={`${ariaLabel}减 1`} disabled={disabled} onClick={() => step(-1)}>−</button>
      <input
        type="text"
        inputMode="numeric"
        className="up-num__input"
        aria-label={ariaLabel}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(positiveIntText(e.target.value))}
      />
      <button type="button" className="up-num__btn" aria-label={`${ariaLabel}加 1`} disabled={disabled} onClick={() => step(1)}>+</button>
    </div>
  );
};

/* ============ 时间选择 ============ */

const pad2 = (n: number) => String(n).padStart(2, '0');

const HOURS = Array.from({ length: 24 }, (_, i) => pad2(i));
const MINUTES = Array.from({ length: 60 }, (_, i) => pad2(i));
const SECONDS = Array.from({ length: 60 }, (_, i) => pad2(i));

const TimeColumns = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const parts = (value || '00:00:00').split(':');
  const h = parts[0] ?? '00';
  const m = parts[1] ?? '00';
  const s = parts[2] ?? '00';
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    panelRef.current?.querySelector<HTMLElement>('.is-active')?.scrollIntoView({ block: 'nearest' });
  }, []);

  const pick = (part: 'h' | 'm' | 's', v: string) => {
    const next = part === 'h' ? [v, m, s] : part === 'm' ? [h, v, s] : [h, m, v];
    onChange(next.join(':'));
  };

  const columns: { key: 'h' | 'm' | 's'; items: string[]; active: string }[] = [
    { key: 'h', items: HOURS, active: h },
    { key: 'm', items: MINUTES, active: m },
    { key: 's', items: SECONDS, active: s },
  ];

  return (
    <div className="up-time-panel" ref={panelRef}>
      {columns.map((col) => (
        <div className="up-time-panel__col" key={col.key}>
          {col.items.map((item) => (
            <button
              type="button"
              key={item}
              className={`up-time-cell${item === col.active ? ' is-active' : ''}`}
              onClick={() => pick(col.key, item)}
            >
              {item}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

const TimePicker = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="up-picker up-picker--time">
      <div
        className={`up-picker__input${open ? ' is-focused' : ''}`}
        onClick={() => setOpen((v) => !v)}
      >
        <ClockIcon />
        <span className={`up-picker__text${value ? ' is-filled' : ''}`}>{value || '选择次日继续刊登时间'}</span>
      </div>
      {open ? (
        <div className="up-picker__panel">
          <TimeColumns value={value} onChange={onChange} />
        </div>
      ) : null}
    </div>
  );
};

const DateTimePicker = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const today = new Date();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const [picked, setPicked] = useState<{ y: number; m: number; d: number } | null>(
    value ? (() => { const [ymd] = value.split(' '); const [y, m, d] = ymd.split('-').map(Number); return { y, m: m - 1, d }; })() : null,
  );
  const [time, setTime] = useState(value.includes(' ') ? value.split(' ')[1] : '10:00:00');

  const firstDay = new Date(view.y, view.m, 1).getDay();
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells: Array<number | null> = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const shiftMonth = (delta: number) => {
    const next = new Date(view.y, view.m + delta, 1);
    setView({ y: next.getFullYear(), m: next.getMonth() });
  };

  const isToday = (d: number) =>
    d === today.getDate() && view.m === today.getMonth() && view.y === today.getFullYear();

  const commit = () => {
    if (picked) {
      onChange(`${picked.y}-${pad2(picked.m + 1)}-${pad2(picked.d)} ${time || '10:00:00'}`);
    }
    setOpen(false);
  };

  return (
    <div className="up-picker">
      <div
        className={`up-picker__input${open ? ' is-focused' : ''}`}
        onClick={() => setOpen((v) => !v)}
      >
        <CalendarIcon />
        <span className={`up-picker__text${value ? ' is-filled' : ''}`}>{value || '选择定时发布时间'}</span>
      </div>
      {open ? (
        <div className="up-picker__panel">
          <div className="up-dt__panel">
            <div className="up-dt__header">
              <button type="button" className="up-dt__nav" onClick={() => shiftMonth(-1)}>〈</button>
              <span className="up-dt__title">{view.y} 年 {pad2(view.m + 1)} 月</span>
              <button type="button" className="up-dt__nav" onClick={() => shiftMonth(1)}>〉</button>
            </div>
            <div className="up-dt__week">
              {['日', '一', '二', '三', '四', '五', '六'].map((w) => <span key={w}>{w}</span>)}
            </div>
            <div className="up-dt__grid">
              {cells.map((d, i) => d === null ? (
                <span key={`b-${i}`} className="up-dt__day is-blank" />
              ) : (
                <button
                  type="button"
                  key={d}
                  className={`up-dt__day${picked && picked.d === d && picked.m === view.m && picked.y === view.y ? ' is-selected' : ''}${isToday(d) ? ' is-today' : ''}`}
                  onClick={() => setPicked({ y: view.y, m: view.m, d })}
                >
                  {d}
                </button>
              ))}
            </div>
            <div className="up-dt__time-panel">
              <TimeColumns value={time} onChange={setTime} />
            </div>
            <div className="up-dt__footer">
              <button type="button" className="up-dt__link" onClick={() => { setPicked(null); onChange(''); setOpen(false); }}>清除</button>
              <button type="button" className="up-dt__confirm" disabled={!picked} onClick={commit}>确定</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

/* ============ 标题/主图策略 ============ */

type SegmentState = { pre: string; start: string; suf: string };
type UploadedImage = { id: string; url: string; name: string; width: number; height: number };
type IncrementValue = { prefixOn: boolean; suffixOn: boolean; prefix: SegmentState; suffix: SegmentState };

const emptySegment = (): SegmentState => ({ pre: '', start: '1', suf: '' });
const defaultIncrement = (): IncrementValue => ({ prefixOn: false, suffixOn: true, prefix: emptySegment(), suffix: emptySegment() });
const incrementHasEmptyStart = (v: IncrementValue) => (v.prefixOn && !v.prefix.start) || (v.suffixOn && !v.suffix.start);

const SegmentCard = ({ title, seg, on, onToggle, onSegChange }: {
  title: string;
  seg: SegmentState;
  on: boolean;
  onToggle: () => void;
  onSegChange: (next: SegmentState) => void;
}) => (
  <div className={`up-seg-card${on ? '' : ' is-off'}`}>
    <div className="up-seg-card__head">
      <span className="up-seg-card__title">{title}</span>
      <Switch checked={on} onChange={onToggle} ariaLabel={`${title}开关`} />
    </div>
    <div className="up-seg-card__body">
      <label className="up-seg-card__field">
        <span className="up-seg-card__field-label">增量前缀</span>
        <input
          type="text"
          className="up-input"
          value={seg.pre}
          disabled={!on}
          onChange={(e) => onSegChange({ ...seg, pre: e.target.value })}
        />
      </label>
      <label className="up-seg-card__field">
        <span className="up-seg-card__field-label">
          <span className="up-required">*</span>增量起始值
        </span>
        <NumberField
          value={seg.start}
          disabled={!on}
          invalid={on && !seg.start}
          ariaLabel={`${title}增量起始值`}
          onChange={(start) => onSegChange({ ...seg, start })}
        />
        {on && !seg.start ? <span className="up-seg-card__field-error">增量起始值不能为空</span> : null}
      </label>
      <label className="up-seg-card__field">
        <span className="up-seg-card__field-label">增量后缀</span>
        <input
          type="text"
          className="up-input"
          value={seg.suf}
          disabled={!on}
          onChange={(e) => onSegChange({ ...seg, suf: e.target.value })}
        />
      </label>
    </div>
  </div>
);

const SampleSegment = ({ seg, on }: { seg: SegmentState; on: boolean }) => {
  if (!on) return null;
  return (
    <span className="up-sample__seg">
      {seg.pre ? <span className="up-sample__on">{seg.pre}</span> : null}
      {seg.start ? <span className="up-sample__on">{seg.start}</span> : null}
      {seg.suf ? <span className="up-sample__on">{seg.suf}</span> : null}
    </span>
  );
};

const IncrementGroup = ({ value, onChange }: { value: IncrementValue; onChange: (next: IncrementValue) => void }) => {
  const [guardTip, setGuardTip] = useState('');

  const toggle = (key: 'prefixOn' | 'suffixOn') => {
    const other = key === 'prefixOn' ? 'suffixOn' : 'prefixOn';
    if (value[key] && !value[other]) {
      setGuardTip('至少启用一项');
      return;
    }
    setGuardTip('');
    onChange({ ...value, [key]: !value[key] });
  };

  return (
    <div className="up-increment">
      <div className="up-seg-cards">
        <SegmentCard
          title="前缀"
          seg={value.prefix}
          on={value.prefixOn}
          onToggle={() => toggle('prefixOn')}
          onSegChange={(prefix) => { setGuardTip(''); onChange({ ...value, prefix }); }}
        />
        <SegmentCard
          title="后缀"
          seg={value.suffix}
          on={value.suffixOn}
          onToggle={() => toggle('suffixOn')}
          onSegChange={(suffix) => { setGuardTip(''); onChange({ ...value, suffix }); }}
        />
      </div>
      {guardTip ? <p className="up-increment__tip">至少启用一项</p> : null}
      <div className="up-sample">
        <span className="up-sample__label">示例标题：</span>
        <span className="up-sample__text">
          <SampleSegment seg={value.prefix} on={value.prefixOn} />
          <span className="up-sample__base">XXXXXXXXXXXX</span>
          <SampleSegment seg={value.suffix} on={value.suffixOn} />
        </span>
      </div>
    </div>
  );
};

const AI_KEYWORDS_MAX = 70;

const AiKeywordField = ({ value, onChange }: { value: string; onChange: (next: string) => void }) => (
  <div className="up-ai">
    <div className="up-ai__field">
      <span className="up-ai__label">指定包含关键词</span>
      <div className="up-ai__control">
        <input
          type="text"
          className="up-input up-ai__input"
          value={value}
          maxLength={AI_KEYWORDS_MAX}
          placeholder="多个关键词用逗号分隔"
          onChange={(e) => onChange(e.target.value)}
        />
        <span className={`up-ai__count${value.length >= AI_KEYWORDS_MAX ? ' is-limit' : ''}`}>
          {value.length}/{AI_KEYWORDS_MAX}
        </span>
      </div>
    </div>
    <p className="up-ai__hint">让AI生成标题时包含指定的关键词</p>
  </div>
);

/* ============ 认领方式 ============ */

export type ClaimMethodHandle = { validate: () => { ok: boolean; toast?: string } };

const ClaimMethodSection = forwardRef<ClaimMethodHandle, { onClaimModeChange?: (mode: 'claim' | 'publish') => void }>(function ClaimMethodSection({ onClaimModeChange }, ref) {
  const [claimMode, setClaimMode] = useState<'claim' | 'publish'>('claim');
  const [publishMode, setPublishMode] = useState<'now' | 'scheduled'>('now');
  const [scheduledTime, setScheduledTime] = useState('');
  const [loopOn, setLoopOn] = useState(false);
  const [loopLimit, setLoopLimit] = useState('1');
  const [strategyError, setStrategyError] = useState('');

  const [titleOn, setTitleOn] = useState(false);
  const [titleMode, setTitleMode] = useState<'shuffle' | 'increment' | 'ai' | 'backup'>('shuffle');
  const [titleAiKeywords, setTitleAiKeywords] = useState('');
  const [titleIncrement, setTitleIncrement] = useState<IncrementValue>(defaultIncrement);
  const [backupTitles, setBackupTitles] = useState<string[]>(['']);
  const [backupTitleStrategy, setBackupTitleStrategy] = useState<'shuffle' | 'increment' | 'ai'>('shuffle');
  const [backupAiKeywords, setBackupAiKeywords] = useState('');
  const [backupIncrement, setBackupIncrement] = useState<IncrementValue>(defaultIncrement);

  const [imageOn, setImageOn] = useState(false);
  const [imageMode, setImageMode] = useState<'shuffle' | 'sku' | 'backup'>('shuffle');
  const [backupImageStrategy, setBackupImageStrategy] = useState<'shuffle'>('shuffle');
  const [backupImages, setBackupImages] = useState<UploadedImage[]>([]);
  const uploadFileInputRef = useRef<HTMLInputElement | null>(null);

  const [dailyLimitMode, setDailyLimitMode] = useState<'stop' | 'nextDay'>('stop');
  const [nextDayTime, setNextDayTime] = useState('');

  const loopVisible = claimMode === 'publish' && loopOn;

  const addBackupTitle = () => setBackupTitles((list) => [...list, '']);
  const removeBackupTitle = (index: number) => setBackupTitles((list) => list.filter((_, i) => i !== index));
  const setBackupTitle = (index: number, value: string) =>
    setBackupTitles((list) => list.map((t, i) => (i === index ? value : t)));

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const url = URL.createObjectURL(file);
      const probe = new Image();
      probe.onload = () => {
        setBackupImages((list) => [...list, {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          url,
          name: file.name,
          width: probe.naturalWidth,
          height: probe.naturalHeight,
        }]);
      };
      probe.src = url;
    });
  };

  useImperativeHandle(ref, () => ({
    validate: () => {
      if (claimMode === 'publish' && publishMode === 'scheduled' && !scheduledTime) {
        return { ok: false, toast: '请选择定时发布时间' };
      }
      if (loopVisible) {
        if (!titleOn && !imageOn) {
          setStrategyError('请至少启用一项自动刊登策略（标题策略 / 主图策略）');
          return { ok: false };
        }
        const needIncrementCheck = titleOn
          && (titleMode === 'increment' || (titleMode === 'backup' && backupTitleStrategy === 'increment'));
        if (needIncrementCheck
          && ((titleMode === 'increment' && incrementHasEmptyStart(titleIncrement))
            || (titleMode === 'backup' && backupTitleStrategy === 'increment' && incrementHasEmptyStart(backupIncrement)))) {
          setStrategyError('增量起始值不能为空');
          return { ok: false };
        }
      }
      return { ok: true };
    },
  }));

  return (
    <div className="capd-method">
      <div className="capd-field-label">认领方式</div>
      <div className="capd-method-options">
        <div className="capd-method-option">
          <Radio
            checked={claimMode === 'claim'}
            label="仅认领"
            onChange={() => { setClaimMode('claim'); setStrategyError(''); onClaimModeChange?.('claim'); }}
          />
          <span className="capd-method-desc">认领到商品列表</span>
        </div>
        <div className="capd-method-option">
          <Radio
            checked={claimMode === 'publish'}
            label="认领并发布"
            onChange={() => { setClaimMode('publish'); onClaimModeChange?.('publish'); }}
          />
          <span className="capd-method-desc">认领完成后同时发布</span>
        </div>
      </div>

      {claimMode === 'publish' ? (
        <>
          <div className="capd-publish-row">
            <span className="capd-loop-label">发布时间</span>
            <div className="up-radio-group">
              <Radio checked={publishMode === 'now'} label="立即发布" onChange={() => setPublishMode('now')} />
              <Radio checked={publishMode === 'scheduled'} label="定时发布" onChange={() => setPublishMode('scheduled')} />
            </div>
          </div>
          {publishMode === 'scheduled' ? (
            <div className="capd-publish-picker">
              <DateTimePicker value={scheduledTime} onChange={setScheduledTime} />
            </div>
          ) : null}
          <div className="capd-loop-row">
            <span className="capd-loop-label">循环刊登</span>
            <Switch
              checked={loopOn}
              onChange={() => {
                setLoopOn((v) => {
                  const next = !v;
                  if (!next) setStrategyError('');
                  return next;
                });
              }}
              ariaLabel="循环刊登开关"
            />
            {loopOn ? (
              <span className="up-inline-field">
                <span className="up-inline-field__label">循环次数限制</span>
                <NumberField value={loopLimit} onChange={setLoopLimit} ariaLabel="循环次数限制" />
              </span>
            ) : null}
          </div>
        </>
      ) : null}

      {loopVisible ? (
        <div className="capd-loop-config">
          <div className="up-section">
            <h3 className="up-section__title">
              <span className="up-required">*</span>自动刊登策略
            </h3>
            {strategyError ? <p className="up-section__error">{strategyError}</p> : null}

            <div className="up-strategy-block">
              <div className="up-strategy-block__head">
                <span className="up-strategy-block__title">标题策略</span>
                <Switch
                  checked={titleOn}
                  onChange={() => {
                    setTitleOn((v) => {
                      const next = !v;
                      if (next) setStrategyError('');
                      return next;
                    });
                  }}
                  ariaLabel="标题策略开关"
                />
              </div>
              {titleOn ? (
                <>
                  <div className="up-option-list">
                    <Radio checked={titleMode === 'shuffle'} label="随机打乱" onChange={() => setTitleMode('shuffle')} />
                    <Radio checked={titleMode === 'increment'} label="插入增量前、后缀" onChange={() => setTitleMode('increment')} />
                    <Radio checked={titleMode === 'ai'} label="AI 重新生成" onChange={() => setTitleMode('ai')} />
                    <Radio checked={titleMode === 'backup'} label="备选标题" onChange={() => setTitleMode('backup')} />
                  </div>
                  {titleMode === 'increment' ? (
                    <IncrementGroup value={titleIncrement} onChange={setTitleIncrement} />
                  ) : null}
                  {titleMode === 'ai' ? (
                    <AiKeywordField value={titleAiKeywords} onChange={setTitleAiKeywords} />
                  ) : null}
                  {titleMode === 'backup' ? (
                    <div className="up-backup">
                      <div className="up-backup__list">
                        {backupTitles.map((title, i) => (
                          <div className="up-backup__row" key={i}>
                            <input
                              type="text"
                              className="up-input up-backup__input"
                              value={title}
                              placeholder={`备选标题 ${i + 1}`}
                              onChange={(e) => setBackupTitle(i, e.target.value)}
                            />
                            {backupTitles.length > 1 ? (
                              <button type="button" className="up-backup__remove" aria-label="删除该备选标题" onClick={() => removeBackupTitle(i)}>×</button>
                            ) : null}
                          </div>
                        ))}
                      </div>
                      <button type="button" className="up-backup__add" onClick={addBackupTitle}>+ 添加备选标题</button>
                      <p className="up-hint">循环刊登时，如果某个标题未通过审核，将自动更换另一个备选标题重试。</p>

                      <div className="up-sub-strategy">
                        <div className="up-sub-strategy__head">
                          <span className="up-sub-strategy__title">备选标题策略</span>
                          <span className="up-sub-strategy__desc">当备选标题已用完但循环刊登未结束时启用</span>
                        </div>
                        <div className="up-option-list up-option-list--inline">
                          <Radio checked={backupTitleStrategy === 'shuffle'} label="随机打乱" onChange={() => setBackupTitleStrategy('shuffle')} />
                          <Radio checked={backupTitleStrategy === 'increment'} label="插入增量前、后缀" onChange={() => setBackupTitleStrategy('increment')} />
                          <Radio checked={backupTitleStrategy === 'ai'} label="AI 重新生成" onChange={() => setBackupTitleStrategy('ai')} />
                        </div>
                        {backupTitleStrategy === 'increment' ? (
                          <IncrementGroup value={backupIncrement} onChange={setBackupIncrement} />
                        ) : null}
                        {backupTitleStrategy === 'ai' ? (
                          <AiKeywordField value={backupAiKeywords} onChange={setBackupAiKeywords} />
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>

            <div className="up-strategy-block">
              <div className="up-strategy-block__head">
                <span className="up-strategy-block__title">主图策略</span>
                <Switch
                  checked={imageOn}
                  onChange={() => {
                    setImageOn((v) => {
                      const next = !v;
                      if (next) setStrategyError('');
                      return next;
                    });
                  }}
                  ariaLabel="主图策略开关"
                />
              </div>
              {imageOn ? (
                <>
                  <div className="up-option-list">
                    <Radio checked={imageMode === 'shuffle'} label="随机打乱" onChange={() => setImageMode('shuffle')} />
                    <Radio checked={imageMode === 'sku'} label="取SKU图替换首图" onChange={() => setImageMode('sku')} />
                    <Radio checked={imageMode === 'backup'} label="备选首图" onChange={() => setImageMode('backup')} />
                  </div>
                  {imageMode !== 'shuffle' ? (
                    <>
                      {imageMode === 'backup' ? (
                        <div className="up-upload-wrap">
                          <div className="up-upload">
                            <button type="button" className="up-upload__add" onClick={() => uploadFileInputRef.current?.click()}>
                              <span className="up-upload__add-plus">+</span>
                              <span className="up-upload__add-text">
                                <span className="up-upload__add-line">点击上传</span>
                              </span>
                            </button>
                            {backupImages.map((img) => (
                              <div className="up-upload__item" key={img.id}>
                                <img src={img.url} alt={img.name} />
                                <span className="up-upload__res">{img.width}*{img.height}</span>
                                <button
                                  type="button"
                                  className="up-upload__remove"
                                  aria-label="删除该备选首图"
                                  onClick={() => setBackupImages((list) => list.filter((it) => it.id !== img.id))}
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                          <input
                            ref={uploadFileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            hidden
                            onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
                          />
                        </div>
                      ) : null}
                      <p className="up-hint">{imageMode === 'sku'
                        ? '循环刊登时，如果某张首图未通过审核，将自动更换下一张SKU图作为首图尝试。'
                        : '循环刊登时，如果某张首图未通过审核，将自动更换另一张备选首图重试。'}</p>

                      <div className="up-sub-strategy">
                        <div className="up-sub-strategy__head">
                          <span className="up-sub-strategy__title">备选首图策略</span>
                          <span className="up-sub-strategy__desc">{imageMode === 'sku'
                            ? '当SKU图已用完但循环刊登未结束时启用'
                            : '当备选首图已用完但循环刊登未结束时启用'}</span>
                        </div>
                        <div className="up-option-list up-option-list--inline">
                          <Radio checked={backupImageStrategy === 'shuffle'} label="随机打乱" onChange={() => setBackupImageStrategy('shuffle')} />
                        </div>
                      </div>
                    </>
                  ) : null}
                </>
              ) : null}
            </div>
          </div>

          <div className="up-form-row up-form-row--limit">
            <span className="up-form-label">刊登数量达到当日上限时：</span>
            <div className="up-form-value">
              <div className="up-radio-group">
                <Radio checked={dailyLimitMode === 'stop'} label="直接终止刊登" onChange={() => setDailyLimitMode('stop')} />
                <Radio checked={dailyLimitMode === 'nextDay'} label="次日继续刊登" onChange={() => setDailyLimitMode('nextDay')} />
              </div>
              {dailyLimitMode === 'nextDay' ? (
                <div className="up-picker-row">
                  <TimePicker value={nextDayTime} onChange={setNextDayTime} />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
});

export default ClaimMethodSection;
