/* Pack 4: set pieces (fixtures 21-28). Corners, free kicks, a throw-in and a kick-off routine.
   The ball starts dead with the taker. A wall is two or three slow `zone` defenders on a short leash.
   Defender types and fields are described in tools/LEVEL_DESIGN.md. */
(function (root) {
  const L = (root.OMT_LEVELS = root.OMT_LEVELS || []);
  L.push(
    {
      name: 'Short corner', time: 7,
      brief: 'Three players. Take the corner short, draw a man out, then pull it back for a first-time finish.',
      att: [
        { num: 7, name: 'Taker', x: 47.5, y: 3, role: 'ball', tip: 'Do not cross it. Roll it short to the 8 as he comes towards you.' },
        { num: 8, name: 'Short man', x: 38.5, y: 11.5, role: 'ball', tip: 'Come short, carry it infield along the box, then pull it back for the 10.' },
        { num: 10, name: 'Late runner', x: 23, y: 24, role: 'ball', tip: 'Arrive late near the penalty spot. Aim early and hit it first time.' }
      ],
      order: [0, 1, 2],
      def: [
        { t: 'press', x: 41.5, y: 6, spd: 5.6, eng: 12 },
        { t: 'zone', x: 31, y: 11, spd: 5.2, eng: 5, leash: 9 },
        { t: 'mark', a: 2, x: 23.3, y: 21.6, spd: 5, react: 22 },
        { t: 'zone', x: 30.5, y: 4.5, spd: 4.8, eng: 3, leash: 5 },
        { t: 'line', x: 20, y: 6.5, spd: 5, eng: 4 },
        { t: 'line', x: 25, y: 6.5, spd: 5, eng: 4 },
        { t: 'line', x: 30, y: 6.5, spd: 5, eng: 4 }
      ]
    },
    {
      name: 'Near-post corner', time: 5,
      brief: 'Three players. The 5 takes his marker off the near post. The 9 darts in front of his man to finish.',
      att: [
        { num: 5, name: 'Blocker', x: 20, y: 7.5, role: 'decoy', tip: 'No ball for you. Run across goal to the far post so your marker follows. Then DONE.' },
        { num: 11, name: 'Taker', x: 2.5, y: 3, role: 'ball', tip: 'Step in, let the 5 clear the near post, then drive it low and hard to that spot.' },
        { num: 9, name: 'Striker', x: 27, y: 12, role: 'ball', tip: 'Dart across your marker to the near post as it is struck. Finish first time.' }
      ],
      order: [0, 1, 2],
      def: [
        { t: 'mark', a: 0, x: 21, y: 5.3, spd: 5.3 },
        { t: 'mark', a: 2, x: 26.5, y: 9.8, spd: 5.6, react: 12 },
        { t: 'zone', x: 9.5, y: 12, spd: 4.8, eng: 3, leash: 6 },
        { t: 'zone', x: 26, y: 4.5, spd: 4.8, eng: 2.5, leash: 4 },
        { t: 'zone', x: 30.5, y: 5.5, spd: 4.8, eng: 2.5, leash: 4 }
      ]
    },
    {
      name: 'Free-kick lay-off', time: 5,
      brief: 'Three players. The wall has the shot covered. Roll it square and let the 10 strike round the wall.',
      att: [
        { num: 9, name: 'Decoy', x: 27.5, y: 13.5, role: 'decoy', tip: 'No ball for you. Peel away to the right so your marker leaves the shooting lane. DONE.' },
        { num: 8, name: 'Taker', x: 19, y: 21, role: 'ball', tip: 'Do not shoot. Let the 9 peel away, then roll it square into the path of the 10.' },
        { num: 10, name: 'Striker', x: 30.5, y: 22, role: 'ball', tip: 'Run on to the lay-off at the edge of the box. Aim early, hit it first time.' }
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
    }
  );
})(typeof module !== 'undefined' ? global : window);
