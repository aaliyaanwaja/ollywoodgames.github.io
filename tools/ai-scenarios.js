// node tools/ai-scenarios.js        -> one PASS/FAIL line per defensive behaviour, exit code 1 if any fail
// node tools/ai-scenarios.js -v     -> also print the numbers each scenario measured
// Small scripted situations that pin down how defenders and the keeper behave. Not shipped in the game.
const path = require('path');
const { FB } = require(path.join(__dirname, '..', 'one-man-team', 'js', 'sim.js'));
const C = FB.C, P = FB.P, verbose = process.argv.includes('-v');
const hyp = Math.hypot;

let maxDefSpd = 0, maxGkSpd = 0, failed = 0, maxSprint = 0;

/* run(level, ctrl, opt): play `level` with attacker `opt.live` (default 0) driven by ctrl(S, me, t) -> input.
   opt.recs: recordings of earlier players, opt.ticks: stop after this many, opt.each(S): called after every tick. */
function run(level, ctrl, opt) {
  opt = opt || {};
  const live = opt.live === undefined ? 0 : opt.live;
  const recs = opt.recs || level.att.map(() => null);
  const S = FB.makeSim(level, recs, live);
  const n = opt.ticks || 600;
  while (S.status === 'play' && S.tick < n) {
    const px = S.def.map(d => d.x), py = S.def.map(d => d.y), gx = S.gk.x, gy = S.gk.y;
    FB.step(S, live >= 0 ? ctrl(S, S.att[live], S.tick) || {} : {});
    S.def.forEach((d, i) => { const v = hyp(d.x - px[i], d.y - py[i]) * 60; if (d.sprint) maxSprint = Math.max(maxSprint, v); else maxDefSpd = Math.max(maxDefSpd, v); });
    maxGkSpd = Math.max(maxGkSpd, hyp(S.gk.x - gx, S.gk.y - gy) * 60);
    if (opt.each) opt.each(S);
  }
  return S;
}
const go = (me, x, y) => { const dx = x - me.x, dy = y - me.y, d = hyp(dx, dy); return d < 0.25 ? { mx: 0, my: 0 } : { mx: dx / d, my: dy / d }; };
const dir = (mx, my) => ({ mx, my });
// hold an aim for a few ticks, then release: kick(me, tx, ty, power, t, at) kicks at tick `at`
function kick(me, tx, ty, power, t, at) {
  const dx = tx - me.x, dy = ty - me.y, d = hyp(dx, dy) || 1;
  if (t < at) return { mx: 0, my: 0, charging: true, aim: true, ax: dx / d, ay: dy / d, power };
  if (t === at) return { release: true };
  return {};
}
const lvl = (att, def, extra) => Object.assign({ name: 't', time: 30, brief: '', att: att.map((a, i) => Object.assign({ num: i + 1, name: 'A', role: 'ball', tip: '' }, a)), order: att.map((_, i) => i), def }, extra || {});
const line4 = (y, spd) => [10, 20, 30, 40].map(x => ({ t: 'line', x, y, spd: spd || 5.2 }));
const f = n => n.toFixed(2);

function scenario(name, fn) {
  let ok, note = '';
  try { const r = fn(); ok = r.every(c => c[0]); note = r.map(c => (c[0] ? '' : 'FAILED: ') + c[1]).join('; '); }
  catch (e) { ok = false; note = 'threw ' + e.stack; }
  if (!ok) failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${verbose || !ok ? '\n        ' + note : ''}`);
}
const chk = (cond, text) => [!!cond, text];

/* ---------------- back line ---------------- */

scenario('line: keeps its spacing and stays flat while the ball switches sides, and shifts to the ball side', () => {
  const L = lvl([{ x: 8, y: 46 }], line4(25));
  let minGap = 99, maxGap = 0, flat = 0, cxStart = 0, cxEnd = 0;
  run(L, (S, me, t) => go(me, 42, 46), {
    ticks: 420, each: S => {
      const m = S.def;
      for (let i = 1; i < 4; i++) { const g = m[i].x - m[i - 1].x; minGap = Math.min(minGap, g); maxGap = Math.max(maxGap, g); }
      flat = Math.max(flat, Math.max(...m.map(d => d.y)) - Math.min(...m.map(d => d.y)));
      const cx = m.reduce((s, d) => s + d.x, 0) / 4;
      if (S.tick === 60) cxStart = cx; cxEnd = cx;
    }
  });
  return [chk(minGap > 8.2 && maxGap < 10.6, `gaps ${f(minGap)}..${f(maxGap)} m (want 8.2..10.6)`),
    chk(flat < 0.5, `height spread ${f(flat)} m (want < 0.5)`),
    chk(cxStart < 21 && cxEnd > 29, `line centre x ${f(cxStart)} -> ${f(cxEnd)} (want <21 -> >29)`)];
});

scenario('line: drops off when a carrier runs at it unpressured, at backpedal pace, still flat', () => {
  const L = lvl([{ x: 25, y: 46 }], line4(25));
  let y0 = 0, flat = 0, maxRate = 0, prev = 25;
  const S = run(L, (S, me, t) => t < 150 ? go(me, 25, 33) : {}, {
    ticks: 150, each: S => {
      const ys = S.def.map(d => d.y), mean = ys.reduce((a, b) => a + b) / 4;
      if (S.tick === 30) y0 = mean;
      flat = Math.max(flat, Math.max(...ys) - Math.min(...ys));
      maxRate = Math.max(maxRate, (prev - mean) * 60); prev = mean;
    }
  });
  const y1 = S.def.reduce((s, d) => s + d.y, 0) / 4;
  return [chk(Math.abs(y0 - 25) < 0.3, `holds ${f(y0)} while the ball is far`),
    chk(y1 < 22.5, `dropped to ${f(y1)} (want < 22.5)`),
    chk(maxRate < 5.0, `drop rate ${f(maxRate)} m/s (backpedal, want < 5.0)`),
    chk(flat < 0.6, `height spread ${f(flat)} m`)];
});

scenario('line: holds under pressure, and steps up when the ball goes backwards', () => {
  // a presser gets tight to the carrier in front of the line: the line must not retreat, then the carrier turns back
  const L = lvl([{ x: 25, y: 38 }], line4(25).concat([{ t: 'press', x: 25, y: 33, spd: 5.4, eng: 12, agg: 0 }]));
  let yHold = 0, yMin = 99, pressedAt = -1;
  const S = run(L, (S, me, t) => t < 45 ? {} : go(me, 25, 56), {
    ticks: 300, each: S => {
      const y = S.def.slice(0, 4).reduce((s, d) => s + d.y, 0) / 4;
      if (S.pressured && pressedAt < 0) pressedAt = S.tick;
      if (S.tick === 45) yHold = y;
      if (S.tick > 30 && S.tick <= 80) yMin = Math.min(yMin, y);
    }
  });
  const y1 = S.def.slice(0, 4).reduce((s, d) => s + d.y, 0) / 4;
  return [chk(S.status === 'play' || S.reason === 'tackled', 'ran'),
    chk(pressedAt >= 0 && yHold > 24.6, `under pressure the line stands at ${f(yHold)} (home 25)`),
    chk(y1 > 26.5, `after the ball goes back it has stepped up to ${f(y1)} (want > 26.5)`)];
});

scenario('line: the offside line can be timed (early run is off, timed run is on and gets in behind)', () => {
  const L = lvl([{ x: 25, y: 37 }, { x: 27.5, y: 26.2 }], line4(25));
  // round 1: the passer waits one second and slides it between the centre-halves
  const r1 = run(L, (S, me, t) => kick(me, 25.3, 12, 0.75, t, 60), { live: 0 });
  const recs = [FB.finalRec(r1), null];
  const early = run(L, (S, me, t) => go(me, 26, 12), { live: 1, recs });
  let lineAtKick = 0, meAtKick = 0;
  const timed = run(L, (S, me, t) => t < 52 ? {} : S.ball.owner === 1 ? {} : S.ball.owner < 0 && S.ball.y < me.y + 2.5 ? go(me, S.ball.x, S.ball.y - 1) : go(me, 26, 12), {
    live: 1, recs, ticks: 240, each: S => { if (S.tick === 61) { lineAtKick = FB.offsideLine(S); meAtKick = S.att[1].y; } }
  });
  return [chk(r1.status === 'won', `pass round: ${r1.status} ${r1.reason}`),
    chk(early.status === 'fail' && early.reason === 'offside', `early run: ${early.status} ${early.reason}`),
    chk(timed.reason !== 'offside' && meAtKick > lineAtKick - 0.6, `timed run: runner ${f(meAtKick)} vs line ${f(lineAtKick)} when it is hit`),
    chk(timed.ball.owner === 1 && timed.att[1].y < 20, `timed runner has the ball in behind (owner ${timed.ball.owner}, y ${f(timed.att[1].y)}, ${timed.status} ${timed.reason})`)];
});

scenario('line: a runner on the line makes it drop while the ball is free, but it holds (the trap) when the passer is under pressure', () => {
  // free: the ball sits with a player nobody may press yet. pressed: the same carrier, recorded, with a man on him.
  const free = lvl([{ x: 25, y: 44, role: 'ball' }, { x: 30, y: 28, role: 'decoy' }], line4(25), { order: [1, 0] });
  let dropFree = 0, dropPressed = 0, pressedTicks = 0;
  run(free, (S, me, t) => t < 30 ? {} : go(me, 30, 20), { live: 1, ticks: 75, each: S => { dropFree = 25 - S.def[0].y; } });
  const pressed = lvl([{ x: 25, y: 39 }, { x: 30, y: 28, role: 'decoy' }], line4(25).concat([{ t: 'press', x: 25, y: 35.6, spd: 5, agg: 0 }]));
  const hold = FB.finalRec(run(pressed, (S, me, t) => ({}), { live: 0, ticks: 3 }));
  run(pressed, (S, me, t) => t < 30 ? {} : go(me, 30, 20), { live: 1, recs: [hold, null], ticks: 58, each: S => { dropPressed = 25 - S.def[0].y; if (S.pressured) pressedTicks++; } });
  return [chk(dropFree > 0.8, `gave ${f(dropFree)} m to the runner while the ball was free (want > 0.8)`),
    chk(pressedTicks > 20 && dropPressed < 0.25, `gave ${f(dropPressed)} m with the passer under pressure for ${pressedTicks} ticks (want < 0.25)`)];
});

scenario('line: a lone carrier cannot walk through it: it drops to the box, one man steps out and cuts him off, his neighbours tuck in and cover', () => {
  const L = lvl([{ x: 25, y: 45 }], line4(25));
  let stepped = -1, tuck = 99, coverDepth = 0, floorY = 99;
  const S = run(L, (S, me, t) => go(me, 24, 5), { ticks: 400, each: S => {
    const p = S.presser;
    // with C.coverDeep (option 3 of 10-finish-pressure.md, off in the game) the inside partner of the man who stepped out drops to cover depth on purpose
    const ins = C.coverDeep && p >= 0 && S.def[p].kind === 'line' ? (() => { const u = S.units[S.def[p].ui], k = S.def[p].uk; return [u.m[k - 1], u.m[k + 1]].filter(i => i !== undefined).sort((a, b) => Math.abs(S.def[a].hx - 25) - Math.abs(S.def[b].hx - 25))[0]; })() : -1;
    floorY = Math.min(floorY, ...S.def.filter((d, i) => i !== p && i !== ins).map(d => d.y));
    if (p >= 0 && S.def[p].kind === 'line' && S.status === 'play') {
      if (stepped < 0) stepped = S.tick;
      const k = S.def[p].uk, l = S.def[k - 1], r = S.def[k + 1];
      if (l && r) { tuck = Math.min(tuck, r.x - l.x); coverDepth = Math.max(coverDepth, S.def[p].y - Math.max(l.y, r.y)); }
    }
  } });
  return [chk(S.status === 'fail' && S.reason === 'tackled' && S.ball.y > 10, `carrier ${S.status} ${S.reason} at y=${f(S.ball.y)} (want tackled before y=10)`),
    chk(stepped > 0, `a centre-half stepped out at tick ${stepped}`),
    chk(tuck < 15.5, `the men either side of him closed to ${f(tuck)} m apart (18.4 m when he is in the line)`),
    chk(coverDepth > 0.5, `and stood ${f(coverDepth)} m deeper than him (cover)`),
    chk(floorY > 11, `the rest of the line never dropped below y=${f(floorY)} (floor ${C.lineFloor}, cover ${C.lineCoverDrop})`)];
});

scenario('line: with the ball in behind, defenders recover goal-side of it and funnel in', () => {
  const L = lvl([{ x: 40, y: 22 }], line4(25));
  let width0 = 0;
  const S = run(L, (S, me, t) => go(me, 38, 8), { ticks: 130, each: S => { if (S.tick === 2) width0 = S.def[3].x - S.def[0].x; } });
  const w = S.def[3].x - S.def[0].x, others = S.def.filter((d, i) => i !== S.presser);
  return [chk(others.every(d => d.y < 18.5 && d.vy < -4.4), `everyone turned and ran for goal: now at y ${others.map(d => f(d.y)).join(', ')} doing ${others.map(d => f(-d.vy)).join(', ')} m/s`),
    chk(w < width0 - 3, `line width ${f(width0)} -> ${f(w)} m`),
    chk(S.def.some(d => d.intent === 'recover'), 'intent "recover"')];
});

/* ---------------- marking ---------------- */

const markLvl = (bx, by, extra) => lvl([{ x: bx, y: by }, { x: 25, y: 30 }], [Object.assign({ t: 'mark', a: 1, x: 25, y: 27.8, spd: 5.4 }, extra || {})]);
function markRun(ctrl, ticks, bx, by, extra, each) {
  // attacker 0 holds the ball far away and is recorded standing; attacker 1 is the marked runner
  const L = markLvl(bx === undefined ? 25 : bx, by === undefined ? 52 : by, extra);
  const r0 = run(L, () => ({}), { live: 0, ticks: 5 });
  const rec0 = FB.finalRec(r0);
  return run(L, ctrl, { live: 1, recs: [rec0, null], ticks, each });
}
const goalSide = (S) => { const a = S.att[1], d = S.def[0]; return hyp(d.x - P.cx, d.y) < hyp(a.x - P.cx, a.y); };

const gapOf = S => hyp(S.att[1].x - S.def[0].x, S.att[1].y - S.def[0].y);
const jog = (S, me, t) => ({ mx: 0.6, my: 0 });

scenario('marking: goal-side and close while his man moves at a pace he can live with', () => {
  let worst = 0;
  const S = markRun(jog, 150, 25, 52, undefined, S => { if (S.tick > 40) worst = Math.max(worst, gapOf(S)); });
  return [chk(goalSide(S), 'marker is nearer the goal than his man'), chk(worst < 3.6, `largest gap ${f(worst)} m over 2.5 s (want < 3.6)`),
    chk(S.def[0].y < S.att[1].y - 0.8, `goal-side by ${f(S.att[1].y - S.def[0].y)} m`)];
});

scenario('marking: a sharp cut earns separation that a straight burst does not', () => {
  // both runners jog right for 70 ticks then sprint for half a second: one straight on, one back the other way
  const straight = markRun((S, me, t) => t < 70 ? jog() : dir(1, 0), 100);
  const cut = markRun((S, me, t) => t < 70 ? jog() : dir(-1, 0), 100);
  const lead = cut.def[0].x - cut.att[1].x;       // how far the marker is left behind on the wrong side
  return [chk(gapOf(cut) > gapOf(straight) + 0.5, `0.5 s after the burst: ${f(gapOf(cut))} m free after the cut, ${f(gapOf(straight))} m after a straight sprint (want +0.5)`),
    chk(lead > 2.5, `marker is ${f(lead)} m the wrong side of his man after the cut (want > 2.5)`)];
});

scenario('marking: a slow-reacting marker loses more to the same cut than a sharp one', () => {
  const ctrl = (S, me, t) => t < 70 ? jog() : dir(-1, 0);
  const sharp = markRun(ctrl, 100, 25, 52, { react: 6 }), slow = markRun(ctrl, 100, 25, 52, { react: 24 });
  return [chk(gapOf(slow) > gapOf(sharp) + 0.5, `react 24: ${f(gapOf(slow))} m, react 6: ${f(gapOf(sharp))} m`)];
});

scenario('marking: ball-side shade, and tighter as the ball gets closer', () => {
  const left = markRun(() => ({}), 120, 6, 40), right = markRun(() => ({}), 120, 44, 40);
  const far = markRun(() => ({}), 120, 25, 56), near = markRun(() => ({}), 120, 25, 38);
  const g = S => hyp(S.att[1].x - S.def[0].x, S.att[1].y - S.def[0].y);
  return [chk(left.def[0].x < 24.6 && right.def[0].x > 25.4, `ball left: marker x ${f(left.def[0].x)}; ball right: ${f(right.def[0].x)} (man at 25)`),
    chk(left.def[0].y < 29.5 && right.def[0].y < 29.5, 'still goal-side'),
    chk(g(near) < g(far) - 0.5, `gap ${f(g(far))} m with the ball 26 m away, ${f(g(near))} m with it 8 m away`)];
});

scenario('future players: the marker stands with a player who has not been played, and nobody tackles a ball he holds', () => {
  // decoy round first: the ball sits with a future player who has a hungry presser next to him
  const L = lvl([{ x: 25, y: 45, role: 'ball' }, { x: 12, y: 30, role: 'decoy' }, { x: 36, y: 28, role: 'ball' }],
    [{ t: 'press', x: 25, y: 40, spd: 5.6, eng: 12, agg: 1 }, { t: 'mark', a: 2, x: 35.4, y: 25.3, spd: 5.4 }, { t: 'mark', a: 0, x: 25, y: 43, spd: 5.4, agg: 1 }],
    { order: [1, 0, 2] });
  let minBall = 99, markMove = 0, m0x = 0, m0y = 0;
  const S = run(L, (S, me, t) => go(me, 20, 22), { live: 1, ticks: 240, each: S => {
    minBall = Math.min(minBall, hyp(S.def[0].x - S.ball.x, S.def[0].y - S.ball.y));
    if (S.tick === 60) { m0x = S.def[1].x; m0y = S.def[1].y; }
    if (S.tick > 60) markMove = Math.max(markMove, hyp(S.def[1].x - m0x, S.def[1].y - m0y));
  } });
  return [chk(S.status !== 'fail', `decoy round: ${S.status} ${S.reason}`),
    chk(S.def.every(d => d.lunge === 0 && d.offBalance === 0), 'nobody lunged'),
    chk(markMove < 0.3 && hyp(S.def[1].x - 36, S.def[1].y - 28) < 3.3 && S.def[1].y < 28, `marker of the unplayed 3rd man drifted ${f(markMove)} m while the decoy ran, and is goal-side of him`),
    chk(minBall > 2.5, `presser kept ${f(minBall)} m off the untouchable ball`)];
});

/* ---------------- pressure, cover, balance ---------------- */

scenario('pressing: closes fast, slows inside 3 m and jockeys instead of running through', () => {
  const L = lvl([{ x: 25, y: 45 }], [{ t: 'press', x: 25, y: 30, spd: 5.4, eng: 20, agg: 0 }]);
  let far = 0, nearMax = 0, minDist = 99, firstWind = -1, prev = 15;
  run(L, () => ({}), { ticks: 200, each: S => {
    const d = S.def[0], dist = hyp(d.x - S.ball.x, d.y - S.ball.y), close = (prev - dist) * 60; prev = dist;
    if (d.lunge > 0 && firstWind < 0) firstWind = S.tick;
    if (firstWind >= 0) return;
    if (dist > 5 && S.tick > 40) far = Math.max(far, close);
    if (dist < 2.4) nearMax = Math.max(nearMax, close);
    minDist = Math.min(minDist, dist);
  } });
  return [chk(far > 4.8, `closing speed ${f(far)} m/s outside 5 m`),
    chk(nearMax < 0.5 * far, `at most ${f(nearMax)} m/s inside 2.4 m (want < half)`),
    chk(minDist > 1.2, `stayed ${f(minDist)} m off the ball before committing (want > 1.2)`)];
});

scenario('pressure, cover, balance: one presses, one covers goal-side, the rest keep their shape', () => {
  const L = lvl([{ x: 25, y: 44 }, { x: 25, y: 20 }], [
    { t: 'zone', x: 21, y: 38, spd: 5.2, eng: 9, agg: 0 }, { t: 'zone', x: 29, y: 37, spd: 5.2, eng: 9, agg: 0 }, { t: 'zone', x: 25, y: 33, spd: 5.2, eng: 9, agg: 0 }
  ].concat(line4(24)));
  let S = run(L, () => ({}), { ticks: 100 });
  const b = S.ball, ds = S.def.slice(0, 3).map(d => hyp(d.x - b.x, d.y - b.y)).sort((p, q) => p - q);
  const cov = S.def[S.cover];
  const lineMoved = Math.max(...S.def.slice(3).map(d => hyp(d.x - d.hx, d.y - d.hy)));
  return [chk(ds[0] < 3 && ds[1] > 3.4, `midfield distances to ball ${ds.map(f).join(', ')} (one inside 3 m, nobody else inside 3.4)`),
    chk(cov && cov.y < b.y - 2 && hyp(cov.x - b.x, cov.y - b.y) < 7.5, `cover man ${cov ? f(hyp(cov.x - b.x, cov.y - b.y)) : '-'} m goal-side of the ball`),
    chk(lineMoved < 2.5, `back line moved ${f(lineMoved)} m: nobody else chased`)];
});

scenario('lane cutting: the screen stands on the lane to the most dangerous receiver and reads the wind-up', () => {
  const L = lvl([{ x: 14, y: 48 }, { x: 30, y: 24 }, { x: 44, y: 44 }], [{ t: 'zone', x: 24, y: 38, spd: 5.2, eng: 4 }]);
  const lane = S => { const b = S.ball, a = S.att[1], d = S.def[0]; const dx = a.x - b.x, dy = a.y - b.y, u = ((d.x - b.x) * dx + (d.y - b.y) * dy) / (dx * dx + dy * dy); return hyp(d.x - b.x - dx * u, d.y - b.y - dy * u); };
  let moving = 0;
  const S = run(L, (S, me, t) => t < 150 ? go(me, 24, 50) : {}, { ticks: 230, each: S => { if (S.tick === 148) moving = lane(S); } });
  const set = lane(S);
  return [chk(moving < 1.6, `${f(moving)} m off the lane while the carrier is moving (want < 1.6)`),
    chk(set < 0.45, `${f(set)} m off it once the carrier has stopped to pass (want < 0.45)`),
    chk(S.def[0].intent === 'read', `intent "${S.def[0].intent}"`)];
});

scenario('lane cutting: a straight pass through the screen is cut out, a pass round him is not', () => {
  const L = lvl([{ x: 20, y: 48 }, { x: 28, y: 24 }], [{ t: 'zone', x: 24, y: 37, spd: 5.2, eng: 5 }]);
  const through = run(L, (S, me, t) => kick(me, 28, 24, 0.8, t, 70), { ticks: 200 });
  const round = run(L, (S, me, t) => kick(me, 36, 30, 0.8, t, 70), { ticks: 200 });
  return [chk(through.reason === 'intercepted', `straight: ${through.status} ${through.reason}`), chk(round.status === 'won', `angled: ${round.status} ${round.reason}`)];
});

scenario('lane cutting: a screen is not dragged out of midfield by a receiver he cannot screen', () => {
  // the only forward is far out on the other wing: the lane to him is more than `screen` metres from the screen's post
  const L = lvl([{ x: 10, y: 48 }, { x: 46, y: 43 }], [{ t: 'zone', x: 18, y: 38, spd: 5.2, eng: 3 }]);
  let far = 0;
  const S = run(L, () => ({}), { ticks: 180, each: S => { far = Math.max(far, hyp(S.def[0].x - 18, S.def[0].y - 38)); } });
  return [chk(far < 3.5 && S.def[0].intent === 'shape', `stayed within ${f(far)} m of his post, intent "${S.def[0].intent}"`)];
});

/* ---------------- tackling ---------------- */

const tackleLvl = agg => lvl([{ x: 25, y: 40 }], [{ t: 'press', x: 25, y: 34, spd: 5.2, eng: 12, agg: agg === undefined ? 0.5 : agg }]);

scenario('tackle: standing still next to a defender loses the ball, after a visible plant', () => {
  let tell = 0;
  const S = run(tackleLvl(), () => ({}), { ticks: 300, each: S => { if (S.def[0].intent === 'windup') tell++; } });
  return [chk(S.status === 'fail' && S.reason === 'tackled', `${S.status} ${S.reason} at ${f(S.tick / 60)} s`),
    chk(tell >= C.lungeWind - 1, `plant shown for ${tell} ticks before the leg came out (want >= ${C.lungeWind - 1})`)];
});

scenario('tackle: dribbling straight at and past him loses it; cutting during the plant beats him and leaves him off balance', () => {
  const straight = run(tackleLvl(), (S, me, t) => dir(0.25, -0.97), { ticks: 200 });
  let cutAt = -1, offBal = 0, missed = false;
  const cut = run(tackleLvl(), (S, me, t) => {
    const d = S.def[0];
    if (cutAt < 0 && d.intent === 'windup' && d.lunge * (C.lungeWind + C.lungeStrike) >= C.lungeCommit + 1) cutAt = t;
    if (cutAt < 0) return dir(0.25, -0.97);
    return t < cutAt + 14 ? dir(-1, 0.1) : dir(-0.5, -0.87);
  }, { ticks: 200, each: S => { offBal = Math.max(offBal, S.def[0].offBalance); } });
  const past = cut.att[0].y < cut.def[0].y - 1;
  return [chk(straight.reason === 'tackled', `straight: ${straight.status} ${straight.reason}`),
    chk(cutAt > 0 && cut.status === 'play', `cut at tick ${cutAt}: ${cut.status} ${cut.reason}`),
    chk(offBal >= C.offBal - 1, `defender off balance for ${offBal} ticks`),
    chk(past, `carrier is past him (y ${f(cut.att[0].y)} vs ${f(cut.def[0].y)})`)];
});

scenario('tackle: aggression changes when he goes (agg 1 lunges early, agg 0 holds him up longer)', () => {
  const when = agg => { let w = -1; run(tackleLvl(agg), () => ({}), { ticks: 300, each: S => { if (w < 0 && S.def[0].lunge > 0) w = S.tick; } }); return w; };
  const hot = when(1), cool = when(0);
  return [chk(hot > 0 && cool > hot + 12, `agg 1 plants at tick ${hot}, agg 0 at tick ${cool}`)];
});

scenario('first touch: the receiver is protected briefly, but cannot stand on it next to his marker', () => {
  const L = lvl([{ x: 25, y: 44 }, { x: 25, y: 32 }], [{ t: 'mark', a: 1, x: 25, y: 30.4, spd: 5.4 }]);
  const r1 = run(L, (S, me, t) => kick(me, 25, 32, 0.25, t, 30), { live: 0 });
  const S = run(L, () => ({}), { live: 1, recs: [FB.finalRec(r1), null], ticks: 400 });
  const held = S.tick - S.ball.recvTick;
  return [chk(r1.status === 'won', `pass: ${r1.status} ${r1.reason}`),
    chk(S.reason === 'tackled' && held > C.touchShield, `lost it ${held} ticks after his first touch (shield ${C.touchShield})`),
    chk(held < 70, 'and within about a second')];
});

scenario('recovery: a beaten defender runs for a spot goal-side of the ball, not at the ball', () => {
  // the carrier starts goal-side of a midfielder and runs away from him towards goal
  const L = lvl([{ x: 20, y: 34 }], [{ t: 'press', x: 27, y: 38, spd: 5.6, eng: 30 }]);
  let dots = [], intents = {};
  run(L, (S, me, t) => go(me, 20, 8), { ticks: 120, each: S => {
    const d = S.def[0], b = S.ball; intents[d.intent] = 1;
    if (S.tick < 30) return;
    const v = hyp(d.vx, d.vy) || 1, gl = hyp(P.cx - b.x, b.y), sx = b.x + (P.cx - b.x) / gl * 4 - d.x, sy = b.y - b.y / gl * 4 - d.y, sl = hyp(sx, sy);
    const bx = b.x - d.x, by = b.y - d.y, bl = hyp(bx, by);
    dots.push([(d.vx * sx + d.vy * sy) / v / sl, (d.vx * bx + d.vy * by) / v / bl]);
  } });
  const toSpot = dots.reduce((s, p) => s + p[0], 0) / dots.length, toBall = dots.reduce((s, p) => s + p[1], 0) / dots.length;
  return [chk(intents.recover, 'intent "recover" seen'), chk(toSpot > 0.97 && toSpot > toBall, `heading: ${f(toSpot)} towards the goal-side spot, ${f(toBall)} towards the ball`)];
});

/* ---------------- goalkeeper ---------------- */

const shotLvl = (x, y, extra) => lvl([{ x, y }], [], extra);
const shoot = (x, y, tx, power, wait) => run(shotLvl(x, y), (S, me, t) => kick(me, tx, 0, power, t, wait === undefined ? 45 : wait), { ticks: 400 });

scenario('keeper: stands on the angle between ball and goal', () => {
  const out = [];
  for (const [x, y] of [[8, 22], [42, 18], [25, 30], [15, 40]]) {
    const S = run(shotLvl(x, y), () => ({}), { ticks: 180 }), g = S.gk, b = S.ball;
    // with C.gkBisect (B, on by default) the keeper's line runs from the ball to his anchor on the goal line, not to its centre
    let ax = P.cx;
    if (C.gkBisect) { const d1 = hyp(b.x - P.cx + P.goalHalf, b.y), d2 = hyp(b.x - P.cx - P.goalHalf, b.y); ax = P.cx - P.goalHalf + 2 * P.goalHalf * d1 / (d1 + d2); ax += (P.cx + Math.sign(b.x - P.cx) * P.goalHalf - ax) * C.gkNear * Math.min(1, Math.abs(b.x - P.cx) / 6); }
    const dx = b.x - ax, dy = b.y, u = ((g.x - ax) * dx + g.y * dy) / (dx * dx + dy * dy);
    const off = hyp(g.x - ax - dx * u, g.y - dy * u);
    out.push(chk(off < 0.35 && g.y >= 1 && hyp(g.x - P.cx, g.y) < 7, `ball (${x},${y}): keeper (${f(g.x)},${f(g.y)}) is ${f(off)} m off the ball-${C.gkBisect ? 'anchor' : 'goal'} line`));
  }
  return out;
});

scenario('keeper: finishing from 6-12 m into a corner scores', () => {
  const out = [];
  for (const [x, y, tx] of [[25, 8, 21.6], [25, 11, 28.4], [20, 9, 28.3], [31, 10, 21.7], [27, 6.5, 21.7], [22, 12, 28.3]]) {
    const S = shoot(x, y, tx, 1);
    out.push(chk(S.status === 'goal', `from (${x},${y}) to x=${tx}: ${S.status} ${S.reason}`));
  }
  return out;
});

scenario('keeper: a tame shot at him is saved, and so is a shot from 26 m or more', () => {
  const out = [];
  for (const [x, y, tx, p] of [[25, 10, 25.3, 1], [22, 9, 24, 0.5], [27, 11, 26.5, 0.4], [25, 27, 21.6, 1], [20, 28, 28.3, 1], [30, 27, 21.8, 1], [25, 17, 26.6, 0.3]]) {
    const S = shoot(x, y, tx, p);
    out.push(chk(S.status === 'fail' && S.reason === 'saved', `from (${x},${y}) to x=${tx} power ${p}: ${S.status} ${S.reason}`));
  }
  return out;
});

scenario('keeper: human reaction, and a shot hit before he has set gives him less time', () => {
  // he must not move towards the shot during his reaction time (gkReact ticks on the shot's clock: shotPace, see 16)
  let moved = 0, kt = -1, x0 = 0;
  run(shotLvl(25, 14), (S, me, t) => kick(me, 21.6, 0, 1, t, 45), { ticks: 400, each: S => {
    if (S.ball.owner < 0 && kt < 0) { kt = S.tick; x0 = S.gk.x; }
    if (kt >= 0 && S.tick === kt + Math.floor(C.gkReact / (C.shotPace || 1)) - 2) moved = Math.abs(S.gk.x - x0);
  } });
  // same strike from a moving run-up (no time to set): the keeper is still adjusting, so it is harder for him
  const setShot = shoot(25, 15, 23.2, 1, 45);
  const early = run(shotLvl(8, 24), (S, me, t) => me.x < 24.8 ? go(me, 25, 15.2) : kick(me, 23.2, 0, 1, t, S.k0 = (S.k0 || t + 2)), { ticks: 400 });
  return [chk(moved < 0.05, `moved ${f(moved)} m during his reaction time`),
    chk(setShot.reason === 'saved', `set keeper, 15 m: ${setShot.status} ${setShot.reason}`),
    chk(early.status === 'goal', `same shot hit on the run before he sets: ${early.status} ${early.reason}`)];
});

scenario('keeper: sweeps a through ball that dies in his area before a striker 15 m away; stays home if the striker is favourite', () => {
  const mk = (sx, sy, sweeper) => lvl([{ x: 25, y: 40 }, { x: sx, y: sy }], [], { gk: { sweeper } });
  const hit = (S, me, t) => kick(me, 33, 8, 0.96, t, 20);
  const pass = L => FB.finalRec(run(L, hit, { live: 0 }));
  const far = mk(42, 23, true), near = mk(37, 15, true), home = mk(42, 23, false);
  const a = run(far, (S, me, t) => S.ball.owner === 1 ? {} : go(me, S.ball.x, S.ball.y), { live: 1, recs: [pass(far), null], ticks: 400 });
  let outMax = 0;
  const b = run(near, (S, me, t) => S.ball.owner === 1 ? {} : go(me, S.ball.x, S.ball.y), { live: 1, recs: [pass(near), null], ticks: 200, each: S => { if (S.ball.owner < 0) outMax = Math.max(outMax, S.gk.y); } });
  const c = run(home, (S, me, t) => S.ball.owner === 1 ? {} : go(me, S.ball.x, S.ball.y), { live: 1, recs: [pass(home), null], ticks: 400 });
  const p = run(far, hit, { live: 0 });
  return [chk(a.reason === 'keeper', `sweeper v striker 15 m away: ${a.status} ${a.reason} (keeper at ${f(a.gk.x)},${f(a.gk.y)})`),
    chk(b.ball.owner === 1 && outMax < 4, `striker close: he collects it, keeper stayed at y<${f(outMax)}`),
    chk(c.ball.owner === 1, `ordinary keeper leaves the same ball: ${c.ball.owner === 1 ? 'striker collects' : c.reason}`),
    chk(p.status === 'won', `passer's own round (striker not yet played) is not ruined: ${p.status} ${p.reason}`)];
});

scenario('keeper: comes out to narrow the angle one-on-one, stays on his feet, and a shot at him from there is saved', () => {
  let gy = 0;
  const L = shotLvl(25, 26);
  const S = run(L, (S, me, t) => me.y > 12.5 ? go(me, 25, 12) : kick(me, 25.6, 0, 1, t, S.tick0 = (S.tick0 || t + 20)), { ticks: 400, each: S => { if (S.ball.owner >= 0) gy = S.gk.y; } });
  const L2 = lvl([{ x: 25, y: 26 }], [{ t: 'mark', a: 0, x: 25, y: 23, spd: 5.6, agg: 0 }]);
  let gy2 = 0;
  run(L2, (S, me, t) => ({}), { ticks: 60, each: S => { gy2 = S.gk.y; } });
  return [chk(gy > 3.5, `keeper came out to y=${f(gy)} against a free runner (want > 3.5)`),
    chk(S.reason === 'saved', `shot at him: ${S.status} ${S.reason}`),
    chk(gy2 < 3.2, `with a defender goal-side of the carrier he stays at y=${f(gy2)}`)];
});

scenario('keeper: does not back-pedal from a carrier, and smothers a ball dribbled to his feet', () => {
  let maxOut = 0, retreat = 0;
  const S = run(shotLvl(25, 24), (S, me, t) => go(me, 25.5, 1), { ticks: 400, each: S => {
    const o = hyp(S.gk.x - P.cx, S.gk.y);
    if (S.gk.intent !== 'smother') { retreat = Math.max(retreat, maxOut - o); maxOut = Math.max(maxOut, o); }
  } });
  return [chk(S.reason === 'smothered', `${S.status} ${S.reason}`), chk(retreat < 0.3, `gave up ${f(retreat)} m of the ground he had taken (want < 0.3)`),
    chk(maxOut > 3.5, `stood ${f(maxOut)} m off his line`)];
});

/* ---------------- determinism and contracts ---------------- */

const busy = () => lvl([{ x: 25, y: 50 }, { x: 33, y: 27, }, { x: 12, y: 30, role: 'decoy' }], line4(24).concat([
  { t: 'zone', x: 25, y: 39, spd: 5.2, eng: 7 }, { t: 'press', x: 18, y: 42, spd: 5.4 }, { t: 'mark', a: 2, x: 12.5, y: 27.8, spd: 5.4 }
]), { order: [2, 0, 1], gk: { sweeper: true } });
const busyCtrl = [   // indexed by attacker: 0 carrier, 1 striker, 2 decoy
  (S, me, t) => t < 30 ? dir(0.9, -0.44) : kick(me, 36, 10, 1, t, 44),
  (S, me, t) => t < 40 ? {} : S.ball.owner === 1 ? kick(me, 28.4, 0, 1, t, S.k0 = (S.k0 || t + 10)) : go(me, 35.5, 13),
  (S, me, t) => t < 90 ? go(me, 18, 22) : { done: true }
];
function trace(L, live, recs, ctrl) {
  const out = [];
  const S = run(L, ctrl, { live, recs, ticks: 600, each: S => { S.def.forEach(d => out.push(d.x, d.y)); out.push(S.gk.x, S.gk.y, S.ball.x, S.ball.y); } });
  return { S, out };
}
scenario('determinism: the same scenario twice gives identical defender, keeper and ball positions every tick', () => {
  const res = [];
  const L = busy(); let recs = [null, null, null];
  for (let r = 0; r < 3; r++) {
    const live = L.order[r], a = trace(L, live, recs, busyCtrl[live]), b = trace(busy(), live, recs, busyCtrl[live]);
    let same = a.out.length === b.out.length;
    for (let i = 0; same && i < a.out.length; i++) if (a.out[i] !== b.out[i]) same = false;
    res.push(chk(same && a.out.length > 100, `round ${r + 1}: ${a.out.length} values identical (${a.S.status} ${a.S.reason})`));
    recs = recs.slice(); recs[live] = FB.finalRec(a.S);
  }
  return res;
});

scenario('determinism: a live round and its replay look the same to the defence', () => {
  const L = busy(); let recs = [null, null, null];
  for (let r = 0; r < 2; r++) { const live = L.order[r]; recs = recs.slice(); recs[live] = FB.finalRec(trace(L, live, recs, busyCtrl[live]).S); }
  const liveRun = trace(L, 1, recs, busyCtrl[1]);
  const all = recs.slice(); all[1] = FB.finalRec(liveRun.S);
  const rep = trace(L, -1, all, null);
  const n = Math.min(liveRun.out.length, rep.out.length);
  let diff = 0; for (let i = 0; i < n; i++) diff = Math.max(diff, Math.abs(liveRun.out[i] - rep.out[i]));
  return [chk(n > 100 && diff === 0, `largest difference over ${n} values: ${diff}`)];
});

scenario('compatibility: old-format levels (mark / zone with only x, y, spd, eng) still load and run', () => {
  const L = lvl([{ x: 25, y: 50 }, { x: 31, y: 27 }], [{ t: 'zone', x: 25, y: 39, spd: 5.2, eng: 7 }, { t: 'mark', a: 1, x: 30.6, y: 24.8, spd: 4.6, eng: 3.5 }, { t: 'zone', x: 18, y: 25, spd: 5.3, eng: 6 }]);
  const S = run(L, (S, me, t) => go(me, 31, 47), { ticks: 120 });
  const d = S.def[0];
  return [chk(S.def.every(d => isFinite(d.x) && isFinite(d.y)), 'positions finite'),
    chk(['fx', 'fy', 'lunge', 'offBalance', 'intent'].every(k => d[k] !== undefined && S.gk[k] !== undefined), 'renderer fields present on defenders and keeper'),
    chk(typeof FB.offsideLine(S) === 'number' && FB.makeSim && FB.step && FB.finalRec && FB.C && FB.P && FB.LEVELS, 'public API intact')];
});

/* ---------------- finish pressure (10-finish-pressure.md, 13-a-b-in-the-game.md). Each scenario sets its own options, then restores ---------------- */
// Engine options for one scenario. makeSim loads FB.C0 (the defaults) plus the level's own `engine` field into FB.C, so
// a scenario changes the defaults, and puts them back afterwards.
function withC(over, fn) { const C0 = FB.C0, save = {}; for (const k in over) { save[k] = C0[k]; C0[k] = over[k]; C[k] = over[k]; } try { return fn(); } finally { Object.assign(C0, save); Object.assign(C, save); } }
const SPRINT = { recSpd: 7.0, recBoost: 1.3 };
// a carrier through on goal: he received in behind a back two at y 27 and runs at goal, then stops at 18 m to aim
function throughLvl(dy) { return lvl([{ x: 25, y: 25 + dy }], [{ t: 'line', x: 21, y: 28.5 + dy, spd: 5.3 }, { t: 'line', x: 31, y: 28.5 + dy, spd: 5.3 }]); }
const dawdle = dy => (S, me, t) => me.y > 18 + dy ? go(me, 25, 0) : { mx: 0, my: 0, charging: true, aim: true, ax: 0, ay: -1, power: 1 };
scenario('recovery sprint: near goal a played-through defender sprints back (faster than a dribbler, never above recSpd) and catches a striker who stops to aim', () => {
  let top = 0, stopT = -1;
  const S = withC(Object.assign({ dangerR: 0, coverDeep: 0 }, SPRINT), () => run(throughLvl(0), dawdle(0), { ticks: 400, each: S => { S.def.forEach(d => { if (d.sprint) top = Math.max(top, hyp(d.vx, d.vy)); }); if (stopT < 0 && S.att[0].y <= 18.05) stopT = S.tick; } }));
  const S0 = withC({ recSpd: 0, dangerR: 0 }, () => run(throughLvl(0), dawdle(0), { ticks: 400 }));
  return [chk(top > C.ballSpd && top <= SPRINT.recSpd + 1e-9, `fastest sprint ${f(top)} m/s (dribbling ${C.ballSpd}, cap ${SPRINT.recSpd})`),
    chk(S.reason === 'tackled' && (S.tick - stopT) / 60 < 1.3, `with the sprint he is ${S.reason} ${f((S.tick - stopT) / 60)} s after stopping at 18 m`),
    chk(S0.status !== 'fail' || S0.tick > S.tick + 20, `without it: ${S0.status} ${S0.reason} at ${f(S0.tick / 60)} s (with it ${f(S.tick / 60)} s)`)];
});
scenario('recovery sprint: not in midfield, and not for a loose ball', () => {
  let midTop = 0, looseTop = 0;
  withC(SPRINT, () => run(throughLvl(22), dawdle(22), { ticks: 240, each: S => S.def.forEach(d => { midTop = Math.max(midTop, hyp(d.vx, d.vy)); }) }));
  const L = lvl([{ x: 25, y: 40 }, { x: 25, y: 30, role: 'ball' }], [{ t: 'line', x: 20, y: 28, spd: 5.3 }, { t: 'line', x: 30, y: 28, spd: 5.3 }]);
  withC(SPRINT, () => run(L, (S, me, t) => kick(me, 25, 12, 0.7, t, 10), { live: 0, ticks: 120, each: S => S.def.forEach(d => { looseTop = Math.max(looseTop, hyp(d.vx, d.vy)); }) }));
  return [chk(midTop <= 5.3 + 1e-9, `the same run 22 m further out: fastest defender ${f(midTop)} m/s (his own speed 5.3)`),
    chk(looseTop <= 5.3 + 1e-9, `a through ball into the box: fastest defender ${f(looseTop)} m/s while it is loose`)];
});
scenario('danger zone: a striker standing 17 m out between two wide-apart centre-halves is closed down by the nearer one', () => {
  const L = lvl([{ x: 23, y: 17 }], [{ t: 'line', x: 12, y: 14.5, spd: 5.3 }, { t: 'line', x: 38, y: 14.5, spd: 5.3 }]);
  const stand = (S, me, t) => ({ mx: 0, my: 0 });
  const on = withC({ dangerR: 24, recSpd: 0 }, () => run(L, stand, { ticks: 300 })), off = withC({ dangerR: 0, recSpd: 0 }, () => run(L, stand, { ticks: 300 }));
  return [chk(on.reason === 'tackled' && on.failBy === 0, `with the rule: ${on.status} ${on.reason} by defender ${on.failBy} after ${f(on.tick / 60)} s (want the nearer, 0)`),
    chk(off.status === 'play', `without it nobody goes: ${off.status} ${off.reason} after ${f(off.tick / 60)} s`)];
});
function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
scenario('one goes, one covers: when a centre-half steps out, his inside partner drops 3.5-6 m behind him, between ball and goal', () => {
  const L = lvl([{ x: 21, y: 45 }], line4(25));
  let best = null;
  withC({ coverDeep: 1 }, () => run(L, (S, me, t) => go(me, 22, 20), { ticks: 260, each: S => {
    const p = S.presser; if (p < 0 || S.def[p].kind !== 'line' || S.status !== 'play') return;
    const pr = S.def[p], u = S.units[pr.ui], k = pr.uk, nb = [u.m[k - 1], u.m[k + 1]].filter(i => i !== undefined).map(i => S.def[i]);
    const ins = nb.sort((a, b) => Math.abs(a.hx - 25) - Math.abs(b.hx - 25))[0], b = S.ball;
    const depth = pr.y - ins.y, gl = hyp(P.cx - b.x, b.y), lateral = Math.abs(((ins.x - b.x) * (-b.y) - (ins.y - b.y) * (P.cx - b.x)) / gl);
    if (hyp(pr.x - b.x, pr.y - b.y) < 3) best = { depth, lateral };
  } }));
  return [chk(best && best.depth > 3.5 && best.depth < 6.5, `cover depth ${best ? f(best.depth) : '-'} m behind the man who stepped out`), chk(best && best.lateral < 2.5, `${best ? f(best.lateral) : '-'} m off the ball-goal line`)];
});
scenario('keeper (bisector, shaded to the near post): with the ball wide, the near post closes and what is open is at the far post', () => {
  const g = withC({ gkBisect: 1, gkNear: 0.2 }, () => run(shotLvl(40, 14), () => ({}), { ticks: 180 }).gk);
  const centreLine = 25 + (40 - 25) * (g.y / 14);   // x of the ball-goal-centre line at his depth
  // metres of the near half and the far half of the goal that a full-power shot from a standing start scores in
  const split = (x, y) => { let n = 0, fa = 0; for (let tx = 21.2; tx <= 28.85; tx += 0.4) if (shoot(x, y, tx, 1).status === 'goal') { if ((tx - 25) * (x - 25) > 0) n += 0.4; else fa += 0.4; } return [n, fa]; };
  const out = [chk(g.x - centreLine > 0.4, `ball (40,14): keeper at x ${f(g.x)}, ${f(g.x - centreLine)} m towards the near post from the ball-goal-centre line`)];
  for (const [x, y] of [[36, 12], [33, 17], [38, 13]]) {
    const on = withC({ gkBisect: 1, gkNear: 0.2 }, () => split(x, y)), off = withC({ gkBisect: 0, gkNear: 0 }, () => split(x, y));
    out.push(chk(on[1] >= on[0] && on[0] < off[0], `from (${x},${y}): near/far open ${f(on[0])}/${f(on[1])} m (old keeper ${f(off[0])}/${f(off[1])} m)`));
  }
  return out;
});

/* ---------------- marker hand-over (markLeash, 13-a-b-in-the-game.md) ---------------- */
// a decoy (attacker 0) and a man-marker 2.5 m goal-side of him; the ball sits with a future player deep in midfield
const leashLvl = (dx, dy, mk) => lvl([{ x: 25 + dx, y: 28 + dy, role: 'decoy' }, { x: 25, y: 50, role: 'ball' }],
  [Object.assign({ t: 'mark', a: 0, x: 25 + dx, y: 25.5 + dy, spd: 5.5 }, mk || {}), { t: 'line', x: 12, y: 25, spd: 5.2 }, { t: 'line', x: 38, y: 25, spd: 5.2 }]);
function dragged(L, path, ticks) {
  let wp = 0, far = 0; const d0 = L.def[0];
  const S = run(L, (S, me) => { if (wp < path.length && hyp(path[wp][0] - me.x, path[wp][1] - me.y) < 0.4) wp++; return wp < path.length ? go(me, path[wp][0], path[wp][1]) : { mx: 0, my: 0 }; },
    { ticks: ticks || 300, each: S => { far = Math.max(far, hyp(S.def[0].x - d0.x, S.def[0].y - d0.y)); } });
  const d = S.def[0], me = S.att[0];
  return { S, far, home: hyp(d.x - d0.x, d.y - d0.y), toMan: hyp(d.x - me.x, d.y - me.y), handed: d.handed };
}
scenario('hand-over: a decoy who runs 20 m out to the touchline is passed on once he is 10 m from where the marking started; the marker returns to shape', () => {
  const r = dragged(leashLvl(0, 0), [[5, 30]], 330);
  return [chk(r.handed, 'marker has handed his man over'), chk(r.far > 5 && r.far < C.markLeash + 4, `he went ${f(r.far)} m with him at most (leash ${C.markLeash})`),
    chk(r.home < 6, `at the end he is ${f(r.home)} m from his set position, ${f(r.toMan)} m from the decoy`)];
});
scenario('hand-over: a man coming short (away from goal) is passed on too', () => {
  const r = dragged(leashLvl(0, 0), [[25, 46]], 330);
  return [chk(r.handed && r.far < C.markLeash + 4 && r.home < 6, `handed ${r.handed}, went ${f(r.far)} m at most, ends ${f(r.home)} m from his position`)];
});
scenario('hand-over: never for a run towards goal; a man running in behind is followed all the way', () => {
  const r = dragged(leashLvl(-8, 0), [[24, 12], [22, 6]], 240);
  return [chk(!r.handed && r.far > C.markLeash + 2 && r.toMan < 3.5, `handed ${r.handed}, went ${f(r.far)} m, ${f(r.toMan)} m from his man at the end`)];
});
scenario('hand-over: he picks his man up again when the man comes back', () => {
  let wasHanded = false;
  const L = leashLvl(0, 0); let wp = 0; const path = [[8, 30], [24, 28]];
  const S = run(L, (S, me) => { if (wp < path.length && hyp(path[wp][0] - me.x, path[wp][1] - me.y) < 0.4) wp++; return wp < path.length ? go(me, path[wp][0], path[wp][1]) : { mx: 0, my: 0 }; },
    { ticks: 420, each: S => { wasHanded = wasHanded || S.def[0].handed; } });
  return [chk(wasHanded && !S.def[0].handed && hyp(S.def[0].x - S.att[0].x, S.def[0].y - S.att[0].y) < 3.5, `handed over on the way out ${wasHanded}, marking again at the end ${!S.def[0].handed}, ${f(hyp(S.def[0].x - S.att[0].x, S.def[0].y - S.att[0].y))} m from him`)];
});
scenario('hand-over: a defender\'s own `leash` overrides markLeash, and markLeash 0 switches it off (he follows to the touchline)', () => {
  const short = dragged(leashLvl(0, 0, { leash: 5 }), [[5, 30]], 330);
  const off = withC({ markLeash: 0 }, () => dragged(leashLvl(0, 0), [[5, 30]], 330));
  return [chk(short.handed && short.far < 5 + 4, `leash 5: handed ${short.handed} after at most ${f(short.far)} m`),
    chk(!off.handed && off.far > 15 && off.toMan < 3.5, `markLeash 0: handed ${off.handed}, followed ${f(off.far)} m, ${f(off.toMan)} m from the decoy`)];
});
scenario('hand-over: never while his man has the ball; he presses him wherever he takes it', () => {
  const L = lvl([{ x: 25, y: 28 }], [{ t: 'mark', a: 0, x: 25, y: 25.5, spd: 5.5 }]);
  let handed = false;
  const S = run(L, (S, me) => go(me, 8, 40), { ticks: 240, each: S => { handed = handed || S.def[0].handed; } });
  return [chk(!handed && (S.status === 'fail' || hyp(S.def[0].x - S.att[0].x, S.def[0].y - S.att[0].y) < 3), `handed ${handed}; ${S.status} ${S.reason}, ${f(hyp(S.def[0].x - S.att[0].x, S.def[0].y - S.att[0].y))} m from the carrier`)];
});
scenario('levels: per-level engine settings apply to that level only, and two sims of different levels stepped in turn keep their own', () => {
  const A = lvl([{ x: 25, y: 28 }], [], { engine: { recSpd: 0, gkBisect: 0 } }), B = lvl([{ x: 25, y: 28 }], []);
  const sa = FB.makeSim(A, [null], 0), sb = FB.makeSim(B, [null], 0); const seen = [];
  for (let k = 0; k < 3; k++) { FB.step(sa, {}); seen.push(C.recSpd, C.gkBisect); FB.step(sb, {}); seen.push(C.recSpd, C.gkBisect); }
  let bad = false; try { FB.makeSim(lvl([{ x: 25, y: 28 }], [], { engine: { recSdp: 0 } }), [null], 0); } catch (e) { bad = true; }
  return [chk(seen.join(',') === [0, 0, FB.C0.recSpd, FB.C0.gkBisect].concat([0, 0, FB.C0.recSpd, FB.C0.gkBisect], [0, 0, FB.C0.recSpd, FB.C0.gkBisect]).join(','), `settings seen while stepping: ${seen.join(',')}`),
    chk(bad, 'a misspelt engine setting is refused')];
});

scenario('fairness: no defender or keeper ever moved faster than 5.8 m/s in any scenario above, except a defender in a recovery sprint (never above recSpd 7.0)', () =>
  [chk(maxDefSpd <= 5.8 + 1e-9, `fastest defender not sprinting ${f(maxDefSpd)} m/s`), chk(maxSprint <= 7.0 + 1e-9, `fastest recovery sprint ${f(maxSprint)} m/s`), chk(maxGkSpd <= 5.8 + 1e-9, `fastest keeper ${f(maxGkSpd)} m/s`)]);

console.log(failed ? `\n${failed} scenario(s) FAILED` : '\nall scenarios passed');
process.exit(failed ? 1 : 0);
