/* Pack 4: season 4 of the story, fixtures 21-28. Campaign version 2 (docs/foundation/21-campaign-v2.md),
   built by tools/gen/campaign-v2.js to RULEBOOK.md version 2: generated levels and the owner's favourite hand-built ones.
   Rebuild rather than edit by hand; ids (c01-c60) are permanent and never reused. */
(function (root) {
  const L = (root.OMT_LEVELS = root.OMT_LEVELS || []);
  L.push(
    // 21: Switch of play, hand-built favourite (baseline 5 (set A: fun 5, 4 takes)), standard
    {
      id: 'c21',
      name: 'Switch of play',
      time: 10,
      brief: 'Three players. They are packed on the right, so move it to the far side quickly.',
      att: [
        { num: 2, name: 'Right-back', x: 41, y: 45, role: 'ball', tip: 'You are crowded out. Roll it inside to the 6 before the press reaches you.' },
        { num: 6, name: 'Pivot', x: 27, y: 44, role: 'ball', tip: 'Do not dwell on it. Hit the diagonal early, behind their back line on the far side.' },
        { num: 11, name: 'Winger', x: 8, y: 30, role: 'ball', tip: 'Run onto the switch, drive into the box and shoot across the keeper into the far corner.' }
      ],
      order: [0, 1, 2],
      def: [
        { t: 'press', x: 37, y: 38, spd: 5.2 },
        { t: 'press', x: 25, y: 35, spd: 5.2 },
        { t: 'zone', x: 29, y: 35, spd: 5, eng: 5 },
        { t: 'line', x: 22, y: 27, spd: 5.3 },
        { t: 'line', x: 31, y: 27, spd: 5.3 },
        { t: 'line', x: 40, y: 27, spd: 5.3 }
      ]
    },
    // 22: Wing and cut-back, generated (seed 3133116736, attempt 1), standard
    {
      id: 'c22',
      name: 'Pull it back',
      time: 8,
      brief: 'Four players. Get the 7 in behind, to the byline, and pull it back to the penalty spot.',
      att: [
        { num: 6, name: 'Pivot', x: 18, y: 51, role: 'ball', tip: 'The hunter is coming. Play it across to the 8 at once.' },
        { num: 8, name: 'Midfielder', x: 31, y: 35.5, role: 'ball', tip: 'Aim early and slide it first time inside their full-back for the 7.' },
        { num: 7, name: 'Winger', x: 44, y: 25.5, role: 'ball', tip: 'Hold your width, go as the 8 plays it, get to the byline and cut it back to the penalty spot.' },
        { num: 10, name: 'Late runner', x: 22, y: 32.5, role: 'ball', tip: 'Arrive late on the penalty spot. Aim before the ball comes and hit it first time.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'line', x: 9.8, y: 21.5, spd: 5.4 },
        { t: 'line', x: 18.8, y: 21.5, spd: 5.4 },
        { t: 'line', x: 27.8, y: 21.5, spd: 5.4 },
        { t: 'line', x: 39.3, y: 21.5, spd: 5.4 },
        { t: 'mark', a: 1, x: 30.6, y: 33, spd: 5.6 },
        { t: 'zone', x: 25.8, y: 37, spd: 5.3, eng: 5 },
        { t: 'press', x: 13.2, y: 44.6, spd: 5.6 }
      ]
    },
    // 23: Bend the run, generated (seed 2131927675, attempt 1), standard
    {
      id: 'c23',
      name: 'Bend round them',
      time: 10,
      brief: 'Four players. Their high line holds. The 11 runs along it to stay onside, then bends in behind.',
      lines: { "0": { gap: 9 } },
      att: [
        { num: 4, name: 'Centre-back', x: 30, y: 54, role: 'ball', tip: 'You are being hunted. Play it short to the 6 straight away.' },
        { num: 6, name: 'Pivot', x: 20, y: 50, role: 'ball', tip: 'Not out wide: the screen is there. Find the 10 as he shows for it.' },
        { num: 10, name: 'Number ten', x: 27, y: 39, role: 'ball', tip: 'Come off your marker to meet it. Aim early and slide it first time between the centre-halves.' },
        { num: 11, name: 'Left winger', x: 7, y: 31.5, role: 'ball', tip: 'Do not run straight: you will be off. Run along the line, bend in as the 10 plays it, finish.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'line', x: 9.8, y: 28, spd: 5.4 },
        { t: 'line', x: 20.3, y: 28, spd: 5.4 },
        { t: 'line', x: 30.8, y: 28, spd: 5.4 },
        { t: 'line', x: 40.3, y: 28, spd: 5.4 },
        { t: 'mark', a: 2, x: 26.9, y: 36.6, spd: 5.6, react: 20 },
        { t: 'zone', x: 17.7, y: 41.3, spd: 5.2, eng: 5 },
        { t: 'press', x: 36.4, y: 48.4, spd: 5.6 }
      ]
    },
    // 24: Play through the press, generated (seed 1955080510, attempt 5), standard
    {
      id: 'c24',
      name: 'Beat the press',
      time: 10,
      brief: 'Four players. Beat two hunters with quick passes, then run at their back four and slide the 9 in.',
      att: [
        { num: 4, name: 'Centre-back', x: 19, y: 55, role: 'ball', tip: 'The first hunter is on his way. Roll it across to the 6 at once.' },
        { num: 6, name: 'Pivot', x: 32, y: 51, role: 'ball', tip: 'No time on the ball. Aim early and play it first time to the 8.' },
        { num: 8, name: 'Link', x: 17, y: 40.5, role: 'ball', tip: 'You are past the press. Drive at the back line and slide the 9 through.' },
        { num: 9, name: 'Striker', x: 29.5, y: 27.5, role: 'ball', tip: 'Stay level with the last man until the 8 plays it, then run on and finish.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'line', x: 7, y: 25.5, spd: 5.4 },
        { t: 'line', x: 18, y: 25.5, spd: 5.4 },
        { t: 'line', x: 28.5, y: 25.5, spd: 5.4 },
        { t: 'line', x: 40, y: 25.5, spd: 5.4 },
        { t: 'press', x: 19.7, y: 46, spd: 5.7 },
        { t: 'press', x: 35.8, y: 44.4, spd: 5.5 }
      ]
    },
    // 25: False nine, generated (seed 1893477261, attempt 2), standard
    {
      id: 'c25',
      name: 'Empty the middle',
      time: 10,
      brief: 'Four players. The 9 drops deep and his centre-half follows. The 11 runs into the hole he leaves.',
      att: [
        { num: 5, name: 'Centre-back', x: 31, y: 55, role: 'ball', tip: 'Play it short to the 8 on your left.' },
        { num: 9, name: 'False nine', x: 22.5, y: 31, role: 'decoy', tip: 'No ball for you. Come short about ten metres and take your marker with you. Then press DONE.' },
        { num: 8, name: 'Playmaker', x: 16, y: 47, role: 'ball', tip: 'Aim early. As it arrives, hit it first time through the hole the 9 has left.' },
        { num: 11, name: 'Runner', x: 16.5, y: 33, role: 'ball', tip: 'Wait on their line, go as the 8 plays it, then run into the hole and finish.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'line', x: 13.5, y: 28.5, spd: 5.2 },
        { t: 'line', x: 33.5, y: 28.5, spd: 5.2 },
        { t: 'line', x: 43, y: 28.5, spd: 5.2 },
        { t: 'mark', a: 1, x: 22.7, y: 28.8, spd: 5.2 },
        { t: 'mark', a: 2, x: 16.4, y: 45, spd: 5.3 },
        { t: 'zone', x: 29.2, y: 44.2, spd: 5.2, eng: 5 }
      ]
    },
    // 26: Short then long, generated (seed 680901011, attempt 6), standard
    {
      id: 'c26',
      name: 'Check and spin',
      time: 10,
      brief: 'Four players. Short, short, then long: the 9 drags his marker towards the ball and spins away.',
      lines: { "0": { gap: 9 } },
      att: [
        { num: 4, name: 'Centre-back', x: 36, y: 52, role: 'ball', tip: 'The hunter is coming. Roll it across to the 6 at once.' },
        { num: 6, name: 'Pivot', x: 24, y: 49, role: 'ball', tip: 'Do not take a touch. Aim early and play it first time to the 8.' },
        { num: 8, name: 'Playmaker', x: 13, y: 42, role: 'ball', tip: 'A second hunter is coming. Play it early in behind for the 9.' },
        { num: 9, name: 'Striker', x: 25, y: 33, role: 'ball', tip: 'Check towards the ball, then spin in behind as the 8 plays it, and finish.' }
      ],
      order: [0, 1, 2, 3],
      def: [
        { t: 'line', x: 36.5, y: 25.5, spd: 5.3 },
        { t: 'line', x: 25.5, y: 25.5, spd: 5.3 },
        { t: 'line', x: 15.5, y: 25.5, spd: 5.3 },
        { t: 'mark', a: 3, x: 25, y: 30.4, spd: 5.5, react: 22, tight: 1.2 },
        { t: 'zone', x: 19.6, y: 37.1, spd: 5.2, eng: 5 },
        { t: 'press', x: 29.9, y: 47.6, spd: 5.5 },
        { t: 'press', x: 6.3, y: 35.3, spd: 5.6 }
      ]
    },
    // 27: The counter, generated (seed 2549504464, attempt 9), hard
    {
      id: 'c27',
      name: 'Catch them upfield',
      time: 10,
      brief: 'Three players on the break against two centre-halves. Commit one, then slip the 7 in.',
      att: [
        { num: 6, name: 'Ball-winner', x: 30, y: 53, role: 'ball', tip: 'You have just won it. Play it forward to the 10 at once, before the press reaches you.' },
        { num: 10, name: 'Carrier', x: 24, y: 43.5, role: 'ball', tip: 'Drive at the two centre-halves. When one steps out to you, slip the 7 in on your left.' },
        { num: 7, name: 'Winger', x: 7.5, y: 42.5, role: 'ball', tip: 'Keep level with their line, go as the 10 plays it, then finish across the keeper.' }
      ],
      order: [0, 1, 2],
      def: [
        { t: 'line', x: 31, y: 28.5, spd: 5.4 },
        { t: 'line', x: 20, y: 28.5, spd: 5.4 },
        { t: 'press', x: 36.4, y: 48.1, spd: 5.7 },
        { t: 'press', x: 16.5, y: 47.6, spd: 5.5 }
      ]
    },
    // 28: Five-man move, hand-built favourite (set E Test 02, generated closing Five-man move, seed 501 (fun 5, fair 5, 9 takes)), closing
    {
      id: 'c28',
      name: 'Every man touches it',
      time: 10,
      brief: 'Five players. Beat the hunter, find the 10 between the lines, then the 7 in behind.',
      lines: { "0": { gap: 8 } },
      att: [
        { num: 4, name: 'Centre-back', x: 19, y: 55, role: 'ball', tip: 'You are being hunted. Play it short to the 6 at once.' },
        { num: 6, name: 'Pivot', x: 32, y: 51, role: 'ball', tip: 'Aim early and move it first time, out to the 8 on the left.' },
        { num: 8, name: 'Link', x: 17, y: 40, role: 'ball', tip: 'Take it forward a few yards, then find the 10 as he comes short.' },
        { num: 10, name: 'Creator', x: 21.5, y: 34, role: 'ball', tip: 'Lose your marker, aim early and play it first time in behind for the 7.' },
        { num: 7, name: 'Winger', x: 36, y: 29.5, role: 'ball', tip: 'Cut in off the right as the 10 plays it. Stay onside, run on and finish.' }
      ],
      order: [0, 1, 2, 3, 4],
      def: [
        { t: 'line', x: 9.5, y: 24, spd: 5.4 },
        { t: 'line', x: 20, y: 24, spd: 5.4 },
        { t: 'line', x: 29.5, y: 24, spd: 5.4 },
        { t: 'line', x: 40.5, y: 24, spd: 5.4 },
        { t: 'mark', a: 3, x: 21.7, y: 31.7, spd: 5.5, react: 18 },
        { t: 'zone', x: 33.7, y: 38.9, spd: 5.2, eng: 5 },
        { t: 'press', x: 21, y: 47.8, spd: 5.7 }
      ]
    }
  );
})(typeof module !== 'undefined' ? global : window);
