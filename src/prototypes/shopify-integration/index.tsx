/**
 * @name Shopify 对接
 */

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { AnnotationViewer } from '@axhub/annotation';
import type {
  AnnotationDirectoryRouteNode,
  AnnotationSourceDocument,
  AnnotationViewerOptions,
} from '@axhub/annotation';
import './style.css';
import './my-products.css';
import './create-product.css';
import './my-orders.css';
import './order-detail-dialog.css';
import './claim-center.css';
import './ai-clone-dialog.css';

import { defineHashPageRoute, useHashPage } from '../../common/useHashPage';
import { AppShell } from './components/AppShell';
import annotationSourceDocument from './annotation-source.json';
import StoreAuthPage from './pages/store-auth';
import MyProductsPage from './pages/my-products';
import MyOrdersPage from './pages/my-orders';
import ClaimCenterPage from './pages/claim-center';
import type { DialogRequest } from './dialog-route';

const ROUTE = defineHashPageRoute(
  [
    { id: 'store-auth', title: '店铺授权' },
    { id: 'claim-center', title: '认领中心' },
    { id: 'my-products', title: '我的商品' },
    { id: 'my-orders', title: '我的订单' },
  ],
  { defaultPageId: 'store-auth' },
);

export default function ShopifyIntegration() {
  const { page, setPage } = useHashPage(ROUTE);
  const [dialogRequest, setDialogRequest] = useState<DialogRequest>({ dialog: '', token: 0 });
  const dialogToken = useRef(0);

  const handleDirectoryRoute = useCallback((node: AnnotationDirectoryRouteNode) => {
    const raw = typeof node.route === 'string' ? node.route.trim() : '';
    if (!raw) return;
    const [pageId, dialogId = ''] = raw.split(':');
    dialogToken.current += 1;
    setPage(pageId);
    setDialogRequest({ dialog: dialogId, token: dialogToken.current });
  }, [setPage]);

  const options = useMemo<AnnotationViewerOptions>(() => ({
    showToolbar: true,
    toolbarEdge: 'right',
    // 没有 marker 节点时运行时不会挂载，目录和文档入口需要靠该选项激活面板
    emptyWhenNoData: true,
    currentPageId: page,
    onDirectoryRoute: handleDirectoryRoute,
  }), [page, handleDirectoryRoute]);

  return (
    <div className="si-page">
      {page === 'my-products' ? (
        <AppShell breadcrumb={['商品', '商品管理', '我的商品']} activeNav="商品" cardClassName="sip-card">
          <MyProductsPage dialogRequest={dialogRequest} />
        </AppShell>
      ) : page === 'my-orders' ? (
        <AppShell breadcrumb={['交易', '订单管理', '我的订单']} activeNav="交易" cardClassName="sip-card">
          <MyOrdersPage dialogRequest={dialogRequest} />
        </AppShell>
      ) : page === 'claim-center' ? (
        <AppShell breadcrumb={['商品', '商品管理', '认领中心']} activeNav="商品" cardClassName="cc-card">
          <ClaimCenterPage dialogRequest={dialogRequest} />
        </AppShell>
      ) : (
        <AppShell breadcrumb={['系统', '店铺', '店铺授权']}>
          <StoreAuthPage dialogRequest={dialogRequest} />
        </AppShell>
      )}
      <AnnotationViewer
        source={annotationSourceDocument as unknown as AnnotationSourceDocument}
        options={options}
      />
    </div>
  );
}