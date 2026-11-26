const fs = require('fs'), vm = require('vm'), REPO = '/home/claude/ollywoodgames.github.io', K = require(REPO + '/tools/gen/check.js');
const load = fs2 => { const ctx = { window: {} }; vm.createContext(ctx); fs2.forEach(f => vm.runInContext(fs.readFileSync(f, 'utf8').replace(/\(typeof window[^)]*\)/, '(window)'), ctx)); return JSON.parse(JSON.stringify(ctx.window.OMT_LEVELS)); };
const LIVE = load([1, 2, 3, 4, 5, 6, 7, 8].map(n => REPO + '/one-man-team/js/levels/pack' + n + '.js'));
const D = load([REPO + '/docs/foundation/sets/setD-levels.js']), E = load([REPO + '/docs/foundation/sets/setE-levels.js']);
const r8 = (L, fx) => K.staticChecks(L, { fixture: fx, tpl: { counter: /counter/i.test(L.name) } }).fails.filter(f => f.startsWith('R8'));
let n = 0; const bad = [];
LIVE.forEach((L, i) => { if (i < 4) return; n++; const f = r8(L, i + 1); if (f.length) bad.push(`${i + 1} ${L.name}: ${f.join('; ')}`); });
console.log(`live fixtures 5-60: ${bad.length} of ${n} would fail R8`); bad.forEach(b => console.log('  ' + b));
[['set D', D], ['set E', E]].forEach(([nm, S]) => S.forEach((L, i) => { const f = r8(L, 9); console.log(`${nm} Test ${i + 1} (${L.def.length} defenders): ${f.length ? f.join('; ') : 'pass'}`); }));
