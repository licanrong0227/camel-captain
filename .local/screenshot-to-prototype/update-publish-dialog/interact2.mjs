const { chromium } = await import('file:///C:/Users/admin/.cache/axure-extractor/node_modules/playwright/index.mjs');

const URL = 'http://localhost:53817/?projectId=make-project-2&p=update-publish-dialog';
const results = [];
const ok = (name, pass, extra = '') => results.push(`${pass ? 'PASS' : 'FAIL'} ${name}${extra ? ' | ' + extra : ''}`);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(URL, { waitUntil: 'load' });
await page.waitForTimeout(6000);

const frame = page.frames()[1];
await frame.waitForSelector('.up-dialog');

const clickText = async (selector, text) => {
  await frame.evaluate(([sel, txt]) => {
    const el = [...document.querySelectorAll(sel)].find((n) => n.textContent.trim() === txt);
    if (!el) throw new Error(`not found: ${sel} "${txt}"`);
    el.click();
  }, [selector, text]);
};

const radioByText = async (labelText) => {
  await frame.evaluate((txt) => {
    const label = [...document.querySelectorAll('.up-radio')].find((n) => n.querySelector('.up-radio__label')?.textContent.trim() === txt);
    if (!label) throw new Error(`radio not found: ${txt}`);
    label.querySelector('input').click();
  }, labelText);
};

const switchByAria = async (ariaLabel) => {
  await frame.evaluate((al) => {
    const btn = document.querySelector(`.up-switch[aria-label="${al}"]`);
    if (!btn) throw new Error(`switch not found: ${al}`);
    btn.click();
  }, ariaLabel);
};

// 1. 定时发布 -> 日期时间选择器
await radioByText('定时发布');
await page.waitForTimeout(200);
ok('定时发布显示选择器', await frame.locator('.up-picker__text', { hasText: '选择定时发布时间' }).count() === 1);
await frame.locator('.up-picker__input').first().click();
await page.waitForTimeout(200);
ok('日期面板打开', await frame.locator('.up-dt__grid').isVisible());
await frame.locator('.up-dt__day:not(.is-blank)').nth(17).click();
await page.waitForTimeout(150);
await frame.locator('.up-dt__confirm').click();
await page.waitForTimeout(200);
const dtValue = await frame.locator('.up-picker__text.is-filled').first().textContent();
ok('选择器回填日期时间', /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dtValue || ''), dtValue || '');

// 2. 失败自动刊登 switch -> 循环次数限制
await switchByAria('失败自动刊登开关');
await page.waitForTimeout(200);
ok('循环次数限制出现', await frame.locator('.up-inline-field__label', { hasText: '循环次数限制' }).count() === 1);

// 3. 标题策略
await switchByAria('标题策略开关');
await page.waitForTimeout(200);
ok('标题策略选项出现', await frame.locator('.up-strategy-block').first().locator('.up-radio').count() === 4);
await radioByText('插入增量前、后缀');
await page.waitForTimeout(200);
ok('增量卡片出现', await frame.locator('.up-seg-card').count() === 2);
ok('示例标题含基串', await frame.locator('.up-sample__base').isVisible());
ok('前缀段橙色高亮', await frame.locator('.up-sample__on').count() > 0);
// guard: 关掉前缀 -> 后缀也关时不允许
const prefixState = await frame.evaluate(() => document.querySelector('.up-switch[aria-label="前缀开关"]')?.getAttribute('aria-checked'));
ok('前缀卡默认开启', prefixState === 'true', String(prefixState));
await switchByAria('前缀开关');
await page.waitForTimeout(150);
ok('关前缀后后缀仍开(至少一项)', await frame.evaluate(() => document.querySelector('.up-switch[aria-label="后缀开关"]')?.getAttribute('aria-checked') === 'true' || document.querySelector('.up-switch[aria-label="前缀开关"]')?.getAttribute('aria-checked') === 'true'));
await switchByAria('前缀开关');
await page.waitForTimeout(150);

// 4. 备选标题
await radioByText('备选标题');
await page.waitForTimeout(200);
ok('备选标题输入框出现', await frame.locator('.up-backup__input').count() === 1);
await clickText('.up-backup__add', '+ 添加备选标题');
await page.waitForTimeout(150);
ok('添加后可删除', await frame.locator('.up-backup__input').count() === 2 && await frame.locator('.up-backup__remove').count() === 2);
ok('备选标题策略区块', await frame.locator('.up-sub-strategy__title', { hasText: '备选标题策略' }).count() === 1);
ok('备选标题策略提示文案', await frame.evaluate(() => document.querySelector('.up-qtip[data-tip*="备选标题已用完"]') !== null));
ok('备选标题策略3选项', await frame.locator('.up-sub-strategy .up-radio').count() === 3);

// 5. 主图策略
await switchByAria('主图策略开关');
await page.waitForTimeout(200);
await radioByText('备选首图');
await page.waitForTimeout(200);
ok('上传控件出现', await frame.locator('.up-upload__add').count() === 1);
ok('备选首图策略默认开启且禁用', await frame.evaluate(() => {
  const r = [...document.querySelectorAll('.up-sub-strategy')].find((n) => n.textContent.includes('备选首图策略'));
  const input = r?.querySelector('input');
  return !!input && input.checked && input.disabled;
}));
ok('备选首图提示文案', await frame.evaluate(() => document.querySelector('.up-qtip[data-tip*="备选首图已用完"]') !== null));

// 6. 策略校验：先全部关闭再点确定
await switchByAria('标题策略开关');
await switchByAria('主图策略开关');
await page.waitForTimeout(200);
await clickText('.up-btn', '确定');
await page.waitForTimeout(200);
ok('两项策略都关时拦截提交', await frame.locator('.up-section__error').count() === 1 && await frame.locator('.up-dialog').count() === 1);
ok('错误文案', (await frame.locator('.up-section__error').textContent())?.includes('至少启用一项'));
await switchByAria('标题策略开关');
await page.waitForTimeout(150);
await clickText('.up-btn', '确定');
await page.waitForTimeout(300);
ok('启用一项后提交通过', await frame.locator('.up-dialog').count() === 0);

// 7. 次日继续刊登 + 时间选择器
await clickText('.up-reopen', '打开更新发布弹窗');
await page.waitForTimeout(300);
await radioByText('次日继续刊登');
await page.waitForTimeout(200);
ok('时间选择器出现', await frame.locator('.up-picker--time').count() === 1);
await frame.locator('.up-picker--time .up-picker__input').click();
await page.waitForTimeout(200);
ok('时间面板48项', await frame.locator('.up-time__item').count() === 48);
await frame.locator('.up-time__item').nth(20).click();
await page.waitForTimeout(200);
const tv = await frame.locator('.up-picker--time .up-picker__text').textContent();
ok('时间回填', /^\d{2}:\d{2}:00$/.test(tv || ''), tv || '');

await page.screenshot({ path: 'redesign-final.png' });
console.log(results.join('\n'));
await browser.close();
