# Foundations 02: the rules the first 20 were built on

Inferred from the measurements in 01, the level files, `tools/LEVEL_DESIGN.md`, `tools/AI_NOTES.md` and `sim.js` in the
baseline checkout. "Measured" means I ran the engine; "stated" means a document says it; "inferred" is my reading.

## (a) Stated rules the 20 follow

| Rule in LEVEL_DESIGN.md | What the 20 do (measured) |
|---|---|
| Every level is beaten and the replay scores | All 20 beaten by their bot scripts |
| Bot move time at most 80% of the clock | Highest is 74% (20). Pack 1 uses 35-55% |
| Start positions inside x 3-47, y 4-57 | All 20 |
| Attackers at least 3 m apart at the start | Closest pair 4.7 m (14) |
| No defender within 4 m of the ball at kick-off | Closest 6.0 m (13); pack 1 never closer than 18.9 m |
| Nobody starts offside | None does |
| Brief under 110 characters, tips under 120 | Longest brief 101 (17), longest tip 93 (13) |
| One clear football idea per level, all different | Yes: 20 different named moves |
| Cut-backs go to the penalty spot, not the six-yard line | 3, 7, 8 and 17: the ball is controlled 12.5-13.9 m out |
| A tightly marked receiver plays first time | Marked ball players in the middle of a move release first time in 6, 8, 10, 13, 16, 18, 19 and 20; the exceptions are the wingers in 3 and 17, who carry down the line |
| Pressure decides the line | Hunters are placed on the early passers (5, 7, 9, 11, 13, 15, 19, 20), but on the bot's route a passer has a defender within 3 m at the kick for only 3 of 42 passes (8, 14, 16): the solution is to release before the hunter arrives |
| Gentle markers 4.6-5.0, hard 5.3-5.6 | Pack 1 markers 4.6-5.2; packs 2-3 markers 5.2-5.7 |

## (b) Stated rules they break or bend

| Rule | Where it is broken (measured) |
|---|---|
| Clock about 1.5 times the bot's time, rounded up | Only 11 of 20 match. Pack 1 is 1.8-2.9 times (by design). 15 and 20 are a second shorter than the rule (10 v 11, 7 v 8); 5, 11 and 12 a second longer |
| Speeds: hard is 5.3-5.6 | 18 and 20 have 5.7 back lines; 20 has a 5.7 marker with `react: 10` |
| A through ball has to be hit within 18 m of the line (power 1), 14 m (0.8) | Broken in 14 (16 m at 0.8), 18 (21 m at 0.95), 20 (21 m at 0.95), 4 (21 m at 0.95). In each a decoy has removed the centre-half, so the rule's premise is gone, not ignored |
| Design the last touch inside 12 m | The bot shoots from 12.5-14.8 m in 3, 7, 8, 12 and 17: all first-time finishes from a cut-back or a pass |
| Decoys have a job | In 4 (the decoy tutorial) and 12 the bot's route still scores with the decoy standing still |
| Pack 1 has a slower keeper (`react` 22, 18, 16) | It changes nothing at the finish: at 10 m the ball passes the keeper before even a 9-tick reaction ends (see (d)) |
| Acceptance 7: the lazy alternative should not be easier | Not measured here |
| Jitter at or above the pack's threshold | No thresholds are written down. Lowest rounds: 45% (16), 53% (19), 55% (15) |

## (c) Unstated regularities

**Shape of every move (measured, all 20 unless named)**

- Starts deep: the first ball player is 44-55 m from goal (7 starts at 33 m). The ball travels 46-86 m.
- Ends with a shot from 9.5-14.8 m, median 10.5 m, with the keeper 2.7-5 m off his line.
- The finisher gets the ball either far out and runs it in (1, 2, 5, 6, 9, 10, 13: control 24-38 m out, carry
  14-27 m), or first time from a ball into or across the box (3, 7, 8, 12, 17: 12.5-14.8 m), or in between (the rest:
  control 14-22 m out, carry 5-12 m).
- The finisher is almost never marked (only 14 and 20 put a `mark` on him).
- From fixture 5 on there is always a back line (`line` unit) and always a screen or a hunter on the first pass.
- From fixture 8 on every move has a pass that passes within 3 m of a defender (lane 0.9-2.9 m).
- 11 of 20 have a live offside decision on the last pass (receiver ahead of the ball, under 5 m onside).
- Clocks: 7-14 s, never more than 2.9 times the bot's time; from 5 on the bot uses 56-74% of it.

**How difficulty ramps (measured, by fixture number)**

| Fixtures | Ball players | Defenders | Speed mean | Tightest lane m | Tight knobs before the finish | Lowest jitter round % |
|---|---|---|---|---|---|---|
| 1-4 | 2-3 | 1-2 | 4.0-5.0 | 4.1-9.6 | 0-1 | 95-100 |
| 5-12 | 3-4 | 4-6 | 5.0-5.35 | 1.1-5.8 | 0-3 | 68-98 |
| 13-20 | 3-5 | 6-7 | 5.2-5.6 | 0.9-1.8 | 1-6 | 45-95 |

"Tight knobs" counts, before the finish, every pass aim window under 15 degrees, power window under 25% of the bar and run
timing window under 1 s (whole move must still score).

What ramps is the middle of the move: more players, more and faster defenders, narrower lanes, more tight knobs. What
does not ramp is the finish: the shot distance, keeper position and open goal are the same in fixture 19 as in fixture 1.

**What the owner's play adds (06)**: his takes rise with fixture number (rank correlation +0.76). His five fair-5
fixtures (9, 13, 14, 19, 20) are where he failed most in the middle of the move (median 5 failures before the last
player, against 0 elsewhere). See 07.

## (d) Engine rules the levels lean on, as football rules

All from `sim.js` constants and code (stated), checked against measurements where marked.

**Pitch.** 50 m wide, the last 60 m shown. Goal 8 m (x 21-29). Penalty area 34 m by 16.5 m. 60 ticks a second.

**Running.** An attacker runs 7.6 m/s, 6.5 with the ball, and 60% of that while aiming (3.9 m/s with the ball). A defender
runs at his `spd`, 4.0-5.7 in these levels, never above 5.8. Attackers reach full speed in about 0.2 s, defenders in
about 0.35 s. So no defender ever catches a forward who is running away from him: every chase in these levels is lost
by the defender, and pressure has to come from someone already goal-side.

**Passing.** A pass leaves the boot at 9-28 m/s and rolls about speed / 0.8 metres (11 m at zero power, 35 m at full),
crawling over its last third. Only the next ball player in the order can collect it, within 1.35 m.

**A pass is accepted after 0.9 s.** The passer's round is won 54 ticks after he kicks if nothing has gone wrong by then.
What happens after that is played out in the next round. Measured consequence: under the chain test most narrow pass
windows break one or two rounds later (01, Table 8), and the owner's own codes show the same (P2 out in 8, 13 and 17 is
the pass before rolling out during the next round).

**Future players stand still.** Anyone not yet played stands on his start spot. His marker stands with him, screens block
the lane to him and the keeper assumes he would run. Nobody presses a ball held by a player not yet played. Offside is
only checked for a receiver who has already been played, so an offside run shows up in the receiver's own round.

**Offside.** Checked when the pass is hit: the next receiver is off if he is more than 0.6 m beyond both the ball and the
second-last opponent (keeper included). Decoys are never offside.

**First-touch shield.** For 20 ticks after controlling a pass the ball cannot be won; a plant may start 14 ticks after
the touch, so the earliest a receiver can lose it is about 0.47 s.

**The tackle (lunge) and its tell.** A defender on his feet who has had the ball within his lunge range (1.5 m + 0.6 x
`agg`, so 1.8 m by default) for his patience (24 x (1 - `agg`) ticks, 0.2 s by default), or at once if the carrier runs
the ball straight at him, plants for 12 ticks (0.2 s). On the 4th tick of the plant he fixes where the ball will be;
then the leg goes out for 7 ticks, reaching 1.3 m plus a 0.55 m foot. Stand still or run straight and he wins it. Change
direction after his 4th tick and he misses and lies on the floor for 34 ticks (0.57 s). A ball dribbled into a set
defender within 0.5 m is lost without a lunge. If the ball is passed during the plant he stands down.

**Interceptions.** `zone`, `press` and `line` players read a pass 12 ticks after it is hit and go only if they can stand on
its path in time (at 90% pace, within their `eng`); at most two go. Any of them within 0.85 m of a loose ball wins it,
a marker within 0.7 m. Markers never leave their man for a loose ball. A shot is a loose ball too: a defender in its path
blocks it.

**The back line.** One height for the unit. It keeps 13 m off a free ball, back-pedalling at 85% of its slowest man, down
to y 15 (`floor`). If any defender is within 3 m of the carrier it holds and squeezes back up (the offside trap). It
steps up to 3 m when the ball goes backwards faster than 2 m/s. It shifts 0.4 m across for every metre the ball is off
centre (at most 8 m). The man whose slot the carrier comes within 8 m of steps out; his neighbours tuck in. Once the ball
is in behind, everyone turns and runs for a line 3 m goal-side of the ball.

**Pressing and marking.** One first defender goes to the carrier, slows inside 3 m and jockeys 1.4 m goal-side; one zone
player covers 5 m goal-side. A marker stands goal-side and ball-side, 1.3 m off when the ball is within 6 m and up to
3 m when it is 24 m away, and sees his man 0.3 s late (`react` 18). A screen stands on the lane to the attacker nearest
the goal and steps fully onto it when the carrier slows to aim.

**The keeper.** He stands on the ball-goal line 1.2-3 m off his line. If the carrier is inside 18 m with no defender within
3.5 m goal-side of him, the keeper comes out to 0.45 times the carrier's distance (at most 5 m, 7 m for a sweeper) and
stands his ground; he smothers a ball dribbled within 2.6 m. He sets when the carrier slows to aim. Against a shot he
waits 13 ticks (18 if he was moving; `gk.react` sets it per level), then dives at 4.7 m/s; he saves anything within
0.8 m of him, 1.2 m at full stretch. He claims a pass he will reach 0.15 s before any attacker, inside the six-yard area
(the whole box for a sweeper).

**What this means at the finish (measured).** A full-power shot (34 m/s, losing pace slowly) from 10 m reaches a keeper
standing 4.5-5 m out in about 10 ticks, before his 13-tick reaction ends. So at the baseline's usual finishing distance the
keeper is a statue: he stops only what passes within 0.8 m of where he stands. That shadow covers about 3.2 m of the
goal line, leaving 4.8 m open in two corners of about 2.4 m. Changing `gk.react` from 9 to 22 ticks left the open goal
on the bot's route unchanged in 13, 10 and 4 (it changed in 18 by 0.5 m); only an instant keeper (1 tick) made the
bot's shots fail. The `sweeper` flag took 0-0.7 m off. Pressure at the finish can only come from defenders, from the
keeper's starting depth and narrowing (engine constants), or from making the finisher shoot from further out.
