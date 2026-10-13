import { readPng } from '../../../.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs';
const SRC='C:/Users/admin/.qoder-cn/tmp/D--projects-CAMEL-CAPTAIN/images/6710385f-0d10-4e9a-9c2a-5e8a599ccb70/02635610-e965-4299-aa2d-a6705a13054c.png';
const img=readPng(SRC);
const P=(x,y)=>{const i=(y*img.width+x)*4;return [img.data[i],img.data[i+1],img.data[i+2]];};
for(const bx of [876,986,1096]){
 console.log('=== frame',bx);
 for(const y of [548,552,556,560,564,568,572]){let s='';for(let x=bx+2;x<bx+98;x++){const c=P(x,y);const l=(c[0]+c[1]+c[2])/3;
  s+= l<115?'#':(l<150?'+':(l<190?':':(l<230?'-':'.')));}
  console.log(String(y).padStart(4),s);}
}
