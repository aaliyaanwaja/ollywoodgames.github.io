# Foundations 10: pressure on the finish

Written by the defending specialist, Mon 23 Nov 2026. Prompted by the owner's complaint in set A ("the strikers almost
always had too much time so I could pick a corner") and his rule from set B: every defender's position and movement must
be explainable by a real defensive role relative to ball, goal, team-mates and attackers. No defender on a spot.

Nothing in the live engine, levels or tools was changed. All work is on a copy in `/home/claude/foundation-work/defending/`
(files listed at the end). The patch is `sim.patch` there.

## The short answer

1. **The striker's time comes from one moment the engine does not recognise: "he's through".** Once a forward is
   behind the last defender, every defender is slower than him with the ball, and a back-line man whose slot is more
   than 8 m away never steps out to him. In baseline 10 a striker who stops 18 m out is never tackled at all.
2. **Two football rules for that moment fix most of it.** When a carrier is through on goal: (a) the defenders behind
   the ball turn and sprint back, a little quicker than a man dribbling; (b) inside 24 m, the nearest back-line man goes
   to him, wherever his place in the line was. A striker who stands on the ball at 18 m is then caught in 0.75-1 s on
   baseline 10, 13 and 18 (was: never, 1.25 s, 0.75 s). Baseline 19 and today's 60 were already tight (0-0.2 s).
3. **The keeper should cover his near post.** Today he stands on the line from the ball to the middle of the goal,
   so on angled shots the near-post side is the bigger gap: the opposite of football. Standing on the bisector,
   shaded to the near post, closes it from 15 m out and leaves the far corner. The total goal open hardly changes.
4. **The middle of the move is untouched.** Simulated players fail before the last player exactly as often as before
   (owner profile, five fixtures: 20.5 failures per person, 20.8 with the through-on-goal rules, 21.1 with the keeper
   as well). The extra failures land on the finish.
5. **Rejected, with numbers:** a keeper who rushes out further (opens the goal at 15-17 m and breaks fixtures 1 and 2),
   slower dribbling everywhere (breaks 27 of 80 bot routes, mostly mid-move), a line that recovers on to the inside
   line (breaks cut-backs, adds nothing), full-backs tucking in (no effect on these fixtures). One goes, one covers is
   good football and harmless, but not a finish lever.

**Recommendation for the rating set:** A = "through on goal" (sprint plus nearest man goes) and B = keeper covers
his near post, played as today / A / A+B on five fixtures. Details at the end.

## How it was measured

Fixtures: baseline 10, 13, 18 and 19 (read-only, `/home/claude/baseline`) and today's 60. Labels below: B10 =
baseline 10; 60 = today's 60.

- **Owner-style finish** (`finish.js`). The finisher follows the bot's run until he has the ball, dribbles straight
  at goal until he is 18 m out (the owner shoots from 15-21 m), then stands and aims. Reported: how long he can stand
  there before he is tackled ("caught"), and how long after receiving he loses the ball if he never shoots. Also
  checked at 16 m and 20 m: same picture.
- **Bot's own finish** (as `forensics/finish.js`): the bot shoots from about 10 m. "Corner open" = how long it can
  stand aiming with at least 1 m of goal still open; "win" = seconds before any defender could win the ball.
- **The keeper alone** (`keeper.js`): no outfield players; a shooter dribbles in and shoots from 10-21 m, central,
  20 and 35 degrees off centre. Metres of the 8 m goal a full-power shot scores in, split near post / far post.
- **Simulated people** (`human.js`): `tools/human/player.js` (owner profile, expert, regular; 30 people each, run.js
  seeds), and my copy `player-long.js`, identical except that the finisher shoots from his own range of 15-21 m like
  the owner. Takes, failures per person split into "mid-move" (any earlier player), "final pass or run" (the last
  player fails before he has the ball: pass cut out, offside, keeper claims), "lost on the ball" and "shot saved or
  wide", and time and space at the shots they took.
- **Bots** (`bots.js`): every script in `tools/scripts` (today's 60) and the baseline's (20) on my engine. When one
  breaks, `rescript.js` checks whether a small change to the finisher's own script still scores.
- **AI scenarios** (`ai-scenarios.js`, my copy): the 33 existing scenarios plus five new ones.

With every new option off, my engine is bit-identical to the live one on all 80 bot replays, and the live
`tools/ai-scenarios.js` passes all 33 on the patched file.

## What the keeper allows today, from the owner's range

Shooter set, full power. Metres that score, with the near-post side and the far side.

| From | Today | Keeper covers near post (B) |
|---|---|---|
| 15 m, 20° | 3.9 (2.1 near / 1.8 far) | 4.2 (1.3 / 2.9) |
| 15 m, 35° | 3.0 (1.9 / 1.1) | 3.7 (0.9 / 2.8) |
| 17 m, 20° | 2.6 (1.5 / 1.1) | 2.7 (0.5 / 2.2) |
| 17 m, 35° | 1.6 (1.2 / 0.4) | 2.1 (0.2 / 1.9) |
| 19 m, 20° | 1.8 (1.2 / 0.6) | 2.0 (0.2 / 1.8) |
| 19 m, 35° | 0.9 (0.9 / 0.0) | 1.5 (0.0 / 1.5) |
| 21 m, 20° | 0.9 (0.8 / 0.1) | 1.3 (0.0 / 1.3) |

Central shots are unchanged (17 m: 2.8 m set, 4.2 m if he is still moving). Two readings:

- From 15-21 m the keeper already leaves only 1-4 m, so "picking a corner" is a matter of having time to aim, not of
  a big target. Time is the lever, as the football consultant argued (05, section 3: close windows in time, do not
  shrink targets).
- Today the near post is the softer side on every angled shot. A keeper beaten at his near post from 19 m is the
  goal fans blame on the keeper.

## The options

### 1. Recovery sprint (part of A)

**Football reason.** A defender without the ball is quicker than a forward with it. When a striker is through, every
defender behind the ball turns and races back to get goal-side; a striker who takes a touch too many is caught.

**In the engine.** `recSpd 7.0, recBoost 1.3, recZone 32`. It applies only when the carrier is through on goal (no
outfield defender on his feet goal-side of him within 5 m of his line to goal, `throughW 5`), inside 32 m of goal, to
a defender whose run is back towards his own goal: a beaten presser, a beaten screen, or a back line played through.
His top speed becomes his own speed plus 1.3 m/s, never above 7.0: a 5.3 m/s centre-half sprints at 6.6 against
dribbling at 6.5 and a free run at 7.6. Level designers' speed differences carry through. Not for a loose ball, so
through balls are judged exactly as today.

**Why the gate.** Ungated (any carried ball inside 32 m), it broke 7 bot routes, four of them before the finisher's
round (46, 47, 48, 52; in 47 a midfield carrier 22-29 m out is caught by a sprinting screen). Gated on "through",
only the finisher's round is affected.

**Measured, alone.** B13 standing time at 18 m 1.25 s to 0.75 s; bot's corner-open time 1.25 s to 0.5 s; "win"
1.16 s to 0.54 s. B10 unchanged (nobody is ever told to go to him: see option 2). B18, B19, 60 unchanged. Bots
77 of 80 (below). Scenarios: the existing "no defender faster than 5.8 m/s" check fails by design; my copy replaces it
with "never above 5.8 except in a recovery sprint, never above 7.0" (measured top 6.6 m/s).

### 2. Through on goal near goal: the nearest man goes (part of A)

**Football reason.** Inside the box or at the D, someone must go to the ball. A centre-half does not hold his slot
while a striker stands 17 m out with it.

**In the engine.** `dangerR 24, dangerEng 12`. When the carrier is through on goal and within 24 m of goal, any
back-line man within 12 m of the ball may be chosen as the first defender, not only one whose slot is within 8 m.
The usual pressing then applies: he closes, slows, jockeys, plants (the visible tell) and lunges.

**What it fixes.** In B10 the two line men are 26 m apart; after the first misses his lunge, the other recovers down
his own lane, well wide, and a striker standing at 17.5 m is never tackled (the move times out after 6.5 s). With
this rule the nearer man steps out: standing time 1.0 s, lost 2.2 s after receiving if he never shoots.

**Measured, alone.** B10 as above; nothing else changes on these five. Bots 80 of 80. Scenarios 33 of 33 plus the
new one.

**A (options 1 and 2 together), owner-style finish at 18 m.** Seconds he can stand before he is tackled; in brackets,
seconds from receiving to losing it if he never shoots.

| | Today | A |
|---|---|---|
| B10 | never (never) | 1.0 (2.0) |
| B13 | 1.25 (2.8) | 0.75 (2.3) |
| B18 | 0.75 (1.5) | 0.75 (1.5) |
| B19 | 0.2 (0.3) | 0.2 (0.3) |
| 60 | 0 (0.6) | 0 (0.6) |

B10 and B13 reach 18 m 1.0 and 1.5 s after receiving, so with A the striker has about a second in range, then he is
caught. On the bot's own route (shot from 10 m) the time he could stand aiming falls from 2 / 1.25 / 0.6 / 0.4 / 0 s
to 1.0 / 0.5 / 0.6 / 0.4 / 0 s. Open goal at the moment he arrives is unchanged (3.6 m at 18 m in B10 and B13):
A takes time, not space.

### 3. Keeper covers his near post (B)

**Football reason.** Keepers stand on the line that halves the angle between the posts as seen from the ball, and
shade towards the near post because a shot there arrives soonest. "Never get beaten at your near post."

**In the engine.** `gkBisect 1, gkNear 0.2`. While someone has the ball, the keeper's anchor on the goal line is
where that bisector meets it, moved a fifth of the remaining way towards the near post (only when the ball is 6 m or
more off centre). Everything else about him (how far out, narrowing, setting, reactions, diving) is unchanged. For a
loose ball he uses today's anchor (the angle is set against the man on the ball). Even so, in B19 the long-shooting
players lose the final ball to him more often: 30 claims per 30 players against 19 today (27 with A+B), because he is
already shaded to that side when the pass is played. A small cost in the final pass; real enough in football.

**Measured.** The keeper table above: near post 0.0-0.5 m open from 17-21 m, far corner 1.1-2.2 m. At the bot's
10 m shots, open goal 4.8 to 4.6 m (B10), 5.0 to 4.8 m (B19). Shading 0.35 or 0.5 instead of 0.2 opens the far corner
too much (21 m, 20°: 1.9 and 2.6 m).

Bots 74 of 80: B5, 5, 25, 49, 56 and 60 shoot inside the near post and are now saved. Each scores when re-aimed at
the far corner (3.8 / 3.8 / 4.0 / 5.6 / 0.4 / 0.2 m open). 56 and 60 were built on a 1 m sliver from 18-21 m (07
section 5): the sliver moves to the far post and narrows. That is a weakness of those two levels, not of the keeper.
Scenarios: the existing "keeper stands on the angle between ball and goal" now measures from his anchor (in my copy,
only when the option is on); plus a new one checking the near post closes.

### 4. One goes, one covers (tried, not recommended for this rating)

**Football reason.** When a centre-half steps out to the ball his partner drops off behind him and narrows, so that if
the first man is beaten the second is still between ball and goal (05, R12).

**In the engine.** `coverDeep 1, coverDepth 4.5, coverInside 0.6`. The inside neighbour of the line man who stepped
out goes to a point 4.5 m behind him on the line from ball to goal (60% of the way from his line slot), instead of
dropping 1.5 m. Tied to ball, goal and team-mate; no spot.

**Measured.** Bots 80 of 80. B18 bot route: corner-open 0.6 s to 0.3 s. But B13 gets looser (owner-style standing time
1.25 s to 2 s): the cover man drops into the striker's corridor, so he is no longer "through" and he is held up
rather than tackled. With A it partly cancels A in B13 (0.75 s back to 1.25 s). Simulated owner takes in B13 fell
from 9 to 6.5. Good football, worth having for realism later, but not a finish lever on these fixtures. The original
"lone carrier" scenario expects nobody below 11 m; the cover man goes to 10.2 m by design (adapted in my copy).

### 5. Keeper comes further out one-on-one (rejected)

`gkOneK 0.45 to 0.6, gkOneMax 5 to 7` (forensics option D). It shrinks the goal at 10 m (4.4 to 3.4 m central) but at
the owner's range he is caught coming out: 15 m central 4.0 to 4.6 m open, 17 m 2.8 to 5.0 m. It also breaks the bot
routes of fixtures 1 and 2, the tutorial (saved).

### 6. Slower dribbling instead of faster defenders (rejected)

`ballSpd 6.5 to 6.0`. It affects every carry in every round: 53 of 80 bot routes still solve, and most of the 27
breaks are earlier rounds (tackled, offside, intercepted). B10's striker is still never caught. The middle gets harder
(simulated owner: 21.3 mid-move failures per person against 20.5; final pass or run 9.7 against 8.8).

### 7. A played-through line recovers on to the inside line (rejected)

Recovering defenders run for the line between ball and goal as a tight group instead of down their lanes. It helped
B10 and B18 a little (standing time 2+ s to 1.25 s, 0.75 to 0.5 s) but breaks 10 bot routes, all by interceptions of
cut-backs and square balls in earlier rounds, and option 2 does B10's job without that. The unit already funnels in
when played through (`lineFunnel`); my scenario could not tell the two apart after 1.5 s.

### 8. Far full-back tucks in (rejected for now)

With the ball wide on the other side, the far full-back narrows to 3 m outside his far post. Football-true (05, R4), 80
of 80 bots, but it changed nothing measurable on these five fixtures (balls arrive central), and it narrows line
spacing below the existing scenario's 8.2 m. Revisit for wide-ball levels.

Options 7 and 8 are kept in `sim-experiments.js`, not in the patch.

## Simulated people: the middle against the finish

Owner profile, 30 people per cell, summed over the five fixtures (failures per person). "Lost" = tackled or smothered
on the ball in the last round; "shot" = saved or wide.

**Finishing as the model does (10-13 m)**

| Engine | Takes B10/B13/B18/B19/60 | Mid-move | Final pass/run | Lost | Shot |
|---|---|---|---|---|---|
| Today | 3.5/9/9.5/7.5/3 | 20.5 | 8.8 | 1.4 | 5.1 |
| A | 3/9/9.5/7.5/4 | 20.8 | 9.1 | 1.6 | 5.8 |
| B | 4/8.5/10/8.5/4 | 20.5 | 8.7 | 2.2 | 7.6 |
| A+B | 4/9/10.5/8/4.5 | 21.1 | 9.5 | 2.4 | 8.4 |

**Shooting from 15-21 m, like the owner**

| Engine | Takes B10/B13/B18/B19/60 | Mid-move | Final pass/run | Lost | Shot |
|---|---|---|---|---|---|
| Today | 3/10.5/7/9/5 | 20.8 | 8.2 | 1.6 | 5.6 |
| A | 3.5/10.5/7/9/4.5 | 21.0 | 8.6 | 2.4 | 6.8 |
| B | 3.5/13/7.5/8.5/5 | 21.3 | 9.7 | 3.0 | 8.9 |
| A+B | 4/11.5/8/8.5/5.5 | 21.2 | 10.1 | 3.7 | 8.8 |

Other profiles (models finishing as usual), mid-move / finish (lost plus shot) failures per person:

| Engine | Expert | Regular |
|---|---|---|
| Today | 17.9 / 7.9 | 29.3 / 13.6 |
| A | 18.1 / 10.0 | 30.6 / 20.3 |
| A+B | 18.1 / 11.9 | 28.8 / 22.7 |

Reading:

- Mid-move failures do not move (spread 20.5-21.4 for the owner profile; differences under about one failure per
  person across five fixtures are within the noise of 30 people). The finish gets harder: 6.5 to 10.8 failures per
  owner-profile person, 7.2 to 12.5 for the long shooter.
- "Final pass or run" rises a little with B (8.2 to 9.7 for the long shooter, mostly B18 and B19; see the keeper's
  claims in B19 above). Partly noise; watch for it in the rating.
- Takes change by about one per fixture. The model shoots quickly once it likes the corner (median 1-1.4 s on the
  ball), so it rarely stands and picks; at its shots the time before a defender could win the ball falls by only about
  0.1 s (owner profile: 0.8/0.6/0.7/0.6/0.7 s to 0.7/0.5/0.5/0.5/0.6 s with A) and the open goal stays 3-4.4 m. The
  owner-style probe is the better guide to what changes for a player who takes his time.

## Bots and scenarios, all options

| Engine | Bots solve | Broken (all in the finisher's own round) |
|---|---|---|
| Today | 80/80 | |
| A | 77/80 | B11, 11, 25: carry to 8-9 m and are caught; score shooting where they receive (2.6 / 2.6 / 1.8 m open) |
| B | 74/80 | B5, 5, 25, 49, 56, 60: near-post shot saved; re-aim far corner |
| A+B | 72/80 | B5, B11, 5, 11, 25, 49, 56, 60 |
| Cover | 80/80 | |
| A+B+cover | 74/80 | as A+B, less B11 and 11 (the cover man stops them counting as through) |

Every break re-scripts in the last round alone; no level needs an earlier round changed. Scripts are in today's
`tools/scripts` and the baseline's; the baseline ones are read-only, so the fixes belong to whoever adopts the patch.

AI scenarios (my copy): 38 of 38 under today's engine, A, B, cover, and every combination. That is the 33 existing,
three of them adapted only when their option is on (speed cap, keeper's angle line, lone carrier's floor), plus five
new: the sprint catches a striker who stops at 18 m (tackled 0.97 s after stopping, 0.4 s sooner than without it,
top speed 6.6 m/s); no sprint in midfield or for a loose ball; the nearer centre-half closes a striker standing between two wide
men (without the rule nobody goes in 5 s); the inside partner drops 4.8 m behind the man who steps out; with the ball
wide the keeper stands 0.7 m nearer his near post and the near-side gap closes. Determinism: 40 of 40 finished moves
per option replay identically from their recordings.

## Would a fan watching think "that's what a defender does"?

- **A:** the striker breaks the line, every defender behind him turns his back and races for goal, and the nearest
  centre-half comes across to meet him. Yes: this is the most familiar picture in football. The renderer already
  draws intent 'recover' at speed as a sprint (leaning into the run); a sprinting cover man keeps that intent so he
  is drawn sprinting too, and `d.sprint` is exposed if the artist wants more. The ball is still only lost to the
  existing tackle, with its 0.2 s plant: the player sees him coming and can shoot or cut.
- **B:** the keeper visibly shifts towards his near post as the striker comes in from wide, and the far corner opens.
  Yes, and it teaches the right finish: across the keeper.
- **No new defender, no spot.** Every new behaviour is defined by the ball, the goal, team-mates and the striker.

## Recommendation: the rating set

Put A and B in front of him, A alone and A with B. Leave cover out (not a finish lever here) and do not offer the
rejected ones.

**Proposed set C** (same rating build as A and B, neutral names, fixed shuffle, shot distance logged): B10, B13, B18,
B19 and 60, each as today, with A, and with A+B. Fifteen plays; if that is too many, drop B19-today and B18-A (he has
played B19 twice, and A does not change B18).

Questions it answers, and what the model predicts (owner profile shooting from 15-21 m, median takes):

| Fixture | Today | A | A+B |
|---|---|---|---|
| B10 | 3 | 3.5 | 4 |
| B13 | 10.5 | 10.5 | 11.5 |
| B18 | 7 | 7 | 8 |
| B19 | 9 | 9 | 8.5 |
| 60 | 5 | 4.5 | 5.5 |

The model predicts small changes in takes because it does not dawdle. The owner-style probe predicts the change he
will feel in B10 and B13: about a second in range, then caught. Read the answer from fun and fair and from the fail
codes ("tackled" on the last player is the new pressure; "saved" with B should be the near post), not from takes.
Add two questions: "Did the striker have time to pick a corner?" (1 none - 5 all the time) and "When you were caught
on the ball, did you see it coming?" (1-5). If A raises fun or holds it with fair 4-5, adopt A; if B's saves feel
like the keeper's credit, adopt B.

Before set C is built: re-script the eight broken bot routes as listed (or exclude those fixtures from the build's
bot check), and note that 56 and 60 keep only a 0.2-0.4 m window on their bot route under B.

## What I could not determine

- Whether he dawdles. The owner-style probe assumes he stops at 18 m to pick a corner, as his comment suggests. If he
  shoots on the run, A matters less and B more.
- The long-shot player is my one-line change to the human model, not calibrated to him.
- Only five fixtures were measured with simulated people. Bots cover all 80 fixtures.
- The renderer was not changed or checked on a device.

## Files

All in `/home/claude/foundation-work/defending/`:

- `sim.patch`: the engine change (options 1-4, each off by default; A = `recSpd 7, dangerR 24`, B = `gkBisect 1,
  gkNear 0.2`, cover = `coverDeep 1`). Applies cleanly to today's `one-man-team/js/sim.js`.
- `sim.js` (patched copy), `sim.orig.js` (today's), `sim-experiments.js` (also options 7 and 8).
- `env.js` (loads my engine with both level sets; the variants), `finish.js` (owner-style and bot finish probes),
  `keeper.js` (keeper alone), `human.js` and `player-long.js` (simulated people), `summary.js`, `bots.js`,
  `rescript.js`, `why.js`, `probe.js`, `probe2.js` (traces), `ai-scenarios.js` (38 scenarios; `VARIANT=<name>`).
- `out/`: every result quoted here (`finish-*.txt`, `keeper-*.json`, `human-grid-*.json`, `human-summary.md`,
  `bots-*.txt`, `rescript-*.txt`, `scenarios.txt`).
