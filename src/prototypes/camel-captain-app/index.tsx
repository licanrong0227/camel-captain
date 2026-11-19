/**
 * @name 骆驼队长 App
 */

import React, { useEffect, useRef, useState } from 'react';
import './style.css';
import { defineHashPageRoute, useHashPage } from '../../common/useHashPage';
import { AnnotationViewer, type AnnotationSourceDocument, type AnnotationViewerApi } from '@axhub/annotation';
import annotationSourceDocument from './annotation-source.json';
import { AD_STORES } from './data/catalog';
import { readAuth, writeAuth, clearAuth } from './data/profile';
import type { ExclusionConfig } from './data/types';
import type { AdTrendView } from './data/adTrend';
import { PhoneFrame } from './components/PhoneFrame';
import { Toast } from './components/Toast';
import type { TabKey } from './components/TabBar';
import { LoginPage } from './pages/login';
import { RegisterPage } from './pages/register';
import { ForgotPage } from './pages/forgot';
import { HomePage } from './pages/home';
import { AdBoardPage } from './pages/ad-board';
import { ProfilePage } from './pages/profile';
import { DistributionPage } from './pages/distribution';
import userAvatar from './assets/user-avatar.png';

const ROUTE = defineHashPageRoute(
  [
    { id: 'login', title: '登录' },
    { id: 'register', title: '注册' },
    { id: 'forgot', title: '忘记密码' },
    { id: 'home', title: '首页' },
    { id: 'ad-board', title: '店铺看板', group: '经营' },
    { id: 'profile', title: '我的', group: '个人' },
    { id: 'distribution', title: '分销中心', group: '个人' },
  ],
  { defaultPageId: 'login' },
);

const PUBLIC_PAGES = ['login', 'register', 'forgot'];
const TAB_PAGES: TabKey[] = ['home', 'ad-board', 'profile'];

const DEFAULT_CONFIGS: ExclusionConfig[] = AD_STORES.map((store) => ({
  storeId: store.id,
  excludeLabelIds: store.id === 155 ? [] : ['lbl-supplement'],
  manualOrderNos: [],
  manualAmount: 0,
}));

export default function CamelCaptainApp() {
  const { page, setPage } = useHashPage(ROUTE);
  const [auth, setAuth] = useState(() => readAuth());
  const [lastSync, setLastSync] = useState('2026-10-31 09:12');
  const [syncing, setSyncing] = useState(false);
  const [configs, setConfigs] = useState<ExclusionConfig[]>(DEFAULT_CONFIGS);
  const [exclusionEnabled, setExclusionEnabled] = useState(true);
  const [adMetric, setAdMetric] = useState<AdTrendView>('cost');
  const [adBoardTab, setAdBoardTab] = useState('deal');
  const [toast, setToast] = useState('');
  const syncTimer = useRef<number | null>(null);
  const toastTimer = useRef<number | null>(null);
  const annotationApiRef = useRef<AnnotationViewerApi | null>(null);

  useEffect(() => () => {
    if (syncTimer.current) window.clearTimeout(syncTimer.current);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
  }, []);

  useEffect(() => {
    if (!auth && !PUBLIC_PAGES.includes(page)) setPage('login');
    else if (auth && PUBLIC_PAGES.includes(page)) setPage('home');
  }, [auth, page, setPage]);

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 1800);
  };

  const handleLogin = (account: string) => {
    writeAuth(account);
    setAuth(readAuth());
    setPage('home');
  };

  const handleLogout = () => {
    clearAuth();
    setAuth(null);
    setPage('login');
  };

  const handleSync = () => {
    if (syncing) return;
    setSyncing(true);
    syncTimer.current = window.setTimeout(() => {
      setSyncing(false);
      setLastSync('刚刚');
    }, 900);
  };

  const showTab = TAB_PAGES.includes(page as TabKey);
  const activeTab = showTab ? page as TabKey : undefined;

  return (
    <>
      <PhoneFrame
        showTab={showTab}
        activeTab={activeTab}
        onTab={(next) => {
          if (next === 'ad-board') setAdBoardTab('deal');
          setPage(next);
        }}
      >
        {page === 'login' ? (
          <LoginPage
            onLogin={handleLogin}
            onRegister={() => setPage('register')}
            onForgot={() => setPage('forgot')}
          />
        ) : null}

        {page === 'register' ? (
          <RegisterPage
            onDone={() => setPage('login')}
            onBack={() => setPage('login')}
            onToast={showToast}
          />
        ) : null}

        {page === 'forgot' ? (
          <ForgotPage
            onDone={() => setPage('login')}
            onBack={() => setPage('login')}
            onToast={showToast}
          />
        ) : null}

        {page === 'home' ? (
          <HomePage
            avatar={userAvatar}
            onProfile={() => setPage('profile')}
            exclusionEnabled={exclusionEnabled}
            onToggleExclusion={() => setExclusionEnabled((value) => !value)}
            configs={configs}
            onSaveConfigs={(next) => {
              setConfigs(next);
              showToast('剔除设置已保存');
            }}
            lastSync={lastSync}
            syncing={syncing}
            onSync={handleSync}
            onOpenAd={(metric) => {
              setAdMetric(metric);
              setAdBoardTab('ad');
              setPage('ad-board');
            }}
          />
        ) : null}

        {page === 'ad-board' ? (
          <AdBoardPage
            initialMetric={adMetric}
            initialTab={adBoardTab}
            exclusionEnabled={exclusionEnabled}
            onToggleExclusion={() => setExclusionEnabled((value) => !value)}
            configs={configs}
            onSaveConfigs={(next) => {
              setConfigs(next);
              showToast('剔除设置已保存');
            }}
            lastSync={lastSync}
            syncing={syncing}
            onSync={handleSync}
          />
        ) : null}

        {page === 'profile' ? (
          <ProfilePage
            avatar={userAvatar}
            onToast={showToast}
            onDistribution={() => setPage('distribution')}
            onLogout={handleLogout}
          />
        ) : null}

        {page === 'distribution' ? (
          <DistributionPage onBack={() => setPage('profile')} />
        ) : null}
      </PhoneFrame>
      {/* 无标注数据时也保留右侧工具栏，用于页面目录 */}
      <AnnotationViewer
        source={annotationSourceDocument as unknown as AnnotationSourceDocument}
        defaultVisible
        onReady={(api) => {
          annotationApiRef.current = api;
        }}
        options={{
          currentPageId: page,
          toolbarEdge: 'right',
          showToolbar: true,
          emptyWhenNoData: true,
          onDirectoryRoute: (node) => {
            if (typeof node.route === 'string' && /^[a-z0-9-]+$/u.test(node.route)) {
              window.location.hash = `page=${node.route}`;
              annotationApiRef.current?.setDirectoryPanelOpen(false);
            }
          },
        }}
      />
      <Toast message={toast} />
    </>
  );
}
