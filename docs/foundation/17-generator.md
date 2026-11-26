# Foundations 17: the level generator

Written by the lead engineer, Thu 26 Nov 2026. The owner said "go ahead" to a generator built from the rulebook that can
make an unlimited number of levels, and to a blind set of generated levels for him to rate (set E, 18-set-E-plan.md).
The generator is `tools/gen/`. It follows RULEBOOK.md version 1 step by step; where the book contradicts itself or the
engine will not do what a rule assumes, this note says what I did and why. The live engine and the 60 live levels were
not touched.

## The short answer

1. **It works, and it is unlimited in number.** `node tools/gen/cli.js --seed S --count N` makes N levels (or a campaign
   from fixture 1) in the live format with bot routes; same seed, same levels. Every level it keeps has passed every
   automatic check of rulebook 8.1. The proof run made 156 levels (152 ordinary, 4 closing), and the tutorial survey and
   campaign runs made 17 more; every level asked for appeared.
2. **Acceptance is 18% of attempts overall, very uneven by template**: Third-man run 63%, Sweeper-keeper 53%, False nine
   40%, Bend the run 36%, Five-man move 33%; Switch of play, Up back and through, Wing and cut-back 1-3%; Diagonal in
   behind 0%. A level takes a median 69 s on this two-core machine (quartiles 43-113 s).
3. **On the measures, the generated levels sit inside every rulebook range by construction, and where the hand-built
   ones sit.** The hand-built ones do not all pass the rulebook: of the 16 live fixtures 5-20, only Play through the
   press and Five-man move pass every structural check (below).
4. **Honest view of quality:** they look like real football and like the hand-built levels, because each template is a
   parameterised version of a level he rated (screenshots below). They are the same ideas with different numbers, not
   new ideas, and two levels from one template look alike. Several templates almost never pass the checks, so the
   realised mix leans on six templates. Whether they are as much fun is what set E (18-set-E-plan.md) will show.

## How it works

A level is made in eight steps, the rulebook's own order (section 1, "For a generator"). Every step is seeded: the same
seed gives the same level, byte for byte (checked: two processes, same seed, identical level and bot route).

1. **Pick a template** from the pool by tier weight (4.2), inside the band and the variety constraints. The generator
   stays with the template it drew for up to four attempts before drawing again, so that the mix follows the weights
   rather than drifting towards the templates that are easiest to accept.
2. **Sample its parameters** inside the ranges of 4.3 ("Vary"), and choose the side (mirror x to 50 - x).
3. **Place the defence by role** with the procedure of 5.2: the back line by height and spacing, shifted to the ball
   side; markers goal-side of their man at 2-2.6 m (times `tight`); each screen on the lane he guards, slid along it
   until he is 6-16 m in front of the line, within 12 m sideways of its centre and 3 m clear of everyone; each hunter
   6.5-12 m from his passer, goal-side, and 6.5 m from the ball. One speed for the line, markers and hunters within
   0.3 of it.
4. **Static checks**: V1-V11 and the role test 5.4 (`check.js`, `staticChecks`).
5. **Search a bot route** (`route.js`). The template's plan says, round by round, the kind of touch (to feet, first time,
   carry then pass, through ball into space, run along the line, the finish) and the intended points. The search is
   depth first with backtracking. Each receiver's start tick is scanned; the longest run of start ticks that gets him
   the ball is kept, and inside it the start that gives the football the rulebook asks for (the runner taken 17-28 m out
   and onside by 0.4-2.5 m at the kick; a middle receiver closed down within 3.5 m), pulled towards the middle of the
   run so the timing stays forgiving. Then kick targets, powers and carries are tried in order of distance from the
   plan. The finisher carries to a spot on his side 11-16 m out and shoots for the far corner. Up to four (eight with a
   decoy) complete routes are found and the one that best meets J1, J3, J4a, J5 and the decoy "needed" test is kept.
   Last, each pass is moved to the middle of its aim and power windows (the aim3.js criterion: the whole move must
   still score), as a designer would.
6. **Dynamic checks** (`dynamicChecks`): J1-J7 and J10 by the set D methods, cheapest first, stopping at the first
   failure.
7. **Fit the clock** to the band. Whole seconds, 7-14 s. Candidate clocks are those whose slack is inside the band's
   slack range (up to 1 s more if the model needs it); the search starts at the middle of the slack band and walks
   towards the band's target of human-model takes. Clocks are screened with a short model run (12 people, 30 takes)
   and the chosen one is confirmed with the full owner profile (30 people, 60 takes). If even the longest allowed clock
   is too hard, or the shortest too easy, the second dial of 7.1 is used: the whole defence 0.1 m/s slower (or faster),
   twice at most, inside the band's speed range; the route and the dynamic checks are then run again.
8. **Final checks at the real clock** (`finalChecks`): A2 (route and replay score), A3 (jitter, every round 45% or
   more), A5 (decoy run 10 m or less, drag 12 m or less, needed, truncation), A6 (the owner model clears 90% or more
   within 60 takes and its median is inside the band), J8 (bump, out, early), J9 (flag only), the novice check for
   fixtures 1-20 in a campaign, A7 (bot / clock 0.80 or less; the band ratio is a note) and A8 (the replay hashed tick by
   tick twice, and every simulated finished move replays identically). Any failure rejects the level and the next
   attempt starts from step 1 (40 attempts at most).

### Bands

The owner's targets (rulebook 9) are takes on his first play. The generator fits the clock to the human model, which is a
band only and underrates his hardest levels by 2-3 times, so each band asks the model for its own range.

| Band | Used for | Owner target | Slack | Bot / clock | Line speed | Model median |
|---|---|---|---|---|---|---|
| opening | fixtures 1-4 (tutorial templates) | 1-2 | 6-8 s | 0.35-0.55 | 4.0-4.8 | 1-2.5 |
| ordinary (CLI) | any ordinary level | 3-8 | 2.8-4.8 s | 0.58-0.72 | 5.1-5.5 | 3-7, target 5 |
| standard (campaign) | fixtures 5-11, breathers | 3-6 | 3.8-4.8 s | 0.58-0.66 | 5.1-5.3 | 2.5-6, target 4 |
| hard (campaign) | fixtures 12-19 | 5-8 | 2.8-3.8 s | 0.64-0.72 | 5.3-5.5 | 4-7.5, target 5.5 |
| closing | one per season | 8-15 | 1.8-3.8 s | 0.64-0.78 | 5.3-5.6 | 6-14, target 8.5 |

J2 (count of tight windows): standard 1-3, ordinary and hard 1-5, closing 2-5 (J1 needs two tight touches in the
closing band). Each repeat of the 5-20 pattern adds 0.1 m/s (to 5.7) and takes 0.3 s off the slack (to 1.8 s).

### The templates (`templates.js`)

Every template of 4.2's tiers 1 and 2, plus the four one-idea tutorials of 7.3 for fixtures 1-4. Each has its roles,
touch order, the defence it beats, the ranges a generator may vary, and a plan for its bot route. Coordinates are those
of the baseline level (or the set D level) the template comes from, made relative to the back line's height.

| Template | Tier (weight) | Phases | Beats | Varies | Bot route plan |
|---|---|---|---|---|---|
| Five-man move | 1 (3) | E E F O R X | a hunter on the centre-back, a screen on the switch lane, a man-marked creator and a holding back four | yL 24 to 30, gap 8 to 10, pressD 7 to 10, creOn 8 to 10, finOn 3 to 6, finSide 12 to 18, markReact 14 to 22, shift -1 to 1 | #4 pass to feet; #6 meets it, first time, pass to feet; #8 timed run to meet it, carries, pass to feet; #10 timed run to meet it, first time, through ball; #7 times his run (onside scan), carries to 11-16 m, far corner |
| Beat the trap | 1 (3) | E B F O R X | a high back four that steps up on a ball back, with a hunter, a screen and a man-marked creator | yL 28 to 33, gap 8 to 9, pressD 6.5 to 9, stOn 6 to 9, shift -2 to 2 | #3 carries, pass to feet; #6 meets it, carries, pass to feet; #10 timed run to meet it, first time, through ball (tightest lane); #9 times his run (onside scan), carries to 11-16 m, far corner |
| Third-man run | 1 (3) | E F O(=R) X | a back three whose centre-half follows the target man short, behind a screen on the direct lane | yL 23 to 27, tgtOn 3 to 5, thirdSide 12 to 18, thirdOn 3 to 6, markReact 14 to 22, tight 0.8 to 1, lineW 24 to 28, shift -1 to 1 | #5 pass to feet; #6 meets it, carries, pass to feet; #9 timed run to meet it, first time, through ball; #11 times his run (onside scan), carries to 11-16 m, far corner |
| Switch of play | 1 (3) | E S X | a block that has slid across to the ball side, with a hunter on the full-back and a screen | yL 25 to 29, nLine 3, shift 5 to 8, winX 5 to 10, winOn 2 to 5, pressD 7 to 9, pressD2 7 to 8.5, pivFront 15 to 18 | #2 pass to feet; #6 meets it, first time, through ball; #11 times his run (onside scan), carries to 11-16 m, far corner |
| Bend the run | 1 (3) | E E F O R X | a high, held back four: a straight run is offside, so the winger runs along the line and bends in behind | yL 28 to 32, gap 8 to 9, pressD 7.5 to 9.5, winX 5 to 9, winOn 3 to 4, markReact 14 to 22, shift -2 to 2 | #4 pass to feet; #6 meets it, pass to feet; #10 timed run to meet it, first time, through ball (tightest lane); #11 runs along the line, then goes for it, carries to 11-16 m, far corner |
| Diagonal in behind | 2 (2) | E F S X | a back four squeezed across to the ball side, with a hunter on the centre-back and a screen in front of the playmaker | yL 25.5 to 27.5, pressD 7.5 to 8.5, shift -8, finX 40 to 42, finOn 2 to 3 | #4 pass to feet; #8 meets it, carries, through ball; #7 times his run (onside scan), carries to 11-16 m, far corner |
| Play through the press | 2 (2) | E E(first time) C R X | two hunters closing the first two passes, then a back four with nobody in front of it | yL 25 to 29, pressD1 8 to 10, pressD2 7 to 9, stX 26 to 31, stOn 2 to 5, shift -2 to 2 | #4 pass to feet; #6 meets it, first time, pass to feet; #8 timed run to meet it, carries, through ball (tightest lane); #9 times his run (onside scan), carries to 11-16 m, far corner |
| The counter | 2 (2) | E C R X | a team caught upfield: two hunters and only two centre-halves back | yL 25 to 29, pressD1 7 to 9, pressD2 8.5 to 11, winX 38 to 43, lineW 9 to 11, shift -1 to 1 | #6 pass to feet; #10 meets it, carries, through ball (tightest lane); #7 times his run (onside scan), carries to 11-16 m, far corner |
| False nine | 2 (1) | E decoy O R X | a back three whose centre-half follows a dropping 9, with a screen and a marker on the playmaker | yL 25 to 29, drop 8 to 10, runX 10 to 14, runOn 2.5 to 4.5, lineW 24 to 25, shift -1 to 1 | #5 carries, pass to feet; #9 decoy run; #8 timed run to meet it, first time, through ball; #11 times his run (onside scan), carries to 11-16 m, far corner |
| Wing and cut-back | 2 (2) | E (decoy) R K | a back four whose full-back stands wide: the winger gets in behind through the channel inside him, reaches the byline and pulls it back to the penalty spot the retreating line leaves | yL 21 to 25, pressD 7 to 9, winOn 2.5 to 4, tenOn 11 to 14, fbWide 11 to 11.5, decoy 0 to 1, shift 0 to 1, spotPt 0 to 2, bylinePt 0 to 2 | #6 pass to feet; #8 timed run to meet it, first time, through ball (tightest lane); #7 runs along the line, then goes for it, carries, pass to feet; #10 timed run to meet it, first time, shoots first time |
| Sweeper-keeper | 2 (1) | E F C R X | a high back four with a keeper who sweeps anything played into the box | yL 28 to 31, gap 8 to 9, winY 44 to 47, creOn 7 to 9, stOn 2 to 3.5, shift -1 to 1 | #4 carries, pass to feet; #7 timed run to meet it, first time, pass to feet; #10 timed run to meet it, carries, through ball (tightest lane); #9 times his run (onside scan), carries to 11-16 m, far corner |
| Up, back and through | 2 (2) | E F O B R X | a back four that steps up on the set-back, a screen on the lane to the 10 and a marker on the 9 | yL 27.5 to 30, gap 9, pressD 7.5 to 9.5, tgtOn 4 to 6, winOn 2.5 to 4, markReact 16 to 22, shift -2 to 2 | #6 carries, pass to feet; #9 meets it, first time, pass to feet; #10 timed run to meet it, first time, through ball (tightest lane); #7 runs along the line, then goes for it, carries to 11-16 m, far corner |
| Short then long | 2 (2) | E E F R X | two hunters, a screen and a tight man-marker on the 9 in front of a back three: the 9 comes short, then spins | yL 24 to 27, gap 9, pressD1 6.5 to 8.5, pressD2 8 to 10, stOn 6.5 to 7.5, markReact 20 to 26, shift -1 to 1 | #4 pass to feet; #6 meets it, first time, pass to feet; #8 meets it, through ball (tightest lane); #9 runs along the line, then goes for it, carries to 11-16 m, far corner |
| Commit the centre-half | 2 (2) | E F C R X | a back four whose centre-half has to step out to a runner, with a hunter and a screen in front | yL 25 to 28, gap 8, pressD 7.5 to 9.5, tenOn 12 to 14, stOn 2 to 4, shift -2 to 2 | #6 carries, pass to feet; #10 meets it, carries, through ball (tightest lane); #9 runs along the line, then goes for it, carries to 11-16 m, far corner |
| Ball inside the full-back | 2 (2) | E F O R X | a compact back four whose full-back stands wide to watch the winger, leaving one seam inside him | yL 23 to 27, pressD 7 to 9, tenOn 9 to 11, winOn 2.5 to 4, fbWide 11 to 11.5, shift -1 to 1 | #6 pass to feet; #8 meets it, pass to feet; #10 timed run to meet it, first time, through ball; #7 runs along the line, then goes for it, carries to 11-16 m, far corner |
| First pass | tutorial (1) | F X | nobody: one screen out of the way. Teaches pass and run | pmY 46 to 50, stX 23 to 27, stY 26 to 29, zX 12 to 15 | #8 through ball; #9 timed run to meet it, carries to 11-16 m, far corner |
| Through ball | tutorial (1) | R X | a two-man line that holds: teaches the offside line | yL 24 to 26, w 10 to 11.5, stOn 2 to 3 | #8 carries, through ball; #9 times his run (onside scan), carries to 11-16 m, far corner |
| Down the wing | tutorial (1) | F K | a full-back on the winger and one defender in front of goal: teaches the cut-back | wY 38 to 41, stY 25 to 28 | #6 carries, through ball; #7 timed run to meet it, carries, pass to feet; #9 timed run to meet it, first time, shoots first time |
| The decoy | tutorial (1) | decoy F X | a marker who follows the decoy out of the middle | fX 13 to 16, fY 29 to 31 | #10 decoy run; #8 carries, through ball; #11 times his run (onside scan), carries to 11-16 m, far corner |

### The campaign (`campaign.js`)

| Fixtures | Band | Engine field | Templates |
|---|---|---|---|
| 1-4 | opening | `{ recSpd: 0, dangerR: 0, gkBisect: 0, gkNear: 0, markLeash: 0 }` | First pass, Through ball, Down the wing, The decoy, in that order |
| 5-8 | standard | `{ recSpd: 0, dangerR: 0, markLeash: 0 }` (B only) | 5 and 7 from tier 1 |
| 9-11 | standard | none (A+B) | tiers 1-2 |
| 12-14 | hard (12 is a breather: standard) | none | tiers 1-2 |
| 15-19 | hard (16 is a breather: standard) | none | 15, 17 and 19 from tier 1 |
| 20 | closing | none | any |
| 21 onwards | the 5-20 pattern again, as seasons of 16 (closing at 36, 52, ...) | none | as above |

The `markLeash: 0` in fixtures 1-8 matches the live levels (rulebook 5.3: the hand-over is off for fixtures 1-8; the
rulebook's own table in 3.1 predates the hand-over and omits it). Variety: no template twice in any three levels running;
the attacking side (the side the finisher attacks from) alternates; the finisher's role differs from the last level's;
the back line's height band (high 28+, medium 22-28, low below 22) changes from one level to the next; no two cut-backs
running. Names are short football phrases, unique in the campaign (each template has five).

## How to run it

```
node tools/gen/cli.js --seed 7 --count 20 --out /tmp/campaign.js          # fixtures 1-20 of a campaign
node tools/gen/cli.js --seed 7 --count 16 --start 21 --out /tmp/s2.js     # the second season
node tools/gen/cli.js --seed 7 --count 10 --band ordinary --out /tmp/o.js # ten ordinary levels
node tools/gen/cli.js --seed 7 --count 1 --band closing --template five   # one closing Five-man move
node tools/gen/proof.js run --shard 0/2 --out /tmp/p0.jsonl               # the proof run below (and shard 1/2)
node tools/gen/proof.js report /tmp/p0.jsonl /tmp/p1.jsonl
```

`--out` writes the pack in the live format (`L.push(...)`, as `one-man-team/js/levels/packN.js`), its bot routes in the
`tools/scripts/packN.js` format (`-scripts.js`) and everything measured (`.json`). The CLI prints one row per level with
every automatic check of 8.1, then the attempts per template and the should-rule notes. To try a generated pack in the
game, build it with `tools/build-set.py` as a rating set.

## Results

### The proof run

`node tools/gen/proof.js` over 152 ordinary seeds from 1001-1160 and closing seeds 2001-2004: 156 levels asked for, 156 made.
The planned 200 also had 21 more closing and 15 opening levels; the run was stopped at 156 when the server restarted.
The tutorial band is covered by 8 survey levels and the campaign run below: each was made in 1-2 attempts, with clocks of
11-14 s, owner model 1-2 takes and no novices beyond 30 takes. The Switch of play figures predate a fix to where its
second hunter stands (he was placed towards the ball and broke V3); after the fix it was made in the campaign run.

Run: 156 levels asked for, 156 generated

| Template | Tier | Attempts | Accepted | Acceptance | Levels in the run | Commonest rejections |
|---|---|---|---|---|---|---|
| Five-man move | 1 | 51 | 17 | 33% | 17 | dynamic: J2 38%; clock: owner model median 12s 18%; clock: owner model median 11s 15% |
| Beat the trap | 1 | 65 | 11 | 17% | 11 | dynamic: J1 63%; clock: owner model median 12s 17%; dynamic: J4b 9% |
| Third-man run | 1 | 41 | 26 | 63% | 26 | dynamic: J4b 33%; dynamic: J1 27%; dynamic: J3 20% |
| Switch of play | 1 | 110 | 1 | 1% | 1 | dynamic: J1 47%; static: V3 28%; static: V2 12% |
| Bend the run | 1 | 69 | 25 | 36% | 25 | dynamic: J3 39%; dynamic: J4b 16%; clock: owner model median 10s 14% |
| Diagonal in behind | 2 | 80 | 0 | 0% | 0 | dynamic: J1 79%; route: r3 shot tackled 11%; dynamic: J2 5% |
| Play through the press | 2 | 44 | 7 | 16% | 7 | route: r4 reception intercepted 49%; dynamic: J2 43%; dynamic: J3 8% |
| The counter | 2 | 46 | 9 | 20% | 9 | dynamic: J1 41%; dynamic: J2 22%; clock: owner model median 11s 11% |
| False nine | 2 | 15 | 6 | 40% | 6 | final: A5 44%; dynamic: J4b 33%; dynamic: J5 11% |
| Wing and cut-back | 2 | 64 | 2 | 3% | 2 | static: V2 23%; dynamic: J2 21%; clock: owner model median 8s 11% |
| Sweeper-keeper | 2 | 30 | 16 | 53% | 16 | dynamic: J2 43%; dynamic: J3 36%; clock: owner model median 13s 21% |
| Up, back and through | 2 | 73 | 1 | 1% | 1 | dynamic: J4b 60%; dynamic: J2 39%; dynamic: J1 1% |
| Short then long | 2 | 51 | 9 | 18% | 9 | clock: owner model median 11s 38%; dynamic: J2 21%; dynamic: J4b 17% |
| Commit the centre-half | 2 | 64 | 8 | 13% | 8 | dynamic: J1 61%; dynamic: J2 23%; clock: owner model median 10s 7% |
| Ball inside the full-back | 2 | 82 | 18 | 22% | 18 | dynamic: J1 89%; dynamic: J2 6%; dynamic: J4b 3% |
| All | | 885 | 156 | 18% | | |

ordinary: 152/152 generated; time per level median 68.9 s, quartiles 42.5-113 s, max 421.2 s; attempts median 5, max 21
closing: 4/4 generated; time per level median 81.1 s, quartiles 59.4-81.1 s, max 230.6 s; attempts median 7, max 30
opening: 0/0 generated; time per level median - s, quartiles --- s, max -Infinity s; attempts median null, max -Infinity

#### ordinary (152 levels): median, 10th-90th percentile, min-max

| Measure | Rulebook | Median | 10-90% | Min-max | Inside |
|---|---|---|---|---|---|
| clock | 7-14 | 10 | 9-11 | 8-13 | 100% |
| ratio | <= 0.80; band | 0.6 | 0.53-0.64 | 0.45-0.69 | 100% |
| slack | band | 3.9 | 3.45-5.37 | 3.3-5.77 |  |
| jitMin | >= 45 | 95 | 68-100 | 50-100 | 100% |
| J1 | >= 1 | 1 | 1-3 | 1-4 | 100% |
| J2 | 1-5 (closing 2-5) | 2 | 1-4 | 1-5 |  |
| J3on | 0.3-5 m | 2.1 | 1.1-3.1 | 0.3-4 | 100% |
| J3win | 0.3-2.5 s | 1 | 0.5-2.1 | 0.3-2.63 | 99% |
| J4a | 14-32 m | 23.1 | 18.9-29.1 | 16.7-31.8 | 100% |
| J4bStand | <= 1.0 s | 0.62 | 0.32-0.93 | 0.05-1 | 100% |
| J4bRecv | <= 2.5 s | 1.38 | 0.55-2.13 | 0.33-2.47 | 100% |
| corner | (owner: corner time) | 0.4 | 0-0.6 | 0-0.75 |  |
| J5 | <= 6.5 m | 2.1 | 1-3.7 | 0.2-6.4 | 100% |
| shot | bot shot, m | 13.5 | 13.4-13.5 | 12-15 |  |
| open | >= 1 m | 4.4 | 3.8-5 | 2.4-5.8 | 100% |
| middle | J9 0.3-0.7 (flag) | 0.46 | 0.26-0.67 | 0.08-0.83 | 80% |
| spdMean | band | 5.3 | 5.13-5.46 | 5.07-5.6 |  |
| nDef | slot | 7 | 4-7 | 4-7 |  |
| nBall | 2-5 | 4 | 3-5 | 3-5 | 100% |
| yL | 18-33 | 27 | 24-31 | 21.5-32.5 | 100% |

Human model (owner profile, 30 runs) median takes: 152 of 152 inside the band's model range 3-7 (owner target 3-8); distribution 3: 8, 3.5: 3, 4: 12, 4.5: 4, 5: 32, 5.5: 11, 6: 27, 6.5: 15, 7: 40
By template (median of the model medians): cutback 7 (2), bend 7 (25), inside 5.5 (18), five 6.5 (16), counter 6 (9), upback 5 (1), press 3 (7), trap 6 (11), third 5 (26), commit 5 (8), switch 6 (1), shortlong 6.5 (9), sweeper 6.5 (13), falsenine 6 (6)
Flags and should-rule notes: J3 (should) 56, J3 (cut-back, exempt) 1, A7 (band) 49, J9 (flag) 31, 7.3 (should) 35

#### closing (4 levels): median, 10th-90th percentile, min-max

| Measure | Rulebook | Median | 10-90% | Min-max | Inside |
|---|---|---|---|---|---|
| clock | 7-14 | 11 | 9-12 | 9-12 | 100% |
| ratio | <= 0.80; band | 0.68 | 0.62-0.73 | 0.62-0.73 | 100% |
| slack | band | 3.98 | 2.7-4.6 | 2.7-4.6 |  |
| jitMin | >= 45 | 100 | 78-100 | 78-100 | 100% |
| J1 | >= 1 | 2 | 2-3 | 2-3 | 100% |
| J2 | 1-5 (closing 2-5) | 3 | 2-4 | 2-4 |  |
| J3on | 0.3-5 m | 3 | 1.8-3.1 | 1.8-3.1 | 100% |
| J3win | 0.3-2.5 s | 0.8 | 0.77-1.63 | 0.77-1.63 | 100% |
| J4a | 14-32 m | 25.3 | 21.1-25.8 | 21.1-25.8 | 100% |
| J4bStand | <= 1.0 s | 0.77 | 0.58-1 | 0.58-1 | 100% |
| J4bRecv | <= 2.5 s | 1.77 | 1.45-1.87 | 1.45-1.87 | 100% |
| corner | (owner: corner time) | 0.5 | 0.3-0.75 | 0.3-0.75 |  |
| J5 | <= 6.5 m | 1.4 | 1-2.1 | 1-2.1 | 100% |
| shot | bot shot, m | 13.5 | 13.4-13.5 | 13.4-13.5 |  |
| open | >= 1 m | 5 | 4.4-5 | 4.4-5 | 100% |
| middle | J9 0.3-0.7 (flag) | 0.5 | 0.35-0.58 | 0.35-0.58 | 100% |
| spdMean | band | 5.47 | 5.3-5.52 | 5.3-5.52 |  |
| nDef | slot | 6 | 6-7 | 6-7 |  |
| nBall | 2-5 | 4 | 4-5 | 4-5 | 100% |
| yL | 18-33 | 30.5 | 27-31 | 27-31 | 100% |

Human model (owner profile, 30 runs) median takes: 4 of 4 inside the band's model range 6-14 (owner target 8-15); distribution 7: 2, 8: 1, 9: 1
By template (median of the model medians): five 7 (1), sweeper 8 (3)
Flags and should-rule notes: J3 (should) 2, A7 (band) 1


Reading: every kept level is inside every must-range, which is how they were kept. Generated ordinary levels have a
median clock of 10 s, bot / clock 0.60, slack 3.9 s, one or two tight middle touches, the release 2.1 m onside with a
1.0 s run window, control 23 m out, caught 0.6 s after standing at 18 m, and 0.4 s of open corner. The owner model lands
inside its 3-7 band for all 152, clustered at 5-7, the upper half. The bot always shoots from 13.4-13.5 m (the first spot
it tries), nearer than the owner's 15-21 m. 49 levels miss A7's band ratio (0.58-0.72), all on the easy side: the bots
play their first passes at once, as in set D.

### Generated against hand-built, on the same measures

| Measure | Generated ordinary (152): median (10-90%) | Hand-built live fixtures 9-20 | Set D (5, rated fun 4-5) |
|---|---|---|---|
| Bot / clock | 0.60 (0.53-0.64) | 0.44-0.57 | 0.52-0.56 |
| J1 tight middle touches | 1 (1-3) | 0-4 (0 on 9, 11, 12) | 1-2 |
| J2 tight windows | 2 (1-4) | 0-5 | 1-5 |
| J3 release onside by | 2.1 m (1.1-3.1) | -0.3 to 16.9 m | 0.5-2.6 m |
| J4a control from goal | 23 m (19-29) | 14-28 m | 19-27 m |
| J4b lost after standing at 18 m | 0.62 s (0.32-0.93) | 0.1 s to never | 0.37-0.87 s |
| Lowest-round jitter | 95% (68-100) | 38-93% | 53-100% |
| Owner model median takes | 6 (4-7) | 2-11 | 4-7 |

Calibration: the generator's checks on the live hand-built fixtures 5-20 at their live clocks. This ran before J4b
became a should in fixtures 5-8 (A is off there), so J4b on 5-8 now counts only as a note.

| # | Fixture | Clock | Static (V, role test) | Dynamic (J1-J7, J10) | Final (A3, A5, A6, clock) |
|---|---|---|---|---|---|
| 5 | Switch of play | 12 s | R1 line, 3.2 | J1, J5, J4b | A6 |
| 6 | The lay-off | 14 s | R1 screen | J1, J3, J4a, J2 | A6 |
| 7 | The cut-back | 10 s | V6, R1 line, R1 hunter, 5.2 | J1, J4a, J4b, J2 | A6 |
| 8 | The overlap | 16 s | R1 screen | J3, J4a, J4b | 3.1, A6 |
| 9 | Diagonal in behind | 12 s | R1 line, R1/R5 screen | J1 | A3 |
| 10 | Third-man run | 12 s | pass | J4b, J6 | pass |
| 11 | The counter | 14 s | pass | J1, J3, J4b, J2 | pass |
| 12 | Push them back | 10 s | R1/R5 screen, R1 keeper | J1, J3, J4b, J6 | A5, A6 |
| 13 | Beat the trap | 15 s | V3, R1 line | J3 | 3.1 |
| 14 | Clear the channel | 12 s | V5, V8, R1 line, R1 marker, R1 screen | J3 | A6 |
| 15 | Play through the press | 12 s | pass | pass | A6 |
| 16 | Sweeper-keeper | 15 s | R1 screen, R1 keeper | pass | 3.1, A6 |
| 17 | Far post | 14 s | V5, R1 line, R1 screen, R2, 3.2, R1 marker | J3, J4a, J4b | A6 |
| 18 | False nine | 12 s | R1 line, R1 screen, R1/R5 screen, 5.2 | J2 | A6 |
| 19 | Five-man move | 15 s | pass | pass | 3.1 |
| 20 | Last-minute winner | 9 s | V3, R1 line, R1 marker | J3, J2 | A5, A6 |

The rulebook is stricter than the levels it was written from: line heights, screens 17-22 m in front of the line, double
decoys and clocks of 15-16 s were all ruled out afterwards. A generated level is held to all of it.

### The campaign (`node tools/gen/cli.js --seed 2026 --count 9`)

Fixtures 1-4: First pass, Through ball, Down the wing, The decoy, each in 1-2 attempts, with A, B and the hand-over off,
clocks 11-14 s and owner model 1-2 takes. Fixtures 5-8 (B only): Third-man run, Beat the trap, Bend the run, Third-man
run. Fixture 9 (A+B): Switch of play. Sides alternate left, right, left, right and the finisher changes every level.
Fixture 9 needed 28 attempts and was accepted after the variety rules relaxed at attempt 20. A first run of the same
command left fixture 6 empty after 40 attempts, which is why three things changed: the campaign now relaxes variety step
by step, J4b is a should in fixtures 5-8, and the switch's second hunter has moved. One later fix (templates whose
whole line-height range lies in the band to avoid are skipped) came after this run, which had two high lines running
(fixtures 6 and 7).

### Looking at them

Start positions of ten ordinary levels (seed 11) are `/home/claude/shots/gen-01.png` to `gen-10.png`. The baseline
favourites for comparison are `/home/claude/shots/base-09.png` (Beat the trap) and `base-15.png` (Five-man move). My
judgement is that they look like football and like the hand-built ones: a back line at a believable height and spacing,
shifted to the ball, a hunter goal-side of the first passer, a screen in a passing lane, markers goal-side.

What I fixed after looking:
- Third-man run came up three times in ten. The generator now sticks with the template it drew for four attempts, so
  the mix follows the weights.
- Commit the centre-half's screen stood beside the 10 like a second marker. He now stands nearer the passer.
- Mirrored levels kept "Left-back" and "Left winger" on the right. Names and numbers now mirror.

What I did not fix: Third-man run and False nine have four or five defenders, the rulebook's own shapes, and they look
sparse. Two levels from one template also look alike.

## Known weaknesses

1. **Uneven acceptance.** Diagonal in behind (0%) and Switch of play, Up back and through and Wing and cut-back (1-3%)
   rarely pass. The diagonal is a needle on this engine (aim windows of 0-4 degrees, J1 fails 79%); the live fixture 9
   fails J1 and A3 too. The cut-back had to be redesigned: the engine's back line shifts across with any ball down the
   wing, so a ball down the line from deep never beats the full-back. Generated cut-backs go into the channel inside the
   full-back instead, and the human model then finds them hard (10-20 takes). These templates appear rarely in what the
   generator makes.
2. **Variation, not invention.** Each template is a known level made relative to the back line. The generator varies
   heights, spacing, distances, speeds, side and clock: unlimited levels, but only fifteen ideas.
3. **The clock is fitted to the human model**, which is a band only and noisy at 30 runs (about 1.5 takes either way).
   Set E will show how well that fit lands for him.
4. **Bot finishes are short** (13.5 m). J10 holds, but the finish it measures is not the owner's.
5. **Rulebook conflicts I resolved:**
   - Diagonal's back four stands 8 m apart (T5's own numbers), against 9-11 m for centre-halves in 5.1.
   - J4b is a should in fixtures 5-8, where A is off.
   - Fixtures 1-8 carry `markLeash: 0` (5.3, and the live levels), though 3.1's table omits it.
   - A counter's two centre-halves may stand 9-11 m apart.
   - On a cut-back, J3-J5 are measured on the winger's release.
   - For J4b, being tackled before reaching 18 m counts as closed down.
   - J2 allows 1-5 tight windows in the ordinary band (standard and hard together) and 2-5 in the closing band.
   - The clock may take up to 1 s more slack than the band when the model needs it.
   - The speed dial works both ways.
6. **Rating builds show the tutorial prompts of moves 2-4** on whatever level is second, third or fourth (set D had
   them). Set E is built from a patched copy; the live game is unchanged and could take the same three-line fix.
7. **Speed:** about a minute per level, most of it the human model and the window scans.

## Files

- `tools/gen/templates.js`, `generate.js`, `route.js`, `check.js`, `campaign.js`, `cli.js`, `proof.js`, `lab.js`, `rng.js`.
- Proof output in `/home/claude/gen-vis/`: `proof-0.jsonl` and `proof-1.jsonl` (every level, route and measure),
  `proof-report.md`, calibration `calib.json`, campaign `camp.js`, `camp-scripts.js` and `camp.json`.
- Set E: 18-set-E-plan.md.

