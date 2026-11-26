// Bot solutions for pack 4, one array per level, one entry per round (written by tools/gen/campaign-v2.js).
module.exports = [
  // Switch of play (fixture 21)
  [
    { kickAt: [28.1, 46.3], power: 0.25 },
    { start: 10, pre: [[28, 45]], spot: 1, kickAt: [7, 19], power: 0.97, first: 1 },
    { start: 131, pre: [[8, 20]], spot: 1, carry: [[14, 10.2]], kickAt: [27.7, 0], power: 1 }
  ],
  // Pull it back (fixture 22)
  [
    { kickAt: [32, 38], power: 0.63 },
    { start: 62, pre: [[32, 38]], spot: 1, kickAt: [37.4, 14.2], power: 0.84, first: 1 },
    { start: 66, pre: [[40, 18.5]], meet: 0.3, kickAt: [31.2, 13.5], power: 0.33 },
    { start: 30, pre: [[30, 14]], spot: 1, grab: 2.5, first: 1, kickAt: [27.4, 0], power: 1 }
  ],
  // Bend round them (fixture 23)
  [
    { kickAt: [20.9, 49.6], power: 0.4 },
    { start: 10, pre: [[20.5, 50.5]], spot: 1, kickAt: [29.9, 41], power: 0.46 },
    { start: 80, pre: [[30.5, 41.5]], spot: 1, grab: 2.5, kickAt: [25.3, 19.1], power: 0.8, first: 1 },
    { start: 27, pre: [[20, 29.2]], meet: 0.2, carry: [[21.4, 13.5]], kickAt: [27.7, 0], power: 1 }
  ],
  // Beat the press (fixture 24)
  [
    { kickAt: [30.7, 52.9], power: 0.35 },
    { start: 20, pre: [[30.5, 52]], spot: 1, kickAt: [18.5, 42], power: 0.57, first: 1 },
    { start: 94, pre: [[18, 42.5]], spot: 1, kickAt: [23.6, 16.9], power: 0.54, carry: [[20.8, 32.6]] },
    { start: 176, pre: [[25.2, 19]], spot: 1, grab: 2.5, carry: [[28.6, 13.5]], kickAt: [22.3, 0], power: 1 }
  ],
  // Empty the middle (fixture 25)
  [
    { kickAt: [17.7, 48.4], power: 0.3, carry: [[33, 52], [29, 52.5]] },
    { decoy: [[25.5, 39]] },
    { start: 107, pre: [[17.5, 49]], spot: 1, kickAt: [23.5, 19.4], power: 0.97, first: 1 },
    { start: 112, pre: [[23.3, 21.5]], spot: 1, grab: 2.5, carry: [[21.4, 13.5]], kickAt: [27.7, 0], power: 1 }
  ],
  // Check and spin (fixture 26)
  [
    { kickAt: [24.4, 47.6], power: 0.52 },
    { start: 10, pre: [[24, 49]], spot: 1, kickAt: [12.9, 42.2], power: 0.4, first: 1 },
    { start: 10, pre: [[13, 42]], spot: 1, kickAt: [18.8, 18.2], power: 0.76 },
    { start: 78, pre: [[20, 22]], meet: 0.2, carry: [[16.6, 13]], kickAt: [27.7, 0], power: 1 }
  ],
  // Catch them upfield (fixture 27)
  [
    { kickAt: [24, 44.5], power: 0.29 },
    { start: 20, pre: [[24, 44.5]], spot: 1, kickAt: [10.4, 16.4], power: 0.38, carry: [[21.5, 28.5]] },
    { start: 95, pre: [[11.5, 17.5]], spot: 1, carry: [[19.1, 12.7]], kickAt: [27.7, 0], power: 1 }
  ],
  // Every man touches it (fixture 28)
  [
    { kickAt: [30.5, 52], power: 0.26 },
    { start: 10, pre: [[30.5, 52]], spot: 1, kickAt: [18, 42], power: 0.5, first: 1 },
    { start: 94, pre: [[18, 42]], spot: 1, kickAt: [25.5, 37.8], power: 0.02, carry: [[19.5, 39]] },
    { start: 144, pre: [[26.5, 37.8]], spot: 1, grab: 2, kickAt: [26.3, 18.5], power: 0.72, first: 1 },
    { start: 169, pre: [[27.5, 17]], spot: 1, grab: 2.5, carry: [[28.6, 13.5]], kickAt: [22.3, 0], power: 1 }
  ]
];
