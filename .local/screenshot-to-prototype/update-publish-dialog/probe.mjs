import { pathToFileURL } from 'node:url';
const utils = await import(pathToFileURL('D:/projects/CAMEL CAPTAIN/.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs').href);
const img = utils.readPng('C:/Users/admin/.qoder-cn/tmp/D--projects-CAMEL-CAPTAIN/images/44036eb2-054a-4ca2-a940-4ca6fb7bc4aa/03596652-d0ef-41e0-a7dd-4d47bb78ae0a.png');
const { width, height, data } = img;
const px = (x, y) => { const i = (y * width + x) * 4; return [data[i], data[i+1], data[i+2]]; };
const hex = (c) => '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
function transitions(y) {
  let prev = null; const out = [];
  for (let x = 0; x < width; x++) { const c = hex(px(x, y)); if (c !== prev) { out.push(`${x}:${c}`); prev = c; } }
  return out.join(' ');
}
function vtransitions(x) {
  let prev = null; const out = [];
  for (let y = 0; y < height; y++) { const c = hex(px(x, y)); if (c !== prev) { out.push(`${y}:${c}`); prev = c; } }
  return out.join(' ');
}
console.log('row172:', transitions(172));
console.log('col366:', vtransitions(366));
console.log('row288 input:', transitions(288).slice(0, 2000));
console.log('col690 input-right:', vtransitions(690));
console.log('row146 radio2:', transitions(146));
console.log('col35 cb1:', vtransitions(35));
console.log('col60 radio1:', vtransitions(60));
console.log('col301 cb2:', vtransitions(301));
console.log('col480 input:', vtransitions(480));
console.log('col580 arrows:', vtransitions(580));
console.log('col170 cancel-border:', vtransitions(170));
console.log('col250 confirm:', vtransitions(250));
console.log('col700 close:', vtransitions(700));
console.log('row118 cb1-h:', transitions(118));
console.log('row283 arrows-h:', transitions(283));
console.log('row293 arrows-h:', transitions(293));
