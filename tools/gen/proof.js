#!/usr/bin/env node
// The generator's proof run: many levels across seeds and bands, every attempt counted.
//   node tools/gen/proof.js run --shard 0/2 --out /tmp/proof-0.jsonl     (one line per level asked for)
//   node tools/gen/proof.js report /tmp/proof-0.jsonl /tmp/proof-1.jsonl  (tables for docs/foundation/17-generator.md)
// The job list is fixed: 160 ordinary (seeds 1001-1160), 25 closing (2001-2025), 15 opening (3001-3015).
'use strict';
const fs = require('fs');
const cmd = process.argv[2];
const JOBS = [];
for (let s = 1001; s <= 1160; s++) JOBS.push({ band: 'ordinary', seed: s });
for (let s = 2001; s <= 2025; s++) JOBS.push({ band: 'closing', seed: s });
for (let s = 3001; s <= 3015; s++) JOBS.push({ band: 'opening', seed: s });

if (cmd === 'run') {
  const { generate } = require('./generate.js');
  const sh = (process.argv[process.argv.indexOf('--shard') + 1] || '0/1').split('/').map(Number);
  const out = process.argv[process.argv.indexOf('--out') + 1];
  const done = new Set(fs.existsSync(out) ? fs.readFileSync(out, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l).seed) : []);
  JOBS.forEach((j, i) => {
    if (i % sh[1] !== sh[0] || done.has(j.seed)) return;
    const stats = {}, t0 = Date.now();
    const o = { band: j.band, seed: j.seed, maxAttempts: 40, stats };
    if (j.band === 'opening') o.fixture = 1 + (j.seed % 4);
    if (j.band === 'opening') o.tutorialId = ['u-first', 'u-through', 'u-wing', 'u-decoy'][j.seed % 4];
    const r = generate(o);
    const rec = { band: j.band, seed: j.seed, ok: r.ok, ms: Date.now() - t0, stats, rejects: (r.rejects || []).map(x => ({ tpl: x.tpl, stage: x.stage, why: x.why })) };
    if (r.ok) {
      const F = r.checks.final, D = r.checks.dynamic, L = r.level;
      rec.template = r.meta.template; rec.tier = r.meta.tier; rec.attempts = r.meta.attempts; rec.level = L; rec.script = r.script; rec.meta = r.meta;
      rec.m = {
        clock: L.time, bot: F.bot, ratio: F.ratio, slack: F.slack, jitMin: Math.min(...F.A3), model: F.A6.median, p25: F.A6.p25, p75: F.A6.p75, cleared: F.A6.cleared,
        middle: F.A6.middle, bump: F.A6.bump, out: F.A6.out, J1: D.J1 && D.J1.count, J2: D.J2 && D.J2.count, J3on: D.J3 && D.J3.onsideBy, J3win: D.J3 && D.J3.window,
        J4a: D.J4a, J4bStand: D.owner && D.owner.lostAfterStand, J4bRecv: D.owner && D.owner.lostAfterRecv, corner: D.owner && D.owner.cornerOpen, J5: D.J5close,
        shot: D.botShot && D.botShot.dist, open: D.botShot && D.botShot.open0, yL: r.checks.static.yL, nDef: L.def.length, nBall: L.order.filter(i => L.att[i].role === 'ball').length,
        decoy: L.att.some(a => a.role === 'decoy'), spdMean: +(L.def.reduce((s, d) => s + (d.spd || 5.2), 0) / L.def.length).toFixed(2), slower: r.meta.slower,
        notes: [].concat(r.checks.static.notes, D.notes, F.notes), novice: F.novice ? F.novice.beyond30 : null
      };
    }
    fs.appendFileSync(out, JSON.stringify(rec) + '\n');
    console.log(`${j.band} ${j.seed}: ${r.ok ? r.meta.template + ' after ' + r.meta.attempts : 'none'} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  });
} else if (cmd === 'report') {
  const recs = [].concat(...process.argv.slice(3).map(f => fs.readFileSync(f, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l))));
  const { TEMPLATES } = require('./templates.js');
  const pct = (a, b) => b ? Math.round(100 * a / b) + '%' : '-';
  const q = (arr, p) => { const s = arr.filter(v => v !== null && v !== undefined).slice().sort((a, b) => a - b); return s.length ? s[Math.min(s.length - 1, Math.floor(p * (s.length - 1) + 0.5))] : null; };
  const f1 = v => v === null || v === undefined ? '-' : (+v).toFixed(v < 10 ? 2 : 1).replace(/\.?0+$/, '');
  console.log(`## Run: ${recs.length} levels asked for, ${recs.filter(r => r.ok).length} generated\n`);
  // acceptance per template, over all attempts in all jobs
  const T = {};
  recs.forEach(r => Object.keys(r.stats).forEach(k => { T[k] = T[k] || { a: 0, ok: 0, reasons: {} }; T[k].a += r.stats[k].attempts; T[k].ok += r.stats[k].accepted; Object.keys(r.stats[k].reasons).forEach(x => { T[k].reasons[x] = (T[k].reasons[x] || 0) + r.stats[k].reasons[x]; }); }));
  console.log('| Template | Tier | Attempts | Accepted | Acceptance | Levels in the run | Commonest rejections |');
  console.log('|---|---|---|---|---|---|---|');
  TEMPLATES.forEach(t => { const s = T[t.id]; if (!s) return; const top = Object.keys(s.reasons).sort((a, b) => s.reasons[b] - s.reasons[a]).slice(0, 3).map(k => `${k} ${pct(s.reasons[k], s.a - s.ok)}`).join('; ');
    console.log(`| ${t.name} | ${t.tier} | ${s.a} | ${s.ok} | ${pct(s.ok, s.a)} | ${recs.filter(r => r.ok && r.template === t.id).length} | ${top} |`); });
  const all = Object.values(T).reduce((a, s) => ({ a: a.a + s.a, ok: a.ok + s.ok }), { a: 0, ok: 0 });
  console.log(`| All | | ${all.a} | ${all.ok} | ${pct(all.ok, all.a)} | | |\n`);
  // time per accepted level
  ['ordinary', 'closing', 'opening'].forEach(b => { const rs = recs.filter(r => r.band === b && r.ok), ms = rs.map(r => r.ms / 1000);
    console.log(`${b}: ${rs.length}/${recs.filter(r => r.band === b).length} generated; time per level median ${f1(q(ms, 0.5))} s, quartiles ${f1(q(ms, 0.25))}-${f1(q(ms, 0.75))} s, max ${f1(Math.max(...ms))} s; attempts median ${q(rs.map(r => r.attempts), 0.5)}, max ${Math.max(...rs.map(r => r.attempts))}`); });
  // distribution of measures by band against the rulebook's ranges
  const RANGES = {
    clock: ['7-14', v => v >= 7 && v <= 14], ratio: ['<= 0.80; band', v => v <= 0.8], slack: ['band', null], jitMin: ['>= 45', v => v >= 45], J1: ['>= 1', v => v >= 1], J2: ['1-5 (closing 2-5)', null],
    J3on: ['0.3-5 m', v => v >= 0.3 && v <= 5], J3win: ['0.3-2.5 s', v => v >= 0.3 && v <= 2.5], J4a: ['14-32 m', v => v >= 14 && v <= 32], J4bStand: ['<= 1.0 s', v => v <= 1.0], J4bRecv: ['<= 2.5 s', v => v <= 2.5],
    corner: ['(owner: corner time)', null], J5: ['<= 6.5 m', v => v <= 6.5], shot: ['bot shot, m', null], open: ['>= 1 m', v => v >= 1], middle: ['J9 0.3-0.7 (flag)', v => v >= 0.3 && v <= 0.7], spdMean: ['band', null], nDef: ['slot', null], nBall: ['2-5', v => v >= 2 && v <= 5], yL: ['18-33', v => v >= 18 && v <= 33]
  };
  ['ordinary', 'closing', 'opening'].forEach(b => {
    const rs = recs.filter(r => r.band === b && r.ok); if (!rs.length) return;
    console.log(`\n### ${b} (${rs.length} levels): median, 10th-90th percentile, min-max\n`);
    console.log('| Measure | Rulebook | Median | 10-90% | Min-max | Inside |'); console.log('|---|---|---|---|---|---|');
    Object.keys(RANGES).forEach(k => { const v = rs.map(r => r.m[k]).filter(x => x !== null && x !== undefined); if (!v.length) return; const [lab, fn] = RANGES[k];
      console.log(`| ${k} | ${lab} | ${f1(q(v, 0.5))} | ${f1(q(v, 0.1))}-${f1(q(v, 0.9))} | ${f1(Math.min(...v))}-${f1(Math.max(...v))} | ${fn ? pct(v.filter(fn).length, v.length) : ''} |`); });
    const md = rs.map(r => r.m.model);
    const want = b === 'ordinary' ? [3, 7] : b === 'closing' ? [6, 14] : [1, 2.5];
    console.log(`\nHuman model (owner profile, 30 runs) median takes: ${md.filter(v => v >= want[0] && v <= want[1]).length} of ${md.length} inside the band's model range ${want.join('-')} (owner target ${b === 'ordinary' ? '3-8' : b === 'closing' ? '8-15' : '1-2'}); distribution ` +
      [...new Set(md)].sort((a, c) => a - c).map(v => `${v}: ${md.filter(x => x === v).length}`).join(', '));
    const byT = {}; rs.forEach(r => { (byT[r.template] = byT[r.template] || []).push(r.m.model); });
    console.log('By template (median of the model medians): ' + Object.keys(byT).map(k => `${k} ${q(byT[k], 0.5)} (${byT[k].length})`).join(', '));
    const nv = rs.map(r => r.m.novice).filter(v => v !== null); if (nv.length) console.log(`Novice check (share beyond 30 takes): median ${q(nv, 0.5)}, max ${Math.max(...nv)}`);
    const notes = {}; rs.forEach(r => (r.m.notes || []).forEach(n => { const k = n.split(':')[0]; notes[k] = (notes[k] || 0) + 1; }));
    console.log('Flags and should-rule notes: ' + Object.keys(notes).map(k => `${k} ${notes[k]}`).join(', '));
  });
} else console.log('node tools/gen/proof.js run --shard i/n --out file | report files...');
