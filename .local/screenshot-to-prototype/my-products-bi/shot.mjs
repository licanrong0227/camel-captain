import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const pwPath = path.join(os.homedir(), '.cache', 'axure-extractor', 'node_modules', 'playwright', 'index.mjs');
const playwright = await import(pathToFileURL(pwPath).href);

const target = process.argv[2];
const output = process.argv[3];
const width = Number(process.argv[4] || 1912);
const height = Number(process.argv[5] || 867);

const browser = await playwright.chromium.launch({
  args: ['--allow-file-access-from-files', '--no-sandbox'],
});
const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
const page = await context.newPage();
await page.goto(pathToFileURL(target).href, { waitUntil: 'load' });
await page.waitForTimeout(300);
await page.screenshot({ path: output, type: 'png' });
await browser.close();
console.log('captured', output);
