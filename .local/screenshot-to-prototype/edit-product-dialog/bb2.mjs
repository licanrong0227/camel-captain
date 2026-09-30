import { readPng } from '../../../.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs';
const img = readPng(process.argv[2]);
const [x0,y0,x1,y1] = process.argv.slice(3,7).map(Number);
let L=1e9,T=1e9,R=-1,B=-1;
for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const i=(y*img.width+x)*4;const r=img.data[i],g=img.data[i+1],b=img.data[i+2];if(Math.abs(r-255)+Math.abs(g-255)+Math.abs(b-255)>30){if(x<L)L=x;if(x>R)R=x;if(y<T)T=y;if(y>B)B=y;}}
console.log({L,T,R,B,w:R-L+1,h:B-T+1});
