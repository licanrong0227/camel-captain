/**
 * @name 首页
 */

import React, { useEffect, useRef, useState } from 'react';
import { Headset } from 'lucide-react';
import './style.css';
import { defineHashPageRoute, useHashPage } from '../../common/useHashPage';
import { AD_STORES } from './data/catalog';
import type { ExclusionConfig } from './data/types';
import wecomQr from './assets/wecom-qr.png';
import { TopBar } from './components/TopBar';
import { HomePage } from './pages/home';
import { AdDetailPage } from './pages/ad-detail';
import { StoreDetailPage } from './pages/store-detail';

const ROUTE = defineHashPageRoute(
  [
    { id: 'home', title: '首页' },
    { id: 'ad-detail', title: '广告明细', group: '报表' },
    { id: 'store-detail', title: '店铺报表', group: '报表' },
  ],
  { defaultPageId: 'home' },
);

const DEFAULT_CONFIGS: ExclusionConfig[] = AD_STORES.map((store) => ({
  storeId: store.id,
  excludeLabelIds: store.id === 155 ? [] : ['lbl-supplement'],
  manualOrderNos: [],
  manualAmount: 0,
}));

export default function HomeDashboardPrototype() {
  const { page, setPage } = useHashPage(ROUTE);
  const [exclusionEnabled, setExclusionEnabled] = useState(true);
  const [configs, setConfigs] = useState<ExclusionConfig[]>(DEFAULT_CONFIGS);
  const [storeDetailTab, setStoreDetailTab] = useState<'deal' | 'ad'>('deal');
  const [contactOpen, setContactOpen] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ROUTE.pages.some((item) => item.id === page)) setPage('home');
  }, [page, setPage]);

  useEffect(() => {
    shellRef.current?.scrollTo({ top: 0 });
  }, [page]);

  return (
    <div className="hd-page">
      <TopBar homeActive={page === 'home'} onHome={() => setPage('home')} />
      <div className="hd-shell" ref={shellRef}>
        {page === 'home' ? (
          <HomePage
            exclusionEnabled={exclusionEnabled}
            onToggleExclusion={() => setExclusionEnabled((value) => !value)}
            configs={configs}
            onSaveConfigs={setConfigs}
            onNavigate={(next, options) => {
              if (next === 'store-detail') setStoreDetailTab(options?.tab ?? 'deal');
              setPage(next);
            }}
          />
        ) : null}
        {page === 'ad-detail' ? (
          <AdDetailPage
            exclusionEnabled={exclusionEnabled}
            onToggleExclusion={() => setExclusionEnabled((value) => !value)}
            configs={configs}
            onSaveConfigs={setConfigs}
            onHome={() => setPage('home')}
          />
        ) : null}
        {page === 'store-detail' ? (
          <StoreDetailPage
            initialTab={storeDetailTab}
            exclusionEnabled={exclusionEnabled}
            onToggleExclusion={() => setExclusionEnabled((value) => !value)}
            configs={configs}
            onSaveConfigs={setConfigs}
            onHome={() => setPage('home')}
          />
        ) : null}
      </div>

      {page === 'home' ? (
        <div className="hd-contact-float">
          {contactOpen ? (
            <div className="hd-contact-panel">
              <div className="hd-contact-panel-title">企业微信</div>
              <img className="hd-contact-qrcode" src={wecomQr} alt="企业微信二维码" />
              <div className="hd-contact-tip">扫码添加客服</div>
            </div>
          ) : null}
          <div className={`hd-contact-trigger${contactOpen ? ' is-active' : ''}`} onClick={() => setContactOpen((value) => !value)}>
            <Headset size={22} className="hd-contact-icon" />
            <span className="hd-contact-label">联系我们</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
