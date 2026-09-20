# Verify: Design system & UI foundation · spec 0003 · updated 2026-09-20 (tone coverage steps added)

_Steps derived from spec 0003 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

Start with `pnpm dev` and open `http://localhost:4321/styleguide`, which is
where most of the manual steps happen.

## UI / manual

### Look at it

- [ ] Open `/styleguide` → every colour token shows as a swatch labelled with what it may and may not be used for; the type scale, the spacing steps, and every component variant all render on both white and tint, filled with real content entries → AC-13
- [ ] Read the page → text is Inter, body copy is grey on white, `h1` and `h2` are black, `h3` is darker grey, and no element looks unstyled → AC-4
- [ ] Look at the two `Section` tones → the only difference is the background; text, border, and focus colours are identical on each → AC-6
- [ ] Walk the whole page → `Button`, `Card`, and the form fields each appear in a tint section and in a white section, and the bands alternate tone the whole way down → AC-13
- [ ] Look at a `Section` at desktop → content is centred at 1200px with 32px side gutters and 96px top and bottom padding; the narrow band holds its content to 720px → AC-6

### Keyboard and pointer

- [ ] Tab from the top of `/styleguide` → every button, card link, and field takes focus in reading order, and each shows a 2px deep gold outline with a 2px gap → AC-10
- [ ] Tab onto a linked card → exactly one outline is drawn, around the whole card, not around the title text alone → AC-8
- [ ] Tab onto a card on tint (the `Cards` section) and then one on white (`The same cards on white`) → both draw the same 2px deep gold ring with a 2px gap → AC-8, AC-10
- [ ] Click a button with the mouse → no focus outline appears → AC-10
- [ ] Hover a linked card → the shadow lifts and the title underlines; nothing that reads as a focus ring appears → AC-8
- [ ] Tab through a linked card → it is one tab stop, and a screen reader announces the card's title as the link name → AC-8

### Buttons and cards

- [ ] Compare the Astro and React button rows → the two variants look identical in both → AC-7
- [ ] Measure any button → at least 44px tall; a primary is gold with a black label, a secondary is a deep gold outline that fills with gold on hover → AC-7
- [ ] Look at the disabled buttons → dimmed, and hovering changes nothing → AC-7
- [ ] Look at the three linked cards → the one with a three line title wraps cleanly with no overflow and no clipped text, and all three cards are the same height → AC-8
- [ ] Look at the text only cards → they render correctly with no image and no link → AC-8

### Fields

- [ ] Look at the invalid email field → it has `aria-invalid="true"`, a red outline that reads thicker, and a visible message; the field has not moved compared with the valid one beside it → AC-9
- [ ] Inspect the field that has both a hint and an error → `aria-describedby` lists the hint id first, then the error id, so a screen reader reads them in that order → AC-9
- [ ] Run a screen reader over the invalid field → the label, then the hint, then the error message are all announced → AC-9
- [ ] Check every field has a visible label and no placeholder standing in for one → AC-9
- [ ] Compare a field in the tint `Form fields` section with the same field in `The same fields on white` → both keep a white fill and a `--color-field` border, and the error state looks the same on each → AC-9, AC-13

### Responsive and zoom

- [ ] View `/styleguide` at 360px, 768px, 1024px, and 1440px → headings grow smoothly with no jump at a breakpoint; gutters are 16px, 24px, 32px and section padding 64px, 80px, 96px → AC-5, AC-6
- [ ] At 360px → the card grid is one column, at 768px two, at 1024px three; nothing overflows sideways; the wide tables scroll inside their own container rather than the page → AC-6, AC-8
- [ ] Set browser zoom to 200% → nothing overlaps or clips, and the text grows → AC-5

### Motion

- [ ] Turn on the system's reduce motion setting, then hover a button → the colour change is instant rather than animated → AC-12

## Commands

### The gates

- [ ] `pnpm check` → 0 errors, 0 warnings, 0 hints → AC-15
- [ ] `pnpm lint` → clean → AC-15
- [ ] `pnpm format:check` → all files match Prettier style, with class lists sorted → AC-15
- [ ] `pnpm build` → completes with no error → AC-15

### Build output

- [ ] `find dist -name "*.html"` → one HTML file per page route, and no style guide file anywhere under `dist/` → AC-3, AC-13
- [ ] `grep -ril styleguide dist/` → no hits → AC-13
- [ ] `grep -o '<script[^>]*>' dist/client/index.html` → no hits, so this feature added no client JavaScript and hydrated no island → AC-15
- [ ] `grep -o 'rel="preload"[^>]*' dist/client/index.html` → the Inter woff2 files are preloaded and served from this site's own origin (`/_astro/fonts/…`), not a third party → AC-3

### The palette guard

- [ ] Add `class="bg-red-500 sm:flex text-xs rounded-lg rounded-full"` to an element in `src/pages/index.astro`, run `pnpm build`, then search the built CSS in `dist/client/_astro/*.css` → only `rounded-full` produces a rule; `bg-red-500`, `sm:flex`, `text-xs`, and `rounded-lg` produce nothing. Revert the change → AC-2

### The gold guard

- [ ] Search `src/` for these exact whole classes and expect no hits: `text-gold`, `text-gold-deep`, `text-yellow`, `border-gold`, `border-gold-deep`, `border-yellow`, `outline-gold`, `outline-gold-deep`, `outline-yellow`, `ring-gold`, `ring-yellow`. Use a pattern that does not also match the `-ink` variants, for example `grep -rnP "(?<![\w-])(text-gold|border-gold|outline-gold|ring-gold|text-yellow|border-yellow|outline-yellow|ring-yellow)(?![\w-])" src/` → AC-11
- [ ] Search `src/` for a raw hex colour, a `<style>` block, a second CSS file, or a Tailwind arbitrary value (square brackets) outside `src/styles/global.css` → no hits → AC-14

### Source scoping

- [ ] Search the built CSS for `13px` and `brand-color` → no hits, confirming Tailwind is scanning only `src/` code files and not turning prose in `docs/` or `.agents/` into real CSS → AC-14

## Value sourcing

One step per row of the spec's value sourcing table, so each value's source is
actually exercised.

- [ ] Change `home.hero.primaryCta.label` in `src/content/home/en/home.yaml`, reload `/styleguide` → the button label changes, confirming labels come from content and are not written in the component → AC-13
- [ ] Change a service's `title` and `summary` → the linked card's title and text change → AC-13
- [ ] Change a service's `slug` → that card's link target changes to the new `/<slug>` → AC-13
- [ ] Change a contact form label, for example `contact.form.emailLabel` → the field labels on `/styleguide` change → AC-13
- [ ] Change `contact.errors.email` → the invalid field's message changes → AC-9
- [ ] Change a token value in `src/styles/global.css`, for example `--color-gold` → every primary button and gold swatch changes together, confirming nothing hardcodes the colour. Revert, and remember `docs/design.md` and both contrast tables change with it → AC-1
- [ ] Change `--text-h1` → every `h1` resizes and keeps its line height and tracking, confirming the companion keys ride on the size token → AC-5
- [ ] Compare every token in `src/styles/global.css` against `docs/design.md` → each appears there with its role, and each listed contrast pair meets its threshold → AC-1, AC-11
- [ ] Add a `Card` with no image, then one with no link, then one with a title long enough to wrap to three lines → each renders correctly → AC-8
- [ ] Pass an unknown `tone` to `Section`, `href` together with `disabled` to `Button`, or a `Card` with no `title`, then run `pnpm check` → each is a type error. Revert → AC-6, AC-7, AC-8

## Acceptance-criteria coverage

- AC-1 · design.md matches the tokens · covered by the token comparison and the token change steps
- AC-2 · cleared namespaces enforce the palette · covered by the palette guard
- AC-3 · self hosted preloaded font, one HTML file per route · covered by the build output steps
- AC-4 · BaseLayout applies base styles everywhere · covered by the "read the page" step
- AC-5 · fluid headings, fixed body sizes, zoom · covered by the responsive, zoom, and `--text-h1` steps
- AC-6 · Section tones, widths, gutters, padding · covered by the Section and responsive steps
- AC-7 · Button variants shared across Astro and React · covered by the button steps
- AC-8 · Card link, focus, hover, and edge cases · covered by the card and keyboard steps
- AC-9 · field labels, hints, errors, and aria wiring · covered by the field steps
- AC-10 · focus outline, keyboard only · covered by the keyboard and pointer steps
- AC-11 · every pair meets WCAG AA, gold roles respected · covered by the gold guard and the design.md comparison
- AC-12 · reduced motion · covered by the motion step
- AC-13 · dev only style guide from real content · covered by the "look at it" and value sourcing steps
- AC-14 · tokens and utilities only, no arbitrary values · covered by the gold guard, the raw hex search, and the source scoping step
- AC-15 · all four gates pass, no client JavaScript added · covered by the gates and build output steps
