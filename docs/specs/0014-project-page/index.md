# 0014. Compose the Project page as an intro, a full width photo gallery, and the gold call to action

**Date**: 2026-09-28
**Status**: In Progress
**Scope feature**: 9, Project page (`docs/scope/scope.md`)

## Summary

The Project page becomes a photo wall, the gallery layout of your reference screenshot. It has three bands. First comes a white intro with the ruled "Our projects" heading and one paragraph. Then comes a gallery that runs the full width of the window, three photos across on a desktop, with thin 8px white seams between them. Last comes the gold call to action band that links to Contact.

Every tile is the same 5:4 shape. Its photo fills the tile, and a see through dark strip along the bottom holds the service name and the project title in white, readable over any photo. The tiles are not links yet, because there are no project detail pages; when those arrive, each tile becomes one "Read more" link. Until then a pointer hovering a tile slowly zooms its photo inside the tile, a touch of life that promises no click (the cursor stays an arrow). Every word and photo comes from content, the page adds no script (it reuses the site's load entrance and scroll reveal), and a sixth placeholder project fills the second row.

## Requirements

**User stories**:

- As a prospective client, I want to see the company's work as a wall of big building photos, so I can judge the kind and scale of projects at a glance.
- As a visitor reading a tile, I want the service and the project name in plain sight over every photo, so I know what kind of BIM work each one shows.
- As a visitor who likes what they see, I want a clear next step at the end of the page, so I can get in touch.
- As someone editing the site, I want to add, remove, or reorder a project, or change any word on the page, in a content file, never in a component.

**Acceptance criteria**:

- **AC-1**: `/project` renders exactly three bands, in this order, then the footer: the intro band (AC-4), then the gallery band (AC-5) or, with no projects, the empty state (AC-9), then the gold closing band (AC-10). The footer is unchanged, including its certification panel.
- **AC-2**: Every heading, paragraph, caption, and photo on the page comes from content: the `projectPage` entry, the `projects` collection, and each project's service `title` (resolved by `getProjects`). `src/pages/project.astro` and every component it uses contain no visible copy of their own. The page title and description come from `projectPage.seo`.
- **AC-3**: The `projectPage` entry is a `z.strictObject` with exactly the fields in *Data model sketch*: `intro` becomes `emphasisText`, and `cta` is new, using the shared `callToAction` shape. An unknown or leftover key fails the build naming the key. A `projects` entry whose `title` is longer than 60 characters fails the build, naming the file and the field.
- **AC-4**: The intro band is a white `Section` labelled by its `h1` (id `project-heading`). The `h1` (`projectPage.heading`) is left aligned, shown in capitals by CSS only (`uppercase`), with the shared `heading-rule` under it (`inline-block`, `data-heading-rule`). Under it is `projectPage.intro` as one left aligned `text-lead` paragraph inside the narrow reading width, rendered through `Emphasis` on the `light` surface, so `**bold**` and `==gold==` work.
- **AC-5**: The gallery band is its own component (not a `Section`), a white band that borrows the band frame's side gutters (16px, 24px, 32px) and bottom padding (64px, 80px, 96px) from `styles.ts`, with no top padding and **no maximum width**: the wall runs the full window width minus the gutters. It holds one `<ul>` labelled by the `h1` (`aria-labelledby="project-heading"`), with one `<li>` per entry of `getProjects(lang)`, in `order`. The grid is one column below `md`, two at `md` (768px), three at `lg` (1024px) and up, with an 8px gap (`gap-2`) across and down. A short last row starts from the left.
- **AC-6**: Every tile is a fixed 5:4 box (`aspect-5/4`), `rounded-ui`, `overflow-hidden`, on a `bg-black` fill that shows only while a photo loads. The photo is an optimised `Image` covering the box (`object-cover`, centred), with its content `alt` (or `alt=""` when the entry is `decorative`), `widths` 400, 640, 960, 1280, 1600, and `sizes` `(min-width: 64rem) 33vw, (min-width: 48rem) 50vw, 100vw`. The first three tiles load eagerly and every later one lazily. The caption is a full width `bg-scrim` strip flush with the tile's bottom edge, left aligned, all white: the project's service `title` as a small line (`text-small font-semibold tracking-wide uppercase`, the home showcase's service line), then the project `title` as an `h2` at `text-h3` weight 600, `text-balance`. The tile shows no summary.
- **AC-7** (revised 2026-09-28): Tiles are not links. A tile holds no link, button, or other focusable element, and the cursor stays the default, hovered or not. On a pointer that can hover, hovering a tile slowly zooms its photo: the `Image` grows from its centre to `scale-105` over 500ms with an ease out, clipped by the tile's rounded corners, and eases back the same way when the pointer leaves. Only the photo moves: the tile's box, its caption strip, and everything around the tile stay exactly where they are. The zoom is `motion-safe` only, so with reduced motion asked for the photo never grows (not even instantly). A tap on a touch screen changes nothing, since `hover:` applies only where a pointer can hover. Tabbing through the page goes from the header straight past the gallery to the closing band's link.
- **AC-8**: At 360px, 768px, 1024px, and 1920px wide the page has no sideways scroll, every tile keeps its 5:4 shape, and every caption sits wholly inside its tile, including a 60 character title (checked with a temporary long title). Nothing on the page shifts as the photos load, because each tile's box is reserved before its photo arrives.
- **AC-9**: When the page's language has no projects, the gallery band and its list are not rendered at all. In their place is a white `Section` with the narrow width, labelled by its `h2` (id `project-empty-heading`), centred: `projectPage.emptyState.heading` as the `h2` (no gold rule) and `projectPage.emptyState.text` as one `text-lead` paragraph. The closing band still follows, and the build passes.
- **AC-10**: The closing band is the existing `CtaBand`, fed `projectPage.cta` (heading, text, button), with `headingId` `project-cta-heading`. Its button is the `/contact-us` link from content. `CtaBand` itself is unchanged.
- **AC-11**: The page has one `h1` (the intro), one `h2` per project tile (or the empty state's `h2`), and the closing band's `h2`. Every band with a heading points at it with `aria-labelledby`, and the gallery list points at the `h1`.
- **AC-12**: On page load, with no script, the intro's `h1` and paragraph fade and rise in through the existing `entrance` utility (`--entrance-step` 0 and 1), and the first three tiles take it too, at steps 2, 3, and 4. The intro band carries no `data-reveal`. The `<ul>` carries `data-reveal-stagger`, so below the fold each tile fades in after the one before as it scrolls into view. The `h1`'s gold rule draws with the scroll direction. The page imports `reveal.ts`. The empty state and the closing band do not move. No new script and no new dependency; the entrance helpers move from `src/components/service/entrance.ts` to `src/components/ui/entrance.ts` with the service bands' imports updated and their behaviour unchanged. With JavaScript off, a failed script, or reduced motion asked for, everything is simply shown.
- **AC-13**: A sixth placeholder project exists, `src/content/projects/en/<slug>.yaml`, with `order: 6`, `service: en/bim-coordination` (so each service has two), a title of at most 60 characters, a one line summary, and a Pexels building photo on `images.pexels.com` with a non empty `alt`, logged in `src/assets/images/CREDITS.md` like the other five. The home project showcase still shows the three lowest `order` projects, unchanged.
- **AC-14**: `docs/design.md` records the project gallery: a component entry (full width band, 5:4 tiles, the scrim strip caption, no links yet, the photo zoom on hover), the 8px gap as the gallery's one written exception to the 24px grid gap, the project tile caption added to the existing "white on scrim, 5.74 at worst" contrast row, the project page in the motion list, and `project.astro` in the invariant's list of pages importing `reveal.ts`. The dev `/styleguide` gains a gallery tile built from the real `projects` entries.
- **AC-15**: `pnpm check`, `pnpm lint`, and `pnpm build` pass. `dist/client/project/index.html` exists, `dist/client/` still has one HTML file per route, and `/project` contains no `astro-island`. The gold class search in `design.md` finds only its written exception.

## Decision

**Chosen option**: Option 1: a content driven three band page, with a full width 5:4 photo wall of scrim captioned tiles that do not link yet.

`project.astro` composes the intro `Section`, a new `ProjectGallery` band (or the empty state), and the existing `CtaBand`, from a strict `projectPage` entry and `getProjects(lang)`. It reuses the entrance, the scroll reveal, and the heading rule, and adds no script.

**Settled choices** (the engineer's picks and the calls made at write time, reasons in `rationale.md`):

- Bands: intro, gallery, gold closing band. The gallery runs the full window width inside the band gutters.
- Tiles: 8px seams, a fixed 5:4 box, one column, then two at `md`, then three at `lg`. The caption is a full width scrim strip at the foot with the service line above the title.
- No link yet. "Read more" arrives with the project detail pages.
- Hover (revised 2026-09-28): a slow zoom of the photo only, 105% over 500ms, the cursor staying the default. The Project page only; the home showcase keeps its still photo (spec 0008).
- A sixth placeholder project so the desktop wall is two full rows.
- No service filter. The empty state is the existing heading and text, with the closing band still below.
- Motion matches the sibling pages: CSS entrance on load, the scroll reveal stagger on the tiles, and the rule drawing on the `h1`.
- Content: `projectPage` goes strict, `intro` takes emphasis marks, `cta` uses the shared `callToAction` shape, and project titles are capped at 60 characters.
- Calls made at write time:
  - Tile titles are `h2`s, so the heading order never skips a level (runner up: `h3` under a hidden `h2`).
  - The gallery is its own band component borrowing the frame, not a new `Section` width, because `Section` always renders a named `<section>` and the wall needs no second name (runner up: `Section width="full"`).
  - The first three tiles load eagerly, because on a desktop they are the page's largest paint (runner up: all lazy).
  - Only the first three tiles take the load entrance, never every tile, so a long list never stacks seconds of delay (runner up: every tile, as the service bands do).
  - The entrance helpers move to `ui` now that two pages share them, the precedent `PresenceBand` set (runner up: import across folders).
  - Tile corners use `rounded-ui` (the site rule for every image) rather than the screenshot's square corners.
  - The empty state heading carries no gold rule, since the `h1`'s rule sits just above it.
  - The zoom is `motion-safe`, so reduced motion gets no zoom at all (runner up: lean on the global reduced motion cut, which would snap the photo straight to 105%, a jump rather than a calm).
  - The zoom sets no `will-change`: a browser promotes a transitioning `scale` on its own, and keeping six or more full width photos on their own layers all the time costs memory for nothing (runner up: `will-change-transform` on every photo).
  - 500ms matches the home intro cards' gold hover line, the site's slowest hover; a photo zoom reads calm, not snappy (runner up: 300ms, the cards' lift).

**Implementation skills**: `astro` (`astrolicious/agent-skills`, `.agents/skills/astro/`) · `tailwind-4-docs` (`lombiq/tailwind-agent-skills`, `.agents/skills/tailwind-4-docs/`) · `zod` (`pproenca/dot-skills`, `.agents/skills/zod/`)

## Rationale

Reasoning and options: see [rationale.md](rationale.md).

## Feature design

**Design source**: the engineer's reference screenshot of a project gallery (three equal photo tiles across, thin white seams, a white title and "Read More" at each tile's bottom left). Everything else follows `docs/design.md` and the About and Contact pages. Where the screenshot and an AC disagree, the AC wins. The screenshot's text straight on the photo, its square corners, and its "Read More" links are deliberately replaced by the scrim strip (guaranteed contrast), `rounded-ui`, and no link until detail pages exist. Pixel spacing that no AC fixes follows the screenshot.

**Page composition**:

| Order | Band | Surface | Component | Motion |
|---|---|---|---|---|
| 1 | Intro: ruled `h1`, marked paragraph | `white` `Section` | `src/components/project/IntroBand.astro` | CSS load entrance (steps 0, 1) |
| 2a | Gallery: the photo wall (one or more projects) | white band, full width inside the gutters | `src/components/project/ProjectGallery.astro` (frame from `styles.ts`) | first three tiles CSS load entrance (steps 2 to 4); every tile in the scroll reveal stagger |
| 2b | Empty state (no projects), in place of 2a | `white` `Section`, `narrow` | inline in `project.astro` | none |
| 3 | Closing call to action | gold band | `src/components/ui/CtaBand.astro` | none |

**Component inventory**:

| Component | Status | Change |
|---|---|---|
| `Section`, `Emphasis`, `CtaBand`, `Image`, `heading-rule`, `entrance`, `reveal.ts` | existing | none |
| `styles.ts` band frame | existing | adds `bandPaddingBottomClass` (`pb-16 md:pb-20 lg:pb-24`), the bottom half of `bandPaddingClass`, so the gallery's rhythm stays in one place |
| `entrance.ts` | existing, moved | from `src/components/service/` to `src/components/ui/`; the service bands' imports updated, no behaviour change |
| `IntroBand` (`src/components/project/IntroBand.astro`) | new | props `heading`, `headingId`, `intro` (emphasis text). Renders only the inside of its band, as the About and Contact intro bands do |
| `ProjectGallery` (`src/components/project/ProjectGallery.astro`) | new | props `labelledBy` (the `h1` id), `projects: readonly Project[]`, `entranceFrom` (the first tile's step, 2). Renders the whole band and the list, tiles inline (no separate tile component, since one caller). Each `<li>` is a `group`, and its `Image` carries the hover zoom (AC-7). Never called with an empty list |

**Data model sketch** (content validated by Zod at build; nothing is stored at runtime):

`projectPage` entry, `src/content/projectPage/en/project.yaml`, now a `z.strictObject`:

| Field | Type | Required | Notes |
|---|---|---|---|
| `lang`, `seo` | shared | yes | unchanged |
| `heading` | `text` | yes | the `h1`, "Our projects" |
| `intro` | `emphasisText` (was `text`) | yes | the intro paragraph; `**` and `==` marks allowed |
| `emptyState` | strict `{ heading: text, text }` | yes | unchanged fields |
| `cta` | `callToAction`: strict `{ heading: text, text, button: strict link }` | yes | new, the closing band. Placeholder copy: a heading such as "Have a project like these?", one sentence, button "Contact us" to `/contact-us` |

`projects` entries, `src/content/projects/en/<slug>.yaml` (many per language), one change:

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | `text`, **at most 60 characters** | yes | new cap; the longest today is 17 |
| `lang`, `summary`, `image`, `order`, `service` | unchanged | yes | `order` unique per language (existing check); `service` references one `services` entry |

Relationships: each project references one service (N:1); `getProjects` resolves it to `{ slug, title }` and fails the build on a missing one (existing). `projectPage` references nothing. A sixth entry is added (AC-13).

**State transitions**: none. The page is prerendered, and nothing on it changes state.

**API surface**: no endpoint. One prerendered route:

| Route | Method | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| `/project` | GET (static HTML, built once) | the page's locale (`Astro.currentLocale`, resolved by `resolveLocale`) | the three bands | public | a content error fails the build, never the page |

**Value sourcing**:

| Action | Value produced / displayed | Source |
|---|---|---|
| page head | title, description | `projectPage.seo.title`, `.description` |
| intro band | `h1` text, paragraph | `projectPage.heading`, `projectPage.intro` |
| gallery | which projects, in what order | `getProjects(lang)`, sorted by `order` |
| gallery | empty or not | derived: `projects.length === 0` |
| tile | photo, alt | `project.image.src`, `project.image.alt` (`""` when `decorative`) |
| tile | service line | `project.service.title`, resolved by `getProjects` from the `services` entry |
| tile | title | `project.title` |
| tile | eager or lazy | derived: list index below 3 |
| tile | hover zoom (105%, 500ms, ease out, `motion-safe`) | fixed in `ProjectGallery` classes, not content: `group` on the `<li>`, `transition-[scale] duration-500 ease-out motion-safe:group-hover:scale-105` on the `Image` |
| tile | entrance step, or none | derived: `entranceFrom + index` for index below 3 (the helpers in `src/components/ui/entrance.ts`), none after |
| empty state | heading, text | `projectPage.emptyState.heading`, `.text` |
| closing band | heading, text, button label and href | `projectPage.cta` |
| heading ids | `project-heading`, `project-empty-heading`, `project-cta-heading` | fixed in `project.astro`, the `<band>-heading` rule |
| locale | `lang` | `resolveLocale(Astro.currentLocale)` |

**Key invariants**:

- No visible copy in `project.astro`, `IntroBand`, or `ProjectGallery`.
- A tile's box is always 5:4 and its caption always fits inside it. The 60 character cap is what guarantees the fit; loosening it needs the AC-8 check again.
- A tile contains nothing focusable and never promises a click (no pointer cursor, no link label) until detail pages exist. Its one hover response is the photo zoom; the tile's box, its caption, and the layout never move on hover. A tile that becomes a link does so wholly (one link per tile), keeping the zoom and adding the pointer cursor and the light tone focus ring.
- The hover zoom moves only the `Image`, by the `scale` property; the load entrance and the scroll reveal move only the `<li>`, by `translate` and `opacity`. No element takes both, so neither ever overwrites the other.
- The `<li>` keeps `isolate` and `overflow-hidden` together: the stacking context is what keeps the zoomed photo clipped to the rounded corners while it grows (without it, WebKit can draw square corners for the length of the transition).
- White caption text sits only on `bg-scrim`, never straight on a photo.
- No element takes both the entrance and `data-reveal` itself. A tile is a stagger child, which is the spec 0012/0013 exception, and it applies only to the first three.
- The gallery is the only band with no maximum width, and the 8px seam is the only grid gap other than 24px. Both are written down in `design.md`.

**Security model**: a public, static, read only page. It takes no visitor input, holds no personal data, and makes no request at runtime. Photos are downloaded and optimised at build from the one allowed host (spec 0006). No compliance scope.

**Configuration required**: none.

**Critical test scenarios**:

- Happy path: at 1920px, `/project` shows the intro, then six 5:4 tiles in two full rows of three, each with its service line and title on the scrim strip, then the gold band; its button goes to `/contact-us`. Verifies **AC-1**, **AC-4** to **AC-6**, **AC-10**, **AC-13**.
- Responsive: at 360px one column, at 768px two, at 1024px three; no sideways scroll; a temporary 60 character title fits its caption at every width. Verifies **AC-5**, **AC-8**.
- Empty: with every `en` project moved aside temporarily, the gallery is absent, the empty state heading and text show, the gold band follows, and the build passes (the home showcase is absent too, as spec 0005 already says). Verifies **AC-9**.
- Build guard: a 61 character title, and a leftover key in `project.yaml`, each fail the build naming the file and the field. Verifies **AC-3**.
- Keyboard: Tab from the header reaches the gold band's link with no stop inside the gallery. Verifies **AC-7**, **AC-11**.
- Hover: with a mouse, hovering a tile slowly zooms only its photo, the corners stay rounded throughout (check Safari or another WebKit browser if you have one), the caption and the neighbouring tiles do not move, and the cursor stays an arrow; moving away eases it back. With reduced motion on, hovering changes nothing. In touch emulation, a tap changes nothing. Hovering a tile while it is still fading in or revealing does not break either motion. Verifies **AC-7**.
- Motion: on load the `h1`, the paragraph, and the first row move in; scrolling down on a phone reveals the later tiles one after another; with JavaScript off, and with reduced motion, everything is simply shown. Verifies **AC-12**.
- Gates: `pnpm check`, `pnpm lint`, `pnpm build`, one HTML file per route, no `astro-island` on `/project`. Verifies **AC-14**, **AC-15**.

## Build plan

Skateboard: the whole page stands up still first (usable on its own), then it moves, then it is written down and gated.

**Milestone 1: the whole page, still**

1. Content model: make `projectPage` a `z.strictObject`, switch `intro` to `emphasisText`, add `cta: callToAction`; cap `projects.title` at 60. Add the placeholder `cta` copy to `project.yaml`. Satisfies **AC-2**, **AC-3**, **AC-10**.
2. Add the sixth placeholder project with a Pexels building photo, and its `CREDITS.md` row. Satisfies **AC-13**.
3. Add `bandPaddingBottomClass` to `src/components/ui/styles.ts`. Satisfies **AC-5**.
4. Build `src/components/project/IntroBand.astro`. Satisfies **AC-4**.
5. Build `src/components/project/ProjectGallery.astro`: the full width band, the labelled list, the 1, 2, 3 column grid with the 8px gap, and the tiles (5:4 box, optimised photo, eager for the first three, scrim strip caption, `h2` titles, nothing focusable). Satisfies **AC-5** to **AC-7**, **AC-11**.
6. Compose `src/pages/project.astro`: `getProjectPage` and `getProjects` together, the intro, the gallery or the inline empty state, and `CtaBand`, with the three heading ids. Satisfies **AC-1**, **AC-2**, **AC-9** to **AC-11**.
7. Preview at 360px, 768px, 1024px, and 1920px, with the 60 character title drill, the empty drill, and the build guard drill. Satisfies **AC-3**, **AC-8**, **AC-9**.

**Milestone 2: the page moves**

8. Move `entrance.ts` to `src/components/ui/`, updating the service bands' imports; confirm a service page still moves as before. Satisfies **AC-12**.
9. Add the entrance to the intro (steps 0, 1) and to the first three tiles (from `entranceFrom`, 2), `data-reveal-stagger` on the list, `data-heading-rule` on the `h1`, and import `reveal.ts` in the page. Check with JavaScript off and with reduced motion. Satisfies **AC-12**.
10. (added 2026-09-28) Add the hover zoom in `ProjectGallery`: `group` on each `<li>` (keeping `isolate` and `overflow-hidden`), and `transition-[scale] duration-500 ease-out motion-safe:group-hover:scale-105` on the `Image`. Rewrite the component's doc comment where it says nothing changes on hover. Check with a mouse, with reduced motion, and in touch emulation. Satisfies **AC-7**.

**Milestone 3: written down and gated**

11. Update `docs/design.md` (the gallery entry, including replacing "never changes on hover" with the photo zoom and why it stays unclickable; the gap exception; the contrast row; the motion list, replacing "the tiles have no hover motion"; the scripts invariant) and add the gallery tile to `/styleguide`, rewording its "hovering a tile changes nothing" note. Satisfies **AC-14**.
12. Run `pnpm check`, `pnpm lint`, `pnpm build`; confirm `dist/client/project/index.html`, one HTML file per route, no `astro-island` on `/project`, and the gold class search. Satisfies **AC-15**.

## Consequences

**Positive**:

- The page reads like the reference: big photos, one even wall, and captions legible over any photo with no contrast check per photo.
- Adding, removing, or reordering a project is one content file; the grid takes any count.
- No new script, dependency, token, or colour. `CtaBand` finally has a page using it.
- The fixed 5:4 box reserves each tile's space, so the page does not jump as photos load (feature 12's layout shift goal).
- The wall answers a pointer with one class list and no script; the zoom runs on the compositor (the part of the browser that moves layers without redoing layout), so it never shifts the page.

**Negative / tradeoffs**:

- The screenshot's "Read More" is absent until detail pages ship, so a tile promises nothing and offers nothing beyond its photo.
- A fixed 5:4 crop cuts the tops or sides of tall towers and wide campuses; photos must be chosen, or later positioned, with that in mind.
- The gallery is a second exception to the design system's defaults (no maximum width, 8px gap). Each is small, but exceptions accumulate.
- The 60 character cap also binds the home showcase's tiles, and a real project name longer than that must be shortened.
- No pagination or filter: past about 24 projects the page gets long, though lazy loading keeps its weight down.
- A photo that moves under the pointer can still read as clickable to some visitors, a small false hint until detail pages give the tile somewhere to go. The default cursor and the absence of any link label keep it small; it is a conscious bend of the design system's "not a link, do not look like one" rule, like the home intro cards before it.
- The two project tile surfaces now behave differently: the home showcase photo stays still, the Project page photo zooms.
- At 105% the photo is slightly upscaled from the width `sizes` chose, so it softens a little while hovered.

**Neutral**:

- Moving `entrance.ts` touches the service band imports (a path change only).
- With a sixth project, the home showcase is unchanged (it takes the three lowest `order`).
- The scope's done line says "card grid" and "image, title, one line"; this spec replaces that with the photo wall and a service line plus a title, which the engineer chose.

## Follow-up

- [ ] When project detail pages ship (deferred in the scope), make each tile one link with a "Read more" label from content, keeping the photo zoom and adding the pointer cursor and the light tone focus ring; the home showcase tiles follow the same rule.
- [ ] The home showcase (spec 0008) still keeps its photo still on hover. Align both tile surfaces to one hover rule, either when detail pages land or sooner through `/architect` on spec 0008.
- [ ] Once the portfolio passes about 12 projects, decide on a service filter (it would be a fifth script, which `design.md` asks a strong reason for) and on pagination or "load more".
- [ ] Feature 11 (SEO foundation) should cover the project page's structured data (an item list of the projects) alongside the rest.
- [ ] Scope feature 9's done line still describes a "card grid" of "image, title, one line"; `/scope` may want to reword it to the photo wall.
