# 0005. Compose the home page from content with three shared bands and one counter script

**Date**: 2026-09-21 (hero revised to the reference overlay; first written 2026-09-20)
**Status**: In Progress
**Scope feature**: 6, Home page (`docs/scope/scope.md`)

## Summary

The home page renders the nine sections spec 0002 already models, in the order the scope lists, with every word and image coming from `src/content/home/en/home.yaml`, the `stats` entry, and the three `services` entries. Nothing on the page is written into a component.

Three of the pieces are built as shared design system components, because a later Release 1 page already needs each one: a stats band (About reuses it), a media plus text split (About, plus the overview and presence sections here), and a closing call to action band (the service pages reuse it). The four pieces only this page wants stay in `src/components/home/`.

The page ships one small script, the counter that animates the stat numbers once when they scroll into view. The finished numbers are in the HTML before it runs, so with no JavaScript, or with reduced motion asked for, the visitor simply sees the final figures. The page hydrates no React at all.

**Revised 2026-09-21, the hero.** The opening split is replaced by the reference hero: one photo filling the first screen, a centred see through dark panel (a "scrim") holding the white heading and subheading, one gold button under it, and three dots that are pure decoration. The hero slides up under the header, which spec 0004 now draws as a floating white card. The scrim is dark enough that white text stays readable over any photo, so swapping the photo never needs a contrast check. Focus now follows two rules instead of one rule plus an exception: the gold ink ring on the two light tones, and a black and white double ring on everything else (the photo and the gold band).

## Requirements

**User stories**:

- As a prospective client landing on the site for the first time, I want to see what this company does, what it has delivered, and how to start a conversation, without scrolling through a wall of text.
- As a visitor on a phone on a slow connection, I want the page readable immediately and not jumping around as images arrive.
- As someone editing the site, I want to change any headline, paragraph, number, or photo by editing a content file, never a component.
- As a keyboard or screen reader user, I want the page to read in a sensible heading order and every image to carry a real description.
- As a first time visitor, I want the opening screen to be one strong photo with the offer readable on top of it and one obvious next step, so I know in a glance what this company does and where to click.

**Acceptance criteria**:

- **AC-1**: The page renders exactly nine sections in this order: hero, why choose us, company overview, stats, services, global presence, differentiators, certification, closing call to action. The reference site's "Delivering Precision BIM & Revit Modeling" section is absent.
- **AC-2**: Every headline, paragraph, list item, number, label, button word, and image on the page comes from a content entry. `src/pages/index.astro` and every component it uses contain no visible copy of their own.
- **AC-3** (revised 2026-09-21): The hero is a full bleed band at least the small viewport height (`min-h-svh`), growing taller whenever its content needs more room, so on a short landscape phone nothing overflows or overlaps. The photo fills the whole band, cropped to cover and centred. Centred on it, at the content width (`max-w-content`, full width minus the gutters on a phone), sits one `bg-scrim` panel holding the page's only `h1` and the subheading in `text-lead`, both white and centred. Under the panel sits one primary `Button` from `home.hero.primaryCta`, and at the bottom of the band the three dots of AC-20. Panel, button, and dots stack in that order at every breakpoint and never overlap one another.
- **AC-4**: The services section renders one `Card` per `services` entry for the page's language, ordered by `order`, each showing the entry's image, title, and summary, and linking to `/{slug}`, the same path `[service].astro` builds. When the collection does not hold exactly three entries for a language, the build fails with a message naming the collection, the language, and the count found.
- **AC-5**: The stats band renders one item per `stats` entry item: the number grouped for the entry's language (so `1200` reads as `1,200`), its suffix when it has one, and its label. The finished numbers are present in the built HTML.
- **AC-6**: The numbers count up once, the first time the band enters the viewport, and never again. With JavaScript unavailable, or with `prefers-reduced-motion: reduce` set, no animation runs and the finished numbers are what the visitor sees.
- **AC-7**: The overview and presence sections both render through one shared media plus text component, with the photo on opposite sides so the two do not read as the same block twice. The presence section lists its region names. The image is optional, because `presence.image` is optional in the schema: with no image the component renders a single centred column of copy and list rather than an empty half.
- **AC-8**: The why choose us items render in a grid of one column on mobile, two at `md`, and three at `lg`, for any number of items the entry holds. The differentiators render as a marked list. Neither uses an icon, and the map in `Icon.astro` is unchanged.
- **AC-9**: The certification section renders its badges in a centred row with each badge's name beneath its image, wrapping to a column on a narrow screen. Each badge image carries the alt text from its entry.
- **AC-10**: The closing call to action renders as a self contained gold band: black heading and text on full gold, and a black filled link with a white label. `Section` still offers exactly two tones and `Button` exactly two variants; neither gains a prop for this.
- **AC-18** (revised 2026-09-21): The site has two focus rules and no exceptions. On the two light tones, the sitewide 2px `gold-ink` outline at a 2px offset, unchanged. On every surface that is not a light tone, today the hero photo and the gold band, a two colour ring: a 2px black band directly around the control and a 2px white band outside it. It comes from one `focus-contrast` utility in `global.css` placed on the band's `<section>`, so everything focusable inside inherits it and no control sets its own ring colour. `ctaLinkClass` loses its `focus-visible:outline-black`. Mouse clicks still show nothing.
- **AC-11**: The page has exactly one `h1`. Each of the nine sections carries its own `h2` and points at it with `aria-labelledby`, using one naming rule: the heading's id is `<section>-heading`, for example `services-heading`. Item titles inside a section are `h3`.
- **AC-12** (hero part revised 2026-09-21): The hero photo loads eagerly with a high fetch priority, `sizes="100vw"`, and widths from `heroWidths(image.src.width)`: 640, 960, 1280, and 1920 where each is below the source width, plus the source width itself capped at 2560. Today's 1600px file therefore yields 640, 960, 1280, 1600, and a wider file later gains the larger steps with no code change. The photo is positioned to fill the band, so it takes no layout space of its own and cannot shift anything as it arrives. Every other image on the page loads lazily and reserves its space, so nothing moves as images arrive. Every image either carries alt text or is marked decorative.
- **AC-13**: The page renders correctly at mobile, `md`, and `lg` with no sideways scrolling at any width, and every tap target stays at least 44px.
- **AC-14**: The only JavaScript the page loads is the existing nav bundle plus the counter module. No `astro-island` appears in the built HTML.
- **AC-15**: The page's title and description come from `home.seo` and reach the document through `PageLayout`.
- **AC-16**: The three shared components each have a `docs/design.md` entry under `## Components` and a tile on `/styleguide`.
- **AC-17**: `pnpm check`, `pnpm lint`, and `pnpm build` all run clean, and `dist/client/` still holds exactly one HTML file per route and nothing more.
- **AC-19** (added 2026-09-21): White text on the scrim reaches at least 4.5:1 over any photo pixel. The scrim is the token `--color-scrim`, black at 60 percent. Its worst case is white text over a pure white pixel seen through the scrim, a composite of about `#666666`, which measures 5.74:1, so no photo swap can lower the ratio. The band's own background is black, so a photo that fails to load leaves white copy on a dark band rather than on white.
- **AC-20** (added 2026-09-21): The three dots are decoration. They are three plain elements inside one `aria-hidden="true"` wrapper: not buttons, not links, not focusable, default cursor. The first is solid white, the other two white at half opacity. The accessibility tree holds no trace of them, and tabbing through the hero reaches the button and nothing else.
- **AC-21** (added 2026-09-21): The home hero starts at the very top of the page, behind the header card. It pulls itself up by `--header-h` and pads its content down by the same amount, so the panel centres in the visible area below the card and no copy, button, or dot sits under the header at load. Only the home hero does this; every other page's first band still starts below the header (spec 0004, AC-4). One accepted case: on a phone with JavaScript off, the mobile menu stays open inside the header (spec 0004, AC-7), so the header is far taller than `--header-h` and the hero starts below the open menu rather than at the top. The matching top padding means nothing is hidden, so the hero is simply lower on that page, like any other page's first band.
- **AC-22** (added 2026-09-21): `secondaryCta` is removed from the `home` hero schema in `src/content.config.ts` and from `src/content/home/en/home.yaml`, and the hero object becomes a `z.strictObject`, so an entry that still carries `secondaryCta`, or any other unknown hero key, fails the build naming the key instead of being dropped without a word. `Hero.astro` takes no `secondaryCta` prop.
- **AC-23** (added 2026-09-21): `Section`, `CtaBand`, and the hero take their side gutters, vertical rhythm, and content widths from shared class strings in `src/components/ui/styles.ts` (`bandGutterClass`, `bandPaddingClass`, `bandWidthClass`), so those values are written once. `Section`'s props and output are unchanged: still two light tones, still `default` and `narrow`.
- **AC-24** (added 2026-09-21): `docs/design.md` records `--color-scrim` in the colour table, the white on scrim pair (5.74:1 worst case) in the contrast table, the two focus rules in `## Focus and motion` in place of the single exception, and the shared band frame under `Section`. The black on gold ring row becomes the two colour ring row. `/styleguide` shows the two colour ring on a photo swatch and on the gold band.

## Decision

**Chosen option**: Option 1: content driven Astro composition, split by reuse, with one plain counter script.

The page is composed in `src/pages/index.astro` from the existing primitives plus seven new components, three of which enter the design system because a later Release 1 page already needs them, and one plain script enhances numbers that are already correct in the HTML.

**Revision 2026-09-21**: the hero is rebuilt as its own full bleed photo band (like `CtaBand`, not a `Section` tone) that shares `Section`'s frame through class strings in `styles.ts`, carries its contrast guarantee in one `--color-scrim` token, and adopts the two ring focus rule that the gold band now shares.

**Implementation skills**: `astro` (`astrolicious/agent-skills`, `.agents/skills/astro/`) · `tailwind-4-docs` (`lombiq/tailwind-agent-skills`, `.agents/skills/tailwind-4-docs/`)

## Feature design

**Design source** (revision 2026-09-21): the reference screenshot the engineer supplied with the revision (a full bleed model photo, a wide centred gray see through panel of white copy, a gold button under it, three dots near the bottom edge, and a white header card with rounded bottom corners over the top). The handwritten note on it, "Show Simple Image", is read as one plain photo, not a slider. Tokens, type, and components still come from `docs/design.md`.

**Data model sketch**: one change (2026-09-21). `home.hero` drops `secondaryCta` and becomes a strict object: `{ heading, subheading, image, primaryCta }`, unknown keys fail the build. Nothing else in the collections spec 0002 defined is added or altered.

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
| `ctaLinkClass` in `src/components/ui/styles.ts` | the band's link | with `CtaBand` | Composes the existing `buttonBase` with a black fill and white label, so the sizing is shared rather than copied, and no `ButtonVariant` is added. From 2026-09-21 it carries no ring colour; the band's `focus-contrast` supplies it |
| `bandGutterClass`, `bandPaddingClass`, `bandWidthClass` in `src/components/ui/styles.ts` (2026-09-21) | the hero's frame | `Section`, `CtaBand` | The side gutters (`px-4 md:px-6 lg:px-8`), the vertical rhythm (`py-16 md:py-20 lg:py-24`), and the two content widths (`default` gives `mx-auto w-full max-w-content`, `narrow` gives `mx-auto w-full max-w-narrow`), written once so three bands cannot drift |
| `focus-contrast` utility in `src/styles/global.css` (2026-09-21) | the hero's button | `CtaBand` | Placed on a band's `<section>`; every `:focus-visible` inside gets a white 2px outline at a 2px offset plus a 2px black `box-shadow` filling the gap |
| `src/components/home/Hero.astro` | hero (rebuilt 2026-09-21 as the full bleed photo band) | none | Every other page opens differently |
| `src/components/home/ValueGrid.astro` | why choose us | none | Shape is specific to this page's copy |
| `src/components/home/DifferentiatorList.astro` | differentiators | none | Shape is specific to this page's copy |
| `src/components/home/CertificationRow.astro` | certification | none | Shape is specific to this page's copy |
| `src/scripts/counters.ts` | stats | wherever `StatsBand` lands | Mirrors how `Header.astro` imports `src/scripts/nav.ts` |

**Page composition** (the page owns tone; no component reads one):

| # | Section | Tone or surface | Component | Content |
|---|---|---|---|---|
| 1 | Hero | photo under a scrim, its own band (2026-09-21) | `Hero` | `home.hero` |
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
| Render hero | heading, subheading, photo, alt | `home.hero` (the alt keeps coming from the entry; the photo carries meaning, and the schema still allows `decorative: true`) |
| Render hero | the button word and path | `home.hero.primaryCta`. There is no second button (AC-22) |
| Render hero | eager loading, fetch priority, `sizes` | decided in this spec, not content: `loading="eager"`, `fetchpriority="high"`, `sizes="100vw"`, because the photo is full bleed at every width |
| Render hero | the widths to generate | `heroWidths(image.src.width)`, a pure function in `Hero.astro`: `[640, 960, 1280, 1920]` filtered to those below `min(width, 2560)`, then that cap appended. Astro reads the source width at build from the imported image |
| Render hero | the photo's crop | decided in this spec: `object-cover object-center`. No focal point field; a photo that crops badly is swapped, not tuned |
| Render hero | the scrim colour and its contrast | the `--color-scrim` token, `rgb(0 0 0 / 0.6)`, added to `global.css` (AC-19) |
| Render hero | the band's background under the photo | decided in this spec: `bg-black`, the colour a failed image falls back to |
| Render hero | the band's height | decided in this spec: `min-h-svh` (AC-3) |
| Render hero | how far it pulls up and pads down | `--header-h`, declared once in `PageLayout` (spec 0004): `-mt-(--header-h)` on the band, `pt-(--header-h)` on the content column |
| Render hero | the panel's width, padding, and corner | `bandWidthClass.default` for the width (AC-3). Padding `px-6 py-8 md:px-10 md:py-10` and `rounded-ui`, decided in this spec: spec 0003 gives every panel and image the one `ui` radius |
| Render hero | the gap between panel and button, and the dots' place | decided in this spec: `mt-8` under the panel. The dots sit in the band's flex column after the centred content, with `pb-8`, so they are pushed to the bottom and can never overlap the button |
| Render hero | how many dots and which is filled | decided in this spec, not content: three, the first `bg-white`, the others `bg-white/50`, each `size-2.5 rounded-full`, in an `aria-hidden` wrapper of `flex justify-center gap-2 pb-8` so the row is centred |
| Render hero | the widths when the source is narrower than 640px | `heroWidths` returns the single source width. Astro accepts one width, so there is no special case |
| Render hero | the focus ring on the button | the `focus-contrast` utility on the band's `<section>` (AC-18) |
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
- Gold is never a word on this page. On the gold band the heading, the text, and the button fill are black; the button label is white on black. On the hero the only gold is the primary button's fill, carrying its black label (8.73:1).
- Two focus rules, no exceptions (2026-09-21): `gold-ink` on the two light tones, the `focus-contrast` double ring on every other surface. The rule belongs to the surface, not the control, so `focus-contrast` sits on the band's `<section>` and anything focusable added to the hero or the gold band later inherits it. A new dark or photo surface adds the utility; it never invents a third ring.
- Text on the photo is white and sits only on the scrim, never straight on the photo. The dots are the one thing drawn directly on the photo, and they are decoration hidden from assistive tech.
- `Section` stays two light tones. A band that is not light (the hero, the gold band) is its own component that borrows `Section`'s frame classes and never adds a tone to `Section`.
- Nothing between the header and the hero may clip or scroll (2026-09-21). `<main>` stays a plain block: no `overflow: hidden`, no `overflow: auto`, no `contain: paint`. Any of them would cut off the part of the hero pulled up under the header, and only a visual check would notice.
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
- Two focus rules: tabbing to the hero button and to the gold band's link each shows the black inside, white outside double ring, clearly visible against the photo and the gold; every control on a white or tint section still shows the gold ink ring, verifies **AC-18**.
- The hero at a glance: at 360px, 768px, 1280px, and 1920px the photo fills the first screen, the panel is centred in the area below the header card, the button sits under it, the dots sit at the bottom, and nothing is hidden under the header at load, verifies **AC-3**, **AC-21**.
- Short screen: at 740 by 360 (a landscape phone) the hero grows taller than the screen instead of clipping, and panel, button, and dots never overlap, verifies **AC-3**.
- Worst case contrast: temporarily point `hero.image` at a plain white image; the white heading and subheading still read, and the scrim's composite measures `#666666` (5.74:1) in the browser's colour picker, verifies **AC-19**.
- Broken photo: block the hero image request; the band is black and the copy still reads, verifies **AC-19**.
- Dots are silent: the accessibility tree shows no dot, and Tab from the header goes to the hero button and then straight on to the next section, verifies **AC-20**.
- Only home overlaps: on `/about-us` the page's `h1` starts fully below the header card, verifies **AC-21**.
- No JavaScript on a phone: at 390px with JavaScript off, `/` shows the open menu inside the header and then the whole hero below it, with the panel, button, and dots fully visible and nothing hidden under the header, verifies **AC-21**.
- Strict hero: adding `secondaryCta` back to `home.yaml` fails `pnpm build` with a message naming the key, verifies **AC-22**.
- Optional content: removing `presence.image` still builds and renders a single centred column rather than half an empty grid, verifies **AC-7**.

## Build plan

Sliced by the project's Skateboard approach. Milestone 1 is the thinnest genuinely usable whole page: all nine sections, real content, correct numbers, correct images, and no script at all. Everything after it adds one thing to a page that already works, which is also the only order in which the no script baseline can honestly be proven.

Image loading sits inside milestone 1 rather than in a later pass, because `loading`, `sizes`, and a reserved aspect ratio cost nothing while a component is being written and a great deal once eight components exist.

**Milestone 1: the whole page stands up, with no script** (done)

1. Build `src/components/ui/MediaText.astro`: heading with an `id` of `<section>-heading`, paragraphs, an optional list slot, an optional image with `imageSide` of `start` or `end`, stacking to copy then image on mobile, lazy image with a reserved aspect ratio, and a single centred column when there is no image, satisfies **AC-7**, **AC-11**, **AC-12**.
2. Build `src/components/ui/StatsBand.astro`: a heading and one item per stat, each rendering `Intl.NumberFormat(lang).format(value)` plus its suffix and label, each carrying `data-count-to`, and the band carrying `data-locale`. No script yet, satisfies **AC-5**.
3. Add `ctaLinkClass` to `src/components/ui/styles.ts`, composing `buttonBase` with the black fill, the white label, and the black focus outline override, then build `src/components/ui/CtaBand.astro`: its own full width gold band with a black heading and text and a link using that class, taking no tone prop and never importing `Button`, satisfies **AC-10**, **AC-18**.
4. (Built as first specified; superseded on 2026-09-21 by tasks 16 to 18, which rebuild the hero to the revised AC-3 and AC-12.) Build `src/components/home/Hero.astro`: the split, the single `h1`, both calls to action with the secondary one optional, and the photo eager with `fetchpriority="high"`, `widths={[600, 900, 1200]}`, and `sizes="(min-width: 64rem) 50vw, 100vw"`, satisfies **AC-3**, **AC-12**.
5. Build `src/components/home/ValueGrid.astro`, `DifferentiatorList.astro`, and `CertificationRow.astro`: the responsive grid, the marked list, and the centred badge row with names beneath, all typographic with no new icon, satisfies **AC-8**, **AC-9**.
6. Rewrite `src/pages/index.astro` to compose all nine sections in order with the tones in the composition table, reading `getHomePage`, `getStats`, and `getServices` for the resolved locale, rendering the services row as three `Card`s linking `/{slug}` with `alt={service.image.alt ?? ''}`, giving every section a `labelledBy` of `<section>-heading`, and passing `home.seo` to `PageLayout`, satisfies **AC-1**, **AC-2**, **AC-4**, **AC-11**, **AC-15**.
7. Check the page against a real preview at 360px, 768px, and 1280px: no sideways scrolling, the services row reflowing one to two to three, tap targets at 44px, satisfies **AC-13**.

**Milestone 2: the numbers move** (done)

8. Write `src/scripts/counters.ts`: one `IntersectionObserver` at a 25 percent threshold that unobserves after firing, a `requestAnimationFrame` ease out over 1200ms formatting each frame with `Intl.NumberFormat` and the band's `data-locale`, and an immediate return when `prefers-reduced-motion: reduce` matches, satisfies **AC-6**.
9. Import it from one `<script>` in `StatsBand.astro`, the way `Header.astro` imports `nav.ts`, then confirm with the script blocked that the finished numbers still read correctly, satisfies **AC-6**, **AC-14**.

**Milestone 3: the guard** (done)

10. Add the exactly three services rule to the cross entry checks in `src/lib/content.ts`, so it runs from the single `content-gate` call site and fails the build with a message naming the collection, the language, and the count. Prove it by adding and then removing a fourth entry, satisfies **AC-4**.

**Milestone 4: written down and gated** (done)

11. (Built as first specified; the focus exception part is superseded on 2026-09-21 by task 20, which replaces it with the two focus rules.) Add `StatsBand`, `MediaText`, and `CtaBand` sections to `docs/design.md` under `## Components`, add the black on gold and white on black pairs to the contrast table, and record the band's black focus ring as the one documented exception to the `## Focus and motion` rule. Add a tile for each to `/styleguide`, satisfies **AC-16**, **AC-18**.
12. Run `pnpm check`, `pnpm lint`, and `pnpm build`, and confirm `dist/client/` still holds one HTML file per route and the built home page holds no `astro-island`, satisfies **AC-14**, **AC-17**.

**Milestone 5: the reference hero** (added 2026-09-21)

Still Skateboard: the page already works end to end, so this milestone swaps one section for its new form in one slice and keeps every step shippable. Build it after spec 0004's milestone 5 (the header card), because the hero's overlap only reads correctly once the header is a card. The two ring rule goes in first because it changes a band that already exists and is the part most likely to surprise.

13. Add `--color-scrim: rgb(0 0 0 / 0.6)` to the colour block of `@theme` in `src/styles/global.css` with a comment giving the 5.74:1 worst case. Add a `@utility focus-contrast` that, for every `:focus-visible` inside the element (a nested `& :focus-visible`), sets `outline-color: var(--color-white)` and `box-shadow: 0 0 0 2px var(--color-black)`, keeping the base 2px width and 2px offset. The nested descendant form has not been used in this repo yet, so confirm with a build that the generated CSS holds the `.focus-contrast :focus-visible` rule. If it does not, write that rule as plain CSS in `global.css` instead; its specificity still beats the base `:focus-visible`, satisfies **AC-18**, **AC-19**.
14. Move `CtaBand` onto the rule: put `focus-contrast` on its `<section>` and drop `focus-visible:outline-black` from `ctaLinkClass`, rewriting that comment, satisfies **AC-18**.
15. Add `bandGutterClass`, `bandPaddingClass`, and `bandWidthClass` to `src/components/ui/styles.ts`, each written out in full inside `cx`, and make `Section` and `CtaBand` build their classes from them with no visible change, satisfies **AC-23**.
16. Make the `home` hero a `z.strictObject` without `secondaryCta` in `src/content.config.ts`, remove `secondaryCta` from `src/content/home/en/home.yaml` in the same commit, and drop the prop from `index.astro`, satisfies **AC-22**.
17. Rebuild `src/components/home/Hero.astro`: a `<section aria-labelledby>` with `relative isolate -mt-(--header-h) flex min-h-svh flex-col bg-black focus-contrast` plus `bandGutterClass`; the `<Image>` absolutely filling it behind the content (`absolute inset-0 -z-10 size-full object-cover object-center`), eager, high priority, `sizes="100vw"`, widths from the pure `heroWidths` function; a content column `flex flex-1 flex-col items-center justify-center pt-(--header-h)` wrapping a block with `bandPaddingClass`; inside it the panel (`bandWidthClass.default`, `bg-scrim rounded-ui px-6 py-8 md:px-10 md:py-10 text-center`) holding the white `h1` (`text-balance text-white`) and the white `text-lead` subheading; the primary `Button` at `mt-8`; and after the content column the `aria-hidden` dot row (`flex justify-center gap-2 pb-8`). The heading keeps taking `headingId` from the page. The negative variable form `-mt-(--header-h)` is new to this repo (only the positive `h-(--header-h)` is proven), so confirm in the built CSS that it emits `margin-top: calc(var(--header-h) * -1)`. If not, add a small `@utility` named for the job (for example `pull-under-header`) that writes exactly that, satisfies **AC-3**, **AC-12**, **AC-19**, **AC-20**, **AC-21**.
18. In `src/pages/index.astro`, render the hero as its own band (no longer inside `<Section tone="white">`), passing `labelledBy` through as `headingId` so AC-11 still holds, satisfies **AC-1**, **AC-11**, **AC-21**.
19. Check a real preview at 360px, 768px, 1280px, 1920px, and 740 by 360: the first screen is all photo, the panel sits centred below the card, the dots never touch the button, nothing scrolls sideways, and `/about-us` is not overlapped, satisfies **AC-3**, **AC-13**, **AC-21**.
20. Update `docs/design.md` (the scrim token, the white on scrim pair, the two focus rules replacing the exception, the band frame under `Section`, the ring row on the gold band) and `/styleguide` (the double ring on a photo swatch and on `CtaBand`, whose caption stops calling it the one exception), satisfies **AC-24**.
21. Run `pnpm check`, `pnpm lint`, and `pnpm build`; confirm one HTML file per route, no `astro-island`, and that the built hero `<img>` carries `fetchpriority="high"` with a `srcset` ending at `1600w`, satisfies **AC-12**, **AC-14**, **AC-17**.

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
- (2026-09-21) The site now has two bands that are not a `Section`, the hero and the gold band. Sharing the frame classes keeps their gutters honest, but a reader has to know that "not a light tone" means "its own component", and a third such band should prompt a look at whether `Section` wants a real third tone after all.
- (2026-09-21) The scrim hides a large share of the photo behind a dark panel. That is the price of a guarantee that holds for any photo; a lighter panel would need a contrast check every time the photo changes.
- (2026-09-21) The three dots mimic slider controls that do not exist. Some pointer users will click them and nothing will happen. Hiding them from assistive tech keeps them honest for screen reader users only.
- (2026-09-21) Dropping `secondaryCta` removes the hero's path to `/project`. Visitors reach it from the nav and the services cards instead.
- (2026-09-21) `--header-h` now has a fourth reader, the home hero. The header's height, the mobile panel's offset, and the hero's pull up and padding all move together only because they read the same property; changing the header's height anywhere else (a padding, a taller logo) without changing `--header-h` would slide the hero's copy under the card.
- (2026-09-21) Until a photo at least 2560px wide lands, screens wider than 1600px stretch the hero photo slightly, and it will look soft on a large monitor.
- (2026-09-21) The gold band's ring changes from plain black to the double ring. It is still clearly visible, but it is a visible change to a band spec 0005 already shipped.

**Neutral**:

- No getter changes. The one schema change (2026-09-21) is the strict hero without `secondaryCta`; spec 0002's home row is edited to match.
- (2026-09-21) The two new tokens (`--color-scrim` here, `--radius-card` from spec 0004) and the two ring rule change spec 0003's token table and its focus criterion; spec 0003 carries dated lines pointing back here.
- `docs/design.md` gains three component entries and two contrast pairs, which is content spec 0003 owns. The entries are added; the tokens are not.
- Nine sections make a long page. Feature 11 will want to look at whether the heading order still reads well once real copy replaces the placeholders.

## Follow-up

- [ ] When a fourth service genuinely arrives, decide what the home page shows: a two by two grid, or a curated three with the rest living on the service pages. Until then the build stops, which is the intended prompt to make that call deliberately.
- [ ] Spec 0003 is `Accepted` and its component list does not include these three. `/sync` should reconcile `docs/design.md` and the spec 0003 component inventory once this feature is built, so the design system's written record stays complete.
- [ ] If feature 7 finds that About wants a different stats layout, revisit whether `StatsBand` takes a variant prop or About gets its own composition.
- [ ] Before launch, replace `src/assets/images/home/hero.jpg` with a photo at least 2560px wide (a BIM model render fits the reference best) and update its alt in `home.yaml`. It is a content swap; `heroWidths` picks up the larger sizes on its own. Feature 12 is the natural owner.
- [ ] `verify.md` still carries the "Remove `secondaryCta`" drill for the old AC-3. `/check verify` should replace it with the strict hero drill and add the new hero, contrast, and focus steps from the critical test scenarios.

## Rationale

Reasoning and options: see [rationale.md](rationale.md).
