// A goal-directed, human-like player for the deterministic simulator. Not shipped in the game.
//
// It is told nothing about the designer's route: no bot scripts, and from the on-screen tips only the kind of touch
// (first time, wait for the pass), never where to pass or run. It sees what a person sees (where everyone
// is, who is next in the chain, the goal, the clock), a little late (reaction delay), and it acts through the same
// input a thumb gives (stick direction, aim direction and power, release), with noise. It picks its own route with
// rough football heuristics and, like a person, it changes something after every failed take.
//
//   const H = require('./player.js');
//   const env = H.load('/path/to/checkout');              // { FB, LEVELS }
//   const res = H.playLevel(env, levelIndex, 'owner', seed, { maxTakes: 60 });   // or 'novice', 'regular', 'expert', or H.skillAt(hands, head)
//
// See docs/foundation/04-human-model.md for the model and its calibration.
'use strict';
const fs = require('fs'), path = require('path');

/* ---------- loading a checkout (own loader: tools/load.js is fixed to its own repo) ---------- */
const loaded = {};
function load(root) {
  root = path.resolve(root);
  if (loaded[root]) return loaded[root];
  const dir = path.join(root, 'one-man-team', 'js');
  const saved = global.OMT_LEVELS;
  global.OMT_LEVELS = [];
  fs.readdirSync(path.join(dir, 'levels')).filter(f => /^pack\d+\.js$/.test(f))
    .sort((a, b) => parseInt(a.slice(4)) - parseInt(b.slice(4)))
    .forEach(f => { const n0 = global.OMT_LEVELS.length; require(path.join(dir, 'levels', f)); for (let i = n0; i < global.OMT_LEVELS.length; i++) global.OMT_LEVELS[i]._pack = parseInt(f.slice(4)); });
  const { FB } = require(path.join(dir, 'sim.js'));       // captures the array that is global at this moment
  const env = { FB, LEVELS: FB.LEVELS, root };
  global.OMT_LEVELS = saved;
  return (loaded[root] = env);
}

/* ---------- seeded randomness ---------- */
function makeRng(seed) {
  let a = (seed >>> 0) || 1, spare = null;
  const u = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const n = () => { if (spare !== null) { const s = spare; spare = null; return s; } let x, y, r; do { x = u() * 2 - 1; y = u() * 2 - 1; r = x * x + y * y; } while (r >= 1 || r === 0); const m = Math.sqrt(-2 * Math.log(r) / r); spare = y * m; return x * m; };
  return { u, n, int: k => Math.floor(u() * k), pick: arr => arr[Math.floor(u() * arr.length)] };
}

/* ---------- the human limits: three skill tiers ----------
   react      ticks (60 per second) between something happening and the thumbs answering
   think      ticks between changes of mind while running (the stick is held in between)
   aimTicks   ticks needed to set the aim stick before letting go (the kick itself is the release)
   aimDir     degrees of aiming error (standard deviation)       aimPow  error in the power bar (0..1)
   stick      degrees of error in the running direction          timing  ticks of error when anticipating a pass
   planNoise  how badly the first idea of a route is judged (standard deviation on the route score)
   insight    chance that the change made after a failure is the sensible one for that failure (else a random change)
   patience   failures blamed on the earlier pass before going back to redo the previous player
   firstTimeAfter  times he must be caught on the ball straight after receiving it before he learns to aim early
   moveAim    how much he keeps moving while aiming (0 stands still, 1 keeps running)
   foresee    how much of a defender's coming movement he allows for when judging a passing lane (1 = all of it)
   offside    metres of error (standard deviation, per take) in where he thinks the offside line is
   cutR       how close he lets a defender come on the ball before he cuts away from him (metres)
   tips       1 = he reads the kind of touch the on-screen tip asks for (first time; wait for the pass) */
const TIERS = {
  novice:  { react: 21, think: 9, aimTicks: 30, aimDir: 6.5, aimPow: 0.13, stick: 14, timing: 15, planNoise: 0.9, insight: 0.45, patience: 5, firstTimeAfter: 4, moveAim: 0.0, foresee: 0.4, offside: 2.2, cutR: 1.6, tips: 1 },
  regular: { react: 15, think: 6, aimTicks: 20, aimDir: 5.0, aimPow: 0.08, stick: 9, timing: 10, planNoise: 0.5, insight: 0.7, patience: 4, firstTimeAfter: 2, moveAim: 0.5, foresee: 0.7, offside: 1.6, cutR: 1.9, tips: 1 },
  expert:  { react: 12, think: 5, aimTicks: 14, aimDir: 3.0, aimPow: 0.05, stick: 5, timing: 7, planNoise: 0.25, insight: 0.9, patience: 3, firstTimeAfter: 1, moveAim: 1.0, foresee: 0.9, offside: 1.1, cutR: 2.2, tips: 1 }
};
/* Two continuous skill dials instead of three boxes, so that a person can be fitted:
   hands  (execution): react, think, aimTicks, aimDir, aimPow, stick, timing, moveAim, cutR
   head   (judgement): planNoise, insight, patience, firstTimeAfter, foresee, offside
   0 = novice, 1 = regular, 2 = expert on each dial; in between is linear, beyond 2 carries on along the
   regular-to-expert line (with floors, so nobody becomes superhuman). */
const HANDS = ['react', 'think', 'aimTicks', 'aimDir', 'aimPow', 'stick', 'timing', 'moveAim', 'cutR'];
const HEAD = ['planNoise', 'insight', 'patience', 'firstTimeAfter', 'foresee', 'offside'];
const FLOOR = { react: 8, think: 3, aimTicks: 8, aimDir: 1.2, aimPow: 0.02, stick: 2, timing: 2, planNoise: 0.05, patience: 2, firstTimeAfter: 1, offside: 0.2 };
const CEIL = { moveAim: 1, cutR: 2.6, insight: 0.98, foresee: 1 };
const INTS = ['react', 'think', 'patience', 'firstTimeAfter'];
function skillAt(hands, head) {
  const lerp = (k, s) => {
    const a = s <= 1 ? TIERS.novice[k] : TIERS.regular[k], b = s <= 1 ? TIERS.regular[k] : TIERS.expert[k], u = s <= 1 ? s : s - 1;
    let v = a + (b - a) * u;
    if (FLOOR[k] !== undefined) v = Math.max(FLOOR[k], v);
    if (CEIL[k] !== undefined) v = Math.min(CEIL[k], v);
    return INTS.includes(k) ? Math.round(v) : v;
  };
  const sk = Object.assign({}, TIERS.regular);
  HANDS.forEach(k => { sk[k] = lerp(k, hands); });
  HEAD.forEach(k => { sk[k] = lerp(k, head); });
  return sk;
}

// The owner: two numbers fitted to his takes (the original 20 plus about 2 on today's 60) with tools/human/calibrate.js.
// Fitted on 15 fixtures alone the best was hands 1.75, head 0.5; refitted on all 21 numbers it is this. See 04-human-model.md.
const OWNER_DIALS = { hands: 2, head: 1 };
const PROFILES = { novice: TIERS.novice, regular: TIERS.regular, expert: TIERS.expert, owner: null };

const GX = 25, PW = 50, PH = 60;
const hyp = Math.hypot, clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const FRIC = 0.8, STOPV = 1.2, KMIN = 9, KMAX = 28, RUN = 7.6, DEFSPD = 5.3;   // DEFSPD: what a person assumes of any defender
const DEG = Math.PI / 180;
const AVOID = [0, 30, -30, 60, -60, 95, -95];

function distSegInfo(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
  const u = l2 > 1e-9 ? clamp(((px - ax) * dx + (py - ay) * dy) / l2, 0, 1) : 0;
  return { d: hyp(px - ax - dx * u, py - ay - dy * u), s: u * Math.sqrt(l2) };
}
// seconds for a pass hit at v0 to travel s metres (9 if it never gets there)
function ballTime(s, v0) { const k = s * FRIC / v0; return k >= 0.985 ? 9 : -Math.log(1 - k) / FRIC; }
// seconds for a shot hit at v0 to travel s metres (shots hold their pace: friction 0.28)
function shotTime(s, v0) { const k = s * 0.28 / v0; return k >= 0.985 ? 9 : -Math.log(1 - k) / 0.28; }
function powerFor(dist, over) { const v0 = clamp(FRIC * (dist + over) + STOPV, KMIN, KMAX); return { v0, p: (v0 - KMIN) / (KMAX - KMIN) }; }
// How open does the lane from Q to T look? Positive = metres to spare. A person only half allows for where the
// defenders will have moved by the time the ball gets there (`foresee`).
function laneClear(qx, qy, tx, ty, v0, defs, foresee) {
  let best = 9;
  for (let i = 0; i < defs.length; i++) {
    const d = defs[i], g = distSegInfo(d.x, d.y, qx, qy, tx, ty);
    const tb = ballTime(g.s, v0);
    const c = g.d - 0.85 - foresee * DEFSPD * 0.9 * Math.max(0, Math.min(tb, 2.5) - 0.25);
    if (c < best) best = c;
  }
  return best;
}

/* ---------- route ideas ---------- */
// Where to pass, seen from Q, for a receiver standing at R. Returns candidates sorted best first.
function passIdeas(qx, qy, R, lastIsNext, defs, gk, sk, rng, over, taboo) {
  const out = [];
  let gx = GX - R.x, gy = 4 - R.y; const gl = hyp(gx, gy) || 1; gx /= gl; gy /= gl;
  const leads = [0, 3, 6, 9, 12, 16, 20], rots = [0, 25, -25, 50, -50, 80, -80, 180];
  const gdQ = hyp(qx - GX, qy);
  for (let a = 0; a < rots.length; a++) for (let b = 0; b < leads.length; b++) {
    const lead = leads[b], rot = rots[a] * DEG;
    if (lead === 0 && a > 0) continue;
    if (rots[a] === 180 && lead > 6) continue;
    const c = Math.cos(rot), s = Math.sin(rot);
    const tx = clamp(R.x + (gx * c - gy * s) * lead, 2, PW - 2), ty = clamp(R.y + (gx * s + gy * c) * lead, 2.5, PH - 2);
    const D = hyp(tx - qx, ty - qy);
    if (D < 4 || D > 34) continue;
    const v0 = powerFor(D, over).v0;
    const lane = laneClear(qx, qy, tx, ty, v0, defs, sk.foresee);
    const tR = hyp(tx - R.x, ty - R.y) / 7.0 + 0.25;
    let tD = 9;
    // a defender who has to turn and chase a ball played in behind him is slower to it than one facing it
    for (let i = 0; i < defs.length; i++) { const behind = ty < defs[i].y - 1; const t = Math.max(0, hyp(tx - defs[i].x, ty - defs[i].y) - 1) / DEFSPD * (behind ? 1.25 : 1) + (behind ? 0.3 : 0); if (t < tD) tD = t; }
    const space = clamp(tD - tR, -1.5, 1.5);
    const gd = hyp(tx - GX, ty);
    let val = clamp((gdQ - gd) / 10, -1, 3) + Math.min(lane, 0) * 1.5 + clamp(lane, 0, 3) * 0.3 + space;
    if (lastIsNext) val += gd < 7 ? -1 : gd < 16 ? 1 : gd < 22 ? 0.4 : 0;
    if (lastIsNext && Math.abs(tx - GX) > 14 && gd < 22) val -= 0.5;
    if (ty < 6.5 && Math.abs(tx - GX) < 10) val -= 1.5;                    // the keeper's feet
    if (hyp(tx - gk.x, ty - gk.y) < 5) val -= 1;
    for (let k = 0; k < taboo.length; k++) if (hyp(tx - taboo[k][0], ty - taboo[k][1]) < 4) val -= 1.5;   // tried that, it failed
    val += rng.n() * sk.planNoise;
    out.push({ x: tx, y: ty, val, lane });
  }
  out.sort((p, q) => q.val - p.val);
  return out;
}

/* ---------- memory of one round across takes ---------- */
function newPlan(sk, rng) {
  return {
    decoy: null,                                  // { list, idx }
    recv: { go: null, early: rng.u() < 0.5, margin: 0.2 + rng.u() * 0.8, deep: null, cautious: false },
    carry: { q: null, panicD: 3.0, haste: 1, firstTime: false, caught: 0 },
    pass: { T: null, over: 4, taboo: [] },
    // thr: metres to spare he wants before he shoots; bias: how optimistic his read of the keeper is; gkKeep: how close
    // to the keeper he will carry it before he must shoot
    shot: { thr: 0.3 + rng.n() * 0.2, bias: rng.n() * 0.4 * sk.planNoise, side: 0, margin: 0.9, gkKeep: 4.5 }
  };
}

/* ---------- one round ---------- */
function playRound(env, L, recs, r, plan, sk, rng) {
  const FB = env.FB, C = FB.C, live = L.order[r];
  const S = FB.makeSim(L, recs, live);
  const chain = S.chain, p = chain.indexOf(live), isLast = S.isLast;
  const prevIdx = p > 0 ? chain[p - 1] : -1, nextIdx = p >= 0 && p + 1 < chain.length ? chain[p + 1] : -1;
  const nd = S.def.length, RB = 32;
  const ringX = new Float32Array(RB * (nd + 1)), ringY = new Float32Array(RB * (nd + 1)), ringP = new Uint8Array(RB * (nd + 1));
  const seen = S.def.map(d => ({ x: d.x, y: d.y, plant: false })), seenGk = { x: S.gk.x, y: S.gk.y };
  const st = { mx: 0, my: 0, think: 0, ownT: 0, aiming: false, aimT: 0, aimNeed: 0, ax: 0, ay: -1, pow: 0, amx: 0, amy: 0, pre: false,
    stickErr: 0, qBest: -99, offErr: rng.n() * sk.offside, cut: 0, cutCool: 0, cutX: 0, cutY: 0, decoyDone: false, kerr: 0, goTick: -1, believed: -1, M: null, path: null, recvAt: null, kickFrom: null, target: null, kind: '', inited: false };

  function look() {                              // the world as it was `react` ticks ago
    const t = S.tick, w = t % RB, k = (nd + 1);
    for (let i = 0; i < nd; i++) { ringX[w * k + i] = S.def[i].x; ringY[w * k + i] = S.def[i].y; ringP[w * k + i] = S.def[i].lt > 0 ? 1 : 0; }
    ringX[w * k + nd] = S.gk.x; ringY[w * k + nd] = S.gk.y;
    const o = Math.max(0, t - sk.react) % RB;
    for (let i = 0; i < nd; i++) { seen[i].x = ringX[o * k + i]; seen[i].y = ringY[o * k + i]; seen[i].plant = ringP[o * k + i] === 1; }
    seenGk.x = ringX[o * k + nd]; seenGk.y = ringY[o * k + nd];
  }
  function steer(me, tx, ty, avoid) {
    let dx = tx - me.x, dy = ty - me.y; const d = hyp(dx, dy);
    if (d < 0.35) { st.mx = 0; st.my = 0; return; }
    dx /= d; dy /= d;
    if (avoid) {
      // Dribbling: a short, rough look ahead. Try a few headings either side of the one he wants and take the one that
      // keeps the ball furthest from where the nearby defenders (as he last saw them) could be in about half a second.
      const a0 = Math.atan2(dy, dx); let best = -1e9, ba = a0;
      for (let k = 0; k < 7; k++) {
        const a = a0 + AVOID[k] * DEG, px = me.x + Math.cos(a) * 3.6, py = me.y + Math.sin(a) * 3.6;
        if (px < 1 || px > PW - 1 || py < 1.5) continue;
        let v = -Math.abs(AVOID[k]) * 0.022 * (1 + 0.3 * rng.n());
        for (let i = 0; i < nd; i++) {
          let ex = px - seen[i].x, ey = py - seen[i].y; const e = hyp(ex, ey);
          if (e > 7.5) continue;
          const e2 = Math.max(0, e - 2.4);                    // he can close about this much in that time
          if (e2 < 3) v -= (3 - e2) * 1.1;
        }
        const ek = hyp(px - seenGk.x, py - seenGk.y); if (ek < 4) v -= (4 - ek) * 1.5;
        if (v > best) { best = v; ba = a; }
      }
      dx = Math.cos(ba); dy = Math.sin(ba);
    }
    for (let i = 0; i < S.att.length; i++) {     // and never run into an earlier self
      if (i === live || !S.att[i].rec) continue;
      const ex = me.x - S.att[i].x, ey = me.y - S.att[i].y, e = hyp(ex, ey);
      if (e < 2.6 && e > 0.01) { const w = 1.6 * (2.6 - e) / 2.6; dx += ex / e * w; dy += ey / e * w; }
    }
    const a = Math.atan2(dy, dx) + st.stickErr;
    st.mx = Math.cos(a); st.my = Math.sin(a);
  }
  // The finisher's carry: a few headings around "towards goal", each judged by the corner it would open up from three
  // metres further on, less the danger of the defenders (as last seen) and of running into the keeper's arms.
  function steerFinish(me) {
    const sh = plan.shot, a0 = Math.atan2(10 - me.y, GX - me.x);
    let best = -1e9, bx = me.x, by = me.y - 3;
    for (let k = 0; k < 7; k++) {
      const a = a0 + AVOID[k] * DEG, px = me.x + Math.cos(a) * 3.2, py = me.y + Math.sin(a) * 3.2;
      if (px < 1 || px > PW - 1 || py < 1.5) continue;
      let v = shotLook(px, py).q * 0.7 - 0.3 * hyp(px - GX, py - 11) - Math.abs(AVOID[k]) * 0.012 * (1 + 0.3 * rng.n());
      for (let i = 0; i < nd; i++) {
        const e = hyp(px - seen[i].x, py - seen[i].y);
        if (e > 7.5) continue;
        const e2 = Math.max(0, e - 2.4);
        if (e2 < 3) v -= (3 - e2) * 1.1;
      }
      const ek = hyp(px - seenGk.x, py - seenGk.y); if (ek < sh.gkKeep) v -= (sh.gkKeep - ek) * 1.5;
      if (v > best) { best = v; bx = px; by = py; }
    }
    steer(me, bx, by, false);
  }
  function nearestDef(x, y) { let m = 99; for (let i = 0; i < nd; i++) { const e = hyp(seen[i].x - x, seen[i].y - y); if (e < m) m = e; } return m; }
  function offLine() {
    const ys = seen.map(d => d.y); ys.push(seenGk.y); ys.sort((a, b) => a - b);
    return Math.min(ys[1], S.ball.y);
  }
  function startAim(tx, ty, power, hasty, kind) {
    const me = S.att[live];
    const k = (hasty ? 1.4 : 1) * (st.pre ? 1.25 : 1);
    st.aimErr = rng.n() * sk.aimDir * DEG * k;
    const ang = Math.atan2(ty - me.y, tx - me.x) + st.aimErr;
    st.ax = Math.cos(ang); st.ay = Math.sin(ang);
    st.pow = clamp(power + rng.n() * sk.aimPow * k, 0.02, 1);
    st.aimNeed = Math.max(4, Math.round(sk.aimTicks * plan.carry.haste * (hasty ? 0.7 : 1) * (1 + 0.2 * Math.abs(rng.n()))));
    st.aiming = true; st.aimT = 0; st.target = [tx, ty]; st.kind = kind;
    if (kind === 'shot') plan.shot.lastSide = tx < GX ? -1 : 1;
    const m = hyp(st.mx, st.my) || 1; st.amx = st.mx / m * sk.moveAim; st.amy = st.my / m * sk.moveAim;
  }
  // choose where the pass goes, as seen right now
  function passTarget(me, pressured) {
    const R = L.att[nextIdx], lastNext = nextIdx === chain[chain.length - 1];
    let T = plan.pass.T;
    if (!T) {
      const ideas = passIdeas(me.x, me.y, R, lastNext, seen, seenGk, sk, rng, plan.pass.over, plan.pass.taboo);
      T = plan.pass.T = ideas.length ? [ideas[0].x, ideas[0].y] : [R.x, R.y];
    }
    let tx = T[0], ty = T[1];
    const D = hyp(tx - me.x, ty - me.y), v0 = powerFor(D, plan.pass.over).v0;
    if (!pressured && laneClear(me.x, me.y, tx, ty, v0, seen, sk.foresee) < 0) {
      // the lane he wanted looks shut right now: bend the pass a little either way and take the clearest
      let best = -9, bx = tx, by = ty;
      [0, 12, -12, 24, -24].forEach(dg => {
        const c = Math.cos(dg * DEG), s = Math.sin(dg * DEG), x = me.x + (tx - me.x) * c - (ty - me.y) * s, y = me.y + (tx - me.x) * s + (ty - me.y) * c;
        const cl = laneClear(me.x, me.y, x, y, v0, seen, sk.foresee) - Math.abs(dg) * 0.02;
        if (cl > best) { best = cl; bx = x; by = y; }
      });
      tx = bx; ty = by;
    }
    return [tx, ty, powerFor(hyp(tx - me.x, ty - me.y), plan.pass.over).p];
  }
  /* Picking a corner. A person looks at the keeper and at any legs in the way and asks "if I hit it there, hard, does
     he get to it?". This is that judgement, made on what he saw `react` ticks ago, with the rough sense of a keeper's
     reach a practised player builds up (about a fifth of a second before he moves, then about 5.5 m/s, plus an arm's
     length: these three numbers classify 98% of 1,200 test shots against a set keeper correctly), and an allowance for his own aim (how far his shots stray at this distance).
     Returns metres to spare on the worst of the three (keeper, post, a defender's leg) for the best spot, and the spot. */
  function shotLook(x, y) {
    const sh = plan.shot, xl = 21 + sh.margin, xr = 29 - sh.margin;
    let best = -99, bx = GX;
    const vS = 17 + 17 * 0.92;                                   // a hard shot, not quite full
    const lead = sk.aimTicks / 60 * 0.6;                         // legs close in while he sets his aim
    for (let k = 0; k <= 8; k++) {
      const tx = xl + (xr - xl) * k / 8;
      if (sh.side && Math.sign(tx - GX) === -sh.side && Math.abs(tx - GX) > 1) continue;
      const D = hyp(tx - x, y);
      const g = distSegInfo(seenGk.x, seenGk.y, x, y, tx, 0);
      const tg = shotTime(g.s, vS);
      const mK = g.d - 0.8 - 5.5 * Math.max(0, tg - 0.2);
      const sd = sk.aimDir * DEG * D;
      const mP = Math.min(tx - 21, 29 - tx) - 1.3 * sd;
      let mB = 9;
      for (let i = 0; i < nd; i++) {
        const h = distSegInfo(seen[i].x, seen[i].y, x, y, tx, 0);
        if (h.s < 0.4) continue;
        const m = h.d - 0.85 - DEFSPD * (lead + Math.max(0, shotTime(h.s, vS) - 0.15)) * sk.foresee;
        if (m < mB) mB = m;
      }
      const q = Math.min(mK, mP, mB * 1.2);
      if (q > best) { best = q; bx = tx; }
    }
    return { q: best + sh.bias, x: bx };
  }

  function own() {
    const me = S.att[live], t = S.tick, c = plan.carry;
    if (!st.recvAt) st.recvAt = [me.x, me.y, t];
    st.ownT++;
    if (st.pre && !st.aiming) st.pre = false;
    if (st.aiming) {
      if (st.pre) { st.pre = false; st.aimT = Math.max(st.aimT, st.aimNeed - 2); }     // aimed early: let go on the first touch
      if (++st.aimT > st.aimNeed) { st.kickFrom = [me.x, me.y, t]; return { release: true }; }
      // the thumb keeps the aim on the same spot as he moves; the error he started with stays
      const ang = Math.atan2(st.target[1] - me.y, st.target[0] - me.x) + st.aimErr; st.ax = Math.cos(ang); st.ay = Math.sin(ang);
      return { mx: st.amx, my: st.amy, charging: true, aim: true, ax: st.ax, ay: st.ay, power: st.pow };
    }
    if (p > 0 && st.ownT < Math.round(sk.react * 0.6)) return { mx: st.mx, my: st.my };   // the first touch: nothing decided yet
    // Beating a tackle: when a man gets close (or he sees him plant his feet: both seen `react` ticks late, like
    // everything else), he cuts sharply away from him, to the goal side if he can. Held for a fixed spell, then back
    // to his plan; he will not cut again straight away.
    if (st.cut > 0) { st.cut--; return { mx: st.cutX, my: st.cutY }; }
    if (st.cutCool > 0) st.cutCool--;
    else for (let i = 0; i < nd; i++) {
      const d = seen[i];
      const ex = me.x - d.x, ey = me.y - d.y, e = hyp(ex, ey);
      if (e < 0.01 || !(e < sk.cutR || (d.plant && e < 2.8))) continue;
      let px = -ey / e, py = ex / e;                                 // perpendicular to the line from him
      if (px * (GX - me.x) + py * (8 - me.y) < 0) { px = -px; py = -py; }
      const a = Math.atan2(py, px) + rng.n() * sk.stick * DEG;
      st.cutX = Math.cos(a); st.cutY = Math.sin(a); st.cut = 14; st.cutCool = 30; st.mx = st.cutX; st.my = st.cutY;
      return { mx: st.cutX, my: st.cutY };
    }
    if (t >= st.think) {
      st.think = t + sk.think; st.stickErr = rng.n() * sk.stick * DEG;
      const press = nearestDef(S.ball.x, S.ball.y), pressured = press < c.panicD;
      const timeLow = S.limit - t < sk.aimTicks + 40;
      if (isLast) {
        const sh = plan.shot, lk = shotLook(me.x, me.y), qn = lk.q + rng.n() * 0.4 * sk.planNoise;
        const gkd = hyp(seenGk.x - me.x, seenGk.y - me.y);
        // shoot when it looks good enough, or when it is as good as it is going to get (closed down, keeper close, the
        // chance getting worse again)
        const fading = st.qBest > sh.thr - 0.8 && qn < st.qBest - 0.35;
        st.qBest = Math.max(st.qBest, qn);
        const want = qn >= sh.thr || (pressured && qn >= sh.thr - 0.8) || timeLow || (gkd < sh.gkKeep && qn >= sh.thr - 1.2) || fading;
        if (want) { startAim(lk.x, 0, 1 - Math.abs(rng.n()) * sk.aimPow, pressured, 'shot'); return { mx: st.amx, my: st.amy, charging: true, aim: true, ax: st.ax, ay: st.ay, power: st.pow }; }
        steerFinish(me);                                               // carry it to where a corner will open up
      } else {
        if (c.q === null) {
          // first time on this ball: carry somewhere first, or pass from here? Judge each spot by the best pass it offers.
          const R = L.att[nextIdx], lastNext = nextIdx === chain[chain.length - 1];
          let best = -99, bq = 'none', bT = null;
          for (let k = 0; k < 17; k++) {
            const dist = k === 0 ? 0 : k <= 8 ? 4 : 8, ang = (k - 1) * 45 * DEG;
            const qx = clamp(me.x + Math.cos(ang) * dist, 2, PW - 2), qy = clamp(me.y + Math.sin(ang) * dist, 3, PH - 2);
            const ideas = passIdeas(qx, qy, R, lastNext, seen, seenGk, sk, rng, plan.pass.over, plan.pass.taboo);
            if (!ideas.length) continue;
            let v = ideas[0].val - dist * 0.22;
            if (k > 0 && nearestDef(qx, qy) < 3.5) v -= 1.5;
            if (k > 0 && pressured) v -= 1;
            if (v > best) { best = v; bq = k === 0 ? 'none' : [qx, qy]; bT = [ideas[0].x, ideas[0].y]; }
          }
          c.q = bq; if (!plan.pass.T && bT) plan.pass.T = bT;
        }
        const arrived = c.q === 'none' || hyp(c.q[0] - me.x, c.q[1] - me.y) < 1.1 || st.ownT > 200;
        if (arrived || pressured || timeLow) {
          const T = passTarget(me, pressured);
          startAim(T[0], T[1], T[2], pressured && !arrived, 'pass');
          return { mx: st.amx, my: st.amy, charging: true, aim: true, ax: st.ax, ay: st.ay, power: st.pow };
        }
        steer(me, c.q[0], c.q[1], true);
      }
    }
    return { mx: st.mx, my: st.my };
  }

  // the pass that is coming, as the player remembers it from the round he has just recorded
  function pathAt(tau) {
    const k = st.path, ts = Math.min(tau, k.tStop), e = (1 - Math.exp(-FRIC * ts)) / FRIC;
    return [k.bx + k.vx * e, k.by + k.vy * e];
  }
  // A point of the remembered pass he can reach, leaving `delay` s after the kick: the first one ("come to the ball"),
  // or with `deep` the reachable one nearest the goal ("run on to it").
  function meetFrom(x, y, delay, deep) {
    let last = null, best = null, bg = 1e9;
    for (let tau = 0.05; tau <= 4.5; tau += 0.05) {
      const q = pathAt(tau);
      if (q[0] < 0.5 || q[0] > PW - 0.5 || q[1] < 0.5 || q[1] > PH - 0.5) break;
      last = q;
      if (hyp(q[0] - x, q[1] - y) <= 7.0 * Math.max(0, tau - delay) + 1.2) {
        if (!deep) return { q, tau, ok: true };
        const g = hyp(q[0] - GX, q[1]) + (q[1] < 6 ? 20 : 0);
        if (g < bg - 0.01) { bg = g; best = { q, tau, ok: true }; }
      }
      if (tau > st.path.tStop) break;
    }
    return best || { q: last || pathAt(0.05), tau: 4.5, ok: false };
  }
  function initRecv() {
    st.inited = true;
    const kk = recs[prevIdx].kick, me = S.att[live], sp = hyp(kk.vx, kk.vy);
    st.path = { bx: kk.bx, by: kk.by, vx: kk.vx, vy: kk.vy, tick: kk.tick, tStop: sp > STOPV ? Math.log(sp / STOPV) / FRIC : 0 };
    const rv = plan.recv;
    if (rv.deep === null) rv.deep = rng.u() < (isLast ? 0.75 : 0.3);
    if (rv.go === null) {
      // first idea: react to the pass if that is enough to get there, otherwise set off as late as still works
      let dl = sk.react / 60, m = meetFrom(me.x, me.y, dl);
      while (!m.ok && dl > -kk.tick / 60) { dl -= 0.1; m = meetFrom(me.x, me.y, dl); }
      rv.go = Math.max(-kk.tick, Math.round(dl * 60) - (m.ok && dl < sk.react / 60 ? 6 : 0));
      // He recorded that pass himself and has watched it replay, so he knows roughly when it comes: he times his run to
      // go just as it is hit rather than waiting to see it (this is where offside comes from).
      rv.go = Math.min(rv.go, Math.round(-3 + rng.n() * 4));
    }
    const antic = rv.go < sk.react;
    st.kerr = antic ? rng.n() * sk.timing : rng.n() * 3;
    st.goTick = Math.max(0, Math.round(kk.tick + rv.go + st.kerr));
    st.believed = antic ? Math.round(kk.tick + st.kerr) : kk.tick + sk.react;
    st.M = meetFrom(me.x, me.y, Math.max(-kk.tick / 60, rv.go / 60), rv.deep).q;
    st.M = [st.M[0] + rng.n() * 0.8, st.M[1] + rng.n() * 0.8];
  }
  function offBall() {
    const me = S.att[live], t = S.tick, b = S.ball, rv = plan.recv;
    if (p <= 0) return {};
    if (!st.inited) initRecv();
    if (t >= st.think) {
      st.think = t + sk.think; st.stickErr = rng.n() * sk.stick * DEG;
      const kicked = b.owner < 0 && b.lastKicker === prevIdx, sees = kicked && t - b.kickTick >= Math.round(sk.react * 0.5);
      if (t < st.goTick && !sees) {
        const ly = offLine() + rv.margin + st.offErr;
        if (rv.early) steer(me, st.M[0], Math.max(st.M[1], ly), false);
        else if (me.y < ly) steer(me, me.x, ly + 0.5, false);          // the line has stepped past him: get back onside
        else { st.mx = 0; st.my = 0; }
      } else if (sees && t >= Math.min(st.goTick, b.kickTick + sk.react)) {
        // run on to the real ball: the first point of its path he can get to
        let tx = b.x, ty = b.y, tau = 0;
        if (hyp(b.x - me.x, b.y - me.y) > 2) {
          const fr = FRIC;
          const tStop = Math.log(Math.max(1.0001, hyp(b.vx, b.vy) / STOPV)) / fr;
          let found = false, bg = 1e9;
          for (tau = 0; tau < 4; tau += 0.05) {
            const e = (1 - Math.exp(-fr * Math.min(tau, tStop))) / fr, px = b.x + b.vx * e, py = b.y + b.vy * e;
            if (px < 0.5 || px > PW - 0.5 || py < 0.5 || py > PH - 0.5) break;
            if (hyp(px - me.x, py - me.y) <= RUN * tau * 0.85 + 1.0) {
              if (!rv.deep) { tx = px; ty = py; found = true; break; }
              const g = hyp(px - GX, py) + (py < 6 ? 20 : 0);
              if (g < bg - 0.01) { bg = g; tx = px; ty = py; found = true; }
            }
            if (tau > tStop) break;
          }
          if (!found) { const e = (1 - Math.exp(-fr * Math.min(1, tStop))) / fr; tx = b.x + b.vx * e; ty = b.y + b.vy * e; tau = 1; }
          const ne = 0.25 * (1 + Math.min(tau, 2)) * (sk.stick / 9);
          tx += rng.n() * ne; ty += rng.n() * ne;
        } else { tx = b.x + b.vx * 0.12; ty = b.y + b.vy * 0.12; }
        steer(me, tx, ty, false);
        // aim early, to play it first time
        if (plan.carry.firstTime && !st.aiming) {
          const eta = hyp(b.x - me.x, b.y - me.y) / Math.max(4, hyp(b.vx, b.vy) + 4) * 60;
          if (eta < sk.aimTicks * 1.2 + sk.think) {
            st.pre = true;
            if (isLast) {
              const lk = shotLook(tx, ty);
              if (lk.q >= plan.shot.thr - 0.3) startAim(lk.x, 0, 1 - Math.abs(rng.n()) * sk.aimPow, false, 'shot');
              else st.pre = false;                                     // not a shooting chance: take a touch instead
            }
            else { const T = passTarget({ x: tx, y: ty }, false); startAim(T[0], T[1], T[2], false, 'pass'); }
          }
        }
      } else {
        // going before he has seen the ball played: run for where he expects it, but hold the line until he believes it has gone
        let ty = st.M[1];
        // once he has been caught offside he also checks the line until he believes the pass has gone
        if (rv.cautious && t < st.believed) ty = Math.max(ty, offLine() + rv.margin + st.offErr);
        steer(me, st.M[0], ty, false);
      }
    }
    if (st.aiming) {
      // charging slows the run; keep steering at the ball
      st.aimT++;
      const ang = Math.atan2(st.target[1] - me.y, st.target[0] - me.x) + st.aimErr; st.ax = Math.cos(ang); st.ay = Math.sin(ang);
      return { mx: st.mx, my: st.my, charging: true, aim: true, ax: st.ax, ay: st.ay, power: st.pow };
    }
    return { mx: st.mx, my: st.my };
  }
  function decoy() {
    const me = S.att[live], t = S.tick, d = plan.decoy;
    if (st.decoyDone) return { done: true };
    const T = d.list[d.idx];
    if (t >= st.think) { st.think = t + sk.think; st.stickErr = rng.n() * sk.stick * DEG; steer(me, T[0], T[1], false); }
    if ((hyp(T[0] - me.x, T[1] - me.y) < 1.0 && t >= 40) || t > 420) { st.decoyDone = true; return { done: true }; }
    return { mx: st.mx, my: st.my };
  }
  if (S.role === 'decoy' && !plan.decoy) plan.decoy = decoyIdeas(L, live, S, sk, rng);

  let sum = 0;
  while (S.status === 'play') {
    look();
    let inp;
    if (S.role === 'decoy') inp = decoy();
    else if (S.liveKickTick >= 0) inp = {};
    else if (S.ball.owner === live) inp = own();
    else inp = offBall();
    FB.step(S, inp);
    sum = checksum(S, sum);
  }
  S._sum = sum;
  const me = S.att[live];
  const info = {
    reason: S.reason, who: S.failWho, by: S.failBy,
    phase: S.role === 'decoy' ? 'decoy' : S.liveKickTick >= 0 ? 'kicked' : st.ownT > 0 ? 'carry' : 'pre',
    late: hyp(S.ball.x - me.x, S.ball.y - me.y), ownT: st.ownT, me: [me.x, me.y], ball: [S.ball.x, S.ball.y],
    def: typeof S.failBy === 'number' && S.failBy >= 0 ? [S.def[S.failBy].x, S.def[S.failBy].y] : null,
    kickFrom: st.kickFrom, recvAt: st.recvAt, target: st.target, pow: st.pow, kind: st.kind, pre: plan.carry.firstTime,
    go: plan.recv.go, kickTick: S.liveKickTick, endTick: S.tick
  };
  return { S, info };
}

// A running fingerprint of everything the defence and the ball did, tick by tick (positions only).
function checksum(S, sum) {
  let v = S.ball.x * 1.37 + S.ball.y * 2.11 + S.gk.x * 3.01 + S.gk.y * 0.77;
  for (let i = 0; i < S.def.length; i++) v += S.def[i].x * (1.1 + i) + S.def[i].y * (0.3 + i * 0.7);
  for (let i = 0; i < S.att.length; i++) v += S.att[i].x * (0.9 + i * 0.13) + S.att[i].y * (0.21 + i * 0.4);
  return (sum * 1.000001 + v) % 1e9;
}

// Where should a player with no ball run? He reasons: "the man standing on me will come with me, so take him away
// from where the ball has to go". Candidates are scored by how far that drags the nearest defender off the lanes
// between the players who will have the ball, and tried in that order, a new one each time he comes back to it.
function decoyIdeas(L, live, S, sk, rng) {
  const me = L.att[live], chain = S.chain.map(i => L.att[i]);
  let mk = -1, md = 6;
  S.def.forEach((d, i) => { const e = hyp(d.x - me.x, d.y - me.y); if (e < md) { md = e; mk = i; } });
  const segs = [];
  for (let i = 0; i + 1 < chain.length; i++) segs.push([chain[i].x, chain[i].y, chain[i + 1].x, chain[i + 1].y]);
  const last = chain[chain.length - 1]; segs.push([last.x, last.y, GX, 0]);
  const list = [];
  for (let k = 0; k < 8; k++) for (const dist of [7, 13]) {
    const a = k * 45 * DEG, x = clamp(me.x + Math.cos(a) * dist, 2, PW - 2), y = clamp(me.y + Math.sin(a) * dist, 4, PH - 2);
    let v = 0;
    const ox = mk >= 0 ? S.def[mk].x - me.x : 0, oy = mk >= 0 ? S.def[mk].y - me.y : 0;
    segs.forEach((s, n) => { const w = n >= segs.length - 2 ? 1.5 : 1; v += w * Math.min(8, distSegInfo(x + ox, y + oy, s[0], s[1], s[2], s[3]).d); });
    chain.forEach(c => { if (hyp(c.x - x, c.y - y) < 4) v -= 4; });
    v += rng.n() * sk.planNoise * 4;
    list.push([x, y, v]);
  }
  list.sort((p, q) => q[2] - p[2]);
  return { list, idx: 0 };
}

/* ---------- learning: what changes after a failed take ---------- */
function adjust(plan, info, sk, rng, L, live, isLast, nextStart) {
  const c = plan.carry, rv = plan.recv, ps = plan.pass, sh = plan.shot;
  const smart = rng.u() < sk.insight;
  const R = info.reason;
  let blamePrev = false;
  if (info.phase === 'pre') {
    if (R === 'offside') { rv.margin += smart ? 0.8 : 0.3; if (smart) rv.cautious = true; if (rv.go !== null && rv.go < sk.react) rv.go += smart ? 8 : rng.int(16) - 4; }
    else if (R === 'bump') { rv.early = !rv.early; }
    else {
      // the pass never reached him
      blamePrev = true;
      if (rv.go !== null) {
        if (smart) {
          const u = rng.u();
          if (rv.deep && R === 'intercepted' && u < 0.4) rv.deep = false;        // stop waiting for it: go and meet it
          else if (info.late > 3 || u < 0.75) rv.go -= 10 + rng.int(8);
          else rv.early = !rv.early;
        } else { const k = rng.int(4); if (k === 0) rv.go -= rng.int(20); else if (k === 1) rv.go += rng.int(10); else if (k === 2) rv.deep = !rv.deep; else rv.early = !rv.early; }
      }
    }
  } else if (info.phase === 'carry') {
    if (R === 'tackled' || R === 'smothered') {
      const quick = info.ownT < sk.react + sk.aimTicks + 14;
      if (R === 'smothered') { sh.gkKeep = Math.min(9, sh.gkKeep + 1.5); sh.thr -= 0.2; }
      else if (quick) {
        // caught on the ball before he could get the kick away
        c.caught++;
        if (c.caught >= sk.firstTimeAfter) c.firstTime = true;
        else { c.haste = Math.max(0.5, c.haste * 0.8); }
        if (c.q !== 'none' && c.q !== null) c.q = 'none';
      } else if (smart) {
        const k = rng.int(3);
        if (isLast && rv.deep === false && rng.u() < 0.5) rv.deep = true;        // take it further on before the first touch
        else if (k === 0 && c.q && c.q !== 'none' && info.recvAt) c.q = [(c.q[0] + info.recvAt[0]) / 2, (c.q[1] + info.recvAt[1]) / 2];
        else if (k === 1) c.panicD = Math.min(6, c.panicD + 1.2);
        else if (isLast) sh.thr -= 0.3;
        else c.q = 'none';
      } else { if (rng.u() < 0.5) c.panicD = Math.min(6, c.panicD + 0.6); else if (isLast) sh.thr -= 0.3; else c.q = null; }
    } else if (R === 'time') {
      blamePrev = true; c.haste = Math.max(0.5, c.haste * 0.8);
      if (isLast) sh.thr -= 0.4; else c.q = 'none';
      if (rv.go !== null) rv.go -= 8;
    } else if (R === 'bump') { c.q = null; }
    else blamePrev = true;                                  // something happened to an earlier part
  } else if (info.phase === 'kicked' && info.kind === 'pass') {
    const Q = info.kickFrom, T = ps.T;
    if (R === 'intercepted' && T && Q) {
      const k = smart ? rng.int(3) : 3 + rng.int(2);
      if (k === 0 && info.def) {
        // bend it away from the man who cut it out
        const cr = (T[0] - Q[0]) * (info.def[1] - Q[1]) - (T[1] - Q[1]) * (info.def[0] - Q[0]);
        const a = -(cr > 0 ? 1 : -1) * (10 + rng.u() * 12) * DEG, cs = Math.cos(a), sn = Math.sin(a);
        ps.T = [clamp(Q[0] + (T[0] - Q[0]) * cs - (T[1] - Q[1]) * sn, 2, PW - 2), clamp(Q[1] + (T[0] - Q[0]) * sn + (T[1] - Q[1]) * cs, 2.5, PH - 2)];
      } else if (k === 1) { ps.over = Math.min(12, ps.over + 3); }
      else if (k === 2) { ps.taboo.push(T); ps.T = null; c.q = null; }
      else if (k === 3) { ps.T = [clamp(T[0] + rng.n() * 3, 2, PW - 2), clamp(T[1] + rng.n() * 3, 2.5, PH - 2)]; }
      else { ps.over = clamp(ps.over + rng.n() * 3, -2, 12); }
    } else if ((R === 'out' || R === 'keeper' || R === 'early' || R === 'wide') && T) {
      ps.over = Math.max(-3, ps.over - 3);
      if (smart && nextStart) ps.T = [T[0] + (nextStart.x - T[0]) * 0.3, T[1] + (nextStart.y - T[1]) * 0.3];
    } else if (R === 'tackled') { c.panicD = Math.min(6, c.panicD + 1); }
    else if (R === 'time') { blamePrev = true; c.q = 'none'; c.haste = Math.max(0.5, c.haste * 0.8); }
    else blamePrev = true;
  } else if (info.phase === 'kicked') {                     // the shot
    if (R === 'saved') {
      const k = smart ? rng.int(4) : rng.int(6);
      // the keeper is better than he thought: rate chances lower from now on, and do one more thing differently
      sh.bias -= smart ? 0.3 : 0.15;
      if (k === 0) sh.side = -(sh.side || sh.lastSide || 1);
      else if (k === 1 || k === 2) sh.thr += 0.3;                                       // get to a better spot before shooting
      else if (k === 3) { sh.margin = Math.max(0.4, sh.margin - 0.3); if (!c.firstTime && smart) c.haste = Math.max(0.5, c.haste * 0.8); }
      else sh.thr += rng.n() * 0.3;
    } else if (R === 'wide' || R === 'out') { sh.margin = Math.min(2.6, sh.margin + (smart ? 0.5 : 0.2)); if (smart) sh.thr += 0.15; }
    else if (R === 'intercepted') {
      const k = rng.int(3);
      sh.bias -= 0.15; if (k === 0) sh.side = -(sh.side || sh.lastSide || 1); else if (k === 1) sh.thr += 0.3; else sh.margin = Math.max(0.4, sh.margin - 0.2);
    } else if (R === 'time') { blamePrev = true; sh.thr -= 0.4; c.haste = Math.max(0.5, c.haste * 0.8); if (rv.go !== null) rv.go -= 8; }
    else blamePrev = true;
  }
  if (rv.go !== null) rv.go = clamp(rv.go, -900, 60);
  return blamePrev;
}
// going back to redo the previous player: what he changes about that player's part
function rethink(plan, hint, sk, rng, isDecoy, nextStart) {
  if (isDecoy) { if (plan.decoy) plan.decoy.idx = (plan.decoy.idx + 1) % plan.decoy.list.length; return; }
  const ps = plan.pass, c = plan.carry, T = ps.T;
  const smart = rng.u() < sk.insight;
  if (!T) return;
  if (hint === 'keeper' || hint === 'out') { ps.over = Math.max(-3, ps.over - 3); if (nextStart) ps.T = [T[0] + (nextStart.x - T[0]) * 0.35, T[1] + (nextStart.y - T[1]) * 0.35]; }
  else if (hint === 'deeper' && smart) {
    // the last man keeps getting the ball in front of the defence: play it further on, behind them
    const gl = hyp(GX - T[0], 6 - T[1]) || 1, k = 4 + rng.u() * 5;
    ps.T = [clamp(T[0] + (GX - T[0]) / gl * k, 2, PW - 2), clamp(T[1] + (6 - T[1]) / gl * k, 7, PH - 2)]; ps.over = Math.min(12, ps.over + 1);
  }
  else if (hint === 'time') { c.q = 'none'; c.haste = Math.max(0.5, c.haste * 0.8); ps.over = Math.min(12, ps.over + 2); }
  else if (smart && rng.u() < 0.5 && nextStart) { ps.T = [T[0] + (nextStart.x - T[0]) * 0.4, T[1] + (nextStart.y - T[1]) * 0.4]; ps.over = Math.min(12, ps.over + 2); }
  else { ps.taboo.push(T); ps.T = null; c.q = null; }
}

/* ---------- one simulated person on one level ---------- */
function playLevel(env, li, tier, seed, opts) {
  opts = opts || {};
  const FB = env.FB, L = env.LEVELS[li], sk = Object.assign({}, typeof tier === 'string' ? PROFILES[tier] : tier, opts.skill || {});
  const rng = makeRng(seed), maxTakes = opts.maxTakes || 60;
  const nR = L.order.length, recs = L.att.map(() => null);
  const chain = L.order.filter(i => L.att[i].role === 'ball'), lastIdx = chain[chain.length - 1];
  const plans = L.order.map(() => newPlan(sk, rng));
  // The tips. The game shows each player's tip on screen, and a person reads it. The model takes from it only the KIND
  // of touch it asks for, never where to pass or run: "first time" / "one touch" -> he aims before the ball arrives
  // from his first take; "wait", "until the pass", "as the 10 plays it" -> he holds his run until he sees the pass.
  if (sk.tips) L.order.forEach((ai, k) => {
    const tip = String(L.att[ai].tip || '').toLowerCase();
    if (/first time|first-time|one touch|one-touch|aim early/.test(tip)) plans[k].carry.firstTime = true;
    if (/\bwait|until the|as the \d+ plays|when the pass|once the pass|stay onside|stay level|hold (your|the) run/.test(tip)) plans[k].recv.early = false;
  });
  const strikes = new Array(nR).fill(0), streak = new Array(nR).fill(0), struggle = new Array(nR).fill(0), infos = new Array(nR).fill(null);
  const failsByRound = new Array(nR).fill(0), reasons = {}, log = [];
  let fails = 0, r = 0, redos = 0, final = null;
  while (r < nR && fails < maxTakes) {
    const live = L.order[r], res = playRound(env, L, recs, r, plans[r], sk, rng);
    const S = res.S, info = res.info;
    if (S.status === 'fail') {
      fails++; failsByRound[r]++; streak[r]++;
      const key = info.reason + (info.phase === 'pre' ? ' (before receiving)' : info.phase === 'carry' ? ' (on the ball)' : info.phase === 'kicked' ? (info.kind === 'shot' ? ' (the shot)' : ' (own pass)') : '');
      reasons[key] = (reasons[key] || 0) + 1;
      if (opts.log) log.push({ round: r, reason: info.reason, phase: info.phase, who: S.failWho, t: S.tick, kickFrom: info.kickFrom, x: 'by ' + info.by + ' me ' + info.me.map(v => v.toFixed(1)) + ' ball ' + info.ball.map(v => v.toFixed(1)) + ' recv ' + (info.recvAt || []).map(v => v.toFixed(0)) + ' kick ' + (info.kickFrom || []).map(v => v.toFixed(0)) + ' tgt ' + (info.target || []).map(v => v.toFixed(1)) + ' go ' + info.go + ' ownT ' + info.ownT });
      const p = chain.indexOf(live), nextStart = p >= 0 && p + 1 < chain.length ? L.att[chain[p + 1]] : null;
      if (adjust(plans[r], info, sk, rng, L, live, live === lastIdx, nextStart)) strikes[r]++;
      if (live === lastIdx && (info.phase === 'carry' || info.reason === 'intercepted') && info.phase !== 'pre') struggle[r]++;
      if (r > 0 && (strikes[r] >= sk.patience || struggle[r] > sk.patience || streak[r] >= sk.patience * 2 + 2)) {
        // "Redo the previous player". If the man before is a decoy, the pass he is really unhappy with belongs to
        // the ball player before that: he usually goes back as far as him (and replays the decoy on the way back).
        const hint = strikes[r] >= sk.patience ? info.reason : live === lastIdx ? 'deeper' : 'other';
        let back = r - 1;
        if (L.att[L.order[back]].role === 'decoy') {
          let pb = back; while (pb >= 0 && L.att[L.order[pb]].role === 'decoy') pb--;
          if (pb >= 0 && rng.u() < 0.7) back = pb;
        }
        const pl = L.order[back], pp = chain.indexOf(pl);
        rethink(plans[back], hint, sk, rng, L.att[pl].role === 'decoy', pp >= 0 && pp + 1 < chain.length ? L.att[chain[pp + 1]] : null);
        plans[r].recv.go = null; strikes[r] = 0; streak[r] = 0; struggle[r] = 0;
        for (let k = back; k <= r; k++) recs[L.order[k]] = null;
        r = back; redos++;
      }
    } else {
      recs[live] = FB.finalRec(S); infos[r] = info; strikes[r] = 0; streak[r] = 0; struggle[r] = 0;
      if (r === nR - 1) final = S;
      r++;
    }
  }
  const cleared = r >= nR;
  const out = { level: li + 1, name: L.name, tier: typeof tier === 'string' ? tier : 'custom', seed, cleared, takes: cleared ? fails + 1 : null, fails, failsByRound, reasons, redos };
  if (cleared) {
    out.time = final.tick / 60;
    out.route = L.order.map((ai, k) => {
      const a = L.att[ai], f = infos[k], o = { num: a.num, role: a.role };
      if (a.role === 'decoy') { const rc = recs[ai]; o.runTo = [rc.x[rc.len - 1], rc.y[rc.len - 1]]; return o; }
      o.recvAt = f.recvAt; o.kickFrom = f.kickFrom; o.kick = f.kind; o.aimedAt = f.target; o.power = f.pow; o.firstTime = !!f.pre; o.go = f.go;
      if (f.kind === 'shot' && f.kickFrom) o.shotDist = hyp(f.kickFrom[0] - GX, f.kickFrom[1]);
      return o;
    });
    out.recs = opts.keepRecs ? recs.slice() : undefined;
    // determinism: the finished move, replayed from its recordings alone, must give the same goal on the same tick
    // (and every player, defender, the keeper and the ball must be in the same place on every tick on the way).
    const Rp = FB.makeSim(L, recs, -1); let sum = 0;
    while (Rp.status === 'play') { FB.step(Rp, {}); sum = checksum(Rp, sum); }
    out.replayOk = Rp.status === 'goal' && Rp.tick === final.tick && sum === final._sum;
  }
  if (opts.log) out.log = log;
  return out;
}

PROFILES.owner = skillAt(OWNER_DIALS.hands, OWNER_DIALS.head);

module.exports = { PROFILES, OWNER_DIALS, load, TIERS, skillAt, HANDS, HEAD, playLevel, playRound, makeRng, newPlan, checksum };
