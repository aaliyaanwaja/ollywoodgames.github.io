// Bot solutions for pack 8, one array per level, one entry per round.
module.exports = [
  // Short then long
  [
    { carry: [], kickAt: [24, 48.6], power: 0.3 },
    { start: 0, pre: [[24, 48.6]], spot: 1, first: 1, kickAt: [35.5, 43.8], power: 0.35 },
    { start: 0, pre: [[35.5, 43.8]], spot: 1, carry: [[33.5, 41.5]], kickAt: [31.2, 19], power: 0.7 },
    { start: 126, pre: [[27.5, 32]], meet: 0.8, carry: [[31, 16.5]], kickAt: [28.2, 0], power: 1 }
  ],
  // Up, back and through
  [
    { carry: [], kickAt: [26.5, 32], power: 0.6 },
    { start: 10, pre: [[26.5, 31.5]], spot: 1, grab: 2.5, first: 1, kickAt: [31, 34.5], power: 0.12 },
    { start: 40, pre: [[31.2, 34.8]], spot: 1, first: 1, kickAt: [31.5, 17], power: 0.6 },
    { start: 100, pre: [[31.5, 18]], spot: 1, grab: 2.5, carry: [[28.5, 11]], kickAt: [22, 0], power: 1 }
  ]
];
