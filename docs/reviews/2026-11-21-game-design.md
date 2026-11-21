# Playtest 1: game design review (21 Nov 2026)

## Recommendations, ranked

1. **Stop charging stars for retries, now.** The owner is right. Grade the finished move, not the road to it.
2. **Demote the clock from a fail state to a par.** I disagree with "extend it a bit": 10-15% more time will not change how it feels.
3. **Test a budgeted slow-motion while the aim stick is held, levels 1-4 first.** Probably a better fix than more seconds, but it costs tension, so test before shipping.
4. **Prototype "run first, then pass to him" on one level.** Reject random order outright.
5. **Defer the full pitch.** The smallest version worth testing is a two-phase move with a checkpoint at halfway.

## 1. Stars

Verified in code: `starsFor` (game.js line 54) gives 3 stars for two retries or fewer, 2 for six, else 1; tapping Retry mid-round also counts. The designer himself needed 20+ retries, so nearly every first clear is one star and the result screen calls the game's core activity a mistake.

The artefact is the replay: one unbroken move. A good one is quick and ends cleanly. Players will brag about "five players, 6.1 seconds, first-time finish", not "two retries".

**One-day scheme.**
- Star 1: score.
- Star 2: move time at or under par = bot time x 1.30, rounded up to 0.1 s (level 1: bot 4.2 s, par 5.5 s).
- Star 3: at or under gaffer's time = bot time x 1.10 (level 1: 4.7 s).
- Retries cost nothing; show them as a neutral "Takes" count.
- Best time is already stored; the multipliers are guesses to tune.

**Richer scheme.** Three named objectives per level: score; beat par; one football challenge set per level (first-time finish, meaning a shot within 0.4 s of receiving; a marked corner; every pass one-touch). Add a shareable replay card.

Comparables. In Does Not Commute a rewind costs one second of clock (verified, Wikiwand). That suits an endurance run, not discrete levels. From my own knowledge, unverified: Score Hero awards stars for per-level objectives and charges retries in energy, a monetisation choice; Super Meat Boy grades on par time and ignores deaths. The latter fits best.

## 2. Clock

The limit caps recording length, stops dithering and adds urgency. Defenders already supply urgency (pressers, the lunge, the offside line), and the bot finishes in 35-76% of every limit (verified with the jitter test: 4.2 of 12 s on level 1, 5.2 of 7 s on level 20). So the clock rarely decides anything, yet it counts down while a later player waits for his own earlier pass. I think that is the frustration: pressure with nothing to do.

Change: hard cap = bot time x 2.5 on levels 1-12, show par on the bar instead of a countdown, and keep tight limits only where time is the theme (the counter, Last-minute winner).

Slow-motion: the simulation is tick-based, so stepping it at 0.35x while aiming keeps recordings valid. Rule to test: 0.35x for at most 1.2 s of real time per kick. The cost: aiming under pressure is a real skill, and unlimited slow-motion would make this a puzzle game, hence the budget. Score Hero freezes time while you draw (my knowledge); Does Not Commute never slows.

## 3. Order of control

- **A. Run first.** Round 1: you are the 9 without the ball; jog for two seconds, sprint in behind, press DONE. Round 2: you are the 8; watch the recorded run and weight the pass into his path at about 2.2 s. Round 3: you take over the 9 as he receives, and finish. Offside is judged when you release the pass, as in real football, and the target is visible. Engine cost: a recorded prefix followed by a live spell, which today's "does nothing after his recording ends" rule forbids.
- **B. Designer-set order.** Already possible through `order` and the decoy role. Variety only.
- **C. Random order per attempt.** Reject: retrying only works if each attempt teaches you about the next.

Prototype A on one level, in both orders, with the same defenders.

## 4. Full pitch

It adds the build-from-the-back fantasy. It breaks three things: figures shrink to about 10-12 px unless the camera scrolls; retrying the sixth player means watching 12+ seconds first; and failures cascade (the jitter test already shows final rounds at 45-70% forgiveness on levels 13-20). Smallest test: two half-pitch phases of three players with a camera cut; phase one locks when the ball is received past halfway and has its own defenders, so phase two cannot break it.

## What I would test

Five new players, levels 1-6, logging retries per round, fail reason and move time.
- Stars: do they replay a cleared level unprompted to beat par? Target: one level in three.
- Clock: "out of time" under 10% of fails; nobody raises the clock unasked.
- Slow-motion on and off: median retries on levels 1-4 at eight or fewer, and players still call it tense.
- Run first: fewer retries on receiver rounds than the standard order, without players calling it easy.

## Sources

- Wikiwand, "Does not Commute", wikiwand.com/en/articles/Does_not_Commute.
- Repository code, tools/LEVEL_DESIGN.md and the jitter test output.
- Score Hero and Super Meat Boy details are from my own knowledge; I could not fetch pages to check them.
