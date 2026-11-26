// Rulebook 8.1 checks on all ten tests of set E (blind order), generated and hand-built alike, with the generator's
// checker (tools/gen/check.js). Controls are checked as ordinary levels at fixture 9 (A+B), as the generated ones.
'use strict';
const fs = require('fs'), path = require('path');
const REPO = '/home/claude/ollywoodgames.github.io';
const K = require(REPO + '/tools/gen/check.js'), G = require(REPO + '/tools/gen/generate.js'), T = require(REPO + '/tools/gen/templates.js');
global.OMT_LEVELS = undefined; delete require.cache[require.resolve('./levels.js')];
const g = {}; (function () { const root = g; eval(fs.readFileSync(path.join(__dirname, 'levels.js'), 'utf8').replace('typeof window !== "undefined" ? window : globalThis', 'root')); })();
const LEVELS = g.OMT_LEVELS, SC = require('./scripts.js'), design = require('./design.json');
const keyOf = L => design.find(d => JSON.stringify(Object.assign({}, d.level, { name: '' })) === JSON.stringify(Object.assign({}, L, { name: '' })));
const tplByName = n => T.TEMPLATES.find(t => t.name === n);
const lines = [], rows = [];
LEVELS.forEach((L0, i) => {
  const L = JSON.parse(JSON.stringify(L0)), d = keyOf(L0), tpl = tplByName(d.template) || {};
  const band = G.bandFor(d.kind === 'control' ? 'ordinary' : d.band);
  const ctx = { fixture: 9, band, tpl, runner: tpl.cutback ? undefined : L.order.length - 1 };
  const st = K.staticChecks(L, ctx);
  const time = L.time; L.time = 20; const dy = K.dynamicChecks(L, SC[i], ctx); L.time = time;
  const fi = K.finalChecks(L, SC[i], Object.assign({ novice: false }, ctx), 1);
  rows.push({ test: L0.name, key: d.key, st, dy, fi });
  lines.push(`== ${L0.name}  ${d.key}`);
  lines.push(`   clock ${L.time}s bot ${fi.bot}s ratio ${fi.ratio} slack ${fi.slack}; line y ${st.yL}; roles: ${st.roles.join('; ')}`);
  lines.push(`   static: ${st.fails.length ? 'FAIL ' + st.fails.join(' / ') : 'pass'}${st.notes.length ? ' (notes: ' + st.notes.join(' / ') + ')' : ''}`);
  if (dy.J1) {
    lines.push(`   J1 lanes ${dy.J1.lanes.join(', ')} | receiver press ${dy.J1.receiverPress.join(', ')} | tight touches ${dy.J1.count}`);
    if (dy.J2) lines.push(`   J2 ${dy.J2.count}: ${dy.J2.list.join(', ')}`);
    lines.push(`   J3 onside by ${dy.J3.onsideBy} ahead ${dy.J3.ahead}, run window ${dy.J3.window}s, passer's nearest def ${dy.J3.passerPressed} m, line ${dy.J3.line}`);
    if (dy.owner) lines.push(`   J4 control ${dy.J4a} m; owner probe: lost ${dy.owner.lostAfterStand}s after standing at 18 m / ${dy.owner.lostAfterRecv}s after control (${dy.owner.lostHow}), corner open ${dy.owner.cornerOpen}s`);
    lines.push(`   J5 nearest defender after control ${dy.J5close} m | J6 ${dy.J6 ? 'dwell ' + dy.J6.dwell.join(', ') + ' screen-on-lane ' + dy.J6.zoneOnLane : '-'}`);
    if (dy.botShot) lines.push(`   J10 bot shot ${dy.botShot.dist} m, open ${dy.botShot.open0} m, corner open ${dy.botShot.cornerOpen}s`);
  }
  lines.push(`   dynamic: ${dy.fails.length ? 'FAIL ' + dy.fails.join(' / ') : 'pass'}${dy.notes.length ? ' (notes: ' + dy.notes.join(' / ') + ')' : ''}`);
  lines.push(`   A3 jitter ${fi.A3.join('/')}; A6 model ${fi.A6.median} (${fi.A6.p25}-${fi.A6.p75}) clears ${Math.round(fi.A6.cleared * 100)}%; J8 bump ${fi.A6.bump} out ${fi.A6.out} early ${fi.A6.early}; J9 ${fi.A6.middle.toFixed(2)}; A8 ${fi.A8}`);
  lines.push(`   final: ${fi.fails.length ? 'FAIL ' + fi.fails.join(' / ') : 'pass'}${fi.notes.length ? ' (notes: ' + fi.notes.join(' / ') + ')' : ''}`);
});
fs.writeFileSync(path.join(__dirname, 'checks-final.txt'), lines.join('\n') + '\n');
fs.writeFileSync(path.join(__dirname, 'checks-final.json'), JSON.stringify(rows, null, 1));
console.log(lines.join('\n'));
