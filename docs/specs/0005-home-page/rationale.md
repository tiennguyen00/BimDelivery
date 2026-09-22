# Rationale: home page · spec 0005

The reasoning behind [index.md](index.md). `/develop` does not need this file.

## Context

> ⚠️ Premise note: the scope asks for two things that pull against each other. Feature 6 says the home page shows "exactly three cards", and feature 8 says adding a fourth service should be "a data entry and a route, not a new layout". Both cannot be quietly true. Taken together they mean the home page holds a layout contract the services collection does not know about, and the failure mode if nobody names it is the worst one: a fourth service appears, the three column row reflows into an unbalanced two plus one, nothing errors, and it ships. This spec resolves it by making the contract explicit and loud (AC-4), and by enrolling a follow up to revisit it the day a fourth service is real. The alternative framings, a silent cap at three or a grid that just reflows, are recorded in Options below.

The home page is the first page in Release 1 that has real content rather than a stub, and it is the page every later page borrows from. Four things are already settled and constrain it:

- **The content model is complete for this page.** Spec 0002 defined the `home` collection with all nine sections, the `stats` collection, and the `services` collection, and `src/content/home/en/home.yaml` is filled with placeholder copy and real stock images. Nothing about this feature needs a schema change, which means the whole feature is composition and the risk lives in the composition rather than in the data.
- **The design system is `Accepted` and narrow on purpose.** Spec 0003 gives `Section` two tones, both light, `Button` two variants, and one invariant that matters here: no component adapts to its background. It also draws a hard line on gold: full gold is a fill carrying black, never a word, because it measures 2.41:1 on white.
- **The shell exists.** Spec 0004 gives every route a frame, and it set the precedent for how a plain script reaches a component: a module in `src/scripts/`, imported from one component `<script>`, enhancing markup that already works without it.
- **Zero JavaScript is the project default.** `AGENTS.md` allows plain scripts for nav, dropdown, mobile menu, and counters, and React only for the contact form island. So the stats counter is allowed, and it is the only thing on this page that is.

The forces that actually shaped the decision are the tension between those last two and the page's ambitions. The reference layout wants a counter that moves and a page that ends on brand colour. The design system, as written and already accepted, supports neither directly: it has no third tone, no button that reads on gold, and no client script pattern beyond the nav. Deciding how to pay for those two things, without reopening an accepted spec or quietly breaking its invariants, is most of the decision here.

A fifth force is smaller but real: three of the sections on this page reappear on pages that have not been built yet. About carries a `statsHeading` field that exists for exactly the band this page needs, and every service entry carries a `cta` block of exactly the shape this page's closing band consumes. Deciding now whether those become shared components or home local ones sets how much of features 7 and 8 is already done.

## Options considered

### Option 1: content driven Astro composition, split by reuse, with one plain counter script

Compose the page in `index.astro` from `Section`, `Card`, and `Button`, plus seven new components. The three that a later Release 1 page already needs (`StatsBand`, `MediaText`, `CtaBand`) go into `src/components/ui/` with a `docs/design.md` entry and a `/styleguide` tile; the four only this page wants stay in `src/components/home/`. The gold ending is a self contained `CtaBand` that names its own colours rather than a new `Section` tone. The counter is `src/scripts/counters.ts`, imported from `StatsBand`, enhancing numbers already correct in the HTML.

**Pros**:

- Features 7 and 8 inherit three finished, documented pieces, which is most of About's layout and every service page's ending.
- The gold band costs one component entry in `docs/design.md` instead of reopening an accepted spec. `Section` keeps two tones, `Button` keeps two variants, and the invariant that no component adapts to its background still holds, because `CtaBand` never adapts to anything: it is always gold.
- The counter follows a pattern the repo already proves works, so there is nothing novel in the only JavaScript this page adds.
- Every acceptance criterion is checkable from the built HTML or a browser, with no test framework, which is what the Alpha workflow wants.

**Cons**:

- Three components are promoted into the design system on a planned reuse, not an observed one. If About wants a different stats treatment, `StatsBand` gets a prop it was not designed for, which is the usual way a shared component starts to sprawl.
- Two places now decide a background plus a button treatment, `CtaBand` and the `Section` and `Button` pair, so a palette change has to visit both.
- Seven components plus a script is the largest surface any single feature has added so far.

### Option 2: compose everything inline in `index.astro`

One page file holding all nine sections, using only `Section`, `Card`, and `Button`, with the counter inlined in the page.

**Pros**:

- Fewest files by a wide margin, and everything about the page is readable in one place.
- Nothing is promoted into the design system before a second page has actually asked for it, which is the honest sequencing.
- Fastest route to a page on screen.

**Cons**:

- Features 7 and 8 then either copy the markup or refactor it, and copied markup is how two pages start to drift apart.
- A single file holding nine sections plus a counter is long enough that a change to one section means scrolling past eight others.
- The inline counter cannot be reused by About without moving it anyway, so the move happens, just later and under more pressure.

### Option 3: build every piece as a documented design system component

All seven components go into `src/components/ui/`, each with a `docs/design.md` entry and a `/styleguide` tile.

**Pros**:

- One rule, consistently applied, with no judgment call about what counts as reusable.
- The style guide becomes a complete picture of the site's vocabulary.

**Cons**:

- Four of the seven have no second caller in the whole scope. Documenting and style guiding a certification row that appears once is work with no return, and it makes `docs/design.md` harder to read for the pieces that do matter.
- It invites the next page to reuse a component shaped entirely by this page's copy, which is worse than copying markup, because it looks like a decision.

### Option 4: a React island for the stats counter

Keep the composition of Option 1 but build the counter as a hydrated React component in `src/components/react/`.

**Pros**:

- The idiom the engineer already knows best, with hooks and effects rather than raw `IntersectionObserver` and `requestAnimationFrame`.
- Component state and cleanup are handled by the framework rather than by hand.

**Cons**:

- It breaks the rule in `AGENTS.md` that React is for the contact form island only, and it ships a framework runtime to every visitor of the busiest page on the site for one decorative effect.
- It makes the no script case worse, not better: an island renders its markup but the numbers become a client concern, when the whole point is that the finished numbers are already in the HTML.
- Feature 12's Core Web Vitals target gets harder for no functional gain.

## Rationale

Option 1 wins on the two forces that actually bind: the accepted design system and the zero JavaScript default.

On the gold band, the question was never whether gold is allowed, it is where the decision to use it lives. Adding `tone="gold"` to `Section` and an `onGold` variant to `Button` would be more reusable, and it is exactly what the spec 0003 invariant forbids, because from that moment a component's appearance depends on the band it landed in and every later component has to ask which tone it is on. A self contained band sidesteps that entirely: `CtaBand` does not adapt to a background, it is the background. The cost is a second place where a colour pair is decided, and that cost is visible, documented, and small, which is the right shape for a tradeoff to have.

On the counter, spec 0004 already established the working pattern, a module in `src/scripts/` imported from one component script, enhancing markup that is correct without it. Reusing it means the only JavaScript this page adds is novel in what it does and familiar in how it arrives. A React island would be more comfortable to write and would put the page's most visible numbers behind a framework runtime, on the page feature 12 has to hit Core Web Vitals on. The engineer's React experience is real, and it is better spent on the contact form island, where hydration buys something.

On the component split, the deciding evidence is in the content schemas rather than in taste. The About entry carries a `statsHeading` and every service entry carries a `cta` block: those two fields exist because a future page needs this page's stats band and this page's closing band. That is an observed reuse in the data model, not a guess, which is why three components go in and the other four stay out. The certification row and the differentiator list have no second caller anywhere in the scope, so promoting them would be documenting a thing nobody will call.

A cross check caught the one thing this reasoning initially missed, and it is worth recording rather than quietly fixing. The gold rule in spec 0003 was applied to every colour on the band except the focus ring, which is `gold-ink` sitewide and measures 2.10:1 on full gold, so the ring would have been invisible on the only element anyone tabs to there. The band is now the site's first documented focus exception (black, 8.73:1). The general lesson is the one the cross check named: a new visual context has to be re-audited against the system's own contrast rules, not assumed to inherit them, and the author of the new context is the person least likely to notice.

The one place this spec deliberately chooses friction is the exactly three services rule. A silent cap or a reflowing grid would both be easier and both fail quietly, and a layout contract that fails quietly is the kind of thing that ships to a client. Making it a build error with a message that names the collection, the language, and the count turns it into a two minute decision at the moment it matters, and the follow up item records that the decision is genuinely owed rather than settled forever.

## Revision 2026-09-21: the reference hero

### Context

The engineer supplied a reference screenshot for the hero: one photo filling the first screen, a wide centred gray see through panel carrying white copy, a gold button under it, three dots near the bottom edge, and the header drawn as a white card with rounded bottom corners over the top of the photo. It replaces the split this spec first built. Four things had to be settled that the split never raised: which colour pair keeps white copy readable over a photo nobody controls, which focus ring works on a photo, what `--header-h` means once the header overlaps the page, and how `Section`, which is built on "every tone is light", handles a full height photo band.

Three facts from the code shaped the options. The only readable pair for white text over an arbitrary photo is white on a dark scrim, and a black scrim at 54 percent or more is the threshold at which white keeps 4.5:1 even over a pure white pixel. The sitewide `gold-ink` ring has unknown contrast on a photo, which makes the hero the second surface after the gold band where it fails, and this spec had already written down that a second exception should prompt revisiting the rule. And the secondary button draws its border and label in `gold-ink`, which cannot be read on a photo.

### Options considered (per sub decision, the engineer chose each)

**Scrim**: black at 60 percent, 5.74:1 worst case (chosen); black at 55 percent, 4.76:1, closer to the reference but with almost no margin; black at 70 percent, 8.52:1, very readable but it buries the photo. Written as a named token (chosen) rather than `bg-black/60` in markup, so the number the contrast depends on lives in one place that `docs/design.md` can list.

**Focus**: a two ring rule, `gold-ink` on light tones and one shared black and white double ring on every other surface, with the gold band moving to it (chosen); a hero only exception beside the gold band's black ring, which would be the second exception this spec warned against; the double ring everywhere, which takes the brand gold out of every focus state and reopens spec 0003's accepted look. The double ring is the two colour indicator technique (black and white measure 21:1 apart, so any background pixel is at least 3:1 from one of them, and the pixels the ring changes always change by at least 3:1). In forced colours mode the `box-shadow` half disappears and the outline half stays, drawn in the system colour, so the ring still shows.

**Section**: the hero as its own band sharing `Section`'s frame through class strings (chosen); `Section` gaining `height` and media props, which would put a dark tone inside `Section` and break spec 0003's rule that nothing inside needs to know its background; the hero as its own band copying the gutter classes, as `CtaBand` did, which leaves the same values in three places.

**Header overlap**: the card look sitewide with the overlap on home only (chosen), because every other page opens on a white `Section` whose `h1` an overlap would cover; the overlap on every page, which touches every route; the card on home only, which leaves two header looks. Mechanism: the header stays `sticky` exactly as spec 0004 built it and the home hero pulls itself up by `--header-h` (chosen), rather than `position: fixed` everywhere with padding on every other page, or an absolute header that scrolls away on one page only.

**Hero height**: `min-h-svh` (chosen), which fills the first screen without jumping as a phone's address bar hides and grows instead of clipping on a short screen; `min-h-dvh`, which resizes while scrolling; a fixed clamp, which does not fill the screen.

**Second button**: removed from the schema and the entry (chosen); kept optional and ignored by the hero, which lets an editor add a button that never shows; rendered in a new white outline treatment, which adds a variant only one band uses.

**Dots**: decoration hidden from assistive tech (chosen); dropped entirely, which is more honest but further from the reference.

**Copy, width, size, photo**: the current placeholder copy kept (content, swapped later); the panel at the content width, matching the reference's proportion; the subheading at `text-lead`; the 1600px `hero.jpg` kept with a follow up to replace it before launch.

### Rationale

The binding force is the same one the first version of this spec answered to: spec 0003's invariant that both `Section` tones are light and nothing inside adapts. Every choice here protects it. The hero is a band that is its own background, as `CtaBand` is, rather than a new tone that every future component would have to ask about. Borrowing `Section`'s frame through class strings keeps the part that should be shared (gutters, rhythm, widths) in one place without sharing the part that must not be (tone).

On contrast, choosing a scrim strong enough for the worst possible pixel turns a per photo judgement into a property of one token. The reference's lighter gray looks marginally airier, and it would make every photo swap a contrast audit that nobody will remember to run. At 60 percent the guarantee holds with enough margin that a small tweak later does not silently cross the line.

On focus, this spec's own first version recorded the lesson that a new visual context has to be audited against the system's rules rather than assumed to inherit them, and that a second exception is a sign the rule is wrong. Two exceptions (black on gold, something else on the photo) would each be locally correct and together would make a third inevitable. Stating the rule by surface, "light tones get `gold-ink`, everything else gets the double ring", covers the gold band, the hero, and any future dark or photo surface with one utility, and it keeps the brand gold ring on the ninety percent of the site where it works.

On `--header-h`, keeping the header sticky and making the hero opt in to the overlap means the property keeps exactly the meaning spec 0004 gave it, the height of the strip the header covers at the top of the viewport, and every other page stays byte for byte as it is. The cost is one more reader of that property, recorded as a consequence.

Making the hero schema strict was not asked about directly. It follows from the engineer's choice to remove `secondaryCta`, whose whole point was that an editor cannot add a button that silently never shows. A plain `z.object` drops unknown keys without a word, so removing the field without making the object strict would have kept exactly the failure the removal was meant to prevent.

## Revision 2026-09-21 (second): the six section page, ratifying specs 0007 and 0008

### Context

The home page was reshaped during `/develop` for a demo, faster than the spec could follow. Three changes landed without a deliberated decision: the stats band and the old why choose us grid became one black band with stat cards (no spec revision at all), the presence band became a map with rich copy that absorbed the differentiators (spec 0007, assumed), and certification plus the closing gold band gave way to a project showcase (spec 0008, assumed). Spec 0005 still described nine sections, so `/check verify` had no contract that matched the page, and `/develop` had three documents to reconcile for any further change.

Reading the built code against the design system turned up five concrete gaps. The heading caret blinked forever, which WCAG 2.2.2 does not allow without a way to pause it (the reduced motion rule only helps people who set it). The black band was called `whyChooseUs` while the actual reasons list lived in `presence.whyChoose`, so an editor looking for "why choose us" would find two answers. Nothing limited how many regions float over the map, so a close region could overlap silently. The showcase's large first tile layout leaves an empty cell with two projects and a lone half width tile with one. And the showcase photos zoomed on hover while the tiles were not links, which tells a mouse user something is clickable when it is not.

Spec 0006 (photos as Pexels links, the white hero photo) was left out of this pass on purpose. It is a site wide content and build decision, not a home page one.

### Options considered (per sub decision, the engineer chose each)

**Recording**: revise 0005 in place and mark 0007 and 0008 superseded (chosen), so one file is the contract; ratify 0007 and 0008 in place, which keeps each decision separate but leaves the page's contract split across three files; a new spec superseding all three, which is clean but discards 0005's history and `verify.md` and moves every scope link.

**Page ending**: keep the six sections as built (chosen), because the engineer removed the closing band deliberately and the hero, nav, and footer still reach contact; a second contact button in the showcase band, a small nudge with no new band; the gold `CtaBand` back as a seventh section, the strongest prompt but it reverses the engineer's choice.

**Caret**: remove it (chosen); blink three times and settle, which keeps the typed look and meets 2.2.2; keep it blinking and accept the gap. The engineer preferred the simplest option over the recommended finite blink; both meet the standard.

**StatsBand**: keep it for About (chosen), deferring the choice to the page that needs it; extract the white cards into a shared component and retire `StatsBand`, which is work for a reuse nobody has asked for yet; delete it, which breaks spec 0005's promise to About.

**Which projects**: the lowest three by `order` (chosen), with no new field and the same order as `/project`; a `featured` flag, which lets the home picks differ from the list order but needs a rule for more than three flagged; ids listed in `home.yaml`, the most explicit, but a renamed project breaks the home page.

**World map**: a checked in asset with its bounds recorded (chosen); a committed generator script plus `world-atlas` as a dev dependency, reproducible but tooling for a file that may never change; a designed map later, treating the dots as a placeholder.

**Map labels**: at most six regions, with overlap checked at verify (chosen); dots only with the names always in a row under the map, which can never overlap but loses the labelled map of the reference; a per region label side, flexible but more schema for editors to learn.

**Naming**: rename to `intro` (chosen), so every key names what it shows; keep the names and explain them in the spec.

**Few projects**: an equal grid under three (chosen); hide the band under three, which leaves a new language with no showcase; require three at build, which blocks a second language until its projects are written.

**Tile hover**: drop the zoom until the tiles link somewhere (chosen); make every tile a link to `/project`, three extra tab stops to the page the button already reaches; keep the zoom and accept the misleading cue.

**Hero photo**: keep it as built (chosen by the engineer, against the recommendation to swap in a full frame photo); move the panel to the start side at `lg`, which departs from the centred reference. Recorded as a tradeoff and left with spec 0006.

### Rationale

The binding force is that this is a ratify, not a redesign: the page works, it was shaped by a real reference, and the engineer made most of these calls on purpose. So the default for every sub decision was to keep what was built unless it breaks a rule the rest of the system relies on. Each of the five changes is one of those breaks. The caret breaks an accessibility rule, and removing it is less work than making it stop. The `whyChooseUs` name breaks the rule that content keys say what they hold, and a rename costs one commit now against editor confusion forever. The uncapped regions and the fragile showcase grid both fail silently in production when content changes, which is the one kind of failure spec 0002's content model was built to prevent. The hover zoom breaks the rule that affordance matches behaviour.

Folding everything into 0005 follows from the same force. The page is one feature with one scope row; three partial specs that each supersede a few of the others' criteria are exactly the kind of drift that let the page get ahead of its contract. Keeping the AC numbers stable and appending new ones (AC-25 onward) means the scope row, `verify.md`, and anyone who cited an AC can still find it, with the revised ones marked.

Two engineer choices went against the recommendation and are recorded honestly as tradeoffs rather than argued with: the hero photo whose subject hides under the panel, and the removed rather than finite caret. Neither is wrong; the first costs some visual impact until the launch content pass, and the second costs only the typed look. The page ending without a call to action was the recommended pick, because the engineer removed it deliberately and three other paths to contact remain; it is still the first thing to revisit if the page underperforms.

## Revision 2026-09-22: scroll reveals with Motion, and the carousel recorded

### Context

The engineer asked for basic appearance animation on the home page and wanted to choose the library. The spec said the only motion was the counter, and the project rule is zero JavaScript by default, so a reveal had to be small, a plain script, and never able to hide content. Reading the code also turned up the hero carousel, committed on 2026-09-21 (13eb97a) without a spec change: it autoplays, its dots are real buttons, and it breaks the old AC-14, AC-20, and the "nothing loops" invariant.

### Options considered (the engineer chose each)

**Library**: `motion`'s mini `animate` plus `inView`, about 3 KB (chosen by the engineer); no library, CSS transitions plus a 1 KB `IntersectionObserver` script like `counters.ts`, the recommended pick, lightest and with nothing new to learn but no springs or sequences later; GSAP with ScrollTrigger, the standard for rich scroll storytelling, now free, but 35 KB or more for simple reveals; CSS scroll driven animations (`animation-timeline: view()`), zero JavaScript, but not yet in every browser, so the feel would differ by browser.

**What moves**: the bands below the hero (chosen); the intro band too, which doubles up with the counter; headings only, the subtlest.

**Feel**: a subtle fade and 24px rise, 600ms, once (chosen); a soft spring; replay on every entry, which reads busy on a long page.

**Hiding strategy** (decided in this spec): the script hides only what is below the fold when it runs (chosen), so a failed or slow script costs nothing and nothing on screen blinks; hiding in CSS behind a `js` class, the common pattern, which leaves content invisible if the module fails to load and needs a timeout to recover.

**What to watch** (decided in this spec): each hidden element on its own, with a stagger delay by position (chosen); the stagger container, simpler, but on a phone the container is on screen while its later children are not, so they would animate unseen.

**Carousel**: record it here (chosen), since this revision rewrites the motion rules anyway; a separate spec later, which leaves verify failing it against the old wording.

**Carousel pause control**: keep as built with no pause button (chosen by the engineer); a pause toggle beside the dots, the recommended pick and the W3C carousel pattern, which meets WCAG 2.2.2; play once then stop, which still moves for more than 5 seconds; no autoplay, which meets 2.2.2 with nothing added.

### Rationale

The binding force is that motion must never be load bearing. Every choice follows from it: the reveal is one plain module, the HTML stays complete, the script hides only what the visitor cannot see yet, and reduced motion is a full stop, the same rule the counter already follows. Within that, the engineer picked Motion over the no library option for headroom; the cost is a dependency, held in check by importing only its two smallest functions and capping the weight at 5 KB (AC-36).

The carousel is recorded as built because the spec should describe the page that exists. The missing pause control is recorded honestly as a WCAG 2.2.2 gap rather than argued away: holding on hover and focus does not help touch users. It is the first Follow-up and should close before launch.
