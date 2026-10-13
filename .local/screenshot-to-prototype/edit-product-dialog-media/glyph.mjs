import { readPng } from '../../../.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs';
const SRC='C:/Users/admin/.qoder-cn/tmp/D--projects-CAMEL-CAPTAIN/images/6710385f-0d10-4e9a-9c2a-5e8a599ccb70/02635610-e965-4299-aa2d-a6705a13054c.png';
const img=readPng(SRC);
const P=(x,y)=>{const i=(y*img.width+x)*4;return [img.data[i],img.data[i+1],img.data[i+2]];};
for(let y=553;y<=563;y++){let s='';for(let x=666;x<700;x++){const c=P(x,y);const l=(c[0]+c[1]+c[2])/3;
  s+= l<120?'#':(l<160?'+':(l<200?':':'.'));}
  console.log(y,s);}
console.log('samples of darkest in 666..700 x 553..563:');
let arr=[];for(let y=553;y<=563;y++)for(let x=666;x<700;x++){const c=P(x,y);arr.push([(c[0]+c[1]+c[2])/3,c,x,y]);}
arr.sort((a,b)=>a[0]-b[0]);for(const a of arr.slice(0,10))console.log(a[2].join(','),a[3],a[1]);
