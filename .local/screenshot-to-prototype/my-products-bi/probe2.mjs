import { readPng } from '../../../.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs';

const SRC = 'C:/Users/admin/.qoder-cn/tmp/D--projects-CAMEL-CAPTAIN/images/aa9f2a3f-3554-4558-a31f-ce9dba92e2cb/73a957aa-fec3-4b1b-a127-933540b0ca1a.png';
const { width, height, data } = readPng(SRC);
const px = (x, y) => { const i = (y * width + x) * 4; return [data[i], data[i + 1], data[i + 2]]; };

function bbox(pred, x0, y0, x1, y1) {
  let minX = 1e9, minY = 1e9, maxX = -1, maxY = -1, n = 0;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    if (pred(px(x, y))) { n++; if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
  }
  return n ? { minX, minY, maxX, maxY, n } : null;
}

const pink = ([r, g, b]) => r > 245 && g > 220 && g < 245 && b > 225 && b < 250;
const blue = ([r, g, b]) => b > 240 && r < 235 && g > 235 && b - r > 12;
const darkish = ([r, g, b]) => r < 120 && g < 120 && b < 120;

for (const [row, y0, y1] of [['r1', 300, 400], ['r2', 445, 545], ['r3', 555, 660], ['r4', 670, 790]]) {
  console.log(row, 'pink-pill', bbox(pink, 800, y0, 1000, y1));
  console.log(row, 'blue-pill', bbox(blue, 800, y0, 1000, y1));
  console.log(row, 'dh-icon', bbox(darkish, 960, y0, 1010, y1));
}
console.log('logo-circle', bbox(([r, g, b]) => Math.abs(r - 230) < 60 && g > 120 && g < 200 && b < 120, 0, 0, 80, 70));
console.log('headset', bbox(([r, g, b]) => r > 230 && g > 80 && g < 170 && b < 90, 1855, 480, 1911, 530));
console.log('orange-dot-tab', bbox(([r, g, b]) => r > 230 && g > 80 && g < 170 && b < 90, 230, 95, 270, 140));
console.log('thumb1', bbox(([r, g, b]) => r + g + b < 620, 330, 295, 445, 400));
console.log('thumb4', bbox(([r, g, b]) => Math.max(r, g, b) - Math.min(r, g, b) > 12 || (r + g + b) / 3 < 225, 330, 660, 445, 790));
