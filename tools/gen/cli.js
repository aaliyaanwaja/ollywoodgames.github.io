#!/usr/bin/env node
// Level generator command line.
//
//   node tools/gen/cli.js --seed S --count N                       a campaign run from fixture 1 (rulebook 7.3)
//   node tools/gen/cli.js --seed S --count N --start 21            ... from fixture 21 (second season)
//   node tools/gen/cli.js --seed S --count N --band ordinary       N levels of one band: ordinary | closing | opening
//   node tools/gen/cli.js --seed S --count 1 --template trap       one template (id or name, e.g. "Beat the trap")
//   options: --out file.js   write the level pack (live format) to file.js, the bot routes to file-scripts.js
//                            (tools/scripts/packN.js format) and everything measured to file.json
//            --attempts K    attempts per level before giving up (default 40)
//            --quiet         no progress lines
// Same seed, same levels. Prints a check table: one row per level, every automatic check of rulebook 8.1.
'use strict';
const fs = require('fs'), path = require('path');
const { generate } = require('./generate.js');
const { campaign, slot } = require('./campaign.js');
const { hashSeed } = require('./rng.js');
const { BY_ID } = require('./templates.js');

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const flag = k => args.includes('--' + k);
if (flag('help') || flag('h')) { console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 13).join('\n')); process.exit(0); }
const seed = +opt('seed', 1), count = +opt('count', 1), band = opt('band'), template = opt('template'), out = opt('out'), start = +opt('start', 1);
const maxAttempts = +opt('attempts', 40), quiet = flag('quiet');
if (band && !['ordinary', 'closing', 'opening'].includes(band)) { console.error('--band must be ordinary, closing or opening'); process.exit(1); }

const t0 = Date.now(), stats = {};
let rows = [];
if (!band && !template) {
  rows = campaign({ seed, count, start, stats, maxAttempts, verbose: !quiet }).map(o => ({ slot: o.slot, res: o.res }));
} else {
  const b = band || 'ordinary', used = new Set();
  let prev = [];
  for (let k = 0; k < count; k++) {
    const last = prev[prev.length - 1];
    const avoid = { templates: prev.slice(-2).map(m => m.template) };
    if (last) { avoid.side = last.side; avoid.finishers = [last.finisher]; if (last.yBand !== 'none') avoid.yBand = last.yBand; if (last.ending === 'cutback') avoid.noCutback = true; }
    if (!quiet) process.stderr.write(`level ${k + 1} (${b}${template ? ', ' + template : ''}) ... `);
    const res = generate({ seed: count === 1 ? seed : hashSeed(seed, 'level', k), band: b, template, avoid: template ? {} : avoid, stats, maxAttempts });
    if (res.ok) {
      const tpl = BY_ID[res.meta.template], free = tpl.names.filter(n => !used.has(n));
      res.level.name = free.length ? free[0] : tpl.names[0] + ' ' + (k + 1);
      used.add(res.level.name); prev.push(res.meta);
    }
    if (!quiet) process.stderr.write(res.ok ? `${res.level.name}, ${res.meta.attempts} attempts, ${(res.meta.totalMs / 1000).toFixed(0)} s\n` : 'no level\n');
    rows.push({ slot: { fixture: res.ok ? res.meta.fixture : null, band: b }, res });
  }
}

// ------------------------------------------------------------------ check table
const f = (v, n) => v === null || v === undefined ? '-' : typeof v === 'number' ? String(+v.toFixed(n === undefined ? 1 : n)) : String(v);
const head = ['#', 'fix', 'name', 'template', 'band', 'side', 'clock', 'bot', 'ratio', 'slack', 'model (q)', 'clear', 'A1', 'A2', 'A3 jitter min', 'J1', 'J2', 'J3 onside/win', 'J4a', 'J4b lost', 'J5', 'J6', 'J7', 'J8', 'J9', 'J10 shot/open', 'A5 decoy', 'A7', 'A8'];
const table = [head];
rows.forEach((o, i) => {
  const r = o.res;
  if (!r.ok) { table.push([i + 1, o.slot.fixture || '-', 'NO LEVEL', '-', o.slot.band].concat(head.slice(5).map(() => '-'))); return; }
  const m = r.meta, S = r.checks.static, D = r.checks.dynamic, F = r.checks.final, L = r.level, A6 = F.A6;
  const dec = F.A5.length ? F.A5.map(t => `run ${t.designedRun} drag ${t.drag} ${t.needed ? 'needed' : 'NOT needed'} ${t.truncation ? 'trunc ok' : 'TRUNC FAIL'}`).join('; ') : 'none';
  table.push([i + 1, m.fixture, L.name, m.templateName, m.band, m.side, L.time, f(F.bot, 2), f(F.ratio, 2), f(F.slack, 1), `${A6.median} (${A6.p25}-${A6.p75})`, Math.round(A6.cleared * 100) + '%',
    S.fails.length ? 'FAIL' : 'pass', 'pass', Math.min(...F.A3) + '%', D.J1 ? D.J1.count : '-', D.J2 ? D.J2.count : '-', D.J3 ? `${D.J3.onsideBy}/${D.J3.window}s` : '-', f(D.J4a),
    D.owner ? `${f(D.owner.lostAfterStand, 2)}/${f(D.owner.lostAfterRecv, 2)}s` : '-', f(D.J5close), D.J6 ? (D.J6.zoneOnLane ? 'screen' : 'dwell ' + Math.min(...D.J6.dwell)) : '-', 'pass',
    `${A6.bump}/${A6.out}/${A6.early}`, f(A6.middle, 2), D.botShot ? `${D.botShot.dist}m/${D.botShot.open0}m` : '-', dec, 'pass', F.A8 ? 'pass' : 'FAIL']);
});
const w = head.map((_, c) => Math.max(...table.map(r => String(r[c]).length)));
const lines = table.map(r => r.map((v, c) => String(v).padEnd(w[c])).join(' | '));
console.log(lines[0]); console.log(w.map(n => '-'.repeat(n)).join('-|-')); lines.slice(1).forEach(l => console.log(l));
const ok = rows.filter(o => o.res.ok);
console.log(`\n${ok.length} of ${rows.length} levels generated in ${((Date.now() - t0) / 1000).toFixed(0)} s; attempts per template: ` +
  Object.keys(stats).map(k => `${k} ${stats[k].accepted}/${stats[k].attempts}`).join(', '));
const notes = []; ok.forEach((o, i) => { const n = [].concat(o.res.checks.static.notes, o.res.checks.dynamic.notes, o.res.checks.final.notes); if (n.length) notes.push(`  ${o.res.level.name}: ${n.join('; ')}`); });
if (notes.length) { console.log('notes (should-rules and flags, not rejections):'); notes.forEach(l => console.log(l)); }

// ------------------------------------------------------------------ files
if (out) {
  const levels = ok.map(o => o.res.level), scripts = ok.map(o => o.res.script);
  const cmd = 'node tools/gen/cli.js ' + args.filter(a => a !== '--quiet').join(' ');
  const pack = `/* Generated by the level generator (tools/gen, RULEBOOK.md version 1): ${cmd}\n   ${levels.length} levels. Regenerate rather than edit: the same command gives the same levels. */\n` +
    '(function (root) {\n  const L = (root.OMT_LEVELS = root.OMT_LEVELS || []);\n  L.push(\n' +
    levels.map(L => '    ' + JSON.stringify(L)).join(',\n') + '\n  );\n})(typeof module !== \'undefined\' ? global : window);\n';
  fs.writeFileSync(out, pack);
  const base = out.replace(/\.js$/, '');
  fs.writeFileSync(base + '-scripts.js', `// Bot routes for ${path.basename(out)}, one array per level, one entry per round (tools/scripts/packN.js format).\nmodule.exports = [\n` +
    ok.map(o => `  // ${o.res.level.name} (${o.res.meta.templateName})\n  ` + JSON.stringify(o.res.script)).join(',\n') + '\n];\n');
  fs.writeFileSync(base + '.json', JSON.stringify({ command: cmd, stats, levels: rows.map(o => o.res.ok ? { slot: o.slot, meta: o.res.meta, checks: o.res.checks, level: o.res.level, script: o.res.script } : { slot: o.slot, failed: true, rejects: (o.res.rejects || []).map(x => x.stage + ': ' + x.why) }) }, null, 1));
  console.log(`wrote ${out}, ${base}-scripts.js, ${base}.json`);
}
process.exit(ok.length === rows.length ? 0 : 1);
