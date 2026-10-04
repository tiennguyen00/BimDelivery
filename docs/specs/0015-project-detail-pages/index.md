# 0015. Give every project its own page at /project/<slug>, and turn the project tiles into links

**Date**: 2026-10-04
**Status**: In Progress
**Scope feature**: 16, Project detail pages (`docs/scope/scope.md`)

## Summary

Every project gets its own prerendered page (built once into plain HTML) at `/project/<slug>`. It has six bands, top to bottom. A white intro holds an "All projects" link, the service (which links to its service page), the ruled project title, and the summary. A wide cover photo follows. Next comes the write up in titled sections, beside a facts panel (location, year, and optional client, size, LOD, software, and duration). Then a wall of 2 to 9 photos in the same 5:4 tiles as `/project`, one link to the next project, and the gold call to action band.

Each project's words, facts, and photos live in its existing YAML file, which gains a `slug`, the facts, the write up, and a gallery. The schema becomes strict, so a typo fails the build. The tiles on `/project` and on the home page each become one link with a "Read more" cue, and the home tiles gain the same slow photo zoom, so every project tile on the site follows one rule. No script, dependency, or colour is added.

## Requirements

**User stories**:

- As a prospective client, I want to open a project and read what was asked, what the team did, and how it turned out, so I can judge whether they can handle my building.
- As a prospective client, I want the key facts (where, when, how big, which LOD and software) in one glance, so I can compare projects quickly.
- As a visitor, I want to see more photos of a project than the one on its tile, so I get a real sense of the work.
- As a visitor on `/project` or the home page, I want each project tile to take me to that project, so the photos lead somewhere.
- As a visitor at the end of a project, I want to move on to the next one or get in touch, so I never hit a dead end.
- As someone editing the site, I want to write a project's page entirely in its content file, and have the build tell me by name when I get a field wrong.

**Acceptance criteria**:

- **AC-1** (routes): `src/pages/project/[slug].astro` prerenders one page per entry of `getProjects(DEFAULT_LOCALE)` at `/project/<slug>`, where `<slug>` is the entry's `slug`. The build writes `dist/client/project/<slug>/index.html` for each of the six projects, and `/project` itself still builds from `src/pages/project.astro`, unchanged in path. A path under `/project/` that matches no slug gets the site's existing 404 page. `output` stays `'static'`.
- **AC-2** (composition): a detail page renders these bands in this order, then the unchanged footer with its certification panel: the intro band (AC-6), the cover band (AC-7), the story band (AC-8), the gallery band (AC-9), the next project band (AC-10, only when the language has two or more projects), and the gold closing band (AC-11).
- **AC-3** (the `projects` schema): `projects` entries are a `z.strictObject` with exactly the fields in *Data model sketch*. Each of these fails the build with a message naming the file and the field: an unknown key (for example `floorarea`); a missing `slug`, `location`, `year`, `writeUp`, or `gallery`; a `slug` that is not lowercase kebab case (`^[a-z0-9]+(?:-[a-z0-9]+)*$`); two entries in one language with the same `slug` (the existing `checkUnique`, naming both files); a `year` outside 1900 to 2100 or not a whole number; a `floorArea` or `storeys` that is not a positive whole number; a `lod` other than 100, 200, 300, 350, 400, or 500; an empty `software` list; a `writeUp` with no sections or more than four, or a section with no paragraphs; a paragraph with an unbalanced `**` or `==` mark; a `gallery` with fewer than 2 or more than 9 photos; and a gallery photo whose link is not `https` on `images.pexels.com`, whose `alt` is missing or empty, or that is marked `decorative`.
- **AC-4** (the shared copy): the `projectPage` entry gains `tileCue` and a strict `detail` group with exactly the fields in *Data model sketch*, and `home.projectShowcase` gains `cue`. A missing or unknown key in either fails the build naming it.
- **AC-5** (copy comes from content): every word, number, and photo on a detail page comes from the project's entry, its service's `title` and `slug` (resolved by `getProjects`), the `projectPage` entry, or `settings.siteName`. `src/pages/project/[slug].astro` and every component it uses contain no visible copy of their own.
- **AC-6** (intro band): a white `Section` labelled by the page's `h1` (id `project-detail-heading`). Top to bottom, left aligned: the back link (`detail.backLink`, a new `arrow-left` glyph before its label, `text-small`, `gold-ink`); on its own line, the project's service `title` as a link to `/<service slug>` (`text-small font-semibold tracking-wide uppercase`, `gold-ink`); the `h1`, the project `title`, in capitals by CSS only (`uppercase`) with the shared `heading-rule` under it (`inline-block`, `data-heading-rule`); and the project `summary` as one `text-lead` paragraph in the narrow reading width, through `Emphasis` on the `light` surface. This is the existing `src/components/project/IntroBand.astro`, given one optional `context` prop that carries both links together (`{ backLink: Link; service: Link }`, so it is both or neither), plus `entranceFrom`. `/project` passes no `context` and renders exactly as before.
- **AC-7** (cover band): a white band with the band gutters and **no maximum width** (as `ProjectGallery`), and no vertical padding of its own. It holds one photo box, `rounded-ui`, `overflow-hidden`, on a `bg-black` fill that shows only while loading, fixed at `aspect-4/3` below `md`, `aspect-16/9` at `md`, and `aspect-21/9` at `lg` and up. The photo is the project's `image` as an optimised `Image` covering the box (`object-cover`, centred), with its content `alt` (or `alt=""` when `decorative`), `loading="eager"`, `fetchpriority="high"`, `widths` 640, 960, 1280, 1600, 2000, 2400, and `sizes` `100vw`. It has no caption, no link, and no hover response. The six project `image.src` links change their Pexels `w=1600` to `w=2400` so the cover has the pixels for a wide screen. The tiles keep their own `widths`.
- **AC-8** (story band): a white `Section` at the default width. Below `lg` it is one column with the facts panel first and the write up after it. At `lg` and up it is a three column grid with a 32px gap: the write up spans the first two columns and the facts panel sits in the third, both starting at the top. The DOM order stays facts first, and the placement comes from explicit classes, never from auto flow: the write up takes `lg:col-span-2 lg:row-start-1` and the facts panel `lg:col-start-3 lg:row-start-1`. The write up renders each `writeUp` section in order: its `heading` as an `h2` at `text-h3`, then each paragraph through `Emphasis` (`light`), 16px apart, with 48px between sections. The facts panel is `bg-tint`, `rounded-ui`, 24px padding (32px from `md`). It holds `detail.factsHeading` as an `h2` at `text-h3`, then one `<dl>` with a row for each fact the entry has, in this order: location, year, client, floor area, storeys, LOD, software, duration. Each row shows its label from `detail.factLabels` as the `<dt>` (`text-small font-semibold tracking-wide uppercase`, `ink-muted`) and its value as the `<dd>` (`ink-strong`, `wrap-break-word`, so a long name or place wraps inside the panel instead of pushing it wider). A fact the entry leaves out has no row at all. Values are formatted as follows. The year is written as it is (no thousands separator). The floor area is grouped for the page's locale, then `detail.areaUnit` (`42,000 m²`). Storeys is the plain number. The LOD is `detail.lodPrefix` and the number (`LOD 300`). Software is the list joined by `Intl.ListFormat` for the locale, `type: 'unit'` (`Revit, Navisworks`). Location, client, and duration are written as they are.
- **AC-9** (gallery band): a `tint` band with the band gutters, the band's top and bottom padding, and **no maximum width**. Its `h2` (`detail.galleryHeading`, id `project-gallery-heading`) is left aligned with the `heading-rule` under it (`inline-block`, `data-heading-rule`). Under it is one `<ul>` labelled by that `h2`, with one `<li>` per `gallery` photo in content order. The grid is the `/project` wall's: one column, then two at `md`, then three at `lg`, with the 8px gap (`gap-2`). Each tile is a fixed 5:4 box, `rounded-ui`, `overflow-hidden`, on `bg-black`. The photo is an optimised `Image` covering it, with its `alt`, the `/project` wall's `widths` and `sizes`, and `loading="lazy"`. A gallery tile has no caption, holds nothing focusable, keeps the default cursor, and does not move on hover. The wall's grid classes, `widths`, and `sizes` come from one shared module that `ProjectGallery` imports too, so the two walls cannot drift apart.
- **AC-10** (next project band): when the language has two or more projects, a white `Section` at the narrow width holds one centred link to the next project's page. The next project is the one after this one in `order`, and the last wraps round to the first. Inside the link, `detail.nextLabel` sits on its own line (`text-small font-semibold tracking-wide uppercase`, `ink-muted`), then the next project's `title` (`text-h3 font-semibold`, `ink-strong`) followed by an `arrow-right` glyph in `gold-ink`. The link's accessible name is the label and the title together, the title underlines on hover, and keyboard focus shows the light tone `gold-ink` ring. With only one project the band is absent.
- **AC-11** (closing band): the existing `CtaBand`, fed `projectPage.detail.cta` (heading, text, button), with `headingId` `project-detail-cta-heading`. `CtaBand` is unchanged.
- **AC-12** (page head): the page title is `project.seo.title` when the entry sets `seo`, otherwise `<project title> | <settings.siteName>` (`Harbour Tower | BIM Delivery`). The description is `project.seo.description` when set, otherwise the project `summary`. An `seo` override, when present, follows the existing shared `seo` rules (title up to 60 characters, description 50 to 160).
- **AC-13** (nav): on a detail page the header's Projects item (desktop bar and mobile menu) shows the existing active style but carries **no** `aria-current`. Generally, any nav link other than `/` is marked this way when the current path continues below its `href` at a `/` boundary (`/project/harbour-tower` under `/project`, never `/projects`). On `/project` itself the item keeps `aria-current="page"` as now. Put together: a link takes the active class when `isCurrent(href) || isSectionActive(href)`, and takes `aria-current="page"` only when `isCurrent(href)`. The Services group's own marking is unchanged.
- **AC-14** (the `/project` tiles link): each tile in `ProjectGallery` becomes exactly one link to its project's page, `/project/<slug>`, with one tab stop. The link is the title's text, stretched over the whole tile (the `Card` pattern, an `after:absolute after:inset-0` overlay), so its accessible name is the project title, and the pointer cursor shows anywhere on the tile. Under the title, the scrim strip gains the cue: `projectPage.tileCue` and an `arrow-right` glyph, white, `text-small font-semibold`, `aria-hidden="true"` (the name already carries the title). Keyboard focus draws the light tone `gold-ink` ring round the whole tile (`link-focus:`, as `Card`). The photo zoom of spec 0014 is unchanged. This replaces spec 0014's AC-7 ("tiles are not links").
- **AC-15** (the home tiles link): each tile in the home `ProjectShowcase` becomes one link to its project's page in the same way as AC-14: the stretched title link (the `h3`), one tab stop, the pointer cursor, and the `gold-ink` ring round the tile on the band's `tint`. Under the summary, the caption panel gains `home.projectShowcase.cue` and an `arrow-right` glyph, white, `aria-hidden="true"`. Each tile also gains spec 0014's photo zoom: `group` and `isolate` on the `<li>` with its existing `overflow-hidden`, and `transition-[scale] duration-500 ease-out motion-safe:group-hover:scale-105` on the `Image`. The band's "All projects" button stays. This replaces spec 0005's AC-30 ("the tiles are not links, and the photo does not move on hover").
- **AC-16** (responsive and stable): at 360px, 768px, 1024px, and 1920px wide, a detail page has no sideways scroll, the cover keeps its ratio for that width, the facts panel and write up stack (facts first) and then sit side by side from `lg` (facts on the right), a temporary 80 character `location` wraps inside the facts panel, and every gallery tile keeps its 5:4 shape. On `/project` and on the home page, every caption, now carrying the cue, still sits wholly inside its tile, including a 60 character title (checked with a temporary long title). Nothing on a detail page shifts as photos load, because the cover box and every tile box are reserved before their photo arrives.
- **AC-17** (headings and names): a detail page has one `h1` (the title), then `h2`s for the facts panel, each write up section, the gallery, and the closing band, and no skipped level. The intro band is labelled by the `h1`, the gallery band and its list by the gallery `h2`, and the closing band by its own `h2`. The story band and the next project band carry no label, since neither has one heading that names it.
- **AC-18** (motion): with no script, the intro moves in through the existing CSS `entrance` on load. The back link and the service line come at step 0, the `h1` at step 1, the summary at step 2, and the cover at step 3. (`IntroBand` takes an optional `entranceFrom`, default 0, so `/project` keeps its steps 0 and 1.) The facts panel and each write up section carry `data-reveal`. The gallery `h2` block carries `data-reveal`, and the gallery list carries `data-reveal-stagger`. The `h1` and gallery rules draw with the scroll direction, and the page imports `reveal.ts`. The next project band and the closing band do not move. No new script and no new dependency. With JavaScript off, a failed script, or reduced motion asked for, everything is simply shown.
- **AC-19** (placeholder content): each of the six projects gains a `slug` equal to its file name, a `location`, a `year`, a `writeUp` of two or three sections, and a `gallery` of Pexels building photos, each with a non empty `alt`. One project has exactly 2 photos, one has exactly 9, and the rest have 3 to 6. Most projects fill the optional facts, but at least one leaves out `client`, `floorArea`, and `storeys`, so a short panel is exercised. Every new photo gets a row in `src/assets/images/CREDITS.md`, in that file's existing table format (what it is used for, the Pexels photo page, the licence). `projectPage` gains placeholder `tileCue` ("Read more") and `detail` copy, and `home.projectShowcase` gains `cue` ("Read more").
- **AC-20** (written down): `docs/design.md` records the project detail page, including:
  - the intro's new optional `context` and `entranceFrom` props;
  - the cover band (the second band with no maximum width);
  - the story band and the facts panel;
  - the detail gallery wall, sharing the `/project` wall's geometry;
  - the next project link;
  - the project tile link rule on both tile surfaces, replacing every "not links yet" and "the photo stays still" line;
  - the header's section marking;
  - the `arrow-left` glyph;
  - the cue added to the "white on scrim" contrast row;
  - the detail page in the motion list and in the invariant's list of pages that import `reveal.ts`.

  The dev `/styleguide` shows the facts panel (full and short), a linked `/project` tile with its cue, and the next project link, built from real entries, and its "tiles are not links" notes are reworded.
- **AC-21** (gates): `pnpm check`, `pnpm lint`, and `pnpm build` pass. `dist/client/` has one HTML file per route: the existing eight plus one per project. No detail page contains `astro-island`. The gold class search in `design.md` finds only its written exceptions.

## Decision

**Chosen option**: Option 1, content driven static detail pages from the extended project entries, with every project tile becoming one link.

`src/pages/project/[slug].astro` builds one page per project from its strict YAML entry, the `projectPage.detail` copy, and `settings.siteName`. It composes the existing intro band and `CtaBand` with four new project components. The `/project` and home tiles each become one stretched link with a "Read more" cue from content. No script, dependency, token, or colour is added.

**Settled choices** (the engineer's picks, and the calls made at write time, with reasons in `rationale.md`):

- This is a new spec. It owns the tile link change on both surfaces, and replaces spec 0014's AC-7 and spec 0005's AC-30.
- Design source: no new reference. The page is designed from `docs/design.md` and the existing pages (the `/project` intro and wall, the gold band), on the same theme.
- Every project has a page. The write up and gallery are required, so every tile links.
- `/project/<slug>` from a `slug` field, unique per language and checked at build.
- Layout: intro, cover, story (write up beside facts), gallery, next project, gold band.
- Facts: named, typed fields. `location` and `year` (year completed, a whole number) are required. `client`, `floorArea` (m²), `storeys`, `lod` (one of six levels), `software` (a list), and `duration` (short text) are optional, and a missing fact is simply absent from the panel.
- Write up: one to four titled sections, each made of paragraphs that allow emphasis marks.
- Photos: the existing `image` is the tile and the cover, and the gallery holds 2 to 9 more. The wall is the same as `/project`'s, with no captions (alt text only), no hover, and no enlarging.
- Tiles: a visible "Read more" cue from content, the whole tile one link, and the home tiles linked with the photo zoom.
- Getting around: a wrapping next project link, an "All projects" back link, a service line that links to its service page, and the nav marking Projects as the section.
- Head: a derived title and description, with an optional `seo` override on each entry.
- Shared copy: `projectPage.tileCue` and `projectPage.detail` (including a shared detail CTA), plus `home.projectShowcase.cue`.
- Visible `h2`s on the facts panel and the gallery, and motion like the sibling pages.
- Placeholder write ups, facts, and Pexels photos for now.
- Calls made at write time:
  - The route is `src/pages/project/[slug].astro` beside the existing `project.astro`. Astro builds both, so `/project` does not move (runner up: rename `project.astro` to `project/index.astro`, which changes a file for no gain).
  - `getStaticPaths` reads `DEFAULT_LOCALE`, as the service route does, and passes each page its project and the next project as props, so the route reads no collection a second time (runner up: look the project up by slug in the page body).
  - The pure helpers live in a new `src/lib/project-detail.ts`: `projectHref`, `nextProject`, `projectFacts` (the ordered, formatted `{ label, value }` rows, absent facts dropped), and `projectHead` (the derived title and description). This follows `src/lib/service-page.ts` and keeps formatting out of components (runner up: inline in the route, where it cannot be checked on its own).
  - The `/project` intro is reused by giving `IntroBand` one optional `context` prop holding both links (both or neither, so no half state exists), plus `entranceFrom`, rather than a named slot, so the band stays data in and markup out (runner up: a second intro component that copies the first).
  - The wall's geometry (grid classes, `widths`, `sizes`) moves into `src/components/project/wall.ts`, imported by `ProjectGallery` and the new `ProjectPhotos`. Captions and links stay in each component (runner up: one wall component with caption and link variants, which mixes two jobs).
  - The cover is wider than the tile (21:9 on a desktop) and loads eagerly with high fetch priority, because it is the page's largest paint (runner up: the tile's 5:4 shape, which would push the write up below the fold on every screen).
  - The project photo links move to `w=2400`, because a 1600px original would be upscaled by a 1920px window (runner up: cap the cover's width, which leaves a band of white beside it on large screens).
  - The facts panel comes first on phones, because the facts are the fast read and the write up the slow one. At `lg` it moves to the right column with no change to the DOM order, and it holds nothing focusable, so the tab order is unaffected (runner up: write up first on phones).
  - The gallery band is `tint`, which keeps the white and tint rhythm between the white story band and the white next project band (runner up: white, which leaves three white bands in a row).
  - A tile link's name is the project title, and the cue is `aria-hidden`, so a screen reader hears six distinct names rather than six "Read more"s (runner up: "Read more" in the name, which fails to tell the links apart out of context).
  - The next project link sits in its own quiet, narrow, white band, separate from the gallery, so the gallery stays only photos (runner up: put it under the wall).
  - The header's section marking is one generic prefix rule, not a special case for Projects, so a future `/about-us/<x>` gets it for free (runner up: a hardcoded `/project` check).
  - The `projects` schema goes strict, so an optional fact with a typo fails loudly instead of vanishing (runner up: leave it loose, the way it is today).

**Implementation skills**: `astro` (`astrolicious/agent-skills`, `.agents/skills/astro/`) · `tailwind-4-docs` (`lombiq/tailwind-agent-skills`, `.agents/skills/tailwind-4-docs/`) · `zod` (`pproenca/dot-skills`, `.agents/skills/zod/`)

## Rationale

Reasoning and options: see [rationale.md](rationale.md).

## Feature design

**Design source**: no new reference. Build from `docs/design.md` and the existing pages: the `/project` intro and photo wall (spec 0014), the gold `CtaBand`, the `Card` link pattern, and the home showcase. Where a pixel value is not fixed by an AC, follow the nearest existing band.

**Page composition** (`/project/<slug>`):

| Order | Band | Surface | Component | Motion |
|---|---|---|---|---|
| 1 | Intro: back link, service link, ruled `h1`, summary | `white` `Section` | `src/components/project/IntroBand.astro` (extended) | CSS load entrance, steps 0 to 2 |
| 2 | Cover photo | white band, no maximum width | `src/components/project/ProjectCover.astro` (new) | CSS load entrance, step 3 |
| 3 | Story: write up beside the facts panel | `white` `Section` | `src/components/project/ProjectStory.astro` (new) | scroll reveal on the facts panel and each section |
| 4 | Gallery: `h2` and the photo wall | `tint` band, no maximum width | `src/components/project/ProjectPhotos.astro` (new, geometry from `wall.ts`) | scroll reveal on the heading block, stagger on the tiles, rule draws |
| 5 | Next project (two or more projects only) | `white` `Section`, `narrow` | `src/components/project/NextProject.astro` (new) | none |
| 6 | Closing call to action | gold band | `src/components/ui/CtaBand.astro` | none |

**Component inventory**:

| Component | Status | Change |
|---|---|---|
| `Section`, `Emphasis`, `CtaBand`, `Image`, `heading-rule`, `entrance`, `reveal.ts`, `styles.ts` | existing | none |
| `Icon` | existing | adds the `arrow-left` glyph (stroke `M19 12H5M11 6l-6 6 6 6`, the mirror of `arrow-right`) |
| `IntroBand` (`src/components/project/`) | existing, extended | optional `context?: { backLink: Link; service: Link }` and `entranceFrom?: number` (default 0). With `context`, a block above the `h1` holds both links and takes step `entranceFrom`, and the `h1` and paragraph follow. Without it, the output is identical to today |
| `wall.ts` (`src/components/project/`) | new | exports the wall's grid class (`grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3`), the tile frame class, `widths`, and `sizes`, as literal strings inside `cx('…')` |
| `ProjectGallery` | existing, changed | imports `wall.ts`. Each tile's `h2` holds one stretched link to `projectHref(slug)`, and the strip gains the `aria-hidden` cue. New prop `cue: string`. The `<li>` gains the `link-focus:` ring classes. The doc comment is rewritten |
| `ProjectCover` | new | props `image`. Renders the whole band |
| `ProjectStory` | new | props `sections` (the `writeUp`), `factsHeading`, `factsHeadingId`, `facts: readonly { label: string; value: string }[]`. Renders the inside of its `Section` |
| `ProjectPhotos` | new | props `heading`, `headingId`, `photos`. Renders the whole band, using `wall.ts` |
| `NextProject` | new | props `label`, `title`, `href`. Renders the inside of its `Section` |
| `ProjectShowcase` (`src/components/home/`) | existing, changed | each tile gets a stretched `h3` link and the `aria-hidden` cue, plus `group`, `isolate`, the zoom classes, and the ring. New prop `cue`, and `ShowcaseProject` gains `slug`. The doc comment is rewritten |
| `Header` | existing, changed | adds `isSectionActive(href)`: the path continues below a non root `href` at a `/` boundary. It gives the active class without `aria-current`, on the bar and in the mobile menu |

**Data model sketch** (content validated by Zod at build; nothing is stored at runtime):

`projects` entries, `src/content/projects/en/<file>.yaml` (many per language), now a `z.strictObject`:

| Field | Type | Required | Notes |
|---|---|---|---|
| `lang` | locale | yes | unchanged |
| `slug` | `text` matching `^[a-z0-9]+(?:-[a-z0-9]+)*$` | yes | new. Unique per language (`checkUnique` in `getProjects`). Placeholders use the file name |
| `title` | `text`, at most 60 characters | yes | unchanged. Also the `h1` and the next link's title |
| `summary` | `text` | yes | unchanged. Also the intro paragraph and the default description |
| `image` | `photoSchema` | yes | unchanged shape. The tile and the cover. Links move to `w=2400` |
| `order` | positive whole number | yes | unchanged, unique per language. Also gives the next project |
| `service` | `reference('services')` | yes | unchanged. Resolved to `{ slug, title }`, now also a link |
| `seo` | the shared `seo` shape (strict) | no | new. Overrides the derived title and description |
| `location` | `text` | yes | new |
| `year` | whole number, 1900 to 2100 | yes | new. The year completed |
| `client` | `text` | no | new |
| `floorArea` | positive whole number | no | new, in m² |
| `storeys` | positive whole number | no | new |
| `lod` | one of `100`, `200`, `300`, `350`, `400`, `500` (a number) | no | new |
| `software` | array of `text`, at least 1 | no | new |
| `duration` | `text` | no | new, for example "8 weeks" |
| `writeUp` | array of 1 to 4 strict `{ heading: text, paragraphs: emphasisText[] (at least 1) }` | yes | new |
| `gallery` | array of 2 to 9 strict `{ src: Pexels https link, alt: text }` | yes | new. The same link rule as `photoSchema` (its URL part is extracted and shared), but `alt` is required and `decorative` is not allowed |

`projectPage` entry, `src/content/projectPage/en/project.yaml` (strict), gains:

| Field | Type | Required | Notes |
|---|---|---|---|
| `tileCue` | `text` | yes | the `/project` tiles' cue, "Read more" |
| `detail` | strict object, below | yes | the shared detail page copy |
| `detail.backLink` | `link` | yes | "All projects" → `/project` |
| `detail.factsHeading` | `text` | yes | "Project facts" |
| `detail.factLabels` | strict `{ location, year, client, floorArea, storeys, lod, software, duration }`, each `text` | yes | the `<dt>` labels |
| `detail.areaUnit` | `text` | yes | "m²" |
| `detail.lodPrefix` | `text` | yes | "LOD" |
| `detail.galleryHeading` | `text` | yes | "Gallery" |
| `detail.nextLabel` | `text` | yes | "Next project" |
| `detail.cta` | `callToAction` | yes | the closing band, for example "Have a project like this one?", one sentence, and a "Contact us" button to `/contact-us` |

`home` entry: `projectShowcase` (strict) gains `cue: text`, "Read more".

Relationships: each project references one service (many to one, existing). The write up sections and gallery photos are embedded in their project (one to many). The next project is derived from `order`, not stored. `settings.siteName` feeds the derived title. `projectPage` and `home` reference no project.

**State transitions**: none. The pages are prerendered, and nothing on them changes state.

**API surface**: no endpoint. Prerendered routes:

| Route | Method | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| `/project/<slug>` (new, one per project) | GET (static HTML, built once) | `getStaticPaths` from `getProjects(DEFAULT_LOCALE)`; props `project`, `next` (or none) | the six bands | public | a content error fails the build; an unknown slug serves the 404 page |
| `/project` (changed) | GET (static) | as spec 0014, plus `projectPage.tileCue` | linked tiles | public | as spec 0014 |
| `/` (changed) | GET (static) | as spec 0005, plus `home.projectShowcase.cue` | linked showcase tiles | public | as spec 0005 |

**Value sourcing**:

| Action | Value produced / displayed | Source |
|---|---|---|
| route list | which pages, their slugs | `getProjects(DEFAULT_LOCALE)`, `project.slug` |
| page head | title | `project.seo.title`, else derived `` `${project.title} \| ${settings.siteName}` `` (`projectHead`) |
| page head | description | `project.seo.description`, else `project.summary` |
| intro | back link label and href | `projectPage.detail.backLink` |
| intro | service line text and href | `project.service.title`; href derived `/${project.service.slug}` |
| intro | `h1`, paragraph | `project.title`, `project.summary` |
| cover | photo, alt | `project.image.src`, `project.image.alt` (`""` when `decorative`) |
| story | section headings, paragraphs | `project.writeUp[].heading`, `.paragraphs` |
| story | facts heading | `projectPage.detail.factsHeading` |
| story | which fact rows, in what order | derived in `projectFacts`: the fixed order location, year, client, floorArea, storeys, lod, software, duration, keeping only present values |
| story | fact labels | `projectPage.detail.factLabels.<fact>` |
| story | year value | `String(project.year)` (no grouping) |
| story | floor area value | `Intl.NumberFormat(lang)` on `project.floorArea`, then a space and `projectPage.detail.areaUnit` |
| story | storeys value | `String(project.storeys)` |
| story | LOD value | `projectPage.detail.lodPrefix`, a space, `project.lod` |
| story | software value | `Intl.ListFormat(lang, { type: 'unit' })` on `project.software` |
| story | location, client, duration values | the entry's fields as written |
| gallery | heading | `projectPage.detail.galleryHeading` |
| gallery | photos, alts, order | `project.gallery[]` in content order |
| gallery | grid, `widths`, `sizes` | `src/components/project/wall.ts`, shared with `ProjectGallery` |
| next band | shown or not | derived: `projects.length >= 2` |
| next band | which project | derived in `nextProject`: the entry after this one in `order`, wrapping to the first |
| next band | label, title, href | `projectPage.detail.nextLabel`, `next.title`, `projectHref(next.slug)` |
| closing band | heading, text, button | `projectPage.detail.cta` |
| `/project` tile | href | `projectHref(project.slug)` = `/project/${slug}` |
| `/project` tile | cue | `projectPage.tileCue` |
| home tile | href, cue | `projectHref(project.slug)`, `home.projectShowcase.cue` |
| header | active section | derived: `Astro.url.pathname` continues below a nav `href` at a `/` boundary |
| heading ids | `project-detail-heading`, `project-facts-heading`, `project-gallery-heading`, `project-detail-cta-heading`; write up sections need no id | fixed in the route, the `<band>-heading` rule |
| entrance steps | 0 to 3 | fixed: `IntroBand` `entranceFrom` 0 (links 0, `h1` 1, summary 2), `ProjectCover` step 3 |
| locale | `lang` | `DEFAULT_LOCALE` in `getStaticPaths`, as the service route |

**Key invariants**:

- No visible copy in the route or any project component. Every word, label, and unit comes from content.
- Every project in a language has exactly one page, and its `slug` is unique in that language. Renaming a file never changes a URL; changing `slug` does.
- A project tile, on either surface, is exactly one link with one tab stop, named by the project title. Nothing else inside it is focusable, and its cue is `aria-hidden`.
- Every project tile on the site zooms its photo on hover (`motion-safe`, 105%, 500ms). A gallery tile on a detail page never does, because it is not a link.
- The zoom moves only the `Image`, by `scale`. The entrance and reveal move only the `<li>` or the band blocks, by `translate` and `opacity`. No element takes both.
- The `/project` wall and the detail gallery share one geometry source, `wall.ts`. A change to one changes both.
- White text sits only on `bg-scrim`, never straight on a photo.
- A missing optional fact renders no row. There is never an empty `<dt>` or a placeholder dash.
- The next link never points to the page it is on. With one project there is no next band.
- `output` stays `'static'`, and every route is an HTML file in `dist/client/`.

**Security model**: public, static, read only pages. They take no visitor input, hold no personal data, and make no request at runtime. `client` is a public name the editor chooses to show, and leaving it out is always allowed (for work under NDA). Photos are downloaded and optimised at build from the one allowed host (spec 0006). No compliance scope.

**Configuration required**: none.

**Critical test scenarios**:

- Happy path: from `/project` at 1920px, click Harbour Tower. The page shows the back link, the linked service line, the ruled title, the summary, a 21:9 cover, the write up with the facts panel on the right, the tinted gallery wall, "Next project" with the next title, and the gold band. The back link returns to `/project`, the service link opens its service page, and the next link opens the next project. Verifies **AC-1**, **AC-2**, **AC-5** to **AC-11**.
- Wrap and single: on the project with the highest `order`, the next link goes to the lowest. With every other `en` project moved aside temporarily, the next band is absent and the build passes. Verifies **AC-10**.
- Facts: a full panel shows eight rows in order with `42,000 m²`, `LOD 300`, and `Revit, Navisworks` style values. The project without client and size shows no such rows and no gaps. Verifies **AC-8**, **AC-19**.
- Build guards: a duplicate `slug`, a `slug` with a capital, a `gallery` of 1 photo, a gallery photo with no `alt`, a `lod` of 250, a `writeUp` of 5 sections, and a typo key (`floorarea`) each fail the build, naming the file and the field. Verifies **AC-3**, **AC-4**.
- Tiles: on `/project` and on the home page, Tab moves one stop per tile, the ring wraps each whole tile, a screen reader names each link by its title, the cue shows but is not announced, the pointer shows over the whole tile, and hovering zooms only the photo (reduced motion: no zoom). Verifies **AC-14**, **AC-15**.
- Nav: on a detail page, Projects shows the active style with no `aria-current`. On `/project` it has `aria-current="page"`. Verifies **AC-13**.
- Responsive: at 360px, 768px, 1024px, and 1920px there is no sideways scroll, the cover changes ratio at `md` and `lg`, the facts panel comes first on a phone and sits in the right column at 1024px and up, a temporary 80 character `location` wraps inside the panel, the gallery goes from one to two to three columns, and a temporary 60 character title still fits with its cue on both tile surfaces. Verifies **AC-16**.
- Head: Harbour Tower's tab reads "Harbour Tower | BIM Delivery". After adding a temporary `seo` override, it reads the override. Verifies **AC-12**.
- Motion: on load the intro and the cover move in. Scrolling reveals the facts, sections, gallery heading, and tiles, and the rules draw. With JavaScript off and with reduced motion, everything is simply shown. `/project`'s intro still moves exactly as before. Verifies **AC-18**, **AC-6**.
- Gates: check, lint, build, one HTML file per route (eight plus six), and no `astro-island` on a detail page. Verifies **AC-21**.

## Build plan

Skateboard: first one whole detail page stands up, still, for every project, reachable by URL. Then the tiles open the way in, so the feature is usable end to end. Then it moves, and finally it is written down and gated.

**Milestone 1: every detail page, still**

1. Content model in `src/content.config.ts`: extract the Pexels URL rule from `photoSchema` and share it; make `projects` a `z.strictObject` and add `slug`, `seo`, the facts, `writeUp`, and `gallery`; add `tileCue` and `detail` to `projectPage`; add `cue` to `home.projectShowcase`. In `src/lib/content.ts`, add a `checkUnique` on `slug` in `getProjects`, and add `slug` to the resolved `Project`. Satisfies **AC-3**, **AC-4**.
2. Placeholder content: `slug` and the new fields in all six project entries, the photo links moved to `w=2400`, the galleries (2, 9, and 3 to 6 photos), the `CREDITS.md` rows, the `projectPage` `tileCue` and `detail` copy, and the home `cue`. Satisfies **AC-7**, **AC-19**.
3. `src/lib/project-detail.ts`: `projectHref`, `nextProject`, `projectFacts`, and `projectHead`, all pure. Satisfies **AC-8**, **AC-10**, **AC-12**.
4. Add the `arrow-left` glyph to `Icon`, and extend `IntroBand` with `context` and `entranceFrom`. Confirm `/project` is unchanged. Satisfies **AC-6**.
5. Move the wall geometry into `src/components/project/wall.ts`, and switch `ProjectGallery` to it with no visible change. Satisfies **AC-9**.
6. Build `ProjectCover`, `ProjectStory`, `ProjectPhotos`, and `NextProject`. Satisfies **AC-7** to **AC-10**, **AC-17**.
7. Compose `src/pages/project/[slug].astro`: `getStaticPaths` with `project` and `next` props, `getProjectPage` and `getSettings`, the head from `projectHead`, the six bands, `CtaBand` from `detail.cta`, and the heading ids. Satisfies **AC-1**, **AC-2**, **AC-5**, **AC-11**, **AC-12**, **AC-17**.
8. Preview at 360px, 768px, 1024px, and 1920px, then run the facts, wrap and single, head, and build guard drills. Satisfies **AC-3**, **AC-8**, **AC-10**, **AC-12**, **AC-16**.

**Milestone 2: the way in**

9. `ProjectGallery`: the stretched title link, the cue from `projectPage.tileCue` (passed by `project.astro`), and the `link-focus:` ring. Rewrite the doc comment. Satisfies **AC-14**.
10. Home `ProjectShowcase`: the stretched `h3` link, the cue from `home.projectShowcase.cue` (passed by `index.astro` along with each `slug`), the ring, and the photo zoom (`group`, `isolate`, the `Image` classes). Rewrite the doc comment. Satisfies **AC-15**.
11. `Header`: `isSectionActive` on the bar and in the mobile menu. Satisfies **AC-13**.
12. Check with a keyboard, a mouse, reduced motion, touch emulation, and a screen reader name check, and run the 60 character caption drill on both tile surfaces. Satisfies **AC-14** to **AC-16**.

**Milestone 3: the page moves**

13. The entrance steps on the intro and cover, `data-reveal` on the facts panel, the write up sections, and the gallery heading block, `data-reveal-stagger` on the gallery list, `data-heading-rule` on both rules, and the `reveal.ts` import in the route. Check with JavaScript off and with reduced motion, and confirm `/project` still moves as before. Satisfies **AC-18**.

**Milestone 4: written down and gated**

14. Update `docs/design.md` and `/styleguide` as AC-20 lists. Satisfies **AC-20**.
15. Run `pnpm check`, `pnpm lint`, and `pnpm build`. Confirm one HTML file per route (eight plus six), no `astro-island` on a detail page, and the gold class search. Satisfies **AC-21**.

## Consequences

**Positive**:

- The photos finally lead somewhere. Every project tile on the site is one clear link with one rule for hover, focus, and naming, which closes spec 0014's two follow ups.
- A project page is one content file. Adding a project, rewording its write up, or swapping its photos needs no code, and a mistake fails the build by name.
- Typed facts mean every panel reads the same, and numbers are formatted for the locale in one place, ready for a second language.
- No script, dependency, token, or colour. The pages are plain prerendered HTML, so they are fast and fully readable by search engines.
- The service line links each project to the service it shows, which helps visitors and gives search engines a clear path from the work to the offer.

**Negative / tradeoffs**:

- Six placeholder case studies and about 30 placeholder photos are a lot of content to replace before launch, and they read as plausible, so someone must remember they are not real.
- Every photo is downloaded and resized at build, and moving to `w=2400` makes each download larger. Expect the build to slow by tens of seconds, and a Pexels outage or a removed photo fails the build.
- The strict schema means an editor's first try often fails the build. That is the point, but it is friction.
- A derived title can exceed 60 characters (a 60 character name plus the site name). Search engines will cut it off unless the entry sets an `seo` override.
- The summary doubles as the meta description, so a very short summary (under about 50 characters) makes a thin description.
- The cover band is a second band with no maximum width, and the gallery tint band a third. Exceptions to the frame keep growing, though each is written down.
- No enlarging means a visitor cannot study a photo in detail. The 1600px gallery sizes keep the wall sharp, but not zoomable.
- Changing a `slug` breaks any shared link to the old URL until redirects exist (in the scope's Deferred list).

**Neutral**:

- The home tiles now zoom on hover, which supersedes spec 0005's AC-30. `/project`'s tiles now link, which supersedes spec 0014's AC-7. Both specs get a note pointing here.
- `IntroBand` and the `projects` schema change shape, so `/styleguide` and the `/project` route need small updates.
- The header's prefix rule is generic, so any future nested route gets section marking with no extra code.

## Follow-up

- [ ] When a second language arrives, decide whether slugs are translated (the `slug` field allows it) and how `getStaticPaths` covers more than `DEFAULT_LOCALE`.
- [ ] Feature 11 (SEO foundation): each detail page wants `CreativeWork` or `Article` structured data, the cover as its social preview image, and its URL in the sitemap.
- [ ] Redirects (Deferred in the scope): a changed `slug` or a removed project should redirect rather than 404 once the site is live.
- [ ] If visitors ask to see photos larger, revisit a lightbox. It would be the fifth script, so it needs the strong reason `design.md` asks for.
- [ ] Replace the placeholder write ups, facts, and photos with the real portfolio before launch, including real `client` names only where the client agrees.
