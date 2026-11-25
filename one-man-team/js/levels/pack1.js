/* Pack 1: the opening four. Deliberately gentle: one or two defenders, generous clocks, a slower keeper.
   Each adds exactly one idea: pass and finish, the offside line, a third player, a decoy.
   See tools/LEVEL_DESIGN.md. */
(function (root) {
  const L = (root.OMT_LEVELS = root.OMT_LEVELS || []);
  L.push({
      name: 'First pass', time: 15,
      engine: { recSpd: 0, dangerR: 0, gkBisect: 0, gkNear: 0, markLeash: 0 },   // finish pressure and hand-over off: keep the opening fixtures easy
      brief: 'Pass it forward, then be the striker who runs onto it.',
      gk: { react: 22 },
      att: [
        { num: 8, name: 'Playmaker', x: 25, y: 46, role: 'ball', tip: 'Pass it into the space in front of the 9.' },
        { num: 9, name: 'Striker', x: 25, y: 27, role: 'ball', tip: 'Run onto your own pass and score.' }
      ],
      order: [0, 1],
      def: [
        { t: 'zone', x: 13, y: 23, spd: 4.0, eng: 4, leash: 6 }
      ]
    },
    {
      name: 'Through ball', time: 15,
      engine: { recSpd: 0, dangerR: 0, gkBisect: 0, gkNear: 0, markLeash: 0 },   // finish pressure and hand-over off: keep the opening fixtures easy
      brief: 'Two defenders hold a line. Go beyond it only once the pass is on its way.',
      gk: { react: 18 },
      att: [
        { num: 8, name: 'Playmaker', x: 25, y: 48, role: 'ball', tip: 'Slide it between the two defenders for the 9.' },
        { num: 9, name: 'Striker', x: 25, y: 27.5, role: 'ball', tip: 'Wait behind the yellow line. Go when the pass is hit.' }
      ],
      order: [0, 1],
      def: [
        { t: 'line', x: 18, y: 25, spd: 4.6 }, { t: 'line', x: 32, y: 25, spd: 4.6 }
      ]
    },
    {
      name: 'Down the wing', time: 17,
      engine: { recSpd: 0, dangerR: 0, gkBisect: 0, gkNear: 0, markLeash: 0 },   // finish pressure and hand-over off: keep the opening fixtures easy
      brief: 'Three players now. Out to the winger, pulled back, tapped in.',
      gk: { react: 16 },
      att: [
        { num: 6, name: 'Holder', x: 25, y: 50, role: 'ball', tip: 'Play it down the right, ahead of the 7.' },
        { num: 7, name: 'Winger', x: 41, y: 40, role: 'ball', tip: 'Run onto it, reach the byline, pull it back for the 9.' },
        { num: 9, name: 'Striker', x: 24, y: 26, role: 'ball', tip: 'Arrive as the ball does and finish.' }
      ],
      order: [0, 1, 2],
      def: [
        { t: 'mark', a: 1, x: 40, y: 37.8, spd: 4.6, eng: 3.5, react: 26 },
        { t: 'zone', x: 21, y: 19, spd: 4.6, eng: 5, leash: 8 }
      ]
    },
    {
      name: 'The decoy', time: 16,
      engine: { recSpd: 0, dangerR: 0, gkBisect: 0, gkNear: 0, markLeash: 0 },   // finish pressure and hand-over off: keep the opening fixtures easy
      brief: 'Your first player never touches the ball. His run drags a defender out of the way.',
      att: [
        { num: 10, name: 'Decoy', x: 25, y: 28, role: 'decoy', tip: 'Run wide. Your marker follows you. Then press DONE.' },
        { num: 8, name: 'Playmaker', x: 25, y: 50, role: 'ball', tip: 'Pass through the gap the decoy left, for the 11.' },
        { num: 11, name: 'Forward', x: 14, y: 30, role: 'ball', tip: 'Run in from the left, onto the pass, and score.' }
      ],
      order: [0, 1, 2],
      def: [
        { t: 'mark', a: 0, x: 25, y: 25.8, spd: 5.2, eng: 3.5 },
        { t: 'zone', x: 36, y: 22, spd: 4.8, eng: 5, leash: 8 }
      ]
    });
})(typeof module !== 'undefined' ? global : window);
