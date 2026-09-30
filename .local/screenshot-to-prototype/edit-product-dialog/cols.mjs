import { readPng } from '../../../.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs';
const img = readPng(process.argv[2]);
const [x0,y0,x1,y1,mode]=process.argv.slice(3,8).map(Number);
let s='';
for(let x=x0;x<x1;x++){let hit=false;for(let y=y0;y<y1;y++){const i=(y*img.width+x)*4;const p=[img.data[i],img.data[i+1],img.data[i+2]];const avg=(p[0]+p[1]+p[2])/3;const bg = mode===1? 255:135; if(Math.abs(avg-bg)>25){hit=true;break;}}s+=hit?'#':'.';}
console.log(s);
