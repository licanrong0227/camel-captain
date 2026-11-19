/**
 * 插入产品模板弹窗：从已有产品模板中单选一个插入到当前商品详情。
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { RefreshCw, Search, X } from 'lucide-react';
import '../relate-template.css';

export type RelateTemplate = { id: string; name: string };

// 演示数据：产品模板名称来自 relModelList>modelName
const TEMPLATES: RelateTemplate[] = [
  { id: 'tpl-i17', name: '【全新未拆封】i17Pro Max 灵动岛 16+1TB 全网通5G智能手机' },
  { id: 'tpl-earbuds', name: '【跨境专供】无线蓝牙耳机 主动降噪 超长续航' },
  { id: 'tpl-bag', name: '【爆款】男士休闲双肩包 大容量防水通勤背包' },
  { id: 'tpl-shoes', name: '【热销】男士低帮运动鞋 灰紫拼色 日常通勤' },
  { id: 'tpl-women', name: '【新品】女士厚底休闲鞋 百搭款' },
  { id: 'tpl-universal', name: '通用数码配件产品模板' },
];

export default function RelateTemplateDialog({
  selectedId,
  onClose,
  onConfirm,
  onToast,
}: {
  selectedId: string | null;
  onClose: () => void;
  onConfirm: (template: RelateTemplate) => void;
  onToast: (message: string) => void;
}) {
  const [keyword, setKeyword] = useState('');
  const [picked, setPicked] = useState<string | null>(selectedId);
  const [syncing, setSyncing] = useState(false);
  const closeRef = useRef(onClose);
  const syncTimer = useRef<number>();
  closeRef.current = onClose;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRef.current();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.clearTimeout(syncTimer.current);
    };
  }, []);

  const list = useMemo(() => {
    const text = keyword.trim().toLowerCase();
    if (!text) return TEMPLATES;
    return TEMPLATES.filter((item) => item.name.toLowerCase().includes(text));
  }, [keyword]);

  const sync = () => {
    if (syncing) return;
    setSyncing(true);
    syncTimer.current = window.setTimeout(() => {
      setSyncing(false);
      onToast(`产品模板已同步，共 ${TEMPLATES.length} 个`);
    }, 700);
  };

  const confirm = () => {
    const template = TEMPLATES.find((item) => item.id === picked);
    if (!template) {
      onToast('请选择产品模板');
      return;
    }
    onConfirm(template);
  };

  return (
    <div className="rtp-mask">
      <div className="rtp-dialog" role="dialog" aria-modal="true" aria-label="插入产品模板">
        <header className="rtp-head">
          <h3 className="rtp-title">插入产品模板</h3>
          <button type="button" className="rtp-close" aria-label="关闭" onClick={onClose}>
            <X size={16} />
          </button>
        </header>

        <div className="rtp-body">
          <div className="rtp-toolbar">
            <label className="rtp-search">
              <Search size={14} className="rtp-search__icon" />
              <input
                value={keyword}
                placeholder="搜索模板名称"
                onChange={(event) => setKeyword(event.target.value)}
              />
            </label>
            <button
              type="button"
              className="rtp-sync"
              onClick={sync}
              disabled={syncing}
              aria-label="同步产品模板"
            >
              <RefreshCw size={13} className={syncing ? 'rtp-sync__icon is-spinning' : 'rtp-sync__icon'} />
              {syncing ? '同步中' : '同步'}
            </button>
          </div>

          {list.length > 0 ? (
            <div className="rtp-list" role="radiogroup" aria-label="产品模板列表">
              {list.map((item) => (
                <label key={item.id} className={item.id === picked ? 'rtp-item is-selected' : 'rtp-item'}>
                  <input
                    type="radio"
                    name="rtp-template"
                    checked={item.id === picked}
                    onChange={() => setPicked(item.id)}
                  />
                  <span className="rtp-item__dot" aria-hidden="true" />
                  <span className="rtp-item__name">{item.name}</span>
                  <span
                    className="rtp-item__preview"
                    aria-hidden="true"
                    onClick={(event) => event.preventDefault()}
                  >
                    预览
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <div className="rtp-empty">没有匹配的产品模板</div>
          )}
        </div>

        <footer className="rtp-foot">
          <button type="button" className="rtp-btn" onClick={onClose}>
            取消
          </button>
          <button type="button" className="rtp-btn rtp-btn--primary" onClick={confirm}>
            确定插入
          </button>
        </footer>
      </div>
    </div>
  );
}
