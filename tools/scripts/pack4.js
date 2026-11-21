// Bot solutions for pack 4, one array per level, one entry per round.
module.exports = [
  // Short corner
  [
    { carry: [], kickAt: [43, 8], power: 0.1 },
    { start: 0, pre: [[43, 8.5]], spot: 1, carry: [[39, 13]], kickAt: [29, 14], power: 0.4 },
    { start: 100, pre: [[28.5, 14]], spot: 1, grab: 2.5, first: 1, kickAt: [21.8, 0], power: 1 }
  ],
  // Near-post corner
  [
    { decoy: [[30, 9]] },
    { carry: [[4.5, 4.5]], kickAt: [20, 7.5], power: 0.95 },
    { start: 50, pre: [[20.5, 7.5]], spot: 1, grab: 2.5, first: 1, kickAt: [21.8, 0], power: 1 }
  ],
  // Free-kick lay-off
  [
    { decoy: [[36, 16]] },
    { carry: [], kickAt: [26, 16.2], power: 0.1 },
    { start: 0, pre: [[26, 16]], spot: 1, grab: 2.5, first: 1, kickAt: [28.2, 0], power: 1 }
  ]
];
