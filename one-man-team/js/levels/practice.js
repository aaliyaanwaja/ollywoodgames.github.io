/* Practice: four drills played before the first fixture. Nothing here can be failed: a miss simply starts the drill again.
   Same level format as the packs, plus:
     coach  per round, the prompt for each situation (r ready, w waiting, i pass on its way, h on the ball, a aiming, k played)
     reps   start positions for attacker 0, one per repetition (score from each)
     feed   a scripted pass from attacker 0 { k: tick it is hit, at: [x, y] aim point, sp: speed }, so the drill starts on round 2
     mark   { x, y, r } a chalk circle; with passOnly, the pass must stop inside it */
(function (root) {
  const D = (root.OMT_PRACTICE = []);
  const AIM = 'The white ring shows where the ball will go. Let go.';
  D.push({
    practice: true, name: 'Shoot', time: 90, brief: 'Press the red button, drag towards a corner of the goal, let go.',
    gk: { react: 26 }, reps: [[25, 12], [19, 12]],
    att: [{ num: 9, name: 'Striker', x: 25, y: 12, role: 'ball', tip: 'Press, drag at a corner, let go.' }],
    order: [0], def: [],
    coach: [{ r: 'Press <b>SHOOT</b> and hold. Drag towards a corner of the goal. Let go.', h: 'Press <b>SHOOT</b> and hold. Drag towards a corner of the goal. Let go.', a: 'Aim away from the keeper. Drag further to hit it harder. Let go.' }]
  }, {
    practice: true, name: 'Run and shoot', time: 90, brief: 'Drag anywhere to run. Collect the ball, carry it closer, score.',
    gk: { react: 26 }, feed: { k: 50, at: [25, 17], sp: 12 },
    att: [{ num: 8, name: 'Feeder', x: 25, y: 44, role: 'ball', tip: '' }, { num: 9, name: 'Striker', x: 25, y: 30, role: 'ball', tip: 'Run onto the ball, carry it closer, shoot.' }],
    order: [0, 1], def: [],
    coach: [null, { r: 'Drag anywhere with your other thumb to run. A pass is coming.', w: 'Drag to run. Keep your thumb down to keep moving.', i: 'Run onto the ball.', h: 'You have it. Carry it closer, then <b>SHOOT</b> at a corner.', a: 'Away from the keeper. Let go.' }]
  }, {
    practice: true, passOnly: true, name: 'Pass ahead', time: 90, brief: 'Passes go where your striker is going, not where he is. Stop the ball in the yellow circle.',
    mark: { x: 25, y: 24.5, r: 4 },
    att: [{ num: 8, name: 'Playmaker', x: 25, y: 44, role: 'ball', tip: 'Stop the ball in the yellow circle.' }, { num: 9, name: 'Striker', x: 25, y: 33, role: 'ball', tip: '' }],
    order: [0, 1], def: [],
    coach: [{ r: 'Not to the 9: <b>into the yellow circle</b> ahead of him. Press <b>PASS</b>, hold, and drag towards it.', h: 'Not to the 9: <b>into the yellow circle</b> ahead of him. Press <b>PASS</b>, hold, and drag towards it.', a: 'Drag until the white ring sits inside the yellow circle. Drag further for more weight. Let go.', k: '' }]
  }, {
    practice: true, last: true, name: 'The rewind', time: 90, brief: 'Now the idea of the whole game. Play the pass, then become the player it is for.',
    gk: { react: 26 }, mark: { x: 25, y: 24.5, r: 4 },
    att: [{ num: 8, name: 'Playmaker', x: 25, y: 44, role: 'ball', tip: 'Play the same pass into the yellow circle.' }, { num: 9, name: 'Striker', x: 25, y: 33, role: 'ball', tip: 'Run onto your own pass and score.' }],
    order: [0, 1], def: [],
    coach: [
      { r: 'The same pass again, into the yellow circle.', h: 'The same pass again, into the yellow circle.', a: AIM, k: 'Played. Now watch what happens.' },
      { r: 'Time has rewound. <b>Now you are the 9</b>, and the pass you just played is coming.', w: 'Your 8 is about to play it, exactly as you did. Get ready to run.', i: 'There it is. Run onto your own pass.', h: 'Carry it closer, then <b>SHOOT</b> at a corner.', a: 'Away from the keeper. Let go.' }
    ]
  });
})(typeof module !== 'undefined' ? global : window);
