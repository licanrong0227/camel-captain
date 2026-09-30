import { readPng } from '../../../.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs';

const img = readPng(process.argv[2]);
const { width, height, data } = img;
const at = (x, y) => {
  const i = (y * width + x) * 4;
  return [data[i], data[i + 1], data[i + 2]];
};
const key = (p) => p.map((v) => Math.round(v / 8) * 8).join(',');

function runs(line, from, to) {
  const out = [];
  let cur = null;
  for (let i = from; i < to; i++) {
    const k = key(line(i));
    if (!cur || cur.k !== k) {
      if (cur && cur.to - cur.from >= 1) out.push(cur);
      cur = { k, from: i, to: i, p: line(i) };
    } else {
      cur.to = i;
    }
  }
  if (cur && cur.to - cur.from >= 1) out.push(cur);
  return out;
}

for (const spec of process.argv.slice(3)) {
  const [kind, idx, from, to] = spec.split(':');
  const f = Number(from ?? 0);
  const t = Number(to ?? (kind === 'row' ? width : height));
  console.log(`--- ${kind} ${idx} [${f},${t}) ---`);
  for (const r of runs(kind === 'row' ? (i) => at(i, Number(idx)) : (i) => at(Number(idx), i), f, t)) {
    console.log(`${r.from}..${r.to} (${r.to - r.from + 1}px) rgb(${r.p.join(',')})`);
  }
}
