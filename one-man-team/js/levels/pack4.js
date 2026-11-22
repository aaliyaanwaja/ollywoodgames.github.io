/* Pack 4: set pieces (fixtures 21-28). Corners, free kicks, a throw-in and a kick-off routine.
   The ball starts dead with the taker. A wall is two or three slow `zone` defenders on a short leash.
   Defender types and fields are described in tools/LEVEL_DESIGN.md. */
(function (root) {
  const L = (root.OMT_LEVELS = root.OMT_LEVELS || []);
  L.push(
    {
      name: 'Short corner', time: 8,
      brief: 'Three players. Take the corner short, draw a man out, then pull it back for a first-time finish.',
      att: [
        { num: 7, name: 'Taker', x: 47.5, y: 3, role: 'ball', tip: 'Do not cross it. Roll it short to the 8 as he comes towards you.' },
        { num: 8, name: 'Short man', x: 38.5, y: 11.5, role: 'ball', tip: 'Come short, carry it infield, then pull it back short of the man on the edge of the box.' },
        { num: 10, name: 'Late runner', x: 23, y: 24, role: 'ball', tip: 'Arrive late, just inside the box. Aim early and hit the pull-back first time.' }
      ],
      order: [0, 1, 2],
      def: [
        { t: 'press', x: 41.5, y: 5.2, spd: 5.4, eng: 12 },
        { t: 'zone', x: 31, y: 11, spd: 5.2, eng: 5, leash: 9 },
        { t: 'zone', x: 26.3, y: 18.9, spd: 5.3, eng: 5.4, leash: 9 },
        { t: 'zone', x: 30.5, y: 4.5, spd: 4.8, eng: 3, leash: 5 },
        { t: 'line', x: 20, y: 6.5, spd: 5, eng: 4 },
        { t: 'line', x: 25, y: 6.5, spd: 5, eng: 4 },
        { t: 'line', x: 30, y: 6.5, spd: 5, eng: 4 }
      ]
    },
    {
      name: 'Tapped free kick', time: 8,
      brief: 'Three players. The wall has the shot covered. Tap it square and let the 10 strike round the wall.',
      att: [
        { num: 9, name: 'Decoy', x: 27.5, y: 13.5, role: 'decoy', tip: 'No ball for you. Peel away to the right so your marker leaves the lane. Then DONE.' },
        { num: 8, name: 'Taker', x: 19, y: 21, role: 'ball', tip: 'Do not shoot. Let the 9 peel away, then tap it square into the path of the 10.' },
        { num: 10, name: 'Striker', x: 30.5, y: 22, role: 'ball', tip: 'Meet it at the edge of the box. Aim early and strike it first time, low to the right.' }
      ],
      order: [0, 1, 2],
      def: [
        { t: 'zone', x: 21.2, y: 12.2, spd: 3, eng: 2, leash: 3 },
        { t: 'zone', x: 22.6, y: 12, spd: 3, eng: 2, leash: 3 },
        { t: 'zone', x: 24, y: 11.8, spd: 3, eng: 2, leash: 3 },
        { t: 'mark', a: 0, x: 27.2, y: 11.3, spd: 5.3 },
        { t: 'zone', x: 32, y: 13, spd: 5, eng: 3, leash: 8 },
        { t: 'zone', x: 38, y: 11, spd: 5, eng: 3, leash: 8 }
      ]
    },
    {
      name: 'Quick throw-in', time: 9,
      brief: 'Four players. The 7 comes short and takes the full-back with him. Throw it down the line behind them.',
      att: [
        { num: 7, name: 'Decoy', x: 44.5, y: 11.5, role: 'decoy', tip: 'No ball for you. Come short towards the thrower so the full-back follows. Then DONE.' },
        { num: 2, name: 'Thrower', x: 47, y: 31, role: 'ball', tip: 'Wait for the full-back to follow the 7, then send it low down the line.' },
        { num: 9, name: 'Striker', x: 38, y: 20, role: 'ball', tip: 'Spin into the channel as it is thrown. Hug the touchline to the byline, then pull it back.' },
        { num: 10, name: 'Late runner', x: 26, y: 26.5, role: 'ball', tip: 'Hold your run, then meet the pull-back near the penalty spot. Hit it first time.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'mark', a: 0, x: 43.3, y: 9.4, spd: 5.5 },
        { t: 'zone', x: 38, y: 30, spd: 5, eng: 4 },
        { t: 'zone', x: 27, y: 21, spd: 5, eng: 4 },
        { t: 'line', x: 13, y: 18, spd: 5.2, eng: 6.6 },
        { t: 'line', x: 23, y: 18, spd: 5.2, eng: 6.6 },
        { t: 'line', x: 33, y: 18, spd: 5.2, eng: 6.6 }
      ],
      lines: { 0: { gap: 8 } }
    },
    {
      name: 'Near-post corner', time: 8,
      brief: 'Three players. The 5 takes his marker off the near post. The 9 darts in front of his man to finish.',
      att: [
        { num: 5, name: 'Blocker', x: 17, y: 8.5, role: 'decoy', tip: 'No ball for you. Pull out to the edge of the box so your marker follows. Then DONE.' },
        { num: 11, name: 'Taker', x: 2.5, y: 3, role: 'ball', tip: 'Step in, let the 5 clear the near post, then drive it low and hard to that spot.' },
        { num: 9, name: 'Striker', x: 27, y: 12, role: 'ball', tip: 'Dart across your marker to the near post as it is struck. Finish first time.' }
      ],
      order: [0, 1, 2],
      def: [
        { t: 'mark', a: 0, x: 18.2, y: 6.6, spd: 5.3 },
        { t: 'mark', a: 2, x: 25.6, y: 10.6, spd: 5.8, react: 6 },
        { t: 'zone', x: 9.5, y: 12, spd: 4.8, eng: 3, leash: 6 },
        { t: 'zone', x: 26, y: 4.5, spd: 4.8, eng: 2.5, leash: 4 },
        { t: 'zone', x: 30.5, y: 5.5, spd: 4.8, eng: 2.5, leash: 4 }
      ]
    },
    {
      name: 'Round the wall', time: 8,
      brief: 'Three players. The 9 drags the cover away from the end of the wall. Slip it down the side for the 10.',
      att: [
        { num: 9, name: 'Decoy', x: 31.8, y: 14.5, role: 'decoy', tip: 'No ball for you. Run across the front of the wall so your marker follows. Then DONE.' },
        { num: 8, name: 'Taker', x: 31, y: 23, role: 'ball', tip: 'Shape to shoot, wait for the gap, then slide it down the right side of the wall.' },
        { num: 10, name: 'Runner', x: 35.5, y: 15.5, role: 'ball', tip: 'Go as he plays it. Take it past the wall and finish before the cover gets back.' }
      ],
      order: [0, 1, 2],
      def: [
        { t: 'zone', x: 27.3, y: 13.2, spd: 3, eng: 1.5, leash: 3 },
        { t: 'zone', x: 28.7, y: 13.4, spd: 3, eng: 1.5, leash: 3 },
        { t: 'zone', x: 30.1, y: 13.6, spd: 3, eng: 1.5, leash: 3 },
        { t: 'mark', a: 0, x: 31.7, y: 12.6, spd: 5.4 },
        { t: 'line', x: 19, y: 13, spd: 5.4, eng: 4 },
        { t: 'line', x: 37, y: 13.4, spd: 5.6, eng: 6 }
      ],
      gk: { sweeper: true }
    },
    {
      name: 'The flick-on', time: 8,
      brief: 'Four players. Drive the corner to the near post, flick it on across goal, and the 5 arrives to finish.',
      att: [
        { num: 4, name: 'Decoy', x: 21.5, y: 7, role: 'decoy', tip: 'No ball for you. Leave the far post and run out wide so your marker follows. Then DONE.' },
        { num: 7, name: 'Taker', x: 47.5, y: 3, role: 'ball', tip: 'Step in, then drive it low and hard to the near post. Too long and it is cut out.' },
        { num: 9, name: 'Near-post man', x: 33.5, y: 13, role: 'ball', tip: 'Dart to the near post ahead of your marker. Aim early and help it on across goal.' },
        { num: 5, name: 'Centre-back', x: 17, y: 18, role: 'ball', tip: 'Time your run to the far post to meet the flick. Finish first time.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'mark', a: 0, x: 22, y: 5, spd: 5.3 },
        { t: 'mark', a: 2, x: 32.8, y: 10.8, spd: 5.4 },
        { t: 'zone', x: 26, y: 4.9, spd: 4.8, eng: 2.5, leash: 4 },
        { t: 'zone', x: 40.5, y: 11, spd: 4.8, eng: 3, leash: 6 },
        { t: 'zone', x: 23, y: 16, spd: 5, eng: 3, leash: 6 }
      ]
    },
    {
      name: 'Corner to the edge', time: 8,
      brief: 'Four players. Two runners crash the six-yard box and take their markers. Pull it back for the 8.',
      att: [
        { num: 5, name: 'Decoy', x: 15.3, y: 12.9, role: 'decoy', tip: 'No ball for you. Crash the near post so your marker goes with you. Then DONE.' },
        { num: 4, name: 'Decoy', x: 24, y: 14, role: 'decoy', tip: 'No ball for you. Attack the far post so your marker goes with you. Then DONE.' },
        { num: 11, name: 'Taker', x: 2.5, y: 3, role: 'ball', tip: 'Let them crash the box, then pull it back low to the edge of the area.' },
        { num: 8, name: 'Striker', x: 31, y: 23, role: 'ball', tip: 'Arrive late at the edge of the box. Aim early and strike it first time for the far corner.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'mark', a: 0, x: 16.6, y: 10.7, spd: 5.3 },
        { t: 'mark', a: 1, x: 24.2, y: 11.8, spd: 5.3 },
        { t: 'zone', x: 9.5, y: 12.5, spd: 4.8, eng: 3, leash: 6 },
        { t: 'zone', x: 23.5, y: 4.5, spd: 4.8, eng: 2.5, leash: 4 },
        { t: 'zone', x: 27.5, y: 5.5, spd: 4.8, eng: 2.5, leash: 4 },
        { t: 'zone', x: 29, y: 19, spd: 5, eng: 4, leash: 8 }
      ]
    },
    {
      name: 'Kick-off routine', time: 15,
      brief: 'Four players. Straight from the kick-off: tap it back, hit the left channel early, and flood the box.',
      att: [
        { num: 10, name: 'Taker', x: 25, y: 52.5, role: 'ball', tip: 'Kick off. Tap it back to the 8 on your left and let him do the rest.' },
        { num: 8, name: 'Playmaker', x: 17, y: 55.5, role: 'ball', tip: 'Take a touch to your left, then hit it hard down the left touchline for the 11.' },
        { num: 11, name: 'Winger', x: 5, y: 53.5, role: 'ball', tip: 'Go on the whistle. Run on to it, get near the byline and pull it back to the spot.' },
        { num: 9, name: 'Striker', x: 29, y: 53.5, role: 'ball', tip: 'Sprint the length of the half. Meet the pull-back on the penalty spot, first time.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'press', x: 21, y: 43, spd: 5.2 },
        { t: 'press', x: 30, y: 43, spd: 5.2, eng: 9 },
        { t: 'zone', x: 15, y: 38, spd: 5, eng: 5 },
        { t: 'zone', x: 25, y: 37, spd: 5, eng: 5 },
        { t: 'zone', x: 35, y: 38, spd: 5, eng: 5 },
        { t: 'mark', a: 2, x: 6.5, y: 43, spd: 5.4 },
        { t: 'line', x: 20, y: 27, spd: 5.25 },
        { t: 'line', x: 30, y: 27, spd: 5.25 },
        { t: 'line', x: 40, y: 27, spd: 5.25 }
      ]
    }
  );
})(typeof module !== 'undefined' ? global : window);
