# One-Man Team: Google Play listing, updated

Written 21 November 2026. This replaces the **full description** in `docs/marketing/play-store-listing.md`, which
was written the same morning for a 20-fixture game without practice drills or slow aim. Everything else in that
document still stands and is not repeated here: the reasoning for the title, the category (Sports), the tags, the
content-rating expectations, the keyword notes and the Pass to Yourself alternative.

Lengths were counted by `python3 scripts/count-listing.py`, which fails if a text is over its limit or a number
printed here is stale.

## READ FIRST

- **"60 fixtures" is not yet true.** The game loaded 44 when this was written. Run
  `python3 scripts/count-listing.py --strict` before publishing; it fails until the game really loads 60.
- **"No adverts, no purchases" and "Plays without a connection"** are true for this build only. Delete those two
  lines in the release that adds adverts or a purchase, and confirm the second on a real phone in aeroplane mode
  before publishing (the store build has no INTERNET permission, which could not be tested here).

## Title (unchanged)

<!-- count:play_title limit=30 unit=chars -->
```text
One-Man Team: Football Puzzle
```

**29 of 30 characters.**

## Short description (unchanged)

<!-- count:play_short limit=80 unit=chars -->
```text
Play the pass, rewind, then run onto it yourself. One goal, player by player.
```

**77 of 80 characters.**

## Full description (updated)

<!-- count:play_full limit=4000 unit=chars -->
```text
One-Man Team is a football game about a single attacking move, and you play every part in it.

First you are the passer. Play the ball into space. Then the clock rewinds and you are the team-mate running onto that pass, while your first player repeats exactly what you recorded. Then the next player, and the next, up to five, until the last one scores.

The defenders are not recorded. They react live to every run, so each new player changes the picture. A decoy can drag a centre-back out of the way. It can also wreck a pass you were pleased with two rounds ago.

HOW IT PLAYS
• One fixture is one move, 5 to 15 seconds long.
• Portrait, two thumbs. One thumb runs. The other aims and sets the power, so you can pass at an angle while running.
• Lose the ball, stray offside, run into an earlier version of yourself or run out the clock, and you replay that one player, not the whole move.
• Some players never touch the ball. Their whole job is to move a defender.
• You can be caught offside by your own earlier pass. It is as annoying as it sounds.

START WITH THE DRILLS
Four short practice drills come before the first fixture: shoot, run and shoot, pass, and the rewind. Nothing in them can be failed. Miss, and you simply go again.

THE REPLAY
When the last player scores, the whole move plays back with every run drawn on the pitch. All of it is yours, including the bits that looked like luck.

A CAREER OF MATCH MOMENTS
• 60 fixtures: through balls, cut-backs, overlaps, third-man runs, corners, free kicks, counter-attacks and moves to break a low block.
• Retry as often as you like. Retries cost nothing and count for nothing. Stars are for how quick the finished move is.
• Finding one tough? Switch on slow aim in Options and time slows for a moment while you aim. The third star needs it switched off.
• Short enough for a bus stop. Awkward enough to keep you there after the bus has gone.

HOW IT LOOKS
Tabletop football figures on a felt pitch, with menus printed like a matchday programme: cream paper, navy ink and ticket stubs for fixtures. Squad numbers you can read in sunlight.

GOOD TO KNOW
• No adverts, no purchases, no account. Nothing is collected and progress stays on your device.
• Plays without a connection.
• No real clubs, leagues or players. The football is the point.
• No match engine deciding things behind your back. If the pass was bad, it was your pass.
• Made by one person in Johannesburg, which is at least on theme.
```

**2466 of 4,000 characters.**

It is the same text as the App Store description, so the two stores never disagree. The table of what changed and
why is in `app-store-listing.md`. Two points are specific to Google:

- The word "free" does not appear. "Retries cost nothing and count for nothing" says it without a word Google's
  listing guidance treats as price language.
- "No adverts, no purchases, no account" is a statement about the app, not a comparison with other apps, which the
  same guidance asks listings to avoid.

## English (United States) translation

<!-- count:play_title_us limit=30 unit=chars -->
```text
One-Man Team: Soccer Puzzle
```

**27 of 30 characters.**

<!-- count:play_short_us limit=80 unit=chars -->
```text
Play the pass, rewind, run onto it yourself. One soccer goal, player by player.
```

**79 of 80 characters.**

<!-- count:play_full_us limit=4000 unit=chars -->
```text
One-Man Team is a soccer game about a single attacking move, and you play every part in it.

First you are the passer. Play the ball into space. Then the clock rewinds and you are the team-mate running onto that pass, while your first player repeats exactly what you recorded. Then the next player, and the next, up to five, until the last one scores.

The defenders are not recorded. They react live to every run, so each new player changes the picture. A decoy can drag a center back out of the way. It can also wreck a pass you were pleased with two rounds ago.

HOW IT PLAYS
• One fixture is one move, 5 to 15 seconds long.
• Portrait, two thumbs. One thumb runs. The other aims and sets the power, so you can pass at an angle while running.
• Lose the ball, stray offside, run into an earlier version of yourself or run out the clock, and you replay that one player, not the whole move.
• Some players never touch the ball. Their whole job is to move a defender.
• You can be caught offside by your own earlier pass. It is as annoying as it sounds.

START WITH THE DRILLS
Four short practice drills come before the first fixture: shoot, run and shoot, pass, and the rewind. Nothing in them can be failed. Miss, and you simply go again.

THE REPLAY
When the last player scores, the whole move plays back with every run drawn on the pitch. All of it is yours, including the bits that looked like luck.

A CAREER OF MATCH MOMENTS
• 60 fixtures: through balls, cut-backs, overlaps, third-man runs, corners, free kicks, counter-attacks and moves to break a low block.
• Retry as often as you like. Retries cost nothing and count for nothing. Stars are for how quick the finished move is.
• Finding one tough? Switch on slow aim in Options and time slows for a moment while you aim. The third star needs it switched off.
• Short enough for a bus stop. Awkward enough to keep you there after the bus has gone.

HOW IT LOOKS
Tabletop soccer figures on a felt pitch, with menus printed like a matchday programme: cream paper, navy ink and ticket stubs for fixtures. Squad numbers you can read in sunlight.

GOOD TO KNOW
• No adverts, no purchases, no account. Nothing is collected and progress stays on your device.
• Plays without a connection.
• No real clubs, leagues or players. The soccer is the point.
• No match engine deciding things behind your back. If the pass was bad, it was your pass.
• Made by one person in Johannesburg, which is at least on theme.
```

**2460 of 4,000 characters.**

## Release notes for the first release

<!-- count:play_release_notes limit=500 unit=chars -->
```text
First release: 60 fixtures across the seasons, four practice drills, and an optional slow-aim setting.
```

**102 of 500 characters.**

## Graphics

| Asset | File | Format |
| --- | --- | --- |
| App icon | `app/store/play-icon-512.png` | 512 by 512, 32-bit PNG |
| Feature graphic | `app/store/feature-graphic-1024x500.png` | 1024 by 500, 24-bit PNG |
| Phone screenshots | `app/store/screenshots/android/01` to `08` | 1080 by 1920, 24-bit PNG, no alpha |

On 21 November 2026 Google's preview-assets page asked for JPEG or 24-bit PNG without alpha, each side between 320
and 3,840 pixels with the long side no more than twice the short side, up to eight per device type, at least two
to publish, and for games at least three 9:16 portrait screenshots of 1080 by 1920 or larger to be eligible for
its recommendation surfaces. Tablet and Chromebook screenshots are optional and none are supplied.

Screenshots, in upload order, with the alt text to paste (Google's limit is 140 characters; lengths are checked by
the screenshot script):

| # | File | Caption on it | Alt text | Alt length |
| --- | --- | --- | --- | --- |
| 1 | `screenshots/android/01-goal.png` | YOU PLAY EVERY PLAYER | A goal on a felt pitch with confetti, and the runs of three earlier players drawn in chalk | 90 |
| 2 | `screenshots/android/02-pass.png` | FIRST, PLAY THE PASS | The first player aims a pass with the aim line showing and the pass button held down | 84 |
| 3 | `screenshots/android/03-rewind.png` | REWIND. NOW RUN ONTO IT | A second player runs onto the pass while the first player replays his recorded part | 83 |
| 4 | `screenshots/android/04-defenders.png` | DEFENDERS REACT TO EVERY RUN | A full-back has followed the winger inside, leaving the touchline free for the overlapping runner | 97 |
| 5 | `screenshots/android/05-decoy.png` | A DECOY NEVER TOUCHES THE BALL | A decoy runner pulls his marker away while the recorded pass travels through the gap | 84 |
| 6 | `screenshots/android/06-offside.png` | MIND YOUR OWN OFFSIDE LINE | The offside line across the pitch while the striker waits for a pass from his own earlier player | 96 |
| 7 | `screenshots/android/07-replay.png` | WATCH THE WHOLE MOVE BACK | Result sheet with three stars, the move time and the number of takes, over the action replay | 92 |
| 8 | `screenshots/android/08-career.png` | THREE STARS FOR A QUICK MOVE | Fixture list of ticket stubs with stars earned, the next fixture flagged and later ones locked | 94 |

Caption 8 in `docs/marketing/store-assets-plan.md` was "THREE STARS FOR FEW RETRIES". That is no longer how the
game scores, so the image says "THREE STARS FOR A QUICK MOVE". The plan's production note about a lock emoji and
text stars on the fixture tiles is out of date: the tiles now use drawn icons.

One thing to know about the game itself, not the listing: the cover and the top of the fixture list carry the
line "Price: nothing". Google asks for no price wording in listing graphics, so screenshot 8 is scrolled to start
at the title. If the game is ever sold or carries purchases, that line needs changing in the game.

## Data safety, content rating, target audience, ads

Data safety: build 0.5.0 contains anonymous play statistics, but no statistics address is set, so the answer for this
build is still "no data collected or shared" (`app/README.md`, "Data safety answers for the current build"). The
answers for the release that sets the address (App activity, App interactions; collected, not shared; optional;
analytics; encrypted in transit; no deletion route because nothing is linked to a user) are in the next section of the
same README, with the iOS privacy manifest entry and the INTERNET permission that must change with them.

Content rating, target audience and ads: unchanged from the marketing document ("Content rating expectations"): no
adverts, expect the lowest rating band, declare 13 and over. The Daily Move share sheet is a text the player sends
themselves, not user-to-user communication inside the app.

## Sources

- Add preview assets to showcase your app (screenshot, icon and feature-graphic requirements), Google Play Console Help, read 21 Nov 2026: https://support.google.com/googleplay/android-developer/answer/9866151?hl=en-GB
- `docs/marketing/play-store-listing.md` for the limits on title (30), short description (80) and full description (4,000) and the guidance on wording, with its own sources
