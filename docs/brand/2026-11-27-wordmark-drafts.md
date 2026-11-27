# Wordmark drafts v2: no trail of letters

27 November 2026. The owner asked for the logo to be redone without the dashed, misregistered copy of the lettering behind the wordmark ("Redo logo without the trail of letters behind it. I don't like it. Give me drafts."). These are five drafts. Nothing live has changed: the game, `js/brand.js`, the icons, the lockups in `one-man-team/icons/` and `tools/brand.py` are all as applied in `2026-11-27-ghost-trail-applied.md`. The app icon (No. 1 with two dashed ghosts on felt) is unchanged in every draft.

All lettering is outlined Anton (Barlow Condensed for the small "NO." and the number in the disc), from `one-man-team/fonts/`, kerned with HarfBuzz as before. Colours are only the house palette: paper, ink, felt (in the icon), tomato, mustard. No gradients.

## Where to look

- Overview, all five side by side (paper, ink, home masthead at real size): `/home/claude/shots/wordmark-overview.png`
- One contact sheet per draft (wordmark on paper and ink, horizontal and stacked lockups with the current icon on paper and ink, the masthead at 390 px, the stacked wordmark): `/home/claude/shots/wordmark-draft-a-clean-pass.png` to `wordmark-draft-e-ticket-strip.png`
- The masthead captures alone: `/home/claude/shots/wordmark-masthead-a.png` to `-e.png` (taken from the real home screen at 390 x 844, 2x, with the draft dropped into `#brand` at the size of the 40 px title)
- SVGs: `concepts/wordmark-v2/wm2-<letter>-<name>-<form>.svg`, nine per draft: `wordmark`, `wordmark-dark`, `wordmark-stack`, `wordmark-stack-dark`, `lockup`, `lockup-dark`, `lockup-stack`, `lockup-stack-dark`, `masthead`
- Generator (outside the repository, drafts only): `/home/claude/wordmark-v2/drafts.py` (the five wordmarks, using `tools/brand.py` for fonts, palette and icon) and `render.py` (SVGs and sheets). Run `python3 /home/claude/wordmark-v2/render.py`.

## The drafts

**A. Clean pass.** Solid ink Anton, no shadow. The hyphen becomes a short tomato arrow, so ONE passes to MAN. The quietest of the five and the easiest to use anywhere (one colour plus one accent). The risk: at the masthead the arrow is small, so it can read as a slightly odd hyphen rather than a pass.

**B. Programme print.** Solid ink Anton over one flat tomato offset print, slightly heavier than before, and nothing else. This is the style every other title in the game already uses (`.title` has a 2 px tomato text shadow), so the masthead stops being a special case. It is the closest to what is live, minus the trail. It is the least distinctive on its own.

**C. Run of three.** Plain lettering. The ghost idea moves out of the letters into one small mark in front of the name: two dashed rings, fainter then stronger, then the No. 1 disc (mustard ring, tomato base, as in the icon). It keeps the story of the icon in the wordmark. Next to the icon in a lockup, the No. 1 appears twice; if chosen, the lockups would probably drop the rings and keep the plain name.

**D. Chalk run.** Plain lettering over a dotted tomato run, the dotted line from the icon, ending in a mustard ball past the M of TEAM. The move goes under the name and arrives at the ball. In the stacked form the run sits under TEAM and runs the width of ONE-MAN. At masthead size the dots are fine but still read as a line.

**E. Ticket strip.** Paper lettering on an ink ticket with a tomato "NO. 1" stub, a perforation and a hard mustard offset (tomato on ink). It matches the fixture tickets on the home screen and is the boldest block of the five. It is also the widest: at 390 px it fills the masthead up to the Options button. It needs more care at small sizes (the "NO." on the stub is tiny in the masthead).

## Not decided here

The cover title (two lines), share card, landing page and feature graphic would follow whichever draft is chosen, using its stacked form. Nothing is applied until the owner picks one.

## Chalk run variations (no underline)

The owner liked D (Chalk run) as "clean and nice" but not the underline ("Looks like a spelling mistake"). Six variations keep the plain lettering and the mustard ball, with no line under the name. Still drafts only; nothing live has changed.

- Overview (paper, ink, real-size masthead for each): `/home/claude/shots/wordmark-d-overview.png`
- One sheet per variation (wordmark, horizontal and stacked lockups with the current icon, masthead, stacked form): `/home/claude/shots/wordmark-d-d1-plain.png` to `wordmark-d-d6-stacked-block.png`
- SVGs: `concepts/wordmark-v2/d-variations/wm2-d<n>-<name>-<form>.svg`, the same nine forms as above
- Generator: `/home/claude/wordmark-v2/d_variations.py` (run `python3 /home/claude/wordmark-v2/d_variations.py`)

**D1. Plain.** Anton only, ink on paper and paper on ink, nothing added. This is the baseline. It is clean but has nothing of its own, so the icon carries all the character.

**D2. Full stop.** The mustard ball is the full stop after TEAM. It is the smallest possible accent and reads as punctuation, so it cannot look like a mistake. It is the safest of the six.

**D3. Ball hyphen.** The ball takes the hyphen's place, at hyphen height: ONE (ball) MAN. It still reads as One-Man at a glance. At masthead size the ball is small (about 9 px), so it could pass for a bullet.

**D4. Two-tone.** ONE-MAN in ink (paper on ink), TEAM in tomato, and the ball as the full stop. The colour split plays on the name: one man, a whole team. It has the most colour of the six but is still flat print.

**D5. Pass over the gap.** A short dotted tomato pass from the M of MAN, over the word space, landing as the ball on top of the T. It is the only one with a line, and it is above the name, never under it. It adds height, so the masthead grows by about 18 px. At masthead size the ball on the T can look like a dot over a letter.

**D6. Stacked block.** ONE-MAN over TEAM, with TEAM letter-spaced to the width of ONE-MAN and the ball closing the block. It suits the cover, the landing page and the lockups. Its one-line form is the same block, so the home masthead shows it two lines tall (46 px), which is much smaller per line than the 40 px title. If chosen, the masthead would more likely use D2 and keep D6 for stacked uses.
