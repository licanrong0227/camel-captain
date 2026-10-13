import { readPng } from '../../../.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs';
const SRC='C:/Users/admin/.qoder-cn/tmp/D--projects-CAMEL-CAPTAIN/images/6710385f-0d10-4e9a-9c2a-5e8a599ccb70/02635610-e965-4299-aa2d-a6705a13054c.png';
const img=readPng(SRC);
const lum=(x,y)=>{const i=(y*img.width+x)*4;return (img.data[i]+img.data[i+1]+img.data[i+2])/3;};
console.log('-- rows 468..486 avg over x656..756');
for(let y=468;y<=486;y++){let s=0;for(let x=656;x<756;x++)s+=lum(x,y);console.log(y,(s/100).toFixed(1));}
console.log('-- cols avg over y480..540');
for(let x=648;x<=772;x++){let s=0;for(let y=480;y<540;y++)s+=lum(x,y);console.log(x,(s/60).toFixed(1));}
