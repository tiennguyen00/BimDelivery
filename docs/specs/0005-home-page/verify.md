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
- [ ] The built `index.html` holds exactly one `<h1>`, and it is the hero heading from the entry → AC-11
- [ ] The built `index.html` holds nine `<h2>` elements, each the target of an `aria-labelledby` on its section → AC-11
- [ ] The built `index.html` holds `1,200` (grouped), not `1200` → AC-5
- [ ] The built `index.html` holds three service card links, one each to `/revit-modeling`, `/scan-to-bim`, `/bim-coordination` → AC-4
- [ ] The built `index.html` holds the title and description from `home.seo` → AC-15
- [ ] Every `<img>` in the built `index.html` carries either a non empty `alt` or an empty `alt` on a decorative image, and the hero image alone carries `fetchpriority="high"` and no `loading="lazy"` → AC-12

## Failure and edge drills (each restores the file afterwards)

- [ ] Add a fourth entry to `src/content/services/en/` → `pnpm build` fails with a message naming the collection, the language, and the count → AC-4
- [ ] ~~Superseded 2026-09-21 by the strict hero drill below (AC-22).~~ Remove `secondaryCta` from `home.hero` → build succeeds and the hero renders one button with no gap or stray separator → AC-22
- [ ] Remove all but one item from `whyChooseUs.items` → build succeeds and the grid renders one item without stretching it across three columns → AC-8
- [ ] Remove `presence.image` (it is optional in the schema) → build succeeds and the presence section renders as a single centred column of copy and regions, with no half empty grid → AC-7
- [ ] Mark a service image `decorative: true` instead of giving it `alt` → build succeeds and that card renders with an empty `alt`, not a type error → AC-4, AC-12

## In a browser (production preview)

- [ ] Scroll the stats band into view → the numbers count up once, ending on the grouped values, and scrolling away and back does not restart them → AC-6
- [ ] Set `prefers-reduced-motion: reduce` in the browser, reload, scroll to the band → no number changes at any point → AC-6
- [ ] Disable JavaScript, reload → the stat numbers read as their finished grouped values, and every section is present and usable → AC-5, AC-6
- [ ] Throttle to slow 3G, reload → the hero photo is the first image requested, and nothing on the page shifts position as the later images arrive → AC-12
- [ ] At 360px, 768px, and 1280px → no sideways scrolling, the services row reflows one to two to three columns, the hero stacks copy then photo below `lg`, and the certification badges wrap to a column → AC-9, AC-13
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

- [ ] Open `/` at 360px, 768px, 1280px, and 1920px → the photo fills the first screen behind the header card, the scrim panel with the white `h1` and subheading is centred in the area below the card, the gold button sits under it, the three dots sit near the bottom, and nothing sits under the header at load → AC-21
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
- [ ] Change `home.hero.primaryCta` label and href in `home.yaml` → the hero button shows the new word and goes to the new path → AC-2
- [ ] Change `--color-scrim` to `rgb(0 0 0 / 0.4)` in `global.css` → the panel lightens everywhere it is used (hero and style guide swatch), confirming one token drives it; restore at once, since 0.4 breaks the 4.5:1 guarantee → AC-19

## The scroll reveal (added 2026-09-22 by /develop, milestone 7)

_Already confirmed during the build, in headless Chrome against `dist/client/`: at 360, 768, and 1280 all 14 reveal elements start hidden, each reveals as it arrives, none keeps an inline style afterwards, none hides again on scrolling up and down, and nothing scrolls sideways; reduced motion, JavaScript off, and a blocked reveal chunk each leave 0 of 14 hidden; a reload halfway down leaves the on screen bands untouched; tabbing with no scroll reaches the three service cards and the showcase button fully visible; the carousel still advances after 6s and holds with reduced motion. Not checked by eye: how the motion feels, and the hover shadow on a card after it revealed._

### Commands

- [ ] `pnpm check`, `pnpm lint`, `pnpm build` → clean, 8 HTML files in `dist/client/` → AC-17
- [ ] The built `index.html` holds no `astro-island`, and its scripts are the nav, counter, and carousel modules plus one `_astro/index.astro_…js` reveal chunk (Astro may inline or merge them) → AC-14
- [ ] `gzip -c dist/client/_astro/index.astro_*.js | wc -c` → at most 5120 (4251 at build time) → AC-36
- [ ] `grep -rn "from 'motion" src/` → exactly `inView` from `motion` and `animate` from `motion/mini`, both in `src/scripts/reveal.ts` → AC-36
- [ ] `git diff pnpm-workspace.yaml` after `pnpm add motion` → no change to `allowBuilds` → AC-36
- [ ] Grep the built `index.html` for `data-reveal` → nine marks: services heading block and card grid, the `MediaText` grid, presence heading and its grid, showcase heading block, tile list, and button wrapper; none inside the hero or the intro band → AC-8, AC-33

### In a browser (production preview)

- [ ] At 1280px, scroll slowly from the top → overview copy then photo, services heading then the three cards one after another, presence heading then copy then map, showcase heading, tiles, button → AC-33, AC-34
- [ ] After everything revealed, run `document.querySelectorAll('[data-reveal],[data-reveal-stagger]>*')` and check no element has a `style` attribute; hover a service card → its usual shadow change → AC-34
- [ ] Scroll back to the top and down again → nothing hides or replays → AC-34
- [ ] Reload halfway down → the bands on screen do not fade out and back in; the bands below still reveal → AC-35
- [ ] Open `/#presence-heading` fresh → the presence heading, copy, and map fade in once as the page lands on them (the script runs before the anchor jump, so they count as below the fold); nothing that was visible blinks → AC-35
- [ ] Separately: JavaScript off; the reveal chunk blocked in dev tools; `prefers-reduced-motion: reduce` → every band below the hero is fully visible at once and scrolling changes nothing → AC-35
- [ ] From the hero, tab with no scrolling first → each service card and the showcase button is visible by the time its focus ring shows → AC-18, AC-35
- [ ] At 360px → the stacked service cards and showcase tiles each reveal as they reach the screen, not all at once → AC-34

### Value sourcing

- [ ] Markup source: remove `data-reveal-stagger` from the services grid in `index.astro`, build → the cards stay still while the heading still reveals; restore → AC-33
- [ ] Reduced motion source: toggle `prefers-reduced-motion` in dev tools rendering and reload each way → with `reduce` nothing is hidden at any scroll position → AC-35
- [ ] Hidden set derived at start: reload scrolled so the services cards are half on screen → those cards never animate, the ones fully below still do → AC-35
- [ ] Constants: `reveal.ts` holds `RISE_PX = 24`, `DURATION_S = 0.6`, `ease: 'easeOut'`, `AMOUNT = 0.2`, `STAGGER_S = 0.08` → AC-34
- [ ] Stagger delay counts hidden children only: with the first service card on screen at load, the second card starts with no wait → AC-34
- [ ] Once only: in dev tools, watch a revealed element's `style` while scrolling past it several times → it never gains `opacity` again → AC-34

### Acceptance criteria coverage

- AC-14 by the script list step · AC-17 by the gates · AC-33 by the grep and the scroll order · AC-34 by the scroll order, no leftover style, no replay, 360px, and the constants · AC-35 by the reload, the anchor load, the three off paths, the keyboard step, and the half on screen cards · AC-36 by the size, the import grep, and the workspace diff

## Milestone 8: the service cards · updated 2026-09-22

_A first pass ran during `/develop` in headless Chrome at 1280, 768, and 360px
(rest, hover, keyboard focus, reduced motion hover). Rerun it on the real site._

Built on one choice the engineer made at build time: the sub services are one
centred line split by pipes, as the reference card shows, not the left aligned
check list AC-38 describes. The steps below check what was built; AC-38 owes a
spec revision.

### UI / manual

- [ ] At 1280px, look at the services band → three cards, each showing top to bottom the illustration, the title, the summary, the sub services as one centred line split by `|`, and "Learn more →" at the bottom; the cards are the same height and the cues are level → AC-4, AC-38
- [ ] View source of the services section → no service photo; each card holds a `<ul role="list">` with one `<li>` per sub service, and the pipes sit in `aria-hidden` spans → AC-4, AC-38
- [ ] Tab through the band → one stop per card, on the title link; a screen reader reads the title alone as the link name and skips the illustration (`alt=""`) → AC-38, AC-39
- [ ] Click anywhere on a card, including the cue and the illustration → it goes to `/{slug}` → AC-38
- [ ] Hover a card → over 200ms a cream to gold wash fades in, 4px gold borders appear on the left and right, every word and the arrow turn black, the shadow deepens, and the card rises 4px; nothing inside moves → AC-40, AC-41
- [ ] Focus a card's link with the keyboard → the same as hover, plus the `gold-ink` ring around the card; tab on → it all returns to rest → AC-40
- [ ] With `prefers-reduced-motion: reduce` emulated, hover a card → the wash, borders, black text, and shadow appear at once, and the card does not rise → AC-42
- [ ] Emulate a touch device and tap a card → it follows the link; press back → no card is stuck in its gold state → AC-42
- [ ] Scroll down to the band on a fresh load → the cards reveal one by one; once they settle, hover still lifts and washes the card → AC-33, AC-34, AC-42
- [ ] At 768px and 360px → the cards stack or pair with no overflow, the pipe line wraps like prose, and the illustration stays 160px tall → AC-13, AC-43
- [ ] On a throttled connection → nothing shifts as the illustrations arrive → AC-12, AC-43

### Commands

- [ ] Give one service 2 `subServices`, then 7, then none, running `pnpm build` each time → each fails naming the entry and `subServices`; restore → AC-39
- [ ] Add an unknown key under `home.services` in `home.yaml` and build → it fails with `Unrecognized key`; restore → AC-39
- [ ] `git diff main -- src/components/ui/Card.astro` → empty, and `grep -rn goldHover src` → no hits → AC-44
- [ ] `grep -n domains astro.config.mjs` → still only `images.pexels.com`; the built `index.html` serves the illustration from `/_astro/` as a 1x and 2x `webp` → AC-43
- [ ] `pnpm check`, `pnpm lint`, `pnpm build` → all pass; `dist/client/` has one HTML file per route, no `astro-island`, and still one module script on the home page → AC-14, AC-17

### Value sourcing

- [ ] Sub services source: reorder the items in `scan-to-bim.md` and rebuild → that card shows them in the new order → AC-38
- [ ] Cue source: change `home.services.cardCue` → all three cards show the new word → AC-38
- [ ] Illustration source: point `home.services.illustration.src` at another local image → all three cards change; swap `decorative: true` for an `alt` → every card's `<img>` carries that alt → AC-39
- [ ] Colours at rest and on the wash: in dev tools, read the computed colours at rest (title `#333333`, summary `#707070`, list `#666666`, cue `#946600`) and on hover (all `#000000`) → AC-41

### Acceptance criteria coverage

- AC-4 by the contents and source steps · AC-12 and AC-43 by the throttled load, the `webp` check, and the domains grep · AC-38 by the contents, tab, click, and source steps (the check list part is replaced by the pipe line) · AC-39 by the guard commands and the illustration source · AC-40 to AC-42 by the hover, focus, reduced motion, touch, and reveal steps · AC-44 by the `Card` diff and the grep

## The hero scrim panel's entrance · added 2026-09-23 by /develop

_Built without a spec revision: spec 0005 owes AC-37 the sentence that records
this. Serve the production build (`pnpm build`, then `wrangler dev`), because
the entrance rides on the carousel and the carousel needs two photos._

### In a browser

- [ ] Load `/` at 1280px and watch the hero without touching it → the panel is still at the first paint, then at 6s the photo crossfades and the panel fades in from transparent while rising into place, settling well before the photo does → AC-37
- [ ] Click the next arrow, then the previous arrow → each click changes the photo and replays the same entrance at once → AC-20, AC-37
- [ ] Click a dot → the same entrance, and that photo keeps a full 6s → AC-20, AC-37
- [ ] Hold the pointer over the band (or tab to an arrow and leave focus there) for 10s → the photo and the panel both hold still; move away and the pair starts again → AC-37
- [ ] After an entrance settles, inspect the panel → no inline `style`, so it is back on its own classes (the same promise the reveal makes); the heading and subheading keep their usual spacing, and the button below never moved → AC-34
- [ ] With `prefers-reduced-motion: reduce` emulated → the panel never moves, on load or on any click, the photo never changes on its own, and the dots and arrows still swap it → AC-14, AC-37
- [ ] With JavaScript disabled → one photo, no controls, and the panel visible and still → AC-14, AC-35
- [ ] At 390px → the entrance plays the same way and nothing overflows sideways as the panel rises → AC-13

### Commands

- [ ] `grep -rn "data-hero-panel" src/` → the attribute on the scrim panel in `Hero.astro` and the one lookup in `hero-carousel.ts`, nowhere else → AC-14
- [ ] `grep -rn "from 'motion" src/scripts/hero-carousel.ts` → no hits, so the hero's script pulls in no library → AC-14, AC-36
- [ ] `pnpm check`, `pnpm lint`, `pnpm build` → all pass, and the home page still loads the same module scripts it did before → AC-14, AC-17

### Value sourcing

- [ ] Panel source: change `home.hero.heading` and `home.hero.subheading` in `home.yaml` and rebuild → both new lines animate together, so the entrance replays the content panel and never a second copy of it → AC-1
- [ ] One photo only: cut `home.hero.images` to a single entry and rebuild → no controls, no photo change, and no entrance at all → AC-20, AC-37

### Acceptance criteria coverage

- AC-37 by the autoplay, arrow, dot, hold, reduced motion, and one photo steps · AC-34 by the no inline style step · AC-14 and AC-36 by the greps and the gates · AC-1 by the panel source step · AC-13 by the 390px step
