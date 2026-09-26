# 0012. Give the About page's capability band both the load entrance and the scroll reveal

**Date**: 2026-09-25
**Status**: In Progress
**Scope feature**: 7, About Us page (`docs/scope/scope.md`)
**Amends**: spec [0010](../0010-about-us-page/index.md), AC-13
**History**: recorded as an assumption by /develop on 2026-09-25, deliberated and ratified by /architect the same day

## Summary

On a desktop, the capability band (the About page's second band) is already on screen when the page loads. The scroll reveal never moves anything already on screen, so the band never moved. Its two columns now also take the CSS load entrance (a fade and 24px rise that needs no script). They rise right after the about band's last number, and on a phone, where the band starts below the fold, the scroll reveal still moves them. This band is the one written exception to the rule that the `entrance` utility never shares an element with the scroll reveal.

## Requirements

**User stories**:
- As a visitor on a desktop, I want the capability band to arrive with the same motion as the band above it, so the top of the page reads as one continuous entrance rather than one moving band beside a still one.
- As a visitor on a phone, I want the capability band to reveal as I scroll to it, as every other lower band does.

**Acceptance criteria**:
- **AC-1**: At 1920x1080, 1440x900, and 1366x768, where the band is on screen at load, the start column (heading and paragraphs) and then the end column (the accordion) fade in from transparent and rise 24px into place over 600ms with an ease out, the end column starting 80ms after the start column, and the start column starting 80ms after the about band's last number begins (480ms after load with today's four numbers). No script is involved.
- **AC-2**: The columns' steps follow the `stats` entry: the start column's `--entrance-step` is `2 + stats.length` and the end column's is one more, so adding or removing a number keeps the band starting right after the last one.
- **AC-3**: At 390x844, where the band is entirely below the fold at load, both columns are hidden at load and reveal one after the other (80ms apart) when 20 percent of each is in view, fading and rising 24px over 600ms. Once settled, each column holds only its `--entrance-step` inline style (no leftover `opacity` or `transform`).
- **AC-4**: In the one column layout (below 1024px), a column that is at least partly on screen at load moves by the load entrance, and a column entirely below the fold at load reveals on scroll, each decided on its own.
- **AC-5**: The capability heading's gold rule, when the heading is on screen at load, stays full width throughout the entrance (the site wide rule for a heading on screen at load). When the heading starts below the fold, the rule draws with the scroll direction as spec 0005 describes.
- **AC-6**: With JavaScript off or a failed script, the load entrance still plays and the band ends fully shown. With reduced motion asked for, nothing moves and the band is fully shown from the first frame.
- **AC-7**: Nothing around the band shifts while it moves: the certification band below it and the footer hold their place.
- **AC-8**: The exception is written down where the rule lives: the `entrance` utility's comment in `global.css`, `docs/design.md` `## Focus and motion`, and spec 0010's AC-13 all name the capability band's two columns as the only elements that take both the `entrance` utility and the scroll reveal, and no other element in `src/` takes both. (Amended by spec [0013](../0013-service-pages/index.md) AC-15: the reveal units of the block right after a service page's intro are the second pairing, written down in the same three places.)

## Decision

**Chosen option**: Option 1: both hooks on the columns, as built.

The capability band's two columns carry the `entrance` utility (steps `2 + stats.length` and one more) and stay direct children of the `data-reveal-stagger` grid. Whether a column is on screen at load decides which of the two the visitor sees. Reasoning and the options weighed: see [rationale.md](rationale.md).

**Implementation skills**: `astro` (`astrolicious/agent-skills`, `.agents/skills/astro/`) · `tailwind-4-docs` (`lombiq/tailwind-agent-skills`, `.agents/skills/tailwind-4-docs/`) · `motion` (`motiondivision/ai-kit`, `.agents/skills/motion/`)

## Feature design

**How the two hooks split the work** (this is the load bearing mechanism, so every step is spelled out):

1. The HTML ships each column with `class="entrance"` and `style="--entrance-step: N"`. The CSS animation starts at once, and during its delay the element sits at the first keyframe (`opacity: 0`, `translate: 0 24px`), because the animation fills both ways (`both`).
2. `reveal.ts` runs as a module script, after parsing. For each direct child of `[data-reveal-stagger]` it asks whether the child's top is at or below the bottom of the viewport (`isBelowFold`, read from `getBoundingClientRect`).
3. **On screen** (desktop): the reveal leaves the column alone. The entrance plays to the column's own resting style, fully shown.
4. **Below the fold** (phone): the reveal writes inline `opacity: 0` and `transform: translateY(24px)`. The entrance's `from` keyframe is its only keyframe, so it ends at whatever the element's own style says (the inline 0), and it runs from 0 to 0 unseen. When the column scrolls into view, motion's Web Animation (which ranks above a CSS animation in the cascade) takes opacity to 1 and transform to none. The script then removes both inline properties, and the entrance, still filling, now resolves to the column's normal style, fully shown.
5. The two never write the same property: the entrance moves `translate` and animates `opacity` from a CSS animation. The reveal moves `transform` and writes `opacity` inline, then animates it from a Web Animation. `translate` and `transform` are separate CSS properties that compose.

**Value sourcing**:

| Action | Value produced | Source |
|---|---|---|
| Start column's entrance step | `2 + stats.length` (6 today) | `ABOUT_ENTRANCE_STEPS` (2: the about band's heading and paragraph) plus `stats.length` from `getStats(lang)`, both in `src/pages/about-us.astro`, passed as `entranceFrom` |
| End column's entrance step | `entranceFrom + 1` | `entranceStyle(1)` in `CapabilityBand.astro` |
| Entrance delay, duration, rise, easing | 80ms per step, 600ms, 24px, `ease-out` | the `entrance` utility and keyframes in `src/styles/global.css` (spec 0010) |
| On screen or below the fold | per column, at script start | `isBelowFold` in `src/scripts/reveal.ts` (spec 0005) |
| Scroll reveal threshold, stagger, duration, rise | 20 percent, 80ms per hidden sibling, 600ms, 24px | `AMOUNT`, `STAGGER_S`, `DURATION_S`, `RISE_PX` in `reveal.ts` |
| Heading rule on load | full width when on screen at load | `reveal.ts` heading half (spec 0005), unchanged |

**Key invariants**:
- The capability band's two columns are the only elements in `src/` with both the `entrance` class and a scroll reveal hook (`data-reveal`, or being a direct child of `data-reveal-stagger`). Any new pairing needs its own spec. (Spec [0013](../0013-service-pages/index.md) is the second: the block right after a service page's intro.)
- The entrance keyframes set only `from`. A `to` keyframe would override the scroll reveal's inline `opacity: 0` on a phone and show the column before it scrolls in.
- The entrance moves `translate`, never `transform`, and the reveal moves `transform`, never `translate`.
- No CSS rule hides the band waiting for a script.
- `entranceFrom` is optional on `CapabilityBand`; left out, the columns take no entrance.

**Security model**: a public, prerendered page with no input and no runtime request. No change from spec 0010.

**Configuration required**: none.

**Critical test scenarios**:
- Desktop load at 1920x1080, 1440x900, 1366x768: start column then end column rise after the last number, verifies **AC-1**.
- Change the number of items in `stats`, rebuild, check the two `--entrance-step` values, verifies **AC-2**.
- Phone at 390x844: columns hidden at load, reveal one after the other on scroll, no leftover inline `opacity` or `transform`, verifies **AC-3**.
- Tablet at 768x1024: the start column, partly on screen, rises on load; the accordion below the fold reveals on scroll, verifies **AC-4**.
- Heading rule at 1920x1080 stays full width through the entrance; at 390x844 it draws on the way down, verifies **AC-5**.
- JavaScript off and reduced motion at 1920x1080, verifies **AC-6**.
- Watch the certification band and footer while the band moves, verifies **AC-7**.
- Search `src/` for `entrance` and confirm only the about band's elements and the capability columns carry it, with only the columns inside a reveal hook, verifies **AC-8**.

## Build plan

Built under the project's Skateboard approach as one small slice on the already shipped page. The markup and docs landed in commit `1568b0d`. What is left is the paperwork this ratify owes and the check.

1. [x] Add the optional `entranceFrom` prop to `CapabilityBand.astro`, giving each column the `entrance` class and `--entrance-step` of `entranceFrom + column`, satisfies **AC-1**, **AC-4**.
2. [x] Pass `entranceFrom={ABOUT_ENTRANCE_STEPS + stats.length}` from `about-us.astro`, satisfies **AC-1**, **AC-2**.
3. [x] Keep `data-reveal-stagger` on the grid and `data-heading-rule` on the heading, unchanged, satisfies **AC-3**, **AC-5**.
4. [x] Record the exception in the `entrance` utility's comment in `global.css` and in `docs/design.md` `## Focus and motion`, satisfies **AC-8**.
5. [x] Amend spec 0010's AC-13 and its band table to name the exception and link this spec (done by this ratify), satisfies **AC-8**.
6. [x] Drop the word "assumed" from the spec 0012 mentions in `CapabilityBand.astro`, `about-us.astro`, `global.css`, and `docs/design.md`, now that the decision is ratified, satisfies **AC-8**.
7. [ ] Run [verify.md](verify.md) in the browser (`/check verify about us page`), satisfies **AC-1** to **AC-7**.

## Consequences

**Positive**:
- On a desktop the top of the page reads as one cascade, numbers then the capability band, with no script.
- The phone keeps its scroll reveal, so the band never finishes moving before anyone sees it.
- No change to `reveal.ts` or any other page; the shared script stays as spec 0005 left it.

**Negative / tradeoffs**:
- The rule "never combine `entrance` with the scroll reveal" now has an exception, and the reason it is safe (separate properties, a `from` only keyframe, Web Animations ranking above CSS animations) is subtle. Someone who adds a `to` keyframe to `entrance`, or moves the entrance onto `transform`, breaks the phone behaviour. The invariants and the `global.css` comment are the guard.
- **Fold edge (accepted)**: `isBelowFold` reads `getBoundingClientRect`, which includes the entrance's 24px `translate` while the column waits. A column resting within 24px of the fold is counted as below it and handed to the scroll reveal. Only a sliver of it is on screen, and it is already transparent from the entrance's wait, so nothing visible blinks; it reveals on the first scroll. At 1366x768 the margin is about 8px.
- **Fast scroll (accepted)**: on a phone, a visitor who reaches the band within about 1.1s of load sees both rises at once, so the column briefly starts up to 48px low. The band sits far below the stacked numbers, so this is rare, and it still eases into place with no layout shift.
- On a phone the entrance runs unseen underneath the reveal, a few frames of wasted compositor work (the browser's layer painting step) per column.

**Neutral**:
- The heading's rule does not draw on a desktop load; it arrives full width, riding up with its column, as any heading on screen at load does.

## Follow-up

- [ ] Build plan task 6: remove "assumed" from the four spec 0012 mentions in code and `docs/design.md`.
- [ ] `/check verify about us page`, including [verify.md](verify.md).

## Rationale

Reasoning and options: see [rationale.md](rationale.md).
