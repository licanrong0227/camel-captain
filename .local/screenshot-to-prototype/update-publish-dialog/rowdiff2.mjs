import { pathToFileURL } from 'node:url';
const utils = await import(pathToFileURL('D:/projects/CAMEL CAPTAIN/.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs').href);
const a = utils.readPng('C:/Users/admin/.qoder-cn/tmp/D--projects-CAMEL-CAPTAIN/images/44036eb2-054a-4ca2-a940-4ca6fb7bc4aa/03596652-d0ef-41e0-a7dd-4d47bb78ae0a.png');
const b = utils.readPng('first-pass-shot-v4.png');
function darkRows(img, x0, x1, y0, y1) { const out=[]; for (let y=y0;y<=y1;y++){let n=0;for(let x=x0;x<=x1;x++){const i=(y*img.width+x)*4;if((img.data[i]+img.data[i+1]+img.data[i+2])/3<170)n++;}out.push(`${y}:${n}`);} return out.join(' ');}
function darkCols(img, x0, x1, y0, y1) { const out=[]; for (let x=x0;x<=x1;x++){let n=0;for(let y=y0;y<=y1;y++){const i=(y*img.width+x)*4;if((img.data[i]+img.data[i+1]+img.data[i+2])/3<170)n++;}out.push(`${x}:${n}`);} return out.join(' ');}
console.log('orig label1 rows:', darkRows(a, 52, 110, 108, 130));
console.log('html label1 rows:', darkRows(b, 52, 110, 108, 130));
console.log('orig close cols:', darkCols(a, 688, 712, 24, 44));
console.log('html close cols:', darkCols(b, 688, 712, 24, 44));
