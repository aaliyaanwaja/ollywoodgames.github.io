# Foundations: what the owner asked for (23 Nov 2026)

One-Man Team is a mobile football game: each level is one attacking move, built one player at a time, with every earlier
player replaying alongside while defenders react live. The owner's instruction, in his words:

"I want you to first go back and look at the first product you made of 20 levels - it was fantastic. I do not want us to
lose the core playability and idea of it because it was genuinely very enjoyable. So, go back to those levels and find the
rules and logic used to create those levels. Then, using that core foundation for the game, expand on a more detailed
football rulebook that handles the game scenarios we use for levels that create enjoyable games. Then, we will use those
rules to expand and create an infinite amount of levels, if we need to. If you need human feedback, create the games and
give them to me to rate on specific scales you need. From there, we will settle on a logic."

## The baseline
The build he means is the Saturday-evening build: git tag `baseline-20`, checked out read-only at `/home/claude/baseline`.
Its engine (`one-man-team/js/sim.js`) is byte-identical to today's. Its 20 levels are `one-man-team/js/levels/pack1-3.js`
there, with their bot solutions in `tools/scripts/`, the design guide the designers followed in `tools/LEVEL_DESIGN.md`,
and the engine notes in `tools/AI_NOTES.md`. Today's repo, `/home/claude/ollywoodgames.github.io`, has since grown to 60
levels (packs 4-8, brief in `tools/PACKS_4_8.md`), with clocks lengthened by 20% and fixtures 5-6 eased.

## What we know from the owner's own play (the only human data so far)
- Baseline build: "very challenging but really fun and very addictive. I replayed levels over 20 times to get it right."
  The 20+ takes were on a later fixture (he did not say which). He also said the first few were still too tough to learn on.
- Today's build, fixture 60 (meant to be the hardest of all): beaten in about two takes. "Very easy."
- He disliked slow-motion aiming: "feels too easy".
- Earlier complaints, since fixed inside the baseline: shots too soft, keeper too big, too much text on screen.

## What we know from instruments
- `node tools/test.js --jitter`: success rate of each level's scripted bot when its timing, aim and power are nudged.
  It measures how fragile ONE scripted route is. It predicted fixture 60 would be the hardest. It was wrong.
- `node tools/windows.js [levels]` (copied into the baseline checkout too): for each round, how far one parameter of the
  bot's route can move alone before the round fails. Findings on today's build: pass direction can be 40-80 degrees off and
  pass power almost anything, run timing usually has 2-4 seconds of slack, and the only tight number is the final shot on
  the bot's particular route, which a person simply does not take.
- A pass is accepted if it survives 0.9 seconds; the consequences of a poor pass land on the next player's round.

## The question behind the question
Why did a later baseline fixture take its own inventor 20+ takes and feel great, while fixture 60 took two and felt empty,
on the same engine? Whatever the answer is, it is the foundation, and the rulebook and any level generator must be built on it.

## Ground rules for everyone on this workstream
- Evidence first. Say what you measured, how, and what you are inferring. Do not present a guess as a finding.
- The baseline checkout is read-only. Write only where your own brief says.
- Plain British English. No citation tags or footnote markup in files. No git.
