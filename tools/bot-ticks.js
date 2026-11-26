// node tools/bot-ticks.js > out.json
// Every level's bot run, round by round, to the tick: status, reason and tick count of each round, and the replay's.
// Used to prove that presentation changes (game feel holds, the replay, the HUD) leave the simulation untouched:
// run it before and after a change and compare the two files (`node tools/bot-ticks.js --diff before.json after.json`).
const fs = require('fs');
const args = process.argv.slice(2);
if (args[0] === '--diff') {
  const a = JSON.parse(fs.readFileSync(args[1], 'utf8')), b = JSON.parse(fs.readFileSync(args[2], 'utf8'));
  let same = 0, diff = 0;
  a.forEach((x, i) => { if (JSON.stringify(x) === JSON.stringify(b[i])) same++; else { diff++; console.log('DIFF L' + (i + 1), JSON.stringify(x), JSON.stringify(b[i])); } });
  if (a.length !== b.length) { diff++; console.log('level count differs', a.length, b.length); }
  console.log(same + ' identical, ' + diff + ' different');
  process.exit(diff ? 1 : 0);
}
const { FB, SCRIPTS } = require('./load.js');
const { makeBot } = require('./bots.js');
const out = FB.LEVELS.map((L, li) => {
  const recs = L.att.map(() => null), sc = SCRIPTS[li], rounds = [];
  if (!sc) return { id: L.id, none: true };
  for (let r = 0; r < L.order.length; r++) {
    const live = L.order[r], S = FB.makeSim(L, recs, live), bot = makeBot(sc[r]);
    while (S.status === 'play') FB.step(S, bot(S));
    rounds.push([S.status, S.reason, S.tick]);
    if (S.status === 'fail') return { id: L.id, rounds };
    recs[live] = FB.finalRec(S);
  }
  const R = FB.makeSim(L, recs, -1);
  while (R.status === 'play') FB.step(R, {});
  return { id: L.id, rounds, replay: [R.status, R.reason, R.tick] };
});
process.stdout.write(JSON.stringify(out, null, 0).replace(/\},\{/g, '},\n{') + '\n');
