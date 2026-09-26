# Verify: Service pages · spec 0013 · updated 2026-09-26

_Steps derived from spec 0013 acceptance criteria and its Value sourcing table. `/check verify` runs these; `/test` locks the durable ones._

Serve the real build as the `verify` skill describes (`pnpm build`, then `pnpm exec wrangler dev --port 8799 --ip 127.0.0.1`), and open `/revit-modeling/`, `/scan-to-bim/`, and `/bim-coordination/`. Stop the server before building again: on Windows it locks `dist/client`. Every drill that edits a file is reverted afterwards.

## UI / manual

- [ ] Open each of the three pages at 1920x1080 → five bands in order (intro, features, audiences, process, presence), then the footer → AC-1, AC-2
- [ ] Read each page's tab title and meta description → they match the entry's `seo.title` and `seo.description` → AC-5 (value: title, description)
- [ ] Intro at 1024px and up → the `h1` in capitals with no gold rule, each paragraph left aligned beside its own 4px gold bar with semibold `ink-strong` bold phrases, and a 4:3 photo box with rounded corners on the right, centred against the copy; below 1024px one column, the carousel last → AC-6
- [ ] Inspect the intro photos → widths 480, 800, 1200 with `sizes="(min-width: 1024px) 32vw, 100vw"`; the first is `loading="eager"` with `fetchpriority="high"`, the rest lazy → AC-6 (value: generated widths, sizes)
- [ ] Carousel dots → one real button per photo named "Show photo N of M", black at 30 percent and solid black for the photo showing, no arrows. Revit Modeling and BIM Coordination show three dots, Scan to BIM two → AC-6, AC-14 (value: dot labels)
- [ ] Wait 6s with the pointer away → the photo crossfades over 1s and wraps; hover or tab into the carousel → it holds; press a dot → that photo shows at once and gets a full 6s → AC-7 (value: carousel timing)
- [ ] Home hero → still crossfades with its arrows and dots, and the panel replays its entrance on each change → AC-7
- [ ] Revit Modeling features → a black band under a faint dot grid, a centred `h2` with its rule and a gold accent, the paragraphs, a centred `h3` subheading with its rule, then three `panel` cards in one row at 1024px and up (one column below): an 80px thin gold line icon, an `h4` title, a bulleted list → AC-8, AC-9, AC-14
- [ ] Scan to BIM features → white under the diagonal stripe: the heading and paragraphs on the left (about five twelfths) and four white tiles with a `line` border on the right, two columns from 768px, one below; 40px `gold-ink` icons → AC-8, AC-10, AC-14
- [ ] BIM Coordination features → the split layout on the dark dotted band, six `panel` tiles, a `==` phrase in a paragraph in bright gold → AC-8, AC-10, AC-14
- [ ] Audiences on each page → a white band, a centred ruled `h2` with a `gold-ink` accent, a left aligned intro, then six items as two rows of three from 768px (one column below), each a 64px solid gold icon, an `h3`, and its text → AC-11, AC-14
- [ ] Process on each page → the band's own surface (dark on Revit Modeling and BIM Coordination, light striped on Scan to BIM), numbered gold circles joined by a 4px gold line through their centres in one row at 1024px and up, a vertical line down the start side on a phone; then the closing heading, text, and a gold Contact us button → AC-12, AC-14 (value: step numbers are position plus one)
- [ ] Press Contact us on each page → `/contact-us/` → AC-12 (value: `process.cta.button`)
- [ ] Presence on Revit Modeling and BIM Coordination → the home page's presence band on a white striped band; on Scan to BIM the same band on `tint`, because the band before it is a light pattern band → AC-13 (value: presence tone from the previous band)
- [ ] Home page presence band → unchanged → AC-13
- [ ] Check every heading and band → one `h1`; ids `intro-heading`, `features-heading`, `audiences-heading`, `process-heading`, `presence-heading`; every band's `aria-labelledby` names an id that exists; `h3` and `h4` in order beneath → AC-16 (value: heading ids)
- [ ] At 375, 768, 1024, and 1920 wide on each page → no sideways scroll, no overlapping or truncated text → AC-17
- [ ] Reload at the top at 1920x1080 → the intro heading, then each paragraph, then the carousel fade and rise in; the features heading block, which starts on screen, moves only by the load entrance and is never shown, hidden, then revealed → AC-15 (value: entrance steps intro 0 to n + 1, next block from n + 2)
- [ ] Scroll down slowly → each lower band's heading block reveals, then its cards, tiles, items, or steps one after another, then the process closing; each ruled heading's rule draws on the way down and runs back on the way up → AC-15
- [ ] At 375x812 → the features band starts below the fold and reveals on scroll → AC-15
- [ ] Disable JavaScript → every band is shown, the first photo only, no dots, every rule full width → AC-7, AC-15
- [ ] Turn on reduced motion → nothing moves, the carousel never autoplays, and the dots still switch photos → AC-7, AC-15
- [ ] In the nav dropdown and the contact form's "Your needs" → the three services in `order`, as before → AC-3
- [ ] Home services row → the three cards as before, in `home.services.featured` order → AC-23 (value: which cards, in what order)
- [ ] `/styleguide` under `pnpm dev` → the `panel` swatch, the new contrast rows, the fourteen new glyphs with the 80px and 40px `strokeWidth` rows, and the Revit Modeling features block on a dark and a light `PatternBand` → AC-20

## Drills (each reverted afterwards)

- [ ] Reorder: move the `audiences` block above `features` in `revit-modeling.yaml` and build → the page follows, ids and tones hold, no other page's HTML changes → AC-2, AC-16
- [ ] Build failures, one at a time in `scan-to-bim.yaml`, each failing and naming the file and field: `image:` at the top level (unrecognized key); `presence` first (`the intro block must be the first section`); a second `intro`; an `audiences` block with no `layout`; `layout: slider` on audiences; `icon: crane` on an audience; a presence `content` with no `regions`; `==scan==` in the features paragraph (the light surface rule, quoting the text); a second `presence`; a typo key inside a step → AC-3, AC-4
- [ ] Restyle: add a throwaway `audiences/list` layout to the schema only → `pnpm check` fails on both `bands` and `BAND_BACKGROUND`. Add a component and both entries and use it in Scan to BIM only → only `/scan-to-bim` changes, no other content file or existing band component is edited → AC-21
- [ ] Presence override: give BIM Coordination's presence block a complete `content` → only that page shows it; the home page and the other two services are byte identical. Remove it → the shared copy returns → AC-22 (value: block `content`, else `home.presence`)
- [ ] Home row: list two services in `featured`, then one → the cards keep their row of three width and sit centred with equal margins, no empty cell, at 768px and 1280px → AC-23 (value: grid and card classes by count)
- [ ] Home row failures: an unknown id, then a repeated one → each build fails naming `src/content/home/en/home.yaml` and the id. The other language clause cannot be driven while the site has one language: confirm it by reading `resolveFeaturedServices` in `src/lib/content.ts` → AC-23
- [ ] Add a service: copy `revit-modeling.yaml` to `bim-consulting.yaml` with a new `slug` and `order: 4` → the build passes, `dist/client/bim-consulting/index.html` exists, it appears fourth in the nav and in the contact choices, and not on the home row → AC-24
- [ ] Remove a service: move `scan-to-bim.yaml` aside → the build fails; its log names `en/home` (`services.featured`), `en/corner-block`, and `en/midtown-retrofit` (`service`), and the thrown error names a project file. Point both projects at another service and drop the id from `featured` → it passes, and `/scan-to-bim/` serves the 404 page → AC-24 (value: the page a removed URL serves)
- [ ] Read `src/content/README.md` → the recipes for words and photos, sections, a presence override, a new layout, a new block type, adding and removing a service, and the "Three core services" copy → AC-25

## Commands

- [ ] `pnpm check` → 0 errors → AC-20, AC-21
- [ ] `pnpm lint` → clean → AC-20
- [ ] `pnpm build` → passes; `dist/client/revit-modeling/index.html`, `dist/client/scan-to-bim/index.html`, and `dist/client/bim-coordination/index.html` exist → AC-1, AC-20
- [ ] `ls src/content/services/en/` → three `.yaml` files and no `.md` → AC-3
- [ ] Search `src/` for the forbidden gold classes as whole class tokens → only `group-hover:border-gold` and `group-has-[a:focus-visible]:border-gold` in `ServiceCard.astro` → AC-19
- [ ] `grep -rn "hero-carousel\|data-hero" src` → no hits in code; `carousel.ts` is the only carousel script → AC-7
- [ ] `grep -n "HOME_SERVICES_COUNT\|checkServiceCount" src/lib/content.ts` → no hits → AC-23
- [ ] Read `Icon.astro` and `CREDITS.md` → each of the fourteen new glyphs names its set, source glyph, and licence; `strokeWidth` defaults to 2 → AC-18

## Acceptance-criteria coverage

- AC-1 covered by the page steps and the build command · AC-2 by the page order and reorder drill · AC-3 by the nav and contact step, the failure drill, and the `ls` command · AC-4 by the failure drill · AC-5 by the title step · AC-6 by the intro, photo, and dot steps · AC-7 by the carousel, hero, no JavaScript, and reduced motion steps · AC-8 to AC-12 by the band steps · AC-13 by the presence steps · AC-14 by the band steps · AC-15 by the motion steps · AC-16 by the heading step and reorder drill · AC-17 by the widths step · AC-18 by the icon read · AC-19 by the gold search · AC-20 by the styleguide step and gates · AC-21 by the restyle drill · AC-22 by the presence drill · AC-23 by the home row steps and drills · AC-24 by the add and remove drills · AC-25 by the README read
- AC-15 has one part `/develop` cannot write: recording the second "entrance plus scroll reveal" pairing in spec 0012 itself (spec content is `/architect`'s). The `global.css` comment and `docs/design.md` carry it.
