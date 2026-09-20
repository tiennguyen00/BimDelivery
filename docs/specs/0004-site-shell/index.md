# 0004. Build the site shell as a layout wrapper with one progressively enhanced nav script

**Date**: 2026-09-20
**Status**: Proposed
**Scope feature**: 5, Site shell: nav, dropdown, footer (`docs/scope/scope.md`)

## Summary

Every page gets the same frame: a skip link, a sticky header with the logo, the nav and a call to action, the page itself, and a four column footer. A new `PageLayout` adds that frame around the existing `BaseLayout`, so the dev only style guide keeps its clean canvas. The header ships as plain HTML in which the services dropdown and the mobile menu are already open, and one small script then closes them and makes them behave: hover and click to open, arrow keys, Escape to close, focus trapped inside the mobile panel. If that script never runs, the visitor still sees every link.

This feature also makes the nav honest. It creates a thin page on every route the nav points at, including one dynamic route that turns each service file into its own page, plus a styled 404 page that Cloudflare is configured to actually serve. Features 7 to 10 then fill those pages in rather than creating them.

Two small additions to the content model come with it: a required `ui` block on the navigation entry for the interface strings the shell needs, and an optional `legal` list for footer only links such as the privacy page in feature 13.

## Requirements

**User stories**:

- As a visitor, I want the same header and footer on every page so that I can reach any part of the site from wherever I land.
- As a visitor on a phone, I want a menu I can open with a thumb and close again so that the nav does not get in the way of reading.
- As a keyboard or screen reader user, I want to skip past the nav, open the services dropdown, move through it with arrow keys and close it with Escape so that I can use the site without a mouse.
- As a visitor who follows a stale or mistyped link, I want a page that looks like the site and offers me a way back so that I do not hit a blank error.
- As the developer building features 6 to 10, I want the frame, the routes and the 404 already in place so that each page feature is about that page's content only.
- As a future translator, I want every visible string including the menu labels to come from content so that a second language needs no code change.

**Acceptance criteria** (the contract, each criterion is IDed and independently checkable):

- **AC-1**: `src/layouts/PageLayout.astro` exists, wraps `BaseLayout`, and renders in order: the skip link, `<header>`, `<main id="main">` holding the slot, and `<footer>`. It takes the same `title` and `description` props and passes them straight through. `BaseLayout` still renders only the document shell, so `/styleguide`, which imports it directly, renders with no header and no footer.
- **AC-2**: These routes each produce one HTML file in `dist/client/`: `/`, `/about-us`, `/revit-modeling`, `/scan-to-bim`, `/bim-coordination`, `/project`, `/contact-us`, and `/404`. The three service pages come from a single route `src/pages/[service].astro` whose `getStaticPaths` reads `getServices(lang)`. Adding a fourth service file, with no code edit, produces a fourth page and a fourth nav entry.
- **AC-3**: Every page renders its own `seo.title` and `seo.description` from its content entry, and its `h1` and intro paragraph from that same entry, inside a `Section` with `tone="white"`, which is where spec 0003's alternating rhythm starts. No page and neither layout contains hardcoded visible copy.
- **AC-4**: The header renders the logo (linking to `/`, accessible name from `settings.logo.alt`), the nav items from `getNavigation(lang)`, and the call to action from `navigation.cta` as a primary `Button` in both the desktop bar and the mobile panel. It is sticky at one constant height, held in the `--header-h` custom property set once in `PageLayout` (`4.5rem` below `lg`, `5rem` at `lg` and above), and it registers no scroll listener.
- **AC-5**: At 1024px and above the nav is a horizontal bar and SERVICES is a `<button id="nav-services-desktop-btn" aria-expanded aria-controls="nav-services-desktop">` controlling a panel with that id, holding the three service links. The panel opens when the pointer enters the item and when the button is clicked, and opens from the keyboard with Enter, Space or ArrowDown. ArrowDown and ArrowUp move focus between panel items. Escape closes it and returns focus to the button. A click outside it, focus leaving the header, or the viewport crossing below 1024px also closes it. `aria-expanded` matches the visible state at all times.
- **AC-6**: Below 1024px the header shows a hamburger `<button id="nav-menu-btn" aria-expanded aria-controls="nav-menu-panel">` and the panel with that id fills the viewport beneath the sticky header, offset by `--header-h`. While it is open, Tab and Shift Tab cycle within the panel with the focusable set recomputed on each Tab so the nested disclosure cannot break the cycle, `<body>` carries `overflow: hidden` with `scrollbar-gutter: stable` so the page neither scrolls nor shifts, and Escape closes it and returns focus to the hamburger. Inside the panel SERVICES is a disclosure `<button id="nav-services-mobile-btn" aria-expanded aria-controls="nav-services-mobile">` revealing the three service links.
- **AC-7**: In the HTML the server sends, both the dropdown panel and the mobile panel are present and visible, and the script hides them at startup. With JavaScript disabled, every nav link including the three services is visible and clickable on every breakpoint, and no control is a dead end.
- **AC-8**: Active marking happens in the header only. The header nav link whose href equals the current path carries `aria-current="page"` and the active underline; on a service page the SERVICES control carries the underline but no `aria-current`. Footer links never carry `aria-current`, and neither does the copy of the nav that is hidden at the current breakpoint, so exactly one element per page carries `aria-current="page"` and pages outside the nav, such as `/404`, carry none.
- **AC-9**: The footer renders four columns at 1024px and above, stacking to one column below `md`: the logo with `settings.footer.text`; the site links; the service links; and `settings.contact` email, phone and address with the `settings.social` icons. Site links and service links both derive from `getNavigation(lang)`. Each social link has an accessible name derived from its `network`, and carries `target="_blank"` with `rel="noopener noreferrer"`; when `settings.social` is empty the whole social block is omitted rather than rendering an empty row. `settings.footer.copyright` renders in a bottom row, alongside the `navigation.legal` links when that list is non empty and nothing at all when it is empty or absent.
- **AC-10**: When `getServices(lang)` returns an empty list, no SERVICES control renders in the header, the mobile panel or the footer, no empty panel exists, and the build still succeeds.
- **AC-11**: The `navigation` collection schema gains a required `ui` object with `skipToContent`, `openMenu`, `closeMenu`, `primaryNavLabel` and `footerNavLabel`, all non empty strings, and an optional `legal` array of `link`. A navigation entry missing `ui`, or with an empty string in it, fails the build with a message naming the file and the field. No page, layout or component hardcodes any of those five strings.
- **AC-12**: `src/pages/404.astro` renders the `notFound` entry (its `seo`, `heading`, `text` and `button`) inside `PageLayout`. `wrangler.jsonc` sets `assets.not_found_handling` to `"404-page"`. A request to a path that does not exist, made against a real preview of the production build, returns that page with HTTP status 404.
- **AC-13**: The skip link is the first focusable element on every page, is visually hidden until focused, is visible when focused, and moves focus to `<main id="main" tabindex="-1">`. The `tabindex` is what makes `<main>` focusable at all; without it the link only scrolls and keyboard focus stays in the header. The header nav sits in a `<nav>` labelled by `ui.primaryNavLabel` and the footer nav in a separate `<nav>` labelled by `ui.footerNavLabel`. Every interactive control in the shell shows the deep gold focus ring from `global.css` and has a target of at least 44px in both directions.
- **AC-14**: `src/components/ui/Icon.astro` exists with a fixed map covering `menu`, `close`, `chevron-down`, and the five `settings.social` networks. Each renders as inline SVG inheriting `currentColor`, sized by a `size` prop, `aria-hidden="true"` unless given a title. Passing a name outside the map fails `pnpm check`.
- **AC-15**: Exactly one place calls every getter in `src/lib/content.ts` once at build, so spec 0002's cross entry checks run even though no page reads `getStats` until feature 6. It carries a comment saying why, and `src/pages/index.astro` no longer carries the orphan calls it has today.
- **AC-16**: `docs/design.md` gains a section per new component under `## Components`, covering `PageLayout`, `Header`, `Footer` and `Icon`, and `/styleguide` shows the full icon set plus the header and footer in place.
- **AC-17**: `pnpm check`, `pnpm lint` and `pnpm build` all pass. `dist/client/` holds one HTML file per route in AC-2 and no others beyond the assets. The only JavaScript a page loads is the one nav bundle plus the small inline flag script in AC-18; no React component is hydrated on any page.
- **AC-18**: The panels are hidden before the first paint, not by the nav module. A short inline script in the document `<head>` sets a `js` flag on `<html>` synchronously, and the CSS hides both panels only when that flag is present. Astro compiles a component `<script>` to a deferred module that runs after paint has begun, so without this the visitor on a slow connection sees an open menu flash on every page. The flag script is the only inline script in the site and does nothing but set the flag.

## Decision

**Chosen option**: Option 1: A layout wrapper plus one plain script, enhancing markup that already works.

Build the shell as `PageLayout.astro` wrapping `BaseLayout`, with `Header`, `Footer` and `Icon` components fed entirely from `getNavigation` and `getSettings`, and one module in `src/scripts/nav.ts` that progressively enhances markup which is already usable without it.

**Implementation skills**: `astro` (`astrolicious/agent-skills`, `.agents/skills/astro/`) · `tailwind-4-docs` (`lombiq/tailwind-agent-skills`, `.agents/skills/tailwind-4-docs/`) · `zod` (`pproenca/dot-skills`, `.agents/skills/zod/`) · `wrangler` (`cloudflare/skills`, `.agents/skills/wrangler/`)

## Feature design

**Design source**: the existing `docs/design.md` and `/styleguide` from spec 0003. No new tokens, no new colours, no new breakpoints. The header is `white`, the footer is `tint`, matching the two section tones already defined.

**Data model sketch**:

Nothing new is stored. The shell reads what spec 0002 already models, with two additions to the single entry `navigation` collection.

| Collection | Field | Type | Required | Notes |
|---|---|---|---|---|
| `navigation` | `ui.skipToContent` | string, min 1 | yes | the skip link's label |
| `navigation` | `ui.openMenu` | string, min 1 | yes | accessible name of the hamburger when closed |
| `navigation` | `ui.closeMenu` | string, min 1 | yes | accessible name of the hamburger when open |
| `navigation` | `ui.primaryNavLabel` | string, min 1 | yes | `aria-label` on the header `<nav>` |
| `navigation` | `ui.footerNavLabel` | string, min 1 | yes | `aria-label` on the footer `<nav>` |
| `navigation` | `legal` | array of the shared `link` shape | no | footer only links; empty or absent renders nothing |

Everything else is read as it stands: `navigation.items` and `navigation.cta`, `settings.logo`, `settings.contact`, `settings.social`, `settings.footer`, `settings.siteName`, the `services` collection through `getNavigation` and `getServices`, and the `notFound` entry.

Making `ui` required rather than optional is deliberate: an optional block would let a missing string fall back to an empty `aria-label`, which fails silently for exactly the users it exists for. The existing `src/content/navigation/en/main.yaml` therefore has to gain the block in the same change, or the build fails, which is the intended behaviour.

**State transitions**:

Two independent machines, both implemented by the same pair of functions in `src/scripts/nav.ts`.

Services dropdown (desktop, 1024px and above):

```
closed --(pointerenter on the item | click on the button | Enter, Space or ArrowDown on the button)--> open
open   --(Escape | click outside the header | focus leaves the header | pointerleave the item | click on the button | viewport crosses below 1024px)--> closed
```

Escape and the button click return focus to the button; the other closes leave focus where it is. The mobile disclosure inside the panel runs the same machine minus the pointer transitions.

Mobile menu (below 1024px):

```
closed --(click on the hamburger)--> open   : trap focus in the panel, lock body scroll, label becomes ui.closeMenu
open   --(Escape | click on the hamburger | a link inside is followed | viewport crosses to 1024px or above)--> closed : release the trap, unlock scroll, focus returns to the hamburger
```

One `matchMedia` listener drives both boundary transitions, so a crossing in either direction closes whichever machine belongs to the breakpoint being left. Without it a dropdown opened on a wide window and then narrowed leaves `aria-expanded="true"` on a control that is now hidden, while the hamburger beside it reports closed.

Element ids, fixed here because `aria-controls` needs them and SERVICES exists twice in the DOM:

| Element | id |
|---|---|
| desktop SERVICES button | `nav-services-desktop-btn` |
| desktop dropdown panel | `nav-services-desktop` |
| hamburger | `nav-menu-btn` |
| mobile panel | `nav-menu-panel` |
| mobile SERVICES disclosure button | `nav-services-mobile-btn` |
| mobile services list | `nav-services-mobile` |
| the page's main region | `main` |

**Interface surface**:

There is no HTTP surface. This feature adds no endpoint and keeps `output: 'static'` untouched. The surface is the route table and the component props.

| Route | File | Kind | Renders |
|---|---|---|---|
| `/` | `src/pages/index.astro` | static | the existing placeholder home, moved onto `PageLayout` |
| `/about-us` | `src/pages/about-us.astro` | static | `getAboutPage` heading and intro |
| `/revit-modeling`, `/scan-to-bim`, `/bim-coordination` | `src/pages/[service].astro` | dynamic, prerendered by `getStaticPaths` | each service's `title` and `summary` |
| `/project` | `src/pages/project.astro` | static | `getProjectPage` heading and intro |
| `/contact-us` | `src/pages/contact-us.astro` | static | `getContactPage` heading and intro |
| `/404` | `src/pages/404.astro` | static | the `notFound` entry, heading, text and a `Button` home |

Astro matches static routes before dynamic ones, so `[service].astro` at the root cannot shadow `/about-us`, `/project`, `/contact-us` or `/404`. The reverse risk, a service slug colliding with a future top level page, is already handled: `src/lib/content.ts` holds the reserved path list from spec 0002 and fails the build on a collision. Whoever adds a top level page adds it to that list.

| Component | Props | Notes |
|---|---|---|
| `PageLayout.astro` | `title: string`, `description?: string` | passes both to `BaseLayout`; reads nav and settings itself so no page passes them |
| `Header.astro` | `items: readonly NavItem[]`, `cta?: Link`, `logo`, `ui`, `currentPath: string` | renders both the desktop bar and the mobile panel from one item list |
| `Footer.astro` | `items`, `settings`, `legal`, `ui` | flattens the services group into its own column |
| `Icon.astro` | `name: IconName`, `size?: number`, `title?: string` | `IconName` is a union over the map's keys, so an unknown name is a type error |

**Value sourcing**:

| Action | Value produced / displayed | Source |
|---|---|---|
| Any page | which language to read | `Astro.currentLocale`, falling back to `DEFAULT_LOCALE` (spec 0002) |
| Any page | page `<title>` and meta description | that page's entry `seo`, passed to `PageLayout` |
| Header | logo image and its accessible name | `settings.logo.src` and `settings.logo.alt` |
| Header | nav item labels and hrefs | `getNavigation(lang)` items |
| Header | the three service links and their order | the services group `getNavigation` already expanded, sorted by each service's `order` |
| Header | call to action label and href | `navigation.cta`, omitted entirely when absent |
| Header | whether an item is the current page | `Astro.url.pathname` compared to the item href at build, with a trailing slash normalised off both sides, and applied in the header only |
| Header | whether SERVICES is the active section | `Astro.url.pathname` matching any service href in the group |
| Header | the sticky height the mobile panel and the layout both need | the `--header-h` custom property, declared once in `PageLayout` |
| `nav.ts` | the 1024px boundary at runtime | one exported const holding `(min-width: 64rem)`, commented as the mirror of Tailwind's `lg` token so a token change has one place to follow |
| `nav.ts` | which element controls which panel | the fixed id table above, not generated at runtime |
| Any page | whether the panels start hidden | the `js` flag the inline head script sets on `<html>`, read by CSS |
| Header | hamburger accessible name | `navigation.ui.openMenu` when closed, `navigation.ui.closeMenu` when open, swapped by the script |
| Header | header `<nav>` accessible name | `navigation.ui.primaryNavLabel` |
| Skip link | its label | `navigation.ui.skipToContent` |
| Skip link | its target | the literal `#main`, matching `<main id="main">` in `PageLayout` |
| Footer | brand blurb and copyright | `settings.footer.text` and `settings.footer.copyright` |
| Footer | contact email, phone, address | `settings.contact` |
| Footer | social icon and accessible name | derived in code from `settings.social[].network` through the fixed map, as spec 0002 decided |
| Footer | site links column | the top level items from `getNavigation(lang)`, services group excluded |
| Footer | services column | the services group from the same call, flattened |
| Footer | legal links row | `navigation.legal`, rendering nothing when empty or absent |
| Footer | footer `<nav>` accessible name | `navigation.ui.footerNavLabel` |
| `[service].astro` | which pages to build | `getStaticPaths` over `getServices(lang)`, one path per entry `slug` |
| `[service].astro` | heading, intro, SEO | that service entry's `title`, `summary` and `seo` |
| `/404` | heading, text, button, SEO | the `notFound` entry (spec 0002) |
| `/404` | the HTTP status the visitor receives | Cloudflare's static assets layer, driven by `assets.not_found_handling` in `wrangler.jsonc` |
| Icon | the SVG path data | the fixed map inside `Icon.astro`, not content |
| Icon | its colour | `currentColor`, inherited from the surrounding text colour token |

**Key invariants**:

- Exactly one `<h1>` per page, and it is the page's own heading, never the logo. The logo is an image link, not a heading.
- Exactly one element per page carries `aria-current="page"`, or none on a page not in the nav, such as `/404`.
- `aria-expanded` on the dropdown button, the mobile disclosure and the hamburger always matches what is visible.
- Every route in the nav resolves to a real HTML file in `dist/client/`. A nav item pointing at a path with no page is a build bug, caught by the reserved path list and by AC-2.
- The shell reads content only through `src/lib/content.ts`. No component calls `getCollection` or `getEntry` directly.
- Header and footer use only tokens defined in `src/styles/global.css`. No new colour, size, radius or breakpoint is introduced.
- The panels are visible in the emitted HTML and hidden by CSS gated on the `js` flag, never the other way round, and the flag is set before the first paint rather than by the deferred nav module.
- `output` stays `'static'` and no route in this feature sets `prerender = false`.

**Security model**:

Every page is public, prerendered and served as a static file. There is no authentication, no authorisation, no user input and no personal data anywhere in this feature, so no compliance scope applies. The only externally facing surface is the social links in the footer, which point at third party sites and therefore carry `rel="noopener noreferrer"` so the opened tab cannot reach back into this page. All content is authored in the repository, so there is no untrusted input to escape.

**Configuration required**:

No environment variables and no secrets. One configuration change:

- `wrangler.jsonc`, `assets.not_found_handling` set to `"404-page"`: tells Cloudflare's static assets layer to serve `404.html` with a 404 status for any path that matches no file. Without it a mistyped URL returns a bare platform error page instead of the site's own.

**Critical test scenarios** (each maps to an acceptance criterion in `## Requirements`):

- Happy path: a visitor lands on `/`, opens SERVICES, follows `/scan-to-bim`, and sees that page in the same shell with SERVICES underlined in the nav, verifies **AC-2**, **AC-4**, **AC-5**, **AC-8**.
- Keyboard path: Tab from the top reaches the skip link first, Enter jumps focus into `<main>`; going back, Enter on SERVICES opens the panel, ArrowDown moves through it, Escape closes it and focus is back on the button, verifies **AC-5**, **AC-13**.
- Mobile path: at 390px wide the hamburger opens the panel, Tab cycles inside it and never reaches the page behind, the page does not scroll, SERVICES expands to three links, Escape closes everything and focus returns to the hamburger, verifies **AC-6**.
- Failure case: with JavaScript disabled, `/` still shows every nav link including all three services, and every one of them navigates, verifies **AC-7**.
- Failure case: on a throttled connection the page paints with both panels already hidden and no open menu is ever visible, verifies **AC-18**.
- Edge case: opening the dropdown on a wide window and then narrowing below 1024px leaves no control reporting `aria-expanded="true"`, verifies **AC-5**.
- Failure case: requesting `/does-not-exist` against a preview of the production build returns the styled 404 page with status 404, not a platform error, verifies **AC-12**.
- Edge case: temporarily emptying the services collection builds successfully with no SERVICES control anywhere and no empty panel, verifies **AC-10**.
- Edge case: removing `ui.openMenu` from `main.yaml` fails the build with a message naming that file and field, verifies **AC-11**.
- Regression: after the shell lands, `pnpm build` still fails when a project references a missing service, proving spec 0002's cross entry checks still run without a page importing `getStats`, verifies **AC-15**.

## Build plan

Sliced by the project's Skateboard approach: the first milestone is the thinnest whole site a visitor could genuinely use, a complete frame on every route, including the 404, with no script at all. The second adds the behaviour on top of markup that already works, which is the only order in which the no script baseline can actually be proven. The third and fourth harden and document it.

The 404 sits in milestone 1 rather than later on purpose. Whether Cloudflare's static assets layer serves `404.html` correctly when the Worker entrypoint from spec 0001 is also configured is the one thing in this spec that cannot be settled by reading, only by asking a real preview. Finding that out on day one is cheap; finding it out in the last milestone is not.

**Milestone 1: the whole site stands up, with no script**

1. Add the required `ui` block and optional `legal` list to the `navigation` schema in `src/content.config.ts`, and fill both into `src/content/navigation/en/main.yaml` in the same change, satisfies **AC-11**.
2. Build `src/components/ui/Icon.astro` with the eight icon map and its `IconName` union, satisfies **AC-14**.
3. Build `src/layouts/PageLayout.astro` wrapping `BaseLayout` with the skip link, header slot, `<main id="main" tabindex="-1">`, footer slot, the `--header-h` declaration, and the inline `js` flag script in the head, satisfies **AC-1**, **AC-13**, **AC-18**.
4. Build `Header.astro` as static markup only: logo, nav items with the fixed ids, the services group rendered open, the call to action in both the bar and the mobile panel, and the mobile panel rendered open below `lg`. Mark the current page in the header only, computed at build from `Astro.url.pathname`, satisfies **AC-4**, **AC-7**, **AC-8**, **AC-10**.
5. Build `Footer.astro` with the four columns, the social icons, the copyright row, the conditional legal row and the empty social case, satisfies **AC-9**, **AC-10**.
6. Create the route stubs on `tone="white"` sections: `about-us.astro`, `project.astro`, `contact-us.astro`, `[service].astro` with its `getStaticPaths`, and move `index.astro` onto `PageLayout`, satisfies **AC-2**, **AC-3**.
7. Build `src/pages/404.astro` from the `notFound` entry inside `PageLayout`, set `assets.not_found_handling` to `"404-page"` in `wrangler.jsonc`, then prove a missing path returns that page with status 404 against a real preview of the production build, satisfies **AC-12**.

**Milestone 2: the nav behaves**

8. Add the panel hiding CSS gated on the `js` flag, and confirm on a throttled load that no open menu is ever painted, satisfies **AC-18**, **AC-7**.
9. Write `src/scripts/nav.ts` with the exported breakpoint const, then the dropdown's open and close machine: hover, click, Enter, Space, ArrowDown, ArrowUp, Escape, outside click and focus leaving, keeping `aria-expanded` truthful, satisfies **AC-5**.
10. Add the mobile machine to the same module: hamburger toggle with the label swap, the focus trap recomputing its focusable set on each Tab, the `overflow: hidden` scroll lock with `scrollbar-gutter: stable`, Escape, and close on following a link, satisfies **AC-6**.
11. Add the single `matchMedia` listener that closes whichever machine belongs to the breakpoint being left, in both directions, satisfies **AC-5**, **AC-6**.
12. Import the module from one `<script>` in `Header.astro` and confirm it is the only bundled JavaScript a page loads, satisfies **AC-17**.

**Milestone 3: the content gate**

13. Add the single build time call site that exercises every getter once, with its comment, and strip the orphan calls from `index.astro`, satisfies **AC-15**.

**Milestone 4: written down**

14. Add `PageLayout`, `Header`, `Footer` and `Icon` sections to `docs/design.md` under `## Components`, and add the icon set plus the header and footer to `/styleguide`, satisfies **AC-16**.
15. Run `pnpm check`, `pnpm lint` and `pnpm build`, and confirm `dist/client/` holds exactly the eight HTML files and no React is hydrated, satisfies **AC-17**.

## Consequences

**Positive**:

- Features 6 to 10 stop being page plus chrome and become page only. Each one opens a file that already renders in the right frame with the right metadata.
- The site becomes navigable end to end for the first time, which is what makes it showable to a client and what feature 11's SEO work needs underneath it.
- The no script baseline means the nav has no single point of failure. The worst case is cosmetic.
- The footer can never fall out of step with the header, and a fourth service appears in the nav, the dropdown, the footer and its own page from one new file.
- The 404 stops being a hope about adapter behaviour and becomes a configured, checkable fact.

**Negative / tradeoffs**:

- Two layouts now exist and a page that imports the wrong one loses its header with no error. The comment at the top of `BaseLayout` has to say so plainly, and it is the first thing to check when a page renders bare.
- The focus trap and the outside click handling are hand written, and they are the part of this feature most likely to have a bug that only a keyboard user meets. They deserve the closest attention in `/check verify`.
- The panels are visible in the emitted HTML, so the site now carries one inline script in the head whose only job is to set a flag before paint. It is a small thing to explain to every future reader, and it is load bearing: remove it and the menus flash open on every slow load.
- The `--header-h` value, the `(min-width: 64rem)` const in the script and Tailwind's `lg` token all describe the same two facts in three places. Comments tie them together, but nothing enforces it, so a token change needs a deliberate look at all three.
- Thin stub pages can read as finished. Someone glancing at `/about-us` will see a heading and an intro and might tick feature 7 off. The scope rows are what keep that honest.
- The header and footer stay light, which is further from the reference site than a dark footer would be. That remains deferred work, and doing it later means recomputing contrast pairs, not just changing a colour.

**Neutral**:

- Spec 0002's data model sketch no longer matches the schema once `ui` and `legal` land. It needs a line, not a rewrite.
- The build fails the moment the schema change lands and before `main.yaml` is updated. That is the schema doing its job, but it means those two edits belong in one commit.
- `src/scripts/` is a new directory and a new place to look for behaviour. It should stay small; anything that grows past the nav is a sign something wants a different home.
- Astro's static before dynamic route matching is now load bearing. It is stable behaviour, but it is worth a comment in `[service].astro` so nobody moves the file to be safe and breaks the URLs.

## Follow-up

- [ ] Spec 0002's *Data model sketch* lists the `navigation` fields and no longer matches once `ui` and `legal` ship. Add both rows to it so the content model spec stays the single description of the schema.
- [ ] The scope's done when line for feature 5 still contains `/service-2` and `/service-3`, left over from an earlier edit. The real routes are the three named service slugs.
- [ ] Spec 0003 reserved `--color-yellow` for "feature 5's icons" and said to drop the token if feature 5 ships without it. This design uses `currentColor` for every icon, so unless the build finds a use, the token should be removed and `docs/design.md` updated with it.
- [ ] Feature 13's privacy page has a home waiting in `navigation.legal`. Adding the link is a content edit, no code change.
- [ ] Feature 11 owns canonical URLs, the sitemap, robots rules and social preview cards. This spec only guarantees that every page passes a title and a description through `PageLayout`; the `<head>` will need extending, and `astro.config.mjs` still deliberately has no `site` set.
- [ ] Feature 6 takes `getStats` over for real. When it does, the build time call site from task 12 can drop that getter, or stay as the guard for whichever getter is next without a page.

## Rationale

Reasoning and options: see [rationale.md](rationale.md).
