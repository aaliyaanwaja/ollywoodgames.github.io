// Builds rating set B: one file that sets window.OMT_LEVELS to 12 blind-labelled test fixtures.
const fs = require('fs'), vm = require('vm');
function load(files) { const ctx = { window: {} }; ctx.self = ctx.window; vm.createContext(ctx);
  for (const f of files) vm.runInContext(fs.readFileSync(f, 'utf8').replace(/\(typeof window[^)]*\)|\(this\)|\(window\)/g, '(window)'), ctx);
  return ctx.window.OMT_LEVELS; }
const B = load([1, 2, 3].map(n => '/home/claude/sets/base/pack' + n + '.js'));
const T = load([1, 2, 3, 4, 5, 6, 7, 8].map(n => 'one-man-team/js/levels/pack' + n + '.js'));
if (B.length !== 20 || T.length !== 60) throw new Error('loaded ' + B.length + ' / ' + T.length);
const clone = o => JSON.parse(JSON.stringify(o));
const cover = L => { L.def.push({ t: 'zone', x: 25, y: 10, spd: 5.4, eng: 7, agg: 0.8, leash: 9 }); return L; };
const plus2 = L => { L.time += 2; return L; };
const items = [
  ['10', B[9]], ['10 + cover', cover(clone(B[9]))],
  ['13', B[12]], ['13 + cover', cover(clone(B[12]))],
  ['18', B[17]], ['18 + cover', cover(clone(B[17]))],
  ['today 60', T[59]], ['19', B[18]],
  ['9', B[8]], ['9 + 2s', plus2(clone(B[8]))],
  ['20', B[19]], ['20 + 2s', plus2(clone(B[19]))]
];
// fixed shuffle (seeded) with no two versions of the same fixture next to each other
let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
let order;
for (;;) { order = items.map((_, i) => i).sort(() => rnd() - 0.5);
  const base = i => items[i][0].split(' ')[0];
  if (order.every((v, k) => k === 0 || base(v) !== base(order[k - 1]))) break; }
const out = order.map((i, k) => { const L = clone(items[i][1]); L.name = 'Test ' + String(k + 1).padStart(2, '0'); L.key = items[i][0]; return L; });
fs.writeFileSync('/home/claude/sets/setB/levels.js', '(function (root) { root.OMT_LEVELS = ' + JSON.stringify(out) + '; })(typeof window !== "undefined" ? window : globalThis);\n');
fs.writeFileSync('/home/claude/sets/setB/key.txt', out.map(L => L.name + ' = ' + L.key + '  (clock ' + L.time + 's, defenders ' + L.def.length + ')').join('\n') + '\n');
console.log(fs.readFileSync('/home/claude/sets/setB/key.txt', 'utf8'));
