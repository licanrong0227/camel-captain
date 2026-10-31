import React, { useMemo, useState } from 'react';
import {
  ErpButton,
  ErpDescriptions,
  ErpDialog,
  ErpDrawer,
  ErpForm,
  ErpFormItem,
  ErpInput,
  ErpInputNumber,
  ErpRadioGroup,
  ErpSection,
  ErpSelect,
  ErpStatusTag,
  ErpSwitch,
  ErpTag,
  ErpTree,
  erpConfirm,
  erpMessage,
  type TreeNode,
} from '../components/ui';
import { FilterBar, ListPage, PageHeader } from '../components/ListPage';
import { ExportDialog, FormDialog } from '../components/dialogs/common';
import {
  APPROVAL_FLOWS,
  DEPTS,
  OPER_LOGS,
  PERMISSION_LEAVES,
  PERMISSION_TREE,
  PURCHASE_ACCOUNTS,
  ROLES,
  STORE_AUTHS,
  SUB_ACCOUNTS,
  type ApprovalFlow,
  type ApprovalNode,
  type Dept,
  type OperLog,
  type PurchaseAccount,
  type Role,
  type StoreAuth,
  type SubAccount,
} from '../data/system';
import { STORE_OPTIONS } from '../data/util';
import dhgateIcon from '../assets/platforms/dhgate-2.png';
import pddIcon from '../assets/platforms/pdd.png';
import shopifyIcon from '../assets/platforms/shopify.png';

const PERMISSION_TREE_NODES: TreeNode[] = PERMISSION_TREE.map((node) => ({
  key: node.id,
  label: node.label,
  children: node.children.map((child) => ({ key: child.id, label: child.label })),
}));

export function DeptPage() {
  const [rows, setRows] = useState<Dept[]>(DEPTS);
  const [selected, setSelected] = useState('D001');
  const [keyword, setKeyword] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [current, setCurrent] = useState<Dept | null>(null);

  const treeData: TreeNode[] = useMemo(() => {
    const roots = rows.filter((row) => !row.parentId);
    const build = (parentId: string): TreeNode[] =>
      rows
        .filter((row) => row.parentId === parentId)
        .map((row) => ({ key: row.id, label: row.name, children: build(row.id) }));
    return roots.map((root) => ({ key: root.id, label: root.name, children: build(root.id) }));
  }, [rows]);

  const filtered = rows.filter((row) => !keyword || row.name.includes(keyword) || row.leader.includes(keyword));

  return (
    <div className="erp-page">
      <PageHeader title="部门管理" description="维护组织架构、部门负责人与成员数量。" extra={<ErpButton variant="primary" onClick={() => { setCurrent(null); setDialogOpen(true); }}>新增部门</ErpButton>} />
      <div style={{ display: 'grid', gridTemplateColumns: '280px minmax(0, 1fr)', gap: 12, alignItems: 'start' }}>
        <div className="erp-card" style={{ padding: 16 }}>
          <ErpTree data={treeData} selectedKey={selected} onSelect={setSelected} defaultExpanded={['D001', 'D002', 'D005', 'D008']} />
        </div>
        <div className="erp-card" style={{ padding: 20 }}>
          <FilterBar onQuery={() => undefined} onReset={() => setKeyword('')}>
            <span className="erp-filter-field"><label>关键词</label><ErpInput value={keyword} onChange={setKeyword} placeholder="部门名称 / 负责人" style={{ width: 220 }} /></span>
          </FilterBar>
          <ListPage
            header={null}
            columns={[
              { key: 'name', title: '部门名称', minWidth: 180 },
              { key: 'parent', title: '上级部门', width: 140, render: (row) => DEPTS.find((dept) => dept.id === row.parentId)?.name || '-' },
              { key: 'leader', title: '负责人', width: 100 },
              { key: 'members', title: '成员数', width: 90, align: 'right', sortable: true },
              { key: 'sort', title: '排序', width: 80, align: 'right' },
              { key: 'status', title: '状态', width: 80, render: (row) => <ErpStatusTag status={row.status} /> },
              { key: 'createdAt', title: '创建时间', width: 110 },
            ]}
            rows={filtered}
            rowKey={(row) => row.id}
            sortable
            filterKey={keyword}
            rowActions={(row) => [
              { label: '编辑', onClick: () => { setCurrent(row); setDialogOpen(true); } },
              { label: '新增子部门', onClick: () => { setCurrent({ ...row, id: '', name: '', parentId: row.id, leader: '', members: 0 }); setDialogOpen(true); } },
              { label: '删除', danger: true, onClick: async () => { if (await erpConfirm({ content: `确定删除部门「${row.name}」吗？`, danger: true })) { setRows((prev) => prev.filter((item) => item.id !== row.id)); erpMessage('已删除（演示）'); } } },
            ]}
          />
        </div>
      </div>
      <FormDialog
        open={dialogOpen}
        title={current?.id ? '编辑部门' : '新增部门'}
        width={560}
        fields={[
          { key: 'name', label: '部门名称', required: true },
          { key: 'parentId', label: '上级部门', type: 'select', options: rows.map((row) => ({ label: row.name, value: row.id })) },
          { key: 'leader', label: '负责人', required: true },
          { key: 'sort', label: '排序', type: 'number', min: 1 },
          { key: 'status', label: '状态', type: 'select', options: [{ label: '启用', value: '启用' }, { label: '停用', value: '停用' }] },
        ]}
        initial={current ? { name: current.name, parentId: current.parentId, leader: current.leader, sort: current.sort, status: current.status } : { parentId: 'D001', status: '启用', sort: 1 }}
        onClose={() => setDialogOpen(false)}
        onSubmit={(values) => {
          const next: Dept = {
            id: current?.id || `D${String(rows.length + 1).padStart(3, '0')}`,
            name: String(values.name || ''),
            parentId: String(values.parentId || ''),
            leader: String(values.leader || ''),
            members: current?.members || 0,
            sort: Number(values.sort || 1),
            status: String(values.status || '启用'),
            createdAt: current?.createdAt || '2026-10-31',
          };
          setRows((prev) => (current?.id ? prev.map((row) => (row.id === current.id ? next : row)) : [...prev, next]));
          setDialogOpen(false);
          erpMessage('部门已保存（演示）');
        }}
      />
    </div>
  );
}

export function RolePage() {
  const [rows, setRows] = useState<Role[]>(ROLES);
  const [keyword, setKeyword] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [current, setCurrent] = useState<Role | null>(null);
  const [permissionOpen, setPermissionOpen] = useState(false);
  const [permissionRole, setPermissionRole] = useState<Role | null>(null);
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
  const [dataScope, setDataScope] = useState('全部数据');

  const filtered = rows.filter((row) => !appliedKeyword || row.name.includes(appliedKeyword) || row.code.includes(appliedKeyword));

  return (
    <div className="erp-page">
      <PageHeader title="角色管理" description="配置角色菜单权限、数据范围与成员。" extra={<ErpButton variant="primary" onClick={() => { setCurrent(null); setDialogOpen(true); }}>新增角色</ErpButton>} />
      <div className="erp-card" style={{ padding: 20 }}>
        <FilterBar onQuery={() => setAppliedKeyword(keyword)} onReset={() => { setKeyword(''); setAppliedKeyword(''); }}>
          <span className="erp-filter-field"><label>角色</label><ErpInput value={keyword} onChange={setKeyword} placeholder="角色名称 / 编码" style={{ width: 220 }} /></span>
        </FilterBar>
        <ListPage
          header={null}
          columns={[
            { key: 'name', title: '角色名称', minWidth: 160 },
            { key: 'code', title: '角色编码', width: 160, render: (row) => <span className="erp-code">{row.code}</span> },
            { key: 'desc', title: '描述', minWidth: 240, render: (row) => <span className="erp-small erp-muted">{row.desc}</span> },
            { key: 'members', title: '成员数', width: 90, align: 'right', sortable: true },
            { key: 'status', title: '状态', width: 80, render: (row) => <ErpStatusTag status={row.status} /> },
            { key: 'createdAt', title: '创建时间', width: 110 },
          ]}
          rows={filtered}
          rowKey={(row) => row.id}
          sortable
          filterKey={appliedKeyword}
          rowActions={(row) => [
            { label: '权限', onClick: () => { setPermissionRole(row); setCheckedKeys(row.permissions); setDataScope('全部数据'); setPermissionOpen(true); } },
            { label: '成员', onClick: () => erpMessage(`查看角色成员：${row.name}（演示）`) },
            { label: '编辑', onClick: () => { setCurrent(row); setDialogOpen(true); } },
            { label: '删除', danger: true, onClick: async () => { if (await erpConfirm({ content: `确定删除角色「${row.name}」吗？`, danger: true })) { setRows((prev) => prev.filter((item) => item.id !== row.id)); erpMessage('已删除（演示）'); } } },
          ]}
        />
      </div>
      <FormDialog
        open={dialogOpen}
        title={current ? '编辑角色' : '新增角色'}
        width={600}
        fields={[
          { key: 'name', label: '角色名称', required: true },
          { key: 'code', label: '角色编码', required: true },
          { key: 'desc', label: '角色描述', type: 'textarea' },
          { key: 'status', label: '状态', type: 'select', options: [{ label: '启用', value: '启用' }, { label: '停用', value: '停用' }] },
        ]}
        initial={current ? { name: current.name, code: current.code, desc: current.desc, status: current.status } : { status: '启用' }}
        onClose={() => setDialogOpen(false)}
        onSubmit={(values) => {
          const next: Role = {
            id: current?.id || `R${String(rows.length + 1).padStart(3, '0')}`,
            name: String(values.name || ''),
            code: String(values.code || ''),
            desc: String(values.desc || ''),
            members: current?.members || 0,
            status: String(values.status || '启用'),
            createdAt: current?.createdAt || '2026-10-31',
            permissions: current?.permissions || [],
          };
          setRows((prev) => (current ? prev.map((row) => (row.id === current.id ? next : row)) : [next, ...prev]));
          setDialogOpen(false);
          erpMessage('角色已保存（演示）');
        }}
      />
      <ErpDrawer
        open={permissionOpen}
        title={`权限配置 · ${permissionRole?.name || ''}`}
        width={620}
        onClose={() => setPermissionOpen(false)}
        footer={
          <>
            <ErpButton onClick={() => setPermissionOpen(false)}>取消</ErpButton>
            <ErpButton variant="primary" onClick={() => {
              setRows((prev) => prev.map((row) => (row.id === permissionRole?.id ? { ...row, permissions: checkedKeys } : row)));
              setPermissionOpen(false);
              erpMessage('权限已保存（演示）');
            }}>保存权限</ErpButton>
          </>
        }
      >
        <div className="erp-stack" style={{ gap: 16 }}>
          <div className="erp-flex-between">
            <span className="erp-small erp-muted">已选 {checkedKeys.length} / {PERMISSION_LEAVES.length} 项</span>
            <div className="erp-flex">
              <ErpButton size="small" onClick={() => setCheckedKeys(PERMISSION_LEAVES)}>全选</ErpButton>
              <ErpButton size="small" onClick={() => setCheckedKeys([])}>清空</ErpButton>
            </div>
          </div>
          <ErpTree data={PERMISSION_TREE_NODES} checkable checkedKeys={checkedKeys} onCheck={setCheckedKeys} defaultExpanded={PERMISSION_TREE.map((node) => node.id)} />
          <ErpSection title="数据范围">
            <ErpRadioGroup options={['全部数据', '本部门', '本部门及以下', '仅本人', '自定义'].map((value) => ({ label: value, value }))} value={dataScope} onChange={setDataScope} />
          </ErpSection>
        </div>
      </ErpDrawer>
    </div>
  );
}

export function SubAccountPage() {
  const [rows, setRows] = useState<SubAccount[]>(SUB_ACCOUNTS);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const [dept, setDept] = useState('');
  const [applied, setApplied] = useState({ keyword: '', status: '', dept: '' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [current, setCurrent] = useState<SubAccount | null>(null);

  const filtered = rows.filter(
    (row) =>
      (!applied.keyword || row.account.includes(applied.keyword) || row.name.includes(applied.keyword) || row.phone.includes(applied.keyword)) &&
      (!applied.status || row.status === applied.status) &&
      (!applied.dept || row.dept === applied.dept),
  );

  return (
    <div className="erp-page">
      <PageHeader title="子账号管理" description="维护子账号、所属部门、角色与登录状态。" extra={<ErpButton variant="primary" onClick={() => { setCurrent(null); setDialogOpen(true); }}>新增子账号</ErpButton>} />
      <div className="erp-card" style={{ padding: 20 }}>
        <FilterBar onQuery={() => setApplied({ keyword, status, dept })} onReset={() => { setKeyword(''); setStatus(''); setDept(''); setApplied({ keyword: '', status: '', dept: '' }); }}>
          <span className="erp-filter-field"><label>关键词</label><ErpInput value={keyword} onChange={setKeyword} onEnter={() => setApplied({ keyword, status, dept })} placeholder="账号 / 姓名 / 手机" style={{ width: 200 }} /></span>
          <span className="erp-filter-field"><label>部门</label><ErpSelect options={DEPTS.map((item) => ({ label: item.name, value: item.name }))} value={dept} onChange={(value) => setDept(String(value))} clearable width={150} /></span>
          <span className="erp-filter-field"><label>状态</label><ErpSelect options={[{ label: '启用', value: '启用' }, { label: '停用', value: '停用' }]} value={status} onChange={(value) => setStatus(String(value))} clearable width={120} /></span>
        </FilterBar>
        <ListPage
          header={null}
          columns={[
            { key: 'account', title: '账号', width: 130, render: (row) => <span className="erp-code">{row.account}</span> },
            { key: 'name', title: '姓名', width: 100 },
            { key: 'phone', title: '手机', width: 130 },
            { key: 'email', title: '邮箱', minWidth: 190 },
            { key: 'dept', title: '部门', width: 130 },
            { key: 'roles', title: '角色', width: 180, render: (row) => <div className="erp-tag-list">{row.roles.map((role) => <ErpTag key={role} tone="info">{role}</ErpTag>)}</div> },
            { key: 'status', title: '状态', width: 80, render: (row) => <ErpSwitch checked={row.status === '启用'} onChange={(checked) => setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, status: checked ? '启用' : '停用' } : item)))} /> },
            { key: 'lastLogin', title: '最近登录', width: 160 },
          ]}
          rows={filtered}
          rowKey={(row) => row.id}
          selectable
          filterKey={`${applied.keyword}-${applied.status}-${applied.dept}`}
          rowActions={(row) => [
            { label: '编辑', onClick: () => { setCurrent(row); setDialogOpen(true); } },
            { label: '重置密码', onClick: async () => { if (await erpConfirm({ title: '重置密码', content: `将为账号 ${row.account} 生成临时密码（演示）。` })) erpMessage('临时密码已生成：Camel@2026（演示）'); } },
            { label: row.status === '启用' ? '停用' : '启用', onClick: () => { setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, status: item.status === '启用' ? '停用' : '启用' } : item))); erpMessage('账号状态已更新（演示）'); } },
            { label: '删除', danger: true, onClick: async () => { if (await erpConfirm({ content: `确定删除子账号「${row.account}」吗？`, danger: true })) { setRows((prev) => prev.filter((item) => item.id !== row.id)); erpMessage('已删除（演示）'); } } },
          ]}
          batchActions={(selected) => [
            { label: '批量启用', onClick: () => { setRows((prev) => prev.map((row) => (selected.some((target) => target.id === row.id) ? { ...row, status: '启用' } : row))); erpMessage('已批量启用（演示）'); } },
            { label: '批量停用', onClick: () => { setRows((prev) => prev.map((row) => (selected.some((target) => target.id === row.id) ? { ...row, status: '停用' } : row))); erpMessage('已批量停用（演示）'); } },
            { label: '删除', danger: true, onClick: async () => { if (await erpConfirm({ content: `确定删除选中的 ${selected.length} 个子账号吗？`, danger: true })) { setRows((prev) => prev.filter((row) => !selected.some((target) => target.id === row.id))); erpMessage('已删除（演示）'); } } },
          ]}
        />
      </div>
      <FormDialog
        open={dialogOpen}
        title={current ? '编辑子账号' : '新增子账号'}
        width={720}
        fields={[
          { key: 'account', label: '登录账号', required: true },
          { key: 'name', label: '姓名', required: true },
          { key: 'phone', label: '手机号', required: true },
          { key: 'email', label: '邮箱', required: true },
          { key: 'dept', label: '所属部门', type: 'select', options: DEPTS.map((item) => ({ label: item.name, value: item.name })) },
          { key: 'roles', label: '角色', type: 'select', multiple: true, options: ROLES.map((item) => ({ label: item.name, value: item.name })) },
          { key: 'status', label: '状态', type: 'select', options: [{ label: '启用', value: '启用' }, { label: '停用', value: '停用' }] },
          { key: 'password', label: '初始密码', type: 'password', help: current ? '留空则不修改密码' : '建议包含大小写与数字' },
        ]}
        initial={current ? { account: current.account, name: current.name, phone: current.phone, email: current.email, dept: current.dept, roles: current.roles, status: current.status } : { status: '启用', roles: ['商品运营'] }}
        onClose={() => setDialogOpen(false)}
        onSubmit={(values) => {
          const next: SubAccount = {
            id: current?.id || `A${String(rows.length + 1).padStart(3, '0')}`,
            account: String(values.account || ''),
            name: String(values.name || ''),
            phone: String(values.phone || ''),
            email: String(values.email || ''),
            dept: String(values.dept || ''),
            roles: (values.roles as string[]) || [],
            status: String(values.status || '启用'),
            lastLogin: current?.lastLogin || '-',
          };
          setRows((prev) => (current ? prev.map((row) => (row.id === current.id ? next : row)) : [next, ...prev]));
          setDialogOpen(false);
          erpMessage('子账号已保存（演示）');
        }}
      />
    </div>
  );
}

export function StoreAuthPage() {
  const [rows, setRows] = useState<StoreAuth[]>(STORE_AUTHS);
  const [platform, setPlatform] = useState('敦煌网');
  const [keyword, setKeyword] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const platforms = ['敦煌网', '拼多多', 'Shopify'];
  const filtered = rows.filter((row) => row.platform === platform && (!appliedKeyword || row.name.includes(appliedKeyword) || row.alias.includes(appliedKeyword) || row.platformId.includes(appliedKeyword)));

  return (
    <div className="erp-page">
      <PageHeader title="店铺授权" description="管理各平台店铺授权状态、到期时间与负责人。" extra={<ErpButton variant="primary" onClick={() => setDialogOpen(true)}>新增店铺</ErpButton>} />
      <div className="erp-card" style={{ padding: '0 20px 0' }}>
        <div style={{ paddingTop: 14 }}>
          <FilterBar onQuery={() => setAppliedKeyword(keyword)} onReset={() => { setKeyword(''); setAppliedKeyword(''); }}>
            <span className="erp-filter-field"><label>关键词</label><ErpInput value={keyword} onChange={setKeyword} onEnter={() => setAppliedKeyword(keyword)} placeholder="店铺名称 / 别名 / 平台 ID" style={{ width: 240 }} /></span>
          </FilterBar>
        </div>
        <ListPage
          header={null}
          tabs={platforms.map((item) => ({ key: item, label: item, count: rows.filter((row) => row.platform === item).length }))}
          activeTab={platform}
          onTabChange={setPlatform}
          columns={[
            { key: 'name', title: '店铺', minWidth: 190, render: (row) => <div className="erp-flex"><img src={platform === '敦煌网' ? dhgateIcon : platform === '拼多多' ? pddIcon : shopifyIcon} alt="" style={{ width: 20, height: 20, objectFit: 'contain' }} /><span>{row.name}</span></div> },
            { key: 'platformId', title: '平台 ID', width: 130, render: (row) => <span className="erp-code">{row.platformId}</span> },
            { key: 'alias', title: '店铺别名', width: 150 },
            { key: 'subAccount', title: '负责人', width: 110 },
            { key: 'status', title: '状态', width: 80, render: (row) => <ErpStatusTag status={row.status} /> },
            { key: 'authStatus', title: '授权状态', width: 100, render: (row) => <ErpStatusTag status={row.authStatus} /> },
            { key: 'expiry', title: '到期时间', width: 110 },
          ]}
          rows={filtered}
          rowKey={(row) => row.id}
          filterKey={`${platform}-${appliedKeyword}`}
          rowActions={(row) => [
            { label: '重新授权', onClick: async () => { if (await erpConfirm({ title: '重新授权', content: `将跳转到 ${row.platform} 授权页（演示，不会真实跳转）。` })) erpMessage('授权已刷新（演示）'); } },
            { label: row.status === '启用' ? '停用' : '启用', onClick: () => { setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, status: item.status === '启用' ? '停用' : '启用' } : item))); erpMessage('店铺状态已更新（演示）'); } },
            { label: '删除', danger: true, onClick: async () => { if (await erpConfirm({ content: `确定删除店铺「${row.name}」吗？`, danger: true })) { setRows((prev) => prev.filter((item) => item.id !== row.id)); erpMessage('已删除（演示）'); } } },
          ]}
        />
      </div>
      <FormDialog
        open={dialogOpen}
        title="新增店铺"
        width={640}
        fields={[
          { key: 'platform', label: '所属平台', type: 'select', options: platforms.map((value) => ({ label: value, value })), required: true },
          { key: 'name', label: '店铺名称', required: true },
          { key: 'alias', label: '店铺别名', required: true },
          { key: 'platformId', label: '平台店铺 ID', required: true },
          { key: 'subAccount', label: '负责人', type: 'select', options: SUB_ACCOUNTS.map((item) => ({ label: item.name, value: item.account })) },
          { key: 'status', label: '状态', type: 'select', options: [{ label: '启用', value: '启用' }, { label: '停用', value: '停用' }] },
        ]}
        initial={{ platform: '敦煌网', status: '启用' }}
        onClose={() => setDialogOpen(false)}
        onSubmit={(values) => {
          const next: StoreAuth = {
            id: `SA${String(rows.length + 1).padStart(3, '0')}`,
            platform: String(values.platform || '敦煌网'),
            platformId: String(values.platformId || ''),
            alias: String(values.alias || ''),
            name: String(values.name || ''),
            status: String(values.status || '启用'),
            authStatus: '已授权',
            expiry: '2027-10-31',
            subAccount: String(values.subAccount || 'admin'),
          };
          setRows((prev) => [next, ...prev]);
          setDialogOpen(false);
          erpMessage('店铺已新增（演示）');
        }}
      />
    </div>
  );
}

export function PurchaseAccountAuthPage() {
  const [rows, setRows] = useState<PurchaseAccount[]>(PURCHASE_ACCOUNTS);
  const [keyword, setKeyword] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrAccount, setQrAccount] = useState<PurchaseAccount | null>(null);

  const filtered = rows.filter((row) => !appliedKeyword || row.account.includes(appliedKeyword) || row.nickname.includes(appliedKeyword));

  return (
    <div className="erp-page">
      <PageHeader title="采购账号授权" description="授权 1688、拼多多等采购账号，用于代发采购与订单下单。" extra={<ErpButton variant="primary" onClick={() => setDialogOpen(true)}>新增采购账号</ErpButton>} />
      <div className="erp-card" style={{ padding: 20 }}>
        <FilterBar onQuery={() => setAppliedKeyword(keyword)} onReset={() => { setKeyword(''); setAppliedKeyword(''); }}>
          <span className="erp-filter-field"><label>关键词</label><ErpInput value={keyword} onChange={setKeyword} onEnter={() => setAppliedKeyword(keyword)} placeholder="账号 / 昵称" style={{ width: 220 }} /></span>
        </FilterBar>
        <ListPage
          header={null}
          columns={[
            { key: 'platform', title: '平台', width: 90 },
            { key: 'account', title: '账号', width: 150, render: (row) => <span className="erp-code">{row.account}</span> },
            { key: 'nickname', title: '昵称', width: 140 },
            { key: 'authStatus', title: '授权状态', width: 100, render: (row) => <ErpStatusTag status={row.authStatus} /> },
            { key: 'stores', title: '绑定店铺', minWidth: 220 },
            { key: 'expiry', title: '到期时间', width: 110 },
            { key: 'lastUsed', title: '最近使用', width: 160 },
            { key: 'status', title: '状态', width: 80, render: (row) => <ErpStatusTag status={row.status} /> },
          ]}
          rows={filtered}
          rowKey={(row) => row.id}
          filterKey={appliedKeyword}
          rowActions={(row) => [
            { label: '授权', onClick: () => { setQrAccount(row); setQrOpen(true); } },
            { label: '编辑', onClick: () => erpMessage(`编辑采购账号 ${row.account}（演示）`) },
            { label: '解绑', danger: true, onClick: async () => { if (await erpConfirm({ content: `确定解绑采购账号 ${row.account} 吗？`, danger: true })) { setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, authStatus: '待授权', stores: '-' } : item))); erpMessage('已解绑（演示）'); } } },
          ]}
        />
      </div>
      <FormDialog
        open={dialogOpen}
        title="新增采购账号"
        width={560}
        fields={[
          { key: 'platform', label: '平台', type: 'select', options: ['1688', '拼多多', '淘宝'].map((value) => ({ label: value, value })), required: true },
          { key: 'account', label: '采购账号', required: true },
          { key: 'nickname', label: '账号昵称', required: true },
          { key: 'stores', label: '绑定店铺', type: 'select', multiple: true, options: STORE_OPTIONS },
        ]}
        initial={{ platform: '1688' }}
        onClose={() => setDialogOpen(false)}
        onSubmit={(values) => {
          const next: PurchaseAccount = {
            id: `PA${String(rows.length + 1).padStart(3, '0')}`,
            platform: String(values.platform || '1688'),
            account: String(values.account || ''),
            nickname: String(values.nickname || ''),
            authStatus: '待授权',
            stores: ((values.stores as string[]) || []).join('、') || '-',
            expiry: '-',
            lastUsed: '-',
            status: '启用',
          };
          setRows((prev) => [next, ...prev]);
          setDialogOpen(false);
          erpMessage('采购账号已新增，请完成授权（演示）');
        }}
      />
      <ErpDialog open={qrOpen} title={`授权采购账号 · ${qrAccount?.account || ''}`} width={460} onClose={() => setQrOpen(false)} footer={<><ErpButton onClick={() => setQrOpen(false)}>取消</ErpButton><ErpButton variant="primary" onClick={() => { setRows((prev) => prev.map((item) => (item.id === qrAccount?.id ? { ...item, authStatus: '已授权', expiry: '2027-10-31' } : item))); setQrOpen(false); erpMessage('授权成功（演示）'); }}>我已完成授权</ErpButton></>}>
        <div className="erp-stack" style={{ alignItems: 'center', gap: 12 }}>
          <div className="erp-qr">扫码授权二维码</div>
          <p className="erp-small erp-muted">请使用 {qrAccount?.platform} App 扫码并确认授权，二维码 5 分钟内有效。</p>
        </div>
      </ErpDialog>
    </div>
  );
}

export function ApprovalFlowPage() {
  const [rows, setRows] = useState<ApprovalFlow[]>(APPROVAL_FLOWS);
  const [keyword, setKeyword] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [designerOpen, setDesignerOpen] = useState(false);
  const [current, setCurrent] = useState<ApprovalFlow | null>(null);
  const [nodes, setNodes] = useState<ApprovalNode[]>([]);
  const [name, setName] = useState('');
  const [business, setBusiness] = useState('采购单');

  const openDesigner = (flow: ApprovalFlow | null) => {
    setCurrent(flow);
    setName(flow?.name || '');
    setBusiness(flow?.business || '采购单');
    setNodes(flow?.nodes || [{ id: 'N1', name: '审批节点', type: '角色', approver: '商品运营', mode: '或签' }]);
    setDesignerOpen(true);
  };

  const filtered = rows.filter((row) => !appliedKeyword || row.name.includes(appliedKeyword));

  return (
    <div className="erp-page">
      <PageHeader title="审批流" description="为采购、改价、商品发布等业务配置审批节点与条件分支。" extra={<ErpButton variant="primary" onClick={() => openDesigner(null)}>新建审批流</ErpButton>} />
      <div className="erp-card" style={{ padding: 20 }}>
        <FilterBar onQuery={() => setAppliedKeyword(keyword)} onReset={() => { setKeyword(''); setAppliedKeyword(''); }}>
          <span className="erp-filter-field"><label>流程名称</label><ErpInput value={keyword} onChange={setKeyword} onEnter={() => setAppliedKeyword(keyword)} placeholder="请输入流程名称" style={{ width: 220 }} /></span>
        </FilterBar>
        <ListPage
          header={null}
          columns={[
            { key: 'name', title: '流程名称', minWidth: 180 },
            { key: 'business', title: '适用业务', width: 120, render: (row) => <ErpTag tone="info">{row.business}</ErpTag> },
            { key: 'nodeCount', title: '节点数', width: 90, align: 'right' },
            { key: 'status', title: '状态', width: 80, render: (row) => <ErpStatusTag status={row.status} /> },
            { key: 'updatedAt', title: '更新时间', width: 160 },
          ]}
          rows={filtered}
          rowKey={(row) => row.id}
          filterKey={appliedKeyword}
          rowActions={(row) => [
            { label: '编辑', onClick: () => openDesigner(row) },
            { label: '复制', onClick: () => { setRows((prev) => [{ ...row, id: `${row.id}-C`, name: `${row.name} 副本`, updatedAt: '2026-10-31 10:00:00' }, ...prev]); erpMessage('审批流已复制（演示）'); } },
            { label: row.status === '启用' ? '停用' : '启用', onClick: () => { setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, status: item.status === '启用' ? '停用' : '启用' } : item))); erpMessage('审批流状态已更新（演示）'); } },
            { label: '删除', danger: true, onClick: async () => { if (await erpConfirm({ content: `确定删除审批流「${row.name}」吗？`, danger: true })) { setRows((prev) => prev.filter((item) => item.id !== row.id)); erpMessage('已删除（演示）'); } } },
          ]}
        />
      </div>
      <ErpDrawer
        open={designerOpen}
        title={current ? '编辑审批流' : '新建审批流'}
        width={760}
        onClose={() => setDesignerOpen(false)}
        footer={
          <>
            <ErpButton onClick={() => setDesignerOpen(false)}>取消</ErpButton>
            <ErpButton variant="primary" onClick={() => {
              if (!name.trim()) {
                erpMessage('请填写流程名称', 'warning');
                return;
              }
              const next: ApprovalFlow = {
                id: current?.id || `AF${String(rows.length + 1).padStart(3, '0')}`,
                name,
                business,
                nodeCount: nodes.length,
                status: current?.status || '启用',
                updatedAt: '2026-10-31 10:00:00',
                nodes,
              };
              setRows((prev) => (current ? prev.map((row) => (row.id === current.id ? next : row)) : [next, ...prev]));
              setDesignerOpen(false);
              erpMessage('审批流已保存（演示）');
            }}>保存流程</ErpButton>
          </>
        }
      >
        <ErpForm layout="vertical">
          <div className="erp-form-grid">
            <ErpFormItem label="流程名称" required><ErpInput value={name} onChange={setName} /></ErpFormItem>
            <ErpFormItem label="适用业务"><ErpSelect options={['采购单', '退款', '改价', '商品发布'].map((value) => ({ label: value, value }))} value={business} onChange={(value) => setBusiness(String(value))} width="100%" /></ErpFormItem>
          </div>
        </ErpForm>
        <div className="erp-approval-designer">
          <div className="erp-approval-start">开始</div>
          {nodes.map((node, index) => (
            <div className={`erp-approval-node ${node.type === '条件' ? 'is-condition' : node.type === '抄送' ? 'is-cc' : ''}`} key={node.id}>
              <b>{index + 1}. {node.name}</b>
              <p>{node.type} · {node.approver} · {node.mode}</p>
              <div className="erp-approval-node__actions">
                <button
                  type="button"
                  onClick={() => {
                    const nextType = node.type === '角色' ? '条件' : node.type === '条件' ? '抄送' : '角色';
                    setNodes((prev) => prev.map((item) => (item.id === node.id ? { ...item, type: nextType } : item)));
                  }}
                >
                  切换类型
                </button>
                <button type="button" onClick={() => setNodes((prev) => prev.filter((item) => item.id !== node.id))}>删除</button>
              </div>
            </div>
          ))}
          <div className="erp-approval-end">结束</div>
          <div className="erp-flex" style={{ justifyContent: 'center', marginTop: 12 }}>
            <ErpButton size="small" onClick={() => setNodes((prev) => [...prev, { id: `N${prev.length + 1}`, name: '审批节点', type: '角色', approver: '商品运营', mode: '或签' }])}>添加审批节点</ErpButton>
            <ErpButton size="small" onClick={() => setNodes((prev) => [...prev, { id: `N${prev.length + 1}`, name: '条件分支', type: '条件', approver: '财务', mode: '条件分支' }])}>添加条件分支</ErpButton>
            <ErpButton size="small" onClick={() => setNodes((prev) => [...prev, { id: `N${prev.length + 1}`, name: '抄送节点', type: '抄送', approver: '财务', mode: '抄送' }])}>添加抄送</ErpButton>
          </div>
        </div>
      </ErpDrawer>
    </div>
  );
}

export function OperLogPage() {
  const [rows] = useState<OperLog[]>(OPER_LOGS);
  const [keyword, setKeyword] = useState('');
  const [module, setModule] = useState('');
  const [result, setResult] = useState('');
  const [applied, setApplied] = useState({ keyword: '', module: '', result: '' });
  const [detail, setDetail] = useState<OperLog | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const filtered = rows.filter(
    (row) =>
      (!applied.keyword || row.operator.includes(applied.keyword) || row.action.includes(applied.keyword) || row.ip.includes(applied.keyword)) &&
      (!applied.module || row.module === applied.module) &&
      (!applied.result || row.result === applied.result),
  );

  return (
    <div className="erp-page">
      <PageHeader title="操作日志" description="记录账号在系统中的关键操作，支持按模块、操作人与结果筛选。" />
      <div className="erp-card" style={{ padding: 20 }}>
        <FilterBar onQuery={() => setApplied({ keyword, module, result })} onReset={() => { setKeyword(''); setModule(''); setResult(''); setApplied({ keyword: '', module: '', result: '' }); }} extra={<ErpButton onClick={() => setExportOpen(true)}>导出</ErpButton>}>
          <span className="erp-filter-field"><label>关键词</label><ErpInput value={keyword} onChange={setKeyword} onEnter={() => setApplied({ keyword, module, result })} placeholder="操作人 / 操作 / IP" style={{ width: 210 }} /></span>
          <span className="erp-filter-field"><label>模块</label><ErpSelect options={['商品管理', '订单管理', '采购管理', '物流管理', '系统管理', '基础配置'].map((value) => ({ label: value, value }))} value={module} onChange={(value) => setModule(String(value))} clearable width={140} /></span>
          <span className="erp-filter-field"><label>结果</label><ErpSelect options={[{ label: '成功', value: '成功' }, { label: '失败', value: '失败' }]} value={result} onChange={(value) => setResult(String(value))} clearable width={110} /></span>
        </FilterBar>
        <ListPage
          header={null}
          columns={[
            { key: 'time', title: '时间', width: 160 },
            { key: 'operator', title: '操作人', width: 100 },
            { key: 'account', title: '账号', width: 100, render: (row) => <span className="erp-code">{row.account}</span> },
            { key: 'module', title: '模块', width: 110 },
            { key: 'action', title: '操作', minWidth: 160 },
            { key: 'ip', title: 'IP', width: 130, render: (row) => <span className="erp-code">{row.ip}</span> },
            { key: 'result', title: '结果', width: 80, render: (row) => <ErpTag tone={row.result === '成功' ? 'success' : 'danger'}>{row.result}</ErpTag> },
          ]}
          rows={filtered}
          rowKey={(row) => row.id}
          selectable
          filterKey={`${applied.keyword}-${applied.module}-${applied.result}`}
          rowActions={(row) => [{ label: '详情', onClick: () => { setDetail(row); setDetailOpen(true); } }]}
          batchActions={() => [{ label: '导出', onClick: () => setExportOpen(true) }]}
          pageSizeDefault={20}
        />
      </div>
      <ErpDrawer open={detailOpen} title="操作日志详情" width={640} onClose={() => setDetailOpen(false)} footer={<ErpButton onClick={() => setDetailOpen(false)}>关闭</ErpButton>}>
        {detail ? (
          <div className="erp-stack" style={{ gap: 16 }}>
            <ErpDescriptions columns={2} items={[{ label: '时间', value: detail.time }, { label: '操作人', value: detail.operator }, { label: '模块', value: detail.module }, { label: '操作', value: detail.action }, { label: 'IP', value: detail.ip }, { label: '结果', value: detail.result }]} />
            <ErpSection title="请求参数">
              <div className="erp-log-json">{JSON.stringify({ module: detail.module, action: detail.action, operator: detail.operator, timestamp: detail.time, payload: { ids: ['P00000123', 'P00000124'], source: 'demo' } }, null, 2)}</div>
            </ErpSection>
            <ErpSection title="响应摘要">
              <div className="erp-log-json">{JSON.stringify({ code: detail.result === '成功' ? 200 : 500, msg: detail.result === '成功' ? 'ok' : 'operation failed', data: null }, null, 2)}</div>
            </ErpSection>
          </div>
        ) : null}
      </ErpDrawer>
      <ExportDialog open={exportOpen} fields={[{ key: 'time', label: '时间' }, { key: 'operator', label: '操作人' }, { key: 'module', label: '模块' }, { key: 'action', label: '操作' }, { key: 'ip', label: 'IP' }, { key: 'result', label: '结果' }]} onClose={() => setExportOpen(false)} onConfirm={() => { setExportOpen(false); erpMessage('导出任务已创建（演示）'); }} />
    </div>
  );
}
