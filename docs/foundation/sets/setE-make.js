// Builds rating set E: eight generated levels (tools/gen, RULEBOOK.md version 1) and two hand-built controls from the
// baseline he knows well (Five-man move, baseline 19; Beat the trap, baseline 13), blind with neutral names in a seeded
// shuffled order. Writes, next to this file:
//   design.json          the ten levels and bot routes in design order, with how each was made (template, band, seed)
//   levels.js            the blind set for the build (names Test 01-10, no key inside)
//   scripts.js           bot routes for levels.js, same order (tools/scripts/packN.js format)
//   key.txt              the key
//   root/                live sim.js and tools with the set as pack1.js, so root/tools/test.js and
//                        tools/human/run.js --root root see exactly what the owner plays
// node make.js
'use strict';
const fs = require('fs'), path = require('path');
const REPO = '/home/claude/ollywoodgames.github.io', H = __dirname;
const G = require(REPO + '/tools/gen/generate.js');
const lab = require(REPO + '/tools/gen/lab.js');
const { makeRng } = require(REPO + '/tools/gen/rng.js');
const clone = o => JSON.parse(JSON.stringify(o));

// The generated eight: seven ordinary levels from seven templates (three tier 1, four tier 2) and one closing level.
// For each, the first seed from 501 upwards that the generator accepts (every automatic check of 8.1 passed).
const PICKS = [
  { template: 'bend', band: 'ordinary' },
  { template: 'trap', band: 'ordinary' },
  { template: 'third', band: 'ordinary' },
  { template: 'inside', band: 'ordinary' },
  { template: 'shortlong', band: 'ordinary' },
  { template: 'falsenine', band: 'ordinary' },
  { template: 'press', band: 'ordinary' },
  { template: 'five', band: 'closing' }
];
const design = [];
for (const pk of PICKS) {
  let got = null;
  for (let seed = 501; seed < 541 && !got; seed++) {
    const r = G.generate({ seed, band: pk.band, template: pk.template, maxAttempts: 1 });
    if (r.ok) got = { r, seed };
  }
  if (!got) throw new Error('no level for ' + pk.template);
  const r = got.r;
  design.push({ key: `generated: ${r.meta.templateName} (tier ${r.meta.tier}, ${pk.band} band, seed ${got.seed})`, kind: 'generated', template: r.meta.templateName, band: pk.band, seed: got.seed,
    level: r.level, script: r.script, meta: r.meta, checks: { dynamic: r.checks.dynamic, final: Object.assign({}, r.checks.final, { A6: r.checks.final.A6 }) } });
  console.log('picked', r.meta.templateName, pk.band, 'seed', got.seed, 'clock', r.level.time, 'model', r.checks.final.A6.median);
}
// The two controls, exactly as in the baseline (clock 12 s), on the live engine (A, B and the hand-over on)
global.OMT_LEVELS = []; require('/home/claude/baseline/one-man-team/js/levels/pack3.js');
const BASE = global.OMT_LEVELS.slice(), BS = require('/home/claude/baseline/tools/scripts/pack3.js');
for (const [i, nm] of [[6, 'Five-man move'], [0, 'Beat the trap']]) {
  const L = clone(BASE[i]); delete L._pack;
  const sol = lab.solve(L, BS[i]); if (!sol.ok) throw new Error('control fails: ' + nm);
  design.push({ key: `hand-built control: ${nm} (baseline ${i === 6 ? 19 : 13}, clock ${L.time} s)`, kind: 'control', template: nm, level: L, script: BS[i] });
}
fs.writeFileSync(path.join(H, 'design.json'), JSON.stringify(design, null, 1));

// blind order: seeded shuffle, redrawn until the two controls are not next to each other and no test sits first
// in design order
const rng = makeRng(20261126);
let order;
for (;;) {
  order = rng.shuffle(design.map((_, i) => i));
  const c = order.map(i => design[i].kind === 'control');
  if (!c.some((v, k) => v && c[k + 1]) && order[0] !== 0) break;
}
const out = order.map((i, k) => { const L = clone(design[i].level); L.name = 'Test ' + String(k + 1).padStart(2, '0'); return L; });
const scripts = order.map(i => design[i].script);
const levelsJs = '(function (root) { root.OMT_LEVELS = ' + JSON.stringify(out) + '; })(typeof window !== "undefined" ? window : globalThis);\n';
fs.writeFileSync(path.join(H, 'levels.js'), levelsJs);
fs.writeFileSync(path.join(H, 'scripts.js'), '// bot routes for levels.js, one array per level in the same (shuffled) order; format of tools/scripts/packN.js\nmodule.exports = ' + JSON.stringify(scripts, null, 1) + ';\n');
const R = path.join(H, 'root');
for (const d of ['one-man-team/js/levels', 'tools/scripts']) fs.mkdirSync(path.join(R, d), { recursive: true });
fs.copyFileSync(REPO + '/one-man-team/js/sim.js', path.join(R, 'one-man-team/js/sim.js'));
for (const f of ['load.js', 'bots.js', 'test.js']) fs.copyFileSync(REPO + '/tools/' + f, path.join(R, 'tools', f));
fs.writeFileSync(path.join(R, 'one-man-team/js/levels/pack1.js'), levelsJs);
fs.writeFileSync(path.join(R, 'tools/scripts/pack1.js'), 'module.exports = ' + JSON.stringify(scripts) + ';\n');
const key = order.map((i, k) => { const d = design[i], L = d.level; return `Test ${String(k + 1).padStart(2, '0')} = ${d.key}; clock ${L.time} s, ${L.order.filter(j => L.att[j].role === 'ball').length} ball players, ${L.def.length} defenders + keeper, decoys ${L.att.filter(a => a.role === 'decoy').length}`; }).join('\n');
fs.writeFileSync(path.join(H, 'key.txt'), 'Rating set E: blind key (do not show the owner before he has rated)\n' + key + '\n');
console.log(key);
