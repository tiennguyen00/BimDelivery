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
- [ ] Remove `secondaryCta` from `home.hero` → build succeeds and the hero renders one button with no gap or stray separator → AC-3
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
