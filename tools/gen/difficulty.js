// Difficulty estimate for the generator, version 2 (docs/foundation/20-keeper-and-generator-v2.md, part 2).
//
// The human model alone ranks the owner's rated levels poorly (rank correlation with his takes +0.27 over 56 rated plays
// in sets A-E; +0.11 out of sample on sets B-E). Doc 07 found that his takes go with how tight the DESIGNED route is: the
// model does not follow the designed route (it improvises passes and decoy runs), he does. So the estimate combines the
// model with four measures of the bot route and the clock, equal weights fixed in advance from doc 07 (not fitted):
//
//   log(model median)                   the human model, owner profile
//   J1 tight middle touches             lanes 2 m or less, receivers closed to 3.5 m in the 0.47 s after control
//   - closest defender at any reception (m)
//   - tightest passing lane (m)
//   touches before the last player with under 0.6 s to spare on the ball
//   bot move time / clock
//
// Each is turned into a z-score against the 56 rated plays (REF), the six are averaged, and the average is mapped to
// takes with the line fitted on his 33 first plays: takes = exp(A + B * z). Left out one set at a time, it ranks his
// takes at +0.46 against +0.27 for the model alone, but it is still about a factor of 2 out on a typical level.
'use strict';
const REF = {
  model: [1.4512, 0.5829], j1: [1.4286, 1.2227], recv: [-2.3552, 1.5267], lane: [-2.353, 1.4356], spare: [0.7321, 0.7674], ratio: [0.5932, 0.0707]
};
const A = 1.4763, B = 0.7868;

// the route terms from the generator's dynamic checks (check.js dynamicChecks): they do not depend on the clock
function routeTerms(D) {
  const lanes = (D.J1 && D.J1.lanes) || [], press = ((D.J1 && D.J1.receiverPress) || []).concat(D.J5close !== undefined ? [D.J5close] : []);
  const spare = (D.W || []).filter(w => !w.last && w.dwell !== undefined && w.dwell < 0.6).length;
  return { j1: D.J1 ? D.J1.count : 0, recvMin: press.length ? Math.min(...press) : 6, laneMin: lanes.length ? Math.min(...lanes) : 6, spare };
}
function estimate(modelMedian, terms, bot, clock) {
  const v = {
    model: Math.log(Math.max(1, modelMedian)), j1: terms.j1, recv: -Math.min(terms.recvMin, 6), lane: -Math.min(terms.laneMin, 6),
    spare: terms.spare, ratio: bot / clock
  };
  let z = 0; for (const k in REF) z += (v[k] - REF[k][0]) / REF[k][1];
  z /= Object.keys(REF).length;
  return { z: Math.round(z * 1000) / 1000, takes: Math.round(Math.exp(A + B * z) * 10) / 10 };
}
module.exports = { REF, A, B, routeTerms, estimate };
