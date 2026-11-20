/* Pack 1: the basics (moves 1-4). */
(function (root) {
  const L = (root.OMT_LEVELS = root.OMT_LEVELS || []);
  L.push({
      name: 'Through ball', time: 9,
      brief: 'Two players. Slide it in behind, then be the one who runs onto it.',
      att: [
        { num: 8, name: 'Playmaker', x: 25, y: 50, role: 'ball', tip: 'Carry forward and play a pass into the space behind the defence for the 9.' },
        { num: 9, name: 'Striker', x: 31, y: 27, role: 'ball', tip: 'Your pass is coming. Stay level with the last defender until it is hit, then run on and finish.' }
      ],
      order: [0, 1],
      def: [
        { t: 'zone', x: 25, y: 39, spd: 5.2, eng: 7 },
        { t: 'mark', a: 1, x: 30.6, y: 24.8, spd: 4.6, eng: 3.5 },
        { t: 'zone', x: 18, y: 25, spd: 5.3, eng: 6 }
      ]
    },
    {
      name: 'Down the wing', time: 13,
      brief: 'Three players. Out wide, cross it low, arrive in the box.',
      att: [
        { num: 6, name: 'Holder', x: 25, y: 52, role: 'ball', tip: 'Find the 7 on the right. Play it where he can reach it before the full-back.' },
        { num: 7, name: 'Winger', x: 42, y: 41, role: 'ball', tip: 'Shake the full-back, collect the pass, get down the line and cut it back for the 9.' },
        { num: 9, name: 'Striker', x: 24, y: 25, role: 'ball', tip: 'Lose your marker and meet the cross. Aim before the cross arrives and release just as it reaches you to hit it first time.' }
      ],
      order: [0, 1, 2],
      def: [
        { t: 'zone', x: 25, y: 42, spd: 5.2, eng: 7 },
        { t: 'mark', a: 1, x: 41.0, y: 38.8, spd: 5.4, eng: 3.5 },
        { t: 'mark', a: 2, x: 24.1, y: 22.8, spd: 5.5, eng: 3.5 },
        { t: 'zone', x: 32, y: 21, spd: 5.2, eng: 6 }
      ]
    },
    {
      name: 'The decoy', time: 12,
      brief: 'Your first run never touches the ball. It only exists to drag a defender out of the way.',
      att: [
        { num: 10, name: 'Decoy', x: 25, y: 27, role: 'decoy', tip: 'No ball for you. Your marker follows wherever you go: pull him out of the middle, then press DONE.' },
        { num: 8, name: 'Playmaker', x: 25, y: 52, role: 'ball', tip: 'Drive into the gap your decoy opened and slip the 11 in.' },
        { num: 11, name: 'Inside forward', x: 9, y: 31, role: 'ball', tip: 'Cut inside off the left, stay onside, finish.' }
      ],
      order: [0, 1, 2],
      def: [
        { t: 'mark', a: 0, x: 25, y: 24.8, spd: 5.6, eng: 4 },
        { t: 'zone', x: 21, y: 43, spd: 5.2, eng: 7 },
        { t: 'mark', a: 2, x: 10.0, y: 28.8, spd: 5.4, eng: 3.5 },
        { t: 'zone', x: 34, y: 23, spd: 5.2, eng: 6 }
      ]
    },
    {
      name: 'Tiki-taka', time: 14,
      brief: 'Four players, three passes, one clock. Every run has to fit around the ones before it.',
      att: [
        { num: 6, name: 'Holder', x: 25, y: 54, role: 'ball', tip: 'Start it. Find the 8 on the left before the press arrives.' },
        { num: 8, name: 'Link', x: 13, y: 43, role: 'ball', tip: 'Come off your marker, take it, and move it on to the 10 between the lines.' },
        { num: 10, name: 'Creator', x: 31, y: 33, role: 'ball', tip: 'Receive on the turn and thread the 9 through.' },
        { num: 9, name: 'Striker', x: 21, y: 22, role: 'ball', tip: 'Last touch. Time it, stay onside, score.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'zone', x: 25, y: 46, spd: 5.4, eng: 7 },
        { t: 'mark', a: 1, x: 13.7, y: 40.8, spd: 5.3, eng: 3.5 },
        { t: 'mark', a: 2, x: 30.6, y: 30.8, spd: 5.0, eng: 3.5 },
        { t: 'mark', a: 3, x: 21.2, y: 19.8, spd: 5.1, eng: 3.5 },
        { t: 'zone', x: 30, y: 21, spd: 5.2, eng: 6 }
      ]
    });
})(typeof module !== 'undefined' ? global : window);
