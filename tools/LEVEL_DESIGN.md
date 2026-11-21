# One-Man Team: level design guide

The game: a football move is built one player at a time. Each round the human controls one attacker; every attacker already
played replays their recording at the same moment. Defenders are not recorded, they react live, so a new run can change what
happens to an earlier pass. The engine is `one-man-team/js/sim.js` (read the header comment and the constants first).

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
    { num: 9, name: 'Striker', x: 28, y: 26.6, role: 'ball', tip: '...' }
  ],
  order: [0, 1],                   // indexes into att: the order the rounds are played
  def: [                           // defenders (the goalkeeper is automatic)
    { t: 'zone', x: 25, y: 40, spd: 5.0, eng: 4 },                      // screening midfielder
    { t: 'line', x: 10, y: 25, spd: 5.0 }, { t: 'line', x: 20, y: 25, spd: 5.0 },   // a back four:
    { t: 'line', x: 30, y: 25, spd: 5.0 }, { t: 'line', x: 40, y: 25, spd: 5.0 }    // all `line`, same unit
  ],
  gk: { sweeper: true },           // optional, see "Goalkeeper"
  lines: { 0: { gap: 12 } }        // optional per-unit back-line settings, see "line"
}
```
- The ball starts with the first `role: 'ball'` attacker in `order`. It then travels down the chain of `ball` attackers in
  `order`; only the next one in the chain can collect a pass. The last one must score.
- `role: 'decoy'` attackers never touch the ball. Their round is just a run; it ends when the bot/human presses DONE.
- Old levels that only use `mark` and `zone` with `x, y, spd, eng` still load and run (with the new behaviour, so re-run
  their bot scripts: timings will have changed).

## Defender types and fields
Every defender has `t`, `x`, `y` (start and home position). Everything else is optional.

| field | applies to | default | meaning |
|---|---|---|---|
| `spd` | all | 5.2 | top speed in m/s. Capped at 5.8 by the engine. Gentle 4.6-5.0, hard 5.3-5.6. |
| `eng` | all | mark 3.5, zone 7, press 16, line 8 | engage range in metres: how close the ball must come before he will go and press it, and how far he will go to cut out a pass. |
| `agg` | all | 0.5 | aggression 0..1. Lunge range is `1.5 + 0.6 * agg` m and he waits `24 * (1 - agg)` ticks in range before going. 0 = holds the carrier up, 1 = dives in. |
| `react` | all | mark 18, others 12 | reaction time in ticks. Marker: how late he sees his man's movement. Zone/press/line: how long after a pass is hit before he reacts to it. |
| `a` | mark | required | index (in `att`) of the man he marks. |
| `tight` | mark | 1 | multiplier on his marking distance (0.8 = touch-tight, 1.3 = loose). |
| `screen` | zone, press | 5 | how far from his shape position he will move to stand on a passing lane. |
| `leash` | zone, press | zone 14, press unlimited | he stops pressing when the ball is further than this from his home position. |
| `unit` | line | 0 | which back-line unit he belongs to. Members with the same `unit` form one line. |

### `line`: a back-line unit
```js
{ t: 'line', x: 12, y: 23.5, spd: 5.2 }, { t: 'line', x: 22, y: 23.5, spd: 5.2 }, { t: 'line', x: 32, y: 23.5, spd: 5.2 }
// a second, separate line on the same level: add unit: 1 to its members
// per-unit settings (all optional): lines: { 0: { gap: 13, floor: 15, step: 3 } }
```
All members with the same `unit` share ONE height. Their start `x` sets the spacing, the average start `y` is the home
height (a member placed 1 m deeper stays 1 m deeper). The unit:
- **keeps its spacing** (92% of the designed width) and **shifts across** towards the ball: 0.4 m for every metre the
  ball is off the unit's centre, at most 8 m. So the gaps move with the ball. With the ball central the two
  centre-halves stand 4.6 m either side of it; the channel outside a centre-half is never straight in front of the ball.
- **drops off a free ball**: it keeps `gap` (13 m) between itself and a ball nobody is pressing, back-pedalling at 85%
  of its slowest member's speed, down to `floor` (y = 15, the edge of the box).
- **holds under pressure**: when any defender is within 3 m of the carrier the line stops dropping and squeezes back
  up to home (keeping `gap - 4`). This is the offside trap: a runner who goes early against a holding line is off.
- **goes with a runner** only while the ball is free: an attacker sprinting towards goal within 5 m in front of the line
  drags it back with him (the line is slower than he is, so he still arrives on its shoulder).
- **steps up** when the ball travels backwards (faster than 2 m/s away from goal), up to `step` (3 m) above home, and
  keeps that ground until the ball comes forward again.
- **engages**: when the carrier comes within `eng` of a member's slot, that member steps out and presses; the men
  either side tuck in 40% of the way to his slot and stand 1.5 m deeper (cover).
- **recovers**: once the ball is in behind (or within 1.5 m of the line), everyone turns, runs at full speed for a line
  3 m goal-side of the ball and funnels in towards it. It will go as deep as y = 4 for this.
- sends **one** member for a loose ball it can reach; the rest keep the line.
- `FB.offsideLine(S)` is unchanged (second-deepest of defenders + keeper), so on a level with a back line the yellow
  offside marker simply sits on the line.

### `zone`: a screening midfielder
```js
{ t: 'zone', x: 25, y: 40, spd: 5.0, eng: 4 }                 // passive screen: only presses if you run into his patch
{ t: 'zone', x: 21, y: 43, spd: 5.2, eng: 6, screen: 7 }      // presses earlier, covers lanes further from his post
```
Holds a home position, shifts a quarter of the way across with the ball, and **stands on the passing lane** from the
ball to the most dangerous receiver he can screen (the attacker nearest the goal whose lane passes within `screen`
metres of him; unplayed attackers count). He is half a step off the lane while the carrier is moving and steps fully on
to it when the carrier slows below 70% of dribbling speed (that is what "shaping to pass" looks like to him: aiming
slows you to 60%). Presses when the ball comes within `eng` of him; intercepts within 0.85 m.

### `press`: a ball hunter
```js
{ t: 'press', x: 25, y: 46, spd: 5.4 }                         // eng defaults to 16, no leash
```
A `zone` with a long engage range and no leash: he comes for the carrier from kick-off. Use one, high up the pitch, to
put a clock on the first pass.

### `mark`: a man-marker
```js
{ t: 'mark', a: 1, x: 40.6, y: 38.3, spd: 5.4 }                // classic full-back on a winger
{ t: 'mark', a: 0, x: 25, y: 24.6, spd: 5.6, eng: 4, react: 24, tight: 0.8 }   // tight but slow to turn
```
Stands **goal-side and ball-side** of attacker `a`: on the line from his man to the centre of the goal, shaded towards
the side the ball is on, 1.3 m away when the ball is within 6 m of his man and up to 3.0 m when it is 24 m away. He
sees his man `react` ticks late and assumes he carries on as he was, so he runs *with* a steady run but keeps going the
wrong way for a third of a second after a sharp cut. Does not chase loose balls; a pass within 0.7 m of him is
intercepted. Presses his own man when he has the ball, and any other carrier who comes within `eng` (3.5 m) when nobody
better placed is pressing. At kick-off put him 2-3 m goal-side of his man; he settles into his exact spot in the first
half second.

### Goalkeeper: `gk` (level field, optional)
```js
gk: { sweeper: true }              // comes for through balls anywhere in the box (default: six-yard area only)
gk: { react: 18 }                  // slower shot-stopper (default 13 ticks)
gk: { x: 25, y: 1.2 }              // start position (default)
```

## How things behave (constants are in `C` in sim.js)
Attackers and the ball are unchanged: 7.6 m/s without the ball, 6.5 with it, 60% of that while aiming; kick speed
9..28 m/s by power 0..1; a ball rolls roughly `speed / 0.8` metres (11 m at power 0, 35 m at power 1) and is slow for
the last third of that.

**One presses, one covers, the rest keep shape.** Each tick the engine picks one first defender: the eligible man who
can get to the carrier soonest (the carrier's own marker is preferred; the current presser keeps the job unless someone
is clearly better placed). He runs to **cut the carrier off** (the first point on the carrier's present path where he
can arrive goal-side in time), slows inside 3 m and **jockeys** 1.4 m goal-side of the ball. A second zone player in
range drops 5 m goal-side of the ball (cover). Nobody else leaves his job.

**The tackle is a lunge with a tell.** Any defender on his feet with the carried ball inside his lunge range for his
patience time (or at once, if the ball is being run straight on to him) plants for 12 ticks (0.2 s, intent `windup`).
Four ticks into the plant he fixes the spot where the ball will be if the carrier carries on as he is; then the leg
goes out for 7 ticks along that line, reaching about 1.9 m. Stand still or run straight and he wins it. Change
direction after the fourth tick of the plant and he misses and is off balance for 34 ticks (0.57 s): run past him.
Dribbling the ball into a defender who is set (within 0.5 m) also loses it; a defender sprinting past wins nothing
without planting. If the ball is passed during the plant he stands down with a short stumble.

**First touch.** For 20 ticks after receiving a pass the ball cannot be tackled. A plant may start 14 ticks after the
touch, so the earliest a receiver can lose it is about 28 ticks (0.47 s) after controlling it.

**Loose balls.** Zone, press and line players react to a pass `react` ticks (0.2 s) after it is hit, then work out
whether they can be standing on its path when it arrives (running at 90% pace). Those who can, within `eng` of where
they are, go; at most two in total and one per back line. A ball that will die within `1.5 * eng` of a defender is
collected. Markers never leave their man for a loose ball.

**Recovery.** A defender who is the wrong side of the ball does not chase it: he runs for a spot 4-5 m goal-side of the
ball on the line to goal, and becomes a presser again when he gets there.

**Goalkeeper.** Stands on the line between ball and goal centre, 1.2-3 m out. One-on-one (carrier inside 18 m with no
defender goal-side within 3.5 m) he comes out to narrow the angle, up to 5 m (7 m for a sweeper), stopping 3.2 m short
of the ball; he never back-pedals from a carrier and smothers a ball dribbled within 2.6 m of him. When the carrier
shapes to shoot he sets. A shot: he stands for 13 ticks (18 if he was still moving when it was hit, so shoot on the
run before he sets), then goes for the nearest point of the ball's path at 5.6 m/s with a reach of 1.05-1.5 m.
Measured results at full power into a corner, shooter standing and unmarked, keeper set: from 6-10 m it scores from
anywhere between the edges of the six-yard box (x 16-34); from 12 m it scores except the far post from x 17 or 33; 14 m
is a coin toss; from 16 m and beyond it is saved. From wide of the box (x 13 or 37) even 6 m is saved: the angle is
too tight. A shot at him, or a soft one, is saved. With a defender goal-side of the shooter the keeper stays deeper
and also saves far-post shots from an angle at 10 m. Through balls: he comes for a pass he will reach before any attacker, inside the
six-yard area (ordinary keeper) or the whole box (`sweeper`).

**Players not yet played** ("future" players) stand still at their start. Defenders treat them as real opponents:
their markers stand with them, screens block the lanes to them (a future receiver can be the "most dangerous" one),
and the keeper assumes a future attacker started running when the pass was hit (so he does not rush
out for a through ball in the passer's round just because the striker has not been played yet). Nobody presses, lunges
at or tackles a ball that a future player is holding (decoy rounds played before the first ball player).

**Offside** is unchanged: checked when a pass is hit; the receiver is off if he is more than 0.6 m beyond both the
ball and the second-last opponent.

**Fail conditions** are unchanged: tackled, intercepted, saved, smothered, keeper, off target, out of play, offside,
live player touching a recorded team-mate (0.85 m), clock runs out.

**What the renderer can draw.** Every defender and the keeper carry `fx, fy` (facing), `lunge` (0..1 through plant and
strike; the keeper's is his dive), `offBalance` (ticks left on the floor), `intent` (`shape, screen, read, mark, press,
jockey, cover, windup, lunge, offbalance, recover, intercept, hold, drop, step`; keeper: `angle, narrow, set, dive,
sweep, smother`) and defenders also `footX, footY` (where the tackling foot is).

## Lessons from rebuilding pack 1 on the new engine
- **A through ball has to be hit from close to the line.** Measured through the 9 m gap between two centre-halves,
  straight on: power 1 gets through from up to 18 m in front of the line, power 0.8 from up to 14 m, power 0.6 from up
  to 12 m. From 20 m or more a centre-half always steps across and cuts it out. Carry first, then pass firmly.
- **A passer's round only proves the pass survives 0.9 s.** A slow pass can still be cut out later, in the receiver's
  round. Always run every round and the full replay before believing a pass works. Firm passes are safer than soft ones.
- **The gaps move with the ball.** The line shifts towards the ball, so aim between two defenders as they will stand
  when the ball is where the passer is, not where they start. A central carrier has the centre-half gap dead ahead.
- **Pressure decides how the line behaves.** If the passer is being pressed the line holds: the receiver must be level
  when it is hit and then out-run it. If the passer is free the line drops with the runner and the space behind shrinks:
  pass early. Use this to make a level about timing (pressed passer) or about speed of thought (free passer).
- **Go round the screen.** A `zone` stands on the lane to the most dangerous receiver. The passer has to carry sideways
  to open a different angle, or play to someone the screen is not covering. Carrying straight at him loses the ball.
- **Do not run into a set defender.** He plants and wins it. Either release before he is within 2 m or let him plant and
  cut. Bots do not feint; pack 1 never needs a take-on. If you design one, add a feint skill to `tools/bots.js`.
- **A tightly marked player cannot stand on the ball.** He has about 0.47 s after his first touch. Have him arrive
  moving, having checked away from his marker (a sharp change of direction buys 0.5-1 m more than a straight sprint), and
  release first time (`first: 1`) or carry away from the marker.
- **Cut-backs go to the penalty spot, not the six-yard line.** When a winger gets in behind, the line retreats to 3 m
  goal-side of the ball. From the byline that puts the defenders on the 4-5 m line and leaves the 10-12 m zone free.
  The finisher should arrive late and hit it first time; a defender will reach him within half a second.
- **Keep full-backs honest with `eng`.** A line member steps out to anyone within `eng` (8 m) of his slot. On gentle
  levels give the line `eng: 5` so the centre-half does not come all the way out to a winger on the touchline.
- **Decoys now have three jobs.** Drag a marker out of a space (as before); pull a screen off the real lane by being
  the more dangerous receiver; or sprint in behind while the ball is free to make the line drop and open room in front.
- **Finishing.** Design the last touch inside 12 m. From wider than the six-yard box the near post is the safer corner.
- **Speeds.** Attackers out-run every defender (7.6 v 5.8 at most), so separation comes from time and from changes of
  direction. Markers 4.6-5.0 for gentle levels, 5.3-5.6 for hard ones; `react: 24` makes a marker easy to wrong-foot,
  `react: 8` makes him a limpet.

## Bot scripts (prove the level can be beaten)
`tools/scripts/packN.js` exports one array per level, one script object per round in `order`. Fields are documented at the
top of `makeBot` in `tools/bots.js`. Pack 1 scripts are worked examples.

## Commands
- `node tools/ai-scenarios.js`             defender and keeper behaviour tests; must end with "all scenarios passed"
  (`-v` prints the numbers each scenario measured: useful to see how far a marker is beaten, how fast the line drops...)
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

## Shooting (changed 21 Nov 2026)
Any kick by the last player in the move is a shot: 17-34 m/s by power (a pass is 9-28) and it loses pace far more slowly
(`C.shotFric` 0.28 against 0.8). The keeper's reach is 0.8 m (1.2 m at full dive) and he dives at 4.7 m/s. Measured with no
defenders and the keeper set: at full power about 30% of the goal mouth scores from just outside the box, about 55% from
14 m, about 67% from the penalty spot, and nothing from 26 m. `node /path/to/qa/shots.js`-style sweeps are the way to re-check.

## Stars, clocks and practice (changed 21 Nov 2026, after playtest 1)
- Stars grade the finished move, not the number of takes: one for scoring, two for a move time within 1.5x the bot's
  time, three within 1.2x. The bot times are generated into `one-man-team/js/levels/pars.js` by `node tools/make-pars.js`;
  rerun it after changing a level, a bot script or the engine.
- Every level's `time` was raised by 20% (rounded up). When adding a level, set `time` to about 1.8x the bot's time.
- `one-man-team/js/levels/practice.js` holds the four no-fail drills played before fixture 1.
- Fixtures 1-4 ease shots towards the open corner (full, full, 60%, 30%); fixture 5 onwards has no help.
- Tester mode (tap the masthead seven times): unlocks every fixture and adds a play log and a slow-time-while-aiming
  switch to Options.
