import { readPng } from '../../../.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs';
const img = readPng(process.argv[2]);
const at=(x,y)=>{const i=(y*img.width+x)*4;return [img.data[i],img.data[i+1],img.data[i+2]];};
const [x0,x1,y0,y1]=process.argv.slice(3).map(Number);
let run=null; const runs=[];
for(let y=y0;y<y1;y++){
  let hit=0;
  for(let x=x0;x<x1;x++){const[r,g,b]=at(x,y); if(255-Math.min(r,g,b)>25){hit++;}}
  const isThumb = hit > (x1-x0)*0.6;
  if(isThumb){ if(run) run.to=y; else {run={from:y,to:y}; runs.push(run);} } else { run=null; }
}
for(const r of runs) console.log(`thumb y ${r.from}..${r.to} (${r.to-r.from+1}px)`);
