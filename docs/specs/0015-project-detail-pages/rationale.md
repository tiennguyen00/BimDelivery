# 0015. Rationale: project detail pages

The decision record behind [index.md](index.md). `/develop` builds from `index.md` and skips this file.

## Context

The site shows six placeholder projects in two places: the `/project` photo wall (spec 0014) and the home showcase (spec 0005). Each project has a title, a one line summary, one Pexels photo, an order, and a service. Neither surface links anywhere, because there is nowhere to go. Spec 0014 kept the tiles unlinked on purpose, since the only honest destination did not exist yet. It also left two follow ups: make each tile one "Read more" link when detail pages ship, and align the two tile surfaces to one hover rule. The scope lists "Project detail pages" under Deferred, marked as needing a decision.

A prospective client judging a BIM supplier wants more than a photo and a name. They want what the job was, what was delivered, and the hard facts (where, when, how big, to which LOD, in which software). That content does not exist in the model today. Whatever shape it takes must fit how the rest of the site works. Every page is prerendered on Cloudflare Workers. Every word lives in a strict, typed content collection. Scripts are capped at four, and they only enhance finished markup. Photos are remote Pexels links, downloaded and optimised at build (spec 0006). `docs/design.md` governs every surface.

The project builds by the Skateboard approach (the smallest usable whole first) at the Alpha tier, so `/check verify` on the real site is the gate. Leaving this undecided means the tiles keep promising a click that never comes (the `/project` zoom already hints at one), and the most visited page, home, keeps leading to a dead end.

## Options considered

### Option 1: Static detail pages from the extended project entries

Each project's YAML entry gains a slug, typed facts, a titled write up, and a gallery. One dynamic route, `src/pages/project/[slug].astro`, prerenders a page per entry. The tiles on `/project` and home become stretched links.

**Pros**:

- It reuses everything: the collection, its build checks, the `/project` intro and wall, the gold band, the reveal script.
- One file per project holds all its content, and a typo fails the build by name.
- No script, no new content format, and no new collection.

**Cons**:

- YAML is clumsy for long prose: paragraphs are list items, and quotes and colons need care.
- The project files grow large (a write up plus up to nine photo links each).

### Option 2: Markdown project files with the write up as the body

Convert `projects` to `.md` files: the facts and gallery in frontmatter, the write up as the Markdown body, rendered by Astro's `render()`.

**Pros**:

- Long writing is natural, with real paragraphs, headings, and lists.
- It is the conventional Astro pattern for case studies.

**Cons**:

- It adds a second content format and changes the loader (`load('projects', 'yaml')`) that every other collection shares.
- The body is free Markdown. Emphasis would follow Markdown's rules rather than the site's `**` and `==` marks, and nothing would cap or shape the sections, so the strict, typed promise of spec 0002 weakens.
- Rendered Markdown arrives as HTML that the components cannot style piece by piece without a prose layer, which `design.md` does not have.

### Option 3: Expand projects in place on /project

No new routes. Each `/project` tile opens an expanding panel (a `<details>` or an accordion) with the write up, facts, and photos.

**Pros**:

- There are no new URLs to manage, and all the work stays on one page.

**Cons**:

- A project cannot be linked, shared, or found by search engines on its own, which is half the value of a case study.
- The page grows very heavy, with every gallery's photos on one URL.
- The home tiles would still have nowhere specific to go.

### Option 4: Link the tiles to their service pages

Skip detail pages. Each tile's "Read more" goes to the service the project belongs to.

**Pros**:

- It needs no new content and no new route, so it is the smallest change.

**Cons**:

- It promises project detail and delivers a general page. Spec 0014 already rejected it for this reason.
- It does nothing for the client who wants to judge real work.

## Rationale

Option 1 fits every force in Context. The site already validates every word through strict Zod schemas in YAML, already has a pattern for one route per entry (`[service].astro`), and already has the visual pieces (the ruled intro, the 5:4 wall, the gold band). A detail page assembled from those is mostly composition, which is what `design.md`'s build mandate asks for. Option 2's comfort for long prose is real, but it is bought by weakening the strictness and the emphasis rules the whole site relies on, for write ups that are two to four short sections. The titled sections in YAML give the structure Markdown would, and stay checkable. Options 3 and 4 fail the core job: a case study has to be a page someone can link to.

Within Option 1, the engineer chose the content shape: required write up and gallery so every tile links, typed facts with only location and year required, titled sections, and the tile photo doubling as the cover. Each choice trades a little authoring freedom for consistency and a build that catches mistakes. That is the right trade for a site whose content will be handed over to someone else to edit. The calls made at write time follow the same line. Formatting lives in one pure module so components stay data in and markup out. The wall's geometry is shared so the two walls cannot drift. The header's section marking is a general rule rather than a special case. The `projects` schema goes strict because new optional fields are exactly where a silent typo would hide.

Turning both tile surfaces into links, and giving the home tiles the zoom, settles the inconsistency spec 0014 left open. Before, one surface zoomed and the other stayed still, and both said "not a link". Now every project tile is one link that zooms, and the only photos that stay still are the detail gallery's, which are not links. Naming each link by the project title (with the visible "Read more" hidden from screen readers) keeps six links distinguishable, which a repeated "Read more" would not.

The main costs are content volume (six write ups and about thirty photos to replace before launch) and build time (more and larger remote photos to download and resize). Both are accepted: the first is the work the feature exists to hold, and the second stays within seconds to a minute on a static build, with a clear failure when a photo link breaks.
