/**
 * @name 即时咨询 - 骆驼队长BI
 * @mode axure
 */

import React, { useState, useRef } from 'react';
import './style.css';
import { AnnotationViewer, type AnnotationSourceDocument } from '@axhub/annotation';
import annotationSourceDocument from './annotation-source.json';

// ===== SVG Icons =====
const SearchIcon = ({ size = 14 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
    </svg>
);

const SunIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
);

const MenuIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
);

const HelpIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

const CrownIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M2.5 18.5l2-10 5 4 2.5-7 2.5 7 5-4 2 10z" />
        <rect x="2.5" y="19" width="19" height="2" rx="1" />
    </svg>
);

const RefreshIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
);

const MoreIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
    </svg>
);

const EmojiIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
);

const ImageIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
    </svg>
);

const PhoneIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
);

const UserIcon = () => (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

// ===== Data =====
const navItems = [
    { id: 'home', label: '首页' },
    { id: 'product', label: '商品' },
    { id: 'trade', label: '交易' },
    { id: 'purchase', label: '采购' },
    { id: 'logistics', label: '物流' },
    { id: 'report', label: '报表' },
    { id: 'system', label: '系统' },
    { id: 'toolbox', label: '工具箱' },
    { id: 'im', label: '即时咨询' },
];

const stores = [
    { id: '1', name: 'sneaksuppl...', unread: 3 },
    { id: '2', name: 'ursbs_shoes', unread: 3 },
    { id: '3', name: 'peshw_sne...', unread: 0 },
    { id: '4', name: 'myraze', unread: 3 },
    { id: '5', name: 'bitnex', unread: 3 },
    { id: '6', name: 'cedspods_s...', unread: 3 },
    { id: '7', name: 'dhjewelry05', unread: 2 },
    { id: '8', name: 'jewelryfacto...', unread: 1 },
    { id: '9', name: 'runstepshop', unread: 1 },
    { id: '10', name: 'lugcasemall', unread: 1 },
    { id: '11', name: 'opes_shoes1', unread: 1 },
    { id: '12', name: 'bradandes_...', unread: 1 },
    { id: '13', name: 'bagland688', unread: 1 },
    { id: '14', name: 'modthreads', unread: 0 },
    { id: '15', name: 'movelink', unread: 0 },
    { id: '16', name: 'xxd6688', unread: 0 },
    { id: '17', name: 'pdd1997', unread: 0 },
    { id: '18', name: 'nextbig', unread: 0 },
    { id: '19', name: 'aurorasdh', unread: 0 },
    { id: '20', name: 'fancysd', unread: 0 },
];

const conversations = [
    { id: '1', name: 'bonnyhayneslaw', initials: 'B', color: '#409EFF', preview: '' },
    { id: '2', name: 'nassalumpkin', initials: 'N', color: '#67C23A', preview: 'Hi, the system automatically c...' },
    { id: '3', name: 'yukimlouise', initials: 'Y', color: '#E6A23C', preview: '' },
    { id: '4', name: 'Viki_VcZ', initials: 'V', color: '#9B59B6', preview: '' },
    { id: '5', name: 'CMCE', initials: 'C', color: '#409EFF', preview: 'Boss, these are all real photos' },
    { id: '6', name: 'alivia.juhasz', initials: 'A', color: '#ff781f', preview: 'Please evaluate the service this...' },
    { id: '7', name: 'The op girl', initials: 'T', color: '#909399', preview: '' },
    { id: '8', name: 'andres rojas', initials: 'A', color: '#67C23A', preview: 'If you like it, just place an ...' },
    { id: '9', name: 'Anabell Rosa', initials: 'A', color: '#ff781f', preview: '' },
    { id: '10', name: 'Skyler_OtG', initials: 'S', color: '#67C23A', preview: '' },
    { id: '11', name: 'Tara Tarrant', initials: 'T', color: '#909399', preview: '' },
];

const chatMessages = [
    {
        id: '1',
        type: 'message' as const,
        sender: 'buyer' as const,
        content: 'Hi!',
        translatedContent: '你好！',
        timestamp: '2026-09-16 00:07:33',
        hasTranslation: true,
    },
    {
        id: '2',
        type: 'message' as const,
        sender: 'buyer' as const,
        content: 'What is the material of this earring?',
        translatedContent: '这个耳环是什么材质的？',
        timestamp: '2026-09-16 00:07:41',
        hasTranslation: true,
    },
    {
        id: '3',
        type: 'message' as const,
        sender: 'seller' as const,
        content: '你好，它是不锈钢材质的',
        translatedContent: "Hi, it's made of stainless steel",
        timestamp: '2026-09-16 03:49:56',
        hasTranslation: true,
    },
    {
        id: '4',
        type: 'message' as const,
        sender: 'buyer' as const,
        content: "So it won't fade right?",
        translatedContent: '那它不会褪色对吧？',
        timestamp: '2026-09-16 04:10:36',
        hasTranslation: true,
    },
    {
        id: '5',
        type: 'message' as const,
        sender: 'seller' as const,
        content: '是的',
        translatedContent: 'Yes',
        timestamp: '2026-09-16 09:20:34',
        hasTranslation: false,
    },
];

// ===== Component =====
const Component = function InstantConsultation() {
    const [activeStore, setActiveStore] = useState('17');
    const [activeConv, setActiveConv] = useState('6');
    const [activeBuyerTab, setActiveBuyerTab] = useState<'info' | 'order'>('info');
    const [messageText, setMessageText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [showTranslatedTextarea, setShowTranslatedTextarea] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    return (
        <>
          <div className="im-shell">
                      {/* ===== Header ===== */}
                      <header className="im-header">
                          <div className="im-header-logo">
                              <img
                                  className="im-header-logo-icon"
                                  src="https://yfg-saas-test.oss-cn-shenzhen.aliyuncs.com/images/34/2026-08/fb37c061-e967-4584-94a6-5fc4e316ad15.png"
                                  alt="logo"
                              />
                              <span className="im-header-logo-text">智慧运营中台（公测版）</span>
                              <span className="im-header-divider">|</span>
                          </div>
                          <nav className="im-header-nav">
                              {navItems.map(item => (
                                  <button
                                      key={item.id}
                                      className={`im-header-nav-item ${item.id === 'im' ? 'is-active' : ''}`}
                                  >
                                      {item.label}
                                  </button>
                              ))}
                          </nav>
                          <div className="im-header-right">
                              <button className="im-header-icon-btn" title="亮度"><SunIcon /></button>
                              <button className="im-header-icon-btn" title="菜单"><MenuIcon /></button>
                              <button className="im-header-icon-btn" title="帮助"><HelpIcon /></button>
                              <span className="im-header-vip">
                                  <CrownIcon />
                                  VIP4
                              </span>
                              <div className="im-header-avatar">C</div>
                          </div>
                      </header>
          
                      {/* ===== Breadcrumb ===== */}
                      <div className="im-breadcrumb">
                          <span>即时咨询</span>
                          <span className="im-breadcrumb-sep">/</span>
                          <span>帮助</span>
                          <span className="im-breadcrumb-sep">/</span>
                          <span className="im-breadcrumb-current">即时咨询</span>
                      </div>
          
                      {/* ===== Body ===== */}
                      <div className="im-body">
                          {/* Store Sidebar */}
                          <aside className="im-store-sidebar">
                              <div className="im-store-search">
                                  <div className="im-store-search-wrap">
                                      <span className="im-store-search-icon"><SearchIcon size={12} /></span>
                                      <input className="im-store-search-input" placeholder="搜索店铺" />
                                  </div>
                              </div>
                              <div className="im-store-list">
                                  {stores.map(store => (
                                      <div
                                          key={store.id}
                                          className={`im-store-item ${activeStore === store.id ? 'is-active' : ''}`}
                                          onClick={() => setActiveStore(store.id)}
                                      >
                                          <div className="im-store-icon">DH</div>
                                          <span className="im-store-name">{store.name}</span>
                                          {store.unread > 0 && (
                                              <span className="im-store-badge">{store.unread}</span>
                                          )}
                                          {activeStore === store.id && (
                                              <span className="im-store-refresh"><RefreshIcon /></span>
                                          )}
                                      </div>
                                  ))}
                              </div>
                          </aside>
          
                          {/* Conversation List */}
                          <aside className="im-conversation-list">
                              <div className="im-conv-search">
                                   <input className="im-conv-search-input" placeholder="请输入买家名称/ID/订单号/聊天记录" data-annotation-id="conv-search" />
                              </div>
                              <div className="im-conv-filter">
                                  <span className="im-conv-filter-tag">未读</span>
                              </div>
                              <div className="im-conv-list">
                                  {conversations.map(conv => (
                                      <div
                                          key={conv.id}
                                          className={`im-conv-item ${activeConv === conv.id ? 'is-active' : ''}`}
                                          onClick={() => setActiveConv(conv.id)}
                                      >
                                          <div
                                              className="im-conv-avatar"
                                              style={{ background: conv.color }}
                                          >
                                              {conv.initials}
                                          </div>
                                          <div className="im-conv-info">
                                              <div className="im-conv-name">{conv.name}</div>
                                              {conv.preview && (
                                                  <div className="im-conv-preview">{conv.preview}</div>
                                              )}
                                          </div>
                                          <div className="im-conv-more">
                                              <MoreIcon />
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </aside>
          
                          {/* Chat Area */}
                          <main className="im-chat-area">
                              <div className="im-chat-header">
                                  <div className="im-chat-header-left">
                                      <span className="im-chat-header-name">alivia.juhasz</span>
                                      <span className="im-chat-header-tag">
                                          <span className="im-chat-header-tag-icon">DH</span>
                                          pdd1997
                                      </span>
                                  </div>
                              </div>
                              <div className="im-chat-messages" data-annotation-id="msg-bubble">
                                  {chatMessages.map(msg => (
                                      <div
                                          key={msg.id}
                                          className={`im-msg-row ${msg.sender === 'buyer' ? 'is-buyer' : 'is-seller'}`}
                                      >
                                          <div
                                              className="im-msg-avatar"
                                              style={{
                                                  background: msg.sender === 'buyer' ? '#ff781f' : '#409EFF',
                                              }}
                                          >
                                              {msg.sender === 'buyer' ? 'A' : 'S'}
                                          </div>
                                          <div className="im-msg-content">
                                              <div className="im-msg-bubble-wrap">
                                                  <div className={`im-msg-bubble ${msg.hasTranslation ? 'im-msg-bubble--with-translate' : ''}`}>
                                                      <div className="im-msg-bubble-original">{msg.content}</div>
                                                      {msg.hasTranslation && msg.translatedContent && (
                                                          <>
                                                              <div className="im-msg-translate-divider" />
                                                              <div className="im-msg-bubble-translated">{msg.translatedContent}</div>
                                                          </>
                                                      )}
                                                  </div>
                                                  {msg.hasTranslation && msg.sender === 'buyer' && (
                                                      <span className="im-msg-translate-tag">中/A</span>
                                                  )}
                                              </div>
                                              <div className="im-msg-time">{msg.timestamp}</div>
                                          </div>
                                      </div>
                                  ))}
                                  <div ref={messagesEndRef} />
                              </div>
                              <div className="im-chat-input-area">
                                  <div className="im-chat-toolbar">
                                      <button className="im-chat-toolbar-btn" title="表情"><EmojiIcon /></button>
                                      <button className="im-chat-toolbar-btn" title="图片"><ImageIcon /></button>
                                  </div>
                                   <div className="im-chat-translate-container">
                                       <div className="im-chat-translate-top">
                                           <textarea
                                               className="im-chat-textarea"
                                                placeholder="在此输入消息内容，按回车发送，Ctrl + Enter 换行，Alt + T 翻译，Ctrl + V 粘贴文字或图片"
                                               value={messageText}
                                               onChange={(e) => setMessageText(e.target.value)}
                                               data-annotation-id="chat-input-textarea"
                                           />
                                       </div>
                                       {showTranslatedTextarea && (
                                           <>
                                               <div className="im-chat-translate-divider" />
                                               <div className="im-chat-translate-bottom">
                                                   <textarea
                                                       className="im-chat-textarea im-chat-translate-textarea"
                                                       placeholder="点击「翻译」查看译文"
                                                       value={translatedText}
                                                       onChange={(e) => {
                                                           setTranslatedText(e.target.value);
                                                           if (!e.target.value.trim()) {
                                                               setShowTranslatedTextarea(false);
                                                           }
                                                       }}
                                                   />
                                               </div>
                                           </>
                                       )}
                                   </div>
                                   <div className="im-chat-actions" data-annotation-id="auto-translate-section">
                                        <label className="im-chat-checkbox">
                                            <input type="checkbox" />
                                            <span>自动翻译接收信息</span>
                                        </label>
                                       <span className="im-chat-translate-label">翻译语言：</span>
                                      <select className="im-chat-translate-select" data-annotation-id="translate-language-select">
                                          <option value="zh">中文</option>
                                          <option value="en">英语</option>
                                          <option value="ja">日语</option>
                                          <option value="ko">韩语</option>
                                          <option value="fr">法语</option>
                                          <option value="de">德语</option>
                                          <option value="es">西班牙语</option>
                                          <option value="pt">葡萄牙语</option>
                                          <option value="it">意大利语</option>
                                          <option value="ru">俄语</option>
                                          <option value="ar">阿拉伯语</option>
                                          <option value="nl">荷兰语</option>
                                          <option value="pl">波兰语</option>
                                          <option value="th">泰语</option>
                                          <option value="vi">越南语</option>
                                          <option value="tr">土耳其语</option>
                                          <option value="hi">印地语</option>
                                          <option value="id">印尼语</option>
                                          <option value="bn">孟加拉语</option>
                                          <option value="cs">捷克语</option>
                                          <option value="da">丹麦语</option>
                                          <option value="el">希腊语</option>
                                          <option value="fi">芬兰语</option>
                                          <option value="he">希伯来语</option>
                                          <option value="hu">匈牙利语</option>
                                          <option value="ms">马来语</option>
                                          <option value="no">挪威语</option>
                                          <option value="ro">罗马尼亚语</option>
                                          <option value="sk">斯洛伐克语</option>
                                          <option value="sv">瑞典语</option>
                                          <option value="uk">乌克兰语</option>
                                          <option value="ca">加泰罗尼亚语</option>
                                          <option value="hr">克罗地亚语</option>
                                          <option value="et">爱沙尼亚语</option>
                                          <option value="lv">拉脱维亚语</option>
                                          <option value="lt">立陶宛语</option>
                                          <option value="sl">斯洛文尼亚语</option>
                                          <option value="bg">保加利亚语</option>
                                          <option value="sr">塞尔维亚语</option>
                                          <option value="sw">斯瓦希里语</option>
                                          <option value="tl">菲律宾语</option>
                                          <option value="ne">尼泊尔语</option>
                                          <option value="si">僧伽罗语</option>
                                          <option value="my">缅甸语</option>
                                          <option value="lo">老挝语</option>
                                          <option value="km">高棉语</option>
                                          <option value="mn">蒙古语</option>
                                          <option value="ka">格鲁吉亚语</option>
                                          <option value="hy">亚美尼亚语</option>
                                          <option value="az">阿塞拜疆语</option>
                                          <option value="kk">哈萨克语</option>
                                          <option value="uz">乌兹别克语</option>
                                      </select>
                                       <button
                                           className="im-btn"
                                           disabled={!messageText.trim()}
                                           data-annotation-id="translate-btn"
                                           onClick={() => {
                                               setTranslatedText('This is a sample translation result.');
                                               setShowTranslatedTextarea(true);
                                           }}
                                       >
                                           翻译
                                       </button>
                                      <button
                                          className="im-btn im-btn--primary"
                                          disabled={!messageText.trim() && !translatedText.trim()}
                                          data-annotation-id="send-btn"
                                      >
                                          发送
                                      </button>
                                  </div>
                              </div>
                          </main>
          
                          {/* Buyer Panel */}
                          <aside className="im-buyer-panel">
                              <div className="im-buyer-tabs">
                                  <button
                                      className={`im-buyer-tab ${activeBuyerTab === 'info' ? 'is-active' : ''}`}
                                      onClick={() => setActiveBuyerTab('info')}
                                  >
                                      买家信息
                                  </button>
                                  <button
                                      className={`im-buyer-tab ${activeBuyerTab === 'order' ? 'is-active' : ''}`}
                                      onClick={() => setActiveBuyerTab('order')}
                                  >
                                      订单信息
                                  </button>
                              </div>
                              <div className="im-buyer-content">
                                  <div className="im-buyer-avatar">
                                      <UserIcon />
                                  </div>
                                  <div className="im-buyer-name">alivia.juhasz</div>
                                  <div className="im-buyer-info-list">
                                      <div className="im-buyer-info-row">
                                          <span className="im-buyer-info-label">国家</span>
                                          <span className="im-buyer-info-value">-</span>
                                      </div>
                                      <div className="im-buyer-info-row">
                                          <span className="im-buyer-info-label">城市</span>
                                          <span className="im-buyer-info-value">-</span>
                                      </div>
                                      <div className="im-buyer-info-row">
                                          <span className="im-buyer-info-label">邮件地址</span>
                                          <span className="im-buyer-info-value">-</span>
                                      </div>
                                      <div className="im-buyer-info-row">
                                          <span className="im-buyer-info-label">买家 ID</span>
                                          <span className="im-buyer-info-value">44def712fb79493da9fc7af0dcf3a7f9</span>
                                      </div>
                                  </div>
                              </div>
                          </aside>
                      </div>
          
                      {/* Contact Button */}
                      <div className="im-contact-btn">
                          <div className="im-contact-btn-icon">
                              <PhoneIcon />
                          </div>
                          <span className="im-contact-btn-text">联系我们</span>
                      </div>
                  </div>
          <AnnotationViewer
            source={annotationSourceDocument as unknown as AnnotationSourceDocument}
            options={{
              currentPageId: (() => {
                const hashPageId = new URLSearchParams(window.location.hash.replace(/^#/, '')).get('page');
                const searchPageId = new URLSearchParams(window.location.search.replace(/^\?/, '')).get('page');
                const pageId = hashPageId || searchPageId;
                return typeof pageId === 'string' && /^[a-z0-9-]+$/u.test(pageId)
                  ? pageId
                  : "instant-consultation";
              })(),
              onDirectoryRoute: (node) => {
                if (typeof node.route === 'string' && /^[a-z0-9-]+$/u.test(node.route)) {
                  window.location.hash = `page=${node.route}`;
                }
              },
              toolbarEdge: 'right',
              showToolbar: true,
              showThemeToggle: true,
              showColorFilter: true,
              emptyWhenNoData: true,
            }}
          />
        </>
    );
};

export default Component;
