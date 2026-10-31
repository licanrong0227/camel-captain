import { createRng, dayOffset, intBetween, makeCode, pick } from './util';

export interface Dept {
  id: string;
  name: string;
  parentId: string;
  leader: string;
  members: number;
  sort: number;
  status: string;
  createdAt: string;
}

export interface Role {
  id: string;
  name: string;
  code: string;
  desc: string;
  members: number;
  status: string;
  createdAt: string;
  permissions: string[];
}

export interface SubAccount {
  id: string;
  account: string;
  name: string;
  phone: string;
  email: string;
  dept: string;
  roles: string[];
  status: string;
  lastLogin: string;
}

export interface StoreAuth {
  id: string;
  platform: string;
  platformId: string;
  alias: string;
  name: string;
  status: string;
  authStatus: string;
  expiry: string;
  subAccount: string;
}

export interface PurchaseAccount {
  id: string;
  platform: string;
  account: string;
  nickname: string;
  authStatus: string;
  stores: string;
  expiry: string;
  lastUsed: string;
  status: string;
}

export interface ApprovalNode {
  id: string;
  name: string;
  type: string;
  approver: string;
  mode: string;
}

export interface ApprovalFlow {
  id: string;
  name: string;
  business: string;
  nodeCount: number;
  status: string;
  updatedAt: string;
  nodes: ApprovalNode[];
}

export interface OperLog {
  id: string;
  time: string;
  operator: string;
  account: string;
  module: string;
  action: string;
  ip: string;
  result: string;
}

export const DEPTS: Dept[] = [
  { id: 'D001', name: '骆驼队长', parentId: '', leader: 'admin', members: 42, sort: 1, status: '启用', createdAt: '2025-12-01' },
  { id: 'D002', name: '运营中心', parentId: 'D001', leader: 'liuyang', members: 16, sort: 1, status: '启用', createdAt: '2025-12-02' },
  { id: 'D003', name: '商品运营部', parentId: 'D002', leader: 'chenxi', members: 8, sort: 1, status: '启用', createdAt: '2025-12-03' },
  { id: 'D004', name: '店铺运营部', parentId: 'D002', leader: 'wangyu', members: 6, sort: 2, status: '启用', createdAt: '2025-12-03' },
  { id: 'D005', name: '采购中心', parentId: 'D001', leader: 'zhaolei', members: 11, sort: 2, status: '启用', createdAt: '2025-12-04' },
  { id: 'D006', name: '采购一部', parentId: 'D005', leader: 'sunqi', members: 6, sort: 1, status: '启用', createdAt: '2025-12-05' },
  { id: 'D007', name: '供应商管理部', parentId: 'D005', leader: 'zhoumin', members: 3, sort: 2, status: '启用', createdAt: '2025-12-05' },
  { id: 'D008', name: '仓储物流', parentId: 'D001', leader: 'huanglei', members: 9, sort: 3, status: '启用', createdAt: '2025-12-06' },
  { id: 'D009', name: '深圳仓', parentId: 'D008', leader: 'linwei', members: 5, sort: 1, status: '启用', createdAt: '2025-12-07' },
  { id: 'D010', name: '财务部', parentId: 'D001', leader: 'wuqian', members: 4, sort: 4, status: '启用', createdAt: '2025-12-08' },
  { id: 'D011', name: '技术部', parentId: 'D001', leader: 'admin', members: 2, sort: 5, status: '停用', createdAt: '2025-12-09' },
];

export const PERMISSION_TREE = [
  {
    id: 'commodity',
    label: '商品',
    children: [
      { id: 'commodity:collect', label: '商品采集' },
      { id: 'commodity:claim', label: '认领中心' },
      { id: 'commodity:products', label: '我的商品' },
      { id: 'commodity:basic', label: '基础配置' },
    ],
  },
  {
    id: 'trade',
    label: '交易',
    children: [
      { id: 'trade:order', label: '我的订单' },
      { id: 'trade:labeling', label: '自动打标配置' },
    ],
  },
  {
    id: 'procurement',
    label: '采购',
    children: [
      { id: 'procurement:tracking', label: '采购单跟踪' },
      { id: 'procurement:io', label: '出入库管理' },
      { id: 'procurement:exception', label: '出库异常' },
      { id: 'procurement:supplier', label: '供应商管理' },
      { id: 'procurement:receipt', label: '收货地址管理' },
    ],
  },
  {
    id: 'logistics',
    label: '物流',
    children: [
      { id: 'logistics:provider', label: '物流商管理' },
      { id: 'logistics:tracking', label: '国际物流轨迹跟踪' },
      { id: 'logistics:address', label: '常用地址管理' },
    ],
  },
  { id: 'report', label: '报表', children: [{ id: 'report:order', label: '订单明细报表' }, { id: 'report:shop', label: '店铺看板' }] },
  {
    id: 'system',
    label: '系统',
    children: [
      { id: 'system:dept', label: '部门管理' },
      { id: 'system:role', label: '角色管理' },
      { id: 'system:account', label: '子账号管理' },
      { id: 'system:shop', label: '店铺授权' },
      { id: 'system:approval', label: '审批流' },
      { id: 'system:log', label: '操作日志' },
    ],
  },
  { id: 'toolbox', label: '工具箱', children: [{ id: 'toolbox:all', label: '增值服务' }] },
];

export const PERMISSION_LEAVES = PERMISSION_TREE.flatMap((node) => node.children.map((child) => child.id));

export const ROLES: Role[] = [
  { id: 'R001', name: '超级管理员', code: 'super_admin', desc: '拥有全部菜单与数据权限', members: 2, status: '启用', createdAt: '2025-12-01', permissions: PERMISSION_LEAVES },
  { id: 'R002', name: '商品运营', code: 'product_operator', desc: '负责商品采集、认领、编辑与刊登', members: 8, status: '启用', createdAt: '2025-12-05', permissions: ['commodity:collect', 'commodity:claim', 'commodity:products', 'commodity:basic', 'report:shop'] },
  { id: 'R003', name: '订单客服', code: 'order_service', desc: '处理订单、售后与站内信', members: 6, status: '启用', createdAt: '2025-12-08', permissions: ['trade:order', 'service:message', 'report:order'] },
  { id: 'R004', name: '采购专员', code: 'purchaser', desc: '采购单、供应商与收货地址', members: 5, status: '启用', createdAt: '2025-12-12', permissions: ['procurement:tracking', 'procurement:io', 'procurement:exception', 'procurement:supplier', 'procurement:receipt'] },
  { id: 'R005', name: '仓储管理员', code: 'warehouse', desc: '出入库与物流轨迹', members: 4, status: '启用', createdAt: '2025-12-15', permissions: ['procurement:io', 'procurement:exception', 'logistics:provider', 'logistics:tracking'] },
  { id: 'R006', name: '财务', code: 'finance', desc: '报表与导出权限', members: 3, status: '启用', createdAt: '2026-01-06', permissions: ['report:order', 'report:shop'] },
  { id: 'R007', name: '只读观察员', code: 'viewer', desc: '仅查看商品与订单', members: 1, status: '停用', createdAt: '2026-02-18', permissions: ['commodity:products', 'trade:order'] },
];

export const SUB_ACCOUNTS: SubAccount[] = [
  { id: 'A001', account: 'liuyang', name: '刘洋', phone: '13800138011', email: 'liuyang@camel.com', dept: '运营中心', roles: ['商品运营'], status: '启用', lastLogin: '2026-10-31 09:18:00' },
  { id: 'A002', account: 'chenxi', name: '陈曦', phone: '13800138012', email: 'chenxi@camel.com', dept: '商品运营部', roles: ['商品运营'], status: '启用', lastLogin: '2026-10-30 18:42:00' },
  { id: 'A003', account: 'wangyu', name: '王宇', phone: '13800138013', email: 'wangyu@camel.com', dept: '店铺运营部', roles: ['商品运营', '财务'], status: '启用', lastLogin: '2026-10-31 08:55:00' },
  { id: 'A004', account: 'zhaolei', name: '赵磊', phone: '13800138014', email: 'zhaolei@camel.com', dept: '采购中心', roles: ['采购专员'], status: '启用', lastLogin: '2026-10-30 17:20:00' },
  { id: 'A005', account: 'sunqi', name: '孙琦', phone: '13800138015', email: 'sunqi@camel.com', dept: '采购一部', roles: ['采购专员'], status: '启用', lastLogin: '2026-10-29 14:06:00' },
  { id: 'A006', account: 'zhoumin', name: '周敏', phone: '13800138016', email: 'zhoumin@camel.com', dept: '供应商管理部', roles: ['采购专员'], status: '停用', lastLogin: '2026-10-12 10:31:00' },
  { id: 'A007', account: 'huanglei', name: '黄磊', phone: '13800138017', email: 'huanglei@camel.com', dept: '仓储物流', roles: ['仓储管理员'], status: '启用', lastLogin: '2026-10-30 20:12:00' },
  { id: 'A008', account: 'linwei', name: '林伟', phone: '13800138018', email: 'linwei@camel.com', dept: '深圳仓', roles: ['仓储管理员'], status: '启用', lastLogin: '2026-10-31 07:45:00' },
  { id: 'A009', account: 'wuqian', name: '吴倩', phone: '13800138019', email: 'wuqian@camel.com', dept: '财务部', roles: ['财务'], status: '启用', lastLogin: '2026-10-30 16:33:00' },
  { id: 'A010', account: 'ceshi', name: '测试账号', phone: '13800138020', email: 'ceshi@camel.com', dept: '技术部', roles: ['只读观察员'], status: '停用', lastLogin: '2026-09-30 11:02:00' },
];

export const STORE_AUTHS: StoreAuth[] = [
  { id: 'SA001', platform: '敦煌网', platformId: '152', alias: 'bags-store', name: '152 包包', status: '启用', authStatus: '已授权', expiry: '2026-12-31', subAccount: 'liuyang' },
  { id: 'SA002', platform: '敦煌网', platformId: '153', alias: 'shoes-store', name: '153 鞋子', status: '启用', authStatus: '已授权', expiry: '2026-11-30', subAccount: 'chenxi' },
  { id: 'SA003', platform: '敦煌网', platformId: '155', alias: 'clothes-store', name: '155 clothes', status: '启用', authStatus: '已授权', expiry: '2027-01-20', subAccount: 'wangyu' },
  { id: 'SA004', platform: '敦煌网', platformId: '161', alias: 'sneakerhub8', name: '161 sneakerhub8', status: '启用', authStatus: '即将过期', expiry: '2026-11-05', subAccount: 'wangyu' },
  { id: 'SA005', platform: '敦煌网', platformId: '1957', alias: 'echvolt', name: '1957 echvolt', status: '停用', authStatus: '已过期', expiry: '2026-09-30', subAccount: 'ceshi' },
  { id: 'SA006', platform: '拼多多', platformId: 'PDD8821', alias: 'pdd-home', name: '拼多多家居店', status: '启用', authStatus: '已授权', expiry: '2026-12-18', subAccount: 'liuyang' },
  { id: 'SA007', platform: '拼多多', platformId: 'PDD9012', alias: 'pdd-bag', name: '拼多多箱包店', status: '停用', authStatus: '已过期', expiry: '2026-08-31', subAccount: 'chenxi' },
  { id: 'SA008', platform: 'Shopify', platformId: 'SHOP-7781', alias: 'camel-us', name: 'Camel Captain US', status: '启用', authStatus: '已授权', expiry: '2027-03-01', subAccount: 'wangyu' },
  { id: 'SA009', platform: 'Shopify', platformId: 'SHOP-7782', alias: 'camel-eu', name: 'Camel Captain EU', status: '启用', authStatus: '已授权', expiry: '2027-03-01', subAccount: 'wangyu' },
];

export const PURCHASE_ACCOUNTS: PurchaseAccount[] = [
  { id: 'PA001', platform: '1688', account: 'camel_buyer01', nickname: '骆驼采购一号', authStatus: '已授权', stores: '152 包包、155 clothes', expiry: '2027-01-10', lastUsed: '2026-10-31 09:02:00', status: '启用' },
  { id: 'PA002', platform: '1688', account: 'camel_buyer02', nickname: '骆驼采购二号', authStatus: '已授权', stores: '153 鞋子、161 sneakerhub8', expiry: '2026-12-20', lastUsed: '2026-10-30 18:15:00', status: '启用' },
  { id: 'PA003', platform: '1688', account: 'camel_buyer03', nickname: '骆驼采购三号', authStatus: '已过期', stores: '1957 echvolt', expiry: '2026-09-30', lastUsed: '2026-09-28 11:20:00', status: '停用' },
  { id: 'PA004', platform: '拼多多', account: 'pdd_camel01', nickname: '拼多多采购号', authStatus: '已授权', stores: '152 包包', expiry: '2027-02-14', lastUsed: '2026-10-29 15:44:00', status: '启用' },
  { id: 'PA005', platform: '淘宝', account: 'tb_camel01', nickname: '淘宝采购号', authStatus: '待授权', stores: '-', expiry: '-', lastUsed: '-', status: '启用' },
];

export const APPROVAL_FLOWS: ApprovalFlow[] = [
  {
    id: 'AF001',
    name: '采购单金额审批',
    business: '采购单',
    nodeCount: 3,
    status: '启用',
    updatedAt: '2026-10-28 14:10:00',
    nodes: [
      { id: 'N1', name: '采购主管审批', type: '主管', approver: 'zhaolei', mode: '或签' },
      { id: 'N2', name: '金额 ≥ 5000 元', type: '条件', approver: '财务', mode: '条件分支' },
      { id: 'N3', name: '财务审批', type: '角色', approver: '财务', mode: '会签' },
    ],
  },
  {
    id: 'AF002',
    name: '商品改价审批',
    business: '改价',
    nodeCount: 2,
    status: '启用',
    updatedAt: '2026-10-22 09:35:00',
    nodes: [
      { id: 'N1', name: '运营主管审批', type: '主管', approver: 'liuyang', mode: '或签' },
      { id: 'N2', name: '抄送财务', type: '抄送', approver: '财务', mode: '抄送' },
    ],
  },
  {
    id: 'AF003',
    name: '商品发布审核',
    business: '商品发布',
    nodeCount: 2,
    status: '启用',
    updatedAt: '2026-10-15 16:48:00',
    nodes: [
      { id: 'N1', name: '类目审核', type: '指定人', approver: 'chenxi', mode: '或签' },
      { id: 'N2', name: '内容合规审核', type: '角色', approver: '商品运营', mode: '会签' },
    ],
  },
  {
    id: 'AF004',
    name: '退款审批',
    business: '退款',
    nodeCount: 3,
    status: '停用',
    updatedAt: '2026-09-30 11:20:00',
    nodes: [
      { id: 'N1', name: '客服主管审批', type: '主管', approver: 'wangyu', mode: '或签' },
      { id: 'N2', name: '金额 ≥ 200 USD', type: '条件', approver: '财务', mode: '条件分支' },
      { id: 'N3', name: '财务审批', type: '角色', approver: '财务', mode: '会签' },
    ],
  },
];

export const OPER_LOGS: OperLog[] = (() => {
  const rng = createRng(20261108);
  const modules = ['商品管理', '订单管理', '采购管理', '物流管理', '系统管理', '基础配置'];
  const actions = ['新增商品', '编辑商品', '删除商品', '批量更新发布', '导出订单', '修改订单备注', '新增供应商', '编辑物流渠道', '新增子账号', '修改角色权限', '更新上新价模板'];
  return Array.from({ length: 160 }, (_, index) => ({
    id: makeCode('LOG', index, 7),
    time: dayOffset(intBetween(rng, -30, 0), intBetween(rng, 0, 23), intBetween(rng, 0, 59)),
    operator: pick(rng, ['admin', 'liuyang', 'chenxi', 'wangyu', 'zhaolei', 'huanglei']),
    account: pick(rng, ['admin', 'liuyang', 'chenxi', 'wangyu']),
    module: pick(rng, modules),
    action: pick(rng, actions),
    ip: `192.168.${intBetween(rng, 1, 20)}.${intBetween(rng, 10, 240)}`,
    result: rng() > 0.08 ? '成功' : '失败',
  }));
})();
