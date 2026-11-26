// node tools/kit-check.js
// Kit legibility check for the campaign team (design plan, change 4). Warns when an opposition kit pairs a near-white
// with a near-black (their banded rim then reads as the ball; render.js draws such kits with a silver rim as a guard),
// and when a kit (ours, theirs or the keeper's) has no colour at 1.5:1 or more against the felt, so the whole figure would
// sink into the cloth. Colours under 3:1 are listed as notes only: the house palette itself has mustard (2.8:1) and sky
// under 3:1, and figures rely on their 2px ink outline for that (review, "Readability"). Exit code 1 on any warning.
const { FB } = require('./load.js');
require('../one-man-team/js/levels/story.js');
const FELT = '#2F7D4F';
function lum(hex) {
  let h = String(hex).replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const f = i => { const v = parseInt(h.substr(i, 2), 16) / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(0) + 0.7152 * f(2) + 0.0722 * f(4);
}
const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
let warn = 0, notes = 0;
FB.LEVELS.forEach((L, i) => {
  const k = L.kit || {}, them = k.them || [], us = k.us || [], tag = 'L' + (i + 1) + ' ' + L.name + (L.story ? ' v ' + L.story.opp : '');
  if (them.length === 2) {
    const a = lum(them[0]), b = lum(them[1]);
    if ((a > 0.8 && b < 0.03) || (b > 0.8 && a < 0.03)) { warn++; console.log('WARN ' + tag + ': near-white with near-black (' + them.join(', ') + ')'); }
  }
  // a figure needs at least one colour that stands off the felt; the outline carries the rest
  [['ours', us], ['theirs', them], ['keeper', k.gk ? [k.gk] : []]].forEach(([who, pair]) => {
    if (!pair.length) return;
    const best = Math.max(...pair.map(c => contrast(c, FELT)));
    if (best < 1.5) { warn++; console.log('WARN ' + tag + ': ' + who + ' kit ' + pair.join(', ') + ' sinks into the felt (best ' + best.toFixed(2) + ':1)'); }
    else if (best < 3) notes++;
  });
});
console.log(FB.LEVELS.length + ' fixtures checked, ' + warn + ' warning' + (warn === 1 ? '' : 's') + ' (' + notes + ' kits whose best colour is under 3:1 against the felt, carried by the ink outline)');
process.exit(warn ? 1 : 0);
