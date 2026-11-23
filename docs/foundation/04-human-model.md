# 04 The human model: a simulated player that predicts takes

Measurement workstream, 23 Nov 2026. Code: `tools/human/player.js` (the player), `tools/human/run.js` (runs it on fixtures), `tools/human/calibrate.js` (fits it to the owner). Everything is seeded and reproducible.

## The short version

- The model is a goal-directed player that picks its own route, sees the pitch a fifth of a second late, aims and runs with noise, and changes one thing after each failed take, as a person does. It predicts how many takes a person needs on each fixture.
- Two numbers are fitted to the owner, nothing else: "hands" (execution) and "head" (judgement).
- On the original 20, the rank correlation (Spearman) between the model's median takes and the owner's takes is 0.51, or 0.60 using the model's geometric-mean takes. A perfect model could not be expected to do much better: because the owner played each fixture once, a perfect model would score about 0.57 (90% of the time between 0.29 and 0.79).
- Level 60 comes out at a median of 3 takes (quartiles 2-7), in the easier half of today's 60. The owner needed about 2. The bot-plus-jitter instrument ranked 60 the second hardest of all 60.
- For a single fixture, expect the prediction to be within a factor of about 2 to 3 of what the owner does. Use it to sort fixtures into easy, medium and hard bands, and to compare packs. It is not good enough to promise an exact count.

## What happened to the earlier background run

The run "with 30 people per tier" did produce output. Its standard output was redirected to `/tmp/h/today.md` and its timing to `/tmp/h/today.time`, so the task's own log held nothing but the exit line. The file has all 60 fixtures for three tiers. It took 4 min 50 s, and 5,046 of 5,046 cleared moves replayed identically. I could not see the command itself; I am inferring the redirect from those two files, whose timestamps and format match the run. `run.js` now has an `--out FILE` option that prints to the terminal and also writes the file, and says where it wrote it.

I kept the colleague's code as the base: it loaded both checkouts correctly, was deterministic and replayed cleanly. Testing it showed one big fault. Its last player dithered: he would carry the ball for 4-5 seconds, often out wide, and shoot from a poor angle as time ran out. So in the model the finish was the main cause of failure, the opposite of the owner's experience. The fixes are listed under "What changed" below.

## How the player works

**What he sees.** Every defender and the keeper as they were `react` ticks ago (12 ticks, 0.2 s, for the owner profile). This includes whether a defender has planted for a tackle. He also sees his own earlier players, the ball, the clock, and who is next in the chain. He never sees the bot scripts or the designer's route.

**What he does with his thumbs.** The same inputs a phone gives: stick direction, aim direction, power, release. The stick has a direction error, and he changes his mind only every few ticks. Aiming takes time (14 ticks for the owner), with an error in angle (3 degrees) and in power. While he aims he keeps running.

**The tips.** The game shows each player's tip on screen, and the owner reads them. The model takes only the kind of touch from a tip: "first time" or "aim early" makes him aim before the ball arrives, and "wait" or "as the 10 plays it" makes him hold his run until the pass. Where to pass and where to run he decides for himself. This can be switched off (`tips: 0`).

**Passing.** He scores about 40 targets around the next receiver: on to his feet, or into space towards goal at various distances and angles. Each target is scored on three things. First, how open the lane looks, allowing for where the defenders will have got to (`foresee`); he misjudges this, more with a weaker head. Second, whether the receiver beats the nearest defender to the spot; a defender who must turn to chase a ball played in behind him is slower. Third, how much nearer the goal it gets. He may carry the ball 4 or 8 metres first if that opens a better pass.

**Receiving.** He made the pass himself in the previous round, so he knows roughly when it will come. He times his run to go as it is hit, with timing noise, and keeps onside by eye, with a per-take error in where he thinks the line is. Until he has been caught offside once he runs on his timing alone; after that he also checks the line until he believes the pass has gone.

**On the ball.** If a defender gets within about 2 m, or plants his feet, he cuts away to the goal side. Under pressure he plays the pass early.

**The finish.** He judges each spot along the goal by the question a striker asks: "if I hit it there, hard, does the keeper get to it?". His sense of the keeper is a fifth of a second to react, then about 5.5 m/s, plus an arm's length. Those three numbers correctly call 98% of 1,200 test shots fired against a set keeper in the engine, which is the sense a practised player builds up. He also allows for legs in the way, which close in while he aims, and for his own aim error at that distance. He carries the ball towards the spot where a corner will open. He shoots when the corner looks open enough, when he is closed down, when the keeper is coming, or when the chance starts to get worse again.

**Learning across takes.** After a failed take he changes one thing linked to how he failed. With probability `insight` he makes the sensible change; otherwise he makes a random one.
- Offside: he waits longer and checks the line.
- Intercepted: he bends the pass away from the man who cut it out, hits it harder, or picks a different target.
- Tackled straight after receiving: after a few of these he learns to play it first time.
- Saved: he rates chances lower from then on, tries the other corner, or gets closer first.
- Pass reaching nobody: he goes earlier to meet it.

After `patience` failures that he blames on the pass he received, he goes back and redoes the earlier player with a changed pass. A take is one failed round, as in the game. His takes for a fixture are his failures plus one.

**Determinism.** All randomness comes from a seeded generator inside the player. The engine is untouched. After every cleared move the recordings are replayed on their own. The replay must give the same goal on the same tick, with every player, defender, the keeper and the ball in the same place on every tick (compared by a running checksum). `node tools/human/run.js --check` gave: same seed, same result in 64 of 64 runs; 64 of 64 moves replay identically. The full 80-fixture run replays 2,387 of 2,387 cleared moves identically, and two runs made at different times gave identical tables.

## Parameters

There are three preset people (novice, regular, expert) and two continuous dials between them. Each dial runs 0 = novice, 1 = regular, 2 = expert, and beyond 2 carries on along the regular-to-expert line, with floors.

| Dial | Moves these | Owner value |
|---|---|---|
| hands | reaction delay, thinking interval, aim time, aim and power error, stick error, run timing error, moving while aiming, how close he lets a tackler come | 2 (expert hands: 0.2 s reaction, 3 degrees aim error) |
| head | route-judgement noise, insight after a failure, patience before going back, how soon he learns to play first time, foresight on lanes, offside-line error | 1 (regular judgement: 1.6 m line error, allows for 70% of a defender's movement) |

Fitted parameters: two. Everything else is fixed by hand, or measured from the engine like the keeper sense above. The reaction delays are 0.35 s for the novice, 0.25 s for the regular and 0.2 s for the expert and owner.

## Calibration

**Data.** The owner's takes on the original 20 (set A, this morning, original clocks), plus "about 2" on today's 60.

**Method.** The loss is the squared difference in log takes between the model's geometric mean and the owner's count. The geometric mean is used because the median of small whole numbers is too coarse to fit. Fixtures 4, 8, 12, 16 and 20 were held out, with the owner's counts 2, 3, 1, 3 and 14 (easy to hard). There were 80 runs per fixture per setting, and the grid was hands 1.5-2.5 by head 0.5-2, then refined around the best point (head 0 and 0.25; hands 1.75 and 2.25). A first pass with 40 runs also covered hands 3 and head 2.5; both were worse.

**Step 1: hold-out test.** Fitted on the 15 training fixtures only, the best was hands 1.75, head 0.5. Its typical miss was a factor of 1.73 on training fixtures and 3.0 on held-out ones; Spearman on all 20 was 0.63 (medians) and 0.59 (geometric means). The held-out miss is worse because the held-out five happen to include three of the model's worst fixtures (8, 12, 20), not because of fitting. With two parameters and a flat surface, every setting in the grid had a held-out miss between a factor of 2.6 and 3.2.

**Step 2: production fit.** Level 60 was not used in step 1, so it is a true out-of-sample check. The step-1 fit puts it at a median of 5 (quartiles 3-8): too hard, though still mid-table, not hardest. Refitting on all 21 owner numbers gives hands 2, head 1, with a loss within noise of step 1 (0.52 against 0.53 per fixture). That is the `owner` profile in `player.js`. Its numbers:

| No. | Fixture | Owner | Model median (quartiles) | Set |
|---|---|---|---|---|
| 1 | First pass | 1 | 1 (1-1) | train |
| 2 | Through ball | 1 | 2 (1-3) | train |
| 3 | Down the wing | 1 | 2 (1-4) | train |
| 4 | The decoy | 2 | 1 (1-2) | held out |
| 5 | Switch of play | 4 | 3 (2-6) | train |
| 6 | The lay-off | 2 | 2 (1-3) | train |
| 7 | The cut-back | 2 | 2 (1-2) | train |
| 8 | The overlap | 3 | 6 (4-13) | held out |
| 9 | Diagonal in behind | 12 | 4.5 (2-8) | train |
| 10 | Third-man run | 3 | 3 (2-6) | train |
| 11 | The counter | 2 | 5 (2-9) | train |
| 12 | Push them back | 1 | 3 (1-5) | held out |
| 13 | Beat the trap | 13 | 8 (5-12) | train |
| 14 | Clear the channel | 5 | 2.5 (2-5) | train |
| 15 | Play through the press | 5 | 3 (1-5) | train |
| 16 | Sweeper-keeper | 3 | 3 (2-5) | held out |
| 17 | Far post | 7 | 2 (1-4) | train |
| 18 | False nine | 6 | 8.5 (4-14) | train |
| 19 | Five-man move | 15 | 7 (4-15) | train |
| 20 | Last-minute winner | 14 | 2 (1-6) | held out |
| 60 (today) | Total football | about 2 | 3 (2-7) | used in step 2 only |

(80 runs per fixture. `run.js` uses 30 runs, so its medians can differ by half a take.)

Rank correlation with the owner on the 20: 0.51 on medians, 0.60 on geometric means. Two of the owner's three hardest fixtures (19 and 13) are among the model's three hardest (18, 13, 19); the third (20) is not.

**Biggest misses.**
- Too easy in the model: 20 (14 against 2), 17 (7 against 2) and 9 (12 against 4.5). On 20 the owner lost seven takes to interceptions in the second player's round; the model, picking its own pass, rarely does.
- Too hard in the model: 8, 11 and 12, which the owner cleared in 1-3 takes. The model's own route there runs into a screen that the designer's route (and the tip) goes round.

**The ceiling.** I drew one take count per fixture from the model's own runs, as if the model were the owner, 2,000 times. Its Spearman against its own medians was 0.57 at the median, and between 0.29 and 0.79 in 90% of draws. A single take count per fixture is that noisy. A model scoring 0.51-0.63 cannot be told apart from a perfect one with these 20 numbers, and nor can most rivals.

**Against the other instruments.** On the same 20:

| Instrument | Spearman | Range of takes it gives | Level 60 |
|---|---|---|---|
| Bot route plus jitter (`tools/test.js --jitter`; expected takes = 1 + the sum over rounds of (1/success - 1)) | 0.62 | 1.0 to 2.3: far too flat | 2nd hardest of 60 |
| Forensics route-blind estimate (`naive-baseline`) | 0.56 | 2 to 164: far too steep | 27.5 takes, 19th hardest |
| Colleague's player as found (expert / regular tier) | 0.42 / 0.56 | 1 to 11 / 1 to 14 | 3 / 6 |
| This model, owner profile | 0.51 (0.60 on geometric means) | 1 to 8.5 | 3 (2-7), middle of the 60 |

All four sit inside the noise band, so rank correlation on 20 single counts cannot pick between them. What separates them is that this model gives takes on the owner's scale and does not call 60 hard.

**How the failures are spread.** The owner's 81 failed takes on the 20 are compared below with the model's 3,046 (40 runs per fixture).

| Cause | Owner | Model |
|---|---|---|
| Interceptions (model: includes blocked shots, 8%) | 42% | 61% |
| Offside | 16% | 4% |
| Shot wide or saved | 17% | 20% |
| Keeper sweeps a pass | 9% | 3% |
| Tackled | 6% | 9% |
| Lost on the last player's round | 60% | 63% |

The share on the last player now matches. The model still produces too few offsides and too many interceptions.

## Today's 60 (owner profile, 30 runs each)

By pack, the median of the fixture medians is:
- 1-20: 2.5
- 21-28: 3
- 29-36: 4.5
- 37-44: 4
- 45-52: 6
- 53-60: 5

Hardest: 53 Up, back and through (13.5), 50 Draw them out (12), 36 The spare man and 59 The reverse pass (11), 18 False nine and 48 Blind-side run (9.5). Fixture 28 Kick-off routine has a median of 7.5, but 13% of runs never clear it within 60 takes.

Today's 1-20 come out almost the same as the original 20. The model seldom runs out of time, so the extra 20% on the clocks barely registers for it.

Per fixture. The last column shows the round with the most losses, then the commonest cause across the fixture.

| No. | Fixture | Takes: median (quartiles) | 90th | Lost most on |
|---|---|---|---|---|
| 1 | First pass | 1 (1-1) | 2 | P2, saved (shot) |
| 2 | Through ball | 2 (1-3) | 5 | P2, intercepted before the ball |
| 3 | Down the wing | 1.5 (1-5) | 6 | P3, keeper before the ball |
| 4 | The decoy | 2 (1-2) | 4 | P3, saved (shot) |
| 5 | Switch of play | 2 (1-3) | 5 | P3, saved (shot) |
| 6 | The lay-off | 2 (1-3) | 4 | P3, saved (shot) |
| 7 | The cut-back | 2 (1-3) | 5 | P3, saved (shot) |
| 8 | The overlap | 6.5 (3-13) | 18 | P4, intercepted before the ball |
| 9 | Diagonal in behind | 4.5 (2-8) | 13 | P3, intercepted (shot) |
| 10 | Third-man run | 3 (2-10) | 12 | P3, intercepted before the ball |
| 11 | The counter | 5 (2-8) | 10 | P3, intercepted before the ball |
| 12 | Push them back | 4 (2-5) | 9 | P3, intercepted before the ball |
| 13 | Beat the trap | 9 (5-11) | 19 | P3, intercepted before the ball |
| 14 | Clear the channel | 2 (2-4) | 7 | P5, intercepted (pass) |
| 15 | Play through the press | 2.5 (1-5) | 8 | P3, intercepted before the ball |
| 16 | Sweeper-keeper | 3 (2-4) | 15 | P4, intercepted before the ball |
| 17 | Far post | 2 (1-4) | 8 | P5, intercepted before the ball |
| 18 | False nine | 9.5 (4-14) | 23 | P4, intercepted before the ball |
| 19 | Five-man move | 7.5 (4-16) | 19 | P4, intercepted before the ball |
| 20 | Last-minute winner | 2 (1-3) | 8 | P4, saved (shot) |
| 21 | Short corner | 6.5 (4-13) | 17 | P3, intercepted (pass) |
| 22 | Tapped free kick | 3 (1-5) | 8 | P3, saved (shot) |
| 23 | Quick throw-in | 8 (5-13) | 17 | P4, intercepted (pass) |
| 24 | Near-post corner | 3 (2-7) | 10 | P3, tackled on the ball |
| 25 | Round the wall | 2 (1-3) | 5 | P3, bump before the ball |
| 26 | The flick-on | 3 (1-7) | 21 | P3, intercepted (pass) |
| 27 | Corner to the edge | 2 (1-5) | 10 | P4, saved (shot) |
| 28 | Kick-off routine | 7.5 (2-27) | 60+ | P4, tackled on the ball |
| 29 | Into the channel | 2.5 (2-4) | 5 | P3, saved (shot) |
| 30 | Break down the flank | 7.5 (3-12) | 25 | P3, intercepted (pass) |
| 31 | Through the middle | 2 (1-4) | 6 | P3, intercepted before the ball |
| 32 | Strike on the break | 3 (2-4) | 4 | P3, intercepted before the ball |
| 33 | Two against one | 4 (3-5) | 8 | P3, intercepted (shot) |
| 34 | Near-post run | 4.5 (2-7) | 14 | P2, intercepted (pass) |
| 35 | Three against two | 6 (4-10) | 21 | P4, tackled on the ball |
| 36 | The spare man | 11 (3-20) | 25 | P4, intercepted (shot) |
| 37 | The set-back | 3 (2-7) | 11 | P3, intercepted before the ball |
| 38 | Square ball | 3 (2-6) | 8 | P3, intercepted before the ball |
| 39 | The dummy run | 6 (3-10) | 15 | P4, intercepted before the ball |
| 40 | Draw the centre-half | 9 (4-13) | 17 | P3, intercepted before the ball |
| 41 | The early cross | 7 (3-10) | 17 | P3, intercepted before the ball |
| 42 | The knock-down | 3.5 (2-9) | 16 | P3, time (shot) |
| 43 | Across the keeper | 4 (3-6) | 11 | P3, saved (shot) |
| 44 | One-touch move | 2 (1-4) | 7 | P4, saved (shot) |
| 45 | The overload | 1 (1-2) | 9 | P4, time (shot) |
| 46 | Let it run | 3 (3-5) | 14 | P4, intercepted before the ball |
| 47 | Drag them across | 3 (2-5) | 7 | P4, saved (shot) |
| 48 | Blind-side run | 9.5 (5-15) | 24 | P4, intercepted before the ball |
| 49 | The underlap | 6 (3-13) | 25 | P4, intercepted before the ball |
| 50 | Draw them out | 12 (7-22) | 31 | P4, intercepted before the ball |
| 51 | Inside the full-back | 5 (2-7) | 11 | P4, intercepted before the ball |
| 52 | Crossover runs | 6 (4-11) | 16 | P5, intercepted before the ball |
| 53 | Up, back and through | 13.5 (9-37) | 51 | P4, intercepted before the ball |
| 54 | Between the lines | 5.5 (3-13) | 19 | P4, intercepted before the ball |
| 55 | Draw the keeper | 5 (3-8) | 19 | P4, intercepted (pass) |
| 56 | Short then long | 3.5 (2-8) | 13 | P4, intercepted before the ball |
| 57 | Bend the run | 3 (2-7) | 10 | P5, intercepted before the ball |
| 58 | From distance | 2 (1-3) | 6 | P5, saved (shot) |
| 59 | The reverse pass | 11 (6-27) | 43 | P5, intercepted before the ball |
| 60 | Total football | 3 (2-7) | 12 | P5, intercepted before the ball |

## Level 60: the route the model finds, and why it is easy

The designer's route has the 10 thread a first-time ball through the hole to the 8 at about (30, 20), beyond the line. The 8 must then shoot within a timing window of about 0.17 s (forensics). That is why the bot-plus-jitter instrument called it hard.

The model does something else. Measured over 40 owner-profile runs:
- The two decoys run wide, and their markers (the two centre-halves) go with them.
- The 6 plays into the 10, who meets it early at about (28, 44) and plays it first time, as the tip says. But he plays it short, into the 8 in front of the line (aimed at y of about 35), not through it.
- The 8 receives in front of the line in 100% of cleared runs, with the nearest defender a median of 3.9 m away. He then has 3.8 s on the ball, carries it about 20 m and shoots from about 15 m. No defender gets closer than 1.6 m to the ball while he has it (median).
- The takes lost are mostly the 10's pass to the 8 being cut out (P5 intercepted before the ball, about half), then shots saved or blocked.

Why it is easy:
- The 8 has the ball by about 2.6 s (median) of an 8 s clock.
- Once the decoys have taken the centre-halves away, the middle is empty. The only central defender left is the zone player at (20.6, 19); the two line players start at x = 9 and x = 41.
- The striker has several seconds to walk in and pick a corner, which is exactly the owner's complaint.
- The hard thing in the level, the tight finish on the designer's route, is optional.

## Limits of the instrument

1. **Twenty numbers, one take each.** The validation cannot rank fixtures better than about 0.6 Spearman even for a perfect model. A second rating set, or the owner replaying a few fixtures, would tighten this more than any change to the model.
2. **A factor of 2-3 per fixture.** Held-out fixtures were missed by a typical factor of 2.6-3.0. Trust bands (1-2 easy, 3-6 medium, 7+ hard) and pack averages, not exact counts.
3. **Known biases.** Too few offsides (4% against 16%) and too many interceptions. Some designed routes (8, 11, 12) look harder to the model than they are, because it picks its own pass. Some second-round interceptions (fixture 20) are rarer for the model than for the owner.
4. **Hand-written football sense.** Passing targets, carrying spots and the finisher are heuristics. A level whose answer lies outside them will read as harder than it is: a pass longer than 34 m, beating a man with a feint, or a deliberate run to drag a marker. Decoys choose their runs by one simple rule.
5. **Perfect, delayed eyesight.** He sees exact positions 0.2 s late. There is no phone-screen perspective, no limit on attention, and no misreading of which way a defender faces. The ball is seen at once.
6. **No memory between days.** The owner had played these 20 on Saturday. The model starts each fixture fresh and learns only within it.
7. **The tips.** He reads them by keywords ("first time", "aim early", "wait", "as the 10 plays it"). Generated levels must word their tips the same way, or be run with `tips: 0`.
8. **The clock rarely bites.** Changes that only lengthen or shorten clocks will hardly move the model's numbers.
9. **Fun is not modelled.** It predicts takes, not enjoyment. The ratings show that takes alone do not make fun.
10. **Cap of 60 takes.** Runs that never clear count as 61.

## How to run it

- `node tools/human/run.js`: the original 20 (B1-B20) plus today's 60, owner profile, 30 runs each. About 65-80 s on one core.
- `node tools/human/run.js --tiers owner,novice,regular,expert --md --out FILE`: all four profiles, about 6 min.
- `node tools/human/run.js --root DIR`: any other checkout, for example a generated pack.
- `node tools/human/run.js --routes 60` shows each person's route; `--check` runs the determinism checks.
- `node tools/human/calibrate.js --n 80` refits over the main grid; about 1 min per setting.
- `node tools/human/calibrate.js --hands 2 --head 1 --n 80` reproduces the table above.

## What changed from the code I inherited

- The finish was rewritten. The striker now picks a corner using an engine-fitted sense of the keeper, carries the ball to where a corner opens, and shoots when the chance is good or starting to fade. He allows for legs closing in while he aims.
- Beating a tackle: he cuts away when a man gets close or plants.
- Offside: an eager, timed run, an error in reading the line, and caution learnt after being caught.
- Tips: he reads the kind of touch they ask for.
- Through balls: defenders who must turn are judged slower.
- Two continuous skill dials, `calibrate.js`, and the fitted `owner` profile.
- `run.js`: both checkouts (80 fixtures) by default, the owner profile, and `--out`. Its seeds match `calibrate.js`.
