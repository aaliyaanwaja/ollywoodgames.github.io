# Rating set C: football-true pressure on the finish

Built Mon 23 Nov 2026 from 10-finish-pressure.md, after the owner rejected the penalty-spot defender. Twelve blind tests:
baseline 10, 13, 19 and today's 60, each as now, with A, and with A+B, on the patched engine (`sets/setC-sim.patch`;
options off = identical to the live engine). Baseline 18 dropped: he now clears it in one take.

- A, through on goal: once the striker has no defender goal-side of him, recovering defenders sprint (own speed + 1.3,
  capped at 7.0 m/s) and the nearest back-line man inside 12 m of the ball goes to him within 24 m of goal.
  Engine: `{ recSpd: 7.0, dangerR: 24 }`.
- B, keeper covers his near post: he stands on the line that halves the angle, shaded 20% towards the near post.
  Engine: `{ gkBisect: 1, gkNear: 0.2 }`.

Fourth question on every rating: time to pick a corner, 1 none to 5 all day.

## Key
Test 01 = 19 as now; 02 = 13 A+B; 03 = 10 A+B; 04 = 60 as now; 05 = 19 A+B; 06 = 13 as now; 07 = 60 A+B; 08 = 19 A;
09 = 10 A; 10 = 60 A; 11 = 13 A; 12 = 10 as now.

## What would count as success
Time to pick a corner falls with A and A+B, fun and fair hold (fair 4-5), and failures shift towards the finish without the
middle-of-move failures rising. All of these fixtures are now well known to him, so compare versions with each other,
not with sets A and B.
