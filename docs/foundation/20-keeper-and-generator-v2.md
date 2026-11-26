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
