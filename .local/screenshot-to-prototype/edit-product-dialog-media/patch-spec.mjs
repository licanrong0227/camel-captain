import fs from 'node:fs';
const F='src/prototypes/edit-product-dialog-media/.spec/spec.html';
let h=fs.readFileSync(F,'utf8');
const rep=(re,fn)=>{h=h.replace(re,(...a)=>fn(a));};
let n=0;
const bump=()=>n++;
// A. thumbs 50x50 -> 40x40, pitch 62 from 129
for(let i=0;i<10;i++){
  const oldTop=[127,190,253,316,379,442,505,568,631,694][i];
  h=h.replace(`data-reconstruction-id="thumb-${i+1}" data-asset-action="reuse" style="position:absolute;left:125px;top:${oldTop}px;width:50px;height:50px;`,
    `data-reconstruction-id="thumb-${i+1}" data-asset-action="reuse" style="position:absolute;left:125px;top:${129+i*62}px;width:40px;height:40px;`); bump();
}
for(let i=0;i<5;i++){
  const fl=664+i*110, nl=656+i*110;
  h=h.replace(`data-reconstruction-id="main-frame-${i+1}" data-asset-action="reconstruct-css" style="position:absolute;left:${fl}px;top:466px;width:92px;height:110px;background-color:#ffffff;border:1px solid #e6e6e6;`,
    `data-reconstruction-id="main-frame-${i+1}" data-asset-action="reconstruct-css" style="position:absolute;left:${nl}px;top:471px;width:100px;height:100px;background-color:#ffffff;border:2px solid #e6e6e6;`); bump();
  h=h.replace(`data-reconstruction-id="main-${i+1}" data-asset-action="reuse" style="position:absolute;left:${fl+6}px;top:471px;width:72px;height:100px;`,
    `data-reconstruction-id="main-${i+1}" data-asset-action="reuse" style="position:absolute;left:${nl+2}px;top:473px;width:96px;height:96px;`); bump();
  const bw=i<3?66:54, bl=nl+7;
  h=h.replace(`data-reconstruction-id="main-badge-bg-${i+1}" data-asset-action="reconstruct-css" style="position:absolute;left:${nl+14}px;top:551px;width:72px;height:17px;background-color:rgba(0, 0, 0, 0.45);`,
    `data-reconstruction-id="main-badge-bg-${i+1}" data-asset-action="reconstruct-css" style="position:absolute;left:${bl}px;top:550px;width:${bw}px;height:17px;background-color:rgba(255, 255, 255, 0.45);`); bump();
  h=h.replace(`data-reconstruction-id="main-badge-${i+1}" data-asset-action="none" style="position:absolute;left:${nl+14}px;top:551px;width:72px;height:17px;color:#ffffff;`,
    `data-reconstruction-id="main-badge-${i+1}" data-asset-action="none" style="position:absolute;left:${bl}px;top:550px;width:${bw}px;height:17px;color:#606266;`); bump();
}
h=h.replace('data-reconstruction-id="main-upload-tile" data-asset-action="reconstruct-css" style="position:absolute;left:546px;top:471px;width:112px;height:98px;',
  'data-reconstruction-id="main-upload-tile" data-asset-action="reconstruct-css" style="position:absolute;left:546px;top:471px;width:100px;height:100px;'); bump();
h=h.replace('data-reconstruction-id="promo-frame-1" data-asset-action="reconstruct-css" style="position:absolute;left:540px;top:709px;width:112px;height:68px;background-color:#ffffff;border:1px solid #e6e6e6;',
  'data-reconstruction-id="promo-frame-1" data-asset-action="reconstruct-css" style="position:absolute;left:546px;top:715px;width:100px;height:100px;background-color:#ffffff;border:2px solid #e6e6e6;'); bump();
h=h.replace('data-reconstruction-id="promo-1" data-asset-action="reuse" style="position:absolute;left:546px;top:715px;width:99px;height:62px;',
  'data-reconstruction-id="promo-1" data-asset-action="reuse" style="position:absolute;left:548px;top:717px;width:96px;height:60px;'); bump();
h=h.split('width:28px;height:23px;background-color:#ffffff;border:1px solid').join('width:28px;height:28px;background-color:#ffffff;border:1px solid');
fs.writeFileSync(F,h);
console.log('patched',n,'entries');
