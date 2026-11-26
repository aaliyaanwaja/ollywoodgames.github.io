// An ordered run of N generated levels following the campaign ramp of RULEBOOK.md 7.3, with the owner's decisions of
// section 9 (fixtures 1-4 easy with A and B off, 5-8 B only, one closing level per season of 8-15 takes).
//
//   fixture  1-4    tutorial templates, one idea each, in order (First pass, Through ball, Down the wing, The decoy);
//                    engine { recSpd 0, dangerR 0, gkBisect 0, gkNear 0, markLeash 0 }
//   fixture  5-8    standard band, engine { recSpd 0, dangerR 0, markLeash 0 } (B only); at least two tier-1 templates
//   fixture  9-14   standard, then hard from 12 (A+B, no engine field)
//   fixture 15-19   hard, at least three tier-1 templates; fixture 20 the season's closing level (8-15 takes)
//   21 onwards      the 5-20 pattern again (a season of 16): speed band +0.1 (max 5.7), slack band -0.3 s (min 1.8)
//   breathers       every fourth level one band easier: pattern slots 12 and 16 drop to standard
// Variety (7.3): no template twice in any three levels running; the attacking side alternates; the finisher's role is not
// the same as the last level's; the back line's height band (high/medium/low) changes from one level to the next;
// no two cut-back endings running.
'use strict';
const { generate } = require('./generate.js');
const { hashSeed } = require('./rng.js');
const { BY_ID } = require('./templates.js');

const TUTORIAL = ['u-first', 'u-through', 'u-wing', 'u-decoy'];
function slot(f) {
  const season = f <= 20 ? 0 : 1 + Math.floor((f - 21) / 16);
  const p = f <= 20 ? f : 5 + ((f - 21) % 16);
  let band, tier1 = false, note = '';
  if (p <= 4) { band = 'opening'; note = 'tutorial'; }
  else if (p <= 8) { band = 'standard'; tier1 = p === 5 || p === 7; }
  else if (p <= 11) band = 'standard';
  else if (p <= 14) band = 'hard';
  else if (p <= 19) { band = 'hard'; tier1 = p === 15 || p === 17 || p === 19; }
  else { band = 'closing'; note = 'closing level of the season'; }
  if (p === 12 || p === 16) { band = 'standard'; note = 'breather (one band easier)'; }
  return { fixture: f, season, pattern: p, band, tier1, note, engineSlot: f <= 4 ? 'A and B off' : f <= 8 ? 'B only' : 'A+B' };
}

function campaign(opts) {
  const seed = opts.seed || 1, count = opts.count || 20, start = opts.start || 1, out = [], stats = opts.stats || {}, used = new Set();
  for (let f = start; f < start + count; f++) {
    const s = slot(f), prev = out.slice(-2).map(o => o.res && o.res.ok ? o.res.meta : null).filter(Boolean), last = prev[prev.length - 1];
    const avoid = { templates: prev.map(m => m.template) };
    if (last) {
      avoid.side = last.side;                       // alternate the attacking side
      avoid.finishers = [last.finisher];            // vary who finishes
      if (last.yBand && last.yBand !== 'none') avoid.yBand = last.yBand;
      if (last.ending === 'cutback') avoid.noCutback = true;
    }
    if (s.tier1) avoid.tier1 = true;
    const o = { seed: hashSeed(seed, 'fixture', f), bandId: s.band, band: s.band, fixture: f, season: s.season, avoid, stats, novice: f <= 20, maxAttempts: opts.maxAttempts || 40 };
    if (s.band === 'opening') o.tutorialId = TUTORIAL[(s.pattern - 1) % 4];
    if (opts.verbose) process.stderr.write(`fixture ${f} (${s.band}${s.note ? ', ' + s.note : ''}) ... `);
    const res = generate(o);
    if (res.ok) {
      // a short football phrase, unique in the campaign
      const tpl = BY_ID[res.meta.template], free = tpl.names.filter(n => !used.has(n));
      res.level.name = free.length ? free[0] : tpl.names[0] + ' ' + (1 + [...used].filter(n => n.startsWith(tpl.names[0])).length);
      used.add(res.level.name);
    }
    if (opts.verbose) process.stderr.write(res.ok ? `${res.level.name} (${res.meta.template}), ${res.meta.attempts} attempts, ${(res.meta.totalMs / 1000).toFixed(0)} s\n` : 'no level\n');
    out.push({ slot: s, res });
  }
  return out;
}
module.exports = { campaign, slot, TUTORIAL };
