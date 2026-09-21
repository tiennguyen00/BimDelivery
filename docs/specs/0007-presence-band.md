# 0007 · The home presence band: world map, rich copy, and the why choose list

**Status**: Superseded by [0005](0005-home-page/index.md) (ratified 2026-09-21: kept as built plus a six region cap, see AC-25 to AC-27 there)
**Date**: 2026-09-21
**Authorized by**: tiennguyen00, during /develop ("the presence section should look like my attached reference, with a subtle repeating diagonal pattern in the background")

## Owed decision

What the home page's global presence section is made of. Spec 0005 builds it from the shared `MediaText` block (a heading, one paragraph, a region list, and an optional photo on the start side) and keeps a separate differentiators section after it with a plain marked list and no icons (AC-1, AC-7, AC-8, the composition table). The reference replaces that with a different section: a centred heading, a world map illustration with labelled locations, paragraphs with bold phrases, and a second heading over an icon list. That changes the content model, the section count, the asset strategy (an illustration, not a Pexels photo), and a band surface (a pattern on a light tone).

## Assumption built on

- **Layout.** A centred `h2` with the gold rule under it (the same treatment as the services heading). Below it, two columns at `lg`: the map on the start side (7 of 12 columns) and the copy on the end side (5 of 12). Below `lg` they stack, copy first and map second.
- **Background.** The band is a `white` `Section` plus one new utility, `bg-diagonal` in `global.css`: thin 45 degree stripes in `line`, laid over the tone's own colour. It is a background image only, so the tone, every text colour, and the focus ring are unchanged. No new tone is added to `Section`.
- **Map.** A dotted world map SVG, generated once from Natural Earth land data (public domain, via the `world-atlas` package) on a 2 degree grid, latitude 84 to minus 56, in an equirectangular projection, and saved as `src/assets/images/home/world-map.svg`. It is decorative and hidden from assistive tech. No flags: a flag is a national symbol the company has not chosen, and it would not survive a change of regions.
- **Locations.** `presence.regions` becomes a list of `{ name, lon, lat }`. Each renders as a gold marker with its name, placed over the map by a pure projection from the same bounds the SVG was built with. They are a real `<ul>`, so a screen reader hears the list of places the map stands for.
- **Copy.** `presence.text` becomes `presence.paragraphs`, where a phrase wrapped in `**` renders bold. Unbalanced `**` fails the build. Paragraphs are left aligned, not justified as in the reference: justified text opens uneven gaps between words, which hurts reading (WCAG 1.4.8).
- **The why choose list.** The differentiators section is removed and its content moves into the presence band as `presence.whyChoose: { heading, items }`: an `h3` with a gold rule, then a `<ul>` whose items each carry a small decorative check glyph (a new `check` key in `Icon.astro`) in `gold-ink`. The page goes from eight sections to seven.
- **Tones.** With differentiators gone, certification moves from `white` to `tint` so the light tones still alternate after the patterned presence band.
- `presence.image` (the Pexels photo) is removed. `MediaText` stays for the overview and About.

## Code area

- `src/components/home/PresenceBand.astro` (new), `src/assets/images/home/world-map.svg` (new), `src/lib/emphasis.ts` (new)
- `src/pages/index.astro`, `src/content.config.ts`, `src/content/home/en/home.yaml`
- `src/styles/global.css` (`bg-diagonal`), `src/components/ui/Icon.astro` (`check`)
- `src/components/home/DifferentiatorList.astro` (removed), `src/components/ui/MediaText.astro` (comments), `src/dev/styleguide.astro`, `docs/design.md`, `src/assets/images/CREDITS.md`

## Requirements

- The presence band shows a centred heading with a gold rule, the map with every region marked and named, the paragraphs with their bold phrases, and the why choose heading and list, all from `home.presence`.
- The background carries a subtle diagonal stripe, and all text on it keeps the light tone contrast pairs.
- The regions are announced as a list; the map dots are not announced at all.
- No sideways scrolling and no overlapping labels at 360px, 768px, and 1280px.
- `pnpm check` and `pnpm build` run clean, and the page still ships no island.
- Supersedes, for this section only: spec 0005 AC-1 (section count), AC-7 (presence through `MediaText`), AC-8 (differentiators with no icon), and the composition table rows 6 and 7.

## Ratify

This decision was recorded by /develop, not deliberated. Run `/architect home page`
to deliberate and ratify it. Until then it stays flagged as an owed decision; it does not block marking the feature `done`.
