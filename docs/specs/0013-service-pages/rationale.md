# 0013. Rationale: service pages from ordered content blocks

The decision record behind [index.md](index.md). `/develop` does not need this file.

## Context

Feature 8 turns three route stubs (`/revit-modeling`, `/scan-to-bim`, `/bim-coordination`, one dynamic route per spec 0004) into real service pages. The engineer supplied three reference screenshots for the first three sections, named the fifth (the home page's `PresenceBand`), and left section 2's variants for the other services and all of section 4 to this spec. The one hard requirement on section 4 is that it shares section 2's background, which is either a dark dotted band or the white diagonal stripe from the home page.

The layouts are a sketch for a demo. The engineer expects the client to ask for different layouts per service later, possibly totally different ones. So how cheaply one service's page can diverge from the others matters more than the demo itself.

The same day's revision sharpened that forecast: each service's content will be updated, added to, and cut independently, and whole services will be added and removed. The first version already let a service reorder, add, or drop sections, but four things still tied the services together: restyling a section kind changed it on every page, the presence band read the home page's copy, every page had to open with the intro, and spec 0005's exactly three check stopped the build whenever the number of services changed.

Forces from the project:

- Spec 0004 AC-2: one route, and a fourth service file with no code edit produces a fourth page. The scope says the same ("one template plus three data entries").
- `AGENTS.md`: page content comes from content collections, functional components, zero JavaScript by default, `motion` only in `reveal.ts`, and every page prerendered.
- `docs/design.md`: two light tones only; a dark band is its own component that borrows the band frame and carries `focus-contrast`; the gold rule (gold as text only as `gold-ink` on light surfaces, 2.41:1 otherwise); no icon library; exactly four scripts.
- Spec 0012: the engineer asked for the About capability band to move on load where it starts on screen, so a band that sits still on a large desktop is a known complaint.
- The existing services schema (spec 0002) holds `image`, `deliverables`, `process`, and `cta` for this feature, plus a Markdown body nothing renders.

## Options considered

### Option 1: Ordered, typed content blocks (chosen)

Each service entry lists its sections as blocks with a `type`, validated by a discriminated union; the one route draws them in order through a component per type.

**Pros**: reordering, dropping, or repeating a section is a data edit; a new layout is a new block type any service can use; keeps spec 0004 AC-2 intact.
**Cons**: a deeper, longer YAML file and a harder to read schema; rules such as "one intro, first" need a refinement rather than falling out of the shape.

### Option 2: Fixed five slot template

The route always draws intro, features, audiences, process, presence; only the features band picks a layout.

**Pros**: the flattest schema and the least code; each field sits at a predictable path.
**Cons**: the first client request for a different order or a different section means conditionals in the route or a schema rewrite across all entries.

### Option 3: One page file per service

Each service gets its own `.astro` page composing shared bands.

**Pros**: total freedom per service, the easiest match for a bespoke client design.
**Cons**: breaks spec 0004 AC-2 and the scope's "one template"; three near copies to keep in step; a fourth service needs code.

### Option 4: Fixed template now, blocks later

Build Option 2 for the demo and move to blocks when the client asks.

**Pros**: fastest to the demo.
**Cons**: the move rewrites the schema, all three entries, and the route, at the moment a client is waiting on a change.

## Rationale

The deciding force is the engineer's own forecast: layouts will diverge per service. Option 1 prices that divergence at a data edit or one block type, while keeping the one route rule that Option 3 breaks. Option 2 and Option 4 are cheaper today but defer the same work to a worse moment, with a client waiting. The extra schema depth is a one time cost that Zod's discriminated unions handle cleanly, and the route's switch is no longer than the fixed template would be.

The revision's forecast (every service changing on its own, services coming and going) is Option 3's strongest case, so it was weighed again. Named layouts give the same per service freedom additively: a bespoke look is a new layout used by one entry, and nothing else moves. Option 3 would still make a new service a code change and a sitewide fix one edit per page, which is exactly the churn the forecast predicts. Option 1 stays, with `layout` on every block as the one extension point for looks.

### Settled choices and why

- **YAML, not Markdown** (engineer's pick): every section is structured data now, like home, about, and contact; `==gold==` works through `Emphasis`; the unused body goes. Runner up: keep Markdown and render the body as the intro, which loses `==` and needs a child selector the design mandate avoids.
- **Section 2 per service** (engineer's pick): cards on Revit Modeling `dark`, split on Scan to BIM `light` and BIM Coordination `dark`, so the demo shows both layouts on both backgrounds.
- **Section 4 as process plus contact** (designed here): it reuses the process steps already written per service, gives the page a "how the work runs" beat between who it is for and where the company works, and carries the scope's link back to `/contact-us` without adding a sixth band. Runner up: deliverables plus contact; the deliverables were identical across all three services and said little.
- **Presence reuses `home.presence`** (engineer's pick): the company's regions are company wide; one source.
- **Carousel like the hero** (engineer's pick): the same script, generalised, so behaviour stays identical and no script is added. Renaming it to `carousel.ts` with `data-carousel-*` hooks is the call made here, because a `data-hero-*` hook on a band that is not a hero would mislead the next reader; runner up: keep the hero names and accept that. `CarouselDots` follows from the same reasoning: two copies of the dot markup would drift.
- **Two rows of three audiences** (engineer's pick): at 1024px the band is about 800px, too narrow for six in a row. Runner up: turn `xl` back on, a sitewide change to spec 0003.
- **Existing motion only** (engineer's pick). The entrance on the block after the intro is the call made here: on a 1920x1080 screen the features heading is on screen at load, where the scroll reveal moves nothing, which is exactly the About band complaint spec 0012 fixed. Runner up: accept a still heading there.
- **Icons copied from open licence sets** (engineer's pick): Tabler (MIT) first, for its outline and filled construction glyphs on the 24 unit grid the map already uses; Material Icons (Apache 2.0) filled where Tabler has no solid match. The `strokeWidth` prop is the call made here: the map's fixed stroke of 2 would draw 6.7px lines at 80px, much heavier than the reference's line art.
- **Surface on each block** (engineer's pick): flexible for later client layouts; the demo files keep sections 2 and 4 equal. Runner up: a build check, which would have to be removed the first time a client wants a mix.
- **`PatternBand` as one component with a `surface` prop**: the band's two looks share every structural choice (frame, heading id, slot), and the dark one must be its own `<section>` per design.md, so one component hides that fork from the route. Runner up: two components (`DotBand`, a striped `Section` at each call site), which repeats the fork in the route for every surfaced block.
- **Service bands adapt through `surface` class maps in `styles.ts`**: the same pattern the form fields already use (spec 0011), so the gold rule and the contrast pairs stay in one file. This is the second family allowed to adapt to its background, and `design.md` says so.
- **A `panel` token**: the reference's cards are a near black fill above the dotted black band; covering the dots with a solid fill keeps small text off the pattern. `bg-black` cards would vanish into the band; a translucent white fill would show the dots through.
- **Presence on `tint` after a light band**: two white striped bands side by side read as one band with two headings; `bg-diagonal` on `tint` keeps the presence look and its contrast (the stripe line is the worst pixel either way, `ink` at 4.56:1).
- **Black dots, left aligned text, `gold-ink` words, no rule on the `h1`**: the first three follow WCAG (a gold dot on white is 2.41:1, justified text makes uneven gaps, bright gold words on white fail); the missing rule follows the reference.
- **Photos as new Pexels links** (engineer's pick): the schema's one allowed host; each service keeps its current photo first.

### Settled in the revision: each service changes on its own

- **`layout` on every block now** (engineer's pick): one extension point for every look, one route map keyed by `type/layout`, and a type checker that lists every place a new layout must touch. Runner up: add `layout` to a type only when it needs a second look, which is less to write today but makes the first restyle of each type a schema change plus an edit to every entry using it.
- **A new background is a new layout** (engineer's pick): `surface` stays on `features` and `process`. Runner up: `surface` on every block, which roughly doubles the styling and contrast work now for backgrounds nobody has asked for.
- **Presence shared, with a complete override** (engineer's pick): regions stay one edit for the whole company, and any one service can diverge. All or nothing (a full `content` object, no field by field merge) keeps the rule readable and the schema the same as the home page's. Runners up: every service carrying its own copy (a region change becomes four edits), or no override at all.
- **The intro stays required and first** (engineer's pick): it holds the page's only `h1`; a different opening for one service is a new intro layout. Runners up: letting any first block render the `h1` (every band then handles two heading levels), or a hidden `h1` from `title` (a page with no visible main heading).
- **One YAML file per service** (engineer's pick): reordering is moving lines, and the page rules stay inside the schema. Runner up: one file per section with an `order` number, where adding or deleting is a file operation but reordering means renumbering and the page rules move into a cross file check.
- **The home page picks up to three services by reference** (engineer's pick): adding a service touches nothing else, and the home design keeps its three cards. The list lives in `home.yaml` rather than as a flag on each service, so no service file knows about the home page. It replaces spec 0005's exactly three check, which was always a placeholder for this decision. Runners up: every service in rows of three (ten services would mean four rows on the home page), the first three by `order` (ties nav order to home selection), or keeping the build stop (blocks the very change the engineer expects).
- **With one or two cards, centred at their row of three width**: a lone service card stretched across the band reads as a banner, not a card. Runner up: spec 0005's showcase rule (full width tiles), which suits photos, not narrow illustrated cards.
- **A removed service fails the build while anything points at it** (engineer's pick): every project and the home list must be decided on deliberately. Runner up: an optional project `service`, which would also let a mistyped id pass silently.
- **Old URLs go to the 404 page for now** (engineer's pick): nothing is live, so no search engine or visitor holds these URLs yet; redirects belong with the SEO foundation or launch. Runner up: a redirect list in this spec, a new mechanism for a case that cannot happen before launch.
- **You edit the YAML** (engineer's pick): the build's error messages are the guard rails, and the change recipes in `src/content/README.md` say what to edit. A browser editor stays the scope's separate deferred decision; a list of typed blocks is the shape git based editors model, so this does not close that door.
- **`planServicePage` as a pure function**: the route now derives five things per block (key, presence content, heading id, background and tone, `entranceFrom`). Keeping that as data in and data out follows the project's functional rule and leaves the route as markup only. Runner up: the same derivations inline in the route's frontmatter, which works but mixes logic into the one file that names components.
- **Component files named for their key** (`FeaturesCards` for `features/cards`): a reader finds the component for a block without opening the map, and the home and contact `IntroBand` files no longer share a name with a service band.

### Evidence: what the current services fields feed

| Field | Read by today | After this spec |
|---|---|---|
| `title`, `slug`, `order`, `seo` | nav, route, home cards, contact choices | unchanged |
| `summary`, `subServices` | home service cards | unchanged, home only |
| `image` | `/styleguide` `Card` tile | `intro.images[0]` |
| `deliverables` | nothing | removed |
| `process`, `cta` | `/styleguide` `CtaBand` tile | moved into the `process` block |
| Markdown body | nothing (rendered by `getServices`, never shown) | removed |

### Evidence: what depends on the list of services

| Reader | How it uses the list today | When a service is added or removed |
|---|---|---|
| Nav dropdown (`getNavigation`) | every service, by `order` | follows automatically |
| Contact form "Your needs" (`contact-us.astro`, `src/lib/contact.ts`) | every service slug plus `other` | follows automatically |
| Home services row (`index.astro`) | every service, by `order`, guarded by `checkServiceCount` (exactly three) | blocked today; after this revision, only what `featured` lists |
| Projects (`resolveProjectService`) | each points at one service id | build fails naming the project (kept) |
| `/styleguide` | the first two services, both guarded | follows automatically |
| Content files | no file writes a service URL by hand | nothing to fix |
