import { readPng } from '../../../.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs';
const SRC='C:/Users/admin/.qoder-cn/tmp/D--projects-CAMEL-CAPTAIN/images/6710385f-0d10-4e9a-9c2a-5e8a599ccb70/02635610-e965-4299-aa2d-a6705a13054c.png';
const img=readPng(SRC);
const L=(x,y)=>{const i=(y*img.width+x)*4;return (img.data[i]+img.data[i+1]+img.data[i+2])/3;};
for(let k=0;k<5;k++){
  const bx=656+110*k;
  // border check
  const leftB=[L(bx,500),L(bx+1,500)].map(v=>v.toFixed(0)).join('/');
  const rightB=[L(bx+98,500),L(bx+99,500)].map(v=>v.toFixed(0)).join('/');
  // find band rows: first row (from 473) where avg jumps vs row 540
  let rows=[];
  for(let y=473;y<=570;y++){let s=0;for(let x=bx+2;x<bx+98;x++)s+=L(x,y);rows.push([y,s/96]);}
  const hi=rows.filter(r=>r[1]>190).map(r=>r[0]);
  console.log('frame',k,'x',bx,'borderL',leftB,'borderR',rightB,'top',rows[0][1].toFixed(0),'bandRows>190:',hi[0],'..',hi[hi.length-1]);
}
