import { readPng, cropPng, writePng } from '../../../.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs';

const SRC = 'C:/Users/admin/.qoder-cn/tmp/D--projects-CAMEL-CAPTAIN/images/6710385f-0d10-4e9a-9c2a-5e8a599ccb70/02635610-e965-4299-aa2d-a6705a13054c.png';
const OUT = 'D:/projects/CAMEL CAPTAIN/.local/screenshot-to-prototype/edit-product-dialog-media/';
const capFile = process.argv[2];
const OFF = Number(process.argv[3] ?? 0);
const [x, y, w, h] = process.argv.slice(4, 8).map(Number);

const src = readPng(SRC);
const cap = readPng(OUT + capFile);
const tag = `${x}_${y}`;
writePng(`${OUT}r-src-${tag}.png`, cropPng(src, { x, y, width: w, height: h }));
writePng(`${OUT}r-cap-${tag}.png`, cropPng(cap, { x, y: y + OFF, width: w, height: h }));
console.log('written', tag);
