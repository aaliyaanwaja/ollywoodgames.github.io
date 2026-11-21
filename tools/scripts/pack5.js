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
    { start: 15, pre: [[44.5, 35]], spot: 1, carry: [[45, 26], [43.5, 11.5]], kickAt: [28, 17.5], power: 0.6 },
    { start: 200, pre: [[27.5, 18]], spot: 1, first: 1, kickAt: [22, 0], power: 1 }
  ],
  // Two against one
  [
    { carry: [], kickAt: [20, 40], power: 0.45 },
    { start: 10, pre: [[20, 41]], spot: 1, carry: [[21, 19]], kickAt: [30, 14], power: 0.5 },
    { start: 60, pre: [[30, 15]], spot: 1, first: 1, kickAt: [28.2, 0], power: 1 }
  ],
  // Three against two
  [
    { carry: [], kickAt: [26, 46.5], power: 0.3 },
    { start: 0, pre: [[26, 46.5]], spot: 1, carry: [[27, 28]], kickAt: [14, 10], power: 0.7 },
    { start: 60, pre: [[12, 15]], spot: 1, first: 1, kickAt: [31, 7], power: 0.85 },
    { start: 95, pre: [[31.5, 8.5]], spot: 1, first: 1, kickAt: [27, 0], power: 1 }
  ],
  // Strike on the break
  [
    { decoy: [[12, 14]] },
    { carry: [], kickAt: [30, 46], power: 0.3 },
    { start: 0, pre: [[30, 46]], spot: 1, carry: [[27, 18.5]], kickAt: [21.8, 0], power: 1 }
  ]
];
