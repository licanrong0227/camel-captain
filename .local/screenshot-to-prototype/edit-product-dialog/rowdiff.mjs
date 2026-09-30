import { readPng } from '../../../.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs';

// rowdiff.mjs <src> <render> <x0> <x1> <y0> <y1>
const a = readPng(process.argv[2]);
const b = readPng(process.argv[3]);
const [x0, x1, y0, y1] = process.argv.slice(4).map(Number);
const px = (im, x, y) => { const i = (y * im.width + x) * 4; return [im.data[i], im.data[i + 1], im.data[i + 2]]; };
const row = (im, y) => { let s = 0; for (let x = x0; x <= x1; x++) { const p = px(im, x, y); s += p[0] + p[1] + p[2]; } return s / (x1 - x0 + 1) / 3; };
const dark = (im, y) => { let n = 0; for (let x = x0; x <= x1; x++) { const p = px(im, x, y); if (p[0] + p[1] + p[2] < 720) n++; } return n; };
console.log('y   srcLum rctLum  srcDark rctDark');
for (let y = y0; y <= y1; y++) {
  const d = Math.abs(dark(a, y) - dark(b, y));
  if (d > 3 || Math.abs(row(a, y) - row(b, y)) > 4)
    console.log(`${y}  ${row(a, y).toFixed(1)} ${row(b, y).toFixed(1)}   ${dark(a, y)} ${dark(b, y)}  ${d > 3 ? '*' : ''}`);
}
