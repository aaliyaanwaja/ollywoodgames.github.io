// Scripted bots used to prove every level can be beaten. Not shipped in the game.
const { FB } = require('./load.js');
const C = FB.C;

function goTo(me, x, y) {
  const dx = x - me.x, dy = y - me.y, d = Math.hypot(dx, dy);
  if (d < 0.3) return { mx: 0, my: 0 };
  return { mx: dx / d, my: dy / d };
}
function chase(S, me, t0) {
  const b = S.ball;
  for (let t = t0 || 0; t < 4; t += 0.05) {
    const k = (1 - Math.exp(-C.fric * t)) / C.fric;
    const px = b.x + b.vx * k, py = b.y + b.vy * k;
    if (Math.hypot(px - me.x, py - me.y) <= C.runSpd * t * 0.85 + 1.0) return goTo(me, px, py);
  }
  return goTo(me, b.x, b.y);
}
/* Script fields (all optional unless noted):
   decoy: [[x,y],...]   waypoints for a decoy round, then DONE
   start: tick          when the off-ball run begins (60 ticks = 1s)
   pre: [[x,y]]         where to run before the ball arrives
   spot: 1              keep running to `pre` and only go to the ball when it is within `grab` metres (default 4.5) or slow
   meet: seconds        without `spot`: chase the ball but not before this long after the pass
   carry: [[x,y],...]   waypoints while dribbling
   kickAt: [x,y]        aim point (independent aim stick)  (required for ball rounds)
   power: 0..1          kick power                          (required for ball rounds)
   first: 1             aim early and kick first time on arrival */
function makeBot(sc) {
  const st = { wp: 0, hold: 0 };
  function aimAt(me, tx, ty, power) {
    const dx = tx - me.x, dy = ty - me.y, d = Math.hypot(dx, dy) || 1;
    return { charging: true, aim: true, ax: dx / d, ay: dy / d, power };
  }
  return function (S) {
    const i = S.live, me = S.att[i], t = S.tick;
    if (sc.decoy) {
      if (st.wp < sc.decoy.length) {
        const w = sc.decoy[st.wp];
        if (Math.hypot(w[0] - me.x, w[1] - me.y) < 0.8) st.wp++;
        return goTo(me, w[0], w[1]);
      }
      return { done: true };
    }
    if (S.liveKickTick >= 0) return {};
    if (S.ball.owner === i) {
      if (!sc.first && st.wp < (sc.carry || []).length) {
        const w = sc.carry[st.wp];
        if (Math.hypot(w[0] - me.x, w[1] - me.y) < 0.8) st.wp++;
        return goTo(me, w[0], w[1]);
      }
      // a human needs a moment to set the aim stick: hold the aim for 12 ticks, then release
      if (st.hold < (sc.first ? 2 : 12)) { st.hold++; return Object.assign({ mx: 0, my: 0 }, aimAt(me, sc.kickAt[0], sc.kickAt[1], sc.power)); }
      return { release: true };
    }
    if (S.ball.owner < 0 && S.chain[S.chainPos + 1] === i && sc.spot) {
      const b = S.ball, d = Math.hypot(b.x - me.x, b.y - me.y);
      let g;
      if (d < (sc.grab || 4.5) || Math.hypot(b.vx, b.vy) < 4) g = goTo(me, b.x + b.vx * 0.12, b.y + b.vy * 0.12);
      else g = t >= (sc.start || 0) ? goTo(me, sc.pre[0][0], sc.pre[0][1]) : { mx: 0, my: 0 };
      return g;
    }
    if (S.ball.owner < 0 && S.chain[S.chainPos + 1] === i) return chase(S, me, Math.max(0, (sc.meet || 0) - (S.tick - S.ball.kickTick) / 60));
    if (sc.pre && t >= (sc.start || 0)) return goTo(me, sc.pre[0][0], sc.pre[0][1]);
    return {};
  };
}
module.exports = { makeBot };
