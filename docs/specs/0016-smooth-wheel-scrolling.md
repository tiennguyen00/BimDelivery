# 0016. Smooth wheel scrolling on every page, with Lenis

**Date**: 2026-10-09
**Status**: Accepted

## Summary

On a desktop, scrolling with the mouse wheel now glides to a gentle stop instead of halting on each notch. A small library called Lenis does this on every page. Anchor links and the skip link also glide, through the browser's own smooth scrolling. Phones, tablets, and visitors who ask for reduced motion keep plain native scrolling. This adds a second animation dependency next to `motion`, so the rule that `motion` is the only one changes.

## Context

The site's scroll was fully native. On a desktop with a mouse wheel each notch moves the page a fixed step and stops dead, which reads as abrupt on a site that otherwise leans on gentle motion (the scroll reveal, the Project page's parallax and hero scroll). The engineer wanted the whole site to feel smoother, with a soft slowdown when scrolling stops.

Forces that shaped the choice:

- **Scroll linked animations already exist.** `parallax.ts` and `hero-scroll.ts` scrub by scroll position through motion's `scroll()`, which runs on the browser's `ScrollTimeline` and `ViewTimeline` where it can. Anything that changes scrolling must keep them in step.
- **Accessibility.** Reduced motion is a full stop on this site (`src/scripts/AGENTS.md`). Keyboard scrolling, focus scrolling, and the `scroll-padding-top` under the sticky header must keep working.
- **The mobile menu locks the page** by setting `overflow: hidden` on `body` (`nav.ts`).
- **A written rule**: `motion` is the one animation dependency (`AGENTS.md`).
- **Feel is subjective.** The right amount of glide is judged by using it, not by reading about it.

## Requirements

**User stories**:
- As a desktop visitor using a mouse wheel, I want the page to ease to a stop so that scrolling feels smooth rather than stepped.
- As a visitor who asks for reduced motion, I want scrolling left exactly as my system does it.
- As a phone or tablet visitor, I want my device's own momentum scrolling, not a second layer on top.

**Acceptance criteria**:
- **AC-1**: On every page that uses `PageLayout`, one wheel step eases toward its target over roughly a second (many intermediate scroll positions) and lands on the full distance.
- **AC-2**: Touch scrolling is not smoothed (`syncTouch` stays off), so the device's native momentum applies.
- **AC-3**: With `prefers-reduced-motion: reduce`, no Lenis instance is created (no `lenis` class on `html`), a wheel step jumps natively, and `scroll-behavior` computes to `auto`.
- **AC-4**: Anchor jumps and the skip link glide through CSS `scroll-behavior: smooth`, and still stop below the sticky header (`scroll-padding-top`).
- **AC-5**: The Project page's scroll linked animations (header fade and slide in `hero-scroll.ts`, tile parallax in `parallax.ts`) follow the smoothed scroll with no change to their code.
- **AC-6**: While the mobile menu is open, Lenis is stopped (`lenis-stopped` on `html`) and the page behind does not scroll; closing the menu resumes smoothing.
- **AC-7**: With JavaScript off, or if the script fails, the page scrolls natively and nothing is hidden.
- **AC-8**: No horizontal scroll at 390px, and no console errors.

## Options considered

### Option 1: Lenis

A small, widely used smooth scroll library (about 5.5 kB gzipped for the new script chunk, almost all of it Lenis). It eases toward the wheel's target but writes the real window scroll, so the browser still owns scrolling.

**Pros**:
- Handles the edge cases (keyboard, scrollbar drag, find in page, focus scrolls, zoom, nested scroll areas, reduced motion).
- Works with motion's `scroll()` timelines because the scroll position stays real.

**Cons**:
- A second animation dependency, against the written rule.
- Takes the wheel away from the browser on desktop, which some visitors notice.

### Option 2: Build the same effect on `motion`

About 60 lines: listen for wheel events, cancel them, and animate the scroll position with motion's `animate`.

**Pros**:
- No new dependency; keeps the rule as written.

**Cons**:
- Every edge case Lenis already handles has to be found and handled again, and kept working.

### Option 3: Lag only the scroll linked layers

Leave the page's scroll native and give the parallax and hero layers a spring that trails the scroll, so they settle after the page stops.

**Pros**:
- No scroll hijacking at all.

**Cons**:
- Only the Project page gains anything.
- Moves those animations off the browser's compositor (the part that draws without waiting on JavaScript) and onto the main thread, so they can stutter on slow devices.

### Option 4: CSS `scroll-behavior: smooth` alone

One line of CSS.

**Pros**:
- Free, native, and turned off by the existing reduced motion rule.

**Cons**:
- Smooths only anchor jumps and scripted scrolls, never the wheel, so it does not deliver the feel asked for.

## Decision

**Chosen option**: Option 1: Lenis, combined with Option 4.

Every page smooths desktop wheel scrolling with Lenis, and the browser's own `scroll-behavior: smooth` handles anchor jumps and scripted scrolls.

**Implementation skills**: `motion` (`motiondivision/ai-kit`, `.agents/skills/motion/`), for checking the `scroll()` animations still follow

## Rationale

Lenis was prototyped on the dev server and the engineer approved the feel. It keeps the scroll position real, which is what lets the existing `scroll()` animations and `scroll-padding-top` keep working untouched. Building the same thing on `motion` (Option 2) keeps the rule but means owning every scroll edge case. A trailing spring (Option 3) helps only the Project page and costs the compositor. CSS alone (Option 4) never touches the wheel, so it is kept only for anchors. Lenis costing a second dependency was judged worth it; the rule is amended rather than worked around.

## Feature design

**How it is built** (all shipped on `feat/smooth-scroll`):

- `src/scripts/smooth-scroll.ts`: creates one Lenis instance with `lerp: 0.12` (how far the page closes on its target each frame; Lenis's default is 0.1, a touch higher keeps it subtle because trackpads already add momentum) and `autoRaf: true` (Lenis runs its own frame loop). Imports `lenis/dist/lenis.css`. Returns early on reduced motion.
- Mobile menu: a `MutationObserver` (a browser API that reports DOM changes) watches `body`'s `style` attribute and calls `lenis.stop()` while `overflow` is `hidden`, `lenis.start()` otherwise. `nav.ts` is unchanged; neither module knows about the other.
- Loaded once from `src/layouts/PageLayout.astro` in its own `<script>`, so every page gets it.
- `src/styles/global.css`, `@layer base`: `html { scroll-behavior: smooth; }`. The existing reduced motion rule already sets it back to `auto`.

**Value sourcing**:
| Action | Value | Source |
|---|---|---|
| Wheel glide | Easing per frame | `LERP` constant in `smooth-scroll.ts` (0.12) |
| Pause during menu | Locked or not | `document.body.style.overflow`, written by `nav.ts` |
| Reduced motion | On or off | `prefers-reduced-motion` media query |
| Anchor stop point | Offset below header | `scroll-padding-top` in `PageLayout.astro` |

**Key invariants**:
- Lenis writes scroll with `behavior: "instant"`, so the CSS `scroll-behavior: smooth` never doubles up on it.
- `scroll()` offsets in `parallax.ts` and `hero-scroll.ts` measure the real scroll, so they need no Lenis awareness.
- Lenis CSS disables pointer events on iframes only while a smooth scroll is moving (`lenis-smooth`); the Contact page's Turnstile iframe is clickable once the page stops.
- Any future inner scroll area (a panel with its own scrollbar) gets `data-lenis-prevent`, so the wheel scrolls it and not the page.
- The menu lock stays an inline `overflow: hidden` on `body`; if `nav.ts` changes how it locks, the observer must follow.

**Security model**: not applicable (no data, no network).

**Critical test scenarios**:
- Wheel step on the home page eases over about a second and lands on target, verifies **AC-1**
- Reduced motion context: no `lenis` class, wheel jumps, `scroll-behavior: auto`, verifies **AC-3**
- Open the mobile menu, wheel over the page, scroll position does not move; close, it scrolls again, verifies **AC-6**
- Project page: header opacity and `top` change and parallax transform changes as the page glides, verifies **AC-5**
- Skip link from 2000px glides to the top, verifies **AC-4**

## Build plan

1. (done) Add `lenis` (1.3.26) as a dependency, satisfies **AC-1**
2. (done) Write `smooth-scroll.ts` with the reduced motion return and the menu lock observer, satisfies **AC-1**, **AC-2**, **AC-3**, **AC-6**, **AC-7**
3. (done) Load it from `PageLayout.astro`, satisfies **AC-1**
4. (done) Add `scroll-behavior: smooth` to `html` in `global.css`, satisfies **AC-4**
5. (done) Check in Chrome on the built site: wheel, reduced motion, mobile menu, Project page animations, skip link, 390px width, console, satisfies **AC-1** to **AC-8**

## Consequences

**Positive**:
- Desktop scrolling glides on every page, with no change to any existing animation.
- Anchor and skip link jumps glide instead of snapping.

**Negative / tradeoffs**:
- A second animation dependency (about 5.5 kB gzipped on every page), and the rule that `motion` is the only one no longer holds.
- On desktop the wheel no longer moves the page directly; some visitors notice and dislike that.
- Trackpads already have momentum, so they get a little extra float.
- The mobile menu's lock and Lenis are coupled through the body's inline style; a change to how `nav.ts` locks can quietly break the pause.

**Neutral**:
- Touch devices are unaffected.
- The glide strength is one constant (`LERP`) to tune.

## Follow-up

- [x] Amend the rule in root `AGENTS.md` (Stack and Rules) and in `src/scripts/AGENTS.md` (Files and Conventions) so `lenis` is named next to `motion`, imported only by `smooth-scroll.ts`
- [x] Add a line to `docs/design.md` under Focus and motion describing the wheel glide and its reduced motion cut
