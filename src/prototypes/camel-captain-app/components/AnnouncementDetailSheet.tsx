import React from 'react';
import { Sheet } from './Sheet';

type Announcement = { id: number; title: string; categoryName: string; date: string };

const CONTENT: Record<string, string[]> = {
  '权益到期通知': [
    '您的会员权益即将到期，请及时续费或升级，以免影响店铺运营、算力使用与数据看板等权益。到期后，未使用的权益将按平台规则处理。',
    '一、到期时间与影响范围：本次到期的权益涵盖当前套餐内的店铺管理数量、每日算力额度、数据看板与广告分析能力。权益到期后，超出基础权益的部分将停止使用，已产生的数据仍会保留，恢复权益后可继续查看。',
    '二、续费方式：可在「我的 - 资产信息」中查看当前套餐与剩余权益，选择续费或升级套餐。续费成功后权益即时生效，无需重新登录；如需调整套餐类型，请在续费前联系所属运营确认。',
    '三、未使用权益的处理：到期前未使用的算力额度、优惠券及增值服务次数不结转到下一个周期，请合理安排使用时间。已支付但尚未使用的权益，按平台规则在有效期内继续有效。',
    '四、到期后的使用限制：权益到期后，超出基础权益的店铺将进入只读状态，无法继续同步订单与商品数据；数据看板中的历史统计仍可查询，广告分析与批量编辑等能力将暂停。',
    '五、数据与账号安全：续费或升级不会影响账号内已有数据，也不会改变店铺授权关系。请勿通过非官方渠道购买权益，避免造成账号与数据风险。',
    '六、联系方式：如需了解套餐详情、发票开具或权益恢复进度，可在「我的 - 联系我们」中获取客服联系方式，服务时间为工作日 9:00 - 18:00。',
  ],
};

export function announcementParagraphs(item: Announcement): string[] {
  if (CONTENT[item.title]) return CONTENT[item.title];
  return [
    `本条公告用于演示公告详情：${item.title}。正式公告正文以运营发布内容为准，此处展示标题、分类与发布时间。`,
    '适用范围：本公告适用于平台内全部代理商账号。公告内容如有调整，以最新发布的版本为准。',
    '生效时间：公告自发布时间起生效，相关权益与操作规则以系统内实际展示为准。',
    '操作指引：如需查看历史公告，可在首页公告栏点击「查看全部」；如需进一步确认公告内容，请联系所属运营或客服。',
    '联系方式：可在「我的 - 联系我们」中获取客服联系方式，服务时间为工作日 9:00 - 18:00。',
  ];
}

export function AnnouncementDetailSheet({
  open,
  item,
  onClose,
}: {
  open: boolean;
  item: Announcement | null;
  onClose: () => void;
}) {
  return (
    <Sheet open={open} title="公告详情" height={660} minHeight={660} onClose={onClose}>
      {item ? (
        <article className="cc-ann-detail">
          <span className={`cc-ann-tag${item.categoryName === '弹窗公告' ? ' is-popup' : ''}`}>{item.categoryName}</span>
          <h2>{item.title}</h2>
          <div className="cc-ann-detail-date">{item.date}</div>
          {announcementParagraphs(item).map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
          <div className="cc-ann-detail-foot">骆驼队长 · 智慧运营中台</div>
        </article>
      ) : null}
    </Sheet>
  );
}
