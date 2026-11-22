/* Pack 5: counter-attacks (fixtures 29-36). The ball is won deep, their midfield is caught upfield and chasing back
   (`press` hunters starting behind the ball), and only a thin back line is goal-side. Each level is a different kind
   of break. Defender types and fields are described in tools/LEVEL_DESIGN.md. */
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
        { t: 'line', x: 19, y: 34, spd: 5.35 }, { t: 'line', x: 29, y: 34, spd: 5.35 }
      ]
    },
    {
      name: 'Break down the flank', time: 14,
      brief: 'Three players. Get it wide, fly down the wing, then pull it inside for the 9 at the edge of the box.',
      att: [
        { num: 6, name: 'Ball-winner', x: 27, y: 53, role: 'ball', tip: 'Their full-back is caught upfield. Hit it down the right touchline, in front of the 7.' },
        { num: 7, name: 'Winger', x: 43, y: 45, role: 'ball', tip: 'Sprint down the line and past the last man, then pull it back inside to the D for the 9.' },
        { num: 9, name: 'Striker', x: 22, y: 41, role: 'ball', tip: 'Hold your run, then arrive at the D as the ball does. Aim early and hit it first time.' }
      ],
      order: [0, 1, 2],
      def: [
        { t: 'press', x: 21, y: 57, spd: 5.3 },
        { t: 'press', x: 31, y: 47, spd: 5.6 },
        { t: 'mark', a: 1, x: 39, y: 49, spd: 5.6 },
        { t: 'line', x: 20, y: 33, spd: 5.3 }, { t: 'line', x: 30, y: 33, spd: 5.3 }
      ],
      lines: { 0: { gap: 17, floor: 9 } }
    },
    {
      name: 'Through the middle', time: 10,
      brief: 'Three players, two passes, straight up the pitch. Go between the centre-halves before they can drop.',
      att: [
        { num: 6, name: 'Ball-winner', x: 24, y: 55, role: 'ball', tip: 'Fire it straight into the feet of the 10. A hunter is closing on him, so make it firm.' },
        { num: 10, name: 'Link', x: 26, y: 43, role: 'ball', tip: 'No time for a touch. Aim early and slide it first time between the centre-halves.' },
        { num: 9, name: 'Striker', x: 23, y: 34, role: 'ball', tip: 'Wait on the shoulder. Go between the centre-halves as the 10 plays it, then finish.' }
      ],
      order: [0, 1, 2],
      def: [
        { t: 'press', x: 18, y: 57, spd: 5.5 },
        { t: 'press', x: 33, y: 47, spd: 5.6 },
        { t: 'line', x: 19.5, y: 32, spd: 5.4 }, { t: 'line', x: 30.5, y: 32, spd: 5.4 }
      ]
    },
    {
      name: 'Strike on the break', time: 12,
      brief: 'Three players. The 9 is covered, but his run empties the middle. Carry into the space and shoot.',
      att: [
        { num: 9, name: 'Decoy', x: 27, y: 35, role: 'decoy', tip: 'No ball for you. Sprint out to the left of the box so your marker comes too, then DONE.' },
        { num: 6, name: 'Ball-winner', x: 20, y: 54, role: 'ball', tip: 'Find the 10 on your right straight away. The hunters are closing on you.' },
        { num: 10, name: 'Carrier', x: 30, y: 47, role: 'ball', tip: 'Nobody is free. Drive through the middle and shoot for a corner from the edge of the box.' }
      ],
      order: [0, 1, 2],
      def: [
        { t: 'press', x: 14, y: 56, spd: 5.4 },
        { t: 'press', x: 36, y: 55, spd: 5.5 },
        { t: 'mark', a: 0, x: 26.8, y: 32.6, spd: 5.6 },
        { t: 'line', x: 16, y: 31, spd: 5.3, eng: 6 }, { t: 'line', x: 36, y: 31, spd: 5.3, eng: 6 }
      ],
      lines: { 0: { floor: 12 } }
    },
    {
      name: 'Two against one', time: 11,
      brief: 'Three players, one defender back. Run at him, make him choose, and square it for a first-time finish.',
      att: [
        { num: 8, name: 'Ball-winner', x: 27, y: 54, role: 'ball', tip: 'Play it forward into the path of the 10 at once. Every second lets them get back.' },
        { num: 10, name: 'Carrier', x: 20, y: 45, role: 'ball', tip: 'Drive at the last man. As he sets himself to tackle, square it to your right for the 11.' },
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
      name: 'Near-post run', time: 11,
      brief: 'Three players. Their line is high. Go in behind it down the left, then drill it low to the near post.',
      att: [
        { num: 6, name: 'Ball-winner', x: 21, y: 54, role: 'ball', tip: 'Hit it long and early down the left touchline, into the space behind their back line.' },
        { num: 11, name: 'Winger', x: 6, y: 37, role: 'ball', tip: 'Stay onside, run on to it and cut in towards goal. Then drill it low to the near post.' },
        { num: 9, name: 'Striker', x: 27, y: 38, role: 'ball', tip: 'Stay behind the ball, then sprint to the near post as it is played and turn it in.' }
      ],
      order: [0, 1, 2],
      def: [
        { t: 'press', x: 28, y: 57, spd: 5.4 },
        { t: 'press', x: 14, y: 50, spd: 5.5 },
        { t: 'mark', a: 2, x: 26.8, y: 35.6, spd: 5.5 },
        { t: 'line', x: 18, y: 35, spd: 5.3 }, { t: 'line', x: 31, y: 35, spd: 5.3 }
      ]
    },
    {
      name: 'Three against two', time: 13,
      brief: 'Four players, two centre-halves. Draw one, slip it wide, and square it to the far post before they recover.',
      att: [
        { num: 6, name: 'Ball-winner', x: 35, y: 52, role: 'ball', tip: 'Feed the 10 inside you and let him run at them.' },
        { num: 10, name: 'Carrier', x: 25, y: 47, role: 'ball', tip: 'Run at the centre-halves. As one comes to you, slide it into the left channel for the 11.' },
        { num: 11, name: 'Left runner', x: 9, y: 44, role: 'ball', tip: 'Run on to it in the box. Aim early and drive it first time across goal to the far post.' },
        { num: 7, name: 'Right runner', x: 40, y: 45, role: 'ball', tip: 'Keep up but stay behind the ball. Arrive at the far post as it is squared and tap it in.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'press', x: 18, y: 57, spd: 5.4 },
        { t: 'press', x: 40, y: 56, spd: 5.4 },
        { t: 'line', x: 17.85, y: 30, spd: 5.5 }, { t: 'line', x: 30, y: 30, spd: 5.5 }
      ],
      lines: { 0: { floor: 18 } }
    },
    {
      name: 'The spare man', time: 14,
      brief: 'Four players. Break down the right to drag them over, then move it across fast to the spare man.',
      att: [
        { num: 6, name: 'Ball-winner', x: 30, y: 54, role: 'ball', tip: 'Send the 7 away down the right. Put it in front of him so he never breaks stride.' },
        { num: 7, name: 'Winger', x: 43, y: 46, role: 'ball', tip: 'Carry it down the right with the full-back chasing, then roll it firmly inside to the 10.' },
        { num: 10, name: 'Link', x: 27, y: 44, role: 'ball', tip: 'Arrive as it does. Aim early and sweep it first time across the pitch to the 11.' },
        { num: 11, name: 'Spare man', x: 9, y: 45, role: 'ball', tip: 'They have all gone to the ball. Take the pass in your stride, drive into the box and finish.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'press', x: 36, y: 57, spd: 5.5 },
        { t: 'press', x: 22, y: 56, spd: 5.5 },
        { t: 'mark', a: 1, x: 41.6, y: 43.4, spd: 5.6 },
        { t: 'mark', a: 2, x: 26.8, y: 41.4, spd: 5.5 },
        { t: 'line', x: 20, y: 33, spd: 5.5 }, { t: 'line', x: 30, y: 33, spd: 5.5 }
      ]
    }
  );
})(typeof module !== 'undefined' ? global : window);
