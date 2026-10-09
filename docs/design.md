# Design system

The written companion to `src/styles/global.css` (spec
[0003](specs/0003-design-system-ui-foundation/index.md)). The CSS is where the
tokens live and what the build enforces; this file says what each one is for
and which pairs are safe to put together. A token change edits both, in the
same commit.

**Character**: dark, warm, and technical. A near black page in the client's
own palette, cream words, and Antique Brass used for what you act on and what
matters most. Jet panels lift cards off the page; Coffee draws quiet structure
and never speaks. Square-ish corners (4px), no shadows, no rounded blobs. The
feel of a firm that delivers precise drawings, at night.

**Source**: the five colours are the client's own palette (Chinese Black, Dark
Jungle Green, Jet, Coffee, Antique Brass), adopted on 2026-10-09; the cream
text family is derived from the brass hue. The typeface is still Inter, and
the logo and certification badges are still placeholders. Replacing those
before launch is a tracked follow up (feature 14).

## Build mandate

Compose pages from `Section`, `Button`, `Card`, and Tailwind layout utilities.
Building a page should be layout work, not styling decisions.

- Every colour, font size, radius, and page width comes from a token. There is
  no `<style>` block, no second CSS file, no raw hex, and no Tailwind arbitrary
  value (a class with square brackets) anywhere outside `global.css`.
- The build enforces most of that. Tailwind's colour, breakpoint, type, and
  radius namespaces are cleared, so an off token class produces no CSS at all.
  It fails silently rather than loudly, which is worth knowing the first time a
  class seems to do nothing: the fix is always a token.
- The accent role rule is the one thing the build cannot catch, because it is
  a choice between valid tokens. Read it below before putting a word on a
  photo, on the service card's wash, or in Coffee.
- Pages set rhythm by alternating `canvas` and `raised` sections. Both are
  dark, so no component adapts to its background. The bands that are not a
  `Section` tone (the home hero, the home intro band, the contact form band,
  the Project hero, `CtaBand`, the footer) are their own components that
  borrow the band frame.
- No shadows. A shadow cannot be seen on a dark page; a card separates by its
  `panel` fill and, where it has one, its `line` border.

## Colour

Every colour the site has. Named by role, not by hue, so a class always says
what it paints and the next palette change is values only.

| Token | Value | Role |
|---|---|---|
| `--color-canvas` | `#0c1519` Chinese Black | The page, the `canvas` section tone, every band that is not `raised`, field fills |
| `--color-raised` | `#162127` Dark Jungle Green | The `raised` section tone |
| `--color-panel` | `#3a3534` Jet | Every card, tile, the header card, the dropdown and mobile menu panel, the open accordion item, an empty photo frame. Separates from `canvas` (1.53:1) and `raised` (1.36:1) |
| `--color-heading` | `#f5ece4` | `h1` and `h2`; every word on a photo or on the Coffee wash; the outer band of the two colour ring |
| `--color-ink-strong` | `#f5ece4` | `h3` and sub headings, field labels, strong text. Same value as `heading` today, a separate role so a display face later can move one without the other |
| `--color-ink` | `#d9cbc0` | Body text, the most used text colour; field text |
| `--color-ink-muted` | `#b8aca3` | Hints, captions, card text; the hovered card border |
| `--color-accent` | `#cf9d7b` Antique Brass | Fills (primary button, the closing band, closed accordion items, process step circles, map markers, heading rules and accent bars, icon fills) AND words (links, emphasis, `==` phrases, numbers, the secondary button), and the focus ring |
| `--color-accent-hover` | `#e3bc9f` | The primary button's hover fill, and nothing else |
| `--color-on-accent` | `#0c1519` | The label or icon on an `accent` or `accent-hover` fill, and nothing else |
| `--color-accent-deep` | `#724b39` Coffee | The home service card's hover wash, and nothing else. Never a word |
| `--color-line` | `#724b39` Coffee | Decorative borders and dividers, the process timeline's connector, the footer's top hairline. Never a control boundary, never a word |
| `--color-field` | `#8c8480` | Form field borders, a control boundary: 5.04:1 against the `canvas` fill |
| `--color-error` | `#ff8a7a` | Error text and error borders, on every surface |
| `--color-scrim` | `rgb(12 21 25 / 0.7)` | The see through layer under words on a photo. `heading` on it is 5.91:1 over a pure white pixel, so no photo can break it. Never lighter |
| `--color-scrim-strong` | `rgb(12 21 25 / 0.9)` | The contact form band's layer, and a project tile's hovered caption. With the `bg-diagonal` stripe on top, its worst pixel is `#31393c` |

Two values are written out outside `global.css`, each named beside its token
because neither place can read a custom property: the `theme-color` meta in
`BaseLayout.astro` (`--color-canvas`, `#0c1519`) and the `select-chevron`
stroke (`--color-ink`, `%23d9cbc0`).

### The accent role rule

The most misusable part of this palette. Brass is legible on every dark
surface (5.04:1 at worst, on `panel`), so one token is the fill and the word
alike. The colour that must never be read is Coffee, which looks like a
quieter brass in a swatch list.

| Role | Token | Allowed | Forbidden |
|---|---|---|---|
| Accent | `--color-accent` | Every fill, word, link, icon, rule, and focus ring in the colour table, on `canvas`, `raised`, `panel`, and either pattern | As a word on a photo (2.88:1 over the scrim) or on the Coffee wash (3.66:1) |
| Accent, hover | `--color-accent-hover` | The primary button's hover fill | Everything else |
| On accent | `--color-on-accent` | The label or icon on an accent fill | Anywhere that is not an accent fill |
| Coffee | `--color-accent-deep`, `--color-line` | The service card wash; decorative borders, dividers, and the timeline connector | Any word, any control border, any focus ring |

Three consequences worth writing down:

- **Text on a photo is only `heading`.** That is why `Emphasis` takes
  `onPhoto`: a `==` phrase on the Project hero turns bold `heading`, not brass.
- **Every heading or paragraph inside an accent fill carries `text-on-accent`
  explicitly**, because the base layer makes headings `heading` (2.05:1 on
  brass). And nothing `canvas` coloured sits inside an accent fill unless a
  lighter colour is set on it, because `on-accent` and `canvas` are the same
  value (the accordion icon circle is the case today: its icon is
  `text-accent`).
- **`on-accent` lives only on an accent fill.**

The decorative rule under a section heading is one utility, `heading-rule` in
`global.css`, drawn in `accent`. Every section heading with a line under it
uses it. It draws the line with `::after`, exactly as wide as the heading's own
box and invisible to a screen reader, and it leaves `display` to the call site
(`inline-block` where the line should hug the words, nothing where the heading
is already a flex item). It also holds the two custom properties the reveal
script writes to draw the line, described under `## Focus and motion`. A new
heading anywhere on the site writes one class, never a string of `after:`
utilities.

To check: search `src/` for these exact whole classes and expect no hits.

```
text-accent-deep  text-line
border-accent-deep
outline-accent-deep  outline-line
ring-accent-deep  ring-line
```

And the retired names (spec 0003, AC-16): a whole class search of `src/` for a
utility prefix right before a retired name, plus the two retired pattern
names, returns nothing, because a leftover class now generates no CSS and
fails silently.

```
rg '(bg|text|border|fill|stroke|outline|ring|decoration|from|to|via|shadow)-(white|tint|black|gold|yellow|error-on-dark)\b' src
rg -F -e 'bg-diagonal-dark' -e 'bg-dots-dark' src
```

Note that a class name quoted in prose inside `src/` counts as a hit, and
Tailwind will also turn it into real CSS, because it reads source files as
plain text. Write the token name (`--color-line`) when you need to talk about
one.

### Contrast, the pairs in use

WCAG 2.2 AA: 4.5:1 for normal text, 3:1 for large text, control boundaries, and
focus indicators. Computed from the hex values above with the WCAG relative
luminance formula; composites (the scrims, the stripe, the dots, the wash) by
alpha blending over the worst case pixel. The working is in spec 0003's
`rationale.md`.

| Foreground | Background | Ratio | Needs |
|---|---|---|---|
| heading / ink-strong (`h1` to `h3`, labels, strong text) | canvas / raised / panel | 15.83 / 14.05 / 10.35 | 4.5 |
| ink (body, field text) | canvas / raised / panel | 11.66 / 10.35 / 7.62 | 4.5 |
| ink-muted (hints, card text) | canvas / raised / panel | 8.33 / 7.39 / 5.45 | 4.5 |
| accent (links, emphasis, numbers, secondary button) | canvas / raised / panel | 7.71 / 6.84 / 5.04 | 4.5 |
| on-accent (primary button label, closing band text, closed accordion title, step number) | accent / accent-hover | 7.71 / 10.52 | 4.5 |
| heading (the closing band link's label) | canvas / panel (hover) | 15.83 / 10.35 | 4.5 |
| error | canvas / raised / panel | 8.06 / 7.16 / 5.27 | 4.5 |
| field border | canvas (the field's fill) | 5.04 | 3.0 |
| focus ring accent | canvas / raised / panel | 7.71 / 6.84 / 5.04 | 3.0 |
| heading / ink / ink-muted / accent over a `bg-diagonal` line on canvas (`#1b2327`) | | 13.68 / 10.07 / 7.19 / 6.66 | 4.5 |
| heading / ink / ink-muted / accent over a `bg-diagonal` line on raised (`#242e34`, a presence band after a stripe pattern band) | | 11.88 / 8.75 / 6.25 / 5.78 | 4.5 |
| heading (presence marker labels) on their `canvas` chip at 80%, over the globe or a flat map dot | | at least 6.81 | 4.5 |
| heading at 50% (inactive carousel dot) / heading (active) | canvas | 4.73 / 15.83 | 3.0 |
| heading / ink / ink-muted / accent on a `bg-dots` dot centre (`#2e3639`) | | 10.57 / 7.78 / 5.56 / 5.15 | 4.5 |
| heading on `scrim` over a pure white pixel (`#555b5e`): the home hero, the Project hero, every project tile caption | | 5.91 | 4.5 |
| on the contact form band's worst pixel (`#31393c`): heading / ink / ink-muted / error / accent | | 10.11 / 7.44 / 5.32 / 5.15 / 4.92 | 4.5 |
| heading on the Coffee wash's darkest point (`#614438`) | | 7.52 | 4.5 |
| two colour ring, canvas inner / heading outer | accent fill / any photo | canvas on accent 7.71; on any colour one band reaches at least 3.98 | 3.0 |

### Contrast, deliberately never text

Recorded so a later reader does not "fix" them.

| Pair | Ratio | Why it is still fine |
|---|---|---|
| Coffee (`line`) on canvas / panel | 2.45 / 1.60 | Decorative borders and dividers, never a control boundary, so WCAG 1.4.11 does not apply |
| panel on canvas / raised | 1.53 / 1.36 | A card surface, not a control boundary; a linked card's affordance is its title link and focus ring |
| raised on canvas | 1.13 | Section rhythm only. Never a box on `canvas`: it would vanish, so boxes are `panel` |
| accent on a photo or on the wash | 2.88 / 3.66 | Forbidden as a word there by the accent role rule |
## Type

Inter, downloaded at build by Astro's fonts API and served from this site's own
origin, with a metric matched fallback so nothing shifts as it loads. It is the
only typeface.

Headings interpolate linearly between a 360px and a 1200px viewport, so they
grow smoothly and never jump at a breakpoint. Every size is in `rem`, so full
page browser zoom scales them.

| Token | Size | Line height | Letter spacing | Weight | Role |
|---|---|---|---|---|---|
| `--text-h1` | 36px to 56px | 1.1 | -0.02em | 700 | Page title |
| `--text-h2` | 28px to 40px | 1.2 | normal | 700 | Section heading |
| `--text-h3` | 20px to 24px | 1.3 | normal | 600 | Card and sub heading |
| `--text-lead` | 18px | 1.6 | normal | 400 | Intro paragraphs |
| `--text-body` | 16px | 1.6 | normal | 400 | Body text |
| `--text-small` | 14px | 1.5 | normal | 400 | Labels, hints, errors, captions |

Line height and letter spacing are companion keys on the size token, so
`text-h1` sets all three at once. **Never write line height or letter spacing
on a component**; if a size needs different ones, it is a new token.

`h1`, `h2`, and `h3` already carry their size, weight, and colour from the base
layer, so a plain `<h2>` is correct with no classes on it.

Only the heading clamps use a `vw` term, which does not respond to a browser's
text-only scaling setting the way a pure `rem` value does. The `rem` half still
does, and body, lead, and small are pure `rem`.

## Spacing and rhythm

Tailwind's default 0.25rem spacing scale is kept, because nothing here needs it
constrained and `min-h-11` (the 44px tap target) relies on it.

| Where | Mobile | Tablet (`md`) | Desktop (`lg`) |
|---|---|---|---|
| Section vertical padding | 64px | 80px | 96px |
| Section side gutters | 16px | 24px | 32px |
| Card padding | 24px | 24px | 24px |
| Grid gaps | 24px | 24px | 24px |

One written exception to the grid gap: the photo wall, on the Project page
(`ProjectGallery`, spec 0014) and in a project detail page's gallery
(`ProjectPhotos`, spec 0015), uses an 8px gap (`gap-2`) across and down, so
the photos read as one wall split by thin seams. The detail gallery takes it
from `src/components/project/wall.ts`; the Project page's two across wall
writes it in its own grid (spec 0014, revised 2026-10-09). No other grid
does.

There is no vertical margin between sections. Adjacent sections of the same
tone are fine; alternating `canvas` and `raised` is the default rhythm a page
should use.

## Corners and widths

| Token | Value | Use |
|---|---|---|
| `--radius-ui` | 4px | Every button, card, field, and image corner |
| `--radius-card` | 24px | The one large radius, for a surface big enough that 4px barely shows. Today only the header card's bottom corners (`rounded-b-card`) |
| `--radius-full` | 9999px | Pills and round icon buttons, for feature 5 |
| `--container-content` | 1200px | `Section` width `default` |
| `--container-narrow` | 720px | `Section` width `narrow`, the reading column |

## Breakpoints

Three screens, and that is the whole system. `sm`, `xl`, and `2xl` are switched
off, so a class using one produces nothing.

| Prefix | From | Screen |
|---|---|---|
| (none) | 0 | Mobile, the unprefixed default |
| `md:` | 768px | Tablet |
| `lg:` | 1024px | Desktop |

## Tones

Two section tones, `canvas` and `raised`, and **both are dark**. Every text,
border, and focus colour is identical on each, so no component adapts to its
background, none takes a tone prop, and none reads a tone variable. Components
name their colours directly (`text-ink`, `border-accent`). Tones are renamed,
never reassigned: the 2026-10-09 revision turned every `white` into `canvas`
and every `tint` into `raised`, page by page, with no new rhythm.

A `canvas` band may carry one pattern on top. Each sets only
`background-image` (and the dots `background-size`), so neither is a third
tone. Pass it through `Section`'s `class`; **do not** add a tone for it.

- **`bg-diagonal`** (spec 0005): `heading` at 6 percent, 1px in every 10, at
  135 degrees. Today on the home presence band, the About page's
  certification band, a `stripe` service band, and over `scrim-strong` on the
  contact form band. Its line is the band's lightest pixel and every pair is
  measured there: on `canvas` `#1b2327`, where `accent`, the worst, still
  reads 6.66:1. A `==` phrase is fine on it.
- **`bg-dots`** (spec 0013): `heading` at 14 percent, a 2px dot every 12px. A
  dot's centre (`#2e3639`) gives `accent` 5.15:1 and `ink-muted` 5.56:1.
  **Only on `canvas`**: on `raised` a dot would drop `accent` to 4.42:1.

The service pages' features and process bands sit on `PatternBand` (spec
0013, `src/components/ui/PatternBand.astro`), named by the content's
`surface` field: `stripe` is a `canvas` `Section` under `bg-diagonal`, `dots`
a `canvas` `Section` under `bg-dots`. Words, cards, and icons on either are
the same (`heading` headings, `ink` text, `panel` cards with a `line` border,
`accent` icons). Any other `surface` value fails the build naming the file.
When a presence band follows a `stripe` pattern band, the route turns its
stripe's tone to `raised`, so two stripes never run into each other on one
tone. Every other service band is `canvas`, so a dots band next to a `canvas`
section has no seam; the patterns carry the rhythm there.

The bands that are not a tone each borrow the band frame:

- **Photo bands** (the home hero, the Project hero, the contact form band):
  a photo under `scrim` or `scrim-strong`, on a `canvas` band so a photo that
  fails to load leaves the same words on a dark band. Every word is `heading`
  (on the form band, the field and card rules hold too: they are measured at
  its worst pixel). Each carries `focus-contrast`.
- **The accent band** (`CtaBand`): brass, `on-accent` words, a `canvas` link.
  It carries `focus-contrast`.
- **The home intro band**: a `canvas` band with `heading` copy, `accent`
  highlighted words, and `panel` stat cards. The base ring passes there, so no
  `focus-contrast`. Two things on it move: the counter, which runs once, and
  the typed heading words.
- **The footer**: a `canvas` band with a `line` hairline on top. No
  `focus-contrast`.

## Components

Four base pieces, plus the four the site shell adds (spec 0004), the three
the home page promotes into the system (spec 0005), the two the About page
adds (spec 0010, `Emphasis` and `Accordion`), and the service pages'
`PatternBand`, `CarouselDots`, and `PresenceBand`, now shared (spec 0013),
plus their band family in `src/components/service/`. The form fields
are React because the contact island (feature 10) needs them, and the button
exists in both idioms sharing one class map so they cannot drift apart;
everything else is Astro.

### `Section` · `src/components/ui/Section.astro`

A full width band with its content centred. It owns page width and gutters, so
no page writes its own container.

| Prop | Type | Default |
|---|---|---|
| `tone` | `'canvas' \| 'raised'` | `'canvas'` |
| `width` | `'default' \| 'narrow'` | `'default'` |
| `id` | `string` | none |
| `labelledBy` | `string`, the id of the section's heading | none |

- **Do** pass `labelledBy` pointing at the heading inside, so the section has a
  name a screen reader can use.
- **Do not** add vertical margin around it. Padding is the whole rhythm.
- There is no `Container` component. A band that needs full bleed content is a
  new `Section` option later, not a one off.
- **The band frame** lives in `src/components/ui/styles.ts`: `bandGutterClass`
  (`px-4 md:px-6 lg:px-8`), `bandPaddingClass` (`py-16 md:py-20 lg:py-24`), and
  `bandWidthClass` (`default` and `narrow`). `Section` builds from them, and so
  do the bands that are not a `Section` tone, `CtaBand` and the home hero
  among them, so they cannot drift apart. A band that is not a `Section` tone
  is its own component that borrows this frame; it never adds a tone to
  `Section` (spec 0005). `Section` is the only component that names a tone.

### `Button` · `src/components/ui/Button.astro` and `src/components/react/ui/Button.tsx`

| Prop | Type | Default |
|---|---|---|
| `variant` | `'primary' \| 'secondary'` | `'primary'` |
| `href` (Astro only) | `string` | none |
| `type` | `'button' \| 'submit'` | `'button'` |
| `disabled` | `boolean` | `false` |

- Renders an `<a>` when given `href`, a `<button>` otherwise. The React one
  renders a `<button>` only; the contact island never needs a link button.
- `href` together with `disabled` is a **type error**. There is no honest way to
  disable a link.
- At least 44px tall. Labels may wrap on a narrow screen; the button grows.
- **`primary`** is an `accent` fill with an `on-accent` label (7.71:1),
  brightening to `accent-hover` on hover (10.52:1). **`secondary`** is an
  `accent` border and label (7.71:1 on canvas, 6.84:1 on raised, 5.04:1 on
  panel), filling with `accent` and an `on-accent` label on hover. The same on
  every dark surface.
- **Do** pass the label through the slot or children, from a content entry.
- **Do not** write visible words inside the component.

### `Card` · `src/components/ui/Card.astro`

| Prop | Type | Default |
|---|---|---|
| `title` | `string` (required) | |
| `text` | `string` | none |
| `image` | `{ src: ImageMetadata; alt: string }` | none |
| `href` | `string` | none |
| `headingLevel` | `2 \| 3 \| 4` | `3` |

- The whole card is clickable through **one** link with **one** tab stop, whose
  accessible name is the title.
- **Do not** put a link, button, or field in the slot of a card that has
  `href`. The stretched link covers it.
- **Do** choose `headingLevel` from the page's own heading outline.
- A `panel` surface with a `line` border; the title `ink-strong`, the text
  `ink-muted` (5.45:1 on panel).
- Keyboard focus draws one `accent` ring around the whole card. Hover
  underlines the title and turns the border from `line` to `ink-muted`,
  deliberately a different treatment, so a mouse user is never shown
  something that reads as the brass focus ring. No shadow.
- Renders correctly with no image, with no link, and with a title long enough to
  wrap to three lines. Nothing truncates.
- Images are 3:2, cropped to fill, and sized for one column on mobile, two on
  tablet, three on desktop.

### `TextField`, `TextArea`, and `Select` · `src/components/react/ui/`

| Prop | Type | Default |
|---|---|---|
| `name` | `string` (required) | |
| `label` | `string` (required) | |
| `type` (TextField only) | `'text' \| 'email' \| 'tel'` | `'text'` |
| `rows` (TextArea only) | `number` | `5` |
| `id` | `string` | a generated id |
| `hint` | `string` | none |
| `error` | `string` | none |
| `required` | `boolean` | `false` |
| `options` (Select only) | `readonly { value: string; label: string }[]` (required) | |
| `prompt` (Select only) | `string` (required), the empty first choice | |

Plus the native input, textarea, or select props (`value`, `onChange`, `autoComplete`,
and so on).

- The label is always visible. **Do not** use a placeholder as a label.
- An error never relies on colour: the control gets `aria-invalid="true"`, the
  message is linked through `aria-describedby`, and the outline thickens through
  an inset ring so nothing on the page shifts.
- `aria-describedby` lists the hint id first, then the error id.
- At least 44px tall.
- **Do** pass an explicit `id` when placing a field directly in an `.astro`
  file. Each such placement is its own React root, and generated ids can repeat
  across roots. Inside one island the generated id is enough.
- The component draws no required marker. If a form wants one, it passes a
  `hint` from content.
- **The line above the box** holds the label at the start and the hint at the
  end (`fieldHeadClass`, spec 0011), so every field has one line there and
  the boxes of a row in a grid line up whether or not each has a hint.
- **One look everywhere** (the `surface` prop was removed on 2026-10-09): a
  `canvas` fill, the `field` border (5.04:1 against the fill), `ink` text, an
  `ink-strong` label, an `ink-muted` hint, and an `error` message and ring.
  Every surface a field sits on is dark, including the contact form band,
  whose worst pixel is measured for these words. The class strings live in
  `styles.ts`, so no field names a colour of its own.
- **`Select`** is a native `<select>` in the same box, with the icon set's
  `chevron-down` drawn by the `select-chevron` utility in `global.css`
  (its stroke is `--color-ink`'s value, written out because a data URI cannot
  read a custom property). Its first choice is always an empty value labelled
  `prompt`. Values are stable keys, labels come from content, and only the key
  is ever sent.

### `Icon` · `src/components/ui/Icon.astro`

| Prop | Type | Default |
|---|---|---|
| `name` | `IconName` (required) | |
| `size` | `number`, the edge length in pixels | `24` |
| `title` | `string`, the accessible name | none |
| `strokeWidth` | `number`, on the 24 unit grid; fill glyphs ignore it | `2` |
| `class` | `string` | none |

The whole set, thirty six glyphs on one 24 unit grid: `menu`, `close`,
`chevron-down`, `check` (the home presence band's why choose list, spec 0005),
`arrow-right` (the home service card's cue, spec 0005, and the home project
tiles' cue and the next project link, spec 0015), `arrow-left` (a project detail
page's "All projects" link, its mirror, spec 0015), `plus` and `minus`
(an `Accordion` item closed and open, spec 0010), the footer's contact glyphs
`phone`, `mail`, `globe`, the five social marks `linkedin`, `facebook`,
`youtube`, `x`, `instagram`, and the four solid stat glyphs
`briefcase-clock`, `users`, `building`, `map-pin` (the home intro band's
cards), and `headset` and `envelope`, which with `map-pin` fill the contact
page's cards (spec 0011). A glyph whose details are holes punched through it sets `evenodd` in
the map.

The service pages add fourteen (spec 0013), copied from open licence sets
rather than drawn, each with a comment in the map naming its set, source
glyph, and licence, and listed in `src/assets/images/CREDITS.md`:

- **Line glyphs** (Tabler Icons outline, MIT), the `lineIcons` a features
  card or tile may take: `blueprint`, `crane`, `building-check`, `scan`,
  `clipboard-check`, `ruler`, `clash`, `layers`, `messages`. The cards draw
  them at 80px with `strokeWidth` 1.25 and the tiles at 40px with 1.5, since a
  2 unit line at 80px would be nearly 7px thick. Coloured `accent` on either
  pattern.
- **Solid glyphs** (Tabler filled, or Material Icons filled under Apache 2.0
  where Tabler has no solid match), the `solidIcons` an audience item may
  take with the existing `users` and `building`: `user`, `presenter`,
  `compass`, `hard-hat`, `users-gear`. Drawn at 64px with `fill-accent`.

A glyph name is checked twice: the schema lists which glyphs a block may
take, and passing it to `Icon` is type checked against the map. A new glyph
is a path in the map and its name in the list.

- Every glyph inherits `currentColor`, so an icon is coloured by the text around
  it. **Do not** give an icon a colour of its own unless it should read as
  brass: then a solid glyph takes `fill-accent` (the intro band's cards, the
  contact cards, the audiences) and a stroke glyph `text-accent` (the `check`
  in the presence band's list). Either is within the accent role rule.
- A name outside the map is a **type error**, not a blank square. There is no
  icon library and no dynamic lookup.
- Without `title` the icon is hidden from assistive tech, which is right
  whenever visible text sits beside it. **Do** pass `title` only when the icon
  is the whole accessible name of a control, as the footer's social links are.
- Use 20 beside a label, 24 for a standalone control.

### `PageLayout` · `src/layouts/PageLayout.astro`

| Prop | Type | Default |
|---|---|---|
| `title` | `string` (required) | |
| `description` | `string` | none |
| `footerCertification` | `boolean`, passed to `Footer`'s `showCertification` | `true` |

The frame every public page sits inside: the skip link, `Header`,
`<main id="main" tabindex="-1">`, `Footer`. It reads the navigation and the
settings itself, so a page passes only its own title and description, plus
`footerCertification={false}` on the one page that shows the badges itself
(About, spec 0010).

- **Do** import this in every page under `src/pages/`. `BaseLayout` is the bare
  document shell and is for the dev only style guide. A page that imports the
  wrong one loses its header and footer **with no error**: that is the first
  thing to check when a page renders bare.
- It declares `--header-h` (`4.5rem`, `5rem` at `lg`), the height of the header
  card's box. It has four readers: the header bar, the mobile panel's top
  inset, and the home hero's pull up and matching top padding. That value, the media
  query beside it, and `DESKTOP_QUERY` in `src/scripts/nav.ts` all describe
  Tailwind's `lg`. Nothing enforces that they agree, so a breakpoint change
  needs all three.
- The one inline script on the site lives here, in the head, and sets the `js`
  flag before the first paint. **Do not** add anything to it.

### `Header` · `src/components/ui/Header.astro`

| Prop | Type | Default |
|---|---|---|
| `items` | `readonly NavItem[]` (required) | |
| `cta` | `Link` | none, and then no button renders |
| `ui` | `NavUi` (required) | |
| `logo` | `Settings['logo']` (required) | |
| `siteName` | `string` (required) | |
| `currentPath` | `string` (required) | |

Sticky, one constant height, a `panel` card, and it registers **no scroll
listener**.

- It is a full width `panel` card flush with the top: `rounded-b-card` bottom
  corners, no shadow, and no bottom border. The card is the same on every
  page. Only the home hero slides under it; every other page starts below it.
- Links are `ink-strong`, turning `accent` on hover; the active link is
  `heading` with an `accent` underline. The dropdown and the mobile panel are
  `panel` too.
- `--header-h` is the card's box, not its corner curve. Anything
  that makes the header taller (padding, a bigger logo, a second row) changes
  `--header-h` in the same edit, or the home hero's copy slides under the card.
- While the mobile menu is open the corners square off, so header and panel
  read as one sheet. That rule lives in the header's
  `is:global` CSS and wins over the utilities only because it sits outside
  Tailwind's layers. **Never** move it into a layer.

- The nav is in the DOM twice, the desktop bar and the mobile panel, inside one
  `<nav>` landmark. Every control's id is fixed by spec 0004 because
  `aria-controls` needs a stable target and SERVICES exists twice.
- Both panels ship **open** in the HTML and the CSS closes them, gated on the
  `js` flag. **Never** invert this: shipping them closed would hide every
  service link from a visitor whose JavaScript failed.
- Active marking lives here and nowhere else. The matching link carries
  `aria-current="page"` and the underline, in both copies; only one copy is ever
  in the accessibility tree, since the other is `display: none` at that
  breakpoint. On a service page SERVICES takes the underline and **no**
  `aria-current`, because the current page is the service, not the group.
- **Section marking** (spec 0015): a nav link other than `/` also takes the
  underline, again with **no** `aria-current`, when the current path continues
  below its `href` at a `/` boundary. So on `/project/harbour-tower` the
  Projects item is underlined, while `/projects` would never mark `/project`.
  Put together: the underline when `isCurrent(href) || isSectionActive(href)`,
  `aria-current="page"` only when `isCurrent(href)`. It is one generic rule,
  so any future nested route gets it with no extra code.
- No services in the content means no SERVICES control at all, in either copy.

### `Footer` · `src/components/ui/Footer.astro`

| Prop | Type | Default |
|---|---|---|
| `items` | `readonly NavItem[]` (required) | |
| `ui` | `NavUi` (required) | |
| `legal` | `readonly Link[]` (required, may be empty) | |
| `settings` | `Settings` (required) | |
| `showCertification` | `boolean` | `true` |

A `canvas` band with a `line` hairline on top: brand, contact, and
certification, three columns at `lg`, two at `md`, one below. Copy is
`heading`, links and contact icons turn `accent` on hover, and its marked copy
goes through `Emphasis`. The base ring passes there, so no `focus-contrast`.
It shows the one light logo (`settings.logo`), the same as the header. The
badges carry their own light tiles and sit straight on the band, with no
strip behind them.

- **The hidden panel** (spec 0010): with `showCertification` off, the
  certification column is left out and the brand and contact columns share
  the row, two at `md` and at `lg`. Only `/about-us` turns it off, through
  `PageLayout`'s `footerCertification`, because that page shows the same
  badges in a band of its own. Every other page's footer is unchanged, and the
  badges appear once per page.

- Both link columns come from the same `getNavigation` call the header uses, so
  the two can never fall out of step and a fourth service file appears in both.
- Footer links **never** carry `aria-current`. That belongs to the header, so a
  screen reader hears the current page once.
- An empty `social` list drops the whole block, and an empty `legal` list leaves
  just the copyright. Neither renders an empty row.
- Social links open in a new tab and carry `rel="noopener noreferrer"`.


### `MediaText` · `src/components/ui/MediaText.astro`

| Prop | Type | Default |
|---|---|---|
| `heading` | `string` (required) | |
| `headingId` | `string` (required), the id the section points at | |
| `paragraphs` | `readonly string[]` (required) | |
| `image` | `{ src: ImageMetadata; alt: string }` | none |
| `imageSide` | `'start' \| 'end'` | `'start'` |

A heading, paragraphs, an optional slot for a list, and an optional photo
beside them. The home overview used it (spec 0005) until that band was cut,
and today only `/styleguide` shows it; spec 0010 gave About its own bands
instead. The home presence band used it until spec 0005's revision gave that band its
own map layout (`PresenceBand`, below).

- **Do** flip `imageSide` between two on one page, so the second does not read
  as the first printed again.
- Its grid carries `data-reveal-stagger`, so the copy and the photo reveal one
  after the other. The attribute is inert until a page imports
  `src/scripts/reveal.ts` (today only the home page does), so About keeps a
  still `MediaText` unless it opts in.
- Mobile always stacks copy first, photo second, whichever side the photo takes
  at `lg`. `imageSide` only moves the photo once there are two columns.
- **Renders correctly with no image**: the copy becomes one centred reading
  column rather than half a grid with an empty other half.
- The photo is lazy with a reserved 3:2 box, so nothing moves as it arrives.
- The slot renders after the paragraphs. **Do not** put a heading in it; the
  component owns the only heading in this block.

### `StatsBand` · `src/components/ui/StatsBand.astro`

| Prop | Type | Default |
|---|---|---|
| `heading` | `string` | none, and then no `h2` |
| `headingId` | `string`, the id the section points at | none |
| `items` | `readonly StatItem[]` (required) | |
| `lang` | `Locale` (required) | |
| `entranceFrom` | `number`, the first figure's `--entrance-step` | none, and then no load entrance |

One figure per stat under an optional heading, two columns on mobile and four
at `md`, centred and never wider than `content`. The About page's first band
uses it with no heading (spec 0010), so the list is named by that band's `h1`.

- **The look** (spec 0010): each number bold `accent` at `text-h1` (7.71:1
  on canvas), each label semibold `ink-strong` (15.83:1).
- `entranceFrom` gives every figure the `entrance` utility with steps counting
  up from it, so the figures follow whatever the band animated before them.

- **The finished numbers are rendered at build**, already grouped for `lang`
  (so `1200` reads as `1,200`). `src/scripts/counters.ts` animates them when
  the band scrolls in, and only ever replaces text that is already correct. No
  JavaScript, a failed script, or reduced motion all leave the right figures on
  screen.
- This is the one component in the system that ships client JavaScript, and it
  is the only exception to the "no component ships client JavaScript" rule.
  It degrades to nothing, which is the whole reason it is allowed.
- It writes two `data-` attributes the script needs and nothing else can
  supply: `data-count-to` (the raw value, so no script parses `1,200` back) and
  `data-locale` (because a browser script cannot see `Astro.currentLocale`).
  **Do not** drop either when restyling.
- Each stat is a `<dl>` group, label as the term and number as the definition,
  shown in reverse so the number sits on top. **Do not** flatten it to `<div>`s.

### `Emphasis` · `src/components/ui/Emphasis.astro`

| Prop | Type | Default |
|---|---|---|
| `text` | `string` (required), one line of content copy | |
| `onPhoto` | `boolean`, the line sits on a photo | `false` |
| `strongClass` | `string`, extra classes for the `**` runs | none |

The one place marked copy becomes markup (spec 0010). Content marks a phrase
with one of two pairs, and the schema's `emphasisText` checks every line at
build (`src/lib/emphasis.ts`):

- `**phrase**` is semibold in the surrounding colour. The home presence band
  passes `strongClass="text-ink-strong"` to keep its darker bold.
- `==phrase==` is semibold `accent`, legible on every dark surface, or
  semibold `heading` when the caller passes `onPhoto`, because brass over the
  scrim is 2.88:1. Only the Project hero's intro passes it. The `surface` prop
  was removed on 2026-10-09.
- Marks must close with the same mark and may never nest or overlap. A line
  that breaks either rule fails the build, quoting the line.
- It renders inline runs and no wrapper, so the caller owns the `<p>` and its
  colour. **Do not** write a `splitEmphasis` loop in a component again.
- A `==` phrase is fine on either pattern (`accent` over a stripe line reads
  6.66:1).

### `Accordion` · `src/components/ui/Accordion.astro`

| Prop | Type | Default |
|---|---|---|
| `name` | `string` (required), the group's shared `<details name>` | |
| `items` | `readonly { title: string; text: string }[]` (required) | |

Disclosure items, one open at a time (spec 0010), for the About page's
capability band and ready for the service pages. The browser's own
`<details>` and `<summary>`, with no script.

- Every item shares `name`, so opening one closes the other; the first ships
  `open`. A closed item's text stays in the HTML.
- **Closed**: an `accent` filled bar, the title bold `on-accent` at `text-h3`
  (7.71:1), a `plus` in a `canvas` circle at the end. **Open**: a `panel` card
  with a `line` border, the title `accent` (5.04:1), the circle `raised`, a
  `minus`, and the text below with its marks.
- **The icon is `accent` open or closed** (7.71:1 on the `canvas` circle,
  6.84:1 on `raised`). Without `text-accent` it would inherit the closed
  title's `on-accent`, the circle's own colour, and vanish.
- The whole summary is the target, at least 44px tall, and toggles with a
  click, a tap, Enter, or Space. It holds plain text, never a heading.
- The group carries `focus-contrast`, so a summary gets the two colour ring:
  the `accent` ring would vanish against a closed brass bar. It passes on an
  open `panel` item too.
- The `accordion-item` utility in `global.css` hides the browser's own
  triangle and holds the slide (`## Focus and motion`).

### `ContactCard` · `src/components/contact/ContactCard.astro`

| Prop | Type | Default |
|---|---|---|
| `icon` | `IconName` (required) | |
| `heading` | `string` or a `Link` (required) | |
| `body` | `string` or a `Link` | none |

One of the contact page's three cards (spec 0011): a 56px `accent` filled
icon, hidden from assistive tech, above an `h3`, then the value, centred on a
`panel` card.

- The heading bold `accent` at `text-h3` (5.04:1), the value `ink-strong`
  (10.35:1).
- The email card's heading is the address itself, as a `mailto:` link; the
  phone is a `tel:` link built by `telHref` in `src/lib/contact.ts`
  (digits and a leading `+` only).
- Long values wrap anywhere rather than overflow the card.

### `CtaBand` · `src/components/ui/CtaBand.astro`

| Prop | Type | Default |
|---|---|---|
| `heading` | `string` (required) | |
| `headingId` | `string` (required), the id this band points at | |
| `text` | `string` (required) | |
| `button` | `Link` (required) | |

The closing call to action: a self contained accent band, always brass, taking
no tone. Spec 0005 kept it for the service pages, but spec 0013 closed them
inside their process band instead. The Project page closes with it (spec
0014), and so does every project detail page, fed `projectPage.detail.cta`
(spec 0015).

- **It is not a `Section` with a third tone**, and that is the point. Two tones
  and both dark is what lets every other component name its colours directly
  and never read a tone variable. An accent `Section` would reopen all of it.
- It borrows `Section`'s frame (the band classes above) rather than wrapping
  it, because wrapping would mean giving `Section` the tone prop this avoids.
  If a third tone ever becomes right, this component collapses into it.
- Its link is built from `ctaLinkClass` in `styles.ts`, never from `<Button>`
  with an override class. Tailwind's generated order decides which background
  utility wins, not the order classes appear in the attribute, so an override
  is a silent coin flip.
- `on-accent` heading and text on the brass (7.71:1), each set explicitly
  because the base layer makes an `h2` `heading` (2.05:1 here). The link is a
  `canvas` fill with a `heading` label (15.83:1), lifting to `panel` on hover
  (10.35:1). The band carries `focus-contrast`, so its link shows the two
  colour ring (below), not the brass one.

### `ServiceCard` · `src/components/home/ServiceCard.astro`

| Prop | Type | Default |
|---|---|---|
| `title` | `string` (required) | |
| `summary` | `string` (required) | |
| `subServices` | `readonly string[]` (required), 3 to 6 | |
| `href` | `string` (required) | |
| `illustration` | `{ src: ImageMetadata; alt: string }` (required) | |
| `cue` | `string` (required) | |
| `class` | `string`, merged onto the card's root | none |

The home services band's card (spec 0005), home only. Top to bottom and
centred: the shared illustration at 160px tall, the title as an `h3`, the
summary, the sub services, and the cue with an `arrow-right`, pinned to the
bottom so the cues of a row line up. `panel`, `rounded-ui`, no shadow. The
illustration is the dark version (`service-illustration-dark.png`): a
transparent background with cream and brass strokes.

- **One link, one tab stop**, the same stretched title link as `Card`. The cue
  is text. **Do not** put a link, button, or field inside it.
- The sub services are a real `<ul>` drawn as one centred line split by pipes,
  as the reference card is. The items are inline so the line wraps like prose,
  and the pipes are `aria-hidden`. **Do not** turn it into a `<p>` with the
  pipes typed in: a screen reader would lose the list.
- At rest: title `ink-strong`, summary `ink-muted`, list `ink`, cue and arrow
  `accent`.
- **Hover and keyboard focus look the same**: a wash from `panel` at the top
  to `accent-deep` (Coffee) at 70 percent at the bottom rises from the card's
  bottom edge to its top over 200ms, a 4px `accent` border appears on the left
  and right (an overlay, so nothing shifts), and the card rises 4px. Focus
  also shows the `accent` ring.
- **The wash rises, it does not fade**: the layer is scaled to nothing at rest
  and grows back from `origin-bottom`, the `scale` property and the same idiom
  as `heading-rule`, so it stays clear of the card's own `translate` lift and of
  the scroll reveal's `transform`. Leaving the card runs it back down the way it
  came. With reduced motion asked for, the full wash is simply there.
- **On the wash every word and icon is `heading`**, at least 7.52:1 at the
  wash's darkest point, `accent-deep` at 70 percent over the `panel` (the
  composite `#614438`). **Never** put `accent` on it: brass on the wash is
  3.66:1, which is why the cue turns `heading` with the rest.
- The lift is the `translate` property under `motion-safe`, never `transform`,
  so it composes with the scroll reveal. With reduced motion the colours still
  change, at once, and the card does not rise. `hover:` applies only where a
  pointer can hover, so a tap never leaves a card stuck in its hover state.
- Each card stays a direct child of the band's `data-reveal-stagger` grid.
- **The row shows what `home.services.featured` lists** (spec 0013), one to
  three cards in that order, never every service. Three fill the row as
  always. With one or two, each card keeps its width in a row of three and
  the set sits centred, never leaving an empty cell on one side: the grid
  switches to six columns at `lg`, each card spans two, and the first card's
  start column centres the set (four columns and a span of two for a single
  card at `md`). The classes are a map keyed by the count in `index.astro`,
  handed to each card through `class`.

### `PatternBand` · `src/components/ui/PatternBand.astro`

| Prop | Type | Default |
|---|---|---|
| `surface` | `'stripe' \| 'dots'` (required) | |
| `labelledBy` | `string` (required), the id of the band's heading | |
| `class` | `string` | none |

A band on a pattern (spec 0013), the surface of the service pages' features
and process bands. Both values render a `canvas` `Section`: `stripe` under
`bg-diagonal`, `dots` under `bg-dots` (formerly `light` and `dark`). See
`## Tones` for the measured pairs.

- It owns the pattern, nothing inside it. What sits there takes the same band
  strings in `styles.ts` on either (`bandHeadingClass`, `bandBodyClass`,
  `bandCardClass`, `bandTileClass`, `bandIconClass`), and the `BandPattern`
  type is read only here.
- **Do not** add a tone to `Section` for it, and **do not** use it for a band
  with no pattern; that is a plain `Section`.

### `CarouselDots` · `src/components/ui/CarouselDots.astro`

| Prop | Type | Default |
|---|---|---|
| `count` | `number` (required), one dot per photo, two or more | |
| `class` | `string` | none |

The dots under a photo carousel, shared by the home hero and each service
intro (spec 0013), run by `src/scripts/carousel.ts`.

- One real button per photo, named "Show photo N of M", a 24px hit area
  around a small mark: `heading` at 50 percent, or solid `heading` for the
  photo showing (`aria-current`). At 50 percent a dot reads 4.73:1 on
  `canvas`; at 30 percent it would be 2.48:1 and lost on a bright hero photo.
- The row ships `invisible` and the script reveals it, so with no JavaScript
  there is nothing dead to tab to. **Do not** render it for a single photo.
- The label is fixed English, a follow up owed before a second language.

### `PresenceBand` · `src/components/ui/PresenceBand.astro`

The global presence band's inside (spec 0005): a ruled heading, the dotted
globe with its locations (spec 0017), and the copy with the why choose list. It
moved from `src/components/home/` to `ui` when the service pages began to show
it too (spec 0013). The page wraps it in a striped `Section`, and its copy is
`home.presence`, or a service's own presence `content`.

The globe (spec 0017) is cobe on a canvas, drawn by `src/scripts/globe.ts`:
land dots in the warm grey of `ink-muted`, a faint grid over the sea, and a rim
of glow a little lighter than `raised`. Each location is a `PresenceMarker`
(`src/components/ui/PresenceMarker.astro`):

- **Office** (the headquarters or an office): a 14px `#3ddc97` green dot with
  a pulsing halo, its name always shown.
- **Project**: a 10px `#ff5d52` red dot, its name on hover.

These two colours belong to the globe alone and are written as hex, outside
the palette and the accent role rule, by the engineer's choice. Size and halo
differ as well as hue, and the green is much lighter than the red, so the kinds
still read apart without colour vision. Every label sits on a `canvas` chip at
80%, so it reads over land, sea, or a stripe. A legend under the globe names
both kinds, and the places reach a screen reader as two visually hidden lists.

Without JavaScript or WebGL the same markers sit on the flat dotted map
(`world-map.svg`), and the box clips anything that would run past its edge.

### The service bands · `src/components/service/`

One component per `type/layout` a service entry's `sections` may name (spec
0013): `IntroCarousel`, `FeaturesCards`, `FeaturesSplit`, `AudiencesGrid`,
`ProcessTimeline`, and `PresenceMap`, the thin adapter onto `PresenceBand`.
Each takes the same props, `block` (its own block), `headingId`, and
`entranceFrom?`, and renders only the inside of its band; the route owns the
band, its tone, and its heading id.

- **A look only one service wants is a new layout**, never an edit to a
  shared band component. An existing component changes only when every
  service using it should change.
- The patterned bands (features, process) take only the band strings in
  `styles.ts`: `heading` headings, `ink` text, `panel` cards with a `line`
  border, and `accent` icons, the same on `stripe` and `dots`.
- Grids that fit any count use literal classes (`lg:grid-flow-col
  lg:auto-cols-fr`), never a class built from a list's length.
- The intro's paragraphs each sit beside a 4px `accent` bar, a `::before`
  filled with `--color-accent`; the audience icons are `fill-accent`; the
  process circles are `accent` fills carrying `on-accent` numbers, and the
  line joining them is the decorative `line` (Coffee).
- The intro's photo frame is `panel`, so an empty frame still reads as a box
  on `canvas`.

### `ProjectGallery` · `src/components/project/ProjectGallery.astro`

| Prop | Type | Default |
|---|---|---|
| `labelledBy` | `string` (required), the page's `h1` id | |
| `tiles` | `readonly GalleryTile[]` (required), one or more, from `galleryTiles` | |
| `cue` | `string` (required), `projectPage.tileCue` | |
| `entranceFrom` | `number` | none |
| `filter` | `{ listId, formId, lang, copy }`, the filter's side of the wall | none |

The Project page's photo wall (spec 0014, revised 2026-10-09 after the
engineer's reference): every project as a wide photo tile, one column, then
two across from `md`.

- **Its own band, not a `Section`**: `canvas`, with the band frame's side gutters
  and bottom padding (`bandPaddingBottomClass` in `styles.ts`), and a top
  padding equal to the gutter, so the first row sits as far below the hero as
  the tiles sit from the window's sides. It takes **no maximum width**, so the
  wall runs the full window width inside the gutters. Three bands do this,
  each written down: this wall, and a project detail page's cover and gallery
  (spec 0015). The list is labelled by the page's `h1`; the wall adds no name
  of its own.
- **Every tile is a fixed 3:2 box** (`aspect-3/2`), **4:3 from `md` to `lg`**
  (`md:aspect-4/3 lg:aspect-3/2`), where two columns make the tiles narrowest
  and the extra height is what fits the unfolded facts under a 60 character
  title. `rounded-ui`, on a `panel` fill that shows only while the photo loads.
  The box is reserved before the photo arrives, so nothing shifts. The photo
  covers the box, centred, so a tall tower is cropped; choose photos with
  that in mind.
- **A `bg-scrim` layer covers the whole photo**, so every word on the tile is
  `heading` at 5.91:1 at worst over any photo. Lighter would break that (the
  engineer chose the guarantee over the reference's lighter wash).
- **At rest**: the title (`h2`, `text-h3`, bold) and, 4px under it, the
  summary (`text-small`, medium) on one line (`truncate`; the whole line stays in the HTML),
  centred at the tile's foot. Project titles are capped at 60 characters in
  the content schema, which is what keeps them inside the tile at every width,
  at rest and unfolded.
- **On hover, or while the tile's link has keyboard focus**: the scrim deepens
  to `scrim-strong` over 500ms, and under the summary the cue and the facts
  unfold (`tile-info` in `global.css`, a grid row from nothing to its own
  height), lifting the title by exactly what appears. The cue is "Read more"
  in a `heading` outlined pill (`rounded-full`), `aria-hidden`; the facts are a
  `<dl>` of storeys, floor area, and LOD, from `tileFacts`, labels from
  `projectPage.tileFacts`, each only when the project has it. A touch screen
  has no hover (`hover:` needs a pointer that can hover), so there a tile
  stays at rest and a tap opens the project.
- **The seams are 8px** (`gap-2`), the grid gap's one written exception.
- **Every tile is one link** to its project page, following the project tile
  link rule below.
- **Three motions, each on its own element and property**, so none
  overwrites another: the hover zoom on the `Image` (`scale`), the scroll
  parallax on the photo frame and the words (`transform`, below under Focus
  and motion), and the load entrance and scroll reveal on the `<li>`.
- **`overflow-clip` and `isolate`** on the tile: the stacking context keeps
  the moving, zoomed photo clipped to the rounded corners.
- **The filter's side**: each `<li>` carries `data-service`, `data-country`,
  and `data-area` from `galleryTiles` (`src/lib/project-gallery.ts`). With
  `filter`, the band also holds an `sr-only` `role="status"` line the script
  fills ("4 projects shown") and a hidden "no projects match" block, a
  centred `h2` at `text-h3`, one `text-lead` line, and a secondary button
  that is a native `type="reset"` for the hero's form.
- The first row (two tiles) loads eagerly and every later tile lazily. The
  page never renders the wall with no projects; it shows the empty state
  instead.

### `ProjectHero` · `src/components/project/ProjectHero.astro`

| Prop | Type | Default |
|---|---|---|
| `heading` | `string` (required) | |
| `headingId` | `string` (required) | |
| `intro` | `string` (required), plain or `**bold**` | |
| `image` | `projectPage.hero.image` (required) | |
| `filter` | `{ id, listId, copy, choices }`, absent with no projects | none |

The Project page's opening band (spec 0014, revised 2026-10-09), after the
engineer's reference: a full width photo, the page's `h1` and intro centred
on it, then the filter.

- **A photo band, not a `Section` tone**, built like the home hero: it slides
  up under the header card by `--header-h` and pads its content down by the
  same amount, borrows the band frame's gutters and padding, and carries
  `focus-contrast`. The photo loads eagerly at high fetch priority, the
  page's largest paint, and a `bg-scrim` layer covers all of it, so every
  word on the band is `heading` at 5.91:1 at worst. The `h1` takes no accent
  rule and no capitals, like the home hero's.
- **Its intro passes `onPhoto` to `Emphasis`**, so a `==` phrase there renders
  bold `heading`, never brass: `accent` over the scrim is 2.88:1.
- **The filter is one named `<form>`** (a landmark, `projectPage.filter.label`),
  `no-js:hidden`, so with JavaScript off it is not there at all and the
  visitor gets the whole wall; with it on it is there from the first frame,
  so nothing shifts. Each field's `name` is the tile attribute it matches.
  - **The service tabs**: radio buttons in a `fieldset` with an `sr-only`
    legend, so they are one tab stop and the arrow keys move the choice.
    The input is `sr-only`; its label draws the tab, `text-lead` `heading`,
    the chosen one underlined in `heading` (2px). Cream, not brass: brass over
    the scrim is 2.88:1. Every tab is the same weight, so choosing
    one never shifts the row. The two colour focus ring is drawn on the
    label (`peer-focus-visible:`), since the input cannot show one. The first
    tab is "All"; the rest are the services that have projects, in the
    services' `order`.
  - **The bar**: a `bg-scrim` panel with a `line` hairline, holding the
    country and floor area dropdowns, native `<select>`s in the shared field
    box (`selectClass`, the same on every surface) with the shared field
    labels above them, side by side from `md`. Each starts on
    "Any". Countries are the text after the last comma of each project's
    `location`; the floor area bands are `projectPage.filter.areaRanges`
    (`min` counts in, `max` does not), and a band no project falls in is left
    out. So no single choice empties the wall; only a combination can.
- On load the `h1`, the intro, and the filter fade and rise in through the
  CSS `entrance`, steps 0 to 2; the wall's first row follows at 3 and 4.

### The project tile link rule · `ProjectGallery` and the home `ProjectShowcase`

Every project tile on the site, on `/project` and in the home showcase,
follows one rule (spec 0015, replacing spec 0014's "tiles are not links" and
spec 0005's "the photo stays still"):

- **Exactly one link, one tab stop**: the title's text is the link (the `h2`
  on `/project`, the `h3` on home), and its `::after` is stretched over the
  whole tile (`after:absolute after:inset-0`, the `Card` pattern). Its
  accessible name is the project title, and the pointer shows anywhere on the
  tile. Nothing else inside it is focusable. On `/project` the words drift
  with the parallax, so the `::after` reaches 24px past them on every side
  (`after:-inset-6`) and the tile clips the rest: the whole tile stays
  clickable wherever the words have drifted.
- **The cue**: "Read more" from content (`projectPage.tileCue`,
  `home.projectShowcase.cue`), `heading`, `text-small font-semibold`,
  **`aria-hidden`**, so a screen reader hears six distinct titles rather
  than six "Read more"s. On home it sits under the summary with an
  `arrow-right`; on `/project` it is a `heading` outlined pill that unfolds on
  hover (above).
- **Keyboard focus** draws the `accent` ring round the whole tile
  (`link-focus:outline-accent` on the `<li>`), never round the title
  alone; the link itself sets `focus-visible:outline-none`.
- **Hover zooms the photo alone**, 105% over 500ms, `motion-safe`: `group`
  and `isolate` on the `<li>` with its clipping (`overflow-hidden` on home,
  `overflow-clip` on `/project`, for the parallax), and
  `transition-[scale] duration-500 ease-out motion-safe:group-hover:scale-105`
  on the `Image`. The box and the layout never move. On home the caption
  stays still; on `/project` the scrim deepens and the cue and facts unfold.
- The home band's "View all projects" button stays, the one way to the list.
- A gallery tile on a detail page is **not** a project tile: no link, no cue,
  no zoom, the default cursor.

### `IntroBand` (project) · `src/components/project/IntroBand.astro`

| Prop | Type | Default |
|---|---|---|
| `heading` | `string` (required) | |
| `headingId` | `string` (required) | |
| `intro` | `string` (required), may carry marks | |
| `context` | `{ backLink: Link; service: Link }` | none |
| `entranceFrom` | `number`, the first entrance step | `0` |

The `/project` intro (spec 0014), reused by every project detail page (spec
0015). It renders the inside of a `canvas` `Section` labelled by its `h1`.

- **Without `context`** it is exactly the `/project` intro: the ruled `h1` in
  capitals by CSS only, then one `text-lead` paragraph in the narrow width.
- **With `context`**, a block above the `h1` holds two left aligned links, each
  44px tall for touch: the back link (an `arrow-left` and its label,
  `text-small`, `accent`) and, on its own line, the project's service
  (`text-small font-semibold tracking-wide uppercase`, `accent`) linking to
  its service page. Both underline on hover. `context` carries both links
  together, so the band has both or neither.
- **The entrance** counts up from `entranceFrom`: the links block, then the
  `h1`, then the paragraph.

### The project detail page · `src/pages/project/[slug].astro`

One page per project at `/project/<slug>` (spec 0015), six bands: the intro
(`IntroBand` with `context`), the cover, the story, the gallery, the next
project link (two or more projects only), and the accent `CtaBand`. Every word
comes from the project's entry, its service, `projectPage.detail`, or the site
name; the derived values (the next project, the facts rows, the head) come
from `src/lib/project-detail.ts`.

- **`ProjectCover`**, the cover band: `canvas`, the band gutters, **no maximum
  width** and no vertical padding. One photo box, `rounded-ui` on a `panel` fill
  that shows only while it loads, fixed at 4:3 below `md`, 16:9 at `md`, and
  21:9 at `lg`, so its space is reserved before the photo arrives. The photo
  covers it, loads eagerly with high fetch priority (the page's largest
  paint), and has `widths` up to 2400. No caption, no link, no hover.
- **`ProjectStory`**, the story band: a `canvas` `Section`, no label. One column
  below `lg`, the facts panel first; at `lg` three columns with a 32px gap,
  the write up across the first two and the facts panel in the third, both at
  the top. The DOM order stays facts first and the placement is explicit
  (`lg:col-span-2 lg:row-start-1`, `lg:col-start-3 lg:row-start-1`), never auto
  flow. Each write up section is an `h2` at `text-h3`, then its paragraphs
  through `Emphasis`, 16px apart, with 48px between sections.
- **The facts panel**: `bg-panel`, `rounded-ui`, 24px padding (32px from `md`),
  an `h2` at `text-h3`, then one `<dl>`: each `<dt>` a `text-small font-semibold
  tracking-wide uppercase` label in `ink-muted`, each `<dd>` the value in
  `ink-strong` with `wrap-break-word`, so a long place or client wraps inside
  the panel. A fact the entry leaves out has **no row at all**, never an empty
  `<dt>` or a dash. The rows and their formatting (`42,000 m²`, `LOD 300`,
  `Revit, Navisworks`) come from `projectFacts`, never a component.
- **`ProjectPhotos`**, the gallery band: `raised`, the band gutters and padding,
  **no maximum width**. A left aligned ruled `h2` names the band and its list.
  The wall is `wall.ts`: one, two, then three columns, 8px seams, fixed 5:4
  tiles on `panel` (the `/project` wall's old shape; that wall left it on
  2026-10-09). A gallery tile is only a photo with its
  `alt`: no caption, nothing focusable, the default cursor, no hover, and
  every photo lazy.
- **`NextProject`**, the way on: a `canvas`, narrow `Section` holding one centred
  link to the next project by `order` (the last wraps to the first). Inside
  it, the label (`text-small font-semibold tracking-wide uppercase`,
  `ink-muted`) on its own line, then the title (`text-h3 font-semibold`,
  `ink-strong`) and an `arrow-right` in `accent`. Its name is the label and
  the title together; the title underlines on hover; focus shows the
  `accent` ring. With one project the band is absent, so the link never
  points to its own page.

## Focus and motion

Two rules, chosen by the surface, and no exceptions (spec 0003, revised
2026-10-09):

- **On every dark surface**: a 2px solid `--color-accent` outline with a 2px
  gap, on `canvas` (7.71:1), `raised` (6.84:1), `panel` (5.04:1), and either
  pattern. This is the base rule in `global.css`, and it covers the home
  intro band, the pattern bands, and the footer with nothing placed on them.
- **On a photo or an accent fill** (the home hero's photo, the Project page
  hero's photo (its service tabs draw the ring on their label,
  `peer-focus-visible:`, since the radio itself is invisible), the contact
  form band, `CtaBand`'s brass band, and the `Accordion`'s brass bars): a two
  colour ring, a 2px `--color-canvas` band directly around the control and a
  2px `--color-heading` band outside it. It comes from the `focus-contrast`
  utility in `global.css`, placed on the band's `<section>` (on the
  `Accordion`, its wrapper, so an open `panel` item takes it too, which passes
  there), so everything focusable inside inherits it and no control sets its
  own ring colour. Two colours is what makes it work on any background:
  against any colour at all, one of the two bands reaches at least 3.98:1.
- The rule belongs to the surface, not the control. `focus-contrast` sits
  only on photo bands and accent fills, never on a plain dark band; a new
  photo or accent surface adds it, and never invents a third ring.
- Either way, mouse clicks show nothing (`:focus-visible`), and width and
  offset are the same 2px.
- When the visitor's system asks for reduced motion, every transition and
  animation is cut to 0.01ms, so state changes are instant.

Scrolling glides (spec 0016). On a desktop, wheel scrolling eases to a gentle
stop on every page (`src/scripts/smooth-scroll.ts`, on Lenis), and anchor jumps
and the skip link glide through `scroll-behavior: smooth` on `html`, still
stopping below the sticky header. Touch keeps the device's own momentum.
Reduced motion turns both off, and with no script the page scrolls natively.

Motion is enhancement only. The built HTML draws every band complete and every
accent rule full width, and no CSS rule hides anything waiting for a script.
Three plain scripts move things on the home page, and each stops entirely for
reduced motion. Two of them move two things each: the carousel script moves the
hero's photos and the panel over them, and the reveal script moves the bands
and the accent rules under the section headings. The service pages use the same
carousel and reveal scripts and add none (spec 0013).

- **The scroll reveal**, the first half of `src/scripts/reveal.ts` (spec 0005).
  Below the hero and the intro band, these fade and rise once as they scroll
  into view: the services heading block and then its cards, the overview's
  copy and photo, the presence heading and then its copy and map, the showcase
  heading block, its tiles, and its button. An element opts in with
  `data-reveal`; a container whose direct children reveal one after another
  carries `data-reveal-stagger`. Both are
  written in markup, never in content, and do nothing on a page that does not
  import the script. Each element fades from 0 and rises 24px over 600ms with
  an ease out, starting when 20 percent of it is in view; a stagger child also
  waits 80ms per hidden sibling before it. Only elements entirely below the
  viewport when the script starts are hidden, so nothing on screen blinks. The
  fade-and-rise never replays, and when it ends the element holds no inline
  style, so hover styles are untouched. Built on `motion` (one of its two
  importers, with `parallax.ts`): `animate` from
  `motion/mini` and `inView` only, nothing else from the package.
- **The heading rule**, the second half of the same module (spec 0005). The
  accent rule under a section heading draws itself from nothing to the full
  width of the words as the heading arrives, over the same 600ms with an ease
  out, starting at the same 20 percent. When the visitor is scrolling down the
  page it grows left to right, from nothing to full width. When they are
  scrolling up it plays the same draw in reverse: as soon as the heading
  starts to sink below the foot of the viewport, the rule runs back from full
  width to nothing, its right end travelling to the left edge, over the same
  600ms. Which way the heading went is read from where it sat against the
  middle of the viewport, never from a scroll listener. A heading the visitor
  scrolls past through the top of the viewport keeps its full rule, so it is
  already drawn when they scroll back up to it. A heading inside a block that
  is still fading and rising waits for that block to come to rest, so the
  block settles and then the line is drawn under it. A rule that sinks out of
  view before it has finished running back is set to nothing instantly, one
  scrolled past through the top too fast to have drawn is set to full width
  instantly, both only while entirely off screen and so never seen, and it
  draws again on the next crossing: unlike the fade-and-rise, this one
  replays for as long as the visitor keeps scrolling. A heading already on
  screen or above the viewport when the script starts keeps its full width
  rule, which is also what an anchor jump, a restored scroll position, and
  the back button land on. The look is
  the `heading-rule` utility and the motion hook is `data-heading-rule`,
  written in markup and never in content: a page that takes the class without
  importing the script gets a still, full width rule.
- **The carousel** (`src/scripts/carousel.ts`, the hero's script generalised
  by spec 0013), on the home hero and each service intro. It finds its root
  by `data-carousel` and inside it `data-carousel-slide`, the `CarouselDots`
  hooks, and two only the hero has, `data-carousel-arrow` and
  `data-carousel-panel`. With two or more photos it crossfades every 6s with
  a 1s fade, wrapping to the first. It holds while the pointer is over the
  root or focus is inside it; a dot or arrow shows a photo at once and gives
  it a full 6s. With reduced motion it never autoplays, and the controls
  still work. There is no pause button, a known WCAG 2.2.2 gap spec 0005
  records and spec 0013 carries to the service intros; a pause control is a
  follow up.
- **The hero scrim panel's entrance** (the same script). On every photo change,
  whether the clock, a dot, or an arrow asked for it, the panel holding the
  heading and its subheading fades from 0 and rises into place from 24px below
  over 600ms with an ease out, the scroll reveal's language, so the two moving
  things match. The two lines move together as one block, so their spacing
  never shifts; the button below the panel is outside it and stays still, since
  a control that slides away from the pointer is worse than a still one. It
  plays only on a change, never on the first paint: the hero is the largest
  contentful paint and nothing there may blink. The script finds the panel by
  `data-carousel-panel`, and animates it with the browser's own Web Animations
  rather than a class or `motion`, so the hero's script stays dependency free
  and each new entrance supersedes the one running. The animation does not
  fill, so the panel holds no inline style once it settles. With reduced motion
  it does not play at all (the `global.css` cut does not reach a Web Animation,
  so the script asks for itself).
- **The counter** (`src/scripts/counters.ts`), once per band, described under
  `StatsBand`.
- **The globe** (`src/scripts/globe.ts`, spec 0017), in the presence band. It
  fades in over the flat map in 700ms, turns one revolution a minute on its
  own, follows a drag (horizontal turns it, vertical tilts it a little), and
  coasts to a stop after a fling. The spin waits while a mouse is over it.
  Markers on the far side shrink to half and fade out, and pop back in 300ms
  with a slight overshoot (`cubic-bezier(0.34, 1.56, 0.64, 1)`) as they turn to
  the front, staggered by 40ms the first time. The office halo is Tailwind's
  `animate-ping`. With reduced motion there is no spin, coast, or halo, and a
  drag still turns it.
- **The load entrance**, the `entrance` utility in `global.css` (spec 0010),
  and no script at all. An element fades from 0 and rises 24px into place over
  600ms with an ease out, the scroll reveal's language, waiting 80ms per
  `--entrance-step`, which the caller sets in a `style` attribute. Today the
  About band: the `h1` at step 0, the paragraph at 1, the numbers from 2 (by
  `StatsBand`'s `entranceFrom`). It runs with JavaScript off, and under reduced
  motion it does not run, so everything is simply there. It moves by
  `translate`, so nothing around it shifts. **Never** combine it with
  `data-reveal` on one element; the About band takes no scroll reveal for that
  reason. The rule has three written exceptions, all for a band that is on
  screen at load on a desktop, where the scroll reveal never moves anything,
  and below the fold on a phone. Whichever applies moves it; the other stays
  out of sight.
  - The About capability band (spec 0012): its two columns take the entrance
    at the steps after the last number (`entranceFrom`, `2 + stats.length`)
    and stay in the scroll reveal's stagger.
  - The block right after a service intro (spec 0013, the same rule
    generalised): each of its reveal units, a `data-reveal` element or a
    direct child of a `data-reveal-stagger`, takes the entrance at the steps
    after the intro's last (`entranceFrom`, from `planServicePage`, the
    helpers in `src/components/ui/entrance.ts`, moved there from `service`
    by spec 0014). A presence block in that place takes none.
  - The Project page's gallery (spec 0014, revised 2026-10-09): its first
    two tiles, a desktop's first row, take the entrance at steps 3 and 4
    (`entranceFrom`) and stay in the list's scroll reveal stagger. Only
    those two, never every tile, so a long list never stacks up delay. On
    this page the entrance is motion's (below), a Web Animation, which a
    tile the filter brings back from `display: none` does not replay.
- **The accordion slide**, in the `accordion-item` utility (spec 0010). Where
  the browser supports `::details-content` and `interpolate-size` (Chrome and
  Edge today), a panel's height slides between nothing and its content over
  300ms with an ease out, both ways. Elsewhere, and under reduced motion
  everywhere, items open and close at once.
- The Contact page imports `reveal.ts` too (spec 0011): its intro band moves
  on load through the `entrance` utility (heading 0, paragraph 1, photo 2)
  and takes no `data-reveal`; in the form band the heading, then the form,
  then each card reveal on scroll, and the intro heading's rule draws with
  the scroll direction.
- The About page imports `reveal.ts` too: its capability band's two columns
  reveal one after the other when they start below the fold (and move by the
  load entrance when they start on screen, above), its certification band's heading block,
  paragraphs, and then each badge in turn, and both bands' heading rules draw
  with the scroll direction.
- The service pages import `reveal.ts` too (spec 0013): the intro's heading,
  then each paragraph, then the carousel move on load through the `entrance`
  utility (steps 0, 1 to n, then n + 1) and take no `data-reveal`. In each
  lower band the heading block reveals, then its cards, tiles, items, or
  steps one after another, then the process band's closing, and every ruled
  heading's rule draws with the scroll direction. A process step brings its
  stretch of the connecting line with it as it fades in. The block after the
  intro also takes the entrance, above.
- The Project page imports `reveal.ts` too (spec 0014, revised 2026-10-09):
  the hero's `h1`, intro, and filter move on load (steps 0 to 2) and take no
  `data-reveal`; the first row of tiles follows (above). **Every animation
  on the Project page is built with `motion`** (2026-10-09), so its load
  entrance is `src/scripts/enter.ts`, not the CSS `entrance`: the same
  fade and 24px rise over 600ms with an ease out, 80ms per `data-enter`
  step. A script cannot hide anything before the first paint, so the
  `data-enter` rule in `global.css` holds each one at opacity 0 from the
  first frame, the one written exception to "no CSS rule hides anything
  waiting for a script", bounded three ways: only with the `js` class, only
  when motion is welcome, and only for 2s, after which it shows the element
  anyway. The script lifts the hold the moment it runs, plays what is on
  screen, and leaves a tile below the fold to the scroll reveal. Small hover
  and colour transitions stay CSS.
- **The hero scroll** on the Project page (2026-10-09),
  `src/scripts/hero-scroll.ts` on motion's `scroll()`, scrubbed from the top
  of the page to the hero's bottom edge leaving the viewport, linear. The
  hero's three blocks (`data-hero-layer` wrappers around the `h1`, the
  intro, and the filter) rise beyond the scroll, the top one most (240px,
  160px, 80px), each setting off a tenth of the way after the one above, so
  they spread apart one after another; each fades to 0.5. Over the first half
  of the same scroll the header slides up by its own height (its sticky
  `top`, never a transform, which would capture the fixed mobile menu panel)
  and fades out, then is `inert` until the visitor scrolls back up into the
  hero. Scrolling up plays it all backwards, exactly. With the mobile menu
  open the header is held at rest (`!important` in `Header.astro`). Under
  reduced motion nothing moves and the header never leaves. Below the fold each tile reveals after the one before as
  it scrolls into view, and a tile the filter brings into view reveals the
  same way. The hero's `h1` has no rule. The empty state and the accent band
  do not move. On hover a tile's photo slowly zooms to 105% (`motion-safe`
  only), its scrim deepens, and its cue and facts unfold over 500ms (the
  `tile-info` grid row; under reduced motion they appear at once). The home
  showcase tiles zoom the same way (spec 0015) and unfold nothing.
- **The tile parallax** on the Project page (spec 0014, revised 2026-10-09),
  `src/scripts/parallax.ts` on motion's `scroll()`. As a tile crosses the
  screen, from its top entering at the bottom of the viewport to its bottom
  leaving at the top, its photo's frame (`data-parallax-photo`) slides from
  14% of its height above its place to 14% below, about 140px on a desktop
  tile, so the photo moves visibly slower than the page; its words
  (`data-parallax-text`) drift up 24px each way. Both sit exactly in place
  when the tile is mid screen, and the scroll is the easing (linear). The
  script marks each tile `data-parallax-on`, which grows the frame
  (`parallax-photo` in `global.css`) 20% past the tile at the top and the
  bottom, so the photo's edge never shows; without the script the photo is
  cropped no more than the still design. `scroll()` runs on the browser's
  own scroll timeline where it has one (Chrome, Edge, Safari), off the main
  thread, and tracks the scroll itself elsewhere (Firefox), so every browser
  gets it. It moves by `transform`, so the zoom (`scale`, on the `Image`)
  and the entrance and reveal (on the `<li>`) never collide with it. Under
  reduced motion the script stops before marking anything.
- Every project detail page imports `reveal.ts` too (spec 0015): the intro
  moves on load through the `entrance` utility, the back link and service line
  at step 0, the `h1` at 1, the summary at 2, and the cover at 3, and none of
  them takes `data-reveal`. On scroll the facts panel and each write up
  section reveal, then the gallery's heading block and its tiles one after
  another (`data-reveal-stagger`), and the `h1`'s and the gallery heading's
  rules draw with the scroll direction. The next project band and the accent
  band do not move.
- **Don't** give the hero or the intro band the fade-and-rise: the hero is the
  largest contentful paint, and the intro band already moves with the counter.
  What is banned there is revealing the band, not all motion on it. The intro
  heading's accent rule draws like every other section heading's, because the
  rule belongs to the heading treatment rather than to the band.

## Invariants

- Every colour, font size, radius, and container width resolves to a token.
- Both tones are dark and no component reads or sets a tone variable. `Section`
  is the only component that names a section tone.
- Coffee is never read. Text on a photo is only `heading`. `on-accent` lives
  only on an accent fill, and every heading or paragraph inside one carries
  `text-on-accent` explicitly.
- `focus-contrast` sits only on photo bands and accent fills.
- No shadows, and no retired colour name survives in `src/` (spec 0003, AC-16).
- Line height and letter spacing arrive with the size token, never written on a
  component.
- Only `md` and `lg` exist. Mobile is the unprefixed default.
- Tokens are defined once, in `global.css`. This file describes them and must
  match.
- Class maps return complete, literal class strings, each inside a `cx('…')`
  call so Prettier sorts them. **Never** build a class from fragments such as
  `` `bg-${colour}` ``: Tailwind only generates classes it can find written out
  in full.
- Tailwind scans only `src/`, and only code files. Content markdown is copy, not
  classes.
- A `Card` with `href` holds no interactive content in its slot.
- A React field placed directly in an `.astro` file gets an explicit `id`.
- Components never contain visible copy. Every word arrives through a prop or
  slot, from a content entry.
- Exactly six scripts ship, and all of them only enhance markup that already
  works: `Header` imports `src/scripts/nav.ts` (spec 0004); `StatsBand` and the
  home page's `IntroBand` import `src/scripts/counters.ts`, `Hero` and the
  service pages' `IntroCarousel` import `src/scripts/carousel.ts` (the hero's
  script, renamed and shared by spec 0013), and the home, About, Contact,
  service, Project, and project detail pages import `src/scripts/reveal.ts`
  (all spec 0005; About by spec 0010, which adds no script: its entrance and
  accordion are CSS and HTML; the service pages by spec 0013, the Project page
  by spec 0014, and the project detail pages by spec 0015, which add none
  either). `reveal.ts` holds two separate
  halves, the fade-and-rise reveal and the heading rule, in one file. The
  fifth is `src/scripts/project-filter.ts`, which the Project page imports
  (spec 0014, revised 2026-10-09): filtering a list is behaviour CSS cannot
  do from content driven choices, which is the reason this good the old
  four script rule asked for. Its form ships `no-js:hidden`, so without it
  the page is the whole wall and no dead control. The sixth is
  `src/scripts/parallax.ts`, the Project page's tile parallax (the same
  revision), which the engineer asked to be built on the project's animation
  framework after a CSS only version proved too faint and absent in Firefox.
  Remove any script and the site stays usable. Any seventh one needs a reason
  as good.
- The React components render to static HTML unless a page hydrates them, and
  only feature 10's contact island may. It is hydrated `client:visible` on
  `/contact-us` alone, which is also the only page that loads Cloudflare's
  Turnstile script.
- The page scrolls focused elements clear of the sticky header:
  `PageLayout` sets `scroll-padding-top` from `--header-h`.

## The living check

`/styleguide` shows every token and every component variant in one place, built
from real content entries. It is injected by a dev only integration
(`src/dev/styleguide-integration.ts`), so it exists under `pnpm dev` and never
reaches a build.

Walk it with a keyboard and at 200% zoom whenever you change a token.
