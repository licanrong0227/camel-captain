import React, { useState } from 'react';
import {
  ErpButton,
  ErpDialog,
  ErpForm,
  ErpFormItem,
  ErpInput,
  ErpRadioGroup,
  ErpSection,
  ErpSelect,
  ErpStatusTag,
  ErpSwitch,
  ErpTag,
  ErpUpload,
  erpConfirm,
  erpMessage,
} from '../components/ui';
import { ListPage, PageHeader } from '../components/ListPage';
import { ACCOUNT_DEVICES, ACCOUNT_PROFILE, CREDIT_USAGE, LOGIN_HISTORY, RIGHT_PLANS, type RightPlan } from '../data/account';
import { num } from '../data/util';

const TABS = ['基本信息', '账号安全', '消息通知', '我的权益', '登录记录'];

export function PersonalCenterPage() {
  const [tab, setTab] = useState('基本信息');
  const [name, setName] = useState(ACCOUNT_PROFILE.name);
  const [phone, setPhone] = useState(ACCOUNT_PROFILE.phone);
  const [email, setEmail] = useState(ACCOUNT_PROFILE.email);
  const [timezone, setTimezone] = useState(ACCOUNT_PROFILE.timezone);
  const [language, setLanguage] = useState(ACCOUNT_PROFILE.language);
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [orderNotice, setOrderNotice] = useState(true);
  const [productNotice, setProductNotice] = useState(true);
  const [systemNotice, setSystemNotice] = useState(false);
  const [mfa, setMfa] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [rightsOpen, setRightsOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<RightPlan>(RIGHT_PLANS[1]);
  const [quantity, setQuantity] = useState(1);
  const [avatar, setAvatar] = useState<string[]>([]);

  const creditsPercent = Math.round((ACCOUNT_PROFILE.credits / ACCOUNT_PROFILE.creditsTotal) * 100);

  return (
    <div className="erp-page">
      <PageHeader title="个人中心" description="管理个人资料、账号安全、消息通知与会员权益。" />
      <div style={{ display: 'grid', gridTemplateColumns: '280px minmax(0, 1fr)', gap: 12, alignItems: 'start' }}>
        <div className="erp-card" style={{ padding: 20 }}>
          <div className="erp-stack" style={{ alignItems: 'center', gap: 8 }}>
            <span className="erp-avatar" style={{ width: 72, height: 72, fontSize: 26, background: '#FF7D29', color: '#fff' }}>{name.slice(0, 1)}</span>
            <b style={{ fontSize: 16 }}>{name}</b>
            <span className="erp-small erp-muted">{ACCOUNT_PROFILE.account} · {ACCOUNT_PROFILE.role}</span>
            <div className="erp-flex"><ErpTag tone="brand">♛ {ACCOUNT_PROFILE.vip}</ErpTag><ErpTag tone="neutral">{ACCOUNT_PROFILE.dept}</ErpTag></div>
          </div>
          <div className="erp-divider" />
          <div className="erp-stack" style={{ gap: 8 }}>
            <div className="erp-flex-between"><span className="erp-small erp-muted">AI 算力</span><span className="erp-small"><b>{num(ACCOUNT_PROFILE.credits)}</b> / {num(ACCOUNT_PROFILE.creditsTotal)}</span></div>
            <div className="erp-progress"><div className="erp-progress__bar" style={{ width: `${creditsPercent}%` }} /></div>
            <div className="erp-flex-between"><span className="erp-small erp-muted">店铺额度</span><span className="erp-small">{ACCOUNT_PROFILE.storeUsed} / {ACCOUNT_PROFILE.storeQuota}</span></div>
            <div className="erp-progress"><div className="erp-progress__bar" style={{ width: `${(ACCOUNT_PROFILE.storeUsed / ACCOUNT_PROFILE.storeQuota) * 100}%` }} /></div>
          </div>
          <ErpButton variant="primary" block style={{ marginTop: 16 }} onClick={() => setRightsOpen(true)}>购买权益</ErpButton>
          <div className="erp-divider" />
          <div className="erp-stack" style={{ gap: 2 }}>
            {TABS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
                style={{
                  height: 34,
                  padding: '0 10px',
                  border: 0,
                  borderLeft: tab === item ? '2px solid #FF7D29' : '2px solid transparent',
                  borderRadius: 4,
                  background: tab === item ? '#FFEFE5' : 'transparent',
                  color: tab === item ? '#D25909' : '#4E5969',
                  textAlign: 'left',
                  fontSize: 13,
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="erp-stack" style={{ gap: 12 }}>
          {tab === '基本信息' ? (
            <div className="erp-section">
              <div className="erp-section__head"><h3>基本信息</h3></div>
              <div className="erp-section__body">
                <ErpForm labelWidth={96}>
                  <ErpFormItem label="头像">
                    <ErpUpload files={avatar} onAdd={(files) => setAvatar((prev) => [...prev, ...files])} onRemove={(index) => setAvatar((prev) => prev.filter((_, i) => i !== index))} label="上传头像" hint="建议 200×200，支持 jpg/png" />
                  </ErpFormItem>
                  <ErpFormItem label="姓名"><ErpInput value={name} onChange={setName} /></ErpFormItem>
                  <ErpFormItem label="登录账号"><ErpInput value={ACCOUNT_PROFILE.account} disabled /></ErpFormItem>
                  <ErpFormItem label="手机号"><ErpInput value={phone} onChange={setPhone} /></ErpFormItem>
                  <ErpFormItem label="邮箱"><ErpInput value={email} onChange={setEmail} /></ErpFormItem>
                  <ErpFormItem label="所属部门"><ErpInput value={ACCOUNT_PROFILE.dept} disabled /></ErpFormItem>
                  <ErpFormItem label="角色"><ErpInput value={ACCOUNT_PROFILE.role} disabled /></ErpFormItem>
                  <ErpFormItem label="时区"><ErpSelect options={['Asia/Shanghai', 'Asia/Hong_Kong', 'America/Los_Angeles', 'Europe/London'].map((value) => ({ label: value, value }))} value={timezone} onChange={(value) => setTimezone(String(value))} width="100%" /></ErpFormItem>
                  <ErpFormItem label="语言"><ErpSelect options={['简体中文', 'English'].map((value) => ({ label: value, value }))} value={language} onChange={(value) => setLanguage(String(value))} width="100%" /></ErpFormItem>
                  <ErpFormItem label=" "><ErpButton variant="primary" onClick={() => erpMessage('个人资料已保存（演示）')}>保存资料</ErpButton></ErpFormItem>
                </ErpForm>
              </div>
            </div>
          ) : null}
          {tab === '账号安全' ? (
            <>
              <ErpSection title="账号安全">
                <div className="erp-stack" style={{ gap: 0 }}>
                  {[
                    ['登录密码', '建议定期更换密码，避免使用弱密码', '修改密码'],
                    ['绑定手机', phone, '更换手机'],
                    ['绑定邮箱', email, '更换邮箱'],
                  ].map(([title, desc, action]) => (
                    <div key={title} className="erp-flex-between" style={{ padding: '12px 0', borderBottom: '1px solid #EBEEF5' }}>
                      <div><b style={{ fontSize: 13 }}>{title}</b><p className="erp-small erp-muted">{desc}</p></div>
                      <ErpButton size="small" onClick={() => (action === '修改密码' ? setPasswordOpen(true) : erpMessage(`${action}（演示）`))}>{action}</ErpButton>
                    </div>
                  ))}
                  <div className="erp-flex-between" style={{ padding: '12px 0' }}>
                    <div><b style={{ fontSize: 13 }}>两步验证（MFA）</b><p className="erp-small erp-muted">登录时需要额外的动态验证码</p></div>
                    <ErpSwitch checked={mfa} onChange={setMfa} />
                  </div>
                </div>
              </ErpSection>
              <ErpSection title="登录设备">
                <ListPage
                  header={null}
                  columns={[
                    { key: 'name', title: '设备', width: 160 },
                    { key: 'ip', title: 'IP', width: 130, render: (row) => <span className="erp-code">{row.ip}</span> },
                    { key: 'location', title: '位置', width: 100 },
                    { key: 'lastActive', title: '最近活跃', width: 160 },
                    { key: 'current', title: '状态', width: 90, render: (row) => row.current ? <ErpTag tone="success">当前设备</ErpTag> : <ErpTag tone="neutral">其他设备</ErpTag> },
                  ]}
                  rows={ACCOUNT_DEVICES}
                  rowKey={(row) => row.id}
                  filterKey="devices"
                  rowActions={(row) => (row.current ? [] : [{ label: '退出登录', danger: true, onClick: () => erpMessage('已退出该设备（演示）') }])}
                  pageSizeDefault={10}
                />
              </ErpSection>
            </>
          ) : null}
          {tab === '消息通知' ? (
            <ErpSection title="消息通知">
              <div className="erp-stack" style={{ gap: 0 }}>
                <div className="erp-flex-between" style={{ padding: '14px 0', borderBottom: '1px solid #EBEEF5' }}>
                  <div><b style={{ fontSize: 13 }}>订单消息</b><p className="erp-small erp-muted">新订单、待发货、退款与异常提醒</p></div>
                  <ErpSwitch checked={orderNotice} onChange={setOrderNotice} />
                </div>
                <div className="erp-flex-between" style={{ padding: '14px 0', borderBottom: '1px solid #EBEEF5' }}>
                  <div><b style={{ fontSize: 13 }}>商品消息</b><p className="erp-small erp-muted">审核结果、发布失败、质量检测提醒</p></div>
                  <ErpSwitch checked={productNotice} onChange={setProductNotice} />
                </div>
                <div className="erp-flex-between" style={{ padding: '14px 0', borderBottom: '1px solid #EBEEF5' }}>
                  <div><b style={{ fontSize: 13 }}>系统通知</b><p className="erp-small erp-muted">系统维护、版本更新与权益变动</p></div>
                  <ErpSwitch checked={systemNotice} onChange={setSystemNotice} />
                </div>
                <div className="erp-flex-between" style={{ padding: '14px 0' }}>
                  <div><b style={{ fontSize: 13 }}>自动翻译</b><p className="erp-small erp-muted">即时咨询中自动翻译买家消息</p></div>
                  <ErpSwitch checked={autoTranslate} onChange={setAutoTranslate} />
                </div>
              </div>
            </ErpSection>
          ) : null}
          {tab === '我的权益' ? (
            <>
              <div className="erp-home-hero">
                <div>
                  <div className="erp-home-hero__title">VIP3 · 专业版</div>
                  <div className="erp-home-hero__meta">有效期至 {ACCOUNT_PROFILE.vipExpiry} · 当前算力 {num(ACCOUNT_PROFILE.credits)}</div>
                </div>
                <ErpButton variant="primary" onClick={() => setRightsOpen(true)}>购买权益</ErpButton>
              </div>
              <ErpSection title="算力使用记录" extra={<span className="erp-small erp-muted">共 {CREDIT_USAGE.length} 条</span>}>
                <table className="erp-cost-table">
                  <thead><tr><th>时间</th><th>场景</th><th>关联内容</th><th>变动</th><th>余额</th></tr></thead>
                  <tbody>
                    {CREDIT_USAGE.map((row) => (
                      <tr key={row.id}>
                        <td>{row.time}</td>
                        <td>{row.scene}</td>
                        <td>{row.item}</td>
                        <td style={{ color: row.amount > 0 ? '#0BB861' : '#F44837' }}>{row.amount > 0 ? '+' : ''}{row.amount}</td>
                        <td>{row.balance}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ErpSection>
            </>
          ) : null}
          {tab === '登录记录' ? (
            <ErpSection title="登录记录">
              <table className="erp-cost-table">
                <thead><tr><th>时间</th><th>IP</th><th>位置</th><th>设备</th><th>结果</th></tr></thead>
                <tbody>
                  {LOGIN_HISTORY.map((row) => (
                    <tr key={row.id}>
                      <td>{row.time}</td>
                      <td className="erp-code">{row.ip}</td>
                      <td>{row.location}</td>
                      <td>{row.device}</td>
                      <td><ErpTag tone={row.result === '成功' ? 'success' : 'danger'}>{row.result}</ErpTag></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ErpSection>
          ) : null}
        </div>
      </div>
      <ErpDialog
        open={passwordOpen}
        title="修改密码"
        width={520}
        onClose={() => setPasswordOpen(false)}
        footer={<><ErpButton onClick={() => setPasswordOpen(false)}>取消</ErpButton><ErpButton variant="primary" onClick={() => { setPasswordOpen(false); erpMessage('密码已修改（演示）'); }}>确认修改</ErpButton></>}
      >
        <ErpForm layout="vertical">
          <ErpFormItem label="当前密码" required><ErpInput type="password" placeholder="请输入当前密码" /></ErpFormItem>
          <ErpFormItem label="新密码" required><ErpInput type="password" placeholder="8–20 位，包含字母与数字" /></ErpFormItem>
          <ErpFormItem label="确认新密码" required><ErpInput type="password" placeholder="请再次输入新密码" /></ErpFormItem>
        </ErpForm>
      </ErpDialog>
      <ErpDialog
        open={rightsOpen}
        title="购买权益"
        width={760}
        onClose={() => setRightsOpen(false)}
        footer={<><ErpButton onClick={() => setRightsOpen(false)}>取消</ErpButton><ErpButton variant="primary" onClick={() => { setRightsOpen(false); erpMessage(`已创建订单：${selectedPlan.name} × ${quantity}（演示）`); }}>确认购买</ErpButton></>}
      >
        <div className="erp-stack" style={{ gap: 16 }}>
          <div className="erp-inline-note">当前账号：admin · 当前算力 {num(ACCOUNT_PROFILE.credits)} · 权益到期 {ACCOUNT_PROFILE.vipExpiry}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 10 }}>
            {RIGHT_PLANS.map((plan) => (
              <button
                type="button"
                key={plan.id}
                onClick={() => setSelectedPlan(plan)}
                style={{
                  padding: 14,
                  border: `1px solid ${selectedPlan.id === plan.id ? '#FF7D29' : '#E5E6EB'}`,
                  borderRadius: 8,
                  background: selectedPlan.id === plan.id ? '#FFEFE5' : '#fff',
                  textAlign: 'left',
                }}
              >
                <b style={{ display: 'block', fontSize: 13 }}>{plan.name}</b>
                <span className="erp-small erp-muted">{plan.desc}</span>
                <div style={{ marginTop: 8, fontSize: 18, fontWeight: 500, color: '#D25909' }}>¥ {plan.price}</div>
                <span className="erp-small erp-muted">{num(plan.credits)} 算力 / {plan.days} 天</span>
              </button>
            ))}
          </div>
          <div className="erp-flex-between">
            <span className="erp-small erp-muted">购买数量</span>
            <div className="erp-flex">
              <ErpButton size="small" onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}>−</ErpButton>
              <span style={{ minWidth: 32, textAlign: 'center' }}>{quantity}</span>
              <ErpButton size="small" onClick={() => setQuantity((prev) => prev + 1)}>＋</ErpButton>
              <span className="erp-small">合计 ¥ {selectedPlan.price * quantity}</span>
            </div>
          </div>
        </div>
      </ErpDialog>
    </div>
  );
}
