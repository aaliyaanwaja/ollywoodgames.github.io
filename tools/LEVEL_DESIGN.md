# One-Man Team: level design guide

The game: a football move is built one player at a time. Each round the human controls one attacker; every attacker already
played replays their recording at the same moment. Defenders are not recorded, they react live, so a new run can change what
happens to an earlier pass. The engine is `one-man-team/js/sim.js` (read it first; it is short).

## Pitch and units
- Metres. `x` runs 0..50 across, `y` runs 0..60. The goal is at the TOP: goal line `y = 0`, goal mouth `x` 21..29.
- Penalty area: x 8..42, y 0..16.5. Attackers attack towards smaller `y`.
- 60 ticks = 1 second.

## Level format (see `one-man-team/js/levels/pack1.js`)
```js
{
  name: 'Through ball',            // short, football language
  time: 9,                         // seconds the whole move may take
  brief: 'One or two short sentences shown before the level.',
  att: [                           // attackers
    { num: 8, name: 'Playmaker', x: 25, y: 50, role: 'ball', tip: 'Shown while you play him. One or two short sentences.' },
    { num: 10, name: 'Decoy', x: 25, y: 27, role: 'decoy', tip: '...' }
  ],
  order: [0, 1],                   // indexes into att: the order the rounds are played
  def: [                           // defenders (the goalkeeper is automatic)
    { t: 'zone', x: 25, y: 39, spd: 5.2, eng: 7 },
    { t: 'mark', a: 1, x: 30.6, y: 24.8, spd: 4.6, eng: 3.5 }
  ]
}
```
- The ball starts with the first `role: 'ball'` attacker in `order`. It then travels down the chain of `ball` attackers in
  `order`; only the next one in the chain can collect a pass. The last one must score.
- `role: 'decoy'` attackers never touch the ball. Their round is just a run; it ends when the bot/human presses DONE.
- A player who has not been played yet stands still at his start position, and so does his marker.

## How things behave (constants are in `C` in sim.js)
- Attacker speed 7.6 m/s without the ball, 6.5 with it, 60% of that while aiming.
- Kick speed 9..28 m/s by power 0..1. A ball rolls roughly `speed / 0.8` metres: about 11 m at power 0, 35 m at power 1,
  and it is slow for the last third of that.
- `mark` defender: shadows attacker `a`, standing 2.2 m goal-side of him. Tackles the ball carrier inside `eng` metres
  (use 3.5). Does not chase loose balls, but a pass that runs within 0.7 m of him is intercepted. Place him at start at
  `x = a.x + (25 - a.x) * 0.06`, `y = a.y - 2.2`.
- `zone` defender: holds a home position, drifts slightly towards the ball, and goes for the ball (loose or carried) when
  it comes within `eng` metres (5..8). Intercepts within 0.85 m.
- Tackle: any defender within 0.95 m of a carried ball. There is a 20-tick shield right after receiving a pass.
- Goalkeeper: on the line, shades towards the ball, dives after a short reaction time. Shots from about 6-10 m into a
  corner score; shots from 15 m+ are usually saved. A pass that runs to the keeper fails.
- Offside: checked at the moment a pass is hit. The receiver is offside if he is more than 0.6 m beyond both the ball and
  the second-last opponent (the keeper counts, so in practice the deepest outfield defender).
- Fail conditions: tackled, intercepted, saved, off target, out of play, offside, live player touching a recorded
  team-mate (0.85 m), clock runs out.

## Lessons from building pack 1
- A tightly marked player cannot receive standing still: the marker tackles after the shield. The receiver has to ARRIVE
  with the ball, having run away from his marker. Design passes into space with a run of 8-12 m.
- The marker is goal-side, so a pass played straight along the receiver's run from behind hits the marker. Angle it.
- A marked player cannot pass straight forward (the marker is in the lane); he needs an angle of 25 degrees or more.
- Speed edge over a marker is only about 2 m/s, so separation takes time. For gentle levels use marker `spd` 4.6-5.0,
  for hard ones 5.3-5.6. Never above 5.8.
- Decoys work by dragging their marker: out of a passing lane, or deeper to push the offside line back.

## Bot scripts (prove the level can be beaten)
`tools/scripts/packN.js` exports one array per level, one script object per round in `order`. Fields are documented at the
top of `makeBot` in `tools/bots.js`. Pack 1 scripts are worked examples.

## Commands
- `node tools/test.js --pack N`            every level in packN must print BEATEN
- `node tools/test.js <levelNumber>`       verbose trace of one level (numbers are global: pack order, then order in the pack)
- `node tools/test.js --pack N --jitter`   per-round success rate with the bot's timing, aim and power randomly perturbed

## Acceptance for every level
1. BEATEN, and the full replay scores (the test checks this).
2. Bot move time is at most 80% of `time`. Set `time` to about 1.5x the bot's time, rounded up to a whole second.
3. Jitter rate per round at or above the pack's threshold (it means a human has room for error).
4. Start positions: everything inside x 3..47, y 4..57; attackers at least 3 m apart; no defender within 4 m of the ball
   at kick-off; nobody starts offside.
5. One clear football idea per level, named in plain football language, different from the other levels in the pack and
   from pack 1 (through ball, wing cross, decoy drag, four-pass move). Vary sides, angles, numbers and who finishes.
6. Text: British English, short, concrete, tells the player what to do, no jokes at anyone's expense. `brief` under 110
   characters, each `tip` under 120.
7. The intended solution should be the natural one, and a lazy alternative (for example the first player simply passing
   straight to the last) should not be easier than the designed move. The chain order already forces every player to touch it.
