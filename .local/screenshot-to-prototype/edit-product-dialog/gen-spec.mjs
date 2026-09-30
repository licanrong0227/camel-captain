import fs from 'node:fs';
import path from 'node:path';

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

const ROOT = process.cwd();
const SLUG = 'edit-product-dialog';
const SPEC_DIR = path.join(ROOT, 'src/prototypes', SLUG, '.spec');
const manifest = readJson(path.join(SPEC_DIR, 'reconstruction/reconstruction-manifest.json'));
const firstPass = fs.readFileSync(path.join(SPEC_DIR, 'reconstruction/first-pass.html'), 'utf8');
const template = fs.readFileSync(path.join(ROOT, 'templates/prototype-spec.html'), 'utf8');

const stage = firstPass.match(/<main class="reconstruction-stage"[\s\S]*?<\/main>/)[0]
  .replace('<main class="reconstruction-stage"', '<div class="reconstruction-stage"')
  .replace(/<\/main>$/, '</div>')
  .replaceAll('../../assets/', '../assets/');

const GROUPS = [
  ['背景层（仅遮罩可见部分）', ['bd-page', 'bd-nav', 'bd-content', 'bd-side-tab', 'overlay']],
  ['弹窗容器', ['modal', 'modal-title', 'modal-close']],
  ['左侧商品列表', ['list-panel', 'item-icon-trash', 'item-icon-folder-check', 'list-pager-prev-box', 'list-pager-prev-icon', 'list-pager-next-box', 'list-pager-next-icon']],
  ['左侧商品行（1-10 重复）', ['product-item-', 'product-thumb-', 'product-title-', 'product-status-']],
  ['右侧页签', ['tab-collapse-icon', 'tab-basic', 'tab-divider-1', 'tab-detail', 'tab-divider-2', 'tab-log']],
  ['富文本编辑器容器', ['editor-box', 'editor-toolbar-line']],
  ['编辑器工具栏', ['tb-']],
  ['详情主图', ['detail-poster']],
  ['悬浮滚动按钮', ['float-scroll-up', 'float-scroll-down']],
  ['底部按钮', ['btn-close', 'btn-save']],
];

const byId = new Map(manifest.elements.map((e) => [e.id, e]));
const inGroup = (name, key) => (key.endsWith('-') ? name.startsWith(key) : name === key);

const groupRows = GROUPS.map(([title, keys]) => {
  const items = manifest.elements.filter((e) => keys.some((k) => inGroup(e.id, k)));
  const reps = [...new Set(items.map((e) => `${e.representation} (${e.assetReview.assetAction})`))];
  return `<tr><td data-label="模块">${title}</td><td data-label="元素数">${items.length}</td><td data-label="表示方式">${reps.join('、')}</td></tr>`;
}).join('\n            ');

const appendixRows = manifest.elements.map((e) => {
  const b = e.targetBBox;
  const text = e.textReview ? e.textReview.content.replace(/</g, '&lt;') : '—';
  const asset = e.candidates.find((c) => c.id === e.selectedCandidateId);
  const assetPath = asset?.assetPath ? `<code>${asset.assetPath.split('/').pop()}</code>` : '—';
  return `<tr><td data-label="ID"><code>${e.id}</code></td><td data-label="名称">${e.name}</td><td data-label="位置尺寸">${b.x}, ${b.y} · ${b.width}×${b.height}</td><td data-label="表示">${e.representation}</td><td data-label="素材">${assetPath}</td><td data-label="文字">${text}</td></tr>`;
}).join('\n            ');

const tokens = manifest.elements
  .filter((e) => e.visualStyle?.fontSize)
  .reduce((acc, e) => {
    const key = `${e.visualStyle.fontSize} / ${e.visualStyle.lineHeight || '-'}`;
    acc.set(key, (acc.get(key) || 0) + 1);
    return acc;
  }, new Map());
const typeRows = [...tokens.entries()]
  .sort((a, b) => b[1] - a[1])
  .map(([k, v]) => `<tr><td data-label="字号 / 行高">${k}</td><td data-label="使用元素数">${v}</td></tr>`)
  .join('\n            ');

const body = `
      <article class="spec-page" data-spec-page="overview">
        <h1>编辑产品弹窗 - 主规格</h1>
        <p class="definition">本文档是「认领中心 - 骆驼队长BI」编辑产品弹窗还原方案的事实依据。所有尺寸、颜色、文案均来自源截图逐像素实测，不来自推测。</p>

        <section id="current-plan">
          <h2>当前方案</h2>
          <ul>
            <li><strong>原型意图</strong>：把用户提供的产品截图 1:1 还原成可评审的 HTML 主规格，作为后续 React 原型的唯一事实来源。</li>
            <li><strong>使用场景</strong>：跨境 ERP「认领中心 - 批量认领」和「我的商品 - 批量编辑」两个入口共用的编辑产品弹窗。</li>
            <li><strong>当前表达</strong>：源图 viewport 1912×867 下的静态视觉稿，弹窗处于「详情」页签、第 1 个商品被选中、富文本编辑器内为一张 1000×570 详情主图的状态。</li>
          </ul>
        </section>

        <section id="reconstruction-1to1">
          <h2>1:1 还原视图</h2>
          <p class="hint">下方为脚本按 Manifest 直出的还原结果（渲染阶段模型调用 0 次），已按源图 viewport 保持 1912×867 实际尺寸；容器内可横向滚动查看。</p>
          <div class="stage-wrap">__STAGE__</div>
        </section>

        <section id="facts-inputs">
          <h2>事实与输入</h2>
          <h3>用户确认事实</h3>
          <ul>
            <li>还原范围：<strong>只需要实现截图中的弹窗部分</strong>，背景页面不属于交付范围。</li>
            <li>页面归属：认领中心 - 骆驼队长BI 的「编辑产品」弹窗。</li>
          </ul>
          <h3>参考资料</h3>
          <ul>
            <li>源截图：<code>0b095075-57d9-42a8-ad94-1f007d0eb8ec.png</code>（1912×867，sha256 8e4b461…264625）—— 唯一视觉事实来源。</li>
            <li>样式信息导出：<code>编辑产品弹窗样式.txt</code> —— 用于校验颜色与组件类名，尺寸仍以截图实测为准。</li>
            <li>还原中间产物：<code>src/prototypes/edit-product-dialog/.spec/reconstruction/</code>（Manifest、裁切素材、first-pass.html）。</li>
          </ul>
          <h3>当前假设</h3>
          <ul>
            <li>列表行标题在源图中已是单行截断态，还原时直接采用截断后的文字（含省略号），不还原完整标题。</li>
            <li>富文本工具栏按截图可见项还原，未展开的下拉选项（字号、颜色面板）不在本次范围内。</li>
          </ul>
        </section>

        <section id="prototype-scope">
          <h2>原型范围</h2>
          <h3>本次呈现</h3>
          <ul>
            <li>弹窗容器：1720×780，圆角 8，标题「编辑产品」+ 右上关闭图标。</li>
            <li>左侧商品列表：10 行（缩略图 40×40、标题、编辑状态、行内删除/完成图标），首行为选中态（#fffaf5 底 + #ffb366 描边）；底部翻页按钮 2 个。</li>
            <li>右侧页签：基本 / 详情 / 日志，当前为「详情」（#ff781f），左侧「收起」双箭头图标。</li>
            <li>富文本编辑器：1px #cccccc 边框、45px 工具栏、9 组工具（B / I / U / 字号 / 字色 / 无序 / 有序 / 对齐 / 图片 / 清除格式），正文区为一张 1000×570 详情主图。</li>
            <li>右下角上/下滚动悬浮按钮，底部「关闭」「保存」按钮。</li>
          </ul>
          <h3>本次不呈现</h3>
          <ul>
            <li>背景页面的导航、菜单、表格等真实内容 —— 仅按遮罩下可见的明暗色块做最低限度还原，用于承载 50% 黑色遮罩。</li>
            <li>页签切换后的表单内容、编辑器交互、分页与选择逻辑（还原阶段为静态视觉稿）。</li>
          </ul>
        </section>

        <section id="assets-decisions">
          <h2>素材与文字取舍</h2>
          <div class="table-wrap">
            <table>
              <thead><tr><th>对象</th><th>决定</th><th>理由</th></tr></thead>
              <tbody>
                <tr><td data-label="对象">详情主图 <code>detail-poster.png</code></td><td data-label="决定">复用源图裁切（1000×570）</td><td data-label="理由">照片类位图，重绘必然失真；底部被编辑器容器裁断属源图自身裁切，如实保留</td></tr>
                <tr><td data-label="对象">商品缩略图 ×10 <code>product-thumb-n.png</code></td><td data-label="决定">复用源图裁切（40×40）</td><td data-label="理由">实拍商品图，逐行按 62px 间距从源图裁切</td></tr>
                <tr><td data-label="对象">工具栏 / 页签 / 行内 / 翻页 / 悬浮图标 ×15</td><td data-label="决定">SVG 矢量重建</td><td data-label="理由">单色线性与面性图标，矢量重建比裁切更清晰且可复用</td></tr>
                <tr><td data-label="对象">B / I / U、默认大小、页签、列表文字、底部按钮文字</td><td data-label="决定">HTML 文本 + CSS</td><td data-label="理由">普通界面字体，非艺术字，可编辑可选中</td></tr>
                <tr><td data-label="对象">遮罩、弹窗底、列表选中行、编辑器边框、分隔线</td><td data-label="决定">纯 CSS 盒</td><td data-label="理由">纯色/描边，无位图必要</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="design-basis">
          <h2>设计基底与还原偏差</h2>
          <ul>
            <li>项目默认主题：<code>src/themes/kuacheng-bi/DESIGN.md</code>（Element-UI 体系，主色 #ff781f）。</li>
            <li>继承方式：本任务为截图还原，<strong>以源图实测值为准</strong>；实测值与主题一致（主色 #ff781f、圆角 8、Element 灰阶 #303133 / #606266 / #909399）。</li>
            <li>本原型特有调整：
              <ul>
                <li>背景页面简化为色块，属用户「仅需弹窗」范围要求的有意取舍。</li>
                <li>文字与源图存在 1px 级抗锯齿差异：弹窗区域逐通道平均绝对差 0.80/255，左侧列表区 3.40/255（字体渲染环境差异，非结构问题）。</li>
                <li>列表文字列实测起点 x=172，页签起点 x=369/424/481，均已按实测校正。</li>
              </ul>
            </li>
          </ul>
          <h3>模块与表示方式</h3>
          <div class="table-wrap">
            <table>
              <thead><tr><th>模块</th><th>元素数</th><th>表示方式（representation / assetAction）</th></tr></thead>
              <tbody>
            __GROUPS__
              </tbody>
            </table>
          </div>
          <h3>排版实测汇总</h3>
          <div class="table-wrap">
            <table>
              <thead><tr><th>字号 / 行高</th><th>使用元素数</th></tr></thead>
              <tbody>
            __TYPES__
              </tbody>
            </table>
          </div>
        </section>

        <section id="interaction-states">
          <h2>交互与状态方案（已在 React 原型实现）</h2>
          <p class="hint">下表为 React 原型 <code>src/prototypes/edit-product-dialog/index.tsx</code> 已实现并验证过的交互口径。</p>
          <div class="table-wrap">
            <table>
              <thead><tr><th>对象/场景</th><th>前置状态</th><th>用户操作</th><th>原型表现</th><th>后续状态</th></tr></thead>
              <tbody>
                <tr><td data-label="对象/场景">商品列表行</td><td data-label="前置状态">第 1 行选中</td><td data-label="用户操作">点击另一行</td><td data-label="原型表现">选中态转移，行内操作图标随选中显示</td><td data-label="后续状态">目标行选中</td></tr>
                <tr><td data-label="对象/场景">行内「标记已编辑」</td><td data-label="前置状态">某行未编辑</td><td data-label="用户操作">点击文件夹图标</td><td data-label="原型表现">该行状态在「未编辑 / 已编辑」间切换</td><td data-label="后续状态">状态更新，行数不变</td></tr>
                <tr><td data-label="对象/场景">行内「删除」</td><td data-label="前置状态">列表 10 行</td><td data-label="用户操作">点击垃圾桶图标</td><td data-label="原型表现">该行移除，选中行回落到第 1 行</td><td data-label="后续状态">列表减少一行</td></tr>
                <tr><td data-label="对象/场景">页签</td><td data-label="前置状态">详情</td><td data-label="用户操作">点击 基本 / 日志</td><td data-label="原型表现">切换到占位面板（源图未提供这两个页签内容）</td><td data-label="后续状态">目标页签激活</td></tr>
                <tr><td data-label="对象/场景">收起列表</td><td data-label="前置状态">列表展开</td><td data-label="用户操作">点击双箭头</td><td data-label="原型表现">左侧列表 0.2s 收起，编辑区左移占满，箭头翻转</td><td data-label="后续状态">列表收起，再点恢复</td></tr>
                <tr><td data-label="对象/场景">工具栏按钮</td><td data-label="前置状态">「图片」为激活态</td><td data-label="用户操作">点击任一按钮</td><td data-label="原型表现">在激活/未激活之间切换（普通按钮灰底，图片按钮图标置灰）</td><td data-label="后续状态">仅视觉态，不改动详情内容</td></tr>
                <tr><td data-label="对象/场景">浮动上下按钮</td><td data-label="前置状态">详情长图可滚动 74px</td><td data-label="用户操作">点击上 / 下</td><td data-label="原型表现">编辑区平滑滚动 240px 并被钳制在边界</td><td data-label="后续状态">滚动位置变化</td></tr>
                <tr><td data-label="对象/场景">分页器</td><td data-label="前置状态">第 1 页（共 10 条）</td><td data-label="用户操作">点击上一页 / 下一页</td><td data-label="原型表现">上一页禁用置灰；下一页按源图保留蓝色可点态，但无后续数据，点击不改变列表</td><td data-label="后续状态">页码保持 1</td></tr>
                <tr><td data-label="对象/场景">关闭 / 保存</td><td data-label="前置状态">弹窗打开</td><td data-label="用户操作">点击按钮或右上角 ×</td><td data-label="原型表现">弹窗关闭，显示「重新打开」入口；重开后保留已做的选中与状态改动</td><td data-label="后续状态">弹窗关闭 / 重新打开</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="implementation-parity">
          <h2>React 实现与源图像素复核</h2>
          <p class="hint">React 原型按 1912×867 视口截图与源图逐块复核，弹窗区域平均色差 <strong>0.864 / 255</strong>（HTML 主规格为 0.802）。复核中修正了主规格元素表未覆盖的偏移，React 以修正后的值为准。</p>
          <div class="table-wrap">
            <table>
              <thead><tr><th>位置</th><th>主规格元素表</th><th>React 实测修正</th><th>原因</th></tr></thead>
              <tbody>
                <tr><td data-label="位置">页签组</td><td data-label="主规格元素表">双箭头与页签间距 9px</td><td data-label="React 实测修正">间距 12px，整组右移 3px</td><td data-label="原因">源图「基本」墨迹左沿在 372，绝对定位盒与流式排布的左衬不同</td></tr>
                <tr><td data-label="位置">商品列表行</td><td data-label="主规格元素表">行内边距 9px</td><td data-label="React 实测修正">内边距 8px（含 1px 透明边框）</td><td data-label="原因">边框计入内容起点，缩略图与标题整体下移 1px</td></tr>
                <tr><td data-label="位置">详情编辑区</td><td data-label="主规格元素表">内容内边距 13 / 16</td><td data-label="React 实测修正">12 / 15</td><td data-label="原因">工具栏 1px 下边框计入流高度，长图整体下移 1px</td></tr>
                <tr><td data-label="位置">工具栏</td><td data-label="主规格元素表">左内边距 10，文本按钮宽 26</td><td data-label="React 实测修正">左内边距 8，文本按钮宽 28、衬线 16px，字号按钮宽 64</td><td data-label="原因">源图 B/I/U 为衬线字形，字距 28；无衬线 14px 偏窄</td></tr>
                <tr><td data-label="位置">分页器禁用态</td><td data-label="主规格元素表">—</td><td data-label="React 实测修正">去掉整块半透明，改用灰底 + 浅灰箭头</td><td data-label="原因">源图禁用按钮仍有 #f5f7fa 底色，opacity 会连底色一起淡出</td></tr>
                <tr><td data-label="位置">右上角关闭</td><td data-label="主规格元素表">图标 20px</td><td data-label="React 实测修正">图标 14px、描边 1.8</td><td data-label="原因">源图 × 墨迹为 9×10</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="open-questions">
          <h2>当前待确认事项</h2>
          <ul>
            <li>React 原型已按「仅需弹窗」实现：背景仅为半透明遮罩，未还原认领中心页面。若需要页面级上下文，需另行确认范围。</li>
            <li>详情长图当前按源图内容裁切并允许在编辑区内滚动（可滚 74px）；是否需要还原成完整不裁切的长图排版待确认。</li>
            <li>「基本」「日志」两个页签在源图中未出现，原型用占位面板表达，内容需产品补充。</li>
            <li>分页器按源图状态呈现：上一页禁用、下一页保留蓝色可点态，但演示数据只有 1 页 10 条，点击不产生翻页效果。</li>
          </ul>
        </section>

        <section id="element-appendix">
          <h2>元素清单（还原 Manifest 全量）</h2>
          <p class="hint">共 __COUNT__ 个元素，坐标为源图 viewport 绝对像素，供 React 实现与后续比对使用；React 实现阶段复核出的偏移见「React 实现与源图像素复核」。</p>
          <div class="table-wrap">
            <table>
              <thead><tr><th>ID</th><th>名称</th><th>位置 · 尺寸</th><th>表示</th><th>素材</th><th>文字</th></tr></thead>
              <tbody>
            __APPENDIX__
              </tbody>
            </table>
          </div>
        </section>

        <section id="decision-history">
          <h2>用户重要决策与变更</h2>
          <div class="table-wrap">
            <table>
              <thead><tr><th>日期</th><th>用户决策或变更</th><th>对当前原型的影响</th></tr></thead>
              <tbody>
                <tr><td data-label="日期">2026-09-28</td><td data-label="用户决策或变更">要求精准还原编辑产品弹窗，范围限定为「只需要实现截图中的弹窗部分」</td><td data-label="对当前原型的影响">背景页面降级为遮罩底色，还原精度集中在弹窗 79 个元素</td></tr>
                <tr><td data-label="日期">2026-09-28</td><td data-label="用户决策或变更">质疑「怎么只生成规格，没有可运行页面」，要求交付可运行原型</td><td data-label="对当前原型的影响">视为放行确认，进入 React 实现阶段，新增 <code>src/prototypes/edit-product-dialog/index.tsx</code> 与 <code>style.css</code></td></tr>
              </tbody>
            </table>
          </div>
        </section>
      </article>
`;

const stageStyle = `
    .stage-wrap {
      margin-top: 16px;
      overflow-x: auto;
      border: 1px solid var(--brand-border);
      border-radius: 8px;
      background: #fff;
    }
    .stage-wrap .reconstruction-stage {
      position: relative;
      overflow: hidden;
      width: 1912px;
      height: 867px;
      background: #fff;
    }
    .stage-wrap img { display: block; }
`;

const nav = `        <button type="button" data-page-target="overview" aria-current="page">编辑产品弹窗主规格</button>`;

const out = template
  .replace(/      <article class="spec-page" data-spec-page="overview">[\s\S]*?<\/article>\n\n      <!--[\s\S]*?<\/article>\n/, `${body}\n`)
  .replace(/        <button type="button" data-page-target="overview"[\s\S]*?<\/nav>/, `${nav}\n      </nav>`)
  .replace('<title>规格文档 HTML 模板</title>', '<title>编辑产品弹窗 - 主规格</title>')
  .replace('    .spec-page[hidden] { display: none; }', `    .spec-page[hidden] { display: none; }\n${stageStyle}`)
  .replace('__STAGE__', stage)
  .replace('__GROUPS__', groupRows)
  .replace('__TYPES__', typeRows)
  .replace('__APPENDIX__', appendixRows)
  .replace('__COUNT__', String(manifest.elements.length));

if (out.includes('__STAGE__') || out.includes('扩展页面一') || out.includes('规格文档 HTML 模板')) {
  throw new Error('spec.html 模板替换未完成');
}

fs.mkdirSync(SPEC_DIR, { recursive: true });
fs.writeFileSync(path.join(SPEC_DIR, 'spec.html'), out);
console.log(JSON.stringify({ output: path.join(SPEC_DIR, 'spec.html'), elements: manifest.elements.length, bytes: out.length }));
