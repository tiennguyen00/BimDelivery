# 0010. Rationale: the About Us page

The decision record for [index.md](index.md). `/develop` does not need this file.

## Context

> ⚠️ Premise note: the page is meant as a temporary layout to polish later. Temporary is not a reason to hardcode it: `AGENTS.md` requires page content from content collections, and a hardcoded page would be rebuilt at the polish step. The content driven version costs little more here, because most parts already exist. The second risk is the reference copy itself: it names five ISO standards, and copying them onto this site would read as a real claim.

Scope feature 7 asks for an About Us page that renders from content across three breakpoints, reuses design system sections, and carries its own title and description. Today `/about-us` is a stub: a heading and one paragraph from an `about` Markdown entry that also holds a photo, three highlights, a stats heading, and a story body that nothing renders.

The engineer supplied two screenshots of the reference site at 1920x1080 and asked for the same layout, plus an appearance animation. The reference has three bands: a centred heading, paragraph, and numbers; a two column band with a ruled paragraph and an accordion; and an ISO badge band on a diagonal stripe.

The forces: `AGENTS.md` rules (content from collections, zero JavaScript by default, plain scripts only, every route prerendered); the design system's gold rule, which forbids the reference's bright gold as text on white (2.41:1); the site's existing motion language (a 600ms, 24px, 80ms stagger fade and rise in `reveal.ts`, which by design never hides what is already on screen, so it cannot animate a band that is visible at load); a footer that already shows the certification badges on every page; and a numbers list already shared with the home page.

## Options considered

### Option 1: content driven composition, reusing the site's parts, CSS first motion

Three band components read a strict `about` entry, the shared `stats`, and the footer's badges; the accordion is native `<details>`; the top band's entrance is a CSS keyframe; the lower bands reuse `reveal.ts`.

**Pros**: follows every `AGENTS.md` rule; no new script or dependency; polish later is a content and style pass; produces a reusable accordion.

**Cons**: touches shared pieces (`emphasis.ts`, `StatsBand`, `Footer`), so the change is wider than one page; the CSS slide is not in every browser yet.

### Option 2: one hardcoded page file, fastest possible

Write the three bands straight into `about-us.astro` with the copy inline, since the layout is temporary.

**Pros**: fastest to build; touches nothing shared.

**Cons**: breaks the content collection rule; the polish becomes a rewrite; duplicates the badges and numbers, which then drift.

### Option 3: content driven, with a scripted accordion and a scripted entrance

As Option 1, but the accordion is a small script animating height in every browser, and `reveal.ts` gains a load entrance mode.

**Pros**: the slide plays in every browser; all motion lives in one script.

**Cons**: more JavaScript for a page that needs none; a script driven entrance must hide on screen content before the script arrives, which either flashes or needs a CSS rule waiting on a script, both of which the site has ruled out.

## Rationale

Option 1 is the only one that meets the content rule and the zero JavaScript rule together, and nearly every part it needs already exists. The engineer chose each visible behaviour in the interview; the calls below were made at write time.

- **CSS keyframes for the load entrance** (runner up: a load mode in `reveal.ts`). A keyframe runs from the first paint, so nothing is shown and then hidden, it works with JavaScript off, and reduced motion is one media query. A script arrives after the first paint, so it would have to hide the band first. Matching `reveal.ts`'s timing keeps one motion language.
- **Native `<details>` with a shared `name`** (runner up: a scripted disclosure). The browser gives the one open at a time behaviour, keyboard support, and the expanded state to screen readers for free. Browsers without `name` support let both items open, which is harmless.
- **CSS only slide** (runner up: a height script). The engineer picked it. It degrades to an instant open, which is the current behaviour anyway.
- **A second mark in the one helper** (runner up: a separate function only the about page uses). One scanner and one schema check keep one syntax for editors; a second function would let `==` pass through the other fields unchecked and render as literal text.
- **A shared `Emphasis` component** (runner up: a fourth hand written loop). The loop now needs three branches and a surface aware gold, and would be copied into three bands plus two existing callers.
- **Restyle `StatsBand`** (runner up: an about only numbers list). No page uses it today, only `/styleguide`, so giving it the reference look costs nothing and keeps one numbers component.
- **Strict YAML for `about`** (runner up: keep Markdown and ignore the body). The body is no longer rendered, and every other page entry with structured sections (`home`) is strict YAML, so a leftover key fails by name.
- **Footer prop rather than CSS on the page** (runner up: hide the panel with a page level selector). A prop is explicit, type checked, and keeps the markup out of the HTML instead of hiding it.
- **`Accordion` in the design system** (runner up: inside `CapabilityBand`). The service pages (feature 8) are the next likely user, and it has no about specific content.
- **Headings in capitals by CSS, paragraphs left aligned.** The engineer's pick: the reference look for headings, while left aligned text avoids the uneven word gaps justified text opens at tablet and phone widths.
- **Four shared numbers, footer badges** (the engineer's picks). One source each, so the About and home pages and the footer can never disagree.
