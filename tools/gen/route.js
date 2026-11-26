// Bot-route synthesis. A template's plan says, per round, the kind of touch (to feet, first time, carry then pass, a
// through ball into space, a run along the line, the finish) and the intended points. This searches the bot script
// fields of tools/bots.js around that plan, round by round, depth first with backtracking:
//   1. reception: scan the run's start tick; keep the longest run of start ticks that get him the ball and take its
//      middle (so the route sits in the middle of the timing window, which is what the jitter test rewards);
//   2. the touch: try kick targets, powers and carries in order of distance from the plan until the round is won;
//   3. the finisher: carry to a shooting spot on his side, 11-16 m out, and shoot for the far corner.
// The full replay must score. Deterministic: no randomness at all, only the plan and the engine.
'use strict';
const { FB, C, play, replay } = require('./lab.js');
const hyp = Math.hypot;
const r1 = v => Math.round(v * 10) / 10, r2 = v => Math.round(v * 100) / 100;

// power for a pass of `d` metres that arrives with about `v` m/s (pass speed falls linearly with distance, 0.8 per m)
function powerFor(d, v) { const v0 = C.fric * d + v + C.stopV; return Math.max(0.02, Math.min(1, (v0 - C.kickMin) / (C.kickMax - C.kickMin))); }
// time (s) for the ball, kicked from (bx,by) with (vx,vy), to come closest to (px,py)
function ballTimeTo(k, px, py) {
  let best = 99, bt = 0;
  for (let t = 0; t < 4; t += 0.02) { const f = (1 - Math.exp(-C.fric * t)) / C.fric, x = k.bx + k.vx * f, y = k.by + k.vy * f, d = hyp(x - px, y - py); if (d < best) { best = d; bt = t; } }
  return bt;
}
function rotAbout(o, p, deg) { const t = deg * Math.PI / 180, dx = p[0] - o[0], dy = p[1] - o[1]; return [o[0] + dx * Math.cos(t) - dy * Math.sin(t), o[1] + dx * Math.sin(t) + dy * Math.cos(t)]; }
const clampPt = p => [Math.max(1.5, Math.min(48.5, p[0])), Math.max(0.5, Math.min(58, p[1]))];
const rp = p => [r1(p[0]), r1(p[1])];
const unitV = (x, y) => { const l = hyp(x, y) || 1; return [x / l, y / l]; };

function shotOptions(fromX) {
  // shooting spots on his side of the box, 11-16 m from goal centre, and the far corner
  const s = fromX >= 25 ? 1 : -1, out = [];
  // the preferred spots first (14 m, 15-25 degrees off centre), then the rest; wide angles last (a winger cutting in)
  const spots = [];
  for (const d of [14, 12.5, 15.5, 11]) for (const a of [15, 25, 5, 33]) spots.push([d, a]);
  for (const d of [15, 16.5, 13]) for (const a of [40, 47]) spots.push([d, a]);
  for (const [d, a] of spots) {
    const t = a * Math.PI / 180, x = 25 + s * d * Math.sin(t), y = d * Math.cos(t);
    for (const fx of [2.7, 2.1, 3.3]) out.push({ carry: [rp([x, y])], kickAt: [r1(25 - s * fx), 0] });
  }
  return out;
}

function synth(L, plan, opts) {
  opts = opts || {};
  const maxSims = opts.maxSims || 2500, maxSucc = opts.maxSucc || 3;
  const chain = L.order.filter(i => L.att[i].role === 'ball'), n = L.order.length;
  let sims = 0, why = {};
  const note = (r, s) => { const k = 'r' + (r + 1) + ' ' + s; why[k] = (why[k] || 0) + 1; };
  // play a round; with stopAfterRecv, stop 22 ticks after he has the ball and measure what the rulebook cares about:
  // how far out he takes it (J4a), the nearest defender in those ticks (J1, J5) and his offside margin at the kick (J3)
  const run = (recs, live, sc, stopAfterRecv, K) => {
    sims++;
    let got = -1, ctrlD = 0, press = 99, margin = null;
    const S = play(L, recs, live, sc, stopAfterRecv ? (S) => {
      const me = S.att[live];
      if (K !== undefined && S.tick === K + 1 && margin === null) margin = me.y - FB.offsideLine(S);
      if (got < 0 && S.ball.owner === live) { got = S.tick; ctrlD = hyp(me.x - 25, me.y); }
      if (got >= 0) { S.def.forEach(d => { if (d.offBalance === 0) press = Math.min(press, hyp(d.x - me.x, d.y - me.y)); }); if (S.tick - got > 22) return 'stop'; }
    } : null);
    return { S, got, ctrlD, press, margin };
  };
  function* roundCands(r, recs) {
    const step = plan[r], live = L.order[r], a = L.att[live];
    if (sims > maxSims) return;
    if (step.decoy) {
      for (const k of [1, 0.85, 0.7]) {
        const w = step.decoy.map(p => rp([a.x + (p[0] - a.x) * k, a.y + (p[1] - a.y) * k]));
        const sc = { decoy: w }, { S } = run(recs, live, sc);
        if (S.status !== 'fail') yield sc; else note(r, 'decoy ' + S.reason);
      }
      return;
    }
    const ci = chain.indexOf(live), isLast = ci === chain.length - 1;
    // ---- reception
    let starts = [null];
    const base = {};
    if (step.recv) {
      const prev = chain[ci - 1], k = recs[prev] && recs[prev].kick;
      if (!k) { note(r, 'no previous kick'); return; }
      const K = k.tick, pre = step.recv.pre;
      const tr = hyp(pre[0] - a.x, pre[1] - a.y) / C.runSpd + 0.25, tb = ballTimeTo(k, pre[0], pre[1]);
      let nom = Math.round(K + 60 * (tb - tr)), list;
      if (step.recv.timing === 'now') list = [0, 10, 20, 30];
      else if (step.recv.timing === 'timed') list = [0, -10, 10, -20, 20, -30, 30, -40, 40, 55].map(d => nom + d);
      else { list = []; for (let d = -100; d <= 40; d += 8) list.push(nom + d); }
      list = [...new Set(list.map(v => Math.max(0, v)))].sort((p, q) => p - q);
      Object.assign(base, { pre: [rp(pre)] });
      if (step.recv.mode === 'spot') { base.spot = 1; if (step.recv.grab) base.grab = step.recv.grab; }
      else base.meet = step.recv.meet || 0.2;
      const probeKick = isLast ? { kickAt: [25, 0], power: 1 } : { kickAt: rp(step.pass.to), power: 0.5 };
      const ok = [], info = {};
      const runner = step.recv.timing === 'onside' || step.recv.mode === 'chase';
      for (const st of list) {
        const sc = Object.assign({ start: st }, base, probeKick, step.first ? { first: 1 } : {});
        const res = run(recs, live, sc, true, K), S = res.S, got = res.got;
        if (got >= 0 && (S.status !== 'fail' || S.tick - got > 22 || S.liveKickTick >= 0)) { ok.push(st); info[st] = res; } else note(r, 'reception ' + (S.reason || 'none') + (opts.why && S.failBy !== undefined ? ' by ' + (S.failBy === 'gk' ? 'gk' : (S.def[S.failBy] || {}).kind + S.failBy) : ''));
        if (sims > maxSims) return;
      }
      if (!ok.length) return;
      // the longest contiguous run of good starts; inside it, the start that makes the football the rulebook asks
      // for (the runner: taken 17-28 m out, onside by 0.4-2.5 m at the kick; a middle receiver: closed within
      // 3.5 m), with a pull towards the middle of the run so that the timing stays forgiving
      const idx = ok.map(v => list.indexOf(v)); let bestA = 0, bestL = 1, a0 = 0;
      for (let i = 1; i <= idx.length; i++) { if (i === idx.length || idx[i] !== idx[i - 1] + 1) { if (i - a0 > bestL) { bestL = i - a0; bestA = a0; } a0 = i; } }
      const runS = ok.slice(bestA, bestA + bestL), cIdx = (runS.length - 1) / 2;
      const out = (v, lo, hi) => v < lo ? lo - v : v > hi ? v - hi : 0;
      const score = st => {
        const f = info[st], i = runS.indexOf(st), edge = i < 0 ? 3 : Math.abs(i - cIdx) / Math.max(1, cIdx + 0.5);
        if (runner) return out(f.ctrlD, 17, 28) * 0.5 + (f.margin === null ? 0 : out(f.margin, 0.4, 2.5) * 1.5) + edge * 1.2 + (i <= 0 || i >= runS.length - 1 ? 1 : 0);
        return out(f.press, 0, 3.5) * 0.4 + edge * 1.0 + (runS.length > 2 && (i <= 0 || i >= runS.length - 1) ? 0.8 : 0);
      };
      starts = ok.slice().sort((p, q) => score(p) - score(q)).slice(0, 3);
    }
    // ---- the touch (one finish per route is enough: alternatives should come from the earlier rounds)
    let succ = 0;
    const maxS = isLast ? 1 : maxSucc;
    for (const st of starts) {
      const rb = st === null ? {} : Object.assign({ start: st }, base);
      let opts2 = [];
      if (isLast) {
        if (step.first) for (const gx of [22.6, 27.4, 22.1, 27.9, 23.3, 26.7]) opts2.push({ first: 1, kickAt: [gx, 0], power: 1 });
        else {
          const fx = step.recv ? step.recv.pre[0] : a.x;
          opts2 = shotOptions(fx).map(o => Object.assign(o, { power: 1 }));
        }
      } else {
        const from = step.carry && step.carry.length ? step.carry[step.carry.length - 1] : (step.recv ? step.recv.pre : [a.x, a.y]);
        const to = step.pass.to, d = hyp(to[0] - from[0], to[1] - from[1]);
        const through = !!step.pass.through;
        const alongs = through ? [0, 2.5, -2.5, 5] : [0, -1, 1.5];
        const lats = step.viaDecoy ? [0, 1, -1] : through ? [0, 2, -2, 4, -4] : [0, 1.5, -1.5];
        const pws = [0, 0.08, -0.08, 0.16, -0.16];
        const st0 = step.recv ? step.recv.pre : [a.x, a.y];
        let carries = step.carry && step.carry.length && !step.first ? [step.carry, null, [rp([(from[0] + st0[0]) / 2, (from[1] + st0[1]) / 2])]] : [null];
        if (step.tight && step.carry && step.carry.length && !step.first) {
          // a release at the line: also carry further at the defender (1.5 m and 3 m on), so the pass can come during his plant
          const cd = unitV(from[0] - st0[0], from[1] - st0[1]);
          carries = [step.carry, [rp([from[0] + cd[0] * 1.5, from[1] + cd[1] * 1.5])], [rp([from[0] + cd[0] * 3, from[1] + cd[1] * 3])], null];
        }
        const ux = (to[0] - from[0]) / (d || 1), uy = (to[1] - from[1]) / (d || 1);
        const combos = [];
        for (const cv of carries) for (const al of alongs) for (const la of lats) for (const pw of pws) combos.push({ cv, al, la, pw, cost: Math.abs(al) / 2.5 + Math.abs(la) / 2 + Math.abs(pw) / 0.08 + (cv === carries[0] ? 0 : step.tight ? 0.6 : 1.5) });
        combos.sort((p, q) => p.cost - q.cost);
        for (const c of combos.slice(0, opts.maxKick || 40)) {
          const tgt = clampPt([to[0] + ux * c.al - uy * c.la, to[1] + uy * c.al + ux * c.la]);
          const dd = hyp(tgt[0] - from[0], tgt[1] - from[1]);
          const pw = r2(Math.max(0.02, Math.min(1, powerFor(dd, step.pass.v) + c.pw)));
          const o = { kickAt: rp(tgt), power: pw };
          if (c.cv) o.carry = c.cv.map(rp);
          if (step.first) o.first = 1;
          opts2.push(o);
        }
      }
      if (step.tight && !isLast) {
        // the idea's jeopardy is this pass (a release during the centre-half's plant, a ball past a stepping man):
        // among the first six that work, try the tightest lane first, as long as it is not a coin toss (1.0 m or more)
        const won = [];
        for (const o of opts2) {
          if (sims > maxSims || won.length >= 8) break;
          const sc = Object.assign({}, rb, o); let lane = 99; sims++;
          const S = play(L, recs, live, sc, S => { if (S.liveKickTick >= 0 && S.tick - S.liveKickTick > 6 && S.ball.owner < 0) S.def.forEach(d => { if (d.offBalance === 0) lane = Math.min(lane, hyp(d.x - S.ball.x, d.y - S.ball.y)); }); });
          if (S.status === 'won') won.push({ sc, lane }); else note(r, 'touch ' + S.reason);
        }
        won.sort((p, q) => (p.lane < 1 ? 5 : 0) + p.lane - ((q.lane < 1 ? 5 : 0) + q.lane));
        for (const w of won) { yield w.sc; if (++succ >= maxS) return; }
        continue;
      }
      for (const o of opts2) {
        if (sims > maxSims) return;
        const sc = Object.assign({}, rb, o);
        const { S } = run(recs, live, sc);
        if (S.status === 'won' || S.status === 'goal') { yield sc; if (++succ >= maxS) return; }
        else note(r, (isLast ? 'shot ' : 'touch ') + S.reason);
      }
    }
  }

  // Several complete routes may exist. With opts.score (lower is better, 0 = has everything the rulebook asks of the
  // route), keep searching after the first until one scores 0 or `solutions` routes have been found, and keep the best.
  let found = null, nSol = 0;
  const want = opts.solutions || 1, scoreFn = opts.score;
  function dfs(r, recs, scripts) {
    if ((found && (found.score === 0 || nSol >= want)) || sims > maxSims) return;
    if (r === n) {
      sims++; const R = replay(L, recs);
      if (R.status === 'goal') {
        const cand = { scripts: scripts.map(x => JSON.parse(JSON.stringify(x))), recs: recs.slice(), time: R.tick / 60 };
        cand.score = scoreFn ? scoreFn(cand) : 0; nSol++;
        if (!found || cand.score < found.score) found = cand;
      } else note(r - 1, 'replay ' + R.reason);
      return;
    }
    for (const sc of roundCands(r, recs)) {
      const live = L.order[r];
      const { S } = run(recs, live, sc);   // re-run to get its recording
      const rc = recs.slice(); rc[live] = FB.finalRec(S);
      scripts.push(sc); dfs(r + 1, rc, scripts); scripts.pop();
      if ((found && (found.score === 0 || nSol >= want)) || sims > maxSims) return;
    }
  }
  dfs(0, L.att.map(() => null), []);
  return { ok: !!found, route: found, sims, why, solutions: nSol };
}
// Centre each pass inside its windows: turn the aim about the kick spot and step the power, with the whole move
// required to score (the aim3.js criterion), and move the script to the middle of the run that contains it.
function polish(L, SC) {
  const out = SC.map(s => JSON.parse(JSON.stringify(s))), n = L.order.length;
  const chainOk = (pre, r, sc) => { const recs = pre.slice(); for (let k = r; k < n; k++) { const S = play(L, recs, L.order[k], k === r ? sc : out[k]); if (S.status === 'fail') return false; recs[L.order[k]] = FB.finalRec(S); } return replay(L, recs).status === 'goal'; };
  for (let r = 0; r < n - 1; r++) {
    const sc = out[r]; if (!sc.kickAt) continue;
    const recs = L.att.map(() => null);
    for (let k = 0; k < r; k++) { const S = play(L, recs, L.order[k], out[k]); recs[L.order[k]] = FB.finalRec(S); }
    let kx = null, ky = null;
    play(L, recs, L.order[r], sc, S => { if (kx === null && S.liveKickTick >= 0) { kx = S.liveRec.kick.bx; ky = S.liveRec.kick.by; } });
    if (kx === null) continue;
    const span = (test, step, max) => { let lo = 0, hi = 0; for (let d = step; d <= max + 1e-9; d += step) { if (test(-d)) lo = d; else break; } for (let d = step; d <= max + 1e-9; d += step) { if (test(d)) hi = d; else break; } return (hi - lo) / 2; };
    const aimAt = deg => rp(rotAbout([kx, ky], sc.kickAt, deg));
    const da = span(d => chainOk(recs, r, Object.assign({}, sc, { kickAt: aimAt(d) })), 1, 14);
    if (Math.abs(da) >= 0.5) sc.kickAt = aimAt(Math.round(da));
    const dp = span(d => sc.power + d >= 0.02 && sc.power + d <= 1 && chainOk(recs, r, Object.assign({}, sc, { power: r2(sc.power + d) })), 0.03, 0.3);
    if (Math.abs(dp) >= 0.03) sc.power = r2(Math.max(0.02, Math.min(1, sc.power + Math.round(dp / 0.03) * 0.03)));
  }
  return out;
}
module.exports = { synth, polish, powerFor };
