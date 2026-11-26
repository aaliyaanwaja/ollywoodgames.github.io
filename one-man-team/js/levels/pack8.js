/* Pack 8: season 8 of the story, fixtures 53-60. Campaign version 2 (docs/foundation/21-campaign-v2.md),
   built by tools/gen/campaign-v2.js to RULEBOOK.md version 2: generated levels and the owner's favourite hand-built ones.
   Rebuild rather than edit by hand; ids (c01-c60) are permanent and never reused. */
(function (root) {
  const L = (root.OMT_LEVELS = root.OMT_LEVELS || []);
  L.push(
    // 53: Play through the press, generated (seed 1785834104, attempt 11), standard
    {
      id: 'c53',
      name: 'Through the first line',
      time: 10,
      brief: 'Four players. Beat two hunters with quick passes, then run at their back four and slide the 9 in.',
      att: [
        { num: 4, name: 'Centre-back', x: 19, y: 55, role: 'ball', tip: 'The first hunter is on his way. Roll it across to the 6 at once.' },
        { num: 6, name: 'Pivot', x: 32, y: 51, role: 'ball', tip: 'No time on the ball. Aim early and play it first time to the 8.' },
        { num: 8, name: 'Link', x: 17, y: 42.5, role: 'ball', tip: 'Run at their back four, then slip the 9 in behind them.' },
        { num: 9, name: 'Striker', x: 27.5, y: 32, role: 'ball', tip: 'Hold your run on their line. Go as the 8 plays it, then finish across the keeper.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'line', x: 8.3, y: 27.5, spd: 5.4 },
        { t: 'line', x: 19.8, y: 27.5, spd: 5.4 },
        { t: 'line', x: 30.3, y: 27.5, spd: 5.4 },
        { t: 'line', x: 40.8, y: 27.5, spd: 5.4 },
        { t: 'press', x: 20.4, y: 45.6, spd: 5.5 },
        { t: 'press', x: 35.4, y: 44.2, spd: 5.7 }
      ]
    },
    // 54: Third-man run, generated (seed 1808024967, attempt 0), standard
    {
      id: 'c54',
      name: 'Off the 9',
      time: 9,
      brief: 'Four players. The 9 comes short and drags his centre-half out. The 11 runs into the hole.',
      att: [
        { num: 5, name: 'Centre-back', x: 20, y: 55, role: 'ball', tip: 'Do not play through the screen. Find the 6 on your right before the hunter arrives.' },
        { num: 6, name: 'Holder', x: 34, y: 46, role: 'ball', tip: 'One touch to set it, then a firm pass into the 9 as he shows.' },
        { num: 9, name: 'Target man', x: 25, y: 27.5, role: 'ball', tip: 'Come short so the centre-half follows. Aim early and flick it first time into the hole.' },
        { num: 11, name: 'Third man', x: 7.5, y: 27.5, role: 'ball', tip: 'Go early. Run inside before the 9 touches it, take it in the hole he left and finish.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'line', x: 13.5, y: 23.5, spd: 5.6 },
        { t: 'line', x: 34, y: 23.5, spd: 5.6 },
        { t: 'line', x: 43, y: 23.5, spd: 5.6 },
        { t: 'mark', a: 2, x: 25, y: 25.3, spd: 5.7, eng: 6, react: 22, tight: 0.9 },
        { t: 'zone', x: 20.8, y: 39.2, spd: 5.6, eng: 5 },
        { t: 'press', x: 22.2, y: 47.8, spd: 5.7 }
      ]
    },
    // 55: Ball inside the full-back, generated (seed 2530286079, attempt 2), standard
    {
      id: 'c55',
      name: 'Dart inside',
      time: 9,
      brief: 'Four players. Their full-back is wide to watch the winger. Slide it inside him for the 7 to run on to.',
      att: [
        { num: 6, name: 'Pivot', x: 18, y: 51, role: 'ball', tip: 'You are being hunted. Play it short to the 8 at once.' },
        { num: 8, name: 'Midfielder', x: 34, y: 47, role: 'ball', tip: 'No time to wait. Find the 10 as he shows away from his marker.' },
        { num: 10, name: 'Number ten', x: 26, y: 35, role: 'ball', tip: 'Aim early and play it first time into the seam inside their full-back.' },
        { num: 7, name: 'Winger', x: 44, y: 27, role: 'ball', tip: 'Stay wide and onside. Go as the 10 plays it, inside the full-back, then finish.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'line', x: 10.3, y: 24.5, spd: 5.5 },
        { t: 'line', x: 19.3, y: 24.5, spd: 5.5 },
        { t: 'line', x: 28.3, y: 24.5, spd: 5.5 },
        { t: 'line', x: 39.8, y: 24.5, spd: 5.5 },
        { t: 'mark', a: 2, x: 25.9, y: 32.7, spd: 5.5 },
        { t: 'zone', x: 24, y: 40, spd: 5.5, eng: 5 },
        { t: 'press', x: 14.7, y: 42.6, spd: 5.7 }
      ]
    },
    // 56: Bend the run, generated (seed 1051372319, attempt 0), standard
    {
      id: 'c56',
      name: 'Curve it in behind',
      time: 10,
      brief: 'Four players. A straight run is offside against this high line. Run across it, then bend in behind.',
      lines: { "0": { gap: 8 } },
      att: [
        { num: 4, name: 'Centre-back', x: 30, y: 54, role: 'ball', tip: 'You are being hunted. Play it short to the 6 straight away.' },
        { num: 6, name: 'Pivot', x: 20, y: 50, role: 'ball', tip: 'Not out wide: the screen is there. Find the 10 as he shows for it.' },
        { num: 10, name: 'Number ten', x: 27, y: 41, role: 'ball', tip: 'Show away from your marker. Aim early and play it first time in behind.' },
        { num: 11, name: 'Left winger', x: 6, y: 33, role: 'ball', tip: 'Run across along their line to stay onside. Bend in behind as the 10 plays it, and finish.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'line', x: 12.5, y: 30, spd: 5.4 },
        { t: 'line', x: 22.5, y: 30, spd: 5.4 },
        { t: 'line', x: 32, y: 30, spd: 5.4 },
        { t: 'line', x: 41.5, y: 30, spd: 5.4 },
        { t: 'mark', a: 2, x: 26.9, y: 38.6, spd: 5.6, react: 16 },
        { t: 'zone', x: 16.8, y: 42.5, spd: 5.4, eng: 5 },
        { t: 'press', x: 36.2, y: 48.2, spd: 5.5 }
      ]
    },
    // 57: Short then long, generated (seed 60933227, attempt 0), standard
    {
      id: 'c57',
      name: 'The double movement',
      time: 10,
      brief: 'Four players. The 9 comes short to pull his marker up the pitch, then spins in behind him.',
      lines: { "0": { gap: 9 } },
      att: [
        { num: 4, name: 'Centre-back', x: 36, y: 52, role: 'ball', tip: 'The hunter is coming. Roll it across to the 6 at once.' },
        { num: 6, name: 'Pivot', x: 24, y: 49, role: 'ball', tip: 'Aim early and move it on first time, out to the 8 on your left.' },
        { num: 8, name: 'Playmaker', x: 13, y: 42, role: 'ball', tip: 'A second hunter is coming. Play it early in behind for the 9.' },
        { num: 9, name: 'Striker', x: 25, y: 31, role: 'ball', tip: 'Come short so your marker follows. Spin in behind just before the 8 plays it, then finish across the keeper.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'line', x: 36.2, y: 24, spd: 5.6 },
        { t: 'line', x: 25.7, y: 24, spd: 5.6 },
        { t: 'line', x: 15.7, y: 24, spd: 5.6 },
        { t: 'mark', a: 3, x: 25, y: 28.1, spd: 5.6, react: 24, tight: 1.2 },
        { t: 'zone', x: 19.6, y: 36, spd: 5.4, eng: 5 },
        { t: 'press', x: 30.1, y: 46.6, spd: 5.7 },
        { t: 'press', x: 5.8, y: 35.8, spd: 5.7 }
      ]
    },
    // 58: Commit the centre-half, generated (seed 598517807, attempt 0), standard
    {
      id: 'c58',
      name: 'Commit the centre-half',
      time: 9,
      brief: 'Three players. Run at a centre-half until he steps out to you, then slip the 9 in behind before he tackles.',
      lines: { "0": { gap: 8 } },
      att: [
        { num: 6, name: 'Holder', x: 30, y: 52, role: 'ball', tip: 'You are being hunted. Find the 10 between the lines, round the screen.' },
        { num: 10, name: 'Number ten', x: 20, y: 40, role: 'ball', tip: 'Drive at the left centre-half. When he steps out to you, slip the 9 in on your right before he tackles.' },
        { num: 9, name: 'Striker', x: 31, y: 32, role: 'ball', tip: 'Stay onside. Go as the 10 plays it, then run on and finish across the keeper.' }
      ],
      order: [0, 1, 2],
      def: [
        { t: 'line', x: 11.3, y: 28, spd: 5.6 },
        { t: 'line', x: 21.8, y: 28, spd: 5.6 },
        { t: 'line', x: 31.3, y: 28, spd: 5.6 },
        { t: 'line', x: 41.8, y: 28, spd: 5.6 },
        { t: 'zone', x: 25.3, y: 43.3, spd: 5.4, eng: 5 },
        { t: 'press', x: 36, y: 45.9, spd: 5.7 }
      ]
    },
    // 59: The counter, generated (seed 2799338389, attempt 1), hard
    {
      id: 'c59',
      name: 'Break at speed',
      time: 10,
      brief: 'Three players. They are caught upfield with two men back. Break before the rest recover.',
      att: [
        { num: 6, name: 'Ball-winner', x: 30, y: 53, role: 'ball', tip: 'You have just won it. Play it forward to the 10 at once, before the press reaches you.' },
        { num: 10, name: 'Carrier', x: 24, y: 40.5, role: 'ball', tip: 'Run at them. When a centre-half commits to you, play the 7 in behind.' },
        { num: 7, name: 'Winger', x: 11.5, y: 39.5, role: 'ball', tip: 'Sprint to stay level with the 10, take his pass beyond the last man and finish.' }
      ],
      order: [0, 1, 2],
      def: [
        { t: 'line', x: 31, y: 25.5, spd: 5.7 },
        { t: 'line', x: 20, y: 25.5, spd: 5.7 },
        { t: 'press', x: 36.2, y: 49.2, spd: 5.7 },
        { t: 'press', x: 15.1, y: 45, spd: 5.7 }
      ]
    },
    // 60: Five-man move, hand-built favourite (baseline 19 (set A fun 4, 15 takes; set B fun 5, 20 takes; set C fun 4; set E fun 5)), closing
    {
      id: 'c60',
      oldName: 'Five-man move',
      name: 'Five-man move',
      time: 10,
      brief: 'Five players, four passes, one finish. Every touch has to fit the ones before it.',
      lines: { "0": { gap: 9 } },
      att: [
        { num: 4, name: 'Centre-back', x: 19, y: 55, role: 'ball', tip: 'The hunter is coming. Roll it across to the 6 straight away.' },
        { num: 6, name: 'Pivot', x: 32, y: 51, role: 'ball', tip: 'Aim early and move it first time, out to the 8 on the left.' },
        { num: 8, name: 'Link', x: 17, y: 42, role: 'ball', tip: 'Take it forward a few yards, then find the 10 as he comes short.' },
        { num: 10, name: 'Creator', x: 21.5, y: 36, role: 'ball', tip: 'Come off your marker. Aim early and slide it first time in behind for the 7.' },
        { num: 7, name: 'Winger', x: 38, y: 31.5, role: 'ball', tip: 'Cut in off the right as the 10 plays it. Stay onside, run on and finish.' }
      ],
      order: [0, 1, 2, 3, 4],
      def: [
        { t: 'press', x: 20, y: 46, spd: 5.7 },
        { t: 'zone', x: 36, y: 40, spd: 5.4, eng: 5 },
        { t: 'mark', a: 3, x: 21.8, y: 33.6, spd: 5.6 },
        { t: 'line', x: 9, y: 27, spd: 5.5 },
        { t: 'line', x: 20, y: 27, spd: 5.5 },
        { t: 'line', x: 30, y: 27, spd: 5.5 },
        { t: 'line', x: 41, y: 27, spd: 5.5 }
      ]
    }
  );
})(typeof module !== 'undefined' ? global : window);
