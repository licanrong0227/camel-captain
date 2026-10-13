import { readPng } from '../../../.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs';
const SRC='C:/Users/admin/.qoder-cn/tmp/D--projects-CAMEL-CAPTAIN/images/6710385f-0d10-4e9a-9c2a-5e8a599ccb70/02635610-e965-4299-aa2d-a6705a13054c.png';
const img=readPng(SRC);
const L=(x,y)=>{const i=(y*img.width+x)*4;return Math.round((img.data[i]+img.data[i+1]+img.data[i+2])/3);};
console.log('cols (border=230) avg over y715..760:');
for(let x=534;x<=660;x++){let s=0;for(let y=715;y<760;y++)s+=L(x,y);const v=s/45;if(v>225&&v<240)console.log('x',x,v.toFixed(0));}
console.log('rows avg over x552..646:');
for(let y=700;y<=790;y++){let s=0;for(let x=552;x<646;x++)s+=L(x,y);const v=s/94;console.log(y,v.toFixed(0));}
