/* Pack 5: counter-attacks (fixtures 29-36). The ball is won deep, their midfield is caught upfield and chasing back,
   and only two or three defenders are goal-side. Defender types and fields are described in tools/LEVEL_DESIGN.md. */
(function (root) {
  const L = (root.OMT_LEVELS = root.OMT_LEVELS || []);
  L.push(
    {
      name: 'Into the channel', time: 12,
      brief: 'Three players. They are caught upfield. Release the 9 down the channel before they get back.',
      att: [
        { num: 6, name: 'Ball-winner', x: 22, y: 54, role: 'ball', tip: 'You have won it. Give it to the 8 on your right at once, before the hunter arrives.' },
        { num: 8, name: 'Passer', x: 32, y: 47, role: 'ball', tip: 'One touch forward, then hit it firmly down the right channel, outside the centre-half.' },
        { num: 9, name: 'Striker', x: 31, y: 37, role: 'ball', tip: 'Peel off to the right, run on to the pass, cut into the box and finish at the near post.' }
      ],
      order: [0, 1, 2],
      def: [
        { t: 'press', x: 16, y: 56, spd: 5.2 },
        { t: 'press', x: 38, y: 55, spd: 5.2 },
        { t: 'line', x: 19, y: 34, spd: 5.3 }, { t: 'line', x: 29, y: 34, spd: 5.3 }
      ]
    },
    {
      name: 'Break down the flank', time: 14,
      brief: 'Three players. Get it wide, fly down the wing, then pull it inside for the 9 at the edge of the box.',
      att: [
        { num: 6, name: 'Ball-winner', x: 27, y: 53, role: 'ball', tip: 'Their full-back is caught upfield. Play it out to the 7 on the right touchline at once.' },
        { num: 7, name: 'Winger', x: 43, y: 45, role: 'ball', tip: 'Sprint down the line. Level with the box, pull it back inside to the D for the 9.' },
        { num: 9, name: 'Striker', x: 22, y: 41, role: 'ball', tip: 'Run through the middle and arrive at the D as the ball does. Aim early, hit it first time.' }
      ],
      order: [0, 1, 2],
      def: [
        { t: 'press', x: 21, y: 57, spd: 5.3 },
        { t: 'mark', a: 1, x: 39, y: 49, spd: 5.6 },
        { t: 'press', x: 31, y: 47, spd: 5.6 },
        { t: 'line', x: 20, y: 33, spd: 5.3 }, { t: 'line', x: 30, y: 33, spd: 5.3 }
      ],
      lines: { 0: { gap: 17, floor: 9 } }
    },
    {
      name: 'Two against one', time: 11,
      brief: 'Three players, one defender back. Run at him, make him choose, and square it for a first-time finish.',
      att: [
        { num: 8, name: 'Ball-winner', x: 27, y: 54, role: 'ball', tip: 'Play it forward into the path of the 10 at once. Every second lets them get back.' },
        { num: 10, name: 'Carrier', x: 20, y: 45, role: 'ball', tip: 'Drive at the last man. When he comes to you, square it to your right for the 11.' },
        { num: 11, name: 'Finisher', x: 34, y: 47, role: 'ball', tip: 'Sprint to stay level with the 10, never ahead. Aim early and sweep the square ball in.' }
      ],
      order: [0, 1, 2],
      def: [
        { t: 'press', x: 21, y: 57, spd: 5.4 },
        { t: 'press', x: 33, y: 57, spd: 5.4 },
        { t: 'line', x: 25, y: 31, spd: 5.3 }
      ]
    },
    {
      name: 'Three against two', time: 13,
      brief: 'Four players against two centre-halves. Draw one, go wide, draw the other, and square it to the far post.',
      att: [
        { num: 6, name: 'Ball-winner', x: 35, y: 52, role: 'ball', tip: 'Feed the 10 inside you and let him run at them.' },
        { num: 10, name: 'Carrier', x: 25, y: 47, role: 'ball', tip: 'Run at the centre-halves. As one steps out, slide it into the left channel for the 11.' },
        { num: 11, name: 'Left runner', x: 9, y: 44, role: 'ball', tip: 'Take it in your stride inside the box, then roll it across the six-yard box to the far post.' },
        { num: 7, name: 'Right runner', x: 40, y: 45, role: 'ball', tip: 'Keep up but stay behind the ball. Arrive at the far post as it is squared and tap it in.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'press', x: 18, y: 57, spd: 5.4 },
        { t: 'press', x: 40, y: 56, spd: 5.4 },
        { t: 'line', x: 20, y: 30, spd: 5.3 }, { t: 'line', x: 30, y: 30, spd: 5.3 }
      ],
      lines: { 0: { floor: 21 } }
    },
    {
      name: 'Strike on the break', time: 12,
      brief: 'Three players. The 9 is covered, but his run empties the middle. Carry into the space and shoot.',
      att: [
        { num: 9, name: 'Decoy', x: 27, y: 35, role: 'decoy', tip: 'No ball for you. Sprint out to the left of the box so your marker comes too, then DONE.' },
        { num: 6, name: 'Ball-winner', x: 20, y: 54, role: 'ball', tip: 'Find the 10 on your right straight away. The hunters are closing on you.' },
        { num: 10, name: 'Carrier', x: 30, y: 47, role: 'ball', tip: 'Nobody is free. Drive through the middle and shoot hard for a corner from the edge of the box.' }
      ],
      order: [0, 1, 2],
      def: [
        { t: 'press', x: 14, y: 56, spd: 5.4 },
        { t: 'press', x: 36, y: 55, spd: 5.5 },
        { t: 'mark', a: 0, x: 26.8, y: 32.6, spd: 5.6 },
        { t: 'line', x: 16, y: 31, spd: 5.3, eng: 6 }, { t: 'line', x: 36, y: 31, spd: 5.3, eng: 6 }
      ],
      lines: { 0: { floor: 12 } }
    }
  );
})(typeof module !== 'undefined' ? global : window);
