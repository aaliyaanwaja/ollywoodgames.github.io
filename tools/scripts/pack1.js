// Bot solutions for pack 1, one array per level, one entry per round.
module.exports = [
  [
    { carry: [], kickAt: [25, 14], power: 0.85 },
    { start: 60, pre: [[25, 15]], spot: 1, grab: 2.2, carry: [[25, 10]], kickAt: [28, 0], power: 1 }
  ],
  [
    { carry: [[25, 44]], kickAt: [25, 11], power: 1 },
    { start: 80, pre: [[25, 13]], spot: 1, grab: 2.2, carry: [[25, 9.5]], kickAt: [28, 0], power: 1 }
  ],
  [
    { carry: [[28, 49]], kickAt: [46, 24], power: 1 },
    { start: 60, pre: [[46, 26]], spot: 1, carry: [[45, 12], [44, 7]], kickAt: [28, 11], power: 0.85 },
    { start: 330, pre: [[29, 11.5]], first: 1, carry: [], kickAt: [22.2, 0], power: 1 }
  ],
  [
    { decoy: [[38, 31]] },
    { carry: [[25, 46]], kickAt: [23, 14], power: 0.95 },
    { start: 110, pre: [[22.5, 16]], spot: 1, grab: 2.2, carry: [[23, 10]], kickAt: [27.8, 0], power: 1 }
  ]
];
