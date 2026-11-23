// How much room for error does each round really give? For every round, one parameter of the bot's solution at a time is
// swept while the rest stay exact, and the width of the range that still succeeds is reported:
//   timing  seconds the run's start can move      aim  degrees the kick's direction can turn      power  share of the power bar
// A wide window means a person will find the round easy however precise the bot's own solution looks.
// node tools/windows.js [levelNumber ...]
const { FB, SCRIPTS } = require('./load.js');
const { makeBot } = require('./bots.js');
const LEVELS = FB.LEVELS;
const play = (L, recs, live, sc) => { const S = FB.makeSim(L, recs, live), bot = makeBot(sc); while (S.status === 'play') FB.step(S, bot(S)); return S; };
function solve(li) {
  const L = LEVELS[li], recs = L.att.map(() => null), out = [];
  for (let r = 0; r < L.order.length; r++) { const live = L.order[r]; out.push(recs.slice()); const S = play(L, recs, live, SCRIPTS[li][r]); if (S.status === 'fail') return null; recs[live] = FB.finalRec(S); }
  return out;
}
const ok = (L, recs, live, sc) => play(L, recs, live, sc).status !== 'fail';
function width(test, step, max) {            // contiguous passing range around zero
  let lo = 0, hi = 0;
  for (let d = step; d <= max; d += step) { if (test(d)) hi = d; else break; }
  for (let d = step; d <= max; d += step) { if (test(-d)) lo = d; else break; }
  return lo + hi;
}
const pick = process.argv.slice(2).map(Number).filter(Boolean);
console.log('fixture                    round: timing s / aim deg / power %   (narrowest of the move in brackets)');
LEVELS.forEach((L, li) => {
  if (pick.length && !pick.includes(li + 1)) return;
  const pre = solve(li); if (!pre) return console.log(li + 1, L.name, 'NOT BEATEN');
  const cells = []; let nt = 9, na = 99, np = 999;
  L.order.forEach((live, r) => {
    const sc = SCRIPTS[li][r], recs = pre[r], c = [];
    if (sc.start !== undefined) { const w = width(d => ok(L, recs, live, Object.assign({}, sc, { start: Math.max(0, sc.start + d) })), 2, 120) / 60; c.push(w.toFixed(2) + 's'); nt = Math.min(nt, w); } else c.push('-');
    if (sc.kickAt) {
      const a0 = L.att[live], rot = deg => { const dx = sc.kickAt[0] - a0.x, dy = sc.kickAt[1] - a0.y, t = deg * Math.PI / 180; return [a0.x + dx * Math.cos(t) - dy * Math.sin(t), a0.y + dx * Math.sin(t) + dy * Math.cos(t)]; };
      const wa = width(d => ok(L, recs, live, Object.assign({}, sc, { kickAt: rot(d) })), 0.5, 40); c.push(wa.toFixed(1) + '°'); na = Math.min(na, wa);
      const wp = width(d => { const p = sc.power + d; return p >= 0.02 && p <= 1 && ok(L, recs, live, Object.assign({}, sc, { power: p })); }, 0.01, 1) * 100; c.push(Math.round(wp) + '%'); np = Math.min(np, wp);
    } else c.push('-', '-');
    cells.push(c.join(' / '));
  });
  console.log(String(li + 1).padStart(2), L.name.padEnd(22), cells.join('  |  '), `  [${nt === 9 ? '-' : nt.toFixed(2) + 's'} / ${na === 99 ? '-' : na.toFixed(1) + '°'} / ${np === 999 ? '-' : Math.round(np) + '%'}]`);
});
