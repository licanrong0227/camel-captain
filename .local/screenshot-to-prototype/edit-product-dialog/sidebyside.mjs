import { readPng, writePng, cropPng } from '../../../.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs';
const [,,srcP,renP,box,out]=process.argv;
const [x,y,w,h]=box.split(',').map(Number);
const a=cropPng(readPng(srcP),{x,y,width:w,height:h});
const b=cropPng(readPng(renP),{x,y,width:w,height:h});
const M={width:w*2+20,height:h,data:Buffer.alloc((w*2+20)*h*4)};
for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){
  const sa=(yy*a.width+xx)*4, ta=(yy*M.width+xx)*4;
  M.data.set(a.data.subarray(sa,sa+4),ta);
  const sb=(yy*b.width+xx)*4, tb=(yy*M.width+w+20+xx)*4;
  M.data.set(b.data.subarray(sb,sb+4),tb);
}
writePng(out,M);console.log(out);
