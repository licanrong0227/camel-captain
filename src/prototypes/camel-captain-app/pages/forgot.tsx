import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, Lock, ShieldCheck, User } from 'lucide-react';
import { AuthField } from '../components/AuthField';

const STEPS = ['验证手机', '重置密码'];

export function ForgotPage({
  onDone,
  onBack,
  onToast,
}: {
  onDone: () => void;
  onBack: () => void;
  onToast: (message: string) => void;
}) {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const timer = useRef<number | null>(null);

  useEffect(() => () => {
    if (timer.current) window.clearInterval(timer.current);
  }, []);

  const startCountdown = () => {
    if (!/^1\d{10}$/u.test(phone)) {
      setErrors((prev) => ({ ...prev, phone: '请输入 11 位手机号' }));
      return;
    }
    setErrors((prev) => ({ ...prev, phone: '' }));
    setCountdown(60);
    onToast('验证码已发送');
    if (timer.current) window.clearInterval(timer.current);
    timer.current = window.setInterval(() => {
      setCountdown((value) => {
        if (value <= 1) {
          if (timer.current) window.clearInterval(timer.current);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
  };

  const goBack = () => {
    if (step > 1) setStep(step - 1);
    else onBack();
  };

  const nextFromPhone = () => {
    const next: Record<string, string> = {};
    if (!/^1\d{10}$/u.test(phone)) next.phone = '请输入 11 位手机号';
    if (!/^\d{6}$/u.test(code)) next.code = '请输入 6 位验证码';
    setErrors(next);
    if (Object.keys(next).length) return;
    setStep(2);
  };

  const submit = () => {
    const next: Record<string, string> = {};
    if (password.length < 6) next.password = '密码至少 6 位';
    if (confirm !== password) next.confirm = '两次输入的密码不一致';
    setErrors(next);
    if (Object.keys(next).length) return;
    onToast('密码已重置');
    onDone();
  };

  return (
    <div className="cc-auth cc-auth--sub">
      <div className="cc-auth-scroll">
        <div className="cc-sub-head">
          <button type="button" className="cc-back-btn" aria-label="返回" onClick={goBack}>
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="cc-auth-title">忘记密码</h1>
            <p className="cc-auth-sub">验证手机号后重新设置密码</p>
          </div>
        </div>

        <div className="cc-steps">
          {STEPS.map((label, index) => {
            const number = index + 1;
            return (
              <div className={`cc-step${step === number ? ' is-current' : ''}${step > number ? ' is-done' : ''}`} key={label}>
                <span className="cc-step-dot">{step > number ? '✓' : number}</span>
                <em>{label}</em>
              </div>
            );
          })}
        </div>

        <div className="cc-auth-card">
          {step === 1 ? (
            <>
              <AuthField
                label="手机号"
                icon={<User size={16} />}
                value={phone}
                onChange={(next) => {
                  setPhone(next.replace(/\D/gu, '').slice(0, 11));
                  setErrors((prev) => ({ ...prev, phone: '' }));
                }}
                placeholder="请输入手机号"
                inputMode="tel"
                maxLength={11}
                error={errors.phone}
              />
              <div className="cc-field">
                <div className="cc-field-label">验证码</div>
                <div className="cc-code-row">
                  <div className={`cc-field-box${errors.code ? ' is-error' : ''}`}>
                    <span className="cc-field-icon"><ShieldCheck size={16} /></span>
                    <input
                      className="cc-input"
                      value={code}
                      placeholder="6 位验证码"
                      inputMode="numeric"
                      maxLength={6}
                      onChange={(event) => {
                        setCode(event.target.value.replace(/\D/gu, '').slice(0, 6));
                        setErrors((prev) => ({ ...prev, code: '' }));
                      }}
                    />
                  </div>
                  <button type="button" className="cc-code-btn" disabled={countdown > 0} onClick={startCountdown}>
                    {countdown > 0 ? `${countdown}s 后重发` : '获取验证码'}
                  </button>
                </div>
                {errors.code ? <div className="cc-field-error">{errors.code}</div> : null}
              </div>
              <button type="button" className="cc-btn cc-btn--primary" onClick={nextFromPhone}>下一步</button>
            </>
          ) : (
            <>
              <AuthField
                label="新密码"
                icon={<Lock size={16} />}
                value={password}
                onChange={(next) => {
                  setPassword(next);
                  setErrors((prev) => ({ ...prev, password: '' }));
                }}
                placeholder="至少 6 位"
                type="password"
                error={errors.password}
              />
              <AuthField
                label="确认密码"
                icon={<Lock size={16} />}
                value={confirm}
                onChange={(next) => {
                  setConfirm(next);
                  setErrors((prev) => ({ ...prev, confirm: '' }));
                }}
                placeholder="请再次输入新密码"
                type="password"
                error={errors.confirm}
              />
              <div className="cc-auth-step-actions">
                <button type="button" className="cc-btn cc-btn--ghost" onClick={() => setStep(1)}>上一步</button>
                <button type="button" className="cc-btn cc-btn--primary" onClick={submit}>重置密码</button>
              </div>
            </>
          )}
        </div>

        <div className="cc-auth-foot">
          <span>想起密码了？</span>
          <button type="button" className="cc-link" onClick={onBack}>返回登录</button>
        </div>
      </div>
    </div>
  );
}
