/* Training ground prototype: four drills. Logic only (no DOM), so it also runs in Node for balance tests.
   Each drill: { id, name, kind, blurb, how[], init() -> S, step(S, inp), hud(S), result(S) }.
   S is shaped like a simulation state from sim.js so the game's renderer can draw it unchanged. */
(function (root) {
  const FBx = typeof FB !== 'undefined' ? FB : require('../../one-man-team/js/sim.js').FB;
  const { TICK, P, C } = FBx;
  const KIT = { us: ['#E4572E', '#F2EAD8'], them: ['#14213D', '#8EC5D6'], gk: '#F2B705' };

  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
  function distSeg(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy || 1e-9;
    const t = clamp(((px - ax) * dx + (py - ay) * dy) / l2, 0, 1);
    return Math.hypot(px - (ax + dx * t), py - (ay + dy * t));
  }
  function segCross(a, b, c, d) {
    const o = (p, q, r) => Math.sign((q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x));
    return o(a, b, c) !== o(a, b, d) && o(c, d, a) !== o(c, d, b);
  }
  let seed = 7; const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;

  const mkP = (x, y, num) => ({ x, y, hx: x, hy: y, vx: 0, vy: 0, fx: 0, fy: -1, num, active: true, isLive: false, rec: null, charge: 0, hasAim: false, ax: 0, ay: -1 });
  const mkD = (x, y) => ({ x, y, hx: x, hy: y, vx: 0, vy: 0, fx: 0, fy: 1, lunge: 0, offBalance: 0, intent: 'shape', t: 'zone', footX: x, footY: y, striking: false });
  function base(name, att, def, frame) {
    const level = { name, kit: KIT, frame, att: att.map(a => ({ x: a.x, y: a.y, num: a.num })), def: def.map(d => ({ x: d.x, y: d.y })) };
    return {
      level, att, def, gk: { x: P.cx, y: 1.2, vx: 0, vy: 0, fx: 0, fy: 1, dive: 0, lunge: 0, offBalance: 0, intent: 'angle' },
      ball: { x: 0, y: 0, vx: 0, vy: 0, owner: -1, kickTick: -999, recvTick: -999, lastKicker: -1 },
      live: 0, role: 'ball', isLast: true, chain: [0], chainPos: 0, status: 'play', reason: '', failWho: -1, failBy: -1,
      tick: 0, limit: 1e9, liveKickTick: -1, liveRec: { x: [], y: [], fx: [], fy: [], kick: null },
      score: 0, note: '', noteTick: -999, over: false
    };
  }
  function setLive(S, i) { S.live = i; S.att.forEach((a, k) => a.isLive = k === i); S.chain = [i]; }
  function note(S, t) { S.note = t; S.noteTick = S.tick; }
  function run(a, mx, my, top) {
    const m = Math.hypot(mx, my); let ux = mx, uy = my;
    if (m > 1) { ux /= m; uy /= m; }
    a.vx += (ux * top - a.vx) * C.accel; a.vy += (uy * top - a.vy) * C.accel;
    a.x = clamp(a.x + a.vx * TICK, 0.6, P.w - 0.6); a.y = clamp(a.y + a.vy * TICK, 0.9, P.h - 0.6);
    if (m > 0.15) { a.fx = mx / m; a.fy = my / m; }
  }
  function goTo(o, tx, ty, spd, lerp) {
    const dx = tx - o.x, dy = ty - o.y, d = Math.hypot(dx, dy) || 1e-6, sp = Math.min(spd, d * 6);
    o.vx += (dx / d * sp - o.vx) * (lerp || 0.15); o.vy += (dy / d * sp - o.vy) * (lerp || 0.15);
    o.x += o.vx * TICK; o.y += o.vy * TICK;
  }
  function face(o, tx, ty) { const d = Math.hypot(tx - o.x, ty - o.y); if (d > 0.01) { o.fx = (tx - o.x) / d; o.fy = (ty - o.y) / d; } }
  function aimInput(a, inp) {
    if (inp.charging) {
      if (inp.aim) { a.hasAim = true; a.ax = inp.ax; a.ay = inp.ay; a.charge = inp.power; }
      else { a.hasAim = false; a.charge = Math.min(1, a.charge + TICK / C.chargeTime); }
    }
  }
  function kick(S, a, i) {
    const dx = a.hasAim ? a.ax : a.fx, dy = a.hasAim ? a.ay : a.fy, sp = C.kickMin + (C.kickMax - C.kickMin) * a.charge, b = S.ball;
    b.x = a.x + dx * C.ballOff; b.y = a.y + dy * C.ballOff; b.vx = dx * sp; b.vy = dy * sp;
    b.owner = -1; b.kickTick = S.tick; b.lastKicker = i; a.charge = 0; a.hasAim = false;
  }
  function rollBall(b) {
    b.x += b.vx * TICK; b.y += b.vy * TICK;
    const f = Math.exp(-C.fric * TICK); b.vx *= f; b.vy *= f;
    if (Math.hypot(b.vx, b.vy) < C.stopV) { b.vx = 0; b.vy = 0; }
  }
  function lose(S, reason, by) { S.status = 'fail'; S.reason = reason; S.failBy = by === undefined ? -1 : by; S.failWho = S.live; S.over = true; }

  /* ---------------- 1. Rondo: keep the ball, five against two ---------------- */
  const RC = { x: 25, y: 27, r: 8.5 };
  const rondo = {
    id: 'rondo', name: 'Rondo', kind: 'Keep-ball · 5 v 2',
    blurb: 'Five on the outside, two in the middle. Keep it moving. How many passes before they win it?',
    how: ['You are always the player on the ball. Aim and release to pass.', 'One-touch passes and passes that split the two defenders score double.', 'They get quicker every five passes, and a third joins them at thirty.'],
    unit: 'points',
    init() {
      const att = []; for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + k * 2 * Math.PI / 5; att.push(mkP(RC.x + Math.cos(a) * RC.r, RC.y + Math.sin(a) * RC.r, [7, 8, 10, 6, 11][k])); }
      const S = base('Rondo', att, [mkD(RC.x - 1.5, RC.y), mkD(RC.x + 1.5, RC.y + 1)], { y1: RC.y + RC.r + 4 });
      S.holder = 3; S.passes = 0; S.presser = 0; S.from = null; S.defSpd = 3.8; S.started = false;
      att.forEach(a => face(a, RC.x, RC.y));
      const h = att[S.holder]; S.ball.owner = S.holder; S.ball.x = h.x + h.fx * C.ballOff; S.ball.y = h.y + h.fy * C.ballOff; S.ball.recvTick = 0;
      setLive(S, S.holder); return S;
    },
    step(S, inp) {
      if (S.over) return;
      const b = S.ball, t = S.tick;
      if (S.holder >= 0) {
        const a = S.att[S.holder];
        let mx = inp.mx || 0, my = inp.my || 0;
        // leash: the outside players stay near their spot
        const ox = a.x - a.hx, oy = a.y - a.hy, od = Math.hypot(ox, oy);
        if (od > 2.6 && mx * ox + my * oy > 0) { mx = 0; my = 0; }
        run(a, mx, my, C.ballSpd * (inp.charging ? C.chargeSlow : 1));
        if (Math.hypot(mx, my) < 0.15 && !a.hasAim) face(a, RC.x, RC.y);
        aimInput(a, inp);
        b.owner = S.holder; b.x = a.x + (a.hasAim ? a.ax : a.fx) * C.ballOff; b.y = a.y + (a.hasAim ? a.ay : a.fy) * C.ballOff; b.vx = a.vx; b.vy = a.vy;
        if (inp.release) {
          S.oneTouch = t - b.recvTick < 22 && S.passes > 0;
          S.from = { x: a.x, y: a.y }; kick(S, a, S.holder); S.kicker = S.holder; S.holder = -1; S.started = true;
          // who is it for: the other player whose spot is nearest the ball's line
          let best = -1, bd = 1e9; const ex = b.x + b.vx / C.fric, ey = b.y + b.vy / C.fric;
          S.att.forEach((p, i) => { if (i === S.kicker) return; const d = distSeg(p.hx, p.hy, b.x, b.y, ex, ey); if (d < bd) { bd = d; best = i; } });
          S.target = best; setLive(S, best);
        }
      } else {
        rollBall(b);
        const ex = b.x + b.vx / C.fric, ey = b.y + b.vy / C.fric;
        S.att.forEach((p, i) => {
          if (i === S.kicker) { goTo(p, p.hx, p.hy, 4); return; }
          // receivers step to meet the pass, within reach of their spot
          const dx = ex - b.x, dy = ey - b.y, l2 = dx * dx + dy * dy || 1e-9, u = clamp(((p.hx - b.x) * dx + (p.hy - b.y) * dy) / l2, 0, 1);
          let tx = b.x + dx * u, ty = b.y + dy * u; const d = dist(tx, ty, p.hx, p.hy);
          if (d > 3) { tx = p.hx; ty = p.hy; }
          goTo(p, tx, ty, 6.5, 0.25); face(p, b.x, b.y);
        });
        for (let i = 0; i < S.att.length; i++) {
          const p = S.att[i];
          if (i !== S.kicker && t - b.kickTick > 4 && dist(p.x, p.y, b.x, b.y) < 1.45) {
            S.holder = i; b.owner = i; b.recvTick = t; S.passes++;
            const split = S.from && segCross(S.from, { x: p.x, y: p.y }, S.def[0], S.def[1]);
            let pts = 1; if (split) pts++; if (S.oneTouch) pts++;
            S.score += pts; note(S, split && S.oneTouch ? 'SPLIT, ONE TOUCH +3' : split ? 'SPLIT THEM +2' : S.oneTouch ? 'ONE TOUCH +2' : '');
            if (S.passes === 30 && S.def.length === 2) { S.def.push(mkD(RC.x, RC.y)); note(S, 'THIRD MAN IN THE MIDDLE'); }
            else if (S.passes % 5 === 0) { S.defSpd = Math.min(7.6, S.defSpd + 0.28); note(S, (S.note ? S.note + ' · ' : '') + 'THEY SPEED UP'); }
            p.hasAim = false; p.charge = 0; setLive(S, i); break;
          }
        }
        if (S.holder < 0) {
          if (dist(b.x, b.y, RC.x, RC.y) > RC.r + 4.5) return lose(S, 'out');
          if (b.vx === 0 && b.vy === 0) return lose(S, 'short');
        }
      }
      // the two in the middle: one presses the ball, one covers the pass through the middle
      // the men in the middle: the nearest presses the ball, the others stand on the most open passing lanes
      let near = 0, nd = 1e9; S.def.forEach((d, i) => { const q = dist(d.x, d.y, b.x, b.y) - (i === S.presser ? 1.2 : 0); if (q < nd) { nd = q; near = i; } });
      S.presser = near;
      const pr = S.def[S.presser];
      if (S.started) {
        const lead = S.holder < 0 ? 0.18 : 0.05;
        goTo(pr, b.x + b.vx * lead, b.y + b.vy * lead, S.defSpd); pr.intent = 'press';
        const from = S.holder >= 0 ? S.att[S.holder] : (S.target >= 0 ? S.att[S.target] : null);
        if (from) {
          const lanes = []; S.att.forEach(p => { if (p !== from) lanes.push({ p, c: distSeg(pr.x, pr.y, from.x, from.y, p.hx, p.hy) }); });
          lanes.sort((u, v) => v.c - u.c);
          let k = 0; S.def.forEach((d, i) => { if (i === S.presser) return; const p = lanes[k++].p; goTo(d, from.x + (p.hx - from.x) * 0.5, from.y + (p.hy - from.y) * 0.5, S.defSpd * 0.95); d.intent = 'cover'; });
        }
      }
      S.def.forEach(d => face(d, b.x, b.y));
      for (let i = 0; i < S.def.length; i++) {
        const d = S.def[i], db = dist(d.x, d.y, b.x, b.y);
        if (S.holder >= 0) { if (t - b.recvTick > 18 && db < 1.0) return lose(S, 'tackled', i); }
        else if (t - b.kickTick > 3 && db < 1.0) return lose(S, 'intercepted', i);
      }
      S.tick++;
    },
    hud: S => ({ big: S.score, label: 'points', sub: S.passes + ' passes' }),
    result: S => ({ value: S.score, text: S.score + ' points from ' + S.passes + ' passes', why: { tackled: 'Caught on the ball.', intercepted: 'Pass cut out.', out: 'Out of the grid.', short: 'Underhit.' }[S.reason] || '' }),
    better: (a, b) => a > b
  };

  /* ---------------- 2. Piggy in the middle: you are the one chasing ---------------- */
  const piggy = {
    id: 'piggy', name: 'In the middle', kind: 'Winning it back · 1 v 5',
    blurb: 'Your turn in the middle. Five of them pass round you. Win it as often as you can in 30 seconds.',
    how: ['Drag to run. Get a foot on a pass or close the man on the ball.', 'Watch which way the passer turns: he looks before he plays it.', 'They move it faster each time you win it.'],
    unit: 'wins',
    init() {
      const def = []; for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + k * 2 * Math.PI / 5; def.push(mkD(RC.x + Math.cos(a) * 9, RC.y + Math.sin(a) * 9)); }
      const S = base('In the middle', [mkP(RC.x, RC.y, 4)], def, { y1: RC.y + 13 });
      S.limit = 30 * 60; S.h = 0; S.hold = 70; S.tgt = -1; S.rcv = -1; S.pause = 0; S.started = false;
      def.forEach(d => face(d, RC.x, RC.y)); setLive(S, 0);
      S.ball.x = def[0].x + def[0].fx * 0.9; S.ball.y = def[0].y + def[0].fy * 0.9; return S;
    },
    step(S, inp) {
      if (S.over) return;
      const b = S.ball, me = S.att[0], t = S.tick;
      run(me, inp.mx || 0, inp.my || 0, C.runSpd);
      if (Math.hypot(inp.mx || 0, inp.my || 0) > 0.15) S.started = true;
      if (!S.started) return;
      const won = () => {
        S.score++; note(S, 'WON IT'); b.recvTick = t; b.vx = 0; b.vy = 0; S.pause = 36;
        let far = 0, fd = -1; S.def.forEach((d, i) => { const q = dist(d.x, d.y, me.x, me.y); if (q > fd) { fd = q; far = i; } });
        S.h = far; S.rcv = -1; S.tgt = -1; S.hold = Math.max(26, 60 - 4 * S.score);
      };
      if (S.pause > 0) { if (--S.pause === 0) { const d = S.def[S.h]; face(d, RC.x, RC.y); b.x = d.x + d.fx * 0.9; b.y = d.y + d.fy * 0.9; } }
      else if (S.h >= 0) {
        const d = S.def[S.h];
        if (S.tgt < 0 && S.hold <= 18) {
          // look for the pass you are furthest from; now and then take the second-best
          const c = S.def.map((o, i) => ({ i, cl: i === S.h ? -1 : distSeg(me.x, me.y, d.x, d.y, o.x, o.y) })).sort((p, q) => q.cl - p.cl);
          S.tgt = (rnd() < 0.72 ? c[0] : c[1]).i;
        }
        if (S.tgt >= 0) face(d, S.def[S.tgt].x, S.def[S.tgt].y); else face(d, me.x, me.y);
        b.x = d.x + d.fx * 0.9; b.y = d.y + d.fy * 0.9; b.vx = 0; b.vy = 0;
        if (dist(me.x, me.y, b.x, b.y) < 1.25) won();
        else if (--S.hold <= 0) {
          const o = S.def[S.tgt], sp = Math.min(21, 15 + 0.5 * S.score), dd = dist(o.x, o.y, b.x, b.y) || 1;
          b.vx = (o.x - b.x) / dd * sp; b.vy = (o.y - b.y) / dd * sp; b.kickTick = t; S.rcv = S.tgt; S.h = -1;
        }
      } else {
        b.x += b.vx * TICK; b.y += b.vy * TICK;
        const o = S.def[S.rcv]; face(o, b.x, b.y);
        if (dist(me.x, me.y, b.x, b.y) < 1.15) won();
        else if (dist(o.x, o.y, b.x, b.y) < 1.2) { S.h = S.rcv; S.rcv = -1; S.tgt = -1; S.hold = Math.max(26, 60 - 4 * S.score); }
      }
      S.tick++;
      if (S.tick >= S.limit) { S.over = true; S.status = 'done'; }
    },
    hud: S => ({ big: S.score, label: 'wins', sub: Math.max(0, (S.limit - S.tick) / 60).toFixed(1) + 's left', clock: S.tick / S.limit }),
    result: S => ({ value: S.score, text: S.score + (S.score === 1 ? ' ball won' : ' balls won') + ' in 30 seconds', why: '' }),
    better: (a, b) => a > b
  };

  /* ---------------- 3. Slalom: dribble the gates and finish ---------------- */
  const GW = 2.2;   // half the width of a gate
  const GATES = [[20, 46], [30, 40.5], [20, 35], [30, 29.5], [20, 24], [28, 18.5]];
  const slalom = {
    id: 'slalom', name: 'The gates', kind: 'Dribbling · against the clock',
    blurb: 'Take the ball through six gates in order, then put it past the keeper. Fastest time wins.',
    how: ['Drag to dribble. The ball sits in front of you, so turn early.', 'Clip a cone and a second goes on your time.', 'After the last gate, aim and shoot. Miss and the run does not count.'],
    unit: 'seconds',
    init() {
      const S = base('The gates', [mkP(25, 53, 10)], [], { y1: 56 });
      S.cones = []; GATES.forEach(g => { S.cones.push({ x: g[0] - GW, y: g[1], hit: false }, { x: g[0] + GW, y: g[1], hit: false }); });
      S.gates = GATES; S.gw = GW; S.next = 0; S.pen = 0; S.started = false; S.shot = false; S.py = 53;
      S.ball.owner = 0; S.ball.x = 25; S.ball.y = 53 - C.ballOff; setLive(S, 0); return S;
    },
    step(S, inp) {
      if (S.over) return;
      const b = S.ball, a = S.att[0], g = S.gk;
      if (!S.started) { if (Math.hypot(inp.mx || 0, inp.my || 0) > 0.15 || inp.charging) S.started = true; else return; }
      const has = b.owner === 0;
      run(a, inp.mx || 0, inp.my || 0, (has ? C.ballSpd : C.runSpd) * (inp.charging ? C.chargeSlow : 1));
      if (has) {
        aimInput(a, inp);
        const py = b.y;
        b.x = a.x + a.fx * C.ballOff; b.y = a.y + a.fy * C.ballOff; b.vx = a.vx; b.vy = a.vy;
        if (S.next < S.gates.length) {
          const gt = S.gates[S.next];
          if (py > gt[1] && b.y <= gt[1] && Math.abs(b.x - gt[0]) < GW) { S.next++; note(S, S.next === S.gates.length ? 'NOW FINISH' : 'GATE ' + S.next); }
        }
        if (inp.release) {
          if (S.next < S.gates.length) { a.charge = 0; a.hasAim = false; note(S, 'GATES FIRST'); }
          else { kick(S, a, 0); S.shot = true; S.liveKickTick = S.tick; }
        }
      } else {
        rollBall(b);
        if (b.y <= 0) {
          if (Math.abs(b.x - P.cx) < P.goalHalf) { S.status = 'goal'; S.over = true; S.time = S.tick / 60 + S.pen; return; }
          return lose(S, 'wide');
        }
        if (dist(g.x, g.y, b.x, b.y) < 1.15) return lose(S, 'saved', 'gk');
        if (b.x < 0 || b.x > P.w || (b.vx === 0 && b.vy === 0)) return lose(S, 'wide');
      }
      for (const c of S.cones) {
        if (!c.hit && (dist(c.x, c.y, b.x, b.y) < 0.75 || dist(c.x, c.y, a.x, a.y) < 0.8)) { c.hit = true; S.pen += 1; note(S, 'CONE +1s'); }
      }
      // a training keeper: shuffles across with the ball, sets himself when the shot comes
      const tx = P.cx + clamp((b.x - P.cx) * 0.45, -2.8, 2.8), sp = S.shot ? 4.6 : 3.2;
      g.vx = clamp(tx - g.x, -sp * TICK, sp * TICK) / TICK; g.x += g.vx * TICK;
      S.tick++;
    },
    hud: S => ({ big: (S.tick / 60 + S.pen).toFixed(1), label: 'seconds', sub: 'gate ' + Math.min(S.next + 1, S.gates.length) + ' of ' + S.gates.length + (S.pen ? ' · +' + S.pen + 's cones' : '') }),
    result: S => S.status === 'goal'
      ? { value: +S.time.toFixed(2), text: S.time.toFixed(2) + ' seconds' + (S.pen ? ' including ' + S.pen + 's for cones' : ''), why: '', stars: S.time <= 10 ? 3 : S.time <= 12 ? 2 : 1 }
      : { value: null, text: 'No time set', why: { saved: 'The keeper saved it.', wide: 'The shot missed.' }[S.reason] || '' },
    better: (a, b) => a < b
  };

  /* ---------------- 4. Finishing: ten balls served into the box (uses the real match engine and keeper) ---------------- */
  const SERVES = [
    { name: 'Cut-back from the right', f: [42, 12, 40, 6.5], at: [28, 10.5], sp: 15, k: 55, s: [27, 25] },
    { name: 'Cut-back from the left', f: [8, 12, 10, 6.5], at: [22, 10.5], sp: 15, k: 55, s: [23, 25] },
    { name: 'Through ball', f: [25, 40, 25, 37], at: [21.5, 12], sp: 21, k: 40, s: [30, 27] },
    { name: 'Low cross from the right', f: [43, 24, 42, 19], at: [24, 8.5], sp: 20, k: 50, s: [22, 25] },
    { name: 'Low cross from the left', f: [7, 24, 8, 19], at: [26, 8.5], sp: 20, k: 50, s: [28, 25] },
    { name: 'Through ball', f: [25, 40, 25, 37], at: [28.5, 12], sp: 21, k: 40, s: [20, 27] },
    { name: 'Pull-back to the spot', f: [41, 8, 38, 4.5], at: [26, 12.5], sp: 14, k: 50, s: [24, 27] },
    { name: 'Pull-back to the spot', f: [9, 8, 12, 4.5], at: [24, 12.5], sp: 14, k: 50, s: [26, 27] },
    { name: 'Ball over the top', f: [18, 41, 19, 38], at: [27, 11], sp: 23, k: 40, s: [31, 26] },
    { name: 'Last one: far-post cross', f: [43, 22, 42, 17], at: [21, 7], sp: 21, k: 50, s: [18, 23] }
  ];
  function feederRec(sv) {
    const r = { x: [], y: [], fx: [], fy: [], kick: null, len: 0 }, [x0, y0, x1, y1] = sv.f;
    const dx = sv.at[0] - x1, dy = sv.at[1] - y1, d = Math.hypot(dx, dy), ux = dx / d, uy = dy / d;
    const md = Math.hypot(x1 - x0, y1 - y0) || 1;
    for (let t = 0; t <= sv.k + 70; t++) {
      const u = Math.min(1, t / sv.k);
      r.x.push(x0 + (x1 - x0) * u); r.y.push(y0 + (y1 - y0) * u);
      const aimNow = t > sv.k - 10; r.fx.push(aimNow ? ux : (x1 - x0) / md); r.fy.push(aimNow ? uy : (y1 - y0) / md);
    }
    r.kick = { tick: sv.k, bx: x1 + ux * C.ballOff, by: y1 + uy * C.ballOff, vx: ux * sv.sp, vy: uy * sv.sp }; r.len = r.x.length;
    return r;
  }
  function serve(T) {
    const sv = SERVES[T.n];
    const level = { name: 'Finishing', time: 8, kit: KIT, frame: { y1: 43, x0: 6, x1: 44 }, order: [0, 1], def: [],
      att: [{ num: 7, name: 'Feeder', x: sv.f[0], y: sv.f[1], role: 'ball', tip: '' }, { num: 9, name: 'Striker', x: sv.s[0], y: sv.s[1], role: 'ball', tip: '' }] };
    level.frameKey = T.frameLevel; // keep one camera for all ten serves
    const S = FBx.makeSim(level, [feederRec(sv), null], 1);
    S.level = Object.assign(T.frameLevel, { att: level.att, def: [] }); S.level.time = 8; S.level.order = [0, 1];
    return S;
  }
  const finishing = {
    id: 'finishing', name: 'Finishing', kind: 'Shooting · ten serves',
    blurb: 'Ten balls into the box from every angle, against the match keeper. Run on, pick your corner, score.',
    how: ['Drag to run onto the serve. Press, drag and release to shoot.', 'Aim before it arrives and release as it reaches you for a first-time finish: worth double.', 'Ten serves. Twenty points is a perfect round.'],
    unit: 'points', wrap: true,
    init() {
      const T = { wrap: true, n: 0, score: 0, goals: 0, hold: 0, over: false, note: '', noteTick: -999, tick: 0, results: [] };
      T.frameLevel = { name: 'Finishing', kit: KIT, frame: { y1: 43, x0: 6, x1: 44 }, att: [], def: [], time: 8, order: [0, 1] };
      T.S = serve(T); T.started = false; T.label = SERVES[0].name; return T;
    },
    step(T, inp) {
      if (T.over) return;
      T.tick++;
      if (!T.started) { if (Math.hypot(inp.mx || 0, inp.my || 0) > 0.15 || inp.charging) T.started = true; else return; }
      const S = T.S;
      if (S.status === 'play') {
        FBx.step(S, inp);
        if (S.status === 'goal') {
          const first = S.liveKickTick - S.ball.recvTick <= 14; T.goals++; T.score += first ? 2 : 1; T.results.push(first ? 2 : 1);
          T.note = first ? 'FIRST TIME +2' : 'GOAL +1'; T.noteTick = T.tick; T.hold = 80;
        } else if (S.status === 'fail') {
          T.results.push(0); T.hold = 70; T.noteTick = T.tick;
          T.note = { saved: 'SAVED', smothered: 'KEEPER', wide: 'WIDE', out: 'MISSED IT', time: 'TOO SLOW', keeper: 'KEEPER GOT THERE', tackled: 'LOST IT', intercepted: 'LOST IT', offside: 'OFFSIDE', bump: 'COLLISION' }[S.reason] || 'NO GOAL';
        }
      } else if (--T.hold <= 0) {
        T.n++;
        if (T.n >= SERVES.length) { T.over = true; return; }
        T.S = serve(T); T.label = SERVES[T.n].name;
      }
    },
    hud: T => ({ big: T.score, label: 'points', sub: 'Serve ' + Math.min(T.n + 1, SERVES.length) + ' of ' + SERVES.length + ' · ' + T.label, dots: T.results }),
    result: T => ({ value: T.score, text: T.goals + ' of ' + SERVES.length + ' scored, ' + T.score + ' points', why: '', stars: T.score >= 16 ? 3 : T.score >= 10 ? 2 : T.score >= 5 ? 1 : 0 }),
    better: (a, b) => a > b
  };

  root.DRILLS = [rondo, piggy, slalom, finishing];
  root.DRILL_SERVES = SERVES;
})(typeof module !== 'undefined' ? module.exports : window);
