// Bot solutions for pack 7, one array per level, one entry per round.
module.exports = [
  // The overload
  [
    { carry: [], kickAt: [36, 37.5], power: 0.3 },
    { start: 0, pre: [[36, 37.5]], spot: 1, first: 1, kickAt: [24, 43.5], power: 0.4 },
    { start: 30, pre: [[24, 43.5]], spot: 1, first: 1, kickAt: [18, 15.5], power: 0.95 },
    { start: 85, pre: [[18, 15.5]], spot: 1, first: 1, kickAt: [28.2, 0], power: 1 }
  ],
  // The underlap
  [
    { carry: [], kickAt: [43.5, 31], power: 0.85 },
    { start: 0, pre: [[43.5, 31]], spot: 1, first: 1, kickAt: [39, 28.5], power: 0.15 },
    { start: 40, pre: [[39, 28]], spot: 1, grab: 3, carry: [[40.5, 14], [41.5, 5]], kickAt: [30, 13], power: 0.55 },
    { start: 240, pre: [[30, 13.5]], spot: 1, grab: 2.5, first: 1, kickAt: [28.2, 0], power: 1 }
  ],
  // Let it run
  [
    { carry: [], kickAt: [43.5, 29.5], power: 0.9 },
    { start: 0, pre: [[43.5, 29.5]], spot: 1, carry: [[41.5, 20]], kickAt: [21, 17.5], power: 0.55 },
    { decoy: [[30, 18.5]] },
    { start: 200, pre: [[21.5, 17.3]], spot: 1, grab: 2.5, first: 1, kickAt: [28.2, 0], power: 1 }
  ],
  // Blind-side run
  [
    { carry: [], kickAt: [33.5, 37.5], power: 0.4 },
    { start: 0, pre: [[33.5, 37.5]], spot: 1, first: 1, kickAt: [45.5, 15], power: 0.75 },
    { start: 55, pre: [[45.5, 20]], meet: 0.3, carry: [[45.8, 12], [45.8, 5.5]], kickAt: [19.5, 9.5], power: 0.95 },
    { start: 320, pre: [[20, 9.5]], spot: 1, grab: 2.5, first: 1, kickAt: [21.8, 0], power: 1 }
  ]
];
