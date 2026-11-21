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
        { num: 6, name: 'Pivot', x: 27, y: 44, role: 'ball', tip: 'Take it and hit the diagonal early, into the space behind their left-back.' },
        { num: 11, name: 'Winger', x: 8, y: 30, role: 'ball', tip: 'Run onto the switch, drive into the box and finish at the near post.' }
      ],
      order: [0, 1, 2],
      def: [
        { t: 'press', x: 37, y: 38, spd: 5.2 },
        { t: 'zone', x: 29, y: 35, spd: 5, eng: 5 },
        { t: 'line', x: 12, y: 27, spd: 5 }, { t: 'line', x: 21, y: 27, spd: 5 }, { t: 'line', x: 30, y: 27, spd: 5 },
        { t: 'line', x: 39, y: 27, spd: 5 }
      ]
    });
})(typeof module !== 'undefined' ? global : window);
