import { pathToFileURL } from 'node:url';
const utils = await import(pathToFileURL('D:/projects/CAMEL CAPTAIN/.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs').href);
const a = utils.readPng('C:/Users/admin/.qoder-cn/tmp/D--projects-CAMEL-CAPTAIN/images/44036eb2-054a-4ca2-a940-4ca6fb7bc4aa/03596652-d0ef-41e0-a7dd-4d47bb78ae0a.png');
const b = utils.readPng('first-pass-shot-v5.png');
const w = Math.min(a.width, b.width), h = Math.min(a.height, b.height);
const cells = {};
for (let y = 0; y < h; y += 8) for (let x = 0; x < w; x += 8) {
  let d = 0;
  for (let dy = 0; dy < 8; dy++) for (let dx = 0; dx < 8; dx++) {
    const i = ((y + dy) * a.width + x + dx) * 4, j = ((y + dy) * b.width + x + dx) * 4;
    d += Math.abs(a.data[i] - b.data[j]) + Math.abs(a.data[i+1] - b.data[j+1]) + Math.abs(a.data[i+2] - b.data[j+2]);
  }
  if (d > 8 * 8 * 30) cells[`${x >> 3},${y >> 3}`] = d;
}
const keys = Object.keys(cells);
console.log('diff cells:', keys.length, 'of', (w/8)*(h/8));
// cluster print
const list = keys.map(k => { const [cx, cy] = k.split(',').map(Number); return { x: cx*8, y: cy*8, d: cells[k] }; }).sort((p,q)=>q.d-p.d);
for (const c of list.slice(0, 40)) console.log(c.x, c.y, c.d);
