# Rating set D: the five trial moves

Built Wed 25 Nov 2026 by the level designer, to RULEBOOK.md version 1. The rulebook (4.2, "Trial") holds five moves out of
the generator's pool until the owner has rated them: A4 Up, back and through; A7 Short then long; C2 Bend the run; C6
Commit the centre-half; B4 Ball inside the full-back. Set D is one new level per move, built from scratch to the rulebook
(the old fixtures 40, 51, 53, 56 and 57 that attempt these ideas were not reused: they carry 5.7-5.8 m/s defenders, a
screen deep in the box, a line on the edge of the six-yard box and similar things the rulebook now bans).

All five play on the live engine with its defaults: A (through on goal) and B (keeper covers his near post) on, marker
hand-over on. No level carries an `engine` field. The engine and the bot-route tools were not changed; set D runs on a
byte-identical copy of the live `sim.js`.

## What the owner plays

`/home/claude/sets/setD/index.html`, built with `tools/build-set.py` (rate on, no assist, no practice, no slow time, all
unlocked, no story, save key `omt.setD`). Five blind tests, Test 01-05, in a shuffled order. After each goal (or giving
up) he rates five scales: challenge, fun, fair, and two new ones, "Time to pick a corner" (None to All day) and "Felt
like real football" (Not at all to Proper goal). The ratings page gives one line per test with takes, move time, shot
distance and the fail codes by round, ready to paste.

## Key

| Test | Move | Clock | Bot | Slack | Bot / clock | Ball players | Defenders (+ keeper) | Decoys |
|---|---|---|---|---|---|---|---|---|
| 01 | C6 Commit the centre-half | 10 s | 5.38 s | 4.62 s | 0.54 | 3 | 6: hunter, screen, back four | 0 |
| 02 | B4 Ball inside the full-back | 9 s | 5.00 s | 4.00 s | 0.56 | 4 | 7: hunter, screen, marker on the 10, back four | 0 |
| 03 | A4 Up, back and through | 9 s | 4.87 s | 4.13 s | 0.54 | 4 | 7: hunter, screen, marker on the 9, back four | 0 |
| 04 | A7 Short then long | 10 s | 5.22 s | 4.78 s | 0.52 | 4 | 7: two hunters, screen, marker on the 9, back three | 0 |
| 05 | C2 Bend the run | 10 s | 5.45 s | 4.55 s | 0.55 | 4 | 7: hunter, screen, marker on the 10, back four | 0 |

No decoys anywhere: none of the five moves needs one, and the owner's rule is at most one, and only when it is needed.
No sweeper-keepers either, although the consultant suggested one for A4, A7 and C2: keeping the keeper the same in all
five means the ratings judge the move, not the keeper. Back-line speed 5.2 m/s in every level, hunters and markers 5.3
(mean about 5.24, inside the standard band).

## The five moves

### Test 01: C6 Commit the centre-half

**In football terms.** The 6 is hunted and finds the 10 between the lines, past a screening midfielder. The 10 drives
straight at the left centre-half of a back four. The line drops off him at first; when he gets close the centre-half
has to step out, and his partner tucks in and drops a yard. The 10 has to carry until the centre-half is committed, then
slip the 9 in behind before the tackle comes. The 9 holds his run on the line and goes as the centre-half steps out.

**Layout.** 6 (30, 52), 10 (20, 40), 9 (31, 29). Hunter (36, 46) on the 6, screen (24, 41.5) on the 6-to-10 lane, back
four at y 26 (x 9 / 19 / 29 / 39), `gap` 8 so the line stays close enough to the carrier for the centre-half to engage.

**Where the jeopardy is.** The carry: in the bot's search, every carry that ended half a metre nearer the centre-half than
the bot's got the 10 tackled, and releasing early lets the centre-half sit off. Then the 9's run, the tightest of the set (0.47 s). This is
the only level of the five with three players.

### Test 02: B4 Ball inside the full-back

**In football terms.** Hunted 6 rolls it across to the 8, who has to play at once because the screen steps across. The
10 comes off his marker and slides it first time into the one seam in a compact back four, between the right-back and
the right centre-half. The right-back stands a yard too wide because he is watching the winger (spacing 9 / 9 / 11.5 m).
The 7 holds his width on the line and darts inside the full-back as the 10 plays it.

**Layout.** 6 (18, 51), 8 (34, 47), 10 (26, 35), 7 (44, 28). Hunter (14, 44), screen (23, 40.5) on the 6-to-10 lane,
marker on the 10, back four at y 25 (x 12 / 21 / 30 / 41.5).

**Where the jeopardy is.** The middle is the tightest of the set: three pass-aim windows of 12-14.5 degrees, the 10's
power window 0.24, the 8 cannot stand on the ball at all. The 7's run is strict on the early side (offside) and lenient
on the late side.

### Test 03: A4 Up, back and through

**In football terms.** The hunted 6 cannot find the 10 because the screen is on that lane, so he fires it up to the 9,
who comes short with his marker on his back and sets it back first time to the 10. The back pass makes the line step
up. The 10 threads it first time between the right-back and the right centre-half, and the 7 has to cross the line just
as it is played, against a line that is moving up towards him.

**Layout.** 6 (22, 51), 9 (25, 33), 10 (31, 45), 7 (40, 31). Hunter (17, 44), screen (27.5, 44), marker on the 9 at
2.4 m, back four at y 28 (x 10 / 20 / 30 / 40), `gap` 9.

**Where the jeopardy is.** The 9's first-time set-back with a marker 1.4 m away; the 10 receiving with a defender 2.7 m
away; the 7's run (0.67 s, offside early, caught late).

### Test 04: A7 Short then long

**In football terms.** A double movement. The 4 escapes the hunter, the 6 moves it on first time, and the 8 takes it
with a second hunter closing from the wing and plays it early in behind the middle. The 9 starts on the shoulder of a
tight man-marker who stands in front of a back three; he comes short so the marker follows, then spins in behind him
just before the 8 plays it. The marker sees him late (`react` 24). The centre-half of the back three is the cover the
consultant asked for: a late 9 finds the ball already taken.

**Layout.** 4 (14, 52), 6 (26, 49), 8 (37, 42), 9 (25, 32). Hunters (19.5, 47) and (44, 34), screen (30, 37), marker
(25, 29.5) on the 9, back three at y 25.5 (x 14.5 / 25 / 35.5). The marker is on the finisher, which the rulebook allows
only where the idea is losing your marker; that is this idea.

**Where the jeopardy is.** The 8's pass under the second hunter (aim 11 degrees, can stand on it for 0.2 s); the 9's
spin (0.9 s: tackled by his marker if he goes too soon, cut out by the cover if he goes too late).

**One limit of the bot.** A bot script has one run target, so the bot's 9 spins from his starting spot without coming
short first. The level is proven solvable that way; a player who checks short first gains a yard on the marker.

### Test 05: C2 Bend the run

**In football terms.** Against a high, held line (y 30, `gap` 8) the 11 starts wide left. If he runs straight at goal he
is offside, so he runs across the pitch along the line, level with the last man, and bends in behind as the pass is hit.
The build-up: hunted 4 rolls it left to the 6, the screen blocks the ball out wide, the 6 plays across into the 10 as he
comes off his marker, and the 10 slides it first time between the centre-halves.

**Layout.** 4 (30, 54), 6 (20, 50), 10 (27, 41), 11 (7, 33.5). Hunter (36, 48), screen (17, 42) on the lane to the 11,
marker on the 10, back four at y 30 (x 10 / 20 / 30 / 40).

**Where the jeopardy is.** The 10's first-time ball (aim 13.5 degrees, a defender 1.3 m from the ball in flight); the
bent run (1.6 s window). The finisher takes control closest to goal of the five (18.8 m) and is closed within 0.8 s.

## Checks (rulebook section 8)

Run on the final files (`root/` holds the shuffled levels and bot routes, so `root/tools/test.js`, the forensics
scripts with `ROOT=root` and `tools/human/run.js --root root` see exactly what the owner plays). `checks.js` holds the
static checks and J1-J7, J10, using the methods of `dwell.js`, `windows2.js`, `aim3.js`, `finish.js` and the owner probe
of `defending/finish.js`; the forensics scripts were also run directly on the set as a cross-check and agree.

| Check | 01 C6 | 02 B4 | 03 A4 | 04 A7 | 05 C2 |
|---|---|---|---|---|---|
| A1 static V1-V11 and role test 5.4 | pass | pass | pass | pass | pass |
| A2 bot beats it, replay scores | pass | pass | pass | pass | pass |
| A3 jitter, every round 45% or more | 78 / 85 / 88 | 100 / 53 / 78 / 75 | 100 / 100 / 100 / 95 | 100 / 100 / 95 / 98 | 100 / 100 / 100 / 100 |
| J1 tight middle touch (lane 2.0 m or less, or receiver closed within 3.5 m) | 1 (10 closed at 3.3 m) | 2 (lane 2.0; 10 at 2.5 m) | 2 (9 at 1.4 m; 10 at 2.7 m) | 1 (8 at 2.8 m) | 2 (lane 1.3; 10 at 3.2 m) |
| J2 tight knobs (count; none below 3 degrees) | 2 | 5 (hard-band count) | 1 | 2 | 2 |
| J3 onside by at kick (0.3-5 m) | 1.6 m | 1.8 m | 0.5 m | 2.6 m | 1.8 m |
| J3 run-timing window (0.3-2.5 s) | 0.47 s | 2.33 s | 0.67 s | 0.90 s | 1.63 s |
| J3 should: passer pressed or line stepping | no (3.3 m, line dropping) | yes (stepping) | yes (stepping) | yes (2.7 m) | no (3.2 m, line holding) |
| J4a control 14-32 m out | 21.3 m | 23.6 m | 26.9 m | 22.1 m | 18.8 m |
| J4b owner probe: lost within 1.0 s of standing at 18 m / 2.5 s of control | 0.37 / 0.88 s | 0.87 / 1.73 s | 0.43 / 1.83 s | 0.67 / 1.33 s | 0.72 / 0.83 s |
| Corner time at 18 m (1 m or more of goal open) | 0.1 s | 0.6 s | 0.2 s | 0.4 s | 0.5 s |
| J5 defender within 6.5 m in 0.47 s after control; decoy tests | 2.7 m; no decoy | 2.6 m; no decoy | 3.0 m; no decoy | 2.1 m; no decoy | 1.9 m; no decoy |
| J6 early passes forced (spare 1.7 s or less, or screen on the lane) | 1.35 s, screen on lane | 1.55 s | 1.25 s | 1.45 s | 1.65 s |
| J7 no passenger rounds | pass | pass | pass | pass | pass |
| J8 bump 5% or less, out 10% or less, early 0 | 0 / 0.7% / 0 | 0.2% / 0.2% / 0 | 0 / 1.3% / 0 | 0.2% / 0.1% / 0 | 0 / 0.5% / 0 |
| J9 share of failures before the last player (0.3-0.7) | 0.47 | 0.34 | 0.72 (flag) | 0.47 | 0.54 |
| J10 bot's shot: distance, goal open | 16.5 m, 2.8 m | 15.9 m, 2.0 m | 15.6 m, 3.0 m | 14.7 m, 3.0 m | 14.2 m, 4.0 m |
| A6 owner profile clears within 60 takes (90%+) | 100% | 98% | 99% | 99% | 100% |
| A7 bot / clock 0.80 or less | 0.54 | 0.56 | 0.54 | 0.52 | 0.55 |
| A8 determinism | pass | pass | pass | pass | pass |

A8: every bot route replays tick-identical (hashed); `run.js --check` 20 of 20; 596 of 596 simulated finished moves
replay identically; the copy of `sim.js` is byte-identical to the live one; `node tools/ai-scenarios.js` passes on the
live engine.

**What does not sit cleanly, and why it was left.**

- **Bot / clock below the band floor.** All five clocks put the slack inside the standard band (4.0-4.8 s), which is
  the rulebook's first rule for setting a clock, but the ratio comes out at 0.52-0.56, under the standard band's 0.58.
  The bots play their early passes first time at once (4.9-5.5 s moves), so a band-ratio clock would leave a person
  3.3 s of slack or less. The human model agrees: at 8 s, Test 03 leaves 7% of simulated owners stuck. Ratio passes the
  hard limit of 0.80 everywhere.
- **Test 02 (B4) has five tight knobs**, the hard-band count (standard is 1-3). Its difficulty sits in the middle, which
  is what the move asks for ("needs a tight lane to be worth anything"), but it is the busiest middle of the five.
- **Test 02 (B4) is lenient on a late run.** The ball goes into the space inside the full-back, so a 7 who goes on the
  pass still gets there; the window (2.33 s) is measured as `windows2.js` does, which caps the late side at 2 s. The
  offside call on an early run is real.
- **J3 "should" misses in Tests 01 and 05.** In 01 the stepping centre-half is 3.3 m from the 10 when he releases, and the
  line is still dropping: a player who carries closer gets the trap, the bot releases a little early. In 05 the 10's
  marker is 3.2 m away, so the line is holding without anyone inside 3 m. Both are "should" rules.
- **J9 in Test 03 is 0.72**, just over 0.7: more failures in the middle than at the finish. It is a supporting check
  only and goes to the owner as asked.
- **Test 01 (C6) has a shortcut.** The human model rarely carries at the centre-half; it often plays an early long
  through ball from 44 m instead, and that sometimes works. The rating will show whether the owner finds it and whether
  it spoils the level.
- **Novice tier (second check for fixtures 1-20).** Simulated novices beyond 30 takes: 01 20%, 02 45%, 03 17%, 04 48%,
  05 42%. Only 01 and 03 are inside the quarter. That limit applies to fixtures 1-20; if B4, A7 or C2 go into that range
  they need more clock there.

## Human-model prediction

Owner profile, 120 runs, seeds 1 and 2: median takes (quartiles), and the share of failed takes lost on each round.

| Test | Move | Median, seed 1 (quartiles) | Median, seed 2 | Failed takes by round | Commonest failures |
|---|---|---|---|---|---|
| 01 | C6 | 4 (2-9) | 5 | 1 / 47 / 53% | cut out before the 9 gets it 39%, the 10's pass cut out 27% |
| 02 | B4 | 7 (4-14) | 8 | 0 / 6 / 28 / 66% | cut out before the 7 gets it 27%, shot saved 21%, shot blocked 13%; the clock 11% |
| 03 | A4 | 5 (2-9) | 4 | 24 / 24 / 25 / 28% | passes cut out 46% |
| 04 | A7 | 7 (4-14) | 7 | 1 / 13 / 32 / 53% | cut out before the 9 gets it 42%, the 8's pass cut out 32% |
| 05 | C2 | 6 (3-12) | 7 | 0 / 13 / 40 / 46% | cut out before the 11 gets it 35%, the 10's pass cut out 31% |

The target is an ordinary level: 3-8 takes on his first play. The model is a band only (rulebook 6 and 7.2: standard
2-5, hard 4+), and on the baseline favourites it underrates him (Five-man move: model 7.5, owner 15, 20 and 8; Beat
the trap: 9 against 13). So my prediction is: 01 and 03 about 4-7 takes, 05 about 6-9, 02 and 04 about 7-12. 02 and 04
are the ones most likely to come out above 8. The clock is the first dial if they do: one more second each (02 to 10 s,
04 to 11 s). The model barely moves with the clock between 9 and 11 s, but the owner has always moved more (two
seconds halved his takes on fixture 9).

## What we will learn from his ratings

Per move, the question is the same one the rulebook asks: does it join the generator's pool, and at what weight?
A move with fun 4 or more and fair 4 or more joins the pool (tier 2 to start, weight 1-2); a move rated fun 3 has its
weight halved and needs a reason; the consultant's tier-1 guess ("they share the tier-1 spine") is tested directly.

- **01 C6 Commit the centre-half.** Whether the tackle tell carries a level: this is the only move whose middle
  jeopardy is a duel (carry until he plants, release during the plant) rather than a pass. Fail codes will show it:
  "P2 tackled" means he carried too long, "P2 intercepted" that he released too early. If fair falls, the tell is not
  readable enough, which is also the AI notes' first open item (the renderer drawing the plant). Also: whether he takes
  the shortcut (an early long ball) and whether that bothers him.
- **02 B4 Ball inside the full-back.** Whether a busy, precise middle (five tight knobs) with a lenient last run is fun
  or fiddly. If challenge comes back 4-5 with fair 3, the middle is too tight for an ordinary level and the 8's pass
  needs room. "Felt like real football" says whether a one-seam back four with a wide full-back reads as a real picture.
- **03 A4 Up, back and through.** Whether the line stepping up on the back pass is visible and fair to him. The final run
  has the smallest margin of the set (0.5 m onside on the bot's route), so "P4 offside" is the expected failure; fair 5
  with offside failures is the tier-1 pattern.
- **04 A7 Short then long.** Whether he discovers the double movement (the marker sees him late), and whether losing a
  tight marker is fun. The marker is on the finisher here, the one case the rulebook allows; the rating decides whether
  that stays allowed. "P4 tackled" means he spun too early into his marker; "P4 intercepted" that the cover read it.
- **05 C2 Bend the run.** Whether running across the line, rather than at it, is a skill he enjoys. Of the five, this has
  the shortest run on goal after control (18.8 m out), so "time to pick a corner" should be lowest here; if it is not,
  the finish needs the next defender closer.

Across the set, two scales are new. **Time to pick a corner** checks his verdict that the finisher must not have time to
pick a corner: the probe gives 0.1-0.6 s of open corner at 18 m, so anything above 3 means the probe is not measuring what
he feels. **Felt like real football** checks his verdict that every defender has a real role: every defender passed the
role test, so a low score names a level where the rules are not enough.

## Files

- `/home/claude/sets/setD/index.html`: the rating build.
- `/home/claude/sets/setD/levels.js`, `key.txt`: the five levels in the blind order (each with its `key`) and the key.
- `/home/claude/sets/setD/scripts.js`: bot routes for `levels.js`, same order, in the `tools/scripts/packN.js` format.
- `/home/claude/sets/setD/design.js`: levels and bot routes in design order (A4, A7, C2, C6, B4); `make.js` shuffles them
  (seeded) into `levels.js`, `scripts.js`, `key.txt` and `root/`.
- `/home/claude/sets/setD/root/`: copies of the live `sim.js`, `tools/load.js`, `tools/bots.js`, `tools/test.js`, with the
  set as `pack1.js` and its routes as `tools/scripts/pack1.js`.
- `/home/claude/sets/setD/checks.js` (static and dynamic acceptance checks; output in `checks-final.txt` and
  `checks-final.json`, design order), `lab.js` (route trace and pass analysis), `search.js`, `win.js`, `probe.js`,
  `clocks.js`, `hm.sh` (design tools), `rateD.py` (browser check; screenshots in `shots/`).
- Human-model output: `human-final.txt` (owner and novice, 30 runs), `human-owner-n120.txt` and `.json`.

Browser check (`rateD.py`, Playwright, phone viewport): the bot played Test 01 to a goal (5.4 s, shot from 16.5 m), the
sheet showed all five scales, the ratings saved under `omt.setD`, and the ratings page showed the line
"1 | Test 01 | challenge 3 | fun 4 | fair 5 | time to pick a corner 2 | felt like real football 4 | 1 takes | 5.4s shot
16.5m". No console errors.
