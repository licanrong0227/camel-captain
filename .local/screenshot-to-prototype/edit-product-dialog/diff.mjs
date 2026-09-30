import { readPng } from '../../../.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs';
const a = readPng(process.argv[2]);
const b = readPng(process.argv[3]);
const W = Math.min(a.width,b.width), H = Math.min(a.height,b.height);
const at=(im,x,y)=>{const i=(y*im.width+x)*4;return [im.data[i],im.data[i+1],im.data[i+2]];};
const T=32, cols=Math.ceil(W/T), rows=Math.ceil(H/T);
const tiles=[];
for(let ty=0;ty<rows;ty++)for(let tx=0;tx<cols;tx++){
  let s=0,n=0;
  for(let y=ty*T;y<Math.min(H,(ty+1)*T);y+=2)for(let x=tx*T;x<Math.min(W,(tx+1)*T);x+=2){
    const p=at(a,x,y),q=at(b,x,y);s+=Math.abs(p[0]-q[0])+Math.abs(p[1]-q[1])+Math.abs(p[2]-q[2]);n++;
  }
  tiles.push({x:tx*T,y:ty*T,d:s/Math.max(1,n)});
}
tiles.sort((p,q)=>q.d-p.d);
console.log('worst tiles (x,y,meanAbsDiffPerChannel*3):');
for(const t of tiles.slice(0,25))console.log(`  ${t.x},${t.y}  ${(t.d/3).toFixed(1)}`);
console.log('total mean diff:', (tiles.reduce((s,t)=>s+t.d,0)/tiles.length/3).toFixed(2));
