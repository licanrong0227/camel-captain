/**
 * @name 渠道设置弹窗
 */

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './style.css';

interface AddressOption {
  id: string;
  label: string;
  zh: string;
  en: string;
}

const INITIAL_ADDRESSES: AddressOption[] = [
  {
    id: 'addr-1',
    label: '深圳市龙岗区world星河B栋2702',
    zh: '深圳市龙岗区world星河B栋2702',
    en: 'Building B, World Star River, Longgang District, Shenzhen City, Room 2702',
  },
  {
    id: 'addr-2',
    label: 'shenzhenshilonghuaqudonghuaner',
    zh: '深圳市龙华区东环二路',
    en: 'Donghuan 2nd Road, Longhua District, Shenzhen City',
  },
];

const PLATFORM_OPTIONS = [
  'DPD',
  'USPS',
  'UPS- Abroad Delivery',
  'Royal Mail',
  'Fedex- Abroad Delivery',
  'DHL- Abroad Delivery',
  'Canada Post',
  'DHL Parcel-NL',
  'GLS-IT',
  'au post',
  'La Poste',
  'Poste Italiane',
].map((value) => ({ label: value, value }));

const UNDELIVERABLE_OPTIONS = [
  { label: '丢弃', value: 'discard' },
  { label: '退回', value: 'return' },
];

const DELIVERY_OPTIONS = [
  { label: '上门取收', value: 'pickup' },
  { label: '卖家自送', value: 'seller' },
];

const VAT_OPTIONS = ['IOSS', 'no-IOSS', 'other', 'VOEC', 'LVG-Number', 'VAT', 'RFC', 'CURP'].map((value) => ({
  label: value,
  value,
}));

function Caret({ open }: { open: boolean }) {
  return (
    <svg className={`csd-caret${open ? ' is-open' : ''}`} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3.4 3.4l9.2 9.2M12.6 3.4l-9.2 9.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 2.2v9.6M2.2 7h9.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

interface SelectProps {
  value: string;
  options: { label: string; value: string }[];
  placeholder: string;
  width?: number | string;
  onChange: (value: string) => void;
}

function CsSelect({ value, options, placeholder, width, onChange }: SelectProps) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updateRect = () => {
    if (triggerRef.current) setRect(triggerRef.current.getBoundingClientRect());
  };

  useEffect(() => {
    if (!open) return;
    updateRect();
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onViewportChange = () => updateRect();
    document.addEventListener('mousedown', onPointerDown);
    window.addEventListener('resize', onViewportChange);
    window.addEventListener('scroll', onViewportChange, true);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('resize', onViewportChange);
      window.removeEventListener('scroll', onViewportChange, true);
    };
  }, [open]);

  const current = options.find((option) => option.value === value);

  return (
    <div className="csd-select" style={{ width }}>
      <button
        ref={triggerRef}
        type="button"
        className={`csd-select-trigger${current ? '' : ' is-placeholder'}${open ? ' is-active' : ''}`}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="csd-select-text">{current ? current.label : placeholder}</span>
        <Caret open={open} />
      </button>
      {open && rect
        ? createPortal(
            <div
              ref={menuRef}
              className="csd-select-menu"
              style={{ left: rect.left, top: rect.bottom + 4, width: rect.width }}
              onMouseDown={(event) => event.stopPropagation()}
            >
              {options.map((option) => (
                <div
                  key={option.value}
                  className={`csd-select-option${option.value === value ? ' is-selected' : ''}`}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  {option.label}
                </div>
              ))}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

interface RadioGroupProps {
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
}

function RadioGroup({ value, options, onChange }: RadioGroupProps) {
  return (
    <div className="csd-radio-group" role="radiogroup">
      {options.map((option) => (
        <span
          key={option.value}
          role="radio"
          aria-checked={option.value === value}
          tabIndex={0}
          className={`csd-radio${option.value === value ? ' is-checked' : ''}`}
          onClick={() => onChange(option.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onChange(option.value);
            }
          }}
        >
          <span className="csd-radio-dot" />
          <span>{option.label}</span>
        </span>
      ))}
    </div>
  );
}

export default function ChannelSettingsDialog() {
  const [open, setOpen] = useState(true);
  const [platform, setPlatform] = useState('');
  const [undeliverable, setUndeliverable] = useState('discard');
  const [delivery, setDelivery] = useState('seller');
  const [vat, setVat] = useState('IOSS');
  const [addresses, setAddresses] = useState<AddressOption[]>(INITIAL_ADDRESSES);
  const [addressId, setAddressId] = useState(INITIAL_ADDRESSES[0].id);
  const [englishAddress, setEnglishAddress] = useState(INITIAL_ADDRESSES[0].en);
  const [chineseAddress, setChineseAddress] = useState(INITIAL_ADDRESSES[0].zh);
  const [pidPriority, setPidPriority] = useState('product');
  const [nsPid, setNsPid] = useState('');
  const [sPid, setSPid] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [newChinese, setNewChinese] = useState('');
  const [newEnglish, setNewEnglish] = useState('');
  const [toast, setToast] = useState('');
  const toastTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 2000);
  };

  const handleAddressChange = (nextId: string) => {
    setAddressId(nextId);
    const target = addresses.find((item) => item.id === nextId);
    if (target) {
      setChineseAddress(target.zh);
      setEnglishAddress(target.en);
    }
  };

  const handleAddAddress = () => {
    const zh = newChinese.trim();
    const en = newEnglish.trim();
    if (!zh && !en) {
      setAddOpen(false);
      return;
    }
    const label = zh || en;
    const existing = addresses.find((item) => item.label === label);
    if (existing) {
      handleAddressChange(existing.id);
    } else {
      const next: AddressOption = {
        id: `addr-${addresses.length + 1}`,
        label,
        zh: zh || label,
        en,
      };
      setAddresses((prev) => [...prev, next]);
      setAddressId(next.id);
      setChineseAddress(next.zh);
      setEnglishAddress(next.en);
    }
    setNewChinese('');
    setNewEnglish('');
    setAddOpen(false);
  };

  const handleConfirm = () => {
    setOpen(false);
    showToast('渠道设置已保存');
  };

  return (
    <div className="csd-page">
      {open ? (
        <div
          className="csd-mask"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div className="csd-dialog" role="dialog" aria-modal="true" aria-labelledby="csd-title">
            <div className="csd-head">
              <h1 className="csd-title" id="csd-title">渠道设置</h1>
              <button type="button" className="csd-close" aria-label="关闭" onClick={() => setOpen(false)}>
                <CloseIcon />
              </button>
            </div>

            <div className="csd-body">
              <div className="csd-section">
                <h2 className="csd-h4">Dhgate线上物流2.0</h2>
                <h3 className="csd-h5">LKA-美国标准专线(普+特)-HP</h3>
              </div>

              <div className="csd-section">
                <h2 className="csd-h4">物流渠道与平台对应关系</h2>
                <div className="csd-form-item">
                  <label className="csd-label">Dhgate</label>
                  <div className="csd-form-content">
                    <CsSelect value={platform} options={PLATFORM_OPTIONS} placeholder="请选择" width={217} onChange={setPlatform} />
                  </div>
                </div>
              </div>

              <div className="csd-section">
                <h2 className="csd-h4">物流商配置</h2>
                <div className="csd-config-row">
                  <span className="csd-config-label">不可送达</span>
                  <RadioGroup value={undeliverable} options={UNDELIVERABLE_OPTIONS} onChange={setUndeliverable} />
                </div>
                <div className="csd-config-row">
                  <span className="csd-config-label">寄送方式</span>
                  <RadioGroup value={delivery} options={DELIVERY_OPTIONS} onChange={setDelivery} />
                </div>
                <div className="csd-config-row">
                  <span className="csd-config-label">VAT支付类型</span>
                  <RadioGroup value={vat} options={VAT_OPTIONS} onChange={setVat} />
                </div>
              </div>

              <div className="csd-section">
                <h2 className="csd-h4">发货人地址（英文）</h2>
                <div className="csd-form-item">
                  <label className="csd-label">地址选择</label>
                  <div className="csd-form-content">
                    <div className="csd-address-row">
                      <CsSelect
                        value={addressId}
                        options={addresses.map((item) => ({ label: item.label, value: item.id }))}
                        placeholder="请选择地址"
                        onChange={handleAddressChange}
                      />
                      <button type="button" className="csd-btn csd-btn--primary csd-add-btn" onClick={() => setAddOpen(true)}>
                        <PlusIcon />
                        <span>新增地址</span>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="csd-form-item">
                  <label className="csd-label">英文地址</label>
                  <div className="csd-form-content">
                    <input
                      className="csd-input"
                      value={englishAddress}
                      placeholder="请输入英文地址"
                      onChange={(event) => setEnglishAddress(event.target.value)}
                    />
                  </div>
                </div>
                <div className="csd-form-item">
                  <label className="csd-label">中文地址</label>
                  <div className="csd-form-content">
                    <input
                      className="csd-input"
                      value={chineseAddress}
                      placeholder="请输入中文地址"
                      onChange={(event) => setChineseAddress(event.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="csd-section">
                <h2 className="csd-h4">申报信息</h2>
                <div className="csd-form-item csd-form-item--wide">
                  <label className="csd-label">默认优先Pid码</label>
                  <div className="csd-form-content csd-form-content--radios">
                    <RadioGroup
                      value={pidPriority}
                      options={[
                        { label: '商品信息Pid码', value: 'product' },
                        { label: '渠道信息Pid码', value: 'channel' },
                      ]}
                      onChange={setPidPriority}
                    />
                  </div>
                </div>
                <div className="csd-form-item csd-form-item--wide">
                  <label className="csd-label">制造商产品识别码（nsPid）</label>
                  <div className="csd-form-content">
                    <input
                      className="csd-input"
                      value={nsPid}
                      placeholder="请输入制造商产品识别码"
                      onChange={(event) => setNsPid(event.target.value)}
                    />
                  </div>
                </div>
                <div className="csd-form-item csd-form-item--wide">
                  <label className="csd-label">国际标准商品编码（sPid）</label>
                  <div className="csd-form-content">
                    <input
                      className="csd-input"
                      value={sPid}
                      placeholder="请输入国际标准商品编码"
                      onChange={(event) => setSPid(event.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="csd-foot">
              <button type="button" className="csd-btn" onClick={() => setOpen(false)}>取消</button>
              <button type="button" className="csd-btn csd-btn--primary" onClick={handleConfirm}>确定</button>
            </div>
          </div>

          {addOpen ? (
            <div
              className="csd-sub-mask"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) setAddOpen(false);
              }}
            >
              <div className="csd-sub-dialog" role="dialog" aria-modal="true" aria-labelledby="csd-sub-title">
                <div className="csd-head">
                  <h1 className="csd-title" id="csd-sub-title">新增地址</h1>
                  <button type="button" className="csd-close" aria-label="关闭" onClick={() => setAddOpen(false)}>
                    <CloseIcon />
                  </button>
                </div>
                <div className="csd-body">
                  <div className="csd-form-item">
                    <label className="csd-label">中文地址</label>
                    <div className="csd-form-content">
                      <input className="csd-input" value={newChinese} placeholder="请输入中文地址" onChange={(event) => setNewChinese(event.target.value)} />
                    </div>
                  </div>
                  <div className="csd-form-item">
                    <label className="csd-label">英文地址</label>
                    <div className="csd-form-content">
                      <input className="csd-input" value={newEnglish} placeholder="请输入英文地址" onChange={(event) => setNewEnglish(event.target.value)} />
                    </div>
                  </div>
                </div>
                <div className="csd-foot">
                  <button type="button" className="csd-btn" onClick={() => setAddOpen(false)}>取消</button>
                  <button type="button" className="csd-btn csd-btn--primary" onClick={handleAddAddress}>确定</button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="csd-closed">
          <div className="csd-closed-card">
            <h2>渠道设置</h2>
            <p>弹窗已关闭</p>
            <button type="button" className="csd-btn csd-btn--primary" onClick={() => setOpen(true)}>重新打开弹窗</button>
          </div>
        </div>
      )}

      {toast ? (
        <div className="csd-toast" role="status">
          <span className="csd-toast-dot" />
          {toast}
        </div>
      ) : null}
    </div>
  );
}
