# 0005. Compose the home page from content as six bands with one counter script

**Date**: 2026-09-21 (six section page ratified, folding in the assumed specs 0007 and 0008; hero revised to the reference overlay earlier the same day; first written 2026-09-20)
**Status**: In Progress
**Scope feature**: 6, Home page (`docs/scope/scope.md`)

## Summary

The home page is six bands, in this order: a full screen photo hero, a black intro band with the company's numbers as white cards, a company overview, three service cards, a global presence band with a dotted world map, and a showcase of three projects. Every word, number, and photo comes from content (`home.yaml`, the `stats` entry, the `services` and `projects` entries), never from a component.

This revision ratifies what was built quickly for the demo. The presence band (spec 0007) and the project showcase (spec 0008) were recorded as assumptions; they are now deliberated and folded in here, and both of those specs are superseded by this one. The black intro band, built with no spec at all, is written down too. Five small changes come out of the review: the blinking caret goes (it never stopped), the band's content key is renamed from `whyChooseUs` to `intro` (it holds an intro, not the reasons list), the map allows at most six regions, the showcase falls back to an equal grid with fewer than three projects, and the showcase photos stop zooming on hover (they are not links yet).

The page ships one small script, the counter that animates the numbers once when they scroll into view. The finished numbers are already in the HTML, so with no JavaScript, or with reduced motion asked for, the visitor sees the final figures. No React is hydrated on the page.

## Requirements

**User stories**:

- As a prospective client landing on the site for the first time, I want to see what this company does, what it has delivered, and how to start a conversation, without scrolling through a wall of text.
- As a visitor on a phone on a slow connection, I want the page readable immediately and not jumping around as images arrive.
- As someone editing the site, I want to change any headline, paragraph, number, region, or photo by editing a content file, never a component.
- As a keyboard or screen reader user, I want the page to read in a sensible heading order and every meaningful image to carry a real description, with decoration kept out of my way.
- As a first time visitor, I want the opening screen to be one strong photo with the offer readable on top of it and one obvious next step.
- As a prospective client, I want to see where the company works and a few real projects before I decide to get in touch.

**Acceptance criteria**:

- **AC-1** (revised 2026-09-21, six sections): The page renders exactly six sections in this order: hero, intro, company overview, services, global presence, project showcase (the showcase only when AC-28 allows). The reference site's "Delivering Precision BIM & Revit Modeling" section is absent, and so are a separate stats band, a differentiators section, a certification section, and a closing call to action band. The footer follows the showcase directly.
- **AC-2**: Every headline, paragraph, list item, number, label, button word, region name, and image on the page comes from a content entry. `src/pages/index.astro` and every component it uses contain no visible copy of their own.
- **AC-3** (revised 2026-09-21): The hero is a full bleed band at least the small viewport height (`min-h-svh`), growing taller whenever its content needs more room, so on a short landscape phone nothing overflows or overlaps. The photo fills the whole band, cropped to cover and centred. Centred on it, at the content width (`max-w-content`, full width minus the gutters on a phone), sits one `bg-scrim` panel holding the page's only `h1` and the subheading in `text-lead`, both white and centred. Under the panel sits one primary `Button` from `home.hero.primaryCta`, and at the bottom of the band the three dots of AC-20. Panel, button, and dots stack in that order at every breakpoint and never overlap one another.
- **AC-4** (heading revised 2026-09-21): The services section is a `tint` `Section` with a centred `h2` carrying the gold rule (AC-32) and a centred `text-lead` intro, both from `home.services`. It renders one `Card` per `services` entry for the page's language, ordered by `order`, each `elevated` and `align="center"`, showing the entry's image, title, and summary, and linking to `/{slug}`, the same path `[service].astro` builds. When the collection does not hold exactly three entries for a language, the build fails with a message naming the collection, the language, and the count found.
- **AC-5** (revised 2026-09-21, numbers as cards): The intro band renders one white card per `stats` entry item, inside one `<dl>`: a decorative icon from the item's `icon` (hidden from assistive tech), then the number grouped for the entry's language (so `1200` reads as `1,200`) with its suffix when it has one, then its label. The label is the `<dt>` and the number the `<dd>`, shown number first. The grid is two columns below `lg` and four at `lg`. The finished numbers are present in the built HTML.
- **AC-6**: The numbers count up once, the first time the cards enter the viewport, and never again. With JavaScript unavailable, or with `prefers-reduced-motion: reduce` set, no animation runs and the finished numbers are what the visitor sees.
- **AC-7** (revised 2026-09-21): The overview renders through the shared `MediaText` component inside a `white` `Section`, with the photo on the end side. `MediaText` keeps its optional image and single column fallback, because About reuses it.
- **AC-8** (revised 2026-09-21, the intro band): The intro band is its own black band, not a `Section` tone, framed by the shared band classes (AC-23) and carrying `focus-contrast`. Its `h2` is white and centred, with `home.intro.headingHighlight` in `gold-on-dark` after `home.intro.heading`, and the gold rule under it. The first paragraph opens with `home.intro.lead.highlight` in semibold `gold-on-dark`, then `lead.text`; any further `paragraphs` follow in white. Nothing on the band animates except the counter of AC-6: there is no caret and no blinking element.
- **AC-9** (revised 2026-09-21, replaces the certification row): The certification row is not on the home page. The footer carries the certification badges (`settings.footer.certification`), so the page loses nothing.
- **AC-10** (revised 2026-09-21): The gold `CtaBand` is not on the home page. It stays in `src/components/ui/` for the service pages (feature 8), and its `/styleguide` tile is fed the first service's `cta`. `Section` still offers exactly two tones and `Button` exactly two variants; neither gains a prop for any band on this page.
- **AC-11** (revised 2026-09-21): The page has exactly one `h1`. Each of the six sections carries its own `h2` and points at it with `aria-labelledby`, using one naming rule: the heading's id is `<section>-heading`. The six ids are `hero-heading`, `intro-heading`, `overview-heading`, `services-heading`, `presence-heading`, and `project-showcase-heading`. Titles inside a section (service cards, the presence band's why choose heading, showcase tiles) are `h3`.
- **AC-12** (revised 2026-09-21): The hero photo loads eagerly with a high fetch priority, `sizes="100vw"`, and the width steps of the hero's own width rule (spec 0006 now decides where the photo comes from and how its width is read). Every other photo on the page loads lazily and reserves its space: `MediaText` and `Card` by aspect ratio, showcase tiles by filling a tile whose height is set by the grid, so nothing moves as images arrive. The world map is an inline SVG with a fixed `viewBox`, so it reserves its own space. Every image either carries alt text or is marked decorative.
- **AC-13**: The page renders correctly at mobile, `md`, and `lg` with no sideways scrolling at any width, and every tap target stays at least 44px.
- **AC-14**: The only JavaScript the page loads is the existing nav bundle plus the counter module. No `astro-island` appears in the built HTML.
- **AC-15**: The page's title and description come from `home.seo` and reach the document through `PageLayout`.
- **AC-16** (revised 2026-09-21): The three shared components spec 0005 promoted, `StatsBand`, `MediaText`, and `CtaBand`, keep their `docs/design.md` entries under `## Components` and their `/styleguide` tiles, even though only `MediaText` appears on the home page today. `StatsBand` stays for About (feature 7), which decides then between it and the intro band's cards.
- **AC-17**: `pnpm check`, `pnpm lint`, and `pnpm build` all run clean, and `dist/client/` still holds exactly one HTML file per route and nothing more.
- **AC-18** (revised 2026-09-21): The site has two focus rules and no exceptions. On the two light tones, the sitewide 2px `gold-ink` outline at a 2px offset. On every surface that is not a light tone (on this page the hero photo and the black intro band; elsewhere the gold `CtaBand`), a two colour ring: a 2px black band directly around the control and a 2px white band outside it, from the one `focus-contrast` utility in `global.css` placed on the band's `<section>`. The presence band (white under a stripe) and the showcase band (tint) are light tones and keep `gold-ink`. Mouse clicks still show nothing.
- **AC-19**: White text on the scrim reaches at least 4.5:1 over any photo pixel. The scrim is the token `--color-scrim`, black at 60 percent. Its worst case is white text over a pure white pixel seen through the scrim, a composite of about `#666666`, which measures 5.74:1, so no photo swap can lower the ratio. The hero's own background is black, so a photo that fails to load leaves white copy on a dark band. The showcase captions (AC-29) rely on the same guarantee.
- **AC-20**: The three hero dots are decoration. They are three plain elements inside one `aria-hidden="true"` wrapper: not buttons, not links, not focusable, default cursor. The first is solid white, the other two white at half opacity. Tabbing through the hero reaches the button and nothing else.
- **AC-21**: The home hero starts at the very top of the page, behind the header card. It pulls itself up by `--header-h` and pads its content down by the same amount, so the panel centres in the visible area below the card and no copy, button, or dot sits under the header at load. Only the home hero does this. On a phone with JavaScript off, the open mobile menu pushes the hero below it; the matching padding means nothing is hidden.
- **AC-22**: The `home` hero schema is a `z.strictObject` of `{ heading, subheading, image, primaryCta }`, so an entry carrying `secondaryCta`, or any other unknown hero key, fails the build naming the key. `Hero.astro` takes no `secondaryCta` prop.
- **AC-23**: `Section`, `CtaBand`, the hero, and the intro band take their side gutters, vertical rhythm, and content widths from the shared class strings in `src/components/ui/styles.ts` (`bandGutterClass`, `bandPaddingClass`, `bandWidthClass`), so those values are written once.
- **AC-24** (extended 2026-09-21): `docs/design.md` records the scrim token and its contrast pair, the two focus rules, and the shared band frame (as before), plus: the intro band under its new name, the `bg-diagonal` rule of AC-25 with its worst case pair, and no mention of a caret. `/styleguide` shows the double ring on a photo swatch and on the gold band.
- **AC-25** (added 2026-09-21, the presence band surface): The presence band is a `white` `Section` carrying the `bg-diagonal` utility: thin 45 degree stripes in `--color-line` over white. Text on it is `ink` or stronger. The worst case pair, `ink` (`#666666`) over a stripe line (`#e5e5e5`), measures 4.56:1; `ink-muted` would measure 3.93:1 and is never used for text on this band.
- **AC-26** (added 2026-09-21, the presence layout and map): The band opens with a centred `h2` carrying the gold rule. Below `lg` the copy comes first and the map second; at `lg` they sit side by side on a 12 column grid, the map on the start side (7 columns) and the copy on the end side (5 columns), with the copy still first in the markup. The map is `src/assets/images/home/world-map.svg`, a fixed, checked in dotted map in an equirectangular projection bounded at latitude 84 north and 56 south, rendered with `aria-hidden="true"`. `home.presence.regions` holds 1 to 6 regions, each `{ name, lon, lat }` with `lon` from -180 to 180 and `lat` from -56 to 84; a seventh region, or a coordinate off the map, fails the build naming the field. The regions render as one `<ul>`: each `<li>` holds a decorative gold dot placed at its projected position on the map, and its name. From `md` up the name floats above its dot; below `md` the names flow as a centred, wrapping row under the map while the dots stay on it. With the shipped regions, no two names overlap at 768px or 1280px.
- **AC-27** (added 2026-09-21, the presence copy): `home.presence.paragraphs` are left aligned (never justified), and a phrase wrapped in `**` renders as `<strong>` in `ink-strong`. A paragraph with an unbalanced `**` fails the build naming the file and field. Under the copy, `home.presence.whyChoose.heading` renders as an `h3` with the gold rule, then `whyChoose.items` as a `<ul>`, each item led by the decorative `check` icon in `gold-ink`.
- **AC-28** (added 2026-09-21, which projects): The showcase shows the first three entries of `getProjects(lang)`, which is already sorted by `order`, so an editor reorders it by editing `order`. With no projects for the language, the whole section is absent (no empty band, no dangling heading) and the build still passes.
- **AC-29** (added 2026-09-21, the showcase layout): The band is a `tint` `Section` with a centred `h2` carrying the gold rule and a centred `text-lead` intro from `home.projectShowcase`. The tiles depend on the count. With three: one column on a phone; two at `md`, the first tile spanning both columns; at `lg` two columns and two rows, the first tile spanning both rows on the start side. With one or two: an equal grid, one tile at full content width, or two side by side from `md`, never an empty cell and never a lone tile at half width. Each tile is its photo, cropped to cover and filling the tile, under a `bg-scrim` caption holding the project's service title (small, uppercase), its title as an `h3`, and its summary, all white. A tile is at least 18rem tall and grows with its caption, so no text is clipped.
- **AC-30** (added 2026-09-21, the showcase interaction): The tiles are not links and hold no focusable element, and the photo does not move on hover. The only link is one centred secondary `Button` below the grid, its words and path from `home.projectShowcase.link`. The band keeps the light tone `gold-ink` ring.
- **AC-31** (added 2026-09-21, the rename): The intro band's content key is `intro` in `src/content.config.ts` and `src/content/home/en/home.yaml` (a `z.strictObject` of `{ heading, headingHighlight, lead: { highlight, text }, paragraphs }`), the component is `src/components/home/IntroBand.astro`, and the heading id is `intro-heading`. No `whyChooseUs` key, prop, file, or id remains in `src/`.
- **AC-32** (added 2026-09-21, one heading treatment): The centred section headings with a gold rule (services, presence, its why choose `h3`, the showcase, and the intro band) draw the rule with `after:` on the heading itself, exactly as wide as the words and invisible to a screen reader.

## Decision

**Chosen option**: Option 1: content driven Astro composition, split by reuse, with one plain counter script (unchanged). The 2026-09-21 ratification keeps the six section page as built and fixes it in place.

The page is composed in `src/pages/index.astro`, which owns every band's tone and every heading id. Two bands that are not light tones (the hero and the intro band) are their own components sharing `Section`'s frame through class strings; the three bands only this page wants (`IntroBand`, `PresenceBand`, `ProjectShowcase`) live in `src/components/home/` and render inside the frame the page gives them.

**Ratified 2026-09-21**: the presence band of spec 0007 and the project showcase of spec 0008, both now superseded by this spec, with five changes: no caret, `whyChooseUs` renamed `intro`, at most six regions, an equal grid under three projects, and no hover zoom on tiles that are not links. The hero's photo source and its white, centred subject stay with spec 0006, still assumed.

**Implementation skills**: `astro` (`astrolicious/agent-skills`, `.agents/skills/astro/`) · `tailwind-4-docs` (`lombiq/tailwind-agent-skills`, `.agents/skills/tailwind-4-docs/`) · `zod` (`pproenca/dot-skills`, `.agents/skills/zod/`)

## Feature design

**Design source**: the reference screenshots the engineer supplied during the build (the full bleed hero, the black band with stat cards, the presence band with a map and a diagonal pattern). Tokens, type, and components come from `docs/design.md`. The showcase has no reference; it follows the services and presence heading treatment and the hero's scrim.

**Data model sketch** (the `home` entry, confirmed 2026-09-21; nothing here needs a data migration beyond renaming one key in one YAML file):

| Collection · key | Shape | Status |
|---|---|---|
| `home.hero` | strict: `heading`, `subheading`, `image` (a photo, spec 0006), `primaryCta: link` | unchanged |
| `home.intro` | strict: `heading`, `headingHighlight`, `lead: { highlight, text }`, `paragraphs: string[]` | renamed from `whyChooseUs` |
| `home.overview` | `heading`, `paragraphs: string[] min 1`, `image` | unchanged |
| `home.services` | `heading`, `intro` | unchanged |
| `home.presence` | strict: `heading`, `paragraphs` (min 1, balanced `**`), `regions: [{ name, lon, lat }]` min 1 max 6, `whyChoose: { heading, items: string[] min 1 }` | from spec 0007, plus `max(6)` |
| `home.projectShowcase` | strict: `heading`, `intro`, `link` | from spec 0008 |
| `home.stats`, `differentiators`, `certification`, `cta` | none | removed |
| `stats.items[]` | `value`, optional `suffix`, `label`, `icon` | `icon` added for the cards |
| `projects` | read only: `title`, `summary`, `image`, `service` (resolved to its title), `order` | unchanged |

**Component inventory**:

| Component | Used here for | Reused by | Why it sits where it does |
|---|---|---|---|
| `src/components/home/Hero.astro` | hero | none | Every other page opens differently |
| `src/components/home/IntroBand.astro` (renamed from `WhyChooseUs.astro`) | the black intro band and its stat cards | none yet | Its black surface and card treatment are specific to this page. About decides at build time whether to reuse it or `StatsBand` |
| `src/components/ui/MediaText.astro` | overview | About (feature 7) | Shared split of copy and photo |
| `Card` (`elevated`, `align="center"`) | services | project and service pages | The two props exist already |
| `src/components/home/PresenceBand.astro` | global presence | none | Map, region projection, and emphasis are specific to this band |
| `src/lib/emphasis.ts` | presence paragraphs | the footer (`settings.footer`) | Pure `splitEmphasis` and `hasBalancedEmphasis`, one mark only (`**`) |
| `bg-diagonal` utility in `global.css` | presence surface | any light band later | A background image only, so tone, text colours, and focus are unchanged |
| `check` in `Icon.astro` | the why choose list | anywhere | A decorative glyph |
| `src/components/home/ProjectShowcase.astro` | project showcase | none | Renders the tiles it is given; never reads a collection |
| `src/components/ui/StatsBand.astro`, `CtaBand.astro` | not on this page | About, service pages | Kept per AC-16 and AC-10 |
| `src/scripts/counters.ts` | the intro band's numbers | wherever `data-stats-band` appears | Counts every `data-stats-band` on the page |

**Page composition** (the page owns tone; no component reads one):

| # | Section | Tone or surface | Component | Content |
|---|---|---|---|---|
| 1 | Hero | photo under a scrim, its own band | `Hero` | `home.hero` |
| 2 | Intro | black, its own band | `IntroBand` | `home.intro` plus `getStats(lang)` |
| 3 | Company overview | `white` | `MediaText`, `imageSide="end"` | `home.overview` |
| 4 | Services | `tint` | three `Card`s | `home.services` plus `getServices(lang)` |
| 5 | Global presence | `white` plus `bg-diagonal` | `PresenceBand` | `home.presence` |
| 6 | Project showcase | `tint` | `ProjectShowcase` | `home.projectShowcase` plus the first three of `getProjects(lang)` |

**API surface**: none. Every page route is prerendered (spec 0001); this page adds no endpoint and calls nothing at runtime.

**Value sourcing** (rows for the hero are unchanged from the first revision and kept brief here):

| Action | Value produced or displayed | Source |
|---|---|---|
| Any getter call | the language | `resolveLocale(Astro.currentLocale)` |
| Render head | title, description | `home.seo`, passed to `PageLayout` |
| Render hero | heading, subheading, photo, alt, button | `home.hero` |
| Render hero | loading, priority, `sizes`, widths, crop, scrim, height, header overlap, dots | decided in this spec's hero revision (AC-3, AC-12, AC-19 to AC-21); the photo's source and how its width is read are spec 0006 |
| Render intro | heading, highlighted words, lead highlight, lead text, paragraphs | `home.intro` |
| Render intro | each card's icon, number, suffix, label | `getStats(lang)`, the `stats` entry for the same language |
| Render intro | the displayed number text | `Intl.NumberFormat(lang).format(value)`, computed at build |
| Counter script | the number to count to, the locale while counting | `data-count-to` on each number, `data-locale` on the `<dl>`, written by `IntroBand` |
| Counter script | duration, easing, threshold | decided in this spec: 1200ms, ease out, 25 percent visible |
| Render intro | the card grid columns | decided in this spec: 2 below `lg`, 4 at `lg` (AC-5) |
| Render overview | heading, paragraphs, photo | `home.overview` |
| Render services | heading, intro | `home.services` |
| Render services | each card's image, alt, title, summary, path | `getServices(lang)`: `image.alt ?? ''`, `/${slug}` |
| Render presence | heading, paragraphs, bold phrases | `home.presence.paragraphs`, split by `splitEmphasis` |
| Render presence | each region's name | `home.presence.regions[].name` |
| Render presence | each dot's position over the map | derived: `toMapPosition({ lon, lat })` in `PresenceBand`, `x = (lon + 180) / 360`, `y = (84 - lat) / (84 - (-56))`, as percentages in `--x` and `--y` |
| Render presence | the map's bounds | decided in this spec: the constants `MAP_LAT_TOP = 84` and `MAP_LAT_BOTTOM = -56` in `PresenceBand`, matching the checked in SVG and the schema's `lat` range. The three must change together |
| Render presence | the maximum number of regions | decided in this spec: 6, the schema's `max(6)` (AC-26) |
| Render presence | the why choose heading and items | `home.presence.whyChoose` |
| Render presence | the band's stripe | the `bg-diagonal` utility, stripes in `--color-line` |
| Choose showcase projects | which projects, in what order | derived: `getProjects(lang).slice(0, 3)` in `index.astro`, the count a named constant (`FEATURED_PROJECTS_COUNT = 3`) |
| Render showcase | whether the band renders | derived: the selected list is not empty (AC-28) |
| Render showcase | which grid layout | derived: the selected list's length, three gives the large first tile, one or two the equal grid (AC-29) |
| Render showcase | heading, intro, link words and path | `home.projectShowcase` |
| Render showcase | each tile's service name, title, summary, photo, alt | the project entry: `service.title`, `title`, `summary`, `image.src`, `image.alt ?? ''` |
| Render showcase | each tile photo's widths and `sizes` | decided in this spec: `[400, 640, 960, 1280]`, `(min-width: 48rem) 50vw, 100vw` |
| Render any section | the heading's `id` | decided in this spec: `<section>-heading` (AC-11) |

**Key invariants**:

- Exactly one `h1`, the hero heading. Sections are `h2`, titles inside them `h3`.
- The page owns tone. No component takes a tone prop or reads a tone variable. A band that is not a light tone (the hero, the intro band, `CtaBand`) is its own component that borrows `Section`'s frame classes; `Section` never gains a third tone.
- Two focus rules, no exceptions: `gold-ink` on the light tones, `focus-contrast` on every other surface, placed on the band's `<section>`.
- White text on a photo sits only on the scrim (the hero panel, the showcase captions). The hero dots are the one thing drawn directly on a photo, and they are hidden decoration.
- Gold as a word appears only on black (`gold-on-dark` in the intro band); on light tones gold is a fill, a rule, or an icon, and a gold word is `gold-ink`.
- Nothing on the page blinks or loops. The only motion is the counter, which runs once and is skipped with reduced motion.
- Text on `bg-diagonal` is `ink` or stronger.
- The map's bounds live in three places that change together: the SVG, the two constants in `PresenceBand`, and the schema's `lat` range.
- A showcase tile that is not a link does not look like one: no hover motion, no pointer cursor.
- The finished numbers are in the HTML before any script runs.
- The services grid is a contract of exactly three; a fourth entry stops the build.
- `<main>` stays a plain block (no `overflow` or `contain`), or the hero's pull under the header is clipped.
- Class strings stay written out in full, so Tailwind can find them.

**Security model**: a public, prerendered page. No authentication, no visitor input, no personal data, no runtime request. Content is read at build only. No compliance scope applies.

**Configuration required**: none.

**Critical test scenarios**:

- Happy path: the built `index.html` holds six sections in the AC-1 order with the six heading ids of AC-11, one `h1`, and every string traceable to a content file, verifies **AC-1**, **AC-2**, **AC-11**.
- Nothing retired lingers: the built HTML holds no `why-choose-us-heading`, `certification-heading`, `cta-heading`, `differentiators-heading`, or `stats-heading`, and `src/` holds no `whyChooseUs`, verifies **AC-1**, **AC-9**, **AC-10**, **AC-31**.
- Numbers: the built HTML holds `1,200`, and with JavaScript disabled, or with reduced motion set, the cards show the finished values with no change on scroll, verifies **AC-5**, **AC-6**.
- No blinking: nothing in the intro band animates after load, and `global.css` holds no `caret` keyframes, verifies **AC-8**.
- Too many regions: adding a seventh region fails `pnpm build` naming `presence.regions`, verifies **AC-26**.
- Off the map: a region with `lat: -60` fails the build naming the field, verifies **AC-26**.
- Labels: at 768px and 1280px no two region names overlap; at 360px the names sit in a row under the map with every dot on it, verifies **AC-26**, **AC-13**.
- Emphasis: a paragraph with a lone `**` fails the build naming the file and field; a balanced one renders `<strong>`, verifies **AC-27**.
- Stripe contrast: inspecting a paragraph over a stripe line shows `ink` or stronger, never `ink-muted`, verifies **AC-25**.
- Showcase with three, two, one, and zero projects (temporarily moving project files aside): three gives the large first tile; two gives two equal tiles with no empty cell at `lg`; one gives a single full width tile; zero removes the section and the build passes, verifies **AC-28**, **AC-29**.
- Showcase interaction: hovering a tile moves nothing; tabbing through the band reaches only the button, which shows the `gold-ink` ring, verifies **AC-30**, **AC-18**.
- Focus on dark: tabbing to the hero button shows the double ring; the intro band holds nothing focusable today, and a link added there temporarily shows the double ring too, verifies **AC-18**.
- Loading: on a throttled connection the hero photo is requested first and nothing shifts as the overview, service, and showcase photos arrive, verifies **AC-12**.
- Responsive: at 360px, 768px, and 1280px nothing scrolls sideways, the services row reflows one to two to three, the intro cards go two to four, and no showcase caption is clipped, verifies **AC-13**, **AC-5**, **AC-29**.
- The hero scenarios of the first revision (short screen, worst case contrast, broken photo, silent dots, home only overlap, no JavaScript on a phone, strict hero) still hold, verifies **AC-3**, **AC-19** to **AC-22**.

## Build plan

Sliced by the project's Skateboard approach. The page already works end to end, so milestone 6 records what was built for the demo and then makes the five ratified changes, each a small edit to a page that keeps working after every step. The rename goes first because it touches the most files and every later check greps for the new names.

**Milestones 1 to 5** (done): the page stood up with no script, the numbers moved, the services guard, the docs and gates, and the reference hero. Their tasks (1 to 21) are kept in this spec's history in git; tasks 4 and 11 were superseded by the hero revision, and the nine section composition by milestone 6.

**Milestone 6: the six section page, ratified 2026-09-21**

Built during `/develop` for the demo (done):

22. The black intro band with a gold highlighted heading, the lead, and the `stats` entry as white icon cards counting up through `counters.ts`; the separate stats band left the page; four new icon glyphs and the `gold-on-dark` token, satisfies **AC-5**, **AC-6**, **AC-8** (all but the caret).
23. The presence band: `PresenceBand.astro`, the checked in `world-map.svg`, `emphasis.ts` with the balanced mark check in the schema, `bg-diagonal`, the `check` glyph, `presence` as a strict object with `paragraphs`, `regions` as coordinates, and `whyChoose`; the differentiators section folded into it, satisfies **AC-25**, **AC-26** (all but the cap), **AC-27**.
24. The project showcase: `ProjectShowcase.astro`, `home.projectShowcase`, the first three projects by `order`, the section absent with none; certification and the closing band removed from the page and the schema, satisfies **AC-9**, **AC-10**, **AC-28**, **AC-29** (three projects only).
25. The services heading centred with the gold rule and the cards `elevated` and centred, satisfies **AC-4**, **AC-32**.

To build now:

26. Rename the intro band: `whyChooseUs` becomes `intro` in `src/content.config.ts` and `src/content/home/en/home.yaml` in the same commit; `git mv` `WhyChooseUs.astro` to `IntroBand.astro`; update its import, props, and comments in `index.astro`; change the heading id to `intro-heading`. Then grep `src/` for `whyChooseUs`, `WhyChooseUs`, and `why-choose-us` and expect nothing, satisfies **AC-11**, **AC-31**.
27. Remove the caret: delete the `animate-caret` span from `IntroBand.astro`, and `--animate-caret` plus the `caret` keyframes (and their comment) from `global.css`, satisfies **AC-8**.
28. Cap the regions: add `.max(6)` to `presence.regions` in `src/content.config.ts`, and prove it by adding a seventh region, building, and removing it, satisfies **AC-26**.
29. Fix the showcase for one or two projects: in `ProjectShowcase.astro`, apply the large first tile classes (`md:col-span-2 lg:row-span-2 lg:min-h-full`) and the two row `lg` grid only when there are exactly three projects; with one, the tile spans the full width; with two, two equal columns from `md`. Keep the class strings written out in full. Prove it by building with one, two, and three project files for `en` and checking each at 768px and 1280px, satisfies **AC-29**.
30. Drop the hover zoom: remove `group-hover:scale-105`, the transform transition, and the `group` class from the tiles, and correct the component comment, satisfies **AC-30**.
31. Update `docs/design.md`: rename the why choose us band to the intro band throughout (colour table, contrast table, the black band note, the icon list, the focus rule list, the counter note), record the `bg-diagonal` rule with its 4.56:1 worst case and the `ink-muted` ban, and remove any caret mention. Update `/styleguide` if it names the band, satisfies **AC-24**, **AC-25**.
32. Check a real preview at 360px, 768px, and 1280px: the six sections in order, no sideways scrolling, region labels not overlapping, the intro cards two then four, no caption clipped, and tabbing through the page, satisfies **AC-1**, **AC-13**, **AC-18**, **AC-26**.
33. Run `pnpm check`, `pnpm lint`, and `pnpm build`; confirm one HTML file per route, no `astro-island`, and only the nav and counter scripts on the home page, satisfies **AC-14**, **AC-17**.

## Consequences

**Positive**:

- One spec is the home page contract again. `/develop` and `/check verify` read one file instead of reconciling 0005 with two assumed specs and an unwritten band.
- The page is still entirely editable from content, including where the company works and which projects it shows.
- Nothing on the page loops or blinks any more, so it meets WCAG 2.2.2 with no pause control.
- The content key names now match what an editor sees: the intro is `intro`, and the reasons list is the one `whyChoose` list, in the presence band.
- The showcase cannot render broken for a new language with few projects.

**Negative and tradeoffs**:

- The page no longer ends on a call to action. A visitor who scrolls to the bottom meets the showcase's "View all projects" and then the footer; the only prompts to get in touch are the hero button, the nav, and the footer's contact details. The engineer chose this deliberately. If enquiries from the home page run low, this is the first thing to revisit.
- The hero photo's small subject sits under the centred panel on most screens, so the hero reads as texture more than as a picture of anything. The engineer chose to keep it for the demo; spec 0006's ratification or the launch content pass (feature 12) owns the photo.
- The world map cannot be regenerated from the repo. Changing its bounds or density means rebuilding it by hand and changing the two constants and the schema range with it.
- Six regions is a guess at what fits. A region close to Europe or the Middle East can overlap within the cap, and only the verify step catches it, not the build.
- The showcase's three layouts are three class paths in one component, so a change to the tile grid has to be checked at one, two, and three projects.
- `StatsBand` and `CtaBand` stay in the design system with no page using them until features 7 and 8. They are kept on the strength of a planned reuse.
- The rename touches the schema, the entry, a component file, the page, `design.md`, and possibly the styleguide in one go. A missed reference fails `pnpm check` or the build, which is the safety net.
- The site now has three bands that are not a `Section` (the hero, the intro band, the gold band). Each is justified alone; a fourth should prompt a look at whether `Section` wants a real dark tone (the scope's parked item).

**Neutral**:

- Specs 0007 and 0008 are marked superseded by this spec. Spec 0006 stays `Assumed` and owns where photos come from.
- Spec 0002's `home` row and its home stats and services rows are edited to match the six section model.
- No new tool, dependency, environment variable, or runtime behaviour.

## Follow-up

- [ ] Ratify spec 0006 with `/architect remote photos`. It owns the build's dependency on Pexels and the hero photo whose subject the panel covers.
- [ ] The presence why choose list repeats itself in placeholder copy ("Quality checks at every milestone" and "Quality assurance at every stage"). A content pass before launch, not a spec change.
- [ ] When project detail pages arrive (a parked scope item), make each showcase tile a link to its project and bring the hover motion back with it.
- [ ] When a fourth service arrives, decide what the home page shows: a two by two grid, or a curated three. Until then the build stops.
- [ ] `verify.md` still describes the nine section page. `/check verify` should rewrite it from this spec's critical test scenarios.
- [ ] When About (feature 7) is built, decide between `StatsBand` and the intro band's cards, and retire whichever loses.
- [ ] If enquiries from the home page turn out low, revisit a closing call to action (the showcase band could carry a second button).

## Rationale

Reasoning and options: see [rationale.md](rationale.md).
