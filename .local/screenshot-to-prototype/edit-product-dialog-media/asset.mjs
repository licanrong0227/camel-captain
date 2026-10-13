import { readPng } from '../../../.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs';
const a=readPng('D:/projects/CAMEL CAPTAIN/src/prototypes/edit-product-dialog-media/assets/main-1.png');
console.log('main-1',a.width,a.height,a.hasAlphaChannel);
const lum=(x,y)=>{const i=(y*a.width+x)*4;return [a.data[i],a.data[i+1],a.data[i+2],a.data[i+3]].join(',');};
for(let y=70;y<96;y+=2){let s=[];for(let x=0;x<a.width;x+=8)s.push(lum(x,y));console.log(y,s.join(' | '));}
