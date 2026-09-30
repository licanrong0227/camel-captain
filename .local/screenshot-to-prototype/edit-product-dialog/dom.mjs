import { readPng } from '../../../.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs';
const img = readPng(process.argv[2]);
const [x0,y0,x1,y1] = process.argv.slice(3,7).map(Number);
const m=new Map();
for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const i=(y*img.width+x)*4;const r=img.data[i],g=img.data[i+1],b=img.data[i+2];if(r>250&&g>250&&b>250)continue;const k=`${r},${g},${b}`;m.set(k,(m.get(k)||0)+1);}
const a=[...m].sort((p,q)=>q[1]-p[1]).slice(0,8);
console.log(a.map(([k,v])=>`rgb(${k}) x${v}`).join('\n'));
