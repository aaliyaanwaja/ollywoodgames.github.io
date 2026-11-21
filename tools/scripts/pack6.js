// Bot solutions for pack 6, one array per level, one entry per round.
module.exports = [
  // The set-back
  [
    { carry: [[36.5, 39]], kickAt: [26.4, 17], power: 0.8 },
    { start: 100, pre: [[26.8, 18.6]], spot: 1, first: 1, kickAt: [21.5, 20], power: 0.15 },
    { start: 90, pre: [[22, 20]], spot: 1, first: 1, kickAt: [21.7, 0], power: 1 }
  ],
  // Square ball
  [
    { carry: [[25, 44]], kickAt: [42.5, 31.5], power: 0.6 },
    { start: 0, pre: [[42.5, 31.5]], spot: 1, carry: [[37.5, 20.5]], kickAt: [25, 18.6], power: 0.5 },
    { start: 165, pre: [[25.5, 19.2]], spot: 1, first: 1, kickAt: [28.3, 0], power: 1 }
  ],
  // Across the keeper
  [
    { decoy: [[20.6, 8.5]] },
    { carry: [], kickAt: [8, 27.5], power: 0.6 },
    { start: 0, pre: [[8, 27.5]], spot: 1, carry: [[20.5, 17.6]], kickAt: [28.3, 0], power: 1 }
  ],
  // The knock-down
  [
    { carry: [[13.5, 46.5]], kickAt: [32.5, 21], power: 0.9 },
    { start: 60, pre: [[32.6, 21.5]], spot: 1, first: 1, kickAt: [26.5, 17.5], power: 0.1 },
    { start: 60, pre: [[26.5, 18.5]], spot: 1, first: 1, kickAt: [21.8, 0], power: 1 }
  ]
];
