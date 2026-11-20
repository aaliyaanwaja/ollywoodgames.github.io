# One-Man Team: store assets plan

Written 21 November 2026. Specifications are from Google Play Console Help, read the same day. Visual rules are from docs/ART_DIRECTION.md. Captions are written for the working title; none of them contains the name, so they survive a rename.

## Ground rules for every asset

- Real game footage only. Google asks for screenshots that show the actual experience and for captions to take up no more than a fifth of the image.
- No "free", "best", "new", rankings, prices or calls to action in any graphic (Google's rule), and no exclamation marks except GOAL (the art direction's rule).
- No real kits, badges, stadiums or names. Kit colours are the defaults: us tomato and paper, them ink and sky, goalkeeper mustard.
- Captions in Anton, uppercase, ink on a paper band with a hard offset shadow, as if printed on a programme page. One line where possible.
- Check every asset at thumbnail size on a 360-pixel-wide phone. If the live player, ball and run lines are not readable there, simplify the frame rather than enlarging the caption.
- Alt text of 140 characters or fewer for each image, describing what is shown, not starting with "image of".

## Phone screenshots

**Format:** eight portrait screenshots, 1080 by 1920 pixels, PNG without transparency. Google allows up to eight per device type and recommends at least three portrait 9:16 images of 1080 by 1920 or larger for games to be eligible for its recommendation surfaces.

**Layout:** a paper band across the top fifth carrying the caption; the remaining four fifths are an untouched capture of the game. No phone frame (Google advises against device imagery in the feature graphic; keep the set consistent).

| # | What it shows | Caption on it | Alt text |
| --- | --- | --- | --- |
| 1 | The end-of-move replay of a four-player goal: all four runs drawn on the felt as numbered chalk-and-tomato lines, the ball's path between them, the ball in the net. | YOU PLAY EVERY PLAYER | A finished move on a felt pitch with four numbered runs drawn from midfield to the goal |
| 2 | Round one of the same level. One live figure with the mustard ring, the aim-and-power line pointing into empty space ahead of a stationary team-mate. | FIRST, PLAY THE PASS | The passer aims a through ball into space with the aim line showing |
| 3 | Round two. The first figure is replaying its pass (drawn fainter or with its recorded line); the live figure is sprinting onto the ball. A small "rewind" stamp in the HUD if the build has one. | REWIND. NOW RUN ONTO IT | A second player runs onto the pass while the first player replays |
| 4 | A defender visibly leaving his position to follow a new runner, with the gap he leaves obvious. | DEFENDERS REACT TO EVERY RUN | A defender follows a runner and leaves a gap in the back line |
| 5 | A decoy round: the live player has no ball, a marker is being dragged wide, and the earlier pass is travelling through the space. | A DECOY NEVER TOUCHES THE BALL | A decoy runner pulls a marker wide while the pass goes through the gap |
| 6 | The offside line drawn across the pitch with the live runner a stride beyond it at the moment the recorded pass is played, and the fail state showing. | MIND YOUR OWN OFFSIDE LINE | The offside line on the pitch with a runner just beyond it |
| 7 | The result card after a goal: move name, time, retries, three mustard stars, in full programme styling. | WATCH THE WHOLE MOVE BACK | Result card showing a move name, time, retries and three stars |
| 8 | The career screen: ticket-stub level tiles with stars, some locked, total stars at the top. | THREE STARS FOR FEW RETRIES | Career screen with ticket stub level tiles and star totals |

### Why this order

- **One to three are the argument.** In search results and on the listing, the first three screenshots are usually all a browsing player sees without scrolling. Screenshot 1 is the finished result (the most attractive and most unusual frame, and proof that it is football). Screenshots 2 and 3 then explain how that picture was made, in the same order the game teaches it: pass, rewind, run. Someone who sees only these three understands the game.
- **Four to six are the depth.** They answer "is that all?" with the three things that make it more than a gimmick: live defenders, decoys, and offside against yourself. They go in rising order of subtlety.
- **Seven and eight are the structure.** Reward and career come last because every level-based game has them; they reassure rather than persuade. Seven also shows the interface style at its best.
- Screenshots 1 to 3 should come from the same level so the story is continuous. Use a level with a clear diagonal through ball; the angled pass is the most satisfying thing in the game and reads well in a still.

### Production notes

- Capture from the real build at a 9:16 viewport. The repository's tools folder already has a capture script (tools/shots.py); extend it rather than taking captures by hand, so the set can be regenerated when the art changes.
- The current level-select tiles use a lock emoji and text star characters. The art direction bans emoji and asks for custom drawn stars. Fix those before capturing screenshots 7 and 8, or the store images will contradict the stated identity.
- If the game does not yet draw a visible difference between the live player and replaying players, add one before capturing screenshot 3. The whole listing depends on that frame being legible.

## Feature graphic

**Format:** 1024 by 500 pixels, JPEG or 24-bit PNG, no transparency. Google asks for key elements to be kept central, and advises against pure white, black or dark grey backgrounds, device imagery and store badges.

**Concept: one figure, three times.** A top-down strip of felt pitch running left to right, mowing bands and slightly uneven chalk. The same tomato figure, same squad number, appears three times along a dashed chalk run that bends towards a goal at the right edge: faintest at the start, stronger in the middle, solid with the mustard ring at the front. A single ball path cuts across the run from an earlier position of the same figure. Two ink-and-sky defenders, one of them turning the wrong way. A soft shadow under every figure.

- The title sits centre-left on a cream ticket stub with a perforated edge and a hard ink offset shadow, set in Anton. No other text.
- The repeated squad number is the idea: one player, several places. It works without the caption and does not depend on the name.
- As a rule of thumb (mine, not Google's figure), keep the outer 15 per cent on every side free of anything important; Play crops and overlays this image differently on different surfaces.
- It doubles as the banner for the web page and social profiles.

## Icon

**Format:** 512 by 512 pixels, 32-bit PNG, up to 1024 KB. Google forbids text or badges that suggest ranking or price. Play applies its own rounded mask, so supply a full square with nothing important in the corners.

The current icon in one-man-team/icons shows a yellow disc, a red disc, a white ball and a dashed line on dark green bands. The idea (a pass between two points) is right, but it does not yet follow the art direction, and at small size it could be any sports or puzzle app.

Guidance for the replacement:

- **One figure, not discs.** A single tabletop figure seen from above: round weighted base in tomato with a paper trim, small shoulders-and-head shape on top, soft shadow underneath. This is the most ownable thing in the art direction.
- **One ghost.** Behind it, the same figure once more at about a third of the strength, joined by a short dashed chalk line. That is the mechanic in one image. Do not add a third; it will not survive 48 pixels.
- **A legible squad number** on the base, in Barlow Condensed 700. Use 1: it fits the title and reads at any size.
- **Felt, in the specified greens** (felt #2F7D4F and felt-dark #2A7046), with at most two mowing bands and a fragment of chalk line. The current icon's greens are darker than the palette.
- **Mustard ring** around the front figure, as in play, to tie the icon to the first screenshot.
- 2-pixel ink outlines scaled up proportionally; no gradients other than the subtle felt shading; no glow; no text.
- Keep the ball if it stays readable at 48 pixels; otherwise drop it. Figure plus ghost is enough.
- Test at 48, 96 and 192 pixels on both a white and a dark background, next to the icons of the large football games. Those are mostly photographic or glossy 3D; a flat felt-and-figure icon should stand out by being quiet.

## Promo video storyboard

**Format:** hosted on YouTube, public or unlisted, embeddable, not age-restricted, with monetisation switched off. Google says the preview may autoplay muted for up to 30 seconds, asks that the real experience appears within the first 10 seconds and that at least 80 per cent of the video is representative gameplay, and accepts portrait provided there are no black bars. So: portrait 1080 by 1920, 25 seconds, understandable with no sound, captions burned in.

Every shot is a screen capture of the real game. The only added elements are caption bands in the screenshot style and two paper-wipe transitions. Use one level throughout shots 1 to 6 so the viewer watches a single move come together.

| Shot | Time | Picture | On-screen text | Sound (optional) |
| --- | --- | --- | --- | --- |
| 1 | 0:00 to 0:03 | Cold open on play, no logo. Round one: the passer runs two strides, the aim line swings out, the ball is struck into space. Nobody is there to receive it. The ball rolls to a stop. | PLAY THE PASS | Felt-muffled kick, crowd murmur |
| 2 | 0:03 to 0:05 | The picture rewinds: ball and player slide back to their starting marks at speed, like a tape. | REWIND | Short tape-scrub or paper flick |
| 3 | 0:05 to 0:09 | Round two: the mustard ring is now on the second player. The first player replays the pass exactly; the live player sprints onto it and takes it in stride. | NOW RUN ONTO IT | Kick, footsteps |
| 4 | 0:09 to 0:13 | Round three, a decoy. He runs wide; his marker follows; the gap opens just as the recorded pass arrives. Brief highlight on the defender leaving. | DEFENDERS REACT TO EVERY RUN | Low crowd rise |
| 5 | 0:13 to 0:15 | A failure, kept short and funny: the runner goes a stride too early, the offside line flashes, the flag stamp appears. | OFFSIDE. AGAINST YOURSELF | Whistle |
| 6 | 0:15 to 0:19 | The corrected final round: the striker times it, takes the last pass, shoots, scores. | GOAL! | Net, crowd |
| 7 | 0:19 to 0:23 | The full replay with every run drawn on the pitch, slightly faster than real time, then freeze on the completed diagram. | EVERY RUN IS YOURS | Crowd holds, then cuts |
| 8 | 0:23 to 0:25 | Paper wipe to the title on cream, with the figure-and-ghost icon and three stars stamping in. No "download now". | Title only | Single stamp sound |

Notes:

- **The first five seconds carry it.** Pass into nothing, rewind, run onto it: if a viewer leaves at 0:09 they have still seen the idea. That is why there is no logo at the start.
- Shot 5 is the only failure. It shows the game has teeth and gives the goal in shot 6 something to resolve. Cut it if the video runs long.
- Record at 60 frames per second and slow nothing down except, if needed, the last half-second before the goal.
- The same footage, cut to shots 1, 2, 3 and 7 only (about 12 seconds), is the template for social clips; see launch-plan.md.
- Music is optional and most viewers will not hear it. If used, it must be licence-clear, because Google asks for videos without copyright claims.

## Checklist before upload

- [ ] Eight screenshots at 1080 by 1920, captions under a fifth of the height, alt text written.
- [ ] Feature graphic at 1024 by 500, checked with the outer 15 per cent masked.
- [ ] Icon at 512 by 512, checked at 48 pixels beside competitor icons.
- [ ] Video unlisted or public, embeddable, monetisation off, no black bars, title visible only in the last two seconds.
- [ ] No emoji, no real-world football marks, no exclamation marks other than GOAL in any asset.
- [ ] Captions re-checked if the name changes (only shot 8 and the feature graphic contain the title).

## Sources

- Add preview assets to showcase your app (icon, feature graphic, screenshot and preview video requirements), Google Play Console Help, read 21 Nov 2026: https://support.google.com/googleplay/android-developer/answer/9866151?hl=en-GB
- Best practice for your store listing, Google Play Console Help, read 21 Nov 2026: https://support.google.com/googleplay/android-developer/answer/13393723?hl=en
- docs/ART_DIRECTION.md, one-man-team/icons/icon-512.png, one-man-team/js/game.js and tools/shots.py in this repository
