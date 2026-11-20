/* Pack 2: intermediate (moves 5-12). */
(function (root) {
  const L = (root.OMT_LEVELS = root.OMT_LEVELS || []);
  L.push({
      name: 'Switch of play', time: 13,
      brief: 'Three players. They are packed on the left, so move it to the far side quickly.',
      att: [
        { num: 3, name: 'Left-back', x: 9, y: 44, role: 'ball', tip: 'You are crowded out. Roll it inside to the 6 before the press reaches you.' },
        { num: 6, name: 'Pivot', x: 25, y: 45, role: 'ball', tip: 'Take it and hit a long diagonal into the space in front of the 7 on the far side.' },
        { num: 7, name: 'Winger', x: 43, y: 39, role: 'ball', tip: 'Run onto the switch, drive right into the box and finish from close in.' }
      ],
      order: [0, 1, 2],
      def: [
        { t: 'zone', x: 12, y: 36, spd: 5.2, eng: 7 },
        { t: 'zone', x: 23, y: 36, spd: 5.0, eng: 6 },
        { t: 'mark', a: 2, x: 41.9, y: 36.8, spd: 4.8, eng: 3.5 },
        { t: 'zone', x: 25, y: 21, spd: 5.0, eng: 6 }
      ]
    },
    {
      name: 'The lay-off', time: 12,
      brief: 'Three players. Up to the 9, set back first time, and a runner from deep takes it on.',
      att: [
        { num: 6, name: 'Holder', x: 25, y: 52, role: 'ball', tip: 'Play it firmly into the feet of the 9. He will come short to meet it.' },
        { num: 9, name: 'Target man', x: 25, y: 30, role: 'ball', tip: 'Come short, away from your marker. Aim early and lay it off first time, left, for the 10.' },
        { num: 10, name: 'Runner', x: 15, y: 45, role: 'ball', tip: 'Arrive as the lay-off is played, take it in your stride and go through to finish.' }
      ],
      order: [0, 1, 2],
      def: [
        { t: 'zone', x: 33, y: 42, spd: 5.0, eng: 6 },
        { t: 'mark', a: 1, x: 25, y: 27.8, spd: 5.0, eng: 3.5 },
        { t: 'zone', x: 11, y: 24, spd: 5.0, eng: 6 },
        { t: 'zone', x: 32, y: 20, spd: 5.0, eng: 6 }
      ]
    },
    {
      name: 'The cut-back', time: 10,
      brief: 'Get to the byline and pull it back. First, clear the centre-back out of the way.',
      att: [
        { num: 11, name: 'Winger', x: 7, y: 30, role: 'ball', tip: 'Stay wide, reach the byline, then pull it back towards the penalty spot.' },
        { num: 9, name: 'Decoy', x: 22, y: 14, role: 'decoy', tip: 'No ball for you. Dart to the near post so your marker leaves the penalty spot, then press DONE.' },
        { num: 8, name: 'Late runner', x: 31, y: 30, role: 'ball', tip: 'Arrive late around the penalty spot, meet the cut-back and finish low.' }
      ],
      order: [1, 0, 2],
      def: [
        { t: 'zone', x: 15, y: 23, spd: 5.0, eng: 5 },
        { t: 'mark', a: 1, x: 22.2, y: 11.8, spd: 5.4, eng: 3.5 },
        { t: 'zone', x: 32, y: 20, spd: 5.0, eng: 6 }
      ]
    },
    {
      name: 'The overlap', time: 12,
      brief: 'Four players. The winger comes short and takes his marker with him. The 2 goes round the outside.',
      att: [
        { num: 6, name: 'Holder', x: 27, y: 53, role: 'ball', tip: 'Play it short into the 7 as he comes towards you.' },
        { num: 7, name: 'Winger', x: 42, y: 38, role: 'ball', tip: 'Come short and inside so your marker follows. Aim early and play it first time down the line.' },
        { num: 2, name: 'Full-back', x: 45, y: 53, role: 'ball', tip: 'Go at once. Sprint up the empty touchline, take the pass and cross low to the near post.' },
        { num: 9, name: 'Striker', x: 24, y: 22, role: 'ball', tip: 'Dart across your marker to the near post and turn the cross in.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'zone', x: 23, y: 42, spd: 5.0, eng: 6 },
        { t: 'mark', a: 1, x: 41.0, y: 35.8, spd: 5.4, eng: 3.5 },
        { t: 'mark', a: 3, x: 24.1, y: 19.8, spd: 5.5, eng: 3.5 },
        { t: 'zone', x: 18, y: 20, spd: 5.0, eng: 6 }
      ]
    },
    {
      name: 'Diagonal in behind', time: 11,
      brief: 'Three players. From the right half-space, hit a diagonal behind the defence for the 11.',
      att: [
        { num: 4, name: 'Centre-back', x: 21, y: 54, role: 'ball', tip: 'Step out and find the 8 on your right.' },
        { num: 8, name: 'Playmaker', x: 36, y: 43, role: 'ball', tip: 'Take a touch inside, then hit the diagonal behind the back line before you are closed down.' },
        { num: 11, name: 'Inside forward', x: 9, y: 28, role: 'ball', tip: 'Hold your run until the diagonal is hit, then cut in behind and finish.' }
      ],
      order: [0, 1, 2],
      def: [
        { t: 'zone', x: 26, y: 39, spd: 5.2, eng: 6 },
        { t: 'mark', a: 2, x: 10.0, y: 25.8, spd: 5.3, eng: 3.5 },
        { t: 'zone', x: 27, y: 22, spd: 5.2, eng: 6 },
        { t: 'zone', x: 37, y: 25, spd: 5.0, eng: 6 }
      ]
    },
    {
      name: 'Third-man run', time: 12,
      brief: 'Four players. The 9 comes short and drags his centre-back out. The 7 runs into the hole.',
      att: [
        { num: 5, name: 'Centre-back', x: 30, y: 55, role: 'ball', tip: 'Start it. Roll it across to the 6 on your left.' },
        { num: 6, name: 'Holder', x: 16, y: 46, role: 'ball', tip: 'Take it and play it firmly into the 9 as he comes short.' },
        { num: 9, name: 'Target man', x: 25, y: 28, role: 'ball', tip: 'Come short towards the right. Aim early and flick it first time into the space you left.' },
        { num: 7, name: 'Third man', x: 41, y: 32, role: 'ball', tip: 'Run in behind off the right as the 9 touches it. Stay onside, then finish.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'zone', x: 33, y: 45, spd: 5.0, eng: 6 },
        { t: 'mark', a: 2, x: 25, y: 25.8, spd: 5.2, eng: 3.5 },
        { t: 'mark', a: 3, x: 40.0, y: 29.8, spd: 5.5, eng: 3.5 },
        { t: 'zone', x: 26, y: 21, spd: 5.3, eng: 7 }
      ]
    },
    {
      name: 'Push them back', time: 10,
      brief: 'The 9 runs in behind without the ball. The offside line drops with him, and the 7 can go early.',
      att: [
        { num: 9, name: 'Decoy', x: 24, y: 27, role: 'decoy', tip: 'No ball for you. Sprint towards the left post so your marker drops deep, then press DONE.' },
        { num: 8, name: 'Playmaker', x: 25, y: 47, role: 'ball', tip: 'Step forward to the right and slide it into the box for the 7. He is onside thanks to the 9.' },
        { num: 7, name: 'Winger', x: 39, y: 28, role: 'ball', tip: 'Go early. The 9 keeps you onside, so be past your marker before the pass is hit.' }
      ],
      order: [0, 1, 2],
      def: [
        { t: 'mark', a: 0, x: 24.1, y: 24.8, spd: 5.6, eng: 3.5 },
        { t: 'zone', x: 17, y: 40, spd: 5.2, eng: 6 },
        { t: 'mark', a: 2, x: 38.2, y: 25.8, spd: 5.5, eng: 3.5 },
        { t: 'zone', x: 14, y: 26, spd: 5.2, eng: 6 }
      ]
    });
})(typeof module !== 'undefined' ? global : window);
