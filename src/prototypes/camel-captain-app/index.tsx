/**
 * @name 骆驼队长 App
 */

import React, { useEffect, useRef, useState } from 'react';
import './style.css';
import { defineHashPageRoute, useHashPage } from '../../common/useHashPage';
import { AnnotationViewer } from '@axhub/annotation';
import type { AnnotationDirectoryRouteNode, AnnotationSourceDocument } from '@axhub/annotation';
import annotationSourceDocument from './annotation-source.json';
import { AD_STORES } from './data/catalog';
import { writeAuth, clearAuth } from './data/profile';
import type { DialogRequest } from './dialog-route';
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

const TAB_PAGES: TabKey[] = ['home', 'ad-board', 'profile'];

const DEFAULT_CONFIGS: ExclusionConfig[] = AD_STORES.map((store) => ({
  storeId: store.id,
  excludeLabelIds: store.id === 155 ? [] : ['lbl-supplement'],
  manualOrderNos: [],
  manualAmount: 0,
}));

export default function CamelCaptainApp() {
  const { page, setPage } = useHashPage(ROUTE);
  const [dialogRequest, setDialogRequest] = useState<DialogRequest>({ dialog: '', token: 0 });
  const dialogToken = useRef(0);
  const dialogPageRef = useRef('');
  const [lastSync, setLastSync] = useState('2026-10-31 09:12');
  const [syncing, setSyncing] = useState(false);
  const [configs, setConfigs] = useState<ExclusionConfig[]>(DEFAULT_CONFIGS);
  const [exclusionEnabled, setExclusionEnabled] = useState(true);
  const [adMetric, setAdMetric] = useState<AdTrendView>('cost');
  const [adBoardTab, setAdBoardTab] = useState('deal');
  const [toast, setToast] = useState('');
  const syncTimer = useRef<number | null>(null);
  const toastTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (syncTimer.current) window.clearTimeout(syncTimer.current);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
  }, []);

  // 目录跳转后再从页面内导航离开时，清掉挂起的弹层请求，避免回到页面时自动弹层
  useEffect(() => {
    if (dialogRequest.dialog && dialogPageRef.current !== page) {
      dialogPageRef.current = '';
      setDialogRequest({ dialog: '', token: 0 });
    }
  }, [page, dialogRequest.dialog]);

  const handleDirectoryRoute = (node: AnnotationDirectoryRouteNode) => {
    const raw = typeof node.route === 'string' ? node.route.trim() : '';
    if (!raw) return;
    const [pageId, dialogId = ''] = raw.split(':');
    if (!/^[a-z0-9-]+$/u.test(pageId)) return;
    dialogPageRef.current = pageId;
    dialogToken.current += 1;
    setPage(pageId);
    setDialogRequest({ dialog: dialogId, token: dialogToken.current });
  };

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 1800);
  };

  const handleLogin = (account: string) => {
    writeAuth(account);
    setDialogRequest({ dialog: '', token: 0 });
    setPage('home');
  };

  const handleLogout = () => {
    clearAuth();
    setDialogRequest({ dialog: '', token: 0 });
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
          dialogPageRef.current = '';
          setDialogRequest({ dialog: '', token: 0 });
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
            dialogRequest={dialogRequest}
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
            dialogRequest={dialogRequest}
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
            dialogRequest={dialogRequest}
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
            dialogRequest={dialogRequest}
            onToast={showToast}
            onDistribution={() => setPage('distribution')}
            onLogout={handleLogout}
          />
        ) : null}

        {page === 'distribution' ? (
          <DistributionPage dialogRequest={dialogRequest} onBack={() => setPage('profile')} />
        ) : null}
      </PhoneFrame>
      {/* 无标注数据时也保留右侧工具栏，用于页面目录 */}
      <AnnotationViewer
        source={annotationSourceDocument as unknown as AnnotationSourceDocument}
        defaultVisible
        options={{
          currentPageId: page,
          toolbarEdge: 'right',
          showToolbar: true,
          emptyWhenNoData: true,
          onDirectoryRoute: handleDirectoryRoute,
        }}
      />
      <Toast message={toast} />
    </>
  );
}
