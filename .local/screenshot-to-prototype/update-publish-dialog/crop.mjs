import { pathToFileURL } from 'node:url';
const utils = await import(pathToFileURL('D:/projects/CAMEL CAPTAIN/.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs').href);
const [,, file, x, y, w, h, out] = process.argv;
const img = utils.readPng(file);
const x0 = Number(x), y0 = Number(y), cw = Number(w), ch = Number(h);
const crop = { width: cw, height: ch, data: Buffer.alloc(cw * ch * 4) };
for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) {
  const s = ((y0 + j) * img.width + x0 + i) * 4, d = (j * cw + i) * 4;
  crop.data[d] = img.data[s]; crop.data[d+1] = img.data[s+1]; crop.data[d+2] = img.data[s+2]; crop.data[d+3] = 255;
}
utils.writePng(out, crop);
console.log('wrote', out);
