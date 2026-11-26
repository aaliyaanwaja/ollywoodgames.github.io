/* Pack 6: season 6 of the story, fixtures 37-44. Campaign version 2 (docs/foundation/21-campaign-v2.md),
   built by tools/gen/campaign-v2.js to RULEBOOK.md version 2: generated levels and the owner's favourite hand-built ones.
   Rebuild rather than edit by hand; ids (c01-c60) are permanent and never reused. */
(function (root) {
  const L = (root.OMT_LEVELS = root.OMT_LEVELS || []);
  L.push(
    // 37: Switch of play, generated (seed 1113432167, attempt 0), standard
    {
      id: 'c37',
      name: 'Change the point',
      time: 9,
      brief: 'Three players. Their block has slid across to the ball. Switch it behind them on the far side.',
      att: [
        { num: 3, name: 'Left-back', x: 9, y: 45, role: 'ball', tip: 'The hunter is closing. Play it inside to the 6 at once.' },
        { num: 6, name: 'Pivot', x: 23, y: 43.5, role: 'ball', tip: 'Do not dwell on it. Hit the diagonal early, behind their back line on the far side.' },
        { num: 11, name: 'Winger', x: 41, y: 30.5, role: 'ball', tip: 'Stay onside on the far side. Go as the 6 hits it, run on and finish across the keeper.' }
      ],
      order: [0, 1, 2],
      def: [
        { t: 'line', x: 29, y: 26, spd: 5.4 },
        { t: 'line', x: 20, y: 26, spd: 5.4 },
        { t: 'line', x: 11, y: 26, spd: 5.4 },
        { t: 'zone', x: 19.3, y: 37, spd: 5.3, eng: 5 },
        { t: 'press', x: 11.9, y: 37.6, spd: 5.6 },
        { t: 'press', x: 23.2, y: 35.5, spd: 5.5 }
      ]
    },
    // 38: Play through the press, generated (seed 1137766743, attempt 5), standard
    {
      id: 'c38',
      name: 'Out from the back',
      time: 11,
      brief: 'Four players. Beat two hunters with quick passes, then run at their back four and slide the 9 in.',
      att: [
        { num: 4, name: 'Centre-back', x: 19, y: 55, role: 'ball', tip: 'You are being hunted. Play it short to the 6 straight away.' },
        { num: 6, name: 'Pivot', x: 32, y: 51, role: 'ball', tip: 'The second hunter wants you. Aim early and move it first time to the 8.' },
        { num: 8, name: 'Link', x: 17, y: 43.5, role: 'ball', tip: 'Run at their back four, then slip the 9 in behind them.' },
        { num: 9, name: 'Striker', x: 26.5, y: 33.5, role: 'ball', tip: 'Stay level with the last man until the 8 plays it, then run on and finish.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'line', x: 7.5, y: 28.5, spd: 5.3 },
        { t: 'line', x: 18.5, y: 28.5, spd: 5.3 },
        { t: 'line', x: 29, y: 28.5, spd: 5.3 },
        { t: 'line', x: 40.5, y: 28.5, spd: 5.3 },
        { t: 'press', x: 19.7, y: 45, spd: 5.5 },
        { t: 'press', x: 35.1, y: 42.6, spd: 5.4 }
      ]
    },
    // 39: Bend the run, generated (seed 1574252662, attempt 5), standard
    {
      id: 'c39',
      name: 'Bend in behind',
      time: 9,
      brief: 'Four players. A straight run is offside against this high line. Run across it, then bend in behind.',
      lines: { "0": { gap: 8 } },
      att: [
        { num: 4, name: 'Centre-back', x: 30, y: 54, role: 'ball', tip: 'You are being hunted. Play it short to the 6 straight away.' },
        { num: 6, name: 'Pivot', x: 20, y: 50, role: 'ball', tip: 'The screen blocks the wide ball. Play it across into the 10 as he comes off his marker.' },
        { num: 10, name: 'Number ten', x: 27, y: 41, role: 'ball', tip: 'Come off your marker to meet it. Aim early and slide it first time between the centre-halves.' },
        { num: 11, name: 'Left winger', x: 7, y: 34, role: 'ball', tip: 'Run across along their line to stay onside. Bend in behind as the 10 plays it, and finish.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'line', x: 9.8, y: 30, spd: 5.4 },
        { t: 'line', x: 20.3, y: 30, spd: 5.4 },
        { t: 'line', x: 30.8, y: 30, spd: 5.4 },
        { t: 'line', x: 41.3, y: 30, spd: 5.4 },
        { t: 'mark', a: 2, x: 26.9, y: 38.6, spd: 5.4, react: 22 },
        { t: 'zone', x: 17.4, y: 43, spd: 5.3, eng: 5 },
        { t: 'press', x: 35, y: 47.8, spd: 5.7 }
      ]
    },
    // 40: Commit the centre-half, generated (seed 169429676, attempt 4), standard
    {
      id: 'c40',
      name: 'Pull the centre-half',
      time: 9,
      brief: 'Three players. Drive at their back four. When a centre-half commits, play the 9 in behind him.',
      lines: { "0": { gap: 8 } },
      att: [
        { num: 6, name: 'Holder', x: 30, y: 52, role: 'ball', tip: 'The hunter is coming. Play it into the 10 between the lines, away from the screen.' },
        { num: 10, name: 'Number ten', x: 20, y: 37.5, role: 'ball', tip: 'Drive at the left centre-half. When he steps out to you, slip the 9 in on your right before he tackles.' },
        { num: 9, name: 'Striker', x: 31, y: 28.5, role: 'ball', tip: 'Hold your run on their line. Go in behind as the centre-half steps out to the 10, then finish.' }
      ],
      order: [0, 1, 2],
      def: [
        { t: 'line', x: 11.8, y: 25.5, spd: 5.4 },
        { t: 'line', x: 21.3, y: 25.5, spd: 5.4 },
        { t: 'line', x: 30.8, y: 25.5, spd: 5.4 },
        { t: 'line', x: 40.3, y: 25.5, spd: 5.4 },
        { t: 'zone', x: 25.5, y: 41, spd: 5.2, eng: 5 },
        { t: 'press', x: 35.2, y: 45.9, spd: 5.6 }
      ]
    },
    // 41: Beat the trap, generated (seed 2974330647, attempt 3), standard
    {
      id: 'c41',
      name: 'Back, then in behind',
      time: 11,
      brief: 'Four players. Play it back and their high line steps up. Then go in behind it.',
      lines: { "0": { gap: 9 } },
      att: [
        { num: 2, name: 'Right-back', x: 41, y: 44.3, role: 'ball', tip: 'The hunter is on you. Play it back inside to the 6 at once.' },
        { num: 6, name: 'Pivot', x: 27, y: 51, role: 'ball', tip: 'Step past the screen, then play it firmly into the feet of the 10.' },
        { num: 10, name: 'Creator', x: 25, y: 40.5, role: 'ball', tip: 'Come off your marker to meet it. Aim early and slide it first time between the centre-halves.' },
        { num: 9, name: 'Striker', x: 19, y: 39.5, role: 'ball', tip: 'Their line has stepped up. Cross it just as the 10 plays the pass, then run on and finish.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'line', x: 42.2, y: 31.5, spd: 5.5 },
        { t: 'line', x: 31.2, y: 31.5, spd: 5.5 },
        { t: 'line', x: 20.2, y: 31.5, spd: 5.5 },
        { t: 'line', x: 8.7, y: 31.5, spd: 5.5 },
        { t: 'mark', a: 2, x: 25, y: 38.1, spd: 5.6 },
        { t: 'zone', x: 29, y: 43, spd: 5.5, eng: 5 },
        { t: 'press', x: 37.1, y: 37.3, spd: 5.7 }
      ]
    },
    // 42: Short then long, generated (seed 3178945865, attempt 0), standard
    {
      id: 'c42',
      name: 'Spin in behind',
      time: 9,
      brief: 'Four players. Short, short, then long: the 9 drags his marker towards the ball and spins away.',
      lines: { "0": { gap: 9 } },
      att: [
        { num: 4, name: 'Centre-back', x: 36, y: 52, role: 'ball', tip: 'The hunter is coming. Roll it across to the 6 at once.' },
        { num: 6, name: 'Pivot', x: 24, y: 49, role: 'ball', tip: 'Do not take a touch. Aim early and play it first time to the 8.' },
        { num: 8, name: 'Playmaker', x: 13, y: 42, role: 'ball', tip: 'A second hunter is coming. Play it early in behind for the 9.' },
        { num: 9, name: 'Striker', x: 25, y: 32, role: 'ball', tip: 'Check towards the ball, then spin in behind as the 8 plays it, and finish.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'line', x: 36.5, y: 24.5, spd: 5.3 },
        { t: 'line', x: 25.5, y: 24.5, spd: 5.3 },
        { t: 'line', x: 15.5, y: 24.5, spd: 5.3 },
        { t: 'mark', a: 3, x: 25, y: 29.1, spd: 5.4, react: 22, tight: 1.2 },
        { t: 'zone', x: 19.9, y: 36.9, spd: 5.3, eng: 5 },
        { t: 'press', x: 31.1, y: 46.5, spd: 5.4 },
        { t: 'press', x: 7.5, y: 33.6, spd: 5.5 }
      ]
    },
    // 43: The counter, generated (seed 4279268774, attempt 1), hard
    {
      id: 'c43',
      name: 'Two at the back',
      time: 9,
      brief: 'Three players. They are caught upfield with two men back. Break before the rest recover.',
      att: [
        { num: 6, name: 'Ball-winner', x: 20, y: 53, role: 'ball', tip: 'You have just won it. Play it forward to the 10 at once, before the press reaches you.' },
        { num: 10, name: 'Carrier', x: 26, y: 43.5, role: 'ball', tip: 'Run at them. When a centre-half commits to you, play the 7 in behind.' },
        { num: 7, name: 'Winger', x: 38.5, y: 42.5, role: 'ball', tip: 'Keep level with their line, go as the 10 plays it, then finish across the keeper.' }
      ],
      order: [0, 1, 2],
      def: [
        { t: 'line', x: 18.8, y: 28.5, spd: 5.6 },
        { t: 'line', x: 29.3, y: 28.5, spd: 5.6 },
        { t: 'press', x: 12.5, y: 49.1, spd: 5.7 },
        { t: 'press', x: 34.2, y: 47.3, spd: 5.7 }
      ]
    },
    // 44: Ball inside the full-back, hand-built favourite (set E Test 08, generated Ball inside the full-back, seed 501 (fun 5, fair 5, real football 5, 29 takes)), closing
    {
      id: 'c44',
      name: 'The seam',
      time: 7,
      brief: 'Four players. Their full-back is wide to watch the winger. Slide it inside him for the 7 to run on to.',
      att: [
        { num: 6, name: 'Pivot', x: 18, y: 51, role: 'ball', tip: 'You are being hunted. Play it short to the 8 at once.' },
        { num: 8, name: 'Midfielder', x: 34, y: 47, role: 'ball', tip: 'No time to wait. Find the 10 as he shows away from his marker.' },
        { num: 10, name: 'Number ten', x: 26, y: 33, role: 'ball', tip: 'Aim early and play it first time into the seam inside their full-back.' },
        { num: 7, name: 'Winger', x: 44, y: 26, role: 'ball', tip: 'Hold your width on their line. Dart inside the full-back just as the 10 plays it, then finish.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'line', x: 10.3, y: 23.5, spd: 5.5 },
        { t: 'line', x: 19.3, y: 23.5, spd: 5.5 },
        { t: 'line', x: 28.3, y: 23.5, spd: 5.5 },
        { t: 'line', x: 39.8, y: 23.5, spd: 5.5 },
        { t: 'mark', a: 2, x: 25.9, y: 30.4, spd: 5.6 },
        { t: 'zone', x: 23.3, y: 39.1, spd: 5.4, eng: 5 },
        { t: 'press', x: 14.9, y: 43.1, spd: 5.7 }
      ]
    }
  );
})(typeof module !== 'undefined' ? global : window);
