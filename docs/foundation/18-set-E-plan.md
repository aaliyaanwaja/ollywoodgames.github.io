# Rating set E: generated levels against hand-built ones

Built Thu 26 Nov 2026 by the lead engineer, with the level generator of 17-generator.md (RULEBOOK.md version 1). Eight
levels made by the generator and two hand-built controls he knows well, all blind, in one shuffled order. The question
is the one the rulebook (8.2) asks of every generated level, and a new one: are generated levels as good as the ones he
loved?

## What the owner plays

`/home/claude/sets/setE/index.html`, built with `tools/build-set.py` exactly as set D (rate on, no assist, no practice,
no slow time, all unlocked, no story, save key `omt.setE`, the same five scales: challenge, fun, fair, "Time to pick a
corner" from None to All day, "Felt like real football" from Not at all to Proper goal). Ten blind tests, Test 01-10. The
ratings page gives one line per test with takes, move time, shot distance and the fail codes by round, ready to paste.

One change from set D's build: the game's tutorial prompts for moves 2-4 ("Two defenders this time", "Three players now")
fire on whatever level sits second, third and fourth in any special build; set D's Tests 02-04 showed them. Set E is
built from a copy of the game with a three-line patch that turns them off when the build is a rating build
(`OMT_ROOT=/home/claude/sets/setE/game`, patch in `docs/foundation/sets/setE-game-rating.patch`). The live game, the
engine and the levels are unchanged; `sim.js` in the copy is byte-identical to the live one.

Every level runs on the live engine with its defaults: A (through on goal) and B (keeper covers his near post) on, marker
hand-over on, shot pace 1.2. No level carries an `engine` field (they are rated as fixture 9 onwards).

## Key

| Test | What it is | Tier | Band asked for | Clock | Bot | Slack | Bot / clock | Ball players | Defenders (+ keeper) | Line speed |
|---|---|---|---|---|---|---|---|---|---|---|
| 01 | generated Beat the trap (seed 509) | 1 | ordinary | 12 s | 6.87 s | 5.1 s | 0.57 | 4 | 7: hunter, screen, marker on the 10, back four at y 28 | 5.3 |
| 02 | generated Five-man move (seed 501) | 1 | closing | 9 s | 6.07 s | 2.9 s | 0.67 | 5 | 7: hunter, screen, marker on the 10, back four at y 24 | 5.4 |
| 03 | generated Play through the press (seed 503) | 2 | ordinary | 10 s | 6.13 s | 3.9 s | 0.61 | 4 | 6: two hunters, back four at y 28.5 | 5.2 |
| 04 | hand-built control: Five-man move (baseline 19) | 1 | (his reference closing level) | 12 s | 7.52 s | 4.5 s | 0.63 | 5 | 7: hunter, screen, marker on the 10, back four at y 27 | 5.3 |
| 05 | generated False nine (seed 502), one decoy | 2 | ordinary | 10 s | 5.98 s | 4.0 s | 0.60 | 3 + decoy | 5: centre-half marking the 9, marker on the 8, screen, two wide men 24 m apart | 5.4 |
| 06 | generated Third-man run (seed 502) | 1 | ordinary | 9 s | 5.60 s | 3.4 s | 0.62 | 4 | 4: centre-half marking the 9, screen, two wide men | 5.4 |
| 07 | generated Bend the run (seed 501) | 1 | ordinary | 9 s | 5.02 s | 4.0 s | 0.56 | 4 | 7: hunter, screen, marker on the 10, high back four at y 28.5 | 5.2 |
| 08 | generated Ball inside the full-back (seed 501) | 2 | ordinary | 9 s | 5.33 s | 3.7 s | 0.59 | 4 | 7: hunter, screen, marker on the 10, back four at y 23.5, right-back wide | 5.4 |
| 09 | hand-built control: Beat the trap (baseline 13) | 1 | (his favourite) | 12 s | 7.42 s | 4.6 s | 0.62 | 4 | 7: hunter, screen, marker on the 10, high back four at y 32 | 5.3 |
| 10 | generated Short then long (seed 505) | 2 | ordinary | 11 s | 5.88 s | 5.1 s | 0.53 | 4 | 7: two hunters, screen, tight marker on the 9, back three | 5.3 |

How the eight were chosen: seven ordinary templates (three from tier 1, four from tier 2) and one closing level, and for
each the first seed from 501 upwards that the generator accepted (`docs/foundation/sets/setE-make.js`). No hand
selection after that, no editing: what the generator made is what he plays. The controls are the baseline levels as he
first loved them (the 12 s baseline clocks, baseline bot routes), on today's engine, which is how set C showed them too.

Two pairs share a template on purpose: Test 01 and Test 09 are both Beat the trap, Test 02 and Test 04 both Five-man
move. Within each pair the move is the same idea; the generated one has a different line height, spacing, speeds, side
and clock. Each pair is a straight comparison of generated against hand-made.

## Checks (rulebook section 8.1)

All ten were checked with the generator's checker (`tools/gen/check.js`) as ordinary levels at fixture 9; output in
`/home/claude/sets/setE/checks-final.txt` (copy `docs/foundation/sets/setE-checks-final.txt`).

| Check | 01 trap (gen) | 02 five (gen, closing) | 03 press | 04 five (hand) | 05 false nine | 06 third man | 07 bend | 08 inside | 09 trap (hand) | 10 short-long |
|---|---|---|---|---|---|---|---|---|---|---|
| A1 static V1-V11, role test | pass | pass | pass | pass | pass | pass | pass | pass | **fails V3, R1** | pass |
| A3 jitter, lowest round | 98% | 53% | 73% | 65% | 58% | 93% | 95% | 63% | 53% | 93% |
| J1 tight middle touches | 1 | 3 | 2 | 4 | 1 | 1 | 2 | 2 | 2 | 1 |
| J2 tight windows | 2 | 5 | 2 | 5 | 2 | 1 | 2 | 2 | 4 | 2 |
| J3 onside by / run window | 3.2 m / 2.5 s | 1.5 m / 0.56 s | 2.0 m / 0.87 s | 4.2 m / 1.06 s | 2.1 m / 1.3 s | 3.2 m / 0.93 s | 1.7 m / 1.73 s | 3.3 m / 2.0 s | **-0.3 m** / 1.56 s | 2.8 m / 0.54 s |
| J4a control, m from goal | 30.0 | 18.0 | 22.0 | 16.1 | 19.0 | 22.0 | 17.3 | 24.4 | 27.5 | 28.9 |
| J4b lost after standing at 18 m / after control | 0.57 / 2.43 s | 0.47 / 0.48 s | 0.58 / 1.28 s | 0.32 / 0.33 s | 0.82 / 1.07 s | 0.98 / 1.68 s | 0.78 / 0.80 s | 0.50 / 1.52 s | 0.83 / 2.33 s | 0.37 / 2.13 s |
| Corner time at 18 m (1 m+ open) | 0.3 s | 0.2 s | 0.3 s | 0 s | 0.6 s | 0.75 s | 0.5 s | 0.3 s | 0.6 s | 0.1 s |
| J5 nearest defender after control | 5.1 m | 0.8 m | 3.0 m | 0.5 m | 2.2 m | 1.1 m | 2.3 m | 3.6 m | 5.7 m | 2.9 m |
| J10 bot's shot, open goal | 13.5 m, 4.4 m | 13.4 m, 4.4 m | 13.5 m, 3.8 m | 9.8 m, 5.0 m | 13.5 m, 4.4 m | 13.4 m, 4.4 m | 13.4 m, 4.6 m | 13.5 m, 3.8 m | 9.9 m, 4.8 m | 13.5 m, 5.0 m |
| J8 bump / out / early | 0.01 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 | 0.01 / 0.02 / 0 | 0.03 / 0.05 / 0 | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0.03 / 0 | 0 / 0.03 / 0 | 0 / 0 / 0 |
| J9 failures before the last player | 0.69 | 0.43 | 0.54 | 0.54 | 0.60 | 0.35 | 0.51 | 0.41 | 0.75 (flag) | 0.49 |
| A5 decoy (run / drag / needed / truncation) | - | - | - | - | 9.0 m / 9.3 m / needed / scores | - | - | - | - | - |
| A7 bot / clock (0.80 or less) | 0.57 | 0.67 | 0.61 | 0.63 | 0.60 | 0.62 | 0.56 | 0.59 | 0.62 | 0.53 |
| A8 determinism | pass | pass | pass | pass | pass | pass | pass | pass | pass | pass |

Every generated level passes every check (that is how it was made). The hand-built Beat the trap does not: its hunter
starts 6 m from the ball (V3 asks 6.5 m), its line is 11.25 m goal-side of the ball (12 m asked), and on its bot's route
the striker is 0.3 m beyond the line when the ball is played, inside the engine's 0.6 m tolerance (J3 asks him 0.3-5 m
onside). The hand-built Five-man move passes everything except the human-model band: at 12 s the model's median is 7.5,
above the ordinary band's 3-7, which is right for the level he rated as his reference closing level (15 and 20 takes).

## Human-model prediction

Owner profile, 120 runs, seeds 1 and 2 (`human-owner-n120-s1.txt`, `-s2.txt`), and the novice profile, 30 runs
(`human-novice.txt`).

| Test | What it is | Owner model: median (quartiles), seed 1 | Seed 2 | Novices: median (quartiles), never within 60 | Where the owner model's failed takes go |
|---|---|---|---|---|---|
| 01 | gen Beat the trap | 8 (4-12) | 7 | 27 (14-39), 10% | round 3 49%, round 4 36%: passes cut out |
| 02 | gen Five-man move, closing | 9 (5-17) | 9 | 32 (14-57), 23% | round 5 52%, round 4 36% |
| 03 | gen Play through the press | 2.5 (1-6) | 3 | 11.5 (4-31), 0% | spread: round 2 26%, 3 24%, 4 47% |
| 04 | hand Five-man move | 8 (4-14) | 8.5 | 19.5 (8-31), 3% | round 4 42%, round 5 36% |
| 05 | gen False nine | 6 (3-11) | 5.5 | 11.5 (6-18), 0% | round 3 53%, round 4 43% |
| 06 | gen Third-man run | 4 (2-7) | 4 | 8 (4-14), 0% | round 4 58% |
| 07 | gen Bend the run | 7 (4-14) | 5.5 | 24.5 (13-44), 17% | round 4 58% |
| 08 | gen Ball inside the full-back | 6 (3-11) | 7 | 21.5 (12-44), 10% | round 4 61% (saved 23%) |
| 09 | hand Beat the trap | 9 (4-13) | 7 | 19.5 (7-29), 7% | round 3 48% |
| 10 | gen Short then long | 5 (2-9) | 5.5 | 27 (12-56), 20% | round 4 50%, round 3 38% |

On the model, the generated levels sit where the hand-built ones do: generated Beat the trap 7-8 against the hand-built
7-9; generated Five-man move 9 against 8-8.5.

The novice check of rulebook 9 (no more than a quarter of novices beyond 30 takes) is for fixtures 1-20. Set E's levels
are made as ordinary levels with no campaign slot, so the generator did not apply it; judged by it, Tests 01, 02, 07,
08 and 10 would fail (novice medians of 21-32 takes) and so would both controls' quartiles (31 and 29). Set D's levels
failed it the same way (20-48% beyond 30). In a campaign the generator does apply it to fixtures 1-20, and these levels
would get a longer clock there or be rejected.

## My predictions

The model is a band only. On the hand-built favourites it underrates him (Five-man move: model 7.5, owner 15, 20 and 8;
Beat the trap: 9 against 13); on set D it overrated four of five. And the two controls are now replays: he has played
Five-man move at least five times (sets A-C) and Beat the trap at least five times, with takes falling to 3 and 1.

| Test | Takes, my guess | Fun | Fair | Real football | Why |
|---|---|---|---|---|---|
| 01 gen trap | 4-8 | 4 | 4-5 | 4 | the trap's structure with a lower line (28 against 32): less offside drama, so one point less tension than the original |
| 02 gen five, closing | 8-15 | 4 | 4-5 | 4 | the same five-man spine on a 9 s clock; the 8 and 10 have less room than in the original |
| 03 gen press | 2-4 | 3-4 | 4 | 4 | the easiest of the set on the model (2.5-3); a risk of a 1-2 take clear and fun 3 |
| 04 hand five | 2-6 | 4 | 5 | 4-5 | known well; ratings show the gap familiarity makes |
| 05 gen false nine | 4-8 | 3-4 | 4 | 4 | a back three with a decoy; he has called decoys the easiest way to make space |
| 06 gen third man | 3-6 | 4 | 4-5 | 3-4 | only four defenders, two of them 24 m apart: the sparsest defence of the set |
| 07 gen bend | 5-10 | 4-5 | 5 | 5 | set D's standout (fun 5, real football 5) made again by the generator |
| 08 gen inside | 4-8 | 4 | 4-5 | 4 | set D's B4 with a slightly lower line |
| 09 hand trap | 1-3 | 4 | 5 | 4 | known well |
| 10 gen short-long | 4-8 | 4 | 4 | 4 | a 5 s slack (the model needed it); the double movement is the hardest touch to find |

If the generator is good, the generated levels average fun 4 or more, fair 4 or more and real football 4 or more, with
no generated level below 3 on any of the three, and their takes land inside the band asked for (3-8; Test 02 8-15).

## What we will learn

1. **Generated against hand-made.** The two pairs (01 against 09, 02 against 04) are the cleanest comparison we have:
   same idea, generated geometry against his favourites. If fun and real football come out the same within a point, the
   generator reproduces the quality, and familiarity is the only difference. If the generated ones are a point lower on
   real football, the placement procedure is missing something a designer does (the place to look first: line heights,
   which the generator samples from the rulebook's ranges and the hand-built ones chose).
2. **The clock fit.** Every generated level had its clock fitted to the human model (owner profile). His takes on the
   eight say whether fitting to the model lands in his band. The rulebook 8.2 rule applies: fun 3 or less halves a
   template's weight; two fun-3 ratings take it out of the pool.
3. **Sparse defences.** Tests 05 and 06 have four and five defenders (the rulebook's own shapes for false nine and
   third-man run). A low "real football" score there means the templates need a fuller defence, not the generator.
4. **Corner time.** The probe gives 0-0.75 s of open corner at 18 m. He rated corner time 3 on every set D level with
   0.1-0.6 s. If Tests 05-07 (0.5-0.75 s) come back at 4, the finish needs the next defender closer in those shapes.
5. **Decide what the generator may make next.** Rate every generated level until 20 have been rated (8.2): these are
   the first eight.

## Files

- `/home/claude/sets/setE/index.html`: the rating build. `key.txt`: the key.
- `/home/claude/sets/setE/levels.js`, `scripts.js`: the ten levels in the blind order, and their bot routes.
- `/home/claude/sets/setE/design.json`: the ten in design order, with template, band, seed and every check.
- `/home/claude/sets/setE/make.js` (copy `docs/foundation/sets/setE-make.js`): makes the set from the generator and the
  baseline; `checks.js` and `checks-final.txt`; `rateE.py` (browser check; screenshots in `shots/`); `game/` and
  `game-rating.patch`: the patched copy of the game the build uses.
- `/home/claude/sets/setE/root/`: the live `sim.js` and tools with the set as `pack1.js`, for `root/tools/test.js` and
  `tools/human/run.js --root`. Model output: `human-owner-n120-s1.txt`, `-s2.txt`, `human-novice.txt`.

Browser check (`rateE.py`, Playwright, phone viewport): the bot played every test to a goal in the build; the sheet
showed all five scales; the ratings saved under `omt.setE`; the ratings page showed the line
"1 | Test 01 | challenge 3 | fun 4 | fair 5 | time to pick a corner 2 | felt like real football 4 | 1 takes | 6.9s shot
13.5m |". No console errors.
