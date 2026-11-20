# Ollywood Games site

GitHub Pages site for Ollywood Games. Currently hosts one game.

## One-Man Team (`/one-man-team/`)
A football game: build a move one player at a time while every earlier run replays around you.
Plain HTML, CSS and JavaScript with no build step and no dependencies.

| Path | What it is |
| --- | --- |
| `one-man-team/js/sim.js` | Deterministic simulation: movement, ball, defenders, goalkeeper, offside, win and fail rules |
| `one-man-team/js/levels/packN.js` | Level data, loaded in numeric order |
| `one-man-team/js/game.js` | Screens, input, rendering, saved progress |
| `one-man-team/js/audio.js` | Synthesised sound effects and vibration |
| `one-man-team/sw.js` | Offline cache. Bump `VERSION` on every release |
| `tools/` | Not shipped. Bots that prove every level can be beaten, and the level design guide |

### Checks before every release
```
node tools/test.js            # every level beaten by its bot, and the full replay scores
node tools/test.js --jitter   # how forgiving each round is when the bot's timing and aim are perturbed
python3 tools/build-single.py # optional: one self-contained HTML file in dist/
```

### Adding levels
Read `tools/LEVEL_DESIGN.md`. Add `one-man-team/js/levels/packN.js` and `tools/scripts/packN.js`, add the script tag to
`one-man-team/index.html` and the file to the list in `one-man-team/sw.js`.

### Hidden tester switch
Tap the logo on the home screen seven times to unlock or re-lock every move.
