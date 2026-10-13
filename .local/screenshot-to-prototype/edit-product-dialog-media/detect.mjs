import { readPng } from '../../../.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs';

const SRC = 'C:/Users/admin/.qoder-cn/tmp/D--projects-CAMEL-CAPTAIN/images/6710385f-0d10-4e9a-9c2a-5e8a599ccb70/02635610-e965-4299-aa2d-a6705a13054c.png';
const img = readPng(SRC);
const { width: W, height: H, data } = img;
console.log('size', W, H);

function px(x, y) {
  const i = (y * W + x) * 4;
  return [data[i], data[i + 1], data[i + 2]];
}
const isWhiteish = (c) => c[0] > 245 && c[1] > 245 && c[2] > 245;

// find horizontal runs of non-white pixels along a row band
function rowRuns(y0, y1, x0, x1, minLen) {
  const cols = [];
  for (let x = x0; x < x1; x++) {
    let hit = false;
    for (let y = y0; y < y1; y += 2) {
      if (!isWhiteish(px(x, y))) { hit = true; break; }
    }
    cols.push(hit);
  }
  const runs = [];
  let s = -1;
  for (let i = 0; i <= cols.length; i++) {
    if (i < cols.length && cols[i]) { if (s < 0) s = i; }
    else if (s >= 0) { if (i - s >= minLen) runs.push([x0 + s, x0 + i - 1]); s = -1; }
  }
  return runs;
}
function colBands(x0, x1, y0, y1, minLen) {
  const rows = [];
  for (let y = y0; y < y1; y++) {
    let hit = false;
    for (let x = x0; x < x1; x += 2) {
      if (!isWhiteish(px(x, y))) { hit = true; break; }
    }
    rows.push(hit);
  }
  const runs = [];
  let s = -1;
  for (let i = 0; i <= rows.length; i++) {
    if (i < rows.length && rows[i]) { if (s < 0) s = i; }
    else if (s >= 0) { if (i - s >= minLen) runs.push([y0 + s, y0 + i - 1]); s = -1; }
  }
  return runs;
}

// 1) product list thumbnails: x band ~110..170, y 120..760
console.log('list thumbs bands:', colBands(115, 165, 120, 780, 20));
// 2) main images row: find y band first using x 660..1210
console.log('main row ybands:', colBands(670, 1200, 470, 610, 30));
// 3) promo image y band
console.log('promo ybands:', colBands(560, 660, 700, 810, 20));
// exact bbox per thumbnail region helper
function tightBox(x0, x1, y0, y1) {
  let minX = 1e9, maxX = -1, minY = 1e9, maxY = -1;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    if (!isWhiteish(px(x, y))) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
  }
  return [minX, minY, maxX, maxY];
}
const bands = colBands(115, 165, 120, 780, 20);
for (const [y0, y1] of bands) console.log('thumb tight', tightBox(105, 175, y0, y1));
