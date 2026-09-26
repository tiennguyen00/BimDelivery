# 0010. Compose the About Us page from content as three reference bands, with CSS first motion

**Date**: 2026-09-24
**Status**: In Progress
**Scope feature**: 7, About Us page (`docs/scope/scope.md`)

## Summary

The About Us page gets the layout of the reference screenshots, as three bands: a centred "About" heading with a paragraph and the company's numbers, a two column band with a ruled heading and paragraph on the left and an Experience / Expertise accordion on the right, and an ISO certification band on the diagonal stripe with the badges. Everything the page shows comes from content: a rewritten `about` entry, the shared `stats` entry, and the badge list the footer already uses (the footer hides its own badge panel on this page so the badges never show twice).

It is a temporary layout you will polish later, but it is still built from content and shared components, so the polish is a content and style pass, not a rewrite. The copy is placeholder text shaped like the reference and written for BIM Delivery.

Motion adds no script: the top band fades and rises in on page load with pure CSS, the two lower bands use the site's existing scroll reveal, the numbers use the existing counter, and the accordion (the browser's own `<details>` element, one item open at a time) slides open with CSS where the browser supports it. With no JavaScript or with reduced motion asked for, the whole page is simply there.

## Requirements

**User stories**:

- As a prospective client, I want to read who the company is, its numbers, its experience and tools, and its certifications on one page, so I can judge whether to get in touch.
- As a visitor on a phone, I want the same content in one readable column with nothing sideways scrolling.
- As a keyboard or screen reader user, I want the accordion to open and close with the keyboard and to be announced as expandable, and the headings to run in order.
- As someone editing the site, I want to change any word, number, accordion item, or badge in a content file, never in a component.

**Acceptance criteria**:

- **AC-1**: `/about-us` renders exactly three bands, in this order, then the footer: the about band (AC-5), the capability band (AC-7), and the certification band (AC-10). The page shows no photo, no highlights list, no stats heading, and no story body.
- **AC-2**: Every heading, paragraph, accordion title and text, number, label, and badge on the page comes from a content entry: the `about` entry, the shared `stats` entry, and `settings.footer.certification.badges`. `src/pages/about-us.astro` and every component it uses contain no visible copy of their own. The page title and description come from `about.seo`.
- **AC-3**: The `about` entry is one strict YAML file, `src/content/about/en/about.yaml`, with exactly the fields in *Data model sketch*. `about.md` is gone. A leftover or unknown key (`image`, `highlights`, `statsHeading`, a typo) fails the build and names the key.
- **AC-4**: Marked text understands two marks. `**phrase**` renders as bold text in the surrounding colour; `==phrase==` renders as bold gold text: `gold-ink` on white, tint, or the diagonal stripe, `gold-on-dark` on black. Marks must be balanced and may not nest or overlap; a line that breaks either rule fails the build naming the text. The footer's certification text and the home presence band, the existing users of `**bold**`, render exactly as before.
- **AC-5**: The about band is a white `Section` labelled by its `h1`. The `h1` (`about.heading`) is centred and shown in capitals by CSS only (the HTML keeps the text as written, so a screen reader does not spell it out). Under it, `about.intro` as one left aligned paragraph across the band's width, with its marks (AC-4). Under that, every `stats` item in one `<dl>`, centred and no wider than the `content` width (75rem): the number in `gold-ink`, bold, at `text-h1` size, grouped for the page's language (`1200` reads `1,200`) with its suffix; the label under it in semibold `ink-strong`. The label is the `<dt>` and the number the `<dd>`, shown number first. Two columns below `md`, four at `md` and up. The finished numbers are in the built HTML.
- **AC-6**: The numbers count up once, the first time they enter the viewport, through the existing `counters.ts`. With JavaScript unavailable or reduced motion asked for, the finished numbers are simply shown.
- **AC-7**: The capability band is a white `Section` labelled by its `h2`. At `lg` (1024px) and up it has two equal columns; below `lg` it is one column, text first, then the accordion. The left column holds the `h2` (`about.capability.heading`) with the shared `heading-rule` spanning the full column width, then each of `about.capability.paragraphs` left aligned (never justified), with their marks, beside a 4px gold bar down their left edge. The bar is a decorative fill (a pseudo element with the `--color-gold` fill), never a `border-gold` class.
- **AC-8**: The right column is the accordion: one `<details>` per `about.capability.accordion` item, all sharing one `name` so opening one closes any other, with the second item carrying `open` in the built HTML (with a single item, none starts open). The whole `<summary>` bar is the click target, at least 44px tall, and toggles with a click, a tap, Enter, or Space. Closed, an item is a bar filled with `--color-gold`, its title bold, black, at `text-h3` size, with a `plus` icon in a white circle at its right. Open, the item is a white card with a `line` border and a shadow, its title in `gold-ink`, the icon a `minus`, and the item's text below with its marks. The icons are decorative (`aria-hidden`). The summary holds plain text, not a heading element. The accordion's focus ring is the two colour `focus-contrast` ring, because the default `gold-ink` ring would sit on gold. No script runs the accordion.
- **AC-9**: Where the browser supports `::details-content` and `interpolate-size`, an item's panel slides open and closed over 300ms with an ease out. Elsewhere it opens and closes instantly, and with reduced motion asked for it opens and closes instantly everywhere. A closed item's text stays in the HTML.
- **AC-10**: The certification band is a white `Section` with the `bg-diagonal` stripe, labelled by its `h2`. The `h2` (`about.certification.heading`) is centred, shown in capitals by CSS only, with the `heading-rule` hugging the words (`inline-block`). Under it, each of `about.certification.paragraphs` left aligned across the band's width, with their marks. Under that, every badge in `settings.footer.certification.badges`, in order, in one centred row that wraps: each an optimised `Image` with its `alt`, lazy loaded, 7rem tall below `md`, 8rem from `md`, and 9rem from `lg`, so up to five sit in one row in the band's 800px at 1024px and up.
- **AC-11**: On `/about-us` the footer leaves out its certification panel, and its brand and contact columns share the row between them. Every other page's footer is unchanged.
- **AC-12**: On page load, with no script involved, the about band's heading, then its paragraph, then each number in turn fade in from transparent and rise 24px into place over 600ms with an ease out, each starting 80ms after the one before (the scroll reveal's own timing). It runs with JavaScript off. With reduced motion asked for, nothing moves and everything is simply shown. The movement uses `translate`, so nothing around it shifts.
- **AC-13**: The capability and certification bands use the existing scroll reveal (`reveal.ts`), imported by the page: the capability band's two columns reveal one after the other when they start below the fold, and when they start on screen at load (a desktop) they move by the load entrance instead, at the steps right after the last number (amended by spec [0012](../0012-capability-band-entrance/index.md): these two columns are the one element pair that takes both the `entrance` utility and the scroll reveal); in the certification band the heading block, then the paragraphs, then each badge in turn; and the certification heading's rule and the capability heading's rule draw with the scroll direction (`data-heading-rule`). No new script and no new dependency. With JavaScript off, a failed script, or reduced motion, both bands are fully shown.
- **AC-14**: The page has one `h1` (the about band) and one `h2` per lower band, and each `Section` points at its heading with `aria-labelledby`.
- **AC-15**: At 375px, 768px, 1024px, and 1920px wide the page has no sideways scroll and no overlapping text. At 1920px the bands use the site's default band width (75 percent of the screen, 1440px), matching the reference.
- **AC-16**: The gold rule in `docs/design.md` holds: every gold word, number, and title on a light surface is `gold-ink`, and a search of `src/` for the forbidden classes it lists finds nothing but the one written exception: the home service card's hover and focus side bars (`group-hover:border-gold` and `group-has-[a:focus-visible]:border-gold` in `ServiceCard.astro`), a decorative fill on an overlay that carries no text and is not a control border.
- **AC-17**: The placeholder copy follows the reference's structure and length, is written for BIM Delivery (no other company's name), and marks its ISO names as placeholders: a YAML comment above them says so, and the certification band's last paragraph ends with the same "placeholder until confirmed" sentence the footer uses.
- **AC-18**: `docs/design.md` and the dev `/styleguide` cover the second mark, the accordion, the `entrance` utility, the new `StatsBand` look, and the footer's hidden panel. `pnpm check`, `pnpm lint`, and `pnpm build` pass, and `dist/client/about-us/index.html` exists.

## Decision

**Chosen option**: Option 1: content driven composition that reuses the site's parts, a native `<details>` accordion, and CSS first motion.

The page is three band components composed in `about-us.astro` from a strict `about` YAML entry, the shared `stats` entry, and the footer's badge list, with a CSS keyframe entrance for the top band, the existing `reveal.ts` and `counters.ts` below it, and no new script or dependency.

**Settled choices** (the engineer's picks and the calls made at write time, reasons in `rationale.md`):

- Three bands only, in the reference order. Numbers from the shared `stats` entry (four, not the reference's three). Badges from the footer's list, with the footer's panel hidden on this page. Reference shaped placeholder copy for BIM Delivery.
- Headings in capitals, paragraphs left aligned. Accordion: `<details>` sharing a `name`, one open at a time, the second open on load, the whole bar clickable, a CSS only slide. Two columns stack below 1024px.
- A second mark, `==gold==`, in the one shared marked text helper.
- Load entrance by CSS keyframes, the lower bands by the existing scroll reveal.
- `about` becomes strict YAML; the photo, highlights, stats heading, and story body are dropped.
- `StatsBand` is restyled to the reference and its heading made optional, rather than a new about only numbers component.
- A new `Emphasis` component renders marked text everywhere, replacing the two hand written loops.
- A new design system `Accordion` component, so the service pages can reuse it.

**Implementation skills**: `astro` (`astrolicious/agent-skills`, `.agents/skills/astro/`) · `tailwind-4-docs` (`lombiq/tailwind-agent-skills`, `.agents/skills/tailwind-4-docs/`) · `zod` (`pproenca/dot-skills`, `.agents/skills/zod/`)

## Feature design

**Design source**: the engineer's two reference screenshots (taken at 1920x1080), one showing the about band and one showing the capability and certification bands. Tokens, type, spacing, and focus come from `docs/design.md`. Where a screenshot and an AC disagree, the AC wins (the gold colours, for example, follow the gold rule rather than the reference's brighter gold). Pixel spacing not fixed by an AC follows the screenshots.

**Page composition**:

| Order | Band | Tone | Component | Motion |
|---|---|---|---|---|
| 1 | About: `h1`, intro, numbers | `white` | `src/components/about/AboutBand.astro` (uses `StatsBand`) | CSS load entrance, counter |
| 2 | Capability: ruled `h2` and paragraphs, accordion | `white` | `src/components/about/CapabilityBand.astro` (uses `Accordion`) | load entrance on screen, scroll reveal below the fold (spec 0012), rule draw |
| 3 | Certification: ruled `h2`, paragraphs, badges | `white` with `bg-diagonal` | `src/components/about/CertificationBand.astro` | scroll reveal, rule draw |

**Component inventory**:

| Component | Status | Change |
|---|---|---|
| `Section`, `Icon`, `heading-rule`, `bg-diagonal`, `focus-contrast` | existing | none, except two new glyphs in `Icon`: `plus` and `minus` (stroke) |
| `StatsBand` (`src/components/ui/`) | existing, used only by `/styleguide` today | `heading` becomes optional (absent: no `h2`, the list is labelled by the enclosing section); numbers `gold-ink`, labels semibold `ink-strong`, width capped at `content`; an optional `entranceFrom?: number` prop gives each figure the `entrance` utility with steps counting up from it |
| `Emphasis` (`src/components/ui/Emphasis.astro`) | new | renders one marked line; prop `surface: 'light' \| 'dark'` picks `gold-ink` or `gold-on-dark` for the gold mark |
| `Accordion` (`src/components/ui/Accordion.astro`) | new | props `name: string`, `items: readonly { title: string; text: string }[]`; renders the `<details>` group of AC-8 and AC-9; the second item open |
| `Footer`, `PageLayout` | existing | `Footer` gains `showCertification?: boolean` (default `true`); `PageLayout` gains `footerCertification?: boolean` (default `true`) and passes it on; with it `false` the footer grid drops to two columns at `lg` |
| `PresenceBand`, `Footer` marked text | existing | their hand written `splitEmphasis` loops are replaced by `Emphasis` |
| `AboutBand`, `CapabilityBand`, `CertificationBand` (`src/components/about/`) | new | one per band, as the home page does |

**Data model sketch** (content, validated by Zod at build):

`about` entry, `src/content/about/en/about.yaml`, a `z.strictObject`:

| Field | Type | Required | Notes |
|---|---|---|---|
| `lang` | the shared `lang` | yes | unchanged |
| `seo` | the shared `seo` | yes | unchanged |
| `heading` | `text` | yes | the `h1` |
| `intro` | `emphasisText` | yes | the about band paragraph |
| `capability` | `z.strictObject` | yes | |
| `capability.heading` | `text` | yes | the band's `h2` |
| `capability.paragraphs` | `emphasisText[]`, min 1 | yes | left column |
| `capability.accordion` | `{ title: text, text: emphasisText }[]`, min 1 | yes | the second is open on load |
| `certification` | `z.strictObject` | yes | |
| `certification.heading` | `text` | yes | the band's `h2` |
| `certification.paragraphs` | `emphasisText[]`, min 1 | yes | |

Removed: `image`, `highlights`, `statsHeading`, and the Markdown body. `getAboutPage` stops calling `render` and returns `entry.data`. Read unchanged: `stats.items` (all of them) and `settings.footer.certification.badges`.

Marked text (`src/lib/emphasis.ts`): `splitEmphasis(line)` returns `readonly { text: string; mark: 'none' | 'strong' | 'gold' }[]`, scanning for `**` and `==` in one pass. `hasBalancedEmphasis(line)` becomes true only when every mark closes with the same mark before any other mark opens. The `emphasisText` schema keeps using it, with a message naming both marks. The `strong: boolean` field goes; `Emphasis` is its only reader.

**State transitions**: an accordion item is `closed` or `open`. Clicking or pressing Enter or Space on a closed item's summary opens it and closes the open sibling (the browser does this through the shared `name`); doing so on the open item closes it, leaving none open. On load the second item is `open`. Nothing else has state.

**API surface**: none. The page is prerendered (spec 0001), adds no endpoint, and calls nothing at runtime.

**Value sourcing**:

| Action | Value produced / displayed | Source |
|---|---|---|
| Build `/about-us` | page title, description | `about.seo` |
| | `h1`, intro and its marks | `about.heading`, `about.intro` |
| | numbers, suffixes, labels | `stats.items[].value`, `.suffix`, `.label` |
| | number grouping, `data-locale` | `resolveLocale(Astro.currentLocale)` |
| | capability heading, paragraphs | `about.capability.heading`, `.paragraphs` |
| | accordion titles and texts | `about.capability.accordion[]` |
| | accordion group `name` | a constant in `CapabilityBand`, `about-capability` |
| | which item is open on load | its position: index 1 |
| | certification heading, paragraphs | `about.certification.heading`, `.paragraphs` |
| | badge images, alt text, order | `settings.footer.certification.badges[]` |
| | footer panel hidden | `footerCertification={false}` passed by `about-us.astro` |
| | gold colour of a `==` phrase | the `Emphasis` `surface` prop, set by each caller |
| | entrance order (`--entrance-step`) | position in the about band: heading 0, intro 1, numbers from 2 |
| Scroll reveal | what reveals, and in what order | `data-reveal`, `data-reveal-stagger`, `data-heading-rule` in the band markup |

**Motion**:

- `entrance` utility in `global.css`: inside `@media (prefers-reduced-motion: no-preference)`, `animation: entrance 600ms ease-out both` with `animation-delay: calc(var(--entrance-step, 0) * 80ms)`, and `@keyframes entrance` from `opacity: 0; translate: 0 24px` to its resting state. Callers set `--entrance-step` through a `style` attribute. It hides nothing outside the animation itself, so JavaScript off still plays it and reduced motion shows everything at once.
- The about band carries no `data-reveal`, so the scroll reveal never touches what the entrance animates.
- Accordion slide, in `Accordion`'s styles, guarded by `@supports selector(::details-content)` and the reduced motion query: `interpolate-size: allow-keywords` on the group, and on `::details-content` a `block-size` transition of 300ms ease out with `content-visibility` as `allow-discrete`, from `0` to `auto` when `[open]`, with `overflow: clip`.

**Key invariants**:

- No visible copy in `about-us.astro` or its components (AC-2).
- The `about` entry is strict; the page reads nothing from it that the schema does not name.
- The certification badges have one source, `settings.footer.certification.badges`, and appear once per page.
- No CSS rule hides content waiting for a script; the only hiding is inside the `entrance` keyframes and the scroll reveal, which never hides what is already on screen.
- No forbidden gold class anywhere in `src/`, apart from the service card's side bars (AC-16).
- Still exactly the scripts the site ships today; this page adds none.

**Security model**: a public, prerendered page. No visitor input, no personal data, no runtime request, no authentication. Content is read at build only. No compliance scope applies. The ISO names are unconfirmed claims, which is why AC-17 marks them as placeholders.

**Configuration required**: none.

**Critical test scenarios**:

- Happy path: open `/about-us` at 1920x1080; three bands in order, the top band fades and rises in on load, the four numbers count up, scroll down and the lower bands reveal with their rules drawing, verifies **AC-1**, **AC-5**, **AC-6**, **AC-12**, **AC-13**, **AC-15**.
- Accordion: the second item is open on load; open the first with the mouse and then with Tab and Enter, the second closes; the slide plays in Chrome, verifies **AC-8**, **AC-9**.
- No JavaScript and reduced motion: every band, number, and badge is fully shown, the accordion still opens, and nothing animates under reduced motion, verifies **AC-6**, **AC-8**, **AC-12**, **AC-13**.
- Build failure: add `image:` back to `about.yaml`, then write `==ISO 9001` with no closing mark; each build fails naming the key or the text, verifies **AC-3**, **AC-4**.
- Footer: `/about-us` footer has no badge panel, `/` and `/contact-us` still do, verifies **AC-11**.
- Phone at 375px: one column, no sideways scroll, badges wrap, verifies **AC-7**, **AC-10**, **AC-15**.

## Build plan

Skateboard: first the whole page stands up with no motion, then the motion, then the write up and gates.

**Milestone 1: the whole page, still**

1. [x] Rewrite `src/lib/emphasis.ts` for the two marks (`mark` field, one pass scan, the stricter balance check) and update the `emphasisText` message, satisfies **AC-4**.
2. [x] Add `src/components/ui/Emphasis.astro` with the `surface` prop and move `Footer` (`dark`) and `PresenceBand` (`light`) onto it; confirm both render as before, satisfies **AC-4**.
3. [x] Make the `about` schema the strict shape above, write `src/content/about/en/about.yaml` with the placeholder copy (reference shaped, the ISO comment, the footer's placeholder sentence), delete `about.md`, and drop `render` from `getAboutPage`, satisfies **AC-2**, **AC-3**, **AC-17**.
4. [x] Add the `plus` and `minus` glyphs to `Icon`, satisfies **AC-8**.
5. [x] Restyle `StatsBand` (optional heading, `gold-ink` numbers, semibold labels, `content` width, the `entranceFrom` prop) and check its `/styleguide` tile, satisfies **AC-5**, **AC-16**.
6. [x] Build `src/components/ui/Accordion.astro` (the `<details>` group, the closed and open looks, the icons, the `focus-contrast` ring), without the slide, satisfies **AC-8**.
7. [x] Add `showCertification` to `Footer` and `footerCertification` to `PageLayout`, with the two column grid when hidden, satisfies **AC-11**.
8. [x] Build `AboutBand`, `CapabilityBand`, and `CertificationBand` in `src/components/about/` and compose them in `about-us.astro` with `footerCertification={false}` and the headings' ids, satisfies **AC-1**, **AC-2**, **AC-5**, **AC-7**, **AC-10**, **AC-14**.
9. [x] Preview at 375, 768, 1024, and 1920 against the screenshots, satisfies **AC-15**.

**Milestone 2: the page moves**

10. [x] Add the `entrance` utility and keyframes to `global.css`; mark the about band's heading, intro, and numbers (through `entranceFrom={2}`), satisfies **AC-12**.
11. [x] Add the `data-reveal`, `data-reveal-stagger`, and `data-heading-rule` hooks to the lower bands and import `reveal.ts` from the page, satisfies **AC-13**.
12. [x] Add the accordion slide CSS behind its `@supports` and reduced motion guards, satisfies **AC-9**.
13. [x] Check in the browser with JavaScript off and with reduced motion on, satisfies **AC-6**, **AC-12**, **AC-13**.

**Milestone 3: written down and gated**

14. [x] Update `docs/design.md` (the second mark, `Accordion`, `entrance`, the `StatsBand` look, the footer's hidden panel) and add `/styleguide` tiles for `Accordion` and a gold marked line, satisfies **AC-18**.
15. [x] Search `src/` for the forbidden gold classes, run `pnpm check`, `pnpm lint`, and `pnpm build`, and confirm `dist/client/about-us/index.html`, satisfies **AC-16**, **AC-18**.

## Consequences

**Positive**:

- The page is content driven from day one, so your later polish is edits to `about.yaml` and styles, not a rebuild.
- Two reusable pieces land for the service pages: `Accordion` and a second text mark.
- Zero new JavaScript: the entrance and the accordion are CSS and HTML, and the lower bands reuse the scripts already shipped.

**Negative / tradeoffs**:

- The page shows four numbers, not the reference's three, because the numbers are shared with the home page.
- The gold words, numbers, and open titles are the darker `gold-ink`, so the page reads a little less bright than the reference.
- The accordion slides only in browsers with `::details-content` and `interpolate-size` (Chrome and Edge today); Safari and Firefox open it instantly.
- On a short phone screen the numbers may sit below the fold, so their load entrance can finish before anyone sees it; the counter still runs when they arrive.
- Changing `splitEmphasis`'s return shape touches two existing components and the design system's `StatsBand`, which is a wider change than one page.
- The ISO names are placeholders; publishing them as real claims before they are confirmed would be a false claim.

**Neutral**:

- The footer gains a prop that only this page uses for now.
- The old about photo and highlights leave the content; they can return as new fields if the polish wants them.

## Follow-up

- [ ] Replace the placeholder ISO names, badges, and copy with the real certifications before launch (the scope's *Real brand* item covers the badges).
- [ ] When the page is polished, decide whether the about band should show its own numbers rather than the shared four.
- [ ] Spec 0005 lists `StatsBand` as the home page's numbers band; `/sync` should note it is now the about page's, with the new look.

## Rationale

Reasoning and options: see [rationale.md](rationale.md).
