# Foundations 05: the football content of the rulebook (first draft)

Written by the football consultant, 23 Nov 2026. To be reconciled with the level measurements, the difficulty
instrument and the owner's ratings.

## How to read this

**What this is.** Football knowledge turned into rules a level generator could apply: which attacking moves are worth
staging, how the defence should stand so the picture looks real, what makes a move harder without making it silly,
and what makes a goal feel earned.

**What it rests on.** Three kinds of statement appear below, and I have tried to keep them apart:

- *Football.* Standard coaching practice. Distances are the round figures coaches use on a training pitch, not
  measurements from match data.
- *Engine.* Taken from `tools/LEVEL_DESIGN.md`, `tools/AI_NOTES.md`, the constants and kick code in `sim.js`, and the
  60 level files. I read these; I did not run the simulator, the bots or the instruments.
- *Proposal or inference.* My judgement. Marked as such. Nothing here has been playtested by me.

**Scale.** The game pitch is 50 m wide and shows the last 60 m. A real pitch is about 68 m wide. The penalty area
(34 m wide in the game, 40 m in life) and the goal (8 m against 7.3 m) are close to true, so the squeeze is mostly in
the wide areas. I give real distances first and a game distance where it differs. As a rule of thumb: **lengthways
distances carry over unchanged; sideways distances outside the box shrink by about a quarter.**

**Pitch shorthand.** Goal at the top, `y` = metres from the goal line. "D" = the arc on the edge of the box
(about y 16-20, central). "Spot" = penalty spot, y 11. "Byline" = goal line outside the posts.

## What the engine can and cannot express (the short version)

These facts shape every judgement below.

| The engine has | The engine does not have |
|---|---|
| A chain of attackers; each receives once and kicks once | A player receiving twice (so no true one-two) |
| Decoy runners who never touch the ball | A ball in the air: no chip, lofted cross, header, ball over a wall |
| Man-markers, screening midfielders, back-line units, ball hunters | Defenders who can match an attacker's pace (7.6 m/s against 5.8 at most; even dribbling is 6.5) |
| A back line that drops off a free ball, holds when the passer is pressed, steps up on a backward pass | Line members who track individual runners; markers who hand a runner over |
| A tackle with a visible plant that a cut can beat | Bodies: attackers run through defenders; no shielding, blocking or fouls |
| A keeper who plays angles, narrows, sets, sweeps (optional) | A first touch that can go wrong; a pass that is "too heavy" for the receiver |
| Offside, checked when the pass is hit | Offside exemptions at throw-ins; offside for a decoy who interferes |
| A clock | Rebounds, second balls, deflections as a continuing phase |

Two engine habits matter more than all the rest, because they remove jeopardy from the middle of a move:

1. **The receiver is always played after the passer.** A human then goes and fetches whatever was hit. In football the
   runner commits first and the passer has to find him.
2. **A passer's round is won when the ball survives 0.9 seconds.** The cost of a poor pass falls on the next player,
   who can usually rescue it with pace.

Section 4 comes back to both.

---

# 1. Catalogue of attacking scenarios

Forty-two scenarios, then a short list of moves the engine cannot stage at all. Status key:

- **Stages well**: the engine can produce the real picture, including its real way of failing.
- **Compromise**: it works as a level but something a football person would notice is missing.
- **Cannot stage**: needs an engine feature that does not exist.

"Fixture n" means a level that already attempts the idea (1-20 are the baseline). Where I say an idea "exists", I mean
a level and bot script exist, not that I have judged it fun.

## Index

| # | Scenario | Status | Existing fixture |
|---|---|---|---|
| A1 | Through ball between the centre-halves | Stages well | 2, 31 |
| A2 | Wall pass (one-two) | Cannot stage | none |
| A3 | Third-man run | Stages well | 10 |
| A4 | Up, back and through | Stages well | 53 |
| A5 | Lay-off and strike from the D | Stages well | 6, 37 |
| A6 | False nine | Stages well | 18 |
| A7 | Short then long (double movement) | Stages well | 56 |
| A8 | Receive between the lines and turn | Compromise | 54 |
| A9 | The dummy (let it run) | Compromise | 46 |
| A10 | One-touch move around the box | Stages well | 44 |
| B1 | Wing ball and cut-back | Stages well | 3, 7 |
| B2 | Overlap | Stages well | 8 |
| B3 | Underlap | Stages well | 49 |
| B4 | Ball inside the full-back | Stages well | 51 |
| B5 | Reverse pass to the overlapper | Stages well | 59 |
| B6 | Early low cross | Compromise | 41 |
| B7 | Near-post run, far-post decoy | Stages well | 34, 24 |
| B8 | Far-post arrival on the blind side | Compromise | 17, 48 |
| B9 | Crossover runs in the box | Compromise | 52 |
| B10 | Inside forward across the keeper | Stages well | 43 |
| B11 | Switch of play | Compromise | 5 |
| B12 | Overload to isolate | Stages well | 45, 36 |
| B13 | Diagonal in behind the far full-back | Compromise | 9 |
| C1 | Beating the offside trap | Stages well | 13 |
| C2 | Bending the run along the line | Stages well | 57 |
| C3 | Push the line back, play in front | Stages well | 12 |
| C4 | Draw them out of a low block | Stages well | 50 |
| C5 | Clear the channel (two decoys) | Compromise | 14 |
| C6 | Commit the centre-half, release | Stages well | 40 |
| C7 | Drag the block across, strike where they were | Stages well | 47 |
| C8 | Play through the press | Stages well | 15 |
| C9 | Beat the sweeper-keeper; draw him and square | Stages well | 16, 55 |
| D1 | Counter, two against one | Stages well | 33 |
| D2 | Counter, three against two | Stages well | 11, 35 |
| D3 | Channel ball on the break | Compromise | 29, 30 |
| D4 | Late runner strikes on the break | Stages well | 32 |
| E1 | Short corner | Stages well | 21 |
| E2 | Corner pulled back to the edge | Stages well | 27 |
| E3 | Near-post corner and flick-on | Compromise | 24, 26 |
| E4 | Free kick: tapped, or slipped round the wall | Compromise | 22, 25 |
| E5 | Quick throw-in down the line | Compromise | 23 |
| E6 | Kick-off routine | Compromise | 28 |

---

## A. Combinations through the middle

### A1. Through ball between the centre-halves (Stages well)
- **Football.** A midfielder slides a pass through the gap between two centre-halves for a striker timing his run.
- **Touches.** 8 carries, then passes; 9 runs on and finishes. Two players; three if someone feeds the 8 first.
- **Defence.** A back line of two to four, 22-28 m from goal, with a screen 8-12 m in front. The line should drop if
  the passer has time and hold if he is pressed. The gap between centre-halves should be 8-10 m and should close as
  the ball moves away from it.
- **Skill tested.** Weight and timing of the pass; the striker's start (level with the last man as it is hit).
- **Real failures.** Offside; pass overhit to the keeper; centre-half steps across and cuts it out; striker forced
  wide and the angle goes.
- **Engine.** `line`, `zone`, offside, optional `gk.sweeper`. The guide's measured rule already makes the weight
  matter: from 20 m or more in front of the line a centre-half always cuts it out.

### A2. Wall pass, the one-two (Cannot stage)
- **Football.** A plays into B and sprints past his man; B returns it first time into A's path.
- **Touches.** A, B, A.
- **Defence.** One defender tight on A, one behind B. The defender watching the ball loses the runner.
- **Skill tested.** Pass and move; the wall player's first-time weight.
- **Real failures.** Return pass under-hit or blocked; defender ignores the ball and goes with the runner.
- **Missing.** A player can only be in the chain once, and his recording stops shortly after he kicks. The nearest
  honest substitute is A3 (a third player makes the run). If the owner wants the true one-two, the engine needs a
  player who can be played for two rounds, or one round that continues after the kick until he receives again.
  This is the most-loved combination in football, so the gap is worth flagging.

### A3. Third-man run (Stages well)
- **Football.** A plays into B, who has his back to goal; B sets it first time for C, who was already running.
  The defence watches A and B; nobody is looking at C.
- **Touches.** Holder, target man (first time), third man finishes. Three or four players.
- **Defence.** A marker tight on the target man who follows him short, leaving a hole; a line either side of the hole
  that is slow to squeeze it; a screen blocking the direct pass so the move has to go through the target man.
- **Skill tested.** The third man's timing (go *before* the target man touches it) and the target man's cushioned
  first-time pass with a marker on his back.
- **Real failures.** Third man goes late and the hole has closed; goes early and is offside; target man is robbed
  from behind; the lay-off is behind the runner and he has to check.
- **Engine.** `mark` (tight), `line`, `zone`. The 0.47 s first-touch shield makes the target man's round a real
  first-time decision.

### A4. Up, back and through (Stages well)
- **Football.** Up to the striker's feet, back to a facing midfielder, through first time for a runner beyond.
  The backward pass makes the line step up; the through ball goes into the space it has just left.
- **Touches.** 6 up; 9 back; 10 through; 7 finishes. Four players.
- **Defence.** A high line (28-32 m) with a small `gap`, which steps on the backward pass. A sweeper-keeper behind it.
- **Skill tested.** The 7's start against a line that is moving *towards* him, and the 10's first-time weight with a
  keeper coming.
- **Real failures.** Offside (the commonest); keeper sweeps up; the 10 takes a touch and the moment is gone.
- **Engine.** `line` with `step`, small `gap`; `gk.sweeper`; `mark` on the 9. This is the scenario in which the
  engine's line behaviour is most like real football.

### A5. Lay-off and strike from the D (Stages well)
- **Football.** Ball into the striker on the edge of the box, set back, struck first time by a midfielder arriving.
- **Touches.** Holder; 9 (first time, backwards); 8 or 10 shoots. Three players.
- **Defence.** Low or medium block. Centre-half tight on the 9; a screen who should be the man closing the shooter.
  The shooter needs 2-3 m and half a second, no more.
- **Skill tested.** Arriving on the ball rather than waiting for it; striking before the block arrives; choosing the
  corner the keeper has left.
- **Real failures.** Shot blocked by the closing midfielder; shooter arrives early and has to stop; lay-off too hard.
- **Engine.** `mark`, `zone` with a meaningful `eng`, shot model. Engine shots from 14-18 m score into roughly a third
  to a half of the goal, which is about right for a clean strike.

### A6. False nine (Stages well)
- **Football.** The centre-forward drops towards midfield; his centre-half follows; a wide forward runs into the hole.
- **Touches.** Decoy 9 drops; ball goes round to the 8; first time through the hole; 11 finishes.
- **Defence.** Man-marking centre-half on the 9; the rest of the line holding its height with the hole between two of
  its members.
- **Skill tested.** Co-ordination of two runs: the drop must finish before the pass, and the runner must not arrive
  in the hole before the ball.
- **Real failures.** The centre-half does not follow (then the 9 is free between the lines, which is a different
  move); the far centre-half slides across and covers.
- **Engine.** `mark` on a decoy, `line`. See Section 2 on how far a marker should follow: in life he passes the 9 on
  after about 10 m.

### A7. Short then long (Stages well)
- **Football.** The striker comes short to drag his marker up the pitch, then spins and runs in behind him.
- **Touches.** Two feeders, then the pass over the marker's shoulder (on the ground, down the side); 9 finishes.
- **Defence.** A tight, quick-reacting marker. A covering defender 5-8 m behind and to one side.
- **Skill tested.** The sharpness of the change of direction. This is the one scenario where the marker's delayed
  reaction is the whole point.
- **Real failures.** Marker does not bite; cover reads it; pass arrives before the spin.
- **Engine.** `mark` with `react` and `tight`; `line` or `zone` as cover; `gk.sweeper` to punish an overhit pass.

### A8. Receive between the lines and turn (Compromise)
- **Football.** A number ten finds the pocket between midfield and defence, takes it on the half-turn and shoots or
  slips someone in.
- **Touches.** Two or three passes to shift the midfield line; a firm pass through it; the 10 turns and shoots.
- **Defence.** Two banks of four, 10-12 m apart. The gap in the midfield bank opens only when the ball is moved across.
  A centre-half should step out to the 10 the moment he receives.
- **Skill tested.** The pass that splits the midfield bank; the 10's speed of shot.
- **Real failures.** Centre-half steps in and wins it on the first touch; the 10 receives square-on and has to play
  backwards.
- **Compromise.** The engine has no body shape or turn, so "half-turn" is free. The danger of the centre-half
  arriving is real (`eng` on the line), which is the part that matters.
- **Engine.** Two `line` units with `lines` settings, `press`.

### A9. The dummy (Compromise)
- **Football.** A player comes to meet a pass and lets it run through his legs to a team-mate behind him.
- **Touches.** Passer; decoy runs across the ball's path; the man behind strikes.
- **Defence.** A marker who goes with the dummy runner and so opens the lane.
- **Skill tested.** The decoy's timing across the lane; the passer waiting for it.
- **Real failures.** The dummy runner's marker nicks it; team-mates misread each other.
- **Compromise.** The decoy cannot touch the ball, so the engine version is simply a decoy crossing a lane. It reads
  as a dummy only if the renderer and the tip sell it. The collision rule (a live player touching a recorded
  team-mate fails) also makes the timing fiddly rather than football-like.
- **Engine.** `decoy`, `mark`.

### A10. One-touch move around the box (Stages well)
- **Football.** Three or four first-time passes in front of a packed defence until someone is free to shoot.
- **Touches.** Every player first time; the last one strikes.
- **Defence.** Low block; a screen or marker close enough to each receiver that a second touch is punished.
- **Skill tested.** Aiming before the ball arrives; rhythm.
- **Real failures.** One heavy pass kills the tempo; a defender reads the next pass rather than the current one.
- **Engine.** `mark` with small `tight`, `zone` with short `eng`, first-touch shield. Good use of the game's own
  structure, because every round is the same test and the clock ties them together.

## B. Wide play

### B1. Wing ball and cut-back (Stages well)
- **Football.** Winger released to the byline, pulls it back to the penalty spot for a runner arriving late.
- **Touches.** Holder; winger; finisher. Often a decoy to take a marker to the near post.
- **Defence.** Full-back on the winger; line retreating towards its own six-yard box as the ball goes in behind, which
  is exactly what leaves the spot free. One midfielder should be tracking the late runner but arriving a pace behind.
- **Skill tested.** The finisher's patience (arrive late, in front of the defenders); the winger pulling it back, not
  across the six-yard line.
- **Real failures.** Cut-back hit at the first defender; finisher arrives early and is marked by the time it comes;
  skied first-time shot.
- **Engine.** `mark`, `line` (its recovery behaviour produces the right picture), `decoy`.

### B2. Overlap (Stages well)
- **Football.** The winger comes inside with the ball or towards it, taking the full-back with him; our full-back
  runs round the outside.
- **Touches.** Holder; winger (first time down the line); full-back to the byline and pulls back; striker finishes.
- **Defence.** A full-back who follows the winger inside; a wide midfielder who should track the overlapper but is
  late or absent. In life the overlap works because it is two against one on the full-back.
- **Skill tested.** The overlapper's early start; the winger's disguise and weight down the line.
- **Real failures.** Pass down the line overhit and out of play; full-back stays wide and the winger has nowhere to go.
- **Engine.** `mark` on the winger, `zone`, `line`.

### B3. Underlap (Stages well)
- **Football.** The winger stays wide and holds the full-back out there; a midfielder runs *inside* him, through the
  channel between full-back and centre-half.
- **Touches.** Holder; winger; underlapping 8 to the byline; finisher.
- **Defence.** Full-back drawn to the touchline; centre-half who must decide whether to come across. The channel
  should be 8-10 m wide when the pass is played and close quickly.
- **Skill tested.** Timing the run through a channel that is closing; the cut-back from a tight angle.
- **Real failures.** Centre-half slides across; run is offside; runner arrives too deep with no angle.
- **Engine.** `mark`, `line` (the unit's shift towards the ball closes the channel on its own).

### B4. Ball inside the full-back (Stages well)
- **Football.** A pass between full-back and centre-half for a winger darting from out to in.
- **Touches.** Two feeders; the 10 slides it; 7 finishes or squares.
- **Defence.** A compact low or medium block with exactly one seam. The full-back should be 1-2 m too wide because he
  is worried about the touchline.
- **Skill tested.** Pass weight into a small space with the keeper close; the runner's angle.
- **Real failures.** Too heavy and the keeper gathers; too soft and the centre-half covers.
- **Engine.** `line`, `zone`, keeper. Needs a tight lane to be worth anything (see Section 3).

### B5. Reverse pass to the overlapper (Stages well)
- **Football.** The winger drives inside, everything moves with him, and he slips it back against the grain for the
  overlapping full-back.
- **Touches.** Build-up; winger carries inside; reverse pass; full-back crosses low; finisher.
- **Defence.** The full-back and the nearest midfielder both follow the ball inside; the block shifts.
- **Skill tested.** Holding the ball long enough to move the defenders, releasing before the tackle.
- **Real failures.** The winger is tackled while waiting; the overlapper is offside because the line has stepped.
- **Engine.** `mark`, `zone` or `press`, `line`; the tackle tell supplies the risk in the carry.

### B6. Early low cross (Compromise)
- **Football.** Delivered from level with the edge of the box, before the defence is set, into the corridor between
  keeper and back line.
- **Touches.** Feeder; crosser (first or second touch); striker across his marker.
- **Defence.** A back line still retreating, facing its own goal. Keeper undecided whether to come.
- **Skill tested.** Crossing early rather than beating the man; the striker's dart across the front of his marker.
- **Real failures.** Keeper claims it; first defender clears; striker a yard late.
- **Compromise.** The real ball bends away from the keeper or is whipped at pace; the engine ball is a straight roll,
  so the lane has to be genuinely open. It still reads as football if it is hit hard.
- **Engine.** `line` dropping off a free ball, `mark`, keeper's six-yard claim.

### B7. Near-post run with a far-post decoy (Stages well)
- **Football.** One forward pulls away to the far post and takes a defender; the other darts across the near post to
  meet a driven low ball.
- **Touches.** Feeder; wide man drives it low to the near post; striker finishes first time. Decoy to the far post.
- **Defence.** Two markers in the box, 1 m goal-side. Keeper on his near post while the ball is wide.
- **Skill tested.** The dart across the marker (start late, go fast); a first-time finish from a narrow angle.
- **Real failures.** Marker gets across first; ball hits the first man; finish goes into the side netting.
- **Engine.** `mark` x2, `decoy`. Note from the guide: from wider than the six-yard box even a 6 m shot is saved, so
  the finish must be met inside the posts' width.

### B8. Far-post arrival on the blind side (Compromise)
- **Football.** Everyone watches the ball on one flank; the opposite winger steals in behind his full-back at the far
  post.
- **Touches.** Build-up down one side; low ball across the face; late runner taps in.
- **Defence.** Markers in the box; the far full-back ball-watching, 3-4 m inside his man.
- **Skill tested.** Holding the run; arriving, not waiting.
- **Real failures.** The cross is cut out at the near post or by the keeper; the runner is seen and picked up.
- **Compromise.** There is no "blind side": defenders see everything and do not face anywhere that matters. The far
  full-back's inattention has to be faked with `react` or by leaving the runner unmarked. And the ball across a
  crowded box is on the ground, so two decoys are needed to clear its path, which is more contrived than the real thing.
- **Engine.** `mark` with slow `react`, `decoy` x2, `zone`.

### B9. Crossover runs in the box (Compromise)
- **Football.** Two forwards swap posts as the cross comes in; their markers collide or hesitate.
- **Touches.** Build-up; crosser; one forward is a decoy, the other finishes.
- **Defence.** Two tight man-markers.
- **Skill tested.** Timing two runs against one delivery.
- **Real failures.** Markers switch men instead of following; the forwards get in each other's way.
- **Compromise.** With no bodies, markers never collide or get blocked, and they never switch. The separation comes
  only from the markers' reaction delay. It works; it is not really why crossovers work.
- **Engine.** `mark` x2 with `react`, `decoy`.

### B10. Inside forward cuts in and shoots across the keeper (Stages well)
- **Football.** A wide forward receives outside the box, comes inside on to his stronger foot and finishes into the
  far corner while a striker occupies the near post.
- **Touches.** Feeder; decoy 9 to the near post; inside forward carries and shoots.
- **Defence.** Full-back showing him outside, centre-half held by the 9, keeper covering his near post.
- **Skill tested.** The carry across the face of a jockeying defender; composure and placement.
- **Real failures.** Shot blocked; dragged wide of the far post; keeper reads it.
- **Engine.** `mark`, `line`, `decoy`, shot model, tackle tell.

### B11. Switch of play (Compromise)
- **Football.** The defence is squeezed to one side; the ball is moved quickly to the far flank where there is a free
  man and space.
- **Touches.** Crowded full-back; pivot; far winger drives and finishes or crosses.
- **Defence.** Block shifted 8-10 m towards the ball; far-side full-back tucked in level with his far post. A presser
  on the first man so the switch has to be quick.
- **Skill tested.** Speed of circulation: the switch only works before the block slides back.
- **Real failures.** The pivot dwells and is closed; the long pass is slow and the full-back gets out to it.
- **Compromise.** A real switch is usually in the air and takes two seconds. On the ground it must go through or in
  front of the midfield. And the pitch is only 50 m wide, so the "far side" is not very far. The idea still reads if
  the block is visibly overloaded to one side.
- **Engine.** `press`, `zone`, `line` shift.

### B12. Overload to isolate (Stages well)
- **Football.** Three attackers crowd one side to pull the block across, then one quick pass finds the spare man on
  the other side, one against one or free.
- **Touches.** Two short passes on the strong side; the release; the finish.
- **Defence.** A zonal block that slides with the ball and with the numbers.
- **Skill tested.** Patience to draw them, then speed of the release.
- **Real failures.** Losing it in the crowd; the release is too slow.
- **Engine.** `line` shift (up to 8 m), `zone`, `press`.

### B13. Diagonal in behind the far full-back (Compromise)
- **Football.** A long diagonal from the inside-left position over the head of the far full-back for a winger running
  off his back.
- **Touches.** Centre-back; playmaker; inside forward runs in behind and finishes.
- **Defence.** Line squeezed across to the ball; far full-back narrow.
- **Skill tested.** The runner's start on the full-back's outside shoulder; the passer's range.
- **Real failures.** Offside; overhit to the keeper or out for a goal kick; full-back heads it away.
- **Compromise.** On the ground the diagonal has to pass through the line, not over it. It becomes a long through
  ball. Fine as a level, but it is A1 at an angle rather than its own picture.
- **Engine.** `press`, `zone`, `line`.

## C. Moving an organised defence

### C1. Beating the offside trap (Stages well)
- **Football.** The line steps up together as the ball goes back or the passer is closed down; the runner has to be
  level at the moment the pass is hit.
- **Touches.** A backward or square pass that triggers the step; the release; the run.
- **Defence.** A line with a small `gap` that squeezes on the backward pass and holds when the passer is pressed.
- **Skill tested.** Pure timing of the run against a moving line.
- **Real failures.** Offside by a yard. That is the right failure and players accept it.
- **Engine.** `line`, `lines.gap`, `lines.step`, `press`. Fairness depends on the offside marker being easy to read.

### C2. Bending the run along the line (Stages well)
- **Football.** Against a held high line the forward runs *across* the pitch, level with the last man, then turns
  towards goal as the pass is hit.
- **Touches.** Build-up; pass into the channel; the bent run; finish.
- **Defence.** High, flat, holding line; sweeper-keeper.
- **Skill tested.** Running sideways at full pace while watching the passer, then the turn.
- **Real failures.** Offside; turning too late and the keeper gets there.
- **Engine.** `line` under pressure, `gk.sweeper`, `press` on the passer.

### C3. Push the line back and play in front of it (Stages well)
- **Football.** A forward runs in behind without the ball; the line drops with him; the space he has created between
  the lines is where the pass goes.
- **Touches.** Decoy run in behind; carrier; pass to a number ten arriving on the edge of the box; first-time finish.
- **Defence.** A line that respects the runner and drops; screens who do not drop with it.
- **Skill tested.** Seeing space appear and using it before the line recovers its height.
- **Real failures.** The line ignores the runner (and he is offside, so harmless); the screen drops into the space.
- **Engine.** `line` "goes with a runner", `lines.floor`, `zone`, `decoy`.

### C4. Draw them out of a low block (Stages well)
- **Football.** Play backwards on purpose; the block steps up to follow; play forward quickly into the space behind.
- **Touches.** Two backward or square passes; the forward pass; the finish.
- **Defence.** A deep line with a generous `step`.
- **Skill tested.** Tempo: slow, slow, quick.
- **Real failures.** They do not come out; the forward pass is too slow and they have already dropped again.
- **Engine.** `line` with `step`, `floor`. One of the few scenarios in which a backward pass is the right football
  decision, so worth keeping for variety.

### C5. Clear the channel with two decoy runs (Compromise)
- **Football.** Two forwards pull both centre-halves apart; a third player runs through the middle.
- **Touches.** Two decoys; feeder; playmaker; runner finishes.
- **Defence.** Man-marking centre-halves.
- **Skill tested.** Building a picture from several runs; the pass through the middle before cover arrives.
- **Real failures.** One centre-half lets his man go and stays in the middle.
- **Compromise.** No real centre-half follows a forward to the touchline. In the engine a marker follows anywhere,
  which makes the hole enormous and the move too easy to read. Stage it with short drags (8-10 m) and a covering
  player so the hole is a window, not a motorway.
- **Engine.** `mark` x2, `decoy` x2, `zone`.

### C6. Commit the centre-half, then release (Stages well)
- **Football.** Run at a centre-half until he has to come out; his partner tucks in to cover; the striker is free on
  the far side.
- **Touches.** Feeder; carrier commits the defender and slips it; striker finishes.
- **Defence.** Two centre-halves with cover and balance: one steps, one tucks in and drops 1-2 m.
- **Skill tested.** Nerve: carrying until the defender is committed, releasing before the tackle.
- **Real failures.** Releasing too early (nobody was committed) or too late (tackled).
- **Engine.** `line` engage and cover-tuck, tackle tell. The engine models this well and it puts the risk in the
  middle of the move, which is rare here.

### C7. Drag the block across and strike where they were (Stages well)
- **Football.** Carry the ball across the edge of the box; the block slides with it; lay it back into the space it
  has just left for a strike.
- **Touches.** Feeders; the carry across; the set-back against the grain; the strike.
- **Defence.** A sliding low block with screens close enough to tackle the carrier if he dawdles.
- **Skill tested.** Carrying under pressure; the shooter holding his position while everything else moves.
- **Real failures.** Tackled on the carry; shot blocked by the last man sliding back.
- **Engine.** `line` shift, `zone`, shot model.

### C8. Play through the press (Stages well)
- **Football.** Hunters close the first two passes; move it one-touch away from each, and the pitch opens up behind.
- **Touches.** Centre-back; pivot (first time); link drives at the line; striker.
- **Defence.** Two pressers arriving from different angles, a line behind them holding because the ball is pressed.
- **Skill tested.** Playing away from pressure, early.
- **Real failures.** Caught in possession; the pass goes into the presser's path.
- **Engine.** `press` x2, `line`.

### C9. Beat the sweeper-keeper; draw him and square it (Stages well)
- **Football.** Against a keeper who comes for everything behind a high line: either play short and late so he cannot
  get there, or let him come and roll it sideways for a tap-in.
- **Touches.** Build-up; the pass in behind; the runner draws the keeper and squares; team-mate finishes into an
  empty goal.
- **Defence.** High line, sweeper-keeper, one recovering defender.
- **Skill tested.** Weight of the last pass; unselfishness and timing of the square ball.
- **Real failures.** Keeper gets there first; the square pass is cut out by the recovering defender; the tap-in
  runner is offside (he must be level with or behind the ball).
- **Engine.** `gk.sweeper`, `line`, offside on the square pass.

## D. Transition

### D1. Counter-attack, two against one (Stages well)
- **Football.** One defender back. The carrier runs straight at him, makes him choose, and squares it.
- **Touches.** Ball-winner; carrier; finisher.
- **Defence.** One defender retreating slowly, trying to delay and to stay between the two; recovering runners
  behind the ball.
- **Skill tested.** The moment of release; the support runner staying level, not ahead.
- **Real failures.** Passing too early (the defender covers both); too late (tackled); support runner offside.
- **Engine.** Single `line` member, `press` as recovering runners, offside.

### D2. Counter-attack, three against two (Stages well)
- **Football.** Carrier central, runners either side. Commit one defender, play to the free side, finish across goal.
- **Touches.** Ball-winner; carrier; wide runner; far-post finisher.
- **Defence.** Two centre-halves retreating to the edge of their box, narrow, forcing the play wide.
- **Skill tested.** Running lanes (width!) and the second pass across goal.
- **Real failures.** Runners too narrow; the move slows down and the midfield gets back.
- **Engine.** `line` with a high `floor`, `press`.

### D3. Channel ball on the break (Compromise)
- **Football.** Win it deep, hit the space behind an advanced full-back first time, striker runs the channel.
- **Touches.** Ball-winner; passer; runner carries and finishes or squares.
- **Defence.** A stretched back line with a gap on one side; defenders recovering at full pace.
- **Skill tested.** Speed of decision; a pass in front of the runner so he does not break stride.
- **Real failures.** The runner is caught by a covering centre-half; the pass runs out of play.
- **Compromise.** Nobody in the engine can catch him. Once he is through, the race that makes a real counter
  exciting does not exist; only the clock does. See Section 4.
- **Engine.** `line`, `press`, clock.

### D4. Late runner strikes on the break (Stages well)
- **Football.** The striker's run drags the retreating defence towards goal; a midfielder carries into the space in
  front of it and shoots.
- **Touches.** Ball-winner; decoy striker; carrier shoots from the edge of the box.
- **Defence.** A retreating line that goes with the runner; a recovering midfielder chasing the carrier.
- **Skill tested.** Recognising that the shot is on; striking on the run before the keeper sets.
- **Real failures.** Carrying too far into the retreating line; shot from too far.
- **Engine.** `line` drop, `decoy`, the keeper's "caught moving" penalty.

## E. Set pieces

### E1. Short corner (Stages well)
- **Football.** Played short to create two against one near the corner flag, then a changed angle and a pull-back.
- **Touches.** Taker; short man carries infield; late runner finishes.
- **Defence.** Mixed marking: three or four zonal on the six-yard line, markers on the runners, one man sent out to
  the short corner (late), one on the edge of the box.
- **Skill tested.** Using the spare man before the second defender arrives.
- **Real failures.** Dawdling until it is two against two; a blocked pull-back.
- **Engine.** `press` with reduced `eng`, short-leash `zone`s, `line`.

### E2. Corner pulled back to the edge (Stages well)
- **Football.** Runners crash the six-yard box and take the markers with them; the ball is rolled to the edge for a
  first-time strike.
- **Touches.** Decoys; taker; striker on the edge.
- **Defence.** As E1, with the edge-of-box defender dragged in or late out.
- **Skill tested.** A clean first-time strike through a crowd.
- **Real failures.** Blocked shot (the commonest outcome in life); a counter-attack against you.
- **Engine.** `mark`, `decoy`, `zone`, shot model. Crowded boxes also make blocked shots likely, which is right.

### E3. Near-post corner and flick-on (Compromise)
- **Football.** Driven to the near post, helped on across goal, finished at the far post.
- **Touches.** Taker; near-post man (first time); far-post finisher.
- **Defence.** Zonal man on the near post, markers on both runners.
- **Skill tested.** Winning the race to the near post; the far-post man's timing.
- **Real failures.** First man clears; flick goes straight to the keeper.
- **Compromise.** The real thing is a header. On the ground it is a low near-post corner and a first-time touch
  across the six-yard line, which does happen but is the rarer cousin. Keep one, not three.
- **Engine.** `mark`, short-leash `zone`, `decoy`.

### E4. Free kick: tapped square, or slipped round the wall (Compromise)
- **Football.** The wall covers the direct shot, so the ball is moved a few metres to change the angle, or slid past
  the end of the wall for a runner.
- **Touches.** Decoy; taker; striker.
- **Defence.** A wall of three or four, 9 m from the ball, covering the near post; keeper on the other side; markers
  on the edge.
- **Skill tested.** The disguise and the first-time strike.
- **Real failures.** Charged down by the man breaking from the wall; runner offside.
- **Compromise.** No direct free kick is possible, because nothing can go over a wall, so the best-known free kick of
  all is missing. The wall is built from very slow zone players, which looks right, but nobody charges the ball down.
- **Engine.** Slow short-leash `zone`s as a wall, `mark`, `decoy`.

### E5. Quick throw-in down the line (Compromise)
- **Football.** A team-mate comes short and takes the full-back with him; the throw goes down the line behind them.
- **Touches.** Thrower; decoy or short man; runner; finisher.
- **Defence.** Tight markers on every nearby attacker, which is how throw-ins are defended.
- **Skill tested.** Movement to lose a tight marker.
- **Real failures.** Thrown straight to a defender; receiver crowded out on the touchline.
- **Compromise.** It is a kick with a different label. Also, there is no offside from a throw-in in the laws, but the
  engine's offside check makes no exception, so a correct run in behind can be flagged. A generator should either
  avoid runs beyond the line from throw-ins or the engine should exempt the first pass on a level flagged as a throw.
- **Engine.** `mark`, `line`.

### E6. Kick-off routine (Compromise)
- **Football.** Tap back, hit a channel early, flood the box.
- **Touches.** Three or four.
- **Defence.** A set, deep, organised team. Which is the problem: a kick-off is the moment a defence is *most*
  organised, so a goal from one is rare and always looks rehearsed.
- **Skill tested.** Executing a rehearsed pattern at pace.
- **Real failures.** Long ball out of play.
- **Compromise.** The pitch shows only the final 60 m, so a kick-off cannot really start from the centre spot with
  both teams in their own halves. Weakest of the set pieces as football; I would not generate more.
- **Engine.** `line`, `press`.

## F. Moves the engine cannot stage

| Move | What is missing |
|---|---|
| Wall pass (A2) | A player receiving twice |
| Lofted cross and header | A ball in the air |
| Ball over the top; chip over the keeper | A ball in the air |
| Direct free kick over the wall | A ball in the air |
| Penalty | No stationary duel with the keeper; no keeper guess |
| Taking a man on, one against one | A human can do it (the tackle has a tell and a cut beats it) but no bot can, so no level that needs it can be proven. Possible as an optional route only |
| Hold-up play with back to goal | No bodies, no shielding beyond the 0.47 s first-touch protection |
| Rebound, second ball, goalmouth scramble | A save or a block ends the move |
| A recovering defender catching a breaking forward | Defender top speed is below even dribbling speed |
| Step-over, feint to shoot, disguised pass | Defenders cannot be fooled by body shape; they read only position and slowing down |

---

# 2. Defensive principles, as rules for a generator

The aim is that a screenshot of the kick-off position looks like a real defence, and that the first two seconds of
movement look like real defending. Rules are numbered so they can be referred to. Distances are real football first,
with the game value in brackets where different.

## 2.1 The whole shape

**R1. Count the defenders honestly.** A generated level shows part of a team. Use these numbers:

| Situation | Outfield defenders on screen | Typical make-up |
|---|---|---|
| Counter-attack | 1-3 back, 1-2 chasing from behind the ball | 1-3 `line`, 1-2 `press` starting behind or level with the ball |
| Settled play, medium block | 5-7 | back four `line`, 1-2 `zone`, 0-1 `press` |
| Low block | 7-9 | back four or five, a midfield bank of three or four, maybe one `press` |
| Set piece | 6-9 | zonal `zone`s, `mark`s on runners, one man out |

Never fewer than the attackers shown minus one, except on a counter. An attack that outnumbers a settled defence
looks wrong at a glance.

**R2. Compactness.** From the deepest outfield defender to the highest midfielder: 25-30 m in a medium block, 15-20 m
in a low block. Between the back line and the midfield screen: 10-12 m in a medium block, 6-8 m in a low block.
More than 15 m between the lines should only appear when the scenario is about that hole (A8).

**R3. Narrowness.** A back four with the ball central covers about 40 m (game: 28-32 m, so members roughly 9-10 m
apart). It should never stretch touchline to touchline. The space is left *outside* the full-backs, not between
defenders. The baseline levels do this (for example fixture 15: x 9, 20, 30, 41).

**R4. Shift to the ball.** With the ball wide, the whole block moves towards it by 8-12 m (game: up to 8 m, which is
the engine's cap). The ball-side full-back is the only defender near the touchline. The far-side full-back comes in
to about the line of his far post. A far-side winger is left free on purpose; the pass to him is long and gives the
block time to slide. A generator should place blocks already shifted when the ball starts wide.

**R5. Line height by situation.**

| Block | Line height from goal | When to use |
|---|---|---|
| High | 30-35 m | Ball far away and pressed; trap and sweeper-keeper scenarios. The keeper should be a `sweeper` |
| Medium | 22-28 m | Default for settled play |
| Low | 16-20 m, the edge of the box | Low-block scenarios; no space in behind, so the finish is a strike or a cut-back |
| In the box | 6-12 m | Only when the ball is already at the byline or at a set piece |

A line may not stand deeper than the ball unless the ball is in behind it. A line standing on its own six-yard box
with the ball 40 m away is the commonest "that is not football" picture.

**R6. The line and the passer.** If the ball-carrier has time and is facing forward, the line drops and the trap is
off. If he is pressed, has his back to goal, or the ball is travelling backwards, the line holds or steps. The engine
already does this (drops off a free ball, holds when a defender is within 3 m of the carrier, steps on a backward
pass). The generator's job is to choose which of the two the level is about and to place a presser accordingly.

## 2.2 Marking

**R7. Goal-side and ball-side.** A marker stands on the line between his man and the centre of the goal, shaded
towards the ball so he can see both. The engine does this.

**R8. Distance to the man depends on where the ball is and where the man is.**

| Situation | Distance |
|---|---|
| In the penalty area, ball wide or at a set piece | touching distance, under 1 m (`tight: 0.8`) |
| Ball within 10 m of his man | 1-1.5 m |
| Ball on the far side | 3-5 m, tucked in towards the middle |
| Marking a quick forward with space behind | an extra 1-2 m off, so as not to be beaten for pace |

**R9. Markers do not follow for ever.** A centre-half goes with a forward who drops for about 8-10 m, then passes him
on to a midfielder and returns to the line. A full-back follows his winger inside for about 10-12 m. Nobody follows
a decoy from the penalty spot to the touchline. *The engine's marker follows without limit.* A generator should
therefore design decoy runs no longer than about 10 m, so that the engine's picture and the real one agree, and
should treat a drag of 15 m or more as a cheap solution to be tested for and closed off.

**R10. Who gets a marker.** In settled play, man-mark at most the centre-forward and one other. Everybody else is the
business of the zonal shape. At set pieces, mark every attacker in the box. A level in which every attacker has a
personal marker looks like a schoolyard.

## 2.3 Pressure, cover, balance

**R11. One presses.** The nearest defender who can get there goes to the ball. He closes fast, slows at 2-3 m, and
jockeys at 1.5 m on the goal-side, half-turned to show the carrier away from goal or towards help. The engine does
this.

**R12. One covers.** The next defender stands 4-6 m behind the presser and slightly inside, at an angle, so that he
can reach the carrier if the presser is beaten and still block the pass inside. The engine's cover is 5 m goal-side
of the ball for zone players and a tuck-and-drop of 1.5 m for line members.

**R13. The rest balance.** They squeeze towards the ball and watch runners; none of them goes to the ball.

**R14. The screen.** A holding midfielder stands 8-12 m in front of the centre-halves, between the ball and the
centre-forward, so that the straight pass into the striker's feet is not on. One screen for a medium block, two for
a low block, standing 8-10 m apart.

**R15. Pressing triggers.** A presser should start when one of these happens, not at a fixed time:

1. a backward or square pass;
2. a pass to a full-back or anyone within 5 m of a touchline;
3. a receiver with his back to goal;
4. a slow or bouncing pass, or a heavy first touch;
5. the carrier slowing down or stopping.

The engine's presser simply comes from kick-off (engage range 16 m). Trigger 5 exists for zone players (they step on
to the lane when the carrier slows). Triggers 1 and 2 can be imitated by placement: put the presser where the first
pass is going and give him a shorter `eng`, so he goes when the ball arrives rather than at the whistle.

**R16. Starting distance of a presser.** 8-12 m from the ball at kick-off gives the first player about a second and
a half, which feels like a real closing-down. Under 6 m feels like an ambush before the player has looked up; over
15 m is no pressure at all. (The guide's own rule is no defender within 4 m of the ball at kick-off. I would raise
that floor to 6 m for any defender who presses.)

## 2.4 The goalkeeper

**R17. Position.** On the line between ball and goal centre. Ball central and distant: 2-4 m off his line, and
8-15 m off it behind a high line (a sweeper). Ball wide near the byline: on his near post, a metre off the line.
One-on-one: comes out to narrow the angle and stays big.

**R18. Match the keeper to the line.** High line means sweeper-keeper. Low block means a line keeper. A sweeper
behind a low block has nothing to sweep and only makes through balls impossible in a space that is already too small.

**R19. Starting position is a fair lever.** A keeper who starts slightly off-centre because the ball started wide
is real, and it gives the shooter a corner to aim at.

## 2.5 Set-piece shapes

**R20. Corners.** Three or four zonal players along the six-yard line (near post, centre, far post), markers on the
attackers who start around the penalty spot, one man 8-10 m from the corner taker, one on the edge of the box.
Zonal players do not leave their patch (short leash). This is how fixtures 21-27 are built.

**R21. Free kicks near the box.** A wall 9 m from the ball, three to five players, covering the near-post side;
keeper standing on the other side of the goal; remaining defenders marking on the edge of the box, level with the
wall or a metre deeper.

## 2.6 Where the engine departs from football in ways players will notice

Ranked by how soon a football-minded player would say "hang on".

| # | Engine behaviour | What real defenders do | How much it matters |
|---|---|---|---|
| 1 | Every defender is slower than every attacker, even one dribbling | Defenders are as quick as forwards. A forward with the ball is slower than a defender without it. A man through on goal from 35 m is often caught | Very high. Once the last pass is completed there is no chase. All late jeopardy has to come from the keeper |
| 2 | A marker follows his man anywhere | Passes him on after about 10 m | High. Decoys become a switch that turns a defender off |
| 3 | The back line drops as one and nobody picks up an individual runner | The nearest centre-half goes with the runner; the others adjust and cover | High in any level with two runners at different depths |
| 4 | The screen blocks the lane to the attacker nearest the goal, not the likeliest receiver | Screens the most likely next pass, judged from the passer's body and the game | Medium. Deliberate (it makes decoys work) but he can be moved off the ball side cheaply |
| 5 | Attackers run through defenders | Bodies block runs; a defender stands in the way | Medium. Most visible in crowded boxes and crossover runs |
| 6 | Nobody presses a ball held by a player who has not been played yet, and unplayed team-mates stand like statues | Everything moves all the time | Medium. It is the game's central conceit and players accept it, but it means decoy rounds are played against a frozen ball |
| 7 | Markers never go for a loose ball | Everyone goes for a loose ball in his area | Medium. A pass rolling past a marker's toes looks odd |
| 8 | The keeper has no near-post bias and only claims passes inside his six-yard area unless a sweeper | Guards the near post when the ball is wide; comes for cut-backs and low crosses in the first 8-9 m | Medium. Makes byline cut-backs and near-post finishes a little too safe |
| 9 | Offside is checked only for the next receiver, with no exception at throw-ins; decoys cannot be offside | A decoy standing offside in the keeper's line of sight is offside; no offside from a throw-in | Low to medium. Matters for E5 and any decoy run in behind |
| 10 | The ball never leaves the ground | Half the deliveries into a box are in the air | Accepted limit of a top-down game, but it removes whole families of goals (Section F) |
| 11 | The presser comes from kick-off regardless of what the ball does | Presses on a trigger | Low. Can be hidden by placement (R15) |
| 12 | No fouls | A beaten defender often brings the man down | Low. Nobody will miss it |

I could not tell from the notes whether a defender ever throws himself in front of a shot on purpose. The kick code
lets any defender within reach of a loose ball's path stop it, so shots can be blocked by a man who happens to be in
the way. Whether that happens often enough to matter is a question for the measurement team.

---

# 3. Difficulty levers, in football terms

The same scenario can be made easier or harder with these. They are ordered by how much I would trust them: the top
of the list makes a level harder in a way a player will blame on himself; the bottom makes it harder in a way he may
blame on the game. Each lever notes what the brief's instruments already suggest about whether it currently bites.

| # | Lever | Easier | Harder | What the player feels | Fairness risk |
|---|---|---|---|---|---|
| 1 | **Is the run across the offside line, and is the line holding or dropping?** | Passer is free, line drops with the runner, any start works | Passer is pressed, line holds or steps; the runner must be level at the instant of the pass | "I went half a second early. Again." The cleanest self-blame in the game | Low, if the offside marker is clear |
| 2 | **Must the pass be played into space ahead of a runner, or to feet?** | To a standing player's feet | Into a channel 10-15 m ahead, with a keeper or covering defender who collects anything overhit | The weight of the pass matters; a good one feels like a real through ball | Low. But see Section 4: at present the receiver is played afterwards and rescues bad passes |
| 3 | **How many defenders can reach the ball during this touch** | Nobody within 8 m; time to look up | A presser arriving in about a second and a screen on the obvious lane | Being hurried. "I had to know what I was doing before it arrived" | Low at one presser. Two arriving together feels like a mugging |
| 4 | **First-time or with a touch** | Receiver has 2 m and a second | Marker within 1.5 m: must aim before the ball comes and release at once | Rhythm; the satisfaction of a one-touch move | Low. The 0.47 s shield is generous enough to be fair |
| 5 | **Width and lifetime of the passing lane** | 8-10 m gap, open all the time | 4-6 m gap that exists for about a second while the block is shifting | Threading a needle; reading movement, not a picture | Medium. Below about 4 m it becomes pixel-hunting. The instruments say lanes are currently far too wide to register at all (passes can be 40-80 degrees off) |
| 6 | **Distance and angle of the finish** | Inside the posts' width, 8-10 m out, keeper still moving | 14-18 m, or from a narrow angle, keeper set | Composure; picking a corner | Medium. Beyond about 16 m central, or wide of the six-yard box, the guide's own measurements say it is a lottery or impossible |
| 7 | **Keeper: line keeper or sweeper, reaction, starting spot** | Slow reaction, stays on his line | Sweeper who wins any heavy pass; quick to set | A race; having to finish early or go round him | Low for sweeper. Faster reactions just shrink the target, which feels arbitrary |
| 8 | **Is anyone goal-side of the finisher when he shoots** | Clean through | A recovering defender within 2-3 m, so the far post is covered and the shot may be blocked | Having to finish quickly and to the right side | Low |
| 9 | **Number of touches in the chain** | 2-3 players | 4-5 players | A longer story; more to hold in the head; a mistake late costs more replay | Medium. Length is not difficulty in itself. A fifth pass that cannot fail is padding. Count only touches that carry a decision |
| 10 | **Number of decoys and how exact their runs must be** | One decoy, any run in roughly the right direction works | Two decoys whose timing must fit each other and the pass | Being the architect; seeing the picture form | Medium. Decoy rounds have no ball and no immediate feedback; if a level fails later because of a decoy run made three rounds earlier, it feels unfair |
| 11 | **Defender quality: speed, reaction, aggression** | 4.6-5.0 m/s, slow to react, patient | 5.4-5.8 m/s, quick to react, dives in | Tighter marking, less time | Medium. Invisible numbers. The player cannot see why this full-back is harder than the last one. Use in small steps and keep it consistent within a level |
| 12 | **Time on the clock** | 1.8-2 times the clean move | 1.2-1.3 times the clean move | Urgency, "last minute" drama | High if used alone. A short clock on an otherwise easy move punishes hesitation, not football. Best paired with a football reason for the hurry (a counter, a last-minute winner) |
| 13 | **Raw precision of the final shot** | Half the goal scores | A sliver of the goal scores | Frustration | High. This is the lever the existing packs leaned on, and the brief records that it did not make fixture 60 hard for a human |

Notes on using them:

- **Stack levers across rounds, not within one.** A hard level should ask one clear question of each player in the
  chain (the 6 is hurried, the 10 must play first time, the 9 must time the line), not three questions of one.
- **Prefer levers that close a window in time to levers that shrink a target in space.** Football difficulty is
  mostly "do it now", rarely "hit a coin".
- **Every hard lever needs a visible cause.** A presser you can see coming, a line you can see holding, a keeper you
  can see off his line.
- **Inference, to be tested:** the baseline's later fixtures (13, 19, 20) stack levers 1, 3 and 4 in consecutive
  rounds with a sweeper-keeper behind, on short clocks. Fixture 60 as briefed ("thread it through and let fly") ends
  in a strike, which leans on lever 13. That may be part of why one felt hard and the other did not, but I have not
  measured either and my colleagues are better placed to say.

---

# 4. What makes a goal feel earned

## 4.1 Principles the rulebook should protect

**The "that's a proper goal" list.**

1. **A defender was moved, and you can point to him.** Every good team goal has a moment where a defender is dragged,
   committed or turned, and the ball goes where he was. A level should have at least one such moment that the player
   causes.
2. **The ball arrived at the same time as the man.** Run and pass meeting on the move is the single most satisfying
   picture in the sport. A finisher who stands and waits for the ball has scored a lesser goal.
3. **It had to be done at that moment.** The window was open, and it was closing. Half a second later it would have
   been offside, blocked or smothered.
4. **Each touch made the next one easier, and a bad one would have made it harder.** The chain should feel like one
   move, not four separate tasks.
5. **The finish matched the chance.** A tap-in after a cut-back, a firm low finish when one-on-one, a first-time
   strike from the D. Not a 25 m shot when a pass was on.
6. **The defence looked like a defence and nearly stopped it.** A hand to the ball, a lunge that just misses, a line
   a foot from catching you offside. Near-misses by defenders are worth as much as the goal.
7. **You could describe it afterwards in a sentence of football.** "The nine came short, the eleven went in behind."
   If the sentence would be "I aimed left of the second dot", it was not a goal.
8. **Failure taught you something football-shaped.** Offside means go later. Intercepted means move the screen or
   play it earlier. A fail the player cannot explain is a design fault.

**What feels cheap.**

1. Scoring by a route the defence would never have allowed in life: a marker dragged 25 m, a line that waved the
   runner through.
2. A pass hit anywhere, any weight, that the next player simply runs and collects.
3. A sprint from 40 m with nobody able to chase.
4. A goal from distance through a keeper who looked as if he should have saved it.
5. Passing rounds that are a formality before one fiddly shot.
6. Decoy rounds where any run at all does the job.
7. Winning because the clock was long enough to walk it in; or losing only because it was short.
8. A failure caused by brushing against a recorded team-mate. It is a rule of the game, not of football, and should
   never be the main risk of a level.

## 4.2 The known weakness

From the brief: pass direction can be 40-80 degrees off and power almost anything; run timing has 2-4 seconds of
slack; the only tight number is the final shot. From the design guide: attackers out-run every defender. In football
terms, **the middle of the move has no jeopardy**. The game asks for a move and then marks only the finish.

Why, as far as the documents show:

- The receiver is played after the passer, by a human who can run at 7.6 m/s to wherever the ball went.
- A passing round is won if the ball survives 0.9 seconds.
- No defender can run down an attacker, so a ball that is merely "in the right half of the pitch" gets collected.
- First touches cannot go wrong.
- Lanes in the existing levels are wide and permanent.

## 4.3 Football-true ways to put jeopardy back into the middle

Proposals, in the order I would try them. The first group needs no engine change.

**Using only today's engine (level design rules)**

- **J1. Make every pass go into a window that shuts.** Place the screen so the lane exists only after the carrier has
  moved 3-5 m or only while a decoy is holding a defender. Use the line's shift so the gap between centre-halves is
  moving. Football reason: lanes are opened by movement and closed by recovery.
- **J2. Put a keeper or a covering defender behind every pass into space.** A sweeper-keeper behind a through ball,
  a zone player whose patch is 5 m beyond where the pass should stop. Then an overhit pass is collected. Football
  reason: weight of pass.
- **J3. Hurry the passer.** A presser 8-12 m away with a football trigger. The guide's rule that a through ball must
  be hit from within about 14-18 m of the line then forces a carry *towards* trouble before releasing.
- **J4. Mark the receiver so that the pass must be to his safe side.** A tight marker cuts out anything within 0.7 m
  of himself and the receiver has under half a second. The pass has to arrive on the side away from the marker and
  the receiver has to play first time. Football reason: play to the foot furthest from the defender.
- **J5. Use holding lines far more than dropping ones.** Timing of the run against a pressed passer is the one
  mid-move skill the engine already punishes sharply.
- **J6. Give the finisher company.** Start a recovering defender goal-side and a few metres off the finisher's path,
  so that although he is slower he begins closer to where the shot will be taken. The finish then has to be early.
  This replaces the missing chase with geometry.
- **J7. Shorten decoy drags to 8-10 m and add a covering defender**, so that a decoy opens a window rather than
  deleting a defender.

**Needing engine or rule changes (for the owner and the engineers to weigh)**

- **J8. Let the runner go first.** For some rounds, play the receiver's run *before* the passer's round, as decoys
  are played now. The run is then fixed, and the passer must find a moving team-mate with the right weight at the
  right moment, as in football. This is the single change that would most restore "weight of pass" and "timing of
  release" as skills, and it fits the game's own idea of playing against your earlier selves. It is also the lever
  the brief itself names ("whether a pass must be played into space ahead of a runner").
- **J9. Judge the pass in the passer's round by a football test.** Not "did it survive 0.9 seconds" but "would a
  team-mate making a sensible run reach it before any defender or the keeper, onside, within reach of his start
  position?" The keeper's logic already assumes an unplayed attacker starts running when the pass is hit; the same
  assumption could score the pass. Then the player who made the mistake is the one who sees it fail.
- **J10. Give defenders real recovery pace.** Allow a recovering defender without the ball to run at about the speed
  of an attacker with it (6.5-7 m/s) for a few seconds. A forward put through from 30 m then has someone on his
  shoulder and must finish early or shield the ball. This is the fix for cheap goal number 3.
- **J11. A first touch that depends on the pass.** A ball arriving faster than a set speed, or from behind the
  receiver's line of run, bounces 1-2 m off him and can be won in that moment. Football reason: a pass that is too
  hard or behind the runner kills the move even when it "arrives".
- **J12. A marker who hands over.** Give `mark` a leash (8-10 m from his starting slot, after which he returns).
  Football reason: R9.
- **J13. A centre-half who goes with the runner.** Already on the engine author's own list (individual tracking
  inside a line).

J8 to J11 would each change how the 20 baseline levels play. Given the owner's instruction not to lose the baseline's
feel, they should be trialled on new levels first and judged against his ratings, not switched on globally.

---

# 5. Open questions for the reconciliation

1. **Which baseline fixture took 20+ takes?** My guess from the football content is one of 13, 19 or 20 (pressed
   passers, first-time rounds, a holding line, a sweeper). It is a guess. If the owner can say, the lever list in
   Section 3 can be checked against a real case.
2. **Do the measurements agree that levers 1, 3 and 4 are where human difficulty lives?** If the instrument can
   report per-round "time available before a defender arrives" and "offside window in ticks", those two numbers
   would be the football difficulty of a round.
3. **How often are shots blocked by outfield defenders?** (Section 2.6.)
4. **Is the tackle "tell" drawn in today's build?** The engine notes said not yet at the baseline. Levers 3 and 8,
   and scenario C6, rely on the player seeing the plant.
5. **Does the owner want the true one-two (A2) and the runner-first order (J8)?** Both are engine work; both would
   add football that the present chain cannot express.
6. **Scenario ratings.** When levels are sent to the owner for rating, I would ask for two football scales alongside
   difficulty: "Did the goal look like a real goal?" and "When you failed, did you know why?", each 1 to 5.

## Sources

- `docs/foundation/00-brief.md` (owner's instruction, play reports, instrument findings)
- `baseline/tools/LEVEL_DESIGN.md`, `baseline/tools/AI_NOTES.md` (engine behaviour and measured rules)
- `one-man-team/js/sim.js` (constants, kick and offside code, fail conditions; read, not run)
- `baseline/one-man-team/js/levels/pack1-3.js` and `one-man-team/js/levels/pack4-8.js`, with `tools/PACKS_4_8.md`
- Football content: standard coaching principles of attack and defence, from my own knowledge; no outside sources
  consulted and no match data used
