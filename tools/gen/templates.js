// The scenario pool of RULEBOOK.md section 4 as parameterised structures.
//
// Each template is one fixed string of phases (4.1). `build(p)` turns sampled parameters into:
//   att, order          the attackers (canonical side: as in the baseline level; generate.js may mirror x -> 50 - x)
//   def                 the defence by ROLE, not by position: a back line (count, spacing, height, shift), markers (on
//                       whom, how tight), screens (which lane), hunters (on whom, how far). generate.js places them with
//                       the procedure of rulebook 5.2 and runs the role test.
//   plan                one step per round in `order`: how the bot route is built (route.js searches around it)
//   text                brief and tips in the house style ({left}/{right} swap when mirrored)
// An attacker may carry `mirror: { num, name }`: his number and name when the level is mirrored (a left-back becomes
// the right-back). Tips that name him by number use the canonical number only where the template has none to swap.
// `ranges` lists what a generator may vary (rulebook 4.3 "Vary", or my reading of the baseline where 4.3 is silent).
// Coordinates: metres, goal at y 0, attack towards smaller y (rulebook 2.1).
'use strict';

// ---------------------------------------------------------------- plan helpers
// receive: spot = run to `pre` and take it there; chase = run to `pre`, then go for the ball once it is played
const spot = (pre, timing, extra) => Object.assign({ mode: 'spot', pre, timing: timing || 'timed' }, extra || {});
const chaseR = (pre, extra) => Object.assign({ mode: 'chase', pre, timing: 'onside', meet: 0.2 }, extra || {});
const pass = (to, v, extra) => Object.assign({ to, v }, extra || {});
const P = (x, y) => [+x.toFixed(2), +y.toFixed(2)];
const add = (a, dx, dy) => P(a[0] + dx, a[1] + dy);
const xy = a => [a.x, a.y];

// ---------------------------------------------------------------- the pool
const T = [];

// ======================================================== tier 1
T.push({
  id: 'five', name: 'Five-man move', tier: 1, weight: 3, phases: 'E E F O R X', ending: 'run', finisher: 'winger',
  beats: 'a hunter on the centre-back, a screen on the switch lane, a man-marked creator and a holding back four',
  baseline: 19, names: ['Five-man move', 'Five in a row', 'Every man touches it', 'All the way through', 'The long move'],
  ranges: { yL: [24, 30, 0.5], gap: [8, 10, 1], pressD: [7, 10, 0.5], creOn: [8, 10, 0.5], finOn: [3, 6, 0.5], finSide: [12, 18, 0.5], markReact: [14, 22, 2], shift: [-1, 1, 0.5] },
  build(p) {
    const cre = { x: 21.5, y: p.yL + p.creOn }, fin = { x: Math.min(45, cre.x + p.finSide), y: p.yL + p.finOn }, link = { x: 17, y: cre.y + 6 };
    const att = [
      { num: 4, name: 'Centre-back', x: 19, y: 55, role: 'ball' },
      { num: 6, name: 'Pivot', x: 32, y: 51, role: 'ball' },
      { num: 8, name: 'Link', x: link.x, y: link.y, role: 'ball' },
      { num: 10, name: 'Creator', x: cre.x, y: cre.y, role: 'ball' },
      { num: 7, name: 'Winger', x: fin.x, y: fin.y, role: 'ball' }
    ];
    const m6 = [30.5, 52], m8 = add(xy(att[2]), 1, 2), m10 = add(xy(att[3]), 5, 3.8), thr = P(fin.x - 9, p.yL - 5.5);
    return {
      att, order: [0, 1, 2, 3, 4],
      def: { line: { n: 4, spacing: [11, 10, 11], yL: p.yL, shift: p.shift, gap: p.gap },
        marks: [{ on: 3, react: p.markReact }], screens: [{ lane: [1, 4], t: 0.56 }], hunters: [{ on: 0, d: p.pressD, ang: 5 }] },
      plan: [
        { pass: pass(m6, 5) },
        { recv: spot(m6, 'now'), first: 1, pass: pass(m8, 5) },
        { recv: spot(m8), carry: [add(m8, 1.5, -3)], pass: pass(m10, 3) },
        { recv: spot(m10, 'timed', { grab: 2 }), first: 1, pass: pass(thr, 3, { through: 1 }) },
        { recv: spot(add(thr, 0.5, -1.5), 'onside', { grab: 2.5 }), shot: 1 }
      ],
      text: {
        brief: ['Five players, four passes, one finish. Every touch has to fit the ones before it.',
          'Five players. Beat the hunter, find the 10 between the lines, then the 7 in behind.'],
        tips: [
          ['The hunter is coming. Roll it across to the 6 straight away.', 'You are being hunted. Play it short to the 6 at once.'],
          ['Aim early and move it first time, out to the 8 on the {left}.', 'Do not take a touch. Aim early and play it first time to the 8.'],
          ['Take it forward a few yards, then find the 10 as he comes short.', 'Carry it on a few steps, then play it into the 10 as he shows for it.'],
          ['Come off your marker. Aim early and slide it first time in behind for the 7.', 'Lose your marker, aim early and play it first time in behind for the 7.'],
          ['Cut in off the {right} as the 10 plays it. Stay onside, run on and finish.', 'Hold your run until the 10 plays it, then go, run on and finish across the keeper.']
        ]
      },
      runner: 4
    };
  }
});

T.push({
  id: 'trap', name: 'Beat the trap', tier: 1, weight: 3, phases: 'E B F O R X', ending: 'run', finisher: 'striker',
  beats: 'a high back four that steps up on a ball back, with a hunter, a screen and a man-marked creator',
  baseline: 13, names: ['Beat the trap', 'Spring the trap', 'Through the high line', 'Back, then in behind', 'Step up, step in behind'],
  ranges: { yL: [28, 33, 0.5], gap: [8, 9, 1], pressD: [6.5, 9, 0.5], stOn: [6, 9, 0.5], shift: [-2, 2, 0.5] },
  build(p) {
    const lb = { x: 9, y: Math.max(44, p.yL + 12.8) };
    const att = [
      { num: 3, name: 'Left-back', x: lb.x, y: lb.y, role: 'ball', mirror: { num: 2, name: 'Right-back' } },
      { num: 6, name: 'Pivot', x: 23, y: Math.max(51, lb.y + 6), role: 'ball' },
      { num: 10, name: 'Creator', x: 25, y: p.yL + 9, role: 'ball' },
      { num: 9, name: 'Striker', x: 31, y: p.yL + p.stOn, role: 'ball' }
    ];
    const m6 = add(xy(att[1]), 1.5, 0.5), m10 = add(xy(att[2]), 4, 2.5), thr = P(att[3].x - 3, p.yL - 10);
    return {
      att, order: [0, 1, 2, 3],
      def: { line: { n: 4, spacing: [11.5, 11, 11.5], yL: p.yL, shift: p.shift, gap: p.gap },
        marks: [{ on: 2 }], screens: [{ lane: [1, 2], t: 0.7, lat: -3 }], hunters: [{ on: 0, d: p.pressD, ang: 5 }] },
      plan: [
        { carry: [add(xy(att[0]), 1, 1)], pass: pass(m6, 4) },
        { recv: spot(m6, 'now'), carry: [add(m6, 3.5, -2.5)], pass: pass(m10, 3) },
        { recv: spot(m10), first: 1, pass: pass(thr, 3, { through: 1 }), tight: 1 },
        { recv: spot(add(thr, 0.5, -2), 'onside', { grab: 2.5 }), shot: 1 }
      ],
      text: {
        brief: ['Four players. The back line steps up when the ball goes back. Time the last run or you are off.',
          'Four players. Play it back and their high line steps up. Then go in behind it.'],
        tips: [
          ['You are being hunted. Roll it back inside to the 6 before he gets to you.', 'The hunter is on you. Play it back inside to the 6 at once.'],
          ['Step past the screen, then play it firmly into the feet of the 10.', 'Take a touch away from the screen, then find the 10 with a firm pass.'],
          ['Come off your marker to meet it. Aim early and slide it first time between the centre-halves.', 'Show for it away from your marker. Aim early and play it first time in behind.'],
          ['Their line has stepped up. Cross it just as the 10 plays the pass, then run on and finish.', 'Their line steps up on you. Wait, go as the 10 plays it, then run on and finish.']
        ]
      },
      runner: 3
    };
  }
});

T.push({
  id: 'third', name: 'Third-man run', tier: 1, weight: 3, phases: 'E F O(=R) X', ending: 'run', finisher: 'third man',
  beats: 'a back three whose centre-half follows the target man short, behind a screen on the direct lane',
  baseline: 10, names: ['Third-man run', 'The third man', 'Into the hole', 'Up, off and in', 'The run from wide'],
  ranges: { yL: [23, 27, 0.5], tgtOn: [3, 5, 0.5], thirdSide: [12, 18, 0.5], thirdOn: [3, 6, 0.5], markReact: [14, 22, 2], tight: [0.8, 1, 0.1], lineW: [24, 28, 1], shift: [-1, 1, 0.5] },
  build(p) {
    const tgt = { x: 25, y: p.yL + p.tgtOn };
    const att = [
      { num: 5, name: 'Centre-back', x: 20, y: 55, role: 'ball' },
      { num: 6, name: 'Holder', x: 34, y: 46, role: 'ball' },
      { num: 9, name: 'Target man', x: tgt.x, y: tgt.y, role: 'ball' },
      { num: 11, name: 'Third man', x: Math.max(5, tgt.x - p.thirdSide), y: p.yL + p.thirdOn, role: 'ball' }
    ];
    const m6 = [33, 47], m9 = add(xy(att[2]), 5.5, 8), thr = P(tgt.x - 5, p.yL - 5);
    return {
      att, order: [0, 1, 2, 3],
      def: { line: { n: 2, width: p.lineW, yL: p.yL, shift: p.shift }, marks: [{ on: 2, react: p.markReact, tight: p.tight, eng: 6, inLine: 1 }],
        screens: [{ lane: [0, 2], t: 0.52, lat: -2.5 }], hunters: [] },
      plan: [
        { pass: pass(m6, 5) },
        { recv: spot(m6, 'now'), carry: [add(m6, 1, -2)], pass: pass(m9, 5) },
        { recv: spot(m9), first: 1, pass: pass(thr, 3, { through: 1 }) },
        { recv: spot(add(thr, 0, 1), 'onside'), shot: 1 }
      ],
      text: {
        brief: ['Four players. The 9 comes short and drags his centre-half out. The 11 runs into the hole.',
          'Four players. Up to the 9, who comes short. His centre-half follows, and the 11 runs in behind.'],
        tips: [
          ['The screen blocks the straight pass. Roll it across to the 6 on your {right}.', 'Do not play through the screen. Find the 6 on your {right}.'],
          ['Take it and play it firmly into the 9 as he comes short.', 'One touch to set it, then a firm pass into the 9 as he shows.'],
          ['Come short so the centre-half follows. Aim early and flick it first time into the hole.', 'Drop towards the ball and take your man with you. Aim early, play it first time into the hole.'],
          ['Go early. Run inside before the 9 touches it, take it in the hole he left and finish.', 'Start your run before the 9 gets it. Stay onside, take it in the hole and finish.']
        ]
      },
      runner: 3
    };
  }
});

T.push({
  id: 'switch', name: 'Switch of play', tier: 1, weight: 3, phases: 'E S X', ending: 'run', finisher: 'winger',
  beats: 'a block that has slid across to the ball side, with a hunter on the full-back and a screen',
  baseline: 5, names: ['Switch of play', 'Change the point', 'Far side', 'Switch it', 'Over to the far side'],
  ranges: { yL: [25, 29, 0.5], nLine: [3, 3, 1], shift: [5, 8, 0.5], winX: [5, 10, 0.5], winOn: [2, 5, 0.5], pressD: [7, 9, 0.5], pressD2: [7, 8.5, 0.5], pivFront: [15, 18, 0.5] },
  build(p) {
    const att = [
      { num: 2, name: 'Right-back', x: 41, y: 45, role: 'ball', mirror: { num: 3, name: 'Left-back' } },
      { num: 6, name: 'Pivot', x: 27, y: Math.min(52, p.yL + p.pivFront), role: 'ball' },
      { num: 11, name: 'Winger', x: p.winX, y: p.yL + p.winOn, role: 'ball' }
    ];
    const m6 = add(xy(att[1]), 1, 1), thr = P(p.winX - 1, p.yL - 8);
    const n = p.nLine;
    return {
      att, order: [0, 1, 2],
      def: { line: { n, spacing: n === 3 ? [9, 9] : [9, 9.5, 9], yL: p.yL, shift: p.shift }, marks: [], screens: [{ lane: [0, 2], t: 0.36, lat: 3.5 }], hunters: [{ on: 0, d: p.pressD, ang: -10 }, { on: 1, d: p.pressD2, ang: -5 }] },
      plan: [
        { pass: pass(m6, 5) },
        { recv: spot(m6, 'now'), first: 1, pass: pass(thr, 3, { through: 1 }) },
        { recv: spot(add(thr, 1, 1), 'onside'), shot: 1 }
      ],
      text: {
        brief: ['Three players. They are packed on the {right}, so move it to the far side quickly.',
          'Three players. Their block has slid across to the ball. Switch it behind them on the far side.'],
        tips: [
          ['You are crowded out. Roll it inside to the 6 before the press reaches you.', 'The hunter is closing. Play it inside to the 6 at once.'],
          ['Do not dwell on it. Hit the diagonal early, behind their back line on the far side.', 'Aim early and switch it first time, in behind them on the far side.'],
          ['Wait for the switch. Go as the 6 plays it, drive into the box and shoot across the keeper.', 'Stay onside on the far side. Go as the 6 hits it, run on and finish across the keeper.']
        ]
      },
      runner: 2
    };
  }
});

T.push({
  id: 'bend', name: 'Bend the run', tier: 1, weight: 3, phases: 'E E F O R X', ending: 'run', finisher: 'winger',
  beats: 'a high, held back four: a straight run is offside, so the winger runs along the line and bends in behind',
  baseline: 'set D C2', names: ['Bend the run', 'Along the line', 'Curve it in behind', 'Bend round them', 'Run the line'],
  ranges: { yL: [28, 32, 0.5], gap: [8, 9, 1], pressD: [7.5, 9.5, 0.5], winX: [5, 9, 0.5], winOn: [3, 4, 0.5], markReact: [14, 22, 2], shift: [-2, 2, 0.5] },
  build(p) {
    const att = [
      { num: 4, name: 'Centre-back', x: 30, y: 54, role: 'ball' },
      { num: 6, name: 'Pivot', x: 20, y: 50, role: 'ball' },
      { num: 10, name: 'Number ten', x: 27, y: p.yL + 11, role: 'ball' },
      { num: 11, name: 'Left winger', x: p.winX, y: p.yL + p.winOn, role: 'ball', mirror: { num: 7, name: 'Right winger' } }
    ];
    const m6 = [20.5, 50.5], m10 = add(xy(att[2]), 3.5, 2.5), thr = P(26, p.yL - 9);
    return {
      att, order: [0, 1, 2, 3],
      def: { line: { n: 4, spacing: [10, 10, 10], yL: p.yL, shift: p.shift, gap: p.gap }, marks: [{ on: 2, react: p.markReact }], screens: [{ lane: [0, 3], t: 0.55 }], hunters: [{ on: 0, d: p.pressD, ang: 50 }] },
      plan: [
        { pass: pass(m6, 5) },
        { recv: spot(m6, 'now'), pass: pass(m10, 4) },
        { recv: spot(m10, 'timed', { grab: 2.5 }), first: 1, pass: pass(thr, 3, { through: 1 }), tight: 1 },
        { recv: chaseR(P(20, p.yL + 1.2)), shot: 1 }
      ],
      text: {
        brief: ['Four players. Their high line holds. The 11 runs along it to stay onside, then bends in behind.',
          'Four players. A straight run is offside against this high line. Run across it, then bend in behind.'],
        tips: [
          ['The hunter is coming. Roll it across to the 6 on your {left} at once.', 'You are being hunted. Play it short to the 6 straight away.'],
          ['The screen blocks the wide ball. Play it across into the 10 as he comes off his marker.', 'Not out wide: the screen is there. Find the 10 as he shows for it.'],
          ['Come off your marker to meet it. Aim early and slide it first time between the centre-halves.', 'Show away from your marker. Aim early and play it first time in behind.'],
          ['Run across along their line to stay onside. Bend in behind as the 10 plays it, and finish.', 'Do not run straight: you will be off. Run along the line, bend in as the 10 plays it, finish.']
        ]
      },
      runner: 3
    };
  }
});

// ======================================================== tier 2
T.push({
  id: 'diagonal', name: 'Diagonal in behind', tier: 2, weight: 2, phases: 'E F S X', ending: 'run', finisher: 'inside forward', hardOnly: true, squeezed: true,
  beats: 'a back four squeezed across to the ball side, with a hunter on the centre-back and a screen in front of the playmaker',
  baseline: 9, names: ['Diagonal in behind', 'The long diagonal', 'Behind the far full-back', 'Over the top', 'Hit the far man'],
  ranges: { yL: [25.5, 27.5, 0.5], pressD: [7.5, 8.5, 0.5], shift: [-8, -8, 0.5], finX: [40, 42, 0.5], finOn: [2, 3, 0.5] },
  build(p) {
    const att = [
      { num: 4, name: 'Centre-back', x: 30, y: 54, role: 'ball' },
      { num: 8, name: 'Playmaker', x: 15, y: Math.max(44, p.yL + 17), role: 'ball' },
      { num: 7, name: 'Inside forward', x: p.finX, y: p.yL + p.finOn, role: 'ball' }
    ];
    const m8 = [16, att[1].y + 1], thr = P(p.finX + 2, p.yL - 9);
    return {
      att, order: [0, 1, 2],
      def: { line: { n: 4, spacing: [8, 8, 8], yL: p.yL, shift: p.shift, squeezed: 1 }, marks: [], screens: [{ lane: [1, 2], t: 0.12, lat: -4.8 }], hunters: [{ on: 0, d: p.pressD, ang: 5 }] },
      plan: [
        { pass: pass(m8, 5) },
        { recv: spot(m8, 'now'), carry: [add(m8, 3, -1.5)], pass: pass(thr, 6, { through: 1 }) },
        { recv: spot(add(thr, -1, 0), 'onside'), shot: 1 }
      ],
      text: {
        brief: ['Three players. They have squeezed across to the ball. Hit a diagonal behind the far full-back.',
          'Three players. Their back four has shifted over. Find the far man in behind with one long ball.'],
        tips: [
          ['Step out and find the 8 on your {left} before the press gets to you.', 'The hunter is coming. Play it to the 8 on your {left} at once.'],
          ['One touch inside, then hit the diagonal behind the back line before you are closed down.', 'Take one touch away from the screen and hit the long diagonal early.'],
          ['Stay level with the last man until the diagonal is hit, then cut in behind and finish.', 'Wait on their line. Go as the 8 hits it, then run on and finish across the keeper.']
        ]
      },
      runner: 2
    };
  }
});

T.push({
  id: 'press', name: 'Play through the press', tier: 2, weight: 2, phases: 'E E(first time) C R X', ending: 'run', finisher: 'striker',
  beats: 'two hunters closing the first two passes, then a back four with nobody in front of it',
  baseline: 15, names: ['Play through the press', 'Beat the press', 'Out from the back', 'Through the first line', 'Past the hunters'],
  ranges: { yL: [25, 29, 0.5], pressD1: [8, 10, 0.5], pressD2: [7, 9, 0.5], stX: [26, 31, 0.5], stOn: [2, 5, 0.5], shift: [-2, 2, 0.5] },
  build(p) {
    const att = [
      { num: 4, name: 'Centre-back', x: 19, y: 55, role: 'ball' },
      { num: 6, name: 'Pivot', x: 32, y: 51, role: 'ball' },
      { num: 8, name: 'Link', x: 17, y: Math.min(46, p.yL + 15), role: 'ball' },
      { num: 9, name: 'Striker', x: p.stX, y: p.yL + p.stOn, role: 'ball' }
    ];
    const m6 = [30.5, 52], m8 = add(xy(att[2]), 1, 2), thr = P(p.stX - 4, p.yL - 8);
    return {
      att, order: [0, 1, 2, 3],
      def: { line: { n: 4, spacing: [11, 10, 11], yL: p.yL, shift: p.shift }, marks: [], screens: [], hunters: [{ on: 0, d: p.pressD1, ang: 0 }, { on: 1, d: p.pressD2, ang: 34 }] },
      plan: [
        { pass: pass(m6, 5) },
        { recv: spot(m6, 'now'), first: 1, pass: pass(m8, 5) },
        { recv: spot(m8), carry: [P(20, p.yL + 10)], pass: pass(thr, 3, { through: 1 }), tight: 1 },
        { recv: spot(add(thr, -0.3, 1.5), 'onside', { grab: 2.5 }), shot: 1 }
      ],
      text: {
        brief: ['Four players. Two hunters close the first two passes. Move it before they arrive, then break.',
          'Four players. Beat two hunters with quick passes, then run at their back four and slide the 9 in.'],
        tips: [
          ['The first hunter is on his way. Roll it across to the 6 at once.', 'You are being hunted. Play it short to the 6 straight away.'],
          ['The second hunter wants you. Aim early and move it first time to the 8.', 'No time on the ball. Aim early and play it first time to the 8.'],
          ['You are past the press. Drive at the back line and slide the 9 through.', 'Run at their back four, then slip the 9 in behind them.'],
          ['Stay level with the last man until the 8 plays it, then run on and finish.', 'Hold your run on their line. Go as the 8 plays it, then finish across the keeper.']
        ]
      },
      runner: 3
    };
  }
});

T.push({
  id: 'counter', name: 'The counter', tier: 2, weight: 2, phases: 'E C R X', ending: 'run', finisher: 'winger', counter: true,
  beats: 'a team caught upfield: two hunters and only two centre-halves back',
  baseline: 11, names: ['The counter', 'Break at speed', 'Two at the back', 'Catch them upfield', 'On the break'],
  ranges: { yL: [25, 29, 0.5], pressD1: [7, 9, 0.5], pressD2: [8.5, 11, 0.5], winX: [38, 43, 0.5], lineW: [9, 11, 0.5], shift: [-1, 1, 0.5] },
  build(p) {
    const att = [
      { num: 6, name: 'Ball-winner', x: 20, y: 53, role: 'ball' },
      { num: 10, name: 'Carrier', x: 26, y: p.yL + 15, role: 'ball' },
      { num: 7, name: 'Winger', x: p.winX, y: p.yL + 14, role: 'ball' }
    ];
    const m10 = add(xy(att[1]), 0, 1), thr = P(p.winX - 4, p.yL - 13);
    return {
      att, order: [0, 1, 2],
      def: { line: { n: 2, spacing: [p.lineW], yL: p.yL, shift: p.shift }, marks: [], screens: [], hunters: [{ on: 0, d: p.pressD1, ang: -60 }, { on: 1, d: p.pressD2, behind: 1 }] },
      plan: [
        { pass: pass(m10, 5) },
        { recv: spot(m10, 'now'), carry: [P(28, p.yL + 3)], pass: pass(thr, 3, { through: 1 }), tight: 1 },
        { recv: spot(add(thr, 0, 2), 'onside'), shot: 1 }
      ],
      text: {
        brief: ['Three players. They are caught upfield with two men back. Break before the rest recover.',
          'Three players on the break against two centre-halves. Commit one, then slip the 7 in.'],
        tips: [
          ['You have just won it. Play it forward to the 10 at once, before the press reaches you.', 'Two hunters are closing. Find the 10 straight away.'],
          ['Drive at the two centre-halves. When one steps out to you, slip the 7 in on your {right}.', 'Run at them. When a centre-half commits to you, play the 7 in behind.'],
          ['Sprint to stay level with the 10, take his pass beyond the last man and finish.', 'Keep level with their line, go as the 10 plays it, then finish across the keeper.']
        ]
      },
      runner: 2
    };
  }
});

T.push({
  id: 'falsenine', name: 'False nine', tier: 2, weight: 1, phases: 'E decoy O R X', ending: 'run', finisher: 'runner', decoy: true,
  beats: 'a back three whose centre-half follows a dropping 9, with a screen and a marker on the playmaker',
  baseline: 18, names: ['False nine', 'The dropping nine', 'Empty the middle', 'Pull the centre-half', 'The nine drops off'],
  ranges: { yL: [25, 29, 0.5], drop: [8, 10, 0.5], runX: [10, 14, 0.5], runOn: [2.5, 4.5, 0.5], lineW: [24, 25, 1], shift: [-1, 1, 0.5] },
  build(p) {
    const f9 = { x: 22.5, y: p.yL + 2.5 };
    const att = [
      { num: 5, name: 'Centre-back', x: 31, y: 55, role: 'ball' },
      { num: 9, name: 'False nine', x: f9.x, y: f9.y, role: 'decoy' },
      { num: 8, name: 'Playmaker', x: 16, y: 47, role: 'ball' },
      { num: 11, name: 'Runner', x: p.runX, y: p.yL + p.runOn, role: 'ball' }
    ];
    const drop = [0.35, 0.94], dv = P(f9.x + drop[0] * p.drop, f9.y + drop[1] * p.drop);
    const m8 = [17.5, 49], thr = P(24, p.yL - 9);
    return {
      att, order: [0, 1, 2, 3],
      def: { line: { n: 2, width: p.lineW, yL: p.yL, shift: p.shift }, marks: [{ on: 1, inLine: 1 }, { on: 2 }], screens: [{ lane: [0, 3], t: 0.3, lat: 4 }], hunters: [] },
      plan: [
        { carry: [P(33, 52), P(29, 52.5)], pass: pass(m8, 5) },
        { decoy: [dv] },
        { recv: spot(m8), first: 1, pass: pass(thr, 3, { through: 1 }), viaDecoy: 1 },
        { recv: spot(add(thr, -0.7, 2), 'onside', { grab: 2.5 }), shot: 1 }
      ],
      decoyRun: p.drop,
      text: {
        brief: ['Four players. The 9 drops deep and his centre-half follows. The 11 runs into the hole he leaves.',
          'Four players. Your 9 drops off and takes his centre-half with him. The 11 attacks the gap.'],
        tips: [
          ['Start it. Roll it across to the 8 on your {left}.', 'Play it short to the 8 on your {left}.'],
          ['No ball for you. Drop about ten metres deep so your marker comes too. Any further and he lets you go. Then DONE.', 'No ball for you. Come short about ten metres and take your marker with you. Then press DONE.'],
          ['Aim early. As it arrives, hit it first time through the hole the 9 has left.', 'Aim before it arrives and play it first time into the gap the 9 left.'],
          ['Run off the {left} into the hole the 9 left. Go as the 8 plays it, and finish.', 'Wait on their line, go as the 8 plays it, then run into the hole and finish.']
        ]
      },
      runner: 3
    };
  }
});

T.push({
  id: 'cutback', name: 'Wing and cut-back', tier: 2, weight: 2, phases: 'E (decoy) R K', ending: 'cutback', finisher: 'late runner', optionalDecoy: true,
  beats: 'a back four whose full-back stands wide: the winger gets in behind through the channel inside him, reaches the byline and pulls it back to the penalty spot the retreating line leaves',
  baseline: '3, 7', names: ['Wing and cut-back', 'To the byline', 'Pull it back', 'The cut-back', 'Round the back'],
  ranges: { yL: [21, 25, 0.5], pressD: [7, 9, 0.5], winOn: [2.5, 4, 0.5], tenOn: [11, 14, 0.5], fbWide: [11, 11.5, 0.5], decoy: [0, 1, 1], shift: [0, 1, 0.5], spotPt: [0, 2, 1], bylinePt: [0, 2, 1] },
  build(p) {
    const hasDecoy = p.decoy === 1;
    const att = [
      { num: 6, name: 'Pivot', x: 18, y: 51, role: 'ball' },
      { num: 8, name: 'Midfielder', x: 31, y: p.yL + p.tenOn, role: 'ball' },
      { num: 7, name: 'Winger', x: 44, y: p.yL + p.winOn, role: 'ball' },
      { num: 10, name: 'Late runner', x: 22, y: p.yL + 11, role: 'ball' }
    ];
    if (hasDecoy) att.push({ num: 9, name: 'Centre-forward', x: 25, y: p.yL + 3, role: 'decoy' });
    // where he pulls it back to (11-14 m out, rulebook K) and where he cuts it back from
    const k = [P(30, 14), P(28.5, 13), P(31, 15.5)][p.spotPt], byl = [P(45, 9), P(44, 7), P(44.5, 11)][p.bylinePt];
    const m8 = add(xy(att[1]), 1, 2.5), thr = P(38.5, p.yL - 7);
    const plan = [
      { pass: pass(m8, 5) },
      { recv: spot(m8), first: 1, pass: pass(thr, 3, { through: 1 }), tight: 1 }
    ];
    const order = [0, 1];
    if (hasDecoy) { order.splice(1, 0, 4); plan.splice(1, 0, { decoy: [P(30, p.yL - 4.5)] }); }
    order.push(2, 3);
    plan.push({ recv: chaseR(P(40, p.yL - 3), { meet: 0.3 }), carry: [P(43.5, Math.max(12, byl[1] + 4)), byl], pass: pass(k, 4) });
    plan.push({ recv: spot(k, 'timed', { grab: 2.5 }), first: 1, shot: 1 });
    const tips = [
      ['The hunter is coming. Play it across to the 8 at once.', 'You are being hunted. Find the 8 on your {right} straight away.'],
      ['Aim early and slide it first time inside their full-back for the 7.', 'Do not take a touch. Aim early and play it first time into the channel for the 7.'],
      ['Dart inside the full-back as the 8 plays it, reach the byline and pull it back to the spot.', 'Hold your width, go as the 8 plays it, get to the byline and cut it back to the penalty spot.'],
      ['Arrive late on the penalty spot. Aim before the ball comes and hit it first time.', 'Do not get there early. Meet the cut-back on the spot and hit it first time.']
    ];
    if (hasDecoy) tips.push(['No ball for you. Run at the near post so your marker goes with you, then press DONE.', 'No ball for you. Take your marker towards the near post, then press DONE.']);
    return {
      att, order,
      def: { line: { n: 4, spacing: [9, 9, p.fbWide], yL: p.yL, shift: p.shift }, marks: hasDecoy ? [{ on: 4 }] : [{ on: 1 }], screens: [{ lane: [0, 1], t: 0.5, lat: -2.5 }], hunters: [{ on: 0, d: p.pressD, ang: -37 }] },
      plan, decoyRun: hasDecoy ? Math.hypot(5, 7.5) : 0,
      text: {
        brief: hasDecoy ? ['Four players and a decoy. In behind, to the byline, and back to the spot the 9 has cleared.', 'Four players and a decoy. The 9 takes his man to the near post; cut it back behind him.']
          : ['Four players. Get the 7 in behind, to the byline, and pull it back to the penalty spot.', 'Four players. In behind inside the full-back, then cut it back for the late runner.'],
        tips
      },
      runner: hasDecoy ? 3 : 2, cutback: true
    };
  }
});

T.push({
  id: 'sweeper', name: 'Sweeper-keeper', tier: 2, weight: 1, phases: 'E F C R X', ending: 'run', finisher: 'striker', sweeper: true,
  beats: 'a high back four with a keeper who sweeps anything played into the box',
  baseline: 16, names: ['Sweeper-keeper', 'Keeper off his line', 'Short, not long', 'Under the sweeper', 'Nothing over the top'],
  ranges: { yL: [28, 31, 0.5], gap: [8, 9, 1], winY: [44, 47, 0.5], creOn: [7, 9, 0.5], stOn: [2, 3.5, 0.5], shift: [-1, 1, 0.5] },
  build(p) {
    const att = [
      { num: 4, name: 'Centre-back', x: 20, y: 55, role: 'ball' },
      { num: 7, name: 'Winger', x: 42, y: p.winY, role: 'ball' },
      { num: 10, name: 'Creator', x: 31, y: p.yL + p.creOn, role: 'ball' },
      { num: 9, name: 'Striker', x: 21, y: p.yL + p.stOn, role: 'ball' }
    ];
    const m7 = add(xy(att[1]), -1, 1), m10 = add(xy(att[2]), 1, 3), thr = P(24, p.yL - 7);
    return {
      att, order: [0, 1, 2, 3],
      def: { line: { n: 4, spacing: [10, 10, 10], yL: p.yL, shift: p.shift, gap: p.gap }, marks: [{ on: 1 }], screens: [{ lane: [0, 2], t: 0.55 }], hunters: [] },
      gk: { sweeper: true },
      plan: [
        { carry: [P(22, 54)], pass: pass(m7, 5) },
        { recv: spot(m7, 'timed'), first: 1, pass: pass(m10, 3) },
        { recv: spot(m10), carry: [add(m10, -2, -5)], pass: pass(thr, 2, { through: 1 }), tight: 1 },
        { recv: spot(add(thr, 0, -0.5), 'onside', { grab: 2.5 }), shot: 1 }
      ],
      text: {
        brief: ['Four players. Their keeper sweeps up anything long. Get close, then slip one short pass in.',
          'Four players. A high line and a keeper off his line. Play short in behind, never long.'],
        tips: [
          ['Nothing over the top: the keeper is waiting for it. Find the 7 out wide.', 'The keeper sweeps anything long. Play it out to the 7 on your {right}.'],
          ['Come to the ball, then play it inside to the 10 before the full-back closes.', 'Aim early and play it inside first time to the 10.'],
          ['Carry it at the back line, then roll a short pass in behind. Hit it long and it is gone.', 'Run at their line, then play a short ball in behind. Not too hard: the keeper is out.'],
          ['Dart across the centre-half as the 10 plays it. Beat the keeper to it and finish.', 'Stay onside, go as the 10 plays it, take it before the keeper and finish.']
        ]
      },
      runner: 3
    };
  }
});

T.push({
  id: 'upback', name: 'Up, back and through', tier: 2, weight: 2, phases: 'E F O B R X', ending: 'run', finisher: 'winger',
  beats: 'a back four that steps up on the set-back, a screen on the lane to the 10 and a marker on the 9',
  baseline: 'set D A4', names: ['Up, back and through', 'Up, back, through', 'The set-back', 'Bounce it off the 9', 'Lay it back, then in'],
  ranges: { yL: [27.5, 30, 0.5], gap: [9, 9, 1], pressD: [7.5, 9.5, 0.5], tgtOn: [4, 6, 0.5], winOn: [2.5, 4, 0.5], markReact: [16, 22, 2], shift: [-2, 2, 0.5] },
  build(p) {
    const att = [
      { num: 6, name: 'Pivot', x: 22, y: 51, role: 'ball' },
      { num: 9, name: 'Target man', x: 25, y: p.yL + p.tgtOn, role: 'ball' },
      { num: 10, name: 'Number ten', x: 31, y: 45, role: 'ball' },
      { num: 7, name: 'Winger', x: 40, y: p.yL + p.winOn, role: 'ball' }
    ];
    const m9 = add(xy(att[1]), 0, 2), m10 = add(xy(att[2]), -0.5, -2.5), thr = P(35, p.yL - 9);
    return {
      att, order: [0, 1, 2, 3],
      def: { line: { n: 4, spacing: [10, 10, 10], yL: p.yL, shift: p.shift, gap: p.gap }, marks: [{ on: 1, react: p.markReact }], screens: [{ lane: [0, 3], t: 0.3 }], hunters: [{ on: 0, d: p.pressD, ang: -39 }] },
      plan: [
        { carry: [P(21, 50)], pass: pass(m9, 6) },
        { recv: spot(m9, 'now', { grab: 2.5 }), first: 1, pass: pass(m10, 3) },
        { recv: spot(m10), first: 1, pass: pass(thr, 3, { through: 1 }), tight: 1 },
        { recv: chaseR(P(36, p.yL + 1), { meet: 0.4 }), shot: 1 }
      ],
      text: {
        brief: ['Four players. Up to the 9, back to the 10, then through. Their line steps up on the ball back.',
          'Four players. Fire it up to the 9, he sets it back, and the 10 plays the 7 in behind.'],
        tips: [
          ['The hunter is on you and the screen blocks the 10. Fire it up to the feet of the 9.', 'You are being hunted. Play it up to the 9, not to the 10.'],
          ['Come short with your marker on your back. Aim early and set it back first time to the 10.', 'Your marker is tight. Aim early and lay it back first time to the 10.'],
          ['Meet the set-back. Aim early and thread it first time between their right-back and centre-half.', 'Aim early and play it first time in behind their line for the 7.'],
          ['Their line steps up on the ball back. Cross it as the 10 plays it, run on and finish across the keeper.', 'Wait on their line as it steps up. Go as the 10 plays it, then finish.']
        ]
      },
      runner: 3
    };
  }
});

T.push({
  id: 'shortlong', name: 'Short then long', tier: 2, weight: 2, phases: 'E E F R X', ending: 'run', finisher: 'striker', markFinisher: true,
  beats: 'two hunters, a screen and a tight man-marker on the 9 in front of a back three: the 9 comes short, then spins',
  baseline: 'set D A7', names: ['Short then long', 'Come short, go long', 'Spin in behind', 'The double movement', 'Check and spin'],
  ranges: { yL: [24, 27, 0.5], gap: [9, 9, 1], pressD1: [6.5, 8.5, 0.5], pressD2: [8, 10, 0.5], stOn: [6.5, 7.5, 0.5], markReact: [20, 26, 2], shift: [-1, 1, 0.5] },
  build(p) {
    const att = [
      { num: 4, name: 'Centre-back', x: 14, y: 52, role: 'ball' },
      { num: 6, name: 'Pivot', x: 26, y: 49, role: 'ball' },
      { num: 8, name: 'Playmaker', x: 37, y: 42, role: 'ball' },
      { num: 9, name: 'Striker', x: 25, y: p.yL + p.stOn, role: 'ball' }
    ];
    const thr = P(30, p.yL - 7);
    return {
      att, order: [0, 1, 2, 3],
      def: { line: { n: 3, spacing: [10.5, 10.5], yL: p.yL, shift: p.shift, gap: p.gap }, marks: [{ on: 3, react: p.markReact, tight: 1.2 }], screens: [{ lane: [2, 3], t: 0.55 }], hunters: [{ on: 0, d: p.pressD1, ang: 36 }, { on: 2, d: p.pressD2, ang: 57 }] },
      plan: [
        { pass: pass([26, 49], 5) },
        { recv: spot([26, 49], 'now'), first: 1, pass: pass([37, 42], 5) },
        { recv: spot([37, 42], 'now'), pass: pass(thr, 3, { through: 1 }), tight: 1 },
        { recv: chaseR(P(30, p.yL - 3.5)), shot: 1 }
      ],
      text: {
        brief: ['Four players. The 9 comes short to pull his marker up the pitch, then spins in behind him.',
          'Four players. Short, short, then long: the 9 drags his marker towards the ball and spins away.'],
        tips: [
          ['The hunter is coming. Roll it across to the 6 at once.', 'You are being hunted. Play it short to the 6 straight away.'],
          ['Aim early and move it on first time, out to the 8 on your {right}.', 'Do not take a touch. Aim early and play it first time to the 8.'],
          ['Another hunter is closing. Take it and play it early, in behind their middle, for the 9 to run on to.', 'A second hunter is coming. Play it early in behind for the 9.'],
          ['Come short so your marker follows. Spin in behind just before the 8 plays it, then finish across the keeper.', 'Check towards the ball, then spin in behind as the 8 plays it, and finish.']
        ]
      },
      runner: 3
    };
  }
});

T.push({
  id: 'commit', name: 'Commit the centre-half', tier: 2, weight: 2, phases: 'E F C R X', ending: 'run', finisher: 'striker',
  beats: 'a back four whose centre-half has to step out to a runner, with a hunter and a screen in front',
  baseline: 'set D C6', names: ['Commit the centre-half', 'Draw him out', 'Run at him', 'Make him step out', 'Take on the line'],
  ranges: { yL: [25, 28, 0.5], gap: [8, 8, 1], pressD: [7.5, 9.5, 0.5], tenOn: [12, 14, 0.5], stOn: [2, 4, 0.5], shift: [-2, 2, 0.5] },
  build(p) {
    const att = [
      { num: 6, name: 'Holder', x: 30, y: 52, role: 'ball' },
      { num: 10, name: 'Number ten', x: 20, y: p.yL + p.tenOn, role: 'ball' },
      { num: 9, name: 'Striker', x: 31, y: p.yL + p.stOn, role: 'ball' }
    ];
    const m10 = xy(att[1]), thr = P(34, p.yL - 9);
    return {
      att, order: [0, 1, 2],
      def: { line: { n: 4, spacing: [10, 10, 10], yL: p.yL, shift: p.shift, gap: p.gap }, marks: [], screens: [{ lane: [0, 1], t: 0.62, lat: 2.5 }], hunters: [{ on: 0, d: p.pressD, ang: 50 }] },
      plan: [
        { carry: [P(30, 50)], pass: pass(m10, 5) },
        { recv: spot(m10, 'now'), carry: [P(21, p.yL + 2)], pass: pass(thr, 3, { through: 1 }), tight: 1 },
        { recv: chaseR(P(33, p.yL - 4)), shot: 1 }
      ],
      text: {
        brief: ['Three players. Run at a centre-half until he steps out to you, then slip the 9 in behind before he tackles.',
          'Three players. Drive at their back four. When a centre-half commits, play the 9 in behind him.'],
        tips: [
          ['The hunter is coming. Play it into the 10 between the lines, away from the screen.', 'You are being hunted. Find the 10 between the lines, round the screen.'],
          ['Drive at the {left} centre-half. When he steps out to you, slip the 9 in on your {right} before he tackles.', 'Run at their line. Wait until a centre-half commits, then play the 9 in before the tackle.'],
          ['Hold your run on their line. Go in behind as the centre-half steps out to the 10, then finish.', 'Stay onside. Go as the 10 plays it, then run on and finish across the keeper.']
        ]
      },
      runner: 2
    };
  }
});

T.push({
  id: 'inside', name: 'Ball inside the full-back', tier: 2, weight: 2, phases: 'E F O R X', ending: 'run', finisher: 'winger',
  beats: 'a compact back four whose full-back stands wide to watch the winger, leaving one seam inside him',
  baseline: 'set D B4', names: ['Ball inside the full-back', 'Inside the full-back', 'The seam', 'Between full-back and centre-half', 'Dart inside'],
  ranges: { yL: [23, 27, 0.5], pressD: [7, 9, 0.5], tenOn: [9, 11, 0.5], winOn: [2.5, 4, 0.5], fbWide: [11, 11.5, 0.5], shift: [-1, 1, 0.5] },
  build(p) {
    const att = [
      { num: 6, name: 'Pivot', x: 18, y: 51, role: 'ball' },
      { num: 8, name: 'Midfielder', x: 34, y: 47, role: 'ball' },
      { num: 10, name: 'Number ten', x: 26, y: p.yL + p.tenOn, role: 'ball' },
      { num: 7, name: 'Winger', x: 44, y: p.yL + p.winOn, role: 'ball' }
    ];
    const m8 = [33, 48.5], m10 = add(xy(att[2]), 2, 3), thr = P(37, p.yL - 6);
    return {
      att, order: [0, 1, 2, 3],
      def: { line: { n: 4, spacing: [9, 9, p.fbWide], yL: p.yL, shift: p.shift }, marks: [{ on: 2 }], screens: [{ lane: [0, 2], t: 0.5, lat: 0 }], hunters: [{ on: 0, d: p.pressD, ang: -37 }] },
      plan: [
        { pass: pass(m8, 5) },
        { recv: spot(m8, 'now'), pass: pass(m10, 4) },
        { recv: spot(m10, 'timed', { grab: 2.5 }), first: 1, pass: pass(thr, 3, { through: 1 }) },
        { recv: chaseR(P(38.5, p.yL - 3), { meet: 0.3 }), shot: 1 }
      ],
      text: {
        brief: ['Four players. Their full-back is wide to watch the winger. Slide it inside him for the 7 to run on to.',
          'Four players. One seam in their back four: between the full-back and the centre-half.'],
        tips: [
          ['The hunter is coming. Roll it across to the 8 on your {right}.', 'You are being hunted. Play it short to the 8 at once.'],
          ['Do not dwell: the screen steps across. Play it at once into the 10 as he comes off his marker.', 'No time to wait. Find the 10 as he shows away from his marker.'],
          ['Come off your marker. Aim early and slide it first time inside the full-back.', 'Aim early and play it first time into the seam inside their full-back.'],
          ['Hold your width on their line. Dart inside the full-back just as the 10 plays it, then finish.', 'Stay wide and onside. Go as the 10 plays it, inside the full-back, then finish.']
        ]
      },
      runner: 3
    };
  }
});

// ======================================================== tutorial (fixtures 1-4 only; one idea each, 1-2 defenders)
T.push({
  id: 'u-first', name: 'First pass', tier: 0, weight: 1, tutorial: 1, phases: 'F X', ending: 'run', finisher: 'striker',
  beats: 'nobody: one screen out of the way. Teaches pass and run', names: ['First pass', 'Pass and score'],
  ranges: { pmY: [46, 50, 0.5], stX: [23, 27, 0.5], stY: [26, 29, 0.5], zX: [12, 15, 0.5] },
  build(p) {
    const att = [{ num: 8, name: 'Playmaker', x: 25, y: p.pmY, role: 'ball' }, { num: 9, name: 'Striker', x: p.stX, y: p.stY, role: 'ball' }];
    const thr = P(p.stX, 15);
    return {
      att, order: [0, 1],
      def: { line: null, marks: [], screens: [], hunters: [], extra: [{ t: 'zone', x: p.zX, y: 23, eng: 4, leash: 6 }] },
      gk: { react: 22 },
      plan: [{ pass: pass(thr, 2, { through: 1 }) }, { recv: spot(thr, 'timed', { grab: 2.2 }), shot: 1 }],
      text: { brief: ['Pass it forward, then be the striker who runs onto it.'], tips: [['Pass it into the space in front of the 9.'], ['Run onto your own pass and score.']] },
      runner: 1
    };
  }
});
T.push({
  id: 'u-through', name: 'Through ball', tier: 0, weight: 1, tutorial: 1, phases: 'R X', ending: 'run', finisher: 'striker',
  beats: 'a two-man line that holds: teaches the offside line', names: ['Through ball', 'Between the two'],
  ranges: { yL: [24, 26, 0.5], w: [10, 11.5, 0.5], stOn: [2, 3, 0.5] },
  build(p) {
    const att = [{ num: 8, name: 'Playmaker', x: 25, y: 48, role: 'ball' }, { num: 9, name: 'Striker', x: 25, y: p.yL + p.stOn, role: 'ball' }];
    const thr = P(25, p.yL - 12);
    return {
      att, order: [0, 1],
      def: { line: { n: 2, spacing: [p.w], yL: p.yL, shift: 0 }, marks: [], screens: [], hunters: [] },
      gk: { react: 18 },
      plan: [{ carry: [P(25, 44)], pass: pass(thr, 2, { through: 1 }) }, { recv: spot(add(thr, 0, 1), 'onside', { grab: 2.2 }), shot: 1 }],
      text: { brief: ['Two defenders hold a line. Go beyond it only once the pass is on its way.'], tips: [['Slide it between the two defenders for the 9.'], ['Wait behind the yellow line. Go when the pass is hit.']] },
      runner: 1
    };
  }
});
T.push({
  id: 'u-wing', name: 'Down the wing', tier: 0, weight: 1, tutorial: 1, phases: 'F K', ending: 'cutback', finisher: 'striker',
  beats: 'a full-back on the winger and one defender in front of goal: teaches the cut-back', names: ['Down the wing', 'Out wide and back'],
  ranges: { wY: [38, 41, 0.5], stY: [25, 28, 0.5] },
  build(p) {
    const att = [{ num: 6, name: 'Holder', x: 25, y: 50, role: 'ball' }, { num: 7, name: 'Winger', x: 41, y: p.wY, role: 'ball' }, { num: 9, name: 'Striker', x: 24, y: p.stY, role: 'ball' }];
    const thr = P(46, 24), k = P(28, 11);
    return {
      att, order: [0, 1, 2],
      def: { line: null, marks: [{ on: 1, react: 26, eng: 3.5 }], screens: [], hunters: [], extra: [{ t: 'zone', x: 21, y: 19, eng: 5, leash: 8 }] },
      gk: { react: 16 },
      plan: [{ carry: [P(28, 49)], pass: pass(thr, 3, { through: 1 }) },
        { recv: spot(P(46, 26), 'timed'), carry: [P(45, 12), P(44, 7)], pass: pass(k, 4) },
        { recv: spot(add(k, 1, 0.5), 'timed', { grab: 2.5 }), first: 1, shot: 1 }],
      text: { brief: ['Three players now. Out to the winger, pulled back, tapped in.'], tips: [['Play it down the {right}, ahead of the 7.'], ['Run onto it, reach the byline, pull it back for the 9.'], ['Arrive as the ball does and finish first time.']] },
      runner: 1, cutback: true
    };
  }
});
T.push({
  id: 'u-decoy', name: 'The decoy', tier: 0, weight: 1, tutorial: 1, decoy: true, phases: 'decoy F X', ending: 'run', finisher: 'forward',
  beats: 'a marker who follows the decoy out of the middle', names: ['The decoy', 'Drag him away'],
  ranges: { fX: [13, 16, 0.5], fY: [29, 31, 0.5] },
  build(p) {
    const att = [{ num: 10, name: 'Decoy', x: 25, y: 28, role: 'decoy' }, { num: 8, name: 'Playmaker', x: 25, y: 50, role: 'ball' }, { num: 11, name: 'Forward', x: p.fX, y: p.fY, role: 'ball' }];
    const thr = P(23, 14);
    return {
      att, order: [0, 1, 2],
      def: { line: null, marks: [{ on: 0, eng: 3.5 }], screens: [], hunters: [], extra: [{ t: 'zone', x: 36, y: 22, eng: 5, leash: 8 }] },
      plan: [{ decoy: [P(34.5, 31)] }, { carry: [P(25, 46)], pass: pass(thr, 2, { through: 1 }), viaDecoy: 1 }, { recv: spot(add(thr, -0.5, 2), 'onside', { grab: 2.2 }), shot: 1 }],
      decoyRun: 10,
      text: { brief: ['Your first player never touches the ball. His run drags a defender out of the way.'], tips: [['Run wide, about ten metres. Your marker follows you. Then press DONE.'], ['Pass through the gap the decoy left, for the 11.'], ['Wait, then run in from the {left} as the 8 plays it, and score.']] },
      runner: 2
    };
  }
});

const BY_ID = {}; T.forEach(t => (BY_ID[t.id] = t));
function find(name) { if (!name) return null; const k = String(name).toLowerCase(); return BY_ID[k] || T.find(t => t.name.toLowerCase() === k || t.name.toLowerCase().startsWith(k)) || null; }
module.exports = { TEMPLATES: T, BY_ID, find };
