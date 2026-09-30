const { chromium } = await import('file:///C:/Users/admin/.cache/axure-extractor/node_modules/playwright/index.mjs');

const URL = 'http://localhost:51720/prototypes/personal-center-page/';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await page.goto(URL, { waitUntil: 'networkidle' });

await page.click('button.pcp-detail-btn');
await page.waitForSelector('.pcp-dl-pager');

const geom = await page.evaluate(() => {
  const p = document.querySelector('.pcp-dl-pager');
  const r = p.getBoundingClientRect();
  const kids = [...p.children].map(c => {
    const k = c.getBoundingClientRect();
    return { node: (c.className || c.tagName) + '', left: Math.round(k.left), right: Math.round(k.right) };
  });
  return {
    pager: { left: Math.round(r.left), right: Math.round(r.right), bottom: Math.round(r.bottom), height: Math.round(r.height) },
    modalBottom: Math.round(document.querySelector('.pcp-modal').getBoundingClientRect().bottom),
    kids,
  };
});
console.log(JSON.stringify(geom, null, 1));

await page.locator('.pcp-dl-pager').screenshot({ path: '.local/pager-new.png' });

const rowN = () => page.locator('.pcp-dl-c').count();
const rowsBefore = await rowN();
await page.locator('.pcp-dl-page-btn:not(.arrow)').nth(1).click();
await page.waitForTimeout(150);
const state = await page.evaluate(() => ({
  active: document.querySelector('.pcp-dl-page-btn.active')?.textContent,
  prevDisabled: document.querySelectorAll('.pcp-dl-page-btn.arrow')[0]?.disabled,
  nextDisabled: document.querySelectorAll('.pcp-dl-page-btn.arrow')[1]?.disabled,
}));
console.log('rows', rowsBefore, '-> after click page2:', JSON.stringify(state));

await page.locator('.pcp-dl-size-select .pcp-dl-select').click();
await page.waitForTimeout(100);
await page.locator('.pcp-dl-option').nth(1).click();
await page.waitForTimeout(150);
console.log('size 20 ->', JSON.stringify(await page.evaluate(() => ({
  label: document.querySelector('.pcp-dl-size-select .pcp-dl-select span')?.textContent,
  rows: document.querySelectorAll('.pcp-dl-c').length / 5,
  active: document.querySelector('.pcp-dl-page-btn.active')?.textContent,
}))));

await page.fill('.pcp-dl-goto input', '1');
await page.press('.pcp-dl-goto input', 'Enter');
await page.waitForTimeout(150);
console.log('goto 1 ->', JSON.stringify(await page.evaluate(() => ({
  active: document.querySelector('.pcp-dl-page-btn.active')?.textContent,
  prevDisabled: document.querySelectorAll('.pcp-dl-page-btn.arrow')[0]?.disabled,
}))));

await page.locator('.pcp-dl-pager').screenshot({ path: '.local/pager-new2.png' });
await browser.close();
