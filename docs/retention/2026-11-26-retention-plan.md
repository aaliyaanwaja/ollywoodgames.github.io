# One-Man Team: retention plan

Written 26 November 2026 by the retention and live-ops team. It follows `2026-11-26-retention-review.md`, which sets out
the current loop and where players will drop. This document ranks what to build, says what ships at launch and what
waits, and gives a privacy-light way to measure it. Mock screens are in `docs/retention/mockups/`. No game file was
edited.

## The recommendation

**At launch (the soft-launch build):**
1. Privacy-light measurement: one anonymous ping a day and one summary a session, no identifiers, with an off switch.
2. A safety net for fail streaks: offer two extra seconds on the clock, and later "Move on" to the next fixture.
3. Targets you can see: par, the gaffer's time and your best marked on the clock bar while you play.
4. The Daily Move: one generated move a day, the same for everyone, made in advance and shipped with the game, with a
   score to beat and a seven-day card. No server.
5. A one-tap text share of a result, linking to that move in the web build.

**Next, in order:** style medals; respectful daily reminders; a move card image to share; the Weekly Cup;
Friendlies (endless generated moves that adapt to the player).

**Bets for later:** the generator as a content engine (Weekly Cup and Friendlies at full scale); friend challenges with
verified times; replay video clips.

**Not doing:** energy or lives, streaks that reset, paid retries or paid clock time, in-play ghosts, kit unlocks in the
story campaign, commentary text.

## How we judged

Seven tests, drawn from the owner's taste and the review:

1. **Retries stay free, forever.** Nothing a player earns may be lost by failing, and nothing may be graded on the number
   of takes in a way that cannot be improved later.
2. **Nothing on the pitch that is not the move.** He dislikes text and clutter. New things live on the home screen and the
   result sheets, not in play, except for marks on the existing clock bar.
3. **No pay-to-win.** Nothing that changes a score is ever sold: not time, not takes, not medals.
4. **No loss aversion.** No resetting streaks, no expiring rewards, no "you will lose" copy.
5. **Fairness is the product.** The owner's best levels felt "my own fault". A level must not silently change under the
   player.
6. **Privacy-light.** No accounts and no identifiers unless a later feature truly needs them.
7. **One developer.** Prefer static files to servers, and what the generator already does to new systems.

Effort: **S** up to three evenings; **M** one to two weeks of evenings; **L** more than that. Estimates are ours.

## Ranked proposals

| Rank | Proposal | Effort | Generator | App shell | Backend | When |
|---|---|---|---|---|---|---|
| 1 | Measurement | M | no | small (network, privacy) | tiny endpoint | Launch |
| 2 | Fail-streak safety net (extra time, move on) | S | no | no | no | Launch |
| 3 | Targets on the clock bar | S | pars for new levels | no | no | Launch |
| 4 | The Daily Move | M | yes, offline batches | no | no (static files) | Launch |
| 5 | Share a result (text at launch; image next; video later) | S / M / L | no | small, then new modules | no | Launch, then update 1, then later |
| 6 | Style medals | S-M | feasibility check | no | no | Update 1 |
| 7 | Respectful reminders | S-M | no | new module | no | Update 1 |
| 8 | Weekly Cup | M | yes | no | no | Update 2 |
| 9 | Friendlies, with adaptation | M | yes, a shipped pool | no | no | Update 2 |
| 10 | Your best move, replayed | M | no | storage | no | Later |
| 11 | Seasons and unlocks | S-M | optional | no | no | Later, small |
| 12 | Friend challenges and verified times | L | no | yes | yes | Bet |
| - | Streaks | - | - | - | - | Weekly card only, inside 4 |
| - | Difficulty adaptation | - | - | - | - | Rules below; built into 2 and 9 |

---

## 1. Measurement

**Player problem.** None directly. The soft launch exists to answer "do people come back, and where do they stop?" and
the build cannot answer it (review, section 5).

**Design.** Two small messages, both anonymous.

- **Day ping**, at most one per install per local day, sent on the first open that day (queued and sent later if
  offline, with its original day number):
  `{ v: build, os: android|ios|web, c: install date, d: days since install, fx: furthest fixture won, dm: daily
  played yesterday 0/1 }`.
- **Session summary**, sent when the app goes to the background (and, if that fails, at the next open):
  `{ v, c, d, mins: session minutes in buckets, ls: levels started, lc: levels cleared, tk: takes for each level cleared,
  fr: failures by reason, dr: drills finished, last: { screen, level, takes on it, last outcome }, dly: daily played,
  sn: safety-net offers shown and taken, sh: shares }`.
- No device or advertising identifier, no account, no random install ID, no IP address stored, no third-party SDK. The
  endpoint stores the message and nothing about the request.
- An "Anonymous play statistics" switch in Options, on by default outside the UK and EU. For the UK and EU, ask once,
  in one sentence, after the first fixture. Check the default against POPIA (South Africa) and GDPR before launch; we
  are not lawyers.

**How day-1, day-7 and day-30 come out without identifiers.** Every install sends exactly one day ping on each day it is
opened, carrying its install date. For the installs of a given date, day-n retention is the count of pings with
`d = n` divided by the count with `d = 0`. Cohort sizes and the error bands from the launch plan apply unchanged (300
installs read day-1 to within about 5 points). Sessions cannot be chained to one player, and do not need to be: quit
points, takes and funnel are distributions over sessions.

**What to read, and from which field.**

| Question | Metric | From |
|---|---|---|
| Do they come back? | Day-1, day-7, day-30 by install-date cohort | day pings |
| How much do they play? | Sessions a day, minutes a session, levels a session | session summaries |
| How deep do retries go? | Takes per cleared fixture, median and 90th percentile, by fixture | `tk` |
| Where do they stop? | Last screen and level of sessions; for day-0 sessions with no day-1 ping in the cohort, the share ending on a fail sheet, and how many takes into a level | `last` |
| Which fixtures lose people? | Furthest fixture won by days since install; starts against clears per fixture | `fx`, `ls`, `lc` |
| Is the opening working? | Drills finished, fixture 1 cleared, first session length | `dr`, `last`, `mins` |
| Does the daily pull? | Share of active installs that play it; day-7 of daily players against the rest | `dly`, `dm` |
| Does the safety net help? | Offers shown, taken, and whether the next level was cleared | `sn` |
| Do they share? | Shares per clear | `sh` |

**Proposed reading thresholds** (our judgement unless sourced): day-1 and day-7 as in `docs/marketing/launch-plan.md`
(go at 35% and 8%); day-30 at 3% or better is promising for a premium-feeling single-player game, which is our guess,
not a benchmark; any fixture where more than 15% of starters never clear it (launch plan); a session median under three
minutes means people are leaving in the drills.

**Retention mechanism.** Indirect: it shows which of the other proposals are working.

**Effort.** M. The on-device log already records every attempt (`logPlay` in `game.js`), so the counts are mostly
there; add the day bookkeeping, the two messages and the switch. The endpoint is a single function that appends to a
table (a serverless function with a small database, or a spreadsheet script); a cheap hosted option is enough at
soft-launch volume.

**Dependencies.** A tiny backend. The app shell must allow the web view to reach the endpoint. `privacy.html` and the
Play Data safety form must be updated in the same release (the privacy page promises an update before analytics are
added). Testers who used the hidden unlock-all switch should be flagged in the messages and left out of the reads.

**Risks.** Without identifiers, nothing can be broken down by player (for example "players who used extra time came back
more"); compare cohorts and builds instead. Soft-launch cohorts of a few hundred cannot support A/B tests; change one
thing per release and compare releases. A player who clears app data counts as a new install.

---

## 2. A safety net for fail streaks

**Player problem.** Closing fixtures are set to 8-15 takes for the owner. A stranger stuck on one has no way past
(strictly linear unlock) and is offered slow aim, the help the owner likes least.

**Design.** One quiet line at most on any fail sheet, in this order within a move:
- **On the 8th failure: Extra time.** "Two more seconds on the clock for this move." One button. The clock limit goes up
  by 2 s for this attempt at the fixture. Stars are still judged on the move's own time against par, so extra time does
  not need to cap the grade, and does not. Offered again at most once per fixture.
- **On the 12th: slow aim**, as now (the owner decided on 21 November that the game should offer it to a struggling
  player). Moved from the 8th failure to make room.
- **On the 16th: Move on.** "Play the next fixture. This one stays open." The next fixture opens; the skipped one keeps an
  open ticket with no stars, and the home button returns to it after the next win. A player may leave one fixture per
  season behind; the next season opens when all but one of this season's fixtures are won.

The thresholds are starting points, to be tuned from the takes data (proposal 1).

**Retention mechanism.** Converts the moment a player would close the app into a choice to carry on. Uses the dial the
data supports: in set B two more seconds halved the owner's takes on fixture 9 (15 to 7) and fun did not move (4 both
ways).

**Effort.** S. All in `game.js`: a per-fixture clock bonus passed to `makeSim`, an "owed" flag in the save, and the
unlock rule.

**Dependencies.** None. Works with the rebuilt campaign as it stands.

**Risks.** Players might take extra time by reflex and find the game too easy; the offer comes late and the stars still
reward a quick move. "Move on" is one of the two things the monetisation options document proposes to sell (a skip); we
recommend giving it away (see "Monetisation" below).

---

## 3. Targets on the clock bar

**Player problem.** A player chasing a star cannot see the target while playing; par and the gaffer's time appear only
on the goal sheet.

**Design.** Three hairline ticks on the existing clock bar: par (second star), the gaffer's time (third star) and the
player's best, each a short mark with a one-letter label underneath in the label face. Nothing else in play changes.
Also: rename "Retries" to "Takes" on the end-of-season report.

**Retention mechanism.** Turns the goal sheet's "a move of 6.1 s or quicker earns the third star" into something a player
can aim at during the next take: a near miss becomes visible, which is what drives "one more go".

**Effort.** S. The bar already draws marks (`#marks` in `hud()`).

**Dependencies.** A bot time for every level. The rebuilt campaign needs its `pars.js` regenerated; generated levels
come with bot routes, so their par is free.

**Risks.** Clutter on a bar the owner already looks at; keep the ticks thin and test at 360 px wide. Mocked in
`mockups/retention-fail-offer.html` (the bar at the top).

---

## 4. The Daily Move

**Player problem.** Nothing changes from one day to the next; capable players finish the campaign in a few evenings and
then have nothing new.

**Design.**
- **One move a day, the same for everyone.** Daily No. 1 is launch day. The level is chosen by the local date. The home
  screen gets one ticket above the season path: number, date, the move's name, the gaffer's time, the player's best, and
  a seven-day card. It opens after season 1 (fixture 4), so first-session players see only the campaign.
- **Made in advance, not on the phone.** The generator takes about a minute a level on a two-core machine
  (17-generator.md), so dailies are generated in batches: three candidates per date, the one whose difficulty estimate
  sits nearest the target kept. Band: standard (owner 3-6 takes) on weekdays, hard on Sundays; never closing. Exclude
  the shapes the owner rated low (double decoys; the sparse defences that R8 now rejects).
- **Curated, lightly.** Automatic checks pass about seven in eight generated levels that the owner then enjoys (set E: 7 of
  8). So a person plays each week's batch before it ships: the owner or three testers, in the existing rating build, ten
  minutes a week, vetoing anything that rates fun 3 or "not real football".
- **Delivered as static files.** The build bundles the first 90 days of dailies (about 1 KB a level, so under 100 KB).
  The game also looks for a monthly file on the existing GitHub Pages site and, when it finds one, uses it to extend the
  run or to replace a bad day. No server, no account. If neither has today's move, the ticket is simply absent.
- **Each daily records its engine version.** A daily made for a newer engine than the player's build is skipped, because
  engine changes alter how a level plays (the keeper collecting a slow ball changed one pass window in set E).
- **Score to beat.** The player's best time today against the gaffer's time (the third-star time, the bot's time x 1.2), with the usual three stars.
  Unlimited takes; the best counts. No global leaderboard at launch: it needs a server and cheat checks (proposal 12).
- **The seven-day card.** Monday to Sunday, one stamp per daily won. The last seven days stay playable, so a missed day is
  caught up, not lost. A full card is recorded ("Full weeks: 6"); nothing is taken away for an empty one. This is the
  only streak in the plan.

**Retention mechanism.** A fresh, fair puzzle each day with a known size (one move, a few minutes) gives a reason to open
the game on a day the player was not planning to, and a shared number ("Daily 34") gives players something to compare.
The model is the shared daily puzzle, which works because everyone has the same one.

**Effort.** M. Generator: a batch script that walks dates, a difficulty target per weekday and a "candidates" mode, which
the existing CLI nearly does (`--seed`, `--band`, `--count`). Game: a daily ticket, a daily brief and goal sheet (the
fixture sheets with different labels), a `daily` section of the save keyed by date, the file loader. About 7 hours of
compute for a year of dailies.

**Dependencies.** The generator. A weekly curation habit. The static site for updates.

**Risks.** A dull or broken daily spoils a day for everyone: curation and the override file. Future dailies can be read
from the bundle: harmless without a leaderboard. Changing the phone's date lets a player play ahead: harmless for the same
reason. A daily confounds the soft-launch read of the campaign: the day ping carries "played the daily", so daily players
and the rest can be read apart. Mocked in `mockups/retention-home-daily.html` and `retention-daily-result.html`.

---

## 5. Share a result

**Player problem.** The action replay is the best thing the game makes, and nobody else can see it. The launch plan
calls sharing "the only acquisition channel that costs nothing".

**Design, in three steps.**
- **At launch: text.** A share button on the goal sheet for dailies (and fixtures) that hands the system share sheet a
  plain text result and a link:

  ```
  One-Man Team · Daily 34
  Bend the run · 6.8 s · 3 takes
  Gaffer's time 6.4 s. Your turn:
  ollywoodgames.github.io/one-man-team/?daily=34
  ```
  The link opens that daily in the web build, so a friend can play it with no install: a challenge, with nothing to
  verify, because the level is the same for everyone. No emoji, in keeping with the art direction.
- **Update 1: a move card.** A still image in programme styling: the final frame of the replay with every run drawn as a
  dashed line, the move's name, time and medals (mocked in `mockups/retention-share-card.html`).
- **Later: a replay clip.** A short portrait video of the action replay. Recording the canvas inside a web view works
  differently on Android and iOS, and some apps refuse some video formats; prove it on both before promising it.

**Retention mechanism.** Mostly acquisition; for the sharer, a reason to polish a move (a better time is a better brag).

**Effort.** Text S (the shell's bridge gains a `share` message using React Native's built-in share; on the web,
`navigator.share` or copy); card M (draw to a canvas, save a file, share it: new native modules in the shell); clip L.

**Dependencies.** The web build must accept `?daily=N` and `?fixture=N`. A shell update (and a new build) for the image.

**Risks.** Few people share from small games; the launch plan sets no target, nor do we. Watch shares per clear.

---

## 6. Style medals

**Player problem.** Once a capable player has three stars (often at the first clear: 12 of the owner's 20 set A first
plays would grade three stars under the current rule), a level offers nothing more, and the stars see only speed.

**Design.** Three medals, the same on every level, shown as small stamps under the stars on the goal sheet and counted
in the home tally. Each is earned in a single play-through and kept for ever, so a failed take never costs one.
- **Clean move**: every player right first time, from the first player to the goal, without a retry or a redo. Earnable
  on any later play, which suits a player who has learned the level.
- **First-time finish**: the scorer shoots within half a second of his first touch.
- **From outside the box**: the scoring shot struck from outside the penalty area. The owner already shoots from 15-21 m
  (set B); in sets B to E, about 11 of his 37 rated goals were struck from 16.5 m or more from the goal centre.

Introduced after season 1, one sentence each, the first time each is earned. A medal that cannot be earned on a given
level (no route allows it) is not shown for that level.

**Retention mechanism.** Replay goals that grow with skill rather than shrink with it; football moments players
recognise and brag about ("first time, from outside the box"); a second layer of collection that does not inflate the
star count.

**Effort.** S-M. The engine already records what is needed (the reception tick, the kick tick and position); `shotFrom()`
exists. The feasibility check is the larger part.

**Dependencies.** The generator (or the human model) checks each medal is achievable on each level; the rebuilt campaign
runs through the same check.

**Risks.** More on the goal sheet: three stamps, no text. "Clean move" could read as a retry penalty; it is not one, since
it is about a single run and stays available; the copy must say "in one go", never "without retrying". Medals that
depend on a level's shape (first-time finish on a carry-and-shoot route) may feel unfair; hence the feasibility rule.

---

## 7. Respectful reminders

**Player problem.** A player who enjoys the daily still forgets it.

**Design.** Local notifications only: scheduled on the phone, no push server, no token.
- Off until asked; the game asks only after the player has won the daily on two different days, with a one-line card
  first ("A nudge when today's move is up?") and then the system prompt.
- At most one a day, at the hour the player usually plays (worked out on the phone), and only if today's daily is
  unplayed.
- Stops itself after three ignored in a row, and says so in Options.
- Copy in the game's voice, about the move, never about loss: "Daily 35 is up. Three players, one through ball."

**Retention mechanism.** A cue for a habit the player has already formed; respect keeps the permission.

**Effort.** S-M. A notification module in the shell (a new native build), a schedule message over the bridge, the
Android 13 runtime permission and the iOS prompt.

**Dependencies.** The Daily Move. The app shell.

**Risks.** Over-sending loses the permission for good; the rules above are the guard. Measure prompts accepted and
whether reminded days lead to a play (the summary can carry "opened from a reminder").

---

## 8. The Weekly Cup

**Player problem.** Players who finish the campaign and like the daily want a longer, harder goal; there is no weekly
rhythm.

**Design.** Each Monday a five-round cup, the same for everyone (seed: the week): standard, standard, hard, hard,
closing. Rounds open in order; a round is won by scoring, with unlimited takes, so nobody is knocked out. The score is
the sum of best times, and the medals collected. It closes on Sunday night and the result goes on a "Cup record" page.
Opens after season 2.

**Retention mechanism.** A weekly appointment and the one place the closing band (the owner's favourite difficulty, fair
5) is offered as a deliberate challenge rather than a wall.

**Effort.** M, mostly reuse of the daily: a weekly batch, a five-ticket screen, a results page.

**Dependencies.** The generator and the curation habit (five more levels a week).

**Risks.** Curation load doubles; start with the daily alone and add the cup only if daily players' day-7 is healthy.

---

## 9. Friendlies, and difficulty adaptation

**Player problem.** The end of the campaign; and a player stuck at a wall has nothing else to play.

**Design.** An endless run of generated moves from a pool shipped with the game (300 ordinary levels at about 1 KB each;
about six hours of generation). The next move is picked by how the last few went: a median under three takes picks
from the harder half of the pool by the difficulty estimate; over eight picks from the easier half; the clock is the
dial within a band. Stars as usual; a count of Friendlies won. Opens after fixture 12.

**Difficulty adaptation, the rules for the whole game.**
- **Never adapt shared content.** The daily and the cup are the same for everyone, or their numbers mean nothing.
- **Never change a campaign level silently.** Fairness is what the owner values most; a level that quietly gets easier
  takes away "my own fault". In the campaign, adapt openly through offers the player chooses (proposal 2).
- **Adapt automatically only in Friendlies,** and by what the player actually did, not by prediction: the generator's
  estimate is typically out by a factor of two on a single level (20, part 2).

**Retention mechanism.** Removes the content ceiling; gives a stuck player somewhere to go.

**Effort.** M.

**Dependencies.** The generator; the difficulty estimate stored with each level.

**Risks.** Template sameness shows faster in an endless run (17: "two levels from one template look alike"); vary the
template order and mirror sides, as the campaign rules already do. A pool can be finished by a dedicated player; refill it
through the static site.

---

## 10. Ghost replays: your best move, replayed

**Player problem.** A player chasing time wants to see what a better run looked like.

**Judgement.** **No ghost on the pitch during play.** The game's core picture is already made of earlier selves replaying
alongside the live player; another translucent team on the pitch would blur the one idea a new player must grasp, and
add clutter the owner dislikes. Instead:
- the best time as a tick on the clock bar (proposal 3), which carries most of the value;
- later, a "Watch your best" toggle on the goal sheet that plays the stored best move instead of the one just played.

**Effort.** M. The best move's recordings must be stored: positions for each player at 60 per second, which compress to
a few kilobytes a level (our estimate; measure it). Keep them under a separate storage key, because the whole save is
posted to native storage on every change.

**Dependencies.** Storage in the shell. Friend ghosts belong with proposal 12.

**Risks.** Storage growth; keep the best move only, for at most the last 60 levels played.

---

## 11. Seasons and unlocks

**Judgement.** Mostly not worth it.
- **Kits:** the story bible fixes the club's kit ("the same in every fixture, home and away"), so kit unlocks would
  contradict the story. Opponent kits come from the fixture list.
- **Commentary lines:** text during play is clutter; recorded commentary is costly. No.
- **Pitches:** the felt is part of the identity, and every new cloth must pass the legibility rule; low value.
- **Worth doing, later and small:** a programme collection (each season report becomes a cover kept on a shelf page), and
  star thresholds that open bonus Cup ties (generated closing moves): stars buy more play, not decoration. These could
  form part of a supporter purchase (see below).

**Effort.** S-M. **Dependencies.** The rebuilt campaign's season list. **Risks.** Little, and little gain.

---

## 12. Friend challenges and verified times (bet)

**Player problem.** "Score to beat" is strongest against real people, and the daily's shared number begs a table.

**Design.** A challenge link that carries the sender's time and, later, the sender's move; a friends' table for the
daily and the cup under chosen nicknames. Times are checked on a server by replaying the submitted recordings through the
same `sim.js`.

**Retention mechanism.** Social comparison, the strongest weekly pull in comparable games.

**Effort.** L. **Dependencies.** A real backend, nicknames, moderation, cheat checks, a privacy rewrite.

**Risks.** The engine's attackers replay from stored positions, but the defenders are re-simulated, and a phone's web
view and a server may not compute floating-point maths identically (iOS uses a different JavaScript engine from Android
and Node). Prove that the same recordings give the same result on both before building anything. Moderation and support
are ongoing costs for one person.

---

## Streaks

**Judgement.** No daily streak that resets. It is loss aversion by design, it punishes a missed day the way the old stars
punished a retry, and it would be the first thing to sour. The seven-day card in proposal 4 gives the rhythm without the
penalty: missed days can be caught up within the week, and an empty card costs nothing.

## Monetisation

Monetisation is undecided (`docs/marketing/monetisation-options.md` recommends none at soft launch, then optional
rewarded adverts plus a one-off unlock that sells hints and skips). Our constraints on any choice:
- Never sell clock time, takes, stars, medals or daily entries. Extra time stays free.
- We recommend making "Move on" free. It turns a likely quit into more play, which is worth more than the few skips that
  would be sold at soft-launch volume. That leaves hints (a faint line showing a working run, from the bot routes, shown
  on request on the fail sheet) as the thing to sell or reward. The owner decides.
- The programme collection and bonus Cup ties could sit in a supporter unlock without touching fairness.

## Launch scope and roadmap

| Release | Contents | What it tests |
|---|---|---|
| **Launch (soft launch)** | 1 Measurement; 2 Extra time and Move on; 3 Ticks on the clock bar, "Takes" on the season report; 4 Daily Move with the seven-day card (90 days bundled, first 8 weeks curated); 5 Text share with web links | Day-1, day-7, the funnel, and whether a daily lifts day-7 |
| **Update 1** (after the first day-7 read) | 6 Style medals; 7 Reminders; 5 Move card image | Replays after first clear; day-7 and day-30 of daily players |
| **Update 2** | 8 Weekly Cup; 9 Friendlies | Day-30; activity after fixture 60 |
| **Later** | 10 Your best move; 11 Programme collection and bonus Cup ties | Replays per level |
| **Bets** | Generator content engine at scale; 12 Friend challenges and verified times; 5 Replay clips | Social pull; free acquisition |

Before launch, whatever else happens: **give every level a stable id and key the save by it**, not by name. The campaign
is being rebuilt now; once players have saves, renaming a level would wipe their stars and best time for it, and the
start-up re-grade would judge an old time against a new level's par.

## What we would not build

- Energy, lives or timers on retries: the grievance the positioning is built against.
- Adverts for extra time or retries: they would put a price on the safety net.
- Daily login rewards and expiring chests: rewards for opening, not for playing.
- An in-play ghost of the player's best: it fights the core picture.
- Kit unlocks in the campaign: the story fixes the kit.

## Mock screens

Static HTML in `docs/retention/mockups/`, following `docs/ART_DIRECTION.md` (paper, ink, felt, the three type faces,
2px ink borders and hard offset shadows, inline SVG icons, no emoji). Rendered at 390 x 844 with Playwright to
`/home/claude/shots/`.

| Mock | Shows | PNG |
|---|---|---|
| `retention-home-daily.html` | Home with the Daily Move ticket and the seven-day card above the season path | `retention-home-daily.png` |
| `retention-daily-result.html` | The daily goal sheet: stars, time against the gaffer's, takes, share; the medals row arrives in update 1 | `retention-daily-result.png` |
| `retention-fail-offer.html` | A fail sheet with the extra-time offer, and par, gaffer and best ticks on the clock bar | `retention-fail-offer.png` |
| `retention-share-card.html` | The move card image for sharing | `retention-share-card.png` |

`mockups/render.py` re-renders them.
