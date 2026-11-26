// Bot solutions for pack 8, one array per level, one entry per round (written by tools/gen/campaign-v2.js).
module.exports = [
  // Through the first line (fixture 53)
  [
    { kickAt: [30.1, 50.9], power: 0.41 },
    { start: 20, pre: [[30.5, 52]], spot: 1, kickAt: [17.1, 46], power: 0.53, first: 1 },
    { start: 87, pre: [[18, 44.5]], spot: 1, kickAt: [23.4, 19.4], power: 0.52, carry: [[20, 37.5]] },
    { start: 183, pre: [[23.2, 21]], spot: 1, grab: 2.5, carry: [[21.4, 13.5]], kickAt: [27.7, 0], power: 1 }
  ],
  // Off the 9 (fixture 54)
  [
    { kickAt: [33, 47], power: 0.5 },
    { start: 10, pre: [[33, 47]], spot: 1, kickAt: [30.2, 35.6], power: 0.31, carry: [[34, 45]] },
    { start: 87, pre: [[30.5, 35.5]], spot: 1, kickAt: [20, 18.5], power: 0.68, first: 1 },
    { start: 84, pre: [[20, 19.5]], spot: 1, carry: [[23.8, 13.9]], kickAt: [27.7, 0], power: 1 }
  ],
  // Dart inside (fixture 55)
  [
    { kickAt: [32.9, 48], power: 0.64 },
    { start: 10, pre: [[33, 48.5]], spot: 1, kickAt: [29.8, 37.3], power: 0.43 },
    { start: 91, pre: [[28, 38]], spot: 1, grab: 2.5, kickAt: [36.7, 18.4], power: 0.68, first: 1 },
    { start: 97, pre: [[38.5, 21.5]], meet: 0.3, carry: [[30.9, 12.7]], kickAt: [22.9, 0], power: 1 }
  ],
  // Curve it in behind (fixture 56)
  [
    { kickAt: [20.7, 49.9], power: 0.37 },
    { start: 20, pre: [[20.5, 50.5]], spot: 1, kickAt: [30.3, 43.2], power: 0.43 },
    { start: 66, pre: [[30.5, 43.5]], spot: 1, grab: 2.5, kickAt: [27.1, 20.8], power: 0.83, first: 1 },
    { start: 24, pre: [[20, 31.2]], meet: 0.2, carry: [[21.4, 13.5]], kickAt: [27.7, 0], power: 1 }
  ],
  // The double movement (fixture 57)
  [
    { kickAt: [24.2, 48.4], power: 0.49 },
    { start: 10, pre: [[24, 49]], spot: 1, kickAt: [13.1, 41.8], power: 0.4, first: 1 },
    { start: 10, pre: [[13, 42]], spot: 1, kickAt: [19.6, 16.9], power: 0.73 },
    { start: 85, pre: [[20, 20.5]], meet: 0.2, carry: [[14, 10.2]], kickAt: [27.7, 0], power: 1 }
  ],
  // Commit the centre-half (fixture 58)
  [
    { kickAt: [19.8, 40.2], power: 0.45, carry: [[30, 50]] },
    { start: 10, pre: [[20, 40]], spot: 1, kickAt: [32.9, 17.7], power: 0.56, carry: [[21, 30]] },
    { start: 143, pre: [[33, 24]], meet: 0.2, carry: [[28.6, 13.5]], kickAt: [22.3, 0], power: 1 }
  ],
  // Break at speed (fixture 59)
  [
    { kickAt: [23.3, 41.9], power: 0.4 },
    { start: 20, pre: [[24, 41.5]], spot: 1, kickAt: [14.9, 12.7], power: 0.33, carry: [[22, 28.5]] },
    { start: 100, pre: [[15.5, 14.5]], spot: 1, carry: [[21.4, 13.5]], kickAt: [27.7, 0], power: 1 }
  ],
  // Five-man move (fixture 60)
  [
    { kickAt: [30.4, 51.8], power: 0.5 },
    { start: 20, pre: [[30.5, 52]], spot: 1, kickAt: [18.4, 43.4], power: 0.51, first: 1 },
    { start: 89, pre: [[18, 44]], spot: 1, kickAt: [26.6, 40.4], power: 0.11, carry: [[19.5, 41]] },
    { start: 134, pre: [[26.5, 39.8]], spot: 1, grab: 2, kickAt: [27.6, 21.3], power: 0.64, first: 1 },
    { start: 165, pre: [[29.5, 20]], spot: 1, grab: 2.5, carry: [[28.6, 13.5]], kickAt: [22.3, 0], power: 1 }
  ]
];
