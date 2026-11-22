// Bot solutions for pack 4, one array per level, one entry per round.
// The ball starts dead, and a bot cannot stand still on it: where a taker has to let a decoy's run develop, his short
// `carry` (a step in from the corner flag, or a step back and up to the ball) is that wait.
module.exports = [
  // Short corner
  [
    { carry: [], kickAt: [43, 8], power: 0.1 },
    { start: 0, pre: [[43, 8.5]], spot: 1, carry: [[39, 13]], kickAt: [29, 14], power: 0.4 },
    { start: 100, pre: [[28.5, 14]], spot: 1, grab: 2.5, first: 1, kickAt: [22.1, 0], power: 1 }
  ],
  // Tapped free kick
  [
    { decoy: [[36, 16]] },
    { carry: [[20.2, 22.6], [19, 21]], kickAt: [26, 18], power: 0.1 },
    { start: 60, pre: [[26, 17.8]], spot: 1, grab: 2.5, first: 1, kickAt: [28.2, 0], power: 1 }
  ],
  // Quick throw-in
  [
    { decoy: [[43, 22]] },
    { carry: [[46.2, 31.8], [47, 31]], kickAt: [45.5, 12], power: 0.55 },
    { start: 25, pre: [[45, 19]], meet: 0.3, carry: [[45.5, 8], [45, 4.5]], kickAt: [31, 12.5], power: 0.6 },
    { start: 150, pre: [[30.5, 11.5]], spot: 1, grab: 2.5, first: 1, kickAt: [27.9, 0], power: 1 }
  ],
  // Near-post corner
  [
    { decoy: [[14, 17]] },
    { carry: [[4.5, 4.5]], kickAt: [20, 7.5], power: 0.95 },
    { start: 50, pre: [[20.5, 7.5]], spot: 1, grab: 2.5, first: 1, kickAt: [21.8, 0], power: 1 }
  ],
  // Round the wall
  [
    { decoy: [[22, 15]] },
    { carry: [[32.2, 24.4], [31, 23]], kickAt: [33, 7.5], power: 0.35 },
    { start: 34, pre: [[33, 11]], meet: 0.2, carry: [[31.5, 7]], kickAt: [28, 0], power: 1 }
  ],
  // The flick-on
  [
    { decoy: [[14, 12]] },
    { carry: [[44.5, 5]], kickAt: [30.5, 7], power: 0.95 },
    { start: 25, pre: [[30.8, 7.3]], spot: 1, grab: 2.5, first: 1, kickAt: [21.5, 8.5], power: 0.3 },
    { start: 35, pre: [[22, 8.8]], spot: 1, grab: 2.5, first: 1, kickAt: [21.8, 0], power: 1 }
  ],
  // Corner to the edge
  [
    { decoy: [[19, 5.5]] },
    { decoy: [[30.5, 6]] },
    { carry: [[4.5, 4.5]], kickAt: [22, 15.5], power: 0.75 },
    { start: 40, pre: [[22.5, 15.8]], spot: 1, grab: 2.5, first: 1, kickAt: [28.2, 0], power: 1 }
  ],
  // Kick-off routine
  [
    { carry: [], kickAt: [18, 55.3], power: 0.1 },
    { start: 0, pre: [[17.5, 55]], spot: 1, carry: [[14.5, 51.5]], kickAt: [3.5, 22], power: 1 },
    { start: 0, pre: [[4.5, 30]], meet: 0.5, carry: [[6, 14], [8, 7]], kickAt: [25, 12.5], power: 0.7 },
    { start: 100, pre: [[25.5, 12.6]], spot: 1, grab: 2.5, first: 1, kickAt: [27.9, 0], power: 1 }
  ]
];
