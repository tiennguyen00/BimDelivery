# 0014. Rationale: the Project page

The decision record behind [index.md](index.md). `/develop` does not need this file.

## Context

`/project` is a stub today: the frame, the page's `h1`, and its intro, all from the `projectPage` entry. Scope feature 9 asks for a grid of the placeholder projects that reflows to tablet and mobile, reserves each image's space so nothing jumps, and shows an empty state when there are none. The engineer added one hard requirement: the gallery layout of a reference screenshot, three equal photo tiles across with thin white seams, each carrying a white title and a "Read More" link at its bottom left.

The forces:

- **The design system** (`docs/design.md`) fixes the palette, type, band frame, and a contrast rule that white text on a photo must sit on `bg-scrim`, measured at 5.74:1 over the worst pixel. The screenshot sets text straight on the photo, and its grid gap (about 8px) and full window width both depart from the site's defaults (24px gaps, a capped band width).
- **Sibling pages** (About, Contact, the service pages) share one idiom: a white intro band with a ruled uppercase `h1` that moves on load by the CSS `entrance`, lower bands in the scroll reveal, and no page specific script. The site ships exactly four scripts, and a fifth needs a strong reason.
- **Content** already holds five projects (title, summary, Pexels photo, order, service), and the home page shows the three lowest `order` ones in its showcase (spec 0005). There are no project detail pages; they are deferred in the scope and need their own decisions.
- **Build approach** is Skateboard with the Alpha workflow: ship the thinnest usable whole page, then verify it on the real site.

Left undecided, the build would have to invent what a tile links to, how its caption stays readable, how wide the wall runs, and where the page's closing copy lives.

## Options considered

### Option 1: A full width 5:4 photo wall with scrim strip captions, no links yet (chosen)

The intro band, then a gallery band that runs the window width inside the gutters: fixed 5:4 tiles, 8px seams, one, then two, then three columns, and a caption strip of `bg-scrim` along each tile's foot. Then the existing gold `CtaBand`.

**Pros**:
- It is the screenshot's layout, with the site's contrast guarantee kept.
- It reuses every moving part (entrance, reveal, rule, `CtaBand`) and adds no script.

**Cons**:
- There are two documented exceptions to the defaults (no maximum width, 8px gap).
- The screenshot's "Read More" is absent until detail pages exist.

### Option 2: A card grid inside a normal `Section`

The scope's original wording: `Card`s with an image, title, and one line of summary, 24px gaps, the default band width.

**Pros**:
- There are no design system exceptions, only existing components.
- The summary is visible.

**Cons**:
- It is not the gallery the engineer asked for; it reads as a list, not a wall of work.

### Option 3: Reuse the home showcase layout

The home `ProjectShowcase` (a large first tile spanning two rows, inset scrim panels) extended to every project.

**Pros**:
- There is one tile component across two pages.

**Cons**:
- Its mixed sizes are not the screenshot's equal grid, and a feature tile layout does not scale past three projects.

### Option 4: The gallery plus detail pages and a filter now

Option 1 with `/project/<slug>` pages behind each "Read More", and service filter chips.

**Pros**:
- It matches the screenshot fully, links included.

**Cons**:
- It pulls in a deferred feature with its own undecided content (a write up and a gallery per project), plus a fifth script, which works against Skateboard's thinnest usable page.

## Rationale

Option 1 is the only one that delivers the layout the engineer required without breaking a rule the site depends on. The one real conflict, the screenshot's text straight on a photo, is resolved by the scrim strip, which keeps the screenshot's bottom left caption while inheriting the hero's measured pair (white on the scrim, 5.74:1 at worst), so a future photo never needs its own contrast check. The two departures from the defaults (full width, 8px seams) are what make it read as a wall rather than a list (Option 2's failure), and each is recorded in `design.md` rather than slipped in.

Tiles stay unlinked because the only honest destination does not exist yet. "Read more" to a service page (considered during the interview) would promise project detail and deliver a general page. Detail pages now (Option 4) contradict Skateboard. The home showcase already follows the rule that a tile that is not a link must not look like one, so the photo stays still. When detail pages land, each tile becomes one whole link, a small change.

The fixed 5:4 box does double duty: it is the screenshot's shape, and it reserves space so nothing shifts as photos load (the scope's done line and feature 12). Its cost, a fixed caption area, is why titles are capped at 60 characters, the longest that still wraps to three lines inside the smallest tile (about 328 by 262px at 360px wide).

Motion copies the sibling pages exactly, including spec 0012/0013's rule that the block after an intro also takes the load entrance, so a desktop visitor whose first row is already on screen sees it arrive. Only the first three tiles take it, so a long list never queues seconds of delay.
