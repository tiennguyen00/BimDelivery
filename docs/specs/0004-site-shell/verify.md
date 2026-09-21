# Verify: site shell · spec 0004 · updated 2026-09-21

_Steps derived from spec 0004 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

Steps marked **(done)** were run during `/develop` and passed. Everything else
needs a browser, which the build did not have, so the behaviour of the nav is
entirely unproven. The focus trap, the outside click handling and the touch
dropdown are the parts most likely to hold a bug, and they are the reason this
file exists.

## Commands

- [x] `pnpm check` → 0 errors, 0 warnings **(done)** → AC-17
- [x] `pnpm lint` → clean **(done)** → AC-17
- [x] `pnpm build` → succeeds; `dist/client/` holds exactly these eight HTML
      files and no others: `404.html`, `index.html`, `about-us/index.html`,
      `project/index.html`, `contact-us/index.html`,
      `revit-modeling/index.html`, `scan-to-bim/index.html`,
      `bim-coordination/index.html` **(done)** → AC-2, AC-17
- [x] `find dist -name 'styleguide*'` → nothing. The style guide is dev only and
      never reaches a build **(done)** → AC-17
- [x] Each built page holds exactly one `<script>` (the flag) and one
      `<script type="module">` (the nav bundle), and no `astro-island`, so no
      React is hydrated **(done)** → AC-17
- [x] `pnpm exec wrangler deploy --dry-run` → reads `dist/client/wrangler.json`
      and exits clean **(done)** → AC-12

## Failure and edge drills (each restores the file afterwards)

- [x] Point a project's `service` at `en/does-not-exist` → `pnpm build` fails
      with `[content] projects: … points to service "en/does-not-exist"`. This
      is the proof that spec 0002's cross entry checks still run even though no
      page reads `getProjects` **(done)** → AC-15
- [x] Set `ui.openMenu` to `""` in `src/content/navigation/en/main.yaml` →
      build fails with `ui.openMenu: Too small: expected string to have >=1
      characters`, naming the file **(done)** → AC-11
- [x] Remove the whole `ui:` block → build fails with `ui: Required`, naming the
      file **(done)** → AC-11
- [x] Move every file out of `src/content/services/en/` and
      `src/content/projects/en/` → build succeeds, and no page holds
      `id="nav-services-desktop-btn"`, `id="nav-services-mobile-btn"`, a
      `>Services<` nav label, or a `Services</h2>` footer column. No empty panel
      exists **(done)** → AC-10
- [ ] Add a fourth service file with a new slug and `order: 4` → a fourth page,
      a fourth dropdown entry, a fourth footer link, with no code edit → AC-2
- [ ] Give a service the slug `about-us` → build fails on the reserved path
      list → AC-2

## UI and manual

### Routing and the 404

- [x] Request `/nope` against `pnpm preview` (a real preview of the production
      build) → the site's own 404 page, HTTP **404**, not a platform error page
      **(done)** → AC-12
- [x] Request `/`, `/about-us/`, `/scan-to-bim/`, `/404` against the same
      preview → HTTP 200 each **(done)** → AC-2
- [ ] Note: `/about-us` without the trailing slash answers **307** to
      `/about-us/`. Every nav link pays that redirect. Decide in feature 11
      whether to set `build.format: 'file'` or add trailing slashes to the
      content hrefs → AC-2

### The frame

- [ ] Every page: `<title>` and the meta description are that page's own
      `seo` values, and the `h1` and the intro paragraph come from the same
      entry. No visible words are written into a layout or a component → AC-3
- [ ] Open `/styleguide` under `pnpm dev`: the page itself has no header and no
      footer from its layout. The one header and footer on it are inside the
      "The site shell" section, which is the deliberate preview → AC-1, AC-16
- [ ] Every page has exactly one `<h1>`, and it is the page's heading, never the
      logo → key invariant
- [ ] The header is the same height on every page and does not move or resize on
      scroll. Nothing in the built JavaScript registers a scroll listener → AC-4

### Keyboard

- [ ] Tab once from the top of any page → the skip link appears, visibly, as the
      first focusable thing → AC-13
- [ ] Press Enter on it → focus lands in `<main>`, not just the scroll position.
      Tab again and the next stop is inside the page content, not back in the
      header → AC-13
- [ ] Every control in the header and footer shows the deep gold focus ring, and
      none is smaller than 44 by 44 → AC-13
- [ ] At 1280px, Tab to SERVICES and press Enter → panel opens. Press Escape →
      panel closes and focus is back on the SERVICES button → AC-5
- [ ] Same, with Space → opens → AC-5
- [ ] Same, with ArrowDown → opens **and** focus moves to the first service
      link. ArrowDown and ArrowUp then move between the three, wrapping at both
      ends → AC-5
- [ ] With the panel open, Tab past the last service link → the panel closes
      rather than being left open behind the next nav item → AC-5
- [ ] `aria-expanded` on the SERVICES button matches what is visible at every
      point above → AC-5

### Mouse and touch

- [ ] At 1280px, move the pointer onto SERVICES → opens. Move it away → closes
      → AC-5
- [ ] Open it by keyboard, then move the mouse over it and away again → the
      panel stays open, because focus is still inside it. Focus must never land
      on a hidden element → AC-5
- [ ] Click SERVICES while open → closes, focus returns to the button → AC-5
- [ ] Click anywhere outside the header while open → closes → AC-5
- [ ] **On a real touch screen at 1024px or wider**, tap SERVICES → the panel
      opens and stays open. It must not open and immediately shut: `pointerenter`
      fires on tap and is guarded to mouse only, and this is the step that
      proves the guard works → AC-5

### The mobile menu

- [ ] At 390px wide, tap the hamburger → the panel fills the viewport beneath
      the header, and the hamburger's accessible name becomes `Close menu` → AC-6
- [ ] While open, the page behind does not scroll, and it does not shift
      sideways when the scrollbar goes → AC-6
- [ ] Tab repeatedly → focus cycles through the hamburger and the panel's links
      and never reaches the page behind. **Shift Tab from the hamburger** must
      wrap to the last panel item, not escape to the logo → AC-6
- [ ] Expand SERVICES inside the panel, then Tab → the three service links are
      in the cycle straight away, not after the next open → AC-6
- [ ] Escape → the panel closes and focus returns to the hamburger → AC-6
- [ ] Follow a link inside the panel → the menu closes; going back does not land
      on a page with the menu still over it → AC-6
- [ ] Open the dropdown at 1280px, then narrow the window below 1024px → no
      control anywhere reports `aria-expanded="true"` → AC-5, AC-6
- [ ] Open the mobile menu at 390px, then widen past 1024px → the menu closes
      and body scrolling is released → AC-6

### Without JavaScript, and on a slow connection

- [ ] Disable JavaScript, load `/` at 390px → the menu panel sits in the page
      flow under the header, every nav link including all three services is
      visible, and the page content continues below it. Nothing is covered → AC-7
- [ ] Same at 1280px → the services panel is visible under SERVICES and all
      three links navigate → AC-7
- [ ] Every link in both states actually navigates. No control is a dead end
      → AC-7
- [ ] Throttle to slow 3G and load any page with JavaScript on → no open menu is
      ever painted, not for a frame. This is what the inline flag script in the
      document head buys → AC-18
- [ ] View source on any page: exactly one inline `<script>`, and it does
      nothing but add the `js` class → AC-18

### Active marking

- [ ] On `/about-us`, the header's About Us link carries `aria-current="page"`
      and the gold underline → AC-8
- [ ] On `/scan-to-bim`, the SERVICES control carries the underline and **no**
      `aria-current`; the Scan to BIM link inside the panel carries
      `aria-current="page"` → AC-8
- [ ] On `/404`, nothing carries `aria-current` → AC-8
- [ ] No footer link ever carries `aria-current` → AC-8
- [ ] **Known reading of AC-8**: the nav is in the DOM twice, so two elements
      carry `aria-current="page"` in the HTML. Only one is ever in the
      accessibility tree, because the other copy is `display: none` at that
      breakpoint. Check the accessibility tree (or an axe run), not a grep of
      the file. Confirm this is the reading you want → AC-8

### The footer

- [ ] At 1280px the footer is four columns; at 768px two; below that one → AC-9
- [ ] The site links and the service links both match the header exactly → AC-9
- [ ] Each social link announces its network, opens in a new tab, and carries
      `rel="noopener noreferrer"` → AC-9
- [ ] Empty `settings.social` → the whole social block is gone, not an empty row
      → AC-9
- [ ] `navigation.legal` absent (today's state) → the bottom row is just the
      copyright. Add a legal link → it appears beside the copyright → AC-9

### Icons and the style guide

- [ ] `/styleguide` shows all eight icons with their names, and again in gold to
      prove they inherit `currentColor` → AC-14, AC-16
- [ ] Pass `name="nonsense"` to `Icon` → `pnpm check` fails. It must be a type
      error, not a blank square → AC-14
- [ ] `docs/design.md` has a section for `PageLayout`, `Header`, `Footer` and
      `Icon` under `## Components` → AC-16

## Value sourcing (one per row of the spec's table)

- [ ] Page language: every page's `<html lang>` is `en`, from `Astro.currentLocale`
      falling back to `DEFAULT_LOCALE` → Value sourcing
- [ ] Title and description: change a page's `seo.title` in content → only that
      page's `<title>` changes → Value sourcing
- [ ] Logo and its name: change `settings.logo.alt` → the header logo link's
      accessible name changes with it. Remove `alt` and set `decorative: true` →
      the link falls back to `siteName` and is never nameless → Value sourcing
- [ ] Nav labels and hrefs: rename a nav item in `navigation.items` → it changes
      in the header, both copies, and in the footer → Value sourcing
- [ ] Service order: change a service's `order` → the dropdown, the footer
      column and the route table all reorder together → Value sourcing
- [ ] Call to action: remove `navigation.cta` → no button renders in the bar or
      the panel, and nothing breaks → Value sourcing
- [ ] Current page: visit `/about-us/` **with** the trailing slash and without →
      the same nav item is marked either way, because both sides are normalised
      → Value sourcing
- [ ] Header height: change `--header-h` in `PageLayout` → the bar and the
      mobile panel's top offset move together. Also change `DESKTOP_QUERY` in
      `src/scripts/nav.ts` and the `lg` token if the breakpoint moves; nothing
      enforces that the three agree → Value sourcing
- [ ] Hamburger name: it reads `navigation.ui.openMenu` closed and
      `ui.closeMenu` open, both from content, swapped by the script → Value
      sourcing
- [ ] Nav landmark names: the header `<nav>` is named by `ui.primaryNavLabel`
      and the footer `<nav>` by `ui.footerNavLabel` → Value sourcing
- [ ] Skip link: its words come from `ui.skipToContent` and its target is
      `#main` → Value sourcing
- [ ] Footer brand and copyright: from `settings.footer.text` and
      `settings.footer.copyright` → Value sourcing
- [ ] Contact details: from `settings.contact`; the phone link strips everything
      but digits and a leading `+` → Value sourcing
- [ ] Social name: derived in code from `network` through the fixed map, not
      from content → Value sourcing
- [ ] Service page content: heading, intro and SEO come from that service's own
      entry; `getStaticPaths` builds one page per `slug` → Value sourcing
- [ ] 404 content: heading, text, button and SEO from the `notFound` entry; the
      404 **status** comes from `not_found_handling` in `wrangler.jsonc`, not
      from the page → Value sourcing
- [ ] Icon colour: an icon inside gold text is gold; it names no colour of its
      own → Value sourcing

## The header card (added 2026-09-21, milestone 5)

Steps marked **(done)** were run during `/develop` against a preview of the
production build in headless Chrome, reading computed styles and screenshots.

- [x] On `/` and `/about-us` at 1280px and 390px the header is a full width
      white card: bottom corners 24px, a shadow, bottom border 0 → AC-4 **(done)**
- [x] The card's box is exactly `--header-h` tall: 80px at 1280px, 72px at
      390px → AC-4, Value sourcing (`--header-h`) **(done)**
- [x] On `/about-us` the `h1` starts fully below the card, and scrolled down
      the card stays stuck at the top over the content → AC-4 **(done)**
- [ ] On `/` the hero photo shows behind the card's corners. This needs spec
      0005's milestone 5 (the hero pull up); until it lands, home starts below
      the card like every other page → AC-4
- [x] At 390px open the menu: the corners compute to 0 and the shadow to
      `none`, and no page shows at the corners above the panel → AC-19 **(done)**
- [ ] At 390px close the menu again: the corners and the shadow come back
      → AC-19
- [x] At 390px with JavaScript off, the panel sits in the flow inside the card
      and the rounded corners fall below it, with nothing covered → AC-19 **(done)**
- [ ] The `--radius-card` token: change it in `global.css` to `0.5rem`,
      rebuild, and the header corners follow; restore it → Value sourcing
      (the card's radius)
- [ ] The squared corner rule is unlayered: in the built CSS, `html.js
      header:has(#nav-menu-panel[data-open])` sits outside every `@layer`
      block → AC-19 **(done during the build, re-check after any CSS move)**

## Acceptance-criteria coverage

- AC-1 · covered by the `/styleguide` layout step
- AC-2 · covered by the build file list, the preview status codes, and the
  fourth service drill
- AC-3 · covered by the frame steps
- AC-4 · covered by the header height and scroll listener steps, and the header card steps (partly **done**)
- AC-5 · covered by the keyboard, mouse, touch and breakpoint dropdown steps
- AC-6 · covered by the mobile menu steps
- AC-7 · covered by the no JavaScript steps
- AC-8 · covered by the active marking steps, including the known reading
- AC-9 · covered by the footer steps
- AC-10 · covered by the empty services drill **(done)**
- AC-11 · covered by both `ui` drills **(done)**
- AC-12 · covered by the preview 404 step **(done)**
- AC-13 · covered by the keyboard steps
- AC-14 · covered by the icon steps
- AC-15 · covered by the broken service reference drill **(done)**
- AC-16 · covered by the style guide and `design.md` steps
- AC-17 · covered by the command steps **(done)**
- AC-18 · covered by the throttled load and view source steps
- AC-19 · covered by the header card menu steps (partly **done**)
