# Defender and goalkeeper AI: notes for the lead (engine v2)

Everything is in `one-man-team/js/sim.js`. Behaviour is pinned by `node tools/ai-scenarios.js` (33 scenarios, `-v` shows
the measured numbers). Level-designer documentation is in `tools/LEVEL_DESIGN.md`.

## What changed, in football terms
| Before | Now | Why |
|---|---|---|
| Any defender touching the ball won it instantly | A tackle is a lunge: 0.2 s plant, he commits to a spot a third of the way through, the leg goes out, and a miss leaves him off balance for 0.57 s | The player can see every tackle coming and beat it with a cut; standing still or running straight still loses the ball |
| Everyone in range charged the ball | One first defender presses (chosen by who can get there soonest, with hysteresis), one covers 5 m goal-side, the rest keep shape | No more swarming; pressure, cover, balance |
| Pressers sprinted at the ball | The presser runs to cut the carrier off, slows inside 3 m and jockeys 1.4 m goal-side | He delays instead of selling himself |
| `zone` drifted towards the ball | `zone` screens the passing lane to the most dangerous receiver and steps on to it when the carrier slows to pass | Midfielders protect the space in front of the back line |
| No back line; markers set the offside line | New `line` type: one height for the unit, fixed spacing, shifts to the ball side, drops off a free ball, holds when the ball is pressed (offside trap), steps up when the ball goes back, one man steps out and his neighbours cover | The offside line is something the player reads: pressed passer = holding line, free passer = dropping line |
| `mark` stood 2.2 m straight behind his man | Goal-side and ball-side, 1.3-3.0 m by ball distance, and he sees his man 0.3 s late | Checking away from a marker now earns separation |
| Beaten defenders chased the ball | They run for a spot goal-side of the ball; a beaten back line recovers together and funnels in | Recovery runs |
| Keeper slid along his line | Angle play, narrows one-on-one and stands his ground, sets, 13-tick reaction (18 if caught moving), smothers at his feet, sweeps through balls he will win | Finishing is about distance, angle and shooting before he sets |

Players not yet played: defenders treat them as real (markers stay, lanes are screened, the keeper assumes they would
run), but a ball held by one is never pressed or tackled.

## Determinism
Defenders only read positions. Attacker velocity is measured from position differences, and the only "wind-up" tell
they use is the carrier slowing down, because aim and charge are not in a recording. A live round and its replay are
bit-identical to the defence (scenario "a live round and its replay look the same"). No randomness, clock or frame
dependence. Cost: about 7 microseconds per tick on this machine.

## Constants that set difficulty (all in `C`)
- Tackle: `lungeR` 1.5 + `lungeAgg` 0.6 x agg (range), `patience` 24, `lungeWind` 12, `lungeCommit` 4 (the tick of the
  plant at which he picks his spot: raise it and he reads later cuts, so he is harder to beat), `lungeStrike` 7, `lungeExt` 1.3, `footR` 0.55, `offBal` 34.
- Pressing: `jockeyD` 1.4, `jockeySlowR` 3, `pressR` 3 (what counts as pressure for the back line).
- Passing lanes: `passReact` 12 ticks, `interceptR` 0.85, `markInterceptR` 0.7, `zoneLeash` 5.
- Marking: `markReact` 18, `markTight` 1.3, `markLoose` 3.0, `markShade` 0.45.
- Back line: `lineGap` 13, `lineFloor` 15, `lineStep` 3, `lineDropK` 0.85, `lineShift` 0.4, `lineEng` 8.
- Keeper: `gkReact` 13, `gkLate` 5, `gkDive` 5.6, `gkReach` 1.05 + `gkDiveExt` 0.45, `gkOneMax` 5, `gkOneR` 18.
- Per level: `spd`, `eng`, `agg`, `react`, `tight`, `screen`, `leash` on defenders; `gk.sweeper`, `gk.react`;
  `lines[unit].gap / floor / step`.

Constants changed from v1: `tackleR` (0.95, instant) is gone, replaced by the lunge constants and `bodyR` 0.5;
`gkReact` 11 -> 13; every other v1 constant (attacker speeds, kicking, friction, shield, intercept radii, keeper
speeds and reach) is unchanged. Attacker controls, kicking and the recording format were not touched.

## Pack 1
All four levels rebuilt on real shapes (back four + screen; back three + full-back + screen; man-marking centre-half +
two-man line + screen; presser + two markers + back four). Level ideas are the same; four tips were reworded because the
solution changed (go round the screen, cut back from the byline). Jitter (40 runs): L1 100/100, L2 100/100/93,
L3 100/100/90, L4 100/100/100/80. No bot needed a new skill, so `tools/bots.js` is unchanged.

## Known weaknesses
1. **The renderer does not draw the tell yet.** `game.js` still draws plain discs. The fields are there (`lunge`,
   `intent`, `offBalance`, `fx/fy`, `footX/footY`); until someone draws the plant and the lunging leg, the player only
   sees the defender stop. This is the most important follow-up for fairness.
2. **Pack 1 may now be too forgiving** (most rounds 90-100% under jitter). I left it gentle because it is the tutorial
   pack; raise `spd`, `agg` or the screens' `eng` to tighten it.
3. **Other packs were built on the old engine.** Any pack 2/3 levels and scripts must be re-run; expect long through
   balls and passes straight past a screen to fail, and cut-backs to the six-yard line to be blocked.
4. Back-line members do not pick up individual runners: the unit drops as one. Two runners at different depths are
   handled by the deeper one only.
5. Zone players pick the receiver nearest the goal, not the one the play is actually going to. That is deliberate (it
   is what makes decoys work) but a screen can be pulled off the ball side quite cheaply.
6. The keeper is better against central shots from 14 m than against shots from 4 m either side of centre at the same
   distance (he narrows more slowly when the ball is central). Borderline cases only.
7. The cut-off run of a presser assumes the carrier keeps his current velocity; a carrier who zig-zags every few ticks
   makes him hesitate. Humans cannot really do this on a stick, bots could.
8. There is no collision or foul model: attackers still run through defenders' bodies, only the ball can be won.
9. No bot can feint, so no script proves a level that requires beating a man one-on-one.

## What I would do next
1. Draw the defence: facing wedge, plant flash, lunge leg, off-balance wobble, keeper set/dive; show `intent` in a
   debug overlay.
2. A `feint` skill for bots, then one pack-2 level built around beating a jockeying full-back.
3. Individual tracking inside a line (the nearest centre-half goes with a runner while the rest hold), and an explicit
   offside-trap step when the passer's head goes down.
4. Per-level keeper styles beyond `sweeper` (line keeper v rusher) and a near-post bias when the ball is wide.
5. Re-tune packs 2 and 3 against the new engine and raise pack 1's difficulty once the tells are drawn and playtested.
