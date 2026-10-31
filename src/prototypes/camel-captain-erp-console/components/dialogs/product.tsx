import React, { useEffect, useMemo, useState } from 'react';
import {
  ErpButton,
  ErpCheckbox,
  ErpDialog,
  ErpDrawer,
  ErpForm,
  ErpFormItem,
  ErpInput,
  ErpInputNumber,
  ErpRadioGroup,
  ErpSection,
  ErpSelect,
  ErpSwitch,
  ErpTag,
  ErpTextarea,
  ErpUpload,
  erpMessage,
} from '../ui';
import { RowActionBar } from '../ListPage';
import { CATEGORY_OPTIONS, PRODUCT_IMAGES, STORE_OPTIONS } from '../../data/util';
import type { Product } from '../../data/catalog';
import { PRODUCT_STATUSES, TAG_OPTIONS } from '../../data/catalog';

const EDIT_SECTIONS = ['基本信息', '图片视频', '规格 SKU', '价格库存', '详情描述', '合规检测'];

export function EditProductDialog({
  open,
  product,
  onClose,
  onSave,
}: {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  onSave: (product: Product) => void;
}) {
  const [section, setSection] = useState('基本信息');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [status, setStatus] = useState('待发布');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [video, setVideo] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [skuRows, setSkuRows] = useState<Array<{ color: string; size: string; price: number; stock: number }>>([]);
  const [checks, setChecks] = useState<Array<{ name: string; status: string; detail: string }>>([]);

  useEffect(() => {
    if (!open || !product) return;
    setSection('基本信息');
    setTitle(product.title);
    setPrice(product.price);
    setStock(product.stock);
    setStatus(product.status);
    setCategory(product.category);
    setDescription('Premium quality product with durable material. Suitable for daily use and gifting. Please refer to the size chart before ordering.');
    setImages([product.image, ...PRODUCT_IMAGES.slice(0, 3)]);
    setVideo('');
    setTags(product.tags);
    setSkuRows([
      { color: 'Black', size: 'M', price: product.price, stock: Math.round(product.stock * 0.4) },
      { color: 'Black', size: 'L', price: product.price, stock: Math.round(product.stock * 0.35) },
      { color: 'White', size: 'M', price: product.price + 1, stock: Math.round(product.stock * 0.25) },
    ]);
    setChecks([
      { name: '标题合规', status: '通过', detail: '未命中违禁词与品牌词' },
      { name: '主图质量', status: '通过', detail: '分辨率 1000×1000，白底' },
      { name: '必填属性', status: '待处理', detail: '缺少材质属性' },
      { name: '类目匹配', status: '通过', detail: '类目与标题匹配' },
      { name: '价格合理性', status: '通过', detail: '价格处于同类目区间' },
      { name: '重复铺货', status: '通过', detail: '未发现重复商品' },
    ]);
  }, [open, product]);

  const titleCount = title.length;

  return (
    <ErpDialog
      open={open}
      title={`编辑产品${product ? ` · ${product.id}` : ''}`}
      width={1100}
      onClose={onClose}
      footer={
        <>
          <ErpButton onClick={onClose}>取消</ErpButton>
          <ErpButton
            variant="primary"
            onClick={() => {
              if (!product) return;
              if (!title.trim()) {
                erpMessage('请填写产品标题', 'warning');
                return;
              }
              onSave({ ...product, title, price, stock, status, category, tags, modifiedAt: '2026-10-31 10:00:00', currentVersion: product.currentVersion + 1 });
              erpMessage('产品已保存（演示）');
            }}
          >
            保存
          </ErpButton>
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '160px minmax(0, 1fr)', gap: 24, minHeight: 520 }}>
        <aside style={{ borderRight: '1px solid #EBEEF5', paddingRight: 12 }}>
          {EDIT_SECTIONS.map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => setSection(item)}
              style={{
                display: 'block',
                width: '100%',
                height: 34,
                marginBottom: 2,
                padding: '0 10px',
                border: 0,
                borderLeft: item === section ? '2px solid #FF7D29' : '2px solid transparent',
                borderRadius: 4,
                background: item === section ? '#FFEFE5' : 'transparent',
                color: item === section ? '#D25909' : '#4E5969',
                textAlign: 'left',
                fontSize: 13,
              }}
            >
              {item}
            </button>
          ))}
          <div className="erp-divider" />
          <div className="erp-stack erp-small erp-muted">
            <span>当前版本：{product?.currentVersion || '-'}</span>
            <span>认领版本：{product?.claimVersion || '-'}</span>
          </div>
        </aside>
        <div>
          {section === '基本信息' ? (
            <ErpForm layout="vertical">
              <div className="erp-form-grid">
                <ErpFormItem label="产品标题" required help={`${titleCount}/128 字符`}>
                  <ErpTextarea value={title} onChange={setTitle} rows={2} maxLength={128} />
                </ErpFormItem>
                <ErpFormItem label="产品状态">
                  <ErpSelect options={PRODUCT_STATUSES.map((item) => ({ label: item, value: item }))} value={status} onChange={(value) => setStatus(String(value))} width="100%" />
                </ErpFormItem>
                <ErpFormItem label="所属店铺">
                  <ErpInput value={product?.storeName || ''} disabled />
                </ErpFormItem>
                <ErpFormItem label="产品类目">
                  <ErpSelect options={CATEGORY_OPTIONS} value={category} onChange={(value) => setCategory(String(value))} filterable width="100%" />
                </ErpFormItem>
                <ErpFormItem label="父 SKU">
                  <ErpInput value={product?.parentSku || ''} disabled />
                </ErpFormItem>
                <ErpFormItem label="来源平台">
                  <ErpInput value={product?.sourcePlatform || ''} disabled />
                </ErpFormItem>
                <ErpFormItem label="标签">
                  <ErpSelect options={TAG_OPTIONS} value={tags} onChange={(value) => setTags(value as string[])} multiple filterable width="100%" />
                </ErpFormItem>
                <ErpFormItem label="认领时间">
                  <ErpInput value={product?.claimedAt || ''} disabled />
                </ErpFormItem>
              </div>
            </ErpForm>
          ) : null}
          {section === '图片视频' ? (
            <div className="erp-stack" style={{ gap: 20 }}>
              <ErpSection title="产品主图" extra={<span className="erp-small erp-muted">建议 1000×1000，白底</span>}>
                <ErpUpload files={images} onAdd={(files) => setImages((prev) => [...prev, ...files])} onRemove={(index) => setImages((prev) => prev.filter((_, i) => i !== index))} />
              </ErpSection>
              <ErpSection title="产品视频" extra={<ErpButton size="small" onClick={() => setVideo('product-video.mp4')}>AI 生成视频</ErpButton>}>
                <div className="erp-flex">
                  <span className="erp-small erp-muted">{video || '暂未上传视频'}</span>
                  {video ? <ErpButton size="small" variant="danger" onClick={() => setVideo('')}>删除</ErpButton> : null}
                </div>
                <p className="erp-small erp-muted" style={{ marginTop: 8 }}>视频生成预计消耗 xx 算力，失败可重新生成。</p>
              </ErpSection>
              <ErpSection title="详情图片">
                <ErpUpload files={[]} onAdd={(files) => erpMessage(`已添加 ${files.length} 张详情图（演示）`)} label="添加详情图" />
              </ErpSection>
            </div>
          ) : null}
          {section === '规格 SKU' ? (
            <div className="erp-stack" style={{ gap: 12 }}>
              <div className="erp-flex-between">
                <span className="erp-small erp-muted">共 {skuRows.length} 个 SKU</span>
                <div className="erp-flex">
                  <ErpButton size="small" onClick={() => setSkuRows((prev) => [...prev, { color: 'Black', size: 'XL', price, stock: 0 }])}>添加 SKU</ErpButton>
                  <ErpButton size="small" onClick={() => erpMessage('批量添加规格值弹窗已打开（演示）')}>批量添加规格值</ErpButton>
                </div>
              </div>
              <table className="erp-cost-table">
                <thead>
                  <tr>
                    <th>颜色</th>
                    <th>尺码</th>
                    <th>售价</th>
                    <th>库存</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {skuRows.map((row, index) => (
                    <tr key={`${row.color}-${row.size}-${index}`}>
                      <td>
                        <ErpInput value={row.color} onChange={(value) => setSkuRows((prev) => prev.map((item, i) => (i === index ? { ...item, color: value } : item)))} />
                      </td>
                      <td>
                        <ErpInput value={row.size} onChange={(value) => setSkuRows((prev) => prev.map((item, i) => (i === index ? { ...item, size: value } : item)))} />
                      </td>
                      <td>
                        <ErpInputNumber value={row.price} precision={2} step={0.5} onChange={(value) => setSkuRows((prev) => prev.map((item, i) => (i === index ? { ...item, price: value } : item)))} width={120} />
                      </td>
                      <td>
                        <ErpInputNumber value={row.stock} onChange={(value) => setSkuRows((prev) => prev.map((item, i) => (i === index ? { ...item, stock: value } : item)))} width={110} />
                      </td>
                      <td>
                        <button type="button" className="erp-link" onClick={() => setSkuRows((prev) => prev.filter((_, i) => i !== index))}>删除</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
          {section === '价格库存' ? (
            <ErpForm layout="vertical">
              <div className="erp-form-grid">
                <ErpFormItem label="售价（USD）" required>
                  <ErpInputNumber value={price} onChange={setPrice} precision={2} step={0.5} width={200} />
                </ErpFormItem>
                <ErpFormItem label="库存" required>
                  <ErpInputNumber value={stock} onChange={setStock} width={200} />
                </ErpFormItem>
                <ErpFormItem label="采购价（CNY）">
                  <ErpInputNumber value={Number((price * 3.6).toFixed(2))} precision={2} width={200} />
                </ErpFormItem>
                <ErpFormItem label="重量（kg）">
                  <ErpInputNumber value={0.35} precision={2} step={0.05} width={200} />
                </ErpFormItem>
                <ErpFormItem label="包装尺寸">
                  <div className="erp-flex">
                    <ErpInput value="30" style={{ width: 70 }} />
                    <span className="erp-muted">×</span>
                    <ErpInput value="20" style={{ width: 70 }} />
                    <span className="erp-muted">×</span>
                    <ErpInput value="10" style={{ width: 70 }} />
                    <span className="erp-muted">cm</span>
                  </div>
                </ErpFormItem>
                <ErpFormItem label="运费模板">
                  <ErpSelect options={[{ label: '华磊-美国专线', value: 'hl' }, { label: '云途-全球挂号', value: 'yt' }]} value="hl" width="100%" />
                </ErpFormItem>
              </div>
            </ErpForm>
          ) : null}
          {section === '详情描述' ? (
            <div className="erp-stack" style={{ gap: 12 }}>
              <div className="erp-flex">
                <ErpButton size="small" onClick={() => setDescription(`${description}\n\n【Product Highlights】\n· Premium material\n· Comfortable and durable\n· Multiple colors available`)}>套用详情模板</ErpButton>
                <ErpButton size="small">创建模板</ErpButton>
                <ErpButton size="small">管理模板</ErpButton>
              </div>
              <ErpTextarea value={description} onChange={setDescription} rows={14} maxLength={5000} />
            </div>
          ) : null}
          {section === '合规检测' ? (
            <div className="erp-stack" style={{ gap: 12 }}>
              <div className="erp-flex-between">
                <span className="erp-small erp-muted">检测项 6 项 · 最近检测 2026-10-31 09:20</span>
                <ErpButton
                  size="small"
                  variant="primary"
                  onClick={() => {
                    setChecks((prev) => prev.map((item) => ({ ...item, status: '检测中' })));
                    window.setTimeout(() => {
                      setChecks([
                        { name: '标题合规', status: '通过', detail: '未命中违禁词与品牌词' },
                        { name: '主图质量', status: '通过', detail: '分辨率 1000×1000，白底' },
                        { name: '必填属性', status: '违规', detail: '缺少材质属性' },
                        { name: '类目匹配', status: '通过', detail: '类目与标题匹配' },
                        { name: '价格合理性', status: '通过', detail: '价格处于同类目区间' },
                        { name: '重复铺货', status: '通过', detail: '未发现重复商品' },
                      ]);
                      erpMessage('合规检测完成（演示）');
                    }, 900);
                  }}
                >
                  重新检测
                </ErpButton>
              </div>
              {checks.map((check) => (
                <div key={check.name} className="erp-flex-between" style={{ padding: '10px 12px', border: '1px solid #EBEEF5', borderRadius: 4 }}>
                  <div>
                    <b style={{ fontSize: 13 }}>{check.name}</b>
                    <p className="erp-small erp-muted">{check.detail}</p>
                  </div>
                  <ErpTag tone={check.status === '通过' ? 'success' : check.status === '违规' ? 'danger' : check.status === '检测中' ? 'info' : 'warning'}>{check.status}</ErpTag>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </ErpDialog>
  );
}

export function UpdatePublishDialog({
  open,
  count,
  onClose,
  onConfirm,
}: {
  open: boolean;
  count: number;
  onClose: () => void;
  onConfirm: (mode: string) => void;
}) {
  const [mode, setMode] = useState('now');
  const [time, setTime] = useState('2026-11-01T10:00');
  const [loop, setLoop] = useState(false);
  const [titleStrategy, setTitleStrategy] = useState('keep');
  const [imageStrategy, setImageStrategy] = useState('keep');
  const [dailyLimit, setDailyLimit] = useState(20);
  return (
    <ErpDialog
      open={open}
      title="更新发布"
      width={720}
      onClose={onClose}
      footer={
        <>
          <ErpButton onClick={onClose}>取消</ErpButton>
          <ErpButton variant="primary" onClick={() => onConfirm(mode)}>
            确认更新发布
          </ErpButton>
        </>
      }
    >
      <div className="erp-inline-note" style={{ marginBottom: 18 }}>已选择 {count} 个商品。发布动作只在本演示环境内模拟，不会提交到敦煌网。</div>
      <ErpForm layout="vertical">
        <ErpFormItem label="发布时间">
          <ErpRadioGroup options={[{ label: '立即发布', value: 'now' }, { label: '定时发布', value: 'schedule' }]} value={mode} onChange={setMode} />
        </ErpFormItem>
        {mode === 'schedule' ? (
          <ErpFormItem label="定时时间">
            <ErpInput type="datetime-local" value={time} onChange={setTime} />
          </ErpFormItem>
        ) : null}
        <ErpFormItem label="循环刊登">
          <div className="erp-flex">
            <ErpSwitch checked={loop} onChange={setLoop} label="循环刊登" />
            <span className="erp-small erp-muted">开启后按店铺模板周期性重新刊登</span>
          </div>
        </ErpFormItem>
        {loop ? (
          <ErpFormItem label="每日上限">
            <ErpInputNumber value={dailyLimit} onChange={setDailyLimit} min={1} max={200} suffix="个/天" />
          </ErpFormItem>
        ) : null}
        <ErpFormItem label="标题策略">
          <ErpRadioGroup options={[{ label: '保持原标题', value: 'keep' }, { label: '按模板重写', value: 'rewrite' }]} value={titleStrategy} onChange={setTitleStrategy} />
        </ErpFormItem>
        <ErpFormItem label="主图策略">
          <ErpRadioGroup options={[{ label: '保持原主图', value: 'keep' }, { label: '替换首图', value: 'replace' }]} value={imageStrategy} onChange={setImageStrategy} />
        </ErpFormItem>
      </ErpForm>
    </ErpDialog>
  );
}

const AUTO_MODULES = [
  '基本信息',
  '标题',
  '关键词',
  '短描述',
  '详情描述',
  '主图',
  '视频',
  'SKU',
  '价格库存',
  '服务模板',
  '属性',
  '类目',
  '其他',
];

export function AutoEditDialog({
  open,
  count,
  onClose,
  onConfirm,
}: {
  open: boolean;
  count: number;
  onClose: () => void;
  onConfirm: (modules: string[]) => void;
}) {
  const [active, setActive] = useState(AUTO_MODULES[0]);
  const [enabled, setEnabled] = useState<string[]>(['标题', '短描述']);
  const [titleMode, setTitleMode] = useState('ai');
  const [keywords, setKeywords] = useState('');
  const [imageMode, setImageMode] = useState('keep');
  const [priceMode, setPriceMode] = useState('keep');

  return (
    <ErpDialog
      open={open}
      title="自动编辑"
      width={980}
      onClose={onClose}
      footer={
        <>
          <ErpButton onClick={onClose}>取消</ErpButton>
          <ErpButton variant="primary" onClick={() => onConfirm(enabled)}>
            提交编辑（{count} 个商品）
          </ErpButton>
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '200px minmax(0, 1fr)', gap: 24, minHeight: 420 }}>
        <aside style={{ borderRight: '1px solid #EBEEF5', paddingRight: 12 }}>
          {AUTO_MODULES.map((module, index) => (
            <div key={module} className="erp-flex" style={{ marginBottom: 2 }}>
              <ErpCheckbox
                checked={enabled.includes(module)}
                onChange={(checked) => setEnabled((prev) => (checked ? [...prev, module] : prev.filter((item) => item !== module)))}
              />
              <button
                type="button"
                onClick={() => setActive(module)}
                style={{
                  flex: 1,
                  height: 32,
                  border: 0,
                  borderRadius: 4,
                  background: active === module ? '#FFEFE5' : 'transparent',
                  color: active === module ? '#D25909' : '#4E5969',
                  textAlign: 'left',
                  fontSize: 13,
                }}
              >
                {index + 1}. {module}
              </button>
            </div>
          ))}
        </aside>
        <div className="erp-stack" style={{ gap: 16 }}>
          <div className="erp-inline-note">已开启模块：{enabled.length ? enabled.join('、') : '未开启'}。未开启的模块将保持原值。</div>
          {active === '标题' ? (
            <ErpForm layout="vertical">
              <ErpFormItem label="标题处理方式">
                <ErpRadioGroup
                  options={[
                    { label: 'AI 生成', value: 'ai' },
                    { label: '套用模板', value: 'template' },
                    { label: '保持原标题', value: 'keep' },
                  ]}
                  value={titleMode}
                  onChange={setTitleMode}
                />
              </ErpFormItem>
              {titleMode === 'ai' ? (
                <ErpFormItem label="包含关键词" help="选择 AI 生成时，用这些关键词约束标题内容">
                  <ErpInput value={keywords} onChange={setKeywords} placeholder="例如：leather bag, crossbody, women" maxLength={70} />
                </ErpFormItem>
              ) : null}
              <ErpFormItem label="标题预览">
                <div className="erp-log-json">AI generated title preview for selected products.</div>
              </ErpFormItem>
            </ErpForm>
          ) : null}
          {active === '主图' ? (
            <ErpForm layout="vertical">
              <ErpFormItem label="图片处理方式">
                <ErpRadioGroup
                  options={[
                    { label: '保持原图', value: 'keep' },
                    { label: '替换首图', value: 'replace' },
                    { label: '批量美图', value: 'beautify' },
                  ]}
                  value={imageMode}
                  onChange={setImageMode}
                />
              </ErpFormItem>
              <ErpFormItem label="参考图">
                <ErpUpload files={[]} onAdd={(files) => erpMessage(`已添加 ${files.length} 张参考图（演示）`)} />
              </ErpFormItem>
            </ErpForm>
          ) : null}
          {active === '价格库存' ? (
            <ErpForm layout="vertical">
              <ErpFormItem label="价格处理方式">
                <ErpRadioGroup
                  options={[
                    { label: '保持原价', value: 'keep' },
                    { label: '按模板计算', value: 'template' },
                    { label: '固定加价', value: 'fixed' },
                  ]}
                  value={priceMode}
                  onChange={setPriceMode}
                />
              </ErpFormItem>
              <ErpFormItem label="固定加价">
                <ErpInputNumber value={1} precision={2} step={0.5} suffix="USD" />
              </ErpFormItem>
            </ErpForm>
          ) : null}
          {!['标题', '主图', '价格库存'].includes(active) ? (
            <ErpSection title={active}>
              <p className="erp-small erp-muted">该模块会自动读取商品原值并按当前店铺模板处理；开启后会显示在提交结果中。</p>
              <div style={{ marginTop: 12 }}>
                <ErpCheckbox checked={enabled.includes(active)} onChange={(checked) => setEnabled((prev) => (checked ? [...prev, active] : prev.filter((item) => item !== active)))}>
                  启用「{active}」自动编辑
                </ErpCheckbox>
              </div>
            </ErpSection>
          ) : null}
        </div>
      </div>
    </ErpDialog>
  );
}

const IMAGE_METHODS = ['转白底', '加水印', '翻译图片', '去水印', 'AI 场景图'];
const IMAGE_POSITIONS = ['主图', 'SKU 图', '详情图', '站外推广图'];

export function BatchImageDialog({
  open,
  count,
  onClose,
  onConfirm,
}: {
  open: boolean;
  count: number;
  onClose: () => void;
  onConfirm: (method: string) => void;
}) {
  const [method, setMethod] = useState('转白底');
  const [positions, setPositions] = useState<string[]>(['主图']);
  const [progress, setProgress] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [finished, setFinished] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!open) {
      setProgress(0);
      setProcessing(false);
      setFinished(false);
      setSaved(false);
    }
  }, [open]);

  useEffect(() => {
    if (!processing) return undefined;
    const timer = window.setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(100, prev + 8);
        if (next >= 100) {
          setProcessing(false);
          setFinished(true);
        }
        return next;
      });
    }, 220);
    return () => window.clearInterval(timer);
  }, [processing]);

  return (
    <ErpDialog
      open={open}
      title="批量美图"
      width={860}
      onClose={onClose}
      footer={
        <>
          <ErpButton onClick={onClose}>关闭</ErpButton>
          <ErpButton variant="primary" disabled={processing || !positions.length} onClick={() => { setSaved(true); onConfirm(method); }}>
            保存结果
          </ErpButton>
        </>
      }
    >
      <div className="erp-stack" style={{ gap: 16 }}>
        <div className="erp-flex-between">
          <span className="erp-small erp-muted">已选择 {count} 个商品 · 图片位置可多选</span>
          <span className="erp-small erp-muted">处理方式</span>
        </div>
        <div className="erp-tag-list">
          {IMAGE_METHODS.map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => setMethod(item)}
              style={{
                height: 32,
                padding: '0 14px',
                border: `1px solid ${method === item ? '#FF7D29' : '#E5E6EB'}`,
                borderRadius: 4,
                background: method === item ? '#FFEFE5' : '#fff',
                color: method === item ? '#D25909' : '#4E5969',
                fontSize: 12,
              }}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="erp-flex" style={{ gap: 16 }}>
          {IMAGE_POSITIONS.map((position) => (
            <ErpCheckbox
              key={position}
              checked={positions.includes(position)}
              onChange={(checked) => setPositions((prev) => (checked ? [...prev, position] : prev.filter((item) => item !== position)))}
            >
              {position}
            </ErpCheckbox>
          ))}
        </div>
        <div className="erp-detail-summary">
          <img src={PRODUCT_IMAGES[0]} alt="" />
          <div className="erp-detail-summary__body">
            <b>{method}预览</b>
            <span>{positions.join('、') || '未选择图片位置'} · 预计消耗 {count * positions.length * 4} 算力</span>
          </div>
        </div>
        {processing || finished ? (
          <div className="erp-stack">
            <div className="erp-flex-between">
              <span className="erp-small">{processing ? '处理中…' : '处理完成'}</span>
              <span className="erp-small erp-muted">{progress}%</span>
            </div>
            <div className="erp-progress">
              <div className="erp-progress__bar" style={{ width: `${progress}%` }} />
            </div>
            <span className="erp-small erp-muted">成功 {Math.round((progress / 100) * count * positions.length)} 张，未完成 {Math.max(0, count * positions.length - Math.round((progress / 100) * count * positions.length))} 张</span>
          </div>
        ) : null}
        {saved ? <div className="erp-inline-note">结果已保存到演示数据，仅本地生效。</div> : null}
      </div>
      <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
        <ErpButton
          variant="primary"
          disabled={!positions.length || processing}
          onClick={() => {
            setFinished(false);
            setSaved(false);
            setProgress(0);
            setProcessing(true);
          }}
        >
          {processing ? '处理中…' : '开始处理'}
        </ErpButton>
        <ErpButton disabled={!processing} onClick={() => { setProcessing(false); erpMessage(`已停止处理：成功 ${Math.round((progress / 100) * count)} 张，未完成 ${count - Math.round((progress / 100) * count)} 张`, 'warning'); }}>
          停止处理
        </ErpButton>
      </div>
    </ErpDialog>
  );
}

export function AiCloneDialog({
  open,
  count,
  onClose,
  onConfirm,
}: {
  open: boolean;
  count: number;
  onClose: () => void;
  onConfirm: (stores: string[]) => void;
}) {
  const [targetStores, setTargetStores] = useState<string[]>([]);
  const [shuffle, setShuffle] = useState(true);
  const [aiTitle, setAiTitle] = useState(true);
  return (
    <ErpDialog
      open={open}
      title="AI 一键克隆"
      width={720}
      onClose={onClose}
      footer={
        <>
          <ErpButton onClick={onClose}>取消</ErpButton>
          <ErpButton
            variant="primary"
            onClick={() => {
              if (!targetStores.length) {
                erpMessage('请选择目标店铺', 'warning');
                return;
              }
              onConfirm(targetStores);
            }}
          >
            开始克隆
          </ErpButton>
        </>
      }
    >
      <div className="erp-inline-note" style={{ marginBottom: 16 }}>已选择 {count} 个商品，克隆会在目标店铺生成新的商品草稿（演示）。</div>
      <ErpForm layout="vertical">
        <ErpFormItem label="目标店铺" required>
          <ErpSelect options={STORE_OPTIONS} value={targetStores} onChange={(next) => setTargetStores(next as string[])} multiple filterable width="100%" placeholder="请选择目标店铺" />
        </ErpFormItem>
        <ErpFormItem label="原店铺">
          <div className="erp-flex"><ErpTag tone="neutral">152 包包</ErpTag><ErpTag tone="neutral">155 clothes</ErpTag></div>
        </ErpFormItem>
        <ErpFormItem label="打乱主图">
          <ErpSwitch checked={shuffle} onChange={setShuffle} />
        </ErpFormItem>
        <ErpFormItem label="AI 生成标题">
          <ErpSwitch checked={aiTitle} onChange={setAiTitle} />
        </ErpFormItem>
      </ErpForm>
    </ErpDialog>
  );
}

const STORE_TEMPLATES = [
  { store: '152 包包', templates: ['箱包默认模板', '通勤包模板'] },
  { store: '153 鞋子', templates: ['运动鞋模板', '休闲鞋模板'] },
  { store: '155 clothes', templates: ['女装模板', '男装模板'] },
  { store: '161 sneakerhub8', templates: ['球鞋模板'] },
];

export function ProductTemplateDialog({
  open,
  count,
  onClose,
  onConfirm,
}: {
  open: boolean;
  count: number;
  onClose: () => void;
  onConfirm: (templates: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <ErpDialog
      open={open}
      title="批量关联产品模板"
      width={760}
      onClose={onClose}
      footer={
        <>
          <ErpButton onClick={onClose}>取消</ErpButton>
          <ErpButton variant="primary" onClick={() => onConfirm(selected)}>
            关联模板
          </ErpButton>
        </>
      }
    >
      <div className="erp-inline-note" style={{ marginBottom: 16 }}>已选择 {count} 个商品。模板按店铺关联，勾选后会同步到对应店铺的全部商品（演示）。</div>
      {STORE_TEMPLATES.map((group) => (
        <div key={group.store} style={{ marginBottom: 16 }}>
          <div className="erp-small erp-muted" style={{ marginBottom: 8 }}>{group.store}</div>
          <div className="erp-flex" style={{ gap: 16 }}>
            {group.templates.map((template) => (
              <ErpCheckbox
                key={template}
                checked={selected.includes(template)}
                onChange={(checked) => setSelected((prev) => (checked ? [...prev, template] : prev.filter((item) => item !== template)))}
              >
                {template}
              </ErpCheckbox>
            ))}
          </div>
        </div>
      ))}
    </ErpDialog>
  );
}

export function SpecValueDialog({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (values: string[]) => void;
}) {
  const [template, setTemplate] = useState('颜色模板');
  const [values, setValues] = useState(['Black', 'White', 'Brown', 'Beige']);
  const [input, setInput] = useState('');
  return (
    <ErpDialog
      open={open}
      title="批量添加规格值"
      width={640}
      onClose={onClose}
      footer={
        <>
          <ErpButton onClick={onClose}>取消</ErpButton>
          <ErpButton variant="primary" onClick={() => onSave(values)}>保存</ErpButton>
        </>
      }
    >
      <ErpForm layout="vertical">
        <ErpFormItem label="规格值模板">
          <div className="erp-flex">
            <ErpSelect options={[{ label: '颜色模板', value: '颜色模板' }, { label: '尺码模板', value: '尺码模板' }]} value={template} onChange={(value) => setTemplate(String(value))} width={200} />
            <ErpButton size="small" onClick={() => erpMessage('模板已套用（演示）')}>套用</ErpButton>
            <ErpButton size="small">管理模板</ErpButton>
          </div>
        </ErpFormItem>
        <ErpFormItem label="规格值">
          <div className="erp-tag-list">
            {values.map((value) => (
              <ErpTag key={value} tone="brand" closable onClose={() => setValues((prev) => prev.filter((item) => item !== value))}>
                {value}
              </ErpTag>
            ))}
          </div>
        </ErpFormItem>
        <ErpFormItem label="添加值">
          <div className="erp-flex">
            <ErpInput
              value={input}
              onChange={setInput}
              placeholder="输入规格值后按 Enter"
              onEnter={() => {
                const next = input.trim();
                if (!next) return;
                if (values.includes(next)) {
                  erpMessage('规格值已存在', 'warning');
                  return;
                }
                setValues((prev) => [...prev, next]);
                setInput('');
              }}
            />
            <ErpButton
              onClick={() => {
                const next = input.trim();
                if (!next) return;
                setValues((prev) => [...prev, next]);
                setInput('');
              }}
            >
              添加
            </ErpButton>
          </div>
        </ErpFormItem>
      </ErpForm>
    </ErpDialog>
  );
}

export function ClaimDialog({
  open,
  count,
  onClose,
  onConfirm,
}: {
  open: boolean;
  count: number;
  onClose: () => void;
  onConfirm: (values: Record<string, unknown>) => void;
}) {
  const [store, setStore] = useState('152');
  const [category, setCategory] = useState('bags-shoulder');
  const [pricing, setPricing] = useState('默认上新价模板');
  const [claimMode, setClaimMode] = useState('direct');
  return (
    <ErpDialog
      open={open}
      title="认领商品"
      width={720}
      onClose={onClose}
      footer={
        <>
          <ErpButton onClick={onClose}>取消</ErpButton>
          <ErpButton
            variant="primary"
            onClick={() => {
              if (!store || !category) {
                erpMessage('请选择目标店铺与类目', 'warning');
                return;
              }
              onConfirm({ store, category, pricing, claimMode });
            }}
          >
            确认认领（{count}）
          </ErpButton>
        </>
      }
    >
      <ErpForm layout="vertical">
        <div className="erp-form-grid">
          <ErpFormItem label="目标店铺" required>
            <ErpSelect options={STORE_OPTIONS} value={store} onChange={(value) => setStore(String(value))} width="100%" />
          </ErpFormItem>
          <ErpFormItem label="商品类目" required>
            <ErpSelect options={CATEGORY_OPTIONS} value={category} onChange={(value) => setCategory(String(value))} filterable width="100%" />
          </ErpFormItem>
          <ErpFormItem label="定价模板">
            <ErpSelect options={[{ label: '默认上新价模板', value: '默认上新价模板' }, { label: '箱包专属模板', value: '箱包专属模板' }]} value={pricing} onChange={(value) => setPricing(String(value))} width="100%" />
          </ErpFormItem>
          <ErpFormItem label="认领方式">
            <ErpRadioGroup options={[{ label: '直接认领', value: 'direct' }, { label: '认领后编辑', value: 'edit' }]} value={claimMode} onChange={setClaimMode} />
          </ErpFormItem>
        </div>
      </ErpForm>
      <div className="erp-inline-note" style={{ marginTop: 16 }}>共选择 {count} 个商品。认领后可在「我的商品」继续编辑与发布。</div>
    </ErpDialog>
  );
}

export function ClaimExceptionDialog({
  open,
  onClose,
  onEdit,
}: {
  open: boolean;
  onClose: () => void;
  onEdit: (id: string) => void;
}) {
  const failures = [
    ['C0000012', '标题包含侵权品牌词', '缺少必填属性：材质'],
    ['C0000031', '主图分辨率不足 800×800', '图片格式不支持 WEBP'],
    ['C0000048', '类目未映射', '采购价为 0'],
    ['C0000066', 'SKU 价格为负数', '库存未填写'],
    ['C0000079', '标题超长 168 字符', '商品描述为空'],
    ['C0000091', '来源链接失效', '重复商品'],
  ];
  return (
    <ErpDialog open={open} title="认领异常" width={760} onClose={onClose} footer={<ErpButton variant="primary" onClick={onClose}>知道了</ErpButton>}>
      <div className="erp-stack" style={{ gap: 10 }}>
        <div className="erp-inline-note is-warning">以下商品认领失败，请修正后重新认领。</div>
        {failures.map(([id, reason, detail]) => (
          <div key={id} className="erp-flex-between" style={{ padding: '10px 12px', border: '1px solid #EBEEF5', borderRadius: 4 }}>
            <div>
              <b style={{ fontSize: 13 }}>{id}</b>
              <p className="erp-small" style={{ color: '#F44837' }}>{reason}</p>
              <p className="erp-small erp-muted">{detail}</p>
            </div>
            <ErpButton size="small" onClick={() => onEdit(id)}>编辑商品信息</ErpButton>
          </div>
        ))}
      </div>
    </ErpDialog>
  );
}

export function TemplatePreviewDialog({ open, title, onClose }: { open: boolean; title: string; onClose: () => void }) {
  return (
    <ErpDialog open={open} title={title} width={560} onClose={onClose} footer={<ErpButton variant="primary" onClick={onClose}>关闭</ErpButton>}>
      <div className="erp-config-preview">
        <b>定价预览</b>
        <div className="erp-config-preview__row"><span>采购成本</span><span>$ 12.00</span></div>
        <div className="erp-config-preview__row"><span>国内运费</span><span>$ 1.20</span></div>
        <div className="erp-config-preview__row"><span>国际运费</span><span>$ 3.50</span></div>
        <div className="erp-config-preview__row"><span>加价系数</span><span>1.35</span></div>
        <div className="erp-divider" />
        <div className="erp-config-preview__row"><span>建议售价</span><strong>$ 22.99</strong></div>
      </div>
    </ErpDialog>
  );
}

export function QuickActionsDialog({ open, title, actions, onClose }: { open: boolean; title: string; actions: string[]; onClose: () => void }) {
  return (
    <ErpDialog open={open} title={title} width={560} onClose={onClose} footer={<ErpButton onClick={onClose}>关闭</ErpButton>}>
      <div className="erp-inline-note" style={{ marginBottom: 12 }}>该操作只更新本地演示数据，不会提交到敦煌网。</div>
      <div style={{ display: 'grid', gap: 8 }}>
        {actions.map((action) => (
          <ErpButton key={action} onClick={() => { erpMessage(`${action}（演示）`); onClose(); }}>{action}</ErpButton>
        ))}
      </div>
    </ErpDialog>
  );
}

export function OrderDetailDrawer({ open, order, onClose }: { open: boolean; order: any; onClose: () => void }) {
  if (!order) return null;
  return (
    <ErpDrawer
      open={open}
      title={`订单详情 · ${order.orderNo}`}
      width={720}
      onClose={onClose}
      footer={
        <>
          <ErpButton onClick={onClose}>关闭</ErpButton>
          <ErpButton variant="primary" onClick={() => { erpMessage('订单已标记处理（演示）'); onClose(); }}>标记处理</ErpButton>
        </>
      }
    >
      <div className="erp-stack" style={{ gap: 18 }}>
        <div className="erp-flex" style={{ gap: 8 }}>
          <ErpTag tone={order.status === '已妥投' ? 'success' : order.status === '已作废' ? 'neutral' : 'warning'}>{order.status}</ErpTag>
          <ErpTag tone="neutral">{order.storeName}</ErpTag>
          <span className="erp-small erp-muted">下单时间 {order.createdAt}</span>
        </div>
        {order.items.map((item: any, index: number) => (
          <div key={`${item.sku}-${index}`} className="erp-detail-summary">
            <img src={item.image} alt="" />
            <div className="erp-detail-summary__body">
              <b>{item.title}</b>
              <span>SKU：{item.sku}</span>
              <span>单价 {item.price} USD × {item.qty}</span>
            </div>
            <span className="erp-amount" style={{ marginLeft: 'auto' }}>{item.price * item.qty} USD</span>
          </div>
        ))}
        <div className="erp-descriptions" style={{ ['--erp-desc-cols' as string]: 2 }}>
          <div className="erp-descriptions__item"><span className="erp-descriptions__label">买家</span><span className="erp-descriptions__value">{order.buyer}</span></div>
          <div className="erp-descriptions__item"><span className="erp-descriptions__label">国家</span><span className="erp-descriptions__value">{order.country}</span></div>
          <div className="erp-descriptions__item"><span className="erp-descriptions__label">收货地址</span><span className="erp-descriptions__value">{order.address} {order.postcode}</span></div>
          <div className="erp-descriptions__item"><span className="erp-descriptions__label">物流渠道</span><span className="erp-descriptions__value">{order.channel}</span></div>
          <div className="erp-descriptions__item"><span className="erp-descriptions__label">运单号</span><span className="erp-descriptions__value">{order.trackingNo}</span></div>
          <div className="erp-descriptions__item"><span className="erp-descriptions__label">采购状态</span><span className="erp-descriptions__value">{order.purchaseStatus}</span></div>
        </div>
        <ErpSection title="订单时间线">
          <div className="erp-timeline">
            {['订单创建', '买家付款', '采购下单', '仓库出库', '物流揽收', '派送中', '已妥投'].map((step, index) => (
              <div key={step} className={`erp-timeline__item ${index < 5 ? 'is-active' : ''}`}>
                <span className="erp-timeline__dot" />
                <div className="erp-timeline__content">
                  <b>{step}</b>
                  <span className="erp-timeline__time">{index < 5 ? order.createdAt : '-'}</span>
                </div>
              </div>
            ))}
          </div>
        </ErpSection>
        <ErpSection title="订单备注">
          <p className="erp-small erp-muted">{order.buyerNote || '暂无买家备注'}</p>
        </ErpSection>
      </div>
    </ErpDrawer>
  );
}

export function SimpleListDialog({ open, title, items, onClose }: { open: boolean; title: string; items: Array<{ label: string; value?: React.ReactNode }>; onClose: () => void }) {
  return (
    <ErpDialog open={open} title={title} width={560} onClose={onClose} footer={<ErpButton variant="primary" onClick={onClose}>关闭</ErpButton>}>
      <div className="erp-stack" style={{ gap: 10 }}>
        {items.map((item) => (
          <div className="erp-flex-between" key={item.label}>
            <span className="erp-small erp-muted">{item.label}</span>
            <span>{item.value ?? '-'}</span>
          </div>
        ))}
      </div>
    </ErpDialog>
  );
}

export function useLocalRows<T>(initial: T[]) {
  const [rows, setRows] = useState<T[]>(initial);
  const update = (next: T[]) => setRows(next);
  return useMemo(() => ({ rows, update }), [rows]);
}
