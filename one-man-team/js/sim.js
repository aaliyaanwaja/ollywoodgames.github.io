/* Deterministic simulation core. No DOM. 60 ticks per second, units in metres.
   Attackers are recorded and replayed; defenders and the goalkeeper are NOT recorded: every tick they are a
   pure function of the simulation state (positions, the ball, and their own small state machines below).
   Nothing here may depend on live input, Math.random, the clock or the frame rate.

   Defence in one paragraph (details next to the code):
   - one FIRST DEFENDER presses the carrier and jockeys; one covers; everybody else keeps shape
   - `mark`  man-marker: goal-side and ball-side of his man, tighter as the ball gets near, sees him `react` ticks late
   - `zone`  screening midfielder: shifts with the ball and stands on the lane to the most dangerous receiver
   - `press` a zone player with a long engage range who hunts the ball
   - `line`  member of a back-line unit: one height, fixed spacing, shifts to the ball side, drops and steps up together
   - tackles are a lunge: plant (tell), commit to a spot, strike, then off balance if it missed
   - players who have not been played yet ("future", active === false) stand still. Defenders treat them as real
     opponents (markers stand with them, screens block the lanes to them, the keeper assumes they will run for a
     through ball) but nobody presses or tackles a ball that a future player is holding. */
(function (root) {
  const TICK = 1 / 60;
  const P = { w: 50, h: 60, cx: 25, goalHalf: 4 };
  const C = {
    // attackers and ball (unchanged)
    runSpd: 7.6, ballSpd: 6.5, chargeSlow: 0.6, accel: 0.22,
    ctrlR: 1.35, ballOff: 0.75,
    kickMin: 9, kickMax: 28, chargeTime: 0.7, fric: 0.8, stopV: 1.2,
    // a shot (any kick by the last player in the move) is struck, not rolled: faster off the boot and it holds its pace
    shotMin: 17, shotMax: 34, shotFric: 0.28,
    // shot pace (docs/foundation/16-shot-pace.md): the shot and the keeper's answer to it run on a clock shotPace times
    // faster. Speed and friction are multiplied by it (20.4-40.8 m/s, 0.336/s: the same path, covered in 1/shotPace of
    // the time), and so are the keeper's reaction clock, dive speed and stretch, so he gets to the same places on the
    // same shots. 1 is the engine before 16.
    shotPace: 1.2,
    bumpR: 0.85, passSettle: 54, touchShield: 20,
    // defenders: movement
    defMax: 5.8,          // hard cap on any defender's speed, whatever the level says
    defAccel: 0.14,       // velocity smoothing per tick (attackers use 0.22: they are sharper off the mark)
    passReact: 12,        // ticks before a zone/line defender reacts to a pass being hit
    interceptR: 0.85, markInterceptR: 0.7,
    // first defender
    pressR: 3.0,          // a carrier with a defender this close is "under pressure" (the back line holds or squeezes)
    jockeyD: 1.4,         // where the presser sets himself, goal-side of the ball (inside every lunge range)
    jockeySlowR: 3.0,     // inside this distance of his spot he slows down instead of sprinting through
    jockeyMin: 0.35,      // ... down to this share of his top speed
    coverD: 5.0,          // the covering defender stands this far goal-side of the ball
    // the tackle
    lungeR: 1.5, lungeAgg: 0.6,   // lunge range = lungeR + lungeAgg * agg
    patience: 24,         // ticks he waits in range before going, times (1 - agg)
    lungeWind: 12,        // plant: the tell (ticks)
    lungeCommit: 4,       // at this tick of the plant he picks the spot; a cut after it beats him
    lungeStrike: 7,       // ticks the leg is out
    lungeExt: 1.3,        // how far the foot goes beyond the body
    footR: 0.55,          // ball within this of the leg is won
    bodyR: 0.5, bodySpd: 3, // ball run straight into a defender who is set (slower than bodySpd) is lost
    offBal: 34,           // ticks on the floor after the lunge
    // marking
    markReact: 18,        // default perception delay of a marker (ticks)
    markTight: 1.3, markLoose: 3.0, markNear: 6, markFar: 24,   // gap to his man by ball distance
    markShade: 0.45,      // how far he cheats towards the ball side
    markLeash: 10,        // hand-over: a marker dragged this far from his set position, by a man who is running AWAY from
                          // goal (no nearer it than that position), passes him on and returns to shape (zone duties).
                          // A defender's own `leash` overrides it; 0 switches it off. See handOver().
    // screening
    zoneShiftX: 0.25, zoneShiftY: 0.12,
    zoneLeash: 5,         // how far from his shape position a screen will go to stand on a passing lane
    setSpd: 0.7,          // carrier slower than this share of ballSpd is "shaping to pass" (the only tell a recording keeps)
    // back line
    lineGap: 13,          // metres the line keeps between itself and an unpressured ball
    lineFloor: 15,        // it will not drop deeper than this (about the edge of the box) unless the ball is in behind
    lineStep: 3,          // how far above its home height it squeezes when the ball goes backwards
    lineDropK: 0.85,      // backpedal speed as a share of the slowest member
    lineUpSpd: 3.2,
    lineShift: 0.4, lineShiftMax: 8, lineCompact: 0.92, lineFunnel: 0.72, lineShiftBehind: 0.55,
    lineEng: 8, lineCoverTuck: 0.4, lineCoverDrop: 1.5,
    // goalkeeper
    gkReact: 13,          // ticks before he moves for a shot (was 11)
    gkLate: 5,            // extra if he was still moving when it was hit: shoot before he sets
    gkSpd: 3.6, gkClose: 4.4, gkRush: 5.4, gkDive: 4.7,
    gkReach: 0.8, gkDiveExt: 0.4,
    gkOutMin: 1.2, gkOutMax: 3.0, gkOneK: 0.45, gkOneR: 18, gkOneMax: 5, gkSweepOneMax: 7, gkStandOff: 3.2,
    gkSmotherR: 2.6, gkPassReact: 10, gkMargin: 0.15,
    // collecting a loose ball (docs/foundation/20-keeper-and-generator-v2.md). A loose ball (nobody on it) moving slower
    // than gkCollectV, that will be in his area (the penalty area) at a point he can be standing on when it gets there,
    // at least gkCollectMargin sooner than any attacker: he comes off his line at gkRush and gathers it. Never out of
    // the area, never for a struck shot (a shot leaves the boot at 20.4 m/s or more and is still above 13 m/s 30 m out).
    // An attacker who will clearly get there first: he holds, as before. 0 switches it off (the engine before 20).
    gkCollect: 1, gkCollectV: 10, gkCollectMargin: 0.25,
    // finish pressure (docs/foundation/10-finish-pressure.md, 13-a-b-in-the-game.md). Each option is off at 0.
    // A ("through on goal": recSpd, dangerR) and B (the keeper covers his near post: gkBisect, gkNear) are on by default;
    // a level can switch them off with its `engine` field (the first eight fixtures do, to keep them easy).
    // "Through on goal": a carrier with no outfield defender on his feet goal-side of him within throughW of his
    // line to goal. Options 1 and 2 act only then.
    throughW: 5,
    recSpd: 7.0,          // 1. recovery sprint: cap on the speed of a defender running back towards his own goal while a
                          //    carrier is through on goal inside recZone (the normal cap is 5.8; dribbling is 6.5)
    recBoost: 1.3,        //    ... his sprint is his own speed plus this, never above recSpd
    recZone: 32,          //    ... metres from goal centre
    dangerR: 24,          // 2. through on goal inside this of goal: the nearest back-line man goes to the ball ...
    dangerEng: 12,        //    ... if he is within this of it, even when his place in the line is further away
    coverDeep: 0,         // 3. one goes, one covers: the inside partner of a back-line man who steps out drops to cover
    coverDepth: 4.5,      //    ... this far goal-side of him, and coverInside of the way across to the ball-goal line
    coverInside: 0.6,
    gkBisect: 1,          // 4. keeper stands on the bisector of the angle the posts make at the ball ...
    gkNear: 0.2           //    ... shaded this share of the way on towards the near post (ball 6 m+ off centre)
  };
  /* Per-level engine settings. C0 holds the defaults (tools that try a variant on every level change FB.C0, not FB.C).
     A level may carry `engine: { key: value }`, overrides of C0 for that level only. makeSim resolves C0 plus the
     level's overrides into S.cfg; step() loads a sim's own S.cfg into C whenever the last sim stepped was a different
     one, so two sims of different levels never see each other's settings. */
  const C0 = Object.assign({}, C);
  let cfgLive = null;
  function useCfg(S) { if (cfgLive !== S.cfg) { Object.assign(C, S.cfg); cfgLive = S.cfg; } }
  function resolveCfg(level) {
    const e = level.engine || {};
    for (const k in e) if (!(k in C0) || typeof e[k] !== typeof C0[k]) throw new Error('level "' + level.name + '": unknown engine setting ' + k);
    return Object.freeze(Object.assign({}, C0, e));
  }
  const HN = 64;           // ticks of attacker history kept for delayed perception
  const PN = 60, PDT = 0.06; // loose-ball path samples (3.6 s ahead)

  const G = typeof window !== 'undefined' ? window : global;
  const LEVELS = (G.OMT_LEVELS = G.OMT_LEVELS || []);

  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const hyp = Math.hypot;

  function makeSim(level, recs, live) {
    const cfg = resolveCfg(level);
    cfgLive = null; Object.assign(C, cfg); cfgLive = cfg;   // the defaults first, then this level's settings
    const chain = level.order.filter(i => level.att[i].role === 'ball');
    const gkc = level.gk || {};
    const S = {
      tick: 0, level, cfg, live, chain, chainPos: 0,
      limit: Math.round(level.time * 60),
      role: live >= 0 ? level.att[live].role : 'replay',
      isLast: live === chain[chain.length - 1],
      att: level.att.map((a, i) => ({
        x: a.x, y: a.y, vx: 0, vy: 0, fx: 0, fy: -1, num: a.num,
        active: i === live || !!recs[i], rec: recs[i] || null, isLive: i === live,
        charge: 0, hasAim: false, ax: 0, ay: -1, kickBuf: 0, bufCharge: 0, pendingKick: false,
        lx: a.x, ly: a.y, mvx: 0, mvy: 0      // last position and measured velocity (what defenders see)
      })),
      def: level.def.map(d => Object.assign({}, d, {
        t: d.t === 'press' ? 'zone' : d.t, kind: d.t,
        hx: d.x, hy: d.y, vx: 0, vy: 0,
        spd: Math.min(d.spd === undefined ? 5.2 : d.spd, C.defMax),
        eng: d.eng !== undefined ? d.eng : d.t === 'mark' ? 3.5 : d.t === 'line' ? C.lineEng : d.t === 'press' ? 16 : 7,
        leash: d.leash !== undefined ? d.leash : d.t === 'press' ? 99 : d.t === 'mark' ? (C.markLeash > 0 ? C.markLeash : 1e9) : 14,
        screen: d.screen !== undefined ? d.screen : C.zoneLeash,
        react: clamp(Math.round(d.react !== undefined ? d.react : d.t === 'mark' ? C.markReact : C.passReact), 0, HN - 4),
        agg: d.agg === undefined ? 0.5 : clamp(d.agg, 0, 1),
        tight: d.tight === undefined ? 1 : d.tight,
        unit: d.unit || 0,
        // readable state for the renderer
        fx: 0, fy: 1, lunge: 0, offBalance: 0, intent: 'shape', footX: d.x, footY: d.y, sprint: false,
        // private
        handed: false,       // a marker who has passed his man on (see handOver)
        lt: 0, ldx: 0, ldy: 1, striking: false, close: 0, sx: d.x, sy: d.y, tx: d.x, ty: d.y, tvx: 0, tvy: 0, cap: 0,
        cs: -1, csc: 0, ui: -1, uk: -1
      })),
      gk: {
        x: gkc.x === undefined ? P.cx : gkc.x, y: gkc.y === undefined ? 1.2 : gkc.y, vx: 0, vy: 0,
        react: 0, late: 0, sweeping: false, collecting: false, dive: 0, set: true,
        sweeper: !!gkc.sweeper, reactT: gkc.react === undefined ? C.gkReact : gkc.react,
        fx: 0, fy: 1, lunge: 0, offBalance: 0, intent: 'angle'
      },
      ball: { x: 0, y: 0, vx: 0, vy: 0, owner: chain[0], kickTick: -999, lastKicker: -1, recvTick: -999, shot: false },
      status: 'play', reason: '', failWho: -1, failLive: false,
      liveKickTick: -1,
      liveRec: { x: [], y: [], fx: [], fy: [], kick: null },
      // defence bookkeeping
      presser: -1, cover: -1, pressured: false, through: false, setTicks: 0, chase0: -1, chase1: -1, chaseS0: 0, chaseS1: 0,
      units: [],
      hx: level.att.map(a => new Float64Array(HN).fill(a.x)), hy: level.att.map(a => new Float64Array(HN).fill(a.y)),
      hvx: level.att.map(() => new Float64Array(HN)), hvy: level.att.map(() => new Float64Array(HN)),
      px: new Float64Array(PN + 1), py: new Float64Array(PN + 1), pn: 0
    };
    // back-line units: members sorted across the pitch
    const ids = [];
    S.def.forEach(d => { if (d.t === 'line' && ids.indexOf(d.unit) < 0) ids.push(d.unit); });
    ids.forEach(id => {
      const m = []; S.def.forEach((d, i) => { if (d.t === 'line' && d.unit === id) m.push(i); });
      m.sort((p, q) => S.def[p].hx - S.def[q].hx || p - q);
      const cfg = (level.lines && level.lines[id]) || {};
      let h0 = 0, cx = 0, spd = 99;
      m.forEach(i => { h0 += S.def[i].hy; cx += S.def[i].hx; spd = Math.min(spd, S.def[i].spd); });
      h0 /= m.length; cx /= m.length;
      m.forEach((i, k) => { S.def[i].ui = S.units.length; S.def[i].uk = k; });
      S.units.push({
        id, m, h0, cx, spd, y: h0, vy: 0, shift: 0, k: C.lineCompact, ch: -1, intent: 'hold',
        gap: cfg.gap === undefined ? C.lineGap : cfg.gap,
        floor: cfg.floor === undefined ? Math.min(C.lineFloor, h0) : cfg.floor,
        step: cfg.step === undefined ? C.lineStep : cfg.step
      });
    });
    const o = S.att[S.ball.owner];
    S.ball.x = o.x + o.fx * C.ballOff; S.ball.y = o.y + o.fy * C.ballOff;
    return S;
  }

  function offsideLine(S) {
    const ys = S.def.map(d => d.y); ys.push(S.gk.y); ys.sort((a, b) => a - b);
    return Math.min(ys[1], S.ball.y);
  }

  function fail(S, code, who, by) {
    if (S.status !== 'play') return;
    S.status = 'fail'; S.reason = code;
    S.failBy = by === undefined ? -1 : by;   // index into S.def of the defender who won it, 'gk' for the keeper, -1 otherwise
    S.failWho = who === undefined ? -1 : who;
    S.failLive = S.failWho === S.live;
  }

  function doKick(S, i, kk, charge) {
    const a = S.att[i], b = S.ball;
    const dx = a.hasAim ? a.ax : a.fx, dy = a.hasAim ? a.ay : a.fy;
    const isShot = S.chain[S.chain.length - 1] === i;
    b.fric = isShot ? C.shotFric * C.shotPace : C.fric; b.shot = isShot;
    if (kk) { b.x = kk.bx; b.y = kk.by; b.vx = kk.vx; b.vy = kk.vy; }
    else {
      const sp = isShot ? (C.shotMin + (C.shotMax - C.shotMin) * charge) * C.shotPace : C.kickMin + (C.kickMax - C.kickMin) * charge;
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

  /* ---------- defence helpers ---------- */

  // Where the loose ball will be: PN samples, PDT apart (closed form of the friction model).
  function samplePath(S) {
    const b = S.ball, sp = hyp(b.vx, b.vy);
    const fr = b.fric || C.fric, tStop = sp > C.stopV ? Math.log(sp / C.stopV) / fr : 0;
    for (let s = 0; s <= PN; s++) {
      const tt = Math.min(s * PDT, tStop), k = (1 - Math.exp(-fr * tt)) / fr;
      S.px[s] = b.x + b.vx * k; S.py[s] = b.y + b.vy * k;
    }
  }
  // Earliest path sample a runner at (x,y) can be standing on when the ball gets there; -1 if the ball beats him everywhere.
  function meet(S, x, y, spd, delay, reach) {
    for (let s = 1; s <= PN; s++) {
      if (hyp(S.px[s] - x, S.py[s] - y) - reach <= spd * Math.max(0, s * PDT - delay)) return s;
    }
    return -1;
  }
  function distSeg(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
    const u = l2 > 1e-9 ? clamp(((px - ax) * dx + (py - ay) * dy) / l2, 0, 1) : 0;
    return hyp(px - ax - dx * u, py - ay - dy * u);
  }

  /* Back line. The unit owns ONE number, its height `u.y`; members stand on it at their home spacing.
     - unpressured ball: the line keeps `gap` metres off it, so it drops as a free carrier runs at it
     - pressured ball: the passer cannot pick a pass, so the line holds (and squeezes back up to its home height).
       This is the offside trap the player can read: run early against a holding line and you are off.
     - a runner arriving on the line while the ball is free: the line goes with him (slower than he is)
     - ball going backwards: step up, as far as `step` above home
     - ball in behind: everyone turns and recovers goal-side of it at full speed */
  function thinkUnit(S, u, carried, bvy) {
    const b = S.ball, t = S.tick;
    let rx = b.x, ry = b.y;
    if (!carried && t - b.kickTick >= C.passReact) { rx = S.px[10]; ry = S.py[10]; }  // read the pass 0.6 s ahead
    const behind = ry < u.y + 1.5;
    const stepping = bvy > 2;
    const pressed = S.pressured;
    // ground won by stepping up is kept until the ball comes forward again
    let T = clamp(ry - (pressed || stepping ? u.gap - 4 : u.gap), u.floor, stepping ? u.h0 + u.step : Math.max(u.h0, u.y));
    if (pressed && T < u.y) T = u.y;
    if (carried && !pressed) {
      for (let i = 0; i < S.att.length; i++) {
        const a = S.att[i];
        if (i === b.owner || a.mvy > -3 || a.y < u.y - 1 || a.y > u.y + 5) continue;
        T = Math.min(T, a.y + a.mvy * 0.3);
      }
      T = Math.max(T, u.floor);
    }
    if (behind) T = Math.max(4, Math.min(T, ry - 3));
    // played through near goal: the unit's height comes back at a recovery sprint (each member still runs his own race)
    const sprint = behind && S.through && C.recSpd > 0 && hyp(b.x - P.cx, b.y) < C.recZone ? Math.min(C.recSpd, u.spd + C.recBoost) : u.spd;
    const down = (behind ? 1 : C.lineDropK) * sprint * TICK, up = C.lineUpSpd * TICK;
    const dy = clamp(T - u.y, -down, up);
    u.intent = behind ? 'recover' : dy < -1e-4 ? 'drop' : dy > 1e-4 ? 'step' : 'hold';
    u.y += dy; u.vy = dy / TICK;
    // shape across the pitch: normally the home spacing, shifted to the ball side. Once the ball is in behind, the
    // recovering defenders funnel in towards the ball-goal channel instead of running back in their lanes.
    u.k += clamp((behind ? C.lineFunnel : C.lineCompact) - u.k, -0.01, 0.01);
    u.shift = clamp((rx - u.cx) * (behind ? C.lineShiftBehind : C.lineShift), -C.lineShiftMax, C.lineShiftMax);
  }

  // Screening midfielder: shape position, pulled on to the lane between the ball and the most dangerous receiver he can screen.
  function zoneTarget(S, d, carried) {
    const b = S.ball;
    let bx = d.hx + clamp((b.x - d.hx) * C.zoneShiftX, -5, 5), by = d.hy + clamp((b.y - d.hy) * C.zoneShiftY, -3, 3);
    d.intent = 'shape';
    if (carried) {
      let best = 1e9, qx = 0, qy = 0;
      for (let i = 0; i < S.att.length; i++) {
        if (i === b.owner) continue;
        const a = S.att[i];
        if (a.y > b.y - 2) continue;                       // only receivers ahead of the ball
        const dx = a.x - b.x, dy = a.y - b.y, l2 = dx * dx + dy * dy;
        if (l2 < 16) continue;
        const u = clamp(((bx - b.x) * dx + (by - b.y) * dy) / l2, 0.2, 0.8);
        const x = b.x + dx * u, y = b.y + dy * u, dq = hyp(x - bx, y - by);
        if (dq > d.screen) continue;                       // too far from his post to screen that one
        const sc = hyp(a.x - P.cx, a.y) + 1.5 * dq;        // nearer the goal = more dangerous
        if (sc < best) { best = sc; qx = x; qy = y; }
      }
      if (best < 1e9) {
        // half a step on to the lane normally, all the way once the carrier shapes to pass
        const k = S.setTicks >= 6 ? 1 : 0.6;
        bx += (qx - bx) * k; by += (qy - by) * k;
        d.intent = S.setTicks >= 6 ? 'read' : 'screen';
      }
    }
    d.tx = bx; d.ty = by; d.cap = d.spd;
  }

  // Man-marker: goal-side of where he THINKS his man is (he sees him `react` ticks late and extrapolates),
  // shaded to the ball side, tighter as the ball gets close. A sharp cut makes the extrapolation wrong: separation.
  function seenMan(S, d) {
    const t = S.tick, r = d.react;
    if (t - r < 0) return [S.level.att[d.a].x, S.level.att[d.a].y, 0, 0];
    const k = (t - r) % HN, mvx = S.hvx[d.a][k], mvy = S.hvy[d.a][k];
    return [S.hx[d.a][k] + mvx * r * TICK, S.hy[d.a][k] + mvy * r * TICK, mvx, mvy];
  }
  /* Hand-over. A marker follows his man, but not off the pitch. Once his man (where he last saw him, `react` ticks ago,
     not extrapolated) is more than `leash` metres from where the marking started (the man's start position, which the
     marker began 2-3 m goal-side of) AND is no nearer the goal than he was there (he is pulling the marker wide or
     short, not running in behind), the marker passes him on and goes back to shape: from then on he plays as a screen
     from his own set position, standing on the lane to the most dangerous receiver. He picks the man up again if the man
     comes back within leash - 3 m of that start, or gets nearer the goal than he started (danger beats shape). Never
     while his man has the ball (then he presses him as before). Decoys can still pull a marker; they cannot delete him. */
  function handOver(S, d) {
    if (d.leash >= 1e9 || S.ball.owner === d.a) { d.handed = false; return; }
    const a0 = S.level.att[d.a], k = Math.max(0, S.tick - d.react) % HN, mx = S.hx[d.a][k], my = S.hy[d.a][k];
    const away = hyp(mx - a0.x, my - a0.y), nearer = hyp(a0.x - P.cx, a0.y) - hyp(mx - P.cx, my);
    if (!d.handed) d.handed = away > d.leash && nearer < 0;
    else if (nearer > 1 || away < d.leash - 3) d.handed = false;
  }
  function markTarget(S, d) {
    const b = S.ball;
    const [mx, my, mvx, mvy] = seenMan(S, d);
    d.tvx = mvx; d.tvy = mvy;                              // he runs WITH his man (as he last saw him), not after him
    let gx = P.cx - mx, gy = -my; const gl = hyp(gx, gy) || 1; gx /= gl; gy /= gl;
    let ox = b.x - mx, oy = b.y - my; const bd = hyp(ox, oy) || 1; ox /= bd; oy /= bd;
    const dot = ox * gx + oy * gy;                         // keep only the sideways part of "towards the ball"
    let sx = ox - gx * dot, sy = oy - gy * dot;
    let ux = gx + sx * C.markShade, uy = gy + sy * C.markShade; const ul = hyp(ux, uy) || 1;
    const gap = (C.markTight + (C.markLoose - C.markTight) * clamp((bd - C.markNear) / (C.markFar - C.markNear), 0, 1)) * d.tight;
    d.tx = mx + ux / ul * gap; d.ty = Math.max(3, my + uy / ul * gap);
    d.cap = d.spd; d.intent = 'mark';
  }

  // First defender: get goal-side of the ball, in the carrier's path, arrive slowly and stay on your feet.
  // He runs to where he can CUT THE CARRIER OFF (the first point on the carrier's current path he can reach in time),
  // not to where the ball is now. If the ball is already past him he does not chase its tail: he runs for a spot
  // between ball and goal.
  function pressTarget(S, d, car, gx, gy) {
    const b = S.ball, cs = hyp(car.mvx, car.mvy);
    const side = (d.x - b.x) * gx + (d.y - b.y) * gy;
    if (side < -0.3) {
      const qx = b.x + car.mvx * 0.5, qy = b.y + car.mvy * 0.5;
      d.tx = qx + gx * 4; d.ty = Math.max(2.5, qy + gy * 4); d.cap = recoverCap(S, d, d.ty < d.y - 0.5); d.intent = 'recover';
      return;
    }
    let jx = 0, jy = 0;
    for (let k = 0; k <= 12; k++) {
      const tau = k * 0.1, qx = clamp(b.x + car.mvx * tau, 1, P.w - 1), qy = Math.max(2, b.y + car.mvy * tau);
      let ux = P.cx - qx, uy = -qy; const ul = hyp(ux, uy) || 1; ux /= ul; uy /= ul;
      if (cs > 2 && (car.mvx * ux + car.mvy * uy) / cs > -0.2) {
        ux = ux * 0.6 + car.mvx / cs * 0.4; uy = uy * 0.6 + car.mvy / cs * 0.4;
        const l = hyp(ux, uy) || 1; ux /= l; uy /= l;
      }
      jx = qx + ux * C.jockeyD; jy = Math.max(2.5, qy + uy * C.jockeyD);
      if (hyp(jx - d.x, jy - d.y) <= d.spd * 0.9 * tau + 0.4) break;
    }
    d.tx = jx; d.ty = jy;
    const dj = hyp(d.tx - d.x, d.ty - d.y);
    let k = clamp(dj / C.jockeySlowR, C.jockeyMin, 1);
    // close to his spot he may shuffle with the carrier at up to 70% pace, never sprint
    if (dj < C.jockeySlowR) k = Math.max(k, Math.min(0.7, cs / d.spd));
    d.cap = d.spd * k; d.intent = dj < C.jockeySlowR ? 'jockey' : 'press';
  }

  function thinkDefence(S, future) {
    const b = S.ball, t = S.tick, D = S.def;
    const carried = b.owner >= 0, car = carried ? S.att[b.owner] : null;
    const bvx = carried ? car.mvx : b.vx, bvy = carried ? car.mvy : b.vy;
    let gx = P.cx - b.x, gy = -b.y; const gl = hyp(gx, gy) || 1; gx /= gl; gy /= gl;
    if (!carried) samplePath(S);
    S.setTicks = carried && hyp(bvx, bvy) < C.setSpd * C.ballSpd ? S.setTicks + 1 : 0;

    // markers dragged away from goal hand their man over (before anyone is picked to press: a handed-over man is nobody's)
    for (let i = 0; i < D.length; i++) if (D[i].t === 'mark' && D[i].offBalance === 0 && D[i].lt === 0) handOver(S, D[i]);
    // who is the first defender (press), who covers him
    let best = -1, bs = 1e9, second = -1, ss = 1e9, near = 1e9;
    // "He's through": a carrier with no outfield defender on his feet goal-side of him in the corridor to goal
    // (throughW either side of the line from ball to goal centre). Only then do the finish-pressure rules apply.
    S.through = false;
    if (carried && !future && (C.recSpd > 0 || C.dangerR > 0)) {
      S.through = true;
      for (let i = 0; i < D.length; i++) {
        const d = D[i], ax = d.x - b.x, ay = d.y - b.y, along = ax * gx + ay * gy;
        if (d.offBalance === 0 && along > 0.5 && along < gl && Math.abs(ax * gy - ay * gx) < C.throughW) { S.through = false; break; }
      }
    }
    // through on goal near goal: whoever in the back line is nearest goes to the ball, wherever his place in the shape is
    const danger = S.through && C.dangerR > 0 && gl < C.dangerR;
    if (carried && !future) {
      for (let i = 0; i < D.length; i++) {
        const d = D[i];
        if (d.offBalance > 0) continue;
        const dist = hyp(d.x - b.x, d.y - b.y);
        if (dist < near) near = dist;
        const own = d.t === 'mark' && d.a === b.owner && !d.handed, cur = i === S.presser;
        let ok;
        if (d.t === 'mark') ok = own || dist < d.eng;
        else if (d.t === 'line') ok = hyp(d.sx - b.x, d.sy - b.y) < d.eng || (cur && dist < d.eng) || (danger && dist < C.dangerEng);
        else ok = (dist < d.eng || (cur && dist < d.eng + 2)) && hyp(d.hx - b.x, d.hy - b.y) < d.leash;
        if (!ok) continue;
        const beaten = (d.x - b.x) * gx + (d.y - b.y) * gy < -0.3;
        const sc = dist / d.spd + (beaten ? 0.6 : 0) - (own ? 0.8 : 0) - (cur ? 0.35 : 0) + (d.t === 'mark' && !own ? 1 : 0);
        if (sc < bs) { second = best; ss = bs; best = i; bs = sc; }
        else if (sc < ss) { second = i; ss = sc; }
      }
    }
    S.presser = best;
    S.cover = second >= 0 && D[second].t === 'zone' ? second : -1;
    S.pressured = carried && !future && near < C.pressR;

    // who goes for a loose ball: at most two, and only those who can actually get there
    S.chase0 = S.chase1 = -1;
    if (!carried) {
      const el = t - b.kickTick; let t0 = 1e9, t1 = 1e9;
      // Each man works out where he could meet the ball. Zone players go if they can; a back line sends only its
      // best-placed man and the rest keep the line.
      for (let k = 0; k < S.units.length; k++) S.units[k].ch = -1;
      for (let i = 0; i < D.length; i++) {
        const d = D[i]; d.cs = -1;
        if ((d.t === 'mark' && !d.handed) || d.offBalance > 0 || d.lt > 0 || el < d.react) continue;
        let s = meet(S, d.x, d.y, d.spd * 0.9, 0.1, 0.6), sc;
        if (s >= 0 && hyp(S.px[s] - d.x, S.py[s] - d.y) <= d.eng) sc = s * PDT;
        else {
          // cannot cut it out: go and collect it only if it will die close to him
          const dd = hyp(S.px[PN] - d.x, S.py[PN] - d.y);
          if (dd > d.eng * 1.5) continue;
          s = PN; sc = 10 + dd / d.spd;
        }
        d.cs = s; d.csc = sc;
        if (d.t === 'line') { const u = S.units[d.ui]; if (u.ch < 0 || sc < D[u.ch].csc) u.ch = i; }
      }
      for (let i = 0; i < D.length; i++) {
        const d = D[i];
        if (d.cs < 0 || (d.t === 'line' && S.units[d.ui].ch !== i)) continue;
        const s = d.cs, sc = d.csc;
        if (sc < t0) { S.chase1 = S.chase0; S.chaseS1 = S.chaseS0; t1 = t0; S.chase0 = i; S.chaseS0 = s; t0 = sc; }
        else if (sc < t1) { S.chase1 = i; S.chaseS1 = s; t1 = sc; }
      }
    }

    for (let k = 0; k < S.units.length; k++) thinkUnit(S, S.units[k], carried, bvy);

    for (let i = 0; i < D.length; i++) {
      const d = D[i];
      if (d.offBalance > 0 || d.lt > 0) continue;            // busy tackling or getting up
      d.tvx = 0; d.tvy = 0; d.sprint = false;
      if (d.t === 'line') {
        const u = S.units[d.ui];
        d.sx = clamp(u.cx + u.shift + (d.hx - u.cx) * u.k, 2, P.w - 2);
        d.sy = u.y + (d.hy - u.h0);
        // cover: the men either side of a centre-half who has stepped out tuck in and drop a yard behind him
        if (isLineCover(S, d)) {
          const p = D[S.presser];
          if (C.coverDeep && isInsideCover(S, d)) {
            // one goes, one covers: the inside partner drops off to cover depth behind him, on the inside, so that if
            // the man who stepped out is beaten he is still between the ball and the goal
            const dp = hyp(p.x - b.x, p.y - b.y), cx = b.x + gx * (dp + C.coverDepth), cy = b.y + gy * (dp + C.coverDepth);
            d.sx += (cx - d.sx) * C.coverInside; d.sy = Math.max(3, Math.min(d.sy - C.lineCoverDrop, cy));
          } else { d.sx += (p.sx - d.sx) * C.lineCoverTuck; d.sy -= C.lineCoverDrop; }
        }
      }
      if (i === S.presser) { pressTarget(S, d, car, gx, gy); }
      else if (i === S.chase0 || i === S.chase1) {
        const s = i === S.chase0 ? S.chaseS0 : S.chaseS1;
        d.tx = S.px[s]; d.ty = S.py[s]; d.cap = d.spd; d.intent = 'intercept';
      }
      else if (!carried && t - b.kickTick < d.react && (d.t !== 'mark' || d.handed)) { /* has not read the pass yet: carries on */ }
      else if (d.t === 'mark' && !d.handed) markTarget(S, d);
      else if (d.t === 'line') {
        d.tx = d.sx; d.ty = d.sy; d.tvy = S.units[d.ui].vy; d.intent = S.units[d.ui].intent;
        // backpedalling while the line drops; flat out only in a recovery sprint (option 1)
        d.cap = d.intent === 'drop' ? d.spd * C.lineDropK * 1.08 : d.intent === 'recover' ? recoverCap(S, d, S.units[d.ui].vy < -0.5) : d.spd;
        if (isLineCover(S, d) && !d.sprint) d.intent = 'cover';      // a sprinting man keeps 'recover', so he is drawn sprinting
      }
      else if (i === S.cover) {
        d.tx = b.x + gx * C.coverD; d.ty = Math.max(3, b.y + gy * C.coverD); d.cap = d.spd; d.intent = 'cover';
      }
      else if (carried && !future && b.y < d.y - 1.5 && hyp(d.x - b.x, d.y - b.y) < d.eng * 2) {
        // beaten screen: recovery run to a spot between ball and goal, not at the ball
        const k = Math.min(5, gl * 0.5);
        d.tx = b.x + gx * k; d.ty = Math.max(3, b.y + gy * k); d.cap = recoverCap(S, d, d.ty < d.y - 0.5); d.intent = 'recover';
      }
      else zoneTarget(S, d, carried);

      // start a tackle? Any defender on his feet may, once the ball has sat in his range for `patience`.
      if (carried && !future) {
        const dist = hyp(d.x - b.x, d.y - b.y), R = C.lungeR + C.lungeAgg * d.agg;
        d.close = dist < R + 0.4 ? d.close + 1 : 0;
        // ... or at once if the carrier is bringing it straight on to him (so even that loss comes with the plant)
        const onto = dist < R && ((d.x - b.x) * bvx + (d.y - b.y) * bvy) / (dist || 1) > 2.5;
        if (dist < R && (onto || d.close >= C.patience * (1 - d.agg)) && t - b.recvTick >= C.touchShield - 6) {
          d.lt = 1; d.intent = 'windup';
        }
      } else d.close = 0;
    }
  }
  // is d the line-mate next to a member of his unit who has stepped out to press?
  function isLineCover(S, d) {
    const p = S.presser >= 0 ? S.def[S.presser] : null;
    return !!(p && p !== d && p.t === 'line' && p.ui === d.ui && Math.abs(p.uk - d.uk) === 1);
  }
  /* Recovery sprint. A defender who has been beaten or played through, near his own goal, and is running BACK towards
     it to get goal-side of the ball, goes flat out: his own speed plus recBoost, never above recSpd. Only then: a
     defender facing the ball, jockeying, marking or stepping up never goes above his normal speed. The renderer
     already draws intent 'recover' at speed as a sprint (leaning into the run, back to the play). */
  function recoverCap(S, d, goalward) {
    d.sprint = false;
    if (!(C.recSpd > 0) || !goalward || !S.through || hyp(S.ball.x - P.cx, S.ball.y) > C.recZone) return d.spd;
    d.sprint = true;
    return Math.min(C.recSpd, Math.max(d.spd, d.spd + C.recBoost));
  }
  // the inside partner of a line member who has stepped out to the ball (the one nearer the middle of the goal)
  function isInsideCover(S, d) {
    if (!isLineCover(S, d)) return false;
    const p = S.def[S.presser], u = S.units[d.ui];
    const other = u.m[p.uk + (p.uk - d.uk)];                       // the presser's neighbour on the other side, if any
    if (other === undefined) return true;
    return Math.abs(d.hx - P.cx) <= Math.abs(S.def[other].hx - P.cx);
  }

  function moveDefence(S, future) {
    const b = S.ball, carried = b.owner >= 0, car = carried ? S.att[b.owner] : null;
    for (let i = 0; i < S.def.length; i++) {
      const d = S.def[i];
      if (d.offBalance > 0) {                                // on the floor: slides to a stop
        d.offBalance--; d.vx *= 0.8; d.vy *= 0.8; d.lunge = 0; d.intent = 'offbalance';
      } else if (d.lt > 0) {
        /* The tackle. Plant for lungeWind ticks (the tell). At tick lungeCommit he fixes the spot where the ball will
           be if the carrier keeps doing what he is doing. Then the leg goes out for lungeStrike ticks along that
           line. Stand still or run straight: he wins it. Change direction after the commit: he misses and is on the
           floor for offBal ticks. */
        if (d.lt === C.lungeCommit) {
          const ahead = (C.lungeWind - C.lungeCommit + C.lungeStrike * 0.6) * TICK;
          const vx = carried ? car.mvx : b.vx, vy = carried ? car.mvy : b.vy;
          let lx = b.x + vx * ahead - d.x, ly = b.y + vy * ahead - d.y; const l = hyp(lx, ly) || 1;
          d.ldx = lx / l; d.ldy = ly / l;
        }
        if (d.lt <= C.lungeWind) {
          d.vx *= 0.7; d.vy *= 0.7; d.intent = 'windup';
          // the pass has gone or the ball is with someone untouchable: stand down with a small stumble
          if (!carried || future) { d.lt = 0; d.lunge = 0; d.offBalance = 6; continue; }
        } else {
          d.vx = d.ldx * d.spd; d.vy = d.ldy * d.spd; d.intent = 'lunge';
        }
        d.x += d.vx * TICK; d.y += d.vy * TICK;
        const ph = d.lt > C.lungeWind ? (d.lt - C.lungeWind) / C.lungeStrike : 0;
        d.footX = d.x + d.ldx * C.lungeExt * ph; d.footY = d.y + d.ldy * C.lungeExt * ph;
        if (d.lt > C.lungeCommit) { d.fx = d.ldx; d.fy = d.ldy; }
        d.lunge = d.lt / (C.lungeWind + C.lungeStrike);
        if (++d.lt > C.lungeWind + C.lungeStrike) { d.lt = 0; d.striking = false; d.offBalance = C.offBal; }
        else d.striking = d.lt > C.lungeWind + 1;
        continue;
      } else {
        const dx = d.tx - d.x, dy = d.ty - d.y, dd = hyp(dx, dy) || 1e-6;
        // run with the target (tv) plus a correction towards it; never faster than his cap
        const sp = Math.min(d.cap, dd * 6);
        let wx = d.tvx + dx / dd * sp, wy = d.tvy + dy / dd * sp; const wl = hyp(wx, wy);
        if (wl > d.cap) { wx *= d.cap / wl; wy *= d.cap / wl; }
        d.vx += (wx - d.vx) * C.defAccel; d.vy += (wy - d.vy) * C.defAccel;
        const v = hyp(d.vx, d.vy), top = Math.max(d.spd, d.cap);   // cap is above spd only in a recovery sprint
        if (v > top) { d.vx *= top / v; d.vy *= top / v; }
        d.lunge = 0;
      }
      d.x += d.vx * TICK; d.y += d.vy * TICK;
      d.footX = d.x; d.footY = d.y;
      // facing: the ball, unless he is flat out (then where he is running)
      const v = hyp(d.vx, d.vy);
      let fx = b.x - d.x, fy = b.y - d.y;
      if (v > 0.8 * d.spd && (d.intent === 'recover' || d.intent === 'intercept' || d.intent === 'press')) { fx = d.vx; fy = d.vy; }
      const fl = hyp(fx, fy);
      if (fl > 1e-6 && d.offBalance === 0) { d.fx = fx / fl; d.fy = fy / fl; }
    }
  }

  /* Goalkeeper.
     - normally on the line between ball and goal centre, a little off his line, further out as the ball comes closer
     - one-on-one (carrier inside gkOneR with no defender goal-side of him): comes out to narrow the angle, stops
       gkStandOff short of the ball and sets. He never back-pedals from a carrier; a ball dribbled inside
       gkSmotherR of him is smothered
     - when the carrier shapes to shoot inside 24 m he stops moving and sets; if the shot is hit while he is still
       moving he reacts gkLate ticks later
     - a pass he will reach before any attacker, inside his zone (six-yard area; the whole box for a sweeper): he comes
       for it. Attackers not yet played are assumed to have started running when the pass was hit.
     - a shot: stands for reactT ticks, then goes for the nearest point of the ball's path. Against a shot (the last
       player's kick) his clock runs shotPace times faster: reaction, dive speed and stretch, matching the ball */
  // the keeper's area for collecting a loose ball: the penalty area (x 8-42, y 0-16.5)
  const GK_AREA_X = 17, GK_AREA_Y = 16.5;
  // Earliest time any attacker but the passer can reach the loose ball's path (seconds from now). Attackers not yet
  // played are assumed to have started running when the pass was hit (`el` seconds ago).
  function attackersTo(S, el) {
    const b = S.ball;
    let ta = 1e9;
    for (let i = 0; i < S.att.length; i++) {
      if (i === b.lastKicker) continue;
      const a = S.att[i], head = a.active ? 0 : el;
      for (let s = 1; s <= PN; s++) {
        const need = Math.max(0, hyp(S.px[s] - a.x, S.py[s] - a.y) - C.ctrlR) / C.runSpd - head;
        if (need <= s * PDT) { if (s * PDT < ta) ta = s * PDT; break; }
        if (s === PN && need < ta) ta = need;
      }
    }
    return ta;
  }
  function thinkKeeper(S, future) {
    const g = S.gk, b = S.ball, t = S.tick, carried = b.owner >= 0;
    let tx = g.x, ty = g.y, sp = C.gkSpd;
    const bd = hyp(b.x - P.cx, b.y) || 1;
    let shot = false;
    if (!carried && b.vy < -4 && b.y > 0) {
      const xg = b.x + b.vx * (b.y / -b.vy);
      shot = Math.abs(xg - P.cx) < P.goalHalf + 1.2 && hyp(b.vx, b.vy) / (b.fric || C.fric) > b.y * 0.9;
    }
    // a slow loose ball in (or rolling into) his area that he will clearly reach first: he comes off his line and
    // gathers it, wherever it was going (a slow ball rolling at goal included). Checked first, so it wins over the
    // shot reaction below only for balls slower than gkCollectV, which no struck shot inside 30 m is.
    let collect = false, cs = -1;
    if (C.gkCollect > 0 && !carried && t - b.kickTick >= C.gkPassReact && hyp(b.vx, b.vy) <= C.gkCollectV) {
      let tk = 1e9;
      for (let s = 1; s <= PN; s++) {
        const x = S.px[s], y = S.py[s];
        if (y > GK_AREA_Y || y < 0.3 || Math.abs(x - P.cx) > GK_AREA_X) continue;
        const need = Math.max(0, hyp(x - g.x, y - g.y) - C.gkReach) / C.gkRush;
        if (need <= s * PDT) { tk = s * PDT; cs = s; break; }
        if (s === PN) { tk = need; cs = s; }
      }
      if (cs >= 0) {
        const ta = attackersTo(S, (t - b.kickTick) * TICK);
        collect = g.collecting || g.sweeping ? tk < ta + 0.1 : tk + C.gkCollectMargin < ta;
      }
    }
    g.collecting = collect;
    if (collect) {
      g.react = 0; g.dive = Math.max(0, g.dive - 0.1); g.sweeping = true;
      tx = S.px[cs]; ty = S.py[cs]; sp = C.gkRush; g.intent = 'collect';
    } else if (shot) {
      const pace = b.shot ? C.shotPace : 1;
      if (g.react === 0) g.late = g.set ? 0 : C.gkLate;
      g.react += pace; g.sweeping = false;
      if (g.react - pace >= g.reactT + g.late - 1e-9) {   // reactT + late ticks after he saw it (on the shot's clock)
        const sl = hyp(b.vx, b.vy), ux = b.vx / sl, uy = b.vy / sl;
        const al = Math.max(0, (g.x - b.x) * ux + (g.y - b.y) * uy);
        tx = b.x + ux * al; ty = Math.max(0.6, b.y + uy * al); sp = C.gkDive * pace;
        g.dive = Math.min(1, g.dive + 0.125 * pace); g.intent = 'dive';
      } else g.intent = 'set';
    } else {
      g.react = 0; g.dive = Math.max(0, g.dive - 0.1);
      let sweep = false;
      if (!carried && t - b.kickTick >= C.gkPassReact) {
        const el = (t - b.kickTick) * TICK, zx = g.sweeper ? 17 : 10, zy = g.sweeper ? 16.5 : 6.5;
        // keeper: first sample inside his zone that he can be standing on when the ball arrives
        let tk = 1e9, ks = -1;
        for (let s = 1; s <= PN; s++) {
          const x = S.px[s], y = S.py[s];
          if (y > zy || Math.abs(x - P.cx) > zx) continue;
          const need = Math.max(0, hyp(x - g.x, y - g.y) - C.gkReach) / C.gkRush;
          if (need <= s * PDT) { tk = s * PDT; ks = s; break; }
          if (s === PN) { tk = need; ks = s; }
        }
        if (ks >= 0) {
          const ta = attackersTo(S, el);
          sweep = g.sweeping ? tk < ta + 0.1 : tk + C.gkMargin < ta;
          if (sweep) { tx = S.px[ks]; ty = S.py[ks]; sp = C.gkRush; g.intent = 'sweep'; }
        }
      }
      g.sweeping = sweep;
      if (!sweep) {
        // the point on the goal line he stands in front of: the middle of the goal, or (gkBisect, while someone has the
        // ball) where the bisector of the angle between the posts, seen from the ball, meets the line. That is nearer the
        // near post when the ball is wide, so the near post is covered and the far corner is the one left.
        let ax = P.cx;
        if (C.gkBisect && carried) {
          const d1 = hyp(b.x - P.cx + P.goalHalf, b.y), d2 = hyp(b.x - P.cx - P.goalHalf, b.y);
          ax = P.cx - P.goalHalf + 2 * P.goalHalf * d1 / (d1 + d2);
          // ... and a little further towards the near post (gkNear of the way): a shot there arrives soonest
          ax += (P.cx + Math.sign(b.x - P.cx) * P.goalHalf - ax) * C.gkNear * clamp(Math.abs(b.x - P.cx) / 6, 0, 1);
        }
        const ad = hyp(b.x - ax, b.y) || 1, ux = (b.x - ax) / ad, uy = b.y / ad;
        let out = clamp(C.gkOutMin + (32 - bd) * 0.1, C.gkOutMin, C.gkOutMax), smother = false;
        g.intent = 'angle';
        if (carried && !future && hyp(b.x - g.x, b.y - g.y) < C.gkSmotherR) {
          // the ball has been brought to his feet: he goes down on it (visible: he leaves his spot at gkRush)
          tx = b.x; ty = b.y; sp = C.gkRush; g.intent = 'smother'; smother = true;
        } else if (carried && !future && bd < C.gkOneR) {
          let gx = -ux, gy = -uy, alone = true;
          for (const d of S.def) {
            if (d.offBalance > 0) continue;
            const rx = d.x - b.x, ry = d.y - b.y;
            if (hyp(rx, ry) < 3.5 && rx * gx + ry * gy > -0.5) { alone = false; break; }
          }
          if (alone) {
            out = Math.max(out, Math.min(bd * C.gkOneK, g.sweeper ? C.gkSweepOneMax : C.gkOneMax, bd - C.gkStandOff));
            sp = C.gkClose; g.intent = 'narrow';
          }
          // having come out he stands his ground (sliding across to stay on the angle); he does not back-pedal
          out = Math.max(out, Math.min(hyp(g.x - ax, g.y), bd - 1.5));
        }
        if (!smother) { tx = ax + ux * out; ty = Math.max(1, uy * out); if (ty <= 1.01) tx = clamp(tx, P.cx - 3.6, P.cx + 3.6); }
        if (!smother && carried && !future && S.setTicks >= 4 && bd < 24 && hyp(tx - g.x, ty - g.y) < 0.6) { tx = g.x; ty = g.y; g.intent = 'set'; }
      }
    }
    const dx = tx - g.x, dy = ty - g.y, dd = hyp(dx, dy);
    const stepLen = Math.min(dd, sp * TICK);
    if (dd > 1e-9) { g.vx = dx / dd * stepLen / TICK; g.vy = dy / dd * stepLen / TICK; } else { g.vx = 0; g.vy = 0; }
    g.x += g.vx * TICK; g.y += g.vy * TICK;
    g.set = stepLen / TICK < 1;
    const fl = hyp(b.x - g.x, b.y - g.y);
    if (fl > 1e-6) { g.fx = (b.x - g.x) / fl; g.fy = (b.y - g.y) / fl; }
    g.lunge = g.dive;
  }

  function step(S, inp) {
    if (S.status !== 'play') return;
    useCfg(S);
    inp = inp || {};
    const t = S.tick, b = S.ball;

    // attackers
    for (let i = 0; i < S.att.length; i++) {
      const a = S.att[i];
      a.lx = a.x; a.ly = a.y;
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
      // What defenders see is measured from positions only, so a live round and its replay look identical to them.
      a.mvx = (a.x - a.lx) / TICK; a.mvy = (a.y - a.ly) / TICK;
      const h = t % HN; S.hx[i][h] = a.x; S.hy[i][h] = a.y; S.hvx[i][h] = a.mvx; S.hvy[i][h] = a.mvy;
    }
    if (S.status !== 'play') return;

    // ball
    if (b.owner >= 0) {
      const o = S.att[b.owner];
      b.x = o.x + o.fx * C.ballOff; b.y = o.y + o.fy * C.ballOff; b.vx = o.vx; b.vy = o.vy;
    } else {
      b.x += b.vx * TICK; b.y += b.vy * TICK;
      const f = Math.exp(-(b.fric || C.fric) * TICK); b.vx *= f; b.vy *= f;
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

    // defenders and goalkeeper: decide, then move
    thinkDefence(S, ownerFuture);
    moveDefence(S, ownerFuture);
    thinkKeeper(S, ownerFuture);
    const g = S.gk;

    // failures
    if (!ownerFuture) {
      const who = b.owner >= 0 ? b.owner : b.lastKicker;
      const shield = b.owner >= 0 && t - b.recvTick < C.touchShield;
      if (!shield) for (let di = 0; di < S.def.length; di++) {
        const d = S.def[di];
        if (d.offBalance > 0) continue;                      // a man on the floor wins nothing
        const dist = Math.hypot(d.x - b.x, d.y - b.y);
        const leg = d.striking && distSeg(b.x, b.y, d.x, d.y, d.footX, d.footY) < C.footR;
        if (b.owner >= 0) {
          // the leg of a lunge, or the ball dribbled into a defender who is set (planted or moving slowly). A defender
          // sprinting past wins nothing by brushing the ball: he has to plant and lunge like everyone else.
          const setBody = dist < C.bodyR && (d.lt > 0 || Math.hypot(d.vx, d.vy) < C.bodySpd);
          if (leg || setBody) { fail(S, 'tackled', who, di); break; }
        } else if (leg || dist < (d.t === 'mark' ? C.markInterceptR : C.interceptR)) { fail(S, 'intercepted', who, di); break; }
      }
      if (Math.hypot(g.x - b.x, g.y - b.y) < C.gkReach + C.gkDiveExt * g.dive) fail(S, b.owner >= 0 ? 'smothered' : (S.chainPos === S.chain.length - 1 ? 'saved' : 'keeper'), who, 'gk');
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

  root.FB = { TICK, P, C, C0, LEVELS, makeSim, step, finalRec, offsideLine };
})(typeof module !== 'undefined' ? module.exports : window);
