// Bot solutions for pack 6, one array per level, one entry per round (written by tools/gen/campaign-v2.js).
module.exports = [
  // Change the point (fixture 37)
  [
    { kickAt: [22, 45.6], power: 0.55 },
    { start: 10, pre: [[22, 44.5]], spot: 1, kickAt: [41.5, 17.6], power: 1, first: 1 },
    { start: 42, pre: [[41, 19]], spot: 1, carry: [[34.6, 11.5]], kickAt: [22.3, 0], power: 1 }
  ],
  // Out from the back (fixture 38)
  [
    { kickAt: [30.5, 52], power: 0.38 },
    { start: 10, pre: [[30.5, 52]], spot: 1, kickAt: [20.4, 43.7], power: 0.43, first: 1 },
    { start: 81, pre: [[18, 45.5]], spot: 1, kickAt: [22.4, 20.4], power: 0.64, carry: [[20, 38.5]] },
    { start: 142, pre: [[22.2, 22]], spot: 1, grab: 2.5, carry: [[23.8, 13.9]], kickAt: [27.7, 0], power: 1 }
  ],
  // Bend in behind (fixture 39)
  [
    { kickAt: [20.4, 50.8], power: 0.4 },
    { start: 20, pre: [[20.5, 50.5]], spot: 1, kickAt: [30, 42.9], power: 0.46 },
    { start: 66, pre: [[30.5, 43.5]], spot: 1, grab: 2.5, kickAt: [25.6, 21.1], power: 0.83, first: 1 },
    { start: 22, pre: [[20, 31.2]], meet: 0.2, carry: [[21.4, 13.5]], kickAt: [27.7, 0], power: 1 }
  ],
  // Pull the centre-half (fixture 40)
  [
    { kickAt: [20.4, 37.2], power: 0.5, carry: [[30, 50]] },
    { start: 10, pre: [[20, 37.5]], spot: 1, kickAt: [33.3, 15.6], power: 0.59, carry: [[21, 27.5]] },
    { start: 158, pre: [[33, 21.5]], meet: 0.2, carry: [[28.6, 13.5]], kickAt: [22.3, 0], power: 1 }
  ],
  // Back, then in behind (fixture 41)
  [
    { kickAt: [25.4, 51.3], power: 0.52, carry: [[40, 45.3]] },
    { start: 20, pre: [[25.5, 51.5]], spot: 1, kickAt: [19.1, 43.4], power: 0.14, carry: [[22, 49]] },
    { start: 139, pre: [[21, 43]], spot: 1, kickAt: [22.2, 21.3], power: 0.72, first: 1 },
    { start: 148, pre: [[21.5, 19.5]], spot: 1, grab: 2.5, carry: [[21.4, 13.5]], kickAt: [27.7, 0], power: 1 }
  ],
  // Spin in behind (fixture 42)
  [
    { kickAt: [24.4, 47.6], power: 0.52 },
    { start: 10, pre: [[24, 49]], spot: 1, kickAt: [13.1, 41.8], power: 0.4, first: 1 },
    { start: 10, pre: [[13, 42]], spot: 1, kickAt: [19.1, 17.3], power: 0.74 },
    { start: 80, pre: [[20, 21]], meet: 0.2, carry: [[16.6, 13]], kickAt: [27.7, 0], power: 1 }
  ],
  // Two at the back (fixture 43)
  [
    { kickAt: [26.6, 43.1], power: 0.35 },
    { start: 20, pre: [[26, 44.5]], spot: 1, kickAt: [32, 14.6], power: 0.45, carry: [[28, 31.5]] },
    { start: 75, pre: [[34.5, 17.5]], spot: 1, carry: [[28.6, 13.5]], kickAt: [22.3, 0], power: 1 }
  ],
  // The seam (fixture 44)
  [
    { kickAt: [32.8, 47.5], power: 0.64 },
    { start: 10, pre: [[33, 48.5]], spot: 1, kickAt: [29.8, 35.3], power: 0.46 },
    { start: 108, pre: [[28, 36]], spot: 1, grab: 2.5, kickAt: [36.7, 17.4], power: 0.7, first: 1 },
    { start: 103, pre: [[38.5, 20.5]], meet: 0.3, carry: [[28.6, 13.5]], kickAt: [22.3, 0], power: 1 }
  ]
];
