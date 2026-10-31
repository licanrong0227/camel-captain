import React from 'react';
import { ErpButton, ErpTag, erpMessage } from '../components/ui';
import { ListPage } from '../components/ListPage';
import { LineChart } from '../components/charts';
import { ANNOUNCEMENTS, HOME_KPIS, HOME_SHORTCUTS, HOME_TODOS, STORE_OVERVIEW } from '../data/home';
import { STORE_WIS } from '../data/reports';
import { money, num } from '../data/util';
import type { PageProps } from './commodity';

export function HomePage({ navigate }: PageProps) {
  const chartData = Array.from({ length: 30 }, (_, index) => {
    const date = STORE_WIS[0].history[index].date;
    const value = STORE_WIS.reduce((sum, store) => sum + (store.history[index]?.confirmGmv || 0), 0);
    return { label: date.slice(5), value };
  });

  return (
    <div className="erp-page">
      <div className="erp-home-hero">
        <div>
          <div className="erp-home-hero__title">上午好，林可</div>
          <div className="erp-home-hero__meta">今天是 2026-10-31 · 数据截止 10:00 · 5 家店铺营业中</div>
          <div className="erp-home-hero__actions" style={{ marginTop: 14 }}>
            <ErpButton variant="primary" onClick={() => navigate('commodity-collect')}>商品采集</ErpButton>
            <ErpButton onClick={() => navigate('trade-my-order')}>处理订单</ErpButton>
            <ErpButton onClick={() => navigate('report-shop-sign')}>查看店铺看板</ErpButton>
          </div>
        </div>
        <div className="erp-stack" style={{ alignItems: 'flex-end', gap: 4 }}>
          <ErpTag tone="brand">VIP3</ErpTag>
          <span className="erp-small erp-muted">AI 算力 1,280</span>
          <span className="erp-small erp-muted">店铺额度 5 / 8</span>
        </div>
      </div>
      <div className="erp-kpi-grid">
        {HOME_KPIS.map((kpi) => (
          <div key={kpi.key} className="erp-kpi is-clickable" onClick={() => navigate(kpi.page)} role="button" tabIndex={0}>
            <span className="erp-kpi__label">{kpi.label}</span>
            <span className="erp-kpi__value">{kpi.value}</span>
            <span className="erp-kpi__foot">
              <span className={`erp-kpi__delta ${kpi.trend === 'down' ? 'is-down' : 'is-up'}`}>{kpi.trend === 'down' ? '↓' : '↑'} {kpi.delta.replace(/[+-]/, '')}</span>
              {kpi.hint}
            </span>
          </div>
        ))}
      </div>
      <div className="erp-two-col">
        <div className="erp-chart-card">
          <div className="erp-chart-card__head">
            <b>近 30 天成交金额</b>
            <div className="erp-chart__legend"><span><i />全部店铺</span></div>
          </div>
          <LineChart data={chartData} valueFormat={(value) => `$${Math.round(value / 1000)}k`} />
        </div>
        <div className="erp-section">
          <div className="erp-section__head">
            <h3>待办事项</h3>
            <span className="erp-small erp-muted">{HOME_TODOS.length} 项</span>
          </div>
          <div className="erp-section__body">
            <div className="erp-todo-list">
              {HOME_TODOS.map((todo) => (
                <div key={todo.id} className="erp-todo" onClick={() => navigate(todo.page)} role="button" tabIndex={0}>
                  <span className={`erp-todo__level is-${todo.level}`} />
                  <div>
                    <div className="erp-todo__title">{todo.title}</div>
                    <div className="erp-todo__detail">{todo.detail}</div>
                  </div>
                  <span className="erp-todo__type">{todo.type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="erp-section">
        <div className="erp-section__head"><h3>快捷操作</h3><span className="erp-small erp-muted">常用入口</span></div>
        <div className="erp-section__body">
          <div className="erp-shortcut-grid">
            {HOME_SHORTCUTS.map((shortcut) => (
              <button type="button" className="erp-shortcut" key={shortcut.key} onClick={() => navigate(shortcut.page)}>
                <b>{shortcut.label}</b>
                <span>{shortcut.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="erp-two-col">
        <div className="erp-card" style={{ padding: '0 20px 0' }}>
          <div className="erp-table-card__head" style={{ padding: '14px 0' }}>
            <b>店铺概览</b>
            <button type="button" className="erp-link" onClick={() => navigate('report-shop-sign')}>查看店铺看板</button>
          </div>
          <ListPage
            header={null}
            columns={[
              { key: 'name', title: '店铺', width: 170, render: (row) => <div className="erp-store-row"><span className={`erp-store-dot ${row.status === '停用' ? 'is-muted' : ''}`} />{row.name}</div> },
              { key: 'todayGmv', title: '今日成交', width: 120, align: 'right', sortable: true, render: (row) => money(row.todayGmv) },
              { key: 'todayOrders', title: '今日订单', width: 100, align: 'right', render: (row) => num(row.todayOrders) },
              { key: 'conversion', title: '转化率', width: 90, align: 'right' },
              { key: 'items', title: '在售商品', width: 100, align: 'right', render: (row) => num(row.items) },
              { key: 'status', title: '状态', width: 80, render: (row) => <ErpTag tone={row.status === '启用' ? 'success' : 'neutral'}>{row.status}</ErpTag> },
            ]}
            rows={STORE_OVERVIEW}
            rowKey={(row) => row.id}
            sortable
            pagination={false}
            onRowClick={() => navigate('report-shop-sign')}
            cardless
          />
        </div>
        <div className="erp-section">
          <div className="erp-section__head"><h3>公告</h3><ErpButton size="small" onClick={() => erpMessage('已打开全部公告（演示）')}>更多</ErpButton></div>
          <div className="erp-section__body">
            {ANNOUNCEMENTS.map((item) => (
              <div className="erp-announcement" key={item.id}>
                <div className="erp-flex-between"><b>{item.title}</b><ErpTag tone="neutral">{item.tag}</ErpTag></div>
                <p>{item.content}</p>
                <span>{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
