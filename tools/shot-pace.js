// Shot pace: how fast a shot travels, how long it takes on screen, and what the keeper lets in. Written for
// docs/foundation/16-shot-pace.md.
//
//   node tools/shot-pace.js                 flight table, screen time and the keeper's open goal (this checkout's engine)
//   SIM=/path/to/sim.js node tools/shot-pace.js   the same on another copy of the engine (for before / after)
//   node tools/shot-pace.js --slowmo 0.38   screen time as the game showed it before 16 (decisive shot at 0.38 speed)
//   node tools/shot-pace.js --scale 7.8     css px per metre used for the on-screen speeds (default 7.8: the median
//                                           fixture on a 390 x 760 phone; 7.0-12.6 across the 60)
//   node tools/shot-pace.js --keeper-only | --flight-only
//
// Flight: a shot struck at goal centre from d metres at power p (the drag: 0 at the dead zone, 1 at 62 px). Time to the
// keeper (2.5 m out) and to the line, speed off the boot, at the keeper and at the line. "Screen" is wall-clock time
// from the strike to the line with the game's frame loop (60 fps, its tempo easing), and the speed on screen there.
//
// Keeper: no outfield players. A shooter dribbles in along the line to goal centre from 8 m further out and either
// stops and aims for 30 ticks (keeper set) or shoots on the run (aims 12 ticks while still moving). He shoots at
// every point of the goal 0.1 m apart; reported are the metres of the 8 m goal that score, near-post side / far side,
// at power 1 and 0.6. Same method as 10-finish-pressure.md (keeper.js), plus a lower power.
'use strict';
const path = require('path');
const args = process.argv.slice(2), opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; }, flag = k => args.includes('--' + k);
global.OMT_LEVELS = global.OMT_LEVELS || [];
const SIM = process.env.SIM || path.join(__dirname, '..', 'one-man-team', 'js', 'sim.js');
const { FB } = require(path.resolve(SIM));
const C = FB.C0, TICK = FB.TICK, hyp = Math.hypot;
const PACE = C.shotPace || 1, SLOW = +opt('slowmo', 1), SCALE = +opt('scale', 7.8);
const r1 = v => v.toFixed(1), r2 = v => v.toFixed(2);

function flight(d, p) {
  const v0 = (C.shotMin + (C.shotMax - C.shotMin) * p) * PACE, k = C.shotFric * PACE;
  const tAt = s => { const q = 1 - k * s / v0; return q > 0 ? -Math.log(q) / k : Infinity; };
  const vAt = s => v0 - k * s;
  // the game's frame loop (game.js frame()): tempo eases to SLOW while the decisive shot is in flight (inside 20 m)
  let y = d, v = v0, tempo = 1, acc = 0, wall = 0, ticks = 0;
  while (y > 0 && wall < 10) {
    const dt = 1 / 60, slow = SLOW < 1 && y <= 20 && v > 5;
    tempo += ((slow ? SLOW : 1) - tempo) * Math.min(1, dt * 14);
    acc += dt * tempo; wall += dt;
    while (acc >= TICK && y > 0) { acc -= TICK; ticks++; y -= v * TICK; v *= Math.exp(-k * TICK); }
  }
  const vLine = vAt(d), shown = vLine * (SLOW < 1 && d > 0 ? SLOW : 1);
  return { v0, tKeeper: tAt(d - 2.5), tLine: tAt(d), vKeeper: vAt(d - 2.5), vLine, wall, pxs: shown * SCALE };
}

function shotAt(x, y, gx, set, power) {
  const gl = hyp(25 - x, y), ux = (x - 25) / gl, uy = y / gl, sx = x + ux * 8, sy = y + uy * 8;
  const L = { name: 'k', time: 30, att: [{ num: 9, role: 'ball', x: sx, y: sy, tip: '' }], order: [0], def: [] };
  const S = FB.makeSim(L, [null], 0); let phase = 0, h = 0;
  while (S.status === 'play' && S.tick < 600) {
    const me = S.att[0]; let inp;
    const dx = gx - me.x, dy = -me.y, dl = hyp(dx, dy);
    if (phase === 0) {
      const tx = x - me.x, ty = y - me.y, tl = hyp(tx, ty);
      if (tl < (set ? 0.3 : 1.2)) phase = 1;
      inp = { mx: tx / (tl || 1), my: ty / (tl || 1) };
    }
    if (phase === 1) {
      h++;
      if (h > (set ? 30 : 12)) inp = { release: true };
      else inp = Object.assign(set ? { mx: 0, my: 0 } : { mx: -ux, my: -uy }, { charging: true, aim: true, ax: dx / dl, ay: dy / dl, power });
    }
    FB.step(S, inp);
  }
  return S.status === 'goal';
}
function openAt(x, y, set, power) {
  let near = 0, far = 0;
  for (let k = 0; k <= 80; k++) {
    const gx = 21 + k * 0.1;
    if (shotAt(x, y, gx, set, power)) { if ((gx - 25) * (x - 25) > 0 || (x === 25 && gx > 25)) near++; else far++; }
  }
  return { open: (near + far) / 10, near: near / 10, far: far / 10 };
}

console.log(`engine ${SIM}\nshot ${r1(C.shotMin * PACE)}-${r1(C.shotMax * PACE)} m/s, friction ${r2(C.shotFric * PACE)}/s, shotPace ${PACE}; keeper react ${C.gkReact} (+${C.gkLate}) ticks, dive ${C.gkDive} m/s; slow-motion ${SLOW < 1 ? SLOW : 'none'}; ${SCALE} px/m`);
if (!flag('keeper-only')) {
  console.log('\nFlight of a shot at goal centre (keeper 2.5 m out)');
  console.log('dist  power | off boot | to keeper: s  m/s | to line: s  m/s | screen: s  px/s at the line');
  for (const d of [10, 15, 18, 21]) for (const p of [0.3, 0.6, 1]) {
    const f = flight(d, p);
    console.log(`${String(d).padStart(4)} ${p.toFixed(1).padStart(6)} | ${r1(f.v0).padStart(8)} | ${r2(f.tKeeper).padStart(13)} ${r1(f.vKeeper).padStart(4)} | ${r2(f.tLine).padStart(11)} ${r1(f.vLine).padStart(4)} | ${r2(f.wall).padStart(9)} ${f.pxs.toFixed(0).padStart(5)}`);
  }
}
if (!flag('flight-only')) {
  const SPOTS = [];
  for (const d of [10, 13, 15, 17, 19, 21]) for (const a of [0, 20, 35]) SPOTS.push([25 + Math.sin(a * Math.PI / 180) * d, Math.cos(a * Math.PI / 180) * d, d, a]);
  const tot = {};
  console.log('\nKeeper alone: metres of goal that score, open (near / far)');
  console.log('dist angle | set p1           | set p0.6         | run p1           | run p0.6');
  for (const [x, y, d, a] of SPOTS) {
    const cells = [[true, 1], [true, 0.6], [false, 1], [false, 0.6]].map(([set, p], i) => {
      const o = openAt(x, y, set, p); tot[i] = (tot[i] || 0) + o.open;
      return `${r1(o.open)} (${r1(o.near)}/${r1(o.far)})`.padEnd(16);
    });
    console.log(`${String(d).padStart(4)} ${String(a).padStart(5)} | ${cells.join(' | ')}`);
  }
  console.log(`mean      | ${[0, 1, 2, 3].map(i => r2(tot[i] / SPOTS.length).padEnd(16)).join(' | ')}`);
}
