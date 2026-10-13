import { readPng } from '../../../.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs';
const SRC='C:/Users/admin/.qoder-cn/tmp/D--projects-CAMEL-CAPTAIN/images/6710385f-0d10-4e9a-9c2a-5e8a599ccb70/02635610-e965-4299-aa2d-a6705a13054c.png';
const img=readPng(SRC);
const L=(x,y)=>{const i=(y*img.width+x)*4;return (img.data[i]+img.data[i+1]+img.data[i+2])/3;};
for(const bx of [766,876,986,1096,656]){
  // top-edge step: mean(550..553) - mean(546..549)
  let s='';
  for(let x=bx+1;x<bx+99;x++){
    const a=(L(x,546)+L(x,547)+L(x,548)+L(x,549))/4, b=(L(x,550)+L(x,551)+L(x,552)+L(x,553))/4;
    const d=b-a; s+= d>15?'H':(d>4?'+':(d<-15?'L':'.'));
  }
  // bottom-edge step: mean(567..568) - mean(563..566)
  let t='';
  for(let x=bx+1;x<bx+99;x++){
    const a=(L(x,563)+L(x,564)+L(x,565)+L(x,566))/4, b=(L(x,567)+L(x,568))/2;
    const d=b-a; t+= d<-15?'L':(d<-4?'-':(d>15?'H':'.'));
  }
  console.log('frame',bx);
  console.log(' top ',s);
  console.log(' bot ',t);
}
