/**
 * @name 骆驼队长 ERP · 全站原型
 */

import React, { useEffect, useMemo, useRef } from 'react';
import { AnnotationViewer } from '@axhub/annotation';
import type {
  AnnotationDirectoryRouteNode,
  AnnotationSourceDocument,
  AnnotationViewerOptions,
} from '@axhub/annotation';
import './style.css';
import { defineHashPageRoute, useHashPage } from '../../common/useHashPage';
import annotationSourceDocument from './annotation-source.json';
import { LIVE_SNAPSHOTS, type LiveSnapshot } from './data/live';
import { CAPTURED_DIALOGS } from './data/live/dialogs';
import collectTabHtml from './data/live/collect-tabs.json';
import autoEditOpsHtml from './data/live/auto-edit-ops.json';
import homeTrendCardImage from './data/live/assets/home-trend-card-full.png';
import homeProductRankingImage from './data/live/assets/home-product-ranking.png';
import iconSprite from './data/live/assets/icon-sprite.svg?raw';
import dateRangePanelHtml from './data/live/assets/date-range-panel.html?raw';
import messageDetailHtml from './data/live/assets/message-detail.html?raw';
import { NAV_PAGES } from './data/navigation';

const ROUTE = defineHashPageRoute(
  [
    { id: 'home', title: '首页', group: '首页' },
    { id: 'commodity-collect', title: '商品采集', group: '商品' },
    { id: 'commodity-claim', title: '认领中心', group: '商品' },
    { id: 'commodity-my-products', title: '我的商品', group: '商品' },
    { id: 'commodity-distribute', title: '分发中心', group: '商品' },
    { id: 'config-new-arrival-price', title: '上新价模板配置', group: '商品' },
    { id: 'config-pricing', title: '渠道定价配置', group: '商品' },
    { id: 'config-store-template', title: '店铺模板配置', group: '商品' },
    { id: 'trade-my-order', title: '我的订单', group: '交易' },
    { id: 'trade-labeling', title: '自动打标配置', group: '交易' },
    { id: 'procurement-tracking', title: '采购单跟踪', group: '采购' },
    { id: 'procurement-inbound-outbound', title: '出入库管理', group: '采购' },
    { id: 'procurement-exception', title: '出库异常', group: '采购' },
    { id: 'procurement-supplier', title: '供应商管理', group: '采购' },
    { id: 'procurement-receipt', title: '收货地址管理', group: '采购' },
    { id: 'logistics-provider', title: '物流商管理', group: '物流' },
    { id: 'logistics-international', title: '国际物流轨迹跟踪', group: '物流' },
    { id: 'logistics-address', title: '常用地址管理', group: '物流' },
    { id: 'report-order-detail', title: '订单明细报表', group: '报表' },
    { id: 'report-shop-sign', title: '店铺看板', group: '报表' },
    { id: 'report-crawler-account', title: '账号配置', group: '报表' },
    { id: 'system-dept', title: '部门管理', group: '系统' },
    { id: 'system-role', title: '角色管理', group: '系统' },
    { id: 'system-sub-account', title: '子账号管理', group: '系统' },
    { id: 'system-store-auth', title: '店铺授权', group: '系统' },
    { id: 'system-purchase-account-auth', title: '采购账号授权', group: '系统' },
    { id: 'system-approval', title: '审批流', group: '系统' },
    { id: 'system-oper-log', title: '操作日志', group: '系统' },
    { id: 'system-help-admin', title: '帮助中心', group: '系统' },
    { id: 'toolbox-last-mile', title: '尾程签收凭证查询', group: '工具箱' },
    { id: 'toolbox-postal-code', title: '地址邮编校验', group: '工具箱' },
    { id: 'toolbox-exchange-rate', title: '汇率', group: '工具箱' },
    { id: 'toolbox-quality', title: '商品信息质量检测', group: '工具箱' },
    { id: 'service-online-cs', title: '即时咨询', group: '即时咨询' },
    { id: 'service-in-site-message', title: '站内信', group: '即时咨询' },
    { id: 'account-personal-center', title: '个人中心', group: '个人中心' },
    { id: 'account-member-center', title: '会员中心', group: '个人中心' },
    { id: 'account-orders', title: '订单中心', group: '个人中心' },
    { id: 'account-distribution', title: '分销中心', group: '个人中心' },
  ],
  { defaultPageId: 'home' },
);

const TOP_NAV_DEFAULT: Record<string, string> = {
  首页: 'home',
  商品: 'commodity-my-products',
  交易: 'trade-my-order',
  采购: 'procurement-tracking',
  物流: 'logistics-provider',
  报表: 'report-shop-sign',
  系统: 'system-dept',
  工具箱: 'toolbox-quality',
  即时咨询: 'service-online-cs',
};

const TITLE_TO_PAGE = new Map(NAV_PAGES.map((page) => [page.title, page.id]));
const PATH_TO_PAGE = new Map(NAV_PAGES.filter((page) => page.path).map((page) => [page.path, page.id]));

const TAB_ALIASES: Record<string, string> = {
  商品采集: 'commodity-collect',
  认领中心: 'commodity-claim',
  我的商品: 'commodity-my-products',
  基础资料: 'account-personal-center',
  个人中心: 'account-personal-center',
};

const ROW_ACTIONS: Record<string, string[]> = {
  'commodity-my-products': ['编辑', '更新发布', '标签', '删除', 'AI一键克隆'],
  'commodity-claim': ['编辑', '认领', '标签', '删除'],
  'config-new-arrival-price': ['查看', '编辑', '删除'],
  'config-pricing': ['查看', '编辑', '删除'],
  'config-store-template': ['同步平台'],
  'logistics-international': ['手动同步', '查看轨迹'],
  'logistics-address': ['编辑', '删除'],
  'procurement-exception': ['编辑'],
  'procurement-receipt': ['编辑', '删除'],
  'procurement-supplier': ['编辑', '重置密码'],
  'procurement-tracking': ['编辑', '出库', '付款', '作废', '入库', '同步', '物流轨迹'],
  'system-dept': ['修改', '新增', '删除'],
  'system-role': ['修改'],
  'system-sub-account': ['修改', '删除', '重置密码'],
  'system-store-auth': ['重新授权', '修改', '删除'],
  'system-purchase-account-auth': ['重新授权', '修改', '删除'],
  'toolbox-exchange-rate': ['修改', '查看走势'],
  'trade-labeling': ['修改', '禁用', '执行'],
  'trade-my-order': ['线路审核', '查看订单', '标记', '拆包', '作废', '删除'],
};

const BATCH_ACTIONS: Record<string, string[]> = {
  'commodity-my-products': ['批量编辑', '批量更新发布', '批量标签', '批量删除', '批量AI克隆'],
  'commodity-claim': ['编辑货源', '批量认领', '批量标签', '批量删除'],
};

const DIALOG_ALIASES: Record<string, Record<string, string>> = {
  'config-new-arrival-price': { 新增: '新增上新价配置', 新增模板: '新增上新价配置' },
  'trade-labeling': { 新增: '新增自动打标规则配置', 新增规则: '新增自动打标规则配置' },
  'commodity-claim': { 导入产品: '导入产品' },
  'commodity-collect': { 下载安装浏览器插件: '安装浏览器插件' },
  'commodity-my-products': { 导出: '统一导出', 导入货源: '导入货源', 同步线上: '同步线上', 批量查找: '批量查找' },
  'report-order-detail': { 导出: '统一导出', 设置: '列表设置' },
  'report-shop-sign': { 处罚通知: '处罚通知详情', 趋势: '查看趋势图' },
  'system-store-auth': { 分组管理: '店铺分组管理', 店铺分组: '店铺分组管理' },
  'toolbox-exchange-rate': { 修改汇率: '修改汇率', 走势: '汇率走势' },
  'procurement-tracking': { 导出: '统一导出' },
  'logistics-international': { 导出: '统一导出' },
  'trade-my-order': { 导出: '统一导出' },
};

const VALUE_FIXES: Record<string, Array<{ selector: string; value: string }>> = {
  'account-personal-center': [
    { selector: '.el-input__inner[disabled]', value: 'ceshi' },
    { selector: '.el-input__inner[placeholder="请输入用户昵称"]', value: '吃的请问' },
    { selector: '.el-input__inner[placeholder="请输入手机号码"]', value: '19168838157' },
    { selector: '.el-input__inner[placeholder="请输入邮箱地址"]', value: '123456789@qq.com' },
  ],
};

const CLOSE_TEXTS = ['取消', '关闭', '关 闭', '取 消'];
const SUBMIT_TEXTS = ['确定', '保存', '提交', '确认', '发布', '保存并发布'];

function dialogTitle(wrapper: Element) {
  return (
    wrapper.querySelector('.el-dialog__title, .el-drawer__title, .el-message-box__title')?.textContent?.trim()
    || wrapper.querySelector('[role="dialog"]')?.getAttribute('aria-label')
    || ''
  );
}

function dialogHasContent(wrapper: Element) {
  const body = wrapper.querySelector('.el-dialog__body, .el-drawer__body');
  if (body) {
    if ((body.textContent || '').trim().length > 0) return true;
    if (body.querySelector('input, textarea, select, img, table, .el-checkbox, .el-radio, .el-switch, .el-tree')) return true;
  }
  const dialog = wrapper.querySelector('.el-dialog, .el-drawer');
  if (!dialog) return false;
  return Array.from(dialog.children).some((child) => {
    if (child.classList.contains('el-dialog__header') || child.classList.contains('el-dialog__footer')) return false;
    if ((child.textContent || '').trim().length > 0) return true;
    return Boolean(child.querySelector('input, textarea, select, img, table, .el-checkbox, .el-radio, .el-switch, .el-tree'));
  });
}

function syncClaimStoreSelection(dialog: HTMLElement) {
  const cards = Array.from(dialog.querySelectorAll<HTMLElement>('.store-card'));
  const selected = cards.filter((card) => card.classList.contains('is-selected')).length;
  cards.forEach((card) => {
    const box = card.querySelector<HTMLElement>('.store-card__checkbox');
    if (!box) return;
    box.innerHTML = card.classList.contains('is-selected') ? '<i class="el-icon-check"></i>' : '';
  });
  dialog.querySelectorAll<HTMLElement>('.field-sub').forEach((el) => {
    el.textContent = (el.textContent || '').replace(/已选择\d+个店铺/, `已选择${selected}个店铺`);
  });
  dialog.querySelectorAll<HTMLElement>('.footer-status').forEach((el) => {
    el.textContent = (el.textContent || '').replace(/已选\d+个店铺/, `已选${selected}个店铺`);
  });
  const allBox = dialog.querySelector<HTMLElement>('.select-all__box');
  if (allBox) allBox.innerHTML = cards.length > 0 && selected === cards.length ? '<i class="el-icon-check"></i>' : '';
  dialog.querySelectorAll<HTMLElement>('.footer-hint').forEach((el) => {
    if (selected === 0) {
      el.textContent = '请至少选择 1 个店铺';
      el.classList.add('is-warn');
    } else {
      el.textContent = '请选择认领方式';
      el.classList.remove('is-warn');
    }
  });
  dialog.querySelectorAll<HTMLButtonElement>('.select-footer .btn-direct, .select-footer .btn-auto-edit').forEach((button) => {
    button.disabled = selected === 0;
    button.classList.toggle('is-disabled', selected === 0);
  });
}

function closeLiveDialogs() {
  document.querySelectorAll('[data-live-dialog="1"], [data-live-dialog-mask="1"]').forEach((item) => item.remove());
}

const dialogVariantStore = new WeakMap<HTMLElement, Record<string, string>>();

function bindDialogEvents(node: HTMLElement) {
  let dialogSelect: HTMLElement | null = null;
  const variants = dialogVariantStore.get(node);

  const closeDialogSelect = () => {
    if (dialogSelect) {
      dialogSelect.style.display = 'none';
      dialogSelect.style.position = '';
      dialogSelect.style.left = '';
      dialogSelect.style.top = '';
      dialogSelect.style.width = '';
      dialogSelect.style.zIndex = '';
    }
    dialogSelect = null;
  };

  node.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const button = target.closest('button');
    const text = normalizeText(button?.textContent || '');
    if (dialogSelect && !target.closest('.el-select') && !dialogSelect.contains(target)) closeDialogSelect();
    if (target === node || target.closest('.el-dialog__headerbtn, .el-message-box__headerbtn, .ann-dialog-close, .auto-edit-header-close')) {
      event.preventDefault();
      closeLiveDialogs();
      return;
    }
    if (button && CLOSE_TEXTS.includes(text)) {
      event.preventDefault();
      closeLiveDialogs();
      return;
    }
    if (button && SUBMIT_TEXTS.some((item) => text.includes(item))) {
      event.preventDefault();
      if (node.querySelector('.el-message-box')) {
        closeLiveDialogs();
        showLiveMessage('操作成功');
      } else {
        showLiveMessage(`${text}（演示环境不会提交）`);
      }
      return;
    }
    const storeCard = target.closest('.store-card') as HTMLElement | null;
    if (storeCard) {
      event.preventDefault();
      event.stopPropagation();
      storeCard.classList.toggle('is-selected');
      syncClaimStoreSelection(node);
      return;
    }
    const selectAllStores = target.closest('.select-all') as HTMLElement | null;
    if (selectAllStores) {
      event.preventDefault();
      event.stopPropagation();
      const cards = Array.from(node.querySelectorAll<HTMLElement>('.store-card'));
      const allSelected = cards.length > 0 && cards.every((card) => card.classList.contains('is-selected'));
      cards.forEach((card) => card.classList.toggle('is-selected', !allSelected));
      syncClaimStoreSelection(node);
      return;
    }
    if (button && !button.disabled && text === '自动编辑'
      && openCapturedDialog('commodity-claim', '自动编辑', 'toolbar')) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    const processChip = target.closest('.process-ops-btn') as HTMLElement | null;
    if (processChip) {
      event.preventDefault();
      event.stopPropagation();
      const panel = processChip.closest('.process-ops-panel') as HTMLElement | null;
      if (panel) toggleProcessOp(panel, normalizeText(processChip.textContent || ''));
      return;
    }
    const processCardClose = target.closest('.process-op-card-close') as HTMLElement | null;
    if (processCardClose) {
      event.preventDefault();
      event.stopPropagation();
      const card = processCardClose.closest('.process-op-card') as HTMLElement | null;
      const panel = card?.closest('.process-ops-panel') as HTMLElement | null;
      const label = normalizeText(card?.querySelector('.process-op-card-side')?.textContent || '');
      panel?.querySelectorAll<HTMLElement>('.process-ops-btn').forEach((chip) => {
        if (normalizeText(chip.textContent || '') === label) chip.classList.remove('active');
      });
      if (panel) applyProcessOps(panel);
      return;
    }
    const stepButton = target.closest('.el-input-number__increase, .el-input-number__decrease') as HTMLElement | null;
    if (stepButton) {
      event.preventDefault();
      event.stopPropagation();
      const number = stepButton.closest('.el-input-number');
      const input = number?.querySelector<HTMLInputElement>('input');
      if (input) {
        const step = Number(number?.getAttribute('step') || input.getAttribute('step') || '1') || 1;
        const min = Number(input.getAttribute('min') || '-Infinity');
        const max = Number(input.getAttribute('max') || 'Infinity');
        let value = Number(input.value);
        if (!Number.isFinite(value)) value = 0;
        value = stepButton.classList.contains('el-input-number__increase') ? value + step : value - step;
        if (Number.isFinite(min)) value = Math.max(min, value);
        if (Number.isFinite(max)) value = Math.min(max, value);
        value = Math.round(value * 100) / 100;
        input.value = String(value);
        input.setAttribute('aria-valuenow', String(value));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
      return;
    }
    if (button && !button.disabled && (text === '创建模板' || text === '管理模板')
      && openCapturedDialog('commodity-claim', text, 'toolbar')) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    const categoryLink = target.closest('.el-link') as HTMLElement | null;
    if (categoryLink && normalizeText(categoryLink.textContent || '') === '选择类目') {
      event.preventDefault();
      event.stopPropagation();
      showLiveMessage('类目选择（演示）');
      return;
    }
    const variantItem = target.closest('.product-form-top-tab, .el-menu-item, .sidebar-item.category-item, .ann-dialog-tab') as HTMLElement | null;
    if (variants && variantItem) {
      const label = normalizeText(
        variantItem.classList.contains('sidebar-item')
          ? (variantItem.querySelector('.category-name')?.textContent || '')
          : (variantItem.textContent || ''),
      );
      const html = variants[label];
      if (html) {
        event.preventDefault();
        event.stopPropagation();
        showCapturedDialog(html, variants);
        return;
      }
    }
    const option = target.closest('.el-select-dropdown__item') as HTMLElement | null;
    if (option && dialogSelect && dialogSelect.contains(option)) {
      const value = (option.textContent || '').trim();
      dialogSelect.querySelectorAll('.el-select-dropdown__item').forEach((item) => item.classList.remove('selected'));
      option.classList.add('selected');
      const owner = dialogSelect.closest('.el-select') || dialogSelect.parentElement?.closest('.el-select');
      const input = owner?.querySelector<HTMLInputElement>('.el-input__inner');
      if (input) input.value = value;
      closeDialogSelect();
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    const select = target.closest('.el-select') as HTMLElement | null;
    if (select && !target.closest('.el-select-dropdown')) {
      const dropdown = select.querySelector<HTMLElement>('.el-select-dropdown');
      if (dropdown) {
        event.preventDefault();
        event.stopPropagation();
        if (dialogSelect === dropdown) {
          closeDialogSelect();
          return;
        }
        closeDialogSelect();
        dialogSelect = dropdown;
        const rect = select.getBoundingClientRect();
        dropdown.style.display = 'block';
        dropdown.style.position = 'fixed';
        dropdown.style.left = `${rect.left}px`;
        dropdown.style.top = `${rect.bottom + 4}px`;
        dropdown.style.width = `${Math.max(rect.width, 140)}px`;
        dropdown.style.zIndex = '3200';
        return;
      }
    }
    const tab = target.closest('.el-tabs__item') as HTMLElement | null;
    if (tab) {
      const tabs = tab.closest('.el-tabs');
      if (tabs) {
        event.preventDefault();
        event.stopPropagation();
        tabs.querySelectorAll('.el-tabs__item').forEach((item) => item.classList.remove('is-active'));
        tab.classList.add('is-active');
        const paneId = tab.getAttribute('aria-controls');
        tabs.querySelectorAll<HTMLElement>('.el-tab-pane').forEach((pane) => {
          pane.style.display = pane.id === paneId ? '' : 'none';
        });
        return;
      }
    }
    const treeContent = target.closest('.el-tree-node__content') as HTMLElement | null;
    if (treeContent) {
      const expandIcon = target.closest('.el-tree-node__expand-icon') as HTMLElement | null;
      if (expandIcon) {
        const treeNode = expandIcon.closest('.el-tree-node') as HTMLElement | null;
        const expanded = treeNode?.classList.toggle('is-expanded');
        expandIcon.classList.toggle('expanded', Boolean(expanded));
        const children = treeNode?.querySelector<HTMLElement>('.el-tree-node__children');
        if (children) children.style.display = expanded ? '' : 'none';
      } else {
        const tree = treeContent.closest('.el-tree');
        tree?.querySelectorAll('.el-tree-node__content').forEach((item) => item.classList.remove('is-current'));
        treeContent.classList.add('is-current');
      }
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    const switchElement = target.closest('.el-switch') as HTMLElement | null;
    if (switchElement && !switchElement.classList.contains('is-disabled')) {
      event.preventDefault();
      event.stopPropagation();
      switchElement.classList.toggle('is-checked');
      return;
    }
    const radioButtonElement = target.closest('.el-radio-button') as HTMLElement | null;
    if (radioButtonElement && !radioButtonElement.classList.contains('is-disabled')) {
      event.preventDefault();
      event.stopPropagation();
      const group = radioButtonElement.closest('.el-radio-group');
      group?.querySelectorAll('.el-radio-button').forEach((item) => {
        item.classList.remove('is-active');
        const input = item.querySelector<HTMLInputElement>('input');
        if (input) input.checked = false;
      });
      radioButtonElement.classList.add('is-active');
      const input = radioButtonElement.querySelector<HTMLInputElement>('input');
      if (input) input.checked = true;
      return;
    }
    const radioElement = target.closest('.el-radio') as HTMLElement | null;
    if (radioElement && !radioElement.classList.contains('is-disabled')) {
      event.preventDefault();
      event.stopPropagation();
      radioElement.closest('.el-radio-group')?.querySelectorAll('.el-radio').forEach((item) => setRadioState(item, false));
      setRadioState(radioElement, true);
      return;
    }
    if (button && !button.disabled) {
      showLiveMessage(`${text || '操作'}（演示）`);
    }
  });

  node.addEventListener('change', (event) => {
    const target = event.target as HTMLElement;
    if (target instanceof HTMLInputElement && target.classList.contains('el-checkbox__original')) {
      setCheckboxState(target, target.checked);
    }
  });
}

function showDialogNode(node: HTMLElement, variants?: Record<string, string>) {
  closeLiveDialogs();
  if (variants) {
    const normalized: Record<string, string> = {};
    Object.entries(variants).forEach(([key, value]) => {
      normalized[normalizeText(key)] = value;
    });
    dialogVariantStore.set(node, normalized);
  }
  const mask = document.createElement('div');
  mask.setAttribute('data-live-dialog-mask', '1');
  mask.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:2999;';
  mask.addEventListener('click', closeLiveDialogs);
  node.setAttribute('data-live-dialog', '1');
  node.style.display = 'block';
  node.style.background = 'transparent';
  node.style.zIndex = '3000';
  bindDialogEvents(node);
  document.body.appendChild(mask);
  document.body.appendChild(node);
}

function showLiveDialog(root: HTMLElement, dialog: Element) {
  showDialogNode(dialog.cloneNode(true) as HTMLElement);
}

function showCapturedDialog(html: string, variants?: Record<string, string>) {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  const node = template.content.firstElementChild as HTMLElement | null;
  if (!node) return false;
  showDialogNode(node, variants);
  return true;
}

function openCapturedVariant(slug: string, trigger: string, variant: string) {
  const list = CAPTURED_DIALOGS[slug] || [];
  const target = list.find((item) => normalizeText(item.trigger) === normalizeText(trigger));
  if (!target?.variants) return false;
  const key = Object.keys(target.variants).find((item) => normalizeText(item) === normalizeText(variant));
  const html = key ? target.variants[key] : '';
  if (!html) return false;
  return showCapturedDialog(html, target.variants);
}

const DIALOG_FALLBACK_SLUGS: Record<string, string[]> = {
  'commodity-claim': ['commodity-my-products'],
  'commodity-distribute': ['commodity-my-products'],
};

function openCapturedDialog(slug: string, text: string, context: string) {
  const normalized = normalizeText(text);
  if (!normalized) return false;
  const slugs = [slug, ...(DIALOG_FALLBACK_SLUGS[slug] || [])];
  for (const current of slugs) {
    const candidates = (CAPTURED_DIALOGS[current] || []).filter((item) => {
      const trigger = normalizeText(item.trigger);
      return trigger === normalized || trigger.includes(normalized) || normalized.includes(trigger);
    });
    const target = candidates.find((item) => item.context === context) || candidates[0];
    if (target) return showCapturedDialog(target.html, target.variants);
  }
  return false;
}

const CARD_OVERLAYS: Record<string, Array<{ selector: string; src: string; top: number }>> = {
  home: [
    { selector: '.trend-card', src: homeTrendCardImage, top: 0 },
    { selector: '.ranking-card:last-child', src: homeProductRankingImage, top: 0 },
  ],
};

function initLiveFormValues(root: HTMLElement, slug: string) {
  root.querySelectorAll('[data-live-card-overlay="1"]').forEach((item) => item.remove());
  (CARD_OVERLAYS[slug] || []).forEach((overlay) => {
    const card = root.querySelector(overlay.selector) as HTMLElement | null;
    if (!card) return;
    card.style.position = 'relative';
    const wrapper = document.createElement('div');
    wrapper.setAttribute('data-live-card-overlay', '1');
    wrapper.style.cssText = 'position:absolute;inset:-1px;z-index:9;pointer-events:none;border-radius:12px;overflow:hidden;';
    const image = document.createElement('img');
    image.src = overlay.src;
    image.style.cssText = 'width:100%;height:100%;object-fit:fill;display:block;';
    wrapper.appendChild(image);
    card.appendChild(wrapper);
  });
  root.querySelectorAll('.el-select').forEach((select) => {
    const selected = select.querySelector('.el-select-dropdown__item.selected');
    const input = select.querySelector<HTMLInputElement>('.el-input__inner');
    if (selected && input && !input.value) {
      input.value = (selected.textContent || '').trim();
    }
  });
  (VALUE_FIXES[slug] || []).forEach((fix) => {
    const input = root.querySelector<HTMLInputElement>(fix.selector);
    if (input && !input.value) input.value = fix.value;
  });
}

function handleInboundWorkbench(root: HTMLElement, snapshot: LiveSnapshot, target: HTMLElement) {
  if (snapshot.slug !== 'procurement-inbound-outbound') return false;
  const scanPhase = root.querySelector('.scan-wrap');
  if (scanPhase) {
    const button = target.closest('button');
    const text = normalizeText(button?.textContent || '');
    if (text === '返回') {
      root.innerHTML = snapshot.appHtml;
      initLiveFormValues(root, snapshot.slug);
      return true;
    }
    if (text.includes('扫描')) {
      showLiveMessage('演示环境不会提交出入库');
      return true;
    }
    return false;
  }
  const radio = target.closest('.el-radio') as HTMLElement | null;
  if (radio) {
    const group = radio.closest('.el-radio-group');
    group?.querySelectorAll('.el-radio').forEach((item) => item.classList.remove('is-checked'));
    radio.classList.add('is-checked');
    const input = radio.querySelector('input');
    if (input) input.checked = true;
    const formItem = radio.closest('.el-form-item');
    const label = normalizeText(formItem?.querySelector('.el-form-item__label')?.textContent || '');
    if (label === '类型') {
      const modeItem = Array.from(root.querySelectorAll('.el-form-item')).find(
        (item) => normalizeText(item.querySelector('.el-form-item__label')?.textContent || '') === '入库方式',
      ) as HTMLElement | undefined;
      if (modeItem) modeItem.style.display = normalizeText(radio.textContent || '') === '出库' ? 'none' : '';
    }
    return true;
  }
  const button = target.closest('button');
  if (button && normalizeText(button.textContent || '') === '开始作业') {
    const typeItem = Array.from(root.querySelectorAll('.el-form-item')).find(
      (item) => normalizeText(item.querySelector('.el-form-item__label')?.textContent || '') === '类型',
    );
    const selected = typeItem?.querySelector('.el-radio.is-checked')?.textContent?.trim();
    const html = selected === '出库' ? snapshot.outboundScanHtml : snapshot.inboundScanHtml;
    if (html) {
      root.innerHTML = html;
      initLiveFormValues(root, snapshot.slug);
    } else {
      showLiveMessage('该作业页尚未抓取');
    }
    return true;
  }
  return false;
}

function orderStatusTabLabel(root: HTMLElement) {
  const tab = root.querySelector('.order-status-tab.is-active');
  return normalizeText(tab?.textContent || '').replace(/\(\d+\)$/u, '');
}

function snapshotPageHtml(snapshot: LiveSnapshot, pageNumber: number) {
  if (pageNumber === 1) return snapshot.appHtml;
  if (pageNumber === 2) return snapshot.page2Html || '';
  if (pageNumber === 3) return snapshot.page3Html || '';
  return '';
}

function openMatchingDialog(root: HTMLElement, slug: string, text: string) {
  const normalized = normalizeText(text);
  if (!normalized || ['搜索', '重置', '刷新', '排序', '高级筛选', '展开', '收起', '清空链接'].includes(normalized)) return false;
  const alias = DIALOG_ALIASES[slug]?.[normalized] || normalized;
  const wrappers = Array.from(root.querySelectorAll('.el-dialog__wrapper, .el-drawer__wrapper'));
  const target = wrappers.find((wrapper) => {
    const title = dialogTitle(wrapper);
    return Boolean(title && (title.includes(alias) || alias.includes(title)) && dialogHasContent(wrapper));
  });
  if (!target) return false;
  showLiveDialog(root, target);
  return true;
}

function showLiveMessage(text: string) {
  const message = document.createElement('div');
  message.className = 'el-message el-message--success';
  message.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:99999;';
  message.innerHTML = `<i class="el-message__icon el-icon-success"></i><p class="el-message__content">${text}</p>`;
  document.body.appendChild(message);
  window.setTimeout(() => message.remove(), 2200);
}

const ROW_STATUS_PATTERN = /未认领|已认领|启用|禁用|待处理|已处理|成功|失败|已同步|未同步|待付款|已付款|待发货|已发货|运输中|已妥投|未查询|已作废|有效|无效|未开始|进行中|已完成|待审核|已审核|采集中|已采集/;

function showConfirmDialog(title: string, message: string, onConfirm: () => void) {
  const mask = document.createElement('div');
  mask.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:3199;';
  const wrapper = document.createElement('div');
  wrapper.className = 'el-message-box__wrapper';
  wrapper.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;z-index:3200;';
  wrapper.innerHTML = `<div role="dialog" aria-modal="true" class="el-message-box" style="width:420px;">
    <div class="el-message-box__header"><div class="el-message-box__title">${title}</div><button type="button" class="el-message-box__headerbtn"><i class="el-icon el-icon-close"></i></button></div>
    <div class="el-message-box__content"><div class="el-message-box__message"><p>${message}</p></div></div>
    <div class="el-message-box__btns"><button type="button" class="el-button el-button--default el-button--small" data-demo-cancel="1"><span>取消</span></button><button type="button" class="el-button el-button--primary el-button--small" data-demo-confirm="1"><span>确定</span></button></div>
  </div>`;
  const close = () => { mask.remove(); wrapper.remove(); };
  mask.addEventListener('click', close);
  wrapper.querySelector('.el-message-box__headerbtn')?.addEventListener('click', close);
  wrapper.querySelector('[data-demo-cancel]')?.addEventListener('click', close);
  wrapper.querySelector('[data-demo-confirm]')?.addEventListener('click', () => {
    close();
    onConfirm();
  });
  document.body.append(mask, wrapper);
}

function downloadTextFile(name: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

function tableRows(root: HTMLElement) {
  return Array.from(root.querySelectorAll<HTMLElement>('.el-table__body-wrapper tbody tr.el-table__row'));
}

function selectedTableRows(root: HTMLElement) {
  return tableRows(root).filter((row) => row.querySelector('input.el-checkbox__original:checked'));
}

function sourceRowOf(trigger: HTMLElement) {
  const expanded = trigger.closest('tr');
  const previous = expanded?.previousElementSibling;
  return previous instanceof HTMLElement && previous.classList.contains('el-table__row') ? previous : null;
}

function setRowStatus(row: HTMLElement, text: string) {
  const cell = Array.from(row.querySelectorAll<HTMLElement>('td')).find((td) => ROW_STATUS_PATTERN.test(td.innerText || ''));
  if (cell) cell.textContent = text;
}

function applyLocalSearch(root: HTMLElement) {
  const values = Array.from(root.querySelectorAll<HTMLInputElement>('.app-main input:not([type="checkbox"]):not([type="radio"])'))
    .filter((input) => input.offsetParent !== null && !input.readOnly && input.value.trim())
    .map((input) => input.value.trim().toLowerCase());
  let count = 0;
  tableRows(root).forEach((row) => {
    const text = (row.innerText || '').toLowerCase();
    const matched = values.every((value) => text.includes(value));
    row.style.display = matched ? '' : 'none';
    if (matched) count += 1;
  });
  showLiveMessage(`筛选完成，共 ${count} 条`);
}

function resetLocalSearch(root: HTMLElement) {
  tableRows(root).forEach((row) => { row.style.display = ''; });
  showLiveMessage('已重置筛选条件');
}

function sortCurrentTable(root: HTMLElement) {
  const table = root.querySelector<HTMLElement>('.el-table');
  const rows = tableRows(root);
  if (!table || rows.length < 2) {
    showLiveMessage('当前没有可排序的数据');
    return;
  }
  const descending = table.dataset.demoSort !== 'desc';
  const numericColumn = rows[0].querySelectorAll('td').length > 2 ? 2 : 1;
  rows.sort((left, right) => {
    const leftText = (left.children[numericColumn]?.textContent || '').trim();
    const rightText = (right.children[numericColumn]?.textContent || '').trim();
    const leftNumber = Number(leftText.replace(/[^\d.-]/g, ''));
    const rightNumber = Number(rightText.replace(/[^\d.-]/g, ''));
    const result = Number.isFinite(leftNumber) && Number.isFinite(rightNumber) && leftText && rightText
      ? leftNumber - rightNumber
      : leftText.localeCompare(rightText, 'zh-CN', { numeric: true });
    return descending ? -result : result;
  });
  const tbody = rows[0].parentElement;
  rows.forEach((row) => tbody?.appendChild(row));
  table.dataset.demoSort = descending ? 'desc' : 'asc';
  showLiveMessage(descending ? '已按当前列降序排序' : '已按当前列升序排序');
}

function filterRowsByLabel(root: HTMLElement, label: string) {
  const text = normalizeText(label);
  const aliases: Record<string, string> = {
    敦煌线上物流: 'Dhgate线上物流',
    '敦煌线上物流2.0': 'Dhgate线上物流2.0',
    华磊: '达智仓',
  };
  const keyword = aliases[text] || label;
  let count = 0;
  tableRows(root).forEach((row) => {
    const matched = text === '全部' || (row.innerText || '').includes(keyword);
    row.style.display = matched ? '' : 'none';
    if (matched) count += 1;
  });
  return count;
}

function exportCurrentTable(root: HTMLElement, slug: string) {
  const headers = Array.from(root.querySelectorAll('.el-table__header-wrapper th')).map((th) => (th.textContent || '').replace(/\s+/g, ' ').trim()).filter(Boolean);
  const rows = tableRows(root).filter((row) => row.style.display !== 'none').map((row) => Array.from(row.querySelectorAll('td')).map((td) => (td.innerText || '').replace(/\s+/g, ' ').trim()));
  const content = [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))].join('\n');
  downloadTextFile(`${slug}-导出.csv`, content);
  showLiveMessage(`已导出 ${rows.length} 条数据`);
}

function handleLocalAction(root: HTMLElement, slug: string, label: string, trigger: HTMLElement, scope: 'toolbar' | 'row' | 'batch') {
  const text = normalizeText(label);
  const rows = scope === 'batch' ? selectedTableRows(root) : scope === 'row' ? [sourceRowOf(trigger)].filter((row): row is HTMLElement => Boolean(row)) : [];

  if (trigger.classList.contains('provider-filter-btn') || trigger.classList.contains('international-node-btn')) {
    const group = trigger.parentElement;
    group?.querySelectorAll<HTMLElement>('.provider-filter-btn, .international-node-btn').forEach((chip) => {
      const active = chip === trigger;
      chip.classList.toggle('el-button--primary', active);
      chip.classList.toggle('el-button--default', !active);
      chip.classList.toggle('is-plain', !active);
    });
    const count = filterRowsByLabel(root, label);
    showLiveMessage(`已筛选：${label}（${count} 条）`);
    return true;
  }

  if (trigger.classList.contains('platform-chip')) {
    trigger.classList.toggle('is-active');
    trigger.style.borderColor = trigger.classList.contains('is-active') ? '#ff781f' : '';
    trigger.style.color = trigger.classList.contains('is-active') ? '#ff781f' : '';
    trigger.style.background = trigger.classList.contains('is-active') ? '#fff5ef' : '';
    showLiveMessage(`已选择采集平台：${label}`);
    return true;
  }

  if (['搜索', '查询'].includes(text)) {
    applyLocalSearch(root);
    return true;
  }
  if (text === '重置') {
    resetLocalSearch(root);
    return true;
  }
  if (text === '排序') {
    sortCurrentTable(root);
    return true;
  }
  if (text === '收起' || text === '展开') {
    const form = root.querySelector<HTMLElement>('.app-main form');
    if (form) {
      const collapsed = text === '收起';
      form.style.display = collapsed ? 'none' : '';
      showLiveMessage(collapsed ? '已收起筛选条件' : '已展开筛选条件');
      return true;
    }
    tableRows(root).forEach((row) => { row.style.display = ''; });
    showLiveMessage('已展开全部记录');
    return true;
  }
  if (text === '清空链接') {
    root.querySelectorAll<HTMLTextAreaElement>('.app-main textarea').forEach((textarea) => { textarea.value = ''; });
    root.querySelectorAll<HTMLElement>('.field-sub, .collect-content').forEach((node) => {
      node.textContent = (node.textContent || '').replace(/已导入\s*\d+\s*个任务链接/, '已导入 0 个任务链接');
    });
    showLiveMessage('已清空采集链接');
    return true;
  }
  if (text === '清空日志') {
    const tbody = root.querySelector('.collect-content--table .el-table__body-wrapper tbody');
    if (tbody) tbody.innerHTML = '';
    showLiveMessage('已清空采集日志');
    return true;
  }
  if (text === '清空') {
    root.querySelectorAll<HTMLInputElement>('.app-main input:not([type="checkbox"]):not([type="radio"])').forEach((input) => {
      if (!input.readOnly) input.value = '';
    });
    showLiveMessage('已清空输入内容');
    return true;
  }
  if (text === '下载模板' || text === '下载物流成本模板') {
    const name = text === '下载物流成本模板' ? '物流成本模板.csv' : slug === 'report-crawler-account' ? '账号密码导入模板.csv' : '定价模版.csv';
    downloadTextFile(name, '字段1,字段2,字段3\n示例1,示例2,示例3\n');
    showLiveMessage(`已下载 ${name}`);
    return true;
  }
  if (text === '导出') {
    exportCurrentTable(root, slug);
    return true;
  }
  if (text === '生成推广链接') {
    const link = 'https://test.kuachengjing.com/register?invite=TEST08';
    navigator.clipboard?.writeText(link).catch(() => {});
    showLiveMessage('推广链接已生成并复制');
    return true;
  }
  if (text === '开始采集') {
    const count = Array.from(root.querySelectorAll<HTMLTextAreaElement>('.app-main textarea'))
      .reduce((total, textarea) => total + textarea.value.split('\n').filter((line) => line.trim()).length, 0);
    showLiveMessage(count > 0 ? `已提交 ${count} 条采集任务` : '请先粘贴商品链接');
    return true;
  }
  if (text === '开始校验') {
    showLiveMessage('校验完成，地址与邮编匹配');
    return true;
  }
  if (text === '账号配置') {
    window.location.hash = '#page=report-crawler-account';
    return true;
  }
  if (text === '续费/升级') {
    window.location.hash = '#page=account-member-center';
    return true;
  }
  if (text === '侧边展开') {
    root.querySelector('.app-sidebar, .side-nav, .sidebar')?.classList.toggle('is-collapsed');
    showLiveMessage('侧边栏已切换');
    return true;
  }
  if (text === '保存') {
    showLiveMessage('保存成功');
    return true;
  }
  if (text === '关闭') {
    showLiveMessage('已关闭');
    return true;
  }
  if (['亚马逊', '1688', 'Temu', '速卖通', '敦煌网', 'SHEIN', '拼多多', 'Shopify'].includes(text)) {
    const count = filterRowsByLabel(root, text);
    trigger.parentElement?.querySelectorAll<HTMLButtonElement>('button').forEach((button) => {
      if (!button.querySelector('img')) return;
      const active = button === trigger;
      button.classList.toggle('el-button--primary', active);
      button.classList.toggle('el-button--default', !active);
    });
    showLiveMessage(`${label}：${count} 条记录`);
    return true;
  }
  if (text === '查询下载' || text === '服务商配置') {
    const tab = trigger.closest('.lm-tab') as HTMLElement | null;
    if (tab) {
      const container = tab.closest('.lm-tabs');
      container?.querySelectorAll('.lm-tab').forEach((item) => item.classList.toggle('active', item === tab));
      root.querySelectorAll<HTMLElement>('.query-tab, .config-tab').forEach((panel) => {
        panel.style.display = panel.classList.contains(text === '查询下载' ? 'query-tab' : 'config-tab') ? '' : 'none';
      });
      return true;
    }
  }
  if (text === '查询下载') {
    const input = root.querySelector<HTMLInputElement>('.app-main input');
    downloadTextFile('尾程查询结果.txt', `运单号：${input?.value || '42022172927480278065409999999999'}\n状态：已妥投\n`);
    showLiveMessage('查询结果已下载');
    return true;
  }

  const confirmMessages: Record<string, string> = {
    删除: '确认删除所选记录吗？',
    作废: '确认作废该记录吗？',
    禁用: '确认禁用吗？',
    停用: '确认停用吗？',
    重新授权: '确认重新授权吗？',
    重置密码: '确认重置密码吗？',
  };
  if (confirmMessages[text]) {
    showConfirmDialog('提示', confirmMessages[text], () => {
      if (text === '删除') {
        rows.forEach((row) => {
          const expanded = row.nextElementSibling;
          if (expanded?.classList.contains('el-table__expanded-row')) expanded.remove();
          row.remove();
        });
        showLiveMessage('删除成功');
        return;
      }
      const status = text === '作废' ? '已作废' : text === '禁用' || text === '停用' ? '已禁用' : '';
      rows.forEach((row) => { if (status) setRowStatus(row, status); });
      showLiveMessage(text === '重新授权' ? '授权已更新' : text === '重置密码' ? '密码已重置' : `${text}成功`);
    });
    return true;
  }

  if (['同步', '同步平台', '同步店铺订单', '同步订单详情', '手动同步', '同步1688地址', '一键出库', '提交到平台', '出库', '入库', '付款', '打印', '修改物流渠道', '拆包'].includes(text)) {
    const targetRows = rows.length > 0 ? rows : tableRows(root).slice(0, 1);
    window.setTimeout(() => {
      const status = text.includes('出库') ? '已出库' : text === '入库' ? '已入库' : text === '付款' ? '已付款' : text === '作废' ? '已作废' : '已同步';
      targetRows.forEach((row) => setRowStatus(row, status));
      showLiveMessage(`${text}成功`);
    }, 500);
    showLiveMessage(`正在${text}…`);
    return true;
  }

  return false;
}

function actionButtonsMarkup(labels: string[]) {
  return labels
    .map((label) => `<button type="button" class="el-button el-button--default el-button--mini"><span>${label}</span></button>`)
    .join('');
}

function updateBatchBar(root: HTMLElement, slug: string) {
  const selected = root.querySelectorAll('.el-table__body-wrapper .el-table__row input.el-checkbox__original:checked').length;
  const labels = BATCH_ACTIONS[slug] || [];
  if (labels.length > 0) {
    root.querySelectorAll('.table-footer__actions').forEach((container) => {
      if (selected > 0) {
        container.innerHTML = `<span class="table-footer__selected">已选 ${selected} 项</span>${labels
          .map((label) => `<button type="button" class="el-button cm-btn-batch el-button--default el-button--mini"><span>${label}</span></button>`)
          .join('')}`;
      } else {
        container.innerHTML = '';
      }
    });
  } else {
    root.querySelectorAll('.table-footer__actions .el-button').forEach((button) => {
      if (selected > 0) {
        button.removeAttribute('disabled');
        button.classList.remove('is-disabled');
      } else {
        button.setAttribute('disabled', 'disabled');
        button.classList.add('is-disabled');
      }
    });
  }
  root.querySelectorAll('span, div').forEach((element) => {
    if (!(element instanceof HTMLElement)) return;
    if (element.classList.contains('table-footer__selected')) {
      element.textContent = `已选 ${selected} 项`;
      return;
    }
    const text = (element.textContent || '').trim();
    if (/^已选\s*\d+\s*项$/.test(text) && element.children.length === 0) {
      element.textContent = `已选 ${selected} 项`;
    }
  });
}

function toggleRowActions(root: HTMLElement, snapshot: LiveSnapshot, row: HTMLTableRowElement) {
  const next = row.nextElementSibling;
  if (next && next.classList.contains('el-table__expanded-row')) {
    next.remove();
    return;
  }
  root.querySelectorAll('.el-table__expanded-row').forEach((item) => item.remove());
  if (snapshot.rowActionRowHtml) {
    const template = document.createElement('template');
    template.innerHTML = snapshot.rowActionRowHtml.trim();
    const expanded = template.content.firstElementChild as HTMLElement | null;
    if (expanded) row.parentElement?.insertBefore(expanded, row.nextSibling);
    return;
  }
  const labels = ROW_ACTIONS[snapshot.slug];
  if (!labels || labels.length === 0) return;
  const columns = row.querySelectorAll('td').length
    || row.closest('table')?.querySelectorAll('colgroup col').length
    || 1;
  const expanded = document.createElement('tr');
  expanded.className = 'el-table__expanded-row';
  expanded.innerHTML = `<td colspan="${columns}" class="el-table__cell el-table__expanded-cell"><div class="row-action-bar cm-row-actions">${actionButtonsMarkup(labels)}</div></td>`;
  row.parentElement?.insertBefore(expanded, row.nextSibling);
}

function normalizeText(value: string) {
  return String(value || '').replace(/\s+/g, '').replace(/[⌄▾]/g, '');
}

function setCheckboxState(input: HTMLInputElement, checked: boolean) {
  input.checked = checked;
  const label = input.closest('.el-checkbox');
  if (!label) return;
  label.classList.toggle('is-checked', checked);
  const box = label.querySelector('.el-checkbox__input');
  if (!box) return;
  box.classList.toggle('is-checked', checked);
  box.classList.remove('is-indeterminate');
}

function setRadioState(radio: Element, checked: boolean) {
  const input = radio.querySelector('input');
  if (input) input.checked = checked;
  radio.classList.toggle('is-checked', checked);
  const box = radio.querySelector('.el-radio__input');
  if (box) box.classList.toggle('is-checked', checked);
}

function applyProcessOps(panel: HTMLElement) {
  const active = Array.from(panel.querySelectorAll<HTMLElement>('.process-ops-btn.active'))
    .map((button) => normalizeText(button.textContent || ''));
  panel.querySelectorAll('.process-op-card, .title-ai-custom-words').forEach((card) => card.remove());
  const tip = panel.querySelector('.process-ops-tip');
  if (!tip) return;
  let anchor: Element = tip;
  active.forEach((label) => {
    const html = (autoEditOpsHtml as Record<string, string>)[label];
    if (!html) return;
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    const source = template.content.firstElementChild as HTMLElement | null;
    if (!source) return;
    source.querySelectorAll('.process-op-card, .title-ai-custom-words').forEach((card) => {
      const clone = card.cloneNode(true) as HTMLElement;
      anchor.insertAdjacentElement('afterend', clone);
      anchor = clone;
    });
  });
}

function toggleProcessOp(panel: HTMLElement, label: string) {
  const chip = Array.from(panel.querySelectorAll<HTMLElement>('.process-ops-btn'))
    .find((button) => normalizeText(button.textContent || '') === label);
  if (!chip) return;
  if (chip.classList.contains('active')) {
    chip.classList.remove('active');
    applyProcessOps(panel);
    return;
  }
  if (label === '使用采集源标题' || label === 'AI生成标题') {
    panel.querySelectorAll('.process-ops-btn.active').forEach((button) => button.classList.remove('active'));
  } else if (label === '首字母大写') {
    panel.querySelectorAll<HTMLElement>('.process-ops-btn.active').forEach((button) => {
      const text = normalizeText(button.textContent || '');
      if (text === '使用采集源标题' || text === 'AI生成标题') button.classList.remove('active');
    });
  } else {
    panel.querySelectorAll<HTMLElement>('.process-ops-btn.active').forEach((button) => {
      const text = normalizeText(button.textContent || '');
      if (text === '使用采集源标题' || text === 'AI生成标题') button.classList.remove('active');
    });
  }
  chip.classList.add('active');
  applyProcessOps(panel);
}

function syncTableHeaderCheckbox(root: HTMLElement) {
  const table = root.querySelector('.el-table');
  const headerInput = table?.querySelector<HTMLInputElement>('.el-table__header-wrapper input.el-checkbox__original');
  if (!table || !headerInput) return;
  const bodyInputs = Array.from(table.querySelectorAll<HTMLInputElement>('.el-table__body-wrapper tbody tr.el-table__row input.el-checkbox__original'));
  const checked = bodyInputs.filter((input) => input.checked).length;
  const all = checked > 0 && checked === bodyInputs.length;
  const partial = checked > 0 && checked < bodyInputs.length;
  const label = headerInput.closest('.el-checkbox');
  const box = label?.querySelector('.el-checkbox__input');
  headerInput.checked = all;
  label?.classList.toggle('is-checked', all);
  if (box) {
    box.classList.toggle('is-checked', all);
    box.classList.toggle('is-indeterminate', partial);
  }
}

function escapeHtml(value: string) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function resolveRouteFromClick(target: HTMLElement): string {
  const menuItem = target.closest('.el-menu--horizontal > .el-menu-item');
  if (menuItem) {
    return TOP_NAV_DEFAULT[normalizeText(menuItem.textContent || '')] || '';
  }
  const submenuTitle = target.closest('.el-submenu__title');
  if (submenuTitle) {
    return '';
  }
  const popupItem = target.closest('.el-menu--popup .el-menu-item');
  if (popupItem) {
    const text = normalizeText(popupItem.textContent || '');
    return TITLE_TO_PAGE.get(text) || '';
  }
  const tab = target.closest('.el-tabs__item');
  if (tab) {
    const text = normalizeText(tab.textContent || '').replace(/\d+$/g, '');
    return TAB_ALIASES[text] || TITLE_TO_PAGE.get(text) || '';
  }
  const anchor = target.closest('a[href]') as HTMLAnchorElement | null;
  if (anchor) {
    const href = anchor.getAttribute('href') || '';
    if (href.startsWith('/') && !href.startsWith('//')) {
      const path = href.split('?')[0].split('#')[0];
      return PATH_TO_PAGE.get(path) || '';
    }
  }
  return '';
}

function LivePage({ snapshot, navigate }: { snapshot: LiveSnapshot; navigate: (page: string) => void }) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const navSuppressRef = useRef(0);

  useEffect(() => {
    document.body.className = snapshot.bodyClass || '';
    document.title = snapshot.title;
    window.scrollTo(0, 0);
    const root = rootRef.current;
    if (root) initLiveFormValues(root, snapshot.slug);
    return () => {
      document.body.className = '';
    };
  }, [snapshot]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const openDialog = target.closest('[data-live-dialog="1"]');
      if (openDialog) {
        const button = target.closest('button');
        const text = normalizeText(button?.textContent || '');
        if (target === openDialog || target.closest('.el-dialog__headerbtn')) {
          event.preventDefault();
          closeLiveDialogs();
          return;
        }
        if (button && CLOSE_TEXTS.includes(text)) {
          event.preventDefault();
          closeLiveDialogs();
          return;
        }
        if (button && SUBMIT_TEXTS.some((item) => text.includes(item))) {
          event.preventDefault();
          showLiveMessage(`${text}（演示环境不会提交）`);
          return;
        }
      }
      const dateEditorElement = target.closest('.app-main .el-date-editor') as HTMLElement | null;
      if (dateEditorElement) {
        event.preventDefault();
        event.stopPropagation();
        openDatePanel(dateEditorElement);
        return;
      }
      const selectOption = target.closest('.el-select-dropdown__item') as HTMLElement | null;
      if (selectOption && selectDropdown && selectDropdown.contains(selectOption)) {
        const text = (selectOption.textContent || '').trim();
        selectDropdown.querySelectorAll('.el-select-dropdown__item').forEach((item) => item.classList.remove('selected'));
        selectOption.classList.add('selected');
        const input = selectOwner?.querySelector<HTMLInputElement>('.el-input__inner');
        if (input) input.value = text;
        const inPagination = Boolean(selectOwner?.closest('.el-pagination'));
        closeSelectDropdown();
        if (snapshot.slug === 'report-shop-sign' && /模式/.test(text) && snapshot.groupModeHtml) {
          root.innerHTML = text === '店群模式' ? snapshot.groupModeHtml : snapshot.appHtml;
          initLiveFormValues(root, snapshot.slug);
        } else if (snapshot.slug === 'report-shop-sign' && snapshot.storeTabs?.[text]) {
          root.innerHTML = snapshot.storeTabs[text];
          initLiveFormValues(root, snapshot.slug);
        } else if (snapshot.slug === 'report-shop-sign' && snapshot.periodTabs?.[text]) {
          root.innerHTML = snapshot.periodTabs[text];
          initLiveFormValues(root, snapshot.slug);
        } else if (inPagination) {
          showLiveMessage(`${text}（演示快照不重新加载）`);
        }
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      const dropdownItem = target.closest('.el-dropdown-menu__item') as HTMLElement | null;
      if (dropdownItem && dropdownMenu && dropdownMenu.contains(dropdownItem)) {
        const text = (dropdownItem.textContent || '').trim();
        closeDropdownMenu();
        if (!openMatchingDialog(root, snapshot.slug, text)
          && !openCapturedDialog(snapshot.slug, text, 'toolbar')
          && !openCapturedDialog(snapshot.slug, text, 'batch')) {
          showLiveMessage(`${text}（演示）`);
        }
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      const dropdownTrigger = target.closest('.app-main .el-dropdown') as HTMLElement | null;
      if (dropdownTrigger && !target.closest('.el-dropdown-menu')) {
        const menu = dropdownTrigger.querySelector<HTMLElement>('.el-dropdown-menu');
        if (menu) {
          event.preventDefault();
          event.stopPropagation();
          if (dropdownMenu === menu) {
            closeDropdownMenu();
            return;
          }
          closeSelectDropdown();
          closeDropdownMenu();
          dropdownMenu = menu;
          const rect = dropdownTrigger.getBoundingClientRect();
          menu.style.display = 'block';
          menu.style.position = 'fixed';
          menu.style.left = `${rect.left}px`;
          menu.style.top = `${rect.bottom + 4}px`;
          menu.style.zIndex = '2100';
          return;
        }
      }
      const headerSelectAll = target.closest('.header-select-all-trigger') as HTMLElement | null;
      if (headerSelectAll) {
        const body = root.querySelector('.el-table__body-wrapper');
        const inputs = body ? Array.from(body.querySelectorAll<HTMLInputElement>('tbody tr.el-table__row input.el-checkbox__original')) : [];
        const allChecked = inputs.length > 0 && inputs.every((input) => input.checked);
        inputs.forEach((input) => {
          setCheckboxState(input, !allChecked);
        });
        syncTableHeaderCheckbox(root);
        window.requestAnimationFrame(() => updateBatchBar(root, snapshot.slug));
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      const selectionCell = target.closest('.selection-column-cell') as HTMLElement | null;
      if (selectionCell && !target.closest('.el-checkbox')) {
        const input = selectionCell.querySelector<HTMLInputElement>('input.el-checkbox__original');
        if (input) {
          if (selectionCell.closest('thead')) {
            const body = root.querySelector('.el-table__body-wrapper');
            const inputs = body ? Array.from(body.querySelectorAll<HTMLInputElement>('tbody tr.el-table__row input.el-checkbox__original')) : [];
            const allChecked = inputs.length > 0 && inputs.every((item) => item.checked);
            inputs.forEach((item) => {
              setCheckboxState(item, !allChecked);
            });
            setCheckboxState(input, !allChecked);
          } else {
            setCheckboxState(input, !input.checked);
          }
          syncTableHeaderCheckbox(root);
          window.requestAnimationFrame(() => updateBatchBar(root, snapshot.slug));
        }
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      const switchElement = target.closest('.el-switch') as HTMLElement | null;
      if (switchElement && !switchElement.classList.contains('is-disabled')) {
        event.preventDefault();
        event.stopPropagation();
        const next = !switchElement.classList.contains('is-checked');
        switchElement.classList.toggle('is-checked', next);
        const input = switchElement.querySelector<HTMLInputElement>('input');
        if (input) input.checked = next;
        return;
      }
      const radioButtonElement = target.closest('.el-radio-button') as HTMLElement | null;
      if (radioButtonElement && !radioButtonElement.classList.contains('is-disabled')) {
        event.preventDefault();
        event.stopPropagation();
        const group = radioButtonElement.closest('.el-radio-group');
        group?.querySelectorAll('.el-radio-button').forEach((item) => {
          item.classList.remove('is-active');
          const input = item.querySelector<HTMLInputElement>('input');
          if (input) input.checked = false;
        });
        radioButtonElement.classList.add('is-active');
        const input = radioButtonElement.querySelector<HTMLInputElement>('input');
        if (input) input.checked = true;
        return;
      }
      const radioElement = target.closest('.el-radio') as HTMLElement | null;
      if (radioElement && snapshot.slug !== 'procurement-inbound-outbound' && !radioElement.classList.contains('is-disabled')) {
        event.preventDefault();
        event.stopPropagation();
        radioElement.closest('.el-radio-group')?.querySelectorAll('.el-radio').forEach((item) => setRadioState(item, false));
        setRadioState(radioElement, true);
        return;
      }
      const collectTab = target.closest('.collect-subnav__item') as HTMLElement | null;
      if (collectTab && snapshot.slug === 'commodity-collect') {
        event.preventDefault();
        event.stopPropagation();
        const label = normalizeText(collectTab.textContent || '');
        root.querySelectorAll('.collect-subnav__item').forEach((item) => {
          item.classList.toggle('active', item === collectTab);
        });
        root.querySelectorAll<HTMLElement>('.collect-content').forEach((section) => {
          section.style.display = 'none';
        });
        const pluginLink = root.querySelector<HTMLElement>('.plugin-download-link');
        if (pluginLink) pluginLink.style.display = label === '链接采集' || label === '店铺采集' ? '' : 'none';
        let section: HTMLElement | null = null;
        if (label === '链接采集') section = root.querySelector<HTMLElement>('.collect-content--form');
        else if (label === '店铺采集') section = root.querySelector<HTMLElement>('.collect-content--store');
        else {
          root.querySelector('.collect-content--table')?.remove();
          const template = document.createElement('template');
          template.innerHTML = ((collectTabHtml as Record<string, string>)[label] || '').trim();
          section = template.content.firstElementChild as HTMLElement | null;
          if (section) root.querySelector('.collect-body')?.appendChild(section);
        }
        if (section) section.style.display = '';
        return;
      }
      const profileMenu = target.closest('.profile-menu .el-menu-item') as HTMLElement | null;
      if (profileMenu) {
        const label = normalizeText(profileMenu.textContent || '');
        const mapping: Record<string, string> = {
          基础资料: 'account-personal-center',
          会员中心: 'account-member-center',
          订单中心: 'account-orders',
          分销中心: 'account-distribution',
        };
        const targetPage = mapping[label];
        if (targetPage) {
          event.preventDefault();
          event.stopPropagation();
          navigate(targetPage);
          return;
        }
      }
      const messageFilter = target.closest('.msg-filter-tab') as HTMLElement | null;
      if (messageFilter && snapshot.slug === 'service-in-site-message') {
        const label = normalizeText(messageFilter.textContent || '').replace(/\(\d+\)$/u, '');
        root.querySelectorAll('.msg-filter-tab').forEach((tab) => tab.classList.remove('active'));
        messageFilter.classList.add('active');
        root.querySelectorAll<HTMLElement>('.msg-item').forEach((item) => {
          const type = normalizeText(item.querySelector('.msg-type-tag')?.textContent || '');
          item.style.display = label === '全部消息' || type === label ? '' : 'none';
        });
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      const readIcon = target.closest('.msg-read-icon') as HTMLElement | null;
      if (readIcon && snapshot.slug === 'service-in-site-message') {
        const item = readIcon.closest('.msg-item');
        const unread = item?.classList.toggle('unread');
        readIcon.classList.toggle('unread', Boolean(unread));
        readIcon.setAttribute('title', unread ? '标记已读' : '标记未读');
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      const messageItem = target.closest('.msg-item') as HTMLElement | null;
      if (messageItem && snapshot.slug === 'service-in-site-message') {
        messageItem.classList.remove('unread');
        messageItem.classList.add('active');
        const icon = messageItem.querySelector('.msg-read-icon');
        icon?.classList.remove('unread');
        icon?.setAttribute('title', '标记未读');
        const title = (messageItem.querySelector('.msg-item-title')?.textContent || '').trim();
        const time = (messageItem.querySelector('.msg-item-time')?.textContent || '').trim();
        const category = (messageItem.querySelector('.msg-type-tag')?.textContent || '').trim();
        const preview = (messageItem.querySelector('.msg-item-preview')?.textContent || '').trim();
        const panel = root.querySelector('.msg-panel-right');
        if (panel) {
          const template = document.createElement('template');
          template.innerHTML = messageDetailHtml.trim();
          const detail = template.content.firstElementChild as HTMLElement | null;
          if (detail) {
            const titleNode = detail.querySelector('.msg-notice-title');
            if (titleNode) titleNode.textContent = title;
            const meta = detail.querySelector('.msg-notice-meta span');
            if (meta) meta.textContent = category || '-';
            const info = detail.querySelector('.msg-notice-info > div');
            if (info) info.textContent = `主题：${title}`;
            const row = detail.querySelector('.msg-notice-info-row');
            if (row) {
              row.innerHTML = `<span>联系人：SYSTEM</span><span>${time}</span>`;
            }
            const content = detail.querySelector('.msg-notice-content');
            if (content) content.innerHTML = `<p>${escapeHtml(preview || title)}</p>`;
            panel.outerHTML = detail.outerHTML;
          }
        }
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      const sortHeader = target.closest('th') as HTMLElement | null;
      if (sortHeader && sortHeader.querySelector('.caret-wrapper, .sort-caret')) {
        const tbody = root.querySelector<HTMLElement>('.el-table__body-wrapper tbody');
        const headers = sortHeader.parentElement ? Array.from(sortHeader.parentElement.children) : [];
        const cellIndex = headers.indexOf(sortHeader);
        if (tbody && cellIndex >= 0) {
          event.preventDefault();
          event.stopPropagation();
          const descending = !sortHeader.classList.contains('descending');
          headers.forEach((header) => header.classList.remove('ascending', 'descending'));
          sortHeader.classList.add(descending ? 'descending' : 'ascending');
          const rows = Array.from(tbody.querySelectorAll<HTMLTableRowElement>('tr.el-table__row'));
          rows.sort((left, right) => {
            const leftText = (left.children[cellIndex]?.textContent || '').trim();
            const rightText = (right.children[cellIndex]?.textContent || '').trim();
            const leftNumber = Number(leftText.replace(/[^\d.-]/g, ''));
            const rightNumber = Number(rightText.replace(/[^\d.-]/g, ''));
            const numeric = Number.isFinite(leftNumber) && Number.isFinite(rightNumber) && leftText !== '' && rightText !== '';
            const compare = numeric ? leftNumber - rightNumber : leftText.localeCompare(rightText, 'zh-CN', { numeric: true });
            return descending ? -compare : compare;
          });
          rows.forEach((row) => tbody.appendChild(row));
          return;
        }
      }
      const treeContent = target.closest('.el-tree-node__content') as HTMLElement | null;
      if (treeContent) {
        const expandIcon = target.closest('.el-tree-node__expand-icon') as HTMLElement | null;
        if (expandIcon) {
          const node = expandIcon.closest('.el-tree-node') as HTMLElement | null;
          if (node) {
            const expanded = node.classList.toggle('is-expanded');
            expandIcon.classList.toggle('expanded', expanded);
            const children = node.querySelector<HTMLElement>('.el-tree-node__children');
            if (children) children.style.display = expanded ? '' : 'none';
          }
        } else {
          const tree = treeContent.closest('.el-tree');
          tree?.querySelectorAll('.el-tree-node__content').forEach((item) => item.classList.remove('is-current'));
          treeContent.classList.add('is-current');
        }
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      const tabElement = target.closest('.el-tabs__item') as HTMLElement | null;
      if (tabElement) {
        const tabs = tabElement.closest('.el-tabs');
        if (tabs) {
          event.preventDefault();
          event.stopPropagation();
          const items = Array.from(tabs.querySelectorAll<HTMLElement>('.el-tabs__item'));
          items.forEach((item) => {
            item.classList.remove('is-active');
            item.setAttribute('aria-selected', 'false');
          });
          tabElement.classList.add('is-active');
          tabElement.setAttribute('aria-selected', 'true');
          const activeBar = tabs.querySelector<HTMLElement>('.el-tabs__active-bar');
          if (activeBar) {
            activeBar.style.width = `${tabElement.offsetWidth}px`;
            activeBar.style.transform = `translateX(${tabElement.offsetLeft}px)`;
          }
          const paneId = tabElement.getAttribute('aria-controls');
          tabs.querySelectorAll<HTMLElement>('.el-tab-pane').forEach((pane) => {
            pane.style.display = pane.id === paneId ? '' : 'none';
          });
          return;
        }
      }
      const dataTab = target.closest('.data-tab') as HTMLElement | null;
      if (dataTab && snapshot.slug === 'report-shop-sign') {
        const label = normalizeText(dataTab.textContent || '');
        const html = snapshot.dataTabs?.[label];
        if (html) {
          event.preventDefault();
          event.stopPropagation();
          const section = root.querySelector('.store-data-section');
          if (section) section.outerHTML = html;
          return;
        }
      }
      const selectElement = target.closest('.app-main .el-select') as HTMLElement | null;
      if (selectElement && !target.closest('.el-select-dropdown')) {
        const dropdown = selectElement.querySelector<HTMLElement>('.el-select-dropdown');
        if (dropdown) {
          event.preventDefault();
          event.stopPropagation();
          if (selectDropdown === dropdown) {
            closeSelectDropdown();
            return;
          }
          closeSelectDropdown();
          selectDropdown = dropdown;
          selectOwner = selectElement;
          const rect = selectElement.getBoundingClientRect();
          dropdown.style.display = 'block';
          dropdown.style.position = 'fixed';
          dropdown.style.left = `${rect.left}px`;
          dropdown.style.top = `${rect.bottom + 4}px`;
          dropdown.style.width = `${Math.max(rect.width, 140)}px`;
          dropdown.style.zIndex = '2100';
          return;
        }
      }
      const clickedReset = target.closest('button');
      const clickedButtonText = normalizeText(clickedReset?.textContent || '');
      if (clickedReset && clickedButtonText === '重置' && !target.closest('[data-live-dialog="1"]')) {
        const container = clickedReset.closest('form, .app-main') || root;
        container.querySelectorAll<HTMLInputElement>('.el-input__inner').forEach((input) => {
          if (!input.closest('.el-pagination') && !input.closest('.el-dialog')) input.value = '';
        });
        container.querySelectorAll('.el-select-dropdown__item.selected').forEach((item) => item.classList.remove('selected'));
        root.querySelectorAll<HTMLElement>('.el-table__body-wrapper tbody tr.el-table__row').forEach((row) => {
          row.style.display = '';
        });
        closeSelectDropdown();
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (clickedReset && clickedButtonText === '搜索' && !target.closest('[data-live-dialog="1"]')) {
        const form = clickedReset.closest('form');
        if (form) {
          const selectElements = Array.from(form.querySelectorAll<HTMLElement>('.el-select'));
          const typeValues = ['产品编号', '产品标题', '产品ID', '父SKU', '类目名称', '订单号', '平台订单号', '采集源'];
          const typeSelect = selectElements.find((select) => typeValues.includes(select.querySelector<HTMLInputElement>('.el-input__inner')?.value || ''));
          const keywords = [
            ...Array.from(form.querySelectorAll<HTMLInputElement>('input.el-input__inner'))
              .filter((input) => !input.closest('.el-select') && !input.closest('.el-date-editor') && input.value.trim())
              .map((input) => input.value.trim().toLowerCase()),
            ...selectElements
              .filter((select) => select !== typeSelect)
              .map((select) => select.querySelector<HTMLInputElement>('.el-input__inner')?.value || '')
              .filter((value) => value && !/^(请选择|全部)/.test(value))
              .map((value) => value.toLowerCase()),
          ];
          root.querySelectorAll<HTMLElement>('.el-table__body-wrapper tbody tr.el-table__row').forEach((row) => {
            const text = (row.innerText || '').toLowerCase();
            row.style.display = keywords.every((keyword) => text.includes(keyword)) ? '' : 'none';
          });
          closeSelectDropdown();
          event.preventDefault();
          event.stopPropagation();
          return;
        }
      }
      const statusTab = target.closest('.order-status-tab') as HTMLElement | null;
      if (statusTab && snapshot.slug === 'trade-my-order') {
        const label = normalizeText(statusTab.textContent || '').replace(/\(\d+\)$/u, '');
        const html = snapshot.statusTabs?.[label];
        if (html) {
          event.preventDefault();
          event.stopPropagation();
          closeLiveDialogs();
          root.innerHTML = html;
          initLiveFormValues(root, snapshot.slug);
        }
        return;
      }
      if (handleInboundWorkbench(root, snapshot, target)) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      const route = resolveRouteFromClick(target);
      if (route) {
        event.preventDefault();
        event.stopPropagation();
        navigate(route);
        return;
      }
      const pagerItem = target.closest('.el-pager li.number') as HTMLElement | null;
      const pagerNext = target.closest('.el-pagination .btn-next') as HTMLElement | null;
      const pagerPrev = target.closest('.el-pagination .btn-prev') as HTMLElement | null;
      if (pagerItem || pagerNext || pagerPrev) {
        event.preventDefault();
        event.stopPropagation();
        const activeText = root.querySelector('.el-pager li.number.active')?.textContent?.trim() || '1';
        let nextPage = Number(activeText) || 1;
        if (pagerItem) nextPage = Number((pagerItem.textContent || '').trim()) || nextPage;
        else if (pagerNext) {
          if (pagerNext.classList.contains('is-disabled') || pagerNext.hasAttribute('disabled')) return;
          nextPage += 1;
        } else if (pagerPrev) {
          if (pagerPrev.classList.contains('is-disabled') || pagerPrev.hasAttribute('disabled')) return;
          nextPage -= 1;
        }
        const scanWrap = root.querySelector('.scan-wrap');
        const orderStatus = snapshot.slug === 'trade-my-order' ? orderStatusTabLabel(root) : '';
        let html = '';
        if (scanWrap) {
          const outbound = (root.querySelector('.scan-title')?.textContent || '').includes('出库');
          const pages = outbound
            ? [snapshot.outboundScanHtml, snapshot.outboundScanPage2Html, snapshot.outboundScanPage3Html]
            : [snapshot.inboundScanHtml, snapshot.inboundScanPage2Html, snapshot.inboundScanPage3Html];
          html = pages[nextPage - 1] || '';
        } else if (orderStatus && orderStatus !== '全部订单') {
          const pages = [snapshot.statusTabs?.[orderStatus], snapshot.statusPage2Tabs?.[orderStatus]];
          html = pages[nextPage - 1] || '';
        } else {
          html = snapshotPageHtml(snapshot, nextPage);
        }
        if (html) {
          closeLiveDialogs();
          root.innerHTML = html;
          initLiveFormValues(root, snapshot.slug);
        } else {
          showLiveMessage(`第 ${nextPage} 页未抓取，当前演示快照只支持已抓取页码`);
        }
        return;
      }
      const clickedButton = target.closest('button');
      if (clickedButton && !target.closest('.row-action-bar, .table-footer__actions')) {
        const buttonText = clickedButton.textContent || '';
        if (openMatchingDialog(root, snapshot.slug, buttonText)
          || openCapturedDialog(snapshot.slug, buttonText, 'toolbar')
          || openCapturedDialog(snapshot.slug, buttonText, 'batch')
          || openCapturedDialog(snapshot.slug, buttonText, 'row')) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        if (handleLocalAction(root, snapshot.slug, buttonText, clickedButton as HTMLElement, 'toolbar')) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
      }
      const textTriggers = ['设置', '下载安装浏览器插件', '修改头像', '算力明细'];
      const clickedText = normalizeText(target.textContent || '');
      if (!clickedButton && target.closest('.app-main') && textTriggers.some((item) => clickedText === normalizeText(item))) {
        if (openMatchingDialog(root, snapshot.slug, clickedText) || openCapturedDialog(snapshot.slug, clickedText, 'toolbar')) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
      }
      if (snapshot.slug === 'home' && target.closest('.view-all')) {
        if (openCapturedVariant('home', '公告', '历史公告')) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
      }
      if (snapshot.slug === 'home' && target.closest('.announcement-item')) {
        if (openCapturedDialog('home', '公告', 'toolbar')) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
      }
      if (snapshot.slug === 'account-personal-center' && target.closest('.avatar, .user-avatar, .avatar-wrapper')) {
        if (openMatchingDialog(root, snapshot.slug, '修改头像')
          || openCapturedDialog(snapshot.slug, '修改头像', 'toolbar')) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
      }
      const actionButton = target.closest('.row-action-bar .el-button, .table-footer__actions .el-button');
      if (actionButton) {
        event.preventDefault();
        event.stopPropagation();
        const label = (actionButton.textContent || '').trim();
        const context = actionButton.closest('.row-action-bar') ? 'row' : 'batch';
        if (!openCapturedDialog(snapshot.slug, label, context)
          && !openCapturedDialog(snapshot.slug, label, 'batch')
          && !openCapturedDialog(snapshot.slug, label, 'row')
          && !openCapturedDialog(snapshot.slug, label, 'toolbar')
          && !handleLocalAction(root, snapshot.slug, label, actionButton as HTMLElement, context)) {
          showLiveMessage(`${label}（演示）`);
        }
        return;
      }
      if (snapshot.slug === 'report-shop-sign' && target.closest('.punish-table .el-table__row')) {
        if (openMatchingDialog(root, snapshot.slug, '处罚通知详情')
          || openCapturedDialog(snapshot.slug, '处罚通知', 'toolbar')
          || openCapturedDialog(snapshot.slug, '处罚通知', 'row')) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
      }
      const expandIcon = target.closest('.el-table__expand-icon');
      const row = target.closest('tr.el-table__row') as HTMLTableRowElement | null;
      if (expandIcon && row) {
        event.preventDefault();
        event.stopPropagation();
        toggleRowActions(root, snapshot, row);
        return;
      }
      if (row && !target.closest('input,button,a,label,.el-checkbox,.el-checkbox__inner')) {
        toggleRowActions(root, snapshot, row);
        return;
      }
      if (clickedButton && !clickedButton.disabled && target.closest('.app-main')) {
        showLiveMessage(`${(clickedButton.textContent || '').trim() || '操作'}（演示）`);
      }
    };
    const onChange = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target instanceof HTMLInputElement && target.classList.contains('el-checkbox__original')) {
        setCheckboxState(target, target.checked);
        if (target.closest('.el-table__header-wrapper')) {
          const body = root.querySelector('.el-table__body-wrapper');
          body?.querySelectorAll<HTMLInputElement>('tbody tr.el-table__row input.el-checkbox__original').forEach((input) => {
            setCheckboxState(input, target.checked);
          });
        }
        syncTableHeaderCheckbox(root);
        window.requestAnimationFrame(() => updateBatchBar(root, snapshot.slug));
      }
    };
    let navPanel: HTMLElement | null = null;
    let navHideTimer = 0;
    let selectDropdown: HTMLElement | null = null;
    let selectOwner: HTMLElement | null = null;
    let dropdownMenu: HTMLElement | null = null;
    let datePanel: HTMLElement | null = null;
    let dateEditor: HTMLElement | null = null;
    let dateStart = '';

    const closeDatePanel = () => {
      datePanel?.remove();
      datePanel = null;
      dateEditor = null;
      dateStart = '';
    };

    const openDatePanel = (editor: HTMLElement) => {
      if (datePanel) {
        closeDatePanel();
        return;
      }
      const template = document.createElement('template');
      template.innerHTML = dateRangePanelHtml.trim();
      const panel = template.content.firstElementChild as HTMLElement | null;
      if (!panel) return;
      const rect = editor.getBoundingClientRect();
      panel.style.position = 'fixed';
      panel.style.left = `${Math.max(8, Math.min(rect.left, window.innerWidth - 660))}px`;
      panel.style.top = `${rect.bottom + 4}px`;
      panel.style.zIndex = '2100';
      panel.style.display = 'block';
      panel.addEventListener('click', (event) => {
        const cell = (event.target as HTMLElement).closest('.el-date-table td.available') as HTMLElement | null;
        if (!cell) return;
        const table = cell.closest('.el-date-table');
        const tables = Array.from(panel.querySelectorAll('.el-date-table'));
        const index = table ? tables.indexOf(table) : 0;
        const header = panel.querySelectorAll('.el-date-range-picker__header')[index];
        const match = (header?.textContent || '').match(/(\d{4})\s*年\s*(\d{1,2})\s*月/);
        const day = (cell.textContent || '').trim();
        if (!match || !day) return;
        const date = `${match[1]}-${match[2].padStart(2, '0')}-${day.padStart(2, '0')}`;
        const inputs = Array.from(editor.querySelectorAll<HTMLInputElement>('input'));
        if (!dateStart) {
          dateStart = date;
          if (inputs[0]) inputs[0].value = date;
          if (inputs[1]) inputs[1].value = '';
          panel.querySelectorAll('.start-date, .end-date').forEach((item) => item.classList.remove('start-date', 'end-date'));
          cell.classList.add('start-date');
        } else {
          if (inputs[1] || inputs.length > 1) {
            if (inputs[1]) inputs[1].value = date;
          } else if (inputs[0]) {
            inputs[0].value = date;
          }
          cell.classList.add('end-date');
          closeDatePanel();
        }
        event.preventDefault();
        event.stopPropagation();
      });
      document.body.appendChild(panel);
      datePanel = panel;
      dateEditor = editor;
      dateStart = '';
    };

    const closeDropdownMenu = () => {
      if (dropdownMenu) {
        dropdownMenu.style.display = 'none';
        dropdownMenu.style.position = '';
        dropdownMenu.style.left = '';
        dropdownMenu.style.top = '';
        dropdownMenu.style.zIndex = '';
      }
      dropdownMenu = null;
    };

    const closeSelectDropdown = () => {
      if (selectDropdown) {
        selectDropdown.style.display = 'none';
        selectDropdown.style.position = '';
        selectDropdown.style.left = '';
        selectDropdown.style.top = '';
        selectDropdown.style.width = '';
        selectDropdown.style.zIndex = '';
      }
      selectDropdown = null;
      selectOwner = null;
    };

    const closeNavPanel = () => {
      if (navHideTimer) window.clearTimeout(navHideTimer);
      navHideTimer = 0;
      navPanel?.remove();
      navPanel = null;
    };

    const scheduleCloseNavPanel = () => {
      if (navHideTimer) window.clearTimeout(navHideTimer);
      navHideTimer = window.setTimeout(closeNavPanel, 180);
    };

    const openNavPanel = (submenu: HTMLElement) => {
      if (Date.now() < navSuppressRef.current) return;
      const source = submenu.querySelector('.top-nav-submenu') as HTMLElement | null;
      if (!source) return;
      if (navHideTimer) window.clearTimeout(navHideTimer);
      navHideTimer = 0;
      navPanel?.remove();
      const clone = source.cloneNode(true) as HTMLElement;
      clone.setAttribute('data-live-nav-panel', '1');
      clone.style.display = 'block';
      clone.style.position = 'fixed';
      const navbar = root.querySelector('.navbar') as HTMLElement | null;
      clone.style.top = `${Math.round(navbar?.getBoundingClientRect().bottom || 50)}px`;
      clone.style.left = `${Math.round(submenu.getBoundingClientRect().left)}px`;
      clone.style.width = '500px';
      clone.style.zIndex = '2004';
      clone.addEventListener('mouseenter', () => {
        if (navHideTimer) window.clearTimeout(navHideTimer);
        navHideTimer = 0;
      });
      clone.addEventListener('mouseleave', scheduleCloseNavPanel);
      clone.addEventListener('click', (event) => {
        const item = (event.target as HTMLElement).closest('.third-level-menu-item');
        if (!item) return;
        const pageId = TITLE_TO_PAGE.get(normalizeText(item.textContent || ''));
        if (!pageId) return;
        event.preventDefault();
        event.stopPropagation();
        navSuppressRef.current = Date.now() + 500;
        closeNavPanel();
        navigate(pageId);
      });
      document.body.appendChild(clone);
      navPanel = clone;
    };

    const onMouseOver = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const submenu = target.closest('.fixed-header .el-menu--horizontal > .el-submenu') as HTMLElement | null;
      if (submenu && !submenu.contains(event.relatedTarget as Node)) {
        openNavPanel(submenu);
      }
    };

    const onMouseOut = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const submenu = target.closest('.fixed-header .el-menu--horizontal > .el-submenu') as HTMLElement | null;
      if (submenu && !submenu.contains(event.relatedTarget as Node)) {
        scheduleCloseNavPanel();
      }
    };

    const onDocumentMouseDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (navPanel && !navPanel.contains(target) && !target.closest('.fixed-header .el-submenu')) {
        closeNavPanel();
      }
      if (selectDropdown && !selectDropdown.contains(target) && !target.closest('.el-select')) {
        closeSelectDropdown();
      }
      if (dropdownMenu && !dropdownMenu.contains(target) && !target.closest('.el-dropdown')) {
        closeDropdownMenu();
      }
      if (datePanel && !datePanel.contains(target) && !target.closest('.el-date-editor')) {
        closeDatePanel();
      }
    };

    const onScroll = () => {
      closeSelectDropdown();
      closeDropdownMenu();
      closeDatePanel();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeLiveDialogs();
        closeNavPanel();
        closeSelectDropdown();
        closeDropdownMenu();
        closeDatePanel();
      }
    };
    root.addEventListener('click', onClick, true);
    root.addEventListener('change', onChange, true);
    root.addEventListener('mouseover', onMouseOver);
    root.addEventListener('mouseout', onMouseOut);
    document.addEventListener('mousedown', onDocumentMouseDown);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      closeNavPanel();
      closeSelectDropdown();
      closeDropdownMenu();
      closeDatePanel();
      root.removeEventListener('click', onClick, true);
      root.removeEventListener('change', onChange, true);
      root.removeEventListener('mouseover', onMouseOver);
      root.removeEventListener('mouseout', onMouseOut);
      document.removeEventListener('mousedown', onDocumentMouseDown);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [snapshot, navigate]);

  return <div className="erp-live-root" ref={rootRef} dangerouslySetInnerHTML={{ __html: snapshot.appHtml }} />;
}

export default function CamelCaptainErpConsole() {
  const { page, setPage } = useHashPage(ROUTE);

  useEffect(() => {
    if (document.getElementById('__SVG_SPRITE_NODE__')) return;
    const template = document.createElement('template');
    template.innerHTML = iconSprite.trim();
    const sprite = template.content.firstElementChild as HTMLElement | null;
    if (sprite) document.body.insertBefore(sprite, document.body.firstChild);
  }, []);

  const options = useMemo<AnnotationViewerOptions>(
    () => ({
      showToolbar: true,
      toolbarEdge: 'right',
      emptyWhenNoData: true,
      currentPageId: page,
      onDirectoryRoute: (node: AnnotationDirectoryRouteNode) => {
        if (typeof node.route === 'string') setPage(node.route);
      },
    }),
    [page, setPage],
  );

  const snapshot = LIVE_SNAPSHOTS[page] || LIVE_SNAPSHOTS.home;

  return (
    <>
      <LivePage snapshot={snapshot} navigate={setPage} />
      <AnnotationViewer
        source={annotationSourceDocument as unknown as AnnotationSourceDocument}
        options={options}
      />
    </>
  );
}
