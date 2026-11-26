// Automatic acceptance checks of RULEBOOK.md section 8.1 for one level and its bot route, on the live engine.
// Ported from the set D checker (docs/foundation/sets/setD-checks.js: static V1-V11 and the role test, J1-J7, J10 by the
// methods of dwell.js, windows2.js, aim3.js, finish.js and the owner probe of defending/finish.js) and generalised:
// any fixture slot (V6, V10, V11 and the tutorial exemptions), cut-back endings, decoys (A5), jitter (A3), the human
// model (A6, J8, J9), the clock (A7) and determinism (A8).
//
//   const K = require('./check.js');
//   K.staticChecks(L, ctx)            -> { fails: [...], notes, yL, roles }
//   K.dynamicChecks(L, scripts, ctx)  -> { fails, notes, bot, J1 ... }
//   K.finalChecks(L, scripts, ctx)    -> { fails, notes, A2, A3, A5, A6, A7, A8 }
// ctx = { fixture, band (bands.js object), tpl (template), roles (per defender {role, on}), runner (round of the release receiver) }
'use strict';
const path = require('path');
const { FB, C, play, replay, solve, analyse, makeBot, replayHash } = require('./lab.js');
const H = require(path.join(__dirname, '..', 'human', 'player.js'));
const hyp = Math.hypot;
const r1 = v => Math.round(v * 10) / 10, r2 = v => Math.round(v * 100) / 100;
const ENGINE = {
  tutorial: { recSpd: 0, dangerR: 0, gkBisect: 0, gkNear: 0, markLeash: 0 },
  bOnly: { recSpd: 0, dangerR: 0, markLeash: 0 }
};
function expectedEngine(fixture) { return fixture <= 4 ? ENGINE.tutorial : fixture <= 8 ? ENGINE.bOnly : null; }
const sameEngine = (a, b) => JSON.stringify(a || null) === JSON.stringify(b || null);

// ------------------------------------------------------------------ static: V1-V11 and the role test (5.4)
function staticChecks(L, ctx) {
  const fx = ctx.fixture || 9, tut = fx <= 4, out = [], notes = [], bad = (rule, msg) => out.push(rule + ': ' + msg);
  const tpl = ctx.tpl || {};
  const ballP = L.order.filter(i => L.att[i].role === 'ball'), decoys = L.order.filter(i => L.att[i].role === 'decoy');
  const first = L.att[ballP[0]], ball = { x: first.x, y: first.y - C.ballOff };
  const all = L.att.concat(L.def);
  all.forEach(p => { if (p.x < 3 || p.x > 47 || p.y < 4 || p.y > 57) bad('V1', 'start outside the area: ' + JSON.stringify([p.x, p.y])); });
  for (let i = 0; i < L.att.length; i++) for (let j = i + 1; j < L.att.length; j++) if (hyp(L.att[i].x - L.att[j].x, L.att[i].y - L.att[j].y) < 3) bad('V2', `attackers #${L.att[i].num}, #${L.att[j].num} closer than 3 m`);
  for (let i = 0; i < L.def.length; i++) for (let j = i + 1; j < L.def.length; j++) if (hyp(L.def[i].x - L.def[j].x, L.def[i].y - L.def[j].y) < 3) bad('V2', `defenders ${i},${j} closer than 3 m`);
  L.def.forEach((d, i) => { const dd = hyp(d.x - ball.x, d.y - ball.y); if (dd < 4) bad('V3', `def ${i} ${r1(dd)} m from the ball`); if (d.t === 'press' && dd < 6.5) bad('V3', `press ${i} ${r1(dd)} m from the ball`); });
  const ys = L.def.map(d => d.y).concat([(L.gk && L.gk.y) || 1.2]).sort((a, b) => a - b), ol = ys[1];
  L.att.forEach(a => { if (!(a.y >= ball.y || a.y >= ol + 0.6)) bad('V4', `#${a.num} starts offside (${a.y} v line ${ol})`); });
  if (ballP.length < 2 || ballP.length > 5 || decoys.length > 1) bad('V5', `${ballP.length} ball players, ${decoys.length} decoys`);
  const d0 = hyp(first.x - 25, first.y);
  if (tut ? (d0 < 46 || d0 > 50) : (d0 < 44 || d0 > 56)) bad('V6', `first ball player ${r1(d0)} m from goal`);
  // V8: a decoy is played no more than one round before the ball player whose pass uses his space
  L.order.forEach((ai, k) => { if (L.att[ai].role === 'decoy' && !(k + 1 < L.order.length && L.att[L.order[k + 1]].role === 'ball')) bad('V8', 'decoy not followed at once by a ball round'); });
  if (L.brief.length >= 110) bad('V9', 'brief ' + L.brief.length + ' chars');
  L.att.forEach(a => { if (!a.tip || a.tip.length >= 120) bad('V9', `#${a.num} tip ${a.tip ? a.tip.length : 0} chars`); });
  if (!sameEngine(L.engine, expectedEngine(fx))) bad('V10', `engine ${JSON.stringify(L.engine || null)} for fixture ${fx}`);
  const line = L.def.filter(d => d.t === 'line');
  const units = {}; line.forEach(d => (units[d.unit || 0] = units[d.unit || 0] || []).push(d));
  if (fx >= 5 && (Object.keys(units).length !== 1 || line.length < 2 || line.length > 5)) bad('V11', 'needs one back-line unit of 2-5');
  // ---- role test
  const roles = ctx.roles || [];
  const u = line.slice().sort((a, b) => a.x - b.x);
  const yL = u.length ? u.reduce((s, d) => s + d.y, 0) / u.length : null, cx = u.length ? u.reduce((s, d) => s + d.x, 0) / u.length : 25;
  const marks = L.def.filter(d => d.t === 'mark');
  if (u.length) {
    if (!tut && (yL < 18 || yL > 33)) bad('R1 line', 'height ' + r1(yL));
    if (ball.y - yL < 12) bad('R1 line', 'less than 12 m goal-side of the ball');
    if (Math.abs(cx - 25) > 8) bad('R1 line', 'unit centre ' + r1(cx));
    for (let k = 1; k < u.length; k++) {
      const sp = u[k].x - u[k - 1].x;
      if (u.length === 2) {
        const wide = sp >= 24 && sp <= 28 && marks.some(m => m.x > u[0].x && m.x < u[1].x);
        const close = sp >= 8 && sp <= 11.5 && (tpl.counter || tut);
        if (!wide && !close) bad('R1 line', `2-man line spacing ${r1(sp)}: 24-28 with a marker between, or 8-11.5 in a counter`);
      } else if (sp < 7.95 || sp > 11.55) bad('R1 line', 'spacing ' + r1(sp));
      else if (u.length === 4 && k === 2 && (sp < (tpl.squeezed ? 7.95 : 8.95) || sp > 11.05)) bad('R1 line', 'centre-half spacing ' + r1(sp));
    }
    const spds = u.map(d => d.spd === undefined ? 5.2 : d.spd);
    if (Math.max(...spds) - Math.min(...spds) > 0.1001) bad('R6', 'speeds inside the unit differ by more than 0.1');
  }
  const us = u.length ? (u[0].spd === undefined ? 5.2 : u[0].spd) : null;
  const tags = [];
  L.def.forEach((d, i) => {
    const spd = d.spd === undefined ? 5.2 : d.spd, agg = d.agg === undefined ? 0.5 : d.agg, ro = roles[i] || {};
    let tag = d.t;
    if (tut ? (spd < 4.0 || spd > 5.2) : (spd < 5.0 || spd > 5.7)) bad('3.2', `def ${i} spd ${spd}`);
    if (agg < 0.3 || agg > 0.8) bad('3.2', `def ${i} agg ${agg}`);
    if (us !== null && (d.t === 'mark' || d.t === 'press') && Math.abs(spd - us) > 0.3001) bad('5.2', `def ${i} speed ${spd} more than 0.3 off the line ${us}`);
    const inBox = d.y < 16.5 && d.x >= 8 && d.x <= 42;
    if (inBox) {
      const okLine = d.t === 'line' && ball.y <= 35;
      const okMark = d.t === 'mark' && L.att[d.a] && L.att[d.a].y < 16.5 && L.att[d.a].x >= 8 && L.att[d.a].x <= 42;
      if (!okLine && !okMark) bad('R2', `def ${i} home in the box`);
    }
    if (d.t === 'zone') {
      if (d.leash !== undefined && d.leash < 8 && !tut) bad('R3', `zone ${i} leash ${d.leash}`);
      if (d.eng !== undefined && (d.eng < 4 || d.eng > 7) && !tut) bad('3.2', `zone ${i} eng ${d.eng}`);
      if (yL !== null) { const fr = d.y - yL; if (fr < 6 || fr > 16) bad('R1 screen', `zone ${i} ${r1(fr)} m in front of the line`); if (Math.abs(d.x - cx) > 12) bad('R1 screen', `zone ${i} ${r1(Math.abs(d.x - cx))} m sideways of the line centre`); }
      let best = 99, lane = '';
      for (let a = 0; a < ballP.length; a++) for (let b = a + 1; b < ballP.length; b++) {
        const A = L.att[ballP[a]], B = L.att[ballP[b]], vx = B.x - A.x, vy = B.y - A.y, l2 = vx * vx + vy * vy;
        const t = Math.max(0, Math.min(1, ((d.x - A.x) * vx + (d.y - A.y) * vy) / l2)), dd = hyp(A.x + vx * t - d.x, A.y + vy * t - d.y);
        if (dd < best) { best = dd; lane = '#' + A.num + '-#' + B.num; }
      }
      if (best > 6 && !tut) bad('R1/R5 screen', `zone ${i} has no live lane within 6 m (nearest ${lane} ${r1(best)})`);
      tag += ' screens ' + lane + ' ' + r1(best) + ' m';
    }
    if (d.t === 'press') {
      // whom he hunts: from the generator's role list, else as set D inferred it (the earliest passer in the order
      // within 12 m of him, else the nearest passer)
      let who = ro.on !== undefined ? L.att[ro.on] : null, best = who ? hyp(who.x - d.x, who.y - d.y) : 99;
      if (!who) ballP.slice(0, -1).forEach(k => { const a = L.att[k], dd = hyp(a.x - d.x, a.y - d.y); if (!who && dd <= 12) { best = dd; who = a; } });
      if (!who) ballP.slice(0, -1).forEach(k => { const a = L.att[k], dd = hyp(a.x - d.x, a.y - d.y); if (dd < best) { best = dd; who = a; } });
      if (best < 6.5 || best > 12) bad('R1 hunter', `press ${i} ${r1(best)} m from #${who.num}`);
      if (d.y > ball.y + 3) bad('R1 hunter', `press ${i} more than 3 m behind the ball`);
      tag += ' hunts #' + who.num + ' at ' + r1(best) + ' m';
    }
    if (d.t === 'mark') {
      const m = L.att[d.a], dd = hyp(m.x - d.x, m.y - d.y);
      if (dd < 1.5 || dd > 3.5) bad('R1 marker', `mark ${i} ${r1(dd)} m from #${m.num}`);
      if (hyp(d.x - 25, d.y) >= hyp(m.x - 25, m.y)) bad('R1 marker', `mark ${i} not goal-side`);
      if (d.a === ballP[ballP.length - 1] && !tpl.markFinisher) bad('R1 marker', `mark ${i} on the finisher (only where the idea is losing your marker)`);
      if (d.eng !== undefined && (d.eng < 3.5 || d.eng > 6)) bad('3.2', `mark ${i} eng ${d.eng}`);
      if (d.react !== undefined && (d.react < 10 || d.react > 26)) bad('3.2', `mark ${i} react ${d.react}`);
      if (d.tight !== undefined && (d.tight < 0.8 || d.tight > 1.3)) bad('3.2', `mark ${i} tight ${d.tight}`);
      tag += ' marks #' + m.num;
    }
    if (d.t === 'line' && d.eng !== undefined && (d.eng < 5 || d.eng > 8)) bad('3.2', `line ${i} eng ${d.eng}`);
    if (yL !== null && d.t !== 'line' && d.t !== 'mark' && d.y < yL - 0.01) bad('R4', `def ${i} deeper than the back line`);
    if (yL !== null && d.t === 'mark' && d.y < yL - 0.01 && L.att[d.a].y > yL + 3.5) bad('R4', `mark ${i} deeper than the line, away from his man`);
    tags.push(tag);
  });
  if (L.def.filter(d => d.t === 'zone').length > 2) bad('R1 screen', 'more than 2 screens');
  if (L.def.filter(d => d.t === 'press').length > 2) bad('R1 hunter', 'more than 2 hunters');
  if (marks.length > 2) bad('R1 marker', 'more than 2 markers');
  if (L.gk && L.gk.sweeper && (yL === null || yL < 28)) bad('R1 keeper', 'sweeper behind a medium or low line');
  if (L.gk && L.gk.react !== undefined && L.gk.react !== 13 && fx > 3) bad('3.1', 'keeper react changed outside fixtures 1-3');
  if (!tpl.counter && L.def.length < L.att.length - 1) bad('R7', 'fewer outfield defenders than attackers minus one');
  // defenders per campaign slot (7.3): a should
  const nd = L.def.length, want = fx <= 4 ? [1, 2] : fx <= 8 ? [4, 6] : fx <= 14 ? [5, 7] : [6, 7];
  if (nd < want[0] || nd > want[1]) notes.push(`7.3 (should): ${nd} defenders, slot wants ${want[0]}-${want[1]}`);
  return { fails: out, notes, yL: yL === null ? null : r1(yL), roles: tags };
}

// ------------------------------------------------------------------ dynamic helpers (set D methods)
function chainFrom(L, SC, pre, r, sc0) {
  const recs = pre.slice();
  for (let k = r; k < L.order.length; k++) {
    const S = play(L, recs, L.order[k], k === r ? sc0 : SC[k]);
    if (S.status === 'fail') return { ok: false, round: k, reason: S.reason, own: k === r };
    recs[L.order[k]] = FB.finalRec(S);
  }
  const R = replay(L, recs);
  return R.status === 'goal' ? { ok: true } : { ok: false, round: L.order.length, reason: R.reason };
}
// how far a knob can move one way with the whole move still scoring: coarse steps (3x) until the first failure, then
// fine steps back from there, so the edge is found to the fine step at about a third of the cost
function side(test, step, max, sign) {
  let w = 0, why = 'limit', big = step * 3, d = big, failAt = null;
  for (; d <= max + 1e-9; d += big) { const r = test(sign * d); if (r.ok) w = d; else { failAt = d; why = (r.own ? '' : 'later r' + (r.round + 1) + ' ') + r.reason; break; } }
  if (failAt === null && w + step <= max + 1e-9 && max - w > 1e-9) { for (let e = w + step; e <= max + 1e-9; e += step) { const r = test(sign * e); if (r.ok) w = e; else { why = (r.own ? '' : 'later r' + (r.round + 1) + ' ') + r.reason; break; } } return { w: +w.toFixed(4), why }; }
  if (failAt !== null) { for (let e = failAt - big + step; e < failAt - 1e-9; e += step) { if (e <= 0) continue; const r = test(sign * e); if (r.ok) w = e; else { why = (r.own ? '' : 'later r' + (r.round + 1) + ' ') + r.reason; break; } } }
  return { w: +w.toFixed(4), why };
}

// tolerance windows. Steps are coarser than set D's (aim 1 degree, power 0.02) to keep the generator fast;
// they decide the same thresholds (15 degrees, 0.25, 1 s).
function windows(L, SC, sol) {
  const res = [];
  L.order.forEach((live, r) => {
    const sc = SC[r], pre = sol.pre[r], o = { r: r + 1, num: L.att[live].num, last: r === L.order.length - 1 };
    const chain = s => chainFrom(L, SC, pre, r, s);
    if (sc.decoy) { res.push(o); return; }
    let dwell = 0, dwellWhy = 'limit 3s';
    const dw = side(h => { const S = play(L, pre, live, Object.assign({}, sc, { hold: Math.abs(h) })); return S.status === 'fail' ? { ok: false, reason: S.reason, own: true } : { ok: true }; }, 3, 180, 1);
    dwell = dw.w; if (dw.why !== 'limit') dwellWhy = dw.why;
    o.dwell = r2(dwell / 60); o.dwellWhy = dwellWhy;
    if (sc.start !== undefined) {
      const maxEarly = Math.min(120, sc.start);
      const lo = maxEarly >= 2 ? side(d => chain(Object.assign({}, sc, { start: sc.start + d })), 2, maxEarly, -1) : { w: 0, why: 'starts at 0' };
      const hi = side(d => chain(Object.assign({}, sc, { start: sc.start + d })), 2, 120, 1);
      o.timing = { early: r2(lo.w / 60), late: r2(hi.w / 60), earlyWhy: lo.w >= maxEarly ? 'cannot go earlier' : lo.why, lateWhy: hi.why };
      o.timing.width = r2(o.timing.early + o.timing.late);
    }
    if (sc.kickAt && !o.last) {
      let kx = null, ky = null;
      play(L, pre, live, sc, S => { if (kx === null && S.liveKickTick >= 0) { kx = S.liveRec.kick.bx; ky = S.liveRec.kick.by; } });
      const rot = deg => { const dx = sc.kickAt[0] - kx, dy = sc.kickAt[1] - ky, t = deg * Math.PI / 180; return [kx + dx * Math.cos(t) - dy * Math.sin(t), ky + dx * Math.sin(t) + dy * Math.cos(t)]; };
      const lo = side(d => chain(Object.assign({}, sc, { kickAt: rot(d) })), 1, 30, -1), hi = side(d => chain(Object.assign({}, sc, { kickAt: rot(d) })), 1, 30, 1);
      o.aim = { w: r1(lo.w + hi.w), why: lo.why + ' | ' + hi.why };
      const plo = side(d => sc.power + d < 0.02 ? { ok: false, reason: 'min', own: true } : chain(Object.assign({}, sc, { power: sc.power + d })), 0.02, 0.5, -1);
      const phi = side(d => sc.power + d > 1 ? { ok: false, reason: 'max', own: true } : chain(Object.assign({}, sc, { power: sc.power + d })), 0.02, 0.5, 1);
      o.power = { w: r2(plo.w + phi.w), lo: r2(plo.w), hi: r2(phi.w), why: plo.why + ' | ' + phi.why };
    }
    res.push(o);
  });
  return res;
}
const GXS = []; for (let k = 0; k <= 41; k++) GXS.push(20.9 + k * 0.2);
const HOLDS = [0, 6, 12, 18, 24, 30, 36, 45, 60, 75, 90, 120];
function botFinish(L, SC, pre, full) {
  const r = L.order.length - 1, live = L.order[r], sc0 = SC[r];
  let shot = null;
  play(L, pre, live, sc0, S => { if (!shot && S.liveKickTick >= 0) shot = { x: S.liveRec.kick.bx, y: S.liveRec.kick.by }; });
  let open0 = 0, cornerOpen = null;
  for (const h of HOLDS) {
    let n = 0; for (const gx of GXS) { const S = play(L, pre, live, Object.assign({}, sc0, { kickAt: [gx, 0], power: 1, hold: h })); if (S.status === 'goal') n++; }
    const open = r1(n * 0.2); if (h === 0) open0 = open;
    if (cornerOpen === null && open < 1) cornerOpen = h === 0 ? 0 : r2(HOLDS[HOLDS.indexOf(h) - 1] / 60);
    if (open < 1 || !full) break;
  }
  return { dist: shot ? r1(hyp(shot.x - 25, shot.y)) : null, open0, cornerOpen: !full ? null : cornerOpen === null ? 2 : cornerOpen };
}
// owner probe (defending/finish.js) on round r: the bot's run until he has the ball, then dribble straight at goal to
// 18 m, stand and aim. For the finisher also the open goal while he stands (corner time).
function ownerProbe(L, SC, pre, r, Dm, withCorner) {
  const live = L.order[r];
  const ctrl = (hold, gx) => (S, me, st) => {
    if (S.liveKickTick >= 0) return {};
    const d = hyp(me.x - 25, me.y);
    if (!st.arrived && d > Dm + 0.2) { const dx = 25 - me.x, dy = -me.y, l = hyp(dx, dy); return { mx: dx / l, my: dy / l }; }
    if (!st.arrived) st.arrived = S.tick;
    st.h = (st.h || 0);
    const dx = gx - me.x, dy = -me.y, l = hyp(dx, dy);
    if (st.h++ < 12 + hold) return { mx: 0, my: 0, charging: true, aim: true, ax: dx / l, ay: dy / l, power: 1 };
    return { release: true };
  };
  const run = (c, hook) => { const S = FB.makeSim(L, pre, live), bot = makeBot(SC[r]), st = {}; while (S.status === 'play') { FB.step(S, S.ball.owner === live || st.started ? (st.started = true, c(S, S.att[live], st)) : bot(S)); if (hook) hook(S, st); } return S; };
  let recv = -1, arrive = -1, rx = 0, ry = 0;
  const S0 = run(ctrl(1e6, 25), (S, st) => { if (recv < 0 && S.ball.owner === live) { recv = S.tick; rx = S.att[live].x; ry = S.att[live].y; } if (st.arrived && arrive < 0) arrive = S.tick; });
  if (recv < 0) return { ok: false, why: 'never received: ' + S0.reason };
  const lostAfterRecv = S0.status === 'fail' ? r2((S0.tick - recv) / 60) : null, lostAfterStand = S0.status === 'fail' && arrive >= 0 ? r2((S0.tick - arrive) / 60) : null;
  const out = { ok: true, recvDist: r1(hyp(rx - 25, ry)), lostHow: S0.reason, lostAfterRecv, lostAfterStand };
  if (withCorner) {
    let cornerOpen = null, open0 = 0;
    for (const h of HOLDS) {
      let n = 0; for (const gx of GXS) { const S = run(ctrl(h, gx)); if (S.status === 'goal') n++; }
      const open = r1(n * 0.2); if (h === 0) open0 = open;
      if (cornerOpen === null && open < 1) cornerOpen = h === 0 ? 0 : r2(HOLDS[HOLDS.indexOf(h) - 1] / 60);
      if (open < 1) break;
    }
    out.open0 = open0; out.cornerOpen = cornerOpen === null ? 2 : cornerOpen;
  }
  return out;
}

function dynamicChecks(L, SC, ctx, opt) {
  opt = opt || {};
  const fx = ctx.fixture || 9, tut = fx <= 4, tpl = ctx.tpl || {}, band = ctx.band || {};
  const sol = solve(L, SC);
  const out = { fails: [], notes: [] }, bad = (r, m) => out.fails.push(r + ': ' + m), note = (r, m) => out.notes.push(r + ': ' + m);
  const stop = () => opt.early && out.fails.length > 0;
  if (!sol.ok) { bad('A2', 'bot route fails r' + (sol.failRound + 1) + ' ' + sol.reason); return out; }
  out.bot = r2(sol.time);
  const { ev } = analyse(L, sol.recs);
  const passes = ev.filter(e => e.rnum !== null && e.recv !== undefined);
  const runnerR = ctx.runner === undefined ? L.order.length - 1 : ctx.runner, runnerAtt = L.order[runnerR];
  const fin = passes.find(e => e.recv === runnerAtt) || passes[passes.length - 1];
  const cut = !!tpl.cutback;
  // J1
  const lanes = passes.map(e => r1(e.lane)), press = passes.slice(0, -1).map(e => r1(e.press));
  const tight = passes.filter(e => e.lane <= 2.0).length + passes.slice(0, -1).filter(e => e.press <= 3.5).length;
  out.J1 = { lanes, receiverPress: press, count: tight };
  if (!tut && tight < (band.j1 || 1)) bad('J1', `${tight} tight middle touches (needs ${band.j1 || 1})`);
  // J3
  const onside = r1(fin.ry - fin.ol);
  out.J3 = { onsideBy: onside, ahead: fin.ahead, passerPressed: r1(fin.pressD), line: fin.units };
  const j3bad = !fin.ahead || onside < 0.3 || onside > 5;
  if (j3bad && !tut) (cut ? note : bad)(cut ? 'J3 (cut-back, exempt)' : 'J3', `release receiver onside by ${onside}, ahead ${fin.ahead}`);
  if (!tut && !(fin.pressD <= 3 || /step/.test(fin.units))) note('J3 (should)', `passer's nearest defender ${r1(fin.pressD)} m, line ${fin.units}`);
  // J4a, J5
  out.J4a = r1(fin.cDist); out.J5close = r1(fin.press);
  if (!tut && (fin.cDist < 14 || fin.cDist > 32)) bad('J4a', 'runner controls ' + r1(fin.cDist) + ' m out');
  if (!tut && fin.press > 6.5) bad('J5', 'nearest defender ' + r1(fin.press) + ' m in the 0.47 s after control');
  if (stop()) return out;
  // J4b owner probe on the release receiver; J10 the bot's own finish
  const isLastRunner = runnerR === L.order.length - 1;
  out.owner = ownerProbe(L, SC, sol.pre[runnerR], runnerR, 18, isLastRunner && !opt.early);
  const o = out.owner;
  // In fixtures 5-8 option A is off by the owner's decision (rulebook 2.8, 9.1), and J4's numbers were measured with A on:
  // there the probe is reported as a should, not a must (the live fixtures 5-8 all fail it).
  const j4 = fx >= 9 ? bad : note;
  if (!tut) {
    if (!o.ok) j4('J4b', o.why);
    // tackled before he even reaches 18 m counts as closed down (the set D code failed it; the rule's intent is pressure)
    else if (!((o.lostAfterStand === null ? o.lostAfterRecv !== null : o.lostAfterStand <= 1.0) && o.lostAfterRecv !== null && o.lostAfterRecv <= 2.5)) j4(fx >= 9 ? 'J4b' : 'J4b (should, A off)', `owner probe: lost ${o.lostAfterStand} s after standing, ${o.lostAfterRecv} s after control (${o.lostHow})`);
  }
  if (stop()) return out;
  out.botShot = botFinish(L, SC, sol.pre[L.order.length - 1], !opt.early);
  if (out.botShot.open0 < 1) bad('J10', 'bot shot ' + out.botShot.open0 + ' m open');
  if (out.botShot.dist > 16 && out.botShot.open0 < 2) bad('J10', 'long shot with under 2 m open');
  if (stop()) return out;
  // windows: J2, J3 timing, J6, J7
  const W = windows(L, SC, sol); out.W = W;
  let j2 = 0; const j2l = [];
  W.forEach(o => {
    if (o.last) return;
    if (o.aim && o.aim.w < 15) { j2++; j2l.push('r' + o.r + ' aim ' + o.aim.w + '°'); }
    if (o.aim && o.aim.w < 3 && !tut) bad('J2', 'r' + o.r + ' aim window ' + o.aim.w + '° (below 3°)');
    if (o.power && o.power.w < 0.25) { j2++; j2l.push('r' + o.r + ' power ' + o.power.w); }
    if (o.timing && o.timing.width < 1) { j2++; j2l.push('r' + o.r + ' timing ' + o.timing.width + 's'); }
  });
  out.J2 = { count: j2, list: j2l };
  const j2band = band.j2 || [1, 5];
  if (!tut && (j2 < j2band[0] || j2 > j2band[1])) bad('J2', `${j2} tight windows (band ${j2band[0]}-${j2band[1]})`);
  const ft = W[runnerR].timing;
  out.J3.window = ft ? ft.width : null;
  if (!tut && (!ft || ft.width < 0.3 || ft.width > 2.5)) (cut ? note : bad)(cut ? 'J3 (cut-back, exempt)' : 'J3', 'release run-timing window ' + (ft ? ft.width : '-') + ' s');
  const ballR = W.filter(o => o.dwell !== undefined);
  const ch = L.order.filter(i => L.att[i].role === 'ball');
  // the lane from the first passer to the F-phase receiver (the feed of 4.1); without an F phase, to the second ball player
  const ph = String(tpl.phases || '').split(/\s+/).filter(Boolean).map(x => x.replace(/\(.*\)/, ''));
  const balls = ph.filter(x => x !== 'decoy'), fI = balls.indexOf('F'), fRecv = ch[fI >= 0 && fI + 1 < ch.length ? fI + 1 : 1];
  out.J6lane = '#' + L.att[ch[0]].num + '-#' + L.att[fRecv].num;
  const zoneLane = L.def.some(d => { if (d.t !== 'zone') return false; const A = L.att[ch[0]], B = L.att[fRecv], vx = B.x - A.x, vy = B.y - A.y, l2 = vx * vx + vy * vy, t = Math.max(0, Math.min(1, ((d.x - A.x) * vx + (d.y - A.y) * vy) / l2)); return hyp(A.x + vx * t - d.x, A.y + vy * t - d.y) <= 3; });
  out.J6 = { dwell: ballR.slice(0, 2).map(o => o.dwell), zoneOnLane: zoneLane };
  if (!tut && !(ballR.slice(0, 2).some(o => o.dwell <= 1.7) || zoneLane)) bad('J6', 'no hunter or screen forcing the early passes');
  ballR.forEach(o => {
    if (o.last) return;
    const edge = (o.aim && o.aim.w < 40) || (o.power && o.power.w < 0.5) || (o.timing && o.timing.width < 2);
    if (!(o.dwell <= 3 || edge)) bad('J7', 'r' + o.r + ' passenger round');
  });
  if (opt.early && !out.fails.length) {   // a keeper: fill in the corner times for the report
    out.owner = ownerProbe(L, SC, sol.pre[runnerR], runnerR, 18, isLastRunner);
    out.botShot = botFinish(L, SC, sol.pre[L.order.length - 1], true);
  }
  return out;
}

// ------------------------------------------------------------------ A3 jitter (tools/test.js --jitter method, seeded per level)
function jitter(L, SC, sol, seed) {
  let s = (seed >>> 0) || 12345; const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  const perturb = sc => { const c = JSON.parse(JSON.stringify(sc)), j = m => (rnd() * 2 - 1) * m;
    if (c.start !== undefined) c.start = Math.max(0, Math.round(c.start + j(8)));
    if (c.power !== undefined) c.power = Math.min(1, Math.max(0.05, c.power + j(0.06)));
    if (c.kickAt) { c.kickAt[0] += j(0.9); c.kickAt[1] += j(0.9); }
    (c.carry || []).forEach(w => { w[0] += j(0.7); w[1] += j(0.7); });
    (c.pre || []).forEach(w => { w[0] += j(0.7); w[1] += j(0.7); });
    (c.decoy || []).forEach(w => { w[0] += j(1.0); w[1] += j(1.0); });
    return c; };
  return L.order.map((live, r) => { let w = 0; const N = 40; for (let n = 0; n < N; n++) { const S = play(L, sol.pre[r], live, perturb(SC[r])); if (S.status !== 'fail') w++; } return Math.round(100 * w / N); });
}

// ------------------------------------------------------------------ A5 decoy tests (5.3)
function decoyTests(L, SC, sol) {
  const out = [];
  L.order.forEach((di, k) => {
    if (L.att[di].role !== 'decoy') return;
    const t = { num: L.att[di].num };
    const run = SC[k].decoy, a = L.att[di];
    t.designedRun = r1(run.reduce((s, p, i) => s + hyp(p[0] - (i ? run[i - 1][0] : a.x), p[1] - (i ? run[i - 1][1] : a.y)), 0));
    const mi = L.def.findIndex(d => d.t === 'mark' && d.a === di);
    let drag = 0, tick10 = -1;
    replay(L, sol.recs, S => { if (mi < 0) return; const d = S.def[mi], dd = hyp(d.x - d.hx, d.y - d.hy); if (dd > drag) drag = dd; if (tick10 < 0 && dd >= 10) tick10 = S.tick; });
    t.drag = r1(drag);
    const from = (k2, recs, sc) => { const rc = recs.slice(); for (let q = k2; q < L.order.length; q++) { const S = play(L, rc, L.order[q], sc[q]); if (S.status === 'fail') return { ok: false, why: 'r' + (q + 1) + ' ' + S.reason }; rc[L.order[q]] = FB.finalRec(S); } const R = replay(L, rc); return { ok: R.status === 'goal', why: R.status === 'goal' ? 'goal' : 'replay ' + R.reason }; };
    // needed: the decoy stands still and presses DONE; the bot's route must then fail
    const still = SC.slice(); still[k] = { decoy: [[a.x, a.y]] };
    const n = from(k, sol.pre[k], still); t.needed = !n.ok; t.neededWhy = n.why;
    // truncation: freeze his recording at the tick his marker has moved 10 m from home; the route must still score
    if (tick10 >= 0) {
      const rc = sol.pre[k].slice(), rec = JSON.parse(JSON.stringify(sol.recs[di]));
      for (let q = tick10; q < rec.len; q++) { rec.x[q] = rec.x[tick10]; rec.y[q] = rec.y[tick10]; }
      rc[di] = rec;
      const tr = from(k + 1, rc, SC); t.truncation = tr.ok; t.truncWhy = tr.why;
    } else { t.truncation = true; t.truncWhy = 'marker never moved 10 m'; }
    out.push(t);
  });
  return out;
}

// ------------------------------------------------------------------ A6 human model, J8, J9
const seedFor = (k, tierIdx) => (1 * 2654435761 + tierIdx * 40503 + k * 9973 + 1 * 7477 + 1) >>> 0;
function model(L, opts) {
  opts = opts || {};
  const env = { FB, LEVELS: [L], root: 'gen' }, N = opts.n || 30, tier = opts.tier || 'owner', ti = ['owner', 'novice', 'regular', 'expert'].indexOf(tier);
  const res = []; for (let k = 0; k < N; k++) res.push(H.playLevel(env, 0, tier, seedFor(k, ti), { maxTakes: opts.max || 60 }));
  const MAX = opts.max || 60, takes = res.map(r => r.cleared ? r.takes : MAX + 1).sort((a, b) => a - b);
  const med = takes.length % 2 ? takes[takes.length >> 1] : (takes[takes.length / 2 - 1] + takes[takes.length / 2]) / 2;
  const byRound = L.order.map(() => 0), reasons = {}; let fails = 0;
  res.forEach(r => { r.failsByRound.forEach((v, i) => { byRound[i] += v; fails += v; }); for (const k in r.reasons) reasons[k] = (reasons[k] || 0) + r.reasons[k]; });
  const share = pre => fails ? Object.keys(reasons).filter(k => k.startsWith(pre)).reduce((s, k) => s + reasons[k], 0) / fails : 0;
  return {
    median: med, p25: takes[Math.floor(0.25 * N)], p75: takes[Math.floor(0.75 * N)], cleared: res.filter(r => r.cleared).length / N,
    beyond30: res.filter(r => !r.cleared || r.takes > 30).length / N,
    fails, middle: fails ? (fails - byRound[byRound.length - 1]) / fails : 0, byRound: byRound.map(v => fails ? r2(v / fails) : 0),
    bump: r2(share('bump')), out: r2(share('out')), early: r2(share('early')),
    replayOk: res.every(r => !r.cleared || r.replayOk),
    top: Object.keys(reasons).sort((a, b) => reasons[b] - reasons[a]).slice(0, 3).map(k => k + ' ' + Math.round(100 * reasons[k] / (fails || 1)) + '%')
  };
}

// ------------------------------------------------------------------ final checks at the real clock: A2, A3, A5, A6-A8
function finalChecks(L, SC, ctx, seed) {
  const fx = ctx.fixture || 9, band = ctx.band || {}, out = { fails: [], notes: [] }, bad = (r, m) => out.fails.push(r + ': ' + m), note = (r, m) => out.notes.push(r + ': ' + m);
  const sol = solve(L, SC);
  if (!sol.ok) { bad('A2', 'bot route fails r' + (sol.failRound + 1) + ' ' + sol.reason + ' at clock ' + L.time); return out; }
  out.bot = r2(sol.time); out.ratio = r2(sol.time / L.time); out.slack = r2(L.time - sol.time);
  out.A3 = jitter(L, SC, sol, seed);
  if (out.A3.some(v => v < 45)) bad('A3', 'jitter ' + out.A3.join('/') + ' (a round under 45%)');
  out.A5 = decoyTests(L, SC, sol);
  out.A5.forEach(t => {
    if (t.designedRun > 10.05) bad('A5', `decoy #${t.num} run ${t.designedRun} m (over 10)`);
    if (t.drag > 12) bad('A5', `decoy #${t.num} drags his marker ${t.drag} m (over 12)`);
    if (!t.needed) bad('A5', `decoy #${t.num} not needed (standing still the route still scores)`);
    if (!t.truncation) bad('A5', `decoy #${t.num} truncation fails (${t.truncWhy})`);
  });
  if (out.ratio > 0.80) bad('A7', 'bot/clock ' + out.ratio);
  if (band.ratio && (out.ratio < band.ratio[0] || out.ratio > band.ratio[1])) note('A7 (band)', `bot/clock ${out.ratio}, band ${band.ratio.join('-')}`);
  if (L.time < 7 || L.time > 14 || L.time !== Math.round(L.time)) bad('3.1', 'clock ' + L.time + ' s');
  const m = ctx.modelCache || model(L);
  out.A6 = m;
  if (m.cleared < 0.9) bad('A6', `owner model clears ${Math.round(m.cleared * 100)}% within 60 takes`);
  if (band.model && (m.median < band.model[0] || m.median > band.model[1])) bad('A6', `owner model median ${m.median}, band ${band.model.join('-')}`);
  if (m.bump > 0.05 || m.out > 0.10 || m.early > 0) bad('J8', `bump ${m.bump}, out ${m.out}, early ${m.early}`);
  if (fx > 4 && (m.middle < 0.3 || m.middle > 0.7)) note('J9 (flag)', 'share of failures before the last player ' + r2(m.middle));
  if (ctx.novice && fx <= 20) { const nv = model(L, { tier: 'novice' }); out.novice = nv; if (nv.beyond30 > 0.25) bad('9 novice', `${Math.round(nv.beyond30 * 100)}% of novices beyond 30 takes`); }
  const h1 = replayHash(L, sol.recs), h2 = replayHash(L, sol.recs);
  out.A8 = h1.hash === h2.hash && h1.status === 'goal' && m.replayOk;
  if (!out.A8) bad('A8', 'replay not identical');
  return out;
}

module.exports = { staticChecks, dynamicChecks, finalChecks, model, jitter, decoyTests, expectedEngine, ENGINE };
