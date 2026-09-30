import { readPng, writePng, cropPng } from '../../../.agents/skills/screenshot-to-prototype/scripts/png-utils.mjs';

const [input, x, y, w, h, out] = process.argv.slice(2);
const img = readPng(input);
writePng(out, cropPng(img, { x: Number(x), y: Number(y), width: Number(w), height: Number(h) }));
console.log(out);
