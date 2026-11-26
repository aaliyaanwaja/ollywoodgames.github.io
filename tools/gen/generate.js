// The level generator (RULEBOOK.md section 1, "For a generator"):
//   (1) pick a template from the pool by tier weight, (2) sample its parameters, (3) place the defence with the
//   procedure of 5.2, (4) static checks, (5) search a bot route, (6) dynamic checks, (7) fit the clock to the band,
//   (8) keep the level or reject it and resample.
// Seeded and deterministic: generate({ seed: 7 }) gives the same level, byte for byte, every time.
//
//   const G = require('./generate.js');
//   const res = G.generate({ seed: 7, band: 'ordinary', template: 'trap', fixture: 9, avoid: {...} });
//   res.level (live level format), res.script (bot route, tools/scripts/packN.js format), res.meta, res.checks
'use strict';
const { makeRng, hashSeed } = require('./rng.js');
const { TEMPLATES, find } = require('./templates.js');
const { synth, polish } = require('./route.js');
const K = require('./check.js');
const lab = require('./lab.js');
const hyp = Math.hypot;
const r1 = v => Math.round(v * 10) / 10, r2 = v => Math.round(v * 100) / 100;

// ------------------------------------------------------------------ bands (rulebook 7.2 and the owner's targets in 9)
// model: the owner-profile median of the human model that the clock is fitted to. The model is a band only and
// underrates the owner's hardest levels by 2-3 times (rulebook 6), so the closing band asks the model for 6+.
const BANDS = {
  opening:  { id: 'opening', label: 'tutorial (fixtures 1-4)', owner: '1-2', slack: [6, 8], ratio: [0.35, 0.55], spd: [4.0, 4.8], model: [1, 2.5], target: 1.5, j2: [0, 9] },
  standard: { id: 'standard', label: 'standard', owner: '3-6', slack: [3.8, 4.8], ratio: [0.58, 0.66], spd: [5.1, 5.3], model: [2.5, 6], target: 4, j2: [1, 3] },
  hard:     { id: 'hard', label: 'hard', owner: '5-8', slack: [2.8, 3.8], ratio: [0.64, 0.72], spd: [5.3, 5.5], model: [4, 7.5], target: 5.5, j2: [1, 5], j1: 1 },
  ordinary: { id: 'ordinary', label: 'ordinary (standard to hard)', owner: '3-8', slack: [2.8, 4.8], ratio: [0.58, 0.72], spd: [5.1, 5.5], model: [3, 7], target: 5, j2: [1, 5] },
  closing:  { id: 'closing', label: 'closing (one per season)', owner: '8-15', slack: [1.8, 3.8], ratio: [0.64, 0.78], spd: [5.3, 5.6], model: [6, 14], target: 8.5, j2: [2, 5], j1: 2 }
};
function bandFor(id, season) {
  const b = JSON.parse(JSON.stringify(BANDS[id] || BANDS.ordinary));
  const s = season || 0;   // each repeat of the 5-20 pattern: speed +0.1 (max 5.7), slack -0.3 (min 1.8)  [7.3]
  if (s > 0 && b.id !== 'opening') { b.spd = b.spd.map(v => Math.min(5.7, r1(v + 0.1 * s))); b.slack = b.slack.map(v => Math.max(1.8, r1(v - 0.3 * s))); }
  return b;
}
const fixtureFor = band => band === 'opening' ? 2 : band === 'closing' ? 20 : 9;

// ------------------------------------------------------------------ geometry helpers
const unit = (x, y) => { const l = hyp(x, y) || 1; return [x / l, y / l]; };
const rot = (v, deg) => { const t = deg * Math.PI / 180; return [v[0] * Math.cos(t) - v[1] * Math.sin(t), v[0] * Math.sin(t) + v[1] * Math.cos(t)]; };
const mirrorPt = p => [r2(50 - p[0]), p[1]];
function mirrorPlan(plan) {
  const mp = a => a ? mirrorPt(a) : a;
  return plan.map(s => {
    const o = JSON.parse(JSON.stringify(s));
    if (o.decoy) o.decoy = o.decoy.map(mp);
    if (o.recv) o.recv.pre = mp(o.recv.pre);
    if (o.carry) o.carry = o.carry.map(mp);
    if (o.pass) o.pass.to = mp(o.pass.to);
    return o;
  });
}

// ------------------------------------------------------------------ the placement procedure (5.2)
function sampleParams(tpl, rng) {
  const p = {};
  Object.keys(tpl.ranges).forEach(k => { const [lo, hi, st] = tpl.ranges[k]; p[k] = rng.step(lo, hi, st || 0.5); });
  return p;
}
function placeDefence(spec, att, band, rng) {
  const def = [], roles = [], lines = {};
  // a speed inside the band; the clock then sets difficulty (7.1), and the speed dial may move it one or two steps
  const spdLine = rng.step(band.spd[0], band.spd[1], 0.1);
  const cap = v => Math.min(5.7, r1(v)), floor = band.id === 'opening' ? 4.0 : 5.0;
  const line = spec.def.line;
  let yL = null, cx = 25;
  // 1. the back line by height and spacing, shifted to the ball side
  if (line) {
    yL = line.yL;
    let sp = line.width ? [line.width] : line.squeezed ? line.spacing.slice() : line.spacing.map(s => s + rng.step(-0.5, 0.5, 0.5));
    sp = sp.map(s => line.width ? s : Math.max(8, Math.min(11.5, s)));
    if (sp.length === 3 && !line.squeezed) sp[1] = Math.max(9, Math.min(11, sp[1]));
    const W = sp.reduce((a, b) => a + b, 0);
    let shift = line.shift || 0;
    const first = att[spec.order.find(i => att[i].role === 'ball')];
    if (!spec.fixedShift) { const s = Math.sign(first.x - 25); shift = Math.abs(shift) * (Math.abs(first.x - 25) < 1 ? 0 : s); }
    cx = 25 + shift;
    let x = cx - W / 2;
    for (let k = 0; k <= sp.length; k++) {
      const d = { t: 'line', x: r1(x), y: r1(yL), spd: spdLine };
      if (line.eng) d.eng = line.eng;
      def.push(d); roles.push({ role: 'back line' });
      if (k < sp.length) x += sp[k];
    }
    const lc = {}; if (line.gap) lc.gap = line.gap; if (line.floor) lc.floor = line.floor;
    if (Object.keys(lc).length) lines[0] = lc;
  }
  // 2. markers on their named men: goal-side, tight x 2-2.6 m
  (spec.def.marks || []).forEach(m => {
    const man = att[m.on], g = unit(25 - man.x, 0 - man.y), dist = Math.max(1.6, Math.min(3.4, (m.tight || 1) * rng.range(2.0, 2.6)));
    const d = { t: 'mark', a: m.on, x: r1(man.x + g[0] * dist), y: r1(man.y + g[1] * dist), spd: cap(Math.max(floor, spdLine + rng.pick([0, 0.1, 0.2]))) };
    if (m.eng) d.eng = m.eng; if (m.react) d.react = m.react; if (m.tight && m.tight !== 1) d.tight = m.tight;
    def.push(d); roles.push({ role: m.inLine ? 'centre-half marking' : 'man-marker', on: m.on });
  });
  // 3. screens on the lane they guard, 6-16 m in front of the line
  for (const s of (spec.def.screens || [])) {
    const A = att[s.lane[0]], B = att[s.lane[1]], u = unit(B.x - A.x, B.y - A.y), perp = [-u[1], u[0]], L = hyp(B.x - A.x, B.y - A.y);
    let placed = null;
    const ts = [0]; for (let k = 1; k <= 12; k++) ts.push(k * 0.04, -k * 0.04);
    for (const dt of ts) {
      const t = s.t + dt; if (t < 0.1 || t > 0.9) continue;
      const lat = (s.lat || 0) + rng.step(-0.5, 0.5, 0.5);
      const x = A.x + (B.x - A.x) * t + perp[0] * lat, y = A.y + (B.y - A.y) * t + perp[1] * lat;
      if (yL !== null && (y - yL < 6.1 || y - yL > 15.9 || Math.abs(x - cx) > 11.9)) continue;
      if (def.some(o => hyp(o.x - x, o.y - y) < 3.2)) continue;
      placed = { x, y }; break;
    }
    if (!placed) return { fail: 'screen cannot stand on his lane 6-16 m in front of the line' };
    const d = { t: 'zone', x: r1(placed.x), y: r1(placed.y), spd: r1(Math.max(floor, spdLine - rng.pick([0, 0.1, 0.2]))), eng: s.eng || 5 };
    def.push(d); roles.push({ role: 'screen', lane: s.lane });
    void L;
  }
  // 4. hunters on their passers, 6.5-12 m away, goal-side
  for (const h of (spec.def.hunters || [])) {
    const man = att[h.on], g = unit(25 - man.x, 0 - man.y), dir = rot(g, (h.behind ? 120 : h.ang || 0) + rng.step(-8, 8, 2));
    let dd = h.d, hx, hy;
    const b0 = att[spec.order.find(i => att[i].role === 'ball')], bx = b0.x, by = b0.y - 0.75;
    for (let q = 0; q < 16; q++) { hx = man.x + dir[0] * dd; hy = man.y + dir[1] * dd; if (hyp(hx - man.x, hy - (man.y - 0.75)) >= 6.7 && hyp(hx - bx, hy - by) >= 6.7 && !def.some(o => hyp(o.x - hx, o.y - hy) < 3.2)) break; dd += 0.3; }
    const d = { t: 'press', x: r1(hx), y: r1(hy), spd: cap(Math.max(floor, spdLine + rng.pick([0.1, 0.2, 0.3]))) };
    def.push(d); roles.push({ role: 'hunter', on: h.on });
  }
  (spec.def.extra || []).forEach(e => { def.push(Object.assign({}, e, { spd: band.id === 'opening' ? rng.step(4.0, 4.6, 0.2) : spdLine })); roles.push({ role: e.t === 'zone' ? 'cover' : e.t }); });
  return { def, roles, lines, spdLine, yL };
}

// ------------------------------------------------------------------ text in the house style
function words(s, mirrored) {
  return s.replace(/\{(left|right)\}/g, (_, w) => mirrored ? (w === 'left' ? 'right' : 'left') : w);
}

// How well a found bot route carries the template's football (cheap: one analysed replay). 0 = J1, J3 and J4a are met.
function routeScore(L, ctx, band) {
  return cand => {
    let sc = 0;
    // a decoy must be needed (5.3): with him standing still, the same later rounds must fail
    L.order.forEach((di, k) => {
      if (L.att[di].role !== 'decoy') return;
      const a = L.att[di], recs = L.att.map(() => null), SC = cand.scripts.slice(); SC[k] = { decoy: [[a.x, a.y]] };
      let ok = true;
      for (let q = 0; q < L.order.length && ok; q++) { const S = lab.play(L, recs, L.order[q], SC[q]); if (S.status === 'fail') ok = false; else recs[L.order[q]] = lab.FB.finalRec(S); }
      if (ok && lab.replay(L, recs).status === 'goal') sc += 4;
    });
    if (ctx.fixture <= 4) return sc;
    const { ev } = lab.analyse(L, cand.recs);
    const passes = ev.filter(e => e.rnum !== null && e.recv !== undefined);
    const runnerAtt = L.order[ctx.runner === undefined ? L.order.length - 1 : ctx.runner];
    const fin = passes.find(e => e.recv === runnerAtt) || passes[passes.length - 1];
    const tight = passes.filter(e => e.lane <= 2.0).length + passes.slice(0, -1).filter(e => e.press <= 3.5).length;
    if (tight < (band.j1 || 1)) sc += 3;
    const on = fin.ry - fin.ol;
    if (!ctx.tpl.cutback && (!fin.ahead || on < 0.3 || on > 5)) sc += 2;
    if (fin.cDist < 14 || fin.cDist > 32) sc += 2;
    if (fin.press > 6.5) sc += 1;
    return sc;
  };
}

// ------------------------------------------------------------------ one attempt
function attempt(opts, k, stats) {
  const rng = makeRng(hashSeed(opts.seed, k, opts.band, opts.template || '', opts.fixture || ''));
  const band = bandFor(opts.bandId, opts.season || 0), fx = opts.fixture;
  const tut = fx <= 4;
  // (1) template by tier weight, within the band and the variety constraints
  let pool = TEMPLATES.filter(t => tut ? t.tutorial : !t.tutorial);
  if (!tut && band.id === 'standard') pool = pool.filter(t => !t.hardOnly);
  if (opts.tutorialId) pool = pool.filter(t => t.id === opts.tutorialId);
  if (opts.template) { const t = find(opts.template); if (!t) throw new Error('unknown template ' + opts.template); pool = [t]; }
  const av = opts.avoid || {};
  if (av.templates && pool.length > 1) { const p2 = pool.filter(t => !av.templates.includes(t.id)); if (p2.length) pool = p2; }
  if (av.tier1 && pool.some(t => t.tier === 1)) pool = pool.filter(t => t.tier === 1);
  if (av.finishers && pool.length > 1) { const p2 = pool.filter(t => !av.finishers.includes(t.finisher)); if (p2.length) pool = p2; }
  if (av.noCutback && pool.length > 1) { const p2 = pool.filter(t => t.ending !== 'cutback'); if (p2.length) pool = p2; }
  if (av.yBand && pool.length > 1) {   // a template whose whole line-height range is in the band to avoid cannot vary it
    const p2 = pool.filter(t => !t.ranges.yL || [t.ranges.yL[0], t.ranges.yL[1], (t.ranges.yL[0] + t.ranges.yL[1]) / 2].some(y => yBandOf(y) !== av.yBand));
    if (p2.length) pool = p2;
  }
  // stay with the template drawn for this level for up to four attempts, so that the mix of templates follows the pool
  // weights (4.2) rather than drifting towards the templates that are easiest to accept
  const tpl = opts.sticky && opts.sticky.n < 4 && pool.includes(opts.sticky.tpl) ? opts.sticky.tpl : rng.weighted(pool.map(t => ({ v: t, w: t.weight })));
  if (opts.sticky) { if (opts.sticky.tpl === tpl) opts.sticky.n++; else { opts.sticky.tpl = tpl; opts.sticky.n = 1; } }
  const st = stats[tpl.id] = stats[tpl.id] || { attempts: 0, accepted: 0, reasons: {} };
  st.attempts++;
  const dbg = {};
  const reject = (stage, why) => { const key = stage + ': ' + why.split(':')[0]; st.reasons[key] = (st.reasons[key] || 0) + 1; return Object.assign({ ok: false, tpl: tpl.id, stage, why }, opts.debug ? { dbg } : {}); };
  // (2) parameters; mirror for the side
  const p = sampleParams(tpl, rng);
  if (av.yBand && p.yL !== undefined) {
    // no two consecutive levels in the same band of yL: resample the height inside the template's range
    const [lo, hi, s] = tpl.ranges.yL; for (let q = 0; q < 8 && yBandOf(p.yL) === av.yBand; q++) p.yL = rng.step(lo, hi, s || 0.5);
  }
  let mirrored = rng.chance(0.5);
  const spec = tpl.build(p);
  // the attacking side is the side the finisher (the release receiver) attacks from; alternate it when asked
  const runAtt = spec.att[spec.order[spec.runner]], canonSide = runAtt.x < 23 ? 'left' : runAtt.x > 27 ? 'right' : 'centre';
  if (av.side && av.side !== 'centre' && canonSide !== 'centre') mirrored = canonSide === av.side;
  // (3) defence by role, canonical side, then mirror
  const shr = tpl.ranges.shift, fixedShift = !!(shr && shr[0] * shr[1] > 0);
  const pl = placeDefence(Object.assign({ order: spec.order, fixedShift }, spec), spec.att, band, rng);
  if (pl.fail) return reject('placement', pl.fail);
  const pick = arr => rng.pick(arr);
  const L = {
    name: opts.name || pick(tpl.names), time: 20,
    brief: words(pick(spec.text.brief), mirrored),
    att: spec.att.map((a, i) => Object.assign({}, a, { tip: words(pick(spec.text.tips[i]), mirrored) })),
    order: spec.order.slice(), def: pl.def
  };
  const eng = K.expectedEngine(fx); if (eng) L.engine = eng;
  if (spec.gk) L.gk = Object.assign({}, spec.gk);
  if (L.gk && L.gk.react && fx > 3) delete L.gk.react;
  if (L.gk && !Object.keys(L.gk).length) delete L.gk;
  if (Object.keys(pl.lines).length) L.lines = pl.lines;
  let plan = spec.plan;
  if (mirrored) {
    L.att.forEach(a => { a.x = r2(50 - a.x); if (a.mirror) { const was = a.num; a.num = a.mirror.num; a.name = a.mirror.name; L.att.forEach(b => { b.tip = b.tip.replace(new RegExp('\\b(the|The) ' + was + '\\b', 'g'), '$1 ' + a.num); }); } });
    L.def.forEach(d => { d.x = r1(50 - d.x); }); plan = mirrorPlan(plan);
  }
  L.att.forEach(a => { delete a.mirror; });
  L.att.forEach(a => { a.x = r1(a.x); a.y = r1(a.y); });
  const ctx = { fixture: fx, band, tpl: Object.assign({}, tpl, { cutback: !!spec.cutback }), roles: pl.roles, runner: spec.runner, novice: !!opts.novice };
  // (4) static checks
  const S0 = K.staticChecks(L, ctx);
  dbg.L = L; dbg.S0 = S0; dbg.p = p;
  if (S0.fails.length) return reject('static', S0.fails[0]);
  // (5) the bot route
  const t5 = Date.now(); dbg.plan = plan;
  const R = synth(L, plan, { maxSims: opts.maxSims || 3000, solutions: L.att.some(a => a.role === 'decoy') ? 8 : 4, score: routeScore(L, ctx, band) });
  if (!R.ok) { dbg.why = R.why; dbg.L = L; const top = Object.keys(R.why).sort((a, b) => R.why[b] - R.why[a])[0] || 'budget'; return reject('route', top); }
  let route = R.route.scripts.map(s => JSON.parse(JSON.stringify(s)));
  dbg.L = L; dbg.route = route; dbg.plan = plan; dbg.p = p;
  const pol = polish(L, route);
  if (lab.solve(L, pol).ok) route = pol;
  const t6 = Date.now();
  // (6) dynamic checks
  const D = K.dynamicChecks(L, route, ctx, { early: true });
  dbg.D = D; dbg.route = route;
  const t7 = Date.now();
  if (D.fails.length) return reject('dynamic', D.fails[0]);
  // (7) the clock: whole seconds, slack from the band first, then the human model inside the band's range. If even the
  // longest allowed clock leaves the model above the band, the second dial (7.1): the whole defence 0.1 m/s slower,
  // twice at most and never below the band's floor; the route and the dynamic checks are run again.
  let bot = D.bot, tries = [], choice = null, Dk = D;
  const spd0 = L.def.map(d => d.spd);
  const dial = [0];   // speed steps tried, in units of 0.1 m/s: filled in as the model answers
  for (let di = 0; di < dial.length && di < 3; di++) {
    const slow = dial[di];
    if (slow) {
      const lo = band.spd[0] - 1e-9, hi = band.spd[1] + 1e-9;
      const lineS = L.def.filter(d => d.t === 'line').map((d, i) => spd0[L.def.indexOf(d)] - 0.1 * slow);
      if (lineS.some(v => v < lo || v > hi)) break;
      L.def.forEach((d, i) => { d.spd = r1(Math.min(5.7, Math.max(band.id === 'opening' ? 4.0 : 5.0, spd0[i] - 0.1 * slow))); });
      L.time = 20;
      let sol = lab.solve(L, route);
      if (!sol.ok) { const R2 = synth(L, plan, { maxSims: opts.maxSims || 3000, solutions: 4, score: routeScore(L, ctx, band) }); if (!R2.ok) break; route = polish(L, R2.route.scripts); if (!lab.solve(L, route).ok) route = R2.route.scripts; }
      Dk = K.dynamicChecks(L, route, ctx, { early: true });
      if (Dk.fails.length) break;
      bot = Dk.bot;
    }
    let cands = [];
    for (let c = 7; c <= 14; c++) { const sl = c - bot; if (sl >= band.slack[0] - 0.2 && sl <= band.slack[1] + 1.0 && bot / c <= 0.8) cands.push(c); }
    if (!cands.length) return reject('clock', 'no whole-second clock in 7-14 s fits the band (bot ' + bot + ' s)');
    // start at the clock nearest the middle of the band's slack and walk one second at a time towards the target
    const tr = [], seen = {};
    const midS = (band.slack[0] + band.slack[1]) / 2;
    let ci = cands.reduce((b, c, i) => Math.abs(c - bot - midS) < Math.abs(cands[b] - bot - midS) ? i : b, 0);
    // screening runs are short (12 people, 30 takes at most); the clock chosen is then confirmed with the full model
    // (30 people, 60 takes), which is also what A6 reports
    for (let q = 0; q < cands.length && ci >= 0 && ci < cands.length && !seen[ci]; q++) {
      seen[ci] = 1; L.time = cands[ci];
      const m = K.model(L, { n: 12, max: 30 }); tr.push({ c: cands[ci], m, slow, screen: true });
      if (m.median >= band.model[0] && m.median <= band.model[1] && Math.abs(m.median - band.target) <= 1.5) break;
      if (m.median > band.model[1] * 2 || (m.median < band.model[0] / 2 && band.model[0] > 1)) break;   // nowhere near: stop
      ci += (m.median > band.target || m.cleared < 0.9) ? 1 : -1;
    }
    tr.sort((a, b) => b.c - a.c);
    const near = tr.filter(t => t.m.median >= band.model[0] - 1 && t.m.median <= band.model[1] + 1).sort((a, b) => Math.abs(a.m.median - band.target) - Math.abs(b.m.median - band.target));
    for (const t of near.slice(0, 2)) { L.time = t.c; t.m = K.model(L); t.screen = false; if (t.m.cleared >= 0.9 && t.m.median >= band.model[0] && t.m.median <= band.model[1]) break; }
    tr.forEach(t => { if (t.screen) t.m = Object.assign({}, t.m, { cleared: 0 }); });   // a screen alone never accepts
    tries = tries.concat(tr);
    const inBand = tr.filter(t => t.m.cleared >= 0.9 && t.m.median >= band.model[0] && t.m.median <= band.model[1]);
    const outS = t => (t.c - bot > band.slack[1] + 0.2 ? 1 : 0);
    if (inBand.length) { choice = inBand.slice().sort((a, b) => outS(a) - outS(b) || Math.abs(a.m.median - band.target) - Math.abs(b.m.median - band.target) || b.c - a.c)[0]; break; }
    const easiest = tr[0].m.median, hardest = tr[tr.length - 1].m.median;
    if (di === 0) {
      if (hardest < band.model[0]) dial.push(-1, -2);                       // too easy even at the shortest clock: faster
      else if (easiest > band.model[1] && easiest <= band.model[1] + 3) dial.push(1, 2);   // too hard at the longest: slower
    }
    if (slow < 0 && tr[tr.length - 1].m.median > band.model[1]) break;
  }
  if (!choice) {
    L.def.forEach((d, i) => { d.spd = spd0[i]; });
    return reject('clock', `owner model median ${tries.map(t => t.c + 's' + (t.slow ? '-' + t.slow : '') + ':' + t.m.median).join(', ')} outside ${band.model.join('-')}`);
  }
  L.time = choice.c;
  dbg.D = Dk;
  const t8 = Date.now();
  // (8) final checks at the real clock
  const F = K.finalChecks(L, route, Object.assign({ modelCache: choice.m }, ctx), hashSeed(opts.seed, k, 'jitter'));
  if (F.fails.length) return reject('final', F.fails[0]);
  st.accepted++;
  return {
    ok: true, tpl: tpl.id, level: L, script: route,
    meta: { seed: opts.seed, attempt: k, template: tpl.id, templateName: tpl.name, tier: tpl.tier, band: band.id, fixture: fx, season: opts.season || 0, mirrored, side: canonSide === 'centre' ? 'centre' : (mirrored ? (canonSide === 'left' ? 'right' : 'left') : canonSide),
      params: p, yL: S0.yL, yBand: yBandOf(S0.yL), finisher: tpl.finisher, ending: tpl.ending, roles: S0.roles, routeSims: R.sims, ms: { route: t6 - t5, dynamic: t7 - t6, clock: t8 - t7, final: Date.now() - t8 },
      clockTries: tries.map(t => ({ clock: t.c, slower: t.slow, median: t.m.median, cleared: t.m.cleared, screen: !!t.screen })), slower: choice.slow },
    checks: { static: S0, dynamic: stripW(Dk), final: F }
  };
}
function stripW(D) { const o = Object.assign({}, D); o.W = (D.W || []).map(w => ({ r: w.r, num: w.num, dwell: w.dwell, timing: w.timing && w.timing.width, aim: w.aim && w.aim.w, power: w.power && w.power.w })); return o; }
function yBandOf(y) { return y === null || y === undefined ? 'none' : y >= 28 ? 'high' : y >= 22 ? 'medium' : 'low'; }

function generate(opts) {
  opts = Object.assign({ seed: 1, band: 'ordinary', maxAttempts: 40 }, opts);
  opts.bandId = opts.bandId || opts.band;
  if (opts.fixture === undefined) opts.fixture = fixtureFor(opts.band);
  const stats = opts.stats || {}, t0 = Date.now(), rejects = [];
  opts.sticky = { tpl: null, n: 0 };
  const avoid0 = opts.avoid;
  for (let k = 0; k < opts.maxAttempts; k++) {
    // variety is a should (7.3 [F]): after 20 failed attempts keep only "no template twice running", after 30 nothing
    if (avoid0 && k === 20) opts.avoid = { templates: (avoid0.templates || []).slice(-1), tier1: avoid0.tier1 };
    if (avoid0 && k === 30) opts.avoid = {};
    const r = attempt(opts, k, stats);
    if (r.ok) { r.meta.totalMs = Date.now() - t0; r.meta.attempts = k + 1; r.meta.varietyRelaxed = !!avoid0 && k >= 20; r.rejects = rejects; opts.avoid = avoid0; return r; }
    rejects.push(r);
  }
  opts.avoid = avoid0;
  return { ok: false, rejects, ms: Date.now() - t0 };
}

module.exports = { generate, BANDS, bandFor, placeDefence, yBandOf };
