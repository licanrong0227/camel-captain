import { readPng } from '../../../.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs';

const img = readPng(process.argv[2]);
const { width, height, data } = img;
const at = (x, y) => {
  const i = (y * width + x) * 4;
  return [data[i], data[i + 1], data[i + 2], data[i + 3]];
};
const near = (p, t, tol = 12) => Math.abs(p[0] - t[0]) <= tol && Math.abs(p[1] - t[1]) <= tol && Math.abs(p[2] - t[2]) <= tol;

// 1) modal edges: scan center row / column for white transitions
const midY = Math.round(height * 0.5);
const midX = Math.round(width * 0.5);
const runs = (line, fn) => {
  const out = [];
  let prev = null;
  for (let i = 0; i < line; i++) {
    const v = fn(i);
    if (v !== prev) { out.push([i, v]); prev = v; }
  }
  return out;
};
console.log('row', midY, 'white runs:', runs(width, (x) => near(at(x, midY), [255, 255, 255], 6)).filter(([, v]) => v).map(([i]) => i).slice(0, 20));
console.log('col', midX, 'white runs:', runs(height, (y) => near(at(midX, y), [255, 255, 255], 6)).filter(([, v]) => v).map(([i]) => i).slice(0, 20));

// 2) sample specific rows/cols for color
for (const spec of process.argv.slice(3)) {
  const [axis, idx, from, to, step] = spec.split(':');
  const start = Number(from ?? 0), end = Number(to ?? (axis === 'x' ? width : height)), st = Number(step ?? 1);
  const out = [];
  for (let i = start; i < end; i += st) {
    const p = axis === 'x' ? at(i, Number(idx)) : at(Number(idx), i);
    out.push(`${i}:${p[0]},${p[1]},${p[2]}`);
  }
  console.log(axis, idx, out.join(' '));
}
