// Bot solutions for pack 8, one array per level, one entry per round.
module.exports = [
  // Up, back and through
  [
    { carry: [], kickAt: [26.5, 32], power: 0.6 },
    { start: 10, pre: [[26.5, 31.5]], spot: 1, grab: 2.5, first: 1, kickAt: [31, 34.5], power: 0.12 },
    { start: 40, pre: [[31.2, 34.8]], spot: 1, first: 1, kickAt: [32, 17], power: 0.82 },
    { start: 57, pre: [[35, 21]], meet: 0.4, carry: [[29, 12]], kickAt: [22, 0], power: 1 }
  ],
  // Between the lines
  [
    { carry: [], kickAt: [26, 52.6], power: 0.3 },
    { start: 0, pre: [[26, 52.6]], spot: 1, first: 1, kickAt: [36.5, 47.8], power: 0.35 },
    { start: 0, pre: [[36.5, 47.8]], spot: 1, carry: [[32, 44.5]], kickAt: [27.5, 27], power: 0.6 },
    { start: 0, pre: [[27.5, 27]], spot: 1, carry: [[25.6, 19.2]], kickAt: [21.7, 0], power: 1 }
  ],
  // Draw the keeper
  [
    { carry: [], kickAt: [33.5, 43.6], power: 0.35 },
    { start: 0, pre: [[33.5, 43.6]], spot: 1, carry: [[34.5, 36]], kickAt: [39, 14], power: 0.7 },
    { start: 142, pre: [[38.7, 16]], spot: 1, grab: 2.5, carry: [[33.5, 9]], kickAt: [27.5, 6.5], power: 1 },
    { start: 184, pre: [[27.8, 6.8]], spot: 1, grab: 2.5, first: 1, kickAt: [24, 0], power: 1 }
  ],
  // Short then long
  [
    { carry: [], kickAt: [24, 48.6], power: 0.3 },
    { start: 0, pre: [[24, 48.6]], spot: 1, first: 1, kickAt: [35.5, 43.8], power: 0.35 },
    { start: 0, pre: [[35.5, 43.8]], spot: 1, carry: [[33.5, 41.5]], kickAt: [31.2, 19], power: 0.7 },
    { start: 126, pre: [[27.5, 32]], meet: 0.8, carry: [[33.5, 14.5]], kickAt: [22.8, 0], power: 1 }
  ],
  // Bend the run
  [
    { decoy: [[37, 32]] },
    { carry: [], kickAt: [22.5, 50.6], power: 0.3 },
    { start: 0, pre: [[22.5, 50.6]], spot: 1, first: 1, kickAt: [26, 42.5], power: 0.3 },
    { start: 60, pre: [[26, 42.5]], spot: 1, grab: 2.5, first: 1, kickAt: [27.5, 17], power: 1 },
    { start: 6, pre: [[22, 30.4]], meet: 0.5, carry: [[26, 11]], kickAt: [28.1, 0], power: 1 }
  ],
  // From distance
  [
    { decoy: [[35, 18]] },
    { decoy: [[14, 27]] },
    { carry: [], kickAt: [29.5, 48.7], power: 0.3 },
    { start: 0, pre: [[29.5, 48.7]], spot: 1, first: 1, kickAt: [27, 39], power: 0.3 },
    { start: 0, pre: [[27, 39]], spot: 1, carry: [[25.5, 20.5]], kickAt: [28.4, 0], power: 1 }
  ],
  // The reverse pass
  [
    { decoy: [[30, 7]] },
    { carry: [[26, 43]], kickAt: [38.5, 32], power: 0.55 },
    { start: 25, pre: [[38.5, 32]], spot: 1, grab: 2.5, first: 1, kickAt: [45.5, 13], power: 0.6 },
    { start: 30, pre: [[44.5, 16]], meet: 0.3, carry: [[45.5, 8], [45, 5]], kickAt: [31, 17.9], power: 0.7 },
    { start: 240, pre: [[31, 17.9]], spot: 1, grab: 2.5, first: 1, kickAt: [21.8, 0], power: 1 }
  ],
  // Total football
  [
    { decoy: [[17, 35]] },
    { decoy: [[39, 30]] },
    { carry: [], kickAt: [31.5, 42.8], power: 0.4 },
    { start: 0, pre: [[31.5, 42.8]], spot: 1, first: 1, kickAt: [30.5, 20], power: 0.85 },
    { start: 4, pre: [[30.2, 20.5]], spot: 1, grab: 2.5, carry: [[32.5, 14]], kickAt: [22.9, 0], power: 1 }
  ]
];
