import { readPng } from '../../../.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs';
const img = readPng(process.argv[2]);
const [x0,y0,x1,y1] = process.argv.slice(3,7).map(Number);
const rows=[];
for(let y=y0;y<y1;y++){
  let hit=false;
  for(let x=x0;x<x1;x++){const i=(y*img.width+x)*4;const r=img.data[i],g=img.data[i+1],b=img.data[i+2];if(Math.abs(r-255)+Math.abs(g-255)+Math.abs(b-255)>40){hit=true;break;}}
  if(hit){const last=rows[rows.length-1];if(last&&last.b>=y-2){last.b=y;}else rows.push({t:y,b:y});}
}
console.log(rows.map(g=>`${g.t}..${g.b} (h${g.b-g.t+1})`).join('\n'));
