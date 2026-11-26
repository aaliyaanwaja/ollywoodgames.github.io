// Bot solutions for pack 2, one array per level, one entry per round (written by tools/gen/campaign-v2.js).
module.exports = [
  // The third man (fixture 5)
  [
    { kickAt: [33, 47], power: 0.53 },
    { start: 10, pre: [[33, 47]], spot: 1, kickAt: [31.2, 34.8], power: 0.39, carry: [[34, 45]] },
    { start: 79, pre: [[30.5, 35]], spot: 1, kickAt: [19.7, 19.2], power: 0.67, first: 1 },
    { start: 105, pre: [[20, 20]], spot: 1, carry: [[21.4, 13.5]], kickAt: [27.7, 0], power: 1 }
  ],
  // Draw him out (fixture 6)
  [
    { kickAt: [19.8, 41.2], power: 0.42, carry: [[30, 50]] },
    { start: 10, pre: [[20, 41]], spot: 1, kickAt: [35.9, 17.4], power: 0.69, carry: [[21, 30]] },
    { start: 156, pre: [[33, 24]], meet: 0.2, carry: [[28.6, 13.5]], kickAt: [22.3, 0], power: 1 }
  ],
  // Along the line (fixture 7)
  [
    { kickAt: [20.7, 50], power: 0.37 },
    { start: 20, pre: [[20.5, 50.5]], spot: 1, kickAt: [30, 44.7], power: 0.39 },
    { start: 58, pre: [[30.5, 45.5]], spot: 1, grab: 2.5, kickAt: [25.6, 23.1], power: 0.78, first: 1 },
    { start: 18, pre: [[20, 33.2]], meet: 0.2, carry: [[23.9, 12.5]], kickAt: [27.7, 0], power: 1 }
  ],
  // Come short, go long (fixture 8)
  [
    { kickAt: [25.9, 48.8], power: 0.49 },
    { start: 10, pre: [[26, 49]], spot: 1, kickAt: [37, 42], power: 0.37, first: 1 },
    { start: 10, pre: [[37, 42]], spot: 1, kickAt: [31.6, 18.7], power: 0.68 },
    { start: 83, pre: [[30, 22.5]], meet: 0.2, carry: [[30.9, 12.7]], kickAt: [22.3, 0], power: 1 }
  ],
  // The dropping nine (fixture 9)
  [
    { kickAt: [17.6, 48.6], power: 0.3, carry: [[33, 52], [29, 52.5]] },
    { decoy: [[25.5, 39.5]] },
    { start: 107, pre: [[17.5, 49]], spot: 1, kickAt: [23.5, 19.9], power: 0.94, first: 1 },
    { start: 115, pre: [[23.3, 22]], spot: 1, grab: 2.5, carry: [[21.4, 13.5]], kickAt: [27.7, 0], power: 1 }
  ],
  // Past the hunters (fixture 10)
  [
    { kickAt: [30.5, 52], power: 0.44 },
    { start: 20, pre: [[30.5, 52]], spot: 1, kickAt: [19.7, 40.6], power: 0.55, first: 1 },
    { start: 92, pre: [[18, 42.5]], spot: 1, kickAt: [24.7, 17.4], power: 0.65, carry: [[20.8, 32.6]] },
    { start: 160, pre: [[24.7, 19]], spot: 1, grab: 2.5, carry: [[23.8, 13.9]], kickAt: [27.7, 0], power: 1 }
  ],
  // Five in a row (fixture 11)
  [
    { kickAt: [19.5, 52], power: 0.44 },
    { start: 10, pre: [[19.5, 52]], spot: 1, kickAt: [31.2, 44.8], power: 0.53, first: 1 },
    { start: 84, pre: [[32, 46]], spot: 1, kickAt: [24.4, 42.5], power: 0.08, carry: [[30.5, 43]] },
    { start: 133, pre: [[23.5, 41.8]], spot: 1, grab: 2, kickAt: [23.4, 23.3], power: 0.67, first: 1 },
    { start: 164, pre: [[21.5, 22]], spot: 1, grab: 2.5, carry: [[21.4, 13.5]], kickAt: [27.7, 0], power: 1 }
  ],
  // Nothing over the top (fixture 12)
  [
    { kickAt: [9.6, 44.7], power: 0.69, carry: [[28, 54]] },
    { start: 97, pre: [[9, 46]], spot: 1, kickAt: [18.1, 42.1], power: 0.16, first: 1 },
    { start: 119, pre: [[18, 42]], spot: 1, kickAt: [26.5, 24.1], power: 0.42, carry: [[20, 37]] },
    { start: 222, pre: [[26, 23.5]], spot: 1, grab: 2.5, carry: [[28.6, 13.5]], kickAt: [22.3, 0], power: 1 }
  ]
];
