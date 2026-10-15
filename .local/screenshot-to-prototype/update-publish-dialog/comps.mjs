import { pathToFileURL } from 'node:url';
const utils = await import(pathToFileURL('D:/projects/CAMEL CAPTAIN/.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs').href);
const read = utils.readPng;
const img = read('C:/Users/admin/.qoder-cn/tmp/D--projects-CAMEL-CAPTAIN/images/44036eb2-054a-4ca2-a940-4ca6fb7bc4aa/03596652-d0ef-41e0-a7dd-4d47bb78ae0a.png');
const { width, height, data } = img;
// mask: pixel differs strongly from local whitish/gray bg => use global threshold on darkness or saturation
const mask = new Uint8Array(width * height);
for (let i = 0; i < width * height; i++) {
  const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
  const lum = (r + g + b) / 3;
  const sat = Math.max(r, g, b) - Math.min(r, g, b);
  mask[i] = (lum < 200 || sat > 60) ? 1 : 0;
}
// dilate horizontally by 3 and vertically by 2 to merge glyph strokes within a char, then components
const dil = new Uint8Array(width * height);
for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
  let on = 0;
  for (let dy = -2; dy <= 2 && !on; dy++) for (let dx = -3; dx <= 3 && !on; dx++) {
    const yy = y + dy, xx = x + dx;
    if (yy >= 0 && yy < height && xx >= 0 && xx < width && mask[yy * width + xx]) on = 1;
  }
  dil[y * width + x] = on;
}
const seen = new Uint8Array(width * height);
const boxes = [];
for (let i = 0; i < width * height; i++) {
  if (!dil[i] || seen[i]) continue;
  const stack = [i]; seen[i] = 1;
  let minx = width, miny = height, maxx = 0, maxy = 0, n = 0;
  while (stack.length) {
    const p = stack.pop(); n++;
    const x = p % width, y = (p - x) / width;
    if (x < minx) minx = x; if (x > maxx) maxx = x;
    if (y < miny) miny = y; if (y > maxy) maxy = y;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const xx = x + dx, yy = y + dy;
      if (xx < 0 || yy < 0 || xx >= width || yy >= height) continue;
      const q = yy * width + xx;
      if (dil[q] && !seen[q]) { seen[q] = 1; stack.push(q); }
    }
  }
  boxes.push({ left: minx, top: miny, right: maxx + 1, bottom: maxy + 1, n });
}
boxes.sort((a, b) => a.top - b.top || a.left - b.left);
for (const bx of boxes) if (bx.n > 30) console.log(JSON.stringify(bx));
