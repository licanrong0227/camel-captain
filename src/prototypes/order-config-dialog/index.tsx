/**
 * @name 订单配置项弹窗
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import PidRuleDialog from './pid-rule-dialog';
import { createDefaultPidConfig, type PidConfig } from './pid-rule-model';
import './style.css';

type TabKey = 'list' | 'waybill' | 'platform' | 'outbound' | 'im' | 'pid';
type ImKey = 'failed' | 'arrived';

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'list', label: '订单列表' },
  { key: 'waybill', label: '申请运单号' },
  { key: 'platform', label: '提交平台' },
  { key: 'outbound', label: '出库' },
  { key: 'im', label: 'IM自动回复' },
  { key: 'pid', label: 'Pid 码配置' },
];

type PidSourceKey = 'product' | 'channel' | 'system';

const PID_SOURCES: Array<{ key: PidSourceKey; label: string }> = [
  { key: 'product', label: '商品信息 Pid 码' },
  { key: 'channel', label: '渠道信息 Pid 码' },
  { key: 'system', label: '系统生成 Pid 码' },
];

const PID_SCOPE_OPTIONS = [
  { value: 'order', label: '只对订单生效，下次相同商品相同SKU出单需要再次生成Pid' },
  { value: 'sku', label: '对商品SKU生效，下次相同商品相同SKU出单复用之前生成的Pid' },
];

const WAYBILL_OPTIONS = [
  { value: 'unlimited', label: '无限制' },
  { value: 'purchased', label: '已采购' },
  { value: 'shipping', label: '采购运输' },
];

const PLATFORM_OPTIONS = [
  { value: 'unlimited', label: '无限制' },
  { value: 'waybill-shipped', label: '申请运单号后且国内已发' },
];

const PRINT_SIZE_OPTIONS = [
  { value: '100*100', label: '100*100' },
  { value: '100*150', label: '100*150' },
];

const TRANSLATIONS: Record<string, string> = {
  Hello: 'Hello',
  你好: 'Hello',
  '你好，您的包裹到达取件点，请及时领取':
    'Hello, your package has arrived at the pickup point. Please collect it promptly.',
  '您的包裹投递失败，我们会尽快重新安排配送':
    'Your package delivery failed. We will arrange another delivery as soon as possible.',
  '您好，请尽快确认收货信息，谢谢':
    'Hello, please confirm your delivery information as soon as possible. Thank you.',
};

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3.4 3.4l9.2 9.2M12.6 3.4l-9.2 9.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function SuccessIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7" fill="currentColor" />
      <path d="M4.8 8.2 7 10.4l4.2-4.6" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2 4h10M2 10h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="5" cy="4" r="1.6" fill="#fff" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="9" cy="10" r="1.6" fill="#fff" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function Spinner() {
  return (
    <span className="ocd-spinner" aria-hidden="true">
      {Array.from({ length: 12 }).map((_, index) => (
        <i key={index} style={{ transform: `rotate(${index * 30}deg)`, animationDelay: `${index * 0.08}s` }} />
      ))}
    </span>
  );
}

function Switch({ checked, label, onChange }: { checked: boolean; label: string; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`ocd-switch${checked ? ' is-checked' : ''}`}
      onClick={onChange}
    >
      <span className="ocd-switch__core" />
    </button>
  );
}

function RadioGroup({
  name,
  value,
  options,
  onChange,
}: {
  name: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <div className="ocd-options" role="radiogroup" aria-label={name}>
      {options.map((option) => {
        const checked = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={checked}
            className={`ocd-radio${checked ? ' is-checked' : ''}`}
            onClick={() => onChange(option.value)}
          >
            <span className="ocd-radio__inner" />
            <span className="ocd-radio__label">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function Row({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`ocd-row${className ? ` ${className}` : ''}`}>
      <div className="ocd-row-label">{label}</div>
      <div className="ocd-row-mix">{children}</div>
    </div>
  );
}

export default function OrderConfigDialog() {
  const [open, setOpen] = useState(true);
  const [tab, setTab] = useState<TabKey>('list');
  const [shipWarning, setShipWarning] = useState(true);
  const [purchaseWarning, setPurchaseWarning] = useState(true);
  const [waybill, setWaybill] = useState('unlimited');
  const [platform, setPlatform] = useState('unlimited');
  const [printSize, setPrintSize] = useState('100*150');
  const [im, setIm] = useState<Record<ImKey, { enabled: boolean; text: string }>>({
    failed: { enabled: true, text: 'Hello' },
    arrived: { enabled: true, text: 'Hello' },
  });
  const [translating, setTranslating] = useState<ImKey | null>(null);
  const [pidEnabled, setPidEnabled] = useState(false);
  const [pidPriority, setPidPriority] = useState<PidSourceKey[]>(['product', 'channel', 'system']);
  const [pidScope, setPidScope] = useState('order');
  const [pidConfig, setPidConfig] = useState<PidConfig | null>(null);
  const [pidDialogOpen, setPidDialogOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);
  const translateTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
      if (translateTimer.current) window.clearTimeout(translateTimer.current);
    },
    [],
  );

  const showToast = (text: string) => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    setToast(text);
    toastTimer.current = window.setTimeout(() => setToast(null), 2500);
  };

  const updateIm = (key: ImKey, patch: Partial<{ enabled: boolean; text: string }>) => {
    setIm((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  };

  const movePidSource = (index: number, offset: number) => {
    setPidPriority((prev) => {
      const target = index + offset;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const translate = (key: ImKey) => {
    if (translating) return;
    setTranslating(key);
    translateTimer.current = window.setTimeout(() => {
      setIm((prev) => {
        const current = prev[key].text;
        const next = TRANSLATIONS[current.trim()] ?? current;
        return { ...prev, [key]: { ...prev[key], text: next } };
      });
      setTranslating(null);
      showToast('翻译成功');
    }, 700);
  };

  const handleClose = () => setOpen(false);

  const handleReopen = () => {
    setTab('list');
    setShipWarning(true);
    setPurchaseWarning(true);
    setWaybill('unlimited');
    setPlatform('unlimited');
    setPrintSize('100*150');
    setIm({
      failed: { enabled: true, text: 'Hello' },
      arrived: { enabled: true, text: 'Hello' },
    });
    setTranslating(null);
    setPidEnabled(false);
    setPidPriority(['product', 'channel', 'system']);
    setPidScope('order');
    setPidConfig(null);
    setPidDialogOpen(false);
    setOpen(true);
  };

  const handlePidSave = (config: PidConfig) => {
    setPidConfig(config);
    setPidDialogOpen(false);
    showToast('设置已保存');
  };

  const pidInitialConfig = useMemo(() => pidConfig ?? createDefaultPidConfig(), [pidConfig]);

  const handleConfirm = () => {
    if (pidEnabled && !pidConfig) {
      showToast('没有设置 nsPid 生成规则，不能保存');
      return;
    }
    setOpen(false);
    showToast('保存成功');
  };

  return (
    <div className="ocd-page">
      <div className="ocd-mask">
        {open ? (
          <section className="ocd-dialog" role="dialog" aria-modal="true" aria-label="订单配置项">
            <header className="ocd-header">
              <h2 className="ocd-title">订单配置项</h2>
              <button type="button" className="ocd-close" aria-label="关闭" onClick={handleClose}>
                <CloseIcon />
              </button>
            </header>

            <div className="ocd-body">
              <div className="ocd-layout">
                <nav className="ocd-nav" aria-label="订单配置项页签">
                  {TABS.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      className={`ocd-nav-item${tab === item.key ? ' is-active' : ''}`}
                      aria-current={tab === item.key ? 'page' : undefined}
                      onClick={() => setTab(item.key)}
                    >
                      {item.label}
                    </button>
                  ))}
                </nav>

                <div className="ocd-main">
                  <div className="ocd-content">
                    {tab === 'list' && (
                      <>
                        <Row label="发货预警">
                          <Switch checked={shipWarning} label="发货预警" onChange={() => setShipWarning((v) => !v)} />
                        </Row>
                        <Row label="采购预警">
                          <Switch
                            checked={purchaseWarning}
                            label="采购预警"
                            onChange={() => setPurchaseWarning((v) => !v)}
                          />
                        </Row>
                      </>
                    )}

                    {tab === 'waybill' && (
                      <Row label="申请运单号的方式">
                        <RadioGroup name="申请运单号的方式" value={waybill} options={WAYBILL_OPTIONS} onChange={setWaybill} />
                      </Row>
                    )}

                    {tab === 'platform' && (
                      <Row label="提交平台设置">
                        <RadioGroup name="提交平台设置" value={platform} options={PLATFORM_OPTIONS} onChange={setPlatform} />
                      </Row>
                    )}

                    {tab === 'outbound' && (
                      <Row label="打印面单尺寸">
                        <RadioGroup name="打印面单尺寸" value={printSize} options={PRINT_SIZE_OPTIONS} onChange={setPrintSize} />
                      </Row>
                    )}

                    {tab === 'im' && (
                      <>
                        <Row label="投递失败">
                          <Switch
                            checked={im.failed.enabled}
                            label="投递失败自动回复"
                            onChange={() => updateIm('failed', { enabled: !im.failed.enabled })}
                          />
                          {im.failed.enabled && (
                            <>
                              <span className="ocd-mix-label">回复内容</span>
                              <input
                                className="ocd-input"
                                value={im.failed.text}
                                placeholder="请输入回复内容"
                                onChange={(event) => updateIm('failed', { text: event.target.value })}
                              />
                              <button
                                type="button"
                                className="ocd-btn ocd-btn--primary ocd-btn--small"
                                onClick={() => translate('failed')}
                              >
                                翻译
                              </button>
                            </>
                          )}
                        </Row>

                        <Row label="到达待取">
                          <Switch
                            checked={im.arrived.enabled}
                            label="到达待取自动回复"
                            onChange={() => updateIm('arrived', { enabled: !im.arrived.enabled })}
                          />
                          {im.arrived.enabled && (
                            <>
                              <span className="ocd-mix-label">回复内容</span>
                              <input
                                className="ocd-input"
                                value={im.arrived.text}
                                placeholder="请输入回复内容"
                                onChange={(event) => updateIm('arrived', { text: event.target.value })}
                              />
                              <button
                                type="button"
                                className="ocd-btn ocd-btn--primary ocd-btn--small"
                                onClick={() => translate('arrived')}
                              >
                                翻译
                              </button>
                            </>
                          )}
                        </Row>
                      </>
                    )}

                    {tab === 'pid' && (
                      <>
                        <Row label="自动生成制造商产品识别码(nsPid)" className="ocd-row--pid">
                          <Switch
                            checked={pidEnabled}
                            label="自动生成 nsPid"
                            onChange={() => setPidEnabled((value) => !value)}
                          />
                        </Row>

                        <div className="ocd-pid-extra">
                          {pidEnabled && (
                            <div className="ocd-pid-card">
                              <div className="ocd-pid-actions">
                                <button
                                  type="button"
                                  className="ocd-settings-entry"
                                  onClick={() => setPidDialogOpen(true)}
                                >
                                  <SettingsIcon />
                                  设置生成规则
                                </button>
                                {pidConfig && <span className="ocd-config-tag">已配置</span>}
                              </div>
                              <div className="ocd-pid-scope">
                                <span className="ocd-pid-scope__title">Pid 码适用范围</span>
                                <RadioGroup
                                  name="Pid 码适用范围"
                                  value={pidScope}
                                  options={PID_SCOPE_OPTIONS}
                                  onChange={setPidScope}
                                />
                              </div>
                            </div>
                          )}
                          <div className="ocd-pid-priority">
                              <div className="ocd-pid-priority__head">
                                <span className="ocd-pid-priority__title">Pid 码优先级</span>
                              </div>
                              {pidPriority.map((key, index) => {
                                const source = PID_SOURCES.find((item) => item.key === key);
                                return (
                                  <div className="ocd-pid-priority__row" key={key}>
                                    <span className="ocd-pid-priority__index">{index + 1}</span>
                                    <span className="ocd-pid-priority__label">{source?.label}</span>
                                    <span className="ocd-pid-priority__actions">
                                      <button
                                        type="button"
                                        aria-label={`上移${source?.label}`}
                                        disabled={index === 0}
                                        onClick={() => movePidSource(index, -1)}
                                      >
                                        <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
                                          <path
                                            d="M2.5 7.5 6 4l3.5 3.5"
                                            stroke="currentColor"
                                            strokeWidth="1.2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          />
                                        </svg>
                                      </button>
                                      <button
                                        type="button"
                                        aria-label={`下移${source?.label}`}
                                        disabled={index === pidPriority.length - 1}
                                        onClick={() => movePidSource(index, 1)}
                                      >
                                        <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
                                          <path
                                            d="M2.5 4.5 6 8l3.5-3.5"
                                            stroke="currentColor"
                                            strokeWidth="1.2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          />
                                        </svg>
                                      </button>
                                    </span>
                                  </div>
                                );
                              })}
                              <p className="ocd-pid-priority__note">
                                从上到下取第一个可用的 Pid 码；Pid 码优先级仅在 Pid 码为空时生效，如果已在申报信息中保存了 Pid 码，则按已保存的 Pid 码提交
                              </p>
                            </div>
                        </div>
                      </>
                    )}

                    {translating && (
                      <div className="ocd-loading">
                        <Spinner />
                      </div>
                    )}
                  </div>

                  <footer className="ocd-footer">
                    <button type="button" className="ocd-btn ocd-btn--ghost" onClick={handleClose}>
                      取消
                    </button>
                    <button type="button" className="ocd-btn ocd-btn--primary" onClick={handleConfirm}>
                      确定
                    </button>
                  </footer>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <button type="button" className="ocd-reopen" onClick={handleReopen}>
            重新打开弹窗
          </button>
        )}

        {pidDialogOpen && (
          <PidRuleDialog
            initialConfig={pidInitialConfig}
            onCancel={() => setPidDialogOpen(false)}
            onConfirm={handlePidSave}
            onNotify={showToast}
          />
        )}

        {toast && (
          <div className="ocd-toast" role="status">
            <span className="ocd-toast__icon">
              <SuccessIcon />
            </span>
            <span>{toast}</span>
          </div>
        )}
      </div>
    </div>
  );
}
