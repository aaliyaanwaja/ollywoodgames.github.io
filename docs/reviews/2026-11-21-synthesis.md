# Playtest 1: synthesis and recommendation (21 Nov 2026)

Three independent reviews (game design, first-time experience, product) of the owner's feedback. Their memos are alongside
this file. This page reconciles them.

## Where all three agree
- **Stars must stop charging for retries.** Grade the finished move, not the road to it: one star for scoring, two more for
  beating par times. Show retries as a neutral count.
- **The opening is too hard, but removing defenders is not the fix.** A perturbed bot already clears moves 1-4 at 95-100%.
  The load is in the hands and head: about fourteen new things inside a four-second move. Teach them one at a time with
  no way to fail, then start the fixtures.
- **Build no new mechanics before strangers have played it.** The inventor retrying 20+ times shows the retry loop has
  pull. It says nothing about a stranger, who usually leaves after two or three failures he does not understand.
- **Park the full pitch.** Figures halve in size or the camera must move, a retry of the sixth player means watching
  twelve seconds first, and failures cascade. Smallest version worth testing later: two half-pitch phases with a
  checkpoint at halfway.
- **Random order: no. "Run first, then pass to him": yes, as one later experiment.** Retrying only works if each attempt
  teaches you about the next, so the order must be fixed per level.

## Where they disagree
| Question | Game design | First-time experience | Product | Call |
| --- | --- | --- | --- | --- |
| Clock | Demote to a par; loose cap of 2.5x the bot's time | Hide it on moves 1-2 | Add about 20% | Par plus loose cap. A small extension will not change how it feels, and once stars reward time the pressure is optional. |
| Slow motion while aiming | Test a budgeted version | Against: timing is the game | Not raised | Build behind a hidden switch and let the hallway test decide. |
| Opening | Not their lane | Four drills, then moves 1-2 without clock or stars | One or two practice moves | Four drills. |

## One finding nobody asked about
The first unexplained failure in move 1 is the shot, not the pass. From where the ball is collected a shot straight at
goal is saved, and the coach says "drag at the goal". A first-timer does as told and is told "Saved". Fix: prompt
"carry it closer" and "aim at a corner", and nudge early shots towards the open corner.

## Proposed build, in order
1. Four no-fail drills before move 1: shoot; run and shoot; pass onto a marked patch; the rewind. Skippable, replayable.
2. Stars: score, par (bot time x 1.3), gaffer's time (bot time x 1.1). Retries shown as "takes", never penalised.
3. Clock: hidden on moves 1-2; elsewhere a loose cap with par marked on the bar; tight limits only where time is the theme.
4. Shooting help on moves 1-2: coach says carry closer and pick a corner; gentle aim nudge that fades out by move 5.
5. Soften move 5 and 6 (three defenders, then four).
6. An on-device results log (attempts per player, fail reasons, times) the tester can choose to share. No identifiers.
7. Hidden switch for slow motion while aiming, for the test only.

Then a five-person hallway test (script in the first-time-experience memo). Targets: everyone finishes the drills inside
two minutes; four in five clear moves 1-2 within two attempts; nobody needs more than ten attempts on moves 5-6.

## Later experiments, one at a time
- Run first, then pass to him: one bonus level, with the player taking over the runner as he receives.
- Two-phase move with a checkpoint at halfway.
