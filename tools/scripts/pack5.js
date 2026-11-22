// Bot solutions for pack 5, one array per level, one entry per round.
module.exports = [
  // Into the channel
  [
    { carry: [], kickAt: [31, 48], power: 0.4 },
    { start: 0, pre: [[31, 48]], spot: 1, carry: [[33, 43]], kickAt: [40, 20], power: 0.8 },
    { start: 60, pre: [[40, 22]], spot: 1, carry: [[32, 10]], kickAt: [28.2, 0], power: 1 }
  ],
  // Break down the flank
  [
    { carry: [], kickAt: [44.5, 33], power: 0.75 },
    { start: 15, pre: [[44.5, 35]], spot: 1, carry: [[45, 26], [43.5, 11.5]], kickAt: [28, 18], power: 0.6 },
    { start: 200, pre: [[27.5, 18.5]], spot: 1, first: 1, kickAt: [22, 0], power: 1 }
  ],
  // Through the middle
  [
    { carry: [], kickAt: [26, 46], power: 0.4 },
    { start: 5, pre: [[26, 46.5]], spot: 1, grab: 2, first: 1, kickAt: [25.5, 20], power: 0.8 },
    { start: 55, pre: [[25.5, 21]], spot: 1, grab: 2.5, carry: [[25, 10]], kickAt: [21.8, 0], power: 1 }
  ],
  // Strike on the break
  [
    { decoy: [[12, 14]] },
    { carry: [], kickAt: [30, 46], power: 0.3 },
    { start: 0, pre: [[30, 46]], spot: 1, carry: [[27, 18]], kickAt: [21.8, 0], power: 1 }
  ],
  // Two against one
  [
    { carry: [], kickAt: [20, 40], power: 0.45 },
    { start: 10, pre: [[20, 41]], spot: 1, carry: [[21, 19.5]], kickAt: [30, 14.5], power: 0.5 },
    { start: 60, pre: [[30, 15.5]], spot: 1, first: 1, kickAt: [28.2, 0], power: 1 }
  ],
  // Near-post run
  [
    { carry: [], kickAt: [5, 25], power: 0.95 },
    { start: 25, pre: [[5, 27]], spot: 1, carry: [[9, 12]], kickAt: [20, 7.5], power: 0.6 },
    { start: 93, pre: [[20, 8]], spot: 1, first: 1, kickAt: [22, 0], power: 1 }
  ],
  // Three against two
  [
    { carry: [], kickAt: [26, 46.5], power: 0.3 },
    { start: 0, pre: [[26, 46.5]], spot: 1, carry: [[28, 24.5]], kickAt: [13, 8], power: 0.75 },
    { start: 60, pre: [[13.5, 13]], spot: 1, first: 1, kickAt: [31, 7], power: 0.85 },
    { start: 80, pre: [[31.5, 8.5]], spot: 1, first: 1, kickAt: [27, 0], power: 1 }
  ],
  // The spare man
  [
    { carry: [], kickAt: [44.5, 34], power: 0.7 },
    { start: 15, pre: [[44.5, 36]], spot: 1, carry: [[43, 27]], kickAt: [31, 27], power: 0.6 },
    { start: 110, pre: [[31, 27.5]], spot: 1, first: 1, kickAt: [15, 22], power: 0.7 },
    { start: 100, pre: [[15, 23]], spot: 1, carry: [[20.5, 11]], kickAt: [28.2, 0], power: 1 }
  ]
];
