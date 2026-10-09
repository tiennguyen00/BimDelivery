# Design system

The written companion to `src/styles/global.css` (spec
[0003](specs/0003-design-system-ui-foundation/index.md)). The CSS is where the
tokens live and what the build enforces; this file says what each one is for
and which pairs are safe to put together. A token change edits both, in the
same commit.

**Character**: calm, technical, and light. Plenty of white space, black and
grey carrying the words, and brand gold used sparingly as a fill so it reads as
emphasis rather than decoration. Square-ish corners (4px), no gradients, no
rounded blobs. The feel of a firm that delivers precise drawings.

**Source**: the palette and typeface are taken from paviliusbim.com, a
reference site the client pointed at. This is a starting point, not this
company's own brand. Replacing it before launch is a tracked follow up
(feature 14), and it is mostly a change of values in one `@theme` block plus
the two contrast tables below.

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
- The gold rule is the one thing the build cannot catch, because it is a choice
  between two valid tokens. Read it below before writing any gold.
- Pages set rhythm by alternating `white` and `tint` sections. The dark bands
  (the home hero and intro band, the contact form band, the dark
  `PatternBand`, the footer) are their own components, never a `Section`
  tone. Two families adapt to what they sit on, each through a `surface`
  prop and the class maps in `styles.ts`: the form fields (spec 0011) and the
  service bands (spec 0013).

## Colour

Every colour the site has. Named by role, not by hue, so a real brand later is
a change of values rather than a change of class names everywhere.

| Token | Value | Role |
|---|---|---|
| `--color-white` | `#ffffff` | Page background, card surface. A text colour only on the scrim (the home hero), and the outer half of the two colour focus ring |
| `--color-tint` | `#fff9e6` | The `tint` section background, a warm cream drawn from the gold |
| `--color-black` | `#000000` | `h1` and `h2`; the label on every gold or yellow fill |
| `--color-ink-strong` | `#333333` | `h3` and sub headings, field labels, strong text |
| `--color-ink` | `#666666` | Body text, the most used text colour on the site |
| `--color-ink-muted` | `#707070` | Hints, captions, card text |
| `--color-gold` | `#e09900` | Brand gold. Fills only: primary button, highlight fills, decorative rules, icon fills |
| `--color-gold-deep` | `#c88600` | The primary button's hover fill, and nothing else |
| `--color-gold-ink` | `#946600` | The same hue, dark enough to read. The only gold allowed as text, a link, a control border, or the focus ring |
| `--color-gold-on-dark` | `#e09900` | Brand gold as a word, allowed only on black (8.73:1): the highlighted words in the home page's intro band. Never on a light tone |
| `--color-yellow` | `#ffcc00` | Reserved for the real logo and feature 5's icons. Fills and decoration only |
| `--color-line` | `#e5e5e5` | Card borders and dividers. Decorative, never a control boundary |
| `--color-field` | `#767676` | Form field borders. A control boundary, so it has to reach 3:1 |
| `--color-error` | `#b42318` | Error text and error borders |
| `--color-error-on-dark` | `#ff9b8f` | Error text on the contact form band only (spec 0011). Never on a light tone (2.03:1 on white) |
| `--color-scrim` | `rgb(0 0 0 / 0.6)` | The see through dark panel white text sits on over a photo (the home hero, spec 0005). Never lighter: 0.6 is what makes white text pass over any photo |
| `--color-scrim-strong` | `rgb(0 0 0 / 0.8)` | The layer over the whole contact form band (spec 0011), where small text sits straight on it. With the `bg-diagonal-dark` stripe on top, the band's lightest pixel is `#3f3f3f` |
| `--color-panel` | `#161616` | The fill of a card or tile on a dark `PatternBand` (spec 0013), a step up from the black so the piece reads as a surface. Never on a light tone |

### The gold rule

The most misusable part of this palette. The two golds look alike in a swatch
list and only one of them is legible as a word.

| Role | Token | Allowed | Forbidden |
|---|---|---|---|
| Fill gold | `--color-gold` | Button fills, highlight fills behind black text, decorative rules, icon fills | Any text; any control border; any focus ring |
| Fill gold, hover | `--color-gold-deep` | The primary button's hover fill | Everything else |
| Text gold | `--color-gold-ink` | Emphasised words, links, the secondary button's border and label, the focus ring | Large flat fills, where it reads muddy rather than gold |
| Text gold on black | `--color-gold-on-dark` | Highlighted words on a black band (the home intro band and the footer) | Anything on white, tint, or a photo |
| Accent yellow | `--color-yellow` | The real logo and feature 5's icons | Any text; anything else today |

The decorative rule itself is one utility, `heading-rule` in `global.css`, and
every section heading with a gold line under it uses it: on the home page the
intro, services, presence, why choose, and showcase headings. It draws the line
with `::after`, exactly as wide as the heading's own box and invisible to a
screen reader, and it leaves `display` to the call site (`inline-block` where
the line should hug the words, nothing where the heading is already a flex
item). It also holds the two custom properties the reveal script writes to draw
the line, described under `## Focus and motion`. A sixth heading anywhere on
the site writes one class, never a string of `after:` utilities.

A gold word, link, control border, or focus ring that is not
`--color-gold-ink` is a bug, not a style preference. The reference site sets
gold links and gold headings straight on white at 2.41:1, which fails WCAG AA
at every text size. Splitting gold in two is what lets the site read like the
reference and still pass.

To check: search `src/` for these exact whole classes and expect one hit only,
the written exception: the home service card's hover and focus side bars
(`group-hover:border-gold` and `group-has-[a:focus-visible]:border-gold` in
`ServiceCard.astro`, spec 0010 AC-16), a decorative fill on an overlay with no
text, never a control border.

```
text-gold  text-gold-deep  text-yellow
border-gold  border-gold-deep  border-yellow
outline-gold  outline-gold-deep  outline-yellow
ring-gold  ring-yellow
```

Note that a class name quoted in prose inside `src/` counts as a hit, and
Tailwind will also turn it into real CSS, because it reads source files as
plain text. Write the token name (`--color-gold`) when you need to talk about
one.

### Contrast, the pairs in use

WCAG 2.2 AA: 4.5:1 for normal text, 3:1 for large text, control boundaries, and
focus indicators. Computed from the hex values above.

| Foreground | Background | Ratio | Needs |
|---|---|---|---|
| black (`h1`, `h2`) | white / tint | 21.00 / 19.94 | 4.5 |
| ink-strong (`h3`, field labels) | white / tint | 12.63 / 12.00 | 4.5 |
| ink (body) | white / tint | 5.74 / 5.45 | 4.5 |
| ink-muted (hints, card text) | white / tint | 4.95 / 4.70 | 4.5 |
| gold-ink (links, emphasis, secondary button label) | white / tint | 5.05 / 4.79 | 4.5 |
| black (primary button label) | gold / gold-deep (hover) | 8.73 / 6.87 | 4.5 |
| black | yellow | 13.89 | 4.5 |
| black (secondary button label on hover) | gold (the hover fill) | 8.73 | 4.5 |
| field border | white / tint | 4.54 / 4.31 | 3.0 |
| error | white / tint | 6.57 / 6.24 | 4.5 |
| focus ring gold-ink | white / tint | 5.05 / 4.79 | 3.0 |
| white (the gold band's link label) | black / ink-strong (hover) | 21.00 / 12.63 | 4.5 |
| black (the gold band's heading and text) | gold | 8.73 | 4.5 |
| black (the service card's wash) | gold at 70 percent over the card's white (composite `#e9b74d`) | 11.35 | 4.5 |
| white (intro band heading and copy) | black | 21.00 | 4.5 |
| gold-on-dark (intro band highlighted words) | black | 8.73 | 4.5 |
| gold-ink (intro band card numbers) / ink-strong (card labels) | white | 5.05 / 12.63 | 4.5 |
| gold-ink (`StatsBand` numbers, the open accordion title, a `==` phrase) / ink-strong (`StatsBand` labels) | white | 5.05 / 12.63 | 4.5 |
| black (a closed accordion item's title) | gold | 8.73 | 4.5 |
| ink (text on `bg-diagonal`), worst case over a stripe line | line (`#e5e5e5`) | 4.56 | 4.5 |
| white (the hero's heading and subheading, the Project page hero's `h1`, intro, service tabs, and filter labels, the project tile titles, summaries, cues, and facts on `/project` and the captions on the home page) | scrim over any photo, worst case over pure white (composite `#666666`) | 5.74 at worst | 4.5 |
| two colour focus ring, black inner band / white outer band (the hero photo and the gold band) | gold / any photo | black on gold 8.73; on any colour at all, one of the two bands reaches at least 4.58 | 3.0 |
| white (the contact form band's heading, field labels and hints, noscript note, captcha link) | `scrim-strong` plus a `bg-diagonal-dark` line over a pure white photo pixel (composite `#3f3f3f`) | 10.5 at worst | 4.5 |
| error-on-dark (the contact form band's field errors and messages) | the same worst case, `#3f3f3f` | 5.19 at worst | 4.5 |
| gold-ink (contact card headings) / ink-strong (card values, the thank you text) | white | 5.05 / 12.63 | 4.5 |
| white (every heading and word on a dark `PatternBand`) | `bg-dots-dark`'s lightest pixel, a dot's centre (`#242424`, measured at 1x and 2x) / `panel` | 15.52 / 18.10 | 4.5 |
| gold-on-dark (a `==` phrase and the line icons on a dark `PatternBand`) | the same `#242424` / `panel` | 6.45 / 7.52 | 4.5 |
| black (a process step's number) | gold (its circle) | 8.73 | 4.5 |

### Contrast, the three that are deliberately never text

Recorded so a later reader does not "fix" them.

| Pair | Ratio | Why it is still fine |
|---|---|---|
| gold on white | 2.41 | A fill, never a word. WCAG 1.4.11 does not ask a control's fill to contrast with the page when its label identifies it, and that label is black at 8.73:1 |
| yellow on white | 1.51 | Reserved decoration and logo only; nothing renders it as text |
| line on white | 1.26 | A decorative card border, not a control boundary, so 1.4.11 does not apply. The card's real affordance is its title link and its focus ring |

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
tone are fine; alternating white and tint is the default rhythm a page should
use.

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

Two section tones, `white` and `tint`, and **both are light**. Every text,
border, and focus colour is identical on each, so no component adapts to its
background, none takes a tone prop, and none reads a tone variable. Components
name their colours directly (`text-ink`, `border-gold-ink`).

A tone may carry one pattern on top: `bg-diagonal` (`global.css`, spec 0005),
a 1px `line` stripe every 10px at 45 degrees, today on the home presence band
and the About page's certification band. It sets only `background-image`, so
it is not a third tone. Pass it through `Section`'s `class`; **do not** add a
tone for it.

- **Do** keep text on `bg-diagonal` at `ink` or stronger. Its worst case, `ink`
  over a stripe line, measures 4.56:1.
- **Don't** use `ink-muted` for text on it: over a stripe line it drops to
  3.93:1, under the 4.5 minimum.
- Its dark twin, `bg-diagonal-dark` (spec 0011), is white at 6 percent, 1px
  in every 10, at the same angle, laid over `scrim-strong` on the contact form
  band. It is not a tone either, and never goes on a light one.
- **Don't** put a `==gold==` phrase on it either: `gold-ink` over a stripe
  line measures 4.01:1. A `**bold**` phrase is fine, it stays `ink`. Spec 0010
  (AC-4) lists the stripe as a surface for `gold-ink`; that line owes a
  correction, and until then the About certification copy carries no `==`.

The contact page's form band (spec 0011, `src/components/contact/FormBand.astro`)
is the other dark band that is not a tone: a greyscale photo under
`scrim-strong` and `bg-diagonal-dark`, on a black band so a photo that fails
to load changes nothing. It carries `focus-contrast`. Text on it is white or
`error-on-dark` only; the fields' boxes and the cards are white surfaces and
follow the light rules. Fields placed there pass `surface="dark"`.

The service pages' features and process bands sit on `PatternBand` (spec
0013, `src/components/ui/PatternBand.astro`), named by the content's
`surface` field. It is not a tone either:

- **`dark`** is a black band under `bg-dots-dark`: a dot of white at 14
  percent, 2px across, every 12px, which sets only `background-image` and
  `background-size`. A dot's centre is the band's lightest pixel, `#242424`
  (measured), and every pair on it is measured there. It carries
  `focus-contrast` and borrows the band frame. Words on it are white, and a
  `==` phrase and the line icons `gold-on-dark`; cards and tiles are a
  `panel` fill with a white hairline at 10 percent. **Never** put
  `bg-dots-dark` on a light tone.
- **`light`** is a white `Section` under `bg-diagonal`, so every rule above
  holds: headings black, body text `ink`, a `==` phrase only in a heading
  (the build rejects one anywhere else on a `light` block), and cards and
  tiles white with the `line` border.
- When a presence band follows a `light` pattern band, the route turns its
  stripe's tone to `tint`, so two stripes never run into each other on one
  tone.

The home page has one black band, the intro band, and it is not a tone: like
the hero and `CtaBand` it is its own component that borrows the band frame,
carries `focus-contrast`, and holds only white text, `--color-gold-on-dark`
words, and white cards. Two things on it move: the counter, which runs once,
and the gold rule under its heading, which draws as the heading arrives.
Neither runs on a loop, so the band needs no pause control, and it takes no
fade-and-rise scroll reveal. A dark `Section` tone would still be a change to
spec 0003, not a page level override. It means
bringing back inherited tone variables, a card tone reset, a light error
colour, and a second focus colour, then computing the dark contrast pairs.

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
| `tone` | `'white' \| 'tint'` | `'white'` |
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
  do the two bands that are not a light tone, `CtaBand` and the home hero, so
  the three cannot drift apart. A band that is not a light tone is its own
  component that borrows this frame; it never adds a tone to `Section`
  (spec 0005).

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
- Keyboard focus draws one ring around the whole card. Hover is a raised shadow
  and an underlined title, deliberately a different treatment, so a mouse user
  is never shown something that reads as a focus ring.
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
| `surface` | `'light' \| 'dark'` | `'light'` |
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
- **`surface`** is what the field sits on. `dark` makes the label and hint
  white and the error `error-on-dark`, for the contact form band. The box is
  identical on both: white, the `field` border, the `error` ring. The class
  maps live in `styles.ts`, so no field names a colour of its own.
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
  2 unit line at 80px would be nearly 7px thick. Coloured by the band's
  surface: `gold-on-dark` on `dark`, `gold-ink` on `light`.
- **Solid glyphs** (Tabler filled, or Material Icons filled under Apache 2.0
  where Tabler has no solid match), the `solidIcons` an audience item may
  take with the existing `users` and `building`: `user`, `presenter`,
  `compass`, `hard-hat`, `users-gear`. Drawn at 64px with `fill-gold`.

A glyph name is checked twice: the schema lists which glyphs a block may
take, and passing it to `Icon` is type checked against the map. A new glyph
is a path in the map and its name in the list.

- Every glyph inherits `currentColor`, so an icon is coloured by the text around
  it. **Do not** give an icon a colour of its own. The one exception is a
  gold icon on white, as in the intro band's cards: gold may not be a text
  colour there, so the icon takes `fill-gold` instead, which is a fill and
  within the gold rule. A stroke glyph that should read as gold, the `check`
  in the presence band's list, takes `text-gold-ink` instead: `gold-ink` is
  allowed as a line, so the stroke stays within the rule too.
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

Sticky, one constant height, white, and it registers **no scroll listener**.

- It is a full width white card flush with the top: `rounded-b-card` bottom
  corners, `shadow-md`, and no bottom border. The card is the same on every
  page. Only the home hero slides under it; every other page starts below it.
- `--header-h` is the card's box, not its shadow or corner curve. Anything
  that makes the header taller (padding, a bigger logo, a second row) changes
  `--header-h` in the same edit, or the home hero's copy slides under the card.
- While the mobile menu is open the corners square off and the shadow drops, so
  header and panel read as one white sheet. That rule lives in the header's
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

A black band: brand, contact, and certification, three columns at `lg`, two
at `md`, one below. It carries `focus-contrast`, and its marked copy goes
through `Emphasis` on the `dark` surface.

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

- **The look** (spec 0010): each number bold `gold-ink` at `text-h1` (5.05:1
  on white), each label semibold `ink-strong` (12.63:1). Gold here is always
  `gold-ink`, never the brighter fill gold the reference shows.
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
| `surface` | `'light' \| 'dark'` (required) | |
| `strongClass` | `string`, extra classes for the `**` runs | none |

The one place marked copy becomes markup (spec 0010). Content marks a phrase
with one of two pairs, and the schema's `emphasisText` checks every line at
build (`src/lib/emphasis.ts`):

- `**phrase**` is semibold in the surrounding colour. The home presence band
  passes `strongClass="text-ink-strong"` to keep its darker bold.
- `==phrase==` is semibold gold, and the surface picks which: `gold-ink` on
  white and tint, `gold-on-dark` on black. That is why `surface` has no
  default.
- Marks must close with the same mark and may never nest or overlap. A line
  that breaks either rule fails the build, quoting the line.
- It renders inline runs and no wrapper, so the caller owns the `<p>` and its
  colour. **Do not** write a `splitEmphasis` loop in a component again.
- **Don't** put a `==` phrase on `bg-diagonal` (see `## Tones`).

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
- **Closed**: a `gold` filled bar, the title bold `black` at `text-h3`
  (8.73:1), a `plus` in a white circle at the end. **Open**: a white card with
  a `line` border and `shadow-lg`, the title `gold-ink` (5.05:1), the circle
  `tint`, a `minus`, and the text below with its marks.
- The whole summary is the target, at least 44px tall, and toggles with a
  click, a tap, Enter, or Space. It holds plain text, never a heading.
- The group carries `focus-contrast`, so a summary gets the two colour ring:
  the `gold-ink` ring would vanish against a closed gold bar (2.10:1).
- The `accordion-item` utility in `global.css` hides the browser's own
  triangle and holds the slide (`## Focus and motion`).

### `ContactCard` · `src/components/contact/ContactCard.astro`

| Prop | Type | Default |
|---|---|---|
| `icon` | `IconName` (required) | |
| `heading` | `string` or a `Link` (required) | |
| `body` | `string` or a `Link` | none |

One of the contact page's three cards (spec 0011): a 56px `gold` filled icon,
hidden from assistive tech, above an `h3`, then the value, centred on a white
card with `shadow-lg`.

- It is a white surface on a dark band, so it follows the light rules: the
  heading bold `gold-ink` at `text-h3` (5.05:1), the value `ink-strong`
  (12.63:1). **Never** a bright gold word here.
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

The closing call to action: a self contained gold band, always gold, taking no
tone. Spec 0005 kept it for the service pages, but spec 0013 closed them
inside their process band instead. The Project page closes with it (spec
0014), and so does every project detail page, fed `projectPage.detail.cta`
(spec 0015).

- **It is not a `Section` with a third tone**, and that is the point. Two tones
  and both light is what lets every other component name its colours directly
  and never read a tone variable. A gold `Section` would reopen all of it.
- It borrows `Section`'s frame (the band classes above) rather than wrapping
  it, because wrapping would mean giving `Section` the tone prop this avoids.
  If a third tone ever becomes right, this component collapses into it.
- Its link is built from `ctaLinkClass` in `styles.ts`, never from `<Button>`
  with an override class. Tailwind's generated order decides which background
  utility wins, not the order classes appear in the attribute, so an override
  is a silent coin flip.
- Black heading and text on the gold (8.73:1), black link with a white label
  (21.00:1). The band carries `focus-contrast`, so its link shows the two
  colour ring (below), not the gold ink one.

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
bottom so the cues of a row line up. White, `shadow-lg`, `rounded-ui`.

- **One link, one tab stop**, the same stretched title link as `Card`. The cue
  is text. **Do not** put a link, button, or field inside it.
- The sub services are a real `<ul>` drawn as one centred line split by pipes,
  as the reference card is. The items are inline so the line wraps like prose,
  and the pipes are `aria-hidden`. **Do not** turn it into a `<p>` with the
  pipes typed in: a screen reader would lose the list.
- At rest: title `ink-strong`, summary `ink-muted`, list `ink`, cue and arrow
  `gold-ink`.
- **Hover and keyboard focus look the same**: a wash from `tint` at the top to
  `gold` at 70 percent at the bottom rises from the card's bottom edge to its
  top over 200ms, a 4px `gold` border appears on the left and right (an
  overlay, so nothing shifts), the shadow deepens to `shadow-xl`, and the card
  rises 4px. Focus also shows the `gold-ink` ring.
- **The wash rises, it does not fade**: the layer is scaled to nothing at rest
  and grows back from `origin-bottom`, the `scale` property and the same idiom
  as `heading-rule`, so it stays clear of the card's own `translate` lift and of
  the scroll reveal's `transform`. Leaving the card runs it back down the way it
  came. With reduced motion asked for, the full wash is simply there.
- **On the wash every word and icon is `black`**, at least 11.35:1 at the wash's
  darkest point, which is `gold` at 70 percent over the card's white (the
  composite `#e9b74d`, measured in the browser). Solid `gold` was darker at
  8.73:1; the wash was lightened on 2026-09-24 and every figure here went up
  with it. **Never** put grey on it: `ink-muted` on `gold` is 2.06:1.
- The lift is the `translate` property under `motion-safe`, never `transform`,
  so it composes with the scroll reveal. With reduced motion the colours still
  change, at once, and the card does not rise. `hover:` applies only where a
  pointer can hover, so a tap never leaves a card stuck gold.
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
| `surface` | `'light' \| 'dark'` (required) | |
| `labelledBy` | `string` (required), the id of the band's heading | |
| `class` | `string` | none |

A band on a pattern (spec 0013), the surface of the service pages' features
and process bands. `dark` renders its own black `<section>` under
`bg-dots-dark`, with `focus-contrast` and the band frame; `light` renders a
white `Section` under `bg-diagonal`. See `## Tones` for what may sit on each.

- It owns the surface, nothing inside it. What sits there reads the same
  `surface` through the band class maps in `styles.ts` (`bandHeadingClass`,
  `bandBodyClass`, `bandCardClass`, `bandTileClass`, `bandIconClass`), so no
  band component names a colour that depends on the surface.
- **Do not** add a tone to `Section` for it, and **do not** use it for a
  light band with no pattern; that is a plain `Section`.

### `CarouselDots` · `src/components/ui/CarouselDots.astro`

| Prop | Type | Default |
|---|---|---|
| `count` | `number` (required), one dot per photo, two or more | |
| `class` | `string` | none |

The dots under a photo carousel, shared by the home hero and each service
intro (spec 0013), run by `src/scripts/carousel.ts`.

- One real button per photo, named "Show photo N of M", a 24px hit area
  around a small mark: black at 30 percent, or solid black for the photo
  showing (`aria-current`). Black, not gold: a gold dot on white would be
  2.41:1, under the 3:1 a control's state needs.
- The row ships `invisible` and the script reveals it, so with no JavaScript
  there is nothing dead to tab to. **Do not** render it for a single photo.
- The label is fixed English, a follow up owed before a second language.

### `PresenceBand` · `src/components/ui/PresenceBand.astro`

The global presence band's inside (spec 0005): a ruled heading, the dotted
world map with its regions, and the copy with the why choose list. It moved
from `src/components/home/` to `ui` when the service pages began to show it
too (spec 0013), unchanged. The page wraps it in a striped `Section`, and its
copy is `home.presence`, or a service's own presence `content`.

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
- The surfaced bands (features, process) read their block's `surface` and
  only the band class maps in `styles.ts`: white words and `panel` cards on
  `dark`, black headings, `ink` text, and white cards on `light`.
- Grids that fit any count use literal classes (`lg:grid-flow-col
  lg:auto-cols-fr`), never a class built from a list's length.
- The intro's paragraphs each sit beside a 4px gold bar, a `::before` filled
  with `--color-gold`; the audience icons are `fill-gold`; the process circles
  and the line joining them are gold fills carrying black numbers. All are
  fills, within the gold rule.

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

- **Its own band, not a `Section`**: white, with the band frame's side gutters
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
  title. `rounded-ui`, on a black fill that shows only while the photo loads.
  The box is reserved before the photo arrives, so nothing shifts. The photo
  covers the box, centred, so a tall tower is cropped; choose photos with
  that in mind.
- **A `bg-scrim` layer covers the whole photo**, so every word on the tile is
  white at 5.74:1 at worst over any photo. Lighter would break that (the
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
  in a white outlined pill (`rounded-full`), `aria-hidden`; the facts are a
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
  word on the band is white at 5.74:1 at worst. The `h1` takes no gold rule
  and no capitals, like the home hero's.
- **A `==gold==` phrase in its intro is not safe**: `Emphasis` gives it
  `gold-on-dark`, made for black, and over the scrim it can fall under 3:1 on
  a bright photo. Keep the hero's intro to plain and `**bold**` words.
- **The filter is one named `<form>`** (a landmark, `projectPage.filter.label`),
  `no-js:hidden`, so with JavaScript off it is not there at all and the
  visitor gets the whole wall; with it on it is there from the first frame,
  so nothing shifts. Each field's `name` is the tile attribute it matches.
  - **The service tabs**: radio buttons in a `fieldset` with an `sr-only`
    legend, so they are one tab stop and the arrow keys move the choice.
    The input is `sr-only`; its label draws the tab, `text-lead` white, the
    chosen one underlined in white (2px). White, not gold: gold over the
    scrim is not guaranteed 3:1. Every tab is the same weight, so choosing
    one never shifts the row. The two colour focus ring is drawn on the
    label (`peer-focus-visible:`), since the input cannot show one. The first
    tab is "All"; the rest are the services that have projects, in the
    services' `order`.
  - **The bar**: a `bg-scrim` panel with a white hairline at 10 percent,
    holding the country and floor area dropdowns, native `<select>`s in the
    shared field box (white on every surface, `selectClass`) with the dark
    surface's labels above them, side by side from `md`. Each starts on
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
  `home.projectShowcase.cue`), white, `text-small font-semibold`,
  **`aria-hidden`**, so a screen reader hears six distinct titles rather
  than six "Read more"s. On home it sits under the summary with an
  `arrow-right`; on `/project` it is a white outlined pill that unfolds on
  hover (above).
- **Keyboard focus** draws the light tone `gold-ink` ring round the whole
  tile (`link-focus:outline-gold-ink` on the `<li>`), never round the title
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
0015). It renders the inside of a white `Section` labelled by its `h1`.

- **Without `context`** it is exactly the `/project` intro: the ruled `h1` in
  capitals by CSS only, then one `text-lead` paragraph in the narrow width.
- **With `context`**, a block above the `h1` holds two left aligned links, each
  44px tall for touch: the back link (an `arrow-left` and its label,
  `text-small`, `gold-ink`) and, on its own line, the project's service
  (`text-small font-semibold tracking-wide uppercase`, `gold-ink`) linking to
  its service page. Both underline on hover. `context` carries both links
  together, so the band has both or neither.
- **The entrance** counts up from `entranceFrom`: the links block, then the
  `h1`, then the paragraph.

### The project detail page · `src/pages/project/[slug].astro`

One page per project at `/project/<slug>` (spec 0015), six bands: the intro
(`IntroBand` with `context`), the cover, the story, the gallery, the next
project link (two or more projects only), and the gold `CtaBand`. Every word
comes from the project's entry, its service, `projectPage.detail`, or the site
name; the derived values (the next project, the facts rows, the head) come
from `src/lib/project-detail.ts`.

- **`ProjectCover`**, the cover band: white, the band gutters, **no maximum
  width** and no vertical padding. One photo box, `rounded-ui` on a black fill
  that shows only while it loads, fixed at 4:3 below `md`, 16:9 at `md`, and
  21:9 at `lg`, so its space is reserved before the photo arrives. The photo
  covers it, loads eagerly with high fetch priority (the page's largest
  paint), and has `widths` up to 2400. No caption, no link, no hover.
- **`ProjectStory`**, the story band: a white `Section`, no label. One column
  below `lg`, the facts panel first; at `lg` three columns with a 32px gap,
  the write up across the first two and the facts panel in the third, both at
  the top. The DOM order stays facts first and the placement is explicit
  (`lg:col-span-2 lg:row-start-1`, `lg:col-start-3 lg:row-start-1`), never auto
  flow. Each write up section is an `h2` at `text-h3`, then its paragraphs
  through `Emphasis` (`light`), 16px apart, with 48px between sections.
- **The facts panel**: `bg-tint`, `rounded-ui`, 24px padding (32px from `md`),
  an `h2` at `text-h3`, then one `<dl>`: each `<dt>` a `text-small font-semibold
  tracking-wide uppercase` label in `ink-muted`, each `<dd>` the value in
  `ink-strong` with `wrap-break-word`, so a long place or client wraps inside
  the panel. A fact the entry leaves out has **no row at all**, never an empty
  `<dt>` or a dash. The rows and their formatting (`42,000 m²`, `LOD 300`,
  `Revit, Navisworks`) come from `projectFacts`, never a component.
- **`ProjectPhotos`**, the gallery band: `tint`, the band gutters and padding,
  **no maximum width**. A left aligned ruled `h2` names the band and its list.
  The wall is `wall.ts`: one, two, then three columns, 8px seams, fixed 5:4
  tiles on black (the `/project` wall's old shape; that wall left it on
  2026-10-09). A gallery tile is only a photo with its
  `alt`: no caption, nothing focusable, the default cursor, no hover, and
  every photo lazy.
- **`NextProject`**, the way on: a white, narrow `Section` holding one centred
  link to the next project by `order` (the last wraps to the first). Inside
  it, the label (`text-small font-semibold tracking-wide uppercase`,
  `ink-muted`) on its own line, then the title (`text-h3 font-semibold`,
  `ink-strong`) and an `arrow-right` in `gold-ink`. Its name is the label and
  the title together; the title underlines on hover; focus shows the light
  tone `gold-ink` ring. With one project the band is absent, so the link never
  points to its own page.

## Focus and motion

Two rules, chosen by the surface, and no exceptions (spec 0005):

- **On the two light tones**: a 2px solid `--color-gold-ink` outline with a 2px
  gap, identical on white and tint. This is the base rule in `global.css`.
- **On every surface that is not a light tone** (today the home hero's photo,
  the Project page hero's photo (its service tabs draw the ring on their
  label, `peer-focus-visible:`, since the radio itself is invisible), the
  home intro band's black, the contact form band, the dark `PatternBand`,
  the footer's black, `CtaBand`'s gold band, and the `Accordion`'s gold
  bars): a two colour ring, a 2px `--color-black` band
  directly around the control and a 2px `--color-white` band outside it. It
  comes from the `focus-contrast` utility in `global.css`, placed on the band's
  `<section>`, so everything focusable inside inherits it and no control sets
  its own ring colour. Two colours is what makes it work on any background:
  against any colour at all, one of the two bands reaches at least 4.58:1.
- The rule belongs to the surface, not the control. A new dark or photo surface
  adds `focus-contrast`; it never invents a third ring.
- Either way, mouse clicks show nothing (`:focus-visible`), and width and
  offset are the same 2px.
- When the visitor's system asks for reduced motion, every transition and
  animation is cut to 0.01ms, so state changes are instant.

Motion is enhancement only. The built HTML draws every band complete and every
gold rule full width, and no CSS rule hides anything waiting for a script.
Three plain scripts move things on the home page, and each stops entirely for
reduced motion. Two of them move two things each: the carousel script moves the
hero's photos and the panel over them, and the reveal script moves the bands
and the gold rules under the section headings. The service pages use the same
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
  gold rule under a section heading draws itself from nothing to the full
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
  stretch of the gold line with it as it fades in. The block after the
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
  same way. The hero's `h1` has no rule. The empty state and the gold band
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
  rules draw with the scroll direction. The next project band and the gold
  band do not move.
- **Don't** give the hero or the intro band the fade-and-rise: the hero is the
  largest contentful paint, and the intro band already moves with the counter.
  What is banned there is revealing the band, not all motion on it. The intro
  heading's gold rule draws like every other section heading's, because the
  rule belongs to the heading treatment rather than to the band.

## Invariants

- Every colour, font size, radius, and container width resolves to a token.
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
