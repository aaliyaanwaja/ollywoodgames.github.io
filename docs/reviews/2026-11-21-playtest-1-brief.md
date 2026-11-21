# Playtest 1: owner feedback and facts (21 Nov 2026)

## The game in one paragraph
One-Man Team is a portrait mobile football game (Google Play first, solo developer). Each level is one attacking move.
You play it one player at a time: first the passer, then time rewinds and you are the team-mate running onto your own pass
while the first player replays his recording, and so on, until the last player scores. Defenders are not recorded; they react
live, so a new run can open space or wreck a pass you already recorded. Two thumbs: left drags to run, right presses a
button and drags to aim and set power, release kicks. 20 levels in three "seasons" (4 / 8 / 8). References: Does Not Commute
(mechanic) and Score Hero (career of match moments).

## What the owner said after playing the current build (verbatim)
"The first few rounds are still very tough. We either need a separate tutorial where the user can learn to play without the
challenge or make it much easier. The game continues to be very challenging but it is really fun and very addictive. I
replayed levels over 20 times to get it right. The star system is probably wrong for this because we want you to keep
retrying but it punishes retries. The time limit is a bit frustrating. I would extend it a bit. Not by a lot. Two ideas we
could test out is playing with more players and across both halves of the field, building up from our own goals to the
opposition goal. Secondly, making the order of player control a bit more random. For example, making the run before
playing the pass to him, if that makes sense. Don't take any of my comments as biblical. Analyze them closely and review
with a world class product team."

Earlier feedback from the same owner, already acted on: aiming must be independent of running direction (done: aim stick);
level 1 was too hard with five defenders (now one or two defenders in levels 1-4, slower keeper, coach prompts through
levels 1-4); screens had too much information (cut back); shots were too soft and the keeper too big (fixed).

## Facts about the current build
- The owner is the only human who has played it. He designed the concept, so he is a motivated, football-literate player.
  He still needed 20+ retries on levels.
- Stars today: 3 for two retries or fewer, 2 for six or fewer, otherwise 1. Best time is stored but not rewarded.
- Clock: each level has a limit for the whole move, 7-14 seconds. A scripted bot finishes every level in 35-76% of its
  limit (opening four: 35-56%). The clock starts when the player first moves or presses the kick button. All players in a
  move share one timeline, so a later player often has to wait for an earlier pass before he can do anything.
- Fail states: tackled (defender plants for 0.2 s then lunges), pass intercepted, saved, off target, out of play, offside
  (checked against your own recorded pass), collision with your earlier self, clock runs out. Any fail restarts the current
  player's round only; you can also step back and redo the previous player.
- Levels 1-4: 2, 2, 3, 3 players; 1, 2, 2, 2 defenders; limits 12-14 s. Level 5 jumps to five defenders. Levels 13-20 use
  4-5 players and up to 7 defenders.
- A "decoy" role already exists: a player whose round is only a run (no ball), played before the players who use the space.
- The pitch shown is one half (50 m x 60 m) fitted to a portrait phone; figures are about 20-24 px across on a 390 px
  screen. The camera is fixed per level.
- Engine: deterministic 60 Hz simulation; recordings are per-player positions plus one kick. The ball travels down a fixed
  chain of players in recorded order; only the next player in the chain can collect a pass. A recorded player does nothing
  after his recording ends.
- No analytics, no ads, no purchases yet. Around 20 levels is roughly an hour or two of play (estimate).
- Code and docs: /home/claude/ollywoodgames.github.io (one-man-team/js/sim.js engine, js/levels/, js/game.js interface,
  tools/LEVEL_DESIGN.md, tools/AI_NOTES.md, docs/ART_DIRECTION.md, docs/marketing/). `node tools/test.js --jitter` shows
  how forgiving each round is for a bot with perturbed timing and aim.
