# 0003. Build the design system as Tailwind tokens plus four base components

**Date**: 2026-09-21 (two tokens and the second focus rule added by specs 0004 and 0005; palette revised 2026-09-20; first written 2026-09-19)
**Status**: Accepted
**Scope feature**: 4, Design system & UI foundation (`docs/scope/scope.md`)

## Summary

The site gets one visual language, taken from the reference site paviliusbim.com: brand gold on a light background, with black and gray carrying the text, the Inter typeface, 4px corners, and plenty of white space. Every colour, size, and breakpoint is defined once as a Tailwind token in `src/styles/global.css`, and Tailwind's own default colours are switched off, so a page can only use the agreed palette. On top of the tokens sit four base pieces: a section wrapper (white or a warm cream tint), a button (primary and secondary), a card, and form fields for the contact form.

Gold is a fill colour, not a text colour. Full gold `#e09900` carries button fills, highlight fills, and decorative rules, always with black on it (8.73:1). A deeper gold `#946600`, the same hue, is the only gold allowed to be a word, a link, an outline, or a focus ring on a light background, because full gold on white measures 2.41:1 and fails WCAG AA at any text size. Both section tones are light, so nothing in the system adapts to a dark background and no component takes a tone prop. A dev only `/styleguide` page shows everything in one place, and `docs/design.md` is the written reference every later page feature builds from.

## Requirements

**User stories**:
- As the developer building features 5 to 10, I want tokens and base components ready so that each page is composed from them rather than styled from scratch.
- As a visitor on a phone, tablet, or desktop, I want text sized for my screen and every control easy to tap so that the site reads well wherever I open it.
- As a keyboard or screen reader user, I want every control reachable with a visible focus outline and readable contrast so that I can use the whole site.
- As the site owner, I want the look written down in one place so that a rebrand or a new page later does not drift from it.

**Acceptance criteria** (the contract, each criterion is IDed and independently checkable):
- **AC-1**: `docs/design.md` exists and documents: every colour token with its role and the contrast ratio of each text pair it is used for; the type scale (size at 360px and at 1200px viewport, line height, letter spacing, weight); spacing and section rhythm; the three breakpoints (mobile below 768px, tablet 768 to 1023px, desktop from 1024px); the two section tones; the rule separating the fill golds from the text gold; and each component's props and usage rules.
- **AC-2**: Tailwind CSS v4 is installed and every design token is defined once, in the `@theme` block of `src/styles/global.css`. Four namespaces are cleared to `initial` and then repopulated with this spec's tokens only: colours, the `sm`, `xl`, and `2xl` breakpoints, font sizes, and corner radii. So `bg-red-500`, `sm:flex`, `text-xs`, and `rounded-full` each generate no CSS unless this spec defines them. Spacing, shadows, and durations deliberately keep Tailwind's defaults.
- **AC-3**: Inter (variable, weights 400 to 700, latin subset) loads through Astro's fonts API: the font file is served from the site's own origin, preloaded in the head, and paired with a metric matched fallback. No page requests a font from a third party host.
- **AC-4**: `BaseLayout.astro` applies the base styles to every page with no per page work: Inter, ink body text on a white background, black `h1` and `h2`, `#333333` `h3`, default sizes for `h1` to `h3`, and the focus outline.
- **AC-5**: Headings scale fluidly with the viewport and never jump at a breakpoint: `h1` from 36px at 360px wide to 56px at 1200px and wider, `h2` from 28px to 40px, `h3` from 20px to 24px. Body text is a fixed 16px, lead text 18px, small text 14px. All sizes are in `rem`, so full page browser zoom scales them and WCAG 1.4.4 is met. (The `vw` term inside the heading clamps does not respond to a browser's text only scaling setting the way a pure `rem` value would; the `rem` term still does, and the fixed body, lead, and small sizes are pure `rem`.)
- **AC-6**: `Section` renders a full width band in one of two tones (`white`, `tint`) with its content centred at a maximum of 1200px (`default`) or 720px (`narrow`), side gutters of 16px, 24px, and 32px on mobile, tablet, and desktop, and vertical padding of 64px, 80px, and 96px. Both tones are light, so every text, border, and focus colour is identical on each; no component takes a tone prop and no component reads a tone variable.
- **AC-7**: `Button` exists as an Astro component and a React component that share one class map, so both have the same two variants and look identical: `primary` (full gold `#e09900` fill with black text, 8.73:1) and `secondary` (deep gold `#946600` border and label, 5.05:1 on white). Both are at least 44px tall and both variants stay readable on white and on the tint. The Astro component additionally renders an `<a>` when given `href` and a `<button>` otherwise (type `button` by default, `submit` when asked), and supports `disabled` on the `<button>` form only. The React component renders a `<button>` only; it has no `href`, because the contact island never needs a link button.
- **AC-8**: `Card` shows an optional image (3:2, cropped to fill), a title at a heading level the page chooses (default `h3`), optional text, and an optional link. With a link, the whole card is clickable through one link with one tab stop whose accessible name is the title. Keyboard focus draws one deep gold outline around the whole card and none around the title text alone. Hover is a different treatment on purpose, a raised shadow plus an underlined title, so that a mouse user is never shown something that reads as a focus ring. The card renders correctly with no image, with no link, and with a title long enough to wrap to three lines (no overflow, no clipped text).
- **AC-9**: React `TextField` (types `text` and `email`) and `TextArea` show a visible label tied to the control, an optional hint, and, when given an error, an error message linked through `aria-describedby` with `aria-invalid="true"` on the control. The error state adds a thicker error outline without moving the layout and shows text, so it never relies on colour alone. Controls are at least 44px tall, and ids are unique on the page: inside one React island they are generated when no `id` is passed, and a field placed directly in an `.astro` file (the style guide) always receives an explicit `id`.
- **AC-10**: Every interactive element these components render is reachable with Tab in reading order and shows a 2px solid deep gold (`#946600`) outline with a 2px gap when focused by keyboard, the same on both tones. Mouse clicks do not show the outline. (Amended 2026-09-21 by spec 0005, AC-18: on any surface that is not one of the two light tones, today the home hero photo and the gold band, the ring is instead a 2px black band around the control plus a 2px white band outside it, from the `focus-contrast` utility in `global.css` placed on that band. Two rules by surface, no exceptions.)
- **AC-11**: Every text and background pair listed in `docs/design.md` meets WCAG 2.2 AA: at least 4.5:1 for normal text, at least 3:1 for large text, field borders, and the focus outline. Each ratio is written next to the pair. Full gold `#e09900` (2.41:1 on white) and yellow `#ffcc00` (1.51:1) never render as text or as a control boundary on a light background; they appear only as fills carrying black text, and as decoration. Gold as a word, a link, an outline, or a focus ring is always `--color-gold-ink`.
- **AC-12**: When the visitor's system asks for reduced motion, every transition and animation is cut to a near zero duration (0.01ms), so state changes appear instant.
- **AC-13**: `/styleguide` is available under `pnpm dev` only. It shows every colour token as a swatch, each labelled with what it may and may not be used for, the type scale, the spacing steps, and every component in every variant on both tones, filled with real entries from the content collections. After `pnpm build`, nothing under `dist/` contains the style guide, and `dist/client/` still has exactly one HTML file per page route.
- **AC-14**: The style guide page and the four components use only tokens and Tailwind utilities: no `<style>` block, no new CSS file, no raw hex colour, and no Tailwind arbitrary value (a class with square brackets such as `text-[13px]`) outside `src/styles/global.css`.
- **AC-15**: `prettier-plugin-tailwindcss` sorts class lists; `pnpm check`, `pnpm lint`, `pnpm format:check`, and `pnpm build` all pass; and no built page gains any client JavaScript from this feature (no island is hydrated, no script is emitted).

## Decision

**Chosen option**: Option 1: Tailwind v4 tokens and four small base components, on a light only two tone palette taken from the reference site.

Define the whole visual language as Tailwind v4 `@theme` tokens in `src/styles/global.css` with the default palette and unused breakpoints removed, build `Section`, `Button`, and `Card` as Astro components and `TextField`, `TextArea`, and a React `Button` for the contact form island, share each component's classes through one plain TypeScript class map, load Inter through Astro's fonts API, and document it all in `docs/design.md` with a dev only `/styleguide` page as the living check.

The palette is the one extracted from paviliusbim.com: gold `#e09900` and yellow `#ffcc00` as fills on white and a warm cream tint, with black, `#333333`, and `#666666` carrying every word. Two calls shape everything downstream. First, gold splits into a fill gold and a text gold, because the reference site's gold links and gold headings on white measure 2.41:1 and cannot meet AC-11. Second, there is no dark band, so both tones are light, the `--tone-*` variable mechanism is dropped, and no component ever adapts to its background.

**Implementation skills**: `tailwind-4-docs` (`lombiq/tailwind-agent-skills`, `.agents/skills/tailwind-4-docs/`) · `astro` (`astrolicious/agent-skills`, `.agents/skills/astro/`) · `vercel-react-best-practices` (`vercel-labs/agent-skills`, `.agents/skills/vercel-react-best-practices/`)

## Rationale

Reasoning and options: see [rationale.md](rationale.md).

## Feature design

This feature has no stored data and no endpoints. Its "data model" is the token set, and its "API surface" is the props of each component, so both sections below use that shape.

**Data model sketch** (the tokens, all in `src/styles/global.css`):

The `@theme` block opens by clearing four namespaces, then repopulating each from the table below:

- `--color-*: initial;` removes every default colour, immediately followed by `--color-transparent: transparent;` and `--color-current: currentColor;` so `bg-transparent`, `border-transparent`, and `text-current` keep working.
- `--breakpoint-sm: initial; --breakpoint-xl: initial; --breakpoint-2xl: initial;` leaves only `md` at 48rem and `lg` at 64rem, Tailwind's defaults.
- `--text-*: initial;` removes `text-xs` through `text-9xl`, so the six type tokens below are the only font sizes that exist. Without this, `text-sm` and `text-small` would both work and the type scale would drift exactly the way the palette cannot.
- `--radius-*: initial;` removes `rounded-sm` through `rounded-3xl`, leaving only `--radius-ui` (every corner in this feature) and `--radius-full: 9999px` (kept because a pill or a round icon button is a realistic need for feature 5's shell, and reintroducing a cleared namespace later is a spec change).

Spacing, shadows, and durations deliberately keep Tailwind's defaults (0.25rem spacing steps), because nothing in this design needs them constrained and `min-h-11` relies on the default scale for its 44px target.

| Token | Value | Role |
|---|---|---|
| `--color-white` | `#ffffff` | Page background and card surface. Not a text colour in this feature; from 2026-09-21 it is also the text on the home hero's scrim (spec 0005) and the outer half of the two colour focus ring |
| `--color-tint` | `#fff9e6` | The `tint` section background: a warm cream drawn from the gold |
| `--color-black` | `#000000` | `h1` and `h2` headings; the label on every gold or yellow fill |
| `--color-ink-strong` | `#333333` | `h3` and sub headings, field labels, strong text |
| `--color-ink` | `#666666` | Body text: the most used text colour on the site |
| `--color-ink-muted` | `#707070` | Hints, captions, card text |
| `--color-gold` | `#e09900` | Brand gold. Fills only: the primary button, highlight fills, decorative rules, icon fills. Never a word, never a control border |
| `--color-gold-deep` | `#c88600` | The primary button's hover fill, and nothing else |
| `--color-gold-ink` | `#946600` | The same hue, dark enough to read. The only gold permitted as text, a link, a control border, or the focus ring |
| `--color-yellow` | `#ffcc00` | Reserved accent for the real logo and feature 5's icons. Fills and decoration only; no component in this feature uses it |
| `--color-line` | `#e5e5e5` | Card border and dividers (decorative, never a control boundary) |
| `--color-field` | `#767676` | Form field border: a control boundary, so it must reach 3:1 |
| `--color-error` | `#b42318` | Error text and error border |
| `--color-scrim` | `rgb(0 0 0 / 0.6)` | Added 2026-09-21 by spec 0005. The see through panel behind white copy on a photo. White on it is 5.74:1 even over a pure white pixel, so no photo can break it. Never a page or section background |
| `--font-sans` | `var(--font-inter), sans-serif` (in `@theme inline`) | The only typeface |
| `--text-h1` | `clamp(2.25rem, 1.714rem + 2.381vw, 3.5rem)` | Page title, weight 700 |
| `--text-h2` | `clamp(1.75rem, 1.429rem + 1.429vw, 2.5rem)` | Section heading, weight 700 |
| `--text-h3` | `clamp(1.25rem, 1.143rem + 0.476vw, 1.5rem)` | Card and sub heading, weight 600 |
| `--text-lead` | `1.125rem` | Intro paragraphs |
| `--text-body` | `1rem` | Body text |
| `--text-small` | `0.875rem` | Labels, hints, errors, captions |
| `--radius-ui` | `0.25rem` | Every button, card, field, and image corner |
| `--radius-full` | `9999px` | Pills and round icon buttons, for feature 5 |
| `--radius-card` | `1.5rem` | Added 2026-09-21 by spec 0004. The one large radius: the header card's bottom corners, and any later large surface |
| `--container-content` | `75rem` (1200px) | `Section` width `default` |
| `--container-narrow` | `45rem` (720px) | `Section` width `narrow` |

The clamp formulas interpolate linearly between a 360px and a 1200px viewport; the `rem` part keeps them responsive to zoom.

Line height and letter spacing ride on each size token as Tailwind v4 companion keys, so they apply automatically wherever the size utility is used and never have to be repeated in a component. Write them literally:

```css
--text-h1--line-height: 1.1;
--text-h1--letter-spacing: -0.02em;
--text-h2--line-height: 1.2;
--text-h3--line-height: 1.3;
--text-lead--line-height: 1.6;
--text-body--line-height: 1.6;
--text-small--line-height: 1.5;
```

Only `h1` carries negative tracking; at 56px the default spacing reads loose, and the other sizes do not need it. Because these are companion keys, `text-h1` alone sets size, line height, and tracking together, and `docs/design.md` records all three per AC-1.

**There are no tone variables.** Both section tones are light, so every text, border, and focus colour is identical on each, and `Section` differs only in one background utility. That removes the `--tone-*` mechanism, the `Card` tone reset, and the second focus colour an earlier draft of this spec carried for a dark navy band. Components name their colours directly (`text-ink`, `text-ink-muted`, `border-gold-ink`), which is the plainest thing to read a year from now and the hardest to get wrong. If a dark band is wanted later, reintroducing inherited tone variables is the way back; see Follow-up.

The one rule that replaces it is about gold, and it is a rule about roles, not about backgrounds:

| Role | Token | Allowed | Forbidden |
|---|---|---|---|
| Fill gold | `--color-gold` `#e09900` | Button fills, highlight fills behind black text, decorative rules, icon fills | Any text; any control border; any focus ring |
| Fill gold, hover | `--color-gold-deep` `#c88600` | The primary button's hover fill | Everything else |
| Text gold | `--color-gold-ink` `#946600` | Emphasised words, links, the secondary button's border and label, the focus ring | Large flat fills, where it reads muddy rather than gold |
| Accent yellow | `--color-yellow` `#ffcc00` | Reserved for the real logo and feature 5's icons | Any text; anything in this feature |

This is the most misusable part of the palette, because the two golds look alike in a swatch list and only one of them is legible as a word. So `docs/design.md` states the rule, every style guide swatch is labelled with it, and AC-11 plus the gold guard scenario make it checkable rather than remembered.

Custom variant (in `global.css`, so no component needs a square bracket variant): `@custom-variant link-focus (&:has(a:focus-visible));`, used by `Card` to outline the whole card when its link has keyboard focus.

Base layer (`@layer base` in `global.css`): `body` uses `font-sans text-body text-ink bg-white antialiased`; `h1` and `h2` get `text-h1` and `text-h2` (each bringing its own line height, and `h1` its tracking, from the companion keys above), weight 700, and `text-black`; `h3` gets `text-h3`, weight 600, and `text-ink-strong`; `:focus-visible` gets `outline: 2px solid var(--color-gold-ink); outline-offset: 2px`; and a `prefers-reduced-motion: reduce` rule sets transition and animation durations to near zero on every element.

Contrast of every pair used (WCAG relative luminance, computed from the hex values above):

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

Three values are deliberately never text and never a control boundary. The table records them so a later reader does not "fix" them:

| Pair | Ratio | Why it is still fine |
|---|---|---|
| gold on white | 2.41 | A fill, never a word. WCAG 1.4.11 does not ask a control's fill to contrast with the page when its label identifies it, and that label is black at 8.73:1 |
| yellow on white | 1.51 | Reserved decoration and logo only; nothing renders it as text |
| line on white | 1.26 | A decorative card border, not a control boundary, so 1.4.11 does not apply. The card's real affordance is its title link and its focus ring |

This check is what split gold in two. The reference site sets gold links and gold headings directly on white at 2.41:1, which fails WCAG AA at every text size, so copying it exactly would have made AC-11 unmeetable. Keeping brand gold for fills and adding `gold-ink` at the identical hue (41 degrees) for words keeps the site reading as the reference and still passes.

**State transitions**: none stored. Components have visual states only: rest, hover, keyboard focus, disabled (buttons), invalid (fields).

**API surface** (component props; every component is public and static, rendered at build):

| Component | File | Props (req = required) | Renders | Key misuse errors |
|---|---|---|---|---|
| `Section` | `src/components/ui/Section.astro` | `tone`: `'white' \| 'tint'` (opt, default `white`) · `width`: `'default' \| 'narrow'` (opt, default `default`) · `id`: string (opt) · `labelledBy`: string (opt, id of the section's heading) · default slot | `<section aria-labelledby>` full width, carrying its own background utility, with padding and an inner `div` centred at the max width with gutters | Unknown `tone` or `width` fails `pnpm check` |
| `Button` (Astro) | `src/components/ui/Button.astro` | `variant`: `'primary' \| 'secondary'` (opt, default `primary`) · `href`: string (opt) · `type`: `'button' \| 'submit'` (opt, default `button`, ignored with `href`) · `disabled`: boolean (opt, `<button>` only) · default slot (the label) | `<a>` when `href` is set, else `<button>` | `href` together with `disabled` is a type error (a discriminated union on the props) |
| `Card` | `src/components/ui/Card.astro` | `title`: string (req) · `text`: string (opt) · `image`: `{ src: ImageMetadata; alt: string }` (opt) · `href`: string (opt) · `headingLevel`: `2 \| 3 \| 4` (opt, default `3`) · default slot (opt, extra content under the text; must hold no link, button, or field when `href` is set, because the stretched link covers it) | `<article>` wrapping Astro `<Image>` and a body `<div>` whose heading text is the link when `href` is set | Missing `title` or an `image` without `alt` fails `pnpm check` |
| `Button` (React) | `src/components/react/ui/Button.tsx` | `variant` (opt) · `type`: `'button' \| 'submit'` (opt, default `button`) · `disabled` (opt) · `children` (req) · other native button props | `<button>` only (the island never needs a link button) | none beyond TypeScript |
| `TextField` | `src/components/react/ui/TextField.tsx` | `name`: string (req) · `label`: string (req) · `type`: `'text' \| 'email'` (opt, default `text`) · `id`: string (opt, falls back to `useId()`; required in practice when the field is placed directly in an `.astro` file, because each such placement renders as its own React root and `useId()` values can repeat across roots) · `hint`: string (opt) · `error`: string (opt) · `required`: boolean (opt) · other native input props (`value`, `onChange`, `autoComplete`, and so on) | `<div>` with `<label for>`, optional hint `<p id>`, `<input>`, optional error `<p id>` | none beyond TypeScript |
| `TextArea` | `src/components/react/ui/TextArea.tsx` | same as `TextField` minus `type`, plus `rows`: number (opt, default 5) | same shape with `<textarea>` | none beyond TypeScript |
| class maps | `src/components/ui/styles.ts` | `buttonClass(variant)`, `fieldClass(invalid)`, `cx(...parts)` | Pure functions returning complete class strings; every literal class string is written as a `cx('…')` call so Prettier can sort it | A class built from string fragments would be missed by Tailwind's scanner (see invariants) |

Visual detail per component, so the build invents nothing:

- **Section**: padding `py-16 md:py-20 lg:py-24`, gutters `px-4 md:px-6 lg:px-8`, inner `mx-auto w-full max-w-content` or `max-w-narrow`. Tone backgrounds: `bg-white` and `bg-tint`. No vertical margin between sections: adjacent sections of the same tone are fine, alternating white and tint is the default rhythm pages should use.
- **Button**: `inline-flex min-h-11 items-center justify-center gap-2 rounded-ui px-5 py-2.5 text-body font-semibold transition-colors duration-150`. Primary: `bg-gold text-black hover:bg-gold-deep`, identical on both tones. Secondary: `border-2 border-gold-ink text-gold-ink hover:bg-gold hover:text-black`, so the outline button fills with the brand gold on hover rather than with its own darker shade, which keeps the brand colour on the interaction and the label at 8.73:1. Disabled: `disabled:cursor-not-allowed disabled:opacity-60` and no hover change. Labels may wrap on narrow screens; the button grows in height, never clips.
- **Card**: the outer `<article>` is `relative flex h-full flex-col overflow-hidden rounded-ui border border-line bg-white`, identical on both tones. Image on top at `aspect-3/2 w-full object-cover`, rendered with Astro `<Image>` and `sizes` for one column on mobile, two on tablet, three on desktop (`(min-width: 64rem) 33vw, (min-width: 48rem) 50vw, 100vw`). Body `<div class="flex flex-1 flex-col gap-2 p-6">`; the title uses the `h3` scale in `text-ink-strong` at whatever heading level is passed; text is `text-ink-muted`. With `href`: the title text is wrapped in `<a>` whose `::after` covers the whole card (`after:absolute after:inset-0`), the link itself carries `focus-visible:outline-none` so only the card draws a ring (a plain utility, so AC-14's ban on arbitrary values is respected) (`link-focus:outline-2 link-focus:outline-offset-2 link-focus:outline-gold-ink`, using the `link-focus` custom variant defined in `global.css`), hover adds `hover:shadow-md` and underlines the title. Long titles wrap with `text-balance`; nothing truncates.
- **Fields**: label `text-small font-semibold text-ink-strong`; hint `text-small text-ink-muted`; control `min-h-11 w-full rounded-ui border border-field bg-white px-3 py-2 text-body text-ink`; invalid control `border-error ring-1 ring-inset ring-error` (the border stays 1px and the inset ring makes it read as 2px, so nothing shifts) plus `aria-invalid="true"`; error `text-small text-error`. `aria-describedby` lists the hint id and then the error id, whichever exist. No placeholder text (labels are always visible). No required marker is drawn by the component; the form passes a hint (for example "Optional") from content when it wants one.

**Value sourcing**:

| Action | Value produced / displayed | Source |
|---|---|---|
| Button renders | Label and `href` | Slot and prop, passed by the page from a content entry (for example `home.hero.primaryCta.label` and `.href`, spec 0002). Never literal text in a component |
| Card renders | Title, text, image, alt | Props from content entries: `service.title`, `service.summary`, `service.image` (spec 0002); `project.title`, `project.summary`, `project.image`; `home.whyChooseUs.items[].title` and `.text` |
| Card renders | `href` | Prop from the page. Service card links come from the service slug (spec 0002 fixes `/revit-modeling`, `/scan-to-bim`, `/bim-coordination`); project cards have no link until project detail pages exist |
| Card renders | Heading level | `headingLevel` prop, chosen by the page from its own heading outline; default `3` |
| Field renders | Label, hint, error text | Props from the contact entry: `contact.form.nameLabel`, `emailLabel`, `companyLabel`, `messageLabel`; `contact.errors.required`, `contact.errors.email` (spec 0002). Wired by feature 10 |
| Field renders | Element id | `id` prop, else React `useId()` |
| Section renders | `aria-labelledby` target | `labelledBy` prop: the id of the heading the page renders inside the section |
| Any component | Colours, sizes, radius, widths | `@theme` tokens in `src/styles/global.css` (this spec) |
| Any component | Which gold to use, fill or text | The gold role table above, never a judgement made per component: `--color-gold` for fills, `--color-gold-ink` for anything a person reads (this spec) |
| Every page | Inter font files, preload link, fallback metrics | Astro fonts API with the Fontsource provider, downloaded at build (this spec) |
| `/styleguide` | Sample copy and images | Existing content entries read through `src/lib/content.ts` getters (`getHomePage`, `getServices`, `getProjects`, `getContactPage`) |
| `/styleguide` | Token names, hex values, contrast figures, variant labels | Written in the dev only page itself. These are developer labels, not site content, and the page is never built, so the content collections rule does not apply |
| `docs/design.md` | Contrast ratios | Computed from the token hex values with the WCAG relative luminance formula (the table above) |

**Key invariants**:
- Every colour, font size, radius, and container width in a component or page resolves to a token, and for all four the build now enforces it: those namespaces are cleared, so an off token value produces no CSS at all rather than a quiet visual drift. No raw hex, no arbitrary value, no `<style>` block, no new CSS file outside `src/styles/global.css`.
- Line height and letter spacing are never written on a component. They arrive with the size token through its companion keys, so `text-h1` is always the whole type treatment.
- Only two breakpoints exist, `md` (768px) and `lg` (1024px). Mobile is the unprefixed default.
- Tokens are defined once, in `global.css`. `docs/design.md` describes them and must match; a token change updates both in the same commit.
- Class maps return complete, literal class strings, each written inside a `cx('…')` call (`cx('bg-gold text-black hover:bg-gold-deep ...')`) so the Prettier plugin sorts them. Never assemble a class from fragments such as `` `bg-${colour}` ``; Tailwind only generates classes it can find written out in full.
- A `Card` with `href` holds no interactive content in its slot; the stretched link would cover it.
- A React field placed directly in an `.astro` file gets an explicit `id`.
- Components never contain visible copy. Every word they show arrives through a prop or slot.
- Gold follows its role, never the eye of whoever is writing the component. `--color-gold` and `--color-yellow` are fills and decoration; `--color-gold-ink` is every gold a person has to read. A gold word, link, control border, or focus ring that is not `--color-gold-ink` is a bug, not a style preference.
- No component reads or sets a tone variable, and `Section` is the only component that names a background. Both tones are light, so a component looks the same in either.
- No component ships client JavaScript. The React components render to static HTML unless a page hydrates them, and only feature 10's contact island may do that.
- `/styleguide` is injected only when Astro runs in dev; it never appears in `dist/`.

**Security model**: public, static, read only markup. No user data is stored or sent by this feature. The form fields collect input only once feature 10 wires them, and sending stays a deferred feature.

**Configuration required**: none. No environment variables or credentials. The Fontsource download at build needs network access the first time; Astro caches the files after that.

**Critical test scenarios** (each maps to an acceptance criterion in ## Requirements):
- Happy path: run `pnpm dev`, open `/styleguide`, and see every token and every component variant on white and tint, all styled, all from real content, verifies **AC-6**, **AC-7**, **AC-8**, **AC-9**, **AC-13**
- Keyboard: Tab through `/styleguide` from the top; every button, card link, and field shows the deep gold outline, the same on both tones, a card shows one outline around the whole card, and clicking with a mouse shows none, verifies **AC-8**, **AC-10**
- Palette guard: add `class="bg-red-500 sm:flex text-xs rounded-full"` to a test element, run `pnpm build`, and confirm that only `rounded-full` appears in the built CSS (it is the one of the four this spec defines) and that `bg-red-500`, `sm:flex`, and `text-xs` produce nothing; revert, verifies **AC-2**
- Gold guard: search `src/` for the fill golds used where only `gold-ink` is allowed, namely the exact strings `text-gold`, `text-gold-deep`, `text-yellow`, `border-gold`, `border-gold-deep`, `border-yellow`, `outline-gold`, `outline-gold-deep`, `outline-yellow`, `ring-gold`, and `ring-yellow` (each as a whole class, so `text-gold-ink` and `border-gold-ink` do not count), and confirm there are no hits, verifies **AC-11**
- Responsive: at 360px, 768px, 1024px, and 1440px widths, headings grow smoothly with no jump, gutters and section padding match AC-6, and a three line card title wraps cleanly; at 200% browser zoom nothing overlaps or clips, verifies **AC-5**, **AC-6**, **AC-8**
- Error state: the style guide's invalid `TextField` has `aria-invalid="true"`, its error text is announced after the label by a screen reader, its error outline reads thicker without shifting the layout, and no two elements on the style guide share an `id`, verifies **AC-9**
- Reduced motion: with the system's reduce motion setting on, hovering a button changes colour instantly, verifies **AC-12**
- Build output: after `pnpm build`, `dist/` contains no `styleguide` file, `dist/client/` holds one HTML file per route, the font file is served from the site's own origin with a preload link, and no page has a `<script>` added by this feature, verifies **AC-3**, **AC-13**, **AC-15**
- Documentation: every token in `global.css` appears in `docs/design.md` with its role, and each listed pair's ratio meets its threshold, verifies **AC-1**, **AC-11**

## Build plan

Skateboard: the first step already changes the whole site (every page picks up the font, colours, and base type), each later step adds the next usable layer on top, and the last step proves it all.

1. Install Tailwind with `pnpm astro add tailwind` (adds `tailwindcss` and `@tailwindcss/vite`). If pnpm reports an ignored build script for a Tailwind package and the build then fails, add that package to `allowBuilds` in `pnpm-workspace.yaml`; otherwise leave `allowBuilds` alone. Write `src/styles/global.css` with the `@theme` block (the four namespaces cleared to `initial` and repopulated, every token in the data model table, the type companion keys written out) and the base layer including heading colours, the focus outline, and reduced motion. There are no tone variables to write. Import it in `BaseLayout.astro`. Add a top level `fonts` entry (not under `experimental`; stable since Astro 6) for Inter (Fontsource provider, `cssVariable: '--font-inter'`, `weights: ['400 700']`, `subsets: ['latin']`, `fallbacks: ['sans-serif']`) to `astro.config.mjs` and render `<Font cssVariable="--font-inter" preload />` in the layout head. Install `prettier-plugin-tailwindcss`, add it last in `.prettierrc.json` `plugins` with `tailwindStylesheet: "./src/styles/global.css"` and `tailwindFunctions: ["cx"]`, and run `pnpm format`, satisfies **AC-2**, **AC-3**, **AC-4**, **AC-5**, **AC-10**, **AC-12**, **AC-15**
2. Write `src/components/ui/styles.ts` (`cx`, `buttonClass`, `fieldClass`), then `Section.astro`, `Button.astro`, and `Card.astro` to the API table and visual detail above, satisfies **AC-6**, **AC-7**, **AC-8**, **AC-10**, **AC-14**
3. Add React with `pnpm astro add react` (the integration spec 0001 already chose for the contact island), then write `src/components/react/ui/Button.tsx`, `TextField.tsx`, and `TextArea.tsx` using the shared class maps. Hydrate nothing, satisfies **AC-7**, **AC-9**, **AC-10**, **AC-15**
4. Add a small local integration (`src/dev/styleguide-integration.ts`) whose `astro:config:setup` hook calls `injectRoute({ pattern: '/styleguide', entrypoint: './src/dev/styleguide.astro' })` only when `command === 'dev'`, and register it in `astro.config.mjs`. Build the style guide page from `BaseLayout`, the components, and content getters only, passing an explicit `id` to every React field. Write `docs/design.md`: tokens with roles, both contrast tables (the pairs in use and the three that are never text), the gold role table, type scale, spacing and rhythm, breakpoints, the two tones, each component's props and do and do not rules, and the invariants above, satisfies **AC-1**, **AC-11**, **AC-13**, **AC-14**
5. Gate: run `pnpm check`, `pnpm lint`, `pnpm format:check`, and `pnpm build`; confirm `dist/` has no style guide and `dist/client/` has one HTML file per route; confirm the font is self hosted and preloaded; walk the critical test scenarios above, satisfies **AC-2**, **AC-3**, **AC-5**, **AC-8**, **AC-10**, **AC-11**, **AC-12**, **AC-13**, **AC-15**

## Consequences

**Positive**:
- Features 5 to 10 compose pages from `Section`, `Button`, `Card`, and Tailwind layout utilities (grid, flex, gap). Their `/develop` runs are layout work, not styling decisions.
- Clearing the colour, breakpoint, type, and radius namespaces turns "use the agreed tokens" from a review comment into something the build enforces: an off token class simply produces no CSS. That covers everything in the design except the gold rule, which is about which of two valid tokens to pick and so cannot be caught this way.
- With both tones light, there is no dark band and so no class of low contrast bug where a component lands on an unexpected background. Every component looks the same everywhere, which is one fewer thing for features 5 to 10 to think about and one fewer thing for a review to catch.
- Dropping the `--tone-*` mechanism removes the least obvious part of the earlier design. A reader now sees `text-ink` and knows the colour, rather than having to know which ancestor set a variable.
- The palette is the real reference site's rather than an invented direction, so the look starts closer to what the client signalled by pointing at that site.
- A real brand arriving later is mostly a change of values in one `@theme` block plus `design.md`, because tokens are named by role (`ink`, `gold-ink`, `field`, `line`), not by page.
- The font is self hosted with metric matched fallbacks, which gives feature 12 a head start on its layout shift and first paint targets.

**Negative / tradeoffs**:
- The site will not match paviliusbim.com exactly, and the difference shows in the two places people look first. Its gold links and gold headings on white become the deeper `gold-ink`, and its gold buttons carry black labels rather than white ones, because white on gold is 2.41:1. This trades exact visual fidelity for WCAG AA, which is the right way round for a marketing site that has to be usable. Wanting the exact reference look later means dropping AC-11, not adjusting a token.
- The palette is borrowed from another company's site. It is a sound starting point and it is what you asked for, but it is not yet this company's own brand, so the launch follow up to confirm real brand colours still stands.
- Two golds that look alike in a swatch list but behave differently is a real trap, especially for an AI suggestion reaching for `text-gold`. The gold role table, the labelled style guide swatches, and the gold guard scenario exist to catch it, but nothing in the build enforces it the way the cleared palette enforces the token set.
- With no dark tone there is less visual rhythm on a long page. Feature 6's closing call to action has to earn its weight from a gold fill, the tint band, and spacing rather than from a dark band.
- With four namespaces cleared, a quick `text-gray-500`, `text-sm`, or `rounded-lg` from a tutorial or an AI suggestion silently produces nothing. The fix is always a token, but the silence can confuse the first time, and it now bites on sizes and corners as well as colours.
- Two `Button` implementations (Astro and React) exist for one design. The shared class map keeps their looks identical, but a change in markup structure has to happen in both.
- React and its Astro integration land now, before the contact page needs them, adding install weight and a second component idiom to the codebase earlier than feature 10.
- The first build on a new machine or CI needs network access to download Inter; an offline first build fails at the fonts step.

**Neutral**:
- `astro.config.mjs` gains three entries: the Tailwind Vite plugin, the fonts list, and the React and style guide integrations.
- New folders: `src/components/ui/`, `src/components/react/ui/`, `src/dev/`, and `src/styles/global.css` replaces the `.gitkeep`.
- There is no `Container` component; `Section` owns width and gutters. A band that needs full bleed content (a full width image, say) is a new `Section` option later, not a one off.
- The placeholder home page keeps its current markup. It picks up the base font and colours automatically but is not rebuilt from the components; feature 6 does that.

## Follow-up

- [ ] Replace the placeholder logo and confirm this company's own brand colours and typeface before launch (feature 14). The palette here is taken from paviliusbim.com, a reference you pointed at, not from a brand this company owns. Update the `@theme` values, both contrast tables in `docs/design.md`, and walk the style guide again.
- [ ] If a dark band is ever wanted (feature 6's closing call to action is the likely first ask), that is a change to this spec, not a page level override. It means bringing back inherited `--tone-*` variables on `Section`, a tone reset on `Card`, a light error colour, and a second focus colour, then computing the contrast table for the dark pairs. Gold `#e09900` on black measures 8.73:1, so gold works well as the accent on a dark band if that day comes.
- [ ] Yellow `#ffcc00` is defined as a token but nothing uses it. Feature 5 (site shell) is where it earns its place, on the real logo and the icons. If feature 5 ships without using it, drop the token rather than leaving a colour in `design.md` that the site never shows.
- [x] Feature 10 (contact page) wires `TextField`, `TextArea`, and the React `Button` into the island and decides whether "Optional" or a required marker appears; either one is a content field on the `contact` entry passed as `hint`, never text in the component. Settled by spec [0011](../0011-contact-page/index.md): an "Optional" hint from content on the six optional fields. It also adds a `surface` prop, `tel` on `TextField`, and a new `Select`.
- [ ] Feature 5 (site shell) builds the header, dropdown, mobile menu, footer, and a skip link on these tokens. Icons (social links, the dropdown chevron, the mobile menu toggle) were left out of this feature, so feature 5 decides how icons are rendered.
- [ ] Feature 12 (performance) confirms the `sizes` values in `Card` against the real layouts and checks the Inter preload against the Core Web Vitals targets.
- [ ] Tailwind conventions from this spec (tokens only, no arbitrary values, cleared palette, the gold role rule, complete class strings in class maps) belong in root `AGENTS.md` `## Rules`, since they apply to every file that renders markup. The gold rule matters most there: it is the one convention an AI suggestion is likely to break and the build will not catch. `/sync` owns that edit.
- [ ] Agent Skills and MCP servers for this feature's tools were deferred ("not now"). The only new tool is `prettier-plugin-tailwindcss`, which needs no skill; the existing `tailwind-4-docs` skill covers Tailwind itself. Its local docs snapshot is not initialised (`.agents/skills/tailwind-4-docs/references/docs-source.txt`); running its sync script would give later builds the full Tailwind v4 docs offline.
