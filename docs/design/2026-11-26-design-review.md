# One-Man Team: design review (26 November 2026)

Senior design pass by product design, UI/UX, game feel and art direction, on the single-file build at
`/home/claude/game/index.html` (build 0.4.0, 60 fixtures). The plan that follows from it is
`docs/design/2026-11-26-design-plan.md`.

Standing constraints respected throughout: the name stays One-Man Team, the clock stays visible everywhere, slow aim is an
optional setting only, training drills (the parked mode) are out of scope, and no live game file was edited.

## How we played it

- First launch from an empty save at 390x844 (a 6.1-inch phone): the programme cover, the four practice drills, the
  practice-complete sheet, the fixture 1 brief, fixture 1 by hand (run, aim, pass, then the striker), a deliberate failure,
  pause.
- The scripted bots from `tools/bots.js` through fixtures 1 to 5, 20, 45 and 60, with frame captures every 120ms during
  play, the GOAL stamp, the result sheet and the replay. Season 1 completed to reach the end-of-season report.
- Bot scripts altered on purpose to provoke each failure: offside (fixture 2), keeper save (fixture 1), interception
  (fixture 2), tackle (fixture 5), and eight failures in a row on one player to trigger the slow-aim offer.
- Home after one fixture, after one season, and with all 60 unlocked and scrolled; a locked ticket tapped; Options, How to
  play, reset dialog.
- The same flows at 360x640 (a small Android phone, the most common budget size) with reduced motion forced on.
- An automated audit of touch targets, clipped text and font sizes; WCAG contrast of the palette pairs.

No console errors in any run. All screenshots are `/home/claude/shots/design-*.png`; the ones cited below are named.

## Verdict

The identity is right and it is the game's biggest asset: the felt, the weighted figures, the printed programme, the GOAL
stamp and the score chip ticking over all read as made by someone with taste, not assembled from a kit. We would not change
it. What lets it down is volume, not style. The play screen spends more than a third of a tall phone, and half of a small
one, on frames and words around the pitch; three different text sources talk at once; every failure throws a sheet over the
place where the move broke down; and the moments that should hit hardest (a shot, a goal, the replay of a move you built
yourself) are quiet and partly hidden. Fix those and it will feel professionally made. Most of the work is subtraction.

## What works (keep it)

1. **The cover.** The huge Anton title with the tomato offset, the felt diagram of an 8-to-9 move, one line of promise.
   It looks like a product. (`design-01-cover.png`)
2. **The figures.** Weighted bases, shirts and heads seen from above, a banded rim for the opposition so they never read as
   ours, a mustard ring on the live player, squad numbers that stay legible. The keeper in mustard. The beaten defender
   falling flat with his arms out is a lovely detail. (`design-24-L20-f03.png`)
3. **The pass target.** The dashed ghost of the receiver with a "PASS TO 9" paper tag tells a first-timer exactly where the
   ball should go without a word of instruction. (`design-05-L01-ready.png`)
4. **The offside tag and line**, drawn like a linesman's chalk with a small printed label. (`design-09-L01-after-pass.png`)
5. **The GOAL stamp and the score chip.** The stamp lands with weight, confetti in kit colours, and the minute-and-score
   chip flips from 0-0 to 1-0. That chip is the best bit of storytelling in the game. (`design-12-L01-goalstamp.png`)
6. **The season report.** Rosette, "Season complete" ink stamp, stars per fixture, one dry line from the gaffer.
   (`design-16-season-complete.png`)
7. **The story.** 60 fixtures with real opponents, minutes and scores ("119′ 3-3, Amateur Cup final") give every move a
   reason. Few casual football games bother.
8. **Basics done properly**: self-hosted fonts with tuned fallbacks, no layout jump, hard-shadow buttons that collapse on
   press, a focus ring, keyboard control, haptics routed through the native shell, the OS reduce-motion setting honoured,
   every touch target at least 48px (the audit found none smaller at 360x640).

## Issues, ranked

Ranked by combined impact on how professional it feels and on fun. H/M/L per axis.

| # | Issue | Professional | Fun | Evidence |
| --- | --- | --- | --- | --- |
| 1 | The play screen is mostly frame: HUD 142px, a 64px strip reserved at the top of the pitch for overlays, control bar 108px. 37% of a 390x844 screen and 49% of a 360x640 screen are not pitch. On small phones the cloth is letterboxed on wood and figures shrink. | H | H | `design-05-L01-ready.png`, `design-53-small-play-ready.png`, `design-57-small-play-L45.png` |
| 2 | Three text sources compete during play: the tip line in the HUD (two lines, all move long), the "You are the 8. Move to start the clock" chip, and on fixtures 1-4 a coach card at the top. Plus toasts ("No. 8 recorded") that land at the bottom of the pitch, on the passer and the ball. | H | M | `design-09-L01-after-pass.png`, `design-24-L60-f01.png` |
| 3 | The fail sheet covers the bottom 40% of the pitch, usually where the move broke down, and the only way back in is a button. The retry loop is the game (the owner replayed one fixture 20+ times); every failure costs a read and a reach. | M | H | `design-36-fail-tackled.png`, `design-10-fail-sheet-L01.png` |
| 4 | Moment-to-moment feedback is the right vocabulary at too low a volume: a small chalk puff and camera kick on a shot, a faint ring on a first touch. No hit-stop, no net movement, no shot trail. On a phone in a hand it barely registers. | H | H | `design-32-shot-f05.png`, `design-32-shot-f08.png` |
| 5 | The replay, the payoff the store listing promises ("then watch the whole team play it"), runs under the result sheet with its bottom 40% hidden, inside a HUD that still shows dashed-out retry buttons and a clock counting down that means nothing. | M | H | `design-13-result-L01.png`, `design-15-result-L04.png` |
| 6 | All sound is synthesised in Web Audio: sine sweeps for the boot, filtered noise for the crowd and net. The whistle is convincing; the kick and the touch sound like a game made by a programmer. No music or ambience on any menu: the home screen is silent. | H | M | `one-man-team/js/audio.js` |
| 7 | First run has about seven interstitial taps before fixture 1: cover, a brief page per drill (two sentences on an otherwise empty page), the practice-complete sheet, the fixture 1 brief. In the drills the HUD says "Player 1 of 1 · Striker", the rewind button is a dashed ghost, the clock row is a blank band (hidden, against the owner's rule that it stays visible everywhere), and a miss produces a toast at the bottom while the coach card at the top repeats the original instruction. | M | H | `design-02-practice-brief.png`, `design-03-practice-ready.png`, `design-61-practice-03.png` |
| 8 | The brief page is a title, one sentence and a row of discs, then half a screen of empty paper. The player first sees the defence after pressing Kick off. The story's per-fixture `line` (written for all 60 in story.js) is not shown anywhere. | M | M | `design-04-brief-L01.png`, `design-23-brief-L45.png` |
| 9 | Home is a single scroll of 60 near-identical ticket stubs joined by 52 dotted squiggles. Seasons are headings in a list; locked tickets look like disabled form fields. | M | L | `design-22b-home-scrolled.png`, `design-14-home-after-1.png` |
| 10 | A few opposition kits pair near-white with near-black (fixtures 41, 57 and 60, the cup final). The banded rim then becomes a black-and-white patchwork the size of the ball, beside the ball. | M | M | `design-24-L60-f12.png` |
| 11 | Options is seven identical shadowed boxes and two paragraphs; pause is six full-width controls. Every row looks equally important. The slow-aim row borrows the book icon (the clock icon does not exist), "Practice drills" uses the retry icon, and "Privacy policy" renders in a lighter weight than its neighbours because it is a link. | M | L | `design-19-options.png`, `design-37-pause-inplay.png` |
| 12 | Accessibility gaps: no text size control (all sizes in px; the viewport blocks zoom, as games usually do, so there is no other route), reduce motion only through the phone's setting, several labels at 12px. | M | L | audit below |
| 13 | Copy: the dry programme jokes are stacked on every page header ("Price: nothing", "Club office / Open all hours", "Laws of the game / Abridged"). Lovely once; on every screen they start to read like generated whimsy. Explanations are sentences where a number would do ("A move of 4.8s or quicker earns the third star. Take as many goes as you like."). | M | L | `design-13-result-L01.png`, `design-19-options.png` |

## Information overload

The owner's complaint holds, and it is concentrated on the play screen rather than the menus.

- During a move the player can be shown, at once: role and player count, score and minute, clock bar, seconds, a two-line
  tip, a coach card, a "Held" or "You are the 8" chip, a toast, the pass-target tag, the offside tag, and on early fixtures
  two written control hints in the bottom bar. Only the clock, the ball, the live ring, the target and the offside line
  matter while both thumbs are down.
- The tip line is the single biggest waste: 38px on every player of every fixture, saying something the player read once.
- After fixture 2 the left half of the control bar is empty on every move (the written hints are hidden, the space is not
  reclaimed). (`design-24-L45-f04.png`)
- Menus are lighter than they look; the overload there is visual (every row boxed and shadowed) rather than informational.

## Readability on a phone

- Figures are legible at 390 wide on every fixture we sampled, including the five-player fixture 60. At 360x640 they shrink
  by about a fifth because the camera runs out of height (`design-57-small-play-L45.png`). Giving the pitch back the HUD's
  spare height fills the width and makes figures 23% larger (`design-mock-01b-small-phone.png`).
- Colour contrast of the palette is sound where it matters: chalk on felt 4.8:1, ink on mustard 8.8:1, ink-soft on paper
  6.2:1, ink on tomato 4.3:1 (passes for the large bold button labels it is used for). Tomato on felt is only 1.4:1, so our
  figures rely on their ink outline and paper deck; they have both, and that must not be lost.
- Squad numbers on the canvas never drop below 11px. The paper tags ("PASS TO 9") are 11-13px; fine.
- HUD labels "Player 1 of 4" and the control hints are 12px, below a comfortable minimum for glancing mid-action.
- The black-and-white kits (issue 10) are the one real legibility failure on the pitch.

## Touch targets and reach

- Every button is at least 48x48px at 360x640; the kick button is 88px. No problems with size.
- Drag-to-run works anywhere on the play screen outside buttons, which is generous and correct.
- Retry and redo sit top right. With two thumbs on the glass during play that is fine; between attempts it is a reach on a
  tall phone, which is one more reason to let a drag start the next take (plan, change 3).

## Feedback and juice, moment by moment

| Moment | What happens now | What is missing |
| --- | --- | --- |
| Run | Floating stick appears under the thumb; the live ring pulses gently. | Fine. |
| Aim | A dotted aim line with an end ring; the kick button fills mustard as power builds; a large aim stick. | The aim stick (128px) covers the bottom right of the pitch. Acceptable; the line on the pitch is what the eye follows. |
| Pass | Three chalk strike marks, a small camera kick, a sine "boot" tone, 10-24ms buzz. | Weight. A 30ms hold on contact would sell it. |
| Receive | A faint expanding chalk ring, a soft tone, 8ms buzz (under the threshold many Android motors can render). | A snap of the live ring and a firmer, recorded touch. |
| Shot | A chalk ring off the boot, a bigger camera kick, the crowd swells as the ball travels. Since the shot-pace fix it is fast. | Hit-stop on contact, a streak behind the ball. |
| Keeper save | Starburst at the keeper, "ooh", a downward camera kick. | A glove sound, the keeper's dive held for a beat. |
| Tackle | Tomato starburst, thud, camera kick, then the sheet slides over it. | A brief freeze before the sheet, and the sheet not covering it. |
| Offside | Whistle, line and runner shown. | Freeze at the moment the pass was played, which is when offside is judged. |
| Goal | Ball carried into the net, confetti, GOAL stamp, crowd roar, buzz pattern, score chip flips 650ms later. | The net does not move. The score flip arrives late, after the stamp has already peaked. No musical sting. |

## Audio

All effects are synthesised (`one-man-team/js/audio.js`). The work is careful: a compressor, layered noise, a whistle with a
rattling pea, a crowd bed that swells on the decisive shot. But synthesis gives itself away in the two sounds heard most
often, the pass and the touch, which come out as tuned blips. There is no music and no ambience anywhere, so menus are
silent and the jump into play is abrupt. Interface taps are a soft paper click, which is right.

Recorded foley for six sounds (boot light, boot heavy, touch, glove, net, crowd bed) plus one short brass sting for a goal
would lift perceived quality more than any visual change of the same size. Plan, change 12.

## Haptics

Patterns exist for every event and are routed through the native shell in the app, which is the correct design. Two notes:
the 8ms receive buzz is too short to be felt on many Android phones (use 12-15ms), and the goal pattern fires at the same
time as the 650ms-late score flip, so the strongest haptic does not line up with the strongest visual.

## Accessibility

- Colour: our team and theirs separate by shape (solid rim and number against banded rim), not just colour. Under simulated
  deuteranopia tomato converges with the claret, plum and brown kits, but the shapes still separate them
  (`design-mock-08-kits.png`). This must stay a rule.
- Text size: no in-game control and no zoom. Add Standard / Large.
- Motion: the OS setting is honoured by CSS and by the camera kick. Add an in-game switch, because many players never find
  the OS one.
- Sound: every sound has a visual counterpart, so the game is fully playable muted.
- Keyboard and focus: supported. The Escape key does nothing on the fail sheet.
- Screen readers: buttons are labelled and the score has aria-live; the pitch itself is not described, which is acceptable
  for this genre.

## Loading and first run

- Loading is not a problem: the single-file build paints the cover within 50ms from disk, fonts are self-hosted, the app
  shell shows a paper-coloured splash with the icon.
- The first run is the problem, as issue 7 describes: about seven interstitial taps and three empty or half-empty pages
  before fixture 1, and a drill screen that looks like a broken match screen. The four drills themselves are good.

## Consistency with the art direction

Mostly faithful: palette, type scale, 2px ink borders, hard shadows, no glow, no emoji, custom SVG icons. Where it drifts:

- "Every state designed": the disabled HUD buttons are dashed ghost boxes on the first player of every move, which read as
  placeholders rather than a designed disabled state.
- "Nothing overlapping": the "No. 8 recorded" toast sits on the passer and the ball at the bottom of the pitch when the
  coach card is at the top.
- "Legibility beats decoration": the black-and-white kits.
- "Transitions between screens rather than hard cuts": the move from the GOAL stamp to the result sheet is a cut to a sheet.
- "The first ten seconds teach the game without a wall of text": the drill brief pages are small walls of text on empty
  pages.

## What looks amateur or AI-made

Not the art. The tells are structural:

1. **Box soup.** Every element is a 2px bordered box with a 3px hard shadow: option rows, pause rows, sheets, cards, tags.
   When everything is raised, nothing is. Hierarchy comes from grouping and from choosing what not to box.
2. **Pages designed for content that is not there.** The brief, the drill briefs and the season report all end in half a
   screen of empty paper.
3. **Sentences where a designed element would do.** The star verdict, the slow-aim paragraph, "what happened" plus "try"
   on every failure.
4. **The same joke on every header strip.** One per screen, every screen, is a pattern a person would have edited out.
5. **Synthesised blips** for the most frequent sounds.
6. **Sixty identical tickets.** Repetition at scale without a change of rhythm.
7. **Small inconsistencies that a style pass would catch**: borrowed icons, a lighter link row, a "Next fixture" button on
   the last fixture.

## Bugs found while reviewing

1. **Android back on a fail sheet discards the move.** `__omt.back()` only pauses in the `play` and `ready` states; in
   `failed` (and `brief`, `goal`) it calls `showHome()` with no confirmation, losing every recorded player. It should open
   pause. (`one-man-team/js/game.js`, `back()`)
2. **The replay HUD keeps a live clock.** During the action replay the bar and seconds run as if the move were live
   (13.5, 14.3 in `design-13-result-L01.png`, `design-15-result-L04.png`).
3. **Last fixture result offers "Next fixture".** When fixture 60 is won before the earlier ones, the card says "Earlier
   fixtures still to win" and the primary button is labelled "Next fixture" but goes home. (`design-25-result-L60.png`)
4. **Escape on the fail sheet does nothing** (it looks for buttons the sheet does not have).
5. **Slow-aim row uses the book icon** (`IC.clock` is undefined, falls back to `IC.book`).
6. **Privacy policy row is lighter** than the other option rows (anchor, not button, misses the label weight).
7. **Toast collides with play**: "No. 8 recorded" lands over the passer and ball when the coach card is at the top
   (`design-09-L01-after-pass.png`).
8. **Practice hides the clock** (`#play.prac #clock { visibility: hidden }`), contrary to the owner's standing rule.
9. **The fixture `line` from story.js is never displayed.**

## Screens captured

Cover `design-01-cover.png`; practice brief and drill `design-02-practice-brief.png`, `design-03-practice-ready.png`,
`design-61-practice-*.png`; fixture brief `design-04-brief-L01.png`, `design-23-brief-L05.png`, `-L20`, `-L45`, `-L60`,
`design-38-brief-L04-decoy.png`; play `design-05` to `design-09`, `design-24-L05/L20/L45/L60-f01..f14.png`,
`design-35-dribble-*.png`, `design-39/40-L04-decoy-*.png`; failures `design-10-fail-sheet-L01.png`,
`design-30-fail-offside.png`, `design-31-fail-slowaim-offer.png`, `design-33-fail-saved.png`,
`design-34-fail-L2-first.png`, `design-36-fail-tackled.png`; pause `design-11-pause.png`, `design-37-pause-inplay.png`;
goal and result `design-12-L01-goalstamp.png`, `design-13-result-L01.png`, `design-13b-result-L01-replay.png`,
`design-15-result-L04.png`, `design-25-result-*.png`; season `design-16-season-complete.png`; home
`design-14-home-after-1.png`, `design-17-home-season2.png`, `design-18-home-locked-note.png`, `design-22-home-unlocked.png`,
`design-22b-home-scrolled.png`; options and help `design-19-options.png`, `design-20-how-to-play.png`,
`design-21-reset-dialog.png`; small phone with reduced motion `design-50` to `design-58`.
