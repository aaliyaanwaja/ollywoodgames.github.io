/* Pack 2: season 2 of the story, fixtures 5-12. Campaign version 2 (docs/foundation/21-campaign-v2.md),
   built by tools/gen/campaign-v2.js to RULEBOOK.md version 2: generated levels and the owner's favourite hand-built ones.
   Rebuild rather than edit by hand; ids (c01-c60) are permanent and never reused. */
(function (root) {
  const L = (root.OMT_LEVELS = root.OMT_LEVELS || []);
  L.push(
    // 5: Third-man run, generated (seed 253645815, attempt 0), standard
    {
      id: 'c05',
      name: 'The third man',
      time: 10,
      engine: { recSpd: 0, dangerR: 0, markLeash: 0 },
      brief: 'Four players. Up to the 9, who comes short. His centre-half follows, and the 11 runs in behind.',
      att: [
        { num: 5, name: 'Centre-back', x: 20, y: 55, role: 'ball', tip: 'Do not play through the screen. Find the 6 on your right before the hunter arrives.' },
        { num: 6, name: 'Holder', x: 34, y: 46, role: 'ball', tip: 'Take it and play it firmly into the 9 as he comes short.' },
        { num: 9, name: 'Target man', x: 25, y: 27, role: 'ball', tip: 'Drop towards the ball and take your man with you. Aim early, play it first time into the hole.' },
        { num: 11, name: 'Third man', x: 12, y: 29.5, role: 'ball', tip: 'Go early. Run inside before the 9 touches it, take it in the hole he left and finish.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'line', x: 14.5, y: 24, spd: 5.1 },
        { t: 'line', x: 34.5, y: 24, spd: 5.1 },
        { t: 'line', x: 44, y: 24, spd: 5.1 },
        { t: 'mark', a: 2, x: 25, y: 24.6, spd: 5.2, eng: 6, react: 16 },
        { t: 'zone', x: 19.8, y: 38.8, spd: 5.1, eng: 5 },
        { t: 'press', x: 23.4, y: 46.1, spd: 5.4 }
      ]
    },
    // 6: Commit the centre-half, generated (seed 4291625044, attempt 0), standard
    {
      id: 'c06',
      name: 'Draw him out',
      time: 10,
      engine: { recSpd: 0, dangerR: 0, markLeash: 0 },
      brief: 'Three players. Run at a centre-half until he steps out to you, then slip the 9 in behind before he tackles.',
      lines: { "0": { gap: 8 } },
      att: [
        { num: 6, name: 'Holder', x: 30, y: 52, role: 'ball', tip: 'You are being hunted. Find the 10 between the lines, round the screen.' },
        { num: 10, name: 'Number ten', x: 20, y: 41, role: 'ball', tip: 'Drive at the left centre-half. When he steps out to you, slip the 9 in on your right before he tackles.' },
        { num: 9, name: 'Striker', x: 31, y: 31.5, role: 'ball', tip: 'Hold your run on their line. Go in behind as the centre-half steps out to the 10, then finish.' }
      ],
      order: [0, 1, 2],
      def: [
        { t: 'line', x: 11.5, y: 28, spd: 5.2 },
        { t: 'line', x: 22, y: 28, spd: 5.2 },
        { t: 'line', x: 32.5, y: 28, spd: 5.2 },
        { t: 'line', x: 42.5, y: 28, spd: 5.2 },
        { t: 'zone', x: 25.3, y: 43.8, spd: 5.1, eng: 5 },
        { t: 'press', x: 35.6, y: 45, spd: 5.5 }
      ]
    },
    // 7: Bend the run, generated (seed 2910666415, attempt 8), standard
    {
      id: 'c07',
      name: 'Along the line',
      time: 10,
      engine: { recSpd: 0, dangerR: 0, markLeash: 0 },
      brief: 'Four players. Their high line holds. The 11 runs along it to stay onside, then bends in behind.',
      lines: { "0": { gap: 9 } },
      att: [
        { num: 4, name: 'Centre-back', x: 30, y: 54, role: 'ball', tip: 'You are being hunted. Play it short to the 6 straight away.' },
        { num: 6, name: 'Pivot', x: 20, y: 50, role: 'ball', tip: 'The screen blocks the wide ball. Play it across into the 10 as he comes off his marker.' },
        { num: 10, name: 'Number ten', x: 27, y: 43, role: 'ball', tip: 'Show away from your marker. Aim early and play it first time in behind.' },
        { num: 11, name: 'Left winger', x: 5.5, y: 35.5, role: 'ball', tip: 'Do not run straight: you will be off. Run along the line, bend in as the 10 plays it, finish.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'line', x: 11, y: 32, spd: 5.1 },
        { t: 'line', x: 20.5, y: 32, spd: 5.1 },
        { t: 'line', x: 31, y: 32, spd: 5.1 },
        { t: 'line', x: 41, y: 32, spd: 5.1 },
        { t: 'mark', a: 2, x: 26.9, y: 40.9, spd: 5.3, react: 22 },
        { t: 'zone', x: 16.2, y: 44.2, spd: 5, eng: 5 },
        { t: 'press', x: 34.8, y: 47.6, spd: 5.4 }
      ]
    },
    // 8: Short then long, generated (seed 3484317533, attempt 2), standard
    {
      id: 'c08',
      name: 'Come short, go long',
      time: 10,
      engine: { recSpd: 0, dangerR: 0, markLeash: 0 },
      brief: 'Four players. Short, short, then long: the 9 drags his marker towards the ball and spins away.',
      lines: { "0": { gap: 9 } },
      att: [
        { num: 4, name: 'Centre-back', x: 14, y: 52, role: 'ball', tip: 'The hunter is coming. Roll it across to the 6 at once.' },
        { num: 6, name: 'Pivot', x: 26, y: 49, role: 'ball', tip: 'Aim early and move it on first time, out to the 8 on your right.' },
        { num: 8, name: 'Playmaker', x: 37, y: 42, role: 'ball', tip: 'A second hunter is coming. Play it early in behind for the 9.' },
        { num: 9, name: 'Striker', x: 25, y: 33.5, role: 'ball', tip: 'Come short so your marker follows. Spin in behind just before the 8 plays it, then finish across the keeper.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'line', x: 14, y: 26, spd: 5.1 },
        { t: 'line', x: 24, y: 26, spd: 5.1 },
        { t: 'line', x: 34, y: 26, spd: 5.1 },
        { t: 'mark', a: 3, x: 25, y: 30.7, spd: 5.1, react: 24, tight: 1.2 },
        { t: 'zone', x: 30.7, y: 36.9, spd: 5, eng: 5 },
        { t: 'press', x: 19.2, y: 46.9, spd: 5.3 },
        { t: 'press', x: 42.2, y: 34, spd: 5.3 }
      ]
    },
    // 9: False nine, generated (seed 3805122881, attempt 1), standard
    {
      id: 'c09',
      name: 'The dropping nine',
      time: 10,
      brief: 'Four players. Your 9 drops off and takes his centre-half with him. The 11 attacks the gap.',
      att: [
        { num: 5, name: 'Centre-back', x: 31, y: 55, role: 'ball', tip: 'Play it short to the 8 on your left.' },
        { num: 9, name: 'False nine', x: 22.5, y: 31.5, role: 'decoy', tip: 'No ball for you. Come short about ten metres and take your marker with you. Then press DONE.' },
        { num: 8, name: 'Playmaker', x: 16, y: 47, role: 'ball', tip: 'Aim early. As it arrives, hit it first time through the hole the 9 has left.' },
        { num: 11, name: 'Runner', x: 17.5, y: 33, role: 'ball', tip: 'Wait on their line, go as the 8 plays it, then run into the hole and finish.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'line', x: 13.5, y: 29, spd: 5.1 },
        { t: 'line', x: 33.5, y: 29, spd: 5.1 },
        { t: 'line', x: 43, y: 29, spd: 5.1 },
        { t: 'mark', a: 1, x: 22.7, y: 28.9, spd: 5.3 },
        { t: 'mark', a: 2, x: 16.4, y: 45, spd: 5.3 },
        { t: 'zone', x: 28.9, y: 44.8, spd: 5.1, eng: 5 }
      ]
    },
    // 10: Play through the press, generated (seed 3079277661, attempt 3), standard
    {
      id: 'c10',
      name: 'Past the hunters',
      time: 10,
      brief: 'Four players. Beat two hunters with quick passes, then run at their back four and slide the 9 in.',
      att: [
        { num: 4, name: 'Centre-back', x: 19, y: 55, role: 'ball', tip: 'You are being hunted. Play it short to the 6 straight away.' },
        { num: 6, name: 'Pivot', x: 32, y: 51, role: 'ball', tip: 'The second hunter wants you. Aim early and move it first time to the 8.' },
        { num: 8, name: 'Link', x: 17, y: 40.5, role: 'ball', tip: 'You are past the press. Drive at the back line and slide the 9 through.' },
        { num: 9, name: 'Striker', x: 29, y: 28.5, role: 'ball', tip: 'Stay level with the last man until the 8 plays it, then run on and finish.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'line', x: 8.8, y: 25.5, spd: 5.2 },
        { t: 'line', x: 19.3, y: 25.5, spd: 5.2 },
        { t: 'line', x: 29.8, y: 25.5, spd: 5.2 },
        { t: 'line', x: 40.3, y: 25.5, spd: 5.2 },
        { t: 'press', x: 18.7, y: 45.5, spd: 5.4 },
        { t: 'press', x: 34.6, y: 43.9, spd: 5.3 }
      ]
    },
    // 11: Five-man move, generated (seed 1876320575, attempt 6), hard
    {
      id: 'c11',
      name: 'Five in a row',
      time: 11,
      brief: 'Five players. Beat the hunter, find the 10 between the lines, then the 7 in behind.',
      lines: { "0": { gap: 8 } },
      att: [
        { num: 4, name: 'Centre-back', x: 31, y: 55, role: 'ball', tip: 'You are being hunted. Play it short to the 6 at once.' },
        { num: 6, name: 'Pivot', x: 18, y: 51, role: 'ball', tip: 'Aim early and move it first time, out to the 8 on the right.' },
        { num: 8, name: 'Link', x: 33, y: 44, role: 'ball', tip: 'Carry it on a few steps, then play it into the 10 as he shows for it.' },
        { num: 10, name: 'Creator', x: 28.5, y: 38, role: 'ball', tip: 'Lose your marker, aim early and play it first time in behind for the 7.' },
        { num: 7, name: 'Winger', x: 13, y: 32, role: 'ball', tip: 'Hold your run until the 10 plays it, then go, run on and finish across the keeper.' }
      ],
      order: [0, 1, 2, 3, 4],
      def: [
        { t: 'line', x: 41.7, y: 29, spd: 5.3 },
        { t: 'line', x: 30.7, y: 29, spd: 5.3 },
        { t: 'line', x: 20.7, y: 29, spd: 5.3 },
        { t: 'line', x: 10.2, y: 29, spd: 5.3 },
        { t: 'mark', a: 3, x: 28.3, y: 35.9, spd: 5.3, react: 18 },
        { t: 'zone', x: 14.7, y: 40.5, spd: 5.2, eng: 5 },
        { t: 'press', x: 30.3, y: 47, spd: 5.4 }
      ]
    },
    // 12: Sweeper-keeper, generated (seed 909166635, attempt 15), closing
    {
      id: 'c12',
      name: 'Nothing over the top',
      time: 10,
      brief: 'Four players. Their keeper sweeps up anything long. Get close, then slip one short pass in.',
      gk: { sweeper: true },
      lines: { "0": { gap: 9 } },
      att: [
        { num: 4, name: 'Centre-back', x: 30, y: 55, role: 'ball', tip: 'The keeper sweeps anything long. Play it out to the 7 on your left.' },
        { num: 7, name: 'Winger', x: 8, y: 45, role: 'ball', tip: 'Aim early and play it inside first time to the 10.' },
        { num: 10, name: 'Creator', x: 19, y: 39, role: 'ball', tip: 'Carry it at the back line, then roll a short pass in behind. Hit it long and it is gone.' },
        { num: 9, name: 'Striker', x: 29, y: 34, role: 'ball', tip: 'Stay onside, go as the 10 plays it, take it before the keeper and finish.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'line', x: 41.2, y: 31, spd: 5.6 },
        { t: 'line', x: 31.2, y: 31, spd: 5.6 },
        { t: 'line', x: 20.7, y: 31, spd: 5.6 },
        { t: 'line', x: 10.7, y: 31, spd: 5.6 },
        { t: 'mark', a: 1, x: 8.7, y: 43, spd: 5.7 },
        { t: 'zone', x: 23.5, y: 46.5, spd: 5.6, eng: 5 }
      ]
    }
  );
})(typeof module !== 'undefined' ? global : window);
