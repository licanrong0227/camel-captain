import React, { useState } from 'react';
import {
  ErpButton,
  ErpDialog,
  ErpForm,
  ErpFormItem,
  ErpInput,
  ErpInputNumber,
  ErpRadioGroup,
  ErpSection,
  ErpSelect,
  ErpStatusTag,
  ErpTag,
  ErpTextarea,
  erpMessage,
} from '../components/ui';
import { FilterBar, ListPage, PageHeader } from '../components/ListPage';
import { Gauge } from '../components/charts';
import { ExportDialog } from '../components/dialogs/common';
import {
  EXCHANGE_RATES,
  LAST_MILE_RECORDS,
  QUALITY_REPORTS,
  type LastMileRecord,
  type QualityReport,
} from '../data/toolbox';
import { CARRIER_OPTIONS, COUNTRY_OPTIONS, PRODUCT_IMAGES, num } from '../data/util';

export function LastMilePage() {
  const [trackingNos, setTrackingNos] = useState('YT99002103\nYT99002104');
  const [carrier, setCarrier] = useState('华磊物流');
  const [postcode, setPostcode] = useState('');
  const [queried, setQueried] = useState(true);
  const [rows, setRows] = useState<LastMileRecord[]>(LAST_MILE_RECORDS.slice(0, 12));
  const [credential, setCredential] = useState<LastMileRecord | null>(null);
  const [credentialOpen, setCredentialOpen] = useState(false);

  const query = () => {
    const list = trackingNos.split('\n').map((line) => line.trim()).filter(Boolean);
    const matched = LAST_MILE_RECORDS.filter((row) => list.length === 0 || list.some((value) => row.trackingNo.includes(value)) || list.some((value) => value === row.orderNo));
    setRows(matched.length ? matched : LAST_MILE_RECORDS.slice(0, 6));
    setQueried(true);
    erpMessage(`查询完成，共 ${matched.length || 6} 条记录（演示）`);
  };

  return (
    <div className="erp-page">
      <PageHeader title="尾程签收凭证查询" description="按运单号查询尾程签收凭证，核对签收时间、签收人与地址。" />
      <div className="erp-tool-grid">
        <div className="erp-tool-card">
          <h3>查询条件</h3>
          <ErpForm layout="vertical">
            <ErpFormItem label="运单号（每行一个）" required>
              <ErpTextarea value={trackingNos} onChange={setTrackingNos} rows={5} placeholder="请输入运单号，每行一个" />
            </ErpFormItem>
            <ErpFormItem label="物流商">
              <ErpSelect options={CARRIER_OPTIONS} value={carrier} onChange={(value) => setCarrier(String(value))} width="100%" />
            </ErpFormItem>
            <ErpFormItem label="签收地址邮编" help="部分服务商要求同时提供邮编">
              <ErpInput value={postcode} onChange={setPostcode} placeholder="例如 90001" />
            </ErpFormItem>
            <div className="erp-flex">
              <ErpButton variant="primary" onClick={query}>查询凭证</ErpButton>
              <ErpButton onClick={() => { setTrackingNos(''); setPostcode(''); setQueried(false); }}>清空</ErpButton>
            </div>
          </ErpForm>
        </div>
        <div className="erp-tool-card">
          <h3>查询说明</h3>
          <div className="erp-stack" style={{ gap: 12 }}>
            <div className="erp-inline-note">尾程凭证数据来自物流商回传，通常会在签收后 2–24 小时内更新。</div>
            <div className="erp-inline-note is-warning">若提示「未查询到凭证」，请确认运单号与物流商是否匹配，或联系物流商核实。</div>
            <div className="erp-detail-summary">
              <img src={PRODUCT_IMAGES[2]} alt="" />
              <div className="erp-detail-summary__body">
                <b>示例：签收凭证</b>
                <span>包含签收时间、签收人、签收图片与地址匹配结果</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {queried ? (
        <div className="erp-card" style={{ padding: 20 }}>
          <div className="erp-flex-between" style={{ marginBottom: 12 }}>
            <b style={{ fontSize: 14 }}>查询结果</b>
            <span className="erp-small erp-muted">共 {rows.length} 条</span>
          </div>
          <ListPage
            header={null}
            columns={[
              { key: 'trackingNo', title: '运单号', width: 170, render: (row) => <span className="erp-code">{row.trackingNo}</span> },
              { key: 'orderNo', title: '订单号', width: 160, render: (row) => <span className="erp-code">{row.orderNo}</span> },
              { key: 'carrier', title: '物流商', width: 120 },
              { key: 'status', title: '签收状态', width: 100, render: (row) => <ErpStatusTag status={row.status} /> },
              { key: 'signedAt', title: '签收时间', width: 160 },
              { key: 'signer', title: '签收人', width: 140 },
              { key: 'postcode', title: '邮编', width: 90 },
            ]}
            rows={rows}
            rowKey={(row) => row.id}
            filterKey={`${trackingNos}-${carrier}-${postcode}`}
            rowActions={(row) => [
              { label: '查看凭证', onClick: () => { setCredential(row); setCredentialOpen(true); } },
              { label: '复制运单号', onClick: () => erpMessage(`已复制 ${row.trackingNo}`) },
            ]}
          />
        </div>
      ) : null}
      <ErpDialog open={credentialOpen} title={`签收凭证 · ${credential?.trackingNo || ''}`} width={640} onClose={() => setCredentialOpen(false)} footer={<><ErpButton onClick={() => setCredentialOpen(false)}>关闭</ErpButton><ErpButton variant="primary" onClick={() => erpMessage('凭证下载任务已创建（演示）')}>下载凭证</ErpButton></>}>
        {credential ? (
          <div className="erp-stack" style={{ gap: 16 }}>
            <div className="erp-credential" style={{ width: '100%', height: 280 }}>签收凭证图片占位</div>
            <div className="erp-descriptions" style={{ ['--erp-desc-cols' as string]: 2 }}>
              <div className="erp-descriptions__item"><span className="erp-descriptions__label">运单号</span><span className="erp-descriptions__value">{credential.trackingNo}</span></div>
              <div className="erp-descriptions__item"><span className="erp-descriptions__label">订单号</span><span className="erp-descriptions__value">{credential.orderNo}</span></div>
              <div className="erp-descriptions__item"><span className="erp-descriptions__label">物流商</span><span className="erp-descriptions__value">{credential.carrier}</span></div>
              <div className="erp-descriptions__item"><span className="erp-descriptions__label">签收时间</span><span className="erp-descriptions__value">{credential.signedAt}</span></div>
              <div className="erp-descriptions__item"><span className="erp-descriptions__label">签收人</span><span className="erp-descriptions__value">{credential.signer}</span></div>
              <div className="erp-descriptions__item"><span className="erp-descriptions__label">邮编</span><span className="erp-descriptions__value">{credential.postcode}</span></div>
            </div>
          </div>
        ) : null}
      </ErpDialog>
    </div>
  );
}

export function PostalCodePage() {
  const [tab, setTab] = useState('single');
  const [country, setCountry] = useState('美国');
  const [state, setState] = useState('California');
  const [city, setCity] = useState('Los Angeles');
  const [postcode, setPostcode] = useState('90001');
  const [address, setAddress] = useState('1200 Sunset Blvd');
  const [result, setResult] = useState<null | { valid: boolean; level: string; suggestion: string; normalized: string }>(null);
  const [batch, setBatch] = useState('US, California, Los Angeles, 90001\nUK, England, London, EC1A 1BB\nDE, Berlin, Berlin, 10115');
  const [batchRows, setBatchRows] = useState<Array<{ country: string; city: string; postcode: string; valid: boolean; level: string }>>([]);

  return (
    <div className="erp-page">
      <PageHeader title="地址邮编校验" description="校验收件地址与邮编是否匹配，返回标准化地址与修正建议。" />
      <div className="erp-card" style={{ padding: '0 20px 20px' }}>
        <div style={{ paddingTop: 14, marginBottom: 14 }}>
          <div className="erp-segmented">
            <button type="button" className={tab === 'single' ? 'is-active' : ''} onClick={() => setTab('single')}>单个校验</button>
            <button type="button" className={tab === 'batch' ? 'is-active' : ''} onClick={() => setTab('batch')}>批量校验</button>
          </div>
        </div>
        {tab === 'single' ? (
          <div className="erp-tool-grid">
            <div className="erp-tool-card">
              <h3>地址信息</h3>
              <ErpForm layout="vertical">
                <ErpFormItem label="国家"><ErpSelect options={COUNTRY_OPTIONS} value={country} onChange={(value) => setCountry(String(value))} width="100%" /></ErpFormItem>
                <ErpFormItem label="州 / 省"><ErpInput value={state} onChange={setState} /></ErpFormItem>
                <ErpFormItem label="城市"><ErpInput value={city} onChange={setCity} /></ErpFormItem>
                <ErpFormItem label="邮编" required><ErpInput value={postcode} onChange={setPostcode} /></ErpFormItem>
                <ErpFormItem label="详细地址"><ErpInput value={address} onChange={setAddress} /></ErpFormItem>
                <ErpButton variant="primary" onClick={() => {
                  const valid = /^\d{5}$/.test(postcode);
                  setResult({ valid, level: valid ? '精确匹配' : '城市匹配', suggestion: valid ? '地址与邮编匹配，可直接使用' : '美国邮编应为 5 位数字，请检查', normalized: `${address}, ${city}, ${state} ${postcode}, ${country}` });
                }}>校验地址</ErpButton>
              </ErpForm>
            </div>
            <div className="erp-tool-card">
              <h3>校验结果</h3>
              {result ? (
                <div className="erp-stack" style={{ gap: 14 }}>
                  <div className="erp-flex"><ErpTag tone={result.valid ? 'success' : 'danger'}>{result.valid ? '邮编有效' : '邮编无效'}</ErpTag><ErpTag tone="info">{result.level}</ErpTag></div>
                  <div><span className="erp-small erp-muted">标准化地址</span><p style={{ marginTop: 4 }}>{result.normalized}</p></div>
                  <div><span className="erp-small erp-muted">校验建议</span><p style={{ marginTop: 4 }}>{result.suggestion}</p></div>
                </div>
              ) : (
                <div className="erp-empty"><p>输入地址后点击「校验地址」查看结果</p></div>
              )}
            </div>
          </div>
        ) : (
          <div className="erp-stack" style={{ gap: 14 }}>
            <ErpTextarea value={batch} onChange={setBatch} rows={6} placeholder="每行一条：国家, 州/省, 城市, 邮编" />
            <div><ErpButton variant="primary" onClick={() => setBatchRows(batch.split('\n').filter(Boolean).map((line) => {
              const [c, s, ct, pc] = line.split(',').map((item) => item.trim());
              const valid = /^\d{5}$/.test(pc) || /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i.test(pc);
              return { country: c, city: ct, postcode: pc, valid, level: valid ? '精确匹配' : '未匹配' };
            }))}>批量校验</ErpButton></div>
            {batchRows.length ? (
              <table className="erp-cost-table">
                <thead><tr><th>国家</th><th>城市</th><th>邮编</th><th>结果</th><th>匹配级别</th></tr></thead>
                <tbody>{batchRows.map((row, index) => <tr key={`${row.postcode}-${index}`}><td>{row.country}</td><td>{row.city}</td><td>{row.postcode}</td><td><ErpTag tone={row.valid ? 'success' : 'danger'}>{row.valid ? '有效' : '无效'}</ErpTag></td><td>{row.level}</td></tr>)}</tbody>
              </table>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

export function ExchangeRatePage() {
  const [base, setBase] = useState('USD');
  const [date, setDate] = useState('2026-10-31');
  const [amount, setAmount] = useState(100);
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('CNY');
  const [rows] = useState(EXCHANGE_RATES);

  const convert = (value: number, fromCode: string, toCode: string) => {
    const fromRate = rows.find((row) => row.code === fromCode)?.rate || 1;
    const toRate = rows.find((row) => row.code === toCode)?.rate || 1;
    return (value * fromRate) / toRate;
  };

  return (
    <div className="erp-page">
      <PageHeader title="汇率" description="查看实时汇率并进行币种换算，用于采购成本与售价测算。" extra={<ErpButton onClick={() => erpMessage('汇率已刷新（演示）')}>刷新汇率</ErpButton>} />
      <div className="erp-tool-grid">
        <div className="erp-tool-card">
          <h3>汇率换算</h3>
          <ErpForm layout="vertical">
            <ErpFormItem label="金额"><ErpInputNumber value={amount} onChange={setAmount} precision={2} width={180} /></ErpFormItem>
            <ErpFormItem label="从">
              <ErpSelect options={rows.map((row) => ({ label: `${row.name} ${row.code}`, value: row.code }))} value={from} onChange={(value) => setFrom(String(value))} width="100%" />
            </ErpFormItem>
            <ErpFormItem label="到">
              <div className="erp-flex">
                <ErpSelect options={rows.map((row) => ({ label: `${row.name} ${row.code}`, value: row.code }))} value={to} onChange={(value) => setTo(String(value))} width={220} />
                <ErpButton size="small" onClick={() => { setFrom(to); setTo(from); }}>交换</ErpButton>
              </div>
            </ErpFormItem>
          </ErpForm>
          <div className="erp-config-preview" style={{ marginTop: 12 }}>
            <b>换算结果</b>
            <div className="erp-config-preview__row"><span>{amount} {from}</span><strong>{convert(amount, from, to).toFixed(2)} {to}</strong></div>
            <span className="erp-small">汇率：1 {from} = {convert(1, from, to).toFixed(4)} {to}</span>
          </div>
        </div>
        <div className="erp-tool-card">
          <h3>基准与日期</h3>
          <ErpForm layout="vertical">
            <ErpFormItem label="基准币种"><ErpSelect options={rows.map((row) => ({ label: `${row.name} ${row.code}`, value: row.code }))} value={base} onChange={(value) => setBase(String(value))} width="100%" /></ErpFormItem>
            <ErpFormItem label="汇率日期"><ErpInput type="date" value={date} onChange={setDate} /></ErpFormItem>
          </ErpForm>
          <div className="erp-inline-note" style={{ marginTop: 12 }}>汇率由系统每日 09:30 自动同步，固定汇率可在渠道定价中单独配置。</div>
        </div>
      </div>
      <div className="erp-card" style={{ padding: 20 }}>
        <div className="erp-flex-between" style={{ marginBottom: 12 }}><b style={{ fontSize: 14 }}>汇率表</b><span className="erp-small erp-muted">单位：1 外币 = ? CNY</span></div>
        <ListPage
          header={null}
          columns={[
            { key: 'name', title: '币种', width: 130, render: (row) => <span>{row.name} <span className="erp-code">{row.code}</span></span> },
            { key: 'rate', title: '中间价', width: 110, align: 'right', sortable: true, render: (row) => row.rate.toFixed(4) },
            { key: 'buy', title: '买入价', width: 110, align: 'right', render: (row) => row.buy.toFixed(4) },
            { key: 'sell', title: '卖出价', width: 110, align: 'right', render: (row) => row.sell.toFixed(4) },
            { key: 'updatedAt', title: '更新时间', width: 160 },
            { key: 'actions', title: '操作', width: 90, render: (row) => <button type="button" className="erp-link" onClick={() => { setFrom(row.code); setTo('CNY'); }}>换算</button> },
          ]}
          rows={rows}
          rowKey={(row) => row.code}
          sortable
          selectable
          filterKey={base}
          pageSizeDefault={10}
          rowActions={(row) => [
            { label: '换算', onClick: () => { setFrom(row.code); setTo('CNY'); } },
            { label: '复制汇率', onClick: () => erpMessage(`已复制 1 ${row.code} = ${row.rate.toFixed(4)} CNY`) },
            { label: '查看历史', onClick: () => erpMessage(`近 30 天 ${row.code} 汇率趋势（演示）`) },
          ]}
          batchActions={(selected) => [
            { label: '导出汇率', onClick: () => erpMessage(`已导出 ${selected.length} 个币种汇率（演示）`) },
          ]}
        />
      </div>
    </div>
  );
}

export function QualityInspectionPage() {
  const [itemId, setItemId] = useState('102026000001');
  const [detecting, setDetecting] = useState(false);
  const [progress, setProgress] = useState(100);
  const [report, setReport] = useState<QualityReport>(QUALITY_REPORTS[0]);
  const [history, setHistory] = useState<QualityReport[]>(QUALITY_REPORTS);
  const [exportOpen, setExportOpen] = useState(false);

  const start = () => {
    if (!itemId.trim()) {
      erpMessage('请输入商品 ID 或链接', 'warning');
      return;
    }
    setDetecting(true);
    setProgress(0);
    window.setTimeout(() => { setProgress(35); }, 300);
    window.setTimeout(() => { setProgress(70); }, 700);
    window.setTimeout(() => {
      setProgress(100);
      setDetecting(false);
      const next = QUALITY_REPORTS[(QUALITY_REPORTS.indexOf(report) + 1) % QUALITY_REPORTS.length];
      setReport(next);
      setHistory((prev) => [next, ...prev]);
      erpMessage('商品信息质量检测完成（演示）');
    }, 1100);
  };

  return (
    <div className="erp-page">
      <PageHeader title="商品信息质量检测" description="从标题、图片、属性、描述、价格五个维度评估商品信息质量并给出优化建议。" extra={<ErpButton onClick={() => setExportOpen(true)}>导出报告</ErpButton>} />
      <div className="erp-card" style={{ padding: 20 }}>
        <div className="erp-flex" style={{ gap: 12, flexWrap: 'wrap' }}>
          <ErpInput value={itemId} onChange={setItemId} placeholder="输入商品 ID、商品链接或选择店铺商品" style={{ width: 420 }} />
          <ErpButton variant="primary" loading={detecting} onClick={start}>开始检测</ErpButton>
          <ErpButton onClick={() => erpMessage('已打开选择商品弹窗（演示）')}>选择店铺商品</ErpButton>
          <span className="erp-small erp-muted">最近检测：{report.checkedAt}</span>
        </div>
        {detecting ? (
          <div className="erp-stack" style={{ marginTop: 16 }}>
            <div className="erp-flex-between"><span className="erp-small">检测中…</span><span className="erp-small erp-muted">{progress}%</span></div>
            <div className="erp-progress"><div className="erp-progress__bar" style={{ width: `${progress}%` }} /></div>
          </div>
        ) : null}
      </div>
      <div className="erp-tool-grid">
        <div className="erp-tool-card">
          <h3>检测结果</h3>
          <div className="erp-flex" style={{ gap: 20 }}>
            <Gauge value={report.score} size={140} />
            <div className="erp-stack" style={{ gap: 6 }}>
              <span className="erp-small erp-muted">综合评分</span>
              <span className="erp-score" style={{ fontSize: 22 }}>{report.score}<em>/100</em></span>
              <ErpTag tone={report.score >= 85 ? 'success' : report.score >= 70 ? 'info' : report.score >= 60 ? 'warning' : 'danger'}>{report.level}</ErpTag>
              <span className="erp-small erp-muted">{report.itemId}</span>
            </div>
          </div>
          <div className="erp-stack" style={{ gap: 12, marginTop: 18 }}>
            {report.dimensions.map((dimension) => (
              <div key={dimension.name}>
                <div className="erp-flex-between" style={{ marginBottom: 4 }}><span className="erp-small">{dimension.name}</span><span className="erp-small erp-muted">{dimension.score}</span></div>
                <div className="erp-progress"><div className="erp-progress__bar" style={{ width: `${dimension.score}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
        <div className="erp-tool-card">
          <h3>问题与建议（{report.issues.length}）</h3>
          <div className="erp-stack">
            {report.issues.map((issue, index) => (
              <div className="erp-issue" key={`${issue.field}-${index}`}>
                <ErpTag tone={issue.level === '严重' ? 'danger' : issue.level === '一般' ? 'warning' : 'info'}>{issue.level}</ErpTag>
                <div className="erp-issue__body">
                  <b>{issue.field}：{issue.issue}</b>
                  <p>建议：{issue.suggestion}</p>
                </div>
                <ErpButton size="mini" onClick={() => erpMessage(`已打开优化：${issue.field}（演示）`)}>去优化</ErpButton>
              </div>
            ))}
          </div>
          <div className="erp-flex" style={{ marginTop: 14 }}>
            <ErpButton variant="primary" onClick={() => erpMessage('已标记全部问题为已优化（演示）')}>一键优化</ErpButton>
            <ErpButton onClick={() => erpMessage('已重新检测（演示）')}>重新检测</ErpButton>
          </div>
        </div>
      </div>
      <div className="erp-card" style={{ padding: 20 }}>
        <div className="erp-flex-between" style={{ marginBottom: 12 }}><b style={{ fontSize: 14 }}>检测记录</b><span className="erp-small erp-muted">共 {history.length} 条</span></div>
        <ListPage
          header={null}
          columns={[
            { key: 'itemId', title: '商品 ID', width: 150, render: (row) => <span className="erp-code">{row.itemId}</span> },
            { key: 'title', title: '商品标题', minWidth: 260 },
            { key: 'score', title: '评分', width: 80, align: 'right', sortable: true },
            { key: 'level', title: '等级', width: 90, render: (row) => <ErpStatusTag status={row.level} /> },
            { key: 'checkedAt', title: '检测时间', width: 160 },
          ]}
          rows={history}
          rowKey={(row) => row.id}
          sortable
          filterKey={report.id}
          rowActions={(row) => [{ label: '查看报告', onClick: () => { setReport(row); erpMessage('已加载报告（演示）'); } }]}
        />
      </div>
      <ExportDialog open={exportOpen} fields={[{ key: 'itemId', label: '商品 ID' }, { key: 'title', label: '商品标题' }, { key: 'score', label: '综合评分' }, { key: 'level', label: '等级' }, { key: 'dimensions', label: '维度得分' }, { key: 'issues', label: '问题与建议' }]} onClose={() => setExportOpen(false)} onConfirm={() => { setExportOpen(false); erpMessage('质量检测报告已生成（演示）'); }} />
    </div>
  );
}
