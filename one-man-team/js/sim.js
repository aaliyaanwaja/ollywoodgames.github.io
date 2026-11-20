/* Deterministic simulation core. No DOM. 60 ticks per second, units in metres. */
(function (root) {
  const TICK = 1 / 60;
  const P = { w: 50, h: 60, cx: 25, goalHalf: 4 };
  const C = {
    runSpd: 7.6, ballSpd: 6.5, chargeSlow: 0.6, accel: 0.22,
    ctrlR: 1.35, ballOff: 0.75,
    kickMin: 9, kickMax: 28, chargeTime: 0.7, fric: 0.8, stopV: 1.2,
    tackleR: 0.95, interceptR: 0.85, markInterceptR: 0.7, bumpR: 0.85,
    passSettle: 54, touchShield: 20,
    gkReact: 11, gkSpd: 3.6, gkDive: 5.6, gkReach: 1.05
  };

  const G = typeof window !== 'undefined' ? window : global;
  const LEVELS = (G.OMT_LEVELS = G.OMT_LEVELS || []);

  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;

  function makeSim(level, recs, live) {
    const chain = level.order.filter(i => level.att[i].role === 'ball');
    const S = {
      tick: 0, level, live, chain, chainPos: 0,
      limit: Math.round(level.time * 60),
      role: live >= 0 ? level.att[live].role : 'replay',
      isLast: live === chain[chain.length - 1],
      att: level.att.map((a, i) => ({
        x: a.x, y: a.y, vx: 0, vy: 0, fx: 0, fy: -1, num: a.num,
        active: i === live || !!recs[i], rec: recs[i] || null, isLive: i === live,
        charge: 0, hasAim: false, ax: 0, ay: -1, kickBuf: 0, bufCharge: 0, pendingKick: false
      })),
      def: level.def.map(d => Object.assign({}, d, { hx: d.x, hy: d.y, vx: 0, vy: 0 })),
      gk: { x: P.cx, y: 1.2, react: 0 },
      ball: { x: 0, y: 0, vx: 0, vy: 0, owner: chain[0], kickTick: -999, lastKicker: -1, recvTick: -999 },
      status: 'play', reason: '', failWho: -1, failLive: false,
      liveKickTick: -1,
      liveRec: { x: [], y: [], fx: [], fy: [], kick: null }
    };
    const o = S.att[S.ball.owner];
    S.ball.x = o.x + o.fx * C.ballOff; S.ball.y = o.y + o.fy * C.ballOff;
    return S;
  }

  function offsideLine(S) {
    const ys = S.def.map(d => d.y); ys.push(S.gk.y); ys.sort((a, b) => a - b);
    return Math.min(ys[1], S.ball.y);
  }

  function fail(S, code, who) {
    if (S.status !== 'play') return;
    S.status = 'fail'; S.reason = code;
    S.failWho = who === undefined ? -1 : who;
    S.failLive = S.failWho === S.live;
  }

  function doKick(S, i, kk, charge) {
    const a = S.att[i], b = S.ball;
    const dx = a.hasAim ? a.ax : a.fx, dy = a.hasAim ? a.ay : a.fy;
    if (kk) { b.x = kk.bx; b.y = kk.by; b.vx = kk.vx; b.vy = kk.vy; }
    else {
      const sp = C.kickMin + (C.kickMax - C.kickMin) * charge;
      b.x = a.x + dx * C.ballOff; b.y = a.y + dy * C.ballOff;
      b.vx = dx * sp; b.vy = dy * sp; a.hasAim = false;
      S.liveRec.kick = { tick: S.tick, bx: b.x, by: b.y, vx: b.vx, vy: b.vy };
      S.liveKickTick = S.tick;
    }
    b.owner = -1; b.kickTick = S.tick; b.lastKicker = i;
    if (S.chainPos + 1 < S.chain.length) {
      const ri = S.chain[S.chainPos + 1], r = S.att[ri];
      if (r.active) {
        const ys = S.def.map(d => d.y); ys.push(S.gk.y); ys.sort((p, q) => p - q);
        if (r.y < ys[1] - 0.6 && r.y < b.y - 0.6) fail(S, 'offside', ri);
      }
    }
  }

  function step(S, inp) {
    if (S.status !== 'play') return;
    inp = inp || {};
    const t = S.tick, b = S.ball;

    // attackers
    for (let i = 0; i < S.att.length; i++) {
      const a = S.att[i];
      if (a.isLive) {
        let mx = inp.mx || 0, my = inp.my || 0;
        const m = Math.hypot(mx, my);
        if (m > 1) { mx /= m; my /= m; }
        const has = b.owner === i;
        let top = has ? C.ballSpd : C.runSpd;
        if (inp.charging) top *= C.chargeSlow;
        a.vx += (mx * top - a.vx) * C.accel; a.vy += (my * top - a.vy) * C.accel;
        a.x = clamp(a.x + a.vx * TICK, 0.6, P.w - 0.6);
        a.y = clamp(a.y + a.vy * TICK, 0.9, P.h - 0.6);
        if (m > 0.15) { a.fx = (inp.mx || 0) / m; a.fy = (inp.my || 0) / m; }
        if (inp.charging) {
          if (inp.aim) { a.hasAim = true; a.ax = inp.ax; a.ay = inp.ay; a.charge = inp.power; }
          else { a.hasAim = false; a.charge = Math.min(1, a.charge + TICK / C.chargeTime); }
        }
        if (a.kickBuf > 0) a.kickBuf--;
        const rel = inp.release || a.pendingKick;
        if (rel) {
          if (has && S.role === 'ball') doKick(S, i, null, a.pendingKick ? a.bufCharge : a.charge);
          else if (!a.pendingKick) { a.kickBuf = 14; a.bufCharge = a.charge; }
          a.pendingKick = false; a.charge = 0;
        }
        const r = S.liveRec; r.x.push(a.x); r.y.push(a.y); r.fx.push(a.fx); r.fy.push(a.fy);
      } else if (a.rec) {
        const k = Math.min(t, a.rec.len - 1);
        const nx = a.rec.x[k], ny = a.rec.y[k];
        a.vx = (nx - a.x) / TICK; a.vy = (ny - a.y) / TICK;
        a.x = nx; a.y = ny; a.fx = a.rec.fx[k]; a.fy = a.rec.fy[k];
        const kk = a.rec.kick;
        if (kk && kk.tick === t && b.owner === i) doKick(S, i, kk);
      }
    }
    if (S.status !== 'play') return;

    // ball
    if (b.owner >= 0) {
      const o = S.att[b.owner];
      b.x = o.x + o.fx * C.ballOff; b.y = o.y + o.fy * C.ballOff; b.vx = o.vx; b.vy = o.vy;
    } else {
      b.x += b.vx * TICK; b.y += b.vy * TICK;
      const f = Math.exp(-C.fric * TICK); b.vx *= f; b.vy *= f;
      if (Math.hypot(b.vx, b.vy) < C.stopV) { b.vx = 0; b.vy = 0; }
      // pickup by the next player in the chain
      if (S.chainPos + 1 < S.chain.length && t - b.kickTick > 6) {
        const ri = S.chain[S.chainPos + 1], r = S.att[ri];
        if (r.active && Math.hypot(r.x - b.x, r.y - b.y) < C.ctrlR) {
          b.owner = ri; S.chainPos++; b.recvTick = t;
          if (r.isLive && r.kickBuf > 0) { r.pendingKick = true; r.kickBuf = 0; }
        }
      }
    }

    const ownerFuture = b.owner >= 0 && !S.att[b.owner].active;

    // defenders
    for (const d of S.def) {
      let tx, ty;
      const db = Math.hypot(d.x - b.x, d.y - b.y);
      if (!ownerFuture && db < d.eng && (d.t !== 'mark' || b.owner >= 0)) {
        const lead = b.owner < 0 ? 0.2 : 0.1;
        tx = b.x + b.vx * lead; ty = b.y + b.vy * lead;
      } else if (d.t === 'mark') {
        const a = S.att[d.a];
        tx = a.x + (P.cx - a.x) * 0.06; ty = Math.max(3, a.y - 2.2);
      } else {
        tx = d.hx + (b.x - d.hx) * 0.08; ty = d.hy + (b.y - d.hy) * 0.05;
      }
      const dx = tx - d.x, dy = ty - d.y, dd = Math.hypot(dx, dy) || 1e-6;
      const sp = Math.min(d.spd, dd * 6);
      d.vx += (dx / dd * sp - d.vx) * 0.12; d.vy += (dy / dd * sp - d.vy) * 0.12;
      d.x += d.vx * TICK; d.y += d.vy * TICK;
    }

    // goalkeeper
    const g = S.gk;
    let shot = false, xc = P.cx;
    if (b.owner < 0 && b.vy < -5 && b.y > g.y) {
      xc = b.x + b.vx * ((b.y - g.y) / -b.vy);
      shot = Math.abs(xc - P.cx) < 6;
    }
    let gtx, gsp;
    if (shot) { g.react++; }
    else g.react = 0;
    if (shot && g.react > C.gkReact) { gtx = clamp(xc, P.cx - 4.3, P.cx + 4.3); gsp = C.gkDive; }
    else { gtx = P.cx + clamp((b.x - P.cx) * 0.3, -2.6, 2.6); gsp = C.gkSpd; }
    const gd = gtx - g.x; g.x += clamp(gd, -gsp * TICK, gsp * TICK);

    // failures
    if (!ownerFuture) {
      
      const who = b.owner >= 0 ? b.owner : b.lastKicker;
      for (const d of S.def) {
        if (b.owner >= 0 && t - b.recvTick < C.touchShield) break;
        const rr = b.owner >= 0 ? C.tackleR : (d.t === 'mark' ? C.markInterceptR : C.interceptR);
        if (Math.hypot(d.x - b.x, d.y - b.y) < rr) { fail(S, b.owner >= 0 ? 'tackled' : 'intercepted', who); break; }
      }
      if (Math.hypot(g.x - b.x, g.y - b.y) < C.gkReach) fail(S, b.owner >= 0 ? 'smothered' : (S.chainPos === S.chain.length - 1 ? 'saved' : 'keeper'), who);
    }
    if (S.status === 'play' && b.owner < 0) {
      if (b.y <= 0) {
        if (Math.abs(b.x - P.cx) < P.goalHalf) {
          if (S.chainPos === S.chain.length - 1) { S.status = 'goal'; }
          else fail(S, 'early', b.lastKicker);
        } else fail(S, 'wide', b.lastKicker);
      } else if (b.x < 0 || b.x > P.w || b.y > P.h) fail(S, 'out', b.lastKicker);
    }
    if (S.status === 'play' && S.live >= 0) {
      const me = S.att[S.live];
      for (let i = 0; i < S.att.length; i++) {
        const a = S.att[i];
        if (i !== S.live && a.rec && Math.hypot(a.x - me.x, a.y - me.y) < C.bumpR) { fail(S, 'bump', i); break; }
      }
    }

    // round success
    if (S.status === 'play' && S.live >= 0) {
      if (S.role === 'decoy') {
        if ((inp.done && t >= 40) || t >= S.limit - 1) S.status = 'won';
      } else if (!S.isLast && S.liveKickTick >= 0 && t - S.liveKickTick >= C.passSettle) S.status = 'won';
    }
    S.tick++;
    if (S.status === 'play' && S.tick >= S.limit) fail(S, 'time', -1);
  }

  function finalRec(S) {
    const r = S.liveRec;
    return { x: r.x, y: r.y, fx: r.fx, fy: r.fy, kick: r.kick, len: r.x.length };
  }

  root.FB = { TICK, P, C, LEVELS, makeSim, step, finalRec, offsideLine };
})(typeof module !== 'undefined' ? module.exports : window);
