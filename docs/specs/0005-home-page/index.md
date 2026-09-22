# 0005. Compose the home page from content as six bands, enhanced by small plain scripts

**Date**: 2026-09-22 (scroll reveals with Motion added, the hero carousel recorded as built; 2026-09-21: AC-3 removed; six section page ratified, folding in the assumed specs 0007 and 0008; hero revised to the reference overlay earlier the same day; first written 2026-09-20)
**Status**: In Progress
**Scope feature**: 6, Home page (`docs/scope/scope.md`)

## Summary

The home page is six bands, in this order: a full screen photo hero, a black intro band with the company's numbers as white cards, a company overview, three service cards, a global presence band with a dotted world map, and a showcase of three projects. Every word, number, and photo comes from content (`home.yaml`, the `stats` entry, the `services` and `projects` entries), never from a component.

This revision ratifies what was built quickly for the demo. The presence band (spec 0007) and the project showcase (spec 0008) were recorded as assumptions; they are now deliberated and folded in here, and both of those specs are superseded by this one. The black intro band, built with no spec at all, is written down too. Five small changes come out of the review: the blinking caret goes (it never stopped), the band's content key is renamed from `whyChooseUs` to `intro` (it holds an intro, not the reasons list), the map allows at most six regions, the showcase falls back to an equal grid with fewer than three projects, and the showcase photos stop zooming on hover (they are not links yet).

The page ships three small plain scripts on top of the nav, each enhancing markup that is already complete: the counter that animates the numbers once when they scroll into view, the hero carousel that crossfades up to three photos, and (revised 2026-09-22) a scroll reveal that fades and lifts the bands below the hero into place once, using the `motion` library's two smallest pieces (`animate` from `motion/mini` and `inView`). With no JavaScript, a failed script, or reduced motion asked for, the visitor sees every band fully drawn, the finished figures, and the first hero photo. No React is hydrated on the page.

The 2026-09-22 revision also writes down the hero carousel, built on 2026-09-21 without a spec change. It is recorded as built, at the engineer's choice, including one known gap: it autoplays with no pause button, so the page no longer meets WCAG 2.2.2 (see Consequences and Follow-up).

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
- **AC-3** (removed 2026-09-21): No longer required. The number stays so the other IDs keep their meaning; it is not reused.
- **AC-4** (heading revised 2026-09-21): The services section is a `tint` `Section` with a centred `h2` carrying the gold rule (AC-32) and a centred `text-lead` intro, both from `home.services`. It renders one `Card` per `services` entry for the page's language, ordered by `order`, each `elevated` and `align="center"`, showing the entry's image, title, and summary, and linking to `/{slug}`, the same path `[service].astro` builds. When the collection does not hold exactly three entries for a language, the build fails with a message naming the collection, the language, and the count found.
- **AC-5** (revised 2026-09-21, numbers as cards): The intro band renders one white card per `stats` entry item, inside one `<dl>`: a decorative icon from the item's `icon` (hidden from assistive tech), then the number grouped for the entry's language (so `1200` reads as `1,200`) with its suffix when it has one, then its label. The label is the `<dt>` and the number the `<dd>`, shown number first. The grid is two columns below `lg` and four at `lg`. The finished numbers are present in the built HTML.
- **AC-6**: The numbers count up once, the first time the cards enter the viewport, and never again. With JavaScript unavailable, or with `prefers-reduced-motion: reduce` set, no animation runs and the finished numbers are what the visitor sees.
- **AC-7** (revised 2026-09-21): The overview renders through the shared `MediaText` component inside a `white` `Section`, with the photo on the end side. `MediaText` keeps its optional image and single column fallback, because About reuses it.
- **AC-8** (revised 2026-09-21, the intro band): The intro band is its own black band, not a `Section` tone, framed by the shared band classes (AC-23) and carrying `focus-contrast`. Its `h2` is white and centred, with `home.intro.headingHighlight` in `gold-on-dark` after `home.intro.heading`, and the gold rule under it. The first paragraph opens with `home.intro.lead.highlight` in semibold `gold-on-dark`, then `lead.text`; any further `paragraphs` follow in white. Nothing on the band animates except the counter of AC-6: it takes no scroll reveal (AC-33, revised 2026-09-22), and there is no caret and no blinking element.
- **AC-9** (revised 2026-09-21, replaces the certification row): The certification row is not on the home page. The footer carries the certification badges (`settings.footer.certification`), so the page loses nothing.
- **AC-10** (revised 2026-09-21): The gold `CtaBand` is not on the home page. It stays in `src/components/ui/` for the service pages (feature 8), and its `/styleguide` tile is fed the first service's `cta`. `Section` still offers exactly two tones and `Button` exactly two variants; neither gains a prop for any band on this page.
- **AC-11** (revised 2026-09-21): The page has exactly one `h1`. Each of the six sections carries its own `h2` and points at it with `aria-labelledby`, using one naming rule: the heading's id is `<section>-heading`. The six ids are `hero-heading`, `intro-heading`, `overview-heading`, `services-heading`, `presence-heading`, and `project-showcase-heading`. Titles inside a section (service cards, the presence band's why choose heading, showcase tiles) are `h3`.
- **AC-12** (revised 2026-09-22, the carousel): The first hero photo loads eagerly with a high fetch priority; the other hero photos load lazily. All of them use `sizes="100vw"` and the width steps of the hero's own width rule (spec 0006 decides where the photos come from and how their widths are read), and all are positioned to fill the band, so none takes layout space. Every other photo on the page loads lazily and reserves its space: `MediaText` and `Card` by aspect ratio, showcase tiles by filling a tile whose height is set by the grid, so nothing moves as images arrive. The world map is an inline SVG with a fixed `viewBox`, so it reserves its own space. Every image either carries alt text or is marked decorative.
- **AC-13**: The page renders correctly at mobile, `md`, and `lg` with no sideways scrolling at any width, and every tap target stays at least 44px.
- **AC-14** (revised 2026-09-22): The only JavaScript the page loads is the existing nav bundle, the counter module, the hero carousel module, and the reveal module (with the parts of `motion` it imports). Astro may bundle these into fewer files; no other script appears. No `astro-island` appears in the built HTML.
- **AC-15**: The page's title and description come from `home.seo` and reach the document through `PageLayout`.
- **AC-16** (revised 2026-09-21): The three shared components spec 0005 promoted, `StatsBand`, `MediaText`, and `CtaBand`, keep their `docs/design.md` entries under `## Components` and their `/styleguide` tiles, even though only `MediaText` appears on the home page today. `StatsBand` stays for About (feature 7), which decides then between it and the intro band's cards.
- **AC-17**: `pnpm check`, `pnpm lint`, and `pnpm build` all run clean, and `dist/client/` still holds exactly one HTML file per route and nothing more.
- **AC-18** (revised 2026-09-21): The site has two focus rules and no exceptions. On the two light tones, the sitewide 2px `gold-ink` outline at a 2px offset. On every surface that is not a light tone (on this page the hero photo and the black intro band; elsewhere the gold `CtaBand`), a two colour ring: a 2px black band directly around the control and a 2px white band outside it, from the one `focus-contrast` utility in `global.css` placed on the band's `<section>`. The presence band (white under a stripe) and the showcase band (tint) are light tones and keep `gold-ink`. Mouse clicks still show nothing.
- **AC-19**: White text on the scrim reaches at least 4.5:1 over any photo pixel. The scrim is the token `--color-scrim`, black at 60 percent. Its worst case is white text over a pure white pixel seen through the scrim, a composite of about `#666666`, which measures 5.74:1, so no photo swap can lower the ratio. The hero's own background is black, so a photo that fails to load leaves white copy on a dark band. The showcase captions (AC-29) rely on the same guarantee.
- **AC-20** (revised 2026-09-22, the carousel controls, recorded as built): With two or more hero photos, the hero carries one dot per photo and a previous and a next arrow. Every one is a real `<button>` with an accessible name (`Show photo N of M`, `Show the previous photo`, `Show the next photo`); the dot for the photo showing has `aria-current="true"`. Each dot is a 24px hit area around a small mark, black at 30 percent, solid black for the current photo (black because every hero photo is a white background, spec 0006). The arrows are white circles with a black chevron, shown from `md` up, fading in while the pointer is over the band or when focused. All controls start `invisible` in the HTML and the carousel script reveals them, so with no JavaScript there is nothing dead to tab to. With one photo there are no controls at all. The controls take the `focus-contrast` ring.
- **AC-21**: The home hero starts at the very top of the page, behind the header card. It pulls itself up by `--header-h` and pads its content down by the same amount, so the panel centres in the visible area below the card and no copy, button, or dot sits under the header at load. Only the home hero does this. On a phone with JavaScript off, the open mobile menu pushes the hero below it; the matching padding means nothing is hidden.
- **AC-22** (revised 2026-09-22): The `home` hero schema is a `z.strictObject` of `{ heading, subheading, images, primaryCta }`, where `images` holds 1 to 3 photos in display order, so an entry carrying `secondaryCta`, or any other unknown hero key, fails the build naming the key. `Hero.astro` takes no `secondaryCta` prop.
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
- **AC-33** (added 2026-09-22, what reveals): Below the hero and the intro band, these elements reveal once as they scroll into view: the services heading block, then its cards one after another; the overview's copy and photo, one after the other; the presence heading, then its map and copy one after the other; the showcase heading block, then its tiles one after another, then its button. The hero and the intro band never reveal. An element opts in with `data-reveal`; a container whose direct children reveal one after another carries `data-reveal-stagger` instead. Both attributes are written in markup (`index.astro` and the components), never in content, and without the reveal script they do nothing.
- **AC-34** (added 2026-09-22, how it moves): A reveal animates `opacity` from 0 to 1 and `transform` from `translateY(24px)` to `none`, over 600ms with an ease out curve. Each hidden element is watched on its own and starts when 20 percent of it is in view. A child of a stagger container also waits N × 80ms, where N is its position among that container's hidden children (0 for the first), so a row that arrives together plays one after another, and on a phone, where the same items stack, each still reveals as it reaches the screen. Each element reveals once and never hides or replays, not on scrolling back up and not on scrolling down again. When its animation ends, the element holds no inline `opacity` or `transform` of its own, so hover styles and layout are exactly as they were before the script.
- **AC-35** (added 2026-09-22, motion is never load bearing): The built HTML draws every element fully visible; only the reveal script hides anything, and only elements that are entirely below the viewport when it runs. An element already on screen, or partly on screen, when the script starts is left alone and never animates, so nothing visible blinks out and back. With JavaScript unavailable, with the script failing to load, or with `prefers-reduced-motion: reduce`, the script hides nothing and every element is visible. A focusable element inside a hidden one (a service card, the showcase button) reveals as soon as focus scrolls it into view.
- **AC-36** (added 2026-09-22, the dependency): The reveal uses the `motion` package, imported only as `animate` from `motion/mini` and `inView` from `motion`. No other `motion` export (hybrid `animate`, `scroll`, `motion/react`) is imported anywhere in `src/`. The reveal module plus the parts of `motion` it pulls in come to at most 5 KB gzipped in the built output. `motion` needs no install script, so `allowBuilds` in `pnpm-workspace.yaml` is unchanged.
- **AC-37** (added 2026-09-22, the carousel behaviour, recorded as built): With two or more photos, the hero crossfades to the next photo every 6 seconds, the fade taking 1 second, wrapping from the last photo to the first. The slideshow holds still while the pointer is over the band or keyboard focus is inside it, and picks up again when both leave; choosing a photo with a dot or an arrow shows it at once and gives it a full 6 seconds. Only the photo showing is exposed to assistive tech; the others are `aria-hidden="true"`. With `prefers-reduced-motion: reduce`, the slideshow never autoplays, the dots and arrows still work, and the swap is instant (the `global.css` cut). With no JavaScript, the hero is the first photo, still. There is no pause button (the known WCAG 2.2.2 gap in Consequences).

## Decision

**Chosen option**: Option 1: content driven Astro composition, split by reuse, with one plain counter script (unchanged). The 2026-09-21 ratification keeps the six section page as built and fixes it in place.

The page is composed in `src/pages/index.astro`, which owns every band's tone and every heading id. Two bands that are not light tones (the hero and the intro band) are their own components sharing `Section`'s frame through class strings; the three bands only this page wants (`IntroBand`, `PresenceBand`, `ProjectShowcase`) live in `src/components/home/` and render inside the frame the page gives them.

**Ratified 2026-09-21**: the presence band of spec 0007 and the project showcase of spec 0008, both now superseded by this spec, with five changes: no caret, `whyChooseUs` renamed `intro`, at most six regions, an equal grid under three projects, and no hover zoom on tiles that are not links. The hero's photo source and its white, centred subject stay with spec 0006, still assumed.

**Revised 2026-09-22**: the page gains a scroll reveal built as one plain module, `src/scripts/reveal.ts`, on `motion`'s mini `animate` (2.3 KB, native Web Animations) and `inView` (0.5 KB), chosen by the engineer over no library, GSAP with ScrollTrigger, and CSS scroll driven animations. The script hides only what is below the fold when it runs, so no CSS ever hides content and a failed script costs nothing. The hero carousel built on 2026-09-21 is recorded as built, including its lack of a pause button.

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
| `src/scripts/hero-carousel.ts` | the hero's photos, dots, and arrows | none | Enhances every `data-hero-carousel` on the page; recorded as built (AC-20, AC-37) |
| `src/scripts/reveal.ts` (new) | the scroll reveal | any page that imports it | Reads `data-reveal` and `data-reveal-stagger`; imported by `index.astro` only, because the reveal is the page's choice, not a component's |
| `data-reveal` on `MediaText`'s copy and media columns, via `data-reveal-stagger` on its grid (new) | overview | About | The attributes are inert without the script, so About keeps a still `MediaText` until it opts in by importing `reveal.ts` |
| `motion` (new dependency) | `animate` from `motion/mini`, `inView` | the reveal only | The smallest parts of a maintained, widely used library; nothing else from it is imported (AC-36) |

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
| Render hero | loading, priority, `sizes`, widths, crop, scrim, height, header overlap, dots | decided in this spec's hero revision (AC-12, AC-19 to AC-21); the photo's source and how its width is read are spec 0006 |
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
| Render hero | the photos, their order, their alt text | `home.hero.images` (1 to 3), `image.alt ?? ''` |
| Carousel script | which photo shows, and when it changes | derived: starts at 0, steps by one and wraps; the interval `INTERVAL_MS = 6000` and the 1s fade (`duration-1000` on each photo) are decided in this spec (AC-37) |
| Carousel script | whether it autoplays | `window.matchMedia('(prefers-reduced-motion: reduce)')`, plus pointer over the band and focus inside it |
| Reveal script | which elements reveal, and which reveal in sequence | the `data-reveal` and `data-reveal-stagger` attributes written in markup (AC-33) |
| Reveal script | whether it runs at all | `window.matchMedia('(prefers-reduced-motion: reduce)')`; reduced motion means a full stop, like the counter (AC-35) |
| Reveal script | which elements it hides | derived at start: an element whose `getBoundingClientRect().top` is at or below `window.innerHeight`, that is, entirely below the viewport (AC-35) |
| Reveal script | distance, duration, easing, threshold, stagger step | decided in this spec, as named constants in `reveal.ts`: `RISE_PX = 24`, `DURATION_S = 0.6`, `ease: 'easeOut'`, `AMOUNT = 0.2` (the `inView` `amount`), `STAGGER_S = 0.08`; the delay for a stagger child is `N * STAGGER_S`, N its position among its container's hidden children, computed in the script; a plain `data-reveal` element has no delay (AC-34) |
| Reveal script | once only | derived: the `inView` callback returns nothing, so `inView` stops watching the element after its first entry (AC-34) |

**Key invariants**:

- Exactly one `h1`, the hero heading. Sections are `h2`, titles inside them `h3`.
- The page owns tone. No component takes a tone prop or reads a tone variable. A band that is not a light tone (the hero, the intro band, `CtaBand`) is its own component that borrows `Section`'s frame classes; `Section` never gains a third tone.
- Two focus rules, no exceptions: `gold-ink` on the light tones, `focus-contrast` on every other surface, placed on the band's `<section>`.
- White text on a photo sits only on the scrim (the hero panel, the showcase captions). The hero dots are the one thing drawn directly on a photo, and they are hidden decoration.
- Gold as a word appears only on black (`gold-on-dark` in the intro band); on light tones gold is a fill, a rule, or an icon, and a gold word is `gold-ink`.
- Motion is enhancement only. The built HTML shows every band complete, and no CSS rule hides anything waiting for a script; only `reveal.ts` hides, and only what is below the fold when it runs.
- Nothing blinks. The counter and each reveal run once. The one thing that repeats is the hero carousel, which holds while pointed at or focused. With reduced motion, none of the three scripts animates anything.
- The hero and the intro band never take a reveal: the hero is the largest contentful paint, and the intro band already moves with the counter.
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
- No blinking: nothing in the intro band animates after load except the counter, no intro band element carries `data-reveal`, and `global.css` holds no `caret` keyframes, verifies **AC-8**, **AC-33**.
- Reveal happy path: scroll slowly from the top at 1280px; the services heading rises in, then the three cards one after another, and likewise the overview, presence, and showcase in the AC-33 order. Scroll back up and down again: nothing hides or replays, verifies **AC-33**, **AC-34**.
- Nothing left behind: after every reveal has played, no element on the page holds an inline `opacity` or `transform` style, and hovering a service card shows its usual shadow change, verifies **AC-34**.
- Nothing blinks at load: reload scrolled halfway down the page (or with a `#presence-heading` link); the bands already on screen do not fade out and back in, and the bands below still reveal, verifies **AC-35**.
- No JavaScript, a blocked script, and reduced motion: disable JavaScript; separately, block the reveal chunk in dev tools; separately, set `prefers-reduced-motion: reduce`. In each case every band below the hero is fully visible at once and scrolling changes nothing, verifies **AC-35**.
- Keyboard: from the hero, tab through the page with no scrolling first; each service card and the showcase button is visible by the time it shows its focus ring, verifies **AC-35**, **AC-18**.
- Weight: the built reveal chunk (with the `motion` parts it imports) measures at most 5 KB gzipped, and `src/` imports nothing from `motion` beyond `motion/mini`'s `animate` and `inView`, verifies **AC-36**.
- Carousel: with three photos, the hero changes photo every 6s with a 1s crossfade and wraps to the first; it holds while the pointer is over it or focus is inside; a dot or arrow click shows that photo and it stays a full 6s; the dot for the showing photo carries `aria-current="true"`. With reduced motion it never changes on its own and the controls still work. With no JavaScript it shows the first photo, still, with no controls reachable by Tab. With one photo there are no controls, verifies **AC-20**, **AC-37**.
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
- The hero scenarios of the first revision (worst case contrast, broken photo, home only overlap, no JavaScript on a phone, strict hero) still hold, verifies **AC-19**, **AC-21**, **AC-22**. The old "silent dots" scenario is replaced by the carousel scenario above.

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

**Milestone 7: motion, revised 2026-09-22**

Built during `/develop` on 2026-09-21 (done):

34. The hero carousel: `home.hero.images` (1 to 3) in the strict schema, every photo stacked in `Hero.astro` with the first eager and the rest lazy and hidden, dots and arrows as real buttons starting `invisible`, and `src/scripts/hero-carousel.ts` for autoplay, the hover and focus hold, and the reduced motion stop, satisfies **AC-12**, **AC-20**, **AC-22**, **AC-37**.

Built during `/develop` on 2026-09-22 (done). Skateboard: the first task puts one reveal on the page end to end, so the whole path (dependency, script, attribute, import, reduced motion stop) works before anything is marked up widely.

35. Add the dependency: `pnpm add motion`. Confirm the install needs no `allowBuilds` entry, and that `pnpm-workspace.yaml` is unchanged, satisfies **AC-36**.
36. Write `src/scripts/reveal.ts`, a plain module shaped like `counters.ts`: a header comment on why nothing is load bearing; the named constants of the value sourcing table; a full stop when reduced motion is asked for; at start, collect every `[data-reveal]` and every direct child of `[data-reveal-stagger]`, keep only those entirely below the viewport, and set their starting `opacity` and `transform` inline (through `style.setProperty`, for the `no-param-reassign` rule); watch each hidden element on its own with `inView` at `AMOUNT` (never the stagger container, which can be on screen while its later children are not); on entry, `animate` from `motion/mini` to `opacity: 1` and `transform: 'none'` with the child's delay, and on finish remove both inline properties. Only hidden elements are animated. End with `export {}` like the carousel, satisfies **AC-34**, **AC-35**, **AC-36**.
37. Import it from `index.astro` in one `<script>` block, the same way the hero imports its carousel, and mark the services heading block `data-reveal` only. Build, and check that heading end to end: it reveals, it stays put with reduced motion, and it is visible with JavaScript off, satisfies **AC-14**, **AC-35**.
38. Mark the rest, per AC-33: the services card grid `data-reveal-stagger`; `MediaText`'s grid `data-reveal-stagger` (its copy and media columns are its direct children); the presence heading `data-reveal` and its map and copy grid `data-reveal-stagger`; the showcase heading block `data-reveal`, its tile grid `data-reveal-stagger`, and its button `data-reveal`. Nothing in `Hero.astro` or `IntroBand.astro` gets either attribute. Confirm that each stagger container's direct children are the items meant to move (a wrapper in between would move as one block), satisfies **AC-33**.
39. Update `docs/design.md` under `## Focus and motion`: the reveal (what moves, the values, once only, below the fold only, the reduced motion stop), the carousel (6s, 1s fade, the hold, the reduced motion stop, the missing pause control), and change the intro band note at line 217 only if its wording now reads wrong. Add the `MediaText` note that its reveal attributes are inert until a page imports `reveal.ts`, satisfies **AC-24**.
40. Check a real preview at 360px, 768px, and 1280px against the reveal and carousel scenarios in Critical test scenarios, including the reload halfway down, the blocked script, reduced motion, and tabbing with no scroll first, satisfies **AC-33** to **AC-35**, **AC-37**.
41. Run `pnpm check`, `pnpm lint`, and `pnpm build`; confirm one HTML file per route, no `astro-island`, only the four scripts of AC-14 on the home page, and the reveal chunk at most 5 KB gzipped; grep `src/` for `from 'motion` and see only the two imports of AC-36, satisfies **AC-14**, **AC-17**, **AC-36**.

## Consequences

**Positive**:

- One spec is the home page contract again. `/develop` and `/check verify` read one file instead of reconciling 0005 with two assumed specs and an unwritten band.
- The page is still entirely editable from content, including where the company works and which projects it shows.
- Nothing on the page blinks any more. The reveals give the long page a sense of arrival without putting any content at risk: they only ever touch what is below the fold, and they vanish entirely for reduced motion, no JavaScript, or a failed script.
- The motion library costs about 3 KB, and it is a maintained, widely used one, so springs, sequences, or scroll linked effects later are an import away rather than a rewrite.
- The content key names now match what an editor sees: the intro is `intro`, and the reasons list is the one `whyChoose` list, in the presence band.
- The showcase cannot render broken for a new language with few projects.

**Negative and tradeoffs**:

- **Known accessibility gap (engineer's choice, 2026-09-22)**: the hero carousel autoplays for longer than 5 seconds with no pause, stop, or hide control, so the page does not meet WCAG 2.2.2 (Pause, Stop, Hide). Holding on hover and focus helps mouse and keyboard users but not touch or screen magnifier users. The recommended fix, a pause toggle beside the dots, was offered and declined for now; it is the first Follow-up and should land before launch.
- A new runtime dependency (`motion`). Only two small functions are imported and AC-36 caps the weight, but a major version upgrade could move the `motion/mini` path.
- The reveal adds a script and a moment of waiting to every band below the fold. On a slow device the first scroll can feel a beat behind. The 600ms duration and the 80ms step are the knobs if it feels slow.
- Stagger works on direct children only. A future wrapper `div` inside a stagger container silently turns a sequence into one block; only the verify step catches it.
- Four scripts where there was one. Each is small and progressively enhanced, but the page's "zero JavaScript" story is now "zero required JavaScript".

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
- One new dependency (`motion`, revised 2026-09-22); no new tool, environment variable, or server behaviour. Every page is still prerendered.
- `MediaText` carries reveal attributes wherever it is used, but they do nothing on a page that does not import `reveal.ts`.

## Follow-up

- [ ] Before launch, add a pause toggle to the hero carousel (a `<button>` with `aria-pressed` beside the dots) so the page meets WCAG 2.2.2 again. This needs a small revision of AC-20 and AC-37.
- [ ] When About (feature 7) is built, decide whether it imports `reveal.ts` too; the `MediaText` attributes are already there.
- [ ] `verify.md` still describes the nine section page, counts two scripts (AC-14), and has no reveal or carousel checks. `/check verify` should rebuild it from the Critical test scenarios above.
- [ ] Ratify spec 0006 with `/architect remote photos`. It owns the build's dependency on Pexels and the hero photo whose subject the panel covers.
- [ ] The presence why choose list repeats itself in placeholder copy ("Quality checks at every milestone" and "Quality assurance at every stage"). A content pass before launch, not a spec change.
- [ ] When project detail pages arrive (a parked scope item), make each showcase tile a link to its project and bring the hover motion back with it.
- [ ] When a fourth service arrives, decide what the home page shows: a two by two grid, or a curated three. Until then the build stops.
- [ ] When About (feature 7) is built, decide between `StatsBand` and the intro band's cards, and retire whichever loses.
- [ ] If enquiries from the home page turn out low, revisit a closing call to action (the showcase band could carry a second button).

## Rationale

Reasoning and options: see [rationale.md](rationale.md).
