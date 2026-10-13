import { readPng } from '../../../.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs';
const SRC='C:/Users/admin/.qoder-cn/tmp/D--projects-CAMEL-CAPTAIN/images/6710385f-0d10-4e9a-9c2a-5e8a599ccb70/02635610-e965-4299-aa2d-a6705a13054c.png';
const src=readPng(SRC), cap=readPng(process.argv[2]);
function scan(img,name){
  console.log('===',name);
  const x0=650,y0=440,w=112,h=115;
  for(let y=540;y<=572;y++){
    let row=[];
    for(let x=x0;x<x0+w;x++){const i=(y*img.width+x)*4;row.push(Math.round((img.data[i]+img.data[i+1]+img.data[i+2])/3));}
    const mean=row.reduce((a,b)=>a+b,0)/row.length;
    // count luminance>=200 (light band)
    const light=row.filter(v=>v>=190).length;
    console.log(y,'mean',mean.toFixed(0),'min',Math.min(...row),'max',Math.max(...row),'lightPx',light);
  }
  // columns extent of light band at y=556
  const yy=556; let xs=[];
  for(let x=640;x<780;x++){const i=(yy*img.width+x)*4;const l=(img.data[i]+img.data[i+1]+img.data[i+2])/3;if(l>=170)xs.push(x);}
  console.log('light-cols@556 from',xs[0],'to',xs[xs.length-1],'count',xs.length);
}
scan(src,'SRC');scan(cap,'CAP');
