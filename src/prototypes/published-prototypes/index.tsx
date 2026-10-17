/**
 * @name 原型发布地址
 */

import React, { useRef, useState } from 'react';
import './style.css';

interface PublishedPrototype {
  name: string;
  id: string;
  summary: string[];
  firstPublished: string;
  url: string;
}

const PUBLISHED_PROTOTYPES: PublishedPrototype[] = [
  {
    name: '批量编辑弹窗-主图置换',
    id: 'auto-edit-dialog',
    summary: [
      '左侧 12 类编辑模块菜单，带条目数、完成打勾和「已编辑 x/x」进度',
      '主图四种处理方式：调换顺序（拖拽/随机打乱/恢复）、替换主图、删除主图、附加主图',
      '模板工具条：套用、创建、管理模板',
      '推广图、视频、白底图、图片数量限制等批量设置行，未启用置灰',
      '通用「上传图片」弹窗：本地/URL/引用三种来源，支持拖拽和 Ctrl+V',
      '底部「取消 / 提交认领」操作',
    ],
    firstPublished: '2026-09-28T06:17:00.349Z',
    url: 'https://licanrong0227.github.io/camel-captain/auto-edit-dialog/',
  },
  {
    name: '批量美图-加水印',
    id: 'batch-image',
    summary: [
      '五个处理选项卡：转白底、翻译、加水印、去水印、裁剪缩放',
      '文字/图片水印设置：字体、透明度、九宫格位置、平铺角度，右侧实时预览',
      '水印模板套用、创建、管理（删除需二次确认）',
      '商品图片网格全选/单选，带「已选 x/x」计数和尺寸标签',
      '「开始处理」触发处理提示；未配置水印时给出错误提示',
      '底部「取消 / 确定」关闭弹窗',
    ],
    firstPublished: '2026-09-18T11:21:21.561Z',
    url: 'https://licanrong0227.github.io/camel-captain/batch-image/',
  },
  {
    name: '批量美图-停止处理',
    id: 'batch-image-white-bg',
    summary: [
      '转白底选项卡的处理中状态流程演示',
      '「开始处理」→ 红色「停止处理」→「停止中」的状态切换与提示',
      '处理期间禁用「确认」按钮、选项卡整体置灰不可切换',
      '「有已处理未保存的图片」气泡提示',
      '退出时弹出确认框：保存并退出 / 直接退出',
    ],
    firstPublished: '2026-10-13T08:35:35.884Z',
    url: 'https://licanrong0227.github.io/camel-captain/batch-image-white-bg/',
  },
  {
    name: '敦煌网商品合规检测',
    id: 'dhgate-compliance-check',
    summary: [
      '四个页面：发起检测、质检记录、质检详情、规则说明',
      '商品链接输入校验、最近检测记录、重复提交提醒',
      '质检记录按状态/时间/结果筛选搜索，含通过/违规/疑似/失败计数与分页',
      '详情页质检项卡片轮询出结果：违规原因、证据对比、整改建议、单项重检',
      '点赞/点踩反馈，顶栏「重新检测」「重新采集」弹窗',
      '规则说明页展示各质检项检测对象与状态图例',
    ],
    firstPublished: '2026-10-14T02:53:45.002Z',
    url: 'https://licanrong0227.github.io/camel-captain/dhgate-compliance-check/',
  },
  {
    name: '编辑产品弹窗-详情',
    id: 'edit-product-dialog',
    summary: [
      '左侧商品列表：点选切换、行内删除、已编辑/未编辑标记、翻页',
      '「基本 / 详情 / 日志」页签切换，列表可收起展开',
      '详情页富文本编辑器：格式工具栏 + 详情长图正文',
      '详情模板：下拉套用并整体替换正文、创建模板（名称必填）、管理模板（删除二次确认）',
      '操作轻提示；「保存」提示后关闭，重开保留选中与状态改动',
    ],
    firstPublished: '2026-09-28T09:37:02.330Z',
    url: 'https://licanrong0227.github.io/camel-captain/edit-product-dialog/',
  },
  {
    name: '编辑产品弹窗-主图拼图',
    id: 'edit-product-dialog-media',
    summary: [
      '编辑产品弹窗媒体区还原：视频表单、主图（5/8 计数）、站外推广图',
      '「主图拼图」弹窗：左侧选模板 + 3×3 画布 + 右侧可选图片栏',
      '拼图格子：滚轮缩放、格内拖拽平移、悬停删除清空',
      '格子图片拖到另一格移动/互换，跟随光标',
      '可选图片复选框多选（以空格数为上限）并按顺序导入',
      '底栏清空 / 导出 / 上传到主图（达上限时确认替换末位主图）',
    ],
    firstPublished: '2026-10-13T11:04:04.889Z',
    url: 'https://licanrong0227.github.io/camel-captain/edit-product-dialog-media/',
  },
  {
    name: '帮助中心（后台）',
    id: 'help-center-admin-copy',
    summary: [
      '后台管理外壳，「运营」菜单含帮助中心入口，面包屑定位',
      '帮助文档目录树：添加模块/子模块、改名、删除（二次确认）',
      '目录拖拽排序与移动，目标节点已关联文档时校验拦截',
      '节点启用/禁用父子联动',
      '选中叶节点显示富文本编辑器编写文档，父节点显示空态提示',
    ],
    firstPublished: '2026-09-17T08:45:30.571Z',
    url: 'https://licanrong0227.github.io/camel-captain/help-center-admin-copy/',
  },
  {
    name: '帮助中心（前台）',
    id: 'help-center-copy',
    summary: [
      '前台帮助中心：左侧多级章节导航 + 右侧长文档正文',
      '关键词搜索框',
      '点击导航滚动定位到章节锚点，正文滚动反向高亮并自动展开上级分组',
      '锚点同步 URL，支持一键展开/折叠全部分组',
      '正文含操作步骤、注意事项、视频占位、字段说明表格、常见问题等章节',
    ],
    firstPublished: '2026-09-17T08:46:07.445Z',
    url: 'https://licanrong0227.github.io/camel-captain/help-center-copy/',
  },
  {
    name: '即时咨询',
    id: 'instant-consultation',
    summary: [
      '客服 IM 工作台：店铺列表支持搜索、切换和未读角标',
      '会话列表按买家/订单号/聊天记录搜索，「未读」筛选',
      '消息气泡带自动翻译对照（原文 + 译文 + 翻译角标）',
      '输入区：表情、图片、快捷键提示（回车发送、Ctrl+V 粘贴等）',
      '自动翻译开关、50+ 目标语言选择、翻译与发送按钮',
      '右侧买家信息/订单信息面板，悬浮客服入口',
    ],
    firstPublished: '2026-09-18T08:48:47.850Z',
    url: 'https://licanrong0227.github.io/camel-captain/instant-consultation/',
  },
  {
    name: '我的商品 - 循环刊登',
    id: 'my-products-bi',
    summary: [
      '「我的商品」列表页，聚焦发布管理-循环刊登状态视图',
      '左侧状态分组统计导航（发布管理/销售状态/审核与风险），点击切换筛选',
      '多条件筛选区与工具栏：搜索、重置、导出、导入货源、同步线上、列设置等',
      '商品表格展示循环刊登次数与剩余次数标签，发布失败行显示失败原因',
      '底部分页与悬浮客服、快速滚动入口',
    ],
    firstPublished: '2026-10-10T09:12:42.585Z',
    url: 'https://licanrong0227.github.io/camel-captain/my-products-bi/',
  },
  {
    name: '报表-算力明细',
    id: 'operation-log',
    summary: [
      '四项算力统计概览：可用、冻结、累计充值、累计消费',
      '按变动时间日期范围和类型（充值/消费）筛选，搜索后实时更新表格',
      '明细表六列，变动算力增加绿色带「+」、消耗红色带「-」，无结果显示空态',
      '完整分页交互：每页条数切换、页码跳转、前往 N 页',
      '「算力定价」弹窗列出各 AI 功能消耗点，支持 Esc/遮罩关闭',
    ],
    firstPublished: '2026-09-28T11:32:59.417Z',
    url: 'https://licanrong0227.github.io/camel-captain/operation-log/',
  },
  {
    name: '购买权益弹窗-积分不足',
    id: 'personal-center-bi',
    summary: [
      '「算力积分不足」「店铺数量不足」两种触发场景演示入口',
      '触发后先弹提示框，可关闭或进入购买权益弹窗',
      '弹窗顶部三步流程（选择→支付→完成）与币种选择',
      'AI 算力按数量档位购买，店铺数量按期限档位购买（长期限带折扣角标），价格联动',
      '底部「提交订单」完成下单演示',
    ],
    firstPublished: '2026-09-30T02:29:45.824Z',
    url: 'https://licanrong0227.github.io/camel-captain/personal-center-bi/',
  },
  {
    name: '个人中心-算力明细',
    id: 'personal-center-page',
    summary: [
      '个人中心：左侧菜单切换、会员信息卡（等级徽章、邀请码、推广链接）',
      '信息网格展示账号字段，「算力余额」旁提供「算力明细」入口',
      '「基本资料 / 修改密码」标签页，基本资料可编辑保存',
      '「算力明细」弹窗：统计概览 + 筛选 + 变动记录表格 + 分页',
      '弹窗内可再开「算力定价」二级弹窗，Esc 分层关闭',
    ],
    firstPublished: '2026-09-30T08:51:07.486Z',
    url: 'https://licanrong0227.github.io/camel-captain/personal-center-page/',
  },
  {
    name: '更新发布弹窗-循环刊登策略',
    id: 'update-publish-dialog',
    summary: [
      '「更新发布」弹窗，关闭后可通过按钮重新唤起',
      '发布时间：立即发布 / 定时发布（日期时间选择器，可清除）',
      '循环刊登开关 + 循环次数限制（仅正整数）',
      '自动刊登策略必填校验：标题策略（随机打乱/增量前后缀/AI 重新生成/备选标题）与主图策略可独立开关、至少启用一项',
      '主图策略：随机打乱或备选首图（上传/删除、显示分辨率，含上传图片子弹窗）',
      '当日刊登数量上限：直接终止或次日继续（可选时间点）',
    ],
    firstPublished: '2026-10-15T08:53:01.479Z',
    url: 'https://licanrong0227.github.io/camel-captain/update-publish-dialog/',
  },
];

const TIME_FORMATTER = new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

function formatTime(iso: string): string {
  return TIME_FORMATTER.format(new Date(iso)).replace(/\//g, '-');
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number>();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      className={`pp-copy-btn${copied ? ' is-copied' : ''}`}
      onClick={handleCopy}
      title="复制发布地址"
    >
      {copied ? '已复制' : '复制'}
    </button>
  );
}

const SORTED_PROTOTYPES = [...PUBLISHED_PROTOTYPES].sort(
  (a, b) => new Date(b.firstPublished).getTime() - new Date(a.firstPublished).getTime(),
);

export default function PublishedPrototypesPage() {
  return (
    <div className="pp-page">
      <div className="pp-card">
        <div className="pp-card__header">
          <h1 className="pp-title">原型发布地址</h1>
          <span className="pp-count">已发布 {SORTED_PROTOTYPES.length} 个原型</span>
        </div>
        <table className="pp-table">
          <thead>
            <tr>
              <th className="pp-table__col-name">原型名称</th>
              <th>需求概述</th>
              <th className="pp-table__col-time">发布时间</th>
              <th className="pp-table__col-url">发布地址</th>
            </tr>
          </thead>
          <tbody>
            {SORTED_PROTOTYPES.map((item) => (
              <tr key={item.id}>
                <td className="pp-table__name">{item.name}</td>
                <td className="pp-table__summary">
                  <ol>
                    {item.summary.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ol>
                </td>
                <td className="pp-table__time">{formatTime(item.firstPublished)}</td>
                <td className="pp-table__url-cell">
                  <a className="pp-table__link" href={item.url} target="_blank" rel="noreferrer">
                    {item.url}
                  </a>
                  <CopyButton text={item.url} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
