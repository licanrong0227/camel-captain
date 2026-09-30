import { readPng } from '../../../.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs';
const img = readPng(process.argv[2]);
const [x0,y0,x1,y1,thr] = process.argv.slice(3,8).map(Number);
const rows=[];
for(let y=y0;y<y1;y++){
  const g=[];
  for(let x=x0;x<x1;x++){const i=(y*img.width+x)*4;const d=Math.abs(img.data[i]-255)+Math.abs(img.data[i+1]-255)+Math.abs(img.data[i+2]-255);if(d>thr){const last=g[g.length-1];if(last&&last.r>=x-8)last.r=x;else g.push({l:x,r:x});}}
  if(g.length)console.log(`y${y}: `+g.map(k=>`${k.l}..${k.r}`).join(' '));
}
