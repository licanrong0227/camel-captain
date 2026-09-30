import { readPng } from '../../../.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs';

// scan.mjs <src> <render> x0 y0 w h [range]
const a = readPng(process.argv[2]);
const b = readPng(process.argv[3]);
const [X0, Y0, W, H] = process.argv.slice(4, 8).map(Number);
const R = +(process.argv[8] ?? 6);
const px = (im, x, y) => { const i = (y * im.width + x) * 4; return [im.data[i], im.data[i + 1], im.data[i + 2]]; };
const at = (im, x, y) => (x < 0 || y < 0 || x >= im.width || y >= im.height) ? null : px(im, x, y);
const out = [];
for (let dx = -R; dx <= R; dx++) for (let dy = -R; dy <= R; dy++) {
  let s = 0, n = 0;
  for (let y = Y0; y < Y0 + H; y++) for (let x = X0; x < X0 + W; x++) {
    const p = at(a, x, y), q = at(b, x + dx, y + dy);
    if (!p || !q) continue;
    s += Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]) + Math.abs(p[2] - q[2]); n += 3;
  }
  out.push({ dx, dy, d: s / Math.max(1, n) });
}
out.sort((p, q) => p.d - q.d);
console.log(`region ${X0},${Y0} ${W}x${H}  now=${out.find(o => !o.dx && !o.dy).d.toFixed(2)}`);
for (const o of out.slice(0, 5)) console.log(`  dx=${o.dx} dy=${o.dy} -> ${o.d.toFixed(2)}`);
