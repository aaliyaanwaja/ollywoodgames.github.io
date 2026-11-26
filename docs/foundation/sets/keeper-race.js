// When does the keeper claim a slow ball? Ball played from (25,34) straight at goal, dying at y = D; a striker at
// distance R from where it dies (sideways, x = 25 + R), running at the ball from the moment the pass is hit.
const { FB } = require('/home/claude/ollywoodgames.github.io/one-man-team/js/sim.js');
const hyp = Math.hypot, go = (me, x, y) => { const dx = x - me.x, dy = y - me.y, d = hyp(dx, dy); return d < 0.25 ? {} : { mx: dx / d, my: dy / d }; };
const kick = (me, tx, ty, p, t, at) => { const dx = tx - me.x, dy = ty - me.y, d = hyp(dx, dy) || 1; return t < at ? { charging: true, aim: true, ax: dx / d, ay: dy / d, power: p } : t === at ? { release: true } : {}; };
const lvl = (sx, sy) => ({ name: 't', time: 30, brief: '', att: [{ num: 1, name: 'A', x: 25, y: 34, role: 'ball', tip: '' }, { num: 2, name: 'B', x: sx, y: sy, role: 'ball', tip: '' }], order: [0, 1], def: [] });
function play(D, R, on) {
  FB.C0.gkCollect = on; const dist = 34 - D, v = dist * FB.C.fric + FB.C.stopV, p = (v - FB.C.kickMin) / (FB.C.kickMax - FB.C.kickMin);
  const L = lvl(25 + R * 0.6, D + R * 0.8);
  const S0 = FB.makeSim(L, [null, null], 0); while (S0.status === 'play' && S0.tick < 200) FB.step(S0, kick(S0.att[0], 25, 0, p, S0.tick, 20));
  const S = FB.makeSim(L, [FB.finalRec(S0), null], 1); let out = 0, went = -1;
  while (S.status === 'play' && S.tick < 400) { FB.step(S, S.ball.owner === 1 ? {} : (!S.gone && (S.ball.owner === 0 || S.ball.y > 18)) ? {} : (S.gone = 1, go(S.att[1], S.ball.x, S.ball.y))); if (S.ball.owner < 0) out = Math.max(out, S.gk.y); if (S.gk.intent === 'collect' && went < 0) went = S.tick - 20; }
  FB.C0.gkCollect = 1;
  return { who: S.reason === 'keeper' ? 'keeper' : S.ball.owner === 1 ? 'striker' : S.status + ' ' + S.reason, out, went, p, sp: v };
}
console.log('| Ball dies at | Pass speed off the boot | ' + [4, 7, 10, 14, 20].map(r => `striker ${r} m from where it stops`).join(' | ') + ' |');
console.log('|---|---|---|---|---|---|---|');
for (const D of [6, 9, 12, 15]) {
  const cells = [4, 7, 10, 14, 20].map(R => { const a = play(D, R, 1), b = play(D, R, 0); return a.who === 'keeper' ? `keeper (out to ${a.out.toFixed(1)} m, goes ${(a.went / 60).toFixed(2)} s after the kick)` : a.who + (b.who !== a.who ? ' [off: ' + b.who + ']' : ''); });
  const v = (34 - D) * 0.8 + 1.2;
  console.log(`| ${D} m out | ${v.toFixed(1)} m/s | ${cells.join(' | ')} |`);
}
