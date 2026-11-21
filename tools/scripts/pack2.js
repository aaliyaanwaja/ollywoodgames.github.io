// Bot solutions for pack 2, one array per level, one entry per round.
module.exports = [
  // Switch of play
  [
    { carry: [], kickAt: [28, 45], power: 0.6 },
    { start: 0, pre: [[28, 45]], spot: 1, first: 1, kickAt: [7, 19], power: 1 },
    { start: 55, pre: [[9, 20]], spot: 1, carry: [[19, 8]], kickAt: [22, 0], power: 1 }
  ],
  // The lay-off
  [
    { carry: [[31, 51]], kickAt: [30, 38], power: 0.6 },
    { start: 40, pre: [[30, 38.5]], spot: 1, first: 1, kickAt: [33.5, 35], power: 0.1 },
    { start: 30, pre: [[33.5, 36]], spot: 1, carry: [[32, 24], [28, 10]], kickAt: [28.2, 0], power: 1 }
  ],
  // The cut-back
  [
    { decoy: [[30, 6]] },
    { carry: [[45.5, 14], [45, 7]], kickAt: [27, 12.5], power: 0.6 },
    { start: 150, pre: [[27.5, 12.5]], spot: 1, first: 1, kickAt: [21.8, 0], power: 1 }
  ],
  // The overlap
  [
    { carry: [], kickAt: [14, 47.5], power: 0.2 },
    { start: 0, pre: [[14, 46.5]], spot: 1, first: 1, kickAt: [4, 33], power: 0.5 },
    { start: 0, pre: [[4, 34]], spot: 1, carry: [[5, 20], [6, 8]], kickAt: [21, 12], power: 0.6 },
    { start: 330, pre: [[21.5, 12]], spot: 1, grab: 2.5, first: 1, kickAt: [21.8, 0], power: 1 }
  ],
  // Diagonal in behind
  [
    { carry: [], kickAt: [16, 45], power: 0.6 },
    { start: 0, pre: [[16, 45]], spot: 1, carry: [[19, 43.5]], kickAt: [43, 17], power: 1 },
    { start: 112, pre: [[40, 20]], spot: 1, carry: [[32, 9]], kickAt: [28.2, 0], power: 1 }
  ],
  // Third-man run
  [
    { carry: [], kickAt: [33, 47], power: 0.5 },
    { start: 0, pre: [[33, 47]], spot: 1, carry: [[34, 45]], kickAt: [31, 36.5], power: 0.6 },
    { start: 70, pre: [[31, 37]], spot: 1, first: 1, kickAt: [20, 22], power: 0.5 },
    { start: 96, pre: [[20, 23]], spot: 1, carry: [[24, 10]], kickAt: [21.8, 0], power: 1 }
  ],
  // The counter
  [
    { carry: [], kickAt: [26, 43], power: 0.5 },
    { start: 0, pre: [[26, 43]], spot: 1, carry: [[29, 21]], kickAt: [37, 12], power: 0.7 },
    { start: 50, pre: [[37, 14]], spot: 1, carry: [[30, 9]], kickAt: [28.2, 0], power: 1 }
  ],
  // Push them back
  [
    { decoy: [[15, 8]] },
    { carry: [[26, 34]], kickAt: [25, 12.5], power: 0.95 },
    { start: 70, pre: [[25, 13]], spot: 1, first: 1, kickAt: [28.2, 0], power: 1 }
  ]
];
