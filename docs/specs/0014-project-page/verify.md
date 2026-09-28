# Verify: Project page · spec 0014 · updated 2026-09-28

_Steps derived from spec 0014 acceptance criteria and its Value sourcing table. `/check verify` runs these; `/test` locks the durable ones._

Serve the real build as the `verify` skill describes (`pnpm build`, then `pnpm exec wrangler dev --port 8799 --ip 127.0.0.1`), and open `/project/`. Stop the server before building again: on Windows it locks `dist/client`. For the drills that edit content, the dev server (`astro dev --background`, `localhost:4321`) picks up changes live; revert every edit afterwards.

## UI / manual

- [ ] Open `/project/` at 1920x1080 → the intro band, then the photo wall, then the gold band, then the unchanged footer with its certification panel → AC-1
- [ ] Read the tab title and meta description → they match `projectPage.seo.title` and `.description` → AC-2 (value: title, description)
- [ ] Intro → the `h1` "Our projects" in capitals (CSS `uppercase`, the source text is mixed case), left aligned, with the gold rule under it; one `text-lead` paragraph within the narrow width. Add a temporary `**bold**` or `==gold==` phrase to `projectPage.intro` → it renders marked → AC-4 (value: `projectPage.heading`, `projectPage.intro`)
- [ ] Photo wall at 1920 → six tiles, two full rows of three, 8px white seams, running the full window width minus the 32px gutters (wider than the intro's column) → AC-5, AC-13
- [ ] Tile order → Harbour Tower, Riverside Offices, Midtown Retrofit, Corner Block, College Hall, Seafront Hotel, the `order` field 1 to 6. Swap two `order` values temporarily → the tiles swap → AC-5 (value: which projects, in what order)
- [ ] Each tile → a 5:4 box with rounded corners; the photo covers it; a see through dark strip flush with the bottom holds the service in small capitals and the title as an `h2`, all white; no summary → AC-6 (value: photo, alt, service line, title)
- [ ] Inspect the tile photos → `alt` from content, `sizes="(min-width: 64rem) 33vw, (min-width: 48rem) 50vw, 100vw"`, widths 400 to 1600; the first three `loading="eager"`, the last three lazy → AC-6 (value: eager or lazy)
- [ ] Change one project's `service` temporarily → its tile's service line follows the referenced service's `title` → AC-6 (value: service line from `getProjects`)
- [ ] Hover a tile → nothing changes, the cursor stays the default → AC-7
- [ ] Tab from the header → the next stop after the header is the gold band's "Contact us"; no stop inside the wall → AC-7, AC-11
- [ ] At 360, 768, 1024, and 1920 wide → one, two, three, three columns (two from 768, three from 1024), no sideways scroll, every tile exactly 5:4, every caption wholly inside its tile → AC-5, AC-8
- [ ] Set one title to exactly 60 characters temporarily → at every width above its caption still fits inside the tile (at 1024 it takes about 185 of the tile's 252px) → AC-8
- [ ] Throttle the network and reload → the tiles hold their black 5:4 boxes while the photos arrive; nothing on the page shifts → AC-8
- [ ] Move every `src/content/projects/en/*.yaml` aside temporarily → no wall and no list; a centred "Projects coming soon" `h2` with no gold rule and its text; the gold band still follows → AC-9 (value: empty or not, `projectPage.emptyState`)
- [ ] Gold band → heading "Have a project like these?", its sentence, and a black "Contact us" link; press it → `/contact-us/` → AC-10 (value: `projectPage.cta`)
- [ ] Heading outline → one `h1` (`project-heading`), one `h2` per tile, the gold band's `h2` (`project-cta-heading`); the intro `section` and the list both point at `project-heading`, the gold band at its own `h2`; in the empty drill the empty `section` points at `project-empty-heading` → AC-11 (value: heading ids)
- [ ] Load at 1920 → the `h1`, the paragraph, then the first row of tiles fade and rise in, 80ms apart (steps 0 to 4); the second row starts hidden and reveals one tile after another as you scroll → AC-12
- [ ] Load at 390 → the intro moves in; scroll down → each later tile fades in after the one before; scroll back up past the `h1` and down again → its gold rule runs back and draws again → AC-12
- [ ] JavaScript off, and separately reduced motion → every tile and word is simply shown, nothing left hidden → AC-12
- [ ] Open a service page (for example `/bim-coordination/`) → it still moves on load exactly as before (`entrance.ts` moved to `ui`) → AC-12
- [ ] Home page → the project showcase still shows Harbour Tower, Riverside Offices, and Midtown Retrofit, unchanged → AC-13
- [ ] `/styleguide` under `pnpm dev` → a "Project gallery" section showing the real six tiles → AC-14

## Commands

- [ ] Set a project `title` to 61 characters, run `pnpm build` → fails naming `projects → en/<file>` and `title` (at most 60) → AC-3
- [ ] Add a leftover key to `src/content/projectPage/en/project.yaml`, run `pnpm build` → fails naming the key and the file → AC-3
- [ ] `grep -rn "Our projects\|Have a project\|coming soon" src/pages src/components` → no hits: every visible word is content → AC-2
- [ ] `pnpm check`, `pnpm lint`, `pnpm build` → all pass → AC-15
- [ ] `find dist/client -name "*.html"` → 8 files, including `dist/client/project/index.html` → AC-15
- [ ] `grep -c astro-island dist/client/project/index.html` → 0 → AC-15
- [ ] The gold class search in `design.md` → only the `ServiceCard` written exception → AC-15
- [ ] `grep -n "Seafront Hotel" src/assets/images/CREDITS.md` → one row with its Pexels link → AC-13
- [ ] `docs/design.md` → a `ProjectGallery` entry, the 8px gap exception under Spacing, the tile captions in the scrim contrast row, the Project page in the motion list and in the `reveal.ts` invariant → AC-14

## Acceptance-criteria coverage

- AC-1: the 1920 bands step · AC-2: the seo step, the no copy grep · AC-3: the two build guards · AC-4: the intro step · AC-5: the wall, order, and width steps · AC-6: the tile, photo, and service steps · AC-7: hover and Tab · AC-8: widths, the 60 character title, throttled load · AC-9: the empty drill · AC-10: the gold band step · AC-11: the heading outline, Tab · AC-12: the load, phone, JavaScript off, reduced motion, and service page steps · AC-13: the showcase and credits steps · AC-14: styleguide and `design.md` · AC-15: the gate commands
