# 0003. Build the design system as Tailwind tokens plus four base components

**Date**: 2026-10-09 (the dark brand theme: the light palette replaced by the client's five colour dark palette, every colour token renamed by role; earlier: two tokens and the second focus rule added by specs 0004 and 0005 on 2026-09-21; palette revised 2026-09-20; first written 2026-09-19)
**Status**: In Progress
**Scope feature**: 4, Design system & UI foundation (`docs/scope/scope.md`)

## Summary

The site gets one visual language: a dark site in the client's own palette. Chinese Black `#0C1519` is the page, Dark Jungle Green `#162127` the alternate band, Jet `#3A3534` every card and panel, Antique Brass `#CF9D7B` the accent, and Coffee `#724B39` the warm structure (decorative lines and one hover wash). Text is a warm cream family taken from the brass hue, the typeface stays Inter, corners stay 4px. Every colour, size, and breakpoint is defined once as a Tailwind token in `src/styles/global.css`, and Tailwind's own colours are switched off, so a page can only use the agreed palette.

On a dark page brass is legible everywhere it sits (5.04:1 at worst, on Jet), so the old split between a fill gold and a text gold goes away: one `accent` token is the button fill, the link, the highlighted word, and the focus ring. Coffee is the one colour that may never be read. Tokens are renamed by role (`canvas`, `raised`, `panel`, `heading`, `accent`), so a class always says what it paints. The 2026-10-09 revision changes colour only; type, spacing, radius, widths, and the component APIs are unchanged, and this spec overrides the colour wording in specs 0004 to 0016, which stay as the history of each band.

## Requirements

**User stories**:
- As the developer building every page, I want tokens and base components ready so that each page is composed from them rather than styled from scratch.
- As a visitor on a phone, tablet, or desktop, I want text sized for my screen and every control easy to tap so that the site reads well wherever I open it.
- As a keyboard or screen reader user, I want every control reachable with a visible focus outline and readable contrast so that I can use the whole site.
- As the site owner, I want the site in my brand's dark palette, written down in one place, so that the look is mine and a later page does not drift from it.

**Acceptance criteria** (the contract, each criterion is IDed and independently checkable):
- **AC-1**: `docs/design.md` exists and documents: every colour token with its role and the contrast ratio of each text pair it is used for; the type scale (size at 360px and at 1200px viewport, line height, letter spacing, weight); spacing and section rhythm; the three breakpoints (mobile below 768px, tablet 768 to 1023px, desktop from 1024px); the two section tones; the accent role rule (which colours may be words, and on which surfaces); and each component's props and usage rules.
- **AC-2**: Tailwind CSS v4 is installed and every design token is defined once, in the `@theme` block of `src/styles/global.css`. Four namespaces are cleared to `initial` and then repopulated with this spec's tokens only: colours, the `sm`, `xl`, and `2xl` breakpoints, font sizes, and corner radii. So `bg-red-500`, `sm:flex`, `text-xs`, and `rounded-full` each generate no CSS unless this spec defines them. Spacing, shadows, and durations deliberately keep Tailwind's defaults.
- **AC-3**: Inter (variable, weights 400 to 700, latin subset) loads through Astro's fonts API: the font file is served from the site's own origin, preloaded in the head, and paired with a metric matched fallback. No page requests a font from a third party host.
- **AC-4**: `BaseLayout.astro` applies the base styles to every page with no per page work: Inter, `ink` body text on a `canvas` background, `heading` `h1` and `h2`, `ink-strong` `h3`, default sizes for `h1` to `h3`, the focus outline, `color-scheme: dark` on the root (so scrollbars, native pickers, and autofill draw dark), a `<meta name="theme-color" content="#0c1519">`, and a text selection drawn as an `accent` fill with `on-accent` text.
- **AC-5**: Headings scale fluidly with the viewport and never jump at a breakpoint: `h1` from 36px at 360px wide to 56px at 1200px and wider, `h2` from 28px to 40px, `h3` from 20px to 24px. Body text is a fixed 16px, lead text 18px, small text 14px. All sizes are in `rem`, so full page browser zoom scales them and WCAG 1.4.4 is met. (The `vw` term inside the heading clamps does not respond to a browser's text only scaling setting the way a pure `rem` value would; the `rem` term still does, and the fixed body, lead, and small sizes are pure `rem`.)
- **AC-6**: `Section` renders a full width band in one of two tones (`canvas`, `raised`) with its content centred at a maximum of 1200px (`default`) or 720px (`narrow`), side gutters of 16px, 24px, and 32px on mobile, tablet, and desktop, and vertical padding of 64px, 80px, and 96px. Both tones are dark, so every text, border, and focus colour is identical on each; no component takes a tone prop and no component reads a tone variable.
- **AC-7**: `Button` exists as an Astro component and a React component that share one class map, so both have the same two variants and look identical: `primary` (an `accent` fill with an `on-accent` label, 7.71:1, brightening to `accent-hover` on hover with the same label, 10.52:1) and `secondary` (an `accent` border and label, 7.71:1 on `canvas`, 6.84:1 on `raised`, 5.04:1 on `panel`, filling with `accent` and an `on-accent` label on hover). Both are at least 44px tall. The Astro component additionally renders an `<a>` when given `href` and a `<button>` otherwise (type `button` by default, `submit` when asked), and supports `disabled` on the `<button>` form only. The React component renders a `<button>` only.
- **AC-8**: `Card` is a `panel` surface with a `line` border and shows an optional image (3:2, cropped to fill), a title at a heading level the page chooses (default `h3`), optional text, and an optional link. With a link, the whole card is clickable through one link with one tab stop whose accessible name is the title. Keyboard focus draws one `accent` outline around the whole card and none around the title text alone. Hover is a different treatment on purpose, an underlined title plus the border turning from `line` to `ink-muted`, so a mouse user is never shown something that reads as the brass focus ring. The card renders correctly with no image, with no link, and with a title long enough to wrap to three lines.
- **AC-9**: React `TextField` (types `text`, `email`, and `tel`), `TextArea`, and `Select` have one look everywhere: a `canvas` fill, a `field` border (5.04:1 against the fill), `ink` text, an `ink-strong` label tied to the control, an optional `ink-muted` hint, and, when given an error, an `error` message linked through `aria-describedby` with `aria-invalid="true"` on the control. The `surface` prop is removed. The error state adds a thicker error outline without moving the layout and shows text, so it never relies on colour alone. Controls are at least 44px tall, and ids are unique on the page.
- **AC-10**: Every interactive element is reachable with Tab in reading order and shows a 2px solid `accent` outline with a 2px gap when focused by keyboard, on every dark surface: `canvas` (7.71:1), `raised` (6.84:1), `panel` (5.04:1), and either pattern. Mouse clicks do not show the outline. On a photo, and on an `accent` fill (the closing call to action band, the `Accordion`), the ring is instead the two colour ring from the `focus-contrast` utility: a 2px `canvas` band around the control and a 2px `heading` band outside it. `focus-contrast` sits on exactly those surfaces and on no plain dark band; the `Accordion` carries it on its wrapper, so an open item on `panel` takes the two colour ring as well, which passes there.
- **AC-11**: Every text and background pair listed in `docs/design.md` meets WCAG 2.2 AA: at least 4.5:1 for normal text, at least 3:1 for large text, field borders, and the focus outline. Each ratio is written next to the pair. Coffee (`accent-deep` and `line`, 2.45:1 on `canvas`) never renders as text, a control boundary, or a focus ring. Text on a photo is only `heading`. `accent` is never text on a photo or on the Coffee wash, and `on-accent` appears only on an `accent` or `accent-hover` fill.
- **AC-12**: When the visitor's system asks for reduced motion, every transition and animation is cut to a near zero duration (0.01ms), so state changes appear instant.
- **AC-13**: `/styleguide` is available under `pnpm dev` only. It shows every colour token as a swatch, each labelled with what it may and may not be used for, the type scale, the spacing steps, and every component in every variant on both tones, filled with real entries from the content collections. After `pnpm build`, nothing under `dist/` contains the style guide, and `dist/client/` still has exactly one HTML file per page route.
- **AC-14**: The style guide page and the components use only tokens and Tailwind utilities: no `<style>` block, no new CSS file, no raw hex colour, and no Tailwind arbitrary value (a class with square brackets such as `text-[13px]`) outside `src/styles/global.css`. (The home intro card's white glow, an arbitrary shadow, is removed by this revision.)
- **AC-15**: `prettier-plugin-tailwindcss` sorts class lists; `pnpm check`, `pnpm lint`, `pnpm format:check`, and `pnpm build` all pass; and no built page gains any client JavaScript from this feature.
- **AC-16**: No retired colour name survives. A whole class search of `src/` for any utility built on `white`, `tint`, `black`, `gold`, `gold-deep`, `gold-ink`, `gold-on-dark`, `yellow`, or `error-on-dark` (for example `bg-white`, `text-black/30`, `hover:text-gold-on-dark`, `before:to-gold/70`), and for `bg-diagonal-dark` and `bg-dots-dark`, returns nothing, because a leftover class now generates no CSS and fails silently.
- **AC-17**: Every page route, at 360px, 768px, and 1440px wide, shows no light band and no light box except the certification badges' own tiles, and nothing that used to show is now invisible: every word, icon, border, divider, carousel dot, map dot, map marker, and focus ring can be seen. Layout, spacing, type, and motion are unchanged; only colour moved.
- **AC-18**: Text over a photo reads at any photo. The `scrim` is Chinese Black at 70%, and every word on it is `heading`: 5.91:1 at worst, over a pure white pixel. The contact form band's `scrim-strong` is Chinese Black at 90% under the `bg-diagonal` stripe, whose worst pixel (`#31393c`) still gives `heading` 10.11:1, `ink` 7.44:1, `ink-muted` 5.32:1, `error` 5.15:1, and `accent` 4.92:1.
- **AC-19**: The home service card's hover and focus wash rises from the card's bottom edge as `accent-deep` (Coffee) at 70% over the `panel`, and while it shows, every word on the card is `heading` (7.52:1 at the wash's darkest point, `#614438`). The side bars are `accent`. Motion and timing are unchanged.
- **AC-20**: The brand assets read on dark. One `logo` setting, the light mark, serves the header and the footer. The home service cards show a dark version of the service illustration: a transparent background with no white rectangle, its dark strokes turned `heading` cream and its gold strokes turned `accent` brass. The three certification badges keep their own light tiles, with no extra light strip behind them.
- **AC-21**: A service block's `surface` in content is `stripe` or `dots` (formerly `light` and `dark`); both are `canvas` bands, carrying `bg-diagonal` and `bg-dots` respectively. A block with any other value fails the build naming the file. The content rule that kept `==` brass words out of a `light` block's body is removed, because `accent` over a stripe line reads 6.66:1.

## Decision

**Chosen option**: Option 1: Tailwind v4 tokens and four small base components, on a dark only two tone palette in the client's own colours (revised 2026-10-09 from the light palette taken from paviliusbim.com).

Define the whole visual language as Tailwind v4 `@theme` tokens in `src/styles/global.css` with the default palette and unused breakpoints removed, build `Section`, `Button`, and `Card` as Astro components and the form fields and a React `Button` for the contact form island, share each component's classes through one plain TypeScript class map, load Inter through Astro's fonts API, and document it all in `docs/design.md` with a dev only `/styleguide` page as the living check.

The palette is the client's: Chinese Black, Dark Jungle Green, Jet, Coffee, and Antique Brass, with a cream text family derived from the brass hue. Three calls shape everything downstream. First, both tones are dark, so components still never adapt to their background. Second, brass passes on every dark surface, so it is one `accent` token for fills and words alike, and the colour that must never be read is Coffee. Third, tokens are named by role, never by hue or by the old light names.

**Implementation skills**: `tailwind-4-docs` (`lombiq/tailwind-agent-skills`, `.agents/skills/tailwind-4-docs/`) · `astro` (`astrolicious/agent-skills`, `.agents/skills/astro/`) · `zod` (`pproenca/dot-skills`, `.agents/skills/zod/`, for the `surface` enum in `src/content.config.ts`) · `vercel-react-best-practices` (`vercel-labs/agent-skills`, `.agents/skills/vercel-react-best-practices/`)

## Rationale

Reasoning and options: see [rationale.md](rationale.md), including the 2026-10-09 revision and its contrast evidence.

## Feature design

This feature has no stored data and no endpoints. Its "data model" is the token set, and its "API surface" is the props of each component, so both sections below use that shape.

**Data model sketch** (the tokens, all in `src/styles/global.css`):

The `@theme` block opens by clearing four namespaces, then repopulating each from the table below:

- `--color-*: initial;` removes every default colour, immediately followed by `--color-transparent: transparent;` and `--color-current: currentColor;` so `bg-transparent`, `border-transparent`, and `text-current` keep working.
- `--breakpoint-sm: initial; --breakpoint-xl: initial; --breakpoint-2xl: initial;` leaves only `md` at 48rem and `lg` at 64rem.
- `--text-*: initial;` removes `text-xs` through `text-9xl`, so the six type tokens below are the only font sizes that exist.
- `--radius-*: initial;` removes `rounded-sm` through `rounded-3xl`, leaving `--radius-ui`, `--radius-card`, and `--radius-full`.

Spacing, shadows, and durations keep Tailwind's defaults.

| Token | Value | Role |
|---|---|---|
| `--color-canvas` | `#0c1519` Chinese Black | The page, the `canvas` section tone, every former white or black band, field fills |
| `--color-raised` | `#162127` Dark Jungle Green | The `raised` section tone (the old `tint` rhythm) |
| `--color-panel` | `#3a3534` Jet | Every card, tile, the header card, the dropdown and mobile menu panel, the open accordion item, an empty photo frame. Separates from `canvas` (1.53:1) and `raised` (1.36:1) |
| `--color-heading` | `#f5ece4` | `h1` and `h2`; every word on a photo or on the Coffee wash; the outer band of the two colour ring |
| `--color-ink-strong` | `#f5ece4` | `h3` and sub headings, field labels, strong text. Same value as `heading` today, a separate role so a display face later can move one without the other |
| `--color-ink` | `#d9cbc0` | Body text, the most used text colour; field text |
| `--color-ink-muted` | `#b8aca3` | Hints, captions, card text; the hovered card border |
| `--color-accent` | `#cf9d7b` Antique Brass | Fills (primary button, the closing band, closed accordion items, process step circles, map markers, heading rules and accent bars, icon fills) AND words (links, emphasis, `==` phrases, numbers, the secondary button), and the focus ring |
| `--color-accent-hover` | `#e3bc9f` | The primary button's hover fill, and nothing else |
| `--color-on-accent` | `#0c1519` | The label or icon on an `accent` or `accent-hover` fill, and nothing else |
| `--color-accent-deep` | `#724b39` Coffee | The home service card's hover wash, and nothing else. Never a word |
| `--color-line` | `#724b39` Coffee | Decorative borders and dividers, the process timeline's connector. Never a control boundary, never a word |
| `--color-field` | `#8c8480` | Form field borders, a control boundary: 5.04:1 against the `canvas` fill |
| `--color-error` | `#ff8a7a` | Error text and error borders, on every surface |
| `--color-scrim` | `rgb(12 21 25 / 0.7)` | The see through layer under words on a photo. `heading` on it is 5.91:1 over a pure white pixel, so no photo can break it. Never lighter |
| `--color-scrim-strong` | `rgb(12 21 25 / 0.9)` | The contact form band's layer, and a project tile's hovered caption. With the `bg-diagonal` stripe on top, its worst pixel is `#31393c` |
| `--font-sans` | `var(--font-inter), sans-serif` (in `@theme inline`) | The only typeface |
| `--text-h1` | `clamp(2.25rem, 1.714rem + 2.381vw, 3.5rem)` | Page title, weight 700 |
| `--text-h2` | `clamp(1.75rem, 1.429rem + 1.429vw, 2.5rem)` | Section heading, weight 700 |
| `--text-h3` | `clamp(1.25rem, 1.143rem + 0.476vw, 1.5rem)` | Card and sub heading, weight 600 |
| `--text-lead` | `1.125rem` | Intro paragraphs |
| `--text-body` | `1rem` | Body text |
| `--text-small` | `0.875rem` | Labels, hints, errors, captions |
| `--radius-ui` | `0.25rem` | Every button, card, field, and image corner |
| `--radius-card` | `1.5rem` | The one large radius (the header card's bottom corners, the band cards) |
| `--radius-full` | `9999px` | Pills and round icon buttons |
| `--container-content` | `75rem` (1200px) | `Section` width `default` |
| `--container-narrow` | `45rem` (720px) | `Section` width `narrow` |

Retired by the 2026-10-09 revision, and covered by AC-16's search: `white`, `tint`, `black`, `gold`, `gold-deep`, `gold-ink`, `gold-on-dark`, `yellow`, `error-on-dark`, and the utilities `bg-diagonal-dark` and `bg-dots-dark`.

The type companion keys are unchanged:

```css
--text-h1--line-height: 1.1;
--text-h1--letter-spacing: -0.02em;
--text-h2--line-height: 1.2;
--text-h3--line-height: 1.3;
--text-lead--line-height: 1.6;
--text-body--line-height: 1.6;
--text-small--line-height: 1.5;
```

**There are no tone variables.** Both tones are dark and every text, border, and focus colour is identical on each, so components name their colours directly (`text-ink`, `border-accent`).

**The accent role rule** replaces the gold rule. It is a rule about roles, and it has one colour that may never be read:

| Role | Token | Allowed | Forbidden |
|---|---|---|---|
| Accent | `--color-accent` | Every fill, word, link, icon, rule, and focus ring listed in the token table, on `canvas`, `raised`, `panel`, and either pattern | As a word on a photo (2.88:1 over the scrim) or on the Coffee wash (3.66:1) |
| Accent, hover | `--color-accent-hover` | The primary button's hover fill | Everything else |
| On accent | `--color-on-accent` | The label or icon on an accent fill | Anywhere that is not an accent fill |
| Coffee | `--color-accent-deep`, `--color-line` | The service card wash; decorative borders, dividers, and the timeline connector | Any word, any control border, any focus ring |

The whole class search that keeps it honest (expect no hits in `src/`): `text-accent-deep`, `text-line`, `border-accent-deep`, `outline-accent-deep`, `outline-line`, `ring-accent-deep`, `ring-line`. As before, a class name quoted in prose inside `src/` counts as a hit and becomes real CSS; write the token name (`--color-line`) when talking about one.

**Global utilities** (in `global.css`, each rewritten for dark):

- `focus-contrast`: `outline-color: var(--color-heading)` and `box-shadow: 0 0 0 2px var(--color-canvas)`. Placed on photo bands (the home hero, the Project hero, the contact form band) and accent fills (`CtaBand`, a closed `Accordion` item) only.
- `bg-diagonal` (the one stripe; `bg-diagonal-dark` merges into it): `--color-heading` at 6%, 1px in every 10, at 135 degrees. On `canvas` its line is `#1b2327`; every text pair is measured there (the worst, `accent`, 6.66:1).
- `bg-dots` (renamed from `bg-dots-dark`): `--color-heading` at 14%, 2px every 12px. Only on `canvas`; a dot's centre is `#2e3639`, where `accent` reads 5.15:1 and `ink-muted` 5.56:1. Never on `raised`, where `accent` would drop to 4.42:1.
- `select-chevron`: the data URI stroke becomes `--color-ink`'s value, `%23d9cbc0`.
- `heading-rule`: the line is `bg-accent`. Motion contract unchanged.

**Base layer** (`@layer base`): `html` gets `color-scheme: dark` beside the existing `scroll-behavior: smooth`; `body` uses `bg-canvas font-sans text-body text-ink antialiased`; `h1` and `h2` take `text-heading`; `h3` takes `text-ink-strong`; `:focus-visible` gets `outline: 2px solid var(--color-accent); outline-offset: 2px`; `::selection` gets `background-color: var(--color-accent); color: var(--color-on-accent)`; the reduced motion cut is unchanged. `BaseLayout.astro` adds `<meta name="theme-color" content="#0c1519">` (a meta tag cannot read a custom property, so the value is written out and named in a comment beside it, the same exception as `select-chevron`).

**The class move**, for `/develop`'s sitewide pass. The plain rows are a rename everywhere; the named rows are the cases a rename alone gets wrong:

| Today | Becomes | Where it is not a plain rename |
|---|---|---|
| `bg-white` as a band or page | `bg-canvas` | `Section` `white` tone, `ProjectGallery` band, `ProjectCover`'s band, `Footer`'s badge strip (its `bg-white` is removed instead, keeping `p-4` and `max-w-sm`: the badges carry their own tiles) |
| `bg-white` as a card, panel, or control | `bg-panel` | `Card`, band cards and tiles, `ContactCard`, the contact form's success box (`ContactForm.tsx`), `ServiceCard`, the intro stat cards, the header card, dropdown, and mobile panel, the open accordion item, the hero arrows, the skip link. The accordion icon circle becomes `bg-canvas text-accent`, `group-open:bg-raised` (the icon stays `accent` open or closed, 7.71:1 and 6.84:1; without `text-accent` it would inherit the closed title's `on-accent` and vanish into the circle). Fields become `bg-canvas` |
| `bg-tint` as a section | `bg-raised` | `ServiceCard`'s wash start becomes `before:from-panel` (AC-19) |
| `bg-tint` as a box | `bg-panel` | The project facts panel (`ProjectStory.astro`), the service intro photo frame (`IntroCarousel.astro`); on `canvas` a `raised` box would be 1.13:1 and vanish |
| `bg-black` | `bg-canvas` | Photo frames (`wall.ts`, `ProjectShowcase`, the `ProjectGallery` tile, `ProjectCover`'s frame) become `bg-panel`, so an empty frame still reads as a tile. `ctaLinkClass` becomes `bg-canvas text-heading hover:bg-panel` (15.83:1 and 10.35:1) |
| `text-black`, `text-white` | `text-heading` | Inside `ServiceCard` on hover, every text class becomes `group-hover:text-heading` and `group-has-[a:focus-visible]:text-heading`. Labels on an accent fill (primary button, closed accordion title, process step number, `CtaBand` heading and text) become `text-on-accent` |
| `bg-black/30`, `bg-black` (carousel dots) | `bg-heading/50`, `bg-heading` | Not `/30`: cream at 30% is 2.48:1 on `canvas` and lost on a bright hero photo; at 50% it is 4.73:1 |
| `text-ink-muted/60` (the presence world map's dots) | `text-ink-muted/40` | The region labels (`text-heading`) sit over the dots from `md` up: at 60% they would read 4.22:1, at 40% 6.81:1, and the dots still show at 2.32:1 |
| `border-white`, `border-white/10`, `border-white/20`, `border-white/60`, `outline-white`, `ring-white`, `ring-black` | `border-heading`, `border-line`, `border-line`, `border-heading/60`, `outline-heading`, `ring-canvas`, `ring-canvas` | The Project hero filter: `peer-checked:border-heading`, `peer-focus-visible:ring-canvas`, `peer-focus-visible:outline-heading`. The presence map marker: `ring-canvas` |
| `bg-gold`, `fill-gold`, `before:bg-gold`, `after:bg-gold`, `decoration-gold`, `bg-gold-on-dark` | `bg-accent`, `fill-accent`, `before:bg-accent`, `after:bg-accent`, `decoration-accent`, `bg-accent` | `ProcessTimeline`'s connector `after:bg-gold` becomes `after:bg-line` |
| `hover:bg-gold-deep` | `hover:bg-accent-hover` | Primary button only |
| `text-gold-ink`, `text-gold-on-dark`, `border-gold-ink`, `outline-gold-ink`, `hover:text-gold-ink`, `hover:text-gold-on-dark`, `group-open:text-gold-ink` | the same with `accent` | `Emphasis` loses `surface` at every call site (about 24, including the service bands, `Footer`, `Accordion`, and `PresenceBand`): a `==` phrase is `font-semibold text-accent`, or `font-semibold text-heading` when the caller passes `onPhoto`. Only the Project hero's intro passes `onPhoto`, because brass on a photo is 2.88:1 |
| `border-gold`, `group-hover:border-gold`, `group-has-[a:focus-visible]:border-gold` | the same with `accent` | `ServiceCard` side bars only |
| `before:to-gold/70` | `before:to-accent-deep/70` | `ServiceCard` only (AC-19) |
| `text-error-on-dark` | `text-error` | |
| `bg-diagonal-dark`, `bg-dots-dark` | `bg-diagonal`, `bg-dots` | |
| every `shadow-*` class, including variants (`hover:`, `open:`, `link-focus:`, the intro card's arbitrary white glow and its `/0` twin) | removed | A shadow cannot be seen on a dark page. Lifts (`translate`) stay. Today in `Header`, `Accordion`, `ServiceCard`, `ContactForm`, the hero arrows, the skip link, `bandCardClass`, `Card`, and the intro cards |
| `hover:shadow-md` on `Card` | `hover:border-ink-muted` | AC-8. `Card`'s unused `elevated` prop is deleted with it |
| `focus-contrast` on the home `IntroBand`, the dots `PatternBand`, `Footer` | removed | The base ring now passes there (AC-10). `Accordion` keeps it on its wrapper, so open (`panel`) items take the two colour ring too, which passes there. The `ContactCard` links keep inheriting it from `FormBand`, a photo band |
| (new) the footer's top edge | `border-t border-line` | The footer now follows `canvas` bands; a Coffee hairline marks where it starts |

**Class maps** (`src/components/ui/styles.ts`):

- `buttonVariants.primary`: `bg-accent text-on-accent hover:bg-accent-hover`. `secondary`: `border-2 border-accent text-accent hover:bg-accent hover:text-on-accent`.
- `fieldClass`: `min-h-11 w-full rounded-ui border bg-canvas px-3 py-2 text-body text-ink`, plus `border-field` or the error ring as before. `fieldLabelClass`, `fieldHintClass`, and `fieldErrorClass` become single strings (`text-small font-semibold text-ink-strong`, `text-small text-ink-muted`, `text-small text-error`), and the `surface` prop leaves `TextField`, `TextArea`, `Select`, and their call sites.
- The band maps `bandHeadingClass`, `bandBodyClass`, `bandCardClass`, `bandTileClass`, and `bandIconClass` become single strings: `text-heading`, `text-ink`, `rounded-card border border-line bg-panel`, `rounded-ui border border-line bg-panel`, `text-accent`. The `Surface` type is replaced by `BandPattern = 'stripe' | 'dots'`, which only `PatternBand` reads.

**Tones are renamed, never reassigned.** Every `white` tone becomes `canvas` and every `tint` becomes `raised`, page by page, with no new rhythm: the About page stays `canvas`, `canvas`, `canvas` under the stripe. After this change every band on a service page that is not a pattern band is `canvas`, so a dots band next to a `canvas` section has no seam; that is intended ("patterns carry them").

**Service page planning** (`src/lib/service-page.ts`): the `BAND_BACKGROUND` kind `'white'` becomes `'canvas'`, `striped.tone` becomes `'canvas' | 'raised'`, and the rule that turns a presence band's stripe to the alternate tone after a stripe pattern band is kept, now testing `previous.surface === 'stripe'` and giving `raised`. `[service].astro` renders the `canvas` kind as `<Section tone="canvas">`.

**Content** (`src/content.config.ts` and `src/content/services/en/*.yaml`): the service block `surface` enum becomes `z.enum(['stripe', 'dots'])` (`light` was the stripe, `dark` the dots); the three YAML files move their values; the refinement that rejected a `==` mark on a `light` block's body is deleted together with the helpers only it used (`LIGHT_MARK_FIELDS`, `stringsIn`, and the `Path` type), so lint stays clean. Comments that describe the old values (the head of `interior-bim.yaml`, the footer note in `content.config.ts`) are rewritten. In `src/content/settings/en/site.yaml`, `logo` points at the light mark; `logoOnDark` leaves the schema and the file, and `Footer` reads `logo`. The navy `logo.svg` is deleted and `logo-on-dark.svg` renamed to `logo.svg`.

**The dark illustration**: `src/assets/images/services/service-illustration-dark.png`, generated once from the original with `sharp` by unmixing white: each pixel's alpha is its distance from white (the largest of `255 − R`, `255 − G`, `255 − B`, over 255), and its stroke colour is recovered against white. Each pixel is then classified by hue: warm (recovered `R − B` above 60, the gold strokes and their brown edges) becomes `#cf9d7b`, everything else (the navy strokes) becomes `#f5ece4`, and the unmixed alpha is kept so edges stay smooth. `sharp` is not a direct dependency, so the one off script lives in the session scratchpad and is run with Node resolving the copy pnpm already installed for Astro (by its path under `node_modules/.pnpm`); it is not checked in. `src/assets/images/CREDITS.md` records the recipe and that the file derives from the original, which stays as the source. The one content reference, `src/content/home/en/home.yaml` (`services` illustration), switches to the dark file. The CREDITS line for `brand/logo.svg` is updated for the logo swap.

**Comments and the AC-16 search.** AC-16 counts comments too: a class name quoted in a comment is still scanned by Tailwind and still matches the search, so comments that quote a retired class are rewritten (about 25 today, for example in `FormBand`, `PatternBand`, `styles.ts`, `AudiencesGrid`, and `/styleguide`). Prose that merely says "gold" or "light tone" is rewritten in files this revision already touches, not hunted elsewhere. The search matches a utility prefix right before a retired name, so `whitespace-nowrap` does not match: the regular expression `(bg|text|border|fill|stroke|outline|ring|decoration|from|to|via|shadow)-(white|tint|black|gold|yellow|error-on-dark)\b` (which also covers `gold-deep`, `gold-ink`, `gold-on-dark`, and any `/opacity` or variant prefix), plus the literals `bg-diagonal-dark` and `bg-dots-dark`, run over `src/` with `rg`.

**`/styleguide`**: "On raised" replaces every "On tint" demo; the duplicate "on white" demos (`sg-buttons-white`, `sg-cards-white`, `sg-fields-white`) are deleted; the `sg-gold` right and wrong box becomes an accent and Coffee right and wrong box; the `surface="dark"` field demos go (fields have one style) and the `PatternBand` demos show `stripe` and `dots`. Swatches list `heading` and `ink-strong` as separate entries though they share a value, and so do `accent-deep` and `line`. Hex values shown as label text are allowed; AC-14's ban is on hex used as a colour.

**State transitions**: none stored. Components have visual states only: rest, hover, keyboard focus, disabled (buttons), invalid (fields).

**API surface** (component props; every component is public and static, rendered at build):

| Component | File | Props (req = required) | Renders | Key misuse errors |
|---|---|---|---|---|
| `Section` | `src/components/ui/Section.astro` | `tone`: `'canvas' \| 'raised'` (opt, default `canvas`) · `width`: `'default' \| 'narrow'` (opt, default `default`) · `id`: string (opt) · `labelledBy`: string (opt) · default slot | `<section aria-labelledby>` full width, carrying its own background utility, with padding and an inner `div` centred at the max width with gutters | Unknown `tone` (including the retired `white` and `tint`) or `width` fails `pnpm check` |
| `Button` (Astro) | `src/components/ui/Button.astro` | `variant`: `'primary' \| 'secondary'` (opt, default `primary`) · `href`: string (opt) · `type`: `'button' \| 'submit'` (opt, default `button`) · `disabled`: boolean (opt, `<button>` only) · default slot (the label) | `<a>` when `href` is set, else `<button>` | `href` together with `disabled` is a type error |
| `Card` | `src/components/ui/Card.astro` | `title`: string (req) · `text`: string (opt) · `image`: `{ src: ImageMetadata; alt: string }` (opt) · `href`: string (opt) · `headingLevel`: `2 \| 3 \| 4` (opt, default `3`) · default slot (opt, no interactive content when `href` is set) | `<article>` wrapping Astro `<Image>` and a body whose heading text is the link when `href` is set | Missing `title` or an `image` without `alt` fails `pnpm check` |
| `Button` (React) | `src/components/react/ui/Button.tsx` | `variant` (opt) · `type` (opt, default `button`) · `disabled` (opt) · `children` (req) · other native button props | `<button>` only | none beyond TypeScript |
| `TextField` | `src/components/react/ui/TextField.tsx` | `name` (req) · `label` (req) · `type`: `'text' \| 'email' \| 'tel'` (opt) · `id` (opt, falls back to `useId()`; explicit when placed in an `.astro` file) · `hint` (opt) · `error` (opt) · `required` (opt) · other native input props. **No `surface`** | `<div>` with `<label for>`, optional hint, `<input>`, optional error | Passing `surface` is a type error |
| `TextArea`, `Select` | `src/components/react/ui/` | as `TextField` minus `type`; `TextArea` adds `rows`, `Select` its options. **No `surface`** | the same shape with `<textarea>` or `<select>` | Passing `surface` is a type error |
| `Emphasis` | `src/components/ui/Emphasis.astro` | `text`: string (req) · `onPhoto`: boolean (opt, default `false`) · `strongClass`: string (opt). **No `surface`** | Inline runs: `**` bold in the caller's colour, `==` bold `accent`, or bold `heading` with `onPhoto` | Passing `surface` is a type error |
| class maps | `src/components/ui/styles.ts` | `buttonClass(variant)`, `fieldClass(invalid)`, `selectClass(invalid)`, `ctaLinkClass`, the band strings, `cx(...parts)` | Pure functions and constants returning complete class strings, every literal inside a `cx('…')` call | A class built from fragments is missed by Tailwind's scanner |

Visual detail per component, so the build invents nothing:

- **Section**: padding `py-16 md:py-20 lg:py-24`, gutters `px-4 md:px-6 lg:px-8`, inner `mx-auto w-full max-w-content` or `max-w-narrow`. Tone backgrounds `bg-canvas` and `bg-raised`. Alternating `canvas` and `raised` is the default rhythm.
- **Button**: `inline-flex min-h-11 items-center justify-center gap-2 rounded-ui px-5 py-2.5 text-body font-semibold transition-colors duration-150`, plus the variant strings above. Disabled: `disabled:cursor-not-allowed disabled:opacity-60`.
- **Card**: `relative flex h-full flex-col overflow-hidden rounded-ui border border-line bg-panel`. Image `aspect-3/2 w-full object-cover` with the existing `sizes`. Body `flex flex-1 flex-col gap-2 p-6`; title `h3` scale in `text-ink-strong`; text `text-ink-muted` (5.45:1 on `panel`). With `href`: stretched title link, `focus-visible:outline-none` on the link, `link-focus:outline-2 link-focus:outline-offset-2 link-focus:outline-accent` on the card, hover underlines the title and sets `hover:border-ink-muted`.
- **Fields**: as the class maps above; no placeholder text; no required marker drawn by the component.

**Value sourcing**:

| Action | Value produced / displayed | Source |
|---|---|---|
| Any component | Every colour | The `@theme` tokens in `src/styles/global.css` (this spec's token table) |
| Any component | Which token a former class becomes | The class move table above; a case it does not name is a plain rename by role |
| Any component | Whether a word may be `accent` | The accent role rule: surface is `canvas`, `raised`, `panel`, or a pattern, never a photo or the Coffee wash |
| `BaseLayout` | `theme-color` value | `--color-canvas`'s value `#0c1519`, written out (a meta tag cannot read CSS) |
| `select-chevron` | Stroke colour | `--color-ink`'s value `#d9cbc0`, written into the data URI |
| `PatternBand` | Band background and pattern | The block's `surface` in content: `stripe` gives `bg-canvas bg-diagonal`, `dots` gives `bg-canvas bg-dots` |
| Header, Footer | Logo image and alt | `settings.logo` (one entry, the light mark) |
| `ServiceCard` | Illustration | The content entry's image, pointed at `service-illustration-dark.png` |
| `/styleguide` | Token names, hex values, contrast figures | Written in the dev only page itself, matching the token table |
| `docs/design.md` | Contrast ratios | Computed from the token values with the WCAG relative luminance formula; composites (scrim, stripe, dots, wash) by alpha blending over the worst case pixel. Recorded in rationale.md |
| Every page | Inter font files | Astro fonts API with the Fontsource provider, unchanged |

**Contrast, the pairs in use** (to be carried into `docs/design.md` with each pair's role):

| Foreground | Background | Ratio | Needs |
|---|---|---|---|
| heading / ink-strong | canvas / raised / panel | 15.83 / 14.05 / 10.35 | 4.5 |
| ink (body, field text) | canvas / raised / panel | 11.66 / 10.35 / 7.62 | 4.5 |
| ink-muted (hints, card text) | canvas / raised / panel | 8.33 / 7.39 / 5.45 | 4.5 |
| accent (links, emphasis, numbers, secondary button) | canvas / raised / panel | 7.71 / 6.84 / 5.04 | 4.5 |
| on-accent (primary button label, closing band text, closed accordion title, step number) | accent / accent-hover | 7.71 / 10.52 | 4.5 |
| heading (`ctaLinkClass` label) | canvas / panel (hover) | 15.83 / 10.35 | 4.5 |
| error | canvas / raised / panel | 8.06 / 7.16 / 5.27 | 4.5 |
| field border | canvas (the field's fill) | 5.04 | 3.0 |
| focus ring accent | canvas / raised / panel | 7.71 / 6.84 / 5.04 | 3.0 |
| text over a `bg-diagonal` line on canvas (`#1b2327`): heading / ink / ink-muted / accent | | 13.68 / 10.07 / 7.19 / 6.66 | 4.5 |
| text over a `bg-diagonal` line on raised (`#242e34`, a presence band switched to `raised` after a stripe pattern band): heading / ink / ink-muted / accent | | 11.88 / 8.75 / 6.25 / 5.78 | 4.5 |
| heading (presence region labels) over a world map dot (`ink-muted` at 40% on canvas, `#515150`) | | 6.81 | 4.5 |
| heading at 50% (inactive carousel dot) / heading (active) | canvas | 4.73 / 15.83 | 3.0 |
| text on a `bg-dots` dot centre (`#2e3639`): heading / ink / ink-muted / accent | | 10.57 / 7.78 / 5.56 / 5.15 | 4.5 |
| heading on `scrim` over a pure white pixel (`#555b5e`) | | 5.91 | 4.5 |
| on the form band's worst pixel (`#31393c`): heading / ink / ink-muted / error / accent | | 10.11 / 7.44 / 5.32 / 5.15 / 4.92 | 4.5 |
| heading on the Coffee wash's darkest point (`#614438`) | | 7.52 | 4.5 |
| two colour ring, canvas inner / heading outer | accent fill / any photo | canvas on accent 7.71; on any colour one band reaches at least 3.98 | 3.0 |

**Contrast, deliberately never text** (so a later reader does not "fix" them):

| Pair | Ratio | Why it is still fine |
|---|---|---|
| Coffee (`line`) on canvas / panel | 2.45 / 1.60 | Decorative borders and dividers, never a control boundary, so WCAG 1.4.11 does not apply |
| panel on canvas / raised | 1.53 / 1.36 | A card surface, not a control boundary; a linked card's affordance is its title link and focus ring |
| raised on canvas | 1.13 | Section rhythm only, as white against cream was |
| accent on a photo or on the wash | 2.88 / 3.66 | Forbidden as a word there by the accent role rule |

**Key invariants**:
- Every colour, font size, radius, and container width resolves to a token, and the build enforces it: an off token class produces no CSS. No raw hex, no arbitrary value, no `<style>` block, no new CSS file outside `src/styles/global.css` (the `theme-color` meta is the one written out value outside it, named beside its token).
- Line height and letter spacing are never written on a component.
- Only two breakpoints exist, `md` and `lg`.
- Tokens are defined once, in `global.css`; `docs/design.md` describes them and must match, in the same commit.
- Class maps return complete, literal class strings inside `cx('…')`.
- Both tones are dark and no component reads or sets a tone variable. `Section` is the only component that names a section tone.
- Coffee is never read. Text on a photo is only `heading`. `on-accent` lives only on an accent fill.
- Every heading or paragraph inside an accent fill carries `text-on-accent` explicitly, because the base layer makes headings `heading` (2.05:1 on brass). And nothing `canvas` coloured sits inside an accent fill unless a lighter colour is set on it, because `on-accent` and `canvas` are the same value (the accordion icon circle is the case today: its icon is `text-accent`).
- Tones are renamed, never reassigned; no page gets a new rhythm in this revision.
- The two existing `<style is:global>` blocks (`Header.astro`, `PageLayout.astro`) carry no colour and stay; AC-14 forbids new ones.
- `focus-contrast` sits only on photo bands and accent fills.
- No retired colour name survives in `src/` (AC-16).
- Components never contain visible copy, and no component ships client JavaScript except the contact island.
- `/styleguide` is injected only when Astro runs in dev.

**Security model**: public, static, read only markup. No user data is stored or sent by this feature.

**Configuration required**: none. No environment variables or credentials.

**Critical test scenarios** (each maps to an acceptance criterion in ## Requirements):
- Retired names: run the AC-16 whole class search over `src/` and get no hits; run the accent role rule's Coffee search and get no hits, verifies **AC-11**, **AC-16**
- Every page, every width: open `/`, `/about-us`, each service page, `/project`, a `/project/<slug>`, `/contact-us`, and the 404 at 360, 768, and 1440px; no light band or box except the badge tiles, nothing invisible, layout as before, verifies **AC-6**, **AC-17**
- Keyboard: Tab through the header, a card grid, the home intro band, a dots band, the footer, the contact form, the closing band, an accordion, and the Project hero filter; a brass ring on every dark surface, the two colour ring only on photos and accent fills, none on a mouse click, verifies **AC-10**
- Buttons and cards: hover a primary (brightens, label stays dark), a secondary (fills brass), and a linked `Card` (title underlines, border lightens, no shadow), verifies **AC-7**, **AC-8**
- Fields: on `/contact-us`, submit empty; each field shows a coral error tied by `aria-describedby`, no layout shift; autofill an email in Chrome and the field stays dark, verifies **AC-4**, **AC-9**
- Photos: on the home hero, the Project hero, and the project tiles, swap in or emulate the brightest photo region under the words; read the computed scrim as Chinese Black at 0.7 and the form band's as 0.9; the Project hero intro's `==` phrase is bold cream, not brass, verifies **AC-11**, **AC-18**
- Service card wash: hover and keyboard focus a home service card; Coffee rises, every word turns cream, side bars brass, verifies **AC-19**
- Assets: the header and footer show the same light logo; the service cards show the transparent illustration with cream and brass strokes and no white box; the badges show their own tiles with nothing behind, verifies **AC-20**
- Content guard: set one service block's `surface` to `light` and run `pnpm build`; it fails naming the file; revert. Put a `==` phrase in a `stripe` block's body and it builds, verifies **AC-21**
- Browser chrome: the root's computed `color-scheme` is `dark`, the head carries the `theme-color` meta, selected text shows brass with dark text, verifies **AC-4**
- Documentation: every token in `global.css` appears in `docs/design.md` with its role, each pair's ratio meets its threshold, and `/styleguide` shows every swatch on both tones, verifies **AC-1**, **AC-11**, **AC-13**
- Gates: `pnpm check`, `pnpm lint`, `pnpm format:check`, `pnpm build`; `dist/client/` has one HTML file per route and no style guide, verifies **AC-2**, **AC-14**, **AC-15**
- Reduced motion: with reduce motion on, a button hover changes colour instantly, verifies **AC-12**

## Build plan

The 2026-09-19 build (steps 1 to 5 of the first plan: Tailwind and the tokens, the Astro components, the React fields, the style guide and `design.md`, the gate) shipped and was verified on 2026-09-20. The 2026-10-09 revision builds on it, Skateboard style: the first milestone already turns the whole site dark with nothing missing, each later one fixes what a rename alone gets wrong, and the last proves it.

1. **The whole site goes dark.** Rewrite the colour block of `global.css` to the token table (retired tokens deleted), `@theme` comments rewritten for the dark roles; rewrite `focus-contrast`, `bg-diagonal` (absorbing `bg-diagonal-dark`), `bg-dots` (renamed), `select-chevron`, `heading-rule`, and the base layer (`color-scheme`, body, headings, focus outline, `::selection`). Change `Section`'s tones to `canvas` and `raised` and update every call site, and `src/lib/service-page.ts` with them. Move every component's classes per the class move table's plain rows, and the class maps per the class maps list, rewriting comments that quote a retired class. Run the AC-16 search until it is clean, then `pnpm build` and preview every route once, satisfies **AC-2**, **AC-4**, **AC-6**, **AC-7**, **AC-10**, **AC-11**, **AC-16**
2. **What a rename gets wrong.** Work the class move table's named cases: `ctaLinkClass`; `Card`'s hover; the field maps collapsed and `surface` removed from `TextField`, `TextArea`, `Select`, and `ContactForm`; `Emphasis`'s `surface` removed at every call site and `onPhoto` passed by the Project hero only; the band maps collapsed and `BandPattern` added; the content `surface` enum moved to `stripe` and `dots` in `content.config.ts`, `service-page.ts`, and the three YAML files, the `==` refinement and its helpers deleted; the `ServiceCard` wash and hover text; the boxes and photo frames on `panel`; the accordion icon colour; the map dots and carousel dots; `ProcessTimeline`'s connector; every shadow and `Card`'s `elevated` prop removed; `focus-contrast` removed from the plain dark bands; the footer's top hairline. Then the content guard drill, satisfies **AC-8**, **AC-9**, **AC-10**, **AC-11**, **AC-14**, **AC-19**, **AC-21**
3. **Photos, assets, and browser chrome.** Set `scrim` and `scrim-strong` and check every photo band's words are `heading`; merge the logo setting and rename the files; drop the footer badge strip; generate the dark illustration, point the content at it, and add its CREDITS line; add the `theme-color` meta to `BaseLayout.astro`, satisfies **AC-4**, **AC-17**, **AC-18**, **AC-20**
4. **Written down and gated.** Rewrite `docs/design.md`'s Character, Build mandate, Colour, the accent role rule (in place of the gold rule and its class search), both contrast tables, Tones, and the colour words in each component entry; rewrite `/styleguide`'s swatches and tone demos; update root `AGENTS.md`'s design line only through `/sync`. Run `pnpm check`, `pnpm lint`, `pnpm format:check`, `pnpm build`; confirm one HTML file per route and no style guide in `dist/`; walk every critical test scenario, including every route at 360, 768, and 1440px, satisfies **AC-1**, **AC-3**, **AC-5**, **AC-11**, **AC-12**, **AC-13**, **AC-15**, **AC-17**

## Consequences

**Positive**:
- The site wears the client's own brand, not a palette borrowed from another firm, and the "real brand" follow up is half closed (colour done; logo and typeface remain).
- One accent token for fills and words removes the most misusable rule of the light system: an AI suggestion reaching for `text-accent` is now right everywhere except on a photo.
- Role names mean a class reads true (`bg-panel` is a panel) and the next palette change is values only, which the first rebrand on 2026-09-20 already showed for values and this one now makes true for names.
- Fields, band maps, and the content `surface` all lose their light or dark split, so three adaptive mechanisms collapse to one style each.

**Negative / tradeoffs**:
- The rename touches about 35 files at once, and a missed class fails silently (no CSS, no error). AC-16's search is the only guard; it has to be clean before anything else is judged.
- Photos sit under a darker scrim (70% instead of 60%), so the hero and project photos read noticeably dimmer than today.
- Every section, band, and footer is now on dark, so the page has less built in rhythm than white against black did. The bands lean on their patterns, Jet cards, and the brass closing band to separate.
- Coffee is barely visible on the page (2.45:1, 1.60:1 on Jet), so the decorative lines are quiet by design; anyone wanting louder structure has to pick another colour, not raise Coffee to a word.
- Specs 0004 to 0016 still describe their bands in the old colour words. They are history now, and a reader must know that this spec overrides their colour wording.
- Brand assets are still placeholders: the light logo is the old mark in white, the badges stay navy on light tiles, and the dark illustration is a mechanical recolour of a placeholder.

**Neutral**:
- `logo-on-dark.svg` becomes `logo.svg` and the navy file is deleted; `settings` loses `logoOnDark`.
- A new image, `service-illustration-dark.png`, sits beside the original, which stays as its source.
- The three service YAML files change one value per pattern block.
- The favicon already adapts to the visitor's system scheme and is unchanged.
- The Turnstile widget already renders with `theme: 'dark'` and is unchanged.

## Follow-up

- [ ] Replace the placeholder logo and the certification badge placeholders with the client's real marks before launch (feature 14). The colours are now the client's own; the logo and the typeface are what remain of the "Real brand" follow up.
- [ ] The swatch board shows a high contrast serif display face in capitals for headings. Choosing a display face is its own decision (font loading, metric fallback, the heading scale): enroll it when you want it. `heading` and `ink-strong` are separate tokens so that change can move only the headings.
- [ ] Specs 0004 to 0016 describe colour in the light system's words. This spec overrides them; `/sync` can flag them, and a later revision of any of them should adopt the new token names.
- [ ] The scope's Deferred "A dark section tone" item is settled by this revision (every tone is dark) and can be removed; "Real brand" narrows to the logo and typeface. `/scope` or `/sync` owns those edits.
- [ ] Root `AGENTS.md` `## Rules` mentions the design system generically; once built, the accent role rule (Coffee is never read; text on a photo is only `heading`) belongs there as the one convention the build cannot catch. `/sync` owns that edit.
- [x] Feature 10 (contact page) wires the fields and the React `Button` into the island. Settled by spec [0011](../0011-contact-page/index.md); its `surface` prop is retired by this revision.
- [ ] Feature 12 (performance) confirms the `sizes` values in `Card` against the real layouts and checks the Inter preload against the Core Web Vitals targets.
