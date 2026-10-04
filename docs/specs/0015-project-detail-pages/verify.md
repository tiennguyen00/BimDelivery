# Verify: project detail pages · spec 0015 · updated 2026-10-04
_Steps derived from spec 0015 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

Serve the real build first: `pnpm build`, then `pnpm exec wrangler dev --port 8799 --ip 127.0.0.1` (stop it before the next build, since it holds `dist/` open on Windows).

## UI / manual

### Routes and composition
- [ ] Open `/project/harbour-tower`, `/project/riverside-offices`, `/project/midtown-retrofit`, `/project/corner-block`, `/project/college-hall`, `/project/seafront-hotel` → each renders; `/project` still renders the wall → AC-1
- [ ] Open `/project/nope` → the site's 404 page, status 404 → AC-1
- [ ] On `/project/harbour-tower`, top to bottom: intro, cover, story, tinted gallery, "Next project", gold band, then the footer with its certification panel → AC-2

### Intro
- [ ] The intro shows "All projects" with a left arrow (`gold-ink`, small), then "LANDSCAPE BIM" on its own line, then the ruled title in capitals, then the summary → AC-6
- [ ] "All projects" opens `/project`; the service line opens `/landscape-bim` (the project's own service) → AC-6, value sourcing (back link, service line)
- [ ] The `h1` text in the DOM is "Harbour Tower" (capitals are CSS only), and the summary reads "Clash coordination for a 30 storey mixed use tower." → AC-6, value sourcing (`h1`, paragraph)
- [ ] `/project` intro is unchanged: no links above its `h1`, entrance steps 0 and 1 → AC-6

### Cover
- [ ] The cover box is 4:3 at 360px, 16:9 at 768px, 21:9 at 1024px and 1920px, full width inside the gutters (no maximum width), rounded, no caption, no link, no hover change → AC-7
- [ ] The cover `<img>` has `loading="eager"`, `fetchpriority="high"`, `sizes="100vw"`, a `srcset` up to 2400w, and the project's alt → AC-7, value sourcing (cover photo, alt)

### Story and facts
- [ ] At 360px and 768px the facts panel comes before the write up; at 1024px and 1920px the write up spans the first two columns and the panel sits in the third, both starting at the top → AC-8, AC-16
- [ ] Harbour Tower's panel shows eight rows in order: Location "Sydney, Australia", Completed "2024", Client, Floor area "42,000 m²", Storeys "30", Level of development "LOD 300", Software "Revit, Navisworks", Duration "14 weeks" → AC-8, value sourcing (rows, labels, year, floor area, storeys, LOD, software, location/client/duration)
- [ ] College Hall's panel shows only Location, Completed, Level of development, Software: no Client, Floor area, Storeys, or Duration rows, no empty `<dt>`, no dash → AC-8, AC-19
- [ ] The year shows "2024", never "2,024" → AC-8, value sourcing (year)
- [ ] Each write up section is an `h2` at `text-h3` with its paragraphs below; Harbour Tower's "no open hard clashes" shows in bold `gold-ink` (a `==` mark), and "coordinated into one clash free model" in bold → AC-8, value sourcing (section headings, paragraphs)
- [ ] Temporarily set Harbour Tower's `location` to an 80 character string → it wraps inside the panel at all four widths, with no sideways scroll; restore it → AC-16

### Gallery
- [ ] The gallery band is tint, full width inside the gutters, with a left aligned ruled `h2` "Gallery" → AC-9, value sourcing (gallery heading)
- [ ] Riverside Offices shows 9 tiles, College Hall 2, in content order; one column at 360px, two at 768px, three at 1024px; every tile stays 5:4 → AC-9, AC-16, AC-19, value sourcing (photos, alts, order)
- [ ] A gallery tile has no caption, no focusable element, the default cursor, and no zoom on hover; every gallery `<img>` is `loading="lazy"` → AC-9
- [ ] The gallery grid classes, `widths`, and `sizes` match the `/project` wall's (both come from `src/components/project/wall.ts`) → AC-9, value sourcing (grid)

### Next project
- [ ] On Harbour Tower (order 1) "Next project / Riverside Offices →" opens `/project/riverside-offices` → AC-10, value sourcing (which project, label, title, href)
- [ ] On Seafront Hotel (order 6, the last) the next link wraps to `/project/harbour-tower` → AC-10
- [ ] The link's accessible name is "Next project Harbour Tower" style (label and title); the title underlines on hover; Tab shows the `gold-ink` ring → AC-10
- [ ] Temporarily move every other `en` project file out of the folder → the build passes and `/project/college-hall` has no next band; restore them → AC-10, value sourcing (shown or not)

### Closing band and head
- [ ] The gold band reads "Have a project like this one?", one sentence, and "Contact us" to `/contact-us` → AC-11, value sourcing (closing band)
- [ ] Harbour Tower's tab title is "Harbour Tower | BIM Delivery" and its meta description is the summary → AC-12, value sourcing (title, description)
- [ ] Temporarily add an `seo` block to Harbour Tower → the title and description become the override; restore it → AC-12

### Nav
- [ ] On a detail page the header's Project item (desktop bar and mobile menu) is underlined and has no `aria-current`; on `/project` it is underlined with `aria-current="page"` → AC-13, value sourcing (active section)

### Project tiles
- [ ] On `/project`, Tab moves one stop per tile; the `gold-ink` ring wraps the whole tile; each link's name is the project title; "Read more →" shows under the title and is `aria-hidden` → AC-14, value sourcing (`/project` tile href, cue)
- [ ] On `/project` the pointer shows anywhere on a tile, a tap or click anywhere opens that project, and hover zooms only the photo → AC-14
- [ ] On the home page the three showcase tiles behave the same: one stop each, ring round the tile on tint, name is the title, "Read more →" under the summary and `aria-hidden`, pointer anywhere, photo zoom on hover; "View all projects" still links to `/project` → AC-15, value sourcing (home tile href, cue)
- [ ] With reduced motion asked for, hovering a tile on either surface does not zoom → AC-14, AC-15
- [ ] Temporarily give a project a 60 character title → on `/project` and on home the caption, with its cue, stays inside its tile at 360, 768, 1024, and 1920px; restore it → AC-16

### Layout, headings, motion
- [ ] At 360, 768, 1024, and 1920px no detail page scrolls sideways, and nothing shifts while the cover and gallery photos load → AC-16
- [ ] A detail page has one `h1`, then `h2`s for the facts panel, each write up section, the gallery, and the closing band, with no skipped level; the intro is labelled by the `h1`, the gallery band and list by the gallery `h2`, the closing band by its `h2`; the story and next project bands carry no label → AC-17
- [ ] On load the back link and service line, then the `h1`, then the summary, then the cover fade and rise in (steps 0 to 3) → AC-18, value sourcing (entrance steps)
- [ ] Scrolling down reveals the facts panel, each write up section, the gallery heading block, then the tiles one after another; the `h1` and gallery rules draw with the scroll direction; the next project and gold bands do not move → AC-18
- [ ] With JavaScript off, and separately with reduced motion, every band and tile is simply shown → AC-18
- [ ] Every word on a detail page comes from content: change a fact label in `projectPage.yaml` and it changes on every page → AC-5

## Commands
- [ ] `pnpm check` → 0 errors (if it exits 139 or -1073741819, that is the intermittent crash on this machine; run it again) → AC-21
- [ ] `pnpm lint` → clean → AC-21
- [ ] `pnpm build` → 14 pages; `find dist/client -name "*.html"` lists the eight existing pages plus `project/<slug>/index.html` for all six projects → AC-1, AC-21
- [ ] `grep -l astro-island dist/client/project/*/index.html` → no files → AC-21
- [ ] The gold class search in `docs/design.md` → only `ServiceCard.astro`'s `group-hover:border-gold` and `group-has-[a:focus-visible]:border-gold` → AC-21
- [ ] Build guards, one at a time on a project file, each failing with the file and field named: a `slug` with a capital; a duplicate `slug` (names both files); `floorarea` typo; missing `location`; `year: 1850`; `lod: 250`; a fifth `writeUp` section; a paragraph with an unclosed `**`; a 1 photo `gallery`; a gallery photo with no `alt`; a gallery photo with `decorative: true`; a gallery link off `images.pexels.com` → AC-3
- [ ] Remove `tileCue` from `projectPage.yaml`, then `cue` from `home.yaml`, then add an unknown key under `detail` → each fails the build naming it → AC-4
- [ ] `docs/design.md` records the intro's `context` and `entranceFrom`, the cover, the story band and facts panel, the shared wall, the next project link, the project tile link rule, the header's section marking, `arrow-left`, the cue in the "white on scrim" row, and the detail page in the motion list and the `reveal.ts` invariant; `/styleguide` (under `pnpm dev`) shows the full and short facts panels, a linked `/project` tile with its cue, and the next project link → AC-20
- [ ] `src/assets/images/CREDITS.md` has one row per gallery photo (25 rows) → AC-19

## Acceptance-criteria coverage
- AC-1 routes, 404, build list · AC-2 band order · AC-3 build guards · AC-4 shared copy guards · AC-5 copy from content · AC-6 intro and `/project` unchanged · AC-7 cover · AC-8 story and facts · AC-9 gallery · AC-10 next, wrap, single · AC-11 closing band · AC-12 head and override · AC-13 nav · AC-14 `/project` tiles · AC-15 home tiles · AC-16 widths, long text, no shift · AC-17 headings and labels · AC-18 motion, no JS, reduced motion · AC-19 placeholder content and credits · AC-20 design.md and styleguide · AC-21 gates
