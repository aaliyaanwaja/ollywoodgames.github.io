# Foundations 03: baseline 13-20 against today's 53-60 and 21-60

Same engine (byte-identical `sim.js`). Baseline levels measured on `/home/claude/baseline` at their original clocks;
today's 21-60 on `/home/claude/ollywoodgames.github.io` as they stand (clocks lengthened 20%). Scripts as in 01, plus
`finish.js`, `humanfinish.js`, `aim3.js` and the human model frozen in `foundation-work/human-snapshot/`. Table
generator: `ratings/gen03.py`.

The only human evidence for the later levels is one sentence: 60 was beaten "in about two takes. Very easy." Baseline
13-20 took him 3-15 takes this morning (and 20+ on one of them on Saturday).

## Group comparison (measured)

| measure | base 1-4 | base 5-12 | base 13-20 | today 53-60 | today 21-60 |
|---|---|---|---|---|---|
| clock s (median) | 12.5 | 10 | 10.5 | 11 | 10.5 |
| slack s (median) | 7.5 | 4 | 3.8 | 5.25 | 5.35 |
| slack s (smallest) | 6.3 | 3 | 1.8 | 4 | 3.9 |
| ball players (median) | 2 | 3 | 3.5 | 4 | 3 |
| defenders (median) | 2 | 5 | 6 | 6 | 6 |
| defender speed (median of means) | 4.6 | 5.2 | 5.31 | 5.52 | 5.17 |
| levels with a press | 0/4 | 4/8 | 4/8 | 7/8 | 20/40 |
| tightest lane m (median) | 7.35 | 2.7 | 1.4 | 3 | 2.1 |
| closest defender at a reception m (median) | 7.15 | 3.7 | 1.5 | 2.7 | 2.7 |
| tight knobs before the finish (median) | 0 | 1.5 | 3 | 3 | 1 |
| on-ball touches with <0.6 s spare before the last player (mean) | 0 | 0 | 1.25 | 0.5 | 0.55 |
| last pass with live offside (margin < 5 m) | 2/4 | 4/8 | 5/8 | 2/8 | 7/40 |
| finisher gets it, m from goal (bot, median) | 20.7 | 20.85 | 16.9 | 20.95 | 18.4 |
| bot shot distance m (median) | 10.35 | 11.2 | 10.35 | 18.25 | 15.9 |
| bot shot: goal open m (median) | 4.8 | 4.45 | 4.8 | 1.8 | 2.65 |
| bot shot: aim window deg (median, corrected) | 13 | 13.25 | 12.75 | 3 | 5.75 |
| bot shot: s until a defender could win it (median) | 2.11 | 0.76 | 0.73 | 0.71 | 0.85 |
| human-route shot distance m (median) | 12.13 | 13.06 | 11.74 | 13.07 | 12.66 |
| human-route shot: goal open m (median) | 4.9 | 3.9 | 4.47 | 4.17 | 4.1 |
| human-route shot: nearest defender m (median) | 11.84 | 2.63 | 2.62 | 2.15 | 2.67 |
| human-route shot: s until a defender could win it (median) | 2.56 | 0.58 | 0.58 | 0.5 | 0.59 |
| human-route: finisher on the ball s (median) | 1.47 | 4.45 | 1.55 | 2.75 | 2.86 |
| human model, owner profile: takes (median of geo. means) | 1.57 | 3.7 | 3.44 | 4.84 | 3.75 |
| human model, expert: takes (median of geo. means) | 1.57 | 3.43 | 3.03 | 5.25 | 3.56 |
| human model, owner profile: share of failures on the last player (median) | 1 | 0.83 | 0.54 | 0.73 | 0.75 |

"Human-route" rows are measured on the moves that 30 simulated expert players scored with, not on the bot's route (07,
section 5). "Tight knobs": pass aim under 15 degrees, pass power under 25% of the bar, run timing under 1 s, before the
finish, with the whole move required to score. From the colleague's `compare.md` (re-run and checked): passes into
space 76% in 13-20 against 45% in 53-60; decoys needed by the bot's route 6 of 6 against 3 of 6; route-blind takes
(median) 25 against 22.

## Fixture by fixture: the middle of the move

| # | slack s | tightest lane m | closest at reception m | tight knobs | touches <0.6 s before last | live offside last pass | decoys needed |
|---|---|---|---|---|---|---|---|
| B13 | 4.5 | 1.8 | 3.1 | 4 | 1 | 0.3 m | - |
| B14 | 3.7 | 0.9 | 2.3 | 2 | 1 | no | 2/2 |
| B15 | 3.2 | 1.1 | 1.3 | 3 | 2 | 1.6 m | - |
| B16 | 4.1 | 1.8 | 1 | 4 | 1 | 4.5 m | - |
| B17 | 3.9 | 1.2 | 1.2 | 2 | 0 | no | 2/2 |
| B18 | 3.5 | 1.6 | 1.7 | 3 | 1 | 4 m | 1/1 |
| B19 | 4.4 | 1 | 0.4 | 4 | 3 | 4.8 m | - |
| B20 | 1.8 | 1.6 | 3.4 | 2 | 1 | no | 1/1 |
| 53 | 4 | 2 | 2.2 | 5 | 1 | 0.6 m | - |
| 54 | 5.8 | 4.3 | 5 | 0 | 0 | no | - |
| 55 | 5.1 | 1.8 | 2.6 | 3 | 1 | no | - |
| 56 | 5.4 | 2.2 | 1.9 | 3 | 1 | no | - |
| 57 | 4.1 | 3.8 | 4.3 | 1 | 0 | 2 m | 0/1 |
| 58 | 5.4 | 4.9 | 5.2 | 0 | 0 | no | 1/2 |
| 59 | 6.1 | 1.3 | 1.6 | 6 | 1 | no | 1/1 |
| 60 | 4.6 | 4.5 | 2.8 | 3 | 0 | no | 1/2 |

## Fixture by fixture: the finish and the model

| # | owner-profile takes | expert takes | bot shot m | bot goal open m | human shot m | human goal open m | human win s |
|---|---|---|---|---|---|---|---|
| B13 | 8.5 | 7.8 | 10.6 | 4.8 | 13.2 | 4.6 | 0.54 |
| B14 | 2.8 | 2.8 | 9.5 | 4.5 | 12.8 | 4.6 | 0.77 |
| B15 | 2.3 | 3.0 | 10.3 | 4.6 | 11.4 | 4.5 | 0.68 |
| B16 | 4.1 | 2.9 | 10.4 | 4.7 | 10.7 | 4.5 | 0.59 |
| B17 | 1.9 | 1.8 | 13.7 | 5.8 | 11.9 | 3.6 | 0.61 |
| B18 | 6.1 | 6.6 | 10.3 | 5.2 | 11.6 | 4.6 | 0.58 |
| B19 | 5.4 | 4.8 | 10.5 | 4.9 | 11.3 | 4.2 | 0.58 |
| B20 | 2.1 | 3.1 | 9.9 | 4.8 | 13.1 | 4.2 | 0.52 |
| 53 | 9.4 | 9.7 | 12.6 | 4.9 | 13.0 | 4.1 | 0.47 |
| 54 | 5.3 | 5.7 | 19.5 | 2 | 14.3 | 3.2 | 0.54 |
| 55 | 5.0 | 5.3 | 7.9 | 6.7 | 11.4 | 4.3 | 0.43 |
| 56 | 4.0 | 2.6 | 17.9 | 1.3 | 12.7 | 4.5 | 0.48 |
| 57 | 4.6 | 5.2 | 11.3 | 5.1 | 13.1 | 4.7 | 0.52 |
| 58 | 1.4 | 1.6 | 20.8 | 1.6 | 13.1 | 4.2 | 0.67 |
| 59 | 10.4 | 9.7 | 18.6 | 1.3 | 15.7 | 2.9 | 0.56 |
| 60 | 3.3 | 3.3 | 20 | 1 | 13.2 | 3.7 | 0.46 |

## Ranked hypotheses for "the later ones play easy"

### 1. The middle of the move lost its jeopardy (strongest)

**Evidence.** In set A his takes go with mid-move pressure and with failing before the last player (07). Baseline
13-20 have a tightest lane of 0.9-1.8 m in every fixture and a defender within 0.4-3.4 m at some reception. 60 has a
tightest lane of 4.5 m, no on-ball touch with under 0.6 s to spare, and no live offside on the last pass. So do 54 and
58. Group medians: tightest lane 1.4 m against 3.0 m, closest defender at a reception 1.5 m against 2.7 m, rushed
touches 1.25 against 0.5 per level.
**Against.** Tight knobs are the same (median 3 against 3), but in 53-60 they belong to the bot's particular route
(for example 60's final run has a 0.13 s timing window and 2.5 degrees of shot aim), which a person does not follow.
**Experiment.** Copy 60 and move its hunter and the zone so that the pass into the 10 and the 10's through ball pass
within 1.5 m of a defender (the baseline 13-20 range). Owner plays original and copy in random order. Confirmed if the
copy takes 8 or more with fair 5 while the original stays near 2; killed if both stay under 4.

### 2. The difficulty was moved into a long shot that a person does not take

**Evidence.** The bot's shot in 53-60 is from 18.3 m (median) with 1.8 m of goal open and a 3 degree aim window; in
baseline 13-20 it is 10.4 m, 4.8 m open, 12.75 degrees. That is what the jitter test and `windows.js` saw, and why they
called 60 the hardest. Simulated players carry in instead: 13 m and 4.2 m open on 53-60 against 11.7 m and 4.5 m on
13-20. The long-shot difficulty exists only on the bot's route.
**Experiment.** Ask the owner (or log, on the rating build) where he shoots from in 60. Confirmed if from about 15 m or
closer; killed if he scores from 18-20 m as the bot does.

### 3. The longer clocks removed the hurry

**Evidence.** Slack: median 5.25 s against 3.8 s; smallest 4.0 s against 1.8 s. His only time failures (3 of 81) are in
9 and 20, and those two are the fixtures no instrument explains (07, section 2): both ask for a long pass from deep on a
short clock.
**Against.** Clock slack on its own does not go with his takes once fixture number is held fixed (+0.08).
**Experiment.** Owner plays 53-60 at their pre-20% clocks (divide by 1.2, round up). Confirmed if takes rise clearly,
above all where the move contains a long pass; killed if takes barely move.

### 4. Fewer offside decisions

**Evidence.** A live offside call on the last pass (receiver ahead of the ball, under 5 m onside): 5 of 8 in baseline
13-20, 2 of 8 in 53-60, 7 of 40 across 21-60. In set A, offside is his second-largest cause of failure (13 of 81, 7 of
them on 19's last run).
**Experiment.** In a copy of 60, make the 10 a pressed passer (hunter within 3 m as he plays it) so the line holds and
the runner must be level. Same rating design as hypothesis 1.

### 5. He has got better, and he played 60 last

**Evidence.** His own words; his worst baseline fixture fell from 20+ takes on Saturday to 15 today. The human model's
owner profile (fitted to his set A takes) predicts 53-60 HARDER than 13-20 (median 4.8 against 3.4 takes) and 60 at 3.3,
close to his "about two". It also predicts 19 and 20 at 5.4 and 2.1, against his 15 and 14. The model does not see what
made the hard baseline fixtures hard, so it cannot settle this.
**Experiment.** Set B: 60 and B19 again, both at original clocks, in random order.

### 6. Decoys became padding (weak)

**Evidence.** Half the decoys in 53-60 are not needed by the bot's route (3 of 6) against all of them in 13-20 (6 of 6).
A round that cannot fail adds length without jeopardy.
**Against.** In set A decoys do not go with his takes (+0.14) or fun (-0.01).
**Experiment.** For a level with an unneeded decoy, check whether any route a person takes needs him (human model
routes); a rule "every decoy must be needed" is cheap to enforce anyway.

### Killed or not supported

- **"The finish got easier."** Not on players' routes: goal open 4.2 m against 4.5 m, a defender able to win it in
  0.50 s against 0.58 s. The finish was already soft in the baseline (07).
- **"The later levels allow more routes."** Route-blind takes are similar (median 22 against 25). Not supported.
- **"Fewer, slower defenders."** 53-60 have as many defenders (median 6) and faster ones (5.52 against 5.31 m/s), with
  more hunters (7 of 8 against 4 of 8). Numbers of defenders are not the difference; where they stand is.

## What this means for the rulebook

Difficulty a person feels lives in the middle of the move: tight lanes, hurried receptions, live offside, short clocks
on long passes. The later packs kept the counts (defenders, hunters, tight knobs on the bot's route) but put the
tightest number in the bot's final shot, which a person simply walks around. Any generator check must measure the
routes people take, not one scripted route.
