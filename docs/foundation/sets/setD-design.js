// Rating set D: the five trial moves of the rulebook (version 1, section 4.2 "Trial"), one level each, in design order.
// Live engine defaults (A+B and the marker hand-over on): no `engine` field. Each level carries its `key`.
// `node design.js` writes the levels and bot scripts, in this order, into root/ so the repo tools can be run on them
// (root/tools/test.js, the forensics scripts with ROOT=root, tools/human/run.js --root root).
// make.js later shuffles them into the blind rating order.
'use strict';
const LEVELS = [
  // ---------------------------------------------------------------- A4 Up, back and through
  {
    key: 'A4 Up, back and through',
    name: 'Up, back and through', time: 9,
    brief: 'Four players. Up to the 9, back to the 10, then through. Their line steps up on the ball back.',
    att: [
      { num: 6, name: 'Pivot', x: 22, y: 51, role: 'ball', tip: 'The hunter is on you and the screen blocks the 10. Fire it up to the feet of the 9.' },
      { num: 9, name: 'Target man', x: 25, y: 33, role: 'ball', tip: 'Come short with your marker on your back. Aim early and set it back first time to the 10.' },
      { num: 10, name: 'Number ten', x: 31, y: 45, role: 'ball', tip: 'Meet the set-back. Aim early and thread it first time between their right-back and centre-half.' },
      { num: 7, name: 'Winger', x: 40, y: 31, role: 'ball', tip: 'Their line steps up on the ball back. Cross it as the 10 plays it, run on and finish across the keeper.' }
    ],
    order: [0, 1, 2, 3],
    def: [
      { t: 'press', x: 17, y: 44, spd: 5.3 },
      { t: 'zone', x: 27.5, y: 44, spd: 5.2, eng: 5 },
      { t: 'mark', a: 1, x: 25, y: 30.6, spd: 5.3, react: 20 },
      { t: 'line', x: 10, y: 28, spd: 5.2 }, { t: 'line', x: 20, y: 28, spd: 5.2 },
      { t: 'line', x: 30, y: 28, spd: 5.2 }, { t: 'line', x: 40, y: 28, spd: 5.2 }
    ],
    lines: { 0: { gap: 9 } }
  },
  // ---------------------------------------------------------------- A7 Short then long
  {
    key: 'A7 Short then long',
    name: 'Short then long', time: 10,
    brief: 'Four players. The 9 comes short to pull his marker up the pitch, then spins in behind him.',
    att: [
      { num: 4, name: 'Centre-back', x: 14, y: 52, role: 'ball', tip: 'The hunter is coming. Roll it across to the 6 at once.' },
      { num: 6, name: 'Pivot', x: 26, y: 49, role: 'ball', tip: 'Aim early and move it on first time, out to the 8 on your right.' },
      { num: 8, name: 'Playmaker', x: 37, y: 42, role: 'ball', tip: 'Another hunter is closing. Take it and play it early, in behind their middle, for the 9 to run on to.' },
      { num: 9, name: 'Striker', x: 25, y: 32, role: 'ball', tip: 'Come short so your marker follows. Spin in behind just before the 8 plays it, then finish across the keeper.' }
    ],
    order: [0, 1, 2, 3],
    def: [
      { t: 'press', x: 19.5, y: 47, spd: 5.3 },
      { t: 'zone', x: 30, y: 37, spd: 5.2, eng: 5 },
      { t: 'press', x: 44, y: 34, spd: 5.3 },
      { t: 'mark', a: 3, x: 25, y: 29.5, spd: 5.3, react: 24, tight: 1.2 },
      { t: 'line', x: 14.5, y: 25.5, spd: 5.2 }, { t: 'line', x: 25, y: 25.5, spd: 5.2 }, { t: 'line', x: 35.5, y: 25.5, spd: 5.2 }
    ],
    lines: { 0: { gap: 9 } }
  },
  // ---------------------------------------------------------------- C2 Bend the run
  {
    key: 'C2 Bend the run',
    name: 'Bend the run', time: 10,
    brief: 'Four players. Their high line holds. The 11 runs along it to stay onside, then bends in behind.',
    att: [
      { num: 4, name: 'Centre-back', x: 30, y: 54, role: 'ball', tip: 'The hunter is coming. Roll it across to the 6 on your left at once.' },
      { num: 6, name: 'Pivot', x: 20, y: 50, role: 'ball', tip: 'The screen blocks the wide ball. Play it across into the 10 as he comes off his marker.' },
      { num: 10, name: 'Number ten', x: 27, y: 41, role: 'ball', tip: 'Come off your marker to meet it. Aim early and slide it first time between the centre-halves.' },
      { num: 11, name: 'Left winger', x: 7, y: 33.5, role: 'ball', tip: 'Run across along their line to stay onside. Bend in behind as the 10 plays it, and finish.' }
    ],
    order: [0, 1, 2, 3],
    def: [
      { t: 'press', x: 36, y: 48, spd: 5.3 },
      { t: 'zone', x: 17, y: 42, spd: 5.2, eng: 5 },
      { t: 'mark', a: 2, x: 26.6, y: 38.6, spd: 5.3 },
      { t: 'line', x: 10, y: 30, spd: 5.2 }, { t: 'line', x: 20, y: 30, spd: 5.2 },
      { t: 'line', x: 30, y: 30, spd: 5.2 }, { t: 'line', x: 40, y: 30, spd: 5.2 }
    ],
    lines: { 0: { gap: 8 } }
  },
  // ---------------------------------------------------------------- C6 Commit the centre-half
  {
    key: 'C6 Commit the centre-half',
    name: 'Commit the centre-half', time: 10,
    brief: 'Three players. Run at a centre-half until he steps out to you, then slip the 9 in behind before he tackles.',
    att: [
      { num: 6, name: 'Holder', x: 30, y: 52, role: 'ball', tip: 'The hunter is coming. Play it into the 10 between the lines, away from the screen.' },
      { num: 10, name: 'Number ten', x: 20, y: 40, role: 'ball', tip: 'Drive at the left centre-half. When he steps out to you, slip the 9 in on your right before he tackles.' },
      { num: 9, name: 'Striker', x: 31, y: 29, role: 'ball', tip: 'Hold your run on their line. Go in behind as the centre-half steps out to the 10, then finish.' }
    ],
    order: [0, 1, 2],
    def: [
      { t: 'press', x: 36, y: 46, spd: 5.3 },
      { t: 'zone', x: 24, y: 41.5, spd: 5.2, eng: 5 },
      { t: 'line', x: 9, y: 26, spd: 5.2 }, { t: 'line', x: 19, y: 26, spd: 5.2 },
      { t: 'line', x: 29, y: 26, spd: 5.2 }, { t: 'line', x: 39, y: 26, spd: 5.2 }
    ],
    lines: { 0: { gap: 8 } }
  },
  // ---------------------------------------------------------------- B4 Ball inside the full-back
  {
    key: 'B4 Ball inside the full-back',
    name: 'Inside the full-back', time: 9,
    brief: 'Four players. Their full-back is wide to watch the winger. Slide it inside him for the 7 to run on to.',
    att: [
      { num: 6, name: 'Pivot', x: 18, y: 51, role: 'ball', tip: 'The hunter is coming. Roll it across to the 8 on your right.' },
      { num: 8, name: 'Midfielder', x: 34, y: 47, role: 'ball', tip: 'Do not dwell: the screen steps across. Play it at once into the 10 as he comes off his marker.' },
      { num: 10, name: 'Number ten', x: 26, y: 35, role: 'ball', tip: 'Come off your marker. Aim early and slide it first time inside the full-back.' },
      { num: 7, name: 'Winger', x: 44, y: 28, role: 'ball', tip: 'Hold your width on their line. Dart inside the full-back just as the 10 plays it, then finish.' }
    ],
    order: [0, 1, 2, 3],
    def: [
      { t: 'press', x: 14, y: 44, spd: 5.3 },
      { t: 'zone', x: 23, y: 40.5, spd: 5.2, eng: 5 },
      { t: 'mark', a: 2, x: 25.8, y: 32.6, spd: 5.3 },
      { t: 'line', x: 12, y: 25, spd: 5.2 }, { t: 'line', x: 21, y: 25, spd: 5.2 },
      { t: 'line', x: 30, y: 25, spd: 5.2 }, { t: 'line', x: 41.5, y: 25, spd: 5.2 }
    ]
  }
];

const SCRIPTS = [
  [ { carry: [[21, 50]], kickAt: [25, 35], power: 0.75 },
    { start: 0, pre: [[25, 35]], spot: 1, grab: 2.5, first: 1, kickAt: [30.5, 42.5], power: 0.25 },
    { start: 40, pre: [[30.5, 42.5]], spot: 1, first: 1, kickAt: [36, 10], power: 1 },
    { start: 66, pre: [[35, 20]], meet: 0.4, carry: [[33, 14]], kickAt: [22.5, 0], power: 1 } ],
  [ { kickAt: [26, 49], power: 0.3 },
    { start: 0, pre: [[26, 49]], spot: 1, first: 1, kickAt: [37, 42], power: 0.35 },
    { start: 0, pre: [[37, 42]], spot: 1, kickAt: [30, 10], power: 1 },
    { start: 105, pre: [[30, 22]], meet: 0.2, carry: [[31, 14]], kickAt: [22.5, 0], power: 1 } ],
  [ { kickAt: [20.5, 50.5], power: 0.35 },
    { start: 0, pre: [[20.5, 50.5]], spot: 1, kickAt: [30.5, 43.5], power: 0.35 },
    { start: 60, pre: [[30.5, 43.5]], spot: 1, grab: 2.5, first: 1, kickAt: [26, 21], power: 0.85 },
    { start: 30, pre: [[20, 31.2]], meet: 0.2, carry: [[20, 14]], kickAt: [27.5, 0], power: 1 } ],
  [ { carry: [[30, 50]], kickAt: [20, 40], power: 0.55 },
    { start: 0, pre: [[20, 40]], spot: 1, carry: [[21, 28]], kickAt: [35, 15], power: 0.8 },
    { start: 150, pre: [[34, 18]], meet: 0.2, carry: [[31, 16]], kickAt: [22.5, 0], power: 1 } ],
  [ { kickAt: [33, 48.5], power: 0.45 },
    { start: 0, pre: [[33, 48.5]], spot: 1, kickAt: [28, 38], power: 0.4 },
    { start: 60, pre: [[28, 38]], spot: 1, grab: 2.5, first: 1, kickAt: [37, 15], power: 0.9 },
    { start: 95, pre: [[38, 21]], meet: 0.3, carry: [[35, 13]], kickAt: [22.5, 0], power: 1 } ]
];

module.exports = { LEVELS, SCRIPTS };

if (require.main === module) {
  const fs = require('fs'), path = require('path'), R = path.join(__dirname, 'root');
  fs.writeFileSync(path.join(R, 'one-man-team/js/levels/pack1.js'), '(function (root) { const L = (root.OMT_LEVELS = root.OMT_LEVELS || []); L.push(...' + JSON.stringify(LEVELS) + '); })(typeof window !== "undefined" ? window : globalThis);\n');
  fs.writeFileSync(path.join(R, 'tools/scripts/pack1.js'), 'module.exports = ' + JSON.stringify(SCRIPTS) + ';\n');
  console.log('wrote root levels and scripts (design order)');
}
