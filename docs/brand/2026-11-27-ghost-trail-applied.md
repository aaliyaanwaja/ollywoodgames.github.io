# Ghost trail applied

27 November 2026. The owner chose the name **One-Man Team** and logo concept **A. Ghost trail** from `2026-11-27-name-and-logo-options.md`. No tagline was chosen, so none is used anywhere ("Pass to yourself" and the other tagline options appear in no asset, page or tag). This note records where the identity now appears, how it is generated and what was checked.

## The identity, as built

- **Icon.** The same No. 1 three times on felt: two dashed chalk ghosts on a dotted run, and the live figure in its mustard ring with a flat offset shadow. It is the concept master (`concepts/omt-a-ghost-trail-icon.svg`) unchanged at full size. For safe zones the art is shrunk about its own centre and the run is extended so it still leaves the frame.
- **Small-size redraw (favicons only).** Below about 48 px the second ghost and the chalk arc turn to noise, so the favicon is redrawn: a bigger live figure and one ghost in the corner. It is the same mark, simplified, as the concept notes anticipated ("the ghosts mostly disappear at that size").
- **Wordmark.** ONE-MAN TEAM in Anton, outlined (HarfBuzz kerning, no web font), ink letters over a tomato offset print, with a dashed tomato copy of itself shifted back along the run. There are two forms: one line (masthead, lockup) and stacked on two lines (cover, landing page, share card, feature graphic).

## One source

| File | What it does |
| --- | --- |
| `tools/brand.py` | Draws the icon, the small redraw, the themed (monochrome) icon, the wordmark and the lockups. Ported from the concept generator in `/home/claude/brandgen/` so the repository no longer depends on it. Needs `uharfbuzz` and `fonttools`. |
| `tools/make-brand.py` | Writes `one-man-team/js/brand.js` (the in-game wordmarks), the lockups and wordmarks in `one-man-team/icons/`, and with `--share RAW.png` the share card. |
| `app/scripts/make-art.py` | Now takes the icon and wordmark from `tools/brand.py` and writes every app, store and web icon, as before, plus the new favicons, apple-touch icon and App Store icon. |

To regenerate everything: `python3 app/scripts/make-art.py`, then `python3 tools/make-brand.py --share <capture>`. Any untouched portrait game capture works for the share card. The current one is a goal in "Down the wing", taken with the bots and clock control from `app/scripts/make-screenshots.py`.

## Web (launches first)

- **Favicons:** `icons/favicon.svg` (small redraw), `favicon-32.png`, `favicon-16.png` and `favicon.ico` (16, 32 and 48, each rasterised at its own size, not scaled down). **Apple touch icon:** `apple-touch-icon-180.png` (full icon, no alpha).
- **Manifest** (`one-man-team/manifest.webmanifest`): name and short name One-Man Team, the pitch as the description, paper (`#F2EAD8`) as the background and theme colour to match the page, an `id`, icons 192 and 512 (`any`), a maskable 512 with the art inside the 80 per cent safe circle, and the SVG master.
- **`<head>` of `one-man-team/index.html` and the root `index.html`:** title, description (the one-line pitch from the brand doc), theme colour, canonical URL, the icon links, and Open Graph and Twitter `summary_large_image` tags. All URLs are absolute on `https://aaliyaanwaja.github.io/ollywoodgames.github.io/`. `tools/build-single.py` still removes the icon and manifest links from the single-file and app builds, and the meta tags are harmless there.
- **Share card:** `one-man-team/icons/share-1200x630.png`, in the house style: paper, ink rules, the programme strip, the icon tile and stacked wordmark, the pitch, a "Play free" stub, and a real goal capture printed as a tilted plate with a hard ink shadow.
- **Root landing page** (`index.html`): the programme strip, the stacked lockup (`icons/lockup-stack.svg`), the one-line pitch, a Play now button, a Daily Move ticket and the privacy link. There are no images apart from the lockup SVG, three small fonts and one small inline script. The script points the Daily Move link at today's move (`one-man-team/?daily=N`, with Daily 1 on 30 November 2026). Before then it says the first one is on Monday 30 November and opens the game.
- **Service worker:** `VERSION` bumped to `omt-0.11.0`. It now also caches `js/brand.js`, the favicons, the apple-touch icon and the maskable icon. All 37 listed files exist.

## In the game

- The cover title (`.title.big`, two lines) and the home masthead (`#brand`, one line) are now the outlined wordmark, inline SVG from `js/brand.js`. Each SVG is sized in em so it fills exactly the box the live text filled, and the dashed ghost spills into the page padding. Measured against the previous build at 320, 390 and 560 px wide: the cover title box and the position of the cover art are identical to the pixel, and the masthead box is identical at 390 and 560. At 320 px the old masthead wrapped to two lines (76 px). The wordmark now scales down slightly and stays on one line (37 px), which keeps the masthead the height the design team set. No other layout sizes changed (`docs/build/2026-11-26-design-retention-build.md`).
- The SVG carries `role="img"` and `aria-label="One-Man Team"`. The seven-tap tester unlock on `#brand` still works. If `GAME_NAME` is changed without regenerating `brand.js`, the game falls back to the live text.

## App

- `app/assets/icon.png` (1024, no alpha), the adaptive foreground (art inside the 66 dp safe circle of the 108 dp layer), the adaptive background (felt, with the chalk arc moved into the visible 72 dp), the monochrome themed icon (the live figure punched out of its disc) and the splash (the icon as a printed tile with an ink edge and hard shadow, on the cream splash).
- Store: `app/store/play-icon-512.png` (32-bit) and the new `app/store/app-store-icon-1024.png` (24-bit, no alpha). The feature graphic keeps its scene. Its ticket stub now carries the stacked Ghost trail wordmark in place of the live Anton text.
- Screenshots: only plate 8 (the fixture list) showed the title. It was regenerated for both stores and now also shows the current home design. Plates 1-7, 9 and 10 show no logo and were left alone.

## Checks

- Legibility (`/home/claude/shots/launch-legibility-1x.png`, `-2x.png`, on paper, ink and grey). Full icon: at 48 px the ringed figure reads clearly and the ghosts are faint. At 32 px the figure still reads. At 16 px it is a ringed dot on green. Small redraw: it reads as a ringed No. 1 on felt at 32 px, and keeps the mustard, tomato and paper rings at 16 px. That is why it is the favicon.
- Screenshots: `launch-landing.png` (phone), `launch-landing-desktop.png`, `launch-cover.png`, `launch-home.png`, `launch-phone-mock.png` (the icon at 60 pt on light and dark home screens, and 16 px favicons in browser tabs), and `launch-share-card.png` (as a link preview and at full size), all in `/home/claude/shots/`. No console errors on the landing page or in the game, and every icon and manifest link returns 200.
- `node tools/test.js`: all 60 fixtures beaten. App `npm test`: the sync check, shell (14 checks) and bridge (35 of 35) all pass. `npm run check-native`: 11 checks pass, including "one 1024 x 1024 app icon without alpha". `/home/claude/game/index.html` rebuilt, and `npm run sync-game` written.

## Known issues, not fixed here

- `app/scripts/make-screenshots.py` cannot regenerate plates 1-7, 9 and 10. It plays the fixtures "The overlap" and "Last-minute winner", which no longer exist since Campaign v2 renamed the fixtures. Until those two constants name current fixtures, those plates show the earlier campaign.
- The script also stopped on the Daily Move fetch from the live site when the machine was offline. It now ignores network-only load errors, as it already ignored missing local files.
- `/favicon.ico` at the host root (`aaliyaanwaja.github.io/favicon.ico`) is outside this repository's site, so browsers that ask there without reading the page's links get nothing. Every page links its icons explicitly.
