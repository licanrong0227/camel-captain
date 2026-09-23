/**
 * @name 批量美图
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { X, Check, Upload, ChevronDown, Edit2, Trash2, Info } from 'lucide-react';
import { AnnotationViewer } from '@axhub/annotation';
import type { AnnotationSourceDocument } from '@axhub/annotation';
import annotationSourceDocument from './annotation-source.json';
import './style.css';

// ============ 类型定义 ============

type TabItem = {
  id: string;
  label: string;
};

type ImageItem = {
  id: string;
  src: string;
  title: string;
  size: string;
  bgColor: string;
};

type WatermarkType = 'text' | 'image';
type WatermarkPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'tile';
type WatermarkAngle = 'horizontal' | 'left' | 'right';

type WatermarkConfig = {
  type: WatermarkType;
  text: string;
  fontSize: number;
  opacity: number;
  imageFile: File | null;
  imagePreview: string;
  imageSize: number;
  position: WatermarkPosition;
  angle: WatermarkAngle;
};

type SavedTemplate = {
  id: string;
  name: string;
  type: '公共' | '专属';
  watermarkType: 'text' | 'image';
};

// ============ 数据 ============

const TABS: TabItem[] = [
  { id: 'white-bg', label: '转白底' },
  { id: 'translate', label: '翻译' },
  { id: 'add-watermark', label: '加水印' },
  { id: 'watermark', label: '去水印' },
  { id: 'crop', label: '裁剪缩放' },
];

const IMAGES: ImageItem[] = [
  { id: 'img-1', src: '', title: '图1', size: '800*800', bgColor: '#f5ebe0' },
  { id: 'img-2', src: '', title: '图2', size: '800*800', bgColor: '#d8e2dc' },
  { id: 'img-3', src: '', title: '图3', size: '800*800', bgColor: '#e8e8e4' },
  { id: 'img-4', src: '', title: '图4', size: '800*800', bgColor: '#f0dde2' },
  { id: 'img-5', src: '', title: '图5', size: '800*800', bgColor: '#e2e0d8' },
  { id: 'img-6', src: '', title: '图6', size: '800*800', bgColor: '#d8e2e8' },
];

const MOCK_TEMPLATES: SavedTemplate[] = [
  { id: 'tpl-1', name: '店铺LOGO水印', type: '公共', watermarkType: 'image' },
  { id: 'tpl-2', name: '防盗用水印', type: '专属', watermarkType: 'text' },
  { id: 'tpl-3', name: '品牌文字水印', type: '公共', watermarkType: 'text' },
  { id: 'tpl-4', name: '品牌Logo水印', type: '公共', watermarkType: 'image' },
];

const DEFAULT_WATERMARK_CONFIG: WatermarkConfig = {
  type: 'text',
  text: '',
  fontSize: 24,
  opacity: 80,
  imageFile: null,
  imagePreview: '',
  imageSize: 100,
  position: 'bottom-right',
  angle: 'horizontal',
};

// ============ 子组件 ============

/** 选项卡栏 */
type TabBarProps = {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
};

const TabBar: React.FC<TabBarProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="batch-image-tabs" data-annotation-id="tabs">
      {tabs.map((tab, index) => {
        const isActive = activeTab === tab.id;
        const isClickable = tab.id === 'add-watermark';
        const isFirst = index === 0;
        const isLast = index === tabs.length - 1;
        return (
          <button
            key={tab.id}
            className={`batch-image-tab ${isActive ? 'batch-image-tab--active' : ''} ${!isClickable ? 'batch-image-tab--disabled' : ''} ${isFirst ? 'batch-image-tab--first' : ''} ${isLast ? 'batch-image-tab--last' : ''}`}
            onClick={isClickable ? () => onTabChange(tab.id) : undefined}
            disabled={!isClickable}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

/** 选择控制区 */
type SelectionControlProps = {
  isAllSelected: boolean;
  selectedCount: number;
  totalCount: number;
  onToggleAll: () => void;
};

const SelectionControl: React.FC<SelectionControlProps> = ({
  isAllSelected,
  selectedCount,
  totalCount,
  onToggleAll,
}) => {
  return (
    <div className="batch-image-selection" data-annotation-id="selection-control">
      <label className="batch-image-checkbox-label" onClick={onToggleAll}>
        <span className={`batch-image-checkbox ${isAllSelected ? 'batch-image-checkbox--checked' : ''}`}>
          {isAllSelected && <Check size={12} strokeWidth={3} />}
        </span>
        <span className="batch-image-checkbox-text">全选</span>
      </label>
      <span className="batch-image-selection-count">
        已选 {selectedCount}/{totalCount}
      </span>
    </div>
  );
};

/** 单张图片卡片 */
type ImageCardProps = {
  image: ImageItem;
  isSelected: boolean;
  onSelect: (imageId: string) => void;
};

const ImageCard: React.FC<ImageCardProps> = ({ image, isSelected, onSelect }) => {
  return (
    <div
      className={`batch-image-card ${isSelected ? 'batch-image-card--selected' : ''}`}
      onClick={() => onSelect(image.id)}
    >
      <div className="batch-image-card-preview" style={{ backgroundColor: image.bgColor }}>
        <div className={`batch-image-card-check ${isSelected ? 'batch-image-card-check--visible' : ''}`}>
          <Check size={14} strokeWidth={3} />
        </div>
        <div className="batch-image-card-size">{image.size}</div>
      </div>
      <div className="batch-image-card-title">{image.title}</div>
    </div>
  );
};

/** 图片网格 */
type ImageGridProps = {
  images: ImageItem[];
  selectedImages: string[];
  onImageSelect: (imageId: string) => void;
};

const ImageGrid: React.FC<ImageGridProps> = ({ images, selectedImages, onImageSelect }) => {
  return (
    <div className="batch-image-grid" data-annotation-id="image-grid">
      {images.map((image) => (
        <ImageCard
          key={image.id}
          image={image}
          isSelected={selectedImages.includes(image.id)}
          onSelect={onImageSelect}
        />
      ))}
    </div>
  );
};

// ============ 水印面板组件 ============

type WatermarkPanelProps = {
  config: WatermarkConfig;
  onConfigChange: (config: Partial<WatermarkConfig>) => void;
  templates: SavedTemplate[];
  selectedTemplateId: string;
  onSelectTemplate: (id: string) => void;
  onSaveTemplate: () => void;
  onManageTemplate: () => void;
};

const WatermarkPanel: React.FC<WatermarkPanelProps> = ({
  config,
  onConfigChange,
  templates,
  selectedTemplateId,
  onSelectTemplate,
  onSaveTemplate,
  onManageTemplate,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const preview = URL.createObjectURL(file);
        onConfigChange({ imageFile: file, imagePreview: preview });
      }
    },
    [onConfigChange]
  );

  const handleDropdownSelect = useCallback(
    (id: string) => {
      onSelectTemplate(id);
      setDropdownOpen(false);
    },
    [onSelectTemplate]
  );

  return (
    <div className="wm-panel" data-annotation-id="watermark-panel">
      {/* 模板选择行 */}
      <div className="wm-panel-row wm-panel-row--template">
        <span className="wm-panel-row-label">水印模板</span>
        <div className="wm-dropdown-wrapper" data-annotation-id="template-dropdown">
          <button
            className="wm-dropdown-trigger"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <span className="wm-dropdown-text">
              {selectedTemplate ? selectedTemplate.name : '选择水印模板'}
            </span>
            <ChevronDown size={14} className={`wm-dropdown-icon ${dropdownOpen ? 'wm-dropdown-icon--open' : ''}`} />
          </button>
          {dropdownOpen && (
            <div className="wm-dropdown-menu">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  className={`wm-dropdown-item ${selectedTemplateId === tpl.id ? 'wm-dropdown-item--active' : ''}`}
                  onClick={() => handleDropdownSelect(tpl.id)}
                >
                  {tpl.name}
                </div>
              ))}
            </div>
          )}
        </div>
        <button className="wm-link-btn" onClick={onSaveTemplate} data-annotation-id="create-template-btn">
          创建模板
        </button>
        <button className="wm-link-btn" onClick={onManageTemplate} data-annotation-id="manage-template-btn">
          管理模板
        </button>
      </div>

      {/* 水印类型 */}
      <div className="wm-panel-row" data-annotation-id="watermark-type">
        <span className="wm-panel-row-label">水印类型</span>
        <div className="wm-radio-group">
          <label className="wm-radio-label">
            <input
              type="radio"
              name="wm-type"
              checked={config.type === 'text'}
              onChange={() => onConfigChange({ type: 'text' })}
            />
            <span className="wm-radio-dot" />
            <span>文字水印</span>
          </label>
          <label className="wm-radio-label">
            <input
              type="radio"
              name="wm-type"
              checked={config.type === 'image'}
              onChange={() => onConfigChange({ type: 'image' })}
            />
            <span className="wm-radio-dot" />
            <span>图片水印</span>
          </label>
        </div>
      </div>

      {/* 文字水印配置 */}
      {config.type === 'text' && (
        <div className="wm-config-section" data-annotation-id="text-watermark-config">
          <div className="wm-panel-row">
            <label className="wm-field-label">水印文字</label>
            <input
              className="wm-input"
              type="text"
              placeholder="请输入水印文字"
              value={config.text}
              onChange={(e) => onConfigChange({ text: e.target.value })}
            />
          </div>
          <div className="wm-panel-row">
            <label className="wm-field-label">字号</label>
            <div className="wm-slider-row">
              <input
                className="wm-slider"
                type="range"
                min={18}
                max={48}
                value={config.fontSize}
                onChange={(e) => onConfigChange({ fontSize: Number(e.target.value) })}
              />
              <span className="wm-slider-value">{config.fontSize}</span>
            </div>
          </div>
          <div className="wm-panel-row">
            <label className="wm-field-label">透明度</label>
            <div className="wm-slider-row">
              <input
                className="wm-slider"
                type="range"
                min={20}
                max={100}
                value={config.opacity}
                onChange={(e) => onConfigChange({ opacity: Number(e.target.value) })}
              />
              <span className="wm-slider-value">{config.opacity}%</span>
            </div>
          </div>
          <div className="wm-panel-row">
            <label className="wm-field-label">预览</label>
            <div className="wm-preview-box">
              <span
                style={{
                  fontSize: `${config.fontSize}px`,
                  opacity: config.opacity / 100,
                  whiteSpace: 'nowrap',
                  textAlign: 'left',
                }}
              >
                {config.text || '未填写水印文字'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 图片水印配置 */}
      {config.type === 'image' && (
        <div className="wm-config-section" data-annotation-id="image-watermark-config">
          <div className="wm-panel-row">
            <label className="wm-field-label">图片上传</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageUpload}
            />
            <button className="wm-upload-btn" onClick={() => fileInputRef.current?.click()}>
              <Upload size={14} />
              <span>{config.imageFile ? config.imageFile.name : '点击上传图片'}</span>
            </button>
          </div>
          <div className="wm-panel-row">
            <label className="wm-field-label">大小</label>
            <div className="wm-slider-row">
              <input
                className="wm-slider"
                type="range"
                min={50}
                max={200}
                value={config.imageSize}
                onChange={(e) => onConfigChange({ imageSize: Number(e.target.value) })}
              />
              <span className="wm-slider-value">{config.imageSize}%</span>
            </div>
          </div>
          <div className="wm-panel-row">
            <label className="wm-field-label">透明度</label>
            <div className="wm-slider-row">
              <input
                className="wm-slider"
                type="range"
                min={20}
                max={100}
                value={config.opacity}
                onChange={(e) => onConfigChange({ opacity: Number(e.target.value) })}
              />
              <span className="wm-slider-value">{config.opacity}%</span>
            </div>
          </div>
          <div className="wm-panel-row">
            <label className="wm-field-label">预览</label>
            <div className="wm-preview-box">
              {config.imagePreview ? (
                <img
                  src={config.imagePreview}
                  alt="水印预览"
                  style={{
                    width: `${Math.max(config.imageSize * 0.6, 20)}px`,
                    opacity: config.opacity / 100,
                    objectPosition: 'left center',
                  }}
                />
              ) : (
                <span className="wm-preview-placeholder">未上传图片</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 水印位置 */}
      <div className="wm-panel-row" data-annotation-id="watermark-position">
        <label className="wm-field-label">水印位置</label>
        <div className="wm-radio-group">
          {(
            [
              ['top-left', '左上角'],
              ['top-right', '右上角'],
              ['bottom-left', '左下角'],
              ['bottom-right', '右下角'],
              ['tile', '平铺'],
            ] as const
          ).map(([pos, label]) => (
            <label key={pos} className="wm-radio-label">
              <input
                type="radio"
                name="wm-position"
                checked={config.position === pos}
                onChange={() => onConfigChange({ position: pos })}
              />
              <span className="wm-radio-dot" />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 水印角度（仅平铺时显示） */}
      {config.position === 'tile' && (
        <div className="wm-panel-row" data-annotation-id="watermark-angle">
          <label className="wm-field-label">水印角度</label>
          <div className="wm-radio-group">
            <label className="wm-radio-label">
              <input
                type="radio"
                name="wm-angle"
                checked={config.angle === 'horizontal'}
                onChange={() => onConfigChange({ angle: 'horizontal' })}
              />
              <span className="wm-radio-dot" />
              <span>横向</span>
            </label>
            <label className="wm-radio-label">
              <input
                type="radio"
                name="wm-angle"
                checked={config.angle === 'left'}
                onChange={() => onConfigChange({ angle: 'left' })}
              />
              <span className="wm-radio-dot" />
              <span>向左倾斜</span>
            </label>
            <label className="wm-radio-label">
              <input
                type="radio"
                name="wm-angle"
                checked={config.angle === 'right'}
                onChange={() => onConfigChange({ angle: 'right' })}
              />
              <span className="wm-radio-dot" />
              <span>向右倾斜</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

// ============ 模板弹窗组件 ============

type SaveTemplateModalProps = {
  visible: boolean;
  title: string;
  initialName?: string;
  initialType?: '公共' | '专属';
  onConfirm: (name: string, type: '公共' | '专属') => void;
  onCancel: () => void;
};

const SaveTemplateModal: React.FC<SaveTemplateModalProps> = ({
  visible,
  title,
  initialName = '',
  initialType = '公共',
  onConfirm,
  onCancel,
}) => {
  const [name, setName] = useState(initialName);
  const [type, setType] = useState<'公共' | '专属'>(initialType);
  const [nameError, setNameError] = useState(false);

  React.useEffect(() => {
    if (visible) {
      setName(initialName);
      setType(initialType);
      setNameError(false);
    }
  }, [visible, initialName, initialType]);

  if (!visible) return null;

  return (
    <div className="wm-modal-overlay">
      <div className="wm-modal" data-annotation-id="save-modal">
        <div className="wm-modal-header">
          <h3 className="wm-modal-title">{title}</h3>
          <button className="wm-modal-close" onClick={onCancel}>
            <X size={16} />
          </button>
        </div>
        <div className="wm-modal-body">
          <div className="wm-modal-field">
            <label className="wm-modal-label">
              <span className="wm-required">*</span>模板名称
            </label>
            <input
              className={`wm-modal-input ${nameError ? 'wm-modal-input--error' : ''}`}
              type="text"
              placeholder="请输入模板名称"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (e.target.value.trim()) setNameError(false);
              }}
            />
            {nameError && <span className="wm-modal-error">请输入模板名称</span>}
          </div>
          <div className="wm-modal-field">
            <label className="wm-modal-label">模板类型</label>
            <div className="wm-modal-radio-group">
              <label className="wm-radio-label">
                <input
                  type="radio"
                  name="tpl-type"
                  checked={type === '公共'}
                  onChange={() => setType('公共')}
                />
                <span className="wm-radio-dot" />
                <span>公共</span>
              </label>
              <label className="wm-radio-label">
                <input
                  type="radio"
                  name="tpl-type"
                  checked={type === '专属'}
                  onChange={() => setType('专属')}
                />
                <span className="wm-radio-dot" />
                <span>专属</span>
              </label>
            </div>
            <div className="wm-modal-hint">
              <span className="wm-hint-line">
                <Info size={12} /> 公共：所有子账号均可使用此模板
              </span>
              <span className="wm-hint-line">
                <Info size={12} /> 专属：仅当前子账号可见此模板
              </span>
            </div>
          </div>
        </div>
        <div className="wm-modal-footer">
          <button className="wm-btn wm-btn--cancel" onClick={onCancel}>取消</button>
          <button
            className="wm-btn wm-btn--confirm"
            onClick={() => {
              if (!name.trim()) {
                setNameError(true);
                return;
              }
              onConfirm(name, type);
            }}
          >确定</button>
        </div>
      </div>
    </div>
  );
};

type ManageTemplateModalProps = {
  visible: boolean;
  templates: SavedTemplate[];
  onEdit: (tpl: SavedTemplate) => void;
  onDelete: (tpl: SavedTemplate) => void;
  onClose: () => void;
};

const ManageTemplateModal: React.FC<ManageTemplateModalProps> = ({
  visible,
  templates,
  onEdit,
  onDelete,
  onClose,
}) => {
  if (!visible) return null;

  return (
    <div className="wm-modal-overlay">
      <div className="wm-modal wm-modal--wide" data-annotation-id="manage-modal">
        <div className="wm-modal-header">
          <h3 className="wm-modal-title">管理模板</h3>
          <button className="wm-modal-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <div className="wm-modal-body">
          <table className="wm-table">
            <thead>
              <tr>
                <th>模板名称</th>
                <th>模板类型</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((tpl) => (
                <tr key={tpl.id}>
                  <td>{tpl.name}</td>
                  <td>{tpl.type}</td>
                  <td>
                    <div className="wm-table-actions">
                      <button className="wm-action-btn" onClick={() => onEdit(tpl)}>
                        <Edit2 size={14} />
                        <span>编辑</span>
                      </button>
                      <button className="wm-action-btn wm-action-btn--danger" onClick={() => onDelete(tpl)}>
                        <Trash2 size={14} />
                        <span>删除</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="wm-modal-footer">
          <button className="wm-btn wm-btn--confirm" onClick={onClose}>确定</button>
        </div>
      </div>
    </div>
  );
};

type ConfirmModalProps = {
  visible: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({ visible, message, onConfirm, onCancel }) => {
  if (!visible) return null;

  return (
    <div className="wm-modal-overlay">
      <div className="wm-modal wm-modal--small" data-annotation-id="confirm-modal">
        <div className="wm-modal-header">
          <h3 className="wm-modal-title">提示</h3>
          <button className="wm-modal-close" onClick={onCancel}>
            <X size={16} />
          </button>
        </div>
        <div className="wm-modal-body">
          <p className="wm-confirm-text">{message}</p>
        </div>
        <div className="wm-modal-footer">
          <button className="wm-btn wm-btn--cancel" onClick={onCancel}>取消</button>
          <button className="wm-btn wm-btn--confirm" onClick={onConfirm}>确认</button>
        </div>
      </div>
    </div>
  );
};

// ============ 主组件 ============

type BatchImageModalProps = {
  visible?: boolean;
  onClose?: () => void;
  onConfirm?: (selectedImages: string[]) => void;
};

const BatchImageModal: React.FC<BatchImageModalProps> = ({
  visible = true,
  onClose,
  onConfirm,
}) => {
  const [activeTab, setActiveTab] = useState<string>('add-watermark');
  const [selectedImages, setSelectedImages] = useState<string[]>(
    IMAGES.map((img) => img.id)
  );

  // 水印状态
  const [watermarkConfig, setWatermarkConfig] = useState<WatermarkConfig>({ ...DEFAULT_WATERMARK_CONFIG });
  const [templates, setTemplates] = useState<SavedTemplate[]>(MOCK_TEMPLATES);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  // 弹窗状态
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [saveModalTitle, setSaveModalTitle] = useState('创建模板');
  const [editingTemplate, setEditingTemplate] = useState<SavedTemplate | null>(null);
  const [manageModalVisible, setManageModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<SavedTemplate | null>(null);
  const [watermarkErrorVisible, setWatermarkErrorVisible] = useState(false);
  const [watermarkErrorMessage, setWatermarkErrorMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const isAllSelected = useMemo(
    () => selectedImages.length === IMAGES.length,
    [selectedImages]
  );

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
  }, []);

  const handleToggleAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedImages([]);
    } else {
      setSelectedImages(IMAGES.map((img) => img.id));
    }
  }, [isAllSelected]);

  const handleImageSelect = useCallback((imageId: string) => {
    setSelectedImages((prev) => {
      const newSelected = prev.includes(imageId)
        ? prev.filter((id) => id !== imageId)
        : [...prev, imageId];
      return newSelected;
    });
  }, []);

  const handleWatermarkConfigChange = useCallback((partial: Partial<WatermarkConfig>) => {
    setWatermarkConfig((prev) => ({ ...prev, ...partial }));
  }, []);

  const handleSelectTemplate = useCallback(
    (id: string) => {
      setSelectedTemplateId(id);
      // 模拟加载模板数据
      if (id) {
        const tpl = templates.find((t) => t.id === id);
        if (tpl) {
          if (tpl.watermarkType === 'image') {
            // 图片水印模板：模拟已上传图片状态
            setWatermarkConfig((prev) => ({
              ...prev,
              type: 'image',
              imageFile: { name: `${tpl.name}.png` } as File,
              imagePreview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2U4ZThlOCIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7mm7TlvZPmo4DmmKPmlrA8L3RleHQ+PC9zdmc+',
            }));
          } else {
            // 文字水印模板
            setWatermarkConfig((prev) => ({
              ...prev,
              type: 'text',
              text: tpl.name,
              imageFile: null,
              imagePreview: '',
            }));
          }
        }
      }
    },
    [templates]
  );

  const isWatermarkValid = useMemo(() => {
    if (watermarkConfig.type === 'text') {
      return watermarkConfig.text.trim().length > 0;
    }
    return watermarkConfig.imageFile !== null;
  }, [watermarkConfig]);

  const handleStartProcess = useCallback(() => {
    if (activeTab === 'add-watermark') {
      if (!isWatermarkValid) {
        setWatermarkErrorMessage('未设置水印');
        setWatermarkErrorVisible(true);
        return;
      }
    }
    alert(`开始处理 ${selectedImages.length} 张图片`);
  }, [activeTab, isWatermarkValid, selectedImages]);

  // 创建模板按钮（下拉框右侧）- 始终打开创建弹窗
  const handleCreateTemplateClick = useCallback(() => {
    // 校验水印配置
    if (watermarkConfig.type === 'text' && !watermarkConfig.text.trim()) {
      setWatermarkErrorMessage('未设置水印');
      setWatermarkErrorVisible(true);
      return;
    }
    if (watermarkConfig.type === 'image' && !watermarkConfig.imageFile) {
      setWatermarkErrorMessage('未设置水印');
      setWatermarkErrorVisible(true);
      return;
    }

    // 始终打开创建弹窗
    setEditingTemplate(null);
    setSaveModalTitle('创建模板');
    setSaveModalVisible(true);
  }, [watermarkConfig]);

  // 保存模板按钮（开始处理右侧）- 更新已选模板
  const handleSaveTemplateClick = useCallback(() => {
    // 校验水印配置
    if (watermarkConfig.type === 'text' && !watermarkConfig.text.trim()) {
      setWatermarkErrorMessage('未设置水印');
      setWatermarkErrorVisible(true);
      return;
    }
    if (watermarkConfig.type === 'image' && !watermarkConfig.imageFile) {
      setWatermarkErrorMessage('未设置水印');
      setWatermarkErrorVisible(true);
      return;
    }

    if (selectedTemplateId) {
      // 已选择模板，直接更新
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === selectedTemplateId
            ? { ...t, name: watermarkConfig.type === 'text' ? watermarkConfig.text : t.name }
            : t
        )
      );
      setToastMessage('模板已更新');
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 2000);
    }
  }, [watermarkConfig, selectedTemplateId]);

  const handleSaveModalConfirm = useCallback(
    (name: string, type: '公共' | '专属') => {
      if (!name.trim()) return;

      if (editingTemplate) {
        // 编辑模式
        setTemplates((prev) =>
          prev.map((t) => (t.id === editingTemplate.id ? { ...t, name, type } : t))
        );
      } else {
        // 新建模式
        const newTpl: SavedTemplate = {
          id: `tpl-${Date.now()}`,
          name,
          type,
          watermarkType: watermarkConfig.type,
        };
        setTemplates((prev) => [...prev, newTpl]);
        setSelectedTemplateId(newTpl.id);
      }
      setSaveModalVisible(false);
      setEditingTemplate(null);
      if (editingTemplate) {
        setManageModalVisible(true);
      }
      setToastMessage(editingTemplate ? '模板已更新' : '模板已创建');
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 2000);
    },
    [editingTemplate, watermarkConfig.type]
  );

  const handleManageTemplateClick = useCallback(() => {
    setManageModalVisible(true);
  }, []);

  const handleEditTemplate = useCallback(
    (tpl: SavedTemplate) => {
      setEditingTemplate(tpl);
      setSaveModalTitle('编辑模板');
      setManageModalVisible(false);
      setSaveModalVisible(true);
    },
    []
  );

  const handleDeleteTemplate = useCallback(
    (tpl: SavedTemplate) => {
      setDeleteTarget(tpl);
      setConfirmMessage(`确定要删除模板${tpl.name}吗？`);
      setManageModalVisible(false);
      setConfirmModalVisible(true);
    },
    []
  );

  const handleConfirmDelete = useCallback(() => {
    if (deleteTarget) {
      setTemplates((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      if (selectedTemplateId === deleteTarget.id) {
        setSelectedTemplateId('');
      }
    }
    setConfirmModalVisible(false);
    setDeleteTarget(null);
    setManageModalVisible(true);
    setToastMessage('模板已删除');
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  }, [deleteTarget, selectedTemplateId]);

  if (!visible) return null;

  return (
    <>
      <div className="batch-image-overlay">
            <div className="batch-image-modal">
              {/* 标题栏 */}
              <div className="batch-image-header">
                <h2 className="batch-image-title">批量美图</h2>
                <button className="batch-image-close" onClick={onClose} aria-label="关闭">
                  <X size={18} />
                </button>
              </div>
      
              {/* 选项卡 */}
              <TabBar tabs={TABS} activeTab={activeTab} onTabChange={handleTabChange} />
      
              {/* 可滚动的中间区域 */}
              <div className="batch-image-scroll-content">
                {/* 水印面板 */}
                {activeTab === 'add-watermark' && (
                  <WatermarkPanel
                    config={watermarkConfig}
                    onConfigChange={handleWatermarkConfigChange}
                    templates={templates}
                    selectedTemplateId={selectedTemplateId}
                    onSelectTemplate={handleSelectTemplate}
                    onSaveTemplate={handleCreateTemplateClick}
                    onManageTemplate={handleManageTemplateClick}
                  />
                )}
      
                {/* 开始处理按钮 */}
                <div className="batch-image-action">
                  <button className="batch-image-start-btn" onClick={handleStartProcess} data-annotation-id="start-process-btn">
                    开始处理
                  </button>
                  {activeTab === 'add-watermark' && selectedTemplateId && (
                    <button className="batch-image-save-template-btn" onClick={handleSaveTemplateClick} data-annotation-id="save-template-btn">
                      保存模板
                    </button>
                  )}
                </div>
      
                {/* 选择控制 */}
                <SelectionControl
                  isAllSelected={isAllSelected}
                  selectedCount={selectedImages.length}
                  totalCount={IMAGES.length}
                  onToggleAll={handleToggleAll}
                />
      
                {/* 图片网格 */}
                <ImageGrid
                  images={IMAGES}
                  selectedImages={selectedImages}
                  onImageSelect={handleImageSelect}
                />
              </div>
      
        {/* 底部按钮 */}
        <div className="batch-image-footer" data-annotation-id="footer-buttons">
          <button className="batch-image-btn batch-image-btn--cancel" onClick={onClose}>
            取消
          </button>
          <button className="batch-image-btn batch-image-btn--confirm" onClick={() => onConfirm?.(selectedImages)}>
            确定
          </button>
        </div>
      </div>
      
            {/* 保存模板弹窗 */}
            <SaveTemplateModal
              visible={saveModalVisible}
              title={saveModalTitle}
              initialName={editingTemplate?.name || ''}
              initialType={editingTemplate?.type || '公共'}
              onConfirm={handleSaveModalConfirm}
              onCancel={() => {
                setSaveModalVisible(false);
                if (editingTemplate) {
                  setManageModalVisible(true);
                }
                setEditingTemplate(null);
              }}
            />
      
            {/* 管理模板弹窗 */}
            <ManageTemplateModal
              visible={manageModalVisible}
              templates={templates}
              onEdit={handleEditTemplate}
              onDelete={handleDeleteTemplate}
              onClose={() => setManageModalVisible(false)}
            />
      
            {/* 删除确认弹窗 */}
            <ConfirmModal
              visible={confirmModalVisible}
              message={confirmMessage}
              onConfirm={handleConfirmDelete}
              onCancel={() => {
                setConfirmModalVisible(false);
                setDeleteTarget(null);
                setManageModalVisible(true);
              }}
            />

            {/* 水印错误提示弹窗 */}
            <WatermarkErrorModal
              visible={watermarkErrorVisible}
              message={watermarkErrorMessage}
              onClose={() => setWatermarkErrorVisible(false)}
            />

            {/* Toast提示 */}
            {toastVisible && (
              <div className="wm-toast">{toastMessage}</div>
            )}
          </div>
      <AnnotationViewer
        source={annotationSourceDocument as unknown as AnnotationSourceDocument}
        options={{
          currentPageId: (() => {
            const hashPageId = new URLSearchParams(window.location.hash.replace(/^#/, '')).get('page');
            const searchPageId = new URLSearchParams(window.location.search.replace(/^\?/, '')).get('page');
            const pageId = hashPageId || searchPageId;
            return typeof pageId === 'string' && /^[a-z0-9-]+$/u.test(pageId)
              ? pageId
              : "batch-image";
          })(),
          onDirectoryRoute: (node) => {
            if (typeof node.route === 'string' && /^[a-z0-9-]+$/u.test(node.route)) {
              window.location.hash = `page=${node.route}`;
            }
          },
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

// 水印错误提示弹窗
type WatermarkErrorModalProps = {
  visible: boolean;
  message: string;
  onClose: () => void;
};

const WatermarkErrorModal: React.FC<WatermarkErrorModalProps> = ({ visible, message, onClose }) => {
  if (!visible) return null;

  return (
    <div className="wm-modal-overlay">
      <div className="wm-modal wm-modal--small">
        <div className="wm-modal-header">
          <h3 className="wm-modal-title">提示</h3>
          <button className="wm-modal-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <div className="wm-modal-body">
          <p className="wm-confirm-text">{message}</p>
        </div>
        <div className="wm-modal-footer">
          <button className="wm-btn wm-btn--confirm" onClick={onClose}>确定</button>
        </div>
      </div>
    </div>
  );
};

export default BatchImageModal;
