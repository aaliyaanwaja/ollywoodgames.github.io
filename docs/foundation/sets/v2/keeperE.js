// set E on the engine with and without the keeper's collecting: bot route, jitter per round, keeper-ended windows
const fs = require('fs'), vm = require('vm');
const REPO = '/home/claude/ollywoodgames.github.io', lab = require(REPO + '/tools/gen/lab.js'), K = require(REPO + '/tools/gen/check.js');
const load = f => { const ctx = { window: {} }; vm.createContext(ctx); vm.runInContext(fs.readFileSync(f, 'utf8').replace(/\(typeof window[^)]*\)/, '(window)'), ctx); return JSON.parse(JSON.stringify(ctx.window.OMT_LEVELS)); };
const E = load(REPO + '/docs/foundation/sets/setE-levels.js'), ES = require(REPO + '/docs/foundation/sets/setE-scripts.js');
E.forEach((L0, i) => {
  const row = [];
  for (const on of [0, 1]) {
    const L = JSON.parse(JSON.stringify(L0)); if (!on) L.engine = { gkCollect: 0 };
    const sol = lab.solve(L, ES[i]);
    const jit = sol.ok ? K.jitter(L, ES[i], sol, 777) : [];
    const W = sol.ok ? K.windows(L, ES[i], sol) : [];
    const kp = W.filter(w => w.power && /keeper/.test(w.power.why)).length;
    row.push(`${on ? 'collect on' : 'off'}: ${sol.ok ? 'scores' : 'FAILS r' + (sol.failRound + 1) + ' ' + sol.reason} jitter ${jit.join('/')} power windows ended by the keeper ${kp}, final-pass power window ${(W.filter(w => w.power).slice(-1)[0] || {}).power ? W.filter(w => w.power).slice(-1)[0].power.w : '-'}`);
  }
  console.log(`Test ${String(i + 1).padStart(2, '0')} | ${row.join(' | ')}`);
});
