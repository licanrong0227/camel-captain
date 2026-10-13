import { readPng, cropPng, writePng } from '../../../.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs';

const SRC = 'C:/Users/admin/.qoder-cn/tmp/D--projects-CAMEL-CAPTAIN/images/6710385f-0d10-4e9a-9c2a-5e8a599ccb70/02635610-e965-4299-aa2d-a6705a13054c.png';
const OUT = 'D:/projects/CAMEL CAPTAIN/.local/screenshot-to-prototype/edit-product-dialog-media/';
const capFile = process.argv[2];
const OFF = Number(process.argv[3] ?? 40);

const src = readPng(SRC);
const cap = readPng(OUT + capFile);
console.log('src', src.width, src.height, 'cap', cap.width, cap.height);

const W = Math.min(src.width, cap.width);
const H = Math.min(src.height, cap.height - OFF);

const at = (img, x, y) => {
  const i = (y * img.width + x) * 4;
  return [img.data[i], img.data[i + 1], img.data[i + 2]];
};

const B = 16;
const bad = [];
for (let by = 0; by + B <= H; by += B) {
  for (let bx = 0; bx + B <= W; bx += B) {
    let sum = 0;
    for (let y = by; y < by + B; y++) {
      for (let x = bx; x < bx + B; x++) {
        const a = at(src, x, y);
        const b = at(cap, x, y + OFF);
        sum += Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
      }
    }
    const mean = sum / (B * B * 3);
    if (mean > 12) bad.push({ x: bx, y: by, mean: +mean.toFixed(1) });
  }
}
bad.sort((p, q) => q.mean - p.mean);
console.log('bad blocks:', bad.length);
console.log(bad.slice(0, 40).map((b) => `(${b.x},${b.y}) ${b.mean}`).join('  '));

// stacked pairs for worst regions
const seen = new Set();
const regions = [];
for (const b of bad) {
  const key = `${Math.floor(b.x / 256)}-${Math.floor(b.y / 200)}`;
  if (seen.has(key)) continue;
  seen.add(key);
  regions.push(b);
  if (regions.length >= 6) break;
}
for (const r of regions) {
  const x = Math.max(0, r.x - 40);
  const y = Math.max(0, r.y - 40);
  const w = Math.min(320, W - x);
  const h = Math.min(180, H - y);
  const a = cropPng(src, { x, y, width: w, height: h });
  const b = cropPng(cap, { x, y: y + OFF, width: w, height: h });
  const stack = { width: w, height: h * 2 + 4, channels: 4, data: Buffer.alloc(w * (h * 2 + 4) * 4) };
  const blit = (img, ox, oy) => {
    for (let y2 = 0; y2 < img.height; y2++) {
      for (let x2 = 0; x2 < img.width; x2++) {
        const i = ((y2 + oy) * stack.width + (x2 + ox)) * 4;
        const j = (y2 * img.width + x2) * img.channels;
        stack.data[i] = img.data[j];
        stack.data[i + 1] = img.data[j + 1];
        stack.data[i + 2] = img.data[j + 2];
        stack.data[i + 3] = 255;
      }
    }
  };
  blit(a, 0, 0);
  blit(b, 0, h + 4);
  writePng(`${OUT}cmp-${capFile.replace('.png', '')}-${x}_${y}.png`, stack);
}
console.log('regions:', regions.map((r) => `${r.x},${r.y}`).join(' | '));
