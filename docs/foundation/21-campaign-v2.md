# Foundations 21: campaign version 2

Written by the campaign lead, Thu 26 Nov 2026. The owner decided to replace the 60 live levels with a campaign built to
RULEBOOK.md version 2, mixing generated levels with his favourite hand-built ones. This note lists the new 60 in order,
says where each favourite sits and why, and records what changed around them (story, save data, kits) and what did not
pass first time.

Builder: `tools/gen/campaign-v2.js` (`plan`, `gen`, `favs`, `write`). Generated levels come from `tools/gen/generate.js`
exactly as in 17 and 20 (every automatic check of rulebook 8.1, the clock fitted to the difficulty estimate).

## The short answer

1. **The 60:** fixtures 1-4 are the gentle opening four, unchanged. Fixtures 5-60 are seven seasons of eight: 48
   generated levels and 8 hand-built favourites. Each season ends on a closing level (fixtures 12, 20, 28, 36, 44, 52,
   60), five of them generated or favourite Five-man moves, Bend the run and Ball inside the full-back.
2. **Every one of fixtures 5-60 passes every automatic check of rulebook section 8**, the R8 "no sparse defence" rule
   included, at its own clock and engine (the counters are exempt from R8, as the rulebook says). Fixtures 1-20 also pass
   the novice check of rulebook 9 (no more than a quarter of simulated novices beyond 30 takes).
3. **Tests:** `node tools/test.js` 60/60; `--jitter` lowest round 48% (rule: 45%); `node tools/ai-scenarios.js` all pass;
   app `npm test` 35 of 35 bridge checks and `npm run check-native` 11 checks; the single-file build scores all 60 in the
   browser (`/home/claude/play2.py`), with no console errors.
4. **Old saves:** progress is now keyed by a permanent level id (`c01`-`c60`). An old name-keyed save is migrated once
   (below).

## The ramp in seasons of eight

`campaign.js` repeats the rulebook's 5-20 pattern in seasons of sixteen; the story has seasons of eight, so
`campaign-v2.js` (`slotV2`) cuts the same ramp into eights:

| Season | Positions 1-6 | 7 | 8 |
|---|---|---|---|
| Even (2, 4, 6, 8) | standard | hard | closing (8-15 takes) |
| Odd (3, 5, 7) | hard, hard, hard, standard (the breather), hard, hard | hard | closing |

Two seasons make one repeat of the 5-20 pattern: fixtures 5-20 are repeat 0, 21-36 repeat 1, 37-52 repeat 2, 53-60
repeat 3. Each repeat adds 0.1 m/s to the band's defender speed (to 5.7) and takes 0.3 s off its slack (to 1.8 s), as
rulebook 7.3 says (the "+1" etc. in the band column below). Engine: fixtures 1-4 A and B off, 5-8 B only and no marker
hand-over, 9 onwards A+B. Tier-1 templates: at least two in positions 1-4 of the even seasons, at least three in
positions 3-8 of the odd ones (the rulebook's 5-8 and 15-20 rules, repeated).

## The 60

Band: the slot's band (rulebook 7.2, the owner's targets of section 9: standard 3-6 takes, hard 5-8, closing 8-15), with
the repeat number. Clock and bot time in seconds. Predicted takes: the difficulty estimate of 20 (`difficulty.js`), the
owner's first play; it is a band, about a factor of 2 out on a typical level. Model median: the human model, owner profile,
30 runs at generation. Side: the side the finisher attacks from.

| No. | Name | Template | Source | Band | Clock | Bot | Predicted takes (estimate) | Model median | Side | Defenders |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | First pass | tutorial | hand-built, kept as it was | opening | 15 | - | 1-2 (model) | - | - | 1 |
| 2 | Through ball | tutorial | hand-built, kept as it was | opening | 15 | - | 1-2 (model) | - | - | 2 |
| 3 | Down the wing | tutorial | hand-built, kept as it was | opening | 17 | - | 1-2 (model) | - | - | 2 |
| 4 | The decoy | tutorial | hand-built, kept as it was | opening | 16 | - | 1-2 (model) | - | - | 2 |
| | **Season 2: The Promotion Race** | | | | | | | | | |
| 5 | The third man | Third-man run | generated, seed 253645815 attempt 1 | standard | 10 | 5.3 | 4 | 5 | left | 6 |
| 6 | Draw him out | Commit the centre-half | generated, seed 4291625044 attempt 1 | standard | 10 | 5.95 | 4.6 | 3 | right | 6 |
| 7 | Along the line | Bend the run | generated, seed 2910666415 attempt 9 | standard | 10 | 5.43 | 5.1 | 5 | left | 7 |
| 8 | Come short, go long | Short then long | generated, seed 3484317533 attempt 3 | standard | 10 | 5.92 | 5.5 | 7.5 | centre | 7 |
| 9 | The dropping nine | False nine | generated, seed 3805122881 attempt 2 | standard | 10 | 5.93 | 3.8 | 2.5 | left | 6 |
| 10 | Past the hunters | Play through the press | generated, seed 3079277661 attempt 4 | standard | 10 | 5.52 | 3.2 | 2 | right | 6 |
| 11 | Five in a row | Five-man move | generated, seed 1876320575 attempt 7 | hard | 11 | 6.38 | 7.8 | 5.5 | left | 7 |
| 12 | Nothing over the top | Sweeper-keeper | generated, seed 909166635 attempt 16 | closing | 10 | 7.32 | 9 | 7 | right | 6 |
| | **Season 3: The County Cup** | | | | | | | | | |
| 13 | Into the hole | Third-man run | generated, seed 1332178502 attempt 6 | hard | 9 | 5.47 | 6.2 | 8 | left | 6 |
| 14 | Run at him | Commit the centre-half | generated, seed 2523494695 attempt 19 | hard | 9 | 6.27 | 5.2 | 6 | right | 6 |
| 15 | The blind side | Third-man run | generated, seed 959473292 attempt 6 | hard | 9 | 5.42 | 5 | 4 | left | 6 |
| 16 | Short, not long | Sweeper-keeper | generated, seed 3186551327 attempt 36 | standard | 12 | 7.12 | 5.5 | 5 | left | 6 |
| 17 | Past the press | Play through the press | generated, seed 1098329832 attempt 5 | hard | 10 | 6.6 | 5.6 | 3 | left | 6 |
| 18 | Make him step out | Commit the centre-half | generated, seed 4070705363 attempt 5 | hard | 9 | 6.18 | 5.1 | 3 | right | 6 |
| 19 | Up, off and in | Third-man run | generated, seed 3038523808 attempt 10 | hard | 9 | 5.73 | 7.7 | 4.5 | left | 6 |
| 20 | All the way through | Five-man move | generated, seed 4265380011 attempt 37 | closing | 11 | 6.5 | 10.8 | 9 | left | 7 |
| | **Season 4: Chasing Scarrow Vale** | | | | | | | | | |
| 21 | Switch of play | Switch of play | **favourite**, baseline 5 (set A: fun 5, 4 takes) | standard (+1) | 10 | 6.08 | 4.2 | 6.5 | left | 6 |
| 22 | Pull it back | Wing and cut-back | generated, seed 3133116736 attempt 2 | standard (+1) | 8 | 3.63 | 5.8 | 14 | right | 7 |
| 23 | Bend round them | Bend the run | generated, seed 2131927675 attempt 2 | standard (+1) | 10 | 4.92 | 5.7 | 10.5 | left | 7 |
| 24 | Beat the press | Play through the press | generated, seed 1955080510 attempt 6 | standard (+1) | 10 | 6.22 | 4.9 | 4.5 | right | 6 |
| 25 | Empty the middle | False nine | generated, seed 1893477261 attempt 3 | standard (+1) | 10 | 5.8 | 3.8 | 3 | left | 6 |
| 26 | Check and spin | Short then long | generated, seed 680901011 attempt 7 | standard (+1) | 10 | 5.7 | 5.4 | 8 | centre | 7 |
| 27 | Catch them upfield | The counter | generated, seed 2549504464 attempt 10 | hard (+1) | 10 | 6.77 | 6.6 | 7 | left | 4 |
| 28 | Every man touches it | Five-man move | **favourite**, set E Test 02, generated closing Five-man move, seed 501 (fun 5, fair 5, 9 takes) | closing (+1) | 10 | 6.07 | 9.7 | 10.5 | right | 7 |
| | **Season 5: The Step Up** | | | | | | | | | |
| 29 | Round the back | Wing and cut-back | generated, seed 2313230489 attempt 3 | hard (+1) | 9 | 6.27 | 6.7 | 8 | left | 7 |
| 30 | Hit the far man | Diagonal in behind | generated, seed 3926179015 attempt 3 | hard (+1) | 9 | 6.48 | 7.8 | 7.5 | right | 6 |
| 31 | Ball inside the full-back | Ball inside the full-back | **favourite**, set D B4 (fun 4, fair 5, real football 4, 4 takes) | hard (+1) | 8 | 4.9 | 6.6 | 6 | right | 7 |
| 32 | Under the sweeper | Sweeper-keeper | generated, seed 3498731641 attempt 23 | standard (+1) | 12 | 7.27 | 5.8 | 6 | left | 6 |
| 33 | Beat the trap | Beat the trap | **favourite**, baseline 13 (set A: fun 5, fair 5, 13 takes; set C fun 4-5) | hard (+1) | 10 | 7.48 | 6.1 | 6 | right | 7 |
| 34 | Bounce it off the 9 | Up, back and through | generated, seed 1333623150 attempt 24 | hard (+1) | 9 | 5.67 | 6.3 | 6.5 | right | 7 |
| 35 | The run from wide | Third-man run | generated, seed 1645646622 attempt 23 | hard (+1) | 8 | 5.38 | 6.7 | 6.5 | right | 6 |
| 36 | Bend the run | Bend the run | **favourite**, set D C2 (fun 5, fair 5, real football 5, 10 takes) | closing (+1) | 7 | 5.37 | 8.1 | 9 | left | 7 |
| | **Season 6: Notice to Quit** | | | | | | | | | |
| 37 | Change the point | Switch of play | generated, seed 1113432167 attempt 1 | standard (+2) | 9 | 5.33 | 4.8 | 7 | right | 6 |
| 38 | Out from the back | Play through the press | generated, seed 1137766743 attempt 6 | standard (+2) | 11 | 5.9 | 5.7 | 4 | centre | 6 |
| 39 | Bend in behind | Bend the run | generated, seed 1574252662 attempt 6 | standard (+2) | 9 | 5.1 | 5.2 | 7 | left | 7 |
| 40 | Pull the centre-half | Commit the centre-half | generated, seed 169429676 attempt 5 | standard (+2) | 9 | 5.57 | 4.4 | 3 | right | 6 |
| 41 | Back, then in behind | Beat the trap | generated, seed 2974330647 attempt 4 | standard (+2) | 11 | 6.92 | 5.2 | 10.5 | left | 7 |
| 42 | Spin in behind | Short then long | generated, seed 3178945865 attempt 1 | standard (+2) | 9 | 5.68 | 5.2 | 7 | centre | 7 |
| 43 | Two at the back | The counter | generated, seed 4279268774 attempt 2 | hard (+2) | 9 | 6.13 | 6.4 | 6.5 | right | 4 |
| 44 | The seam | Ball inside the full-back | **favourite**, set E Test 08, generated Ball inside the full-back, seed 501 (fun 5, fair 5, real football 5, 29 takes) | closing (+2) | 7 | 5.33 | 10.1 | 10 | right | 7 |
| | **Season 7: Top of the League** | | | | | | | | | |
| 45 | Take on the line | Commit the centre-half | generated, seed 2788264165 attempt 26 | hard (+2) | 8 | 5.65 | 5.1 | 3.5 | left | 6 |
| 46 | The cut-back | Wing and cut-back | generated, seed 1342420446 attempt 10 | hard (+2) | 7 | 3.88 | 6.7 | 12 | right | 7 |
| 47 | Third-man run | Third-man run | **favourite**, baseline 10 (set A fun 5; set C with A+B: fun 5, fair 5, 12 takes, all at the finish) | hard (+2) | 8 | 5.42 | 5.4 | 4.5 | left | 6 |
| 48 | Keeper off his line | Sweeper-keeper | generated, seed 124730344 attempt 32 | standard (+2) | 12 | 7.22 | 5.9 | 6.5 | left | 6 |
| 49 | Run the line | Bend the run | generated, seed 2763356719 attempt 2 | hard (+2) | 8 | 5.17 | 6.7 | 10.5 | right | 7 |
| 50 | Lay it back, then in | Up, back and through | generated, seed 451277248 attempt 12 | hard (+2) | 9 | 6.35 | 7.2 | 6.5 | left | 7 |
| 51 | Over to the far side | Switch of play | generated, seed 3202061019 attempt 11 | hard (+2) | 9 | 6.72 | 5.1 | 4.5 | right | 6 |
| 52 | Through the high line | Beat the trap | generated, seed 3446125011 attempt 1 | closing (+2) | 10 | 7.22 | 8.1 | 9 | left | 7 |
| | **Season 8: The Amateur Cup** | | | | | | | | | |
| 53 | Through the first line | Play through the press | generated, seed 1785834104 attempt 12 | standard (+3) | 10 | 6.45 | 5.9 | 4.5 | right | 6 |
| 54 | Off the 9 | Third-man run | generated, seed 1808024967 attempt 1 | standard (+3) | 9 | 5.37 | 4.5 | 5 | left | 6 |
| 55 | Dart inside | Ball inside the full-back | generated, seed 2530286079 attempt 3 | standard (+3) | 9 | 5.32 | 4.2 | 5 | right | 7 |
| 56 | Curve it in behind | Bend the run | generated, seed 1051372319 attempt 1 | standard (+3) | 10 | 5.47 | 5.5 | 8 | left | 7 |
| 57 | The double movement | Short then long | generated, seed 60933227 attempt 1 | standard (+3) | 10 | 6.23 | 5.9 | 11 | centre | 7 |
| 58 | Commit the centre-half | Commit the centre-half | generated, seed 598517807 attempt 1 | standard (+3) | 9 | 5.82 | 5.3 | 4 | right | 6 |
| 59 | Break at speed | The counter | generated, seed 2799338389 attempt 2 | hard (+3) | 10 | 6.2 | 6.4 | 6.5 | left | 4 |
| 60 | Five-man move | Five-man move | **favourite**, baseline 19 (set A fun 4, 15 takes; set B fun 5, 20 takes; set C fun 4; set E fun 5) | closing (+3) | 10 | 6.2 | 12.8 | 10 | right | 7 |

Templates across fixtures 5-60: Third-man run 7 (one favourite), Commit the centre-half 6, Bend the run 6 (one
favourite), Play through the press 5, Five-man move 4 (two favourites), Short then long 4, Sweeper-keeper 4, Switch of
play 3 (one favourite), Wing and cut-back 3, The counter 3, Ball inside the full-back 3 (two favourites), Beat the trap
3 (one favourite), False nine 2, Up, back and through 2, Diagonal in behind 1. Decoys: fixtures 9, 25 (False nine), 29 and
46 (a cut-back with its optional decoy); never more than one in a level.

## The favourites, and why each sits where it does

| No. | Level | Source and his ratings | Changes for the current engine | Why here |
|---|---|---|---|---|
| 21 | Switch of play | baseline 5; set A fun 5, 4 takes | a second hunter on the 6 at (25, 35), as the generated template has it (R8: six defenders, two in front of the line); bot re-scripted (the old route has the winger saved under B); clock 10 | A three-man move: standard band. It opens season 4, the title chase, as a short sharp level. It was first put at fixture 7, but there it fails the novice check (67% of simulated novices beyond 30 takes: the switch is a 4-degree needle), so it goes to the first standard slot after fixture 20 |
| 28 | Five-man move (set E) | set E Test 02, generated closing level; fun 5, fair 5, 9 takes | none but the clock (10 s) | Closes season 4: the title decider at Scarrow Vale, where a draw is not enough at 0-1. His closing-band favourite, kept well away from the hand-built Five-man move at 60 |
| 31 | Ball inside the full-back (set D) | set D B4; fun 4, fair 5, real football 4, 4 takes | clock 8 s; speeds as he rated them (a quicker defence leaves no tight middle touch) | Its route has five tight windows, which J2 allows only in the hard band, and it is the gentler of the two versions: a hard level early in season 5, the first year in Division Two |
| 33 | Beat the trap | baseline 13; set A fun 5, fair 5, 13 takes; set C fun 4-5 | the 3 starts 0.8 m deeper (9, 44.8) so the line is 12 m goal-side of the ball and the hunter 6.7 m from it (V3, R1); the 9 times his run 4 ticks later so he is onside by 0.5 m, not 0.3 m off (J3); defence +0.1 m/s; clock 10 s | A season highlight in the hard band (with the 3 deeper it has one tight middle touch, too few for a closing level). Season 5's Marrowby game: "step up on every ball back" |
| 36 | Bend the run | set D C2; fun 5, fair 5, real football 5, 10 takes | defence +0.3 m/s into the closing band of repeat 1 (5.5); clock 7 s | Closes season 5: safety with a Sunday to spare. Before fixture 21 it fails the novice check (80%), so it cannot close season 3 |
| 44 | Ball inside the full-back (set E) | set E Test 08; fun 5, fair 5, real football 5, 29 takes | defence +0.1 m/s; clock 7 s (estimate 10) | Closes season 6: one goes up, against Marrowby, with the council vote on the Monday. 29 takes was more than even a closing level asks; the estimate puts this clock at 10 |
| 47 | Third-man run | baseline 10; set A fun 5; set C with A+B fun 5, fair 5, 12 takes, all at the finish | the version 2 defence of rulebook 4.3 T3 (set E rated the old back three real football 2): a back four whose left-centre marks the 9 (line at x 15, 35, 44.5), the screen, and a hunter on the 5; defenders 0.2-0.3 m/s quicker and the back four at agg 0.7 so the finisher is closed down inside 1.0 s at 18 m (J4b failed at 1.03-1.13 s with every line position tried); bot re-scripted; clock 8 s | Season 7 highlight, hard band: the finish is what decides it for him (A+B), so it sits in the top division, where every side defends deep |
| 60 | Five-man move | baseline 19; set A fun 4, 15 takes; set B fun 5, 20 takes; set C fun 4; set E fun 5 | defence +0.2 m/s; bot re-scripted (the old route had six tight windows, J2 allows 2-5); clock 10 s (estimate 12.8) | The last fixture: the Amateur Cup final, 3-3 in extra time. His hardest and best move, five men and one move, as the end of the career |

Why none before fixture 21: rulebook 9 asks that no level in fixtures 1-20 leaves more than a quarter of simulated
novices beyond 30 takes. Every favourite tried there failed it (Switch of play 67%, Beat the trap 30%, Bend the run 80%),
and seasons 2-3 are where new players learn. The generated levels there pass it.

Why none of the other baseline levels: the remaining ones he rated fun 3 (Through ball, The lay-off, The overlap, Push them
back, Sweeper-keeper once), are double decoys (Clear the channel, Far post), or are now templates the generator draws from
anyway (Diagonal in behind, Play through the press, The counter, False nine).

## Corners and set pieces (R8)

The new 60 has none. The old campaign's corners and free kicks (old fixtures 21-27) have no back line, so they fail V11
and R8, and their last ball has no offside decision (J3); the owner never rated a set piece, and the rulebook allows no
free composition outside the rated templates. The things he rated fun 5 are all open play: a hunted first pass, a tight
middle and a run timed against a holding line. A set-piece template would have to be designed and rated first (rulebook
9.5, trial templates); until then the campaign stays in open play. Story lines that mentioned a corner were rewritten.

## How the generated levels were made

`node tools/gen/campaign-v2.js gen --from F --to T` makes the plan's levels in order, each with the template the plan
gives for its slot (with alternatives tried in order), seed `hashSeed(2611, 'v2', fixture, template)`, the slot's band
and repeat, and variety constraints from the previous level (side, line height, finisher, no cut-backs running). It was
run in shards; the JSON results are written by `write` into `one-man-team/js/levels/pack2-8.js` and
`tools/scripts/pack2-8.js`. Slots that needed a second template (all logged in the builder's output):

- Closing levels before fixture 21 need two tight middle touches and the novice check: The counter and Short then long
  gave no level at 12 (40 attempts each); Sweeper-keeper did. Fixture 20: Beat the trap and Bend the run gave none; Five-man
  move did (37 attempts).
- Hard slots before 21 mostly fail on the novice check (Short then long 31 of 40 rejections): fixture 13 became Third-man
  run after Bend the run gave none; 18 Commit the centre-half after The counter; 19 Third-man run after Five-man move.
- Elsewhere: 39 Bend the run (Five-man move gave none), 40 Commit the centre-half (False nine), 43 The counter (Diagonal
  in behind), 54 Third-man run (Five-man move). 41 was regenerated as Beat the trap so that two Commit the centre-half
  levels did not run back to back; 16 was regenerated as Sweeper-keeper so that two Third-man runs did not.

Variety, as built: no template twice running anywhere. The should-rules of 7.3 are broken in places: the attacking side
repeats at 16-17, 31, 33-35, 44 and 48; the line-height band repeats at about a third of the steps (most templates sit in
the medium band); the finisher's role repeats at several steps. Third-man run appears at 13, 15 and 19 within one season.

## Story

Eight seasons, same clubs, matches, minutes and scores. Every fixture from 5 to 60 has a new name (unique, a short football
phrase for the move on the pitch) and a rewritten programme line that keeps the season's story and names the football of
that move ("Victoria hold a high line, as they always have"), 60 characters at most, in the house style of docs/STORY.md.
New: `seasonWord` on each level and `OMT_SEASONS` (name and one word per season: Bottom, Promotion, Cup, Title, Survival,
Eviction, Leaders, Glory) for the home screen.

Kits (design team): no near-white with near-black for either side, because those defenders read as the ball. Changed:
Uffwell Old Boys (41) black and chalk to purple and pink; Polvessa Mariners (57) ink and chalk to chalk and plum;
Winterlea Amateurs (60) chalk and ink to claret and lilac, keeper mustard. The palette has no unused dark-and-light pair
left, so Polvessa's is Quillham Athletic's pair the other way round. docs/STORY.md updated.

## Save data (game.js, one small change)

- Every level has a permanent `id`: `c01`-`c60` as issued here. Ids are never renumbered or reused; a level added later
  takes `c61` on. Progress (`save.done`) is keyed by id (`lid(i)` = `id`, falling back to the name for levels without one,
  as in rating builds).
- An old save (keyed by name, no `save.ids`) is migrated once on load: a level that carried over keeps its record under
  its new id. Carried over means the same move on the same pitch, marked on the level by `oldName`: the opening four
  (c01-c04), Beat the trap (old 13, now c33) and Five-man move (old 19, now c60). Their stars are regraded from the stored
  time against the new par by the existing regrade line. Every other record is dropped. `save.reach` keeps open the
  fixtures the player had reached (the number of fixtures he had cleared), so nobody is locked out of the middle of the
  campaign; the stars there are to be won again. Reset progress clears `reach`. The migration is skipped when the levels
  carry no ids (rating builds). Checked in the browser: an old save with 20 cleared fixtures becomes c01-c04, c33 and c60
  with reach 20.
- The app's bridge test now keys its seeded save by id.

## Results

| Check | Result |
|---|---|
| `node tools/test.js` | 60/60 beaten, every replay scores |
| `node tools/test.js --jitter` | every round 45% or more; lowest 48% (fixture 50, the finish of Up, back and through) |
| `node tools/ai-scenarios.js` | all scenarios pass |
| Generator checks (rulebook 8.1, R8) | all 56 of fixtures 5-60 pass static, dynamic and final checks at their clock |
| Human model, owner profile, 30 runs (`tools/human/run.js --root .`) | pack medians of the fixture medians: 1: 2, 2: 4.5, 3: 4.5, 4: 8.5, 5: 8, 6: 7.5, 7: 7.25, 8: 6.75 (old campaign 2, 4, 3, 3.5, 3.75, 4, 4.75, 5.5); 1782 of 1782 finished moves replay identically |
| Single-file build | `/home/claude/game/index.html`; `play2.py` in Chromium: 60 of 60 scored, no console errors |
| App | `npm run sync-game`; `npm test` 35 of 35; `npm run check-native` 11 checks |
| Service worker | `omt-0.8.3` to `omt-0.9.0` |

The model is harder on packs 4-8 than on the old campaign, which is what the owner asked for (he found the old levels
too easy); it overrates the generated cut-backs (14-18) and two Short then long levels (11-15.5), as 17 and 20 found.
Three levels leave 7-10% of simulated owners without a clear inside 60 takes (35, 36, 44); the rule is 10% or less.

## What did not pass, or is not settled

- The variety should-rules (side, line height, finisher) are broken at the places listed above; no must-rule is.
- Third-man run is the commonest template (7), because it is the one that passes the novice check most easily in the
  hard slots of season 3.
- The estimate and the model disagree on several levels (22, 23, 41, 46, 49, 57: model 10-18, estimate 5-7). Neither is
  trusted alone; the owner's first plays will say.
- Favourites with defenders sped up into their band (Bend the run +0.3, Five-man move +0.2) play quicker than he rated
  them; the clock was then fitted to the estimate.

## Files

- `tools/gen/campaign-v2.js` (new): slots, plan, favourites, generation, writing.
- `one-man-team/js/levels/pack1.js` (ids only), `pack2-8.js`, `story.js`, `pars.js`; `tools/scripts/pack2-8.js`.
- `one-man-team/js/game.js` (save migration), `one-man-team/sw.js`, `app/tests/bridge_test.py`, `app/src/game-html.js`.
- `docs/STORY.md` (kits).
