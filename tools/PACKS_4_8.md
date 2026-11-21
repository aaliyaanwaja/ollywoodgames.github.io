# Fixtures 21-60: brief for packs 4 to 8

The game has 20 fixtures (packs 1-3). It needs 60. Five new packs of eight, one designer each, all working at once.
Read `tools/LEVEL_DESIGN.md` (format, engine behaviour, acceptance, and the notes at the end on shooting, stars and
clocks), `tools/AI_NOTES.md`, and packs 1-3 with their bot scripts in `tools/scripts/` as worked examples.

## What playtesting taught us
- The owner finds the game very challenging and very replayable. Hard is fine; unfair or samey is not.
- Six of the eight fixtures in pack 3 end with a through ball and a one-on-one. That must not continue.
- Shots are now strong: a full-power strike into a corner scores from the edge of the box (about 30% of the goal mouth
  from 18 m, 55% from 14 m). Finishes from distance, lay-offs to a striker arriving at the D, and first-time finishes are
  all viable and should be used.

## Rules for every new pack
- Exactly 8 levels, pushed onto `OMT_LEVELS` in `one-man-team/js/levels/packN.js`, with `tools/scripts/packN.js`
  holding one bot script per round. You own only those two files. No git. Do not edit the engine, bots, tests, other packs.
- One distinct football idea per level, named in plain football language. No name or idea already used:
  First pass, Through ball, Down the wing, The decoy, Switch of play, The lay-off, The cut-back, The overlap, Diagonal in
  behind, Third-man run, The counter, Push them back, Beat the trap, Clear the channel, Play through the press,
  Sweeper-keeper, Far post, False nine, Five-man move, Last-minute winner. Other designers are writing other packs now;
  stay inside your own theme so ideas do not collide.
- Finishing variety: at most three of your eight may end with a ball in behind and a one-on-one. The rest must end
  another way (first-time finish from a pull-back or lay-off, a strike from the edge of the box, a far-post arrival, a
  near-post run, a finish after beating a planted defender is not scriptable, so avoid needing a feint).
- A believable defensive shape in every level (back-line unit, screens, markers, a presser where the idea calls for it).
- `time`: about 1.8 times the bot's move time, rounded up to a whole second.
- Text: British football English. `brief` under 110 characters. Every `tip` 95 characters or fewer, and it must tell the
  player what to do. No story, season or kit fields.
- Start positions inside x 3..47, y 4..57 (a corner taker may stand at x 2.5 or 47.5, y 3); attackers at least 3 m apart;
  no defender within 4 m of the ball at kick-off; nobody offside at the start.
- Acceptance: `node tools/test.js --pack N` prints BEATEN for all eight (this also proves the full replay scores);
  `node tools/test.js --pack N --jitter` meets your pack's forgiveness band below; bot time at most 60% of `time`.
- Work one level at a time and save both files as soon as each level passes. Level numbers for the verbose single-level
  trace (`node tools/test.js <n>`) are global and other packs are being written at the same time: read your level's
  current number from the start of its line in `node tools/test.js --pack N` before using it.

## Themes and difficulty
The forgiveness band is the jitter success rate of the hardest round of each level; no round may fall below the lower
number minus ten. Order each pack from easiest to hardest.

| Pack | Fixtures | Theme | Players | Hardest round |
| --- | --- | --- | --- | --- |
| 4 | 21-28 | Set pieces: corners, free kicks near the box, throw-in and kick-off routines. The ball starts dead with the taker; walls are slow, short-leashed zone defenders; rehearsed runs, blocks and near-post flicks. | 3-4 | 60-85% |
| 5 | 29-36 | Counter-attacks: winning it deep and breaking at speed against recovering defenders; numbers up, numbers level, carrying to commit a man, tight but fair clocks. | 3-4 | 55-80% |
| 6 | 37-44 | Strikes and lay-offs: moves that end with a shot from the edge of the box or a first-time finish; knock-downs, set-backs, the late runner from midfield, shooting across the keeper. | 3-4 | 50-75% |
| 7 | 45-52 | Breaking a low block: eight or nine behind the ball, little space in behind; overloads, decoys that move a line, quick combinations in tight areas, the cut-back from the byline. | 4-5 | 40-65% |
| 8 | 53-60 | The big games: the hardest and most varied moves in the game, five players, two decoys, sweeper-keepers, pressers; the last fixture is the hardest of all sixty. | 4-5 | 30-55% |

## Final reply
The output of `node tools/test.js --pack N --jitter` verbatim, one line per level (its idea, how it finishes, its
defensive shape), and anything in the engine that stopped you building what you wanted.
