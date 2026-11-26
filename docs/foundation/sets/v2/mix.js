const fs = require('fs'), rd = fs2 => [].concat(...fs2.map(f => fs.readFileSync(f, 'utf8').trim().split('\n').map(JSON.parse)));
const B = rd(['before-a.jsonl', 'before-b.jsonl', 'before-c.jsonl', 'before-d.jsonl']), A = rd(['after-a.jsonl', 'after-b.jsonl']);
const { TEMPLATES } = require('/home/claude/ollywoodgames.github.io/tools/gen/templates.js');
const W = {}; TEMPLATES.forEach(t => W[t.id] = t);
function mix(R) {
  const acc = {}; R.forEach(r => { const a = acc[r.t] = acc[r.t] || { n: 0, ok: 0, clocks: [], models: [], nd: [] }; a.n++; if (r.ok) { a.ok++; a.clocks.push(r.m.clock); a.models.push(r.m.model); a.nd.push(r.m.nDef); } });
  // the generator draws a template by weight and stays with it for up to 4 attempts: chance it yields a level then
  const share = {}; let tot = 0;
  Object.keys(acc).forEach(k => { const a = acc[k].ok / acc[k].n, p4 = 1 - Math.pow(1 - a, 4); share[k] = W[k].weight * p4; tot += share[k]; });
  Object.keys(share).forEach(k => share[k] /= tot);
  return { acc, share };
}
const b = mix(B), a = mix(A);
const top6 = s => Object.values(s).sort((x, y) => y - x).slice(0, 6).reduce((p, v) => p + v, 0);
console.log('| Template | Weight | Before: accepted | After: accepted | Expected share of levels before | after | Defenders in accepted levels before | after | Clock before | after | Model median before | after |');
console.log('|---|---|---|---|---|---|---|---|---|---|---|---|');
const rng = v => v.length ? (Math.min(...v) === Math.max(...v) ? '' + Math.min(...v) : Math.min(...v) + '-' + Math.max(...v)) : '-';
TEMPLATES.filter(t => !t.tutorial).forEach(t => { const x = b.acc[t.id], y = a.acc[t.id];
  console.log(`| ${t.name} | ${t.weight} | ${x.ok}/${x.n} (${Math.round(100 * x.ok / x.n)}%) | ${y.ok}/${y.n} (${Math.round(100 * y.ok / y.n)}%) | ${Math.round(100 * b.share[t.id])}% | ${Math.round(100 * a.share[t.id])}% | ${rng(x.nd)} | ${rng(y.nd)} | ${rng(x.clocks)} | ${rng(y.clocks)} | ${rng(x.models)} | ${rng(y.models)} |`); });
const tb = B.filter(r => r.ok).length, ta = A.filter(r => r.ok).length;
console.log(`| All | | ${tb}/${B.length} (${Math.round(100 * tb / B.length)}%) | ${ta}/${A.length} (${Math.round(100 * ta / A.length)}%) | top six ${Math.round(100 * top6(b.share))}% | top six ${Math.round(100 * top6(a.share))}% | | | | | | |`);
