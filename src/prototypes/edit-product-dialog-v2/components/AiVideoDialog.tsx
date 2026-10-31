/**
 * AI 生成视频弹窗：选择参考图（主图 / 站外推广图 / SKU 图 / 详情图，最多 9 张），
 * 选择时长与画面比例后提交生成。
 */

import React from 'react';
import '../ai-video.css';

import main1 from '../assets/main-1.jpg';
import main2 from '../assets/main-2.jpg';
import main3 from '../assets/main-3.jpg';
import main4 from '../assets/main-4.jpg';
import main5 from '../assets/main-5.jpg';
import promo1 from '../assets/promo-1.jpg';
import sku1 from '../assets/sku-black.png';
import sku2 from '../assets/sku-white.png';
import detail1 from '../assets/detail-1.jpg';
import detail2 from '../assets/detail-2.jpg';
import detail3 from '../assets/main-6.jpg';

const MAX_REFS = 9;

const GROUPS = [
  {
    key: 'main',
    label: '主图',
    items: [
      { id: 'main-1', src: main1, size: '750*708' },
      { id: 'main-2', src: main2, size: '1600*1600' },
      { id: 'main-3', src: main3, size: '1500*1500' },
      { id: 'main-4', src: main4, size: '1500*1500' },
      { id: 'main-5', src: main5, size: '1000*1000' },
    ],
  },
  {
    key: 'promo',
    label: '站外推广图',
    items: [{ id: 'promo-1', src: promo1, size: '750*708' }],
  },
  {
    key: 'sku',
    label: 'SKU 图',
    items: [
      { id: 'sku-1', src: sku1, size: '1600*1600' },
      { id: 'sku-2', src: sku2, size: '1600*1600' },
    ],
  },
  {
    key: 'detail',
    label: '详情图',
    items: [
      { id: 'detail-1', src: detail1, size: '960*260' },
      { id: 'detail-2', src: detail2, size: '763*343' },
      { id: 'detail-3', src: detail3, size: '689*630' },
    ],
  },
];

const DURATIONS = [
  { value: '5', label: '5 秒' },
  { value: '10', label: '10 秒' },
  { value: '15', label: '15 秒' },
];

const TEMPLATES = [
  { value: 'product', label: '产品展示' },
  { value: 'ugc', label: 'UGC 种草' },
  { value: 'pain', label: '痛点解决' },
  { value: 'home', label: '家居场景' },
];

const RATIOS = [
  { value: 'auto', label: '自适应', w: 16, h: 12, auto: true },
  { value: '9:16', label: '9:16', w: 7, h: 12 },
  { value: '16:9', label: '16:9', w: 16, h: 9 },
  { value: '1:1', label: '1:1', w: 12, h: 12 },
  { value: '4:3', label: '4:3', w: 16, h: 12 },
  { value: '3:4', label: '3:4', w: 9, h: 12 },
  { value: '21:9', label: '21:9', w: 16, h: 7 },
];

const MARKETS = [
  { value: 'US', label: 'US(美国)', flag: 'US' },
  { value: 'GB', label: 'GB(英国)', flag: 'GB' },
  { value: 'DE', label: 'DE(德国)', flag: 'DE' },
  { value: 'EU', label: 'EU(欧洲)', flag: 'EU' },
  { value: 'JP', label: 'JP(日本)', flag: 'JP' },
  { value: 'KR', label: 'KR(韩国)', flag: 'KR' },
  { value: 'RU', label: 'RU(俄罗斯)', flag: 'RU' },
  { value: 'UK', label: 'UK(英国)', flag: 'GB' },
  { value: 'MX', label: 'MX(墨西哥)', flag: 'MX' },
  { value: 'SEA', label: 'SEA(东南亚)', flag: 'GLOBE' },
  { value: 'ASIA', label: 'ASIA(亚洲)', flag: 'GLOBE' },
  { value: 'LATAM', label: 'LATAM(拉美)', flag: 'GLOBE' },
  { value: 'GCC', label: 'GCC(中东)', flag: 'GLOBE' },
  { value: 'CN', label: 'CN(中国)', flag: 'CN' },
];

const LANGUAGES = ['中文', '英语', '印尼语', '日语', '韩语', '法语', '西班牙语', '德语', '葡萄牙语', '意大利语', '俄语', '泰语', '越南语', '马来语', '荷兰语', '波兰语', '瑞典语', '土耳其语'];

export type AiVideoParams = {
  refs: string[];
  duration: string;
  ratio: string;
  ratioLabel: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onGenerate: (params: AiVideoParams) => void;
  onRequestStop: () => void;
  failed?: boolean;
  onRetry?: () => void;
  onCancel?: () => void;
};

function IconClose() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function IconCaret() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function Flag({ code }: { code: string }) {
  switch (code) {
    case 'US':
      return (
        <svg viewBox="0 0 20 14" aria-hidden="true">
          <rect width="20" height="14" fill="#fff" />
          {[0, 2, 4, 6, 8, 10, 12].map((index) => (
            <rect key={index} y={(index * 14) / 13} width="20" height={14 / 13} fill="#b22234" />
          ))}
          <rect width="8.6" height={7.54} fill="#3c3b6e" />
          {Array.from({ length: 12 }).map((_, index) => (
            <circle
              key={index}
              cx={1.2 + (index % 4) * 2}
              cy={1.3 + Math.floor(index / 4) * 2.2}
              r="0.38"
              fill="#fff"
            />
          ))}
        </svg>
      );
    case 'GB':
      return (
        <svg viewBox="0 0 20 14" aria-hidden="true">
          <rect width="20" height="14" fill="#012169" />
          <path d="M0 0 20 14M20 0 0 14" stroke="#fff" strokeWidth="3" />
          <path d="M0 0 20 14M20 0 0 14" stroke="#c8102e" strokeWidth="1.2" />
          <path d="M10 0v14M0 7h20" stroke="#fff" strokeWidth="3.2" />
          <path d="M10 0v14M0 7h20" stroke="#c8102e" strokeWidth="1.6" />
        </svg>
      );
    case 'DE':
      return (
        <svg viewBox="0 0 20 14" aria-hidden="true">
          <rect width="20" height="4.67" fill="#000" />
          <rect y="4.67" width="20" height="4.67" fill="#dd0000" />
          <rect y="9.33" width="20" height="4.67" fill="#ffce00" />
        </svg>
      );
    case 'EU':
      return (
        <svg viewBox="0 0 20 14" aria-hidden="true">
          <rect width="20" height="14" fill="#003399" />
          {Array.from({ length: 12 }).map((_, index) => {
            const angle = ((index * 30 - 90) * Math.PI) / 180;
            return (
              <circle
                key={index}
                cx={10 + 4.1 * Math.cos(angle)}
                cy={7 + 4.1 * Math.sin(angle)}
                r="0.52"
                fill="#ffcc00"
              />
            );
          })}
        </svg>
      );
    case 'JP':
      return (
        <svg viewBox="0 0 20 14" aria-hidden="true">
          <rect width="20" height="14" fill="#fff" stroke="#e4e4e4" strokeWidth="0.6" />
          <circle cx="10" cy="7" r="4" fill="#bc002d" />
        </svg>
      );
    case 'KR':
      return (
        <svg viewBox="0 0 20 14" aria-hidden="true">
          <rect width="20" height="14" fill="#fff" stroke="#e4e4e4" strokeWidth="0.6" />
          <path d="M6.3 7a3.7 3.7 0 0 1 7.4 0Z" fill="#cd2e3a" />
          <path d="M6.3 7a3.7 3.7 0 0 0 7.4 0Z" fill="#0047a0" />
          <path d="M2.2 3.2h2.4M15.4 10.8h2.4M2.2 10.8h2.4M15.4 3.2h2.4" stroke="#2b2b2b" strokeWidth="0.7" />
        </svg>
      );
    case 'RU':
      return (
        <svg viewBox="0 0 20 14" aria-hidden="true">
          <rect width="20" height="4.67" fill="#fff" />
          <rect y="4.67" width="20" height="4.67" fill="#0039a6" />
          <rect y="9.33" width="20" height="4.67" fill="#d52b1e" />
        </svg>
      );
    case 'MX':
      return (
        <svg viewBox="0 0 20 14" aria-hidden="true">
          <rect width="6.67" height="14" fill="#006847" />
          <rect x="6.67" width="6.66" height="14" fill="#fff" />
          <rect x="13.33" width="6.67" height="14" fill="#ce1126" />
          <circle cx="10" cy="7" r="1.5" fill="#8a6a3b" />
        </svg>
      );
    case 'CN':
      return (
        <svg viewBox="0 0 20 14" aria-hidden="true">
          <rect width="20" height="14" fill="#de2910" />
          <polygon
            points="4.6,1.9 5.3,3.9 7.4,3.9 5.7,5.1 6.3,7.1 4.6,5.9 2.9,7.1 3.5,5.1 1.8,3.9 3.9,3.9"
            fill="#ffde00"
          />
          {[
            [8.2, 2.3],
            [9.5, 3.6],
            [9.5, 5.3],
            [8.2, 6.6],
          ].map(([cx, cy], index) => (
            <circle key={index} cx={cx} cy={cy} r="0.55" fill="#ffde00" />
          ))}
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 20 14" aria-hidden="true">
          <rect width="20" height="14" fill="#eaf4fb" />
          <circle cx="10" cy="7" r="6.3" fill="#5eb6e6" />
          <path
            d="M4.6 5.2c1.1-1.2 2.5-1.7 3.7-1.2.9.4.5 1.6 1.3 2.1.8.5 1.8.3 2.4 1.1.6.8-.2 1.6-.9 1.9-1.2.5-1.6 1.8-2.9 1.6-1.3-.2-2.4-1.2-2.9-2.5-.3-.8-.9-1.5-1.3-2.1-.2-.3.1-.6.6-.9Z"
            fill="#5fbf62"
          />
          <path d="M13.6 4.2c.8-.2 1.7.3 2 1 .2.7-.2 1.2-.8 1.4-.7.2-1.3-.2-1.5-.9-.2-.6-.1-1.3.3-1.5Z" fill="#5fbf62" />
          <path d="M12 10.2c.6-.1 1.1.3 1.2.8.1.5-.3.9-.9.9-.6 0-1-.4-1-.9 0-.4.3-.7.7-.8Z" fill="#5fbf62" />
        </svg>
      );
  }
}

export default function AiVideoDialog({ open, onClose, onGenerate, onRequestStop, failed = false, onRetry, onCancel }: Props) {
  const [selected, setSelected] = React.useState<string[]>([]);
  const [duration, setDuration] = React.useState('5');
  const [template, setTemplate] = React.useState('product');
  const [ratio, setRatio] = React.useState('auto');
  const [market, setMarket] = React.useState('US');
  const [language, setLanguage] = React.useState('英语');
  const [openSelect, setOpenSelect] = React.useState<'market' | 'language' | null>(null);
  const [toast, setToast] = React.useState('');
  const [stage, setStage] = React.useState<'form' | 'generating'>('form');
  const timerRef = React.useRef<number | undefined>(undefined);

  React.useEffect(() => {
    if (!open) return;
    setSelected([]);
    setDuration('5');
    setTemplate('product');
    setRatio('auto');
    setMarket('US');
    setLanguage('英语');
    setOpenSelect(null);
    setToast('');
    setStage('form');
  }, [open]);

  React.useEffect(() => () => window.clearTimeout(timerRef.current), []);

  if (!open) return null;

  const showToast = (text: string) => {
    setToast(text);
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setToast(''), 1800);
  };

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((item) => item !== id));
      return;
    }
    if (selected.length >= MAX_REFS) {
      showToast(`参考图最多选择 ${MAX_REFS} 张`);
      return;
    }
    setSelected([...selected, id]);
  };

  const ratioItem = RATIOS.find((item) => item.value === ratio) || RATIOS[0];
  const durationItem = DURATIONS.find((item) => item.value === duration) || DURATIONS[0];
  const marketItem = MARKETS.find((item) => item.value === market);

  if (stage === 'generating') {
    return (
      <div className="av-mask">
        <div className="av-dialog av-dialog--generating" role="dialog" aria-modal="true" aria-label={failed ? '视频生成失败' : '视频生成中'}>
          <div className="av-head">
            <h3 className="av-title">{failed ? '视频生成失败' : '视频生成中'}</h3>
            <button className="av-close" type="button" aria-label="关闭" onClick={onClose}>
              <IconClose />
            </button>
          </div>
          {failed ? (
            <div className="av-fail">
              <span className="av-fail__icon" aria-hidden="true">!</span>
              <p className="av-fail__title">生成未成功</p>
              <p className="av-progress__meta">
                {durationItem.label} · {ratioItem.label} · {selected.length} 张参考图
              </p>
              <p className="av-fail__hint">请稍后重试，或调整参考图和参数后再试</p>
            </div>
          ) : (
            <div className="av-progress">
              <span className="av-spinner" aria-hidden="true">
                {Array.from({ length: 12 }).map((_, index) => (
                  <span
                    key={index}
                    style={{ transform: `rotate(${index * 30}deg)`, animationDelay: `${index * 0.083}s` }}
                  />
                ))}
              </span>
              <p className="av-progress__title">视频正在生成</p>
              <p className="av-progress__meta">
                {durationItem.label} · {ratioItem.label} · {selected.length} 张参考图
              </p>
              <p className="av-progress__hint">关闭弹窗不会影响视频生成</p>
            </div>
          )}
          <div className="av-foot">
            <span className="av-foot__hint">{failed ? '可关闭弹窗后重试' : '可关闭弹窗继续编辑商品'}</span>
            <div className="av-foot__actions">
              {failed ? (
                <>
                  <button className="av-btn" type="button" onClick={onClose}>
                    关闭
                  </button>
                  <button className="av-btn" type="button" onClick={onCancel}>
                    取消生成
                  </button>
                  <button className="av-btn av-btn--primary" type="button" onClick={onRetry}>
                    重新生成
                  </button>
                </>
              ) : (
                <>
                  <button className="av-btn" type="button" onClick={onRequestStop}>
                    停止生成
                  </button>
                  <button className="av-btn av-btn--primary" type="button" onClick={onClose}>
                    关闭
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="av-mask" onClick={onClose}>
      <div
        className="av-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="AI生成视频"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="av-head">
          <h3 className="av-title">AI生成视频</h3>
          <button className="av-close" type="button" aria-label="关闭" onClick={onClose}>
            <IconClose />
          </button>
        </div>

        <div
          className="av-body"
          onClick={(event) => {
            if (!(event.target as HTMLElement).closest('.av-select-wrap')) setOpenSelect(null);
          }}
        >
          <section className="av-section" data-annotation-id="ai-video-refs">
            <div className="av-section__head">
              <span className="av-section__label">参考图</span>
              <span className="av-section__sub">按选择顺序参与生成，最多 {MAX_REFS} 张</span>
              <span className="av-section__count">
                已选 <b>{selected.length}</b>/{MAX_REFS}
              </span>
            </div>

            {GROUPS.map((group) => (
              <div className="av-group" key={group.key}>
                <div className="av-group__head">
                  <span className="av-group__name">{group.label}</span>
                  <span className="av-group__num">{group.items.length}</span>
                </div>
                <div className="av-thumbs">
                  {group.items.map((item) => {
                    const order = selected.indexOf(item.id);
                    const isOn = order >= 0;
                    const isOff = !isOn && selected.length >= MAX_REFS;
                    const cls = ['av-thumb'];
                    if (isOn) cls.push('av-thumb--on');
                    if (isOff) cls.push('av-thumb--off');
                    return (
                      <button
                        className={cls.join(' ')}
                        key={item.id}
                        type="button"
                        aria-pressed={isOn}
                        onClick={() => toggle(item.id)}
                      >
                        <img src={item.src} alt="" />
                        <span className="av-thumb__size">{item.size}</span>
                        <span className="av-thumb__mark">{isOn ? order + 1 : ''}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>

          <section className="av-section">
            <div className="av-section__head">
              <span className="av-section__label">视频模板</span>
            </div>
            <div className="av-opts">
              {TEMPLATES.map((item) => (
                <button
                  className={template === item.value ? 'av-opt av-opt--on' : 'av-opt'}
                  key={item.value}
                  type="button"
                  aria-pressed={template === item.value}
                  onClick={() => setTemplate(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </section>

          <section className="av-section" data-annotation-id="ai-video-options">
            <div className="av-section__head">
              <span className="av-section__label">视频时长</span>
            </div>
            <div className="av-opts">
              {DURATIONS.map((item) => (
                <button
                  className={duration === item.value ? 'av-opt av-opt--on' : 'av-opt'}
                  key={item.value}
                  type="button"
                  aria-pressed={duration === item.value}
                  onClick={() => setDuration(item.value)}
                >
                  {item.label}
                  <span className="av-q" data-tip="每生成一个视频消耗 xx 算力">
                    ?
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="av-section">
            <div className="av-section__head">
              <span className="av-section__label">视频比例</span>
            </div>
            <div className="av-opts">
              {RATIOS.map((item) => (
                <button
                  className={ratio === item.value ? 'av-opt av-opt--ratio av-opt--on' : 'av-opt av-opt--ratio'}
                  key={item.value}
                  type="button"
                  aria-pressed={ratio === item.value}
                  onClick={() => setRatio(item.value)}
                >
                  <span
                    className={item.auto ? 'av-ratio av-ratio--auto' : 'av-ratio'}
                    style={{ width: item.w, height: item.h }}
                  />
                  {item.label}
                </button>
              ))}
            </div>
          </section>

          <section className="av-section">
            <div className="av-fields">
              <div className="av-field">
                <span className="av-field__label">销售国家/地区</span>
                <div className="av-select-wrap">
                  <button
                    className={openSelect === 'market' ? 'av-select is-open' : 'av-select'}
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={openSelect === 'market'}
                    onClick={() => setOpenSelect(openSelect === 'market' ? null : 'market')}
                  >
                    {marketItem ? (
                      <span className="av-select__value">
                        <span className="av-flag">
                          <Flag code={marketItem.flag} />
                        </span>
                        <span className="av-select__text">{marketItem.label}</span>
                      </span>
                    ) : (
                      <span className="av-select__ph">请选择销售国家/地区</span>
                    )}
                    <span className="av-select__caret">
                      <IconCaret />
                    </span>
                  </button>
                  {openSelect === 'market' && (
                    <div className="av-select-menu" role="listbox">
                      {MARKETS.map((item) => (
                        <button
                          key={item.value}
                          className={market === item.value ? 'av-option is-on' : 'av-option'}
                          type="button"
                          role="option"
                          aria-selected={market === item.value}
                          onClick={() => {
                            setMarket(item.value);
                            setOpenSelect(null);
                          }}
                        >
                          <span className="av-flag">
                            <Flag code={item.flag} />
                          </span>
                          <span className="av-option__text">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="av-field">
                <span className="av-field__label">语言</span>
                <div className="av-select-wrap">
                  <button
                    className={openSelect === 'language' ? 'av-select is-open' : 'av-select'}
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={openSelect === 'language'}
                    onClick={() => setOpenSelect(openSelect === 'language' ? null : 'language')}
                  >
                    <span className={language ? 'av-select__value' : 'av-select__ph'}>
                      {language || '请选择语言'}
                    </span>
                    <span className="av-select__caret">
                      <IconCaret />
                    </span>
                  </button>
                  {openSelect === 'language' && (
                    <div className="av-select-menu" role="listbox">
                      {LANGUAGES.map((item) => (
                        <button
                          key={item}
                          className={language === item ? 'av-option is-on' : 'av-option'}
                          type="button"
                          role="option"
                          aria-selected={language === item}
                          onClick={() => {
                            setLanguage(item);
                            setOpenSelect(null);
                          }}
                        >
                          <span className="av-option__text">{item}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="av-foot">
          <span className="av-foot__hint">
            预计消耗 <b>xx</b> 算力
          </span>
          <div className="av-foot__actions">
            <button className="av-btn" type="button" onClick={onClose}>
              取消
            </button>
            <button
              className="av-btn av-btn--primary"
              type="button"
              disabled={selected.length === 0}
              onClick={() => {
                onGenerate({
                  refs: selected,
                  duration,
                  ratio,
                  ratioLabel: ratioItem.label,
                });
                setStage('generating');
              }}
            >
              生成视频
            </button>
          </div>
        </div>

        {toast && <div className="av-toast">{toast}</div>}
      </div>
    </div>
  );
}
