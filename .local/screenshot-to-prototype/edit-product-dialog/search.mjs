import { readPng } from '../../../.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs';

const img = readPng(process.argv[2]);
const { width, data } = img;
const [x0, y0, x1, y1, mode] = process.argv.slice(3).map(Number);
const at = (x, y) => {
  const i = (y * width + x) * 4;
  return [data[i], data[i + 1], data[i + 2]];
};
const hit = (p) => {
  const [r, g, b] = p;
  if (mode === 1) return r > 200 && g > 40 && g < 190 && b < 120; // orange-ish
  if (mode === 2) return r > 200 && g > 200 && b > 200; // white-ish
  if (mode === 3) return r < 60 && g < 60 && b < 60; // dark
  return true;
};
let minX = 1e9, maxX = -1, minY = 1e9, maxY = -1, count = 0;
const rowHits = {};
for (let y = y0; y < y1; y++) {
  for (let x = x0; x < x1; x++) {
    if (hit(at(x, y))) {
      count++;
      minX = Math.min(minX, x); maxX = Math.max(maxX, x);
      minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      (rowHits[y] ??= []).push(x);
    }
  }
}
console.log(`hits=${count} bbox x ${minX}..${maxX} y ${minY}..${maxY}`);
for (const [y, xs] of Object.entries(rowHits)) {
  const r = { min: Math.min(...xs), max: Math.max(...xs) };
  if (Number(y) % 4 === 0) console.log(`y=${y} n=${xs.length} x ${r.min}..${r.max}`);
}
