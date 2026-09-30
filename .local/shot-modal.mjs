const { chromium } = await import('file:///C:/Users/admin/.cache/axure-extractor/node_modules/playwright/index.mjs');
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await p.goto('http://localhost:51720/prototypes/personal-center-page/', { waitUntil: 'networkidle' });
await p.click('button.pcp-detail-btn');
await p.waitForSelector('.pcp-dl-pager');
await p.locator('.pcp-modal').screenshot({ path: '.local/modal-new.png' });
await b.close();
