// Bot solutions for pack 2, one array per level, one entry per round.
module.exports = [
  [
    { carry: [[10, 45]], kickAt: [24, 48], power: 0.3 },
    { start: 20, pre: [[24, 48]], spot: 1, carry: [[27, 47]], kickAt: [45, 24], power: 1 },
    { start: 125, pre: [[45, 24]], spot: 1, carry: [[28.5, 6.5]], kickAt: [27.6, 0], power: 1 }
  ],
  [
    { carry: [[25, 50]], kickAt: [24.5, 38], power: 0.45 },
    { start: 40, pre: [[24.5, 39]], spot: 1, first: 1, kickAt: [19, 34], power: 0.25 },
    { start: 60, pre: [[19, 35]], spot: 1, carry: [[22, 6.5]], kickAt: [22.4, 0], power: 1 }
  ],
  [
    { decoy: [[18, 6]] },
    { carry: [[6, 12], [8, 6.5]], kickAt: [23, 11], power: 0.55 },
    { start: 150, pre: [[23.5, 11.5]], spot: 1, carry: [[22.5, 7.5]], kickAt: [22.4, 0], power: 1 }
  ],
  [
    { carry: [], kickAt: [36, 47.5], power: 0.2 },
    { start: 0, pre: [[36, 46.5]], spot: 1, first: 1, kickAt: [46, 33], power: 0.5 },
    { start: 0, pre: [[46, 34]], spot: 1, carry: [[44, 12]], kickAt: [30, 8], power: 0.5 },
    { start: 305, pre: [[29, 8]], spot: 1, grab: 2.5, first: 1, kickAt: [27.8, 0], power: 1 }
  ],
  [
    { carry: [[23, 53]], kickAt: [35, 45], power: 0.3 },
    { start: 0, pre: [[35, 45]], spot: 1, carry: [[33, 41]], kickAt: [19, 14], power: 0.85 },
    { start: 170, pre: [[18, 15]], spot: 1, carry: [[22, 6.5]], kickAt: [22.4, 0], power: 1 }
  ],
  [
    { carry: [], kickAt: [18, 47.5], power: 0.35 },
    { start: 0, pre: [[17.5, 47]], spot: 1, carry: [[18, 45]], kickAt: [29, 38], power: 0.45 },
    { start: 120, pre: [[29, 37.5]], spot: 1, first: 1, kickAt: [35, 21], power: 0.5 },
    { start: 190, pre: [[35, 22]], spot: 1, carry: [[28.5, 6.5]], kickAt: [27.6, 0], power: 1 }
  ],
  [
    { decoy: [[20, 9]] },
    { carry: [[28, 39]], kickAt: [35.5, 14], power: 0.8 },
    { start: 30, pre: [[36, 13]], spot: 1, carry: [[28.5, 6.5]], kickAt: [27.6, 0], power: 1 }
  ]
];
