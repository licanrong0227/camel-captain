import { readPng } from '../../../.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs';
const [srcP, renP, x0, y0, w, h] = process.argv.slice(2);
const a = readPng(srcP);
const b = readPng(renP);
const X0 = Number(x0), Y0 = Number(y0), W = Number(w), H = Number(h);
const px = (im, x, y) => { const i = (y * im.width + x) * 4; return [im.data[i], im.data[i + 1], im.data[i + 2]]; };
let best = null;
for (let dx = -3; dx <= 3; dx++) for (let dy = -3; dy <= 3; dy++) {
  let s = 0, n = 0;
  for (let y = Y0; y < Y0 + H; y++) for (let x = X0; x < X0 + W; x++) {
    const p = px(a, x, y), q = px(b, x + dx, y + dy);
    s += Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]) + Math.abs(p[2] - q[2]); n += 3;
  }
  const v = s / n;
  if (!best || v < best.v) best = { dx, dy, v };
}
const at0 = (() => { let s = 0, n = 0; for (let y = Y0; y < Y0 + H; y++) for (let x = X0; x < X0 + W; x++) { const p = px(a, x, y), q = px(b, x, y); s += Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]) + Math.abs(p[2] - q[2]); n += 3; } return (s / n).toFixed(2); })();
console.log(`region ${X0},${Y0} ${W}x${H}  now=${at0}  best dx=${best.dx} dy=${best.dy} diff=${best.v.toFixed(2)}`);
