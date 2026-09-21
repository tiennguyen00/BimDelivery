# 0008 · The home project showcase, in place of certification and the closing call to action

**Status**: Superseded by [0005](0005-home-page/index.md) (ratified 2026-09-21: kept as built, plus an equal grid under three projects and no hover zoom, see AC-28 to AC-30 there)
**Date**: 2026-09-21
**Authorized by**: tiennguyen00, during /develop ("remove certification-heading and cta-heading in the home page, I don't need those. Add a project-showcase section under the presence section, use your recommendation")

## Owed decision

What closes the home page. Spec 0005 (with 0007) ends the page on a certification row (`tint`) and a gold closing call to action band. You asked to drop both and add a project showcase after the presence band instead. That changes the section count, the content model (`home.certification` and `home.cta` go, a showcase block arrives), and adds a section with no design yet: which projects it shows, how many, and how they are drawn.

## Assumption built on

- **Removed.** The certification section and the closing call to action band leave the home page. `home.certification` and `home.cta` leave the `home` schema and `home.yaml`, and `src/components/home/CertificationRow.astro` is deleted. The footer already carries the certification badges (`settings.footer.certification`), so nothing is lost. `CtaBand` stays in `src/components/ui/` because the service pages are meant to reuse it; the styleguide tile now feeds it the first service's `cta`.
- **Which projects.** The first three entries of `getProjects(lang)`, which is already sorted by `order`. So "featured" means "lowest `order`", and an editor reorders the showcase by editing `order`. With no projects for a language, the section is not rendered at all (no empty band, no dangling heading).
- **Copy.** A new strict `home.projectShowcase: { heading, intro, link }`. `link` is the shared `{ label, href }` shape and points at `/project`.
- **Band.** A `tint` `Section` after the white presence band, so the light tones still alternate, followed directly by the black footer.
- **Layout.** A centred `h2` with the gold rule (the services and presence treatment) and a centred `text-lead` intro. Then a grid: one column on mobile, two at `md`, and at `lg` a two by two grid where the first tile spans both rows (a large tile on the start side, two stacked on the end side). Below it, a centred secondary `Button` with the link.
- **Tiles.** Each tile is a photo filling the tile (lazy, cropped to cover) with a `bg-scrim` caption panel at its foot holding the service name (small, uppercase), the project title as an `h3`, and the summary, all white. White on the scrim is 5.74:1 even over a pure white pixel (spec 0005, AC-19), so no photo swap needs a contrast check. Tiles never shrink below their content: they have a minimum height, not a fixed one.
- **Link and focus.** Tiles do not link yet: `/project` has no per project pages, and five links to the same list page would be noise. The one link is the button. So the tiles hold no focusable element and the band keeps the ordinary gold ink ring of a light tone.
- **Motion.** On hover the photo scales up slightly; the global reduced motion rule cuts it.

## Code area

- `src/components/home/ProjectShowcase.astro` (new)
- `src/pages/index.astro`, `src/content.config.ts`, `src/content/home/en/home.yaml`
- `src/components/home/CertificationRow.astro` (removed)
- `src/dev/styleguide.astro` (the `CtaBand` tile's data). `docs/design.md` needs no change: its `CtaBand` entry already names only the service pages

## Requirements

- The home page renders six sections in order: hero, why choose us, overview, services, presence, project showcase. No `certification-heading` or `cta-heading` remains in the built HTML.
- The showcase shows the three lowest `order` projects for the page's language, each with its photo, service name, title, and summary, and one link to `/project` whose words come from `home.projectShowcase.link`.
- Every word on it comes from a content entry; its heading id is `project-showcase-heading`, and the section points at it with `aria-labelledby`. Tile titles are `h3`.
- With no projects the section is absent, and the build still passes.
- No sideways scrolling and no text clipped out of a tile at 360px, 768px, and 1280px.
- `pnpm check`, `pnpm lint`, and `pnpm build` run clean; one HTML file per route; no `astro-island` on the home page.
- Supersedes, for these sections only: spec 0005 AC-1 (section count), AC-9 (certification), AC-10 (closing band on the home page), and the composition rows for certification and the call to action; spec 0007's tone note for certification.

## Ratify

This decision was recorded by /develop, not deliberated. Run `/architect home page`
to deliberate and ratify it. Until then it stays flagged as an owed decision; it does not block marking the feature `done`.
