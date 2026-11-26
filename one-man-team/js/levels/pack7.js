/* Pack 7: season 7 of the story, fixtures 45-52. Campaign version 2 (docs/foundation/21-campaign-v2.md),
   built by tools/gen/campaign-v2.js to RULEBOOK.md version 2: generated levels and the owner's favourite hand-built ones.
   Rebuild rather than edit by hand; ids (c01-c60) are permanent and never reused. */
(function (root) {
  const L = (root.OMT_LEVELS = root.OMT_LEVELS || []);
  L.push(
    // 45: Commit the centre-half, generated (seed 2788264165, attempt 25), hard
    {
      id: 'c45',
      name: 'Take on the line',
      time: 8,
      brief: 'Three players. Drive at their back four. When a centre-half commits, play the 9 in behind him.',
      lines: { "0": { gap: 8 } },
      att: [
        { num: 6, name: 'Holder', x: 20, y: 52, role: 'ball', tip: 'You are being hunted. Find the 10 between the lines, round the screen.' },
        { num: 10, name: 'Number ten', x: 30, y: 37.5, role: 'ball', tip: 'Drive at the right centre-half. When he steps out to you, slip the 9 in on your left before he tackles.' },
        { num: 9, name: 'Striker', x: 19, y: 28, role: 'ball', tip: 'Hold your run on their line. Go in behind as the centre-half steps out to the 10, then finish.' }
      ],
      order: [0, 1, 2],
      def: [
        { t: 'line', x: 39.2, y: 25.5, spd: 5.7 },
        { t: 'line', x: 29.7, y: 25.5, spd: 5.7 },
        { t: 'line', x: 19.2, y: 25.5, spd: 5.7 },
        { t: 'line', x: 9.7, y: 25.5, spd: 5.7 },
        { t: 'zone', x: 24.5, y: 41, spd: 5.6, eng: 5 },
        { t: 'press', x: 13.9, y: 45.4, spd: 5.7 }
      ]
    },
    // 46: Wing and cut-back, generated (seed 1342420446, attempt 9), hard
    {
      id: 'c46',
      name: 'The cut-back',
      time: 7,
      brief: 'Four players and a decoy. In behind, to the byline, and back to the spot the 9 has cleared.',
      att: [
        { num: 6, name: 'Pivot', x: 18, y: 51, role: 'ball', tip: 'You are being hunted. Find the 8 on your right straight away.' },
        { num: 8, name: 'Midfielder', x: 31, y: 34, role: 'ball', tip: 'Do not take a touch. Aim early and play it first time into the channel for the 7.' },
        { num: 7, name: 'Winger', x: 44, y: 24, role: 'ball', tip: 'Dart inside the full-back as the 8 plays it, reach the byline and pull it back to the spot.' },
        { num: 10, name: 'Late runner', x: 22, y: 32, role: 'ball', tip: 'Do not get there early. Meet the cut-back on the spot and hit it first time.' },
        { num: 9, name: 'Centre-forward', x: 23.5, y: 24, role: 'decoy', tip: 'No ball for you. Take your marker towards the near post, then press DONE.' }
      ],
      order: [0, 4, 1, 2, 3],
      def: [
        { t: 'line', x: 10.8, y: 21, spd: 5.7 },
        { t: 'line', x: 19.8, y: 21, spd: 5.7 },
        { t: 'line', x: 28.8, y: 21, spd: 5.7 },
        { t: 'line', x: 39.3, y: 21, spd: 5.7 },
        { t: 'mark', a: 4, x: 23.7, y: 21.5, spd: 5.7 },
        { t: 'zone', x: 25.2, y: 36.6, spd: 5.7, eng: 5 },
        { t: 'press', x: 13.6, y: 44.3, spd: 5.7 }
      ]
    },
    // 47: Third-man run, hand-built favourite (baseline 10 (set A fun 5; set C with A+B: fun 5, fair 5, 12 takes, all at the finish)), hard
    {
      id: 'c47',
      name: 'Third-man run',
      time: 8,
      brief: 'Four players. The 9 comes short and drags his centre-half out. The 11 runs into the hole.',
      att: [
        { num: 5, name: 'Centre-back', x: 20, y: 55, role: 'ball', tip: 'The hunter is on you and the screen blocks the straight pass. Roll it across to the 6 on your right.' },
        { num: 6, name: 'Holder', x: 34, y: 46, role: 'ball', tip: 'Take it and play it firmly into the 9 as he comes short.' },
        { num: 9, name: 'Target man', x: 25, y: 28, role: 'ball', tip: 'Come short so the centre-half follows. Aim early and flick it first time into the hole.' },
        { num: 11, name: 'Third man', x: 9, y: 30, role: 'ball', tip: 'Go early. Run inside before the 9 touches it, take it in the hole he left and finish.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'zone', x: 20, y: 41, spd: 5.3, eng: 5 },
        { t: 'press', x: 17.5, y: 47.2, spd: 5.7 },
        { t: 'mark', a: 2, x: 25, y: 25.6, spd: 5.7, eng: 6, agg: 0.7 },
        { t: 'line', x: 15, y: 25, spd: 5.5, agg: 0.7 },
        { t: 'line', x: 35, y: 25, spd: 5.5, agg: 0.7 },
        { t: 'line', x: 44.5, y: 25, spd: 5.5, agg: 0.7 }
      ]
    },
    // 48: Sweeper-keeper, generated (seed 124730344, attempt 31), standard
    {
      id: 'c48',
      name: 'Keeper off his line',
      time: 12,
      brief: 'Four players. A high line and a keeper off his line. Play short in behind, never long.',
      gk: { sweeper: true },
      lines: { "0": { gap: 8 } },
      att: [
        { num: 4, name: 'Centre-back', x: 20, y: 55, role: 'ball', tip: 'The keeper sweeps anything long. Play it out to the 7 on your right.' },
        { num: 7, name: 'Winger', x: 42, y: 45.5, role: 'ball', tip: 'Come to the ball, then play it inside to the 10 before the full-back closes.' },
        { num: 10, name: 'Creator', x: 31, y: 38, role: 'ball', tip: 'Run at their line, then play a short ball in behind. Not too hard: the keeper is out.' },
        { num: 9, name: 'Striker', x: 21, y: 31.5, role: 'ball', tip: 'Dart across the centre-half as the 10 plays it. Beat the keeper to it and finish.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'line', x: 9, y: 29.5, spd: 5.3 },
        { t: 'line', x: 19.5, y: 29.5, spd: 5.3 },
        { t: 'line', x: 29, y: 29.5, spd: 5.3 },
        { t: 'line', x: 39, y: 29.5, spd: 5.3 },
        { t: 'mark', a: 1, x: 41.2, y: 43.3, spd: 5.5 },
        { t: 'zone', x: 25.6, y: 45.4, spd: 5.1, eng: 5 }
      ]
    },
    // 49: Bend the run, generated (seed 2763356719, attempt 1), hard
    {
      id: 'c49',
      name: 'Run the line',
      time: 8,
      brief: 'Four players. A straight run is offside against this high line. Run across it, then bend in behind.',
      lines: { "0": { gap: 9 } },
      att: [
        { num: 4, name: 'Centre-back', x: 20, y: 54, role: 'ball', tip: 'The hunter is coming. Roll it across to the 6 on your right at once.' },
        { num: 6, name: 'Pivot', x: 30, y: 50, role: 'ball', tip: 'The screen blocks the wide ball. Play it across into the 10 as he comes off his marker.' },
        { num: 10, name: 'Number ten', x: 23, y: 42.5, role: 'ball', tip: 'Come off your marker to meet it. Aim early and slide it first time between the centre-halves.' },
        { num: 7, name: 'Right winger', x: 41, y: 35.5, role: 'ball', tip: 'Do not run straight: you will be off. Run along the line, bend in as the 10 plays it, finish.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'line', x: 39.7, y: 31.5, spd: 5.5 },
        { t: 'line', x: 30.2, y: 31.5, spd: 5.5 },
        { t: 'line', x: 19.7, y: 31.5, spd: 5.5 },
        { t: 'line', x: 9.2, y: 31.5, spd: 5.5 },
        { t: 'mark', a: 2, x: 23.1, y: 40.4, spd: 5.7, react: 16 },
        { t: 'zone', x: 31.5, y: 43.8, spd: 5.4, eng: 5 },
        { t: 'press', x: 14, y: 48.7, spd: 5.6 }
      ]
    },
    // 50: Up, back and through, generated (seed 451277248, attempt 11), hard
    {
      id: 'c50',
      name: 'Lay it back, then in',
      time: 9,
      brief: 'Four players. Fire it up to the 9, he sets it back, and the 10 plays the 7 in behind.',
      lines: { "0": { gap: 9 } },
      att: [
        { num: 6, name: 'Pivot', x: 28, y: 51, role: 'ball', tip: 'You are being hunted. Play it up to the 9, not to the 10.' },
        { num: 9, name: 'Target man', x: 25, y: 32.5, role: 'ball', tip: 'Your marker is tight. Aim early and lay it back first time to the 10.' },
        { num: 10, name: 'Number ten', x: 19, y: 45, role: 'ball', tip: 'Aim early and play it first time in behind their line for the 7.' },
        { num: 7, name: 'Winger', x: 10, y: 31, role: 'ball', tip: 'Their line steps up on the ball back. Cross it as the 10 plays it, run on and finish across the keeper.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'line', x: 42, y: 27.5, spd: 5.6 },
        { t: 'line', x: 31.5, y: 27.5, spd: 5.6 },
        { t: 'line', x: 21.5, y: 27.5, spd: 5.6 },
        { t: 'line', x: 12, y: 27.5, spd: 5.6 },
        { t: 'mark', a: 1, x: 25, y: 30.3, spd: 5.7, react: 22 },
        { t: 'zone', x: 21.5, y: 43.1, spd: 5.6, eng: 5 },
        { t: 'press', x: 32.2, y: 44.2, spd: 5.7 }
      ]
    },
    // 51: Switch of play, generated (seed 3202061019, attempt 10), hard
    {
      id: 'c51',
      name: 'Over to the far side',
      time: 9,
      brief: 'Three players. Their block has slid across to the ball. Switch it behind them on the far side.',
      att: [
        { num: 3, name: 'Left-back', x: 9, y: 45, role: 'ball', tip: 'The hunter is closing. Play it inside to the 6 at once.' },
        { num: 6, name: 'Pivot', x: 23, y: 44.5, role: 'ball', tip: 'Aim early and switch it first time, in behind them on the far side.' },
        { num: 11, name: 'Winger', x: 44.5, y: 33.5, role: 'ball', tip: 'Wait for the switch. Go as the 6 plays it, drive into the box and shoot across the keeper.' }
      ],
      order: [0, 1, 2],
      def: [
        { t: 'line', x: 27.2, y: 29, spd: 5.7 },
        { t: 'line', x: 18.7, y: 29, spd: 5.7 },
        { t: 'line', x: 9.7, y: 29, spd: 5.7 },
        { t: 'zone', x: 20.9, y: 38, spd: 5.6, eng: 5 },
        { t: 'press', x: 13.2, y: 37.6, spd: 5.7 },
        { t: 'press', x: 23.8, y: 36.3, spd: 5.7 }
      ]
    },
    // 52: Beat the trap, generated (seed 3446125011, attempt 0), closing
    {
      id: 'c52',
      name: 'Through the high line',
      time: 10,
      brief: 'Four players. Play it back and their high line steps up. Then go in behind it.',
      lines: { "0": { gap: 9 } },
      att: [
        { num: 2, name: 'Right-back', x: 41, y: 44.3, role: 'ball', tip: 'You are being hunted. Roll it back inside to the 6 before he gets to you.' },
        { num: 6, name: 'Pivot', x: 27, y: 51, role: 'ball', tip: 'Step past the screen, then play it firmly into the feet of the 10.' },
        { num: 10, name: 'Creator', x: 25, y: 40.5, role: 'ball', tip: 'Come off your marker to meet it. Aim early and slide it first time between the centre-halves.' },
        { num: 9, name: 'Striker', x: 19, y: 38, role: 'ball', tip: 'Their line steps up on you. Wait, go as the 10 plays it, then run on and finish.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'line', x: 41.7, y: 31.5, spd: 5.7 },
        { t: 'line', x: 30.2, y: 31.5, spd: 5.7 },
        { t: 'line', x: 19.7, y: 31.5, spd: 5.7 },
        { t: 'line', x: 8.2, y: 31.5, spd: 5.7 },
        { t: 'mark', a: 2, x: 25, y: 38.4, spd: 5.7 },
        { t: 'zone', x: 28.1, y: 43.2, spd: 5.7, eng: 5 },
        { t: 'press', x: 37.2, y: 37.9, spd: 5.7 }
      ]
    }
  );
})(typeof module !== 'undefined' ? global : window);
