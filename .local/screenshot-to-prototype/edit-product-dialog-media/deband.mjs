import { readPng, cropPng, writePng } from '../../../.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs';
const SRC='C:/Users/admin/.qoder-cn/tmp/D--projects-CAMEL-CAPTAIN/images/6710385f-0d10-4e9a-9c2a-5e8a599ccb70/02635610-e965-4299-aa2d-a6705a13054c.png';
const ASSETS='D:/projects/CAMEL CAPTAIN/src/prototypes/edit-product-dialog-media/assets/';
const src=readPng(SRC);
const A=0.45;
// border color sample
{const i=(500*src.width+656)*4;console.log('border rgb',src.data[i],src.data[i+1],src.data[i+2]);}
function median3(arr){const s=[...arr].sort((a,b)=>a-b);return s[(s.length-1)>>1];}
function rebuild(k, x, y, w, h, out){
  const img=cropPng(src,{x,y,width:w,height:h});
  const d=img.data;
  const bandTop=77, bandBot=93; // interior rows
  const idx=(px,py)=>(py*img.width+px)*4;
  // 1) de-blend band rows
  for(let py=bandTop;py<=Math.min(bandBot,h-1);py++)for(let px=0;px<w;px++){
    const i=idx(px,py);
    for(let c=0;c<3;c++)d[i+c]=Math.max(0,Math.min(255,Math.round((d[i+c]-255*A)/(1-A))));
  }
  // 2) median filter band region to remove glyph strokes
  const copy=Buffer.from(d);
  const g=(p,i)=>copy[p+i];
  for(let py=bandTop;py<=Math.min(bandBot,h-1);py++)for(let px=0;px<w;px++){
    for(let c=0;c<3;c++){
      const win=[];
      for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){
        const qy=Math.max(0,Math.min(h-1,py+dy)), qx=Math.max(0,Math.min(w-1,px+dx));
        win.push(g(idx(qx,qy),c));
      }
      d[idx(px,py)+c]=median3(win);
    }
  }
  writePng(ASSETS+out, {width:img.width,height:img.height,data:d,hasAlphaChannel:true});
  console.log('wrote',out,img.width+'x'+img.height);
}
for(let k=0;k<5;k++) rebuild(k, 658+110*k, 473, 96, 96, `main-${k+1}.png`);
