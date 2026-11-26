# One-Man Team: design plan (26 November 2026)

Twelve changes from the design review (`docs/design/2026-11-26-design-review.md`), for the owner to approve before any
work starts. Six quick wins, six bigger moves. Each has the problem, the change, a before screenshot, an annotated mockup,
effort, risk to gameplay and where it lands in the code.

Effort: S is under a day, M is one to three days, L is more than three. Risk to gameplay: whether the change can alter how
a move plays, its timing, the bots' results or the recordings.

**Identity.** We keep the tabletop figures on felt and the matchday programme. There is no case for changing either; the
plan pushes them further (the brief becomes a printed line-up, finished seasons fold like programmes, the replay becomes a
broadcast). Nothing here touches the rules, the defenders, the level files or story.js.

**Standing rules.** The clock is visible on every screen in every mockup, including the drills and the replay. Slow aim
stays an optional setting, now with its own icon and one line of explanation. Training drills (the parked mode) are not
touched; the four practice drills at first launch are.

**Mockups.** Static HTML in `docs/design/mockups/` (shared `mock.css`, `_hud.js`, and real renders from the game in
`img/`), rendered to `/home/claude/shots/design-mock-*.png`. Where a mockup shows the pitch it is a real frame from the
build, captured with the proposed HUD and control-bar sizes, not a drawing.

## Summary

| # | Change | Type | Effort | Gameplay risk | Mockup |
| --- | --- | --- | --- | --- | --- |
| 1 | Say it once: the player's instruction moves to a round-start card; the HUD tip line goes | Quick win | S | Low | 02 |
| 2 | Slimmer control bar | Quick win | S | Low | 01 |
| 3 | Fail card off the incident, drag to go again | Quick win | S-M | Low | 03 |
| 4 | Kit legibility guard | Quick win | S | None | 08 |
| 5 | Options and pause tidy, text size, reduce motion, bug fixes | Quick win | S-M | None | 07 |
| 6 | The first minute: drills without brief pages, the clock shown | Quick win | S-M | None | 10 |
| 7 | Compact HUD with the team sheet | Bigger move | M | Low | 01, 01b |
| 8 | The replay as the reward | Bigger move | M | None | 04 |
| 9 | Brief with a printed line-up | Bigger move | M | None | 05 |
| 10 | Home, one season at a time | Bigger move | M | None | 06 |
| 11 | Game feel: one beat per moment | Bigger move | M | Medium | 09 |
| 12 | Recorded sound and a goal sting | Bigger move | L | None | 09 (cue sheet) |

Our five to do first, in order: 7 with 1 and 2 (they ship as one play-screen change), 3, 11, 8, 12.

---

## Quick wins

### 1. Say it once, at the right time

**Problem.** During a move the player is shown up to three pieces of text at once: the per-player tip in the HUD (two
lines, visible all move long), a "You are the 8. Move to start the clock" chip at the bottom of the pitch, and on fixtures
1-4 a coach card at the top. Toasts ("No. 8 recorded") land on the passer and the ball. Nobody reads with both thumbs busy.

**Change.**
- Remove the `#tip` line from the HUD.
- Before the first touch of each player, show one card in the empty left half of the control bar: "You are the 8 ·
  Playmaker" and the full tip. It folds away on the first touch (120ms slide down, paper sound) and comes back on a retry
  of the same player. The pause card keeps the full tip.
- Live coach prompts on fixtures 1-4 stay on the pitch (they speak during play, when the left thumb covers the bar). They
  become the only words on the cloth.
- Replace the "No. N recorded" toast with the tick appearing on that player in the HUD team sheet (change 7). Until change 7
  lands, move the toast into the HUD.

**Before.** `/home/claude/shots/design-09-L01-after-pass.png`, `/home/claude/shots/design-24-L60-f01.png`
**Mockup.** `/home/claude/shots/design-mock-02-round-start.png` (`docs/design/mockups/mock-02-round-start.html`)
**Effort.** S. **Risk.** Low: a player who forgets the instruction mid-move no longer sees it until he pauses or retries.
**Code.** `game.js`: `hud()`, `fitTip()` (delete), `coach()` ('ready' key renders into the bar), `onWon()` toast;
`index.html` `#tip`; `style.css` `#tip`, `#ready`.

### 2. Slimmer control bar

**Problem.** The control bar is 108px. After fixture 2 its left half is empty on every move because the written hints are
hidden but their space is not reclaimed.

**Change.** Bar 88px, kick button 80px (still well above 48px). The written hints stay on fixtures 1-2 only, as now; the
left half hosts the round-start card from change 1. 

**Before.** `/home/claude/shots/design-24-L45-f04.png`
**Mockup.** `/home/claude/shots/design-mock-01-play.png` (pin 4)
**Effort.** S. **Risk.** Low: an 8px smaller kick button. Check on a real phone that the aim drag still starts cleanly.
**Code.** `style.css` `#ctl`, `#kick`, the 600px media query.

### 3. Fail fast, retry faster

**Problem.** Every failure raises a bottom sheet over 40% of the pitch, usually the half where the move broke down, with
"what happened" and "try" text and two or three buttons. The retry loop is the heart of the game; each failure costs a read
and a reach.

**Change.**
- A short card on the side of the pitch away from the incident (top if the incident is in the lower half, otherwise
  bottom): the verb as title ("Tackled"), one sentence with the fix in bold, "Take 4 · 0.9s", one "Try again" button.
  "Redo the 8" appears only when the failure was caused by an earlier part (the `failWho` branch), the one case where it is
  the right advice; the HUD redo button covers the rest.
- The incident stays visible: the starburst, plus a mustard halo on the defender or keeper responsible (the renderer
  already knows `tackler`; keeper fails set `keeperHold`).
- Drag anywhere on the pitch to start the next take, after a 400ms guard so a thumb still on the glass does not restart by
  accident.
- The slow-aim offer after eight failures keeps its place in the card, as now.
- Fix: Android back and Escape on a fail card open pause instead of discarding the move (review, bugs 1 and 4).

**Before.** `/home/claude/shots/design-36-fail-tackled.png`, `/home/claude/shots/design-10-fail-sheet-L01.png`
**Mockup.** `/home/claude/shots/design-mock-03-fail.png` (`mock-03-fail.html`)
**Effort.** S for the card and the back fix, M with drag-to-retry and the halo.
**Risk.** Low: an accidental restart if the guard is too short; tune on a phone. The take counter and stars are unchanged.
**Code.** `game.js`: `showFail()`, `FAIL` copy (title plus one sentence), pointerdown handler (`state === 'failed'`
starts `beginRound()` after the guard), `__omt.back()`, keydown Escape; `render.js`: `drawFailMark()` adds the halo;
`style.css`: new `k-fail` overlay kind positioned top or bottom.

### 4. Kit legibility guard

**Problem.** Fixtures 41, 57 and 60 (the cup final) pair a near-white with a near-black. The banded rim becomes a
black-and-white patchwork the size of the ball, next to the ball.

**Change.**
- In `render.js` `setKit()`: when one kit colour has luminance above 0.8 and the other below 0.05, draw the base in the dark
  colour and the banded rim in silver `#B8BEC6`, with six wide bands instead of fourteen narrow ones.
- A kit check script in `tools/` for the campaign team: warn on near-white with near-black, and on any colour within 3:1 of
  the felt. They own the kits; this gives them a rule rather than an edit.
- Add to `ART_DIRECTION.md`: "Their figures always keep the banded rim; ours always keep the solid rim and number. Teams
  separate by shape, not only colour."

**Before.** `/home/claude/shots/design-24-L60-f12.png`
**Mockup.** `/home/claude/shots/design-mock-08-kits.png` (`mock-08-kits.html`, includes a deuteranopia check)
**Effort.** S. **Risk.** None to play. Coordinate with the campaign team so the guard and their kit choices agree.

### 5. Options and pause: fewer boxes, two accessibility settings, the small fixes

**Problem.** Options is seven identical shadowed boxes and two paragraphs; pause is six full-width controls. Slow aim
borrows the book icon, practice drills the retry icon, the privacy row renders lighter. No text size control; reduce
motion only through the phone.

**Change.**
- Options as four grouped lists (Sound and feel; Play; Help; Your progress), one shadow per group, dashed rules between
  rows. Slow aim explains itself in one line in its row ("Time slows while you aim. Best: two stars.") with a stopwatch
  icon.
- New: Text size (Standard / Large: reading text and labels x1.2, canvas tags and squad numbers x1.15) and Reduce motion
  (Phone / On).
- Pause: the live player and his full tip, Resume, then Restart move and Fixtures, then three icon buttons (sound,
  vibration, how to play) instead of three full rows.
- Copy pass: keep one programme joke on the cover; header strips elsewhere say what the page is ("Options", "Build 0.4.0").
- Small fixes from the review: `IC.clock` drawn; privacy row weight; replay HUD clock frozen at the finished time (also in
  change 8); last-fixture result button reads "Fixtures" not "Next fixture"; receive buzz 8ms to 14ms.

**Before.** `/home/claude/shots/design-19-options.png`, `/home/claude/shots/design-37-pause-inplay.png`
**Mockup.** `/home/claude/shots/design-mock-07-options-pause.png` (`mock-07-options-pause.html`)
**Effort.** S for layout and fixes, M with text size (CSS custom property for the scale plus `numPx` and `tagFont` in
`render.js` `computeView()`).
**Risk.** None. Check Large text at 360x640 for clipping with the existing audit script.
**Code.** `game.js` `showOptions()`, `showPause()`, `toggle()`, `IC`; `style.css` `.rows`, `.rowbtn`, new `.list`;
`render.js` `reduced` reads the in-game setting as well as the media query.

### 6. The first minute

**Problem.** About seven interstitial taps before fixture 1: cover, a brief page before each drill (two sentences on an
empty page), the practice-complete sheet, the fixture 1 brief. In drills the HUD says "Player 1 of 1 · Striker", the rewind
button is a dashed ghost, the clock row is blank (hidden, against the owner's rule), and a miss raises a toast while the
coach card repeats the original instruction.

**Change.**
- No brief pages between drills: Kick off on the cover goes straight to drill 1; the coach card is the brief.
- The HUD in drills: "Drill 1 · Shoot", four progress pips, Skip where rewind and retry sit in a match.
- The clock row is shown: in drills it counts up in sky blue and never runs out. The layout is identical to a match, so
  nothing moves when fixture 1 starts.
- A miss rewrites the coach card ("Wide. Just past the post. Aim a little inside it and go again.") instead of adding a
  toast.
- Practice complete goes straight into the fixture 1 brief (change 9), whose button says Kick off.

**Before.** `/home/claude/shots/design-02-practice-brief.png`, `/home/claude/shots/design-03-practice-ready.png`,
`/home/claude/shots/design-61-practice-03.png`
**Mockup.** `/home/claude/shots/design-mock-10-first-run.png` (`mock-10-first-run.html`)
**Effort.** S-M. **Risk.** None: drill rules and the engine are unchanged.
**Code.** `game.js` `startPractice()`, `pracMiss()`, `pracDone()`, `hud()` drill branch; `style.css` remove
`#play.prac #clock` hiding.

---

## Bigger moves

### 7. Compact HUD with the team sheet

**Problem.** The HUD is 142px, plus a 64px strip the camera keeps clear at the top of the pitch, plus the 108px bar: 37% of
a 390x844 screen and 49% of a 360x640 screen are not pitch. "Player 2 of 4 · Creator" tells the player a number, not the
move.

**Change.**
- HUD 84px in two rows. Row one: pause, the team sheet, redo, retry. Row two: the clock row exactly as now (score and
  minute, bar with pass marks, seconds).
- The team sheet is the move in figure bases: recorded players greyed with a tick, the live one large in the mustard ring,
  the ones to come dashed, decoys in sky. The role name moves to the round-start card and pause.
- Disabled redo on the first player: hidden rather than a dashed ghost (keep its slot so nothing shifts).
- With changes 1 and 2 the pitch gains 78px. On tall phones that is breathing room above the goal; on a 360x640 phone the
  cloth fills the width and figures grow 23%.

**Before.** `/home/claude/shots/design-24-L20-f03.png`, `/home/claude/shots/design-53-small-play-ready.png`,
`/home/claude/shots/design-asset-360-current.png`
**Mockup.** `/home/claude/shots/design-mock-01-play.png` (`mock-01-play.html`) and
`/home/claude/shots/design-mock-01b-small-phone.png` (`mock-01b-small-phone.html`, real renders at the new sizes)
**Effort.** M. **Risk.** Low. The camera re-fits to the new stage size automatically (`computeView()`); the redo and retry
buttons keep their place. Re-run the bots on all 60 fixtures and the layout audit at 360x640 and 430x932.
**Code.** `index.html` `#hud`; `game.js` `hud()`, `hudReplay()`; `style.css` `#hud`, `.hud-row`, `#who`, `#clock`.

### 8. The replay as the reward

**Problem.** The replay, the promise on the store listing, plays under the result sheet with its bottom 40% hidden, inside
a HUD with dashed-out buttons and a live-looking clock counting down.

**Change.**
- After the GOAL stamp, one full-height loop of the move: the HUD becomes a replay ribbon ("Full-time replay", the fixture,
  and the clock row frozen at the finished move time). The control bar slides away. Tap to skip.
- In the replay only, the last 0.4s before the ball crosses the line plays at half speed. This never touches live play;
  the owner's objection to slow motion is about aiming, and this is a broadcast replay.
- Then the result card stamps in over the looping replay: old score struck through, new score large with the minute, stars,
  the move time with "Third star at 4.8s", "Take 3" as a neutral count, and the three buttons.
- To protect the retry loop: the full replay plays on a first win or a new best; on other wins the card arrives at once
  over the looping replay.
- The score chip flips at the moment of the GOAL stamp (not 650ms later), with the goal haptic.

**Before.** `/home/claude/shots/design-13-result-L01.png`, `/home/claude/shots/design-15-result-L04.png`
**Mockup.** `/home/claude/shots/design-mock-04-replay.png` (`mock-04-replay.html`)
**Effort.** M. **Risk.** None: the replay sim (`rsim`) is already separate from play.
**Code.** `game.js` `onGoal()`, `showGoal()`, `hudReplay()`, the `goal` branch of `frame()` (replay tempo near the line);
`style.css` new replay ribbon, result card.

### 9. The brief as a printed line-up

**Problem.** The brief is a title, one sentence and a row of discs, then half a screen of empty paper. The player meets the
defence for the first time after Kick off. The story's per-fixture `line`, written for all 60, is shown nowhere.

**Change.**
- A printed diagram of the starting positions in the cover-art style: the box, their figures with banded rims, the keeper,
  ours numbered by order of play. Positions only, no runs: it tells the player where things are, not what to do. Drawn as
  SVG from `level.att`, `level.def` and the kit, so it works for every fixture the campaign team builds.
- Under it, the order as a legend: order number, base in kit colours, role.
- The story `line` as one small italic sentence under the instruction.

**Before.** `/home/claude/shots/design-04-brief-L01.png`, `/home/claude/shots/design-23-brief-L45.png`
**Mockup.** `/home/claude/shots/design-mock-05-brief.png` (`mock-05-brief.html`)
**Effort.** M. **Risk.** None. It reveals nothing the pitch does not show at kick-off.
**Code.** `game.js` `showBrief()` plus a small `lineupSvg(level)`; `style.css` `.brief`.

### 10. Home, one season at a time

**Problem.** Home is a scroll of 60 near-identical ticket stubs and 52 dotted links; the eight seasons of the story are
just headings.

**Change.**
- Finished seasons fold into one card with a stamp ("Survived" for season 1; the campaign team supplies one word per
  season in story.js, with "Complete" as the fallback). Tap to unfold for star chasing.
- The current season is the page: name, competition, an eight-box progress strip.
- The next fixture is the hero ticket with its match situation ("Matchday 1 · 54′ · 0-0").
- The rest of the season as small stubs, two to a row; no dotted path.
- Each locked season is one dashed card with its condition; the far future is one line.
- The cover keeps "Price: nothing"; the home strip names the club instead.

**Before.** `/home/claude/shots/design-22b-home-scrolled.png`, `/home/claude/shots/design-14-home-after-1.png`
**Mockup.** `/home/claude/shots/design-mock-06-home.png` (`mock-06-home.html`)
**Effort.** M. **Risk.** None. Keep the seven-tap tester unlock on the title.
**Code.** `game.js` `showHome()`, `ticketHtml()`, `chapters()`; `style.css` home section. Needs one optional field from
the campaign team (`season stamp`), read with a fallback.

### 11. Game feel: one beat per moment

**Problem.** Each moment has the right effect at too low a volume. A shot is a chalk ring and a small camera kick; a first
touch is a faint ring; the net does not move.

**Change.** One cue table in code (moment, hold, sound, haptic) and these additions:
- Receive: the live ring snaps 12% larger for 90ms; touch haptic 14ms.
- Pass and shot: a render-only hold of 30ms (pass) and 50ms (shot) as the ball leaves; a chalk streak behind shots only.
- Keeper save: hold 60ms on the dive, glove sound.
- Tackle: hold 80ms on the foot meeting the ball before the fail card; the beaten figure rocks on its base.
- Offside: freeze on the frame the pass was played, the line drawn across the pitch.
- Goal: the net bulges where the ball hit and swings back over 400ms.
- Reduce motion drops holds, camera kicks and the replay slow-down; sounds and haptics stay.

**Before.** `/home/claude/shots/design-32-shot-f05.png`, `/home/claude/shots/design-32-shot-f08.png`,
`/home/claude/shots/design-12-L01-goalstamp.png`
**Mockup.** `/home/claude/shots/design-mock-09-juice.png` (`mock-09-juice.html`)
**Effort.** M. **Risk.** Medium, and the reason this is not a quick win: every hold must be render-only. The sim must keep
stepping at fixed ticks and the clock must not lose the held time, or recordings, bot results and par times shift.
Implement holds as a render-side freeze of the drawn state while `frame()` keeps feeding `FB.step()`, or as a pause of both
sim and clock that is subtracted from `sim.tick`; prove it by running all 60 bots before and after and comparing finished
move times to the tick.
**Code.** `render.js` `events()`, `drawFx()`, `drawGoal()`, `drawFailMark()`; `game.js` `frame()`, `sounds()`;
`audio.js` haptic lengths.

### 12. Recorded sound and a goal sting

**Problem.** Every sound is synthesised. The whistle is convincing; the pass and the touch, the two sounds heard most, are
tuned blips. Menus are silent.

**Change.**
- Recorded, licence-clear foley for six sounds: boot light, boot heavy, touch, glove, net, crowd bed (CC0 or a bought
  sports pack; keep the licence file in the repo). Short Ogg/Opus with an AAC fallback for iOS, about 300-500 KB in all.
- One brass-band sting for a goal (two to three seconds) and a quiet ambience on the home screen (distant crowd, a tea urn,
  rain on a tin roof), off when sound is off.
- Keep the synthesised versions as the fallback if a file fails to load, and for the interface clicks, which already work.
- Haptics as in the cue table (change 11).

**Before.** No screenshot: `one-man-team/js/audio.js`.
**Mockup.** The cue sheet panel in `/home/claude/shots/design-mock-09-juice.png`.
**Effort.** L, mostly sourcing and mixing. **Risk.** None to play. Adds download weight and an offline-cache entry in
`sw.js`; check the app shell bundles the files.
**Code.** `audio.js` (buffer loader, same `SFX` interface so callers do not change), `sw.js`, `app/` asset list.

---

## Order of work

1. **Play screen** (changes 7, 1, 2) as one release, then 3. These touch the same elements and are what the owner sees
   most.
2. **Feel** (11, then 12), on a real Android phone, with the bot comparison as the gate for 11.
3. **Reward** (8).
4. **Around the game** (6, 9, 10, 5, 4).

Each step ends with: the 60-fixture bot run, the layout audit at 360x640 and 430x932 (no clipping, no target under 48px,
nothing overlapping the pitch), and a screenshot set for the owner.

## Coordination with the campaign team

- No level files or story.js edits. Two requests to them: avoid near-white with near-black kits (change 4 gives them a
  check script), and optionally add a one-word stamp per season (change 10).
- Changes 7 and 9 read `order`, `att`, `def`, `kit` and `story` exactly as today, so they work with whatever levels land.

## Decisions for the owner

1. Approve the play-screen layout (mock 01, 02): the tip leaves the HUD and appears before each player instead.
2. Drag-to-retry after a failure (mock 03): yes or no.
3. Half-speed last 0.4s in the goal replay only (mock 04). This is not slow motion in play; say if you want it out anyway.
4. Budget for recorded sound (change 12): a bought pack is the fastest route to a professional result.
5. Home folding (mock 06): the one change that alters how progress is browsed.
