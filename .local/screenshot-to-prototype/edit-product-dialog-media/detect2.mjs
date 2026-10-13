import { readPng, cropPng, writePng } from '../../../.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs';

const SRC = 'C:/Users/admin/.qoder-cn/tmp/D--projects-CAMEL-CAPTAIN/images/6710385f-0d10-4e9a-9c2a-5e8a599ccb70/02635610-e965-4299-aa2d-a6705a13054c.png';
const img = readPng(SRC);
const { width: W, data } = img;
function px(x, y) { const i = (y * W + x) * 4; return [data[i], data[i + 1], data[i + 2]]; }
const isWhiteish = (c) => c[0] > 245 && c[1] > 245 && c[2] > 245;
function tight(x0, x1, y0, y1) {
  let a = 1e9, b = 1e9, c = -1, d = -1;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (!isWhiteish(px(x, y))) { if (x < a) a = x; if (x > c) c = x; if (y < b) b = y; if (y > d) d = y; }
  return [a, b, c, d];
}
const bands = [[127,177],[191,230],[257,290],[315,354],[377,416],[439,478],[501,540],[563,602],[625,664],[687,726]];
bands.forEach(([y0,y1],i)=>console.log('thumb',i+1,tight(118,178,y0,y1)));
console.log('main1', tight(660,745,470,575));
console.log('main5', tight(1100,1185,470,575));
console.log('promo', tight(540,650,710,790));
const crops = {
  'crop-list-col.png': { x: 100, y: 115, width: 260, height: 630 },
  'crop-main-row.png': { x: 520, y: 425, width: 740, height: 190 },
  'crop-promo.png': { x: 500, y: 680, width: 260, height: 120 },
  'crop-video-box.png': { x: 500, y: 200, width: 300, height: 170 },
};
for (const [name, bbox] of Object.entries(crops)) writePng(name, cropPng(img, bbox));
console.log('ok');
