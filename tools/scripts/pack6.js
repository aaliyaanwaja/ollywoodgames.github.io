// Bot solutions for pack 6, one array per level, one entry per round.
module.exports = [
  // The set-back
  [
    { carry: [[36.5, 39]], kickAt: [26.4, 17], power: 0.8 },
    { start: 100, pre: [[26.8, 18.6]], spot: 1, first: 1, kickAt: [21.5, 20.4], power: 0.15 },
    { start: 90, pre: [[22, 20]], spot: 1, first: 1, kickAt: [21.7, 0], power: 1 }
  ],
  // Square ball
  [
    { carry: [[25, 44]], kickAt: [42.5, 31.5], power: 0.6 },
    { start: 0, pre: [[42.5, 31.5]], spot: 1, carry: [[37.5, 20.5]], kickAt: [25, 19.9], power: 0.5 },
    { start: 165, pre: [[25.5, 19.9]], spot: 1, first: 1, kickAt: [28.3, 0], power: 1 }
  ],
  // The dummy run
  [
    { decoy: [[15, 10]] },
    { carry: [], kickAt: [24.5, 41.5], power: 0.3 },
    { start: 0, pre: [[24.5, 41.5]], spot: 1, carry: [[24.5, 39]], kickAt: [25.5, 19], power: 0.8 },
    { start: 0, pre: [[25.5, 18.7]], spot: 1, grab: 2.2, first: 1, kickAt: [21.8, 0], power: 1 }
  ],
  // Draw the centre-half
  [
    { carry: [[33, 42]], kickAt: [23, 30.5], power: 0.5 },
    { start: 0, pre: [[23, 30.5]], spot: 1, carry: [[21.5, 19]], kickAt: [31, 18.5], power: 0.3 },
    { start: 0, pre: [[31.2, 18.3]], spot: 1, first: 1, kickAt: [28.4, 0], power: 1 }
  ],
  // The early cross
  [
    { carry: [[32, 38]], kickAt: [44, 22.5], power: 0.5 },
    { start: 0, pre: [[44, 22.5]], spot: 1, carry: [[43.5, 17]], kickAt: [30, 8], power: 0.7 },
    { start: 150, pre: [[30, 8.5]], spot: 1, first: 1, kickAt: [28.3, 0], power: 1 }
  ],
  // The knock-down
  [
    { carry: [[14.5, 42.5]], kickAt: [32.5, 21], power: 1 },
    { start: 95, pre: [[32.2, 20]], spot: 1, grab: 2.2, first: 1, kickAt: [27, 18.2], power: 0.08 },
    { start: 25, pre: [[26.6, 18.4]], spot: 1, first: 1, kickAt: [21.8, 0], power: 1 }
  ],
  // Across the keeper
  [
    { decoy: [[20.6, 8.5]] },
    { carry: [], kickAt: [8, 27.5], power: 0.6 },
    { start: 0, pre: [[8, 27.5]], spot: 1, carry: [[21.2, 17.8]], kickAt: [28.5, 0], power: 1 }
  ],
  // One-touch move
  [
    { carry: [], kickAt: [20, 19], power: 0.85 },
    { start: 50, pre: [[20, 19]], spot: 1, grab: 2.5, first: 1, kickAt: [25, 22.5], power: 0.15 },
    { start: 60, pre: [[25.2, 22.7]], spot: 1, first: 1, kickAt: [30.5, 19.3], power: 0.15 },
    { start: 60, pre: [[30.6, 19.7]], spot: 1, first: 1, kickAt: [28.45, 0], power: 1 }
  ]
];
