// Simulation harness for the level generator: plays bot routes on the live engine (one-man-team/js/sim.js, read only).
// The same functions as the set D design lab (docs/foundation/sets, /home/claude/sets/setD/lab.js), so the checks that
// colleague wrote run unchanged: play one round, replay a move, solve a whole bot route, analyse every pass.
'use strict';
const path = require('path');
if (!global.OMT_LEVELS) global.OMT_LEVELS = [];
const { FB } = require(path.join(__dirname, '..', '..', 'one-man-team', 'js', 'sim.js'));
const C = FB.C, hyp = Math.hypot;

function goTo(me, x, y) { const dx = x - me.x, dy = y - me.y, d = hyp(dx, dy); return d < 0.3 ? { mx: 0, my: 0 } : { mx: dx / d, my: dy / d }; }
function chase(S, me, t0) {
  const b = S.ball;
  for (let t = t0 || 0; t < 4; t += 0.05) { const k = (1 - Math.exp(-C.fric * t)) / C.fric, px = b.x + b.vx * k, py = b.y + b.vy * k;
    if (hyp(px - me.x, py - me.y) <= C.runSpd * t * 0.85 + 1.0) return goTo(me, px, py); }
  return goTo(me, b.x, b.y);
}
// identical to tools/bots.js makeBot, plus `hold` (extra ticks aiming; used only by the checks, never written out)
function makeBot(sc) {
  const st = { wp: 0, hold: 0 };
  const aimAt = (me, tx, ty, power) => { const dx = tx - me.x, dy = ty - me.y, d = hyp(dx, dy) || 1; return { charging: true, aim: true, ax: dx / d, ay: dy / d, power }; };
  return function (S) {
    const i = S.live, me = S.att[i], t = S.tick;
    if (sc.decoy) { if (st.wp < sc.decoy.length) { const w = sc.decoy[st.wp]; if (hyp(w[0] - me.x, w[1] - me.y) < 0.8) st.wp++; return goTo(me, w[0], w[1]); } return { done: true }; }
    if (S.liveKickTick >= 0) return {};
    if (S.ball.owner === i) {
      if (!sc.first && st.wp < (sc.carry || []).length) { const w = sc.carry[st.wp]; if (hyp(w[0] - me.x, w[1] - me.y) < 0.8) st.wp++; return goTo(me, w[0], w[1]); }
      if (st.hold < (sc.first ? 2 : 12) + (sc.hold || 0)) { st.hold++; return Object.assign({ mx: 0, my: 0 }, aimAt(me, sc.kickAt[0], sc.kickAt[1], sc.power)); }
      return { release: true };
    }
    if (S.ball.owner < 0 && S.chain[S.chainPos + 1] === i && sc.spot) {
      const b = S.ball, d = hyp(b.x - me.x, b.y - me.y);
      if (d < (sc.grab || 4.5) || hyp(b.vx, b.vy) < 4) return goTo(me, b.x + b.vx * 0.12, b.y + b.vy * 0.12);
      return t >= (sc.start || 0) ? goTo(me, sc.pre[0][0], sc.pre[0][1]) : { mx: 0, my: 0 };
    }
    if (S.ball.owner < 0 && S.chain[S.chainPos + 1] === i) return chase(S, me, Math.max(0, (sc.meet || 0) - (S.tick - S.ball.kickTick) / 60));
    if (sc.pre && t >= (sc.start || 0)) return goTo(me, sc.pre[0][0], sc.pre[0][1]);
    return {};
  };
}
let SIMS = 0;   // counter of rounds simulated (for the generator's statistics)
function play(L, recs, live, sc, hook) { SIMS++; const S = FB.makeSim(L, recs, live), bot = makeBot(sc); while (S.status === 'play') { FB.step(S, bot(S)); if (hook && hook(S) === 'stop') break; } return S; }
function replay(L, recs, hook) { SIMS++; const R = FB.makeSim(L, recs, -1); while (R.status === 'play') { FB.step(R, {}); if (hook) hook(R); } return R; }
function solve(L, sc) {
  const recs = L.att.map(() => null), pre = [], rounds = [];
  for (let r = 0; r < L.order.length; r++) {
    const live = L.order[r]; pre.push(recs.slice());
    const S = play(L, recs, live, sc[r]);
    rounds.push(S);
    if (S.status === 'fail') return { ok: false, failRound: r, reason: S.reason, S, pre, rounds };
    recs[live] = FB.finalRec(S);
  }
  const R = replay(L, recs);
  return { ok: R.status === 'goal', failRound: R.status === 'goal' ? -1 : L.order.length, reason: R.reason, pre, recs, time: R.tick / 60, R, rounds };
}
const onFeet = d => d.offBalance === 0;

// Analyse the full replay: every pass (kick by a non-last ball player) and its reception, plus the shot.
function analyse(L, recs) {
  const chain = L.order.filter(i => L.att[i].role === 'ball'), ev = [];
  let cur = null; const ctrl = { [chain[0]]: 0 };
  const R = replay(L, recs, S => {
    const b = S.ball, t = S.tick;
    if (b.owner < 0 && b.kickTick === t - 1 && (!cur || cur.kt !== b.kickTick)) {
      const k = b.lastKicker, a = S.att[k];
      const ol = FB.offsideLine(S);
      const nextI = chain[chain.indexOf(k) + 1];
      const nxt = nextI !== undefined ? S.att[nextI] : null;
      const near = Math.min(...S.def.map(d => hyp(d.x - a.x, d.y - a.y)));
      const units = S.units.map(u => u.intent).join(',');
      cur = { k, num: L.att[k].num, kt: b.kickTick, kx: a.x, ky: a.y, ballY: b.y, ol, recv: nextI, rnum: nxt ? L.att[nextI].num : null,
        rx: nxt ? nxt.x : 0, ry: nxt ? nxt.y : 0, onsideBy: nxt ? ol - nxt.y : 0, ahead: nxt ? nxt.y < b.y : false, pressD: near, units, lane: 99, laneWho: '', spareCtrl: (t - 1 - (ctrl[k] || 0)) / 60 };
      ev.push(cur);
    }
    if (cur && b.owner < 0 && t - cur.kt > 6) {
      S.def.forEach((d, di) => { if (!onFeet(d)) return; const dd = hyp(d.x - b.x, d.y - b.y); if (dd < cur.lane) { cur.lane = dd; cur.laneWho = d.kind + di; } });
    }
    if (cur && b.owner >= 0 && b.owner === cur.recv && cur.ct === undefined) {
      cur.ct = t; cur.cx = S.att[b.owner].x; cur.cy = S.att[b.owner].y; cur.cDist = hyp(cur.cx - 25, cur.cy); cur.press = 99; ctrl[b.owner] = t;
    }
    if (cur && cur.ct !== undefined && t - cur.ct <= 28) {
      const a = S.att[cur.recv];
      S.def.forEach(d => { if (onFeet(d)) cur.press = Math.min(cur.press, hyp(d.x - a.x, d.y - a.y)); });
    }
  });
  return { R, ev };
}
// hash of every tick of a replay (ball, keeper, every defender and attacker): the determinism check
function replayHash(L, recs) {
  let h = 2166136261 >>> 0;
  const mix = v => { const n = Math.round(v * 1000) | 0; h = Math.imul(h ^ n, 16777619) >>> 0; };
  const R = replay(L, recs, S => { mix(S.ball.x); mix(S.ball.y); mix(S.gk.x); mix(S.gk.y); S.def.forEach(d => { mix(d.x); mix(d.y); }); S.att.forEach(a => { mix(a.x); mix(a.y); }); });
  return { hash: h, status: R.status, tick: R.tick };
}
module.exports = { FB, C, makeBot, play, replay, solve, analyse, replayHash, sims: () => SIMS };
