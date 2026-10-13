import { readPng } from '../../../.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs';
const SRC='C:/Users/admin/.qoder-cn/tmp/D--projects-CAMEL-CAPTAIN/images/6710385f-0d10-4e9a-9c2a-5e8a599ccb70/02635610-e965-4299-aa2d-a6705a13054c.png';
const img=readPng(SRC);
const L=(x,y)=>{const i=(y*img.width+x)*4;return (img.data[i]+img.data[i+1]+img.data[i+2])/3;};
for(const bx of [986,1096,766,876]){
  console.log('=== frame x',bx);
  let s='';
  for(let x=bx+1;x<bx+100;x++){
    const above=(L(x,544)+L(x,545)+L(x,546))/3, inb=(L(x,558)+L(x,559)+L(x,560))/3;
    const d=inb-above;
    s+= (d>8?'H':(d<-8?'l':'.'));
  }
  console.log('lift pattern (H=band lifted):');
  console.log(s,' cols',bx+1,'..',bx+99);
}
