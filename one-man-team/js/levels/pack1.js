/* Pack 1: the basics (moves 1-4).
   Defences use the engine-v2 types: `line` (back-line unit), `zone` (screening midfielder), `press`, `mark`.
   See tools/LEVEL_DESIGN.md. */
(function (root) {
  const L = (root.OMT_LEVELS = root.OMT_LEVELS || []);
  L.push({
      name: 'Through ball', time: 9,
      brief: 'Two players. Slide it in behind, then be the one who runs onto it.',
      att: [
        { num: 8, name: 'Playmaker', x: 25, y: 50, role: 'ball', tip: 'Carry it away from the holding midfielder, then slide a pass between the centre-halves for the 9.' },
        { num: 9, name: 'Striker', x: 28, y: 26.6, role: 'ball', tip: 'Your pass is coming. Stay level with the last defender until it is hit, then run on and finish.' }
      ],
      order: [0, 1],
      def: [
        { t: 'zone', x: 25, y: 40, spd: 5.0, eng: 4 },
        { t: 'line', x: 10, y: 25, spd: 5.0 }, { t: 'line', x: 20, y: 25, spd: 5.0 },
        { t: 'line', x: 30, y: 25, spd: 5.0 }, { t: 'line', x: 40, y: 25, spd: 5.0 }
      ]
    },
    {
      name: 'Down the wing', time: 13,
      brief: 'Three players. Out wide, cross it low, arrive in the box.',
      att: [
        { num: 6, name: 'Holder', x: 25, y: 52, role: 'ball', tip: 'Find the 7 on the right. Play it where he can reach it before the full-back.' },
        { num: 7, name: 'Winger', x: 42, y: 41, role: 'ball', tip: 'Shake the full-back, collect the pass, get to the byline and cut it back for the 9.' },
        { num: 9, name: 'Striker', x: 24, y: 25, role: 'ball', tip: 'Arrive late in front of the back line. Aim before the cut-back comes and release as it arrives to hit it first time.' }
      ],
      order: [0, 1, 2],
      def: [
        { t: 'zone', x: 25, y: 42, spd: 5.2, eng: 6 },
        { t: 'mark', a: 1, x: 40.6, y: 38.3, spd: 5.4, eng: 3.5 },
        { t: 'line', x: 12, y: 23.5, spd: 5.2, eng: 5 }, { t: 'line', x: 22, y: 23.5, spd: 5.2, eng: 5 }, { t: 'line', x: 32, y: 23.5, spd: 5.2, eng: 5 }
      ]
    },
    {
      name: 'The decoy', time: 12,
      brief: 'Your first run never touches the ball. It only exists to drag a defender out of the way.',
      att: [
        { num: 10, name: 'Decoy', x: 25, y: 27, role: 'decoy', tip: 'No ball for you. Your marker follows wherever you go: pull him out of the middle, then press DONE.' },
        { num: 8, name: 'Playmaker', x: 25, y: 52, role: 'ball', tip: 'Carry right, away from the screen, then slip the 11 in through the gap your decoy opened.' },
        { num: 11, name: 'Inside forward', x: 9, y: 31, role: 'ball', tip: 'Cut inside off the left, stay onside, finish.' }
      ],
      order: [0, 1, 2],
      def: [
        { t: 'mark', a: 0, x: 25, y: 24.6, spd: 5.6, eng: 4 },
        { t: 'zone', x: 21, y: 43, spd: 5.2, eng: 6 },
        { t: 'mark', a: 2, x: 10.4, y: 28.4, spd: 5.4, eng: 3.5 },
        { t: 'line', x: 34, y: 24, spd: 5.2 }, { t: 'line', x: 43, y: 24, spd: 5.2 }
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
        { t: 'press', x: 25, y: 46, spd: 5.4 },
        { t: 'mark', a: 1, x: 13.9, y: 40.6, spd: 5.3, eng: 3.5 },
        { t: 'mark', a: 2, x: 30.6, y: 30.6, spd: 5.0, eng: 3.5 },
        { t: 'line', x: 7, y: 20, spd: 5.1 }, { t: 'line', x: 16.5, y: 20, spd: 5.1 },
        { t: 'line', x: 26, y: 20, spd: 5.1 }, { t: 'line', x: 35.5, y: 20, spd: 5.1 }
      ]
    });
})(typeof module !== 'undefined' ? global : window);
