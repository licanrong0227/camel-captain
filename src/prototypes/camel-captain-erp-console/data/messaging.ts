import { PRODUCT_IMAGES, createRng, dayOffset, intBetween, makeCode, pick } from './util';

export interface Conversation {
  id: string;
  buyer: string;
  country: string;
  language: string;
  lastMessage: string;
  time: string;
  unread: number;
  status: string;
  orderNo: string;
  avatarColor: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  direction: 'in' | 'out';
  type: 'text' | 'image' | 'order' | 'product';
  text: string;
  time: string;
  image?: string;
  orderNo?: string;
}

export interface InSiteMessage {
  id: string;
  title: string;
  summary: string;
  category: string;
  time: string;
  read: boolean;
  content: string;
}

const BUYERS = ['Emily Johnson', 'Michael Brown', 'Sophia Davis', 'James Wilson', 'Olivia Taylor', 'Daniel Moore', 'Emma Clark', 'Lucas Lewis'];
const COUNTRIES = ['美国', '英国', '德国', '法国', '西班牙', '加拿大'];
const LANGUAGES = ['英语', '英语', '德语', '法语', '西班牙语', '英语'];
const COLORS = ['#FF7D29', '#2881FF', '#0BB861', '#FFA628', '#F44837', '#8B5CF6'];

const BUYER_LINES = [
  'Hi, when will my order be shipped?',
  'Can I change the shipping address?',
  'Is this bag available in black?',
  'The tracking information has not updated for 3 days.',
  'Thank you, received the package today!',
  'Could you declare a lower value for customs?',
  'I want to order 10 more pieces, any discount?',
  'The color is slightly different from the picture.',
];

const SELLER_LINES = [
  'Hello, thanks for reaching out. Let me check it for you.',
  'Your order has been packed and will be shipped today.',
  'Yes, black is in stock. You can place the order directly.',
  'We have contacted the carrier and will update you soon.',
  'Thank you for your confirmation. Have a nice day!',
  'Sorry for the inconvenience. We will send a replacement.',
  'For bulk orders we can offer a 5% discount.',
  'Please send us a photo so we can verify the issue.',
];

export const CONVERSATIONS: Conversation[] = (() => {
  const rng = createRng(20261111);
  return Array.from({ length: 14 }, (_, index) => {
    const unread = index < 5 ? intBetween(rng, 1, 3) : 0;
    return {
      id: makeCode('CV', index, 5),
      buyer: BUYERS[index % BUYERS.length],
      country: COUNTRIES[index % COUNTRIES.length],
      language: LANGUAGES[index % LANGUAGES.length],
      lastMessage: SELLER_LINES[index % SELLER_LINES.length],
      time: dayOffset(index < 3 ? 0 : -intBetween(rng, 1, 8), intBetween(rng, 8, 20), intBetween(rng, 0, 59)),
      unread,
      status: index > 10 ? '已结束' : '进行中',
      orderNo: `20${makeCode('', index + 26004000, 8)}`,
      avatarColor: COLORS[index % COLORS.length],
    };
  });
})();

export const CHAT_MESSAGES: ChatMessage[] = (() => {
  const rng = createRng(20261112);
  return CONVERSATIONS.flatMap((conversation, conversationIndex) =>
    Array.from({ length: intBetween(rng, 6, 12) }, (_, index) => {
      const direction = index % 2 === 0 ? 'in' : 'out';
      const type = index === 1 ? 'product' : index === 4 ? 'order' : 'text';
      const content = direction === 'in' ? BUYER_LINES[(conversationIndex + index) % BUYER_LINES.length] : SELLER_LINES[(conversationIndex + index) % SELLER_LINES.length];
      return {
        id: `${conversation.id}-M${index + 1}`,
        conversationId: conversation.id,
        direction,
        type,
        text: type === 'text' ? content : type === 'product' ? 'Product card' : 'Order card',
        time: dayOffset(-(conversationIndex < 3 ? 0 : 1), 9 + Math.floor(index / 2), index % 2 === 0 ? 10 : 25),
        image: type === 'product' ? PRODUCT_IMAGES[(conversationIndex + index) % PRODUCT_IMAGES.length] : undefined,
        orderNo: conversation.orderNo,
      } as ChatMessage;
    }),
  );
})();

export const IN_SITE_MESSAGES: InSiteMessage[] = (() => {
  const rng = createRng(20261113);
  const categories = ['系统通知', '订单消息', '商品消息', '服务消息'];
  const templates = [
    ['店铺授权即将到期', '您的店铺「161 sneakerhub8」授权将于 2026-11-05 到期，请及时续期。'],
    ['商品审核未通过', '商品「Classic leather crossbody bag」因主图分辨率不足审核未通过。'],
    ['新订单提醒', '您有 3 笔新订单待处理，请及时安排采购与发货。'],
    ['物流异常提醒', '运单 YT99002103 已连续 3 天未更新轨迹，请关注。'],
    ['算力余额不足', '当前 AI 算力余额仅剩 12，可能影响批量编辑与图片处理。'],
    ['系统升级通知', '系统将于 2026-11-02 02:00–04:00 进行例行维护。'],
    ['帮助中心新增文档', '《商品信息质量检测使用指南》已发布，可在帮助中心查看。'],
    ['退款申请待处理', '买家 Emily Johnson 发起退款申请，请在 24 小时内处理。'],
  ];
  return Array.from({ length: 42 }, (_, index) => {
    const template = templates[index % templates.length];
    return {
      id: makeCode('MSG', index, 6),
      title: template[0],
      summary: template[1],
      category: categories[index % categories.length],
      time: dayOffset(-intBetween(rng, 0, 20), intBetween(rng, 8, 20), intBetween(rng, 0, 59)),
      read: rng() > 0.45,
      content: `${template[1]}\n\n处理建议：请登录骆驼队长 ERP 对应模块查看详情并按提示处理。如已完成处理，可忽略本消息。\n\n本消息由系统自动发送，请勿直接回复。`,
    };
  });
})();
