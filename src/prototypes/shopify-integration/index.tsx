/**
 * @name Shopify 对接
 */

import React, { useMemo } from 'react';
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

import { defineHashPageRoute, useHashPage } from '../../common/useHashPage';
import { AppShell } from './components/AppShell';
import annotationSourceDocument from './annotation-source.json';
import StoreAuthPage from './pages/store-auth';
import MyProductsPage from './pages/my-products';
import MyOrdersPage from './pages/my-orders';
import ClaimCenterPage from './pages/claim-center';

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

  const options = useMemo<AnnotationViewerOptions>(() => ({
    showToolbar: true,
    toolbarEdge: 'right',
    // 没有 marker 节点时运行时不会挂载，目录和文档入口需要靠该选项激活面板
    emptyWhenNoData: true,
    currentPageId: page,
    onDirectoryRoute: (node: AnnotationDirectoryRouteNode) => {
      if (typeof node.route === 'string') setPage(node.route);
    },
  }), [page, setPage]);

  return (
    <div className="si-page">
      {page === 'my-products' ? (
        <AppShell breadcrumb={['商品', '商品管理', '我的商品']} activeNav="商品" cardClassName="sip-card">
          <MyProductsPage />
        </AppShell>
      ) : page === 'my-orders' ? (
        <AppShell breadcrumb={['交易', '订单管理', '我的订单']} activeNav="交易" cardClassName="sip-card">
          <MyOrdersPage />
        </AppShell>
      ) : page === 'claim-center' ? (
        <AppShell breadcrumb={['商品', '商品管理', '认领中心']} activeNav="商品" cardClassName="cc-card">
          <ClaimCenterPage />
        </AppShell>
      ) : (
        <AppShell breadcrumb={['系统', '店铺', '店铺授权']}>
          <StoreAuthPage />
        </AppShell>
      )}
      <AnnotationViewer
        source={annotationSourceDocument as unknown as AnnotationSourceDocument}
        options={options}
      />
    </div>
  );
}