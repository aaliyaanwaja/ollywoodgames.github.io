/* One-Man Team: everything drawn on the pitch canvas. Reads simulation state, never changes it.

   The look: a tabletop football set. A felt cloth with pinked edges lies on a pale table; the pitch is printed on
   it in soft bands and marked in chalk; players are weighted-base figures seen from above; labels are paper tags.

   Interface used by game.js (unchanged):
     Render.resize(stageEl)                 fit the canvas to the stage element (also self-observes the stage)
     Render.draw(S, { now, inp, state })    S is a sim from FB.makeSim; now is the rAF timestamp in ms;
                                            inp is the live input object; state is the game state string
   Optional extras (the game works if nobody calls them):
     Render.invalidate()                    rebuild the cached pitch layer on the next frame
     Render.viewRect()                      { x0, y0, x1, y1, scale } of the current camera, in metres / css px per metre

   Optional data this file reads when present (all safe to omit):
     level.kit = { us:[primary, secondary], them:[primary, secondary], gk: colour }
     level.frame = { x0, x1, y1 }           extra pitch area the fixed camera must include
     defender d.fx, d.fy                    facing (unit vector); derived from movement / the ball when absent
     defender d.lunge                       0..1 over the whole tackle. Up to lungeWind/(lungeWind+lungeStrike) (about 0.63)
                                            is the plant, the only warning the player gets: a set stance, a chalk ring
                                            closing on the base and a tomato lane on the cloth showing where the leg will go.
                                            After that the leg is out.
     defender d.footX, d.footY, d.striking  the tackling foot; the leg is drawn to it, the boot turns chalk while live
     defender d.offBalance                  ticks remaining (34 after a missed lunge); he lies beaten on a tipped base and
                                            gets up over the last few ticks
     defender d.intent                      'jockey' turns him side-on and low; 'recover' / 'intercept' / 'press' at speed sprint
     S.gk.dive (0..1), .vx, .vy, .fx, .fy, .intent, .sweeping, .offBalance   the dive goes the way he is moving
     S.failBy                               index into S.def of the defender who won the ball, 'gk', or -1 */
(function (root) {
  'use strict';
  const { P, C, TICK } = FB;
  const cv = document.getElementById('cv'), ctx = cv.getContext('2d', { alpha: false });
  const TAU = Math.PI * 2;

  // ---------- palette (docs/ART_DIRECTION.md) ----------
  const PAPER = '#F2EAD8', INK = '#14213D', FELT = '#2F7D4F', FELT_DARK = '#2A7046', CHALK = '#FBF8F0';
  const TOMATO = '#E4572E', MUSTARD = '#F2B705', SKY = '#8EC5D6';
  const MARGIN = '#27683F';                       // felt outside the printed pitch (felt shading)
  const TABLE = '#DCCDA8', TABLE_GRAIN = 'rgba(122,92,52,';
  const SKIN = ['#F1CDA6', '#C8926A', '#8D5E40', '#E3B48D'], HAIR = ['#14213D', '#3B2A20', '#5A3A22', '#1E1A1A'];
  const FONT = "'Barlow Condensed', 'Roboto Condensed', 'Arial Narrow', 'Helvetica Neue', Arial, sans-serif";

  // ---------- geometry ----------
  const R = 1.45, RIM = 0.28;                      // figure base radius and rim width, metres
  const BALL_R = 0.62;
  const GX0 = P.cx - P.goalHalf, GX1 = P.cx + P.goalHalf, NET_D = 2.3, NET_IN = 0.32;
  const CLOTH_X0 = -3, CLOTH_X1 = P.w + 3, CLOTH_Y0 = -5.1;
  const PAD = 10;                                 // css px of spare pitch layer around the canvas for the camera punch
  const MAXF = 24;
  const TOP_CLEAR = 64;                           // css px at the top of the stage that overlays may cover

  // ---------- canvas / camera ----------
  let stage = null, W = 0, H = 0, dpr = 1, sc = 8, k = 8, vx0 = 0, vy0 = 0;
  let layer = null, lctx = null, layerDirty = true, layerLevel = null;
  let shadowSpr = null, feltTile = null, speckTile = null, tileDpr = 0;
  let numFont = '', ghostFont = '', tagFont = '', numPx = 11;
  let punchX = 0, punchY = 0, pAX = 0, pAY = 0, pT = -1e9;
  let reduced = false, phoneReduced = false, gameReduced = false, textK = 1;
  try {
    const mq = root.matchMedia('(prefers-reduced-motion: reduce)'); phoneReduced = reduced = mq.matches;
    const on = e => { phoneReduced = e.matches; reduced = phoneReduced || gameReduced; };
    if (mq.addEventListener) mq.addEventListener('change', on); else if (mq.addListener) mq.addListener(on);
  } catch (e) {}
  try {
    if (document.fonts && document.fonts.load) document.fonts.load("700 16px 'Barlow Condensed'").then(() => { tagW.clear(); layerDirty = true; }, () => {});
  } catch (e) {}

  // ---------- kit ----------
  const kit = { usP: TOMATO, usS: PAPER, usNum: INK, thP: INK, thS: SKY, gk: MUSTARD, c0: TOMATO, c1: PAPER, c2: MUSTARD, band: [0.48, 0.5] };
  function lum(hex) {
    const h = String(hex).replace('#', ''); if (h.length < 6) return 0.5;
    const f = i => { const v = parseInt(h.substr(i, 2), 16) / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(0) + 0.7152 * f(2) + 0.0722 * f(4);
  }
  function setKit(level) {
    const kt = level.kit || {}, us = kt.us || [], th = kt.them || [];
    kit.usP = us[0] || TOMATO; kit.usS = us[1] || PAPER;
    kit.thP = th[0] || INK; kit.thS = th[1] || SKY; kit.gk = kt.gk || MUSTARD; kit.band = [0.48, 0.5];
    // legibility guard (design plan, change 4): near-white with near-black reads as the ball. The base goes dark and the
    // banded rim silver, in six wide bands instead of fourteen narrow ones. Their figures always keep the banded rim.
    const lp = lum(kit.thP), ls = lum(kit.thS);
    if ((lp > 0.8 && ls < 0.03) || (ls > 0.8 && lp < 0.03)) { kit.thP = lp < ls ? kit.thP : kit.thS; kit.thS = '#B8BEC6'; kit.band = [0.69, 0.69]; }
    kit.usNum = lum(kit.usS) > 0.32 ? INK : CHALK;
    kit.c0 = kit.usP; kit.c1 = kit.usS; kit.c2 = MUSTARD;
  }

  // ---------- per-sim tracking (no allocation after start-up) ----------
  let lastS = null, lastTick = -1, lastNow = 0;
  let seenKick = -999, seenRecv = -999, seenStatus = 'play';
  const attAng = new Float32Array(MAXF), defAng = new Float32Array(MAXF);
  const attLx = new Float32Array(MAXF), attLy = new Float32Array(MAXF), defLx = new Float32Array(MAXF), defLy = new Float32Array(MAXF);
  let gkAng = Math.PI / 2, gkPrevX = P.cx, gkVx = 0, gkDive = 0, gkDiveAng = 0;
  let kickWho = -1, kickT = -1e9, kickDX = 0, kickDY = -1;
  let failT = -1e9, failX = 0, failY = 0, failKind = 0, failRing = -1, tackler = -1, keeperHold = false;
  let goalT = -1e9, gBX = 0, gBY = 0, gVX = 0, gVY = 0, ballDX = 0, ballDY = 0;
  let passLabel = '', passLabelNum = null, recvT = -1e9, rockWho = -1;
  // pose of the figure about to be drawn (set by the caller, reset by figure)
  let pPlant = 0, pDown = 0, pSide = 0, pFoot = false, pFootX = 0, pFootY = 0, pStrike = false;
  const obSeen = new Int16Array(MAXF);
  const PLANT_END = (C.lungeWind || 12) / ((C.lungeWind || 12) + (C.lungeStrike || 7));
  const COMMIT = (C.lungeCommit || 4) / ((C.lungeWind || 12) + (C.lungeStrike || 7));
  const LANE = (C.lungeExt || 1.3) + (C.footR || 0.55) + 0.55;
  // ball: trail ring buffer and rolling orientation
  const TR = 10, trX = new Float32Array(TR), trY = new Float32Array(TR); let trN = 0, trH = 0;
  const BP = 12, bpx = new Float32Array(BP), bpy = new Float32Array(BP), bpz = new Float32Array(BP);
  let rollX = 0, rollY = 0, lead = 0, leadX = 0, leadY = -1;
  (function () {
    const t = (1 + Math.sqrt(5)) / 2, n = Math.hypot(1, t); let i = 0;
    for (const a of [-1, 1]) for (const b of [-t, t]) {
      bpx[i] = 0; bpy[i] = a / n; bpz[i] = b / n; i++;
      bpx[i] = a / n; bpy[i] = b / n; bpz[i] = 0; i++;
      bpx[i] = b / n; bpy[i] = 0; bpz[i] = a / n; i++;
    }
    rollBall(0.37, 0.21);
  })();
  function rollBall(dx, dy) {
    const d = Math.hypot(dx, dy); if (d < 1e-5) return;
    const kx = -dy / d, ky = dx / d, th = d / BALL_R, c = Math.cos(th), s = Math.sin(th);
    for (let i = 0; i < BP; i++) {
      const x = bpx[i], y = bpy[i], z = bpz[i], dot = (kx * x + ky * y) * (1 - c);
      bpx[i] = x * c + ky * z * s + kx * dot;
      bpy[i] = y * c - kx * z * s + ky * dot;
      bpz[i] = z * c + (kx * y - ky * x) * s;
    }
  }
  // short effects
  const FXN = 20, fxType = new Int8Array(FXN), fxX = new Float32Array(FXN), fxY = new Float32Array(FXN), fxT = new Float64Array(FXN), fxA = new Float32Array(FXN);
  let fxI = 0;
  function fx(type, x, y, now, a) { fxType[fxI] = type; fxX[fxI] = x; fxY[fxI] = y; fxT[fxI] = now; fxA[fxI] = a || 0; fxI = (fxI + 1) % FXN; }
  function clearFx() { for (let i = 0; i < FXN; i++) fxType[i] = 0; }
  // confetti
  const CN = 84, cX = new Float32Array(CN), cY = new Float32Array(CN), cZ = new Float32Array(CN), cVX = new Float32Array(CN), cVY = new Float32Array(CN), cVZ = new Float32Array(CN),
    cR = new Float32Array(CN), cVR = new Float32Array(CN), cF = new Float32Array(CN), cVF = new Float32Array(CN), cW = new Float32Array(CN), cH = new Float32Array(CN), cC = new Int8Array(CN), cOn = new Int8Array(CN);
  function clearConfetti() { for (let i = 0; i < CN; i++) cOn[i] = 0; }
  function spawnConfetti(bx) {
    for (let i = 0; i < CN; i++) {
      const a = Math.PI / 2 + (Math.random() - 0.5) * 2.7, sp = 5 + Math.random() * 24;
      cOn[i] = 1; cC[i] = i % 3; cW[i] = 0.55 + Math.random() * 0.4; cH[i] = 0.26 + Math.random() * 0.16;
      cR[i] = Math.random() * TAU; cF[i] = Math.random() * TAU;
      if (reduced) {
        cX[i] = P.cx + (Math.random() - 0.5) * 22; cY[i] = 1 + Math.random() * 12; cZ[i] = 0; cVX[i] = cVY[i] = cVZ[i] = 0; cF[i] = 0;
      } else {
        cX[i] = bx + (Math.random() - 0.5) * 5; cY[i] = 0.4 + Math.random() * 1.2; cZ[i] = 0.3;
        cVX[i] = Math.cos(a) * sp; cVY[i] = Math.sin(a) * sp * 0.9; cVZ[i] = 3.5 + Math.random() * 5.5;
        cVR[i] = (Math.random() - 0.5) * 9; cVF[i] = 7 + Math.random() * 9;
      }
    }
  }

  // ---------- helpers ----------
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  function mulberry(seed) { let a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function turn(cur, target, f) { let d = target - cur; while (d > Math.PI) d -= TAU; while (d < -Math.PI) d += TAU; return cur + d * f; }
  function world() { ctx.setTransform(k, 0, 0, k, (punchX - vx0 * sc) * dpr, (punchY - vy0 * sc) * dpr); }
  let figS = 1, figOX = 0, figOY = 0;   // a figure drawn at reduced size about (figOX, figOY): used for the keeper
  function local(x, y, ang) {
    if (figS !== 1) { x = figOX + x * figS; y = figOY + y * figS; }
    const c = Math.cos(ang) * k * figS, s = Math.sin(ang) * k * figS; ctx.setTransform(c, s, -s, c, (punchX + (x - vx0) * sc) * dpr, (punchY + (y - vy0) * sc) * dpr);
  }
  function pixels() { ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  const X = x => punchX + (x - vx0) * sc, Y = y => punchY + (y - vy0) * sc;
  function disc(x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); }
  const pulse = t => t <= 0 || t >= 1 ? 0 : Math.sin(t * Math.PI);

  // ---------- camera: fixed per level, as tight as the level allows ----------
  function computeView(level) {
    let x0 = 17, x1 = 33, y1 = 18;
    const inc = (x, y) => { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y > y1) y1 = y; };
    for (const a of level.att) inc(a.x, a.y);
    for (const d of level.def) inc(d.x, d.y);
    const f = level.frame; if (f) { if (f.x0 != null) inc(f.x0, 0); if (f.x1 != null) inc(f.x1, 0); if (f.y1 != null) inc(P.cx, f.y1); }
    x0 = Math.max(-2.4, x0 - 5.5); x1 = Math.min(P.w + 2.4, x1 + 5.5); y1 = Math.min(P.h + 1.6, y1 + 5.5);
    let y0 = CLOTH_Y0 - 1.3;
    sc = Math.max(2, Math.min(W / (x1 - x0), H / (y1 - y0)));
    // UI overlays (coach bubble, toast) sit on the top ~60 css px of the stage: keep the net below them
    const need = TOP_CLEAR / sc + NET_D;
    if (need > -y0) { y0 = -need; sc = Math.max(2, Math.min(W / (x1 - x0), H / (y1 - y0))); y0 = -(TOP_CLEAR / sc + NET_D); }
    const vw = W / sc, vh = H / sc, full0 = CLOTH_X0 - 1.6, full1 = CLOTH_X1 + 1.6;
    vx0 = vw >= full1 - full0 ? P.cx - vw / 2 : clamp((x0 + x1) / 2 - vw / 2, full0, full1 - vw);
    vy0 = y0;
    k = sc * dpr;
    numPx = Math.max(11, 1.24 * sc) * textK;
    numFont = '700 ' + numPx.toFixed(1) + 'px ' + FONT;
    ghostFont = '700 ' + (numPx * 1.15).toFixed(1) + 'px ' + FONT;
    tagFont = '700 ' + (clamp(sc * 1.05, 11, 13) * textK).toFixed(1) + 'px ' + FONT;
    tagW.clear();
  }

  // ---------- cached textures ----------
  function buildTiles() {
    if (tileDpr === dpr && feltTile) return;
    tileDpr = dpr;
    const n = Math.round(144 * dpr), rnd = mulberry(7);
    feltTile = document.createElement('canvas'); feltTile.width = feltTile.height = n;
    let c = feltTile.getContext('2d');
    const im = c.createImageData(n, n), d = im.data;
    for (let i = 0; i < d.length; i += 4) { const v = rnd(); const dark = v < 0.5; d[i] = d[i + 1] = d[i + 2] = dark ? 0 : 255; d[i + 3] = Math.floor((dark ? 20 : 13) * rnd()); }
    c.putImageData(im, 0, 0);
    c.lineCap = 'round';
    for (let i = 0; i < 520; i++) {                                 // felt fibres
      const x = rnd() * n, y = rnd() * n, a = rnd() * TAU, l = (1.5 + rnd() * 4) * dpr;
      c.strokeStyle = rnd() < 0.5 ? 'rgba(255,255,255,' + (0.03 + rnd() * 0.05) + ')' : 'rgba(8,30,20,' + (0.04 + rnd() * 0.07) + ')';
      c.lineWidth = (0.5 + rnd() * 0.5) * dpr;
      c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a + 0.6) * l * 0.5, y + Math.sin(a + 0.6) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke();
    }
    const m = Math.round(96 * dpr);
    speckTile = document.createElement('canvas'); speckTile.width = speckTile.height = m;
    c = speckTile.getContext('2d');
    for (let i = 0; i < 900; i++) {                                 // chalk wear: specks that get rubbed out of the lines
      c.fillStyle = 'rgba(0,0,0,' + (0.12 + rnd() * 0.5) + ')';
      const r = (0.25 + rnd() * rnd() * 1.1) * dpr; c.beginPath(); c.arc(rnd() * m, rnd() * m, r, 0, TAU); c.fill();
    }
    shadowSpr = document.createElement('canvas'); shadowSpr.width = shadowSpr.height = 96;
    c = shadowSpr.getContext('2d');
    const g = c.createRadialGradient(48, 48, 14, 48, 48, 48);
    g.addColorStop(0, 'rgba(10,22,30,.5)'); g.addColorStop(0.55, 'rgba(10,22,30,.3)'); g.addColorStop(1, 'rgba(10,22,30,0)');
    c.fillStyle = g; c.fillRect(0, 0, 96, 96);
  }

  // ---------- the static pitch layer: built once per level / resize, never per frame ----------
  function buildLayer(level) {
    buildTiles();
    if (!layer) { layer = document.createElement('canvas'); lctx = layer.getContext('2d', { alpha: false }); }
    const lw = Math.round((W + 2 * PAD) * dpr), lh = Math.round((H + 2 * PAD) * dpr);
    layer.width = lw; layer.height = lh;
    const c = lctx, rnd = mulberry(1987);
    const ox = (PAD - vx0 * sc) * dpr, oy = (PAD - vy0 * sc) * dpr;
    const wx0 = vx0 - PAD / sc - 1, wx1 = vx0 + (W + PAD) / sc + 1, wy1 = vy0 + (H + PAD) / sc + 1;
    const yb = wy1 + 6;                                             // the cloth always runs off the bottom of the view
    const W2M = () => c.setTransform(k, 0, 0, k, ox, oy), PX = () => c.setTransform(1, 0, 0, 1, 0, 0);

    // table
    PX(); c.fillStyle = TABLE; c.fillRect(0, 0, lw, lh);
    c.lineWidth = dpr;
    for (let y = 0; y < lh; y += (2 + rnd() * 5) * dpr) {
      c.strokeStyle = TABLE_GRAIN + (0.05 + rnd() * 0.11) + ')';
      c.beginPath(); let yy = y; c.moveTo(0, yy);
      for (let x = 0; x <= lw; x += lw / 6) { yy += (rnd() - 0.5) * 2.4 * dpr; c.lineTo(x, yy); }
      c.stroke();
    }
    // cloth with pinked edges, hard offset shadow
    W2M();
    const cloth = new Path2D(), T = 0.5, D = 0.26;
    cloth.moveTo(CLOTH_X0, yb);
    for (let y = yb, i = 0; y > CLOTH_Y0; y -= T, i++) cloth.lineTo(CLOTH_X0 + (i % 2 ? D : 0), y);
    for (let x = CLOTH_X0, i = 0; x < CLOTH_X1; x += T, i++) cloth.lineTo(x, CLOTH_Y0 + (i % 2 ? D : 0));
    for (let y = CLOTH_Y0, i = 0; y < yb; y += T, i++) cloth.lineTo(CLOTH_X1 - (i % 2 ? D : 0), y);
    cloth.lineTo(CLOTH_X1, yb); cloth.closePath();
    c.save(); c.translate(0.28, 0.34); c.fillStyle = 'rgba(20,33,61,.3)'; c.fill(cloth); c.restore();
    c.fillStyle = MARGIN; c.fill(cloth);
    // printed pitch: soft mowing bands
    for (let i = 0, y = 0; y < yb; i++, y += 6) { c.fillStyle = i % 2 ? FELT_DARK : FELT; c.fillRect(0, y, P.w, 6.02); }
    // felt texture, fold creases and edge shading, all clipped to the cloth
    c.save(); c.clip(cloth);
    PX(); c.fillStyle = c.createPattern(feltTile, 'repeat'); c.fillRect(0, 0, lw, lh);
    W2M();
    const crease = (x, y, w, h) => {
      const v = w < h; c.fillStyle = 'rgba(255,255,255,.055)'; c.fillRect(x, y, v ? 0.16 : w, v ? h : 0.16);
      c.fillStyle = 'rgba(6,30,20,.085)'; c.fillRect(v ? x + 0.16 : x, v ? y : y + 0.16, v ? 0.2 : w, v ? h : 0.2);
    };
    crease(12.4, CLOTH_Y0, 0.3, yb - CLOTH_Y0); crease(37.4, CLOTH_Y0, 0.3, yb - CLOTH_Y0);
    crease(CLOTH_X0, 20.6, CLOTH_X1 - CLOTH_X0, 0.3); crease(CLOTH_X0, 46.2, CLOTH_X1 - CLOTH_X0, 0.3);
    PX();
    const vg = c.createRadialGradient(lw / 2, lh * 0.46, Math.min(lw, lh) * 0.36, lw / 2, lh * 0.46, Math.hypot(lw, lh) * 0.6);
    vg.addColorStop(0, 'rgba(8,28,22,0)'); vg.addColorStop(1, 'rgba(8,28,22,.2)');
    c.fillStyle = vg; c.fillRect(0, 0, lw, lh);
    c.restore();

    // chalk, drawn on its own sheet so wear can be rubbed out of it before it goes onto the felt
    const sheet = document.createElement('canvas'); sheet.width = lw; sheet.height = lh;
    const s = sheet.getContext('2d');
    s.setTransform(k, 0, 0, k, ox, oy); s.strokeStyle = CHALK; s.fillStyle = CHALK; s.lineCap = 'round'; s.lineJoin = 'round';
    const line = (xa, ya, xb, yb2) => {
      const dx = xb - xa, dy = yb2 - ya, len = Math.hypot(dx, dy), n = Math.max(2, Math.ceil(len / 1.7)), nx = -dy / len, ny = dx / len, ov = 0.1;
      for (let pass = 0; pass < 2; pass++) {
        s.lineWidth = pass ? 0.11 : 0.2; s.globalAlpha = pass ? 0.7 : 1;
        s.beginPath();
        for (let i = 0; i <= n; i++) {
          const t = i / n, j = (rnd() - 0.5) * (pass ? 0.13 : 0.075), e = i === 0 ? -ov : i === n ? ov : 0;
          s.lineTo(xa + dx * t + dx / len * e + nx * j, ya + dy * t + dy / len * e + ny * j);
        }
        s.stroke();
      }
      s.globalAlpha = 1;
    };
    const arc = (cx, cy, r, a0, a1) => {
      const n = Math.max(6, Math.ceil(Math.abs(a1 - a0) * r / 1.1));
      for (let pass = 0; pass < 2; pass++) {
        s.lineWidth = pass ? 0.11 : 0.2; s.globalAlpha = pass ? 0.7 : 1;
        s.beginPath();
        for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n, rr = r + (rnd() - 0.5) * (pass ? 0.12 : 0.07); s.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
        s.stroke();
      }
      s.globalAlpha = 1;
    };
    line(0, 0, P.w, 0); line(0, 0, 0, yb); line(P.w, 0, P.w, yb); line(0, P.h, P.w, P.h);
    line(8, 0, 8, 16.5); line(8, 16.5, 42, 16.5); line(42, 16.5, 42, 0);
    line(17, 0, 17, 5.5); line(17, 5.5, 33, 5.5); line(33, 5.5, 33, 0);
    arc(P.cx, 11, 9.15, 0.645, Math.PI - 0.645);
    arc(P.cx, P.h, 9.15, 0, TAU);
    arc(0, 0, 1, 0, Math.PI / 2); arc(P.w, 0, 1, Math.PI / 2, Math.PI);
    s.beginPath(); s.ellipse(P.cx, 11, 0.3, 0.26, 0.4, 0, TAU); s.fill();
    s.beginPath(); s.ellipse(P.cx, P.h, 0.34, 0.3, 0.2, 0, TAU); s.fill();
    s.setTransform(1, 0, 0, 1, 0, 0); s.globalCompositeOperation = 'destination-out';
    s.fillStyle = s.createPattern(speckTile, 'repeat'); s.fillRect(0, 0, lw, lh);
    PX(); c.globalAlpha = 0.94; c.drawImage(sheet, 0, 0); c.globalAlpha = 1;
    sheet.width = sheet.height = 1;

    // hem stitching just inside the pinked edge
    W2M();
    c.strokeStyle = 'rgba(251,248,240,.3)'; c.lineWidth = 0.085; c.setLineDash([0.36, 0.3]);
    c.beginPath(); c.moveTo(CLOTH_X0 + 0.85, yb); c.lineTo(CLOTH_X0 + 0.85, CLOTH_Y0 + 0.85); c.lineTo(CLOTH_X1 - 0.85, CLOTH_Y0 + 0.85); c.lineTo(CLOTH_X1 - 0.85, yb); c.stroke();
    c.setLineDash([]);
    // the goal: dark ground under the net and the frame's shadow
    c.fillStyle = 'rgba(14,26,44,.34)';
    c.beginPath(); c.moveTo(GX0, 0); c.lineTo(GX1, 0); c.lineTo(GX1 - NET_IN, -NET_D); c.lineTo(GX0 + NET_IN, -NET_D); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(14,26,44,.3)'; c.lineWidth = 0.42; c.lineCap = 'round';
    c.beginPath(); c.moveTo(GX0 + 0.26, 0.36); c.lineTo(GX1 + 0.26, 0.36); c.stroke(); c.lineCap = 'butt';
    // maker's mark printed on the cloth either side of the goal
    PX();
    c.font = '700 ' + (Math.max(8.5, 0.92 * sc) * dpr).toFixed(1) + 'px ' + FONT; c.textBaseline = 'middle'; c.fillStyle = 'rgba(251,248,240,.34)';
    const ty = oy - 2.55 * k;
    c.textAlign = 'right'; c.fillText('OLLYWOOD', ox + (GX0 - 1.5) * k, ty);
    c.textAlign = 'left'; c.fillText('MATCH CLOTH', ox + (GX1 + 1.5) * k, ty);
    layerLevel = level; layerDirty = false;
  }

  function resize(st) {
    if (st && st !== stage) {
      stage = st;
      try { if (root.ResizeObserver) new ResizeObserver(() => resize(stage)).observe(stage); } catch (e) {}
    }
    if (!stage) return;
    const w = stage.clientWidth, h = stage.clientHeight, d = Math.min(3, root.devicePixelRatio || 1);
    if (!w || !h || (w === W && h === H && d === dpr)) return;
    W = w; H = h; dpr = d;
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    layerDirty = true;
  }

  // ---------- recorded marks ----------
  const trailCache = new WeakMap();
  function trailOf(rec) {
    let p = trailCache.get(rec);
    if (!p) {
      p = new Path2D(); p.moveTo(rec.x[0], rec.y[0]);
      for (let i = 3; i < rec.len; i += 3) p.lineTo(rec.x[i], rec.y[i]);
      trailCache.set(rec, p);
    }
    return p;
  }
  function arrowHead(x, y, ux, uy, s) {
    ctx.beginPath(); ctx.moveTo(x + ux * s, y + uy * s);
    ctx.lineTo(x - ux * s * 0.6 - uy * s * 0.75, y - uy * s * 0.6 + ux * s * 0.75);
    ctx.lineTo(x - ux * s * 0.6 + uy * s * 0.75, y - uy * s * 0.6 - ux * s * 0.75);
    ctx.closePath(); ctx.fill();
  }
  function reach(kk) {                                              // how far along a kick's line stays on the pitch (0..1)
    const dx = kk.vx / C.fric, dy = kk.vy / C.fric; let t = 1;
    if (dy < 0) t = Math.min(t, (-0.9 - kk.by) / dy); else if (dy > 0) t = Math.min(t, (P.h - kk.by) / dy);
    if (dx < 0) t = Math.min(t, (0 - kk.bx) / dx); else if (dx > 0) t = Math.min(t, (P.w - kk.bx) / dx);
    return Math.max(0, t);
  }
  function drawMarks(S) {
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (let i = 0; i < S.att.length; i++) {
      const rec = S.att[i].rec; if (!rec || !rec.len) continue;
      ctx.strokeStyle = 'rgba(251,248,240,.5)'; ctx.lineWidth = 0.15; ctx.setLineDash([0.02, 0.5]);
      ctx.stroke(trailOf(rec));
      const kk = rec.kick;
      if (kk) {
        const q = reach(kk), ex = kk.bx + kk.vx / C.fric * q, ey = kk.by + kk.vy / C.fric * q, l = Math.hypot(ex - kk.bx, ey - kk.by) || 1, ux = (ex - kk.bx) / l, uy = (ey - kk.by) / l;
        ctx.strokeStyle = 'rgba(251,248,240,.62)'; ctx.lineWidth = 0.2; ctx.setLineDash([0.85, 0.7]);
        ctx.beginPath(); ctx.moveTo(kk.bx, kk.by); ctx.lineTo(ex - ux * 0.6, ey - uy * 0.6); ctx.stroke();
        ctx.setLineDash([]); ctx.fillStyle = 'rgba(251,248,240,.7)'; arrowHead(ex, ey, ux, uy, 0.62);
      }
    }
    // the run being drawn right now
    const lr = S.liveRec;
    if (S.live >= 0 && lr && lr.x.length > 3) {
      ctx.strokeStyle = 'rgba(251,248,240,.78)'; ctx.lineWidth = 0.17; ctx.setLineDash([0.02, 0.46]);
      ctx.beginPath(); ctx.moveTo(lr.x[0], lr.y[0]);
      const n = lr.x.length;
      for (let i = 3; i < n; i += 3) ctx.lineTo(lr.x[i], lr.y[i]);
      ctx.lineTo(lr.x[n - 1], lr.y[n - 1]); ctx.stroke();
      const kk = lr.kick;
      if (kk) {
        ctx.lineWidth = 0.2; ctx.setLineDash([0.85, 0.7]);
        const q = reach(kk); ctx.beginPath(); ctx.moveTo(kk.bx, kk.by); ctx.lineTo(kk.bx + kk.vx / C.fric * q, kk.by + kk.vy / C.fric * q); ctx.stroke();
      }
    }
    ctx.setLineDash([]); ctx.lineCap = 'butt';
  }

  // ---------- figures ----------
  function shadow(x, y, r) { ctx.drawImage(shadowSpr, x - r + 0.34, y - r + 0.44, r * 2, r * 2); }

  /* kind: 0 ours, 1 theirs, 2 keeper. ext: forward slide of the figure off its base (lunge / dive / kick follow-through),
     rock: -1..1 wobble for an off-balance figure. */
  const GK_SCALE = 0.8;
  function figure(x, y, ang, kind, num, tone, live, lx, ly, ext, rock, now) {
    const prim = kind === 0 ? kit.usP : kit.thP, sec = kind === 0 ? kit.usS : kit.thS;
    const fxu = Math.cos(ang), fyu = Math.sin(ang);
    const tilt = Math.min(0.42, Math.abs(ext) * 0.2 + Math.abs(rock) * 0.16 + Math.hypot(lx, ly) * 0.25 + pDown * 0.4 + (pFoot ? 0.14 : 0));
    if (live) {                                                     // the live player's mustard ring
      const rt = now - recvT, snap = !reduced && rt >= 0 && rt < 90 ? 1 + 0.12 * (1 - rt / 90) : 1;   // the ball sticks: the ring snaps 12% larger for 90ms
      const rr = (R + 0.46 + (reduced ? 0 : 0.05 * Math.sin(now / 240))) * snap;
      disc(x, y, rr + 0.09); ctx.fillStyle = INK; ctx.fill();
      disc(x, y, rr); ctx.fillStyle = MUSTARD; ctx.fill();
      disc(x, y, R + 0.1); ctx.fillStyle = INK; ctx.fill();
    }
    // weighted base: rim in the primary colour, deck in the secondary
    ctx.beginPath(); ctx.ellipse(x, y, R * (1 - tilt), R, ang, 0, TAU);
    ctx.fillStyle = kind === 0 ? prim : sec; ctx.fill(); ctx.lineWidth = 0.11; ctx.strokeStyle = INK; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(x - fxu * tilt * 0.3, y - fyu * tilt * 0.3, (R - RIM) * (1 - tilt), R - RIM, ang, 0, TAU);
    ctx.fillStyle = kind === 0 ? sec : pPlant > 0 && kind === 1 && pSide === 0 ? TOMATO : prim; ctx.fill();
    if (kind === 1) {                                               // their base: a banded rim, so they never read as ours
      ctx.strokeStyle = prim; ctx.lineWidth = RIM - 0.06; ctx.setLineDash(kit.band);
      ctx.beginPath(); ctx.ellipse(x, y, (R - RIM / 2) * (1 - tilt), R - RIM / 2, ang, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 0.09; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(x, y, R - RIM / 2, -2.75, -1.95); ctx.stroke(); ctx.lineCap = 'butt';

    // the figure: ours stands on the top half of the base so the number has the bottom half to itself
    const big = kind !== 0, sw = (big ? 0.72 : 0.54) * (1 + 0.2 * pPlant), sd = big ? 0.42 : 0.34, hr = big ? 0.43 : 0.36;
    const px = -fyu, py = fxu, side = rock * 0.34;
    const cx = x + lx + fxu * (ext + pDown * 0.55) + px * side, cy = y + (big ? 0 : -0.54) + ly + fyu * (ext + pDown * 0.55) + py * side;
    const shirt = kind === 2 ? kit.gk : kind === 1 ? sec : prim;
    ctx.lineCap = 'round';
    if (pFoot) {                                                    // the tackling leg, out to where the foot really is
      for (let pass = 0; pass < 2; pass++) {
        ctx.lineWidth = pass ? 0.28 : 0.5; ctx.strokeStyle = pass ? shirt : INK;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(pFootX, pFootY); ctx.stroke();
      }
      disc(pFootX, pFootY, 0.36); ctx.fillStyle = INK; ctx.fill();
      disc(pFootX, pFootY, 0.25); ctx.fillStyle = pStrike ? CHALK : prim; ctx.fill();
    }
    local(cx, cy, ang + rock * 0.45 + pSide);
    if (pDown > 0.5) {                                              // beaten: flat out on the cloth, arms thrown forward
      for (let pass = 0; pass < 2; pass++) {
        ctx.lineWidth = pass ? 0.26 : 0.44; ctx.strokeStyle = pass ? shirt : INK;
        ctx.beginPath(); ctx.moveTo(0.5, -0.3); ctx.lineTo(1.25, -0.72); ctx.moveTo(0.5, 0.3); ctx.lineTo(1.3, 0.5); ctx.stroke();
        ctx.lineWidth = pass ? 0.22 : 0.4; ctx.strokeStyle = pass ? prim : INK;
        ctx.beginPath(); ctx.moveTo(-0.5, -0.2); ctx.lineTo(-1.25, -0.42); ctx.moveTo(-0.5, 0.2); ctx.lineTo(-1.2, 0.5); ctx.stroke();
      }
      ctx.fillStyle = SKIN[tone & 3]; disc(1.33, -0.76, 0.13); ctx.fill(); disc(1.38, 0.52, 0.13); ctx.fill();
      ctx.strokeStyle = INK; ctx.lineWidth = sd * 2 + 0.2; ctx.beginPath(); ctx.moveTo(-0.5, 0); ctx.lineTo(0.5, 0); ctx.stroke();
      ctx.strokeStyle = shirt; ctx.lineWidth = sd * 2; ctx.beginPath(); ctx.moveTo(-0.5, 0); ctx.lineTo(0.5, 0); ctx.stroke();
      ctx.lineCap = 'butt';
      if (kind === 1) { ctx.strokeStyle = prim; ctx.lineWidth = 0.2; ctx.beginPath(); ctx.moveTo(-0.5, -0.14); ctx.lineTo(0.5, -0.14); ctx.moveTo(-0.5, 0.14); ctx.lineTo(0.5, 0.14); ctx.stroke(); }
      ctx.strokeStyle = INK; ctx.lineWidth = 0.08;
      disc(0.98, 0, hr); ctx.fillStyle = HAIR[(tone >> 2) & 3]; ctx.fill(); ctx.stroke();
    } else {
    if (ext > 0.25 && kind === 2) {                                 // the keeper's arms at full stretch
      const l = (ext - 0.2) * 0.95;
      for (let pass = 0; pass < 2; pass++) {
        ctx.lineWidth = pass ? 0.2 : 0.38; ctx.strokeStyle = pass ? shirt : INK;
        ctx.beginPath(); ctx.moveTo(0.1, 0.5); ctx.lineTo(0.3 + l, 0.42); ctx.moveTo(0.1, -0.5); ctx.lineTo(0.3 + l, -0.42); ctx.stroke();
      }
    }
    if (kind === 2) {                                               // gloves
      const gx = 0.5 + Math.max(0, ext - 0.2) * 0.95;
      ctx.fillStyle = CHALK; ctx.strokeStyle = INK; ctx.lineWidth = 0.09;
      disc(gx, -0.62, 0.27); ctx.fill(); ctx.stroke(); disc(gx, 0.62, 0.27); ctx.fill(); ctx.stroke();
    }
    // arms: swinging with the ground covered, spread wide and low when he sets himself
    if (kind !== 2) {
      const sw2 = sw + 0.02, ph = reduced ? 0 : Math.sin((x + y) * 2.4) * Math.min(1, Math.hypot(lx, ly) * 9);
      const a0 = 0.36 + 0.2 * ph - 0.1 * pPlant, a1 = 0.36 - 0.2 * ph - 0.1 * pPlant, out = 0.34 * pPlant;
      for (let pass = 0; pass < 2; pass++) {
        ctx.lineWidth = pass ? 0.26 : 0.44; ctx.strokeStyle = pass ? shirt : INK;
        ctx.beginPath(); ctx.moveTo(0, -sw2); ctx.lineTo(a0, -sw2 - out); ctx.moveTo(0, sw2); ctx.lineTo(a1, sw2 + out); ctx.stroke();
      }
      ctx.fillStyle = SKIN[tone & 3];
      disc(a0 + 0.1, -sw2 - out * 1.2, 0.13); ctx.fill(); disc(a1 + 0.1, sw2 + out * 1.2, 0.13); ctx.fill();
    }
    // shoulders: a capsule across the direction of travel
    ctx.strokeStyle = INK; ctx.lineWidth = sd * 2 + 0.2; ctx.beginPath(); ctx.moveTo(0, -sw); ctx.lineTo(0, sw); ctx.stroke();
    ctx.strokeStyle = shirt; ctx.lineWidth = sd * 2; ctx.beginPath(); ctx.moveTo(0, -sw); ctx.lineTo(0, sw); ctx.stroke();
    ctx.lineCap = 'butt';
    if (kind === 1) {                                               // their kit: stripes, no number
      ctx.strokeStyle = prim; ctx.lineWidth = 0.2;
      ctx.beginPath(); ctx.moveTo(-sd, -0.56); ctx.lineTo(sd, -0.56); ctx.moveTo(-sd, 0.56); ctx.lineTo(sd, 0.56); ctx.stroke();
    }
    // head: face shows as a crescent in front of the hair
    ctx.strokeStyle = INK; ctx.lineWidth = 0.08;
    disc(0.06, 0, hr); ctx.fillStyle = SKIN[tone & 3]; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(0.06, 0, hr - 0.02, Math.PI * 0.62, Math.PI * 1.38); ctx.closePath(); ctx.fillStyle = HAIR[(tone >> 2) & 3]; ctx.fill();
    }
    ctx.lineCap = 'butt';
    pPlant = 0; pDown = 0; pSide = 0; pFoot = false; pStrike = false;
    if (num != null) {
      pixels(); ctx.font = numFont; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = kit.usNum;
      ctx.fillText(num, X(x), Y(y + 0.66) + numPx * 0.36);
    }
    world();
  }

  function ghost(a) {
    ctx.fillStyle = 'rgba(251,248,240,.1)'; disc(a.x, a.y, R); ctx.fill();
    ctx.strokeStyle = 'rgba(251,248,240,.82)'; ctx.lineWidth = 0.14; ctx.lineCap = 'round'; ctx.setLineDash([0.42, 0.44]);
    disc(a.x, a.y, R); ctx.stroke(); ctx.setLineDash([]); ctx.lineCap = 'butt';
    pixels(); ctx.font = ghostFont; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = 'rgba(251,248,240,.9)';
    ctx.fillText(a.num, X(a.x), Y(a.y) + numPx * 1.15 * 0.36); world();
  }

  // ---------- goal ----------
  // how hard the ball hit the net: 0 for a tap-in, 1 for a full-power shot (sets the bulge and the camera kick)
  const netHit = () => clamp((Math.hypot(gVX, gVY) - 12) / 22, 0, 1);
  const NU = 16, NV = 5, netX = new Float32Array((NU + 1) * (NV + 1)), netY = new Float32Array((NU + 1) * (NV + 1));
  function drawGoal(now) {
    let B = 0, bx = P.cx;
    if (goalT > -1e8) {
      const t = (now - goalT) / 1000; bx = ballDX;
      const depth = clamp((-ballDY - 0.5) / 1.2, 0, 1);
      const h = netHit();
      B = depth * (reduced ? 0.7 : 0.7 + (0.9 + 0.9 * h) * Math.exp(-7.5 * t) * Math.cos(15.7 * t));
    }
    for (let j = 0; j <= NV; j++) for (let i = 0; i <= NU; i++) {
      const v = j / NV, xl = GX0 + NET_IN * v, xr = GX1 - NET_IN * v, x = xl + (xr - xl) * i / NU;
      const dx = (x - bx) / 2.1, g = Math.exp(-dx * dx) * v * B, n = j * (NU + 1) + i;
      netX[n] = x - (x - bx) * 0.12 * g; netY[n] = -NET_D * v - g;
    }
    ctx.strokeStyle = 'rgba(251,248,240,.8)'; ctx.lineWidth = Math.max(0.07, 0.95 / sc); ctx.lineJoin = 'round';
    ctx.beginPath();
    for (let j = 0; j < NV; j++) for (let i = 0; i < NU; i++) {
      const a = j * (NU + 1) + i, b = a + NU + 1;
      ctx.moveTo(netX[a], netY[a]); ctx.lineTo(netX[b + 1], netY[b + 1]);
      ctx.moveTo(netX[a + 1], netY[a + 1]); ctx.lineTo(netX[b], netY[b]);
    }
    ctx.stroke();
    // net cord round the back, then stanchions
    ctx.strokeStyle = CHALK; ctx.lineWidth = 0.16;
    ctx.beginPath(); ctx.moveTo(GX0, 0);
    for (let j = 1; j <= NV; j++) ctx.lineTo(netX[j * (NU + 1)], netY[j * (NU + 1)]);
    for (let i = 1; i <= NU; i++) ctx.lineTo(netX[NV * (NU + 1) + i], netY[NV * (NU + 1) + i]);
    for (let j = NV - 1; j >= 0; j--) ctx.lineTo(netX[j * (NU + 1) + NU], netY[j * (NU + 1) + NU]);
    ctx.stroke();
    // crossbar and posts
    ctx.lineCap = 'round';
    ctx.strokeStyle = INK; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(GX0, 0); ctx.lineTo(GX1, 0); ctx.stroke();
    ctx.strokeStyle = CHALK; ctx.lineWidth = 0.38; ctx.beginPath(); ctx.moveTo(GX0, 0); ctx.lineTo(GX1, 0); ctx.stroke();
    ctx.lineCap = 'butt';
    ctx.fillStyle = CHALK; ctx.strokeStyle = INK; ctx.lineWidth = 0.11;
    disc(GX0, 0, 0.36); ctx.fill(); ctx.stroke(); disc(GX1, 0, 0.36); ctx.fill(); ctx.stroke();
  }

  // ---------- paper tags ----------
  const tagW = new Map();
  function tag(px, py, str, fill, ink) {
    pixels(); ctx.font = tagFont;
    let tw = tagW.get(str); if (tw === undefined) { tw = Math.ceil(ctx.measureText(str).width); tagW.set(str, tw); }
    const w = tw + 12, h = Math.round(18 * textK), x = Math.round(clamp(px - w / 2, 4, W - w - 6)), y = Math.round(clamp(py, 4, H - h - 6));
    ctx.fillStyle = INK; ctx.fillRect(x + 2, y + 2, w, h);
    ctx.fillStyle = fill; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.strokeRect(x + 0.25, y + 0.25, w - 0.5, h - 0.5);
    ctx.fillStyle = ink; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillText(str, x + w / 2, y + h - Math.round(5 * textK));
    world();
  }

  // ---------- frame ----------
  function resetSim(S, view) {
    lastS = S; lastTick = S.tick;
    const b = S.ball;
    seenKick = b.kickTick; seenRecv = b.recvTick; seenStatus = S.status === 'play' ? 'play' : '';
    for (let i = 0; i < S.att.length && i < MAXF; i++) { attAng[i] = Math.atan2(S.att[i].fy, S.att[i].fx); attLx[i] = attLy[i] = 0; }
    for (let i = 0; i < S.def.length && i < MAXF; i++) { const d = S.def[i]; defAng[i] = Math.atan2(b.y - d.y, b.x - d.x); defLx[i] = defLy[i] = 0; }
    gkAng = Math.atan2(b.y - S.gk.y, b.x - S.gk.x); gkPrevX = S.gk.x; gkVx = 0; gkDive = 0;
    obSeen.fill(0); kickWho = -1; kickT = -1e9; failT = -1e9; failRing = -1; tackler = -1; keeperHold = false; goalT = -1e9; recvT = -1e9; rockWho = -1;
    trN = 0; trH = 0; lead = b.owner >= 0 ? R + 0.12 - C.ballOff : 0; if (b.owner >= 0) { leadX = S.att[b.owner].fx; leadY = S.att[b.owner].fy; } rollX = b.x + leadX * lead; rollY = b.y + leadY * lead; ballDX = b.x; ballDY = b.y;
    pT = -1e9; clearFx();
    if (view.state !== 'goal' && view.state !== 'goalhold') clearConfetti();
  }
  function punch(now, ax, ay) { if (reduced) return; pAX = ax; pAY = ay; pT = now; }

  function events(S, now) {
    const b = S.ball;
    if (b.kickTick !== seenKick) {
      seenKick = b.kickTick;
      if (b.kickTick >= 0) {
        const sp = Math.hypot(b.vx, b.vy) || 1, pw = clamp(sp / C.kickMax, 0.2, 1);
        kickWho = b.lastKicker; kickT = now; kickDX = b.vx / sp; kickDY = b.vy / sp;
        fx(1, b.x - kickDX * 0.3, b.y - kickDY * 0.3, now, pw); fx(4, b.x, b.y, now, Math.atan2(kickDY, kickDX));
        if (b.shot) {                                                // a shot: a ring off the boot and a harder kick of the camera
          fx(5, b.x, b.y, now, 0);
          punch(now, -kickDX * 5.5, -kickDY * 5.5);
        } else punch(now, -kickDX * 3.2 * pw, -kickDY * 3.2 * pw);
      }
    }
    if (b.recvTick !== seenRecv) { seenRecv = b.recvTick; if (b.recvTick >= 0) { fx(2, b.x, b.y, now, 0); if (b.owner === S.live) recvT = now; } }
    if (S.status !== seenStatus) {
      seenStatus = S.status;
      if (S.status === 'goal') {
        goalT = now; gBX = b.x; gBY = b.y; gVX = b.vx; gVY = Math.min(b.vy, -4);
        spawnConfetti(clamp(b.x, GX0 + 1, GX1 - 1)); punch(now, clamp(gVX * 0.12, -2, 2), -4 - 4 * netHit());
      } else if (S.status === 'fail') {
        const r = S.reason; failT = now; failX = ballDX; failY = ballDY; failKind = 0; failRing = -1;
        const by = S.failBy;
        if (by === 'gk' || (by === undefined && (r === 'smothered' || r === 'saved' || r === 'keeper'))) { keeperHold = true; failKind = 1; punch(now, 0, -4.5); }
        else if (r === 'tackled' || r === 'intercepted' || (typeof by === 'number' && by >= 0)) {
          tackler = -1;
          if (typeof by === 'number') tackler = by >= 0 && by < S.def.length ? by : -1;
          else { let best = 1e9; for (let i = 0; i < S.def.length; i++) { const d = S.def[i], q = Math.hypot(d.x - b.x, d.y - b.y); if (q < best) { best = q; tackler = i; } } }
          if (tackler >= 0) {
            const d = S.def[tackler], tx = d.lunge > 0 && d.footX !== undefined ? d.footX : d.x, ty = d.lunge > 0 && d.footY !== undefined ? d.footY : d.y;
            failX = ballDX + (tx - ballDX) * 0.3; failY = ballDY + (ty - ballDY) * 0.3;
          }
          failKind = 1; punch(now, 4.5, 2.5);
          rockWho = typeof S.failWho === 'number' && S.failWho >= 0 ? S.failWho : S.live;   // the man who lost it rocks on his base
        }
        else if (r === 'bump') {
          const o = S.att[S.failWho], me = S.att[S.live];
          if (o && me) { failX = (o.x + me.x) / 2; failY = (o.y + me.y) / 2; }
          failKind = 1; punch(now, 4, 0);
        } else if (r === 'offside') { failKind = 2; failRing = S.failWho; }
        else if (r === 'out' || r === 'wide' || r === 'early') { failKind = 3; failX = clamp(b.x, 0, P.w); failY = clamp(b.y, 0, P.h); fx(1, failX, failY, now, 0.8); }
        if (failKind === 1) fx(1, failX, failY, now, 1);
      }
    }
  }

  function drawFx(now) {
    for (let i = 0; i < FXN; i++) {
      const ty = fxType[i]; if (!ty) continue;
      const t = now - fxT[i], x = fxX[i], y = fxY[i];
      if (ty === 1) {                                               // chalk dust
        const e = t / 420; if (e >= 1) { fxType[i] = 0; continue; }
        ctx.fillStyle = CHALK; ctx.globalAlpha = 0.5 * (1 - e);
        for (let j = 0; j < 6; j++) { const a = j * 1.05 + i, d = (0.25 + 0.9 * e * (0.6 + 0.4 * ((j * 7) % 5) / 4)) * (0.6 + fxA[i] * 0.6); disc(x + Math.cos(a) * d, y + Math.sin(a) * d, 0.16 + 0.3 * e); ctx.fill(); }
        ctx.globalAlpha = 1;
      } else if (ty === 2) {                                        // first touch
        const e = t / 280; if (e >= 1) { fxType[i] = 0; continue; }
        ctx.strokeStyle = CHALK; ctx.globalAlpha = 0.85 * (1 - e); ctx.lineWidth = 0.2 * (1 - e) + 0.04;
        disc(x, y, 0.7 + 1.1 * (1 - (1 - e) * (1 - e))); ctx.stroke(); ctx.globalAlpha = 1;
      } else if (ty === 5) {                                        // shot: a chalk ring thrown off the boot
        const e = t / 200; if (e >= 1) { fxType[i] = 0; continue; }
        ctx.strokeStyle = CHALK; ctx.globalAlpha = 0.75 * (1 - e); ctx.lineWidth = 0.22 * (1 - e) + 0.05;
        disc(x, y, 0.6 + 1.9 * (1 - (1 - e) * (1 - e))); ctx.stroke(); ctx.globalAlpha = 1;
      } else if (ty === 4) {                                        // kick: three short strike marks behind the ball
        const e = t / 170; if (e >= 1) { fxType[i] = 0; continue; }
        ctx.strokeStyle = CHALK; ctx.globalAlpha = 1 - e; ctx.lineWidth = 0.13; ctx.lineCap = 'round';
        ctx.beginPath();
        for (let j = -1; j <= 1; j++) { const a = fxA[i] + Math.PI + j * 0.55, r0 = 0.75 + e * 0.5, r1 = r0 + 0.5; ctx.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); ctx.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); }
        ctx.stroke(); ctx.globalAlpha = 1; ctx.lineCap = 'butt';
      }
    }
  }
  function drawFailMark(S, now) {
    if (failT < -1e8 || !failKind || failKind === 2) return;
    const t = now - failT, e = reduced ? 1 : Math.min(1, t / 130), s = (failKind === 3 ? 0.7 : 0.82) * (e < 1 ? 0.5 + 1.1 * e : 1 + 0.6 * Math.max(0, 1 - (t - 130) / 160));
    ctx.beginPath();                                                // a stamped starburst where the move broke down
    for (let i = 0; i < 16; i++) { const a = i * TAU / 16 + 0.2, r = (i % 2 ? 0.62 : 1.3) * s; ctx.lineTo(failX + Math.cos(a) * r, failY + Math.sin(a) * r); }
    ctx.closePath();
    ctx.save(); ctx.translate(0.14, 0.16); ctx.fillStyle = INK; ctx.fill(); ctx.restore();
    ctx.fillStyle = TOMATO; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 0.11; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.strokeStyle = PAPER; ctx.lineWidth = 0.2; ctx.lineCap = 'round'; const q = 0.3 * s;
    ctx.beginPath(); ctx.moveTo(failX - q, failY - q); ctx.lineTo(failX + q, failY + q); ctx.moveTo(failX + q, failY - q); ctx.lineTo(failX - q, failY + q); ctx.stroke(); ctx.lineCap = 'butt';
  }

  function drawConfetti(dt, airborne) {
    for (let i = 0; i < CN; i++) {
      if (!cOn[i]) continue;
      const up = cZ[i] > 0;
      if (up && !airborne && dt > 0) {                             // integrate once per frame, in the first pass
        const f = Math.exp(-2.1 * dt);
        cVX[i] *= f; cVY[i] *= f; cX[i] += cVX[i] * dt; cY[i] += cVY[i] * dt;
        cVZ[i] = Math.max(-2.1, cVZ[i] - 8 * dt); cZ[i] += cVZ[i] * dt;
        cR[i] += cVR[i] * dt; cF[i] += cVF[i] * dt;
        if (cZ[i] <= 0) { cZ[i] = 0; cF[i] = 0; }
      }
      if ((cZ[i] > 0) !== airborne) continue;
      const z = cZ[i], c = Math.cos(cR[i]), s = Math.sin(cR[i]), f = airborne ? Math.cos(cF[i]) : 1, w = cW[i], h = cH[i];
      if (airborne) {
        ctx.setTransform(k * c, k * s, -k * s * f, k * c * f, (punchX + (cX[i] + z * 0.3 - vx0) * sc) * dpr, (punchY + (cY[i] + z * 0.36 - vy0) * sc) * dpr);
        ctx.fillStyle = 'rgba(10,22,30,.22)'; ctx.fillRect(-w / 2, -h / 2, w, h);
      }
      ctx.setTransform(k * c, k * s, -k * s * f, k * c * f, (punchX + (cX[i] - vx0) * sc) * dpr, (punchY + (cY[i] - z * 0.5 - vy0) * sc) * dpr);
      if (!airborne) { ctx.fillStyle = 'rgba(10,22,30,.28)'; ctx.fillRect(-w / 2 + 0.05, -h / 2 + 0.06, w, h); }
      ctx.fillStyle = cC[i] === 0 ? kit.c0 : cC[i] === 1 ? kit.c1 : kit.c2; ctx.fillRect(-w / 2, -h / 2, w, h);
    }
    world();
  }

  function drawBall(S, now) {
    const b = S.ball; let x = b.x, y = b.y;
    if (goalT > -1e8) {                                            // the sim stops on the line; carry the ball into the net
      const t = (now - goalT) / 1000, q = (1 - Math.exp(-7 * t)) / 7;
      x = clamp(gBX + gVX * q, GX0 + 0.7, GX1 - 0.7); y = Math.max(-NET_D + 0.55, gBY + gVY * q);
    }
    else {                                                         // at a player's feet the ball sits just off the front of his base
      const o = b.owner >= 0 ? S.att[b.owner] : null, want = R + 0.12 - C.ballOff;
      if (o) { leadX = o.fx; leadY = o.fy; lead += (want - lead) * 0.35; } else lead *= 0.8;
      x += leadX * lead; y += leadY * lead;
    }
    ballDX = x; ballDY = y;
    rollBall(x - rollX, y - rollY); rollX = x; rollY = y;
    const sp = Math.hypot(b.vx, b.vy);
    if (b.owner < 0 && b.shot && sp > 5 && trN > 1 && S.status === 'play' && !reduced) {   // a chalk streak behind shots only
      ctx.strokeStyle = CHALK; ctx.lineCap = 'round';
      let px = x, py = y;
      const al = 0.55 * Math.max(0, 1 - (now - kickT) / 250) + 0.25, wd = 1.9;   // bright off the boot, settling after 250ms
      for (let i = 1; i < trN; i++) {
        const j = (trH - i + TR * 2) % TR, f = 1 - i / trN;
        ctx.globalAlpha = al * f; ctx.lineWidth = BALL_R * wd * f;
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(trX[j], trY[j]); ctx.stroke(); px = trX[j]; py = trY[j];
      }
      ctx.globalAlpha = 1; ctx.lineCap = 'butt';
    }
    shadow(x - 0.12, y - 0.14, BALL_R * 1.9);
    disc(x, y, BALL_R + 0.1); ctx.fillStyle = INK; ctx.fill();
    disc(x, y, BALL_R); ctx.fillStyle = '#FFFFFF'; ctx.fill();
    ctx.fillStyle = INK; ctx.beginPath();
    for (let i = 0; i < BP; i++) { const z = bpz[i]; if (z < 0.12) continue; const r = BALL_R * 0.3 * (0.35 + 0.65 * z); ctx.moveTo(x + bpx[i] * BALL_R * 0.9 + r, y + bpy[i] * BALL_R * 0.9); ctx.arc(x + bpx[i] * BALL_R * 0.9, y + bpy[i] * BALL_R * 0.9, r, 0, TAU); }
    ctx.fill();
  }

  function edgeArrow(x, y) {
    const m = 1.1, x0 = vx0 + m, x1 = vx0 + W / sc - m, y0 = vy0 + m, y1 = vy0 + H / sc - m;
    if (x >= x0 - m && x <= x1 + m && y >= y0 - m && y <= y1 + m) return;
    const ex = clamp(x, x0, x1), ey = clamp(y, y0, y1), d = Math.hypot(x - ex, y - ey) || 1;
    ctx.fillStyle = INK; arrowHead(ex, ey, (x - ex) / d, (y - ey) / d, 1.05);
    ctx.fillStyle = MUSTARD; arrowHead(ex, ey, (x - ex) / d, (y - ey) / d, 0.8);
  }

  function drawDef(S, i, now, f) {
    const d = S.def[i], b = S.ball, sp = Math.hypot(d.vx || 0, d.vy || 0), it = d.intent;
    const real = d.lunge > 0, down = d.offBalance > 0;
    let ta;
    if (d.fx !== undefined && d.fy !== undefined) ta = Math.atan2(d.fy, d.fx);
    else if (sp > 1.1) ta = Math.atan2(d.vy, d.vx);
    else ta = Math.atan2(b.y - d.y, b.x - d.x);
    if (i === tackler && !real) ta = Math.atan2(failY - d.y, failX - d.x);
    if (!down) defAng[i] = turn(defAng[i], ta, (i === tackler || real) ? 1 : f * 0.8);
    const sprint = (it === 'recover' || it === 'intercept' || it === 'press') && sp > 0.8 * (d.spd || 5), lk = sprint ? 0.06 : 0.035, lm = sprint ? 0.42 : 0.26;
    defLx[i] += (clamp((d.vx || 0) * lk, -lm, lm) - defLx[i]) * f; defLy[i] += (clamp((d.vy || 0) * lk, -lm, lm) - defLy[i]) * f;
    let ext = 0, lx = defLx[i], ly = defLy[i];
    if (real) {
      const l = Math.min(1, d.lunge);
      if (l < PLANT_END) { pPlant = Math.min(1, l / (PLANT_END * 0.35)); ext = -0.26 * pPlant; lx = ly = 0; }
      else {
        ext = 0.3; lx = ly = 0;
        if (d.footX !== undefined) { pFoot = true; pFootX = d.footX; pFootY = d.footY; pStrike = !!d.striking; }
        else { pFoot = true; const e = (l - PLANT_END) / (1 - PLANT_END); pFootX = d.x + Math.cos(defAng[i]) * 1.3 * e; pFootY = d.y + Math.sin(defAng[i]) * 1.3 * e; pStrike = true; }
      }
    } else if (i === tackler) {                                     // won it with his body: a short step in
      const t = (now - failT) / 150; ext = reduced ? 0.5 : t < 1 ? 0.8 * (1 - (1 - t) * (1 - t)) : 0.5 + 0.3 * Math.max(0, 1 - (t - 1) / 2);
    }
    if (down) { pDown = Math.min(1, d.offBalance / 8); lx *= 0.4; ly *= 0.4; }
    else if (it === 'jockey' && !real) pSide = (i % 2 ? -1 : 1) * 0.85, pPlant = 0.35;
    figure(d.x, d.y, defAng[i], 1, null, i * 5 + 1, false, lx, ly, ext, 0, now);
  }

  /* The tackle tell. It is drawn over our players, because a defender who is close enough to tackle is half hidden
     behind the man he is tackling: a chalk ring closing on his base (it lands as the leg goes), his base turning
     tomato, and from the moment he commits a tomato lane showing where the leg will go. */
  function tackleTell(d) {
    const l = Math.min(1, d.lunge), p = Math.min(1, l / PLANT_END), ux = d.fx || 0, uy = d.fy === undefined ? 1 : d.fy;
    if (l > COMMIT) {
      const qx = -uy, qy = ux, a = l < PLANT_END ? Math.min(1, (l - COMMIT) / 0.1) : 1, w0 = 0.4, w1 = 0.62, s0 = R * 0.7, s1 = LANE;
      ctx.beginPath();
      ctx.moveTo(d.x + ux * s0 + qx * w0, d.y + uy * s0 + qy * w0); ctx.lineTo(d.x + ux * s1 + qx * w1, d.y + uy * s1 + qy * w1);
      ctx.arc(d.x + ux * s1, d.y + uy * s1, w1, Math.atan2(qy, qx), Math.atan2(-qy, -qx), true);
      ctx.lineTo(d.x + ux * s0 - qx * w0, d.y + uy * s0 - qy * w0); ctx.closePath();
      ctx.globalAlpha = 0.6 * a; ctx.fillStyle = TOMATO; ctx.fill();
      ctx.globalAlpha = a; ctx.strokeStyle = INK; ctx.lineWidth = 0.11; ctx.lineJoin = 'round'; ctx.stroke(); ctx.globalAlpha = 1;
    }
    if (l < PLANT_END) {
      const rr = R + 0.3 + (reduced ? 0.6 : 1.7 * (1 - p) * (1 - p));
      disc(d.x, d.y, rr); ctx.strokeStyle = INK; ctx.lineWidth = 0.5; ctx.stroke();
      disc(d.x, d.y, rr); ctx.strokeStyle = CHALK; ctx.lineWidth = 0.3; ctx.stroke();
    }
  }

  function draw(S, view) {
    if (!S) return;
    if (!W || !H) { resize(stage || cv.parentElement); if (!W || !H) return; }
    const now = view.now || 0, inp = view.inp || {}, state = view.state;
    if (S.level !== layerLevel || layerDirty) { setKit(S.level); computeView(S.level); buildLayer(S.level); }
    if (S !== lastS || S.tick < lastTick) resetSim(S, view);
    const dt = clamp((now - lastNow) / 1000, 0, 0.05); lastNow = now;
    const live = S.live, b = S.ball, g = S.gk, f = Math.min(1, dt * 14);
    if (S.tick !== lastTick) {
      gkVx += ((g.x - gkPrevX) / ((S.tick - lastTick) * TICK) - gkVx) * 0.5; gkPrevX = g.x;
      trX[trH] = b.x; trY[trH] = b.y; trH = (trH + 1) % TR; if (trN < TR) trN++;
      if (b.owner >= 0) trN = 0;
      lastTick = S.tick;
    } else if (S.status === 'play' && state !== 'play') gkVx = 0;
    events(S, now);

    // camera punch
    const pt = now - pT;
    if (pt < 320 && !reduced) { const e = Math.exp(-pt / 70) * Math.cos(pt / 32); punchX = pAX * e; punchY = pAY * e; } else { punchX = 0; punchY = 0; }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(layer, Math.round((punchX - PAD) * dpr), Math.round((punchY - PAD) * dpr));
    world();

    // practice target: a chalk circle to land the pass in
    if (S.level.mark) {
      const m = S.level.mark;
      // mustard, not chalk white, so it cannot be mistaken for a pitch marking
      ctx.fillStyle = 'rgba(242,183,5,.16)'; disc(m.x, m.y, m.r); ctx.fill();
      ctx.strokeStyle = MUSTARD; ctx.lineWidth = 0.32; ctx.setLineDash([0.9, 0.55]); disc(m.x, m.y, m.r); ctx.stroke(); ctx.setLineDash([]);
    }

    // offside line, while the live player waits for his pass
    const waiting = live >= 0 && S.role === 'ball' && b.owner !== live && S.liveKickTick < 0 && S.chain[S.chainPos + 1] === live && b.owner >= 0;
    const offFail = failKind === 2 && failT > -1e8;
    let offY = -1;
    if ((waiting && S.status === 'play') || offFail) {
      offY = FB.offsideLine(S);
      if (offY > 0.05) {
        ctx.fillStyle = offFail ? 'rgba(228,87,46,.16)' : 'rgba(20,33,61,.15)'; ctx.fillRect(0, 0, P.w, offY);
        ctx.strokeStyle = INK; ctx.lineWidth = 0.34; ctx.beginPath(); ctx.moveTo(0, offY); ctx.lineTo(P.w, offY); ctx.stroke();
        ctx.strokeStyle = offFail ? TOMATO : MUSTARD; ctx.lineWidth = 0.2; ctx.setLineDash([1.1, 0.7]);
        ctx.beginPath(); ctx.moveTo(0, offY); ctx.lineTo(P.w, offY); ctx.stroke(); ctx.setLineDash([]);
      } else offY = -1;
    }

    drawMarks(S);
    drawConfetti(dt, false);

    // chalk marks where the players still to come will stand
    for (let i = 0; i < S.att.length; i++) if (!S.att[i].active) ghost(S.att[i]);

    for (let i = 0; i < S.def.length && i < MAXF; i++) {            // a puff of chalk where a beaten defender goes down
      const d = S.def[i];
      if (d.offBalance > 8 && obSeen[i] === 0) fx(1, d.x + (d.fx || 0) * 0.8, d.y + (d.fy || 0) * 0.8, now, 1);
      obSeen[i] = d.offBalance > 0 ? 1 : 0;
    }

    // contact shadows
    for (let i = 0; i < S.def.length; i++) shadow(S.def[i].x, S.def[i].y, R * 1.32);
    shadow(g.x, g.y, R * 1.32);
    for (let i = 0; i < S.att.length; i++) if (S.att[i].active) shadow(S.att[i].x, S.att[i].y, i === live ? R * 1.6 : R * 1.32);

    drawGoal(now);

    // the incident stays readable under the fail card: a mustard halo on the defender or keeper who won it
    if (failT > -1e8 && (tackler >= 0 || keeperHold)) {
      const hx = keeperHold ? g.x : S.def[tackler].x, hy = keeperHold ? g.y : S.def[tackler].y, e = reduced ? 1 : Math.min(1, (now - failT) / 140);
      disc(hx, hy, (R + 0.95) * (keeperHold ? GK_SCALE + 0.1 : 1)); ctx.strokeStyle = INK; ctx.lineWidth = 0.5; ctx.globalAlpha = e; ctx.stroke();
      ctx.strokeStyle = MUSTARD; ctx.lineWidth = 0.32; ctx.stroke(); ctx.globalAlpha = 1;
    }

    // defenders (whoever just won the ball is drawn last, on top)
    for (let i = 0; i < S.def.length && i < MAXF; i++) if (i !== tackler && !(S.def[i].lunge > 0)) drawDef(S, i, now, f);
    // goalkeeper
    {
      let dive = 0;
      if (g.dive !== undefined && g.dive !== false) dive = g.dive === true ? 1 : clamp(+g.dive || 0, 0, 1);
      else if (g.lunge > 0) dive = Math.min(1, g.lunge);
      const gvx = g.vx !== undefined ? g.vx : gkVx, gvy = g.vy || 0, gs = Math.hypot(gvx, gvy);
      gkDive += (dive - gkDive) * Math.min(1, dt * 20);
      if (gs > 0.6 && S.status === 'play') gkDiveAng = Math.atan2(gvy, gvx);
      let ta = g.fx !== undefined && g.fy !== undefined ? Math.atan2(g.fy, g.fx) : Math.atan2(b.y - g.y, b.x - g.x);
      if (gkDive > 0.12) ta = gkDiveAng;
      gkAng = turn(gkAng, ta, Math.min(1, dt * 20));
      const rush = g.sweeping || g.intent === 'sweep' || g.intent === 'smother', lk = rush ? 0.06 : 0.03, lm = rush ? 0.4 : 0.2;
      if (g.offBalance > 0) pDown = Math.min(1, g.offBalance / 8);
      ctx.save(); ctx.translate(g.x, g.y); ctx.scale(GK_SCALE, GK_SCALE);   // the keeper is drawn smaller than outfield figures, to match his reach
      figS = GK_SCALE; figOX = g.x; figOY = g.y;
      figure(0, 0, gkAng, 2, null, 0, false, clamp(gvx * lk, -lm, lm), clamp(gvy * lk, -lm, lm), gkDive * 0.95, 0, now);
      figS = 1; ctx.restore(); world();
    }
    // our players: recorded first, the live one last so nothing ever covers him
    for (let pass = 0; pass < 2; pass++) for (let i = 0; i < S.att.length && i < MAXF; i++) {
      const a = S.att[i];
      if (!a.active || (i === live) !== (pass === 1)) continue;
      attAng[i] = turn(attAng[i], Math.atan2(a.fy, a.fx), f);
      attLx[i] += (clamp(a.vx * 0.035, -0.26, 0.26) - attLx[i]) * f; attLy[i] += (clamp(a.vy * 0.035, -0.26, 0.26) - attLy[i]) * f;
      let ext = 0, ang = attAng[i];
      if (i === kickWho) { const t = (now - kickT) / 190; if (t < 1 && !reduced) { ext = 0.42 * pulse(t); ang = turn(ang, Math.atan2(kickDY, kickDX), 0.8 * pulse(t)); } }
      if (i === failRing) { disc(a.x, a.y, R + 0.52); ctx.fillStyle = INK; ctx.fill(); disc(a.x, a.y, R + 0.42); ctx.fillStyle = TOMATO; ctx.fill(); }
      const rk = i === rockWho && !reduced ? Math.sin((now - failT) / 38) * Math.exp(-(now - failT) / 260) : 0;
      figure(a.x, a.y, ang, 0, a.num, i * 3 + a.num, i === live, attLx[i], attLy[i], ext, rk, now);
    }

    // defenders in a tackle go on top, with the tell, so the warning is never hidden behind the man on the ball
    for (let i = 0; i < S.def.length && i < MAXF; i++) {
      const d = S.def[i];
      if (d.lunge > 0) { tackleTell(d); drawDef(S, i, now, f); }
      else if (i === tackler) drawDef(S, i, now, f);
    }

    // who the pass is for
    let passFor = -1;
    if (live >= 0 && S.role === 'ball' && !S.isLast && S.liveKickTick < 0 && S.status === 'play' && !S.level.mark) {
      passFor = S.chain[S.chain.indexOf(live) + 1];
      const t = S.att[passFor];
      if (t) {
        const rr = R + 0.62 + (reduced ? 0 : 0.14 * Math.sin(now / 210)), rot = reduced ? 0.4 : now / 900;
        ctx.lineCap = 'round';
        for (let pass = 0; pass < 2; pass++) {
          ctx.strokeStyle = pass ? MUSTARD : INK; ctx.lineWidth = pass ? 0.24 : 0.42;
          for (let q = 0; q < 4; q++) { ctx.beginPath(); ctx.arc(t.x, t.y, rr, rot + q * Math.PI / 2 - 0.42, rot + q * Math.PI / 2 + 0.42); ctx.stroke(); }
        }
        ctx.lineCap = 'butt';
      } else passFor = -1;
    }

    // aim line and landing marker
    if (live >= 0 && S.role === 'ball' && S.liveKickTick < 0 && S.status === 'play') {
      const a = S.att[live];
      if (inp.charging || a.charge > 0) {
        const shotK = S.isLast;   // the finisher's kick is a shot: harder, and it holds its pace
        const spd = shotK ? C.shotMin + (C.shotMax - C.shotMin) * a.charge : C.kickMin + (C.kickMax - C.kickMin) * a.charge, len = Math.min(spd / (shotK ? C.shotFric : C.fric), 60);
        const ux = a.hasAim ? a.ax : a.fx, uy = a.hasAim ? a.ay : a.fy;
        const bx = a.x + ux * C.ballOff, by = a.y + uy * C.ballOff, ex = bx + ux * len, ey = by + uy * len;
        const gap = 1.05, off = reduced ? 0.5 : (now / 380) % 1;
        for (let pass = 0; pass < 2; pass++) {
          ctx.fillStyle = pass ? CHALK : INK; ctx.beginPath();
          for (let s = (0.9 + off * gap); s < len - 1.1; s += gap) { const r = (pass ? 0.17 : 0.27); ctx.moveTo(bx + ux * s + r, by + uy * s); ctx.arc(bx + ux * s, by + uy * s, r, 0, TAU); }
          ctx.fill();
        }
        ctx.strokeStyle = INK; ctx.lineWidth = 0.4; disc(ex, ey, 0.82); ctx.stroke();
        ctx.strokeStyle = CHALK; ctx.lineWidth = 0.2; disc(ex, ey, 0.82); ctx.stroke();
        disc(ex, ey, 0.36); ctx.fillStyle = INK; ctx.fill(); disc(ex, ey, 0.25); ctx.fillStyle = MUSTARD; ctx.fill();
      }
    }

    drawFx(now);
    drawBall(S, now);
    drawFailMark(S, now);
    drawConfetti(dt, true);

    if (live >= 0 && S.att[live]) edgeArrow(S.att[live].x, S.att[live].y);
    if (S.status === 'play') edgeArrow(b.x, b.y);

    // paper tags
    if (offY > 0) {
      const ly = Y(offY) - 24 < 6 ? Y(offY) + 6 : Y(offY) - 24;
      tag(Math.min(W, X(P.w)) - 34, ly, 'OFFSIDE', offFail ? TOMATO : MUSTARD, offFail ? PAPER : INK);
    }
    if (S.level.mark && live >= 0 && S.role === 'ball' && !S.isLast && S.liveKickTick < 0 && S.status === 'play') {
      const m = S.level.mark;               // practice: the target is the space, not the player
      tag(X(m.x), Y(m.y - m.r - 1.6), 'PASS HERE', MUSTARD, INK);
    } else if (passFor >= 0) {
      const t = S.att[passFor];
      if (t.num !== passLabelNum) { passLabelNum = t.num; passLabel = 'PASS TO ' + t.num; }
      tag(X(t.x), Y(t.y + R + 1.05), passLabel, PAPER, INK);
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  root.Render = {
    resize, draw,
    /* in-game settings: text scale for squad numbers and tags (1 or 1.15), and Reduce motion forced on */
    prefs(o) {
      const k = o && o.text ? o.text : 1; if (k !== textK) { textK = k; layerDirty = true; tagW.clear(); }
      gameReduced = !!(o && o.reduced); reduced = phoneReduced || gameReduced;
    },
    /* where the move broke down, in css px from the stage's top left (for placing the fail card away from it) */
    incident() { return failT > -1e8 ? { x: X(failX), y: Y(failY) } : null; },
    invalidate() { layerDirty = true; },
    viewRect() { return { x0: vx0, y0: vy0, x1: vx0 + W / sc, y1: vy0 + H / sc, scale: sc }; }
  };
})(window);
