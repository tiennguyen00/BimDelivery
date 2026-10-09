# Scope: BIM Delivery Website

A marketing website for a BIM and Revit modeling services company. Five public pages, placeholder content for now, built so real content and real features can land later without a rewrite.

**Build approach:** Skateboard (ship the smallest genuinely usable whole site, then grow it release by release).
**Workflow:** Alpha (after `/develop`, run `/check verify` on the real site; no separate test suite by default). The project default level of rigor. `/architect` is the recommended first stop for a feature with a real decision, but skippable when you already know the build. Any feature can carry its own tag (e.g. `· Beta`) to do more or less.

_These are recommendations to keep your build orderly, not requirements. Skip anything that does not fit: if you already know how to build a feature, use `/develop` and skip `/architect`. You decide when a feature is `done`._

## At a glance

| # | Feature | Phase | Status |
|---|---------|-------|--------|
| 1 | Stack & architecture | Foundation | done |
| 2 | Coding standards & tooling | Foundation | done |
| 3 | Content model | Foundation | done |
| 4 | Design system & UI foundation | Foundation | done |
| 5 | Site shell: nav, dropdown, footer | Release 1 | in-progress |
| 6 | Home page | Release 1 | in-progress |
| 7 | About Us page | Release 1 | in-progress |
| 8 | Service pages (three) | Release 1 | in-progress |
| 9 | Project page | Release 1 | in-progress |
| 10 | Contact page | Release 1 | in-progress |
| 16 | Project detail pages | Release 1 | in-progress |
| 17 | Smooth scrolling | Release 1 | in-progress |
| 11 | SEO foundation | Release 2 | planned |
| 12 | Performance & image handling | Release 2 | planned |
| 13 | Privacy policy page | Release 2 | planned |
| 14 | Launch to a live URL | Release 2 | planned |
| 15 | Visitor analytics | Release 3 | planned |

## Foundations

### 1. Stack & architecture
Decide the framework and project shape for a public marketing site that has to render fast and be read easily by search engines, then scaffold a runnable project from that decision.
**Done when:** the stack is recorded in a spec, and an empty scaffold boots locally, builds clean, and serves a page whose text is already in the HTML the server sends.
spec [0001](../specs/0001-stack-and-architecture/index.md) · code in [src/](../../src/) (config: `astro.config.mjs`, `wrangler.jsonc`)
- [x] Decide the stack (spec): `/architect stack & architecture`
- [x] Scaffold from the decision: `/develop stack & architecture`
- [x] Verify it: `/check verify stack & architecture`

This spec is also the natural place to settle where the site is hosted. If it does, feature 14 can go straight to `/develop`. **It did**: spec 0001 settles Cloudflare hosting, the DNS move, and the full deploy configuration, so feature 14 can skip `/architect`.

### 2. Coding standards & tooling
Capture the conventions from the real scaffolded project, then install lint, format, and commit checks, so every page after this is written the same way.
**Done when:** root `AGENTS.md` reflects the real stack and the agreed conventions, and lint and format run clean on the scaffold.
code in the project root (config: `eslint.config.js`, `.prettierrc.json`, `.husky/pre-commit`, `lint-staged` in `package.json`)
- [x] Capture conventions + tooling choices: `/audit`
- [x] Install the tooling: `/develop tooling`

### 3. Content model
The shape of the content data files every page reads: site settings, navigation, home page sections, the three services, project entries, and contact details. Carries a language key from day one so a second language can drop in later without reshaping anything.
**Done when:** every headline, paragraph, and image on the site comes from a data file rather than from layout code; each entry carries a language key; adding a fourth service means adding one entry, not editing a component.
spec [0002](../specs/0002-content-model/index.md) · code in [src/content/](../../src/content/) (config: `src/content.config.ts`, query module: `src/lib/content.ts`, locales: `src/i18n/locales.ts`)
- [x] Design it (spec): `/architect content model`
- [x] Build it: `/develop content model`
  - [x] Thin path: locale list, shared shapes, `home` collection, query module, placeholder home page reading from content (AC-2 to AC-5, AC-10)
  - [x] Services and projects with placeholder entries, stock images, and cross entry checks (AC-6 to AC-9, AC-11)
  - [x] Remaining single entry collections (settings, navigation, stats, about, contact, projectPage, notFound) and their getters (AC-1, AC-2, AC-8, AC-11)
  - [x] Build gate and failure drills (AC-3 to AC-7, AC-12)
- [x] Verify it: `/check verify content model`

### 4. Design system & UI foundation
The visual language and the base pieces every page reuses: type scale, colour, spacing, the breakpoints for desktop, tablet, and mobile, plus buttons, cards, section wrappers, and form fields.
**Done when:** `design.md` covers type, colour, spacing, and the three breakpoints; base components are reachable by keyboard with a visible focus outline and readable contrast; a page can be composed from them without writing new one off CSS.
spec [0003](../specs/0003-design-system-ui-foundation/index.md) · code in [src/components/ui/](../../src/components/ui/) and [src/components/react/ui/](../../src/components/react/ui/) (tokens: `src/styles/global.css`, reference: `docs/design.md`, style guide: `src/dev/`)
- [x] Design it (spec): `/architect design system & UI foundation`
- [x] Build it: `/develop design system & UI foundation`
  - [x] Tokens, Inter, and base styles sitewide: Tailwind and the Prettier plugin installed, `global.css` with the four cleared namespaces, every token and its type companion keys, fonts API, `BaseLayout` wired (AC-2 to AC-5, AC-10, AC-12)
  - [x] Astro components: class maps, `Section`, `Button`, `Card` (AC-6 to AC-8, AC-10, AC-14)
  - [x] React fields: React integration, `Button`, `TextField`, `TextArea` sharing the class maps (AC-7, AC-9)
  - [x] Dev only `/styleguide`, `docs/design.md` with both contrast tables and the gold rule, and the build gate (AC-1, AC-11, AC-13 to AC-15)
- [x] Verify it: `/check verify design system & UI foundation`

## Release 1: the whole site stands up

Every page exists, is linked, and reads well on a phone. This is the thinnest version a visitor would actually use, and the version you can show a client.

### 5. Site shell: nav, dropdown, footer
The header, the navigation with a SERVICES dropdown holding three sub items, the mobile menu, the footer, and the page layout every route sits inside. There is no services overview page yet, so the SERVICES item only opens the dropdown.
**Done when:** `/`, `/about-us`, `/revit-modeling`, `/scan-to-bim`, `/bim-coordination`, `/project`, and `/contact-us` all resolve and are reachable from the nav; the dropdown opens by mouse, keyboard, and touch, and closes on Escape; the mobile menu works; the current page is marked in the nav; a 404 page exists.
spec [0004](../specs/0004-site-shell/index.md) · code in [src/components/ui/](../../src/components/ui/) and [src/pages/](../../src/pages/) (layout: `src/layouts/PageLayout.astro`, script: `src/scripts/nav.ts`, build gate: `src/lib/content-gate.ts`)
- [x] Design it (spec): `/architect site shell`
- [x] Build it: `/develop site shell`
  - [x] Frame and routes, no script yet: the nav `ui` strings, `Icon`, `PageLayout`, static `Header` and `Footer`, the route stubs, and the 404 proved against a real preview (AC-1 to AC-4, AC-7 to AC-14, AC-18)
  - [x] Nav behaviour: the no flash hiding, the dropdown and mobile menu machines, the focus trap and scroll lock, and the breakpoint listener (AC-5 to AC-7, AC-17, AC-18)
  - [x] Content gate: one build time call site keeping spec 0002's cross entry checks running (AC-15)
  - [x] Written down: `docs/design.md` sections, `/styleguide` entries, and the build gate (AC-16, AC-17)
  - [x] The header card (2026-09-21): the `--radius-card` token, the full width white card with rounded bottom corners and a shadow, corners squared while the mobile menu is open, and the `--header-h` readers written down (AC-4, AC-19)
- [ ] Verify it: `/check verify site shell`

### 6. Home page
The front door, following the reference layout minus the section you cut: hero, why choose us, company overview, stats counter, three service cards, global presence, differentiators list, certification, and a closing call to action.
**Done when:** every section renders from content data on desktop, tablet, and mobile; the services section shows exactly three cards linking to the three service pages; the "Delivering Precision BIM & Revit Modeling" section is absent; every image carries alt text.
spec [0005](../specs/0005-home-page/index.md) (ratified 2026-09-21 as the six section page; it supersedes 0007 and 0008), plus [0006](../specs/0006-remote-photos.md) (assumed decision, owes `/architect remote photos`) and [0009](../specs/0009-intro-typing.md) (assumed decision, owes `/architect home page`, contradicts 0005 AC-8) · code in [src/components/home/](../../src/components/home/) and [src/pages/index.astro](../../src/pages/index.astro) (shared bands: `src/components/ui/MediaText.astro`, `StatsBand.astro`, `CtaBand.astro`, scripts: `src/scripts/counters.ts`, `hero-carousel.ts`, `reveal.ts`)
- [x] Design it (spec): `/architect home page`
- [x] Build it: `/develop home page`
  - [x] The whole page stands up, no script: `MediaText`, `StatsBand`, `CtaBand` with its `ctaLinkClass`, the hero, and the three home only pieces, composed into `index.astro` with its tones, image loading, and heading ids (AC-1 to AC-5, AC-7 to AC-13, AC-15, AC-18)
  - [x] The numbers move: `counters.ts`, the data attributes it reads, the reduced motion cut, and the no script proof (AC-6, AC-14)
  - [x] The guard: the exactly three services rule added to the cross entry checks (AC-4)
  - [x] Written down and gated: `design.md` entries with the new contrast pairs and the focus exception, `/styleguide` tiles, and the check, lint, and build gates (AC-16, AC-17)
  - [x] The reference hero (2026-09-21, after the header card): the scrim token and the two ring focus rule (the gold band moves to it), the shared band frame, the strict hero schema, the full bleed hero under the header card, and `design.md` plus `/styleguide` updated (AC-3, AC-12, AC-18 to AC-24)
  - [x] The reference why choose us band (2026-09-21, built without a spec revision): a black band with a gold highlighted heading and intro, the `stats` entry as four white icon cards (four new glyphs, a `gold-on-dark` token), and the separate stats band dropped from this page. Ratified by spec 0005's 2026-09-21 revision (AC-5, AC-8)
  - [x] Photos as internet links (2026-09-21, assumed decision, spec 0006): every photo on the site is a Pexels link Astro optimises at build, the hero is a white background photo with a centred object under the dark panel, and the local `.jpg` files are gone
  - [x] The reference presence band (2026-09-21, assumed decision, spec 0007): a white band under a `bg-diagonal` stripe, a dotted world map with region markers, `**bold**` copy, and the why choose list with `check` icons; the differentiators section folds into it and certification moves to `tint`
  - [x] The project showcase (2026-09-21, assumed decision, spec 0008): certification and the closing call to action leave the home page (the footer already carries the badges), and a `tint` showcase of the three lowest `order` projects follows the presence band, as photo tiles with scrim captions and one link to `/project`
  - [x] The ratified fixes (spec 0005, milestone 6): rename `whyChooseUs` to `intro` (`IntroBand`, `intro-heading`), remove the blinking caret, cap the map at six regions, an equal showcase grid for one or two projects, no hover zoom on the tiles, and `design.md` updated, then the preview and gates (AC-1, AC-8, AC-11, AC-13, AC-14, AC-17, AC-24 to AC-26, AC-29 to AC-31)
  - [x] The hero carousel (2026-09-21, built without a spec revision): up to three photos crossfading every 6s, dots and arrows as real buttons, a hover and focus hold, no autoplay for reduced motion. Recorded as built by spec 0005's 2026-09-22 revision, with no pause button, a WCAG 2.2.2 gap it owes a fix for (AC-12, AC-20, AC-22, AC-37)
  - [x] The scroll reveal (spec 0005, milestone 7): add `motion`, write `reveal.ts` on its mini `animate` and `inView`, prove one heading end to end, mark the services, overview, presence, and showcase bands, update `design.md`, then the preview and gates (AC-14, AC-17, AC-24, AC-33 to AC-36)
  - [x] The intro heading types (2026-09-22, assumed decision, spec 0009): `headingHighlight` becomes a word list, `typewriter.ts` types through it forever (no pause button, a WCAG 2.2.2 gap), the heading and its gold rule follow the text's width, and the heading drops to `text-h3`
  - [x] The service cards, still (spec 0005, milestone 8, 2026-09-22): the reference screenshot checked against the spec, the placeholder illustration checked in with its CREDITS line, `subServices` (3 to 6) and the strict `home.services` with `illustration` and `cardCue`, the `arrow-right` glyph, and `ServiceCard` in place of `Card` (AC-4, AC-12, AC-38, AC-39, AC-43). Built with the sub services as one centred line split by pipes, as the reference card shows (the engineer's choice), not the left aligned check list AC-38 asks for; spec 0005 owes that revision
  - [x] The service cards, gold hover (spec 0005, milestone 8): the tint to gold wash, gold side borders, black text, and the 4px lift on hover and focus with the reduced motion cut; the `goldHover` draft removed from `Card`; `design.md` updated; then the preview and gates (AC-13, AC-14, AC-17, AC-40 to AC-42, AC-44)
  - [x] The hero scrim panel's entrance (2026-09-23, built without a spec revision): on every photo change the panel holding the heading and its subheading fades in and rises 24px into place over 600ms with an ease out, the scroll reveal's language, found by `data-hero-panel` and animated with the browser's own Web Animations so the hero's script stays dependency free; the button below the panel stays still; never on the first paint, never with reduced motion, and no inline style left behind. `design.md` updated; spec 0005 owes the AC-37 revision that records it (AC-14, AC-17, AC-37)
  - [x] The intro card hover line, reversed (2026-09-23, built without a spec revision): the gold line under each stat card now runs back the way it came when the pointer leaves, right to left over the same 500ms, instead of fading out in place and only then snapping to zero width; one `scale` transition from `origin-left` plays both directions, so the opacity juggling is gone and the 150ms wait that lets the card lift first belongs to the hover state alone
  - [x] The heading rules draw with the scroll direction (spec 0005, milestone 9, 2026-09-23): one shared `heading-rule` utility replaces the `after:` class string copied into four files, and `reveal.ts` gains When the visitor is scrolling down the
  page it grows left to right, from nothing to full width. When they are
  scrolling up it plays the same draw in reverse: as soon as the heading
  starts to sink below the foot of the viewport, the rule runs back from full
  width to nothing, its right end travelling to the left edge, over the same
  600ms. The intro band's motion ban narrows to the fade-and-rise. No fifth script and no new dependency (AC-8, AC-32, AC-34, AC-45 to AC-50). Built with one change to build step 54: the wait a heading owes its block is recorded when the block is hidden, not when the block starts moving, because a heading crosses its own threshold about 20px of scroll before its taller block does and would otherwise draw its line under a block that is still invisible. AC-47's behaviour is unchanged and was measured in the browser; spec 0005 owes that wording fix
  - [x] The service card wash rises (2026-09-24, built without a spec revision): the hover and focus wash grows from the card's bottom edge to its top over the same 200ms instead of fading in place, one `scale` transition from `origin-bottom` on the wash layer (the `heading-rule` idiom, so it stays clear of the card's own `translate` lift and of the reveal's `transform`), and it runs back down the way it came when the pointer leaves. The wash also ends at `gold` at 70 percent rather than solid `gold`, a lighter amber whose darkest point measures #e9b74d in the browser, so `black` on it reads 11.35:1 instead of 8.73:1. `design.md` updated; spec 0005 owes the AC-40 and AC-41 revision that records both (AC-14, AC-17, AC-40 to AC-42)
- [ ] Verify it: `/check verify home page`

### 7. About Us page
Who the company is, in placeholder copy: the story, capability highlights, and the same stats and trust cues the home page uses.
**Done when:** `/about-us` renders from content data across the three breakpoints, reuses design system sections rather than new one off layout, and carries its own page title and description.
spec [0010](../specs/0010-about-us-page/index.md) · amended by spec [0012](../specs/0012-capability-band-entrance/index.md) · code in [src/pages/about-us.astro](../../src/pages/about-us.astro) and [src/components/about/](../../src/components/about/) (shared: `src/components/ui/Emphasis.astro`, `src/components/ui/Accordion.astro`, `src/lib/emphasis.ts`, content: `src/content/about/en/about.yaml`)
- [x] Design it (spec): `/architect about us page`
- [x] Build it: `/develop about us page`
  - [x] The whole page, still: the `==gold==` mark and the shared `Emphasis` component, the strict `about.yaml` with reference shaped placeholder copy, the `plus` and `minus` glyphs, the restyled `StatsBand`, the `<details>` `Accordion`, the footer's hidden certification panel, and the three about bands composed in `about-us.astro`, previewed at 375 to 1920 (AC-1 to AC-5, AC-7, AC-8, AC-10, AC-11, AC-14 to AC-17)
  - [x] The page moves: the CSS `entrance` on load for the about band, the scroll reveal and rule draw hooks on the lower bands, the accordion's CSS slide, checked with JavaScript off and reduced motion on (AC-6, AC-9, AC-12, AC-13)
  - [x] Written down and gated: `design.md` and `/styleguide` entries, the gold class search, and the check, lint, and build gates (AC-16, AC-18)
  - [x] The capability band's load entrance on screens where it starts in view, alongside its scroll reveal (spec 0012, ratified)
- [x] Verify it: `/check verify about us page`

### 8. Service pages (three)
One service page template, filled three times, at `//revit-modeling, /scan-to-bim, /bim-coordination`, `/service-2`, and `/service-3`: what the service is, what you get, a placeholder process, and a call to action back to contact.
**Done when:** all three URLs render from one template plus three data entries; each has its own title, description, and heading; adding a fourth is a data entry and a route, not a new layout; each links back to `/contact-us`.
spec [0013](../specs/0013-service-pages/index.md) · code in [src/pages/[service].astro](../../src/pages/%5Bservice%5D.astro) and [src/components/service/](../../src/components/service/) (shared: `src/lib/service-page.ts`, `src/components/ui/PatternBand.astro`, `src/components/ui/CarouselDots.astro`, `src/components/ui/PresenceBand.astro`, `src/scripts/carousel.ts`, content: `src/content/services/en/`)
- [x] Design it (spec): `/architect service pages`
- [x] Build it: `/develop service pages`
  - [x] The whole pages, still: the new glyphs and `strokeWidth`, the `panel` token and `bg-dots-dark`, `PatternBand`, the strict YAML services entries with ordered blocks each naming its layout, the presence override, the generalised carousel and `CarouselDots`, `PresenceBand` moved to `ui`, the six band components, `planServicePage`, and the route's `bands` map, with the reorder, restyle, and presence drills (AC-1 to AC-14, AC-16 to AC-18, AC-21, AC-22)
  - [x] The pages move: the intro's load entrance, the scroll reveal and rule hooks on the lower bands, the entrance on the block after the intro, checked with JavaScript off and reduced motion (AC-7, AC-15)
  - [x] Services come and go: `home.services.featured` checked in `getHomePage`, spec 0005's exactly three check removed, the home row for one to three cards, the change recipes in `src/content/README.md`, and the add and remove a service drills (AC-23 to AC-25)
  - [x] Written down and gated: `design.md`, the `entrance` comment in `global.css`, `/styleguide` tiles, the gold class search, and the check, lint, and build gates (AC-1, AC-19, AC-20)
- [ ] Verify it: `/check verify service pages`

### 9. Project page
A grid of placeholder project cards (image, title, one line) at `/project`, so the site can show work before detail pages exist.
**Done when:** `/project` renders a card grid from content data, reflows to tablet and mobile, images are sized so the layout does not jump while they load, and an empty state renders when there are no entries.
spec [0014](../specs/0014-project-page/index.md) · code in [src/pages/project.astro](../../src/pages/project.astro) and [src/components/project/](../../src/components/project/) (content: `src/content/projectPage/`, `src/content/projects/`)
- [x] Design it (spec): `/architect project page`
- [x] Build it: `/develop project page`
  - [x] The whole page, still: the strict `projectPage` with an emphasis intro and a `cta`, the 60 character title cap, a sixth placeholder project, `bandPaddingBottomClass`, the intro band, the full width 5:4 gallery with scrim strip captions and no links, the empty state, and `CtaBand`, composed in `project.astro` and previewed at 360 to 1920 with the long title, empty, and build guard drills (AC-1 to AC-11, AC-13)
  - [x] The page moves: `entrance.ts` moved to `ui`, the load entrance on the intro and the first three tiles, the scroll reveal stagger on the tiles, the `h1` rule drawing, checked with JavaScript off and reduced motion (AC-12)
  - [x] Written down and gated: `design.md` (the gallery, the 8px gap exception, the contrast row, motion, the scripts invariant), the `/styleguide` tile, and the check, lint, build, and gold class gates (AC-14, AC-15)
  - [x] The tiles answer a hover (AC-7 revised 2026-09-28): the slow photo zoom on each tile, `motion-safe`, default cursor, checked with a mouse, reduced motion, and touch; the "no hover" lines in `design.md`, `/styleguide`, and the component comment reworded (AC-7, AC-14)
- [ ] Verify it: `/check verify project page`

### 10. Contact page
Contact details and a form that looks and behaves real, at `/contact-us`. Nothing is delivered yet; real sending is its own later feature.
**Done when:** the form checks required fields and email shape, shows inline errors tied to their field so a screen reader announces them, shows a clear success state on submit, and the page also lists email, phone, and address from content data. The code states plainly that nothing is sent yet.
spec [0011](../specs/0011-contact-page/index.md) · code in [src/pages/contact-us.astro](../../src/pages/contact-us.astro), [src/components/contact/](../../src/components/contact/), and [src/components/react/ContactForm.tsx](../../src/components/react/ContactForm.tsx) (shared: `src/lib/contact.ts`, content: `src/content/contact/en/contact.yaml`)
- [x] Design it (spec): `/architect contact page`
- [x] Build it: `/develop contact page`
  - [x] Content and rules: the strict `contact.yaml` with placeholder copy and the two photos, `other` reserved, and `src/lib/contact.ts` (request schema, codes, the stand in `submitContact`) (AC-2, AC-3, AC-19)
  - [x] The whole page, still: dark band tokens and stripe, `surface` and `tel` on the fields, the new `Select`, three icons, the intro and form bands, the cards, and the form island with validation, the thank you panel, failure handling, and the no JavaScript fallback (AC-1, AC-4 to AC-7, AC-10 to AC-14, AC-16 to AC-18)
  - [x] Turnstile: the site key config, the `useTurnstile` hook, the widget, and the no token message (AC-8, AC-9)
  - [x] The page moves, written down and gated: the load entrance and scroll reveal, `design.md` and `/styleguide`, and the check, lint, and build gates (AC-15, AC-20)
- [ ] Verify it: `/check verify contact page`

### 16. Project detail pages
A page for every project at `/project/<slug>`, with its write up, key facts, and a photo gallery, so the project tiles finally lead somewhere. Moved out of Deferred on 2026-10-04 (from spec 0015).
**Done when:** `/project/<slug>` renders for every project from content data with its write up, facts, and gallery; the `/project` and home tiles each link to their project; the page reflows to tablet and mobile with nothing jumping as photos load; and a content mistake fails the build by name.
spec [0015](../specs/0015-project-detail-pages/index.md) · code in [src/pages/project/[slug].astro](../../src/pages/project/[slug].astro) and [src/components/project/](../../src/components/project/) (content: `src/content/projects/`, `src/content/projectPage/`; shared: `src/lib/project-detail.ts`)
- [x] Design it (spec): `/architect project detail pages`
- [x] Build it: `/develop project detail pages`
  - [x] Every detail page, still: the strict `projects` schema with `slug`, facts, write up, and gallery, the shared `detail` copy and cues, placeholder content and photos, the pure helpers, the extended intro, `wall.ts`, the four new bands, and the route, previewed with the facts, wrap, head, and build guard drills (AC-1 to AC-12, AC-16, AC-17, AC-19)
  - [x] The way in: the `/project` and home tiles as single links with the "Read more" cue, the home photo zoom, and the header's section marking, checked by keyboard, mouse, touch, and screen reader names (AC-13 to AC-16)
  - [x] The page moves: the load entrance on the intro and cover, the scroll reveal and rules on the story and gallery, checked with JavaScript off and reduced motion (AC-18)
  - [x] Written down and gated: `design.md`, `/styleguide`, and the check, lint, build, and gold class gates (AC-20, AC-21)
- [ ] Verify it: `/check verify project detail pages`

### 17. Smooth scrolling
Desktop wheel scrolling glides to a gentle stop on every page, and anchor jumps glide instead of snapping. Touch and reduced motion keep native scrolling. Enrolled 2026-10-09 (from spec 0016).
**Done when:** a wheel step eases to its target on every page, touch and reduced motion scroll natively, the Project page's scroll animations still follow, and the page behind the open mobile menu does not scroll.
spec [0016](../specs/0016-smooth-wheel-scrolling.md) · code in [src/scripts/smooth-scroll.ts](../../src/scripts/smooth-scroll.ts) (loaded from `src/layouts/PageLayout.astro`; CSS: `scroll-behavior` in `src/styles/global.css`)
- [x] Design it (spec): `/architect smooth scrolling`
- [x] Build it: `/develop smooth scrolling`
  - [x] The glide: `lenis` added, `smooth-scroll.ts` with the reduced motion cut and the menu lock pause, loaded on every page (AC-1 to AC-3, AC-6, AC-7)
  - [x] Anchors and checks: `scroll-behavior: smooth`, then the wheel, reduced motion, menu, Project page, skip link, and 390px checks in Chrome (AC-4, AC-5, AC-8)
- [ ] Verify it: `/check verify smooth scrolling`

## Release 2: findable, fast, and live

### 11. SEO foundation · needs a decision
The sitewide plumbing that lets search engines and chat previews understand the site: per page title and description, canonical URLs, a sitemap, robots rules, social preview cards, and organisation structured data.
**Done when:** every page has a unique title and description; a sitemap and a robots file are served; sharing any URL shows a correct preview card; the structured data validates; headings run in a sensible order on every page.
- [ ] Design it (spec): `/architect SEO foundation`

Worth knowing: because you chose `//revit-modeling, /scan-to-bim, /bim-coordination` style URLs, the path itself tells a search engine nothing about the service. Titles, headings, and descriptions carry more of the weight here than they would with named paths.

### 12. Performance & image handling
Make the pages fast on a real connection: right sized images in modern formats, deliberate font loading, and nothing jumping around as the page loads.
**Done when:** images are served at the size they are displayed and load lazily below the fold; fonts do not block the first paint; there is no visible layout shift; a production build of the home page meets the Core Web Vitals thresholds on a mid range mobile.
- [ ] Build it: `/develop performance & image handling`

### 13. Privacy policy page
A plain privacy page linked from the footer, covering what the contact form collects once it starts sending.
**Done when:** `/privacy` renders from content data, is linked in the footer, and says what is collected and how to reach you about it.
- [ ] Build it: `/develop privacy policy page`

### 14. Launch to a live URL · needs a decision
Put the site on a real host at a public URL, so it can be shared, measured, and judged on real speed.
**Done when:** the site is live at a URL you can send to someone, the production build runs in the host's own pipeline, and the live pages match what you see locally.
- [ ] Design it (spec): `/architect launch`

If feature 1's stack spec already settled the host, skip the spec and run `/develop launch` instead.

## Release 3: measure it

### 15. Visitor analytics · needs a decision
Know how many people arrive, where they come from, and which service page they read, so later improvements are guided by something other than guesswork.
**Done when:** page views and traffic sources are recorded on every page of the live site, the contact form's success state is recorded as a conversion, and the added script does not break the performance targets from feature 12.
- [ ] Design it (spec): `/architect visitor analytics`

## Deferred
Out of scope for the current build pass, kept so the plan stays honest.
- **Working contact form delivery**: the message actually reaches an inbox, with spam protection · needs a decision
- **Services overview page and more services**: grow from three toward the reference site's ten; decide then whether the home page keeps showing every service or a featured subset. Spec 0005 makes this a deliberate moment rather than a silent one: a fourth service entry stops the build until the home page's grid is decided (from specs 0002 and 0005)
- **Second language**: the switcher and a full second set of copy; the content model is already shaped for it · needs a decision
- **Content editing in a browser**: a real content system so copy changes need no code · needs a decision
- **Cookie consent banner**: once you run tracking that legally needs consent · needs a decision
- **Blog or insights section** · needs a decision
- **Real brand**: the real logo, brand colours, and typeface replace the palette borrowed from paviliusbim.com before launch; update the tokens, both contrast tables, and walk `/styleguide` again (from spec 0003)
- **A dark section tone**: bring back a dark band for a section such as the home page's closing call to action. It means reintroducing inherited tone variables, a card tone reset, and a second focus colour, then computing the dark contrast pairs. Gold reads well on black at 8.73:1 if you want it. Less urgent since spec 0005: the closing call to action now ends on a self contained gold band, so the dark tone is no longer the only way to close a page (from specs 0003 and 0005)
- **Testimonials and client logos**
- **Project gallery filter and pagination**: a service filter and "load more" or pages once the portfolio passes about 12 projects; a filter would be a fifth script, which `design.md` asks a strong reason for (from spec 0014)
- **Project photo lightbox**: let a visitor open a gallery photo larger, if they ask for it; it would be the fifth script, so it needs the strong reason `design.md` asks for (from spec 0015)
- **Real project portfolio**: replace the six placeholder write ups, facts, and about 30 placeholder photos with real work before launch, naming a client only where the client agrees (from spec 0015)
- **Carousel pause control**: a visible pause for the shared carousel, closing the WCAG 2.2.2 gap on the home hero and the three service intros (from spec 0013)
- **Redirects for removed pages**: once the site is live, a removed service's old URL (or any removed page) redirects instead of returning the 404 page; decide the mechanism with the SEO foundation or launch (from spec 0013)
- **Error monitoring**: know when a real visitor hits a broken page · needs a decision

## Legend

**The decision box.** Every feature carries exactly one, the sub task whose label ends with `(spec)`. Its wording varies (`Design it (spec)` normally, `Decide the stack (spec)` on Stack & architecture), so skills locate it by that `(spec)` suffix, never by an exact label. Every other box is an execution box and `/architect` never ticks one.

**Feature lifecycle**: the scope updates as a feature moves; each row is what it shows and who sets it:

| State | Set by | The feature shows |
|---|---|---|
| `planned` · needs a decision | `/scope` | one box: `Design it (spec): /architect <feature>` |
| `in-progress` (designed) | **`/architect` at spec capture** | `Design it` ticked; spec linked; `Build it: /develop <feature>` + **2 to 5 milestones**; the tier's closing boxes (`Verify it` Alpha+, `Test it` Beta+, `Review it` + `Document it` GA); any surfaced follow up enrolled |
| `in-progress` (building) | `/develop` | milestone sub boxes tick one by one; code pointer filled |
| `in-progress` (verified) | `/check verify` | `Build it` + milestones ticked; `Verify it` ticked |
| `done` | **you, when you decide it is** (any skill sets it when you say so); `/sync` reconciles | boxes you ran ticked, skipped ones marked skipped; the tier's last stage (`Prototype` after `/develop`; `Alpha` after `/check verify`; `Beta` and `GA` after `/test`) is the suggested point to call it done; `/sync` captures conventions |

- **Next step** = the first unticked box (always a command or a tracked milestone).
- **needs a decision** = run `/architect` first; otherwise straight to `/develop` (or `/audit` for standards & tooling). The tag drops once the spec is captured.
- **Atomic build tasks live in the spec's `## Build plan`, not here**: the scope carries only the milestone rollup.
- **Status** `planned` then `in-progress` then `done`, plus `existing` (pre workflow) and `dropped` (de scoped, kept for history).
- **Approach tag** beside a heading (e.g. `· Facade`) overrides the project default for that feature; no tag means it inherits.
- **Workflow tier tag** beside a heading (e.g. `· Beta`) sets that one feature's rigor above or below the project default; no tag inherits the default.
- **Workflow** (header line) is the project default, what runs after `/develop`: **Prototype** = nothing; **Alpha** = `/check verify`; **Beta** = `/check verify` then `/test`; **GA** = adds a fresh model `/check review` then `/document`.
- **Pointer line** (`spec <n> · code in <path>`): the spec link added by `/architect`, the code path by `/develop`.
