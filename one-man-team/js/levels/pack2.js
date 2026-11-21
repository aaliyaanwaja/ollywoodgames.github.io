/* Pack 2: intermediate (moves 5-12).
   Every defence is a shape on the engine-v2 types: a `line` back-line unit plus `zone` screens, `press` hunters and
   `mark` man-markers as the idea calls for. See tools/LEVEL_DESIGN.md. */
(function (root) {
  const L = (root.OMT_LEVELS = root.OMT_LEVELS || []);
  L.push({
      name: 'Switch of play', time: 12,
      brief: 'Three players. They are packed on the right, so move it to the far side quickly.',
      att: [
        { num: 2, name: 'Right-back', x: 41, y: 45, role: 'ball', tip: 'You are crowded out. Roll it inside to the 6 before the press reaches you.' },
        { num: 6, name: 'Pivot', x: 27, y: 44, role: 'ball', tip: 'Do not dwell on it. Hit the diagonal early, behind their back line on the far side.' },
        { num: 11, name: 'Winger', x: 8, y: 30, role: 'ball', tip: 'Run onto the switch, drive into the box and finish at the near post.' }
      ],
      order: [0, 1, 2],
      def: [
        { t: 'press', x: 37, y: 38, spd: 4.8 },
        { t: 'line', x: 28, y: 27, spd: 5.0 }, { t: 'line', x: 39, y: 27, spd: 5.0 }
      ]
    },
    {
      name: 'The lay-off', time: 14,
      brief: 'Three players. Up to the 9, set back first time, and a runner from deep goes through the middle.',
      att: [
        { num: 6, name: 'Holder', x: 25, y: 53, role: 'ball', tip: 'Step right to open the lane past the screen, then play it firmly into the feet of the 9.' },
        { num: 9, name: 'Target man', x: 27, y: 29, role: 'ball', tip: 'Come short so the centre-half follows. Aim early and lay it off first time to your right.' },
        { num: 10, name: 'Runner', x: 39, y: 47, role: 'ball', tip: 'Take the lay-off wide of the centre-half, burst through the hole he left and finish.' }
      ],
      order: [0, 1, 2],
      def: [
        { t: 'zone', x: 22, y: 43, spd: 5, eng: 5 },
        { t: 'mark', a: 1, x: 26.8, y: 26.6, spd: 5.2, eng: 5 },
        { t: 'line', x: 17, y: 25, spd: 5, eng: 6 }, { t: 'line', x: 42, y: 25, spd: 5, eng: 6 }
      ]
    },
    {
      name: 'The cut-back', time: 10,
      brief: 'Get to the byline and pull it back. First, the 9 has to take his marker off the penalty spot.',
      att: [
        { num: 9, name: 'Decoy', x: 26, y: 14, role: 'decoy', tip: 'No ball for you. Dart to the near post so your marker leaves the spot, then press DONE.' },
        { num: 7, name: 'Winger', x: 44, y: 27, role: 'ball', tip: 'Stay wide and beat the full-back to the byline, then pull it back to the penalty spot.' },
        { num: 8, name: 'Late runner', x: 21, y: 27, role: 'ball', tip: 'Arrive late on the penalty spot. Aim before the ball comes and hit it first time.' }
      ],
      order: [0, 1, 2],
      def: [
        { t: 'press', x: 39, y: 32, spd: 5.2 },
        { t: 'mark', a: 0, x: 25.8, y: 11.8, spd: 5.4 },
        { t: 'line', x: 10, y: 12, spd: 5, eng: 5 }, { t: 'line', x: 19, y: 12, spd: 5, eng: 5 }, { t: 'line', x: 32, y: 12, spd: 5, eng: 5 }
      ]
    },
    {
      name: 'The overlap', time: 16,
      brief: 'Four players. The 11 comes short and takes the full-back with him. The 3 goes round the outside.',
      att: [
        { num: 6, name: 'Holder', x: 23, y: 53, role: 'ball', tip: 'Play it short into the 11 as he comes towards you.' },
        { num: 11, name: 'Winger', x: 8, y: 38, role: 'ball', tip: 'Come short and inside so the full-back follows. Aim early, play it first time down the line.' },
        { num: 3, name: 'Left-back', x: 5, y: 53, role: 'ball', tip: 'Go at once. Sprint up the empty touchline to the byline and pull it back for the 9.' },
        { num: 9, name: 'Striker', x: 26, y: 22, role: 'ball', tip: 'Arrive late near the penalty spot, in front of the defenders, and hit it first time.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'zone', x: 27, y: 42, spd: 5, eng: 6 },
        { t: 'mark', a: 1, x: 9, y: 35.8, spd: 5.4 },
        { t: 'line', x: 19, y: 20, spd: 5.2, eng: 7 }, { t: 'line', x: 28, y: 20, spd: 5.2, eng: 7 }, { t: 'line', x: 37, y: 20, spd: 5.2, eng: 7 }
      ]
    },
    {
      name: 'Diagonal in behind', time: 12,
      brief: 'Three players. They have squeezed across to the ball. Hit a diagonal behind the far full-back.',
      att: [
        { num: 4, name: 'Centre-back', x: 30, y: 54, role: 'ball', tip: 'Step out and find the 8 on your left before the press gets to you.' },
        { num: 8, name: 'Playmaker', x: 15, y: 44, role: 'ball', tip: 'One touch inside, then hit the diagonal behind the back line before you are closed down.' },
        { num: 7, name: 'Inside forward', x: 41, y: 28.5, role: 'ball', tip: 'Stay level with the last man until the diagonal is hit, then cut in behind and finish.' }
      ],
      order: [0, 1, 2],
      def: [
        { t: 'press', x: 30, y: 46, spd: 5.4 },
        { t: 'zone', x: 14, y: 36, spd: 5.2, eng: 6 },
        { t: 'line', x: 5, y: 26, spd: 5.2 }, { t: 'line', x: 13, y: 26, spd: 5.2 }, { t: 'line', x: 21, y: 26, spd: 5.2 },
        { t: 'line', x: 29, y: 26, spd: 5.2 }
      ]
    },
    {
      name: 'Third-man run', time: 12,
      brief: 'Four players. The 9 comes short and drags his centre-half out. The 11 runs into the hole.',
      att: [
        { num: 5, name: 'Centre-back', x: 20, y: 55, role: 'ball', tip: 'The screen blocks the straight pass. Roll it across to the 6 on your right.' },
        { num: 6, name: 'Holder', x: 34, y: 46, role: 'ball', tip: 'Take it and play it firmly into the 9 as he comes short.' },
        { num: 9, name: 'Target man', x: 25, y: 28, role: 'ball', tip: 'Come short so the centre-half follows. Aim early and flick it first time into the hole.' },
        { num: 11, name: 'Third man', x: 9, y: 30, role: 'ball', tip: 'Go early. Run inside before the 9 touches it, take it in the hole he left and finish.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'zone', x: 20, y: 41, spd: 5, eng: 5 },
        { t: 'mark', a: 2, x: 25, y: 25.6, spd: 5.4, eng: 6 },
        { t: 'line', x: 12, y: 25, spd: 5.2 }, { t: 'line', x: 38, y: 25, spd: 5.2 }
      ]
    },
    {
      name: 'The counter', time: 14,
      brief: 'Three players. They are caught upfield with two men back. Break before the rest recover.',
      att: [
        { num: 6, name: 'Ball-winner', x: 20, y: 53, role: 'ball', tip: 'You have just won it. Play it forward to the 10 at once, before the press reaches you.' },
        { num: 10, name: 'Carrier', x: 26, y: 42, role: 'ball', tip: 'Drive at the two centre-halves. When one steps out to you, slip the 7 in on your right.' },
        { num: 7, name: 'Winger', x: 41, y: 41, role: 'ball', tip: 'Sprint to stay level with the 10, take his pass beyond the last man and finish.' }
      ],
      order: [0, 1, 2],
      def: [
        { t: 'press', x: 13, y: 48, spd: 5.4 },
        { t: 'press', x: 34, y: 49, spd: 5.4 },
        { t: 'line', x: 20, y: 27, spd: 5.3 }, { t: 'line', x: 30, y: 27, spd: 5.3 }
      ]
    },
    {
      name: 'Push them back', time: 10,
      brief: 'The 9 runs in behind without the ball and the back line drops with him. Use the room in front of it.',
      att: [
        { num: 9, name: 'Decoy', x: 40, y: 24, role: 'decoy', tip: 'No ball for you. Run across the back line towards the far post to push it deep, then DONE.' },
        { num: 8, name: 'Playmaker', x: 26, y: 53, role: 'ball', tip: 'Carry forward while the line drops, then fire it into the space in front of it for the 10.' },
        { num: 10, name: 'Number ten', x: 14, y: 31, role: 'ball', tip: 'Arrive on the penalty spot as the pass does. Aim early and hit it first time.' }
      ],
      order: [0, 1, 2],
      def: [
        { t: 'zone', x: 17, y: 27, spd: 5, eng: 5 },
        { t: 'zone', x: 33, y: 27, spd: 5, eng: 5 },
        { t: 'line', x: 10, y: 20, spd: 5 }, { t: 'line', x: 20, y: 20, spd: 5 }, { t: 'line', x: 30, y: 20, spd: 5 },
        { t: 'line', x: 40, y: 20, spd: 5 }
      ],
      gk: { sweeper: true },
      lines: { 0: { floor: 8 } }
    });
})(typeof module !== 'undefined' ? global : window);
