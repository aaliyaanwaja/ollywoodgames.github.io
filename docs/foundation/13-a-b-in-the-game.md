# Foundations 13: A, B and the marker hand-over in the game

Written by the engine and level engineer, Wed 25 Nov 2026. The owner approved both finish-pressure options from set C
("Yes, do both. Remember to keep the earlier levels easy though."), and later the same day a marker hand-over in the
same pass. This note records what changed in the real game, the ramp that keeps the opening fixtures easy, which bot
routes were re-scripted, the new finishes of 56 and 60, and the test and human-model results before and after.

## What changed in the engine (`one-man-team/js/sim.js`)

1. **The set C patch** (`docs/foundation/sets/setC-sim.patch`), applied unchanged. A and B are now the defaults:
   - A, through on goal: `recSpd 7.0, dangerR 24`. When the carrier has no defender on his feet goal-side of him,
     recovering defenders sprint (own speed + 1.3 m/s, never above 7.0) inside 32 m of goal, and inside 24 m the
     nearest back-line man within 12 m of the ball goes to him.
   - B, the keeper covers his near post: `gkBisect 1, gkNear 0.2`. While someone has the ball he stands on the line
     that halves the angle, shaded a fifth of the way on towards the near post.
   - Option 3 of 10-finish-pressure.md ("one goes, one covers", `coverDeep`) stays in the engine, off.
2. **Per-level engine settings.** A level may carry `engine: { key: value, ... }`, overrides of the engine constants
   for that level only. `FB.C0` holds the defaults. `FB.makeSim` resolves the defaults plus the level's overrides into
   `S.cfg` and loads them into `FB.C`; `FB.step` reloads a sim's own settings whenever the last sim stepped was a
   different one, so two sims of different levels (the game keeps a live sim and a replay) never see each other's
   settings and a level never inherits another's. A misspelt key, or a value of the wrong type, is refused with an
   error. Everything is deterministic: the settings are a pure function of the level. Tools that try a variant on
   every level change `FB.C0`, not `FB.C` (the scenarios do this).
3. **Marker hand-over** (`markLeash 10`; a defender's own `leash` overrides it; 0 switches it off). A man-marker follows
   his man, but not off the pitch. Once his man, as the marker last saw him (`react` ticks ago, not extrapolated), is
   more than 10 m from where the marking started (the man's start position, which the marker began 2-3 m goal-side of)
   and is no nearer the goal than he started there, the marker passes him on and goes back to shape: from then on he
   plays as a screen from his own set position (zone behaviour: shifts with the ball, stands on the lane to the most
   dangerous receiver, may cut out a loose ball near him). He picks his man up again if the man comes back within
   7 m of his start, or gets nearer the goal than he started. Never while his man has the ball: then he presses him as
   before.

   Why measured this way: the first version measured the man's extrapolated position against the marker's own set
   position. Extrapolation adds about 3 m on a sprint, so it fired at 4-5 m of real drag and broke eight bot routes
   (6, 14, 17, 18, 23, 26, 46, 58), several of them not decoy runs at all (a man checking short to receive). Measuring
   the man's seen position from his own start is what "dragged 10 m" means to a fan, is not fooled by a sharp cut, and
   is robust. The "no nearer the goal" condition is the football: a runner going in behind is never passed on.
   Because the marker lags his man, he himself has gone about 7 m when he lets go.

With every new option off (`recSpd 0, dangerR 0, gkBisect 0, gkNear 0, markLeash 0`) the engine is bit-identical to the
previous one: all 60 old bot routes replay with identical defender and keeper positions on every tick (checked by
hashing every tick of every round on both engines).

## The ramp

| Fixtures | `engine` field | In play |
|---|---|---|
| 1-4 (pack 1) | `{ recSpd: 0, dangerR: 0, gkBisect: 0, gkNear: 0, markLeash: 0 }` | as before |
| 5-8 (first half of pack 2) | `{ recSpd: 0, dangerR: 0, markLeash: 0 }` | B only |
| 9-60 | none | A, B and the hand-over |

The hand-over is off with A in 1-8 for the same reason: fixture 4 is the decoy tutorial (its bot's decoy run is 12 m,
and the marker would have let him go), and fixture 8 has a winger who comes short 10 m to receive. Both stay as the
owner knows them.

## Bot routes re-scripted

All changes are to the finisher's round except the decoy runs in 14 and 18, where the decoy is what the hand-over
changes. Scoring windows are metres of goal line (goal mouth x 21-29) a full-power shot scores in from the bot's final
spot; "jitter" is the share of 60 perturbed plays of that round that score.

| # | Broken by | Old finish | New finish |
|---|---|---|---|
| 5 Switch of play | B (near-post shot saved) | carry to (19, 8), aim 22 (near post) | same carry, aim 27.1: far corner, open 25.7-28.4 |
| 11 The counter | A (caught carrying to 9 m) | carry to (30, 9), aim 28.2 | carry only to (32, 12), aim 22.6: far corner, open 21.2-24.0 |
| 25 Round the wall | A (tackled carrying to 7 m) | carry to (31.5, 7), aim 28 | carry to (32.5, 10), aim 23.1: far corner, open 21.4-24.7 |
| 49 The underlap | B (first-time near-post shot saved) | aim 28.2 | aim 23.8: far side, open 21.1-26.4 |
| 56 Short then long | B | see below | see below |
| 60 Total football | B | see below | see below |
| 14 Clear the channel | hand-over (both centre-halves came back; through ball cut out) | decoys run 17.7 m to (7, 30) and 16 m to (40, 41) | decoys run 9 m to (15, 29) and 9.2 m to (35, 36) |
| 18 False nine | hand-over (the 9's marker came back and cut out the through ball) | decoy drops 12.3 m to (27, 41) | decoy drops 9.8 m to (26, 38.5) |

Tips changed to match: 5's winger now shoots "across the keeper into the far corner" (it said near post); 14's two
decoys and 18's false nine are told to go about ten metres ("any further and he lets you go"). No defender was moved
in any level.

## The new finishes of 56 and 60

Both were built around a 1 m near-post sliver from 18-21 m (07, section 5). The reason the far corner was shut is the
same in both: a covering defender (56's zone cover, 60's deep zone, who steps up as first defender) stands on the line
from ball to goal, so from where the striker received it only the near post was beyond him. B shades the keeper to
that post, and the sliver closed (0.2-0.4 m left). The defending is football-true and was left alone; the finish moves.

- **56 Short then long.** The move is unchanged: hunter, inside to the 6, out to the 8, the 9 comes short and spins
  in behind his marker on to the through ball. The 9 now drives outside the cover to the inside-right of the box,
  (33.5, 14.5), and shoots across the keeper from about 17 m: far corner open 21.3-24.2 (2.9 m), bot jitter on that
  round 78% (was 43%). Tip: "Come short so your marker follows, then spin in behind. Drive outside the cover and shoot
  across the keeper into the far corner."
- **60 Total football.** The move is unchanged: two decoys split the centre-halves, the 6 plays into the 10, who
  threads it first time; the runner meets it beyond the line. He now goes round the last man on his outside to
  (32.5, 14) and shoots across the keeper from about 16 m: far corner open 21.3-24.4 (3.1 m), bot jitter 55% (was 35%).
  Tip: "Go at once. Meet it beyond their line, go round the last man on his outside and shoot across the keeper into
  the far corner." The bot's decoy runs (8.6 m and 9.3 m) are inside the hand-over distance, so on the bot's route both
  markers still go; a player who drags them further sees them let go. No decoy was added anywhere.

In both, the far corner is open from the owner's range (15-17 m) on the right of the box: from that side the scans
give 2-3.6 m of far corner from y 13-16. From the old shooting spots (edge, in line with the cover) a far-corner shot
is still blocked by the cover, which is what a fan would expect.

## Test results

| Check | Before | After |
|---|---|---|
| `node tools/test.js` (bot routes) | 60/60 | 60/60. With A+B and the old scripts: 54/60 (5, 11, 25, 49, 56, 60). Adding the hand-over: 14 and 18 also broke. All re-scripted as above. |
| `node tools/test.js --jitter`, mean of last-round rates | 72.6% | 75.6% |
| ditto, mean over all rounds | 89.8% | 90.3% |
| `node tools/ai-scenarios.js` | 33/33 | 45/45 |
| `npm test` in `app/` | passes | passes (shell tests, bridge 35/35) |
| `npm run check-native` | 11 passed | 11 passed |
| Off = old engine, 60 old routes hashed tick by tick | | 60/60 identical |

Jitter, notable moves (last round unless stated): 9 83 to 40, 23 round 3 90 to 48, 29 75 to 55, 34 round 2 65 to 48;
25 70 to 100, 11 70 to 95, 46 45 to 78, 56 43 to 78, 60 35 to 55. Note that `--jitter` draws every level's
perturbations from one random stream, so a change in one level shifts the draws of every later one; single-level
differences of 10-15 points are partly that. Not chased, as asked.

AI scenarios: the specialist's five finish-pressure scenarios and his three adapted ones are adopted (speed cap allows a
recovery sprint up to 7.0 m/s; the keeper's angle line runs to his anchor when B is on; the lone carrier's floor allows
the cover man when option 3 is on). Scenarios now set options through the defaults (`FB.C0`), since `makeSim` loads
them. Seven new ones: a decoy running 20 m to the touchline is passed on and his marker ends 2.9 m from his position;
a man coming short is passed on; a man running in behind is followed 19.7 m and never passed on; the marker picks his
man up again when he comes back; a defender's own `leash` (5) wins, and `markLeash 0` means he follows to the
touchline; never while his man has the ball; per-level settings stay with their level when two sims are stepped in
turn, and a misspelt setting is refused.

Browser: the single-file build (`/home/claude/game/index.html`) played by the bots in Playwright (`play2.py`) on
fixtures 1-10, 14-18, 25 and 56-60: every one a goal, no console errors. App shell synced (`npm run sync-game`).
Service worker VERSION `omt-0.8.0` to `omt-0.8.1`. Pars regenerated (`tools/make-pars.js`): 11 6.6 to 6.3 s, 25 2.9 to
2.6 s, 56 5.6 to 6.1 s, 60 3.4 to 4.2 s; others unchanged.

## Human model: takes before and after

`node tools/human/run.js --root . --levels 1-60` (owner profile, 30 runs, seed 1). Median takes per fixture, then the
median and the sum of those per pack. The middle column is A+B without the hand-over (same engine with `markLeash 0`),
to show what each change does.

| Pack | Fixtures | Median: before / A+B / A+B+hand-over | Sum: before / A+B / A+B+hand-over |
|---|---|---|---|
| 1 | 1-4 | 1.75 / 1.75 / 1.75 | 6.5 / 6.5 / 6.5 |
| 2 | 5-12 | 3.5 / 4.0 / 4.0 | 29 / 34 / 34 |
| 3 | 13-20 | 2.75 / 2.75 / 2.75 | 37.5 / 38.5 / 40 |
| 4 | 21-28 | 3.0 / 3.75 / 3.5 | 35 / 41.5 / 41.5 |
| 5 | 29-36 | 4.25 / 4.0 / 4.0 | 40.5 / 45 / 45.5 |
| 6 | 37-44 | 3.75 / 3.5 / 4.0 | 37.5 / 33 / 34 |
| 7 | 45-52 | 5.5 / 5.5 / 5.25 | 45.5 / 46 / 50.5 |
| 8 | 53-60 | 4.25 / 5.0 / 5.75 | 46.5 / 49.5 / 52.5 |
| All | 1-60 | 3.25 / 4.0 / 4.0 | 278.5 / 294 / 304.5 |

**1-8 did not get harder.** 1-4 are identical take for take (the engine is identical there). 5-8: 2 / 2 / 2 / 6.5
before, 2 / 2 / 1 / 7 after; 8's spread narrowed (p90 18 to 16). The step up starts at 9, as intended.

Fixtures that moved by two takes or more (before / A+B / A+B+hand-over):

| # | Takes | What changed in the failures |
|---|---|---|
| 9 Diagonal in behind | 4.5 / 7 / 7 | more shots blocked or saved and more tackles on the ball: the finish, as intended |
| 11 The counter | 5 / 7 / 7 | tackled on the ball 22% to 31%: A |
| 18 False nine | 9.5 / 10.5 / 12 | the hand-over: a false nine dropping more than 10 m no longer takes his centre-half |
| 21 Short corner | 6.5 / 9.5 / 9.5 | more tackles on the ball (13% to 21%) |
| 27 Corner to the edge | 2 / 4 / 3 | |
| 35 Three against two | 6 / 12 / 12 | the largest A+B change: tackled on the ball 32% to 36%, shots cut out 30% to 33% |
| 40, 41, 48 | 9 / 7 / 7, 7 / 5 / 5, 9.5 / 6 / 5.5 | easier, within the noise of 30 runs |
| 50 Draw them out | 12 / 13.5 / 16.5 | the hand-over (+3) |
| 52 Crossover runs | 6 / 7 / 8.5 | the hand-over (+1.5) |
| 60 Total football | 3 / 4.5 / 6.5 | both: the new finish (+1.5) and the double decoy no longer emptying the middle (+2) |

**Where the hand-over bites most:** 60, 50, 18 and 52 (by takes), and 14 and 18 (bot routes). Pack 4's set pieces
have the most decoys, but their runs are short darts in the box (well under 10 m) or towards goal, so the hand-over
rarely fires there: pack 4's sum is unchanged by it.

## Not done, or worth knowing

- The hand-over is not in the rating builds of sets A-C; the owner has not played it yet.
- Fixture 53 has 10% of simulated players never finishing within 60 takes (3% before, 13% with A+B alone).
- Fixture 9 (the first with A) more than its neighbours: 4.5 to 7 takes and jitter 83% to 40% on the finish. If the
  owner finds the step at 9 too sharp, it is the candidate to move into the B-only group.
- `--jitter` is a single shared random stream (see above), so per-level jitter changes are partly reseeding.

## Files

- Engine: `one-man-team/js/sim.js`. Levels: `one-man-team/js/levels/pack1.js`, `pack2.js` (ramp; 5's tip), `pack3.js`
  (14 and 18 tips), `pack8.js` (56 and 60 tips), `pars.js`. Service worker: `one-man-team/sw.js`.
- Bot scripts: `tools/scripts/pack2.js`, `pack3.js`, `pack4.js`, `pack7.js`, `pack8.js`. Scenarios:
  `tools/ai-scenarios.js`. Level guide: `tools/LEVEL_DESIGN.md` (the `engine` field, A and B, the hand-over).
- App shell: `app/src/game-html.js` (synced).
