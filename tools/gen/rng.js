// Seeded randomness for the generator (mulberry32). Same seed, same stream, on every machine.
'use strict';
function hashSeed(...parts) {
  let h = 2166136261 >>> 0;
  String(parts.join('|')).split('').forEach(c => { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; });
  return h >>> 0;
}
function makeRng(seed) {
  let a = (seed >>> 0) || 1;
  const u = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const r = {
    u,
    range: (lo, hi) => lo + (hi - lo) * u(),
    // a value in [lo, hi] rounded to `step` (levels are written with tidy numbers, as a designer would)
    step: (lo, hi, st) => { const n = Math.floor((hi - lo) / st + 1e-9); return +(lo + st * Math.floor(u() * (n + 1))).toFixed(3); },
    int: (lo, hi) => lo + Math.floor(u() * (hi - lo + 1)),
    pick: arr => arr[Math.floor(u() * arr.length)],
    chance: p => u() < p,
    weighted: items => { const tot = items.reduce((s, it) => s + it.w, 0); let x = u() * tot; for (const it of items) { x -= it.w; if (x < 0) return it.v; } return items[items.length - 1].v; },
    shuffle: arr => { const b = arr.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(u() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
  };
  return r;
}
module.exports = { makeRng, hashSeed };
