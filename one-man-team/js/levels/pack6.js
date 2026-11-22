/* Pack 6: strikes and lay-offs (fixtures 37-44). Every move ends with a shot from the edge of the box or a
   first-time finish: the back line sits deep, the screens deny the through ball, and the skill is giving the
   last man a clear sight of a corner. Defender types and fields are described in tools/LEVEL_DESIGN.md. */
(function (root) {
  const L = (root.OMT_LEVELS = root.OMT_LEVELS || []);
  L.push(
    {
      name: 'The set-back', time: 8,
      brief: 'Three players. Up to the 9 on the edge of the box, set back, and struck first time from the D.',
      att: [
        { num: 8, name: 'Playmaker', x: 30, y: 44, role: 'ball', tip: 'Carry out to the right, round the screen, then fire it into the feet of the 9.' },
        { num: 9, name: 'Target man', x: 26, y: 16, role: 'ball', tip: 'Back to goal. Come to meet it, aim early and set it back to the D first time.' },
        { num: 10, name: 'Striker', x: 17, y: 31, role: 'ball', tip: 'Arrive at the D as the 9 sets it back. Hit it first time into a corner.' }
      ],
      order: [0, 1, 2],
      def: [
        { t: 'zone', x: 26, y: 33, spd: 5, eng: 5 },
        { t: 'mark', a: 2, x: 18.5, y: 28.6, spd: 5, react: 22 },
        { t: 'line', x: 9, y: 13.5, spd: 5 }, { t: 'line', x: 20, y: 13.5, spd: 5 },
        { t: 'line', x: 30, y: 13.5, spd: 5 }, { t: 'line', x: 41, y: 13.5, spd: 5 }
      ]
    },
    {
      name: 'Square ball', time: 11,
      brief: 'Three players. The winger comes inside and rolls it square along the edge of the box for the 8.',
      att: [
        { num: 6, name: 'Holder', x: 24, y: 47, role: 'ball', tip: 'Step away from the screen and play it wide to the feet of the 7.' },
        { num: 7, name: 'Winger', x: 43, y: 31, role: 'ball', tip: 'Drive inside towards the box, then roll it square across the D.' },
        { num: 8, name: 'Midfielder', x: 17, y: 35, role: 'ball', tip: 'Arrive on the D as the 7 squares it. Strike it first time, low into a corner.' }
      ],
      order: [0, 1, 2],
      def: [
        { t: 'zone', x: 27, y: 36, spd: 5, eng: 5 },
        { t: 'mark', a: 2, x: 18.2, y: 32.6, spd: 5, react: 22 },
        { t: 'line', x: 10, y: 14, spd: 5, eng: 6 }, { t: 'line', x: 20, y: 14, spd: 5, eng: 6 },
        { t: 'line', x: 30, y: 14, spd: 5, eng: 6 }, { t: 'line', x: 40, y: 14, spd: 5, eng: 6 }
      ]
    },
    {
      name: 'The dummy run', time: 8,
      brief: 'Four players. A screen guards the 10. One run without the ball moves him, and the lane opens.',
      att: [
        { num: 11, name: 'Decoy', x: 13, y: 25, role: 'decoy', tip: 'No ball for you. Sprint in behind on the left so the screen has to watch you. Then DONE.' },
        { num: 6, name: 'Holder', x: 32, y: 50, role: 'ball', tip: 'Roll it across to the 8 before the hunter gets to you.' },
        { num: 8, name: 'Playmaker', x: 24, y: 41, role: 'ball', tip: 'The screen has shifted left. Fire it straight into the feet of the 10.' },
        { num: 10, name: 'Number ten', x: 25.5, y: 18.3, role: 'ball', tip: 'Aim early. Turn it past the centre-half and into the left corner with your first touch.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'press', x: 33, y: 41, spd: 5.3 },
        { t: 'zone', x: 22, y: 29, spd: 5.2, eng: 4, screen: 6 },
        { t: 'line', x: 9, y: 14, spd: 5.1, eng: 4 }, { t: 'line', x: 20, y: 14, spd: 5.1, eng: 4 },
        { t: 'line', x: 30, y: 14, spd: 5.1, eng: 4 }, { t: 'line', x: 41, y: 14, spd: 5.1, eng: 4 }
      ]
    },
    {
      name: 'Draw the centre-half', time: 9,
      brief: 'Three players. Run at one centre-half until he comes out. His partner tucks in, and the 9 is free.',
      att: [
        { num: 6, name: 'Holder', x: 33, y: 45, role: 'ball', tip: 'Step away from the screen and find the 10 between the lines.' },
        { num: 10, name: 'Number ten', x: 23, y: 30, role: 'ball', tip: 'Run at the left centre-half. When he steps out to you, roll it right to the 9.' },
        { num: 9, name: 'Striker', x: 31.5, y: 17.5, role: 'ball', tip: 'Your centre-half has tucked in. Aim early and hit it first time inside the near post.' }
      ],
      order: [0, 1, 2],
      def: [
        { t: 'zone', x: 28, y: 36, spd: 5, eng: 5 },
        { t: 'line', x: 9, y: 13.5, spd: 5.2 }, { t: 'line', x: 20, y: 13.5, spd: 5.2 },
        { t: 'line', x: 30, y: 13.5, spd: 5.2 }, { t: 'line', x: 41, y: 13.5, spd: 5.2 }
      ]
    },
    {
      name: 'The early cross', time: 9,
      brief: 'Three players. Cross it low and early from the right. The 9 darts across his marker to meet it.',
      att: [
        { num: 8, name: 'Playmaker', x: 30, y: 40, role: 'ball', tip: 'Play it wide to the feet of the 7.' },
        { num: 7, name: 'Winger', x: 44, y: 22, role: 'ball', tip: 'A touch forward, then drive it low towards the near post before the full-back closes.' },
        { num: 9, name: 'Striker', x: 24, y: 14.5, role: 'ball', tip: 'Start on the far side of your marker, then dart to the near post and turn it in first time.' }
      ],
      order: [0, 1, 2],
      def: [
        { t: 'zone', x: 32, y: 30, spd: 5, eng: 5 },
        { t: 'mark', a: 2, x: 24.2, y: 12.2, spd: 5.3, react: 20 },
        { t: 'line', x: 10, y: 13, spd: 5.1, eng: 4 }, { t: 'line', x: 31, y: 13, spd: 5.1, eng: 4 }, { t: 'line', x: 41, y: 13, spd: 5.1, eng: 5 }
      ]
    },
    {
      name: 'The knock-down', time: 8,
      brief: 'Three players. A long ball up to the big man, a knock-down inside, and a first-time strike from the D.',
      att: [
        { num: 4, name: 'Centre-back', x: 14, y: 45, role: 'ball', tip: 'The hunter is coming. Step forward and hit it long to the feet of the 9.' },
        { num: 9, name: 'Target man', x: 32, y: 19, role: 'ball', tip: 'Come off your marker to meet it. Aim early and knock it down inside, first time.' },
        { num: 10, name: 'Runner', x: 25, y: 36, role: 'ball', tip: 'Lose your marker early. Meet the knock-down on the D and strike it first time.' }
      ],
      order: [0, 1, 2],
      def: [
        { t: 'press', x: 18, y: 35, spd: 5.2 },
        { t: 'mark', a: 2, x: 25.2, y: 33.4, spd: 5.1, react: 20 },
        { t: 'mark', a: 1, x: 31.4, y: 16.7, spd: 5.3 },
        { t: 'line', x: 9, y: 14, spd: 5.1, eng: 4 }, { t: 'line', x: 19, y: 14, spd: 5.1, eng: 4 }, { t: 'line', x: 41, y: 14, spd: 5.1, eng: 4 }
      ]
    },
    {
      name: 'Across the keeper', time: 11,
      brief: 'Three players. The 9 takes his marker to the near post. The 11 cuts in and finds the far corner.',
      att: [
        { num: 9, name: 'Decoy', x: 22.4, y: 15.6, role: 'decoy', tip: 'No ball for you. Dart to the near post so your marker leaves the far corner open. Then DONE.' },
        { num: 8, name: 'Playmaker', x: 28, y: 43, role: 'ball', tip: 'Spread it wide left to the feet of the 11.' },
        { num: 11, name: 'Inside forward', x: 7, y: 28, role: 'ball', tip: 'Cut in to the corner of the box and shoot across the keeper, inside the far post.' }
      ],
      order: [0, 1, 2],
      def: [
        { t: 'mark', a: 0, x: 22.8, y: 13.3, spd: 5.2, eng: 2 },
        { t: 'zone', x: 22, y: 34, spd: 5, eng: 5 },
        { t: 'line', x: 8, y: 13.5, spd: 5, eng: 5 }, { t: 'line', x: 23, y: 13.5, spd: 5, eng: 2.5 },
        { t: 'line', x: 32, y: 13.5, spd: 5, eng: 7 }, { t: 'line', x: 42, y: 13.5, spd: 5, eng: 5 }
      ]
    },
    {
      name: 'One-touch move', time: 8,
      brief: 'Four players, no second touches. Up to the 9, back to the 10, rolled across the D and struck.',
      att: [
        { num: 6, name: 'Holder', x: 17, y: 43, role: 'ball', tip: 'The hunter is coming. Fire it up to the feet of the 9 at once.' },
        { num: 9, name: 'Target man', x: 20, y: 17.5, role: 'ball', tip: 'Come off your marker. Aim early and set it back to the 10, first time.' },
        { num: 10, name: 'Number ten', x: 26, y: 24.5, role: 'ball', tip: 'Aim early. Roll it first time across the D, into the path of the 8.' },
        { num: 8, name: 'Late runner', x: 37, y: 28, role: 'ball', tip: 'Time your run to meet it on the D. Strike it first time across the keeper.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'press', x: 23, y: 36, spd: 5.6 },
        { t: 'mark', a: 1, x: 20.4, y: 15.2, spd: 5.6, react: 10, tight: 0.85 },
        { t: 'mark', a: 3, x: 36, y: 25.6, spd: 5.4, react: 16 },
        { t: 'line', x: 9, y: 13.5, spd: 5.4, eng: 5 }, { t: 'line', x: 33, y: 13.5, spd: 5.4, eng: 5 }, { t: 'line', x: 43, y: 13.5, spd: 5.4, eng: 5 }
      ]
    }
  );
})(typeof module !== 'undefined' ? global : window);
