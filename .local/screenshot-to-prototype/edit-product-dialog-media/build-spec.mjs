import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = 'D:/projects/CAMEL CAPTAIN';
const SLUG = 'edit-product-dialog-media';
const LOCAL = path.join(ROOT, '.local/screenshot-to-prototype', SLUG);
const SPEC_DIR = path.join(ROOT, 'src/prototypes', SLUG, '.spec');
const RECON = path.join(SPEC_DIR, 'reconstruction');
const SRC = 'C:/Users/admin/.qoder-cn/tmp/D--projects-CAMEL-CAPTAIN/images/6710385f-0d10-4e9a-9c2a-5e8a599ccb70/02635610-e965-4299-aa2d-a6705a13054c.png';

execFileSync(process.execPath, [
  path.join(ROOT, '.agents/skills/screenshot-to-prototype/scripts/render-reconstruction-review.mjs'),
  '--manifest', path.join(RECON, 'reconstruction-manifest.json'),
  '--output', path.join(RECON, 'first-pass.html'),
  '--source', SRC,
], { stdio: ['ignore', 'ignore', 'inherit'] });

const stage = fs.readFileSync(path.join(RECON, 'first-pass.html'), 'utf8');
const body = stage.match(/<main class="reconstruction-stage"[\s\S]*?<\/main>/u)[0]
  .replace(/src="\.\.\/\.\.\/assets/gu, 'src="../assets');

const docCss = fs.readFileSync(path.join(ROOT, 'src/prototypes/my-products-bi/.spec/spec.html'), 'utf8');
const shellCss = docCss.slice(docCss.indexOf('  <style>') + 2, docCss.indexOf('</style><style>') + 9);

const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>编辑产品弹窗（视频/主图/站外推广图） - 主规格</title>
${shellCss}<style>
*{box-sizing:border-box}body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif}button{margin:0;padding:0;border:0;font:inherit}.reconstruction-stage{position:relative;overflow:hidden;width:1912px;height:867px;background:#fff}img{display:block}
.stage-scroll{overflow-x:auto;margin-top:16px}
.reconstruction-stage{width:1912px;height:867px;background:#7f7f7f}
main.reconstruction-stage{margin:0}</style>
</head>
<body>
  <div class="shell">
    <aside class="sidebar">
      <p class="sidebar-title">目录</p>
      <nav class="page-nav" aria-label="规格文档页面">
        <button type="button" data-page-target="overview" aria-current="page">当前方案</button>
        <button type="button" data-page-target="visual-1to1">1:1 视觉主规格</button>
      </nav>
    </aside>

    <main>
      <article class="spec-page" data-spec-page="overview">
        <h1>编辑产品弹窗（视频/主图/站外推广图） · 截图还原主规格</h1>
        <p class="definition">本文档是用户与 Agent 围绕当前原型进行方案沟通、确认和持续生成的事实依据。只维护当前有效方案，并简短记录会影响当前原型的重要用户决策和变更。</p>

        <section id="current-plan">
          <h2>当前方案</h2>
          <ul>
            <li>原型意图：按源截图 1:1 精准还原「我的商品 - 骆驼队长BI」页面上「编辑产品」弹窗在滚动到 视频 / 主图 / 站外推广图 区域时的视觉状态，供评审与后续 React 原型实现使用。</li>
            <li>使用场景：ERP 运营人员在编辑产品弹窗中维护视频、主图与站外推广图。</li>
            <li>当前表达：1912×867 viewport 下的静态高保真还原；仅还原弹窗本体，弹窗外一律以灰色遮罩（#7f7f7f）表达，不还原背景页面内容；无交互。</li>
          </ul>
        </section>

        <section id="facts-inputs">
          <h2>事实与输入</h2>
          <h3>用户确认事实</h3>
          <ul>
            <li>还原目标：「编辑产品」弹窗（截图所示滚动位置），只要弹窗样式与截图内容，弹窗外无需实现，只要样式无需交互。</li>
            <li>落点决策：新建独立原型 <code>edit-product-dialog-media</code>，不改动既有 <code>edit-product-dialog</code> 原型。</li>
            <li>样式信息文件：<code>D:\\Users\\admin\\Downloads\\编辑产品弹窗样式.txt</code>（cssVariables、typography、colors 设计基底）。</li>
          </ul>
          <h3>参考资料</h3>
          <ul>
            <li>源截图：1912×867 PNG（sha256 202abc18…953e），弹窗区域唯一视觉事实来源。</li>
            <li>素材裁片：16 张（10 商品缩略图、5 主图照片、1 站外推广图），位于 <code>src/prototypes/edit-product-dialog-media/assets/</code>；24 个 SVG 图标位于 <code>assets/icons/</code>。</li>
          </ul>
          <h3>当前假设</h3>
          <ul>
            <li>弹窗内容区处于滚动中间态：「视频」区块标题被裁切，仅保留顶部 2px 残片；上方区块不完整可见属截图事实，不补全。</li>
            <li>页面为静态还原，数据为截图中的示例数据。</li>
          </ul>
        </section>

        <section id="prototype-scope">
          <h2>原型范围</h2>
          <h3>本次呈现</h3>
          <ul>
            <li>弹窗骨架：标题「编辑产品」、右上关闭钮、1720×780 圆角容器与投影。</li>
            <li>左侧商品列表：10 行（缩略图 + 标题 + 未编辑状态；首行选中态含橙色描边卡片、删除/邮件图标）、底部翻页钮。</li>
            <li>中部区块菜单：« 收起、基本/详情/日志页签、15 项区块菜单（「视频」选中：橙色 + 右侧指示条）。</li>
            <li>右侧内容区：视频区块（裁切标题、视频名称/描述输入框 + 计数、上传视频虚线框）、主图区块（5/8、批量美图/下载图片、上传虚线格、5 张带分辨率角标的照片）、站外推广图区块（1/1、批量美图、1 张照片）。</li>
            <li>底部按钮：关闭 / 保存 / 保存并发布。</li>
          </ul>
          <h3>本次不呈现</h3>
          <ul>
            <li>弹窗外的页面内容（顶栏、筛选区、表格等），仅以灰色遮罩表达。</li>
            <li>任何真实交互（上传、切换区块、翻页、弹窗滚动）与后端数据。</li>
          </ul>
        </section>

        <section id="pages-content">
          <h2>页面与内容方案</h2>
          <div class="table-wrap">
            <table>
              <thead><tr><th>页面/视图</th><th>页面作用</th><th>主要模块与内容</th><th>示例数据或素材</th><th>与其他页面的关系</th></tr></thead>
              <tbody><tr>
                <td data-label="页面/视图">编辑产品弹窗（视频/主图/站外推广图）</td>
                <td data-label="页面作用">商品编辑弹窗滚动至媒体维护区域</td>
                <td data-label="主要模块与内容">商品列表 / 区块菜单 / 视频表单 / 主图列表 / 站外推广图 / 底部按钮</td>
                <td data-label="示例数据或素材">截图内 10 条商品、5 张主图、1 张推广图；assets/ 16 裁片 + 24 SVG</td>
                <td data-label="与其他页面的关系">独立单页，无跳转</td>
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
                <tr><td data-label="对象/场景">商品列表首行</td><td data-label="前置状态">当前编辑对象</td><td data-label="用户操作">—</td><td data-label="原型表现">#ffb366 描边 + #fffaf5 底卡片，行内显示删除/邮件图标</td><td data-label="后续状态">静态展示</td></tr>
                <tr><td data-label="对象/场景">区块菜单「视频」</td><td data-label="前置状态">内容区滚动至视频区块</td><td data-label="用户操作">—</td><td data-label="原型表现">橙色文字 + 橙色摄像机图标 + 右缘 4×40 指示条</td><td data-label="后续状态">静态展示</td></tr>
                <tr><td data-label="对象/场景">主图/推广图照片</td><td data-label="前置状态">已上传素材</td><td data-label="用户操作">—</td><td data-label="原型表现">照片底部叠加半透明分辨率角标（1200*1600 / 600*800）</td><td data-label="后续状态">静态展示</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="design-basis">
          <h2>设计基底与原型特有调整</h2>
          <ul>
            <li>采用的设计基底：<code>编辑产品弹窗样式.txt</code> 的 cssVariables（primary #ff781f、文字 #303133/#606266/#909399/#c0c4cc、边框 #dcdfe6/#ebeef5、danger #ff4949、按钮圆角 8px）。</li>
            <li>继承方式：以截图实测像素为准，样式文件作为 token 参照。</li>
            <li>实测与样式文件的偏差（保留截图事实）：批量美图/下载图片按钮圆角实测 4px（非 8px）；翻页「下一页」描边为蓝色 #409eff（线上遗留样式）；邮件图标为绿色 #67c23a 系。</li>
          </ul>
        </section>

        <section id="asset-decisions">
          <h2>素材取舍</h2>
          <div class="table-wrap">
            <table>
              <thead><tr><th>素材</th><th>路线</th><th>决策理由</th></tr></thead>
              <tbody>
                <tr><td data-label="素材">10 商品缩略图、5 主图照片、1 站外推广图</td><td data-label="路线">clean-crop 直接复用（reuse，自原图裁切）</td><td data-label="决策理由">照片类素材无法 CSS 复刻，裁片目检干净、无需去底或再生成</td></tr>
                <tr><td data-label="素材">关闭/收起/删除/邮件/翻页/摄像机/云上传/15 个菜单图标</td><td data-label="路线">SVG 矢量复刻</td><td data-label="决策理由">规则线性图标，可无损缩放</td></tr>
                <tr><td data-label="素材">全部界面文字（含被裁切的「视频」标题残片）</td><td data-label="路线">HTML 文本渲染 + overflow 裁切</td><td data-label="决策理由">普通 UI 字体即可匹配，无艺术字；残片用 2px 高容器裁切还原</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="open-questions">
          <h2>当前待确认事项</h2>
          <ul>
            <li>云上传图标按线性复刻（原图为面性小图标，1:1 尺寸下差异极小），是否接受？</li>
            <li>商品标题省略号断词位置与截图存在 1–2 字符差异（字体度量所致），是否接受？</li>
          </ul>
        </section>

        <section id="decision-history">
          <h2>用户重要决策与变更</h2>
          <div class="table-wrap">
            <table>
              <thead><tr><th>日期</th><th>用户决策或变更</th><th>对当前原型的影响</th></tr></thead>
              <tbody>
                <tr><td data-label="日期">2026-10-13</td><td data-label="用户决策或变更">要求精准还原弹窗样式；确认落点为新建独立原型</td><td data-label="对当前原型的影响">创建 <code>edit-product-dialog-media</code>，弹窗外仅灰遮罩，无交互</td></tr>
              </tbody>
            </table>
          </div>
        </section>
      </article>

      <article class="spec-page" data-spec-page="visual-1to1" hidden>
        <h1>1:1 视觉主规格</h1>
        <p class="hint">以下舞台保持源截图 viewport（1912×867，deviceScaleFactor 1）下的 1:1 尺寸；窄屏时横向滚动查看。</p>
        <div class="stage-scroll">
          ${body}
        </div>
      </article>
    </main>
  </div>

  <script>
    const navItems = [...document.querySelectorAll('[data-page-target]')];
    const pages = [...document.querySelectorAll('[data-spec-page]')];

    const showPage = (pageId) => {
      for (const navItem of navItems) {
        const isCurrent = navItem.dataset.pageTarget === pageId;
        if (isCurrent) {
          navItem.setAttribute('aria-current', 'page');
        } else {
          navItem.removeAttribute('aria-current');
        }
      }

      for (const page of pages) {
        page.hidden = page.dataset.specPage !== pageId;
      }
    };

    for (const navItem of navItems) {
      navItem.addEventListener('click', () => showPage(navItem.dataset.pageTarget));
    }
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(SPEC_DIR, 'spec.html'), `${html}\n`);
console.log('spec.html written:', path.join(SPEC_DIR, 'spec.html').length, 'bytes html');
