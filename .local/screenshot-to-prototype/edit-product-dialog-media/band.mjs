import { readPng } from '../../../.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs';
const SRC='C:/Users/admin/.qoder-cn/tmp/D--projects-CAMEL-CAPTAIN/images/6710385f-0d10-4e9a-9c2a-5e8a599ccb70/02635610-e965-4299-aa2d-a6705a13054c.png';
const img=readPng(SRC);
const lum=(x,y)=>{const i=(y*img.width+x)*4;return (img.data[i]+img.data[i+1]+img.data[i+2])/3;};
console.log('-- band cols: min lum over y550..566 (band rows), look for non-photo edge');
for(let x=650;x<=760;x++){let mn=255,mx=0,s=0;for(let y=550;y<=566;y++){const l=lum(x,y);s+=l;if(l<mn)mn=l;if(l>mx)mx=l;}
  console.log(x,'avg',(s/17).toFixed(1),'min',mn.toFixed(0),'max',mx.toFixed(0));}
