import { readPng } from '../../../.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs';
const SRC='C:/Users/admin/.qoder-cn/tmp/D--projects-CAMEL-CAPTAIN/images/6710385f-0d10-4e9a-9c2a-5e8a599ccb70/02635610-e965-4299-aa2d-a6705a13054c.png';
const img=readPng(SRC);
const P=(x,y)=>{const i=(y*img.width+x)*4;return [img.data[i],img.data[i+1],img.data[i+2]];};
// collect darkest pixels inside bar area of frame 0
let best=[];
for(let y=552;y<=566;y++)for(let x=668;x<=740;x++){const c=P(x,y);const l=c[0]+c[1]+c[2];best.push([l,x,y,c]);}
best.sort((a,b)=>a[0]-b[0]);
for(const b of best.slice(0,14))console.log(b[1],b[2],b[3].join(','));
console.log('--- bar bg samples (light, inside bar, no glyph)');
let light=[];
for(let y=550;y<=553;y++)for(let x=668;x<=740;x++){const c=P(x,y);light.push([c[0]+c[1]+c[2],x,y,c]);}
light.sort((a,b)=>b[0]-a[0]);
for(const b of light.slice(0,8))console.log(b[1],b[2],b[3].join(','));
