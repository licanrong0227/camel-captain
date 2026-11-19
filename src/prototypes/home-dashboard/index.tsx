/**
 * @name 首页
 */

import React, { useEffect, useRef, useState } from 'react';
import { Headset } from 'lucide-react';
import './style.css';
import { defineHashPageRoute, useHashPage } from '../../common/useHashPage';
import { AnnotationViewer, type AnnotationSourceDocument } from '@axhub/annotation';
import annotationSourceDocument from './annotation-source.json';
import { AD_STORES } from './data/catalog';
import type { ExclusionConfig } from './data/types';
import wecomQr from './assets/wecom-qr.png';
import { TopBar } from './components/TopBar';
import { HomePage } from './pages/home';
import { StoreDetailPage } from './pages/store-detail';

const ROUTE = defineHashPageRoute(
  [
    { id: 'home', title: '首页' },
    { id: 'store-detail', title: '店铺看板', group: '报表' },
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
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState('2026-10-31 09:12');
  const syncTimer = useRef<number | null>(null);
  const shellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ROUTE.pages.some((item) => item.id === page)) setPage('home');
  }, [page, setPage]);

  useEffect(() => () => {
    if (syncTimer.current) window.clearTimeout(syncTimer.current);
  }, []);

  const handleSync = () => {
    if (syncing) return;
    setSyncing(true);
    syncTimer.current = window.setTimeout(() => {
      setSyncing(false);
      setLastSync('刚刚');
    }, 900);
  };

  useEffect(() => {
    // backdrop-filter 卡片会在合成分层里盖住标注 marker，把标注 overlay 提升到最上层
    const ensureOverlayOnTop = () => {
      const host = document.getElementById('__axhub_annotation_host__');
      const root = host?.shadowRoot;
      if (!root || root.querySelector('style[data-hd-overlay-layer]')) return Boolean(root);
      const style = document.createElement('style');
      style.setAttribute('data-hd-overlay-layer', 'true');
      style.textContent = '#__axhub_annotation_overlay__{z-index:2147483600 !important;}';
      root.appendChild(style);
      return true;
    };
    if (ensureOverlayOnTop()) return;
    const timer = window.setInterval(() => {
      if (ensureOverlayOnTop()) window.clearInterval(timer);
    }, 300);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    shellRef.current?.scrollTo({ top: 0 });
  }, [page]);

  return (
    <div className="hd-page">
      <TopBar
        homeActive={page === 'home'}
        onHome={() => setPage('home')}
        onStoreBoard={() => {
          setStoreDetailTab('deal');
          setPage('store-detail');
        }}
      />
      <div className="hd-shell" ref={shellRef}>
        {page === 'home' ? (
          <HomePage
            exclusionEnabled={exclusionEnabled}
            onToggleExclusion={() => setExclusionEnabled((value) => !value)}
            configs={configs}
            onSaveConfigs={setConfigs}
            lastSync={lastSync}
            syncing={syncing}
            onSync={handleSync}
            onNavigate={(next, options) => {
              if (next === 'store-detail') setStoreDetailTab(options?.tab ?? 'deal');
              setPage(next);
            }}
          />
        ) : null}
        {page === 'store-detail' ? (
          <StoreDetailPage
            initialTab={storeDetailTab}
            exclusionEnabled={exclusionEnabled}
            onToggleExclusion={() => setExclusionEnabled((value) => !value)}
            configs={configs}
            onSaveConfigs={setConfigs}
            lastSync={lastSync}
            syncing={syncing}
            onSync={handleSync}
            onHome={() => setPage('home')}
          />
        ) : null}
      </div>

      <AnnotationViewer
        source={annotationSourceDocument as unknown as AnnotationSourceDocument}
        options={{
          currentPageId: page,
          toolbarEdge: 'right',
          showToolbar: true,
          emptyWhenNoData: true,
        }}
      />

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
