/* Pack 5: season 5 of the story, fixtures 29-36. Campaign version 2 (docs/foundation/21-campaign-v2.md),
   built by tools/gen/campaign-v2.js to RULEBOOK.md version 2: generated levels and the owner's favourite hand-built ones.
   Rebuild rather than edit by hand; ids (c01-c60) are permanent and never reused. */
(function (root) {
  const L = (root.OMT_LEVELS = root.OMT_LEVELS || []);
  L.push(
    // 29: Wing and cut-back, generated (seed 2313230489, attempt 2), hard
    {
      id: 'c29',
      name: 'Round the back',
      time: 9,
      brief: 'Four players and a decoy. The 9 takes his man to the near post; cut it back behind him.',
      att: [
        { num: 6, name: 'Pivot', x: 32, y: 51, role: 'ball', tip: 'You are being hunted. Find the 8 on your left straight away.' },
        { num: 8, name: 'Midfielder', x: 19, y: 33, role: 'ball', tip: 'Do not take a touch. Aim early and play it first time into the channel for the 7.' },
        { num: 7, name: 'Winger', x: 6, y: 24, role: 'ball', tip: 'Dart inside the full-back as the 8 plays it, reach the byline and pull it back to the spot.' },
        { num: 10, name: 'Late runner', x: 28, y: 32.5, role: 'ball', tip: 'Do not get there early. Meet the cut-back on the spot and hit it first time.' },
        { num: 9, name: 'Centre-forward', x: 26.5, y: 24.5, role: 'decoy', tip: 'No ball for you. Run at the near post so your marker goes with you, then press DONE.' }
      ],
      order: [0, 4, 1, 2, 3],
      def: [
        { t: 'line', x: 40.5, y: 21.5, spd: 5.6 },
        { t: 'line', x: 31, y: 21.5, spd: 5.6 },
        { t: 'line', x: 22, y: 21.5, spd: 5.6 },
        { t: 'line', x: 10.5, y: 21.5, spd: 5.6 },
        { t: 'mark', a: 4, x: 26.4, y: 22.3, spd: 5.6 },
        { t: 'zone', x: 24.9, y: 36.9, spd: 5.5, eng: 5 },
        { t: 'press', x: 36.2, y: 45, spd: 5.7 }
      ]
    },
    // 30: Diagonal in behind, generated (seed 3926179015, attempt 2), hard
    {
      id: 'c30',
      name: 'Hit the far man',
      time: 9,
      brief: 'Three players. Their back four has shifted over. Find the far man in behind with one long ball.',
      att: [
        { num: 4, name: 'Centre-back', x: 30, y: 54, role: 'ball', tip: 'The hunter is coming. Play it to the 8 on your left at once.' },
        { num: 8, name: 'Playmaker', x: 15, y: 44.5, role: 'ball', tip: 'Take one touch away from the screen and hit the long diagonal early.' },
        { num: 7, name: 'Inside forward', x: 40.5, y: 30, role: 'ball', tip: 'Stay level with the last man until the diagonal is hit, then cut in behind and finish.' }
      ],
      order: [0, 1, 2],
      def: [
        { t: 'line', x: 5, y: 26.5, spd: 5.4 },
        { t: 'line', x: 13, y: 26.5, spd: 5.4 },
        { t: 'line', x: 21, y: 26.5, spd: 5.4 },
        { t: 'line', x: 29, y: 26.5, spd: 5.4 },
        { t: 'zone', x: 13.5, y: 40.5, spd: 5.3, eng: 6 },
        { t: 'press', x: 28.9, y: 46.6, spd: 5.6 }
      ]
    },
    // 31: Ball inside the full-back, hand-built favourite (set D B4 (fun 4, fair 5, real football 4, 4 takes)), hard
    {
      id: 'c31',
      name: 'Ball inside the full-back',
      time: 8,
      brief: 'Four players. Their full-back is wide to watch the winger. Slide it inside him for the 7 to run on to.',
      att: [
        { num: 6, name: 'Pivot', x: 18, y: 51, role: 'ball', tip: 'The hunter is coming. Roll it across to the 8 on your right.' },
        { num: 8, name: 'Midfielder', x: 34, y: 47, role: 'ball', tip: 'Do not dwell: the screen steps across. Play it at once into the 10 as he comes off his marker.' },
        { num: 10, name: 'Number ten', x: 26, y: 35, role: 'ball', tip: 'Come off your marker. Aim early and slide it first time inside the full-back.' },
        { num: 7, name: 'Winger', x: 44, y: 28, role: 'ball', tip: 'Hold your width on their line. Dart inside the full-back just as the 10 plays it, then finish.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'press', x: 14, y: 44, spd: 5.3 },
        { t: 'zone', x: 23, y: 40.5, spd: 5.2, eng: 5 },
        { t: 'mark', a: 2, x: 25.8, y: 32.6, spd: 5.3 },
        { t: 'line', x: 12, y: 25, spd: 5.2 },
        { t: 'line', x: 21, y: 25, spd: 5.2 },
        { t: 'line', x: 30, y: 25, spd: 5.2 },
        { t: 'line', x: 41.5, y: 25, spd: 5.2 }
      ]
    },
    // 32: Sweeper-keeper, generated (seed 3498731641, attempt 22), standard
    {
      id: 'c32',
      name: 'Under the sweeper',
      time: 12,
      brief: 'Four players. Their keeper sweeps up anything long. Get close, then slip one short pass in.',
      gk: { sweeper: true },
      lines: { "0": { gap: 9 } },
      att: [
        { num: 4, name: 'Centre-back', x: 20, y: 55, role: 'ball', tip: 'The keeper sweeps anything long. Play it out to the 7 on your right.' },
        { num: 7, name: 'Winger', x: 42, y: 44, role: 'ball', tip: 'Aim early and play it inside first time to the 10.' },
        { num: 10, name: 'Creator', x: 31, y: 38.5, role: 'ball', tip: 'Carry it at the back line, then roll a short pass in behind. Hit it long and it is gone.' },
        { num: 9, name: 'Striker', x: 21, y: 32.5, role: 'ball', tip: 'Dart across the centre-half as the 10 plays it. Beat the keeper to it and finish.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'line', x: 10.3, y: 30.5, spd: 5.3 },
        { t: 'line', x: 19.8, y: 30.5, spd: 5.3 },
        { t: 'line', x: 30.3, y: 30.5, spd: 5.3 },
        { t: 'line', x: 39.8, y: 30.5, spd: 5.3 },
        { t: 'mark', a: 1, x: 41.2, y: 42, spd: 5.3 },
        { t: 'zone', x: 25.6, y: 45.6, spd: 5.3, eng: 5 }
      ]
    },
    // 33: Beat the trap, hand-built favourite (baseline 13 (set A: fun 5, fair 5, 13 takes; set C fun 4-5)), hard
    {
      id: 'c33',
      oldName: 'Beat the trap',
      name: 'Beat the trap',
      time: 10,
      brief: 'Four players. The back line steps up when the ball goes back. Time the last run or you are off.',
      lines: { "0": { gap: 8 } },
      att: [
        { num: 3, name: 'Left-back', x: 9, y: 44.8, role: 'ball', tip: 'You are being hunted. Roll it back inside to the 6 before he gets to you.' },
        { num: 6, name: 'Pivot', x: 23, y: 51, role: 'ball', tip: 'Step past the screen, then play it firmly into the feet of the 10.' },
        { num: 10, name: 'Creator', x: 25, y: 41, role: 'ball', tip: 'Come off your marker to meet it. Aim early and slide it first time between the centre-halves.' },
        { num: 9, name: 'Striker', x: 31, y: 39.5, role: 'ball', tip: 'Their line has stepped up. Cross it just as the 10 plays the pass, then run on and finish.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'press', x: 12, y: 38, spd: 5.5 },
        { t: 'zone', x: 21, y: 44, spd: 5.1, eng: 5 },
        { t: 'mark', a: 2, x: 25, y: 38.6, spd: 5.4 },
        { t: 'line', x: 8, y: 32, spd: 5.4 },
        { t: 'line', x: 19.5, y: 32, spd: 5.4 },
        { t: 'line', x: 30.5, y: 32, spd: 5.4 },
        { t: 'line', x: 42, y: 32, spd: 5.4 }
      ]
    },
    // 34: Up, back and through, generated (seed 1333623150, attempt 23), hard
    {
      id: 'c34',
      name: 'Bounce it off the 9',
      time: 9,
      brief: 'Four players. Fire it up to the 9, he sets it back, and the 10 plays the 7 in behind.',
      lines: { "0": { gap: 9 } },
      att: [
        { num: 6, name: 'Pivot', x: 22, y: 51, role: 'ball', tip: 'The hunter is on you and the screen blocks the 10. Fire it up to the feet of the 9.' },
        { num: 9, name: 'Target man', x: 25, y: 35, role: 'ball', tip: 'Your marker is tight. Aim early and lay it back first time to the 10.' },
        { num: 10, name: 'Number ten', x: 31, y: 45, role: 'ball', tip: 'Aim early and play it first time in behind their line for the 7.' },
        { num: 7, name: 'Winger', x: 40, y: 32.5, role: 'ball', tip: 'Wait on their line as it steps up. Go as the 10 plays it, then finish.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'line', x: 9.8, y: 29, spd: 5.6 },
        { t: 'line', x: 19.8, y: 29, spd: 5.6 },
        { t: 'line', x: 30.3, y: 29, spd: 5.6 },
        { t: 'line', x: 40.3, y: 29, spd: 5.6 },
        { t: 'mark', a: 1, x: 25, y: 32.4, spd: 5.6, react: 16 },
        { t: 'zone', x: 28.8, y: 44, spd: 5.6, eng: 5 },
        { t: 'press', x: 17.6, y: 44.3, spd: 5.7 }
      ]
    },
    // 35: Third-man run, generated (seed 1645646622, attempt 22), hard
    {
      id: 'c35',
      name: 'The run from wide',
      time: 8,
      brief: 'Four players. The 9 comes short and drags his centre-half out. The 11 runs into the hole.',
      att: [
        { num: 5, name: 'Centre-back', x: 30, y: 55, role: 'ball', tip: 'The hunter is on you and the screen blocks the straight pass. Roll it across to the 6 on your left.' },
        { num: 6, name: 'Holder', x: 16, y: 46, role: 'ball', tip: 'Take it and play it firmly into the 9 as he comes short.' },
        { num: 9, name: 'Target man', x: 25, y: 26.5, role: 'ball', tip: 'Drop towards the ball and take your man with you. Aim early, play it first time into the hole.' },
        { num: 11, name: 'Third man', x: 37.5, y: 29, role: 'ball', tip: 'Go early. Run inside before the 9 touches it, take it in the hole he left and finish.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'line', x: 36, y: 23, spd: 5.5 },
        { t: 'line', x: 14.5, y: 23, spd: 5.5 },
        { t: 'line', x: 5, y: 23, spd: 5.5 },
        { t: 'mark', a: 2, x: 25, y: 23.9, spd: 5.5, eng: 6, react: 14 },
        { t: 'zone', x: 29.2, y: 38.7, spd: 5.5, eng: 5 },
        { t: 'press', x: 25.3, y: 47.9, spd: 5.7 }
      ]
    },
    // 36: Bend the run, hand-built favourite (set D C2 (fun 5, fair 5, real football 5, 10 takes)), closing
    {
      id: 'c36',
      name: 'Bend the run',
      time: 7,
      brief: 'Four players. Their high line holds. The 11 runs along it to stay onside, then bends in behind.',
      lines: { "0": { gap: 8 } },
      att: [
        { num: 4, name: 'Centre-back', x: 30, y: 54, role: 'ball', tip: 'The hunter is coming. Roll it across to the 6 on your left at once.' },
        { num: 6, name: 'Pivot', x: 20, y: 50, role: 'ball', tip: 'The screen blocks the wide ball. Play it across into the 10 as he comes off his marker.' },
        { num: 10, name: 'Number ten', x: 27, y: 41, role: 'ball', tip: 'Come off your marker to meet it. Aim early and slide it first time between the centre-halves.' },
        { num: 11, name: 'Left winger', x: 7, y: 33.5, role: 'ball', tip: 'Run across along their line to stay onside. Bend in behind as the 10 plays it, and finish.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'press', x: 36, y: 48, spd: 5.6 },
        { t: 'zone', x: 17, y: 42, spd: 5.5, eng: 5 },
        { t: 'mark', a: 2, x: 26.6, y: 38.6, spd: 5.6 },
        { t: 'line', x: 10, y: 30, spd: 5.5 },
        { t: 'line', x: 20, y: 30, spd: 5.5 },
        { t: 'line', x: 30, y: 30, spd: 5.5 },
        { t: 'line', x: 40, y: 30, spd: 5.5 }
      ]
    }
  );
})(typeof module !== 'undefined' ? global : window);
