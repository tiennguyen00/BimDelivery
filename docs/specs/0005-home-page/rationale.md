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
