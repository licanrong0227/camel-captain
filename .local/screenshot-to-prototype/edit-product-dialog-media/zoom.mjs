import { readPng, cropPng, writePng } from '../../../.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs';
const SRC='C:/Users/admin/.qoder-cn/tmp/D--projects-CAMEL-CAPTAIN/images/6710385f-0d10-4e9a-9c2a-5e8a599ccb70/02635610-e965-4299-aa2d-a6705a13054c.png';
const img=readPng(SRC);
const Z=6;
for(let k=0;k<5;k++){
  const bx=656+110*k;
  const c=cropPng(img,{x:bx,y:540,width:100,height:32});
  const o={width:c.width*Z,height:c.height*Z,data:Buffer.alloc(c.width*Z*c.height*Z*4),hasAlphaChannel:true};
  for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)for(let dy=0;dy<Z;dy++)for(let dx=0;dx<Z;dx++){
    const i=(y*c.width+x)*4, j=((y*Z+dy)*o.width+x*Z+dx)*4;
    o.data[j]=c.data[i];o.data[j+1]=c.data[i+1];o.data[j+2]=c.data[i+2];o.data[j+3]=255;
  }
  writePng(`zoom-band-${k}.png`,o);
}
console.log('ok');
