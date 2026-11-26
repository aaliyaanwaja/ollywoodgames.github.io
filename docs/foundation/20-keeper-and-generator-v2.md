# Foundations 20: the keeper collects, and generator version 2

Written by the engine and generator engineer, Thu 26 Nov 2026, after the owner's set E ratings (19-owner-ratings-set-E.md).
Two jobs: the keeper (the owner's one complaint about set E) and the generator (what set E showed about it).

## Part 1: the keeper comes out for a slow ball

The owner: "The only time it didn't feel like real football was when the ball trickled towards the keeper and the keeper
didn't come out to collect it."

### What was wrong

Before this change the keeper did three things with a loose ball (`thinkKeeper` in `sim.js`):

1. A ball heading for goal (moving goalwards faster than 4 m/s, with the pace to reach the line) was treated as a shot,
   whatever its speed: he stood for his reaction time, then moved to the nearest point of its path. A slow through ball
   rolling at goal from 14 m was "a shot" and he waited on his line for it.
2. A pass he could reach first was claimed only inside his small zone (within 10 m of the goal centre across, 6.5 m
   out; the whole box for a sweeper-keeper).
3. Everything else: he stood on his angle. A ball dying 8-16 m out sat there until a striker arrived, however long
   that took.

So a ball that trickled into the box and stopped 12 m out, with the striker still 15 m away, was left alone. That is
what the owner saw.

### What changed (`one-man-team/js/sim.js`)

Three new engine settings, on by default:

| Setting | Value | Meaning |
|---|---|---|
| `gkCollect` | 1 | collecting on; 0 is the engine before this note, bit for bit |
| `gkCollectV` | 10 m/s | only a ball slower than this |
| `gkCollectMargin` | 0.25 s | only if he gets there this much sooner than any attacker can reach the ball's path |

The rule: when the ball is loose (nobody on it), 10 ticks or more after it was kicked, moving slower than 10 m/s, and
its path (the existing 3.6 s prediction) passes through the penalty area (x 8-42, y 0-16.5) at a point he can be
standing on when the ball gets there, and he gets there at least 0.25 s before any attacker could reach the path, he
comes off his line at his rushing speed (5.4 m/s, as for a sweep) and gathers it. Once he has gone he keeps going while
he is no more than 0.1 s behind (the same hysteresis as the sweep), so he never stops and starts. The target is always a
point of the ball's path inside the area, so he never leaves it. The check comes before the shot reaction, so a slow
ball rolling at goal is collected, not waited for.

The attackers' time uses the existing claim rule: everyone except the man who kicked it, with players not yet played
assumed to have started running when the pass was hit. "An attacker will clearly get there first" is the margin: if any
attacker can reach the ball's path within 0.25 s of the keeper's own time, he holds (or narrows the angle when the
attacker has it), exactly as before.

Why 10 m/s: no struck shot is that slow. A shot leaves the boot at 20.4-40.8 m/s and loses 0.336 of its speed per
second: from 30 m it still arrives above 13 m/s. A pass is 9-28 m/s off the boot and loses 0.8 per second; it drops
below 10 m/s for its last 11 m. So "slow" means the end of a pass's roll, or a long pass that has died, never a shot.

When he gathers it the fail code is `keeper` (a pass claimed; `saved` if it was the last player's kick), so every tool,
rating page and fail log reads it as before. In the game the sheet says "Keeper gathers it. The ball sat up in his area
and the keeper came out and got there first. Try: get to it sooner, or weight the pass so your man arrives before him."
(it used to say "Too hard" for every claimed pass, wrong for one that died short, and when the pass was recorded it
blamed "your new run moved the defence"). The renderer already draws him leaning into a rush while he sweeps; the
collect sets the same flag.

### Measured

**When does he come?** A pass played from (25, 34) straight at goal, weighted to die at a given distance; a striker
who sets off after it as it crosses 18 m out, starting the given distance from where it stops (`docs/foundation/sets/keeper-race.js`).

| Ball dies at | Striker 4 m away | 7 m | 10 m | 14 m | 20 m |
|---|---|---|---|---|---|
| 6 m out | striker | striker | striker | keeper (meets it 8.4 m out) | keeper (9.2 m out) |
| 9 m out | striker | striker | striker | keeper (9.8 m out) | keeper (10.0 m out) |
| 12 m out | striker | striker | striker | striker | keeper (11.9 m out) |
| 15 m out | striker | striker | striker | striker | keeper (13.9 m out) |

He goes 0.6-1.1 s after the kick, the moment the ball drops below 10 m/s. With `gkCollect 0` every one of these is the
striker's ball and the keeper stays within 3 m of his line.

**Frame strip:** `/home/claude/shots/keeper-collect.png`. Fixture 13 (Beat the trap) in the built game, with the bot's
final pass played 0.2 heavier and the striker setting off 1.0 s late. Before this change the keeper stayed on his line
and the striker scored. Now: the ball crosses 20.6 m out at 9.2 m/s and he goes at once, keeps going (2.8, 4.6, 6.3,
7.5, 9.3, 11.1 m off his line), and gathers it 11.4 m out as the striker arrives. Sheet: "Keeper gathers it".

**Struck shots:** 18 shots from 12-30 m (six spots, power 0, 0.5 and 1) play out tick for tick exactly as with
`gkCollect 0`, with no tick of collecting. A full-power shot never gets near 10 m/s.

**Bit-identical when off:** with `gkCollect 0` all 60 bot routes, hashed on every tick (ball, keeper, every defender),
are identical to the engine before this change. With it on, all 60 still score and only fixtures 33 and 34 differ at
all: a few ticks at the very end of a pass round that has already been won, when the keeper starts towards a pass
before the receiver is played. No bot route needed re-scripting.

| Check | Before | After |
|---|---|---|
| `node tools/test.js` | 60/60 | 60/60, no re-scripts |
| `node tools/test.js --jitter` | | identical on every round of all 60 levels |
| `node tools/ai-scenarios.js` | 45 pass | 49 pass (4 new, below) |
| Human model replays (finished moves that replay identically) | 1789 of 1789 | 1790 of 1790 |
| App `npm test` / `npm run check-native` | | pass (35 of 35 bridge checks; 11 native checks) |
| Browser (`play2.py`, all 60 in the single-file build) | | 60 of 60 scored, no console errors |

New scenarios:
- the keeper collects a slow ball trickling into his area with the striker 23 m away (he goes out to 11.9 m with no
  change of mind and stays in his area), and one rolling across the box at an angle; with `gkCollect 0` he stays at
  3.0 m and the striker gets it;
- he holds when an attacker will clearly get there first (striker 4 m from where it dies; striker running on from 8 m);
- he never comes out of his area for a ball that stops 19 m out;
- he does not charge at a well-struck shot (the 18 shots above).

**Human model, owner profile, 30 runs, seed 1, before and after, by pack** (`tools/human/run.js --root`; the "before"
ran on a frozen copy of the old engine):

| Pack | Fixtures | Median of the medians, before | after | Sum of medians, before | after | Mean takes per run, before | after | Failed takes to the keeper, before | after |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 1-4 | 1.75 | 2 | 6.5 | 7 | 2.07 | 2.07 | 31 of 128 | 36 of 128 |
| 2 | 5-12 | 4 | 4 | 33 | 33 | 5.45 | 5.45 | 16 of 1068 | 25 of 1069 |
| 3 | 13-20 | 2.75 | 3 | 39 | 43.5 | 6.68 | 7.05 | 23 of 1363 | 71 of 1451 |
| 4 | 21-28 | 3.5 | 3.5 | 41 | 41 | 8.12 | 8.17 | 77 of 1708 | 87 of 1721 |
| 5 | 29-36 | 3.75 | 3.75 | 41 | 41 | 7.35 | 7.17 | 0 of 1524 | 7 of 1482 |
| 6 | 37-44 | 4 | 4 | 34 | 34 | 6.12 | 6.32 | 9 of 1229 | 13 of 1276 |
| 7 | 45-52 | 4.75 | 4.75 | 48 | 48 | 8.53 | 8.43 | 28 of 1806 | 29 of 1782 |
| 8 | 53-60 | 5.5 | 5.5 | 54 | 55.5 | 9.30 | 9.38 | 139 of 1993 | 157 of 2011 |
| All | 60 | | | 296.5 | 303 | | | | |

Five medians moved: Down the wing 1.5 to 2, Play through the press 2.5 to 3, False nine 11.5 to 12, Five-man move 8 to
11.5, Up, back and through 15 to 16.5. Five-man move is the one real change: the simulated owner overhits the 10's
through ball to the 7 often, and the keeper now gathers it (claimed passes 7 to 25 of 326 failed takes). The real owner
took 15, 20 and 8 takes there, so the model has moved towards him. Pack 1 stays inside its 1-2 band. The model is noisy
at 30 runs (about 1.5 takes either way on a median), so the small moves elsewhere are not meaningful.

The ramp: collecting is on in every fixture, including 1-4. It is realism, not a difficulty option, and the opening
pack's takes did not move (2.07 per run before and after).

Service worker `omt-0.8.2` to `omt-0.8.3`; single-file build `/home/claude/game/index.html` rebuilt; app shell synced.

## Part 2: generator version 2

Set E (19-owner-ratings-set-E.md) said three things about the generator (17-generator.md): one generated level looked
sparse (Third-man run, four defenders, two of them 24 m apart: fun 3, real football 2); several templates almost never
pass, so the mix leans on a few; and the human model was wrong about difficulty in both directions (False nine 1 take
against 5.5-6 predicted; Ball inside the full-back 29 against 6-7). This part deals with each, and with the keeper.

The 60 live levels were not edited. The engine was not touched in part 2.

### 1. No sparse defence (rule R8)

New static check R8 in `tools/gen/check.js`, now rulebook 5.4 rule 8. Outside fixtures 1-4 and the counter:

- at least six outfield defenders;
- a back line of 3-5, where a centre-half marking from the line counts as one of it (a `mark` who starts within 3.5 m
  of the line's height, between its end men; the generator marks these by role);
- no neighbouring gap in that back line wider than 11.5 m (the rulebook's adjacent spacing, 5.1);
- at least two defenders in front of the line (screens, hunters, markers on midfielders).

R1's spacing rule now also counts the marking centre-half, so the version 1 exception (a two-man line 24-28 m apart with
a marker between, gaps of 12-14 m) is gone from the rulebook.

Templates changed to meet it:

| Template | Before (version 1) | After |
|---|---|---|
| Third-man run | 4 defenders: two `line` men 24-28 m apart, the centre-half marking the 9 between them, a screen | 6: a back four (left-back, the centre-half marking the 9, right-centre, right-back at x 14.5 / 25 / 35 / 44.5, so about 10 m apart), the screen, and a hunter on the 5 (7.5-9.5 m). The hole the 9's marker leaves is between the left-back and the right-centre |
| False nine | 5: two `line` men 24-25 m apart, the centre-half marking the 9, a marker on the 8, a screen | 6: a back four (left-back, the centre-half marking the 9, right-centre, right-back at about 12.5 / 22.8 / 32.5 / 42.5), the marker on the 8 and the screen. The 11 starts in the half-space between the left-back and the centre-half (x 16.5-18.5) |

Every other ordinary template already had six or more in a recognisable shape; the counter (two centre-halves and two
hunters) is exempt, as before (rulebook 5.4 rule 7). Campaign slot 5-8 now wants six defenders, not 4-6 (rulebook 7.3).

Measured on the levels that exist:

| Levels | Fail R8 |
|---|---|
| Set D, all 5 (generated-style hand-built trials) | none |
| Set E, the 8 generated and 2 hand-built | exactly Tests 05 (False nine, 5 defenders, a 14.8 m gap) and 06 (Third-man run, 4 defenders, two 12.5 m gaps, one man in front) |
| Live fixtures 5-60 (not edited; for information) | 34 of 56. Corners and free kicks with no back line (22, 24, 26, 27, 52), counters and overloads with 3-5 defenders (5, 29-35), and hand-built lines with a 12-20 m gap (10, 25, 41-44, 53-58, 60). Rule 8 is a rule for generated levels; whether those fixtures look sparse to the owner is a question for him |

Accepted levels in the acceptance run below: every non-counter level has 6 or 7 defenders (before: Third-man run 4,
False nine 5).

### 2. Acceptance per template

Method: `docs/foundation/sets/v2/acc.js`, one attempt per seed, seeds 5001-5020 for every ordinary template, the
ordinary band at fixture 9, the same seeds before and after. "Before" is the generator as committed with job 1 (the new
keeper in the engine, the generator of 17 unchanged), frozen in `/home/claude/gen-before`; "after" is version 2. 300
attempts each. The proof run of 17 (885 attempts, old engine) gave the same picture before: 0-3% on the four weak
templates.

| Template | Weight | Before: accepted | After: accepted | Expected share of generated levels, before | after | Defenders in accepted levels, before | after | Clocks, before | after | Model median, before | after |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Five-man move | 3 | 1/20 (5%) | 2/20 (10%) | 4% | 5% | 7 | 7 | 12 | 10-12 | 7 | 8 |
| Beat the trap | 3 | 2/20 (10%) | 5/20 (25%) | 7% | 10% | 7 | 7 | 11 | 11 | 6.5-7 | 6-9.5 |
| Third-man run | 3 | 14/20 (70%) | 6/20 (30%) | 20% | 11% | 4 | 6 | 9-11 | 9 | 3-6.5 | 3.5-8 |
| **Switch of play** | 3 | 1/20 (5%) | 2/20 (10%) | 4% | 5% | 6 | 6 | 10 | 10 | 4 | 4 |
| Bend the run | 3 | 5/20 (25%) | 9/20 (45%) | 14% | 13% | 7 | 7 | 8-10 | 9-12 | 5-7 | 5-9 |
| **Diagonal in behind** | 2 | 0/20 (0%) | 5/20 (25%) | 0% | 7% | - | 6 | - | 10-11 | - | 4-7 |
| Play through the press | 2 | 2/20 (10%) | 2/20 (10%) | 5% | 3% | 6 | 6 | 10 | 10 | 4-4.5 | 4-4.5 |
| The counter | 2 | 5/20 (25%) | 7/20 (35%) | 9% | 8% | 4 | 4 | 10-11 | 9-11 | 5-7 | 5-9 |
| False nine | 1 | 7/20 (35%) | 2/20 (10%) | 6% | 2% | 5 | 6 | 10 | 10 | 3-5 | 3-4 |
| **Wing and cut-back** | 2 | 1/20 (5%) | 5/20 (25%) | 3% | 7% | 7 | 7 | 9 | 8-11 | 7 | 7-13 |
| Sweeper-keeper | 1 | 11/20 (55%) | 11/20 (55%) | 6% | 5% | 6 | 6 | 10-13 | 12-13 | 4-7 | 4-8.5 |
| **Up, back and through** | 2 | 0/20 (0%) | 1/20 (5%) | 0% | 2% | - | 7 | - | 11 | - | 5.5 |
| Short then long | 2 | 6/20 (30%) | 14/20 (70%) | 10% | 10% | 7 | 7 | 10-11 | 9-10 | 5-7 | 6-13 |
| Commit the centre-half | 2 | 4/20 (20%) | 7/20 (35%) | 8% | 8% | 6 | 6 | 10-11 | 9-11 | 3-5.5 | 2-5.5 |
| Ball inside the full-back | 2 | 2/20 (10%) | 3/20 (15%) | 5% | 5% | 7 | 7 | 11 | 9 | 4-5 | 4.5-10.5 |
| All | | 61/300 (20%) | 81/300 (27%) | six commonest 69% | six commonest 60% | | | | | | |

"Expected share" is what the generator would make: a template is drawn by pool weight and tried up to four times, so its
share is proportional to weight x (1 - (1 - acceptance)^4). At 20 attempts a template's acceptance is only good to about
10 points either way.

The four weak templates together: 2 of 80 accepted before, 13 of 80 after. What changed in their setup (the checks were
not loosened; every level still passes every check of rulebook 8.1, with A6 now on the estimate of section 3):

- **Diagonal in behind** (0% to 25%). The screen stood 7 m off the 8 and the 8 received with nobody near him: J1 (a tight
  middle touch) failed 16 times in 20. Now the screen stands 3-4 m goal-side of the 8 and slightly inside him (x 13-15,
  `eng` 6), as in baseline 9, and the 8 steps away from him before the diagonal; the finisher may start 2.5-4 m onside
  (was 2-3). A first try with the screen on the other side of the 8 put him in the diagonal's path (every route cut out);
  a shorter diagonal left the finisher free at 18 m (J4b). Remaining rejections: the finisher's run window under 0.3 s
  (J3, 8) and the finisher tackled on his first touches (4).
- **Wing and cut-back** (5% to 25%). With the decoy, the 9 started at x 25, which put his marker 2.5 m from a
  centre-back (V2, 5 rejections in 20). He now starts in the middle of the gap between the centre-backs (x 23.5). Part
  of the gain is section 3: the model found generated cut-backs hard (10-20 takes) and rejected their clocks; the
  estimate is gentler on them, so their model medians now run to 13 (a note, not a rejection).
- **Switch of play** (5% to 10%). The block slid up to 8 m: at 8 m plus the placement's jitter the line's centre broke
  the 8 m rule, and the far centre-half could never close the finisher down. The slide is now 5-6.5 m. Two other tries
  failed and were reverted: a back four (its far full-back cut out the switch) and the 6's hunter on the ball side
  (either in the 2-to-6 pass, or so far from the switch that nothing was tight). Its remaining failures are the switch's
  aim window (under 3 degrees past the 6's hunter, J2, 8) and the finisher left free on the far side (J4b, 7): the
  template's own tension between a needle and a free run. Not solved.
- **Up, back and through** (0% to 5%). The finisher took the through ball about 21 m out and reached 18 m before the
  stepped-up line had recovered (J4b, 10 in 20). The ball is now aimed 7.5 m behind the line, not 9. At 6 m behind J4b
  fell to 2 in 12 but nothing in the move was tight any more (J2: no tight window) and he took it more than 32 m out
  (J4a); at 7.5 m the two trade off and few attempts pass both. Not solved.

The cost of the fuller defence: Third-man run 70% to 30% (J4b: the finisher in the hole is closed down less reliably by a
back four than by the old back three's recovering centre-half; 11 of 14 rejections), False nine 35% to 10% (the decoy
test: with a full back four the hole is often there whether or not the 9 drags his man, 8 of 18 rejections). Third-man
run was the template the old mix leaned on most (20% of all levels); now 11%.

Templates I did not change still moved, because the clock is now fitted to the estimate of section 3: Short then long
30% to 70%, Bend the run 25% to 45%, Beat the trap 10% to 25%, Commit the centre-half 20% to 35%. Before, 8, 4, 3 and 3
of their attempts were rejected at the clock ("owner model median ... outside 3-7"); after, none were: the estimate,
which weighs the route's tightness, puts them in the owner's band at a clock the model alone rejected. The rest of the
difference is the noise of 20 attempts.

### 3. Difficulty: what the model missed, and a more robust signal

**The two misses.**

- *False nine (set E Test 05, seed 502): 1 take, model 5.5-6.* The simulated owner does not play the designed move. In
  its routes (`tools/human/run.js --routes`) the 5 hits the first pass to wherever it sees space ((32, 38), (46, 54),
  (45, 43)), the decoy runs to a different spot each time, and the 8 then plays first time from those improvised spots:
  49% of its failed takes are on the 8's round, 46% on the finish. The owner reads the brief and tips and plays the move
  as designed, and the designed move was loose: one tight middle touch, tightest passing lane 2.15 m, closest defender at
  a reception 2.2 m, 0.6 s of open corner at 18 m, five defenders. He has also said decoys are the easiest way to make
  space. The level was sparse; rule R8 now rejects it.
- *Ball inside the full-back (set E Test 08, seed 501): 29 takes, model 6-7.* 21 of his 28 failed takes were on the
  finisher's round: wide 9, tackled 5, saved 4, intercepted 3. On this level the simulated owner shoots from a median
  11 m (range 10-18 m, 30 cleared runs); he shot from 15.8 m. The model's finish is closer and easier than his. It is
  also the fastest defence of the ordinary set E levels (line 5.4 m/s, hunter 5.6). None of the finish measures picks it
  out: 2.2 m of goal open when he stands at 18 m, 0.3 s of corner time, caught 0.5 s after standing, all like levels he
  cleared in 2-4 takes. The set D version of the same idea took him 4. I cannot explain the 29 beyond that; some of it
  is a long run of misses on one evening, which no measure will predict.

**What tracks his takes.** All rated plays of sets A-E (56 of 57; set B's "10 + cover" is out because the baseline bot
route does not score with the extra defender), each measured on the engine he played it on (set A and B: A, B, hand-over,
shot pace and collecting all off; C: as the test; D: shot pace 1; E: collecting off), at its clock, with the generator's
own measures on the level's bot route and the human model (owner profile, 60 runs). Dataset and scripts:
`docs/foundation/sets/v2/` (`rated.js`, `rated-old.json`, `comp.py`, `fit.py`).

Rank correlation (Spearman) with his takes; p from 1,000 shuffles:

| Signal | All plays (56) | First plays (33) | First plays, fixtures 5+ (29) | Set A (20) | Sets B-E (36) | Sets D-E first plays (13) |
|---|---|---|---|---|---|---|
| Human model alone (before) | +0.27 (p 0.04) | +0.42 (p 0.02) | +0.24 (p 0.22) | +0.53 (p 0.02) | +0.11 (p 0.51) | +0.19 (p 0.52) |
| Model + tight middle touches (J1) | +0.39 | +0.61 | +0.48 | +0.74 | +0.23 | +0.61 |
| Model + J1 + closest defender at reception + tightest lane + touches with under 0.6 s spare | +0.47 | +0.66 | +0.54 | +0.75 | +0.36 | +0.64 |
| The same four route measures without the model | +0.51 | +0.69 | +0.59 | +0.74 | +0.40 | +0.71 |
| ... plus defender speed | +0.47 | +0.69 | +0.58 | +0.83 | +0.32 | +0.59 |
| **... plus bot time / clock: the estimate (after)** | **+0.50 (p < 0.001)** | **+0.70 (p < 0.001)** | **+0.60 (p < 0.001)** | +0.79 | +0.35 (p 0.04) | +0.58 (p 0.03) |

Every measure enters as a z-score with equal weight; the list is the one doc 07 found on set A, chosen before looking at
sets B-E. The route-only signal ranks his takes as well as anything, but it does not move with the clock, and the clock
has to be the dial, so the generator uses the last row: two of its six terms (the model and bot / clock) move with the
clock. Mapped to takes with the line fitted on his 33 first plays: takes = exp(1.476 + 0.787 z)
(`tools/gen/difficulty.js`).

Left out one set at a time (means, spreads and the line fitted on the other four sets, predictions on the fifth):

| Held-out set | Estimate | Model alone |
|---|---|---|
| A (20) | +0.79 | +0.53 |
| B (9) | +0.15 | +0.23 |
| C (12) | +0.36 | +0.09 |
| D (5) | +0.46 | +0.67 |
| E (10) | +0.62 | -0.01 |
| All held-out predictions pooled (56) | +0.46 (p < 0.001) | +0.27 (p 0.05) |
| Typical error (median factor between prediction and his takes) | x2.0 | x2.0 |

Read honestly: the estimate orders his levels clearly better than the model alone, in the set it was found on and out of
it; it is no closer in takes on a typical level (both are about a factor of 2 out), and it does not catch the two set E
misses (False nine: 5.1 against 1; Ball inside the full-back: 6.6 against 29; the model said 7 and 6). The sample is
small: 56 plays, 33 first plays, by one player who learns fast (Beat the trap took him 13, 6, 3, 2, 1 and 2 takes over six plays), and sets
B and C are mostly replays, where his takes say more about memory than about the level. A correlation of +0.46 on 56
points has a 95% interval of roughly +0.2 to +0.65. The choice of the last row among six candidates was made looking at
this data. Treat it as a better band, not a measurement.

**In the generator.** The clock is fitted to the estimate, aimed at the owner's own targets for the band (rulebook 9:
standard 3-6 takes, target 4.5; hard 5-8, 6.5; ordinary 3-8, 5; closing 8-15, 10) instead of aiming the model at its
proxy bands (3-7 for ordinary). The model must still clear 90% of simulated owners within 60 takes (A6); its old band
is now a note. The opening band (fixtures 1-4) keeps the model alone: the route measures mean little in the tutorials.
`generate({ ..., modelOnly: true })` gives the version 1 behaviour. The CLI table has a new "estimate" column.

### 4. Generated levels and the keeper

The generator plays every route, window, probe and human-model run on the live engine (`tools/gen/lab.js` loads
`one-man-team/js/sim.js`), so every level it makes from now on is checked with the keeper collecting: a through ball
that would now die into his hands narrows that pass's power window, which J2 counts, and a route that relies on him
staying home fails A2. Version 1's levels on the new keeper (`docs/foundation/sets/v2/keeperE.js`): all ten set E levels
still score, their jitter is identical round by round with and without collecting, and the only window that changed is
the hand-built Five-man move's final pass (power window 0.26 to 0.16: an overhit ball to the 7 is now the keeper's). No
generated level of set E changed at all. No level carries `gkCollect`; the V10 engine check refuses any `engine` field
the ramp does not ask for, so a generated level cannot switch the keeper off.

### What did not pass, or is not solved

- Switch of play (10%) and Up, back and through (5%) are still rare: the fix moved them off zero but each has a real
  tension between its needle and its free finish that a setup change did not resolve.
- Third-man run and False nine are accepted less often with a full back four (30% and 10%).
- The estimate does not explain either set E miss. The model's finish (from 11 m) is still not his (15-21 m).
- Acceptance figures rest on 20 attempts per template.

### Files

- `tools/gen/difficulty.js` (new): the estimate.
- `tools/gen/check.js`: R8, the back line with a marking centre-half in R1, A6 on the estimate, `windows` and
  `ownerProbe` exported.
- `tools/gen/generate.js`: set back-line positions (`xs`), a screen at a set spot (`at`), the clock fitted to the
  estimate, band targets in the owner's takes.
- `tools/gen/templates.js`: Third-man run, False nine, Diagonal in behind, Switch of play, Up back and through, Wing and
  cut-back.
- `tools/gen/cli.js`: the estimate column.
- `docs/foundation/RULEBOOK.md`: version 2 (2.7, 4.3, 5.1, 5.4 rule 8, 7.2, 7.3, 8.1).
- `docs/foundation/sets/v2/`: the rated-levels dataset and the scripts behind every number in part 2, the acceptance
  runs before and after (`acceptance-before.jsonl`, `acceptance-after.jsonl`).
