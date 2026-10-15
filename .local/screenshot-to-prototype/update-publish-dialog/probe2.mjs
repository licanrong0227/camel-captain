import { pathToFileURL } from 'node:url';
const utils = await import(pathToFileURL('D:/projects/CAMEL CAPTAIN/.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs').href);
const img = utils.readPng('C:/Users/admin/.qoder-cn/tmp/D--projects-CAMEL-CAPTAIN/images/44036eb2-054a-4ca2-a940-4ca6fb7bc4aa/03596652-d0ef-41e0-a7dd-4d47bb78ae0a.png');
const { width, height, data } = img;
const px = (x, y) => { const i = (y * width + x) * 4; return '#' + [0,1,2].map(k=>data[i+k].toString(16).padStart(2,'0')).join(''); };
function trans(y){let p=null;const o=[];for(let x=0;x<width;x++){const c=px(x,y);if(c!==p){o.push(`${x}:${c}`);p=c}}return o.join(' ')}
function vtrans(x){let p=null;const o=[];for(let y=0;y<height;y++){const c=px(x,y);if(c!==p){o.push(`${y}:${c}`);p=c}}return o.join(' ')}
for (const y of [180, 185, 190, 215, 220, 225]) console.log('row'+y+':', trans(y).slice(0, 300));
console.log('corner topleft row8:', trans(8).slice(0,200));
console.log('corner col8:', vtrans(8).slice(0,200));
console.log('corner col10:', vtrans(10).slice(0,160));
console.log('bottom row336:', trans(336).slice(0,200));
