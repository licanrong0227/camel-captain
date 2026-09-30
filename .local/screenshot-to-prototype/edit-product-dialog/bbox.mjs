import { readPng } from '../../../.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs';
const img = readPng(process.argv[2]);
const [x0, y0, x1, y1] = process.argv.slice(3).map(Number);
const at = (x, y) => { const i = (y * img.width + x) * 4; return [img.data[i], img.data[i+1], img.data[i+2]]; };
const rows = {};
for (let y = y0; y < y1; y++) {
  for (let x = x0; x < x1; x++) {
    const [r, g, b] = at(x, y);
    if (Math.abs(r - 255) + Math.abs(g - 255) + Math.abs(b - 255) > 60) {
      rows[y] ??= [];
      rows[y].push(x);
    }
  }
}
const ys = Object.keys(rows).map(Number);
console.log(`y ${ys[0]}..${ys[ys.length - 1]} (${ys[ys.length-1] - ys[0] + 1}px)`);
for (const y of ys) {
  if (Number(y) % 2 === 0) console.log(`  y=${y} x ${Math.min(...rows[y])}..${Math.max(...rows[y])}`);
}
