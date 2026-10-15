import fs from 'node:fs';

const firstPass = fs.readFileSync('src/prototypes/update-publish-dialog/.spec/reconstruction/first-pass.html', 'utf8');
const stageInner = firstPass.split('<main class="reconstruction-stage" data-renderer="reconstruction-review-v1" data-model-calls-during-render="0">')[1].split('</main>')[0].trim();
const manifest = JSON.parse(fs.readFileSync('src/prototypes/update-publish-dialog/.spec/reconstruction/reconstruction-manifest.json', 'utf8'));

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const rows = manifest.elements.map((e) => {
  const b = e.targetBBox;
  const text = e.textReview ? `${esc(e.textReview.content)}（${e.textReview.textRole} / ${e.textReview.renderMode}）` : '—';
  const style = Object.entries(e.visualStyle || {}).map(([k, v]) => `${k}: ${typeof v === 'number' && !['fontWeight', 'opacity', 'zIndex'].includes(k) ? v + 'px' : v}`).join('；') || '—';
  return `                <tr><td data-label="元素 ID"><code>${esc(e.id)}</code></td><td data-label="名称">${esc(e.name)}</td><td data-label="bbox">${b.x}, ${b.y}, ${b.width}×${b.height}</td><td data-label="表示方式">${esc(e.representation)}</td><td data-label="文字">${text}</td><td data-label="素材审核">${esc(e.assetReview.assetAction)} / ${esc(e.assetReview.status)}</td><td data-label="关键样式">${style}</td></tr>`;
}).join('\n');

const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>更新发布弹窗 - 主规格</title>
  <style>
    :root {
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      --brand: #008f5d;
      --brand-ink: #007a50;
      --brand-soft: #e6f5ef;
      --brand-surface: #f2faf7;
      --brand-border: #b7ddcf;
      --text: #222832;
      --text-secondary: #4b5565;
      --text-muted: #6f7888;
      --text-placeholder: #8b94a3;
      color: var(--text);
      background: #f5f7fb;
      scrollbar-gutter: stable;
    }
    * { box-sizing: border-box; }
    body { margin: 0; padding: 32px 20px 64px; }
    main { width: min(1200px, 100%); margin: 0 auto; padding: 40px; border: 1px solid #dfe4ee; border-radius: 8px; background: #fff; box-shadow: 0 4px 16px rgb(30 45 75 / 6%); }
    h1 { margin: 0; font-size: 32px; line-height: 1.3; }
    h2 { margin: 44px 0 20px; padding-bottom: 8px; border-bottom: 1px solid #e7eaf0; font-size: 21px; line-height: 1.55; }
    h3 { margin: 28px 0 12px; font-size: 17px; line-height: 1.5; }
    p, li { font-size: 15px; line-height: 2; }
    p { margin: 20px 0; }
    td, th { font-size: 14px; line-height: 1.65; }
    .definition { margin: 16px 0 0; padding: 14px 16px; border-left: 3px solid var(--brand); color: var(--text-secondary); background: var(--brand-surface); }
    .hint { color: var(--text-muted); }
    ul { margin: 10px 0 20px; padding-left: 22px; }
    table { width: 100%; margin-top: 14px; border-collapse: collapse; }
    th, td { min-width: 90px; padding: 10px 12px; border: 1px solid #dfe4ee; text-align: left; vertical-align: top; }
    th { background: #f6f8fb; }
    code { padding: 2px 5px; border-radius: 5px; background: #eef1f6; }
    .table-wrap { overflow-x: auto; }
    .stage-wrap { margin-top: 16px; overflow-x: auto; border: 1px solid var(--brand-border); border-radius: 8px; background: #fff; }
    .stage-wrap .reconstruction-stage { position: relative; overflow: hidden; width: 733px; height: 345px; background: #fff; }
    .stage-wrap img { display: block; }
    button { font: inherit; }
  </style>
</head>
<body>
  <main>
    <h1>更新发布弹窗 · 主规格</h1>
    <p class="definition">本文档是「更新发布弹窗」截图还原方案的事实依据。所有尺寸、颜色、文案均来自源截图逐像素实测（两轮素材召回 + 像素探测），不来自推测。</p>

    <section id="current-plan">
      <h2>当前方案</h2>
      <ul>
        <li><strong>原型意图</strong>：把用户提供的「更新发布」弹窗截图 1:1 还原成可评审的 HTML 主规格，作为后续 React 原型的唯一事实来源。</li>
        <li><strong>使用场景</strong>：ERP 商品更新发布确认弹窗，含自动刊登选项（立即/定时发布）与失败自动刊登（循环次数）设置。</li>
        <li><strong>当前表达</strong>：源图 viewport 733×345，弹窗白色圆角面板置于灰色底之上；全部控件为 Element UI 风格，标准控件与文字均以 HTML/CSS 表达，无位图素材。</li>
      </ul>
    </section>

    <section id="review-stage">
      <h2>1:1 还原视图</h2>
      <p class="hint">下方为脚本按 Manifest 直出的还原结果（渲染阶段模型调用 0 次），已按源图 viewport 保持 733×345 实际尺寸；已经过 AI 评审迭代（文字基线修正、单选选中态修正、关闭符号尺寸修正）。</p>
      <div class="stage-wrap"><div class="reconstruction-stage" data-renderer="reconstruction-review-v1" data-model-calls-during-render="0">
${stageInner}
      </div></div>
    </section>

    <section id="facts-inputs">
      <h2>事实与输入</h2>
      <h3>用户确认事实</h3>
      <ul>
        <li>原型命名为：<strong>更新发布弹窗</strong>。</li>
        <li>还原范围：仅弹窗本体；背景页面不属于交付范围（按项目惯例以灰色底承载）。</li>
      </ul>
      <h3>参考资料</h3>
      <ul>
        <li>源截图：<code>C:\\Users\\admin\\.qoder-cn\\tmp\\D--projects-CAMEL-CAPTAIN\\images\\44036eb2-054a-4ca2-a940-4ca6fb7bc4aa\\03596652-d0ef-41e0-a7dd-4d47bb78ae0a.png</code>（733×345）。</li>
        <li>还原中间产物：<code>src/prototypes/update-publish-dialog/.spec/reconstruction/</code>（Manifest、first-pass.html）。</li>
      </ul>
      <h3>当前假设</h3>
      <ul>
        <li>右上角「×」为关闭按钮；「循环次数」输入框呈禁用态（浅灰底、灰色数值），与截图中未勾选「失败自动刊登」联动。</li>
        <li>「立即发布 / 定时发布」单选仅在勾选「自动刊登」时有意义。</li>
      </ul>
    </section>

    <section id="prototype-scope">
      <h2>原型范围</h2>
      <h3>本次呈现</h3>
      <ul>
        <li>弹窗静态视觉：标题、关闭、自动刊登复选框、立即/定时发布单选、取消/确定按钮、失败自动刊登复选框、循环次数禁用输入框。</li>
      </ul>
      <h3>本次不呈现</h3>
      <ul>
        <li>背景页面真实内容（仅灰色底）。</li>
        <li>定时发布的日期时间选择面板、发布请求与结果反馈等业务逻辑。</li>
      </ul>
    </section>

    <section id="pages-content">
      <h2>页面与内容方案</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>页面/视图</th><th>页面作用</th><th>主要模块与内容</th><th>示例数据或素材</th><th>与其他页面的关系</th></tr></thead>
          <tbody><tr>
            <td data-label="页面/视图">更新发布弹窗</td>
            <td data-label="页面作用">确认商品更新后的发布方式</td>
            <td data-label="主要模块与内容">标题栏（更新发布 + 关闭）；自动刊登复选框与立即/定时发布单选；底部操作区（取消、确定、失败自动刊登、循环次数）</td>
            <td data-label="示例数据或素材">自动刊登=勾选；发布方式=立即发布；循环次数=1（禁用）；失败自动刊登=未勾选</td>
            <td data-label="与其他页面的关系">独立弹窗原型，灰色底承载，不依赖宿主页面</td>
          </tr></tbody>
        </table>
      </div>
    </section>

    <section id="interaction-states">
      <h2>交互与状态方案</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>对象/场景</th><th>前置状态</th><th>用户操作</th><th>原型表现</th><th>后续状态</th></tr></thead>
          <tbody>
            <tr><td data-label="对象/场景">还原阶段</td><td data-label="前置状态">静态视觉稿</td><td data-label="用户操作">—</td><td data-label="原型表现">仅呈现截图默认状态</td><td data-label="后续状态">交互细节待用户确认</td></tr>
          </tbody>
        </table>
      </div>
      <p class="hint">React 实现阶段的候选交互（待确认）：复选框/单选可切换；勾选「失败自动刊登」后循环次数输入框启用；取消/关闭可关闭弹窗。</p>
    </section>

    <section id="design-basis">
      <h2>设计基底与还原偏差</h2>
      <ul>
        <li>采用的设计基底：项目主题 <code>camel-captain-erp</code>（ERP 橙色系）。</li>
        <li>继承方式：本任务为截图还原，<strong>以源图实测值为准</strong>；实测主蓝 <code>#1890ff</code>、主橙 <code>#ff781f</code>、灰阶 <code>#303133 / #606266 / #909399 / #c0c4cc</code>、边框 <code>#dcdfe6 / #dfe4ed</code>。</li>
        <li>已知轻量偏差：步进器上下箭头以「∧/∨」符号近似（源图为 1px 细线箭头）；文字渲染依赖系统字体，与原图存在亚像素级抗锯齿差异。</li>
      </ul>
    </section>

    <section id="element-inventory">
      <h2>元素清单（还原 Manifest 全量）</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>元素 ID</th><th>名称</th><th>bbox（x, y, w×h）</th><th>表示方式</th><th>文字</th><th>素材审核</th><th>关键样式</th></tr></thead>
          <tbody>
${rows}
          </tbody>
        </table>
      </div>
    </section>

    <section id="open-questions">
      <h2>当前待确认事项</h2>
      <ul>
        <li>React 实现时是否需要上述候选交互（控件可点、输入框启用联动、关闭弹窗）。</li>
        <li>步进器箭头是否接受符号近似，或需要 SVG 精确重绘。</li>
      </ul>
    </section>

    <section id="decision-history">
      <h2>用户重要决策与变更</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>日期</th><th>用户决策或变更</th><th>对当前原型的影响</th></tr></thead>
          <tbody>
            <tr><td data-label="日期">2026-10-15</td><td data-label="用户决策或变更">提供截图，要求复刻弹窗并命名为「更新发布弹窗」</td><td data-label="对当前原型的影响">新建独立原型 update-publish-dialog，范围限定弹窗本体</td></tr>
          </tbody>
        </table>
      </div>
    </section>
  </main>
</body>
</html>
`;
fs.mkdirSync('src/prototypes/update-publish-dialog/.spec', { recursive: true });
fs.writeFileSync('src/prototypes/update-publish-dialog/.spec/spec.html', html);
console.log('spec.html written, elements:', manifest.elements.length);
