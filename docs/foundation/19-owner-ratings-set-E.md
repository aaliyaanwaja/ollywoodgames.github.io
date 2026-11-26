# Owner ratings, set E (generated against hand-built), Thu 26 Nov 2026

His note: "The only time it didn't feel like real football was when the ball trickled towards the keeper and the keeper
didn't come out to collect it."

| Test | Level | Challenge | Fun | Fair | Corner time | Real football | Takes | Shot | Failures | Model (owner) |
|---|---|---|---|---|---|---|---|---|---|---|
| 01 | gen Beat the trap | 3 | 4 | 5 | 3 | 4 | 2 | 17.0 m | P4 tackled 1 | 7-8 |
| 02 | gen Five-man move, closing | 4 | 5 | 5 | 3 | 4 | 9 | 8.7 m | P5 time 6, offside 1, saved 1 | 9 |
| 03 | gen Play through the press | 3 | 4 | 5 | 3 | 4 | 4 | 16.4 m | P3 intercepted 1, P4 wide 1, saved 1 | 2.5-3 |
| 04 | HAND Five-man move (19) | 3 | 5 | 5 | 3 | 4 | 7 | 18.6 m | P4 intercepted 2, P5 keeper 2, offside 1, saved 1 | 8-8.5 |
| 05 | gen False nine | 3 | 4 | 5 | 4 | 4 | 1 | 12.0 m | | 5.5-6 |
| 06 | gen Third-man run | 3 | 3 | 5 | 4 | 2 | 6 | 6.6 m | P2 intercepted 1, P3 intercepted 2, tackled 1, P4 intercepted 1 | 4 |
| 07 | gen Bend the run | 4 | 4 | 5 | 2 | 4 | 15 | 13.8 m | P3 intercepted 1, P4 tackled 3, keeper 6, saved 4 | 5.5-7 |
| 08 | gen Ball inside the full-back | 4 | 5 | 5 | 2 | 5 | 29 | 15.8 m | P3 intercepted 7, P4 intercepted 3, tackled 5, wide 9, saved 4 | 6-7 |
| 09 | HAND Beat the trap (13) | 3 | 4 | 5 | 3 | 3 | 2 | 20.1 m | P4 wide 1 | 7-9 |
| 10 | gen Short then long | 3 | 4 | 5 | 3 | 4 | 3 | 12.2 m | P3 intercepted 1, P4 intercepted 1 | 4-5 |

## Reading
- Generated levels hold up against hand-built: generated mean fun 4.1 and real football 3.9; the two hand-built controls
  4.5 and 3.5 (both replays). The best-rated level of the set was generated: Ball inside the full-back, fun 5, real
  football 5, 29 takes, fair 5.
- 7 of 8 generated levels pass the human check (fun 4+, fair 4+, real football 4+). The failure is generated Third-man run
  (fun 3, real football 2): four defenders, the sparsest defence in the set, flagged in advance by the generator team.
- Difficulty: the model was wrong in both directions. False nine cleared in 1 take (model 5.5-6); Ball inside the
  full-back took 29 (model 6-7, ordinary band). The model still cannot be trusted alone on difficulty.
- Keeper: he does not come off his line to collect a slow ball rolling at him. Real keepers do. To fix in the engine.
