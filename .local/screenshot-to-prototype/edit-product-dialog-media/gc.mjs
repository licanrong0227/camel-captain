import { readPng } from '../../../.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs';
const SRC='C:/Users/admin/.qoder-cn/tmp/D--projects-CAMEL-CAPTAIN/images/6710385f-0d10-4e9a-9c2a-5e8a599ccb70/02635610-e965-4299-aa2d-a6705a13054c.png';
const img=readPng(SRC);
const P=(x,y)=>{const i=(y*img.width+x)*4;return [img.data[i],img.data[i+1],img.data[i+2]];};
for(const [x0,x1] of [[666,700],[1105,1140]]){
  let arr=[];for(let y=553;y<=563;y++)for(let x=x0;x<=x1;x++){const c=P(x,y);arr.push({l:(c[0]+c[1]+c[2])/3,c,x,y});}
  arr.sort((a,b)=>a.l-b.l);
  console.log('range',x0,x1);
  for(const a of arr.slice(0,8))console.log(' ',a.x,a.y,a.c.join(','),a.l.toFixed(0));
}
