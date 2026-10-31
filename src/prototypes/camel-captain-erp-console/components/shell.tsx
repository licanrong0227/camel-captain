import React, { useEffect, useRef, useState } from 'react';
import logo from '../assets/logo.png';
import { NAV_TOP, breadcrumbOf, findNavPage } from '../data/navigation';
import { IN_SITE_MESSAGES } from '../data/messaging';
import { FEEDBACK_TYPES } from '../data/account';
import {
  ErpButton,
  ErpDialog,
  ErpDrawer,
  ErpForm,
  ErpFormItem,
  ErpInput,
  ErpMessageHost,
  ErpSelect,
  ErpTextarea,
  ErpConfirmHost,
  ErpUpload,
  erpConfirm,
  erpMessage,
} from './ui';

interface ShellProps {
  page: string;
  navigate: (pageId: string) => void;
  children: React.ReactNode;
}

function TopNav({ page, navigate }: { page: string; navigate: (pageId: string) => void }) {
  const activeNav = findNavPage(page).nav;
  const [openNav, setOpenNav] = useState('');
  const [menuOpen, setMenuOpen] = useState<'bell' | 'avatar' | ''>('');
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState('功能建议');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackFiles, setFeedbackFiles] = useState<string[]>([]);
  const closeTimer = useRef<number | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpenNav('');
        setMenuOpen('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const enterNav = (key: string) => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    if (key !== '首页') setOpenNav(key);
    else setOpenNav('');
  };

  const leaveNav = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpenNav(''), 150);
  };

  const unread = IN_SITE_MESSAGES.filter((item) => !item.read).slice(0, 5);

  return (
    <div className="erp-topbar-wrap" ref={rootRef}>
      <header className="erp-topbar">
        <button type="button" className="erp-brand" onClick={() => navigate('home')} aria-label="返回首页">
          <img src={logo} alt="骆驼队长" />
          <span className="erp-brand__divider" />
          <span className="erp-brand__name">智慧运营中台</span>
        </button>
        <nav className="erp-nav" aria-label="主导航">
          {NAV_TOP.map((item) => (
            <div
              className={`erp-nav__item ${activeNav === item.key ? 'is-active' : ''} ${openNav === item.key ? 'is-open' : ''}`}
              key={item.key}
              onMouseEnter={() => enterNav(item.key)}
              onMouseLeave={leaveNav}
            >
              <button
                type="button"
                className="erp-nav__trigger"
                onClick={() => {
                  if (item.key === '首页') {
                    navigate('home');
                    setOpenNav('');
                  } else if (item.groups && item.groups.length) {
                    navigate(item.groups[0].pages[0]);
                    setOpenNav('');
                  }
                }}
              >
                {item.title}
                {item.groups ? <span className="erp-nav__caret">⌄</span> : null}
              </button>
              {item.groups && openNav === item.key ? (
                <div className="erp-mega" onMouseEnter={() => enterNav(item.key)} onMouseLeave={leaveNav}>
                  {item.groups.map((group) => (
                    <div className="erp-mega__group" key={group.title}>
                      <span className="erp-mega__title">{group.title}</span>
                      <div className="erp-mega__links">
                        {group.pages.map((pageId) => {
                          const meta = findNavPage(pageId);
                          return (
                            <button
                              type="button"
                              key={pageId}
                              className={`erp-mega__link ${page === pageId ? 'is-active' : ''}`}
                              onClick={() => {
                                navigate(pageId);
                                setOpenNav('');
                              }}
                            >
                              <span className="erp-mega__dot" />
                              {meta.title}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </nav>
        <div className="erp-topbar__right">
          <button type="button" className="erp-topbar__icon" aria-label="帮助" title="帮助中心">
            ?
          </button>
          <div className="erp-topbar__popover-wrap">
            <button
              type="button"
              className="erp-topbar__icon erp-bell"
              aria-label="站内信"
              onClick={() => setMenuOpen((prev) => (prev === 'bell' ? '' : 'bell'))}
            >
              <span className="erp-bell__shape" />
              {unread.length ? <span className="erp-bell__dot" /> : null}
            </button>
            {menuOpen === 'bell' ? (
              <div className="erp-popover erp-popover--bell">
                <header>
                  <b>站内信</b>
                  <button type="button" onClick={() => { navigate('service-in-site-message'); setMenuOpen(''); }}>
                    查看全部
                  </button>
                </header>
                {unread.length === 0 ? <p className="erp-popover__empty">暂无未读消息</p> : null}
                {unread.map((message) => (
                  <button
                    type="button"
                    className="erp-popover__notice"
                    key={message.id}
                    onClick={() => { navigate('service-in-site-message'); setMenuOpen(''); }}
                  >
                    <span className="erp-popover__notice-dot" />
                    <span>
                      <b>{message.title}</b>
                      <em>{message.time.slice(0, 16)}</em>
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <button type="button" className="erp-vip" onClick={() => navigate('account-personal-center')}>
            <span className="erp-vip__crown">♛</span>
            VIP3
          </button>
          <div className="erp-topbar__popover-wrap">
            <button
              type="button"
              className="erp-user"
              onClick={() => setMenuOpen((prev) => (prev === 'avatar' ? '' : 'avatar'))}
            >
              <span className="erp-user__avatar">C</span>
              <span className="erp-user__name">admin</span>
              <span className="erp-nav__caret">⌄</span>
            </button>
            {menuOpen === 'avatar' ? (
              <div className="erp-popover erp-popover--user">
                <button type="button" onClick={() => { navigate('account-personal-center'); setMenuOpen(''); }}>
                  个人中心
                </button>
                <button type="button" onClick={() => { setFeedbackOpen(true); setMenuOpen(''); }}>
                  意见反馈
                </button>
                <span className="erp-popover__divider" />
                <button
                  type="button"
                  onClick={async () => {
                    setMenuOpen('');
                    const ok = await erpConfirm({ title: '退出登录', content: '退出后需要重新登录，确定退出吗？', confirmText: '退出' });
                    if (ok) erpMessage('已退出登录（演示环境不会真正退出）', 'info');
                  }}
                >
                  退出登录
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>
      <ErpDialog
        open={feedbackOpen}
        title="意见反馈"
        width={560}
        onClose={() => setFeedbackOpen(false)}
        footer={
          <>
            <ErpButton onClick={() => setFeedbackOpen(false)}>取消</ErpButton>
            <ErpButton
              variant="primary"
              onClick={() => {
                if (!feedbackText.trim()) {
                  erpMessage('请填写反馈内容', 'warning');
                  return;
                }
                setFeedbackOpen(false);
                setFeedbackText('');
                setFeedbackFiles([]);
                erpMessage('反馈已提交，感谢您的建议');
              }}
            >
              提交反馈
            </ErpButton>
          </>
        }
      >
        <ErpForm labelWidth={84}>
          <ErpFormItem label="反馈类型" required>
            <ErpSelect
              options={FEEDBACK_TYPES.map((type) => ({ label: type, value: type }))}
              value={feedbackType}
              onChange={(value) => setFeedbackType(String(value))}
              width={220}
            />
          </ErpFormItem>
          <ErpFormItem label="反馈内容" required>
            <ErpTextarea value={feedbackText} onChange={setFeedbackText} rows={5} maxLength={500} placeholder="请描述您遇到的问题或建议" />
          </ErpFormItem>
          <ErpFormItem label="截图">
            <ErpUpload files={feedbackFiles} onAdd={(files) => setFeedbackFiles((prev) => [...prev, ...files])} onRemove={(index) => setFeedbackFiles((prev) => prev.filter((_, i) => i !== index))} />
          </ErpFormItem>
        </ErpForm>
      </ErpDialog>
      <button type="button" className="erp-contact" onClick={() => setContactOpen(true)}>
        <span>☎</span>
        联系我们
      </button>
      <ErpDrawer open={contactOpen} title="联系我们" width={420} onClose={() => setContactOpen(false)}>
        <div className="erp-contact-panel">
          <div className="erp-contact-panel__card">
            <b>在线客服</b>
            <p>工作日 09:00–21:00，平均 30 秒响应</p>
            <ErpButton variant="primary" onClick={() => { setContactOpen(false); navigate('service-online-cs'); }}>
              进入即时咨询
            </ErpButton>
          </div>
          <div className="erp-contact-panel__card">
            <b>客服热线</b>
            <p>400-800-2026</p>
          </div>
          <div className="erp-contact-panel__card">
            <b>企业微信</b>
            <span className="erp-contact-panel__qr">二维码占位</span>
          </div>
        </div>
      </ErpDrawer>
    </div>
  );
}

function Breadcrumb({ page }: { page: string }) {
  const crumbs = breadcrumbOf(page);
  return (
    <div className="erp-crumbbar">
      <div className="erp-crumbbar__inner">
        {crumbs.map((crumb, index) => (
          <React.Fragment key={`${crumb}-${index}`}>
            {index > 0 ? <span className="erp-crumbbar__sep">/</span> : null}
            <span className={index === crumbs.length - 1 ? 'is-current' : ''}>{crumb}</span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export function AppShell({ page, navigate, children }: ShellProps) {
  return (
    <div className="erp-app">
      <TopNav page={page} navigate={navigate} />
      <Breadcrumb page={page} />
      <main className="erp-main">{children}</main>
      <ErpMessageHost />
      <ErpConfirmHost />
    </div>
  );
}
