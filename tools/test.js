// node tools/test.js            -> every level must be beaten by its bot script, and the full replay must reproduce the goal
// node tools/test.js 7          -> only level 7, verbose
// node tools/test.js --pack 2   -> only the levels in pack2.js (level numbers are global, in pack order)
// node tools/test.js --jitter   -> per-round success rate when the bot's timing, aim and power are randomly perturbed (how forgiving a level is)
const { FB, SCRIPTS } = require('./load.js');
const { makeBot } = require('./bots.js');
const LEVELS = FB.LEVELS;
const args = process.argv.slice(2), jitter = args.includes('--jitter'), pk = args.indexOf('--pack') >= 0 ? +args[args.indexOf('--pack') + 1] : 0, only = args.find((a, n) => /^\d+$/.test(a) && args[n - 1] !== '--pack');

function playRound(L, recs, live, sc) {
  const S = FB.makeSim(L, recs, live), bot = makeBot(sc);
  while (S.status === 'play') FB.step(S, bot(S));
  return S;
}
function describe(S) {
  const me = S.att[S.live], b = S.ball;
  return `${S.status} ${S.reason} t=${(S.tick / 60).toFixed(2)} me=(${me.x.toFixed(1)},${me.y.toFixed(1)}) ball=(${b.x.toFixed(1)},${b.y.toFixed(1)}) who=${S.failWho}` +
    (S.status === 'fail' ? '\n     defs: ' + S.def.map(d => `${d.t}(${d.x.toFixed(1)},${d.y.toFixed(1)})`).join(' ') + ` gk(${S.gk.x.toFixed(1)}) recv=${(S.ball.recvTick / 60).toFixed(2)}` : '');
}
function runLevel(li, verbose) {
  const L = LEVELS[li], recs = L.att.map(() => null), sc = SCRIPTS[li];
  if (!sc) { console.log(`  L${li + 1}: no script`); return null; }
  for (let r = 0; r < L.order.length; r++) {
    const live = L.order[r], S = playRound(L, recs, live, sc[r]);
    if (verbose) console.log(`  L${li + 1} r${r + 1} #${L.att[live].num}: ${describe(S)}`);
    if (S.status === 'fail') return null;
    recs[live] = FB.finalRec(S);
  }
  const R = FB.makeSim(L, recs, -1);
  while (R.status === 'play') FB.step(R, {});
  if (verbose) console.log(`  L${li + 1} replay: ${R.status} ${R.reason} t=${(R.tick / 60).toFixed(2)} (limit ${L.time}s)`);
  return R.status === 'goal' ? { recs, time: R.tick / 60 } : null;
}
let seed = 12345; const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
function perturb(sc) {
  const c = JSON.parse(JSON.stringify(sc)), j = m => (rnd() * 2 - 1) * m;
  if (c.start !== undefined) c.start = Math.max(0, Math.round(c.start + j(8)));
  if (c.power !== undefined) c.power = Math.min(1, Math.max(0.05, c.power + j(0.06)));
  if (c.kickAt) { c.kickAt[0] += j(0.9); c.kickAt[1] += j(0.9); }
  (c.carry || []).forEach(w => { w[0] += j(0.7); w[1] += j(0.7); });
  (c.pre || []).forEach(w => { w[0] += j(0.7); w[1] += j(0.7); });
  (c.decoy || []).forEach(w => { w[0] += j(1.0); w[1] += j(1.0); });
  return c;
}
let ok = true;
LEVELS.forEach((L, i) => {
  if (only && +only !== i + 1) return;
  if (pk && L._pack !== pk) return;
  const res = runLevel(i, !!only || args.includes('-v'));
  let line = `L${String(i + 1).padStart(2)} ${L.name.padEnd(20)} ${res ? 'BEATEN ' + res.time.toFixed(1) + 's/' + L.time + 's' : 'NOT BEATEN'}`;
  if (res && jitter) {
    const rates = L.order.map((live, r) => {
      const recs = L.att.map((_, k) => L.order.indexOf(k) < r ? res.recs[k] : null);
      let w = 0; const N = 40;
      for (let n = 0; n < N; n++) { const S = playRound(L, recs, live, perturb(SCRIPTS[i][r])); if (S.status !== 'fail') w++; }
      return Math.round(100 * w / N);
    });
    line += '  jitter% per round: ' + rates.join(' / ');
  }
  console.log(line); ok = ok && !!res;
});
process.exit(ok ? 0 : 1);
