import { pathToFileURL } from 'node:url';
const utils = await import(pathToFileURL('D:/projects/CAMEL CAPTAIN/.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs').href);
const a = utils.readPng('C:/Users/admin/.qoder-cn/tmp/D--projects-CAMEL-CAPTAIN/images/44036eb2-054a-4ca2-a940-4ca6fb7bc4aa/03596652-d0ef-41e0-a7dd-4d47bb78ae0a.png');
const b = utils.readPng('first-pass-shot-v4.png');
function darkRows(img, x0, x1, y0, y1) {
  const out = [];
  for (let y = y0; y <= y1; y++) { let n = 0; for (let x = x0; x <= x1; x++) { const i = (y * img.width + x) * 4; if ((img.data[i] + img.data[i+1] + img.data[i+2]) / 3 < 150) n++; } out.push(`${y}:${n}`); }
  return out.join(' ');
}
console.log('orig title rows:', darkRows(a, 26, 102, 24, 50));
console.log('html title rows:', darkRows(b, 26, 102, 24, 50));
console.log('orig cancel txt rows:', darkRows(a, 150, 195, 276, 300));
console.log('html cancel txt rows:', darkRows(b, 150, 195, 276, 300));
