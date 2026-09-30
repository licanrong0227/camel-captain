import { readPng } from '../../../.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs';
const img = readPng(process.argv[2]);
const [x0,y0,x1,y1,mode,thr]=process.argv.slice(3,9).map(Number);
const ink=(p)=> mode===1 ? (255-p[0])*3>thr : (Math.abs(p[0]-255)+Math.abs(p[1]-255)+Math.abs(p[2]-255))>thr;
const at=(x,y)=>{const i=(y*img.width+x)*4;return [img.data[i],img.data[i+1],img.data[i+2]];};
if(mode===2){ // white text on colored bg
}
let L=1e9,T=1e9,R=-1,B=-1,n=0;
for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const p=at(x,y);const dark=(p[0]+p[1]+p[2])/3;const hit = mode===1? dark<thr : dark>thr; if(hit){n++;if(x<L)L=x;if(x>R)R=x;if(y<T)T=y;if(y>B)B=y;}}
console.log({L,T,R,B,w:R-L+1,h:B-T+1,n});
