import { PRODUCTS, STORES } from './catalog';
import { ORDERS } from './orders';
import { EXCEPTIONS } from './procurement';
import { STORE_WIS } from './reports';
import { IN_SITE_MESSAGES } from './messaging';

const TODAY_ROWS = STORE_WIS.map((store) => store.history[store.history.length - 1]);
const TODAY_ORDERS = TODAY_ROWS.reduce((sum, day) => sum + day.confirmRfxNum, 0);
const TODAY_GMV = TODAY_ROWS.reduce((sum, day) => sum + day.confirmGmv, 0);

export interface HomeKpi {
  key: string;
  label: string;
  value: string;
  delta: string;
  trend: 'up' | 'down' | 'flat';
  hint: string;
  page: string;
}

export interface HomeTodo {
  id: string;
  title: string;
  detail: string;
  type: string;
  page: string;
  level: 'danger' | 'warning' | 'info';
}

export interface HomeShortcut {
  key: string;
  label: string;
  desc: string;
  page: string;
}

export const HOME_KPIS: HomeKpi[] = [
  { key: 'orders', label: '今日订单', value: TODAY_ORDERS.toLocaleString('en-US'), delta: '+12.6%', trend: 'up', hint: '较昨日', page: 'trade-my-order' },
  { key: 'gmv', label: '今日销售额', value: `$${TODAY_GMV.toLocaleString('en-US')}`, delta: '+8.4%', trend: 'up', hint: '较昨日', page: 'report-order-detail' },
  { key: 'toshipped', label: '待发货', value: String(ORDERS.filter((item) => ['采购配货', '仓库处理'].includes(item.status)).length), delta: '-3.1%', trend: 'down', hint: '较昨日', page: 'trade-my-order' },
  { key: 'topurchase', label: '待采购', value: String(ORDERS.filter((item) => item.purchaseStatus === '未采购').length), delta: '+5.2%', trend: 'up', hint: '较昨日', page: 'procurement-tracking' },
  { key: 'exception', label: '异常订单', value: String(EXCEPTIONS.filter((item) => item.status === '待处理').length), delta: '+2', trend: 'up', hint: '较昨日', page: 'procurement-exception' },
  { key: 'onsale', label: '在售商品', value: PRODUCTS.filter((item) => item.status === '已上架').length.toLocaleString('en-US'), delta: '+36', trend: 'up', hint: '较昨日', page: 'commodity-my-products' },
];

export const HOME_TODOS: HomeTodo[] = [
  { id: 'T1', title: '3 笔新订单待采购', detail: '买家已付款，需在 12 小时内下单', type: '订单', page: 'trade-my-order', level: 'danger' },
  { id: 'T2', title: '2 个商品审核未通过', detail: '主图分辨率不足 / 标题超长', type: '商品', page: 'commodity-my-products', level: 'warning' },
  { id: 'T3', title: '1 个物流轨迹异常', detail: 'YT99002103 连续 3 天未更新', type: '物流', page: 'logistics-international', level: 'warning' },
  { id: 'T4', title: '店铺授权即将到期', detail: '161 sneakerhub8 将于 11-05 到期', type: '系统', page: 'system-store-auth', level: 'info' },
  { id: 'T5', title: 'AI 算力余额不足', detail: '当前余额 12，建议购买权益', type: '账户', page: 'account-personal-center', level: 'info' },
];

export const HOME_SHORTCUTS: HomeShortcut[] = [
  { key: 'collect', label: '商品采集', desc: '粘贴链接批量采集', page: 'commodity-collect' },
  { key: 'products', label: '我的商品', desc: '管理已刊登商品', page: 'commodity-my-products' },
  { key: 'orders', label: '我的订单', desc: '处理订单与发货', page: 'trade-my-order' },
  { key: 'purchase', label: '采购单跟踪', desc: '查看采购与到货', page: 'procurement-tracking' },
  { key: 'report', label: '订单明细报表', desc: '查看销售数据', page: 'report-order-detail' },
  { key: 'dashboard', label: '店铺看板', desc: '店铺经营概览', page: 'report-shop-sign' },
  { key: 'exchange', label: '汇率', desc: '实时汇率与换算', page: 'toolbox-exchange-rate' },
  { key: 'quality', label: '质量检测', desc: '检查商品信息质量', page: 'toolbox-quality' },
];

export const ANNOUNCEMENTS = [
  { id: 'AN1', title: '系统维护通知', content: '2026-11-02 02:00–04:00 进行例行维护，期间部分功能不可用。', time: '2026-10-30', tag: '系统' },
  { id: 'AN2', title: '敦煌网类目调整', content: '箱包类目新增「通勤包」子类目，请及时更新商品类目。', time: '2026-10-28', tag: '平台' },
  { id: 'AN3', title: '算力套餐上新', content: '新增 5000 算力套餐，购买享 9 折优惠。', time: '2026-10-26', tag: '权益' },
];

export const HOME_UNREAD = IN_SITE_MESSAGES.filter((item) => !item.read).length;

export const STORE_OVERVIEW = STORES.map((store, index) => ({
  ...store,
  todayGmv: [12480, 8360, 19620, 15480, 0][index],
  todayOrders: [186, 112, 268, 204, 0][index],
  conversion: ['2.86%', '2.21%', '3.14%', '3.02%', '0.00%'][index],
}));
