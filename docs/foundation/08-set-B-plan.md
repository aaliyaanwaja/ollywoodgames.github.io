# Rating set B: what it tests and what we predict

Built Mon 23 Nov 2026 from the forensics proposal in 07. Twelve fixtures with neutral names, in a fixed shuffled order,
so the owner cannot tell an original from a variant. Same rating build as set A (no help, no practice, no slow aim,
all unlocked), plus the distance of each scoring shot, logged automatically.

## The questions
1. Does a covering centre-half in the box (`{ t: 'zone', x: 25, y: 10, spd: 5.4, eng: 7, agg: 0.8, leash: 9 }`) make the
   finish better or only harder? Pairs: baseline 10, 13, 18, each with and without.
2. How much of the drop from 20+ takes to 15 is his learning? Baseline 19 and today's 60 again.
3. Did a short clock with a long pass make 9 and 20 hard? Each at its own clock and with 2 seconds more.

## Key and the human model's prediction (owner profile, 30 runs, median takes with quartiles)

| Test | Fixture | Model takes | Set A takes |
|---|---|---|---|
| 01 | baseline 13 | 6 (3-10) | 13 |
| 02 | baseline 10 + cover | 3 (1-6) | (3 without) |
| 03 | baseline 18 | 6.5 (5-12) | 6 |
| 04 | baseline 10 | 2.5 (1-8) | 3 |
| 05 | baseline 19 | 5 (2-7) | 15 |
| 06 | baseline 13 + cover | 10.5 (5-20) | (13 without) |
| 07 | baseline 18 + cover | 8 (5-16) | (6 without) |
| 08 | baseline 9 + 2 s | 4 (3-8) | (12 at 10 s) |
| 09 | baseline 20 | 3 (2-5) | 14 |
| 10 | baseline 9 | 5.5 (2-8) | 12 |
| 11 | today's 60 | 5 (3-7) | about 2 in his earlier play |
| 12 | baseline 20 + 2 s | 3.5 (2-6) | (14 at 7 s) |

Replayed fixtures (01, 03, 04, 05, 09, 10) are second plays, so lower takes than set A are expected from learning alone.
Read the cover question from fun and fair, and from shot distance, more than from takes.
