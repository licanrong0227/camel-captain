import { readPng } from '../../../.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs';
const img = readPng(process.argv[2]);
const at=(x,y)=>{const i=(y*img.width+x)*4;return [img.data[i],img.data[i+1],img.data[i+2]];};
const [kind,idx,from,to]=process.argv.slice(3);
const f=Number(from),t=Number(to);
let run=null;const runs=[];
for(let i=f;i<t;i++){const[r,g,b]=at(...(kind==='row'?[i,Number(idx)]:[Number(idx),i]));
 const hit=Math.abs(r-g)<6&&Math.abs(g-b)<6&&r>150&&r<235;
 if(hit){if(run)run.to=i;else{run={from:i,to:i};runs.push(run);}}else run=null;}
console.log(runs.map(r=>`${r.from}..${r.to}(${r.to-r.from+1})`).join(' '));
