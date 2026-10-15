/**
 * @name 更新发布弹窗
 */

import React, { useEffect, useRef, useState } from 'react';
import { AnnotationViewer, type AnnotationSourceDocument } from '@axhub/annotation';
import annotationSourceDocument from './annotation-source.json';
import mainSample1 from './assets/main-image-sample-1.png';
import './style.css';

const pad2 = (n: number) => String(n).padStart(2, '0');

type SegmentState = { pre: string; start: string; suf: string };
type UploadedImage = { id: string; url: string; name: string; width: number; height: number };

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

const CalendarIcon = () => (
  <svg className="up-picker__icon" width="14" height="14" viewBox="0 0 14 14" fill="none">
    <rect x="1.5" y="2.5" width="11" height="10" rx="1" stroke="currentColor" strokeWidth="1.2" />
    <path d="M1.5 5.5H12.5" stroke="currentColor" strokeWidth="1.2" />
    <path d="M4.5 1V3.5M9.5 1V3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const ClockIcon = () => (
  <svg className="up-picker__icon" width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
    <path d="M7 4V7L9 8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const PictureIcon = () => (
  <svg width="62" height="62" viewBox="0 0 24 24" fill="none" stroke="#c0c4cc" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

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

/**
 * 时间选择器（ElementUI el-time-picker 样式）：时/分/秒 三列，可选取任意时间点
 */
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

type IncrementValue = { prefixOn: boolean; suffixOn: boolean; prefix: SegmentState; suffix: SegmentState };

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

const emptySegment = (): SegmentState => ({ pre: '', start: '1', suf: '' });
const defaultIncrement = (): IncrementValue => ({ prefixOn: false, suffixOn: true, prefix: emptySegment(), suffix: emptySegment() });

const incrementHasEmptyStart = (v: IncrementValue) => (v.prefixOn && !v.prefix.start) || (v.suffixOn && !v.suffix.start);

const IncrementGroup = ({ value, onChange, annotationId }: { value: IncrementValue; onChange: (next: IncrementValue) => void; annotationId: string }) => {
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
    <div className="up-increment" data-annotation-id={annotationId}>
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

const UpdatePublishDialog = () => {
  const [visible, setVisible] = useState(true);

  const [publishMode, setPublishMode] = useState<'now' | 'scheduled'>('now');
  const [scheduledTime, setScheduledTime] = useState('');

  const [loopOn, setLoopOn] = useState(false);
  const [loopLimit, setLoopLimit] = useState('1');

  const [titleOn, setTitleOn] = useState(false);
  const [titleMode, setTitleMode] = useState<'shuffle' | 'increment' | 'ai' | 'backup'>('shuffle');
  const [titleIncrement, setTitleIncrement] = useState<IncrementValue>(defaultIncrement);
  const [backupTitles, setBackupTitles] = useState<string[]>(['']);
  const [backupTitleStrategy, setBackupTitleStrategy] = useState<'shuffle' | 'increment' | 'ai'>('shuffle');
  const [backupIncrement, setBackupIncrement] = useState<IncrementValue>(defaultIncrement);

  const [imageOn, setImageOn] = useState(false);
  const [imageMode, setImageMode] = useState<'shuffle' | 'backup'>('shuffle');
  const [backupImageStrategy, setBackupImageStrategy] = useState<'shuffle'>('shuffle');
  const [backupImages, setBackupImages] = useState<UploadedImage[]>([
    { id: 'sample-1', url: mainSample1, name: '示例图片', width: 1024, height: 1024 },
  ]);
  const uploadFileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const [dailyLimitMode, setDailyLimitMode] = useState<'stop' | 'nextDay'>('stop');
  const [nextDayTime, setNextDayTime] = useState('');

  const [strategyError, setStrategyError] = useState('');

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

  const handleConfirm = () => {
    if (loopOn && !titleOn && !imageOn) {
      setStrategyError('请至少启用一项自动刊登策略（标题策略 / 主图策略）');
      return;
    }
    const needIncrementCheck = loopOn && titleOn
      && (titleMode === 'increment' || (titleMode === 'backup' && backupTitleStrategy === 'increment'));
    if (needIncrementCheck
      && ((titleMode === 'increment' && incrementHasEmptyStart(titleIncrement))
        || (titleMode === 'backup' && backupTitleStrategy === 'increment' && incrementHasEmptyStart(backupIncrement)))) {
      setStrategyError('增量起始值不能为空');
      return;
    }
    setVisible(false);
  };

  return (
    <>
      {visible ? (
        <div className="up-overlay">
          <div className="up-dialog" role="dialog" aria-modal="true" aria-label="更新发布">
            <div className="up-dialog__header">
              <span className="up-dialog__title">更新发布</span>
              <button type="button" className="up-dialog__close" aria-label="关闭" onClick={() => setVisible(false)}>×</button>
            </div>

            <div className="up-dialog__body">
              <div className="up-form-row" data-annotation-id="publish-time-row">
                <span className="up-form-label">发布时间</span>
                <div className="up-form-value">
                  <div className="up-radio-group">
                    <Radio checked={publishMode === 'now'} label="立即发布" onChange={() => setPublishMode('now')} />
                    <Radio checked={publishMode === 'scheduled'} label="定时发布" onChange={() => setPublishMode('scheduled')} />
                  </div>
                  {publishMode === 'scheduled' ? (
                    <div className="up-picker-row">
                      <DateTimePicker value={scheduledTime} onChange={setScheduledTime} />
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="up-form-row" data-annotation-id="loop-row">
                <span className="up-form-label">循环刊登</span>
                <div className="up-form-value up-switch-line">
                  <Switch
                    checked={loopOn}
                    onChange={() => setLoopOn((v) => { const nv = !v; if (!nv) setStrategyError(''); return nv; })}
                    ariaLabel="循环刊登开关"
                  />
                  {loopOn ? (
                    <span className="up-inline-field">
                      <span className="up-inline-field__label">循环次数限制</span>
                      <NumberField value={loopLimit} onChange={setLoopLimit} ariaLabel="循环次数限制" />
                    </span>
                  ) : null}
                </div>
              </div>

              {loopOn ? (
                <>
              <div className="up-section" data-annotation-id="strategy-section">
                <h3 className="up-section__title">
                  <span className="up-required">*</span>自动刊登策略
                </h3>
                {strategyError ? <p className="up-section__error">{strategyError}</p> : null}

                <div className="up-strategy-block" data-annotation-id="title-strategy-block">
                  <div className="up-strategy-block__head">
                    <span className="up-strategy-block__title">标题策略</span>
                    <Switch checked={titleOn} onChange={() => { setTitleOn((v) => { const nv = !v; if (nv) setStrategyError(''); return nv; }); }} ariaLabel="标题策略开关" />
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
                        <IncrementGroup value={titleIncrement} onChange={setTitleIncrement} annotationId="title-increment" />
                      ) : null}
                      {titleMode === 'backup' ? (
                        <div className="up-backup" data-annotation-id="backup-titles">
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
                              <IncrementGroup value={backupIncrement} onChange={setBackupIncrement} annotationId="backup-title-increment" />
                            ) : null}
                          </div>
                        </div>
                      ) : null}
                    </>
                  ) : null}
                </div>

                <div className="up-strategy-block" data-annotation-id="image-strategy-block">
                  <div className="up-strategy-block__head">
                    <span className="up-strategy-block__title">主图策略</span>
                    <Switch checked={imageOn} onChange={() => { setImageOn((v) => { const nv = !v; if (nv) setStrategyError(''); return nv; }); }} ariaLabel="主图策略开关" />
                  </div>
                  {imageOn ? (
                    <>
                      <div className="up-option-list">
                        <Radio checked={imageMode === 'shuffle'} label="随机打乱" onChange={() => setImageMode('shuffle')} />
                        <Radio checked={imageMode === 'backup'} label="备选首图" onChange={() => setImageMode('backup')} />
                      </div>
                      {imageMode === 'backup' ? (
                        <div className="up-upload-wrap" data-annotation-id="backup-images">
                          <div className="up-upload">
                            <button type="button" className="up-upload__add" onClick={() => setUploadDialogOpen(true)}>
                              <span className="up-upload__add-plus">+</span>
                              <span className="up-upload__add-text">
                                <span className="up-upload__add-line">点击</span>
                                <span className="up-upload__add-line">Ctrl+V粘贴</span>
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
                            onChange={(e) => { handleFiles(e.target.files); setUploadDialogOpen(false); e.target.value = ''; }}
                          />
                          <p className="up-hint">循环刊登时，如果某张首图未通过审核，将自动更换另一张备选首图重试。</p>

                          <div className="up-sub-strategy">
                            <div className="up-sub-strategy__head">
                              <span className="up-sub-strategy__title">备选首图策略</span>
                              <span className="up-sub-strategy__desc">当备选首图已用完但循环刊登未结束时启用</span>
                            </div>
                            <div className="up-option-list up-option-list--inline">
                              <Radio checked={backupImageStrategy === 'shuffle'} label="随机打乱" onChange={() => setBackupImageStrategy('shuffle')} />
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </>
                  ) : null}
                </div>
              </div>

              <div className="up-form-row up-form-row--limit" data-annotation-id="daily-limit-row">
                <span className="up-form-label up-form-label--limit">刊登数量达到当日上限时：</span>
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
              </>
              ) : null}
            </div>

            <div className="up-dialog__footer" data-annotation-id="dialog-footer">
              <button type="button" className="up-btn up-btn--plain" onClick={() => setVisible(false)}>取消</button>
              <button type="button" className="up-btn up-btn--primary" onClick={handleConfirm}>确定</button>
            </div>
          </div>

          {uploadDialogOpen ? (
            <div className="up-upl-overlay">
              <div className="up-upl-modal" role="dialog" aria-modal="true" aria-label="上传图片">
                <div className="up-upl-header">
                  <span className="up-upl-title">上传图片</span>
                  <button type="button" className="up-upl-close" aria-label="关闭" onClick={() => setUploadDialogOpen(false)}>×</button>
                </div>
                <div className="up-upl-body">
                  <div className="up-upl-tabs">
                    <span className="up-upl-tab is-active">本地</span>
                    <span className="up-upl-tab">URL</span>
                    <div className="up-upl-tab" data-annotation-id="upload-ref-tab">引用</div>
                  </div>
                  <div className="up-upl-content">
                    <div className="up-radio-group up-upl-radios">
                      <Radio checked label="单个上传" disabled onChange={() => undefined} />
                      <Radio checked={false} label="批量上传" disabled onChange={() => undefined} />
                    </div>
                    <div className="up-upl-drop" onClick={() => uploadFileInputRef.current?.click()}>
                      <PictureIcon />
                      <div className="up-upl-drop-text">
                        将文件拖到此处，或<span className="up-upl-drop-link">点击上传</span>
                      </div>
                      <div className="up-upl-drop-tip">按 Ctrl+V 可从剪贴板上传</div>
                    </div>
                  </div>
                </div>
                <div className="up-upl-footer">
                  <button type="button" className="up-btn up-btn--plain" onClick={() => setUploadDialogOpen(false)}>取消</button>
                  <button type="button" className="up-btn up-btn--primary" onClick={() => setUploadDialogOpen(false)}>确认</button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <button type="button" className="up-reopen" onClick={() => setVisible(true)}>打开更新发布弹窗</button>
      )}

      <AnnotationViewer
        source={annotationSourceDocument as unknown as AnnotationSourceDocument}
        options={{
          currentPageId: 'update-publish-dialog',
          toolbarEdge: 'right',
          showToolbar: true,
          showThemeToggle: true,
          showColorFilter: true,
          emptyWhenNoData: true,
        }}
      />
    </>
  );
};

export default UpdatePublishDialog;
