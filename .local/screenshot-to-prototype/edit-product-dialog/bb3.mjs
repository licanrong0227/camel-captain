import { readPng } from '../../../.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs';
const img = readPng(process.argv[2]);
const [x0,y0,x1,y1] = process.argv.slice(3,7).map(Number);
const groups=[];
for(let x=x0;x<x1;x++){
  let hit=false;
  for(let y=y0;y<y1;y++){const i=(y*img.width+x)*4;const r=img.data[i],g=img.data[i+1],b=img.data[i+2];if(Math.abs(r-255)+Math.abs(g-255)+Math.abs(b-255)>40){hit=true;break;}}
  if(hit){const last=groups[groups.length-1];if(last&&last.r>=x-6){last.r=x;}else groups.push({l:x,r:x});}
}
console.log(groups.map(g=>`${g.l}..${g.r} (w${g.r-g.l+1})`).join('\n'));
