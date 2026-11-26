#!/usr/bin/env node
// The Daily Move: one generated move per date, the same for everyone, made ahead of time (retention plan, proposal 4).
//
//   node tools/gen/daily.js gen --from 1 --to 45 --out /tmp/daily-a.json     generate Daily No. 1-45 (resumable: an
//                                                                            existing --out file is kept and extended)
//   node tools/gen/daily.js write A.json B.json ...                          write the bundle and the monthly files
//   node tools/gen/daily.js dates                                            print number, date and band per day
//
// Daily No. 1 is EPOCH (a Monday, so the seven-day card lines up). Weekdays and Saturdays are the standard band
// (the owner's 3-6 takes), Sundays the hard band; never closing. Every level passes the generator's automatic checks
// (rulebook 8.1, R8 included) at its own clock, exactly like the campaign's generated levels. Seeds come from the
// daily number, so the same command always makes the same moves.
//
// `write` puts the first BUNDLE days in one-man-team/js/levels/daily.js (shipped in the app) and every later day in
// one-man-team/daily/YYYY-MM.json (one small file per calendar month, fetched from the GitHub Pages site when the bundle
// runs out, or to replace a bad day: a monthly file wins over the bundle for the same date). Bot routes go to
// tools/scripts/daily.js so `node tools/gen/daily.js check` can prove every daily is beatable.
// Each daily records ENGINE: the game skips a daily made for a newer engine than its own (engine changes alter how a
// level plays). Bump ENGINE here and DAILY_ENGINE in js/game.js together when sim.js changes behaviour.
'use strict';
const fs = require('fs'), path = require('path');
const G = require('./generate.js');
const { hashSeed } = require('./rng.js');
const { BY_ID } = require('./templates.js');

const EPOCH = '2026-11-30', BUNDLE = 90, ENGINE = 1, REPEAT = 1, FIXTURE = 21;
const REPO = path.join(__dirname, '..', '..');
const args = process.argv.slice(2), cmd = args[0];
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };

function dateOf(n) { const d = new Date(EPOCH + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n - 1); return d.toISOString().slice(0, 10); }
const bandOf = n => new Date(dateOf(n) + 'T12:00:00Z').getUTCDay() === 0 ? 'hard' : 'standard';

if (cmd === 'dates') { for (let n = 1; n <= +opt('to', 14); n++) console.log(n, dateOf(n), bandOf(n)); }

if (cmd === 'gen') {
  const from = +opt('from', 1), to = +opt('to', BUNDLE), out = opt('out'), maxAttempts = +opt('attempts', 30);
  const results = out && fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, 'utf8')) : {};
  let prev = null;
  for (let n = from; n <= to; n++) {
    if (results[n] && !results[n].failed) { prev = results[n].meta; continue; }
    const band = bandOf(n), avoid = {};
    if (prev) { avoid.templates = [prev.template]; avoid.side = prev.side; avoid.finishers = [prev.finisher]; if (prev.ending === 'cutback') avoid.noCutback = true; }
    const t0 = Date.now();
    process.stderr.write(`daily ${n} ${dateOf(n)} (${band}) ... `);
    let res = G.generate({ seed: hashSeed(2611, 'daily', n), band, bandId: band, fixture: FIXTURE, season: REPEAT, avoid, stats: {}, novice: false, maxAttempts });
    if (!res.ok) res = G.generate({ seed: hashSeed(2611, 'daily', n, 'again'), band, bandId: band, fixture: FIXTURE, season: REPEAT, avoid: {}, stats: {}, novice: false, maxAttempts });
    process.stderr.write(res.ok ? `${BY_ID[res.meta.template].name}, clock ${res.level.time}, bot ${res.checks.final.bot.toFixed(2)}, ${((Date.now() - t0) / 1000).toFixed(0)} s\n` : 'no level\n');
    if (res.ok) {
      const m = res.meta;
      results[n] = { n, date: dateOf(n), band, meta: { template: m.template, side: m.side, finisher: m.finisher, ending: m.ending, yBand: m.yBand, estimate: m.estimate, seed: m.seed, attempt: m.attempt },
        level: res.level, script: res.script, bot: +res.checks.final.bot.toFixed(2), fails: (res.checks.final.fails || []).concat(res.checks.static.fails || [], res.checks.dynamic.fails || []) };
      prev = results[n].meta;
    } else { results[n] = { n, date: dateOf(n), failed: true }; prev = null; }
    if (out) fs.writeFileSync(out, JSON.stringify(results));
  }
}

// a short name from the template's own list, not used in the last fortnight
function nameFor(tpl, n, recent) {
  const names = BY_ID[tpl].names || [BY_ID[tpl].name];
  return names.find(x => !recent.includes(x)) || names[n % names.length];
}
function entry(r, name) {
  const L = JSON.parse(JSON.stringify(r.level));
  delete L.id; L.name = name;
  return { n: r.n, date: r.date, engine: ENGINE, band: r.band, template: BY_ID[r.meta.template].name, bot: r.bot, level: L };
}

if (cmd === 'write') {
  const all = {};
  args.slice(1).filter(a => !a.startsWith('--')).forEach(f => Object.assign(all, JSON.parse(fs.readFileSync(f, 'utf8'))));
  const ns = Object.keys(all).map(Number).filter(n => !all[n].failed).sort((a, b) => a - b);
  const recent = [], bundle = [], months = {}, scripts = {};
  ns.forEach(n => {
    const r = all[n], name = nameFor(r.meta.template, n, recent.slice(-14));
    recent.push(name);
    const e = entry(r, name);
    scripts[n] = r.script;
    if (n <= BUNDLE) bundle.push(e); else (months[r.date.slice(0, 7)] = months[r.date.slice(0, 7)] || []).push(e);
  });
  const missing = []; for (let n = 1; n <= Math.max(...ns); n++) if (!ns.includes(n)) missing.push(n);
  fs.writeFileSync(path.join(REPO, 'one-man-team', 'js', 'levels', 'daily.js'),
    '/* The Daily Move, days 1-' + BUNDLE + ' (written by tools/gen/daily.js; do not edit by hand). One generated move per date, the same\n' +
    '   for everyone. Later days come from one-man-team/daily/YYYY-MM.json on the website. ' + (missing.length ? 'No daily on: ' + missing.join(', ') + '.' : '') + ' */\n' +
    '(function (root) {\n  root.OMT_DAILY = { epoch: ' + JSON.stringify(EPOCH) + ', engine: ' + ENGINE + ', days: [\n' +
    bundle.map(e => '    ' + JSON.stringify(e)).join(',\n') + '\n  ] };\n})(typeof module !== \'undefined\' ? global : window);\n');
  const dir = path.join(REPO, 'one-man-team', 'daily'); fs.mkdirSync(dir, { recursive: true });
  Object.keys(months).forEach(m => fs.writeFileSync(path.join(dir, m + '.json'), JSON.stringify({ epoch: EPOCH, engine: ENGINE, days: months[m] }) + '\n'));
  fs.writeFileSync(path.join(REPO, 'tools', 'scripts', 'daily.js'), '// Bot routes for the Daily Move, keyed by daily number (written by tools/gen/daily.js).\nmodule.exports = ' + JSON.stringify(scripts) + ';\n');
  console.log('bundle', bundle.length, 'days; monthly files', Object.keys(months).join(', ') || 'none', missing.length ? '; missing ' + missing.join(',') : '');
}

// every daily (bundle and monthly files) beaten by its bot, and its replay scores at the recorded bot time
if (cmd === 'check') {
  const { FB } = require('../load.js');
  const { makeBot } = require('../bots.js');
  global.OMT_DAILY = null; require(path.join(REPO, 'one-man-team', 'js', 'levels', 'daily.js'));
  let days = global.OMT_DAILY.days.slice();
  const dir = path.join(REPO, 'one-man-team', 'daily');
  if (fs.existsSync(dir)) fs.readdirSync(dir).filter(f => /\.json$/.test(f)).sort().forEach(f => { days = days.concat(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')).days); });
  const SC = require(path.join(REPO, 'tools', 'scripts', 'daily.js'));
  let ok = 0, bad = [];
  days.forEach(d => {
    const L = d.level, recs = L.att.map(() => null), sc = SC[d.n];
    let fail = !sc;
    for (let r = 0; !fail && r < L.order.length; r++) {
      const live = L.order[r], S = FB.makeSim(L, recs, live), bot = makeBot(sc[r]);
      while (S.status === 'play') FB.step(S, bot(S));
      if (S.status === 'fail') fail = true; else recs[live] = FB.finalRec(S);
    }
    let R = null;
    if (!fail) { R = FB.makeSim(L, recs, -1); while (R.status === 'play') FB.step(R, {}); }
    if (!fail && R.status === 'goal') ok++; else bad.push(d.n);
  });
  console.log(ok + ' of ' + days.length + ' dailies beaten by their bot' + (bad.length ? '; not beaten: ' + bad.join(', ') : ''));
  process.exit(bad.length ? 1 : 0);
}
