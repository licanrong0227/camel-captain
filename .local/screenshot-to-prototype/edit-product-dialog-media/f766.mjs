import { readPng } from '../../../.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs';
const SRC='C:/Users/admin/.qoder-cn/tmp/D--projects-CAMEL-CAPTAIN/images/6710385f-0d10-4e9a-9c2a-5e8a599ccb70/02635610-e965-4299-aa2d-a6705a13054c.png';
const img=readPng(SRC);
const L=(x,y)=>{const i=(y*img.width+x)*4;return Math.round((img.data[i]+img.data[i+1]+img.data[i+2])/3);};
const bx=766;
let above='',inb='',below='';
for(let x=bx+1;x<bx+99;x++){above+=String(L(x,545)).padStart(4);inb+=String(L(x,552)).padStart(4);below+=String(L(x,568)).padStart(4);}
for(let i=0;i<98;i+=12)console.log('x'+(bx+1+i), '|ab',above.slice(i*4,i*4+48),'|bn',inb.slice(i*4,i*4+48),'|bt',below.slice(i*4,i*4+48));
