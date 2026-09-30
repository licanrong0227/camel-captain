import { readPng } from '../../../.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs';
const img = readPng(process.argv[2]);
const [x0,y0,x1,y1] = process.argv.slice(3).map(Number);
const at=(x,y)=>{const i=(y*img.width+x)*4;return [img.data[i],img.data[i+1],img.data[i+2]];};
let minX=1e9,maxX=-1,minY=1e9,maxY=-1;
for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const[r,g,b]=at(x,y);if(b>180&&r<140&&g>110&&g<200){minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}}
console.log(`blue bbox x ${minX}..${maxX} y ${minY}..${maxY}`);
