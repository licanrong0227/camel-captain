import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';

function decodePng(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('not png');
  let off = 8;
  let w, h, depth, ctype;
  const idat = [];
  let palette = null, trns = null;
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString('ascii', off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (type === 'IHDR') {
      w = data.readUInt32BE(0); h = data.readUInt32BE(4);
      depth = data[8]; ctype = data[9];
      if (depth !== 8) throw new Error('bit depth ' + depth + ' unsupported');
    } else if (type === 'IDAT') idat.push(Buffer.from(data));
    else if (type === 'PLTE') palette = data;
    else if (type === 'tRNS') trns = data;
    else if (type === 'IEND') break;
    off += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const ch = ctype === 6 ? 4 : ctype === 2 ? 3 : ctype === 3 ? 1 : ctype === 0 ? 1 : ctype === 4 ? 2 : 0;
  if (!ch) throw new Error('color type ' + ctype + ' unsupported');
  const bpp = ch;
  const stride = w * bpp;
  const out = Buffer.alloc(h * stride);
  let pos = 0;
  for (let y = 0; y < h; y++) {
    const filter = raw[pos++];
    const line = raw.subarray(pos, pos + stride);
    pos += stride;
    const cur = out.subarray(y * stride, (y + 1) * stride);
    const prev = y > 0 ? out.subarray((y - 1) * stride, y * stride) : Buffer.alloc(stride);
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? cur[x - bpp] : 0;
      const b = prev[x];
      const c = x >= bpp ? prev[x - bpp] : 0;
      let v = line[x];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      cur[x] = v & 0xff;
    }
  }
  const px = (x, y) => {
    const i = (y * w + x) * bpp;
    if (ctype === 3) {
      const idx = out[i] * 3;
      return [palette[idx], palette[idx + 1], palette[idx + 2], trns && trns[out[i]] !== undefined ? trns[out[i]] : 255];
    }
    return [out[i], out[i + 1], out[i + 2], ch === 4 ? out[i + 3] : ch === 2 ? out[i] : 255];
  };
  return { w, h, px, channels: ch };
}

const hex = ([r, g, b]) => '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0').toUpperCase()).join('');
const near = (a, b, t = 6) => Math.abs(a[0] - b[0]) <= t && Math.abs(a[1] - b[1]) <= t && Math.abs(a[2] - b[2]) <= t;

function bboxOf(img, target, x0, y0, x1, y1, tol = 6) {
  let minX = 1e9, minY = 1e9, maxX = -1, maxY = -1, count = 0;
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    if (near(img.px(x, y), target, tol)) {
      count++;
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
  }
  return count ? { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1, count } : null;
}

// horizontal scan: report color runs along a row
function runs(img, y, x0, x1, minLen = 2) {
  const res = [];
  let start = x0, cur = img.px(x0, x0 ? 0 : 0);
  cur = img.px(x0, y);
  for (let x = x0 + 1; x < x1; x++) {
    const p = img.px(x, y);
    if (!near(p, cur, 4)) {
      if (x - start >= minLen) res.push({ from: start, to: x - 1, len: x - start, color: hex(cur), a: cur[3] });
      start = x; cur = p;
    }
  }
  res.push({ from: start, to: x1 - 1, len: x1 - start, color: hex(cur), a: cur[3] });
  return res;
}

const dir = '.local/theme-capture-camel-captain-erp/sources';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));
const cmd = process.argv[2] || 'info';
const pick = process.argv[3];

for (const f of files) {
  const img = decodePng(fs.readFileSync(path.join(dir, f)));
  if (cmd === 'info') console.log(f, img.w + 'x' + img.h, 'ch' + img.channels);
}

if (cmd === 'button') {
  const img = decodePng(fs.readFileSync(path.join(dir, 'figma-01-Button按钮.png')));
  console.log('size', img.w, 'x', img.h);
  const orange = [255, 125, 41];
  // find all solid primary buttons
  let y = 0, found = [];
  while (y < img.h) {
    const bb = bboxOf(img, orange, 0, y, img.w, Math.min(y + 200, img.h));
    if (bb && bb.count > 400) { found.push(bb); y += bb.h + 4; } else y += 40;
  }
  console.log('primary-orange blocks:', JSON.stringify(found, null, 1));
}

if (cmd === 'hscan') {
  const img = decodePng(fs.readFileSync(path.join(dir, pick)));
  const yy = Number(process.argv[4]);
  const x0 = Number(process.argv[5] || 0), x1 = Number(process.argv[6] || img.w);
  console.log(JSON.stringify(runs(img, yy, x0, x1, 2).filter(r => r.len > 1), null, 1));
}

if (cmd === 'vscan') {
  const img = decodePng(fs.readFileSync(path.join(dir, pick)));
  const xx = Number(process.argv[4]);
  const y0 = Number(process.argv[5] || 0), y1 = Number(process.argv[6] || img.h);
  const res = [];
  let start = y0, cur = img.px(xx, y0);
  for (let y = y0 + 1; y < y1; y++) {
    const p = img.px(xx, y);
    if (!near(p, cur, 4)) {
      if (y - start >= 2) res.push({ from: start, to: y - 1, len: y - start, color: hex(cur), a: cur[3] });
      start = y; cur = p;
    }
  }
  res.push({ from: start, to: y1 - 1, len: y1 - start, color: hex(cur), a: cur[3] });
  console.log(JSON.stringify(res.filter(r => r.len > 1), null, 1));
}

if (cmd === 'grid') {
  const img = decodePng(fs.readFileSync(path.join(dir, pick)));
  const step = Number(process.argv[4] || 60);
  for (let y = step / 2 | 0; y < img.h; y += step) {
    let line = '';
    for (let x = step / 2 | 0; x < img.w; x += step) {
      const p = img.px(x, y);
      line += p[3] < 40 ? ' ....' : near(p, [255, 255, 255], 12) ? '  wht' : hex(p).slice(1, 6).padStart(5);
    }
    console.log(String(y | 0).padStart(5), line);
  }
}

if (cmd === 'color') {
  const img = decodePng(fs.readFileSync(path.join(dir, 'figma-10-颜色 Color.png')));
  console.log('size', img.w, img.h);
  const x = Number(process.argv[3] || 180), y = Number(process.argv[4] || 300);
  console.log('px', x, y, hex(img.px(x, y)));
}
