# One-Man Team: App Store listing (Apple)

Written 21 November 2026, in British English, from `docs/marketing/play-store-listing.md`, `positioning.md` and
`store-assets-plan.md`, and brought up to date with the game as it is now: practice drills before fixture 1, free
retries with stars for a quick finished move, optional slow aim, and 60 fixtures.

Every length below was counted by running `python3 scripts/count-listing.py` (also `npm run check-listing`) on this
file, not estimated. The script fails if any text is over its limit or if a number printed here is stale.

## READ FIRST: three things in this document are not yet true or not yet decided

1. **"60 fixtures".** The promotional text, the description and "What's New" say 60. On the day this was written
   the game loaded 44 and the designers were still adding packs. `count-listing.py` prints the number the game
   really loads; run it with `--strict` before submitting and it fails until the number is 60. If the game ships
   with a different number, change "60" in this file and in `play-store-listing.md`.
2. **Support URL and contact address.** Apple requires a support page that leads to real contact details. The
   studio site has no contact address yet and `privacy.html` still carries a "Draft" notice. Both are yours to fix.
3. **Bundle identifier `com.ollywoodgames.onemanteam`.** A placeholder. It cannot be changed after the first build
   is uploaded. See `app/README.md`.

Not verified: search volume for any keyword (no store-optimisation tool was available), and how Apple's search
weights the fields. The keyword choices below are reasoning, not measurement.

## App name

<!-- count:ios_name limit=30 unit=chars -->
```text
One-Man Team: Football Puzzle
```

**29 of 30 characters.**

Apple's limit is 30 (App Store Connect Help, "App information"). Same wording as the Google Play title, for the
reason given there: the name alone does not say football, and "football game" would promise full matches.

## Subtitle

<!-- count:ios_subtitle limit=30 unit=chars -->
```text
Play the pass. Run onto it.
```

**27 of 30 characters.**

Shown under the name everywhere the app appears. It is the positioning document's short pitch with "Rewind" taken
out to fit, because the screenshots say "rewind" and the subtitle cannot hold all three beats.

## Promotional text

<!-- count:ios_promo limit=170 unit=chars -->
```text
Play the pass, rewind, then run onto it yourself. 60 hand-built football moves, made one player at a time while the defenders react live to every run you add.
```

**158 of 170 characters.**

This is the only text that can be changed without submitting a new version. Use it for news later; at launch it
restates the pitch. **Contains "60": see READ FIRST.**

## Keywords

<!-- count:ios_keywords limit=100 unit=bytes -->
```text
soccer,pass,tactics,offside,through ball,replay,rewind,striker,goal,skill,arcade,sports,casual
```

**94 of 100 bytes.**

Apple counts this field in bytes, separates terms with commas, and asks that the app's own name and other apps'
names are not repeated (App Store Connect Help, "Platform version information"). So:

- "football" and "puzzle" are left out because they are already in the name; "soccer" is in, because British and
  South African storefronts are also searched by people who say soccer.
- No spaces after commas (they would be counted).
- No club, league, player or competitor names.
- "offline" is left out until the app has been played in aeroplane mode on a real iPhone. If that passes, swap it
  in for "casual" and recount.

## Description

<!-- count:ios_description limit=4000 unit=chars -->
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

**2466 of 4,000 characters.** Line breaks counted as one each.

What changed from the Google Play text written this morning, and why:

| Was | Now | Why |
| --- | --- | --- |
| "One level is one move" | "One fixture is one move" | The game calls them fixtures everywhere. |
| "The left thumb runs. The right thumb aims" | "One thumb runs. The other aims" | Running is "drag anywhere", so left-handers are not excluded. |
| (nothing) | START WITH THE DRILLS | Four practice drills now come before fixture 1. |
| "Around 20 moves at launch" | "60 fixtures", with set pieces, counters and low blocks named | Packs 4 to 8. **See READ FIRST.** |
| "Retry as often as you like. Stars are for how quick the finished move is." | The same, plus "Retries cost nothing and count for nothing." | The owner asked for this to be explicit; the word "free" is avoided because Google reads it as a price claim. |
| (nothing) | The slow-aim line | New optional setting; the third star needs it off, and saying so avoids a one-star review about it. |
| (nothing) | "No adverts, no purchases, no account..." and "Plays without a connection." | True for this build. **Delete both the moment adverts or purchases ship.** "Plays without a connection" must be confirmed on a device first (see the release checklist). |

Apple shows roughly the first three lines before "more", so the first paragraph is still the whole pitch.

## What's New in This Version

Apple does not show or accept this field for the first version of an app; it becomes required from the second
(App Store Connect Help, "Platform version information"). Text for the first update, and for Google Play's release
notes now (500 characters is Play's limit as I remember it, not re-read today; the Console shows the counter):

<!-- count:whats_new_first limit=500 unit=chars -->
```text
First release: 60 fixtures across the seasons, four practice drills, and an optional slow-aim setting.
```

**102 of 500 characters.**

<!-- count:whats_new_update limit=4000 unit=chars -->
```text
More fixtures, and fixes for things you told us about. Thank you for playing.
```

**77 of 4,000 characters.**

## English (U.S.) localisation

Set the primary language to English (U.K.) and add English (U.S.) so that the U.S. storefront says soccer.

<!-- count:ios_name_us limit=30 unit=chars -->
```text
One-Man Team: Soccer Puzzle
```

**27 of 30 characters.**

<!-- count:ios_subtitle_us limit=30 unit=chars -->
```text
Pass, rewind, run onto it.
```

**26 of 30 characters.**

<!-- count:ios_keywords_us limit=100 unit=bytes -->
```text
football,pass,tactics,offside,through ball,replay,rewind,striker,goal,skill,arcade,sports,casual
```

**96 of 100 bytes.**

<!-- count:ios_description_us limit=4000 unit=chars -->
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

The promotional text for the U.S. page is the same with "soccer moves" in place of "football moves" (two
characters shorter).

## Category

- **Primary: Games, with subcategory Sports.** Same reasoning as on Google Play: it is where football searches lead.
- **Second subcategory: Puzzle**, if the form offers one (Apple's help page says subcategories exist for Games; I
  could not read how many may be chosen). Puzzle is the honest second genre and the word is already in the name.

## Pricing and availability

- Price: your decision. This build has nothing to sell, so it is listed free unless you choose to charge for it.
  A free app can later add purchases; a paid app can later become free.
- Availability: all countries and regions, unless you have a reason to hold some back.
- iPhone only. `supportsTablet` is false, so the app is not offered as an iPad app; an iPad can still run it in
  the iPhone compatibility window, and App Review may test it that way.

## Age rating answers

Apple replaced its questionnaire in 2025: the ratings are now 4+, 9+, 13+, 16+ and 18+ (App Store Connect Help,
"Age ratings"). Answer from what is in this build. The expected result is **4+**, but the rating is whatever the
questionnaire returns.

| Section | Question | Answer for this build |
| --- | --- | --- |
| In-app controls | Parental controls | No |
| In-app controls | Age assurance | No |
| Capabilities | Unrestricted web access | No. The one outside link opens Safari, not a browser inside the app. |
| Capabilities | User-generated content | No |
| Capabilities | Social media | No |
| Capabilities | Messaging and chat | No |
| Capabilities | Shared location | No |
| Capabilities | Advertising | No. **Changes if adverts ship.** |
| Mature themes | Profanity or crude humour | None |
| Mature themes | Horror or fear themes | None |
| Mature themes | Alcohol, tobacco or drug use or references | None |
| Mature themes | Dating and relationships | None |
| Medical or wellness | Medical or treatment information | None |
| Medical or wellness | Health or wellness topics | None |
| Sexuality or nudity | Mature or suggestive themes | None |
| Sexuality or nudity | Sexual content or nudity | None |
| Sexuality or nudity | Graphic sexual content and nudity | None |
| Violence | Cartoon or fantasy violence | None. A sliding tackle on a tabletop figure is sport, not violence. |
| Violence | Realistic violence | None |
| Violence | Prolonged graphic or sadistic realistic violence | None |
| Violence | Guns or other weapons | None |
| Chance-based activities | Gambling | None |
| Chance-based activities | Simulated gambling | None |
| Chance-based activities | Contests | None. Stars are a personal score; nobody competes for a prize or a ranking. |
| Chance-based activities | Loot boxes | None |

I could read Apple's definitions of every item above, but not the exact wording of the answer buttons, so match
"No" and "None" to whatever the form offers. "Made for Kids" (the Kids category): **do not select it.** It brings
extra rules and cannot be undone.

## App Privacy answers

True for this build, which has no network access, no analytics, no advert SDK, no crash reporter and no account.

- **"Do you or your third-party partners collect data from this app?" No.** The product page will then show
  "Data Not Collected".
- Why that is truthful: Apple defines "collect" as transmitting data off the device so that you or a partner can
  access it; data processed only on the device is not collected and need not be declared (Apple, "App privacy
  details on the App Store"). Progress and settings are stored on the phone and never sent anywhere. They are
  included in the player's own iCloud or computer backup of their phone, which is the player's copy, not yours.
- Tracking: none. The privacy manifest in the build declares `NSPrivacyTracking` false and no tracking domains,
  and the app never asks for the tracking permission.
- **Privacy Policy URL:** `https://onemanteam.app/privacy.html`. Required for every iOS app. The page
  currently says "Draft" and has no contact address; fix both before submitting.
- **These answers stop being true the moment adverts, purchases, analytics or crash reporting are added.** Redo
  them in the same release, and update the privacy manifest in `app.json`.

## Export compliance

- The build sets `ITSAppUsesNonExemptEncryption` to false in its Info.plist, so App Store Connect does not ask the
  encryption question at each upload.
- Why that is truthful: the app contains no encryption code of its own and makes no network connection of any
  kind, not even HTTPS. The only cryptography on the device is Apple's own, in the operating system.
- If a later version talks to a server over HTTPS only, the answer normally stays the same (standard encryption
  provided by the operating system is exempt), but re-read Apple's wording at that point rather than trusting this
  line.

## URLs, copyright and review details

| Field | Value | Status |
| --- | --- | --- |
| Support URL | `https://onemanteam.app/` | **Owner:** the page must show a way to contact you. Add an address or a form first. |
| Marketing URL (optional) | `https://onemanteam.app/one-man-team/` | The playable web version. Optional; leave blank if you would rather not send store visitors to a free browser copy. |
| Privacy Policy URL | `https://onemanteam.app/privacy.html` | **Owner:** remove the draft notice, add the contact address. |
| Copyright | `2026 Ollywood Games` | Apple adds the symbol itself. If you enrol as an individual, the seller shown on the store is your legal name; the copyright line may still name the studio. Your decision. |
| Content rights | "No, it does not contain, show or access third-party content" | The fonts (Anton, Barlow, Barlow Condensed) are under the SIL Open Font Licence, which allows this use; their licence text is in `one-man-team/fonts/LICENSE.txt`. |
| Sign-in required | No | |
| Review contact | Your name, phone (international format, with +27) and email | **Owner.** |

Notes for App Review (their field allows 4,000 bytes):

<!-- count:ios_review_notes limit=4000 unit=bytes -->
```text
One-Man Team is a single-player football game with no sign-in, no network access, no purchases and no adverts.

How to see everything quickly:
1. Launch. The cover offers "Kick off", which starts four short practice drills (they can be skipped with "Skip practice").
2. Fixture 1 follows. Each fixture is one attacking move built one player at a time; earlier players replay while you control the next.
3. To unlock every fixture without playing through: on the fixture list, tap the title "One-Man Team" seven times. This is a tester switch and does not affect anything else.

The game runs in a full-screen web view from files inside the app. It loads nothing from the internet. The only link that leaves the app is Options > Privacy policy, which opens in Safari.
```

**766 of 4,000 bytes.**

## Screenshots

Generated from the real game by `npm run screenshots` into `app/store/screenshots/ios/` at 1320 by 2868 pixels,
24-bit PNG with no alpha. On 21 November 2026 Apple's screenshot page listed that size for the 6.9-inch iPhone and
said smaller iPhone sizes are scaled down from it when not supplied; it requires 6.5-inch screenshots only if the
6.9-inch ones are missing, allows one to ten per size, and refuses images with alpha. The same page notes that
screenshots for the folding iPhone become required in April 2027 for apps built with the iOS 27.1 SDK or later;
nothing is needed for that today. No iPad screenshots are needed because the app is iPhone only.

Upload in this order. Apple has no alt-text field; the alt text is for Google Play and the web page.

| # | File | Caption on it | Alt text | Alt length |
| --- | --- | --- | --- | --- |
| 1 | `screenshots/ios/01-goal.png` | YOU PLAY EVERY PLAYER | A goal on a felt pitch with confetti, and the runs of three earlier players drawn in chalk | 90 |
| 2 | `screenshots/ios/02-pass.png` | FIRST, PLAY THE PASS | The first player aims a pass with the aim line showing and the pass button held down | 84 |
| 3 | `screenshots/ios/03-rewind.png` | REWIND. NOW RUN ONTO IT | A second player runs onto the pass while the first player replays his recorded part | 83 |
| 4 | `screenshots/ios/04-defenders.png` | DEFENDERS REACT TO EVERY RUN | A full-back has followed the winger inside, leaving the touchline free for the overlapping runner | 97 |
| 5 | `screenshots/ios/05-decoy.png` | A DECOY NEVER TOUCHES THE BALL | A decoy runner pulls his marker away while the recorded pass travels through the gap | 84 |
| 6 | `screenshots/ios/06-offside.png` | MIND YOUR OWN OFFSIDE LINE | The offside line across the pitch while the striker waits for a pass from his own earlier player | 96 |
| 7 | `screenshots/ios/07-replay.png` | WATCH THE WHOLE MOVE BACK | Result sheet with three stars, the move time and the number of takes, over the action replay | 92 |
| 8 | `screenshots/ios/08-career.png` | THREE STARS FOR A QUICK MOVE | Fixture list of ticket stubs with stars earned, the next fixture flagged and later ones locked | 94 |
| 9 | `screenshots/ios/09-season.png` | A CAREER OF MATCH MOMENTS | End of season report with a rosette, stars won, fixtures won and the season table | 81 |
| 10 | `screenshots/ios/10-practice.png` | LEARN IT IN FOUR SHORT DRILLS | A practice drill: the coach explains how to aim a shot away from the goalkeeper | 79 |

## How the counts were verified

```
python3 scripts/count-listing.py
```

reads this file and `play-store-listing.md`, measures every block that follows a `count:` marker, compares it with
the limit in the marker and with the bold number printed under the block, and prints the number of fixtures the
game loads today. Its output on the day of writing is in `release-checklist.md` under "Verified".

## Sources

All read on 21 November 2026.

- App information (name 30 characters, subtitle 30, bundle ID cannot change after a build is uploaded), App Store Connect Help: https://developer.apple.com/help/app-store-connect/reference/app-information/
- Platform version information (promotional text 170, description 4,000, keywords 100 bytes, What's New 4,000 and not available for a first version, review notes 4,000 bytes, support URL must lead to contact details), App Store Connect Help: https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information
- Screenshot specifications, App Store Connect Help: https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications
- Age ratings (the questionnaire's items and the 4+ to 18+ tiers), App Store Connect Help: https://developer.apple.com/help/app-store-connect/reference/age-ratings
- App privacy details on the App Store (what "collect" means), Apple Developer: https://developer.apple.com/support/app-privacy-on-the-app-store
- `docs/marketing/play-store-listing.md`, `positioning.md`, `store-assets-plan.md` and `one-man-team/js/game.js` in this repository
