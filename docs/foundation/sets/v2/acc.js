// acceptance per template: node acc.js ROOT TEMPLATES N OUT   (one attempt per seed, seeds 5001..5000+N, ordinary band)
const [root, tpls, N, out] = process.argv.slice(2);
const G = require(root + '/tools/gen/generate.js'), fs = require('fs');
for (const t of tpls.split(',')) for (let s = 5001; s < 5001 + +N; s++) {
  const stats = {}, t0 = Date.now();
  let r; try { r = G.generate({ seed: s, band: 'ordinary', template: t, maxAttempts: 1, stats }); } catch (e) { r = { ok: false, rejects: [{ stage: 'error', why: String(e) }] }; }
  const rec = { t, seed: s, ok: r.ok, ms: Date.now() - t0, why: r.ok ? null : (r.rejects[0].stage + ': ' + r.rejects[0].why) };
  if (r.ok) rec.m = { clock: r.level.time, model: r.checks.final.A6.median, nDef: r.level.def.length };
  fs.appendFileSync(out, JSON.stringify(rec) + '\n');
}
