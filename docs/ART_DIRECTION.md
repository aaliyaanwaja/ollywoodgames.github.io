# One-Man Team: art direction

Owner's brief: it must look professionally made, with a clear identity of its own. References for feel: Score Hero (career
of match moments, stars, the thrill of one decisive move) and Does Not Commute (top-down, warm, retro, a little wry).

## The idea: tabletop football, printed matchday programme
The game is about arranging a move, so it looks like a tabletop football set and the paper that comes with it.
- **The pitch** is a felt cloth laid on a table: woven texture, soft mowing bands, chalk lines that are slightly uneven,
  a soft shadow under everything that stands on it.
- **Players** are tabletop figures seen from above: a round weighted base in the kit colours, a small figure on top
  (shoulders and head), a squad number that is always legible. Opponents are a different kit, never just "red dots".
- **The interface** is a printed matchday programme and ticket stubs: cream paper, navy ink, one or two spot colours,
  condensed bold type, hard offset shadows like slightly misregistered print, perforated edges, halftone dots.

## Rules
1. **Light, not dark.** Paper cream is the base of every menu. The only dark surfaces are ink. No glow, no glassmorphism,
   no gradients except subtle paper or felt shading.
2. **Ink palette** (use these exact values, as CSS variables in `:root`):
   - paper `#F2EAD8`, paper-shade `#E6DCC3`, ink `#14213D`, ink-soft `#4A5573`
   - felt `#2F7D4F`, felt-dark `#2A7046`, chalk `#FBF8F0`
   - tomato `#E4572E` (primary action, your team), mustard `#F2B705` (stars, highlights, the live player's ring),
     sky `#8EC5D6` (secondary accents)
   - Kit colours come from level data when present (`level.kit = { us: [primary, secondary], them: [primary, secondary] }`);
     defaults: us tomato and paper, them ink and sky. The goalkeeper wears mustard.
3. **Type** (self-hosted, no network at runtime; files in `one-man-team/fonts/`, from the `@fontsource` npm packages, latin subset, woff2):
   - Display: **Anton** for titles, big numbers, GOAL, the level names.
   - Labels and buttons: **Barlow Condensed** 600/700, uppercase with 0.04em tracking.
   - Reading text: **Barlow** 500, 15-16px, line-height 1.4.
   - Canvas text (squad numbers, pitch labels) uses Barlow Condensed 700.
4. **Shape.** Corners 6px at most. Borders 2px ink. Elevation is a hard offset shadow (`3px 3px 0 ink`), which collapses
   on press. Buttons are chunky and at least 48px tall. Level tiles are ticket stubs with a perforated notch.
5. **No emoji, no stock icon font.** Every icon is a small inline SVG drawn in the same 2px ink line. Stars are a custom
   five-point shape with an ink outline, filled mustard when earned.
6. **Motion** is physical and quick: 120-200ms, ease-out, things flick, stamp and slide like card and paper. Respect
   `prefers-reduced-motion`.
7. **Copy** is short, British football English, confident and a little dry. No exclamation marks except GOAL. Sentence
   case in reading text, uppercase only in labels.
8. **Legibility beats decoration** on the pitch: the live player, the ball, the pass target, the offside line and every
   defender must be readable at a glance on a 360px-wide phone in sunlight.

## What "professional" means here
Consistent spacing on a 4px grid; one type scale; every state designed (empty, locked, pressed, disabled, failed);
nothing overlapping or clipped at 360x640 and at 430x932; no default browser styling visible anywhere; transitions between
screens rather than hard cuts; the first ten seconds teach the game without a wall of text.
