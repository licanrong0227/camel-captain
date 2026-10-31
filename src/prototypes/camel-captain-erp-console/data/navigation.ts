export interface NavPage {
  id: string;
  title: string;
  nav: string;
  subGroup?: string;
  path?: string;
}

export interface NavTopItem {
  key: string;
  title: string;
  groups?: Array<{ title: string; pages: string[] }>;
}

export const NAV_PAGES: NavPage[] = [
  { id: 'home', title: '首页', nav: '首页', path: '/home' },

  { id: 'commodity-collect', title: '商品采集', nav: '商品', subGroup: '商品管理', path: '/commodity/collect' },
  { id: 'commodity-claim', title: '认领中心', nav: '商品', subGroup: '商品管理', path: '/commodity/claim' },
  { id: 'commodity-my-products', title: '我的商品', nav: '商品', subGroup: '商品管理', path: '/commodity/my-products' },
  { id: 'commodity-distribute', title: '分发中心', nav: '商品', subGroup: '商品管理', path: '/commodity/distribute' },
  { id: 'config-new-arrival-price', title: '上新价模板配置', nav: '商品', subGroup: '基础配置', path: '/basic/new-arrival-price' },
  { id: 'config-pricing', title: '渠道定价配置', nav: '商品', subGroup: '基础配置', path: '/basic/pricing' },
  { id: 'config-store-template', title: '店铺模板配置', nav: '商品', subGroup: '基础配置', path: '/basic/store-template' },

  { id: 'trade-my-order', title: '我的订单', nav: '交易', subGroup: '订单管理', path: '/trade/my-order' },
  { id: 'trade-labeling', title: '自动打标配置', nav: '交易', subGroup: '订单管理', path: '/trade/labeling' },

  { id: 'procurement-tracking', title: '采购单跟踪', nav: '采购', subGroup: '采购管理', path: '/procurement/logistics' },
  { id: 'procurement-inbound-outbound', title: '出入库管理', nav: '采购', subGroup: '采购管理', path: '/procurement/inbound-and-outbound' },
  { id: 'procurement-exception', title: '出库异常', nav: '采购', subGroup: '采购管理', path: '/procurement/exception' },
  { id: 'procurement-supplier', title: '供应商管理', nav: '采购', subGroup: '采购管理', path: '/procurement/supplier' },
  { id: 'procurement-receipt', title: '收货地址管理', nav: '采购', subGroup: '采购管理', path: '/procurement/receipt' },

  { id: 'logistics-provider', title: '物流商管理', nav: '物流', subGroup: '物流管理', path: '/logistics/logistics-provider' },
  { id: 'logistics-international', title: '国际物流轨迹跟踪', nav: '物流', subGroup: '物流管理', path: '/logistics/international' },
  { id: 'logistics-address', title: '常用地址管理', nav: '物流', subGroup: '物流管理', path: '/logistics/address' },

  { id: 'report-order-detail', title: '订单明细报表', nav: '报表', subGroup: '订单', path: '/report/order' },
  { id: 'report-shop-sign', title: '店铺看板', nav: '报表', subGroup: '店铺', path: '/report/shop-sign' },
  { id: 'report-crawler-account', title: '账号配置', nav: '报表', subGroup: '配置', path: '/report/crawler-account' },

  { id: 'system-dept', title: '部门管理', nav: '系统', subGroup: '账号/权限', path: '/admin/sys-dept' },
  { id: 'system-role', title: '角色管理', nav: '系统', subGroup: '账号/权限', path: '/admin/sys-role' },
  { id: 'system-sub-account', title: '子账号管理', nav: '系统', subGroup: '账号/权限', path: '/admin/sys-subAccount' },
  { id: 'system-store-auth', title: '店铺授权', nav: '系统', subGroup: '店铺', path: '/admin/sys-shop' },
  { id: 'system-purchase-account-auth', title: '采购账号授权', nav: '系统', subGroup: '店铺', path: '/admin/sys-account' },
  { id: 'system-approval', title: '审批流', nav: '系统', subGroup: '审批', path: '/admin/sys-approval' },
  { id: 'system-oper-log', title: '操作日志', nav: '系统', subGroup: '监控', path: '/system/sys-oper-log' },
  { id: 'system-help-admin', title: '帮助中心', nav: '系统', subGroup: '帮助', path: '/admin/sys-help' },

  { id: 'toolbox-last-mile', title: '尾程签收凭证查询', nav: '工具箱', subGroup: '增值服务', path: '/toolbox/last-mile' },
  { id: 'toolbox-postal-code', title: '地址邮编校验', nav: '工具箱', subGroup: '增值服务', path: '/toolbox/postal-code' },
  { id: 'toolbox-exchange-rate', title: '汇率', nav: '工具箱', subGroup: '增值服务', path: '/admin/exchange-rate' },
  { id: 'toolbox-quality', title: '商品信息质量检测', nav: '工具箱', subGroup: '增值服务', path: '/toolbox/quality-inspection' },

  { id: 'service-online-cs', title: '即时咨询', nav: '即时咨询', subGroup: '帮助', path: '/trade/online-customer-service' },
  { id: 'service-in-site-message', title: '站内信', nav: '即时咨询', subGroup: '帮助', path: '/help/in-site-message' },

  { id: 'account-personal-center', title: '个人中心', nav: '个人中心' },
  { id: 'account-member-center', title: '会员中心', nav: '个人中心' },
  { id: 'account-orders', title: '订单中心', nav: '个人中心' },
  { id: 'account-distribution', title: '分销中心', nav: '个人中心' },
];

export const NAV_TOP: NavTopItem[] = [
  { key: '首页', title: '首页' },
  {
    key: '商品',
    title: '商品',
    groups: [
      { title: '商品管理', pages: ['commodity-collect', 'commodity-claim', 'commodity-my-products'] },
      { title: '基础配置', pages: ['config-new-arrival-price', 'config-pricing', 'config-store-template'] },
    ],
  },
  {
    key: '交易',
    title: '交易',
    groups: [{ title: '订单管理', pages: ['trade-my-order', 'trade-labeling'] }],
  },
  {
    key: '采购',
    title: '采购',
    groups: [
      {
        title: '采购管理',
        pages: ['procurement-tracking', 'procurement-inbound-outbound', 'procurement-exception', 'procurement-supplier', 'procurement-receipt'],
      },
    ],
  },
  {
    key: '物流',
    title: '物流',
    groups: [{ title: '物流管理', pages: ['logistics-provider', 'logistics-international', 'logistics-address'] }],
  },
  {
    key: '报表',
    title: '报表',
    groups: [
      { title: '订单', pages: ['report-order-detail'] },
      { title: '店铺', pages: ['report-shop-sign'] },
    ],
  },
  {
    key: '系统',
    title: '系统',
    groups: [
      { title: '账号/权限', pages: ['system-dept', 'system-role', 'system-sub-account'] },
      { title: '店铺', pages: ['system-store-auth', 'system-purchase-account-auth'] },
      { title: '审批', pages: ['system-approval'] },
      { title: '监控', pages: ['system-oper-log'] },
    ],
  },
  {
    key: '工具箱',
    title: '工具箱',
    groups: [
      {
        title: '增值服务',
        pages: ['toolbox-last-mile', 'toolbox-postal-code', 'toolbox-exchange-rate', 'toolbox-quality'],
      },
    ],
  },
  {
    key: '即时咨询',
    title: '即时咨询',
    groups: [{ title: '帮助', pages: ['service-online-cs', 'service-in-site-message'] }],
  },
];

export function findNavPage(pageId: string): NavPage {
  return NAV_PAGES.find((item) => item.id === pageId) || NAV_PAGES[0];
}

export function breadcrumbOf(pageId: string): string[] {
  const meta = findNavPage(pageId);
  if (meta.id === 'home') return ['首页'];
  if (meta.nav === '个人中心') return meta.title === '个人中心' ? ['个人中心'] : ['个人中心', meta.title];
  return meta.subGroup ? [meta.nav, meta.subGroup, meta.title] : [meta.nav, meta.title];
}
