// Bot solutions for pack 7, one array per level, one entry per round.
module.exports = [
  // The overload
  [
    { carry: [], kickAt: [36, 37.5], power: 0.3 },
    { start: 0, pre: [[36, 37.5]], spot: 1, first: 1, kickAt: [24, 43.5], power: 0.4 },
    { start: 30, pre: [[24, 43.5]], spot: 1, first: 1, kickAt: [18, 15.5], power: 0.95 },
    { start: 85, pre: [[18, 15.5]], spot: 1, first: 1, kickAt: [28.2, 0], power: 1 }
  ],
  // Let it run
  [
    { carry: [], kickAt: [43.5, 29.5], power: 0.9 },
    { start: 0, pre: [[43.5, 29.5]], spot: 1, carry: [[41.5, 20]], kickAt: [21, 17.7], power: 0.55 },
    { decoy: [[30, 18.5]] },
    { start: 200, pre: [[21.5, 17.7]], spot: 1, grab: 2.5, first: 1, kickAt: [28.2, 0], power: 1 }
  ],
  // Drag them across
  [
    { carry: [], kickAt: [37.5, 34.5], power: 0.5 },
    { start: 0, pre: [[37.5, 34.5]], spot: 1, first: 1, kickAt: [30.5, 27.5], power: 0.2 },
    { start: 30, pre: [[30.5, 27.5]], spot: 1, carry: [[27.5, 23], [19, 21]], kickAt: [32.5, 16.4], power: 0.5 },
    { start: 240, pre: [[32.5, 16.4]], spot: 1, grab: 2.5, first: 1, kickAt: [28.2, 0], power: 1 }
  ],
  // Blind-side run
  [
    { carry: [], kickAt: [33.5, 37.5], power: 0.4 },
    { start: 0, pre: [[33.5, 37.5]], spot: 1, first: 1, kickAt: [45.5, 15], power: 0.75 },
    { start: 55, pre: [[45.5, 20]], meet: 0.3, carry: [[45.8, 12], [45.8, 5.5]], kickAt: [19.5, 9.5], power: 0.95 },
    { start: 345, pre: [[20, 9.5]], spot: 1, grab: 2.5, first: 1, kickAt: [21.8, 0], power: 1 }
  ],
  // The underlap
  [
    { carry: [], kickAt: [43.5, 31], power: 0.85 },
    { start: 0, pre: [[43.5, 31]], spot: 1, first: 1, kickAt: [39, 28.5], power: 0.15 },
    { start: 40, pre: [[39, 28]], spot: 1, grab: 3, carry: [[40.5, 14], [41.5, 5]], kickAt: [30, 13], power: 0.55 },
    { start: 240, pre: [[30, 13.5]], spot: 1, grab: 2.5, first: 1, kickAt: [23.8, 0], power: 1 }
  ],
  // Draw them out
  [
    { carry: [], kickAt: [20.5, 32], power: 0.2 },
    { start: 0, pre: [[20.5, 32]], spot: 1, first: 1, kickAt: [28.5, 38], power: 0.2 },
    { start: 0, pre: [[28.5, 38]], spot: 1, first: 1, kickAt: [26, 8], power: 1 },
    { start: 20, pre: [[25, 21.3]], meet: 0.9, carry: [[26, 10]], kickAt: [28.2, 0], power: 1 }
  ],
  // Inside the full-back
  [
    { carry: [], kickAt: [18.5, 35], power: 0.4 },
    { start: 0, pre: [[18.5, 35]], spot: 1, carry: [[19, 32]], kickAt: [25.5, 24.5], power: 0.5 },
    { start: 100, pre: [[25.5, 24.5]], spot: 1, grab: 2.5, first: 1, kickAt: [32.5, 8.5], power: 0.5 },
    { start: 130, pre: [[32.5, 9.5]], spot: 1, grab: 2.5, first: 1, kickAt: [28.3, 0], power: 1 }
  ],
  // Crossover runs
  [
    { decoy: [[29.5, 6.5]] },
    { carry: [], kickAt: [17.5, 36.5], power: 0.4 },
    { start: 0, pre: [[17.5, 36.5]], spot: 1, first: 1, kickAt: [4.5, 15], power: 0.75 },
    { start: 55, pre: [[4.5, 20]], meet: 0.3, carry: [[4.2, 12], [4.2, 8.5]], kickAt: [21, 9.5], power: 0.8 },
    { start: 325, pre: [[21, 9.5]], spot: 1, grab: 2.5, first: 1, kickAt: [21.8, 0], power: 1 }
  ]
];
