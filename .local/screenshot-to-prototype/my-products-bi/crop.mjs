import fs from 'node:fs';
import { readPng, cropPng, writePng } from '../../../.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs';

const SRC = 'C:/Users/admin/.qoder-cn/tmp/D--projects-CAMEL-CAPTAIN/images/aa9f2a3f-3554-4558-a31f-ce9dba92e2cb/73a957aa-fec3-4b1b-a127-933540b0ca1a.png';
const img = readPng(SRC);
fs.mkdirSync('crops', { recursive: true });
const boxes = {
  'logo': { x: 0, y: 0, width: 70, height: 70 },
  'thumb1': { x: 344, y: 306, width: 84, height: 84 },
  'thumb2': { x: 344, y: 451, width: 84, height: 84 },
  'thumb3': { x: 344, y: 561, width: 84, height: 84 },
  'thumb4': { x: 342, y: 675, width: 88, height: 88 },
  'dh1': { x: 890, y: 358, width: 50, height: 36 },
  'dh2': { x: 890, y: 502, width: 50, height: 36 },
  'dh3': { x: 866, y: 618, width: 50, height: 36 },
  'dh4': { x: 866, y: 733, width: 50, height: 36 },
  'float': { x: 1855, y: 480, width: 57, height: 75 },
  'vip': { x: 1630, y: 8, width: 80, height: 40 },
  'avatar': { x: 1840, y: 4, width: 72, height: 48 },
};
for (const [name, b] of Object.entries(boxes)) {
  writePng(`crops/${name}.png`, cropPng(img, b));
}
console.log('done');
