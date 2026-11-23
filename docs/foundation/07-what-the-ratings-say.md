# Foundations 07: what the owner's ratings say

Set A (06): the owner played the Saturday-evening 20 once each this morning and rated challenge, fun and fair, with his
takes and fail codes. This relates those numbers to every measurement we have (01, 03), and answers his complaint about
the finish. Scripts: `/home/claude/foundation-work/ratings/correlate.py`, `gen07.py`; finish measures
`forensics/finish.js`, `humanfinish.js`; prototypes `forensics/proto.js`.

## The short answer

1. **His takes follow the middle of the move, not the finish.** Takes go with more and faster defenders, tighter lanes,
   tighter reception and more tight passes before the finish (rank correlations +0.6 to +0.8). Finish measures go
   with takes weakly or not at all (largest -0.49, falling to -0.18 once fixture number is held fixed). 67 of his 81 failed takes were not shots; only 14 were shots wide or saved.
2. **But all of that is also the fixture number.** His takes rise with fixture number (+0.76) and so do most measures.
   Holding fixture number fixed, nothing we measured predicts his takes reliably. With 20 fixtures, one play each, this is
   the honest limit.
3. **No instrument beats "how far through the set is it?"** Route-blind takes +0.56, the human model's takes +0.45
   to +0.61, jitter -0.57, against +0.76 for the fixture number. The best, the human model's share of failures before
   the last player (+0.78), only matches it. All of them miss 9 and 20 badly.
4. **Fair 5 means "I failed in the middle and knew why".** Four of his five fair-5 fixtures (9, 13, 19, 20) are the
   four where he failed most before the last player (4-8 times; no other fixture more than twice). The fifth, 14, he
   failed four times, all on the last player.
5. **Fun is barely predictable.** Fun goes with challenge (+0.48) and does not rise through the set (+0.08). The three
   fun-5 fixtures share a ball-hunter on the early passes and a long run on goal after a timed final pass; the five fun-3
   fixtures have no hunter at all. Suggestive only (3 against 5 fixtures).
6. **His complaint is right, and it is the engine as much as the levels.** At the baseline's usual finish (about 10 m) the
   keeper cannot react before the ball passes him, about 4.5 m of the 8 m goal is open in two corners, and the nearest
   defender needs about 0.6 s or more to win the ball. 53-60 are no different once a person picks the route.

## Caveats that apply to everything below

- n = 20, one play each, in fixture order, by a player who says he has improved since Saturday.
- About 50 measures were tested against 4 ratings. At p < 0.05 two or three "hits" per rating are expected by chance.
  P-values are two-sided permutation tests on Spearman's rank correlation (5,000 shuffles).
- Fun and fair use only three values each (3/4/5 and 4/5), so their correlations are coarse.
- "Human model" is `tools/human/player.js`, frozen as it stood at 12:11 today (it was being edited during this work; the
  copy is in `foundation-work/human-snapshot/`). Its "owner" profile was fitted to these same takes (two global dials),
  so its agreement with them is not independent evidence.

## 1. What goes with his takes

| Measure | With takes | Fixture number held fixed |
|---|---|---|
| Fixture number | +0.76 | - |
| Defender speed, mean | +0.82 | +0.53 (p 0.02) |
| Defenders | +0.79 | +0.42 (p 0.06) |
| Rounds | +0.76 | +0.34 |
| Bot move time / clock | +0.75 | +0.35 |
| Closest defender at any reception (smaller = more takes) | -0.73 | -0.36 |
| Tightest passing lane | -0.69 | -0.21 |
| Touches before the last player with under 0.6 s to spare | +0.66 | +0.20 |
| Tight knobs before the finish | +0.64 | +0.29 |
| Tightest pass power window | -0.60 | -0.35 |
| Clock slack | -0.42 (p 0.06) | +0.08 |
| Finish: goal open (bot route) | +0.14 | +0.11 |
| Finish: seconds before a defender could win it (bot route) | -0.27 | -0.01 |
| Finish: shot distance (bot route) | -0.13 | -0.13 |

All raw correlations shown above |0.6| have p < 0.01. With fixture number held fixed, four of about 50 measures fall
below p 0.05: defender speed (+0.53), sweeper keeper (-0.52, only three fixtures have one), the colleague's shotmap
"seconds the chance stays open" (-0.51) and the human model's share of failures before the last player (+0.46). That
is about what chance alone gives; defender speed and the failure share are the two with a football reason behind them.

**His failures say the same.** Interceptions (34 of 81) and offside (13) dominate. Fixtures with more failures before
the last player took more takes (+0.73; +0.65 with fixture number held fixed). "Keeper" failures (7) are passes the
keeper claimed, not saves. Shots wide or saved: 14 of 81, and none at all in 13 of the 20 fixtures.

## 2. Do the instruments predict his takes?

| Instrument | Rank correlation with takes | Fixture number held fixed |
|---|---|---|
| Fixture number (no instrument) | +0.76 | - |
| Human model, share of failures before the last player | +0.78 | +0.46 (p 0.04) |
| Human model, expert, takes | +0.61 | +0.40 (p 0.07) |
| Human model, owner profile (fitted to him), takes | +0.45 | +0.11 |
| Jitter, lowest round % (`test.js --jitter`) | -0.57 | +0.04 |
| Route-blind takes, quick aim (colleague's `naive.js`) | +0.56 | +0.25 |
| Route-blind takes, 0.6 s aim | +0.40 | +0.24 |
| Random finishers who score (`finalround.js`) | -0.14 | +0.12 |

**Where they go wrong.** Every instrument rates 9 and 20 as ordinary (owner profile 3.5 and 2.1 takes; he took 12 and
14), and route-blind rates 5, 8, 11 and 12 as very hard (34-43 takes; he took 1-4). On 20 he lost 7 takes in the 10's
round (intercepted); on 9, 4 in the 8's round. Both are long passes (31 m, 28 m) hit from 17-21 m before the line on short
clocks (7 s, 10 s). No instrument models a person rushing a long pass because the clock is short.

**Where they agree with him.** The tolerance windows point at the round he failed in (01, "What stands out" 4): the
narrowest window of the move is where his failures cluster in 9, 13, 18 and 19.

**Verdict.** None of the instruments, including the colleague's route-blind takes, predicts his takes better than the
fixture number does. The human model's "where do failures land" is the most promising signal, and it is about the middle
of the move.

## 3. Fun 5 against fun 3

Fun 5: 5 Switch of play, 10 Third-man run, 13 Beat the trap. Fun 3: 2, 6, 8, 12, 16.

| Measure | Fun 5 (median) | Fun 4 | Fun 3 |
|---|---|---|---|
| Takes | 4 | 5 | 2 |
| Challenge | 3 | 3 | 3 (two of five rated 2) |
| Levels with a ball-hunter (`press`) | 2 of 3 | 6 of 12 | 0 of 5 |
| Ball players | 4 | 3 | 3 |
| Tight knobs before the finish | 3 | 1.5 | 1 |
| Last pass offside margin m (no offside possible counted as largest) | 3.4 | 5.5 | 9.2 |
| Finisher gets it, m from goal | 26 | 17 | 16 |
| Finisher carry m | 16 | 7 | 6 |
| Seconds before a defender could win it at the shot | 1.16 | 0.81 | 0.71 |

What the three fun-5 fixtures share, on the measurements: a hunter or a screen that forces the early passes, a final
pass to a runner who must time the line (onside by 0.3-3.6 m), then a long run on goal (14-17 m). The fun-3 group has
no hunter, includes both fixtures he rated too easy (8 and 12, challenge 2), and all five took three takes or fewer.
None of these differences is statistically significant (best: hunters, p about 0.1). Fun rises with challenge
(+0.48, p 0.02) and with his own shot failures (+0.49, p 0.03), and does not rise through the set (+0.08).

Note the tension: the fun-5 fixtures give the finisher MORE time at the end, not less (1.16 s median). What he enjoyed
there was the timed pass and run, not a hard finish. Taking time away from the finisher should not take away that run.

## 4. Fair 5

Fair 5: 9, 13, 14, 19, 20 (takes 12, 13, 5, 15, 14). Every fair-5 fixture took at least 5 takes.

| Measure | Fair 5 (median) | Fair 4 | p |
|---|---|---|---|
| His failures before the last player | 5 | 0 | 0.01 |
| His interceptions | 4 | 0 | 0.02 |
| Human model: share of failures before the last player | 0.39 | 0.10 | 0.06 |
| Route-blind takes | 35 | 6.5 | 0.09 |
| Tightest passing lane m | 1.6 | 2.9 | 0.3 |
| Finish: anything | no difference | | |

Reading: he calls a fixture "my own fault" when it beat him repeatedly, mostly in the middle of the move by
interception or offside, where he could see what he had done (14 is the exception: three shots wide). That is the kind
of difficulty to keep.

## 5. His complaint: time and space at the finish

"The strikers almost always had too much time so I could pick a corner to score very easily."

**How it was measured.** (a) On the bot's route, frozen on the tick before the shot (`finish.js`). (b) On the routes 30
simulated expert players found and scored with (`humanfinish.js`): their recordings replayed, frozen before the shot,
and the shot swapped for full-power shots along the goal line. Columns: shot distance; nearest defender on his feet;
his closing speed towards the shooter; seconds until any defender could win the ball (distance less lunge range at full
speed, plus patience and the 0.2 s plant); keeper metres off his line; metres of the 8 m goal that score; on the bot's
route, how long the shooter can stand aiming before under 1 m scores or he loses the ball.

**Bot's route (baseline 1-20, then today's 53-60)**

| # | Takes / fun | Shot m | Nearest def. m | Closing m/s | Could win it s | Keeper out m | Goal open m | Corner open s |
|---|---|---|---|---|---|---|---|---|
| 1 | 1 / 4 | 10.2 | 14.4 | 0.4 | 3.57 | 5 | 4.8 | 3+ |
| 2 | 1 / 3 | 9.7 | 2.1 | 4.1 | 0.5 | 5 | 4.6 | 0.5 |
| 3 | 1 / 4 | 12.9 | 5.4 | 1 | 1.22 | 3.2 | 5.9 | 1.25 |
| 4 | 2 / 4 | 10.5 | 14.2 | 0.3 | 3.01 | 4.9 | 4.8 | 3+ |
| 5 | 4 / 5 | 10.3 | 3.3 | 0.9 | 0.71 | 4 | 3.8 | 0.75 |
| 6 | 2 / 3 | 10.7 | 3.2 | 2.3 | 0.71 | 4.8 | 4.6 | 0.6 |
| 7 | 2 / 4 | 13.3 | 4.8 | 1.8 | 1.03 | 3.1 | 5.2 | 1.25 |
| 8 | 3 / 3 | 12.5 | 3.8 | 4 | 0.82 | 2.9 | 5.7 | 1 |
| 9 | 12 / 4 | 11.7 | 2.8 | 0.7 | 0.63 | 3.9 | 4.3 | 0.6 |
| 10 | 3 / 5 | 10.3 | 8.1 | 3.3 | 1.64 | 5 | 4.7 | 3+ |
| 11 | 2 / 4 | 10.5 | 1.2 | 0.6 | 0.43 | 4.4 | 2.7 | 0 |
| 12 | 1 / 3 | 14.8 | 3.7 | 0.4 | 0.82 | 1.4 | 2.7 | 3+ |
| 13 | 13 / 5 | 10.6 | 5.6 | 5.1 | 1.16 | 4.8 | 4.8 | 1.25 |
| 14 | 5 / 4 | 9.5 | 1.4 | 2.6 | 0.43 | 4.9 | 4.5 | 0.3 |
| 15 | 5 / 4 | 10.3 | 1.6 | 3.5 | 0.43 | 5 | 4.6 | 0.4 |
| 16 | 3 / 3 | 10.4 | 3 | 2.9 | 0.66 | 5 | 4.7 | 0.6 |
| 17 | 7 / 4 | 13.7 | 3.8 | 1.1 | 0.82 | 2.7 | 5.8 | 3+ |
| 18 | 6 / 4 | 10.3 | 4.4 | 5.6 | 0.88 | 3.9 | 5.2 | 0.6 |
| 19 | 15 / 4 | 10.5 | 2.5 | 1.3 | 0.56 | 4.9 | 4.9 | 0.4 |
| 20 | 14 / 4 | 9.9 | 3.9 | 5.6 | 0.8 | 4.9 | 4.8 | 0.75 |
| 53 | - | 12.6 | 1.9 | 5.7 | 0.45 | 5.3 | 4.9 | 0 |
| 54 | - | 19.5 | 5.1 | 3.4 | 1.04 | 2.5 | 2 | 0.2 |
| 55 | - | 7.9 | 5 | 5.4 | 1.01 | 4 | 6.7 | 0.4 |
| 56 | - | 17.9 | 2 | 4.4 | 0.46 | 2.5 | 1.3 | 0.5 |
| 57 | - | 11.3 | 4.2 | 5.1 | 0.85 | 4.6 | 5.1 | 0.75 |
| 58 | - | 20.8 | 6.2 | 5.5 | 1.23 | 2.4 | 1.6 | 0.4 |
| 59 | - | 18.6 | 1.7 | 4 | 0.43 | 2.4 | 1.3 | 0 |
| 60 | about 2 / - | 20 | 2.6 | -0.2 | 0.58 | 2.4 | 1 | 0 |

**Routes simulated players actually took (medians of 30 expert players)**

| # | Gets it m | On the ball s | Shot m | Nearest def. m | Could win it s | Under 0.5 s | Keeper out m | Goal open m |
|---|---|---|---|---|---|---|---|---|
| 1 | 14 | 0.7 | 12.8 | 13.2 | 3.29 | 0% | 4.8 | 5.2 |
| 2 | 32 | 3.2 | 12.4 | 2.5 | 0.59 | 17% | 4.4 | 5.1 |
| 3 | 12 | 0.4 | 10.2 | 10.9 | 2.41 | 0% | 3.2 | 4.0 |
| 4 | 22 | 2.3 | 11.8 | 12.8 | 2.71 | 0% | 5.0 | 4.7 |
| 5 | 32 | 4.9 | 13.2 | 2.6 | 0.58 | 23% | 3.5 | 2.2 |
| 6 | 42 | 4.8 | 12.2 | 3.7 | 0.81 | 20% | 4.9 | 4.7 |
| 7 | 25 | 2.3 | 12.9 | 4.4 | 0.94 | 0% | 5.0 | 4.5 |
| 8 | 28 | 4.4 | 14.0 | 2.4 | 0.54 | 43% | 3.7 | 3.5 |
| 9 | 34 | 4.5 | 15.2 | 2.5 | 0.57 | 23% | 3.4 | 2.9 |
| 10 | 19 | 1.9 | 11.1 | 4.3 | 0.87 | 33% | 4.6 | 4.3 |
| 11 | 30 | 4.6 | 12.8 | 2.6 | 0.59 | 30% | 3.6 | 2.8 |
| 12 | 39 | 4.4 | 15.5 | 2.1 | 0.49 | 53% | 4.5 | 4.3 |
| 13 | 21 | 1.9 | 13.2 | 2.4 | 0.54 | 43% | 4.8 | 4.6 |
| 14 | 25 | 2.2 | 12.8 | 3.7 | 0.77 | 0% | 4.9 | 4.6 |
| 15 | 20 | 1.4 | 11.4 | 3.1 | 0.68 | 27% | 4.1 | 4.5 |
| 16 | 14 | 0.5 | 10.7 | 2.6 | 0.59 | 37% | 3.9 | 4.5 |
| 17 | 26 | 2.7 | 11.9 | 2.7 | 0.61 | 13% | 4.2 | 3.6 |
| 18 | 14 | 0.6 | 11.6 | 2.6 | 0.58 | 37% | 4.0 | 4.6 |
| 19 | 14 | 0.8 | 11.3 | 2.6 | 0.58 | 40% | 3.9 | 4.2 |
| 20 | 21 | 1.7 | 13.1 | 2.3 | 0.52 | 37% | 5.3 | 4.2 |
| 53 | 21 | 1.9 | 13.0 | 2.0 | 0.47 | 52% | 4.1 | 4.1 |
| 54 | 35 | 3.9 | 14.3 | 2.4 | 0.54 | 27% | 3.3 | 3.2 |
| 55 | 13 | 0.6 | 11.4 | 1.6 | 0.43 | 67% | 3.8 | 4.3 |
| 56 | 16 | 1.4 | 12.7 | 2.0 | 0.48 | 53% | 4.3 | 4.5 |
| 57 | 21 | 2.1 | 13.1 | 2.3 | 0.52 | 47% | 4.7 | 4.7 |
| 58 | 32 | 3.4 | 13.1 | 3.1 | 0.67 | 17% | 4.9 | 4.2 |
| 59 | 27 | 3.6 | 15.7 | 2.5 | 0.56 | 30% | 3.3 | 2.9 |
| 60 | 34 | 4.3 | 13.2 | 2.0 | 0.46 | 53% | 4.6 | 3.7 |

"Under 0.5 s" is the share of those players with a defender who could win the ball within half a second.

**What the numbers say**

- **The goal is half open.** Baseline median: shot from 10.5 m, 4.75 m of the 8 m goal scores, usually two corners about
  2.4 m wide each, on the bot's route; 4.5 m on players' routes. The keeper stands 4-5 m out and does not get to move:
  from 10 m a full-power shot passes him in about 10 ticks and he waits 13. He saves only what is hit within 0.8 m of him.
- **The striker has time.** On the bot's route, on top of the bot's own 0.2 s of aiming, he can stand and aim for a
  further 0.6 s or more in 15 of 20 fixtures and 3 s or more in 5 (1, 4, 10, 12, 17). The nearest defender needs a
  median 0.8 s to win the ball. On players' routes it is 0.6 s, after the finisher has had the ball for 0.4-4.9 s
  (group medians 1.5-4.5 s), running at goal with every defender slower than him.
- **Aiming needs much less than that.** The bot sets its aim in 0.2 s; the human model's expert in 0.23 s. So in most
  fixtures the finisher can take a touch, look, and place it.
- **Finish measures do not predict his takes or fun** (all |rho| at most 0.34 on the bot's route, none with p < 0.1). The finish is flat
  across the 20, which is why it does not separate them.
- **53-60 are the same once a person chooses the route.** Five of their eight bot shots are from 18-21 m with 1-2 m of
  goal open (the difficulty was put into the bot's shot), but simulated players carry in and shoot from about 13 m with 4.2 m
  open and 0.5 s of pressure: the same finish as the baseline.

## 6. Putting pressure on the finish: what the engine can do

Prototyped on copies of baseline 4, 10, 13 and 18 in the work folder (`proto.js`; no level or engine file touched).
Bot = finish measures on the bot's route; players = 30 simulated experts (open goal, seconds before a defender could
win it) and 30 regulars (takes). The human-model numbers are noisy (30 players) and the model is not validated on
finishing: read them as direction, not size.

| Change | Bot: goal open m | Bot: corner open s | Players: goal open m | Players: takes (regular) | Bot route still works |
|---|---|---|---|---|---|
| None (4 / 10 / 13 / 18) | 4.8 / 4.7 / 4.8 / 5.2 | 3 / 3 / 1.25 / 0.6 | 4.7 / 4.3 / 4.6 / 4.6 | 2 / 4.5 / 9 / 16.5 | yes |
| A. Covering centre-half in the box | - | - | 2.2 / 2.4 / 2.4 / 1.9 | 3.5 / 8 / 18.5 / 19.5 | no (re-script) |
| B. Trailing marker on the finisher | 4.8 / 4.7 / 4.8 / 4.6 | 0.6 / 1 / 0.75 / 0.5 | 4.7 / 4.0 / 4.8 / 4.8 | 2 / 5 / 10.5 / 17 | yes |
| C. Keeper `react: 9` | 4.8 / 4.7 / 4.8 / 4.7 | unchanged | 4.1 / 3.7 / 3.6 / 4.0 | 2 / 5 / 10 / 20 | yes |
| D. Keeper narrows further (engine) | 4.2 / 3.1 / 2.9 / 4.9 | unchanged | 4.5 / 3.4 / 4.3 / 4.5 | 2 / 6 / 9 / 15.5 | yes |
| E. `sweeper: true` | 4.6 / 4.1 / 4.1 / 5.2 | unchanged | 4.6 / 4.3 / 4.6 / 4.6 | 1.5 / 4.5 / 13.5 / 15 | yes |
| F. Back line `floor: 9` (10, 13, 18) | unchanged | unchanged | 4.4 / 4.6 / 4.8 | 4.5 / 9 / 16 | yes |

The exact settings:

- **A. Covering centre-half**: add `{ t: 'zone', x: 25, y: 10, spd: 5.4, eng: 7, agg: 0.8, leash: 9 }`. He holds the
  penalty spot, screens the lane into the box, and steps out to the carrier inside 7 m. It halves the open goal on
  players' routes (to about 2.2 m: one corner, not two), pushes their shots out to 12.7-15.1 m and moves failures to the
  last player (13: 15% to 62% of failures; 18: 35% to 52%). It also changes the route: the bot scripts fail and must be
  rewritten, though simulated players clear all four. The strongest lever found. A faster version (5.8 m/s, `eng: 9`,
  `agg: 1`) did no better on open goal.
- **B. Trailing marker**: add `{ t: 'mark', a: <finisher>, x: <finisher x>, y: <finisher y - 2.5>, spd: 5.6, react: 10,
  agg: 0.8 }`. It keeps the designed route (the bot still scores in all four) and cuts the time the striker can stand
  and aim on that route to 0.5-1 s, but it does not close the goal and on players' routes it helped in 4 and 10 only.
  It takes time, not space.
- **C. Keeper `react: 9`** (default 13): no effect at 10 m, where the ball beats any reaction; 0.6-1.0 m less open goal on
  players' routes, who shoot from 11-13 m. Cheap and per level. Earlier the owner found the keeper "too big"; this
  changes his speed, not his size.
- **D. Keeper narrowing** (engine constants `gkOneK` 0.45 to 0.6, `gkOneMax` 5 to 7, tried in memory only): 0.3-1.9 m less
  open goal on the bot's route, 0.1-0.9 m on players' routes. Applies to every level; needs an engine change.
- **E and F** do little. A lower back-line floor changes nothing because a line that has been played through recovers
  goal-side of the ball anyway, and it is slower than the finisher.

**What I would use (proposal, to be rated)**: A on the fixtures meant to end with a strike; C on all fixtures from 5
on; B where the designed run must survive intact. Targets for the finish on players' routes: under 3 m of goal open (one
corner), a defender able to win the ball within 0.5 s of the shot, and the keeper still beaten by a shot placed within a
metre of the post. Check against the fun-5 lesson in section 3: keep the timed final pass and the run on goal; take the
time away at the end of the run, not before it.

## 7. What I could not determine

- Whether anything beyond the fixture number predicts his takes. With one play of each of 20 fixtures in order, the
  ramp and his learning cannot be separated from any level property.
- What made 9 and 20 take 12 and 14. Both have a long pass from deep on a short clock; no instrument reproduces it.
- Whether pressure at the finish would make the game more fun for him, or only harder. Nothing in set A shows fun
  rising with a harder finish; his fun-5 fixtures had the most time at the finish. This needs a rating.
- His real shooting positions. Fail codes do not record where he shot from; the finish on "his routes" here is the
  human model's, not his.
- Fun from first principles: three fun-5 fixtures are too few to tell a rule from a coincidence.

## Suggested set B (to settle the open questions)

1. B13, B10 and B18 each in two versions, original and with change A (covering centre-half), in random order: does the
   finish pressure change fun and fair, not only takes?
2. 60 and B19 again, in random order, at original clocks: separates his learning from the level.
3. B9 and B20 at their own clocks and with 2 s added: is the short clock with a long pass what made them hard?
4. Ask him to note, for each goal, roughly where he shot from (edge of box, penalty spot, closer).
