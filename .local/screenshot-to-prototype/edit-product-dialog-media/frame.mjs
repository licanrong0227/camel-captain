import { readPng } from '../../../.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs';
const SRC='C:/Users/admin/.qoder-cn/tmp/D--projects-CAMEL-CAPTAIN/images/6710385f-0d10-4e9a-9c2a-5e8a599ccb70/02635610-e965-4299-aa2d-a6705a13054c.png';
const img=readPng(SRC);
const lum=(x,y)=>{const i=(y*img.width+x)*4;return (img.data[i]+img.data[i+1]+img.data[i+2])/3;};
// row profile across x 660..750 to find frame vertical extent
console.log('rows:');
for(let y=455;y<=575;y++){let s=0,n=0,mx=0;for(let x=660;x<750;x++){const l=lum(x,y);s+=l;n++;if(l>mx)mx=l;}
  const avg=s/n; if(avg>248||y<470||y>545) console.log(y,avg.toFixed(1),mx.toFixed(0));}
console.log('cols at y=500:');
for(let x=645;x<=770;x++){const l=lum(x,500);if(l>248)console.log('white',x,l.toFixed(0));}
