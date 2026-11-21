// Bot solutions for pack 3, one array per level, one entry per round.
module.exports = [
  // Beat the trap
  [
    { carry: [[10, 45]], kickAt: [24, 51.5], power: 0.3 },
    { start: 0, pre: [[24.5, 51.5]], spot: 1, carry: [[28, 49]], kickAt: [29, 43.5], power: 0.1 },
    { start: 180, pre: [[29, 43.5]], spot: 1, first: 1, kickAt: [28, 22], power: 0.7 },
    { start: 156, pre: [[28.5, 20]], spot: 1, grab: 2.5, carry: [[27.5, 10]], kickAt: [28, 0], power: 1 }
  ],
  // Clear the channel
  [
    { decoy: [[7, 30]] },
    { decoy: [[40, 41]] },
    { carry: [[24, 53]], kickAt: [16, 47], power: 0.25 },
    { start: 0, pre: [[16, 47]], spot: 1, carry: [[20, 42]], kickAt: [27.95, 16], power: 0.8 },
    { start: 190, pre: [[30, 22]], meet: 0.5, carry: [[27, 9]], kickAt: [28, 0], power: 1 }
  ],
  // Sweeper-keeper
  [
    { carry: [[22, 54]], kickAt: [41, 46], power: 0.4 },
    { start: 30, pre: [[41, 46]], spot: 1, first: 1, kickAt: [32, 36], power: 0.15 },
    { start: 120, pre: [[32, 36]], spot: 1, carry: [[29, 28]], kickAt: [24, 14], power: 0.45 },
    { start: 321, pre: [[24, 12.5]], spot: 1, grab: 2.5, carry: [[24, 10]], kickAt: [28, 0], power: 1 }
  ],
  // Play through the press
  [
    { carry: [], kickAt: [31, 52.5], power: 0.25 },
    { start: 0, pre: [[30.5, 52]], spot: 1, first: 1, kickAt: [18, 44], power: 0.26 },
    { start: 60, pre: [[18, 44]], spot: 1, carry: [[20, 37]], kickAt: [24, 18], power: 0.6 },
    { start: 170, pre: [[23.7, 19.5]], spot: 1, grab: 2.5, carry: [[24.5, 10]], kickAt: [22, 0], power: 1 }
  ],
  // Far post
  [
    { carry: [[33, 43]], kickAt: [46, 22], power: 0.7 },
    { decoy: [[31, 6]] },
    { start: 40, pre: [[46, 22]], spot: 1, carry: [[45, 12], [45.5, 6.5]], kickAt: [18.5, 12], power: 1 },
    { decoy: [[26, 21]] },
    { start: 265, pre: [[21, 12.2]], spot: 1, grab: 2.5, first: 1, kickAt: [21.8, 0], power: 1 }
  ],
  // False nine
  [
    { carry: [[33, 52], [29, 52.5]], kickAt: [17, 49], power: 0.3 },
    { decoy: [[27, 41]] },
    { start: 100, pre: [[18, 49.5]], spot: 1, first: 1, kickAt: [24, 18], power: 0.95 },
    { start: 145, pre: [[23.3, 20]], spot: 1, grab: 2.5, carry: [[24, 10]], kickAt: [28, 0], power: 1 }
  ],
  // Five-man move
  [
    { carry: [], kickAt: [31, 52.5], power: 0.25 },
    { start: 0, pre: [[30.5, 52]], spot: 1, first: 1, kickAt: [18, 44], power: 0.4 },
    { start: 60, pre: [[18, 44]], spot: 1, carry: [[19.5, 41]], kickAt: [26.5, 39.8], power: 0.08 },
    { start: 168, pre: [[26.3, 39.6]], spot: 1, grab: 2, first: 1, kickAt: [29, 20], power: 0.7 },
    { start: 225, pre: [[29.5, 17.5]], spot: 1, grab: 2.5, carry: [[27.5, 10]], kickAt: [22, 0], power: 1 }
  ],
  // Last-minute winner
  [
    { carry: [], kickAt: [22, 44.5], power: 0.3 },
    { start: 20, pre: [[22, 44.5]], spot: 1, grab: 2, first: 1, kickAt: [28, 16], power: 0.95 },
    { decoy: [[16, 26]] },
    { start: 62, pre: [[27.8, 17.5]], spot: 1, grab: 2.5, carry: [[26, 9.6]], kickAt: [22, 0], power: 1 }
  ]
];
