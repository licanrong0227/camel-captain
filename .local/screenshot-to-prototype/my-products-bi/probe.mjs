import { readPng } from '../../../.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs';

const SRC = 'C:/Users/admin/.qoder-cn/tmp/D--projects-CAMEL-CAPTAIN/images/aa9f2a3f-3554-4558-a31f-ce9dba92e2cb/73a957aa-fec3-4b1b-a127-933540b0ca1a.png';
const img = readPng(SRC);
const { width, height, data } = img;
console.log('image', width, height);

function isContent(x, y, { satMin = 30, darkMax = 200 } = {}) {
  const i = (y * width + x) * 4;
  const r = data[i], g = data[i + 1], b = data[i + 2];
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const sat = max - min;
  const lum = (r + g + b) / 3;
  return sat > satMin || lum < darkMax;
}

function rowClusters(x0, y0, x1, y1, opts) {
  const rows = [];
  for (let y = y0; y <= y1; y++) {
    let count = 0;
    for (let x = x0; x <= x1; x++) if (isContent(x, y, opts)) count++;
    rows.push(count);
  }
  const clusters = [];
  let cur = null;
  const thr = 2;
  for (let y = 0; y < rows.length; y++) {
    if (rows[y] > thr) {
      if (!cur) cur = { y0: y0 + y, y1: y0 + y };
      else cur.y1 = y0 + y;
    } else if (cur && y0 + y - cur.y1 > 6) { clusters.push(cur); cur = null; }
  }
  if (cur) clusters.push(cur);
  const out = [];
  for (const c of clusters) {
    let minX = x1, maxX = x0;
    for (let y = c.y0; y <= c.y1; y++)
      for (let x = x0; x <= x1; x++)
        if (isContent(x, y, opts)) { if (x < minX) minX = x; if (x > maxX) maxX = x; }
    out.push({ x0: minX, y0: c.y0, x1: maxX, y1: c.y1 });
  }
  return out;
}

console.log('logo', rowClusters(0, 0, 80, 70, { satMin: 25, darkMax: 210 }));
console.log('thumbs', rowClusters(330, 295, 435, 830, { satMin: 15, darkMax: 235 }));
console.log('dh-badges', rowClusters(855, 355, 935, 780, { satMin: 20, darkMax: 220 }));
console.log('float-btn', rowClusters(1850, 480, 1911, 560, { satMin: 20, darkMax: 220 }));
console.log('circle-btns', rowClusters(1790, 720, 1845, 810, { satMin: 20, darkMax: 220 }));
