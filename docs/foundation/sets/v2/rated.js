// Every level the owner rated in sets A-E, on the engine he played it on, with his takes; measured with the generator's
// own tools (lab.analyse, check.windows) on its bot route, and the human model (owner profile).
//   node rated.js OUT.json [N]
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const REPO = '/home/claude/ollywoodgames.github.io';
const lab = require(REPO + '/tools/gen/lab.js'), K = require(REPO + '/tools/gen/check.js');
const FB = lab.FB;
function load(files) { const ctx = { window: {} }; ctx.self = ctx.window; ctx.globalThis = ctx.window; vm.createContext(ctx);
  for (const f of files) vm.runInContext(fs.readFileSync(f, 'utf8').replace(/\(typeof window[^)]*\)|\(this\)|\(window\)/g, '(window)'), ctx); return JSON.parse(JSON.stringify(ctx.window.OMT_LEVELS)); }
const BASE = load([1, 2, 3].map(n => '/home/claude/sets/base/pack' + n + '.js'));
const BS = [].concat(...[1, 2, 3].map(n => require('/home/claude/baseline/tools/scripts/pack' + n + '.js')));
const LIVE = load([1, 2, 3, 4, 5, 6, 7, 8].map(n => REPO + '/one-man-team/js/levels/pack' + n + '.js'));
const LS = [].concat(...[1, 2, 3, 4, 5, 6, 7, 8].map(n => require(REPO + '/tools/scripts/pack' + n + '.js')));
const D = load([REPO + '/docs/foundation/sets/setD-levels.js']), DS = require(REPO + '/docs/foundation/sets/setD-scripts.js');
const E = load([REPO + '/docs/foundation/sets/setE-levels.js']), ES = require(REPO + '/docs/foundation/sets/setE-scripts.js');
// the engine he played each set on (everything added since then switched off)
const OLD = { recSpd: 0, dangerR: 0, gkBisect: 0, gkNear: 0, markLeash: 0, shotPace: 1, gkCollect: 0 };
const ENG = { A: OLD, B: OLD, C: OLD, D: { shotPace: 1, gkCollect: 0 }, E: { gkCollect: 0 } };
const clone = o => JSON.parse(JSON.stringify(o));
const rows = [];
const add = (set, test, label, L0, sc, takes, first, extraEng, time) => {
  const L = clone(L0); L.engine = Object.assign({}, ENG[set], L.engine || {}, extraEng || {}); if (time) L.time = time;
  delete L._pack; rows.push({ set, test, label, L, sc, takes, first });
};
const A_TAKES = [1, 1, 1, 2, 4, 2, 2, 3, 12, 3, 2, 1, 13, 5, 5, 3, 7, 6, 15, 14];
BASE.forEach((L, i) => add('A', i + 1, 'baseline ' + (i + 1), L, BS[i], A_TAKES[i], true));
const cover = L => { L = clone(L); L.def.push({ t: 'zone', x: 25, y: 10, spd: 5.4, eng: 7, agg: 0.8, leash: 9 }); return L; };
[['01', '13', BASE[12], BS[12], 6], ['02', '10 + cover', cover(BASE[9]), BS[9], 11], ['03', '18', BASE[17], BS[17], 1], ['04', '10', BASE[9], BS[9], 3],
 ['05', '19', BASE[18], BS[18], 20], ['08', '9 + 2 s', BASE[8], BS[8], 7, BASE[8].time + 2], ['09', '20', BASE[19], BS[19], 6], ['10', '9', BASE[8], BS[8], 15],
 ['11', 'today 60', LIVE[59], LS[59], 4], ['12', '20 + 2 s', BASE[19], BS[19], 1, BASE[19].time + 2]]
  .forEach(([t, lab2, L, sc, k, time]) => add('B', t, lab2, L, sc, k, false, null, time));
const A = { recSpd: 7.0, dangerR: 24 }, AB = { recSpd: 7.0, dangerR: 24, gkBisect: 1, gkNear: 0.2 };
const SRC = { '19': [BASE[18], BS[18]], '13': [BASE[12], BS[12]], '10': [BASE[9], BS[9]], 'today 60': [LIVE[59], LS[59]] };
[['01', '19', 'as now', 8], ['02', '13', 'A+B', 3], ['03', '10', 'A+B', 12], ['04', 'today 60', 'as now', 5], ['05', '19', 'A+B', 7], ['06', '13', 'as now', 2],
 ['07', 'today 60', 'A+B', 1], ['08', '19', 'A', 3], ['09', '10', 'A', 2], ['10', 'today 60', 'A', 2], ['11', '13', 'A', 1], ['12', '10', 'as now', 4]]
  .forEach(([t, f, v, k]) => add('C', t, f + ' ' + v, SRC[f][0], SRC[f][1], k, false, v === 'A' ? A : v === 'A+B' ? AB : null));
[1, 4, 5, 4, 10].forEach((k, i) => add('D', String(i + 1).padStart(2, '0'), D[i].key || ('D' + (i + 1)), D[i], DS[i], k, true));
const ETAKES = [2, 9, 4, 7, 1, 6, 15, 29, 2, 3], EHAND = [4, 9];   // tests 04 and 09 are the hand-built controls (replays)
E.forEach((L, i) => add('E', String(i + 1).padStart(2, '0'), L.key || ('E' + (i + 1)), L, ES[i], ETAKES[i], !EHAND.includes(i + 1)));

const N = +(process.argv[3] || 60), out = [];
const t0 = Date.now();
rows.forEach((r, ri) => {
  const L = r.L, o = { set: r.set, test: r.test, label: r.label, takes: r.takes, first: r.first, clock: L.time, nDef: L.def.length,
    spd: +(L.def.reduce((s, d) => s + (d.spd === undefined ? 5.2 : d.spd), 0) / L.def.length).toFixed(2), rounds: L.order.length };
  const sol = lab.solve(L, r.sc);
  o.route = sol.ok;
  if (sol.ok) {
    o.bot = +sol.time.toFixed(2); o.ratio = +(sol.time / L.time).toFixed(3);
    const { ev } = lab.analyse(L, sol.recs);
    const passes = ev.filter(e => e.rnum !== null && e.recv !== undefined);
    o.laneMin = +Math.min(...passes.map(e => e.lane)).toFixed(2);
    const rec = passes.map(e => e.press).filter(v => v !== undefined && v < 99);
    o.recvMin = rec.length ? +Math.min(...rec).toFixed(2) : null;
    o.j1 = passes.filter(e => e.lane <= 2.0).length + passes.slice(0, -1).filter(e => e.press <= 3.5).length;
    const W = K.windows(L, r.sc, sol);
    o.j2 = 0; o.spareTight = 0;
    W.forEach(w => { if (w.last) return; if (w.aim && w.aim.w < 15) o.j2++; if (w.power && w.power.w < 0.25) o.j2++; if (w.timing && w.timing.width < 1) o.j2++; if (w.dwell !== undefined && w.dwell < 0.6) o.spareTight++; });
    o.aimMin = Math.min(...W.filter(w => !w.last && w.aim).map(w => w.aim.w));
    // the finish from the owner's range: the finisher's own run until he has it, then straight at goal to 18 m, stand and aim
    const last = L.order.length - 1;
    const pr = K.ownerProbe(L, r.sc, sol.pre[last], last, 18, true);
    if (pr.ok) { o.recvDist = pr.recvDist; o.lostStand = pr.lostAfterStand; o.lostRecv = pr.lostAfterRecv; o.open18 = pr.open0; o.corner18 = pr.cornerOpen; }
    const fr = sol.recs[L.order[last]]; if (fr) { const k = fr.len - 1; o.finX = +fr.x[k].toFixed(1); o.finY = +fr.y[k].toFixed(1); o.angle = +(Math.atan2(Math.abs(fr.x[k] - 25), fr.y[k]) * 180 / Math.PI).toFixed(0); }
  }
  const m = K.model(L, { n: N });
  o.model = m.median; o.modelMiddle = +m.middle.toFixed(2); o.modelCleared = m.cleared;
  out.push(o);
  console.error(`${ri + 1}/${rows.length} ${r.set}${r.test} ${r.label}: takes ${r.takes}, model ${m.median}, route ${sol.ok}, ${((Date.now() - t0) / 1000).toFixed(0)}s`);
});
fs.writeFileSync(process.argv[2], JSON.stringify(out, null, 1));
