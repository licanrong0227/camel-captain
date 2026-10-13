import { readPng } from '../../../.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs';
const SRC = 'C:/Users/admin/.qoder-cn/tmp/D--projects-CAMEL-CAPTAIN/images/6710385f-0d10-4e9a-9c2a-5e8a599ccb70/02635610-e965-4299-aa2d-a6705a13054c.png';
const img = readPng(SRC);
const { width: W, height: H, data } = img;
const px = (x, y) => { const i = (y * W + x) * 4; return [data[i], data[i + 1], data[i + 2]]; };
const hex = (c) => '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
function scanRow(y, x0 = 0, x1 = W) {
  const out = []; let prev = null;
  for (let x = x0; x < x1; x++) { const h = hex(px(x, y)); if (h !== prev) { out.push([x, h]); prev = h; } }
  return out;
}
function scanCol(x, y0 = 0, y1 = H) {
  const out = []; let prev = null;
  for (let y = y0; y < y1; y++) { const h = hex(px(x, y)); if (h !== prev) { out.push([y, h]); prev = h; } }
  return out;
}
const arg = process.argv[2];
if (arg === 'row') console.log(JSON.stringify(scanRow(+process.argv[3], +process.argv[4] || 0, +process.argv[5] || W)));
if (arg === 'col') console.log(JSON.stringify(scanCol(+process.argv[3], +process.argv[4] || 0, +process.argv[5] || H)));
