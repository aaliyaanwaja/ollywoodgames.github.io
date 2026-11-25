# One-Man Team level rulebook, version 1

Wed 25 Nov 2026. Lead designer. Built on foundations 00-12, the baseline design guide and engine notes, the 20 baseline
levels and `sim.js`. Where the owner's ratings and anything else disagree, the ratings win.

---

## 1. Purpose and how to use it

The owner loved the original 20 levels. This book sets out the rules those levels followed, corrected by three rounds of his
ratings (sets A, B and C), so that new levels play the same way. It is the specification for a level generator and the
checklist for a human designer.

**Evidence tags.** Every rule carries one tag.

| Tag | Meaning |
|---|---|
| **[O]** | Owner-rated: his ratings or his words (06, 09, 12, and his verdicts) |
| **[M]** | Measured: the engine was run, or a constant read from `sim.js` (01-04, 07, 10) |
| **[F]** | Football judgement: coaching sense from the consultant (05) or from me. Untested. Change it first if a rating disagrees |

**Words.** *Must* is a hard rule: a generator rejects the level. *Should* is a target: a generator scores the level
against it and a designer needs a reason to break it.

**For a designer.** Pick a scenario (section 4). Place the defence by role (section 5). Write a bot script. Run the
checks (sections 6 and 8). Set the clock last (section 7).

**For a generator.** Follow these steps in order. (1) Pick a template from the scenario pool, using the campaign slot's
band (section 7). (2) Sample its parameters within the ranges given. (3) Place the defence with the procedure in 5.2.
(4) Run the static checks (3.3, 5.4). (5) Search for a bot route. (6) Run the dynamic checks (section 6). (7) Fit the
clock to the band. (8) Reject the level or keep it. Free composition of phases outside the templates is not allowed in
version 1 [F].

**The five ideas behind the book**

1. The jeopardy belongs in the middle of the move: interceptions, hurried first touches, offside on the run. When the
   owner rates a level fair 5, it means he failed there and knew why [O].
2. The final ball goes to a runner who has to time a holding line, and he then runs on goal [O].
3. Every defender stands and moves where a real defender would [O].
4. A decoy may open a window. It may not delete a defender [O].
5. The clock sets the difficulty. The structure sets the fun [O].

---

## 2. Pitch, units and engine facts

### 2.1 Pitch [M]

| Item | Value |
|---|---|
| Units | metres; 60 ticks a second |
| Pitch shown | x 0-50 across, y 0-60; goal line at y 0; attack runs towards smaller y |
| Goal | x 21-29 (8 m), centre (25, 0) |
| Penalty area | x 8-42, y 0-16.5; penalty spot about (25, 11) |
| Keeper's claim zone, ordinary | |x - 25| ≤ 10, y ≤ 6.5 |
| Keeper's claim zone, sweeper | |x - 25| ≤ 17, y ≤ 16.5 (the box) |
| Start area for everyone | x 3-47, y 4-57 |

### 2.2 Movement [M]

| Who | Speed |
|---|---|
| Attacker without the ball | 7.6 m/s; reaches top speed in about 0.2 s |
| Attacker with the ball | 6.5 m/s |
| Attacker aiming (charging a kick) | 60% of the above: 3.9 m/s with the ball |
| Defender | his `spd`, default 5.2, engine cap 5.8; reaches top speed in about 0.35 s |
| Defender sprinting back (option A, below) | `spd` + 1.3, never above 7.0 |

No defender catches an attacker running away from him, except in an A recovery sprint against a dribbler (for example
6.6 against 6.5). Pressure has to come from someone who is already goal-side.

### 2.3 The ball [M]

| Item | Value |
|---|---|
| Pass speed | 9-28 m/s by power. Full charge takes 0.7 s |
| Pass roll | about 11 m at zero power to 35 m at full; slow over its last third |
| Shot (any kick by the last ball player) | 17-34 m/s, and it holds its pace (friction 0.28 against 0.8) |
| Who can collect | only the next ball player in `order`, within 1.35 m, from 6 ticks after the kick |
| Pass accepted | the passer's round is won 54 ticks (0.9 s) after the kick. Anything after that happens in the next round |
| Through-ball reach through a 9 m gap | power 1 gets through from up to 18 m in front of the line; 0.8 from 14 m; 0.6 from 12 m. From 20 m or more a centre-half always cuts it out |

### 2.4 Contests [M]

| Mechanic | Numbers |
|---|---|
| First-touch shield | the ball cannot be won for 20 ticks after control. The earliest a receiver can lose it is about 0.47 s |
| Tackle trigger | ball inside lunge range 1.5 + 0.6 × `agg` (1.8 m by default) for 24 × (1 - `agg`) ticks (0.2 s by default), or at once if the ball is run straight at him |
| Tackle tell | a 12-tick plant (0.2 s). On tick 4 he fixes the spot. The leg then goes out for 7 ticks, reaching 1.3 m plus a 0.55 m foot |
| Beating the tackle | change direction after tick 4 of the plant and he misses and is down for 34 ticks (0.57 s). Stand still or run straight and he wins it. A pass during the plant makes him stand down |
| Body | a ball dribbled within 0.5 m of a set defender (slower than 3 m/s) is lost |
| Interceptions | `zone`, `press` and `line` players read a pass 12 ticks after it is hit and go only if they can stand on its path at 90% pace within their `eng`. At most two go, one per line unit. They win it within 0.85 m. They collect a ball that dies within 1.5 × `eng` of them |
| Markers and loose balls | a marker never leaves his man for a loose ball. He wins a pass only within 0.7 m |
| Bump | the live player within 0.85 m of a recorded team-mate fails |
| Fail codes | tackled, intercepted, saved, smothered, keeper (pass claimed), wide, early (goal before the last player), out, offside, bump, time |

### 2.5 Offside [M]

- Checked when the pass is hit, and only for a receiver who has already been played. So an offside run shows up in the
  receiver's own round, never in the passer's.
- The receiver is off if he is more than 0.6 m beyond **both** the ball and the second-deepest of all defenders plus
  the keeper. Markers and screens count as well as the back line.
- Decoys are never offside. Players who have not been played yet stand still on their start spots.

### 2.6 Defender behaviour [M]

| Type | Default fields | Behaviour |
|---|---|---|
| `line` | `eng` 8; unit settings `gap` 13, `floor` 15, `step` 3 | One height per unit, spacing at 92% of the designed width. Shifts 0.4 m for each metre the ball is off the unit's centre, at most 8 m. Drops to keep `gap` off a free ball, at 85% of its slowest man, down to `floor`. **Holds** and squeezes back to `gap` - 4 when any defender is within 3 m of the carrier. **Steps** up to `step` above home when the ball goes backwards faster than 2 m/s. Goes back with a runner who sprints within 5 m in front of it while the ball is free. The man whose slot the ball comes within `eng` of steps out; his neighbours tuck in 40% and drop 1.5 m. Once played through, everyone recovers to 3 m goal-side of the ball |
| `zone` | `eng` 7, `leash` 14, `screen` 5 | Holds home and shifts 25% across (at most 5 m) and 12% up or down (at most 3 m). Stands on the lane to the receiver ahead of the ball who is nearest the goal, within `screen` of him: half a step on while the carrier moves, fully on once the carrier slows below 4.55 m/s for 6 ticks. Presses inside `eng` |
| `press` | `eng` 16, no leash | A `zone` that hunts from kick-off |
| `mark` | `eng` 3.5, `react` 18, `tight` 1 | Goal-side and ball-side of his man, 1.3 m off when the ball is within 6 m, up to 3.0 m when it is 24 m away (× `tight`). Sees his man `react` ticks late. **Follows his man without limit** (see 5.3) |
| Pressing | | One first defender closes, slows inside 3 m and jockeys 1.4 m goal-side. One zone player covers 5 m goal-side. The rest keep shape |

### 2.7 Keeper [M]

| Item | Value |
|---|---|
| Position | on the line from the ball to the anchor point (see B), 1.2-3 m off his line (3 m once the ball is within 14 m) |
| One-on-one | carrier inside 18 m with no defender within 3.5 m goal-side: he comes out to 0.45 × distance, at most 5 m (7 m for a sweeper), and stops 3.2 m short. He never back-pedals |
| Smother | a ball dribbled within 2.6 m of him |
| Sets | when the carrier slows to aim inside 24 m |
| Shot | waits `gk.react` ticks (13; +5 if he was moving), then dives at 4.7 m/s. Saves within 0.8 m of him, 1.2 m at full stretch |
| Claims a pass | inside his zone, if he gets there 0.15 s before any attacker. Unplayed attackers are assumed to run when the pass is hit |
| Fact that matters | a full-power shot from 10 m passes him before his reaction ends, so at 10 m he is a statue (about 4.8 m of goal open). From the owner's range of 15-21 m he leaves 1-4 m |

### 2.8 The standard engine: options A and B [O: approved 25 Nov]

The owner rated A and B in set C (small gains, nothing worse, the clearest win on Third-man run) and approved both:
"Yes, do both. Remember to keep the earlier levels easy though."

| Option | Engine fields (on / off) | What it does |
|---|---|---|
| **A, through on goal** | `recSpd: 7.0, dangerR: 24` / `recSpd: 0, dangerR: 0` | When the carrier has no outfield defender on his feet goal-side within 5 m of his line to goal: (1) inside 32 m of goal, defenders running back towards their goal sprint at `spd` + 1.3, capped at 7.0. (2) Inside 24 m, any back-line man within 12 m of the ball may go to him, wherever his slot is. Measured: a striker standing on the ball at 18 m is caught in 0.75-1.0 s (before A: never, 1.25 s, 0.75 s on B10, B13, B18) [M] |
| **B, keeper covers his near post** | `gkBisect: 1, gkNear: 0.2` / `gkBisect: 0, gkNear: 0` | While someone has the ball, the keeper's anchor is where the bisector of the posts' angle meets the goal line, shaded 20% towards the near post once the ball is 6 m or more off centre. From 17-21 m the near post is 0-0.5 m open and the far corner 1.1-2.2 m [M] |

**Ramp rule [O].** Fixtures 1-4: both off. Fixtures 5-8: B only. Fixture 9 onwards: A and B. The engine default is both on,
so the opening levels override (see 3.1, `engine`).

Under A+B, 72 of the 80 existing bot routes still score. The eight that break all re-script in the finisher's round alone
(B5, B11, 5, 11, 25, 49, 56, 60) [M]. Any level that carries over from the old packs needs its bot re-run.

### 2.9 Finishing from the owner's range [M]

He shoots from 11-21 m (set B), not the 10 m the bots use. Metres of the 8 m goal that a set keeper leaves to a
full-power shot:

| From | Today | With B (near / far) |
|---|---|---|
| 15 m, 20° off centre | 3.9 | 4.2 (1.3 / 2.9) |
| 17 m, 20° | 2.6 | 2.7 (0.5 / 2.2) |
| 19 m, 20° | 1.8 | 2.0 (0.2 / 1.8) |
| 21 m, 20° | 0.9 | 1.3 (0.0 / 1.3) |
| 17 m, central | 2.8 (4.2 if he is still moving) | same |

---

## 3. Anatomy of a level

### 3.1 Fields and allowed ranges

| Field | Allowed | Notes |
|---|---|---|
| `name` | short football phrase, unique in the campaign | [F] |
| `time` | whole seconds, 7-14; set by section 7 | [M] the baseline range |
| `brief` | under 110 characters | [M] stated rule |
| `att[]` | `{ num, name, x, y, role: 'ball' or 'decoy', tip }` | `tip` under 120 characters. Use the keyword phrases the human model reads: "first time", "aim early", "wait", "as the N plays it" [M] |
| `order` | every index in `att` once. 2-5 ball players; 0-1 decoys | [O] no double decoy |
| `def[]` | `{ t, x, y, spd, eng, agg, react, a, tight, screen, leash, unit }` | ranges by role in section 5 |
| `gk` | `{ sweeper, react, x, y }`; default is a line keeper, `react` 13 | `react` 16-22 only in fixtures 1-3. It changes nothing at 10 m [M] |
| `lines` | `{ <unit>: { gap, floor, step } }` | `gap` 8-13, `floor` 15 (12-15 only if the ball starts within 35 m of goal), `step` 3 |
| `engine` | `{ recSpd, dangerR, gkBisect, gkNear }`, optional | New field (being added to the live engine). Default when absent: A+B on = `{ recSpd: 7.0, dangerR: 24, gkBisect: 1, gkNear: 0.2 }`. The options apply while this level is played. Fixtures 1-4 must carry `{ recSpd: 0, dangerR: 0, gkBisect: 0, gkNear: 0 }`; fixtures 5-8 must carry `{ recSpd: 0, dangerR: 0 }`. Other values are reserved for rating builds [O] |

### 3.2 Defender field ranges (outside the tutorial)

| Field | Range | Evidence |
|---|---|---|
| `spd` | 5.0-5.7 (tutorial 4.0-5.0). Members of one back-line unit within 0.1 of each other | [M] baseline 5-20; [F] uniform unit |
| `eng` | `line` 5-8, `zone` 5-7, `press` default, `mark` 3.5-6 | [M] |
| `agg` | 0.3-0.8 (default 0.5) | [F] keep the tell readable |
| `react` | `mark` 10-26 (default 18); others default | [M] baseline |
| `tight` | `mark` 0.8-1.3 | [M] |
| `leash` | `zone` 14 (default) or 8-14; never below 8 outside fixtures 1-4 | [O] no pinned spot-defenders |

### 3.3 Hard validity rules (static: a generator checks these before any simulation)

| # | Rule | Tag |
|---|---|---|
| V1 | Everyone starts inside x 3-47, y 4-57 | [M] |
| V2 | Attackers are at least 3 m apart; defenders at least 3 m apart | [M] / [F] |
| V3 | No defender within 4 m of the ball at kick-off; no `press` within 6.5 m | [M] / [F] |
| V4 | Nobody starts offside: every attacker is behind the ball, or at least 0.6 m onside of the second-deepest defender or keeper | [M] |
| V5 | 2-5 ball players; at most 1 decoy | [O] |
| V6 | The first ball player starts 44-56 m from goal centre (fixtures 1-4: 46-50 m) | [M] 19 of 20 baseline levels |
| V7 | Every defender passes the role test (5.4) | [O] |
| V8 | A decoy is played no more than one round before the ball player whose pass uses his space | [F] avoids a fail caused three rounds earlier |
| V9 | `brief` and `tip` lengths; the brief names the idea in football words | [M] |
| V10 | `engine` matches the ramp rule for the level's campaign slot | [O] |
| V11 | Fixtures 5 and later have a back-line unit (`line`, 2-5 men) | [M] true of all baseline 5-20 |

---

## 4. Scenario library

### 4.1 Phases (the building blocks)

Every template is a fixed string of phases. The numbers come from the baseline levels unless marked otherwise. `yL` is the
back line's start height and "onside by d" means d metres further from goal than the offside line.

| Phase | What happens | Geometry and numbers | Where the jeopardy sits |
|---|---|---|---|
| **E** Escape | A passer under a hunter plays it short and sideways or back | Passer 50-56 m out; `press` 6.5-10 m away, goal-side; receiver 8-14 m away to feet, level with or behind the ball | Passer's spare time 0.05-1.7 s; second-round interception [M] |
| **F** Feed | A firm pass into a marked creator or target, past a screen | Pass 5-13 m; screen on the direct lane; passer must step 2-4 m sideways to open the angle | Lane ≤ 2 m; screen interception [M] |
| **O** One touch | The marked receiver plays first time | Marker 2-3 m goal-side, `spd` 5.3-5.5 | Spare ≤ 0.6 s at reception; tackled if he takes a touch [M] |
| **B** Back | A backward pass that makes the line step up | Ball moving away from goal faster than 2 m/s; line `gap` 8-9 | Sets the trap for R [M] |
| **S** Switch | A long pass (24-31 m) behind the far side of a block shifted to the ball | Line shifted 5-8 m to the ball side; passer within 18 m of the line; far runner 2-5 m onside | Power and aim windows of 5-9° and 6-13% [M] |
| **C** Commit | Carry at a line member until he steps out, then release before his lunge | 2-man line about 10 m apart; release within his plant | Tackle tell; a release that is too early or too late [M] / [F] |
| **R** Release | Final forward pass to a runner against a holding line | Passer pressed (defender within 3 m) or line stepping; runner starts onside by 2-8 m and 3-18 m sideways of the gap; centre-half gap 8-11 m | Offside, margin 0.3-5 m; interception in the gap [O] |
| **X** Run and finish | The runner controls 14-30 m out, carries, shoots | A+B on; owner shoots from 12-21 m | Caught within about 1 s if he stops; far corner only [O] / [M] |
| **K** Cut-back | Byline pull-back to the penalty-spot area | Control 11-14 m out, first time | A block, or the late runner arriving early [M] |

### 4.2 Ranking by the owner's evidence

Fun scores from sets A / B / C (the different versions listed). Takes are first plays.

| Tier | Template | Phases | Owner evidence | Pool weight |
|---|---|---|---|---|
| 1 | Five-man move (19) | E E F O R X | fun 4 / 5 / 4,4,4; fair 5 every time; 15, 20, 8 takes; challenge 4 | 3 |
| 1 | Beat the trap (13) | E B F O R X | fun 5 / 4 / 4,4,5; fair 5; 13 takes | 3 |
| 1 | Third-man run (10) | E F O(=R) X | fun 5 / 3 / 5 with A+B; with A+B: 12 takes, all at the finish | 3 |
| 1 | Switch of play (5) | E S X | fun 5 (set A only) | 3 |
| 2 | Diagonal in behind (9) | E F S X | fun 4 / 4,4; fair 5; 12-15 takes. Long pass on a short clock | 2 |
| 2 | Play through the press (15) | E E(first time) C R X | fun 4; 5 takes | 2 |
| 2 | The counter (11) | E C R X | fun 4 | 2 |
| 2 | False nine (18), one decoy | E decoy O R X | fun 4, then 3 once learned (1 take) | 1 |
| 2 | Wing and cut-back (3, 7) | E (decoy) R K | fun 4, 4. No offside call on the last ball | 2; no cap on frequency (owner, 25 Nov: "use them freely") |
| 3 | Through ball (2), Lay-off (6), Overlap (8), Push them back (12) | | fun 3: his least fun | 0. Tutorial only for Through ball |
| 2 | Sweeper-keeper (16) | | fun 3 once; the owner chose to keep it as is (25 Nov) | 1 |
| Banned | Any double decoy: Clear the channel (14), Far post (17), today's 60 | | "The double decoy is always the least fun because it's the easiest to create space" | 0 |
| 1 | Bend the run (C2) | | Set D: fun 5, fair 5, real football 5, 10 takes | 3 |
| 2 | Up, back and through (A4); Short then long (A7); Commit the centre-half (C6); Ball inside the full-back (B4) | | Set D: fun 4, fair 4-5, real football 4. Commit the centre-half took 1 take: shorten its clock | 2 |

What the tier-1 templates share [O/M]: a hunter or screen forcing the early passes; 4-5 ball players; a final pass to a
runner timing a holding line (onside by 0.3-3.6 m); then a long run on goal (control 24-27 m out, carry 14-17 m). What the
fun-3 group shares: no hunter, few takes (≤ 3), and a last pass that has no offside decision or is to feet.

### 4.3 Tier 1 and 2 templates

Coordinates are for the right-footed or left-sided version as in the baseline. Every template may be mirrored
(x → 50 - x) [F]. "Vary" lists what a generator may sample. Everything else is fixed as stated.

**T1 Five-man move** (baseline 19; clock 12 s, bot 7.6 s)
- Attackers: 4 centre-back (19, 55); 6 pivot (32, 51); 8 link (17, 42); 10 creator (21.5, 36); 7 winger, the finisher (38, 31.5).
- Defence: `press` (20, 46) `spd` 5.5 on the 4; screen `zone` (36, 40) `eng` 5; `mark` on the 10 at (21.8, 33.6) `spd` 5.4;
  back four `yL` 27, x 9/20/30/41, `spd` 5.3, `gap` 9.
- Jeopardy: the 6 plays first time under the hunter; the 8's pass lane is about 1.4 m; the 10 plays first time with a
  marker on him; the 7's run has a 0.03 s late edge (owner: offside 7 and 9 times).
- Vary: `yL` 24-30; `gap` 8-10; press distance 7-10 m; speeds 5.2-5.6; creator 8-10 m onside of the line; finisher 3-6 m
  onside and 12-18 m sideways from the creator; marker `react` 14-22.

**T2 Beat the trap** (13; 12 s, bot 7.5 s)
- Attackers: 3 left-back (9, 44); 6 pivot (23, 51), behind the ball; 10 creator (25, 41); 9 striker (31, 39.5).
- Defence: `press` (12, 38) on the 3; screen `zone` (21, 44); `mark` on the 10 at (25, 38.6) `spd` 5.3; high back four
  `yL` 32, x 8/19.5/30.5/42, `spd` 5.3, `gap` 8.
- Jeopardy: the back pass B steps the line up; the 6 into the 10 (owner: intercepted 6 times); the 9 has to cross the
  line as the 10 plays it (offside margin 0.3 m).
- Vary: `yL` 28-33; `gap` 8-9; press distance 6.5-9 m; striker 6-9 m onside; sides.

**T3 Third-man run** (10; 10 s, bot 6.1 s)
- Attackers: 5 centre-back (20, 55); 6 holder (34, 46); 9 target man (25, 28); 11 third man (9, 30).
- Defence: screen `zone` (20, 41) on the direct lane to the 9; `mark` on the 9 at (25, 25.6) `spd` 5.4 `eng` 6. That is
  the centre of a back three, who follows the 9 short and leaves the hole. The other two are a `line` at y 25,
  x 12 and 38.
- Jeopardy: the 9's first-time flick (lane 1.1 m, nearest defender 0.3 m at reception); the 11 must go before the 9
  touches it (onside by 3.4 m). With A+B the finish is what decides it (owner: fun 5).
- Vary: target 3-5 m onside; third man 12-18 m sideways and 3-6 m onside; marker `react` 14-22, `tight` 0.8-1.0;
  the outside line men 24-28 m apart.

**T4 Switch of play** (5; 10 s, bot 6.0 s)
- Attackers: 2 right-back (41, 45); 6 pivot (27, 44); 11 far winger (8, 30).
- Defence: `press` (37, 38) on the 2; screen `zone` (29, 35); back three `yL` 27, x 22/31/40 (already shifted 6 m to the
  ball side), `spd` 5.3. The far winger is free on purpose: the block has slid across [F, R4 in 05].
- Jeopardy: the 2 and the 6 both under the press (spare 1.55 and 1.75 s); the diagonal (aim 9°, power 13%); the
  winger's run (0.7 s window, onside by 3.6 m).
- Vary: 3-4 men in the line, shifted 5-8 m; the pivot passes from no more than 18 m in front of the line; winger x 5-10,
  2-5 m onside.

**T5 Diagonal in behind** (9; 10 s, bot 6.4 s). Like T4, but the passer starts deep. 4 centre-back (30, 54) under a
`press` 8 m away → 8 playmaker (15, 44), screened by a `zone` (14, 36) → 28 m diagonal to the 7 (41, 28.5) behind a back
four squeezed to the left (`yL` 26, x 5/13/21/29). Hard band only: owner 12 and 15 takes, fair 5.

**T6 Play through the press** (15; 10 s). 4 (19, 55) and 6 (32, 51) each have their own `press` (start 9 m and 8 m away, so
they arrive at different moments [F]); 8 link (17, 42) carries at the back four (`yL` 27) and slides the 9 (28, 30) through.

**T7 The counter** (11; 11 s). 6 ball-winner (20, 53) with two `press` men 8-9 m away; 10 carrier (26, 42) drives at a
2-man line (`yL` 27, 10 m apart) until one steps out (C), then slips the 7 (41, 41). Last-pass margin about 0.5 m.

**T8 False nine** (18). One decoy 9 drops at most 10 m (see 5.3); his marker follows; the 8 plays first time into the hole
for the 11. The rules on decoys in 6 (J5) apply in full.

**T9 Wing and cut-back** (3, 7). The winger beats his full-back to the byline and pulls it back to 11-14 m; the late runner
finishes first time. No live offside on the last ball, so it is exempt from J3; the owner wants cut-backs used freely.

---

## 5. Defending rules

### 5.1 Roles

Each defender gets exactly one role, and the role fixes where he may stand.

| Role | Type | Count | Placement at kick-off | Tag |
|---|---|---|---|---|
| Back line | `line`, one unit | 2-5 (2 in a counter or when a third back is marking) | Height `yL` 18-33 in open play and at least 12 m goal-side of the ball. Adjacent spacing 8-11.5 m (centre-halves 9-11). A 2-man line may be 24-28 m apart only if a `mark` from the same back three starts between them. Unit centre within 8 m of x 25. If it is off centre, it is shifted towards the side where the ball is, or where it is about to be played (for the switch templates, towards the switch passer) | [M] / [F] |
| Line height by block | | | High 28-33 (use `gap` 8-9; trap levels). Medium 22-28 (default). Low 16-21 (no space in behind; ends in K or a strike) | [F] R5 |
| Screen | `zone` | 0-2 | 6-16 m in front of `yL`; within 12 m sideways of the line centre; his home within 6 m of a straight lane from a ball player's start to a later ball player's start | [M] / [F] |
| Hunter | `press` | 0-2, starting on different passers | 6.5-12 m from the passer he hunts, no more than 3 m behind the ball's y | [M] 6.7-9 m in the baseline |
| Man-marker | `mark` | at most 2 in open play | 1.5-3.5 m from his man, goal-side (nearer the goal centre than his man). His man is a centre-forward, creator, target man or winger who receives before the final pass, the one decoy, or the finisher only when the idea is losing your marker | [F] R10 |
| Full-back on a winger | `mark` on the winger, or the end man of the line | 0-1 a side | 2-3 m goal-side of the winger | [M] |
| Keeper | `gk` | 1 | Default. `sweeper` only behind a high line (`yL` ≥ 28), where a real keeper would sweep | [O] kept by the owner (25 Nov) despite fun-3 ratings |

### 5.2 Placement procedure (generator)

1. Choose `yL` from the template and block, then place the line members by spacing, shifted to the ball side.
2. Put markers on their named men: goal-side, `tight` × 2-3 m.
3. Put each screen on the lane he guards, 6-16 m in front of the line.
4. Put each hunter on his passer, 6.5-12 m away, goal-side.
5. Choose speeds from the band (section 7): one value for the line unit, with markers and hunters within ±0.3 of it.
6. Run the role test.

### 5.3 Decoys and markers [O]

- **At most one decoy per level** [O]. When the owner gave his "double decoy" verdict, the set-C fixture that had one
  (today's 60) got its space from two markers dragged wide.
- **Leash rule.** In football a centre-half passes a forward on after about 10 m [F]. The owner approved a marker leash in
  the engine (25 Nov). It is in: `markLeash` 10 m, off for fixtures 1-8; a runner going in behind is always followed. These tests still run as a check:
  - The decoy's designed run is 10 m or less.
  - On the bot's route, his marker moves no more than 12 m from home [M-check].
  - **Truncation test**: replay the move with the decoy's recording frozen at the tick his marker has moved 10 m from
    home. The bot's route must still score.
- **Needed test**: with the decoy standing still and pressing DONE, the bot's route must fail. A decoy that changes nothing
  is padding [M: 4 and 12 in the baseline].
- **Not sufficient**: see J5 in section 6.

### 5.4 The role test, and what is banned

Every defender must pass all of these. Any failure means the level is rejected [O, unless marked].

1. He has a role from 5.1, and his start position meets that role's placement rule.
2. No defender's home is inside the penalty area (y < 16.5) unless he is (a) a back-line member and the ball starts within
   35 m of goal, or (b) marking an attacker who starts in the box. **The owner's case: no defender parked on the penalty
   spot.**
3. No `zone` has `leash` below 8 outside fixtures 1-4. That would pin him to a spot.
4. Nobody stands deeper than the back line except a marker following his man, or the keeper.
5. No defender stands only to block a spot or a lane that no attacker uses. Each screen must have a live lane (5.1).
6. Speed differences inside one unit are 0.1 m/s or less [F]: the player cannot see speeds, so a single quicker
   full-back feels arbitrary.
7. At least as many outfield defenders as attackers minus one, except in a counter [F, R1].

**Banned outright:** a defender on a spot, double decoys, a marker who has to be dragged more than 12 m for the move to
work, a sweeper behind a medium or low line, defender `spd` above 5.7 [M: engine cap 5.8].

---

## 6. Jeopardy and fun rules

Measured on two kinds of route:

- **Bot route**: the level's bot script.
- **Player routes**: `tools/human/run.js`, owner profile, 30 runs.

The human model only gives rough bands. It underrates the owner's hardest levels (9, 19, 20) by 2-3 times, so no rule
rests on it alone [O/M].

| # | Rule (every level from fixture 5 on) | How it is measured | Pass | Tag |
|---|---|---|---|---|
| J1 | **A tight middle touch.** At least one ball round before the last has real pressure | Bot route: the narrowest pass lane (closest defender on his feet to the ball in flight) is ≤ 2.0 m, or a receiver has a defender within 3.5 m in the 0.47 s after control | ≥ 1 such touch; ≥ 2 in the hard band | [O] fair 5 = failing in the middle; [M] lanes 0.9-1.8 m in 13-20 against 4.3-4.9 m in the easy later levels |
| J2 | **Tight knobs, but not pixel-hunting** | Tolerance windows (aim turned about the kick spot, `aim3.js` method), with the whole move required to score: pass aim < 15°, power < 25% of the bar, run timing < 1 s, before the finish | Count by band: standard 1-3, hard 3-5, last-minute 2-4. No pass aim window below 3° | [M] 13-20 median 3; 18's 1° window cost 4 takes |
| J3 | **An offside decision on the final run** | Bot route: the final receiver is ahead of the ball when it is played, onside by 0.3-5 m, and the finisher's run-timing window is 0.3-2.5 s wide. It should also be true that at the kick a defender is within 3 m of the passer, or the line is stepping, so the line holds | Must (margin and window), except T9 (1 level in 5) | [O] fun 5 had margins 0.3-3.6 m, fun 3 had 9.2 m; his second-largest failure cause |
| J4 | **A finish under pressure, after a run** | (a) The finisher takes control 14-32 m from goal. (b) Owner-style probe (`defending/finish.js`): dribble straight to 18 m and stand. A defender wins it within 1.0 s, and within 2.5 s of control if he never shoots | Both | [O] corner time fell with A+B; [O] fun 5 kept a long run; [M] probe |
| J5 | **No space made only by decoys** | At most one decoy; the needed, truncation and drag tests (5.3) pass; bot route: a defender on his feet comes within 6.5 m of the finisher in the 0.47 s after he controls the final pass | All | [O] double-decoy verdict; [M] baseline 13-20 at most 6 m; in 60 two dragged markers left the finisher 3.8 s on the ball |
| J6 | **A hunter or screen forces the early passes** | Bot route: one of the first two ball rounds has a spare time (how long he can stand on the ball before his round fails) of 1.7 s or less, or a `zone` stands within 3 m of the straight lane from the first passer to the F-phase receiver, so the ball has to go round | Must | [O] 2 of 3 fun-5 levels had a hunter, 0 of 5 fun-3; [M] |
| J7 | **No passenger rounds** | Each ball round has a spare time ≤ 3 s, or a window edge (aim < 40°, power < 50% or timing < 2 s) | Must | [F] lever 9 in 05; [M] |
| J8 | **Failures are football failures** | Player routes, all failures: bump ≤ 5%, out ≤ 10%, early 0 | Must | [F] cheap item 8 in 05 |
| J9 | **Failures land in the middle** | Player routes: share of failures before the last player | 0.3-0.7 (supporting check: it cannot reject a level alone) | [O/M] fair 5: 0.39 against 0.10 |
| J10 | **The finish is not a lottery** | Bot route at its shot: ≥ 1 m of goal open. No level's difficulty may rest on a long shot (bot shoots beyond 16 m with < 2 m open) | Must | [M] 53-60 put difficulty in a shot people do not take |

Fixtures 1-4 are exempt from J1-J6 and J9. Each of them teaches one mechanic [M: pack 1, fun 4 except Through ball].

---

## 7. Difficulty

### 7.1 Dials, in order of preference

| Order | Dial | Effect | Tag |
|---|---|---|---|
| 1 | **Clock slack** (clock minus the bot's move time) | Two extra seconds halved his takes on 9 (15 → 7) and took 20 from 6 takes to 1. Fun did not move | [O] |
| 2 | **Defender speed** (whole level, steps of 0.1-0.2) | The strongest measured partner of his takes with fixture number held fixed (+0.53) | [M] |
| 3 | **Number of ball players** (3 → 5) | More rounds carrying a decision | [M] |
| 4 | **Tightness of the middle** (J1-J2 counts, lane width, hunter distance) | Must stay inside J1-J2 | [M] |
| 5 | **Offside margin on the release** (smaller = harder) | 19's run, with margins under 5 m, was his most failed round | [O] |
| — | Not dials: keeper `react`, shot precision or long shots, the sweeper, extra decoys, pinned defenders | Do nothing at 10 m, make the game feel unfair, or rated low fun | [M] / [O] |

Structure (sections 4-6) is what makes a level fun. Do not make an easy level by removing jeopardy: make it easy with the
clock [O].

### 7.2 Bands for a practised player

The owner learns fast: 13 went 13 → 6 → 2 takes over three plays [O]. Targets are for his **first play** of a new level.

| Band | First-play takes | Challenge | Slack s | Bot / clock | Defender speed mean | Ball players |
|---|---|---|---|---|---|---|
| Tutorial | 1-2 | 3 | 6-8 | 0.35-0.55 | 4.0-5.0 | 2-3 |
| Standard | 3-6 | 3 | 3.8-4.8 | 0.58-0.66 | 5.1-5.3 | 3-4 |
| Hard | 6-12 | 3-4 | 2.8-3.8 | 0.64-0.72 | 5.3-5.5 | 4-5 |
| Last-minute | 8-15 | 4 | 1.8-2.8 | 0.70-0.78 | 5.4-5.6 | 3-4 |

The basis [O/M]: 20 at 1.8 s slack took 14, then 6; at 3.8 s it took 1. 9 at 3.6 s took 12 and 15; at 5.6 s it took 7.
19 at 4.4 s took 15, 20 and 8. The bot's share of the clock must never be above 0.80 [M]. A long pass from deep on a
short clock is the strongest hard-band combination [O: 9, 20]. Human-model cross-check (owner profile median, a band only):
tutorial 1-2, standard 2-5, hard 4+.

**Setting the clock:** clock = ceil(bot time + slack), using the slack from the band, then check the ratio.

### 7.3 Campaign ramp

| Fixtures | Band | Engine | Templates | Defenders |
|---|---|---|---|---|
| 1-4 | Tutorial | both off | First pass, Through ball, Down the wing, The decoy (one idea each) | 1-2 |
| 5-8 | Standard | B only | Tier 1-2; at least two from tier 1 | 4-6 |
| 9-14 | Standard → hard | A+B | Tier 1-2 | 5-7 |
| 15-20 | Hard, with one last-minute level | A+B | at least three from tier 1 | 6-7 |
| 21+ | Repeat the 5-20 pattern | A+B | as above | as above |

Each repeat of the pattern raises the speed band by 0.1 (to a maximum of 5.7) and lowers the slack band by 0.3 s (to a
minimum of 1.8 s) [F]. Every fourth level is one band easier, as a breather [F].

**Variety** [F]. No template twice in any 3 levels in a row. Alternate the attacking side (mirror). Vary who finishes
(winger, striker, third man). No two consecutive levels in the same band of `yL`.

---

## 8. Acceptance tests

### 8.1 Automatic (all must pass)

| # | Check | Tool |
|---|---|---|
| A1 | Static validity V1-V11 and the role test 5.4 | generator |
| A2 | BEATEN, and the full replay scores, under the level's `engine` options | `node tools/test.js` |
| A3 | Jitter: every round ≥ 45% | `tools/test.js --jitter` [M: baseline low 45%] |
| A4 | J1-J8 and J10 pass; J9 is inside its band, or the level is flagged for a human look | forensics scripts (`dwell.js`, `aim3.js`, `windows2.js`, `finish.js`), `defending/finish.js` |
| A5 | Decoy tests: needed, truncation, drag ≤ 12 m | generator plus engine |
| A6 | Player routes: the owner profile clears in ≥ 90% of runs within 60 takes; median takes inside the band's model range | `tools/human/run.js --root` |
| A7 | Bot time / clock inside the band and ≤ 0.80 | generator |
| A8 | Determinism: the replay is identical; `ai-scenarios.js` passes | existing tools |

### 8.2 Human (the owner)

- Rating build as in sets A-C: blind neutral names, shuffled order, first play, no help, fail codes and shot distance logged.
- Scales: challenge 1-5, fun 1-5, fair 1-5, corner time 1-5.
- **Targets per level: fun ≥ 4, fair ≥ 4, challenge 3-4, corner time ≤ 3** [O].
- Rate every generated level until 20 have been rated, then 1 in 5.
- Any level rated fun ≤ 3: halve its template's pool weight and find out why.
- A template with two fun-3 ratings leaves the pool.
- Where a rating contradicts a rule, the rating wins and the book gets a new version.

---

## 9. Owner decisions, 25 Nov 2026

1. Earlier levels easy: yes, with A and B off for 1-4 and B only for 5-8.
2. Marker leash: add it to the engine.
3. Sweeper-keeper: keep it as is.
4. Cut-backs: use them freely; the 1-in-5 cap is gone. The offside-call rule (section 6) does not apply to a cut-back ending.
5. Trial templates: build a blind set for him to rate before any joins the pool.
6. Difficulty targets: "That should be fine but use your judgment based on what we've learnt." Settled as below,
   all measured as the owner's takes on his first play of a level:

| Where in the campaign | Takes | Why |
|---|---|---|
| Fixtures 1-4 | 1-2 | Learning the controls; he found the old opening too hard twice |
| Ordinary levels | 3-8 | Every fun-3 rating except one came at 3 takes or fewer; in sets A and B, fair 5 only ever came at 5 takes or more (set C, all replays, was fair 5 throughout) |
| One closing level per season | 8-15 | Five-man move took 15 and 20 takes and was rated fun 5 and fair 5 both times; challenge never went above 4 |
| Never | 1 take after fixture 4 | Levels he cleared first time drew fun 3-4 and challenge 2-3 |

   He is now an expert, and new players will need more takes than he does. So the human model's novice tier is a second
   check on fixtures 1-20: no level there should leave more than a quarter of simulated novices without a clear within
   30 takes. Difficulty within a band is set with the clock first.
