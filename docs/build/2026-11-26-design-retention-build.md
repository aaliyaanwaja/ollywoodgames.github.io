# One-Man Team: design and retention build (26 November 2026)

Build 0.5.0 (service worker `omt-0.10.0`). What was built from the approved design plan
(`docs/design/2026-11-26-design-plan.md`) and retention launch scope (`docs/retention/2026-11-26-retention-plan.md`),
as decided in `docs/decisions/2026-11-26-design-retention.md`. Four commits: review bug fixes; design changes 1-12;
retention; verification and the full Daily Move bundle.

## Short answer

- Everything approved is built: the six review bugs, design changes 1-12 (the replay at full speed throughout, as the
  owner asked), and the four retention items (help when stuck, the Daily Move with the seven-day card, the one-tap share
  link, anonymous measurement with an off switch).
- Not built, as decided: par, gaffer and best marks on the clock bar.
- The simulation is untouched (`sim.js` has no diff). The game-feel holds freeze the simulation and the clock together,
  so no result moves: all 60 bot runs give the same outcome and the same tick count, round by round, before and after
  (`tools/bot-ticks.js --diff`), and the 60 goals scored in the browser through the new frame loop land on the same tick
  as in Node.
- Sound: free-licence recordings were found and are in. The sandbox could reach GitHub, so the recordings come from two
  CC0 collections on GitHub (Kenney's Impact Sounds and Soundza's SoundKit); every file, source and licence is in
  `one-man-team/audio/CREDITS.md`, and every sound keeps its synthesised version as the fallback.
- Two things need the owner: switch on GitHub Pages for the repository (the share links and the later Daily Move files
  live there), and, when wanted, set a statistics address (nothing is collected until then).

## Bug fixes from the review (commit 1)

| Bug | Fix |
| --- | --- |
| Android back on a fail sheet discarded the move | Back (and Escape) on a fail card opens pause; back with pause open resumes, and the card comes back. During the 30-300 ms hold before a card, back shows the card and pauses. |
| Replay HUD clock kept running | The replay and the result show the finished move's clock, frozen. Since change 8 the number is the move time (5.3), as mock 04 shows, not the time left. |
| "Next fixture" on the last fixture | Reads "Fixtures" when fixture 60 is won before the earlier ones. |
| Slow-aim row borrowed the book icon | A stopwatch icon (`IC.clock`), used in Options and on the offer. |
| Story minute and opponent line not shown | The programme line from `story.js` is on every brief, in italics under the instruction; the hero ticket on the home screen carries the match situation ("Matchday 1 · 54′ · 0-0"). |
| Clock hidden in practice drills | Shown: it counts up in sky blue and never runs out; the score chip reads "Practice". |

Also fixed on the way: the privacy row rendered lighter than its neighbours (it now has the same weight); a fail caused
by an earlier player's pass running out of play used to say "your new run moved the defence" (it now says the earlier
pass ran out and offers to redo that player).

## Design changes (commit 2)

| # | Built | Differs from the mockup, and why |
| --- | --- | --- |
| 1 | `#tip` removed. A round-start card in the left half of the control bar: "You are the 8 · Playmaker" and the full tip, before the first touch; folds away on the first touch with a paper sound; comes back on every retry. On the tutorial fixtures and the first decoy, where a coach prompt already says what to do, the card is not shown (one voice at a time). The "No. 8 recorded" toast is gone: the tick lands on the team sheet with a small stamp. | None of substance. |
| 2 | Control bar 88px, kick button 80px; written hints still only on fixtures 1-2 (first time). | None. |
| 3 | Fail card: verb title, one sentence with the fix in bold, "Take 4 · 0.9s", Try again; "Redo the 8" only when an earlier recorded part caused it. Placed on the side of the pitch away from the incident (the renderer reports where it happened). Drag anywhere on the pitch starts the next take after a 400ms guard; a chip says so. Mustard halo on the defender or keeper who won it. | The card is a little taller than the mock when an offer is on it (help when stuck adds one boxed line). |
| 4 | Kit guard in `render.js` (and the brief's line-up): dark base, silver `#B8BEC6` rim, six wide bands. `tools/kit-check.js` for the campaign team. Rule added to `ART_DIRECTION.md`. | Two thresholds changed. Near-black is luminance under 0.03, not 0.05: at 0.05 the classic claret (fixture 21, Greaveley Glassworks, claret and chalk) is caught and drawn silver, which is not a black-and-white kit. The felt check fails a kit only when its best colour is under 1.5:1 against the felt, not 3:1: the house palette itself has mustard (2.8:1) and sky under 3:1, and the review relies on the 2px ink outline for those. The script lists the 3:1 cases as notes. The campaign team's new kits already avoid black with white, so the guard changes no current fixture. |
| 5 | Options as four grouped lists (Sound and feel; Play; Help; Your progress), one shadow per group. Slow aim explains itself in its row. Text size (Standard / Large: reading text and labels x1.2 through one CSS variable, squad numbers and pitch tags x1.15) and Reduce motion (Phone / On). Pause: the live player and his full tip, Resume, Restart move and Fixtures, three icon buttons. Header strips say what the page is ("Club office · Build 0.5.0", "Laws of the game · Build 0.5.0"); "Price: nothing" stays on the cover only. Receive buzz 14ms. | Options also carries the Play statistics switch (retention). On a narrow phone at Large text, the Standard/Large and Phone/On buttons drop under their label rather than squeeze. |
| 6 | Kick off on the cover goes straight to drill 1; the coach card is the brief. Drill HUD: "Drill 1 · Shoot", four pips, Skip in place of rewind and retry. A miss rewrites the coach card ("Wide. Just past the post. Aim a little inside it and go again."). Practice complete goes straight to the fixture 1 brief (Kick off). | The written control hints in the bar stay in the drills (mock 10 shows them). |
| 7 | HUD 84px in two rows: pause, team sheet, redo, retry; then the clock row. Team sheet in figure bases: recorded greyed with a tick, live large in the mustard ring, to come dashed, decoys in sky. Redo hidden (slot kept) on the first player. | On a phone under 400px wide a five-player move drops the arrows and shrinks the bases slightly so the whole move fits beside the buttons. |
| 8 | After the GOAL stamp (score chip flips with it and the goal haptic), one full-height loop of the move at full speed with a ribbon ("Full-time replay", the move's name and minute, the frozen clock row); the control bar goes; tap or back to skip. Then the result card over the looping replay: old score struck through, new score, "88th minute winner", stars, move time with "Third star at 4.8s", Take N. The full replay plays on a first win or a new best; other wins go straight to the card. | No half-speed finish (owner's decision). The control bar disappears rather than sliding: animating its height would rebuild the pitch layer every frame. |
| 9 | Brief: a printed line-up drawn from `level.att`, `level.def`, the kit and the keeper; ours numbered by order with a small order tag; their figures with banded rims; the ball at the first passer. Legend: order, base, role ("Decoy" in sky). Programme line in italics. | Starting positions only, as asked. The line-up is capped at 46% of the screen height; on long fixtures the legend is reached by scrolling the page. |
| 10 | Home: finished seasons fold into one card with a stamp; tap to unfold (and the heading folds it again). The current season with its competition, "N of 8 won" and an eight-box strip; the next fixture as the hero ticket with its match situation; the rest as stubs two to a row; the next locked season as one dashed card with its condition; the far future as one line ("Five more seasons in the programme"). The home strip names the club. Seven-tap tester unlock kept. | The stamp shows the campaign team's `seasonWord` (Bottom, Promotion, Cup, Title, Survival, Eviction, Leaders, Glory), with "Complete" as the fallback. Those are theme words rather than results; "Bottom" reads oddly as a stamp on a season the club survived. Suggest the campaign team supply result words (Survived, Promoted, ...) in the same field. The mock trims the stubs to "4 more"; all are shown, since they fit with a short scroll. |
| 11 | One cue table in `game.js` (`CUE`): pass 30ms, shot 50ms, save 60ms, tackle 80ms, offside 300ms with two whistles. A hold freezes the simulation and the clock together and owes nothing afterwards. Live ring snaps 12% larger for 90ms on a touch; chalk streak behind shots only, bright off the boot and settling over 250ms; the figure who lost the ball rocks on his base; the net bulges where the ball hit and swings back over about 400ms; mustard halo (change 3). Reduce motion drops holds, camera kicks, the ring snap and the rock; sounds and haptics stay. | Offside holds on the frame the pass was played, which is when the engine already judges it, so no rewind was needed. |
| 12 | Recorded CC0 sounds: boot light (pass), boot heavy (shot), touch, glove (save), thud (tackle, collision), net, crowd bed (looped under play, swells on the decisive shot), crowd roar and a brass sting on a goal, paper (round-start card), and a quiet distant crowd on the home screen, off with the sound. Loaded from `js/sounds.js` (base64, built by `tools/make-sounds.py`), decoded on the first tap, so they work from one file, from `file://` and in the app with no network. Each falls back to its synthesised version. | MP3 (mono) rather than Ogg/Opus with an AAC fallback: one file that decodes in Chromium, Android WebView and WKWebView alike, about 160 KB for all eleven. No free recordings of a tea urn or rain on a tin roof were found, so the home ambience is a distant crowd only. The whistle stays synthesised (the review found it convincing). |

## Retention (commit 3, completed in commit 4)

**Help when stuck** (`game.js`, `showFail`). One quiet line at most on a fail card, the latest that applies: from the
8th failure "Two more seconds?" (Add 2 seconds: the clock limit goes up 2 s for the rest of that attempt series, that
is until the fixture is left or restarted; the HUD bar and the replay use the longer clock; stars are still judged on the
move time); from the 12th slow aim (if it is off); from the 16th "Move on?" (free; one fixture per season; no stars; the
next fixture opens and the skipped one keeps an open ticket marked "Left open"; the home button goes to the next fixture
and, after the next win, back to the skipped one; winning it later clears the mark). The extra-time offer stays on the
card until taken or until slow aim takes its place. Offers shown and taken are counted for measurement. The "one offer
per fixture" limit from the old slow-aim offer is gone: the thresholds already space the offers.

**The Daily Move.**
- `tools/gen/daily.js` makes one move per date ahead of time with the existing generator: standard band on weekdays and
  Saturdays, hard on Sundays, never closing, repeat 1 of the ramp (the speed of fixtures 21-36), and every automatic check
  of rulebook 8.1 (R8 included) at its own clock. Seeds come from the daily number. Daily No. 1 is Monday 30 November
  2026, so the seven-day card lines up with the weeks; change `EPOCH` in the script and rerun to move launch day.
- The first 90 days (30 Nov 2026 to 27 Feb 2027) are bundled in `js/levels/daily.js`; later days go to
  `one-man-team/daily/YYYY-MM.json` (this build ships February's last day and 1 March as the first two files, to prove the
  route). The game fetches the current month's file from the site when the bundle has no move for today or the coming
  week, keeps it in its own cache, and lets a monthly file replace a bundled day (the override for a bad day).
- Each daily records its engine version; the game skips one made for a newer engine (`DAILY_ENGINE` in `game.js`,
  `ENGINE` in the script).
- In the game: the ticket above the season (number, date, what kind of move, name, gaffer's time, your best), opens
  after season 1; the seven-day card (Monday to Sunday: won days stamped, missed days of the last seven playable, today
  ringed, "Full weeks: N" once there is one); a daily brief with the printed line-up; the daily goal sheet (stars, move
  time or best, gaffer's time, takes, "Next daily: No. 35, tomorrow", Share). Best time per date in `save.daily`.
- `node tools/gen/daily.js check` plays every daily (bundle and monthly files) with its bot.
- Differs from the plan: one candidate per date instead of three (generation runs at 30-300 s a level on this machine;
  three candidates for 92 days would have taken most of a day). The weekly human curation the plan asks for has not
  happened: nobody has played these 92 yet. The card shows the current week only, so on a Monday last week's missed
  days are not reachable from it (the plan's seven-day catch-up window is enforced, but only this week is drawn).

**Share** (one tap). The daily goal sheet's Share button sends:

```
One-Man Team · Daily 4
The counter · 6.6 s · 1 take
Gaffer’s time 8.0 s. Your turn:
https://ollywoodgames.github.io/one-man-team/?daily=4
```

In the app it goes to the system share sheet through a new bridge message (`share`, React Native's own `Share`, no new
native module; validated by `shareText` in `page-script.js` and tested); in a browser `navigator.share`, else the
clipboard, else a copy card. The web build opens `?daily=N` straight into that day's move with no cover, no practice and
no season gate (a friend with no save can play it), fetching the month's file if needed; `?fixture=N` opens that
fixture if it is open on that device. **GitHub Pages is not enabled for the repository yet**: until the owner switches
it on (Settings, Pages, branch `main`, folder `/`), the links and the monthly files return 404. Nothing else changes
when it is switched on; `site` in `js/config.js` holds the address.

**Measurement.** Client side only, behind `statsUrl` in `js/config.js`, which is empty, so in this build nothing is
collected, queued or sent. When an address is set: a day message on the first open of each local day (version, OS,
install date and days since, furthest fixture won, played yesterday's daily) and a session summary when the game goes
to the background (minutes in bands, levels started and won, takes per win, failures by reason, drills finished, daily
played, offers shown and taken, shares, last screen and level and outcome), queued in the save (at most 20) and sent as
`text/plain` POSTs with `keepalive`, no credentials, no referrer. No identifiers of any kind; testers who used the
unlock flag carry `t: 1`. Options has a Play statistics switch; in the UK and EU (time zone `Europe/...`) it starts off
and the game asks once after the first fixture, but only once an address exists. `privacy.html` describes all of it and
says plainly that this build sends nothing; `app/README.md` has the Play Data safety answers for this build (still "no
data collected") and for the release that sets the address (App activity, App interactions; optional; analytics), with
the iOS privacy-manifest entry and the INTERNET permission that must change in that same release.

## Tests

| Check | Result |
| --- | --- |
| `node tools/test.js` | 60 of 60 beaten, every replay scores |
| `node tools/test.js --jitter` | every round 45% or more; lowest 48% (fixture 50), as before |
| `node tools/bot-ticks.js --diff` (before/after, every round's status, reason and tick) | 60 identical, 0 different |
| Browser bot run through the new frame loop (`play2.py` variant) | 60 of 60 scored, every goal on the same tick as Node, no console errors |
| `node tools/ai-scenarios.js` | all scenarios passed |
| `node tools/gen/daily.js check` | 92 of 92 dailies beaten by their bot (90 bundled, 2 in monthly files); templates: Third-man run 15, Short then long 13, Wing and cut-back 11, Beat the trap 11, Bend the run 11, The counter 9, five others 1-5 each; bot times 3.4-7.0 s |
| `node tools/kit-check.js` | 60 fixtures, 0 warnings (95 kit colours under 3:1 against the felt listed as notes) |
| App `npm test` | `sync-game --check` in step; `shell.test.js` 14 checks (one new: `shareText`); `bridge_test.py` 35 of 35 (the first-run check rewritten for the new flow: Kick off goes straight to drill 1, back pauses, Skip is in the HUD) |
| App `npm run check-native` | 11 checks passed (store build still has no INTERNET permission and an empty collected-data list, which is correct while `statsUrl` is empty) |
| Single-file build `/home/claude/game/index.html` (840 KB with the sounds and the daily bundle), all 60 bots through it in Chromium | 60 of 60 scored, every goal on the same tick as Node, no console errors |
| Playwright end-to-end (`/home/claude/qa/e2e.py`), 390x844 | 59 of 59 checks, no console errors |
| Playwright end-to-end, 360x640 | 59 of 59 checks, no console errors |

The end-to-end script covers: first launch (cover, back leaves the app), the drills (no brief page, the clock shown, a
real missed shot rewriting the coach card, Skip to the fixture 1 brief); fixture 1 played by hand with real pointer
input (the pass with the kick button, the striker waiting for his own pass, running onto it, the shot); a fail streak
to 16 with each offer checked (none before 8; Add 2 seconds raises the limit by 120 ticks; nothing at 9-11 once taken;
slow aim from 12; Move on at 16 opens the next fixture, and home shows "Left open" and sends the player on); drag to
retry; a goal with the stamp and score flip, the replay, tap to skip, the result card, the season review; home folded
and unfolded; a repeat win skipping the replay; the line-up brief, the round-start card folding on the first touch,
pause; the Daily Move from the seven-day card, its result, its share text and copy card, `?daily=4` from an empty
browser, a day past the bundle loaded from its monthly file on the website (served by the test), no daily before
season 1; Options with Large text and Reduce motion (nothing clipped, every touch target at
least 44px on the play screen); Android back on every screen (cover, drill, brief, play, fail card, pause, replay,
result, season review, Options, How to play, home).

Screenshots: `/home/claude/shots/build-390-*.png` and `/home/claude/shots/build-360-*.png` (one set per size, 36+ each),
plus `build-g1-last.png` from the bug-fix pass.

## What is left

1. **Owner:** switch on GitHub Pages; until then share links and later dailies 404.
2. **Owner:** decide on a statistics endpoint (a serverless function or a spreadsheet script, as the retention plan
   says), then set `statsUrl`, remove the INTERNET block for store builds in `app/app.config.js` and its check in
   `check-native.js`, add the iOS manifest entry, and file the Data safety form from the README, all in one release.
   Have the privacy wording checked against UK GDPR, EU GDPR and POPIA first.
3. **Owner or testers:** play the generated dailies before they go live (the plan's ten minutes a week); replace a bad day
   by putting a corrected entry in that month's file.
4. **Generator, monthly:** run `node tools/gen/daily.js gen --from 93 --to 123 --out ...` and `write` to add March's file
   before day 91 comes round (the bundle runs to 27 February 2027).
5. **Campaign team:** result words for the season stamps (`seasonWord`), if they agree "Bottom" reads oddly.
6. **On a real phone:** the 400ms drag-to-retry guard, the 80px kick button, the haptic lengths and the recorded sounds'
   levels were tuned in a browser only. The app shell's new `share` message has been type-checked and unit-tested, not
   run on a device.
7. **Not done from the plan's detail:** curation of the dailies, three candidates per date, a catch-up view of last week
   on Mondays, the share card image and replay clip (planned for later updates anyway).
