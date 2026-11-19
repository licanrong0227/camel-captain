import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronLeft, Lock, ShieldCheck, User } from 'lucide-react';
import { AuthField } from '../components/AuthField';
import { Sheet } from '../components/Sheet';

const SERVICE_AGREEMENT = [
  ['一、服务说明', '骆驼队长智慧运营中台为跨境电商卖家提供商品、订单、物流、广告与数据看板等运营工具。注册并使用本服务，即表示你理解并同意本协议。'],
  ['二、账号与使用', '你应使用真实、有效的手机号注册，并妥善保管账号与密码。账号仅限本人或本企业授权人员使用，不得出租、转让或用于违法用途。'],
  ['三、数据与内容', '你在使用过程中产生的店铺、商品与订单数据归你所有。你应确保上传内容不侵犯第三方权利，并遵守平台规则与相关法律法规。'],
  ['四、服务变更与终止', '我们可能根据业务需要调整功能或服务范围，并会以公告等方式提示。若你违反本协议，我们有权限制或终止账号使用。'],
  ['五、其他', '本协议未尽事宜，以平台后续发布的规则为准。'],
];

const PRIVACY_POLICY = [
  ['一、我们收集的信息', '为完成注册与登录，我们会收集手机号、用户名及必要的设备信息；在你使用看板、分销等功能时，会处理对应的店铺与订单数据。'],
  ['二、信息使用', '收集的信息用于账号识别、服务提供、风险控制与产品改进，不会用于与上述目的无关的用途。'],
  ['三、信息共享', '除法律法规要求或你明确授权外，我们不会向第三方出售你的个人信息。用于服务交付的必要合作方，仅在约定范围内处理信息。'],
  ['四、你的权利', '你可以查看、修改个人资料，或通过客服申请注销账号。注销后，除法律法规要求保留的数据外，我们将删除或匿名化处理相关信息。'],
  ['五、联系我们', '如对隐私政策有疑问，可通过「我的-联系我们」与企业微信客服联系。'],
];

const STEPS = ['验证手机', '设置账号', '完成注册'];

export function RegisterPage({
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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [code, setCode] = useState('');
  const [agree, setAgree] = useState(false);
  const [agreement, setAgreement] = useState<'service' | 'privacy' | null>(null);
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
    if (!agree) next.agree = '请先阅读并同意协议';
    setErrors(next);
    if (Object.keys(next).length) return;
    setStep(2);
  };

  const nextFromAccount = () => {
    const next: Record<string, string> = {};
    if (username.trim().length < 2) next.username = '用户名至少 2 个字符';
    if (password.length < 6) next.password = '密码至少 6 位';
    if (confirm !== password) next.confirm = '两次输入的密码不一致';
    setErrors(next);
    if (Object.keys(next).length) return;
    setStep(3);
  };

  const submit = () => {
    setErrors({});
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
            <h1 className="cc-auth-title">创建账号</h1>
            <p className="cc-auth-sub">注册后即可进入智慧运营中台</p>
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
              <div className="cc-agreement">
                <button
                  type="button"
                  className={`cc-check-box${agree ? ' is-checked' : ''}`}
                  role="checkbox"
                  aria-checked={agree}
                  onClick={() => {
                    setAgree((value) => !value);
                    setErrors((prev) => ({ ...prev, agree: '' }));
                  }}
                >
                  {agree ? '✓' : ''}
                </button>
                <div className="cc-agreement-text">
                  我已阅读并同意
                  <button type="button" className="cc-agreement-link" onClick={() => setAgreement('service')}>《软件服务许可协议》</button>
                  <button type="button" className="cc-agreement-link" onClick={() => setAgreement('privacy')}>《隐私政策》</button>
                </div>
              </div>
              {errors.agree ? <div className="cc-field-error">{errors.agree}</div> : null}
              <button type="button" className="cc-btn cc-btn--primary" onClick={nextFromPhone}>下一步</button>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <AuthField
                label="用户名"
                icon={<User size={16} />}
                value={username}
                onChange={(next) => {
                  setUsername(next);
                  setErrors((prev) => ({ ...prev, username: '' }));
                }}
                placeholder="请输入用户名"
                error={errors.username}
              />
              <AuthField
                label="设置密码"
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
                placeholder="请再次输入密码"
                type="password"
                error={errors.confirm}
              />
              <div className="cc-auth-step-actions">
                <button type="button" className="cc-btn cc-btn--ghost" onClick={() => setStep(1)}>上一步</button>
                <button type="button" className="cc-btn cc-btn--primary" onClick={nextFromAccount}>下一步</button>
              </div>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <div className="cc-register-success">
                <span className="cc-register-success-icon">
                  <Check size={26} strokeWidth={3} />
                </span>
                <div className="cc-register-success-title">注册成功</div>
                <div className="cc-register-success-desc">账号已创建，请使用注册的手机号或用户名登录。</div>
              </div>
              <div className="cc-register-summary">
                <div><span>手机号</span><strong>{phone}</strong></div>
                <div><span>用户名</span><strong>{username}</strong></div>
              </div>
              <button type="button" className="cc-btn cc-btn--primary" onClick={submit}>去登录</button>
            </>
          ) : null}
        </div>

        <div className="cc-auth-foot">
          <span>已有账号？</span>
          <button type="button" className="cc-link" onClick={onBack}>返回登录</button>
        </div>
      </div>

      <Sheet
        open={agreement !== null}
        title={agreement === 'service' ? '软件服务许可协议' : '隐私政策'}
        variant="full"
        onClose={() => setAgreement(null)}
      >
        <div className="cc-agreement-content">
          {(agreement === 'service' ? SERVICE_AGREEMENT : PRIVACY_POLICY).map(([heading, body]) => (
            <section key={heading}>
              <h2>{heading}</h2>
              <p>{body}</p>
            </section>
          ))}
          <p className="cc-agreement-updated">更新日期：2026-11-12</p>
        </div>
      </Sheet>
    </div>
  );
}
