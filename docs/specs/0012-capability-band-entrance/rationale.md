# 0012 rationale: the capability band's entrance

## Context

Spec 0010 gives the About page two kinds of motion. The top band (the heading, paragraph, and numbers) fades and rises on load through the CSS `entrance` utility, with no script. The two lower bands use the site's scroll reveal (`reveal.ts`, spec 0005), which fades and rises an element as it scrolls into view. Spec 0010 kept the two apart on purpose: the `entrance` utility never shares an element with the scroll reveal, so the two can never fight over one element.

The scroll reveal only hides what is entirely below the viewport when the script starts. That rule keeps anything on screen from blinking out and back, and it is shared by every page. On a desktop the capability band's columns begin at about 707px (1920x1080) and 736px (1440x900 and 1366x768), so they are on screen at load, and the scroll reveal leaves them alone. The result was a page where the top band moves and the band directly beside it sits still. The engineer asked for it to appear with an animation.

The forces are: the site's "motion is enhancement only, nothing on screen blinks" rule; zero JavaScript by default, with `reveal.ts` shared across the home, contact, and about pages; the same band sits on screen on a desktop and far below the fold on a phone (after the stacked numbers); and whatever moves it must end fully shown with JavaScript off and do nothing under reduced motion.

## Options considered

### Option 1: Both hooks on the columns

The columns take the `entrance` utility at the steps after the last number and stay in the scroll reveal's stagger. On screen at load, the reveal leaves them alone and the entrance plays. Below the fold, the reveal hides them and the entrance plays unseen underneath, from opacity 0 to the reveal's inline 0.

**Pros**:
- Right motion on every screen: the load cascade on a desktop, the scroll reveal on a phone.
- No script change, no new dependency; works with JavaScript off.
- The steps follow the `stats` entry, so the cascade survives content changes.

**Cons**:
- Breaks spec 0010's clean "never combine" rule with one exception whose safety depends on subtle facts (separate properties, a `from` only keyframe, the cascade ranking of Web Animations over CSS animations).
- Two small accepted edges: the 24px fold edge and the fast scroll double rise on a phone.

### Option 2: Entrance only

Drop `data-reveal-stagger` from the band, so the columns move only by the load entrance.

**Pros**:
- The "never combine" rule holds with no exception.
- The simplest markup.

**Cons**:
- On a phone the entrance finishes below the fold before anyone sees it, and the band sits still when scrolled to, the very gap this spec closes, moved to the phone.

### Option 3: Teach `reveal.ts` to animate on screen elements

Change the scroll reveal so an element on screen at load also fades and rises.

**Pros**:
- One mechanism for the band on every screen, no CSS exception.

**Cons**:
- Needs JavaScript for motion the page could have in CSS, and breaks "nothing on screen blinks" (the element must be hidden by the script after first paint).
- Changes a shared module, so every page that imports `reveal.ts` changes behaviour, including the home page's on screen bands.

### Option 4: Entrance only at `lg` and up

Use `lg:entrance`, so the entrance runs only in the two column layout, and keep the scroll reveal for the phone.

**Pros**:
- No unseen entrance on phones, and no fast scroll double rise.

**Cons**:
- A tablet (one column, 768 to 1023px) can have the start column on screen at load and would get no load motion, the same gap again at a middle size.
- Ties motion to a breakpoint when what actually decides it is where the band sits, which depends on content height.

## Rationale

The problem is not "desktop versus phone", it is "on screen at load versus below the fold", and that depends on the content above the band, not only the viewport width. `reveal.ts` already makes that call per element at runtime, and the CSS entrance already covers the on screen case without a script. Option 1 lets each do the job it already does. The script's own decision picks which one the visitor sees, so the tablet case (Option 4's gap) and the phone case (Option 2's gap) are both handled with no new logic.

Option 3 would solve it in one place but pays for it where the project is strictest: it adds script driven hiding after first paint, and it changes a module shared by three pages to fix one band. Spec 0005 and `docs/design.md` rule that out for good reason.

Option 1's cost is an exception to a rule that exists to prevent two animations from fighting. Here they cannot fight, because they write different properties and the entrance has no end keyframe of its own. That reasoning is fragile to future edits, so the spec pins it down as invariants and keeps the exception to this one band. The two edges it leaves (a column within 24px of the fold, and a phone visitor who reaches the band within about a second) are both invisible or rare, and fixing the first would mean changing the shared script for a few pixel band of viewports. The engineer confirmed each of these calls: both hooks, timing after the last number, the heading rule staying full width on load, and both edges accepted.
