// Builds rating set D: shuffles the five trial-move levels of design.js into a blind order with neutral names,
// writes levels.js (same wrapper as set B), key.txt, and the shuffled levels and bot scripts into root/ so that
// root/tools/test.js, the forensics scripts (ROOT=root) and tools/human/run.js --root root all see the final set.
const fs = require('fs'), path = require('path');
const D = require('./design.js'), H = __dirname;
const clone = o => JSON.parse(JSON.stringify(o));
// fixed shuffle (seeded), redrawn until no level sits in its design position
let s = 13; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
let order;
for (;;) { order = D.LEVELS.map((_, i) => i).sort(() => rnd() - 0.5); if (order.every((v, k) => v !== k)) break; }
const out = order.map((i, k) => { const L = clone(D.LEVELS[i]); const key = L.key; delete L.key; L.name = 'Test ' + String(k + 1).padStart(2, '0'); L.key = key; return L; });
const scripts = order.map(i => D.SCRIPTS[i]);
fs.writeFileSync(path.join(H, 'levels.js'), '(function (root) { root.OMT_LEVELS = ' + JSON.stringify(out) + '; })(typeof window !== "undefined" ? window : globalThis);\n');
fs.writeFileSync(path.join(H, 'scripts.js'), '// bot routes for levels.js, one array per level in the same (shuffled) order; format of tools/scripts/packN.js\nmodule.exports = ' + JSON.stringify(scripts, null, 1) + ';\n');
fs.writeFileSync(path.join(H, 'root/one-man-team/js/levels/pack1.js'), fs.readFileSync(path.join(H, 'levels.js')));
fs.writeFileSync(path.join(H, 'root/tools/scripts/pack1.js'), 'module.exports = ' + JSON.stringify(scripts) + ';\n');
const key = out.map(L => { const def = L.def, dec = L.att.filter(a => a.role === 'decoy').length;
  return `${L.name} = ${L.key}  (clock ${L.time}s, ${L.att.filter(a => a.role === 'ball').length} ball players, defenders ${def.length} + keeper, decoys ${dec})`; }).join('\n');
fs.writeFileSync(path.join(H, 'key.txt'), 'Rating set D: blind key (do not show the owner before he has rated)\n' + key + '\n');
console.log(key);
