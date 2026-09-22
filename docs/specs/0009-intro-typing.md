# 0009 · Home page, intro band typing effect

**Status**: Assumed
**Date**: 2026-09-22
**Authorized by**: tiennguyen00, during /develop

## Owed decision
Spec 0005 AC-8 says nothing on the intro band animates except the counter, with no caret and no blinking element. This build adds a typing effect to the heading's gold words, which reverses that rule. How long it runs (once or forever, and so whether it needs a pause control for WCAG 2.2.2) was not settled.

## Assumption built on
- `home.intro.headingHighlight` becomes a list of words (at least one). The first word is the real one: it ships in the HTML, it is what a screen reader hears, and it is what a visitor sees with no JavaScript or with reduced motion asked for. Today the words are `worldwide`, `abcxyz`, `xyzcba` (the last two are placeholders).
- Once the band is a quarter on screen, the gold words delete and retype through every word one time, then land back on the first word and stop. A plain gold caret shows only while it types, then goes away. The whole run is about 6 seconds and it never loops, so it needs no pause button. The number of passes is one constant in the script.
- The space is reserved for the longest word, so the heading and its gold rule never change width while it types.
- The intro heading drops one step on the type scale, from `text-h2` to `text-h3`, bold.
- **Changed 2026-09-22, at the engineer's request** (this replaces the run once, caret goes away, and width held bullets above): the words loop forever, from the first through every other and back, with a steady (non blinking) gold caret shown while the script runs. The width is no longer held: the live word takes only the room its letters need, so the heading box and its gold `::after` rule shrink and grow with the text. The loop has no pause button, a known WCAG 2.2.2 gap, like the hero carousel's.

## Code area
- `src/content.config.ts` (the `intro.headingHighlight` shape)
- `src/content/home/en/home.yaml`
- `src/components/home/IntroBand.astro`
- `src/scripts/typewriter.ts`

## Requirements
- With JavaScript and motion allowed, the gold words type through every listed word once and settle on the first.
- With no JavaScript, or with `prefers-reduced-motion: reduce`, the heading shows the first word, still.
- Assistive tech reads the heading as `heading` plus the first word, never the changing text.
- The heading width does not change while it types.

## Ratify
This decision was recorded by /develop, not deliberated. Run `/architect home page`
to deliberate and ratify it (and revise spec 0005 AC-8, which this contradicts). Until then it stays flagged as an owed decision; it does not block marking the feature `done`.
