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
- Pages set rhythm by alternating `white` and `tint` sections. There is no dark
  band, so no component adapts to its background.

## Colour

Every colour the site has. Named by role, not by hue, so a real brand later is
a change of values rather than a change of class names everywhere.

| Token | Value | Role |
|---|---|---|
| `--color-white` | `#ffffff` | Page background, card surface. Not a text colour: there is no dark surface to sit on |
| `--color-tint` | `#fff9e6` | The `tint` section background, a warm cream drawn from the gold |
| `--color-black` | `#000000` | `h1` and `h2`; the label on every gold or yellow fill |
| `--color-ink-strong` | `#333333` | `h3` and sub headings, field labels, strong text |
| `--color-ink` | `#666666` | Body text, the most used text colour on the site |
| `--color-ink-muted` | `#707070` | Hints, captions, card text |
| `--color-gold` | `#e09900` | Brand gold. Fills only: primary button, highlight fills, decorative rules, icon fills |
| `--color-gold-deep` | `#c88600` | The primary button's hover fill, and nothing else |
| `--color-gold-ink` | `#946600` | The same hue, dark enough to read. The only gold allowed as text, a link, a control border, or the focus ring |
| `--color-yellow` | `#ffcc00` | Reserved for the real logo and feature 5's icons. Fills and decoration only |
| `--color-line` | `#e5e5e5` | Card borders and dividers. Decorative, never a control boundary |
| `--color-field` | `#767676` | Form field borders. A control boundary, so it has to reach 3:1 |
| `--color-error` | `#b42318` | Error text and error borders |

### The gold rule

The most misusable part of this palette. The two golds look alike in a swatch
list and only one of them is legible as a word.

| Role | Token | Allowed | Forbidden |
|---|---|---|---|
| Fill gold | `--color-gold` | Button fills, highlight fills behind black text, decorative rules, icon fills | Any text; any control border; any focus ring |
| Fill gold, hover | `--color-gold-deep` | The primary button's hover fill | Everything else |
| Text gold | `--color-gold-ink` | Emphasised words, links, the secondary button's border and label, the focus ring | Large flat fills, where it reads muddy rather than gold |
| Accent yellow | `--color-yellow` | The real logo and feature 5's icons | Any text; anything else today |

A gold word, link, control border, or focus ring that is not
`--color-gold-ink` is a bug, not a style preference. The reference site sets
gold links and gold headings straight on white at 2.41:1, which fails WCAG AA
at every text size. Splitting gold in two is what lets the site read like the
reference and still pass.

To check: search `src/` for these exact whole classes and expect no hits.

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

There is no vertical margin between sections. Adjacent sections of the same
tone are fine; alternating white and tint is the default rhythm a page should
use.

## Corners and widths

| Token | Value | Use |
|---|---|---|
| `--radius-ui` | 4px | Every button, card, field, and image corner |
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

A dark band would be a change to spec 0003, not a page level override. It means
bringing back inherited tone variables, a card tone reset, a light error
colour, and a second focus colour, then computing the dark contrast pairs.

## Components

Four base pieces, plus the four the site shell adds (spec 0004). The form fields
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

### `TextField` and `TextArea` · `src/components/react/ui/`

| Prop | Type | Default |
|---|---|---|
| `name` | `string` (required) | |
| `label` | `string` (required) | |
| `type` (TextField only) | `'text' \| 'email'` | `'text'` |
| `rows` (TextArea only) | `number` | `5` |
| `id` | `string` | a generated id |
| `hint` | `string` | none |
| `error` | `string` | none |
| `required` | `boolean` | `false` |

Plus the native input or textarea props (`value`, `onChange`, `autoComplete`,
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

### `Icon` · `src/components/ui/Icon.astro`

| Prop | Type | Default |
|---|---|---|
| `name` | `IconName` (required) | |
| `size` | `number`, the edge length in pixels | `24` |
| `title` | `string`, the accessible name | none |
| `class` | `string` | none |

The whole set, eight glyphs on one 24 unit grid: `menu`, `close`,
`chevron-down`, and the five social marks `linkedin`, `facebook`, `youtube`,
`x`, `instagram`.

- Every glyph inherits `currentColor`, so an icon is coloured by the text around
  it. **Do not** give an icon a colour of its own.
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

The frame every public page sits inside: the skip link, `Header`,
`<main id="main" tabindex="-1">`, `Footer`. It reads the navigation and the
settings itself, so a page passes only its own title and description.

- **Do** import this in every page under `src/pages/`. `BaseLayout` is the bare
  document shell and is for the dev only style guide. A page that imports the
  wrong one loses its header and footer **with no error**: that is the first
  thing to check when a page renders bare.
- It declares `--header-h` (`4.5rem`, `5rem` at `lg`). That value, the media
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
- No services in the content means no SERVICES control at all, in either copy.

### `Footer` · `src/components/ui/Footer.astro`

| Prop | Type | Default |
|---|---|---|
| `items` | `readonly NavItem[]` (required) | |
| `ui` | `NavUi` (required) | |
| `legal` | `readonly Link[]` (required, may be empty) | |
| `settings` | `Settings` (required) | |

Four columns at `lg`, two at `md`, one below: brand, site links, service links,
contact. Tone `tint`.

- Both link columns come from the same `getNavigation` call the header uses, so
  the two can never fall out of step and a fourth service file appears in both.
- Footer links **never** carry `aria-current`. That belongs to the header, so a
  screen reader hears the current page once.
- An empty `social` list drops the whole block, and an empty `legal` list leaves
  just the copyright. Neither renders an empty row.
- Social links open in a new tab and carry `rel="noopener noreferrer"`.

## Focus and motion

- Keyboard focus is a 2px solid `--color-gold-ink` outline with a 2px gap,
  identical on both tones. Mouse clicks show nothing (`:focus-visible`).
- When the visitor's system asks for reduced motion, every transition and
  animation is cut to 0.01ms, so state changes are instant.

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
- No component ships client JavaScript. The React components render to static
  HTML unless a page hydrates them, and only feature 10's contact island may.

## The living check

`/styleguide` shows every token and every component variant in one place, built
from real content entries. It is injected by a dev only integration
(`src/dev/styleguide-integration.ts`), so it exists under `pnpm dev` and never
reaches a build.

Walk it with a keyboard and at 200% zoom whenever you change a token.
