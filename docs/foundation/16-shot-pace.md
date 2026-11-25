# Foundations 16: shot pace

Written by the engine and feel engineer, Wed 25 Nov 2026. Prompted by the owner's note on set D: "One change you
should make is the pace of the shot from distance. It rolls in and looks terrible. All the mechanisms can be the same
but the shot should look much faster." He shoots from 15-21 m (set B, set D: 15.4, 16.5 and 18.2 m).

## The short answer

1. **Most of the "roll" was slow motion.** The game showed the decisive shot (the last player's shot, on target,
   inside 20 m) at 0.38 speed. A shot from 18 m that takes 0.6-0.9 s in the engine took 1.5-2.4 s on screen and
   reached the line at 50-85 px a second: walking pace on a phone. Every shot from the owner's range was inside the
   slow-motion zone from the moment it was struck.
2. **The rest was the engine's pace.** 17-34 m/s, losing 15-25% of it before it reaches the line, drawn at about
   8 px a metre.
3. **Fix:** no slow motion; the shot and the keeper's answer to it run 1.2 times faster in the engine (`shotPace`);
   a shot gets its own sound, buzz, streak and net. A shot from 18 m now takes 0.5-0.8 s on screen and arrives at
   160-270 px a second: three to four times faster than the owner saw.
4. **Same outcomes.** The keeper gets to the same places on the same shots: open goal from 10-21 m within 0.3 m in
   every cell, average unchanged. The simulated owner's saved-shot rate is identical (30.1%); shots blocked by
   outfield players fall from 24.7% to 23.8% and the share of shots still in the air at the final whistle from 3.6% to
   2.1%. Takes over 60 fixtures: median 4 before and after, total 304.5 to 296.5 (about 3% easier). All 60 bot
   routes still score with no re-scripting.

## Diagnosis

### How hard players hit it

The kick button maps drag to power linearly: nothing inside 12 px, full power at 62 px (`game.js`, `R = 62, DZ = 12`).
A thumb flick of 30-50 px is power 0.36-0.76. The bots and the human model hit shots at or near 1, a person rarely
does, so the tables below show 0.3, 0.6 and 1.

### What a shot did before 16

`node tools/shot-pace.js --slowmo 0.38` on the old engine. Shot at goal centre, keeper 2.5 m out. "Screen" is
wall-clock time from strike to the line with the game's frame loop and its slow motion, and the speed on screen at the
line (7.8 px a metre: the median fixture on a 390 x 760 phone; the 60 range from 7.0 to 12.6).

| From | Power | Off the boot | At the keeper | At the line | Engine time to line | Screen time | On screen at the line |
|---|---|---|---|---|---|---|---|
| 15 m | 0.3 | 22.1 m/s | 18.6 | 17.9 | 0.75 s | 1.93 s | 53 px/s |
| 15 m | 0.6 | 27.2 | 23.7 | 23.0 | 0.60 s | 1.50 s | 68 px/s |
| 15 m | 1.0 | 34.0 | 30.5 | 29.8 | 0.47 s | 1.18 s | 88 px/s |
| 18 m | 0.3 | 22.1 | 17.8 | 17.1 | 0.92 s | 2.38 s | 51 px/s |
| 18 m | 0.6 | 27.2 | 22.9 | 22.2 | 0.73 s | 1.85 s | 66 px/s |
| 18 m | 1.0 | 34.0 | 29.7 | 29.0 | 0.57 s | 1.45 s | 86 px/s |
| 21 m | 0.3 | 22.1 | 16.9 | 16.2 | 1.10 s | 2.78 s | 48 px/s |
| 21 m | 0.6 | 27.2 | 22.0 | 21.3 | 0.87 s | 2.17 s | 63 px/s |
| 21 m | 1.0 | 34.0 | 28.8 | 28.1 | 0.68 s | 1.67 s | 83 px/s |

The slow motion (`decisive()` in `game.js`) was the larger cause by far: it multiplied every time above by about 2.5.
It was written to make the moment feel big, on the reasoning that stepping the sim less often changes nothing about
how it ends. True, but at 0.38 a 30 m/s shot reads as an 11 m/s roll, and as the ball also slows as it goes, the last
metres look like it is dying into the net. In the browser (fixture 58, the bot's 20 m full-power shot) the old game
took 1.73 s from strike to goal.

## What changed

### Engine (`one-man-team/js/sim.js`)

One new setting, `shotPace: 1.2`. A shot (any kick by the last ball player) and the keeper's answer to it run on a
clock 1.2 times faster:

- shot speed (`shotMin 17`, `shotMax 34`) and friction (`shotFric 0.28`) are both multiplied by it: 20.4-40.8 m/s,
  0.336 per second. Multiplying both by the same factor gives exactly the same path, covered in 1/1.2 of the time,
  so the ball decays over the same distances as before and every angle and target is unchanged;
- the keeper, against a shot only, counts his reaction 1.2 per tick (13 ticks on the shot's clock is about 11 real
  ticks; the +5 for a keeper still moving likewise), dives at 4.7 x 1.2 = 5.64 m/s and reaches full stretch 1.2 times
  as fast. So he reaches the same point of the ball's path at the same point of its flight as before. The reaction
  test is written so that `shotPace 1` is the old integer rule exactly.

Passes, the keeper against passes and crosses, and every outfield player are unchanged. `shotPace: 1` gives the old
engine bit for bit: all 60 bot routes hashed tick by tick (ball, keeper, every defender) are identical.

Why 1.2: it is the largest factor that keeps a diving keeper inside the existing fairness rule (nobody but a recovery
sprint faster than 5.8 m/s). Together with the end of the slow motion it already makes a shot three to four times
faster on screen; a bigger factor would put full-power shots well past 150 km/h.

What cannot be made exactly equivalent: outfield defenders. A defender who moves into the shot's path during its
flight now has 1/1.2 of the time to do it. Speeding them up during a shot would break the 5.8 m/s rule and look odd;
letting them read the shot sooner was tried and changed nothing measurable (blocks are almost all men already near
the lane). The cost is a slightly lower block rate, below.

### Presentation (`game.js`, `render.js`, `audio.js`)

- **No slow motion on the shot**, live or in the goal replay. The crowd still rises while the decisive shot is in the
  air. Slow aim (the player's option) is untouched.
- **Strike:** a shot has its own sound (`SFX.strike`: a deeper thump, a harder crack, a short whoosh) and a firmer
  buzz (26-40 ms against 10-24 for a pass: a medium-to-heavy tap on an iPhone), a chalk ring thrown off the boot,
  and a harder kick of the camera along the line of the shot.
- **Flight:** a brighter, wider motion streak for a shot (alpha 0.5 against 0.34). At 30-40 m/s the existing ten-tick
  streak is 5-7 m long.
- **Arrival:** the net bulge and the camera kick on a goal scale with how hard the ball hits the net (a tap-in barely
  moves it; a full-power shot shakes the camera 8 px against 6 before).
- Reduced motion (the system setting) still switches off the camera kick and the streak.

Pars regenerated (`tools/make-pars.js`): goals arrive 0-0.2 s sooner (mean 0.07 s), so the star thresholds move with
them. Service worker `omt-0.8.1` to `omt-0.8.2`. App shell synced.

## Measures, before and after

### Flight and screen time (`node tools/shot-pace.js`)

| From | Power | Before: screen time, px/s at line | After: off the boot | After: screen time | After: px/s at line |
|---|---|---|---|---|---|
| 15 m | 0.3 | 1.93 s, 53 | 26.5 m/s | 0.63 s | 168 |
| 15 m | 0.6 | 1.50 s, 68 | 32.6 | 0.50 s | 215 |
| 15 m | 1.0 | 1.18 s, 88 | 40.8 | 0.40 s | 279 |
| 18 m | 0.3 | 2.38 s, 51 | 26.5 | 0.78 s | 160 |
| 18 m | 0.6 | 1.85 s, 66 | 32.6 | 0.62 s | 207 |
| 18 m | 1.0 | 1.45 s, 86 | 40.8 | 0.48 s | 271 |
| 21 m | 0.3 | 2.78 s, 48 | 26.5 | 0.93 s | 152 |
| 21 m | 0.6 | 2.17 s, 63 | 32.6 | 0.73 s | 200 |
| 21 m | 1.0 | 1.67 s, 83 | 40.8 | 0.57 s | 263 |

In the browser, fixture 58's 20 m shot: strike to goal 1.73 s before, 0.58 s after (frame strips below).

### The keeper alone (open goal)

Same method as 10-finish-pressure.md (no outfield players, shooter dribbles in and shoots at every point of the goal
0.1 m apart; B on). Metres of the 8 m goal that score, keeper set:

| From | Power 1: before / after | Power 0.6: before / after |
|---|---|---|
| 10 m, central | 4.4 / 4.2 | 4.6 / 4.6 |
| 15 m, central | 4.0 / 4.0 | 2.4 / 2.2 |
| 15 m, 20° | 4.2 / 4.2 | 2.2 / 2.5 |
| 17 m, central | 2.8 / 2.6 | 1.6 / 1.6 |
| 17 m, 20° | 2.7 / 2.7 | 1.4 / 1.4 |
| 19 m, 20° | 2.0 / 2.1 | 1.0 / 1.1 |
| 21 m, 20° | 1.3 / 1.3 | 0.4 / 0.3 |
| Mean of 18 spots (10-21 m; 0°, 20°, 35°) | 3.16 / 3.19 | 2.08 / 2.12 |

On the run (keeper not set): mean 3.36 / 3.39 at power 1, 2.18 / 2.17 at 0.6. Over all 72 cells (18 spots, set and
on the run, two powers) no cell moved by more than 0.3 m; the mean change either way is 0.1 m. Near-post and far-post
splits move the same way (on angled shots from 17-21 m the near post is 0.0-0.6 m open, as before). The differences are tick rounding.

### Pressure at the finish (10's owner-style probe, 18 m)

`foundation-work/defending/finish.js` on both engines (fixtures B10, B13, B19, 9, 13, 56, 60; B18's bot fails before
its last round on both). Time on the ball, closing down and the time he can stand aiming with a corner open are
identical on every fixture (for example B10: in range after 0.98 s, corner open 0.75 s, caught after 1 s; B13: 0.6 s
and 0.75 s). Open goal when he arrives: B10 3.6 to 3.8 m, B13 3.6 to 3.8, 9 4.2 to 4.4 (bot's shot), 56 4.0 to 3.8,
others identical.

### Bots and scenarios

| Check | Before | After |
|---|---|---|
| `node tools/test.js` | 60/60 | 60/60, no route re-scripted |
| `node tools/test.js --jitter`, mean of last-round rates | 74.3% | 74.5% |
| ditto, all rounds | 89.6% | 89.7% |
| `node tools/ai-scenarios.js` | 45/45 | 45/45 |
| `npm test` in `app/` | passes | passes (bridge 35/35) |
| `npm run check-native` | 11 passed | 11 passed |
| `shotPace 1` against the old engine, 60 routes hashed per tick | | identical |
| Single-file build (`/home/claude/game/index.html`) played by the bots in Playwright (`play2.py`) | | 60/60 goals, no console errors |

Jitter: one fixture moved 10 points or more on its last round (27, 63% to 50%; the shared random stream, see 13).
One scenario was adapted: "the keeper does not move during his reaction time" now reads his reaction on the shot's
clock (`gkReact / shotPace` real ticks). The fairness scenario (keeper never above 5.8 m/s) passes unchanged: his
fastest dive is 5.64 m/s.

### Simulated owner (`node tools/human/run.js --root . --levels 1-60`, 30 runs, seed 1)

| Pack | Fixtures | Median takes: before / after | Sum of medians: before / after |
|---|---|---|---|
| 1 | 1-4 | 1.75 / 1.75 | 6.5 / 6.5 |
| 2 | 5-12 | 4 / 4 | 34 / 33 |
| 3 | 13-20 | 2.75 / 2.75 | 40 / 39 |
| 4 | 21-28 | 3.5 / 3.5 | 41.5 / 41 |
| 5 | 29-36 | 4 / 3.75 | 45.5 / 41 |
| 6 | 37-44 | 4 / 4 | 34 / 34 |
| 7 | 45-52 | 5.25 / 4.75 | 50.5 / 48 |
| 8 | 53-60 | 5.75 / 5.5 | 52.5 / 54 |
| All | 1-60 | 4 / 4 | 304.5 / 296.5 |

Per shot taken (5,501 shots before, 5,270 after): saved 30.1% / 30.1%, blocked by an outfield player 24.7% / 23.8%,
wide 9.1% / 10.1%, still in the air at the whistle 3.6% / 2.1%, scored 32.5% / 33.9%. Fixtures whose median moved by
two takes or more: 36 (9.5 to 7.5) and 51 (5 to 3), both within the noise of 30 runs on the evidence of 13. All 1,789
finished moves replay identically from their recordings.

Reading: the keeper is exactly where he was. The small easing comes from blocks (a defender stepping across has less
time) and from shots struck in the last fraction of a second, which now arrive before the whistle. If the owner finds
the finish softer, the natural lever is the keeper's reaction (`gkReact`), not the pace.

## Screenshots

Frame strips of fixture 58's final shot (20 m), wall-clock time after the strike and the ball's distance from the line
under each frame:

- `/home/claude/shots/shotpace-before-p1.0.png` and `/home/claude/shots/shotpace-after-p1.0.png`: full power,
  1.73 s before, 0.58 s after.
- `/home/claude/shots/shotpace-before-p0.6.png` and `/home/claude/shots/shotpace-after-p0.6.png`: power 0.6. The
  keeper saves it at the same spot in both (3.6 m and 3.3 m out), 1.76 s after the strike before, 0.61 s after.

## Files

- Engine: `one-man-team/js/sim.js` (`shotPace`, `ball.shot`, the keeper's shot clock).
- Presentation: `one-man-team/js/game.js` (slow motion removed, strike sound), `render.js` (ring, streak, net, camera),
  `audio.js` (`SFX.strike`).
- Pars: `one-man-team/js/levels/pars.js`. Service worker: `one-man-team/sw.js`. App shell: `app/src/game-html.js`.
- Tools: `tools/shot-pace.js` (new: flight, screen time, the keeper's open goal; `SIM=` for another engine copy),
  `tools/ai-scenarios.js` (reaction scenario).
- Rulebook: section 2.3 (shot) and 2.7 (keeper).
