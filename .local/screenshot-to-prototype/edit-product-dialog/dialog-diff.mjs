import { readPng } from '../../../.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs';

// dialog-diff.mjs <src> <render> [x y w h]
const a = readPng(process.argv[2]);
const b = readPng(process.argv[3]);
const X = +(process.argv[4] ?? 96), Y = +(process.argv[5] ?? 52);
const W = +(process.argv[6] ?? 1720), H = +(process.argv[7] ?? 780);
const at = (im, x, y) => { const i = (y * im.width + x) * 4; return [im.data[i], im.data[i + 1], im.data[i + 2]]; };
const T = 32, cols = Math.ceil(W / T), rows = Math.ceil(H / T);
const tiles = [];
let s = 0, n = 0;
for (let ty = 0; ty < rows; ty++) for (let tx = 0; tx < cols; tx++) {
  let ts = 0, tn = 0;
  for (let y = Y + ty * T; y < Math.min(Y + H, (ty + 1) * T + Y); y++) for (let x = X + tx * T; x < Math.min(X + W, (tx + 1) * T + X); x++) {
    if (x >= a.width || y >= a.height || x >= b.width || y >= b.height) continue;
    const p = at(a, x, y), q = at(b, x, y);
    const d = Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]) + Math.abs(p[2] - q[2]);
    ts += d; tn++; s += d; n++;
  }
  tiles.push({ x: X + tx * T, y: Y + ty * T, d: ts / Math.max(1, tn) });
}
tiles.sort((p, q) => q.d - p.d);
console.log('region mean diff/chan:', (s / Math.max(1, n) / 3).toFixed(3));
for (const t of tiles.slice(0, +(process.argv[8] ?? 20))) console.log(`  ${t.x},${t.y}  ${(t.d / 3).toFixed(1)}`);
