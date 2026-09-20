# 0004. Rationale: site shell

Reasoning and options behind [index.md](index.md).

## Context

> ⚠️ Premise note: this spec amends a decision that spec 0002 owns. The shell needs five interface strings (the skip link, the open and close menu labels, and the two nav landmark labels) plus a place for footer only links, and none of them has a home in the content model. Hardcoding them in the header would break the project rule that page content comes from content collections, and would plant exactly the strings a second language later has to hunt for. So this spec adds a required `ui` block and an optional `legal` list to the `navigation` collection. Spec 0002's data model sketch goes stale the moment that lands, and a follow up records it. Separately, this spec builds thin stub pages on the routes that features 7 to 10 own. That is deliberate, because every nav link must resolve, but it means those features start from a real page rather than an empty file, and none of them is finished by this spec.

The site currently has one page. `src/pages/index.astro` is a placeholder that calls every content getter once so spec 0002's cross entry checks keep running, and `BaseLayout.astro` is a bare document shell with a comment saying feature 5 adds the header, nav and footer around the slot. Nothing links anywhere, because there is nowhere to link to.

Three forces shape this decision.

**The nav is the one piece of interactive behaviour on an otherwise static site.** Spec 0001 set a zero JavaScript floor: every page is prerendered, React exists only for the future contact form island, and the nav, dropdown and mobile menu are named explicitly as plain scripts. Whatever this feature ships runs on every page of the site, so its cost is paid everywhere, forever. At the same time the scope's done when demands the dropdown work by mouse, keyboard and touch, and close on Escape, which no purely declarative approach delivers honestly.

**The content and the visual language are already decided.** Spec 0002 gives `getNavigation(lang)` with the services slot already expanded and sorted, `getSettings(lang)` with the logo, contact block, closed social network list, footer text and copyright, and `getNotFoundPage(lang)`. Spec 0003 gives the tokens, `Section`, `Button`, `Card`, the deep gold focus ring, three breakpoints, and a written reference in `docs/design.md`. This feature composes what exists rather than inventing anything new, and it should not quietly introduce a look or a token the design system does not already sanction.

**Every route the nav points at has to exist before the nav is honest.** A header linking to five pages that return nothing is worse than no header, and the scope's done when says so directly. That pulls the route table, the service route's shape, and the 404 page into this feature, which makes it the first one that has to settle how Cloudflare serves a page that does not exist.

The cost of not deciding is that features 6 to 10 each invent their own page chrome, and the first one that needs a header writes it inline. Every page after that inherits a shape nobody designed.

## Options considered

### Option 1: A layout wrapper plus one plain script, enhancing markup that already works

`PageLayout.astro` wraps `BaseLayout` and adds the skip link, header, `main` and footer. The header ships markup in which the dropdown panel and the mobile panel are already visible, so the HTML the server sends is a complete, usable stack of links. One small module in `src/scripts/` then hides them and wires up the button semantics, the arrow keys, Escape, the outside click and the focus trap.

**Pros**:

- The shell degrades to something genuinely usable rather than to something broken. If the script fails to load or is blocked, every destination including the three services is still visible and clickable.
- Search engines and preview crawlers read every nav link out of the HTML with no execution, which matters for feature 11.
- One script, one bundle, loaded once, and roughly the only JavaScript a normal page carries. It is plain functions over a handful of DOM nodes, which is what the project's rules ask for.
- The desktop dropdown and the mobile disclosure share one open and close implementation, so they cannot drift apart.

**Cons**:

- The markup has to be authored so that hiding is the enhancement, not showing. Get that backwards and you ship a header with an open menu flashing on every page load.
- The focus trap and the outside click handling are the fiddly parts of this feature, and they live in hand written code with no library behind them.
- Two layouts now exist, so every new page has to use the right one, and a page that reaches for `BaseLayout` by mistake silently loses the header.

### Option 2: A pure CSS shell with no JavaScript at all

The dropdown opens on `:hover` and `:focus-within`; the mobile menu is a hidden checkbox with a label as the hamburger. Nothing scripted anywhere.

**Pros**:

- Literally zero JavaScript, the purest reading of spec 0001's floor. Nothing to bundle, nothing to fail, nothing to maintain.
- Cannot break at runtime, and needs no thought about load order.

**Cons**:

- Touch has no hover, so the first tap on SERVICES on a tablet either navigates or does nothing, depending on the workaround. The scope's done when asks for touch by name.
- `aria-expanded` cannot be kept truthful without script, so a screen reader is told nothing about whether the panel is open.
- Escape cannot close anything, which the done when also requires by name.
- The checkbox hamburger is a control whose accessible role lies about what it does, and it cannot trap focus or stop the page behind it scrolling.

### Option 3: The whole header as a React island

Header, nav, dropdown and mobile menu become a React component hydrated with `client:load`, reusing the React button already in the design system.

**Pros**:

- State, keyboard handling and focus management are things React and its ecosystem are genuinely good at, and a headless menu library would hand over the arrow keys and the focus trap already correct.
- One component model for the two interactive things on the site, the header and the future contact form.

**Cons**:

- It hydrates React on every page of a marketing site in order to run a dropdown. That is the exact cost spec 0001 chose Astro to avoid, and it lands on the pages whose Core Web Vitals feature 12 has to defend.
- The nav links would be rendered by a client component, so what a crawler sees depends on how carefully the island is configured.
- It contradicts the project rule naming the nav, dropdown and mobile menu as plain scripts, and the rule that React is for the contact form island only.

## Rationale

Option 1 is the only one that satisfies the done when in full while respecting the floor spec 0001 set. Option 2 fails it outright: Escape, touch and a truthful `aria-expanded` are named requirements and none of them is reachable without script. Option 3 satisfies the requirements but pays for them with hydration on every page, which is the cost the whole stack was chosen to avoid, and it breaks two written project rules to do it.

What makes Option 1 safe rather than merely cheap is the direction of the enhancement. Because the markup ships with the panels visible and the script hides them, a script that never runs leaves a plain working list of links rather than an unreachable menu. That turns "the nav needs JavaScript" from a risk into a detail: the failure mode is a slightly ugly header, not an orphaned service page. It also means the crawler and the no script visitor see the same links, which is the property feature 11 will want.

The sticky header at one fixed height follows from the same reasoning. A header that condenses on scroll needs a scroll listener on every page, running on every frame, for a decorative effect, and it risks a layout shift on a site whose feature 12 target is Core Web Vitals. A constant height is pure CSS and costs nothing.

Two smaller calls are worth recording. The footer's link columns read from `getNavigation` rather than from their own authored list, so the footer and the header cannot disagree and a newly added service appears in both with no edit, at the price of needing the separate `legal` list for footer only links. And the header and footer both stay inside the two light tones spec 0003 defines, rather than the dark footer the reference site uses, because a dark footer means new surface and text tokens, a second focus ring colour that reaches 3:1 on black, a card tone reset and a second contrast table in `docs/design.md`. Spec 0003 deferred that deliberately and the scope carries it as deferred work. Pulling it into the shell would quietly reopen the design system inside a feature about navigation.
