/* Pack 3: advanced (the last eight moves). Four- and five-player moves against organised defences.
   Defender types and fields are described in tools/LEVEL_DESIGN.md. */
(function (root) {
  const L = (root.OMT_LEVELS = root.OMT_LEVELS || []);
  L.push(
    {
      name: 'Beat the trap', time: 15,
      brief: 'Four players. The back line steps up when the ball goes back. Time the last run or you are off.',
      att: [
        { num: 3, name: 'Left-back', x: 9, y: 44, role: 'ball', tip: 'You are being hunted. Roll it back inside to the 6 before he gets to you.' },
        { num: 6, name: 'Pivot', x: 23, y: 51, role: 'ball', tip: 'Step past the screen, then play it firmly into the feet of the 10.' },
        { num: 10, name: 'Creator', x: 25, y: 41, role: 'ball', tip: 'Come off your marker to meet it. Aim early and slide it first time between the centre-halves.' },
        { num: 9, name: 'Striker', x: 31, y: 39.5, role: 'ball', tip: 'Their line has stepped up. Cross it just as the 10 plays the pass, then run on and finish.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'press', x: 12, y: 38, spd: 5.4 },
        { t: 'zone', x: 21, y: 44, spd: 5, eng: 5 },
        { t: 'mark', a: 2, x: 25, y: 38.6, spd: 5.3 },
        { t: 'line', x: 8, y: 32, spd: 5.3 },
        { t: 'line', x: 19.5, y: 32, spd: 5.3 },
        { t: 'line', x: 30.5, y: 32, spd: 5.3 },
        { t: 'line', x: 42, y: 32, spd: 5.3 }
      ],
      lines: { 0: { gap: 8 } }
    },
    {
      name: 'Clear the channel', time: 12,
      brief: 'Five players. Two runs without the ball pull both centre-halves apart. Then go through the middle.',
      att: [
        { num: 9, name: 'Decoy', x: 24.5, y: 27.5, role: 'decoy', tip: 'No ball for you. Drag your centre-half out to the left touchline, then press DONE.' },
        { num: 10, name: 'Decoy', x: 29, y: 29, role: 'decoy', tip: 'No ball for you. Come short and wide to the right so your marker follows. Then DONE.' },
        { num: 6, name: 'Pivot', x: 25, y: 54, role: 'ball', tip: 'Give it to the 8 on your left and let him pick the pass.' },
        { num: 8, name: 'Playmaker', x: 15, y: 46, role: 'ball', tip: 'Carry inside the screen, then thread it down the empty middle for the 7.' },
        { num: 7, name: 'Inside forward', x: 41, y: 31, role: 'ball', tip: 'Cut in off the right into the gap the decoys left. Stay onside and finish.' }
      ],
      order: [0, 1, 2, 3, 4],
      def: [
        { t: 'mark', a: 0, x: 24.5, y: 25, spd: 5.5 },
        { t: 'mark', a: 1, x: 28.7, y: 26.6, spd: 5.5 },
        { t: 'mark', a: 4, x: 39.6, y: 28.6, spd: 5.4 },
        { t: 'zone', x: 27, y: 42, spd: 5.6, eng: 7 },
        { t: 'line', x: 6, y: 25, spd: 5.2 },
        { t: 'line', x: 14, y: 25, spd: 5.2 }
      ]
    },
    {
      name: 'Play through the press', time: 12,
      brief: 'Four players. Two hunters close the first two passes. Move it before they arrive, then break.',
      att: [
        { num: 4, name: 'Centre-back', x: 19, y: 55, role: 'ball', tip: 'The first hunter is on his way. Roll it across to the 6 at once.' },
        { num: 6, name: 'Pivot', x: 32, y: 51, role: 'ball', tip: 'The second hunter wants you. Aim early and move it first time to the 8.' },
        { num: 8, name: 'Link', x: 17, y: 42, role: 'ball', tip: 'You are past the press. Drive at the back line and slide the 9 through.' },
        { num: 9, name: 'Striker', x: 28, y: 30, role: 'ball', tip: 'Stay level with the last man until the 8 plays it, then run on and finish.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'press', x: 20, y: 46, spd: 5.5 },
        { t: 'press', x: 36, y: 43, spd: 5.5 },
        { t: 'line', x: 9, y: 27, spd: 5.2 },
        { t: 'line', x: 20, y: 27, spd: 5.2 },
        { t: 'line', x: 30, y: 27, spd: 5.2 },
        { t: 'line', x: 41, y: 27, spd: 5.2 }
      ]
    },
    {
      name: 'Sweeper-keeper', time: 15,
      brief: 'Four players. Their keeper sweeps up anything long. Get close, then slip one short pass in.',
      att: [
        { num: 4, name: 'Centre-back', x: 20, y: 55, role: 'ball', tip: 'Nothing over the top: the keeper is waiting for it. Find the 7 out wide.' },
        { num: 7, name: 'Winger', x: 42, y: 42, role: 'ball', tip: 'Come to the ball, then play it inside to the 10 before the full-back closes.' },
        { num: 10, name: 'Creator', x: 31, y: 33, role: 'ball', tip: 'Carry it at the back line, then roll a short pass into the box. Hit it long and it is gone.' },
        { num: 9, name: 'Striker', x: 21, y: 24, role: 'ball', tip: 'Dart across the centre-half as the 10 shapes to pass. Beat the keeper to it and finish.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'zone', x: 24, y: 43, spd: 5, eng: 5 },
        { t: 'mark', a: 1, x: 41, y: 39.5, spd: 5.2 },
        { t: 'line', x: 10, y: 21, spd: 5.2 },
        { t: 'line', x: 20, y: 21, spd: 5.2 },
        { t: 'line', x: 30, y: 21, spd: 5.2 },
        { t: 'line', x: 40, y: 21, spd: 5.2 }
      ],
      gk: { sweeper: true },
      lines: { 0: { floor: 19 } }
    },
    {
      name: 'Far post', time: 14,
      brief: 'Five players. The box is full. Two runs empty the near side, and the 11 arrives late at the far post.',
      att: [
        { num: 8, name: 'Playmaker', x: 31, y: 44, role: 'ball', tip: 'Slide it down the right touchline for the 7 to run on to.' },
        { num: 9, name: 'Decoy', x: 29, y: 11.4, role: 'decoy', tip: 'No ball for you. Dart to the near post and stay there with your marker. Then DONE.' },
        { num: 7, name: 'Winger', x: 43, y: 33, role: 'ball', tip: 'Run on to it, get near the byline and drive a low cross to the far post.' },
        { num: 10, name: 'Decoy', x: 24, y: 12.2, role: 'decoy', tip: 'No ball for you. Pull out to the edge of the box so your marker follows. Then DONE.' },
        { num: 11, name: 'Late runner', x: 9, y: 25, role: 'ball', tip: 'Hold your run, then arrive at the far post as the cross comes. Finish first time.' }
      ],
      order: [0, 1, 2, 3, 4],
      def: [
        { t: 'mark', a: 1, x: 28.7, y: 9.1, spd: 5.5 },
        { t: 'mark', a: 3, x: 24.2, y: 10, spd: 5.5 },
        { t: 'mark', a: 2, x: 41.5, y: 30.5, spd: 5.3 },
        { t: 'zone', x: 27, y: 36, spd: 5, eng: 5 },
        { t: 'line', x: 12, y: 16, spd: 5.2, eng: 4 },
        { t: 'line', x: 23, y: 16, spd: 5.2, eng: 4 }
      ]
    },
    {
      name: 'False nine', time: 12,
      brief: 'Four players. The 9 drops deep and his centre-half follows. The 11 runs into the hole he leaves.',
      att: [
        { num: 5, name: 'Centre-back', x: 31, y: 55, role: 'ball', tip: 'Start it. Roll it across to the 8 on your left.' },
        { num: 9, name: 'False nine', x: 22.5, y: 29.5, role: 'decoy', tip: 'No ball for you. Drop deep towards halfway so your marker comes too, then press DONE.' },
        { num: 8, name: 'Playmaker', x: 16, y: 47, role: 'ball', tip: 'Aim early. As it arrives, hit it first time through the hole the 9 has left.' },
        { num: 11, name: 'Runner', x: 12, y: 30.5, role: 'ball', tip: 'Run off the left into the hole the 9 left. Go as the 8 plays it, and finish.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'mark', a: 1, x: 22.7, y: 27.1, spd: 5.5 },
        { t: 'zone', x: 31, y: 44, spd: 5.2, eng: 5 },
        { t: 'mark', a: 2, x: 16.6, y: 44.6, spd: 5.2 },
        { t: 'line', x: 6, y: 27, spd: 5.7 },
        { t: 'line', x: 16, y: 27, spd: 5.7 },
        { t: 'line', x: 34, y: 27, spd: 5.7 },
        { t: 'line', x: 44, y: 27, spd: 5.7 }
      ]
    },
    {
      name: 'Five-man move', time: 15,
      brief: 'Five players, four passes, one finish. Every touch has to fit the ones before it.',
      att: [
        { num: 4, name: 'Centre-back', x: 19, y: 55, role: 'ball', tip: 'The hunter is coming. Roll it across to the 6 straight away.' },
        { num: 6, name: 'Pivot', x: 32, y: 51, role: 'ball', tip: 'Aim early and move it first time, out to the 8 on the left.' },
        { num: 8, name: 'Link', x: 17, y: 42, role: 'ball', tip: 'Take it forward a few yards, then find the 10 as he comes short.' },
        { num: 10, name: 'Creator', x: 21.5, y: 36, role: 'ball', tip: 'Come off your marker. Aim early and slide it first time in behind for the 7.' },
        { num: 7, name: 'Winger', x: 38, y: 31.5, role: 'ball', tip: 'Cut in off the right as the 10 plays it. Stay onside, run on and finish.' }
      ],
      order: [0, 1, 2, 3, 4],
      def: [
        { t: 'press', x: 20, y: 46, spd: 5.5 },
        { t: 'zone', x: 36, y: 40, spd: 5.2, eng: 5 },
        { t: 'mark', a: 3, x: 21.8, y: 33.6, spd: 5.4 },
        { t: 'line', x: 9, y: 27, spd: 5.3 },
        { t: 'line', x: 20, y: 27, spd: 5.3 },
        { t: 'line', x: 30, y: 27, spd: 5.3 },
        { t: 'line', x: 41, y: 27, spd: 5.3 }
      ],
      lines: { 0: { gap: 9 } }
    },
    {
      name: 'Last-minute winner', time: 9,
      brief: 'Seconds left, one chance. Four players, no spare touches, and their keeper races you to the ball.',
      att: [
        { num: 8, name: 'Playmaker', x: 27, y: 50, role: 'ball', tip: 'No time to dwell. Play it into the 10 at once, before the hunter arrives.' },
        { num: 10, name: 'Creator', x: 19, y: 41, role: 'ball', tip: 'Come off your marker. Aim early and hit it first time down the middle.' },
        { num: 9, name: 'Decoy', x: 27.3, y: 24, role: 'decoy', tip: 'No ball for you. Sprint out to the left so the last defender goes with you. Then DONE.' },
        { num: 7, name: 'Winger', x: 38, y: 33, role: 'ball', tip: 'Go as the 10 plays it. Their keeper is coming for it: get there first and finish.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'press', x: 32, y: 45.5, spd: 5.6 },
        { t: 'mark', a: 1, x: 19.4, y: 38.6, spd: 5.4 },
        { t: 'mark', a: 2, x: 27.1, y: 21.6, spd: 5.6 },
        { t: 'mark', a: 3, x: 37, y: 30.6, spd: 5.7, react: 10 },
        { t: 'line', x: 6, y: 30, spd: 5.7 },
        { t: 'line', x: 14, y: 30, spd: 5.7 }
      ],
      gk: { sweeper: true }
    }
  );
})(typeof module !== 'undefined' ? global : window);
