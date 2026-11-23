// How many takes does a person need? Plays N simulated people on each fixture and reports the spread.
//
//   node tools/human/run.js                                    the original 20 (B1-B20) and today's 60: 80 fixtures, the owner profile
//   node tools/human/run.js --root .                           one checkout only (here: today's 60)
//   node tools/human/run.js --root /home/claude/baseline       the original 20 only
//   node tools/human/run.js --levels 13-20,60 --n 40           chosen fixtures (numbers within the checkout; with both
//                                                              checkouts, B13 = baseline 13, 60 = today's 60)
//   node tools/human/run.js --tiers owner,novice,regular,expert   other people as well (4x the run time)
//   node tools/human/run.js --routes 60                        the routes the people found on one fixture
//   node tools/human/run.js --check                            determinism, replay and reproducibility checks only
// Options: --n N (default 30)  --seed S (default 1)  --max TAKES (default 60)  --md  --json FILE  --out FILE  --quiet
//
// Output goes to the terminal. With --out it is ALSO written to FILE (the terminal then says where). A run started in
// the background with its output redirected shows nothing in the task log but the exit code: look in the file you sent
// it to. Everything is seeded: the same command prints the same numbers.
'use strict';
const path = require('path'), fs = require('fs');
const H = require('./player.js');
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const flag = k => args.includes('--' + k);
const HERE = path.join(__dirname, '..', '..'), BASE = '/home/claude/baseline';
const N = +opt('n', 30), SEED = +opt('seed', 1), MAX = +opt('max', 60);
const TIERLIST = ['owner', 'novice', 'regular', 'expert'];
const tiers = opt('tiers', opt('tier', 'owner')).split(',');
tiers.forEach(t => { if (!H.PROFILES[t]) { console.log('unknown profile ' + t + ' (owner, novice, regular, expert)'); process.exit(1); } });

// fixtures: [{ env, li, label }]
const roots = opt('root') ? [path.resolve(opt('root'))] : (fs.existsSync(BASE) ? [BASE, path.resolve(HERE)] : [path.resolve(HERE)]);
const both = roots.length === 2;
let FIX = [];
roots.forEach((r, ri) => { const env = H.load(r); env.LEVELS.forEach((L, li) => FIX.push({ env, li, L, label: (both && ri === 0 ? 'B' : '') + (li + 1) })); });
const want = opt('levels', opt('routes', ''));
if (want) {
  const ok = new Set();
  want.split(',').forEach(p => { const b = p[0] === 'B' ? 'B' : '', m = p.replace('B', '').split('-').map(Number); for (let i = m[0]; i <= (m[1] || m[0]); i++) ok.add(b + i); });
  FIX = FIX.filter(f => ok.has(f.label) || (!both && ok.has('B' + f.label)));
}

const lines = [];
const say = s => { lines.push(s); if (!flag('quiet')) console.log(s); };

// One simulated person: a profile and a number. For the generic tiers each person also gets his own steadiness (the
// same person on every fixture); the owner profile is one man, so his runs differ only in the luck of each take.
function person(tier, k) {
  const sk = Object.assign({}, H.PROFILES[tier]);
  if (tier !== 'owner') {
    const g = H.makeRng(SEED * 7919 + TIERLIST.indexOf(tier) * 104729 + k * 1299709 + 17), f = Math.exp(0.18 * g.n());
    sk.aimDir *= f; sk.aimPow *= f; sk.stick *= f; sk.timing *= f; sk.planNoise *= f;
  }
  return sk;
}
// the same seeds as tools/human/calibrate.js for the owner on the original 20
const seedFor = (tier, k, li) => (SEED * 2654435761 + TIERLIST.indexOf(tier) * 40503 + k * 9973 + (li + 1) * 7477 + 1) >>> 0;
const q = (sorted, p) => sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))];
const med = a => { const b = a.slice().sort((x, y) => x - y), n = b.length; return n % 2 ? b[n >> 1] : (b[n / 2 - 1] + b[n / 2]) / 2; };
const show = v => v > MAX ? MAX + '+' : String(v);

function runFix(f, tier, log) {
  const res = [];
  for (let k = 0; k < N; k++) res.push(H.playLevel(f.env, f.li, person(tier, k), seedFor(tier, k, f.li), { maxTakes: MAX, log }));
  return res;
}
function summarise(res, L) {
  const takes = res.map(r => r.cleared ? r.takes : MAX + 1), s = takes.slice().sort((a, b) => a - b);
  const byRound = L.order.map(() => 0), reasons = {}; let fails = 0;
  res.forEach(r => { r.failsByRound.forEach((v, i) => { byRound[i] += v; fails += v; }); for (const k in r.reasons) reasons[k] = (reasons[k] || 0) + r.reasons[k]; });
  return {
    median: med(takes), p25: q(s, 0.25), p75: q(s, 0.75), p90: q(s, 0.9), gmean: Math.exp(takes.reduce((a, v) => a + Math.log(v), 0) / takes.length),
    never: res.filter(r => !r.cleared).length / res.length, fails,
    byRound: byRound.map(v => fails ? v / fails : 0),
    reasons: Object.keys(reasons).sort((a, b) => reasons[b] - reasons[a]).map(k => [k, reasons[k] / fails]),
    replayBad: res.filter(r => r.cleared && !r.replayOk).length, cleared: res.filter(r => r.cleared).length, takes
  };
}

if (flag('check')) {
  // 1. the same seed gives the same result twice; 2. a finished move replays identically from its recordings
  // (same goal, same tick, every player, defender, the keeper and the ball in the same place on every tick)
  let cleared = 0, bad = 0, same = 0, runs = 0;
  const fs2 = FIX.length > 16 ? FIX.filter((_, i) => i % Math.ceil(FIX.length / 16) === 0) : FIX;
  fs2.forEach(f => tiers.forEach(tier => { for (let k = 0; k < 4; k++) {
    const a = H.playLevel(f.env, f.li, person(tier, k), seedFor(tier, k, f.li), { maxTakes: MAX }), b = H.playLevel(f.env, f.li, person(tier, k), seedFor(tier, k, f.li), { maxTakes: MAX });
    runs++; if (JSON.stringify(a) === JSON.stringify(b)) same++;
    if (a.cleared) { cleared++; if (!a.replayOk) bad++; }
  } }));
  say(`fixtures checked: ${fs2.map(f => f.label).join(', ')}`);
  say(`same seed, same result: ${same} of ${runs} runs`);
  say(`finished moves that replay identically from their recordings: ${cleared - bad} of ${cleared}`);
  process.exit(same === runs && bad === 0 ? 0 : 1);
}

if (flag('routes')) {
  const fm = v => v ? v.slice(0, 2).map(x => x.toFixed(0)).join(',') + (v[2] !== undefined ? ' @' + (v[2] / 60).toFixed(1) + 's' : '') : '-';
  FIX.forEach(f => tiers.forEach(tier => {
    say(`\n${f.label} ${f.L.name} (${tier}, clock ${f.L.time}s)`);
    runFix(f, tier, true).forEach((r, k) => {
      say(`person ${k + 1}: ` + (r.cleared ? `${r.takes} takes, move ${r.time.toFixed(1)}s` : `not cleared in ${MAX}`) + (r.redos ? `, went back ${r.redos}x` : '') + (r.fails ? '; lost: ' + r.log.map(e => 'P' + (e.round + 1) + ' ' + e.reason).join(', ') : ''));
      if (r.cleared) r.route.forEach(o => say('    ' + (o.role === 'decoy' ? `#${o.num} runs to ${fm(o.runTo)}` : `#${o.num} gets it at ${fm(o.recvAt)}, ${o.kick === 'shot' ? 'shoots' : 'passes'}${o.firstTime ? ' first time' : ''} from ${fm(o.kickFrom)} towards ${fm(o.aimedAt)}` + (o.kick === 'shot' ? ` (${o.shotDist.toFixed(0)} m out)` : ` power ${o.power.toFixed(2)}`))));
    });
  }));
  if (opt('out')) { fs.writeFileSync(opt('out'), lines.join('\n') + '\n'); console.log('written to ' + opt('out')); }
  process.exit(0);
}

const t0 = Date.now(), all = {}, md = flag('md');
let cleared = 0, bad = 0;
const short = k => k.replace('before receiving', 'pre').replace('on the ball', 'ball').replace('the shot', 'shot').replace('own pass', 'pass');
say(`# ${roots.join(' + ')}: ${FIX.length} fixtures, ${N} runs per profile, seed ${SEED}, cap ${MAX} takes; profiles ${tiers.join(', ')}`);
if (md) { say('| # | fixture | players | clock | ' + tiers.map(t => `${t}: median (quartiles) | 90th | never`).join(' | ') + ' |'); say('|---|---|---|---|' + tiers.map(() => '---|---|---|').join('')); }
FIX.forEach(f => {
  const L = f.L; all[f.label] = { name: L.name, rounds: L.order.length, time: L.time, tiers: {} };
  const cells = tiers.map(tier => { const s = summarise(runFix(f, tier, false), L); all[f.label].tiers[tier] = s; cleared += s.cleared; bad += s.replayBad; return s; });
  if (md) say(`| ${f.label} | ${L.name} | ${L.order.length} | ${L.time} | ` + cells.map(s => `${show(s.median)} (${show(s.p25)}-${show(s.p75)}) | ${show(s.p90)} | ${Math.round(s.never * 100)}%`).join(' | ') + ' |');
  else say(f.label.padStart(3) + ' ' + L.name.padEnd(22) + cells.map((s, i) => ` | ${tiers[i].slice(0, 3)} ${show(s.median).padStart(4)} (${show(s.p25)}-${show(s.p75)}) p90 ${show(s.p90)} never ${Math.round(s.never * 100)}%`).join(''));
});
const tm = tiers[0];
say(`\n# where the failed takes go (${tm}): share lost on each round, then the commonest reasons`);
if (md) { say('| # | fixture | lost on round 1 / 2 / ... | reasons |'); say('|---|---|---|---|'); }
FIX.forEach(f => {
  const s = all[f.label].tiers[tm], br = s.byRound.map(v => Math.round(v * 100) + '%').join(' / '), rs = s.reasons.slice(0, 3).map(r => `${short(r[0])} ${Math.round(r[1] * 100)}%`).join(', ');
  say(md ? `| ${f.label} | ${f.L.name} | ${br} | ${rs} |` : f.label.padStart(3) + ' ' + f.L.name.padEnd(22) + ' ' + br.padEnd(28) + rs);
});
say(`\nfinished moves replaying identically from their recordings: ${cleared - bad} of ${cleared}`);
say(`run time ${((Date.now() - t0) / 1000).toFixed(0)}s`);
if (opt('json')) fs.writeFileSync(opt('json'), JSON.stringify({ roots, N, seed: SEED, max: MAX, fixtures: all }, null, 1));
if (opt('out')) { fs.writeFileSync(opt('out'), lines.join('\n') + '\n'); if (flag('quiet')) console.log('written to ' + opt('out')); else console.log('\n(also written to ' + opt('out') + ')'); }
