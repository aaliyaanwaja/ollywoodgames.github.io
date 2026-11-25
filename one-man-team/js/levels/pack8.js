/* Pack 8: the big games (fixtures 53-60). The hardest and most varied moves in the game: hunters on the first pass,
   high lines, sweeper-keepers, covering defenders, two decoys at once and first-time chains, with a different kind
   of finish almost every time. Defender types and fields are described in tools/LEVEL_DESIGN.md. */
(function (root) {
  const L = (root.OMT_LEVELS = root.OMT_LEVELS || []);
  L.push(
    {
      name: 'Up, back and through', time: 9,
      brief: 'Four players. Up to the 9, set back to the 10, and threaded first time for the 7 running in behind.',
      att: [
        { num: 6, name: 'Pivot', x: 21, y: 48, role: 'ball', tip: 'The hunter is coming. Fire it up to the feet of the 9 as he comes short.' },
        { num: 9, name: 'Target man', x: 27, y: 27.5, role: 'ball', tip: 'Come short with your marker on your back. Aim early and set it back to the 10.' },
        { num: 10, name: 'Number ten', x: 34, y: 39, role: 'ball', tip: 'Meet the set-back. Aim early and thread it first time into the hole the 9 has left.' },
        { num: 7, name: 'Winger', x: 41, y: 27.5, role: 'ball', tip: 'Their line holds. Cross it as the 10 plays it, and beat the keeper to the ball.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'press', x: 27, y: 40, spd: 5.5 },
        { t: 'mark', a: 1, x: 27, y: 25.2, spd: 5.6, react: 14 },
        { t: 'mark', a: 2, x: 33.2, y: 36.4, spd: 5.3, react: 20 },
        { t: 'line', x: 8, y: 25.5, spd: 5.6 }, { t: 'line', x: 24, y: 25.5, spd: 5.7 }, { t: 'line', x: 39, y: 25.5, spd: 5.6 }
      ],
      gk: { sweeper: true },
      lines: { 0: { gap: 5 } }
    },
    {
      name: 'Between the lines', time: 12,
      brief: 'Four players, two banks of four. Find the 10 in the pocket between them. He turns and shoots.',
      att: [
        { num: 5, name: 'Centre-back', x: 14, y: 54, role: 'ball', tip: 'The hunter is coming. Roll it inside to the 6 at once.' },
        { num: 6, name: 'Pivot', x: 26, y: 52, role: 'ball', tip: 'Aim early and move it on first time, out to the 8 on your right.' },
        { num: 8, name: 'Playmaker', x: 37, y: 47, role: 'ball', tip: 'Carry inside until a gap opens in their midfield, then drill it through to the 10.' },
        { num: 10, name: 'Number ten', x: 27.5, y: 27.5, role: 'ball', tip: 'Take it on the half-turn, drive at the D and shoot before the centre-half gets out.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'press', x: 16, y: 44, spd: 5.5 },
        { t: 'line', unit: 1, x: 14, y: 38, spd: 5.2, eng: 5 }, { t: 'line', unit: 1, x: 24, y: 38, spd: 5.2, eng: 5 },
        { t: 'line', unit: 1, x: 34, y: 38, spd: 5.2, eng: 5 }, { t: 'line', unit: 1, x: 44, y: 38, spd: 5.2, eng: 5 },
        { t: 'line', x: 10, y: 16.5, spd: 5.4, eng: 6 }, { t: 'line', x: 20, y: 16.5, spd: 5.4, eng: 6 },
        { t: 'line', x: 30, y: 16.5, spd: 5.4, eng: 6 }, { t: 'line', x: 40, y: 16.5, spd: 5.4, eng: 6 }
      ],
      lines: { 0: { floor: 16 }, 1: { gap: 7, floor: 34 } }
    },
    {
      name: 'Draw the keeper', time: 11,
      brief: 'Four players. Their keeper rushes out at anyone who gets in behind. Draw him, then square it.',
      att: [
        { num: 6, name: 'Pivot', x: 23, y: 50, role: 'ball', tip: 'The hunter is coming. Play it out to the 8 on your right.' },
        { num: 8, name: 'Playmaker', x: 34, y: 43, role: 'ball', tip: 'Carry it forward, then slide it between centre-half and full-back for the 7.' },
        { num: 7, name: 'Winger', x: 43.5, y: 26, role: 'ball', tip: 'Run on to it and drive at the keeper. When he comes, drill it square across the box.' },
        { num: 9, name: 'Striker', x: 23, y: 26, role: 'ball', tip: 'Stay behind the ball. Time your run to meet the square ball in the six-yard box. Tap it in.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'press', x: 17, y: 41, spd: 5.5 },
        { t: 'zone', x: 27, y: 36, spd: 5.2, eng: 5 },
        { t: 'mark', a: 3, x: 23.2, y: 23.6, spd: 5.5 },
        { t: 'line', x: 10, y: 24, spd: 5.6 }, { t: 'line', x: 31, y: 24, spd: 5.6 }, { t: 'line', x: 41, y: 24, spd: 5.6 }
      ],
      gk: { sweeper: true },
      lines: { 0: { gap: 6 } }
    },
    {
      name: 'Short then long', time: 11,
      brief: 'Four players. The 9 comes short to drag his centre-half up the pitch, then spins in behind him.',
      att: [
        { num: 5, name: 'Centre-back', x: 12, y: 51, role: 'ball', tip: 'The hunter is coming. Roll it inside to the 6 at once.' },
        { num: 6, name: 'Pivot', x: 24, y: 48, role: 'ball', tip: 'Aim early and move it on first time, out to the 8 on your right.' },
        { num: 8, name: 'Playmaker', x: 36, y: 43, role: 'ball', tip: 'Step inside the hunter. As the 9 spins, slide it into the hole his marker has left.' },
        { num: 9, name: 'Striker', x: 29, y: 28, role: 'ball', tip: 'Come short so your marker follows, then spin in behind. Drive outside the cover and shoot across the keeper into the far corner.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'press', x: 14, y: 41, spd: 5.5 },
        { t: 'zone', x: 23, y: 37, spd: 5.2, eng: 6 },
        { t: 'press', x: 44, y: 32, spd: 5.5 },
        { t: 'mark', a: 3, x: 28.8, y: 25.6, spd: 5.8, react: 24, tight: 1.3 },
        { t: 'line', x: 9, y: 26.5, spd: 5.7 },
        { t: 'line', x: 38, y: 26.5, spd: 5.7 },
        { t: 'zone', x: 20, y: 20.2, spd: 5.4, eng: 9 }
      ],
      gk: { sweeper: true }
    },
    {
      name: 'Bend the run', time: 9,
      brief: 'Five players. Their high line holds. The 11 runs along it to stay onside, then bursts through.',
      att: [
        { num: 9, name: 'Decoy', x: 28, y: 30.5, role: 'decoy', tip: 'No ball for you. Pull out to the right and take your centre-half with you. Then DONE.' },
        { num: 5, name: 'Centre-back', x: 34, y: 54, role: 'ball', tip: 'The hunter is coming. Roll it across to the 6 at once.' },
        { num: 6, name: 'Pivot', x: 22, y: 50, role: 'ball', tip: 'Aim early and play it first time into the feet of the 10.' },
        { num: 10, name: 'Number ten', x: 27, y: 40, role: 'ball', tip: 'Aim early and thread it first time through the hole the 9 left.' },
        { num: 11, name: 'Left winger', x: 10, y: 31, role: 'ball', tip: 'Go at once. Run along their line to stay onside, burst through on the pass and finish.' }
      ],
      order: [0, 1, 2, 3, 4],
      def: [
        { t: 'press', x: 32, y: 44, spd: 5.5 },
        { t: 'zone', x: 33, y: 37, spd: 5.2, eng: 5 },
        { t: 'mark', a: 0, x: 27.9, y: 28.2, spd: 5.6 },
        { t: 'line', x: 9, y: 29, spd: 5.7 }, { t: 'line', x: 19, y: 29, spd: 5.7 }, { t: 'line', x: 41, y: 29, spd: 5.7 }
      ],
      gk: { sweeper: true },
      lines: { 0: { gap: 5 } }
    },
    {
      name: 'From distance', time: 11,
      brief: 'Five players. Two runs without the ball take both markers out of the D. Drive into it and let fly.',
      att: [
        { num: 9, name: 'Decoy', x: 26, y: 19.5, role: 'decoy', tip: 'No ball for you. Pull away to the right so your centre-half leaves the D. Then DONE.' },
        { num: 10, name: 'Decoy', x: 24, y: 27, role: 'decoy', tip: 'No ball for you. Drift out to the left and take your marker with you. Then DONE.' },
        { num: 4, name: 'Centre-back', x: 17, y: 52, role: 'ball', tip: 'The hunter is coming. Roll it across to the 6 at once.' },
        { num: 6, name: 'Pivot', x: 30, y: 48, role: 'ball', tip: 'Aim early and play it first time into the feet of the 8.' },
        { num: 8, name: 'Midfielder', x: 27, y: 38, role: 'ball', tip: 'The D has emptied. Drive into it and strike from distance before they close you down.' }
      ],
      order: [0, 1, 2, 3, 4],
      def: [
        { t: 'press', x: 19, y: 42, spd: 5.5 },
        { t: 'mark', a: 1, x: 24.2, y: 24.6, spd: 5.5 },
        { t: 'mark', a: 0, x: 25.9, y: 17.2, spd: 5.5 },
        { t: 'line', x: 9, y: 16.5, spd: 5.3, eng: 7.2 }, { t: 'line', x: 20, y: 16.5, spd: 5.3, eng: 7.2 }, { t: 'line', x: 41, y: 16.5, spd: 5.3, eng: 7.2 }
      ]
    },
    {
      name: 'The reverse pass', time: 13,
      brief: 'Five players. The 7 comes inside and his full-back follows. Slip it back outside for the overlapping 2.',
      att: [
        { num: 10, name: 'Decoy', x: 27, y: 19.5, role: 'decoy', tip: 'No ball for you. Dart to the near post and take your marker off the penalty spot. DONE.' },
        { num: 6, name: 'Pivot', x: 25, y: 45, role: 'ball', tip: 'Step away from the screen and play it wide to the feet of the 7.' },
        { num: 7, name: 'Winger', x: 43, y: 31, role: 'ball', tip: 'Come inside to meet it so your full-back follows. Slip it first time down the line.' },
        { num: 2, name: 'Right-back', x: 44.5, y: 38, role: 'ball', tip: 'Overlap outside the 7. Take it to the byline and pull it back to the edge of the box.' },
        { num: 9, name: 'Striker', x: 19, y: 27, role: 'ball', tip: 'Hold your run, then meet the pull-back on the edge of the box. Far corner, first time.' }
      ],
      order: [0, 1, 2, 3, 4],
      def: [
        { t: 'zone', x: 24, y: 35, spd: 5.2, eng: 5 },
        { t: 'mark', a: 2, x: 41.5, y: 28.5, spd: 5.4, agg: 0.3 },
        { t: 'mark', a: 0, x: 26.9, y: 17.2, spd: 5.5 },
        { t: 'mark', a: 4, x: 19.6, y: 24.6, spd: 5.8, react: 10 },
        { t: 'zone', x: 28, y: 11, spd: 5, eng: 4, leash: 6, screen: 4 },
        { t: 'line', x: 10, y: 17, spd: 5.4, eng: 7 }, { t: 'line', x: 20, y: 17, spd: 5.4, eng: 7 },
        { t: 'line', x: 30, y: 17, spd: 5.4, eng: 7 }
      ]
    },
    {
      name: 'Total football', time: 8,
      brief: 'Five players, everything at once. Two runs split their centre-halves. Thread it through and let fly.',
      att: [
        { num: 9, name: 'Decoy', x: 23, y: 29, role: 'decoy', tip: 'No ball for you. Drop short and left so your centre-half comes with you. Then DONE.' },
        { num: 11, name: 'Decoy', x: 30, y: 29, role: 'decoy', tip: 'No ball for you. Pull out wide to the right and take your centre-half along. DONE.' },
        { num: 6, name: 'Pivot', x: 22, y: 50, role: 'ball', tip: 'The hunter is coming. Play it into the 10 at once.' },
        { num: 10, name: 'Number ten', x: 32, y: 42, role: 'ball', tip: 'Aim early. Thread it first time through the hole between their centre-halves.' },
        { num: 8, name: 'Runner', x: 26, y: 36, role: 'ball', tip: 'Go at once. Meet it beyond their line, go round the last man on his outside and shoot across the keeper into the far corner.' }
      ],
      order: [0, 1, 2, 3, 4],
      def: [
        { t: 'press', x: 24, y: 41, spd: 5.6 },
        { t: 'mark', a: 0, x: 23.2, y: 26.7, spd: 5.6 },
        { t: 'mark', a: 1, x: 29.8, y: 26.7, spd: 5.6 },
        { t: 'line', x: 9, y: 27, spd: 5.7 }, { t: 'line', x: 41, y: 27, spd: 5.7 },
        { t: 'zone', x: 20.6, y: 19, spd: 5.5, eng: 9 }
      ],
      gk: { sweeper: true },
      lines: { 0: { gap: 5 } }
    }
  );
})(typeof module !== 'undefined' ? global : window);
