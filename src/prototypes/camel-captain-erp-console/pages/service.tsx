import React, { useMemo, useState } from 'react';
import {
  ErpButton,
  ErpCheckbox,
  ErpDescriptions,
  ErpInput,
  ErpPagination,
  ErpSelect,
  ErpStatusTag,
  ErpSwitch,
  ErpTag,
  erpConfirm,
  erpMessage,
} from '../components/ui';
import { PageHeader } from '../components/ListPage';
import {
  CHAT_MESSAGES,
  CONVERSATIONS,
  IN_SITE_MESSAGES,
  type ChatMessage,
  type Conversation,
  type InSiteMessage,
} from '../data/messaging';
import { PRODUCT_IMAGES } from '../data/util';

export function OnlineCustomerServicePage() {
  const [conversations, setConversations] = useState<Conversation[]>(CONVERSATIONS);
  const [messages, setMessages] = useState<ChatMessage[]>(CHAT_MESSAGES);
  const [activeId, setActiveId] = useState(CONVERSATIONS[0].id);
  const [keyword, setKeyword] = useState('');
  const [filter, setFilter] = useState('全部');
  const [draft, setDraft] = useState('');
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [language, setLanguage] = useState('自动识别');
  const [showQuick, setShowQuick] = useState(false);

  const filtered = conversations.filter((conversation) => {
    const matchKeyword = !keyword || conversation.buyer.toLowerCase().includes(keyword.toLowerCase()) || conversation.lastMessage.toLowerCase().includes(keyword.toLowerCase());
    const matchFilter = filter === '全部' || (filter === '未读' ? conversation.unread > 0 : conversation.status === filter);
    return matchKeyword && matchFilter;
  });

  const active = conversations.find((conversation) => conversation.id === activeId) || conversations[0];
  const activeMessages = messages.filter((message) => message.conversationId === active.id);

  const selectConversation = (conversation: Conversation) => {
    setActiveId(conversation.id);
    setConversations((prev) => prev.map((item) => (item.id === conversation.id ? { ...item, unread: 0 } : item)));
  };

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    const message: ChatMessage = {
      id: `${active.id}-M${Date.now()}`,
      conversationId: active.id,
      direction: 'out',
      type: 'text',
      text,
      time: '2026-10-31 10:00:00',
    };
    setMessages((prev) => [...prev, message]);
    setConversations((prev) => prev.map((item) => (item.id === active.id ? { ...item, lastMessage: text, time: '2026-10-31 10:00:00' } : item)));
    setDraft('');
  };

  const quickReplies = ['您好，请问有什么可以帮您？', '已为您查询，订单预计 3–5 个工作日送达。', '请提供订单号，我帮您核实。', '感谢您的耐心等待，祝您购物愉快！'];

  return (
    <div className="erp-page">
      <PageHeader title="即时咨询" description="处理买家会话、订单咨询与售后问题，支持自动翻译与快捷回复。" extra={<ErpButton onClick={() => setShowQuick((prev) => !prev)}>快捷回复</ErpButton>} />
      <div className="erp-chat">
        <aside className="erp-chat__side">
          <div className="erp-chat__side-head">
            <ErpInput value={keyword} onChange={setKeyword} placeholder="搜索买家 / 消息" clearable />
            <div className="erp-chat__filters">
              {['全部', '未读', '进行中', '已结束'].map((item) => (
                <button type="button" key={item} className={filter === item ? 'is-active' : ''} onClick={() => setFilter(item)}>{item}</button>
              ))}
            </div>
          </div>
          <div className="erp-chat__list">
            {filtered.map((conversation) => (
              <button type="button" key={conversation.id} className={`erp-chat__item ${conversation.id === active.id ? 'is-active' : ''}`} onClick={() => selectConversation(conversation)}>
                <span className="erp-avatar" style={{ width: 34, height: 34, background: conversation.avatarColor, color: '#fff', fontSize: 12 }}>{conversation.buyer.slice(0, 1)}</span>
                <span className="erp-chat__item-body">
                  <span className="erp-chat__item-top"><b>{conversation.buyer}</b><span>{conversation.time.slice(5, 16)}</span></span>
                  <span className="erp-chat__item-last">{conversation.lastMessage}</span>
                  <span className="erp-flex" style={{ marginTop: 2 }}>
                    <ErpTag tone={conversation.status === '进行中' ? 'info' : 'neutral'}>{conversation.status}</ErpTag>
                    <span className="erp-small erp-muted">{conversation.country}</span>
                  </span>
                </span>
                {conversation.unread ? <span className="erp-chat__unread">{conversation.unread}</span> : null}
              </button>
            ))}
            {filtered.length === 0 ? <div className="erp-empty"><p>暂无会话</p></div> : null}
          </div>
        </aside>
        <main className="erp-chat__main">
          <header className="erp-chat__head">
            <div className="erp-chat__head-info">
              <b>{active.buyer}</b>
              <span>{active.country} · {active.language} · 订单 {active.orderNo}</span>
            </div>
            <div className="erp-flex">
              <ErpButton size="small" onClick={() => erpMessage('会话已转接给其他客服（演示）')}>转接</ErpButton>
              <ErpButton size="small" variant="danger" onClick={async () => { if (await erpConfirm({ content: '结束后买家将无法继续发送消息，确定结束会话吗？' })) { setConversations((prev) => prev.map((item) => (item.id === active.id ? { ...item, status: '已结束' } : item))); erpMessage('会话已结束（演示）'); } }}>结束会话</ErpButton>
            </div>
          </header>
          <div className="erp-chat__messages">
            <span className="erp-chat__time">2026-10-31</span>
            {activeMessages.map((message) => (
              <div className={`erp-chat__bubble-row ${message.direction === 'out' ? 'is-out' : ''}`} key={message.id}>
                <span className="erp-avatar" style={{ width: 28, height: 28, background: message.direction === 'out' ? '#FF7D29' : '#2881FF', color: '#fff', fontSize: 11 }}>
                  {message.direction === 'out' ? 'C' : active.buyer.slice(0, 1)}
                </span>
                <div className="erp-chat__bubble">
                  {message.type === 'text' ? message.text : null}
                  {message.type === 'product' ? (
                    <div className="erp-chat__order" style={{ border: 0, padding: 0 }}>
                      <img src={message.image || PRODUCT_IMAGES[0]} alt="" />
                      <div><b>Classic leather crossbody bag</b><span>SKU：SKU00000123 · $ 22.99</span></div>
                    </div>
                  ) : null}
                  {message.type === 'order' ? <div className="erp-chat__order" style={{ border: 0, padding: 0 }}><img src={PRODUCT_IMAGES[2]} alt="" /><div><b>订单 {message.orderNo}</b><span>已付款 · 待发货</span></div></div> : null}
                </div>
              </div>
            ))}
          </div>
          <div className="erp-chat__input">
            {showQuick ? (
              <div className="erp-flex" style={{ flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                {quickReplies.map((reply) => (
                  <button type="button" key={reply} className="erp-tag erp-tag--brand" style={{ height: 26, cursor: 'pointer' }} onClick={() => setDraft((prev) => prev ? `${prev} ${reply}` : reply)}>
                    {reply}
                  </button>
                ))}
              </div>
            ) : null}
            <div className="erp-chat__input-tools">
              <button type="button" className="erp-link" onClick={() => erpMessage('已插入表情（演示）')}>表情</button>
              <button type="button" className="erp-link" onClick={() => erpMessage('已打开图片上传（演示）')}>图片</button>
              <button type="button" className="erp-link" onClick={() => erpMessage('已插入商品卡（演示）')}>商品</button>
              <span style={{ marginLeft: 'auto' }} className="erp-flex">
                <ErpSwitch checked={autoTranslate} onChange={setAutoTranslate} label="自动翻译" />
                <span className="erp-small erp-muted">自动翻译</span>
                <ErpSelect options={[{ label: '自动识别', value: '自动识别' }, { label: '英语', value: '英语' }, { label: '德语', value: '德语' }]} value={language} onChange={(value) => setLanguage(String(value))} width={110} />
              </span>
            </div>
            <div className="erp-chat__input-row">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    send();
                  }
                }}
                placeholder="输入消息，Enter 发送，Shift+Enter 换行"
              />
              <ErpButton variant="primary" onClick={send}>发送</ErpButton>
            </div>
          </div>
        </main>
        <aside className="erp-chat__detail">
          <div className="erp-chat__detail-section">
            <h4>客户信息</h4>
            <ErpDescriptions
              columns={1}
              items={[
                { label: '买家', value: active.buyer },
                { label: '国家 / 语言', value: `${active.country} / ${active.language}` },
                { label: '会话状态', value: <ErpStatusTag status={active.status} /> },
                { label: '标签', value: <div className="erp-tag-list"><ErpTag tone="brand">高客单</ErpTag><ErpTag tone="success">老客</ErpTag></div> },
              ]}
            />
          </div>
          <div className="erp-chat__detail-section">
            <h4>关联订单</h4>
            <div className="erp-chat__order">
              <img src={PRODUCT_IMAGES[1]} alt="" />
              <div><b>{active.orderNo}</b><span>已付款 · 待发货 · $ 46.80</span></div>
            </div>
          </div>
          <div className="erp-chat__detail-section">
            <h4>商品信息</h4>
            <div className="erp-chat__order">
              <img src={PRODUCT_IMAGES[0]} alt="" />
              <div><b>Classic leather crossbody bag</b><span>SKU00000123 · 库存 86</span></div>
            </div>
          </div>
          <div className="erp-chat__detail-section">
            <h4>快捷操作</h4>
            <div className="erp-stack" style={{ gap: 8 }}>
              <ErpButton size="small" onClick={() => erpMessage('已发送订单链接（演示）')}>发送订单链接</ErpButton>
              <ErpButton size="small" onClick={() => erpMessage('已创建售后工单（演示）')}>创建售后工单</ErpButton>
              <ErpButton size="small" onClick={() => erpMessage('已备注买家（演示）')}>添加备注</ErpButton>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export function InSiteMessagePage() {
  const [messages, setMessages] = useState<InSiteMessage[]>(IN_SITE_MESSAGES);
  const [category, setCategory] = useState('全部');
  const [readFilter, setReadFilter] = useState('全部');
  const [keyword, setKeyword] = useState('');
  const [activeId, setActiveId] = useState(IN_SITE_MESSAGES[0].id);
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const filtered = useMemo(() => messages.filter((message) => {
    const matchCategory = category === '全部' || message.category === category;
    const matchRead = readFilter === '全部' || (readFilter === '未读' ? !message.read : message.read);
    const matchKeyword = !keyword || message.title.includes(keyword) || message.summary.includes(keyword);
    return matchCategory && matchRead && matchKeyword;
  }), [messages, category, readFilter, keyword]);

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, pageCount);
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const active = messages.find((message) => message.id === activeId) || messages[0];

  const markRead = (ids: string[], read = true) => {
    setMessages((prev) => prev.map((message) => (ids.includes(message.id) ? { ...message, read } : message)));
  };

  return (
    <div className="erp-page">
      <PageHeader title="站内信" description="接收系统通知、订单消息、商品消息与服务消息。" extra={<ErpButton onClick={() => { markRead(messages.map((message) => message.id)); erpMessage('已全部标记为已读'); }}>全部已读</ErpButton>} />
      <div className="erp-msg">
        <aside className="erp-msg__left">
          <div className="erp-msg__filters">
            <div className="erp-msg__cats">
              {['全部', '系统通知', '订单消息', '商品消息', '服务消息'].map((item) => (
                <button type="button" key={item} className={category === item ? 'is-active' : ''} onClick={() => { setCategory(item); setPage(1); }}>{item}</button>
              ))}
            </div>
            <div className="erp-flex">
              <ErpInput value={keyword} onChange={(value) => { setKeyword(value); setPage(1); }} placeholder="搜索站内信" clearable />
              <ErpSelect options={[{ label: '全部', value: '全部' }, { label: '未读', value: '未读' }, { label: '已读', value: '已读' }]} value={readFilter} onChange={(value) => setReadFilter(String(value))} width={100} />
            </div>
          </div>
          <div className="erp-msg__list">
            {pageRows.map((message) => (
              <div key={message.id} className={`erp-msg__item ${message.id === active.id ? 'is-active' : ''}`} onClick={() => { setActiveId(message.id); markRead([message.id]); }} role="button" tabIndex={0}>
                <ErpCheckbox
                  checked={selected.includes(message.id)}
                  onChange={(checked) => setSelected((prev) => (checked ? [...prev, message.id] : prev.filter((id) => id !== message.id)))}
                />
                {!message.read ? <span className="erp-msg__unread-dot" /> : null}
                <div className="erp-msg__item-body">
                  <div className="erp-msg__item-top"><b>{message.title}</b><span>{message.time.slice(5, 16)}</span></div>
                  <div className="erp-msg__item-summary">{message.summary}</div>
                  <div className="erp-msg__item-cat"><ErpTag tone="neutral">{message.category}</ErpTag></div>
                </div>
              </div>
            ))}
            {pageRows.length === 0 ? <div className="erp-empty"><p>暂无站内信</p></div> : null}
          </div>
          <div className="erp-batch-footer" style={{ padding: '10px 12px', borderTop: '1px solid #EBEEF5' }}>
            <div className="erp-batch-footer__left">
              <span className="erp-batch-footer__selected">已选 <b>{selected.length}</b> 项</span>
              <ErpButton size="mini" onClick={() => { markRead(selected); setSelected([]); erpMessage('已标记为已读'); }}>标记已读</ErpButton>
              <ErpButton size="mini" variant="danger" onClick={async () => { if (await erpConfirm({ content: `确定删除选中的 ${selected.length} 条站内信吗？`, danger: true })) { setMessages((prev) => prev.filter((message) => !selected.includes(message.id))); setSelected([]); erpMessage('已删除（演示）'); } }}>删除</ErpButton>
            </div>
            <ErpPagination compact total={total} page={safePage} pageSize={pageSize} pageSizes={[20, 50, 100]} onChange={setPage} onSizeChange={(size) => { setPageSize(size); setPage(1); }} />
          </div>
        </aside>
        <main className="erp-msg__detail">
          <div className="erp-msg__detail-head">
            <h2>{active.title}</h2>
            <div className="erp-msg__detail-meta">
              <ErpTag tone="neutral">{active.category}</ErpTag>
              <span>{active.time}</span>
              <ErpStatusTag status={active.read ? '已读' : '未读'} />
            </div>
          </div>
          <div className="erp-msg__detail-body">{active.content}</div>
          <div className="erp-msg__detail-foot">
            <span className="erp-small erp-muted">系统消息，请勿直接回复</span>
            <div className="erp-flex">
              <ErpButton onClick={() => { markRead([active.id], !active.read); erpMessage(active.read ? '已标记为未读' : '已标记为已读'); }}>{active.read ? '标记未读' : '标记已读'}</ErpButton>
              <ErpButton variant="danger" onClick={async () => { if (await erpConfirm({ content: '确定删除这条站内信吗？', danger: true })) { setMessages((prev) => prev.filter((message) => message.id !== active.id)); erpMessage('已删除（演示）'); } }}>删除</ErpButton>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
