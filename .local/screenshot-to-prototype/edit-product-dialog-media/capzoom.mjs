import { readPng, cropPng, writePng } from '../../../.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs';
const img=readPng(process.argv[2]);
const Z=6;
const c=cropPng(img,{x:Number(process.argv[3]),y:Number(process.argv[4]),width:100,height:32});
const o={width:c.width*Z,height:c.height*Z,data:Buffer.alloc(c.width*Z*c.height*Z*4),hasAlphaChannel:true};
for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)for(let dy=0;dy<Z;dy++)for(let dx=0;dx<Z;dx++){
  const i=(y*c.width+x)*4,j=((y*Z+dy)*o.width+x*Z+dx)*4;
  o.data[j]=c.data[i];o.data[j+1]=c.data[i+1];o.data[j+2]=c.data[i+2];o.data[j+3]=255;}
writePng(process.argv[5],o);console.log('ok');
