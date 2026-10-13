import fs from 'node:fs';

const ROOT = 'D:/projects/CAMEL CAPTAIN';
const template = fs.readFileSync(`${ROOT}/templates/prototype-spec.html`, 'utf8');
const firstPass = fs.readFileSync(`${ROOT}/src/prototypes/my-products-bi/.spec/reconstruction/first-pass.html`, 'utf8');

const docStyle = template.slice(template.indexOf('<style>'), template.indexOf('</style>') + 8);
const stageCss = firstPass.match(/<style>([\s\S]*?)<\/style>/)[1]
  .replace('html,body{margin:0;min-height:100%;background:#eef1f5;', 'body{margin:0;');
const stageMain = firstPass.match(/<main class="reconstruction-stage"[\s\S]*<\/main>/)[0]
  .replaceAll('../../assets/', '../assets/');

const body = `
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
        <h1>我的商品 - 骆驼队长BI · 截图还原主规格</h1>
        <p class="definition">本文档是用户与 Agent 围绕当前原型进行方案沟通、确认和持续生成的事实依据。只维护当前有效方案，并简短记录会影响当前原型的重要用户决策和变更。</p>

        <section id="current-plan">
          <h2>当前方案</h2>
          <ul>
            <li>原型意图：按源截图 1:1 精准还原「骆驼队长 智慧运营中台（公测版）」的「商品 / 商品管理 / 我的商品」页面（循环刊登 Tab），供评审与后续 React 原型实现使用。</li>
            <li>使用场景：ERP 运营人员查看已认领商品的刊登状态、审核结果与快捷操作。</li>
            <li>当前表达：1912×867 viewport 下的静态高保真还原；顶栏、面包屑、页签、两行筛选区、左侧统计栏、商品表格（5 行 + 1 行截断）、分页与右侧浮标全部按实测像素定位。</li>
          </ul>
        </section>

        <section id="facts-inputs">
          <h2>事实与输入</h2>
          <h3>用户确认事实</h3>
          <ul>
            <li>还原目标页面名称：「我的商品 - 骆驼队长BI」。</li>
            <li>样式信息文件：<code>D:\\Users\\admin\\Downloads\\商品循环刊登样式.txt</code>（cssVariables、typography、colors 设计基底）。</li>
          </ul>
          <h3>参考资料</h3>
          <ul>
            <li>源截图：1912×867 PNG（sha256 6ce02782…c4ac），页面唯一视觉事实来源。</li>
            <li>素材裁片：9 张（品牌徽标、4 张商品缩略图、4 张 DH 货源角标），位于 <code>src/prototypes/my-products-bi/assets/</code>。</li>
          </ul>
          <h3>当前假设</h3>
          <ul>
            <li>表格第 5 行在截图中被视口底部裁切，按可见部分还原，不补全整行。</li>
            <li>页面为静态还原，数据为截图中的示例数据。</li>
          </ul>
        </section>

        <section id="prototype-scope">
          <h2>原型范围</h2>
          <h3>本次呈现</h3>
          <ul>
            <li>顶栏（品牌、导航、右侧工具区）、面包屑、「我的商品」选中页签。</li>
            <li>筛选区两行：采集源/关键词/价格区间/采集平台/刊登时间/认领时间；修改时间/标签/店铺/搜索/重置/创建新产品/排序/导出/导入货源/同步线上/设置。</li>
            <li>左侧商品统计栏（商品概览、发布管理、销售状态、审核与风险；「循环刊登 8」选中态）。</li>
            <li>商品表格：表头、5 行数据（含待审核/审核未通过/发布失败胶囊、DH 角标、错误提示框、行操作按钮）、分页「共 8 条 · 10条/页 · 第 1 页」。</li>
            <li>右侧「联系我们」浮标与上/下滚动圆钮。</li>
          </ul>
          <h3>本次不呈现</h3>
          <ul>
            <li>任何真实交互（查询、分页、弹窗、下拉展开）与后端数据。</li>
            <li>「商品采集」「认领中心」页签内容与其他导航页面。</li>
          </ul>
        </section>

        <section id="pages-content">
          <h2>页面与内容方案</h2>
          <div class="table-wrap">
            <table>
              <thead><tr><th>页面/视图</th><th>页面作用</th><th>主要模块与内容</th><th>示例数据或素材</th><th>与其他页面的关系</th></tr></thead>
              <tbody><tr>
                <td data-label="页面/视图">我的商品（循环刊登）</td>
                <td data-label="页面作用">商品认领后的刊登管理列表</td>
                <td data-label="主要模块与内容">顶栏 / 面包屑 / 页签 / 筛选区 / 统计侧栏 / 商品表格 / 分页 / 浮标</td>
                <td data-label="示例数据或素材">截图内 5 条商品数据；assets/ 下 9 张裁片 + 15 个 SVG 图标</td>
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
                <tr><td data-label="对象/场景">行 1（待审核）</td><td data-label="前置状态">已刊登待平台审核</td><td data-label="用户操作">—</td><td data-label="原型表现">蓝色描边「待审核」胶囊 + 行操作按钮组（编辑/更新发布/标签/删除/AI一键克隆）</td><td data-label="后续状态">静态展示</td></tr>
                <tr><td data-label="对象/场景">行 3、4（发布失败）</td><td data-label="前置状态">刊登校验不通过</td><td data-label="用户操作">—</td><td data-label="原型表现">红色「发布失败」胶囊 + 商品信息下方红色错误提示框（首图重复 / 腰型属性缺失）</td><td data-label="后续状态">静态展示</td></tr>
                <tr><td data-label="对象/场景">侧栏「循环刊登」</td><td data-label="前置状态">当前筛选维度</td><td data-label="用户操作">—</td><td data-label="原型表现">橙色文字 + #fff3e8 选中底</td><td data-label="后续状态">静态展示</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="design-basis">
          <h2>设计基底与原型特有调整</h2>
          <ul>
            <li>采用的设计基底：<code>商品循环刊登样式.txt</code> 的 cssVariables（primary #ff781f、菜单底色 #ffe9d5、文字 #303133/#606266/#909399/#c0c4cc、边框 #dcdfe6/#ebeef5）。</li>
            <li>继承方式：以截图实测像素为准，样式文件作为 token 参照。</li>
            <li>实测与样式文件的偏差（保留截图事实）：表头底色实测为 <code>#f5f7fa</code>（非主题渐变）；行操作按钮实测为蓝色 <code>#409eff</code> 系（线上遗留样式）。</li>
          </ul>
        </section>

        <section id="asset-decisions">
          <h2>素材取舍</h2>
          <div class="table-wrap">
            <table>
              <thead><tr><th>素材</th><th>路线</th><th>决策理由</th></tr></thead>
              <tbody>
                <tr><td data-label="素材">品牌徽标、4 张商品缩略图、4 张 DH 角标</td><td data-label="路线">clean-crop 直接复用（reuse）</td><td data-label="决策理由">裁片目检干净、无需去底或再生成</td></tr>
                <tr><td data-label="素材">太阳/菜单/帮助/皇冠/箭头/日历/步进/齿轮/耳机等 15 个图标</td><td data-label="路线">SVG 矢量复刻</td><td data-label="决策理由">规则图形，可无损缩放</td></tr>
                <tr><td data-label="素材">全部界面文字</td><td data-label="路线">HTML 文本渲染</td><td data-label="决策理由">普通 UI 字体即可匹配，无艺术字；仅「我的商品」页签圆点用 CSS 渐变</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="open-questions">
          <h2>当前待确认事项</h2>
          <ul>
            <li>商品标题按词边界换行，与截图的字符级断行（如 “Shoulder/r”）存在一行内微小差异，是否接受？</li>
            <li>行操作按钮蓝色 #409eff 与主题橙色不一致，确认按截图保留？</li>
          </ul>
        </section>

        <section id="decision-history">
          <h2>用户重要决策与变更</h2>
          <div class="table-wrap">
            <table>
              <thead><tr><th>日期</th><th>用户决策或变更</th><th>对当前原型的影响</th></tr></thead>
              <tbody>
                <tr><td data-label="日期">2026-10-10</td><td data-label="用户决策或变更">要求精准还原本页</td><td data-label="对当前原型的影响">以截图实测为唯一视觉事实，样式文件作 token 参照</td></tr>
              </tbody>
            </table>
          </div>
        </section>
      </article>

      <article class="spec-page" data-spec-page="visual-1to1" hidden>
        <h1>1:1 视觉主规格</h1>
        <p class="hint">以下舞台保持源截图 viewport（1912×867，deviceScaleFactor 1）下的 1:1 尺寸；窄屏时横向滚动查看。</p>
        <div class="stage-scroll">
          ${stageMain}
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
`;

const html = template
  .replace('<title>规格文档 HTML 模板</title>', '<title>我的商品 - 骆驼队长BI · 还原主规格</title>')
  .replace(/<style>[\s\S]*?<\/style>/, `${docStyle}<style>${stageCss}
.stage-scroll{overflow-x:auto;margin-top:16px}
.reconstruction-stage{width:1912px;height:867px;background:#f0f1f5}
main.reconstruction-stage{margin:0}</style>`)
  .replace(/<body>[\s\S]*<\/body>/, `<body>${body}</body>`);

fs.writeFileSync(`${ROOT}/src/prototypes/my-products-bi/.spec/spec.html`, html);
console.log('spec.html written', html.length);
