# 0013. Compose each service page from its own ordered content blocks, each drawn by a named layout

**Date**: 2026-09-26 (revised the same day: every block names a layout, a service can override the presence band, and the home page lists which services get a card, so each service changes on its own and whole services can come and go; first written 2026-09-26)
**Status**: In Progress
**Scope feature**: 8, Service pages (three) (`docs/scope/scope.md`); also amends feature 6, Home page (spec 0005 AC-4's count rule)

## Summary

Each service page (`/revit-modeling`, `/scan-to-bim`, `/bim-coordination`) comes from one route and one YAML file per service. The file lists the page's sections in order as blocks (typed pieces of content such as intro, features, audiences, process, presence), and each block names its `layout`, the design that draws it. You expect each service's content to change on its own later, so any service can reorder, add, remove, restyle, or override its sections without another service's page changing: a look only one service wants becomes a new layout, never an edit to a shared one. Whole services can come and go as content edits too, because the home page now lists which services get a card instead of requiring exactly three.

The demo pages hold the same five blocks: the reference intro with a photo carousel, a features band (cards or split, on a dark dotted or white striped background), six audiences, a process band ending with a Contact us button, and the home page's presence band. Motion reuses the site's existing language and the hero's carousel script, generalised, so the site gains no new script and no new dependency.

## Requirements

**User stories**:

- As a prospective client, I want each service page to say what the service is, what it covers, who it is for, and how the work runs, and to end with a clear way to get in touch.
- As a visitor on a phone, I want every band in one readable column with nothing sideways scrolling.
- As a keyboard or screen reader user, I want the carousel dots to be real buttons, the headings to run in order, and each band to be named by its heading.
- As someone editing the site, I want to change any word, photo, icon, or the order of the sections in a service's content file, never in a component.
- As someone editing the site, I want to reorder, add, remove, or restyle one service's sections, or give it its own presence copy, without any other service's page changing.
- As someone editing the site, I want to add or remove a whole service by adding or deleting its file, with the build naming anything that still points at a removed one.

**Acceptance criteria**:

- **AC-1**: `/revit-modeling`, `/scan-to-bim`, and `/bim-coordination` each render from the one route `src/pages/[service].astro` and one entry in `src/content/services/en/`, and `dist/client/<slug>/index.html` exists for each. The route holds no per service code: a service page needs no code edit to exist (spec 0004 AC-2 still holds).
- **AC-2**: A service page draws its entry's `sections` in list order, each block through the band component its `type` and `layout` name (AC-21), then the footer. Moving, removing, or duplicating a block (within the rules of AC-4) in a YAML file changes that page with no code edit. The three demo entries hold exactly five blocks each, in this order: `intro`, `features`, `audiences`, `process`, `presence`.
- **AC-3**: Every service entry is one strict YAML file, `src/content/services/en/<slug>.yaml`, with exactly the fields in *Data model sketch*, and every block carries a `layout`. The three `.md` files are gone. A leftover or unknown key (`image`, `deliverables`, `process`, `cta` at the top level, a typo anywhere) fails the build naming the key. Every project's `service` reference (`en/revit-modeling` and so on) still resolves, and the nav dropdown, the home service cards, and the contact form's "Your needs" choices render as before.
- **AC-4**: The build fails, naming the file and the field or text, when: `sections` is empty; there is not exactly one `intro` block, or it is not the first; there is more than one `presence` block; a block has no `layout`, or one its `type` does not define; an `icon` is outside its block's list (line icons for `features`, solid icons for `audiences`); a presence block's `content` is not a complete presence (every field `home.presence` has, and no other); or a block with `surface: light` has a `==` mark in any field other than `heading` or `subheading`.
- **AC-5**: Every heading, paragraph, bullet, title, photo, alt text, icon choice, button label, and link on a service page comes from its service entry, except the presence band (from its block's `content`, else `home.presence`) and the step numbers (from each step's position). `src/pages/[service].astro`, `src/lib/service-page.ts`, and every band component contain no visible copy of their own. The page title and description come from the entry's `seo`.
- **AC-6**: The intro band in the `carousel` layout (section 1) is a white `Section` labelled by its `h1`. From `lg` (1024px) the copy takes about seven twelfths on the start side and the carousel the rest, centred against the copy; below `lg` one column: heading, paragraphs, carousel. The `h1` (`heading`) is in capitals by CSS only and carries no gold rule. Each paragraph is left aligned (never justified) beside its own 4px gold bar (a decorative `--color-gold` fill, never a gold border), and its `**bold**` phrases are semibold `ink-strong`. The carousel shows the photos in a 4:3 box with `rounded-ui` corners, cropped to fill. The photos are generated at widths 480, 800, and 1200 with `sizes="(min-width: 1024px) 32vw, 100vw"` (the contact intro photo's set, not the hero's full width one). The first photo loads eagerly at high fetch priority and the rest lazily. Under the photos sit the dots: one real button per photo, named "Show photo N of M", a 24px hit area around a small mark that is black at 30 percent, or solid black for the photo showing. There are no arrows. With one photo there are no dots.
- **AC-7**: The intro carousel behaves exactly like the home hero's, through the same script: it crossfades every 6s with a 1s fade and wraps; it holds while the pointer is over it or focus is inside it; a dot shows its photo at once and restarts the clock; with reduced motion it never autoplays and the dots still work; with JavaScript off the first photo shows alone and no dots are visible. The home hero behaves exactly as before. The site gains no new script: `carousel.ts` replaces `hero-carousel.ts`. There is no pause button, the same WCAG 2.2.2 gap spec 0005 records for the hero.
- **AC-8**: A band with a `surface` is drawn by `PatternBand`. `dark`: a black band under the new `bg-dots-dark` dot pattern, carrying `focus-contrast` and borrowing the band frame from `styles.ts`, never a `Section` tone. `light`: a white `Section` with `bg-diagonal`. On `dark`, headings and body text are white, `**bold**` is semibold white, and a `==` phrase is `gold-on-dark`. On `light`, headings are black, body text is `ink` or stronger, and a `==` phrase is `gold-ink` (headings only, per AC-4). White and `gold-on-dark` reach at least 4.5:1 against the dotted band's lightest pixel and against the `panel` fill, and those pairs are measured and written into `docs/design.md`.
- **AC-9**: The features band in the `cards` layout (Revit Modeling, `dark`): a centred `h2` with the `heading-rule` hugging the words and its `==` accent; the paragraphs left aligned across the band; a centred `h3` subheading with its own rule and accent; then the cards, one column below `lg` and one row of equal columns at `lg` (`lg:grid-flow-col lg:auto-cols-fr`, literal classes that fit any count, never a class built from the count). Each card on `dark` is a `panel` fill with a 1px white at 10 percent border and `rounded-card` corners; on `light` it is white with a `line` border and `shadow-lg`. Top to bottom and centred: the line icon at 80px (`gold-on-dark` on `dark`, `gold-ink` on `light`), the title as an `h4` in the `text-h3` style, then the points as a bulleted list in the band's body colour, left aligned.
- **AC-10**: The features band in the `split` layout (Scan to BIM `light`, BIM Coordination `dark`): from `lg`, the start side (about five twelfths) holds the `h2` with its rule and accent, left aligned, then the paragraphs; the end side (about seven twelfths) holds the items as tiles, two columns from `md` and one below. Each tile is a `panel` fill with a white at 10 percent border on `dark`, or white with a `line` border on `light`, `rounded-ui`, holding a 40px line icon (colours as AC-9), the title as an `h3`, and its text. Below `lg`, one column, the copy first.
- **AC-11**: The audiences band in the `grid` layout (section 3) is a white `Section` labelled by its `h2`: a centred `h2` with the rule hugging the words and its `==` accent in `gold-ink`, then the intro left aligned. Then the items: one column below `md`, three columns from `md` up (six items read as two rows of three). Each item is centred: its solid icon at 64px filled with `--color-gold` (`fill-gold`, a fill within the gold rule), the title as an `h3`, and its text with its marks.
- **AC-12**: The process band in the `timeline` layout (section 4) sits on its own `surface` (AC-8): a centred `h2` with its rule and optional accent, then `intro` if present. The steps are an `<ol>`. At `lg` they sit in one row of equal columns (`lg:grid-flow-col lg:auto-cols-fr`, as AC-9) joined by a 4px `--color-gold` line running through the centres of the number circles; below `lg` they are a vertical list with the line down the start side through the circles. Each step: a 56px circle filled with `--color-gold` holding its number (position plus one) in bold black, readable by assistive tech, then the title as an `h3` and its text. Under the steps, centred: `cta.heading` as an `h3`, `cta.text`, and a primary `Button` linking to `cta.button.href` with `cta.button.label`. All three demo entries link to `/contact-us`.
- **AC-13**: The presence band in the `map` layout (section 5) is the existing `PresenceBand`, moved to `src/components/ui/`, fed its block's `content`, or `home.presence` when the block has none (AC-22). It sits on a white `Section` with `bg-diagonal`, or on a `tint` `Section` with `bg-diagonal` when the band before it is a `light` `PatternBand`, so two striped bands never run into each other on the same tone. The home page's presence band is unchanged.
- **AC-14**: Demo content. Every entry's intro is `carousel`, audiences `grid`, process `timeline`, and presence `map` with no `content`. Revit Modeling: `features` in `cards` on `dark` (three cards: pre construction, construction, post construction) and `process` on `dark`. Scan to BIM: `features` in `split` on `light` and `process` on `light`. BIM Coordination: `features` in `split` on `dark` and `process` on `dark`. Each entry has two or three Pexels photos, its current photo first, each listed in `src/assets/images/CREDITS.md`, and six audience items. The copy is placeholder text following the references' structure and length, written for BIM Delivery (no other company's name).
- **AC-15**: Motion. On load the intro band's `h1`, then each paragraph, then the carousel fade in and rise 24px through the `entrance` utility (steps 0, 1 to n, then n + 1). The lower bands use the scroll reveal, imported by the route: each band's heading block reveals, then its cards, tiles, items, or steps one after another, then the process band's closing; every ruled heading's rule draws with the scroll direction (`data-heading-rule`). The block directly after the intro also gives each of its reveal units the `entrance` at the steps after the intro's last (spec 0012's rule, generalised), so it moves on a screen where it starts in view at load. That second pairing of `entrance` and the scroll reveal is written down everywhere spec 0012 AC-8 says the rule lives: the `entrance` utility's comment in `global.css`, `docs/design.md` `## Focus and motion`, and spec 0012 itself. No new script, no new dependency, no new kind of effect. With JavaScript off, a failed script, or reduced motion, every band is fully shown and nothing moves.
- **AC-16**: Each service page has one `h1` (the intro) and one `h2` per lower band, with `h3` and `h4` beneath them in order, and each band points at its heading with `aria-labelledby`. Heading ids follow `<type>-heading` (`intro-heading`, `features-heading`, `audiences-heading`, `process-heading`, `presence-heading`), whatever the layout, and a repeated type takes a number from its second use (`features-2-heading`).
- **AC-17**: At 375px, 768px, 1024px, and 1920px wide, each service page has no sideways scroll and no overlapping text, and nothing truncates.
- **AC-18**: The new glyphs are copied into the fixed map in `Icon.astro` from open licence sets on the 24 unit grid (Tabler Icons, MIT, outline or filled; Material Icons, Apache 2.0, filled, where Tabler has no solid match). Each carries a comment naming its set, source glyph, and licence, and `CREDITS.md` gains an icons section. `Icon` gains an optional `strokeWidth` prop (default `2`, ignored by fill glyphs); the section 2 card icons (`FeaturesCards`) use `1.25`, the tile icons (`FeaturesSplit`) `1.5`. A name outside the map is still a type error.
- **AC-19**: The gold rule in `docs/design.md` holds: every gold word on a light surface is `gold-ink`, and a search of `src/` for its forbidden classes finds only the one written exception (the home service card's side bars).
- **AC-20**: `docs/design.md` and the dev `/styleguide` cover `PatternBand` on both surfaces, `bg-dots-dark`, the `panel` token and its contrast pairs, the service band family's `surface` adaptation, the generalised carousel and `CarouselDots`, the new glyphs and `strokeWidth`, `PresenceBand`'s new home, the service pages' motion, and the home services row with one or two cards. `pnpm check`, `pnpm lint`, and `pnpm build` pass.
- **AC-21**: The route names band components in one place: a `bands` map keyed by `<type>/<layout>` (`intro/carousel`, `features/cards`, `features/split`, `audiences/grid`, `process/timeline`, `presence/map`), each pointing at one component in `src/components/service/` named for its key (`IntroCarousel`, `FeaturesCards`, `FeaturesSplit`, `AudiencesGrid`, `ProcessTimeline`, `PresenceMap`). A `type/layout` pair the schema allows with no entry in `bands` or in `BAND_BACKGROUND` (*Feature design*), or an entry the schema does not allow, fails `pnpm check`. Adding a layout and using it in one entry changes that page only: no other entry and no existing band component is edited.
- **AC-22**: A `presence` block with no `content` shows `home.presence`. One with `content` shows that content, on that service's page only; the home page and the other services are unchanged. The heading id, the tone (AC-13), and the motion are the same either way.
- **AC-23**: The home services row shows the services `home.services.featured` lists (one to three service ids, such as `en/revit-modeling`), in list order, and no others. The demo lists the three services in their current `order`, so the home page looks as it does today. With three the row is unchanged; with one or two the cards keep the width they have in a row of three and sit centred, never leaving an empty cell on one side. The build fails, naming `home.yaml` and the id, when an id matches no service, matches a service in another language, or repeats. This replaces spec 0005 AC-4's rule that the collection holds exactly three entries and that the row lists every service by `order`: `HOME_SERVICES_COUNT` and its check leave `content.ts`, and the comment in `index.astro` that relies on it is rewritten.
- **AC-24**: A fourth service is one new YAML file with a unique `slug` and `order`, and no code edit: the build passes, `dist/client/<slug>/index.html` exists, and the service appears in the nav dropdown and the contact form's choices in `order`, but not on the home row until `featured` lists it. Removing a service is deleting its file: while a project's `service` or `home.services.featured` still points at it, the build fails naming each such file; once none does it passes, and the removed URL serves the 404 page.
- **AC-25**: `src/content/README.md` replaces its Markdown services line with the change recipes, in plain steps: edit a service's words or photos; reorder, add, remove, or repeat a section; give one service its own presence; give one service a new look (a new layout); add a new kind of section (a new block type); add a service; remove a service (what fails, what to fix, and that its URL goes to the 404 page); and check any copy that counts the services (the home services intro says "Three core services").

## Decision

**Chosen option**: Option 1: ordered, typed content blocks, each drawn by a named layout, from the one service route.

Each service entry becomes a strict YAML file whose `sections` list is a discriminated union (one schema per `type`, told apart by that field) of five block types. Every block names its `layout`, and the route draws the blocks in order through one map from `type/layout` to band component, inside a `Section` or the new `PatternBand`. The home page lists the services it shows, so a service can be added or removed as content.

**Settled choices** (the engineer's picks and the calls made at write time, reasons in `rationale.md`):

- Ordered blocks in content; demo pages hold intro, features, audiences, process, presence.
- Every block names a `layout`: one per type today, except `features` (`cards`, `split`). A look only one service wants is a new layout; a shared band component changes only when every service using it should change.
- A new background is a new layout: `surface` stays on `features` and `process` only.
- Features: `cards` (the reference) on Revit Modeling `dark`; `split` on Scan to BIM `light` and BIM Coordination `dark`.
- Section 4 (designed here): the process steps joined by a gold line, closing with a contact heading and a Contact us button; it carries the scope's link back to `/contact-us`.
- Presence reads `home.presence`, unless its block carries its own `content`: a complete presence, all or nothing, for that service only.
- The intro stays required, single, and first; a different opening for one service is a new intro layout.
- One YAML file per service; the Markdown body, `image`, `deliverables`, and the top level `process` and `cta` go.
- The home page lists one to three services by reference (`home.services.featured`), replacing spec 0005's exactly three check.
- Removing a service still fails the build while a project or the home list points at it; its old URL serves the 404 page (redirects are a follow up).
- Edits happen in the YAML files (you, with AI); no browser editor in this spec.
- The route's derivations (block key, presence content, heading ids, backgrounds and tones, `entranceFrom`) live in one pure function, `planServicePage` in `src/lib/service-page.ts`.
- The intro carousel behaves like the hero, through the hero's script generalised to `src/scripts/carousel.ts` with `data-carousel-*` hooks; the dots become the shared `CarouselDots` component.
- Audiences: two rows of three on desktop.
- Motion: the existing language only, plus spec 0012's entrance rule for the block after the intro.
- Icons copied from open licence sets into the fixed map; photos are new Pexels links.
- `surface` lives on each block (`features`, `process`); the demo files keep sections 2 and 4 equal, and nothing enforces it.
- New design system pieces: the `--color-panel` token, the `bg-dots-dark` utility, `PatternBand`, `CarouselDots`, and `Icon`'s `strokeWidth`.

**Implementation skills**: `astro` (`astrolicious/agent-skills`, `.agents/skills/astro/`) · `tailwind-4-docs` (`lombiq/tailwind-agent-skills`, `.agents/skills/tailwind-4-docs/`) · `zod` (`pproenca/dot-skills`, `.agents/skills/zod/`) · `motion` (`motiondivision/ai-kit`, `.agents/skills/motion/`)

## Feature design

**Design source**: the engineer's three reference screenshots (section 1: the intro with the carousel; section 2: the dark dotted band with three cards; section 3: the six audiences). Section 2's `split` layout, section 4, and the `light` variants are designed here, to `docs/design.md`. Where a screenshot and an AC disagree, the AC wins: gold words on white are the darker `gold-ink`, the carousel dots are black not gold (a gold dot on white is 2.41:1, under the 3:1 a control's state needs), paragraphs are left aligned not justified, and the audiences sit in two rows of three. Pixel spacing no AC fixes follows the screenshots.

**Page composition** (the demo entries; the route maps any order):

| Order | Block (`type/layout`) | Band | Component (`src/components/service/`) | Motion |
|---|---|---|---|---|
| 1 | `intro/carousel` | white `Section` | `IntroCarousel.astro` (uses `CarouselDots`, `Emphasis`) | load entrance, carousel |
| 2 | `features/cards` or `features/split` | `PatternBand` on its `surface` | `FeaturesCards.astro` or `FeaturesSplit.astro` | scroll reveal, rule draw, entrance (AC-15) |
| 3 | `audiences/grid` | white `Section` | `AudiencesGrid.astro` | scroll reveal, rule draw |
| 4 | `process/timeline` | `PatternBand` on its `surface` | `ProcessTimeline.astro` (uses `Button`) | scroll reveal, rule draw |
| 5 | `presence/map` | white (or `tint`, AC-13) `Section` with `bg-diagonal` | `PresenceMap.astro` (renders `ui/PresenceBand`) | its existing reveal and rule hooks |

Like the home, About, and Contact pages, each band component renders only the inside of its band; the route owns the band wrapper, the tone, and the heading id.

**Component inventory**:

| Component | Status | Change |
|---|---|---|
| `src/pages/[service].astro` | existing stub | calls `planServicePage`, then draws each planned band in order: wraps it by its background (white `Section`, `PatternBand` on its `surface`, or a `bg-diagonal` `Section` in its tone) and renders the component `bands` names for its key; imports `reveal.ts`. The only file that names band components |
| `src/lib/service-page.ts` | new | pure, imports no component: the `Block`, `BlockKey`, and `BlockAt` types, `blockKey(block)`, the `BAND_BACKGROUND` table, and `planServicePage(sections, homePresence)` (see *Route plan*) |
| `PatternBand` (`src/components/ui/`) | new | props `surface: 'dark' \| 'light'`, `labelledBy: string`, `class?`; `dark` renders its own `<section>` (black, `bg-dots-dark`, `focus-contrast`, `bandGutterClass`, `bandPaddingClass`, `bandWidthClass.default`); `light` renders `<Section tone="white" class="bg-diagonal">` |
| `styles.ts` | existing | one `'light' \| 'dark'` surface type shared with the fields, plus class maps keyed by it for the service bands: heading colour, body colour, panel (fill, border, radius), and line icon colour. Complete literal strings in `cx('…')` |
| `IntroCarousel`, `FeaturesCards`, `FeaturesSplit`, `AudiencesGrid`, `ProcessTimeline` (`src/components/service/`) | new | one per `type/layout`, named for it; each takes the same props: `block` (its own narrowed block), `headingId`, and `entranceFrom?: number` (ignored by `IntroCarousel`); the surfaced ones read `block.surface` and only the `styles.ts` maps |
| `PresenceMap` (`src/components/service/`) | new | a thin adapter with the same props: renders `PresenceBand` from `block.content` (already resolved by the plan) and `headingId` |
| `CarouselDots` (`src/components/ui/`) | new | the dots row both carousels share: props `count: number`, `class?`; renders the `data-carousel-controls` container (starting `invisible`) and one `data-carousel-dot` button per photo, the first `aria-current="true"` |
| `src/scripts/hero-carousel.ts` | existing | renamed `src/scripts/carousel.ts`; hooks renamed `data-carousel`, `data-carousel-slide`, `data-carousel-dot`, `data-carousel-controls`, `data-carousel-arrow`, `data-carousel-panel`; arrows and panel stay optional; behaviour unchanged |
| `Hero` (`src/components/home/`) | existing | the new hooks, `CarouselDots` for its dots, imports `carousel.ts`; looks and behaves as before |
| `PresenceBand` | existing, `src/components/home/` | moves to `src/components/ui/`; `index.astro` imports it from there; no other change |
| `Icon` | existing | nine new stroke glyphs, five new fill glyphs, the `strokeWidth` prop (AC-18) |
| `src/content.config.ts` | existing | the services schema below; `presenceContent` extracted from `home.presence` as a shared const both use; `home.services.featured` |
| `src/lib/content.ts` | existing | `checkServiceCount` and `HOME_SERVICES_COUNT` go; `getHomePage` resolves `services.featured` (AC-23); `getServices` stops calling `render` and `Service` loses `Content` |
| `src/pages/index.astro` | existing | the services row maps `home.services.featured` instead of every service, with the class map in *Home row classes*; its "exactly three" comment is rewritten |
| `ServiceCard` (`src/components/home/`) | existing | gains an optional `class` prop merged onto its root, so the home row can place a card; nothing else changes |
| `src/content/README.md` | existing | the change recipes (AC-25) |
| `Section`, `Button`, `Emphasis`, `heading-rule`, `entrance`, `bg-diagonal`, `focus-contrast`, `reveal.ts` | existing | none |
| `CtaBand` | existing, used only by `/styleguide` | none; not used by these pages (see *Consequences*) |

**New tokens and utilities** (`global.css`):

- `--color-panel: #161616`: the fill of a card or tile on a dark band. White on it 18.1:1, `gold-on-dark` 7.5:1.
- `@utility bg-dots-dark`: a `radial-gradient` dot of `--color-white` at 14 percent, about 2px across, on a 12px grid. It sets only `background-image` and `background-size`, laid on `bg-black`. Its lightest pixel is about `#242424`: white 15.5:1, `gold-on-dark` 6.4:1. `/develop` measures the real values and records them in `design.md`. Never on a light tone.

**Data model sketch** (content, validated by Zod at build):

`services` entry, `src/content/services/en/<slug>.yaml`, a `z.strictObject`, loaded with `load('services', 'yaml')`:

| Field | Type | Required | Notes |
|---|---|---|---|
| `lang` | the shared `lang` | yes | unchanged |
| `slug` | kebab case string | yes | unchanged; the route and the id stay `en/<slug>` |
| `title` | `text` | yes | nav, home card, contact choices |
| `summary` | `text` | yes | home card only |
| `order` | positive integer | yes | unchanged; orders the nav and the contact choices |
| `seo` | the shared `seo` | yes | page title and description |
| `subServices` | `text[]`, 3 to 6 | yes | home card only (settles spec 0005's follow up: the service page does not show it) |
| `sections` | `block[]`, min 1 | yes | drawn in order; rules below |

Blocks (each a `z.strictObject` holding `type`, `layout`, and the fields below):

| `type` | `layout` | Fields |
|---|---|---|
| `intro` | `carousel` | `heading: text` (the `h1`) · `paragraphs: emphasisText[]` min 1 · `images: photoSchema[]` 1 to 3 |
| `features` | `cards` | `surface: 'dark' \| 'light'` · `heading: emphasisText` · `paragraphs: emphasisText[]` min 1 · `subheading: emphasisText` · `cards: { icon: lineIcon, title: text, points: text[] min 1 }[]` 2 to 4 |
| `features` | `split` | `surface` · `heading: emphasisText` · `paragraphs: emphasisText[]` min 1 · `items: { icon: lineIcon, title: text, text: emphasisText }[]` 2 to 6 |
| `audiences` | `grid` | `heading: emphasisText` · `intro: emphasisText` · `items: { icon: solidIcon, title: text, text: emphasisText }[]` 1 to 6 |
| `process` | `timeline` | `surface` · `heading: emphasisText` · `intro?: emphasisText` · `steps: titledText[]` 2 to 5 · `cta: callToAction` (`heading`, `text`, `button: link`) |
| `presence` | `map` | `content?: presenceContent` (the `home.presence` shape, strict: `heading`, `paragraphs`, `regions` 1 to 6, `whyChoose`); absent means `home.presence` |

Schema shape: `sections` is `z.discriminatedUnion('type', …)`. A type with one layout is a strict object whose `layout` is a `z.literal`; a type with two or more (`features` today) is itself a `z.discriminatedUnion('layout', …)` of strict objects. When a type gains its second layout, its member changes from the first form to the second, and no YAML changes.

Icon lists, `as const` arrays in `content.config.ts` beside `statIcons`, each name a key of the `Icon` map:

- `lineIcons` (stroke): `blueprint`, `crane`, `building-check`, `scan`, `clipboard-check`, `ruler`, `clash`, `layers`, `messages`.
- `solidIcons` (fill): `user`, `presenter`, `compass`, `hard-hat`, `users` (existing), `users-gear`, `building` (existing).

Icons may repeat within a block, and either list can grow by adding a glyph to the map and its name here.

`sections` nests one discriminated union inside another. Zod 4 supports that, and the installed version is 4.6.5; build step 3 proves it before anything else. If it fails, the `features` member alone becomes a plain `z.union` of its two layouts, and the outer union stays discriminated so an error still names the block.

Rules on `sections` (a `superRefine`, one entry at a time, so it lives in the schema, not `content.ts`): exactly one `intro`, at index 0; at most one `presence`; on a block with `surface: 'light'`, no `==` in `paragraphs`, `items[].text`, or `intro` (the stripe drops `gold-ink` to 4.01:1, which passes only for large text). Each message names the field path and, for marks, quotes the text.

`home` entry change: `home.services` (still strict) gains `featured: z.array(reference('services')).min(1).max(3)` beside `heading`, `intro`, `illustration`, and `cardCue`, and `home.presence` becomes the shared `presenceContent`. The demo `home.yaml` lists `en/revit-modeling`, `en/scan-to-bim`, `en/bim-coordination` in that order (today's `order`).

`getHomePage(lang)` owns every `featured` check itself, the way `resolveProjectService` does for projects, and does not rely on `reference()` to catch a missing id: it loads the services for `lang`, walks `featured` in order, and throws one message naming `home.yaml` (via `fileOf`) and the id when an id matches no service, matches a service whose `lang` differs, or appeared earlier in the list. It returns the home data with `services.featured` replaced by the resolved `readonly Service[]`, in list order (as `getNavigation` expands the services slot). The content gate already calls `getHomePage`, so the checks run on every build.

Removed: the Markdown body, `image` (it becomes `intro.images[0]`), `deliverables` (read by nothing), and the top level `process` and `cta` (they move into the `process` block). `/styleguide` reads the `Card` tile's photo from the first service's `intro.images[0]` and the `CtaBand` tile from its `process` block's `cta`, skipping the tile when that service has no `process` block (the `find` can return `undefined` under strict TypeScript).

Relationships: a project points at one service by id; each service has many projects (unchanged). `home.services.featured` points at one to three distinct services; a service may be listed or not. No service entry refers to another service or to the home page.

**Route plan** (`src/lib/service-page.ts`, pure):

```ts
type Block = Service['sections'][number];
// A generic, so it distributes over the union: one key per real pair.
type KeyOf<B> = B extends { type: infer T extends string; layout: infer L extends string }
  ? `${T}/${L}`
  : never;
export type BlockKey = KeyOf<Block>;
export type BlockAt<K extends BlockKey> = Extract<
  Block,
  { type: K extends `${infer T}/${string}` ? T : never; layout: K extends `${string}/${infer L}` ? L : never }
>;
export const BAND_BACKGROUND = { 'intro/carousel': 'white', /* … */ } as const satisfies Record<
  BlockKey,
  'white' | 'surface' | 'striped'
>;
```

- `planServicePage(sections, homePresence)` returns a new `readonly` array, one entry per block in order: `key`, `block` (for `presence`, a copy whose `content` is the block's own or `homePresence`), `headingId` (AC-16), `background` (`white`; `surface` with the block's `surface`; or `striped` with tone `tint` when the previous planned band is `surface` with `light`, else `white`, AC-13), and `entranceFrom` (the intro's last step plus one, on the block right after the intro only, unless that block is `presence`; AC-15). It never mutates `sections`.
- The route's `bands` map is `satisfies Record<BlockKey, …>`, so a missing or extra key fails `pnpm check` (AC-21). Rendering looks the component up by `key` and passes `{ block, headingId, entranceFrom }` through one widening cast at that single lookup, with a comment saying the key guarantees the block's type.

**Home row classes** (`index.astro`, a map keyed by the featured count, complete literal strings; each card stays a direct child of the `data-reveal-stagger` grid):

| Count | Grid | Card classes |
|---|---|---|
| 3 | `grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-16` (today's) | none |
| 2 | `grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-6 lg:gap-16` | every card `lg:col-span-2`; the first also `lg:col-start-2` |
| 1 | `grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-6 lg:gap-16` | `md:col-span-2 md:col-start-2 lg:col-span-2 lg:col-start-3` |

A card spanning two of six columns is exactly as wide as one of three with the same gap (`(W - 2g) / 3` either way), and the start column centres the set; at `md`, one card spans two of four columns, the width it has in the two column row.

**State transitions**: the carousel's current photo is its only state: `0` on load, then the next (wrapping) every 6s unless held (pointer over it, focus inside it, or reduced motion), or the pressed dot's index. Nothing else has state.

**API surface**: none. The pages are prerendered (spec 0001), add no endpoint, and call nothing at runtime.

**Value sourcing**:

| Action | Value produced / displayed | Source |
|---|---|---|
| Build `/<slug>` | route, page title, description | `slug`, `seo.title`, `seo.description` |
| | which bands, in what order | `sections[]` order |
| | band component per block | `type` and `layout`, through the route's `bands` map |
| | band background | `BAND_BACKGROUND` by key; `surface` blocks use their own `surface`; presence tone from the previous planned band (AC-13) |
| | heading ids | derived in `planServicePage`: `type` plus a count of earlier blocks of that type |
| | intro `h1`, paragraphs, photos, alt | `intro.heading`, `.paragraphs`, `.images[].src`, `.alt` |
| | photo width and height | read at build from each link (`inferRemoteSize`, as `Hero`) |
| | generated widths, `sizes` | fixed in `IntroCarousel`: 480, 800, 1200; `(min-width: 1024px) 32vw, 100vw` (AC-6) |
| | dot labels "Show photo N of M" | the same fixed English string the hero uses (see *Follow-up*) |
| | features headings, paragraphs | `heading`, `subheading`, `paragraphs` |
| | card and tile icons, titles, points, text | `cards[]` / `items[]` fields |
| | icon colour, panel look | `surface` through the `styles.ts` maps |
| | audience heading, intro, items | the `audiences` block |
| | step numbers | derived: position plus one |
| | step titles and texts | `steps[].title`, `.text` |
| | closing heading, text, button label and link | `process.cta.heading`, `.text`, `.button.label`, `.button.href` |
| | presence heading, copy, regions, list | the block's `content`, else `home.presence` (via `getHomePage(lang)`), resolved in `planServicePage` |
| | colour of a `==` phrase | `Emphasis` `surface`, set by each band from its `surface` (white bands pass `light`) |
| | entrance steps | intro: heading 0, paragraphs 1 to n, carousel n + 1; the next block from n + 2 (`entranceFrom`) |
| Build `/` (home) | which service cards, in what order | `home.services.featured`, list order, resolved by `getHomePage` |
| | the row's grid and card classes | *Home row classes*, keyed by the featured count (1, 2, 3) |
| Build every page | nav dropdown items, contact choices | every service entry for the language, by `order` (specs 0004, 0011; unchanged) |
| A removed service's URL | the page served | the existing 404 page (spec 0004) |
| Build failure | the file and id named | the referring entry's file (`fileOf`) and the missing, foreign, or repeated id |
| Scroll reveal and rules | what moves, in what order | `data-reveal`, `data-reveal-stagger`, `data-heading-rule` in each band's markup |
| Carousel | photo shown, timing | `carousel.ts` state; 6s and 1s constants already in the script |

**Motion** (all of it existing language):

- Intro: `entrance` with `--entrance-step` set by `IntroCarousel`; no `data-reveal`.
- Features, audiences, process: the heading block (heading, subheading, paragraphs or intro) carries `data-reveal`; the cards grid, tiles grid, items grid, and steps `<ol>` carry `data-reveal-stagger`; the process closing carries `data-reveal`; every ruled heading carries `heading-rule` and `data-heading-rule`.
- With `entranceFrom` set, each of those reveal units (a `data-reveal` element or a direct child of a `data-reveal-stagger`) also takes `entrance` with steps counting up from it, as spec 0012 does for the About capability band. Only the block right after the intro gets it. A `presence` block in that place takes none.

**Key invariants**:

- No visible copy in the route, the plan, or the band components (AC-5); every block reads only fields its schema names.
- Exactly one `h1` per service page, because exactly one `intro` block, first.
- Band components are named in one place, the route's `bands` map. It and `BAND_BACKGROUND` cover every schema `type/layout` pair and nothing else, checked by `pnpm check`.
- A look only one service wants is a new layout. An existing band component changes only when every service using it should change.
- No service's page reads another service's file. The only inputs shared across services are `home.presence` (unless overridden) and the design system.
- Nothing counts the service files. The home row shows only what `featured` lists; the nav and contact choices show every service.
- Text on a `dark` band is white or `gold-on-dark`; on a `light` band, `ink` or stronger, with `==` in headings only.
- No CSS rule hides content waiting for a script; with no JavaScript every band, photo one, and every rule are shown.
- No new script: the site ships what it ships today, with `carousel.ts` in place of `hero-carousel.ts` (`nav.ts`, `counters.ts`, `carousel.ts`, `reveal.ts`, and the home only `typewriter.ts` from spec 0009).
- No forbidden gold class in `src/` beyond the written exception (AC-19).
- Tailwind classes are complete literal strings; no class is built from fragments of `surface`, `type`, `layout`, or a list's length.

**Security model**: public, prerendered pages. No visitor input, no personal data, no runtime request, no authentication. Content and photos are read at build only; the photo host is limited to `images.pexels.com` by the schema. Icon paths are copied under their licences and credited. No compliance scope applies.

**Configuration required**: none.

**Critical test scenarios**:

- Happy path: open each service page at 1920x1080; five bands in order, the intro fades and rises in, the carousel crossfades, scroll down and each band reveals with its rules drawing, the Contact us button goes to `/contact-us`, verifies **AC-1**, **AC-2**, **AC-6**, **AC-7**, **AC-9** to **AC-13**, **AC-15**.
- Variation: Revit Modeling shows cards on dark dots, Scan to BIM a split on white stripes with its process on stripes and presence on `tint`, BIM Coordination a split on dark dots, verifies **AC-8**, **AC-13**, **AC-14**.
- Reorder: move `audiences` above `features` in one YAML file; the page follows with no code edit and the ids and tones still hold, verifies **AC-2**, **AC-16**.
- Build failures: add `image:` back at the top level; put `presence` first; add a second `intro`; drop a block's `layout`; write `layout: slider` on an audiences block; use `icon: crane` on an audience; give a presence `content` with no `regions`; write `==phrase==` in a light block's paragraph. Each build fails naming the file and field, verifies **AC-3**, **AC-4**.
- Restyle one service: add a throwaway `audiences/list` layout to the schema only; `pnpm check` fails naming the missing key in `bands` and `BAND_BACKGROUND`; add a component and both entries and use it in Scan to BIM only; only `/scan-to-bim` changes, and no other file under `src/content/services/` or existing band component shows a diff; revert, verifies **AC-21**.
- Presence override: give BIM Coordination's presence block a `content`; only that page shows it, the home page and the other two are unchanged; remove it and the shared copy returns, verifies **AC-22**.
- Home row: list two services, then one, in `featured`; the cards sit centred at their row of three width with no empty cell, at 768px and 1280px; list an unknown id, then a repeated one; each build fails naming `home.yaml` and the id; restore the three. The other language clause cannot be driven while the site has one language: confirm it by reading `getHomePage`, and drill it when a second language lands, verifies **AC-23**.
- Add a service: copy `revit-modeling.yaml` to a new slug with a new `order`; the build passes, its page exists, and it appears in the nav and the contact choices but not on the home row; delete it, verifies **AC-24**.
- Remove a service: move `scan-to-bim.yaml` aside; the build fails naming `corner-block.yaml`, `midtown-retrofit.yaml` (the existing projects that point at it), and `home.yaml`; point them elsewhere and it passes, and `/scan-to-bim` serves the 404 page; restore everything, verifies **AC-24**.
- No flash: at 1920x1080, where the features heading starts on screen, it moves only by the load entrance, and is never shown, hidden, then revealed; at 375x812 it reveals on scroll, verifies **AC-15**.
- No JavaScript and reduced motion: every band is shown, the first photo only and no dots with JavaScript off, no autoplay and no movement with reduced motion, the dots still work, verifies **AC-7**, **AC-15**.
- Regression: the home hero still crossfades with arrows and dots, and the home presence band is unchanged, verifies **AC-7**, **AC-13**.
- Phone at 375px: one column everywhere, the carousel under the copy, the steps vertical, no sideways scroll, verifies **AC-6**, **AC-12**, **AC-17**.

## Build plan

Skateboard: first all three pages stand up whole with no motion, then the motion, then services come and go, then the write up and gates.

**Milestone 1: the whole pages, still**

1. [x] Add the `strokeWidth` prop to `Icon` and copy in the fourteen new glyphs with their source comments; add the icons section to `CREDITS.md`, satisfies **AC-18**.
2. [x] Add `--color-panel` and `bg-dots-dark` to `global.css`, the surface class maps to `styles.ts`, and `PatternBand`, satisfies **AC-8**.
3. [x] Prove the nested discriminated union in the installed Zod with one bad entry per AC-4 rule (fallback in *Data model sketch*), then write the strict services schema (every block with its `layout`, the icon lists, the presence `content`, and the `sections` rules), extract `presenceContent` and point `home.presence` at it, switch the loader to YAML, write the three YAML entries with the placeholder copy, Pexels photos, and credits, delete the `.md` files, drop `render` from `getServices`, and point `/styleguide`'s `Card` and `CtaBand` tiles at the new fields, satisfies **AC-3**, **AC-4**, **AC-14**.
4. [x] Rename `hero-carousel.ts` to `carousel.ts` with the `data-carousel-*` hooks, add `CarouselDots`, and move `Hero` onto both; confirm the hero is unchanged, satisfies **AC-7**.
5. [x] Move `PresenceBand` to `src/components/ui/` and update `index.astro`, satisfies **AC-13**.
6. [x] Build `IntroCarousel`, `FeaturesCards`, `FeaturesSplit`, `AudiencesGrid`, `ProcessTimeline`, and the `PresenceMap` adapter, all on the shared props, satisfies **AC-6**, **AC-9** to **AC-13**.
7. [x] Write `src/lib/service-page.ts` (the key types, `BAND_BACKGROUND`, `planServicePage`) and rewrite `[service].astro` around the `bands` map, satisfies **AC-1**, **AC-2**, **AC-5**, **AC-13**, **AC-16**, **AC-21**, **AC-22**.
8. [x] Preview all three pages at 375, 768, 1024, and 1920 against the screenshots; run the reorder, the build failures, the restyle, and the presence override drills, satisfies **AC-2**, **AC-4**, **AC-17**, **AC-21**, **AC-22**.

**Milestone 2: the pages move**

9. [ ] Add the `entrance` steps to `IntroCarousel`; the reveal and rule hooks to the lower bands; `entranceFrom` from the plan on the block after the intro; import `reveal.ts` in the route, satisfies **AC-15**.
10. [ ] Check in the browser with JavaScript off and with reduced motion on, on a 1920x1080 and a 375x812 screen, satisfies **AC-7**, **AC-15**.

**Milestone 3: services come and go**

11. [ ] Add `home.services.featured` to the schema and `home.yaml` (the three services in today's order); have `getHomePage` resolve and check it; remove `checkServiceCount` and `HOME_SERVICES_COUNT`; add `ServiceCard`'s `class` prop; point the home row at `featured` with the *Home row classes* map and rewrite its comment, satisfies **AC-23**.
12. [ ] Rewrite the services lines of `src/content/README.md` into the change recipes, satisfies **AC-25**.
13. [ ] Preview the home row with one and two services listed, and run the add a service and remove a service drills, satisfies **AC-23**, **AC-24**.

**Milestone 4: written down and gated**

14. [ ] Update `docs/design.md` (`PatternBand`, `bg-dots-dark`, `panel` and the measured pairs, the service bands' `surface`, `CarouselDots` and the carousel, the glyphs and `strokeWidth`, `PresenceBand`'s home, the service pages' motion, the entrance rule's second user, the scripts list for the rename, the home services row with one or two cards), rewrite the `entrance` utility's comment in `global.css` to name both pairings, and add `/styleguide` tiles for `PatternBand` on both surfaces and the new glyphs, satisfies **AC-20**.
15. [ ] Search `src/` for the forbidden gold classes, run `pnpm check`, `pnpm lint`, and `pnpm build`, and confirm the three `dist/client/<slug>/index.html` files, satisfies **AC-1**, **AC-19**, **AC-20**.

## Consequences

**Positive**:

- One service's page can diverge (order, sections, look, presence copy) with nothing else changing: a data edit, or one new layout that is purely additive.
- A new layout or block type is a schema member, a component, and two map entries; the type checker lists every place that must know about it.
- Adding or removing a whole service is a content edit; the nav, contact choices, and page follow, and the build names every file that still points at a removed one.
- The dark dotted `PatternBand` and the shared carousel are design system pieces any later page can use.
- No new script and no new dependency; the carousel script now serves two places instead of one.

**Negative / tradeoffs**:

- Every block writes a `layout` line, even where its type has only one layout today.
- The service YAML files are deep and long (every section's copy in one file), and a block's rules live in a union schema that is harder to read than a flat one.
- The layout rule (a look for one service is a new layout) is a convention; the build cannot stop someone editing a shared band for one service.
- A new service does not reach the home page until someone lists it; that is deliberate, but easy to forget.
- A presence override copies the regions into that service's file, so a company wide region change then needs that file edited too.
- A removed service's URL returns the 404 page until redirects exist.
- This spec now touches the home page (feature 6) and replaces spec 0005 AC-4's count rule, a finished feature changed for a reason outside it; so does the hero's script rename.
- Sections 2 and 4 sharing a background is a habit of the content, not a rule the build checks; an editor can set only one.
- The intro carousel carries the hero's WCAG 2.2.2 gap (no pause button) to three more pages.
- Gold words on white read darker than the reference (`gold-ink`), and the dots are black rather than gold.
- `CtaBand`, kept by spec 0005 for these pages, is not used by them; the contact close lives inside the process band.
- Fourteen copied glyphs grow `Icon.astro` and its licence notes.

**Neutral**:

- A new layout or block type is a data model change: record it in this spec's block table with `/architect service pages` (a quick in place update), then build it with `/develop`.
- Spec 0002's services row is replaced by this spec's data model, as spec 0011 did for contact.
- The service pages add a second user to spec 0012's "entrance plus scroll reveal" rule, so it becomes a rule rather than a one off.

## Follow-up

- [ ] Add a pause control to the shared carousel (hero and service intros) to close the WCAG 2.2.2 gap.
- [ ] Move the carousel's fixed English labels ("Show photo N of M", the arrow names) into content before a second language lands.
- [ ] Decide `CtaBand`'s future (a block type for the service pages, or delete it) when the client's layouts arrive.
- [ ] Redirect a removed service's old URL (and any other removed page) once the site is live; decide the mechanism with the SEO foundation (feature 11) or launch (feature 14).
- [ ] `/sync`: note spec 0002's services row is replaced; note spec 0005 AC-4's count rule is replaced by this spec's AC-23 and the scope's Deferred "Services overview page and more services" item now needs only the overview page; add the layout rule (a look for one service is a new layout) to a nested `src/components/service/AGENTS.md`; update `src/scripts/AGENTS.md` for `carousel.ts`; note spec 0005's follow up on `subServices` is settled (home only); note `PresenceBand` now lives in `src/components/ui/`; `docs/design.md`'s "exactly four scripts" invariant omits `typewriter.ts` (spec 0009), a drift that predates this spec.
- [ ] Replace the placeholder copy and photos with the client's real content and 3D renders before launch.

## Rationale

Reasoning and options: see [rationale.md](rationale.md).
