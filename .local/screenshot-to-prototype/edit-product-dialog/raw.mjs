import { readPng } from '../../../.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs';
const img = readPng(process.argv[2]);
const at = (x, y) => { const i = (y * img.width + x) * 4; return `${img.data[i]},${img.data[i+1]},${img.data[i+2]}`; };
for (const spec of process.argv.slice(3)) {
  const [kind, idx, from, to] = spec.split(':');
  const f = Number(from), t = Number(to);
  const out = [];
  for (let i = f; i < t; i++) out.push(`${i}=${kind === 'row' ? at(i, Number(idx)) : at(Number(idx), i)}`);
  console.log(`${kind}${idx}: ` + out.join(' '));
}
