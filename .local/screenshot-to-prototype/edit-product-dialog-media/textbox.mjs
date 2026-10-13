import { readPng } from '../../../.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs';
const SRC='C:/Users/admin/.qoder-cn/tmp/D--projects-CAMEL-CAPTAIN/images/6710385f-0d10-4e9a-9c2a-5e8a599ccb70/02635610-e965-4299-aa2d-a6705a13054c.png';
const img=readPng(SRC);
const L=(x,y)=>{const i=(y*img.width+x)*4;return (img.data[i]+img.data[i+1]+img.data[i+2])/3;};
for(const bx of [656,766,876,986,1096]){
  console.log('=== frame',bx);
  for(let y=548;y<=568;y++){
    let n=0,xs=[];for(let x=bx+2;x<bx+98;x++){if(L(x,y)<125){n++;xs.push(x);}}
    console.log(y,'dark',n, xs.length?xs[0]+'..'+xs[xs.length-1]:'');
  }
  // vertical profile of band-left region: column scan at y=558 for exact band edges using lift over white photo bg
  let edges=[];for(let x=bx+1;x<bx+99;x++){if(L(x,558)<253&&L(x,552)<253)edges.push(x);}
  console.log('nonwhite cols in band:',edges[0],'..',edges[edges.length-1]);
}
