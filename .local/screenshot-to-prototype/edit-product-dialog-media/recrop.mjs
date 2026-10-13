import { readPng, cropPng, writePng } from '../../../.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs';

const SRC = 'C:/Users/admin/.qoder-cn/tmp/D--projects-CAMEL-CAPTAIN/images/6710385f-0d10-4e9a-9c2a-5e8a599ccb70/02635610-e965-4299-aa2d-a6705a13054c.png';
const ASSETS = 'D:/projects/CAMEL CAPTAIN/src/prototypes/edit-product-dialog-media/assets';

const src = readPng(SRC);
for (let i = 0; i < 10; i++) {
  writePng(`${ASSETS}/thumb-${i + 1}.png`, cropPng(src, { x: 125, y: 129 + i * 62, width: 40, height: 40 }));
}
for (let i = 0; i < 5; i++) {
  writePng(`${ASSETS}/main-${i + 1}.png`, cropPng(src, { x: 658 + i * 110, y: 473, width: 96, height: 96 }));
}
writePng(`${ASSETS}/promo-1.png`, cropPng(src, { x: 548, y: 717, width: 96, height: 60 }));
console.log('recropped');
