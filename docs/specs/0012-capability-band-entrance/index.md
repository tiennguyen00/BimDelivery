# 0012 · About Us page, capability band load entrance

**Status**: Assumed
**Date**: 2026-09-25
**Authorized by**: tiennguyen00, during /develop

## Owed decision
Spec 0010 AC-13 gives the capability band only the scroll reveal. The scroll reveal never hides what is already on screen, and on a desktop the band is on screen at load (its columns start at about 707px at 1920x1080, 736px at 1440x900 and 1366x768), so on those screens the band never moves. The engineer asked for it to appear with an animation. How it should move when it is on screen at load was not settled, and the answer breaks spec 0010's rule that the `entrance` utility never shares an element with the scroll reveal.

## Assumption built on
- The capability band's two columns (the heading and paragraphs, then the accordion) take the CSS `entrance` utility, with steps that carry on from the about band: the page passes `entranceFrom` as `2 + stats.length` (today 6 and 7), so the columns rise right after the last number.
- The grid keeps `data-reveal-stagger`. The two hooks split the work by where a column sits at load: on screen, the scroll reveal leaves it alone and the entrance plays; entirely below the fold (a phone), the scroll reveal hides it and reveals it on scroll, and the entrance plays unseen underneath, from opacity 0 to the scroll reveal's inline 0.
- This is safe because the two move different properties (`entrance` uses `translate`, the scroll reveal `transform` and inline `opacity`), and the entrance keyframes set only a `from`, so its end is whatever the element's own style says. The rule "never combine `entrance` with the scroll reveal" stays for every other band; this band is the one written exception.
- The heading's gold rule is unchanged: on screen at load it stays full width, as `reveal.ts` already does for any heading on screen at load.
- No script changes, no new dependency. JavaScript off still plays the entrance; reduced motion shows everything at once.

## Code area
- `src/components/about/CapabilityBand.astro`
- `src/pages/about-us.astro`
- `src/styles/global.css` (the `entrance` utility's comment)
- `docs/design.md` (`## Focus and motion`)

## Requirements
- At 1920x1080, 1440x900, and 1366x768, on load, the capability band's start column then its end column fade in and rise 24px over 600ms with an ease out, 80ms apart, after the about band's last number.
- At 390x844 (band below the fold), the columns are hidden at load and reveal one after the other on scroll, as before.
- With JavaScript off, the band still plays its load entrance and ends fully shown. With reduced motion, nothing moves and the band is fully shown.
- Nothing around the band shifts while it moves.

## Ratify
This decision was recorded by /develop, not deliberated. Run `/architect about us page`
to deliberate and ratify it (and fold it into spec 0010's AC-13). Until then it stays flagged as an owed decision; it does not block marking the feature `done`.
