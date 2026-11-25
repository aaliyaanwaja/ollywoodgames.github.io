// Acceptance checks of RULEBOOK.md (version 1) section 8 for set D, on the live engine (copy in root/), bot routes of
// design.js. Methods follow the foundation forensics scripts (dwell.js, windows2.js, aim3.js, finish.js) and the owner
// probe of defending/finish.js; differences are noted next to the code.
// node checks.js [n ...] [--json out.json]
'use strict';
const { FB, C, play, replay, solve, analyse } = require('./lab.js');
const D = require('./design.js'), hyp = Math.hypot;
const r1 = v => Math.round(v * 10) / 10, r2 = v => Math.round(v * 100) / 100;
const lungeR = d => C.lungeR + C.lungeAgg * (d.agg === undefined ? 0.5 : d.agg);

// ------------------------------------------------------------------ static: V1-V11 and the role test (5.4)
function staticChecks(L) {
  const out = [], bad = (rule, msg) => out.push(rule + ': ' + msg);
  const ballP = L.order.filter(i => L.att[i].role === 'ball'), decoys = L.order.filter(i => L.att[i].role === 'decoy');
  const first = L.att[ballP[0]], ball = { x: first.x, y: first.y - C.ballOff };
  const all = L.att.concat(L.def);
  all.forEach((p, i) => { if (p.x < 3 || p.x > 47 || p.y < 4 || p.y > 57) bad('V1', 'start outside the area: ' + JSON.stringify([p.x, p.y])); });
  for (let i = 0; i < L.att.length; i++) for (let j = i + 1; j < L.att.length; j++) if (hyp(L.att[i].x - L.att[j].x, L.att[i].y - L.att[j].y) < 3) bad('V2', `attackers ${i},${j} closer than 3 m`);
  for (let i = 0; i < L.def.length; i++) for (let j = i + 1; j < L.def.length; j++) if (hyp(L.def[i].x - L.def[j].x, L.def[i].y - L.def[j].y) < 3) bad('V2', `defenders ${i},${j} closer than 3 m`);
  L.def.forEach((d, i) => { const dd = hyp(d.x - ball.x, d.y - ball.y); if (dd < 4) bad('V3', `def ${i} ${r1(dd)} m from the ball`); if (d.t === 'press' && dd < 6.5) bad('V3', `press ${i} ${r1(dd)} m from the ball`); });
  const ys = L.def.map(d => d.y).concat([(L.gk && L.gk.y) || 1.2]).sort((a, b) => a - b), ol = ys[1];
  L.att.forEach((a, i) => { if (!(a.y >= ball.y || a.y >= ol + 0.6)) bad('V4', `#${a.num} starts offside (${a.y} v line ${ol})`); });
  if (ballP.length < 2 || ballP.length > 5 || decoys.length > 1) bad('V5', `${ballP.length} ball players, ${decoys.length} decoys`);
  const d0 = hyp(first.x - 25, first.y); if (d0 < 44 || d0 > 56) bad('V6', `first ball player ${r1(d0)} m from goal`);
  if (L.brief.length >= 110) bad('V9', 'brief ' + L.brief.length + ' chars');
  L.att.forEach(a => { if (a.tip.length >= 120) bad('V9', `#${a.num} tip ${a.tip.length} chars`); });
  if (L.engine) bad('V10', 'engine field present (rating levels use the live defaults, fixture 9+)');
  const line = L.def.filter(d => d.t === 'line');
  const units = {}; line.forEach(d => (units[d.unit || 0] = units[d.unit || 0] || []).push(d));
  if (Object.keys(units).length !== 1 || line.length < 2 || line.length > 5) bad('V11', 'needs one back-line unit of 2-5');
  // ---- role test
  const u = line.slice().sort((a, b) => a.x - b.x), yL = u.reduce((s, d) => s + d.y, 0) / u.length, cx = u.reduce((s, d) => s + d.x, 0) / u.length;
  if (yL < 18 || yL > 33) bad('R1 line', 'height ' + r1(yL));
  if (ball.y - yL < 12) bad('R1 line', 'less than 12 m goal-side of the ball');
  if (Math.abs(cx - 25) > 8) bad('R1 line', 'unit centre ' + r1(cx));
  const marks = L.def.filter(d => d.t === 'mark');
  for (let k = 1; k < u.length; k++) {
    const sp = u[k].x - u[k - 1].x;
    if (u.length === 2) { if (!(sp >= 24 && sp <= 28 && marks.some(m => m.x > u[0].x && m.x < u[1].x))) bad('R1 line', '2-man line spacing ' + sp + ' needs 24-28 with a marker between'); }
    else if (sp < 8 || sp > 11.5) bad('R1 line', 'spacing ' + sp);
  }
  const spds = u.map(d => d.spd === undefined ? 5.2 : d.spd), us = spds[0];
  if (Math.max(...spds) - Math.min(...spds) > 0.1001) bad('R6', 'speeds inside the unit differ by more than 0.1');
  L.def.forEach((d, i) => {
    const spd = d.spd === undefined ? 5.2 : d.spd, agg = d.agg === undefined ? 0.5 : d.agg;
    if (spd < 5.0 || spd > 5.7) bad('3.2', `def ${i} spd ${spd}`);
    if (agg < 0.3 || agg > 0.8) bad('3.2', `def ${i} agg ${agg}`);
    if ((d.t === 'mark' || d.t === 'press') && Math.abs(spd - us) > 0.3001) bad('5.2', `def ${i} speed ${spd} more than 0.3 off the line ${us}`);
    const inBox = d.y < 16.5 && d.x >= 8 && d.x <= 42;
    if (inBox) bad('R2', `def ${i} home in the box`);
    if (d.t === 'zone') {
      if (d.leash !== undefined && d.leash < 8) bad('R3', `zone ${i} leash ${d.leash}`);
      if (d.eng !== undefined && (d.eng < 5 || d.eng > 7)) bad('3.2', `zone ${i} eng ${d.eng}`);
      const fr = d.y - yL; if (fr < 6 || fr > 16) bad('R1 screen', `zone ${i} ${r1(fr)} m in front of the line`);
      if (Math.abs(d.x - cx) > 12) bad('R1 screen', `zone ${i} ${r1(Math.abs(d.x - cx))} m sideways of the line centre`);
      let best = 99, lane = '';
      for (let a = 0; a < ballP.length; a++) for (let b = a + 1; b < ballP.length; b++) {
        const A = L.att[ballP[a]], B = L.att[ballP[b]], vx = B.x - A.x, vy = B.y - A.y, l2 = vx * vx + vy * vy;
        const t = Math.max(0, Math.min(1, ((d.x - A.x) * vx + (d.y - A.y) * vy) / l2)), dd = hyp(A.x + vx * t - d.x, A.y + vy * t - d.y);
        if (dd < best) { best = dd; lane = '#' + A.num + '-#' + B.num; }
      }
      if (best > 6) bad('R1/R5 screen', `zone ${i} has no live lane within 6 m (nearest ${lane} ${r1(best)})`);
      d._lane = lane + ' ' + r1(best) + ' m';
    }
    if (d.t === 'press') {
      // the passer he hunts: the earliest passer in the order within 12 m of him (else the nearest passer)
      let best = 99, who = null;
      ballP.slice(0, -1).forEach(k => { const a = L.att[k], dd = hyp(a.x - d.x, a.y - d.y); if (!who && dd <= 12) { best = dd; who = a; } });
      if (!who) ballP.slice(0, -1).forEach(k => { const a = L.att[k], dd = hyp(a.x - d.x, a.y - d.y); if (dd < best) { best = dd; who = a; } });
      if (best < 6.5 || best > 12) bad('R1 hunter', `press ${i} ${r1(best)} m from #${who.num}`);
      if (d.y > who.y + 3) bad('R1 hunter', `press ${i} more than 3 m behind the ball`);
      d._hunts = '#' + who.num + ' at ' + r1(best) + ' m';
    }
    if (d.t === 'mark') {
      const m = L.att[d.a], dd = hyp(m.x - d.x, m.y - d.y);
      if (dd < 1.5 || dd > 3.5) bad('R1 marker', `mark ${i} ${r1(dd)} m from #${m.num}`);
      if (hyp(d.x - 25, d.y) >= hyp(m.x - 25, m.y)) bad('R1 marker', `mark ${i} not goal-side`);
      const isLast = d.a === ballP[ballP.length - 1];
      if (isLast && !/^A7/.test(L.key)) bad('R1 marker', `mark ${i} on the finisher (only where the idea is losing your marker)`);
      if (d.eng !== undefined && (d.eng < 3.5 || d.eng > 6)) bad('3.2', `mark ${i} eng ${d.eng}`);
      if (d.react !== undefined && (d.react < 10 || d.react > 26)) bad('3.2', `mark ${i} react ${d.react}`);
      if (d.tight !== undefined && (d.tight < 0.8 || d.tight > 1.3)) bad('3.2', `mark ${i} tight ${d.tight}`);
    }
    if (d.t === 'line' && d.eng !== undefined && (d.eng < 5 || d.eng > 8)) bad('3.2', `line ${i} eng ${d.eng}`);
    if (d.t !== 'line' && d.t !== 'mark' && d.y < yL - 0.01) bad('R4', `def ${i} deeper than the back line`);
    if (d.t === 'mark' && d.y < yL - 0.01 && L.att[d.a].y > yL + 3.5) bad('R4', `mark ${i} deeper than the line, away from his man`);
  });
  if (L.def.filter(d => d.t === 'zone').length > 2) bad('R1 screen', 'more than 2 screens');
  if (L.def.filter(d => d.t === 'press').length > 2) bad('R1 hunter', 'more than 2 hunters');
  if (marks.length > 2) bad('R1 marker', 'more than 2 markers');
  if (L.gk && L.gk.sweeper && yL < 28) bad('R1 keeper', 'sweeper behind a medium or low line');
  if (L.def.length < L.att.length - 1) bad('R7', 'fewer outfield defenders than attackers minus one');
  return { fails: out, yL: r1(yL), roles: L.def.map((d, i) => d.t + (d._hunts ? ' hunts ' + d._hunts : '') + (d._lane ? ' screens ' + d._lane : '') + (d.t === 'mark' ? ' marks #' + L.att[d.a].num : '')) };
}

// ------------------------------------------------------------------ dynamic helpers
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
function side(test, step, max, sign) { let w = 0, why = 'limit'; for (let d = step; d <= max + 1e-9; d += step) { const r = test(sign * d); if (r.ok) w = d; else { why = (r.own ? '' : 'later r' + (r.round + 1) + ' ') + r.reason; break; } } return { w, why }; }

function windows(L, SC, sol) {
  const res = [];
  L.order.forEach((live, r) => {
    const sc = SC[r], pre = sol.pre[r], o = { r: r + 1, num: L.att[live].num, last: r === L.order.length - 1 };
    const chain = s => chainFrom(L, SC, pre, r, s);
    if (sc.decoy) { res.push(o); return; }
    // dwell (dwell.js): extra ticks standing on the ball, aiming, before his own round fails
    let dwell = 0, dwellWhy = 'limit 3s';
    for (let h = 3; h <= 180; h += 3) { const S = play(L, pre, live, Object.assign({}, sc, { hold: h })); if (S.status === 'fail') { dwellWhy = S.reason; break; } dwell = h; }
    o.dwell = r2(dwell / 60); o.dwellWhy = dwellWhy;
    if (sc.start !== undefined) {   // windows2.js timing, chain criterion
      const maxEarly = Math.min(120, sc.start);
      const lo = maxEarly >= 2 ? side(d => chain(Object.assign({}, sc, { start: sc.start + d })), 2, maxEarly, -1) : { w: 0, why: 'starts at 0' };
      const hi = side(d => chain(Object.assign({}, sc, { start: sc.start + d })), 2, 120, 1);
      o.timing = { early: r2(lo.w / 60), late: r2(hi.w / 60), earlyWhy: lo.w >= maxEarly ? 'cannot go earlier' : lo.why, lateWhy: hi.why, capped: lo.w >= maxEarly && maxEarly < 120 };
      o.timing.width = r2(o.timing.early + o.timing.late);
    }
    if (sc.kickAt && !o.last) {
      // aim3.js: aim point turned about the spot where the bot actually kicks
      let kx = null, ky = null;
      play(L, pre, live, sc, S => { if (kx === null && S.liveKickTick >= 0) { kx = S.liveRec.kick.bx; ky = S.liveRec.kick.by; } });
      const rot = deg => { const dx = sc.kickAt[0] - kx, dy = sc.kickAt[1] - ky, t = deg * Math.PI / 180; return [kx + dx * Math.cos(t) - dy * Math.sin(t), ky + dx * Math.sin(t) + dy * Math.cos(t)]; };
      const lo = side(d => chain(Object.assign({}, sc, { kickAt: rot(d) })), 0.5, 60, -1), hi = side(d => chain(Object.assign({}, sc, { kickAt: rot(d) })), 0.5, 60, 1);
      o.aim = { w: r1(lo.w + hi.w), why: lo.why + ' | ' + hi.why };
      const plo = side(d => sc.power + d < 0.02 ? { ok: false, reason: 'min', own: true } : chain(Object.assign({}, sc, { power: sc.power + d })), 0.01, 1, -1);
      const phi = side(d => sc.power + d > 1 ? { ok: false, reason: 'max', own: true } : chain(Object.assign({}, sc, { power: sc.power + d })), 0.01, 1, 1);
      o.power = { w: r2(plo.w + phi.w), lo: r2(plo.w), hi: r2(phi.w), why: plo.why + ' | ' + phi.why, capped: sc.power + phi.w >= 0.999 || sc.power - plo.w <= 0.021 };
    }
    res.push(o);
  });
  return res;
}

const GXS = []; for (let k = 0; k <= 41; k++) GXS.push(20.9 + k * 0.2);
const HOLDS = [0, 6, 12, 18, 24, 30, 36, 45, 60, 75, 90, 120];
// the bot's own finish (forensics/finish.js "goal open"): same shot, full power, aimed along the goal line
function botFinish(L, SC, pre) {
  const r = L.order.length - 1, live = L.order[r], sc0 = SC[r];
  let shot = null;
  play(L, pre, live, sc0, S => { if (!shot && S.liveKickTick >= 0) shot = { x: S.liveRec.kick.bx, y: S.liveRec.kick.by }; });
  let open0 = 0, cornerOpen = null;
  for (const h of HOLDS) {
    let n = 0; for (const gx of GXS) { const S = play(L, pre, live, Object.assign({}, sc0, { kickAt: [gx, 0], power: 1, hold: h })); if (S.status === 'goal') n++; }
    const open = r1(n * 0.2); if (h === 0) open0 = open;
    if (cornerOpen === null && open < 1) cornerOpen = h === 0 ? 0 : r2(HOLDS[HOLDS.indexOf(h) - 1] / 60);
  }
  return { dist: shot ? r1(hyp(shot.x - 25, shot.y)) : null, open0, cornerOpen: cornerOpen === null ? 2 : cornerOpen };
}
// owner probe (defending/finish.js): the bot's run until he has the ball, then dribble straight at goal to 18 m, stand, aim
function ownerProbe(L, SC, pre, Dm) {
  const r = L.order.length - 1, live = L.order[r];
  const { makeBot } = require('./lab.js');
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
  let open0 = 0, cornerOpen = null;
  for (const h of HOLDS) {
    let n = 0; for (const gx of GXS) { const S = run(ctrl(h, gx)); if (S.status === 'goal') n++; }
    const open = r1(n * 0.2); if (h === 0) open0 = open;
    if (cornerOpen === null && open < 1) cornerOpen = h === 0 ? 0 : r2(HOLDS[HOLDS.indexOf(h) - 1] / 60);
  }
  return { ok: true, recvDist: r1(hyp(rx - 25, ry)), lostHow: S0.reason, lostAfterRecv, lostAfterStand, open0, cornerOpen: cornerOpen === null ? 2 : cornerOpen };
}

const BANDS = { standard: [0.58, 0.66], hard: [0.64, 0.72] };
function dynamicChecks(L, SC) {
  const sol = solve(L, SC);
  const out = { fails: [], notes: [] }, bad = (r, m) => out.fails.push(r + ': ' + m), note = (r, m) => out.notes.push(r + ': ' + m);
  if (!sol.ok) { bad('A2', 'bot route fails r' + (sol.failRound + 1) + ' ' + sol.reason); return out; }
  out.bot = r2(sol.time); out.ratio = r2(sol.time / L.time); out.slack = r2(L.time - sol.time);
  if (out.ratio > 0.80) bad('A7', 'bot/clock ' + out.ratio);
  const { ev } = analyse(L, sol.recs);
  const passes = ev.filter(e => e.rnum !== null && e.recv !== undefined), fin = passes[passes.length - 1];
  // J1
  const lanes = passes.map(e => r1(e.lane)), press = passes.slice(0, -1).map(e => r1(e.press));
  const tight = passes.filter(e => e.lane <= 2.0).length + passes.slice(0, -1).filter(e => e.press <= 3.5).length;
  out.J1 = { lanes, receiverPress: press, count: tight };
  if (tight < 1) bad('J1', 'no tight middle touch');
  // J3
  const onside = r1(fin.ry - fin.ol);
  out.J3 = { onsideBy: onside, ahead: fin.ahead, passerPressed: r1(fin.pressD), line: fin.units };
  if (!fin.ahead || onside < 0.3 || onside > 5) bad('J3', `final receiver onside by ${onside}, ahead ${fin.ahead}`);
  if (!(fin.pressD <= 3 || /step/.test(fin.units))) note('J3 (should)', `passer's nearest defender ${r1(fin.pressD)} m, line ${fin.units}`);
  // J4a, J5 (closing defender)
  out.J4a = r1(fin.cDist);
  if (fin.cDist < 14 || fin.cDist > 32) bad('J4a', 'finisher controls ' + r1(fin.cDist) + ' m out');
  out.J5close = r1(fin.press);
  if (fin.press > 6.5) bad('J5', 'nearest defender ' + r1(fin.press) + ' m in the 0.47 s after control');
  // windows: J2, J3 timing, J6, J7
  const W = windows(L, SC, sol); out.W = W;
  let j2 = 0; const j2l = [];
  W.forEach(o => {
    if (o.aim && o.aim.w < 15) { j2++; j2l.push('r' + o.r + ' aim ' + o.aim.w + '°'); }
    if (o.aim && o.aim.w < 3) bad('J2', 'r' + o.r + ' aim window ' + o.aim.w + '° (below 3°)');
    if (o.power && o.power.w < 0.25) { j2++; j2l.push('r' + o.r + ' power ' + o.power.w); }
    if (o.timing && o.timing.width < 1) { j2++; j2l.push('r' + o.r + ' timing ' + o.timing.width + 's'); }
  });
  out.J2 = { count: j2, list: j2l };
  if (j2 < 1 || j2 > 5) bad('J2', j2 + ' tight windows');
  const ft = W[W.length - 1].timing;
  out.J3.window = ft ? ft.width : null;
  if (!ft || ft.width < 0.3 || ft.width > 2.5) bad('J3', 'finisher run-timing window ' + (ft ? ft.width : '-') + ' s');
  const ballR = W.filter(o => o.dwell !== undefined);
  const zoneLane = L.def.some(d => { if (d.t !== 'zone') return false; const A = L.att[L.order[0]], B = L.att[L.order[1]], vx = B.x - A.x, vy = B.y - A.y, l2 = vx * vx + vy * vy, t = Math.max(0, Math.min(1, ((d.x - A.x) * vx + (d.y - A.y) * vy) / l2)); return hyp(A.x + vx * t - d.x, A.y + vy * t - d.y) <= 3; });
  out.J6 = { dwell: ballR.slice(0, 2).map(o => o.dwell), zoneOnLane: zoneLane };
  if (!(ballR.slice(0, 2).some(o => o.dwell <= 1.7) || zoneLane)) bad('J6', 'no hunter or screen forcing the early passes');
  ballR.forEach(o => {
    if (o.last) return;
    const edge = (o.aim && o.aim.w < 40) || (o.power && o.power.w < 0.5) || (o.timing && o.timing.width < 2);
    if (!(o.dwell <= 3 || edge)) bad('J7', 'r' + o.r + ' passenger round');
  });
  // J4b owner probe, J10 bot finish
  const pre = sol.pre[L.order.length - 1];
  out.owner = ownerProbe(L, SC, pre, 18);
  const o = out.owner;
  if (!o.ok) bad('J4b', o.why);
  else if (!(o.lostAfterStand !== null && o.lostAfterStand <= 1.0 && o.lostAfterRecv <= 2.5)) bad('J4b', `owner probe: lost ${o.lostAfterStand} s after standing, ${o.lostAfterRecv} s after control (${o.lostHow})`);
  out.botShot = botFinish(L, SC, pre);
  if (out.botShot.open0 < 1) bad('J10', 'bot shot ' + out.botShot.open0 + ' m open');
  if (out.botShot.dist > 16 && out.botShot.open0 < 2) bad('J10', 'long shot with under 2 m open');
  return out;
}

module.exports = { staticChecks, dynamicChecks };
if (require.main === module) {
  const ids = process.argv.slice(2).map(Number).filter(Boolean), all = [];
  (ids.length ? ids : [1, 2, 3, 4, 5]).forEach(id => {
    const L = D.LEVELS[id - 1], SC = D.SCRIPTS[id - 1];
    const st = staticChecks(L), dy = dynamicChecks(L, SC);
    all.push({ id, key: L.key, st, dy });
    console.log(`== ${id} ${L.key}  clock ${L.time}s bot ${dy.bot}s ratio ${dy.ratio} slack ${dy.slack}  line y ${st.yL}`);
    console.log('   roles: ' + st.roles.join('; '));
    console.log('   static: ' + (st.fails.length ? 'FAIL ' + st.fails.join(' / ') : 'pass'));
    if (dy.J1) {
      console.log(`   J1 lanes ${dy.J1.lanes.join(', ')} | receiver press ${dy.J1.receiverPress.join(', ')} | tight touches ${dy.J1.count}`);
      console.log(`   J2 ${dy.J2.count}: ${dy.J2.list.join(', ')}`);
      console.log(`   J3 onside by ${dy.J3.onsideBy} ahead ${dy.J3.ahead}, run window ${dy.J3.window}s, passer's nearest def ${dy.J3.passerPressed} m, line ${dy.J3.line}`);
      console.log(`   J4 control ${dy.J4a} m; owner probe: got it ${dy.owner.recvDist} m, lost ${dy.owner.lostAfterStand}s after standing at 18 m / ${dy.owner.lostAfterRecv}s after control (${dy.owner.lostHow}), open ${dy.owner.open0} m, corner open ${dy.owner.cornerOpen}s`);
      console.log(`   J5 nearest defender after control ${dy.J5close} m | J6 dwell ${dy.J6.dwell.join(', ')} zone-on-lane ${dy.J6.zoneOnLane}`);
      console.log(`   J10 bot shot ${dy.botShot.dist} m, open ${dy.botShot.open0} m, corner open ${dy.botShot.cornerOpen}s`);
      dy.W.forEach(o => console.log(`     r${o.r} #${o.num}${o.last ? ' (finisher)' : ''}: ` + (o.dwell !== undefined ? `dwell ${o.dwell}s (${o.dwellWhy})` : 'decoy') +
        (o.timing ? ` | timing -${o.timing.early}/+${o.timing.late}s [${o.timing.earlyWhy} | ${o.timing.lateWhy}]` : '') +
        (o.aim ? ` | aim ${o.aim.w}° [${o.aim.why}]` : '') + (o.power ? ` | power -${o.power.lo}/+${o.power.hi} [${o.power.why}]` : '')));
    }
    console.log('   dynamic: ' + (dy.fails.length ? 'FAIL ' + dy.fails.join(' / ') : 'pass') + (dy.notes.length ? '  (notes: ' + dy.notes.join(' / ') + ')' : ''));
  });
  const ji = process.argv.indexOf('--json'); if (ji > 0) require('fs').writeFileSync(process.argv[ji + 1], JSON.stringify(all, null, 1));
}
