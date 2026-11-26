# One-Man Team: retention review

Written 26 November 2026 by the retention and live-ops team (game economy, retention analysis, mobile product). It covers
how the current build keeps players coming back, where they will stop, and what is missing. The proposals are in the
companion document, `2026-11-26-retention-plan.md`. No game file was edited.

Read for this review: `one-man-team/js/game.js` (screens, stars, progression, save, practice, settings), `sim.js` (the
recording format), `js/levels/pars.js`, `practice.js` and `story.js`; `docs/foundation/06`, `07`, `09`, `12`, `15`, `17`,
`19`, `20` and `RULEBOOK.md`; `docs/reviews/2026-11-21-*`; `docs/marketing/launch-plan.md`, `monetisation-options.md`,
`positioning.md` and `play-store-listing.md`; `docs/STORY.md`; `app/README.md`, `app/src/bridge.ts` and
`app/src/storage.ts`; `privacy.html`.

## Summary

1. **The session loop is good and the build has nothing beyond it.** A level is a tight, fair retry loop with instant
   restarts, a clear reason on every failure and a one-tap "Next fixture". There is no daily loop and no weekly loop:
   nothing in the code changes from one day to the next, and nothing asks the player to come back.
2. **The stars no longer punish retries, which is right, but they are soft for a good player and invisible during play.**
   Graded under the current rule, the owner's first plays of the original 20 (set A) give 12 three-star clears, 7 two-star
   and 1 one-star. The targets are never shown while the move is being played.
3. **Three drop points stand out.** The first session (four drills and six screens of reading before the first fixture), the
   first fail streak at a hard or closing fixture (strictly linear unlock with no way past), and the end of the 60-level
   campaign (after which the only prompt is "Chase the stars").
4. **The generator changes what is possible.** Unlimited levels that pass the rulebook checks mean the end of the campaign
   need not be the end of the game, and a shared daily move needs no server: the same seed gives the same level, byte
   for byte. Generating takes about a minute a level on a two-core machine, so levels must be made ahead of time, not on
   the phone.
5. **Nothing is measured.** The privacy page says the game collects nothing, and it does not. The soft launch cannot
   read day-1, day-7, the level funnel or quit points without some measurement. The build already logs every attempt on
   the device, which is the raw material for a privacy-light version.

## 1. The game from a retention point of view

- **The core pleasure is solving a fair puzzle under time pressure, through retries.** The owner calls a fixture "my own
  fault" (fair 5) when it beat him repeatedly in the middle of the move and he could see why (07, section 4: the four
  fixtures where he failed most before the last player are four of his five fair-5 fixtures). He replayed levels 10-30
  times and called it addictive. Fun rises with challenge (+0.48 in set A); the levels he rated too easy drew fun 3.
- **Mastery comes fast, so content is used up fast.** Beat the trap took him 13, 6, 3, 2, 1 and 2 takes over six plays
  (20, part 2, section 3). Replays in set B were far quicker than first plays (13 takes to 6, 6 to 1). He beat level 60 in
  about two attempts. A level is fun roughly once or twice; after that it is a speed run or it is done.
- **Sessions are made of very short units.** A move lasts 4-13 seconds; a failed take ends sooner. That suits "one more
  go" and short sessions, and it means a player can get through a lot of content in an evening.
- **The audience is football-literate and has a known grievance:** energy and paid retries in the nearest big
  competitor (monetisation-options.md, positioning.md). Anything that meters retries would cut against the game's one
  clear selling point.

## 2. The current loop

### Inside a session

| Step | What happens | Where in `game.js` |
|---|---|---|
| First launch | Programme cover, "Kick off", then four no-fail practice drills (Shoot, Run and shoot, Pass, The rewind), each with a brief page; skippable | `showCover`, `startPractice` |
| Home | Season path of ticket stubs; one primary button that always goes to the next unwon fixture; stars per season and in total ("of 180") | `showHome` |
| Brief | A page per fixture: competition, opponent and score, the move's name, one paragraph, and the order you play the players in | `showBrief` |
| Play | One player at a time; coach prompts on fixtures 1-4; shooting help on fixtures 1-4 that fades out (`HELP = [1, 1, 0.6, 0.3]`) | `beginRound`, `assist` |
| Fail | A sheet with what happened and what to try, "Try again" and "Redo the N"; on the eighth failure of a move, an offer to turn on slow aim (at most three times ever) | `showFail` |
| Goal | "GOAL!" stamp, then a sheet with stars, move time, takes, the next-star target, and the action replay looping behind it; primary button "Next fixture" | `showGoal` |
| Season end | End-of-season report: stars, fixtures won, retries, a table of the season | `showSeason` |

This is a well-built session loop. Retries are instant, the reason for a failure is always given, the player can step
back one player rather than restart, and the next fixture is always one tap away. The goal sheet's "next-star" line
("A move of 6.1 s or quicker earns the third star. Take as many goes as you like.") is the one built-in replay prompt.

### Across days

Nothing. The build has no date logic anywhere: no daily content, no rotating challenge, no notifications (the app shell
has no notification module; `bridge.ts` handles save, haptics, outside links, the back button and logs). A player comes
back tomorrow only to continue the campaign.

### Across weeks

Nothing. The eight seasons give chapter breaks inside the campaign, not a calendar.

### The save

`save.done` holds one record per level, keyed by the level's **name** (`lid = i => LEVELS[i].name`): stars, best time,
the take count of the best run, and whether slow aim was on. The record is replaced only by more stars, or the same
stars in a quicker time. Settings, practice and slow-aim flags sit alongside. Every attempt is also appended to
`save.log` (level, player, outcome, seconds; up to 1,500 entries), in every build, not only the tester build; it is shown
only in tester mode. In the app shell the whole save is posted to native storage on every change (`persist`), and Android
backup is on (`app.json`, `allowBackup: true`), so progress should survive a phone change through Google's backup; that
has not been tested.

## 3. What the stars and progression reward now

### The rule

- One star for scoring, a second for a move at or under par (the bot's time x 1.5), a third at or under the gaffer's
  time (bot x 1.2). Bot times are in `js/levels/pars.js`, generated by `tools/make-pars.js`, one per level position.
- Takes are shown as a neutral count and never cost a star. The How to play page says so in as many words.
- Slow aim caps the grade at two stars.
- Saves graded under the old retry rule are re-graded from their stored times at every launch.

The owner's complaint ("we want you to keep retrying but it punishes retries") has been dealt with. That is the most
important retention fix made so far and it should not be undone.

### What it rewards in practice

Graded under the current rule, the owner's first plays of the original 20 (set A times against the bot times in
`pars.js`; the build and the clocks have changed since, so read it as indicative):

| Grade | Fixtures |
|---|---|
| Three stars | 2, 4, 5, 10, 11, 14, 15, 16, 17, 18, 19, 20 (12) |
| Two stars | 1, 3, 6, 7, 9, 12, 13 (7) |
| One star | 8 (1) |

He beat the bot's own time on seven of the twenty at first attempt. So for a capable player the third star usually comes
with the first clear, and there is little left to chase on replay. For a newer player the time stars are a genuine
replay goal, which is what they should be.

What the stars reward is **speed of the finished move, and nothing else**. They do not see:
- a clean run (every player right first time), which is what a player who has learned the level can still improve on;
- the quality of the finish (a first-time shot, a strike from outside the box), the moments players brag about;
- anything once all three stars are in.

### Where the stars are hard to use

- **Par is invisible while playing.** The clock bar counts down to the limit and marks where earlier passes were played;
  par and the gaffer's time are only shown on the goal sheet after the move. A player chasing a star cannot see the
  target while chasing it.
- **The season report still counts "Retries".** It is the only place the old framing survives, and it is the last thing
  a player reads at the end of a season.
- **Slow aim caps at two stars.** That is defensible (it makes the move easier), but the slow-aim offer appears to a
  struggling player at exactly the moment a third star means least, so in practice it is harmless.

### Progression

- Strictly linear: a fixture opens only when the previous one has been won (`unlocked`). A tap on a locked ticket shakes
  it and names the fixture to win first. There is no skip and no alternative route.
- 60 fixtures in eight seasons (the season names in `game.js` are placeholders until levels carry their own); the
  story campaign is being rebuilt by another team.
- After the last fixture, the home button becomes "Chase the stars" (the first fixture short of three) and then
  "Play it again".

## 4. Where players will drop

None of this is measured; these are predictions from the code, the owner's data and the earlier reviews. Each comes with
what would confirm it.

### 4.1 The first session

- **Reading load before the first real fixture.** A new player sees the cover, four drill brief pages, a "Practice
  complete" sheet and the fixture-1 brief page (with its order list) before playing a fixture: six screens of reading,
  against an owner who dislikes text on screen. The first-time-experience review asked for the brief page before fixture 1 to be cut; it is still there.
- **The first unexplained failure.** The same review found that the first unexplained failure was a shot saved after
  doing what the coach said. Shooting help now eases early shots towards the open corner on fixtures 1-4, which should
  remove it; that has not been checked with a stranger.
- **The bar for a stranger is unknown.** Every difficulty number we have comes from one football-literate player who
  invented the game. The review's rule of thumb ("two or three unexplained failures end a free game's first session")
  is experience, not data.

Confirm with: share of installs that finish the drills, start fixture 1, clear fixture 1; time to first goal; first
session length; where first sessions end (which screen, which level, after a fail sheet or a goal sheet).

### 4.2 The first fail streak

- **Difficulty is set for the owner.** The generator's bands are written in his takes on a first play: standard 3-6,
  hard 5-8, closing 8-15 (17-generator.md; rulebook 9). One closing fixture ends each season. His hardest generated level
  took 29 takes. A stranger will need more, by a factor nobody has measured.
- **There is no way past a wall.** Unlock is strictly linear. A player stuck on a closing fixture can replay old fixtures
  or leave. Nothing else is open to them.
- **The help offered is the one he dislikes.** On the eighth failure of a move the game offers slow aim, at most three
  times ever, and it caps the grade at two stars. The owner finds slow motion makes it feel too easy. The dial he does
  like, the clock (he asked for it to be extended, and in set B two extra seconds halved his takes on fixture 9 while fun
  stayed the same), is not offered.
- **What protects the player** is the fail sheet: a plain reason, a concrete "Try", and "Redo the N" when an earlier
  player was the problem. That is why the owner's long streaks felt fair.

Confirm with: takes per fixture (median and 90th percentile); the share of players who leave the game for the day within
five takes of their last failure; which fixtures lose more than 15% of the people who start them (the launch plan's
threshold).

### 4.3 The middle of the campaign

- Generated levels from one template look alike (17-generator.md, "two levels from one template look alike"), and the mix
  leans on six templates. The owner names one shape he dislikes: double decoys, "the easiest to create space".
- The owner's fun is flat across the set (fun does not rise or fall with fixture number, +0.08), so there is no sign of
  fatigue in his data. He is not a typical player.

Confirm with: completions per session by fixture number, and session gaps lengthening as the campaign goes on.

### 4.4 The end of the campaign

- The 20-level build was estimated at "roughly an hour or two of play" (playtest brief). Sixty levels is therefore a few
  evenings for an engaged player: our estimate, not measured.
- After fixture 60 the only prompts are "Chase the stars" and "Play it again". For a capable player most stars are
  already in (section 3). The owner beat level 60 in about two attempts and said the last levels felt very easy.
- So the most engaged players, the ones who would give day-30 retention and reviews, are the ones who run out first.

Confirm with: share of players who reach fixture 60, days from install to fixture 60, and their activity in the
following week.

### 4.5 Across all of them

No reason to open the game on a day the player was not already planning to. No measurement to see any of the above.

## 5. What is missing

| Missing | Why it matters here |
|---|---|
| Anything that changes by day or week | The only pull to return is campaign progress, which ends |
| A use for the generator in the shipped game | The one asset that could supply endless fresh, fair moves is only in `tools/` |
| A way past a wall | A strictly linear campaign with closing fixtures set to the owner's 8-15 takes |
| A help option the owner likes | Extra clock time is his preferred dial and the cleanest one the data shows |
| Visible targets during play | Par and the gaffer's time appear only after the move |
| Rewards for style and clean play | Stars see only time; a player who has learned a level has nothing to improve except time |
| Anything to show other people | The action replay is the game's best asset; it cannot be shared (the launch plan asks for a share button) |
| Measurement | No events, no day-1, no funnel; the privacy page will need updating when this changes |
| A stable level key | Saves are keyed by level name. The campaign is being rebuilt now: any name that changes after launch would wipe that level's stars and best time for every player, and a re-graded old time could be judged against a different level's par |

## 6. How much weight this evidence bears

- The owner is one football-literate player who invented the game. His data shows what the loop can do for a motivated
  player, not what a stranger will do.
- Every "drop point" above is a prediction. The plan's first proposal is the measurement that tests them.
- Comparisons with other games (Score! Hero, Two Dots, Golf Clash, Does Not Commute, Wordle-style dailies) are from our
  team's working knowledge, except where the marketing documents give a source. None was re-checked today.
