# 0005. Compose the home page from content with three shared bands and one counter script

**Date**: 2026-09-20
**Status**: In Progress
**Scope feature**: 6, Home page (`docs/scope/scope.md`)

## Summary

The home page renders the nine sections spec 0002 already models, in the order the scope lists, with every word and image coming from `src/content/home/en/home.yaml`, the `stats` entry, and the three `services` entries. Nothing on the page is written into a component.

Three of the pieces are built as shared design system components, because a later Release 1 page already needs each one: a stats band (About reuses it), a media plus text split (About, plus the overview and presence sections here), and a closing call to action band (the service pages reuse it). The four pieces only this page wants stay in `src/components/home/`.

The page ships one small script, the counter that animates the stat numbers once when they scroll into view. The finished numbers are in the HTML before it runs, so with no JavaScript, or with reduced motion asked for, the visitor simply sees the final figures. The page hydrates no React at all.

## Requirements

**User stories**:

- As a prospective client landing on the site for the first time, I want to see what this company does, what it has delivered, and how to start a conversation, without scrolling through a wall of text.
- As a visitor on a phone on a slow connection, I want the page readable immediately and not jumping around as images arrive.
- As someone editing the site, I want to change any headline, paragraph, number, or photo by editing a content file, never a component.
- As a keyboard or screen reader user, I want the page to read in a sensible heading order and every image to carry a real description.

**Acceptance criteria**:

- **AC-1**: The page renders exactly nine sections in this order: hero, why choose us, company overview, stats, services, global presence, differentiators, certification, closing call to action. The reference site's "Delivering Precision BIM & Revit Modeling" section is absent.
- **AC-2**: Every headline, paragraph, list item, number, label, button word, and image on the page comes from a content entry. `src/pages/index.astro` and every component it uses contain no visible copy of their own.
- **AC-3**: The hero renders as a split: copy on one side, photo on the other at `lg`, stacking to copy then photo below that. The hero heading is the page's only `h1`. The secondary call to action renders when the entry has one, and the layout stays correct when it does not.
- **AC-4**: The services section renders one `Card` per `services` entry for the page's language, ordered by `order`, each showing the entry's image, title, and summary, and linking to `/{slug}`, the same path `[service].astro` builds. When the collection does not hold exactly three entries for a language, the build fails with a message naming the collection, the language, and the count found.
- **AC-5**: The stats band renders one item per `stats` entry item: the number grouped for the entry's language (so `1200` reads as `1,200`), its suffix when it has one, and its label. The finished numbers are present in the built HTML.
- **AC-6**: The numbers count up once, the first time the band enters the viewport, and never again. With JavaScript unavailable, or with `prefers-reduced-motion: reduce` set, no animation runs and the finished numbers are what the visitor sees.
- **AC-7**: The overview and presence sections both render through one shared media plus text component, with the photo on opposite sides so the two do not read as the same block twice. The presence section lists its region names. The image is optional, because `presence.image` is optional in the schema: with no image the component renders a single centred column of copy and list rather than an empty half.
- **AC-8**: The why choose us items render in a grid of one column on mobile, two at `md`, and three at `lg`, for any number of items the entry holds. The differentiators render as a marked list. Neither uses an icon, and the map in `Icon.astro` is unchanged.
- **AC-9**: The certification section renders its badges in a centred row with each badge's name beneath its image, wrapping to a column on a narrow screen. Each badge image carries the alt text from its entry.
- **AC-10**: The closing call to action renders as a self contained gold band: black heading and text on full gold, and a black filled link with a white label. `Section` still offers exactly two tones and `Button` exactly two variants; neither gains a prop for this.
- **AC-18**: The gold band's link shows a 2px solid black keyboard focus outline at the usual 2px offset, not the sitewide `gold-ink` one. `gold-ink` on full gold measures 2.10:1, so the sitewide ring would be invisible on the only band that is not one of the two light tones. Mouse clicks still show nothing.
- **AC-11**: The page has exactly one `h1`. Each of the nine sections carries its own `h2` and points at it with `aria-labelledby`, using one naming rule: the heading's id is `<section>-heading`, for example `services-heading`. Item titles inside a section are `h3`.
- **AC-12**: The hero photo loads eagerly with a high fetch priority, explicit widths, and a `sizes` hint. Every other image on the page loads lazily and reserves its space, so nothing moves as images arrive. Every image either carries alt text or is marked decorative.
- **AC-13**: The page renders correctly at mobile, `md`, and `lg` with no sideways scrolling at any width, and every tap target stays at least 44px.
- **AC-14**: The only JavaScript the page loads is the existing nav bundle plus the counter module. No `astro-island` appears in the built HTML.
- **AC-15**: The page's title and description come from `home.seo` and reach the document through `PageLayout`.
- **AC-16**: The three shared components each have a `docs/design.md` entry under `## Components` and a tile on `/styleguide`.
- **AC-17**: `pnpm check`, `pnpm lint`, and `pnpm build` all run clean, and `dist/client/` still holds exactly one HTML file per route and nothing more.

## Decision

**Chosen option**: Option 1: content driven Astro composition, split by reuse, with one plain counter script.

The page is composed in `src/pages/index.astro` from the existing primitives plus seven new components, three of which enter the design system because a later Release 1 page already needs them, and one plain script enhances numbers that are already correct in the HTML.

**Implementation skills**: `astro` (`astrolicious/agent-skills`, `.agents/skills/astro/`) · `tailwind-4-docs` (`lombiq/tailwind-agent-skills`, `.agents/skills/tailwind-4-docs/`)

## Feature design

**Data model sketch**: no change. Every value this page needs already exists in the collections spec 0002 defined, and no schema, entry, or getter is added or altered.

| Collection | Entry | What this page reads |
|---|---|---|
| `home` | `en/home` | `seo`, `hero`, `whyChooseUs`, `overview`, `stats.heading`, `services`, `presence`, `differentiators`, `certification`, `cta` |
| `stats` | `en/stats` | `items[]`: `value`, optional `suffix`, `label` |
| `services` | `en/*` | `slug`, `title`, `summary`, `image`, `order` |

**Component inventory**:

| Component | Used here for | Reused by | Why it sits where it does |
|---|---|---|---|
| `src/components/ui/StatsBand.astro` | stats | About (feature 7) | The About entry already carries a `statsHeading` for exactly this band |
| `src/components/ui/MediaText.astro` | overview, presence | About (feature 7) | Used twice on this page alone, with an `imageSide` prop |
| `src/components/ui/CtaBand.astro` | closing call to action | service pages (feature 8) | Every service entry carries a `cta` block of the same shape |
| `ctaLinkClass` in `src/components/ui/styles.ts` | the band's link | with `CtaBand` | Composes the existing `buttonBase` with a black fill and white label, so the sizing is shared rather than copied, and no `ButtonVariant` is added |
| `src/components/home/Hero.astro` | hero | none | Every other page opens differently |
| `src/components/home/ValueGrid.astro` | why choose us | none | Shape is specific to this page's copy |
| `src/components/home/DifferentiatorList.astro` | differentiators | none | Shape is specific to this page's copy |
| `src/components/home/CertificationRow.astro` | certification | none | Shape is specific to this page's copy |
| `src/scripts/counters.ts` | stats | wherever `StatsBand` lands | Mirrors how `Header.astro` imports `src/scripts/nav.ts` |

**Page composition** (the page owns tone; no component reads one):

| # | Section | Tone | Component | Content |
|---|---|---|---|---|
| 1 | Hero | `white` | `Hero` | `home.hero` |
| 2 | Why choose us | `tint` | `ValueGrid` | `home.whyChooseUs` |
| 3 | Company overview | `white` | `MediaText`, `imageSide="end"` | `home.overview` |
| 4 | Stats | `tint` | `StatsBand` | `home.stats.heading` plus `getStats(lang)` |
| 5 | Services | `white` | three `Card`s | `home.services` plus `getServices(lang)` |
| 6 | Global presence | `tint` | `MediaText`, `imageSide="start"` | `home.presence` |
| 7 | Differentiators | `white` | `DifferentiatorList` | `home.differentiators` |
| 8 | Certification | `tint` | `CertificationRow` | `home.certification` |
| 9 | Closing call to action | gold, its own band | `CtaBand` | `home.cta` |

**API surface**: none. Every page route in this project is prerendered (spec 0001), this page adds no endpoint, and it calls nothing at runtime.

**Value sourcing**:

| Action | Value produced or displayed | Source |
|---|---|---|
| Any getter call | the language | `resolveLocale(Astro.currentLocale)`, as every existing page does |
| Render head | title, description | `home.seo`, passed to `PageLayout` |
| Render hero | heading, subheading, photo, alt | `home.hero` |
| Render hero | primary and secondary button words and paths | `home.hero.primaryCta`, `home.hero.secondaryCta` (optional; absent renders one button) |
| Render hero | eager loading, fetch priority, widths, `sizes` | decided in this spec, not content: `loading="eager"`, `fetchpriority="high"`, `widths={[600, 900, 1200]}`, `sizes="(min-width: 64rem) 50vw, 100vw"`, because the photo is half the split at `lg` and full width below it |
| Render why choose us | heading, item titles and text | `home.whyChooseUs` |
| Render overview | heading, paragraphs, photo | `home.overview` |
| Render stats band | section heading | `home.stats.heading` |
| Render stats band | each number, suffix, label | `getStats(lang)`, the `stats` entry for the same language |
| Render stats band | the displayed number text | `Intl.NumberFormat(lang).format(value)`, computed at build |
| Counter script | the number to count to | a `data-count-to` attribute the band writes from `value`, so the script never parses a formatted string back into a number |
| Counter script | the locale to format with while counting | a `data-locale` attribute the band writes from the resolved locale. A browser script cannot see `Astro.currentLocale`, so without this attribute the count would format in the visitor's own locale and disagree with the value the page shipped |
| Counter script | duration, easing, trigger threshold | decided in this spec (1200ms, ease out, fires at 25 percent visible), not content |
| Render services | section heading and intro | `home.services` |
| Render services | each card's image, title, summary | `getServices(lang)`, ordered by `order` |
| Render services | each card's image `alt` | `service.image.alt ?? ''`. `Card` requires an `alt` string, but the shared image shape allows `decorative: true` with no `alt`, so the call site supplies the empty string, exactly as `Footer.astro` already does for the logo |
| Render services | each card's path | `/${slug}` from the entry's `slug`, the same field `[service].astro` builds its route from |
| Render presence | heading, paragraph, region names, photo | `home.presence` |
| Render presence | which side the photo sits on | decided in this spec (opposite the overview), not content |
| Render presence | the layout when the entry has no photo | decided in this spec: `presence.image` is optional in the schema, so `MediaText` renders a single centred column of copy and regions rather than half an empty grid |
| Render any section | the heading's `id` for `aria-labelledby` | decided in this spec: `<section>-heading`, one rule for all nine, so seven components do not each invent one |
| Render differentiators | heading, items | `home.differentiators` |
| Render certification | heading, text, badge names, badge images and alts | `home.certification` |
| Render closing call to action | heading, text, button word and path | `home.cta` |

**Key invariants**:

- Exactly one `h1` on the page, the hero heading. Sections are `h2`, item titles `h3`.
- The page owns tone. No new component takes a tone prop or reads a tone variable, which keeps the spec 0003 invariant intact. `CtaBand` is the exception that proves it: it is not a `Section` with a tone, it is its own band and it is always gold.
- Gold is never a word on this page. On the gold band the heading, the text, and the button fill are black; the button label is white on black.
- The gold band is the only place on the site where the focus ring is not `gold-ink`. It is black there, because `gold-ink` on full gold is 2.10:1. Anything focusable added to this band later inherits that override, not the sitewide one.
- The band's link is built from `ctaLinkClass`, never from `<Button>` with an override class. Tailwind's generated order, not the order classes appear in the attribute, decides which background utility wins, so an override would be a silent coin flip.
- The finished numbers are in the HTML before any script runs. The script only replaces text that is already correct.
- The services grid is a contract of exactly three. A fourth entry stops the build rather than silently reflowing the row.
- No component on this page ships client JavaScript except `StatsBand`, and that one script degrades to nothing.
- Class strings stay written out in full inside a `cx` call, per spec 0003, so Tailwind can find them.

**Security model**: a public, prerendered page. No authentication, no authorisation, no visitor input, no personal data, no runtime request. Content is read at build only, so nothing a visitor sends can reach it. No compliance scope applies.

**Configuration required**: none. No new environment variable, secret, or third party account.

**Critical test scenarios**:

- Happy path: the built `index.html` holds all nine sections in order, every string traceable to a content file, one `h1`, verifies **AC-1**, **AC-2**, **AC-11**.
- Failure case: adding a fourth entry to `src/content/services/en/` fails `pnpm build` with a message naming the collection, the language, and the count, verifies **AC-4**.
- No script case: with JavaScript disabled, the stat numbers read as their finished grouped values and the page stays fully usable, verifies **AC-5**, **AC-6**.
- Reduced motion: with `prefers-reduced-motion: reduce` set, scrolling the band into view changes no number, verifies **AC-6**.
- Loading behaviour: on a throttled connection the hero photo is requested first and nothing on the page shifts as later images arrive, verifies **AC-12**.
- Responsive: at 360px, 768px, and 1280px the page never scrolls sideways and the services row reflows from one column to three, verifies **AC-13**.
- Focus on the exception: tabbing to the gold band's link shows a black ring that is clearly visible against the gold, and no other focus ring on the page changed, verifies **AC-18**.
- Optional content: removing `presence.image` still builds and renders a single centred column rather than half an empty grid, verifies **AC-7**.

## Build plan

Sliced by the project's Skateboard approach. Milestone 1 is the thinnest genuinely usable whole page: all nine sections, real content, correct numbers, correct images, and no script at all. Everything after it adds one thing to a page that already works, which is also the only order in which the no script baseline can honestly be proven.

Image loading sits inside milestone 1 rather than in a later pass, because `loading`, `sizes`, and a reserved aspect ratio cost nothing while a component is being written and a great deal once eight components exist.

**Milestone 1: the whole page stands up, with no script** (done)

1. Build `src/components/ui/MediaText.astro`: heading with an `id` of `<section>-heading`, paragraphs, an optional list slot, an optional image with `imageSide` of `start` or `end`, stacking to copy then image on mobile, lazy image with a reserved aspect ratio, and a single centred column when there is no image, satisfies **AC-7**, **AC-11**, **AC-12**.
2. Build `src/components/ui/StatsBand.astro`: a heading and one item per stat, each rendering `Intl.NumberFormat(lang).format(value)` plus its suffix and label, each carrying `data-count-to`, and the band carrying `data-locale`. No script yet, satisfies **AC-5**.
3. Add `ctaLinkClass` to `src/components/ui/styles.ts`, composing `buttonBase` with the black fill, the white label, and the black focus outline override, then build `src/components/ui/CtaBand.astro`: its own full width gold band with a black heading and text and a link using that class, taking no tone prop and never importing `Button`, satisfies **AC-10**, **AC-18**.
4. Build `src/components/home/Hero.astro`: the split, the single `h1`, both calls to action with the secondary one optional, and the photo eager with `fetchpriority="high"`, `widths={[600, 900, 1200]}`, and `sizes="(min-width: 64rem) 50vw, 100vw"`, satisfies **AC-3**, **AC-12**.
5. Build `src/components/home/ValueGrid.astro`, `DifferentiatorList.astro`, and `CertificationRow.astro`: the responsive grid, the marked list, and the centred badge row with names beneath, all typographic with no new icon, satisfies **AC-8**, **AC-9**.
6. Rewrite `src/pages/index.astro` to compose all nine sections in order with the tones in the composition table, reading `getHomePage`, `getStats`, and `getServices` for the resolved locale, rendering the services row as three `Card`s linking `/{slug}` with `alt={service.image.alt ?? ''}`, giving every section a `labelledBy` of `<section>-heading`, and passing `home.seo` to `PageLayout`, satisfies **AC-1**, **AC-2**, **AC-4**, **AC-11**, **AC-15**.
7. Check the page against a real preview at 360px, 768px, and 1280px: no sideways scrolling, the services row reflowing one to two to three, tap targets at 44px, satisfies **AC-13**.

**Milestone 2: the numbers move** (done)

8. Write `src/scripts/counters.ts`: one `IntersectionObserver` at a 25 percent threshold that unobserves after firing, a `requestAnimationFrame` ease out over 1200ms formatting each frame with `Intl.NumberFormat` and the band's `data-locale`, and an immediate return when `prefers-reduced-motion: reduce` matches, satisfies **AC-6**.
9. Import it from one `<script>` in `StatsBand.astro`, the way `Header.astro` imports `nav.ts`, then confirm with the script blocked that the finished numbers still read correctly, satisfies **AC-6**, **AC-14**.

**Milestone 3: the guard** (done)

10. Add the exactly three services rule to the cross entry checks in `src/lib/content.ts`, so it runs from the single `content-gate` call site and fails the build with a message naming the collection, the language, and the count. Prove it by adding and then removing a fourth entry, satisfies **AC-4**.

**Milestone 4: written down and gated** (done)

11. Add `StatsBand`, `MediaText`, and `CtaBand` sections to `docs/design.md` under `## Components`, add the black on gold and white on black pairs to the contrast table, and record the band's black focus ring as the one documented exception to the `## Focus and motion` rule. Add a tile for each to `/styleguide`, satisfies **AC-16**, **AC-18**.
12. Run `pnpm check`, `pnpm lint`, and `pnpm build`, and confirm `dist/client/` still holds one HTML file per route and the built home page holds no `astro-island`, satisfies **AC-14**, **AC-17**.

## Consequences

**Positive**:

- The home page is entirely editable from content files, so replacing placeholder copy before launch touches no code.
- Features 7 and 8 start with three of their sections already built and documented, which is most of what About needs and the ending every service page needs.
- The page carries one small script that degrades to nothing, so the zero JavaScript default in `AGENTS.md` survives its first real page.
- Deciding the hero's loading behaviour now means feature 12 tunes a page that is already close, rather than fixing a known miss.

**Negative and tradeoffs**:

- Seven new components for one page is real surface area, and three of them are promoted into the design system on the strength of a planned reuse rather than an observed one. If About turns out to want a different stats treatment, `StatsBand` will need a prop it does not have yet.
- The exactly three rule makes the build fail on a change the scope elsewhere calls easy. Feature 8 says adding a fourth service should be a data entry and a route; with this rule it is also a deliberate decision about the home page. That is the point, and it is still a speed bump someone will hit.
- `CtaBand` names its own colours instead of going through `Section` and `Button`, so a background and a button treatment are now decided in two places. A palette change has to visit both.
- The gold band is the site's first documented exception to the sitewide focus ring. One exception is fine and two would be a pattern, so the next component that wants a non standard ring should be treated as a sign that spec 0003 needs revisiting rather than another exception.
- The counter carries the locale in a `data-` attribute purely because a browser script cannot see `Astro.currentLocale`. It is a small, slightly awkward seam, and it is load bearing for the second language.
- The page ends on a gold band that only this page has. Until feature 8 reuses `CtaBand`, it reads as a one off.

**Neutral**:

- No schema, content entry, or getter changes, so spec 0002 is untouched by this feature.
- `docs/design.md` gains three component entries and two contrast pairs, which is content spec 0003 owns. The entries are added; the tokens are not.
- Nine sections make a long page. Feature 11 will want to look at whether the heading order still reads well once real copy replaces the placeholders.

## Follow-up

- [ ] When a fourth service genuinely arrives, decide what the home page shows: a two by two grid, or a curated three with the rest living on the service pages. Until then the build stops, which is the intended prompt to make that call deliberately.
- [ ] Spec 0003 is `Accepted` and its component list does not include these three. `/sync` should reconcile `docs/design.md` and the spec 0003 component inventory once this feature is built, so the design system's written record stays complete.
- [ ] If feature 7 finds that About wants a different stats layout, revisit whether `StatsBand` takes a variant prop or About gets its own composition.

## Rationale

Reasoning and options: see [rationale.md](rationale.md).
