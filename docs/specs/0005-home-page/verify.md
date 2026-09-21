# Verify: home page · spec 0005 · written 2026-09-20

_Steps derived from the spec 0005 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

Nothing here has been run yet. The steps that need a browser are the ones most
likely to hold a bug: the counter's single fire, the reduced motion path, and
the hero's loading behaviour on a throttled connection.

## Commands

- [ ] `pnpm check` → 0 errors, 0 warnings → AC-17
- [ ] `pnpm lint` → clean → AC-17
- [ ] `pnpm build` → succeeds, and `dist/client/` still holds exactly the eight HTML files spec 0004 listed and no others → AC-17
- [ ] The built `dist/client/index.html` holds no `astro-island`, and exactly two script tags beyond the inline `js` flag: the nav bundle and the counter module → AC-14
- [ ] Grep the built `index.html` for each of the nine section headings from `src/content/home/en/home.yaml` → all nine present, in the spec order → AC-1
- [ ] Grep the built `index.html` for `Delivering Precision` → no match → AC-1
- [ ] The built `index.html` holds exactly one `<h1>`, and it is the hero heading from the entry → AC-3, AC-11
- [ ] The built `index.html` holds nine `<h2>` elements, each the target of an `aria-labelledby` on its section → AC-11
- [ ] The built `index.html` holds `1,200` (grouped), not `1200` → AC-5
- [ ] The built `index.html` holds three service card links, one each to `/revit-modeling`, `/scan-to-bim`, `/bim-coordination` → AC-4
- [ ] The built `index.html` holds the title and description from `home.seo` → AC-15
- [ ] Every `<img>` in the built `index.html` carries either a non empty `alt` or an empty `alt` on a decorative image, and the hero image alone carries `fetchpriority="high"` and no `loading="lazy"` → AC-12

## Failure and edge drills (each restores the file afterwards)

- [ ] Add a fourth entry to `src/content/services/en/` → `pnpm build` fails with a message naming the collection, the language, and the count → AC-4
- [ ] ~~Superseded 2026-09-21 by the strict hero drill below (AC-22).~~ Remove `secondaryCta` from `home.hero` → build succeeds and the hero renders one button with no gap or stray separator → AC-3
- [ ] Remove all but one item from `whyChooseUs.items` → build succeeds and the grid renders one item without stretching it across three columns → AC-8
- [ ] Remove `presence.image` (it is optional in the schema) → build succeeds and the presence section renders as a single centred column of copy and regions, with no half empty grid → AC-7
- [ ] Mark a service image `decorative: true` instead of giving it `alt` → build succeeds and that card renders with an empty `alt`, not a type error → AC-4, AC-12

## In a browser (production preview)

- [ ] Scroll the stats band into view → the numbers count up once, ending on the grouped values, and scrolling away and back does not restart them → AC-6
- [ ] Set `prefers-reduced-motion: reduce` in the browser, reload, scroll to the band → no number changes at any point → AC-6
- [ ] Disable JavaScript, reload → the stat numbers read as their finished grouped values, and every section is present and usable → AC-5, AC-6
- [ ] Throttle to slow 3G, reload → the hero photo is the first image requested, and nothing on the page shifts position as the later images arrive → AC-12
- [ ] At 360px, 768px, and 1280px → no sideways scrolling, the services row reflows one to two to three columns, the hero stacks copy then photo below `lg`, and the certification badges wrap to a column → AC-3, AC-9, AC-13
- [ ] Tab through the page → the services cards each take one tab stop with the title as the accessible name, the closing band's link is reachable, and every focus ring is visible on its background → AC-10, AC-13
- [ ] Tab to the gold band's link → the ring is black and clearly visible against the gold, and no other focus ring on the page changed from the sitewide `gold-ink` → AC-18
- [ ] On the gold band, check the heading, text, and link label against the contrast table in `docs/design.md`: black on gold at 8.73:1 and white on black at 21:1 → AC-10
- [ ] Open `/styleguide` in dev → `StatsBand`, `MediaText`, and `CtaBand` each have a tile → AC-16
- [ ] `docs/design.md` `## Components` holds an entry for each of the three, and the contrast table holds the black on gold and white on black pairs → AC-16

## Value sourcing (added by /develop, one per row the build touched)

Each of these varies an input and checks the output, so a value that comes
from the wrong place is caught even when the build time gate is happy.

- [ ] Set the browser's language to one that groups differently (German shows `1.200`, not `1,200`), reload, and scroll the stats band in → every counting frame and the final number read `1,200`, the page's own language, because `StatsBand` writes `data-locale` and the script reads it rather than the visitor's locale → AC-5, AC-6
- [ ] Swap the `order` values on two service entries → the home page's three cards reorder to match, and they stay in the same order as the header's SERVICES dropdown, because both read `getServices(lang)` → AC-4
- [ ] ~~Superseded 2026-09-21 by the `sizes="100vw"` step below.~~ At a viewport just above `lg` (say 1100px), check the hero photo's chosen source in the network panel → it is roughly half the viewport wide, not a full width one, because the hero passes `sizes="(min-width: 64rem) 50vw, 100vw"` → AC-12

## The reference hero (added 2026-09-21 by /develop, milestone 5)

_Already confirmed during the build: `pnpm check`, `pnpm lint`, and `pnpm build` clean; 8 HTML files in `dist/client/`; no `astro-island`; the hero `<img>` has `fetchpriority="high"`, `sizes="100vw"`, and a `srcset` of 640w, 960w, 1280w, 1600w; `-mt-(--header-h)` builds to `margin-top: calc(var(--header-h) * -1)`; the strict hero drill fails as expected; screenshots at 360, 768, 1280, 1920, and 740 by 360 looked right. Keyboard focus and the accessibility tree were not checked._

### Commands

- [ ] Add `secondaryCta:` (with a `label` and `href`) back under `hero` in `src/content/home/en/home.yaml`, run `pnpm build` → fails with `hero: Unrecognized key: "secondaryCta"`; restore the file → AC-22
- [ ] `grep -o 'srcset="[^"]*"' dist/client/index.html | head -1` → ends at `1600w`, with 640w, 960w, and 1280w before it → AC-12
- [ ] `grep -c 'focus-visible:outline-black' -r src` → 0 hits; `grep -o '\.focus-contrast :focus-visible{[^}]*}' dist/client/_astro/*.css` → the white outline colour and the 2px black shadow → AC-18
- [ ] Read `src/components/ui/Section.astro`, `CtaBand.astro`, and `src/components/home/Hero.astro` → all three take their gutters, padding, and widths from `bandGutterClass`, `bandPaddingClass`, and `bandWidthClass`; none writes `px-4 md:px-6 lg:px-8` itself → AC-23

### In a browser

- [ ] Open `/` at 360px, 768px, 1280px, and 1920px → the photo fills the first screen behind the header card, the scrim panel with the white `h1` and subheading is centred in the area below the card, the gold button sits under it, the three dots sit near the bottom, and nothing sits under the header at load → AC-3, AC-21
- [ ] Open `/` at 740 by 360 and scroll → the hero is taller than the screen, and the panel, button, and dots never overlap → AC-3
- [ ] Tab from the header → the next stop is the hero button and it shows a black ring inside a white ring, visible over sky and city; the next Tab leaves the hero → AC-18, AC-20
- [ ] Tab to the gold band's link at the bottom of `/` → the same black and white double ring; Tab to any control on a white or tint section → the gold ink ring, unchanged → AC-18
- [ ] Click the hero button with the mouse → no ring → AC-18
- [ ] Open the accessibility tree on the hero → the region is named by the `h1`, and no dot appears in it → AC-20
- [ ] Point `hero.image` in `home.yaml` at a plain white image, reload → the heading and subheading still read; the colour picker gives `#666666` behind the text (5.74:1); restore → AC-19
- [ ] Block the hero image request in dev tools, reload → the band is black and the copy still reads → AC-19
- [ ] Open `/about-us` → its `h1` starts fully below the header card → AC-21
- [ ] At 390px with JavaScript off, open `/` → the open menu shows inside the header, then the whole hero below it, with the panel, button, and dots fully visible → AC-21
- [ ] Open `/styleguide` (dev only) → the `--color-scrim` swatch, the two new contrast rows, the "Focus on a photo" tile, and the gold band caption naming the two colour ring; Tab into both tiles to see the double ring → AC-24
- [ ] Read `docs/design.md` → `--color-scrim` in the colour table, the white on scrim row (5.74:1) and the two colour ring row in the contrast table, the two focus rules in `## Focus and motion` with no exception left, and the band frame under `Section` → AC-24

### Value sourcing (one per hero row the build touched)

- [ ] Replace `src/assets/images/home/hero.jpg` with a 3000px wide image, build → the `srcset` gains 1920w and ends at 2560w; with a 500px wide image → a single 500w entry; restore → `heroWidths` reads the source width, not a fixed list → AC-12
- [ ] Change `--header-h` in `PageLayout.astro` to `6rem`, reload `/` at 1280px → the hero still starts at the top and the panel still centres below the (now taller) bar, because the pull up and the padding both read the variable; restore → AC-21
- [ ] Change `home.hero.primaryCta` label and href in `home.yaml` → the hero button shows the new word and goes to the new path → AC-2, AC-3
- [ ] Change `--color-scrim` to `rgb(0 0 0 / 0.4)` in `global.css` → the panel lightens everywhere it is used (hero and style guide swatch), confirming one token drives it; restore at once, since 0.4 breaks the 4.5:1 guarantee → AC-19
