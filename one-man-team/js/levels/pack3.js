/* Pack 3: season 3 of the story, fixtures 13-20. Campaign version 2 (docs/foundation/21-campaign-v2.md),
   built by tools/gen/campaign-v2.js to RULEBOOK.md version 2: generated levels and the owner's favourite hand-built ones.
   Rebuild rather than edit by hand; ids (c01-c60) are permanent and never reused. */
(function (root) {
  const L = (root.OMT_LEVELS = root.OMT_LEVELS || []);
  L.push(
    // 13: Third-man run, generated (seed 1332178502, attempt 5), hard
    {
      id: 'c13',
      name: 'Into the hole',
      time: 9,
      brief: 'Four players. Up to the 9, who comes short. His centre-half follows, and the 11 runs in behind.',
      att: [
        { num: 5, name: 'Centre-back', x: 20, y: 55, role: 'ball', tip: 'The hunter is on you and the screen blocks the straight pass. Roll it across to the 6 on your right.' },
        { num: 6, name: 'Holder', x: 34, y: 46, role: 'ball', tip: 'Take it and play it firmly into the 9 as he comes short.' },
        { num: 9, name: 'Target man', x: 25, y: 27.5, role: 'ball', tip: 'Come short so the centre-half follows. Aim early and flick it first time into the hole.' },
        { num: 11, name: 'Third man', x: 8, y: 28, role: 'ball', tip: 'Start your run before the 9 gets it. Stay onside, take it in the hole and finish.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'line', x: 14, y: 24, spd: 5.3 },
        { t: 'line', x: 34, y: 24, spd: 5.3 },
        { t: 'line', x: 43, y: 24, spd: 5.3 },
        { t: 'mark', a: 2, x: 25, y: 25.6, spd: 5.5, eng: 6, react: 18, tight: 0.8 },
        { t: 'zone', x: 20.3, y: 39.2, spd: 5.2, eng: 5 },
        { t: 'press', x: 23.4, y: 48.3, spd: 5.5 }
      ]
    },
    // 14: Commit the centre-half, generated (seed 2523494695, attempt 18), hard
    {
      id: 'c14',
      name: 'Run at him',
      time: 9,
      brief: 'Three players. Drive at their back four. When a centre-half commits, play the 9 in behind him.',
      lines: { "0": { gap: 8 } },
      att: [
        { num: 6, name: 'Holder', x: 30, y: 52, role: 'ball', tip: 'The hunter is coming. Play it into the 10 between the lines, away from the screen.' },
        { num: 10, name: 'Number ten', x: 20, y: 39.5, role: 'ball', tip: 'Drive at the left centre-half. When he steps out to you, slip the 9 in on your right before he tackles.' },
        { num: 9, name: 'Striker', x: 31, y: 28.5, role: 'ball', tip: 'Hold your run on their line. Go in behind as the centre-half steps out to the 10, then finish.' }
      ],
      order: [0, 1, 2],
      def: [
        { t: 'line', x: 11.3, y: 25.5, spd: 5.3 },
        { t: 'line', x: 20.8, y: 25.5, spd: 5.3 },
        { t: 'line', x: 31.3, y: 25.5, spd: 5.3 },
        { t: 'line', x: 41.8, y: 25.5, spd: 5.3 },
        { t: 'zone', x: 25.3, y: 41.4, spd: 5.2, eng: 5 },
        { t: 'press', x: 35.1, y: 46.5, spd: 5.6 }
      ]
    },
    // 15: Third-man run, generated (seed 959473292, attempt 5), hard
    {
      id: 'c15',
      name: 'The blind side',
      time: 9,
      brief: 'Four players. The 9 comes short and drags his centre-half out. The 11 runs into the hole.',
      att: [
        { num: 5, name: 'Centre-back', x: 20, y: 55, role: 'ball', tip: 'Do not play through the screen. Find the 6 on your right before the hunter arrives.' },
        { num: 6, name: 'Holder', x: 34, y: 46, role: 'ball', tip: 'One touch to set it, then a firm pass into the 9 as he shows.' },
        { num: 9, name: 'Target man', x: 25, y: 29, role: 'ball', tip: 'Come short so the centre-half follows. Aim early and flick it first time into the hole.' },
        { num: 11, name: 'Third man', x: 7, y: 31, role: 'ball', tip: 'Start your run before the 9 gets it. Stay onside, take it in the hole and finish.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'line', x: 13.5, y: 25, spd: 5.5 },
        { t: 'line', x: 34, y: 25, spd: 5.5 },
        { t: 'line', x: 43.5, y: 25, spd: 5.5 },
        { t: 'mark', a: 2, x: 25, y: 26.8, spd: 5.7, eng: 6, react: 22, tight: 0.9 },
        { t: 'zone', x: 19.9, y: 39.9, spd: 5.4, eng: 5 },
        { t: 'press', x: 23.1, y: 47.1, spd: 5.7 }
      ]
    },
    // 16: Sweeper-keeper, generated (seed 3186551327, attempt 35), standard
    {
      id: 'c16',
      name: 'Short, not long',
      time: 12,
      brief: 'Four players. Their keeper sweeps up anything long. Get close, then slip one short pass in.',
      gk: { sweeper: true },
      lines: { "0": { gap: 8 } },
      att: [
        { num: 4, name: 'Centre-back', x: 20, y: 55, role: 'ball', tip: 'The keeper sweeps anything long. Play it out to the 7 on your right.' },
        { num: 7, name: 'Winger', x: 42, y: 44, role: 'ball', tip: 'Aim early and play it inside first time to the 10.' },
        { num: 10, name: 'Creator', x: 31, y: 38, role: 'ball', tip: 'Run at their line, then play a short ball in behind. Not too hard: the keeper is out.' },
        { num: 9, name: 'Striker', x: 21, y: 31.5, role: 'ball', tip: 'Dart across the centre-half as the 10 plays it. Beat the keeper to it and finish.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'line', x: 9.8, y: 29, spd: 5.3 },
        { t: 'line', x: 19.3, y: 29, spd: 5.3 },
        { t: 'line', x: 28.8, y: 29, spd: 5.3 },
        { t: 'line', x: 39.3, y: 29, spd: 5.3 },
        { t: 'mark', a: 1, x: 41.2, y: 41.9, spd: 5.4 },
        { t: 'zone', x: 26.1, y: 44.7, spd: 5.2, eng: 5 }
      ]
    },
    // 17: Play through the press, generated (seed 1098329832, attempt 4), hard
    {
      id: 'c17',
      name: 'Past the press',
      time: 10,
      brief: 'Four players. Two hunters close the first two passes. Move it before they arrive, then break.',
      att: [
        { num: 4, name: 'Centre-back', x: 31, y: 55, role: 'ball', tip: 'The first hunter is on his way. Roll it across to the 6 at once.' },
        { num: 6, name: 'Pivot', x: 18, y: 51, role: 'ball', tip: 'No time on the ball. Aim early and play it first time to the 8.' },
        { num: 8, name: 'Link', x: 33, y: 43, role: 'ball', tip: 'Run at their back four, then slip the 9 in behind them.' },
        { num: 9, name: 'Striker', x: 21, y: 31, role: 'ball', tip: 'Hold your run on their line. Go as the 8 plays it, then finish across the keeper.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'line', x: 42.7, y: 28, spd: 5.4 },
        { t: 'line', x: 32.2, y: 28, spd: 5.4 },
        { t: 'line', x: 22.2, y: 28, spd: 5.4 },
        { t: 'line', x: 11.2, y: 28, spd: 5.4 },
        { t: 'press', x: 29.7, y: 46.1, spd: 5.5 },
        { t: 'press', x: 14.9, y: 44.2, spd: 5.7 }
      ]
    },
    // 18: Commit the centre-half, generated (seed 4070705363, attempt 4), hard
    {
      id: 'c18',
      name: 'Make him step out',
      time: 9,
      brief: 'Three players. Run at a centre-half until he steps out to you, then slip the 9 in behind before he tackles.',
      lines: { "0": { gap: 8 } },
      att: [
        { num: 6, name: 'Holder', x: 30, y: 52, role: 'ball', tip: 'The hunter is coming. Play it into the 10 between the lines, away from the screen.' },
        { num: 10, name: 'Number ten', x: 20, y: 38.5, role: 'ball', tip: 'Run at their line. Wait until a centre-half commits, then play the 9 in before the tackle.' },
        { num: 9, name: 'Striker', x: 31, y: 27.5, role: 'ball', tip: 'Stay onside. Go as the 10 plays it, then run on and finish across the keeper.' }
      ],
      order: [0, 1, 2],
      def: [
        { t: 'line', x: 11.8, y: 25.5, spd: 5.3 },
        { t: 'line', x: 21.3, y: 25.5, spd: 5.3 },
        { t: 'line', x: 31.8, y: 25.5, spd: 5.3 },
        { t: 'line', x: 42.3, y: 25.5, spd: 5.3 },
        { t: 'zone', x: 24.6, y: 41.4, spd: 5.3, eng: 5 },
        { t: 'press', x: 37.3, y: 46, spd: 5.6 }
      ]
    },
    // 19: Third-man run, generated (seed 3038523808, attempt 9), hard
    {
      id: 'c19',
      name: 'Up, off and in',
      time: 9,
      brief: 'Four players. The 9 comes short and drags his centre-half out. The 11 runs into the hole.',
      att: [
        { num: 5, name: 'Centre-back', x: 20, y: 55, role: 'ball', tip: 'Do not play through the screen. Find the 6 on your right before the hunter arrives.' },
        { num: 6, name: 'Holder', x: 34, y: 46, role: 'ball', tip: 'One touch to set it, then a firm pass into the 9 as he shows.' },
        { num: 9, name: 'Target man', x: 25, y: 28.5, role: 'ball', tip: 'Come short so the centre-half follows. Aim early and flick it first time into the hole.' },
        { num: 11, name: 'Third man', x: 7.5, y: 28.5, role: 'ball', tip: 'Start your run before the 9 gets it. Stay onside, take it in the hole and finish.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'line', x: 13.5, y: 23.5, spd: 5.4 },
        { t: 'line', x: 35, y: 23.5, spd: 5.4 },
        { t: 'line', x: 43.5, y: 23.5, spd: 5.4 },
        { t: 'mark', a: 2, x: 25, y: 26.3, spd: 5.4, eng: 6, react: 18 },
        { t: 'zone', x: 20.1, y: 38.5, spd: 5.2, eng: 5 },
        { t: 'press', x: 23.9, y: 47.4, spd: 5.5 }
      ]
    },
    // 20: Five-man move, generated (seed 4265380011, attempt 36), closing
    {
      id: 'c20',
      name: 'All the way through',
      time: 11,
      brief: 'Five players. Beat the hunter, find the 10 between the lines, then the 7 in behind.',
      lines: { "0": { gap: 10 } },
      att: [
        { num: 4, name: 'Centre-back', x: 31, y: 55, role: 'ball', tip: 'The hunter is coming. Roll it across to the 6 straight away.' },
        { num: 6, name: 'Pivot', x: 18, y: 51, role: 'ball', tip: 'Do not take a touch. Aim early and play it first time to the 8.' },
        { num: 8, name: 'Link', x: 33, y: 44, role: 'ball', tip: 'Carry it on a few steps, then play it into the 10 as he shows for it.' },
        { num: 10, name: 'Creator', x: 28.5, y: 38, role: 'ball', tip: 'Come off your marker. Aim early and slide it first time in behind for the 7.' },
        { num: 7, name: 'Winger', x: 15.5, y: 33, role: 'ball', tip: 'Hold your run until the 10 plays it, then go, run on and finish across the keeper.' }
      ],
      order: [0, 1, 2, 3, 4],
      def: [
        { t: 'line', x: 41.7, y: 29.5, spd: 5.6 },
        { t: 'line', x: 30.2, y: 29.5, spd: 5.6 },
        { t: 'line', x: 20.7, y: 29.5, spd: 5.6 },
        { t: 'line', x: 9.2, y: 29.5, spd: 5.6 },
        { t: 'mark', a: 3, x: 28.3, y: 35.6, spd: 5.7, react: 20 },
        { t: 'zone', x: 16.6, y: 40.9, spd: 5.5, eng: 5 },
        { t: 'press', x: 29.8, y: 47.6, spd: 5.7 }
      ]
    }
  );
})(typeof module !== 'undefined' ? global : window);
