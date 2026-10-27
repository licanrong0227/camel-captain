/**
 * @name 图像工作台-水印
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  ChevronDown,
  Undo2,
  Redo2,
  Sparkles,
  Type,
  Layers,
  ImageIcon,
  Lock,
  Unlock,
  Copy,
  Trash2,
  ZoomIn,
  ZoomOut,
  MousePointer2,
} from 'lucide-react';
import { AnnotationViewer } from '@axhub/annotation';
import type { AnnotationSourceDocument } from '@axhub/annotation';
import annotationSourceDocument from './annotation-source.json';
import './style.css';

import wm1 from './assets/wm-1.jpg';
import wm2 from './assets/wm-2.jpg';
import wm3 from './assets/wm-3.jpg';
import wm4 from './assets/wm-4.jpg';
import wm5 from './assets/wm-5.jpg';
import thumb1 from './assets/thumb-1.jpg';
import thumb2 from './assets/thumb-2.jpg';
import thumb3 from './assets/thumb-3.jpg';
import thumb4 from './assets/thumb-4.jpg';
import thumb5 from './assets/thumb-5.jpg';
import thumb6 from './assets/thumb-6.jpg';
import filter1 from './assets/filter-1.png';
import filter2 from './assets/filter-2.png';
import filter3 from './assets/filter-3.png';
import filter4 from './assets/filter-4.png';
import filter5 from './assets/filter-5.png';
import filter6 from './assets/filter-6.png';
import filter7 from './assets/filter-7.png';
import filter8 from './assets/filter-8.png';

const WATERMARKS = [
  { name: 'abc', img: wm1, size: '800x800' },
  { name: '1', img: wm2, size: '600x600' },
  { name: '水印1', img: wm3, size: '800x800' },
  { name: '11111', img: wm4, size: '1000x1000' },
  { name: '撒大声地', img: wm5, size: '800x800' },
];

const THUMBS = [
  { img: thumb1, size: '800×800' },
  { img: thumb2, size: '800×800' },
  { img: thumb3, size: '1000×1000' },
  { img: thumb4, size: '800×800' },
  { img: thumb5, size: '1200×1200' },
  { img: thumb6, size: '800×800' },
];

const MENU_ITEMS = [
  { key: 'ai', label: 'AI编辑', Icon: Sparkles },
  { key: 'text', label: '文字', Icon: Type },
  { key: 'layer', label: '图层', Icon: Layers },
  { key: 'watermark', label: '水印', Icon: ImageIcon },
];

const FILTER_PRESETS = [
  { img: filter1, name: 'BlackWhite' },
  { img: filter2, name: 'Brownie' },
  { img: filter3, name: 'Vintage' },
  { img: filter4, name: 'Kodachrome' },
  { img: filter5, name: 'technicolor' },
  { img: filter6, name: 'Polaroid' },
  { img: filter7, name: 'Invert' },
  { img: filter8, name: 'Sepia' },
];

const SLIDER_ROWS = [
  { label: '旋转', percent: 0 },
  { label: '透明', percent: 100 },
];

const BLUR_ROWS = [
  { label: 'X轴', percent: 0 },
  { label: 'Y轴', percent: 0 },
];

const AddWatermarkModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [canvasW, setCanvasW] = useState('800');
  const [canvasH, setCanvasH] = useState('800');
  const ratioW = Number(canvasW) || 800;
  const ratioH = Number(canvasH) || 800;

  const canvasSectionRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = canvasSectionRef.current;
    if (!el) return;
    const compute = () => {
      const maxW = el.clientWidth;
      const maxH = Math.min(620, window.innerHeight - 360);
      const ar = ratioW / ratioH;
      let w = maxW;
      let h = w / ar;
      if (h > maxH) {
        h = maxH;
        w = h * ar;
      }
      setCanvasSize({ w: Math.round(w), h: Math.round(h) });
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, [ratioW, ratioH]);

  return (
  <div className="wm-modal-mask">
    <div className="wm-modal" data-annotation-id="add-watermark-modal">
      <div className="wm-modal-header">
        <div className="wm-modal-header-inner">添加水印</div>
        <button className="wm-modal-close" onClick={onClose} aria-label="Close">
          <X size={22} />
        </button>
      </div>
      <div className="wm-modal-body">
        <div className="wm-editor">
          <div className="wm-editor-section">
            <div className="wm-setting-row">
              <div className="wm-setting-item required">
                <label className="wm-label">水印名称</label>
                <div className="wm-input-wrap">
                  <input className="wm-input" type="text" placeholder="请输入水印名称" maxLength={50} />
                  <span className="wm-word-count">0/50</span>
                </div>
              </div>
              <div className="wm-setting-item required">
                <label className="wm-label">适用图片尺寸</label>
                <input
                  className="wm-size-input"
                  type="number"
                  min={1}
                  value={canvasW}
                  onChange={(e) => setCanvasW(e.target.value)}
                />
                <span className="wm-size-sep">×</span>
                <input
                  className="wm-size-input"
                  type="number"
                  min={1}
                  value={canvasH}
                  onChange={(e) => setCanvasH(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="wm-editor-main">
            <div className="wm-toolbar">
              <button className="ivu-btn ivu-btn-primary" type="button">添加文字</button>
              <button className="ivu-btn ivu-btn-primary" type="button">添加图片</button>
              <div className="wm-toolbar-note">
                <p>上传的图片建议均是PNG格式的图片</p>
              </div>
            </div>
            <div className="wm-canvas-section" ref={canvasSectionRef}>
              <div
                className="wm-canvas"
                data-annotation-id="wm-canvas"
                style={{ width: canvasSize.w, height: canvasSize.h }}
              />
            </div>
            <div className="wm-properties-panel">
              <div className="wm-no-selection">请选择一个对象进行编辑</div>
            </div>
          </div>
        </div>
      </div>
      <div className="wm-modal-footer">
        <button className="ivu-btn ivu-btn-text" type="button" onClick={onClose}>取消</button>
        <button className="ivu-btn ivu-btn-default" type="button">预览</button>
        <button className="ivu-btn ivu-btn-primary" type="button" onClick={onClose}>确认</button>
      </div>
    </div>
  </div>
  );
};

const SliderRow: React.FC<{ label: string; percent: number; unit?: string }> = ({ label, percent }) => (
  <div className="rp-slider-row">
    <span className="rp-slider-label">{label}</span>
    <div className="ivu-slider">
      <div className="ivu-slider-wrap">
        <div className="ivu-slider-bar" style={{ width: `${percent}%` }} />
        <div className="ivu-slider-button-wrap" style={{ left: `${percent}%` }}>
          <div className="ivu-slider-button" />
        </div>
      </div>
    </div>
  </div>
);

const SectionTitle: React.FC<{ text: string }> = ({ text }) => (
  <div className="ivu-divider">
    <span className="ivu-divider-inner-text">
      <h4>{text}</h4>
    </span>
  </div>
);

const ImageWorkbench: React.FC = () => {
  const [addWatermarkVisible, setAddWatermarkVisible] = useState(false);

  return (
    <div className="iw-page">
      <div className="iw-mask" />
      <div className="iw-dialog" data-annotation-id="workbench-dialog" role="dialog" aria-modal="true" aria-label="图像工作台">
        <div className="iw-dialog-header">
          <button className="iw-dialog-close" aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="iw-editor">
          {/* 顶部工具栏 */}
          <div className="iw-header">
            <div className="iw-header-left">
              <div className="iw-logo">图像工作台</div>
              <span className="iw-v-divider" />
              <a className="iw-menu-link">文件 <ChevronDown size={12} /></a>
              <span className="iw-v-divider" />
              <a className="iw-menu-link">插入 <ChevronDown size={12} /></a>
              <span className="iw-v-divider" />
              <span className="iw-switch iw-switch-checked iw-switch-small" title="网格" />
              <span className="iw-v-divider" />
              <button className="iw-icon-btn" disabled>
                <Undo2 size={20} />
              </button>
              <button className="iw-icon-btn" disabled>
                <Redo2 size={20} />
              </button>
            </div>
            <div className="iw-header-right">
              <button className="ivu-btn ivu-btn-text" type="button">预览</button>
              <button className="ivu-btn ivu-btn-text" type="button">水印</button>
              <button className="ivu-btn ivu-btn-primary" type="button" style={{ marginLeft: 10 }}>
                下载 <ChevronDown size={12} />
              </button>
              <button className="ivu-btn ivu-btn-primary" type="button" style={{ marginLeft: 10 }}>保存</button>
              <button className="ivu-btn ivu-btn-text" type="button" style={{ marginLeft: 10 }}>
                中文 <ChevronDown size={12} />
              </button>
            </div>
          </div>

          {/* 主体区域 */}
          <div className="iw-content">
            {/* 左侧图标菜单 */}
            <div className="iw-left-menu">
              {MENU_ITEMS.map(({ key, label, Icon }) => (
                <div key={key} className={`iw-menu-item${key === 'watermark' ? ' active' : ''}`}>
                  <Icon size={24} strokeWidth={1.6} />
                  <div className="iw-menu-label">{label}</div>
                </div>
              ))}
            </div>

            {/* 水印管理面板 */}
            <div className="iw-watermark-panel">
              <div className="iw-wm-header">
                <h3>水印管理</h3>
                <button
                  className="ivu-btn ivu-btn-primary"
                  type="button"
                  data-annotation-id="add-watermark-btn"
                  onClick={() => setAddWatermarkVisible(true)}
                >
                  添加水印
                </button>
              </div>
              <div className="iw-wm-list">
                {WATERMARKS.map((wm, idx) => (
                  <div className="iw-wm-item" key={`${wm.name}-${idx}`}>
                    <div className="iw-wm-preview">
                      <img src={wm.img} alt="水印预览" />
                    </div>
                    <div className="iw-wm-info">
                      <div className="iw-wm-name">{wm.name}</div>
                      <div className="iw-wm-size" data-annotation-id={idx === 0 ? 'wm-size-display' : undefined}>{wm.size}</div>
                      <div className="iw-wm-actions">
                        <button className="ivu-btn ivu-btn-text ivu-btn-small" type="button">修改</button>
                        <button className="ivu-btn ivu-btn-text ivu-btn-small" type="button">添加</button>
                        <button className="ivu-btn ivu-btn-text ivu-btn-small" type="button">删除</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 右侧属性面板 */}
            <div className="iw-props-bar">
              <SectionTitle text="快捷操作" />
              <div className="rp-icon-row">
                <button className="rp-icon-btn"><Unlock size={16} /></button>
                <button className="rp-icon-btn"><Copy size={16} /></button>
                <button className="rp-icon-btn"><Layers size={16} /></button>
                <button className="rp-icon-btn"><Trash2 size={16} /></button>
              </div>
              <SectionTitle text="居中" />
              <div className="rp-icon-row">
                <button className="rp-icon-btn"><MousePointer2 size={16} /></button>
                <button className="rp-icon-btn">＋</button>
                <button className="rp-icon-btn">－</button>
              </div>
              <div className="rp-long-btn-row">
                <button className="ivu-btn ivu-btn-text rp-long-btn" type="button">替换图片</button>
                <button className="ivu-btn ivu-btn-text rp-long-btn" type="button">裁剪图片</button>
              </div>
              <SectionTitle text="图片滤镜" />
              <div className="rp-filter-row">
                <button className="ivu-btn ivu-btn-default ivu-btn-small" type="button">简单滤镜</button>
                <button className="ivu-btn ivu-btn-default ivu-btn-small" type="button">复杂滤镜</button>
              </div>
              <div className="rp-filter-grid">
                {FILTER_PRESETS.map((f) => (
                  <img className="rp-filter-thumb" src={f.img} alt={f.name} key={f.name} />
                ))}
              </div>
              <SectionTitle text="图像描边" />
              <div className="rp-inline-row">
                <span className="rp-inline-label">启用图像描边</span>
                <span className="iw-switch" />
                <button className="ivu-btn ivu-btn-default ivu-btn-small" type="button" style={{ marginLeft: 'auto' }}>关闭</button>
              </div>
              <SectionTitle text="位置信息" />
              <div className="rp-num-row">
                <span className="rp-num-label">X轴</span>
                <input className="ivu-input rp-num-input" defaultValue="0" />
                <span className="rp-num-label">Y轴</span>
                <input className="ivu-input rp-num-input" defaultValue="0" />
              </div>
              {SLIDER_ROWS.map((s) => (
                <SliderRow key={s.label} label={s.label} percent={s.percent} />
              ))}
              <div className="rp-color-row">
                <span className="rp-slider-label">阴影</span>
                <span className="rp-color-box" />
              </div>
              <div className="rp-inline-row">
                <span className="rp-slider-label">颜色</span>
                <span className="rp-color-box" />
              </div>
              <div className="rp-inline-row">
                <span className="rp-slider-label">模糊</span>
              </div>
              {BLUR_ROWS.map((s) => (
                <SliderRow key={`b-${s.label}`} label={s.label} percent={s.percent} />
              ))}
              <SectionTitle text="边框" />
              <div className="rp-inline-row">
                <span className="rp-slider-label">颜色</span>
                <span className="rp-color-box" />
              </div>
              <div className="rp-inline-row">
                <span className="rp-slider-label">width</span>
                <input className="ivu-input rp-num-input" defaultValue="1" />
              </div>
              <div className="rp-inline-row">
                <span className="rp-slider-label">边框</span>
                <div className="rp-select">Stroke <ChevronDown size={12} /></div>
              </div>
              <SectionTitle text="数据" />
              <div className="rp-inline-row">
                <span className="rp-slider-label">标识</span>
                <input className="ivu-input rp-num-input" defaultValue="bf974a2e" />
              </div>
              <div className="rp-inline-row">
                <div className="rp-select">请选择 <ChevronDown size={12} /></div>
              </div>
              <div className="rp-inline-row">
                <input className="ivu-input" placeholder="请输入" />
              </div>
              <button className="ivu-btn ivu-btn-default ivu-btn-small" type="button">获取元素数据</button>
            </div>

            {/* 中间画布 */}
            <div className="iw-workspace">
              <div className="iw-canvas">
                <img className="iw-canvas-img" src={thumb1} alt="设计画布" />
                <div className="iw-selection">
                  <span className="iw-handle h-tl" /><span className="iw-handle h-t" /><span className="iw-handle h-tr" />
                  <span className="iw-handle h-r" /><span className="iw-handle h-br" /><span className="iw-handle h-b" />
                  <span className="iw-handle h-bl" /><span className="iw-handle h-l" />
                </div>
              </div>
              <div className="iw-zoom-group">
                <button type="button"><ZoomIn size={14} /></button>
                <button type="button"><ZoomOut size={14} /></button>
              </div>
            </div>

            {/* 图片列表 */}
            <div className="iw-thumbs">
              <div className="iw-thumbs-header">
                <span className="iw-thumbs-title">图片列表</span>
                <span className="iw-thumbs-count">1 / 6</span>
              </div>
              <div className="iw-thumbs-list">
                {THUMBS.map((t, i) => (
                  <div
                    className={`iw-thumb${i === 0 ? ' active' : ''}`}
                    key={t.img}
                    data-annotation-id={i === 0 ? 'thumb-size-badge' : undefined}
                  >
                    <img src={t.img} alt="" loading="eager" />
                    <span className="iw-thumb-size">{t.size}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {addWatermarkVisible && <AddWatermarkModal onClose={() => setAddWatermarkVisible(false)} />}
        </div>
      </div>
      <AnnotationViewer
        source={annotationSourceDocument as unknown as AnnotationSourceDocument}
        options={{
          currentPageId: 'image-workbench-watermark',
          toolbarEdge: 'right',
          showToolbar: true,
          showThemeToggle: true,
          showColorFilter: true,
          emptyWhenNoData: true,
        }}
      />
    </div>
  );
};

export default ImageWorkbench;
