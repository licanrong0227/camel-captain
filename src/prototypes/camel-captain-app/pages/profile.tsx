import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronRight, Headset, KeyRound, Link2, LogOut, Users } from 'lucide-react';
import { PROFILE, PROFILE_FIELDS } from '../data/profile';
import { fmtInt } from '../data/format';
import { AuthField } from '../components/AuthField';
import { Sheet } from '../components/Sheet';
import { copyText } from '../components/clipboard';
import type { DialogRequest } from '../dialog-route';
import wecomQr from '../assets/wecom-qr.png';

export function ProfilePage({
  avatar,
  dialogRequest,
  onToast,
  onDistribution,
  onLogout,
}: {
  avatar: string;
  dialogRequest: DialogRequest;
  onToast: (message: string) => void;
  onDistribution: () => void;
  onLogout: () => void;
}) {
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  useEffect(() => {
    if (!dialogRequest.token) return;
    const dialog = dialogRequest.dialog;
    setPasswordOpen(dialog === 'password');
    setContactOpen(dialog === 'contact');
    setInviteOpen(dialog === 'invite');
    setLogoutOpen(dialog === 'logout');
  }, [dialogRequest]);


  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [copyState, setCopyState] = useState<'idle' | 'done'>('idle');
  const copyTimer = useRef<number | null>(null);

  const inviteLink = `${window.location.origin}/register?invite=${PROFILE.inviteCode}`;

  const copy = async (text: string) => {
    await copyText(text);
    setCopyState('done');
    if (copyTimer.current) window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopyState('idle'), 1600);
  };

  const submitPassword = () => {
    const next: Record<string, string> = {};
    if (!oldPassword) next.oldPassword = '请输入旧密码';
    if (newPassword.length < 6) next.newPassword = '新密码至少 6 位';
    if (newPassword && newPassword === oldPassword) next.newPassword = '新密码不能与旧密码相同';
    if (confirmPassword !== newPassword) next.confirmPassword = '两次输入的密码不一致';
    setPasswordErrors(next);
    if (Object.keys(next).length) return;
    setPasswordOpen(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    onToast('密码已修改');
  };

  return (
    <div className="cc-page cc-profile">
      <div className="cc-scroll">
        <div className="cc-sticky-band">
        <section className="cc-profile-hero">
          <div className="cc-avatar-wrap">
            <img className="cc-profile-avatar" src={avatar} alt="" />
          </div>
          <div className="cc-profile-main">
            <div className="cc-profile-name">
              {PROFILE.name}
              <span className="cc-profile-vip">{PROFILE.vip}</span>
            </div>
            <div className="cc-profile-member">
              <span className="cc-member-pill">{PROFILE.member}</span>
              <span>到期日：{PROFILE.memberExpire}</span>
            </div>
            <div className="cc-profile-id">ID: {PROFILE.memberId}</div>
          </div>
        </section>
        </div>

        <section className="cc-invite">
          <div>
            <div className="cc-invite-label">我的邀请码</div>
            <div className="cc-invite-code">{PROFILE.inviteCode}</div>
          </div>
          <div className="cc-invite-actions">
            <button type="button" className="cc-invite-btn is-primary" onClick={() => setInviteOpen(true)}>
              <Link2 size={12} /> 生成推广链接
            </button>
          </div>
        </section>

        <section className="cc-assets">
          <div className="cc-asset">
            <span className="cc-asset-label">算力余额</span>
            <strong className="cc-asset-value">{fmtInt(PROFILE.compute)}</strong>
          </div>
          <div className="cc-asset">
            <span className="cc-asset-label">积分</span>
            <strong className="cc-asset-value">{fmtInt(PROFILE.points)}</strong>
            <span className="cc-asset-note">可用于兑换权益</span>
          </div>
        </section>

        <section className="cc-card cc-section">
          <div className="cc-section-head">
            <span className="cc-section-title">基础资料</span>
          </div>
          <div className="cc-info-grid">
            {PROFILE_FIELDS.map((field) => (
              <div className="cc-info-cell" key={field.label}>
                <span className="cc-info-label">{field.label}</span>
                <span className="cc-info-value">{field.value}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="cc-card cc-actions">
          <button type="button" className="cc-action-row" onClick={onDistribution}>
            <span className="cc-action-icon is-orange"><Users size={17} /></span>
            <span className="cc-action-main">
              <span>分销中心</span>
              <small>我的客户与本平台客户订单</small>
            </span>
            <ChevronRight size={16} className="cc-action-arrow" />
          </button>
          <button type="button" className="cc-action-row" onClick={() => setPasswordOpen(true)}>
            <span className="cc-action-icon is-green"><KeyRound size={17} /></span>
            <span className="cc-action-main"><span>修改密码</span></span>
            <ChevronRight size={16} className="cc-action-arrow" />
          </button>
          <button type="button" className="cc-action-row" onClick={() => setContactOpen(true)}>
            <span className="cc-action-icon is-gray"><Headset size={17} /></span>
            <span className="cc-action-main"><span>联系我们</span></span>
            <ChevronRight size={16} className="cc-action-arrow" />
          </button>
          <button type="button" className="cc-action-row is-danger" onClick={() => setLogoutOpen(true)}>
            <span className="cc-action-icon is-danger"><LogOut size={17} /></span>
            <span className="cc-action-main"><span>退出登录</span></span>
            <ChevronRight size={16} className="cc-action-arrow" />
          </button>
        </section>

        <div className="cc-profile-bottom-space" />
      </div>

      <Sheet
        open={passwordOpen}
        title="修改密码"
        height={560}
        onClose={() => setPasswordOpen(false)}
        footer={<button type="button" className="cc-btn cc-btn--primary" onClick={submitPassword}>保存</button>}
      >
        <AuthField
          label="旧密码"
          value={oldPassword}
          onChange={(next) => { setOldPassword(next); setPasswordErrors((prev) => ({ ...prev, oldPassword: '' })); }}
          placeholder="请输入旧密码"
          type="password"
          error={passwordErrors.oldPassword}
        />
        <AuthField
          label="新密码"
          value={newPassword}
          onChange={(next) => { setNewPassword(next); setPasswordErrors((prev) => ({ ...prev, newPassword: '' })); }}
          placeholder="至少 6 位，且不能与旧密码相同"
          type="password"
          error={passwordErrors.newPassword}
        />
        <AuthField
          label="确认密码"
          value={confirmPassword}
          onChange={(next) => { setConfirmPassword(next); setPasswordErrors((prev) => ({ ...prev, confirmPassword: '' })); }}
          placeholder="请再次输入新密码"
          type="password"
          error={passwordErrors.confirmPassword}
        />
      </Sheet>

      <Sheet open={contactOpen} title="联系我们" height={520} onClose={() => setContactOpen(false)}>
        <div className="cc-contact-card">
          <div className="cc-contact-title">企业微信</div>
          <img className="cc-contact-qr" src={wecomQr} alt="企业微信二维码" />
          <div className="cc-contact-tip">扫码添加客服</div>
        </div>
      </Sheet>

      <Sheet
        open={inviteOpen}
        title="推广链接"
        height={420}
        onClose={() => setInviteOpen(false)}
        footer={(
          <button
            type="button"
            className={`cc-btn cc-btn--primary cc-btn--icon${copyState === 'done' ? ' is-copied' : ''}`}
            onClick={() => copy(inviteLink)}
          >
            {copyState === 'done' ? (<><Check size={16} />已复制</>) : '复制链接'}
          </button>
        )}
      >
        <p className="cc-note">邀请码 {PROFILE.inviteCode}，好友通过该链接注册后成为你的客户。</p>
        <div className="cc-invite-link">{inviteLink}</div>
      </Sheet>

      <Sheet
        open={logoutOpen}
        title="退出登录"
        height={320}
        onClose={() => setLogoutOpen(false)}
        footer={
          <div className="cc-sheet-actions">
            <button type="button" className="cc-btn cc-btn--ghost" onClick={() => setLogoutOpen(false)}>取消</button>
            <button type="button" className="cc-btn cc-btn--danger" onClick={onLogout}>退出登录</button>
          </div>
        }
      >
        <p className="cc-note cc-note--lg">退出后需要重新输入账号密码登录。</p>
      </Sheet>
    </div>
  );
}
