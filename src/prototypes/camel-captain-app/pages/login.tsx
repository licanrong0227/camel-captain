import React, { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { AuthField } from '../components/AuthField';
import logo from '../assets/logo.png';

const ACCOUNT_KEY = 'cc-app:account';

export function LoginPage({
  onLogin,
  onRegister,
  onForgot,
}: {
  onLogin: (account: string, remember: boolean) => void;
  onRegister: () => void;
  onForgot: () => void;
}) {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [accountError, setAccountError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(ACCOUNT_KEY);
      if (saved) {
        setAccount(saved);
        setRemember(true);
      }
    } catch {
      // ignore unavailable storage
    }
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  const submit = () => {
    const accountNext = account.trim();
    const nextAccountError = accountNext ? '' : '请输入账号';
    const nextPasswordError = password.length >= 6 ? '' : '密码至少 6 位';
    setAccountError(nextAccountError);
    setPasswordError(nextPasswordError);
    if (nextAccountError || nextPasswordError) return;
    setLoading(true);
    timer.current = window.setTimeout(() => {
      setLoading(false);
      try {
        if (remember) window.localStorage.setItem(ACCOUNT_KEY, accountNext);
        else window.localStorage.removeItem(ACCOUNT_KEY);
      } catch {
        // ignore
      }
      onLogin(accountNext, remember);
    }, 800);
  };

  return (
    <div className="cc-auth">
      <div className="cc-auth-glow" />
      <div className="cc-auth-scroll">
        <div className="cc-auth-head">
          <img className="cc-auth-logo" src={logo} alt="骆驼队长" />
          <div className="cc-auth-kicker">WELCOME BACK</div>
          <h1 className="cc-auth-title">欢迎回来</h1>
          <p className="cc-auth-sub">登录后继续管理你的跨境生意</p>
        </div>

        <div className="cc-auth-card">
          <AuthField
            label="账号"
            icon={<User size={16} />}
            value={account}
            onChange={(next) => {
              setAccount(next);
              setAccountError('');
            }}
            placeholder="手机号 / 邮箱 / 企业账号"
            error={accountError}
            autoComplete="username"
          />
          <AuthField
            label="密码"
            icon={<Lock size={16} />}
            value={password}
            onChange={(next) => {
              setPassword(next);
              setPasswordError('');
            }}
            placeholder="请输入密码"
            type={passwordVisible ? 'text' : 'password'}
            error={passwordError}
            autoComplete="current-password"
            right={
              <button
                type="button"
                className="cc-icon-btn"
                aria-label={passwordVisible ? '隐藏密码' : '显示密码'}
                onClick={() => setPasswordVisible((value) => !value)}
              >
                {passwordVisible ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            }
          />

          <div className="cc-auth-options">
            <button
              type="button"
              className={`cc-check${remember ? ' is-checked' : ''}`}
              role="checkbox"
              aria-checked={remember}
              onClick={() => setRemember((value) => !value)}
            >
              <span className="cc-check-box">{remember ? '✓' : ''}</span>
              <span>记住此设备</span>
            </button>
            <button type="button" className="cc-link" onClick={onForgot}>忘记密码？</button>
          </div>

          <button type="button" className="cc-btn cc-btn--primary" disabled={loading} onClick={submit}>
            {loading ? '登录中…' : '进入智慧运营中台'}
          </button>
        </div>

        <div className="cc-auth-foot">
          <span>没有账号？</span>
          <button type="button" className="cc-link" onClick={onRegister}>点击注册</button>
        </div>
        <p className="cc-auth-note">登录受 MFA 与设备风险控制保护</p>
      </div>
    </div>
  );
}
