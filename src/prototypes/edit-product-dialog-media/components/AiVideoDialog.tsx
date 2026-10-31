/**
 * AI 生成视频弹窗：选择参考图（主图 / 站外推广图 / SKU 图 / 详情图，最多 9 张），
 * 选择时长与画面比例后提交生成。
 */

import React from 'react';
import '../ai-video.css';

import main1 from '../assets/main-1.png';
import main2 from '../assets/main-2.png';
import main3 from '../assets/main-3.png';
import main4 from '../assets/main-4.png';
import main5 from '../assets/main-5.png';
import promo1 from '../assets/promo-1.png';
import sku1 from '../assets/sku-1.jpg';
import sku2 from '../assets/sku-2.jpg';
import detail1 from '../assets/detail-1.jpg';
import detail2 from '../assets/detail-2.jpg';
import detail3 from '../assets/detail-3.jpg';

const MAX_REFS = 9;

const GROUPS = [
  {
    key: 'main',
    label: '主图',
    items: [
      { id: 'main-1', src: main1, size: '1200*1600' },
      { id: 'main-2', src: main2, size: '1200*1600' },
      { id: 'main-3', src: main3, size: '1200*1600' },
      { id: 'main-4', src: main4, size: '600*800' },
      { id: 'main-5', src: main5, size: '600*800' },
    ],
  },
  {
    key: 'promo',
    label: '站外推广图',
    items: [{ id: 'promo-1', src: promo1, size: '1200*750' }],
  },
  {
    key: 'sku',
    label: 'SKU 图',
    items: [
      { id: 'sku-1', src: sku1, size: '1200*1600' },
      { id: 'sku-2', src: sku2, size: '1200*1600' },
    ],
  },
  {
    key: 'detail',
    label: '详情图',
    items: [
      { id: 'detail-1', src: detail1, size: '600*800' },
      { id: 'detail-2', src: detail2, size: '600*800' },
      { id: 'detail-3', src: detail3, size: '1200*1600' },
    ],
  },
];

const DURATIONS = [
  { value: '5', label: '5 秒', cost: 10 },
  { value: '10', label: '10 秒', cost: 20 },
  { value: '15', label: '15 秒', cost: 30 },
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
};

function IconClose() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export default function AiVideoDialog({ open, onClose, onGenerate, onRequestStop }: Props) {
  const [selected, setSelected] = React.useState<string[]>([]);
  const [duration, setDuration] = React.useState('5');
  const [ratio, setRatio] = React.useState('auto');
  const [toast, setToast] = React.useState('');
  const [stage, setStage] = React.useState<'form' | 'generating'>('form');
  const timerRef = React.useRef<number | undefined>(undefined);

  React.useEffect(() => {
    if (!open) return;
    setSelected([]);
    setDuration('5');
    setRatio('auto');
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

  if (stage === 'generating') {
    return (
      <div className="av-mask">
        <div className="av-dialog av-dialog--generating" role="dialog" aria-modal="true" aria-label="视频生成中">
          <div className="av-head">
            <h3 className="av-title">视频生成中</h3>
            <button className="av-close" type="button" aria-label="关闭" onClick={onClose}>
              <IconClose />
            </button>
          </div>
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
          <div className="av-foot">
            <span className="av-foot__hint">可关闭弹窗继续编辑商品</span>
            <div className="av-foot__actions">
              <button className="av-btn" type="button" onClick={onRequestStop}>
                停止生成
              </button>
              <button className="av-btn av-btn--primary" type="button" onClick={onClose}>
                关闭
              </button>
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

        <div className="av-body">
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

          <section className="av-section" data-annotation-id="ai-video-options">
            <div className="av-section__head">
              <span className="av-section__label">视频时长</span>
              <span className="av-section__sub">时长越长，消耗算力越多</span>
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
                  <span className="av-q" data-tip={`每生成一个视频消耗 ${item.cost} 算力`}>
                    ?
                  </span>
                </button>
              ))}
            </div>
            <div className="av-note">
              <span className="av-note__icon">!</span>
              <span>生成过程中可随时停止，但已消耗的算力不返还</span>
            </div>
          </section>

          <section className="av-section">
            <div className="av-section__head">
              <span className="av-section__label">视频比例</span>
              <span className="av-section__sub">自适应时按参考图的比例生成</span>
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
        </div>

        <div className="av-foot">
          <span className="av-foot__hint">
            预计消耗 <b>{(DURATIONS.find((item) => item.value === duration) || DURATIONS[0]).cost}</b> 算力
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
