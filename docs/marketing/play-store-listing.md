# One-Man Team: Google Play store listing

Written 21 November 2026 for the working title, in British English. Limits are Google's: title 30 characters, short description 80, full description 4,000 (Google Play Console Help, read 21 Nov 2026). Every count below was produced by running Python's `len()` on the exact text in the block, not estimated. The check is repeatable: see "How the counts were verified" at the end.

Not verified: search volumes for any keyword (no store-optimisation tool was available), and competitors' Play listings (Play Store pages could not be read from this environment).

## Title

<!-- count:title_gb -->
```text
One-Man Team: Football Puzzle
```

**29 of 30 characters.**

Why this form: the name alone does not say football, and "football game" would promise full matches. "Football Puzzle" tells a browsing player it is short-form and skill-based before they tap. Google's listing guidance rules out words such as "free" or "best", emoji and all-capitals in titles; none are used.

## Short description

<!-- count:short_gb -->
```text
Play the pass, rewind, then run onto it yourself. One goal, player by player.
```

**77 of 80 characters.**

It states the mechanic in order, which is the thing no competitor can say. Two sentences, so the full stops are within Google's rule that they are used only when there is more than one sentence. No call to action and no price or ranking language, both of which the guidance prohibits.

## Full description

<!-- count:full_gb -->
```text
One-Man Team is a football game about a single attacking move, and you play every part in it.

First you are the passer. Play the ball into space. Then the clock rewinds and you are the team-mate running onto that pass, while your first player repeats exactly what you recorded. Then the next player, and the next, up to five, until the last one scores.

The defenders are not recorded. They react live to every run, so each new player changes the picture. A decoy can drag a centre-back out of the way. It can also wreck a pass you were pleased with two rounds ago.

HOW IT PLAYS
• One level is one move, 5 to 15 seconds long.
• Portrait, two thumbs. The left thumb runs. The right thumb aims and sets the power, so you can pass at an angle while running.
• Lose the ball, stray offside, run into an earlier version of yourself or run out the clock, and you replay that one player, not the whole move.
• Some players never touch the ball. Their whole job is to move a defender.
• You can be caught offside by your own earlier pass. It is as annoying as it sounds.

THE REPLAY
When the last player scores, the whole move plays back with every run drawn on the pitch. All of it is yours, including the bits that looked like luck.

A CAREER OF MATCH MOMENTS
• Around 20 moves at launch: through balls, cut-backs, overlaps, third-man runs, switches of play.
• Retry as often as you like. Stars are for how quick the finished move is.
• Short enough for a bus stop. Awkward enough to keep you there after the bus has gone.

HOW IT LOOKS
Tabletop football figures on a felt pitch, with menus printed like a matchday programme: cream paper, navy ink and ticket stubs for levels. Squad numbers you can read in sunlight.

GOOD TO KNOW
• No real clubs, leagues or players. The football is the point.
• No match engine deciding things behind your back. If the pass was bad, it was your pass.
• Made by one person in Johannesburg, which is at least on theme.
```

**1911 of 4,000 characters** (line breaks counted as one character each).

Notes on the text:

- The first paragraph is the whole pitch, because that is what shows before "read more".
- It is deliberately under half the limit. The space is not a target.
- "Football" appears 3 times, all in sentences that need it. No keyword block.
- It names no other game. Google's guidance asks listings not to compare themselves with other apps.
- "Around 20 moves" is stated openly. Update the number with each content release.
- The "stars are for how quick the finished move is" and "run into an earlier version of yourself" lines match the rules in the current build (one-man-team/js/game.js). Change the copy if the rules change.

### Lines to add once decisions are made

None of these is in the counted text above. Add them under GOOD TO KNOW only when true.

| When | Line | Characters |
| --- | --- | --- |
| The packaged Android build is confirmed to work with no connection | `• Plays offline.` | 16 |
| Rewarded adverts ship | `• Adverts are optional: you choose to watch one for a hint or to skip a move. Nothing interrupts play.` | 102 |
| A one-off unlock ships | `• One optional purchase unlocks unlimited hints and skips. There is nothing else to buy.` | 88 |
| Always, as the last line (placeholder address shown) | `Questions or bugs: support@example.com` | 38 |

With all four added, each on its own line and the contact line after a blank line, the description is 2160 characters with the placeholder address; recount with the real one.

## American English listing

Add an "English (United States)" translation in Play Console so that people who search "soccer" can find the game. Only the title and short description need to differ in wording; in the full description replace "football" with "soccer" and "centre-back" with "center back", and recount.

<!-- count:title_us -->
```text
One-Man Team: Soccer Puzzle
```

**27 of 30 characters.**

<!-- count:short_us -->
```text
Play the pass, rewind, run onto it yourself. One soccer goal, player by player.
```

**79 of 80 characters.**

## Category and tags

- **Application type:** Game.
- **Category: Sports.** This is where the comparable football games sit and where "football" searches lead. The alternative is Puzzle, which would put the game beside different expectations and away from its natural audience. The cost of Sports is that the category charts are held by very large publishers, so do not expect category browsing to bring installs under either choice.
- **Tags (Google allows at most five):** Soccer, Sports, Puzzle, Arcade, Casual. Reasoning: Soccer and Sports are the literal subject; Puzzle is the honest second genre; Arcade covers the real-time two-thumb play; Casual reflects session length. The tag names are taken from AppTweak's published list of Play tags, which has no plain "Football" tag (only "American football" and "Soccer") and no "offline" or "single player" tag. Confirm the names in Play Console, since the list is third-party and Google changes it.
- Google's guidance is to choose tags a new user would recognise from the listing or the first session, and not to add neighbouring genres to widen reach. That rules out "Sports management" and "Logic puzzle".

## Content rating expectations

These are expectations, not results; the rating is whatever the questionnaire returns.

- Ratings on Google Play come from the IARC questionnaire in Play Console (Policy, then App content), which issues a rating per region: ESRB in the Americas, PEGI in Europe and the Middle East, USK in Germany, ClassInd in Brazil, and an IARC generic rating elsewhere, according to Google Play Console Help.
- The game has no violence, fear, sexual content, bad language, gambling, drugs, user-to-user communication, location sharing or user-generated content inside the app. Answered truthfully, I would expect the lowest band everywhere: ESRB Everyone, PEGI 3, USK 0, ClassInd L, IARC 3+. I could not find a Google page that guarantees this outcome for any given set of answers.
- If the shareable replay sends anything to other people from inside the app (as opposed to handing a file to the phone's share sheet), re-read the questions on user interaction before answering.
- If adverts ship, the listing will carry a "Contains ads" label, and Google requires adverts to be appropriate to the app's rating: set the ad network's content filter to the most restrictive general-audience level.
- If any purchase ships, the listing will show "In-app purchases", and some rating bodies add a purchases notice.
- **Target audience:** declare 13 and over (or 18 and over if adverts ship and the stricter setting is preferred). The game is not designed for children, and declaring under-13s would bring Google's Families requirements for adverts and data. The tabletop-figure art could be read as child-appealing, so answer the "could this appeal to children" question deliberately rather than by default.
- The Data safety form must match whatever analytics and advertising code is in the build.

## Keywords, with reasoning

Google Play has no keyword field. It reads the title, short description and full description, so the only "keyword work" is choosing which plain words appear in those places. The list below is a writing checklist, not text to paste.

| Phrase | Where it appears | Why |
| --- | --- | --- |
| football puzzle | Title | The most accurate two-word description and the main expectation-setter. |
| football game | Full description, first sentence | The broad term; used once, naturally. |
| soccer puzzle, soccer game | US listing | Same reasoning for players who say soccer. |
| pass, passer, run, through ball | Short and full description | What people do in the game; also how football people search for skill games. |
| rewind, replay | Short and full description | The distinctive mechanic and the reward. |
| offside, decoy, defenders | Full description | Signals depth to football-literate readers. |
| third-man run, cut-back, overlap, switch of play | Full description | Real tactical terms that are also level names; low-volume but exactly the right audience. |
| tabletop, matchday programme | Full description | The look; helps the listing match the screenshots. |
| career, three stars | Full description | Familiar structure for players of level-based mobile games. |
| offline | Optional line | Add only if true in the packaged build; it is a common reason people choose a small game. |

Left out on purpose: any club, league, competition or player name; any other game's name; "free", "best", "top", "new", "no ads" (Google's listing guidance prohibits promotional and price language); and "manager", "league" or "multiplayer", which would attract people the game will disappoint.

I could not measure search volume or difficulty for any of these. Once the listing is live, the Play Console acquisition report shows the actual search terms that led to installs; revise from that after four weeks, not before.

## Screenshot captions and alt text

Captions are specified in store-assets-plan.md. Google asks for alt text of 140 characters or fewer on every graphic and for captions to cover no more than a fifth of the image.

## If the name changes to Pass to Yourself

Pass to Yourself is the top-ranked alternative in naming.md. What changes:

<!-- count:title_alt_gb -->
```text
Pass to Yourself: Football
```

**26 of 30 characters.** "Football Puzzle" no longer fits after the longer name (it would be 33), so the category word shrinks to "Football". The short description therefore has to carry the puzzle expectation.

<!-- count:title_alt_us -->
```text
Pass to Yourself: Soccer
```

**24 of 30 characters.**

<!-- count:short_alt -->
```text
Play the pass, rewind, then run onto it. One goal, built one player at a time.
```

**78 of 80 characters.** "Yourself" is dropped from the sentence because the title now says it, and "built one player at a time" does the work "Puzzle" did in the title.

Full description: the first sentence begins "Pass to Yourself is a football game about a single attacking move", and the last GOOD TO KNOW line loses its aside, because the joke about one person only works with the old name. Everything else is unchanged. The result:

<!-- count:full_alt -->
```text
Pass to Yourself is a football game about a single attacking move, and you play every part in it.

First you are the passer. Play the ball into space. Then the clock rewinds and you are the team-mate running onto that pass, while your first player repeats exactly what you recorded. Then the next player, and the next, up to five, until the last one scores.

The defenders are not recorded. They react live to every run, so each new player changes the picture. A decoy can drag a centre-back out of the way. It can also wreck a pass you were pleased with two rounds ago.

HOW IT PLAYS
• One level is one move, 5 to 15 seconds long.
• Portrait, two thumbs. The left thumb runs. The right thumb aims and sets the power, so you can pass at an angle while running.
• Lose the ball, stray offside, run into an earlier version of yourself or run out the clock, and you replay that one player, not the whole move.
• Some players never touch the ball. Their whole job is to move a defender.
• You can be caught offside by your own earlier pass. It is as annoying as it sounds.

THE REPLAY
When the last player scores, the whole move plays back with every run drawn on the pitch. All of it is yours, including the bits that looked like luck.

A CAREER OF MATCH MOMENTS
• Around 20 moves at launch: through balls, cut-backs, overlaps, third-man runs, switches of play.
• Retry as often as you like. Stars are for how quick the finished move is.
• Short enough for a bus stop. Awkward enough to keep you there after the bus has gone.

HOW IT LOOKS
Tabletop football figures on a felt pitch, with menus printed like a matchday programme: cream paper, navy ink and ticket stubs for levels. Squad numbers you can read in sunlight.

GOOD TO KNOW
• No real clubs, leagues or players. The football is the point.
• No match engine deciding things behind your back. If the pass was bad, it was your pass.
• Made by one person in Johannesburg.
```

**1887 of 4,000 characters.**

Also changes: the application ID should be chosen to match before first upload, since it cannot be changed afterwards; the icon wordmark, if any; the web address folder (currently /one-man-team/); and the en-US title above. Category, tags, rating expectations and keyword reasoning do not change.

## How the counts were verified

Each counted text sits in a fenced block preceded by a `count:` marker. This script, run from the repository root on 21 Nov 2026, reads this file and prints the length of every marked block:

```python
import re
t = open('docs/marketing/play-store-listing.md', encoding='utf-8').read()
for label, body in re.findall(r'<!-- count:(\w+) -->\n```text\n(.*?)\n```', t, re.S):
    print(label, len(body))
```

Its output is recorded in the bold line under each block.

## Sources

- Add preview assets to showcase your app (short description, screenshots, alt text, prohibited wording), Google Play Console Help, read 21 Nov 2026: https://support.google.com/googleplay/android-developer/answer/9866151?hl=en-GB
- Best practice for your store listing (title 30 characters, full description 4,000, no comparisons or keyword lists), Google Play Console Help, read 21 Nov 2026: https://support.google.com/googleplay/android-developer/answer/13393723?hl=en
- Choose a category and tags for your app or game (five-tag limit, game categories), Google Play Console Help, read 21 Nov 2026: https://support.google.com/googleplay/android-developer/answer/9859673?hl=en
- A Comprehensive List of Google Play Tags, AppTweak, read 21 Nov 2026: https://www.apptweak.com/en/aso-blog/complete-list-of-available-google-play-store-tags
- Content ratings requirements (IARC questionnaire and rating authorities), Google Play Console Help, read 21 Nov 2026: https://support.google.com/googleplay/android-developer/answer/9859655?hl=en
- Game rules quoted in the description: one-man-team/js/game.js and README.md in this repository
