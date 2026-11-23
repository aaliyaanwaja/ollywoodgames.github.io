// Fits the simulated person to the owner's own takes on the original 20 (docs/foundation/06-owner-ratings-set-A.md).
//
//   node tools/human/calibrate.js                      grid over the two skill dials, hold-out check, noise ceiling
//   node tools/human/calibrate.js --hands 2.5 --head 2 just report one setting
// Options: --root DIR (default /home/claude/baseline)  --n N people per setting (default 24)  --seed S
//          --grid "1.5,2,2.5:0.5,1,1.5,2"   hands values : head values (this is the default)
//
// Two numbers are fitted, nothing else: `hands` (execution) and `head` (judgement), see skillAt() in player.js.
// The fit minimises the squared error in log takes (model geometric mean v. owner) on 15 training fixtures; fixtures
// 4, 8, 12, 16 and 20 are held out and only scored afterwards. Everything is seeded. (The production `owner` profile in
// player.js was then refitted on all 20 plus the owner's ~2 takes on today's 60: see docs/foundation/04-human-model.md.)
'use strict';
const path = require('path');
const H = require('./player.js');
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const root = path.resolve(opt('root', '/home/claude/baseline'));
const N = +opt('n', 24), SEED = +opt('seed', 1), MAX = 60;
const OWNER = [1, 1, 1, 2, 4, 2, 2, 3, 12, 3, 2, 1, 13, 5, 5, 3, 7, 6, 15, 14];
const HOLD = [4, 8, 12, 16, 20];
const env = H.load(root);
if (env.LEVELS.length !== 20) { console.log('expected the original 20 fixtures at ' + root); process.exit(1); }

function rank(a) { const ix = a.map((v, i) => [v, i]).sort((x, y) => x[0] - y[0]), r = new Array(a.length); let i = 0; while (i < ix.length) { let j = i; while (j + 1 < ix.length && ix[j + 1][0] === ix[i][0]) j++; for (let k = i; k <= j; k++) r[ix[k][1]] = (i + j) / 2 + 1; i = j + 1; } return r; }
function pearson(a, b) { const n = a.length, ma = a.reduce((s, v) => s + v, 0) / n, mb = b.reduce((s, v) => s + v, 0) / n; let ab = 0, aa = 0, bb = 0; for (let i = 0; i < n; i++) { ab += (a[i] - ma) * (b[i] - mb); aa += (a[i] - ma) ** 2; bb += (b[i] - mb) ** 2; } return ab / Math.sqrt(aa * bb); }
const spearman = (a, b) => pearson(rank(a), rank(b));
const median = a => { const b = a.slice().sort((x, y) => x - y), n = b.length; return n % 2 ? b[n >> 1] : (b[n / 2 - 1] + b[n / 2]) / 2; };
const gmean = a => Math.exp(a.reduce((s, v) => s + Math.log(v), 0) / a.length);

function evaluate(hands, head) {
  const sk = H.skillAt(hands, head), per = [];
  for (let li = 0; li < 20; li++) {
    const takes = [];
    for (let k = 0; k < N; k++) {
      const r = H.playLevel(env, li, sk, (SEED * 2654435761 + k * 9973 + (li + 1) * 7477 + 1) >>> 0, { maxTakes: MAX });
      takes.push(r.cleared ? r.takes : MAX + 1);
    }
    per.push(takes);
  }
  const med = per.map(median), gm = per.map(gmean);
  const err = li => (Math.log(gm[li]) - Math.log(OWNER[li])) ** 2;
  const train = [], hold = [];
  for (let li = 0; li < 20; li++) (HOLD.includes(li + 1) ? hold : train).push(err(li));
  const mean = a => a.reduce((s, v) => s + v, 0) / a.length;
  return { hands, head, per, med, gm, lossTrain: mean(train), lossHold: mean(hold), lossAll: mean(train.concat(hold)),
    rhoMed: spearman(OWNER, med), rhoGm: spearman(OWNER, gm), rhoTrain: spearman(OWNER.filter((_, i) => !HOLD.includes(i + 1)), gm.filter((_, i) => !HOLD.includes(i + 1))) };
}

// What rank correlation would a PERFECT model get? The owner played each fixture once, so his count is one draw from
// a wide spread. Draw one "owner" per fixture from the model's own people and correlate with the model's medians.
function ceiling(res) {
  const g = H.makeRng(SEED + 99), rhos = [];
  for (let k = 0; k < 2000; k++) { const one = res.per.map(t => t[g.int(t.length)]); rhos.push(spearman(one, res.med)); }
  rhos.sort((a, b) => a - b);
  return { p05: rhos[100], p50: rhos[1000], p95: rhos[1900] };
}

const t0 = Date.now();
let grid;
if (opt('hands')) grid = [[+opt('hands'), +opt('head', opt('hands'))]];
else {
  const [hs, js] = opt('grid', '1.5,2,2.5:0.5,1,1.5,2').split(':').map(s => s.split(',').map(Number));
  grid = []; hs.forEach(h => js.forEach(j => grid.push([h, j])));
}
console.log(`# calibration on ${root}, ${N} runs of the person per fixture, seed ${SEED}; held out: ${HOLD.join(', ')}`);
console.log('hands head   loss(train) loss(held out)   Spearman: medians / geometric means');
const all = grid.map(([h, j]) => {
  const r = evaluate(h, j);
  console.log(`${h.toFixed(2).padStart(5)} ${j.toFixed(2).padStart(4)}   ${r.lossTrain.toFixed(3).padStart(10)} ${r.lossHold.toFixed(3).padStart(14)}   ${r.rhoMed.toFixed(2)} / ${r.rhoGm.toFixed(2)}`);
  return r;
});
const best = all.slice().sort((a, b) => a.lossTrain - b.lossTrain)[0];
console.log(`\nbest on the training fixtures: hands ${best.hands}, head ${best.head}  (2 fitted numbers)`);
console.log(`loss in log takes: training ${best.lossTrain.toFixed(3)}, held out ${best.lossHold.toFixed(3)} (a typical miss of x${Math.exp(Math.sqrt(best.lossTrain)).toFixed(2)} and x${Math.exp(Math.sqrt(best.lossHold)).toFixed(2)})`);
console.log(`Spearman v. the owner, all 20: medians ${best.rhoMed.toFixed(2)}, geometric means ${best.rhoGm.toFixed(2)}`);
const c = ceiling(best);
console.log(`ceiling: a perfect model scored against one take-count per fixture would get Spearman ${c.p50.toFixed(2)} (90% of the time between ${c.p05.toFixed(2)} and ${c.p95.toFixed(2)})`);
console.log('\n| # | owner | model median | quartiles | geometric mean | set |');
console.log('|---|---|---|---|---|---|');
best.per.forEach((t, i) => { const s = t.slice().sort((a, b) => a - b), q = p => s[Math.min(s.length - 1, Math.floor(p * s.length))];
  console.log(`| ${i + 1} | ${OWNER[i]} | ${best.med[i]} | ${q(0.25)}-${q(0.75)} | ${best.gm[i].toFixed(1)} | ${HOLD.includes(i + 1) ? 'held out' : 'train'} |`); });
console.log(`\nrun time ${((Date.now() - t0) / 1000).toFixed(0)}s`);
