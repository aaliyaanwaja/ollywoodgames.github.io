const fs = require('fs'), vm = require('vm');
function load(files) { const ctx = { window: {} }; ctx.self = ctx.window; vm.createContext(ctx);
  for (const f of files) vm.runInContext(fs.readFileSync(f, 'utf8'), ctx); return ctx.window.OMT_LEVELS; }
const B = load([1, 2, 3].map(n => '/home/claude/sets/base/pack' + n + '.js'));
const T = load([1, 2, 3, 4, 5, 6, 7, 8].map(n => '/home/claude/ollywoodgames.github.io/one-man-team/js/levels/pack' + n + '.js'));
const clone = o => JSON.parse(JSON.stringify(o));
const A = { recSpd: 7.0, dangerR: 24 }, AB = { recSpd: 7.0, dangerR: 24, gkBisect: 1, gkNear: 0.2 };
const items = [];
for (const [lab, L] of [['10', B[9]], ['13', B[12]], ['19', B[18]], ['today 60', T[59]]])
  for (const [v, e] of [['as now', null], ['A', A], ['A+B', AB]]) { const c = clone(L); if (e) c.engine = e; items.push([lab + ' ' + v, c, lab]); }
let s = 11; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647; let order;
for (;;) { order = items.map((_, i) => i).sort(() => rnd() - 0.5); if (order.every((v, k) => k === 0 || items[v][2] !== items[order[k - 1]][2])) break; }
const out = order.map((i, k) => { const L = clone(items[i][1]); L.name = 'Test ' + String(k + 1).padStart(2, '0'); L.key = items[i][0]; return L; });
fs.writeFileSync('/home/claude/sets/setC/levels.js', '(function (root) { root.OMT_LEVELS = ' + JSON.stringify(out) + '; })(typeof window !== "undefined" ? window : globalThis);\n');
const key = out.map(L => L.name + ' = ' + L.key).join('\n'); fs.writeFileSync('/home/claude/sets/setC/key.txt', key + '\n'); console.log(key);
